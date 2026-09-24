---
title: Projects Index
summary: Index of the 11 nodes in the projects topic.
aliases: [projects index, projects]
topic: projects
kind: index
tags: []
created: 2026-09-18
updated: 2026-09-23
---

## Key Takeaways

- Things the owner has built or is building — each with what it does, how, and where it stands.
- Contains **11 nodes** — 3 hub, 3 detail, 5 decision.
- Orientation only. To look something up, route on `wiki/_index.tsv`, then pull one card from `wiki/_cards.tsv`.

## Hubs

- [[driftwood-capacity-forecast|Driftwood]] `pending` — Ines Duarte's six-week warehouse capacity forecast, reading Tidewater's Postgres through a read-only role; Mira reviews its SQL and owns the role.
- [[sparse-hybrid-retrieval-paper|Sparse and Hybrid Retrieval for Personal Field Notes]] `pending` — Mira's workshop paper with Priya Raman and Tomas Lind comparing BM25, dense and hybrid retrieval on personal notes; the hybrid wins, most clearly on short vague queries.
- [[tidewater-dashboard|Tidewater]] `in-progress` — Harbor Analytics' internal dashboard joining shipments and invoices for the ops floor, replacing a 23-tab spreadsheet; Mira leads its design and build.

## Detail (deep reference)

- [[sparse-hybrid-retrieval-paper-full-text|Sparse and Hybrid Retrieval for Personal Field Notes — Full Text]] — The full text of Mira's workshop paper as written, every section, table and appendix, with the two disagreeing note counts recorded on both sides.
- [[tidewater-data-model|Tidewater Data Model and Pipeline]] — Tidewater's tables, date columns, Airflow jobs, indexes, KPI list and runbook — the deep reference behind the dashboard hub.
- [[tidewater-postgres-note-full-text|Tidewater: Why Postgres, Not DynamoDB — Full Text]] — The full text of the one-page note Mira sent the platform team after the kickoff, arguing Postgres for Tidewater, as written.

## Decisions

- [[tidewater-late-definition|\"Late\" Means Delivered After promised_at]] `active` — Tidewater measures lateness against the date promised to the customer, and finance's invoiced-after-delivery meaning became a separate KPI instead.
- [[driftwood-reads-tidewater-read-only|Driftwood Reads Tidewater Through a Read-Only Role]] `active` — Driftwood queries Tidewater's Postgres through a read-only role instead of copying the tables, so there is one copy of the truth and no second ingestion.
- [[tidewater-fifteen-minute-refresh|Tidewater Refreshes Every 15 Minutes, Not in Real Time]] `active` — Real-time refresh was dropped after the ops lead could name nothing she would do differently with live numbers; a streaming prototype was built first, then parked.
- [[tidewater-postgres-over-dynamodb|Tidewater Runs on Postgres, Not DynamoDB]] `active` — Why Tidewater went relational against the platform team's default — the dashboard joins three tables and its filters change weekly.
- [[tidewater-deadline-moved-to-15-may|Tidewater's Deadline Moved From 30 April to 15 May]] `active` — The first-version deadline slipped a fortnight to pay for the KPI list growing from twelve to seventeen after the ops review.

## Related

- [[wiki/_master-index|Knowledge Base Index]] — all topics.
