'use strict';
// Scores a compiled benchmark vault. Never calls an LLM: contributors compile
// bench/raw/ with their method, and this measures the result.
//   node tools/bench.js                         score bench/baseline, print the table
//   node tools/bench.js --label pr --write      also write bench/results/pr.json
//   node tools/bench.js --check                 fail unless bench/results/baseline.json is current
//   node tools/bench.js --against main.json     print the delta against another scorecard
//   node tools/bench.js --vault <dir>           score another compiled copy
//   node tools/bench.js --prepare <empty dir>   set up a copy for a benchmark compile

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const B = require('./lib/bench');

const REPO = path.resolve(__dirname, '..');
const BENCH = path.join(REPO, 'bench');
const argv = process.argv.slice(2);
const opt = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const vault = path.resolve(REPO, opt('--vault') || 'bench/baseline');
const label = opt('--label') || 'baseline';
const cfg = JSON.parse(fs.readFileSync(path.join(BENCH, 'bench.json'), 'utf8'));
const questions = JSON.parse(fs.readFileSync(path.join(BENCH, 'questions.json'), 'utf8'));

if (opt('--prepare')) {
  const dir = path.resolve(opt('--prepare'));
  B.prepare(REPO, dir, cfg);
  console.log(`bench: ${dir} is ready — start Claude Code there and type /vault-compile`);
  process.exit(0);
}

// 1. Build the vault's index with the template's own builder and the bench owner.
const env = { ...process.env, VAULT_ROOT: vault, VAULT_OWNER_NAME: cfg.owner.name, VAULT_OWNER_PRONOUNS: cfg.owner.pronouns, VAULT_OWNER_SLUG: cfg.owner.slug, VAULT_OWNER_IDENTITY: cfg.owner.identity };
const build = cp.spawnSync(process.execPath, [path.join(__dirname, 'build-index.js')], { env, encoding: 'utf8' });
if (build.status !== 0) {
  console.error(String(build.stdout || '').split('\n').slice(-15).join('\n'));
  console.error('bench: the benchmark vault does not build clean — fix it before scoring.');
  process.exit(1);
}

// 2. Read the index and run every gold question through the ladder.
const tsv = n => fs.readFileSync(path.join(vault, 'wiki', n), 'utf8').trim().split('\n').filter(Boolean).map(r => r.split('\t'));
const idx = tsv('_index.tsv');
const cards = new Map(tsv('_cards.tsv').map(r => [r[0], r.join('\t') + '\n']));
const sections = tsv('_sections.tsv');
const links = tsv('_links.tsv');
const fileCache = new Map();
const readLines = (rel, a, b) => {
  if (!fileCache.has(rel)) fileCache.set(rel, fs.readFileSync(path.join(vault, rel), 'utf8').split('\n'));
  return fileCache.get(rel).slice(a - 1, b).join('\n') + '\n';
};
const rawBytes = (function sum(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? sum(path.join(dir, e.name)) : /\.(md|txt|csv)$/.test(e.name) ? fs.statSync(path.join(dir, e.name)).size : 0), 0);
})(path.join(BENCH, 'raw'));
const per = questions.map(q => B.scoreQuestion(q, B.ladder({ budget: cfg.defaultBudget, ...q }, { idx, cards, sections, readLines }), rawBytes));
const card = B.scorecard(per, B.graphHealth(idx, links));
const json = JSON.stringify(card, null, 2) + '\n';

// 3. Report, write or check.
const againstPath = opt('--against');
console.log(B.table(card, againstPath ? JSON.parse(fs.readFileSync(againstPath, 'utf8')) : null));
const out = path.join(BENCH, 'results', `${label}.json`);
if (argv.includes('--write')) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, json);
  console.log(`bench: wrote ${path.relative(REPO, out).split(path.sep).join('/')}`);
}
if (argv.includes('--check')) {
  const committed = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (committed !== json) {
    console.error(`bench: ${path.relative(REPO, out).split(path.sep).join('/')} does not match a fresh score — run node tools/bench.js --label ${label} --write and commit it.`);
    process.exit(1);
  }
  console.log('bench: scorecard is current');
}
if (card.forbidden) console.log(`bench: ${card.forbidden} forbidden value(s) came back — see perQuestion in the JSON.`);
