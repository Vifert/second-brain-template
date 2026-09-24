---
paths:
  - ".obsidian/**"
  - "templates/**"
---

The Obsidian skills, plugins and settings. They load when a settings file or a template is read; the build checks every setting the rules depend on. Moved out of the manual (`AGENTS.md`) so they load only when needed (D87).

## Obsidian Skills

Five are installed. Use them rather than improvising Obsidian syntax.

- **`/obsidian:obsidian-markdown`** — wikilinks, embeds, callouts, properties.
  Use when writing nodes needing syntax beyond plain Markdown.
- **`/obsidian:obsidian-bases`** — `.base` database views over frontmatter.
  Use when I want a browsable view (ideas by status, nodes by stale `updated`).
  Bases are for **my** browsing; they are not your query path.
- **`/obsidian:obsidian-cli`** — the `obsidian` CLI against a running instance.
  **Deliberately not used** — see Working Notes.
- **`/obsidian:json-canvas`** — `.canvas` files for visual maps of the graph.
  Write canvases into `output/` unless I say otherwise.
- **`/obsidian:defuddle`** — clean markdown from web pages. **Prefer over a
  plain fetch** for any URL I drop in. Installed and working.

Four live in the vault itself, at `.claude/skills/`:

- **`vault-excalidraw`** — making, changing and managing my Excalidraw
  drawings, round by round with me, and keeping the notes that embed them in
  sync. Built on `tools/excalidraw.js` (the Excalidraw engine bundled in my
  plugin, run offline), yctimlin's `mcp-excalidraw-server` for a live canvas,
  Mermaid import and share links, and coleam00's diagram design method. Use it
  for any drawing request rather than writing drawing JSON by hand.
- **`/vault-compile`**, **`/vault-audit`**, **`/vault-deep-audit`** — the
  compile and the two audits. Gated: only I start them, by typing the command
  (§ Compile and Audit). `vault-excalidraw` is the one vault skill you may
  start on your own.

Skill invocation costs tokens too — invoke the one that fits, not several.

## Obsidian Plugins

Four community plugins are used. **Excalidraw is required** — the drawing tools
run on its engine — and is installed by `node tools/install-excalidraw.js`.
**Calendar, Iconize and Templater are recommended**, installed from Obsidian's
community browser. Their settings ship in `.obsidian/plugins/<id>/data.json`,
so each is configured the moment it is installed. The full record is
`wiki/tooling/obsidian-plugins.md`. **No plugin runs outside Obsidian**, so you
never call one; you use the files and settings they read.

| Plugin | How you use it | Rule |
| --- | --- | --- |
| **Excalidraw** (required) | Drawings in `Excalidraw/<topic>/`, made and edited through the `vault-excalidraw` skill and `tools/excalidraw.js` | A node embeds the live drawing and transcribes it with its `drawing-hash` (§ Images, D72); `compress` stays off (D71) |
| **Calendar** | Daily notes land in `raw/daily/` | `/vault-compile` compiles them (§ Capture Protocol) |
| **Iconize** | Edit `.obsidian/plugins/obsidian-icon-folder/data.json`: `"<folder path>": "Li<PascalCase lucide id>"` | **A new folder gets an icon in the same step** — the build warns on any without one. If graph colours are on (`GRAPH.background` set in `tools/lib/rules.js`), it also gets a graph colour: run `node tools/graph-colours.js`, then ask me to reload Obsidian (D86) |
| **Templater** | Keep `templates/` (`idea`, `person`, `log-entry`, `daily-note`) in step with the frontmatter and heading rules | Its folder stays `templates`; `wiki/`, `raw/`, `tools/`, `output/` stay excluded from trigger-on-creation, or a note you write could be re-parsed and rewritten |

- **Obsidian holds its settings in memory and writes them back.** After editing
  any `.obsidian/` file while it is open, ask me to reload it (Ctrl+P → "Reload
  app without saving"). The build checks every setting the rules depend on (D69). A plugin's settings are checked only once the plugin is installed; Excalidraw is required, and a build without it names the install command (D79).
- **A plugin setting never holds a secret** — every `data.json` is committed and
  the builder fails one that does (D66).
- **Plugins can rewrite notes** — Templater on a click, and any plugin I add
  later may do more. The builder's rewrite check (D67) is the backstop; after I
  have been working in Obsidian, rebuild before anything else.
- **A plugin I add myself** is mine to configure. If it can rewrite notes or
  reformat drawings, keep it away from logs, verbatim full texts and
  `Excalidraw/`, and tell you, so its settings can be checked like the others.
- **If you need a plugin's documentation**, read its code in
  `.obsidian/plugins/<id>/main.js` and its public README; I will supply docs if
  those are not enough. Update `obsidian-plugins.md` and this table when a
  plugin is added, removed or reconfigured.

## Version Control

- **The Obsidian settings are versioned**: the core settings and each plugin's
  `data.json`. Plugin code, themes and icon packs are installed per machine
  and never committed, and machine-local state stays ignored: `workspace*.json`
  and `.obsidian/cache`.

## Working Notes

- **The Obsidian CLI is deliberately not used.** Obsidian (1.13 and later) ships an
  official CLI, switched on in Obsidian's own settings, and it only works while
  the app is open. The query path is the index, which is cheaper and works with
  Obsidian closed, and routing edits through Obsidian would pass them through
  the frontmatter rewriter that has dropped aliases.
