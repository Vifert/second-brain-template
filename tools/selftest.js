'use strict';
// Regression tests for the vault tooling.  Run:  node tools/selftest.js
//
// Every test here exists because something actually broke (or was caught just
// before it did). Each test NAME carries its defect ID from tools/DEFECTS.md —
// in code, not a comment — because the ledger check below only accepts
// citations that survive comment stripping. Do not delete a test without
// deleting the failure mode it guards.

const fs = require('fs');
const path = require('path');
const { norm, matches, cell, spellingVariants, hyphenVariants, grepI, fenceProblems } = require('./lib/text');
const V = require('./lib/vault');
const R = require('./lib/rules');

const TOOLS = __dirname;
const VAULT = path.resolve(TOOLS, '..');
let pass = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; } else { fails.push(`${name}${detail ? ' — ' + detail : ''}`); }
}
function eq(name, got, want) { ok(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
const stripComments = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1');
const codeOf = f => stripComments(fs.readFileSync(path.join(TOOLS, f), 'utf8'));
const toolFiles = [
  ...fs.readdirSync(TOOLS).filter(f => f.endsWith('.js') && f !== 'selftest.js'),
  ...fs.readdirSync(path.join(TOOLS, 'lib')).filter(f => f.endsWith('.js')).map(f => 'lib/' + f),
];

// ---------------------------------------------------------------------------
// 1. THE 2026-09-09 REGRESSION. An audit probe lowercased the index but not the
// query, so terms containing a capital letter looked unroutable.
// ---------------------------------------------------------------------------
const INDEX_LINE = 'wiki/profile/owner-identity.md\tAlex — Identity\tprofile\thub\t\twho am I, about me, where do I live, my grades\ttags\tsummary';
for (const term of ['where do I live', 'what have I built', 'how do I audit', 'what am I doing now', 'my grades']) {
  const present = /where do I live|my grades/i.test(term) ? INDEX_LINE : INDEX_LINE + ' ' + term;
  ok(`D10: case-insensitive match "${term}"`, matches(present, term));
}
ok('D10: capital-I query vs lowercase index', matches('aliases: where do i live', 'where do I live'));
ok('D10: lowercase query vs capital index', matches('ALIASES: WHERE DO I LIVE', 'where do i live'));

// ---------------------------------------------------------------------------
// 2. Normalisation contract
// ---------------------------------------------------------------------------
eq('D10: norm lowercases', norm('MyCGPA'), 'mycgpa');
eq('D10: norm collapses whitespace', norm('  a   b \n c '), 'a b c');
eq('D10: norm folds en/em dash to hyphen', norm('ctrl–A'), 'ctrl-a');
eq('D10: norm folds curly apostrophe', norm('Alex’s'), "alex's");
eq('D10: norm handles null', norm(null), '');
ok('D10: empty needle never matches', !matches('anything', ''));
ok('D10: genuine miss still misses', !matches('alpha beta', 'gamma'));
ok('D10: unicode hyphen query finds ascii index', matches('ctrl-a separator', 'ctrl‑a'));

// ---------------------------------------------------------------------------
// 3. STRUCTURAL GUARD — every comparison goes through matches()/grepI(), so the
// one-sided case bug cannot come back. Comments are stripped first: prose may
// name the bug, code may not (the guard once flagged a comment).
// ---------------------------------------------------------------------------
const suspect = [];
for (const f of toolFiles) {
  const src = codeOf(f);
  const re = /\.toLowerCase\(\)[\s\S]{0,80}?\.(includes|indexOf)\(/g;
  let m;
  while ((m = re.exec(src)) !== null) suspect.push(`${f}:${src.slice(0, m.index).split('\n').length}`);
}
ok('D10, D14: no hand-rolled toLowerCase+includes in tools/', suspect.length === 0, suspect.join(', '));

// ---------------------------------------------------------------------------
// 4. FRONTMATTER — every YAML list form this vault meets.
// ---------------------------------------------------------------------------
const inline = V.parseFm('---\ntitle: T\naliases: [a, b c, d]\ntopic: x\nkind: hub\n---\nbody\n');
ok('D02: inline aliases parsed', inline && Array.isArray(inline.fm.aliases) && inline.fm.aliases.length === 3, JSON.stringify(inline && inline.fm.aliases));
const block = V.parseFm('---\ntitle: T\naliases:\n  - a\n  - b c\n  - d\ntopic: x\nkind: hub\n---\nbody\n');
ok('D02: indented block-list aliases parsed', block && Array.isArray(block.fm.aliases) && block.fm.aliases.length === 3, JSON.stringify(block && block.fm.aliases));
ok('D02: inline and block forms agree', JSON.stringify(inline && inline.fm.aliases) === JSON.stringify(block && block.fm.aliases));
const empty = V.parseFm('---\ntitle: T\naliases:\ntopic: x\nkind: hub\n---\nbody\n');
ok('D02: empty aliases key does not crash', empty && empty.fm.aliases === '');
const flat = V.parseFm('---\ntitle: T\naliases:\n- lip sync toy\n- mouth animator\ntags:\n- idea\ntopic: x\nkind: idea\n---\nbody\n');
ok('D43: unindented block list (PyYAML style) parsed', flat && JSON.stringify(flat.fm.aliases) === '["lip sync toy","mouth animator"]' && JSON.stringify(flat.fm.tags) === '["idea"]', JSON.stringify(flat && flat.fm));
const wrapped = V.parseFm('---\ntitle: T\naliases: [one, two,\n  three, four]\ntopic: x\nkind: hub\n---\nbody\n');
ok('D43: flow list wrapped over lines parsed', wrapped && JSON.stringify(wrapped.fm.aliases) === '["one","two","three","four"]', JSON.stringify(wrapped && wrapped.fm.aliases));
const quoted = V.parseFm('---\ntitle: "Quoted Title"\nstatus: \'active\'\naliases: ["a b", \'c\']\ntopic: x\nkind: hub\n---\nbody\n');
ok('D43: quoted scalars and items are unquoted', quoted && quoted.fm.title === 'Quoted Title' && quoted.fm.status === 'active' && JSON.stringify(quoted.fm.aliases) === '["a b","c"]', JSON.stringify(quoted && quoted.fm));
ok('D02: build-index.js still exports parseFm', typeof require('./build-index.js').parseFm === 'function');

// ---------------------------------------------------------------------------
// 5. TSV cell safety — a tab or newline would corrupt the index.
// ---------------------------------------------------------------------------
eq('D42: cell strips tabs', cell('a\tb'), 'a b');
eq('D42: cell strips newlines', cell('a\nb'), 'a b');

// ---------------------------------------------------------------------------
// 6. US/UK SPELLING. Prose may be British while the owner types American.
// ---------------------------------------------------------------------------
const hasVar = (text, want) => spellingVariants(text).includes(want);
ok('D21: optimisation -> optimization', hasVar('optimisation', 'optimization'));
ok('D21: optimization -> optimisation (symmetric)', hasVar('optimization', 'optimisation'));
ok('D21: centralised -> centralized', hasVar('centralised', 'centralized'));
ok('D21: visualisation -> visualization', hasVar('visualisation', 'visualization'));
ok('D21: behaviour -> behavior', hasVar('behaviour', 'behavior'));
ok('D21: analyse -> analyze (real -yse stem kept)', hasVar('analyse', 'analyze'));
ok('D34: no junk variant for "DisplaySE"', spellingVariants('displayse DisplaySE').length === 0, JSON.stringify(spellingVariants('displayse DisplaySE')));
ok('D21: no junk for "four" (-our words are explicit)', spellingVariants('four hours your').length === 0, JSON.stringify(spellingVariants('four hours your')));
ok('D21: no junk for true -ise words', spellingVariants('promise exercise otherwise expertise').length === 0, JSON.stringify(spellingVariants('promise exercise otherwise expertise')));
ok('D21: word already present is not re-added', !hasVar('optimisation optimization', 'optimization'));
ok('D47: grey -> gray (pairs checked before the length guard)', hasVar('grey', 'gray'));
ok('D47: derived -our forms (flavours, colourful)', hasVar('flavours', 'flavors') && hasVar('colourful', 'colorful'));
ok('D47: no junk from size-family words', spellingVariants('advertising resized oversized capsize').length === 0, JSON.stringify(spellingVariants('advertising resized oversized capsize')));

// ---------------------------------------------------------------------------
// 7. ONE RULEBOOK. audit.js once hardcoded 1500/1350 separately from the builder.
// ---------------------------------------------------------------------------
ok('D17: rules export the answer-surface cap', R.MAX_CARD_BYTES === 1500 && R.MAX_BULLETS === 8);
ok('D17: rules export a fixed cost baseline', R.BASELINE_BYTES > 0);
ok('D17: rules export the structural and status rules', R.KIND_SUBFOLDERS && R.OPEN_STATUSES && R.VOLATILE_MARKERS && R.NOW_ALIASES && R.IMAGE_EXT && R.MIN_TRANSCRIPTION_CHARS > 0);
const rulebookLeaks = toolFiles.filter(f => f !== 'lib/rules.js'
  && /\b(1500|1350)\b|MAX_CARD_BYTES\s*=|MAX_BULLETS\s*=|MIN_TRANSCRIPTION_CHARS\s*=|CAP\[[^\]]+\][^;\n]*:\s*\d{2,}/.test(codeOf(f)));
ok('D17: no tool re-declares a cap or falls back to a numeric one', rulebookLeaks.length === 0, rulebookLeaks.join(', '));

// ---------------------------------------------------------------------------
// 8. NO FROZEN DATES OR PATHS.
// ---------------------------------------------------------------------------
const dateLeaks = toolFiles.filter(f => /['"`]20\d\d-\d\d-\d\d['"`]/.test(codeOf(f)));
ok('D18: no hardcoded YYYY-MM-DD date literal in tool code', dateLeaks.length === 0, dateLeaks.join(', '));
const pathLeaks = toolFiles.filter(f => /['"`][A-Za-z]:[\\/]+Users[\\/]/.test(codeOf(f)));
ok('D19: no hardcoded absolute vault path in tool code', pathLeaks.length === 0, pathLeaks.join(', '));

// ---------------------------------------------------------------------------
// 9. CONTROL BYTES — in wiki/ and in every other markdown file in the repo.
// ---------------------------------------------------------------------------
eq('D03: controlCharLines finds a 0x01 byte', V.controlCharLines('ok\nbad \x01 here\n').join(','), '2');
ok('D03: controlCharLines allows tab and CR', V.controlCharLines('a\tb\r\n').length === 0);
const RULES_DIR = path.join(VAULT, '.claude', 'rules');
const ruleFiles = fs.existsSync(RULES_DIR) ? fs.readdirSync(RULES_DIR).filter(n => n.endsWith('.md')).map(n => path.join(RULES_DIR, n)) : [];
const mdEverywhere = [path.join(VAULT, 'AGENTS.md'), path.join(VAULT, 'CLAUDE.md'), path.join(VAULT, 'HANDOFF.md'), ...ruleFiles,
  ...V.walk(TOOLS), ...V.walk(path.join(VAULT, 'output')), ...V.walk(path.join(VAULT, 'wiki'))].filter(fs.existsSync);
const ctrl = mdEverywhere.filter(p => V.controlCharLines(fs.readFileSync(p, 'utf8')).length).map(p => path.relative(VAULT, p));
ok('D03: no control bytes in any markdown file in the repo', ctrl.length === 0, ctrl.join(', '));

// ---------------------------------------------------------------------------
// 10. FENCES AND CODE SPANS — content, not structure (CommonMark rules).
// ---------------------------------------------------------------------------
const fenced = ['## Real', '```mermaid', '## not a heading', 'A[[x]] --> B', '```', 'after'];
const blanked = V.blankFences(fenced);
eq('D27: fence content blanked, line count kept', blanked.length, fenced.length);
ok('D27: a heading inside a fence is gone', !blanked.includes('## not a heading') && blanked[0] === '## Real' && blanked[5] === 'after');
eq('D27: tilde fences handled too', V.blankFences(['~~~', '## x', '~~~', 'y']).join('|'), '|||y');
const nested = V.blankFences(['````markdown', '```mermaid', '## example only', '```', '````', '## real']);
ok('D41: a ```` fence is not closed by an inner ``` line', nested[2] === '' && nested[5] === '## real', JSON.stringify(nested));
const info = V.blankFences(['```', 'code', '```js', '## still inside', '```', '## after']);
ok('D41: a fence line with an info string does not close a fence', info[3] === '' && info[5] === '## after', JSON.stringify(info));
ok('D41: an unclosed fence is reported', V.blankFences(['```', 'never closed']).unclosed === true && V.blankFences(['```', 'x', '```']).unclosed === false);
const odd = V.extractLinks('Open a Mermaid block with ``` and see [[no-such-note]] for the `flowchart` keyword.');
ok('D41: an odd backtick run does not swallow a real link', odd.links.some(l => l.target === 'no-such-note'), JSON.stringify(odd.links));
eq('D41: lineCount ignores a trailing newline', V.lineCount('a\nb\n'), 2);

// ---------------------------------------------------------------------------
// 11. LINKS — embeds, anchors, inline code, escaped pipes.
// ---------------------------------------------------------------------------
const L = V.extractLinks('see [[note#Some Heading|label]] and ![[owner--fig-1.png|700]] and ![[other-note]] and [[x\\|y]]');
eq('D28: anchor split from target', L.links[0] && `${L.links[0].target}#${L.links[0].anchor}`, 'note#Some Heading');
eq('D28: an image embed is media, not a link', L.media[0] && L.media[0].target, 'owner--fig-1.png');
ok('D28: note transclusion stays a link', L.links.some(l => l.target === 'other-note' && l.embed));
ok('D31: an escaped table pipe leaves no backslash', L.links.some(l => l.target === 'x'), JSON.stringify(L.links.map(l => l.target)));
const same = V.extractLinks('see [[#Status Log]] above');
ok('D41: [[#Heading]] is a same-note link with an empty target', same.links.length === 1 && same.links[0].target === '' && same.links[0].anchor === 'Status Log');
const Lcode = V.extractLinks('write `![[owner--desc.png|700]]` or `[[note]]` — but [[real-note]] is live');
ok('D35: links and embeds inside inline code are examples, not links',
   Lcode.media.length === 0 && Lcode.links.length === 1 && Lcode.links[0].target === 'real-note', JSON.stringify(Lcode));
ok('D44: a .webp reference is media, not a note link', V.extractLinks('![[owner--y.webp]]').media.length === 1);
eq('D33: media owner parsed', V.mediaOwner('plant-disease-classifier--fig-3-model.png'), 'plant-disease-classifier');
ok('D33: media name without an owner is rejected', V.mediaOwner('Pasted image 20260911.png') === null && V.mediaOwner('fig3.png') === null);
ok('D44: a disallowed format has no valid media name', V.mediaOwner('owner--fig.webp') === null);

// ---------------------------------------------------------------------------
// 12. STATUS LOGS, DATES AND VOLATILE MARKERS.
// ---------------------------------------------------------------------------
const slLines = ['## Key Takeaways', '- **Status as of 10 September 2026: waiting.**', '## Status Log', '| As of | Status | Source |', '| --- | --- | --- |',
  '| 2026-09-09 | Not started; see [[a|b]] | Alex |', '| 2026-09-10 | Waiting | Alex |', '## Related'];
const slSecs = [{ title: 'Key Takeaways', start: 1, end: 2 }, { title: 'Status Log', start: 3, end: 7 }, { title: 'Related', start: 8, end: 8 }];
const log = V.parseStatusLog(slLines, slSecs);
eq('D16: status log rows parsed', log && log.length, 2);
eq('D16: a wikilink pipe inside a cell does not split it', log && log[0].status, 'Not started; see [[a|b]]');
ok('D16: no Status Log -> null', V.parseStatusLog(['## Key Takeaways'], [{ title: 'Key Takeaways', start: 1, end: 1 }]) === null);
const badLog = V.parseStatusLog(['## Status Log', '| 2026-19-12 | Started | Alex |', '| 2026-09-12 (12-Sep-26) | x | y |', '| 2026-02-30 | x | y |'], [{ title: 'Status Log', start: 1, end: 4 }]);
ok('D40: impossible or non-ISO dates land in .bad instead of crashing', badLog && badLog.length === 0 && badLog.bad.length === 3, JSON.stringify(badLog && badLog.bad));
ok('D40: dateForms of an impossible date does not throw', Array.isArray(V.dateForms('2026-19-12')));
ok('D16: status bullet carries "10 September 2026"', V.mentionsDate('**Status as of 10 September 2026: waiting.**', '2026-09-10'));
ok('D16: date forms include 10-Sep-26 and 10 Sep 2026', V.dateForms('2026-09-10').includes('10-Sep-26') && V.dateForms('2026-09-10').includes('10 Sep 2026'));
ok('D16: a stale bullet does not pass for a newer date', !V.mentionsDate('**Status as of 9 September 2026**', '2026-09-10'));
ok('D40: "1 September" is not found inside "11 September"', !V.mentionsDate('**Status as of 11 September 2026: shipped.**', '2026-09-01'));
eq('D16: volatile markers found', V.volatileHits(['The migration has not started yet.', 'The interview is still pending.', 'Plain fact.']).length, 2);
eq('D16: the historical waiver is respected', V.volatileHits(['On 9 Sep it had not started. <!-- historical -->']).length, 0);
eq('D40: contractions and "yet to" are markers too', V.volatileHits(["We haven't started the migration.", 'Migration: not yet begun.', 'The migration has yet to start.']).length, 3);
ok('D40: idea lifecycle statuses are allowed on a Status Log', R.OPEN_STATUSES.includes('exploring') && R.OPEN_STATUSES.includes('seed'));
eq('D48: a log entry heading carries both date forms', V.logHeading('2026-09-09'), '2026-09-09 (9-Sep-26)');
eq('D89: numbers read as prose', ['0', '7', '19', '20', '77', '88', '100', '215'].map(n => V.numberWords(Number(n))).join('|'),
  'zero|seven|nineteen|twenty|seventy-seven|eighty-eight|one hundred|two hundred and fifteen');
eq('D89: the credit block\'s count follows the ledger, across a line break too',
  V.creditCount('> the defect discipline with its seventy-seven\n> mechanically guarded defects,', 88), '> the defect discipline with its eighty-eight\n> mechanically guarded defects,');
eq('D89: a credit without its count is reported, not rewritten', V.creditCount('> Designed and built by Vifert.', 88), null);
eq('D89: the shipped credit names the count of the template\'s own ledger rows', V.creditCount(fs.readFileSync(path.join(VAULT, 'AGENTS.md'), 'utf8'), V.templateDefects(fs.readFileSync(path.join(VAULT, 'tools', 'DEFECTS.md'), 'utf8'), R.OWNER_DEFECTS_FROM)) === fs.readFileSync(path.join(VAULT, 'AGENTS.md'), 'utf8'), true);
ok('D89: every template row sits below the owner boundary', V.templateDefects(fs.readFileSync(path.join(VAULT, 'tools', 'DEFECTS.md'), 'utf8'), R.OWNER_DEFECTS_FROM) === V.templateDefects(fs.readFileSync(path.join(VAULT, 'tools', 'DEFECTS.md'), 'utf8')));
eq('D89: an owner\'s own defects are not counted in the credit', V.templateDefects('| D01 | a |\n| D89 | b |\n| D90 | mine |\n| D91 | mine |', 90), 2);
eq('D88: a non-date ### in a log is reported; dates and #### subsections are not',
  JSON.stringify(V.strayLogHeadings([{ lvl: 3, title: '2026-09-24 (24-Sep-26)' }, { lvl: 3, title: 'Figure 1 — Sunday reset' }, { lvl: 4, title: 'Figure 2 — x' }, { lvl: 2, title: 'Related' }]).map(h => h.title)),
  JSON.stringify(['Figure 1 — Sunday reset']));

// ---------------------------------------------------------------------------
// 13. THE ANSWER SURFACE — one bullet parser for builder and audit.
// ---------------------------------------------------------------------------
const ktl = ['## Key Takeaways', '', '* star bullet', '+ plus bullet', '- dash bullet', '  continued here', '', 'a stray paragraph', '> [!info] a callout'];
const tk = V.takeaways(ktl, { start: 1, end: ktl.length });
eq('D42: *, + and - bullets all count', tk.bullets.length, 3);
eq('D42: an indented line continues its bullet', tk.bullets[2], 'dash bullet continued here');
ok('D42: text outside a bullet is reported as stray; callouts are not', tk.stray.length === 1 && tk.stray[0] === 'a stray paragraph', JSON.stringify(tk.stray));
eq('D42: a literal \\n inside a takeaway is still one bullet', V.takeaways(['## Key Takeaways', '- CSV had `\\r\\n` endings'], { start: 1, end: 2 }).bullets.length, 1);

// ---------------------------------------------------------------------------
// 14. MENTIONS — links count, names are Unicode-aware, longest name wins.
// ---------------------------------------------------------------------------
const names = V.mentionNames('Dana Cole', ['Dana', 'the pilot POC', "Sam's POC", 'Acme supervisor', 'M. Rao']);
ok('D45: proper names kept', names.includes('Dana Cole') && names.includes('Dana') && names.includes('M. Rao'), JSON.stringify(names));
ok('D45: role phrases and acronyms dropped', !names.includes('the pilot POC') && !names.includes("Sam's POC") && !names.includes('Acme supervisor'));
ok('D45: "Sam" does not match "same" or "Samsung"', !V.nameRegex('Sam').test('the same Samsung') && V.nameRegex('Sam').test('lunch with Sam.'));
ok('D45: accented and internal-capital names are names', V.mentionNames('Zoë Fernández', []).length === 1 && V.mentionNames('Mary-Jane McDonald', ["O'Brien"]).length === 2);
const slugs = new Set(['sam-lee', 'dana-cole', 'maya-rao', 'ravi']);
const viaLink = V.findMentions('Paired with [[sam-lee]], then synced with [[dana-cole|my team lead]].', [], slugs).map(m => m.slug);
ok('D45: an explicit link is a mention whatever its label', viaLink.includes('sam-lee') && viaLink.includes('dana-cole'), JSON.stringify(viaLink));
const longest = V.findMentions('Emailed Maya Rao about the paper.', [{ name: 'Rao', slug: 'ravi' }, { name: 'Maya Rao', slug: 'maya-rao' }], slugs).map(m => m.slug);
ok('D45: the longest name wins; a shorter alias cannot steal it', longest.length === 1 && longest[0] === 'maya-rao', JSON.stringify(longest));

// ---------------------------------------------------------------------------
// 15. TEXT IS CANONICAL — every image reference needs its own transcription.
// ---------------------------------------------------------------------------
const figBare = ['### Figure 1 — Arch', '![[a--b.png|700]]', '*Figure 1*'];
const figDone = ['### Figure 1 — Arch', '![[a--b.png|700]]', '```mermaid', 'flowchart LR', '  A[Input image 224x224] --> B[Conv2D 32 filters 3x3 ReLU] --> C[MaxPool 2x2]', '  C --> D[Conv2D 64] --> E[Dense 128] --> F[Softmax 5 classes]', '```', 'Six stages from image to class probabilities; the transcription carries every label.'];
eq('D33: a bare image is flagged', V.untranscribed(figBare, [{ start: 1, end: 3 }], R.MIN_TRANSCRIPTION_CHARS).length, 1);
eq('D33: a Mermaid-transcribed image passes', V.untranscribed(figDone, [{ start: 1, end: figDone.length }], R.MIN_TRANSCRIPTION_CHARS).length, 0);
eq('D44: an image in a callout is checked too', V.untranscribed(['### F', '> ![[a--b.png|600]]', 'short'], [{ start: 1, end: 3 }], R.MIN_TRANSCRIPTION_CHARS).length, 1);
eq('D44: an image mid-line is checked too', V.untranscribed(['### F', 'see ![[a--b.png]] here'], [{ start: 1, end: 2 }], R.MIN_TRANSCRIPTION_CHARS).length, 1);
const twoFigs = ['### F', '![[a--b.png]]', '![[a--c.png]]', 'x'.repeat(250)];
eq('D44: two images in one section need two transcriptions', V.untranscribed(twoFigs, [{ start: 1, end: 4 }], R.MIN_TRANSCRIPTION_CHARS).length, 2);
eq('D44: an embed shown inside a code fence is an example, not an image', V.untranscribed(['### F', '```', '![[a--b.png]]', '```'], [{ start: 1, end: 4 }], R.MIN_TRANSCRIPTION_CHARS).length, 0);

// ---------------------------------------------------------------------------
// 16. PRONOUNS — only when stated; own nodes count; the owner's are their own.
// ---------------------------------------------------------------------------
const sam = { slug: 'sam-lee', pronouns: '', names: [V.nameRegex('Sam Lee'), V.nameRegex('Sam')] };
// Fixture owners, passed explicitly so these tests hold whatever tools/lib/rules.js OWNER says.
const ownerHe = V.ownerOf({ name: 'Alex', pronouns: 'he/him' });
const ownerShe = V.ownerOf({ name: 'Priya', pronouns: 'she/her' });
const ownerThey = V.ownerOf({ name: 'Jo', pronouns: 'they/them' });
ok('D36: "without him" on a person\'s own node is flagged', V.pronounHit('The index lists only seven authors, without him.', sam, true, ownerHe));
ok('D36: the same line elsewhere, without their name, is not', !V.pronounHit('The index lists only seven authors, without him.', sam, false, ownerHe));
ok('D36: a line naming them with a feminine pronoun is flagged', V.pronounHit('Sam Lee shared her notebook.', sam, false, ownerHe));
ok('D36: masculine pronouns on a line naming a he/him owner are the owner\'s', !V.pronounHit('Sam Lee helped Alex, and he thanked him.', sam, false, ownerHe));
ok('D36: feminine pronouns on a line naming a she/her owner are the owner\'s', !V.pronounHit('Sam Lee helped Priya, and she thanked her.', sam, false, ownerShe));
ok('D36: an owner\'s pronouns explain only their own forms', V.pronounHit('Sam Lee helped Priya, and he thanked her.', sam, false, ownerShe) && V.pronounHit('Sam Lee helped Jo and he thanked them.', sam, false, ownerThey));
ok('D36: first person no longer exempts a line', V.pronounHit('Sam Lee walked me through it and he fixed it.', sam, false, ownerHe));
ok('D25: a stated pronoun is not flagged', !V.pronounHit('Dana Cole said he would review it.', { slug: 'dana-cole', pronouns: 'he/him', names: [V.nameRegex('Dana Cole')] }, false, ownerHe));
const maya = { slug: 'maya-rao', pronouns: 'she/her', names: [V.nameRegex('Maya')] };
const ravi = { slug: 'ravi-menon', pronouns: 'he/him', names: [V.nameRegex('Ravi')] };
eq('D53: a pronoun held by someone the line names is explained', V.pronounSuspects('Maya told Ravi she would send it.', [maya, ravi], null, ownerHe).length, 0);
eq('D53: a pronoun nobody on the line holds is still flagged', V.pronounSuspects('Ravi said she would send it.', [maya, ravi], null, ownerHe).join(), 'ravi-menon');
eq('D53: a pronoun set written as notation is not a pronoun', V.pronounSuspects('Ravi is he/him and Maya is she/her.', [maya, ravi], null, ownerHe).length, 0);
eq('D53: masculine pronouns beside a he/him owner are the owner\'s', V.pronounSuspects('Maya helped Alex and he thanked her.', [maya], null, ownerHe).length, 0);
eq('D53: the same line beside a she/her owner is still flagged', V.pronounSuspects('Maya helped Priya and he thanked her.', [maya], null, ownerShe).join(), 'maya-rao');
eq('D53: on a person\'s own node they count as named on every line', V.pronounSuspects('The index lists only seven authors, without him.', [sam], 'sam-lee', ownerHe).join(), 'sam-lee');

// ---------------------------------------------------------------------------
// 17. ROUTING PROBES SIMULATE THE REAL QUERY — a literal, line-based grep -i.
// ---------------------------------------------------------------------------
ok('D46: grepI is case-insensitive', grepI('X CLOUD MIGRATION y', 'cloud migration'));
ok('D46: grepI does not fold a curly apostrophe', !grepI('what’s pending', "what's pending"));
ok('D46: grepI does not match across lines', !grepI('Cloud\nMigration', 'Cloud Migration'));
ok('D46: grepI is literal, not a regex', grepI('a.b', 'a.b') && !grepI('axb', 'a.b'));
const probes = JSON.parse(fs.readFileSync(path.join(TOOLS, 'probes.json'), 'utf8'));
const forbidden = (probes._forbidden || []);
ok('D37: forbidden-claim patterns compile', forbidden.length > 0 && forbidden.every(f => { try { new RegExp(f.pattern, 'i'); return !!f.reason; } catch { return false; } }));
const retired = forbidden.map(f => new RegExp(f.pattern, 'i')).find(re => re.test('- **L4 — read the source.** When the card falls short, open the raw file.'));
ok('D37: the retired "read the source" rung is caught, its correction is not', !!retired
  && !retired.test('There is no "L4 — read the source" fallback any more.'));
// A fence must prove itself both ways, or it is hollow or fences out the truth.
ok('D50: a fence with no examples is rejected', fenceProblems({ pattern: 'x', reason: 'r' }).length === 2);
ok('D50: an over-broad fence is caught blocking the truth', fenceProblems({ pattern: '\\bsam[^.]{0,40}\\bis his (?:Acme )?manager\\b', reason: 'r',
  catches: ['Sam is his Acme manager.'], passes: ['Sam is his manager on the project.'] }).some(p => p.startsWith('blocks a true claim')));
ok('D50: a fence that misses its own wrong claim is caught', fenceProblems({ pattern: 'manager at Acme', reason: 'r',
  catches: ['Sam is his Acme manager.'], passes: ['Sam is his manager on the project.'] }).some(p => p.startsWith('misses its own')));
ok('D50: the fence applies per line, case-insensitively, as the audit does', fenceProblems({ pattern: '^(?!.*the index).*seven authors', reason: 'r',
  catches: ['The paper has SEVEN AUTHORS.'], passes: ['THE INDEX lists seven authors.'] }).length === 0);
const badFences = forbidden.map(f => [f.pattern.slice(0, 30), fenceProblems(f)]).filter(([, p]) => p.length);
ok('D50: every real fence in probes.json passes its own examples', badFences.length === 0, badFences.map(([k, p]) => `${k}…: ${p.join(', ')}`).join(' / '));
// [sic] is for certain slips; a note citing another place in the source that
// gives a different value is a contradiction and must name who settled it.
eq('D51: a [sic] that picks a side in a contradiction is flagged', V.sicTakesSide('to 4.21 [sic — Table II and § V give 4.12] with the larger model').length, 1);
eq('D51: the same note naming who settled it passes', V.sicTakesSide('| 4.12 [sic — 4.21 per Alex, 12 September 2026, as § IV-C gives] |').length, 0);
eq('D51: a plain slip still takes [sic]', V.sicTakesSide('Analysys [sic — Analysis] and 93475% [sic — 93.47%]').length, 0);
eq('D51: a slip that mentions a figure but no rival value passes', V.sicTakesSide('[sic — the figure labelled Fig. 1 is the PCA variance chart; no methodology diagram is printed]').length, 0);
// The repo-root image sweep prunes folders by name.
const toolJs = V.walk(TOOLS, ['.js'], d => d === 'lib').map(p => path.basename(p));
ok('D52: walk prunes skipped directories', toolJs.includes('build-index.js') && !toolJs.includes('text.js'), toolJs.join(','));
// Identifiers route without anyone typing them as aliases.
const idsA = V.codeIdentifiers('Ran build_order_history.sh against staging_orders_tmp and ORDERS_NIGHTLY_CLUSTER.');
ok('D54: snake_case, SCREAMING_CASE and file names are identifiers anywhere', ['build_order_history', 'build_order_history.sh', 'staging_orders_tmp', 'ORDERS_NIGHTLY_CLUSTER'].every(x => idsA.includes(x)), idsA.join(','));
const idsB = V.codeIdentifiers('The shared `readFromWarehouse(...)` accessor reads BigQuery.');
ok('D54: camelCase counts inside code spans only — prose product names are left to aliases', idsB.includes('readFromWarehouse') && !idsB.includes('BigQuery'), idsB.join(','));
const idsC = V.codeIdentifiers('Trigger crm-e1-hbase_bt_ingest in CRM_customer-id-v2, then check work-2026-09 and pre-prod.');
ok('D62: an identifier joined by hyphens and underscores is taken whole', idsC.includes('crm-e1-hbase_bt_ingest') && idsC.includes('CRM_customer-id-v2'), idsC.join(','));
ok('D62: its fragments are not indexed on their own, and plain hyphenated words are not identifiers', !idsC.includes('hbase_bt_ingest') && !idsC.includes('CRM_customer') && !idsC.includes('work-2026-09') && !idsC.includes('pre-prod'), idsC.join(','));
eq('D54: wikilinks and URLs are not identifiers', V.codeIdentifiers('See [[crm_job_reference|jobs]] at https://example.com/some_path').length, 0);
ok('D54: the identifier cap lives in rules.js', Number.isInteger(R.MAX_IDENTIFIER_NODES) && R.MAX_IDENTIFIER_NODES > 0);
ok('D55: relative log aliases are one list, including the tag "current"', ['this month', 'today', 'latest', 'current'].every(x => R.RELATIVE_LOG_ALIASES.includes(x)));
ok('D56: the summary cap lives in rules.js', Number.isInteger(R.MAX_SUMMARY_CHARS) && R.MAX_SUMMARY_CHARS >= 160);
// A takeaway names its subject.
eq('D57: a takeaway opening with a bare pronoun is caught', V.openingPronoun('- **It is not the same thing as a production dry-run.**'), 'It');
eq('D57: so is one opening with a possessive', V.openingPronoun('- His **first project is the Acme engagement**'), 'His');
eq('D57: a named subject passes', V.openingPronoun('- **The parallel run is not the same thing as a production dry-run.**'), null);
eq('D57: a word that merely starts like a pronoun passes', V.openingPronoun('- **Italy** and **Theseus** are names'), null);
eq('D57: a pronoun mid-bullet is fine', V.openingPronoun('- Alex chose Python, as he prefers it'), null);
// grep is literal: a hyphen must not hide a node.
eq('D60: a hyphenated word gets its spaced and joined forms', hyphenVariants('Neuro-Cognitive').join('|'), 'neuro cognitive|neurocognitive');
eq('D60: dates, versions and ctrl-A are left alone', hyphenVariants('10-Sep-26 4.0.0-SNAPSHOT ctrl-A').length, 0);
eq('D60: a form already present is not added again', hyphenVariants('pre-prod, preprod').join('|'), 'pre prod');
// Tags are faceted, registered, and never restate what a column already holds.
eq('D65: faceted tags from registered facets pass', V.tagProblems(['tech/scala', 'rel/co-author', 'domain/finance', 'activity/personal-project'], 'projects', 'hub').length, 0);
ok('D65: a flat tag and an unregistered facet are caught', V.tagProblems(['scala'], 'projects', 'hub').length === 1 && /unregistered facet/.test(V.tagProblems(['tool/scala'], 'projects', 'hub')[0]));
ok('D65: month and status values are caught', ['subject/2026-09', 'subject/active', 'subject/this-month'].every(t => V.tagProblems([t], 'journal', 'log').length === 1));
ok('D65: a tag restating topic, kind or subfolder is caught', ['subject/projects', 'form/log', 'form/worklog', 'form/decision'].every(t => V.tagProblems([t], 'projects', 'log').length >= 1));
// Fixture: an engagement topic that implies its organisation, registered for these two tests only.
R.TOPIC_IMPLIED_TAGS['acme-engagement'] = ['org/acme'];
eq('D65: a tag the topic folder already implies is caught', V.tagProblems(['org/acme'], 'acme-engagement', 'hub').length, 1);
eq('D65: the same tag outside that folder passes', V.tagProblems(['org/acme'], 'people', 'person').length, 0);
delete R.TOPIC_IMPLIED_TAGS['acme-engagement'];
ok('D65: a drifted synonym names its canonical form', /field\/reinforcement-learning/.test(V.tagProblems(['field/rl'], 'learning', 'hub').join()));
eq('D65: plural and hyphen near-duplicates in one facet are caught', V.nearDuplicateTags(['activity/publication', 'activity/publications', 'tech/big-query', 'tech/bigquery', 'form/timeline']).length, 2);
eq('D65: the same value in two facets is not a duplicate', V.nearDuplicateTags(['org/acme', 'tech/acme']).length, 0);
eq('D65: inline #tags are found; headings, note anchors and URL fragments are not', V.inlineTags(['## Heading', 'See [[note#Heading]] and https://x.io/#top', 'Filed under #tech/scala and (#flat)', '`#not-a-tag`']).join('|'), 'tech/scala|flat');
// Logs and verbatim nodes keep every committed line.
const headLog = '---\ntags: [a]\nupdated: 2026-09-12\n---\n\n### 2026-09-10 (10-Sep-26)\n- did X\n| a | b |\n| --- | --- |\n| 1 | 2 |\n';
eq('D67: appending, inserting an entry, re-padding a table and editing frontmatter are not rewrites', V.rewrittenLines(headLog, '---\ntags: []\nupdated: 2026-09-16\n---\n\n### 2026-09-09 (9-Sep-26)\n- earlier\n\n### 2026-09-10 (10-Sep-26)\n- did X\n|  a  |  b  |\n|:---|---:|\n| 1 | 2 |\n\n### 2026-09-11 (11-Sep-26)\n- did Y\n').length, 0);
eq('D67: a committed line changed in place is a rewrite, reported by its HEAD line', V.rewrittenLines(headLog, headLog.replace('- did X', '- did Z')).map(g => g.line).join(), '7');
eq('D67: a committed line deleted is a rewrite', V.rewrittenLines(headLog, headLog.replace('| 1 | 2 |\n', '')).length, 1);
const headLog2 = '---\nkind: log\n---\n\n## Key Takeaways\n\n- Only 2 entries so far.\n\n## Entries\n\n### 2026-08-04 (4-Aug-26)\n\nHandover done.\n\n## Related\n\n- [[x]]\n';
eq('D70: a log\'s takeaways and Related may change as entries arrive', V.rewrittenLines(headLog2, headLog2.replace('- Only 2 entries so far.', '- 18 entries.').replace('- [[x]]', '- [[y]]'), 'log').length, 0);
eq('D70: a log\'s dated entry may not', V.rewrittenLines(headLog2, headLog2.replace('Handover done.', 'Handover done well.'), 'log').length, 1);
const headFull = '---\nverbatim: true\n---\n\n## Key Takeaways\n\n- A summary.\n\n## Abstract\n\nThe source says this.\n\n### Figure 1 — Pipeline\n\nA caption.\n\n## Related\n\n- [[hub]]\n';
eq('D70: a verbatim node\'s takeaways and Related may change', V.rewrittenLines(headFull, headFull.replace('- A summary.', '- A better summary.').replace('[[hub]]', '[[hub2]]'), 'verbatim').length, 0);
eq('D70: its source text, figure sections included, may not', V.rewrittenLines(headFull, headFull.replace('A caption.', 'A new caption.').replace('The source says this.', 'The source said this.'), 'verbatim').length, 2);
// Notes live where an index or a compile reads them.
ok('D68: wiki nodes, raw captures, reports, tools docs, templates and root docs have homes', ['wiki/people/sam-lee.md', 'raw/daily/2026-09-16.md', 'output/audit-2026-09-09.md', 'tools/README.md', 'templates/idea.md', 'CLAUDE.md', 'HANDOFF.md', 'Excalidraw/Drawing 2026-09-16.excalidraw.md'].every(p => V.strayNote(p) === null));
ok('D68: a root daily note, an Importer folder and a plain note among drawings are stray', ['2026-09-16.md', 'Notion/Page.md', 'Excalidraw/notes.md'].every(p => V.strayNote(p)));
eq('D68: a Code Styler reference block is found; an ordinary fenced block with a title is not', V.referenceBlocks(['```python title:foo', 'x = 1', '```', '~~~reference', 'file: a.py', '~~~']).join(), '4');
ok('D68: a drawing embedded into a wiki note, landing in assets/, is stray', /Excalidraw drawing outside/.test(V.strayNote('wiki/research/assets/Drawing 2026-09-16.excalidraw.md') || ''));
// The Obsidian settings the rules depend on are checked, not trusted.
const driftList = [{ file: 'a.json', path: 'x.y', want: true }, { file: 'b.json', path: 'folder', want: 'raw/daily' }];
eq('D69: a setting that holds is not drift', V.settingDrift(driftList, f => (f === 'a.json' ? { x: { y: true } } : { folder: 'raw/daily' })).length, 0);
eq('D69: a reverted value and a missing file are both drift', V.settingDrift(driftList, f => (f === 'a.json' ? { x: { y: false } } : null)).map(d => d.file).join(), 'a.json,b.json');
const listSetting = [{ file: 't.json', path: 'ignore', contains: { folder: 'wiki' } }];
eq('D69: a list setting holds when it contains the fragment, among others', V.settingDrift(listSetting, () => ({ ignore: [{ folder: 'raw' }, { folder: 'wiki' }] })).length, 0);
eq('D69: and drifts when the fragment is gone', V.settingDrift(listSetting, () => ({ ignore: [{ folder: 'raw' }] })).length, 1);
ok('D69: the settings list lives in rules.js and covers attachments, daily notes and the new-note folder', ['attachmentFolderPath', 'newFileFolderPath'].every(p => R.OBSIDIAN_SETTINGS.some(s => s.path === p)) && R.OBSIDIAN_SETTINGS.some(s => s.file.endsWith('daily-notes.json')));
// A committed plugin setting never holds a secret.
eq('D66: empty key fields and token-count settings are not secrets', V.secretSettings({ apiKey: '', taskboneAPIkey: '', aiDefaultMaxOutgoingTokens: 0, tokenizeUrls: false, modifierKeyConfig: { key: 'Enter' } }).length, 0);
eq('D66: a filled key field is found by path, nested or not', V.secretSettings({ ai: [{ apiKey: 'abc123' }], openAIToken: 'x' }).join('|'), 'ai[0].apiKey|openAIToken');
eq('D66: a token-shaped value is found under any key', V.secretSettings({ note: 'sk-' + 'a'.repeat(24) }).join('|'), 'note');
ok('D65: the facets, implied tags and synonyms live in rules.js', Object.keys(R.TAG_FACETS).length >= 5 && R.TOPIC_IMPLIED_TAGS && R.TAG_SYNONYMS);

// ---------------------------------------------------------------------------
// 17b. EXCALIDRAW DRAWINGS. The plugin's file format read and written without
// losing its other sections; a drawing embedded in a node is a figure whose
// transcription records a content hash; the layout checks the skill relies on.
// ---------------------------------------------------------------------------
const XD = require('./lib/excalidraw');
ok('D71: the Obsidian settings list keeps drawings uncompressed, in Excalidraw/, and out of Linter\'s reach',
  R.OBSIDIAN_SETTINGS.some(s => s.path === 'compress' && s.want === false) && R.OBSIDIAN_SETTINGS.some(s => s.path === 'folder' && s.want === R.DRAWINGS_FOLDER)
  && R.OBSIDIAN_SETTINGS.some(s => s.path === 'foldersToIgnore' && s.contains === R.DRAWINGS_FOLDER));
eq('D71: a string `contains` setting drifts when the list lacks it', V.settingDrift([{ file: 'f', path: 'foldersToIgnore', contains: 'Excalidraw' }], () => ({ foldersToIgnore: ['templates'] })).length, 1);
eq('D71: a string `contains` setting holds when the list has it', V.settingDrift([{ file: 'f', path: 'foldersToIgnore', contains: 'Excalidraw' }], () => ({ foldersToIgnore: ['templates', 'Excalidraw'] })).length, 0);

const el = (o) => ({ angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent', fillStyle: 'solid', strokeStyle: 'solid', strokeWidth: 2, version: 1, versionNonce: 1, updated: 1, isDeleted: false, groupIds: [], boundElements: null, ...o });
const sampleScene = () => ({ type: 'excalidraw', version: 2, source: 't', appState: { viewBackgroundColor: '#ffffff' }, files: {}, elements: [
  el({ id: 'a', type: 'rectangle', x: 0, y: 0, width: 160, height: 80, boundElements: [{ id: 'ta', type: 'text' }, { id: 'ab', type: 'arrow' }] }),
  el({ id: 'ta', type: 'text', x: 40, y: 27, width: 80, height: 25, text: 'Inbox', originalText: 'Inbox', fontSize: 20, containerId: 'a' }),
  el({ id: 'b', type: 'ellipse', x: 400, y: 0, width: 160, height: 80, boundElements: [{ id: 'tb', type: 'text' }, { id: 'ab', type: 'arrow' }] }),
  el({ id: 'tb', type: 'text', x: 440, y: 27, width: 80, height: 25, text: 'Wiki', originalText: 'Wiki', fontSize: 20, containerId: 'b' }),
  el({ id: 'ab', type: 'arrow', x: 166, y: 40, width: 228, height: 0, points: [[0, 0], [228, 0]], startBinding: { elementId: 'a', focus: 0, gap: 6 }, endBinding: { elementId: 'b', focus: 0, gap: 6 }, endArrowhead: 'arrow', boundElements: [{ id: 'tl', type: 'text' }] }),
  el({ id: 'tl', type: 'text', x: 250, y: 28, width: 60, height: 25, text: 'compile', originalText: 'compile', fontSize: 16, containerId: 'ab' }),
] });

const fresh = XD.serializeDrawing(sampleScene(), null);
const back = XD.parseDrawing(fresh);
ok('D72: a new drawing is written in the plugin\'s layout — frontmatter, Text Elements with block ids, a json Drawing block',
  fresh.startsWith('---\n\nexcalidraw-plugin: parsed\ntags: [excalidraw]\n') && /## Text Elements\nInbox \^[A-Za-z0-9]{8}\n\n/.test(fresh) && /%%\n## Drawing\n```json\n/.test(fresh) && fresh.endsWith('```\n%%'));
ok('D73: text element ids are exactly 8 letters and digits, the only ids the plugin\'s parser matches', XD.BLOCK_ID.test('Ab3dEf9h') && !XD.BLOCK_ID.test('title') && !XD.BLOCK_ID.test('my-label') && !XD.BLOCK_ID.test('Ab3dEf9hX'));
const shortIds = '# Excalidraw Data\n\n## Text Elements\nHow it works ^title\n\nInbox ^Ab3dEf9h\n\n%%\n## Drawing\n```json\n' + JSON.stringify({ elements: [el({ id: 'title', type: 'text', text: 'How it works', originalText: 'How it works', rawText: 'How it works' }), el({ id: 'Ab3dEf9h', type: 'text', text: 'Inbox', originalText: 'Inbox', rawText: 'Inbox' })] }) + '\n```\n%%';
eq('D73: read as the plugin reads it, a short id\'s text is glued onto the next label', XD.pluginTextEntries(shortIds.split('## Text Elements\n')[1].split('%%')[0]).map(t => t.id + '=' + JSON.stringify(t.raw)).join(' '), 'Ab3dEf9h="How it works ^title\\n\\nInbox"');
ok('D73: pluginReadProblems names both the unmatched id and the label it corrupts', XD.pluginReadProblems(shortIds).length === 2);
eq('D73: every drawing the tool writes reads back exactly under the plugin\'s parser', XD.pluginReadProblems(fresh).join('; '), '');
eq('D73: a renamed id is derived from the old one, so a later patch can still name it', XD.derivedBlockId('title'), XD.blockSafeIds([el({ id: 'title', type: 'text', text: 'x', originalText: 'x' })]).title);
ok('D73: derived ids are 8 letters and digits and differ per source id', XD.BLOCK_ID.test(XD.derivedBlockId('title')) && XD.derivedBlockId('title') !== XD.derivedBlockId('zonet'));
eq('D73: re-saving a drawing written with short ids repairs it rather than copying the merged text', XD.pluginReadProblems(XD.serializeDrawing(XD.parseDrawing(shortIds).scene, XD.parseDrawing(shortIds))).join('; '), '');
ok('D72: a written drawing parses back to the same elements', !back.error && JSON.stringify(back.scene.elements) === JSON.stringify(XD.parseDrawing(XD.serializeDrawing(back.scene, back)).scene.elements));
const pluginFile = ['---', '', 'excalidraw-plugin: parsed', 'tags: [excalidraw]', 'custom-key: kept', '', '---', '==⚠  Switch ⚠==', '', '', '# Excalidraw Data', '', '## Text Elements', 'Inbox ^lbl', '', '## Element Links', 'box: [[vault-operations]]', '', '## Embedded Files', 'f1a2: [[query-ladder--screenshot.png]]', '', '%%', '## Drawing', '```compressed-json',
  'N4IgLgngDgpiBcIYA8DGBDANgSwCYCd0B3EAGhADcZ8BnbAewDsEAmcm+gV31TkQDNsyMNzjkYmGAFsYjMDQQBtUHgQgARvWRlw0PiHwxUYdIwDmkndvgAGchAR2QRPGAAWCAIwsnbmNjM3MAQANicaMHx6AGsYAGF6THp8NQBiTxgMjJ11dFRosyjORlwEpJTEVPQAVlwADn5+HUFMTABlSEtEDhxcHQio2I6ILpAe1XZImJgAdVcPeDYQUws+J01i3ABRSRk5BXhlEFVETHVMHUhYNTAUYIBfAF170hU+0/PLvRu7qwQAZicDngnjq5BcuHcoV8/kCwUW1XIt2EagAkoxNNpyMkAthGFgACq/RDozHNJhgNrYABefB85FQFPQeOoqPeGi0/SmsTKyTSWUycCe5HQUCgHXQtwQoAo2BgRAAQnkCkUSryKiBUo1tU0XiAWjADsB7vcgA',
  '```', '%%', ''].join('\r\n');
const pp = XD.parseDrawing(pluginFile);
ok('D72: a plugin-compressed CRLF drawing decompresses to its scene', !pp.error && pp.compressed && pp.crlf && pp.scene.elements.length === 2 && pp.scene.elements[1].text === 'Inbox', pp.error);
const resaved = XD.serializeDrawing(pp.scene, pp);
ok('D72: saving a drawing keeps its frontmatter, Element Links, Embedded Files and line endings, and writes plain json',
  /custom-key: kept\r\n/.test(resaved) && /## Element Links\r\nbox: \[\[vault-operations\]\]/.test(resaved) && /## Embedded Files\r\nf1a2: \[\[query-ladder--screenshot\.png\]\]/.test(resaved)
  && /```json\r\n/.test(resaved) && !/compressed-json/.test(resaved) && !/[^\r]\n/.test(resaved));
eq('D72: a decompressed scene hashes the same once saved as plain json', XD.sceneHash(XD.parseDrawing(resaved).scene), XD.sceneHash(pp.scene));
ok('D72: a missing or corrupt Drawing block is reported, not thrown', !!XD.parseDrawing('# just a note').error && !!XD.parseDrawing('%%\n## Drawing\n```json\n{oops\n```\n%%').error);

const idScene = [el({ id: 'shape', type: 'rectangle', x: 0, y: 0, width: 10, height: 10, boundElements: [{ id: 'my_long_label', type: 'text' }] }), el({ id: 'my_long_label', type: 'text', x: 0, y: 0, width: 5, height: 5, containerId: 'shape', text: 'x' })];
const renamed = XD.blockSafeIds(idScene);
ok('D72: a text id that cannot be a block reference is renamed to 8 characters and rewired', renamed.my_long_label && XD.BLOCK_ID.test(renamed.my_long_label) && idScene[0].boundElements[0].id === renamed.my_long_label && idScene[1].id === renamed.my_long_label);
eq('D72: renaming is deterministic, so a re-save does not churn block ids', XD.blockSafeIds([el({ id: 'my_long_label', type: 'text', text: 'x' })]).my_long_label, renamed.my_long_label);

const h0 = XD.sceneHash(sampleScene());
const noise = sampleScene();
for (const e of noise.elements) { e.version = 9; e.versionNonce = 42; e.updated = 99; e.index = 'b1'; }
noise.elements[1].x = 38; noise.elements[4].points = [[0, 0], [230, 2]];
eq('D72: the hash ignores what the plugin recomputes — versions, nonces, indices, bound-text and bound-arrow geometry', XD.sceneHash(noise), h0);
const reworded = sampleScene(); reworded.elements[3].originalText = 'Wiki node';
ok('D72: the hash changes when a label is reworded', XD.sceneHash(reworded) !== h0);
const moved = sampleScene(); moved.elements[2].x = 480;
ok('D72: the hash changes when a shape moves', XD.sceneHash(moved) !== h0);
const recoloured = sampleScene(); recoloured.elements[0].backgroundColor = '#ffc9c9';
ok('D72: the hash changes when a shape is recoloured', XD.sceneHash(recoloured) !== h0);

eq('D72: a clean two-box scene lints clean', XD.lint(sampleScene()).map(p => p.msg).join('; '), '');
const crowded = sampleScene();
crowded.elements[2].x = 100; crowded.elements[3].x = 140;
ok('D72: lint finds overlapping shapes', XD.lint(crowded).some(p => /overlaps/.test(p.msg)));
const cramped = sampleScene(); cramped.elements[1].width = 200;
ok('D72: lint finds a label wider than its shape', XD.lint(cramped).some(p => p.level === 'error' && /overflows/.test(p.msg)));
const blocked = sampleScene();
blocked.elements.push(el({ id: 'wall', type: 'rectangle', x: 250, y: -20, width: 60, height: 120 }));
ok('D72: lint finds a connector passing through an unrelated shape', XD.lint(blocked).some(p => p.id === 'ab' && /passes through wall/.test(p.msg)));
const hidden = sampleScene(); hidden.elements[5].width = 220;
ok('D72: lint finds a connector label long enough to hide its line', XD.lint(hidden).some(p => p.level === 'error' && /covers most/.test(p.msg)));
const zoned = sampleScene();
zoned.elements.unshift(el({ id: 'zone', type: 'rectangle', x: -50, y: -50, width: 700, height: 200, boundElements: [{ id: 'zl', type: 'text' }] }), el({ id: 'zl', type: 'text', x: 250, y: 30, width: 60, height: 25, text: 'Pipeline', originalText: 'Pipeline', containerId: 'zone' }));
ok('D72: lint finds a centred label on a zone that holds shapes', XD.lint(zoned).some(p => p.id === 'zone' && /zone/.test(p.msg)));
const dangling = sampleScene(); dangling.elements[4].endBinding.elementId = 'gone';
ok('D72: lint finds a connector bound to a missing element', XD.lint(dangling).some(p => p.level === 'error' && /missing gone/.test(p.msg)));

// A connector's label sits at its path midpoint, so a route can be individually
// valid and still put its label on top of a line that crosses there (D75).
const crossedLabel = sampleScene();
crossedLabel.elements.push(el({ id: 'cutter', type: 'arrow', x: 280, y: -40, width: 0, height: 160, points: [[0, 0], [0, 160]], endArrowhead: 'arrow' }));
ok('D75: lint finds another connector running through a connector label', XD.lint(crossedLabel).some(p => p.level === 'error' && p.id === 'ab' && /running through it/.test(p.msg)));
ok('D75: a connector never reports its own label, since Excalidraw hides the line behind it', !XD.lint(sampleScene()).some(p => /running through it/.test(p.msg)));
const crossedText = sampleScene();
crossedText.elements.push(el({ id: 'noteText', type: 'text', x: 200, y: 120, width: 160, height: 25, text: 'a standing note', originalText: 'a standing note', fontSize: 16 }));
crossedText.elements.push(el({ id: 'through1', type: 'arrow', x: 280, y: 100, width: 0, height: 80, points: [[0, 0], [0, 80]], endArrowhead: 'arrow' }));
ok('D75: lint finds a connector drawn across a free text', XD.lint(crossedText).some(p => p.level === 'error' && p.id === 'noteText' && /runs through the text/.test(p.msg)));
ok('D75: a connector clear of every label and text reports nothing', !XD.lint(sampleScene()).some(p => /runs through the text/.test(p.msg)));

// A scripted edit can silently rewrite a file's line endings, and a fence line
// ending in CR stopped matching — which let headings inside a code example be
// read as real sections (D76).
const crlfDoc = ['## Real One', '', '```markdown', '## Not A Section', '```', '', '## Real Two'].join('\r\n');
const headsOf = t => V.blankFences(t.split('\n')).filter(l => /^##\s/.test(l)).map(l => l.replace(/\r$/, '')).join('|');
eq('D76: a CRLF document fences exactly like its LF twin', headsOf(crlfDoc), headsOf(crlfDoc.replace(/\r\n/g, '\n')));
eq('D76: a heading inside a CRLF fenced example is not a section', headsOf(crlfDoc), '## Real One|## Real Two');
ok('D76: blanking a fence leaves every other line byte for byte', V.blankFences(crlfDoc.split('\n'))[0] === '## Real One\r');

// A browser can be installed and still return nothing headless — an automatic
// Edge update did exactly that mid-session — so the render falls through to the
// next installed browser instead of stopping (D77). Fake browsers, no spawning.
const fakeBrowsers = table => b => table[b];
const fellThrough = XD.firstThatWorks(['edge', 'chrome'], fakeBrowsers({ edge: { ok: false, why: 'no result (exit 0)' }, chrome: { ok: true, value: 'SCENE' } }));
ok('D77: a browser that returns nothing falls through to the next installed one', fellThrough.browser === 'chrome' && fellThrough.value === 'SCENE' && fellThrough.tried.length === 1 && /^edge: no result/.test(fellThrough.tried[0]), JSON.stringify(fellThrough));
const noneWorked = XD.firstThatWorks(['edge', 'chrome'], () => ({ ok: false, why: 'no result' }));
ok('D77: when every browser fails, each one is named in the failure', noneWorked.browser === null && noneWorked.tried.length === 2);
ok('D77: the first browser that works is used without trying the rest', XD.firstThatWorks(['a', 'b'], b => ({ ok: true, value: b })).browser === 'a');

const tr = XD.transcribe(sampleScene());
ok('D72: the transcription draft is a Mermaid flowchart with every label and the connector\'s label', /```mermaid\nflowchart LR/.test(tr) && /\["Inbox"\]/.test(tr) && /\(\["Wiki"\]\)/.test(tr) && /-->\|"compile"\|/.test(tr), tr);
ok('D72: a zone becomes a subgraph in the transcription', /subgraph n\d+\["Pipeline"\]/.test(XD.transcribe(zoned)));
const route = XD.routeStraight({ type: 'rectangle', x: 0, y: 0, width: 100, height: 50 }, { type: 'rectangle', x: 300, y: 0, width: 100, height: 50 }, 5);
ok('D72: a straight connector runs from outline to outline, gap included', route.x === 105 && route.y === 25 && route.points[1][0] === 190 && route.points[1][1] === 0, JSON.stringify(route));

const DL = V.extractLinks('![[query-ladder.excalidraw|700]] and [[Excalidraw/tooling/query-ladder.excalidraw.md|source]] and [[vault-operations]]');
ok('D72: drawing embeds and links are drawings, named by file, not notes or media',
  DL.drawings.length === 2 && DL.drawings.every(d => d.target === 'query-ladder.excalidraw.md') && DL.drawings[0].embed && !DL.drawings[1].embed && DL.links.length === 1 && DL.media.length === 0, JSON.stringify(DL));
const figLines = ['## Key Takeaways', '- x', '### Figure 1 — Query ladder', '![[query-ladder.excalidraw|700]]', '<!-- drawing-hash: 0a1b2c3d -->', 'short', '## Related', '- [[query-ladder.excalidraw|edit the drawing]]'];
const figSecs = [{ title: 'Key Takeaways', start: 1, end: 2 }, { title: 'Figure 1 — Query ladder', start: 3, end: 6 }, { title: 'Related', start: 7, end: 8 }];
const emb = V.drawingEmbeds(figLines, figSecs);
ok('D72: an embedded drawing is found with the hash its section records', emb.length === 1 && emb[0].recorded === '0a1b2c3d' && emb[0].line === 4, JSON.stringify(emb));
ok('D72: an embedded drawing with a thin section is untranscribed; the hash comment is not transcription',
  V.untranscribed(figLines, figSecs, R.MIN_TRANSCRIPTION_CHARS).some(u => u.target === 'query-ladder.excalidraw.md'));
ok('D72: a plain link to a drawing needs no transcription', !V.untranscribed(figLines, figSecs, R.MIN_TRANSCRIPTION_CHARS).some(u => u.line === 8));

// ---------------------------------------------------------------------------
// 17c. NOTEBOOKLM IS AN INSTRUMENT, NOT A SOURCE. It answers from the sources
// it was handed and knows nothing of a claim the vault later corrected, so no
// node may rest a claim on it. The patterns must catch attribution and a
// notebook id, and must NOT catch prose that merely describes the workflow —
// wiki/tooling/ has to be able to explain the thing without failing the build.
// ---------------------------------------------------------------------------
for (const line of [
  'Sam Lee is at Acme, per NotebookLM.',
  'According to NotebookLM, the median latency is 4.12 ms.',
  'NotebookLM found eight authors on the survey paper.',
  'NotebookLM confirmed the migration finished in August.',
  'source: NotebookLM',
  'Notebook id: 1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', // scan-private: allow
]) ok(`D74: attribution is caught — "${line.slice(0, 34)}"`, R.NOTEBOOKLM_ATTRIBUTION.test(line) || R.NOTEBOOK_ID.test(line));

for (const line of [
  'A compile may ask NotebookLM about a source before writing the hub.',
  'The verification pass uses NotebookLM to raise candidate discrepancies.',
  'NotebookLM has no correction layer, so every finding is checked against raw/.',
  'Alex signed in to NotebookLM on 18 September 2026.',
  'The paper gives the median latency as 4.21 ms in section IV-C.',
]) ok(`D74: description is not attribution — "${line.slice(0, 34)}"`, !R.NOTEBOOKLM_ATTRIBUTION.test(line) && !R.NOTEBOOK_ID.test(line));

const d74Code = codeOf('build-index.js');
ok('D74: the builder checks attribution and exempts logs and verbatim nodes',
  /NOTEBOOKLM_ATTRIBUTION/.test(d74Code) && /kind !== 'log' && fm\.verbatim !== 'true'/.test(d74Code));

// ---------------------------------------------------------------------------
// 18. THE LEDGER IS TRUE. Every guard tools/DEFECTS.md claims must exist: a
// tool guard's CODE — comments stripped — names the ID (in a message or test
// name); a rule guard names a real CLAUDE.md section, headings inside code
// examples excluded. Every table row must carry a well-formed ID.
// ---------------------------------------------------------------------------
const ledger = fs.readFileSync(path.join(TOOLS, 'DEFECTS.md'), 'utf8');
const ledgerHead = ledger.split('\n| ID |')[0];
ok('D20: the ledger header states the rule the checker enforces — IDs in code, not just a comment',
  !/cites the ID in a comment\./.test(ledgerHead) && /not just a\s+comment/.test(ledgerHead));
// A rule guard names a section of the manual (AGENTS.md, and CLAUDE.md's
// Claude-only lines) or of a path-scoped rules file (D87, D90).
const heads = new Set([path.join(VAULT, 'AGENTS.md'), path.join(VAULT, 'CLAUDE.md'), ...ruleFiles].filter(fs.existsSync).flatMap(p => V.blankFences(fs.readFileSync(p, 'utf8').split('\n'))
  .filter(l => /^##\s/.test(l)).map(l => l.replace(/^##\s+/, '').trim())));
ok('D39: the manual\'s headings inside code examples are not sections', !heads.has('<body sections>'));
const src = {
  selftest: stripComments(fs.readFileSync(__filename, 'utf8')),
  build: ['build-index.js', 'lib/vault.js', 'lib/text.js', 'lib/rules.js', 'lib/writechecks.js'].map(codeOf).join('\n'),
  audit: codeOf('audit.js'),
  hook: ['lib/hooks.js', 'hooks/stop-rebuild.js', 'hooks/post-write-check.js', 'hooks/pre-bash-guard.js'].map(codeOf).join('\n'),
  excalidraw: ['excalidraw.js', 'lib/excalidraw.js'].map(codeOf).join('\n'),
};
const SKILLS = path.join(VAULT, '.claude', 'skills');
const skillText = name => { const f = path.join(SKILLS, name, 'SKILL.md'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; };
// A skill guard names a skill that exists and whose text cites the ID.
function skillGuardProblem(id, name) {
  const t = skillText(name);
  if (t === null) return `${id}: no skill "${name}" at .claude/skills/${name}/SKILL.md`;
  if (!new RegExp(`\\b${id}\\b`).test(t)) return `${id}: skill ${name} does not cite ${id}`;
  return null;
}
ok('D39: a ledger guard naming a missing skill is caught', skillGuardProblem('D01', 'no-such-skill') !== null);
ok('D39: a skill guard is satisfied by a skill that cites the ID', skillGuardProblem('D73', 'vault-excalidraw') === null);
const tableRows = ledger.split('\n').filter(l => /^\s*\|/.test(l)).slice(2);
const rows = tableRows.map(V.splitRow);
const malformed = tableRows.filter((_, i) => !/^D\d{2,}$/.test(rows[i][0]));
ok('D39: every ledger row carries a Dnn ID', malformed.length === 0, malformed.join(' / '));
const ids = rows.map(r => r[0]);
ok('D39: ledger IDs are unique', new Set(ids).size === ids.length);
ok('D39: ledger IDs are sequential from D01', ids.every((id, i) => id === `D${String(i + 1).padStart(2, '0')}`), ids.join(','));
const broken = [];
for (const r of rows) {
  if (r.length !== 6) { broken.push(`${r[0]}: expected 6 cells, got ${r.length}`); continue; }
  for (const g of r[5].split(',').map(s => s.trim()).filter(Boolean)) {
    if (g.startsWith('rule:')) { if (!heads.has(g.slice(5).trim())) broken.push(`${r[0]}: no section "${g.slice(5)}" in AGENTS.md, CLAUDE.md or .claude/rules/`); }
    else if (g.startsWith('skill:')) { const p = skillGuardProblem(r[0], g.slice(6).trim()); if (p) broken.push(p); }
    else if (src[g] === undefined) broken.push(`${r[0]}: unknown guard "${g}"`);
    else if (!new RegExp(`\\b${r[0]}\\b`).test(src[g])) broken.push(`${r[0]}: ${g} code (comments stripped) does not cite ${r[0]}`);
  }
}
ok('D39: every ledger guard exists in code, not just in a comment', broken.length === 0, broken.join('; '));

// ---------------------------------------------------------------------------
// 19. WRITE-LEVEL CHECKS RUN IN THE BUILD (D78). The audit now runs only when
// the owner types /vault-audit, so the checks one capture can break moved into
// the builder, which runs on every write.
// ---------------------------------------------------------------------------
const W = require('./lib/writechecks');
const wnode = (rel, fm, text) => { const lines = text.split('\n'); return { rel, fm, lines, code: V.blankFences(lines) }; };
const fenceFx = [{ pattern: '\\bacme\\b[^\\n]*\\bfounded in 1990\\b', reason: 'Acme was founded in 1991', catches: ['Acme was founded in 1990.'], passes: ['Acme was founded in 1991.'] }];
const claimText = '---\ntitle: Acme\n---\n\n## Key Takeaways\n- Acme was founded in 1990.\n';
eq('D37: the build catches a corrected claim in a hub', W.forbiddenClaims([wnode('wiki/projects/acme.md', { kind: 'hub' }, claimText)], fenceFx).length, 1);
eq('D37: a log keeps its history as written', W.forbiddenClaims([wnode('wiki/journal/journal-2026-09.md', { kind: 'log' }, claimText)], fenceFx).length, 0);
eq('D37: a verbatim source keeps its words', W.forbiddenClaims([wnode('wiki/projects/acme-full-text.md', { kind: 'detail', verbatim: 'true' }, claimText)], fenceFx).length, 0);
eq('D50: a fence whose examples behave passes', W.fenceExampleIssues(fenceFx).length, 0);
ok('D50: a fence that misses its own catch is reported', W.fenceExampleIssues([{ ...fenceFx[0], catches: ['Acme opened in 1990.'] }]).length > 0);
const sicText = '---\ntitle: Paper\n---\n\n## Key Takeaways\n- x\n\nto 4.21 [sic — Table II and § V give 4.12] with the larger model\n';
eq('D51: the build flags a [sic] that picks a side', W.sidedSic([wnode('wiki/research/paper-full-text.md', { kind: 'detail', verbatim: 'true' }, sicText)]).length, 1);
eq('D51: a non-verbatim node is not read for [sic]', W.sidedSic([wnode('wiki/research/paper.md', { kind: 'hub' }, sicText)]).length, 0);
const person = wnode('wiki/people/priya-shah.md', { kind: 'person', title: 'Priya Shah', aliases: ['Priya'] }, '---\ntitle: Priya Shah\n---\n\n## Key Takeaways\n- A colleague.\n');
const owner = wnode(`wiki/people/${R.OWNER.slug}.md`, { kind: 'person', title: 'Robin Owner', aliases: ['Robin'] }, '---\ntitle: Robin Owner\n---\n\n## Key Takeaways\n- The owner.\n');
const hubNaming = body => wnode('wiki/projects/review.md', { kind: 'hub' }, `---\ntitle: Review\n---\n\n## Key Takeaways\n- ${body}\n`);
eq('D58: the build catches a person named without a link', W.unlinkedPeople([person, hubNaming('Priya Shah led the review.')], R.OWNER.slug).length, 1);
eq('D58: a linked person passes', W.unlinkedPeople([person, hubNaming('[[priya-shah|Priya Shah]] led the review.')], R.OWNER.slug).length, 0);
eq('D58: the owner needs no link', W.unlinkedPeople([owner, hubNaming('Robin Owner led the review.')], R.OWNER.slug).length, 0);
const iconFx = path.join(require('os').tmpdir(), `iconfx-${process.pid}`);
fs.mkdirSync(path.join(iconFx, 'wiki', 'journal'), { recursive: true });
fs.mkdirSync(path.join(iconFx, '.obsidian'), { recursive: true });
eq('D69: the build lists a folder with no Iconize icon', JSON.stringify(V.iconlessFolders(iconFx, { wiki: 'LiBrain', settings: { rules: [] } })), '["wiki/journal"]');
eq('D69: a name rule covers a folder', V.iconlessFolders(iconFx, { wiki: 'LiBrain', settings: { rules: [{ rule: '^journal$', for: 'folders' }] } }).length, 0);
// D79: a plugin's settings are checked only when the plugin is installed;
// a required plugin that is missing is reported by name.
const drList = [
  { file: '.obsidian/app.json', path: 'a', want: 1, why: 'core' },
  { file: '.obsidian/plugins/opt/data.json', path: 'b', want: 2, why: 'optional' },
  { file: '.obsidian/plugins/req/data.json', path: 'c', want: 3, why: 'required', required: true },
];
const drLoad = f => ({ '.obsidian/app.json': { a: 1 }, '.obsidian/plugins/opt/data.json': { b: 9 } })[f] ?? null;
eq('D79: an optional plugin that is not installed is not drift', V.settingDrift(drList, drLoad, () => false).filter(d => d.file.includes('/opt/')).length, 0);
eq('D79: a required plugin that is not installed is reported', V.settingDrift(drList, drLoad, () => false).filter(d => d.missingPlugin === 'req').length, 1);
eq('D79: an installed plugin with a drifted value is still drift', V.settingDrift(drList, drLoad, id => id === 'opt').filter(d => d.file.includes('/opt/')).length, 1);
eq('D79: core settings are always checked', V.settingDrift([{ file: '.obsidian/app.json', path: 'a', want: 2, why: 'core' }], drLoad, () => false).length, 1);
eq('D84: a drawing inside a nested benchmark vault is not stray', V.strayNote('bench/baseline/Excalidraw/tooling/x.excalidraw.md'), null);
eq('D84: a drawing elsewhere outside Excalidraw/ still is', /Excalidraw drawing outside/.test(V.strayNote('docs/x.excalidraw.md') || ''), true);
// D80: a hotkey for a plugin the vault has no folder for is a stripped plugin that survived.
const pluginIds = new Set(R.OBSIDIAN_SETTINGS.map(s => (s.file.match(/^\.obsidian\/plugins\/([^/]+)\//) || [])[1]).filter(Boolean));
const orphanHotkeys = (keys, has) => keys.map(k => k.split(':')[0]).filter(id => pluginIds.has(id) && !has(id));
const hkPath = path.join(VAULT, '.obsidian', 'hotkeys.json');
const hk = fs.existsSync(hkPath) ? Object.keys(JSON.parse(fs.readFileSync(hkPath, 'utf8'))) : [];
eq('D80: every plugin hotkey belongs to a plugin the vault ships', orphanHotkeys(hk, id => fs.existsSync(path.join(VAULT, '.obsidian', 'plugins', id))).join(','), '');
eq('D80: a hotkey for an absent plugin is caught', orphanHotkeys(['omnisearch:show-modal', 'app:reload'], () => false).join(','), 'omnisearch');
eq('bench: the tools can be pointed at another vault root', /process\.env\.VAULT_ROOT/.test(codeOf('build-index.js')) && /process\.env\.VAULT_ROOT/.test(codeOf('audit.js')) && /process\.env\.VAULT_ROOT/.test(codeOf('excalidraw.js')), true);
eq('bench: the builder reads committed files relative to the vault root', /git show HEAD:\.\//.test(codeOf('build-index.js')), true);
eq('bench: the owner can be set from the environment', /VAULT_OWNER_SLUG/.test(codeOf('lib/rules.js')), true);
eq('bench: bench/ is a note home the builder does not validate', R.NOTE_HOMES.includes('bench') && (R.ICON_EXEMPT || []).includes('bench'), true);
eq('repo: community files are allowed at the root', ['CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md', 'CHANGELOG.md', 'MAINTAINING.md', 'UPGRADING.md', 'ROADMAP.md', 'AGENTS.md'].every(n => R.ROOT_NOTES.includes(n)) && R.NOTE_HOMES.includes('docs'), true);
const IX = require('./install-excalidraw');
eq('install: the pin is 2.27.3', IX.PIN.version, '2.27.3');
eq('install: every pinned file has a SHA-256', Object.values(IX.PIN.files).every(h => /^[0-9a-f]{64}$/.test(h)) && Object.keys(IX.PIN.files).sort().join(','), 'main.js,manifest.json,styles.css');
eq('install: versions compare numerically', IX.compareVersions('2.27.3', '2.27.10') < 0 && IX.compareVersions('3.0.0', '2.99.99') > 0 && IX.compareVersions('2.27.3', '2.27.3') === 0, true);
const SP = require('./scan-private');
eq('scan: an email address is caught', SP.scanText('notes.md', 'mail me at alice.smith@gmail.com').length, 1); // scan-private: allow
eq('scan: the maintainer address in SECURITY.md is allowed', SP.scanText('SECURITY.md', 'vifertjdaniel@gmail.com').length, 0); // scan-private: allow
eq('scan: the maintainer address elsewhere is caught', SP.scanText('README.md', 'vifertjdaniel@gmail.com').length, 1); // scan-private: allow
eq('scan: an absolute user path is caught', SP.scanText('a.md', 'see C:\\Users\\alice\\notes').length, 1); // scan-private: allow
eq('scan: a placeholder user path is allowed', SP.scanText('a.md', 'see C:\\Users\\<you>\\notes').length, 0); // scan-private: allow
eq('scan: a UUID is caught', SP.scanText('a.md', 'notebook 3f2b8c1e-9a4d-4e7b-8c2a-1b2c3d4e5f60').length, 1); // scan-private: allow
eq('scan: a long digit run is caught in prose', SP.scanText('a.md', 'account 1234567890123').length, 1); // scan-private: allow
eq('scan: drawing timestamps are not personal data', SP.scanText('Excalidraw/x.excalidraw.md', '"updated": 1789743560789').length, 0); // scan-private: allow
eq('scan: template tokens are not personal data', SP.scanText('CLAUDE.md', '{{OWNER_NAME}}').length, 0); // scan-private: allow
eq('scan: a decimal fraction is not a digit run', SP.scanText('.obsidian/graph.json', '"scale": 0.518713248970312').length, 0); // scan-private: allow
eq('scan: a line marked as an allowed fixture is skipped', SP.scanText('a.md', 'fixture alice@gmail.com ' + 'scan-private' + ': allow').length, 0); // scan-private: allow
eq('scan: a commit SHA pinning an action is not a digit run', SP.scanText('.github/workflows/x.yml', 'uses: a/b@ff98106e4c7b2bc287b24eaf42907196329070c7 # v2').length, 0);
eq('scan: a long digit run beside a SHA still is', SP.scanText('a.md', 'ff98106e4c7b2bc287b24eaf42907196329070c7 account 98765432101').length, 1); // scan-private: allow
// D85: terms from the source vault's own index, read at run time.
const srcRows = [
  ['wiki/people/jo-quill.md', 'Jo Quill', 'people', 'person', '', 'Quill', 'org/zentrix', 's'],
  ['wiki/zentrix/nightly-ledger-sync.md', 'Nightly Ledger Sync Job', 'zentrix', 'hub', '', 'ledger_sync_daily, readLedgerRows, 91.37%', 'zentrix/offshore-team, tech/python', 's'],
  ['wiki/tooling/vault-operations.md', 'How This Vault Is Run Day To Day', 'tooling', 'hub', '', 'run_everything', '', 's'],
];
const srcTerms = SP.sourceTerms(srcRows, ['tech', 'org']).map(t => t.term);
eq('D85: people, identifiers, figures, long titles, slugs and a client facet are harvested',
  ['Jo Quill', 'Quill', 'zentrix', 'Nightly Ledger Sync Job', 'nightly-ledger-sync', 'ledger_sync_daily', 'readLedgerRows', '91.37%', 'zentrix/offshore-team'].filter(t => !srcTerms.includes(t)).join(','), '');
eq('D85: tooling nodes, registered facets and bare values of a client facet are not', ['How This Vault Is Run Day To Day', 'run_everything', 'python', 'offshore-team'].filter(t => srcTerms.includes(t)).join(','), '');
eq('D85: a harvested term is caught whole-word in a file', SP.termHits('CLAUDE.md', 'Ran ledger_sync_daily for Jo.\nQuillfeather is fine.', SP.sourceTerms(srcRows, ['tech', 'org'])).map(h => `${h.line}:${h.match}`).join(), '1:ledger_sync_daily');
eq('D85: the credited author is never a hit', SP.sourceTerms([['wiki/people/vifert-x.md', 'Vifert Xy', 'people', 'person', '', '', '', 's']], []).map(t => t.term).includes('Vifert'), false);
eq('D85: a documented Claude Code name from notes on the public docs is never a hit',
  SP.sourceTerms([['wiki/learning/claude-code-hooks.md', 'Claude Code Hooks', 'learning', 'hub', '', 'tool_input, omitClaudeMd, create_x_table', '', 's']], []).map(t => t.term).join(','), 'create_x_table');
const BL = require('./lib/bench');
const bIdx = [
  ['wiki/a.md', 'A', 't', 'hub', '', 'alpha, apple', '', 'Alpha summary'],
  ['wiki/b.md', 'B', 't', 'hub', '', 'beta', '', 'Beta summary'],
];
const bCards = new Map([['wiki/a.md', 'wiki/a.md\tA\t- Alpha was founded in 1999\n'], ['wiki/b.md', 'wiki/b.md\tB\t- Beta\n']]);
const bSecs = [['wiki/a.md', 'Key Takeaways', '5', '7', ''], ['wiki/a.md', 'History', '8', '10', '']];
const bRead = () => 'The apple move: to Leeds in 2004\n';
const bCtx = { idx: bIdx, cards: bCards, sections: bSecs, readLines: bRead };
const lr = BL.ladder({ terms: ['apple'], budget: 600 }, bCtx);
eq('bench: the ladder routes to the matching node first', lr.firstCard.startsWith('wiki/a.md'), true);
eq('bench: a fact only in a section is found within budget', BL.hasFact(lr.text, '2004'), true);
eq('bench: a tight budget skips the section', BL.hasFact(BL.ladder({ terms: ['apple'], budget: 20 }, bCtx).text, '2004'), false);
eq('bench: Key Takeaways is never read twice as a section', BL.ladder({ terms: ['apple'], budget: 600 }, { ...bCtx, sections: [bSecs[0]] }).text.split('Alpha').length, 2);
eq('bench: an unrouted question reads nothing', BL.ladder({ terms: ['zzz'] }, bCtx).routed, false);
// D81: a tie between an early row that mentions the term in passing and a later row named for it goes to the named one.
const tIdx = [['wiki/a-plan.md', 'A plan', 't', 'hub', '', '', '', 'Mentions harbor analytics once'], ['wiki/harbor-analytics.md', 'Harbor Analytics', 't', 'hub', '', '', '', 'The employer']];
eq('D81: a node named for the term outranks one that mentions it', BL.route(tIdx, ['Harbor Analytics'])[0].row[0], 'wiki/harbor-analytics.md');
eq('D81: a summary match outranks an alias-only match', BL.route([['wiki/x.md', 'X', 't', 'hub', '', 'kiwi', '', 'other'], ['wiki/y.md', 'Y', 't', 'hub', '', '', '', 'about kiwi']], ['kiwi'])[0].row[0], 'wiki/y.md');
eq('D81: a card that answers ends the ladder — no section is read', BL.ladder({ terms: ['apple'], facts: ['1999'], budget: 600 }, bCtx).text.includes('2004'), false);
eq('D81: a card that does not answer goes on to one section', BL.ladder({ terms: ['apple'], facts: ['2004'], budget: 600 }, bCtx).text.includes('2004'), true);
// D82: a date term takes the dated rung — the section map, not the node table.
const dSecs = [['wiki/log-2026-03.md', '2026-03-20 (20-Mar-26)', '3', '4', ''], ['wiki/log-2026-03.md', '2026-03-21 (21-Mar-26)', '5', '6', '']];
const dl = BL.ladder({ terms: ['2026-03-20', '20-Mar-26'], budget: 600 }, { ...bCtx, sections: dSecs, readLines: (p, a) => (a === 3 ? 'went to York\n' : 'other day\n') });
eq('D82: a dated question reads its dated section', `${dl.routed}|${BL.hasFact(dl.text, 'York')}|${BL.hasFact(dl.text, 'other day')}`, 'true|true|false');
eq('bench: facts match case-insensitively', BL.hasFact('Moved To LEEDS', 'leeds'), true);
eq('bench: a regex fact works', BL.hasFact('nDCG 0.74', { re: '0\\.74' }), true);
const sq = BL.scoreQuestion({ id: 'q1', facts: ['1999', '2004'], forbid: ['1998'] }, lr, 40000);
eq('bench: found facts are counted', sq.found, 2);
eq('bench: an absent forbidden value scores zero', sq.forbidden, 0);
eq('bench: a present forbidden value is counted', BL.scoreQuestion({ id: 'q2', facts: [], forbid: ['1999'] }, lr, 40000).forbidden, 1);
eq('bench: routing counts a fact in the first card', sq.firstHit, true);
const gh = BL.graphHealth(bIdx, [['wiki/a.md', 'wiki/b.md']]);
eq('bench: graph health counts orphans and dead ends', `${gh.orphans}/${gh.deadEnds}`, '1/1');
eq('bench: the scorecard is deterministic', JSON.stringify(BL.scorecard([sq], gh)) === JSON.stringify(BL.scorecard([sq], gh)), true);
{
  const os = require('os');
  const pr = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-prep-'));
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(pr, 'repo', rel)), { recursive: true }); fs.writeFileSync(path.join(pr, 'repo', rel), text); };
  put('tools/lib/rules.js', "name: x || 'Owner', // SETUP\npronouns: x || '', // SETUP\nslug: x || 'owner', // SETUP\nidentity: x || 'owner-identity', // SETUP\n");
  put('wiki/profile/owner-identity.md', '# {{OWNER_NAME}} at {{OWNER_WORK}}\n');
  put('wiki/tooling/arch.md', 'lives at {{VAULT_PATH}}\n');
  put('SETUP.md', '{{OWNER_NAME}}\n');
  put('templates/daily-note.md', '{{date:YYYY-MM-DD}}\n');
  put('bench/raw/daily/2026-01-01.md', 'a day\n');
  put('.git/HEAD', 'ref\n');
  const pcfg = { owner: { name: 'Mira Okafor', pronouns: 'she/her', slug: 'mira-okafor', identity: 'mira-identity' }, tokens: { OWNER_WORK: 'data', VAULT_PATH: 'a benchmark copy' } };
  const out = path.join(pr, 'out');
  BL.prepare(path.join(pr, 'repo'), out, pcfg);
  const rd = rel => (fs.existsSync(path.join(out, rel)) ? fs.readFileSync(path.join(out, rel), 'utf8') : null);
  eq('bench prepare: bench/raw lands in raw/, bench/ and .git stay out', [rd('raw/daily/2026-01-01.md'), rd('bench/raw/daily/2026-01-01.md'), rd('.git/HEAD')].join('|'), 'a day\n||');
  eq('bench prepare: the owner is set in rules.js', /'mira-identity', \/\/ SETUP/.test(rd('tools/lib/rules.js')) && /'she\/her'/.test(rd('tools/lib/rules.js')), true);
  eq('bench prepare: the identity node is renamed and its tokens filled', rd('wiki/profile/mira-identity.md'), '# Mira Okafor at data\n');
  eq('D83: the vault path is the placeholder from bench.json, never the real folder', rd('wiki/tooling/arch.md'), 'lives at a benchmark copy\n');
  eq('bench prepare: SETUP.md and Templater syntax are left alone', rd('SETUP.md') + rd('templates/daily-note.md'), '{{OWNER_NAME}}\n{{date:YYYY-MM-DD}}\n');
  let refused = false; try { BL.prepare(path.join(pr, 'repo'), out, pcfg); } catch { refused = true; }
  eq('bench prepare: a non-empty target is refused', refused, true);
  let missing = ''; try { BL.prepare(path.join(pr, 'repo'), path.join(pr, 'out2'), { ...pcfg, tokens: {} }); } catch (e) { missing = e.message; }
  eq('bench prepare: a token with no value is refused by name', /OWNER_WORK/.test(missing), true);
}
eq('D79: an exempt top-level folder needs no icon', V.iconlessFolders(iconFx, { wiki: 'LiBrain', settings: { rules: [] } }, ['wiki']).length, 0);
// The gate (D78): compile and audit start only when the owner types the command.
const fmBlock = t => ((t || '').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [, ''])[1];
for (const s of ['vault-compile', 'vault-audit', 'vault-deep-audit', 'vault-handoff']) {
  const t = skillText(s);
  ok(`D78: /${s} exists`, t !== null);
  ok(`D78: /${s} is gated — disable-model-invocation: true`, /^disable-model-invocation:\s*true\s*$/m.test(fmBlock(t)));
  ok(`D78: /${s} is named for its folder`, new RegExp(`^name:\\s*${s}\\s*$`, 'm').test(fmBlock(t)));
}
ok('D78: vault-excalidraw stays usable by Claude', !/^disable-model-invocation:\s*true/m.test(fmBlock(skillText('vault-excalidraw'))));
// vault-tailor: the setup agent starts it itself, so it must stay ungated; its
// interview is adapted from MIT-licensed work, whose notice must travel with it.
{
  const tailor = skillText('vault-tailor') || '';
  const notice = 'Copyright (c) 2026 Matt Pocock';
  const third = fs.existsSync(path.join(VAULT, 'THIRD_PARTY_NOTICES.md')) ? fs.readFileSync(path.join(VAULT, 'THIRD_PARTY_NOTICES.md'), 'utf8') : '';
  ok('tailoring: vault-tailor stays usable by Claude, so setup can start it', tailor && !/^disable-model-invocation:\s*true/m.test(fmBlock(tailor)));
  ok('tailoring: the interview credits Matt Pocock and carries the MIT notice', /Matt Pocock/.test(tailor) && tailor.includes(notice) && /Permission is hereby granted, free of charge/.test(tailor));
  ok('tailoring: THIRD_PARTY_NOTICES.md carries the same notice', third.includes(notice) && /vault-tailor/.test(third));
  ok('tailoring: the interview may not start until the agent understands how every part works', /Do not ask your owner a single question until you understand how every part\s+of this vault works/.test(tailor));
  ok('tailoring: the study ends in a sourced brief of how the vault works, every gap closed', /Prove you understand how all of it works/.test(tailor) && tailor.includes('output/tailor-study.md') && /Close every gap/.test(tailor));
  ok('tailoring: the extending guide travels inside the skill', fs.existsSync(path.join(VAULT, '.claude', 'skills', 'vault-tailor', 'references', 'extending.md')));
}
// The vault's own agents skip CLAUDE.md: they carry their own brief (D87).
for (const a of ['vault-fidelity-verifier', 'vault-gap-auditor']) {
  const p = path.join(VAULT, '.claude', 'agents', `${a}.md`);
  const t = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  ok(`D87: the ${a} agent exists`, t !== null);
  ok(`D87: the ${a} agent skips CLAUDE.md — omitClaudeMd: true`, /^omitClaudeMd:\s*true\s*$/m.test(fmBlock(t)));
  ok(`D87: the ${a} agent is read-only`, /^tools:/m.test(fmBlock(t)) && !/\b(Write|Edit)\b/.test((fmBlock(t).match(/^tools:.*$/m) || [''])[0]));
}
const manualLines = V.blankFences(fs.readFileSync(path.join(VAULT, 'AGENTS.md'), 'utf8').split('\n'));
ok('D78: the manual states the gate', heads.has('Compile and Audit — Only When I Invoke Them'));
ok('D78: the compile procedure lives in /vault-compile, not the manual', !manualLines.some(l => /^###\s+Compile Procedure/.test(l)));
ok('D78: the audit procedure lives in /vault-audit, not the manual', !heads.has('Audit'));
const nlmAt = manualLines.findIndex(l => /^##\s+NotebookLM\s*$/.test(l));
const nlmLen = nlmAt < 0 ? -1 : manualLines.slice(nlmAt + 1).findIndex(l => /^##\s/.test(l));
ok('D78: the manual keeps only a NotebookLM stub', nlmAt >= 0 && nlmLen >= 0 && nlmLen <= 10, `${nlmLen} lines`);

// ---------------------------------------------------------------------------
// EVERY AGENT (D90–D93). One manual, AGENTS.md, which CLAUDE.md imports; the
// layer other agents read generated from .claude/; hooks that read either
// agent's payload; a contributor note that never reaches a vault.
// ---------------------------------------------------------------------------
{
  const A = require('./lib/agents');
  const H = require('./lib/hooks');
  const manual = fs.readFileSync(path.join(VAULT, 'AGENTS.md'), 'utf8');
  const shim = fs.readFileSync(path.join(VAULT, 'CLAUDE.md'), 'utf8');
  eq('D90: the shipped CLAUDE.md imports AGENTS.md and repeats none of it', V.shimProblems(shim, manual).length, 0);
  eq('D90: a CLAUDE.md without the import is reported', V.shimProblems('## Claude Code Only\n- x', manual).length, 1);
  ok('D90: a CLAUDE.md that repeats a section of the manual is reported', V.shimProblems('@AGENTS.md\n\n## Query Protocol\n', manual).some(p => /Query Protocol/.test(p)));
  ok('D90: the manual names no single agent as the one that runs it', !/Claude Code carries no memory/.test(manual) && /every coding agent/.test(manual));
  ok('D90: CLAUDE.md, AGENTS.md and HANDOFF.md all have a budget', ['AGENTS.md', 'CLAUDE.md', 'HANDOFF.md'].every(f => R.CONTEXT_BUDGET_TOKENS[f] > 0));

  const d = A.drift(VAULT);
  eq('D91: every generated file matches .claude/ — run node tools/agents-sync.js', [...d.changed, ...d.stale].join(', '), '');
  const gated = A.renderSkill('x', '---\nname: x\ndescription: Does x: carefully.\nargument-hint: "[a]"\ndisable-model-invocation: true\n---\n\n# X\n');
  ok('D91: a gated skill keeps its gate for Codex', /allow_implicit_invocation: false/.test(gated.openai));
  ok('D91: a generated skill carries only Agent Skills fields', !/disable-model-invocation|argument-hint/.test(gated.skill.split('---')[1]));
  ok('D91: a gated skill says in words that it is explicit only, quoted as YAML', gated.skill.includes(`description: "Does x: carefully.${A.GATED_NOTE}"`));
  eq('D91: an open skill gets no openai.yaml', A.renderSkill('y', '---\nname: y\ndescription: Does y.\n---\nbody\n').openai, null);
  const hooks = JSON.parse(A.renderHooks('{"hooks":{"PostToolUse":[{"matcher":"Write|Edit|MultiEdit","hooks":[{"type":"command","command":"node","args":["${CLAUDE_PROJECT_DIR}/tools/hooks/post-write-check.js"]}]}]}}'));
  eq('D91: an edit hook matches Codex\'s apply_patch', hooks.hooks.PostToolUse[0].matcher, 'apply_patch|Write|Edit');
  eq('D91: a hook runs from the git root, since Codex starts in the session cwd', hooks.hooks.PostToolUse[0].hooks[0].command, 'node "$(git rev-parse --show-toplevel)/tools/hooks/post-write-check.js"');
  eq('D92: on Windows a hook passes its exit code through PowerShell, which would turn a block (2) into a failure (1)', hooks.hooks.PostToolUse[0].hooks[0].commandWindows, 'node "$(git rev-parse --show-toplevel)/tools/hooks/post-write-check.js"; exit $LASTEXITCODE');
  ok('D91: a Codex agent is read-only', /^sandbox_mode = "read-only"$/m.test(A.renderAgent('a.md', '---\nname: a\ndescription: A.\n---\nDo a.\n')));

  const cwd = path.join(VAULT, 'wiki');
  eq('D92: a Claude Code edit names its file', H.editedFiles({ cwd, tool_input: { file_path: 'x.md' } }).join(), path.join(cwd, 'x.md'));
  eq('D92: a Codex apply_patch names every file it adds, updates or moves to',
    H.editedFiles({ cwd, tool_input: { command: '*** Begin Patch\n*** Update File: a.md\n@@\n-x\n+y\n*** Add File: b/c.md\n+z\n*** Update File: d.md\n*** Move to: e.md\n*** End Patch' } }).map(p => path.relative(cwd, p)).join(),
    ['a.md', path.join('b', 'c.md'), 'd.md', 'e.md'].join());
  const stop = require('child_process').spawnSync(process.execPath, [path.join(TOOLS, 'hooks', 'stop-rebuild.js')], { input: '{}', encoding: 'utf8' });
  ok('D92: the Stop hook answers with JSON when it lets the agent finish', stop.status !== 0 || (() => { try { JSON.parse(stop.stdout); return true; } catch { return false; } })(), stop.stdout);

  const filled = manual.replace(/\{\{OWNER_NAME\}\}/g, 'Mira');
  ok('D93: the template ships the contributor note in the manual', V.TEMPLATE_ONLY.test(manual) && !V.templateOnlyLeft(manual));
  ok('D93: a vault whose manual keeps the note is reported', V.templateOnlyLeft(filled));
  ok('D93: a vault with the note removed passes', !V.templateOnlyLeft(filled.replace(V.TEMPLATE_ONLY, '')));
  ok('D93: the note points to a brief that exists', fs.existsSync(path.join(VAULT, 'docs', 'for-ai-agents.md')) && /docs\/for-ai-agents\.md/.test(manual));
}
eq('D58: a log keeps names as written', W.unlinkedPeople([person, wnode('wiki/journal/journal-2026-09.md', { kind: 'log' }, '---\ntitle: J\n---\n\n## Key Takeaways\n- Priya Shah called.\n')], R.OWNER.slug).length, 0);

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// CONTEXT BUDGET (D87). CLAUDE.md loads in every session and every subagent;
// the rest of the rules load by path.
// ---------------------------------------------------------------------------
{
  const os = require('os');
  const bx = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-'));
  fs.writeFileSync(path.join(bx, 'CLAUDE.md'), 'x'.repeat(4000));
  fs.writeFileSync(path.join(bx, 'HANDOFF.md'), 'x'.repeat(400));
  eq('D87: a file over its token budget is reported, one under it is not', JSON.stringify(V.overBudget(bx, { 'CLAUDE.md': 500, 'HANDOFF.md': 500, 'MISSING.md': 1 })), JSON.stringify([{ file: 'CLAUDE.md', tokens: 1000, budget: 500 }]));
}
ok('D87: over budget warns and names the only remedy — move, never delete (D01)', /never delete or compress it to fit/.test(codeOf('build-index.js')) && !/problems\.push\([^\n]*over its/.test(codeOf('build-index.js')));
ok('D87: the always-loaded files have a budget', ['AGENTS.md', 'HANDOFF.md'].every(f => R.CONTEXT_BUDGET_TOKENS[f] > 0));
const unscoped = ruleFiles.filter(p => { const fm = V.parseFm(fs.readFileSync(p, 'utf8')); return !fm || !Array.isArray(fm.fm.paths) || !fm.fm.paths.length; }).map(p => path.basename(p));
ok('D87: every rules file is path-scoped — one without paths: loads at launch and undoes the split', unscoped.length === 0, unscoped.join(', '));
ok('D87: the rules files exist', ruleFiles.length >= 4, `${ruleFiles.length} found`);

// ---------------------------------------------------------------------------
// GRAPH COLOURS (D86). One visible, distinct colour per folder, kept stable.
// ---------------------------------------------------------------------------
const G = require('./lib/graphcolours');
// The template ships with no background (GRAPH.background null), so the tests fix one.
const GT = { ...R.GRAPH, background: [23, 19, 32] };
eq('D86: white on black is 21:1', Math.round(G.contrast([255, 255, 255], [0, 0, 0])), 21);
eq('D86: CIEDE2000 matches Sharma et al. pair 1', G.deltaELab([50, 2.6772, -79.7751], [50, 0, -82.7485]).toFixed(4), '2.0425');
eq('D86: a colour is no distance from itself', G.deltaE([10, 200, 30], [10, 200, 30]), 0);
{
  const os = require('os');
  const gx = fs.mkdtempSync(path.join(os.tmpdir(), 'graph-'));
  const put = rel => { fs.mkdirSync(path.dirname(path.join(gx, rel)), { recursive: true }); fs.writeFileSync(path.join(gx, rel), 'x\n'); };
  ['wiki/a/x.md', 'wiki/b/sub/y.md', 'wiki/top.md', 'tools/t.md', 'raw/r.md', 'output/o.md', 'Excalidraw/tooling/d.excalidraw.md', 'root.md', 'templates/p/q.md'].forEach(put);
  fs.mkdirSync(path.join(gx, 'wiki/c'), { recursive: true });
  fs.mkdirSync(path.join(gx, 'empty'), { recursive: true });
  eq('D86: topics, the whole of Excalidraw/, and folders holding notes get colours',
    G.colourFolders(gx, GT).join(','), 'Excalidraw,templates/p,tools,wiki/a,wiki/b');
}
const gw = G.linkWeights([['wiki/a/x.md', 'wiki/b/y.md'], ['wiki/b/y.md', 'wiki/a/z.md'], ['wiki/a/x.md', 'wiki/a/q.md']]);
eq('D86: links between folders are counted both ways, not within one', `${gw.get('wiki/a|wiki/b')}|${gw.has('wiki/a|wiki/a')}`, '2|false');
const ga = G.assign(['wiki/a', 'wiki/b', 'tools'], new Map(), gw, GT);
const gc = [...ga.colours.values()];
ok('D86: every assigned colour clears the contrast floor', gc.every(c => G.contrast(c, GT.background) >= GT.minContrast));
ok('D86: every pair clears the distance floor', gc.every((c, i) => gc.every((d, j) => i === j || G.deltaE(c, d) >= GT.minDeltaE)));
const keep = new Map([['wiki/a', ga.colours.get('wiki/a')]]);
eq('D86: an existing colour is kept when a folder arrives', JSON.stringify(G.assign(['wiki/a', 'wiki/b'], keep, gw, GT).colours.get('wiki/a')), JSON.stringify(ga.colours.get('wiki/a')));
eq('D86: a deeper folder\'s group comes first, since the first match wins', G.groups(new Map([['wiki', [200, 100, 100]], ['wiki/a', [100, 200, 100]]]))[0].query, 'path:"wiki/a/"');
eq('D86: groups round-trip to existing colours', JSON.stringify([...G.existingColours(G.groups(ga.colours)).keys()].sort()), JSON.stringify([...ga.colours.keys()].sort()));
const gp = G.problems(['wiki/a', 'wiki/b'], G.groups(new Map([['wiki/a', [40, 30, 50]], ['gone', [250, 250, 120]]])), GT);
ok('D86: a missing group, a stale group and an invisible colour are all reported', gp.some(p => /wiki\/b/.test(p)) && gp.some(p => /gone/.test(p)) && gp.some(p => /contrast/.test(p)), gp.join(' / '));
const fixedTag = new Map([['tag nodes', [68, 207, 110]]]);
const gf = G.assign(['wiki/a', 'wiki/b', 'tools'], new Map(), gw, GT, fixedTag);
ok('D86: a colour the tool cannot change is kept clear of, and never returned', !gf.colours.has('tag nodes') && [...gf.colours.values()].every(c => G.deltaE(c, [68, 207, 110]) >= GT.minDeltaE));
const clash = new Map([['wiki/a', [0, 255, 0]], ['tag nodes', [68, 207, 110]]]);
const gr = G.assign(['wiki/a', 'tag nodes'], clash, new Map([['tag nodes|wiki/a', 0]]), GT);
ok('D86: of two existing colours too close together, one is reassigned', G.deltaE(gr.colours.get('wiki/a'), gr.colours.get('tag nodes')) >= GT.minDeltaE);
ok('D86: a theme colour too close to a folder colour is reported', G.problems(['wiki/a'], G.groups(new Map([['wiki/a', [0, 255, 0]]])), GT, new Map([['tag nodes', [30, 250, 30]]])).some(p => /tag nodes/.test(p)));
eq('D86: a Style Settings hex reads back as RGB', JSON.stringify(G.fromHex('#44cf6e')), '[68,207,110]');

// ---------------------------------------------------------------------------
// HOOKS. Traps that bit repeatedly are enforced by the harness, not memory.
// ---------------------------------------------------------------------------
const H = require('./lib/hooks');
const BT = String.fromCharCode(96); // a backtick, kept out of this file's literals
eq('D13: backticks inside single quotes are literal', H.executedBackticks(`echo 'a ${BT}b${BT} c'`), 0);
eq('D13: backticks inside double quotes execute', H.executedBackticks(`echo "a ${BT}b${BT} c"`), 2);
eq('D13: an escaped backtick does not execute', H.executedBackticks(`git commit -m "fix \\${BT}x\\${BT}"`), 0);
eq('D13: a quoted heredoc body is literal', H.executedBackticks(`cat <<'EOF' > f\nuse ${BT}x${BT} here\nEOF`), 0);
eq('D13: an unquoted heredoc body executes backticks', H.executedBackticks(`cat <<EOF > f\nuse ${BT}x${BT} here\nEOF`), 2);
eq('D13: text after a quoted heredoc is scanned again', H.executedBackticks(`cat <<'EOF' > f\nliteral ${BT}x${BT}\nEOF\necho "${BT}y${BT}"`), 2);
eq('D13: $( ) is not flagged', H.executedBackticks('echo "$(date)"'), 0);
ok('D76: Python write_text is refused', H.bashProblems("python -c \"p.write_text('x')\"").length === 1);
eq('D76: an ordinary command passes', H.bashProblems('node tools/build-index.js').length, 0);
ok('D76: a CRLF markdown file is refused', H.mdProblems('a\r\nb\r\n').some(p => /CRLF/.test(p)));
ok('D03: a control byte is refused', H.mdProblems('a' + String.fromCharCode(1) + 'b\n').some(p => /control/.test(p)));
eq('D03: a clean file passes', H.mdProblems('# ok\n\ntext\n').length, 0);
{
  const os = require('os');
  const hx = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-'));
  fs.mkdirSync(path.join(hx, 'wiki/t'), { recursive: true });
  fs.writeFileSync(path.join(hx, 'wiki/t/n.md'), 'x\n');
  fs.writeFileSync(path.join(hx, 'wiki/_index.tsv'), 'x\n');
  const past = new Date(Date.now() - 60000);
  fs.utimesSync(path.join(hx, 'wiki/t/n.md'), past, past);
  eq('D87: an index newer than every note is current', H.staleIndex(hx), false);
  const older = new Date(Date.now() - 120000);
  fs.utimesSync(path.join(hx, 'wiki/_index.tsv'), older, older);
  eq('D87: a note newer than the index makes it stale', H.staleIndex(hx), true);
}

console.log(`selftest: ${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log('  FAIL  ' + f);
  process.exit(1);
}
console.log('all green');
