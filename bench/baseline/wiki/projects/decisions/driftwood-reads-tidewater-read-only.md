---
title: Driftwood Reads Tidewater Through a Read-Only Role
summary: Driftwood queries Tidewater's Postgres through a read-only role instead of copying the tables, so there is one copy of the truth and no second ingestion.
aliases: [the read-only role, read only role, why not copy the tables, one copy of the truth, who can read Tidewater, how does Driftwood get the data, second ingestion]
topic: projects
kind: decision
status: active
tags: [org/harbor-analytics, tech/postgres, field/data-engineering]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Driftwood reads Tidewater's Postgres through a read-only role**, decided at the Driftwood intro meeting on 28 April 2026.
- **The alternative was a copy of the tables into [[ines-duarte|Ines Duarte]]'s own database**, which was her first idea and would have needed its own ingestion and drifted from the original.
- **[[mira-identity|Mira Okafor]] and [[tomas-lind|Tomas Lind]] both preferred the read-only role**, for one copy of the truth and nothing extra to keep alive.
- **The read-only role was promised before Driftwood existed**: the storage note of March 2026 already named a read-only role and a schema guide as the mitigation for other teams reading Tidewater's tables.
- **[[mira-identity|Mira Okafor]] owns the role and reviews the SQL**; [[ines-duarte|Ines Duarte]] owns Driftwood.
- **Nothing writes to Tidewater's tables but Tidewater**, which is the property the role exists to protect.

## The decision

Driftwood reads Tidewater's Postgres through a read-only role, rather than
copying the data. Agreed at the Driftwood intro on 28 April 2026.

## Why

- **A second copy would need its own ingestion**, and something to keep it alive.
- **A second copy would drift** from Tidewater's, and then two numbers would
  disagree with no way to say which was right.
- **One copy of the truth** was the phrase both [[mira-identity|Mira Okafor]] and
  [[tomas-lind|Tomas Lind]] used against the copy.
- **The load is not a problem.** Driftwood runs once a week on a Monday morning,
  outside the ops floor's peak, so Tidewater's 15-minute refresh is not expected
  to slow it.

## Why it was already the plan

The Postgres note written in March 2026 listed "other teams reading the tables
directly" as a risk of going relational, and named the mitigation: a read-only
role and a schema guide, so that nobody writes to Tidewater's tables but
Tidewater. Driftwood is the first team to take that path, and it worked because
the schema guide already existed — [[tomas-lind|Tomas Lind]] had asked for the
tables to be documented well enough that the capacity forecast could build on them
without [[mira-identity|Mira Okafor]] in the room.

## Who owns what after it

| Who | What |
| --- | --- |
| [[mira-identity|Mira Okafor]] | The read-only role, the schema guide, and reviewing Driftwood's SQL |
| [[ines-duarte|Ines Duarte]] | Driftwood itself, and the list of columns she needs |

## Timing note

[[tomas-lind|Tomas Lind]]'s feedback on 26 March 2026 was that the request could
wait until the tables had settled — one of the side requests
[[mira-identity|Mira Okafor]] would otherwise have said yes to immediately. The
access was granted after Tidewater reached staging, not before.

## Related

- [[driftwood-capacity-forecast|Driftwood]] — the project it lets read.
- [[tidewater-postgres-over-dynamodb|the storage decision]] — which promised this role.
- [[tidewater-data-model|the Tidewater data model]] — the schema guide it comes with.
- **Day-by-day record**: [[journal-2026-04|journal April 2026]], entries 16 and 28 April.
