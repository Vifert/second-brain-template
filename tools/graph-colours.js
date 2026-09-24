'use strict';
// Assigns Obsidian graph colours (D86): a colour group per folder, written to
// .obsidian/graph.json (the tool owns the whole list), and the tag and
// attachment node colours, written through Style Settings when it is installed.
//   node tools/graph-colours.js           assign and write
//   node tools/graph-colours.js --dry     print only
const fs = require('fs');
const path = require('path');
const R = require('./lib/rules');
const G = require('./lib/graphcolours');

const VAULT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const cfg = R.GRAPH;
if (!cfg || !cfg.background) { console.log('graph-colours: off — set GRAPH.background in tools/lib/rules.js to your theme\'s background colour'); process.exit(0); }
const file = path.join(VAULT, '.obsidian', 'graph.json');
const graph = JSON.parse(fs.readFileSync(file, 'utf8'));
const folders = G.colourFolders(VAULT, cfg);
const theme = G.themeColours(VAULT, cfg);
const linksFile = path.join(VAULT, 'wiki', '_links.tsv');
const rows = fs.existsSync(linksFile) ? fs.readFileSync(linksFile, 'utf8').trim().split('\n').map(r => r.split('\t')) : [];
const members = theme.settable ? [...folders, ...theme.colours.keys()] : folders;
const existing = new Map([...G.existingColours(graph.colorGroups), ...(theme.settable ? theme.colours : [])]);
const res = G.assign(members, existing, G.linkWeights(rows, folders), cfg, theme.settable ? new Map() : theme.colours);
const shown = new Map([...res.colours, ...(theme.settable ? [] : theme.colours)]);
for (const [f, c] of [...shown].sort()) {
  const near = Math.min(...[...shown].filter(([g]) => g !== f).map(([, d]) => G.deltaE(c, d)));
  const note = res.relaxed.includes(f) ? `  (floor relaxed to ${cfg.fallbackDeltaE})` : !res.colours.has(f) ? '  (fixed: Style Settings is not installed)' : '';
  console.log(`${(theme.colours.has(f) ? f : f + '/').padEnd(28)} ${G.hex(c)}  contrast ${G.contrast(c, cfg.background).toFixed(1)}:1  nearest ΔE ${near.toFixed(1)}${note}`);
}
if (res.recoloured) console.log('graph-colours: no colour cleared the fallback floor, so every colour was reassigned');
if (process.argv.includes('--dry')) process.exit(0);
graph.colorGroups = G.groups(new Map([...res.colours].filter(([f]) => folders.includes(f))));
fs.writeFileSync(file, JSON.stringify(graph, null, 2));
let themeWritten = 0;
if (theme.settable) {
  for (const t of cfg.themeNodes) {
    const h = G.hex(res.colours.get(t.name));
    if (theme.data[t.setting] !== h) { theme.data[t.setting] = h; themeWritten++; }
  }
  if (themeWritten) fs.writeFileSync(theme.file, JSON.stringify(theme.data, null, 2));
}
console.log(`graph-colours: wrote ${graph.colorGroups.length} groups${themeWritten ? ` and ${themeWritten} theme node colour(s) through Style Settings` : ''} — reload Obsidian (Ctrl+P → Reload app without saving)`);
