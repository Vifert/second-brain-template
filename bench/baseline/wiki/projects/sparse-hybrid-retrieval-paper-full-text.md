---
title: Sparse and Hybrid Retrieval for Personal Field Notes — Full Text
summary: The full text of Mira's workshop paper as written, every section, table and appendix, with the two disagreeing note counts recorded on both sides.
aliases: [the paper in full, the paper full text, paper appendix, example queries, error analysis, 12400 notes, 12040 notes, the note count, reproducing the results, synthetic collection]
topic: projects
kind: detail
verbatim: true
source: raw/papers/sparse-retrieval.md
tags: [field/information-retrieval, method/bm25, method/hybrid-retrieval, domain/personal-knowledge-management, venue/workshop-personal-knowledge-systems, form/full-text]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- ***Sparse and Hybrid Retrieval for Personal Field Notes* is reproduced here in full**, from the compiled source and as written.
- **The paper gives its collection size twice and the two figures differ** — 12,400 in the abstract, 12,040 in the Table 1 caption. Both are left exactly as printed, with a neutral note on each.
- **Every table is reproduced as a markdown table**, including Appendix A's example queries and the best method for each.
- **The one editorial addition anywhere in this node is the bracketed `[added: …]` note on each side of the note-count disagreement**; nothing else is changed from the source.
- **The number-of-notes question was still open with [[priya-raman|Priya Raman]]** as of 2 April 2026, so neither figure is marked as the right one.

## Source Text

Reproduced from `raw/papers/sparse-retrieval.md`. The heading below is the
document's own title line. Casing, punctuation and the source's own wording stand
as printed; the only additions are the two labelled `[added: …]` notes on the
collection size.

# Sparse and Hybrid Retrieval for Personal Field Notes

**Authors:** Mira Okafor, Priya Raman, Tomas Lind

**Venue:** Workshop on Personal Knowledge Systems 2026

## Abstract

People keep large collections of short personal notes, but finding one again is
hard. We compare sparse retrieval (BM25), dense retrieval, and a hybrid of the
two on a collection of 12,400 notes [added: the abstract gives 12,400; Table 1
gives 12,040] written by eleven volunteers over two
years. The hybrid method gives the best ranking quality, and the gap is largest
on short, vague queries.

## 1. Introduction

Personal notes differ from web documents: they are short, full of private
shorthand, and rarely titled. Sparse methods match the shorthand exactly;
dense methods match meaning. We ask whether combining them helps.

A note written in a hurry — "ring M re: boiler, thurs" — shares almost no words
with the query its author types a month later ("when is the plumber coming").
A dense model can bridge that gap; it can also miss the one rare token, such as
a name or a code, that makes the note findable. Our question is practical:
what should a personal notes tool use by default?

Our contributions are a comparison of the three methods on real personal notes
with queries written by the notes' own authors, a breakdown by query type, and
a short error analysis of where each method fails.

## 2. Related Work

**Desktop search.** Early desktop search studies found that people re-find
their own documents mostly by remembered context — when, where, with whom —
rather than by content words. Those studies worked with files and email, which
have titles, senders and dates; field notes often have none of these.

**Lifelogging.** Lifelogging research retrieves moments from continuous
captures such as photos and location traces, and its shared evaluation tasks
reward recall of events. Our notes are written deliberately, so they are
sparser than a lifelog but denser in meaning per word.

**Hybrid retrieval.** Fusing sparse and dense rankings is well established for
web and question-answering collections, where reciprocal rank fusion is a
strong, parameter-light baseline. To our knowledge it has not been measured on
personal notes, where both the documents and the queries are unusually short.

**Personal knowledge management.** Tools for personal knowledge management
increasingly add semantic search. Their evaluations are usually user studies of
satisfaction rather than ranking quality against known relevant notes.

## 3. Data

Volunteers exported their notes and wrote queries for notes they remembered
writing. Each query has one relevant note.

Eleven volunteers took part: four students, five people in technical jobs and
two retired. Notes came from phone note apps, plain text files and one paper
notebook that its owner transcribed. The median note is 31 words long; a
quarter are under ten words. Each volunteer wrote between 20 and 40 queries,
without looking at their notes first, and then marked the note they had meant.
Queries are a median of four words.

We removed notes that contained only a link, and duplicates made by syncing the
same note twice. Personal names were kept, since they matter for retrieval; the
collection is not released, and only aggregate results are reported here.

## 4. Methods

- **BM25**: standard sparse retrieval over the note text.
- **Dense**: a sentence-embedding model, cosine similarity.
- **Hybrid**: reciprocal rank fusion of the two lists.

For BM25 we used the common defaults and a tokenizer that keeps digits and
hyphenated tokens whole, because notes are full of times, dates and codes. The
dense model is an off-the-shelf English sentence-embedding model; we did not
fine-tune it. The hybrid fuses the top 100 results of each method with the
usual fusion constant of 60.

## 5. Results

**Table 1.** Retrieval quality on 12,040 notes. [added: Table 1 gives 12,040;
the abstract gives 12,400]

| Method | nDCG@10 | Recall@20 |
| --- | --- | --- |
| BM25 | 0.61 | 0.72 |
| Dense | 0.68 | 0.79 |
| Hybrid | 0.74 | 0.86 |

The hybrid improves nDCG@10 by 0.13 over BM25 and by 0.06 over dense retrieval.

**Table 2.** nDCG@10 by query type.

| Query type | Share of queries | BM25 | Dense | Hybrid |
| --- | --- | --- | --- | --- |
| Short and vague (1–3 words) | 38% | 0.52 | 0.63 | 0.71 |
| Names, codes or shorthand | 27% | 0.70 | 0.59 | 0.76 |
| Longer descriptions | 35% | 0.64 | 0.78 | 0.77 |

Dense retrieval wins on longer descriptions, where the query restates the
note's meaning in other words. BM25 wins on names and codes, where one rare
token decides the match. The hybrid is best or within 0.01 of the best on every
type, and its largest gain over both single methods is on short, vague
queries.

## 6. Error Analysis

We read the 50 queries where the hybrid ranked the relevant note lowest.

- **Dates written differently** (19 queries): the note says "thurs" or
  "the 14th" and the query says a month and day. Neither method links them.
- **Private nicknames** (12): a person or place called something only its
  author uses. BM25 finds these only when the query uses the same nickname.
- **Near-duplicate notes** (11): the relevant note is one of several almost
  identical notes, such as weekly shopping lists, and the method ranks a
  sibling first.
- **Other** (8): typos, and queries about a note's photo rather than its text.

## 7. Limitations

Eleven volunteers is a small and self-selected group, all writing in English.
Each query has a single relevant note, which undercounts methods that return
another equally useful note. We did not test any method that uses a note's
date or folder, which the error analysis suggests matters most.

## 8. Conclusion

For personal notes, a simple fusion of sparse and dense retrieval is a strong
default. Future work: queries that mix dates and names.

## Appendix A. Example queries

Queries are shown as the volunteers typed them, with the relevant note
paraphrased to protect its author.

| Query | Relevant note (paraphrased) | Best method |
| --- | --- | --- |
| boiler | a reminder to ring a plumber about the boiler on Thursday | BM25 |
| that pasta thing | a recipe for a baked pasta with lemon and ricotta | Dense |
| JK flat keys | where a friend's spare flat keys are hidden | BM25 |
| what the doctor said about my knee | notes from a physiotherapy appointment | Dense |
| train times york | a list of weekend trains to York | Hybrid |
| birthday ideas for dad | a list of gift ideas, written a year earlier | Hybrid |

## Appendix B. Reproducing the results

The code for all three methods, the fusion and the evaluation is released with
the paper. The notes are not, since they belong to the volunteers. A synthetic
collection of the same size and note-length distribution is released instead,
so the pipeline can be run end to end; its numbers differ from those reported
here and should not be compared with them.

## Acknowledgements

We thank the eleven volunteers for their notes and their patience, and the
Leeds Data Meetup for an early audience.

## Discrepancy Record

One internal disagreement, left unresolved because the source does not settle it:

| What | Abstract | Table 1 caption | State |
| --- | --- | --- | --- |
| Size of the collection | 12,400 notes | 12,040 notes | Open with [[priya-raman|Priya Raman]] as of 2 April 2026 |

Raised by [[tomas-lind|Tomas Lind]] on 26 March 2026. Neither side carries a
`[sic]`, because the right figure is not beyond doubt; once
[[mira-identity|Mira Okafor]] settles it, the wrong side gets
`[sic — X per Mira Okafor, date]` and the other note comes out.

## Related

- [[sparse-hybrid-retrieval-paper|the paper's hub]] — the distilled version, and the status of the submission.
- [[priya-raman|Priya Raman]] — co-author, and who owns the dataset fix.
- [[journal-2026-03|journal March 2026]] — the draft's original table problems, as found on 9 March.
