---
title: "\"Late\" Means Delivered After promised_at"
summary: Tidewater measures lateness against the date promised to the customer, and finance's invoiced-after-delivery meaning became a separate KPI instead.
aliases: [what late means, the late definition, definition of late, delivered after promised, slow invoicing, which date is late measured against, how is late calculated]
topic: projects
kind: decision
status: active
tags: [org/harbor-analytics, domain/logistics, field/data-modelling]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **In Tidewater, "late" means delivered after `promised_at`** — the date sales promised the customer — decided at the kickoff on 10 March 2026.
- **[[hannah-voss|Hannah Voss]] gave that definition** as the ops lead, and the ops floor's view of lateness is the one the dashboard reports.
- **Finance's meaning, invoiced after delivery, did not lose — it was renamed**: it ships as a separate KPI called "slow invoicing", measured in days from delivery to invoice.
- **The choice was made on purpose because both meanings were written down first**, on 9 March 2026, precisely so the kickoff would pick one rather than drift into one.
- **Shipments flagged for the carrier clock bug are excluded from "late"**, since a `delivered_at` before its `dispatched_at` cannot be measured against anything.
- **Before Tidewater nobody could tell the two apart** — the old spreadsheet marked shipments late without saying whether delivery or invoicing was the cause.

## The decision

"Late" is delivered after `promised_at`. Agreed at the Tidewater kickoff on
10 March 2026, on [[hannah-voss|Hannah Voss]]'s definition, and shipped in v1.2
on 21 April 2026.

## Why there was a choice at all

A shipment carries three dates: `dispatched_at`, the carrier's depot scan;
`promised_at`, what sales told the customer; and `delivered_at`. Two groups
measured lateness differently:

| Who | What they meant by late |
| --- | --- |
| The ops floor ([[hannah-voss|Hannah Voss]]) | Delivered after the date promised to the customer |
| Finance | Invoiced after delivery |

The old 23-tab spreadsheet marked shipments late without distinguishing the two,
so nobody was sure whether a late shipment had been delivered late or invoiced
late. Both definitions were written down on 9 March 2026, the day before the
kickoff, so that one would be chosen deliberately.

## What happened to the other meaning

Finance's meaning became **"slow invoicing"**, one of the seventeen KPIs, defined
on 16 April 2026 in days from delivery to invoice. Nothing was dropped; the two
measures simply stopped sharing a name.

## Consequences

- The dashboard's late views read `promised_at` and `delivered_at`.
- Shipments carrying the carrier clock flag — about 3% of the history, where
  `delivered_at` precedes `dispatched_at` — are excluded from "late" and hidden
  behind a toggle.
- "On-time delivery rate" and "late shipments this week" turned out to be the
  same measure twice, and were merged into one KPI on 9 April 2026.

## Related

- [[tidewater-dashboard|Tidewater]] — the dashboard this defines a column of.
- [[tidewater-data-model|the Tidewater data model]] — the three date columns and the flagged rows.
- [[hannah-voss|Hannah Voss]] — who chose it.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 9 and 10 March.
