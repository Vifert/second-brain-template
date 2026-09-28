---
name: vault-tailor
description: You MUST always use this skill during setup (SETUP.md sends you here once the base vault builds, before any compiling), and whenever the owner asks to adapt, extend or re-tailor the vault, or asks for help with recurring work in their life or job. It studies the vault's design and what already exists about the owner, offers them a free talk about their days and weeks, grills them with that context, then proposes — and builds what they choose — skills, skill chains, automations, subagents and rules for any part of their life, each recording its results in the vault, and only those that make a noticeable difference.
---

<!-- Generated from .claude/skills/vault-tailor/SKILL.md by node tools/agents-sync.js — edit that file, not this one. -->

# Tailor the vault to its owner

This vault is a foundation. Its rules, skills and tools were built for one
person's use: capture everything about a life, and answer any question about
it for a few hundred tokens. But the agent that runs it can do far more than
file notes. It can take work off the owner's plate across their whole life —
plan their day from their calendar, catch them up on their field's news, sort
their finance email, prepare them for the week's meetings — whatever their own
days and weeks actually hold, with every result recorded in the vault so
nothing is lost. This skill gets to know the owner, proposes only what would
make a noticeable difference, and builds what they choose, without breaking
what makes the vault cheap and safe.

Work through the six steps in order. **During setup**, `SETUP.md` sends you
here once the base vault builds clean and before anything is compiled
(`SETUP.md` § 4A.6 or § 4B.4): run all six then. The setup facts — name,
topics, spelling, NotebookLM, GitHub and the rest — belong to `SETUP.md`'s own
interview (§ 2); never ask them here. **On a later run**, read `HANDOFF.md`
§ Tailoring and § Decisions first, and ask only about what has changed.

## 1. Study

### 1a. The design — always

**Do not ask your owner a single question until you understand how every part
of this vault works** — the owner's order, not a suggestion. You cannot propose
good additions to a design you only half understand, and the reasons behind the
rules are spread across the rules, the skills, the ledger of what broke and the
tooling notes. If this setup already wrote `output/tailor-study.md` and nothing
in the design has changed since, it stands — go on to 1b.

1. **Read the design, in full** — about 87,000 tokens at version 1.0.0
   (September 2026); reading every file of the template would be about
   390,000, most of it code and the benchmark's corpus, and is not needed:
   - `AGENTS.md` (which `CLAUDE.md` imports), the four `.claude/rules/` files, `HANDOFF.md` and `SETUP.md`
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

You will draw on the brief all through the interview, to explain the vault to
your owner in plain words whenever a question needs it.

### 1b. What already exists about the owner

What you can learn before asking anything depends on the case:

- **An existing vault, during setup.** It is plain linked Markdown — no index,
  no rules, no code of ours — still in the owner's own folders, because
  tailoring runs before `SETUP.md` § 4A.7 moves the notes into `raw/`. Survey
  it cheaply: the folder tree and how many notes each holds; the note titles;
  the tags and aliases in their frontmatter; the most-linked notes, counting
  `[[links]]` with a short script in a scratch folder outside the vault; the
  most recently edited notes (when every file carries the same date, as a
  copied or synced vault can, go by the dates in daily-note names instead);
  their daily notes, if they keep them. Then read a small sample in full — the
  ten or so most-linked and most recent — for what the owner actually tracks
  and does. A vault of a few dozen notes can simply be read whole; in a large
  one, never read every note.
- **A new vault, during setup.** Nothing to read yet.
- **A later run, in a vault built on this architecture.** `HANDOFF.md`
  § Tailoring and § Decisions, then the owner's notes through
  `wiki/_index.tsv` (every node's summary and tags), reading a note only where
  a question needs it; and the machinery as it is now, including any skills or
  rules the owner added since.

Add what you learned to the study brief under **The owner**, each point naming
the note it came from. Then tell your owner in one line that the study is
done and where the brief is.

## 2. Offer the free talk

**Always offer it** — whatever 1b found, even in a rich existing vault. It is
a suggestion, never a requirement, and it never replaces step 3: it only makes
your questions about them instead of about anyone. Say, in your own words:

> Before I ask you anything, would you like to tell me about your days and
> weeks, in your own words, for ten to twenty minutes? Everything you do, at
> work and outside it: what repeats, what you keep forgetting, what you dread
> or put off, and the apps and accounts behind it all. If you have a
> voice-to-text tool, just talk and paste the text in; if not, type it — in any
> order, as roughly as you like. It's optional: say "skip" and I'll go straight
> to my questions.

If they talk, let them finish without interrupting. Then ask whether they
would like the talk kept in `raw/` as a capture for `/vault-compile` — their
choice; if not, it lives only in this session. Either way, go on to step 3.

## 3. Grill the owner

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
answers lead. Build every question from the free talk and 1b: quote what they
said back to them, so each question is about their life, not a form.

- **Their days and weeks, work and personal**: what fills them, in the order
  it happens; what repeats daily, weekly, monthly.
- **Each recurring task**: what it is, how often, how long it takes, what is
  tedious or error-prone about it, and whether they forget, dread or put it
  off.
- **What they would hand off**, and what they would never hand off.
- **The tools and accounts behind each task** — calendar, email, messaging,
  finance, code hosts, video, news — and which of them this agent can already
  reach. Finding that out is your job: check the connectors and tools
  available to you in this session yourself, never ask the owner.
- **Tasks with separate steps**, where one skill could gather, the next
  summarise, a third file the result — candidates for a skill chain.
- **What should happen without being asked**, and when — candidates for an
  automation.
- **Delegable reading or checking** that could become a subagent, with what it
  may and may not touch.
- **Rules of their own**: how sources are cited, what counts as verified, what
  must never leave the machine, naming, tone, anything they correct you on
  twice.
- **Cost and control**: which procedures are expensive enough that only they
  should start them, and how much a task or a month of automations may spend.
- **Their agent and harness**: Claude Code, Codex or another — it decides what
  a skill, subagent, hook or schedule can be (`references/extending.md`
  § Other agents).
- **On a later run**: what has changed since the last dated line in
  `HANDOFF.md` § Tailoring, and whether anything waiting on a connector can
  now be built.

## 4. Propose

When the frontier is empty, state the shared understanding back in a short
paragraph and ask your owner to confirm it, or correct it. Propose nothing
until they confirm. Then propose a numbered list, each item in this shape:

```markdown
**1. Plan my day** — a skill (or: a skill chain `gather-agenda → plan-day`; an automation; a subagent; a rules file; a topic; a capture-table row; probe terms; a hook)
- **Takes over**: "every morning I copy my calendar into a to-do list and still miss things" — your words, from the talk
- **How often · time saved**: every weekday · about 1 hour 15 minutes a week
- **Needs**: Google Calendar (connected); Gmail (missing — to connect it: …)
- **Cost**: about … tokens a run; guarded by …; records its plan in the journal
```

- **The bar.** Propose an item only if the task comes up at least weekly and
  saves real time, or it is something they said they forget, dread or put off.
  An automation must also be worth doing without being asked. A skill chain is
  judged as a whole, and proposed only when the task truly has separate steps
  — steps that are useful on their own, or that run at different times or
  with different tools; one skill is the default when one skill will do.
- **The owner's own rules come first.** Where one keeps something off the
  machine or out of the repository — work email, say — the item records only
  what that rule allows (a summary, a pointer, nothing), and says so under
  **Cost**.
- **Cost** is in tokens per run and per month, with anything else it spends.
- **Everything else** goes below the list as **Considered, not proposed**, one
  line each with the reason, so they can overrule you.
- **If nothing clears the bar**, say so and propose nothing. That is a good
  outcome, not a failure.
- **Say which needs the existing vault already covers**, and prefer the
  smallest change that meets each need.

Then ask which to build.

## 5. Build what they chose

First ask the building questions below — where each skill lives, how each
automation runs — for every chosen item together, in one round, so nothing
waits on them later. Then build one addition at a time, following
`references/extending.md`. For each:

- **Where a skill lives — ask every time.** Ask whether it should live in the
  vault only, or globally so it works from any folder; recommend one and do
  what they choose. Recommend the vault unless they clearly need it elsewhere:
  there it is versioned, copied to other agents by `agents-sync`, and rebuilt
  with the vault. A **global** skill keeps its source in the vault and is
  copied into the agent's user-level skills folder — `~/.claude/skills/` for
  Claude Code; for another agent, the folder its documentation names — and it
  still records its results in the vault by the vault's full path.
- **Every skill records its results in the vault** through the capture table
  in `AGENTS.md`: a day plan goes to the journal, a finance summary to its
  node, a news digest to its log — within the owner's own rules on what may
  leave the machine.
- **A skill chain** is several skills, each usable alone: each link's
  `SKILL.md` ends with a `## Next` section naming the skill it calls and
  exactly what it hands over. Build and test each link alone, then the chain.
- **How an automation runs — list every option, and they choose.** Say which
  ways exist on this owner's machine and agent — the agent's own scheduler
  (Claude Code has scheduled tasks), a cloud routine that runs while the
  computer is off, the operating system's scheduler (Task Scheduler on
  Windows, cron on Linux, launchd on macOS) running the agent in the
  background, or running it themselves when they want it — recommend one, and
  set up the one they choose. An automation is an ordinary skill or skill
  chain plus a schedule: it also runs by hand, the schedule starts the chain's
  first skill, no gated skill (compile, audits, handoff) is anywhere in it,
  and each run records its result in the vault. Set it up only after they
  approve its schedule and its estimated monthly cost. If their agent cannot
  run in the background, say so and offer it as a skill they start.
- **Connectors.** A skill whose connector is still missing is not built yet:
  it is recorded as *waiting on a connector*, with the steps to connect it, and
  a later run builds it. Your owner signs in to every account themselves; you
  never handle a password or a token.
- **A skill** is modelled on the vault's own: a `SKILL.md` with a description
  that says exactly when to use it, the procedure in numbered steps, and
  `disable-model-invocation: true` only when your owner wants to be the one
  who starts it — usually because it is expensive.
- **A subagent** is read-only unless it must write, carries its own brief,
  and sets `omitClaudeMd: true` so it does not pay for the whole manual.
- **A rule** goes where it loads only when needed: a `.claude/rules/` file
  with `paths:` when it concerns certain files, `AGENTS.md` only when every
  session needs it. Every new rule gets a mechanical guard — the builder, the
  self-test or a hook — and a row in `tools/DEFECTS.md` (this vault's own
  rows start at D200); a rule no code can check is written as one and marked
  so.
- **A topic** is registered in `tools/build-index.js` before any node uses it,
  with a folder icon.

After each: `node tools/selftest.js` and `node tools/build-index.js` must pass,
and `node tools/agents-sync.js` must run after any change to `.claude/`.

## 6. Record it

Under `## Tailoring` in `HANDOFF.md`, add this run's entry, newest last. Its
first line is dated, in exactly one of three forms:

```markdown
- **2026-09-28 — proposed**: …
- **2026-09-28 — nothing cleared the bar**: …
- **2026-09-28 — declined by the owner**
```

Beneath it: what was proposed, chosen, built, and considered but not proposed;
which skills are global; which automations run, how and when; and what waits
on a connector. Until the vault's first dated line exists, the build warns and
the audit fails (D95) — that is what stops a setup from reaching its compile
without ever proposing anything. Add one line per addition under § Decisions,
with why. Then tell your owner, in a few lines, what changed and how to use
it — and that they can run `/vault-tailor` again whenever their life or work
changes.

---

The interview method in § 3 is adapted from `grilling`, in
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
