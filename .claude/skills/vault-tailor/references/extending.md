# Extending the vault

This vault is a foundation. It was built for one use — capture everything about
a life, and answer any question about it for a few hundred tokens — and your
use may need more: a research routine, interview preparation, rules for a
work-only vault. This page is for the agent that adds those pieces, usually
through `/vault-tailor`, whose folder it lives in so it travels with the skill. It explains how the existing pieces are designed, so a
new one keeps the vault as cheap to query and as hard to break as it is now.

## Where a new piece goes

Every piece costs something, and the costs differ. Pick the cheapest home that
does the job.

| You need… | It becomes… | It costs… | Model it on |
| --- | --- | --- | --- |
| a fact, a note, a record | a wiki node, routed through the index | nothing until a question needs it | any node in `wiki/` |
| a rule every session must follow | a line in `CLAUDE.md` | its tokens in every session and every subagent | `CLAUDE.md` § People |
| a rule about certain files | a `.claude/rules/` file with `paths:` | nothing until a matching file is read | `.claude/rules/images-drawings.md` |
| a procedure you repeat | a skill | its one-line description every turn; its body only when used | `.claude/skills/` |
| work to hand off with its own context | a subagent | its own run, not your context | `.claude/agents/` |
| a mistake that must never recur | a guard — the builder, the self-test or a hook — and a ledger row | nothing at query time | `tools/DEFECTS.md` |

Two tests decide most cases:

- **Could code check it?** Then it is a guard, and the rule text only explains
  it. "A rule without a guard is a hope" (`CLAUDE.md` § Defect Discipline).
- **Does every session need it?** If not, it does not belong in `CLAUDE.md`.
  The core is paid on every turn by every session and every subagent.

## Keeping queries cheap

Whatever you add must stay inside the query ladder (`CLAUDE.md` § Query
Protocol): route on `wiki/_index.tsv`, pull one card, then at most one section.

- **New kinds of content go into nodes**, with a capped answer surface, a
  discriminating `summary` and aliases in the owner's words — never into files
  a question would have to read whole.
- **A new topic is registered** in `tools/build-index.js` (`LABELS`, `TOPICS`)
  before any node uses it, and gets a folder icon.
- **Output that answers no future question** — a research brief, a prep sheet,
  a report — goes to `output/`, which is outside the query path.
- **Add probe terms** to `tools/probes.json` for the questions the owner will
  ask, so a routing failure is caught once and never silently returns.

## Writing a skill

Look at the six that ship. Each teaches a pattern:

| Skill | Pattern |
| --- | --- |
| `vault-compile` | a long, expensive procedure the owner starts; verified by an independent pass |
| `vault-audit` | runs tools into a file and reports in a fixed short shape |
| `vault-deep-audit` | a superset of another skill; dispatches read-only subagents in waves of two |
| `vault-handoff` | end-of-session upkeep; records reasoning, not just actions |
| `vault-excalidraw` | a tool-driven, round-by-round skill Claude may start itself |
| `vault-tailor` | an interview in rounds, then a proposal, then building what was chosen |

A skill is `.claude/skills/<name>/SKILL.md`:

```markdown
---
name: research-topic
description: Research one topic for the owner — plan, gather sources through the source-reader agent, verify, and file the result as research nodes. Use when the owner says "research …" or types /research-topic.
disable-model-invocation: true   # only when the owner wants to be the one who starts it
---

# Research a topic

Why this skill exists, in two sentences.

1. **Step** — what to do, and what "done" looks like.
2. …

## Why it is built this way
The decisions a later session must not undo.
```

- **The description is in context on every turn**, so keep it to what the
  skill does and exactly when to use it.
- **Gate a skill** (`disable-model-invocation: true`) when it is expensive or
  consequential and the owner wants to choose when it runs. The vault gates the
  compile, both audits and the handoff; it leaves drawing and tailoring open.
- **Name the checks** the skill ends with — the self-test and the build — and
  what it records in `HANDOFF.md`.

## Writing a subagent

A subagent is `.claude/agents/<name>.md`:

```markdown
---
name: source-reader
description: Reads the sources for one research question and returns cited claims. Read-only.
tools: Read, Grep, Glob, WebFetch
model: sonnet
omitClaudeMd: true
---

You read sources for a research question. You never edit a file.
(Its whole brief: what to read, what to return, what never to do.)
```

- **Read-only by default.** Give it write tools only when writing is its job.
- **`omitClaudeMd: true`**, with the brief it needs written into the agent:
  otherwise it loads the whole manual on every run.
- **Run subagents in waves of two.** Wide parallel runs hit usage limits and
  lose their work.

## Writing a rules file

`.claude/rules/<name>.md`, starting with the files it governs:

```markdown
---
paths:
  - "wiki/research/**"
---

Rules for research nodes. They load when a file under wiki/research/ is read.
```

The self-test fails a rules file without `paths:` — one would load at launch
and undo the split. Add a line for it to the table in `CLAUDE.md` § Rules That
Load By Path, so a session knows it exists before it loads.

## Guards and the ledger

A new rule the builder or the self-test can check gets a check: a problem
message in `tools/build-index.js` or `tools/lib/`, or a test in
`tools/selftest.js`, that cites a new ID. Then it gets a row in
`tools/DEFECTS.md` — ID, date, defect, root cause, fix, guard. This vault's own
rows start at **D90**. A hook (`tools/hooks/`, registered in
`.claude/settings.json`) is for a trap in how the agent works, not in the
content — a command it must never run, a file format it must never write.

## Three worked sketches

These are shapes to adapt, not features that ship.

### A researcher who explores a new topic every day

- **Topic** `research/`, one hub per topic, a `detail` node per important
  source.
- **Skill** `/research-topic <topic>`, gated because it spends: plan the
  questions, dispatch the source reader, verify each claim against its source,
  write the hub and details, rebuild.
- **Subagent** `source-reader`, read-only, `omitClaudeMd`: fetches and reads
  sources and returns claims with their URL and the date read.
- **Rules file** `.claude/rules/research.md` for `wiki/research/**`: every claim
  cites its source; a quotation is marked as one; a source's date of access is
  recorded. **Guard**: the builder fails a research node without a `sources:`
  field (D90).
- **Capture row**: "research X" → run the skill.

### Someone preparing for meetings or interviews

- **Skill** `/prep <meeting or interview>`: find everything relevant the cheap
  way — `_mentions.tsv` for a person over time, dated `_sections.tsv` ranges for
  what happened — then write a one-page brief to `output/prep/`, outside the
  query path, with every point traced to its node.
- **Topic** `interviews/` or a project topic for the target, with a Status Log
  for where things stand, so the Now page shows it.
- **Probes** for the questions they will rehearse.

### A vault kept only for work

- **An engagement topic** — one topic for the work, with its own `decisions/`
  and `worklog/`, registered in `tools/build-index.js` — so the work can be
  archived or removed as one folder.
- **Rules file** for `wiki/<engagement>/**`: what may leave the machine (no
  uploads to NotebookLM or the web unless the owner says so), where client names
  may appear.
- **Skill** `/weekly-report`: a report built from the week's dated log
  entries, written to `output/`.
- **Guard**: a `_forbidden` fence in `tools/probes.json` for any claim that
  must never be written, with the examples it must catch and pass.

## Other agents

The vault is built for Claude Code. Another agent — Codex or any other — can
run it with less enforcement. Map each piece to what that agent's harness
supports, and tell the owner what degrades.

| In Claude Code | What it does | If the harness has no equivalent |
| --- | --- | --- |
| `CLAUDE.md` | rules every session reads | Put the same rules where that agent reads them — `AGENTS.md` for agents that read it. |
| `.claude/rules/` with `paths:` | rules that load only for certain files | Point to each file from the always-read rules, and read it before writing where it applies. |
| Skills (`SKILL.md`) | procedures loaded on use | Keep the files; the agent reads the one it needs when asked. |
| `disable-model-invocation` | only the owner starts a procedure | A written rule: "never start this unless the owner asks". It is a rule without a guard. |
| Subagents | work in a separate context | The agent does the step itself, one at a time. |
| Hooks | block a command or a file before harm | A written rule, with the builder and the self-test as the backstop: run them after every write. |
| The tools in `tools/` | build, validate, test | Unchanged — they are plain Node.js and run under any agent. |
