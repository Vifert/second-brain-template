# Vault Operating Manual — {{OWNER_NAME}}'s Second Brain

> **Second-brain architecture and workflow designed and built by Vifert.**
> The capped answer surface over an uncapped body, the five-file index layer
> and the query ladder, the kind tiers, the compile and verification protocol,
> the defect discipline with its ninety-three mechanically guarded defects,
> the tooling that enforces it, the drawing and NotebookLM workflows, and every
> rule in this manual are his work, shared so this vault could start where his
> left off.
> **Keep this credit at the top of this file.** Edit anything else as the vault
> grows — not this.

<!-- template-only: setup removes this block -->
> **Working on the template repository itself, not in a vault?** This file is
> the product — the manual a vault's owner runs their vault by — so do not
> follow it as your brief. Yours is [`docs/for-ai-agents.md`](docs/for-ai-agents.md).
<!-- /template-only -->

## Start Here — Read HANDOFF.md First

- **This file is the manual for every coding agent.** Codex, Cursor, Copilot
  and others read `AGENTS.md`; Claude Code reads `CLAUDE.md`, which imports
  this file whole. There is one copy: edit this one.
- **Before doing anything else in a new session, read HANDOFF.md** in this same
  folder. A coding agent carries no memory between sessions, so HANDOFF.md is the
  memory: what exists, what was decided and why, which contradictions were
  deliberately left flagged, and what is still open.
- Read order every session: this file (the rules), then HANDOFF.md (the state).
  Do **not** read `wiki/_master-index.md` as a warm-up — it is not needed until
  there is an actual question. See Query Protocol.
- HANDOFF.md is authoritative on session history and decisions. If it disagrees
  with an assumption you are about to make, HANDOFF.md wins — or ask me.
- I am {{OWNER_NAME}}. When these rules say "I" or "me", that is who they mean.
- **Whose config is whose**: my name and pronouns live in `OWNER` in
  `tools/lib/rules.js`, the topics in `tools/build-index.js`, the tag facets in
  `tools/lib/rules.js`, and the routing probes in `tools/probes.json`. Change
  them there, then rebuild.

## Rules That Load By Path

Some rules live in `.claude/rules/`. Claude Code loads each only when a file its
`paths:` match is read; other agents load none of them on their own. Either
way: before writing where one applies, read it if it has not loaded this
session. Each is backed by the builder, so a slip fails the build.

| File | Loads for | Holds |
| --- | --- | --- |
| `.claude/rules/wiki-writing.md` | `wiki/**` | node kinds, folders, tags, frontmatter, article shape, naming, linking, people, log and idea mechanics, the guarded write-side rules |
| `.claude/rules/images-drawings.md` | `wiki/**/assets/**`, `Excalidraw/**` | images, figures and drawings, and how drawings render |
| `.claude/rules/obsidian.md` | `.obsidian/**`, `templates/**` | the Obsidian skills and plugins, and the versioned setup |
| `.claude/rules/tooling.md` | `tools/**`, `.claude/**` | the tools, the hooks that enforce three traps, the layer every other agent reads, Windows file locks |

## Skills

- `vault-excalidraw` — any drawing request — and `vault-tailor` — fitting the
  vault to my needs: new skills, subagents and rules, after an interview in
  rounds; run once at setup, and whenever I ask — the vault skills the agent
  may start itself.
- `/vault-compile`, `/vault-audit`, `/vault-deep-audit`, `/vault-handoff` —
  {{OWNER_NAME}}'s to start (§ Compile and Audit, § Session Handoff).
- Skills, agents and hooks are written once, in `.claude/`; the copies other
  agents read are generated (`.claude/rules/tooling.md` § Every Agent). A skill
  starts with `/name` in Claude Code, `$name` in Codex.
- `defuddle` for any URL, before a plain fetch — the `/obsidian:defuddle`
  skill in Claude Code, the `defuddle` CLI elsewhere. The Obsidian CLI is
  deliberately not used; the other Obsidian skills are in
  `.claude/rules/obsidian.md`. Invoke the one skill that fits, not several.

## What This Vault Is For

This is my second brain for **everything**, not just a lookup table:

1. **Retrieval** — answer questions about my work, people, research and life.
2. **Idea dump** — somewhere to put things I might build or pursue.
3. **Daily updates** — a running record of what happened, work and otherwise.
4. **Working together** — the shared context we build on for projects and ideas.

All four are captured *into* the same graph and read *out of* the same index.
Capture may be as slow and thorough as it needs to be. Retrieval must be cheap.

## Prime Directive — Query Cost Is The Metric

- **Compiling, writing, indexing and auditing may be arbitrarily expensive.**
  I genuinely do not care how long a compile takes or how many tokens it costs.
- **Answering must be cheap.** Target: **30–50× cheaper** than the naive
  alternative of loading source material into context. Against this vault's
  ~16,800-token source baseline that means roughly **350–550 tokens** of file
  content for a typical question.
- **Detail and cheap retrieval are not in tension**: the capped answer surface
  is what questions read, and the uncapped body holds full fidelity, read only
  for depth and only the exact lines needed.
- **Therefore: never drop information to hit a size target.** If a concept has
  more detail than fits, the detail goes into the body, a `detail` node, or a
  `log` — it does **not** get summarised away. The old "~120 lines per article"
  rule was wrong and has been replaced by the kind-aware rules below. The same
  holds for this file and HANDOFF.md: over their token budget the build warns,
  and detail moves to a rules file, a skill or a wiki node — never vanishes (D87).
- **The answer surface is the one hard cap**: 8 bullets, 1500 bytes. That cap
  is what buys the cost target. Everything else bends.

## Source Independence

**`raw/_compiled/` is disposable. I may delete it at any time.**

- The wiki must answer every question **without** raw sources present. Anything
  only recoverable from `raw/` is a defect, not a design.
- Concretely this means: verbatim day-level records live in the logs
  (`wiki/journal/`, and `wiki/<engagement>/worklog/` for a self-contained
  work engagement), every named job, table,
  class, script and path lives in a `detail` node, and a compiled document's
  full text lives in a `verbatim: true` detail node with every figure
  transcribed — not only inside a prose summary.
- **`raw/` and `raw/_compiled/` are out of the query path entirely.** There is
  no "L4 — read the source" fallback any more. If the wiki cannot answer, the
  wiki is wrong: say so, and fix it by capturing what is missing.
- Reading `raw/` is legitimate only during a **compile**, or when I explicitly
  ask you to verify against an original that still exists.
- **Audit test**: could this question still be answered if `raw/_compiled/`
  were deleted right now? If no, that is a compile gap to report.

## The Index Layer

Five generated files are the retrieval backbone, built in the same step as any
write and grepped at query time. **Never read any of them whole.** Their full
description, and the rules for keeping them current, are in
`.claude/rules/wiki-writing.md` § The Index Layer.

| File | One row per | Columns | Answers |
| --- | --- | --- | --- |
| `wiki/_index.tsv` | node | path, title, topic, kind, status, aliases, tags, summary | routing (L0), breadth, facets. The aliases column also holds generated US spellings, hyphen-free forms, code identifiers and "this month" on the newest log |
| `wiki/_cards.tsv` | node | path, title, Key Takeaways joined by a literal `\n` | the answer (L1); a median row is about 265 tokens |
| `wiki/_sections.tsv` | section | path, heading, start line, end line, gist | an exact `sed -n 'A,Bp'` range (L2); dated log entries |
| `wiki/_links.tsv` | link | source path, target path | neighbourhoods, without reading notes |
| `wiki/_mentions.tsv` | log entry naming a person | person slug, date, log path, line range, snippet | a person over time: `grep -P '^<slug>\t'` |

`wiki/profile/now.md` is generated from every open `## Status Log`: the one card
that answers "what's my status?". Never edit it by hand.

## Query Protocol

Stop at the first rung that answers the question. Measured costs below are real,
against a ~16,800-token source baseline.

- **L0 — Route.** `grep -i <term> wiki/_index.tsv | cut -f1,8` → paths plus
  summaries. **~50–180 tokens.** Many questions end here.
- **L1 — Card.** Take the best path from L0 and pull its answer surface:
  `grep -P '^<path>\t' wiki/_cards.tsv`. **~220 tokens.**
  L0+L1 together land at **35–100×, median ~44×** on the audit's benchmark,
  which is the normal path. `/vault-audit` measures it live.
- **L2 — Section.** For depth: `grep -P '^<path>\t<Heading>' wiki/_sections.tsv`
  gives start and end lines; then one `sed -n 'A,Bp' <path>`. **~300–600
  tokens**, and it returns the *full* text of that section, nothing lost.
- **L3 — Whole node.** Only when the question genuinely spans the node.

**Do not grep `_cards.tsv` with a broad term.** A term matching four cards
costs ~1000 tokens and drops you to 17×. Route on `_index.tsv` first, then pull
**one** card. Direct card greps are for precise, obviously-unique terms.

Supporting moves:

- **Dated questions** ("what did I do on 10 June?", "what happened in July?"):
  grep `_sections.tsv` for the date heading, then `sed` that exact range. The
  worklog headings carry both formats — `2026-06-10 (10-Jun-26)` — so either
  spelling hits.
- **Breadth questions** ("what do I know about X?"): grep `_index.tsv` on the
  topic, kind or tag column and answer from `summary` fields alone. A survey
  legitimately costs more than a point lookup; that is fine, it *is* the answer.
- **Facet questions** ("which projects used PySpark?", "who are my co-authors?",
  "what's all my healthcare work?"): filter the tags column first —
  `cut -f1,7 wiki/_index.tsv | grep 'rel/co-author'` — then pull summaries or
  cards only for the paths you need (`wiki-writing.md` § Tags).
- **Neighbourhood**: grep `_links.tsv` for a path. Never read articles to find
  their links.
- **Status** ("what's going on?", "when does X start?"): the Now card —
  `grep -P '^wiki/profile/now.md\t' wiki/_cards.tsv` — or the owner's card.
- **A person over time** ("every time I worked with X"): `_mentions.tsv`.
- **Figures** ("what does the architecture look like?"): answer from the
  transcription — each figure is its own `_sections.tsv` range. **Never read an
  image file at query time**; it costs ~1,000–1,600 tokens. If I want to *see*
  it, give me the embed or the path.
- **Orientation** ("what's even in here?"): read `wiki/_master-index.md`.
- **Notion is a secondary source.** This vault outranks it. Reach for Notion
  only when the wiki is genuinely insufficient, or when I explicitly ask.

### Budget and reporting

- Aim **under ~600 tokens** of file content for a point lookup, under ~2k for a
  survey.
- If a lookup costs materially more, say so in **one line** and name the cause —
  a missing alias, a broad card grep, an oversized answer surface, or a real gap.
- End non-trivial lookups with a one-line trace: `path: index → 1 card`.
- **When a lookup routes badly in real use, add the term to
  `tools/probes.json`.** That corpus is how a routing failure found once never
  silently returns (D23).

### Banned at query time

- Reading `raw/` or `raw/_compiled/` at all.
- Reading any `_*.tsv` in full.
- `cat`-ing a whole node to reach one section.
- Globbing a topic folder "for context".
- Re-reading a file already in this session's context.
- Reading `_master-index.md` plus every `_index.md` as a routing warm-up.
- Reading an image file.

## Capture Protocol

Quick captures are written **straight to their destination** and the index is
rebuilt in the same step. Only source *documents* take the `raw/` round trip.

| I say | Goes to | kind |
| --- | --- | --- |
| "log this" / a dated update about a self-contained engagement's work | `wiki/<engagement>/worklog/<prefix>-YYYY-MM.md`, under today's date | `log` |
| any other dated update — life, learning, career, this vault — or every dated update, if no engagement has its own topic | `wiki/journal/journal-YYYY-MM.md`, under today's date | `log` |
| a status change — "X started", "still waiting on Y" | a dated row in the owning node's `## Status Log` (`wiki-writing.md` § Write-Side Rules) | — |
| "idea:", or something I might build | `wiki/ideas/<slug>.md` with a `status` | `idea` |
| "we decided X because Y", **on a project** | that project's `decisions/`, e.g. `wiki/acme-engagement/decisions/<slug>.md` | `decision` |
| a significant **personal** decision | `wiki/decisions/<slug>.md` — register the topic in `tools/build-index.js` first | `decision` |
| a new fact about a person | the existing `wiki/people/<slug>.md` | `person` |
| a new concept | the right topic folder | `hub` |
| deep material under a concept | `<concept>-<aspect>.md` beside its hub | `detail` |
| a file, PDF or URL | `raw/`, where it waits for `/vault-compile` (§ Compile and Audit) | — |
| an image I paste or send | `<topic>/assets/`, renamed and transcribed (`images-drawings.md` § Images) | — |
| "draw…", "diagram…", or a change to a drawing | `Excalidraw/<topic>/<name>.excalidraw.md` via the `vault-excalidraw` skill; embedded live in the owning node and transcribed, hash included (`images-drawings.md` § Images) | — |
| a daily note I write in Obsidian (Calendar) | lands in `raw/daily/YYYY-MM-DD.md`; `/vault-compile` copies it word for word into that month's logs, then moves it to `raw/_compiled/daily/` | `log` |
| any other note I make in Obsidian | lands in the `raw/` inbox (new-note location); waits for `/vault-compile` like a document | — |

- **A daily note is a capture, not a node.** It waits in `raw/daily/` until I
  type `/vault-compile`, which copies it word for word into the month's logs
  and distils it into the nodes it touches; the builder warns while anything
  waits in `raw/` outside `_compiled/` (D68).
- **Every capture gets aliases** covering how I would naturally ask for it later.
- **A correction is swept, then fenced.** When I correct a fact, grep the whole
  vault for the wrong version and fix every hit — not just the node in view —
  then add the wrong claim to `tools/probes.json` `_forbidden`, so the build
  fails if it ever creeps back (D37). In Vifert's vault a colleague's wrong
  employer survived in one unswept node for three days. A fence proves itself
  both ways (D50) — `.claude/rules/tooling.md` § Fences; **when a new fact
  touches a fenced claim, add it to `passes` first.**

## Compile and Audit — Only When I Invoke Them

Compiling `raw/` and auditing the vault are the two expensive things this
vault does, so they run only when I start them (inherited from Vifert's
vault, 19 September 2026, D78); so does the session handoff. Each is a skill
I type. Claude Code refuses to start any of the four itself
(`disable-model-invocation: true`), and so does Codex (each generated copy's
`agents/openai.yaml` sets `allow_implicit_invocation: false`). Any other agent
has only the rules below to stop it, so they are rules, not suggestions.

| I type (`$vault-compile` and so on in Codex) | It does |
| --- | --- |
| `/vault-compile [path…]` | compiles what waits in `raw/`: the next batch of the compile plan in HANDOFF.md, or everything if little is waiting, or a plan first if a lot is; or only the paths I name |
| `/vault-audit` | runs the self-test, the build and `audit.js`, reports problems, watch items and query cost in a few lines, and asks which to fix |
| `/vault-deep-audit [topic]` | the audit, plus the source-independence check, judgement on watch items, and a gap audit by agents asking questions in my words |
| `/vault-handoff` | the end-of-session record: the session log, HANDOFF.md, the rules and global memory, then a commit |

- **Gated — never start these yourself**: compiling anything in `raw/`
  outside `raw/_compiled/` (documents, daily notes, Obsidian notes, imports);
  running `node tools/audit.js`; any vault-wide health check.
- **Not gated — part of the work**: quick captures written straight to their
  destination (§ Capture Protocol); `node tools/build-index.js` after every
  write, because it is the validator; `node tools/selftest.js` after a
  tooling change; `node tools/excalidraw.js` lint and render.
- **When I hand you a file, or something waits in `raw/`**: save the file
  into `raw/`, say in one line what is waiting and that `/vault-compile` will
  compile it, and stop there. At session start, mention waiting captures once.
- **If I ask in plain words** ("compile it", "audit the vault"), ask me to
  type the command. Never follow a gated skill's steps by another route —
  reading its `SKILL.md`, or rebuilding its procedure from memory — unless I
  invoked a skill that includes them (`/vault-deep-audit` includes
  `/vault-audit`). Why skills and not only a rule:
  `wiki/tooling/vault-skills.md` § Why Skills, Not Only A Rule.

## NotebookLM

NotebookLM is a **compile instrument** — never a source, never in the query
path. The builder fails a claim attributed to it, or a notebook id, outside a
log or a verbatim node (D74). When and how it is used, and the rules that keep
it harmless, are in `/vault-compile`; `wiki/tooling/notebooklm-compile-support.md`
is the retrievable version.

## Write-Side Rules That Buy Read-Side Cheapness

- **Takeaways stand alone.** Each bullet intelligible without the body and
  without the title. No "as described above", no dangling pronouns — name the
  subject: "The parallel run is not a dry-run", never "It is not a dry-run". The
  builder fails a bullet that opens with a bare pronoun (D57).
- **One concept per node.** Atomic nodes retrieve precisely.
- **`summary` must discriminate** — it is the sentence that tells this node
  apart from its neighbours in a grep result.
- **Aliases are a retrieval investment.** Every phrasing I plausibly use:
  abbreviations, plurals, symptoms, error strings, the wrong-but-natural name,
  and **the first-person form** ("my grades", "where do I live") — that is how I ask.
  A missing alias is a silent miss that forces an expensive fallback. Probe for
  gaps during an audit by testing terms against `_index.tsv`. **Code
  identifiers route themselves** (D54): write a job, table, class or script
  name in a node and the builder indexes it — unless more than three nodes
  name it, when it needs a deliberate alias on the node that explains it (the
  audit lists any that route nowhere).
- **A snapshot of something outside the vault carries its date.** Repo counts,
  followers, "most recently active", "the latest version" — facts that change
  on their own — say *as of when* (D59). A repository count was undated for
  three days.
- **Deliberate denormalisation is allowed — for stable facts.** Repeating a key
  fact in two nodes is cheaper than forcing a second read. Do not chase DRY
  across nodes.

## Defect Discipline

Every defect — found by an audit, by me, or in passing — is closed in four
steps, in the same session:

1. **Fix the instance.**
2. **Find the root cause** — why the vault allowed it, not just what broke.
3. **Prevent the class**, preferring in this order: a **mechanical guard**
   (`selftest.js` for tooling, the builder for content, `audit.js` for
   heuristics, a hook for a trap in how the agent works) → a **rule** in the right
   section of this file or a `.claude/rules/` file → a trap in Working Notes.
   A rule without a guard is a hope.
4. **Record it** in `tools/DEFECTS.md`: ID, date, defect, root cause, fix,
   guard. Tag the guard's code with the ID. `selftest.js` fails if a row names a
   guard whose code does not cite the ID, or a section that exists in neither
   this file nor `.claude/rules/`.

After changing any rule, grep the vault and `tools/` for its old wording — a
stale comment or node restating the old rule is itself a defect (D20). When a
rule changes something I might ask about, mirror its gist into `wiki/tooling/`
so it is retrievable (D08).

All numeric rules (caps, margins, cost target, baseline) live in
`tools/lib/rules.js` and nowhere else — the builder and the audit import the
same numbers, and `selftest.js` fails if a tool re-declares them.

## People

- **Never invent biographical detail.** Unknown facts stay absent; ambiguous
  ones get flagged in the node.
- **Pronouns only when stated.** When I state someone's pronouns, record them as
  `pronouns:` in their node. Before writing a pronoun for anyone — in a node, a
  report, HANDOFF or chat — check that field; the builder also prints it on
  their card title (`Sam Lee (he/him)` in `_cards.tsv`), so the card you
  pull to answer already carries it. If it is absent, use they/them or
  their name. **Never infer from a name**: in Vifert's vault "her" for a
  colleague who is he/him was a guess, and so was "she" for a co-author, even
  though it proved right (D25). A person gets pronouns only when I state them.

## Version Control

- Private repo `{{GITHUB_REPO}}`, branch `main`, remote
  `origin`. Use the **git CLI**, not MCP push tools.
- **Commit at the end of any session that changed the vault**, not per file.
- **Never commit a stale index.** Run `node tools/build-index.js` and confirm it
  validates clean before committing. If tooling changed, run `node tools/selftest.js` too.
- Commit message: subject in vault terms, body with the counts that changed —
  nodes, sections, edges.
- Push after committing unless I say otherwise.
- **Drawings go to excalidraw.com as share links only when I ask for one.** A
  link carries the encrypted drawing and anyone holding it can view it: give it
  to me, never write it into a note or a commit.
- **The repo is private** — it can hold work, client and family material. Keep it private.
  Never mirror to a public repo, gist or Artifact without me saying so.

## Session Handoff

- HANDOFF.md is updated only when {{OWNER_NAME}} types `/vault-handoff`
  (§ Compile and Audit). If a session changed the vault and it has not been
  typed, remind {{OWNER_NAME}} once, in one line, at the end.

## Working Notes

Verified on this machine on {{SETUP_DATE}}. Re-check after a long gap or on a
new machine — and rewrite any note here that stops being true.

- **Vault path**: `{{VAULT_PATH}}`
- **⚠ Obsidian rewrites frontmatter.** Opening a note in the Obsidian UI
  converts inline `aliases: [a, b]` into a YAML block list — and has been
  observed **dropping** entries in the process (an identity node in Vifert's
  vault lost two).
  The index parser handles both forms, but **after I have been editing in
  Obsidian, re-run the index build and probe for alias gaps**, because losses
  are silent and only show up as a query that mysteriously routes nowhere.
- **Obsidian may be open while you work** — in Vifert's vault a table in a
  note being compiled was re-padded, and a half-typed link appeared and was
  fixed, mid-session. Anchor every scripted edit on exact text so a concurrent
  change fails loudly instead of being overwritten, and re-read before editing.
- **ripgrep (`rg`) is available**; Claude Code's Grep tool is ripgrep-backed.
  Either is fine for index lookups.
- **`defuddle` IS installed** (global npm).
- **node and jq are available** — the index build is a node script.
- Client-side-rendered sites return an empty shell to
  a plain fetch or defuddle. Use the browser tool, and check for sub-pages.
- **One-off scripts are disposable** — migrations, bulk edits, content fixes go
  in the session scratchpad, never in the vault.
