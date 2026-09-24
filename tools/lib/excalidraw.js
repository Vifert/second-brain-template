'use strict';
// Excalidraw drawings in the vault: the Obsidian plugin's .excalidraw.md file
// format, the content hash a transcription records (D72), and the scene
// checks the vault-excalidraw skill runs after every edit.
//
// Pure functions, no dependencies. The same file loads in node (require) and
// in the headless render page tools/excalidraw.js drives (window.VaultExcalidraw),
// so the geometry that routes an arrow is written once.
//
// Format notes come from the plugin's own code (obsidian-excalidraw-plugin
// 2.x main.js: FRONTMATTER, generateMDBase, getMarkdownDrawingSection and the
// Text Elements parser in ExcalidrawData.loadData) and from mcp_excalidraw's
// src/core/obsidian-md.ts (MIT, yctimlin), whose lz-string port is followed
// here — but not its 1–8 character block-id rule, which the plugin misreads (D73).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VaultExcalidraw = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const DRAWING_EXT = '.excalidraw.md';
  const HEAD = [
    '---', '', 'excalidraw-plugin: parsed', 'tags: [excalidraw]', '', '---',
    "==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'",
    '', '', '',
  ].join('\n');
  const SHAPES = new Set(['rectangle', 'ellipse', 'diamond', 'image', 'frame', 'magicframe', 'embeddable', 'iframe']);
  const LINEAR = new Set(['arrow', 'line']);
  // The plugin reads every `<text> ^<id>` entry under ## Text Elements with
  // /\s\^(.{8})[\n]+/g and takes an entry's text as everything since the previous
  // match (ExcalidrawData.loadData). An id that is not exactly 8 characters is
  // never matched, so its text is glued onto the next label (D73). Its own ids
  // are nanoid(8) over digits and letters; ours follow the same shape.
  const BLOCK_ID = /^[A-Za-z0-9]{8}$/;
  const HASH_COMMENT = /<!--\s*drawing-hash:\s*([0-9a-f]{8})\s*-->/;

  // ------------------------------------------------------------ lz-string
  // decompressFromBase64 from lz-string (pieroxy, MIT), as inlined by
  // mcp_excalidraw. The plugin writes ```compressed-json when `compress` is on.
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  function decompressFromBase64(input) {
    if (input == null || input === '') return null;
    const f = String.fromCharCode;
    const next = i => B64.indexOf(input.charAt(i));
    const dictionary = [0, 1, 2];
    let enlargeIn = 4, dictSize = 4, numBits = 3, entry, w, c;
    const result = [];
    const data = { val: next(0), position: 32, index: 1 };
    const bits = n => {
      let out = 0, power = 1;
      const max = Math.pow(2, n);
      while (power !== max) {
        const resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) { data.position = 32; data.val = next(data.index++); }
        out |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      return out;
    };
    switch (bits(2)) {
      case 0: c = f(bits(8)); break;
      case 1: c = f(bits(16)); break;
      default: return '';
    }
    dictionary[3] = c; w = c; result.push(c);
    for (;;) {
      if (data.index > input.length) return '';
      switch ((c = bits(numBits))) {
        case 0: dictionary[dictSize++] = f(bits(8)); c = dictSize - 1; enlargeIn--; break;
        case 1: dictionary[dictSize++] = f(bits(16)); c = dictSize - 1; enlargeIn--; break;
        case 2: return result.join('');
      }
      if (enlargeIn === 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
      if (dictionary[c] !== undefined) entry = dictionary[c];
      else if (c === dictSize) entry = w + w.charAt(0);
      else return null;
      result.push(entry);
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
      w = entry;
      if (enlargeIn === 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
    }
  }

  // ------------------------------------------------------------ file format
  function isDrawingPath(p) { return String(p).replace(/\\/g, '/').endsWith(DRAWING_EXT); }

  /**
   * Split an .excalidraw.md file into the parts the plugin writes, so a save
   * can replace the scene and the text-element index while keeping everything
   * else byte for byte: frontmatter and preamble, `## Element Links`,
   * `## Embedded Files` (images and equations placed in the drawing), and any
   * tail after the Drawing block. Returns { error } when there is no scene.
   */
  function parseDrawing(text) {
    const crlf = /\r\n/.test(text);
    const s = text.replace(/\r\n/g, '\n');
    const dm = s.match(/(\n|^)(%%\n)?##? Drawing\n[^`]*```(compressed-json|json)\n([\s\S]*?)\n```\n?(%%)?/);
    if (!dm) return { error: 'no ## Drawing block — not an Excalidraw drawing, or a corrupted one' };
    let json = dm[4];
    const compressed = dm[3] === 'compressed-json';
    if (compressed) {
      json = decompressFromBase64(json.replace(/\s/g, ''));
      if (!json) return { error: 'the compressed Drawing block does not decompress' };
    }
    let scene;
    try { scene = JSON.parse(json); } catch (e) { return { error: `the Drawing block is not valid JSON: ${e.message}` }; }
    if (!scene || !Array.isArray(scene.elements)) return { error: 'the Drawing block has no elements array' };
    const drawingStart = dm.index + dm[1].length;
    const before = s.slice(0, drawingStart);
    const tail = s.slice(dm.index + dm[0].length);
    const dataAt = before.search(/^(%%\n+)?# Excalidraw Data\n/m);
    const head = dataAt >= 0 ? before.slice(0, dataAt) : before.replace(/%%\n*$/, '');
    const data = dataAt >= 0 ? before.slice(dataAt) : '';
    const commentedOut = /^%%\n/.test(data);
    const section = name => {
      const m = data.match(new RegExp(`^##? ${name}\\n([\\s\\S]*?)(?=^##? (?:Text Elements|Element Links|Embedded Files)\\n|^%%\\n?$|$(?![\\s\\S]))`, 'm'));
      return m ? m[1] : null;
    };
    const te = section('Text Elements');
    const textEntries = te ? pluginTextEntries(te) : [];
    return {
      crlf, compressed, commentedOut, head, scene, textEntries, tail,
      elementLinks: section('Element Links'),
      embeddedFiles: section('Embedded Files'),
    };
  }

  /**
   * The Text Elements section as the plugin itself reads it (D73): each match of
   * `\s^<8 chars>\n+` closes an entry whose text runs from the end of the
   * previous match (index + 12) to this one.
   */
  function pluginTextEntries(section) {
    const out = [];
    let from = 0;
    for (const m of section.matchAll(/\s\^(.{8})[\n]+/g)) {
      out.push({ id: m[1], raw: section.substring(from, m.index) });
      from = m.index + 12;
    }
    return out;
  }

  /**
   * Text elements whose words the plugin would not read back as written (D73):
   * an entry missing for a text element, or an entry whose text is not that
   * element's own — the symptom of an id the plugin's parser skips.
   */
  function pluginReadProblems(text) {
    const s = String(text).replace(/\r\n/g, '\n');
    const p = parseDrawing(s);
    if (p.error) return [p.error];
    const got = new Map(p.textEntries.map(t => [t.id, t.raw]));
    const out = [];
    for (const el of p.scene.elements.filter(e => e.type === 'text' && !e.isDeleted)) {
      const want = el.rawText || el.originalText || el.text || '';
      if (!want) continue;
      if (!got.has(el.id)) out.push(`text ${el.id} ${JSON.stringify(want.slice(0, 40))} has no entry the plugin can read${BLOCK_ID.test(el.id) ? '' : ' — its id is not 8 letters and digits'}`);
      else if (got.get(el.id) !== want) out.push(`text ${el.id} would load as ${JSON.stringify(got.get(el.id).slice(0, 60))} instead of ${JSON.stringify(want.slice(0, 40))}`);
    }
    return out;
  }

  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }

  // A text element whose id is not a valid 8-character block id gets a stable
  // one derived from the old id, and every reference to it is rewired.
  /**
   * The 8-character id a given id becomes. Deterministic, so a patch written
   * against the old id still finds the element after the rename (D73), and a
   * re-save never churns block references. `attempt` steps past a collision.
   */
  function derivedBlockId(sourceId, attempt = 0) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let a = fnv1a(`${sourceId}:${attempt}`), b = fnv1a(`${sourceId}#${attempt}`);
    let id = '';
    for (let i = 0; i < 8; i++) {
      const pick = (i % 2 ? a : b) % alphabet.length;
      id += alphabet[pick];
      if (i % 2) a = Math.floor(a / alphabet.length) + fnv1a(id); else b = Math.floor(b / alphabet.length) + fnv1a(id);
    }
    return id;
  }

  function blockSafeIds(elements) {
    const used = new Set(elements.map(e => e.id));
    const renamed = {};
    for (const el of elements) {
      if (el.type !== 'text' || el.isDeleted || BLOCK_ID.test(el.id)) continue;
      let id, attempt = 0;
      do { id = derivedBlockId(el.id, attempt++); } while (used.has(id));
      used.add(id);
      renamed[el.id] = id;
    }
    if (!Object.keys(renamed).length) return renamed;
    const re = id => renamed[id] || id;
    for (const el of elements) {
      el.id = re(el.id);
      if (el.containerId) el.containerId = re(el.containerId);
      if (Array.isArray(el.boundElements)) for (const b of el.boundElements) b.id = re(b.id);
      if (el.startBinding && el.startBinding.elementId) el.startBinding.elementId = re(el.startBinding.elementId);
      if (el.endBinding && el.endBinding.elementId) el.endBinding.elementId = re(el.endBinding.elementId);
    }
    return renamed;
  }

  /**
   * Write a scene back in the plugin's native layout. `parsed` is what
   * parseDrawing returned for the file being replaced, or null for a new
   * drawing. The Drawing block is always plain ```json (the vault sets
   * `compress` off, D71); the plugin reads either.
   */
  function serializeDrawing(scene, parsed) {
    const elements = scene.elements;
    blockSafeIds(elements);
    const prior = new Map(((parsed && parsed.textEntries) || []).map(t => [t.id, t.raw]));
    const entries = elements
      .filter(e => e.type === 'text' && !e.isDeleted)
      .map(e => {
        // The scene's rawText carries the plugin's markup (links, transclusions);
        // an entry read back from the file is trusted only when it agrees, since
        // a file written with short ids reads back merged (D73).
        const raw = prior.has(e.id) && e.rawText === prior.get(e.id) ? prior.get(e.id) : (e.rawText || e.originalText || e.text || '');
        e.rawText = raw;
        return raw === '' ? '' : `${raw} ^${e.id}\n\n`;
      }).join('');
    const commentedOut = parsed ? parsed.commentedOut : false;
    let out = parsed ? parsed.head : HEAD;
    out += (commentedOut ? '%%\n' : '') + '# Excalidraw Data\n\n## Text Elements\n' + entries;
    if (parsed && parsed.elementLinks != null) out += '## Element Links\n' + parsed.elementLinks;
    if (parsed && parsed.embeddedFiles != null) out += '## Embedded Files\n' + parsed.embeddedFiles;
    const body = {
      type: 'excalidraw', version: 2,
      source: scene.source || 'https://github.com/zsviczian/obsidian-excalidraw-plugin',
      elements, appState: scene.appState || { gridSize: null, viewBackgroundColor: '#ffffff' },
      files: scene.files || {},
    };
    out += (commentedOut ? '' : '%%\n') + '## Drawing\n```json\n' + JSON.stringify(body, null, '\t') + '\n```\n%%';
    if (parsed && parsed.tail) out += parsed.tail;
    return parsed && parsed.crlf ? out.replace(/\n/g, '\r\n') : out;
  }

  // ------------------------------------------------------------ scene model
  const live = scene => (scene.elements || []).filter(e => !e.isDeleted);
  const byId = els => new Map(els.map(e => [e.id, e]));
  const boundText = (el, map) => {
    const b = (el.boundElements || []).find(x => x && x.type === 'text' && map.has(x.id));
    return b ? map.get(b.id) : null;
  };
  const labelOf = (el, map) => {
    if (el.type === 'text') return el.originalText || el.text || '';
    const t = boundText(el, map);
    return t ? (t.originalText || t.text || '') : (el.type === 'frame' || el.type === 'magicframe' ? el.name || '' : '');
  };
  const round = n => Math.round(Number(n) || 0);

  function bbox(el) {
    if (LINEAR.has(el.type) || el.type === 'freedraw') {
      const xs = (el.points || [[0, 0]]).map(p => el.x + p[0]);
      const ys = (el.points || [[0, 0]]).map(p => el.y + p[1]);
      return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
    }
    const w = el.width || 0, h = el.height || 0;
    return { x1: Math.min(el.x, el.x + w), y1: Math.min(el.y, el.y + h), x2: Math.max(el.x, el.x + w), y2: Math.max(el.y, el.y + h) };
  }
  const center = el => { const b = bbox(el); return [(b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2]; };
  const inside = (a, b, pad = 0) => a.x1 >= b.x1 - pad && a.y1 >= b.y1 - pad && a.x2 <= b.x2 + pad && a.y2 <= b.y2 + pad;
  const intersects = (a, b, shrink = 0) => a.x1 + shrink < b.x2 - shrink && a.x2 - shrink > b.x1 + shrink && a.y1 + shrink < b.y2 - shrink && a.y2 - shrink > b.y1 + shrink;

  /**
   * The point where a ray from the element's centre toward (tx, ty) leaves
   * its outline, pushed `gap` pixels further out. Rectangles, ellipses and
   * diamonds are exact; anything else uses its bounding box. Rotation is
   * ignored — a rotated shape is rare in a diagram, and lint says so.
   */
  function boundaryPoint(el, tx, ty, gap) {
    const [cx, cy] = center(el);
    let dx = tx - cx, dy = ty - cy;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const a = Math.abs(el.width || 0) / 2, b = Math.abs(el.height || 0) / 2;
    let t;
    if (el.type === 'ellipse') t = 1 / Math.sqrt((dx * dx) / (a * a || 1) + (dy * dy) / (b * b || 1));
    else if (el.type === 'diamond') t = 1 / (Math.abs(dx) / (a || 1) + Math.abs(dy) / (b || 1));
    else t = Math.min(dx ? a / Math.abs(dx) : Infinity, dy ? b / Math.abs(dy) : Infinity);
    t += gap || 0;
    return [cx + dx * t, cy + dy * t];
  }

  /** A straight arrow from one element's outline to another's, as {x, y, points}. */
  function routeStraight(from, to, gap) {
    const [fx, fy] = center(from), [tx, ty] = center(to);
    const [sx, sy] = boundaryPoint(from, tx, ty, gap);
    const [ex, ey] = boundaryPoint(to, fx, fy, gap);
    return { x: sx, y: sy, points: [[0, 0], [ex - sx, ey - sy]], width: Math.abs(ex - sx), height: Math.abs(ey - sy) };
  }

  /** The point halfway along a polyline, where Excalidraw centres an arrow's label. */
  function polylineMidpoint(el) {
    const pts = (el.points || [[0, 0]]).map(p => [el.x + p[0], el.y + p[1]]);
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    let half = total / 2;
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (half <= seg && seg > 0) {
        const r = half / seg;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * r, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * r];
      }
      half -= seg;
    }
    return pts[0];
  }

  // Shapes that visibly hold other shapes: zone rectangles and frames.
  function zonesOf(els) {
    const shapes = els.filter(e => SHAPES.has(e.type));
    return new Set(shapes.filter(z => z.type === 'frame' || z.type === 'magicframe' || shapes.some(o => o !== z && inside(bbox(o), bbox(z)))).map(z => z.id));
  }

  /**
   * The content hash a node's transcription records (D72). It covers what a
   * reader of the drawing sees and a transcription must say: every shape and
   * free text with its position, size, colours and words, and every connector
   * by the elements it joins. It leaves out what the plugin recomputes on its
   * own — versions, nonces, timestamps, fractional indices, bound-text
   * geometry, bound arrows' points — so opening and saving a drawing without
   * changing it keeps the hash, and moving a box or rewording a label changes it.
   */
  function sceneHash(scene) {
    const els = live(scene);
    const map = byId(els);
    const sig = el => el ? `${el.type}@${round(el.x)},${round(el.y)}` : '-';
    const rows = [];
    for (const el of els) {
      if (el.type === 'text' && el.containerId && map.has(el.containerId)) continue;
      const style = [el.strokeColor, el.backgroundColor, el.fillStyle, el.strokeStyle, round(el.strokeWidth), round((el.angle || 0) * 100), el.link || ''].join('|');
      const words = labelOf(el, map);
      if (LINEAR.has(el.type)) {
        const s = el.startBinding && map.get(el.startBinding.elementId);
        const e = el.endBinding && map.get(el.endBinding.elementId);
        const free = (!s || !e) ? (el.points || []).map(p => `${round(el.x + p[0])},${round(el.y + p[1])}`).join(' ') : '';
        rows.push([el.type, sig(s), sig(e), free, el.startArrowhead || '', el.endArrowhead || '', style, words].join('|'));
      } else {
        rows.push([el.type, round(el.x), round(el.y), round(el.width), round(el.height), el.fontSize || '', el.fileId || '', style, words].join('|'));
      }
    }
    rows.sort();
    const text = rows.join('\n');
    return (fnv1a(text) >>> 0).toString(16).padStart(8, '0');
  }

  // ------------------------------------------------------------ describe
  function describe(scene, name) {
    const els = live(scene);
    const map = byId(els);
    const zones = zonesOf(els);
    const lines = [];
    const all = els.length ? els.map(bbox).reduce((a, b) => ({ x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) })) : null;
    const counts = {};
    for (const e of els) counts[e.type] = (counts[e.type] || 0) + 1;
    lines.push(`${name || 'drawing'}: ${els.length} elements (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')})` + (all ? `, extent ${round(all.x1)},${round(all.y1)} → ${round(all.x2)},${round(all.y2)} (${round(all.x2 - all.x1)}×${round(all.y2 - all.y1)})` : ''));
    const q = s => JSON.stringify(String(s).replace(/\s+/g, ' ').trim());
    const shapes = els.filter(e => !LINEAR.has(e.type) && !(e.type === 'text' && e.containerId));
    if (shapes.length) lines.push('', 'Shapes and text:');
    for (const e of shapes) {
      const label = labelOf(e, map);
      const bits = [`${e.id} ${e.type}${zones.has(e.id) ? ' (zone)' : ''} at ${round(e.x)},${round(e.y)} ${round(e.width)}×${round(e.height)}`];
      if (label) bits.push(q(label));
      const style = [];
      if (e.backgroundColor && e.backgroundColor !== 'transparent') style.push(`fill ${e.backgroundColor}`);
      if (e.strokeColor && e.strokeColor !== '#1e1e1e') style.push(`stroke ${e.strokeColor}`);
      if (e.strokeStyle && e.strokeStyle !== 'solid') style.push(e.strokeStyle);
      if (e.type === 'text' && e.fontSize) style.push(`${e.fontSize}px`);
      if (e.groupIds && e.groupIds.length) style.push(`group ${e.groupIds.join('/')}`);
      if (e.frameId) style.push(`in frame ${e.frameId}`);
      if (e.link) style.push(`link ${e.link}`);
      if (e.locked) style.push('locked');
      if (style.length) bits.push(`[${style.join(', ')}]`);
      lines.push('- ' + bits.join(' '));
    }
    const linear = els.filter(e => LINEAR.has(e.type));
    if (linear.length) lines.push('', 'Connectors:');
    for (const a of linear) {
      const s = a.startBinding && map.get(a.startBinding.elementId);
      const t = a.endBinding && map.get(a.endBinding.elementId);
      const end = (el, pt) => el ? `${el.id}${labelOf(el, map) ? ' ' + q(labelOf(el, map)) : ''}` : `(free ${round(a.x + pt[0])},${round(a.y + pt[1])})`;
      const pts = a.points || [[0, 0]];
      const head = a.endArrowhead ? (a.startArrowhead ? '<->' : '->') : (a.startArrowhead ? '<-' : '--');
      const label = labelOf(a, map);
      lines.push(`- ${a.id} ${a.type}: ${end(s, pts[0])} ${head} ${end(t, pts[pts.length - 1])}${label ? ' label ' + q(label) : ''}${a.strokeStyle && a.strokeStyle !== 'solid' ? ' [' + a.strokeStyle + ']' : ''}${pts.length > 2 ? ` (${pts.length} points)` : ''}${a.elbowed ? ' (elbow)' : ''}`);
    }
    return lines.join('\n');
  }

  // ------------------------------------------------------------ lint
  /**
   * Layout and integrity problems, the checks both source skills run by eye
   * on a screenshot, made mechanical: broken references, labels too big for
   * their shape, shapes on top of each other, connectors through unrelated
   * shapes, labels centred over a zone's contents, tiny text. `level` is
   * "error" for something visibly wrong or broken, "warn" for a likely one.
   */
  function lint(scene) {
    const out = [];
    const add = (level, id, msg) => out.push({ level, id, msg });
    const els = live(scene);
    const map = byId(els);
    const seen = new Set();
    for (const e of els) { if (seen.has(e.id)) add('error', e.id, 'duplicate element id'); seen.add(e.id); }
    for (const e of els) {
      if (e.containerId && !map.has(e.containerId)) add('error', e.id, `text is bound to missing container ${e.containerId}`);
      for (const b of e.boundElements || []) {
        const o = b && map.get(b.id);
        if (!o) { add('error', e.id, `boundElements lists missing ${b && b.id}`); continue; }
        if (b.type === 'text' && o.containerId !== e.id) add('error', e.id, `bound text ${o.id} does not point back (containerId ${o.containerId})`);
        if (b.type === 'arrow' && !((o.startBinding && o.startBinding.elementId === e.id) || (o.endBinding && o.endBinding.elementId === e.id))) add('warn', e.id, `arrow ${o.id} listed as bound but not attached`);
      }
      for (const k of ['startBinding', 'endBinding']) {
        if (e[k] && e[k].elementId && !map.has(e[k].elementId)) add('error', e.id, `${k} points at missing ${e[k].elementId}`);
        if (e[k] && e[k].elementId && map.has(e[k].elementId)) {
          const t = map.get(e[k].elementId);
          if (!(t.boundElements || []).some(b => b && b.id === e.id)) add('warn', e.id, `${k} target ${t.id} does not list this arrow in boundElements`);
        }
      }
      if (e.type === 'text' && e.fontSize && e.fontSize < 14) add('warn', e.id, `font size ${e.fontSize} is hard to read (use 16+, 14 at the least)`);
      if (e.angle && Math.abs(e.angle) > 0.01 && SHAPES.has(e.type)) add('warn', e.id, 'rotated shape — connectors are routed as if it were not');
    }
    // Labels that do not fit their shape.
    for (const t of els.filter(e => e.type === 'text' && e.containerId && map.has(e.containerId))) {
      const c = map.get(t.containerId);
      if (LINEAR.has(c.type)) continue;
      // Excalidraw's getBoundTextMaxWidth: 5px padding inside the largest
      // rectangle the shape can hold — the whole box, w/√2 of an ellipse, w/2 of a diamond.
      const pad = 5;
      const k = c.type === 'ellipse' ? Math.SQRT1_2 : c.type === 'diamond' ? 0.5 : 1;
      const maxW = Math.abs(c.width) * k - 2 * pad, maxH = Math.abs(c.height) * k - 2 * pad;
      if (t.width > maxW + 2 || t.height > maxH + 2) add('error', c.id, `label ${JSON.stringify(labelOf(c, map))} (${round(t.width)}×${round(t.height)}) overflows its ${c.type} (fits ${round(maxW)}×${round(maxH)}) — widen or heighten the shape`);
      const tb = bbox(t);
      if (!intersects(tb, bbox(c))) add('error', c.id, 'label sits outside its shape');
    }
    const zones = zonesOf(els);
    const solid = els.filter(e => (SHAPES.has(e.type) || (e.type === 'text' && !e.containerId)) && !zones.has(e.id));
    const shareGroup = (a, b) => (a.groupIds || []).some(g => (b.groupIds || []).includes(g));
    for (let i = 0; i < solid.length; i++) {
      for (let j = i + 1; j < solid.length; j++) {
        const a = solid[i], b = solid[j];
        if (shareGroup(a, b) || a.frameId === b.id || b.frameId === a.id) continue;
        if (intersects(bbox(a), bbox(b), 1)) add('error', a.id, `overlaps ${b.id}${labelOf(b, map) ? ' ' + JSON.stringify(labelOf(b, map)) : ''}`);
      }
    }
    for (const z of els.filter(e => zones.has(e.id) && e.type !== 'frame' && e.type !== 'magicframe')) {
      if (boundText(z, map)) add('error', z.id, 'a zone that holds other shapes has a centred label, which sits on top of its contents — use a free text at the zone\'s top edge instead');
    }
    // Connectors through unrelated shapes, and connector labels on shapes.
    const linears = els.filter(e => LINEAR.has(e.type));
    const pointsOf = a => (a.points || []).map(p => [a.x + p[0], a.y + p[1]]);
    // Does any segment of connector `o` pass through this box? (D75)
    const runsThrough = (box, o) => {
      const op = pointsOf(o);
      return op.some((p, i) => i > 0 && segmentHitsBox(op[i - 1], p, box));
    };
    const inset = (b, n) => ({ x1: b.x1 + n, y1: b.y1 + n, x2: b.x2 - n, y2: b.y2 - n });
    for (const a of linears) {
      const ends = new Set([a.startBinding && a.startBinding.elementId, a.endBinding && a.endBinding.elementId].filter(Boolean));
      const pts = pointsOf(a);
      for (const s of solid) {
        if (ends.has(s.id) || s.type === 'text' || shareGroup(a, s)) continue;
        const b = bbox(s);
        const box = { x1: b.x1 + 4, y1: b.y1 + 4, x2: b.x2 - 4, y2: b.y2 - 4 };
        if (pts.some((p, i) => i > 0 && segmentHitsBox(pts[i - 1], p, box))) add('error', a.id, `${a.type} passes through ${s.id}${labelOf(s, map) ? ' ' + JSON.stringify(labelOf(s, map)) : ''} — route it around (extra points) or move the shape`);
      }
      const t = boundText(a, map);
      if (t) {
        // Excalidraw cuts the line away behind a label, so a label as long as
        // the connector hides it entirely.
        let length = 0;
        for (let i = 1; i < pts.length; i++) length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        const across = Math.abs(pts.length > 1 && Math.abs(pts[pts.length - 1][0] - pts[0][0]) >= Math.abs(pts[pts.length - 1][1] - pts[0][1]) ? t.width : t.height);
        if (across + 40 > length) add('error', a.id, `label ${JSON.stringify(labelOf(a, map))} covers most of its ${round(length)}px ${a.type}, so the line barely shows — space the shapes further apart or shorten the label`);
        else if (across + 80 > length) add('warn', a.id, `label ${JSON.stringify(labelOf(a, map))} crowds the ends of its ${round(length)}px ${a.type} — give it about ${round(across + 80 - length)}px more room`);
        else for (const s of solid) if (s.type !== 'text' && intersects(bbox(t), bbox(s), 1)) add('warn', a.id, `label ${JSON.stringify(labelOf(a, map))} sits on ${s.id} — lengthen the connector or shorten the label`);
        // Excalidraw cuts the line away behind a label only for that label's
        // OWN connector; every other line is drawn straight across it (D75).
        for (const o of linears) {
          if (o.id === a.id || shareGroup(a, o)) continue;
          if (!runsThrough(inset(bbox(t), 2), o)) continue;
          add('error', a.id, `label ${JSON.stringify(labelOf(a, map))} has ${o.type} ${o.id}${labelOf(o, map) ? ' ' + JSON.stringify(labelOf(o, map)) : ''} running through it — a connector's label sits at its path midpoint, so reshape this ${a.type} to move the midpoint into clear space, or reroute the other one (D75)`);
        }
      }
      if (a.type === 'arrow') for (const [k, idx] of [['startBinding', 0], ['endBinding', pts.length - 1]]) {
        if (a[k] || !pts.length) continue;
        const p = pts[idx];
        const near = solid.find(s => s.type !== 'text' && inside({ x1: p[0], y1: p[1], x2: p[0], y2: p[1] }, bbox(s), 20));
        if (near) add('warn', a.id, `${k === 'startBinding' ? 'start' : 'end'} touches ${near.id} but is not bound — it will not follow when ${near.id} moves`);
      }
    }
    // Free text is unreadable the same way when a connector is drawn across it (D75).
    for (const tx of els.filter(e => e.type === 'text' && !e.containerId)) {
      for (const o of linears) {
        if (shareGroup(tx, o)) continue;
        if (!runsThrough(inset(bbox(tx), 2), o)) continue;
        add('error', tx.id, `${o.type} ${o.id}${labelOf(o, map) ? ' ' + JSON.stringify(labelOf(o, map)) : ''} runs through the text ${JSON.stringify(String(labelOf(tx, map) || '').replace(/\s*\n\s*/g, ' / ').slice(0, 44))} — reroute the connector or move the text (D75)`);
      }
    }
    return out;
  }

  /**
   * Try each candidate in order and keep the first that works (D77). A browser
   * can be installed and still produce nothing headless — Edge 153 did exactly
   * that on 2026-09-18, silently, after an automatic update — and the render
   * must not stop while another engine on the machine works. `attempt(b)`
   * returns { ok: true, value } or { ok: false, why }.
   */
  function firstThatWorks(candidates, attempt) {
    const tried = [];
    for (const b of candidates) {
      const r = attempt(b);
      if (r && r.ok) return { browser: b, value: r.value, tried };
      tried.push(`${b}: ${(r && r.why) || 'failed'}`);
    }
    return { browser: null, value: null, tried };
  }

  function segmentHitsBox(p, q, b) {
    if (b.x2 <= b.x1 || b.y2 <= b.y1) return false;
    // Liang–Barsky clipping: does segment p→q cross the box interior?
    let t0 = 0, t1 = 1;
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const edges = [[-dx, p[0] - b.x1], [dx, b.x2 - p[0]], [-dy, p[1] - b.y1], [dy, b.y2 - p[1]]];
    for (const [pp, qq] of edges) {
      if (pp === 0) { if (qq < 0) return false; continue; }
      const r = qq / pp;
      if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return t1 - t0 > 1e-6;
  }

  // ------------------------------------------------------------ transcription
  /**
   * A draft of the § Images transcription: a Mermaid flowchart of every
   * labelled shape and connector (zones become subgraphs), then the free text
   * and anything Mermaid cannot hold. It is a starting point to check against
   * the render, not a finished transcription — the words of a sticky note or a
   * title still need a sentence of context.
   */
  function transcribe(scene) {
    const els = live(scene);
    const map = byId(els);
    const zones = zonesOf(els);
    const shapes = els.filter(e => SHAPES.has(e.type));
    const all = els.length ? els.map(bbox).reduce((a, b) => ({ x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) })) : { x1: 0, y1: 0, x2: 1, y2: 1 };
    const dir = (all.x2 - all.x1) >= (all.y2 - all.y1) ? 'LR' : 'TD';
    const ids = new Map();
    const mid = el => { if (!ids.has(el.id)) ids.set(el.id, `n${ids.size + 1}`); return ids.get(el.id); };
    const esc = s => String(s).replace(/"/g, '#quot;').replace(/\n+/g, '<br>');
    const node = el => {
      const t = esc(labelOf(el, map) || el.id);
      const n = mid(el);
      if (el.type === 'ellipse') return `${n}(["${t}"])`;
      if (el.type === 'diamond') return `${n}{"${t}"}`;
      return `${n}["${t}"]`;
    };
    const parentZone = el => shapes.filter(z => zones.has(z.id) && z !== el && inside(bbox(el), bbox(z)))
      .sort((a, b) => (bbox(a).x2 - bbox(a).x1) * (bbox(a).y2 - bbox(a).y1) - (bbox(b).x2 - bbox(b).x1) * (bbox(b).y2 - bbox(b).y1))[0];
    const zoneTitle = z => {
      const t = els.find(e => e.type === 'text' && !e.containerId && inside(bbox(e), bbox(z)) && bbox(e).y1 - bbox(z).y1 < 60);
      return labelOf(z, map) || (t ? labelOf(t, map) : '') || z.name || z.id;
    };
    const out = ['```mermaid', `flowchart ${dir}`];
    const emit = (parent, indent) => {
      for (const z of shapes.filter(s => zones.has(s.id) && parentZone(s) === parent)) {
        out.push(`${indent}subgraph ${mid(z)}["${esc(zoneTitle(z))}"]`);
        emit(z, indent + '  ');
        out.push(`${indent}end`);
      }
      for (const s of shapes.filter(s => !zones.has(s.id) && parentZone(s) === parent)) out.push(indent + node(s));
    };
    emit(undefined, '  ');
    const notes = [];
    for (const a of els.filter(e => LINEAR.has(e.type))) {
      const s = a.startBinding && map.get(a.startBinding.elementId);
      const t = a.endBinding && map.get(a.endBinding.elementId);
      const label = labelOf(a, map);
      if (!s || !t) { notes.push(`- Unattached ${a.type}${label ? ` labelled "${label}"` : ''}${s ? ` from "${labelOf(s, map) || s.id}"` : ''}${t ? ` to "${labelOf(t, map) || t.id}"` : ''}.`); continue; }
      const dashed = a.strokeStyle && a.strokeStyle !== 'solid';
      const both = a.startArrowhead && a.endArrowhead;
      const none = !a.startArrowhead && !a.endArrowhead;
      const [from, to] = !a.endArrowhead && a.startArrowhead ? [t, s] : [s, t];
      let link = none ? (dashed ? '-.-' : '---') : (dashed ? '-.->' : '-->');
      if (both) link = dashed ? '<-.->' : '<-->';
      out.push(`  ${mid(from)} ${link}${label ? `|"${esc(label)}"|` : ''} ${mid(to)}`);
    }
    out.push('```');
    const free = els.filter(e => e.type === 'text' && !e.containerId).sort((a, b) => a.y - b.y || a.x - b.x);
    if (free.length) {
      notes.unshift(...free.map(t => {
        const z = shapes.find(s => zones.has(s.id) && inside(bbox(t), bbox(s)));
        return `- Text${z ? ` in "${zoneTitle(z)}"` : ''}: "${String(labelOf(t, map)).replace(/\s*\n\s*/g, ' / ')}"`;
      }));
    }
    const other = els.filter(e => !SHAPES.has(e.type) && !LINEAR.has(e.type) && e.type !== 'text');
    if (other.length) notes.push(`- Also drawn: ${other.map(e => e.type).join(', ')} (describe what each shows).`);
    return out.join('\n') + (notes.length ? '\n\n' + notes.join('\n') : '');
  }

  // ------------------------------------------------------------ wiki side
  /** A wiki link target that names a drawing: `x.excalidraw` or `x.excalidraw.md`, with any folder. */
  function drawingLinkBase(target) {
    const t = String(target).replace(/\\/g, '/').split('/').pop();
    if (t.endsWith('.excalidraw.md')) return t;
    if (t.endsWith('.excalidraw')) return t + '.md';
    return null;
  }
  function hashComment(text) { const m = String(text).match(HASH_COMMENT); return m ? m[1] : null; }

  return {
    DRAWING_EXT, SHAPES, LINEAR, BLOCK_ID, HEAD,
    decompressFromBase64, isDrawingPath, parseDrawing, serializeDrawing, blockSafeIds, derivedBlockId, pluginTextEntries, pluginReadProblems,
    bbox, center, boundaryPoint, routeStraight, polylineMidpoint, segmentHitsBox, firstThatWorks, zonesOf, labelOf, boundText,
    sceneHash, describe, lint, transcribe, drawingLinkBase, hashComment,
  };
});
