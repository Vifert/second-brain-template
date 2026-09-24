---
title: Tidewater Data Model and Pipeline
summary: Tidewater's tables, date columns, Airflow jobs, indexes, KPI list and runbook — the deep reference behind the dashboard hub.
aliases: [Tidewater data model, Tidewater tables, Tidewater schema, Tidewater pipeline, schema guide, the schema guide, shipment table, invoice table, order_ref, promised_at, dispatched_at, delivered_at, invoice_date, tidewater_ingest_daily, tidewater_backfill_once, the three date columns, Tidewater KPIs, the 17 KPIs, seventeen KPIs, carrier clock bug, the Tidewater runbook, which date is the date]
topic: projects
kind: detail
tags: [org/harbor-analytics, tech/postgres, tech/airflow, tech/sql, field/data-modelling, domain/logistics, form/reference]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Tidewater has four tables**: `shipment`, `invoice`, `carrier`, and a thin `order_ref` holding the prefixed and unprefixed order numbers side by side.
- **A shipment carries three dates** — `dispatched_at` (the carrier's depot scan), `promised_at` (what sales told the customer) and `delivered_at` — and "late" is measured against `promised_at`.
- **Ingestion is one Airflow job, `tidewater_ingest_daily`**, at 02:00 with two retries twenty minutes apart; every load replaces a whole day, so rerunning a day is safe.
- **Two years of history — about 2.1 million shipments and 1.6 million invoices — were backfilled by `tidewater_backfill_once`** on 26 March 2026, oldest day first, in just under four hours.
- **About 3% of shipments have `delivered_at` before `dispatched_at`** from one carrier's handheld-scanner firmware bug; those rows are flagged and kept, not dropped, and excluded from "late".
- **An index on `invoice.invoice_date` cut the heaviest page from about two and a half minutes to about 1.4 seconds**, alongside the existing index on `order_ref`.
- **Seventeen KPIs ship in v1.2**, each with a one-line definition by [[sam-achebe|Sam Achebe]]; three of them needed an explicit unit.

## Tables

| Table | Holds |
| --- | --- |
| `shipment` | One row per shipment, from the carrier API. Carries `dispatched_at`, `promised_at`, `delivered_at`, `warehouse_id`, `carrier_id` and a `status` |
| `invoice` | One row per invoice, from finance's nightly CSV drop. Carries `invoice_date` |
| `carrier` | The carriers, joined on `carrier_id` |
| `order_ref` | A thin mapping table holding the prefixed (finance) and unprefixed (carrier) forms of the order number side by side |

### The three dates, and why it mattered

On 9 March 2026 the shipment table had three date columns and nobody agreed
which one was "the" date:

- `dispatched_at` — the carrier scan at the depot.
- `promised_at` — what sales told the customer.
- `delivered_at` — when it arrived.

Both candidate definitions of "late" were written down before the kickoff so
that one could be chosen on purpose rather than by accident. See
[[tidewater-late-definition|the "late" decision]].

### The join

The order number is the only key shared between shipments and invoices, and
finance stores it with a prefix while the carriers do not. `order_ref` holds both
forms. Finance confirmed on 14 April 2026 that an invoice is sometimes reissued
under a new number carrying a reference to the old one; that case is handled in
the same mapping table.

## Sources and their timing

| Source | Shape | Timing |
| --- | --- | --- |
| Carrier API | Pages of 200 shipments; rate-limits after about 40 calls a minute, undocumented and found by being blocked | Quietest before the morning shift |
| Finance CSV drop | A nightly file | Lands any time between 23:00 and 01:30 |

The loader uses a token bucket with a capacity of 5, refilling at 0.6 a second,
so it bursts a little and then settles just under the API's limit. It turned an
eight-minute full-day load into nine minutes with no errors. See
[[rate-limiting-token-bucket|the token bucket]].

## Airflow jobs

| Job | What it is |
| --- | --- |
| `tidewater_ingest_daily` | The nightly ingestion. Runs at 02:00, retries twice, twenty minutes apart. 02:00 is late enough for a finance file that lands at 01:30, and quiet on the carrier API |
| `tidewater_backfill_once` | A one-off DAG, run by hand and never scheduled, that loaded the two years of history on 26 March 2026 |

The old cron job was left disabled rather than deleted for a fallback window,
and removed on 2 April 2026, a day early, with nothing having fallen back to it.

### Backfill, 26 March 2026

- Loaded day by day, oldest first, so a failure part-way leaves a clean prefix
  of history rather than holes.
- 730 days; 3 failed on a carrier API timeout and went through on a rerun.
- Roughly 2.1 million shipments and 1.6 million invoices. The invoice count is
  lower because finance invoices some customers monthly rather than per
  shipment.
- Just under four hours in total. The daily job was untouched.

### The carrier clock bug

About 3% of shipments came back with `delivered_at` before `dispatched_at`. It is
one carrier's data only, in the window the source of 26 March 2026 calls "between
last June and January" — June 2025 to January 2026, read from the date it was
written. The carrier replied on 9 April 2026 that it was a firmware issue on their
handheld scanners, fixed in February 2026. Twenty examples were emailed to them. The rows are flagged and
kept, excluded from "late", and hidden behind a toggle in v1.2.

## Indexes and query performance

- Before any index, the heaviest page took about two and a half minutes over the
  full two years, because the query plan did a sequential scan over every
  invoice for each shipment in the filter.
- Adding an index on `invoice.invoice_date`, alongside the existing one on
  `order_ref`, brought that page to about 1.4 seconds.
- The lesson written into the schema guide: index the columns the dashboard
  filters and joins on, and read the plan before blaming Postgres.

## The 15-minute refresh

A Postgres materialised view refreshed by Airflow, concurrently, so the
dashboard never reads a half-built view. The refresh takes about 40 seconds on
dev and 52 seconds on staging, which holds the full history. See
[[tidewater-fifteen-minute-refresh|the refresh decision]].

## KPIs

Twelve were agreed at the kickoff on 10 March 2026. [[sam-achebe|Sam Achebe]]
had eleven by 16 March, then the twelfth; two were merged into one on 9 April;
the ops review added six. That is how twelve became seventeen.

The eleven as they stood on 16 March 2026:

on-time delivery rate, late shipments this week, average days late, shipments by
carrier, unpaid invoices over 30 days, unpaid value by customer, slow invoicing,
disputed invoices, carrier scorecard, deliveries per region, returns.

- **The merge (9 April 2026)**: "on-time delivery rate" and "late shipments this
  week" became one KPI with a weekly and a monthly view. They were built on the
  same rows and moved together every week, and two tiles saying the same thing
  make people think they are different. [[hannah-voss|Hannah Voss]] signed it off
  by email.
- **The three that needed a unit (16 April 2026)**: average days late ("days",
  not "time"); unpaid value by customer (pounds, excluding VAT); slow invoicing
  (days from delivery to invoice).
- **Grouping**: [[hannah-voss|Hannah Voss]] wanted the list grouped by who acts
  on it — carriers, finance, the floor — rather than alphabetically.
- **Validation**: checked against the old spreadsheet on dev. Two differed by
  more than rounding, and both were the spreadsheet's fault — it counted
  cancelled shipments as late.

## Runbook

As written for the team wiki on 20 March 2026:

1. The job fails loudly: the Airflow task goes red and posts to the team
   channel.
2. If the finance file is missing, wait for the second retry; if it is still
   missing, ask finance, then clear the task to rerun it.
3. If the carrier API is refusing calls, the limiter has probably been set too
   high. Check the last hour of logs for rate-limit errors.
4. Never edit the tables by hand to "fix" a day. Rerun the day instead — every
   load replaces the whole day, so a rerun is safe.

## Schema guide

First draft finished on 16 April 2026 and sent to [[ines-duarte|Ines Duarte]] and
[[tomas-lind|Tomas Lind]] for comments: one page per table, with what each column
means, which columns are indexed, and which joins are expected. It exists so that
other teams can read Tidewater's tables without [[mira-identity|Mira Okafor]] in
the room, and it is shared with anyone given the read-only role.

## Deploys

| Version | Where | When |
| --- | --- | --- |
| v1.1 | Dev server, for KPI checking against the old spreadsheet | 2 April 2026 |
| v1.2 | Staging: all seventeen KPIs, the 15-minute refresh, the "late" definition, the flag toggle | 21 April 2026 |

The staging deploy took a database snapshot first, applied four additive
migrations (new KPI columns and the carrier-clock flag), and was smoke-tested on
every KPI tile, the carrier filter, the week picker and the toggle. The rollback
plan is v1.1 still on dev plus the pre-deploy snapshot.

## Related

- [[tidewater-dashboard|Tidewater]] — the hub this is the deep reference for.
- [[tidewater-postgres-note-full-text|the Postgres-versus-DynamoDB note, in full]] — why this model is relational.
- [[driftwood-capacity-forecast|Driftwood]] — reads `shipment` and `carrier` through a read-only role.
- [[rate-limiting-token-bucket|the token bucket]] — the carrier loader's limiter.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 9, 16, 20 and 26 March, and [[journal-2026-04|journal April 2026]], entries 2, 9, 16 and 21 April.
