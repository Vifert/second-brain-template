---
title: Tidewater Refreshes Every 15 Minutes, Not in Real Time
summary: Real-time refresh was dropped after the ops lead could name nothing she would do differently with live numbers; a streaming prototype was built first, then parked.
aliases: [why not real time, the refresh schedule, 15 minute refresh, the 15 minute refresh, fifteen minute refresh, why no streaming, the streaming prototype, live numbers, how often does the dashboard refresh]
topic: projects
kind: decision
status: active
tags: [org/harbor-analytics, tech/postgres, tech/airflow, field/data-engineering]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Tidewater refreshes every 15 minutes**, decided at the status meeting on 14 April 2026; real-time refresh was dropped.
- **The deciding question was asked of the person who wanted live numbers**: [[hannah-voss|Hannah Voss]] was asked what she would do differently with numbers from a minute ago rather than a quarter of an hour ago, and said nothing.
- **A streaming prototype was built before the decision, not instead of it**, so the comparison was measured rather than argued — and it doubled the moving parts and needed an on-call rota nobody had asked for.
- **The streaming prototype is parked in its branch, not deleted**, so the option survives if the answer to that question ever changes.
- **The 15-minute refresh is a Postgres materialised view refreshed concurrently by Airflow**, taking about 40 seconds on dev and 52 on staging.
- **The refresh case was written down before it was needed**, following the pattern that worked for the storage choice.

## The decision

Drop real-time refresh. The dashboard refreshes every 15 minutes instead. Agreed
at the Tidewater status meeting on 14 April 2026, and rebuilt that way on
16 April.

## Why

- **The ops floor's rhythm is shifts, not seconds.** It looks at the dashboard at
  the start of each shift and after lunch. Nothing on it changes a decision
  within minutes.
- **The question that settled it.** [[hannah-voss|Hannah Voss]] asked for "live"
  numbers at the ops review. Asked what she would do differently with numbers
  from a minute ago rather than from a quarter of an hour ago, she said nothing.
- **The cost was measured, not guessed.** A streaming prototype was built in the
  week before the meeting. It worked, and it doubled the moving parts and
  required an on-call rota nobody had asked for. A scheduled refresh keeps one
  moving part; streaming adds three.

## How it is built

A Postgres materialised view, refreshed by Airflow **concurrently**, so the
dashboard never reads a half-built view. The refresh takes about 40 seconds on
dev and 52 seconds on staging, which carries the full two years of history.

## What was kept rather than thrown away

The streaming prototype sits in its branch, unmerged and undeleted. If the ops
team ever wants events as they happen, the work and the timing already exist —
and the storage note already says that case would change the ingestion before the
database.

## How this decision came to be written down early

[[tomas-lind|Tomas Lind]]'s point at the 1:1 of 26 March 2026 was that leading a
project from the start is mostly writing things down early and letting people
disagree with the written version. [[mira-identity|Mira Okafor]]'s note that day
was to do for the refresh schedule what the storage note had done — before
somebody asked for "live" numbers. The draft was written on 9 April, and the ask
came at the review.

## Related

- [[tidewater-dashboard|Tidewater]] — the dashboard it governs.
- [[tidewater-data-model|the Tidewater data model]] — the materialised view and its timings.
- [[tidewater-postgres-over-dynamodb|the storage decision]] — the pattern this one copied.
- **Day-by-day record**: [[journal-2026-04|journal April 2026]], entries 9, 14 and 16 April.
