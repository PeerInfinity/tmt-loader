// Gate G4b: the manifest is a PIN, games/<id>/index.html is the source. Parses the live index with
// loader/interpret.mjs and fails on drift from manifest.load.scripts / modFiles / modFilesPrefix / external; also
// checks the vendored files' sha256, that renderOnly ⊆ scripts, and that games/<id>/ is PRISTINE at the upstream
// commit (its tree equals the subtree squash commit's tree, and that squash names manifest.upstream.commit).
// load.known (L2b, hand-kept): the declared allowances must EQUAL what the tree contains — missingScripts = the
// index-named local scripts (static and modFiles) absent under games/<id>/; externalHosts = the hosts of absolute
// http(s) asset URLs (image/audio/video/font extension) in index.html and js/** (knownFromTree below).
//   node check-manifest.mjs [<id>...]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { interpret, executionOrder, scriptNames, modFilePaths, LOADER_RE } from '../../loader/interpret.mjs';
import { REPO, GAMES, parseArgs, readManifest, sha256hex, writeJSON } from './lib.mjs';
import { runNode } from './run.mjs';

const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8' }).trim();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = (a) => [...new Set(a)].sort();

// An absolute http(s) URL in source text; the path must end in an asset extension (query/hash ignored). Excluded, by
// construction: links in text (discord.gg, github.com, wikipedia — no asset extension), extensionless image URLs (stock
// TMT's js/Demo images.beano.com), and the hosts of every manifest load.external URL (vendored or dropped).
const URL_RE = /https?:\/\/[^\s"'`()<>\\,;]+/gi;
const ASSET_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif|mp3|ogg|oga|wav|m4a|flac|aac|opus|mp4|webm|woff2?|ttf|otf|eot)$/i;
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.isFile() ? [path.join(dir, e.name)] : [])) : []);

/** What load.known must equal, measured from the tree: {missingScripts, externalHosts, hostFiles}. */
export function knownFromTree(id, m, plan, modFiles) {
  const root = path.join(REPO, 'games', id);
  const { static: statics, slot } = executionOrder(plan);
  // loader.js is not in the list: the loader fetches its source (a loader input, never skipped)
  const named = [...statics.filter((x) => x.src != null && !x.vendor).map((x) => x.src), ...modFilePaths(slot, modFiles)];
  const missingScripts = sorted(named.filter((f) => !fs.existsSync(path.join(root, f))));
  const excluded = new Set(Object.keys(m.load.external || {}).map((u) => { try { return new URL(u.startsWith('//') ? `https:${u}` : u).hostname; } catch { return null; } }));
  const hostFiles = {};
  for (const f of [path.join(root, m.entry || 'index.html'), ...walk(path.join(root, 'js'))]) {
    const text = fs.readFileSync(f, 'latin1');
    for (const u of text.match(URL_RE) || []) {
      let url; try { url = new URL(u); } catch { continue; }
      if (!ASSET_EXT_RE.test(url.pathname) || excluded.has(url.hostname)) continue;
      (hostFiles[url.hostname] ||= new Set()).add(path.relative(root, f));
    }
  }
  return { missingScripts, externalHosts: sorted(Object.keys(hostFiles)), hostFiles: Object.fromEntries(Object.entries(hostFiles).map(([h, fs_]) => [h, [...fs_].sort()])) };
}

export function checkManifest(id, { boot = true } = {}) {
  const m = readManifest(id);
  const root = path.join(REPO, 'games', id);
  const problems = [];
  const html = fs.readFileSync(path.join(root, m.entry || 'index.html'), 'utf8');
  let plan = interpret(html, m);
  const slot0 = executionOrder(plan).slot;
  if (slot0) plan = interpret(html, m, { loaderSource: fs.readFileSync(path.join(root, slot0.loader), 'utf8') });
  const { slot } = executionOrder(plan);

  // scripts: the pin lists loader.js where the plan has the slot
  const live = scriptNames(plan).map((s) => (s === '<modFiles>' ? slot.loader : s));
  if (!same(live, m.load.scripts)) problems.push({ field: 'load.scripts', manifest: m.load.scripts, live });
  const liveExternal = {};
  for (const s of plan.scripts) if (s.vendor) liveExternal[s.vendor.url] = 'vendor';
  for (const l of plan.links) if (l.external) liveExternal[l.external] = l.verdict;
  for (const u of plan.dropped) liveExternal[u] = 'drop';
  if (!same(Object.keys(liveExternal).sort(), Object.keys(m.load.external).sort())) problems.push({ field: 'load.external', manifest: m.load.external, live: liveExternal });
  if ((slot ? slot.prefix : null) !== (m.load.modFilesPrefix ?? null) && !(slot == null && !m.load.modFiles.length)) problems.push({ field: 'load.modFilesPrefix', manifest: m.load.modFilesPrefix, live: slot && slot.prefix });
  for (const r of m.load.renderOnly) if (!m.load.scripts.includes(r)) problems.push({ field: 'load.renderOnly', notInScripts: r });
  if (m.load.scripts.some((s) => LOADER_RE.test(s)) !== !!slot) problems.push({ field: 'loader.js', manifestHasLoader: !slot, live: !!slot });

  // vendor: every 'vendor' external has a path whose bytes match the pinned sha256
  const vendor = {};
  for (const [url, verdict] of Object.entries(m.load.external)) {
    if (verdict !== 'vendor') continue;
    const v = m.load.vendor[url];
    if (!v || !v.path) { problems.push({ field: 'load.vendor', url, error: 'no path' }); continue; }
    const f = path.join(REPO, v.path);
    const sha = fs.existsSync(f) ? sha256hex(fs.readFileSync(f)) : null;
    vendor[v.path] = sha;
    if (sha !== v.sha256) problems.push({ field: 'load.vendor', url, path: v.path, manifest: v.sha256, live: sha });
  }

  // modFiles: read from the live modInfo in a Node boot
  let modFiles = null;
  if (boot) {
    const r = runNode(id, { ticks: 0 });
    if (!r.ok) problems.push({ field: 'boot', error: `${r.failed_at}: ${r.error}` });
    modFiles = r.modFiles ?? [];
    if (!same(modFiles, m.load.modFiles)) problems.push({ field: 'load.modFiles', manifest: m.load.modFiles, live: modFiles });
    // a missing file the manifest declares in load.known.missingScripts is the game's (checked for equality below)
    const declaredMissing = new Set(m.load.known?.missingScripts || []);
    const fileErrors = (r.file_errors || []).filter((e) => !(e.error === 'missing' && declaredMissing.has(e.file)));
    if (fileErrors.length) problems.push({ field: 'boot.file_errors', live: fileErrors });
  }

  // load.known: optional, hand-kept; every key is checked against the tree (equality, never a count)
  const tree = knownFromTree(id, m, plan, modFiles ?? m.load.modFiles);
  const known = m.load.known;
  if (known !== undefined) {
    const keys = ['missingScripts', 'errorsBeforeReady', 'externalHosts'];
    if (known === null || typeof known !== 'object' || Array.isArray(known)) problems.push({ field: 'load.known', error: 'must be an object' });
    else {
      for (const k of Object.keys(known)) if (!keys.includes(k)) problems.push({ field: `load.known.${k}`, error: 'unknown key' });
      if ('errorsBeforeReady' in known && !(typeof known.errorsBeforeReady === 'string' && known.errorsBeforeReady.trim())) problems.push({ field: 'load.known.errorsBeforeReady', error: 'a non-empty reason string, or absent' });
      for (const k of ['missingScripts', 'externalHosts']) if (k in known && !(Array.isArray(known[k]) && known[k].every((x) => typeof x === 'string'))) problems.push({ field: `load.known.${k}`, error: 'an array of strings, or absent' });
    }
  }
  for (const k of ['missingScripts', 'externalHosts']) {
    const declared = sorted((known && Array.isArray(known[k]) && known[k]) || []);
    if (!same(declared, tree[k])) problems.push({ field: `load.known.${k}`, drift: true, manifest: declared, live: tree[k], declaredNotInTree: declared.filter((x) => !tree[k].includes(x)), inTreeNotDeclared: tree[k].filter((x) => !declared.includes(x)), ...(k === 'externalHosts' ? { files: tree.hostFiles } : {}) });
  }

  // pristine: games/<id>/ tree == the subtree squash commit's tree; the squash names the upstream commit
  const squash = git('log', '--format=%H%x09%b', `--grep=^git-subtree-dir: games/${id}$`, '-n', '1');
  const split = (squash.match(/git-subtree-split: ([0-9a-f]{40})/) || [])[1] || null;
  const squashSha = squash.split('\t')[0] || null;
  const treeNow = git('rev-parse', `HEAD:games/${id}`);
  // the squash commit itself holds the upstream tree at its root
  const squashCommit = git('log', '--format=%H', `--grep=^Squashed 'games/${id}/' content from commit`, '-n', '1');
  const treeSquash = squashCommit ? git('rev-parse', `${squashCommit}^{tree}`) : null;
  if (split !== m.upstream.commit) problems.push({ field: 'upstream.commit', manifest: m.upstream.commit, subtreeSplit: split });
  if (treeNow !== treeSquash) problems.push({ field: 'games pristine', treeNow, treeSquash });
  const dirty = execFileSync('git', ['-C', REPO, 'status', '--porcelain', '--', `games/${id}`], { encoding: 'utf8' }).trim();
  if (dirty) problems.push({ field: 'games pristine (working tree)', dirty });
  if ((m.patches || []).length) problems.push({ field: 'patches', note: 'L1 expects none', live: m.patches });
  // auto (A1): optional per-game automation table, a classic script OUTSIDE the subtree prefix (games-auto/<id>.js)
  if (m.auto !== undefined) {
    if (typeof m.auto !== 'string' || !/^games-auto\/[\w.-]+\.js$/.test(m.auto)) problems.push({ field: 'auto', error: 'must be "games-auto/<file>.js"', live: m.auto });
    else if (!fs.existsSync(path.join(REPO, m.auto))) problems.push({ field: 'auto', error: 'file missing', live: m.auto });
  }

  return { id, ok: problems.length === 0, known: known ?? null, knownTree: { missingScripts: tree.missingScripts, externalHosts: tree.externalHosts }, scripts: live.length, modFiles: modFiles && modFiles.length, external: liveExternal, vendor, subtreeSplit: split, tree: treeNow, problems };
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const ids = a._.length ? a._ : GAMES();
  const rows = ids.map((id) => checkManifest(id));
  for (const r of rows) console.log(JSON.stringify(r));
  console.log(`check-manifest: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}`).join(' ')}`);
  if (a.json) writeJSON(a.json, rows);
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
