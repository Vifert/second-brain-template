---
title: Driftwood
summary: Ines Duarte's six-week warehouse capacity forecast, reading Tidewater's Postgres through a read-only role; Mira reviews its SQL and owns the role.
aliases: [Driftwood, the capacity forecast, warehouse capacity forecast, the warehouse forecast, overflow space, driftwood_forecast_weekly, the forecast that reads my tables, three warehouses]
topic: projects
kind: hub
status: pending
tags: [org/harbor-analytics, tech/postgres, tech/airflow, field/data-engineering, domain/logistics]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Status as of 28 April 2026**: Driftwood was introduced and its read-only access agreed, with the first forecast due in front of the ops team by 30 June 2026.
- **Driftwood forecasts how full each of Harbor Analytics' three warehouses will be over the next six weeks**, so the ops team can book overflow space before it gets expensive.
- **[[ines-duarte|Ines Duarte]] owns Driftwood**; [[mira-identity|Mira Okafor]] reviews the SQL and owns the read-only role it reads through.
- **Driftwood is a separate project from Tidewater but reads Tidewater's shipment tables** rather than copying them, so there is one copy of the truth and no second ingestion to keep alive.
- **Driftwood's model is a seasonal baseline per warehouse adjusted for promotions**, not something more elaborate — [[ines-duarte|Ines Duarte]] tried that at her old job and it was worse on short histories.
- **Driftwood runs weekly** on Monday mornings as its own Airflow job, `driftwood_forecast_weekly`, which only reads and never ingests.
- **The ops team books overflow space when Driftwood's high estimate crosses 90% of capacity** for any week in the next four.

## What it is

A warehouse capacity forecast: expected fill, as a share of capacity, for each of
the three warehouses, for each of the next six weeks, with a low and a high
estimate. Its purpose is to get overflow space booked before it becomes
expensive.

It is the first thing built on Tidewater that is not Tidewater — which is what
[[ines-duarte|Ines Duarte]] told [[tomas-lind|Tomas Lind]] she wanted it to be,
before the 1:1 of 26 March 2026.

## How the forecast works

| Part | What |
| --- | --- |
| Input | Weekly shipment volume per warehouse for the last two years, plus known promotions and public holidays |
| Model | A seasonal baseline per warehouse, adjusted for promotions |
| Output | Expected fill as a share of capacity, per warehouse per week for six weeks, with a low and a high estimate |
| Trigger | The ops team books overflow space when the high estimate crosses 90% for any week in the next four |
| Schedule | Weekly, Monday mornings, as the Airflow job `driftwood_forecast_weekly` |

## What it needs from Tidewater

| Need | Where it is in Tidewater |
| --- | --- |
| Shipments per warehouse per day | `shipment`, by `warehouse_id` and `dispatched_at` |
| Carrier | `carrier`, joined on `carrier_id` |
| Cancelled shipments excluded | `shipment.status` |
| Carrier-clock rows | Flagged; [[ines-duarte|Ines Duarte]] keeps them, since the dispatch dates are fine |

Driftwood needs weekly grain; Tidewater already holds the data at daily grain.
Tidewater's 15-minute refresh is not expected to slow Driftwood's queries, since
the forecast runs once a week and outside the ops floor's morning peak.

## Who does what

- **[[ines-duarte|Ines Duarte]]** owns Driftwood and its model, and is sending the
  list of columns she needs.
- **[[mira-identity|Mira Okafor]]** reviews the SQL, and creates and owns the
  read-only role and the schema guide that goes with it.
- **[[tomas-lind|Tomas Lind]]** is introducing [[ines-duarte|Ines Duarte]] to
  [[hannah-voss|Hannah Voss]], whose floor acts on the forecast.

## How it got here

| Date | What |
| --- | --- |
| 2026-03-02 | [[ines-duarte|Ines Duarte]] wanted to borrow whatever Tidewater stored — the reason its tables were kept readable by other people from the start |
| 2026-03-20 | Asked to read the tables directly; told to wait for the schema to settle |
| 2026-03-26 | [[tomas-lind|Tomas Lind]] wanted the tables documented well enough for it, and said the request could wait until they had settled |
| 2026-04-16 | Asked formally, after which an intro meeting was set for once Tidewater reached staging |
| 2026-04-28 | Intro meeting: the read-only role, the model, and a 30 June deadline |

## Status Log

| As of | Status | Source |
| --- | --- | --- |
| 2026-04-16 | Formally requested: a forecast built on Tidewater's Postgres, intro meeting to follow staging | Journal, 16 April 2026 |
| 2026-04-28 | Introduced and scoped; read-only role agreed, columns list to come from Ines Duarte, first forecast due 30 June | Driftwood intro, 28 April 2026 |

## Related

- [[driftwood-reads-tidewater-read-only|the read-only role decision]] — why it reads rather than copies.
- [[tidewater-dashboard|Tidewater]] — the project it reads from.
- [[tidewater-data-model|the Tidewater data model]] — the tables, columns and schema guide it builds on.
- [[ines-duarte|Ines Duarte]] — who owns it.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 2, 20 and 26 March, and [[journal-2026-04|journal April 2026]], entries 16 and 28 April.
