'use strict';
// The benchmark's scoring, as pure functions over a built vault's index. The
// query ladder is run mechanically — L0 route, the best card, one section if the
// budget allows — and gold questions name facts, never nodes, so a method that
// restructures the graph competes on equal terms (see bench/README.md).

const { grepI, matches } = require('./text');

const tokens = bytes => Math.round(bytes / 4);
const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : 0);
const median = xs => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

// A fact is a string, matched through the vault's one normaliser (D10) — so
// case, accents, dash and quote styles never decide a score — or { re: "pattern" }.
function hasFact(text, fact) {
  if (fact && typeof fact === 'object' && fact.re) return new RegExp(fact.re, 'i').test(String(text));
  return matches(text, fact);
}

// L0: rows matching any term. A reader of `cut -f1,8` sees only the path and
// the summary, and picks the node named for the term over one that mentions it
// in passing, so each term weighs 3 in the path or title, 2 in the summary, 1
// anywhere else in the row (D81). Ties keep index order, which the builder
// sorts, so the result is deterministic.
function route(idx, terms) {
  const hits = [];
  idx.forEach((row, i) => {
    const line = row.join('\t');
    const name = `${row[0].replace(/-/g, ' ')}\t${row[1] || ''}`;
    const score = terms.reduce((a, t) => a + (!grepI(line, t) ? 0 : grepI(name, t) ? 3 : grepI(row[7] || '', t) ? 2 : 1), 0);
    if (score) hits.push({ row, score, i });
  });
  return hits.sort((a, b) => b.score - a.score || a.i - b.i);
}

// The dated rung (CLAUDE.md § Query Protocol): a question carrying a date goes
// to _sections.tsv, whose log headings hold both date spellings, and reads the
// matching ranges within budget — never the node table (D82).
const DATE_TERM = /^(\d{4}-\d{2}-\d{2}|\d{1,2}-[A-Za-z]{3}-\d{2})$/;
function datedRung(q, { sections, readLines }) {
  const dates = (q.terms || []).filter(t => DATE_TERM.test(t));
  const rows = dates.length ? sections.filter(s => dates.some(d => grepI(s[1], d))) : [];
  if (!rows.length) return null;
  let bytes = rows.reduce((a, s) => a + Buffer.byteLength(s.join('\t') + '\n'), 0);
  const budget = (q.budget || 600) * 4;
  let text = '', first = '';
  for (const s of rows) {
    const body = readLines(s[0], Number(s[2]), Number(s[3]));
    if (text && bytes + Buffer.byteLength(body) > budget) break;
    bytes += Buffer.byteLength(body); text += body; first = first || body;
  }
  return { bytes, text, firstCard: first, routed: true };
}

function ladder(q, { idx, cards, sections, readLines }) {
  const dated = datedRung(q, { sections, readLines });
  if (dated) return dated;
  const hits = route(idx, q.terms || []);
  if (!hits.length) return { bytes: 0, text: '', firstCard: '', routed: false };
  let bytes = hits.reduce((a, h) => a + Buffer.byteLength(`${h.row[0]}\t${h.row[7] || ''}\n`), 0);
  const best = hits[0].row[0];
  const firstCard = cards.get(best) || '';
  bytes += Buffer.byteLength(firstCard);
  let text = firstCard;
  // Stop at the first rung that answers (CLAUDE.md § Query Protocol, D81).
  const facts = q.facts || [];
  if (facts.length && facts.every(f => hasFact(firstCard, f))) return { bytes, text, firstCard, routed: true };
  const budget = (q.budget || 600) * 4;
  const candidates = sections
    .filter(s => s[0] === best && s[1] !== 'Key Takeaways')
    .map(s => ({ s, body: readLines(best, Number(s[2]), Number(s[3])) }))
    .map(x => ({ ...x, score: (q.terms || []).filter(t => grepI(x.body, t)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.s[2]) - Number(b.s[2]));
  if (candidates.length) {
    const extra = Buffer.byteLength(candidates[0].body);
    if (bytes + extra <= budget) { bytes += extra; text += '\n' + candidates[0].body; }
  }
  return { bytes, text, firstCard, routed: true };
}

function scoreQuestion(q, r, baselineBytes) {
  const facts = q.facts || [], forbid = q.forbid || [];
  return {
    id: q.id,
    routed: r.routed,
    firstHit: facts.some(f => hasFact(r.firstCard, f)),
    facts: facts.length,
    found: facts.filter(f => hasFact(r.text, f)).length,
    forbidden: forbid.filter(f => hasFact(r.text, f)).length,
    tokens: tokens(r.bytes),
    ratio: r.bytes ? Math.round(baselineBytes / r.bytes) : 0,
  };
}

function graphHealth(idx, links) {
  const nodes = idx.map(r => r[0]);
  const inb = new Set(links.map(l => l[1])), outb = new Set(links.map(l => l[0]));
  const aliases = idx.reduce((a, r) => a + String(r[5] || '').split(',').map(s => s.trim()).filter(Boolean).length, 0);
  const n = nodes.length;
  return {
    nodes: n,
    orphans: nodes.filter(p => !inb.has(p)).length,
    deadEnds: nodes.filter(p => !outb.has(p)).length,
    linksPerNode: n ? Math.round((100 * links.length) / n) / 100 : 0,
    aliasesPerNode: n ? Math.round((100 * aliases) / n) / 100 : 0,
  };
}

// Tag-facet violations are not scored: the scorer refuses any vault that does
// not build clean, and the build fails on every violation, so it is always zero.
function scorecard(per, graph) {
  const ratios = per.filter(p => p.ratio).map(p => p.ratio);
  const facts = per.reduce((a, p) => a + p.facts, 0), found = per.reduce((a, p) => a + p.found, 0);
  return {
    questions: per.length,
    build: 'clean',
    cost: { median: median(ratios), min: ratios.length ? Math.min(...ratios) : 0, max: ratios.length ? Math.max(...ratios) : 0 },
    routing: pct(per.filter(p => p.firstHit).length, per.length),
    fidelity: pct(found, facts),
    forbidden: per.reduce((a, p) => a + p.forbidden, 0),
    graph,
    perQuestion: per,
  };
}

function table(c, against) {
  const rows = [
    ['Cost (median ×)', c.cost.median, against && against.cost.median],
    ['Routing (% first card)', c.routing, against && against.routing],
    ['Fidelity (% facts)', c.fidelity, against && against.fidelity],
    ['Forbidden values', c.forbidden, against && against.forbidden],
    ['Orphans', c.graph.orphans, against && against.graph.orphans],
    ['Links per node', c.graph.linksPerNode, against && against.graph.linksPerNode],
    ['Aliases per node', c.graph.aliasesPerNode, against && against.graph.aliasesPerNode],
  ];
  const head = against ? '| Metric | This | Main | Δ |\n| --- | --- | --- | --- |' : '| Metric | Value |\n| --- | --- |';
  return head + '\n' + rows.map(([k, v, w]) => (against ? `| ${k} | ${v} | ${w} | ${Math.round((v - w) * 100) / 100} |` : `| ${k} | ${v} |`)).join('\n') + '\n\nBuild: clean.';
}

// Sets up a scratch copy of the template for a benchmark compile, identically
// for everyone, so two scorecards differ only by the method being compared:
// the template minus bench/ and .git, bench/raw/ in its raw/, the bench owner in
// rules.js and the identity node, and every setup token filled from bench.json.
function prepare(repo, dir, cfg) {
  const fs = require('fs');
  const path = require('path');
  if (fs.existsSync(dir) && fs.readdirSync(dir).length) throw new Error(`bench: ${dir} is not empty`);
  const top = new Set(['.git', 'bench', 'node_modules']);
  fs.cpSync(repo, dir, { recursive: true, filter: src => !top.has(path.relative(repo, src).split(path.sep)[0]) });
  fs.cpSync(path.join(repo, 'bench', 'raw'), path.join(dir, 'raw'), { recursive: true });
  const o = cfg.owner;
  const rulesPath = path.join(dir, 'tools', 'lib', 'rules.js');
  const defaults = { name: 'Owner', pronouns: '', slug: 'owner', identity: 'owner-identity' };
  let rules = fs.readFileSync(rulesPath, 'utf8');
  for (const [k, was] of Object.entries(defaults)) {
    const from = `|| '${was}', // SETUP`;
    if (!rules.includes(from)) throw new Error(`bench: rules.js OWNER.${k} default not found`);
    rules = rules.replace(from, `|| '${o[k]}', // SETUP`);
  }
  fs.writeFileSync(rulesPath, rules);
  const prof = path.join(dir, 'wiki', 'profile');
  fs.renameSync(path.join(prof, `${defaults.identity}.md`), path.join(prof, `${o.identity}.md`));
  // VAULT_PATH comes from bench.json like every other token, never from dir: the
  // real folder is a path on someone's machine, and the compile copies it into
  // notes that get committed (D83).
  const values = { ...cfg.tokens, OWNER_NAME: o.name };
  const left = new Set();
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      const rel = path.relative(dir, p).split(path.sep).join('/');
      if (e.isDirectory()) { if (!/^(\.git|\.obsidian|raw|templates)$/.test(rel)) walk(p); continue; }
      if (!/\.md$/.test(e.name) || rel === 'SETUP.md') continue;
      const text = fs.readFileSync(p, 'utf8');
      const next = text.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in values ? values[k] : (left.add(k), m)));
      if (next !== text) fs.writeFileSync(p, next);
    }
  })(dir);
  if (left.size) throw new Error(`bench: no value in bench.json tokens for ${[...left].join(', ')}`);
}

module.exports = { hasFact, route, ladder, scoreQuestion, graphHealth, scorecard, table, prepare };
