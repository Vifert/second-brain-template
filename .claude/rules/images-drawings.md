---
paths:
  - "wiki/**/assets/**"
  - "Excalidraw/**"
  - "**/*.excalidraw.md"
---

Rules for images and drawings. They load when an image or a drawing is read; the builder backs them. Moved out of the manual (`AGENTS.md`) so they load only when needed (D87).

## Images

**Text is canonical; the image is a view.** Grep cannot see pixels, and reading
an image costs ~1,000–1,600 tokens, more than three whole lookups. So an image
is kept for my eyes only, and every fact it carries also exists as text.

- **Transcribe every kept image, by type.** The builder fails any image whose
  section holds under 200 characters of text.

  | image | transcription |
  | --- | --- |
  | architecture, pipeline, flowchart | a ```` ```mermaid ```` flowchart — every box, arrow and label. Obsidian renders it; grep reads it |
  | chart or plot | a table of the plotted values (`~` for values read off an axis), the axes and units, the trend in one sentence |
  | table rendered as an image | a markdown table, verbatim — which replaces the image; don't keep the file |
  | heatmap, confusion matrix | the matrix as a table |
  | equation | LaTeX in `$$ … $$` — which replaces the image |
  | screenshot | every value and label that matters, as bullets |
  | photo or sample | what it shows, its labels, the features that distinguish it |

- **Keep only images that carry information** — architecture and pipeline
  diagrams, result charts, sample outputs. Skip logos, decoration, author photos.
- **One figure, one section**: `### Figure N — <caption>`, then the embed, the
  caption, the transcription. Each figure gets its own `_sections.tsv` range,
  and its gist is the caption. **In a log, use `#### Figure N`**, under the
  day's heading: there every `###` opens a day, and a `###` figure would cut
  the rest of that day out of its range (D88).
- **Never in the answer surface.** No embeds in `## Key Takeaways` (enforced).
  A figure's finding goes in as a sentence.
- **Storage and naming**: `wiki/<topic>/assets/<owner-slug>--<desc>.png`. The
  owner prefix ties every image to its node; the builder fails misnamed,
  misplaced, orphaned and broken images.
- **Format**: crop to the figure, never a whole page. PNG for diagrams and
  charts, JPEG at quality ~85 for photos. Longest side ≤ 1600 px, aim under
  300 KB — the builder warns above 500 KB, for repo size only.
- **Embed with a width**: `![[owner--desc.png|700]]`.
- **The delete test**: if the image file vanished, could every question about it
  still be answered? If not, the transcription is incomplete.
- **An image I paste in Obsidian** arrives as `Pasted image ….png`, in an
  `assets/` folder **beside the note I pasted it into** — the vault's
  `.obsidian/app.json` sets `attachmentFolderPath: ./assets` (D52). So a paste
  into an engagement note lands in `<engagement>/assets/`, into a journal entry in
  `journal/assets/`: each topic grows its own `assets/` with its first image.
  Two landing spots are wrong, and the builder flags both: a paste into a
  `worklog/` or `decisions/` note lands one level too deep
  (`worklog/assets/`), and a paste into a note outside `wiki/` lands outside
  it. **Ownership is decided at capture, not by where it landed**: the image
  belongs to the node that transcribes it, in that node's topic. At the next
  capture, rename it, move it there, transcribe it and fix the embed — the
  builder keeps flagging it until then.
- **A drawing stays editable** — editable Excalidraw files, not PNGs. Drawings live in `Excalidraw/<topic>/<kebab-name>.excalidraw.md`,
  never inside `wiki/` (D68). A node that needs one **embeds the live drawing**
  as a figure — `![[name.excalidraw|800]]` — and transcribes it like any image,
  adding `<!-- drawing-hash: xxxxxxxx -->`, the content hash of the drawing the
  transcription describes. The builder fails a missing or unreadable drawing,
  an embed without a hash, and a drawing in Key Takeaways, and warns when the
  drawing has changed since; the audit fails that stale transcription (D72).
  Every drawing edit updates its transcription and hash in the same step. Make
  and change drawings with the `vault-excalidraw` skill and `node tools/excalidraw.js`.
- **A drawing is finished when lint is clean *and* the render has been read for
  collisions** (D75). Lint now fails a label or a note with another connector
  drawn through it, as well as overlapping shapes, a label too big for its
  shape, and a connector crossing an unrelated shape. Two things still need
  eyes: **a connector's label sits at its path midpoint**, so it lands wherever
  the route's arithmetic puts it — to move a label, reshape its own connector,
  not the label — and a layout can be lint-clean while still reading wrong.
  Every drawing change ends with `render`, then actually looking at the PNG.

## Working Notes

- **Obsidian's attachment folder is `./assets`** — set in the versioned
  `.obsidian/app.json` (§ Images). Obsidian reads it at startup
  and rewrites the file from memory when a setting changes, so an edit made
  while it is open can be lost. The build checks it on every run, with every
  other setting the rules depend on (D69, § Obsidian Plugins).
- **Drawings render offline, with nothing installed** (`node tools/excalidraw.js
  check` proves it on a new machine). The Excalidraw plugin's `main.js` carries React and its whole
  Excalidraw build as base64-deflate strings; `tools/excalidraw.js` unpacks them
  once per plugin version into the OS temp folder and runs them in a headless
  Chromium browser with the network blocked — about two seconds a render,
  identical to what the plugin draws. A plugin update that changes that
  packaging makes the tool say so; fix its `libraryFiles()` patterns.
- **A browser can stop working headless without anyone touching it** (D77).
  An automatic Edge update once made every render return nothing while Chrome,
  installed beside it, still worked. The tool now tries every installed
  Chromium browser in turn and `node tools/excalidraw.js check` names the one
  that answered; if none does, it lists each with its failure. Set
  `EXCALIDRAW_BROWSER` to pin one.
- **`mcp-excalidraw-server` runs through `npx`, pinned to 2.0.0** — the first
  call downloads it (~40 s), later calls use npm's cache. Always give it its own
  port (`EXPRESS_SERVER_URL=http://127.0.0.1:3917 PORT=3917`), and bring its
  result back with `node tools/excalidraw.js save`, never its own
  `export --out`, which drops a drawing's frontmatter, links and embedded files.
