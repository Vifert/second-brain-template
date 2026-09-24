# Designing a drawing that says something

Distilled from two open projects and rewritten for this vault: the design
method of coleam00/excalidraw-diagram-skill (diagrams that argue, pattern
library, render-and-fix loop) and the layout rules of yctimlin/mcp_excalidraw
(sizing, spacing, anti-patterns, palette; MIT).

## Contents

- The test a drawing must pass
- Choosing the depth
- Pattern first, boxes second
- Boxes are earned
- Colour and line as meaning
- Size, space and type
- Anti-patterns
- Big drawings
- The look-and-fix checklist

## The test a drawing must pass

A drawing earns its place when its **shape carries the idea**. Two checks:

- **Take the words away.** Could someone still tell a pipeline from a fan-out
  from a loop? If every idea is the same box in a grid, the drawing is a list
  with borders — write the list instead.
- **Would someone learn something concrete?** "Service → Database" teaches
  nothing. "`build_order_history` writes 12M rows → warehouse table `orders_v2`"
  teaches the actual system. In this vault the real names are one card away:
  use them.

## Choosing the depth

- **Conceptual** — a mental model, a decision, a comparison. Abstract shapes,
  few words, no code. Most idea and career drawings.
- **Technical** — a real system: a work pipeline, the vault's own tooling. Use
  the actual job, table, file and command names from the nodes. Where it helps,
  show evidence: a dark rectangle (`#1e293b`, text `#e9ecef`, `fontFamily: 3`)
  holding a short real snippet — a row's shape, the command that runs it.
  Research before drawing, and draw only what the vault or the owner confirms.

Large technical drawings work at three zoom levels at once: a one-line summary
flow along the top, zones grouping what belongs together, detail inside each
zone.

## Pattern first, boxes second

Pick the structure that behaves like the idea, then place shapes on it.

| The idea… | Draw it as |
| --- | --- |
| is a sequence of steps | a left-to-right **line** of steps, or a **timeline**: a line with small dots (12–16px ellipses) and free text beside each |
| feeds many things | a **fan-out** from one source |
| combines many things | a **convergence** into one result |
| branches into parts | a **tree**: lines and free text, no boxes |
| repeats or improves | a **cycle**, with an arrow back to the start |
| turns input into output | an **assembly line**: before → process → after, showing what goes in and comes out |
| compares options | **side by side**, the same structure mirrored, differences highlighted |
| has phases or boundaries | **zones**: pale rectangles with a title at the top-left edge, or a gap |
| is a yes/no choice | a **diamond** with labelled exits |

A drawing with several ideas gives each its own pattern. Uniform card grids
are the failure mode.

## Boxes are earned

Default to free text. Put a shape around words only when:

- arrows need to attach to it,
- it is a distinct thing in the system (a job, a table, a person, a service),
- the shape itself means something (a diamond decides, an ellipse starts or ends),
- it is the focal point of a zone.

Titles, notes, captions and annotations stay free text; size and colour give
them rank. If more than about a third of the text sits in boxes, look again.

Shape meaning, held consistent across drawings:

| Thing | Shape |
| --- | --- |
| start, input, trigger; end, output | ellipse |
| step, job, component, service | rectangle |
| decision | diamond |
| data store, table | ellipse or rectangle in the data colour |
| timeline marker | small ellipse |
| hierarchy node | line + free text |

## Colour and line as meaning

Use Excalidraw's own palette — the colours the owner sees in the plugin's picker,
so their edits match yours. Pair a strong stroke with its pale fill. Three or
four fills per drawing; a colour always means the same thing within one.

| Meaning | Stroke | Fill |
| --- | --- | --- |
| default, text | `#1e1e1e` | `#ffffff` |
| primary step, component | `#1971c2` | `#a5d8ff` |
| done, success, healthy | `#2f9e44` | `#b2f2bb` |
| error, risk, blocked | `#e03131` | `#ffc9c9` |
| input, start, async, event | `#e8590c` | `#ffd8a8` |
| service, AI, middleware | `#9c36b5` | `#eebefa` |
| data store, table | `#0c8599` | `#99e9f2` |
| note, open question | `#f08c00` | `#fff3bf` |
| zone, annotation, secondary | `#868e96` | `#e9ecef` |

Status follows the vault's Status Log words: **done** green, **active / in
progress** blue, **pending / not started** grey with a dashed stroke,
**blocked** red. Line style carries meaning too: **solid** for what happens,
**dashed** for planned, optional, async or not yet started, **dotted** for a
weak link or an annotation pointer. Keep `opacity` at 100; hierarchy comes from
size and colour, not transparency.

## Size, space and type

- A 20px grid. Siblings 60–100px apart; 140px or more when the arrow between
  them is labelled. Tiers 100–140px apart. Zones pad their contents by 40px.
- Shapes at least 120×60. Width at 20px type: about 11px a character of the
  longest line, plus 30. Same-role shapes share one size.
- The most important element gets the most space around it.
- Type: 28 for a title, 20 for shape labels, 16 for notes and zone titles,
  never under 14. `fontFamily` 5 (Excalifont) for the hand-drawn look the
  plugin uses by default, 3 (Cascadia) for code and identifiers, 6 (Nunito)
  when the owner wants it clean. `roughness: 1` by default; `0` for a crisp
  technical drawing if they prefer it.
- Flow reads left to right or top to bottom. Every relationship gets a
  connector — nearness alone says nothing.

## Anti-patterns

- **A label on a zone rectangle.** It centres over everything inside. Title a
  zone with free text at its top-left edge. (Lint catches this.)
- **Long connectors across zones.** They cut through everything between. Put
  related zones next to each other, or route along the edges with waypoints.
- **A label on every arrow.** Label only what the reader cannot infer — a
  protocol, a volume, "yes"/"no". Keep labels short; a label as long as its
  arrow hides the arrow. (Lint catches the worst case.)
- **Overlaps and clipped text.** (Lint catches both.)
- **Everything boxed, everything the same size.** See *Boxes are earned*.
- **Invented detail.** A drawing is a claim like any node sentence: names and
  numbers come from the vault or from the owner.

## Big drawings

Build a large drawing in sections — one `new` for the first, one `apply` per
further section — and look at each before the next. Name ids by section
(`ingestRaw`, `ingestDq`, `loadBt01` — 8 characters if the element is free
text) so cross-section arrows read clearly, and leave generous space between sections: moving a whole section
later means listing all its ids.

## The look-and-fix checklist

After every `new` or `apply`, read the PNG, then check in this order.

**Does it say what you planned?**
1. The structure matches the idea: the pattern you chose is visible.
2. The eye travels in the intended order.
3. The most important thing looks most important.
4. Names and numbers are the real ones.

**Is anything wrong with it?**
5. Lint errors: none left.
6. No text clipped, overlapping or too small to read.
7. Connectors land on the right shapes and cross nothing they should not.
8. Labels sit clearly by what they describe.
9. Spacing is even where things are alike; no cramped corner beside an empty one.

Fix, render, look again. Stop when both halves pass — not merely when lint is
quiet.
