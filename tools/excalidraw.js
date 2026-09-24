#!/usr/bin/env node
'use strict';
// Create, edit, inspect and render the vault's Excalidraw drawings — the
// engine behind the vault-excalidraw skill (.claude/skills/vault-excalidraw/).
//
//   node tools/excalidraw.js list                         every drawing, newest first, and where it is embedded
//   node tools/excalidraw.js info <drawing>               shapes, text and connectors, with ids
//   node tools/excalidraw.js lint <drawing>               overlaps, overflowing labels, connectors through shapes, broken refs
//   node tools/excalidraw.js transcribe <drawing>         Mermaid + notes draft for a node's transcription
//   node tools/excalidraw.js hash <drawing>               the content hash a transcription records (D72)
//   node tools/excalidraw.js render <drawing> [--out f.png] [--scale 2] [--dark]
//   node tools/excalidraw.js new <drawing> <spec.json|->  create a drawing from element skeletons
//   node tools/excalidraw.js apply <drawing> <patch.json|->  {delete, create, update, move} on an existing drawing
//   node tools/excalidraw.js save <drawing> <scene.json|->   write a scene (e.g. from the live canvas) into a drawing, keeping its links and embedded files
//   node tools/excalidraw.js check                        prove the renderer works on this machine
//
// <drawing> is a vault path, or a name found under Excalidraw/ ("query-ladder",
// "Drawing 2026-09-17 18.02.11"). new/apply/save/render print JSON with the
// PNG path to look at; mutating commands re-read the file before writing and
// stop if Obsidian changed it meanwhile.
//
// Rendering and text measurement run the Excalidraw library that ships inside
// the vault's own Obsidian Excalidraw plugin, in a headless Edge or Chrome with
// the network blocked: what you see is what the plugin draws, and nothing is
// downloaded. Set EXCALIDRAW_BROWSER to use another Chromium binary.

const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const cp = require('child_process');
const X = require('./lib/excalidraw');
const R = require('./lib/rules');
const V = require('./lib/vault');

const VAULT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const PLUGIN_DIR = path.join(VAULT, '.obsidian', 'plugins', 'obsidian-excalidraw-plugin');
const WORK = path.join(os.tmpdir(), 'vault-excalidraw');
const GAP = 6;
const SLOTS = 6;

const rel = p => path.relative(VAULT, p).split(path.sep).join('/');
const die = (msg, code = 1) => { console.error(`excalidraw: ${msg}`); process.exit(code); };

// ------------------------------------------------------------ locating drawings
function allDrawings() {
  const root = path.join(VAULT, R.DRAWINGS_FOLDER);
  if (!fs.existsSync(root)) return [];
  return V.walk(root, ['.md'], d => d.startsWith('.')).filter(X.isDrawingPath);
}

function resolveDrawing(arg, mustExist = true) {
  if (!arg) die('name a drawing');
  const direct = path.resolve(VAULT, arg);
  const withExt = X.isDrawingPath(direct) ? direct : direct + (direct.endsWith('.excalidraw') ? '.md' : X.DRAWING_EXT);
  if (fs.existsSync(withExt)) return withExt;
  // A path is taken as given; only a bare name is looked up under Excalidraw/.
  if (/[\\/]/.test(arg)) {
    if (mustExist) die(`no drawing at ${rel(withExt)} — run: node tools/excalidraw.js list`);
    if (!rel(withExt).startsWith(R.DRAWINGS_FOLDER + '/')) die(`a new drawing goes under ${R.DRAWINGS_FOLDER}/<topic>/ (D68): ${rel(withExt)}`);
    return withExt;
  }
  const want = path.basename(arg).replace(/\.excalidraw(\.md)?$/, '');
  const all = allDrawings();
  const exact = all.filter(p => path.basename(p, X.DRAWING_EXT) === want);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) die(`"${arg}" names ${exact.length} drawings: ${exact.map(rel).join(', ')} — give the path`);
  if (!mustExist) {
    if (!rel(withExt).startsWith(R.DRAWINGS_FOLDER + '/')) die(`a new drawing goes under ${R.DRAWINGS_FOLDER}/<topic>/ (D68): ${rel(withExt)}`);
    return withExt;
  }
  const loose = all.filter(p => new RegExp(want.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(path.basename(p)));
  if (loose.length === 1) return loose[0];
  if (loose.length > 1) die(`"${arg}" matches ${loose.length} drawings: ${loose.map(rel).join(', ')}`);
  die(`no drawing "${arg}" — run: node tools/excalidraw.js list`);
}

function readDrawing(file) {
  const text = fs.readFileSync(file, 'utf8');
  const parsed = X.parseDrawing(text);
  if (parsed.error) die(`${rel(file)}: ${parsed.error}`);
  return { text, parsed };
}

function readInput(arg) {
  if (!arg) die('give a JSON file, or - for stdin');
  const raw = arg === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.resolve(arg), 'utf8');
  try { return JSON.parse(raw); } catch (e) { die(`input is not JSON: ${e.message}`); }
}

// Wiki nodes that embed a drawing, and whether their recorded hash is current.
function embedsOf() {
  const out = new Map();
  for (const p of V.walk(path.join(VAULT, 'wiki'))) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    const blanked = V.blankFences(lines);
    blanked.forEach((line, i) => {
      for (const m of line.matchAll(/!\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
        const base = X.drawingLinkBase(m[1]);
        if (!base) continue;
        let j = i + 1;
        while (j < lines.length && !/^#{1,3}\s/.test(lines[j])) j++;
        const recorded = X.hashComment(lines.slice(i, j).join('\n'));
        if (!out.has(base)) out.set(base, []);
        out.get(base).push({ node: rel(p), line: i + 1, recorded });
      }
    });
  }
  return out;
}

// ------------------------------------------------------------ the browser
// Every Chromium-based browser installed, best first (D77). EXCALIDRAW_BROWSER,
// when set, is tried first and is not required to exist as a file (it may be a
// command on PATH).
function browserCandidates() {
  const env = process.env;
  const c = [];
  if (process.platform === 'win32') {
    for (const pf of [env['PROGRAMFILES(X86)'], env.PROGRAMFILES, env.LOCALAPPDATA].filter(Boolean)) {
      c.push(path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'), path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    }
    const pw = env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'ms-playwright');
    if (pw && fs.existsSync(pw)) for (const d of fs.readdirSync(pw).filter(d => /^chromium/.test(d)).sort().reverse()) {
      c.push(path.join(pw, d, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'), path.join(pw, d, 'chrome-win', 'chrome.exe'));
    }
  } else if (process.platform === 'darwin') {
    c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium');
  } else {
    for (const b of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
      for (const dir of String(env.PATH || '').split(':')) c.push(path.join(dir, b));
    }
  }
  const found = [...new Set(c)].filter(p => fs.existsSync(p));
  if (env.EXCALIDRAW_BROWSER) found.unshift(env.EXCALIDRAW_BROWSER);
  if (!found.length) die('no Chromium-based browser found (Edge or Chrome) — set EXCALIDRAW_BROWSER to one');
  return [...new Set(found)];
}
// The browser that last returned a result; later renders in this run go straight to it.
let workingBrowser = null;

// The plugin keeps React and its Excalidraw build inside main.js as
// base64 deflate strings; unpack them once per plugin version.
function libraryFiles() {
  const main = path.join(PLUGIN_DIR, 'main.js');
  if (!fs.existsSync(main)) die('the Obsidian Excalidraw plugin is not installed at .obsidian/plugins/obsidian-excalidraw-plugin');
  const version = JSON.parse(fs.readFileSync(path.join(PLUGIN_DIR, 'manifest.json'), 'utf8')).version;
  const stat = fs.statSync(main);
  const dir = path.join(WORK, `lib-${version}-${stat.size}`);
  const react = path.join(dir, 'react.js'), lib = path.join(dir, 'excalidraw.js');
  if (!fs.existsSync(react) || !fs.existsSync(lib)) {
    const src = fs.readFileSync(main, 'utf8');
    const grab = re => {
      const m = src.match(re);
      if (!m) die(`plugin ${version}: its bundled ${re.source.slice(0, 40)}… was not found — the plugin's packaging changed; update tools/excalidraw.js`);
      return zlib.inflateSync(Buffer.from(m[1], 'base64')).toString('utf8');
    };
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(react, grab(/let REACT_PACKAGES = unpackBase64Deflate\("([^"]+)"\)/));
    fs.writeFileSync(lib, grab(/const unpackExcalidraw = \(\) => unpackBase64Deflate\("([^"]+)"\)/));
  }
  return { react, lib, version };
}

// A slot is a browser profile only one process may use at a time. A lock
// records its owner and goes stale after two minutes or when the owner is gone;
// it is released by writing "free", never by deleting anything.
function takeSlot() {
  for (let round = 0; round < 40; round++) {
    for (let k = 0; k < SLOTS; k++) {
      const dir = path.join(WORK, `slot-${k}`);
      fs.mkdirSync(dir, { recursive: true });
      const lock = path.join(dir, 'lock');
      let owner = '';
      try { owner = fs.readFileSync(lock, 'utf8'); } catch { /* no lock yet */ }
      const [pid, at] = owner.split(' ').map(Number);
      const alive = pid && (() => { try { process.kill(pid, 0); return true; } catch { return false; } })();
      if (owner && owner !== 'free' && alive && Date.now() - at < 120000) continue;
      const me = `${process.pid} ${Date.now()}`;
      fs.writeFileSync(lock, me);
      if (fs.readFileSync(lock, 'utf8') === me) return { dir, release: () => fs.writeFileSync(lock, 'free') };
    }
    cp.spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},500)']);
  }
  die('every render slot is busy — another render is running');
}

function pageScript() {
  // Runs inside the headless page. `L` is the plugin's Excalidraw build,
  // `VE` is tools/lib/excalidraw.js.
  const L = window.ExcalidrawLib, VE = window.VaultExcalidraw, GAP = window.__GAP;
  const LINEAR = t => t === 'arrow' || t === 'line';
  const clone = o => JSON.parse(JSON.stringify(o));
  const nonce = () => Math.floor(Math.random() * 2 ** 31);
  const touch = e => { e.version = (e.version || 1) + 1; e.versionNonce = nonce(); e.updated = Date.now(); };

  function skeleton(s) {
    const o = { ...s };
    if (typeof o.label === 'string') o.label = { text: o.label };
    if (o.from !== undefined) { o.start = typeof o.from === 'string' ? { id: o.from } : o.from; delete o.from; }
    if (o.to !== undefined) { o.end = typeof o.to === 'string' ? { id: o.to } : o.to; delete o.to; }
    if (o.backgroundColor && o.backgroundColor !== 'transparent' && !o.fillStyle) o.fillStyle = 'solid';
    // Excalidraw's own default corners, which the live canvas also assumes:
    // a rectangle or diamond drawn in the app is rounded unless made sharp.
    if (!('roundness' in o) && (o.type === 'rectangle' || o.type === 'diamond')) o.roundness = { type: o.type === 'rectangle' ? 3 : 2 };
    if (o.type === 'text' && o.text === undefined && o.label) { o.text = o.label.text; delete o.label; }
    return o;
  }
  const stub = el => ({ type: ['rectangle', 'ellipse', 'diamond'].includes(el.type) ? el.type : 'rectangle', id: el.id, x: el.x, y: el.y, width: el.width || 1, height: el.height || 1 });

  function fit(t, c) {
    if (!c) return;
    if (LINEAR(c.type)) {
      const [mx, my] = VE.polylineMidpoint(c);
      t.x = mx - t.width / 2; t.y = my - t.height / 2;
      return;
    }
    const k = c.type === 'ellipse' ? Math.SQRT2 : c.type === 'diamond' ? 2 : 1;
    const need = (t.height + 10) * k;
    if (Math.abs(c.height) < need) { c.height = need; touch(c); }
    t.x = c.x + c.width / 2 - t.width / 2;
    t.y = c.y + c.height / 2 - t.height / 2;
  }
  function setText(t, c, text, els) {
    const font = L.getFontString(t);
    const shown = c ? L.wrapText(text, font, L.getBoundTextMaxWidth(c, t)) : text;
    const m = L.measureText(shown, font, t.lineHeight || L.getLineHeight(t.fontFamily));
    Object.assign(t, { text: shown, originalText: text, rawText: text, width: m.width, height: m.height });
    touch(t);
    fit(t, c);
  }

  return async function run(job) {
    const res = { created: [], updated: [], deleted: [], warnings: [] };
    await L.loadSceneFonts?.(job.scene.elements || []);
    let els = clone((job.scene.elements || []).filter(e => !e.isDeleted));
    const map = () => new Map(els.map(e => [e.id, e]));
    // A text written with a short id was renamed on write (D73); the rename is
    // deterministic, so the id the caller used still resolves.
    const find = (m, id) => m.get(id) || m.get(VE.derivedBlockId(id)) || null;
    const missing = (op, id) => new Error(`${op}: no element ${id}${VE.BLOCK_ID.test(id) ? '' : ' (nor ' + VE.derivedBlockId(id) + ', the 8-character id it would have been given)'} — run: node tools/excalidraw.js info <drawing>`);
    const boundText = (e, m) => { const b = (e.boundElements || []).find(x => x && x.type === 'text' && m.has(x.id)); return b ? m.get(b.id) : null; };
    const patch = job.patch || {};
    const changed = new Map(); // id -> how far its centre moved

    for (const id of patch.delete || []) {
      const m = map();
      const el = find(m, id);
      if (!el) throw missing('delete', id);
      const kill = new Set([id]);
      for (const b of el.boundElements || []) {
        kill.add(b.id);
        if (b.type === 'arrow' && m.get(b.id)) for (const bb of m.get(b.id).boundElements || []) kill.add(bb.id);
      }
      els = els.filter(e => !kill.has(e.id));
      for (const e of els) {
        if (e.boundElements) e.boundElements = e.boundElements.filter(b => !kill.has(b.id));
        for (const k of ['startBinding', 'endBinding']) if (e[k] && kill.has(e[k].elementId)) { e[k] = null; touch(e); }
        if (e.containerId && kill.has(e.containerId)) e.containerId = null;
      }
      res.deleted.push(...kill);
    }

    const creates = (patch.create || []).map(skeleton);
    if (creates.length) {
      const have = map();
      for (const s of creates) if (s.id && have.has(s.id)) throw new Error(`create: id ${s.id} already exists — use update, or pick a new id`);
      const plain = creates.filter(s => !LINEAR(s.type));
      const lines = creates.filter(s => LINEAR(s.type));
      const first = plain.length ? L.convertToExcalidrawElements(plain, { regenerateIds: false }) : [];
      els.push(...first);
      const m = map();
      if (lines.length) {
        const stubs = new Map();
        for (const s of lines) {
          const S = s.start && s.start.id ? find(m, s.start.id) : null;
          const E = s.end && s.end.id ? find(m, s.end.id) : null;
          if (s.start && s.start.id && !S) throw new Error(`create: ${s.id || s.type} starts at ${s.start.id}, which does not exist`);
          if (s.end && s.end.id && !E) throw new Error(`create: ${s.id || s.type} ends at ${s.end.id}, which does not exist`);
          if (!s.points && S && E) Object.assign(s, VE.routeStraight(S, E, GAP));
          else if (s.points && S && E && s.points.length >= 2 && s.x === undefined) {
            const abs = s.points.map(p => [p[0], p[1]]);
            abs[0] = VE.boundaryPoint(S, abs[1][0], abs[1][1], GAP);
            abs[abs.length - 1] = VE.boundaryPoint(E, abs[abs.length - 2][0], abs[abs.length - 2][1], GAP);
            Object.assign(s, { x: abs[0][0], y: abs[0][1], points: abs.map(p => [p[0] - abs[0][0], p[1] - abs[0][1]]) });
          } else if (!s.points && (S || E)) throw new Error(`create: ${s.id || s.type} is bound at one end only — give "points" (absolute when x/y are omitted) for the free end`);
          for (const el of [S, E]) if (el && !stubs.has(el.id)) stubs.set(el.id, stub(el));
        }
        const conv = L.convertToExcalidrawElements([...stubs.values(), ...lines], { regenerateIds: false });
        const fresh = conv.filter(e => !stubs.has(e.id));
        const mm = map();
        for (const a of fresh.filter(e => LINEAR(e.type))) {
          for (const k of ['startBinding', 'endBinding']) {
            const t = a[k] && mm.get(a[k].elementId);
            if (t) { t.boundElements = [...(t.boundElements || []).filter(b => b.id !== a.id), { id: a.id, type: 'arrow' }]; touch(t); }
          }
        }
        els.push(...fresh);
      }
      const ids = new Set(els.map(e => e.id));
      res.created = [...ids].filter(id => !have.has(id));
    }

    for (const u of patch.update || []) {
      const m = map();
      const el = find(m, u.id);
      if (!el) throw missing('update', u.id);
      const { id, label, text, dx, dy, ...props } = u;
      const textProps = {};
      for (const k of ['fontSize', 'fontFamily', 'textAlign', 'verticalAlign']) if (k in props && el.type !== 'text') { textProps[k] = props[k]; delete props[k]; }
      const geo = ['x', 'y', 'width', 'height'].some(k => k in props) || dx || dy;
      const was = VE.center(el);
      // A label drawn in its shape's stroke colour keeps following it.
      const ownLabel = el.type !== 'text' && boundText(el, m);
      if (ownLabel && 'strokeColor' in props && ownLabel.strokeColor === el.strokeColor && !(label && typeof label === 'object' && label.strokeColor)) { ownLabel.strokeColor = props.strokeColor; touch(ownLabel); }
      Object.assign(el, props);
      if (dx) el.x += dx;
      if (dy) el.y += dy;
      touch(el);
      const lab = label !== undefined ? label : text;
      const labObj = typeof lab === 'string' ? { text: lab } : lab;
      if (el.type === 'text') {
        if (labObj && labObj.text !== undefined) setText(el, el.containerId ? m.get(el.containerId) : null, labObj.text, els);
        else if (geo || 'fontSize' in props || 'fontFamily' in props) setText(el, el.containerId ? m.get(el.containerId) : null, el.originalText || el.text, els);
      } else {
        let t = boundText(el, m);
        const style = { ...textProps, ...(labObj ? Object.fromEntries(Object.entries(labObj).filter(([k]) => k !== 'text')) : {}) };
        if (!t && labObj && labObj.text) {
          const probe = LINEAR(el.type) ? { type: 'arrow', id: el.id, x: el.x, y: el.y, points: el.points, label: { text: labObj.text, ...style } } : { ...stub(el), label: { text: labObj.text, ...style } };
          t = L.convertToExcalidrawElements([probe], { regenerateIds: false }).find(e => e.type === 'text');
          t.containerId = el.id;
          el.boundElements = [...(el.boundElements || []), { type: 'text', id: t.id }];
          els.push(t);
          res.created.push(t.id);
        } else if (t && labObj && labObj.text === '') {
          els = els.filter(e => e.id !== t.id);
          el.boundElements = (el.boundElements || []).filter(b => b.id !== t.id);
          res.deleted.push(t.id);
          t = null;
        }
        if (t) {
          Object.assign(t, style);
          setText(t, el, labObj && labObj.text !== undefined ? labObj.text : (t.originalText || t.text), els);
        }
      }
      if (geo) { const now = VE.center(el); changed.set(el.id, [now[0] - was[0], now[1] - was[1]]); }
      res.updated.push(el.id);
    }

    if (patch.move) {
      const moves = Array.isArray(patch.move) ? patch.move : [patch.move];
      for (const mv of moves) {
        const m = map();
        for (const id of mv.ids || []) {
          const el = find(m, id);
          if (!el) throw missing('move', id);
          const group = [el, boundText(el, m)].filter(Boolean);
          for (const g of group) { g.x += mv.dx || 0; g.y += mv.dy || 0; touch(g); }
          changed.set(id, [mv.dx || 0, mv.dy || 0]);
          res.updated.push(id);
        }
      }
    }

    // Re-route every connector attached to something that moved or resized.
    if (changed.size) {
      const m = map();
      for (const a of els.filter(e => LINEAR(e.type))) {
        const S = a.startBinding && m.get(a.startBinding.elementId);
        const E = a.endBinding && m.get(a.endBinding.elementId);
        if (!(S && changed.has(S.id)) && !(E && changed.has(E.id))) continue;
        let abs = a.points.map(p => [a.x + p[0], a.y + p[1]]);
        if (a.elbowed) { res.warnings.push(`${a.id} was an elbow arrow; it is now straight — re-bend it in Obsidian if needed`); a.elbowed = false; abs = [abs[0], abs[abs.length - 1]]; delete a.fixedSegments; }
        if (S && E && abs.length === 2) {
          const r = VE.routeStraight(S, E, GAP);
          abs = r.points.map(p => [r.x + p[0], r.y + p[1]]);
        } else {
          // A bent connector keeps its right angles: the waypoint next to a
          // moved end slides with it along the axis its segment runs on.
          const slide = (end, next, d) => {
            if (!d || abs.length < 3) return;
            if (Math.abs(abs[end][0] - abs[next][0]) < 1) abs[next][0] += d[0];
            else if (Math.abs(abs[end][1] - abs[next][1]) < 1) abs[next][1] += d[1];
          };
          if (S) slide(0, 1, changed.get(S.id));
          if (E) slide(abs.length - 1, abs.length - 2, changed.get(E.id));
          if (S) { const to = abs[1]; abs[0] = VE.boundaryPoint(S, to[0], to[1], GAP); }
          if (E) { const to = abs[abs.length - 2]; abs[abs.length - 1] = VE.boundaryPoint(E, to[0], to[1], GAP); }
        }
        a.x = abs[0][0]; a.y = abs[0][1];
        a.points = abs.map(p => [p[0] - a.x, p[1] - a.y]);
        const b = VE.bbox(a);
        a.width = b.x2 - b.x1; a.height = b.y2 - b.y1;
        for (const [k, el, p] of [['startBinding', S, abs[0]], ['endBinding', E, abs[abs.length - 1]]]) {
          if (el && a[k] && Array.isArray(a[k].fixedPoint)) a[k].fixedPoint = [(p[0] - el.x) / (el.width || 1), (p[1] - el.y) / (el.height || 1)];
        }
        touch(a);
        const t = boundText(a, m);
        if (t) fit(t, a);
        res.updated.push(a.id);
      }
    }

    if (job.normalize) {
      // A scene from elsewhere (the live canvas) carries estimated label
      // sizes: measure every label again with the real fonts.
      const m = map();
      for (const t of els.filter(e => e.type === 'text')) {
        const c = t.containerId ? m.get(t.containerId) : null;
        if (c || t.autoResize !== false) setText(t, c, t.originalText || t.text, els);
      }
    }

    L.syncInvalidIndices(els);
    res.elements = els;
    res.updated = [...new Set(res.updated)].filter(id => !res.created.includes(id));
    if (job.render) {
      const appState = { ...(job.scene.appState || {}), exportBackground: true, exportScale: job.render.scale || 2, exportWithDarkMode: !!job.render.dark, exportPadding: 24 };
      const blob = await L.exportToBlob({ elements: els, appState, files: job.scene.files || {}, mimeType: 'image/png' });
      res.png = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    }
    return res;
  };
}

function runPage(job) {
  const { react, lib } = libraryFiles();
  const slot = takeSlot();
  try {
    const url = f => 'file:///' + f.split(path.sep).join('/');
    fs.writeFileSync(path.join(slot.dir, 'job.js'), `window.__job = ${JSON.stringify(job)};\nwindow.__GAP = ${GAP};`);
    fs.writeFileSync(path.join(slot.dir, 'vault.js'), fs.readFileSync(path.join(__dirname, 'lib', 'excalidraw.js'), 'utf8'));
    fs.writeFileSync(path.join(slot.dir, 'page.html'), `<!doctype html><html><head><meta charset="utf-8"></head><body>
<pre id="out">PENDING</pre>
<script src="${url(react)}"></script>
<script>window.EXCALIDRAW_ASSET_PATH = [];</script>
<script src="${url(lib)}"></script>
<script src="vault.js"></script>
<script src="job.js"></script>
<script>
(async () => {
  const out = document.getElementById('out');
  let res;
  try { res = await (${pageScript.toString()})()(window.__job); }
  catch (e) { res = { error: String(e && e.message || e), stack: String(e && e.stack || '') }; }
  const bytes = new TextEncoder().encode(JSON.stringify(res));
  let bin = ''; for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
  out.textContent = btoa(bin);
})();
</script></body></html>`);
    let attemptNo = 0;
    const got = X.firstThatWorks(workingBrowser ? [workingBrowser] : browserCandidates(), browser => {
      // A fresh profile per attempt, so one engine's lock file cannot block the next.
      const args = ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
        '--disable-component-update', '--disable-background-networking', '--disable-sync', '--no-pings',
        `--user-data-dir=${path.join(slot.dir, 'profile-' + attemptNo++)}`, '--allow-file-access-from-files',
        // Offline on purpose: the library, fonts and scene are all local files.
        '--host-resolver-rules=MAP * ~NOTFOUND', '--proxy-server=127.0.0.1:9',
        '--virtual-time-budget=60000', '--dump-dom', url(path.join(slot.dir, 'page.html'))];
      const r = cp.spawnSync(browser, args, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, timeout: 180000, windowsHide: true });
      const m = (r.stdout || '').match(/<pre id="out">([^<]*)<\/pre>/);
      if (!m || m[1] === 'PENDING') return { ok: false, why: `no result (exit ${r.status})${r.error ? ': ' + r.error.message : ''}` };
      return { ok: true, value: m[1] };
    });
    if (!got.browser) die(`no installed browser returned a result (D77) — tried ${got.tried.join('; ')}. Set EXCALIDRAW_BROWSER to a Chromium browser that runs headless.`);
    workingBrowser = got.browser;
    const res = JSON.parse(Buffer.from(got.value, 'base64').toString('utf8'));
    if (res.error) die(res.error);
    return res;
  } finally { slot.release(); }
}

function savePng(res, out, name) {
  if (!res.png) return null;
  const file = out ? path.resolve(out) : path.join(WORK, 'renders', `${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(res.png.split(',')[1], 'base64'));
  return file;
}

function report(file, scene, res, extra) {
  const problems = X.lint(scene);
  const embeds = embedsOf().get(path.basename(file)) || [];
  const hash = X.sceneHash(scene);
  const out = {
    file: rel(file), ...extra,
    created: res.created && res.created.length ? res.created : undefined,
    updated: res.updated && res.updated.length ? res.updated : undefined,
    deleted: res.deleted && res.deleted.length ? res.deleted : undefined,
    renamedIds: res.renamed && Object.keys(res.renamed).length ? res.renamed : undefined,
    warnings: res.warnings && res.warnings.length ? res.warnings : undefined,
    png: res.pngFile,
    hash,
    lint: { errors: problems.filter(p => p.level === 'error').length, warnings: problems.filter(p => p.level === 'warn').length, items: problems.map(p => `${p.level} ${p.id}: ${p.msg}`) },
    embeddedIn: embeds.length ? embeds.map(e => `${e.node}:${e.line} (${e.recorded === hash ? 'transcription current' : e.recorded ? 'transcription STALE — update it and its drawing-hash' : 'no drawing-hash'})`) : undefined,
  };
  console.log(JSON.stringify(out, null, 2));
}

// Write only if the file is still what we read: Obsidian autosaves an open
// drawing, and a save that lands mid-edit must not be overwritten.
function writeIfUnchanged(file, before, content) {
  // What the plugin would read back must be what was meant (D73).
  const unreadable = X.pluginReadProblems(content);
  if (unreadable.length) die(`refusing to write ${rel(file)}: the Excalidraw plugin would misread it (D73): ${unreadable.join('; ')}`);
  const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (now !== before) die(`${rel(file)} changed on disk while this edit ran (Obsidian saved it?) — nothing written; run the command again`, 3);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// ------------------------------------------------------------ commands
const [cmd, ...argv] = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const k = argv[i].slice(2);
    if (['dark', 'no-render', 'replace'].includes(k)) flags[k] = true; else flags[k] = argv[++i];
  } else pos.push(argv[i]);
}
const renderOpt = () => flags['no-render'] ? null : { scale: Number(flags.scale) || 2, dark: !!flags.dark };

switch (cmd) {
  case 'list': {
    const embeds = embedsOf();
    const rows = allDrawings().map(p => ({ p, t: fs.statSync(p).mtimeMs })).sort((a, b) => b.t - a.t);
    if (!rows.length) { console.log(`No drawings under ${R.DRAWINGS_FOLDER}/ yet.`); break; }
    for (const { p, t } of rows) {
      const parsed = X.parseDrawing(fs.readFileSync(p, 'utf8'));
      if (parsed.error) { console.log(`${rel(p)}  UNREADABLE: ${parsed.error}`); continue; }
      const els = parsed.scene.elements.filter(e => !e.isDeleted);
      const hash = X.sceneHash(parsed.scene);
      const used = (embeds.get(path.basename(p)) || []).map(e => `${e.node}${e.recorded === hash ? '' : e.recorded ? ' (STALE)' : ' (no hash)'}`);
      console.log(`${rel(p)}  ${new Date(t).toISOString().slice(0, 16).replace('T', ' ')}  ${els.length} elements, ${els.filter(e => e.type === 'text').length} texts${parsed.compressed ? ', compressed' : ''}  hash ${hash}  ${used.length ? 'embedded in ' + used.join(', ') : 'not embedded in any note'}`);
    }
    break;
  }
  case 'info': {
    const file = resolveDrawing(pos[0]);
    const { parsed } = readDrawing(file);
    console.log(X.describe(parsed.scene, rel(file)));
    break;
  }
  case 'lint': {
    const file = resolveDrawing(pos[0]);
    const problems = X.lint(readDrawing(file).parsed.scene);
    if (!problems.length) console.log(`${rel(file)}: no layout problems`);
    for (const p of problems) console.log(`${p.level.padEnd(5)} ${p.id}: ${p.msg}`);
    process.exit(problems.some(p => p.level === 'error') ? 1 : 0);
  }
  case 'transcribe': {
    const file = resolveDrawing(pos[0]);
    const { parsed } = readDrawing(file);
    console.log(X.transcribe(parsed.scene));
    console.log(`\n<!-- drawing-hash: ${X.sceneHash(parsed.scene)} -->`);
    break;
  }
  case 'hash': {
    const file = resolveDrawing(pos[0]);
    console.log(X.sceneHash(readDrawing(file).parsed.scene));
    break;
  }
  case 'render': {
    const file = resolveDrawing(pos[0]);
    const { parsed } = readDrawing(file);
    const res = runPage({ scene: parsed.scene, render: renderOpt() || { scale: 2 } });
    console.log(JSON.stringify({ file: rel(file), png: savePng(res, flags.out, path.basename(file, X.DRAWING_EXT)) }, null, 2));
    break;
  }
  case 'new': {
    const file = resolveDrawing(pos[0], false);
    if (fs.existsSync(file) && !flags.replace) die(`${rel(file)} already exists — use apply to change it`);
    const spec = readInput(pos[1]);
    const skeletons = Array.isArray(spec) ? spec : spec.elements;
    if (!Array.isArray(skeletons) || !skeletons.length) die('the spec needs an "elements" array');
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    const appState = { gridSize: null, viewBackgroundColor: '#ffffff', ...(spec.appState || {}) };
    const res = runPage({ scene: { elements: [], appState, files: {} }, patch: { create: skeletons }, render: renderOpt() });
    const scene = { type: 'excalidraw', version: 2, elements: res.elements, appState, files: {} };
    res.renamed = X.blockSafeIds(scene.elements);
    writeIfUnchanged(file, before, X.serializeDrawing(scene, null));
    res.pngFile = savePng(res, flags.out, path.basename(file, X.DRAWING_EXT));
    const folder = path.dirname(rel(file));
    const icons = (() => { try { return JSON.parse(fs.readFileSync(path.join(VAULT, '.obsidian', 'plugins', 'obsidian-icon-folder', 'data.json'), 'utf8')); } catch { return null; } })();
    report(file, scene, res, icons && !icons[folder] ? { note: `folder ${folder}/ has no Iconize icon — add one (.claude/rules/obsidian.md § Obsidian Plugins)` } : {});
    break;
  }
  case 'apply': {
    const file = resolveDrawing(pos[0]);
    const { text, parsed } = readDrawing(file);
    const patch = readInput(pos[1]);
    const res = runPage({ scene: parsed.scene, patch, render: renderOpt() });
    const scene = { ...parsed.scene, elements: res.elements };
    res.renamed = X.blockSafeIds(scene.elements);
    writeIfUnchanged(file, text, X.serializeDrawing(scene, parsed));
    res.pngFile = savePng(res, flags.out, path.basename(file, X.DRAWING_EXT));
    report(file, scene, res, parsed.compressed ? { note: 'the drawing was compressed; it is now saved as plain JSON' } : {});
    break;
  }
  case 'save': {
    const file = resolveDrawing(pos[0], false);
    const exists = fs.existsSync(file);
    const { text, parsed } = exists ? readDrawing(file) : { text: null, parsed: null };
    const incoming = readInput(pos[1]);
    const els = Array.isArray(incoming) ? incoming : incoming.elements;
    if (!Array.isArray(els)) die('the scene needs an "elements" array');
    const base = parsed ? parsed.scene : { appState: { gridSize: null, viewBackgroundColor: '#ffffff' }, files: {} };
    // mcp-excalidraw-server 2.0.0 exports every shape without corners set as
    // rounded; give back the sharp corners the drawing already had.
    const prior = new Map((base.elements || []).map(e => [e.id, e]));
    for (const e of els) {
      const was = prior.get(e.id);
      if (was && was.roundness == null && e.roundness && e.roundness.type === 3) e.roundness = null;
    }
    const res = runPage({ scene: { ...base, elements: els }, normalize: true, render: renderOpt() });
    const scene = { ...base, elements: res.elements, files: { ...(base.files || {}), ...((incoming && incoming.files) || {}) } };
    res.renamed = X.blockSafeIds(scene.elements);
    writeIfUnchanged(file, text, X.serializeDrawing(scene, parsed));
    res.pngFile = savePng(res, flags.out, path.basename(file, X.DRAWING_EXT));
    report(file, scene, res, {});
    break;
  }
  case 'check': {
    const res = runPage({
      scene: { elements: [], appState: { viewBackgroundColor: '#ffffff' }, files: {} },
      patch: { create: [
        { type: 'rectangle', id: 'a', x: 0, y: 0, width: 160, height: 70, label: 'Renderer' },
        { type: 'ellipse', id: 'b', x: 300, y: 0, width: 160, height: 70, label: 'works', backgroundColor: '#b2f2bb' },
        { type: 'arrow', id: 'ab', from: 'a', to: 'b' },
      ] },
      render: { scale: 1 },
    });
    const scene = { elements: res.elements };
    const png = savePng(res, flags.out, 'check');
    const problems = X.lint(scene);
    console.log(JSON.stringify({ browser: workingBrowser, plugin: libraryFiles().version, elements: res.elements.length, lint: problems.map(p => `${p.level} ${p.id}: ${p.msg}`), png }, null, 2));
    break;
  }
  default:
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 21).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(cmd ? 2 : 0);
}
