'use strict';
// Stop hook (D87): when a note changed after the last build, rebuild. If the
// build reports problems, keep the agent working on them — once; a second
// consecutive block would loop, so then it only reports. Codex requires JSON
// on stdout whenever a Stop hook exits 0, so every exit 0 prints some (D92).
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const H = require('../lib/hooks');

const VAULT = path.resolve(__dirname, '..', '..');
const done = (out = {}) => { console.log(JSON.stringify(out)); process.exit(0); };
let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { input = {}; }
if (!H.staleIndex(VAULT)) done();
const r = cp.spawnSync(process.execPath, [path.join(VAULT, 'tools', 'build-index.js')], { cwd: VAULT, encoding: 'utf8' });
if (r.status === 0) done();
const problems = String(r.stdout).split('\n').filter(l => /^\s+- /.test(l)).slice(0, 12).join('\n');
if (input.stop_hook_active) done({ systemMessage: `The rebuild still reports problems (D87):\n${problems}` });
process.stderr.write(`The index was stale, and the rebuild reports problems — fix them before finishing (D87):\n${problems}\n`);
process.exit(2);
