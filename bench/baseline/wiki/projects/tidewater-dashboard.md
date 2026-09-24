---
title: Tidewater
summary: Harbor Analytics' internal dashboard joining shipments and invoices for the ops floor, replacing a 23-tab spreadsheet; Mira leads its design and build.
aliases: [Tidewater, Tidewater dashboard, the shipments dashboard, the ops dashboard, the invoices dashboard, my main project, the dashboard I lead, shipments and invoices, ops floor dashboard]
topic: projects
kind: hub
status: in-progress
tags: [org/harbor-analytics, tech/postgres, tech/airflow, tech/sql, field/data-engineering, domain/logistics, subject/migration]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Status as of 21 April 2026**: Tidewater v1.2 is on staging with all seventeen KPIs; production follows a week of ops-team use and [[hannah-voss|Hannah Voss]]'s sign-off, against a 15 May deadline.
- **Tidewater joins shipments and invoices in one view** for about fifteen people on Harbor Analytics' ops floor, replacing a 23-tab spreadsheet updated by hand every Monday of which only four tabs were used.
- **Tidewater runs on Postgres, not the platform team's default DynamoDB**, because every useful page joins shipments, invoices and carriers, and the ops team's filters change every week.
- **"Late" in Tidewater means delivered after `promised_at`** — the date promised to the customer. Finance's meaning, invoiced after delivery, is a separate KPI called "slow invoicing".
- **Tidewater refreshes every 15 minutes, not in real time**, after [[hannah-voss|Hannah Voss]] asked for live numbers and could name nothing she would do differently with them.
- **Tidewater's KPI list grew from the twelve agreed at kickoff to seventeen** after the mid-April ops review; [[sam-achebe|Sam Achebe]] owns it and writes its queries himself.
- **[[mira-identity|Mira Okafor]] counted seven weeks from kickoff to staging** on 21 April 2026, and her reading is that the fast parts were the ones written down early and the slow part was the KPI list, which nobody wrote down until the ops review forced it.

## What it is

An internal dashboard for Harbor Analytics' operations team, combining shipments
and invoices so that late deliveries and unpaid invoices can be seen in one
place. Before it, the ops team worked from a spreadsheet with 23 tabs that one
person updated by hand every Monday; by Thursday it was out of date, and nobody
could tell whether a shipment marked late was delivered late or invoiced late.

[[hannah-voss|Hannah Voss]], who runs the ops floor, trusted exactly one of those
tabs. Her four questions at the kickoff became the first KPIs.

## Who is on it

| Person | Part |
| --- | --- |
| [[mira-identity|Mira Okafor]] | Lead: the design, the ingestion and the data model |
| [[sam-achebe|Sam Achebe]] | The KPI list, its definitions, and the SQL behind it |
| [[hannah-voss|Hannah Voss]] | Ops lead: the questions it must answer, and the definition of "late" |
| [[tomas-lind|Tomas Lind]] | Manager: asked for the decisions in writing, holds the platform team |

## How it is built

- **Shipments** come from the carrier API, which pages at 200 records and
  rate-limits after about 40 calls a minute; the loader uses a token bucket.
- **Invoices** come from finance's nightly CSV drop, which lands any time
  between 23:00 and 01:30.
- **The only shared key is the order number**, which finance prefixes and the
  carriers do not; a mapping table holds both forms.
- **Ingestion is one nightly Airflow job at 02:00** with two retries twenty
  minutes apart, so a late finance file is still picked up.
- **The dashboard reads a Postgres materialised view** refreshed concurrently by
  Airflow every 15 minutes, in about 40 seconds.

Full tables, columns, jobs, indexes, KPIs and the runbook are in
[[tidewater-data-model|the Tidewater data model]].

## Timeline

| Date | What happened |
| --- | --- |
| 2026-03-02 | Old spreadsheet read; the order-number join problem found |
| 2026-03-10 | Kickoff: Postgres, the "late" definition, 12 KPIs, 30 April deadline |
| 2026-03-16 | First build week; the carrier API's undocumented rate limit found by being blocked |
| 2026-03-20 | Ingestion moved from cron to Airflow, with a runbook |
| 2026-03-26 | Two years of history backfilled; the carrier clock bug found in about 3% of rows |
| 2026-04-02 | Invoice-date index; v1.1 to dev for KPI checking |
| 2026-04-14 | Status meeting: 17 KPIs, deadline to 15 May, real-time refresh dropped |
| 2026-04-21 | v1.2 to staging, with a rollback plan |

### One thing the record does not settle

[[mira-identity|Mira Okafor]]'s reflection of 21 April 2026 counts **seven weeks
from kickoff to staging**. The kickoff meeting was 10 March, which is six weeks
before 21 April; the first journal entry about Tidewater is 2 March, which is
seven. Her count is recorded as she wrote it rather than corrected, because the
sources do not say which start she meant.

## The decisions

- [[tidewater-postgres-over-dynamodb|Postgres over DynamoDB]] — the joins and the ad-hoc filters.
- [[tidewater-late-definition|"Late" means delivered after `promised_at`]] — Hannah Voss's definition, chosen on purpose over finance's.
- [[tidewater-fifteen-minute-refresh|Refresh every 15 minutes, not in real time]] — and the streaming prototype parked, not deleted.
- [[tidewater-deadline-moved-to-15-may|The deadline moved from 30 April to 15 May]] — to pay for the extra KPIs.

## Risks carried

- **The order-number join.** If a large share of shipments cannot be matched to
  invoices, the unpaid-invoice views are wrong. Finance confirmed on 14 April
  2026 that invoices are sometimes reissued under a new number with a reference
  to the old one; the mapping table handles it.
- **Late finance files.** The 02:00 schedule and the second retry absorb a drop
  as late as 01:30.
- **More KPIs.** Foreseen at the kickoff, and duly what moved the deadline.
- **The platform team's quarterly review** may revisit the storage choice.
  [[tomas-lind|Tomas Lind]] thinks not, and told them the decision stands.

## Status Log

| As of | Status | Source |
| --- | --- | --- |
| 2026-03-10 | Kicked off; storage, the "late" definition and a 30 April deadline agreed | Kickoff record, 10 March 2026 |
| 2026-04-14 | Ingestion and data model done, dashboard layout in progress; deadline moved to 15 May | Status meeting, 14 April 2026 |
| 2026-04-21 | v1.2 on staging with all seventeen KPIs; production after a week of ops use and Hannah Voss's sign-off | Journal, 21 April 2026 |

## Related

- [[tidewater-data-model|Tidewater data model]] — the deep reference: tables, columns, jobs, indexes, the KPI list and the runbook.
- [[tidewater-postgres-note-full-text|the Postgres-versus-DynamoDB note, in full]] — the one-pager sent to the platform team.
- [[driftwood-capacity-forecast|Driftwood]] — the first thing built on Tidewater that is not Tidewater.
- [[harbor-analytics|Harbor Analytics]] — the employer whose ops team it serves.
- [[rate-limiting-algorithms|rate limiting]] — the token bucket the carrier loader runs on.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 2–26 March, and [[journal-2026-04|journal April 2026]], entries 2–28 April.
