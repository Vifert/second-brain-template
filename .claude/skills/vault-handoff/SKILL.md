---
name: vault-handoff
description: End-of-session upkeep for the vault — HANDOFF.md and its session log, the rules, global memory, and a final commit and push. The owner types /vault-handoff; the agent never starts it.
disable-model-invocation: true
---

# Hand the session over

The owner typed `/vault-handoff`, so updating the cross-session record is
authorised for this run. A coding agent carries no memory between sessions:
HANDOFF.md is that memory, and a future session trusts it over its own
assumptions. Do each step; skip one that has nothing to do.

1. **Session log.** Append an entry to HANDOFF.md's `## Session Log`: what
   happened, what was decided and why, and what was deliberately left alone
   and why. **Record reasoning, not just actions**, so a future session does
   not "fix" a deliberate choice.
2. **HANDOFF.md.** Refresh Current State, Waiting On and Open Threads; add a
   lasting decision under Decisions; bump the date and the session count.
   HANDOFF.md is read every session, so its size is a permanent tax: the
   build warns when it passes its budget in `CONTEXT_BUDGET_TOKENS`
   (`tools/lib/rules.js`). The remedy is to move detail out, never to delete
   or summarise it to fit (D01): the oldest session entries go word for word
   into `wiki/tooling/worklog/vault-session-log.md` (a `kind: log` node, one
   `### YYYY-MM-DD (D-Mon-YY)` heading per session day; create it the first
   time, following `.claude/rules/wiki-writing.md`), and a decision's full
   reasoning into a `detail` node in `wiki/tooling/`, leaving one line here.
3. **AGENTS.md and the rules.** If a rule changed this session, revise the file
   that holds it — the always-on core, `AGENTS.md`, or a `.claude/rules/` file — and grep the
   vault and `tools/` for its old wording (D20). If nothing changed, say so and
   leave them.
4. **Global memory** at `{{MEMORY_PATH}}`: anything important enough to
   outlive this vault, one fact per file, with its pointer in `MEMORY.md`.
5. **Build, self-test, commit, push.** `node tools/build-index.js` must end
   `PROBLEMS: none`; run `node tools/selftest.js` if tooling changed. Check the
   exit status, never a piped tail. Commit with the counts that changed —
   nodes, sections, edges — and push.
6. **Report** in a few lines what was updated, and anything still waiting in
   `raw/` for `/vault-compile`.

## Why this is gated

The session record is the owner's to start, like the compile and the audits
(inherited from Vifert's vault, 24 September 2026, D87). The agent still commits
and pushes its own work once the build is clean, and at the end of a session
that changed the vault reminds the owner once, in one line, to type
`/vault-handoff`.
