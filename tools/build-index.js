// VERSIONED TOOL — not disposable. Builds the retrieval layer, the generated
// Now page, the topic indexes and the master index, and validates the vault.
// Run:  node tools/build-index.js   (see tools/README.md)
//   wiki/_index.tsv     path|title|topic|kind|status|aliases(+spelling variants)|tags|summary
//   wiki/_cards.tsv     path|title|takeaways                                 (route AND answer)
//   wiki/_sections.tsv  path|heading|start|end|gist                          (exact-range reads)
//   wiki/_links.tsv     source|target                                        (graph edges)
//   wiki/_mentions.tsv  person-slug|date|log-path|start-end|snippet          (people timeline)
//   wiki/profile/now.md generated from every open `## Status Log`             (current status)
// Every problem message names the defect it guards (Dnn, see tools/DEFECTS.md);
// selftest.js checks each ledger guard is cited in code, not just a comment.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { cell, spellingVariants, hyphenVariants, norm, matches } = require('./lib/text');
const V = require('./lib/vault');
const R = require('./lib/rules');
const X = require('./lib/excalidraw');
const W = require('./lib/writechecks');
const A = require('./lib/agents');
const { MAX_BULLETS, MAX_CARD_BYTES, BODY_CAPS: CAP } = R;

// Resolved from this file's location, so the repo works wherever it is cloned (D19).
const VAULT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const WIKI = path.join(VAULT, 'wiki');
const NOW_ABS = path.join(VAULT, R.NOW_PATH);

// Today in LOCAL time (an ISO/UTC date is a day behind in IST before 05:30) (D18).
const _now = new Date();
const D = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

// Write a generated file only when its content actually changes. The date is
// held at its previous value while comparing, so an unchanged file keeps its
// old `updated` date instead of churning git with a fresh one on every build.
function writeGenerated(file, render, dateRe) {
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  const oldDate = old && (old.match(dateRe) || [])[1];
  const oldCreated = old && (old.match(/^created: (\S+)/m) || [])[1];
  if (old && oldDate && render(oldCreated || oldDate, oldDate) === old) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(oldCreated || D, D));
  return true;
}

// SETUP: the starter topics. Tailor them to the owner during setup (SETUP.md,
// step "Topics") — rename, drop or add, and register a topic HERE before any
// node uses it. A client or employer engagement kept self-contained gets its
// own topic, e.g. 'acme-engagement', with decisions/ and worklog/ inside it.
const LABELS = {
  career: 'Career', ideas: 'Ideas', journal: 'Journal', learning: 'Learning',
  people: 'People', profile: 'Profile', projects: 'Projects', tooling: 'Tooling',
};
// A topic missing here makes its nodes fail validation (D15) — register first.
const TOPICS = {
  journal: 'Personal dated log — everything logged that is not the work of a self-contained engagement: life, learning, career, this vault. One file per month.',
  people: 'Everyone the owner has mentioned — family, friends, colleagues, collaborators — with only the facts that were stated.',
  projects: 'Things the owner has built or is building — each with what it does, how, and where it stands.',
  learning: 'Courses, books, study and things worked out — what was learned, from what, and where it is recorded.',
  career: 'Roles, employers, skills, certifications, goals and the job search.',
  ideas: 'Idea dump — anything the owner might build or pursue, each with a status from seed through active to done.',
  // No top-level `decisions` topic yet. Project decisions live in their
  // project's decisions/ subfolder. A top-level decisions/ topic is reserved for
  // significant personal decisions — register it here when the first arrives.
  profile: 'Who the owner is: identity, current status (Now), and how they want Claude to respond.',
  tooling: 'The knowledge system itself — how this vault is built, how to capture into it, query it, draw in it and audit it.',
};
const KIND_ORDER = ['hub', 'detail', 'idea', 'decision', 'person', 'log'];
const KIND_HEADINGS = { hub: 'Hubs', detail: 'Detail (deep reference)', idea: 'Ideas', decision: 'Decisions', person: 'People', log: 'Log (newest first)' };
const DATED = /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\b\d{1,2}-[A-Z][a-z]{2}-\d{2}\b/;

// Importable without triggering a build (selftest uses lib/vault.js directly).
module.exports = { parseFm: V.parseFm, walk: V.walk, TOPICS };
if (require.main !== module) return;

const clean = cell; // single shared cell sanitiser — see tools/lib/text.js
const problems = [], warnings = [];
const relOf = abs => path.relative(VAULT, abs).replace(/\\/g, '/');
const slugOf = rel => path.posix.basename(rel, '.md');

// Excalidraw drawings (D72). A node may embed one live, so it stays editable;
// grep reads only the transcription beside it, which records the drawing's
// content hash, so an edit made to the drawing afterwards shows up as stale.
const drawings = new Map();
for (const abs of V.walk(path.join(VAULT, R.DRAWINGS_FOLDER), ['.md'], d => d.startsWith('.')).filter(X.isDrawingPath)) {
  const b = path.basename(abs);
  if (drawings.has(b)) problems.push(`AMBIGUOUS DRAWING NAME ${b}: ${drawings.get(b).rel} and ${relOf(abs)} — Obsidian resolves an embed by file name (D72)`);
  drawings.set(b, { rel: relOf(abs), abs });
}
const drawingOf = base => {
  const d = drawings.get(base);
  if (d && d.hash === undefined) {
    const p = X.parseDrawing(fs.readFileSync(d.abs, 'utf8'));
    d.error = p.error || null;
    d.hash = p.error ? null : X.sceneHash(p.scene);
  }
  return d;
};

function parseNode(abs) {
  const rel = relOf(abs);
  const text = fs.readFileSync(abs, 'utf8');
  const cc = V.controlCharLines(text);
  if (cc.length) problems.push(`CONTROL CHARACTER on line(s) ${cc.join(', ')} — write the escape as plain text (D03): ${rel}`);
  const parsed = V.parseFm(text);
  if (!parsed) { problems.push(`NO FRONTMATTER: ${rel}`); return null; }
  const { fm, fmLines } = parsed;
  for (const req of ['title', 'summary', 'topic', 'kind']) if (!fm[req]) problems.push(`MISSING ${req}: ${rel}`);
  // A node whose topic is not registered gets no topic _index.md and never
  // appears in _master-index.md — it silently falls out of navigation.
  if (fm.topic && !TOPICS[fm.topic]) problems.push(`UNREGISTERED TOPIC "${fm.topic}" — add it to TOPICS/LABELS in tools/build-index.js (D15): ${rel}`);
  const parts = rel.split('/'); // wiki / topic / [sub] / file
  const folder = parts[1];
  if (fm.topic && folder !== fm.topic) problems.push(`TOPIC/FOLDER MISMATCH (topic "${fm.topic}", folder "${folder}") (D15): ${rel}`);
  const kind = fm.kind || 'hub';
  if (fm.kind && !Object.prototype.hasOwnProperty.call(CAP, fm.kind)) problems.push(`UNKNOWN kind "${fm.kind}" — one of ${Object.keys(CAP).join(', ')} (D41): ${rel}`);

  // --- folders encode kind, never volatile properties ---
  if (parts.length > 4) problems.push(`TOO DEEP — max wiki/<topic>/<sub>/<file> (D32): ${rel}`);
  const sub = parts.length === 4 ? parts[2] : null;
  if (sub) {
    if (sub === R.MEDIA_SUBFOLDER) problems.push(`NOTE INSIDE ${R.MEDIA_SUBFOLDER}/ — media only (D32): ${rel}`);
    else if (!R.KIND_SUBFOLDERS[sub]) problems.push(`UNREGISTERED SUBFOLDER "${sub}/" — allowed: ${Object.keys(R.KIND_SUBFOLDERS).join(', ')}, ${R.MEDIA_SUBFOLDER} (D32): ${rel}`);
    else if (R.KIND_SUBFOLDERS[sub] !== kind) problems.push(`KIND/FOLDER MISMATCH: ${sub}/ holds kind ${R.KIND_SUBFOLDERS[sub]}, this is ${kind} (D32): ${rel}`);
  } else {
    const home = R.KIND_TOPICS[folder];
    if (home && home !== kind) problems.push(`KIND/FOLDER MISMATCH: ${folder}/ holds kind ${home}, this is ${kind} (D32): ${rel}`);
    const want = Object.keys(R.KIND_SUBFOLDERS).find(s => R.KIND_SUBFOLDERS[s] === kind);
    if (want && home !== kind) problems.push(`MISPLACED ${kind.toUpperCase()} — move to wiki/${folder}/${want}/ (D32): ${rel}`);
  }
  if (kind === 'person' && folder !== 'people') problems.push(`PERSON OUTSIDE wiki/people/ — a person outlives a project (D32): ${rel}`);
  if (path.posix.basename(rel).includes('--')) problems.push(`"--" IN A NOTE NAME — reserved for media names (D32): ${rel}`);
  if (fm.pronouns && !/^(he\/him|she\/her|they\/them)$/.test(fm.pronouns)) problems.push(`PRONOUNS must be he/him, she/her or they/them (D25): ${rel}`);

  const allLines = text.split('\n');
  const nLines = V.lineCount(text); // a trailing newline is not a line (D41)
  const code = V.blankFences(allLines); // structure is read with fences blanked
  if (code.unclosed) problems.push(`UNCLOSED CODE FENCE — everything after it is invisible to sections, links and checks (D27): ${rel}`);

  // --- section map (## and ### headings -> line ranges, 1-indexed, inclusive) ---
  const heads = [], anchors = [];
  code.forEach((l, i) => {
    const a = l.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (a) anchors.push(a[1]);
    const m = l.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (m) heads.push({ lvl: m[1].length, title: m[2], line: i + 1 });
  });
  const sections = heads.map((h, i) => ({ ...h, start: h.line, end: (i + 1 < heads.length ? heads[i + 1].line - 1 : nLines) }));
  if (!sections.length || sections[0].title !== 'Key Takeaways') {
    problems.push(`KEY TAKEAWAYS NOT FIRST (got "${sections[0] ? sections[0].title : 'none'}"): ${rel}`);
  }

  // --- answer surface ---
  const kt = sections[0] && sections[0].title === 'Key Takeaways' ? sections[0] : null;
  if (kt) {
    const pre = allLines.slice(fmLines, kt.start - 1).filter(l => l.trim());
    if (pre.length) problems.push(`CONTENT ABOVE KEY TAKEAWAYS — nothing may precede it (D41): ${rel}: "${pre[0].trim().slice(0, 60)}"`);
  }
  const ktLines = kt ? allLines.slice(kt.start, kt.end) : [];
  const surface = V.takeaways(allLines, kt);
  const bullets = surface.bullets.map(clean);
  if (kt && !bullets.length) problems.push(`EMPTY ANSWER SURFACE — no bullets under ## Key Takeaways (D42): ${rel}`);
  if (surface.stray.length) problems.push(`TEXT UNDER KEY TAKEAWAYS OUTSIDE A BULLET — it never reaches the card (D42): ${rel}: "${surface.stray[0].slice(0, 60)}"`);
  if (bullets.length > MAX_BULLETS) problems.push(`TOO MANY TAKEAWAY BULLETS (${bullets.length} > ${MAX_BULLETS}) (D05): ${rel}`);
  const card = bullets.join('\\n');
  if (Buffer.byteLength(card) > MAX_CARD_BYTES) problems.push(`ANSWER SURFACE TOO LARGE (${Buffer.byteLength(card)}b > ${MAX_CARD_BYTES}) (D05): ${rel}`);
  const ktLinks = V.extractLinks(ktLines.join('\n'));
  if (ktLinks.media.length) problems.push(`MEDIA IN KEY TAKEAWAYS — the answer surface is text-only (D33): ${rel}`);
  if (ktLinks.drawings.some(d => d.embed)) problems.push(`DRAWING EMBEDDED IN KEY TAKEAWAYS — the answer surface is text-only; embed it in a body section (D72): ${rel}`);
  ktLines.forEach((l, i) => {
    const p = V.openingPronoun(l);
    if (p) problems.push(`TAKEAWAY OPENS WITH "${p}" — name the subject so the bullet stands alone (D57): ${rel}:${kt.start + i + 1}`);
  });
  if (fm.verbatim === 'true' && !fm.source) problems.push(`VERBATIM NODE WITHOUT source: — name the raw file it was compiled from (D64): ${rel}`);
  if (String(fm.summary || '').length > R.MAX_SUMMARY_CHARS) problems.push(`SUMMARY TOO LONG (${String(fm.summary).length} > ${R.MAX_SUMMARY_CHARS} chars) — it prints on every L0 hit (D56): ${rel}`);

  // A finding NotebookLM raises is confirmed against the source and cited to it,
  // never to the notebook (D74). A log or a verbatim node may record what a tool
  // reported on a date — that is history, not a claim the vault makes.
  if (kind !== 'log' && fm.verbatim !== 'true') {
    code.slice(fmLines).forEach((l, i) => {
      if (!R.NOTEBOOKLM_ATTRIBUTION.test(l) && !R.NOTEBOOK_ID.test(l)) return;
      problems.push(`CLAIM ATTRIBUTED TO NOTEBOOKLM at ${rel}:${fmLines + i + 1} — it answers only from the sources it was given and has no notion of a claim the vault later corrected; confirm the finding against the file in raw/ and cite that file (D74): "${l.trim().slice(0, 70)}"`);
    });
  }

  // --- body cap by kind ---
  const bodyLines = nLines - fmLines;
  const cap = CAP[kind];
  if (cap != null && bodyLines > cap) problems.push(`OVER ${kind.toUpperCase()} CAP (${bodyLines} > ${cap} lines) (D01): ${rel}`);

  const { links, media, drawings: drawingLinks } = V.extractLinks(code.slice(fmLines).join('\n'));
  for (const u of V.untranscribed(allLines, sections, R.MIN_TRANSCRIPTION_CHARS)) {
    const what = X.isDrawingPath(u.target) ? 'DRAWING' : 'IMAGE';
    problems.push(`UNTRANSCRIBED ${what} ${u.target} at ${rel}:${u.line} — its section has ${u.chars} chars of text, needs ${u.need}; grep cannot see pixels (${what === 'DRAWING' ? 'D72' : 'D33'})`);
  }
  for (const d of drawingLinks.filter(x => !x.embed)) {
    if (!drawings.has(d.target)) problems.push(`BROKEN LINK [[${d.target}]] in ${rel} — no such drawing under ${R.DRAWINGS_FOLDER}/ (D72)`);
  }
  const embeddedDrawings = V.drawingEmbeds(allLines, sections);
  for (const e of embeddedDrawings) {
    const d = drawingOf(e.target);
    if (!d) { problems.push(`BROKEN DRAWING EMBED ${e.target} at ${rel}:${e.line} — no such drawing under ${R.DRAWINGS_FOLDER}/ (D72)`); continue; }
    if (d.error) { problems.push(`UNREADABLE DRAWING ${d.rel}, embedded at ${rel}:${e.line}: ${d.error} (D72)`); continue; }
    for (const m of X.pluginReadProblems(fs.readFileSync(d.abs, 'utf8'))) problems.push(`DRAWING THE PLUGIN WOULD MISREAD ${d.rel}, embedded at ${rel}:${e.line}: ${m} (D73)`);
    if (!e.recorded) problems.push(`DRAWING EMBED WITHOUT A drawing-hash at ${rel}:${e.line} — transcribe ${d.rel} (node tools/excalidraw.js transcribe) and record <!-- drawing-hash: ${d.hash} --> in its section (D72)`);
    else if (e.recorded !== d.hash) warnings.push(`drawing changed since its transcription: ${d.rel} is now ${d.hash}, ${rel}:${e.line} records ${e.recorded} — update the transcription, then its drawing-hash (D72)`);
  }

  // --- logs: both date forms in every entry heading; status only as dated history ---
  if (kind === 'log') {
    for (const h of heads) {
      const d = h.title.match(/^(\d{4}-\d{2}-\d{2})/);
      if (!d) continue;
      const want = V.isRealDate(d[1]) ? V.logHeading(d[1]) : 'YYYY-MM-DD (D-Mon-YY)';
      if (h.lvl !== 3 || h.title !== want) problems.push(`LOG DATE HEADING must read "### ${want}" so either date form greps (D48): ${rel}:${h.line} "${h.title}"`);
    }
    for (const h of V.strayLogHeadings(heads)) problems.push(`LOG SUBHEADING AT ### — in a log every ### opens a day, so this one cuts the rest of the day out of its section range; use #### (D88): ${rel}:${h.line} "${h.title}"`);
    for (const h of V.volatileHits(ktLines)) {
      if (!DATED.test(ktLines[h.line - 1])) problems.push(`UNDATED STATUS IN A LOG'S TAKEAWAYS — logs record dated history; live status lives in its owner (D26): ${rel}: "${h.text}"`);
    }
  }

  // --- status: exactly one owner per volatile fact ---
  const status = clean(fm.status || '');
  const statusLog = V.parseStatusLog(allLines, sections);
  if (statusLog) {
    if (statusLog.bad.length) problems.push(`MALFORMED STATUS LOG ROW — the first cell must be a real YYYY-MM-DD (D40): ${rel}: ${statusLog.bad.join(' / ')}`);
    if (V.volatileHits([String(fm.summary || '')]).length) problems.push(`STATUS IN AN OWNER'S SUMMARY — it belongs in the **Status bullet and the Status Log (D40): ${rel}`);
    if (!statusLog.length) problems.push(`EMPTY STATUS LOG (D16): ${rel}`);
    else {
      for (let i = 1; i < statusLog.length; i++) {
        if (statusLog[i].date < statusLog[i - 1].date) problems.push(`STATUS LOG OUT OF ORDER — append-only, oldest first (D16): ${rel}`);
      }
      const latest = statusLog[statusLog.length - 1];
      if (![...R.OPEN_STATUSES, ...R.CLOSED_STATUSES].includes(status)) {
        problems.push(`STATUS LOG NEEDS status: one of ${[...R.OPEN_STATUSES, ...R.CLOSED_STATUSES].join('/')} (got "${status}") (D16): ${rel}`);
      }
      const sb = bullets.filter(b => /^\*\*Status\b/.test(b));
      if (sb.length !== 1) problems.push(`STATUS LOG NEEDS EXACTLY ONE "**Status" TAKEAWAY (found ${sb.length}) (D16): ${rel}`);
      else if (!V.mentionsDate(sb[0], latest.date)) problems.push(`STALE STATUS TAKEAWAY — the latest Status Log row is ${latest.date} but the **Status bullet does not carry that date (D16): ${rel}`);
    }
  } else if (kind !== 'log' && fm.verbatim !== 'true' && rel !== R.NOW_PATH) {
    // Volatile status stated outside the node that owns it — the exact pattern
    // that went stale in five places on 2026-09-10 and four on 2026-09-11.
    for (const h of V.volatileHits(code)) {
      problems.push(`VOLATILE STATUS OUTSIDE ITS OWNER (D16, D29) ${rel}:${h.line} — keep it in the owning node's Status Log and link there, or mark a dated historical line <!-- historical -->: "${h.text}"`);
    }
  }

  return {
    rel, kind, sections, anchors, card, bullets, bodyLines, statusLog, status, fm, fmLines,
    title: clean(fm.title), topic: clean(fm.topic), summary: clean(fm.summary),
    aliases: (Array.isArray(fm.aliases) ? fm.aliases : fm.aliases ? [fm.aliases] : []).map(clean),
    tags: (Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : []).map(clean),
    links, media, allLines, code, drawingEmbeds: embeddedDrawings.map(e => e.target),
  };
}

// ------------------------------------------------------------------ parse
// "_" is reserved for generated files; a hand-written "_" note would never be
// indexed or validated, so it is refused rather than silently skipped.
for (const p of V.walk(WIKI)) {
  const b = path.basename(p);
  if (b.startsWith('_') && b !== '_index.md' && b !== '_master-index.md') problems.push(`"_"-PREFIXED NOTE — reserved for generated files, so it is never indexed (D41): ${relOf(p)}`);
}
// Notes plugins make where no index reads them — a daily note at the root, an
// Importer folder, an Excalidraw drawing embedded into a wiki note (D68).
for (const p of V.walk(VAULT, ['.md'], d => d.startsWith('.') || d === 'node_modules')) {
  const why = V.strayNote(relOf(p));
  if (why) problems.push(`NOTE OUTSIDE THE INDEXED FOLDERS — ${why} (D68): ${relOf(p)}`);
}
const inbox = V.walk(path.join(VAULT, 'raw'), ['.md', '.pdf', '.docx', '.pptx', '.txt', '.csv', '.html', '.png', '.jpg', '.jpeg'], d => d === R.RAW_COMPILED);
// The credit block counts the defects the template shipped, in words — never
// the owner's own rows; the build keeps the number current (D89).
{
  const manual = path.join(VAULT, 'AGENTS.md');
  const ledger = path.join(VAULT, 'tools', 'DEFECTS.md');
  if (fs.existsSync(manual) && fs.existsSync(ledger)) {
    const rows = V.templateDefects(fs.readFileSync(ledger, 'utf8'), R.OWNER_DEFECTS_FROM);
    const text = fs.readFileSync(manual, 'utf8');
    const next = V.creditCount(text, rows);
    if (next === null) warnings.push('the credit block at the top of AGENTS.md no longer names its defect count ("the defect discipline with its … mechanically guarded defects") — restore the credit as written (D89)');
    else if (next !== text) { fs.writeFileSync(manual, next); console.log(`credit block: the defect count now reads ${V.numberWords(rows)}, from the ledger (D89)`); }
  }
}
// One manual for every coding agent: AGENTS.md, which CLAUDE.md imports (D90).
{
  const manual = path.join(VAULT, 'AGENTS.md');
  const claudeMd = path.join(VAULT, 'CLAUDE.md');
  // A vault set up from 1.0 keeps its whole manual in CLAUDE.md: it still works
  // under Claude Code, so that is a warning with the way forward, not a failure.
  // A folder with neither file — the benchmark's vault — has no manual to check.
  if (!fs.existsSync(manual) && fs.existsSync(claudeMd)) warnings.push('the manual is still in CLAUDE.md, which only Claude Code reads — to let any coding agent run this vault, move it to AGENTS.md and leave CLAUDE.md importing it (UPGRADING.md § 1.1, D90)');
  else if (fs.existsSync(manual)) {
    const text = fs.readFileSync(manual, 'utf8');
    if (fs.existsSync(claudeMd)) for (const p of V.shimProblems(fs.readFileSync(claudeMd, 'utf8'), text)) problems.push(`${p} (D90)`);
    if (V.templateOnlyLeft(text)) problems.push('AGENTS.md STILL HOLDS THE TEMPLATE-ONLY NOTE — setup removes the block between <!-- template-only --> and <!-- /template-only -->; left in, it tells your agent the manual is not its brief (D93)');
  }
}
// The layer other agents read is generated from .claude/ (D91).
{
  const { changed, stale } = A.drift(VAULT);
  if (changed.length || stale.length) warnings.push(`${changed.length + stale.length} file(s) in .agents/ or .codex/ no longer match .claude/, so Codex and Gemini see an older vault — run node tools/agents-sync.js (D91): ${[...changed, ...stale].slice(0, 6).join(', ')}`);
}
for (const o of V.overBudget(VAULT, R.CONTEXT_BUDGET_TOKENS)) {
  const home = o.file === 'HANDOFF.md' ? 'a log or detail node in wiki/tooling/' : 'a .claude/rules/ file, a skill or a wiki node';
  warnings.push(`${o.file} is about ${o.tokens} tokens, over its ${o.budget}-token budget, and every session loads it — move detail into ${home}; never delete or compress it to fit (D87, D01)`);
}
if (inbox.length) warnings.push(`${inbox.length} capture(s) waiting in raw/ — they wait for the owner to type /vault-compile, which compiles them into wiki/ and moves them to raw/${R.RAW_COMPILED}/ (D68): ${inbox.map(relOf).join(', ')}`);
const files = V.walk(WIKI).filter(p => !path.basename(p).startsWith('_') && relOf(p) !== R.NOW_PATH && !path.basename(p).endsWith(R.DRAWING_SUFFIX));
const nodes = files.map(parseNode).filter(Boolean);

// Aliases reserved for Now: no other node may claim "what am I doing now" (D26).
const reserved = new Map(R.NOW_ALIASES.map(a => [norm(a), a]));
const relative = new Set(R.RELATIVE_LOG_ALIASES.map(norm));
for (const n of nodes) {
  for (const a of n.aliases) if (reserved.has(norm(a))) problems.push(`ALIAS "${a}" IS RESERVED FOR THE NOW PAGE (D26, D39): ${n.rel}`);
  // "this month" typed into a log is wrong the day the month turns; the builder
  // gives it to the newest log of each series instead (D55).
  for (const a of [...n.aliases, ...n.tags]) if (relative.has(norm(a))) problems.push(`ALIAS OR TAG "${a}" IS GENERATED FOR THE NEWEST LOG — remove it; it would go stale when the month turns (D55): ${n.rel}`);
  // Tags are faceted and registered, in frontmatter and inline alike (D65).
  for (const at of V.referenceBlocks(n.allLines)) problems.push(`CODE STYLER REFERENCE BLOCK — its code lives in another file or a download, so grep cannot see it; paste the code into the note (D68): ${n.rel}:${at}`);
  const inline = V.inlineTags(n.code.slice(n.fmLines));
  for (const p of V.tagProblems([...n.tags, ...inline], n.topic, n.kind)) problems.push(`TAG ${p} (D65): ${n.rel}`);
}
for (const [a, b] of V.nearDuplicateTags(nodes.flatMap(n => n.tags))) problems.push(`NEAR-DUPLICATE TAGS "${a}" and "${b}" — keep one form (D65)`);

// --- write-level checks: the audit's until 2026-09-19, every build's since (D78) ---
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'probes.json'), 'utf8'));
const fences = corpus._forbidden || [];
const writeNodes = nodes.map(n => ({ rel: n.rel, fm: n.fm, lines: n.allLines, code: n.code }));
for (const c of W.forbiddenClaims(writeNodes, fences)) problems.push(`CORRECTED CLAIM BACK IN THE VAULT at ${c.rel}:${c.line} — ${c.reason} (D37)`);
const fenceIssues = W.fenceExampleIssues(fences);
for (const x of fenceIssues) problems.push(`FENCE EXAMPLE FAILS — every _forbidden entry needs catches and passes that behave (D50): ${x}`);
for (const s of W.sidedSic(writeNodes)) problems.push(`[sic] PICKS A SIDE in an unsettled contradiction at ${s.rel}:${s.line} — use a neutral [added: …] note, or name who settled it (D51): ${s.note}`);
for (const u of W.unlinkedPeople(writeNodes, R.OWNER.slug)) problems.push(`PERSON NAMED WITHOUT A LINK at ${u.rel}:${u.line} — link [[${u.slug}]] (D58)`);
// The rules lean on a few Obsidian settings, and a running Obsidian writes its
// in-memory copy back over a file edited under it (D69, D71).
if (fs.existsSync(path.join(VAULT, '.obsidian'))) {
  const isInstalled = id => fs.existsSync(path.join(VAULT, '.obsidian', 'plugins', id, 'manifest.json'));
  const loadJson = f => { try { return JSON.parse(fs.readFileSync(path.join(VAULT, f), 'utf8')); } catch { return null; } };
  const missingPlugins = new Set(); // one line per missing plugin, not per setting
  for (const d of V.settingDrift(R.OBSIDIAN_SETTINGS, loadJson, isInstalled)) {
    if (d.missingPlugin) { if (!missingPlugins.has(d.missingPlugin)) problems.push(`REQUIRED PLUGIN NOT INSTALLED — ${d.missingPlugin}: run node tools/install-excalidraw.js, then reload Obsidian (D79)`); missingPlugins.add(d.missingPlugin); }
    else problems.push(`OBSIDIAN SETTING DRIFTED — ${d.file} ${d.path} is ${JSON.stringify(d.have)}, want ${'contains' in d ? 'it to include ' + JSON.stringify(d.contains) : JSON.stringify(d.want)} (${d.why}); set it again, then reload Obsidian (D69, D71)`);
  }
  const icons = isInstalled('obsidian-icon-folder') ? loadJson('.obsidian/plugins/obsidian-icon-folder/data.json') : null;
  const iconless = icons ? V.iconlessFolders(VAULT, icons, R.ICON_EXEMPT || []) : [];
  if (iconless.length) warnings.push(`${iconless.length} folder(s) have no Iconize icon — add one to .obsidian/plugins/obsidian-icon-folder/data.json (D69): ${iconless.join(', ')}`);
  if (R.GRAPH && R.GRAPH.background) {
    const Gc = require('./lib/graphcolours');
    const graph = loadJson('.obsidian/graph.json');
    const gp = graph ? Gc.problems(Gc.colourFolders(VAULT, R.GRAPH), graph.colorGroups, R.GRAPH, Gc.themeColours(VAULT, R.GRAPH).colours) : [];
    if (gp.length) warnings.push(`${gp.length} graph colour problem(s) — run node tools/graph-colours.js, then reload Obsidian (D86): ${gp.join('; ')}`);
  }
}

// ------------------------------------------------------------------ Now
// Generated, never hand-edited: the one card that answers "what's my status?",
// built from the single owner of each volatile fact, so it cannot drift.
const open = nodes.filter(n => n.statusLog && n.statusLog.length && R.OPEN_STATUSES.includes(n.status))
  .map(n => ({ n, last: n.statusLog[n.statusLog.length - 1] }))
  .sort((a, b) => b.last.date.localeCompare(a.last.date) || a.n.title.localeCompare(b.n.title));
if (open.length > MAX_BULLETS) problems.push(`NOW OVERFLOW: ${open.length} open items > ${MAX_BULLETS} — close, park or merge some (D16)`);
const renderNow = (created, updated) => ['---', 'title: Now', 'summary: What is in flight right now — one line per open item, generated from the Status Log of the node that owns it.',
  `aliases: [${R.NOW_ALIASES.join(', ')}]`,
  'topic: profile', 'kind: hub', 'tags: [subject/status]', 'generated: true', `created: ${created}`, `updated: ${updated}`, '---', '',
  '## Key Takeaways', '',
  ...(open.length ? open.map(({ n, last }) => `- **${n.title}** · \`${n.status}\` · as of ${V.shortDate(last.date)}: ${last.status} — [[${slugOf(n.rel)}|details]]`)
    : ['- Nothing is in flight — no node has an open Status Log.']),
  '', '## Open Items', '', '| Item | Status | As of | Latest entry |', '| --- | --- | --- | --- |',
  ...open.map(({ n, last }) => `| [[${slugOf(n.rel)}\\|${n.title}]] | ${n.status} | ${last.date} | ${last.status} |`),
  '', '## How This Page Works', '',
  '- **Generated by `tools/build-index.js` on every build. Never edit it by hand** — edits are overwritten.',
  `- An item appears here when its node has a \`## Status Log\` and an open \`status\` (${R.OPEN_STATUSES.join(', ')}). Closing the status (${R.CLOSED_STATUSES.join(', ')}) drops it off this page; its Status Log stays as history.`,
  '- To change a status: append a dated row to the owner\'s Status Log, update its one `**Status` takeaway, set `status:`, rebuild.',
  '', '## Related', '', `- [[${R.OWNER.identity}|Who ${R.OWNER.name} is]] — the stable facts this page leaves out.`,
  '- [[vault-capture-protocol|Vault capture protocol]] — how a status change gets captured.', ''].join('\n');
writeGenerated(NOW_ABS, renderNow, /^updated: (\S+)/m);
const nowNode = parseNode(NOW_ABS);
if (nowNode) nodes.push(nowNode);

// ---------------------------------------------------------- link resolution
const byBase = new Map();
for (const n of nodes) {
  const b = slugOf(n.rel);
  if (byBase.has(b)) problems.push(`AMBIGUOUS BASENAME "${b}": ${byBase.get(b).rel} and ${n.rel} — basenames must be unique vault-wide (D32)`);
  byBase.set(b, n);
}
const idxTargets = new Set(Object.keys(TOPICS).map(t => `wiki/${t}/_index`));
idxTargets.add('wiki/_master-index');
// Anchors: the last #segment names a heading of any level; #^id is a block ref.
const anchorOk = (t, anchor) => {
  const a = anchor.split('#').pop();
  return !a || a.startsWith('^') || t.anchors.some(h => norm(h) === norm(a));
};

const edges = [];
for (const n of nodes) {
  for (const l of n.links) {
    if (!l.target) { // [[#Heading]] — a heading in this same note
      if (!anchorOk(n, l.anchor)) problems.push(`BROKEN ANCHOR [[#${l.anchor}]] in ${n.rel} (D28)`);
      continue;
    }
    const base = path.posix.basename(l.target);
    if (byBase.has(base)) {
      const t = byBase.get(base);
      edges.push([n.rel, t.rel]);
      if (l.anchor && !anchorOk(t, l.anchor)) problems.push(`BROKEN ANCHOR [[${l.target}#${l.anchor}]] in ${n.rel} (D28)`);
    } else if (idxTargets.has(l.target)) edges.push([n.rel, `${l.target}.md`]);
    else if (l.target === '_index') edges.push([n.rel, `wiki/${n.topic}/_index.md`]);
    else if (l.target === '_master-index') edges.push([n.rel, 'wiki/_master-index.md']);
    else problems.push(`BROKEN LINK [[${l.target}]] in ${n.rel} (D04)`);
  }
}

// ------------------------------------------------------------------ media
// Text is canonical, the image is a view: every image sits in its topic's
// assets/, is PNG or JPEG, is named after the node that owns it, and is used.
const mediaByBase = new Map();
let mediaBytes = 0;
for (const abs of V.walk(WIKI, R.IMAGE_EXT.map(e => '.' + e))) {
  const rel = relOf(abs);
  const base = path.posix.basename(rel);
  const parts = rel.split('/');
  if (!R.MEDIA_EXT.includes(path.extname(abs).slice(1).toLowerCase())) problems.push(`MEDIA FORMAT NOT ALLOWED — PNG or JPEG only (D44): ${rel}`);
  if (parts.length !== 4 || parts[2] !== R.MEDIA_SUBFOLDER) problems.push(`MEDIA OUTSIDE A <topic>/${R.MEDIA_SUBFOLDER}/ FOLDER (D32): ${rel}`);
  const owner = V.mediaOwner(base);
  if (!owner) problems.push(`MEDIA NAME must be <owner-node-slug>--<kebab-desc>.<${R.MEDIA_EXT.join('|')}> (D33): ${rel}`);
  else if (!byBase.has(owner)) problems.push(`MEDIA OWNER "${owner}" IS NOT A NODE (D33): ${rel}`);
  else if (byBase.get(owner).topic !== parts[1]) problems.push(`MEDIA IN THE WRONG TOPIC — owner is in ${byBase.get(owner).topic} (D33): ${rel}`);
  if (mediaByBase.has(base)) problems.push(`AMBIGUOUS MEDIA NAME ${base} (D33)`);
  mediaByBase.set(base, rel);
  const size = fs.statSync(abs).size;
  mediaBytes += size;
  if (size > R.MAX_IMAGE_KB * 1024) warnings.push(`large image ${Math.round(size / 1024)} KB > ${R.MAX_IMAGE_KB} KB — repo size only, never token cost: ${rel}`);
}
// Obsidian drops a paste into assets/ beside the note it was pasted into
// (attachmentFolderPath "./assets"). Pasted into a note outside wiki/ — or with
// that setting lost — it lands where the walk above never looks (D52). raw/
// holds sources awaiting compile and output/ holds reports; both are allowed.
const OUTSIDE_SKIP = new Set(['wiki', 'raw', 'output', 'node_modules', 'bench', 'docs', R.DRAWINGS_FOLDER]); // drawings keep their own pasted images (D68)
for (const abs of V.walk(VAULT, R.IMAGE_EXT.map(e => '.' + e), d => d.startsWith('.') || OUTSIDE_SKIP.has(d))) {
  problems.push(`IMAGE OUTSIDE wiki/ — rename it, move it to its owner's <topic>/${R.MEDIA_SUBFOLDER}/ and transcribe it (D52): ${relOf(abs)}`);
}
// Every plugin's settings are committed, so a key typed into one would ship
// with the next push (D66). Only the location is printed, never the value.
const OBSIDIAN = path.join(VAULT, '.obsidian');
if (fs.existsSync(OBSIDIAN)) {
  const settingFiles = [
    ...fs.readdirSync(OBSIDIAN).filter(f => f.endsWith('.json')).map(f => path.join(OBSIDIAN, f)),
    ...(fs.existsSync(path.join(OBSIDIAN, 'plugins')) ? fs.readdirSync(path.join(OBSIDIAN, 'plugins')).map(d => path.join(OBSIDIAN, 'plugins', d, 'data.json')).filter(f => fs.existsSync(f)) : []),
  ];
  for (const f of settingFiles) {
    let data;
    try { data = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { warnings.push(`unreadable Obsidian settings file: ${relOf(f)}`); continue; }
    for (const k of V.secretSettings(data)) problems.push(`SECRET IN A COMMITTED OBSIDIAN SETTING — clear it in the plugin's settings and keep the key outside the vault (D66): ${relOf(f)} → ${k}`);
  }
}
const usedMedia = new Set();
for (const n of nodes) {
  for (const m of n.media) {
    if (!mediaByBase.has(m.target)) problems.push(`BROKEN EMBED ${m.target} in ${n.rel} (D33)`);
    else usedMedia.add(m.target);
  }
}
for (const [b, rel] of mediaByBase) if (!usedMedia.has(b)) problems.push(`ORPHAN MEDIA — referenced by no node (D33): ${rel}`);

const sorted = [...nodes].sort((a, b) => a.rel.localeCompare(b.rel));

// --- _index.tsv ---
// Code identifiers named in a node's body route to it (D54). Logs and verbatim
// full texts are left out, so an identifier lands on the node that explains it;
// one named in more than MAX_IDENTIFIER_NODES nodes needs a deliberate alias.
const idsOf = new Map(), idNodes = new Map();
for (const n of nodes) {
  if (n.kind === 'log' || n.fm.verbatim === 'true' || n.fm.generated === 'true') continue;
  const ids = V.codeIdentifiers(n.allLines.slice(n.fmLines).join('\n'));
  idsOf.set(n.rel, ids);
  for (const id of new Set(ids.map(x => x.toLowerCase()))) idNodes.set(id, (idNodes.get(id) || 0) + 1);
}
// The newest log of each series carries the relative aliases (D55).
const newestLog = new Map();
for (const n of nodes) {
  const m = n.kind === 'log' && slugOf(n.rel).match(/^(.*)-(\d{4}-\d{2})$/);
  if (m && (!newestLog.has(m[1]) || slugOf(newestLog.get(m[1]).rel) < slugOf(n.rel))) newestLog.set(m[1], n);
}
const newestSet = new Set([...newestLog.values()].map(n => n.rel));
let nSpell = 0, nHyph = 0;
const indexRows = sorted.map(n => {
  // Append US/UK alternates (e.g. optimisation -> optimization) so a plain
  // `grep -i` in either spelling routes. Index-only: source .md is untouched.
  const alts = spellingVariants([n.title, n.aliases.join(' '), n.summary, n.tags.join(' ')].join(' '));
  // Hyphen-free forms route too: "neurocognitive" finds Neuro-Cognitive (D60).
  const hyph = hyphenVariants([n.title, ...n.aliases, ...n.tags].join(', '));
  const have = [n.title, ...n.aliases, ...alts, ...hyph, n.summary, ...n.tags].join(' ');
  const ids = (idsOf.get(n.rel) || []).filter(x => idNodes.get(x.toLowerCase()) <= R.MAX_IDENTIFIER_NODES && !matches(have, x));
  const rel = newestSet.has(n.rel) ? R.RELATIVE_LOG_ALIASES : [];
  nSpell += alts.length; nHyph += hyph.length;
  return [n.rel, n.title, n.topic, n.kind, n.status, [...n.aliases, ...alts, ...hyph, ...ids, ...rel].join(','), n.tags.join(','), n.summary];
});

// Aliases that vanished since the last commit — the Obsidian trap drops entries
// silently when it reformats frontmatter. Renamed nodes are skipped.
function headFile(rel) {
  try { return cp.execSync(`git show HEAD:./${rel}`, { cwd: VAULT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }); } catch { return null; }
}
const headIdx = headFile('wiki/_index.tsv');
if (headIdx) {
  // An alias counts as lost only if it no longer appears anywhere in the row —
  // a generated spelling variant that moved into the summary still routes.
  const cur = new Map(indexRows.map(r => [slugOf(r[0]), norm(r.join('\t'))]));
  for (const row of headIdx.trim().split('\n').map(r => r.split('\t'))) {
    const have = cur.get(slugOf(row[0]));
    if (have === undefined) continue;
    const lost = (row[5] || '').split(',').filter(a => a.trim() && !have.includes(norm(a)));
    if (lost.length) warnings.push(`aliases dropped since the last commit — intended, or did Obsidian eat them? (D02) ${slugOf(row[0])}: ${lost.join(', ')}`);
  }
}
// Logs are append-only and full texts verbatim, yet a plugin can rewrite either
// in place — Local Images Plus relinks images on a timer, Tag Wrangler renames
// inline tags vault-wide, Linter reformats on save. Every committed body line
// must survive. A deliberate fidelity fix names its file for one run:
// VAULT_ALLOW_REWRITE=wiki/x/y-full-text.md node tools/build-index.js (D67).
const allowRewrite = new Set(String(process.env.VAULT_ALLOW_REWRITE || '').split(',').map(s => s.trim()).filter(Boolean));
for (const n of nodes) {
  if (n.kind !== 'log' && n.fm.verbatim !== 'true') continue;
  const head = headFile(n.rel);
  if (!head) continue;
  const gone = V.rewrittenLines(head, n.allLines.join('\n'), n.kind === 'log' ? 'log' : 'verbatim');
  if (!gone.length) continue;
  const where = gone.slice(0, 3).map(g => `HEAD line ${g.line} "${g.text.slice(0, 80)}"`).join('; ');
  if (allowRewrite.has(n.rel)) warnings.push(`rewrite allowed for this run (D67): ${n.rel} — ${gone.length} committed line(s) changed`);
  else problems.push(`${n.kind === 'log' ? 'LOG' : 'VERBATIM'} TEXT REWRITTEN since the last commit — ${gone.length} committed line(s) changed or gone; restore with git checkout, or rerun with VAULT_ALLOW_REWRITE=${n.rel} if it is a deliberate fix (D67): ${n.rel}: ${where}`);
}
fs.writeFileSync(path.join(WIKI, '_index.tsv'), indexRows.map(r => r.join('\t')).join('\n') + '\n');

// --- _cards.tsv ---
// A person's stated pronouns ride on their card title, so every lookup of
// them carries the only pronouns anyone may use for them (D25). Card-only,
// like the spelling variants in the index: the note's own title is untouched.
const cardTitle = n => (n.kind === 'person' && n.fm.pronouns ? `${n.title} (${clean(n.fm.pronouns)})` : n.title);
fs.writeFileSync(path.join(WIKI, '_cards.tsv'), sorted.map(n => [n.rel, cardTitle(n), n.card].join('\t')).join('\n') + '\n');

// --- _sections.tsv ---
const secRows = [];
for (const n of sorted) {
  for (const s of n.sections) {
    // gist skips embed lines and fenced code, so a figure section's gist is its caption
    const body = n.code.slice(s.start, Math.min(s.end, s.start + 10)).filter(l => l.trim() && !/^\s*!\[\[/.test(l));
    const gist = clean(body.join(' ').replace(/^[-*>#|\s]+/, '')).slice(0, 150);
    secRows.push([n.rel, s.title, s.start, s.end, gist].join('\t'));
  }
}
fs.writeFileSync(path.join(WIKI, '_sections.tsv'), secRows.join('\n') + '\n');

// --- _links.tsv ---
const uniqEdges = [...new Set(edges.map(e => e.join('\t')))].sort();
fs.writeFileSync(path.join(WIKI, '_links.tsv'), uniqEdges.join('\n') + '\n');

// --- _mentions.tsv --- every dated log entry that names or links a person (D45)
const people = nodes.filter(n => n.kind === 'person' && slugOf(n.rel) !== R.OWNER.slug);
const personSlugs = new Set(people.map(p => slugOf(p.rel)));
const nameOwners = new Map();
for (const p of people) {
  for (const nm of V.mentionNames(p.title, p.aliases)) {
    if (!nameOwners.has(nm)) nameOwners.set(nm, new Set());
    nameOwners.get(nm).add(slugOf(p.rel));
  }
}
const matchers = [];
for (const [nm, owners] of nameOwners) {
  if (owners.size > 1) { warnings.push(`mention name "${nm}" is shared by ${[...owners].join(', ')} — not indexed; add a distinguishing alias (D45)`); continue; }
  matchers.push({ name: nm, slug: [...owners][0] });
}
const mentionRows = [];
for (const n of sorted.filter(n => n.kind === 'log')) {
  for (const s of n.sections.filter(s => /^\d{4}-\d{2}-\d{2}/.test(s.title))) {
    const raw = n.code.slice(s.start, s.end).join(' ');
    for (const m of V.findMentions(raw, matchers, personSlugs)) {
      mentionRows.push([m.slug, s.title.slice(0, 10), n.rel, `${s.start}-${s.end}`, clean(m.snippet)]);
    }
  }
}
mentionRows.sort((x, y) => x[0].localeCompare(y[0]) || x[1].localeCompare(y[1]));
fs.writeFileSync(path.join(WIKI, '_mentions.tsv'), mentionRows.map(r => r.join('\t')).join('\n') + '\n');

// --- graph shape at build time: the audit is only run on request ---
const inb = new Set(uniqEdges.map(e => e.split('\t')[1]));
const outb = new Set(uniqEdges.map(e => e.split('\t')[0]));
for (const n of sorted) {
  if (!inb.has(n.rel)) warnings.push(`orphan — no inbound link (D09): ${n.rel}`);
  if (!outb.has(n.rel)) warnings.push(`dead end — no outbound link (D09): ${n.rel}`);
}

// --- topic _index.md ---
for (const [topic, desc] of Object.entries(TOPICS)) {
  const mine = sorted.filter(n => n.topic === topic);
  if (!mine.length) { warnings.push(`empty topic: ${topic}`); }
  const kinds = KIND_ORDER.filter(k => mine.some(n => n.kind === k));
  const line = n => `- [[${slugOf(n.rel)}|${n.title}]]${n.status ? ` \`${n.status}\`` : ''} — ${n.summary}`;
  const group = k => mine.filter(n => n.kind === k)
    .sort((a, b) => k === 'log' ? slugOf(b.rel).localeCompare(slugOf(a.rel)) : a.title.localeCompare(b.title));
  const listing = kinds.length > 1
    ? kinds.flatMap(k => [`## ${KIND_HEADINGS[k]}`, '', ...group(k).map(line), ''])
    : ['## Nodes', '', ...(kinds[0] ? group(kinds[0]).map(line) : []), ''];
  const render = (created, updated) => ['---', `title: ${LABELS[topic]} Index`,
    `summary: Index of the ${mine.length} nodes in the ${topic} topic.`,
    `aliases: [${topic} index, ${topic}]`, `topic: ${topic}`, 'kind: index',
    'tags: []', `created: ${created}`, `updated: ${updated}`, '---', '',
    '## Key Takeaways', '', `- ${desc}`, `- Contains **${mine.length} nodes**${kinds.length > 1 ? ` — ${kinds.map(k => `${mine.filter(n => n.kind === k).length} ${k}`).join(', ')}` : ''}.`,
    '- Orientation only. To look something up, route on `wiki/_index.tsv`, then pull one card from `wiki/_cards.tsv`.',
    '', ...listing, '## Related', '', '- [[wiki/_master-index|Knowledge Base Index]] — all topics.', ''].join('\n');
  writeGenerated(path.join(WIKI, topic, '_index.md'), render, /^updated: (\S+)/m);
}
// A topic removed from TOPICS leaves its generated _index.md behind; flag it.
for (const e of fs.readdirSync(WIKI, { withFileTypes: true })) {
  if (e.isDirectory() && !TOPICS[e.name] && !e.name.startsWith('.')) problems.push(`FOLDER wiki/${e.name}/ IS NOT A REGISTERED TOPIC — register it or remove it (D15)`);
}

// --- _master-index.md ---
const counts = Object.keys(TOPICS).map(t => [t, sorted.filter(n => n.topic === t).length]);
const kindCounts = {};
for (const n of sorted) kindCounts[n.kind] = (kindCounts[n.kind] || 0) + 1;
const renderMaster = (_created, updated) => ['# Knowledge Base Index', '',
  `**${nodes.length} nodes** across **${Object.keys(TOPICS).length} topics**. Last updated ${updated}.`, '',
  '> [!tip] To look something up, route on `wiki/_index.tsv`, then pull one card from `wiki/_cards.tsv`.',
  '> This page is human orientation. It is not the routing layer.', '',
  '## Topics', '',
  ...counts.map(([t, n]) => `### [[wiki/${t}/_index|${LABELS[t]}]] · ${n} nodes\n\n${TOPICS[t]}\n`),
  '## Start Here', '',
  '- [[now|What is happening right now]]',
  `- [[${R.OWNER.identity}|Who ${R.OWNER.name} is]]`,
  '- [[vault-capture-protocol|How to dump things in here]]',
  '- [[second-brain-architecture|How this vault works]]', '',
  '## Retrieval Layer', '',
  `- \`wiki/_index.tsv\` — **${sorted.length} rows**: path, title, topic, kind, status, aliases, tags, summary. Route here first.`,
  `- \`wiki/_cards.tsv\` — **${sorted.length} rows**: path, title, and the full Key Takeaways block. Pull exactly one row.`,
  `- \`wiki/_sections.tsv\` — **${secRows.length} rows**: path, heading, start line, end line, gist. Gives exact \`sed\` ranges with no discovery read.`,
  `- \`wiki/_links.tsv\` — **${uniqEdges.length} edges**: source, target. Neighbourhood expansion without reading articles.`,
  `- \`wiki/_mentions.tsv\` — **${mentionRows.length} rows**: person, date, log, line range, snippet. Every dated log entry that names or links someone.`,
  '', '**Never read any of these whole. Always grep.**', ''].join('\n');
// The master index predates the "Last updated" wording; accept either when
// reading back the previous date.
writeGenerated(path.join(WIKI, '_master-index.md'), renderMaster, /Last (?:updated|compiled) ([0-9-]+)\./);

// --- report ---
const cardBytes = sorted.map(n => Buffer.byteLength(n.card)).sort((a, b) => a - b);
const pct = p => cardBytes[Math.floor(cardBytes.length * p)] || 0;
console.log(`nodes:        ${nodes.length}`);
console.log(`by kind:      ${Object.entries(kindCounts).map(([k, v]) => `${k}=${v}`).join('  ')}`);
console.log(`by topic:     ${counts.map(([t, n]) => `${t}=${n}`).join('  ')}`);
console.log(`sections:     ${secRows.length}`);
console.log(`edges:        ${uniqEdges.length}`);
console.log(`mentions:     ${mentionRows.length} rows for ${new Set(mentionRows.map(r => r[0])).size} people`);
console.log(`tags:         ${new Set(nodes.flatMap(n => n.tags)).size} distinct, in ${new Set(nodes.flatMap(n => n.tags.map(t => t.split('/')[0]))).size} of ${Object.keys(R.TAG_FACETS).length} registered facets (D65)`);
console.log(`identifiers:  ${[...idNodes.values()].filter(c => c <= R.MAX_IDENTIFIER_NODES).length} routed from node text; ${[...idNodes.values()].filter(c => c > R.MAX_IDENTIFIER_NODES).length} shared ones left to aliases (D54)`);
console.log(`variants:     ${nSpell} US/UK spellings, ${nHyph} hyphen-free forms (D21, D60)`);
console.log(`media:        ${mediaByBase.size} images, ${Math.round(mediaBytes / 1024)} KB`);
console.log(`drawings:     ${drawings.size} under ${R.DRAWINGS_FOLDER}/, ${new Set(nodes.flatMap(n => n.drawingEmbeds || [])).size} embedded in nodes (D72)`);
console.log(`now:          ${open.length} open item(s)`);
console.log(`card bytes:   median ${pct(0.5)} | p90 ${pct(0.9)} | max ${cardBytes[cardBytes.length - 1]}  (~${Math.round(pct(0.5) / 4)} tok median)`);
console.log('');
if (warnings.length) console.log(`WARNINGS (${warnings.length}):\n` + warnings.map(w => '  - ' + w).join('\n'));
console.log(`write checks (D78): ${fences.length} fences replayed, people links, [sic] notes, ${R.OBSIDIAN_SETTINGS.length} Obsidian settings`);
if (problems.length) { console.log(`PROBLEMS (${problems.length}):`); problems.forEach(p => console.log('  - ' + p)); process.exitCode = 1; }
else console.log('PROBLEMS: none — frontmatter, structure, answer-surface caps, body caps, status, media and all links validate.');
