# Security

## Reporting a vulnerability

Report it privately, never in a public issue:

- **GitHub's private vulnerability reporting** — on this repository, open
  **Security → Report a vulnerability**; or
- **email** vifertjdaniel@gmail.com.

Say what you found, how to reproduce it, and what it could expose.

## What is in scope

- the tools in `tools/`;
- the Claude Code skills in `.claude/skills/`;
- the setup instructions in `SETUP.md`, which an agent follows on someone's
  machine;
- the GitHub workflows in `.github/`.

Obsidian and its plugins are separate projects; report their problems to them.

## The data model

A vault holds its owner's personal notes, on their own machine. Knowing what
leaves that machine is what makes a report here judgeable:

- **Nothing in `tools/` sends data anywhere.** The builder, the audit, the
  self-test, the benchmark scorer and the drawing tools read and write local
  files only; the drawing renderer runs a local headless browser with the
  network blocked.
- **The one network call** is `tools/install-excalidraw.js`, which downloads a
  pinned release of the Excalidraw plugin from GitHub and refuses any file whose
  SHA-256 checksum does not match the pin.
- **The optional NotebookLM step** of `/vault-compile` uploads only the sources
  its owner chooses, to their own Google account, and only if they turned it on
  at setup.
- **Claude Code itself** sends what it reads to the model provider, as it does
  in any folder. The vault's query protocol keeps that to a few hundred tokens a
  question.

## Response

A report is acknowledged within seven days. A confirmed problem is fixed in a
patch release, credited to the reporter unless they prefer otherwise.
