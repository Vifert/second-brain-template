# tools/

The vault's maintenance tooling. **This is not disposable** — `CLAUDE.md` says
one-off scripts belong in the session scratchpad, and that rule still holds for
migrations, but these files are the mechanism the operating manual depends on.
They live here, in git, deliberately.

## Why they are versioned

Until 2026-09-09 the index builder lived only in a session-scoped temp
directory (D11). That meant:

- the **validator CLAUDE.md mandates on every capture** vanished at session end;
- each new session reconstructed it from prose, so the logic could drift;
- the audit probe was never a file at all, only inline throwaway code — which is
  how a probe shipped that lowercased the index but not the query, and reported
  four phantom "unroutable" terms (D10).

The wiki itself stays readable with no tooling at all: it is markdown plus five
TSV files. Tooling is only needed to *maintain* the index — so it is kept, and
kept tested.

## The files

| File | Purpose |
| --- | --- |
| `build-index.js` | Builds `_index.tsv`, `_cards.tsv`, `_sections.tsv`, `_links.tsv`, `_mentions.tsv`, the generated **Now** page (`wiki/profile/now.md`), every topic `_index.md` and `_master-index.md`. **It is also the validator** — frontmatter, folder structure, answer-surface caps, kind-aware body caps, `## Key Takeaways` position, links and heading anchors, status logs, media (including images that landed outside `wiki/`), control bytes, takeaways that open with a pronoun, summaries over 200 characters, relative aliases typed into a log, verbatim nodes with no `source:`, tags that break the faceted scheme (D65), secrets in committed Obsidian plugin settings (D66), committed log entries or verbatim text rewritten since the last commit (D67 — `VAULT_ALLOW_REWRITE=<path>` lets a deliberate fix through for one run), notes outside the indexed folders and Code Styler reference blocks (D68), and drawing embeds whose drawing is missing or unreadable, that carry no `drawing-hash`, or that sit in Key Takeaways (D72). It also runs the write-level checks from `lib/writechecks.js` — corrected claims creeping back and fences that fail their own examples (D37, D50), verbatim `[sic]` notes that pick a side (D51), people named without a link (D58) — and the Obsidian settings the rules depend on (D69, D71), because the audit runs only when the owner asks (D78). It warns while captures wait in `raw/`, on folders without an Iconize icon, and when a drawing has changed since its transcription. It also generates the index-only extras: US/UK spellings, hyphen-free forms, code identifiers, and "this month"-style aliases for the newest log of each series. Exits non-zero on any problem. |
| `audit.js` | The heuristics `/vault-audit` runs, only when the owner asks (D78): index consistency, alias probe, must-route terms, spelling probes, code identifiers only a log names, compiled documents with no verbatim node, captures waiting in `raw/`, tag facets named like a probe term, drawing transcriptions older than their drawing and drawings no note embeds, graph shape, size health, frontmatter drift, query cost, stale statuses, pronouns, media. Routing probes use `grepI()`, a literal line-based `grep -i`. Exits non-zero on any problem. |
| `install-excalidraw.js` | Installs the Excalidraw plugin at a pinned release, SHA-256 verified, keeping the shipped settings; `--check` reports what is installed |
| `scan-private.js` | Personal-data scan for the public repo: emails, absolute user paths, UUIDs, long digit runs — patterns, never names. `--against <source vault>` also fails on any distinctive term from the vault a template was made from (people, identifiers, figures, titles, a client's tag facet), read from its index at run time. A line carrying `scan-private: allow` is a deliberate fixture |
| `bench.js`, `lib/bench.js` | Scores a compiled benchmark vault — cost, routing, fidelity, forbidden values, graph health — deterministically, without an LLM; `--prepare <dir>` sets up a copy for a benchmark compile (see `bench/README.md`) |
| `probes.json` | The probe corpus: routing terms, `_must_route` (term → nodes it must reach), `_forbidden` (corrected claims that must never return, each with `catches` and `passes` examples), `_benchmark` (cost queries), `us_spelling`. **Data, not code — grow it.** |
| `excalidraw.js` | Creates, patches, inspects, lints, transcribes and renders Excalidraw drawings — the engine of the `vault-excalidraw` skill (`.claude/skills/vault-excalidraw/`). Rendering and text measurement run the Excalidraw build bundled in the Obsidian plugin, in a headless Chromium browser with the network blocked — every installed browser is tried in turn, and `check` names the one that answered (D77). `save` brings a live-canvas scene back without losing a drawing's links or embedded files. |
| `selftest.js` | Regression tests for the tooling itself, including the check that `DEFECTS.md` only claims guards that exist. |
| `DEFECTS.md` | **The defect ledger** — every defect, its root cause, fix and guard. |
| `lib/text.js` | The single normaliser — comparisons go through `matches()` — plus `grepI()` (what the L0 query really does), `spellingVariants()` and `hyphenVariants()` for routing, and `fenceProblems()`, which replays a fence's examples. |
| `lib/vault.js` | Pure helpers shared by all three tools: frontmatter (every YAML list form), CommonMark fences and code spans, links, anchors and media, the one takeaways parser, status logs and real-date checks, volatile markers, mention finding, the pronoun heuristic, the transcription check, the `[sic]` side-taking check, `codeIdentifiers()`, `openingPronoun()`, and the Obsidian-era checks: `tagProblems()`, `nearDuplicateTags()`, `inlineTags()`, `secretSettings()`, `rewrittenLines()`, `strayNote()`, `settingDrift()`, `iconlessFolders()` and `referenceBlocks()`. |
| `lib/writechecks.js` | The checks a single write can break, run by every build (D78): `forbiddenClaims()`, `fenceExampleIssues()`, `sidedSic()`, `unlinkedPeople()`. |
| `hooks/`, `lib/hooks.js` | Claude Code hooks, registered in `.claude/settings.json`: `stop-rebuild.js` (Stop) rebuilds a stale index at the end of a turn and keeps Claude working on any problem (D87); `post-write-check.js` (after Write or Edit) refuses a `.md` with CRLF or control bytes (D76, D03); `pre-bash-guard.js` (before Bash) blocks Python `write_text` and bash that would execute backticks (D76, D13). The checks are pure functions in `lib/hooks.js`, unit-tested by the self-test |
| `graph-colours.js`, `lib/graphcolours.js` | Assigns each folder its colour in Obsidian's graph and writes the colour groups to `.obsidian/graph.json` (the tool owns the list), and the tag and attachment node colours through Style Settings (`GRAPH.themeNodes`): every colour at least `GRAPH.minContrast` against the theme background in `rules.js`, every pair at least `GRAPH.minDeltaE` apart (CIEDE2000), the most interlinked folders farthest apart, existing colours kept. `--dry` prints without writing. The build warns on a missing, stale or failing group (D86) |
| `lib/excalidraw.js` | The plugin's `.excalidraw.md` format read and written section by section (compressed or plain, LF or CRLF), `sceneHash()` for drawing transcriptions (D72), `describe()`, `lint()`, `transcribe()` and the connector geometry. Loads in node and in the render page. |
| `lib/rules.js` | **The only copy of the vault's rules** — and of whose vault it is: `OWNER` (name, stated pronouns, own person node, identity node), read by the pronoun check, the people timeline, the Now page and the master index. Then caps, body caps by kind, near-cap margin, cost target, source baseline, allowed subfolders, media rules, statuses, volatile markers, the registered tag facets and synonyms, secret-setting patterns, where notes may live, and the Obsidian settings the rules depend on. |

## What each tool guarantees

- **`build-index.js`** writes today's date (local time) into generated files,
  but **only when their content changed**, so rebuilds do not churn git. It
  resolves the vault from its own location, so a clone anywhere works. It
  appends US/UK spelling variants to each row's aliases in `_index.tsv` only.
  It warns — without failing — on aliases lost since the last commit (the
  Obsidian trap), orphans and dead ends.
- **Now is generated, never edited.** It lists every node with a
  `## Status Log` and an open `status`, taking the latest row. The builder fails
  an owner whose `**Status` takeaway does not carry that row's date, and any
  status marker ("not started", "still pending") outside an owner, a log or a
  verbatim node.
- **Images**: every file in `<topic>/assets/` must be named
  `<owner-slug>--<desc>.png|jpg`, embedded by some node, and sit in a section
  with at least 200 characters of transcription.
- **`audit.js`** replays `_benchmark` queries through the L0 → L1 protocol and
  reports the cost ratio against `BASELINE_BYTES`. That baseline is fixed in
  `lib/rules.js` on purpose: `raw/_compiled/` is disposable, so the benchmark
  must not depend on it.
- **`selftest.js`** fails if any tool hand-rolls one-sided case
  comparison, re-declares a rule or falls back to a numeric cap, contains a
  date literal or an absolute vault path; if any markdown file in the repo
  holds a control byte; if any parser regresses; or if `DEFECTS.md` names a
  guard whose code — comments stripped — does not cite the defect's ID. Test
  names carry their IDs for exactly that reason. Run it for the live count.

## Running them

```sh
node tools/selftest.js      # tooling is sound
node tools/build-index.js   # rebuild + validate  (run after ANY content change)
node tools/audit.js         # full audit — only through /vault-audit
```

Order matters: `build-index.js` regenerates the TSVs that `audit.js` reads, so a
stale index would make the audit report nonsense.

## When you find a defect

Follow `CLAUDE.md` § Defect Discipline: fix it, find the root cause, add the
cheapest guard that stops the class, then append a row to `DEFECTS.md` and cite
its ID in the guard's code. `selftest.js` holds the two in step.

## When a lookup routes badly in real use

Add the term to `probes.json` — to `_must_route` if it reached the wrong node.
That is the whole maintenance loop: the corpus accumulates, so a routing failure
found once can never silently return.
