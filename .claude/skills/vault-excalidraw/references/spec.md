# Spec and patch formats for tools/excalidraw.js

`new` takes a **spec** (element skeletons); `apply` takes a **patch**. Both
are JSON files. Skeletons are Excalidraw's own `ExcalidrawElementSkeleton`
format, passed to the plugin's `convertToExcalidrawElements`, with three
conveniences added by the tool: `label` may be a plain string, arrows take
`from` / `to` ids and route themselves, and a filled shape defaults to a solid
fill.

## Contents

- Coordinates
- Element skeletons: shapes, text, connectors, frames
- Style values
- Patches: delete, create, update, move
- Examples
- Output and exit codes

## Coordinates

`x` grows to the right, `y` grows downward, and an element's `x, y` is its
top-left corner. Plan on a 20px grid. Nothing needs to start at 0,0.

## Element skeletons

### Shapes — `rectangle`, `ellipse`, `diamond`

```json
{ "type": "rectangle", "id": "ingest", "x": 0, "y": 0, "width": 180, "height": 80,
  "label": "BigQuery ingest",
  "strokeColor": "#1971c2", "backgroundColor": "#a5d8ff" }
```

- `id` — pick short readable ids (`ingest`, `dq-check`); you address the
  element by it later. Shape ids are kept as given.
- `label` — a string, or `{ "text": "…", "fontSize": 20, "fontFamily": 5,
  "strokeColor": "#1e1e1e", "textAlign": "center", "verticalAlign": "middle" }`.
  `\n` breaks a line; long text wraps to the shape's width and the shape grows
  taller to fit. A label is its own text element with a generated id; change it
  through the shape (`update` with `label`), not by that id.
- `width` — at 20px, allow roughly 11px per character of the longest line plus
  30px, and at least 120. Height 60–80 for one or two lines.
- `roundness` — omitted: rounded corners, as Excalidraw draws by default.
  `null`: sharp corners.
- `link` — `"[[vault-operations]]"` makes the shape open that note in Obsidian.

### Free text — `text`

```json
{ "type": "text", "id": "title", "x": 0, "y": -80, "text": "How a question is answered", "fontSize": 28 }
```

Width and height are measured for you. **A text element's id must be exactly
8 letters and digits** (`titleTop`, `noteZone`): the plugin finds each text
by an 8-character block id and misreads any other, gluing its words onto the
next label. The tool renames any other id on write and lists the change in
`renamedIds` — so choose 8-character ids for free text you will address again.

### Connectors — `arrow`, `line`

```json
{ "type": "arrow", "id": "ingest-dq", "from": "ingest", "to": "dq-check", "label": "rows" }
```

- `from` / `to` bind the ends to existing ids — elements in this same spec or
  patch, or already in the drawing. With both and no `points`, the connector
  runs straight from outline to outline and moves when either shape moves.
- To bend around something, give absolute waypoints and no `x`/`y`; the first
  and last points are snapped onto the two outlines:
  `{ "type": "arrow", "from": "a", "to": "b", "points": [[90, 80], [90, 200], [400, 200], [400, 80]] }`
- An unbound connector needs `x`, `y` and relative `points`: `{ "type": "line",
  "x": 0, "y": 300, "points": [[0, 0], [800, 0]], "strokeStyle": "dashed" }`.
- `startArrowhead` / `endArrowhead`: `null`, `"arrow"`, `"bar"`, `"dot"`,
  `"triangle"`. Arrows default to an end arrowhead; lines to none.
- An arrow `label` sits at the midpoint and hides the line behind it, so keep
  it under ~12 characters and leave the connector at least label width + 60px
  long. Lint reports a label that swallows its line.

### Frames — `frame`

```json
{ "type": "frame", "id": "phase-1", "name": "Phase 1", "children": ["ingest", "dq-check"] }
```

A frame's children must be created in the same `create` list. For a simple
visual zone, use a large rectangle with a pale fill and a free `text` title at
its top-left edge instead — never a `label` on the zone, which would sit in the
middle of its contents.

## Style values

| Property | Values |
| --- | --- |
| `strokeColor`, `backgroundColor` | hex; `"transparent"` for no fill (palette in `design.md`) |
| `fillStyle` | `"solid"` (default when a fill is set), `"hachure"`, `"cross-hatch"` |
| `strokeWidth` | `1` thin, `2` normal, `4` bold |
| `strokeStyle` | `"solid"`, `"dashed"`, `"dotted"` |
| `roughness` | `0` clean, `1` hand-drawn (Excalidraw's default), `2` sketchy |
| `opacity` | 0–100 |
| `fontFamily` | `5` Excalifont (hand-drawn, default), `6` Nunito (clean), `3` Cascadia (code), `2` Helvetica |
| `fontSize` | 16 body, 20 labels, 28 titles; never under 14 |
| `groupIds` | `["g1"]` — elements sharing an id move and select together |

## Patches

```json
{
  "delete": ["old-box"],
  "create": [ skeletons as above ],
  "update": [ { "id": "dq-check", "label": "DQ checks", "backgroundColor": "#b2f2bb" } ],
  "move":   [ { "ids": ["publish", "archive"], "dx": 220, "dy": 0 } ]
}
```

They run in that order — delete, create, update, move — so an update or move
can name something created in the same patch. Any key may be left out.

- **delete**: ids. The element's label and every connector attached to it go
  too; connectors that pointed at it from elsewhere are removed with it. The
  output lists everything deleted.
- **create**: skeletons; ids must be new.
- **update**: `id` plus any properties to set. Special keys:
  - `label` (string or object) rewords a shape's or connector's label, creating
    one if there was none; `""` removes it. On a free `text` element use
    `text` or `label`.
  - `fontSize`, `fontFamily`, `textAlign` on a shape restyle its label.
  - Changing `x`, `y`, `width` or `height` re-routes attached connectors and
    re-centres the label. `dx` / `dy` shift by an amount.
  - Changing a shape's `strokeColor` recolours its label when the label had
    matched the old stroke.
- **move**: `ids` with `dx` / `dy`. Each element moves with its label, and
  connectors attached to it re-route. Moving a zone does not move what is
  inside it — list those ids too.

An elbow arrow attached to something that moves comes back straight; the
output warns so you can say so.

## Examples

A three-step pipeline with a title and a zone:

```json
{ "elements": [
  { "type": "text", "id": "title", "x": 0, "y": -70, "text": "Customer data refresh", "fontSize": 28 },
  { "type": "rectangle", "id": "zone", "x": -40, "y": -20, "width": 820, "height": 160, "backgroundColor": "#e9ecef", "strokeStyle": "dashed", "roughness": 0 },
  { "type": "text", "id": "zonet", "x": -20, "y": -10, "text": "E1 → E2 → Pre-Prod", "fontSize": 16, "strokeColor": "#868e96" },
  { "type": "rectangle", "id": "raw", "x": 0, "y": 40, "width": 180, "height": 70, "label": "Raw files", "backgroundColor": "#ffd8a8", "strokeColor": "#e8590c" },
  { "type": "rectangle", "id": "build", "x": 280, "y": 40, "width": 180, "height": 70, "label": "Customer build", "backgroundColor": "#a5d8ff", "strokeColor": "#1971c2" },
  { "type": "ellipse", "id": "bt", "x": 560, "y": 40, "width": 180, "height": 70, "label": "Warehouse", "backgroundColor": "#99e9f2", "strokeColor": "#0c8599" },
  { "type": "arrow", "id": "a1", "from": "raw", "to": "build" },
  { "type": "arrow", "id": "a2", "from": "build", "to": "bt", "label": "load" }
] }
```

Inserting a step between `build` and `bt`: make room, add the box, rewire.

```json
{
  "move": [ { "ids": ["bt"], "dx": 280 } ],
  "update": [ { "id": "zone", "width": 1100 } ],
  "delete": ["a2"],
  "create": [
    { "type": "rectangle", "id": "dqf", "x": 560, "y": 40, "width": 180, "height": 70, "label": "DQ checks", "backgroundColor": "#b2f2bb", "strokeColor": "#2f9e44" },
    { "type": "arrow", "id": "a2", "from": "build", "to": "dqf" },
    { "type": "arrow", "id": "a3", "from": "dqf", "to": "bt", "label": "load" }
  ]
}
```

Note the order: `delete` removes the old `a2` first, so `create` may reuse the
id, and the `move` of `bt` runs last.

## Output and exit codes

`new`, `apply` and `save` print JSON: `file`, `created`, `updated`, `deleted`,
`renamedIds`, `warnings`, `png`, `hash`, `lint` (`errors`, `warnings`, `items`) and, when
notes embed the drawing, `embeddedIn` with each transcription's state.

Exit 0 on success (lint findings do not fail a write — read them), 1 on an
error (unknown id, bad JSON, a file the plugin would misread; nothing written), 2 on a usage error, 3 when the
drawing changed on disk mid-edit (nothing written; run it again).
