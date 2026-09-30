// ⚖ R8 — THE SEAM HOLDS: every path to a game file goes through one function per side, and nothing else spells the games
// directory. Page: `gameBase(id)` in loader/page.js. Node: `GAMES_PATH` / `gamesRoot` / `gameDir` / `gamePath` in
// tools/harness/lib.mjs (shell and workflow steps read it with `node tools/harness/lib.mjs --games-path`). Removing the
// games repository later (link mode, or no copies at all) is then those two places, not a hunt for paths.
//
// What this test does: it scans every code file under loader/, tools/ and .github/ with its COMMENTS removed and fails
// on any spelling of the games directory used as a path — `games/…` (in a string, a template, a regex, a shell line), a
// `'games'` path segment, `HEAD:games`, `-C games`, `submodule.games.` — outside the two definitions ALLOWED below.
// Docs and comments may say `games/` freely: they describe, they do not read. JSON (records, snapshots) is data.
//
// ⚠ The patterns are a NET for the forms this tree has used, not a parser: a new spelling (`'gam' + 'es'`) would pass.
// The comment stripper is a small lexer (strings, templates with `${…}` nesting, regex literals, `//` and `/* */`;
// `#` for shell, YAML and Python); its own cases are pinned below so a lexer slip cannot silently widen or narrow what
// counts as code. This file is not scanned (it has to spell what it looks for).
//
// It runs in the `fast` job, which installs nothing: `node:` builtins and relative imports only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO, GAMES_PATH, gamesRoot, gameDir, gamePath } from '../tools/harness/lib.mjs';

function stripJS(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  const stack = []; // template nesting: brace depth per template
  let braceDepth = 0;
  let lastSig = ''; // last significant non-space char of code
  let lastWord = '';
  const regexAllowed = () => lastSig === '' || '(,=:[!&|?{};+-*%<>~^'.includes(lastSig) || ['return', 'typeof', 'case', 'in', 'of', 'void', 'delete', 'throw', 'new', 'yield', 'await'].includes(lastWord);
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  function readString(q) { // i at opening quote
    let j = i + 1;
    while (j < n && src[j] !== q) { if (src[j] === '\\') j++; else if (src[j] === '\n') break; j++; }
    out += src.slice(i, j + 1); i = j + 1; lastSig = q; lastWord = '';
  }
  function readTemplate(opening) { // i at the opening ` (opening) or just after the } closing a ${
    let j = i + (opening ? 1 : 0);
    out += src.slice(i, j);
    while (j < n) {
      if (src[j] === '\\') { out += src.slice(j, j + 2); j += 2; continue; }
      if (src[j] === '`') { out += '`'; i = j + 1; lastSig = '`'; lastWord = ''; return; }
      if (src[j] === '$' && src[j + 1] === '{') { out += '${'; i = j + 2; stack.push(braceDepth); braceDepth = 0; lastSig = '{'; lastWord = ''; return; }
      out += src[j]; j++;
    }
    i = j;
  }
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { let j = src.indexOf('\n', i); if (j < 0) j = n; out += blank(src.slice(i, j)); i = j; continue; }
    if (c === '/' && d === '*') { let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; out += blank(src.slice(i, j)); i = j; continue; }
    if (c === '"' || c === "'") { readString(c); continue; }
    if (c === '`') { readTemplate(true); continue; }
    if (c === '/' && regexAllowed()) {
      let j = i + 1, cls = false;
      while (j < n && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; else if (src[j] === '/' && !cls) break;
        j++;
      }
      out += src.slice(i, j + 1); i = j + 1; lastSig = '/'; lastWord = '';
      continue;
    }
    if (c === '{') braceDepth++;
    if (c === '}') {
      if (braceDepth === 0 && stack.length) { braceDepth = stack.pop(); i++; out += '}'; readTemplate(false); continue; }
      braceDepth--;
    }
    if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
      lastWord = src.slice(i, j); lastSig = 'a'; out += lastWord; i = j; continue;
    }
    if (!/\s/.test(c)) { lastSig = c; lastWord = ''; }
    out += c; i++;
  }
  return out;
}

function stripHash(src) {
  return src.split('\n').map((line) => {
    let q = null;
    for (let k = 0; k < line.length; k++) {
      const c = line[k];
      if (q) { if (c === '\\' && q === '"') k++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === '#' && (k === 0 || /\s/.test(line[k - 1]))) return line.slice(0, k);
    }
    return line;
  }).join('\n');
}


/** Block comments only (CSS has no line comments, and `url(//host)` is not one). */
function stripCss(src) { return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); }

const STRIP = { '.js': stripJS, '.mjs': stripJS, '.cjs': stripJS, '.sh': stripHash, '.yml': stripHash, '.yaml': stripHash, '.py': stripHash, '.css': stripCss };
const SCOPE = ['loader', 'tools', '.github'];
const SELF = path.relative(REPO, new URL(import.meta.url).pathname);

// Every spelling of the games directory as a PATH. `[^\w.-]` before `games/` keeps `tmt-loader-games/` and
// `games-auto/` (another directory) out; `\\?\/` also catches it inside a regex literal.
const PATTERNS = [
  [/(^|[^\w.-])games\\?\//, 'a games/… path'],
  [/['"]games['"]/, "a 'games' path segment"],
  [/\w:games(?![\w-])/, 'HEAD:games (a tree path)'],
  [/-C\s+["']?games(?![\w-])/, 'git -C games'],
  [/submodule\.games\./, 'submodule.games.* (config key)'],
];

// The two definitions — the seam itself. Each must match EXACTLY one hit, so an entry that goes stale fails too.
const ALLOWED = [
  { file: 'tools/harness/lib.mjs', text: "export const GAMES_PATH = 'games';", why: 'the Node side of the seam' },
  { file: 'loader/page.js', text: 'const gameBase = (id) => abs(`games/${id}/`);', why: 'the page side of the seam' },
];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else if (e.isFile()) yield p;
  }
}

/** Every line of code (comments removed) that spells the games directory as a path: [{file, line, text, why}]. */
export function scan(root = REPO) {
  const hits = [];
  for (const top of SCOPE) {
    if (!fs.existsSync(path.join(root, top))) continue;
    for (const abs of walk(path.join(root, top))) {
      const file = path.relative(root, abs).split(path.sep).join('/');
      const strip = STRIP[path.extname(abs)];
      if (!strip || file === SELF) continue;
      strip(fs.readFileSync(abs, 'utf8')).split('\n').forEach((l, i) => {
        for (const [re, why] of PATTERNS) if (re.test(l)) { hits.push({ file, line: i + 1, text: l.trim(), why }); break; }
      });
    }
  }
  return hits;
}

test('⚖ R8: nothing in loader/, tools/ or .github/ spells the games directory as a path, outside the seam', () => {
  const hits = scan();
  const used = ALLOWED.map(() => 0);
  const bad = hits.filter((h) => {
    const k = ALLOWED.findIndex((a) => a.file === h.file && h.text.includes(a.text));
    if (k < 0) return true;
    used[k]++;
    return false;
  });
  assert.deepEqual(bad.map((h) => `${h.file}:${h.line} (${h.why}): ${h.text.slice(0, 160)}`), [],
    'route these through the seam: gameDir(id) / gamesRoot() / gamePath(id, …) / GAMES_PATH from tools/harness/lib.mjs ' +
    '(shell: G=$(node tools/harness/lib.mjs --games-path)), or gameBase(id) in loader/page.js');
  ALLOWED.forEach((a, k) => assert.equal(used[k], 1, `the seam definition ${a.file} \`${a.text}\` (${a.why}) was matched ${used[k]} times, not once — moved or renamed? update ALLOWED with it`));
});

test('the two sides of the seam name the same directory, and it is the submodule .gitmodules declares', () => {
  const page = fs.readFileSync(path.join(REPO, 'loader/page.js'), 'utf8');
  const m = page.match(/^const gameBase = \(id\) => abs\(`([^`$]*)\/\$\{id\}\/`\);$/m);
  assert.ok(m, 'loader/page.js no longer defines `const gameBase = (id) => abs(`<dir>/${id}/`)` — the page side of the seam');
  assert.equal(m[1], GAMES_PATH, `the page serves games from ${m[1]}/ but the Node seam reads ${GAMES_PATH}/`);
  const mods = fs.readFileSync(path.join(REPO, '.gitmodules'), 'utf8');
  assert.match(mods, new RegExp(`^\\[submodule "${GAMES_PATH}"\\]\\s*\\n\\s*path = ${GAMES_PATH}\\s*$`, 'm'),
    `.gitmodules does not declare a submodule named and pathed ${GAMES_PATH} — the tools use GAMES_PATH as both`);
});

test('the Node seam: shapes', () => {
  assert.equal(gamesRoot(), path.join(REPO, GAMES_PATH));
  assert.equal(gameDir('ptr'), path.join(REPO, GAMES_PATH, 'ptr'));
  assert.equal(gameDir('ptr', '/x'), path.join('/x', GAMES_PATH, 'ptr'));
  assert.equal(gamesRoot('/x'), path.join('/x', GAMES_PATH));
  assert.equal(gamePath('ptr'), `${GAMES_PATH}/ptr`);
  assert.equal(gamePath('ptr', ''), `${GAMES_PATH}/ptr/`);
  assert.equal(gamePath('ptr', 'js/mod.js'), `${GAMES_PATH}/ptr/js/mod.js`);
});

test('the comment stripper: what counts as code (pinned, so a lexer slip cannot move the net)', () => {
  const G = 'games' + '/';   // spelled apart: this file is not scanned, but keep the fixtures legible as fixtures
  const flagged = (src, strip = stripJS) => strip(src).split('\n').some((l) => PATTERNS.some(([re]) => re.test(l)));
  // code: flagged
  for (const src of [`read('${G}ptr/index.html')`, 'abs(`' + G + '${id}/`)', `x = /^${G.replace('/', '\\/')}ptr\\//`, "path.join(REPO, 'games', id)",
    'const a = `${x}`; read(`' + G + 'x`)', 'f(`a${`b${c}`}`); g("' + G + '")', 'a = b / 2; read("' + G + 'x")'])
    assert.ok(flagged(src), `not flagged: ${src}`);
  // comments, and names that are not the directory: not flagged
  for (const src of [`// ${G}ptr`, `/* ${G}\n ${G} */`, `x(); // ${G}`, 'a(`${l}:${id}`); // ' + G, `'tmt-loader-${G}'`, "'games-auto/ptr.json'",
    'index.games', "'the index declares no `games` list'", '`blob ${n}\\0`; // ' + G])
    assert.ok(!flagged(src), `flagged: ${src}`);
  // shell / YAML / Python
  for (const src of [`git -C games status`, `x=$(git rev-parse HEAD:games)`, `tar -x -C _site/${G}`, `echo "${G}x"`]) assert.ok(flagged(src, stripHash), `not flagged (#): ${src}`);
  for (const src of [`# ${G}x`, `  submodules: true   # ${G} is the submodule`, `echo "a # ${G}"`.replace(/"a # .*"/, '"a"') + ` # ${G}`]) assert.ok(!flagged(src, stripHash), `flagged (#): ${src}`);
  assert.ok(!flagged(`/* ${G} */ a { b: url(//x/y) }`, stripCss));
});
