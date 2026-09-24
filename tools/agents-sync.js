#!/usr/bin/env node
'use strict';
// Writes the agent layer every non-Claude coding agent reads, from `.claude/`
// (D91): `.agents/skills/` (Codex, Gemini CLI and other Agent Skills readers),
// `.codex/agents/` and `.codex/hooks.json` (Codex). Edit `.claude/`, then run
// this. `--check` writes nothing and exits 1 while anything differs.
const fs = require('fs');
const path = require('path');
const A = require('./lib/agents');

const VAULT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
const files = A.render(VAULT);
const { changed, stale } = A.drift(VAULT, files);

if (check) {
  if (!changed.length && !stale.length) { console.log(`agents-sync: ${files.size} generated files match .claude/ (D91)`); process.exit(0); }
  if (changed.length) console.log(`agents-sync: ${changed.length} file(s) differ from .claude/ — run node tools/agents-sync.js (D91):\n  ${changed.join('\n  ')}`);
  if (stale.length) console.log(`agents-sync: ${stale.length} file(s) nothing in .claude/ generates any more — delete them (D91):\n  ${stale.join('\n  ')}`);
  process.exit(1);
}

for (const p of changed) {
  const abs = path.join(VAULT, p);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, files.get(p));
}
console.log(`agents-sync: wrote ${changed.length} of ${files.size} generated files (D91)`);
// Deleting is left to a person: a generated folder may hold something of theirs.
if (stale.length) console.log(`agents-sync: ${stale.length} file(s) nothing in .claude/ generates any more — delete them by hand:\n  ${stale.join('\n  ')}`);
