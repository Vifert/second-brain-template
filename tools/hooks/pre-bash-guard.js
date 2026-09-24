'use strict';
// PreToolUse hook on Bash: refuse Python write_text (D76) and bash that would
// execute backticks (D13). Exit 2 blocks the call and shows Claude why.
const fs = require('fs');
const H = require('../lib/hooks');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const p = H.bashProblems((input.tool_input && input.tool_input.command) || '');
if (!p.length) process.exit(0);
process.stderr.write(p.join('\n') + '\n');
process.exit(2);
