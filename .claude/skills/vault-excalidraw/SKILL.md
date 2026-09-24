---
name: vault-excalidraw
description: Create, extend, rearrange, restyle and manage Excalidraw drawings in this second-brain Obsidian vault as editable .excalidraw.md files, iterating with its owner round by round, and keep the notes that embed them in sync. Use this whenever the owner asks to draw, sketch, diagram, map or visualise anything in the vault — a pipeline, architecture, flow, timeline, mind map — or mentions Excalidraw, "my drawing" or "the diagram", wants to add to, change, fix or tidy an existing drawing, wants a drawing embedded in or transcribed into a note, wants a live canvas to draw on together, wants Mermaid turned into Excalidraw, or wants an excalidraw.com share link — even when they never say "Excalidraw". Not for a Mermaid block written straight into a note, image files, or Obsidian Canvas (.canvas).
---

# Excalidraw drawings in the vault

A drawing here has two jobs. For the owner it is a picture they open and edit in
Obsidian, so it must stay a real, editable Excalidraw file that looks right.
For retrieval it is invisible — grep cannot read a drawing — so whatever it
says must also exist as text in the note that embeds it. Everything below
serves one or both of those jobs.

This is a working relationship, not a one-shot export: expect to make a
drawing, show it, hear what to change, change it, and come back to it days
later after they have moved things around themselves.

## Ground rules, and why

- **Drawings live in `Excalidraw/<topic>/<kebab-name>.excalidraw.md`**, where
  `<topic>` is the wiki topic the drawing belongs to (`tooling`,
  `projects`, …). The builder fails a drawing anywhere else (D68). Drawings
  the owner makes arrive as `Excalidraw/Drawing 2026-09-17 18.02.11.excalidraw.md`;
  keep their names unless they ask for a new one, or offer one.
- **Never replace a drawing with an image.** A PNG render is for you to look at
  your own work, or to show the owner in chat. The vault keeps the editable file.
- **Edit through `node tools/excalidraw.js`, not by writing drawing JSON by
  hand.** The tool runs the Excalidraw engine bundled in the vault's own Obsidian
  plugin, offline: labels are measured in the real fonts, arrows are bound at
  both ends, the plugin's `## Element Links` and `## Embedded Files` sections
  survive, and a write is refused if Obsidian saved the file while you were
  working. Hand-written JSON gets all four of those wrong sooner or later.
- **A note embeds the live drawing, with a transcription beside it.** The
  transcription carries `<!-- drawing-hash: xxxxxxxx -->`, the hash of the
  drawing it describes; the builder fails an embed without one and warns when
  the drawing has changed since (D72). See *Putting a drawing in a note*.
- **Obsidian may have the drawing open.** It reloads the file when you write
  it. If the owner has unsaved strokes, the tool exits with code 3 and writes
  nothing — say so, wait a moment, run it again. The owner's edits always win: re-read
  with `info` before a new round rather than reapplying an old plan.
- **excalidraw.com share links only when the owner asks for one.** A link uploads the drawing, encrypted; anyone holding the
  full link can view it.
- **Nothing is ever deleted by you.** If a drawing should go, say so and let
  the owner remove it.

## The tool

Run from the vault root. `<drawing>` is a path or just a name found under
`Excalidraw/` (`query-ladder`, `"Drawing 2026-09-17 18.02.11"`).

| Command | What it does |
| --- | --- |
| `list` | every drawing, newest first: element count, hash, which notes embed it and whether their transcription is current |
| `info <drawing>` | shapes, text and connectors with their ids, positions, labels and colours — cheap text, no rendering |
| `render <drawing> [--out f.png] [--scale 2] [--dark]` | a PNG exactly as the plugin draws it; prints the path — look at it with Read |
| `new <drawing> <spec.json>` | create a drawing from element skeletons, render it, lint it |
| `apply <drawing> <patch.json>` | `delete` / `create` / `update` / `move` on an existing drawing, then render and lint |
| `lint <drawing>` | overlapping shapes, labels too big for their shape, connectors through shapes or hidden by their label, **a label or a note with another connector drawn through it (D75)**, broken references |
| `transcribe <drawing>` | a Mermaid + notes draft of the transcription, with the `drawing-hash` line |
| `hash <drawing>` | the hash alone |
| `save <drawing> <scene.json>` | write a scene from the live canvas back into a drawing, keeping its links, embedded files and corners |
| `check` | proves rendering works on this machine |

`new`, `apply` and `save` print JSON: the ids created, updated, deleted and
renamed, the PNG path, the lint result, the new hash, and `embeddedIn` — each note that
embeds the drawing and whether its transcription is now stale.

Write spec and patch JSON with your file-writing tool into the session scratchpad and
pass the path. Long heredocs are fragile in some shells, Windows especially. The element and patch
formats are in `references/spec.md`; read it before your first `new` or
`apply` in a session.

## Making a new drawing

1. **Know what it has to say.** Pull what the drawing is about from the vault
   the cheap way (Query Protocol in AGENTS.md: route, then one card or section)
   so names, tables, jobs and statuses in it are real. Run `list` in case a
   drawing of this already exists; extending one beats a near-duplicate.
2. **Design before coordinates.** For anything beyond a handful of boxes, read
   `references/design.md`: pick the pattern that mirrors the idea (a pipeline
   is a line, a fan-out is a fan-out, a decision is a diamond), decide what is
   boxed and what is free text, and sketch the grid.
3. **Build it.** Write the spec; `new`. For a big diagram, create the first
   section with `new` and add each further section with its own `apply` — each
   round stays small enough to get right and to look at.
4. **Look, then fix.** Read the PNG every time. Fix every lint error, then what
   the eye catches that lint cannot — a lopsided layout, an arrow that lands
   somewhere misleading, a label that reads wrong. Two or three rounds is
   normal; stop when you would show it without apology.
   **A connector's label sits at its path midpoint**, so it lands wherever the
   route's arithmetic puts it, not where you meant. To move one, reshape its
   own connector — a dog-leg near an end shifts the midpoint — and never the
   label. Lint now fails a label or a note with another line through it (D75),
   but it was blind to that case once, so the render is still the last word.
5. **Show the owner.** Give them the path (it opens in Obsidian) and a one-line
   summary of what the drawing argues; ask what to change.
6. **If it holds knowledge, put it in a note** (below). If the folder is new,
   give it an Iconize icon in the same step (`.claude/rules/obsidian.md` § Obsidian Plugins); the
   `new` output reminds you.

## Changing a drawing — theirs or yours

1. `info` to get ids and labels. Render only when layout matters to the change.
2. Write a patch: reword with `update` + `label`, recolour with `update`,
   rearrange with `move` (connectors follow), add with `create` (an arrow can
   bind to any existing id), remove with `delete` (its label and connectors go
   with it). One patch per request is usually right.
3. `apply`, read the PNG, fix what lint or your eye reports.
4. If `embeddedIn` says **STALE**, update that note's transcription and hash
   now (below), then rebuild. A drawing change is not finished while its note
   still describes the old picture.
5. Tell the owner what changed in a sentence, and offer the obvious next tweak if
   there is one.

When the owner has been editing in Obsidian between rounds, their layout is the new
baseline: `info` first, patch against what is there now, and never
`new --replace` over a drawing they have touched.

## Putting a drawing in a note

The note that owns the concept embeds the drawing in a body section — never
in Key Takeaways — as a figure, and transcribes it (`.claude/rules/images-drawings.md` § Images):

```markdown
### Figure 1 — Daily note to wiki

![[daily-note-flow.excalidraw|800]]

*Figure 1: how a daily note written in Obsidian becomes log entries and nodes.*
Edit the drawing in Obsidian; this transcription is what retrieval reads.

(Mermaid flowchart and notes from `transcribe`, checked against the render)

<!-- drawing-hash: 3f9a1c07 -->
```

`transcribe` gives a draft: every labelled shape and connector as Mermaid,
zones as subgraphs, free text and loose arrows as notes. Check it against the
render and add what Mermaid cannot carry — what a colour or a dashed line
means, a title's context. Keep the drawing's words exact. Then
`node tools/build-index.js` and confirm no D72 problem or warning.

Every later change to the drawing repeats the transcription update. The hash
is what tells a future session the note fell behind.

## The live canvas

yctimlin's `mcp-excalidraw-server` (pinned to 2.0.0) gives a browser canvas
the owner can watch and draw on while you edit elements from the terminal, plus
Mermaid-to-Excalidraw conversion and excalidraw.com share links. Use it when the owner
wants to draw together in a browser, has Mermaid to convert, or asks for a
link — otherwise the file tools above are faster and keep everything. Read
`references/live-canvas.md` first; the one rule that matters is that a canvas
result comes back into the vault through `node tools/excalidraw.js save`, never
the server's own `export --out`.

## Managing drawings

- **Inventory**: `list`. A drawing no note embeds is invisible to retrieval;
  the audit lists them as a watch item. Ask the owner whether one holds knowledge
  worth transcribing — a scratch sketch does not.
- **Renaming**: best done by the owner inside Obsidian, which updates links. If
  you do it, `git mv` the file, grep `wiki/` for `[[old-name.excalidraw` and fix
  each link, then rebuild.
- **Stale transcriptions**: the builder's warning and the audit's problem name
  the note and line; `transcribe` the drawing and update that section.
- **Commit** with the session's other vault changes, after the build validates.

## When something goes wrong

- *No browser found*, or *no installed browser returned a result*: rendering
  needs a Chromium browser (Edge, Chrome, Chromium) that runs headless. Every
  installed one is tried in turn and the error names each with its failure —
  a browser can stop working headless after an automatic update (D77). Set
  `EXCALIDRAW_BROWSER` to one that works.
- *The plugin's bundled library was not found*: the Excalidraw plugin changed
  its packaging in an update; `tools/excalidraw.js` `libraryFiles()` needs its
  pattern updated.
- *Exit 3, changed on disk*: Obsidian saved the drawing mid-edit; run again.
- *It looks different in Obsidian*: ask the owner to close and reopen the drawing;
  the plugin caches the scene it loaded.
- *An id is missing*: a free text's id must be exactly 8 letters and digits,
  because that is all the plugin's parser reads; any other is renamed on write
  (see `renamedIds`). Run `info` for the current ids.
- *Labels show the wrong words in Obsidian*: the drawing was written with short
  text ids by something else. `apply` with an empty patch (`{}`) rewrites it
  correctly; the audit names such drawings (D73).
