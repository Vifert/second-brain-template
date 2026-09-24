'use strict';
// Installs the one Obsidian plugin the tools need — Excalidraw — at a pinned
// release, verified against recorded SHA-256 digests before anything is written.
// The plugin (MIT) is downloaded from its own GitHub release onto this machine;
// this repository does not redistribute it. Its settings (data.json) already
// ship in .obsidian/ and are left untouched.
//   node tools/install-excalidraw.js           install, or confirm the pin
//   node tools/install-excalidraw.js --check   report what is installed
//   node tools/install-excalidraw.js --force   replace a newer install

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VAULT = process.env.VAULT_ROOT ? path.resolve(process.env.VAULT_ROOT) : path.resolve(__dirname, '..');
const DIR = path.join(VAULT, '.obsidian', 'plugins', 'obsidian-excalidraw-plugin');
// Bumping the pin: see MAINTAINING.md § Bumping Excalidraw.
const PIN = {
  repo: 'zsviczian/obsidian-excalidraw-plugin',
  version: '2.27.3',
  files: {
    'main.js': '8275e85d0f6314654a3d5ad86125d2e1b0018b4ffd60eddab2bbc8eefa0e13c1',
    'manifest.json': '30bfc399dae79f7ca1ce050bb2a9497aada72ef576be831375571f5444f428a2',
    'styles.css': '4a9b329e24abdc310ccd8a0fb91c7863619ceea2a0d266981a86d6c5ebd1abea',
  },
};

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

function compareVersions(a, b) {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}

function installedVersion() {
  try { return JSON.parse(fs.readFileSync(path.join(DIR, 'manifest.json'), 'utf8')).version || null; } catch { return null; }
}

function installedMatchesPin() {
  return Object.entries(PIN.files).every(([name, want]) => {
    try { return sha256(fs.readFileSync(path.join(DIR, name))) === want; } catch { return false; }
  });
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const have = installedVersion();
  if (args.has('--check')) {
    console.log(have ? `Excalidraw ${have} is installed (pinned: ${PIN.version}).` : 'Excalidraw is not installed — run: node tools/install-excalidraw.js');
    process.exit(have ? 0 : 1);
  }
  if (have && compareVersions(have, PIN.version) > 0 && !args.has('--force')) {
    console.log(`Excalidraw ${have} is newer than the pinned ${PIN.version}; leaving it. Use --force to replace it.`);
    return;
  }
  if (have === PIN.version && installedMatchesPin()) {
    console.log(`Excalidraw ${PIN.version} is already installed and verified.`);
    return;
  }
  const fetched = {};
  for (const [name, want] of Object.entries(PIN.files)) {
    const url = `https://github.com/${PIN.repo}/releases/download/${PIN.version}/${name}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status} from ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const got = sha256(buf);
    if (got !== want) throw new Error(`${name}: checksum mismatch — downloaded ${got}, pinned ${want}. Nothing was written.`);
    fetched[name] = buf;
  }
  fs.mkdirSync(DIR, { recursive: true });
  for (const [name, buf] of Object.entries(fetched)) fs.writeFileSync(path.join(DIR, name), buf);
  console.log(`Installed Excalidraw ${PIN.version} into ${path.relative(VAULT, DIR).split(path.sep).join('/')}.`);
  console.log('Reload Obsidian and make sure community plugins are turned on; Excalidraw is already enabled in .obsidian/community-plugins.json.');
}

if (require.main === module) main().catch(e => { console.error('install-excalidraw: ' + e.message); process.exit(1); });
module.exports = { PIN, compareVersions };
