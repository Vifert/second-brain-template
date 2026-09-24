# Knowledge Base Index

**12 nodes** across **8 topics**. Last updated 2026-09-24.

> [!tip] To look something up, route on `wiki/_index.tsv`, then pull one card from `wiki/_cards.tsv`.
> This page is human orientation. It is not the routing layer.

## Topics

### [[wiki/journal/_index|Journal]] · 0 nodes

Personal dated log — everything logged that is not the work of a self-contained engagement: life, learning, career, this vault. One file per month.

### [[wiki/people/_index|People]] · 0 nodes

Everyone the owner has mentioned — family, friends, colleagues, collaborators — with only the facts that were stated.

### [[wiki/projects/_index|Projects]] · 0 nodes

Things the owner has built or is building — each with what it does, how, and where it stands.

### [[wiki/learning/_index|Learning]] · 0 nodes

Courses, books, study and things worked out — what was learned, from what, and where it is recorded.

### [[wiki/career/_index|Career]] · 0 nodes

Roles, employers, skills, certifications, goals and the job search.

### [[wiki/ideas/_index|Ideas]] · 0 nodes

Idea dump — anything the owner might build or pursue, each with a status from seed through active to done.

### [[wiki/profile/_index|Profile]] · 2 nodes

Who the owner is: identity, current status (Now), and how they want Claude to respond.

### [[wiki/tooling/_index|Tooling]] · 10 nodes

The knowledge system itself — how this vault is built, how to capture into it, query it, draw in it and audit it.

## Start Here

- [[now|What is happening right now]]
- [[owner-identity|Who Owner is]]
- [[vault-capture-protocol|How to dump things in here]]
- [[second-brain-architecture|How this vault works]]

## Retrieval Layer

- `wiki/_index.tsv` — **12 rows**: path, title, topic, kind, status, aliases, tags, summary. Route here first.
- `wiki/_cards.tsv` — **12 rows**: path, title, and the full Key Takeaways block. Pull exactly one row.
- `wiki/_sections.tsv` — **74 rows**: path, heading, start line, end line, gist. Gives exact `sed` ranges with no discovery read.
- `wiki/_links.tsv` — **56 edges**: source, target. Neighbourhood expansion without reading articles.
- `wiki/_mentions.tsv` — **0 rows**: person, date, log, line range, snippet. Every dated log entry that names or links someone.

**Never read any of these whole. Always grep.**
