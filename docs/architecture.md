# The architecture

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/architecture-dark.png">
  <img alt="How the second brain works: capture, the wiki graph, the build, the index layer and the query ladder, with the guards beneath" src="assets/architecture.png">
</picture>

The drawing is `Excalidraw/tooling/second-brain-architecture.excalidraw.md`,
editable in Obsidian. It argues that the five stages are a one-way pipeline
with a single validating step in the middle: nothing reaches the index layer
except through `tools/build-index.js`, and nothing reaches an answer except
through the index.

Below is the same drawing as text — the transcription the vault itself
retrieves from, in `wiki/tooling/second-brain-architecture.md` — so every box,
arrow and label is searchable.

```mermaid
flowchart LR
  subgraph n1["1 — Capture"]
    n2(["You,<br>in Obsidian"])
    n3["Daily note<br>raw/daily/YYYY-MM-DD.md"]
    n4["PDF, DOCX, URL<br>raw/"]
    n5["Drawing<br>Excalidraw/<topic>/<br>vault-excalidraw skill"]
  end
  subgraph n6["2 — The graph: wiki/"]
    n7["/vault-compile<br>verbatim → logs<br>facts → nodes"]
    n8["nodes, one per concept<br>hub · detail · log<br>person · idea · decision"]
    n9["Answer surface — capped<br>8 bullets · 1500 bytes"]
    n10["Body — uncapped<br>full detail, exact lines"]
    n11["Figures<br>images and live drawings,<br>transcribed"]
  end
  subgraph n12["3 — Build"]
    n13["node tools/build-index.js<br>builder AND validator"]
  end
  subgraph n14["4 — The index layer"]
    n15["_index.tsv — route"]
    n16["_cards.tsv — answer"]
    n17["_sections.tsv — line ranges"]
    n18["_links.tsv — edges"]
    n19["_mentions.tsv — people"]
    n20["profile/now.md — status"]
  end
  subgraph n21["5 — Answering a question"]
    n22(["A question"])
    n23["L0 — route<br>grep _index.tsv · ~50–180 tokens"]
    n24["L1 — card<br>one _cards.tsv row · ~220 tokens"]
    n25["L2 — section<br>sed an exact range · ~300–600"]
    n26["L3 — the whole node (rare)"]
  end
  subgraph n27["Guards — nothing ships unchecked"]
    n28["node tools/selftest.js<br>regression tests — the<br>tooling itself is sound"]
    n29["tools/probes.json<br>routing probes · must-route<br>fences, replayed by the build"]
    n30["/vault-audit · /vault-deep-audit<br>node tools/audit.js<br>11 sections, on request"]
    n31["tools/DEFECTS.md<br>D01–D79 inherited, each<br>with a guard in code"]
    n32["git — private repo<br>one commit a session<br>Obsidian setup versioned"]
  end
  n33["NotebookLM — grounded second reader<br>triage the batch · verify the compile · never a source (D74)"]
  n2 --> n3
  n2 --> n4
  n2 --> n5
  n3 --> n7
  n4 --> n7
  n5 --> n11
  n7 --> n8
  n8 --> n9
  n8 --> n10
  n13 --> n16
  n22 --> n23
  n23 --> n24
  n24 --> n25
  n25 --> n26
  n14 --> n23
  n29 --> n30
  n30 --> n31
  n8 --> n13
  n11 --> n13
  n4 -. triage .-> n33
  n33 -. verify .-> n7
```

Read alongside the flowchart:

- **Subtitle**: "Capture may be slow; answering must be cheap — 30–50× cheaper
  than loading the sources."
- **1 — Capture**: "A capture left in raw/ warns the build until you type
  /vault-compile (D68)."
- **2 — The graph**: "One concept per node, with aliases for how you would ask,
  and volatile status in one `## Status Log`."
- **3 — Build**: "Runs in the same step that writes content. A stale index is
  the worst failure mode: it routes queries down the expensive path." And:
  "Refuses an oversized answer surface, a broken link, a flat tag, an
  untranscribed drawing, a rewritten log entry, a corrected claim, an unlinked
  person, a drifted setting."
- **4 — The index layer**: "Sections, edges and mention rows — every one
  generated, none written by hand, all grepped and never read whole." And:
  "Now is built from the open Status Logs, so the status card cannot drift."
- **5 — Answering a question**: "Side paths: `_links` for neighbours,
  `_mentions` for a person over time, Now for 'what's my status?'" And: "Stop
  at the first rung that answers. Target: 30–50× cheaper than loading the
  sources."
- **NotebookLM** sits outside every stage, in amber, reached by two dashed
  arrows: `raw/` documents go to it for **triage** before a compile is planned,
  and its findings go back into **/vault-compile** as verification candidates. Dashed
  because it is advisory — it is consulted, never part of the pipeline, and a
  claim is never attributed to it (D74).
- **Guards**: "Nothing is committed until the self-test and the build pass; the
  audit runs when you type /vault-audit. Every defect is fixed, root-caused,
  guarded in code, written into CLAUDE.md and ledgered." And: "The audit replays
  the benchmark queries and fails if answering stops being 30× cheaper than the
  sources."
- **Legend** (under the guards): "Dashed border — a skill only you start, by
  typing it: /vault-compile, /vault-audit, /vault-deep-audit. Claude may start
  vault-excalidraw on its own. Captures, the build and the self-test are never
  gated." The two dashed purple boxes, **/vault-compile** and the audit box, are
  those gated skills (D78).

Colour carries meaning, so it survives here: orange is the owner's own input,
purple is a process Claude runs, blue is the main path, green is generated or
committed output, cyan is depth (body, figures, the deeper rungs), red is the
defect ledger, amber is an outside instrument that advises but never decides. Grey dashed boxes are stages, not files; a dashed purple box is a skill only the owner starts. The drawing carries no
counts on purpose, so it never goes stale; live figures come from `/vault-audit`.

For how each stage works and why, read [how-it-works.md](how-it-works.md).
