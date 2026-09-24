---
title: Vault Capture Protocol
summary: How the owner dumps things into this vault — work and personal updates, status changes, ideas, decisions, documents and images — and where each kind of input lands.
aliases: [capture, how to dump, log this, idea dump, daily update, where does this go, capture protocol, add to vault, where do logs go, status change, how do I update a status, where do images go, correction, how do corrections work, fix a wrong fact, verbatim, compile verification, fence, forbidden claims, sic, contradiction in a source, pronouns, how are pronouns recorded, whose pronouns, daily notes, daily note, raw/daily, inbox, notes made in Obsidian]
topic: tooling
kind: hub
tags: [subject/workflow, subject/capture, subject/second-brain]
created: 2026-09-09
updated: 2026-09-19
---

## Key Takeaways

- **A work update for a self-contained engagement** goes to its `wiki/<engagement>/worklog/<prefix>-YYYY-MM.md`; **any other dated update** to `wiki/journal/journal-YYYY-MM.md` — both under today's `### YYYY-MM-DD (D-Mon-YY)` heading, the file created if the month is new.
- **A status change** ("X started", "Y is blocked") is a dated row in the owning node's `## Status Log`; [[now|Now]] regenerates from it. Status is never restated anywhere else.
- **"Idea:"** becomes a node in `wiki/ideas/` with a `status` of `seed`, `exploring`, `active`, `parked` or `done`.
- **Decisions live with what they decide** — a project's calls in its `decisions/` subfolder; a top-level `decisions/` only for significant personal decisions.
- **A file, PDF or URL** goes to `raw/` for a full compile: a verbatim full-text node, a distilled hub, every kept figure transcribed — then verified against the source before commit.
- **An image** goes to its owner's topic `assets/`, named `<owner>--<desc>.png` and transcribed; an Obsidian paste lands beside the note first — see [[vault-image-rules]].
- **Every capture rebuilds the index in the same step**, and is finished only when the build validates clean.

## Where Each Input Lands

| Input | Destination | Kind |
| --- | --- | --- |
| "Log this" / a dated update on a self-contained engagement's work | `wiki/<engagement>/worklog/<prefix>-YYYY-MM.md` | `log` |
| Any other dated update — life, learning, career, this vault | `wiki/journal/journal-YYYY-MM.md` | `log` |
| A status change | a dated row in the owner's `## Status Log` | — |
| "Idea: what if I…" | `wiki/ideas/<slug>.md` | `idea` |
| "We decided X because Y", on a project | `<project>/decisions/<slug>.md` | `decision` |
| A significant personal decision | `wiki/decisions/<slug>.md` (register the topic first) | `decision` |
| A new fact about a person | existing `wiki/people/<slug>.md` | `person` |
| A new concept worth its own node | the right topic folder | `hub` |
| Deep material expanding a concept | `<concept>-<aspect>.md` beside its hub | `detail` |
| A document, PDF or URL | `raw/`, then compiled out | — |
| An image | `<topic>/assets/<owner>--<desc>.png`, transcribed | — |
| A daily note written in Obsidian (Calendar → Daily notes) | lands in `raw/daily/YYYY-MM-DD.md`; the next session compiles it word for word into the monthly logs, then moves it to `raw/_compiled/daily/` | `log` |
| Any other note made in Obsidian | lands in the `raw/` inbox, then compiled | — |

A day with both engagement and personal updates gets the same date heading in both logs.

## Rules That Keep Capture Cheap To Query

- **Answer surface stays tight.** `## Key Takeaways` is capped at 8 bullets and
  1500 bytes however long the body grows. Detail goes in the body.
- **Logs are append-only.** Correcting a past entry means a new dated entry.
- **Status has one owner.** Its `**Status` takeaway must carry the latest Status
  Log date, and its summary never states status. The build enforces both.
- **Pronouns only when stated**, recorded as `pronouns:` on the person's node and
  printed on their card title (`Sam Lee (he/him)`); never inferred from a name.
- **An idea that becomes real migrates** to `wiki/projects/`, leaving a stub.
- **A correction is swept, then fenced**: the wrong version is fixed in every
  node, not just the one in view, and added to `tools/probes.json` `_forbidden`.
  Each fence carries examples it must catch and nearby truths it must pass, so
  it cannot fence out a fact that later proves true (D50).
- **Verbatim means verbatim**: a full-text node changes only whitespace and
  line-break hyphenation; the source's own slips stay, marked [sic]. Two places
  in a source that disagree get neutral notes, not [sic], until the owner settles
  them (D51).
- **Log headings carry both date forms**: `### 2026-09-12 (12-Sep-26)`. Never type
  "this month", "today", "latest" or "current" into a log — the builder gives
  them to the newest log of each series, so they move when the month does (D55).
- **Tags are `facet/value`** from eleven registered facets and never restate the topic or kind; logs carry none — see [[vault-tag-facets]] (D65).
- **Every capture gets aliases**, including the first-person phrasing. Code
  identifiers (`build_order_history`) and hyphen-free forms ("coauthor")
  are indexed automatically (D54, D60).
- **Every takeaway names its subject** — "The parallel run is…", never "It is…";
  the builder fails a bullet that opens with a pronoun (D57).

## Related

- [[vault-skills|Vault skills]] — documents and daily notes wait in `raw/` for `/vault-compile`.
- [[vault-operations|Vault operations]] — querying, git, the audit and defect routine.
- [[vault-image-rules|Vault image rules]] — how images are captured.
- [[second-brain-architecture|Second brain architecture]] — why the vault is shaped this way.
- [[vault-tag-facets|Vault tag facets]] — how to tag a capture.
- [[now|Now]] — the generated status page.
- **Day-by-day record**: the newest month of each log series answers to "this month", "today" and "latest" in `_index.tsv` (D55).
