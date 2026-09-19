// Playwright page runner (plan §4). One headless Chromium; every non-localhost request is aborted and counted.
//   node page.mjs <id> --ticks N --diff d [--leg idle|policy] [--until js] [--load-from player.json] [--base URL]
//                 [--state-out f] [--player-out f] [--json out]                                → one JSON line, like run.mjs
//                 [--profile off|all|saved] [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-automation]
//   node page.mjs [<id>...] --gate load [--base URL] [--automation]                    → gate G1 (every game by default)
//   node page.mjs [<id>...] --gate mobile [--base URL]           → gate M1, the mobile mode, the nav bar + the layer list
//   ... --gate <g> --shard i/N [--dry-run] --json out.json  → this runner's slice of the roster (1-based, like Playwright's);
//                                                  merge the slices with merge-shards.mjs, which is what catches a dead shard
// Automation (?automation=1): runs default ON (the harness); `--gate load` defaults to the PLAIN page (no flag), where it
// also asserts 0 × #app .smallNode.au, no player.au and no games-auto/ request.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, writeJSON, headCommit, readManifest, deepestSnapshot, assignShards, parseShard } from './lib.mjs';
import { DRIVE_SRC } from './policy.mjs';

const LOCAL = new Set(['127.0.0.1', 'localhost']);
export const LAYER_NODE_SELECTOR = '#app .treeNode';
export const AU_NODE_SELECTOR = '#app .smallNode.au';

/** Opens a browser context with the non-localhost block and the request/error counters. `stats.of(page)` holds the same
 * lists for one page (the G1 row checks its game's page against that game's `load.known`). */
export async function openContext(browser, { allowExternal = false, contextOptions = null } = {}) {
  const context = await browser.newContext(contextOptions || undefined);
  const fresh = () => ({ blocked: [], failed: [], pageErrors: [] });
  const stats = { blocked: [], failed: [], pageErrors: [], consoleErrors: [], consoleWarnings: [], requests: 0, urls: [] };
  const perPage = new Map();
  stats.of = (page) => { if (!perPage.has(page)) perPage.set(page, fresh()); return perPage.get(page); };
  const pageOfReq = (req) => { try { return req.frame().page(); } catch { return null; } };
  const push = (req, key, value) => { stats[key].push(value); const p = req && pageOfReq(req); if (p) stats.of(p)[key].push(value); };
  await context.route('**', (route) => {
    const u = new URL(route.request().url());
    if (!allowExternal && (u.protocol === 'http:' || u.protocol === 'https:') && !LOCAL.has(u.hostname)) { push(route.request(), 'blocked', u.href); return route.abort('blockedbyclient'); }
    return route.continue();
  });
  context.on('request', (r) => { stats.requests++; stats.urls.push(r.url()); });
  context.on('requestfailed', (r) => { if (!stats.blocked.includes(r.url())) push(r, 'failed', `${r.url()} ${r.failure() && r.failure().errorText}`); });
  context.on('response', (r) => { if (r.status() >= 400) push(r.request(), 'failed', `${r.url()} HTTP ${r.status()}`); });
  const watch = (page) => {
    page.on('pageerror', (e) => { const m = String(e).slice(0, 300); stats.pageErrors.push(m); stats.of(page).pageErrors.push(m); });
    page.on('console', (m) => { if (m.type() === 'error') stats.consoleErrors.push(m.text().slice(0, 300)); if (m.type() === 'warning') stats.consoleWarnings.push(m.text().slice(0, 300)); });
  };
  context.on('page', watch);
  return { context, stats };
}

/**
 * G1's load verdict for ONE page against its manifest's `load.known` (docs/manifest.md). Without a known block: 0 blocked,
 * 0 failed, 0 page errors. With one: a failed request only for a URL whose path is a declared missing script (and
 * tmtLoader.skipped must equal that list), a blocked request only for a declared host, page errors before ready only when
 * errorsBeforeReady is declared, and never one after ready. `pw` = this page's Playwright lists (stats.of(page)),
 * `loader` = {skipped, pageErrors} read from tmtLoader AFTER `pw` was snapshotted (so loader ⊇ pw).
 */
export function judgeLoad(manifest, base, pw, loader) {
  const known = (manifest.load && manifest.load.known) || null;
  const missing = new Set((known && known.missingScripts) || []);
  const hosts = new Set((known && known.externalHosts) || []);
  const gamePath = new URL(`games/${manifest.id}/`, base).pathname;
  const pathOf = (u) => { try { const p = new URL(u.split(' ')[0]).pathname; return p.startsWith(gamePath) ? p.slice(gamePath.length) : null; } catch { return null; } };
  const hostOf = (u) => { try { return new URL(u).hostname; } catch { return null; } };
  const failedBad = pw.failed.filter((f) => !missing.has(pathOf(f)));
  const blockedBad = pw.blocked.filter((u) => !hosts.has(hostOf(u)));
  const skipped = [...(loader.skipped || [])].sort();
  const skippedOk = JSON.stringify(skipped) === JSON.stringify([...missing].sort());
  const before = (loader.pageErrors || []).filter((e) => e.when === 'before-ready');
  const after = (loader.pageErrors || []).filter((e) => e.when !== 'before-ready');
  // Playwright's own count cannot exceed the loader's (read later); anything else means an error the loader did not see
  const errorsOk = known && known.errorsBeforeReady ? after.length === 0 && pw.pageErrors.length <= before.length + after.length : pw.pageErrors.length === 0 && after.length === 0 && before.length === 0;
  const ok = failedBad.length === 0 && blockedBad.length === 0 && skippedOk && errorsOk;
  const allowed = known ? { skipped: skipped.filter((f) => missing.has(f)).length, blockedHosts: [...new Set(pw.blocked.filter((u) => hosts.has(hostOf(u))).map(hostOf))].sort(), errorsBeforeReady: known.errorsBeforeReady ? before.length : 0 } : null;
  return { ok, allowed, failedBad, blockedBad, skippedOk, skipped, errorsBeforeReady: before.length, errorsAfterReady: after.length, errorsAfterReadySample: after.slice(0, 3) };
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
  page.evaluate(`${DRIVE_SRC}(${Number(ticks)}, ${Number(diff)}, ${leg === 'policy'}, ${until ? `function(){ return (${until}); }` : 'null'}, null)`);
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
      // each page judged against its OWN manifest's load.known (the other game shares the context, not the allowances)
      const judge = async (p, gid) => { const pw = structuredClone({ ...stats.of(p) }); const loader = await p.evaluate(() => ({ skipped: tmtLoader.skipped, pageErrors: tmtLoader.pageErrors })); return judgeLoad(readManifest(gid), base, pw, loader); };
      const j = await judge(page, id);
      const j2 = await judge(page2, other);
      await page2.close();
      const mine1 = stats.of(page);
      Object.assign(row, { requests: stats.requests, blocked: mine1.blocked.length, blockedUrls: [...new Set(mine1.blocked)], failed: mine1.failed, pageErrors: mine1.pageErrors, consoleErrors: stats.consoleErrors,
        known: readManifest(id).load.known ?? null, allowed: j.allowed, skipped: j.skipped, errorsBeforeReady: j.errorsBeforeReady, errorsAfterReady: j.errorsAfterReady,
        loadVerdict: { ok: j.ok, failedNotDeclared: j.failedBad, blockedNotDeclared: j.blockedBad, skippedEqualsDeclared: j.skippedOk, errorsAfterReadySample: j.errorsAfterReadySample },
        otherLoadVerdict: { ok: j2.ok, failedNotDeclared: j2.failedBad, blockedNotDeclared: j2.blockedBad, skippedEqualsDeclared: j2.skippedOk, errorsAfterReady: j2.errorsAfterReady } });
      row.ok = !!(r.ready && !r.error && row.optInOk && j.ok && j2.ok && row.layerNodes >= 1
        && row.keysInNamespace && row.other.ready && row.other.keysInNamespace && row.firstUntouched);
    } catch (e) {
      row.exception = String(e && e.stack || e).slice(0, 600);
    } finally { await context.close(); }
    rows.push(row);
    console.log(JSON.stringify(row));
  }
  return rows;
}

// ---------------------------------------------------------------- gate M1: the mobile mode (docs/mobile.md)
export const PHONE = { width: 390, height: 844 };  // a 2020s phone in portrait, CSS pixels
// The gate must emulate TOUCH, not just a narrow window. Without `hasTouch`/`isMobile` the page reports `hover:
// hover`, so the engines' `:hover` transforms apply — and Playwright parks the mouse at (0, 0), which is exactly
// where `.back` sits. Measured: `.back` read 47px wide at x=-2 (its 44px box under `scale(1.1)`), a hover state no
// phone can produce, reported as an element escaping the viewport. mobile.css neutralises those transforms under
// `@media (hover: none)`, which only matches when touch is emulated.
export const PHONE_CONTEXT = { viewport: PHONE, hasTouch: true, isMobile: true };
// The navbar-only leg runs at a DESKTOP viewport with NO touch: `?navbar=1` exists because the bar is wanted where
// the single-column layout is not, and that is the combination the leg has to measure. Without `hasTouch` the
// engines' `:hover` transforms apply exactly as they do for a mouse — which is the state a desktop reader is in.
export const DESKTOP = { width: 1280, height: 800 };
export const DESKTOP_CONTEXT = { viewport: DESKTOP };
export const MOBILE_TICKS = 200, MOBILE_DIFF = 0.05; // the state leg: enough ticks for a divergence to show in the hash
// Extra PLAIN draws demanded before the state leg is allowed to say MOVED. One control is not enough: a game with
// several reachable states can have its two plain runs agree BY CHANCE, and the leg then reads the mobile page's
// ordinary variation as a regression.
//
// MEASURED 2026-09-18 on `the-periodic-table-tree`, 14 runs x 3 draws = 42 draws: FIFTEEN distinct hashes, the
// mode taking 6 of them. Unbiased collision probability sum(n_i(n_i-1))/(n(n-1)) = 6.5%, so with ONE control
// P(false RED) ~ 7.9% -- about one every 13 sweeps. One was observed in ten. Four confirmations take the same
// estimate to ~1 in 80,000.
//
// The cost is paid ONLY on the path that would otherwise go red: a game whose mobile hash agrees, or whose first
// control already disagrees, draws nothing extra. Measured: `ptr` reports `equal` with no confirmations taken.
//
// The other five games that abstain are far flatter -- `the-cookie-tree`, `falling-mountain-s-alterprestige`,
// `the-gaming-tree`, `plague-tree-vorona-cirus-treesease`, `the-orchard-tree` gave ZERO repeats in 18 draws
// apiece, so they are not demonstrably at risk at all (18 draws bounds them at roughly 2%, no better). This one
// game dominates, which is WHY the fix is adaptive rather than a flat N controls for everybody.
export const STATE_CONFIRMATIONS = 4;
export const TAP_MIN = 44;                          // the tap-target minimum mobile.css promises

/**
 * ⚠ THE DISCRIMINATORS for U2b, on the two reference games only. A visibility filter that removes nothing and a
 * sort that changes nothing both sail through an assertion that only compares the list against a rule computed
 * the same way. So the leg also holds the two games to a RECORDED baseline:
 *  · the chip count must have FALLEN against U2's (SUMMARY.md 2026-09-18, the M1 layers leg at these same
 *    snapshot states: `ptr` 120 chips, `something` 70) — and it must fall even though U2b ADDS the milestones,
 *    which is the stronger statement;
 *  · at least one card's sequence must differ from U2's source order (every upgrade, then every buyable, then
 *    every challenge, by id) — otherwise the layout walk produced the arrangement it replaced.
 * Both are measured on the phone page, whose snapshot is the deepest recorded one.
 */
export const U2_CHIPS = { ptr: 120, something: 70 };

/** The deepest recorded snapshot for a game, or null. The fresh save of most games shows ONE tree node and no open
 * tab, so a gate that only ever looks at a fresh page cannot see the layout this mode exists to fix: the split
 * column, the milestone rows and the achievement grid all appear only once a layer tab is open. */

/** Everything the mobile layout promises, measured in the page. Geometry only — it asserts nothing about the game. */
const MOBILE_PROBE = `(${function () {
  const vw = document.documentElement.clientWidth;
  const vis = (el) => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0; };
  const desc = (el) => `${el.tagName}.${String(el.className || '').slice(0, 34)}`;
  // controls a finger has to hit: the engines' interactive classes plus anything that is a button
  // A control the game sized ITSELF (a layer's `nodeStyle()` lands in the style attribute) is exempt from the tap
  // minimum: mobile.css leaves it alone, so the gate must not demand what the stylesheet deliberately does not do.
  // The Galactic Tree hides a 1x1 easter-egg node this way.
  const sizedByGame = (el) => /height/i.test(el.getAttribute('style') || '');
  const controls = [...document.querySelectorAll('#app button, #app .upg, #app .smallUpg, #app .tabButton, #app .remove, #tmt-navbar button, #tmt-layerlist button')]
    .filter((el) => !el.hidden && !el.classList.contains('hidden') && !el.classList.contains('ghost') && vis(el))
    .map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.width > 0 && r.height > 0);
  return {
    vw,
    docScrollWidth: document.documentElement.scrollWidth,
    // anything interactive whose box leaves the viewport sideways: unreachable, and the reason the split column fails
    escaping: controls.filter(({ r }) => r.right > vw + 1 || r.left < -1).map(({ el, r }) => `${desc(el)} x=${Math.round(r.x)} w=${Math.round(r.width)}`),
    tooSmall: controls.filter(({ el, r }) => !sizedByGame(el) && (r.width < 44 || r.height < 44)).map(({ el, r }) => `${desc(el)} ${Math.round(r.width)}x${Math.round(r.height)}`),
    controls: controls.length,
    navButtons: [...document.querySelectorAll('#tmt-navbar button')].filter((b) => !b.hidden).map((b) => b.dataset.key),
    navH: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tmt-navbar-h')) || 0,
    htmlClass: document.documentElement.className,
    hasMobileCss: !!document.getElementById('tmt-loader-mobile-css'),
    hasNavbarCss: !!document.getElementById('tmt-loader-navbar-css'),
    flags: { mobile: window.tmtLoader.mobile, navbar: window.tmtLoader.navbar },
    // The two signals that say whether the LAYOUT is applied — for the navbar-only leg, which must see it OFF.
    // Every engine the loader hosts sizes `.col` at 49.5% and positions `#treeOverlay` absolutely; mobile.css
    // makes the first full-width and takes the second out of absolute positioning (measured `relative` on the
    // tree, `static` inside a tab). Read in every view, so the phone rows carry the mobile side of the same
    // measurement rather than the gate asserting one width in one mode only.
    cols: [...document.querySelectorAll('#app .col')].map((e) => Math.round(e.getBoundingClientRect().width)),
    overlayPos: document.getElementById('treeOverlay') ? getComputedStyle(document.getElementById('treeOverlay')).position : null,
    appColumnCount: document.getElementById('app') ? getComputedStyle(document.getElementById('app')).columnCount : null,
    tab: (typeof player !== 'undefined' && player) ? player.tab : null,
  };
}})()`;

/** The LAYER LIST's own claims (docs/mobile.md). Everything it compares against is computed HERE, out of the
 * engine's `tmp` / `player`, not asked of the overlay — a list that agreed with itself would assert nothing. The
 * geometry (escaping controls, the 44 px minimum) is MOBILE_PROBE's, which now also sees `#tmt-layerlist button`.
 *
 * ⚠ Nothing here reads the TREE: TMT 2.7 removes it from the DOM outright when a tab opens (11 nodes → 0) where
 * 2.2.1 keeps it, and the list is measured after a snapshot has opened tabs. */
const LAYERLIST_PROBE = `(${function () {
  const panel = document.getElementById('tmt-layerlist');
  const navBtns = [...document.querySelectorAll('#tmt-navbar button')].filter((b) => !b.hidden);
  const keys = navBtns.map((b) => b.dataset.key);
  const iL = keys.indexOf('layers'), iT = keys.indexOf('tree');
  // what the ENGINE says belongs on the list: a layer with a row that the tree draws a node for. `'ghost'` is the
  // invisible spacer (PTR's `blank`), and a layer with no `row` is a system pseudo-layer (`info-tab`, `tree-tab`).
  const expect = [];
  try {
    for (const l of LAYERS) {
      let row;
      try { row = tmp[l].row; } catch (e) { continue; }
      if (row === undefined || row === null || row === '') continue;
      let sh = false;
      try { sh = tmp[l].layerShown; } catch (e) { sh = false; }
      if (!sh || sh === 'ghost') continue;
      expect.push({ layer: l, row: String(row) });
    }
  } catch (e) { /* a game without LAYERS has an empty list, and this is empty too */ }
  const cards = panel ? [...panel.querySelectorAll('.tmt-layerlist-card')] : [];
  const rowOfCard = (c) => { const sec = c.closest('.tmt-layerlist-row'); return sec ? sec.dataset.row : null; };
  const chipsOf = (c) => [...c.querySelectorAll('.tmt-layerlist-chip')].map((x) => x.textContent);
  const expMap = Object.create(null);
  expect.forEach((e) => { expMap[e.layer] = e.row; });
  // ---- U2b: the ORDER and the MEMBERSHIP the tab layout implies, rebuilt HERE ------------------------------
  // ⚠ Written out a second time on purpose. The claim is "a chip sits where the game's own tab puts it", and a
  // list compared against its own `chipsOf` would assert nothing at all. This walks `tmp[l].tabFormat` from
  // scratch, applies the same three visibility rules, and the mutant battery is what says the two are not one
  // implementation wearing two hats.
  const KFIELD = { upgrades: 'title', buyables: 'title', challenges: 'name', milestones: 'requirementDescription' };
  // ⚠ SINCE U2d the walk also reaches `clickables` and `achievements`, which draw no chip: the collapsed card
  // counts every category the tab draws, not only the four that earn chips. They drop out of the CHIP expectation
  // through `named` below (they have no KFIELD entry), which is the same rule that drops a titleless upgrade.
  const PL = { upgrades: 'upgrades', buyables: 'buyables', challenges: 'challenges', milestones: 'milestones',
    clickables: 'clickables', achievements: 'achievements' };
  const SG = { upgrade: 'upgrades', buyable: 'buyables', challenge: 'challenges', milestone: 'milestones',
    clickable: 'clickables', achievement: 'achievements' };
  const TR = { 'upgrade-tree': 'upgrades', 'buyable-tree': 'buyables' };
  // the engine's own default, out of `layer-tab` in js/technical/systemComponents.js (2.2.1 and 2.7 agree)
  const DEF = ['infoboxes', 'main-display', 'prestige-button', 'resource-display', 'milestones', '@mid',
    'clickables', 'buyables', 'upgrades', 'challenges', 'achievements'];
  const S = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const ids = (kind, l) => {
    const src = S(() => layers[l][kind], null) || S(() => tmp[l][kind], null);
    if (!src || typeof src !== 'object') return [];
    let out = [];
    for (const k in src) {
      if (!S(() => !!src[k] && typeof src[k] === 'object', false)) continue;
      if (kind !== 'milestones' && isNaN(k)) continue;
      out.push(k);
    }
    if (kind === 'milestones') return out;
    out.sort((a, b) => Number(a) - Number(b));          // row*10+col IS reading order
    const R = S(() => tmp[l][kind].rows, undefined), C = S(() => tmp[l][kind].cols, undefined);
    if (typeof R === 'number' && typeof C === 'number' && R > 0 && C > 0) {
      out = out.filter((k) => Math.floor(k / 10) >= 1 && Math.floor(k / 10) <= R && k % 10 >= 1 && k % 10 <= C);
    }
    return out;
  };
  const drawn = (kind, l, id) => {            // the three visibility rules, in the engine's own terms
    const t = S(() => tmp[l][kind][id], null);
    if (!t) return false;
    const unl = S(() => t.unlocked === undefined ? true : !!t.unlocked, true);
    if (kind === 'upgrades' && !unl) return S(() => typeof pseudoUnl === 'function' && !!pseudoUnl(l, Number(id)), false);
    if (!unl) return false;
    if (kind === 'milestones') return S(() => typeof milestoneShown === 'function' ? !!milestoneShown(l, id) : true, true);
    if (kind === 'achievements' || kind === 'clickables') return true;   // `unlocked` is the whole of the condition
    if (kind === 'challenges') {
      const hiding = S(() => !!player.hideChallenges, false) || S(() => !!options.hideChallenges, false);
      if (!hiding) return true;
      const active = S(() => String(player[l].activeChallenge) === String(id), false);
      const maxed = S(() => typeof maxedChallenge === 'function' ? !!maxedChallenge(l, Number(id))
        : typeof hasChallenge === 'function' ? !!hasChallenge(l, Number(id)) : Number((player[l].challenges || {})[id]) > 0, false);
      return !(maxed && !active);
    }
    return true;
  };
  const named = (kind, l, id) => {            // "no usable short name → no chip" — the same rule as a titleless upgrade
    const f = KFIELD[kind];
    if (!f) return false;                     // clickables and achievements: counted, never chipped
    const o = S(() => layers[l][kind][id], null), tt = S(() => tmp[l][kind][id], null);
    let v = S(() => tt ? tt[f] : undefined, undefined);
    if (typeof v !== 'string') v = S(() => { const x = o[f]; return typeof x === 'function' ? x.call(o) : x; }, '');
    return /[A-Za-z0-9]/.test(String(v == null ? '' : v).replace(/<[^>]*>/g, ' '));
  };
  // ⚠ ONE COUNT PER LAYER, not one per call: since U2d the walker is driven three times for the same card (the
  // chips' expectation, the counters' and the buttons'), and an unguarded `shapes[...]++` reported ptr's 11 shown
  // layers as 33.
  const shapes = { none: 0, array: 0, object: 0 }, shapeSeen = Object.create(null);
  const seqDrawn = (l0) => {
    const out = [], seenL = Object.create(null);
    const push = (kind, l, id) => out.push(`${l}/${kind}/${id}`);
    const cat = (kind, l, data) => {
      let list = ids(kind, l);
      if (Array.isArray(data) && data.length) {
        const pick = Object.create(null);
        data.forEach((x) => { pick[String(x)] = true; });
        list = list.filter((id) => kind === 'milestones' ? !!pick[String(id)] : !!pick[String(Math.floor(Number(id) / 10))]);
      }
      list.forEach((id) => push(kind, l, id));
    };
    const comp = (name, data, l, d) => {
      if (d > 8) return;
      if (name === 'column' || name === 'row') return walk(data, l, d + 1);
      if (name === 'layer-proxy') { const ol = S(() => data[0], null); if (ol) walk(S(() => data[1], null), ol, d + 1); return; }
      if (name === 'microtabs') {
        const mt = S(() => tmp[l].microtabs[data][player.subtabs[l][data]], null);
        if (!mt) return;
        const e = S(() => mt.embedLayer, null);
        return e ? fmt(e, d + 1) : walk(S(() => mt.content, null), l, d + 1);
      }
      if (name === '@mid') return walk(S(() => tmp[l].midsection, null), l, d + 1);
      if (TR[name]) { if (Array.isArray(data)) data.forEach((r) => Array.isArray(r) && r.forEach((id) => push(TR[name], l, String(id)))); return; }
      if (SG[name]) { if (data !== undefined && data !== null) push(SG[name], l, String(data)); return; }
      if (PL[name]) return cat(PL[name], l, data);
    };
    const walk = (list, l, d) => {
      if (!Array.isArray(list) || d > 8) return;
      list.forEach((it) => {
        if (typeof it === 'string') return comp(it, undefined, l, d);
        if (Array.isArray(it) && (it.length === 2 || it.length === 3)) return comp(it[0], it[1], l, d);
      });
    };
    const fmt = (l, d) => {
      if (d > 8 || seenL[l]) return;
      seenL[l] = true;
      const f = S(() => tmp[l].tabFormat, undefined);
      if (d === 0 && !shapeSeen[l]) { shapeSeen[l] = 1; shapes[f === undefined || f === null ? 'none' : Array.isArray(f) ? 'array' : 'object']++; }
      if (f && typeof f === 'object' && !Array.isArray(f)) {
        const k = S(() => player.subtabs[l].mainTabs, undefined);
        const sub = S(() => f[k] !== undefined ? f[k] : f[Object.keys(f)[0]], null);
        if (!sub) return;
        const e = S(() => sub.embedLayer, null);
        return e ? fmt(e, d + 1) : walk(S(() => sub.content, null), l, d + 1);
      }
      walk(Array.isArray(f) ? f : DEF, l, d + 1);
    };
    fmt(l0, 0);
    const seen = Object.create(null), keep = [];
    for (const k of out) {
      if (seen[k]) continue;
      const [l, kind, id] = k.split('/');
      if (!drawn(kind, l, id)) continue;
      seen[k] = true;
      keep.push(k);
    }
    return keep;
  };
  // the chips' expectation is the DRAWN sequence that also has a usable short name; the counters' is the whole of
  // it, because a counter needs no name to count something
  const seqOf = (l) => seqDrawn(l).filter((k) => { const [ll, kind, id] = k.split('/'); return named(kind, ll, id); });
  // SOURCE ORDER — what U2 produced: every upgrade, then every buyable, then every challenge, by id. The chips
  // differing from it is the discriminator that says the layout walk is doing something.
  const sourceOrder = (l) => ['upgrades', 'buyables', 'challenges', 'milestones']
    .flatMap((kind) => ids(kind, l).map((id) => `${l}/${kind}/${id}`))
    .filter((k) => { const [ll, kind, id] = k.split('/'); return drawn(kind, ll, id) && named(kind, ll, id); });

  // ---- U2d: THE COLLAPSED CARD's two rows, rebuilt here out of the engine ----------------------------------
  // ⚠ Written a second time on purpose, like the chip sequence above: a card compared against the list's own
  // `countersOf` / `actionsOf` would assert nothing at all.
  const RATIO = { upgrades: 1, challenges: 1, milestones: 1, achievements: 1 };
  // ⚠ a TYPE test, not a magnitude one: `isFinite(d.toNumber())` is false for any Decimal past 1.8e308, which a
  // TMT save reaches routinely, and it would drop a real buyable out of its own total
  const isAmt = (v) => typeof v === 'number' ? isFinite(v) : S(() => !!v && typeof v === 'object' && typeof v.toNumber === 'function', false);
  const posAmt = (v) => typeof v === 'number' ? v > 0 : S(() => typeof v.gt === 'function' ? !!v.gt(0) : Number(v.toNumber()) > 0, false);
  const earned = (kind, l, id) => {
    if (kind === 'upgrades') return S(() => { const a = player[l].upgrades || []; return a.indexOf(Number(id)) >= 0 || a.indexOf(String(id)) >= 0; }, false);
    if (kind === 'milestones') return S(() => typeof hasMilestone === 'function' && !!hasMilestone(l, id), false);
    if (kind === 'achievements') return S(() => typeof hasAchievement === 'function' && !!hasAchievement(l, id), false);
    if (kind === 'challenges') return S(() => (typeof maxedChallenge === 'function' && !!maxedChallenge(l, Number(id)))
      || Number((player[l].challenges || {})[id]) > 0, false);
    return false;
  };
  // ONE COUNTER PER CATEGORY the tab draws, in first-appearance order: `x/y` for the ones you finish, THE TOTAL
  // OWNED for the ones you accumulate. A clickables box exists only while some clickable holds a number above zero
  // — the two engines start a clickable at `Decimal(0)` (2.2.1) and at `""` (2.7), so the value is the only test
  // that separates "holds an amount" from "holds nothing" on both.
  const ctrExpect = (l) => {
    const order = [], by = Object.create(null);
    for (const k of seqDrawn(l)) {
      const [ll, kind, id] = k.split('/');
      if (!by[kind]) { by[kind] = { kind, x: 0, y: 0, total: null, any: false }; order.push(kind); }
      const g = by[kind];
      if (RATIO[kind]) { g.y++; g.any = true; if (earned(kind, ll, id)) g.x++; continue; }
      let amt = null;
      if (kind === 'buyables') { const b = S(() => typeof getBuyableAmount === 'function' ? getBuyableAmount(ll, Number(id)) : player[ll].buyables[id], null); amt = isAmt(b) ? b : null; }
      else { const c = S(() => player[ll].clickables[id], null); amt = (isAmt(c) && posAmt(c)) ? c : null; }
      if (amt === null) continue;
      g.any = true;
      g.total = g.total === null ? amt : S(() => typeof g.total.add === 'function' ? g.total.add(amt) : g.total + amt, g.total);
    }
    return order.map((k) => by[k]).filter((g) => RATIO[g.kind] ? g.y > 0 : g.any)
      .map((g) => `${g.kind}:${RATIO[g.kind] ? `${g.x}/${g.y}` : S(() => typeof formatWhole === 'function' ? String(formatWhole(g.total)) : String(g.total), String(g.total))}`);
  };
  // WHICH COMPONENTS EARN A BUTTON: unlocked and not yet bought, in tab-layout order, and NEVER affordability.
  // A buyable is bought repeatedly, so for it "not yet bought" is "below its `purchaseLimit`" — a field only TMT
  // 2.7 declares (defaulted to `Decimal(Infinity)`), so on 2.2.1 the test is vacuous.
  const actExpect = (l) => seqOf(l).filter((k) => {
    const [ll, kind, id] = k.split('/');
    if (kind === 'milestones') return false;                       // passive
    if (kind === 'upgrades') {
      if (!S(() => { const u = tmp[ll].upgrades[id].unlocked; return u === undefined ? true : !!u; }, true)) return false;  // pseudo is not unlocked
      return !earned('upgrades', ll, id);
    }
    if (kind === 'challenges') return !earned('challenges', ll, id);
    if (kind === 'buyables') {
      const lim = S(() => tmp[ll].buyables[id].purchaseLimit, undefined);
      if (lim === undefined || lim === null) return true;
      const amt = S(() => typeof getBuyableAmount === 'function' ? getBuyableAmount(ll, Number(id)) : player[ll].buyables[id], null);
      if (amt === null) return true;
      return S(() => typeof amt.gte === 'function' ? !amt.gte(lim) : !(Number(amt) >= Number(lim.toNumber ? lim.toNumber() : lim)), true);
    }
    return false;                                                  // clickables, achievements: counted, never pressed
  });

  const chipKey = (e) => `${e.dataset.layer}/${e.dataset.kind}/${e.dataset.cid}`;
  const onScreen = (e) => e.getClientRects().length > 0;   // ⚠ NOT computed `display`: a child of a hidden row keeps its own
  // a divider at every category change and at NEITHER END, over one RENDERED sequence of marks
  const divProblems = (marks) => {
    const bad = [];
    if (marks.length && (marks[0] === '|' || marks[marks.length - 1] === '|')) bad.push('divider at an end');
    let prev = null;
    for (let i = 0; i < marks.length; i++) {
      if (marks[i] === '|') { if (marks[i + 1] === '|') bad.push(`double divider at ${i}`); continue; }
      if (prev !== null) {
        const hadDiv = marks[i - 1] === '|';
        if ((prev !== marks[i]) !== hadDiv) bad.push(`${prev}->${marks[i]} at ${i}: divider ${hadDiv}`);
      }
      prev = marks[i];
    }
    return bad;
  };
  const perCard = cards.map((c) => {
    const l = c.dataset.layer;
    const box = c.querySelector('.tmt-layerlist-chips');
    const ctrBox = c.querySelector('.tmt-layerlist-counters');
    const actBox = c.querySelector('.tmt-layerlist-actions');
    const want = seqOf(l);
    // ⚠ Measured on what the browser RENDERS, in BOTH states, not on the classes the list happened to write —
    // and the expanded one at all, which U2's leg named as a gap ("the leg never presses the +N button"). The
    // class is toggled directly rather than clicked: a click is not a neutral probe (docs/mobile.md), and the
    // expander's handler does nothing else. The card's own state is restored either way.
    // ⚠ SINCE U2d the visibility test is `getClientRects()`, not computed `display`: the collapsed card hides the
    // whole chip ROW, and a child of a `display: none` parent still reports its OWN computed display — so the old
    // test would have said the collapsed card renders every chip it is in fact hiding.
    const was = c.classList.contains('tmt-layerlist-expanded');
    const render = () => [...(box ? box.children : [])].filter(onScreen)
      .map((e) => e.classList.contains('tmt-layerlist-divider') ? '|' : e.dataset.kind);
    const shape = () => ({ counters: [...(ctrBox ? ctrBox.children : [])].filter(onScreen).length,
      acts: [...(actBox ? actBox.children : [])].filter(onScreen).length, chips: render().filter((x) => x !== '|').length });
    c.classList.remove('tmt-layerlist-expanded');
    const collapsed = render(), collShape = shape();
    c.classList.add('tmt-layerlist-expanded');
    const expanded = render(), expShape = shape();
    if (!was) c.classList.remove('tmt-layerlist-expanded');
    const got = box ? [...box.querySelectorAll('.tmt-layerlist-chip')].map(chipKey) : [];
    const divBad = [...divProblems(collapsed).map((x) => `collapsed: ${x}`), ...divProblems(expanded).map((x) => `expanded: ${x}`)];
    const src = sourceOrder(l);
    // ---- U2d: row one, the counters -------------------------------------------------------------------------
    const ctrEls = [...c.querySelectorAll('.tmt-layerlist-counter')];
    const counters = ctrEls.map((e) => `${e.dataset.kind}:${e.querySelector('.tmt-layerlist-counter-value').textContent}`);
    const wantCounters = ctrExpect(l);
    // ---- row two, the buttons. `all` is what the list decided to offer; `vis` is what the row HELD. ----------
    const actEls = [...c.querySelectorAll('.tmt-layerlist-act')];
    const acts = actEls.map((e) => `${e.dataset.layer}/${e.dataset.kind}/${e.dataset.cid}`);
    const wantActs = actExpect(l);
    const visIdx = actEls.map((e, i) => (onScreen(e) ? i : -1)).filter((i) => i >= 0);
    // what fits must be a PREFIX of the offer (the tab layout's order is kept: the cut is at the end, never a gap)
    const prefix = visIdx.every((v, i) => v === i);
    const tops = visIdx.map((i) => Math.round(actEls[i].getBoundingClientRect().top));
    const oneRow = tops.every((t) => Math.abs(t - tops[0]) <= 1);
    const cardR = c.getBoundingClientRect();
    const spill = [...ctrEls, ...visIdx.map((i) => actEls[i])].filter((e) => e.getBoundingClientRect().right > cardR.right + 1).length;
    // ⚖ THE TWO ROWS ARE GENUINELY TWO (user, 2026-09-18): no counter shares a line with a button. Measured on the
    // ELEMENTS, not on the two container boxes — a build that dropped the buttons into the counters' own row would
    // leave an empty `.tmt-layerlist-actions` behind and the container test would abstain on it rather than fail.
    // `null` where one of the two is empty: such a card looks the same under a single-row build and cannot judge it.
    const ctrVis = ctrEls.filter(onScreen), actVis = visIdx.map((i) => actEls[i]);
    const cr = ctrVis.length ? Math.max(...ctrVis.map((e) => e.getBoundingClientRect().bottom)) : null;
    const ar = actVis.length ? Math.min(...actVis.map((e) => e.getBoundingClientRect().top)) : null;
    return { layer: l, got, want, ok: got.length === want.length && got.every((x, i) => x === want[i]),
      divBad, fromSource: !(src.length === want.length && src.every((x, i) => x === want[i])),
      collapsed, expanded, collShape, expShape,
      // the two states must RENDER DIFFERENTLY — a card that looks the same in both is a card this leg cannot judge
      statesDiffer: collShape.chips !== expShape.chips || collShape.counters !== expShape.counters || collShape.acts !== expShape.acts,
      hasContent: !!(got.length || wantCounters.length),
      counters, wantCounters, countersOk: counters.length === wantCounters.length && counters.every((x, i) => x === wantCounters[i]),
      acts, wantActs, actsOk: acts.length === wantActs.length && acts.every((x, i) => x === wantActs[i]),
      actsFit: visIdx.length, actsOffered: actEls.length,
      lit: actEls.map((e) => (e.dataset.afford === 'yes' ? '1' : '0')).join(''),
      fitOk: prefix && oneRow && spill === 0, spill,
      twoRows: cr !== null && ar !== null ? cr <= ar + 1 : null,
      // ⚠ the DISCRIMINATING card for that check: one counter and two buttons would look right under a single-row
      // build too. This one would not.
      twoRowWitness: !!(collShape.counters >= 2 && collShape.acts >= 2),
      cardWidth: Math.round(cardR.width) };
  });
  const seqBad = perCard.filter((x) => !x.ok).map((x) => ({ layer: x.layer, got: x.got.slice(0, 12), want: x.want.slice(0, 12) }));
  const divBad = perCard.filter((x) => x.divBad.length).map((x) => ({ layer: x.layer, why: x.divBad.slice(0, 3) }));
  const rad = (sel) => { const e = panel ? panel.querySelector(sel) : null; return e ? getComputedStyle(e).borderRadius : null; };
  const px = (v) => { const m = /^(-?[\d.]+)px/.exec(String(v || '')); return m ? Number(m[1]) : NaN; };
  const msRad = rad('.tmt-layerlist-chip[data-kind="milestones"]'), upRad = rad('.tmt-layerlist-chip[data-kind="upgrades"], .tmt-layerlist-chip[data-kind="buyables"], .tmt-layerlist-chip[data-kind="challenges"]');
  return {
    present: !!panel,
    open: !!(panel && !panel.hidden),
    hasCss: !!document.getElementById('tmt-loader-layerlist-css'),
    hasUI: !!(window.tmtLoader && window.tmtLoader.layerListUI),
    navKeys: keys,
    // the button EXISTS and is immediately left of Tree — in the DOM order the bar builds and on the screen
    buttonLeftOfTree: iL >= 0 && iT === iL + 1 && navBtns[iL].getBoundingClientRect().left < navBtns[iT].getBoundingClientRect().left,
    expect: expect.map((e) => e.layer),
    cards: cards.map((c) => c.dataset.layer),
    // one card per shown layer, GROUPED BY ROW: every card sits in the section its layer's `tmp[l].row` names
    misrowed: cards.filter((c) => rowOfCard(c) !== expMap[c.dataset.layer]).map((c) => `${c.dataset.layer}@${rowOfCard(c)}!=${expMap[c.dataset.layer]}`),
    sections: [...(panel ? panel.querySelectorAll('.tmt-layerlist-row') : [])].map((x) => x.dataset.row),
    // a card's chips are distinct: the disambiguation pass is what makes a three-letter chip mean one thing
    dupeChips: cards.map((c) => { const t = chipsOf(c); return { layer: c.dataset.layer, dupes: t.length - new Set(t).size }; }).filter((x) => x.dupes > 0),
    chips: cards.reduce((n, c) => n + chipsOf(c).length, 0),
    resets: cards.filter((c) => c.querySelector('.tmt-layerlist-reset')).length,
    sample: cards.slice(0, 3).map((c) => ({ layer: c.dataset.layer, chips: chipsOf(c).slice(0, 8) })),
    // --- U2b ---------------------------------------------------------------------------------------------
    // the chip sequence equals the order the tab layout implies, rebuilt above out of `tmp[l].tabFormat`
    seqOk: seqBad.length === 0,
    seqBad: seqBad.slice(0, 3),
    // a divider at every category change and none at either end
    dividerOk: divBad.length === 0,
    dividerBad: divBad.slice(0, 3),
    dividers: cards.reduce((n, c) => n + c.querySelectorAll('.tmt-layerlist-divider').length, 0),
    // milestones get chips, and SQUARE corners where the rest are round. Abstains where the page has only one kind.
    milestoneChips: cards.reduce((n, c) => n + c.querySelectorAll('.tmt-layerlist-chip[data-kind="milestones"]').length, 0),
    // ⚠ visibility rule 2 — the engines' SECOND upgrade button. Counted rather than asserted, because it is
    // reachable in no recorded snapshot state on the roster: the gate must SAY it saw none, not pass in silence.
    pseudoChips: cards.reduce((n, c) => n + c.querySelectorAll('.tmt-layerlist-chip[data-state="pseudo"]').length, 0),
    radius: { milestone: msRad, other: upRad },
    // ⚠ NOT "they differ": ⚖ the ruling is that MILESTONES are square and the rest round (user, 2026-09-18), and a
    // build that swapped the two would differ just as well. U2b's mutant D made them the SAME, which is why the
    // weaker test held up then; the U2d battery's "square and round swapped" is what it cannot see.
    radiusOk: !(msRad && upRad) || (px(msRad) === 0 && px(upRad) > 0),
    // ⚠ THE DISCRIMINATORS. A sort that changes nothing is untested: `orderFromSource` counts the cards whose
    // sequence differs from U2's source order (every upgrade, then buyable, then challenge, by id).
    orderFromSource: perCard.filter((x) => x.fromSource).length,
    cardsWithChips: perCard.filter((x) => x.want.length).length,
    tabFormatShapes: shapes,
    // --- U2d: THE COLLAPSED CARD ---------------------------------------------------------------------------
    // ⚠ U2b's `capStarved` reporting is GONE, retired rather than answered: it counted the cards whose whole
    // category hid behind the `+N`, and every category the tab draws now has a counter whether or not it has a
    // chip. The 8-of-47 figure it carried is what says these assertions are worth something.
    countersOk: perCard.every((x) => x.countersOk),
    countersBad: perCard.filter((x) => !x.countersOk).slice(0, 3).map((x) => ({ layer: x.layer, got: x.counters, want: x.wantCounters })),
    counters: perCard.reduce((n, x) => n + x.counters.length, 0),
    counterCards: perCard.filter((x) => x.counters.length).length,
    // the BUSIEST counter row on the page — the one a phone has to hold, and the worst case for `spill` above
    maxCounters: perCard.reduce((m, x) => Math.max(m, x.counters.length), 0),
    maxCounterCard: perCard.reduce((m, x) => (x.counters.length > (m ? m.n : 0) ? { layer: x.layer, n: x.counters.length, row: x.counters } : m), null),
    // the button row: the SET against the independent expectation, and the FIT against the row's own geometry
    actionsOk: perCard.every((x) => x.actsOk),
    actionsBad: perCard.filter((x) => !x.actsOk).slice(0, 3).map((x) => ({ layer: x.layer, got: x.acts, want: x.wantActs })),
    actionsOffered: perCard.reduce((n, x) => n + x.actsOffered, 0),
    actionsFit: perCard.reduce((n, x) => n + x.actsFit, 0),
    actionCards: perCard.filter((x) => x.actsOffered).length,
    litCards: perCard.filter((x) => /1/.test(x.lit)).length,
    fitOk: perCard.every((x) => x.fitOk),
    fitBad: perCard.filter((x) => !x.fitOk).slice(0, 3).map((x) => ({ layer: x.layer, offered: x.actsOffered, fit: x.actsFit, spill: x.spill })),
    // ⚖ two rows, not one: their boxes share no vertical span. Judged only where both rows have something in them.
    twoRowsOk: perCard.every((x) => x.twoRows !== false),
    twoRowsBad: perCard.filter((x) => x.twoRows === false).map((x) => x.layer),
    twoRowsJudged: perCard.filter((x) => x.twoRows !== null).length,
    // the cards that would look WRONG under a single-row build, named — the ones the check is worth running on
    twoRowWitnesses: perCard.filter((x) => x.twoRowWitness).map((x) => x.layer),
    // the collapsed card and the expanded one must RENDER DIFFERENTLY
    statesOk: perCard.every((x) => !x.hasContent || x.statesDiffer),
    statesBad: perCard.filter((x) => x.hasContent && !x.statesDiffer).slice(0, 3).map((x) => ({ layer: x.layer, collapsed: x.collShape, expanded: x.expShape })),
    // a milestone counter's corners are not an upgrade counter's, where the page has both
    counterRadius: { milestone: rad('.tmt-layerlist-counter[data-kind="milestones"]'),
      other: rad('.tmt-layerlist-counter[data-kind="upgrades"], .tmt-layerlist-counter[data-kind="buyables"], .tmt-layerlist-counter[data-kind="challenges"], .tmt-layerlist-counter[data-kind="achievements"], .tmt-layerlist-counter[data-kind="clickables"]') },
    // per-card detail the legs below compare across ticks and across widths
    cardRows: perCard.map((x) => ({ layer: x.layer, w: x.cardWidth, counters: x.counters, acts: x.acts, want: x.wantActs, fit: x.actsFit, lit: x.lit })),
    throttle: S(() => window.tmtLoader.layerListUI.stats(), null),
  };
}})()`;

async function gateMobile(browser, base, ids) {
  const rows = [];
  for (const id of ids) {
    const row = { gate: 'M1', id, ok: false, views: [] };
    const t0 = Date.now();
    const { context, stats } = await openContext(browser, { contextOptions: PHONE_CONTEXT });
    try {
      // --- leg 1: INERTNESS. Without ?mobile=1 nothing of the mode may exist, at the same phone viewport.
      const plain = await context.newPage();
      const rp = await openGame(plain, base, id, { managed: true, automation: false });
      // BOTH opt-ins: `?navbar=1` is a flag of its own, so its file, its class, its stylesheet and its object must
      // be absent without it just as the layout's are.
      row.plain = await plain.evaluate(() => ({
        ready: tmtLoader.ready, mobile: tmtLoader.mobile, navbar: tmtLoader.navbar,
        mobileUI: !!tmtLoader.mobileUI, navbarUI: !!tmtLoader.navbarUI, layerListUI: !!tmtLoader.layerListUI,
        htmlClass: document.documentElement.className, css: !!document.getElementById('tmt-loader-mobile-css'),
        navbarCss: !!document.getElementById('tmt-loader-navbar-css'),
        layerListCss: !!document.getElementById('tmt-loader-layerlist-css'),
        nav: !!document.getElementById('tmt-navbar'), panel: !!document.getElementById('tmt-layerlist'),
        // `layerlist` joins the regex on the same reasoning the file name carries: no game ships a file with any of
        // these three names (measured over games/ at 5f3c404), so a hit here is the loader's own file and nothing else
        loadedMobile: tmtLoader.loaded.filter((f) => /mobile|navbar|layerlist/.test(f)),
      }));
      row.inertOk = !!(rp.ready && row.plain.mobile === false && row.plain.navbar === false
        && !row.plain.mobileUI && !row.plain.navbarUI && !row.plain.layerListUI
        && !row.plain.css && !row.plain.navbarCss && !row.plain.layerListCss && !row.plain.nav && !row.plain.panel
        && row.plain.loadedMobile.length === 0 && !/tmt-mobile|tmt-navbar|tmt-layerlist/.test(row.plain.htmlClass));
      // the state the plain page reaches in MOBILE_TICKS, to compare against the mobile page's below
      const plainState = await pageTick(plain, MOBILE_DIFF, MOBILE_TICKS).then(() => pageState(plain));
      await plain.close();
      // THE CONTROL. A hash that differs between the plain and the mobile page only means the mode moved the game
      // if the game reaches the same hash twice on its own. Measured, because some do not: `the-periodic-table-tree`
      // reaches FIFTEEN distinct hashes (42 draws, 2026-09-18), so its mobile/plain difference says nothing about
      // the mode. Nothing in the manifests declares this, so the gate establishes it per run -- and one agreement
      // is not enough to establish it, which is what STATE_CONFIRMATIONS is for.
      const plainDraw = async () => {
        const pg = await context.newPage();
        const r = await openGame(pg, base, id, { managed: true, automation: false });
        const st = r.ready ? await pageTick(pg, MOBILE_DIFF, MOBILE_TICKS).then(() => pageState(pg)) : null;
        await pg.close();
        return st;
      };
      const plainState2 = await plainDraw();

      // --- leg 2: the mode is a LAYOUT. Same ticks from the same fresh save, on the mobile page: the flag may not
      // move the game by one bit. Measured rather than asserted, and it is what lets the mode be an opt-in the
      // automation ladder's anchors can ignore.
      const fresh = await context.newPage();
      await fresh.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1&mobile=1`, base).href, { waitUntil: 'load' });
      const rf = await waitReady(fresh);
      const mobileState = rf.ready ? await pageTick(fresh, MOBILE_DIFF, MOBILE_TICKS).then(() => pageState(fresh)) : null;
      await fresh.close();
      let deterministic = !!(plainState2 && plainState2.hash === plainState.hash);
      const agrees = mobileState && mobileState.hash === plainState.hash && mobileState.ticks === plainState.ticks;
      // Only a would-be MOVED needs more evidence. An abstention is already the weakest verdict, and an `equal`
      // that a lucky control helped reach is the vacuous pass this leg has always been able to give -- neither
      // accuses the slice of anything. A RED does, so it is the one that has to be paid for.
      const confirmations = [];
      if (deterministic && !agrees) {
        for (let i = 0; i < STATE_CONFIRMATIONS && deterministic; i++) {
          const st = await plainDraw();
          confirmations.push(st && st.hash);
          if (!st || st.hash !== plainState.hash) deterministic = false;
        }
      }
      row.state = { ticks: MOBILE_TICKS, diff: MOBILE_DIFF, plain: plainState.hash, plainControl: plainState2 && plainState2.hash,
        mobile: mobileState && mobileState.hash, deterministic, points: plainState.points,
        ...(confirmations.length ? { confirmations } : {}) };
      // an abstention, not a pass: the leg cannot discriminate on a game that does not repeat its own hash
      row.stateVerdict = !deterministic ? 'nondeterministic (control differs: the leg abstains)'
        : agrees ? 'equal' : 'MOVED';
      row.stateOk = row.stateVerdict !== 'MOVED';

      // --- leg 3: the mobile page, at the fresh save and then at the deepest snapshot, one row per view
      // Runs LAST because its loadFrom writes the deep snapshot into this context's localStorage; a fresh-save leg
      // after it would boot on that save instead of a new game.
      const page = await context.newPage();
      const url = new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1&mobile=1`, base).href;
      await page.goto(url, { waitUntil: 'load' });
      const rm = await waitReady(page);
      row.ready = rm.ready; row.error = rm.error;

      const snapshot = deepestSnapshot(id);
      row.snapshot = snapshot ? { file: snapshot.file, ticks: snapshot.ticks } : null;
      const look = async (view) => { const m = await page.evaluate(MOBILE_PROBE); row.views.push({ view, ...m }); return m; };
      await look('fresh-tree');
      if (snapshot) {
        const r2 = await pageLoadFrom(page, snapshot.player);
        if (!r2.ready) throw new Error(`not ready after loadFrom: ${JSON.stringify(r2.error)}`);
        // every tab the save can open: the tree, each unlocked layer, and the system tabs the engine offers
        const tabs = await page.evaluate(() => {
          const out = ['none'];
          try { for (const l of LAYERS) if (layerunlocked ? layerunlocked(l) : player[l] && player[l].unlocked) out.push(l); } catch (e) { /* engines differ; the tree alone still measures */ }
          for (const sel of ['#info', '#optionWheel', '#help']) { const el = document.querySelector(sel); if (el) out.push({ click: sel }); }
          return out;
        });
        for (const t of tabs) {
          if (typeof t === 'string') await page.evaluate((n) => showTab(n), t);
          else await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) el.click(); }, t.click);
          await page.waitForTimeout(250);
          await look(typeof t === 'string' ? `tab:${t}` : `open:${t.click}`);
        }
      }
      // --- leg 4: the two opt-ins TOGETHER. They compose today, and nothing was asserting it: the mobile layout
      // has to survive the `au` side layer and its tab, and the nav bar has to survive a second side node. Only
      // for a game with an automation table — elsewhere the registry derives features but has nothing to drive.
      if (readManifest(id).auto) {
        const both = await context.newPage();
        await both.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1&mobile=1&automation=1`, base).href, { waitUntil: 'load' });
        const rb = await waitReady(both);
        let tree = null, auTab = null;
        if (rb.ready) {
          // ON THE TREE first. The `au` node only exists while the tree is rendered, and TMT 2.7 removes the tree
          // from the DOM outright when a tab opens (measured: 11 treeNodes → 0, with or without the mobile flag),
          // where 2.2.1 keeps it. Asserting the node after opening the tab would fail on 2.7 for engine reasons.
          tree = await both.evaluate(MOBILE_PROBE);
          tree.auNodes = await both.locator(AU_NODE_SELECTOR).count();
          tree.features = await both.evaluate(() => (tmtLoader.features || []).length);
          await both.evaluate(() => { try { showTab('au'); } catch (e) { /* engines differ; the geometry below still measures */ } });
          await both.waitForTimeout(400);
          auTab = await both.evaluate(MOBILE_PROBE);
          // The automation grid is FLATTENED. The registry lays its clickables out in fixed rows of four and the
          // engine renders one box per row, each wrapping alone, so any width fitting fewer than four left an
          // orphan (measured 3+1 at 412–536 px — a Pixel and an iPhone Pro Max both land there). mobile.css gives
          // those boxes `display: contents` so the buttons pack in one container instead.
          // Asserted as the MECHANISM, not as a row-count: counting buttons per visual row needs a tolerance to
          // group them, and that grouping — not the layout — is what goes wrong first. `display: contents` is the
          // thing that was fixed, it is exact, and the geometry checks above already catch anything overflowing.
          auTab.flattened = await both.evaluate(() => {
            const rows = [...document.querySelectorAll('.col.right .upgRow')].filter((e) => e.querySelector('button.upg'));
            return { rows: rows.length, contents: rows.filter((e) => getComputedStyle(e).display === 'contents').length };
          });
        }
        await both.close();
        const fits = (m) => m && m.escaping.length === 0 && m.tooSmall.length === 0 && m.docScrollWidth <= m.vw + 1;
        const fl = (auTab && auTab.flattened) || { rows: 0, contents: 0 };
        const evenRows = fl.rows > 0 && fl.contents === fl.rows;   // every clickable row box flattened
        row.both = tree && { auNodes: tree.auNodes, features: tree.features, navOnTree: tree.navButtons.length,
          treeFits: fits(tree), auTabFits: fits(auTab), auTab: auTab && auTab.tab, flattened: fl, evenRows,
          worst: [...(tree.escaping || []).slice(0, 2), ...((auTab && auTab.escaping) || []).slice(0, 2)] };
        row.bothOk = !!(rb.ready && tree && tree.auNodes === 1 && tree.features > 0 && tree.navButtons.length >= 1
          && fits(tree) && fits(auTab) && evenRows);
      } else { row.both = null; row.bothOk = true; }

      // --- leg 5: `?navbar=1` ALONE, at a DESKTOP viewport. The bar is the half of the mobile mode that is wanted
      // where the single-column layout is not, so this is the combination `?mobile=1` could never exercise: the
      // bar's own rules must apply and the layout's must not. A context of its own per page — `loadFrom` writes the
      // snapshot into localStorage, and a second page in the same context would boot on that save, not a fresh one.
      const deskViews = async (q, withLayers = false) => {
        const { context: c } = await openContext(browser, { contextOptions: DESKTOP_CONTEXT });
        try {
          const p = await c.newPage();
          await p.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1${q}`, base).href, { waitUntil: 'load' });
          const r = await waitReady(p);
          if (!r.ready) return { ready: false, error: r.error, views: [], layerList: null };
          const views = [{ view: 'fresh-tree', ...(await p.evaluate(MOBILE_PROBE)) }];
          // and one OPEN LAYER TAB where a snapshot can open one: `.col` exists only while a tab is open, and its
          // width is what says whether the single column leaked into a page that did not ask for it.
          if (snapshot) {
            const r2 = await pageLoadFrom(p, snapshot.player);
            if (r2.ready) {
              const layer = await p.evaluate(() => { try { for (const l of LAYERS) if (layerunlocked ? layerunlocked(l) : player[l] && player[l].unlocked) return l; } catch (e) { /* engines differ; the tree view still measures */ } return null; });
              if (layer) { await p.evaluate((n) => showTab(n), layer); await p.waitForTimeout(250); views.push({ view: `tab:${layer}`, ...(await p.evaluate(MOBILE_PROBE)) }); }
            }
          }
          // the LAYER LIST at a desktop width, on the page that has the bar. Taken here and not as another entry in
          // `views`, because every view in that array is PAIRED against the plain page, which has no panel to pair.
          let layerList = null;
          if (withLayers) {
            await p.evaluate(() => { const b = document.querySelector('#tmt-navbar button[data-key="layers"]'); if (b) b.click(); });
            await p.waitForTimeout(250);
            layerList = { ...(await p.evaluate(LAYERLIST_PROBE)), geometry: await p.evaluate(MOBILE_PROBE) };
            await p.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui) ui.close(); });
          }
          return { ready: true, views, layerList };
        } finally { await c.close(); }
      };
      const nb = await deskViews('&navbar=1', true);
      // THE CONTROL, always, and the same views: the plain desktop page is the layout this game was authored with,
      // so "the layout is not applied" is `equal to the plain page`, measured, rather than a width this gate
      // happens to believe every engine uses. It is also the inertness leg at a second viewport, for free.
      const ctl = await deskViews('');
      const near = (a, b) => Math.abs(a - b) <= 2;
      const paired = nb.views.map((v, i) => ({ v, c: ctl.views[i] })).filter((x) => x.c && x.v.view === x.c.view);
      const layoutOff = ({ v, c }) => !/tmt-mobile/.test(v.htmlClass) && !v.hasMobileCss
        && v.overlayPos === c.overlayPos && v.appColumnCount === c.appColumnCount
        && v.cols.length === c.cols.length && v.cols.every((w, i) => near(w, c.cols[i]))
        // and the brief's own reading of it: a `.col` is about HALF the viewport, not the whole of it
        && v.cols.every((w) => w > 0.35 * v.vw && w < 0.65 * v.vw);
      const barOn = (v) => v.navButtons.includes('tree') && v.navH > 0 && v.hasNavbarCss && /tmt-navbar/.test(v.htmlClass);
      const inert = (c) => c.flags.navbar === false && c.flags.mobile === false && !c.hasNavbarCss && !c.hasMobileCss && c.navButtons.length === 0;
      const fits = ({ v, c }) => v.escaping.length <= c.escaping.length && v.docScrollWidth <= Math.max(c.docScrollWidth, v.vw + 1);
      row.navbarOnly = { viewport: DESKTOP, ready: nb.ready && ctl.ready, error: nb.error || ctl.error || null,
        paired: paired.length, views: nb.views.length, controlViews: ctl.views.length,
        rows: paired.map(({ v, c }) => ({ view: v.view, flags: v.flags, nav: v.navButtons, navH: v.navH,
          cols: v.cols, controlCols: c.cols, overlayPos: v.overlayPos, controlOverlayPos: c.overlayPos,
          appColumnCount: v.appColumnCount, controlAppColumnCount: c.appColumnCount,
          mobileCss: v.hasMobileCss, navbarCss: v.hasNavbarCss, htmlClass: v.htmlClass,
          escaping: v.escaping.slice(0, 3), controlEscaping: c.escaping.slice(0, 3), docScrollWidth: v.docScrollWidth })) };
      row.navbarOnlyOk = !!(nb.ready && ctl.ready && paired.length === nb.views.length && paired.length > 0
        && paired.every(({ v }) => v.flags.mobile === false && v.flags.navbar === true && barOn(v))
        && paired.every(({ c }) => inert(c)) && paired.every(layoutOff) && paired.every(fits));

      // --- leg 6: the LAYER LIST (docs/mobile.md) — the selectable alternate view of the tree. Measured at BOTH
      // widths: on this phone page, whose deep snapshot has opened every tab the save can (so the list is built over
      // a real mid-game state), and on the desktop `?navbar=1` page from leg 5 above.
      // It runs LAST because it ACTS: the reset check below presses a real prestige button, which moves `player`.
      // THE LIST WRITES NOTHING. Its own claim, and the one that lets it sit beside the automation anchors: the
      // state hash across OPENING it (which calls `updateTemp()` and reads every layer) must be the one it had
      // before. Measured here, per game, rather than inferred from the state leg — that leg proves the FILE is
      // inert, this proves the PANEL is. The loop is paused (`?managed=1`), so nothing else can move it.
      // ⚠ Two things this measurement must not be fooled by, both MEASURED:
      //  · a CLICK is not neutral — some games count every click on the document (the-dressy-tree's `player.clicks`
      //    goes 0 → 1 when anything on the page is pressed, the nav bar's own buttons included). So the list is
      //    opened PROGRAMMATICALLY here and closed again; the button is exercised right afterwards, for the rest;
      //  · a paused page is not necessarily a STILL page. So the leg takes its own CONTROL first — two hashes back
      //    to back — and where the page will not repeat its own hash it ABSTAINS rather than blaming the list.
      // Both hashes are taken inside ONE evaluate with nothing between them but the open, so the window in which
      // anything else could move is as small as the page can make it.
      row.layersInert = await page.evaluate(async () => {
        const h = () => tmtLoader.hash();
        const c0 = await h(), c1 = await h();
        const before = await h();
        tmtLoader.layerListUI.open();
        const after = await h();
        tmtLoader.layerListUI.close();
        const stable = c0 === c1;
        return { stable, before, after, ok: !stable || before === after,
          verdict: !stable ? 'the page does not repeat its own hash (abstains)' : before === after ? 'unchanged' : 'MOVED' };
      });
      // and now through the BUTTON, which is what the rest of the leg is about
      await page.evaluate(() => { const b = document.querySelector('#tmt-navbar button[data-key="layers"]'); if (b) b.click(); });
      await page.waitForTimeout(250);
      const llPhone = { ...(await page.evaluate(LAYERLIST_PROBE)), geometry: await page.evaluate(MOBILE_PROBE) };
      const llShot = path.join(REPO, `tools/harness/results/${id}-layers.png`);
      await page.screenshot({ path: llShot, fullPage: false });

      // --- U2d leg A: HOW MANY BUTTONS A ROW HOLDS IS MEASURED, and it survives a resize -----------------------
      // ⚖ "as many as the row holds, measured at render, not a constant" (user, 2026-09-18). Measured on THIS page
      // at two widths rather than against the desktop page of leg 5: those are two different browsing contexts at
      // two different game states (MEASURED on ptr: 83 chips on the phone against 89 on the desktop page), so a
      // button count taken from each would be comparing states as much as widths. Resizing one page holds the
      // state still and is the resize the requirement is about anyway.
      const fitAt = async (vp) => {
        await page.setViewportSize(vp);
        await page.waitForTimeout(250);
        const L = await page.evaluate(LAYERLIST_PROBE);
        const g = await page.evaluate(MOBILE_PROBE);
        return { vw: vp.width, fitOk: L.fitOk, fitBad: L.fitBad, twoRowsOk: L.twoRowsOk, twoRowsBad: L.twoRowsBad,
          rows: L.cardRows.map((r) => ({ layer: r.layer, w: r.w, offered: r.acts.length, fit: r.fit })),
          escaping: (g.escaping || []).filter((e) => /tmt-layerlist/.test(e)), docScrollWidth: g.docScrollWidth };
      };
      const atPhone = await fitAt(PHONE), atDesk = await fitAt(DESKTOP), atBack = await fitAt(PHONE);
      await page.waitForTimeout(100);
      const byLayer = (r) => r.rows.reduce((o, x) => { o[x.layer] = x; return o; }, {});
      const D = byLayer(atDesk), B = byLayer(atBack);
      // a layer the PHONE row had to cut is the only kind that can show a wider row holding more
      const cut = atPhone.rows.filter((r) => r.offered > r.fit);
      const grew = cut.filter((r) => D[r.layer] && D[r.layer].fit > r.fit);
      const shrank = atPhone.rows.filter((r) => D[r.layer] && D[r.layer].fit < r.fit);
      const restored = atPhone.rows.every((r) => B[r.layer] && B[r.layer].fit === r.fit);
      row.fitWidths = {
        cardWidth: { phone: atPhone.rows.length ? atPhone.rows[0].w : null, desktop: atDesk.rows.length ? atDesk.rows[0].w : null },
        cut: cut.map((r) => `${r.layer} ${r.fit}/${r.offered}`), grew: grew.map((r) => `${r.layer} ${r.fit}→${D[r.layer].fit}`),
        shrank: shrank.map((r) => r.layer), restored,
        fitOk: atPhone.fitOk && atDesk.fitOk && atBack.fitOk,
        bad: [...atPhone.fitBad, ...atDesk.fitBad].slice(0, 3),
        escaping: [...atPhone.escaping, ...atDesk.escaping].slice(0, 3),
        verdict: !cut.length ? 'abstains (no card offers more buttons than the phone row holds)'
          : grew.length ? 'more at 1280 than at 390' : 'NO CARD HELD MORE AT 1280' };
      row.fitOk = !!(row.fitWidths.fitOk && restored && row.fitWidths.escaping.length === 0
        && !/NO CARD HELD MORE/.test(row.fitWidths.verdict) && shrank.length === 0);

      // --- U2d leg B: the button SET is not moved by affordability ---------------------------------------------
      // ⚖ The user chose the STABLE set over "affordable right now" (2026-09-18), so this is the property that has
      // to be asserted rather than merely implied: tick until the lit/grey vector moves, and the SET must not have.
      // A card whose INDEPENDENT expectation moved in the same window (an upgrade unlocked, a challenge completed)
      // abstains for that card — the leg cannot tell a legitimate membership change from affordability there.
      const before = await page.evaluate(LAYERLIST_PROBE);
      let litMoved = false, ticked = 0, after = before;
      for (let i = 0; i < 4 && !litMoved; i++) {
        await page.evaluate(() => { window.tmtLoader.tick(0.05, 250); window.tmtLoader.layerListUI.refresh(); });
        ticked += 250;
        after = await page.evaluate(LAYERLIST_PROBE);
        const a0 = byLayer({ rows: after.cardRows });
        litMoved = before.cardRows.some((r) => a0[r.layer] && r.lit !== a0[r.layer].lit);
      }
      const bMap = before.cardRows.reduce((o, r) => { o[r.layer] = r; return o; }, {});
      const moved = [], held = [], skipped = [];
      after.cardRows.forEach((r) => {
        const b = bMap[r.layer];
        // ⚠ `!b.acts.length` is NOT the skip: a build that SELECTED on affordability starts with an empty row and
        // grows one as the ticks make things affordable, which is precisely the movement this leg is for. Only a
        // card that has nothing to say either side is skipped.
        if (!b || (!b.acts.length && !r.acts.length && !b.want.length && !r.want.length)) return;
        if (b.want.join(' ') !== r.want.join(' ')) { skipped.push(r.layer); return; }  // the expectation itself moved
        (b.acts.join(' ') === r.acts.join(' ') ? held : moved).push(r.layer);
      });
      const litChanged = after.cardRows.filter((r) => bMap[r.layer] && bMap[r.layer].lit !== r.lit).map((r) => r.layer);
      row.stability = { ticks: ticked, litChanged, held: held.length, moved, abstained: skipped,
        sample: litChanged.length ? { layer: litChanged[0], lit: [bMap[litChanged[0]].lit, after.cardRows.find((r) => r.layer === litChanged[0]).lit], set: bMap[litChanged[0]].acts.length } : null,
        verdict: !litChanged.length ? `abstains (affordability did not move in ${ticked} ticks)`
          : moved.length ? 'THE SET MOVED' : 'the set held while lit/grey moved' };
      row.stabilityOk = !/THE SET MOVED/.test(row.stability.verdict);

      // --- U2d leg C: the counters are THROTTLED ---------------------------------------------------------------
      // Driven, not declared: mutate `#app` once per animation frame and count how many times the list actually
      // recomputed its counters. Unthrottled that is one per frame; at 250 ms it is one per four-or-so frames.
      row.throttle = await page.evaluate(async () => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui.stats) return { verdict: 'no stats()' };
        const app = document.getElementById('app');
        const frame = () => new Promise((r) => { let done = false;
          requestAnimationFrame(() => { if (!done) { done = true; r(); } });
          setTimeout(() => { if (!done) { done = true; r(); } }, 100); });
        const s0 = ui.stats(), t0 = performance.now();
        for (let i = 0; i < 12; i++) {
          if (app) { const d = document.createElement('span'); d.textContent = 'u2d'; app.appendChild(d); app.removeChild(d); }
          await frame();
        }
        await frame();
        const s1 = ui.stats(), ms = Math.round(performance.now() - t0);
        return { ms, refreshes: s1.refreshes - s0.refreshes, syncs: s1.syncs - s0.syncs,
          throttled: s1.throttled - s0.throttled, throttleMs: s1.throttleMs };
      });
      row.throttle.cap = row.throttle.throttleMs ? Math.ceil(row.throttle.ms / row.throttle.throttleMs) + 1 : null;
      row.throttle.verdict = row.throttle.refreshes === undefined ? 'no stats()'
        : row.throttle.refreshes < 3 ? `abstains (the observer fired ${row.throttle.refreshes}x in ${row.throttle.ms} ms)`
        : row.throttle.syncs > row.throttle.cap ? 'NOT THROTTLED'
        : `throttled (${row.throttle.syncs} sync(s) over ${row.throttle.refreshes} refresh(es) in ${row.throttle.ms} ms)`;
      row.throttleOk = !/NOT THROTTLED|no stats/.test(row.throttle.verdict);
      // THE CARD ACTS (⚖ user, 2026-09-18): the reset button really resets. Pressed on a layer the engine says can,
      // and judged by `player[l].points` MOVING — the one claim a rendering test cannot fake. Most games cannot reset
      // anything at the state a snapshot (or a fresh save) leaves them in, so the check TICKS to find a candidate and
      // ABSTAINS if it never gets one, naming the game, rather than passing vacuously.
      row.reset = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui) return { candidate: null, why: 'no layerListUI' };
        const pick = () => {
          for (const l of ui.cards()) {
            try {
              if (!tmp[l].canReset) continue;
              // ⚠ `canReset` does NOT mean a reset yields anything. TMT 2.2.1's is `baseAmount >= requires AND
              // getResetGain() > 0`; 2.7's drops the second half, so a layer can be resettable for +0 — MEASURED on
              // the-chronicle-tree, whose `g` reads canReset at a fresh save and whose button says "+0 投入时间".
              // The gain is what makes the press observable, so the candidate has to have one.
              const g = tmp[l].resetGain;
              if (!(g && (typeof g.gt === 'function' ? g.gt(0) : Number(g) > 0))) continue;
              if (!(player[l] && player[l].points !== undefined)) continue;   // a `type: none` side layer has none
              if (!document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-reset`)) continue;
              return l;
            } catch (e) { /* one layer's throw costs that layer, not the search */ }
          }
          return null;
        };
        let l = pick(), ticks = 0;
        for (let i = 0; i < 4 && !l; i++) {
          try { window.tmtLoader.tick(0.05, 500); } catch (e) { break; }
          ticks += 500;
          ui.refresh();
          l = pick();
        }
        if (!l) return { candidate: null, ticks, why: 'no layer both canReset and has a resetGain above 0' };
        const btn = document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-reset`);
        const before = String(player[l].points);
        btn.click();
        return { candidate: l, ticks, before, after: String(player[l].points), text: btn.textContent.slice(0, 80) };
      });
      row.resetVerdict = !row.reset.candidate ? 'no candidate (the leg abstains)'
        : row.reset.after !== row.reset.before ? 'moved' : 'NOT MOVED';

      // --- U2d leg D: A COUNTER'S `x` MOVES WHEN THE THING IS EARNED -------------------------------------------
      // Driven by a real purchase through the card's own button — the one claim a rendering test cannot fake — and
      // judged on the PARSED `x`, never on the string, so a counter that merely redrew the same text fails it. Runs
      // after the reset press because a reset UNBUYS a layer's upgrades, which is what puts an affordable one back
      // within reach at a deep snapshot state.
      row.counterMove = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        const val = (card) => { const e = card.querySelector('.tmt-layerlist-counter[data-kind="upgrades"] .tmt-layerlist-counter-value'); return e ? e.textContent : null; };
        for (const card of document.querySelectorAll('.tmt-layerlist-card')) {
          const btn = card.querySelector('.tmt-layerlist-act[data-kind="upgrades"][data-afford="yes"]');
          const t0 = val(card);
          if (!btn || t0 === null) continue;
          const x0 = Number(String(t0).split('/')[0]);
          btn.click();
          if (ui) ui.refresh();
          const t1 = val(card);
          return { candidate: card.dataset.layer, id: btn.dataset.cid, before: t0, after: t1,
            x0, x1: t1 === null ? null : Number(String(t1).split('/')[0]) };
        }
        return { candidate: null, why: 'no affordable upgrade button on any card' };
      });
      row.counterVerdict = !row.counterMove.candidate ? 'no candidate (the leg abstains)'
        : row.counterMove.x1 !== null && row.counterMove.x1 > row.counterMove.x0 ? 'moved' : 'NOT MOVED';
      // --- and the two VISIBILITY RULES the roster's recorded states cannot exercise on their own.
      // Rules 1 and 3 are measured by the sequence check on every game. Rule 2 (`pseudoUnl`) and the milestones'
      // second condition (`milestoneShown`, which reads the player's own `msDisplay`) are not: no game on the
      // roster DRAWS a pseudo-unlocked upgrade at any recorded snapshot, and every game's `msDisplay` is `always`.
      // So the leg CONSTRUCTS each condition here — the last thing done on this page, after the reset press — and
      // re-runs LAYERLIST_PROBE, whose expectation is computed independently and applies the same rules. That is
      // what makes it non-vacuous: a list that stopped asking the engine would not merely stop changing, it would
      // DISAGREE with the probe. (Measured: the first version asserted "the chips moved", and the mutant that
      // removes `pseudoUnl` made it ABSTAIN instead of fail — a green that hid the defect.)
      // ⚠ TMT 2.2.1 keeps `msDisplay` on `player`, TMT 2.7 on `options` (`js/utils/options.js:61`), and `options`
      // is not part of `player` there at all — so both are set, and both restored.
      const probe = () => page.evaluate(LAYERLIST_PROBE);
      await page.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui) ui.open(); });
      const rBase = await probe();
      await page.evaluate(() => {
        window.__tmtMs = {};
        try { window.__tmtMs.p = player.msDisplay; player.msDisplay = 'never'; } catch (e) { /* not this engine's */ }
        try { window.__tmtMs.o = options.msDisplay; options.msDisplay = 'never'; } catch (e) { /* nor this one's */ }
        const ui = window.tmtLoader.layerListUI; if (ui) ui.refresh();
      });
      const rMs = await probe();
      await page.evaluate(() => {
        try { if ('p' in window.__tmtMs) player.msDisplay = window.__tmtMs.p; } catch (e) {}
        try { if ('o' in window.__tmtMs) options.msDisplay = window.__tmtMs.o; } catch (e) {}
        delete window.__tmtMs; const ui = window.tmtLoader.layerListUI; if (ui) ui.refresh();
      });
      // ⚠ A THIRD condition no recorded state exercises: a CLICKABLE THAT HOLDS AN AMOUNT. Every clickable on the
      // roster sits at its engine's own starting value (`Decimal(0)` on 2.2.1, `""` on 2.7), and the rule is that
      // neither earns a box — so the counter that decides it is never seen doing anything. Constructed here, the
      // same way: give one drawn clickable a positive amount, look for the box, and put it back.
      const rClk = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        const box = (l) => document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-counter[data-kind="clickables"]`);
        for (const l of ui.cards()) {
          for (const e of ui.visibleSeq(l)) {
            if (e.kind !== 'clickables') continue;
            try {
              const had = player[e.layer].clickables[e.id];
              const zeroBox = !!box(l);
              player[e.layer].clickables[e.id] = (typeof Decimal === 'function') ? new Decimal(3) : 3;
              ui.refresh();
              const b = box(l);
              const text = b ? b.textContent : null;
              player[e.layer].clickables[e.id] = had;
              ui.refresh();
              return { layer: l, id: e.id, was: String(had), zeroBox, appeared: !!b, text, restored: !box(l) };
            } catch (err) { return { error: String(err).slice(0, 140) }; }
          }
        }
        return { candidate: null };
      });
      // ⚠ And a FOURTH: AN AMOUNT PAST `Number.MAX_VALUE`. A TMT save reaches 1e3284 routinely, but no recorded
      // state has a BUYABLE up there, so "is this an amount?" asked as `isFinite(d.toNumber())` would pass every
      // gate on the roster while dropping a real buyable out of its own total. Constructed: one drawn buyable is
      // given 1e400 and the counter has to still have a box.
      const rBig = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        const box = (l) => document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-counter[data-kind="buyables"] .tmt-layerlist-counter-value`);
        if (typeof Decimal !== 'function') return { candidate: null, why: 'no Decimal' };
        for (const l of ui.cards()) {
          for (const e of ui.visibleSeq(l)) {
            if (e.kind !== 'buyables') continue;
            try {
              const had = player[e.layer].buyables[e.id];
              const b0 = box(l), t0 = b0 ? b0.textContent : null;
              player[e.layer].buyables[e.id] = new Decimal('1e400');
              ui.refresh();
              const b1 = box(l), t1 = b1 ? b1.textContent : null;
              player[e.layer].buyables[e.id] = had;
              ui.refresh();
              const b2 = box(l);
              return { layer: l, id: e.id, before: t0, big: t1, restored: !!b2 && b2.textContent === t0 };
            } catch (err) { return { error: String(err).slice(0, 140) }; }
          }
        }
        return { candidate: null };
      });
      const hasPseudo = await page.evaluate(() => typeof window.pseudoUnl === 'function');
      let rPs = null;
      if (hasPseudo) {
        // the engine's own predicate replaced with one that always says yes — which is what proves the list ASKS it
        await page.evaluate(() => { window.__tmtPu = window.pseudoUnl; window.pseudoUnl = () => true; const ui = window.tmtLoader.layerListUI; if (ui) ui.refresh(); });
        rPs = await probe();
        await page.evaluate(() => { window.pseudoUnl = window.__tmtPu; delete window.__tmtPu; const ui = window.tmtLoader.layerListUI; if (ui) ui.refresh(); });
      }
      const rBack = await probe();
      row.rules = {
        base: rBase.chips, milestones: rBase.milestoneChips,
        ms: { seqOk: rMs.seqOk, chips: rMs.chips, milestoneChips: rMs.milestoneChips,
          verdict: rBase.milestoneChips === 0 ? 'abstains (no milestone chip to hide)'
            : !rMs.seqOk ? 'SEQUENCE DISAGREES' : rMs.milestoneChips === 0 ? 'hidden' : 'STILL SHOWN' },
        pseudo: !hasPseudo ? { verdict: 'abstains (the engine has no pseudoUnl)' }
          : { seqOk: rPs.seqOk, chips: rPs.chips, pseudoChips: rPs.pseudoChips,
            verdict: !rPs.seqOk ? 'SEQUENCE DISAGREES' : rPs.chips === rBase.chips ? 'abstains (no locked upgrade in reach)'
              : rPs.pseudoChips > 0 ? 'appeared' : 'NOT MARKED pseudo' },
        bigAmount: rBig.candidate === null ? { verdict: `abstains (${rBig.why || 'no buyable drawn at this state'})` }
          : rBig.error ? { verdict: `abstains (${rBig.error})` }
          : { layer: rBig.layer, id: rBig.id, before: rBig.before, big: rBig.big,
              verdict: rBig.big === null ? 'THE BOX VANISHED AT 1e400' : rBig.big === rBig.before ? 'THE TOTAL DID NOT MOVE'
                : !rBig.restored ? 'NOT RESTORED' : 'counted at 1e400' },
        clickable: rClk.candidate === null ? { verdict: 'abstains (no clickable drawn at this state)' }
          : rClk.error ? { verdict: `abstains (${rClk.error})` }
          : { layer: rClk.layer, id: rClk.id, was: rClk.was, text: rClk.text,
              verdict: rClk.zeroBox ? 'A BOX AT THE ENGINE\'S ZERO' : !rClk.appeared ? 'NO BOX FOR A REAL AMOUNT'
                : !rClk.restored ? 'NOT RESTORED' : 'appeared for an amount, absent at the zero' },
        restored: rBack.chips === rBase.chips && !!rBack.seqOk && rBack.milestoneChips === rBase.milestoneChips,
      };
      row.rulesOk = !!(row.rules.restored && !/DISAGREES|STILL SHOWN|NOT MARKED|A BOX AT|NO BOX FOR|NOT RESTORED|VANISHED|DID NOT MOVE/.test(`${row.rules.ms.verdict} ${row.rules.pseudo.verdict} ${row.rules.clickable.verdict} ${row.rules.bigAmount.verdict}`));
      await page.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui) ui.close(); });
      const llDesk = nb.layerList;
      // one card per shown layer, in the row the engine names, with distinct chips on each card and the button in
      // the bar to its left — asserted identically at both widths
      // the SET, not the sequence: the list groups by row and sorts by the engine's `position` inside a row, which is
      // deliberately not `LAYERS` declaration order — `misrowed` is what asserts the grouping itself.
      const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
      // U2b: and the chips MIRROR THE NORMAL VIEW — the sequence equals the order the layer's own `tabFormat`
      // implies (rebuilt in the probe, never asked of the list), a divider sits at every category change and at
      // neither end, and a milestone chip's corners are not an upgrade chip's.
      // U2d: and the COLLAPSED card is two rows — a counter per category the tab draws (against an expectation
      // rebuilt in the probe), a button per component that is unlocked and not yet bought, the two rows sharing no
      // vertical span, what fits measured against the row's own box, and the two states rendering differently.
      const pxOf = (v) => { const m = /^(-?[\d.]+)px/.exec(String(v || '')); return m ? Number(m[1]) : NaN; };
      const ctrRadOk = (L) => !(L.counterRadius.milestone && L.counterRadius.other)
        || (pxOf(L.counterRadius.milestone) === 0 && pxOf(L.counterRadius.other) > 0);
      const listOk = (L) => !!(L && L.present && L.open && L.hasCss && L.hasUI && L.buttonLeftOfTree
        && sameSet(L.cards, L.expect) && L.misrowed.length === 0 && L.dupeChips.length === 0
        && L.seqOk && L.dividerOk && L.radiusOk
        && L.countersOk && L.actionsOk && L.fitOk && L.twoRowsOk && L.statesOk && ctrRadOk(L));
      // GEOMETRY, at each width on that width's own terms: the phone demands nothing escapes and nothing is under
      // 44 px (the same bar the other phone views are held to); the desktop is judged against the PLAIN desktop
      // page, which is the layout this game's author shipped (leg 5's rule).
      // The desktop side is compared against the plain desktop page in the SAME state — its last view, which is the
      // same tab the layers probe was taken over. Against the control and not against a literal (U1's mutant (b)):
      // MEASURED on ptr, the engine's own `.back` button is 38x50 at 1280 px on the plain page too, so demanding
      // `tooSmall === 0` here would fail every game for a button the mobile LAYOUT is what fixes. The 44 px minimum
      // is a promise about TOUCH, and the phone side below is where it is kept.
      const ctlLast = (ctl.views && ctl.views.length) ? ctl.views[ctl.views.length - 1] : null;
      const phoneGeomOk = !!(llPhone.geometry && llPhone.geometry.escaping.length === 0 && llPhone.geometry.tooSmall.length === 0
        && llPhone.geometry.docScrollWidth <= llPhone.geometry.vw + 1);
      const deskGeomOk = !!(llDesk && llDesk.geometry && ctlLast && llDesk.geometry.escaping.length <= ctlLast.escaping.length
        && llDesk.geometry.tooSmall.length <= ctlLast.tooSmall.length
        && llDesk.geometry.docScrollWidth <= Math.max(ctlLast.docScrollWidth, llDesk.geometry.vw + 1));
      row.layers = {
        phone: { ...llPhone, geometry: { escaping: llPhone.geometry.escaping.slice(0, 3), tooSmall: llPhone.geometry.tooSmall.slice(0, 3), docScrollWidth: llPhone.geometry.docScrollWidth, vw: llPhone.geometry.vw } },
        desktop: llDesk && { ...llDesk, geometry: { escaping: llDesk.geometry.escaping.slice(0, 3), controlEscaping: ctlLast ? ctlLast.escaping.slice(0, 3) : null, tooSmall: llDesk.geometry.tooSmall.slice(0, 3), controlTooSmall: ctlLast ? ctlLast.tooSmall.slice(0, 3) : null, docScrollWidth: llDesk.geometry.docScrollWidth, vw: llDesk.geometry.vw } },
        phoneOk: listOk(llPhone) && phoneGeomOk, desktopOk: listOk(llDesk) && deskGeomOk,
      };
      const u2 = U2_CHIPS[id];
      row.chipBaseline = u2 === undefined ? null
        : { u2, now: llPhone.chips, milestones: llPhone.milestoneChips, fell: llPhone.chips < u2,
            cardsOffSourceOrder: llPhone.orderFromSource, orderMoved: llPhone.orderFromSource > 0 };
      row.layersOk = !!(row.layers.phoneOk && row.layers.desktopOk && row.layersInert.ok && row.resetVerdict !== 'NOT MOVED'
        && row.rulesOk && (!row.chipBaseline || (row.chipBaseline.fell && row.chipBaseline.orderMoved))
        && row.fitOk && row.stabilityOk && row.throttleOk && row.counterVerdict !== 'NOT MOVED');
      row.layersScreenshot = path.relative(REPO, llShot);

      const shot = path.join(REPO, `tools/harness/results/${id}-mobile.png`);
      await page.screenshot({ path: shot, fullPage: false });
      row.screenshot = path.relative(REPO, shot);

      const bad = row.views.filter((v) => v.escaping.length || v.tooSmall.length || v.docScrollWidth > v.vw + 1);
      row.geometryOk = bad.length === 0;
      row.worst = bad.slice(0, 3).map((v) => ({ view: v.view, escaping: v.escaping.slice(0, 4), tooSmall: v.tooSmall.slice(0, 4), docScrollWidth: v.docScrollWidth }));
      // tier 2 must have installed itself: the nav bar is present, has at least the tree button, and has a height
      row.navOk = row.views.every((v) => v.navButtons.length >= 1 && v.navH > 0 && /tmt-navbar/.test(v.htmlClass) && v.hasMobileCss && v.hasNavbarCss);
      // the mobile page must load as cleanly as the plain one: judged against the SAME manifest allowances as G1
      const j = judgeLoad(readManifest(id), base, structuredClone({ ...stats.of(page) }), await page.evaluate(() => ({ skipped: tmtLoader.skipped, pageErrors: tmtLoader.pageErrors })));
      row.loadVerdict = { ok: j.ok, failedNotDeclared: j.failedBad, blockedNotDeclared: j.blockedBad, errorsAfterReady: j.errorsAfterReady, errorsAfterReadySample: j.errorsAfterReadySample };
      row.ok = !!(row.ready && !row.error && row.inertOk && row.stateOk && row.geometryOk && row.navOk && row.bothOk && row.navbarOnlyOk && row.layersOk && j.ok);
    } catch (e) {
      row.exception = String((e && e.stack) || e).slice(0, 600);
    } finally { await context.close(); }
    row.ms = Date.now() - t0;
    rows.push(row);
    console.log(JSON.stringify({ ...row, views: row.views.map((v) => ({ view: v.view, controls: v.controls, escaping: v.escaping.length, tooSmall: v.tooSmall.length, docScrollWidth: v.docScrollWidth, nav: v.navButtons })) }));
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
    // the load and the drive judged against the game's load.known (the same rule as G1)
    const pw = structuredClone({ ...stats.of(page) });
    const loadVerdict = judgeLoad(readManifest(id), base, pw, await page.evaluate(() => ({ skipped: tmtLoader.skipped, pageErrors: tmtLoader.pageErrors })));
    if (stateOut) fs.writeFileSync(stateOut, st.json);
    const player = playerOut ? await pagePlayerJSON(page) : null;
    if (playerOut) fs.writeFileSync(playerOut, player);
    return { runner: 'page', id, automation, leg, until: until ? { expr: until, met: drive.met, stoppedAtTick: st.ticks } : undefined, policy_errors: leg === 'policy' ? drive.policyErrors : undefined, player, ticks: st.ticks, gameSeconds: st.gameSeconds, diff, hash: st.hash, hashFull: exclude.length ? st.hashFull : undefined, profile: st.profile, exclude: exclude.length ? exclude : undefined, hook: st.hook && st.hook.hooked.length ? st.hook : undefined, ms, summary: { points: st.points }, blocked: stats.blocked.length, failed: stats.failed.length, pageErrors: stats.pageErrors, loadVerdict: { ok: loadVerdict.ok, allowed: loadVerdict.allowed, failedNotDeclared: loadVerdict.failedBad.length, blockedNotDeclared: loadVerdict.blockedBad.length, errorsAfterReady: loadVerdict.errorsAfterReady }, json: st.json };
  } finally { await context.close(); }
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['automation', 'no-automation', 'dry-run']);
  const roster = a._.length ? a._ : GAMES();
  // `--shard i/N` (1-based, like Playwright's) runs this runner's slice of the roster. The slice is a pure function
  // of (roster, N), so a CI shard and a local `--shard i/N` are the same set of games. ⛔ The shard records the
  // roster it was ASSIGNED, not just the rows it managed: a shard that dies early is otherwise a green checkmark.
  // `merge-shards.mjs` is what turns that record into a refusal.
  const shard = a.shard ? parseShard(a.shard) : null;
  const ids = shard ? assignShards(roster, shard.n)[shard.i - 1] : roster;
  const shardMeta = shard ? { i: shard.i, n: shard.n, roster: ids, rosterSize: roster.length } : undefined;
  if (shard) console.log(`shard ${shard.i}/${shard.n}: ${ids.length} of ${roster.length} game(s) — ${ids.join(' ')}`);
  // `--dry-run` answers "which games is shard 3 of 10?" without a browser or a server — the cheap way to check a
  // shard boundary, and what `docs/harness.md` tells you to run before a long one.
  if (a['dry-run']) { for (const id of ids) console.log(id); process.exit(0); }
  const browser = await chromium.launch();
  const server = a.base ? null : await startServer(REPO);
  const base = a.base || server.url;
  let code = 0;
  try {
    if (a.gate === 'load') {
      const rows = await gateLoad(browser, base, ids, { automation: !!a.automation });
      if (a.json) writeJSON(a.json, { commit: headCommit(), base, gate: 'load', shard: shardMeta, rows });
      code = rows.every((r) => r.ok) ? 0 : 1;
      console.log(`G1 load: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}${r.allowed ? ` allowed: ${JSON.stringify(r.allowed)}` : ''}`).join(' ')}`);
    } else if (a.gate === 'mobile') {
      const rows = await gateMobile(browser, base, ids);
      if (a.json) writeJSON(a.json, { commit: headCommit(), base, gate: 'mobile', shard: shardMeta, viewport: PHONE, touch: true, tapMin: TAP_MIN, rows });
      code = rows.every((r) => r.ok) ? 0 : 1;
      const abstained = rows.filter((r) => r.state && !r.state.deterministic).map((r) => r.id);
      console.log(`M1 mobile: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}`).join(' ')}`);
      console.log(`M1 state leg: ${rows.filter((r) => r.stateVerdict === 'equal').length} equal, ${rows.filter((r) => r.stateVerdict === 'MOVED').length} moved, ${abstained.length} abstained${abstained.length ? ` (not deterministic on their own: ${abstained.join(', ')})` : ''}`);
      const nbViews = rows.reduce((n, r) => n + ((r.navbarOnly && r.navbarOnly.paired) || 0), 0);
      console.log(`M1 navbar-only leg (${DESKTOP.width}\u00d7${DESKTOP.height}, no touch): ${rows.filter((r) => r.navbarOnlyOk).length}/${rows.length} green over ${nbViews} view(s), each against the same view of the plain desktop page`);
      const cards = rows.reduce((n, r) => n + ((r.layers && r.layers.phone && r.layers.phone.cards.length) || 0), 0);
      const chips = rows.reduce((n, r) => n + ((r.layers && r.layers.phone && r.layers.phone.chips) || 0), 0);
      console.log(`M1 layers leg: ${rows.filter((r) => r.layersOk).length}/${rows.length} green over ${cards} card(s) and ${chips} chip(s), at ${PHONE.width}px with touch and at ${DESKTOP.width}px without`);
      // U2b: the chips MIRROR THE NORMAL VIEW — the sequence, the dividers, the milestone corners, and the two
      // discriminators (a count that fell, an order that moved) on the reference games.
      const ll = (r) => (r.layers && r.layers.phone) || null;
      const shp = rows.reduce((o, r) => { const t = ll(r) && ll(r).tabFormatShapes; if (t) { o.none += t.none; o.array += t.array; o.object += t.object; } return o; }, { none: 0, array: 0, object: 0 });
      const ms = rows.reduce((n, r) => n + ((ll(r) && ll(r).milestoneChips) || 0), 0);
      const dv = rows.reduce((n, r) => n + ((ll(r) && ll(r).dividers) || 0), 0);
      const offSrc = rows.reduce((n, r) => n + ((ll(r) && ll(r).orderFromSource) || 0), 0);
      const withChips = rows.reduce((n, r) => n + ((ll(r) && ll(r).cardsWithChips) || 0), 0);
      const seqRed = rows.filter((r) => ll(r) && !ll(r).seqOk).map((r) => r.id);
      const divRed = rows.filter((r) => ll(r) && !ll(r).dividerOk).map((r) => r.id);
      const radRed = rows.filter((r) => ll(r) && !ll(r).radiusOk).map((r) => r.id);
      console.log(`M1 layers order: chip sequence equals the tabFormat-derived order in ${rows.length - seqRed.length}/${rows.length}${seqRed.length ? ` (RED: ${seqRed.join(', ')})` : ''}; dividers correct in ${rows.length - divRed.length}/${rows.length}${divRed.length ? ` (RED: ${divRed.join(', ')})` : ''}; milestone corners differ in ${rows.length - radRed.length}/${rows.length}${radRed.length ? ` (RED: ${radRed.join(', ')})` : ''}`);
      const ps = rows.reduce((n, r) => n + ((ll(r) && ll(r).pseudoChips) || 0), 0);
      // U2d: THE COLLAPSED CARD. U2b's `+N`-starvation report is gone with the card it described.
      const pxOf2 = (v) => { const m = /^(-?[\d.]+)px/.exec(String(v || '')); return m ? Number(m[1]) : NaN; };
      const sum = (f) => rows.reduce((n, r) => n + ((ll(r) && ll(r)[f]) || 0), 0);
      const ctrRed = rows.filter((r) => ll(r) && !ll(r).countersOk).map((r) => r.id);
      const actRed = rows.filter((r) => ll(r) && !ll(r).actionsOk).map((r) => r.id);
      const fitRed = rows.filter((r) => ll(r) && !ll(r).fitOk).map((r) => r.id);
      const rowRed = rows.filter((r) => ll(r) && !ll(r).twoRowsOk).map((r) => r.id);
      const stRed = rows.filter((r) => ll(r) && !ll(r).statesOk).map((r) => r.id);
      const cradRed = rows.filter((r) => { const L = ll(r); return L && L.counterRadius.milestone && L.counterRadius.other && !(pxOf2(L.counterRadius.milestone) === 0 && pxOf2(L.counterRadius.other) > 0); }).map((r) => r.id);
      const wit = rows.flatMap((r) => ((ll(r) && ll(r).twoRowWitnesses) || []).map((x) => `${r.id}/${x}`));
      const busiest = rows.map((r) => ll(r) && ll(r).maxCounterCard).filter(Boolean).sort((a, b) => b.n - a.n)[0];
      const busiestId = busiest ? rows.find((r) => ll(r) && ll(r).maxCounterCard === busiest).id : null;
      console.log(`M1 layers collapsed card: ${sum('counters')} counter(s) on ${sum('counterCards')} card(s), ${sum('actionsFit')} of ${sum('actionsOffered')} action button(s) fitting on ${sum('actionCards')} card(s); counters = the engine's own answer in ${rows.length - ctrRed.length}/${rows.length}${ctrRed.length ? ` (RED: ${ctrRed.join(', ')})` : ''}; button set = unlocked-and-unbought in ${rows.length - actRed.length}/${rows.length}${actRed.length ? ` (RED: ${actRed.join(', ')})` : ''}; row fit ok in ${rows.length - fitRed.length}/${rows.length}${fitRed.length ? ` (RED: ${fitRed.join(', ')})` : ''}; two rows in ${rows.length - rowRed.length}/${rows.length}${rowRed.length ? ` (RED: ${rowRed.join(', ')})` : ''} over ${sum('twoRowsJudged')} judged card(s), ${wit.length} of them DISCRIMINATING (≥2 counters and ≥2 buttons)${wit.length ? `: ${wit.slice(0, 8).join(', ')}${wit.length > 8 ? `, …(${wit.length})` : ''}` : ''}; collapsed ≠ expanded in ${rows.length - stRed.length}/${rows.length}${stRed.length ? ` (RED: ${stRed.join(', ')})` : ''}; milestone counter corners differ in ${rows.length - cradRed.length}/${rows.length}${cradRed.length ? ` (RED: ${cradRed.join(', ')})` : ''}; busiest counter row ${busiest ? `${busiestId}/${busiest.layer} with ${busiest.n}: ${busiest.row.join(' ')}` : '—'}`);
      const fv = (f) => rows.reduce((o, r) => { const v = r[f] && r[f].verdict; if (v) o[v.replace(/\(.*/, '(…)')] = (o[v.replace(/\(.*/, '(…)')] || 0) + 1; return o; }, {});
      const widen = rows.filter((r) => r.fitWidths && r.fitWidths.grew.length).map((r) => `${r.id} ${r.fitWidths.grew.join('/')}`);
      console.log(`M1 layers fit (MEASURED at 390px and at 1280px on the same page and state): card ${rows.filter((r) => r.fitWidths).map((r) => `${r.fitWidths.cardWidth.phone}→${r.fitWidths.cardWidth.desktop}px`)[0] || '—'}; ${JSON.stringify(fv('fitWidths'))}; ${widen.length} game(s) held MORE buttons at 1280${widen.length ? `: ${widen.slice(0, 6).join(', ')}` : ''}; ${rows.filter((r) => r.fitWidths && !r.fitWidths.restored).length} did not come back at 390`);
      console.log(`M1 layers stability (the SET against affordability): ${JSON.stringify(fv('stability'))}; ${rows.filter((r) => r.stability && r.stability.litChanged.length).length} game(s) saw lit/grey move`);
      console.log(`M1 layers throttle (${rows[0] && rows[0].throttle ? rows[0].throttle.throttleMs : '—'} ms): ${JSON.stringify(fv('throttle'))}`);
      const cmNo = rows.filter((r) => r.counterVerdict && r.counterVerdict.startsWith('no candidate')).map((r) => r.id);
      console.log(`M1 layers counter press: ${rows.filter((r) => r.counterVerdict === 'moved').length} moved a counter's x by buying through the card, ${rows.filter((r) => r.counterVerdict === 'NOT MOVED').length} did not, ${cmNo.length} abstained${cmNo.length ? ` (nothing affordable: ${cmNo.slice(0, 8).join(', ')}${cmNo.length > 8 ? `, …(${cmNo.length})` : ''})` : ''}`);
      console.log(`M1 layers shape: tabFormat ${shp.array} array-form, ${shp.object} object/subtab-form, ${shp.none} none (engine default) over ${rows.length} games; ${ms} milestone chip(s), ${dv} divider(s); ${offSrc}/${withChips} card(s) with chips are NOT in source order; ${ps} pseudo-unlocked chip(s)${ps === 0 ? ' — visibility rule 2 is UNEXERCISED at these states (see docs/mobile.md)' : ''}`);
      console.log(`M1 layers discriminators: ${rows.filter((r) => r.chipBaseline).map((r) => `${r.id} ${r.chipBaseline.now} chips vs U2's ${r.chipBaseline.u2} (${r.chipBaseline.fell ? 'FELL' : 'DID NOT FALL'}, ${r.chipBaseline.milestones} of them milestones), ${r.chipBaseline.cardsOffSourceOrder} card(s) off source order (${r.chipBaseline.orderMoved ? 'MOVED' : 'UNMOVED'})`).join('; ') || 'no reference game in this run'}`);
      const vr = (f) => rows.reduce((o, r) => { const v = r.rules && r.rules[f] && r.rules[f].verdict; if (v) o[v] = (o[v] || 0) + 1; return o; }, {});
      console.log(`M1 layers visibility rules (constructed, judged against the probe's own expectation): msDisplay='never' → ${JSON.stringify(vr('ms'))}; pseudoUnl forced true → ${JSON.stringify(vr('pseudo'))}; a clickable given a real amount → ${JSON.stringify(vr('clickable'))}; a buyable given 1e400 → ${JSON.stringify(vr('bigAmount'))}; ${rows.filter((r) => r.rules && r.rules.restored === false).length} game(s) did not restore`);
      const llAbst = rows.filter((r) => r.layersInert && !r.layersInert.stable).map((r) => r.id);
      console.log(`M1 layers inertness: ${rows.filter((r) => r.layersInert && r.layersInert.verdict === 'unchanged').length} unchanged state hash across opening the list, ${rows.filter((r) => r.layersInert && r.layersInert.verdict === 'MOVED').length} moved, ${llAbst.length} abstained${llAbst.length ? ` (the page does not repeat its own hash: ${llAbst.join(', ')})` : ''}`);
      const noCand = rows.filter((r) => r.resetVerdict && r.resetVerdict.startsWith('no candidate')).map((r) => r.id);
      console.log(`M1 layers reset press: ${rows.filter((r) => r.resetVerdict === 'moved').length} moved player[l].points, ${rows.filter((r) => r.resetVerdict === 'NOT MOVED').length} did not, ${noCand.length} abstained${noCand.length ? ` (nothing could reset: ${noCand.join(', ')})` : ''}`);
      for (const r of rows.filter((x) => !x.ok)) console.log(`  ${r.id}: layers=${r.layersOk} fit=${r.fitOk}${r.fitWidths && !r.fitOk ? ' ' + JSON.stringify(r.fitWidths) : ''} stability=${r.stabilityOk}${r.stability && !r.stabilityOk ? ' ' + JSON.stringify(r.stability) : ''} throttle=${r.throttleOk}${r.throttle && !r.throttleOk ? ' ' + JSON.stringify(r.throttle) : ''} counter=${r.counterVerdict}${r.counterMove && r.counterVerdict === 'NOT MOVED' ? ' ' + JSON.stringify(r.counterMove) : ''}${r.chipBaseline && !(r.chipBaseline.fell && r.chipBaseline.orderMoved) ? ` chipBaseline=${JSON.stringify(r.chipBaseline)}` : ''}${r.layers && !r.layersOk ? ' ' + JSON.stringify(r.layers) : ''}${r.resetVerdict && r.resetVerdict !== 'moved' ? ` reset=${r.resetVerdict} ${JSON.stringify(r.reset)}` : ''} inert=${r.inertOk} both=${r.bothOk}${r.both ? ' ' + JSON.stringify(r.both) : ''} navbarOnly=${r.navbarOnlyOk}${r.navbarOnly && !r.navbarOnlyOk ? ' ' + JSON.stringify(r.navbarOnly) : ''} state=${r.stateVerdict}${r.state ? ` (plain ${r.state.plain} / control ${r.state.plainControl} / mobile ${r.state.mobile})` : ''} geometry=${r.geometryOk} nav=${r.navOk} load=${r.loadVerdict && r.loadVerdict.ok}${r.worst && r.worst.length ? ` worst=${JSON.stringify(r.worst)}` : ''}${r.exception ? ` exception=${r.exception}` : ''}`);
    } else {
      if (shard) throw new Error('--shard applies to --gate load / --gate mobile, not to a single-game run');
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
