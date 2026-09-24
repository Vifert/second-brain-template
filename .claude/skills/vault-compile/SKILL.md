---
name: vault-compile
description: Compile what is waiting in raw/ into the wiki — daily notes, PDFs and documents, notes made in Obsidian, imports — word for word where the rules say verbatim, checked against the source, then moved to raw/_compiled/. With no argument it takes the next batch of the compile plan in HANDOFF.md, compiles everything if little is waiting, or writes a plan first if a lot is. Name a file or folder to compile only that.
argument-hint: "[file or folder in raw/ …]"
disable-model-invocation: true
---

# Compile raw/ into the wiki

The owner typed `/vault-compile`, so compiling is authorised for this run
(`CLAUDE.md` § Compile and Audit, D78). Compile cost is never the metric;
fidelity is. If this session has not read `CLAUDE.md` and `HANDOFF.md`, read
them first.

Arguments: `$ARGUMENTS`

## 1. Decide what this run compiles

Run `node tools/build-index.js`. Its "capture(s) waiting in raw/" warning lists
everything in `raw/` outside `raw/_compiled/`.

- **Paths were given** — compile exactly those files or folders, nothing else.
- **No paths, and `HANDOFF.md` has a compile plan** (a checklist of batches
  under Open Threads) — compile the next unticked batch.
- **No paths and no plan** — measure what is waiting before deciding; do not
  eyeball it:

  ```sh
  find raw -type f -not -path 'raw/_compiled/*' -not -name '.gitkeep' | wc -l
  find raw -type f -not -path 'raw/_compiled/*' -not -name '.gitkeep' -printf '%s\n' | awk '{n+=$1} END {print n" bytes"}'
  ```

  - **Up to 20 files and under 60 KB in total** — compile all of it in this run.
  - **More than either** — triage first (§ 4, NotebookLM optional) and stop.
    Group what waits into batches, ordered so that original sources come before
    notes distilled from them (`raw/sources/` before `raw/import/` in a
    converted vault) and context comes before what depends on it. A batch is
    about 10–20 notes, or one document over 20 KB on its own. Write the plan
    into `HANDOFF.md` under Open Threads as a checklist, one line per batch
    naming its paths. Show it to the
    owner, and compile batch 1 only after they say yes.
  - **When the two tests disagree with your judgement, follow the tests.**
    Forty three-line notes look trivial and still took a quarter of an hour and
    a session's tokens to compile properly on 19 September 2026. The owner gated
    this command to choose when that is spent, so a plan he can say yes to is
    the cheap move; an unasked-for compile is the expensive one.
- **Nothing waiting** — say so in one line and stop.

## 2. The procedure, per document

For a batch of several files, **triage first** (§ 4): ask how they
group and what connects them, so the compile is ordered and no document is
routed to the wrong topic. Optional, and it shapes only the plan.

1. Read the raw file with the right extractor — see § 6, Machine notes. **For a
   folder of code, establish provenance before calling anything mine** (D61):
   read `git remote -v`, the LICENSE and the README of every sub-folder. A
   clone, a book's companion code or a tutorial is recorded as study material;
   when the evidence is suggestive but not conclusive, record the evidence and
   ask me. The session-6 archive compile credited a book's chapter notebooks
   to my coursework because it read folder names, not remotes.
2. **Preserve, do not just summarise.** Dated material becomes log entries
   verbatim. Named entities land in a `detail` node. A document's full text
   (a paper, a report, a resume) becomes a `<slug>-full-text` detail node marked
   `verbatim: true`, with `source:` naming the raw file (D64), sectioned as the original is, with every table as markdown
   and every kept figure transcribed (`.claude/rules/images-drawings.md` § Images). Mark the source's own slips
   [sic] and record internal contradictions rather than resolving them. **A
   slip is certain; a contradiction is not** (D51): `[sic]` goes only where the
   right form is beyond doubt (a typo, "93475%" beside "93.47%"). Where two
   places in the source disagree, give each a neutral `[added: … gives …]`
   note and list it in the discrepancy record — a `[sic]` on one side quietly
   picks it, as one did in Vifert's vault on the very figure he later confirmed.
   Once I settle one, the wrong side gets `[sic — X per {{OWNER_NAME}}, date]`. Do
   not transcribe third parties' contact details (emails, phone numbers).
   **Verbatim means verbatim**: only whitespace and line-break hyphenation may
   change. Casing, punctuation, URLs and the source's own typos stay as
   printed; any added emphasis or note is labelled as added.
   Then write the hub that distils it — every claim in it traceable to the
   source, no superlative the source does not make.
3. Route each concept to a topic folder, creating one if needed.
4. Rebuild the index layer and confirm it validates clean.
5. **Verify against the source before committing** (D38): an independent pass
   compares the full text, every figure transcription and every hub claim
   with the original, and a skeptic tries to refute each finding; fix what
   survives. Dispatch the pass as the `vault-fidelity-verifier` agent, with the
   source path and the node paths: it is read-only and skips `CLAUDE.md`,
   carrying only its own brief (D87). A paper compile in Vifert's vault passed the builder and still carried
   27 fidelity defects that only this pass found. **NotebookLM may be one of the
   readers in this pass** (§ 4): it is grounded and cites, so it is good
   at catching a number that drifted — but it raises candidates only, and the
   source settles every one of them.
6. Move the source into `raw/_compiled/` — and treat it as deleted from that
   moment on, because it may be.

When a batch compiles notes distilled from sources that were compiled earlier
— a converted vault's old notes after its `raw/sources/` — read every note in
full, capture only what the sources lack (the owner's own thoughts, things from
chats, later edits), and record any disagreement between a note and its source
in the discrepancy record rather than resolving it.

## 3. Daily notes

**A daily note is a capture, not a node.** Its `## Work` bullets become
that date's entry in the engagement's worklog (or the journal's, when no
engagement has its own topic), its other section the journal's, word for
word and in date order. Then compile it like any source: every file, job,
person and status it names is distilled into the nodes it touches, status
changes become Status Log rows, and anything that contradicts the vault is
swept and recorded. The builder warns and the audit fails while anything waits
in `raw/` outside `_compiled/` (D68).

## 4. NotebookLM

NotebookLM is a **compile instrument** — never part of the query path, never a
source. It answers only from the sources it is handed, with citations, which
makes it a good second reader of a document being compiled and a bad witness,
because it has no notion of a claim this vault later corrected.

Measured in Vifert's vault on 2026-09-18 against known ground truth: sixteen
table values exact, two dated log entries reproduced character for character,
and a paper's internal contradiction found in all three places and flagged. In
the same session it also reported a person's corrected employer — faithfully,
because an old export it had been handed still said so, though that claim was
fenced in `probes.json`.

Use it at exactly two points in a compile, both optional:

- **Triage, before step 1.** Upload the batch and ask how the files group, what
  connects them, and what each one holds. This orders the compile and catches a
  document belonging to a topic I would not have guessed. It shapes the *plan*,
  never the content.
- **Verification, inside step 5** (D38). Ask it to check each figure
  transcription, table and hub claim against the source it cites. It raises
  candidates; the source settles them.

The rules that keep it from doing harm:

- **It never settles anything.** Every finding is confirmed against the file in
  `raw/` before it changes a node, and the node cites that file. The builder
  fails a claim attributed to NotebookLM, or carrying a notebook id, outside a
  log or a verbatim node (D74).
- **Ask adversarially or the answer is unreliable.** A fidelity question names
  the places to check, demands each quoted separately, and requires an explicit
  statement about disagreement — "report every place X appears and say whether
  they differ", never "what does the paper say about X". Asked casually in the
  same session it printed a paper's misprinted figure with no flag; asked pointedly it
  caught it. The phrasing, not the model, decides whether fidelity survives.
- **A notebook is disposable.** Delete it when the compile ends. It has no
  correction layer, so one kept around drifts from the vault silently, and its
  id names nothing a later session can verify.
- **Never in the query path.** A card lookup is 92 ms and ~220 tokens, offline
  and deterministic; a notebook query is 18–23 s, needs auth, is rate-limited,
  and runs on undocumented Google endpoints. The index wins on every axis.
- **Whether compile sources may go to NotebookLM is my decision, made once**
  and recorded here: {{NOTEBOOKLM_POLICY}}. Uploading a source sends it to
  Google under my account, so work, client or family material needs my yes
  before it goes. Do not re-ask once it is recorded. The repo stays private as ever.
- **Known limits** (notebooklm-py 0.8.2): a PDF near 1.7 MB fails at
  `upload_finalize`; a failed add leaves a zombie source to delete by hand;
  chat-generated XLSX and PPTX reach the Studio panel but no `download`
  subcommand retrieves them.

The `notebooklm` skill is global, not in this repo. `wiki/tooling/notebooklm-compile-support.md`
is the retrievable version of this part of the skill.

## 5. Finish

- `node tools/build-index.js` validates clean (its waiting warning may still
  list what later batches will compile).
- Tick the batch in `HANDOFF.md` if it came from the plan.
- Report to the owner in a few lines: nodes created and changed, log entries
  appended, sources moved, each uncertainty as a question, what still waits
  and how many batches remain.
- Do not run `node tools/audit.js`, and do not start the next batch: each is
  the owner's to start (D78).
- Anything found broken during the compile is a defect: `CLAUDE.md` § Defect
  Discipline.

## 6. Machine notes for compiling

Moved here from `CLAUDE.md` § Working Notes, since only a compile needs them
(D87). Rewrite any that stops being true on this machine.

- **PDF and image tooling** (`pip install --user pymupdf pdfplumber pdfminer.six
  python-pptx pillow`): **PyMuPDF** (`import pymupdf`) for reading-order text, page
  rendering, figure crops (`page.get_pixmap(dpi=200, clip=rect)`) and embedded
  images; **pdfplumber** and PyMuPDF's `find_tables()` for tables;
  **pdfminer.six**; **python-pptx**; **Pillow**. {{PDF_TOOLING_NOTE}}
- **`pdftoppm` is deliberately not installed.** On Windows it comes only as a
  third-party Poppler binary, and PyMuPDF does everything it does.
- **The Read tool renders PNG/JPG**, which is how figures get transcribed during
  a compile. It never reads an image at query time.
