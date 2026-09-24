# How it works

Each section below is the short version of a rule; the link goes to the section
of `CLAUDE.md` that holds the full rule, which is what the agent running a
vault actually reads.

## The problem: loading notes costs tokens

An AI assistant that answers from your notes has to read them first. Loading
every note for every question is simple, and it gets more expensive with every
note you add. Summarising the notes to make them cheaper to load loses the
detail that made them worth keeping.

This vault takes neither route. **Capture may be slow and thorough; answering
must be cheap.** Compiling a source into the vault can take as long and as many
tokens as it needs. Answering a question should cost a few hundred tokens of
file reading — 30–50× less than loading the sources — with nothing summarised
away. → [CLAUDE.md § Prime Directive](../CLAUDE.md#prime-directive--query-cost-is-the-metric)

## The answer surface and the body

A note does not have to be both small enough to read cheaply and complete
enough to hold everything. Those are two jobs, done by two layers of every
node:

- **The answer surface** — a `## Key Takeaways` section at the top, capped at
  8 bullets and 1,500 bytes. Each bullet stands alone. This is what a question
  usually reads.
- **The body** — everything else, effectively uncapped, at full fidelity.
  Only a question that needs depth reads it, and then only the exact lines it
  needs.

So detail is never dropped to hit a size target: it moves into the body, a
`detail` node beside the hub, or a dated log. → [CLAUDE.md § Write-Side Rules](../CLAUDE.md#write-side-rules-that-buy-read-side-cheapness)

## The five index files

`node tools/build-index.js` generates five files from the notes, and every
question starts from them rather than from the notes:

| File | One row per | Used for |
| --- | --- | --- |
| `wiki/_index.tsv` | node: path, title, topic, kind, status, aliases, tags, summary | routing, breadth and facet questions |
| `wiki/_cards.tsv` | node: its Key Takeaways | answering in one grep |
| `wiki/_sections.tsv` | section: path, heading, start and end line | reading one exact range |
| `wiki/_links.tsv` | link between two nodes | neighbourhoods, without reading notes |
| `wiki/_mentions.tsv` | dated log entry naming a person | "every time I worked with X" |

It also generates `wiki/profile/now.md`, the one card that answers "what is
going on?", built from every open status log. None of these files is ever read
whole. → [CLAUDE.md § The Index Layer](../CLAUDE.md#the-index-layer)

## The query ladder

A question climbs only as far as it has to:

| Rung | Does | Typical cost |
| --- | --- | --- |
| **L0 — route** | grep `_index.tsv` for the terms; read paths and summaries | ~50–180 tokens |
| **L1 — card** | pull the best node's row from `_cards.tsv` | ~220 tokens |
| **L2 — section** | look up a range in `_sections.tsv`, read exactly those lines | ~300–600 tokens |
| **L3 — whole node** | only when the question spans the node | rare |

Dated questions go straight to `_sections.tsv`, where every log heading
carries the date in two spellings. In the vault this method was built in, L0
and L1 together answer at a median of about 44× cheaper than loading its
~16,800 tokens of sources; on the fictional benchmark in `bench/`, the first
scorecard is 27× on an ~11,000-token corpus. → [CLAUDE.md § Query Protocol](../CLAUDE.md#query-protocol)

## Node kinds

Every node declares a `kind`, which sets its body budget and how it is read:

| Kind | Body cap | What it is |
| --- | --- | --- |
| `hub` | 200 lines | a concept's main node |
| `detail` | 350 lines | deep reference under a hub |
| `log` | uncapped | an append-only dated record, read by date range |
| `person` | 120 lines | someone the owner mentioned |
| `idea` | 150 lines | something the owner might build |
| `decision` | 150 lines | a call that was made, and why |

The answer-surface cap is the same for every kind. → [`.claude/rules/wiki-writing.md` § Node Kinds](../.claude/rules/wiki-writing.md#node-kinds-and-size-rules)

## Nothing depends on the sources afterwards

Once a source is compiled it moves to `raw/_compiled/`, which may be deleted
at any time. The vault must answer every question without it: day-level
records live in logs, a document's full text lives in a `verbatim` node, and
every figure is transcribed as text. → [CLAUDE.md § Source Independence](../CLAUDE.md#source-independence)

## The build is the validator

`node tools/build-index.js` runs after every write, and a write is not finished
until it validates clean. It refuses, among much else, an oversized answer
surface, a broken link, an unregistered tag, an untranscribed image or
drawing, a rewritten log entry, a claim the owner has corrected, a person named
without a link, and an Obsidian setting that drifted. A stale index is the
worst failure the vault can have, because it silently routes questions down
the expensive path — so the index is rebuilt in the same step that changes
content, never later.

The two expensive operations — compiling `raw/` and the full audit — run only
when the owner types `/vault-compile`, `/vault-audit` or `/vault-deep-audit`.
→ [CLAUDE.md § Compile and Audit](../CLAUDE.md#compile-and-audit--only-when-i-invoke-them)

## The defect discipline

Every mistake is closed in four steps: fix the instance, find the root cause,
add a mechanical guard that stops the whole class, and record it in
`tools/DEFECTS.md` with its ID cited in the guard's code. `node tools/selftest.js`
fails if a ledger row names a guard that does not exist. The ledger ships with
the 79 defects found while this method was built, so a new vault starts with
every guard in place. → [CLAUDE.md § Defect Discipline](../CLAUDE.md#defect-discipline)
