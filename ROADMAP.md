# Roadmap — where help is wanted

The method is young. Each direction below names the problem, the benchmark
numbers it should move, and one concrete place to start. The numbers to beat
are in `bench/results/baseline.json`; at 1.0.0 they are **27× cheaper than
loading the sources, 66.7% routing, 69.4% fidelity, no forbidden values**.

## Token efficiency

Every answer pays for the first grep's matching rows before it reads a card,
and a common term like a project name matches a dozen rows. Answers to
questions about the busiest topics cost the most.

- **Moves**: cost, routing.
- **Start here**: can routing reach the right card first *without* adding more
  aliases? On the baseline, "when did Tidewater go to staging" matches sixteen
  rows and none of their cards carries the staging date.

## Ingestion fidelity

A compile must keep every fact, flag every contradiction and invent nothing.
The baseline keeps a fact in the day's log but gives it no node or alias, so
the ladder never finds it: Mira's 5 km time and the book she is reading exist
only in her daily notes.

- **Moves**: fidelity, forbidden values.
- **Start here**: a compile rule — and a guard — for personal facts in daily
  notes that no node owns. Or a card that carries a paper's second headline
  metric: the baseline's paper card gives nDCG but not Recall@20.

## Links, tags and nodes

Node boundaries, facet schemes and neighbourhoods decide what a single card
can answer.

- **Moves**: graph health, routing.
- **Start here**: does a different facet scheme raise routing? On the
  baseline, "what are my skills" routes to the vault's own skills node, not
  Mira's CV — a collision a better naming or tagging rule would avoid.

## New capture sources

The vault compiles markdown, PDFs and daily notes. Email, web clippers, voice
notes and chat exports each need a capture path and a compile rule.

- **Moves**: fidelity, on questions about the new source.
- **Start here**: a benchmark source for an email export, with gold questions
  about it, in a pull request of its own (see `bench/README.md` on changing
  the gold questions).

## Other agents

The vault runs under any coding agent: `AGENTS.md` is the manual they all read
(Claude Code through `CLAUDE.md`), and the skills, read-only agents and hooks
are generated from `.claude/` for Codex and Gemini CLI (D90–D93). But it was
built and measured with Claude Code only. Nothing yet says what the cost ratio
or the fidelity is under Codex, Gemini or anything else, and the Codex hooks and
agents are checked by unit tests, not by a live run.

- **Moves**: all of them, measured under a different agent.
- **Start here**: set up a vault with Codex or another agent following
  `SETUP.md` (§ 4C for its steps), compile the benchmark with it, and report the
  scorecard — and whether the hooks fired.

## Other languages

The prose rules, the US/UK spelling variants and the first-person aliases
assume English.

- **Moves**: routing and fidelity, on a benchmark in another language.
- **Start here**: make the spelling-variant machinery in `tools/lib/text.js`
  pluggable per language, with English as the default.

## How to propose

Open an issue with the **Improvement Proposal** form: the problem, your
hypothesis, what changes, which numbers should move and by how much, and what
might get worse. Then read [CONTRIBUTING.md](CONTRIBUTING.md#improving-the-method)
for how a proposal becomes a measured pull request.
