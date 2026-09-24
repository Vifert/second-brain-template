# Tidewater: why Postgres, not DynamoDB

*A one-page note for the platform team, written after the kickoff on 10 March
2026. Mira Okafor.*

## The question

The platform team's default for new services is DynamoDB. Tidewater is going
to use Postgres instead. This note says why, so the choice can be checked
against what the dashboard actually does, and revisited if that changes.

## What Tidewater does

- Loads shipments from the carrier API and invoices from finance's nightly CSV
  drop, once a night.
- Answers about fifteen people on the ops floor, who filter by carrier, region,
  customer, week and status, in combinations nobody can list in advance.
- Every page joins shipments to invoices through the order number, and most
  join the carrier table as well.

## The case for Postgres

1. **The dashboard needs joins.** Shipments, invoices and carriers are three
   tables that every useful question crosses. In DynamoDB each join becomes
   either a denormalised copy that must be kept in step, or several reads
   stitched together in code.
2. **The questions are ad-hoc filters.** DynamoDB is fast for access patterns
   designed in advance, one index per pattern. The ops team's filters change
   every week; a relational model answers a new filter with a new `WHERE`
   clause, not a new index and a backfill.
3. **The data is small.** Two years of shipments and invoices is a few million
   rows. One modest Postgres instance holds it with room to spare.
4. **The team knows SQL.** Sam Achebe writes the KPI queries himself. With
   DynamoDB, every new KPI would go through an engineer.

## The case for DynamoDB, and why it does not decide it

- **Scaling without thought.** True, but Tidewater's load is a few hundred
  queries on a busy morning.
- **No server to patch.** The platform team already runs managed Postgres for
  two other services, so this is not new work.
- **The platform default.** Defaults exist to save a decision; here the
  decision is cheap to make and expensive to get wrong.

## What would change the answer

- If Tidewater became a service other systems call thousands of times a
  second, with fixed access patterns, a key-value store would fit better.
- If the ops team wanted events as they happen rather than on a schedule, the
  ingestion would change before the database did.

## Costs and risks

- One more Postgres instance on the platform team's list.
- Slow queries over the full history. Mitigation: indexes on the join and
  filter columns, checked with the query plan as pages are built.
- Other teams reading the tables directly. Mitigation: a read-only role and a
  schema guide, so nobody writes to Tidewater's tables but Tidewater.

## Decision

Postgres, for the joins and the ad-hoc filters. Agreed at the kickoff by
Mira Okafor, Tomas Lind and Sam Achebe; sent to the platform team the same
week.
