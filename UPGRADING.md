# Upgrading a vault between major versions

A MAJOR release changes something an existing vault's build depends on —
frontmatter keys, folder rules, the index format, a cap that shrinks — so a
vault set up from an earlier major fails its build until it is migrated. Each
major gets a section here: what changed, why, and the exact steps, including a
command where one exists. Minor and patch releases never need a migration.

Your vault records the version it was set up from in `HANDOFF.md` under
**Setup**.

## 1.x

The first public major. Nothing to migrate from.
