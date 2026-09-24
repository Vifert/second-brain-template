---
title: Sam Achebe
summary: The analyst on Tidewater who defined its KPIs with the ops team and checked every number against the old spreadsheet.
aliases: [Sam Achebe, Achebe, the analyst on Tidewater, the Tidewater analyst, Sam the analyst, who defined the KPIs]
topic: people
kind: person
pronouns: he/him
tags: [rel/colleague, org/harbor-analytics]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Sam Achebe is the analyst on Tidewater** at Harbor Analytics, and owns its KPI list and the one-line definition of each KPI.
- **Sam Achebe writes the KPI queries himself in SQL**, which is one of the four reasons Tidewater went to Postgres rather than DynamoDB.
- **Sam Achebe found two KPIs on the dev server that differed from the old spreadsheet by more than rounding** on 2 April 2026; both were the spreadsheet's fault — it counted cancelled shipments as late.
- **Sam Achebe presented the KPI list at the ops review himself**, at [[tomas-lind|Tomas Lind]]'s request, rather than having Mira Okafor present it for him.
- **Sam Achebe is not the Sam with the allotment plot** — that is Sam Whitlock.

## How he comes up

An analyst at Harbor Analytics, on Tidewater from its kickoff on 10 March 2026.
Mira Okafor's note of 16 April 2026: "Pairing with Sam is the best part of this
project."

## What he has done

| When | What |
| --- | --- |
| 2026-03-10 | Took the kickoff action to define 12 KPIs with the ops team. Also to ask finance whether an invoice is ever reissued under a new number. |
| 2026-03-16 | Brought a first list of eleven KPIs, one short of the twelve agreed. Mira Okafor spotted that "on-time delivery rate" and "late shipments this week" looked like the same thing measured twice. |
| 2026-04-09 | Agreed the merge of those two KPIs into one with a weekly and a monthly view. Guessed the ops review would add five more. |
| 2026-04-02 | Checked the dev build's KPI numbers against the old spreadsheet and found the two real differences, both the spreadsheet's. |
| 2026-04-14 | Reported the KPI list had grown to 17 after the ops review, and that the rest matched the spreadsheet within rounding. Took the action to write one-line definitions for every KPI. |
| 2026-04-16 | Went through all seventeen KPIs line by line with Mira Okafor; three definitions needed a unit. |

## Related

- [[tidewater-dashboard|Tidewater]] — the project whose KPIs he owns.
- [[tidewater-data-model|the Tidewater data model]] — the KPI list and the three definitions that needed units.
- [[sam-whitlock|Sam Whitlock]] — the other Sam, at the allotment.
- [[harbor-analytics|Harbor Analytics]] — where he works.
- [[journal-2026-04|journal April 2026]] — the KPI merge and the line-by-line review, in full.
