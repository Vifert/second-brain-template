'use strict';
// Shared text handling for every vault tool.
//
// WHY THIS FILE EXISTS
// --------------------
// On 2026-09-09 an audit probe reported four phantom "unroutable" terms. The
// cause: the probe lowercased the index but not the query string, so any term
// containing a capital letter ("where do I live") appeared to route nowhere
// when it routed fine. A test that invents defects is worse than no test.
//
// The fix is structural, not a convention: there is exactly ONE normaliser, and
// every comparison in every tool goes through `matches()` so it is impossible
// to normalise one side and forget the other. Do not hand-roll `.toLowerCase()`
// comparisons in a tool — use these helpers. `npm test` equivalent:
//   node tools/selftest.js

/** Canonical normalisation for any text being compared. */
function norm(s) {
  return String(s == null ? '' : s)
    .normalize('NFKD')          // fold accents/compat forms apart
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‐-―−]/g, '-')  // dashes -> hyphen
    .replace(/[‘’‛]/g, "'")   // curly -> straight quotes
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Does `haystack` contain `needle`? BOTH sides are normalised here — that is the
 * entire point. Callers must never pre-normalise only one argument.
 */
function matches(haystack, needle) {
  const n = norm(needle);
  if (!n) return false;
  return norm(haystack).includes(n);
}

/** Flatten a value to a single TSV-safe cell (no tabs, no newlines). */
function cell(s) {
  return String(s == null ? '' : s).replace(/[\t\r\n]+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// US/UK spelling variants.
//
// The vault's prose may be written in one spelling ("optimisation") while its
// owner types the other ("optimization"). Queries are plain `grep -i` against
// _index.tsv, so a normaliser cannot help — the other spelling has to be
// physically present in the file. build-index.js appends these variants to
// each row's aliases column (never to the source .md files). `cut -f1,8` at
// query time never prints that column, so the extra words cost nothing.
// ---------------------------------------------------------------------------

// Explicit pairs where a suffix rule would be wrong or too broad (-our/-or etc).
const PAIRS = [
  ['behaviour', 'behavior'], ['colour', 'color'], ['favour', 'favor'], ['honour', 'honor'],
  ['labour', 'labor'], ['neighbour', 'neighbor'], ['centre', 'center'], ['catalogue', 'catalog'],
  ['programme', 'program'], ['defence', 'defense'], ['licence', 'license'], ['modelling', 'modeling'],
  ['labelled', 'labeled'], ['cancelled', 'canceled'], ['travelled', 'traveled'], ['analyse', 'analyze'],
  ['analysed', 'analyzed'], ['analysing', 'analyzing'], ['grey', 'gray'], ['judgement', 'judgment'],
];
const PAIR_MAP = new Map();
for (const [uk, us] of PAIRS) { PAIR_MAP.set(uk, us); PAIR_MAP.set(us, uk); }
// -our words and their derived forms (D47): "flavours" once routed nowhere
// because only the bare word "flavour" had a pair.
const OUR = ['behaviour', 'colour', 'favour', 'flavour', 'honour', 'humour', 'labour', 'neighbour', 'rumour', 'harbour',
  'armour', 'endeavour', 'vapour', 'odour', 'savour', 'rigour', 'vigour', 'tumour', 'parlour'];
for (const uk of OUR) {
  for (const suf of ['', 's', 'ed', 'ing', 'ite', 'ites', 'able', 'ful', 'al', 'hood', 'less', 'ist', 'ists']) {
    const us = uk.replace(/our$/, 'or') + suf;
    PAIR_MAP.set(uk + suf, us); PAIR_MAP.set(us, uk + suf);
  }
}

// Words ending -ise that are NOT UK variants of an -ize word.
const ISE_STOP = new Set(('advise arise comprise compromise concise despise devise disguise enterprise ' +
  'excise exercise expertise franchise improvise merchandise noise otherwise paradise precise premise ' +
  'promise raise revise rise supervise surmise surprise televise wise likewise clockwise chastise ' +
  'demise reprise treatise praise poise cruise bruise anise valise incise circumcise').split(' '));

function variantsOfWord(w) {
  const out = new Set();
  if (PAIR_MAP.has(w)) out.add(PAIR_MAP.get(w)); // pairs first — "grey" is shorter than the guard (D47)
  if (w.length < 6) return out;
  // "size" words are not -ise/-ize variants: "oversized" once produced "oversised" (D47).
  if (/siz(?:e[ds]?|es|ing)$/.test(w) || /^advertis/.test(w)) return out;
  const stem = w.replace(/(isations?|izations?|ise[ds]?|ize[ds]?|ising|izing|iser|izer)$/, '');
  const base = stem + 'ise';
  if (!ISE_STOP.has(base) && stem !== w && stem.length >= 3) {
    const swap = { isation: 'ization', ization: 'isation', isations: 'izations', izations: 'isations',
      ise: 'ize', ize: 'ise', ised: 'ized', ized: 'ised', ises: 'izes', izes: 'ises',
      ising: 'izing', izing: 'ising', iser: 'izer', izer: 'iser' };
    const suf = w.slice(stem.length);
    if (swap[suf]) out.add(stem + swap[suf]);
  }
  // -yse/-yze only for real stems: "DisplaySE" once produced the junk "displayze" (D34).
  const yse = w.match(/^(anal|paral|catal|dial|electrol|hydrol|psychoanal)(yse[ds]?|yze[ds]?|ysing|yzing)$/);
  if (yse) {
    const swap = { yse: 'yze', yze: 'yse', ysed: 'yzed', yzed: 'ysed', yses: 'yzes', yzes: 'yses', ysing: 'yzing', yzing: 'ysing' };
    if (swap[yse[2]]) out.add(yse[1] + swap[yse[2]]);
  }
  return out;
}

/** All US/UK alternates for the words in `text`, excluding words already present. */
function spellingVariants(text) {
  const words = new Set((norm(text).match(/[a-z]+/g) || []));
  const out = new Set();
  for (const w of words) for (const v of variantsOfWord(w)) if (!words.has(v)) out.add(v);
  return [...out].sort();
}

/**
 * Hyphen-free forms of the hyphenated words in `text` (D60). grep is literal,
 * so "neuro cognitive" and "neurocognitive" never met "Neuro-Cognitive", and
 * "preprod" never met "pre-prod". Only words whose parts are all letters (two
 * or more), so dates, versions and ctrl-A are left alone. Index-only, like the
 * spelling variants.
 */
function hyphenVariants(text) {
  const out = new Set();
  for (const m of String(text).matchAll(/\b[A-Za-z]{2,}(?:-[A-Za-z]{2,})+\b/g)) {
    const w = norm(m[0]);
    out.add(w.replace(/-/g, ' '));
    out.add(w.replace(/-/g, ''));
  }
  return [...out].filter(v => !matches(text, v)).sort();
}

/**
 * Exactly what the L0 route does: `grep -i term _index.tsv` — a literal,
 * case-insensitive, line-by-line search (D46). Routing probes must use this,
 * not the forgiving matches(), or a term that grep cannot find still passes:
 * a curly apostrophe, or a phrase that only exists split across two columns.
 */
function grepI(text, needle) {
  const n = String(needle == null ? '' : needle);
  if (!n) return false;
  const re = new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return String(text).split('\n').some(l => re.test(l));
}

/**
 * A `_forbidden` fence is a regex applied case-insensitively to one line at a
 * time, exactly as the audit applies it. Each fence ships with examples:
 * `catches` — wrong claims it must match — and `passes` — nearby true claims
 * it must let through. In the reference vault a fence against a person's
 * wrong employer was written as "is his (<employer>)? manager", so a later,
 * true statement about that person's role would have failed the audit (D50).
 * Returns a list of problems; empty means the fence behaves.
 */
function fenceProblems(f) {
  let re;
  try { re = new RegExp(f.pattern, 'i'); } catch (e) { return [`pattern does not compile (D50): ${e.message}`]; }
  const out = [];
  const catches = Array.isArray(f.catches) ? f.catches : [];
  const passes = Array.isArray(f.passes) ? f.passes : [];
  if (!f.reason) out.push('no reason (D37)');
  if (!catches.length) out.push('no `catches` example — a wrong claim it must match (D50)');
  if (!passes.length) out.push('no `passes` example — a nearby true claim it must let through (D50)');
  for (const c of catches) if (!re.test(c)) out.push(`misses its own wrong claim (D50): "${c}"`);
  for (const p of passes) if (re.test(p)) out.push(`blocks a true claim (D50): "${p}"`);
  return out;
}

module.exports = { norm, matches, cell, spellingVariants, hyphenVariants, grepI, fenceProblems };
