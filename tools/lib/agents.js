'use strict';
// The vault's agent layer for every coding agent, generated from `.claude/`
// (D91). Claude Code reads `.claude/` itself; Codex reads `.agents/skills/`,
// `.codex/agents/` and `.codex/hooks.json`, and Gemini CLI reads
// `.agents/skills/`. Hand-kept copies would drift, so `.claude/` is the only
// source and this module renders the rest; `tools/agents-sync.js` writes it and
// the self-test fails while any file differs.
const fs = require('fs');
const path = require('path');

const HEADER = src => `Generated from ${src} by node tools/agents-sync.js — edit that file, not this one.`;
/** The frontmatter fields the Agent Skills standard defines; Claude-only ones (disable-model-invocation, argument-hint) stay behind. */
const SKILL_FIELDS = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'];
const GATED_NOTE = ' Explicit only: start it when the owner invokes it by name, never on your own.';
/** Claude Code tool names → the names Codex matches a hook on (apply_patch answers to Edit and Write). */
const HOOK_MATCHERS = { Write: 'Write', Edit: 'Edit', MultiEdit: null, Bash: 'Bash' };

const lf = s => String(s).replace(/\r\n/g, '\n');
const rel = p => p.split(path.sep).join('/');

/** Split a markdown file into its frontmatter lines (as `[key, rawValue]`) and body. */
function splitFm(text) {
  const t = lf(text);
  const m = t.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fields: [], body: t };
  const fields = m[1].split('\n').filter(l => /^[A-Za-z][\w-]*:/.test(l)).map(l => {
    const i = l.indexOf(':');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  });
  return { fields, body: t.slice(m[0].length) };
}
const unquote = v => (/^".*"$/.test(v) || /^'.*'$/.test(v) ? v.slice(1, -1) : v);
const yamlStr = s => (/^[\w][^:#\n]*$/.test(s) && !/:\s/.test(s) ? s : JSON.stringify(s));

/** A skill as Codex and Gemini read it: standard fields only, gated ones told so in words and, for Codex, in openai.yaml. */
function renderSkill(name, text) {
  const { fields, body } = splitFm(text);
  const get = k => (fields.find(f => f[0] === k) || [])[1];
  const gated = /^true$/i.test(get('disable-model-invocation') || '');
  const fm = fields.filter(([k]) => SKILL_FIELDS.includes(k)).map(([k, v]) => {
    // Quoted whenever plain YAML would misread it: a stricter reader than Claude Code's may reject "lines: problems".
    if (k === 'description') return `${k}: ${yamlStr(unquote(v) + (gated ? GATED_NOTE : ''))}`;
    return `${k}: ${v}`;
  });
  const src = `.claude/skills/${name}/SKILL.md`;
  return {
    gated,
    skill: `---\n${fm.join('\n')}\n---\n\n<!-- ${HEADER(src)} -->\n\n${body.replace(/^\n+/, '')}`,
    openai: gated ? `# ${HEADER(src)}\n# disable-model-invocation there; here the same gate for Codex: $${name} only.\npolicy:\n  allow_implicit_invocation: false\n` : null,
  };
}

const tomlStr = s => JSON.stringify(s);
function tomlBlock(s) {
  const body = lf(s).replace(/^\n+/, '').replace(/\n*$/, '\n');
  if (!body.includes("'''")) return `'''\n${body}'''`;
  return `"""\n${body.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}"""`;
}

/** A read-only agent as a Codex custom agent (`.codex/agents/<name>.toml`). */
function renderAgent(file, text) {
  const { fields, body } = splitFm(text);
  const get = k => unquote((fields.find(f => f[0] === k) || [])[1] || '');
  const name = get('name') || path.basename(file, '.md');
  return `# ${HEADER(`.claude/agents/${file}`)}\n` +
    `name = ${tomlStr(name)}\n` +
    `description = ${tomlStr(get('description'))}\n` +
    `sandbox_mode = "read-only"\n` +
    `developer_instructions = ${tomlBlock(body)}\n`;
}

/** `.claude/settings.json` hooks as Codex hooks: git-root commands, since Codex runs them from the session cwd. */
function renderHooks(settingsText) {
  const hooks = (JSON.parse(settingsText).hooks) || {};
  const out = {};
  for (const [event, entries] of Object.entries(hooks)) {
    out[event] = entries.map(e => {
      const entry = {};
      if (e.matcher) {
        const names = e.matcher.split('|').map(n => (n in HOOK_MATCHERS ? HOOK_MATCHERS[n] : n)).filter(Boolean);
        if (names.includes('Edit') || names.includes('Write')) names.unshift('apply_patch');
        entry.matcher = [...new Set(names)].join('|');
      }
      entry.hooks = e.hooks.map(h => {
        const script = (h.args || []).map(a => a.replace('${CLAUDE_PROJECT_DIR}/', '')).join(' ');
        const command = `${h.command} "$(git rev-parse --show-toplevel)/${script}"`;
        // PowerShell reports a failed native command as exit 1, and Codex reads
        // only exit 2 as "block": pass the script's own code through (D92).
        return { type: 'command', command, commandWindows: `${command}; exit $LASTEXITCODE` };
      });
      return entry;
    });
  }
  return JSON.stringify({ hooks: out }, null, 2) + '\n';
}

/** Every generated file, as a Map from its vault-relative path to its content. */
function render(vaultAbs) {
  const files = new Map();
  const skillsDir = path.join(vaultAbs, '.claude', 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir).sort()) {
      const dir = path.join(skillsDir, name);
      if (!fs.statSync(dir).isDirectory() || !fs.existsSync(path.join(dir, 'SKILL.md'))) continue;
      const walk = d => fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(e => {
        const p = path.join(d, e.name);
        if (e.isDirectory()) return e.name === 'evals' ? [] : walk(p); // skill-creator evals are Claude Code's
        return [p];
      });
      for (const p of walk(dir)) {
        const r = rel(path.relative(dir, p));
        const dest = `.agents/skills/${name}/${r}`;
        if (r === 'SKILL.md') {
          const s = renderSkill(name, fs.readFileSync(p, 'utf8'));
          files.set(dest, s.skill);
          if (s.openai) files.set(`.agents/skills/${name}/agents/openai.yaml`, s.openai);
        } else files.set(dest, lf(fs.readFileSync(p, 'utf8')));
      }
    }
  }
  const agentsDir = path.join(vaultAbs, '.claude', 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const f of fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).sort()) {
      files.set(`.codex/agents/${path.basename(f, '.md')}.toml`, renderAgent(f, fs.readFileSync(path.join(agentsDir, f), 'utf8')));
    }
  }
  const settings = path.join(vaultAbs, '.claude', 'settings.json');
  if (fs.existsSync(settings)) files.set('.codex/hooks.json', renderHooks(fs.readFileSync(settings, 'utf8')));
  return files;
}

/** Generated files that are missing or differ, and files in the generated folders nothing generates any more. */
function drift(vaultAbs, files = render(vaultAbs)) {
  const changed = [...files].filter(([p, c]) => {
    const abs = path.join(vaultAbs, p);
    return !fs.existsSync(abs) || lf(fs.readFileSync(abs, 'utf8')) !== c;
  }).map(([p]) => p);
  const stale = [];
  const scan = (d, prefix) => fs.existsSync(d) && fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const r = `${prefix}/${e.name}`;
    if (e.isDirectory()) scan(path.join(d, e.name), r);
    else if (!files.has(r)) stale.push(r);
  });
  scan(path.join(vaultAbs, '.agents', 'skills'), '.agents/skills');
  scan(path.join(vaultAbs, '.codex', 'agents'), '.codex/agents');
  return { changed, stale };
}

module.exports = { render, drift, renderSkill, renderAgent, renderHooks, splitFm, GATED_NOTE };
