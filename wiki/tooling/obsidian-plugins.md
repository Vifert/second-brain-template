---
title: Obsidian Plugins
summary: The four community plugins this vault uses — Excalidraw required, Calendar, Iconize and Templater recommended — how each is installed, and the settings the build checks.
aliases: [plugins, my plugins, obsidian plugins, community plugins, can you use my plugins, which plugins do I need, which plugins can Claude use, which plugins can my agent use, required plugin, install excalidraw, install-excalidraw, Excalidraw plugin, Iconize, icon folder, folder icons, icons for folders, Templater, templates, Calendar, daily notes, daily note, obsidian settings, restricted mode, graph colours, graph colors, graph colour groups, colour groups, graph.json, graph-colours.js, folder colours in the graph]
topic: tooling
kind: hub
tags: [tech/obsidian, subject/second-brain, subject/capture]
created: 2026-09-17
updated: 2026-09-24
---

## Key Takeaways

- **Excalidraw is the one required plugin**: the drawing tools run on its engine. `node tools/install-excalidraw.js` installs a pinned release, checksum-verified, and keeps the shipped settings.
- **Calendar, Iconize and Templater are recommended**, installed by the owner from Obsidian's community browser; each is configured the moment it is installed, because its settings ship in `.obsidian/plugins/<id>/data.json`.
- **No plugin runs outside Obsidian**, so the agent never calls one; it edits the files and settings a plugin reads.
- **The build checks a plugin's settings only once the plugin is installed** (D79); a vault without Excalidraw fails its build with the install command.
- **Plugin code is never committed**: only settings travel with the repository, so a clone is under a megabyte and carries nobody else's code.
- **A plugin the owner adds is theirs to configure** — kept away from logs, verbatim full texts and `Excalidraw/` if it can rewrite notes.

## The Four Plugins

| Plugin | Id | What it does here | Can it rewrite notes? | Settings file |
| --- | --- | --- | --- | --- |
| **Excalidraw** (required) | `obsidian-excalidraw-plugin` | Editable drawings in `Excalidraw/<topic>/`; its bundled engine renders them headless for `tools/excalidraw.js` | Only the drawing being edited | `.obsidian/plugins/obsidian-excalidraw-plugin/data.json` |
| **Calendar** | `calendar` | A calendar pane that opens the day's daily note, which lands in `raw/daily/` | No — it opens notes; core Daily notes creates them | `.obsidian/plugins/calendar/data.json` |
| **Iconize** | `obsidian-icon-folder` | An icon on every folder, one key per folder path plus name rules | No — it writes only its own settings | `.obsidian/plugins/obsidian-icon-folder/data.json` |
| **Templater** | `templater-obsidian` | Inserts the templates in `templates/` — idea, person, log entry, daily note | Yes, on a click, and on file creation if that toggle is on | `.obsidian/plugins/templater-obsidian/data.json` |

## The Settings The Build Checks

Listed in `OBSIDIAN_SETTINGS` in `tools/lib/rules.js`. Obsidian writes its
in-memory settings back over a file edited while it is open (D69), so the build
re-checks them every run.

| Setting | Value | Why |
| --- | --- | --- |
| `app.json` `attachmentFolderPath` | `./assets` | A pasted image lands beside its note (D52) |
| `app.json` `newFileLocation` / `newFileFolderPath` | `folder` / `raw` | A note made in Obsidian starts in the inbox (D68) |
| `daily-notes.json` `folder` | `raw/daily` | A daily note waits for `/vault-compile` |
| Excalidraw `folder` | `Excalidraw` | New drawings land where the tools look (D71) |
| Excalidraw `embedUseExcalidrawFolder` | `true` | A drawing made from inside a note stays out of `wiki/` (D68) |
| Excalidraw `compress` | `false` | Drawings save as readable JSON, so a git diff shows what changed (D71) |
| Templater `templates_folder` | `templates` | Insert Template offers the vault's templates |
| Templater `ignore_folders_on_creation` | `wiki`, `raw`, `tools`, `output` | A note the agent writes is never re-parsed as a template |

Templater's "trigger on file creation" is a device-local toggle, not in
`data.json`; it stays **off**, or any `<% %>` in a new note would run.

## Installing

- **Excalidraw**: `node tools/install-excalidraw.js`, then
  `node tools/excalidraw.js check`, which names the browser that rendered.
  `--check` reports what is installed.
- **The other three**: Settings → Community plugins → turn off Restricted mode →
  Browse → install. Then add the id to `.obsidian/community-plugins.json` so it
  stays enabled.
- **Obsidian holds settings in memory**: after editing anything in
  `.obsidian/` while it is open, reload it (Ctrl+P → "Reload app without
  saving").

## Graph Colours

Optional, and off until setup records the owner's background (D86). When on,
every folder has its own colour in Obsidian's graph: each topic folder directly
inside `wiki/` (its `decisions/`, `worklog/` and `assets/` share its colour), one
colour for the whole of `Excalidraw/`, and every other folder with notes directly
inside it — `tools/`, `templates/`. The vault root, `wiki/` itself, `raw/`,
`output/` and `bench/` have none.

- **Visible and distinct by measurement**: every colour has at least 4.5:1
  contrast on the owner's background, and every pair differs by a CIEDE2000 ΔE
  of at least 20. The most interlinked folders get the most different colours.
- **Stable**: a new folder keeps every existing colour and takes the best one
  left, relaxing only its own floor to ΔE 15; if nothing clears 15, the whole
  palette is recoloured.
- **Maintained like the icons**: `node tools/graph-colours.js` assigns and
  writes the colour groups in `.obsidian/graph.json`, which it owns entirely;
  the build warns on a folder without a group, a stale group, or a colour that
  fails either floor. Reload Obsidian after it runs.
- **Theme nodes can join the same rules.** Tag and attachment nodes are coloured
  by the theme, not by a group. List them in `GRAPH.themeNodes` with the Style
  Settings key that sets them, and the tool keeps every folder clear of them and
  sets them when Style Settings is installed.
- **The background lives in `GRAPH` in `tools/lib/rules.js`** — `null` keeps
  the tool and the check off; change it with the theme, then rerun the tool.

## Related

- [[excalidraw-drawings|Excalidraw drawings]] — the drawing workflow the required plugin serves.
- [[vault-capture-protocol|Vault capture protocol]] — where daily notes and new notes land.
- [[vault-operations|Vault operations]] — the builder that checks these settings on every run.
- [[vault-skills|Vault skills]] — the commands that compile what Calendar's daily notes capture.
