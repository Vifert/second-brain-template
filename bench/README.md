# The benchmark

A shared benchmark for improving the method itself. When someone proposes a way
to make answers cheaper, compiles more faithful, or links, tags and nodes
better, this is where the claim is measured — so ideas are compared on numbers,
not on taste.

## The owner is fictional

**Mira Okafor, and everyone and everything in `raw/`, is invented** — her
employer, her colleagues, her paper, her allotment. The corpus contains no
one's personal data, so results on it can be published freely.

## What is here

| Path | What it holds |
| --- | --- |
| `raw/` | Twenty sources, about 44 KB, of the shapes a real vault receives: nine daily notes, four meeting notes, a paper with two results tables, a decision note, a CV, two web clippings and two idea notes |
| `questions.json` | Thirty gold questions, written before any compile |
| `bench.json` | The fictional owner's name, pronouns and slugs, and the default token budget |
| `baseline/` | The corpus compiled by the current method — the numbers to beat |
| `results/` | Scorecards: `baseline.json` for the current method, `history/<version>.json` per release |

## How the questions work

Each question has:

- **`terms`** — what a person would actually type;
- **`facts`** — strings, or `{ "re": "pattern" }`, that a correct answer must
  contain;
- **`forbid`** — wrong values that must **not** come back, such as a garbled
  figure;
- **`budget`** — the most tokens a good answer should need; 600 unless stated.

**Questions name facts, never nodes.** A method that restructures the whole
graph competes on equal terms with today's layout; nothing rewards one
particular node structure.

**Two traps are deliberate.** The paper's abstract says 12,400 notes and its
table caption says 12,040; a faithful compile records the contradiction and
surfaces both (q12). And one daily note gives a talk date that a later note
changes, so a compile must keep history while answering with the current date
(q15).

**The corpus has near-misses on purpose**, because real vaults do and routing
is where methods differ: two people called Sam, a second project on the same
Postgres with its own deadline and Airflow job, a second rate-limiting
clipping, a per-query-type table beside the headline results, another 5 km run
with no time, and a certification Mira was advised to take but has not. The
corpus is also large enough — about 11,000 tokens — for the cost ratio to mean
what it means in a real vault; keep it within one `/vault-compile` run (20
files, 60 KB).

## Scoring

```sh
node tools/bench.js                    # score bench/baseline and print the table
node tools/bench.js --vault <dir>      # score another compiled copy
node tools/bench.js --label mine --write
node tools/bench.js --against bench/results/baseline.json
```

The scorer never calls an LLM. It rebuilds the vault's index with the
template's own builder and runs each question down the query ladder
mechanically:

1. **Route** on `_index.tsv`, paying for every matching row's path and
   summary. The best row is the one whose path or title names the terms, then
   whose summary does, then any other match — what a reader of `cut -f1,8`
   would pick.
2. **Read that row's card**, and stop there if it holds every gold fact.
3. Otherwise **read one section** of that node, the one matching the most
   terms, if the budget allows.

A question with a date in its terms takes the dated rung instead: the matching
`_sections.tsv` rows, then those ranges within budget. The scorer is a
deliberately simple reader. A method that wins by putting the answer where a
simple reader looks has also made it cheaper for a real one. It reports:

| Metric | Meaning |
| --- | --- |
| **Cost** | How many times cheaper each answer is than loading all of `raw/` — the vault's own 30–50× measure |
| **Routing** | The share of questions whose *first* card already holds a gold fact |
| **Fidelity** | The share of gold facts retrieved within budget |
| **Forbidden values** | Wrong values that came back — must be zero |
| **Graph health** | Orphans, dead ends, links per node, aliases per node |

A vault that does not build clean is refused, not scored.

## Compiling the benchmark with your change

1. With your change applied to the template, run
   `node tools/bench.js --prepare <an empty folder>`. It copies the template
   without `bench/` and `.git`, puts `bench/raw/` in its `raw/`, sets the
   fictional owner, and fills every setup token from `bench.json` — the same
   way the baseline was prepared, so the only difference is your change.
2. **Use only the starter topics.** The benchmark must build with the
   template's own topic list, so do not register new ones.
3. Start your coding agent in that folder and type `/vault-compile`
   (`$vault-compile` in Codex). The baseline was compiled with Claude Code; say
   which agent compiled yours, since an agent change moves the scorecard too.
4. Copy its `wiki/` and `Excalidraw/` over the ones in `bench/baseline/`, then run
   `node tools/bench.js --write` and commit the scorecard with your change.

CI recomputes the scorecard from what you commit, so the numbers cannot be
edited by hand, and prints the delta against `main`.

## Changing the gold questions

Only to fix a question that is wrong — never to favour a method — and in a pull
request of its own, so a change to the yardstick is never hidden inside a claim
measured by it.
