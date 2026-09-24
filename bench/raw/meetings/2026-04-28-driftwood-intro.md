# Driftwood intro — 28 April 2026

**Attendees:** Mira Okafor, Tomas Lind, Ines Duarte (data scientist)

## Context

Driftwood is Ines Duarte's warehouse capacity forecast: how full each of the
three warehouses will be over the next six weeks, so the ops team can book
overflow space before it gets expensive. It is a separate project from
Tidewater, but it reads Tidewater's shipment tables.

## Discussion

- Ines needs weekly shipment volumes by warehouse and carrier. Tidewater has
  them already, at daily grain.
- Her first idea was a copy of the tables into her own database. Tomas and I
  both preferred a read-only role on Tidewater's Postgres, so there is one copy
  of the truth and no second ingestion to keep alive.
- The forecast itself runs weekly, on Monday mornings, as its own Airflow job,
  `driftwood_forecast_weekly`. It is not an ingestion job; it only reads.
- Ines asked whether Tidewater's 15-minute refresh would slow her queries. It
  should not — her job runs once a week, outside the ops team's morning peak.

## How the forecast works (Ines's summary)

- Input: weekly shipment volume per warehouse for the last two years, plus
  known promotions and public holidays.
- Model: a seasonal baseline per warehouse, adjusted for promotions. She tried
  something more elaborate last year at her old job and it was worse on short
  histories.
- Output: expected fill, as a share of capacity, per warehouse per week for six
  weeks, with a low and a high estimate.
- The ops team books overflow space when the high estimate crosses 90% for any
  week in the next four.

## What Driftwood needs from Tidewater

| Need | Where it is in Tidewater |
| --- | --- |
| Shipments per warehouse per day | `shipment`, by `warehouse_id` and `dispatched_at` |
| Carrier | `carrier`, joined on `carrier_id` |
| Cancelled shipments excluded | `shipment.status` |
| Carrier-clock rows | flagged; Ines will keep them, since dispatch dates are fine |

## Decisions

- **Driftwood reads Tidewater's Postgres through a read-only role**, rather
  than copying the data, because a second copy would need its own ingestion and
  would drift.
- Driftwood's results are refreshed **weekly**; nobody plans capacity by the
  hour.
- Ines owns Driftwood. I review the SQL and own the read-only role.

## Deadline

- First forecast in front of the ops team by **30 June**.

## Actions

- Mira to create the read-only role and share the schema guide.
- Ines to send a list of the columns she needs.
- Tomas to introduce Ines to Hannah Voss.

## Other

- Priya's talk on 25 April went well; the hybrid results got the most
  questions. Tomas wants the slides shared with the team.
