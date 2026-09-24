---
title: Journal — April 2026
summary: Dated record for April 2026 — the invoice index, the paper submitted, the KPI merge, the deadline moving to 15 May, the staging deploy and the Driftwood intro.
aliases: [April 2026, journal April 2026, April 2026 journal, what did I do in April, what happened in April 2026, 2026-04]
topic: journal
kind: log
tags: []
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **The retrieval paper was submitted on 2 April 2026**, a day before the deadline, with the table order and caption fixed by Priya Raman.
- **An index on `invoice.invoice_date` cut the heaviest Tidewater page from about two and a half minutes to about 1.4 seconds** on 2 April 2026.
- **Two overlapping delivery KPIs were merged into one on 9 April 2026**, signed off by Hannah Voss by email.
- **Tidewater's deadline moved from 30 April to 15 May 2026 at the status meeting on 14 April**, to pay for the KPI list growing to seventeen.
- **Real-time refresh was dropped on 14 April 2026** in favour of a refresh every 15 minutes, with the streaming prototype parked in its branch.
- **Tidewater v1.2 went to staging on 21 April 2026** with all seventeen KPIs; Hannah Voss's reaction was "finally".
- **Driftwood was introduced on 28 April 2026** as Ines Duarte's forecast reading Tidewater's Postgres through a read-only role, due in front of the ops team by 30 June.

### 2026-04-02 (2-Apr-26)

#### Work

- Tidewater: the invoice join is slow on the full history; added an index on
  invoice date and it dropped from minutes to seconds.
- The query plan was doing a sequential scan over every invoice for each
  shipment. With the index on `invoice.invoice_date` plus the existing one on
  `order_ref`, the dashboard's heaviest page loads in about 1.4 seconds.
- Put Tidewater v1.1 on the dev server so Sam can check the KPI numbers
  against the old spreadsheet. Not staging yet — dev is only for us.
- Removed the old cron job a day early. Nothing had fallen back to it.

#### Life

- Priya's talk at the Leeds Data Meetup is on 18 April. She's presenting the
  hybrid retrieval results from our paper. Put it in the calendar.
- Asked Priya whether she wants me to do the demo half. She'll think about it.
- Mum arrives next Thursday. Spare room is still full of seed trays.

#### Notes

- Before the index, the heaviest page took about two and a half minutes on the
  full two years. The query plan showed a sequential scan over the invoices for
  every shipment in the filter. Lesson for the schema guide: index the columns
  the dashboard filters and joins on, and read the plan before blaming Postgres.
- Paper went in this morning, a day before the deadline. Priya fixed the table
  order and the caption; the number-of-notes question Tomas raised is, I think,
  still open — check with her.
- Sam found two KPIs on dev that differ from the spreadsheet by more than
  rounding. Both were the spreadsheet's fault: it counted cancelled shipments as
  late. He's pleased; Hannah will be less pleased.

#### Run

Easy 6 km with the new shoes. No time — didn't take the watch.

### 2026-04-09 (9-Apr-26)

#### Work

- Reviewed Sam's KPI definitions for Tidewater. Some overlap; we merged two.
- Which two: "on-time delivery rate" and "late shipments this week" are now
  one KPI with a weekly and a monthly view. Hannah signed that off by email.
- The ops review is next week and Hannah has already hinted at "a few more"
  KPIs. Sam thinks that means five. I think that means the deadline.
- Paper: sent Priya my related-work paragraph on lifelogging and on the
  earlier desktop-search studies. She cut it by half, which was fair.

#### Life

- Priya's talk moved to 25 April — the venue was double-booked for the 18th.
  Updated the calendar.
- Good news: the 25th is the day after I get back from London, so I can
  actually go.
- Mum's visit: walked her round the allotment. Sam Whitlock gave her a bag of
  rhubarb and a twenty-minute lecture on slugs. She loved it.

#### Notes

- Why merge the two delivery KPIs: they were built on the same rows and moved
  together every week. Two tiles saying the same thing makes people think they
  are different, and then ask why.
- Draft of the refresh note, before anyone asks for "live": the ops floor looks
  at the dashboard at the start of each shift and after lunch. Nothing on it
  changes a decision within minutes. A scheduled refresh keeps one moving part;
  streaming adds three. Built a streaming prototype anyway, so the comparison is
  real rather than argued.
- Carrier replied about the clock bug: a firmware issue on their handheld
  scanners, fixed in February. The flagged rows stay flagged.

#### To do

- [ ] Finish the streaming prototype enough to time it.
- [ ] Schema guide: first draft by the end of next week.
- [ ] Buy slug pellets (organic ones — Sam Whitlock is watching).

### 2026-04-14 (14-Apr-26)

#### Tidewater status — meeting record

**Attendees:** Mira Okafor, Tomas Lind, Sam Achebe

##### Status

- Ingestion and the data model are done; the dashboard layout is in progress.
- Sam's KPI list has grown to **17** after the ops review.
- Two years of history are loaded (backfilled on 26 March). About 3% of
  shipments carry a carrier clock error and are flagged, not dropped.
- v1.1 has been on the dev server since 2 April; Sam has checked the KPI
  numbers against the old spreadsheet and they match within rounding.
- The heaviest page loads in about 1.4 seconds after the invoice-date index.

##### Discussion

- The ops review added six KPIs and merged two, which is how twelve became
  seventeen (Sam had eleven of the original twelve by mid-March, then the last
  one, then the review).
- Hannah asked for "live" numbers at the review. Asked what she would do
  differently with numbers from a minute ago rather than from a quarter of an
  hour ago, she said nothing.
- A streaming prototype exists (Mira, last week). It works, but it doubles the
  moving parts and needs an on-call rota nobody has asked for.
- Finance confirmed that invoices are sometimes reissued with a new number and
  a reference to the old one. Handled in the mapping table.

##### Decisions

- The deadline **moves to 15 May**, to fit the extra KPIs.
- **Drop real-time refresh**: nobody needs second-by-second numbers. The
  dashboard **refreshes every 15 minutes** instead.
- The streaming prototype is parked in its branch, not deleted.

##### Risks now

- The extra KPIs need new columns and a second pass through the dashboard
  layout; that is what the new deadline pays for.
- Ines Duarte's capacity work wants to read Tidewater's tables. Not before
  staging; an intro meeting after that.
- The platform team may revisit the storage choice at their quarterly review.
  Tomas thinks not.

##### Actions

- Mira to deploy a first build to staging next week.
- Sam to write one-line definitions for every KPI.
- Tomas to tell the platform team the storage decision stands.

### 2026-04-16 (16-Apr-26)

#### Work

- After Tuesday's status meeting: Sam Achebe and I went through all seventeen
  KPIs line by line. His one-line definitions are good; three of them needed a
  unit ("days", not "time"). Pairing with Sam is the best part of this project.
- Rebuilt the dashboard's refresh as a scheduled query every 15 minutes, per
  the meeting. The streaming prototype is parked in a branch, not merged.
- Ines Duarte formally asked to build her warehouse capacity forecast on top
  of Tidewater's Postgres. Tomas wants a short intro meeting for it after
  Tidewater reaches staging.
- Staging deploy is set for Tuesday next week.

#### Life

- Planted the potatoes at last. Sam Whitlock's advice: earth them up as soon
  as the shoots show. Mine: plant them before May.
- Idea half-formed on the walk home — a camera in the bird box on the shed,
  streaming to my phone. Would need power out there, which is the same problem
  as the soil sensor. Maybe one solar panel for both.

#### Notes

- The three KPIs that needed units: average days late ("days", not "time"),
  unpaid value by customer (pounds, excluding VAT), and slow invoicing (days
  from delivery to invoice).
- The 15-minute schedule is a Postgres materialised view refreshed by Airflow,
  concurrently, so the dashboard never reads a half-built view. Refresh takes
  about 40 seconds.
- Schema guide first draft done: one page per table, with what each column
  means, which columns are indexed, and which joins are expected. Sent to Ines
  and Tomas for comments.

#### Run

5 km loop by the canal, easy pace, no watch again. Legs good.

### 2026-04-21 (21-Apr-26)

#### Work

- Deployed Tidewater v1.2 to staging. The refresh runs on schedule and the ops
  team can start clicking around tomorrow.
- v1.2 includes all seventeen KPIs, the 15-minute refresh, and the "late"
  definition Hannah chose at the kickoff (delivered after promised). The
  flagged carrier-clock rows are hidden behind a toggle.
- Hannah's first reaction, by message: "finally". Taking it.
- Rollback plan written: v1.1 is still on dev, and the staging database is
  snapshotted before each deploy.

#### Life

- Idea: a soil-moisture sensor for the allotment, so I stop guessing when to
  water. Wrote it up as a separate note.
- Also wrote up the bird box camera properly, as its own note.
- Packed for London. Taking the data book; I'm on chapter 7, transactions.

#### Deploy notes

1. Snapshot of the staging database: taken.
2. Migrations: four, all additive — new KPI columns and the flag for the
   carrier-clock rows.
3. First refresh of the materialised view on staging: 52 seconds, a little
   slower than dev because staging has the full history.
4. Smoke test: every KPI tile loads; the carrier filter and the week picker
   work; the toggle hides the flagged rows.
5. Told the team channel, with the link and a list of what's new.

#### Notes

- Production is next, once the ops team has had a week on staging and Hannah
  says it matches how they work. That leaves time before the 15 May deadline.
- Ines's capacity work needs a proper intro meeting; Tomas is setting one up
  for next week.

#### Reflection

Seven weeks from kickoff to staging. The parts that went fast were the ones
written down early: the storage choice, the "late" definition, the refresh
schedule. The part that went slow was the KPI list, which nobody wrote down
until the ops review forced it.

### 2026-04-28 (28-Apr-26)

#### Driftwood intro — meeting record

**Attendees:** Mira Okafor, Tomas Lind, Ines Duarte (data scientist)

##### Context

Driftwood is Ines Duarte's warehouse capacity forecast: how full each of the
three warehouses will be over the next six weeks, so the ops team can book
overflow space before it gets expensive. It is a separate project from
Tidewater, but it reads Tidewater's shipment tables.

##### Discussion

- Ines needs weekly shipment volumes by warehouse and carrier. Tidewater has
  them already, at daily grain.
- Her first idea was a copy of the tables into her own database. Tomas and I
  both preferred a read-only role on Tidewater's Postgres, so there is one copy
  of the truth and no second ingestion to keep alive.
- The forecast itself runs weekly, on Monday mornings, as its own Airflow job,
  `driftwood_forecast_weekly`. It is not an ingestion job; it only reads.
- Ines asked whether Tidewater's 15-minute refresh would slow her queries. It
  should not — her job runs once a week, outside the ops team's morning peak.

##### How the forecast works (Ines's summary)

- Input: weekly shipment volume per warehouse for the last two years, plus
  known promotions and public holidays.
- Model: a seasonal baseline per warehouse, adjusted for promotions. She tried
  something more elaborate last year at her old job and it was worse on short
  histories.
- Output: expected fill, as a share of capacity, per warehouse per week for six
  weeks, with a low and a high estimate.
- The ops team books overflow space when the high estimate crosses 90% for any
  week in the next four.

##### What Driftwood needs from Tidewater

| Need | Where it is in Tidewater |
| --- | --- |
| Shipments per warehouse per day | `shipment`, by `warehouse_id` and `dispatched_at` |
| Carrier | `carrier`, joined on `carrier_id` |
| Cancelled shipments excluded | `shipment.status` |
| Carrier-clock rows | flagged; Ines will keep them, since dispatch dates are fine |

##### Decisions

- **Driftwood reads Tidewater's Postgres through a read-only role**, rather
  than copying the data, because a second copy would need its own ingestion and
  would drift.
- Driftwood's results are refreshed **weekly**; nobody plans capacity by the
  hour.
- Ines owns Driftwood. I review the SQL and own the read-only role.

##### Deadline

- First forecast in front of the ops team by **30 June**.

##### Actions

- Mira to create the read-only role and share the schema guide.
- Ines to send a list of the columns she needs.
- Tomas to introduce Ines to Hannah Voss.

##### Other

- Priya's talk on 25 April went well; the hybrid results got the most
  questions. Tomas wants the slides shared with the team.

## Related

- [[tidewater-dashboard|Tidewater]] — the project most of this month's work belongs to.
- [[driftwood-capacity-forecast|Driftwood]] — introduced on 28 April.
- [[sparse-hybrid-retrieval-paper|the retrieval paper]] — submitted on 2 April.
- [[journal-2026-03|journal March 2026]] — the month before this one.
- [[bird-box-camera|the bird box camera]] — the idea that formed on 16 April.
