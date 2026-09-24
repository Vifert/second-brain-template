---
title: Vault Tag Facets
summary: Why the vault's tags are nested facet/value (tech/, rel/, field/ and seven more), the rules the builder enforces, and how facet surveys stay cheap at query time.
aliases: [nested tags, tag facets, why nested tags, tag hierarchy, facet tags, how do I tag, my tags, tag rules, tag vocabulary, faceted tags, tag drift, rename a tag, which tags]
topic: tooling
kind: hub
tags: [tech/obsidian, subject/second-brain, subject/retrieval]
created: 2026-09-16
updated: 2026-09-23
---

## Key Takeaways

- **Vault tags are nested `facet/value`** — `tech/pyspark`, `rel/co-author`, `field/nlp` — a design adopted in Vifert's vault on 16 September 2026, when 206 flat free-text tags on 119 nodes became 171 faceted ones.
- **Nesting costs nothing at query time**: the L0 route prints only path and summary, and a grep for `pyspark` still matches `tech/pyspark`. The query-cost benchmark held at a 43× median.
- **Nesting turns facet questions into one cheap filter** — "who are my co-authors?" is `cut -f1,7 wiki/_index.tsv | grep rel/co-author`: 14 rows, about 220 tokens.
- **Ten facets are registered** in `tools/lib/rules.js`: org, rel, tech, field, method, domain, venue, activity, form, subject — plus one per self-contained work engagement, added when it is.
- **A tag never restates its node's topic or kind** — no `acme` on nodes in the Acme engagement's topic, no `people` on person nodes, and an engagement's logs carry no tags.
- **The builder fails tag drift** (D65): flat or unregistered tags, dates and statuses, listed synonyms such as `field/rl`, plural or hyphen near-duplicates, and inline `#tags` that break the same rules.
- **Tags are renamed by script**: Claude migrates every node carrying a tag in one pass; a tag renamed by hand in Obsidian is re-validated by the next rebuild.

## Why Nested

In Vifert's vault, on 16 September 2026, he asked the question he had asked about subfolders: why no nested tags — would they make the vault better, or hurt retrieval? The answer has the same shape as the folder answer, with one difference.

- **Same as folders: cost-neutral.** Queries grep `_index.tsv` and print `cut -f1,8` — path and summary. The tags column is never printed, and substring grep still finds a leaf inside `facet/leaf`. The index grew by about 1.6 KB, none of it on the query path.
- **Different from folders: tags cut across topics.** A folder can say only one thing about a node; a tag set can say it uses PySpark, involves a university and is a publication at once.
- **The flat tags had drifted** in that vault: 206 values for 119 nodes, over 150 used once: synonyms (`rl` and `reinforcement-learning`, `web` and `frontend`, `study`/`learning`/`practice`), plural pairs (`publication`/`publications`, `certification`/`certifications`), the employer's and programme's names repeated on every node in the employer's topic, `people` on every person, month tags on logs, and `cv` meaning curriculum vitae beside `computer-vision`. A breadth question by tag could not be answered reliably, and nothing stopped new drift.

## The Facets

| facet | answers | examples |
| --- | --- | --- |
| `org/` | which organisation, outside its own topic folder | `org/acme` on a person, `org/state-university` |
| `rel/` | how a person relates to the owner | `rel/colleague`, `rel/co-author`, `rel/manager`, `rel/family` |
| `<engagement>/` | *only if a work engagement has its own topic* — which workstream, component or team inside it | `acme/billing`, `acme/data-quality`, `acme/support-team` |
| `tech/` | which language, library, platform or tool | `tech/pyspark`, `tech/bigquery`, `tech/obsidian` |
| `field/` | which technical discipline | `field/nlp`, `field/data-quality`, `field/speech` |
| `method/` | which technique, model family, task or metric | `method/cnn`, `method/rouge`, `method/asr` |
| `domain/` | which application area | `domain/healthcare`, `domain/finance`, `domain/legal` |
| `venue/` | where a paper was published | `venue/ieee`, `venue/springer` |
| `activity/` | what kind of undertaking | `activity/publication`, `activity/study`, `activity/personal-project` |
| `form/` | what shape the content has | `form/reference`, `form/timeline`, `form/full-text` |
| `subject/` | a recurring concern no other facet covers | `subject/migration`, `subject/troubleshooting` |

## Rules

- **Registered facets only.** A new facet is added to `TAG_FACETS` in `tools/lib/rules.js` before any node uses it.
- **Lowercase kebab-case values**, one level deep: `facet/value`.
- **No restating the folder.** A tag equal to the node's topic, kind or a kind subfolder fails, and so do the tags a topic implies (`TOPIC_IMPLIED_TAGS`: `org/acme` inside `acme-engagement`, once that engagement is registered).
- **No volatile values.** Dates, months, statuses and relative words ("current") change; folders and Status Logs carry those.
- **One form per value.** Synonyms listed in `TAG_SYNONYMS` fail with the canonical form named; two values in one facet that differ only by a plural or a hyphen fail as near-duplicates.
- **Inline `#tags` obey the same rules.** None exist today.
- **A facet name must not be a probe term.** A bare grep for a facet name pulls in every row carrying it; the audit measures that per facet and fails a facet named like a probe or benchmark term.
- **Tag what a question would filter by.** Aliases route; tags group.

## Query Patterns

| question | command | reads |
| --- | --- | --- |
| who are my co-authors? | `cut -f1,7 wiki/_index.tsv \| grep 'rel/co-author'` | 14 rows, ~220 tokens |
| which projects used PySpark? | `cut -f1,7 wiki/_index.tsv \| grep 'tech/pyspark'` | paths and tags only |
| every technology in the vault | `cut -f7 wiki/_index.tsv \| tr ',' '\n' \| grep '^tech/' \| sort \| uniq -c` | one line per value |

Pull summaries or cards only for the paths the filter returns.

## What The Migration Did

Run by script on 16 September 2026, because a rename in Obsidian's UI cannot be driven from the command line.

- **206 flat tags → 171 faceted tags**, with every node's `updated` bumped. Generated topic indexes now carry `tags: []` and the Now page `subject/status`.
- **Routing was proved before and after**: for each of the 206 old tag words, the L0 grep had to reach at least the nodes it reached before. The first pass lost 29 routes; better values restored most (`activity/study`, `form/commands`, `subject/jobs`, `subject/tables`, `form/full-text`, `rel/international-co-author`, and a "side projects" alias).
- **Routes dropped on purpose**: "research" no longer lists 13 co-author people (`rel/co-author` does that); a cloned repo lost `reference`, since it is not a reference table; `certifications` and `side-projects` no longer reach nodes their singular or spaced forms still reach.
- **Facet-name noise, measured by the audit**: a bare grep for `org` or `rel` adds 35 rows, `subject` 34, `tech` 30, `field` 28, `activity` 27 — none of them is a probe or benchmark term, and a query for one is a survey of that facet.

## Related

- [[second-brain-architecture|Second brain architecture]] — the index layer that tags sit in.
- [[vault-capture-protocol|Vault capture protocol]] — tagging a new capture.
- [[obsidian-plugins|Obsidian plugins]] — the plugins the vault uses.
- [[vault-operations|Vault operations]] — the builder and audit that enforce these rules.
