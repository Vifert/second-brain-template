---
title: Journal — March 2026
summary: Dated record for March 2026 — Tidewater's kickoff, the Postgres choice, Airflow and the two-year backfill, the paper draft, the allotment and a 1:1.
aliases: [March 2026, journal March 2026, March 2026 journal, what did I do in March, what happened in March 2026, 2026-03]
topic: journal
kind: log
tags: []
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Tidewater was kicked off on 10 March 2026** with the storage choice, the definition of "late" and a 30 April deadline all settled in the room.
- **The Tidewater ingestion moved from cron to Airflow on 20 March 2026** as `tidewater_ingest_daily`, running at 02:00 with two retries twenty minutes apart.
- **Two years of Tidewater history were backfilled on 26 March 2026** in just under four hours, exposing a carrier clock bug in about 3% of shipments.
- **The retrieval paper's draft arrived from Priya Raman on 9 March 2026**, with a results table whose rows were in the wrong order and two columns both labelled "R@20".
- **The 1:1 with Tomas Lind on 26 March 2026** set the goal of leading a project's design from the start, and parked the AWS data engineering exam.
- **The allotment year started in March 2026**: the rent paid, the bean bed dug over, potatoes chitting, and a neighbour's watering lesson that became the soil-sensor idea.

### 2026-03-02 (2-Mar-26)

#### Work

- Kicked off the Tidewater dashboard with Tomas Lind. It pulls shipments and
  invoices into one view for the ops team; first proper meeting is next week.
- Read through the old ops spreadsheet to see what people actually look at.
  Mostly late shipments and unpaid invoices.
- The spreadsheet has 23 tabs. Only four are used: "Late", "Unpaid",
  "Carriers" and one called "Hannah's view" which turns out to be the only one
  the ops lead trusts. Hannah Voss runs the ops floor; worth talking to her
  before the kickoff rather than after.
- Invoices come from the finance system as a nightly CSV drop, shipments from
  the carrier API. Neither has a shared key — the join will have to go through
  the order number, which finance stores with a prefix and the carriers don't.
- Standup was short. Ines is still on the warehouse capacity numbers and
  wants to borrow whatever Tidewater ends up storing, so keep the tables
  readable by people who aren't me.

#### Life

- Gym: a 5 km run in 27:40. Legs heavy after the weekend.
- Started planning what to grow on the allotment this year.
- Allotment list so far: broad beans, two rows of potatoes, courgettes (too
  many last year — cap it at three plants), and another go at carrots in the
  raised bed where the soil is lighter.
- Finished *The Salt Road* on the train home. Good ending, slow middle. Next up
  is the data book everyone at work keeps quoting.
- Mum rang; she's visiting at Easter. Need to clear the spare room.

#### To do

- [ ] Ask Hannah for twenty minutes before the kickoff.
- [ ] Get read access to the carrier API sandbox.
- [ ] Find out who owns finance's CSV drop and whether it has a schema
      anywhere written down.
- [ ] Order seed potatoes before the garden centre runs out of the waxy ones.
- [x] Renew the allotment rent (£38 for the year, paid online).

#### Thoughts

Starting a project from nothing is the part I like best and do worst. Last time
(the carrier scorecard at Quayside) I built for three weeks before asking anyone
what they wanted, and rebuilt half of it. This time: talk to Hannah first, write
decisions down as they happen, and keep a note of why, not just what. If this
works I should be able to answer "why did we do X?" in six months without
digging through chat history.

### 2026-03-09 (9-Mar-26)

#### Work

- Priya Raman sent the draft of our retrieval paper. Section 4 needs the
  results table tidied before Tomas reads it.
- Spent the afternoon on Tidewater data models — shipments have three date
  columns and nobody agrees which one is "the" date.
- The three dates: `dispatched_at` (carrier scan at the depot), `promised_at`
  (what sales told the customer) and `delivered_at`. "Late" in Hannah's view
  means delivered after promised; finance means invoiced after delivered.
  Writing both definitions down for tomorrow's kickoff so we pick one on
  purpose.
- Draft data model: `shipment`, `invoice`, `carrier`, and a thin
  `order_ref` table to hold the prefixed and unprefixed order numbers side by
  side. Postgres is the obvious fit if the joins stay this central; Tomas
  mentioned the platform team has been nudging everyone towards DynamoDB, so
  expect that argument.
- Paper: the table has BM25, dense and hybrid in the wrong order and two
  columns labelled "R@20". One of them is actually nDCG. Flagged to Priya.

#### Life

- Reading *Designing Data-Intensive Applications*, chapter 3 — storage and
  retrieval. The LSM-tree section finally clicked.
- Notes to self on it: writes go to an in-memory table, get flushed as sorted
  files, and the sorted files are merged in the background. Reads check the
  memory table first, then the files newest to oldest. Bloom filters skip the
  files that can't hold the key.
- Cooked jollof for the first time in ages. Too much pepper; still ate two
  bowls.

#### Notes on the paper draft

- Priya's framing is good: personal notes are short, private and untitled, so
  web retrieval results may not carry over. The introduction says it in two
  paragraphs; I'd cut the second.
- The data section is thin. It should say who the volunteers were, how long the
  notes are, and how the queries were written, or a reviewer will ask.
- Section 4 table fixes: order the rows BM25, dense, hybrid; one metric per
  column; say the collection size in the caption.
- My part is the related work on lifelogging and desktop search, due before
  submission on 3 April.

#### Evening

Rang Dayo. She's turning thirty at the end of April and wants everyone in
London for it. Said yes before checking the calendar, which is how I end up
double-booked.

### 2026-03-10 (10-Mar-26)

#### Tidewater kickoff — meeting record

**Attendees:** Mira Okafor, Tomas Lind (my manager), Sam Achebe (analyst),
Hannah Voss (ops lead, first half only)

##### Context

Tidewater is an internal dashboard for Harbor Analytics' operations team,
combining shipments and invoices so late deliveries and unpaid invoices can be
seen in one place.

Today the ops team works from a 23-tab spreadsheet that one person updates by
hand every Monday. By Thursday it is out of date, and nobody is sure whether a
shipment marked late was delivered late or invoiced late.

##### Discussion

- **What "late" means.** Hannah: late is delivered after the date promised to
  the customer (`promised_at`). Finance's meaning (invoiced after delivery) is
  a separate KPI, "slow invoicing", not "late".
- **Where the data comes from.** Shipments from the carrier API, invoices from
  finance's nightly CSV drop. The order number is the only shared key, and
  finance prefixes it; a mapping table handles both forms.
- **Storage.** The platform team's default is DynamoDB. Tomas asked for the
  case for anything else to be written down, not just argued in the room.
- **Who uses it.** About fifteen people on the ops floor, mostly in the
  morning, mostly filtering by carrier, region and week.

##### Decisions

- **Postgres over DynamoDB**, because the dashboard needs joins across
  shipments and invoices, and most questions are ad-hoc filters that a
  relational model answers directly.
- Ingestion runs nightly to start with.
- "Late" means delivered after `promised_at` (Hannah's definition).

##### Deadline

- First version live by **30 April**.

##### Actions

- Sam to define **12 KPIs** with the ops team.
- Mira to build the ingestion and the data model.
- Tomas to book a review with the ops lead for mid-April.
- Mira to write the one-page Postgres-versus-DynamoDB note for the platform
  team.

##### Hannah's wish list, as she said it

1. "Which shipments are late right now, and whose fault is it?"
2. "Which customers owe us the most, and for how long?"
3. "Which carrier should I shout at this week?"
4. "Stop me having to update the spreadsheet on Mondays."

Everything else she mentioned was a variation of those four. Sam will turn them
into the first KPIs.

##### Risks

- The order-number join may not be clean; if a large share of shipments cannot
  be matched to invoices, the unpaid-invoice views are wrong.
- Finance's CSV arrives late some nights.
- The ops team may ask for more KPIs once they see the first ones.

##### Open questions

- Does finance ever reissue an invoice under a new number? (Sam to ask.)
- How far back does the ops team need history — one year or two?

### 2026-03-16 (16-Mar-26)

#### Work

- First week building Tidewater properly. The carrier API pages at 200
  shipments and rate-limits us after about 40 calls a minute, so the loader
  now sleeps between pages. It needs a real limiter rather than a sleep —
  saved a clipping on token buckets to read later.
- Finance's CSV drop arrives any time between 23:00 and 01:30. Anything that
  runs before 02:00 risks reading yesterday's file.
- Sam Achebe came by with a first list of KPIs from the ops team — eleven so
  far, one short of the twelve we agreed. "On-time delivery rate" and "late
  shipments this week" look like the same thing measured twice.
- Priya wants the paper's related-work section longer before we submit. I said
  I'd write the paragraph on lifelogging.

#### Life

- Long run on Sunday: 10 km in 58:12. Knees fine, lungs not.
- Allotment: dug over the bean bed. Sam Whitlock, who has the plot next to
  mine, lent me his fork after mine snapped at the handle. He's been there
  thirty years and has opinions about everything, including my potatoes.
- Booked the train to London for the end of April — Dayo's birthday.

#### Notes

- The carrier API's limit isn't documented; I found it by being blocked. About
  40 calls a minute, then a minute of errors. A limiter that stays just under
  that would load the full day in about eight minutes.
- Sam's KPI list, as it stands: on-time delivery rate, late shipments this
  week, average days late, shipments by carrier, unpaid invoices over 30 days,
  unpaid value by customer, slow invoicing, disputed invoices, carrier
  scorecard, deliveries per region, returns. Eleven.
- Hannah wants the list grouped by who acts on it — carriers, finance, the
  floor — rather than alphabetically. Good idea; told Sam.

#### Tomorrow

- Real limiter for the carrier loader.
- Ask finance whether the CSV drop can arrive by a fixed time.

### 2026-03-20 (20-Mar-26)

#### Work

- Moved the Tidewater ingestion from cron to Airflow. The job is
  `tidewater_ingest_daily`; it runs at 02:00 and retries twice.
- Wrote a short runbook for it in the team wiki.
- Why 02:00: finance's CSV can land as late as 01:30 (see Monday), and the
  carrier API is quietest before the morning shift. Retries are 20 minutes
  apart, so a late file still gets picked up on the second try.
- The old cron job stays disabled, not deleted, for two weeks in case we need
  to fall back. Calendar reminder set to remove it on 3 April.
- Ines asked whether her capacity work could read from the Tidewater tables
  directly. Fine by me once the schema settles; told her to wait for the
  status meeting.

#### Life

- Took the train to York for the afternoon. Walked the walls, ate far too much
  at the market.
- Bought a secondhand copy of a book on soil science at the Shambles market for
  £4. Probably won't read it. Probably will read the chapter on moisture.
- Train home was delayed forty minutes; finished two more chapters of the data
  book, on encoding and on replication.

#### Runbook, short version

For the team wiki, and for me at 3 a.m.:

1. The job fails loudly: the Airflow task goes red and posts to the team
   channel.
2. If the finance file is missing, wait for the second retry; if it is still
   missing, ask finance, then clear the task to rerun it.
3. If the carrier API is refusing calls, the limiter has probably been set too
   high. Check the last hour of logs for rate-limit errors.
4. Never edit the tables by hand to "fix" a day. Rerun the day instead — every
   load replaces the whole day, so a rerun is safe.

#### Notes

The carrier loader now uses a token bucket — capacity 5, refilling at 0.6 a
second, so it bursts a little and then settles just under the API's limit.
The eight-minute load now takes nine, with no errors.

### 2026-03-26 (26-Mar-26)

#### Work

- Backfilled two years of Tidewater history through Airflow — a one-off DAG,
  `tidewater_backfill_once`, run by hand, not scheduled. Took just under four
  hours. The daily job is untouched.
- The history exposed a mess in the carrier data: about 3% of shipments have a
  `delivered_at` before their `dispatched_at`. Carrier clock bug, apparently.
  Keeping the rows, flagging them, and excluding them from "late" until the
  carrier answers.
- 1:1 with Tomas. Mostly about the paper and about what I want to be doing in a
  year (notes in the 1:1 file).

#### Life

- Allotment after work. Sam Whitlock showed me how he waters — a finger in the
  soil up to the second knuckle, and if it's dry there, water. He laughed at
  the idea of a sensor. I'm going to build one anyway.
- Potatoes chitting on the windowsill. The cat has knocked one off twice.
- Ordered new running shoes; the old pair has done about 800 km.

#### Backfill notes

- Loaded day by day, oldest first, so that a failure part-way leaves a clean
  prefix of history rather than holes.
- 730 days, 3 of them failed on a carrier API timeout and went through on a
  rerun.
- Row counts roughly: 2.1 million shipments, 1.6 million invoices. The invoice
  count is lower because finance invoices some customers monthly, not per
  shipment.
- The carrier clock bug is in one carrier's data only, between last June and
  January. Emailed them with twenty examples.

#### Thoughts after the 1:1

Tomas said the thing I needed to hear: leading a project from the start is
mostly writing things down early and letting people disagree with the written
version. The Postgres note did that. Do the same for the refresh schedule
before somebody asks for "live" numbers.

#### 1:1 with Tomas — meeting record

**Attendees:** Mira Okafor, Tomas Lind

##### Tidewater

- On track. Tomas is happy the Postgres note went to the platform team before
  anyone asked for it; they have not pushed back.
- He wants Tidewater's tables documented well enough that Ines Duarte's
  capacity forecast can build on them without me in the room.

##### The paper

- Tomas has read the draft. He wants the dataset described more carefully —
  the abstract and the results table do not say the same number of notes, and
  a reviewer will notice. Priya owns the fix.
- Submission deadline for the workshop is 3 April. Camera-ready due in May if
  accepted.

##### Growth

- I said I want to lead the design of a project from the start, not only build
  it. Tomas: Tidewater is that, if I keep writing the decisions down.
- Certifications: I have the dbt one. Tomas suggested the AWS data engineering
  exam; I'm not convinced it's worth it while we run on Postgres. Parked — not
  booked, not studying for it.
- Conference budget: one this year. Probably the autumn data engineering
  conference in Manchester.

##### Team

- Sam Achebe is doing well on the KPI work; Tomas wants him to present the KPI
  list at the ops review himself rather than me presenting it for him.
- Ines Duarte, on the data science side, wants her warehouse capacity forecast
  to be the first thing built on Tidewater that isn't Tidewater.
- Hiring: one more data engineer approved for the second half of the year.
  Tomas asked me to sit on the interview panel.

##### Feedback

- Tomas, to me: the written decisions are the best thing about how Tidewater is
  run. Keep the notes short and dated.
- Tomas, to me: I say yes to side requests too quickly. Ines's request to read
  the tables can wait until they have settled.
- Me, to Tomas: the platform team's DynamoDB default caught me off guard at the
  kickoff. Could he warn me earlier next time? He agreed.

##### Actions

- Mira to write a short schema guide for the Tidewater tables.
- Mira to read the interview pack before the first panel.
- Tomas to check whether the conference budget covers travel.

## Related

- [[tidewater-dashboard|Tidewater]] — the project most of this month's work belongs to.
- [[sparse-hybrid-retrieval-paper|the retrieval paper]] — the draft and its table problems.
- [[journal-2026-04|journal April 2026]] — the month after this one.
- [[allotment-soil-sensor|the allotment soil sensor]] — the idea that came out of 26 March.
- [[dayo|Dayo]] — whose thirtieth birthday the 9 March call was about.
