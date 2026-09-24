'use strict';
// Vault-structure helpers shared by build-index.js, audit.js and selftest.js.
// Pure functions only — no file writes — so selftest can exercise every rule
// without building anything. Defect IDs (Dnn) refer to tools/DEFECTS.md.

const fs = require('fs');
const path = require('path');
const { norm } = require('./text');
const R = require('./rules');
const X = require('./excalidraw');

/** Every file under `dir` whose extension is in `exts` (lowercase, with dot). */
// `skip(name)` prunes a directory by name — used to walk the repo root for
// images that landed outside wiki/ (D52).
function walk(dir, exts = ['.md'], skip = () => false) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!skip(e.name)) out.push(...walk(p, exts, skip)); }
    else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

// Handles every YAML list form this vault meets (D02, D43):
//     aliases: [a, b]          inline flow list (possibly wrapped over lines)
//     aliases:                 block list, indented (Obsidian's rewrite) ...
//       - a
//     aliases:                 ... or unindented (PyYAML's default)
//     - a
// A parser that misses a form silently empties that note's index row — a
// retrieval outage with no error. Quoted scalars and items are unquoted.
function parseFm(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  const fm = {};
  const lines = m[1].split(/\r?\n/);
  const unquote = s => String(s).trim().replace(/^(["'])(.*)\1$/, '$2');
  for (let i = 0; i < lines.length; i++) {
    const k = lines[i].match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!k) continue;
    const key = k[1];
    let v = k[2].trim();
    if (v === '') {
      const items = [];
      let j = i + 1;
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) { items.push(unquote(lines[j].replace(/^\s*-\s+/, ''))); j++; }
      if (items.length) { fm[key] = items; i = j - 1; continue; }
      fm[key] = '';
      continue;
    }
    if (v.startsWith('[') && !v.endsWith(']')) {
      let j = i + 1;
      while (j < lines.length && !v.endsWith(']') && !/^[A-Za-z_]+:/.test(lines[j])) v += ' ' + lines[j++].trim();
      i = j - 1;
    }
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(unquote).filter(Boolean);
    else v = unquote(v);
    fm[key] = v;
  }
  return { fm, body: text.slice(m[0].length), fmLines: m[0].split('\n').length - 1 };
}

/**
 * Blank out fenced code blocks, keeping the line count so line numbers stay
 * true (D27). Follows CommonMark (D41): a fence closes only on a bare run of
 * the same character at least as long as the opener, so a ```` block can show
 * a ``` example. The returned array carries `.unclosed` — an unclosed fence
 * would otherwise blank the rest of the file without a word.
 */
function blankFences(lines) {
  let open = null;
  const out = lines.map(line => {
    // Match on the line without a trailing CR, so a CRLF file fences exactly
    // like its LF twin; the line itself is returned untouched (D76).
    const l = line.endsWith('\r') ? line.slice(0, -1) : line;
    if (!open) {
      const m = l.match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (!m || (m[1][0] === '`' && m[2].includes('`'))) return line;
      open = { ch: m[1][0], len: m[1].length };
      return '';
    }
    const c = l.match(/^\s*(`{3,}|~{3,})\s*$/);
    if (c && c[1][0] === open.ch && c[1].length >= open.len) open = null;
    return '';
  });
  out.unclosed = open !== null;
  return out;
}

/** Any image a person might drop in — only R.MEDIA_EXT are allowed, the rest are flagged (D44). */
const MEDIA_RE = new RegExp(`\\.(${R.IMAGE_EXT.join('|')})$`, 'i');

/** Blank inline code spans; a span closes only on a backtick run of equal length (CommonMark, D41). */
function blankInlineCode(text) {
  return String(text).replace(/(?<!`)(`+)(?!`)[^\n]*?(?<!`)\1(?!`)/g, m => ' '.repeat(m.length));
}

/**
 * Wikilinks in `text` (D28, D31, D35):
 *   [[note]]  [[note|label]]  [[note#Heading|label]]  [[#Heading]]  ![[note]]  -> links
 *   ![[img.png]]  ![[img.png|700]]  [[img.png]]                                -> media
 *   ![[flow.excalidraw|700]]  [[flow.excalidraw.md]]                           -> drawings (D72)
 * Inline code is an example, not a link — Obsidian renders it as code. A `\|`
 * escape (pipes inside tables) leaves a trailing backslash on the target; it is
 * stripped explicitly, not by Windows path semantics. A drawing's target is
 * its file's basename, `flow.excalidraw.md`, however the link spells it.
 */
function extractLinks(text) {
  const links = [], media = [], drawings = [];
  for (const m of blankInlineCode(text).matchAll(/(!?)\[\[([^\]]+?)\]\]/g)) {
    const inner = m[2].split('|')[0].trim().replace(/\\+$/, '');
    const hash = inner.indexOf('#');
    const target = (hash >= 0 ? inner.slice(0, hash) : inner).trim();
    const anchor = hash >= 0 ? inner.slice(hash + 1).trim() : '';
    const drawing = X.drawingLinkBase(target);
    if (drawing) drawings.push({ target: drawing, embed: m[1] === '!' });
    else if (MEDIA_RE.test(target)) media.push({ target: path.posix.basename(target), embed: m[1] === '!' });
    else links.push({ target, anchor, embed: m[1] === '!' });
  }
  return { links, media, drawings };
}

/**
 * Every embedded drawing in a node (D72), with the section it sits in and the
 * `<!-- drawing-hash: … -->` its transcription recorded (null when absent).
 * Embeds inside fenced code are examples and are skipped.
 */
function drawingEmbeds(lines, sections) {
  const code = blankFences(lines);
  const out = [];
  code.forEach((l, i) => {
    for (const d of extractLinks(l).drawings.filter(x => x.embed)) {
      const s = sections.find(x => x.start <= i + 1 && i + 1 <= x.end);
      const body = s ? lines.slice(s.start - 1, s.end).join('\n') : l;
      out.push({ target: d.target, line: i + 1, section: s ? s.title : null, recorded: X.hashComment(body) });
    }
  });
  return out;
}

/**
 * Media filenames must be `<owner-node-slug>--<desc>.<allowed ext>` so every
 * image names the node it belongs to. Returns the owner slug, or null.
 */
function mediaOwner(basename) {
  const m = String(basename).match(new RegExp(`^([a-z0-9]+(?:-[a-z0-9]+)*)--([a-z0-9]+(?:-[a-z0-9]+)*)\\.(${R.MEDIA_EXT.join('|')})$`));
  return m ? m[1] : null;
}

/**
 * Text is canonical, the image is a view (D33, D44). Every image reference —
 * embedded or linked, at a line start, in a callout, a list or mid-line — needs
 * MIN chars of real text in its section, per image in that section. References
 * inside fenced code are examples and are skipped.
 */
function untranscribed(lines, sections, min) {
  const code = blankFences(lines);
  const out = [];
  // An embedded drawing is a figure too: grep reads its transcription, never
  // the drawing (D72). A plain link to a drawing only points at the editable source.
  const figures = x => { const e = extractLinks(x); return [...e.media, ...e.drawings.filter(d => d.embed)]; };
  code.forEach((l, i) => {
    for (const md of figures(l)) {
      const s = sections.find(x => x.start <= i + 1 && i + 1 <= x.end);
      if (!s) { out.push({ target: md.target, line: i + 1, chars: 0, need: min }); continue; }
      const figs = code.slice(s.start, s.end).reduce((k, x) => k + figures(x).length, 0);
      const chars = lines.slice(s.start, s.end).filter(x => !/^\s*(`{3,}|~{3,})/.test(x)).join(' ')
        .replace(/<!--[\s\S]*?-->/g, ' ').replace(/!?\[\[[^\]]*\]\]/g, ' ').replace(/[#>*|`_-]+/g, ' ').replace(/\s+/g, ' ').trim().length;
      const need = min * Math.max(1, figs);
      if (chars < need) out.push({ target: md.target, line: i + 1, chars, need });
    }
  });
  return out;
}

/** 1-based line numbers containing C0 control characters other than tab/LF/CR (D03). */
function controlCharLines(text) {
  const out = [];
  String(text).split('\n').forEach((l, i) => { if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(l)) out.push(i + 1); });
  return out;
}

/** Number of lines in a file's text; a trailing newline does not add a line (D41). */
function lineCount(text) {
  const n = String(text).split('\n').length;
  return String(text).endsWith('\n') ? n - 1 : n;
}

/** Split a markdown table row on `|`, ignoring pipes inside [[...]] and `\|` escapes. */
function splitRow(line) {
  const cells = [];
  let cur = '', depth = 0;
  const s = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '[' && s[i + 1] === '[') { depth++; cur += '[['; i++; continue; }
    if (c === ']' && s[i + 1] === ']') { depth = Math.max(0, depth - 1); cur += ']]'; i++; continue; }
    if (c === '\\' && s[i + 1] === '|') { cur += '\\|'; i++; continue; }
    if (c === '|' && depth === 0) { cells.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

/** Is this a real calendar date written YYYY-MM-DD? (D40) */
function isRealDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

/**
 * Rows of a node's `## Status Log` table — `| YYYY-MM-DD | status | source |` —
 * in file order, or null if the node has no Status Log (D16). Header and
 * separator rows are skipped; any other row whose first cell is not a real
 * ISO date lands in `.bad`, so the builder can refuse it instead of crashing
 * or silently dropping it (D40).
 */
function parseStatusLog(lines, sections) {
  const s = sections.find(x => x.title === 'Status Log');
  if (!s) return null;
  const rows = [];
  rows.bad = [];
  for (const l of lines.slice(s.start, s.end)) {
    if (!/^\s*\|/.test(l)) continue;
    const c = splitRow(l);
    if (/^[-:\s]+$/.test(c[0]) || !/\d/.test(c[0])) continue;
    if (isRealDate(c[0])) rows.push({ date: c[0], status: c[1] || '', source: c[2] || '' });
    else rows.bad.push(l.trim());
  }
  return rows;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The ways a date is written in this vault: 2026-09-10, 10 September 2026, 10 Sep 2026, 10-Sep-26. */
function dateForms(iso) {
  if (!isRealDate(iso)) return [String(iso)];
  const [y, m, d] = iso.split('-').map(Number);
  const M = MONTHS[m - 1];
  return [iso, `${d} ${M} ${y}`, `${d} ${M.slice(0, 3)} ${y}`, `${d}-${M.slice(0, 3)}-${String(y).slice(2)}`];
}

/** "10 Sep 2026" — the compact human form used on the Now page. */
function shortDate(iso) { return dateForms(iso)[2] || iso; }

/** The heading a dated log entry must carry: `2026-09-10 (10-Sep-26)` (D48). */
function logHeading(iso) { return `${iso} (${dateForms(iso)[3]})`; }

/**
 * Level-3 headings in a log that are not dates (D88). In a log every `###`
 * opens a day, and a day's `_sections.tsv` range ends at the next one, so a
 * `### Figure 1` inside an entry would cut the rest of that day out of it.
 * Subsections of an entry use `####`.
 */
function strayLogHeadings(heads) { return heads.filter(h => h.lvl === 3 && !/^\d{4}-\d{2}-\d{2}/.test(h.title)); }

/** A whole number from 0 to 999 in words, as prose writes it: 88 → "eighty-eight" (D89). */
function numberWords(n) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const under100 = x => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? '-' + ones[x % 10] : ''));
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n);
  if (n < 100) return under100(n);
  return `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ' and ' + under100(n % 100) : ''}`;
}

/**
 * The credit block's defect count, kept equal to the ledger (D89). It was typed
 * by hand as "seventy-seven" and stood there while the ledger reached 88.
 * Returns the text with the count set, or null when the credit phrase is gone.
 */
const CREDIT_COUNT = /(defect discipline with its\s+)([a-z]+(?:[- ][a-z]+)*?)(\s+(?:>\s*)?mechanically guarded defects)/;
/** How many ledger rows the template shipped: IDs below `ownerFrom` (D89). */
function templateDefects(ledger, ownerFrom = Infinity) {
  return (String(ledger).match(/^\| D(\d+) \|/gm) || []).map(r => Number(r.match(/\d+/)[0])).filter(n => n < ownerFrom).length;
}
function creditCount(text, rows) {
  if (!CREDIT_COUNT.test(text)) return null;
  return text.replace(CREDIT_COUNT, (m, a, w, b) => a + numberWords(rows) + b);
}

/**
 * CLAUDE.md is Claude Code's entry point and nothing more (D90): it imports
 * AGENTS.md, the manual every other agent reads, and adds only Claude-only
 * lines. A second copy of the manual here would drift from the one Codex reads,
 * so a heading that AGENTS.md also has is a problem, and so is a missing import.
 */
function shimProblems(claudeText, agentsText) {
  const out = [];
  // Anchored to the start of the file, not any line: text above the import would
  // make CLAUDE.md more than the entry point (D90).
  if (!/^﻿?\s*@AGENTS\.md[ \t]*(?:\r?\n|$)/.test(String(claudeText))) out.push('CLAUDE.md does not import the manual — its first line must be @AGENTS.md');
  const heads = t => new Set(blankFences(String(t).split('\n')).filter(l => /^#{1,3} /.test(l)).map(l => l.replace(/^#+\s*/, '').trim()));
  const manual = heads(agentsText);
  const dup = [...heads(claudeText)].filter(h => manual.has(h));
  if (dup.length) out.push(`CLAUDE.md repeats the manual's section(s) ${dup.map(h => `"${h}"`).join(', ')} — keep them only in AGENTS.md`);
  return out;
}

/**
 * The template's AGENTS.md carries a note for agents working on the template
 * itself (D93). Setup removes it; left in a vault it would tell the owner's
 * agent that the manual is not its brief. A vault is told apart from the
 * template by its filled-in owner name.
 */
const TEMPLATE_ONLY = /<!-- template-only[\s\S]*?<!-- \/template-only -->\n?/;
function templateOnlyLeft(agentsText) {
  const t = String(agentsText);
  return TEMPLATE_ONLY.test(t) && !t.includes('{{OWNER_NAME}}');
}

/** Does a takeaway carry this ISO date in any of the vault's forms — as a whole date, not a substring? (D40) */
function mentionsDate(text, iso) {
  const t = norm(text);
  return dateForms(iso).some(f => new RegExp(`(?<![0-9])${norm(f).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![0-9])`).test(t));
}

/**
 * Lines stating volatile status (D16). Returns [{line, text}] for lines that
 * match a marker and do not carry the explicit `<!-- historical -->` waiver.
 */
function volatileHits(lines) {
  const out = [];
  lines.forEach((l, i) => {
    if (/<!--\s*historical\s*-->/.test(l)) return;
    if (R.VOLATILE_MARKERS.some(re => re.test(l))) out.push({ line: i + 1, text: l.trim().slice(0, 110) });
  });
  return out;
}

/**
 * The answer surface (D42): bullets under `## Key Takeaways`, written with -, *
 * or +; an indented line continues the bullet above it. Anything else there
 * (callouts excepted) is `stray` — it would silently fall out of the card.
 * One parser, used by the builder and the audit alike (D17).
 */
function takeaways(lines, kt) {
  const bullets = [], stray = [];
  if (!kt) return { bullets, stray };
  for (const l of lines.slice(kt.start, kt.end)) {
    if (/^[-*+]\s+/.test(l)) bullets.push(l.replace(/^[-*+]\s+/, '').trim());
    else if (/^\s+\S/.test(l) && bullets.length && !/^\s*>/.test(l)) bullets[bullets.length - 1] += ' ' + l.trim();
    else if (l.trim() && !/^\s*>/.test(l)) stray.push(l.trim());
  }
  return { bullets, stray };
}

/**
 * Proper-name forms of a person, for the mention index (D45): the title plus
 * any alias whose every word is capitalised — Unicode letters and internal
 * capitals allowed (Zoë, McDonald, O'Brien), initials allowed (J.D.T). Role
 * phrases ("the pilot POC", "my team lead") and acronyms are excluded.
 */
function mentionNames(title, aliases) {
  const word = w => /^(?:\p{Lu}\.){1,3}\p{Lu}?\.?$/u.test(w) || /^\p{Lu}$/u.test(w)
    || (/^\p{Lu}[\p{L}’'.-]*$/u.test(w) && /\p{Ll}/u.test(w));
  return [...new Set([title, ...(aliases || [])].map(s => String(s || '').trim())
    .filter(s => /^\p{Lu}/u.test(s) && s.split(/\s+/).every(word)))];
}

/** Case-sensitive, whole-word matcher for a name ("Sam" must not hit "same" or "Samsung"). */
function nameRegex(name, flags = 'u') {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, flags);
}

/** Flatten wikilinks to their labels and drop bold markers, for snippets and name matching. */
function flattenLinks(s) {
  return String(s).replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/\*\*/g, '');
}

/**
 * People mentioned in one dated log entry (D45). An explicit link is the
 * surest mention whatever its label says; then proper names, longest first,
 * each matched span blanked so a shorter alias belonging to someone else
 * cannot claim it. `matchers` are {name, slug}; `personSlugs` is a Set.
 * Returns [{slug, snippet}] with at most one row per person.
 */
function findMentions(raw, matchers, personSlugs) {
  const out = [], seen = new Set();
  for (const l of extractLinks(raw).links) {
    const slug = path.posix.basename(l.target);
    if (!personSlugs.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    const k = Math.max(0, raw.indexOf('[[' + l.target));
    out.push({ slug, snippet: flattenLinks(raw.slice(Math.max(0, k - 45), k + 110)) });
  }
  const display = flattenLinks(raw);
  let scan = display;
  for (const mt of [...matchers].sort((a, b) => b.name.length - a.name.length)) {
    const m = nameRegex(mt.name).exec(scan);
    if (!m) continue;
    if (!seen.has(mt.slug)) {
      seen.add(mt.slug);
      out.push({ slug: mt.slug, snippet: display.slice(Math.max(0, m.index - 45), Math.min(display.length, m.index + m[0].length + 55)) });
    }
    scan = scan.replace(nameRegex(mt.name, 'gu'), x => ' '.repeat(x.length));
  }
  return out;
}

/**
 * A gendered pronoun written about someone whose pronouns were never stated
 * (D25, D36). A line counts if it names the person, links to them, or sits on
 * their own node. A line that also names the owner is read with the owner's
 * stated pronouns, so those forms are explained there and every other gendered
 * form still counts. Possessive "his" is left out on purpose: in Vifert's vault,
 * where this was built, it was almost always his own ("his team", "his onshore
 * lead"), and a check that is mostly noise trains people to ignore it (D36).
 */
const FEM = /\b(she|her|hers|herself)\b/i;
const MASC = /\b(he|him|himself)\b/i;
/** The owner as the pronoun checks see them — a name matcher and their stated pronouns (R.OWNER). */
function ownerOf(o = R.OWNER) {
  return { re: o && o.name ? nameRegex(o.name) : /(?!)/, pronouns: (o && o.pronouns) || '' };
}
function pronounHit(line, person, ownNode, owner = ownerOf()) {
  if (!ownNode && !person.names.some(re => re.test(line)) && !line.includes(`[[${person.slug}`)) return false;
  const byOwner = owner.re.test(line) ? owner.pronouns : '';
  const fem = FEM.test(line) && person.pronouns !== 'she/her' && byOwner !== 'she/her';
  const masc = MASC.test(line) && person.pronouns !== 'he/him' && byOwner !== 'he/him';
  return fem || masc;
}

/**
 * The same check across everyone a line names (D53). Once every person had
 * stated pronouns, judging one person at a time flagged "Maya told
 * Ravi she would send it" against Ravi. A pronoun is explained when
 * anyone named on the line — or the node's own person — holds it, and a
 * pronoun set written as notation ("she/her") is not a pronoun at all.
 * Returns the slugs to review.
 */
const PRONOUN_SET = /\b(?:she\/her|he\/him|they\/them)\b/gi;
function pronounSuspects(line, persons, ownSlug, owner = ownerOf()) {
  const text = String(line).replace(PRONOUN_SET, ' ');
  const named = persons.filter(p => p.slug === ownSlug || p.names.some(re => re.test(text)) || text.includes(`[[${p.slug}`));
  if (!named.length) return [];
  const byOwner = owner.re.test(text) ? owner.pronouns : '';
  const fem = FEM.test(text) && byOwner !== 'she/her' && !named.some(p => p.pronouns === 'she/her');
  const masc = MASC.test(text) && byOwner !== 'he/him' && !named.some(p => p.pronouns === 'he/him');
  return named.filter(p => (fem && p.pronouns !== 'she/her') || (masc && p.pronouns !== 'he/him')).map(p => p.slug);
}

/**
 * [sic] says "the error is the source's, and the right form is certain". A
 * note that instead cites another place in the same source giving a different
 * value is a contradiction, and [sic] silently picks a side: in the reference
 * vault a paper's disputed figure got [sic] on the very value its author later
 * confirmed (D51). Such a note must name who resolved it ("per <owner>,
 * <date>"); until someone
 * does, the right marker is a neutral [added: …] note on each side.
 * Returns the offending [sic …] brackets on a line.
 */
const SIC_NOTE = /\[sic\b[^\]]*\]/gi;
const SOURCE_PLACE = /§|\b(?:Table|Fig\.?|Figure|section|conclusion|abstract|elsewhere)\b/i;
const GIVES = /\b(?:gives?|says?|states?|reports?|prints?|lists?)\b/i;
function sicTakesSide(line) {
  return (String(line).match(SIC_NOTE) || []).filter(b => SOURCE_PLACE.test(b) && GIVES.test(b) && !/\bper\b/i.test(b));
}

/**
 * Code identifiers named in a node's text (D54): snake_case and FILE.ext
 * anywhere, camelCase and PascalCase only inside `code` spans (in prose they
 * are mostly product names — BigQuery, LinkedIn — that aliases already cover).
 * Wikilinks and URLs are skipped. The builder indexes these so a question
 * about `build_order_history` routes like one about any alias.
 */
// Hyphens may join the parts too, as long as there is an underscore: the first
// version stopped at a hyphen and indexed `hbase_bt_ingest` for the DAG
// `crm-e1-hbase_bt_ingest`, so the name as written routed nowhere (D62).
const ID_SNAKE = /\b[A-Za-z][A-Za-z0-9]*(?:[-_][A-Za-z0-9]+)*_[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*\b/g;
const ID_FILE = /\b[\w-]+(?:\.[\w-]+)*\.(?:scala|py|sh|sql|hql|json|conf|yaml|yml|jar|csv|properties|java|js|ts|ipynb|pkl|h5|parquet)\b/g;
const ID_CAMEL = /\b[a-z]+(?:[A-Z][a-z0-9]*)+\b|\b[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+\b/g;
function codeIdentifiers(text) {
  const out = new Set();
  const t = String(text).replace(/!?\[\[[^\]]*\]\]/g, ' ').replace(/https?:\/\/\S+/g, ' ');
  for (const re of [ID_SNAKE, ID_FILE]) for (const m of t.matchAll(re)) out.add(m[0]);
  for (const span of t.matchAll(/`([^`\n]+)`/g)) for (const m of span[1].matchAll(ID_CAMEL)) out.add(m[0]);
  return [...out];
}

/**
 * A takeaway must stand alone (D57): one that opens with a bare pronoun — "It
 * is not the same thing as a dry-run", "He chose Python" — means nothing once
 * the bullet is quoted without its title. Returns the opening word, or null.
 */
const OPENING_PRONOUN = /^\s*[-*+]\s+(?:\*\*|_|\*)?\s*(It|Its|It's|He|His|Him|She|Her|They|Their|Them|This|These|That|Those)\b/;
function openingPronoun(line) {
  const m = String(line).match(OPENING_PRONOUN);
  return m ? m[1] : null;
}

/**
 * Why a node's tags break the faceted-tag rule (D65), as messages; [] when
 * they are fine. Tags are `facet/value` with a registered facet and a
 * kebab-case value that is not a date, a status, a relative word, a synonym,
 * or a restatement of the node's own topic or kind.
 */
const TAG_SHAPE = /^([a-z]+)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
function tagProblems(tags, topic, kind) {
  const out = [];
  const restated = new Set([topic, kind, ...Object.keys(R.KIND_SUBFOLDERS), R.MEDIA_SUBFOLDER].filter(Boolean).map(singular));
  const volatile = new Set([...R.OPEN_STATUSES, ...R.CLOSED_STATUSES, ...R.RELATIVE_LOG_ALIASES].map(x => x.replace(/ /g, '-')));
  for (const t of tags) {
    const m = String(t).match(TAG_SHAPE);
    if (!m) { out.push(`"${t}" is not facet/value in lowercase kebab-case`); continue; }
    const [, facet, value] = m;
    if (!Object.prototype.hasOwnProperty.call(R.TAG_FACETS, facet)) out.push(`"${t}" uses unregistered facet "${facet}/" — one of ${Object.keys(R.TAG_FACETS).join(', ')}`);
    if (/^\d{4}(?:-\d{2}){0,2}$/.test(value) || volatile.has(value)) out.push(`"${t}" is a date or status, which changes — folders and Status Logs carry those`);
    if (restated.has(singular(value)) || (R.TOPIC_IMPLIED_TAGS[topic] || []).includes(t)) out.push(`"${t}" restates the node's own topic or kind`);
    if (Object.prototype.hasOwnProperty.call(R.TAG_SYNONYMS, value)) out.push(`"${t}" is a synonym — use ${facet}/${R.TAG_SYNONYMS[value]}`);
  }
  return out;
}
function singular(v) { return String(v).toLowerCase().replace(/-/g, '').replace(/(?:es|s)$/, ''); }

/**
 * Inline `#tags` in body lines (fences already blanked). Obsidian counts them
 * as tags too, so they obey the same facets (D65). Headings, `[[note#Heading]]`
 * anchors and URL fragments are not preceded by whitespace and a letter.
 */
function inlineTags(lines) {
  const out = [];
  for (const l of lines) for (const m of blankInlineCode(l).matchAll(/(?:^|[\s(])#([A-Za-z][\w/-]*)/g)) out.push(m[1]);
  return out;
}

/**
 * Key paths in a parsed settings object that hold a secret (D66): a non-empty
 * string under a secret-like key, or any string shaped like a known token.
 * Values are never returned — only where they are.
 */
function secretSettings(obj, at = '') {
  const out = [];
  if (Array.isArray(obj)) obj.forEach((v, i) => out.push(...secretSettings(v, `${at}[${i}]`)));
  else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const p = at ? `${at}.${k}` : k;
      if (typeof v === 'string' && v.trim() && (R.SECRET_SETTING_KEY.test(k) || R.SECRET_VALUE_SHAPE.test(v.trim()))) out.push(p);
      else out.push(...secretSettings(v, p));
    }
  }
  return out;
}

/**
 * Protected lines of the committed version that the working copy no longer
 * holds, in order (D67). New lines anywhere are fine; whitespace, including a
 * table re-padded by an editor, is ignored. What is protected depends on
 * `scope`: for a `log`, the dated entries — a `### YYYY-MM-DD` heading and
 * everything under it — since the takeaways and notes above them are a
 * summary that must change as entries arrive; for `verbatim`, the whole body
 * except `## Key Takeaways` and `## Related`, which the agent writes.
 */
function rewrittenLines(headText, curText, scope = 'verbatim') {
  const body = t => {
    const lines = String(t).split(/\r?\n/);
    const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
    // A log protects only what sits under a dated heading; a verbatim node
    // protects everything except its two agent-written sections.
    let keep = scope !== 'log';
    return lines.map((l, i) => {
      const h = l.match(/^(#{1,3})\s+(.*?)\s*$/);
      if (h && scope === 'log') keep = /^\d{4}-\d{2}-\d{2}\b/.test(h[2]);
      else if (h && h[1] === '##') keep = !['Key Takeaways', 'Related'].includes(h[2]);
      const on = i > end && keep;
      return { n: i + 1, raw: l, key: on ? l.replace(/\s*\|\s*/g, '|').replace(/:?-{3,}:?/g, '---').replace(/\s+/g, ' ').trim() : '' };
    });
  };
  const cur = body(curText).map(x => x.key).filter(Boolean);
  const out = [];
  let at = 0;
  for (const h of body(headText)) {
    if (!h.key) continue;
    const i = cur.indexOf(h.key, at);
    if (i < 0) out.push({ line: h.n, text: h.raw.trim() });
    else at = i + 1;
  }
  return out;
}

/**
 * Why a vault-relative markdown path sits somewhere no index reads (D68), or
 * null when its place is fine. wiki/ nodes are validated elsewhere; this
 * catches plugin-made notes: a daily note at the root, an import folder, a
 * drawing inside wiki/.
 */
function strayNote(rel) {
  const parts = String(rel).split('/');
  const base = parts[parts.length - 1];
  if ((R.NESTED_VAULTS || []).includes(parts[0])) return null; // D84
  if (base.endsWith(R.DRAWING_SUFFIX)) {
    return parts[0] === R.DRAWINGS_FOLDER ? null
      : `Excalidraw drawing outside ${R.DRAWINGS_FOLDER}/ — move it to ${R.DRAWINGS_FOLDER}/<topic>/; a node that needs it embeds the drawing itself, transcribed with its drawing-hash (D72)`;
  }
  if (parts[0] === 'wiki') return null;
  if (parts.length === 1) return R.ROOT_NOTES.includes(base) ? null : 'note at the vault root — plugin default? Daily notes belong in raw/daily/, imports in raw/, knowledge in wiki/';
  if (R.NOTE_HOMES.includes(parts[0])) return null;
  if (parts[0] === R.DRAWINGS_FOLDER) return `plain note in ${R.DRAWINGS_FOLDER}/, which holds drawings only`;
  return `note in ${parts[0]}/, a folder no index reads — imports and captures go to raw/ for compile, knowledge to wiki/`;
}

/**
 * The Obsidian settings in `list` (rules.js OBSIDIAN_SETTINGS) that no longer
 * hold (D69). `load(file)` returns the parsed JSON or null when the file is
 * missing; a missing file counts as drift, since Obsidian then falls back to
 * the defaults the setting exists to override.
 */
function settingDrift(list, load, isInstalled = () => true) {
  const out = [];
  for (const s of list) {
    // A plugin's settings mean nothing until the plugin is installed (D79);
    // the id comes from the file path, so no table field can fall out of step.
    const m = String(s.file).match(/^\.obsidian\/plugins\/([^/]+)\//);
    if (m && !isInstalled(m[1])) {
      if (s.required) out.push({ ...s, have: undefined, missingPlugin: m[1] });
      continue;
    }
    const data = load(s.file);
    const have = data == null ? undefined : String(s.path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);
    // `contains`: a list or object setting must include this JSON fragment.
    const holds = 'contains' in s ? have !== undefined && JSON.stringify(have).includes(JSON.stringify(s.contains).slice(1, -1)) : have === s.want;
    if (!holds) out.push({ ...s, have });
  }
  return out;
}

/**
 * Line numbers of Code Styler ```reference blocks (D68). Such a block shows
 * code read from another file or downloaded at render time, so the text lives
 * outside the note — invisible to grep, and gone when the source goes.
 */
function referenceBlocks(lines) {
  return lines.map((l, i) => (/^\s*(?:`{3,}|~{3,})\s*reference\b/.test(l) ? i + 1 : 0)).filter(Boolean);
}

/** Pairs of tags in one facet that differ only by hyphens or a plural ending (D65). */
function nearDuplicateTags(tags) {
  const seen = new Map(), out = [];
  for (const t of [...new Set(tags)].sort()) {
    const m = String(t).match(TAG_SHAPE);
    if (!m) continue;
    const key = `${m[1]}/${singular(m[2])}`;
    if (seen.has(key)) out.push([seen.get(key), t]); else seen.set(key, t);
  }
  return out;
}

// Every folder carries an Iconize icon, by path or by a name rule (D69).
// Dot-folders and node_modules are not the owner's folders.
/**
 * Files every session loads, over their token budget (bytes / 4, D87). A
 * warning, never a failure: the remedy is to move detail out, never to delete
 * or compress it to fit — a size cap applied to content is how D01 lost 78
 * dated entries.
 */
function overBudget(vaultAbs, budgets) {
  return Object.entries(budgets || {}).map(([file, budget]) => {
    const p = path.join(vaultAbs, file);
    return fs.existsSync(p) ? { file, tokens: Math.round(fs.statSync(p).size / 4), budget } : null;
  }).filter(x => x && x.tokens > x.budget);
}

function iconlessFolders(vaultAbs, icons, exempt = []) {
  const rules = ((icons.settings || {}).rules || []).filter(r => r.for !== 'files')
    .map(r => { try { return new RegExp(r.rule); } catch { return null; } }).filter(Boolean);
  const dirs = [];
  const walkDirs = (abs, rel) => {
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
      if (!rel && exempt.includes(e.name)) continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      dirs.push(r);
      walkDirs(path.join(abs, e.name), r);
    }
  };
  walkDirs(vaultAbs, '');
  return dirs.filter(d => !icons[d] && !rules.some(re => re.test(d.split('/').pop())));
}

module.exports = {
  iconlessFolders, overBudget, strayLogHeadings, numberWords, creditCount, templateDefects, shimProblems, templateOnlyLeft, TEMPLATE_ONLY, sicTakesSide, codeIdentifiers, openingPronoun, tagProblems, nearDuplicateTags, inlineTags, secretSettings, rewrittenLines, strayNote, settingDrift, referenceBlocks,
  walk, parseFm, blankFences, blankInlineCode, extractLinks, drawingEmbeds, mediaOwner, untranscribed, controlCharLines, lineCount,
  splitRow, isRealDate, parseStatusLog, dateForms, shortDate, logHeading, mentionsDate, volatileHits, takeaways,
  mentionNames, nameRegex, flattenLinks, findMentions, ownerOf, pronounHit, pronounSuspects, MONTHS, norm,
};
