'use strict';
// PostToolUse hook on Write|Edit|MultiEdit: a markdown file must be LF and free
// of control bytes (D76, D03). The write already happened; exit 2 tells Claude.
const fs = require('fs');
const H = require('../lib/hooks');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const f = input.tool_input && input.tool_input.file_path;
if (!f || !/\.md$/i.test(f) || !fs.existsSync(f)) process.exit(0);
const p = H.mdProblems(fs.readFileSync(f, 'utf8'));
if (!p.length) process.exit(0);
process.stderr.write(`${f}: ${p.join('; ')}\n`);
process.exit(2);
