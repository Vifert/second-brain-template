@AGENTS.md

## Claude Code Only

`AGENTS.md`, imported above, is the whole manual: every coding agent reads the
same one. This file adds only what is true for Claude Code alone. Change the
manual in `AGENTS.md`, never here (D90).

- The rules in `.claude/rules/` load by path here, as AGENTS.md § Rules That
  Load By Path describes.
- Skills load from `.claude/skills/`. After changing one, or an agent in
  `.claude/agents/` or a hook in `.claude/settings.json`, run
  `node tools/agents-sync.js` so the copies other agents read match (D91).
- The read-only agents in `.claude/agents/` skip this file and carry their own
  brief.
