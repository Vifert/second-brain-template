# Obsidian plugins

The vault uses four community plugins. **Excalidraw is required**; **Calendar,
Iconize and Templater are recommended**. Each one's settings ship in
`.obsidian/plugins/<id>/data.json`, so a plugin is configured the moment it is
installed. None of them runs outside Obsidian: the agent never calls a plugin,
it uses the files and settings the plugin reads.

The build checks every setting the vault's rules depend on, but only for a
plugin that is installed. A missing Excalidraw is reported by name, with the
command that installs it.

| Plugin | Status | Id |
| --- | --- | --- |
| Excalidraw | required | `obsidian-excalidraw-plugin` |
| Calendar | recommended | `calendar` |
| Iconize | recommended | `obsidian-icon-folder` |
| Templater | recommended | `templater-obsidian` |

## Excalidraw — required

**What it does here.** Drawings live in `Excalidraw/<topic>/` as editable
`.excalidraw.md` files. A note that needs one embeds the live drawing and
transcribes it as text, with a `drawing-hash` recording which version the
transcription describes; the build warns when the drawing changes after its
transcription. `tools/excalidraw.js` renders and lints drawings offline using
the Excalidraw engine bundled inside the plugin, which is why the plugin is
required even if you never draw.

**Install.**

    node tools/install-excalidraw.js

It downloads a pinned release from GitHub, verifies each file's SHA-256
checksum, and keeps the shipped `data.json`. `--check` reports whether the
installed version matches the pin; `--force` reinstalls. Then enable the
plugin in Obsidian's community plugins settings.

**Rules that depend on it.** `compress` stays off, so a drawing's diff is
readable; drawings never live inside `wiki/`; a drawing in a note is a figure
with a transcription. → `.claude/rules/images-drawings.md` § Images

## Calendar — recommended

**What it does here.** Clicking a day creates a daily note in `raw/daily/`,
through Obsidian's core Daily notes settings. `/vault-compile` copies each
daily note word for word into that month's log, distils it into the nodes it
touches, and moves it to `raw/_compiled/daily/`.

**Install.** Obsidian → Settings → Community plugins → Browse → Calendar.

**Rules that depend on it.** The daily-notes folder is `raw/daily/` and its
template is `templates/daily-note.md`; the build checks both.

## Iconize — recommended

**What it does here.** Gives each folder an icon in Obsidian's file tree.
Purely for the owner's eyes, but it makes the vault's layout readable at a
glance.

**Install.** Obsidian → Settings → Community plugins → Browse → Iconize.

**Rules that depend on it.** A new folder gets an icon in the same step that
creates it — an entry `"<folder path>": "Li<PascalCase lucide id>"` in
`.obsidian/plugins/obsidian-icon-folder/data.json`. With Iconize installed, the
build warns on any folder without one; without it, the check is skipped.

## Templater — recommended

**What it does here.** Inserts the vault's templates — `idea`, `person`,
`log-entry`, `daily-note` in `templates/` — so notes written by hand start
with the right frontmatter and headings.

**Install.** Obsidian → Settings → Community plugins → Browse → Templater.

**Rules that depend on it.** Its templates folder stays `templates`, and
**trigger on file creation stays off** — that toggle is stored on each device,
not in `data.json`, so check it in Templater's settings screen. Otherwise any
`<% %>` in a new note would run, and a note the agent writes could be re-parsed
and rewritten.

## Adding a plugin of your own

It is yours to configure. If it can rewrite notes or reformat drawings, keep
it away from logs, verbatim full texts and `Excalidraw/`: the build's rewrite
check fails any committed log line that changes, whoever changed it. A plugin
setting must never hold a secret — every `data.json` is committed, and the
build fails one that looks like a key.
