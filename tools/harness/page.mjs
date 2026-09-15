// Playwright page runner (plan §4). One headless Chromium; every non-localhost request is aborted and counted.
//   node page.mjs <id> --ticks N --diff d [--leg idle|policy] [--until js] [--load-from player.json] [--base URL]
//                 [--state-out f] [--player-out f] [--json out]                                → one JSON line, like run.mjs
//                 [--profile off|all|saved] [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-automation]
//   node page.mjs [<id>...] --gate load [--base URL] [--automation]                    → gate G1 (every game by default)
// Automation (?automation=1): runs default ON (the harness); `--gate load` defaults to the PLAIN page (no flag), where it
// also asserts 0 × #app .smallNode.au, no player.au and no games-auto/ request.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, writeJSON, headCommit } from './lib.mjs';
import { DRIVE_SRC } from './policy.mjs';

const LOCAL = new Set(['127.0.0.1', 'localhost']);
export const LAYER_NODE_SELECTOR = '#app .treeNode';
export const AU_NODE_SELECTOR = '#app .smallNode.au';

/** Opens a browser context with the non-localhost block and the request/error counters. */
export async function openContext(browser, { allowExternal = false } = {}) {
  const context = await browser.newContext();
  const stats = { blocked: [], failed: [], pageErrors: [], consoleErrors: [], consoleWarnings: [], requests: 0, urls: [] };
  await context.route('**', (route) => {
    const u = new URL(route.request().url());
    if (!allowExternal && (u.protocol === 'http:' || u.protocol === 'https:') && !LOCAL.has(u.hostname)) { stats.blocked.push(u.href); return route.abort('blockedbyclient'); }
    return route.continue();
  });
  context.on('request', (r) => { stats.requests++; stats.urls.push(r.url()); });
  context.on('requestfailed', (r) => { if (!stats.blocked.includes(r.url())) stats.failed.push(`${r.url()} ${r.failure() && r.failure().errorText}`); });
  context.on('response', (r) => { if (r.status() >= 400) stats.failed.push(`${r.url()} HTTP ${r.status()}`); });
  const watch = (page) => {
    page.on('pageerror', (e) => stats.pageErrors.push(String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') stats.consoleErrors.push(m.text().slice(0, 300)); if (m.type() === 'warning') stats.consoleWarnings.push(m.text().slice(0, 300)); });
  };
  context.on('page', watch);
  return { context, stats };
}

/** Navigates to the loader for `id` and polls tmtLoader.ready || tmtLoader.error (30 s bound). */
export async function openGame(page, base, id, { managed = true, timeout = 30000, profile = null, autoOpt = null, automation = true } = {}) {
  const q = `${managed ? '&managed=1' : ''}${automation ? '&automation=1' : ''}${profile ? `&profile=${encodeURIComponent(profile)}` : ''}${autoOpt ? `&autoOpt=${encodeURIComponent(autoOpt)}` : ''}`;
  const url = new URL(`index.html?mod=${encodeURIComponent(id)}${q}`, base).href;
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load' });
  return waitReady(page, t0, timeout);
}
export async function waitReady(page, t0 = Date.now(), timeout = 30000) {
  const h = await page.waitForFunction(() => window.tmtLoader && (window.tmtLoader.ready || window.tmtLoader.error) ? { ready: window.tmtLoader.ready, error: window.tmtLoader.error, step: window.tmtLoader.step } : null, null, { timeout, polling: 100 });
  const r = await h.jsonValue();
  return { ...r, ms: Date.now() - t0 };
}

export const pageTick = (page, diff, n) => page.evaluate(([d, k]) => window.tmtLoader.tick(d, k), [diff, n]);
/** The same drive loop as boot.mjs (policy.mjs): N ticks, optional census policy, optional --until predicate. */
export const pageDrive = (page, { ticks, diff, leg = 'idle', until = null }) =>
  page.evaluate(`${DRIVE_SRC}(${Number(ticks)}, ${Number(diff)}, ${leg === 'policy'}, ${until ? `function(){ return (${until}); }` : 'null'})`);
/** tmtLoader.loadFrom(json): the game's importSave reloads the page; resolves once the reloaded loader is ready. */
export async function pageLoadFrom(page, json) {
  const nav = page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
  try { await page.evaluate((j) => window.tmtLoader.loadFrom(j), json); }
  catch (e) { if (!/context was destroyed|navigation/i.test(String(e))) throw e; }
  await nav;
  return waitReady(page);
}
export const pagePlayerJSON = (page) => page.evaluate(() => JSON.stringify(player));
export const pageState = (page, exclude = []) => page.evaluate(async (ex) => ({ ticks: tmtLoader.ticks, gameSeconds: tmtLoader.gameSeconds, hash: await tmtLoader.hash({ exclude: ex }), hashFull: await tmtLoader.hash(), json: tmtLoader.stateJSON({ exclude: ex }), points: String(player.points), profile: tmtLoader.profile(), hook: tmtLoader.hookStats ? tmtLoader.hookStats() : null }), exclude);

async function gateLoad(browser, base, ids, { automation = false } = {}) {
  const rows = [];
  for (const id of ids) {
    const { context, stats } = await openContext(browser);
    const row = { gate: 'G1', id, automation, ok: false };
    try {
      const page = await context.newPage();
      const r = await openGame(page, base, id, { managed: true, automation });
      Object.assign(row, { ready: r.ready, error: r.error, loadMs: r.ms });
      row.layerNodes = await page.locator(LAYER_NODE_SELECTOR).count();
      // the automation opt-in: the plain page has no au node, no player.au and never requests games-auto/
      row.auNodes = await page.locator(AU_NODE_SELECTOR).count();
      row.playerAu = await page.evaluate(() => typeof player !== 'undefined' && player && 'au' in player);
      row.gamesAutoRequests = stats.urls.filter((u) => /\/games-auto\//.test(u));
      row.optInOk = automation ? true : row.auNodes === 0 && !row.playerAu && row.gamesAutoRequests.length === 0;
      const shot = path.join(REPO, `tools/harness/results/${id}-load.png`);
      await page.screenshot({ path: shot });
      row.screenshot = path.relative(REPO, shot);
      // storage: 3 managed ticks, the game's own save, then every key in localStorage (raw) is in this game's namespace
      row.ticks = (await pageTick(page, 0.05, 3)).ticks;
      await page.evaluate(() => tmtLoader.save());
      const listAll = () => page.evaluate(() => { const raw = tmtLoader.storage.raw, o = {}; for (let i = 0; i < raw.length.call(localStorage); i++) { const k = raw.key.call(localStorage, i); o[k] = raw.getItem.call(localStorage, k); } return o; });
      const mine = await listAll();
      row.keys = Object.keys(mine);
      row.keysInNamespace = row.keys.length > 0 && row.keys.every((k) => k.startsWith(`tmt-loader:${id}:`));
      // the OTHER game on the same context (same origin, same localStorage)
      const other = ids.length > 1 ? ids.find((x) => x !== id) : GAMES().find((x) => x !== id);
      const page2 = await context.newPage();
      const r2 = await openGame(page2, base, other, { managed: true, automation });
      await page2.evaluate(() => { tmtLoader.tick(0.05, 3); tmtLoader.save(); });
      const both = await listAll();
      const otherKeys = Object.keys(both).filter((k) => !(k in mine));
      row.other = { id: other, ready: r2.ready, keys: otherKeys, keysInNamespace: otherKeys.length > 0 && otherKeys.every((k) => k.startsWith(`tmt-loader:${other}:`)) };
      row.firstUntouched = Object.entries(mine).every(([k, v]) => both[k] === v);
      await page2.close();
      Object.assign(row, { requests: stats.requests, blocked: stats.blocked.length, blockedUrls: [...new Set(stats.blocked)], failed: stats.failed, pageErrors: stats.pageErrors, consoleErrors: stats.consoleErrors });
      row.ok = !!(r.ready && !r.error && row.optInOk && stats.blocked.length === 0 && stats.failed.length === 0 && stats.pageErrors.length === 0 && row.layerNodes >= 1
        && row.keysInNamespace && row.other.ready && row.other.keysInNamespace && row.firstUntouched);
    } catch (e) {
      row.exception = String(e && e.stack || e).slice(0, 600);
    } finally { await context.close(); }
    rows.push(row);
    console.log(JSON.stringify(row));
  }
  return rows;
}

export async function runPage(browser, base, id, { ticks, diff, leg = 'idle', until = null, stateOut, loadFrom = null, playerOut = null, mutant = false, profile = null, exclude = [], autoOpt = null, automation = true }) {
  const { context, stats } = await openContext(browser);
  try {
    const page = await context.newPage();
    const r = await openGame(page, base, id, { managed: true, profile, autoOpt, automation });
    if (!r.ready) throw new Error(`not ready: ${JSON.stringify(r.error)}`);
    if (loadFrom != null) {
      const r2 = await pageLoadFrom(page, loadFrom);
      if (!r2.ready) throw new Error(`not ready after loadFrom: ${JSON.stringify(r2.error)}`);
    }
    if (mutant) await page.evaluate(() => { player.points = player.points.add(1); });
    const t0 = Date.now();
    const drive = await pageDrive(page, { ticks, diff, leg, until });
    const ms = Date.now() - t0;
    const st = await pageState(page, exclude);
    if (stateOut) fs.writeFileSync(stateOut, st.json);
    const player = playerOut ? await pagePlayerJSON(page) : null;
    if (playerOut) fs.writeFileSync(playerOut, player);
    return { runner: 'page', id, automation, leg, until: until ? { expr: until, met: drive.met, stoppedAtTick: st.ticks } : undefined, policy_errors: leg === 'policy' ? drive.policyErrors : undefined, player, ticks: st.ticks, gameSeconds: st.gameSeconds, diff, hash: st.hash, hashFull: exclude.length ? st.hashFull : undefined, profile: st.profile, exclude: exclude.length ? exclude : undefined, hook: st.hook && st.hook.hooked.length ? st.hook : undefined, ms, summary: { points: st.points }, blocked: stats.blocked.length, failed: stats.failed.length, pageErrors: stats.pageErrors, json: st.json };
  } finally { await context.close(); }
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['automation', 'no-automation']);
  const ids = a._.length ? a._ : GAMES();
  const browser = await chromium.launch();
  const server = a.base ? null : await startServer(REPO);
  const base = a.base || server.url;
  let code = 0;
  try {
    if (a.gate === 'load') {
      const rows = await gateLoad(browser, base, ids, { automation: !!a.automation });
      if (a.json) writeJSON(a.json, { commit: headCommit(), base, rows });
      code = rows.every((r) => r.ok) ? 0 : 1;
      console.log(`G1 load: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}`).join(' ')}`);
    } else {
      const out = await runPage(browser, base, ids[0], { ticks: Number(a.ticks ?? 200), diff: Number(a.diff ?? 0.05), leg: a.leg || 'idle', until: a.until || null, stateOut: a['state-out'], playerOut: a['player-out'], loadFrom: a['load-from'] ? fs.readFileSync(a['load-from'], 'utf8') : null, profile: a.profile || null, exclude: a.exclude ? a.exclude.split(',') : [], autoOpt: a['auto-opt'] || null, automation: !a['no-automation'] });
      delete out.json; delete out.player;
      console.log(JSON.stringify(out));
      if (a.json) writeJSON(a.json, out);
    }
  } finally {
    await browser.close();
    if (server) server.stop();
  }
  process.exit(code);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
