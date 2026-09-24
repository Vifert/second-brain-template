'use strict';
// Stop hook (D87): when a note changed after the last build, rebuild. If the
// build reports problems, keep Claude working on them — once; a second
// consecutive block would loop, so then it only reports.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const H = require('../lib/hooks');

const VAULT = path.resolve(__dirname, '..', '..');
let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { input = {}; }
if (!H.staleIndex(VAULT)) process.exit(0);
const r = cp.spawnSync(process.execPath, [path.join(VAULT, 'tools', 'build-index.js')], { cwd: VAULT, encoding: 'utf8' });
if (r.status === 0) process.exit(0);
const problems = String(r.stdout).split('\n').filter(l => /^\s+- /.test(l)).slice(0, 12).join('\n');
if (input.stop_hook_active) {
  console.log(JSON.stringify({ systemMessage: `The rebuild still reports problems (D87):\n${problems}` }));
  process.exit(0);
}
process.stderr.write(`The index was stale, and the rebuild reports problems — fix them before finishing (D87):\n${problems}\n`);
process.exit(2);
