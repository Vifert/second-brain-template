# Upgrading a vault between major versions

A MAJOR release changes something an existing vault's build depends on —
frontmatter keys, folder rules, the index format, a cap that shrinks — so a
vault set up from an earlier major fails its build until it is migrated. Each
major gets a section here: what changed, why, and the exact steps, including a
command where one exists. Minor and patch releases never need a migration; a
minor one may offer an optional step, listed here too.

Your vault records the version it was set up from in `HANDOFF.md` under
**Setup**.

## 1.x

The first public major. Nothing to migrate from.

### 1.1 — any coding agent (optional)

1.1 lets any coding agent run the vault (D90–D93). A vault set up from 1.0
keeps working under Claude Code as it is; the build only warns that its manual
is still in `CLAUDE.md`. To let Codex, Gemini CLI or another agent run it too,
ask your agent to do these steps, or do them yourself:

1. Save a copy of your `tools/`, take the new one, then carry your own
   settings across: `OWNER` and the tag facets in `tools/lib/rules.js`, the
   topics in `tools/build-index.js`, your `tools/probes.json`, and your own rows
   at the end of `tools/DEFECTS.md`. Everything else in the new `tools/` is
   the template's.
2. Rename your `CLAUDE.md` to `AGENTS.md`, then create a new `CLAUDE.md` whose
   first line is `@AGENTS.md`. Keep the credit block at the top of `AGENTS.md`.
   A line that is true for Claude Code alone may stay in `CLAUDE.md`; nothing
   else may, because the build fails a `CLAUDE.md` that repeats a section of
   the manual.
3. Run `node tools/agents-sync.js`. It writes `.agents/skills/`,
   `.codex/agents/` and `.codex/hooks.json` from your `.claude/`.
4. **Your own defect numbers.** 1.1 moves the first owner defect from D90 to
   D200, because the template's own rows now reach D93. If your ledger already
   has rows from D90, keep `OWNER_DEFECTS_FROM = 90` in your `rules.js`, so the
   credit block goes on counting only the rows you received from the template.
5. `node tools/selftest.js` and `node tools/build-index.js` — both clean — then
   the steps for your agent in `SETUP.md` § 4C.
