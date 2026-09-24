# Maintaining

Guidelines for the maintainers of this repository. Contributors want
[CONTRIBUTING.md](CONTRIBUTING.md).

## The two repositories

Vifert's private vault is where the method is used every day; this public
template is where it is shared. **A change is made and proven in the vault
first, then ported here** — the vault is the only place a rule meets real
notes, real questions and real mistakes. A contribution that arrives here
first is reviewed here, and ported back to the vault once merged.

## Porting a change

- **Files kept identical** in both: `tools/lib/excalidraw.js` and
  `tools/lib/writechecks.js`. Copy them across.
- **Files that exist only here**: `tools/bench.js`, `tools/lib/bench.js`,
  `tools/install-excalidraw.js`, `tools/scan-private.js`.
- **Everything else is generalised**: `build-index.js`, `audit.js`,
  `excalidraw.js`, `selftest.js` and `lib/` take a `VAULT_ROOT` and the owner
  from `OWNER`, and carry no one's topics, people or client names. Port the
  change by hand, not by copying the file.
- **The ledger**: D01–D79 are shared; from D80 each repository numbers its
  own. A new template row that ships moves `OWNER_DEFECTS_FROM` in
  `tools/lib/rules.js` on with it, so the credit's count stays the template's.
  A ported row takes the next free ID here and names the vault's ID —
  "(the vault's D81)" — and its guard code cites the new ID. The row keeps its
  lesson and loses its specifics — no people, employers, clients, papers,
  figures, projects or code names from the vault.
- **The personal-data sweep**, before every commit of a port:

      node tools/scan-private.js --against <path to the private vault>

  The plain scan catches addresses, paths and ids; `--against` also catches
  any distinctive term from the vault's own index — a colleague's name, a
  table name, a paper's figure. CI can only run the plain scan, because it has
  no access to the vault, so **this step is the maintainer's**. Then read the
  diff.
- **A conventional commit**, as for any PR.

## Reviewing a pull request

- The checklist in the PR template, all of it.
- **Does a rule come with its guard?** A rule in `CLAUDE.md` with no code that
  enforces it goes back.
- **Is a benchmark claim reproducible?** CI recomputes the scorecard from the
  committed compile. For a large claim, also compile the bench yourself from
  the PR's branch (`node tools/bench.js --prepare`) and compare: the committed
  `bench/baseline/` could have been edited by hand after its compile, and only
  a fresh compile shows that.
- **Does it lower fidelity or bring back a forbidden value?** Then it is not
  an improvement, whatever it saves.
- **Does it name a plugin the template does not ship?** The template
  documents four — Excalidraw, Calendar, Iconize and Templater — and no
  others.

## Cutting a release

1. Merge release-please's pull request; it bumps `VERSION`, `CITATION.cff` and
   `CHANGELOG.md` from the commit titles.
2. Check the GitHub Release it creates reads well; add the contributors'
   scorecard deltas to its notes.
3. If the benchmark moved, add a row to the README's **How the method has
   improved** table.
4. Copy `bench/results/baseline.json` to
   `bench/results/history/<version>.json` and commit it.

## Bumping Excalidraw

1. Read the new release's asset digests:

       gh api repos/zsviczian/obsidian-excalidraw-plugin/releases/tags/<v> --jq '.assets[] | "\(.name) \(.digest)"'

2. Update `PIN` in `tools/install-excalidraw.js` — the version and the three
   SHA-256 digests.
3. Run what the render workflow runs, locally:
   `node tools/install-excalidraw.js --force`, `node tools/excalidraw.js check`,
   and lint every drawing.
4. Commit as `fix: pin Excalidraw <v>`.

## Triage

- Label every new issue within a week.
- `good first issue` only for work a stranger can finish without asking.
- Questions about Obsidian or a plugin go upstream, politely.
- A proposal without a scorecard plan moves to Discussions → Ideas until it
  has one.

## Standing reminders

- **GitHub Sponsors.** Revisit adding a Sponsor button once the repository has
  users (Vifert, 23 September 2026). There is deliberately no
  `.github/FUNDING.yml` until then.
