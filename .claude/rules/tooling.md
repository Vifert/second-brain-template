---
paths:
  - "tools/**"
  - ".claude/**"
---

Notes for working on `tools/` and `.claude/`. They load when a file in either is read. Moved out of the manual (`AGENTS.md`) so they load only when needed (D87).

## Version Control

- **The tools**: `node tools/selftest.js` (the tooling is sound — after any
  tooling change), `node tools/build-index.js` (rebuild and validate — after
  every write), `node tools/audit.js` (the full audit — only through
  `/vault-audit`, § Compile and Audit).

## Working Notes

- **But `tools/` is versioned and is NOT disposable.** It holds `build-index.js`
  (the builder *and* the validator this manual mandates), `audit.js`,
  `probes.json`, `selftest.js`, `lib/` and `DEFECTS.md`. Until 2026-09-09 the builder lived only in a
  session temp directory, which meant the validator vanished at session end and
  each session reconstructed it from prose. **Do not rewrite these from scratch
  — run them.** See `tools/README.md`.
- **The wiki stays readable with no tooling** — it is markdown plus five TSVs.
  Tooling is needed only to *maintain* the index, which is why it is kept.
- **Windows can briefly lock a file** (Obsidian indexing, antivirus): a build
  that dies with `UNKNOWN: unknown error, open 'wiki/_index.tsv'` is not a code
  bug — rerun it.

## Hooks

Three traps are enforced by hooks registered in `.claude/settings.json`, not
by memory — the scripts are in `tools/hooks/`, the checks in `tools/lib/hooks.js`:
bash that would execute backticks (D13), CRLF from Python's `write_text`
(D76), and control bytes from a `\u` escape typed into Write or Edit (D03).
A Stop hook rebuilds a stale index at the end of every turn and keeps working
until the build is clean (D87). A blocked command says why; fix the command,
never the hook, unless the hook is wrong — then it is a defect. The same
scripts serve Codex through `.codex/hooks.json`: they read Codex's
`apply_patch` edits as well as Claude Code's Write and Edit, and a Stop hook
always answers with JSON (D92).

What each hook guards, in full (moved from AGENTS.md § Working Notes):

- **Long heredocs fail on this Windows shell.** Use the Write tool for file
  content, or a script file. This has bitten repeatedly — it is not a maybe.
  **Never pass markdown containing backticks through bash**: it executes them
  and injects the output into the file (D13).
- **A scripted edit must not rewrite line endings** (D76). Python's
  `pathlib.write_text` translates newlines to the platform's on Windows, so a
  one-line fix through it converts the whole file from LF to CRLF without
  saying so. Git normalises on commit, so the commit looks clean while the
  working copy is wrong — in Vifert's vault this silently CRLF'd ten files and
  broke the fence parser, which then read headings inside a `CLAUDE.md` code
  example as real sections. Write bytes, pass an explicit newline, or use the
  Edit tool, which leaves the rest of the file alone.
- **The file-writing tool decodes `\uXXXX` escapes.** Typing the six characters
  of a ctrl-A escape into a Write or Edit writes the control byte itself — it
  happened in `tools/DEFECTS.md` (D03). To put an escape sequence
  in a file as text, write it from a script (`chr(92) + "u0001"`). The self-test
  scans every markdown file for control bytes.

## Fences

A correction is swept, then fenced in `tools/probes.json` `_forbidden`
(AGENTS.md § Capture Protocol, D37). **A fence proves itself both ways** (D50).
Every `_forbidden` entry carries `catches` — the wrong claims it must match —
and `passes` — the nearby true claims it must let through; the build replays
both. Fence the error, not the topic: the first such fence forbade "is his
manager" when only the employer was wrong — and a later, true statement about
that same person's role would have failed. **When a new fact touches a fenced
claim, add it to `passes` first.** Moved here from the manual (D87), since a
fence is written in `tools/`.

## Every Agent

The vault runs under any coding agent, and `.claude/` is the one source of its
skills, agents and hooks (D91). Claude Code reads `.claude/` directly; for the
others, `node tools/agents-sync.js` writes:

| Generated | From | Read by |
| --- | --- | --- |
| `.agents/skills/<name>/` | `.claude/skills/<name>/`, with the frontmatter cut to the Agent Skills fields | Codex, Gemini CLI and other Agent Skills readers |
| `.agents/skills/<name>/agents/openai.yaml` | `disable-model-invocation: true` — `allow_implicit_invocation: false`, so Codex starts it only on `$name` | Codex |
| `.codex/agents/<name>.toml` | `.claude/agents/<name>.md`, in a read-only sandbox | Codex |
| `.codex/hooks.json` | the hooks in `.claude/settings.json`, run from the git root | Codex, once the project and each hook are trusted in `/hooks` |

- **Edit `.claude/`, never a generated file**, then run the sync and commit
  both. The build warns and the self-test fails while a generated file differs
  from its source; `node tools/agents-sync.js --check` says which.
- **The sync never deletes.** A skill removed from `.claude/` leaves its old
  copy behind; `--check` names it, and a person deletes it.
- **The manual is `AGENTS.md`** (D90); `CLAUDE.md` holds only `@AGENTS.md` and
  Claude-only lines, and the build fails a `CLAUDE.md` that repeats a section of
  the manual.
