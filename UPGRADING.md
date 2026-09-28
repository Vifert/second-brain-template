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

### 1.2 — tailoring fitted to your life (recommended)

`vault-tailor` now gets to know your days and weeks — an optional free talk,
then questions built from it — and proposes skills, skill chains and
automations for any part of your life, recording every result in your vault.
A set-up vault now records each tailoring run in `HANDOFF.md` § Tailoring;
until its first dated line exists, the build warns and the audit fails (D95).

To upgrade a vault set up with 1.0 or 1.1, ask your agent to:

1. Copy `.claude/skills/vault-tailor/` and `.agents/skills/vault-tailor/`
   from this template over yours.
2. Copy `tools/lib/vault.js`, `tools/build-index.js`, `tools/audit.js` and
   `tools/selftest.js` — or merge them, if you changed them — and append the
   D95 row of `tools/DEFECTS.md` to yours.
3. Run `node tools/selftest.js` and `node tools/build-index.js`; the build
   now warns that tailoring has no record.
4. Run `/vault-tailor`. It ends by writing the dated line, and the warning
   goes for good. If you would rather not, add
   `- **YYYY-MM-DD — declined by the owner**`, with today's date, under a
   `## Tailoring` heading in `HANDOFF.md` yourself.
