---
title: Vault Image Rules
summary: How images live in this vault — text is canonical and the image is a view: every figure transcribed by type, stored in its topic's assets/, and never read at query time.
aliases: [image rules, images, figures, diagrams, how are images stored, where are images stored, assets, assets folder, figure transcription, mermaid, screenshots, pasted image, image token cost, architecture diagram, where do pasted images go, attachment folder, obsidian attachments, paste an image, which assets folder]
topic: tooling
kind: hub
tags: [subject/images, subject/retrieval, subject/token-efficiency, tech/obsidian]
created: 2026-09-11
updated: 2026-09-17
---

## Key Takeaways

- **Text is canonical; the image is a view.** Grep cannot see pixels, and reading one image costs ~1,000–1,600 tokens — more than three whole lookups — so images are kept for the owner's eyes and every fact they carry also exists as text.
- **Every kept image is transcribed by type**: diagrams as Mermaid flowcharts, charts as tables of values, image tables as markdown tables, equations as LaTeX. The build fails an image whose section holds under 200 characters of text.
- **One figure, one section** — `### Figure N — caption`, the embed, then the transcription — so each figure is its own addressable range, reached for a few hundred tokens.
- **Stored as `wiki/<topic>/assets/<owner-slug>--<desc>.png`** — each topic has its own `assets/`, created with its first image. The builder fails misnamed, misplaced, orphaned or broken images.
- **Never in Key Takeaways** — a figure's finding goes in as a sentence.
- **A paste in Obsidian lands in `assets/` beside the note it was pasted into** (`attachmentFolderPath: ./assets`, set 12 September 2026). Capture then files it under the topic of the node that transcribes it.
- **The delete test**: if the image vanished, every question about it must still be answerable from the text.

## Why Text, Not Pixels

A point lookup in this vault costs about 350–450 tokens. An image read by a
model costs roughly width × height / 750 tokens — about 1,000–1,600 for a
typical figure. Reading images at query time would put every figure question
below the 30× target, and grep would still be blind to them. A transcription is
a few hundred tokens, greppable, and precise down to the number.

## Transcription By Image Type

| Image | Transcription |
| --- | --- |
| Architecture, pipeline, flowchart | a Mermaid flowchart with every box, arrow and label — Obsidian renders it, grep reads it |
| Chart or plot | a table of the plotted values (`~` for values read off an axis), the axes and units, the trend in one sentence |
| Table rendered as an image | a markdown table, verbatim — it replaces the image, which is not kept |
| Heatmap, confusion matrix | the matrix as a table |
| Equation | LaTeX in `$$ … $$` — it replaces the image |
| Screenshot | every value and label that matters, as bullets |
| Photo or sample | what it shows, its labels, the features that distinguish it |

## Files

- **Location**: the `assets/` subfolder of the topic that owns the node, so a
  client's images stay inside the client's folder.
- **Name**: `<owner-node-slug>--<desc>.png`, e.g.
  `plant-disease-classifier--fig-3-proposed-model.png`. `--` is
  reserved for image names.
- **Format**: cropped to the figure, never a whole page. PNG for diagrams and
  charts, JPEG at quality ~85 for photos. Longest side at most 1600 px; aim
  under 300 KB. The builder warns above 500 KB — repo size only, never tokens.
- **Embed**: `![[owner--desc.png|700]]`, with a width so it reads well in Obsidian.
- **Only informative images are kept**: architecture diagrams, result charts,
  sample outputs. Logos and decoration are skipped.

## Where A Paste Lands

The vault's `.obsidian/app.json` sets `attachmentFolderPath: ./assets`, so
Obsidian drops a pasted image, as `Pasted image ….png`, into an `assets/`
folder **next to the note it was pasted into** — not into one shared folder.

| Pasted into a note in | Lands in | Right place? |
| --- | --- | --- |
| a topic root, e.g. `projects/` | `projects/assets/` | yes — rename and transcribe |
| `journal/` | `journal/assets/` | yes — rename and transcribe |
| `<engagement>/worklog/` or `decisions/` | `worklog/assets/` | no — one level too deep; move to its topic's `assets/` |
| a file outside `wiki/`, like `HANDOFF.md` | `assets/` at the repo root | no — move into `wiki/` |

Where it landed does not decide where it belongs. **An image belongs to the
node that transcribes it**: a work architecture diagram pasted into a journal
entry is moved to its engagement's `assets/`, named after the node that owns it, and
transcribed there. The journal entry may embed it too, if that section says
in its own words what the image shows — the 200-character check applies to
every embed. The builder flags
every pasted image — wrong name, wrong folder, or outside `wiki/` (D52) —
until the next capture renames, moves and transcribes it.

## Drawings

An Excalidraw drawing is the one figure that stays editable: a node embeds the
live drawing, not a PNG, and its transcription records a `drawing-hash` so a
later edit to the drawing shows up as stale (D72). The transcription rules above
apply unchanged. See [[excalidraw-drawings|Excalidraw drawings]].

## Related

- [[vault-capture-protocol|Vault capture protocol]] — where images land.
- [[vault-operations|Vault operations]] — the tooling that validates them.
- [[second-brain-architecture|Second brain architecture]] — the cost model behind the rule.
