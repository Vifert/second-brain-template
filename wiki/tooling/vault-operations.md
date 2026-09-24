---
title: Vault Operations
summary: How this vault is run day to day — the query ladder, the five index files, version control, the audit and defect routine, the Obsidian trap, and the machine's tooling.
aliases: [vault operations, query protocol, query ladder, how to query, retrieval protocol, git repo, gitignore, version control, commit, push, obsidian trap, frontmatter trap, audit, lint, how do I audit, working notes, environment, pdftotext, PyMuPDF, pdfplumber, pdfminer, python-pptx, heredoc, tooling quirks, how does retrieval work, defect ledger, defects, defect discipline, probes.json, forbidden claims, fences, how are defects handled, mentions, people timeline, obsidian CLI, where do the rules live, .claude/rules, rules folder, path-scoped rules, CLAUDE.md core, hooks, token budget]
topic: tooling
kind: hub
tags: [subject/operations, subject/retrieval, tech/git, subject/audit, subject/workflow]
created: 2026-09-09
updated: 2026-09-24
---

## Key Takeaways

- **The query ladder: route on `_index.tsv`, then pull exactly one card from `_cards.tsv`** — the prime directive's 30–50× target, which `node tools/audit.js` measures live on every audit. Depth comes from exact `_sections.tsv` line ranges; broad card greps are the failure mode.
- **Five index files**: `_index`, `_cards`, `_sections`, `_links`, and `_mentions.tsv` — every dated log entry that names a person, so "every time I worked with X" is one grep.
- **Status questions go to [[now|Now]]**, generated from each item's Status Log. Figure questions are answered from transcriptions — an image is never read at query time.
- **Version control**: private repo `{{GITHUB_REPO}}`, branch `main`, git CLI only. Commit at the end of a session that changed the vault, never with a stale index, then push.
- **⚠ Obsidian can silently drop aliases** when it rewrites frontmatter. The build now warns on any alias lost since the last commit.
- **Audits run the tools** — `selftest.js`, `build-index.js`, `audit.js` — the audit only when the owner types `/vault-audit` or `/vault-deep-audit` — and **every defect is fixed, root-caused, guarded and recorded** in `tools/DEFECTS.md`.
- **PDF and image tooling installed 2026-09-11**: PyMuPDF, pdfplumber, pdfminer.six, python-pptx, Pillow. The Obsidian CLI is deliberately not used.

## The Five Index Files

| File | Holds | Use for |
| --- | --- | --- |
| `_index.tsv` | path, title, topic, kind, status, aliases (+ generated US/UK spellings, hyphen-free forms, code identifiers, and "this month"-style aliases on the newest log), tags, summary | Routing, breadth, filtering — always first |
| `_cards.tsv` | path, title, the full Key Takeaways block | Answering, one row at a time |
| `_sections.tsv` | path, heading, start line, end line, gist | Exact-range reads: dated entries, sections, figures |
| `_links.tsv` | source, target | Neighbourhood expansion |
| `_mentions.tsv` | person, date, log path, line range, snippet | A person's timeline across the logs |

**Never read any of them whole.** Always grep. The builder also generates the
[[now|Now]] page, every topic `_index.md` and `_master-index.md`.

## Node Kinds And Their Budgets

| kind | body cap | read path |
| --- | --- | --- |
| `hub` | 200 lines | card |
| `detail` | 350 lines | exact section range |
| `log` | uncapped | date range |
| `person` | 120 lines | card |
| `idea` / `decision` | 150 lines | card |

The **answer surface is capped identically for every kind**: 8 bullets, 1500 bytes.

## The Audit Routine

```sh
node tools/selftest.js      # the tooling itself is sound
node tools/build-index.js   # rebuild + validate
node tools/audit.js         # the full audit — only through /vault-audit
```

The audit covers index consistency, the alias probe, **must-route** terms that
have to reach a specific node, spelling probes that must genuinely test
spelling, orphans and dead ends, **code identifiers only a log names**,
**captures waiting in `raw/`**, **tag facets named like a probe term**, answer-surface health, frontmatter drift, **query cost** against
the fixed baseline, open statuses gone stale, gendered pronouns that were never
stated, and media. Routing probes use a literal, line-based
`grep -i` — exactly the real query. Two things stay human: the
source-independence judgement, and deciding which watch items matter — both in
`/vault-deep-audit`. The build, not the audit, catches **corrected claims
creeping back** (`_forbidden` in `probes.json`), **people named without a
link**, one-sided `[sic]` notes and **the Obsidian settings the rules depend
on**, because the audit runs only when the owner asks (D78).

## Defect Discipline

Every defect is closed in four steps, in the same session: **fix** the
instance; find the **root cause**; **prevent the class** — a mechanical guard
first, a `CLAUDE.md` rule second; and **record** it in `tools/DEFECTS.md`. The
guard's code — its problem message or test name, not a comment — cites the ID,
and the self-test fails if the ledger names a guard that does not exist.
The ledger ships with the 79 defects (D01–D79) found and fixed in Vifert's
vault, where this architecture was built between 9 and 23 September 2026 —
D36–D49 from an adversarial verification, D50–D53 from his answers the same
day, D54–D64 from a gap audit, D65–D71 from work on tags and Obsidian plugins,
D72–D77 from drawings, NotebookLM and the drawing tool's browser, and D78–D79
from gating the compile and audit and from making plugins optional. D80–D85
were found preparing this template for release, and D86–D88 are the original
vault's D80–D82, ported; D89 came from the template's own upkeep. This vault's
own defects start at D90.

**A correction is swept, then fenced**: when the owner corrects a fact, the wrong
version is fixed everywhere and added to `_forbidden`, so the build fails if it
returns. Every fence carries `catches` and `passes` examples, replayed on every
build, so a fence can be neither hollow nor so broad it blocks the truth.

## Environment

- **PDFs**: PyMuPDF (`import pymupdf`) for reading-order text, page renders,
  figure crops and embedded images; pdfplumber and PyMuPDF for tables;
  pdfminer.six; `pdftotext -layout` still works for quick text. `pdftoppm` is
  deliberately not installed — PyMuPDF covers it without a third-party binary.
- **`python-pptx` and Pillow** are installed.
- **`defuddle` is installed** for clean web pages. Client-side-rendered sites
  (a portfolio site, for example) need the browser tool.
- **The Obsidian CLI is not used**: it only works while Obsidian is open, and
  edits through it pass the frontmatter rewriter that has dropped aliases.
- **Long heredocs fail on this Windows shell**, and bash executes backticks in
  markdown — file content goes through the Write tool or a script file.
- **The file-writing tool decodes `\uXXXX` escapes** into real characters; write
  literal escapes from a script.
- One-off scripts are disposable; `tools/` is versioned and is not.

## Where The Rules Live

`CLAUDE.md` is an always-on core: every session and every subagent loads it, so
its size is paid again and again (D87). The rest of the rules are in
`.claude/rules/`, and Claude Code loads each file only when a file its `paths:`
match is read:

| File | Loads for | Holds |
| --- | --- | --- |
| `wiki-writing.md` | `wiki/**` | node kinds, folders, tags, the full index description, frontmatter, article shape, naming, linking, people, log and idea mechanics, the guarded write-side rules |
| `images-drawings.md` | `wiki/**/assets/**`, `Excalidraw/**` | images, figures, drawings, rendering |
| `obsidian.md` | `.obsidian/**`, `templates/**` | the Obsidian skills and plugins, the versioned setup |
| `tooling.md` | `tools/**` | the tools, the hooks, Windows file locks |

A rule left the core only if a mechanical guard backs it — the builder, the
self-test or a hook — so a turn that never loads its file still cannot break it
unnoticed. The core keeps the query protocol and every judgement rule no guard
covers: pronouns only when stated, never inventing biography, aliases in the
first person, a snapshot carries its date. The compile-only machine notes moved
into `/vault-compile`.

**Hooks** in `.claude/settings.json` enforce three traps — bash that would
execute backticks (D13), CRLF line endings (D76) and control bytes from a typed
`\u` escape (D03) — and a Stop hook rebuilds a stale index at the end of every
turn.

**Budgets warn; they never fail.** The build warns when `CLAUDE.md` passes about
6,000 tokens, or HANDOFF.md 3,000, and names the only remedy: move detail out,
never delete or compress it. A hard cap applied to content is how D01 lost 78
dated entries. The one strict check is correctness, not size: the self-test
fails a rules file without `paths:`, which would load at launch and undo the
split.

## Related

- [[vault-skills|Vault skills]] — `/vault-audit` and `/vault-deep-audit` run the audit; only the owner starts them.
- [[second-brain-architecture|Second brain architecture]] — why the vault is shaped this way.
- [[vault-capture-protocol|Vault capture protocol]] — how things get in.
- [[vault-image-rules|Vault image rules]] — how figures are stored and transcribed.
- [[obsidian-plugins|Obsidian plugins]] — the four plugins, what each can rewrite, and the settings the build checks.
- [[vault-tag-facets|Vault tag facets]] — the nested tag scheme the builder enforces.
- [[now|Now]] — the generated status page.
- [[notebooklm-compile-support|NotebookLM in the compile]] — the grounded second reader used at compile steps 1 and 5, and why it never settles a claim.
