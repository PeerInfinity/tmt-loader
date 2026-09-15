// Adds census games to the loader — docs/add-a-game.md end to end.
//   node tools/add-game.mjs <owner/repo>... [--id <id>] [--sha <full sha>] [--dry-run [--summary]] [--au-check] [--tag <gate prefix>]
//                           [--census <tmt-fork-census checkout>] [--json <out>]
// One JSON line per game at the end: {id, repo, sha, license, added, gates:{…}} (a skipped game: added:false, skipped).
//
// Phases, so a batch lands as ONE commit of manifests/goldens/SUMMARY on top of the subtree commits (`git subtree add`
// refuses a working tree with changes, so every subtree goes in before any manifest is written):
//   1. preflight, every target, no git: census row + clone + boot row; id; SHA; LICENSE text check (every license-like
//      root file must classify MIT, else `skipped: license`); the manifest emitted by the census into a temp file, then
//      `load.vendor` filled from the vendored files the existing manifests pin (a vendor URL no manifest pins stops the
//      whole run before any git operation), `patches: []`. --dry-run prints and stops here.
//   2. subtrees: remote `<id>-upstream` (push URL no-push), `git subtree add --prefix=games/<id> <sha> --squash`, then
//      `diff -r -x .git games/<id> <clone>` must be empty (else abort and report — never patch).
//   3. manifests/<id>.json + manifests/index.json, then the gates per game (a red gate keeps the subtree): check-manifest;
//      Node idle hash (plain page, no automation) = manifest.headless.idleHash; goldens written, counts = manifest.census;
//      page.mjs --gate load (the plain page). Rows appended to results/SUMMARY.md.
// The census checkout is a DEV-TIME dependency of this tool only (its license classifier and manifest emitter); the page
// and the harness never import it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, sha256hex, writeJSON, readManifest } from './harness/lib.mjs';

const a = parseArgs(process.argv.slice(2), ['dry-run', 'au-check', 'summary']);
const CENSUS = path.resolve(a.census || process.env.TMT_CENSUS || path.join(REPO, '..', 'tmt-fork-census'));
const TAG = a.tag || 'add-game';
if (!a._.length) { console.error('usage: node tools/add-game.mjs <owner/repo>... [--id <id>] [--sha <sha>] [--dry-run]'); process.exit(2); }
if ((a.id || a.sha) && a._.length > 1) { console.error('--id / --sha apply to a single target'); process.exit(2); }
if (!fs.existsSync(path.join(CENSUS, 'scripts/manifest.mjs'))) { console.error(`no tmt-fork-census checkout at ${CENSUS} (--census)`); process.exit(2); }

const { classifyLicenseText, licenseFilesIn } = await import(path.join(CENSUS, 'lib/license-text.mjs'));
const { readJsonl, latestBy, safeName } = await import(path.join(CENSUS, 'lib/util.mjs'));
const { CALIBRATION } = await import(path.join(CENSUS, 'lib/calibration.mjs'));

const git = (...args) => execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const gitIn = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (...m) => console.error('[add-game]', ...m);

export const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const ID_RE = /^[a-z0-9-]+$/;

// ---- the census data -------------------------------------------------------------------------------------------------
const table = JSON.parse(fs.readFileSync(path.join(CENSUS, 'results/table.json'), 'utf8')).rows;
const boots = latestBy(readJsonl(path.join(CENSUS, 'data/boot.jsonl')));
const manifestsDir = path.join(REPO, 'manifests');
const existing = fs.readdirSync(manifestsDir).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => readManifest(f.slice(0, -5)));

// The vendored files the loader already carries: URL → {path, sha256}, each checked against the file's bytes.
const VENDOR = {};
for (const m of existing) for (const [url, v] of Object.entries(m.load?.vendor || {})) {
  const f = path.join(REPO, v.path);
  const sha = fs.existsSync(f) ? sha256hex(fs.readFileSync(f)) : null;
  if (sha !== v.sha256) { console.error(`vendor ${v.path}: sha256 ${sha} != pinned ${v.sha256} (manifest ${m.id})`); process.exit(3); }
  VENDOR[url] = { path: v.path, sha256: v.sha256 };
}

/** owner/repo → the census target (a fork row, or a calibration row naming that upstream) and its clone. */
function locate(repo) {
  const lc = repo.toLowerCase();
  const cal = CALIBRATION.find((c) => c.upstream && c.upstream.toLowerCase() === lc);
  const target = cal ? cal.full_name : (table.find((r) => r.full_name.toLowerCase() === lc) || {}).full_name || repo;
  const row = table.find((r) => r.full_name === target) || null;
  const bootRow = boots.get(target) || null;
  const clone = cal ? cal.local : path.join(CENSUS, 'clones', safeName(target));
  return { target, row, bootRow, clone, calibration: !!cal, repo: cal ? cal.upstream : row ? row.full_name : repo };
}

function licenseOf(clone) {
  const files = {};
  for (const f of licenseFilesIn(clone)) { const c = classifyLicenseText(fs.readFileSync(path.join(clone, f), 'utf8')); files[f] = c.verdict + (c.diff ? ` (${c.diff.slice(0, 120)})` : ''); }
  const vs = Object.values(files);
  const verdict = !vs.length ? 'none' : vs.every((v) => v === 'MIT') ? 'MIT' : Object.entries(files).map(([f, v]) => `${f}=${v}`).join('; ');
  return { verdict, files, ok: vs.length > 0 && vs.every((v) => v === 'MIT') };
}

/** The census emitter's manifest for `target` under `id`, with load.vendor filled and patches: []. */
function emitManifest(target, id) {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-addgame-')), `${id}.json`);
  const r = spawnSync(process.execPath, [path.join(CENSUS, 'scripts/manifest.mjs'), target, '--id', id, '--out', tmp], { cwd: CENSUS, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`manifest.mjs ${target}: exit ${r.status} ${(r.stderr || '').slice(-400)}`);
  const m = JSON.parse(fs.readFileSync(tmp, 'utf8'));
  const unknown = [];
  for (const [url, verdict] of Object.entries(m.load.external || {})) {
    if (verdict !== 'vendor') continue;
    if (VENDOR[url]) m.load.vendor[url] = { ...VENDOR[url] };
    else unknown.push(url);
  }
  // key order as the hand-finished manifests have it: … census, patches, generated
  const { generated, ...rest } = m;
  return { manifest: { ...rest, patches: [], generated }, unknownVendor: unknown };
}

/** Structural diff of two JSON values: paths that differ (first 20). */
function jsonDiff(x, y, p = '', out = []) {
  if (out.length >= 20) return out;
  if (JSON.stringify(x) === JSON.stringify(y)) return out;
  if (x && y && typeof x === 'object' && typeof y === 'object' && Array.isArray(x) === Array.isArray(y)) {
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) jsonDiff(x[k], y[k], p ? `${p}.${k}` : k, out);
    if (!out.length) out.push(`${p || '(root)'}: key order`);
    return out;
  }
  out.push(`${p}: ${JSON.stringify(x)?.slice(0, 80)} → ${JSON.stringify(y)?.slice(0, 80)}`);
  return out;
}

// ---- phase 1: preflight ------------------------------------------------------------------------------------------------
const taken = new Set([...existing.map((m) => m.id), ...existing.map((m) => slug(m.name))]);
const results = [];
for (const repoArg of a._) {
  const L = locate(repoArg);
  const res = { id: null, repo: L.repo, rank: L.row ? L.row.rank : null, sha: null, license: null, added: false, gates: {} };
  results.push(res);
  const bail = (skipped, detail) => { res.skipped = skipped; if (detail) res.detail = detail; log(`${repoArg}: skipped (${skipped})${detail ? ' ' + JSON.stringify(detail).slice(0, 300) : ''}`); };
  if (!L.bootRow) { bail('census', 'no data/boot.jsonl row'); continue; }
  if (!fs.existsSync(path.join(L.clone, 'index.html'))) { bail('census', `no clone at ${L.clone}`); continue; }
  const present = existing.find((m) => (m.upstream?.repo || '').toLowerCase() === L.repo.toLowerCase());
  // id
  if (present) res.id = present.id;
  else if (a.id) res.id = a.id;
  else {
    const base = slug(L.row?.mod_name ?? L.bootRow.mod_name);
    let id = base;
    if (taken.has(id)) { id = `${base}-${L.repo.split('/')[0].toLowerCase()}`; res.idCollision = { with: base, resolved: id }; }
    res.id = id;
  }
  if (!ID_RE.test(res.id || '')) { bail('id', `id "${res.id}" is not ^[a-z0-9-]+$ (mod_name ${JSON.stringify(L.row?.mod_name)}); pass --id`); continue; }
  if (!present) taken.add(res.id);
  // SHA: the census boot head resolved in the clone
  const full = gitIn(L.clone, 'rev-parse', 'HEAD');
  if (a.sha) res.sha = a.sha;
  else if (L.bootRow.head && full.startsWith(L.bootRow.head)) res.sha = full;
  else { bail('sha', `clone HEAD ${full} does not start with the census head ${L.bootRow.head}; pass --sha`); continue; }
  // license (before any git operation)
  res.license = licenseOf(L.clone);
  if (!res.license.ok) { bail('license', res.license.files); continue; }
  // manifest
  let em;
  try { em = emitManifest(L.target, res.id); } catch (e) { bail('manifest', String(e.message)); continue; }
  res.manifest = em.manifest;
  if (em.unknownVendor.length) {
    console.error(`STOP: ${L.repo} needs vendor URL(s) no manifest pins: ${em.unknownVendor.join(', ')} — vendor them by hand (docs/add-a-game.md) and re-run`);
    process.exit(3);
  }
  if (em.manifest.upstream.commit !== res.sha) { bail('sha', `manifest upstream.commit ${em.manifest.upstream.commit} != ${res.sha}`); continue; }
  res._L = L;
  if (present) {
    res.present = true;
    const strip = (m) => { const c = structuredClone(m); delete c.auto; if (c.load) delete c.load.known; if (c.generated) delete c.generated.at; return c; };
    res.reproduces = { manifest: `manifests/${present.id}.json`, equal: JSON.stringify(strip(present)) === JSON.stringify(strip(em.manifest)), diff: jsonDiff(strip(present), strip(em.manifest)), ignored: ['generated.at', 'auto (hand-written)', 'load.known (hand-kept)'] };
  }
}

const printLines = () => {
  for (const r of results) {
    const line = { id: r.id, repo: r.repo, rank: r.rank, sha: r.sha, license: r.license && { verdict: r.license.verdict, files: r.license.files }, added: r.added, gates: r.gates };
    for (const k of ['skipped', 'detail', 'idCollision', 'present', 'reproduces', 'error']) if (r[k] !== undefined) line[k] = r[k];
    if (a['dry-run'] && r.manifest) line.manifest = r.manifest;
    console.log(JSON.stringify(line));
  }
  if (a.json) writeJSON(a.json, results.map(({ _L, manifest, ...r }) => r));
};

if (a['dry-run']) {
  if (a.summary) {
    const { appendSection } = await import('./harness/summary.mjs');
    appendSection({ title: `${TAG} dry-run (\`node tools/add-game.mjs ${a._.join(' ')} --dry-run\`)`, commit: headCommit(), dirty: treeDirty(), slug: `add-game-dry-${TAG.replace(/[^\w-]+/g, '_')}`,
      reading: 'no git operation; a game already in the loader is matched by upstream.repo and its emitted manifest compared to the committed one without generated.at, the hand-written auto and the hand-kept load.known.',
      rows: results.map((r) => ({ gate: `${TAG} dry-run${r.present ? ' reproduces manifest' : ''}`, id: r.id || r.repo, ok: !r.skipped && (!r.present || r.reproduces.equal), notes: `${r.repo} @ ${r.sha}; license ${r.license?.verdict} ${JSON.stringify(r.license?.files || {})}${r.skipped ? '; SKIPPED ' + r.skipped + ' ' + JSON.stringify(r.detail) : ''}${r.idCollision ? `; id collision with ${r.idCollision.with} → ${r.idCollision.resolved}` : ''}${r.present ? `; manifests/${r.id}.json equal=${r.reproduces.equal}${r.reproduces.diff.length ? ' diff ' + r.reproduces.diff.join('; ') : ''}` : ''}` })) });
  }
  printLines();
  process.exit(0);
}

// ---- phase 2: subtrees -------------------------------------------------------------------------------------------------
const dirtyTracked = () => git('status', '--porcelain', '--untracked-files=no');
for (const r of results) {
  if (r.skipped) continue;
  if (r.present) { r.skipped = 'present'; r.detail = `already in the loader as manifests/${r.id}.json`; continue; }
  const L = r._L;
  try {
    if (fs.existsSync(path.join(REPO, 'games', r.id))) throw new Error(`games/${r.id} already exists`);
    if (dirtyTracked()) throw new Error(`tracked changes in the working tree; git subtree add refuses them:\n${dirtyTracked()}`);
    const remote = `${r.id}-upstream`;
    const remotes = git('remote').split('\n');
    log(`${r.id}: fetch ${L.repo}`);
    if (!remotes.includes(remote)) execFileSync('git', ['-C', REPO, 'remote', 'add', '-f', remote, `https://github.com/${L.repo}.git`], { stdio: ['ignore', 'ignore', 'pipe'] });
    else execFileSync('git', ['-C', REPO, 'fetch', remote], { stdio: ['ignore', 'ignore', 'pipe'] });
    git('remote', 'set-url', '--push', remote, 'no-push');
    try { git('cat-file', '-e', `${r.sha}^{commit}`); }
    catch { log(`${r.id}: ${r.sha} not on a fetched branch — fetching it by SHA`); execFileSync('git', ['-C', REPO, 'fetch', remote, r.sha], { stdio: ['ignore', 'ignore', 'pipe'] }); }
    log(`${r.id}: subtree add ${r.sha.slice(0, 7)}`);
    execFileSync('git', ['-C', REPO, 'subtree', 'add', '--prefix', `games/${r.id}`, r.sha, '--squash'], { stdio: ['ignore', 'ignore', 'pipe'] });
    const d = spawnSync('diff', ['-r', '-x', '.git', path.join(REPO, 'games', r.id), L.clone], { encoding: 'utf8', maxBuffer: 64 << 20 });
    if (d.status !== 0) { r.error = `diff -r games/${r.id} vs the census clone is NOT empty — not patched, subtree left for the planner:\n${(d.stdout + d.stderr).slice(0, 1500)}`; log(r.error); continue; }
    r.subtree = { remote, squash: git('log', '--format=%h', `--grep=^Squashed 'games/${r.id}/' content from commit`, '-n', '1'), merge: git('rev-parse', '--short', 'HEAD') };
    r.added = true;
  } catch (e) {
    r.error = String(e.stderr || e.message || e).slice(0, 1500);
    log(`${r.id}: ${r.error}`);
  }
}

// ---- phase 3: manifests, index, gates ------------------------------------------------------------------------------------
const added = results.filter((r) => r.added);
const indexFile = path.join(manifestsDir, 'index.json');
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
for (const r of added) {
  // the hand-written `auto` and the hand-kept `load.known` survive a re-emit (the census emitter writes neither)
  const prev = path.join(manifestsDir, `${r.id}.json`);
  if (fs.existsSync(prev)) {
    const old = JSON.parse(fs.readFileSync(prev, 'utf8'));
    if (old.auto !== undefined) r.manifest.auto = old.auto;
    if (old.load && old.load.known !== undefined) r.manifest.load.known = old.load.known;
  }
  writeJSON(path.join(manifestsDir, `${r.id}.json`), r.manifest);
  if (!index.some((e) => e.id === r.id)) index.push({ id: r.id, name: r.manifest.name, repo: r.manifest.upstream.repo });
}
fs.writeFileSync(indexFile, JSON.stringify(index, null, 2) + '\n');

const rows = [];
for (const r of results) if (r.skipped || r.error) rows.push({ gate: `${TAG} ${r.skipped ? 'skipped: ' + r.skipped : 'error'}`, id: r.id || r.repo, ok: false, notes: `${r.repo}: ${JSON.stringify(r.detail ?? r.error ?? '').slice(0, 400)}` });
if (added.length) {
  const { checkManifest } = await import('./harness/check-manifest.mjs');
  const { runNode } = await import('./harness/run.mjs');
  const { nodeIds } = await import('./harness/check-goldens.mjs');
  const commit = headCommit();
  const RED = (msg) => `RED: ${String(msg).slice(0, 400)}`;
  for (const r of added) {
    const m = r.manifest, id = r.id;
    const row = (gate, ok, extra) => rows.push({ gate: `${TAG} ${gate}`, id, ok, ...extra });
    log(`${id}: gates`);
    // check-manifest
    try {
      const cm = checkManifest(id);
      r.gates.checkManifest = cm.ok ? 'GREEN' : RED(JSON.stringify(cm.problems));
      row('check-manifest', cm.ok, { ticks: 0, gameSeconds: 0, notes: cm.ok ? `${cm.scripts} scripts, ${cm.modFiles} modFiles, subtree split ${cm.subtreeSplit?.slice(0, 7)}, games/${id} pristine` : JSON.stringify(cm.problems).slice(0, 400) });
    } catch (e) { r.gates.checkManifest = RED(e.message); row('check-manifest', false, { notes: String(e.message).slice(0, 400) }); }
    // idle hash, plain page's Node twin (no automation, no exclude)
    {
      const want = m.headless.idleHash;
      const n1 = runNode(id, { ticks: want.ticks, diff: want.diff, automation: false });
      const tableRow = r._L.row;
      const nondet = m.headless.deterministic === false || (tableRow && tableRow.deterministic === false);
      if (!n1.ok) { r.gates.idleHash = RED(`${n1.failed_at}: ${n1.error}`); row('idle hash = census', false, { leg: 'idle', notes: `${n1.failed_at}: ${n1.error}` }); }
      else if (n1.hash === want.hash) { r.gates.idleHash = 'GREEN'; row('idle hash = census', true, { leg: 'idle', ticks: n1.ticks, gameSeconds: n1.gameSeconds, diff: want.diff, hash: n1.hash, notes: `census ${want.hash}${nondet ? ' (census marks it nondeterministic; equal this run)' : ''}${n1.respawn_prestubs?.length ? '; respawn prestubs ' + n1.respawn_prestubs.join(',') : ''}` }); }
      else if (nondet) {
        const n2 = runNode(id, { ticks: want.ticks, diff: want.diff, automation: false });
        r.gates.idleHash = `nondeterministic: census ${want.hash}; runs ${n1.hash} / ${n2.hash}`;
        row('idle hash = census', true, { leg: 'idle', ticks: n1.ticks, gameSeconds: n1.gameSeconds, diff: want.diff, hash: n1.hash, notes: `NONDETERMINISTIC (census deterministic=${m.headless.deterministic}, table ${tableRow?.deterministic}${tableRow?.nondeterministic_paths ? ', paths ' + JSON.stringify(tableRow.nondeterministic_paths).slice(0, 120) : ''}): census ${want.hash}, run 1 ${n1.hash}, run 2 ${n2.hash} — recorded, not failed` });
      } else { r.gates.idleHash = RED(`hash ${n1.hash} != census ${want.hash}`); row('idle hash = census', false, { leg: 'idle', ticks: n1.ticks, gameSeconds: n1.gameSeconds, diff: want.diff, hash: n1.hash, notes: `census ${want.hash}${n1.respawn_prestubs?.length ? '; respawn prestubs ' + n1.respawn_prestubs.join(',') : ''}` }); }
    }
    // goldens written; counts = census
    try {
      const live = nodeIds(id);
      writeJSON(path.join(REPO, `tools/harness/goldens/${id}.ids.json`), { id, commit: m.upstream.commit, ...live });
      const c = m.census;
      const want = { ms: c.milestones, upg: c.upgrades, buy: c.buyables, ch: c.challenges, ach: c.achievements };
      const ok = Object.keys(want).every((k) => live.counts[k] === want[k]);
      r.gates.goldens = ok ? 'GREEN' : RED(`counts ${JSON.stringify(live.counts)} != census ${JSON.stringify(want)}`);
      row('goldens counts = census', ok, { ticks: 0, gameSeconds: 0, notes: `${live.ids.length} ids, ${Object.keys(live.layers).length} layers; ms ${live.counts.ms} / upg ${live.counts.upg} / buy ${live.counts.buy} / ch ${live.counts.ch} / ach ${live.counts.ach}${ok ? ' = census' : ` vs census ${JSON.stringify(want)}`}` });
    } catch (e) { r.gates.goldens = RED(e.message); row('goldens counts = census', false, { notes: String(e.message).slice(0, 400) }); }
    // G1 load, the plain page
    {
      const g = spawnSync(process.execPath, [path.join(REPO, 'tools/harness/page.mjs'), id, '--gate', 'load'], { cwd: REPO, encoding: 'utf8', timeout: 300e3 });
      const lr = (g.stdout || '').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l))[0];
      if (!lr) { r.gates.load = RED(`page.mjs exit ${g.status}: ${(g.stderr || '').slice(-300)}`); row('G1 load (plain page)', false, { notes: r.gates.load }); }
      else {
        r.gates.load = lr.ok ? 'GREEN' : RED(`ready ${lr.ready} error ${JSON.stringify(lr.error)}; ${lr.layerNodes} treeNodes; blocked ${lr.blocked} ${JSON.stringify(lr.blockedUrls)}; failed ${JSON.stringify(lr.failed)}; page errors ${JSON.stringify(lr.pageErrors)}; verdict vs load.known ${JSON.stringify(lr.loadVerdict)}${lr.exception ? '; ' + lr.exception : ''}`);
        row('G1 load (plain page)', lr.ok, { ticks: lr.ticks, gameSeconds: lr.ticks != null ? Math.round(lr.ticks * 0.05 * 1e9) / 1e9 : null, diff: 0.05, notes: `ready ${lr.loadMs} ms; ${lr.layerNodes} \`#app .treeNode\`; ${lr.requests} requests, ${lr.blocked} non-localhost, ${lr.failed?.length} failed, ${lr.pageErrors?.length} page errors; au nodes ${lr.auNodes}${lr.allowed ? `; allowed ${JSON.stringify(lr.allowed)}` : ''}; keys ${(lr.keys || []).map((k) => '`' + k + '`').join(', ')}${lr.ok ? '' : '; ' + r.gates.load}` });
      }
    }
    // once: the registry under ?automation=1 with no per-game table renders an empty au tab without error
    if (a['au-check']) {
      const { chromium } = await import('playwright');
      const { openContext, openGame, AU_NODE_SELECTOR } = await import('./harness/page.mjs');
      const { startServer } = await import('./harness/lib.mjs');
      const browser = await chromium.launch();
      const server = await startServer(REPO);
      try {
        const { context, stats } = await openContext(browser);
        const page = await context.newPage();
        const o = await openGame(page, server.url, id, { managed: true, automation: true });
        await page.evaluate(() => { showTab('au'); updateTemp(); });
        await page.waitForTimeout(600);
        const info = await page.evaluate(() => ({ features: tmtLoader.features.length, auTab: player.tab, text: document.querySelector('#app').innerText.includes('Automation Tools'), profile: tmtLoader.profile(), buttons: document.querySelectorAll('#app button.upg').length }));
        const auNodes = await page.locator(AU_NODE_SELECTOR).count();
        const ok = o.ready && !o.error && info.features === 0 && info.text && auNodes === 1 && stats.pageErrors.length === 0 && stats.failed.length === 0 && stats.blocked.length === 0;
        r.gates.emptyAuTab = ok ? 'GREEN' : RED(JSON.stringify({ o, info, auNodes, pageErrors: stats.pageErrors }));
        row('empty au tab (?automation=1, no table)', ok, { ticks: 0, gameSeconds: 0, notes: `ready ${o.ready}; features ${info.features}; tab ${info.auTab}; "Automation Tools" rendered ${info.text}; ${info.buttons} clickables (the master toggle, disabled); \`${AU_NODE_SELECTOR}\` × ${auNodes}; profile ${info.profile}; ${stats.pageErrors.length} page errors, ${stats.failed.length} failed, ${stats.blocked.length} blocked` });
        await context.close();
      } finally { await browser.close(); server.stop(); }
    }
  }
}
if (rows.length && results.some((r) => r.added || r.skipped !== 'present')) {
  const { appendSection } = await import('./harness/summary.mjs');
  const commit = headCommit();
  appendSection({ title: `${TAG} (\`node tools/add-game.mjs ${a._.join(' ')}\`)`, commit, dirty: treeDirty(), rows, slug: `add-game-${TAG.replace(/[^\w-]+/g, '_')}`,
    reading: 'the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page\'s Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).' });
}
printLines();
process.exit(results.some((r) => r.error) ? 1 : 0);
