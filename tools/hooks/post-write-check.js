'use strict';
// PostToolUse hook on a file edit: a markdown file must be LF and free of
// control bytes (D76, D03). Claude Code sends Write/Edit/MultiEdit, Codex sends
// apply_patch (D92). The write already happened; exit 2 tells the agent.
const fs = require('fs');
const H = require('../lib/hooks');

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const bad = [];
for (const f of H.editedFiles(input)) {
  if (!/\.md$/i.test(f) || !fs.existsSync(f)) continue;
  const p = H.mdProblems(fs.readFileSync(f, 'utf8'));
  if (p.length) bad.push(`${f}: ${p.join('; ')}`);
}
if (!bad.length) process.exit(0);
process.stderr.write(bad.join('\n') + '\n');
process.exit(2);
