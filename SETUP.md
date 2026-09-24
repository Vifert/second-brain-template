# SETUP — instructions for the setup agent

> **You are the reader of this file, not your user.** It tells you, the coding
> agent — Claude Code, Codex, or any other that reads `AGENTS.md` — how to set
> up a second-brain vault for the person you are working
> with and how to guide them through every step. They should never need to
> read it. Talk to them in plain language; explain what each step is for in a
> sentence; ask whenever a decision is theirs.
>
> **The architecture and workflow you are installing were designed and built by
> Vifert.** Whatever else you change, the credit block at the top of
> `AGENTS.md` stays exactly as it is, in every vault you set up (§ 11).

---

## 0. Read this first

**Read, in order**: this whole file, then `AGENTS.md` (the rules the vault runs
by; Claude Code has it already, through `CLAUDE.md`), then `tools/README.md` (what each tool guarantees), then
`wiki/tooling/second-brain-architecture.md` (the design in one page; its
drawing is transcribed in `second-brain-architecture-figure.md`, beside it). Do not start work until you have read
all four, and the four files in `.claude/rules/` that `AGENTS.md` points to —
Claude Code loads them only when a matching file is read, and other agents
not at all, but you will touch
every part of the vault. The rules are long on purpose; every one exists
because something broke — `tools/DEFECTS.md` says what, and why.

**Then understand how every part of it works before you ask your user
anything.** `.claude/skills/vault-tailor/SKILL.md` § 1 lists the design to read
in full — every skill and agent, the hooks, the tools' guarantees and the
ledger, the tooling nodes, the benchmark's summary — and has you prove it: a
sourced study brief in `output/tailor-study.md` explaining how each part works,
every gap closed by going back to the files. This vault is a foundation your
user will build on, and you cannot propose good additions to a design you do
not fully understand.

**What you are setting up, in one paragraph you can say to your user**: an
Obsidian vault where they capture anything and you compile it into a graph of
small notes ("nodes"). Each node starts with a short, capped summary (the
*answer surface*) and keeps every detail below it. Five generated index files
let you answer a question by reading a few hundred tokens instead of their whole
vault — 30–50× cheaper — without ever summarising anything away. Tools in
`tools/` build the index, validate every rule, audit the whole vault and test
themselves.

### Ground rules for the whole setup

1. **Never delete or overwrite your user's notes.** Back up before you change
   anything (§ 4A.2). The only things you delete are files *you* created that
   turn out to be wrong, and, at the very end, the working copy of `SETUP.md`
   (§ 12). If the machine blocks `rm` (some security policies do), never work
   around it — ask your user to delete, or leave the file and say so.
2. **Never type, read aloud or store a password, token or API key.** Sign-ins
   happen in a browser window your user completes (§ 7, § 9).
3. **Ask before anything outward-facing**: creating the GitHub repository,
   pushing, uploading anything to NotebookLM, installing software, changing
   system settings or PATH.
4. **Never guess a personal fact.** Name, pronouns, work, family, location —
   only what your user states. Unknown stays absent (`AGENTS.md` § People).
   Refer to your user by their name, or as "they", until they state pronouns.
5. **Edit files with your agent's edit tool, or with a script that writes bytes.** Never
   let a scripted edit rewrite a file's line endings (D76) — Python's
   `pathlib.write_text` does that on Windows. Anything containing backticks or
   backslashes goes through a file-writing tool, never a shell heredoc (D13).
6. **Obsidian should be closed while you edit anything in `.obsidian/`.** A
   running Obsidian writes its in-memory settings back over your edits (D69).
   When you need it closed, ask; when you are done, ask your user to reopen it.
7. **Verify after every phase** with the tools, exactly as each phase says. A
   phase is not done until its checks pass.
8. **Record progress in `HANDOFF.md` as you go.** Setup can take more than one
   session — your user may hit a usage limit, or you may ask them to restart
   their agent in another folder. A later session must be able to continue from
   `HANDOFF.md` alone. Put interview answers and "next step: § …" under
   `**Setup**:` in its Current State.
9. **The template folder is read-only.** Your user may have downloaded it
   anywhere (`D:\Downloads\second-brain-template`, say) and started you in
   their own vault. When converting a vault (§ 4A), copy from the template and
   never write inside it: no builds, no index files, no edits. Only § 4B, where
   the template becomes their vault, changes it. Before anything else, confirm
   with your user the full path of the vault this setup is for — normally the
   folder this session runs in. If you were started inside the template folder,
   ask for their vault's path and say you will work there.
10. **Know which agent you are, and say it.** The vault runs under any coding
   agent, but a few steps differ: restarting (§ 4A.5), hooks and trust (§ 4C),
   memory (§ 10). Record it in `HANDOFF.md` under `**Setup**:` as
   `Agent: Claude Code` (or `Codex`, or the agent's name). A step marked for
   one agent applies to that agent only; every other step applies to all.

---

## 1. Check the machine

Check each item and report the results to your user in one short list. Install
nothing without asking; when something is missing, say what it is for and offer
the command.

| Need | Check | Why | If missing |
| --- | --- | --- | --- |
| Node.js 18 or later | `node --version` | Runs every tool in `tools/` | Install the LTS from nodejs.org (or `winget install OpenJS.NodeJS.LTS`, `brew install node`) |
| git | `git --version` | Version control | git-scm.com (`winget install Git.Git`, `brew install git`) |
| git identity | `git config --global user.name` and `user.email` | Commits | Ask your user what to use; never invent it |
| Obsidian | Ask your user | They read and write the vault in it | obsidian.md |
| Excalidraw (required) | `node tools/install-excalidraw.js --check` | Drawings are made and rendered with its engine | Ask, then `node tools/install-excalidraw.js` |
| A Chromium browser (Edge, Chrome or Chromium) | `node tools/excalidraw.js check`, in the vault (§ 1 below) | Drawings are rendered and measured headless, offline | Any one; the tool tries each installed browser (D77) |
| GitHub MCP | Look for tools named like `mcp__github__create_repository` | Creating the private repo | Ask your user to set it up, or create the repo on github.com (§ 9) |
| Python 3.10+ (optional) | `python --version` or `python3 --version` | PDF, Word and PowerPoint extraction during compiles | python.org |
| uv (optional) | `uv --version` | Installs the NotebookLM CLI | § 7 |
| ripgrep (optional) | `rg --version` | Fast index greps | Claude Code's Grep tool works without it; other agents use `grep` |

The tools run in the vault this setup is for, never in the template folder
(ground rule 9): in § 4A once they are copied in (§ 4A.4), in § 4B in the
renamed template. There, check:

```sh
node tools/selftest.js      # must end "all green"
node tools/build-index.js   # must end "PROBLEMS: none" (waiting captures are expected)
node tools/excalidraw.js check
```

If any fails on this machine, stop and fix that first (§ 14). You never run
`node tools/audit.js` yourself: the audit is gated behind `/vault-audit`, which
only your user starts (`AGENTS.md` § Compile and Audit).

**Plugins.** Excalidraw is required: ask your user, then run
`node tools/install-excalidraw.js`, then `node tools/excalidraw.js check`, and
report the browser it names. Offer three more, installed by your user from
Obsidian's community browser (Settings → Community plugins → Browse) —
**Calendar** (daily notes land in `raw/daily/`), **Iconize** (the folder icons
the build checks) and **Templater** (the `templates/` folder). Their settings
already ship, so each works as soon as it is installed. For each they install,
add its id (`calendar`, `obsidian-icon-folder`, `templater-obsidian`) to
`.obsidian/community-plugins.json`, and record the choice in `HANDOFF.md`.
Restricted mode must be off for any community plugin to load.

**Platform notes.** Claude Code on Windows runs its shell through Git Bash:
use forward slashes and `/dev/null`. Other agents may use PowerShell there;
every tool is a plain `node` command and runs in either. Paths with spaces need quotes. On Windows
you cannot rename a folder that a running program is using as its working
directory — § 4B.2 plans around that.

---

## 2. The tailoring interview

Start the **`vault-tailor`** skill yourself now: invoke `/vault-tailor` if this
session has it, and otherwise — when you run in their existing vault, the
template's skills are not copied yet — read
`<template>/.claude/skills/vault-tailor/SKILL.md` and follow it. It interviews
your user in rounds, each question with your recommended answer, until you
both confirm a shared understanding of what their vault is for; then it
proposes additions fitted to that use.

Its first round decides which setup this is — **"Do you already keep an
Obsidian vault?"**:

- **Yes** → **§ 4A, converting their existing vault.** This is the usual case.
  Ask where it is (its full path) and what it is called. Their vault may have
  any name; nothing in this system depends on it.
- **No** → **§ 4B, turning this template into their vault.**

The interview must also settle every fact in § 3. Record each answer in
`HANDOFF.md` as you get it, and the proposal your user accepted. Run the
skill's §§ 1–3 now; its § 4, building the additions, waits for § 12, when the
base vault builds clean.

---

## 3. What the interview must settle

These are branches of the design tree in § 2 — ask each in the round where
its prerequisites are settled, with your recommended answer, and explain why
you are asking. Write the answers into `HANDOFF.md` as you get them. Anything
they decline to answer stays out.

1. **Name.** How should the vault refer to them? This goes into `OWNER.name`
   and the `{{OWNER_NAME}}` token.
2. **Pronouns — only if they want to state them.** Offer it as optional:
   "Would you like me to record your pronouns, so I never have to guess?"
   Recorded in `OWNER.pronouns`. If they skip it, leave `''` and use their name.
3. **What the vault is for.** Retrieval, an idea dump, a daily log, working
   together on projects — usually all four. Which matters most?
4. **Work.** Do they work for a client or an employer whose material should be
   kept separable — archivable as one folder? If yes, it becomes an
   **engagement topic** (§ 6.3): ask its name, a short lowercase prefix for its
   work log (`acme` → `acme-2026-09.md`), and whether its material may leave
   their machine (NotebookLM, § 7).
5. **Topics.** Show the starter topics — `profile`, `people`, `journal`,
   `ideas`, `projects`, `learning`, `career`, `tooling` — and ask what to
   rename, drop or add. Suggest from what you learn: research papers →
   `research`; a band, a sport, a garden → its own topic. In § 4A, their
   existing folders are the best hint. Keep `profile`, `people`, `journal` and
   `tooling`: the tools and AGENTS.md depend on them.
6. **How answers should read.** Short or detailed? Code only for coding
   questions? Tables or prose? This goes on their identity card.
7. **Anything about themselves they want on the identity card** — what they do,
   where they are based. Optional; record exactly what they say.
8. **Spelling.** Do they write one spelling and type another (British prose,
   American queries)? If yes, § 6.6.
9. **NotebookLM.** Do they want it (§ 7)? If yes, what may be uploaded to it
   — nothing personal, anything except work material, or anything? The answer
   is written into `.claude/skills/vault-compile/SKILL.md` § 4 as
   `{{NOTEBOOKLM_POLICY}}`.
10. **Drawing share links.** May a drawing go to excalidraw.com as an encrypted
    share link when they ask for one? (AGENTS.md already says "only when I ask".)
11. **GitHub.** Their GitHub username, and a name for the private repository —
    suggest the vault's folder name.

---

## 4A. Converting an existing vault (the usual case)

The principle: **their notes are sources, not nodes.** They move into the
`raw/` inbox untouched, and you compile them into `wiki/` in batches,
by `/vault-compile` — a command your user types, one batch per session — word for word where the
rules say verbatim, never summarised away. Their originals survive in
`raw/_compiled/` and in the backup. Nothing is deleted.

Tell your user this up front, and tell them the one real change to their
habits: from now on `wiki/` is written by you. They capture into daily notes,
into `raw/`, or by telling you; they read anything they like.

### 4A.1 Inspect their vault

Report to your user, before changing anything:

- total notes (`.md`), total size of their text, attachments by type, folders
  and how many notes each holds;
- whether it is a git repository — `git -C "<vault>" remote -v`. **If it has a
  remote, check whether the repository is public.** If it is, stop and tell
  them: this system will put personal material in it. Offer to make it private
  or to start a new private repository (§ 9);
- `.obsidian/`: which community plugins are installed and enabled
  (`.obsidian/community-plugins.json` and `.obsidian/plugins/`) — in
  particular Excalidraw, Calendar, Iconize and Templater — and their theme.
  Their plugins and settings stay;
- existing daily notes: folder, date format, template;
- an existing templates folder, and existing `CLAUDE.md`, `AGENTS.md` or
  `HANDOFF.md`;
- any top-level names that collide with ours: `wiki/`, `raw/`, `tools/`,
  `output/`, `templates/`, `Excalidraw/`, `.claude/`, `.agents/`, `.codex/`. A collision is a
  question for your user, never a silent merge.

### 4A.2 Back up — never skip this

- **A git repository**: commit anything uncommitted (ask first), then
  `git -C "<vault>" tag pre-second-brain`.
- **Not a repository**: copy the whole vault, `.obsidian/` included, to a
  sibling folder named `<vault name>-backup-<YYYY-MM-DD>`, then compare file
  counts and total size between the two. Tell your user where it is.

Do not continue until the backup exists and you have checked it.

### 4A.3 Close Obsidian

Ask your user to close Obsidian completely.

### 4A.4 Install the machinery

Copy from this template into their vault, never overwriting a file of theirs
without asking:

| Copy | Into their vault | Notes |
| --- | --- | --- |
| `tools/` | `tools/` | Whole folder |
| `.claude/skills/` — all six: `vault-excalidraw`, `vault-tailor`, `vault-compile`, `vault-audit`, `vault-deep-audit`, `vault-handoff` | same | If they already have `.claude/`, add beside what is there |
| `.claude/rules/` | same | The four path-scoped rules files `AGENTS.md` points to; Claude Code loads each when a file it covers is read, other agents read one when the manual says |
| `.claude/agents/` | same | `vault-fidelity-verifier` and `vault-gap-auditor`, the read-only agents `/vault-compile` and `/vault-deep-audit` dispatch |
| `.claude/settings.json` | same | The hooks (`tools/hooks/`). If they already have one, add its `hooks` entries to theirs and leave their other settings alone |
| `AGENTS.md` | `AGENTS.md` | The manual every agent reads. Remove the block from `<!-- template-only` to `<!-- /template-only -->`: it is for contributors to the template, and the build fails a vault that keeps it (D93). If they already had an `AGENTS.md`, save theirs as `raw/their-previous-AGENTS.md`, show them its rules, and add the ones they still want to the end of the new one under `## My Additions` |
| `CLAUDE.md` | `CLAUDE.md` | Claude Code's entry point: it imports `AGENTS.md`. If they already had one, save theirs as `raw/their-previous-CLAUDE.md` and treat its rules the same way — into `AGENTS.md` § My Additions, so every agent sees them; only a line that is true for Claude Code alone stays in `CLAUDE.md` (D90) |
| `.agents/`, `.codex/` | same | The skills, agents and hooks other agents read, generated from `.claude/` (`node tools/agents-sync.js`, D91). Copy them whatever agent your user runs today: they cost nothing and let them switch later. If they already have `.codex/hooks.json`, merge its `hooks` entries with theirs |
| `HANDOFF.md` | `HANDOFF.md` | If they had one, compile it like any source |
| `SETUP.md` | `SETUP.md` | A working copy so the next session can continue; removed in § 12 |
| `templates/` | `templates/` | Merge with theirs (§ 8); on a name clash, keep theirs and ask |
| `Excalidraw/tooling/` | `Excalidraw/tooling/` | The architecture drawing |
| `wiki/` | `wiki/` | Only the `.md` nodes under `wiki/tooling/` and `wiki/profile/owner-identity.md`. Never the `_*.tsv` or `_index.md` files: the builder generates those |
| `.gitignore`, `.gitattributes` | same | Merge line by line with theirs |
| `.obsidian/` settings | — | **Never copy the folder.** § 5 merges only the settings the rules depend on, and only for the plugins your user installs |
| `bench/`, `docs/`, `.github/`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `CHANGELOG.md`, `MAINTAINING.md`, `UPGRADING.md`, `ROADMAP.md`, `CITATION.cff`, `release-please-config.json`, `.release-please-manifest.json` | — | **Never copy** — they belong to the template's repository, not to a vault |

Then create the empty folders `raw/`, `raw/daily/`, `raw/_compiled/` and
`output/`, each with an empty `.gitkeep`, and run the § 1 tool check here, in
their vault.

### 4A.5 Restart the agent in their vault

A session loads the manual and new skills only when it starts, so your agent
must restart before the rest of the setup. Write to their `HANDOFF.md`, under
`**Setup**:` in Current State, "Setup in progress — converting an existing
vault; next step: § 4C, then § 4A.6", with the interview answers. Then ask
your user to quit their agent and start it again **in their vault folder** —
the same folder if you were already started there — and say **"Continue the
setup in SETUP.md."** The next session reads `AGENTS.md` (Claude Code:
through `CLAUDE.md`), then `HANDOFF.md`, then the working copy of this file in
their vault, does § 4C for its agent, and picks up at § 4A.6.

### 4A.6 Configure

Do § 6 (owner, topics, tokens, icons, probes), then § 5 (Obsidian settings),
then § 8 (templates).

### 4A.7 Sources, then notes

A vault built without these rules is mostly summaries, less faithful than the
sources behind them. So the knowledge base is rebuilt from scratch: `wiki/`
starts empty, and everything they have becomes a source in `raw/`. Nothing is
deleted — their notes end in `raw/_compiled/` and in the backup — but none of
them survives as a node.

**Ask first: "Do you still have the original files this vault was built
from — PDFs, documents, exports, links?"**

- **If yes**: create `raw/sources/` and put the sources there (your user copies
  or moves them; a link goes in as a `.md` file holding the URL). Then create
  `raw/import/` and move every existing note into it, keeping its folder
  structure. `/vault-compile`'s plan compiles the sources first, because they
  are the more faithful copy, then reads every old note in full as a sweep —
  capturing only what the sources lack (their own thoughts, things from chats,
  later edits) and recording any disagreement between a note and its source
  rather than resolving it.
- **If no**: create `raw/import/` and move their whole knowledge base into it,
  keeping its folder structure. It becomes the source.

Either way, everything moves except what the system owns (`AGENTS.md`, `CLAUDE.md`,
`HANDOFF.md`, `README.md`, `SETUP.md`, `tools/`, `templates/`, `Excalidraw/`,
`raw/`, `output/`, `.claude/`, `.agents/`, `.codex/`). An existing `wiki/` folder of theirs is a
collision (§ 4A.1): it moves into `raw/import/` with the rest. `raw/sources/`
and `raw/import/` do not ship with the template — they exist only during a
conversion and empty as batches compile.

- **Daily notes** go to `raw/daily/` instead, one file per day named
  `YYYY-MM-DD.md` — they are compiled word for word into the month's logs.
- **Drawings** (`.excalidraw.md`) go to `Excalidraw/` at its root; each is
  filed into `Excalidraw/<topic>/` as its topic is decided.
- **The best way to move** is for your user to drag the folders in Obsidian's
  file explorer: with "Automatically update internal links" on (it is, after
  § 5), Obsidian rewrites every link that would break. Moving by script leaves
  path-style links (`[[folder/note]]`) broken, though name-style links
  (`[[note]]`) keep working. Explain the choice and let them pick.
- **A folder they want kept out of the system entirely** — a private diary,
  say — can stay where it is, but only after you add its name to `NOTE_HOMES`
  in `tools/lib/rules.js` (the builder otherwise fails any note outside the
  indexed folders, D68). Tell them plainly: you will never see those notes when
  answering. Record the decision in `HANDOFF.md`.

Afterwards `node tools/build-index.js` warns that captures are waiting in
`raw/`. **That is expected**: the waiting list is the compile's to-do list, and
it empties as batches compile.

### 4A.8 Set the cost baseline

The prime directive is measured against loading *all* their source text at
once. Measure it once, now: the total bytes of text in `raw/sources/`,
`raw/import/` and `raw/daily/` (`.md` and `.txt` files, plus the extracted text
of any PDF, DOCX or PPTX source). Write it as `BASELINE_BYTES` in
`tools/lib/rules.js` and record the figure in `HANDOFF.md`. Never raise it
afterwards: a bigger baseline flatters every ratio without any lookup getting
cheaper.

### 4A.9 Hand the compile to your user

You cannot compile: `/vault-compile` carries `disable-model-invocation: true`,
so only your user can start it (`AGENTS.md` § Compile and Audit). Tell them:

> Type **`/vault-compile`**. The first run sees how much is waiting, groups it
> into batches of about one session each — sources first — writes that plan
> into `HANDOFF.md`, and shows it to you. Say yes, and it compiles batch 1.
> After that, type `/vault-compile` once per session; each run compiles the
> next batch and ticks it off, until the plan is done.

### 4A.10 While the batches run

A vault of a few hundred notes takes several sessions. That is fine: compile
cost is never the metric (`AGENTS.md` § Prime Directive), fidelity is. Every
batch ends with a clean build and a short report; commit and push after each
(§ 9, once the repository exists).

`raw/_compiled/` holds their original notes after compiling. `AGENTS.md` says
it is disposable, meaning the vault must never *need* it. Whether to delete it
is always your user's decision, never yours.

You can finish the rest of the setup (§ 4A.11 onward) before the batches are
done.

### 4A.11 Reopen Obsidian

Ask your user to open their vault in Obsidian, enable community plugins if
asked, and check the § 5 list. Then run `node tools/build-index.js`: it must
report no `OBSIDIAN SETTING DRIFTED` problem and no folder without an icon.

Then § 9 (GitHub, unless done earlier), § 7 (NotebookLM, if wanted), § 10
(HANDOFF and memory), § 11 (credit and tokens), § 12 (finish).

---

## 4B. Turning this template into their vault

### 4B.1 Choose a name

Ask what they would like to call their vault. Any folder name works;
lowercase-with-hyphens is easiest to type in a terminal, but it is their
choice. The vault's name appears nowhere in the tools.

### 4B.2 Rename this folder — then restart here

1. Write the interview answers and "Setup in progress — new vault named
   `<name>`; next step: § 4B.3" into `HANDOFF.md`, under `**Setup**:` in
   Current State.
2. Make sure Obsidian does not have this folder open.
3. Rename the folder from its parent directory, e.g.
   `mv "<parent>/second-brain-template" "<parent>/<name>"` (keep whatever the
   folder is currently called; it may not be `second-brain-template`). **On
   Windows this usually fails** while the agent is running inside the folder;
   if it does, ask your user to exit it and rename the folder in Explorer or
   Finder.
4. Either way, ask your user to start their agent **in the renamed folder**
   and say **"Continue the setup in SETUP.md."** The new session does § 4C for
   its agent, then § 4B.3, with the right project path, which the memory
   folder (§ 10) and `AGENTS.md` depend on.

### 4B.3 Configure

Remove the block from `<!-- template-only` to `<!-- /template-only -->` in
`AGENTS.md`: it is for contributors to the template, and the build fails a
vault that keeps it once § 6 fills in their name (D93). Then do § 6 (owner,
topics, tokens, icons, probes) and § 8 (templates). § 5 needs no
merging here: the settings in this template's `.obsidian/` are already the
right ones. Check them anyway: `node tools/build-index.js` reports any setting
that drifted.

For the cost baseline, leave `BASELINE_BYTES` as it ships until the first real
compile. Then set it once to the bytes of text in the sources of that compile,
and record in `HANDOFF.md` that you did.

### 4B.4 Open it in Obsidian

Ask your user to open the folder as a vault in Obsidian ("Open folder as
vault") and turn community plugins on (restricted mode off). Excalidraw is
already installed (§ 1); the settings for Calendar, Iconize and Templater ship
in `.obsidian/plugins/`, so each works as soon as your user installs it. Then
run `node tools/build-index.js` — no `OBSIDIAN SETTING DRIFTED` or
`REQUIRED PLUGIN NOT INSTALLED` problem.

### 4B.5 A first capture together

Show them how it works on something real: ask for one thing to capture — an
idea, today's update, a person — write it with them, run
`node tools/build-index.js`, then ask a question about it and show the
one-line trace (`path: index → 1 card`). This teaches the vault better than any
explanation.

Then § 9, § 7 (if wanted), § 10, § 11, § 12.

---

## 4C. Your user's agent

The vault runs under any coding agent. `AGENTS.md` is the manual for all of
them; `.claude/` is the one source of the skills, agents and hooks, and
`node tools/agents-sync.js` generates the copies other agents read
(`.claude/rules/tooling.md` § Every Agent). Do the part for the agent your
user runs (ground rule 10), then tell them in two lines what their agent
enforces and what it only reads as a rule.

### Claude Code

Nothing more to do: `CLAUDE.md` imports `AGENTS.md`, and the rules, skills,
agents and hooks in `.claude/` load on their own. The four gated skills refuse
to start unless your user types them.

### Codex

1. **Trust the project.** Codex loads a project's `.codex/` folder — the two
   read-only agents and the hooks — only once the project is trusted. When
   Codex asks on its first start in the vault, your user trusts it.
2. **Trust the hooks.** Codex runs a project hook only after it is reviewed.
   Ask your user to type `/hooks`, review the three (`stop-rebuild`,
   `post-write-check`, `pre-bash-guard`) and trust them. A hook that changes
   in a later upgrade needs trusting again.
3. **The gated skills** carry `allow_implicit_invocation: false`, so Codex
   starts them only when your user types `$vault-compile`, `$vault-audit`,
   `$vault-deep-audit` or `$vault-handoff`. Tell them that is the Codex
   spelling of the slash commands in the manual.
4. **Size.** Codex reads at most 32 KiB of `AGENTS.md` by default
   (`project_doc_max_bytes`); the manual is about 24 KiB. If their additions
   take it past the limit, raise it in `~/.codex/config.toml` — ask first.
5. Check: `node tools/agents-sync.js --check` passes.

### Gemini CLI

1. Gemini reads `GEMINI.md` unless told otherwise. With your user's yes, add
   `{ "context": { "fileName": ["AGENTS.md"] } }` to the vault's
   `.gemini/settings.json` (merge with any settings already there).
2. Skills load from `.agents/skills/`. Gemini has no switch that makes a skill
   explicit-only, no generated agents and no generated hooks: the manual's
   rules and each gated skill's description are what stop it, and the builder
   and self-test are the backstop. Say so to your user.

### Any other agent

If it reads `AGENTS.md`, it has the manual. Skills are plain folders in
`.agents/skills/` and `.claude/skills/`: it reads the one it needs when asked.
Gating, subagents and hooks become rules the manual states, with the builder
and self-test as the backstop — tell your user which of those their agent
enforces.

---

## 5. Obsidian: every setting the rules depend on

Four community plugins are involved: **Excalidraw** (required, installed in
§ 1) and **Calendar**, **Iconize** and **Templater** (recommended).
`wiki/tooling/obsidian-plugins.md` explains what each writes and can rewrite,
and why each setting below is what it is. Read it before this section. A
plugin's settings only matter once it is installed — the build checks them
only then (D79) — so merge the rows for the plugins your user actually has.

**In a converted vault (§ 4A), merge keys, never files.** Obsidian must be
closed. Read each JSON file, set only the key named, and write it back with its
own indentation. Leave every other setting of theirs alone — theme, hotkeys,
appearance, other plugins. **In a new vault (§ 4B), these are already set.**

| File in `.obsidian/` | Key | Value | Why |
| --- | --- | --- | --- |
| `app.json` | `attachmentFolderPath` | `./assets` | A pasted image lands in `assets/` beside its note (D52) |
| `app.json` | `newFileLocation` / `newFileFolderPath` | `folder` / `raw` | A note made in Obsidian starts in the inbox (D68) |
| `app.json` | `alwaysUpdateLinks` | `true` | Moving a note never breaks a link |
| `daily-notes.json` | `folder` / `format` / `template` | `raw/daily` / `YYYY-MM-DD` / `templates/daily-note` | Daily notes land in the inbox for compiling |
| `templates.json` | `folder` | `templates` | Core Templates finds the same templates |
| `core-plugins.json` | `daily-notes`, `templates` | `true` | Calendar and the daily note need them |
| `community-plugins.json` | the list | `obsidian-excalidraw-plugin`, plus `calendar`, `obsidian-icon-folder`, `templater-obsidian` for each one installed | Enabled, not just installed |
| `plugins/obsidian-excalidraw-plugin/data.json` | `folder` | `Excalidraw` | New drawings land where the tools look (D71) |
| same | `embedUseExcalidrawFolder` | `true` | A drawing made from inside a note stays out of `wiki/` (D68) |
| same | `compress` | `false` | A drawing saves as readable JSON; git diffs show what changed (D71) |
| `plugins/templater-obsidian/data.json` | `templates_folder` | `templates` | Insert Template offers the vault's templates |
| same | `ignore_folders_on_creation` | `wiki`, `raw`, `tools`, `output` | A note the agent writes is never re-parsed as a template |
| same | trigger on file creation | **off** — a device-local toggle in Templater's settings screen, not in `data.json`; ask your user to check it | Otherwise any `<% %>` in a new note would run |
| `plugins/obsidian-icon-folder/data.json` | one key per folder, `"<folder path>": "Li<LucideId>"`, plus the name rules in `settings.rules` | as in this template, plus one per new topic | Every folder has an icon; the build warns on any without one |
| `.gitignore` | — | `workspace*.json`, `.obsidian/cache`, plugin code (`main.js`, `styles.css`, `manifest.json`), themes, icon packs, `.trash/` | Machine-local state and other people's code never reach git |

`OBSIDIAN_SETTINGS` in `tools/lib/rules.js` lists the ones the build checks on
every run. After the merge, `node tools/build-index.js` must report none of
them drifted. If one does not, Obsidian was open and wrote its old value back:
ask your user to close it, set the key again, reopen.

**Plugin versions.** In a converted vault their plugins may be newer or older
than this template's. That is fine, with one exception: `tools/excalidraw.js`
unpacks the Excalidraw build from the Excalidraw plugin's `main.js`. If
`node tools/excalidraw.js check` says the bundled library was not found, the
plugin changed its packaging; update the patterns in `libraryFiles()`, or offer
to install this template's copy of the plugin (`.obsidian/plugins/obsidian-excalidraw-plugin/`)
after asking.

**Icons.** Most icons are Lucide (`Li…`), built into Obsidian. The templates
folder uses a Tabler icon (`TiTemplate`) from the pack in `.obsidian/icons/`; in
a converted vault copy that pack across, or choose a Lucide icon instead.

**Graph colours (optional).** Offer to colour Obsidian's graph by folder: one
colour per topic, one for `Excalidraw/`, and one for any other folder that
holds notes, each readable on their background and clearly different from the
rest (D86). If your user wants it, ask for their theme's background colour as
RGB — never assume one — and set `GRAPH.background` in `tools/lib/rules.js`.
If their theme colours tag or attachment nodes, and Style Settings is
installed, ask for those colours too and add them to `GRAPH.themeNodes`, so
folders stay clear of them. Then run `node tools/graph-colours.js` and ask them
to reload Obsidian. The tool owns the graph's whole colour-group list, so say
that any groups they made by hand will be replaced. If they decline, leave
`GRAPH.background` as `null`: the tool and the build's check stay off.

---

## 6. Make it theirs

### 6.1 Owner config — `tools/lib/rules.js`

Set the four `OWNER` fields, each marked `// SETUP`:

- `name` — as their prose writes it ("Priya").
- `pronouns` — `'she/her'`, `'he/him'`, `'they/them'`, or `''` if they did not
  state any. Never guess (D25).
- `slug` — only if they want a person node of their own in `wiki/people/`
  (then create it); otherwise leave `'owner'`.
- `identity` — leave `'owner-identity'`, or rename `wiki/profile/owner-identity.md`
  to `<name>-identity.md` and set this to match. The builder links to it.

Edit the quoted default in each line; the environment variables beside them
exist only so `tools/bench.js` can score a vault with a different owner.

### 6.2 Topics — `tools/build-index.js`

Topics are registered in `LABELS` (display name) and `TOPICS` (a one-sentence
description) — both marked `SETUP`. Register every topic **before** any node
uses it (D15). Keep `profile`, `people`, `journal` and `tooling`. A topic
without nodes only warns ("empty topic") until something is captured into it.
Every new topic folder needs an Iconize icon (§ 5), and optionally a graph
colour group in `.obsidian/graph.json`.

### 6.3 A work engagement, if they have one

For an engagement named, say, Acme:

1. Register the topic `acme-engagement` (§ 6.2), description: the client or
   employer, what the work is, and that it holds concepts, `decisions/` and a
   day-by-day `worklog/`.
2. Add a tag facet for its workstreams to `TAG_FACETS` in `tools/lib/rules.js`:
   `acme: 'a workstream, component or team inside the Acme engagement'`. The
   facet's name must not be a word they would search on its own (the audit
   checks this).
3. Add its organisation tag to `TOPIC_IMPLIED_TAGS`:
   `'acme-engagement': ['org/acme']`.
4. Its work log series is `acme-YYYY-MM.md` under `wiki/acme-engagement/worklog/`,
   created on the first capture. The daily-note template's `## Work` section
   feeds it (§ 8).
5. Icons for `wiki/acme-engagement`, and a graph colour group.

No engagement? Then every dated update goes to the journal, and the daily
note's `## Work` section does too.

### 6.4 Their identity card

Rewrite `wiki/profile/owner-identity.md` from the interview. Fill
`{{OWNER_NAME}}`, `{{OWNER_WORK}}`, `{{OWNER_LOCATION}}` and
`{{OWNER_ANSWER_STYLE}}` with exactly what they said. Where they said nothing,
drop the bullet rather than guess. The Key Takeaways need at least four
self-contained bullets — take the rest from what they told you. Add aliases
for how they would ask about themselves ("my email", "where do I work"),
first-person form included (D07).

### 6.5 Probes

`tools/probes.json` ships with a starter set covering the shipped nodes. As
the vault grows, add a group per topic with the phrasings they actually use,
`_must_route` entries for terms that must reach one specific node, about
twenty realistic `_benchmark` questions, and a `_forbidden` fence for every
fact they correct (`AGENTS.md` § Capture Protocol, D37 and D50).

### 6.6 Spelling

If they write one spelling and type another, add words their prose holds
*only* in the written spelling to `us_spelling` (the audit rejects any that
would pass without the spelling mechanism, D24). Otherwise leave it empty.

### 6.7 The tokens

Replace every `{{UPPER_CASE}}` token outside this file:

| Token | Where | Value |
| --- | --- | --- |
| `{{OWNER_NAME}}` | AGENTS.md, HANDOFF.md, the identity and architecture nodes | Their name, as in `OWNER.name` |
| `{{VAULT_PATH}}` | AGENTS.md § Working Notes, `second-brain-architecture.md` | The vault's absolute path, after any rename |
| `{{GITHUB_REPO}}` | AGENTS.md § Version Control, HANDOFF.md, `vault-operations.md` | `https://github.com/<owner>/<repo>` (§ 9) |
| `{{MEMORY_PATH}}` | `.claude/skills/vault-handoff/SKILL.md`, step 4 | § 10 |
| `{{SETUP_DATE}}` | AGENTS.md § Working Notes, HANDOFF.md | Today, `YYYY-MM-DD` |
| `{{NOTEBOOKLM_POLICY}}` | `.claude/skills/vault-compile/SKILL.md` § 4 | Their answer from the interview, in one sentence, with the date — or "not used" |
| `{{PDF_TOOLING_NOTE}}` | `.claude/skills/vault-compile/SKILL.md` § 6 | What you verified on this machine: Python version, which packages import, whether `pdftotext` exists |
| `{{OWNER_WORK}}`, `{{OWNER_LOCATION}}`, `{{OWNER_ANSWER_STYLE}}` | the identity node | § 6.4 |
| `{{SETUP_SNAPSHOT}}`, `{{TOPICS_SUMMARY}}`, `{{SETUP_STATE}}`, `{{SETUP_DECISIONS}}`, `{{SETUP_SUMMARY}}` | HANDOFF.md | § 10 |

Do not touch Templater's own syntax in `templates/` — `{{date:YYYY-MM-DD}}`
and `<% … %>` are not tokens.

Some tokens sit in `.claude/skills/` (`{{OWNER_NAME}}` among them, in
`vault-compile`). Fill them there — never in the generated `.agents/` copies —
then run `node tools/agents-sync.js`: the build warns until the copies other
agents read catch up (D91).

---

## 7. NotebookLM (only if they want it)

NotebookLM is an optional compile instrument — never a source, never in the
query path (`/vault-compile` § 4, `wiki/tooling/notebooklm-compile-support.md`).
It is driven through **notebooklm-py** by teng-lin, an unofficial,
MIT-licensed CLI and Python API: **<https://github.com/teng-lin/notebooklm-py>**.
It uses undocumented Google endpoints, so it can break on Google's side, and
heavy use is rate-limited. Tell your user that before installing it.

**Read its README and its installation guide before installing** —
<https://github.com/teng-lin/notebooklm-py/blob/main/docs/installation.md> — and
follow them wherever they differ from this section: the package moves faster
than this file. The steps below were carried out on Windows 11 with
notebooklm-py 0.8.2 on 18 September 2026; the macOS and Linux commands are the
documented ones.

Install it **globally**, not in the vault, so they can use it from any folder:

1. **uv**, the Python tool installer (<https://github.com/astral-sh/uv>;
   installation guide <https://docs.astral.sh/uv/getting-started/installation/>).
   Ask first. Windows:
   `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
   or `winget install --id=astral-sh.uv -e`. macOS or Linux:
   `curl -LsSf https://astral.sh/uv/install.sh | sh` (or `brew install uv`).
2. **The CLI**: `uv tool install "notebooklm-py[browser]"` — the same command
   on every platform. It lands at `%USERPROFILE%\.local\bin\notebooklm.exe` on
   Windows and `~/.local/bin/notebooklm` on macOS and Linux. If `notebooklm` is
   not found, open a **new** terminal first — a terminal opened before the
   install still has the old PATH. Only then check the user PATH, reading
   before changing anything. On Windows:
   `powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('Path','User')"`.
   If the folder really is missing, `uv tool update-shell` adds it. Never use
   `setx`, which silently truncates PATH at 1,024 characters. Changing PATH
   needs your user's yes. Until it is fixed, call the CLI by its full path.
3. **The skill**: `notebooklm skill install` copies the package's own
   `SKILL.md` into the user-level skill folders (`~/.claude/skills/notebooklm/`
   and `~/.agents/skills/notebooklm/`). `notebooklm skill status --json`
   confirms it. Optionally widen the skill's frontmatter `description` so it
   triggers on "my NotebookLM" and "my notebooks", and note in the file that a
   re-install reverts that edit.
4. **Sign-in**: `notebooklm login` opens a browser window. Your user signs in
   there. **You never type their credentials, and never read or print the auth
   files** in `~/.notebooklm/`. If the login complains about a missing
   browser, run what its own message or `notebooklm login --help` says.
5. **Verify**: `notebooklm auth check --test --json` must report
   `"status": "ok"` with `token_fetch: true`, and `notebooklm list --json` must
   list their notebooks.
6. **Record** the upload policy in AGENTS.md (`{{NOTEBOOKLM_POLICY}}`) and a
   global memory note (§ 10): where the CLI lives, that it is signed in, and how
   to upgrade (`uv tool upgrade notebooklm-py`).

Known limits (`notebooklm-py` 0.8.2): a PDF near 1.7 MB fails to upload; a
failed `source add` leaves a zombie source to delete by hand; chat-generated
XLSX and PPTX files cannot be downloaded through the CLI.

---

## 8. The `templates/` folder

`templates/` holds the **Templater** templates for notes your user makes in
Obsidian — not vault content, and not read by the tools:

| Template | Used for | Lands in |
| --- | --- | --- |
| `daily-note.md` | Calendar's daily note (core Daily notes uses it) — a `## Work` section and an `## Everything else` section | `raw/daily/YYYY-MM-DD.md`, then compiled word for word into the month's logs |
| `idea.md` | "Templater: Insert template" → idea | an idea node's frontmatter and shape |
| `person.md` | a new person | a person node's frontmatter and shape |
| `log-entry.md` | a dated heading, `### YYYY-MM-DD (D-Mon-YY)` | pasted into a log |

Tailor them with your user:

- **The daily note's sections** mirror where things go. With a work
  engagement, `## Work` feeds its worklog — rename the heading after it
  (`## Acme work`) if they like, and say so in `AGENTS.md` § Capture Protocol.
  With no engagement, `## Work` goes to the journal like everything else, and
  they may drop it.
- **Add templates for what they capture often** — a meeting note, a reading
  note, a recipe. A template's frontmatter must match `.claude/rules/wiki-writing.md` § Frontmatter,
  and anything made from it in Obsidian lands in `raw/`, to be compiled.
- **In a converted vault**, keep their templates beside ours. Point Templater's
  `templates_folder` and core Templates' `folder` at `templates/`, and move
  theirs in (in Obsidian, so links update).

Explain to your user how to use them: Ctrl/Cmd+P → "Templater: Insert
template", or the Calendar's day click for a daily note.

---

## 9. A private GitHub repository

The vault is versioned in a **private** repository. It will hold their personal
material, and with it every Obsidian setting and plugin (about 90 MB; the
largest single file is about 40 MB, under GitHub's 100 MB limit). Say so, and
get their yes before creating anything.

1. **Create it with the GitHub MCP**: `create_repository` with the name from
   the interview, `private: true`, and no auto-generated README, licence or
   `.gitignore`. Confirm with the MCP's repository lookup that it reports
   private. Without the GitHub MCP, ask your user to create an empty private
   repository on github.com and give you its URL.
2. **Local repository**: in the vault, if it is not already one,
   `git init -b main`. Check that `.gitignore` and `.gitattributes` are in
   place **before** the first commit.
3. **Build before committing**: `node tools/selftest.js`,
   `node tools/build-index.js` — never commit a stale index (`AGENTS.md` §
   Version Control).
4. **First commit** with the vault's convention: the subject in vault terms,
   the body with the counts (nodes, sections, edges), and the attribution
   trailer your harness gives you.
5. **Push with the git CLI**, not with MCP push tools:
   `git remote add origin <url>`, then `git push -u origin main`. If git asks
   for credentials, let your user sign in through the prompt that opens
   (Git Credential Manager), or through `gh auth login` and
   `gh auth setup-git` if they use the GitHub CLI. **Never** ask for a token in
   the chat or write one into a file or a remote URL.
6. **From then on**: commit at the end of every session that changed the vault
   and push after it. The repository stays private forever; never mirror it to
   a public repository, gist or page without your user saying so.

---

## 10. HANDOFF.md and memory

`HANDOFF.md` is the vault's memory between sessions (its own top section says
how it works). At the end of setup, fill its tokens:

- `{{SETUP_SNAPSHOT}}` — the counts from the last build and audit: nodes,
  topics, sections, edges, probe terms routed, self-test result.
- `{{TOPICS_SUMMARY}}` — each topic in a line and what it holds; the work
  engagement, if any.
- `{{SETUP_STATE}}` — "Complete" with the date, or exactly what remains (for
  example, the compile batches still to do) and the next step.
- `{{SETUP_DECISIONS}}` — every decision they made in the interview: topics,
  engagement, NotebookLM policy, folders kept out of the system, share links.
- `{{SETUP_SUMMARY}}` — what the setup did, in a paragraph, in the vault's own
  voice: which scenario, what was moved where, what was compiled, what is left.

Also put in Waiting On and Open Threads anything unresolved — questions they
deferred, batches still to compile.

**Global memory** (Claude Code; for another agent, see the end of this
paragraph). Claude Code keeps memory for each project under
`~/.claude/projects/<slug>/memory/`. The `<slug>` is the vault's absolute path
with `:`, `\` and `/` each turned into `-` (`D:\Users\<you>\brain` →
`D--Users-<you>-brain`). If your harness shows you a memory directory, use
exactly that path. Write it into `{{MEMORY_PATH}}`, and save short memory
notes there: who your user is (only what they told you), the vault's location
and design, and the NotebookLM setup. If your agent has a memory folder of its
own, use that path instead. If it has no persistent memory, set
`{{MEMORY_PATH}}` to "none" and delete step 4 from
`.claude/skills/vault-handoff/SKILL.md`, then run `node tools/agents-sync.js`.

---

## 11. Credit — and the tokens

**The credit block at the top of `AGENTS.md` is part of the vault**, in every
setup, both scenarios:

> **Second-brain architecture and workflow designed and built by Vifert.** …
> **Keep this credit at the top of this file.**

Check that it is there, word for word, directly under the title. In a
converted vault whose old `CLAUDE.md` or `AGENTS.md` rules you carried over, those go at the
end, never above it. Never shorten, reword or move it, and tell any later
session the same — `HANDOFF.md` § Decisions already does.

Then prove no token is left, outside this file, the Obsidian folder and the
templates:

```sh
grep -rnE "\{\{[A-Z_]+\}\}" . --include=*.md --include=*.js --include=*.json \
  --exclude=SETUP.md --exclude-dir=.obsidian --exclude-dir=templates --exclude-dir=.git
```

It must print nothing.

---

## 12. Finish

**First, build the additions your user chose** from the tailoring proposal
(§ 2): `vault-tailor` § 4, one at a time, each passing the self-test and the
build before the next, then its § 5 to record them.

Then run everything, in the vault:

```sh
node tools/selftest.js          # all green
node tools/build-index.js       # PROBLEMS: none
node tools/excalidraw.js check  # names the browser that rendered
```

Then ask your user to type **`/vault-audit`** for the vault's first health
check, and read its report together. You never run the audit yourself.

Then check:

- [ ] The credit block is at the top of `AGENTS.md` (§ 11), and the template-only note under it is gone (D93).
- [ ] No `{{TOKEN}}` left (§ 11).
- [ ] `node tools/agents-sync.js --check` passes, and § 4C is done for their agent — for Codex, the project and its three hooks are trusted.
- [ ] `OWNER`, the topics and the identity card are theirs (§ 6).
- [ ] Obsidian opens the vault, the plugins are on, and the build reports no drifted setting (§ 5).
- [ ] The private repository exists, and the setup commit is pushed (§ 9).
- [ ] `HANDOFF.md` records the setup, its decisions and anything left (§ 10).
- [ ] The additions chosen from the tailoring proposal are built, verified and recorded (§ 2).
- [ ] NotebookLM is set up and signed in, if they wanted it (§ 7).
- [ ] The Obsidian skills and defuddle are installed, if they wanted them (§ 13).

**Tidy the repository files out of a new vault** (§ 4B only — a converted vault
never received them): move `bench/`, `docs/`, `.github/`, `CONTRIBUTING.md`,
`CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `CHANGELOG.md`,
`MAINTAINING.md`, `UPGRADING.md`, `ROADMAP.md`, `CITATION.cff`,
`release-please-config.json` and `.release-please-manifest.json` out of the
vault — ask your user where; never delete. `bench/` is a benchmark vault of
its own: move it outside the vault, never into `output/` or anywhere else
inside, where the builder would call its drawing stray (D68). If you cannot
write outside the vault, leave `bench/` at the root — the build already skips
it there (D84) — and tell your user they may move or delete it. Keep `LICENSE`, `THIRD_PARTY_NOTICES.md`, `VERSION` and the
credit block. In both paths, write into `HANDOFF.md` under **Setup**: "Set up
from second-brain-template v<contents of VERSION>".

**Remove this file.** In a new vault (§ 4B), delete `SETUP.md` from the vault
root once every box above is ticked — it has done its job, and the vault
explains itself from here. In a converted vault (§ 4A), delete the working copy
you put in their vault; the template folder they started from is theirs to keep
or delete. Tell your user you have done it, then commit and push.

Also: in a new vault, rewrite `README.md` as the vault's own short readme —
what it is, how to capture, how to ask, with the same credit line — or remove
it if they prefer.

**Hand over.** In a few lines, tell your user:

- how to capture — "log this: …", "idea: …", a daily note, or a file dropped in `raw/`;
- how to ask — just ask; you route through the index and show the trace;
- the commands only they can start — see "Their commands" below;
- that the vault can keep growing with them: `/vault-tailor` studies it again,
  interviews them about what changed, and proposes and builds new skills,
  subagents or rules — they can type it any time, or just ask you to adapt the
  vault;
- that every session starts by reading `AGENTS.md` and `HANDOFF.md`, whichever
  coding agent they use;
- that the architecture is Vifert's.

### Their commands

Tell your user, in these words or close:

- **`/vault-compile`** — compiles what is waiting in `raw/`: daily notes, files
  they drop in, notes they make in Obsidian. With nothing after it, it takes the
  next batch of the plan, or compiles everything if little is waiting.
  `/vault-compile raw/daily` compiles just that folder.
- **`/vault-audit`** — a cheap health check, reported in a few lines, then
  "which should I fix?".
- **`/vault-deep-audit`** — the expensive check: facts only the raw files hold,
  and a gap audit by agents asking questions in their words. Add a topic to
  limit it: `/vault-deep-audit journal`.
- **`/vault-handoff`** — records the session in `HANDOFF.md`, so the next
  session starts where this one ended.
Their agent never starts those four on its own — Claude Code and Codex refuse
to, and any other agent is bound by the manual's rule — so nothing is compiled,
audited or handed over unless they type it. In Codex they type `$vault-compile`
and so on (§ 4C). Any gated
skill the tailoring added (a research run, say) belongs in this list too.

**`/vault-tailor` is different, and say so plainly**: it is not gated. It ran
once during setup, and it is theirs to use whenever their needs change — they
type `/vault-tailor`, or just ask you to adapt the vault, and you start it.
Explain in two or three sentences how it works: you study the vault's design
first, then interview them in rounds, each question with your recommended
answer, until they confirm you have understood; then you propose new skills,
subagents, rules or topics, each with what it costs, and build only the ones
they pick.

**Drawings** need no command: ask for one and the agent uses `vault-excalidraw`
itself.

---

## 13. Optional global helpers

Offer these; install only on a yes. **Before installing one, open its
repository and read the README** — install steps change, and the README wins
over this file.

**Obsidian skills** — <https://github.com/kepano/obsidian-skills>. Adds
`/obsidian:obsidian-markdown`, `/obsidian:obsidian-bases`,
`/obsidian:json-canvas`, `/obsidian:defuddle` and `/obsidian:obsidian-cli`,
which `.claude/rules/obsidian.md` § Obsidian Skills refers to. It is a Claude Code plugin — under
another agent, skip it and use the `defuddle` CLI below — so
it installs through the Claude Code CLI with the same two commands on Windows,
macOS and Linux (checked against `claude plugin --help` on 18 September 2026):

```sh
claude plugin marketplace add kepano/obsidian-skills
claude plugin install obsidian@obsidian-skills
```

In an interactive session the same is `/plugin marketplace add kepano/obsidian-skills`
then `/plugin install obsidian@obsidian-skills`. `claude plugin list` confirms
it; the skills load from the next session. If your user declines, the vault
still works, and the manual's mentions of them simply go unused.

**defuddle** — <https://github.com/kepano/defuddle>. Clean markdown from a web
page, for capturing a URL. `npm install -g defuddle` on every platform.

**PDF and Office extraction**, for reading PDFs, figures and slides during a
compile: `pip install --user pymupdf pdfplumber pdfminer.six python-pptx pillow`
(on Windows, `py -m pip install --user …` if `pip` is not on PATH; on macOS
and Linux, `python3 -m pip install --user …`). Their repositories:
<https://github.com/pymupdf/PyMuPDF>, <https://github.com/jsvine/pdfplumber>,
<https://github.com/pdfminer/pdfminer.six>, <https://github.com/scanny/python-pptx>
and <https://github.com/python-pillow/Pillow>.

**The live drawing canvas** — <https://github.com/yctimlin/mcp_excalidraw>.
Nothing to install: the drawing skill runs it through `npx` when it is needed
(`.claude/skills/vault-excalidraw/references/live-canvas.md`).

---

## 14. When something goes wrong

- **`selftest.js` fails on a fresh machine.** Check the Node version (18 or
  later). Read the failing test's name: each carries the defect ID it guards,
  and `tools/DEFECTS.md` explains that defect. Fix the environment, not the test.
- **`excalidraw.js check` fails.** It lists every browser it tried and why.
  Install Chrome or Edge, or set `EXCALIDRAW_BROWSER` to a Chromium browser that
  runs headless (D77). "Bundled library not found" means the Excalidraw plugin
  changed its packaging (§ 5).
- **A file suddenly has CRLF line endings, or the self-test says a manual
  heading is missing.** A scripted edit rewrote the line endings (D76);
  rewrite the file with LF.
- **A setting keeps reverting.** Obsidian was open (D69). Close it, set the
  setting again, reopen.
- **Aliases vanished after the user edited in Obsidian.** Obsidian rewrote the
  frontmatter (D02); the build warns about it. Restore the aliases from git.
- **The builder flags a note "outside the indexed folders".** A note was made
  at the vault root or in an unregistered folder (D68). Move it into `raw/`, or
  register its home, whichever your user intends.
- **A rename fails on Windows.** The folder is in use (§ 4B.2). Ask your user to
  close their agent and Obsidian, and rename it themselves.
- **Anything else.** Diagnose with the tools, fix the instance, find the root
  cause, add a guard, and record it in `tools/DEFECTS.md` as D78 onwards —
  `AGENTS.md` § Defect Discipline. That is how this vault got this good.
