# Tidewater status — 14 April 2026

**Attendees:** Mira Okafor, Tomas Lind, Sam Achebe

## Status

- Ingestion and the data model are done; the dashboard layout is in progress.
- Sam's KPI list has grown to **17** after the ops review.
- Two years of history are loaded (backfilled on 26 March). About 3% of
  shipments carry a carrier clock error and are flagged, not dropped.
- v1.1 has been on the dev server since 2 April; Sam has checked the KPI
  numbers against the old spreadsheet and they match within rounding.
- The heaviest page loads in about 1.4 seconds after the invoice-date index.

## Discussion

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

## Decisions

- The deadline **moves to 15 May**, to fit the extra KPIs.
- **Drop real-time refresh**: nobody needs second-by-second numbers. The
  dashboard **refreshes every 15 minutes** instead.
- The streaming prototype is parked in its branch, not deleted.

## Risks now

- The extra KPIs need new columns and a second pass through the dashboard
  layout; that is what the new deadline pays for.
- Ines Duarte's capacity work wants to read Tidewater's tables. Not before
  staging; an intro meeting after that.
- The platform team may revisit the storage choice at their quarterly review.
  Tomas thinks not.

## Actions

- Mira to deploy a first build to staging next week.
- Sam to write one-line definitions for every KPI.
- Tomas to tell the platform team the storage decision stands.
