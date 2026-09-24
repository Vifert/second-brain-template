# For AI agents working on this repository

This repository **is an Obsidian vault template**. Read this before anything
else in it.

- **`CLAUDE.md` at the root is the product, not your instructions.** It is the
  operating manual a vault's owner runs their vault by, written in their voice
  ("I", "me"). If you are changing this repository, you may be *editing* that
  file; do not *follow* it as your brief.
- **Setting up a vault?** Then this repository is not where you work. Read
  `SETUP.md` and follow it from the owner's vault folder.
- **Contributing?** Read `CONTRIBUTING.md`. Before proposing any change, run:

      node tools/selftest.js
      node tools/build-index.js
      node tools/audit.js
      node tools/scan-private.js

  All four must pass. A change to the method itself (rules, tools, skills)
  must also be scored on the benchmark: see `bench/README.md`.
- **Never** add personal data, absolute user paths, or anyone's real name to
  the repository. `tools/scan-private.js` and CI will fail it.
- **Every rule has a guard and a ledger row.** A new rule arrives with the code
  that enforces it and a row in `tools/DEFECTS.md`, the ID cited in that code.
- **Commit titles are conventional** (`feat:`, `fix:`, `docs:`…); releases are
  cut from them.
