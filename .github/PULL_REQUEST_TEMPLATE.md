## Summary

<!-- One or two lines: what changes, and why. Link the issue it closes. -->

## Type

- [ ] Fix
- [ ] Docs
- [ ] Method improvement (link the Improvement Proposal)

## Checklist

- [ ] `node tools/selftest.js` — all green
- [ ] `node tools/build-index.js` — `PROBLEMS: none`, and the committed index is current
- [ ] `node tools/audit.js` — no problems
- [ ] `node tools/scan-private.js` — clean
- [ ] A new rule has a guard and a `tools/DEFECTS.md` row, its ID cited in the guard's code
- [ ] A method change includes the recompiled bench and its scorecard delta
- [ ] No personal data

## Scorecard delta

<!-- For a method improvement: paste `node tools/bench.js --against bench/results/history/<last release>.json`. -->
