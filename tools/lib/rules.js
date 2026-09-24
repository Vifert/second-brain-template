'use strict';
// The vault's rules — ONE copy, imported by every tool.
//
// WHY THIS FILE EXISTS
// --------------------
// On 2026-09-10 the builder flagged an answer surface at 1560 bytes as a
// problem while audit.js, which hardcoded its own numbers, reported
// "No problems" and filed it as a watch item. Two tools, two rulebooks (D17).
// Keeping every rule here makes that disagreement impossible, and
// tools/selftest.js asserts no tool re-declares them.

// ------------------------------------------------------------------- owner

/**
 * WHOSE VAULT THIS IS — the one place the tools learn it.
 * SETUP: fill these four in when the vault is set up (SETUP.md, step "Owner
 * config"). The defaults only let the template build and audit clean before
 * anyone owns it.
 *
 * - name      the owner's name as the vault's prose writes it ("Priya"). A line
 *             that names the owner is read with the owner's own pronouns, so
 *             "Priya asked Sam and she thanked him" does not flag Sam (D36, D53).
 * - pronouns  the owner's stated pronouns — 'she/her', 'he/him', 'they/them' —
 *             or '' until they say. Never guessed from a name (D25).
 * - slug      the owner's own person node, wiki/people/<slug>.md, if they want
 *             one. It is left out of the people timeline and the people checks.
 * - identity  the profile node that says who the owner is,
 *             wiki/profile/<identity>.md. The Now page and the master index link to it.
 */
const OWNER = {
  name: process.env.VAULT_OWNER_NAME || 'Owner', // SETUP
  pronouns: process.env.VAULT_OWNER_PRONOUNS || '', // SETUP
  slug: process.env.VAULT_OWNER_SLUG || 'owner', // SETUP
  identity: process.env.VAULT_OWNER_IDENTITY || 'owner-identity', // SETUP
};

/** Answer surface (## Key Takeaways) — the load-bearing cap for query cost. */
const MAX_BULLETS = 8;
const MAX_CARD_BYTES = 1500;

/** Surfaces within this many bytes of the cap are reported as watch items. */
const NEAR_CAP_MARGIN = 150;

/** Body-length caps in lines, by node kind. Logs are append-only and uncapped. */
const BODY_CAPS = { hub: 200, detail: 350, person: 120, idea: 150, decision: 150, log: Infinity };

/** Thin-surface threshold: fewer bullets than this is reported (people stubs excepted). */
const MIN_BULLETS = 4;

/** Query-cost target from AGENTS.md — the prime directive. */
const COST_TARGET_MIN_X = 30;

/**
 * The naive baseline the cost target is measured against: all the source
 * material the vault was built from, loaded into context at once. Fixed here on
 * purpose — raw/_compiled/ is disposable, so the benchmark must not depend on it
 * still existing — and never grown afterwards: a bigger baseline would flatter
 * every ratio without any lookup getting cheaper.
 *
 * SETUP: measure it once, when the vault is set up — the total bytes of text in
 * the notes being converted (an existing vault), or in the first sources
 * compiled (a new one) — and write it here. The default is the reference
 * vault's own baseline (67,123 bytes, about 16,800 tokens), kept only so the
 * audit runs out of the box.
 */
const BASELINE_BYTES = 67123;

// ---------------------------------------------------------------- structure

/**
 * Folders encode only STABLE properties. Level 1 under wiki/ is the topic.
 * Level 2 is optional and may only be one of these, each tied to one kind, so
 * a folder can never disagree with the frontmatter (the validator checks both
 * directions). Nothing deeper than wiki/<topic>/<sub>/<file>.
 *   decisions/  kind: decision   — calls made inside that topic's work
 *   worklog/    kind: log        — that topic's dated record
 *   assets/     media only       — images owned by that topic's nodes
 * Top-level topics whose whole purpose is one kind need no subfolder:
 * wiki/journal/ (log) and a future wiki/decisions/ (personal decisions).
 */
const KIND_SUBFOLDERS = { decisions: 'decision', worklog: 'log' };
const MEDIA_SUBFOLDER = 'assets';
const KIND_TOPICS = { journal: 'log', decisions: 'decision' };

/** Media: raster only; text transcription is canonical, the image is a view. */
const MEDIA_EXT = ['png', 'jpg', 'jpeg'];
/** Every image format a person might drop in — detected so a disallowed one is flagged, not ignored (D44). */
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tif', 'tiff', 'heic', 'avif'];
/** Repo-size guard only — images are never in the query path, so no token cost. */
const MAX_IMAGE_KB = 500;
/**
 * The section that embeds an image must carry at least this much text of its
 * own (caption + transcription: Mermaid, table, values, description). Below it,
 * the image is a retrieval black hole — grep cannot see inside pixels.
 */
const MIN_TRANSCRIPTION_CHARS = 200;
/** An open Status Log untouched for this many days is flagged for a check-in. */
const STALE_STATUS_DAYS = 21;

// ------------------------------------------------------------------- status

/** A node with a `## Status Log` and one of these statuses appears on Now. */
// Idea lifecycle statuses (seed, exploring) are open too, so an idea can own a Status Log (D40).
const OPEN_STATUSES = ['active', 'pending', 'waiting', 'blocked', 'in-progress', 'exploring', 'seed'];
/** Closed statuses drop off Now but keep their Status Log as history. */
const CLOSED_STATUSES = ['done', 'completed', 'cancelled', 'parked', 'superseded'];
/** The generated Now node. */
const NOW_PATH = 'wiki/profile/now.md';
/**
 * Aliases reserved for the Now page (D26, D39): no other node may claim them,
 * or "what am I doing now" routes to a stale dated page instead of Now.
 */
const NOW_ALIASES = ['now', 'Now page', 'Now note', 'current status', 'my status', 'status update', 'what am I doing now',
  'what am I working on', "what's going on", 'what is going on', "what's happening", 'what is happening now', 'right now',
  'in progress', "what's pending", 'what is pending', 'what am I waiting on', 'current focus', 'where things stand', 'open items'];

/**
 * Phrases that state volatile status (D16, D26, D29, D30). Outside a node that
 * owns a Status Log — and outside logs, which are dated history — they are the
 * pattern that went stale in five places on 2026-09-10.
 */
const VOLATILE_MARKERS = [
  /\bnot (?:yet )?(?:started|begun)\b/i,
  /\b(?:has|have)(?: still)? not (?:yet )?(?:happened|started|begun)\b/i,
  /\b(?:hasn|haven)['’]t (?:yet )?(?:happened|started|begun)\b/i,
  /\b(?:has|have|is|are) yet to (?:start|begin|happen)\b/i,
  /\bstill (?:pending|waiting|not)\b/i,
  /\bexpected (?:the )?(?:week of|next week|within)\b/i,
  /\b(?:is|are) (?:still )?pending\b/i,
];

// ------------------------------------------------------------------ routing

/**
 * A code identifier (job, table, class, script, file) named in the bodies of
 * at most this many nodes is added to their index rows automatically (D54).
 * Named in more, it is a shared term that needs a deliberate alias on the node
 * that explains it — indexing every mention would balloon the L0 read
 * (one widely used table name reached seven rows in the reference vault).
 */
const MAX_IDENTIFIER_NODES = 3;
/**
 * Relative aliases belong to whichever log is newest in its series (D55). The
 * builder adds them to that log's index row; typed into a log by hand they go
 * stale the day the month turns.
 */
const RELATIVE_LOG_ALIASES = ['this month', 'current month', 'latest', 'today', 'this week', 'recent work', 'latest log', 'current'];
/**
 * A summary is printed on every L0 hit: one discriminating sentence, aimed at
 * about 160 characters and never longer than this (D56).
 */
const MAX_SUMMARY_CHARS = 200;

/**
 * Context budgets, in tokens (bytes / 4): what every session loads before the
 * first question (D87). AGENTS.md, the manual, loads in every session and
 * every subagent — Claude Code's through CLAUDE.md, which imports it and adds
 * only a few lines of its own (D90); HANDOFF.md is read at every session start.
 * Over budget is a build WARNING, never a failure: the remedy is always to move
 * detail into a .claude/rules/ file, a skill or a wiki node — never to delete
 * or compress it to fit. A hard size cap applied to content is how D01 lost 78
 * dated entries.
 */
const CONTEXT_BUDGET_TOKENS = { 'AGENTS.md': 6000, 'CLAUDE.md': 400, 'HANDOFF.md': 3000 };

/**
 * The first defect ID that is the owner's own (D89). Rows below it ship with
 * the template and are what the credit block counts; the owner's rows from here
 * on are theirs, not the credited author's. It was 90 until the template's own
 * rows reached D90 (template 1.1); 200 leaves room, so a release that adds rows
 * need not move it again. When it does move, so does "this vault's own defects
 * start at" in the ledger, HANDOFF.md, vault-operations and vault-tailor.
 */
const OWNER_DEFECTS_FROM = 200;

// ------------------------------------------------------------------ tags

/**
 * Tags are nested, `facet/value`, and the facet must be registered here (D65).
 * A client or employer engagement kept as its own topic usually gets its own
 * facet too, named after it — `acme/` for the workstreams, components and teams
 * inside an Acme engagement — registered here first. SETUP.md covers it.
 * Each facet answers one question across topics. Topic and kind already have
 * their own index columns and folders, so no facet restates them; status and
 * dates change, so no facet holds them. A new facet is added here first.
 * Flat free-text tags had drifted to 206 values for 119 nodes by 2026-09-13.
 */
const TAG_FACETS = {
  org: 'an organisation the node involves, outside that organisation\'s own topic folder',
  rel: 'how a person relates to the owner',
  tech: 'a language, library, platform or tool',
  field: 'a technical discipline',
  method: 'a technique, model family, task or metric',
  domain: 'the application area',
  venue: 'where a paper was published',
  activity: 'the kind of undertaking: publication, internship, study, personal project',
  form: 'the shape of the content: reference, glossary, timeline, full text',
  subject: 'a recurring concern or theme no other facet covers',
};
// ------------------------------------------------------------------ Obsidian

/**
 * Every plugin's data.json is committed (2026-09-16), so a secret typed into a
 * plugin's settings would reach the repo (D66). A setting is a secret when its
 * key ends like one and holds a non-empty string, or when any string value has
 * the shape of a well-known token.
 */
const SECRET_SETTING_KEY = /(?:api[-_]?key|secret|password|passwd|token|bearer|credential|private[-_]?key)s?$/i;
const SECRET_VALUE_SHAPE = /^(?:sk-[\w-]{20,}|ghp_\w{30,}|github_pat_\w{20,}|xox[abp]-[\w-]{10,}|AIza[\w-]{30,}|ntn_\w{30,}|secret_\w{30,})$/;

/**
 * Where a markdown file may live outside wiki/ (D68). Plugins create notes on
 * their own defaults — Daily notes at the vault root, Importer in a root folder
 * per source, Text Extractor beside nothing — and a note anywhere else is one
 * no index reads. raw/ is the inbox, compiled into wiki/ and then moved to
 * raw/_compiled/.
 */
const NOTE_HOMES = ['raw', 'output', 'tools', 'templates', 'docs', 'bench'];
// bench/ is its own vault, scored by tools/bench.js; it needs no folder icons.
const ICON_EXEMPT = ['bench'];
// Folders that hold whole vaults of their own — drawings included — which
// their own build validates, not this one (D84).
const NESTED_VAULTS = ['bench'];
// SETUP.md is the setup agent's instructions; it is deleted when setup completes.
const ROOT_NOTES = ['CLAUDE.md', 'HANDOFF.md', 'README.md', 'SETUP.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md', 'CHANGELOG.md', 'MAINTAINING.md', 'UPGRADING.md', 'ROADMAP.md', 'AGENTS.md', 'THIRD_PARTY_NOTICES.md'];
/** Excalidraw drawings are markdown files; they live here and never under wiki/ (D68). */
const DRAWINGS_FOLDER = 'Excalidraw';
const DRAWING_SUFFIX = '.excalidraw.md';
const RAW_COMPILED = '_compiled';

/**
 * NotebookLM may be asked about a source during a compile, but it never settles
 * anything (D74). It answers from the sources it was given and has no notion of
 * a claim the vault later corrected: in the reference vault it reported a
 * person's old job title — faithfully, because an old export it had been handed
 * still said so, though that claim had long been fenced in probes.json. A notebook is also disposable, so a
 * notebook id names nothing a later session can check.
 *
 * So a claim in the vault is never attributed to it. Every finding it raises is
 * confirmed against the file in raw/ and attributed to that file. Logs and
 * verbatim nodes are exempt: a log recording what a tool reported on a date is
 * history, not a claim the vault asserts.
 */
const NOTEBOOKLM_ATTRIBUTION = /\b(?:per|according to|sourced from|as confirmed by)\s+notebook\s?lm\b|\bnotebook\s?lm\s+(?:says|said|found|finds|reports?|reported|confirms?|confirmed|states?|shows?|indicates?)\b|^\s*source:\s*notebook\s?lm\b/im;
const NOTEBOOK_ID = /\bnotebook(?:\s+id)?[:\s]+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;


/**
 * Obsidian settings the vault's rules depend on (D69). A running Obsidian holds
 * settings in memory and writes them back when anything changes, so an edit
 * made to these files while it is open can silently revert — the audit checks
 * each one. `path` is a dot path inside the JSON file.
 */
const OBSIDIAN_SETTINGS = [
  { file: '.obsidian/app.json', path: 'attachmentFolderPath', want: './assets', why: 'a pasted image lands in assets/ beside its note (D52)' },
  { file: '.obsidian/app.json', path: 'newFileLocation', want: 'folder', why: 'a note made in Obsidian starts in the raw/ inbox, not the vault root (D68)' },
  { file: '.obsidian/app.json', path: 'newFileFolderPath', want: 'raw', why: 'a note made in Obsidian starts in the raw/ inbox, not the vault root (D68)' },
  { file: '.obsidian/daily-notes.json', path: 'folder', want: 'raw/daily', why: 'a daily note from Calendar lands in the inbox for compile (D68)' },
  { file: '.obsidian/plugins/obsidian-excalidraw-plugin/data.json', path: 'embedUseExcalidrawFolder', required: true, want: true, why: 'a drawing embedded from a wiki note lands in Excalidraw/, not a topic assets/ folder (D68)' },
  { file: '.obsidian/plugins/omnisearch/data.json', path: 'httpApiEnabled', want: false, why: 'the search API has no login and answers any web page open in a browser on this machine (D69)' },
  { file: '.obsidian/plugins/obsidian-local-images-plus/data.json', path: 'PngToJpegLocal', want: false, why: 'a pasted diagram stays a lossless PNG; on, it is re-encoded as JPEG at quality 80 and the PNG deleted (D69)' },
  { file: '.obsidian/plugins/templater-obsidian/data.json', path: 'templates_folder', want: 'templates', why: 'Insert Template offers the vault templates (D69)' },
  { file: '.obsidian/plugins/templater-obsidian/data.json', path: 'ignore_folders_on_creation', contains: { folder: 'wiki' }, why: 'if trigger-on-creation is ever switched on, notes written into wiki/ are not re-parsed as templates and rewritten (D69)' },
  { file: '.obsidian/plugins/obsidian-linter/data.json', path: 'filesToIgnore', contains: { label: 'logs, verbatim full texts and generated files' }, why: 'a lint never reformats a log, a verbatim full text or a generated file (D69)' },
  { file: '.obsidian/plugins/obsidian-linter/data.json', path: 'foldersToIgnore', contains: 'Excalidraw', why: 'a lint never reformats a drawing — the Excalidraw plugin warns that changes below "# Excalidraw Data" can corrupt one (D71)' },
  { file: '.obsidian/plugins/obsidian-excalidraw-plugin/data.json', path: 'folder', required: true, want: 'Excalidraw', why: 'a drawing made in Obsidian starts in Excalidraw/, where the builder and tools/excalidraw.js look for drawings (D71)' },
  { file: '.obsidian/plugins/obsidian-excalidraw-plugin/data.json', path: 'compress', required: true, want: false, why: 'a drawing saves as plain JSON, so a git diff shows what changed in it (D71)' },
];

// Graph colour groups (D86). One colour per folder in Obsidian's graph:
// each folder directly inside a perChild root, one for the whole of a
// wholeTree root, and every other folder with notes directly inside it.
// background null switches the tool and the build's check off; setup asks
// the owner for their theme's background as RGB before switching it on.
const GRAPH = {
  background: null,
  minContrast: 4.5,
  minDeltaE: 20,
  fallbackDeltaE: 15,
  perChild: ['wiki'],
  wholeTree: ['Excalidraw'],
  exempt: ['raw', 'output', 'bench'],
  // Graph nodes no colour group reaches, such as tag and attachment nodes:
  // { name, setting: '<theme>@@<setting-id>@@dark', colour: [r, g, b] }. Their
  // colours count in every floor above; the tool sets them through Style
  // Settings when it is installed. Empty until setup learns the owner's theme.
  themeNodes: [],
};

/** Tags a topic folder already implies, so a node inside it never carries them (D65). */
// An engagement topic implies its organisation: { 'acme-engagement': ['org/acme'], ... }
const TOPIC_IMPLIED_TAGS = { career: ['subject/career'] };
/** Tag values that drifted from the canonical form on the right (D65). */
const TAG_SYNONYMS = {
  rl: 'reinforcement-learning', ml: 'machine-learning', dl: 'deep-learning', cv: 'computer-vision',
  web: 'frontend', audio: 'speech', practice: 'learning', optimisation: 'performance', optimization: 'performance',
  benchmark: 'evaluation', stack: 'skills', 'side-project': 'personal-project',
};

module.exports = {
  OWNER, GRAPH,
  MAX_BULLETS, MAX_CARD_BYTES, NEAR_CAP_MARGIN, BODY_CAPS, MIN_BULLETS, COST_TARGET_MIN_X, BASELINE_BYTES,
  KIND_SUBFOLDERS, MEDIA_SUBFOLDER, KIND_TOPICS, MEDIA_EXT, IMAGE_EXT, MAX_IMAGE_KB, MIN_TRANSCRIPTION_CHARS, STALE_STATUS_DAYS,
  OPEN_STATUSES, CLOSED_STATUSES, NOW_PATH, NOW_ALIASES, VOLATILE_MARKERS,
  MAX_IDENTIFIER_NODES, RELATIVE_LOG_ALIASES, MAX_SUMMARY_CHARS, CONTEXT_BUDGET_TOKENS, OWNER_DEFECTS_FROM,
  TAG_FACETS, TOPIC_IMPLIED_TAGS, TAG_SYNONYMS, SECRET_SETTING_KEY, SECRET_VALUE_SHAPE,
  NOTE_HOMES, ICON_EXEMPT, NESTED_VAULTS, ROOT_NOTES, DRAWINGS_FOLDER, DRAWING_SUFFIX, RAW_COMPILED, OBSIDIAN_SETTINGS,
  NOTEBOOKLM_ATTRIBUTION, NOTEBOOK_ID,
};
