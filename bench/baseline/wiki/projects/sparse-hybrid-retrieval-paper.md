---
title: Sparse and Hybrid Retrieval for Personal Field Notes
summary: Mira's workshop paper with Priya Raman and Tomas Lind comparing BM25, dense and hybrid retrieval on personal notes; the hybrid wins, most clearly on short vague queries.
aliases: [the retrieval paper, my paper, the workshop paper, sparse and hybrid retrieval, personal field notes, hybrid retrieval, BM25 versus dense, reciprocal rank fusion, Workshop on Personal Knowledge Systems, my publication, what is my paper about]
topic: projects
kind: hub
status: pending
tags: [field/information-retrieval, method/bm25, method/hybrid-retrieval, method/reciprocal-rank-fusion, method/ndcg, domain/personal-knowledge-management, venue/workshop-personal-knowledge-systems, activity/publication]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Status as of 2 April 2026**: the paper was submitted a day before the 3 April deadline, with camera-ready due in May if it is accepted.
- **The paper compares BM25, dense retrieval and a hybrid of the two** on a collection of personal notes written by eleven volunteers over two years, with queries written by the notes' own authors.
- **The hybrid wins**: nDCG@10 of 0.74 against 0.68 for dense and 0.61 for BM25, and it is best or within 0.01 of best on every query type.
- **Which method wins depends on the query**: dense retrieval wins on longer descriptions, BM25 on names and codes where one rare token decides the match, and the hybrid's largest gain over both is on short vague queries.
- **The hybrid is deliberately simple** — reciprocal rank fusion of the top 100 results of each method, with the usual fusion constant of 60, and no fine-tuning.
- **The paper's authors are [[mira-identity|Mira Okafor]], [[priya-raman|Priya Raman]] and [[tomas-lind|Tomas Lind]]**, in that order, for the Workshop on Personal Knowledge Systems 2026.
- **The paper's own note count disagrees with itself** — the abstract gives 12,400 notes and Table 1 gives 12,040 — and that question was still open with [[priya-raman|Priya Raman]] on 2 April 2026.

## What it argues

Personal notes are short, full of private shorthand, and rarely titled. Sparse
methods match the shorthand exactly; dense methods match meaning. The paper's
practical question is what a personal notes tool should use by default, and its
answer is a simple fusion of the two.

Its worked example is a note written in a hurry — "ring M re: boiler, thurs" —
which shares almost no words with the query its author types a month later, "when
is the plumber coming". A dense model bridges that gap, and can also miss the one
rare token, such as a name or a code, that makes a note findable.

## Results

**Table 1** — retrieval quality:

| Method | nDCG@10 | Recall@20 |
| --- | --- | --- |
| BM25 | 0.61 | 0.72 |
| Dense | 0.68 | 0.79 |
| Hybrid | 0.74 | 0.86 |

**Table 2** — nDCG@10 by query type:

| Query type | Share | BM25 | Dense | Hybrid |
| --- | --- | --- | --- | --- |
| Short and vague (1–3 words) | 38% | 0.52 | 0.63 | 0.71 |
| Names, codes or shorthand | 27% | 0.70 | 0.59 | 0.76 |
| Longer descriptions | 35% | 0.64 | 0.78 | 0.77 |

Where the hybrid still fails, the paper's error analysis of the 50 worst queries
blames dates written differently (19), private nicknames (12), near-duplicate
notes (11) and other causes including typos (8).

## The dataset

Eleven volunteers — four students, five in technical jobs, two retired — exported
their notes and each wrote between 20 and 40 queries without looking at their
notes first, then marked the note they had meant. The median note is 31 words and
a quarter are under ten; queries are a median of four words. The collection is not
released, only a synthetic one of the same size and note-length distribution.

## The discrepancy in it

The paper states the size of the collection twice and the two figures differ:

| Where | What it gives |
| --- | --- |
| Abstract | 12,400 notes |
| Table 1 caption | 12,040 notes |

[[tomas-lind|Tomas Lind]] caught this on 26 March 2026 — "the abstract and the
results table do not say the same number of notes, and a reviewer will notice" —
and [[priya-raman|Priya Raman]] owns the fix. As of 2 April 2026, after
[[priya-raman|Priya Raman]] had fixed the table order and the caption,
[[mira-identity|Mira Okafor]]'s own note was that the number-of-notes question
was still open and needed checking with her. **Neither figure is treated as
correct here**; both are recorded as the source prints them in
[[sparse-hybrid-retrieval-paper-full-text|the full text]].

## Who wrote what

- **[[mira-identity|Mira Okafor]]** — first author; the related-work section on
  lifelogging and earlier desktop-search studies.
- **[[priya-raman|Priya Raman]]** — the framing, the dataset description, and the
  Section 4 table; she also gave the Leeds Data Meetup talk on it on 25 April
  2026, where the hybrid results drew the most questions.
- **[[tomas-lind|Tomas Lind]]** — third author, and the reader who caught the
  dataset problem.

## Status Log

| As of | Status | Source |
| --- | --- | --- |
| 2026-03-09 | Draft received from Priya Raman; Section 4's table order and column labels flagged | Journal, 9 March 2026 |
| 2026-03-26 | Draft read by Tomas Lind; the dataset description needs the note count reconciled, Priya Raman owns it | 1:1, 26 March 2026 |
| 2026-04-02 | Submitted to the workshop, a day before the 3 April deadline; camera-ready due in May if accepted | Journal, 2 April 2026 |

## Related

- [[sparse-hybrid-retrieval-paper-full-text|the paper, in full]] — every section, table and appendix as written.
- [[priya-raman|Priya Raman]] — co-author, and who owns the dataset fix.
- [[tomas-lind|Tomas Lind]] — third author.
- [[education-and-certifications|Mira's education]] — the MSc dissertation on re-finding in personal email archives that this work follows from.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 9, 16 and 26 March, and [[journal-2026-04|journal April 2026]], entries 2 and 9 April.
