# Contributing

## What this project is for

A second brain that answers cheaply without losing detail: an Obsidian vault
whose knowledge is compiled once, carefully, and read back through a small
index for a few hundred tokens a question. It is improved in the open, and
three kinds of contribution are welcome:

- **Fixes** — a bug in a tool, a guard that misfires, a setup step that fails
  on your machine.
- **Docs** — anything a newcomer tripped over.
- **Improvements to the method** — cheaper answers, more faithful compiles,
  better links, tags and nodes. **This is the one we most want**, and it has its
  own section below.

## Before you start

- **Open an issue first** for anything beyond a typo, so nobody builds
  something that will not be merged.
- **One topic per pull request.** A fix and a refactor are two PRs.
- **Conventional commit titles** — the PR title becomes the commit, and
  releases are cut from it:
  - `fix: build-index misses a wrapped alias list`
  - `feat: warn when a hub has no Day-by-day record`
  - `docs: explain the dated rung in the query protocol`
  - `refactor:`, `test:`, `chore:` for the rest.

## Getting the code

1. **Fork** this repository with the Fork button. Do not use *Use this
   template*: it makes an unlinked copy with a fresh history, and GitHub
   cannot open a pull request from it back to this repository.
2. Clone your fork, and make a branch for the one topic.
3. Make the change, then run the checks below until they pass.
4. Push the branch and open a pull request to `main` here, linking the issue
   and filling in the pull request checklist.

**Never contribute from the vault you set up.** It holds your own notes, and
`scan-private.js` fails on them anyway. Keep a separate clone of your fork for
contributions, and carry a fix you made in your vault across by hand.

## Running the checks

Node 22 (see `.node-version`); nothing to install.

| Command | Guarantees |
| --- | --- |
| `node tools/selftest.js` | The tooling itself is sound: every rule's unit tests, and every ledger row's guard cites its ID |
| `node tools/build-index.js` | The vault validates — frontmatter, caps, links, status, images, drawings — and the five index files are current |
| `node tools/audit.js` | Routing and cost: every probe term routes, must-route terms reach their nodes, and benchmark queries stay cheap |
| `node tools/scan-private.js` | No email addresses, user paths, ids or other personal data in the repository |

## Improving the method

This is where a contribution changes what the vault *does*: the rules in
`AGENTS.md` and `.claude/rules/`, the skills in `.claude/skills/`, the agents and hooks, the
builder, the templates. `.claude/` is the source for every agent: after changing a
skill, an agent or a hook, run `node tools/agents-sync.js` and commit what it
writes to `.agents/` and `.codex/`. An AI agent contributing here reads
[`docs/for-ai-agents.md`](docs/for-ai-agents.md) first.
Claims are settled on numbers, not taste.

1. **Propose.** Open an issue with the **Improvement Proposal** form: the
   problem, your hypothesis, what changes, which scorecard numbers should move
   and by how much, and what might get worse. Read [ROADMAP.md](ROADMAP.md) for
   where help is wanted.
2. **Discuss.** Agree the shape before the expensive part.
3. **Measure.** Apply your change, then compile the benchmark with it:
   `node tools/bench.js --prepare <empty folder>`, `/vault-compile` there, and
   copy the result over `bench/baseline/` (full steps in
   [bench/README.md](bench/README.md)).
4. **Open the PR** with the method change, the recompiled bench and its
   scorecard (`node tools/bench.js --write`). CI's `bench` workflow recomputes
   the scorecard from what you committed, so the numbers cannot be edited by
   hand, and prints the delta against `main`.

What the scorecard measures:

| Metric | Meaning |
| --- | --- |
| **Cost** | How many times cheaper an answer is than loading every source |
| **Routing** | The share of questions whose first card already holds the answer |
| **Fidelity** | The share of gold facts retrieved within budget |
| **Forbidden values** | Wrong values that came back — garbled figures, stale dates |
| **Graph health** | Orphans, links per node, aliases per node |

**The acceptance rule: an improvement must never lower fidelity or introduce a
forbidden value, whatever it saves.** Cheaper answers that lose facts are a
regression. Trade-offs among the other numbers are argued in the PR.

## Rules come with guards

The vault's defect discipline applies to contributors too. Every defect — and
every new rule — is closed in four steps:

1. fix the instance;
2. find the root cause — why the vault allowed it;
3. prevent the class with a mechanical guard where one is possible: a
   `selftest.js` test for tooling, the builder for content, `audit.js` for
   heuristics;
4. record it in `tools/DEFECTS.md`, and cite its ID in the guard's code.
   `selftest.js` fails a row whose guard does not cite it.

A row looks like this:

| ID | Date | Defect | Root cause | Fix | Guard |
| --- | --- | --- | --- | --- | --- |
| D84 | 2026-09-24 | The build called the benchmark's own drawing stray | The drawing check ran before note homes were consulted | `NESTED_VAULTS`, checked first | selftest |

Take the next free ID. A rule with no guard is a hope.

## Why CI runs the audit

Inside a vault, the audit runs only when its owner types `/vault-audit` —
the agent never starts it on its own (D78). CI running `node tools/audit.js` on a
pull request is not a contradiction: it is a machine running a script because
a person asked it to, which is the same as typing the command.

## What a pull request must pass

- [ ] `node tools/selftest.js` — all green
- [ ] `node tools/build-index.js` — `PROBLEMS: none`, and the committed index
      is current (CI diffs `wiki/` after the build)
- [ ] `node tools/audit.js` — no problems
- [ ] `node tools/scan-private.js` — clean
- [ ] a new rule arrives with its guard and a `DEFECTS.md` row
- [ ] a method change carries its recompiled bench and scorecard
- [ ] a MAJOR change carries its `UPGRADING.md` entry

## Versioning

The version is in `VERSION`. For a vault template, semver means:

| Bump | Means | Examples |
| --- | --- | --- |
| **MAJOR** | An existing vault fails its build until it is migrated | frontmatter keys, folder rules, the index file format, a cap that shrinks |
| **MINOR** | New rules, tools or skills; existing vaults still build clean | a new skill, a new check that only warns, a new optional plugin |
| **PATCH** | Fixes and wording | a guard's regex, docs, a defect row |

Each MAJOR release says how to migrate in [UPGRADING.md](UPGRADING.md).

## Licensing of contributions

Inbound equals outbound: anything you contribute is licensed under the
repository's MIT licence. There is no contributor licence agreement.

## Credit

Every accepted improvement is named in the release notes with its author and
its scorecard delta, and the README's **How the method has improved** table
grows a row for each release that moved the numbers. The architecture's credit
to Vifert stays at the top of every `AGENTS.md`.

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
