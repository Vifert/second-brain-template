---
name: vault-deep-audit
description: The expensive health check — everything /vault-audit does, plus whether anything is answerable only from raw/, judgement on every watch item, and a gap audit in which agents ask questions in your own words across work and personal topics. Give a topic (/vault-deep-audit journal) to limit the gap audit and its cost.
argument-hint: "[topic]"
disable-model-invocation: true
---

# Deep audit

The owner typed `/vault-deep-audit`, which includes `/vault-audit`: both are
authorised for this run (`CLAUDE.md` § Compile and Audit, D78). Topic:
`$ARGUMENTS` (empty means the whole vault).

## 1. The cheap audit first

Read `.claude/skills/vault-audit/SKILL.md` and do its §§ 1–2 (run the tools,
read the summary). Hold the report for the end.

## 2. Source independence

`raw/_compiled/` may be deleted at any time (`CLAUDE.md` § Source
Independence). Reading it is legitimate here: the owner asked for this check.

For each compiled document — every file under `raw/_compiled/`, or those
feeding the topic — pick three to five specific facts (a number, a name, a
date, a table value) and answer each through the Query Protocol (`_index.tsv`
route, one card, one `_sections.tsv` range) without opening `raw/`. A fact the
wiki cannot answer is a compile gap: record the file, the fact, and the node
where it belongs.

## 3. Judgement on watch items

For each watch item from § 1, say whether it is a real defect or correct as it
is — thin people stubs, for example, are correct: padding them would mean
inventing biography.

## 4. Gap audit

Tell the owner in one line how many agents will run and what they cover, then
proceed. Run agents in waves of two, never more — wide runs hit the usage
limit and lose everything. Split the topics (or the one topic) across agents.
Dispatch each as the `vault-gap-auditor` agent — read-only, it skips `CLAUDE.md`
and carries the query ladder in its own instructions (D87) — and give it the
vault path, its topics, and this brief:

> Write 15 questions the owner would plausibly ask about <topics>, in their
> own voice — first person, casual, the way they type ("when did I…", "who's my
> manager on…"). Cover both work and personal material. Answer each only
> through the query ladder in your instructions: route on `wiki/_index.tsv`, pull
> one `wiki/_cards.tsv` row, then at most one `wiki/_sections.tsv` range —
> never read `raw/`, never read a whole node for one fact. For each question
> report: answered / partial / not answered; the trace (files and rows read);
> roughly how many tokens you read; and for any miss, the cause — a missing
> alias, a missing node, a missing fact, or a broken card.

After each wave, give a skeptic — another `vault-gap-auditor` — that wave's
claimed misses:

> For each claimed miss, retry the query with two other phrasings through the
> same protocol, and grep the wiki for the fact. Report CONFIRMED (with the
> fix: the alias to add, or the fact to capture and the node for it) or
> REFUTED (with the route that works).

Report only confirmed misses.

## 5. Report

The `/vault-audit` report shape, then three more sections: **Only in raw/**
(the compile gaps from § 2), **Gap audit** (confirmed misses with their fixes,
and the answer rate — "27 of 30 answered, median trace ~250 tokens") and
**Watch items** (the verdicts from § 3).

Add a scope line that says exactly what was tested: which topics, how many
questions, how they split between work and personal material. Any coverage or
fidelity figure states what it was tested against (D12) — Vifert's vault once
claimed "100% fidelity" after testing only work-shaped entities.

End with "Which should I fix — numbers, "all", or "none"?"

## 6. Fix what they pick

As `/vault-audit` § 4. A routing miss gets its alias and its term goes into
`tools/probes.json`, so the failure can never silently return (`CLAUDE.md`
§ Query Protocol). A compile gap waits for the owner: capture it only if the fact
is in the vault's own words elsewhere; if it needs `raw/`, list it for
`/vault-compile`.
