'use strict';
// Checks a single write can break, run by the builder on every build. They
// lived in audit.js until 2026-09-19; the audit now runs only when the owner
// types /vault-audit, so a check that catches a mistake the moment a capture
// makes it belongs here. A node is { rel, fm, lines, code }: lines is the file
// split on '\n', code the same with fenced code blanked (V.blankFences).

const path = require('path');
const V = require('./vault');
const R = require('./rules');
const { fenceProblems } = require('./text');

// Logs are dated history and verbatim nodes are the source's own words: both
// keep what they say.
const exempt = n => n.fm.kind === 'log' || n.fm.verbatim === 'true';
const slugOf = n => path.posix.basename(n.rel, '.md');

// Corrected claims that crept back, one hit per line per fence.
function forbiddenClaims(nodes, fences) {
  const res = fences.map(f => ({ reason: f.reason, re: new RegExp(f.pattern, 'i') }));
  const hits = [];
  for (const n of nodes) {
    if (exempt(n)) continue;
    n.lines.forEach((l, i) => { for (const f of res) if (f.re.test(l)) hits.push({ rel: n.rel, line: i + 1, reason: f.reason }); });
  }
  return hits;
}

// A fence carries the wrong claims it must catch and the true ones it must let
// through; each failing example is one issue.
function fenceExampleIssues(fences) {
  return fences.flatMap(f => fenceProblems(f).map(x => `/${String(f.pattern).slice(0, 36)}…/ ${x}`));
}

// A [sic] that points at another place in the same source picks a side in a
// contradiction nobody settled.
function sidedSic(nodes) {
  const hits = [];
  for (const n of nodes) {
    if (n.fm.verbatim !== 'true') continue;
    n.lines.forEach((l, i) => { for (const b of V.sicTakesSide(l)) hits.push({ rel: n.rel, line: i + 1, note: b }); });
  }
  return hits;
}

// A person named in a node's body is linked from it. The owner is the subject
// of the whole vault, so naming them needs no link.
function unlinkedPeople(nodes, ownerSlug) {
  const people = nodes.filter(n => n.rel.includes('/people/') && slugOf(n) !== ownerSlug).map(n => ({
    slug: slugOf(n),
    res: V.mentionNames(n.fm.title, Array.isArray(n.fm.aliases) ? n.fm.aliases : n.fm.aliases ? [n.fm.aliases] : [])
      .filter(x => x.length >= 4).map(x => V.nameRegex(x)),
  }));
  const hits = [];
  for (const n of nodes) {
    if (exempt(n) || n.rel === R.NOW_PATH) continue;
    const text = n.code.map(l => V.blankInlineCode(l));
    const start = n.lines.indexOf('---', 1) + 1;
    const linked = new Set(V.extractLinks(n.lines.join('\n')).links.map(l => l.target.split('/').pop()));
    for (const p of people) {
      if (p.slug === slugOf(n) || linked.has(p.slug)) continue;
      const i = text.findIndex((l, k) => k >= start && p.res.some(re => re.test(l)));
      if (i >= 0) hits.push({ rel: n.rel, line: i + 1, slug: p.slug });
    }
  }
  return hits;
}

module.exports = { forbiddenClaims, fenceExampleIssues, sidedSic, unlinkedPeople };
