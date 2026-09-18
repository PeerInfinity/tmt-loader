// Playwright page runner (plan §4). One headless Chromium; every non-localhost request is aborted and counted.
//   node page.mjs <id> --ticks N --diff d [--leg idle|policy] [--until js] [--load-from player.json] [--base URL]
//                 [--state-out f] [--player-out f] [--json out]                                → one JSON line, like run.mjs
//                 [--profile off|all|saved] [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-automation]
//   node page.mjs [<id>...] --gate load [--base URL] [--automation]                    → gate G1 (every game by default)
//   node page.mjs [<id>...] --gate mobile [--base URL]           → gate M1, the mobile mode, the nav bar + the layer list
// Automation (?automation=1): runs default ON (the harness); `--gate load` defaults to the PLAIN page (no flag), where it
// also asserts 0 × #app .smallNode.au, no player.au and no games-auto/ request.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, writeJSON, headCommit, readManifest } from './lib.mjs';
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

/** The deepest recorded snapshot for a game, or null. The fresh save of most games shows ONE tree node and no open
 * tab, so a gate that only ever looks at a fresh page cannot see the layout this mode exists to fix: the split
 * column, the milestone rows and the achievement grid all appear only once a layer tab is open. */
function deepestSnapshot(id) {
  const dir = path.join(REPO, 'tools/harness/snapshots', id);
  const files = ['frontier', 'all', 'pinned'].flatMap((sub) => {
    const d = path.join(dir, sub);
    return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => path.join(d, f)) : [];
  });
  if (!files.length) return null;
  const best = files.map((f) => ({ f, d: JSON.parse(fs.readFileSync(f, 'utf8')) })).sort((a, b) => (a.d.ticks || 0) - (b.d.ticks || 0)).pop();
  return { file: path.relative(REPO, best.f), player: best.d.player, ticks: best.d.ticks };
}

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
  };
}})()`;

async function gateMobile(browser, base, ids) {
  const rows = [];
  for (const id of ids) {
    const row = { gate: 'M1', id, ok: false, views: [] };
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
      await page.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui) ui.close(); });
      const llDesk = nb.layerList;
      // one card per shown layer, in the row the engine names, with distinct chips on each card and the button in
      // the bar to its left — asserted identically at both widths
      // the SET, not the sequence: the list groups by row and sorts by the engine's `position` inside a row, which is
      // deliberately not `LAYERS` declaration order — `misrowed` is what asserts the grouping itself.
      const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
      const listOk = (L) => !!(L && L.present && L.open && L.hasCss && L.hasUI && L.buttonLeftOfTree
        && sameSet(L.cards, L.expect) && L.misrowed.length === 0 && L.dupeChips.length === 0);
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
      row.layersOk = !!(row.layers.phoneOk && row.layers.desktopOk && row.layersInert.ok && row.resetVerdict !== 'NOT MOVED');
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
      console.log(`G1 load: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}${r.allowed ? ` allowed: ${JSON.stringify(r.allowed)}` : ''}`).join(' ')}`);
    } else if (a.gate === 'mobile') {
      const rows = await gateMobile(browser, base, ids);
      if (a.json) writeJSON(a.json, { commit: headCommit(), base, viewport: PHONE, touch: true, tapMin: TAP_MIN, rows });
      code = rows.every((r) => r.ok) ? 0 : 1;
      const abstained = rows.filter((r) => r.state && !r.state.deterministic).map((r) => r.id);
      console.log(`M1 mobile: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}`).join(' ')}`);
      console.log(`M1 state leg: ${rows.filter((r) => r.stateVerdict === 'equal').length} equal, ${rows.filter((r) => r.stateVerdict === 'MOVED').length} moved, ${abstained.length} abstained${abstained.length ? ` (not deterministic on their own: ${abstained.join(', ')})` : ''}`);
      const nbViews = rows.reduce((n, r) => n + ((r.navbarOnly && r.navbarOnly.paired) || 0), 0);
      console.log(`M1 navbar-only leg (${DESKTOP.width}\u00d7${DESKTOP.height}, no touch): ${rows.filter((r) => r.navbarOnlyOk).length}/${rows.length} green over ${nbViews} view(s), each against the same view of the plain desktop page`);
      const cards = rows.reduce((n, r) => n + ((r.layers && r.layers.phone && r.layers.phone.cards.length) || 0), 0);
      const chips = rows.reduce((n, r) => n + ((r.layers && r.layers.phone && r.layers.phone.chips) || 0), 0);
      console.log(`M1 layers leg: ${rows.filter((r) => r.layersOk).length}/${rows.length} green over ${cards} card(s) and ${chips} chip(s), at ${PHONE.width}px with touch and at ${DESKTOP.width}px without`);
      const llAbst = rows.filter((r) => r.layersInert && !r.layersInert.stable).map((r) => r.id);
      console.log(`M1 layers inertness: ${rows.filter((r) => r.layersInert && r.layersInert.verdict === 'unchanged').length} unchanged state hash across opening the list, ${rows.filter((r) => r.layersInert && r.layersInert.verdict === 'MOVED').length} moved, ${llAbst.length} abstained${llAbst.length ? ` (the page does not repeat its own hash: ${llAbst.join(', ')})` : ''}`);
      const noCand = rows.filter((r) => r.resetVerdict && r.resetVerdict.startsWith('no candidate')).map((r) => r.id);
      console.log(`M1 layers reset press: ${rows.filter((r) => r.resetVerdict === 'moved').length} moved player[l].points, ${rows.filter((r) => r.resetVerdict === 'NOT MOVED').length} did not, ${noCand.length} abstained${noCand.length ? ` (nothing could reset: ${noCand.join(', ')})` : ''}`);
      for (const r of rows.filter((x) => !x.ok)) console.log(`  ${r.id}: layers=${r.layersOk}${r.layers && !r.layersOk ? ' ' + JSON.stringify(r.layers) : ''}${r.resetVerdict && r.resetVerdict !== 'moved' ? ` reset=${r.resetVerdict} ${JSON.stringify(r.reset)}` : ''} inert=${r.inertOk} both=${r.bothOk}${r.both ? ' ' + JSON.stringify(r.both) : ''} navbarOnly=${r.navbarOnlyOk}${r.navbarOnly && !r.navbarOnlyOk ? ' ' + JSON.stringify(r.navbarOnly) : ''} state=${r.stateVerdict}${r.state ? ` (plain ${r.state.plain} / control ${r.state.plainControl} / mobile ${r.state.mobile})` : ''} geometry=${r.geometryOk} nav=${r.navOk} load=${r.loadVerdict && r.loadVerdict.ok}${r.worst && r.worst.length ? ` worst=${JSON.stringify(r.worst)}` : ''}${r.exception ? ` exception=${r.exception}` : ''}`);
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
