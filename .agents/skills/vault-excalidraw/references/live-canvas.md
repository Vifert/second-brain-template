# The live canvas — mcp-excalidraw-server

yctimlin/mcp_excalidraw (MIT) runs an Excalidraw web canvas on this machine
and a CLI that edits it element by element. Use it when the owner wants to watch
or draw in a browser while you work, has Mermaid to turn into Excalidraw, or
asks for an excalidraw.com share link. For ordinary edits, `tools/excalidraw.js`
on the file is faster and keeps more.

## Contents

- Setup
- A session
- Getting the result back into the vault
- Mermaid
- Share links
- Limits

## Setup

Always the pinned version, on a port of its own, set in the same command as
the call (shell state does not persist between Bash calls):

```bash
EXPRESS_SERVER_URL=http://127.0.0.1:3917 PORT=3917 npx -y mcp-excalidraw-server@2.0.0 start
```

The first run downloads the package (about 40 seconds). Below, `$C` stands
for `EXPRESS_SERVER_URL=http://127.0.0.1:3917 npx -y mcp-excalidraw-server@2.0.0`.
The server listens on 127.0.0.1 only and keeps the scene in memory; stopping
it loses anything not saved back.

Open the canvas for the owner: if your agent has a built-in browser pane (the
Claude desktop app has one, opened with `preview_start` and that url), open
`http://127.0.0.1:3917` there; otherwise ask them to open it. Screenshots, image export and Mermaid
conversion only work while a tab is open.

## A session

```bash
$C import "Excalidraw/tooling/query-ladder.excalidraw.md" --replace   # load a vault drawing
$C describe                                                            # ids, positions, labels
$C apply patch.json                                                    # edits (format below)
$C screenshot --out <scratchpad>/canvas.png                            # then Read the PNG
$C snapshot save before-regroup                                        # a restore point
$C arrange align --ids a,b,c --to top                                  # align, distribute, group, lock
```

The canvas CLI has its own element format, not `tools/excalidraw.js`'s:

- a shape label is `"text": "…"` on the shape;
- arrows bind with `"startElementId"` / `"endElementId"` and need `"x": 0, "y": 0`;
- `apply` takes `{"create": [...], "update": [{"id": "a", "set": {...}}], "delete": ["id"]}`;
- `fontFamily` must be a string (`"5"`), never a number.

The owner's own changes in the browser sync to the server, so `describe` and the
screenshot always show the combined state. Work in small steps and screenshot
after each.

## Getting the result back into the vault

Never `$C export --out` onto a vault drawing. That writes a fresh file: the
drawing's frontmatter, `## Element Links` and `## Embedded Files` are lost,
sharp corners come back rounded, and labels keep the canvas's estimated sizes.
Export to the scratchpad and save through the vault tool instead:

```bash
$C export > <scratchpad>/canvas-scene.json
node tools/excalidraw.js save "Excalidraw/tooling/query-ladder.excalidraw.md" <scratchpad>/canvas-scene.json
```

`save` keeps everything the file had around the scene, restores the corners,
re-measures every label in the plugin's fonts, gives each text the 8-character
id the plugin needs to read it back (D73), renders, lints, and reports
notes whose transcription is now stale — update those as for any change. A new
drawing is saved the same way to a new `Excalidraw/<topic>/<name>.excalidraw.md`
path. Then `$C stop`.

A drawing with images in it (`## Embedded Files`) does not survive the canvas:
the images are vault files the canvas cannot load. Edit those with
`tools/excalidraw.js` only.

## Mermaid

With a canvas tab open:

```bash
$C clear --yes
$C mermaid <scratchpad>/flow.mmd
$C screenshot --out <scratchpad>/mermaid.png
```

Mermaid's layout is automatic and often cramped: fix it with `describe` and
`apply`, then save into the vault as above. Mermaid that only needs to be read,
not edited as a drawing, belongs as a Mermaid block in the note instead.

## Share links

When the owner asks for one:

```bash
$C import "Excalidraw/tooling/query-ladder.excalidraw.md" --replace
$C share
```

The scene is encrypted locally and uploaded to excalidraw.com; the key lives
only in the link. Anyone with the full link can open the drawing, so give it
to the owner and nowhere else — never write it into a note or a commit.

## Limits

- One canvas: importing with `--replace` clears whatever was there.
- The known duplicate-label glitch: if bound labels double after heavy
  editing, `$C query --type text`, delete the extra ones, and re-screenshot.
- Exit code 3 means the server is not running (start it); 4 means a browser
  tab must be open.
