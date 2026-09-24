---
title: Vault Skills
summary: The six skills in this vault — /vault-compile, the two audits and /vault-handoff, which only the owner starts, vault-excalidraw and vault-tailor — and the two agents.
aliases: [vault skills, my skills, skills, slash commands, vault commands, vault-compile, /vault-compile, vault-audit, /vault-audit, vault-deep-audit, /vault-deep-audit, deep audit, cheap audit, how do I compile, how do I compile raw, compile command, audit command, gated skills, disable-model-invocation, health check, why didn't you compile, vault-handoff, /vault-handoff, handoff command, end of session, agents, subagents, vault agents, vault-fidelity-verifier, vault-gap-auditor, omitClaudeMd, vault-tailor, /vault-tailor, tailor the vault, adapt the vault, extend the vault, add a skill, custom skills, custom rules, research skill]
topic: tooling
kind: hub
tags: [tech/claude-code, subject/second-brain, subject/workflow, subject/audit]
created: 2026-09-19
updated: 2026-09-24
---

## Key Takeaways

- **Compiling `raw/` and auditing the vault run only when the owner types the command** — `/vault-compile`, `/vault-audit` or `/vault-deep-audit` (D78, inherited from Vifert's vault).
- **Four gated skills carry `disable-model-invocation: true`** — the compile, the two audits and `/vault-handoff` — so Claude Code itself refuses to start them; asking in plain words gets a request to type the command.
- **`/vault-compile` with no argument takes the next batch of the compile plan in HANDOFF.md**, compiles everything if little waits, or writes a plan first; `/vault-compile raw/daily` compiles just that folder.
- **`/vault-audit` is the cheap health check** — self-test, build and `audit.js`, their output kept in a file, reported as problems, watch items and query cost, then which to fix.
- **`/vault-deep-audit` adds the expensive checks** — facts answerable only from `raw/`, judgement on watch items, and a gap audit by agents asking questions in the owner's words; a topic argument limits it.
- **vault-excalidraw and vault-tailor are the vault skills Claude may start on its own** — drawings round by round, and fitting the vault to the owner's needs: an interview in rounds, then new skills, subagents or rules they choose.
- **Captures, the build and the self-test are never gated** — and the build also replays the fences and checks people links, `[sic]` notes and Obsidian settings.

## The Skills

| Skill | Who starts it | What it does |
| --- | --- | --- |
| `/vault-compile [path…]` | the owner only | Compiles what waits in `raw/`: provenance, verbatim full texts, `[sic]` rules, routing, build, the D38 verification pass with NotebookLM as an optional reader, then moves each source to `raw/_compiled/` |
| `/vault-audit` | the owner only | Runs `selftest.js`, `build-index.js` and `audit.js` into a temp folder and reports in a fixed short shape |
| `/vault-deep-audit [topic]` | the owner only | The audit, plus the source-independence check, watch-item verdicts and a skeptic-checked gap audit in waves of two agents |
| `/vault-handoff` | the owner only | The end-of-session record: a session entry in HANDOFF.md, its current state and open threads, the rules and global memory, then a commit and push. Claude reminds the owner once when a session changed the vault |
| `/vault-tailor` | Claude at setup, then the owner, or Claude when asked | Studies the vault, interviews the owner in rounds (adapted from Matt Pocock's `grilling` skill, MIT), proposes additions with their token cost, and builds the chosen ones to the vault's conventions — `references/extending.md` in its folder is the guide |
| `vault-excalidraw` | Claude or the owner | Drawings in `Excalidraw/<topic>/`, embedded live and transcribed with a `drawing-hash` |

## What Is Gated

- **Gated**: compiling anything in `raw/` outside `raw/_compiled/`; running `node tools/audit.js`; any vault-wide health check.
- **Not gated**: quick captures ("log this", ideas, people, Status Log rows, decisions); the build after every write; the self-test after a tooling change; drawing lint and render.
- **A file handed over** is saved into `raw/`, and Claude says in one line that `/vault-compile` will compile it.

## Why Skills, Not Only A Rule

Vifert asked on 19 September 2026, in the vault this template comes from, that nothing be compiled from `raw/` and no audit run unless he asks — the audit especially, because checking the whole vault's health spends many tokens. A rule in `CLAUDE.md` would have depended on Claude remembering it. A skill with `disable-model-invocation: true` is refused by Claude Code itself, its description never enters Claude's context, and its body loads only when invoked — so moving the compile, NotebookLM and audit procedures out of `CLAUDE.md` also made every session lighter.

## Where Things Moved

| Was | Now |
| --- | --- |
| `AGENTS.md` § Capture Protocol → Compile Procedure | `/vault-compile` § 2 |
| `AGENTS.md` § NotebookLM (full) | `/vault-compile` § 4; a stub stays in `AGENTS.md` |
| `AGENTS.md` § Audit | `/vault-audit` and `/vault-deep-audit` |
| Audit checks: fences, `[sic]`, people links, Obsidian settings, folder icons | the build, via `tools/lib/writechecks.js` |

## The Vault's Agents

Two subagent definitions in `.claude/agents/` (D87). Both are read-only and set
`omitClaudeMd: true`: a subagent otherwise loads the whole manual (`CLAUDE.md`, which imports
`AGENTS.md`), so
each carries only the brief its job needs.

| Agent | Used by | Does |
| --- | --- | --- |
| `vault-fidelity-verifier` | `/vault-compile` step 5 | Checks every compiled claim, table and figure against the source, and lists omissions |
| `vault-gap-auditor` | `/vault-deep-audit` | Asks questions in the owner's words and answers them from the index alone; also the skeptic that retries each claimed miss |

## Related

- [[vault-operations|Vault operations]] — the tools the skills run.
- [[vault-capture-protocol|Vault capture protocol]] — what is captured directly, and what waits for `/vault-compile`.
- [[notebooklm-compile-support|NotebookLM compile support]] — the instrument `/vault-compile` may use.
- [[excalidraw-drawings|Excalidraw drawings]] — the one skill Claude may start itself.
- [[second-brain-architecture-figure|The architecture drawing]] — its sixth zone shows all six skills and the two agents.
