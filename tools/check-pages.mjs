// Gate G5 — "the site serves this tree, at the sub-path, and the games load from it".
//
//   node tools/check-pages.mjs [--keep] [--games id1,id2,…]     the CLONE form: clone the committed HEAD
//                                                               (git clone --depth 1 file://…) into a temp dir, serve
//                                                               its PARENT with python3 -m http.server so the loader
//                                                               lives under /tmt-loader/ exactly as on Pages, run G1
//                                                               against it, assert the home page loads and links the census, and
//                                                               check nothing in the clone changed.
//   node tools/check-pages.mjs --live https://…/tmt-loader/     the DEPLOY form: the same checks against the PUBLISHED
//                                                               site, plus the one thing only it can check — that what
//                                                               is being served IS this commit's tree.
//
// ⚖ WHERE THIS RUNS, and why it moved (user ruling, 2026-09-18). G5 used to be a thing a session ran by hand before a
// push. It is now a step of `.github/workflows/pages.yml`, AFTER the deploy — in the `--live` form — for two reasons:
//
//   · pushes no longer deploy (U2h made Pages `workflow_dispatch` only), so on a push this gate would be certifying
//     something the push did not change;
//   · nothing verified a manual publish at all beyond the deploy job going green. U2h had to fetch the URL by hand to
//     confirm the site was serving. A deploy that goes green and serves the PREVIOUS tree is the failure with no
//     witness, and `--live` is the witness: it compares served bytes against `git show HEAD:<path>` and WAITS for the
//     deploy to settle rather than assuming it has.
//
// ⚠ The two forms are not the same check and the run says so. `--live` cannot check that a clone is unmodified (there
// is no clone), and it bounds G1 to a NAMED sample (the whole roster over the public network is minutes of traffic for
// a check whose per-game part the CI sweep already owns on every push). It used to cover the whole roster through the
// picker; since U15 the home page is a short text and a link to the census, not a list, so the roster is held by G6
// (docs/games.md ≡ manifests/index.json) and the sweep, and this gate checks the home page itself.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, headCommit } from './harness/lib.mjs';
import { openContext, waitReady } from './harness/page.mjs';

const a = parseArgs(process.argv.slice(2), ['keep']);
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
const LIVE = a.live ? (String(a.live).endsWith('/') ? String(a.live) : `${a.live}/`) : null;
// The sample `--live` runs G1 on when nothing else is named: the deepest game (`ptr`, twenty views and the most
// scripts), the one whose engine is NOT under `js/` (`sorbet-s-convolution-mainframe` — the game every bounded sweep
// in this repo has dropped at least once), and the stock engine (`the-modding-tree`). A bounded run NAMES what it
// bounded, so this list is printed in the verdict line.
const LIVE_SAMPLE = ['ptr', 'sorbet-s-convolution-mainframe', 'the-modding-tree'];
const SAMPLE = a.games ? String(a.games).split(',').filter(Boolean) : LIVE ? LIVE_SAMPLE : GAMES();
// Served bytes vs `git show HEAD:<path>`. The loader's own inputs, the roster, and one file from the odd game's tree
// — enough to tell "serving this commit" from "serving the previous one", which is the failure a green deploy hides.
const SERVED = ['index.html', 'loader/page.js', 'loader/layerlist.js', 'manifests/index.json', 'games/sorbet-s-convolution-mainframe/Javascript/Mod.js'];
const SETTLE_TRIES = Number(a['settle-tries'] ?? 30);
const SETTLE_MS = Number(a['settle-ms'] ?? 10000);
const result = { gate: LIVE ? 'G5 live deploy' : 'G5 bare clone', mode: LIVE ? 'live' : 'clone', games: SAMPLE, commit: headCommit(), repoClean: git(REPO, 'status', '--porcelain') === '', steps: [] };
const step = (name, ok, detail = {}) => { result.steps.push({ name, ok, ...detail }); console.log(`${ok ? 'GREEN' : 'RED  '} ${name} ${JSON.stringify(detail)}`); };
const headBytes = (f) => execFileSync('git', ['-C', REPO, 'show', `HEAD:${f}`], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });

/** GET <base><file> as bytes, or null with the reason. */
async function fetchServed(base, file) {
  try {
    const r = await fetch(new URL(file, base), { cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
    if (!r.ok) return { bytes: null, why: `HTTP ${r.status}` };
    return { bytes: Buffer.from(await r.arrayBuffer()), why: null };
  } catch (e) { return { bytes: null, why: String(e.message || e) }; }
}

/** Which of SERVED differ from HEAD right now. */
async function servedDiff(base) {
  const out = [];
  for (const f of SERVED) {
    const { bytes, why } = await fetchServed(base, f);
    if (!bytes) out.push({ file: f, why });
    else if (!bytes.equals(headBytes(f))) out.push({ file: f, why: `served ${bytes.length} B, HEAD ${headBytes(f).length} B` });
  }
  return out;
}

let parent = null, clone = null, server = null, base = LIVE;
if (LIVE) {
  // ⚠ A deploy reports success before the CDN everywhere is serving it. So we do not assume it settled — we WAIT for
  // the served bytes to be this commit's, and fail loudly (naming the files) if they never become it. A check that
  // ran too early and passed anyway would be worse than no check.
  const t0 = Date.now();
  let diff = await servedDiff(base), tries = 1;
  while (diff.length && tries < SETTLE_TRIES) {
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    diff = await servedDiff(base); tries++;
  }
  result.settleMs = Date.now() - t0;
  result.settleTries = tries;
  step('the live site serves THIS commit', diff.length === 0, { base, head: git(REPO, 'rev-parse', 'HEAD'), files: SERVED.length, waitedMs: result.settleMs, tries, differing: diff });
} else {
  parent = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-pages-'));
  clone = path.join(parent, 'tmt-loader');
  execFileSync('git', ['clone', '-q', '--depth', '1', `file://${REPO}`, clone]);
  // full SHAs: the short form's length grows with the object count and differs between the repo and a depth-1 clone
  result.cloneHead = git(clone, 'rev-parse', 'HEAD');
  step('clone', result.cloneHead === git(REPO, 'rev-parse', 'HEAD'), { clone, head: result.cloneHead });
  server = await startServer(parent);
  base = `${server.url}tmt-loader/`;
  result.serverPid = server.pid;
}
result.base = base;
// On the published site the site's OWN origin is not localhost, so the blocker has to be told which host is this
// site. It is told exactly one host: a game reaching for cdn.glitch.com is still a blocked request, still a finding.
const allowHost = LIVE ? [`--allow-host`, new URL(base).hostname] : [];
let browser;
try {
  // G1 against the clone (or the live site), at the sub-path
  const g1 = spawnSync(process.execPath, [path.join(REPO, 'tools/harness/page.mjs'), ...SAMPLE, '--gate', 'load', '--base', base, ...allowHost], { encoding: 'utf8', cwd: REPO, timeout: 120e3 * SAMPLE.length });
  const g1rows = (g1.stdout || '').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
  for (const r of g1rows) step(`G1 load ${r.id} @ subpath`, r.ok, { readyMs: r.loadMs, layerNodes: r.layerNodes, requests: r.requests, blocked: r.blocked, failed: r.failed.length, pageErrors: r.pageErrors.length, keys: r.keys });
  if (g1.status !== 0 || g1rows.length !== SAMPLE.length) step('G1 exit', false, { status: g1.status, stderr: (g1.stderr || '').slice(-400) });

  // the HOME page: no ?mod= (⚖ U15, user 2026-09-23 — it is a short explanation and a link to the census, not a
  // list; the census is where the games are listed). What only this page can prove: it is ready without error, it
  // fetches NOTHING beyond the page and the loader's own modules — no manifest, nothing under games/ — and its link
  // to the census is there.
  browser = await chromium.launch();
  const { context, stats } = await openContext(browser, { allowHosts: LIVE ? [new URL(base).hostname] : [] });
  try {
    const page = await context.newPage();
    const t0 = Date.now();
    await page.goto(`${base}index.html`, { waitUntil: 'load' });
    const r = await waitReady(page, t0);
    const urls = stats.urls.map((u) => (u.startsWith(base) ? u.slice(base.length).split('?')[0] : u));
    const stray = urls.filter((u) => !(u === 'index.html' || /^loader\/[^/]+(\/[^/]+)?\.m?js$/.test(u)));
    const census = await page.$$eval('#home a', (els) => els.map((e) => e.href).filter((h) => /tmt-fork-census/.test(h)));
    const shown = await page.$eval('#home', (e) => !e.hidden).catch(() => false);
    step('home page ready, shown, no errors', r.ready && !r.error && shown && stats.blocked.length === 0 && stats.failed.length === 0 && stats.pageErrors.length === 0,
      { ready: r.ready, error: r.error || null, shown, blocked: stats.blocked.length, failed: stats.failed, pageErrors: stats.pageErrors });
    step('home page fetches only the page and the loader modules', stray.length === 0, { requests: urls.length, stray });
    step('home page links the census', census.length > 0, { census });
  } finally { await context.close(); }
} finally {
  if (browser) await browser.close();
  if (server) server.stop();
}
if (!LIVE) {
  // Only the clone form can say these: there is no clone in a live run, and the tree a CI deploy job holds has an
  // `npm ci` in it. ⛔ They are SKIPPED, loudly, rather than silently passing — a step that cannot run is not a step
  // that passed, and this whole file exists because a green thing that ran nothing looks like a green thing.
  const cloneStatus = git(clone, 'status', '--porcelain', '--ignored');
  step('clone unmodified', cloneStatus === '', { status: cloneStatus });
  step('repo clean', git(REPO, 'status', '--porcelain') === '', { status: git(REPO, 'status', '-sb') });
} else {
  result.notChecked = ['clone unmodified', 'repo clean'];
  console.log(`SKIP  ${result.notChecked.join(', ')} — the live form has no clone, and the deploy job's tree is not the check's subject`);
}
result.ok = result.steps.every((s) => s.ok);
if (parent && !a.keep) fs.rmSync(parent, { recursive: true, force: true });
console.log(`${result.gate}: ${result.ok ? 'GREEN' : 'RED'} (commit ${result.commit}, ${base}; G1 on ${SAMPLE.length} game(s) — ${SAMPLE.join(', ')}${LIVE ? `; settled in ${Math.round((result.settleMs || 0) / 1000)} s over ${result.settleTries} probe(s)` : ''})`);
fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp/check-pages-last.json'), JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
