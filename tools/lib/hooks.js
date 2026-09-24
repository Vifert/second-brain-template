'use strict';
// Pure checks behind the Claude Code hooks in tools/hooks/. A trap that bit
// more than once is enforced by the harness, not by memory: backticks bash
// executes (D13), CRLF from Python's write_text (D76), control bytes (D03),
// and a stale index at the end of a turn (D87).
const fs = require('fs');
const path = require('path');
const { controlCharLines } = require('./vault');

const BT = String.fromCharCode(96);

/** How many backticks bash would execute in a command (D13). */
function executedBackticks(cmd) {
  const s = String(cmd);
  let n = 0, q = null;
  const pending = []; // heredocs whose bodies start at the next newline
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q === "'") { if (c === "'") q = null; continue; }
    if (c === '\\') { i++; continue; }
    if (q === '"') { if (c === '"') q = null; else if (c === BT) n++; continue; }
    if (c === "'" || c === '"') { q = c; continue; }
    if (c === BT) { n++; continue; }
    if (c === '<' && s[i + 1] === '<' && s[i + 2] !== '<') {
      const m = /^<<(-?)[ \t]*(?:'([^']+)'|"([^"]+)"|\\(\w+)|(\w+))/.exec(s.slice(i));
      if (m) { pending.push({ dash: !!m[1], delim: m[2] || m[3] || m[4] || m[5], expand: !!m[5] }); i += m[0].length - 1; }
      continue;
    }
    if (c === '\n' && pending.length) {
      let j = i + 1;
      for (const h of pending.splice(0)) {
        while (j <= s.length) {
          let e = s.indexOf('\n', j);
          if (e < 0) e = s.length;
          const line = s.slice(j, e);
          j = e + 1;
          if ((h.dash ? line.replace(/^\t+/, '') : line) === h.delim) break;
          if (h.expand) n += (line.split('\\' + BT).join('').split(BT).length - 1);
          if (e >= s.length) break;
        }
      }
      i = j - 1;
    }
  }
  return n;
}

function bashProblems(cmd) {
  const out = [];
  if (/\bwrite_text\s*\(/.test(cmd)) out.push("Python's write_text rewrites every line ending to CRLF on Windows (D76) — use the Edit or Write tool, or write bytes with an explicit newline");
  if (executedBackticks(cmd)) out.push("bash would execute the backticks in this command and splice their output in (D13) — put markdown in a file with the Write tool, or use single quotes or a quoted heredoc (<<'EOF')");
  return out;
}

function mdProblems(text) {
  const out = [];
  if (/\r\n/.test(text)) out.push('CRLF line endings — the vault is LF (D76); rewrite the file with LF');
  const cc = controlCharLines(text);
  if (cc.length) out.push(`control byte(s) on line(s) ${cc.join(', ')} — a \\uXXXX escape typed into Write or Edit becomes the byte itself (D03)`);
  return out;
}

/** True when a note in wiki/ or Excalidraw/ changed after the last build (D87). */
function staleIndex(vaultAbs) {
  const idx = path.join(vaultAbs, 'wiki', '_index.tsv');
  if (!fs.existsSync(idx)) return true;
  const built = fs.statSync(idx).mtimeMs;
  const newer = dir => fs.existsSync(dir) && fs.readdirSync(dir, { withFileTypes: true }).some(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return !e.name.startsWith('.') && newer(p);
    return e.name.endsWith('.md') && !e.name.startsWith('_') && !/[\\/]profile[\\/]now\.md$/.test(p) && fs.statSync(p).mtimeMs > built;
  });
  return newer(path.join(vaultAbs, 'wiki')) || newer(path.join(vaultAbs, 'Excalidraw'));
}

/**
 * The files an edit touched, whichever agent made it (D92). Claude Code's
 * Write and Edit name one `tool_input.file_path`; Codex edits through
 * `apply_patch`, whose patch text arrives in `tool_input.command` and names
 * each file on an `*** Add File:`, `*** Update File:` or `*** Move to:` line.
 * Relative paths resolve against the session's `cwd`.
 */
function editedFiles(input) {
  const ti = (input && input.tool_input) || {};
  const cwd = (input && input.cwd) || process.cwd();
  if (typeof ti.file_path === 'string' && ti.file_path) return [path.resolve(cwd, ti.file_path)];
  if (typeof ti.command !== 'string') return [];
  const out = [];
  for (const m of ti.command.matchAll(/^\*\*\* (?:Add File|Update File|Move to): (.+?)\s*$/gm)) out.push(path.resolve(cwd, m[1]));
  return [...new Set(out)];
}

module.exports = { executedBackticks, bashProblems, mdProblems, staleIndex, editedFiles };
