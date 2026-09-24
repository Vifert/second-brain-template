# Tidewater kickoff — 10 March 2026

**Attendees:** Mira Okafor, Tomas Lind (my manager), Sam Achebe (analyst),
Hannah Voss (ops lead, first half only)

## Context

Tidewater is an internal dashboard for Harbor Analytics' operations team,
combining shipments and invoices so late deliveries and unpaid invoices can be
seen in one place.

Today the ops team works from a 23-tab spreadsheet that one person updates by
hand every Monday. By Thursday it is out of date, and nobody is sure whether a
shipment marked late was delivered late or invoiced late.

## Discussion

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

## Decisions

- **Postgres over DynamoDB**, because the dashboard needs joins across
  shipments and invoices, and most questions are ad-hoc filters that a
  relational model answers directly.
- Ingestion runs nightly to start with.
- "Late" means delivered after `promised_at` (Hannah's definition).

## Deadline

- First version live by **30 April**.

## Actions

- Sam to define **12 KPIs** with the ops team.
- Mira to build the ingestion and the data model.
- Tomas to book a review with the ops lead for mid-April.
- Mira to write the one-page Postgres-versus-DynamoDB note for the platform
  team.

## Hannah's wish list, as she said it

1. "Which shipments are late right now, and whose fault is it?"
2. "Which customers owe us the most, and for how long?"
3. "Which carrier should I shout at this week?"
4. "Stop me having to update the spreadsheet on Mondays."

Everything else she mentioned was a variation of those four. Sam will turn them
into the first KPIs.

## Risks

- The order-number join may not be clean; if a large share of shipments cannot
  be matched to invoices, the unpaid-invoice views are wrong.
- Finance's CSV arrives late some nights.
- The ops team may ask for more KPIs once they see the first ones.

## Open questions

- Does finance ever reissue an invoice under a new number? (Sam to ask.)
- How far back does the ops team need history — one year or two?
