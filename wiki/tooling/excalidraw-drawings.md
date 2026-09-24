---
title: Excalidraw Drawings
summary: How the owner's Excalidraw drawings live in the vault — editable files under Excalidraw/, embedded live in notes with a hashed transcription, made and changed with the vault-excalidraw skill.
aliases: [Excalidraw, excalidraw drawings, drawings, drawing, my drawings, my excalidraw, draw a diagram, sketch a diagram, diagram in excalidraw, editable drawing, embed a drawing, drawing in a note, .excalidraw.md, Excalidraw folder, vault-excalidraw, excalidraw skill, drawing skill, drawing-hash, drawing hash, stale transcription, live canvas, mcp-excalidraw-server, mcp_excalidraw, excalidraw-diagram-skill, coleam00, yctimlin, share link, excalidraw.com, mermaid to excalidraw, render a drawing]
topic: tooling
kind: hub
tags: [tech/excalidraw, tech/obsidian, subject/images, subject/second-brain]
created: 2026-09-17
updated: 2026-09-23
---

## Key Takeaways

- **Drawings stay editable Excalidraw files** — a design rule, not a preference — at `Excalidraw/<topic>/<name>.excalidraw.md`, never inside `wiki/` and never swapped for a PNG.
- **A note embeds the live drawing** as a figure and transcribes it, adding `<!-- drawing-hash: … -->`: grep reads the text, never the drawing (D72).
- **The build catches a drawing edited after its transcription**: the builder warns and the audit fails until the text and hash are updated.
- **The `vault-excalidraw` skill** makes and changes drawings round by round with the owner; it lives in `.claude/skills/vault-excalidraw/`.
- **`tools/excalidraw.js` does the editing and rendering**, running the Excalidraw build bundled in the vault's own Excalidraw plugin in a headless Chromium browser, offline — about two seconds a render.
- **The live canvas** is yctimlin's `mcp-excalidraw-server` 2.0.0, for drawing together in a browser, Mermaid import and excalidraw.com share links, made only when the owner asks.
- **The skill was built, not installed**: coleam00's and yctimlin's skills clashed with each other and with the vault's rules, so it keeps their design method and canvas and adds the vault's rules.
- **Drawings save uncompressed and no formatter may touch them** (D71), so git diffs are readable and nothing reformats the JSON below "# Excalidraw Data".

## How A Drawing Lives In The Vault

- **Where**: `Excalidraw/<topic>/`, one level deep, mirroring the wiki topics
  (`Excalidraw/tooling/`, `Excalidraw/acme-engagement/`). The builder fails a
  drawing anywhere outside `Excalidraw/` (D68). A drawing the owner starts in
  Obsidian lands at `Excalidraw/` with the plugin's date name, such as
  `Drawing 2026-09-17 18.02.11.excalidraw.md`, until it is filed.
- **Names**: kebab-case, unique across the vault — Obsidian resolves an embed
  by file name, and the builder fails two drawings sharing one.
- **Text ids are exactly 8 letters and digits.** The plugin finds each text
  under `## Text Elements` by an 8-character block id and glues the words of
  any other id onto the next label. The first test drawings, written with ids
  like `title`, would have opened with 13 and 5 labels wrong; the tool now
  renames such ids on write and refuses a file the plugin would misread, and
  the builder and audit check every drawing (D73). The rename is derived from
  the id given, so a later patch may still name the text by it.
- **Containment**: an engagement's drawings sit in the matching
  `Excalidraw/<topic>/`, so archiving an engagement means `wiki/acme-engagement/` plus
  `Excalidraw/acme-engagement/`.
- **Format**: the plugin's markdown file — frontmatter
  (`excalidraw-plugin: parsed`), `# Excalidraw Data` with `## Text Elements`
  (each text as a block reference), optional `## Element Links` and
  `## Embedded Files`, and the scene JSON in a `## Drawing` block. With
  `compress` off the JSON is plain; older compressed drawings still read.
- **New folders** get an Iconize icon in the same step.

## Working On Drawings Together

The skill treats a drawing as ongoing work, not a one-off export:

1. For a new drawing, pull the real names from the vault first, pick a pattern
   that mirrors the idea (a pipeline is a line, a decision a diamond), then
   `new` from element skeletons.
2. Every round is one `apply` patch — `delete`, `create`, `update`, `move` —
   followed by a render the agent looks at and a lint. Moving a shape re-routes its
   connectors and keeps bent ones at right angles.
3. The owner keeps the drawing open in Obsidian, which reloads it when the file
   changes. His own edits are the new baseline: the next round starts from
   `info`, never from an old plan. If Obsidian saves mid-edit, the tool writes
   nothing and exits 3.
4. When the drawing holds knowledge, it is embedded and transcribed (below).

## Drawings In Notes

A figure section in the owning node, never in Key Takeaways:

- `### Figure N — caption`, then `![[name.excalidraw|800]]`, a caption, the
  transcription — a Mermaid flowchart of the shapes and connectors plus notes
  on free text, colour and line meaning — and `<!-- drawing-hash: … -->`.
- `node tools/excalidraw.js transcribe <drawing>` drafts the Mermaid and prints
  the hash; the draft is checked against the render before it goes in.
- The hash covers what a reader sees — shapes, positions, colours, words,
  which elements each connector joins — and ignores what the plugin recomputes
  on save, so opening a drawing does not make it stale and moving a box does.
- The builder fails an embed of a missing or unreadable drawing, an embed with
  no hash, a drawing in Key Takeaways, and a thin transcription; it warns on a
  stale hash. The audit fails a stale hash and lists drawings no note embeds as
  a watch item (D72).

## The Tool

`node tools/excalidraw.js <command>`, from the vault root:

| Command | Does |
| --- | --- |
| `list` | every drawing, newest first, with where it is embedded and whether each transcription is current |
| `info` | shapes, text and connectors with ids — text only, no render |
| `render` | a PNG exactly as the plugin draws it |
| `new`, `apply` | create from skeletons; patch an existing drawing — each renders and lints |
| `lint` | overlaps, labels too big for their shape, connectors through shapes or hidden by their label, broken references |
| `transcribe`, `hash` | the transcription draft and the content hash |
| `save` | bring a live-canvas scene back into a drawing, keeping its links, embedded files and sharp corners |
| `check` | proves rendering works on the machine |

## Rendering Offline

The Excalidraw plugin's `main.js` (2.27.3, as of 17 September 2026) carries
React and its Excalidraw build (fork 0.18.134) as base64-deflate strings. The
tool unpacks them once per plugin version into the OS temp folder and runs a
page in a headless Chromium browser with the network blocked — each installed
browser tried in turn until one answers (D77) — so text is measured
in the plugin's own fonts and a render matches what Obsidian shows. Nothing is
downloaded or installed.

## The Live Canvas And Share Links

- `npx -y mcp-excalidraw-server@2.0.0` (MIT, yctimlin) starts a canvas on a
  local port — 3917 by convention — that the owner can open in a browser and draw
  on while the agent edits elements from the terminal.
- It adds Mermaid-to-Excalidraw conversion and `share`, which encrypts a drawing
  and uploads it to excalidraw.com; anyone with the full link can view it. Share
  links are made only when the owner asks, and never written into a note or commit.
- A canvas result returns through `tools/excalidraw.js save`. The server's own
  export writes a fresh file that drops frontmatter, `## Element Links` and
  `## Embedded Files` and rounds every sharp corner — seen in testing on
  17 September 2026.

## Where The Skill Came From

The skill was built in Vifert's vault on 17 September 2026. He asked for either
the two published skills or a custom one built with skill-creator, then for
editable drawings, round-by-round work, and permission to use external
libraries. It ships unchanged with this vault.

| Source | Kept | Not kept, and why |
| --- | --- | --- |
| coleam00/excalidraw-diagram-skill | The design method — diagrams that argue, the pattern library, boxes only where earned, the render-look-fix loop — rewritten in the skill's `references/design.md` | Hand-written JSON, a Python and Playwright renderer that loads Excalidraw from esm.sh, raw `.excalidraw` files the plugin opens only in compatibility mode; the repo has no licence, so nothing is copied verbatim |
| yctimlin/mcp_excalidraw | The live canvas CLI, pinned; the Obsidian file-format notes; sizing rules, anti-patterns and the palette | Its export as the way back into the vault, for the losses above |

Installed side by side, the two skills would also have given contradictory
instructions for the same request, and neither knew the vault's folders,
transcription rule or build checks.

## Related

- [[vault-skills|Vault skills]] — vault-excalidraw beside the three gated skills.
- [[vault-image-rules|Vault image rules]] — the transcription rules a drawing figure follows.
- [[obsidian-plugins|Obsidian plugins]] — the Excalidraw plugin's settings and what it writes.
- [[vault-operations|Vault operations]] — the builder and audit that check drawing embeds.
- [[vault-capture-protocol|Vault capture protocol]] — where a drawing request goes.
