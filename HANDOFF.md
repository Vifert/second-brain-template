# HANDOFF

**Last updated:** {{SETUP_DATE}}
**Sessions recorded:** 1

## How This File Works

- **Claude Code carries no memory between sessions, so this file is the
  memory**: what exists, what was decided and why, what was deliberately left
  alone, and what is still open. Read it at the start of every session,
  straight after AGENTS.md. Where it disagrees with an assumption, it wins — or
  ask {{OWNER_NAME}}.
- **It is updated when {{OWNER_NAME}} types `/vault-handoff`**, which holds the
  routine: append a Session Log entry (what happened, what was decided and
  *why*, what was deliberately left alone and why), refresh Current State,
  Waiting On and Open Threads, and bump the date and the session count. A
  session that changed the vault without it ends with a one-line reminder.
- **Record reasoning, not just actions**, so a later session does not "fix" a
  deliberate choice.
- **Keep it lean by moving, never by summarising.** It is read every session,
  so its size is a permanent tax: the build warns when it passes its token
  budget. Old session entries then move word for word into
  `wiki/tooling/worklog/vault-session-log.md`, and a decision's full reasoning
  into a `detail` node — a summary would lose what a later session needs (D01, D87).

## Current State

- **Snapshot at the end of setup ({{SETUP_DATE}})**: {{SETUP_SNAPSHOT}}
  Figures go stale — live numbers come from `/vault-audit`.
- **Five index files** plus a generated Now page, all rebuilt by
  `tools/build-index.js`: `_index.tsv` (route), `_cards.tsv` (answer),
  `_sections.tsv` (line ranges), `_links.tsv` (edges), `_mentions.tsv`
  (person → dated log entries), `wiki/profile/now.md`. Never read them whole.
- **Topics**: {{TOPICS_SUMMARY}}
- **Repo**: private `{{GITHUB_REPO}}`, branch `main`, git CLI only.
- **Setup**: {{SETUP_STATE}}

## Status

**Live status is `wiki/profile/now.md`, generated from each owner node's
`## Status Log` — update the owners, never this line.**

## Waiting On {{OWNER_NAME}}

- Nothing yet.

## Open Threads

- None yet.

## Decisions

- **Settled at setup**: {{SETUP_DECISIONS}}
- **The architecture is Vifert's.** The credit block at the top of AGENTS.md
  stays there; edit anything else as the vault grows.

## Tooling

**`tools/` is versioned and is NOT disposable** — see `tools/README.md`. Run
them, never reimplement them:

    node tools/selftest.js && node tools/build-index.js
    # the audit runs only through /vault-audit

- Whose vault this is lives in `OWNER` in `tools/lib/rules.js`; topics in
  `tools/build-index.js`; tag facets in `tools/lib/rules.js`; routing probes in
  `tools/probes.json`. When a lookup routes badly in real use, add the term to
  `tools/probes.json` — to `_must_route` if it reached the wrong node.
- `tools/excalidraw.js` is the drawing engine behind the `vault-excalidraw`
  skill: `list`, `info`, `render`, `new`, `apply`, `lint`, `transcribe`,
  `hash`, `save`, `check`. It renders offline with the Excalidraw build inside
  the Obsidian plugin, in whichever installed Chromium browser answers.
- The defect ledger, `tools/DEFECTS.md`, ships with D01–D79 from Vifert's vault, D80–D85
  from preparing this template for release, and D86–D88 ported from his vault's
  D80–D82, D89 from the template's own upkeep, and D90–D93 from making it run under
  any coding agent. **This vault's own defects start at D200.**

## Traps

Inherited from Vifert's vault, where each one was learned the hard way. Keep
them; add this vault's own below them.

- **⚠ Obsidian rewrites frontmatter** and has dropped aliases on the way. The
  build warns on any alias lost since the last commit — after {{OWNER_NAME}} has
  been editing in Obsidian, rebuild before anything else.
- **⚠ Obsidian may be open and editing while you work.** Anchor every scripted
  edit on exact text, so a concurrent change fails loudly instead of being
  overwritten. Obsidian also writes its in-memory settings back over edited
  `.obsidian/` files — ask for a reload after any settings edit.
- **A scripted edit must not rewrite line endings** (D76). Use the Edit tool, or
  a script that writes bytes; Python's `pathlib.write_text` silently turns LF
  into CRLF on Windows. Hooks now refuse the call and the file.
- **The file-writing tool decodes `\uXXXX` escapes** into real characters.
  Write a literal escape sequence from a script.
- **Long heredocs fail in some shells, bash executes backticks in markdown, and
  backslashes in shell-quoted scripts get mangled.** Anything with a backtick or
  a backslash goes through the Write tool or a script file. A hook blocks bash
  that would execute a backtick; it cannot catch a mangled backslash.
- **A script that inserts into a file must recompute positions after each
  insert**, or it reverses entries and splits others.
- **Windows briefly locks files**: a build dying with `UNKNOWN: unknown error,
  open 'wiki/_index.tsv'` just needs a rerun.
- **A stale index is the worst failure mode** — it routes queries down the
  expensive path with no error. Rebuild in the same step that writes content;
  a Stop hook rebuilds whatever is still stale at the end of a turn.
- **A drawing's text ids must be exactly 8 letters and digits** (D73), or
  Obsidian glues one label's words onto the next. `tools/excalidraw.js` replays
  the plugin's parser before every write.
- **A connector's label sits at its path midpoint**, so it lands wherever the
  route's arithmetic puts it (D75). Read every render; lint now fails a label
  with another line through it.
- **A browser can stop rendering headless after an automatic update** (D77);
  `node tools/excalidraw.js check` names the one that still answers.
- **mcp-excalidraw-server's own export is lossy** — bring a canvas scene back
  with `node tools/excalidraw.js save`.
- **NotebookLM's answer quality depends on the question's shape** (D74). A
  failed `notebooklm source add` leaves a zombie source to delete by hand.
- **Big parallel agent runs can hit the usage limit** and lose their work. Run
  agent work in small waves.

## Session Log

### Session 1 — {{SETUP_DATE}} · Setup

{{SETUP_SUMMARY}}
