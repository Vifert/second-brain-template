---
title: Tidewater Runs on Postgres, Not DynamoDB
summary: Why Tidewater went relational against the platform team's default — the dashboard joins three tables and its filters change weekly.
aliases: [why Postgres, why not DynamoDB, Postgres over DynamoDB, the storage choice, why did we pick Postgres, the platform default, DynamoDB default]
topic: projects
kind: decision
status: active
tags: [org/harbor-analytics, tech/postgres, tech/dynamodb, field/data-engineering]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Tidewater runs on Postgres**, decided at the kickoff on 10 March 2026 against the platform team's default of DynamoDB.
- **The deciding reason is joins**: shipments, invoices and carriers are three tables every useful page crosses, and in DynamoDB each join becomes a denormalised copy to keep in step or several reads stitched together in code.
- **The second reason is that the questions are ad-hoc**: the ops team's filters change every week, and a relational model answers a new filter with a new `WHERE` clause rather than a new index and a backfill.
- **[[tomas-lind|Tomas Lind]] asked for the case in writing**, not argued in the room, which is why a one-page note went to the platform team the same week — before anyone asked for it.
- **The decision names its own expiry**: thousands of calls a second with fixed access patterns would favour a key-value store, and wanting events as they happen would change the ingestion before the database.
- **The platform team has not pushed back**, and [[tomas-lind|Tomas Lind]] told them on 14 April 2026 that the decision stands.

## The decision

Postgres, for the joins and the ad-hoc filters. Agreed at the Tidewater kickoff
on 10 March 2026 by [[mira-identity|Mira Okafor]], [[tomas-lind|Tomas Lind]] and
[[sam-achebe|Sam Achebe]], and sent to the platform team the same week as a
one-page note.

## Why

1. **The dashboard needs joins.** Every useful question crosses shipments,
   invoices and carriers.
2. **The questions are ad-hoc filters.** DynamoDB is fast for access patterns
   designed in advance, one index per pattern; the ops floor's filters do not
   hold still.
3. **The data is small.** Two years is a few million rows — one modest Postgres
   instance with room to spare.
4. **The team knows SQL.** [[sam-achebe|Sam Achebe]] writes the KPI queries
   himself; on DynamoDB every new KPI would go through an engineer.

## The counter-case, and why it lost

| DynamoDB's advantage | Why it does not decide this |
| --- | --- |
| Scales without thought | Tidewater's load is a few hundred queries on a busy morning |
| No server to patch | The platform team already runs managed Postgres for two other services |
| It is the platform default | Defaults exist to save a decision; this one is cheap to make and expensive to get wrong |

## What would change it

- Tidewater becoming a service other systems call thousands of times a second,
  with fixed access patterns.
- The ops team wanting events as they happen rather than on a schedule — though
  that would change the ingestion before the database.

## What it cost

One more Postgres instance on the platform team's list, and a standing need to
index the columns the dashboard filters and joins on. The second cost came due on
2 April 2026, when the heaviest page took about two and a half minutes until an
index on `invoice.invoice_date` brought it to about 1.4 seconds.

## Side effects

Because other teams would read the tables directly, the note promised a read-only
role and a schema guide so that nothing writes to Tidewater's tables but
Tidewater. Both were delivered, and are what
[[driftwood-reads-tidewater-read-only|Driftwood's read-only role]] rests on.

## Related

- [[tidewater-postgres-note-full-text|the note, in full]] — the one-pager as sent.
- [[tidewater-dashboard|Tidewater]] — the project it decides.
- [[tidewater-data-model|the Tidewater data model]] — the relational model itself.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 9, 10 and 26 March.
