---
title: Ines Duarte
summary: The data scientist at Harbor Analytics who owns Driftwood, the warehouse capacity forecast that reads Tidewater's Postgres through a read-only role.
aliases: [Ines, Ines Duarte, Duarte, the data scientist, who owns Driftwood, who wants to read my tables]
topic: people
kind: person
pronouns: she/her
tags: [rel/colleague, org/harbor-analytics]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Ines Duarte is a data scientist at Harbor Analytics** and owns Driftwood, the six-week warehouse capacity forecast.
- **Ines Duarte reads Tidewater's tables through a read-only role** rather than copying them; her first idea was a copy into her own database, and Mira Okafor and [[tomas-lind|Tomas Lind]] both preferred one copy of the truth.
- **Ines Duarte's forecast is a seasonal baseline per warehouse adjusted for promotions**; she tried something more elaborate at her old job and it was worse on short histories.
- **Ines Duarte wanted Driftwood to be the first thing built on Tidewater that is not Tidewater**, as she told Tomas Lind before the 26 March 2026 1:1.
- **Ines Duarte keeps the carrier-clock-flagged rows** in her inputs, since only the dispatch dates matter to her.

## How she comes up

On the data science side at Harbor Analytics. She appears in Mira Okafor's
standup note of 2 March 2026, asks twice to read Tidewater's tables, and owns
Driftwood from its intro meeting on 28 April 2026.

## What she has asked for and built

| When | What |
| --- | --- |
| 2026-03-02 | Still on the warehouse capacity numbers, and wanting to borrow whatever Tidewater stored — the reason Mira Okafor kept the tables readable by other people. |
| 2026-03-20 | Asked whether her capacity work could read the Tidewater tables directly. Told to wait for the status meeting, once the schema settled. |
| 2026-04-16 | Asked formally to build the forecast on Tidewater's Postgres. |
| 2026-04-28 | At the Driftwood intro, agreed the read-only role, described how the forecast works, and took the action to send the list of columns she needs. |

## Driftwood, in her own summary

- **Input**: weekly shipment volume per warehouse for the last two years, plus
  known promotions and public holidays.
- **Model**: a seasonal baseline per warehouse, adjusted for promotions.
- **Output**: expected fill as a share of capacity, per warehouse per week for
  six weeks, with a low and a high estimate.
- **Trigger**: the ops team books overflow space when the high estimate crosses
  90% for any week in the next four.

## Related

- [[driftwood-capacity-forecast|Driftwood]] — the forecast she owns.
- [[driftwood-reads-tidewater-read-only|the read-only role decision]] — why she reads rather than copies.
- [[tidewater-data-model|the Tidewater data model]] — the tables and schema guide she builds on.
- [[harbor-analytics|Harbor Analytics]] — where she works.
- [[journal-2026-04|journal April 2026]] — the Driftwood intro of 28 April, in full.
