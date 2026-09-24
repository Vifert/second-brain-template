---
name: vault-tailor
description: Fit this vault to its owner's own use — study the template's design, interview the owner in rounds, then propose and build the skills, subagents and rules their use needs. Use once during setup, and whenever the owner asks to adapt, extend or re-tailor the vault.
---

# Tailor the vault to its owner

This vault is a foundation. Its rules, skills and tools were built for one
person's use: capture everything about a life, and answer any question about
it for a few hundred tokens. Your owner's use may differ. A researcher who
explores a new topic every day needs a research procedure and rules for
sources; someone preparing for interviews needs their notes shaped for
rehearsal; a work-only vault needs rules about what may leave the machine.
This skill finds out what your owner needs, and fits the vault to it without
breaking what makes it cheap and safe.

Work through the five steps in order. During setup (`SETUP.md` § 2) run all
five; § 4, the building, waits until the base setup is done (`SETUP.md` § 12).
When it runs again later, start by reading `HANDOFF.md` § Decisions for what earlier
tailoring settled, and interview only about what has changed.

## 1. Understand the whole design first

**Do not ask your owner a single question until you understand how every part
of this vault works** — the owner's order, not a suggestion. You cannot propose
good additions to a design you only half understand, and the reasons behind the
rules are spread across the rules, the skills, the ledger of what broke and the
tooling notes.

1. **Read the design, in full** — about 87,000 tokens at version 1.0.0
   (September 2026); reading every file of the template would be about
   390,000, most of it code and the benchmark's corpus, and is not needed:
   - `CLAUDE.md`, the four `.claude/rules/` files, `HANDOFF.md` and `SETUP.md`
     — what the vault runs by;
   - every skill in `.claude/skills/` with its `references/` — this file's
     `references/extending.md` is the guide for adding to the vault —, the two
     agents in `.claude/agents/`, `.claude/settings.json` and `tools/hooks/`;
   - `tools/README.md` and `tools/DEFECTS.md` — what each tool guarantees,
     and every rule's reason: each exists because something broke;
   - every node in `wiki/tooling/` — the architecture, the query ladder and its
     costs, the capture protocol, the image and drawing rules, NotebookLM;
   - `docs/how-it-works.md`, `bench/README.md` and the baseline scorecard,
     `bench/results/baseline.json`.
2. **Prove you understand how all of it works.** Write a study brief to
   `output/tailor-study.md` (outside the query path) that explains, in your own
   words, each point below, and names the file or files each explanation comes
   from:
   - how a question is answered cheaply: the five index files, the query
     ladder and what each rung costs, and what is banned at query time;
   - the node kinds, the one hard cap and why bodies are uncapped;
   - how a capture flows in — the capture table, logs, daily notes, `raw/`
     and a compile — and how a correction is swept and fenced;
   - what every skill does, who may start it, and why each is a skill;
   - what each agent, hook and rules file does, and when each loads;
   - what the builder, the self-test and the audit each check, and how a
     defect becomes a guard and a ledger row;
   - how drawings, images and NotebookLM fit, and what the benchmark measures.
3. **Close every gap.** Any point you cannot explain with confidence goes back
   to the files — the code in `tools/`, a wiki node, a ledger row — until it is
   clear. A point you only guessed at is a gap. The study is done when every
   point is explained and sourced.
4. **Account for it.** Before the first round, tell your owner in one line that
   the study is done and where the brief is, and record it in `HANDOFF.md`.

You will draw on the brief all through the interview, to explain the vault to
your owner in plain words whenever a question needs it.

**When this skill runs again later**, in a vault that has grown, study the
machinery the same way — including anything the owner added since, such as
their own skills and rules files — and reach the owner's notes through
`wiki/_index.tsv` (every node's summary and tags), reading a note only where a
question needs it.

## 2. Interview the owner

*The interview method below is adapted from Matt Pocock's `grilling` skill
(https://github.com/mattpocock/skills, MIT License, © 2026 Matt Pocock; the
notice is at the end of this file). Follow it exactly.*

Interview the user relentlessly until reaching a shared understanding. Map this as a design tree: every decision branches into the decisions that hang off it.
Work the tree in rounds. The frontier is every decision whose prerequisites are already settled: the questions you can ask now without guessing at answers you haven’t heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.
Format a round like so:
[❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>]
Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a later round, not this one.
Finding facts is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent or check it yourself to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report or you to finish looking it up yourself; ask the rest of the frontier now. The decisions are the user's: put each to them and wait.
The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.

**The branches this tree must reach.** Start from these; follow wherever the
answers lead:

- **During setup, first**: a vault they already have, or a new one — this
  picks `SETUP.md` § 4A or § 4B — and every fact in `SETUP.md` § 3 (name,
  optional pronouns, work kept separable, topics, answer style, spelling,
  NotebookLM, share links, GitHub).
- **What the vault is for, day to day**: what they will put in, how often,
  and from where (typing, daily notes, files, web pages, meetings).
- **What they will ask of it**: the questions they expect to ask, how precise
  the answers must be, and which are frequent enough to deserve a procedure.
- **Recurring work** that could become a skill: a daily research run, meeting
  or interview preparation, a weekly review, a report built from the logs.
- **Work to delegate** that could become a subagent: reading sources in
  parallel, checking claims, gathering material, with what it may and may not
  touch.
- **Rules of their own**: how sources are cited, what counts as verified, what
  must never leave the machine, naming, tone, anything they correct you on
  twice.
- **Cost and control**: which procedures are expensive enough that only they
  should start them, and how much a task may spend.
- **Their agent and harness**: Claude Code, Codex or another — it decides what
  a skill, subagent or hook can be (`references/extending.md` § Other agents).

## 3. Propose

When the frontier is empty, state the shared understanding back in a short
paragraph and ask your owner to confirm it, or correct it. Propose nothing
until they confirm. Then propose a numbered
list of additions. For each: what it is (skill, subagent, rules file, topic,
capture-table row, probe terms, hook), what it does for them, when it loads
and roughly what it costs in tokens per session or per use, and how its rules
are guarded. Prefer the smallest change that meets the need; say which of
their needs the existing vault already covers. Then ask which to build.

## 4. Build what they chose

One addition at a time, following `references/extending.md`:

- **A skill** is modelled on the vault's own: a `SKILL.md` with a
  description that says exactly when to use it, the procedure in numbered
  steps, and `disable-model-invocation: true` only when your owner wants to be
  the one who starts it — usually because it is expensive.
- **A subagent** is read-only unless it must write, carries its own brief,
  and sets `omitClaudeMd: true` so it does not pay for the whole manual.
- **A rule** goes where it loads only when needed: a `.claude/rules/` file
  with `paths:` when it concerns certain files, `CLAUDE.md` only when every
  session needs it. Every new rule gets a mechanical guard — the builder, the
  self-test or a hook — and a row in `tools/DEFECTS.md` (this vault's own
  rows start at D90); a rule no code can check is written as one and marked
  so.
- **A topic** is registered in `tools/build-index.js` before any node uses it,
  with a folder icon.

After each: `node tools/selftest.js` and `node tools/build-index.js` must pass.

## 5. Record it

In `HANDOFF.md`: one line per addition under Decisions, with why; the
interview's outcome and anything deliberately not built under the session
entry. Then tell your owner, in a few lines, what changed and how to use it —
and that they can run `/vault-tailor` again whenever their needs change.

---

The interview method in § 2 is adapted from `grilling`, in
https://github.com/mattpocock/skills, under this licence:

```
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
