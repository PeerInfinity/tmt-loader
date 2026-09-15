// Gate G5 — "loads from a bare clone". Clones the committed HEAD (git clone --depth 1 file://…) into a temp dir,
// serves the clone's PARENT with python3 -m http.server (PID recorded, stopped in finally) so the loader lives under
// /tmt-loader/ exactly as on GitHub Pages, runs gate G1 (tools/harness/page.mjs --gate load --base …) against it,
// loads index.html with no ?mod= and asserts the picker lists every game, then checks nothing in the clone changed.
//   node tools/check-pages.mjs [--keep]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, headCommit } from './harness/lib.mjs';
import { openContext, waitReady } from './harness/page.mjs';

const a = parseArgs(process.argv.slice(2), ['keep']);
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
const result = { gate: 'G5 bare clone', commit: headCommit(), repoClean: git(REPO, 'status', '--porcelain') === '', steps: [] };
const step = (name, ok, detail = {}) => { result.steps.push({ name, ok, ...detail }); console.log(`${ok ? 'GREEN' : 'RED  '} ${name} ${JSON.stringify(detail)}`); };

const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-pages-'));
const clone = path.join(parent, 'tmt-loader');
execFileSync('git', ['clone', '-q', '--depth', '1', `file://${REPO}`, clone]);
result.cloneHead = git(clone, 'rev-parse', '--short', 'HEAD');
step('clone', result.cloneHead === result.commit, { clone, head: result.cloneHead });

const server = await startServer(parent);
const base = `${server.url}tmt-loader/`;
result.base = base;
result.serverPid = server.pid;
let browser;
try {
  // G1 against the clone, at the sub-path
  const g1 = spawnSync(process.execPath, [path.join(REPO, 'tools/harness/page.mjs'), '--gate', 'load', '--base', base], { encoding: 'utf8', cwd: REPO, timeout: 300e3 });
  const g1rows = (g1.stdout || '').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
  for (const r of g1rows) step(`G1 load ${r.id} @ subpath`, r.ok, { readyMs: r.loadMs, layerNodes: r.layerNodes, requests: r.requests, blocked: r.blocked, failed: r.failed.length, pageErrors: r.pageErrors.length, keys: r.keys });
  if (g1.status !== 0 || g1rows.length !== GAMES().length) step('G1 exit', false, { status: g1.status, stderr: (g1.stderr || '').slice(-400) });

  // the picker: no ?mod=
  browser = await chromium.launch();
  const { context, stats } = await openContext(browser);
  try {
    const page = await context.newPage();
    const t0 = Date.now();
    await page.goto(`${base}index.html`, { waitUntil: 'load' });
    const r = await waitReady(page, t0);
    const listed = await page.$$eval('#picker li.game', (els) => els.map((e) => ({ id: e.dataset.id, name: e.querySelector('a').textContent, href: e.querySelector('a').href, meta: e.querySelector('.meta').textContent })));
    const want = GAMES();
    step('picker lists every game', r.ready && !r.error && listed.map((x) => x.id).join() === want.join() && stats.blocked.length === 0 && stats.failed.length === 0 && stats.pageErrors.length === 0,
      { listed, blocked: stats.blocked.length, failed: stats.failed, pageErrors: stats.pageErrors });
    // a picker link resolves under the sub-path
    step('picker links stay under the sub-path', listed.every((x) => x.href.startsWith(base)), { hrefs: listed.map((x) => x.href) });
  } finally { await context.close(); }
} finally {
  if (browser) await browser.close();
  server.stop();
}
const cloneStatus = git(clone, 'status', '--porcelain', '--ignored');
step('clone unmodified', cloneStatus === '', { status: cloneStatus });
step('repo clean', git(REPO, 'status', '--porcelain') === '', { status: git(REPO, 'status', '-sb') });
result.ok = result.steps.every((s) => s.ok);
if (!a.keep) fs.rmSync(parent, { recursive: true, force: true });
console.log(`G5 bare clone: ${result.ok ? 'GREEN' : 'RED'} (commit ${result.commit}, ${base})`);
fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp/check-pages-last.json'), JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
