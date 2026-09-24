# Troubleshooting

## `REQUIRED PLUGIN NOT INSTALLED — obsidian-excalidraw-plugin`

The build needs the Excalidraw plugin, whose engine the drawing tools run on.
Install it, then reload Obsidian:

    node tools/install-excalidraw.js

The download is a pinned release, verified by checksum. If you already have a
different version installed, `--check` says so and `--force` replaces it.

## `node tools/excalidraw.js check` finds no browser

Rendering a drawing runs the Excalidraw engine in a headless Chromium browser —
Edge, Chrome, Chromium or Brave, whichever is installed. The tool tries each in
turn and names the one that answered. If none does, it lists each with its
failure. A browser that updated itself can stop working headless while another
still works; set `EXCALIDRAW_BROWSER` to the path of one that does:

    EXCALIDRAW_BROWSER="/path/to/chrome" node tools/excalidraw.js check

## The build dies with `UNKNOWN: unknown error, open 'wiki/_index.tsv'`

On Windows, Obsidian's indexer or an antivirus scanner can lock a file for a
moment. It is not a bug in the tools: run the build again.

## A setting I changed comes back

Obsidian keeps its settings in memory and writes them back to `.obsidian/`
when anything changes. An edit made to a settings file while Obsidian is open
can be overwritten. After editing one, reload Obsidian with
**Ctrl/Cmd+P → Reload app without saving**. The build checks every setting the
rules depend on, so a setting that was written back fails the next build.

## `capture(s) waiting in raw/`

A warning, not a failure. Something is in `raw/` — a daily note, a document,
a note made in Obsidian — and has not been compiled into the wiki yet. It waits
for you to type `/vault-compile` in Claude Code. The agent will not compile it
on its own.

## `/vault-compile` turns into a file path in a script

In Git Bash on Windows, an argument starting with `/` is rewritten as a
Windows path before it reaches the program, so `claude -p "/vault-compile"`
receives something like `C:/Program Files/Git/vault-compile`. Turn the
rewriting off for that command:

    MSYS_NO_PATHCONV=1 claude -p "/vault-compile"

Typing the command inside Claude Code is not affected.

## Line endings: a file turned CRLF

The vault's files are LF. Some editors and scripts on Windows write CRLF
without saying so — Python's `write_text`, for one — and a CRLF file can
confuse parsers that read headings and fences. `.gitattributes` normalises
line endings when you commit, so the repository stays LF, but the copy on disk
may not. Write files with an explicit newline, or with an editor set to LF;
`.editorconfig` asks editors that honour it for LF.
