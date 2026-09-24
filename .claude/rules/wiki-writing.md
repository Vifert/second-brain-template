---
paths:
  - "wiki/**"
---

Rules for writing into `wiki/`. They load when a file under `wiki/` is read; the builder backs each one, so a slip fails the build. Moved out of the manual (`AGENTS.md`) so they load only when needed (D87).

## Node Kinds and Size Rules

Every node declares `kind:` in frontmatter. Kind sets the body budget and the
read path. **The answer-surface cap is identical for all kinds.**

| kind | body cap | read path | what it is |
| --- | --- | --- | --- |
| `hub` | 200 lines | card | a concept's main node |
| `detail` | 350 lines | exact section range | deep reference under a hub |
| `log` | **uncapped** | date/section range | append-only dated record |
| `person` | 120 lines | card | someone I mentioned |
| `idea` | 150 lines | card | something I might build |
| `decision` | 150 lines | card | a call made, and why |
| `index` | — | rarely read | generated topic index |

- **Logs are uncapped on purpose.** They are append-only and never read whole;
  a date range is addressed directly. A log growing to thousands of lines costs
  nothing at query time.
- When a `hub` outgrows 200 lines, **split the depth into a `detail` node**
  beside it and link from the hub — do not delete anything to fit.

## Folder Structure

Folders are for **my browsing and for containment**. They do not change query
cost — queries never walk folders, they grep the index, where a deeper path
costs ~3 extra tokens per row. The builder enforces all of this:

- **Folders encode only stable properties, never volatile ones.** Level 1 under
  `wiki/` is the topic. Level 2, when present, is the node's `kind`:

  | subfolder | holds | kind |
  | --- | --- | --- |
  | `<topic>/decisions/` | calls made inside that topic's work | `decision` |
  | `<topic>/worklog/` | that topic's dated record | `log` |
  | `<topic>/assets/` | images owned by that topic's nodes | media only |

  Status, recency and importance never become folders. They change, and a
  folder that is wrong until someone moves the file is a stale index by another
  name.
- **Nothing deeper** than `wiki/<topic>/<sub>/<file>`. Hubs, details and people
  sit at their topic root; a `detail` stays beside its hub so the two sort together.
- **Basenames are unique vault-wide.** Obsidian and the builder resolve
  `[[links]]` by basename, so moving a file breaks nothing and a duplicate name
  would. Hence log series carry a prefix: `journal-2026-09`, and `acme-2026-09`
  for an engagement's worklog.
- **A client or employer engagement is self-contained.** When my work for one
  client or employer should be separable from the rest of my life, everything
  about it — concepts, decisions, worklog, images — lives under its own topic,
  `wiki/<engagement>/` (for example `wiki/acme-engagement/`), so the whole
  engagement can be archived or removed as one folder. People are the exception:
  a person outlives a project, so they stay in `wiki/people/`. Drawings are the
  other exception: they cannot live in `wiki/` (D68), so an engagement's drawings sit in
  the matching `Excalidraw/<engagement>/`.
- **`Excalidraw/<topic>/`** mirrors the wiki topics for drawings, one level
  deep. Drawings I make in Obsidian start at `Excalidraw/` itself with the
  plugin's date name until one is filed.
- **`wiki/journal/`** is my dated log for everything outside a self-contained
  engagement. It and a future top-level
  `wiki/decisions/` are topics whose whole purpose is one kind, so they need no
  subfolder.

## Tags

Tags are **nested, `facet/value`** — `tech/scala`, `rel/co-author`,
`field/nlp` — never flat free text (D65). Like folders they are cost-neutral at
query time: `cut -f1,8` never prints the tags column, and `grep -i scala` still
matches `tech/scala`. Unlike folders they cut across topics, so they carry what
a folder cannot: every node that uses PySpark, every co-author, every
healthcare project. In the vault this design comes from, flat free-text tags
had drifted to 206 values for 119 nodes — synonyms (`rl`/`reinforcement-learning`),
plural pairs, and the employer's name repeated on every node in the employer's
own topic — which made a breadth question by tag unanswerable.

| facet | answers | examples |
| --- | --- | --- |
| `org/` | which organisation, outside its own topic folder | `org/acme` on a person, `org/state-university` |
| `rel/` | how a person relates to me | `rel/colleague`, `rel/co-author`, `rel/manager` |
| `<engagement>/` | *only if an engagement has its own topic* — which workstream, component or team inside it; registered per engagement | `acme/billing`, `acme/data-quality`, `acme/support-team` |
| `tech/` | which language, library, platform or tool | `tech/pyspark`, `tech/bigquery` |
| `field/` | which technical discipline | `field/nlp`, `field/data-quality` |
| `method/` | which technique, model family, task or metric | `method/cnn`, `method/rouge` |
| `domain/` | which application area | `domain/healthcare`, `domain/finance` |
| `venue/` | where a paper was published | `venue/ieee`, `venue/springer` |
| `activity/` | what kind of undertaking | `activity/publication`, `activity/study`, `activity/personal-project` |
| `form/` | what shape the content has | `form/reference`, `form/timeline`, `form/full-text` |
| `subject/` | a recurring concern no other facet covers | `subject/migration`, `subject/troubleshooting` |

- **Facets are registered in `tools/lib/rules.js`** (`TAG_FACETS`); the builder
  fails a flat tag, an unregistered facet, a non-kebab value, a date or status,
  a synonym listed in `TAG_SYNONYMS`, two values in one facet that differ only
  by a plural or a hyphen, and inline `#tags` that break the same rules.
- **A tag never restates its node's topic or kind.** The folder already says
  it: no `acme` on a node in the Acme engagement's topic, no `people` on a
  person, no `worklog` or month on a log (an engagement's logs carry
  `tags: []`). `TOPIC_IMPLIED_TAGS` lists the implied ones.
- **Tag what a question would filter by, not every noun.** Aliases route;
  tags group. A tag used once is fine if it names a real facet value.
- **A new facet is a rules.js edit first**, and its name must not be a word I
  would grep on its own — the audit fails a facet named like a probe term,
  because a bare grep for it would pull every tagged row.
- **Surveys by facet** read only paths and tags:
  `cut -f1,7 wiki/_index.tsv | grep 'tech/pyspark'`, or every value of a facet
  with `cut -f7 wiki/_index.tsv | tr ',' '\n' | grep '^tech/' | sort | uniq -c`.
- **Renaming a tag is a scripted migration**: every node carrying it is
  rewritten in one pass, then the index is rebuilt. If I rename a tag myself in
  Obsidian, rebuild afterwards — the builder re-validates every facet.

## The Index Layer

Five generated files are the retrieval backbone. Built during capture (slow is
fine), grepped during queries (cheap). **Never read any of them whole.**

### `wiki/_cards.tsv` — the answer cache
```
path <TAB> title <TAB> Key Takeaways (bullets joined by literal \n)
```
One grep **routes and answers at once**. Median row ~1,050 bytes (~265 tokens).
This is the file that makes the cost target reachable.

### `wiki/_index.tsv` — the node table
```
path <TAB> title <TAB> topic <TAB> kind <TAB> status <TAB> aliases <TAB> tags <TAB> summary
```
Cheapest layer. Use for routing, breadth questions, and filtering by kind,
topic or status. **The aliases column also carries four generated extras**,
none of them in the `.md` files: US/UK spelling variants (the prose is British,
I type American — `optimisation` ↔ `optimization`); hyphen-free forms of
hyphenated words (`neurocognitive` for Neuro-Cognitive, D60); the **code identifiers**
a node names — `build_order_history`, `readFromWarehouse` — when at most three
nodes name them (D54); and relative aliases ("this month", "today", "latest")
on the newest log of each series (D55). `cut -f1,8` never prints the aliases
column, so none of this costs anything at query time.

### `wiki/_sections.tsv` — the section map
```
path <TAB> heading <TAB> start-line <TAB> end-line <TAB> gist
```
Gives an exact `sed -n 'A,Bp'` range with **no discovery read**. This is how
dated log entries and single article sections are reached.

### `wiki/_links.tsv` — the edge table
```
source-path <TAB> target-path
```
Neighbourhood expansion without reading articles.

### `wiki/_mentions.tsv` — the people timeline
```
person-slug <TAB> date <TAB> log-path <TAB> start-end <TAB> snippet
```
Every dated log entry that names a person, matched on their proper-name
aliases. "Every time I worked with Sam" is one grep —
`grep -P '^sam-lee\t' wiki/_mentions.tsv` — about 550 tokens for 12 dated
entries, each with an exact line range for depth.

### `wiki/profile/now.md` — generated status
Not a TSV but built in the same step: one line per open `## Status Log` (see
Write-Side Rules). It is a normal node with a card, so "what's my status?" is a
single L1 lookup. **Never edit it by hand** — the builder overwrites it.

### Index rules

- **A stale index is the worst failure mode in this vault** — worse than a
  missing node, because it silently routes queries down the expensive path.
  Rebuild all five in the same step that writes content, never "later".
- The rebuild is also the validator: it enforces frontmatter, answer-surface
  caps, kind-aware body caps, `## Key Takeaways` position, and link resolution.
  **A capture is not finished until it validates clean.**
- If you cannot route a question through the index, that is an **index defect**.
  Answer it anyway, then say which alias or row was missing so it gets fixed.

## Capture Protocol

- **Create the month's log file if it does not exist.** Entries are
  `### YYYY-MM-DD (D-Mon-YY)` headings, appended newest-last; anything
  inside an entry, a figure included, sits at `####` or deeper (D88). A day with both engagement and
  personal updates gets the same heading in both logs. **Never type "this
  month", "today", "latest" or "current" into a log's aliases or tags** — the
  builder gives them to the newest log of each series and fails any typed by
  hand, because a typed one points at the wrong month from the 1st (D55).
- **Logs are append-only.** Correcting the past means a new dated entry saying
  what changed — never editing history. The builder fails any committed line
  under a dated log heading, or in a verbatim node's source text, that has
  changed or gone — whoever or whatever changed it (D67). A deliberate fidelity
  fix names its file for one run: `VAULT_ALLOW_REWRITE=<path> node tools/build-index.js`.
- **Idea `status`**: `seed` → `exploring` → `active` → `parked` / `done`. An
  idea that becomes real migrates to `wiki/projects/` and leaves a stub behind
  pointing there, preserving the origin date.
- **Decisions live with what they decide.** Calls made inside a client project
  (like a client engagement) belong in that project's `decisions/` and are listed in its hub — they
  are not life decisions and must not sit in a top-level folder that reads as
  one. A top-level `wiki/decisions/` is reserved for significant personal
  decisions and does not exist until the first one is captured.

## Write-Side Rules That Buy Read-Side Cheapness

- **Answer-first.** `## Key Takeaways` is the first section of every node.
  Nothing above it.
- **The answer surface stays tight as the body grows.** Max **8 bullets,
  1500 bytes** — enforced by the validator. New detail goes in the body, never
  into the takeaways. This is the single load-bearing rule.
- **Volatile status is the exception: it lives in exactly one node, its owner,
  in a `## Status Log`.** Anything that will change — "not started", "waiting",
  "expected next week" — is a dated row `| YYYY-MM-DD | status | source |`,
  appended oldest-first. The owner sets `status:` (open: `active`, `pending`,
  `waiting`, `blocked`, `in-progress`; closed: `done`, `completed`, `cancelled`,
  `parked`, `superseded`) and carries **exactly one** takeaway beginning
  `**Status`, which must name the latest row's date. The owner's `summary`
  describes; it never states status.
- **Every other node links to the owner, or to [[now]].** The builder fails
  status markers ("not started", "still pending", "has not happened", "expected
  the week of") anywhere outside an owner, a log or a verbatim node. A dated
  historical line may carry `<!-- historical -->` to waive the check.
- **Now is generated from the open Status Logs**, so the one card that answers
  "what's my status?" can never drift from its owners. In Vifert's vault one
  status fact was once restated in five places, and another in four.
- **Stable, predictable headings** so section ranges stay reliable.

## File Naming

- Kebab-case, `.md`: `wiki/acme-engagement/billing-migration.md`
- Filenames double as node IDs, URL slugs and CLI paths. Kebab-case is
  unambiguous across all three.
- Atomic noun phrases, one concept per file. **Exception**: log files are
  `<series>-YYYY-MM.md` (`journal-2026-09`, `acme-2026-09`) — the period is the
  identity within a series, and the prefix keeps basenames unique.
- Images are `<owner-slug>--<desc>.png` (§ Images). `--` is reserved for them.
- Generated and index files keep the `_` prefix so they sort to the top and
  read as structural.
- Filenames are stable. Renaming breaks inbound links and every edge — prefer
  adding an alias.

## Frontmatter

```yaml
---
title: Billing Migration
summary: The four-stage billing workflow migrated to cloud Scala, and the three root causes that made invoice_total NULL.
aliases: [billing migration, invoice_total, ctrl-A, separator bug, 12M records]
topic: acme-engagement
kind: hub
status:            # optional; used by idea and decision nodes
tags: [acme/billing, tech/scala, tech/mapreduce, subject/migration]
created: 2026-09-09
updated: 2026-09-09
---
```

- `summary` is mandatory, one sentence, discriminating — aim for about 160
  characters and never exceed 200: it prints on every L0 hit, and the builder
  fails a longer one (D56).
- `kind` is mandatory and sets the body cap and read path.
- `tags` are `facet/value` from the registered facets (§ Tags); `[]` when
  nothing cuts across the topic, as on an engagement's logs.
- `status` on `idea` and `decision` nodes, and on any node that owns a
  `## Status Log`; omit elsewhere.
- `pronouns` on a `person` node — only when stated (§ People).
- `verbatim: true` on a full-text node: the text is the source's, so the
  volatile-status check does not apply to it. It must also carry `source:`
  naming the raw file it was compiled from; the audit fails a PDF, DOCX or PPTX
  in `raw/_compiled/` that no verbatim node names (D64).
- `generated: true` marks the Now page; never hand-edit a generated node.
- Keep `updated` current and rebuild the index in the same edit.
- **Obsidian rewrites inline lists into YAML block form** when it opens a note.
  Both forms are valid and the index parser handles both — but see the warning
  in Working Notes, because Obsidian can silently *drop* alias entries.

## Article Shape

```markdown
---
(frontmatter)
---

## Key Takeaways
- 5–8 self-contained bullets. Capped. This is the answer surface.

## <body sections>
Full detail. Predictable headings. Tables for reference material.

## Related
- [[other-node|other node]] — one clause on why.
- **Day-by-day record**: [[acme-2026-06|work log June 2026]], entries 10–12 June.
```

- Nothing above `## Key Takeaways`.
- Hubs whose detail lives elsewhere **must** link to it under `## Related`,
  labelled so the link is obviously the deep version — including the log
  months that record the hub's subject day by day, as a `**Day-by-day
  record**` line (four work hubs in Vifert's vault lacked one, D58).
- A status owner adds `## Status Log` — a `| As of | Status | Source |` table,
  oldest first — just above `## Related`.

## People

- Every person I mention gets a node in `wiki/people/`, kebab-case. When I
  choose a disambiguating filename — `sam-acme` for a second Sam — the title stays
  the name as given and the suffix is **not** added as an alias.
- Create it even for a passing mention — name, how they came up, relationship.
  **Except public figures cited only as references** — the designers a brief
  ranks, an author whose book I studied: they stay aliases on the node that
  cites them, never person nodes.
- Link from every article mentioning them: `[[first-last|First]]`. The build
  fails a node that names a person without linking them (D58); logs and
  verbatim full texts keep their words as written.
- Record names exactly as given; extra forms go in aliases.

## Linking

- Piped links so prose reads naturally: `[[billing-migration|billing migration]]`
- Bare links are fine in index files and link lists.
- Link generously across topics — that is what makes this a graph.
- Links in `_master-index.md` use full paths (`[[wiki/people/_index|People]]`)
  because bare `_index` is ambiguous across folders.
