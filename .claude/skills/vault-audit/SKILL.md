---
name: vault-audit
description: The vault's health check — self-test, build and audit.js — reported in a few lines: problems, watch items and query cost against the 30–50× target, then which to fix. Cheap: the tools' output stays in a file, not the conversation. For the expensive checks (anything answerable only from raw/, a gap audit by agents) use /vault-deep-audit.
disable-model-invocation: true
---

# Audit the vault

The owner typed `/vault-audit`, so running the audit is authorised for this run
(`AGENTS.md` § Compile and Audit, D78). Keep it cheap: the tools' output goes
into a file, and only the summary enters the conversation.

## 1. Run the tools

```sh
OUT="$(node -p "require('os').tmpdir()")/vault-audit-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"
node tools/selftest.js    > "$OUT/selftest.txt" 2>&1; echo "selftest exit $?"
node tools/build-index.js > "$OUT/build.txt"    2>&1; echo "build exit $?"
node tools/audit.js       > "$OUT/audit.txt"    2>&1; echo "audit exit $?"
```

Order matters: the build regenerates the index files the audit reads.

## 2. Read only what the report needs

```sh
tail -2 "$OUT/selftest.txt"
sed -n '/^\(WARNINGS\|PROBLEMS\)/,$p' "$OUT/build.txt"
grep "cheaper than loading sources" "$OUT/audit.txt"
sed -n '/^VERDICT/,$p' "$OUT/audit.txt"
```

If a list runs long, grep the file for that one check instead of printing more.

## 3. Report

Always this shape:

```
Vault audit — YYYY-MM-DD
Self-test N/N · build clean (or N problems) · audit N problems, N watch items
Query cost: median N× (A–B×), target 30–50×

Problems
1. <what is wrong, in plain words> (Dnn) — <count>: <up to 5 items, then "+N more">

Watch
- <one line each; say which look like real defects>

Which should I fix — numbers, "all", or "none"?
```

No problems and no watch items: say so in one line and skip the question.
Always say where the full output is.

## 4. Fix what they pick

Every fix follows `AGENTS.md` § Defect Discipline: fix the instance, find the
root cause, prevent the class, ledger it. Rebuild after content fixes; run the
self-test after tooling fixes. To confirm the fixes, re-run the three commands
into the same folder and report the one-line verdict.

## What the tools cover

`audit.js` covers: index consistency both directions · the alias probe against
`tools/probes.json`, plus **must-route** terms that have to reach a specific
node and US-spelling probes that must genuinely test spelling · graph shape
(orphans, dead ends) · counts by kind and topic · answer-surface distribution ·
frontmatter drift · **query cost** — it replays the benchmark queries through
the L0→L1 protocol and reports the ratio against the fixed source baseline, so
the prime directive is measured on every audit rather than asserted ·
code identifiers only a log names, or named widely with no alias · compiled
documents with no verbatim node · captures waiting in `raw/` · tag facets named
like a probe term · open statuses gone stale ·
gendered pronouns that were never stated · media · drawing transcriptions older
than their drawing, drawings no note embeds, and embedded drawings whose
layout lints with errors (D75). The builder, for its part, also
fails corrected claims creeping back and fences whose own examples fail,
`[sic]` notes that pick a side, people named without a link, drifted Obsidian
settings (and warns on folders without an icon), faceted-tag drift, secrets in
plugin settings, rewritten log entries and verbatim text, notes outside the
indexed folders, code blocks that pull their code from another file, drawing embeds that are missing,
unreadable or carry no `drawing-hash`, and claims attributed to NotebookLM
outside a log or a verbatim node. Routing probes use a literal, line-based
`grep -i` — exactly the L0 query — so a term only a forgiving matcher could
find does not pass. It exits non-zero on any problem.

## Not this skill

The checks the tools cannot make — whether anything is answerable only from
`raw/`, judgement on each watch item, a gap audit, the scope of any coverage
claim — are `/vault-deep-audit`'s.
