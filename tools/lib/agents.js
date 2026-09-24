'use strict';
// The vault's agent layer for every coding agent, generated from `.claude/`
// (D91). Claude Code reads `.claude/` itself; Codex reads `.agents/skills/`,
// `.codex/agents/` and `.codex/hooks.json`, and Gemini CLI reads
// `.agents/skills/`. Hand-kept copies would drift, so `.claude/` is the only
// source and this module renders the rest; `tools/agents-sync.js` writes it and
// the self-test fails while any file differs.
const fs = require('fs');
const path = require('path');

const GENERATED_BY = 'by node tools/agents-sync.js';
const HEADER = src => `Generated from ${src} ${GENERATED_BY} — edit that file, not this one.`;
/** What every generated hook command runs; an entry without it is the owner's own. */
const HOOK_SCRIPTS = '$(git rev-parse --show-toplevel)/tools/hooks/';
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

/**
 * `.claude/settings.json` hooks as Codex hooks: git-root commands, since Codex
 * runs them from the session cwd — merged into `existingText`, the current
 * `.codex/hooks.json`, keeping the owner's own entries. Null when nothing would
 * be left in the file.
 */
function renderHooks(settingsText, existingText = null) {
  const hooks = (settingsText != null && JSON.parse(settingsText).hooks) || {};
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
  // An owner may have Codex hooks of their own in the same file (SETUP § 4A.4
  // says to merge them in). Only entries that run one of our scripts are the
  // generator's; every other entry is kept, after ours, as it was (D91).
  let existing = {};
  if (existingText != null) {
    try { existing = JSON.parse(existingText); } catch { throw new Error('.codex/hooks.json is not valid JSON — fix it by hand before syncing; nothing was written (D91)'); }
  }
  const theirs = {};
  for (const [event, entries] of Object.entries((existing && existing.hooks) || {})) {
    for (const e of Array.isArray(entries) ? entries : []) {
      const kept = (e.hooks || []).filter(h => !isGeneratedHook(h));
      if (kept.length) (theirs[event] = theirs[event] || []).push({ ...e, hooks: kept });
    }
  }
  const merged = { ...existing, hooks: {} };
  for (const event of new Set([...Object.keys(out), ...Object.keys(theirs)])) merged.hooks[event] = [...(out[event] || []), ...(theirs[event] || [])];
  if (!Object.keys(merged.hooks).length && Object.keys(merged).length === 1) return null;
  return JSON.stringify(merged, null, 2) + '\n';
}
/** A hook entry the generator wrote: it runs one of the vault's own scripts from the git root. */
function isGeneratedHook(h) { return !!h && typeof h.command === 'string' && h.command.includes(HOOK_SCRIPTS); }
/** A generated file carries this in its header; a file without it is someone's own and is never claimed (D91). */
function isGeneratedFile(abs) { return fs.existsSync(abs) && fs.readFileSync(abs, 'utf8').includes(GENERATED_BY); }

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
  const hooksFile = path.join(vaultAbs, '.codex', 'hooks.json');
  const hooks = renderHooks(fs.existsSync(settings) ? fs.readFileSync(settings, 'utf8') : null, fs.existsSync(hooksFile) ? fs.readFileSync(hooksFile, 'utf8') : null);
  if (hooks !== null) files.set('.codex/hooks.json', hooks);
  return files;
}

/**
 * Generated files that are missing or differ, and generated files nothing
 * generates any more. Only what carries the generator's header is claimed: a
 * skill folder whose SKILL.md has it, a Codex agent file that has it, and
 * `.codex/hooks.json` once no entry of ours or theirs is left in it. An owner's
 * own skill or agent written straight into these folders is never reported (D91).
 */
function drift(vaultAbs, files = render(vaultAbs)) {
  const changed = [...files].filter(([p, c]) => {
    const abs = path.join(vaultAbs, p);
    return !fs.existsSync(abs) || lf(fs.readFileSync(abs, 'utf8')) !== c;
  }).map(([p]) => p);
  const stale = [];
  const walk = (d, prefix) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name), `${prefix}/${e.name}`) : [`${prefix}/${e.name}`]));
  const skills = path.join(vaultAbs, '.agents', 'skills');
  if (fs.existsSync(skills)) {
    for (const e of fs.readdirSync(skills, { withFileTypes: true })) {
      if (!e.isDirectory() || !isGeneratedFile(path.join(skills, e.name, 'SKILL.md'))) continue;
      stale.push(...walk(path.join(skills, e.name), `.agents/skills/${e.name}`).filter(r => !files.has(r)));
    }
  }
  const agents = path.join(vaultAbs, '.codex', 'agents');
  if (fs.existsSync(agents)) {
    for (const f of fs.readdirSync(agents)) if (f.endsWith('.toml') && isGeneratedFile(path.join(agents, f)) && !files.has(`.codex/agents/${f}`)) stale.push(`.codex/agents/${f}`);
  }
  if (fs.existsSync(path.join(vaultAbs, '.codex', 'hooks.json')) && !files.has('.codex/hooks.json')) stale.push('.codex/hooks.json');
  return { changed, stale };
}

module.exports = { render, drift, renderSkill, renderAgent, renderHooks, splitFm, isGeneratedHook, GATED_NOTE };
