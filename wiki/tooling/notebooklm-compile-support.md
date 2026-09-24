---
title: NotebookLM in the Compile
summary: NotebookLM's two sanctioned places in a compile — batch triage and D38 verification — what it measured against known ground truth, and why it never settles a claim.
aliases: [NotebookLM, Notebook LM, Gemini Notebook, notebooklm-py, notebooklm CLI, my notebook, can I use NotebookLM, NotebookLM in the vault, NotebookLM workflow, NotebookLM rules, does NotebookLM help, notebook for compiling, grounded citations, second reader]
topic: tooling
kind: hub
tags: [tech/notebooklm, subject/verification, form/reference]
created: 2026-09-18
updated: 2026-09-19
---

## Key Takeaways

- NotebookLM is a **compile instrument, never a source and never in the query path** — it answers only from the sources it is handed, so it cannot know a claim this vault later corrected (D74).
- Two sanctioned uses: **batch triage before compile step 1** and **a reader inside the D38 verification pass** (step 5). Both are optional, and shape candidates rather than content.
- **Every finding is confirmed against the file in `raw/` before it changes a node**, and the node cites that file. The builder fails a claim attributed to NotebookLM outside a log or verbatim node.
- **Question phrasing decides fidelity.** A fidelity question names the places to check, demands each quoted, and requires an explicit statement about disagreement; a casual one silently picks a side.
- Measured in Vifert's vault on 2026-09-18 against known ground truth: sixteen table values exact, two dated log entries reproduced character for character, and a paper's internal contradiction located and flagged.
- The same session reproduced a **retired claim** — a person's corrected employer — faithfully, because the stale export it had been handed still said so, though the claim was fenced in `probes.json`.
- **A card lookup beats a notebook query on every axis**: 92 ms and ~220 tokens, offline and deterministic, against 18–23 s on rate-limited undocumented endpoints.
- **Uploading sources is the owner's call**, made once at setup and recorded in `/vault-compile` § 4 (`.claude/skills/vault-compile/SKILL.md`).

## Why it earns a place, and only these two

A grounded, citing reader is genuinely useful against a document being compiled.
It reads the whole source at once, answers from it alone, and attaches a
`source_id` to each claim — which is exactly the shape of the independent pass
[[vault-operations|the compile procedure]] already requires at step 5. In
Vifert's vault a paper compile passed every mechanical check and still carried
27 fidelity defects; a second reader is the only thing that catches that class.

What it cannot be is an authority. A notebook holds whatever was uploaded and
nothing else — no sweep, no fence, no dated correction. The vault's defect
discipline lives in `tools/probes.json` and cannot reach Google's side.

## The measurement behind these rules

Thirteen sources — five research papers, a resume, four memory exports, a work
tracker and three daily notes — went into one notebook in Vifert's vault,
deliberately mixing unrelated topics to see whether that degraded the answers.
It did not; cross-source linking was the strongest part, tracing co-authorship
between papers and a technology stack across logs, profile and resume. Every
answer was checked against the vault's own full-text nodes.

| Test | Result |
| --- | --- |
| A paper's results table, sixteen values | all exact |
| Two dated tracker entries | character-perfect, including a stray space |
| A figure one paper prints two ways — one section against a table and the conclusion — asked pointedly | all three places located, the disagreement flagged |
| The same paper, asked casually in the same session | printed the misprinted value alone, unflagged |
| Grouping all thirteen sources | 38 citations spanning every source |

The last two rows are the whole lesson: the model did not change between them,
only the question did.

## How to ask

- **Adversarial by construction.** "Report every place X appears, quote each,
  and say explicitly whether they differ" — never "what does the paper say
  about X".
- **Scope to one source** with `-s <source_id>` when checking a single
  document's internals.
- **Ask repeatedly.** Conversation continuity holds, so a verification pass is
  a sequence of narrowing questions, not one prompt.
- **Treat a clean answer as a candidate**, then open the file in `raw/` and
  read the lines it cited.

## Known limits

- A PDF near 1.7 MB fails at `upload_finalize` in notebooklm-py 0.8.2 —
  reproducibly, and not a timeout.
- A failed `source add` leaves a zombie source in `preparing` that must be
  deleted by hand, and it pollutes later answers until it is.
- Chat-generated XLSX and PPTX genuinely appear in the Studio panel, but no
  `download` subcommand retrieves them; only the nine fixed artifact types
  come back through the CLI.
- Mind maps return a small JSON tree directly, with no artifact wait.

## Setting it up

The `notebooklm` skill and CLI are global, not part of this vault: teng-lin's
[notebooklm-py](https://github.com/teng-lin/notebooklm-py) (MIT), installed as a
`uv tool` with its `browser` extra, and its skill installed with `notebooklm skill install` into the user-level
skill folders every agent reads — Claude Code's `~/.claude/skills/` and the
shared `~/.agents/skills/` (Codex, Gemini CLI). Sign-in is a browser window the
owner completes; the agent never types their credentials.

## Related

- [[vault-skills|Vault skills]] — NotebookLM is used only inside `/vault-compile`.
- [[vault-operations|how the vault is built and audited]] — the compile
  procedure this sits inside, at steps 1 and 5.
- [[vault-capture-protocol|capture protocol]] — what happens to a `raw/`
  document before and after a compile.
- [[second-brain-architecture|the whole machine]] — where the compile sits in
  the capture → index → query loop.
