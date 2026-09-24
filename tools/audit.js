'use strict';
// Vault audit — the heuristics /vault-audit runs (.claude/skills/vault-audit):
// index consistency, routing probes, graph shape, query cost, status, pronouns,
// media, drawings. Run only when the owner asks (D78):  node tools/audit.js
//
// Routing probes use grepI() — exactly what the L0 route does (`grep -i`).
// Every other comparison goes through matches() from lib/text.js; do NOT
// hand-roll .toLowerCase().includes() here — selftest.js fails if you do.
// Every problem and watch message names the defect it guards (Dnn, see
// tools/DEFECTS.md), and selftest.js checks that citation is in code.

const fs = require('fs');
const path = require('path');
const { matches, spellingVariants, grepI } = require('./lib/text');
const V = require('./lib/vault');
const R = require('./lib/rules');

const VAULT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const WIKI = path.join(VAULT, 'wiki');
const rd = p => fs.readFileSync(p, 'utf8');
const tsv = n => rd(path.join(WIKI, n)).trim().split('\n').filter(Boolean).map(r => r.split('\t'));
const relOf = abs => path.relative(VAULT, abs).replace(/\\/g, '/');

const idx = tsv('_index.tsv');
const cards = tsv('_cards.tsv');
const links = tsv('_links.tsv');
const sections = tsv('_sections.tsv');
const mentions = fs.existsSync(path.join(WIKI, '_mentions.tsv')) ? tsv('_mentions.tsv') : [];
const allMd = V.walk(WIKI);
const nodeFiles = allMd.filter(p => !path.basename(p).startsWith('_'));
const problems = [], watch = [];
const H = s => console.log('\n' + s);
const _d = new Date();
const TODAY = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;

// Each node parsed once, the way the builder reads it (fences blanked, same sections).
const parsedNodes = nodeFiles.map(abs => {
  const text = rd(abs);
  const parsed = V.parseFm(text) || { fm: {}, fmLines: 0 };
  const lines = text.split('\n');
  const code = V.blankFences(lines);
  const heads = [];
  code.forEach((l, i) => { const m = l.match(/^(#{2,3})\s+(.+?)\s*$/); if (m) heads.push({ title: m[2], line: i + 1 }); });
  const nLines = V.lineCount(text);
  const secs = heads.map((h, i) => ({ ...h, start: h.line, end: i + 1 < heads.length ? heads[i + 1].line - 1 : nLines }));
  const kt = secs[0] && secs[0].title === 'Key Takeaways' ? secs[0] : null;
  return { abs, rel: relOf(abs), fm: parsed.fm, lines, code, secs, kt };
});

console.log(`VAULT AUDIT — ${TODAY}`);

// ---------------------------------------------------------------- 1. counts
H('1. COUNTS');
const byKind = {}, byTopic = {};
for (const r of idx) { byKind[r[3]] = (byKind[r[3]] || 0) + 1; byTopic[r[2]] = (byTopic[r[2]] || 0) + 1; }
console.log(`   nodes ${idx.length} · sections ${sections.length} · edges ${links.length} · mentions ${mentions.length}`);
console.log(`   by kind:  ${Object.entries(byKind).sort().map(([k, v]) => `${k}=${v}`).join('  ')}`);
console.log(`   by topic: ${Object.entries(byTopic).sort().map(([k, v]) => `${k}=${v}`).join('  ')}`);

// ------------------------------------------------------- 2. index consistency
H('2. INDEX CONSISTENCY');
const idxPaths = new Set(idx.map(r => r[0]));
const fsPaths = nodeFiles.map(relOf);
const noRow = fsPaths.filter(p => !idxPaths.has(p));
const ghost = [...idxPaths].filter(p => !fs.existsSync(path.join(VAULT, p)));
if (noRow.length) problems.push(`${noRow.length} file(s) with no index row — rebuild: ${noRow.join(', ')}`);
if (ghost.length) problems.push(`${ghost.length} index row(s) with no file — rebuild: ${ghost.join(', ')}`);
if (cards.length !== idx.length) problems.push(`cards rows ${cards.length} != index rows ${idx.length}`);
console.log(`   files without a row: ${noRow.length} · rows without a file: ${ghost.length} · cards==index: ${cards.length === idx.length}`);
// A compiled document keeps its exact words in a verbatim node that names it
// (D64). Only file names are listed here — raw/ is never read at query time,
// and a deleted raw/_compiled/ simply leaves nothing to check.
const compiledDir = path.join(VAULT, 'raw', '_compiled');
const docs = fs.existsSync(compiledDir) ? fs.readdirSync(compiledDir).filter(f => /\.(pdf|docx|pptx)$/i.test(f)) : [];
const fullTextOf = new Set(parsedNodes.filter(n => n.fm.verbatim === 'true').map(n => String(n.fm.source || '')));
const noFullText = docs.filter(f => !fullTextOf.has(f));
console.log(`   compiled documents with a verbatim node: ${docs.length - noFullText.length}/${docs.length}`);
if (noFullText.length) problems.push(`${noFullText.length} compiled document(s) have no verbatim node naming them in source: — their exact words live only in raw/ (D64): ${noFullText.join(', ')}`);
// raw/ outside _compiled/ is the inbox — daily notes, imports, dropped files.
// Anything waiting there is known only to raw/, which the wiki must not need (D68).
const waiting = V.walk(path.join(VAULT, 'raw'), ['.md', '.pdf', '.docx', '.pptx', '.txt', '.csv', '.html', '.png', '.jpg', '.jpeg'], d => d === R.RAW_COMPILED).map(p => path.relative(VAULT, p).replace(/\\/g, '/'));
console.log(`   captures waiting in raw/ to be compiled: ${waiting.length}`);
if (waiting.length) problems.push(`${waiting.length} capture(s) waiting in raw/ — they wait for /vault-compile, which compiles each into wiki/ and moves it to raw/${R.RAW_COMPILED}/ (D68): ${waiting.join(', ')}`);

// ------------------------------------------------------------ 3. alias probe
H('3. ALIAS / ROUTING PROBE');
const corpus = JSON.parse(rd(path.join(__dirname, 'probes.json')));
const idxBlob = rd(path.join(WIKI, '_index.tsv'));
const cardBlob = rd(path.join(WIKI, '_cards.tsv'));
const secBlob = rd(path.join(WIKI, '_sections.tsv'));
let total = 0, routable = 0;
const cardOnly = [], secOnly = [], unroutable = [];
for (const [group, terms] of Object.entries(corpus)) {
  if (group.startsWith('_')) continue;
  for (const t of terms) {
    total++;
    if (grepI(idxBlob, t)) routable++;
    else if (grepI(cardBlob, t)) cardOnly.push(`${group}:${t}`);
    else if (grepI(secBlob, t)) secOnly.push(`${group}:${t}`);
    else unroutable.push(`${group}:${t}`);
  }
}
console.log(`   ${total} terms · routable from _index.tsv by a literal grep -i: ${routable} (${Math.round(100 * routable / total)}%)`);
console.log(`   card-only: ${cardOnly.length} · section-only: ${secOnly.length} · unroutable: ${unroutable.length}`);
// Groups cover first-person phrasing, vault operating terms and vocabulary the owner uses the day they use it.
if (unroutable.length) problems.push(`${unroutable.length} unroutable term(s) — add aliases, or drop a probe for something the vault no longer has (D07, D08, D23, D46, D80): ${unroutable.join(', ')}`);
if (cardOnly.length) watch.push(`${cardOnly.length} term(s) reachable only via _cards.tsv: ${cardOnly.join(', ')}`);
if (secOnly.length) watch.push(`${secOnly.length} term(s) reachable only via _sections.tsv: ${secOnly.join(', ')}`);
// A US-spelling probe tests something only if the vault's own text (titles,
// summaries, aliases, tags, filenames) holds the BRITISH form and not the US one.
const prose = parsedNodes.map(n => {
  const list = x => (Array.isArray(x) ? x : x ? [x] : []).join(' ');
  return [n.fm.title, n.fm.summary, list(n.fm.aliases), list(n.fm.tags), path.basename(n.abs, '.md').replace(/-/g, ' ')].join(' ');
}).join('\n');
const hollow = (corpus.us_spelling || []).filter(t => matches(prose, t) || !spellingVariants(t).some(uk => matches(prose, uk)));
if (hollow.length) problems.push(`${hollow.length} us_spelling probe(s) test nothing — the vault's own text is not British-only for them (D21, D24): ${hollow.join(', ')}`);
// Routing completeness: the term must reach every node it is really about.
const must = corpus._must_route || {};
let mustOk = 0;
for (const [term, want] of Object.entries(must)) {
  const hits = new Set(idx.filter(r => grepI(r.join('\t'), term)).map(r => r[0]));
  const miss = want.filter(p => !hits.has(p));
  if (miss.length) problems.push(`must-route miss (D24): "${term}" does not reach ${miss.join(', ')}`);
  else mustOk++;
}
console.log(`   must-route: ${mustOk}/${Object.keys(must).length} terms reach every node they are about`);
// Nested tags cost nothing at L0 — `cut -f1,8` never prints the tags column —
// unless a facet name is itself a query term: then a bare grep for it pulls in
// every row carrying that facet (D65).
const queryTerms = new Set([
  ...Object.entries(corpus).filter(([g, v]) => !g.startsWith('_') && Array.isArray(v)).flatMap(([, v]) => v),
  ...Object.keys(must), ...(corpus._benchmark || []),
].map(t => String(t).toLowerCase()));
const facetNoise = Object.keys(R.TAG_FACETS).map(f => ({
  f, rows: idx.filter(r => grepI(r[6] || '', `${f}/`) && !grepI(r.filter((_, i) => i !== 6).join('\t'), f)).length,
}));
const clashing = facetNoise.filter(x => x.rows && queryTerms.has(x.f));
console.log(`   tag facets: ${facetNoise.length} · a bare grep for the facet name adds ${facetNoise.map(x => `${x.f} +${x.rows}`).join(', ')} · named like a probe term: ${clashing.length}`);
if (clashing.length) problems.push(`${clashing.length} tag facet(s) share a name with a probe or benchmark term, so that query now pulls every tagged row (D65): ${clashing.map(x => `${x.f}/ +${x.rows} rows`).join(', ')}`);
// Code identifiers (D54). The builder indexes those named in few nodes; these
// two checks catch what it cannot: an identifier only a log names (every job,
// table, class, script and path belongs in a node — § Source Independence),
// and one named so widely the builder leaves it to a deliberate alias.
const body = n => n.lines.slice(n.lines.indexOf('---', 1) + 1).join('\n');
const idHome = new Map(), idLog = new Map();
for (const n of parsedNodes) {
  const target = n.fm.kind === 'log' ? idLog : idHome;
  for (const id of V.codeIdentifiers(body(n))) {
    const k = id.toLowerCase();
    if (!target.has(k)) target.set(k, { id, where: new Set() });
    target.get(k).where.add(n.rel);
  }
}
const logOnly = [...idLog.values()].filter(x => !idHome.has(x.id.toLowerCase()) && !grepI(idxBlob, x.id)).map(x => `${x.id} (${[...x.where][0]})`);
const shared = [...idHome.values()].filter(x => x.where.size > R.MAX_IDENTIFIER_NODES && !grepI(idxBlob, x.id)).map(x => `${x.id} (${x.where.size} nodes)`);
console.log(`   code identifiers: ${idHome.size} named in nodes · ${logOnly.length} only in a log · ${shared.length} shared but unrouted`);
if (logOnly.length) problems.push(`${logOnly.length} identifier(s) named only in a log — capture each in the node that explains it (D54): ${logOnly.join(', ')}`);
if (shared.length) problems.push(`${shared.length} identifier(s) named in more than ${R.MAX_IDENTIFIER_NODES} nodes route nowhere — alias each on the node that explains it (D54): ${shared.join(', ')}`);

// ------------------------------------------------- 4. orphans and dead ends
H('4. GRAPH SHAPE');
const inb = {}, outb = {};
for (const [s, t] of links) { inb[t] = (inb[t] || 0) + 1; outb[s] = (outb[s] || 0) + 1; }
const orphans = idx.filter(r => !inb[r[0]]).map(r => r[0]);
const deadEnds = idx.filter(r => !outb[r[0]]).map(r => r[0]);
console.log(`   orphans (no inbound): ${orphans.length} · dead ends (no outbound): ${deadEnds.length}`);
if (orphans.length) problems.push(`${orphans.length} orphan(s) (D09): ${orphans.join(', ')}`);
if (deadEnds.length) problems.push(`${deadEnds.length} dead end(s) (D09): ${deadEnds.join(', ')}`);

// ------------------------------------- 5. answer-surface & body-size health
H('5. SIZE HEALTH');
// Bullets are counted with the builder's own parser, never by splitting the
// card on its separator — a takeaway that mentions a literal \n once counted
// as two bullets here and one there (D17, D42).
const bulletCount = new Map(parsedNodes.map(n => [n.rel, V.takeaways(n.lines, n.kt).bullets.length]));
const surf = cards.map(r => ({ p: r[0], n: bulletCount.get(r[0]) || 0, b: Buffer.byteLength(r[2] || '') }))
  .sort((a, b) => b.b - a.b);
const med = surf[Math.floor(surf.length / 2)].b;
console.log(`   answer surface: median ${med}b · max ${surf[0].b}b (cap ${R.MAX_CARD_BYTES})`);
// Over the cap is a PROBLEM, not a watch item — the builder enforces the same
// rule from the same constants (lib/rules.js), so the two tools cannot disagree.
const over = surf.filter(x => x.b > R.MAX_CARD_BYTES);
if (over.length) problems.push(`${over.length} answer surface(s) OVER the ${R.MAX_CARD_BYTES}b cap (D05, D17): ${over.map(x => `${x.p} (${x.b}b)`).join(', ')}`);
const tooMany = surf.filter(x => x.n > R.MAX_BULLETS);
if (tooMany.length) problems.push(`${tooMany.length} surface(s) over ${R.MAX_BULLETS} bullets (D05): ${tooMany.map(x => `${x.p} (${x.n})`).join(', ')}`);
const near = surf.filter(x => x.b <= R.MAX_CARD_BYTES && x.b > R.MAX_CARD_BYTES - R.NEAR_CAP_MARGIN);
if (near.length) watch.push(`${near.length} answer surface(s) within ${R.NEAR_CAP_MARGIN}b of the cap — the next overrun waiting to happen (D05): ${near.map(x => `${x.p} (${x.b}b)`).join(', ')}`);
const thinPeople = surf.filter(x => x.n < R.MIN_BULLETS && x.p.includes('/people/')).length;
// Logs (one card per month, however few entries) and the generated Now page
// are thin by nature; flagging them would train readers to ignore the watch list.
const kindOf = new Map(idx.map(r => [r[0], r[3]]));
const thinOther = surf.filter(x => x.n < R.MIN_BULLETS && !x.p.includes('/people/') && kindOf.get(x.p) !== 'log' && x.p !== R.NOW_PATH);
console.log(`   thin surfaces (<${R.MIN_BULLETS} bullets): ${thinPeople} people stubs (expected) · ${thinOther.length} other`);
if (thinOther.length) watch.push(`thin non-person node(s): ${thinOther.map(x => x.p).join(', ')}`);

// ---------------------------------------------- 6. frontmatter style drift
H('6. FRONTMATTER DRIFT (Obsidian trap)');
const block = [];
for (const p of allMd) {
  const m = rd(p).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (m && /^[a-z_]+:\s*\r?\n\s*- /m.test(m[1])) block.push(path.relative(WIKI, p).replace(/\\/g, '/'));
}
console.log(`   block-list frontmatter: ${block.length}${block.length ? ' — ' + block.join(', ') : ''}`);
console.log('   (all list forms parse; the builder also warns on any alias lost since the last commit)');

// ------------------------------------------------------- 7. query cost
// The prime directive, measured. Simulates the CLAUDE.md protocol with a
// literal grep -i: L0 = every _index.tsv row matching the term, cut to
// path+summary; L1 = the answer card of the first matching path. Tokens ≈ bytes / 4.
H('7. QUERY COST (prime directive)');
const bench = corpus._benchmark || [];
const cardByPath = new Map(cards.map(r => [r[0], r.join('\t') + '\n']));
const costs = [];
for (const term of bench) {
  const hits = idx.filter(r => grepI(r.join('\t'), term));
  if (!hits.length) { problems.push(`benchmark query routes nowhere (D22): "${term}"`); continue; }
  const l0 = hits.reduce((a, r) => a + Buffer.byteLength(`${r[0]}\t${r[7]}\n`), 0);
  const l1 = Buffer.byteLength(cardByPath.get(hits[0][0]) || '');
  const bytes = l0 + l1;
  costs.push({ term, bytes, tok: Math.round(bytes / 4), x: Math.round(R.BASELINE_BYTES / bytes), hits: hits.length });
}
if (costs.length) {
  const xs = costs.map(c => c.x).sort((a, b) => a - b);
  console.log(`   ${costs.length} benchmark queries · ${xs[0]}× – ${xs[xs.length - 1]}× cheaper than loading sources (median ${xs[Math.floor(xs.length / 2)]}×, target ≥ ${R.COST_TARGET_MIN_X}×)`);
  for (const c of costs.sort((a, b) => a.x - b.x)) {
    console.log(`     ${String(c.x).padStart(3)}×  ${String(c.tok).padStart(4)} tok  ${c.hits > 1 ? `(${c.hits} rows routed)` : '             '}  ${c.term}`);
  }
  const slow = costs.filter(c => c.x < R.COST_TARGET_MIN_X);
  if (slow.length) watch.push(`${slow.length} benchmark query(ies) below the ${R.COST_TARGET_MIN_X}× target — usually a term too broad for L0 (D06, D22): ${slow.map(c => `"${c.term}" ${c.x}×`).join(', ')}`);
} else {
  watch.push('no _benchmark queries in probes.json — query cost is unmeasured (D22)');
}

// ------------------------------------------------------- 8. status health
// Volatile status lives in one owner; the builder enforces placement. Here:
// open items nobody has touched for a while deserve a check-in.
H('8. STATUS (owners and Now)');
let owners = 0, openCount = 0;
for (const n of parsedNodes) {
  const log = V.parseStatusLog(n.lines, n.secs);
  if (!log || !log.length) continue;
  owners++;
  if (!R.OPEN_STATUSES.includes(String(n.fm.status || ''))) continue;
  openCount++;
  const last = log[log.length - 1].date;
  const age = Math.round((new Date(TODAY) - new Date(last)) / 864e5);
  if (age > R.STALE_STATUS_DAYS) watch.push(`open status untouched for ${age} days — ask ${R.OWNER.name} for an update (D30): ${n.rel} (last ${last})`);
}
console.log(`   status owners: ${owners} · open (on Now): ${openCount}`);

// ------------------------------------------------------- 9. pronouns
// Gendered pronouns must come from a stated `pronouns:` field, never a name.
// A person's own node counts in full; elsewhere, lines that name or link them.
// Heuristic, so it is a watch list for review, not a verdict.
H('9. PRONOUNS');
const persons = parsedNodes.filter(n => n.rel.includes('/people/') && path.basename(n.abs, '.md') !== R.OWNER.slug).map(n => {
  const aliases = Array.isArray(n.fm.aliases) ? n.fm.aliases : n.fm.aliases ? [n.fm.aliases] : [];
  return { slug: path.basename(n.abs, '.md'), pronouns: n.fm.pronouns || '', names: V.mentionNames(n.fm.title, aliases).map(x => V.nameRegex(x)) };
});
const scan = [...allMd, path.join(VAULT, 'HANDOFF.md'), ...V.walk(path.join(VAULT, 'output'))].filter(fs.existsSync);
const suspects = [];
for (const abs of scan) {
  const text = rd(abs);
  const parsed = V.parseFm(text);
  if (parsed && parsed.fm.verbatim === 'true') continue; // an author's own words, not ours
  const ownSlug = abs.replace(/\\/g, '/').includes('/people/') ? path.basename(abs, '.md') : null;
  text.split('\n').forEach((line, i) => {
    // Judged across everyone the line names, not one person at a time (D53).
    for (const slug of V.pronounSuspects(line, persons, ownSlug)) {
      const p = persons.find(x => x.slug === slug);
      suspects.push(`${relOf(abs)}:${i + 1} (${slug}, pronouns ${p.pronouns || 'not stated'})`);
    }
  });
}
const withPronouns = persons.filter(p => p.pronouns).length;
console.log(`   people with stated pronouns: ${withPronouns}/${persons.length} · lines to review: ${suspects.length}`);
if (suspects.length) watch.push(`${suspects.length} line(s) use a gendered pronoun that nobody the line names holds — check it is not assumed (D25, D36, D53): ${[...new Set(suspects)].slice(0, 15).join(', ')}`);

// ---------------------------------------------------------- 10. media
H('10. MEDIA');
const media = V.walk(WIKI, R.IMAGE_EXT.map(e => '.' + e));
const kb = Math.round(media.reduce((a, p) => a + fs.statSync(p).size, 0) / 1024);
console.log(`   ${media.length} image(s), ${kb} KB — never read at query time; every one is transcribed (the builder enforces it)`);

// ------------------------------------------------------------- 11. drawings
H('11. DRAWINGS');
// Drawings (D72). A node that embeds one records the hash its transcription
// was written from; a drawing edited since then is a capture still waiting.
// A drawing no node embeds is invisible to retrieval — fine for a sketch, a gap
// for one that holds knowledge, so it is a watch item.
{
  const X = require('./lib/excalidraw');
  const files = V.walk(path.join(VAULT, R.DRAWINGS_FOLDER), ['.md'], d => d.startsWith('.')).filter(X.isDrawingPath);
  const hashes = new Map();
  const lints = new Map();
  for (const f of files) {
    const p = X.parseDrawing(rd(f));
    if (p.error) problems.push(`drawing ${path.relative(VAULT, f).split(path.sep).join('/')} cannot be read: ${p.error} — open it in Obsidian or restore it from git (D72)`);
    else hashes.set(path.basename(f), X.sceneHash(p.scene));
    if (!p.error) {
      const errs = X.lint(p.scene).filter(l => l.level === 'error');
      if (errs.length) lints.set(path.basename(f), errs);
    }
    const misread = p.error ? [] : X.pluginReadProblems(rd(f));
    if (misread.length) problems.push(`drawing ${path.relative(VAULT, f).split(path.sep).join('/')} would load with the wrong words in Obsidian — give its text elements 8-character ids (node tools/excalidraw.js apply with an empty patch rewrites them) (D73): ${misread.join('; ')}`);
  }
  const embedded = new Set();
  const stale = [];
  for (const n of parsedNodes) {
    for (const e of V.drawingEmbeds(n.lines, n.secs)) {
      embedded.add(e.target);
      if (hashes.has(e.target) && e.recorded && e.recorded !== hashes.get(e.target)) stale.push(`${n.rel}:${e.line} (${e.target})`);
    }
  }
  console.log(`   drawings: ${files.length}, embedded in a node: ${[...hashes.keys()].filter(b => embedded.has(b)).length}, transcriptions behind their drawing: ${stale.length}, with layout errors: ${lints.size}`);
  if (stale.length) problems.push(`${stale.length} drawing transcription(s) older than the drawing — the drawing was edited after it was transcribed; update the transcription and its drawing-hash (node tools/excalidraw.js transcribe) (D72): ${stale.join(', ')}`);
  const messy = [...lints.keys()].filter(b => embedded.has(b));
  if (messy.length) watch.push(`${messy.length} embedded drawing(s) with layout errors — a figure retrieval depends on is misdrawn, and a label or connector may be unreadable; run node tools/excalidraw.js lint (D75): ${messy.map(b => `${b} (${lints.get(b).length}): ${lints.get(b)[0].msg.slice(0, 90)}`).join(' | ')}`);
  const loose = [...hashes.keys()].filter(b => !embedded.has(b));
  if (loose.length) watch.push(`${loose.length} drawing(s) embedded in no note, so retrieval cannot see them — embed and transcribe any that hold knowledge (D72): ${loose.join(', ')}`);
}

// ---------------------------------------------------------------- verdict
H('VERDICT');
if (problems.length) {
  console.log(`   ${problems.length} PROBLEM(S):`);
  problems.forEach(p => console.log('     - ' + p));
} else {
  console.log('   No problems. Index consistent, graph fully connected, all probe terms routable.');
}
if (watch.length) {
  console.log(`   ${watch.length} watch item(s):`);
  watch.forEach(w => console.log('     - ' + w));
}
process.exitCode = problems.length ? 1 : 0;
