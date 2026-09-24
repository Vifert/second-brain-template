'use strict';
// Graph colour groups (D86): one colour per folder in Obsidian's graph,
// visible on the owner's background, distinct from every other, stable as
// folders arrive. Pure functions; tools/graph-colours.js writes graph.json.

const fs = require('fs');
const path = require('path');

const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
/** WCAG contrast ratio, 1–21. */
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

function toLab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
  const Y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
  const Z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}

/** CIEDE2000 colour difference between two CIELAB colours. */
function deltaELab([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180;
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
  const C1 = Math.hypot(a1p, b1), C2 = Math.hypot(a2p, b2);
  const hue = (x, y) => { const t = Math.atan2(y, x) / rad; return t < 0 ? t + 360 : t; };
  const h1 = hue(a1p, b1), h2 = hue(a2p, b2);
  let dh = h2 - h1;
  if (C1 * C2 === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dL = L2 - L1, dC = C2 - C1, dH = 2 * Math.sqrt(C1 * C2) * Math.sin((dh * rad) / 2);
  const Lp = (L1 + L2) / 2, Cp = (C1 + C2) / 2;
  let hp = h1 + h2;
  if (C1 * C2 !== 0) { if (Math.abs(h1 - h2) > 180) hp += hp < 360 ? 360 : -360; hp /= 2; }
  const T = 1 - 0.17 * Math.cos((hp - 30) * rad) + 0.24 * Math.cos(2 * hp * rad) + 0.32 * Math.cos((3 * hp + 6) * rad) - 0.2 * Math.cos((4 * hp - 63) * rad);
  const SL = 1 + (0.015 * (Lp - 50) ** 2) / Math.sqrt(20 + (Lp - 50) ** 2), SC = 1 + 0.045 * Cp, SH = 1 + 0.015 * Cp * T;
  const RT = -2 * Math.sqrt(Cp ** 7 / (Cp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hp - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}
const deltaE = (a, b) => deltaELab(toLab(a), toLab(b));

const hasNote = (abs, deep) => fs.readdirSync(abs, { withFileTypes: true }).some(e =>
  e.isFile() ? e.name.endsWith('.md') : deep && e.isDirectory() && !e.name.startsWith('.') && hasNote(path.join(abs, e.name), true));

/** The folders that get a colour, sorted (see GRAPH in rules.js). */
function colourFolders(vaultAbs, cfg) {
  const out = [];
  const walk = (abs, rel) => {
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
      const r = rel ? `${rel}/${e.name}` : e.name, p = path.join(abs, e.name);
      if (!rel && cfg.exempt.includes(e.name)) continue;
      if (!rel && cfg.perChild.includes(e.name)) {
        for (const t of fs.readdirSync(p, { withFileTypes: true })) if (t.isDirectory() && !t.name.startsWith('.') && hasNote(path.join(p, t.name), true)) out.push(`${r}/${t.name}`);
        continue;
      }
      if (!rel && cfg.wholeTree.includes(e.name)) { if (hasNote(p, true)) out.push(r); continue; }
      if (hasNote(p, false)) out.push(r);
      walk(p, r);
    }
  };
  walk(vaultAbs, '');
  return out.sort();
}

/** The folder a note's graph colour comes from, or null. */
function folderOf(rel, folders) {
  return folders.filter(f => rel.startsWith(f + '/')).sort((a, b) => b.length - a.length)[0] || null;
}

/** Links between folders from _links.tsv rows, keyed "a|b" with a < b. */
function linkWeights(rows, folders) {
  const w = new Map();
  const of = p => (folders ? folderOf(p, folders) : p.split('/').slice(0, p.startsWith('wiki/') ? 2 : -1).join('/'));
  for (const [s, t] of rows) {
    const a = of(s || ''), b = of(t || '');
    if (!a || !b || a === b) continue;
    const k = [a, b].sort().join('|');
    w.set(k, (w.get(k) || 0) + 1);
  }
  return w;
}

function candidates(cfg) {
  const out = [];
  for (let r = 0; r < 256; r += 15) for (let g = 0; g < 256; g += 15) for (let b = 0; b < 256; b += 15) {
    const c = [r, g, b];
    if (Math.max(...c) - Math.min(...c) > 40 && contrast(c, cfg.background) >= cfg.minContrast) out.push(c);
  }
  return out;
}
const chroma = c => { const [, a, b] = toLab(c); return Math.hypot(a, b); };

// The candidate farthest from every placed colour, where closeness to a
// strongly linked folder counts double at most — neighbours that sit side by
// side in the graph get the most different colours.
function pick(pool, placed, folder, weights, floor) {
  const wmax = Math.max(1, ...weights.values());
  let best = null, bestScore = -1;
  for (const c of pool) {
    let score = placed.size ? Infinity : chroma(c), fits = true;
    for (const [f2, c2] of placed) {
      const d = deltaE(c, c2);
      if (d < floor) { fits = false; break; }
      score = Math.min(score, d / (1 + (weights.get([folder, f2].sort().join('|')) || 0) / wmax));
    }
    if (fits && score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

/**
 * Colours for every member — folders, and theme nodes the tool can set — with
 * existing colours kept where they still clear the floors (D86). `fixed` are
 * colours the tool cannot change (a theme node with no way to set it): every
 * member keeps its distance from them, and they are never returned.
 */
function assign(members, existing, weights, cfg, fixed = new Map()) {
  const pool = candidates(cfg);
  const total = f => [...weights].reduce((s, [k, v]) => s + (k.split('|').includes(f) ? v : 0), 0);
  const order = list => [...list].sort((a, b) => total(b) - total(a) || a.localeCompare(b));
  const own = placed => new Map([...placed].filter(([f]) => !fixed.has(f)));
  const fresh = floor => {
    const placed = new Map(fixed);
    for (const f of order(members)) { const c = pick(pool, placed, f, weights, floor); if (!c) return null; placed.set(f, c); }
    return own(placed);
  };
  // Keep an existing colour only if it is visible and clears the full floor
  // against everything kept before it, most-linked first; the rest are
  // reassigned below. Picking is deterministic, so a colour that was relaxed
  // for want of room comes back the same while nothing around it changes.
  const placed = new Map(fixed);
  for (const f of order(members.filter(m => existing.has(m)))) {
    const c = existing.get(f);
    if (contrast(c, cfg.background) >= cfg.minContrast && [...placed.values()].every(d => deltaE(c, d) >= cfg.minDeltaE)) placed.set(f, c);
  }
  const relaxed = [];
  for (const f of order(members.filter(x => !placed.has(x)))) {
    let c = pick(pool, placed, f, weights, cfg.minDeltaE);
    if (!c) { c = pick(pool, placed, f, weights, cfg.fallbackDeltaE); if (c) relaxed.push(f); }
    if (!c) {
      const all = fresh(cfg.minDeltaE) || fresh(cfg.fallbackDeltaE);
      if (!all) throw new Error(`graph-colours: ${members.length} colours cannot all clear ΔE ${cfg.fallbackDeltaE}`);
      return { colours: all, relaxed: [], recoloured: true };
    }
    placed.set(f, c);
  }
  return { colours: own(placed), relaxed, recoloured: false };
}

/**
 * Theme node colours — tags, attachments — which no colour group reaches. They
 * are set through the Style Settings plugin when it is installed (`settable`);
 * otherwise they are what the theme shows, and fixed.
 */
function themeColours(vaultAbs, cfg) {
  const dir = path.join(vaultAbs, '.obsidian', 'plugins', 'obsidian-style-settings');
  const file = path.join(dir, 'data.json');
  const settable = fs.existsSync(path.join(dir, 'manifest.json'));
  let data = {};
  try { if (fs.existsSync(file)) data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { data = {}; }
  const colours = new Map((cfg.themeNodes || []).map(t => [t.name, data[t.setting] ? fromHex(data[t.setting]) : t.colour]));
  return { colours, settable, data, file };
}

const toInt = ([r, g, b]) => (r << 16) | (g << 8) | b;
const fromInt = n => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
function fromHex(h) { const m = String(h).trim().match(/^#?([0-9a-f]{6})$/i); return m ? fromInt(parseInt(m[1], 16)) : null; }
const QUERY = /^path:"(.+)\/"$/;

/** graph.json colour groups, deeper folders first because Obsidian uses the first match. */
function groups(colours) {
  return [...colours].sort(([a], [b]) => b.split('/').length - a.split('/').length || a.localeCompare(b))
    .map(([f, c]) => ({ query: `path:"${f}/"`, color: { a: 1, rgb: toInt(c) } }));
}
function existingColours(list) {
  const m = new Map();
  for (const g of list || []) { const q = String(g.query || '').trim().match(QUERY); if (q && g.color) m.set(q[1], fromInt(g.color.rgb)); }
  return m;
}

/** What the build warns about (D86); `theme` holds the tag and attachment node colours. */
function problems(folders, list, cfg, theme = new Map()) {
  const out = [];
  const have = existingColours(list);
  const label = f => (theme.has(f) ? f : `${f}/`);
  for (const g of list || []) if (!QUERY.test(String(g.query || '').trim())) out.push(`a colour group this tool does not own: ${g.query}`);
  for (const f of folders) if (!have.has(f)) out.push(`${f}/ has no colour group`);
  for (const f of have.keys()) if (!folders.includes(f)) out.push(`the group for ${f}/ names a folder that no longer gets a colour`);
  const all = [...have, ...theme];
  for (const [f, c] of all) if (contrast(c, cfg.background) < cfg.minContrast) out.push(`${label(f)} ${hex(c)} has contrast ${contrast(c, cfg.background).toFixed(1)}:1, under ${cfg.minContrast}:1`);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const d = deltaE(all[i][1], all[j][1]);
    if (d < cfg.fallbackDeltaE) out.push(`${label(all[i][0])} and ${label(all[j][0])} are only ΔE ${d.toFixed(1)} apart`);
  }
  return out;
}

module.exports = { contrast, deltaE, deltaELab, colourFolders, folderOf, linkWeights, assign, themeColours, groups, existingColours, problems, hex, toInt, fromInt, fromHex };
