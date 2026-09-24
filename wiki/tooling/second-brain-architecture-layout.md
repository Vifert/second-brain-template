---
title: Second Brain Folder Layout
summary: Every top-level path in the vault and what it holds, and why nesting folders costs nothing at query time since queries grep the index rather than walk directories.
aliases: [folder layout, vault folders, folder structure, directory structure, where does that live, where do things live, what is in raw, what is in output, what is in tools, vault paths, top-level folders, what each folder holds]
topic: tooling
kind: detail
tags: [subject/operations, form/reference]
created: 2026-09-18
updated: 2026-09-18
---

## Key Takeaways

- **Level 1 under `wiki/` is always the topic**; level 2, when present, is the node's kind (`decisions/`, `worklog/`) or `assets/`. Nothing goes deeper than three levels.
- **`raw/` is an inbox and `raw/_compiled/` is disposable** — neither is ever in the query path, and anything sitting in `raw/` outside `_compiled/` is uncompiled by definition.
- **A client or employer engagement is self-contained**: when one has its own topic, everything about it lives under `wiki/<engagement>/`, so the whole engagement can be archived as one folder. People are the exception, since a person outlives a project.
- **Folders cost nothing at query time** — queries grep the index rather than walk directories, and a deeper path adds about three tokens per row.
- **Folders may encode only stable properties** (topic, kind), never status or recency, because a folder that is wrong until someone moves the file is a stale index by another name.
- **Drawings cannot live under `wiki/`** — they sit in `Excalidraw/<topic>/`, mirroring the wiki topics one level deep (D68).

## Every path and what it holds

| Path | Role |
| --- | --- |
| `raw/` | Inbox for source documents; anything sitting here is uncompiled by definition |
| `raw/daily/` | Daily notes written in Obsidian, waiting to be compiled into the monthly logs |
| `raw/_compiled/` | Processed sources — **disposable**, never in the query path |
| `wiki/` | The graph, maintained by the agent. Level 1 is the topic |
| `wiki/<engagement>/` | *Optional.* A client or employer engagement kept self-contained: concepts at the root, `decisions/`, `worklog/` (`<prefix>-YYYY-MM`), and `assets/` for images |
| `wiki/journal/` | Personal dated log — everything outside a self-contained engagement, `journal-YYYY-MM` |
| `wiki/people/` | One node per person mentioned anywhere; they outlive any single project |
| `wiki/profile/now.md` | Generated status page — one line per open Status Log |
| `wiki/ideas/` | Capture surface for ideas |
| `wiki/<topic>/assets/` | Images, named after the node that owns them, always transcribed |
| `Excalidraw/<topic>/` | Editable drawings, mirroring the wiki topics; never inside `wiki/` |
| `output/` | Query results, reports, generated canvases |
| `tools/` | Builder/validator, audit, self-test, probe corpus, defect ledger — versioned |
| `templates/` | Templater templates, kept in step with the frontmatter rules |
| `AGENTS.md` | The operating manual, for every coding agent — query protocol, capture protocol, caps |
| `CLAUDE.md` | Claude Code's entry point: imports `AGENTS.md` whole, plus Claude-only lines |
| `HANDOFF.md` | Cross-session memory, read at the start of every session |

## Why subfolders do not change query cost

Queries never walk folders — they grep the index, where a deeper path adds
about three tokens per row. Folders exist for the owner's browsing and to keep a
client engagement in one place, so they may only encode stable properties
(topic, kind), never status. Decided 2026-09-11.

Basenames are unique vault-wide, because Obsidian and the builder both resolve
`[[links]]` by file name rather than by path. That is why a log series carries
a prefix — `journal-2026-09`, `acme-2026-09` — and why moving a file breaks
nothing while a duplicate name would.

## Related

- [[second-brain-architecture|the whole machine]] — the hub this layout belongs to, with the architecture drawing.
- [[vault-operations|how the vault is run]] — the query ladder, git and the audit routine.
- [[vault-capture-protocol|capture protocol]] — what decides which folder a new thing lands in.
