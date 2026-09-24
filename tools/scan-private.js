'use strict';
// Personal-data scan for the public repository. It matches patterns, never
// names — so nobody's name has to be written into the repo to keep it out.
// {{TOKENS}} are the template's design (filled at setup) and are not flagged.
//   node tools/scan-private.js   exit 1 with file:line for every hit

const fs = require('fs');
const path = require('path');

const ROOT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const TEXT_FILE = /\.(md|js|json|ya?ml|cff|txt|tsv|css)$|^(VERSION|LICENSE|\.gitignore|\.gitattributes|\.editorconfig|\.node-version)$/;
// Installed plugin code is not ours and never committed (.gitignore); skip it.
// Nor is Obsidian's machine-local workspace state, also never committed.
const SKIP_FILE = /^\.obsidian\/(plugins\/[^/]+\/(main\.js|styles\.css|manifest\.json)|workspace[^/]*\.json)$/;
// The maintainer's address is published deliberately, in exactly these files.
const MAINTAINER = 'vifertjdaniel@gmail.com'; // scan-private: allow
const MAINTAINER_FILES = new Set(['SECURITY.md', 'CODE_OF_CONDUCT.md']);

const RULES = [
  {
    rule: 'email address',
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    allow: (m, rel) => (m.toLowerCase() === MAINTAINER && MAINTAINER_FILES.has(rel))
      || /@(example\.(com|org|net)|users\.noreply\.github\.com|anthropic\.com)$/i.test(m),
  },
  {
    rule: 'absolute user path',
    re: /\b[A-Za-z]:[\\/]+Users[\\/]+[^\\/\s'"`)]+|\/home\/[A-Za-z][^/\s'"`)]*|\/Users\/[A-Za-z][^/\s'"`)]*/g,
    allow: m => /[\\/](<you>|you|YOU|name|username|USERNAME|example|runner)(?![A-Za-z0-9])/.test(m),
  },
  { rule: 'UUID', re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, allow: m => /^0{8}-/.test(m) },
  // A decimal fraction (Obsidian's graph settings) is not an id: no digit after a dot.
  // The digit alphabet itself (an id charset in lib/excalidraw.js) is not an id.
  { rule: 'long digit run', re: /(?<![.\d])\d{10,}(?![\d.])/g, allow: (m, rel) => rel.endsWith('.excalidraw.md') || m === '0123456789' },
];

function scanText(rel, text) {
  const hits = [];
  String(text).split('\n').forEach((line, i) => {
    // A fixture or a deliberate constant carries this marker on its own line.
    if (line.includes('scan-private: allow')) return;
    // A 40-character commit SHA (an action pinned in a workflow) is not an id of anyone's.
    const clean = line.replace(/\b[0-9a-f]{40}\b/gi, ' ');
    for (const r of RULES) for (const m of clean.match(r.re) || []) if (!r.allow(m, rel)) hits.push({ line: i + 1, rule: r.rule, match: m });
  });
  return hits;
}

// --against <source vault>: the patterns above cannot see content — a real
// table name, a colleague, a paper's figure — carried over from the vault a
// template was made from (D85). This reads the distinctive terms out of that
// vault's own index at run time, so nothing personal is written here: people's
// names, code identifiers, precise figures, long titles, and the tag facets
// the template does not register (a client's own facet and its values).
// Public names the repo uses on purpose: the credited author, the tools' vendor,
// and Claude Code's own documented names, which the source vault also records
// in its notes on the public docs (a hook's tool_input, an agent's omitClaudeMd).
const CREDITED = new Set(['vifert', 'anthropic', 'omitclaudemd', 'tool_input', 'claude code hooks', 'claude-code-hooks']);
function sourceTerms(rows, facets) {
  const out = new Map();
  const add = (t, why) => { t = String(t || '').trim(); if (t.length >= 4 && !CREDITED.has(t.toLowerCase()) && !out.has(t.toLowerCase())) out.set(t.toLowerCase(), { term: t, why }); };
  for (const r of rows) {
    if (/^wiki\/(tooling|profile\/now)/.test(r[0])) continue;
    if (/^wiki\/people\//.test(r[0])) { add(r[1], `person ${r[0]}`); for (const w of String(r[1]).split(/[\s(),]+/)) if (/^[A-Z][a-z]{3,}$/.test(w)) add(w, `person ${r[0]}`); }
    else if (String(r[1]).split(/\s+/).length >= 3) add(r[1], `title ${r[0]}`);
    const slug = path.posix.basename(r[0], '.md');
    // A dated log's slug (journal-2026-09) is the naming convention, not content.
    if (slug.split('-').length >= 3 && !/-\d{4}-\d{2}$/.test(slug)) add(slug, `node ${r[0]}`);
    for (const a of String(r[5] || '').split(',').map(s => s.trim())) {
      if (/^[A-Za-z]\w*_\w+$|^[a-z]+[A-Z]\w+$|^\w+\.(sh|py|sql|scala|hql|jar)$/.test(a) || /^\d+\.\d{2,}%?$/.test(a)) add(a, `identifier or figure ${r[0]}`);
    }
    for (const t of String(r[6] || '').split(',').map(s => s.trim()).filter(Boolean)) {
      const [f, v] = t.split('/');
      // An unregistered facet (a client's own) is distinctive by name; its values are
      // often ordinary words, so only the whole facet/value pair is matched.
      if (v && f === 'org') add(v, `tag ${t}`);
      else if (v && !facets.includes(f)) { add(t, `tag ${t}`); add(f, `facet ${f}/`); }
    }
  }
  return [...out.values()];
}
function termHits(rel, text, terms) {
  const hits = [];
  const res = terms.map(t => ({ ...t, re: new RegExp(`(^|[^A-Za-z0-9_])${t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^A-Za-z0-9_])`, 'i') }));
  String(text).split('\n').forEach((line, i) => {
    if (line.includes('scan-private: allow')) return;
    for (const t of res) if (t.re.test(line)) hits.push({ line: i + 1, rule: `source-vault term (${t.why})`, match: t.term });
  });
  return hits;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (TEXT_FILE.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
}

if (require.main === module) {
  const i = process.argv.indexOf('--against');
  let terms = [];
  if (i >= 0) {
    const idx = path.join(path.resolve(process.argv[i + 1] || ''), 'wiki', '_index.tsv');
    if (!fs.existsSync(idx)) { console.error(`scan-private: no ${idx}`); process.exit(2); }
    const rows = fs.readFileSync(idx, 'utf8').trim().split('\n').map(r => r.split('\t'));
    terms = sourceTerms(rows, Object.keys(require('./lib/rules').TAG_FACETS));
    console.log(`scan-private: checking ${terms.length} terms from the source vault as well`);
  }
  let n = 0;
  for (const abs of walk(ROOT)) {
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (SKIP_FILE.test(rel)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    for (const h of [...scanText(rel, text), ...termHits(rel, text, terms)]) { n++; console.log(`${rel}:${h.line}  ${h.rule}  ${h.match}`); }
  }
  console.log(n ? `scan-private: ${n} hit(s) — remove them, or add a documented allowance.` : 'scan-private: clean');
  process.exitCode = n ? 1 : 0;
}
module.exports = { scanText, sourceTerms, termHits };
