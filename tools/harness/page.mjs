// Playwright page runner (plan §4). One headless Chromium; every non-localhost request is aborted and counted.
//   node page.mjs <id> --ticks N --diff d [--leg idle|policy] [--until js] [--load-from player.json] [--base URL]
//                 [--state-out f] [--player-out f] [--json out]                                → one JSON line, like run.mjs
//                 [--profile off|all|saved] [--exclude au] [--auto-opt "k=v;k2=v2"] [--no-automation]
//   node page.mjs [<id>...] --gate load [--base URL] [--automation] [--allow-host h]   → gate G1 (every game by default)
//   node page.mjs [<id>...] --gate mobile [--base URL]           → gate M1, the mobile mode, the nav bar + the layer list
//   node page.mjs [<id>...] --gate options [--base URL]          → gate O1, the Options section and the stored preference
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
export async function openContext(browser, { allowExternal = false, allowHosts = [], contextOptions = null } = {}) {
  // `allowHosts`: hosts that count as THIS site for the purposes of the blocker. Empty for every local run — the
  // harness serves from 127.0.0.1 and a request to anywhere else is the finding. The published site is the one case
  // where the site's own origin is not localhost (G5 against https://…github.io/tmt-loader/), and it must still be
  // a third-party request when a GAME reaches for cdn.glitch.com. So the deploy host is named, not blanket-allowed.
  const allowed = new Set([...LOCAL, ...allowHosts]);
  const context = await browser.newContext(contextOptions || undefined);
  const fresh = () => ({ blocked: [], failed: [], pageErrors: [] });
  const stats = { blocked: [], failed: [], pageErrors: [], consoleErrors: [], consoleWarnings: [], requests: 0, urls: [] };
  const perPage = new Map();
  stats.of = (page) => { if (!perPage.has(page)) perPage.set(page, fresh()); return perPage.get(page); };
  const pageOfReq = (req) => { try { return req.frame().page(); } catch { return null; } };
  const push = (req, key, value) => { stats[key].push(value); const p = req && pageOfReq(req); if (p) stats.of(p)[key].push(value); };
  await context.route('**', (route) => {
    const u = new URL(route.request().url());
    if (!allowExternal && (u.protocol === 'http:' || u.protocol === 'https:') && !allowed.has(u.hostname)) { push(route.request(), 'blocked', u.href); return route.abort('blockedbyclient'); }
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

async function gateLoad(browser, base, ids, { automation = false, allowHosts = [] } = {}) {
  const rows = [];
  for (const id of ids) {
    const { context, stats } = await openContext(browser, { allowHosts });
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

/**
 * ⚠ U2c — THE LAYOUT AS THE DIGITS CHANGE, asked the only way that ISOLATES the question. The readouts on a card
 * are the game's numbers, and the number a game shows grows by thousands of orders of magnitude over a save; the
 * question is whether the card's boxes answer to the STRING. So nothing in the game is touched here: the probe
 * writes each magnitude into `.tmt-layerlist-amount` itself and measures, which holds the layer set, the counters,
 * the buttons and the chips exactly still while the only thing that moves is the readout.
 *
 * ⚠ WHY NOT "compare the fresh load against the deep one", which is the obvious reading. MEASURED on `ptr`: the
 * fresh save has 2 cards against the deep save's 11, and of the two only `p` carries an amount (`0` → `3.93e541`)
 * — whose meta column is sized by the resource NAME, 117.41 px, which is wider than either number. So that
 * comparison does not move even on the unfixed build, while the two loads differ in card count, counter rows and
 * button rows for reasons that have nothing to do with digits. It would have been a green that proved nothing.
 * The magnitudes below ARE the two loads' own — `0` is the fresh save's and `9.88e3284` is the deep snapshot's
 * order of magnitude — applied to every card instead of the one that happens to exist at both.
 *
 * `111` against `777` is the tabular-figures half (same length, different glyphs); the rest are the lengths
 * `format()` reaches. The counters are verified the same way and in the same pass, against U2d's reservation
 * rather than a new one: a value that gets SHORTER may not give width back, and one the same length in different
 * glyphs may not change it either.
 */
const DIGITS_PROBE = `(${function () {
  const panel = document.getElementById('tmt-layerlist');
  if (!panel) return { why: 'no panel' };
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; };
  const cards = [].slice.call(panel.querySelectorAll('.tmt-layerlist-card'));
  const shot = () => cards.map((c) => ({
    layer: c.dataset.layer, card: R(c), meta: R(c.querySelector('.tmt-layerlist-meta')),
    name: R(c.querySelector('.tmt-layerlist-name')), amount: R(c.querySelector('.tmt-layerlist-amount')),
    ctr: [].map.call(c.querySelectorAll('.tmt-layerlist-counter'), R),
  }));
  const amounts = [].slice.call(panel.querySelectorAll('.tmt-layerlist-amount'));
  const ctrs = [].slice.call(panel.querySelectorAll('.tmt-layerlist-counter-value'));
  const wasAmt = amounts.map((e) => e.textContent), wasCtr = ctrs.map((e) => e.textContent);
  const STRINGS = ['0', '111', '777', '11,111', '1.11e10', '9.88e3284', '1.111e3,284'];
  const MOVE = 0.5;   // a sub-pixel is layout noise; the unfixed build moves these boxes by 3 to 102 px
  const cmp = (a, b, keys, label, into) => {
    b.forEach((c, i) => {
      const q = a[i];
      if (!q || q.layer !== c.layer) return;
      const box = (u, v, what) => { if (!u || !v) return; for (let f = 0; f < 4; f++) if (Math.abs(u[f] - v[f]) > MOVE) { into.push(`${c.layer}.${what}[${'xywh'[f]}] ${u[f]}→${v[f]} ${label}`); return; } };
      keys.forEach((k) => {
        // `ctr` is a LIST of boxes (one per counter on that card); every other key is one box
        if (k === 'ctr') (c.ctr || []).forEach((r, j) => box((q.ctr || [])[j], r, `ctr#${j}`));
        else box(q[k], c[k], k);
      });
    });
  };
  // 1. the amount readout, over every magnitude it reaches
  amounts.forEach((e) => { e.textContent = STRINGS[0]; });
  const base = shot(), moved = [];
  for (let i = 1; i < STRINGS.length; i++) {
    amounts.forEach((e) => { e.textContent = STRINGS[i]; });
    cmp(base, shot(), ['card', 'meta', 'name', 'amount'], `at "${STRINGS[i]}"`, moved);
  }
  amounts.forEach((e, i) => { e.textContent = wasAmt[i]; });
  // 2. U2d's counter reservation, VERIFIED: shorter, and the same length in wider glyphs
  const cBase = shot(), counterMoved = [];
  [['short', () => '1'], ['glyphs', (t) => t.replace(/[0-9]/g, '7')]].forEach(([label, f]) => {
    ctrs.forEach((e, i) => { e.textContent = f(wasCtr[i]); });
    cmp(cBase, shot(), ['ctr'], `(${label})`, counterMoved);
  });
  ctrs.forEach((e, i) => { e.textContent = wasCtr[i]; });
  const restored = amounts.every((e, i) => e.textContent === wasAmt[i]) && ctrs.every((e, i) => e.textContent === wasCtr[i]);
  return { cards: cards.length, amounts: amounts.length, counters: ctrs.length, magnitudes: STRINGS.length,
    moved: moved.length, sample: moved.slice(0, 4), counterMoved: counterMoved.length, counterSample: counterMoved.slice(0, 4), restored };
}})()`;

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

  // ---- U5: THE COLOUR A CHIP SHOULD WEAR, rebuilt here out of the engine -----------------------------------
  // ⚠ A THIRD independent rebuild, for the same reason as the sequence and the counters above: a colour compared
  // against the list's own `chipSkin` would assert nothing at all. This one asks the GAME's stylesheet through a
  // probe element of its own, and reads `player` / `tmp` itself to decide which of the engine's three words the
  // component is in.
  // ⚠ `visibility: hidden` and off-screen, NEVER `display: none`: a display-none element has no used value, so a
  // rule keyed on rendering would drop silently out of the answer — this instrument's own version of U4's
  // suppression trigger, checked rather than assumed.
  // ⛔ `locked` is the ENGINE's word and means CANNOT AFFORD. A build that wired red to "not drawn" instead must
  // RED here, which is what the constructed three-state leg below is for.
  const NOBG = 'rgba(0, 0, 0, 0)';
  const bgCache = Object.create(null);
  const measure = (fn) => {
    try {
      const e = document.createElement('span');
      e.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;visibility:hidden';
      fn(e);
      document.body.appendChild(e);
      const v = String(getComputedStyle(e).backgroundColor || '');
      document.body.removeChild(e);
      return v || NOBG;
    } catch (err) { return NOBG; }
  };
  const bgOf = (cls) => {
    if (cls in bgCache) return bgCache[cls];
    return (bgCache[cls] = measure((e) => { e.className = cls; }));
  };
  const bgOfValue = (css) => (css ? measure((e) => { e.style.backgroundColor = css; }) : NOBG);
  const canAfford = (kind, l, id) => {
    if (kind === 'upgrades') return S(() => typeof canAffordUpgrade === 'function' ? !!canAffordUpgrade(l, Number(id)) : true, true);
    if (kind === 'buyables') return S(() => !!tmp[l].buyables[id].canAfford, true);
    return true;                                     // starting a challenge costs nothing in either engine
  };
  const skinExpect = (kind, l, id) => {
    const unl = S(() => { const u = tmp[l][kind][id].unlocked; return u === undefined ? true : !!u; }, true);
    if (kind === 'upgrades' && !unl) {               // the engines' SECOND upgrade button, `{pseudo, plocked|can}`
      const pc = S(() => !!tmp[l].upgrades[id].pseudoCan, false);
      return { key: 'pseudo', bg: bgOf(`${l} upg pseudo ${pc ? 'can' : 'plocked'}`) };
    }
    if (earned(kind, l, id)) return { key: 'bought', bg: kind === 'upgrades' ? bgOf(`${l} upg bought`)
      : kind === 'challenges' ? bgOf('hChallenge done') : kind === 'milestones' ? bgOf('milestoneDone') : NOBG };
    // a MILESTONE is passive — there is nothing to afford, and the engines paint an unearned one the same red as
    // `.locked` on its own tab (`.milestone`)
    if (kind === 'milestones') return { key: 'locked', bg: bgOf('milestone') };
    if (canAfford(kind, l, id)) return { key: 'can', bg: bgOfValue(S(() => String(tmp[l].color), '')) };
    return { key: 'locked', bg: kind === 'upgrades' ? bgOf(`${l} upg locked`) : kind === 'buyables' ? bgOf('buyable locked') : NOBG };
  };
  const SKINMARK = { bought: 'b', can: 'c', locked: 'l', pseudo: 'p' };

  // ---- U6: THE COUNTER'S OWN COLOUR, rebuilt here out of the engine ----------------------------------------
  // ⚖ "match what the main view already says" (user, 2026-09-19): milestones and achievements GREEN when all are
  // earned and RED whenever one is not, never the layer colour; challenges the same by analogy; upgrades GREEN when
  // all are bought, RED when none of the unbought is affordable, the LAYER's colour otherwise; buyables and
  // clickables never green, RED when nothing in the category can be bought / clicked right now, the layer's colour
  // otherwise. Written a THIRD time here for the same reason the sequence and the counters' text are: a colour
  // compared against the list's own `counterSkin` would assert nothing at all.
  // ⚠ The category's OWN class, with the family's bare `bought` / `locked` as the fallback — the same order the
  // list resolves in, and the reason it is not "read `.bought` everywhere": a milestone counter must match the
  // milestone boxes it counts on a game whose `.milestoneDone` is not its `.bought`.
  const CTR_DONE = { upgrades: (l) => `${l} upg bought`, challenges: () => 'hChallenge done',
    milestones: () => 'milestoneDone', achievements: (l) => `${l} achievement bought` };
  const CTR_NO = { upgrades: (l) => `${l} upg locked`, buyables: () => 'buyable locked', clickables: () => 'upg locked',
    challenges: () => 'locked', milestones: () => 'milestone', achievements: (l) => `${l} achievement locked` };
  const CTR_LAYER = { upgrades: 1, buyables: 1, clickables: 1 };   // the three that can say "there is something to do"
  const bgOrBare = (cls, bare) => { const v = bgOf(cls); return v && v !== NOBG ? v : bgOf(bare); };
  const belowLim = (l, id) => {
    const lim = S(() => tmp[l].buyables[id].purchaseLimit, undefined);
    if (lim === undefined || lim === null) return true;
    const amt = S(() => typeof getBuyableAmount === 'function' ? getBuyableAmount(l, Number(id)) : player[l].buyables[id], null);
    if (amt === null) return true;
    return S(() => typeof amt.gte === 'function' ? !amt.gte(lim) : !(Number(amt) >= Number(lim.toNumber ? lim.toNumber() : lim)), true);
  };
  // "is there anything to DO in this category right now", per component and on the engine's own terms
  const ctrAvail = (kind, l, id) => {
    if (kind === 'upgrades') return !earned('upgrades', l, id)
      && S(() => { const u = tmp[l].upgrades[id].unlocked; return u === undefined ? true : !!u; }, true)   // a pseudo teaser is not "available"
      && canAfford('upgrades', l, id);
    if (kind === 'buyables') return belowLim(l, id) && canAfford('buyables', l, id);
    if (kind === 'clickables') return S(() => !!tmp[l].clickables[id].canClick, false);
    return false;
  };
  const ctrSkinExpect = (l) => {
    const order = [], by = Object.create(null);
    for (const k of seqDrawn(l)) {
      const [ll, kind, id] = k.split('/');
      if (!by[kind]) { by[kind] = { kind, x: 0, y: 0, any: false, avail: false }; order.push(kind); }
      const g = by[kind];
      if (!g.avail) g.avail = ctrAvail(kind, ll, id);
      if (RATIO[kind]) { g.y++; g.any = true; if (earned(kind, ll, id)) g.x++; continue; }
      let amt = null;
      if (kind === 'buyables') { const b = S(() => typeof getBuyableAmount === 'function' ? getBuyableAmount(ll, Number(id)) : player[ll].buyables[id], null); amt = isAmt(b) ? b : null; }
      else { const c = S(() => player[ll].clickables[id], null); amt = (isAmt(c) && posAmt(c)) ? c : null; }
      if (amt !== null) g.any = true;
    }
    return order.map((k) => by[k]).filter((g) => RATIO[g.kind] ? g.y > 0 : g.any).map((g) => {
      if (RATIO[g.kind] && g.y > 0 && g.x >= g.y) return { kind: g.kind, key: 'bought', bg: bgOrBare(CTR_DONE[g.kind](l), 'bought') };
      if (CTR_LAYER[g.kind] && g.avail) return { kind: g.kind, key: 'can', bg: bgOfValue(S(() => String(tmp[l].color), '')) };
      return { kind: g.kind, key: 'locked', bg: bgOrBare(CTR_NO[g.kind](l), 'locked') };
    });
  };

  // ---- U7: THE RESET LINE, THE OTHER RESOURCES AND THE PER-CATEGORY PROGRESS, all rebuilt HERE ------------
  // ⚠ A FOURTH independent rebuild, for the reason the other three carry: a card compared against the list's own
  // `resetLines` / `resourcesOf` / `progressOf` would assert nothing at all. What this probe does NOT re-implement
  // is the layer's DISPLAY TEXT — that is one walk of the game's own declarations and there is one right answer to
  // it — but the CLASSIFICATION over that text is written out again here, which is the half the filter mutant has
  // to get past.
  const nf = (field, decl, t) => {                      // `numFieldOf`: tmp first unless it is still the function
    const v = S(() => (t ? t[field] : undefined), undefined);
    if (v !== undefined && v !== null && typeof v !== 'function') return v;
    return S(() => { const x = decl[field]; return typeof x === 'function' ? x.call(decl) : x; }, undefined);
  };
  const F = (v, whole) => S(() => (whole && typeof formatWhole === 'function' ? String(formatWhole(v))
    : typeof format === 'function' ? String(format(v)) : String(v)), '');

  // --- item 1: the engine's own prestige string, split the way the card must split it
  const engineReset = (l) => {
    let t = S(() => tmp[l].prestigeButtonText, undefined);
    if (typeof t !== 'string' || !t) t = S(() => (typeof prestigeButtonText === 'function' ? String(prestigeButtonText(l)) : ''), '');
    return t || 'Reset';
  };
  const splitReset = (x) => {
    const m = /(?:<br\s*\/?>\s*)+/i.exec(x);
    return m ? [x.slice(0, m.index), x.slice(m.index + m[0].length).replace(/<br\s*\/?>/gi, ' ')] : [x, ''];
  };
  const flat = (x) => String(x == null ? '' : x).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // --- item 2: which keys in `player[l]` are the LAYER's, and which of those the layer's own text states
  const ENGINE_KEYS = { points: 1, best: 1, total: 1, unlocked: 1, resetTime: 1, forceTooltip: 1, noRespecConfirm: 1,
    buyables: 1, clickables: 1, spentOnBuyables: 1, upgrades: 1, milestones: 1, lastMilestone: 1, primeMiles: 1,
    achievements: 1, challenges: 1, grid: 1, prevTab: 1, activeChallenge: 1, subtabs: 1, infoboxes: 1 };
  const isDec = (v) => S(() => !!v && typeof v === 'object' && typeof v.toNumber === 'function', false);
  const candKeys = (l) => {
    const pl = S(() => player[l], null);
    if (!pl || typeof pl !== 'object') return [];
    const out = [];
    for (const k in pl) { if (ENGINE_KEYS[k]) continue; if (isDec(S(() => pl[k], null))) out.push(k); }
    return out;
  };
  // the boundary rule, written out again: a formatted `0` is inside every `10`, `100` and `1.00e5` on the tab
  const countNumber = (text, sub) => {
    if (!sub) return 0;
    let n = 0;
    for (let i = text.indexOf(sub); i >= 0; i = text.indexOf(sub, i + 1)) {
      if (i > 0 && /[0-9.,]/.test(text.charAt(i - 1))) continue;
      const a = text.charAt(i + sub.length);
      if (a && /[0-9.,eE]/.test(a)) continue;
      n++;
    }
    return n;
  };
  const atNumber = (text, sub) => countNumber(text, sub) > 0;
  // ⛔ THE OCCURRENCE BUDGET, rebuilt: each statement of a number is claimed by ONE key, the engine's own amounts
  // claim before any candidate, and a candidate that finds nothing left is not a resource. A bare membership test
  // reported 23 of them on `the-infinity-tree` at a fresh save where every amount is `0.00`.
  const ENGINE_AMOUNTS = ['points', 'best', 'total', 'spentOnBuyables'];
  const takeOcc = (text, budget, v) => {
    const forms = [F(v, false), F(v, true)];
    for (let i = 0; i < forms.length; i++) {
      const f = forms[i];
      if (!f || (i === 1 && f === forms[0])) continue;
      if (budget[f] === undefined) budget[f] = countNumber(text, f);
      if (budget[f] > 0) { budget[f]--; return f; }
    }
    return null;
  };
  // (U8) THE REMEMBERED SET, read straight out of the game's own namespace rather than asked of the list — which
  // is also what asserts WHERE it lives: a build that kept this in `player` would come back empty here, and leg M
  // (a full render writes nothing) would redden as well.
  const MEM_KEY = 'ui.layerlist.resources';
  const memRaw = () => S(() => { const st = window.tmtLoader.storage;
    return { key: st.prefix + MEM_KEY, value: st.raw.getItem.call(localStorage, st.prefix + MEM_KEY) }; }, { key: null, value: null });
  const memOf = (l) => S(() => { const o = JSON.parse(memRaw().value || '{}');
    return Array.isArray(o[l]) ? o[l] : []; }, []);
  /** The resources the card SHOULD show, and the string each should print, in `player[l]`'s own key order.
   *  ⚠ (U8) TWO WAYS ONTO THE ROW, and the string is OURS either way: a key whose value the layer's text still
   *  states, and a key the store REMEMBERS from a state where it did. A text this pass could not read claims
   *  nothing and leaves the remembered rows standing, which is the post-reset case. */
  const resExpect = (l, text) => {
    const pl = S(() => player[l], null);
    if (!pl || typeof pl !== 'object') return [];
    const budget = Object.create(null);
    if (text) for (const k of ENGINE_AMOUNTS) { const v = S(() => pl[k], null); if (isDec(v)) takeOcc(text, budget, v); }
    const claim = Object.create(null), byText = Object.create(null);
    if (text) for (const k of candKeys(l)) {
      const t = takeOcc(text, budget, S(() => pl[k], null));
      if (t === null) continue;
      claim[k] = t; byText[t] = (byText[t] || 0) + 1;
    }
    const mem = memOf(l), out = [];
    for (const k of candKeys(l)) {
      const has = claim[k] !== undefined;
      if (!has && mem.indexOf(k) < 0) continue;
      out.push({ key: k, text: F(S(() => pl[k], null), false), claimed: has ? claim[k] : null,
        collide: has && byText[claim[k]] > 1, sticky: !has });
    }
    return out;
  };
  /** What the words AFTER the number say — the prose label the list deliberately does not ship. Reported so the
   *  user can rule on it with a sample in front of them, never rendered. */
  const liftLabel = (text, sub) => {
    const i = text.indexOf(sub);
    if (i < 0) return '';
    const after = text.slice(i + sub.length, i + sub.length + 60).replace(/^[\s:,]+/, '');
    const m = /^[A-Za-z][A-Za-z ']{0,34}/.exec(after);
    return m ? m[0].trim().replace(/\s+(which|that|per|and|is|are|to|of|in|for|it|you|boosts?|gives?)\b.*$/i, '').trim() : '';
  };

  // --- item 3: the numeric target per category, the unearned set, and the cheapest-or-first pick
  const PTARGET = { upgrades: { num: 'cost', whole: true, currency: 'resource', multi: 'multiRes' },
    buyables: { num: 'cost', whole: true, currency: 'resource', multi: 'multiRes' },
    challenges: { num: 'goal', whole: false, currency: 'points' } };
  const curKey = (l, kind, decl, t, locs) => {
    const name = nf('currencyInternalName', decl, t);
    if (!name) return kind === 'challenges' ? '@points' : `@${l}.points`;
    const loc = nf('currencyLocation', decl, t);
    if (loc) { let i = locs.indexOf(loc); if (i < 0) { i = locs.length; locs.push(loc); } return `${name}@loc${i}`; }
    const lr = nf('currencyLayer', decl, t);
    return `${name}${lr ? '@' + lr : '@player'}`;
  };
  const curAmt = (l, kind, decl, t) => {
    const name = nf('currencyInternalName', decl, t);
    if (name) {
      const loc = nf('currencyLocation', decl, t);
      if (loc) return S(() => loc[name], null);
      const lr = nf('currencyLayer', decl, t);
      if (lr) return S(() => player[lr][name], null);
      return S(() => player[name], null);
    }
    // ⚠ a CHALLENGE's default is the GLOBAL `player.points` (`canCompleteChallenge`), an upgrade's and a
    // buyable's is `player[layer].points` (`canAffordPurchase`). The two engine functions disagree and both are
    // right about their own category.
    return kind === 'challenges' ? S(() => player.points, null) : S(() => player[l].points, null);
  };
  const ltD = (a, b) => S(() => (typeof a.lt === 'function' ? !!a.lt(b) : Number(a) < Number(b)), false);
  const gteD = (a, b) => S(() => (typeof a.gte === 'function' ? !!a.gte(b) : Number(a) >= Number(b)), false);
  const engAfford = (kind, l, id) => {
    if (kind === 'upgrades') return S(() => (typeof canAffordUpgrade === 'function' ? !!canAffordUpgrade(l, Number(id)) : null), null);
    if (kind === 'buyables') return S(() => { const c = tmp[l].buyables[id].canAfford; return c === undefined ? null : !!c; }, null);
    return null;
  };
  const unearnedP = (kind, l, id) => {
    if (kind === 'upgrades') return S(() => { const u = tmp[l].upgrades[id].unlocked; return u === undefined ? true : !!u; }, true) && !earned('upgrades', l, id);
    if (kind === 'challenges') return !earned('challenges', l, id);
    if (kind === 'buyables') return belowLim(l, id);
    return false;
  };
  const progExpect = (l) => {
    const order = [], by = Object.create(null);
    for (const k of seqDrawn(l)) {
      const [ll, kind, id] = k.split('/');
      const part = PTARGET[kind];
      if (!part) continue;
      if (!by[kind]) { by[kind] = { kind, cand: [], locs: [], skipped: 0 }; order.push(kind); }
      const g = by[kind];
      if (!unearnedP(kind, ll, id)) continue;
      const decl = S(() => layers[ll][kind][id], null), t = S(() => tmp[ll][kind][id], null);
      const v = nf(part.num, decl, t);
      if (!isAmt(v)) { if (part.multi && nf(part.multi, decl, t)) g.skipped++; continue; }
      g.cand.push({ layer: ll, kind, id, decl, t, target: v, cur: curKey(ll, kind, decl, t, g.locs) });
    }
    const rows = [];
    for (const k of order) {
      const g = by[k];
      if (!g.cand.length) continue;
      const same = g.cand.every((c) => c.cur === g.cand[0].cur);
      let one = g.cand[0];
      if (same) for (const c of g.cand) if (ltD(c.target, one.target)) one = c;
      const part = PTARGET[k];
      const amt = curAmt(one.layer, one.kind, one.decl, one.t);
      if (engAfford(one.kind, one.layer, one.id) === true && isAmt(amt) && !gteD(amt, one.target)) continue;  // the wrong-currency guard
      rows.push({ kind: k, layer: one.layer, id: one.id, candidates: g.cand.length,
        how: g.cand.length === 1 ? 'only' : same ? 'cheapest' : 'first',
        have: isAmt(amt) ? F(amt, part.whole) : '', need: F(one.target, part.whole),
        first: `${g.cand[0].layer}/${g.cand[0].kind}/${g.cand[0].id}` });
    }
    return rows;
  };

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
    // ---- U5: what each chip is PAINTED, against the expectation rebuilt above. Read while the card is EXPANDED,
    // which is the state the chip row is rendered in — the same reason the divider marks are read here.
    const chipEls = box ? [...box.querySelectorAll('.tmt-layerlist-chip')] : [];
    const skins = chipEls.map((e) => {
      const kind = e.dataset.kind, ll = e.dataset.layer || l, id = e.dataset.cid;
      const w = skinExpect(kind, ll, id);
      return { key: `${ll}/${kind}/${id}`, wantKey: w.key, gotKey: e.dataset.skin || '',
        want: w.bg, got: String(getComputedStyle(e).backgroundColor || '') };
    });
    if (!was) c.classList.remove('tmt-layerlist-expanded');
    const got = box ? [...box.querySelectorAll('.tmt-layerlist-chip')].map(chipKey) : [];
    const skinBad = skins.filter((x) => x.got !== x.want || x.gotKey !== x.wantKey);
    // the vector the no-hop leg watches for a FLIP, and the ROW ORDER it asserts held byte-for-byte while it did.
    // ⚠ THE DIVIDERS ARE IN IT. A chip-only order string misses a build that moves the chips relative to the
    // dividers between the categories — MEASURED: the reordering mutant appended every chip to the end of the box,
    // which put them all after the dividers, and the chip-only string did not move at all (on that card the
    // affordable chips already led the row). The row a finger sees is the box's children, so that is what is held.
    const rowOrder = [...(box ? box.children : [])]
      .map((e) => (e.classList.contains('tmt-layerlist-divider') ? '|' : chipKey(e))).join(' ');
    const skinVec = skins.map((x) => SKINMARK[x.gotKey] || '?').join('');
    const skinSet = [...new Set(skins.map((x) => x.wantKey))];
    const divBad = [...divProblems(collapsed).map((x) => `collapsed: ${x}`), ...divProblems(expanded).map((x) => `expanded: ${x}`)];
    const src = sourceOrder(l);
    // ---- U2d: row one, the counters -------------------------------------------------------------------------
    const ctrEls = [...c.querySelectorAll('.tmt-layerlist-counter')];
    const counters = ctrEls.map((e) => `${e.dataset.kind}:${e.querySelector('.tmt-layerlist-counter-value').textContent}`);
    const wantCounters = ctrExpect(l);
    // ---- U6: and what each counter is PAINTED, against the third rebuild above -------------------------------
    const wantCtrSkin = ctrSkinExpect(l);
    const ctrSkins = ctrEls.map((e, i) => { const w = wantCtrSkin[i] || { kind: '?', key: '', bg: '' };
      return { kind: e.dataset.kind, wantKind: w.kind, wantKey: w.key, gotKey: e.dataset.skin || '',
        want: w.bg, got: String(getComputedStyle(e).backgroundColor || '') }; });
    const ctrSkinBad = ctrSkins.filter((x) => x.kind !== x.wantKind || x.got !== x.want || x.gotKey !== x.wantKey);
    // ---- row two, the buttons. `all` is what the list decided to offer; `vis` is what the row HELD. ----------
    const actEls = [...c.querySelectorAll('.tmt-layerlist-act')];
    const acts = actEls.map((e) => `${e.dataset.layer}/${e.dataset.kind}/${e.dataset.cid}`);
    const wantActs = actExpect(l);
    // ---- U6: an ACTION BUTTON WEARS ITS CHIP'S SKIN. Against `skinExpect`, the SAME rebuild the chips are judged
    // by — which is the whole claim: the two controls stand for one component and must say the same thing.
    // ⚠ `data-afford` is asserted separately (`lit` below) and is NOT this: lit/grey is "can I press it now".
    const actSkins = actEls.map((e) => { const kind = e.dataset.kind, ll = e.dataset.layer || l, id = e.dataset.cid;
      const w = skinExpect(kind, ll, id);
      return { key: `${ll}/${kind}/${id}`, wantKey: w.key, gotKey: e.dataset.skin || '',
        want: w.bg, got: String(getComputedStyle(e).backgroundColor || '') }; });
    const actSkinBad = actSkins.filter((x) => x.got !== x.want || x.gotKey !== x.wantKey);
    // ---- U7 item 1: TWO LINE BOXES, ALWAYS ------------------------------------------------------------------
    // ⚠ Read while the card is in whatever state it was in: the reset button is in BOTH. The claim has two halves
    // and they need different evidence — the SPLIT (line one is the text before the engine's first run of `<br>`s,
    // line two is the rest) and the RESERVATION (line two occupies a whole line box even when it is empty, which
    // is the `normal` prestige string's own case once `resetGain` passes 100).
    const resetBtn = c.querySelector('.tmt-layerlist-reset');
    const resetEls = resetBtn ? [...resetBtn.querySelectorAll('.tmt-layerlist-resetline')] : [];
    const wantSplit = resetBtn ? splitReset(engineReset(l)) : null;
    const resetLH = resetBtn ? (parseFloat(getComputedStyle(resetBtn).lineHeight) || 0) : 0;
    const reset = !resetBtn ? null : {
      lines: resetEls.length,
      l1: resetEls[0] ? flat(resetEls[0].innerHTML) : null,
      l2: resetEls[1] ? flat(resetEls[1].innerHTML) : null,
      want1: flat(wantSplit[0]), want2: flat(wantSplit[1]),
      emptyL2: !flat(wantSplit[1]),
      lineHeight: +resetLH.toFixed(2),
      h1: resetEls[0] ? +resetEls[0].getBoundingClientRect().height.toFixed(2) : null,
      h2: resetEls[1] ? +resetEls[1].getBoundingClientRect().height.toFixed(2) : null,
      h: +resetBtn.getBoundingClientRect().height.toFixed(2),
      type: S(() => String(tmp[l].type), ''),
    };
    // ⛔ the RESERVATION is what the "make the two-line height conditional on line two being non-empty" mutant
    // breaks, and it breaks it ONLY on a card whose line two is empty — which is why `emptyL2` is reported.
    const resetOk = !reset || (reset.lines === 2 && reset.l1 === reset.want1 && reset.l2 === reset.want2
      && reset.lineHeight > 0 && reset.h1 >= reset.lineHeight - 1 && reset.h2 >= reset.lineHeight - 1);
    // ---- U7 item 2: the other resources ---------------------------------------------------------------------
    const resEls = [...c.querySelectorAll('.tmt-layerlist-resource')];
    const gotRes = resEls.map((e) => ({ key: e.dataset.key, text: e.querySelector('.tmt-layerlist-resource-value').textContent,
      sticky: e.dataset.sticky === 'yes' }));
    const text = S(() => String(window.tmtLoader.layerListUI.resourceText(l)), '');
    const cands = candKeys(l);
    // every rendered resource must be a CANDIDATE, must PRINT ITS OWN CURRENT VALUE, and must have got onto the
    // card one of the two admitted ways — its value stated in the layer's own text right now, or the store
    // remembering it from a state where it was. And no candidate that qualifies either way may be missing. Both
    // directions, so neither a filter that admits everything nor one that admits nothing can pass.
    // ⚠ (U8) THE VALUE CHECK IS THE ONE A REMEMBERED ROW NEEDS. A sticky row is not attributed to anything in the
    // prose, so "is this string in the text" cannot judge it; what must hold is that the row states what
    // `player[l][key]` holds NOW. A build that froze the last attributed STRING would pass every other check here.
    const resBad = [];
    for (const r of gotRes) {
      if (cands.indexOf(r.key) < 0) { resBad.push(`${r.key}: not a candidate (engine key or not a Decimal)`); continue; }
      const v = S(() => player[l][r.key], null);
      const own = F(v, false);
      if (r.text !== own) resBad.push(`${r.key}: prints "${r.text}", not this key's own value "${own}"`);
      if (!r.sticky && !atNumber(text, own) && !atNumber(text, F(v, true))) resBad.push(`${r.key}: rendered as ATTRIBUTED, but "${own}" is not stated in this layer's own text`);
      if (r.sticky && memOf(l).indexOf(r.key) < 0) resBad.push(`${r.key}: rendered as REMEMBERED, but the store does not name it`);
    }
    // ⚠ BOTH DIRECTIONS, against the budget rebuilt above: neither a filter that admits everything nor one that
    // admits nothing can pass, and neither can one that keeps a candidate whose occurrence an engine readout or
    // an earlier key had already claimed.
    const wantRes = resExpect(l, text);
    if (gotRes.length !== wantRes.length) resBad.push(`${gotRes.length} rendered, expected ${wantRes.length} (${wantRes.map((x) => x.key).join(',') || 'none'})`);
    wantRes.forEach((w, i) => {
      const g = gotRes[i];
      if (!g) return;
      if (g.key !== w.key) resBad.push(`${i}: ${g.key} != ${w.key}`);
      else if (g.text !== w.text) resBad.push(`${w.key}: "${g.text}" != "${w.text}"`);
      else if (g.sticky !== w.sticky) resBad.push(`${w.key}: rendered sticky=${g.sticky}, expected ${w.sticky}`);
    });
    // ⚖ (U8) decision 1's COST, counted rather than argued: the attributed rows whose own formatting differs from
    // the occurrence they claimed out of the layer's prose. `format` and `formatWhole` agree at 0, above 1,000 and
    // below 0.95, so this is the one band where the row now disagrees with the words next to it.
    const resRestated = wantRes.filter((w) => w.claimed !== null && w.claimed !== w.text)
      .map((w) => `${l}.${w.key}: "${w.claimed}" → "${w.text}"`);
    const lift = gotRes.map((r) => ({ key: r.key, label: liftLabel(text, r.text) })).filter((x) => x.label);
    const resCollide = gotRes.filter((r) => gotRes.filter((q) => q.text === r.text).length > 1).length;
    // ---- U7 item 3: the per-category progress rows -----------------------------------------------------------
    const wasX = c.classList.contains('tmt-layerlist-expanded');
    c.classList.add('tmt-layerlist-expanded');
    const progEls = [...c.querySelectorAll('.tmt-layerlist-prog')];
    const gotProg = progEls.map((e) => ({ kind: e.dataset.kind, layer: e.dataset.layer, id: e.dataset.cid,
      how: e.dataset.how, name: e.querySelector('.tmt-layerlist-prog-name').textContent,
      text: e.querySelector('.tmt-layerlist-prog-value').textContent,
      onScreen: e.getClientRects().length > 0,
      h: +e.getBoundingClientRect().height.toFixed(2) }));
    if (!wasX) c.classList.remove('tmt-layerlist-expanded');
    const wantProg = progExpect(l);
    const progBad = [];
    if (gotProg.length !== wantProg.length) progBad.push(`${gotProg.length} rows, expected ${wantProg.length}`);
    wantProg.forEach((w, i) => {
      const g = gotProg[i];
      if (!g) return;
      if (g.kind !== w.kind || g.layer !== w.layer || String(g.id) !== String(w.id)) progBad.push(`${i}: ${g.kind}/${g.layer}/${g.id} != ${w.kind}/${w.layer}/${w.id}`);
      else if (g.how !== w.how) progBad.push(`${i}: how ${g.how} != ${w.how}`);
      else if (g.text.indexOf(`${w.have} / ${w.need}`) !== 0) progBad.push(`${i}: "${g.text}" does not open with "${w.have} / ${w.need}"`);
    });
    // ⛔ the DISCRIMINATOR for "cheapest replaced by first-listed": a category where the two rules pick DIFFERENT
    // components. Counted, so a run whose sample has none says so rather than counting a vacuous pass.
    const cheapestWitness = wantProg.filter((w) => w.how === 'cheapest' && w.first !== `${w.layer}/${w.kind}/${w.id}`).length;
    const progDropped = S(() => window.tmtLoader.layerListUI.progress(l).dropped.map((d) => `${l}/${d.kind}:${d.why}${d.n ? '\u00d7' + d.n : ''}`), []);

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
      // --- U5 ---
      skins, skinBad, skinVec, skinSet, rowOrder, skinOk: skinBad.length === 0,
      // --- U6: the collapsed card's two rows carry colour too ---
      ctrSkins, ctrSkinBad, ctrSkinOk: ctrSkinBad.length === 0,
      ctrSkinSet: [...new Set(ctrSkins.map((x) => x.wantKey))],
      actSkins, actSkinBad, actSkinOk: actSkinBad.length === 0,
      actSkinSet: [...new Set(actSkins.map((x) => x.wantKey))],
      // ⚠ THE DISCRIMINATOR: a card showing ALL THREE of the engine's states at once. A two-state check
      // (bought / not) passes on a build that never renders red, which is what the build before U5 was.
      threeStates: skinSet.filter((k) => k !== 'pseudo').length >= 3,
      // --- U7 ---
      reset, resetOk,
      resources: gotRes, wantRes, resBad, resCands: cands.length, resLift: lift, resCollide,
      resSticky: gotRes.filter((r) => r.sticky).length, resMem: memOf(l), resRestated,
      prog: gotProg, wantProg, progBad, progOk: progBad.length === 0, cheapestWitness, progDropped,
      progHow: wantProg.map((w) => w.how),
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
    // --- U5: THE CHIP WEARS THE GAME'S OWN COLOURS ---------------------------------------------------------
    // every chip's computed background against the expectation rebuilt in this probe, and the engine's own word
    // for the state against the `data-skin` the list wrote
    skinOk: perCard.every((x) => x.skinOk),
    skinBad: perCard.filter((x) => !x.skinOk).slice(0, 3).map((x) => ({ layer: x.layer, bad: x.skinBad.slice(0, 3) })),
    skinCounts: perCard.reduce((o, x) => { x.skins.forEach((y) => { o[y.wantKey] = (o[y.wantKey] || 0) + 1; }); return o; }, {}),
    // --- U6: the action buttons and the counters, judged the same way -------------------------------------
    actSkinOk: perCard.every((x) => x.actSkinOk),
    actSkinBad: perCard.filter((x) => !x.actSkinOk).slice(0, 3).map((x) => ({ layer: x.layer, bad: x.actSkinBad.slice(0, 3) })),
    actSkinCounts: perCard.reduce((o, x) => { x.actSkins.forEach((y) => { o[y.wantKey] = (o[y.wantKey] || 0) + 1; }); return o; }, {}),
    // --- U7: the reset line, the other resources, the per-category progress ------------------------------
    // the SPLIT and the RESERVATION, per card. `resetEmptyL2` names the cards whose second half the ENGINE did not
    // emit — the `normal` type past `resetGain` 100 — which are the only cards a conditional reservation breaks.
    resetOk: perCard.every((x) => x.resetOk),
    resetBad: perCard.filter((x) => !x.resetOk).slice(0, 3).map((x) => ({ layer: x.layer, reset: x.reset })),
    resetCards: perCard.filter((x) => x.reset).length,
    resetEmptyL2: perCard.filter((x) => x.reset && x.reset.emptyL2).map((x) => `${x.layer}:${x.reset.type}`),
    resetTypes: perCard.reduce((o, x) => { if (x.reset) o[x.reset.type] = (o[x.reset.type] || 0) + 1; return o; }, {}),
    // the detector's own yield, and both directions of its filter
    resOk: perCard.every((x) => x.resBad.length === 0),
    resBad: perCard.filter((x) => x.resBad.length).slice(0, 3).map((x) => ({ layer: x.layer, why: x.resBad.slice(0, 3) })),
    resCandidates: perCard.reduce((n, x) => n + x.resCands, 0),
    resShown: perCard.reduce((n, x) => n + x.resources.length, 0),
    resCards: perCard.filter((x) => x.resources.length).length,
    resCollide: perCard.reduce((n, x) => n + x.resCollide, 0),
    // --- U8: the rows that are standing on the MEMORY rather than on the prose, and the memory itself ---------
    resStickyRows: perCard.reduce((n, x) => n + x.resSticky, 0),
    resStickyCards: perCard.filter((x) => x.resSticky).length,
    // ⛔ WHERE THE MEMORY LIVES, asserted rather than assumed: the game's OWN namespace, never `player`.
    resMemKey: memRaw().key,
    resMemKeyOk: /^tmt-loader:[^:]+:ui\.layerlist\.resources$/.test(String(memRaw().key || '')),
    resMemKeys: perCard.reduce((n, x) => n + x.resMem.length, 0),
    // ⚖ the collide filter's WITHHOLDING: candidates attributed but ambiguously, which are therefore NOT
    // remembered. 0 here is not a pass, it is "this state had no ambiguous attribution to withhold".
    resWithheld: perCard.flatMap((x) => x.wantRes.filter((w) => w.collide && x.resMem.indexOf(w.key) < 0).map((w) => `${x.layer}.${w.key}`)),
    resRestated: perCard.flatMap((x) => x.resRestated),
    // ⚖ THE LABEL IS THE KEY and the prose lift is REPORTED, never rendered — the sample the user rules on
    resLift: perCard.flatMap((x) => x.resLift.map((y) => `${x.layer}.${y.key} \u2192 ${y.label}`)).slice(0, 12),
    resSample: perCard.filter((x) => x.resources.length).slice(0, 4).map((x) => ({ layer: x.layer, res: x.resources })),
    // the progress rows against the fourth rebuild, and which rule chose each one
    progOk: perCard.every((x) => x.progOk),
    progBad: perCard.filter((x) => !x.progOk).slice(0, 3).map((x) => ({ layer: x.layer, why: x.progBad.slice(0, 3), got: x.prog, want: x.wantProg })),
    progRows: perCard.reduce((n, x) => n + x.prog.length, 0),
    progCards: perCard.filter((x) => x.prog.length).length,
    progHow: perCard.reduce((o, x) => { x.progHow.forEach((h) => { o[h] = (o[h] || 0) + 1; }); return o; }, {}),
    progKinds: perCard.reduce((o, x) => { x.prog.forEach((g) => { o[g.kind] = (o[g.kind] || 0) + 1; }); return o; }, {}),
    // ⚠ 0 is an ABSTENTION on "cheapest is not first-listed", never a pass: the mutant that replaces one with the
    // other can only redden a sample that HAS a case where they differ.
    cheapestWitnesses: perCard.reduce((n, x) => n + x.cheapestWitness, 0),
    // what the list DROPPED and why: `multiRes` (a cost in several currencies at once, which four games declare)
    // and `currency` (the engine says the component can be bought while the generic reading says the amount is
    // short — the tell for a game that buys with something it never declared). Reported, never asserted: they are
    // properties of the ROSTER, and a run with none of them must say so rather than pass in silence.
    progDropped: perCard.flatMap((x) => x.progDropped),
    ctrSkinOk: perCard.every((x) => x.ctrSkinOk),
    ctrSkinBad: perCard.filter((x) => !x.ctrSkinOk).slice(0, 3).map((x) => ({ layer: x.layer, bad: x.ctrSkinBad.slice(0, 3) })),
    // the counter states this page actually SHOWS, per category: the natural witnesses for the user's table. A page
    // that never renders one of them is an ABSTENTION here — the constructed leg is what forces all three.
    ctrSkinCounts: perCard.reduce((o, x) => { x.ctrSkins.forEach((y) => { const k = `${y.wantKind}:${y.wantKey}`; o[k] = (o[k] || 0) + 1; }); return o; }, {}),
    // ⚠ how many cards a build could be JUDGED on at this state, and how many show all three at once. `0` is an
    // ABSTENTION on the three-way reading, never a pass — the constructed leg is what makes the claim non-vacuous.
    threeStateCards: perCard.filter((x) => x.threeStates).map((x) => x.layer),
    // per-card detail the legs below compare across ticks and across widths
    cardRows: perCard.map((x) => ({ layer: x.layer, w: x.cardWidth, counters: x.counters, acts: x.acts, want: x.wantActs, fit: x.actsFit, lit: x.lit,
      // (U5) the chips' colour vector, the chip row's own `layer/kind/id` sequence, and — rebuilt in this probe
      // and NOT asked of the list — the sequence that row is SUPPOSED to hold, so a leg watching the colours can
      // tell a repaint from a legitimate membership change (an upgrade unlocking) the way the button row does
      skins: x.skinVec, chipOrder: x.rowOrder, chipWant: x.want.join(' '),
      // (U6) the two collapsed rows' own colour vectors, so a CI red names the card and the state it disagreed on
      actSkins: x.actSkins.map((y) => SKINMARK[y.gotKey] || '?').join(''),
      ctrSkins: x.ctrSkins.map((y) => `${y.kind}:${y.gotKey || '-'}`).join(' ') })),
    throttle: S(() => window.tmtLoader.layerListUI.stats(), null),
  };
}})()`;

/**
 * ⚠ U2e — THE TOOLTIP, and the reason this probe exists at all is that the OBVIOUS assertion is VACUOUS. U2d put a
 * `title` on every chip, counter and action button, so on the build this slice started from a desktop hover already
 * opened the browser's own tooltip with the component's short name: "a tooltip appeared" passes without U2e.
 *
 * So what is asserted is that the overlay is STRICTLY RICHER than the element's own `title` — that it contains cost
 * or effect text the title does not — and every witness is read HERE out of `tmp` / `layers` and never asked of the
 * list, like every other expectation in this file. A control whose only witness the `title` already contains is
 * ABSTAINED on rather than failed: it cannot tell this build from the native tooltip either way.
 *
 * It also asserts the tooltip's FIRST line is the element's `title` verbatim (the list reads the attribute rather
 * than recomposing the name, so the two cannot drift), that opening one closes any other, that nothing escapes the
 * viewport, and — CONSTRUCTED, because no recorded state reaches it — that rendering a tooltip over a NaN cost
 * neither raises `player.hasNaN` nor lowers a flag the game had already raised.
 */
const TIP_PROBE = `(${function () {
  const S = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const ui = window.tmtLoader.layerListUI;
  const panel = document.getElementById('tmt-layerlist');
  if (!ui || !ui.tip || !panel) return { why: 'no tooltip API' };
  ui.open();
  const tipEl = ui.tip.el();
  if (!tipEl) return { why: 'no overlay element' };
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  // ⚠ ENTITIES DECODED, and with the BROWSER's own decoder rather than a table of our own: the engines render every
  // one of these fields through `v-html`, and `create-incremental`'s upgrade 24 says `&times;` where the page shows
  // `×`. A first version of this probe decoded only the NUMERIC form and reported that game RED for a difference
  // that was entirely the probe's. Tags out first with the regex (so nothing here parses markup), then the entities
  // through a `textarea`, whose content model is text — no element is ever created.
  const dec = document.createElement('textarea');
  const strip = (s) => {
    const t = String(s == null ? '' : s).replace(/<[^>]*>/g, ' ');
    if (t.indexOf('&') >= 0) { try { dec.innerHTML = t; return dec.value.replace(/\s+/g, ' ').trim(); } catch (e) { /* keep the raw form */ } }
    return t.replace(/\s+/g, ' ').trim();
  };
  const isAmt = (v) => typeof v === 'number' ? isFinite(v) : S(() => !!v && typeof v === 'object' && typeof v.toNumber === 'function', false);
  // ⚠ A `tmp` ENTRY CAN STILL BE THE FUNCTION. The engines evaluate a declaration into `tmp` only where it takes no
  // argument; `1-clicker`'s buyable `display()` is left as a function there and the engine calls it at render time
  // (`run(layers[l]…display, layers[l]…)` — with `this` set to the DECLARATION). A first version of this probe took
  // the `tmp` value as it found it and used the function's SOURCE TEXT as its witness, reporting that game RED for a
  // difference that was entirely its own.
  const read = (kind, l, id, f) => {
    const decl = S(() => layers[l][kind][id], null), t = S(() => tmp[l][kind][id], null);
    const v = S(() => t ? t[f] : undefined, undefined);
    if (v !== undefined && v !== null && typeof v !== 'function') return v;
    return S(() => { const x = decl[f]; return typeof x === 'function' ? x.call(decl) : x; }, undefined);
  };
  // The witnesses, named here and INDEPENDENTLY of the list's own table: the category's prose field, and its number.
  // ⚠ Deliberately a SUBSET of what the list composes. A probe that enumerated the same fields in the same order
  // would be the implementation wearing two hats; this asks only "is the thing the chip COSTS and DOES in there".
  const PROSE = { upgrades: ['description'], buyables: ['display'],
    challenges: ['challengeDescription', 'rewardDescription'], milestones: ['effectDescription'] };
  const NUM = { upgrades: ['cost'], challenges: ['goal'] };
  const witness = (kind, l, id) => {
    const parts = [];
    for (const f of (PROSE[kind] || [])) { const s = strip(read(kind, l, id, f)); if (s.length >= 6) parts.push({ f, s }); }
    for (const f of (NUM[kind] || [])) {
      const v = read(kind, l, id, f);
      if (!isAmt(v)) continue;
      const s = strip(S(() => typeof formatWhole === 'function' ? String(formatWhole(v)) : String(v), ''));
      if (s) parts.push({ f, s });
    }
    return { parts, declared: strip(read(kind, l, id, 'tooltip')) || null };
  };
  // ⚠ A RENDERED anchor for one component, or `null`. The list refuses to open a tooltip on a control with no
  // layout, so a constructed sub-check that grabbed a chip off a COLLAPSED card would open nothing and then pass
  // vacuously — the instrument suppressing the very effect it is measuring. The action button if the row is showing
  // it, else the chip with the card expanded, and the expansion is handed back through `restore`.
  const anchorFor = (cardLayer, kind, id) => {
    const card = panel.querySelector('.tmt-layerlist-card[data-layer="' + cardLayer + '"]');
    if (!card) return null;
    const find = (cls) => {
      const list = card.querySelectorAll(cls);
      for (let i = 0; i < list.length; i++) if (list[i].dataset.kind === kind && String(list[i].dataset.cid) === String(id)) return list[i];
      return null;
    };
    const act = find('.tmt-layerlist-act:not(.tmt-layerlist-nofit)');
    if (act && act.getClientRects().length) return { el: act, restore: () => {} };
    const was = card.classList.contains('tmt-layerlist-expanded');
    card.classList.add('tmt-layerlist-expanded');
    const chip = find('.tmt-layerlist-chip');
    if (chip && chip.getClientRects().length) return { el: chip, restore: () => { if (!was) card.classList.remove('tmt-layerlist-expanded'); } };
    if (!was) card.classList.remove('tmt-layerlist-expanded');
    return null;
  };

  const rows = [];
  const judge = (el, role, cardLayer) => {
    const kind = el.dataset.kind || '', id = el.dataset.cid, layer = el.dataset.layer || cardLayer;
    const title = strip(el.getAttribute('title'));
    const opened = ui.tip.show(el);
    // ⚠ THE RAW BODY IS KEPT AS WELL AS THE STRIPPED ONE. `strip()` normalises what it is judging, so a build that
    // injected the game's markup verbatim would compare EQUAL to the witness and the richness test would pass it —
    // measured, on the mutant that leaves the tags in. The markup test has to read the text the overlay really holds.
    const raw = String(ui.tip.body() == null ? '' : ui.tip.body());
    const tipTitle = strip(ui.tip.title()), body = strip(raw);
    const w = role === 'counter' ? { parts: [], declared: null } : witness(kind, layer, id);
    // a witness the TITLE already states cannot discriminate this build from the one that only had `title`
    const usable = w.parts.filter((x) => title.indexOf(x.s) < 0);
    const missed = usable.filter((x) => body.indexOf(x.s) < 0);
    const r = tipEl.getBoundingClientRect(), a = el.getBoundingClientRect();
    rows.push({ card: cardLayer, layer, role, kind, id: id === undefined ? null : String(id), opened,
      titleIsFirstLine: tipTitle === title,
      judged: usable.length > 0,
      // ⚠ NOT a length comparison. `something`'s `primitive/milestones/1` reads "1: 10 Numbers" as its title and
      // "x50 Points." as its detail — SHORTER, and a different fact. What makes a tooltip richer is that it states
      // something the `title` does not, which is exactly what `usable` (a witness the title omits) already tests.
      richer: usable.length > 0 && missed.length === 0,
      witnesses: w.parts.length, usable: usable.length,
      missed: missed.map((x) => x.f + '=' + x.s.slice(0, 40)),
      // where a component DECLARES a `tooltip` the overlay must show it — and still show the cost and the effect,
      // which is what says the field is ADDITIVE rather than a substitute for the composition
      declared: w.declared ? w.declared.slice(0, 40) : null,
      declaredShown: w.declared ? body.indexOf(w.declared) >= 0 : null,
      // the game's own fields are HTML; ours is text. A tag left in is game markup in our overlay.
      markup: /<[a-z!/][^>]*>/i.test(raw),
      escapes: r.width > 0 && (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1),
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      anchorShown: a.width > 0 && a.height > 0,
      sample: (title + ' | ' + body).slice(0, 110) });
  };

  // Every control on every card, in the state that RENDERS it: the counters and the action buttons on the collapsed
  // card, the chips on the expanded one. The class is toggled directly rather than clicked, for the same reason the
  // divider check does it — a click is not a neutral probe and the expander's handler does nothing else here.
  // ⚠ THE FLAG ACROSS OPENING EVERY TOOLTIP ON EVERY CARD — the claim as it was asked for. It cannot DISCRIMINATE
  // on this roster (measured: 1,238 numbers formatted out of drawn chipped components across all 171 games, zero
  // raise it), which is why the constructed check below exists as well; a sweep that reports `unchanged` here is
  // saying the games do not reach the condition, not that the wrapper works.
  let nanBefore = null;
  try { nanBefore = player.hasNaN; } catch (e) { nanBefore = null; }
  const cards = [...panel.querySelectorAll('.tmt-layerlist-card')];
  for (const c of cards) {
    const l = c.dataset.layer, was = c.classList.contains('tmt-layerlist-expanded');
    c.classList.remove('tmt-layerlist-expanded');
    for (const e of c.querySelectorAll('.tmt-layerlist-counter')) judge(e, 'counter', l);
    for (const e of c.querySelectorAll('.tmt-layerlist-act:not(.tmt-layerlist-nofit)')) judge(e, 'act', l);
    c.classList.add('tmt-layerlist-expanded');
    for (const e of c.querySelectorAll('.tmt-layerlist-chip')) judge(e, 'chip', l);
    if (!was) c.classList.remove('tmt-layerlist-expanded');
  }
  ui.tip.hide();
  let nanAfter = null;
  try { nanAfter = player.hasNaN; } catch (e) { nanAfter = null; }
  const sweepNaN = { before: nanBefore, after: nanAfter,
    verdict: nanBefore === null ? 'abstains (this engine has no player.hasNaN)'
      : nanAfter === nanBefore ? 'unchanged across every tooltip on every card'
      : nanBefore === false ? 'OPENING THE TOOLTIPS RAISED player.hasNaN' : 'OPENING THE TOOLTIPS LOWERED player.hasNaN' };

  // ---- ONE AT A TIME. Two controls, opened in turn: exactly one overlay may be showing, it must name the SECOND,
  // and the first must have lost its `aria-describedby` — a build that appended one overlay per control would pass a
  // count of "the tooltip is open" and fail this.
  let exclusive = { verdict: 'abstains (fewer than two controls on the page)' };
  const all = [...panel.querySelectorAll('.tmt-layerlist-counter, .tmt-layerlist-act:not(.tmt-layerlist-nofit)')];
  if (all.length >= 2) {
    const a = all[0], b = all[1];
    ui.tip.show(a);
    const aKey = ui.tip.key(), aDesc = a.getAttribute('aria-describedby');
    ui.tip.show(b);
    const bKey = ui.tip.key();
    const showing = [...panel.querySelectorAll('.tmt-layerlist-tip')].filter((e) => !e.hidden).length;
    const stillA = a.getAttribute('aria-describedby');
    ui.tip.hide();
    exclusive = { showing, first: aKey, second: bKey, firstDescribed: !!aDesc, firstStillDescribed: !!stillA,
      verdict: !aDesc ? 'THE FIRST WAS NEVER DESCRIBED' : showing !== 1 ? 'MORE THAN ONE OVERLAY IS SHOWING'
        : stillA ? 'THE FIRST IS STILL DESCRIBED' : 'one at a time' };
  }

  // ---- CONSTRUCTED: A NaN COST. Measured over the roster (docs/mobile.md): no game's own cost or effect formats a
  // NaN at any recorded state, so `withoutRaisingNaN` around the composition would be untested on every one of them.
  // The condition is built here instead — one drawn upgrade's `tmp` cost set to a NaN Decimal — with a CONTROL that
  // the construction really does raise the flag on this engine, because otherwise the leg would be asserting nothing.
  // ⚠ It writes to `tmp`, never to `player`, and puts both the cost and the flag back in a `finally`.
  const nan = (() => {
    let had;
    try { had = player.hasNaN; } catch (e) { return { verdict: 'abstains (this engine has no player.hasNaN)' }; }
    if (typeof Decimal !== 'function') return { verdict: 'abstains (no Decimal)' };
    for (const l of ui.cards()) {
      for (const e of ui.visibleSeq(l)) {
        if (e.kind !== 'upgrades') continue;
        const t = S(() => tmp[e.layer].upgrades[e.id], null);
        if (!t || !isAmt(S(() => t.cost, undefined))) continue;
        const a = anchorFor(l, 'upgrades', e.id);
        if (!a) continue;
        const el = a.el, was = t.cost;
        try {
          t.cost = new Decimal(NaN);
          try { player.hasNaN = false; } catch (e2) { /* not this engine's */ }
          S(() => typeof formatWhole === 'function' ? formatWhole(t.cost) : null, null);
          let control = false;
          try { control = player.hasNaN === true; } catch (e2) { control = false; }
          try { player.hasNaN = false; } catch (e2) { /* not this engine's */ }
          if (!control) return { layer: e.layer, id: e.id, control, verdict: 'abstains (a NaN cost does not raise the flag on this engine)' };
          // ⚠ the show must really have OPENED, or the flag could not have moved for a reason that has nothing to do
          // with the wrapper — a pass that proves the probe missed rather than that the list behaved
          if (!ui.tip.show(el)) return { layer: e.layer, id: e.id, control, verdict: 'THE TOOLTIP WOULD NOT OPEN ON A RENDERED CONTROL' };
          let after = null;
          try { after = player.hasNaN; } catch (e2) { after = null; }
          // …and the other half of the rule: a flag the GAME had already raised is not ours to hide
          ui.tip.hide();
          try { player.hasNaN = true; } catch (e2) { /* not this engine's */ }
          ui.tip.show(el);
          let kept = null;
          try { kept = player.hasNaN; } catch (e2) { kept = null; }
          return { layer: e.layer, id: e.id, control, raised: after === true, lowered: kept !== true,
            body: strip(ui.tip.body()).slice(0, 60),
            verdict: after === true ? 'THE TOOLTIP RAISED player.hasNaN'
              : kept !== true ? 'THE TOOLTIP LOWERED A FLAG THE GAME HAD RAISED' : 'the flag is the game\'s own, both ways' };
        } finally {
          t.cost = was;
          try { player.hasNaN = had; } catch (e2) { /* not this engine's */ }
          ui.tip.hide();
          a.restore();
        }
      }
    }
    return { verdict: 'abstains (no drawn upgrade carries a numeric cost)' };
  })();

  // ---- CONSTRUCTED: AN OPEN TOOLTIP IS RE-READ. Cost and effect move every tick, so a tooltip composed once and
  // never again goes stale while the finger is still on the chip. Driven by moving the underlying `tmp` cost — never
  // `player` — and asking for an explicit `refresh()`, which is always the full pass; the throttled path is measured
  // by the throttle leg's own budget instead (`tipSyncs`). Restored in a `finally`, like the NaN construction.
  const live = (() => {
    if (typeof Decimal !== 'function') return { verdict: 'abstains (no Decimal)' };
    for (const l of ui.cards()) {
      for (const e of ui.visibleSeq(l)) {
        if (e.kind !== 'upgrades') continue;
        const t = S(() => tmp[e.layer].upgrades[e.id], null);
        if (!t || !isAmt(S(() => t.cost, undefined))) continue;
        const a = anchorFor(l, 'upgrades', e.id);
        if (!a) continue;
        const el = a.el, was = t.cost;
        try {
          if (!ui.tip.show(el)) return { layer: e.layer, id: e.id, verdict: 'THE TOOLTIP WOULD NOT OPEN ON A RENDERED CONTROL' };
          const before = strip(ui.tip.body());
          t.cost = new Decimal('1.2345e97');
          ui.refresh();
          const after = strip(ui.tip.body());
          const want = strip(S(() => typeof formatWhole === 'function' ? String(formatWhole(t.cost)) : '', ''));
          return { layer: e.layer, id: e.id, before: before.slice(0, 60), after: after.slice(0, 60), want,
            open: ui.tip.isOpen(),
            verdict: !ui.tip.isOpen() ? 'THE REFRESH CLOSED THE TOOLTIP'
              : after === before ? 'THE OPEN TOOLTIP DID NOT RE-READ THE COST'
              : want && after.indexOf(want) < 0 ? 'THE RE-READ DID NOT SHOW THE NEW COST'
              : 'an open tooltip re-reads its cost' };
        } finally {
          t.cost = was;
          ui.tip.hide();
          ui.refresh();
          a.restore();
        }
      }
    }
    return { verdict: 'abstains (no drawn upgrade carries a numeric cost)' };
  })();

  const judgedRows = rows.filter((x) => x.judged);
  const declRows = rows.filter((x) => x.declared);
  return {
    vw, controls: rows.length, chips: rows.filter((x) => x.role === 'chip').length,
    acts: rows.filter((x) => x.role === 'act').length, counters: rows.filter((x) => x.role === 'counter').length,
    opened: rows.filter((x) => x.opened).length,
    // ⚠ THE DISCRIMINATOR: how many controls carry a tooltip the `title` does not already state, and whether every
    // one of them does. A run where `judged` is 0 has measured nothing about richness and says so.
    judged: judgedRows.length,
    richer: judgedRows.filter((x) => x.richer).length,
    poor: judgedRows.filter((x) => !x.richer).slice(0, 3),
    titleFirst: rows.every((x) => x.titleIsFirstLine),
    titleBad: rows.filter((x) => !x.titleIsFirstLine).slice(0, 3),
    // the `tooltip` FIELD path — the components that declare one, and whether the overlay shows it
    declared: declRows.length, declaredShown: declRows.filter((x) => x.declaredShown).length,
    declaredBad: declRows.filter((x) => !x.declaredShown).slice(0, 3),
    escaping: rows.filter((x) => x.escapes).slice(0, 3),
    // ⚠ and how many controls COULD have shown markup, so a game where no field carries a tag abstains on it rather
    // than reading as a pass: `markupSource` counts the components whose own fields do contain one.
    markup: rows.filter((x) => x.markup).slice(0, 3),
    markupSource: rows.filter((x) => x.role !== 'counter'
      && ((PROSE[x.kind] || []).concat(['tooltip'])).some((f) => /<[a-z!/][^>]*>/i.test(String(read(x.kind, x.layer, x.id, f) == null ? '' : read(x.kind, x.layer, x.id, f))))).length,
    samples: judgedRows.slice(0, 3).map((x) => x.role + ' ' + x.card + '/' + x.kind + '/' + x.id + ': ' + x.sample),
    exclusive, nan, live, sweepNaN,
    stats: S(() => ui.stats(), null),
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
          // (U4) AND THE ARMING SETTING IS OFF, on the page the whole roster's CI actually runs. The full arming
          // flow is `gates-a1.mjs --part 2`, which CI does not run; this is the half that protects every existing
          // row — the setting is opt-in, so a locked feature's toggle must still refuse by default — plus the two
          // structural facts: the control is there, and it is a tabFormat `toggle`, never a clickable (a twelfth
          // clickable would shift every feature button's id by one and join the flatten measured just above, so
          // `clickables === features + 1` is what says it stayed out of the grid).
          auTab.arm = await both.evaluate(() => {
            const T = window.tmtLoader, AU = T.auLayer;
            const ids = Object.keys(layers[AU].clickables).filter((k) => !isNaN(k));
            const locked = ids.filter((k) => layers[AU].clickables[k].tmtFeature && !T.featureState(layers[AU].clickables[k].tmtFeature).unlocked);
            return { off: T.armLocked() === false, stored: player[AU].armLocked,
              refusing: locked.filter((k) => layers[AU].clickables[k].canClick() === false).length, locked: locked.length,
              clickables: ids.length, features: T.features.length,
              control: document.querySelectorAll('#app button.smallUpg').length,
              label: document.querySelector('#app').innerText.includes('Arm features that are not unlocked yet') };
          });
        }
        await both.close();
        const fits = (m) => m && m.escaping.length === 0 && m.tooSmall.length === 0 && m.docScrollWidth <= m.vw + 1;
        const fl = (auTab && auTab.flattened) || { rows: 0, contents: 0 };
        const evenRows = fl.rows > 0 && fl.contents === fl.rows;   // every clickable row box flattened
        const arm = (auTab && auTab.arm) || null;
        // ⚖ V1 SEEDED THE KEY (user, plan §15d.2), so the default is `false` and PRESENT, not absent. What this
        // half asserts is unchanged and is the half that matters — the setting is OFF by default and every locked
        // toggle still refuses. ⛔ This line is why the seed is not a one-line change: `stored === undefined` would
        // have reddened this gate on ALL 171 GAMES in CI, for a key whose value is the default it always had.
        const armOk = !!(arm && arm.off && arm.stored === false && arm.label && arm.control >= 1
          && arm.clickables === arm.features + 1 && arm.refusing === arm.locked);
        row.both = tree && { auNodes: tree.auNodes, features: tree.features, navOnTree: tree.navButtons.length,
          treeFits: fits(tree), auTabFits: fits(auTab), auTab: auTab && auTab.tab, flattened: fl, evenRows,
          arm, armOk,
          armVerdict: !arm ? 'no au tab probe'
            : !arm.off || arm.stored !== false ? `THE ARMING SETTING IS NOT OFF BY DEFAULT (player.au.armLocked = ${JSON.stringify(arm.stored)}; V1 seeds it false)`
            : !arm.label || !arm.control ? 'THE ARMING CONTROL IS NOT IN THE au TAB'
            : arm.clickables !== arm.features + 1 ? `THE SETTING JOINED THE CLICKABLE GRID (${arm.clickables} boxes for ${arm.features} features)`
            : arm.refusing !== arm.locked ? `A LOCKED TOGGLE ACCEPTS A PRESS WITH THE SETTING OFF (${arm.locked - arm.refusing} of ${arm.locked})`
            : !arm.locked ? `off by default, outside the grid (abstains on the refusal: no locked feature here)`
            : `off by default, outside the grid, and all ${arm.locked} locked toggles refuse`,
          worst: [...(tree.escaping || []).slice(0, 2), ...((auTab && auTab.escaping) || []).slice(0, 2)] };
        row.bothOk = !!(rb.ready && tree && tree.auNodes === 1 && tree.features > 0 && tree.navButtons.length >= 1
          && fits(tree) && fits(auTab) && evenRows && armOk);
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
          if (!r.ready) return { ready: false, error: r.error, views: [], layerList: null, tips: null, tipHover: null };
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
          let layerList = null, tips = null, tipHover = null;
          if (withLayers) {
            await p.evaluate(() => { const b = document.querySelector('#tmt-navbar button[data-key="layers"]'); if (b) b.click(); });
            await p.waitForTimeout(250);
            layerList = { ...(await p.evaluate(LAYERLIST_PROBE)), geometry: await p.evaluate(MOBILE_PROBE) };
            // (U2e) the tooltip at a DESKTOP width, and the POINTER path with a real mouse — this context has no
            // touch, so `(hover: none)` is false here and the click path is deliberately off: a hover that opened
            // nothing would mean a pointer user could not read a chip at all.
            tips = await p.evaluate(TIP_PROBE);
            // ⚠ AN ACTION BUTTON BY PREFERENCE, a counter only if there is none: a counter's tooltip is its name and
            // nothing more (there is no cost or effect for a category total), so hovering one could not show that the
            // POINTER path carries the richer text — which is the whole claim.
            const ASEL = '#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit)';
            const HSEL = (await p.locator(ASEL).count()) ? ASEL : '#tmt-layerlist .tmt-layerlist-counter';
            if (await p.locator(HSEL).count()) {
              await p.locator(HSEL).first().hover();
              await p.waitForTimeout(80);
              tipHover = await p.evaluate((sel) => {
                const ui = window.tmtLoader.layerListUI;
                const r = { on: sel.indexOf('-act') > 0 ? 'act' : 'counter', open: ui.tip.isOpen(), key: ui.tip.key(),
                  title: ui.tip.title(), body: ui.tip.body(), rich: ui.tip.rich(), hoverable: ui.tip.hoverable() };
                r.verdict = !r.hoverable ? 'abstains (this context reports no hover)'
                  : !r.open ? 'A HOVER OPENED NO TOOLTIP'
                  : r.on === 'counter' ? 'a hover opens it (on a counter, so richness is not judged here)'
                  : !r.rich ? 'A HOVER OPENED A TOOLTIP NO RICHER THAN THE title'
                  : 'a hover opens the richer tooltip, with no click at all';
                ui.tip.hide();
                return r;
              }, HSEL);
            } else { tipHover = { verdict: 'abstains (no counter or action button on the desktop page)' }; }
            await p.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui) ui.close(); });
          }
          return { ready: true, views, layerList, tips, tipHover };
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
      // ⚖ (U5) AND THE CHIPS' OWN COLOUR IS APPEARANCE TOO (user, 2026-09-19, the same ruling): the window is
      // opened on EITHER vector moving — the action row's lit/grey or the chips' three-way `data-skin` — and the
      // chip ORDER is asserted byte-identical across it beside the button set.
      const before = await page.evaluate(LAYERLIST_PROBE);
      let litMoved = false, ticked = 0, after = before;
      for (let i = 0; i < 4 && !litMoved; i++) {
        await page.evaluate(() => { window.tmtLoader.tick(0.05, 250); window.tmtLoader.layerListUI.refresh(); });
        ticked += 250;
        after = await page.evaluate(LAYERLIST_PROBE);
        const a0 = byLayer({ rows: after.cardRows });
        // ⚠ A COLOUR CHANGE ONLY COUNTS WHERE THE CHIP ROW'S OWN EXPECTATION HELD. MEASURED on `ptr`: over 250
        // ticks two cards gained a chip (`b` and `g`, 10 → 11), which moves the vector and the order without any
        // affordability having flipped — a legitimate membership change, and the same abstention the button row's
        // `want` already gets below.
        litMoved = before.cardRows.some((r) => { const n = a0[r.layer]; return n && (r.lit !== n.lit || (r.chipWant === n.chipWant && r.skins !== n.skins)); });
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
      // (U5) the same window, judged on the CHIPS: which cards repainted, and whether any of them also reordered
      // or changed membership. `chipOrder` is the chip row's own `layer/kind/id` sequence, so "byte-identical"
      // covers position AND membership in one string.
      const chipHeld = (r) => bMap[r.layer] && bMap[r.layer].chipWant === r.chipWant;   // the expectation itself did not move
      const skinChanged = after.cardRows.filter((r) => chipHeld(r) && bMap[r.layer].skins !== r.skins).map((r) => r.layer);
      const chipMoved = after.cardRows.filter((r) => chipHeld(r) && bMap[r.layer].chipOrder !== r.chipOrder).map((r) => r.layer);
      const chipAbstained = after.cardRows.filter((r) => bMap[r.layer] && !chipHeld(r)).map((r) => r.layer);
      row.stability = { ticks: ticked, litChanged, skinChanged, chipMoved, chipAbstained, held: held.length, moved, abstained: skipped,
        sample: litChanged.length ? { layer: litChanged[0], lit: [bMap[litChanged[0]].lit, after.cardRows.find((r) => r.layer === litChanged[0]).lit], set: bMap[litChanged[0]].acts.length } : null,
        skinSample: skinChanged.length ? { layer: skinChanged[0], skins: [bMap[skinChanged[0]].skins, after.cardRows.find((r) => r.layer === skinChanged[0]).skins] } : null,
        verdict: !litChanged.length && !skinChanged.length ? `abstains (affordability did not move in ${ticked} ticks)`
          : moved.length ? 'THE SET MOVED'
          : chipMoved.length ? 'THE CHIP ROW MOVED'
          : `the set and the chip row held while ${[litChanged.length ? 'lit/grey' : null, skinChanged.length ? 'the chips\' colour' : null].filter(Boolean).join(' and ')} moved` };
      row.stabilityOk = !/THE SET MOVED|THE CHIP ROW MOVED/.test(row.stability.verdict);

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
        // (U2e) …with a tooltip OPEN, so the one budget covers the tooltip's own re-read as well. It rides
        // `syncCards`, the counters' own throttled path; a build that re-read it once per animation frame instead
        // would show up HERE and nowhere else, because it moves no other counter in `stats()`.
        const anchor = document.querySelector('#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit)')
          || document.querySelector('#tmt-layerlist .tmt-layerlist-counter');
        if (anchor && ui.tip) ui.tip.show(anchor);
        const s0 = ui.stats(), t0 = performance.now();
        for (let i = 0; i < 12; i++) {
          if (app) { const d = document.createElement('span'); d.textContent = 'u2d'; app.appendChild(d); app.removeChild(d); }
          await frame();
        }
        await frame();
        const s1 = ui.stats(), ms = Math.round(performance.now() - t0);
        const tipOpen = !!(ui.tip && ui.tip.isOpen());
        if (ui.tip) ui.tip.hide();
        return { ms, refreshes: s1.refreshes - s0.refreshes, syncs: s1.syncs - s0.syncs,
          throttled: s1.throttled - s0.throttled, throttleMs: s1.throttleMs,
          tipOpen, tipSyncs: s1.tipSyncs - s0.tipSyncs };
      });
      row.throttle.cap = row.throttle.throttleMs ? Math.ceil(row.throttle.ms / row.throttle.throttleMs) + 1 : null;
      row.throttle.verdict = row.throttle.refreshes === undefined ? 'no stats()'
        : row.throttle.refreshes < 3 ? `abstains (the observer fired ${row.throttle.refreshes}x in ${row.throttle.ms} ms)`
        : row.throttle.syncs > row.throttle.cap ? 'NOT THROTTLED'
        : row.throttle.tipOpen && row.throttle.tipSyncs > row.throttle.cap ? 'THE TOOLTIP IS NOT THROTTLED'
        : `throttled (${row.throttle.syncs} sync(s)${row.throttle.tipOpen ? ` and ${row.throttle.tipSyncs} tooltip re-read(s)` : ''} over ${row.throttle.refreshes} refresh(es) in ${row.throttle.ms} ms)`;
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
        // (U4) AND THE LIST MAY NOT DRIFT UNDER THE PRESS. The press is the real thing that used to move it: the
        // refresh it triggers rewrites the prestige string and the counters, the card's content height moves by a
        // few pixels, and the browser's scroll anchoring adjusted `scrollTop` to keep its anchor still. So the
        // scroller is put at a real mid-list offset first and both numbers are read either side.
        const b = document.querySelector('#tmt-layerlist .tmt-layerlist-body');
        const room = b ? b.scrollHeight - b.clientHeight : 0;
        let scroll = null;
        if (b && room >= 80) { b.scrollTop = Math.floor(room / 2); void b.scrollTop; scroll = { anchor: getComputedStyle(b).overflowAnchor, room, top: b.scrollTop, height: b.scrollHeight }; }
        btn.click();
        if (scroll) { void b.scrollHeight; scroll.dTop = b.scrollTop - scroll.top; scroll.dHeight = b.scrollHeight - scroll.height; b.scrollTop = 0; }
        return { candidate: l, ticks, before, after: String(player[l].points), text: btn.textContent.slice(0, 80), scroll, room };
      });
      row.resetVerdict = !row.reset.candidate ? 'no candidate (the leg abstains)'
        : row.reset.after !== row.reset.before ? 'moved' : 'NOT MOVED';
      // ⚠ THE DISCRIMINATOR IS NOT "scrollTop did not move". A build whose cards stopped changing height would pass
      // that while proving nothing about anchoring, so the height has to have MOVED for this half to judge at all.
      // MEASURED both ways on `ptr` (deep snapshot, 390px): with `overflow-anchor: auto` the press gives
      // scrollTop -3 / height -3; with `none`, 0 / -3.
      row.resetDrift = !row.reset.scroll ? { verdict: `abstains (${row.reset.candidate ? `the list is not scrollable here (${row.reset.room} px of room)` : 'no reset candidate'})` }
        : { ...row.reset.scroll,
            verdict: row.reset.scroll.dHeight === 0 ? 'abstains (the press did not move the content height)'
              : row.reset.scroll.dTop !== 0 ? 'THE LIST DRIFTED UNDER THE PRESS' : 'held while the height moved' };

      // --- U4 leg H: THE LIST DOES NOT DRIFT WHEN THE CONTENT ABOVE IT CHANGES HEIGHT -------------------------
      // ⚖ "the Layers view drifts down on a reset" (user, 2026-09-19). The reset press above measures the REAL
      // thing, and abstains on a game whose press happens not to move the height — which is most of them. This half
      // CONSTRUCTS the height change so the claim is judged wherever the list scrolls at all: a 40 px spacer as the
      // body's FIRST child, which moves every anchor candidate below it.
      // ⚠ WHY A SPACER AND NOT `marginTop` ON THE FIRST CARD. A computed-style change to `margin` / `padding` /
      // `height` on the anchor node OR ANY OF ITS ANCESTORS up to the scroller is a SUPPRESSION TRIGGER in the
      // scroll-anchoring spec: the browser declines to adjust, and the probe reads Δ 0 with anchoring fully on.
      // MEASURED on `something`, whose rows hold one card each so the first card IS an ancestor of the anchor:
      // `marginTop` +40 gave dTop 0 / dHeight 40 while a spacer at the top of the same body gave 40 / 40. A probe
      // built the first way would have called the defect fixed before anything was.
      // ⚠ 127 of the 171 games cannot witness this at all — their list is not scrollable at 390x844 — so the
      // abstention names the room it found rather than passing quietly. 44 do, `ptr` and `something` among them.
      row.anchorDrift = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui) return { verdict: 'abstains (no layerListUI)' };
        ui.open();
        const b = document.querySelector('#tmt-layerlist .tmt-layerlist-body');
        if (!b) return { verdict: 'abstains (no scroller)' };
        const anchor = getComputedStyle(b).overflowAnchor;
        const room = b.scrollHeight - b.clientHeight;
        if (room < 80) return { anchor, room, verdict: `abstains (the list is not scrollable at this width: ${room} px of room)` };
        b.scrollTop = Math.floor(room / 2);
        void b.scrollTop;
        const t0 = b.scrollTop, h0 = b.scrollHeight;
        const spacer = document.createElement('div');
        spacer.style.cssText = 'height:40px';
        b.insertBefore(spacer, b.firstChild);
        void b.scrollHeight;
        const dTop = b.scrollTop - t0, dHeight = b.scrollHeight - h0;
        b.removeChild(spacer);
        void b.scrollHeight;
        const back = b.scrollTop;
        b.scrollTop = 0;   // put the scroller back where the leg found it: every leg after this one measures boxes
        return { anchor, room, top: t0, height: h0, dTop, dHeight, back,
          verdict: dHeight === 0 ? 'abstains (the construction did not move the content height)'
            : dTop !== 0 ? 'THE LIST DRIFTED' : 'held while the height moved' };
      });
      row.anchorOk = !/DRIFTED/.test(row.anchorDrift.verdict);

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

      // --- U2e leg G: THE TOOLTIP SAYS WHAT THE CHIP COSTS AND DOES --------------------------------------------
      // ⚖ "a chip reading RPB should say what the upgrade costs and does" (user, 2026-09-18). Everything about the
      // TEXT is in TIP_PROBE above, at this width; the two things a probe cannot fake are driven here.
      const tipPhone = await page.evaluate(TIP_PROBE);
      // ⚠ THE TAP, with a real touch event, and the half of it that matters: the control's own click must STILL
      // happen (U1's no-`preventDefault` rule). Observed by WRAPPING the engine's own buy functions in counters
      // rather than by looking for a purchase — affordability must not decide whether this leg can run, and an
      // unaffordable buy is a no-op in the engine while the CALL is exactly what the rule is about. Restored
      // immediately afterwards, like every other constructed condition on this page.
      const ACT_SEL = '#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit)';
      const tapSetup = await page.evaluate((sel) => {
        const ui = window.tmtLoader.layerListUI;
        ui.open();
        const btn = document.querySelector(sel);
        if (!btn) return { candidate: null, why: 'no action button is showing on any card' };
        const names = ['buyUpg', 'buyUpgrade', 'buyBuyable', 'startChallenge'];
        window.__tmtTip = { calls: [], orig: {} };
        for (const n of names) {
          if (typeof window[n] !== 'function') continue;
          window.__tmtTip.orig[n] = window[n];
          window[n] = function () { window.__tmtTip.calls.push(n + ':' + [].slice.call(arguments).join('/')); return window.__tmtTip.orig[n].apply(this, arguments); };
        }
        // ⚠ MEASURED, not assumed: the list reads these as BARE identifiers, so a `window` assignment only reaches it
        // where the game declared them as function declarations. A `let` would make this leg blind, and it says so.
        const visible = {};
        for (const n of Object.keys(window.__tmtTip.orig)) {
          try { visible[n] = new Function('return typeof ' + n + ' === "function" && ' + n + ' === window.' + n)(); } catch (e) { visible[n] = false; }
        }
        return { candidate: btn.dataset.layer + '/' + btn.dataset.kind + '/' + btn.dataset.cid, visible,
          wrapped: Object.keys(window.__tmtTip.orig), tips: ui.stats().tips, hoverable: ui.tip.hoverable() };
      }, ACT_SEL);
      let tapped = null;
      if (tapSetup.candidate) {
        await page.locator(ACT_SEL).first().tap();
        await page.waitForTimeout(80);
        tapped = await page.evaluate(() => {
          const ui = window.tmtLoader.layerListUI;
          const r = { tips: ui.stats().tips, calls: window.__tmtTip.calls.slice(0, 4), open: ui.tip.isOpen(),
            key: ui.tip.key(), rich: ui.tip.rich() };
          for (const n of Object.keys(window.__tmtTip.orig)) window[n] = window.__tmtTip.orig[n];
          delete window.__tmtTip;
          ui.tip.hide();
          return r;
        });
      }
      const wrappedNone = tapSetup.candidate && !Object.values(tapSetup.visible || {}).some(Boolean);
      row.tips = {
        phone: tipPhone, desktop: nb.tips || null,
        tap: { candidate: tapSetup.candidate, why: tapSetup.why, visible: tapSetup.visible, hoverable: tapSetup.hoverable,
          opened: tapped ? tapped.tips > tapSetup.tips : null, calls: tapped ? tapped.calls : null,
          verdict: !tapSetup.candidate ? `abstains (${tapSetup.why})`
            : wrappedNone ? 'abstains (the engine keeps its buy functions off `window`, so the call cannot be counted)'
            : !(tapped.tips > tapSetup.tips) ? 'A TAP OPENED NO TOOLTIP'
            // ⚠ NOT "preventDefault?" — that mutant is GREEN, measured on `ptr`: `preventDefault()` suppresses a
            // default ACTION and the control's own click LISTENER runs regardless. A `stopPropagation()` in this
            // handler's capture phase is what swallows it, and that one reds here.
            : !tapped.calls.length ? 'THE TAP DID NOT REACH THE ENGINE (the handler swallowed the click)'
            : `a tap opens the tooltip and the control still acts (${tapped.calls[0]})` },
        // and the POINTER path, on the desktop page from leg 5: a real mouse hover, no click at all
        hover: (nb.tipHover && nb.tipHover.verdict) ? nb.tipHover : { verdict: 'abstains (no desktop layer-list page)' },
      };
      // ⚠ `judged === 0` is an ABSTENTION on richness, never a pass: it means no control on this page carries a
      // cost or an effect the `title` does not already state, so nothing here could tell U2e from U2d.
      const tipVerdict = (t) => !t || t.why ? `abstains (${(t && t.why) || 'no probe'})`
        : !t.titleFirst ? 'THE FIRST LINE IS NOT THE ELEMENT\'S OWN title'
        : t.escaping.length ? 'A TOOLTIP ESCAPED THE VIEWPORT'
        : t.markup.length ? 'THE OVERLAY HOLDS THE GAME\'S OWN MARKUP'
        : /RAISED|LOWERED/.test(t.sweepNaN.verdict) ? t.sweepNaN.verdict
        : /RAISED|LOWERED/.test(t.nan.verdict) ? t.nan.verdict
        : /THE FIRST|MORE THAN ONE/.test(t.exclusive.verdict) ? t.exclusive.verdict
        : /CLOSED|DID NOT|WOULD NOT OPEN/.test(t.live.verdict) ? t.live.verdict
        : /WOULD NOT OPEN/.test(t.nan.verdict) ? t.nan.verdict
        : t.declared && t.declaredShown < t.declared ? 'A DECLARED tooltip FIELD IS NOT IN THE OVERLAY'
        : !t.judged ? 'abstains (no control carries text the title does not already state)'
        : t.richer < t.judged ? 'A TOOLTIP IS NO RICHER THAN THE title IT SITS ON'
        : `richer than the title on ${t.richer}/${t.judged} control(s)`;
      row.tips.phoneVerdict = tipVerdict(tipPhone);
      row.tips.desktopVerdict = tipVerdict(nb.tips);
      const tipBad = (v) => /THE FIRST|ESCAPED|RAISED|LOWERED|MORE THAN ONE|DECLARED|NO RICHER|no probe|CLOSED|DID NOT|WOULD NOT OPEN|MARKUP/.test(v);
      row.tipsOk = !tipBad(row.tips.phoneVerdict) && !tipBad(row.tips.desktopVerdict)
        && !/A TAP OPENED|DID NOT REACH/.test(row.tips.tap.verdict) && !/NOT OPEN|NOT RICHER/.test(row.tips.hover.verdict);
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

      // --- U5 leg I: THE THREE-WAY READING, ON ONE CARD, CONSTRUCTED -------------------------------------------
      // ⚖ "purchased, affordable, unaffordable — the game's own three-way reading" (user, 2026-09-19).
      // ⚠ THE DISCRIMINATOR, and it has to be CONSTRUCTED. A two-state check (bought / not) passes on a build that
      // never renders red — which is the build before U5. MEASURED on `ptr` at its deepest snapshot plus 6,000
      // ticks: not ONE card shows all three at once, because everything unbought there is also unaffordable, and a
      // fresh save draws one chip in total. `threeStateCards` above reports the natural witnesses and is an
      // ABSTENTION at 0, never a pass.
      // So one card's three upgrade chips are forced into the three states, the same way the `pseudoUnl` and
      // `msDisplay` conditions above are: `player[l].upgrades` decides the bought one, and the engine's own
      // `canAffordUpgrade` is replaced with one that says yes to exactly one id.
      // ⚠ The replacement only reaches the list where the game declared `canAffordUpgrade` as a FUNCTION
      // DECLARATION — the list reads it as a bare identifier — which is the caveat the tooltip tap leg measured.
      // `visible` says whether it did, and the leg ABSTAINS rather than passing where it did not.
      // ⚠ The three expectations are resolved HERE, off the game's own stylesheet and off `tmp[l].color`, and they
      // must be THREE DISTINCT colours or the leg abstains: a game that paints all three the same cannot judge a
      // build that paints all three the same either.
      row.threeWay = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui) return { verdict: 'abstains (no layerListUI)' };
        ui.open();
        const NOBG = 'rgba(0, 0, 0, 0)';
        const measure = (fn) => {
          try {
            const e = document.createElement('span');
            e.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;visibility:hidden';
            fn(e);
            document.body.appendChild(e);
            const v = String(getComputedStyle(e).backgroundColor || '');
            document.body.removeChild(e);
            return v || NOBG;
          } catch (err) { return NOBG; }
        };
        const chipsOfCard = (l) => [...document.querySelectorAll(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-chip[data-kind="upgrades"]`)]
          .filter((e) => (e.dataset.layer || l) === l && e.dataset.state !== 'pseudo');
        let target = null;
        for (const l of ui.cards()) { const cs = chipsOfCard(l); if (cs.length >= 3) { target = { l, ids: cs.slice(0, 3).map((e) => e.dataset.cid) }; break; } }
        if (!target) return { verdict: 'abstains (no card draws three unlocked upgrade chips at this state)' };
        const l = target.l, [A, B, C] = target.ids;
        const visible = (() => { try { return new Function('return typeof canAffordUpgrade === "function" && canAffordUpgrade === window.canAffordUpgrade')(); } catch (e) { return false; } })();
        if (!visible) return { layer: l, ids: target.ids, visible,
          verdict: 'abstains (the engine keeps canAffordUpgrade off `window`, so affordability cannot be constructed)' };
        const had = (player[l].upgrades || []).slice();
        const orig = window.canAffordUpgrade;
        const before = chipsOfCard(l).map((e) => e.dataset.skin || '');
        let out;
        try {
          player[l].upgrades = had.filter((x) => String(x) !== String(B) && String(x) !== String(C)).concat([Number(A)]);
          window.canAffordUpgrade = function (ll, id) { return String(ll) === String(l) && String(id) === String(B); };
          ui.refresh();
          const bg = (id) => { const e = document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-chip[data-kind="upgrades"][data-cid="${id}"]`);
            return e ? { bg: String(getComputedStyle(e).backgroundColor || ''), skin: e.dataset.skin || '', state: e.dataset.state || '' } : null; };
          const want = { bought: measure((e) => { e.className = `${l} upg bought`; }),
            can: measure((e) => { e.style.backgroundColor = String(tmp[l].color || ''); }),
            locked: measure((e) => { e.className = `${l} upg locked`; }) };
          out = { layer: l, ids: target.ids, visible, want,
            got: { bought: bg(A), can: bg(B), locked: bg(C) } };
        } finally {
          player[l].upgrades = had;
          window.canAffordUpgrade = orig;
          ui.refresh();
        }
        out.restored = chipsOfCard(l).map((e) => e.dataset.skin || '').join(' ') === before.join(' ');
        const w = out.want, g = out.got;
        const distinct = new Set([w.bought, w.can, w.locked]).size === 3;
        const ok = (k) => g[k] && g[k].skin === k && g[k].bg === w[k];
        out.verdict = !g.bought || !g.can || !g.locked ? 'A CHIP VANISHED UNDER THE CONSTRUCTION'
          : !distinct ? `abstains (the game paints the three states ${JSON.stringify([w.bought, w.can, w.locked])} — not three colours)`
          : !ok('bought') ? `THE PURCHASED CHIP IS NOT THE GAME'S BOUGHT COLOUR (${g.bought.skin} ${g.bought.bg} != ${w.bought})`
          : !ok('can') ? `THE AFFORDABLE CHIP IS NOT THE LAYER'S OWN COLOUR (${g.can.skin} ${g.can.bg} != ${w.can})`
          : !ok('locked') ? `THE UNAFFORDABLE CHIP IS NOT THE GAME'S LOCKED COLOUR (${g.locked.skin} ${g.locked.bg} != ${w.locked})`
          : !out.restored ? 'NOT RESTORED'
          : `all three on ${l}: ${w.bought} / ${w.can} / ${w.locked}`;
        return out;
      });
      row.threeWayOk = !/IS NOT|VANISHED|NOT RESTORED/.test(row.threeWay.verdict);

      // --- U6 leg I2: THE COUNTER'S THREE STATES, AND THE ACTION ROW'S TWO, CONSTRUCTED ------------------------
      // ⚖ the user's table (docs/mobile.md, "The counters wear colours too"). ⛔ THE DISCRIMINATOR IS THE SAME
      // ONE U5 had to construct, for the same reason: no state of any game on the roster shows an upgrades counter
      // green, red and layer-coloured at once, so a check that only asked "does the counter have a colour" would
      // pass a build that painted every counter the layer colour. The three are FORCED here, on one card, by the
      // same two levers leg I uses — `player[l].upgrades` and the engine's own `canAffordUpgrade`.
      // ⚠ AN ACTION BUTTON HAS ONLY TWO STATES, and that is not a weaker check: the row's membership is "unlocked
      // and not yet bought", so a button is never `bought`. Both of the two it CAN wear are asserted here, against
      // the same colours the chips are judged by.
      row.counterWay = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui) return { verdict: 'abstains (no layerListUI)' };
        ui.open();
        const NOBG = 'rgba(0, 0, 0, 0)';
        const measure = (fn) => {
          try {
            const e = document.createElement('span');
            e.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;visibility:hidden';
            fn(e);
            document.body.appendChild(e);
            const v = String(getComputedStyle(e).backgroundColor || '');
            document.body.removeChild(e);
            return v || NOBG;
          } catch (err) { return NOBG; }
        };
        const box = (l, kind) => document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-counter[data-kind="${kind}"]`);
        const read = (l, kind) => { const e = box(l, kind); return e ? { skin: e.dataset.skin || '', bg: String(getComputedStyle(e).backgroundColor || ''), text: e.querySelector('.tmt-layerlist-counter-value').textContent } : null; };
        const actsOf = (l) => [...document.querySelectorAll(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-act[data-kind="upgrades"]`)]
          .filter((e) => (e.dataset.layer || l) === l)
          .map((e) => ({ id: e.dataset.cid, skin: e.dataset.skin || '', afford: e.dataset.afford, bg: String(getComputedStyle(e).backgroundColor || '') }));
        let target = null;
        for (const l of ui.cards()) {
          if (!box(l, 'upgrades')) continue;
          const ids = [...document.querySelectorAll(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-chip[data-kind="upgrades"]`)]
            .filter((e) => (e.dataset.layer || l) === l && e.dataset.state !== 'pseudo').map((e) => e.dataset.cid);
          if (ids.length >= 2) { target = { l, ids }; break; }
        }
        if (!target) return { verdict: 'abstains (no card draws an upgrades counter over two or more unlocked upgrade chips)' };
        const visible = (() => { try { return new Function('return typeof canAffordUpgrade === "function" && canAffordUpgrade === window.canAffordUpgrade')(); } catch (e) { return false; } })();
        if (!visible) return { layer: target.l, visible, verdict: 'abstains (the engine keeps canAffordUpgrade off `window`, so affordability cannot be constructed)' };
        const l = target.l, A = target.ids[0], B = target.ids[1];
        const had = (player[l].upgrades || []).slice();
        const orig = window.canAffordUpgrade;
        const before = read(l, 'upgrades');
        let out;
        try {
          const want = { bought: measure((e) => { e.className = `${l} upg bought`; }),
            can: measure((e) => { e.style.backgroundColor = String(tmp[l].color || ''); }),
            locked: measure((e) => { e.className = `${l} upg locked`; }) };
          // 1. EVERY upgrade the layer declares is bought — whatever the tab draws, x === y
          const all = Object.keys((layers[l] || {}).upgrades || {}).filter((k) => !isNaN(k)).map(Number);
          player[l].upgrades = all;
          window.canAffordUpgrade = function () { return false; };
          ui.refresh();
          const gBought = read(l, 'upgrades');
          // 2. none bought, and nothing affordable
          player[l].upgrades = [];
          ui.refresh();
          const gLocked = read(l, 'upgrades'), aLocked = actsOf(l);
          // 3. none bought, exactly one affordable — and the action row now holds one of each
          window.canAffordUpgrade = function (ll, id) { return String(ll) === String(l) && String(id) === String(A); };
          ui.refresh();
          const gCan = read(l, 'upgrades'), aMixed = actsOf(l);
          out = { layer: l, ids: [A, B], visible, want, got: { bought: gBought, can: gCan, locked: gLocked },
            acts: { none: aLocked.slice(0, 4), mixed: aMixed.slice(0, 4) } };
        } finally {
          player[l].upgrades = had;
          window.canAffordUpgrade = orig;
          ui.refresh();
        }
        const after = read(l, 'upgrades');
        out.restored = !!before && !!after && before.skin === after.skin && before.bg === after.bg && before.text === after.text;
        const w = out.want, g = out.got;
        const distinct = new Set([w.bought, w.can, w.locked]).size === 3;
        const ok = (k) => g[k] && g[k].skin === k && g[k].bg === w[k];
        // the action row under construction 3: the affordable one lit and wearing the layer's colour, at least one
        // other grey and wearing the game's `locked` red
        const lit = out.acts.mixed.find((x) => String(x.id) === String(A));
        const grey = out.acts.mixed.find((x) => String(x.id) !== String(A));
        out.verdict = !g.bought || !g.can || !g.locked ? 'THE COUNTER VANISHED UNDER THE CONSTRUCTION'
          : !distinct ? `abstains (the game paints the three states ${JSON.stringify([w.bought, w.can, w.locked])} — not three colours)`
          : !ok('bought') ? `ALL BOUGHT IS NOT THE GAME'S BOUGHT COLOUR (${g.bought.skin} ${g.bought.bg} != ${w.bought}, text ${g.bought.text})`
          : !ok('locked') ? `NOTHING AFFORDABLE IS NOT THE GAME'S LOCKED COLOUR (${g.locked.skin} ${g.locked.bg} != ${w.locked}, text ${g.locked.text})`
          : !ok('can') ? `SOMETHING AFFORDABLE IS NOT THE LAYER'S OWN COLOUR (${g.can.skin} ${g.can.bg} != ${w.can}, text ${g.can.text})`
          : !lit || !grey ? `abstains (the action row held ${out.acts.mixed.length} upgrade buttons under the construction)`
          : lit.skin !== 'can' || lit.bg !== w.can || lit.afford !== 'yes' ? `THE AFFORDABLE ACTION BUTTON IS NOT THE LAYER'S OWN COLOUR (${lit.skin} ${lit.bg} afford=${lit.afford})`
          : grey.skin !== 'locked' || grey.bg !== w.locked || grey.afford !== 'no' ? `THE UNAFFORDABLE ACTION BUTTON IS NOT THE GAME'S LOCKED COLOUR (${grey.skin} ${grey.bg} afford=${grey.afford})`
          : !out.restored ? 'NOT RESTORED'
          : `all three on ${l}: ${w.bought} / ${w.can} / ${w.locked}, and the action row lit ${lit.bg} / grey ${grey.bg}`;
        return out;
      });
      row.counterWayOk = !/IS NOT|VANISHED|NOT RESTORED/.test(row.counterWay.verdict);

      // --- U6 leg I3: A MILESTONE COUNTER, RED WITH ONE UNEARNED AND GREEN WITH ALL EARNED ---------------------
      // ⚖ user, verbatim (2026-09-19): "Unearned milestones and achievements are displayed in red in the main view
      // and earned ones are displayed in green. And so we should use green and red, not layer colors." Both halves
      // are driven, because the rule that matters is the RED one — a build that painted a milestone counter the
      // layer colour would be green on any check that only looked at the all-earned case.
      // ⚠ The lever is the engine's own `hasMilestone`, replaced the same way `canAffordUpgrade` is above, and the
      // leg abstains where the engine keeps it off `window`.
      row.msCounter = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui) return { verdict: 'abstains (no layerListUI)' };
        ui.open();
        const NOBG = 'rgba(0, 0, 0, 0)';
        const measure = (cls) => {
          try {
            const e = document.createElement('span');
            e.className = cls;
            e.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;visibility:hidden';
            document.body.appendChild(e);
            const v = String(getComputedStyle(e).backgroundColor || '');
            document.body.removeChild(e);
            return v || NOBG;
          } catch (err) { return NOBG; }
        };
        const box = (l) => document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-counter[data-kind="milestones"]`);
        const read = (l) => { const e = box(l); return e ? { skin: e.dataset.skin || '', bg: String(getComputedStyle(e).backgroundColor || ''), text: e.querySelector('.tmt-layerlist-counter-value').textContent } : null; };
        let l = null;
        for (const x of ui.cards()) if (box(x)) { l = x; break; }
        if (!l) return { verdict: 'abstains (no card draws a milestones counter at this state)' };
        const visible = (() => { try { return new Function('return typeof hasMilestone === "function" && hasMilestone === window.hasMilestone')(); } catch (e) { return false; } })();
        if (!visible) return { layer: l, visible, verdict: 'abstains (the engine keeps hasMilestone off `window`, so the earned state cannot be constructed)' };
        const orig = window.hasMilestone, before = read(l);
        let out;
        try {
          const want = { bought: measure('milestoneDone') || NOBG, locked: measure('milestone') || NOBG };
          window.hasMilestone = function () { return true; };
          ui.refresh();
          const all = read(l);
          window.hasMilestone = function () { return false; };
          ui.refresh();
          const none = read(l);
          out = { layer: l, visible, want, got: { bought: all, locked: none } };
        } finally { window.hasMilestone = orig; ui.refresh(); }
        const after = read(l);
        out.restored = !!before && !!after && before.skin === after.skin && before.bg === after.bg && before.text === after.text;
        const w = out.want, g = out.got;
        const ok = (k) => g[k] && g[k].skin === k && g[k].bg === w[k];
        out.verdict = !g.bought || !g.locked ? 'THE COUNTER VANISHED UNDER THE CONSTRUCTION (the tab hides what the construction earned)'
          : w.bought === w.locked ? `abstains (the game paints earned and unearned milestones the same: ${w.bought})`
          : !ok('bought') ? `ALL EARNED IS NOT GREEN (${g.bought.skin} ${g.bought.bg} != ${w.bought}, text ${g.bought.text})`
          : !ok('locked') ? `ONE UNEARNED IS NOT RED (${g.locked.skin} ${g.locked.bg} != ${w.locked}, text ${g.locked.text})`
          : !out.restored ? 'NOT RESTORED'
          : `green ${w.bought} with all earned, red ${w.locked} with none on ${l}`;
        return out;
      });
      row.msCounterOk = !/IS NOT|VANISHED|NOT RESTORED|NOT GREEN|NOT RED/.test(row.msCounter.verdict);
      // --- U2c leg E: THE LAYOUT HOLDS STILL AS THE DIGITS CHANGE ---------------------------------------------
      // At BOTH widths and in BOTH states, because U2d's counters and the amount readout are different numbers on
      // different rows and either can move the box. The probe writes the magnitudes itself (see DIGITS_PROBE for
      // why the two LOADS cannot answer this) and puts every readout back; `restored` is what says it did.
      const digitsAt = async (vp, label) => {
        await page.setViewportSize(vp);
        await page.waitForTimeout(150);
        const collapsed = await page.evaluate(DIGITS_PROBE);
        // the expanded state is toggled directly rather than clicked, for the same reason the divider check is
        // (a click is not a neutral probe, and the expander's handler does nothing else this leg needs)
        await page.evaluate(() => document.querySelectorAll('.tmt-layerlist-card').forEach((c) => c.classList.add('tmt-layerlist-expanded')));
        const expanded = await page.evaluate(DIGITS_PROBE);
        await page.evaluate(() => { document.querySelectorAll('.tmt-layerlist-card').forEach((c) => c.classList.remove('tmt-layerlist-expanded')); const ui = window.tmtLoader.layerListUI; if (ui) ui.refresh(); });
        return { at: label, vw: vp.width, collapsed, expanded };
      };
      await page.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui) ui.open(); });
      const digits = [await digitsAt(PHONE, 'phone'), await digitsAt(DESKTOP, 'desktop')];
      await page.setViewportSize(PHONE);
      await page.waitForTimeout(150);
      const dBad = digits.flatMap((d) => [d.collapsed, d.expanded].flatMap((x, i) => (x.moved || x.counterMoved ? (x.sample || []).concat(x.counterSample || []).map((m) => `${d.at}/${i ? 'expanded' : 'collapsed'} ${m}`) : [])));
      row.digits = {
        cards: digits[0].collapsed.cards, amounts: digits[0].collapsed.amounts, counters: digits[0].collapsed.counters,
        magnitudes: digits[0].collapsed.magnitudes,
        moved: digits.map((d) => `${d.at} ${d.collapsed.moved}/${d.expanded.moved}`).join(' '),
        counterMoved: digits.map((d) => `${d.at} ${d.collapsed.counterMoved}/${d.expanded.counterMoved}`).join(' '),
        bad: dBad.slice(0, 4),
        restored: digits.every((d) => d.collapsed.restored && d.expanded.restored),
        verdict: !digits[0].collapsed.amounts ? 'abstains (no card carries a readout)'
          : dBad.length ? 'THE BOX MOVED WITH THE DIGITS'
          : !digits.every((d) => d.collapsed.restored && d.expanded.restored) ? 'NOT RESTORED'
          : 'unchanged over every magnitude, at both widths, in both states' };
      row.digitsOk = !/MOVED|NOT RESTORED/.test(row.digits.verdict);


      // --- U7 leg L: THE RESET BLOCK'S HEIGHT DOES NOT ANSWER TO THE PRESTIGE STRING ---------------------------
      // ⚖ "the 'Reset for +1 boosters' text can take up either one line or two, causing the layout to flicker …
      // make it always two lines" (user, 2026-09-19). Leg E above cannot see this: it writes the AMOUNT readout
      // and holds every other string still, and the prestige text is a different readout on a different row.
      //
      // ⚠ THE THREE STRINGS ARE THE GAME'S OWN, not a literal of the gate's. For each card the leg takes the
      // engine's CURRENT prestige string and derives two more from it:
      //   · GROWN — every run of digits replaced by a much longer one (the same string at a much later save);
      //   · FLIPPED — the OTHER shape: a string whose second half the engine dropped gets one, and one that has a
      //     second half loses it.
      // The flipped variant is the half a wrap-only check cannot see, and on a `normal` layer it is not a
      // hypothetical: `prestigeButtonText` drops the whole second part once `resetGain.gte(100)` or
      // `points.gte(1e3)`, so the card really does go from two lines to one as the game is played. MEASURED on
      // `ptr` at its deep snapshot: `p` and `e` are `normal` layers rendering an EMPTY second line right now.
      //
      // ⚠ IT WRITES `tmp`, NOT `player`, and puts it back — `restored` is what says it did. The list reads
      // `tmp[l].prestigeButtonText` first (2.2.1 keeps one there; on 2.7 the key does not exist and writing it is
      // what makes the same path testable), the page is `?managed=1` so the engine's own loop cannot overwrite it
      // between the write and the measurement, and the state hash is taken across the whole leg.
      const resetH = await page.evaluate(async () => {
        const ui = window.tmtLoader.layerListUI;
        const h0 = await tmtLoader.hash();
        const cards = [...document.querySelectorAll('.tmt-layerlist-card')].filter((c) => c.querySelector('.tmt-layerlist-reset'));
        const BREAK = /(?:<br\s*\/?>\s*)+/i;
        // ⚠ THE GROWN STRING USES THE WIDEST MAGNITUDE `format()` REACHES, which is leg E's own vocabulary
        // (`1.111e3,284`, 11 characters, measured in this arc as the widest TMT prints even at e3284) and not an
        // arbitrarily long literal: a number nobody's `format()` can produce would only be measuring word wrap.
        const grow = (x) => x.replace(/\d[\d,.]*(?:e[\d,]+)?/gi, '1.111e3,284');
        // ⚠ and the flipped string's second half is SHORT on purpose — the claim is that the ROW EXISTS whether
        // or not the engine filled it, so the variant must not smuggle in a wrap of its own.
        const flip = (x) => { const m = BREAK.exec(x); return m ? x.slice(0, m.index) : x + '<br><br>Req: 5 / 10 pts'; };
        const box = (c) => {
          const b = c.querySelector('.tmt-layerlist-reset');
          const ls = [...b.querySelectorAll('.tmt-layerlist-resetline')];
          const lh = parseFloat(getComputedStyle(b).lineHeight) || 0;
          return { reset: +b.getBoundingClientRect().height.toFixed(2),
            card: +c.getBoundingClientRect().height.toFixed(2),
            lines: ls.length, lh: +lh.toFixed(2),
            // the per-half height AND how many line boxes it is, so a half that genuinely needs a second line is
            // distinguishable from a half whose box moved
            hs: ls.map((e) => +e.getBoundingClientRect().height.toFixed(2)),
            rows: lh > 0 ? ls.map((e) => Math.round(e.getBoundingClientRect().height / lh)) : [] };
        };
        const rows = [], notRestored = [];
        for (const c of cards) {
          const l = c.dataset.layer;
          const had = Object.prototype.hasOwnProperty.call(tmp[l], 'prestigeButtonText');
          const was = had ? tmp[l].prestigeButtonText : undefined;
          const split = ui.resetLines(l);
          const base = (split[0] + (split[1] ? '<br><br>' + split[1] : ''));
          const type = String((tmp[l] || {}).type || '');
          const emptyL2 = !split[1];
          const at = (x) => { tmp[l].prestigeButtonText = x; ui.refresh(); return box(c); };
          // ⚠ the baseline is the card BEFORE anything was written, and the restore is judged against THAT rather
          // than against the leg's own reconstruction of the string — the two can differ legitimately (a third
          // `<br>` inside the second half collapses to a space), and a restore check keyed to the reconstruction
          // would report a difference that is the leg's and not the page's.
          const before = box(c);
          const a = at(base), b = at(grow(base)), d = at(flip(base));
          if (had) tmp[l].prestigeButtonText = was; else delete tmp[l].prestigeButtonText;
          ui.refresh();
          const back = box(c);
          if (Math.abs(back.reset - before.reset) > 0.5 || Math.abs(back.card - before.card) > 0.5) notRestored.push(l);
          rows.push({ layer: l, type, emptyL2, base: a, grown: b, flipped: d, back, before });
        }
        const h1 = await tmtLoader.hash();
        return { rows, notRestored, hashBefore: h0, hashAfter: h1, stateMoved: h0 !== h1 };
      });
      {
        const MOVE = 0.5;   // the same sub-pixel tolerance leg E uses; the unfixed build moves this by a whole line
        const bad = [], multiLine = [], grownWrap = [];
        let judged = 0;
        for (const r of resetH.rows) {
          const lh = r.base.lh;
          // ⛔ NO LINE ELEMENTS AT ALL is the split reverted: the button is one run of text again, and this leg
          // cannot measure a half that does not exist. It is a failure here, named, as well as in the probe.
          if (r.base.lines !== 2 || !(lh > 0)) { bad.push(`${r.layer}(${r.type}) has ${r.base.lines} line element(s), not 2`); continue; }
          // ---- THE RESERVATION, in all three states, and it NEVER abstains. This is item 1's actual claim — the
          // second row is there whether or not the engine filled it — and it is what a build that collapsed an
          // empty second line breaks, on the card where the engine emitted none (`normal` past `resetGain` 100)
          // in the base state and on EVERY card in the flipped one.
          for (const [label, st] of [['base', r.base], ['grown', r.grown], ['flipped', r.flipped]]) {
            if (st.lines !== 2) { bad.push(`${r.layer}(${r.type}) ${label}: ${st.lines} line element(s), not 2`); continue; }
            for (let i = 0; i < 2; i++) {
              if (st.hs[i] < lh - MOVE) bad.push(`${r.layer}(${r.type}${r.emptyL2 ? ',emptyL2' : ''}) ${label}: line ${i + 1} is ${st.hs[i]}px, under one line box (${lh})`);
            }
          }
          // ---- THE HEIGHT COMPARISONS, and ⚠ they are only meaningful while each half is a SINGLE line box.
          // MEASURED on `the-cultree`'s `g` and `sorbet-s-convolution-mainframe`'s `universe`, which reddened the
          // first version of this leg: a half that ALREADY WRAPS is not a fixed number of pixels tall, because the
          // engines' prestige strings carry `<b>` and the line box holding it is taller than the others — so
          // re-wrapping the same words moves the total (66.5 → 63.75) with the line COUNT unchanged, and removing
          // a two-line half removes two lines where the flipped variant's short replacement is one (66.5 → 49.25).
          // Neither is the bug. Those cards keep the reservation check above and abstain from the two comparisons.
          if (r.base.rows[0] !== 1 || r.base.rows[1] !== 1) { multiLine.push(`${r.layer}(${r.type}) ${r.base.rows.join('+')} line boxes`); continue; }
          judged++;
          // GROWN: the same string at a much later save. A half whose line-box count ROSE really does need the
          // extra line (the string got longer than the card is wide) and that card abstains from this half — the
          // promise is one line box per half, never that prose cannot wrap.
          if (r.grown.rows[0] !== 1 || r.grown.rows[1] !== 1) grownWrap.push(`${r.layer}(${r.type}) 1+1\u2192${r.grown.rows.join('+')}`);
          else if (Math.abs(r.grown.reset - r.base.reset) > MOVE) bad.push(`${r.layer}(${r.type}) GROWN ${r.base.reset}\u2192${r.grown.reset}`);
          // FLIPPED: the other shape entirely — a second half where the engine emitted none, or none where it
          // did. Its replacement is short on purpose, so on a card whose halves are one line box each the height
          // cannot move for any reason but the row itself appearing or disappearing.
          if (Math.abs(r.flipped.reset - r.base.reset) > MOVE) bad.push(`${r.layer}(${r.type}${r.emptyL2 ? ',emptyL2' : ''}) FLIPPED ${r.base.reset}\u2192${r.flipped.reset}`);
        }
        const flippedWitness = resetH.rows.filter((r) => r.emptyL2);
        row.resetHeight = {
          cards: resetH.rows.length, judged, types: [...new Set(resetH.rows.map((r) => r.type))],
          // ⚠ the cards whose SECOND HALF THE ENGINE DOES NOT EMIT right now — the only ones on which the
          // RESERVATION check fails in the BASE state under a build that collapsed an empty second row, and
          // therefore the only ones that make that half of the mutant non-vacuous here. The flipped state judges
          // the same claim on every card.
          emptyL2: flippedWitness.map((r) => `${r.layer}:${r.type}`),
          normalCards: resetH.rows.filter((r) => r.type === 'normal').length,
          staticCards: resetH.rows.filter((r) => r.type === 'static').length,
          lineHeight: resetH.rows.length ? resetH.rows[0].base.lh : null,
          multiLine: multiLine.slice(0, 4), multiLineCards: multiLine.length,
          grownWrapped: grownWrap.slice(0, 4), grownWrappedCards: grownWrap.length,
          bad: bad.slice(0, 4),
          restored: resetH.notRestored.length === 0, notRestored: resetH.notRestored,
          stateMoved: resetH.stateMoved, hash: resetH.hashAfter,
          verdict: !resetH.rows.length ? 'abstains (no card on this game has a prestige button)'
            : bad.length ? 'THE RESET BLOCK MOVED WITH THE STRING'
            : resetH.notRestored.length ? 'NOT RESTORED'
            : `two reserved line boxes on all ${resetH.rows.length} card(s) in all three states (${resetH.rows.filter((r) => r.type === 'static').length} static, ${resetH.rows.filter((r) => r.type === 'normal').length} normal); ${flippedWitness.length} render an EMPTY second line today; the height comparisons judged ${judged}, ${multiLine.length} card(s) abstained for a half that already wraps and ${grownWrap.length} for a real wrap under the grown string`,
        };
        row.resetHeightOk = !/MOVED|NOT RESTORED/.test(row.resetHeight.verdict);
      }

      // --- U7 leg M: A FULL RENDER WRITES NOTHING, WITH THE NEW READERS IN IT ----------------------------------
      // ⛔ The standing constraint (the list writes NOTHING to `player`) is most at risk here: item 2 evaluates
      // the layers' OWN display functions and item 3 reads their costs, both of which are game code. `layersInert`
      // above measures the hash across OPENING the panel; this one measures it across an explicit `refresh()` with
      // the panel already open, which is the pass those two readers ride on, repeated so a single quiet tick
      // cannot pass for stillness. Same abstention rule: a page that will not repeat its own hash cannot judge.
      row.renderInert = await page.evaluate(async () => {
        const ui = window.tmtLoader.layerListUI;
        const h = () => tmtLoader.hash();
        ui.open();
        const c0 = await h(), c1 = await h();
        const before = await h();
        for (let i = 0; i < 5; i++) ui.refresh();
        const after = await h();
        const stable = c0 === c1;
        return { stable, before, after, ok: !stable || before === after,
          verdict: !stable ? 'the page does not repeat its own hash (abstains)' : before === after ? 'unchanged' : 'MOVED' };
      });
      row.renderInertOk = !!row.renderInert.ok;

      // --- U7 leg N: A COST IN SEVERAL CURRENCIES IS SKIPPED, CONSTRUCTED ---------------------------------------
      // ⚠ `multiRes` — a cost in SEVERAL currencies at once, where `cost` itself is `undefined`. Four games on the
      // roster declare it (`ptr`, `prestige-tree-ng`, `prestige-tree-rewritten-unsoftcapped4`,
      // `the-extended-tree`); a `x / y` row has no meaning for one, so the list skips it and records why.
      // ⛔ IT HAS TO BE CONSTRUCTED. `ptr` declares its own on the `hn` layer, which is reachable in NO recorded
      // snapshot state on the roster — so a leg that waited for a real one would be an abstention on every game
      // and the "render it instead of skipping it" mutant would stay green everywhere. The leg puts one on the
      // component the card has ALREADY CHOSEN, which is what makes the effect visible: the chosen row must either
      // name a different component (there were others) or disappear (there were not).
      // ⚠ It writes `tmp`, never `player`, and puts it back; `restored` is the row coming back unchanged.
      row.multiRes = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        const one = (l) => ui.progress(l).rows.find((g) => g.kind === 'upgrades' || g.kind === 'buyables');
        let l = null, g = null;
        for (const c of ui.cards()) { const r = one(c); if (r) { l = c; g = r; break; } }
        if (!l) return { verdict: 'abstains (no card on this game shows an upgrade or buyable progress row)' };
        const t = tmp[g.layer][g.kind][g.id];
        // ⚠ BOTH SIDES, and this is the half the first version of this leg missed: the list reads `cost` through
        // `numFieldOf`, which falls back to the DECLARATION when `tmp` holds nothing — and a declared `cost()` is a
        // function, so clearing tmp alone left the real cost in place and the construction did nothing at all. A
        // component that really declares `multiRes` declares no `cost` on either side, which is what this makes.
        const d = layers[g.layer][g.kind][g.id];
        const hadCost = Object.prototype.hasOwnProperty.call(t, 'cost'), wasCost = t.cost;
        const hadDCost = Object.prototype.hasOwnProperty.call(d, 'cost'), wasDCost = d.cost;
        const hadMulti = Object.prototype.hasOwnProperty.call(t, 'multiRes'), wasMulti = t.multiRes;
        const key = (r) => (r ? `${r.kind}/${r.layer}/${r.id}` : null);
        const before = key(g);
        t.cost = undefined;
        delete d.cost;
        t.multiRes = [{ cost: new Decimal(1) }, { currencyDisplayName: 'prestige points', currencyInternalName: 'points', currencyLayer: l, cost: new Decimal(1) }];
        ui.refresh();
        const p2 = ui.progress(l);
        const after = key(p2.rows.find((r) => r.kind === g.kind));
        const dropped = p2.dropped.filter((d) => d.kind === g.kind && d.why === 'multiRes');
        // the RENDERED row too, not only the API: the mutant this leg exists for changes what is on the card
        const rendered = [...document.querySelectorAll(`.tmt-layerlist-card[data-layer="${CSS.escape(l)}"] .tmt-layerlist-prog`)]
          .map((e) => `${e.dataset.kind}/${e.dataset.layer}/${e.dataset.cid}`);
        if (hadCost) t.cost = wasCost; else delete t.cost;
        if (hadDCost) d.cost = wasDCost; else delete d.cost;
        if (hadMulti) t.multiRes = wasMulti; else delete t.multiRes;
        ui.refresh();
        const back = key(ui.progress(l).rows.find((r) => r.kind === g.kind));
        return { layer: l, kind: g.kind, id: g.id, candidates: g.candidates, before, after, back, rendered,
          dropped: dropped.length, restored: back === before,
          // with more than one candidate the row must name a DIFFERENT component; with only one it must go
          skipped: g.candidates > 1 ? (after !== null && after !== before) : after === null,
          notRendered: rendered.indexOf(before) < 0 };
      });
      row.multiResOk = !row.multiRes.verdict
        ? !!(row.multiRes.skipped && row.multiRes.dropped > 0 && row.multiRes.notRendered && row.multiRes.restored)
        : true;   // an abstention is not a failure, and the verdict says so out loud


      // --- U2c leg F: THE CARD THE PLAYER LEFT OPEN COMES BACK OPEN -------------------------------------------
      // ⚠ IT RUNS LAST, AFTER EVERYTHING THAT MOVES THE GAME, and that is a MEASURED choice rather than an
      // accident of where it was written. The leg needs a card with an expander to change, and a card only has one
      // once its layer draws something: run before the 3,000 ticks and the reset press, this leg ABSTAINS on 5 of
      // the 10 games this slice drove (`layer-tree`, `the-numbruh-tree`, `the-tearonq-…`, `the-burning-tree`,
      // `the-mana-tree` — every one of them a fresh save with nothing unlocked yet), and it judges all 10 here.
      // ⚠ The cost is that the save it writes is a MID-GAME one, and one game cannot read its own: MEASURED on
      // `the-broken-tree`, whose `load()` dies with `points is not defined` in its own `js/mod.js` from this
      // state, although it boots the save it writes three ticks in. That is the GAME's, not the mode's, so a
      // read-back page whose LOADER reports an error abstains, naming the message, instead of reddening.
      // ⚠ THE DISCRIMINATOR. A card is CHANGED before the reload and a second one is left alone: asserting that a
      // default-closed card is still closed passes with no persistence at all. The state is set through the API,
      // which is the chevron's own path, because a click is not a neutral probe.
      // The read-back is a SECOND PAGE in the same context rather than a reload of this one: same origin, same
      // localStorage, same save — and this page's own request record (which the load verdict below judges) is left
      // as the leg found it.
      const pref0 = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        const raw = tmtLoader.storage.raw, keys = [];
        for (let i = 0; i < raw.length.call(localStorage); i++) keys.push(raw.key.call(localStorage, i));
        const withMore = [...document.querySelectorAll('.tmt-layerlist-card')].filter((c) => c.querySelector('.tmt-layerlist-more'));
        // prefer a card whose action row the phone had to CUT: a card built OPEN hides that row, and a hidden row
        // has no layout to measure, so it is the one that says whether the fit is paid when the card closes again
        const cut = withMore.find((c) => c.querySelectorAll('.tmt-layerlist-act').length > c.querySelectorAll('.tmt-layerlist-act:not(.tmt-layerlist-nofit)').length);
        const target = cut || withMore[0] || null;
        const key = ui.prefKey ? ui.prefKey() : null;
        return { key, stored: key ? raw.getItem.call(localStorage, key) : null, expanded: ui.expanded ? ui.expanded() : null,
          keys, cards: withMore.length, cut: cut ? cut.dataset.layer : null,
          target: target ? target.dataset.layer : null,
          control: (withMore.find((c) => c !== target) || {}).dataset ? withMore.find((c) => c !== target).dataset.layer : null };
      });
      let persist = { cards: pref0.cards, target: pref0.target, control: pref0.control, cut: pref0.cut,
        firstLoad: { stored: pref0.stored, expanded: pref0.expanded } };
      if (!pref0.target) {
        persist.verdict = 'abstains (no card on this game has an expander)';
      } else {
        const wrote = await page.evaluate((t) => {
          const ui = window.tmtLoader.layerListUI, raw = tmtLoader.storage.raw;
          const on = ui.expand(t, true), keys = [];
          for (let i = 0; i < raw.length.call(localStorage); i++) keys.push(raw.key.call(localStorage, i));
          return { on, keys, stored: ui.prefKey() ? raw.getItem.call(localStorage, ui.prefKey()) : null };
        }, pref0.target);
        // ⚠ THE SECOND MUTANT: a store keyed WITHOUT the game id. localStorage is per ORIGIN and every game is
        // served from the same one, so the prefix is the only thing keeping two games apart — a key outside it is
        // a key both games read. Asserted mechanically: every key this write added is in THIS game's namespace.
        persist.wrote = { stored: wrote.stored, newKeys: wrote.keys.filter((k) => !pref0.keys.includes(k)) };
        persist.keyOk = persist.wrote.newKeys.length > 0 && persist.wrote.newKeys.every((k) => k.startsWith(`tmt-loader:${id}:`));
        // ⚠ THE READ-BACK PAGE MUST BOOT ON THE STATE THAT SET THE PREFERENCE. This page is 3,000 ticks, a reset
        // press and a purchase past the save in `localStorage` — under `?managed=1` the autosave never ran — so on
        // a game with no recorded snapshot the second page booted a FRESH save and simply did not have the card.
        // MEASURED: the first CI sweep of this leg was RED on 7 games for exactly that (`layer-tree`,
        // `the-numbruh-tree`, `the-hyperdimensions-tree`, `the-tearonq-…`, `the-burning-tree`, `the-loop-tree`,
        // `the-mana-tree` — every one `present: false` or a card with no expander), and the bounded local set could
        // not see it because `ptr` and `something` are the two games that HAVE a snapshot, whose `loadFrom` had
        // already written it. The game's own `save()` is what makes the two pages the same game.
        persist.saved = await page.evaluate(() => { try { window.tmtLoader.save(); return true; } catch (e) { return false; } });
        const p2 = await context.newPage();
        // ⚠ A PROBE ON THE READ-BACK PAGE MAY NOT THROW THE WHOLE ROW. MEASURED on `the-broken-tree`: one
        // evaluate died with `layerListUI` undefined, the row went to the catch as an exception, and it lost
        // `geometryOk`, `navOk` and its load verdict — results it had ALREADY EARNED — to a leg that runs after
        // all of them. A probe that fails is a verdict about the probe, never an erasure of the row.
        const probe2 = async (fn, arg) => {
          try { return await p2.evaluate(fn, arg); } catch (e) {
            const why = String((e && e.message) || e).split('\n')[0].slice(0, 160);
            let diag = null;
            try {
              diag = await p2.evaluate(() => ({ ready: tmtLoader.ready, step: tmtLoader.step, navbar: tmtLoader.navbar,
                error: tmtLoader.error, ui: !!tmtLoader.layerListUI, panel: !!document.getElementById('tmt-layerlist'),
                loaded: tmtLoader.loaded.length, url: location.href.slice(-60), pageErrors: tmtLoader.pageErrors.slice(-2) }));
            } catch (e2) { diag = { unreachable: String((e2 && e2.message) || e2).slice(0, 120) }; }
            return { probeError: why, diag };
          }
        };
        const readBack = async (vp, label) => {
          await p2.setViewportSize(vp);
          await p2.goto(url, { waitUntil: 'load' });
          const rr = await waitReady(p2);
          if (!rr.ready) return { at: label, ready: false, error: rr.error || null };
          const back = await probe2(([t, c]) => {
            const ui = window.tmtLoader.layerListUI;
            ui.open();
            const card = document.querySelector(`.tmt-layerlist-card[data-layer="${t}"]`);
            const chev = card && card.querySelector('.tmt-layerlist-more');
            const ctl = c && document.querySelector(`.tmt-layerlist-card[data-layer="${c}"]`);
            return { expanded: ui.expanded(), present: !!card, expander: !!chev,
              open: !!card && card.classList.contains('tmt-layerlist-expanded'),
              aria: chev ? chev.getAttribute('aria-expanded') : null,
              controlOpen: !!ctl && ctl.classList.contains('tmt-layerlist-expanded'), controlPresent: !!ctl };
          }, [pref0.target, pref0.control]);
          // and closing it again pays the fit that a hidden row could not be measured for
          const refit = await probe2((t) => {
            const ui = window.tmtLoader.layerListUI;
            ui.expand(t, false);
            const c = document.querySelector(`.tmt-layerlist-card[data-layer="${t}"]`);
            if (!c) return null;
            const all = [...c.querySelectorAll('.tmt-layerlist-act')];
            const vis = all.filter((e) => !e.classList.contains('tmt-layerlist-nofit'));
            const lines = [...new Set(vis.map((e) => Math.round(e.getBoundingClientRect().top)))].length;
            ui.expand(t, true);   // left open for the next width's read-back
            return { offered: all.length, shown: vis.length, lines, prefix: vis.every((e, i) => e === all[i]) };
          }, pref0.target);
          return { at: label, ready: true, ...back, refit };
        };
        persist.back = [await readBack(PHONE, 'phone'), await readBack(DESKTOP, 'desktop')];
        const cleared = await probe2((t) => {
          const ui = window.tmtLoader.layerListUI, raw = tmtLoader.storage.raw;
          ui.expand(t, false);
          return { expanded: ui.expanded(), stored: ui.prefKey() ? raw.getItem.call(localStorage, ui.prefKey()) : null };
        }, pref0.target);
        persist.cleared = cleared;
        await p2.close();
        // ⚠ THE TWO FAILURES ARE NAMED APART. A card that came back closed and a card that came back open with an
        // unmeasured action row are different defects — the first is the persistence, the second is the fit pass
        // it broke — and a verdict that called both "NOT RESTORED" would send the next reader to the wrong file.
        // ⚠ A CARD THE READ-BACK PAGE DOES NOT DRAW IS AN ABSTENTION, NOT A FAILURE. The state a preference is
        // about is the card's expander, and a card that is absent — or present with nothing to expand, which is
        // what a layer with no drawn component is — carries no such state for the leg to read back. Judging it
        // would be blaming the persistence for the game. The CONTROL is still judged wherever it is drawn.
        const judged = (b) => b.present && b.expander && !b.probeError;
        const probeErrors = [...persist.back.filter((b) => b.probeError), cleared.probeError ? cleared : null]
          .filter(Boolean).map((b) => ({ at: b.at || 'close', why: b.probeError, diag: b.diag }));
        if (probeErrors.length) persist.probeErrors = probeErrors;
        const restoredAt = (b) => !!(b.open && b.aria === 'true' && !b.controlOpen);
        const fittedAt = (b) => !b.refit || (b.refit.prefix && b.refit.lines <= 1);
        persist.judged = persist.back.filter(judged).map((b) => b.at);
        persist.verdict = !(pref0.stored === null && pref0.expanded && pref0.expanded.length === 0) ? 'A FIRST LOAD WAS NOT CLEAN'
          : !persist.keyOk ? 'THE KEY IS NOT THIS GAME\'S'
          : !persist.back.every((b) => b.ready) ? (persist.back.find((b) => !b.ready && b.error)
              ? `abstains (the game does not boot the save this state writes: ${String((persist.back.find((b) => !b.ready && b.error).error || {}).message).slice(0, 80)})`
              : 'THE READ-BACK PAGE DID NOT LOAD')
          : probeErrors.length ? `THE READ-BACK PAGE LOST ITS LIST (${probeErrors[0].at}: ${probeErrors[0].why})`
          : !persist.back.some(judged) ? `abstains (the read-back page draws no expander on ${pref0.target})`
          : !persist.back.every((b) => !judged(b) || restoredAt(b)) ? 'NOT RESTORED AFTER THE RELOAD'
          : !persist.back.every((b) => !judged(b) || fittedAt(b)) ? 'THE REOPENED CARD\'S ACTION ROW WAS NEVER MEASURED'
          : cleared.stored !== null ? 'THE KEY SURVIVED CLOSING THE LAST CARD'
          : `restored at both widths (${pref0.target} open, ${pref0.control || 'no control card'} closed)`;
      }
      // ⚠ AND THE MAIN PAGE IS PUT BACK. The leg opens a card on THIS page to write the preference; every leg
      // after it reads the collapsed card (the fit pass skips an open one, and the two-row check judges rows an
      // open card hides), so a card left open here would silently change what they measure.
      if (pref0.target) await page.evaluate((t) => { const ui = window.tmtLoader.layerListUI; if (ui && ui.expand) ui.expand(t, false); }, pref0.target);
      row.persist = persist;
      row.persistOk = !/A FIRST LOAD|THE KEY|NOT RESTORED|DID NOT LOAD|SURVIVED|NEVER MEASURED|LOST ITS LIST/.test(persist.verdict);

      // --- U5 leg J: BACK RETURNS TO THE VIEW YOU CAME FROM -----------------------------------------------------
      // ⚖ "open a layer from the Layers list and Back should return you to the LIST, not the tree" (user,
      // 2026-09-19). Three steps, and the SECOND HALF is the one that fails on a build that sets the memory
      // unconditionally or never clears it:
      //   1. open the layer from the LIST, press the game's own back control → the list must be showing;
      //   2. open it from the list again and leave by the nav bar's TREE button → the memory must be gone;
      //   3. open the SAME layer from the TREE and press back → the list must NOT be showing.
      // ⚠ REAL CLICKS on the two controls that are under test (the card's open button and the engine's back), for
      // the same reason the tooltip tap leg uses a real tap: the claim is about what a press does. The tree node is
      // clicked where the engine gives it an id, and falls back to `showTab` — which is the same call the node
      // makes — naming which route it took, because a layer's `onClick` is the GAME's and need not open a tab.
      // ⚠ IT RUNS LAST, after the persistence leg: it navigates away from the list and changes `player.tab`, and
      // every leg above reads the card the list draws.
      row.back = await (async () => {
        const setup = await page.evaluate(() => {
          const ui = window.tmtLoader.layerListUI;
          if (!ui || !ui.cameFrom) return { candidate: null, why: 'the list does not expose cameFrom()' };
          ui.open();
          for (const l of ui.cards()) {
            if (document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-open`)) return { candidate: l, tab0: String(player.tab), cameFrom0: ui.cameFrom() };
          }
          return { candidate: null, why: 'no card has an open button' };
        });
        if (!setup.candidate) return { ...setup, verdict: `abstains (${setup.why})` };
        const L = setup.candidate;
        const look = () => page.evaluate(() => ({ tab: String(player.tab), open: window.tmtLoader.layerListUI.isOpen(), cameFrom: window.tmtLoader.layerListUI.cameFrom() }));
        // ⛔ EVERY PRESS IN THIS LEG IS BOUNDED. MEASURED (U6, 2026-09-19) on
        // `the-shenanigans-tree-rewritten`, whose own "Achievement Gotten!" toast sits over the overlay and
        // intercepts pointer events: an UNBOUNDED `page.click` spent Playwright's default 30 s, threw, and the row
        // lost EVERY leg after it — a green-looking roster with one row silently gutted. A press that could not
        // land is an ABSTENTION that names the interception: the leg did not press anything, so it must not pass
        // either. U6 bounded its own press and flagged this leg as carrying the same exposure; this is that fix.
        const clickBounded = async (sel) => {
          try { await page.click(sel, { timeout: 5000 }); return null; }
          catch (e) { return String((e && e.message) || e).split('\n')[0].slice(0, 140); }
        };
        const openFromList = async () => {
          const clickErr = await clickBounded(`.tmt-layerlist-card[data-layer="${L}"] .tmt-layerlist-open`);
          await page.waitForTimeout(120);
          return { ...(await look()), clickErr };
        };
        // the engine's own back control, whichever of the two names this game draws
        const pressBack = async () => {
          const sel = ['#app .back', '#app .other-back'];
          for (const x of sel) {
            const loc = page.locator(`${x}:visible`).first();
            if (await loc.count()) {
              // a LOCATOR click carries the same default 30 s as page.click — bound it identically
              try { await loc.click({ timeout: 5000 }); }
              catch (e) { return { pressed: null, clickErr: String((e && e.message) || e).split('\n')[0].slice(0, 140) }; }
              await page.waitForTimeout(150);
              return { pressed: x };
            }
          }
          return { pressed: null };
        };
        const fromList = await openFromList();
        if (fromList.clickErr) return { candidate: L, fromList, verdict: `abstains (the open button could not be pressed: ${fromList.clickErr})` };
        if (fromList.tab !== L) return { candidate: L, fromList, verdict: `abstains (the card's open button did not open ${L}: player.tab is ${fromList.tab})` };
        const pressed1 = await pressBack();
        if (!pressed1.pressed) return { candidate: L, fromList, verdict: pressed1.clickErr
          ? `abstains (the back control could not be pressed: ${pressed1.clickErr})`
          : 'abstains (the game draws no visible back control on this tab)' };
        const afterList = await look();

        // step 2: armed again, then left by the nav bar's Tree button — which is not a back press
        await page.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (!ui.isOpen()) ui.open(); });
        const armed = await openFromList();
        if (armed.clickErr) return { candidate: L, fromList, armed, verdict: `abstains (the open button could not be pressed a second time: ${armed.clickErr})` };
        const treeErr = await clickBounded('#tmt-navbar button[data-key="tree"]');
        if (treeErr) return { candidate: L, fromList, armed, verdict: `abstains (the nav bar's Tree button could not be pressed: ${treeErr})` };
        await page.waitForTimeout(120);
        const afterTree = await look();

        // step 3: the SAME layer, opened from the tree
        const route = await page.evaluate((l) => {
          const app = document.getElementById('app');
          const el = document.getElementById(l);
          if (el && app && app.contains(el) && el.tagName === 'BUTTON') { try { el.click(); } catch (e) { /* the game's own onClick */ } }
          if (String(player.tab) !== String(l)) { try { showTab(l); return 'showTab'; } catch (e) { return 'unreachable'; } }
          return 'node';
        }, L);
        await page.waitForTimeout(120);
        const fromTree = await look();
        let afterTreeBack = null, pressed2 = { pressed: null };
        if (fromTree.tab === L) { pressed2 = await pressBack(); afterTreeBack = await look(); }
        // put the page back where the leg found it
        await page.evaluate(() => { const ui = window.tmtLoader.layerListUI; if (ui.isOpen()) ui.close(); try { showTab('none'); } catch (e) {} });
        const r = { candidate: L, route, pressed: [pressed1.pressed, pressed2.pressed],
          fromList, afterList, armed, afterTree, fromTree, afterTreeBack };
        r.verdict = !afterList.open ? 'BACK FROM A LAYER OPENED IN THE LIST DID NOT RETURN TO THE LIST'
          : afterList.cameFrom !== null ? 'THE MEMORY SURVIVED THE BACK PRESS'
          : armed.cameFrom !== L ? `abstains (the second open did not re-arm the memory: ${armed.cameFrom})`
          : afterTree.cameFrom !== null ? 'THE MEMORY SURVIVED LEAVING BY THE TREE BUTTON'
          : fromTree.tab !== L ? `abstains (the tree route did not open ${L}: player.tab is ${fromTree.tab})`
          : fromTree.cameFrom !== null ? 'OPENING FROM THE TREE SET THE MEMORY'
          : !pressed2.pressed ? 'abstains (no visible back control after the tree route)'
          : afterTreeBack.open ? 'BACK FROM A LAYER OPENED IN THE TREE RETURNED TO THE LIST'
          : `the list after a list open, the tab (${afterTreeBack.tab}) after a tree open`;
        return r;
      })();
      row.backOk = !/DID NOT RETURN|SURVIVED|RETURNED TO THE LIST|OPENING FROM THE TREE SET/.test(row.back.verdict);

      // --- U6 leg K: PRESSING AN INACCESSIBLE LAYER DOES NOTHING AT ALL ----------------------------------------
      // ⚖ user, 2026-09-19. ⛔ THE DISCRIMINATOR IS THE OVERLAY, NOT THE TAB. Every engine's `showTab` already
      // begins `if (LAYERS.includes(name) && !layerunlocked(name)) return` — a silent no-op — so "player.tab did
      // not move" is GREEN on the unfixed build and asserts nothing. What the unfixed build did was hide the list
      // FIRST and find out afterwards, leaving the player looking at whatever tab was already open, and move U5's
      // remembered view to a tab that never opened. All three are asserted.
      // ⚠ AND A CONTROL, on the same page and through the same button: a build whose open button did nothing at
      // all would pass the half above. The control is a REACHABLE layer, which must still open.
      // ⚠ RUNS AFTER LEG J, which is the leg that leaves the page on the tree with the memory clear.
      row.locked = await (async () => {
        const setup = await page.evaluate(() => {
          const ui = window.tmtLoader.layerListUI;
          if (!ui || !ui.cameFrom) return { candidate: null, why: 'the list does not expose cameFrom()' };
          try { showTab('none'); } catch (e) { /* a game with no tree tab */ }
          ui.open(); ui.refresh();
          // the ENGINE's own predicate, asked HERE rather than of the list — it is the one that decides whether
          // the tab opens, and it is not the `player[l].unlocked` the card's greyed class reads
          const reach = (l) => { try { return typeof layerunlocked === 'function' ? !!layerunlocked(l) : !!(player[l] && player[l].unlocked); } catch (e) { return null; } };
          const has = (l) => !!document.querySelector(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-open`);
          const cards = ui.cards();
          const bad = cards.find((l) => reach(l) === false && has(l));
          const good = cards.filter((l) => reach(l) === true && has(l));
          // ⚠ CONSTRUCTED WHERE THERE IS NO NATURAL ONE, and on this roster that is the norm rather than the
          // exception: the two games with deep snapshots are swept AT them, where everything is unlocked, so the
          // leg would abstain on exactly the two games a bounded local set runs. The engine's own
          // `layerunlocked` is replaced with one that refuses a single layer — the same shape as the
          // `canAffordUpgrade` and `hasMilestone` constructions above, and it is the predicate BOTH the engine's
          // `showTab` and the list consult, so the constructed state is the real one.
          let constructed = null;
          if (!bad && good.length >= 2) {
            const vis = (() => { try { return new Function('return typeof layerunlocked === "function" && layerunlocked === window.layerunlocked')(); } catch (e) { return false; } })();
            if (vis) { constructed = good[0]; const orig = window.layerunlocked;
              window.tmtLoaderU6Restore = () => { window.layerunlocked = orig; };
              window.layerunlocked = function (n) { return String(n) === String(constructed) ? false : orig.apply(this, arguments); };
              ui.refresh(); }
          }
          return { candidate: bad || constructed, constructed: !!constructed, control: (bad ? good[0] : good[1]) || null,
            shown: cards.length, reach: cards.map((l) => `${l}:${reach(l)}`).slice(0, 12),
            tab0: String(player.tab), open0: ui.isOpen(), cameFrom0: ui.cameFrom(),
            why: bad ? null : (good.length < 2 ? 'fewer than two reachable layers to construct with'
              : 'no shown layer is inaccessible and the engine keeps layerunlocked off `window`') };
        });
        if (!setup.candidate) return { ...setup, verdict: `abstains (${setup.why})` };
        // ⚠ A REAL PRESS, BOUNDED, AND A FAILED PRESS IS AN ABSTENTION rather than an exception that costs the
        // whole row. MEASURED on `the-shenanigans-tree-rewritten`, where the game's own "Achievement Gotten!"
        // toast sits over the overlay and intercepts pointer events: an unbounded `page.click` spent 30 s and
        // threw, and the row lost every leg after this one. The leg must not PASS in that case either — it did
        // not press anything — so it says so.
        const clickOpen = async (l) => {
          try { await page.click(`.tmt-layerlist-card[data-layer="${l}"] .tmt-layerlist-open`, { timeout: 5000 }); return null; }
          catch (e) { return String(e && e.message || e).split('\n')[0].slice(0, 140); }
        };
        const clickErr = await clickOpen(setup.candidate);
        await page.waitForTimeout(150);
        const look = () => page.evaluate(() => ({ tab: String(player.tab), open: window.tmtLoader.layerListUI.isOpen(), cameFrom: window.tmtLoader.layerListUI.cameFrom() }));
        const after = await look();
        let ctl = null, ctlErr = null;
        if (!clickErr && setup.control && after.open) {
          ctlErr = await clickOpen(setup.control);
          await page.waitForTimeout(150);
          ctl = await look();
        }
        // put the page back where the leg found it — including the constructed predicate
        const restored = await page.evaluate(() => {
          const ui = window.tmtLoader.layerListUI;
          let back = null;
          if (typeof window.tmtLoaderU6Restore === 'function') { window.tmtLoaderU6Restore(); delete window.tmtLoaderU6Restore; back = true; }
          if (ui.isOpen()) ui.close(); else { ui.open(); ui.refresh(); ui.close(); }
          try { showTab('none'); } catch (e) {}
          return back;
        });
        const r = { candidate: setup.candidate, constructed: setup.constructed, restored, control: setup.control, shown: setup.shown, reach: setup.reach,
          tab0: setup.tab0, open0: setup.open0, cameFrom0: setup.cameFrom0, after, ctl, clickErr, ctlErr };
        r.verdict = clickErr ? `abstains (the card's open button could not be pressed: ${clickErr})`
          : ctlErr ? `abstains (the control's open button could not be pressed: ${ctlErr})`
          : !after.open ? 'THE OVERLAY CLOSED ON AN INACCESSIBLE LAYER'
          : after.tab !== setup.tab0 ? `THE TAB MOVED TO ${after.tab}`
          : after.cameFrom !== setup.cameFrom0 ? `THE REMEMBERED VIEW MOVED TO ${after.cameFrom}`
          : !setup.control ? 'abstains (no reachable layer on this page to control against)'
          : !ctl || ctl.tab !== setup.control ? `THE CONTROL DID NOT OPEN (${setup.control}: player.tab is ${ctl && ctl.tab})`
          : setup.constructed && !restored ? 'THE CONSTRUCTED PREDICATE WAS NOT RESTORED'
          : `nothing at all on ${setup.candidate}${setup.constructed ? ' (constructed)' : ''}; ${setup.control} still opens`;
        return r;
      })();
      row.lockedOk = !/CLOSED|MOVED|DID NOT OPEN|NOT RESTORED/.test(row.locked.verdict);

      // --- U8 leg P: WHAT GETS REMEMBERED, AND WHERE THE WRITE LANDS ------------------------------------------
      // Two claims a state-reading leg cannot make, both about the MOMENT OF WRITING, so the leg forgets the set
      // first and watches the very next render fill it:
      //  1. \u26d4 AN AMBIGUOUS ATTRIBUTION IS NEVER MADE PERMANENT. `collide` says two keys claimed the same printed
      //     number and the attribution between them is by `player[l]` key order ALONE; remembering one of those
      //     freezes a coin-flip forever, which is worse than the flicker this item removes. The withheld keys are
      //     NAMED \u2014 8 rows across the roster share a value at the swept states, so the filter has work to do.
      //     \u26a0 A leg that only read the store could not see this: the probe's own expectation reads the SAME store,
      //     so a build that remembered a collided key would move the expectation with it and stay green.
      //  2. \u26d4 THE WRITE GOES TO STORAGE, NOT TO `player`. Leg M measures a full render with the set already
      //     written, where a first-sight write does not happen at all \u2014 so it cannot see this either. Here the
      //     render right after the forget is the one that writes every key the game can attribute, and the state
      //     hash is taken across exactly that.
      row.resMem = await page.evaluate(async () => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui || !ui.forgetResources) return { verdict: 'abstains (the list does not expose forgetResources())' };
        const S = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
        ui.open(); ui.refresh();
        // the collided / unambiguous split, rebuilt here out of the list's OWN per-row report (`claimed` is the
        // occurrence it took, `collide` that another key took the same one) \u2014 never out of the store
        const rows = [];
        for (const l of ui.cards()) for (const r of ui.resources(l)) rows.push({ layer: l, ...r });
        const clean = rows.filter((r) => r.claimed !== null && !r.collide).map((r) => `${r.layer}.${r.key}`);
        const collided = rows.filter((r) => r.claimed !== null && r.collide).map((r) => `${r.layer}.${r.key}`);
        const flat = (m) => { const o = []; for (const l in m) for (const k of m[l]) o.push(`${l}.${k}`); return o.sort(); };
        const h = () => tmtLoader.hash();
        const c0 = await h(), c1 = await h();           // the same abstention rule leg M uses
        ui.forgetResources();
        const emptied = flat(ui.resourceMemory());
        const before = await h();
        ui.refresh();
        const after = await h();
        const mem = flat(ui.resourceMemory());
        const st = S(() => window.tmtLoader.storage, null);
        const key = st ? st.prefix + 'ui.layerlist.resources' : null;
        const stored = S(() => st.raw.getItem.call(localStorage, key), null);
        const kept = collided.filter((x) => mem.indexOf(x) >= 0);
        const missed = clean.filter((x) => mem.indexOf(x) < 0);
        const stable = c0 === c1;
        return { rows: rows.length, clean, collided, mem, emptied, withheld: collided.filter((x) => mem.indexOf(x) < 0),
          key, storedKeys: stored ? flat(JSON.parse(stored)) : [], inPlayer: before === after, stable,
          verdict: !stable ? 'the page does not repeat its own hash (abstains on the write-nothing half)'
            : before !== after ? 'THE MEMORY WRITE MOVED THE GAME STATE (it is not going to storage)'
            : emptied.length ? 'FORGETTING THE SET LEFT KEYS BEHIND'
            : kept.length ? `AN AMBIGUOUS ATTRIBUTION WAS REMEMBERED: ${kept.slice(0, 4).join(', ')}`
            : missed.length ? `AN UNAMBIGUOUS ONE WAS NOT: ${missed.slice(0, 4).join(', ')}`
            : !clean.length && !collided.length ? 'abstains (no card on this game attributes a resource at this state)'
            : `${mem.length} remembered, ${collided.length} withheld for an ambiguous attribution; the write moved no game state` };
      });
      row.resMemOk = !/^THE |^AN |^FORGETTING/.test(String(row.resMem.verdict));

      // --- U8 leg O: A RESOURCE ROW, ONCE SHOWN, SURVIVES A RESET ----------------------------------------------
      // \u26d4 THE WAY THIS LEG GOES VACUOUS, and it is the reason it is written as a DRIVEN one. 169 of the 171 games
      // are swept at a FRESH save, where every amount is zero, nothing attributes and there is no row to keep: a
      // leg that read a boot state would see the same thing on the fixed and the unfixed build and pass on both.
      // So it reaches a state where a resource IS attributed, DRIVES A RESET, and asserts the row is still there.
      //
      // \u26a0 THE RESET IS THE ENGINE'S OWN, and `doReset(l)` is NOT the call that clears l's own data: `rowReset`
      // resets a layer only for a resetting layer on a HIGHER row (`tmp[layer].row > tmp[lr].row`). So the leg
      // resets through the layer above where the tree has one \u2014 on `ptr` at M16 that is `doReset('q', true)`, which
      // takes `t.energy` 6.29e28 \u2192 0 \u2014 and falls back to the engine's own `layerDataReset(l)` where it does not.
      // `how` says which path ran, so a game that stops witnessing the real one is a change this reports.
      //
      // \u26a0 AND THE SECOND WAY IT GOES VACUOUS: if the value STILL attributes after the reset (a layer whose text
      // states a zero nothing else claims), the row would be there on the unfixed build too. The leg rebuilds the
      // occurrence budget itself, after the reset, and abstains by name when the key would have attributed anyway.
      //
      // \u26a0 IT RUNS LAST AND DOES NOT PUT THE GAME BACK. A real reset is not restorable by assignment, and every
      // other leg has already run; what it must not do is leave a FALSE row standing, which is why `afterValue`
      // asserts the surviving row prints `player[l][key]`'s value as it is NOW, not the string it had before.
      row.resSticky = await page.evaluate(() => {
        const ui = window.tmtLoader.layerListUI;
        if (!ui) return { verdict: 'abstains (no layerListUI)' };
        const S = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
        ui.open(); ui.refresh();
        // the probe's own attribution, rebuilt here rather than asked of the list
        const ENGINE_KEYS = { points: 1, best: 1, total: 1, unlocked: 1, resetTime: 1, forceTooltip: 1, noRespecConfirm: 1,
          buyables: 1, clickables: 1, spentOnBuyables: 1, upgrades: 1, milestones: 1, lastMilestone: 1, primeMiles: 1,
          achievements: 1, challenges: 1, grid: 1, prevTab: 1, activeChallenge: 1, subtabs: 1, infoboxes: 1 };
        const isDec = (v) => S(() => !!v && typeof v === 'object' && typeof v.toNumber === 'function', false);
        const F = (v, whole) => S(() => (whole ? String(formatWhole(v)) : String(format(v))), '');
        const countNum = (text, sub) => { if (!sub) return 0; let n = 0;
          for (let i = text.indexOf(sub); i >= 0; i = text.indexOf(sub, i + 1)) {
            if (i > 0 && /[0-9.,]/.test(text.charAt(i - 1))) continue;
            const a = text.charAt(i + sub.length);
            if (a && /[0-9.,eE]/.test(a)) continue;
            n++; }
          return n; };
        const attributed = (l) => {                       // {key: claimedString} for this layer, at this instant
          const pl = S(() => player[l], null), out = {};
          if (!pl) return out;
          const text = S(() => String(ui.resourceText(l)), '');
          if (!text) return out;
          const budget = Object.create(null);
          const take = (v) => { const forms = [F(v, false), F(v, true)];
            for (let i = 0; i < forms.length; i++) { const f = forms[i];
              if (!f || (i === 1 && f === forms[0])) continue;
              if (budget[f] === undefined) budget[f] = countNum(text, f);
              if (budget[f] > 0) { budget[f]--; return f; } }
            return null; };
          for (const k of ['points', 'best', 'total', 'spentOnBuyables']) { const v = S(() => pl[k], null); if (isDec(v)) take(v); }
          const seen = {};
          for (const k in pl) { if (ENGINE_KEYS[k]) continue; const v = S(() => pl[k], null); if (!isDec(v)) continue;
            const t = take(v); if (t !== null) { out[k] = t; seen[t] = (seen[t] || 0) + 1; } }
          for (const k in out) if (seen[out[k]] > 1) delete out[k];   // ambiguous: never remembered, never asserted
          return out;
        };
        const rowsOf = (l) => [...document.querySelectorAll(`.tmt-layerlist-card[data-layer="${CSS.escape(l)}"] .tmt-layerlist-resource`)]
          .map((e) => ({ key: e.dataset.key, text: e.querySelector('.tmt-layerlist-resource-value').textContent,
            sticky: e.dataset.sticky === 'yes' }));
        // the witness: a card showing a row for a key that is attributed UNAMBIGUOUSLY right now
        let layer = null, key = null;
        for (const l of ui.cards()) {
          const att = attributed(l), shown = rowsOf(l);
          const hit = shown.find((r) => att[r.key] !== undefined);
          if (hit) { layer = l; key = hit.key; break; }
        }
        if (!layer) return { cards: ui.cards().length,
          verdict: 'abstains (no card on this game attributes a resource unambiguously at this state \u2014 the fresh save of most of the roster)' };
        const before = rowsOf(layer).find((r) => r.key === key);
        const rowOf = (l) => S(() => Number(tmp[l].row), null);
        const mine = rowOf(layer);
        const above = ui.cards().find((x) => rowOf(x) !== null && mine !== null && rowOf(x) > mine && S(() => !!player[x].unlocked, false)) || null;
        let how = null, drove = null;
        if (above) { how = `doReset(${above}, true)`; drove = S(() => { doReset(above, true); return true; }, false); }
        else { how = `layerDataReset(${layer})`; drove = S(() => { layerDataReset(layer); return true; }, false); }
        S(() => updateTemp());
        ui.refresh();
        const att2 = attributed(layer);
        const after = rowsOf(layer).find((r) => r.key === key);
        const value = F(S(() => player[layer][key], null), false);
        const wouldAttribute = att2[key] !== undefined;
        return { layer, key, how, drove, above,
          before: before ? { text: before.text, sticky: before.sticky } : null,
          after: after ? { text: after.text, sticky: after.sticky } : null,
          value, wouldAttribute,
          beforeOk: !!before,
          afterOk: !!after && after.text === value,
          verdict: !drove ? `abstains (the reset itself threw: ${how})`
            : !before ? 'THE ROW WAS NOT THERE BEFORE THE RESET'
            : wouldAttribute ? `abstains (${layer}.${key} still attributes after the reset \u2014 this state cannot tell a remembered row from an attributed one)`
            : !after ? `THE ROW DID NOT SURVIVE THE RESET (${layer}.${key}, ${how})`
            : after.text !== value ? `THE SURVIVING ROW PRINTS A STALE VALUE ("${after.text}", but ${layer}.${key} is "${value}")`
            : !after.sticky ? `the row survived but is not marked REMEMBERED (${layer}.${key})`
            : `${layer}.${key} survived ${how}: "${before.text}" \u2192 "${after.text}", remembered` };
      });
      // \u26a0 THE TWO HALVES ARE NAMED APART, and that is what the mutant is scored against: removing the stickiness
      // must redden the AFTER-reset row while leaving the BEFORE-reset one green. A mutant that reddens both has
      // been caught by the wrong assertion and says nothing about the row surviving.
      row.resStickyOk = !/^THE |^the row survived but/.test(String(row.resSticky.verdict));
      row.resStickyBeforeOk = row.resSticky.beforeOk !== false;
      row.resStickyAfterOk = row.resSticky.afterOk !== false || /abstains/.test(String(row.resSticky.verdict));

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
        && L.countersOk && L.actionsOk && L.fitOk && L.twoRowsOk && L.statesOk && ctrRadOk(L)
        && L.skinOk && L.actSkinOk && L.ctrSkinOk
        // U7: the reset line's split and its two reserved line boxes, the other-resources filter in BOTH
        // directions, and the progress rows against the probe's own fourth rebuild
        // U8: … and the remembered set is keyed inside THIS game's own storage namespace
        && L.resetOk && L.resOk && L.progOk && L.resMemKeyOk);
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
        && row.fitOk && row.stabilityOk && row.throttleOk && row.counterVerdict !== 'NOT MOVED'
        && row.digitsOk && row.persistOk && row.tipsOk
        && row.anchorOk && !/DRIFTED/.test(row.resetDrift.verdict)
        && row.threeWayOk && row.backOk
        && row.counterWayOk && row.msCounterOk && row.lockedOk
        // U7: the reset block's height against the game's own string, and a full render with the two new readers
        // in it still writing nothing
        && row.resetHeightOk && row.renderInertOk && row.multiResOk
        // U8: and a resource row that was shown is still there after a DRIVEN reset, printing its current value;
        // and what the memory took in is the unambiguous attributions only, written to storage and not to `player`
        && row.resStickyOk && row.resMemOk);
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

// ---------------------------------------------------------------- gate O1: the Options section (docs/options.md)
// U3 turned the three URL-only opt-ins into buttons inside the game's own options tab, backed by one remembered
// preference. Two things can go wrong that no screenshot shows, and this gate exists for both:
//   · the preference becomes a SECOND way to turn a mode on, and the page the harness asks for by URL is no longer
//     the page it gets — so every leg below re-measures inertness, and the override in BOTH directions;
//   · the button writes a key, reloads, and the page was going to render that way anyway. ⛔ NOTHING HERE ASSERTS
//     A KEY. Every verdict is the RENDERED page — the class on <html>, the loader's stylesheets, the bar and its
//     buttons, the `au` layer — compared against the page the URL parameter produces.
const OPT_SECTION = '#tmt-loader-options';
const OPT_PREF_KEY = 'tmt-loader:ui.flags';
// what "the same page" means here. ⚠ `flagSource` and the stored key are deliberately NOT in it: they are how the
// two pages differ, and a fingerprint that included them could never find them equal.
const OPT_RENDER_KEYS = ['ready', 'mobile', 'navbar', 'automation', 'htmlClasses', 'mobileCss', 'navbarCss',
  'layerListCss', 'nav', 'navButtons', 'layerListUI', 'navbarUI', 'optionsUI', 'loaderFiles', 'auNodes', 'playerAu'];

const optFingerprint = (page) => page.evaluate(() => {
  const T = window.tmtLoader;
  const au = (() => { try { return typeof player !== 'undefined' && player && !!player.au; } catch (e) { return false; } })();
  return {
    ready: !!T.ready, mobile: T.mobile, navbar: T.navbar, automation: T.automation,
    htmlClasses: (document.documentElement.className.match(/tmt-[\w-]+/g) || []).sort(),
    mobileCss: !!document.getElementById('tmt-loader-mobile-css'),
    navbarCss: !!document.getElementById('tmt-loader-navbar-css'),
    layerListCss: !!document.getElementById('tmt-loader-layerlist-css'),
    nav: !!document.getElementById('tmt-navbar'),
    navButtons: Array.from(document.querySelectorAll('#tmt-navbar .tmt-navbar-btn')).filter((b) => !b.hidden).map((b) => b.dataset.key).sort(),
    layerListUI: !!T.layerListUI, navbarUI: !!T.navbarUI, optionsUI: !!T.optionsUI,
    loaderFiles: T.loaded.filter((f) => /^loader\//.test(f)).sort(),
    auNodes: document.querySelectorAll('#app .smallNode.au').length, playerAu: au,
    section: !!document.querySelector('#tmt-loader-options'),
    sectionStyle: !!document.getElementById('tmt-loader-options-style'),
    flagSource: T.flagSource, stored: T.prefs.read(), search: location.search,
    pageErrors: T.pageErrors.length,
  };
});
const optRender = (f) => Object.fromEntries(OPT_RENDER_KEYS.map((k) => [k, f[k]]));
const optSame = (a, b) => JSON.stringify(optRender(a)) === JSON.stringify(optRender(b));
/** The loader page for `id`, always managed, with whatever else the leg is asking about. */
const optUrl = (base, id, extra) => new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1${extra ? `&${extra}` : ''}`, base).href;
/** Open the game's options tab the way a person on THIS page would, and wait for the section to land.
 *  ⚠ MEASURED (U3, ptr): on a `?mobile=1` / `?navbar=1` page the corner wheel is still in the DOM but the bar's
 *  stylesheet HIDES it, so a click on it waits for visibility forever. There the affordance is the bar's own
 *  Options button — which forwards to the wheel, which is why the section is reachable in both modes at all. */
const optOpenTab = async (p) => {
  const bar = await p.$('#tmt-navbar button[data-key="options"]');
  if (bar && await bar.isVisible()) await bar.click(); else await p.click('#optionWheel');
  await p.waitForSelector(OPT_SECTION, { timeout: 10000 });
};

async function gateOptions(browser, base, ids) {
  const rows = [];
  for (const id of ids) {
    const row = { id };
    const errors = [];
    try {
      // one context per case: a stored preference is per browser, so a leg that writes one must not be able to
      // reach the next leg's page. `prefs` is planted BEFORE any page script runs, which is where a person's
      // browser would already have it.
      const draw = async (extra, prefs, act) => {
        const { context: c, stats } = await openContext(browser, { contextOptions: DESKTOP_CONTEXT });
        try {
          if (prefs !== null) await c.addInitScript(([k, v]) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* blocked store */ } }, [OPT_PREF_KEY, prefs]);
          const p = await c.newPage();
          await p.goto(optUrl(base, id, extra), { waitUntil: 'load' });
          const r = await waitReady(p);
          if (!r.ready) throw new Error(`not ready (${extra || 'plain'}): ${JSON.stringify(r.error)}`);
          await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
          const out = act ? await act(p) : await optFingerprint(p);
          // ⚠ Playwright's own lists, not the loader's: an error the loader never saw still counts here.
          errors.push(...stats.pageErrors.map((m) => `${extra || 'plain'}: ${m}`),
            ...stats.blocked.map((u) => `${extra || 'plain'}: BLOCKED ${u}`));
          return out;
        } finally { await c.close(); }
      };
      // --- leg 1: the SECTION is in the options tab, and nowhere else. Opened through the game's OWN corner
      // control, which is the affordance a person presses; the section is read, then the tab is left again.
      row.section = await draw('', null, async (p) => {
        const before = await optFingerprint(p);
        await optOpenTab(p);
        const open = await p.evaluate(() => {
          const s = document.querySelector('#tmt-loader-options');
          const btns = Array.from(s.querySelectorAll('button[data-flag]'));
          return { flags: btns.map((b) => b.dataset.flag), labels: btns.map((b) => b.textContent),
            locked: btns.filter((b) => b.classList.contains('locked')).map((b) => b.dataset.flag),
            note: s.querySelector('.tmt-loader-options-note').textContent,
            style: !!document.getElementById('tmt-loader-options-style'),
            // where it landed: the tab column the game drew, and after the game's own option buttons
            inTab: !!s.closest('.col, .fullWidth'), afterGameOpts: document.querySelectorAll('button.opt').length - btns.length };
        });
        await p.evaluate(() => { try { showTab('none'); } catch (e) { /* the button below is the real test */ } });
        await p.waitForSelector(OPT_SECTION, { state: 'detached', timeout: 10000 }).catch(() => {});
        const after = await optFingerprint(p);
        return { beforeSection: before.section, beforeStyle: before.sectionStyle, open, afterSection: after.section,
          pageErrors: after.pageErrors };
      });
      row.sectionOk = !!(row.section && !row.section.beforeSection && !row.section.beforeStyle
        && JSON.stringify(row.section.open.flags) === JSON.stringify(['mobile', 'navbar', 'automation'])
        && row.section.open.labels.every((t) => /: (ON|OFF)/.test(t)) && row.section.open.locked.length === 0
        && /reloads the page/.test(row.section.open.note) && row.section.open.inTab
        && row.section.open.afterGameOpts > 0 && !row.section.afterSection && row.section.pageErrors === 0);

      // --- leg 2: INERTNESS. A page with neither a parameter nor a stored preference is the page the loader has
      // always served. This is gate M1's own leg, re-asked here because U3 added a second way to break it.
      row.plain = await draw('', null);
      const inert = (f) => f.mobile === false && f.navbar === false && f.automation === false
        && f.htmlClasses.length === 0 && !f.mobileCss && !f.navbarCss && !f.layerListCss && !f.nav
        && f.navButtons.length === 0 && !f.layerListUI && !f.navbarUI && f.auNodes === 0 && !f.playerAu
        && f.loaderFiles.every((x) => !/mobile|navbar|layerlist/.test(x));
      row.inertOk = inert(row.plain) && row.plain.optionsUI === true && row.plain.stored && Object.keys(row.plain.stored).length === 0;

      // --- leg 3: a STORED preference produces the same page as the URL parameter. Compared against the flagged
      // page itself, never against a hand-written expectation.
      row.same = {};
      for (const [flag, extra] of [['mobile', 'mobile=1'], ['navbar', 'navbar=1'], ['automation', 'automation=1']]) {
        const byUrl = await draw(extra, null);
        const byPref = await draw('', JSON.stringify({ [flag]: true }));
        row.same[flag] = { equal: optSame(byUrl, byPref), url: optRender(byUrl), pref: optRender(byPref),
          sourceUrl: byUrl.flagSource[flag], sourcePref: byPref.flagSource[flag],
          // …and the page is not simply the plain page: the flag has to have DONE something, or "equal" is vacuous
          moved: !optSame(byUrl, row.plain) };
      }
      row.sameOk = ['mobile', 'navbar', 'automation'].every((f) => row.same[f].equal && row.same[f].moved
        && row.same[f].sourceUrl === 'url' && row.same[f].sourcePref === 'stored');

      // --- leg 4: the URL OVERRIDES a contradicting stored preference, in both directions.
      row.override = {};
      for (const flag of ['mobile', 'navbar', 'automation']) {
        const onOverStoredOff = await draw(`${flag}=1`, JSON.stringify({ [flag]: false }));
        const offOverStoredOn = await draw(`${flag}=0`, JSON.stringify({ [flag]: true }));
        row.override[flag] = {
          onWins: onOverStoredOff[flag] === true && onOverStoredOff.flagSource[flag] === 'url',
          offWins: offOverStoredOn[flag] === false && offOverStoredOn.flagSource[flag] === 'url',
          // ⛔ and `?flag=0` over a stored `true` is the INERT page, not merely a false in the loader's object
          offIsThePlainPage: optSame(offOverStoredOn, row.plain),
          onIsTheFlaggedPage: optSame(onOverStoredOff, row.same[flag].url),
        };
      }
      row.overrideOk = ['mobile', 'navbar', 'automation'].every((f) => {
        const o = row.override[f];
        return o.onWins && o.offWins && o.offIsThePlainPage && o.onIsTheFlaggedPage;
      });

      // --- leg 5: THE DISCRIMINATOR. The button is PRESSED, on a page that was rendering the other way, and the
      // verdict is the page that comes back — never the key that was written. Pressed twice: on and off again.
      row.press = {};
      for (const flag of ['mobile', 'automation']) {
        row.press[flag] = await draw('', null, async (p) => {
          const pressOnce = async () => {
            await optOpenTab(p);
            await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 30000 }),
              p.click(`${OPT_SECTION} button[data-flag="${flag}"]`)]);
            const r = await waitReady(p);
            if (!r.ready) throw new Error(`not ready after the press: ${JSON.stringify(r.error)}`);
            await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
            return optFingerprint(p);
          };
          const on = await pressOnce();
          const off = await pressOnce();
          return { on: optRender(on), off: optRender(off), onSource: on.flagSource[flag], offStored: off.stored,
            pageErrors: off.pageErrors };
        });
      }
      row.pressOk = ['mobile', 'automation'].every((f) => {
        const q = row.press[f];
        return q && JSON.stringify(q.on) === JSON.stringify(row.same[f].url)   // the page the parameter makes
          && JSON.stringify(q.off) === JSON.stringify(optRender(row.plain))    // and all the way back to inert
          && q.onSource === 'stored' && q.pageErrors === 0;
      });

      // --- leg 6: a press made ON A FLAGGED PAGE is not a no-op. The URL answers first, so a press that only wrote
      // a key would come back rendering exactly as before — the failure this leg exists to catch.
      row.pressOverUrl = await draw('mobile=1', null, async (p) => {
        await optOpenTab(p);
        await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 30000 }),
          p.click(`${OPT_SECTION} button[data-flag="mobile"]`)]);
        const r = await waitReady(p);
        if (!r.ready) throw new Error(`not ready after the press: ${JSON.stringify(r.error)}`);
        await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
        return optFingerprint(p);
      });
      row.pressOverUrlOk = optSame(row.pressOverUrl, row.plain) && !/mobile=/.test(row.pressOverUrl.search);

      // --- leg 7: the ONE control that does not act says so on its face. `?mobile=1` has always implied the bar, so
      // under the layout the Nav bar button is drawn LOCKED. ⛔ A locked button that merely swallowed the press
      // would be the exact thing this slice was told not to ship, so the press is MADE and the page is measured
      // across it: nothing navigates, nothing is stored, nothing renders differently.
      row.locked = await draw('mobile=1', null, async (p) => {
        await optOpenTab(p);
        const before = await optFingerprint(p);
        const label = await p.evaluate(() => {
          const b = document.querySelector('#tmt-loader-options button[data-flag="navbar"]');
          return { text: b.textContent, locked: b.classList.contains('locked'), title: b.title };
        });
        await p.click(`${OPT_SECTION} button[data-flag="navbar"]`);
        await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
        const after = await optFingerprint(p);
        return { label, sameAfterPress: optSame(before, after), stored: after.stored, url: after.search,
          stillThere: after.section, source: before.flagSource.navbar };
      });
      row.lockedOk = !!(row.locked && row.locked.label.locked && /with the mobile layout/.test(row.locked.label.text)
        && /ON/.test(row.locked.label.text) && row.locked.source === 'implied' && row.locked.sameAfterPress
        && Object.keys(row.locked.stored).length === 0 && /mobile=1/.test(row.locked.url) && row.locked.stillThere);

    } catch (e) {
      row.exception = String((e && e.message) || e).slice(0, 300);
    }
    row.errors = errors.slice(0, 5);
    row.errorCount = errors.length;
    row.ok = !row.exception && !!(row.sectionOk && row.inertOk && row.sameOk && row.overrideOk && row.pressOk
      && row.pressOverUrlOk && row.lockedOk && errors.length === 0);
    rows.push(row);
    console.log(`O1 ${id}: ${row.ok ? 'GREEN' : 'RED'} section=${row.sectionOk} inert=${row.inertOk} same=${row.sameOk} override=${row.overrideOk} press=${row.pressOk} pressOverUrl=${row.pressOverUrlOk} locked=${row.lockedOk} errors=${row.errorCount}${row.exception ? ` exception=${row.exception}` : ''}`);
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
      // `--allow-host`: see openContext. Only G5's live run passes it, and it passes exactly the deploy host.
      const allowHosts = a['allow-host'] ? String(a['allow-host']).split(',').map((x) => x.trim()).filter(Boolean) : [];
      const rows = await gateLoad(browser, base, ids, { automation: !!a.automation, allowHosts });
      if (a.json) writeJSON(a.json, { commit: headCommit(), base, gate: 'load', shard: shardMeta, allowHosts, rows });
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
      // --- U5: the chips' own colours, and Back --------------------------------------------------------------
      const skRed = rows.filter((r) => ll(r) && !ll(r).skinOk).map((r) => r.id);
      const skCounts = rows.reduce((o, r) => { const L = ll(r); if (L) Object.entries(L.skinCounts || {}).forEach(([k, v]) => { o[k] = (o[k] || 0) + v; }); return o; }, {});
      const sk3 = rows.filter((r) => ll(r) && ll(r).threeStateCards.length).map((r) => `${r.id}/${ll(r).threeStateCards.join('+')}`);
      console.log(`M1 layers colours (U5 — every chip's COMPUTED background against the game's own stylesheet, rebuilt in the probe): ${rows.length - skRed.length}/${rows.length}${skRed.length ? ` (RED: ${skRed.map((x) => `${x} ${JSON.stringify(ll(rows.find((r) => r.id === x)).skinBad)}`).join('; ')})` : ''}; ${JSON.stringify(skCounts)}; ${sk3.length} game(s) show all three on ONE card at their own state${sk3.length ? `: ${sk3.slice(0, 6).join(', ')}` : ' — which is an ABSTENTION, and why the CONSTRUCTED leg below exists'}`);
      console.log(`M1 layers three-way (U5 — CONSTRUCTED: one card's three upgrade chips forced bought / affordable / unaffordable): ${JSON.stringify(fv('threeWay'))}${rows.filter((r) => r.threeWay && /IS NOT|VANISHED|NOT RESTORED/.test(r.threeWay.verdict)).map((r) => ` — ${r.id}: ${r.threeWay.verdict}`).join('')}`);
      console.log(`M1 layers Back (U5 — opened from the LIST returns to the list, opened from the TREE returns to the tab): ${JSON.stringify(fv('back'))}; tree route: ${JSON.stringify(rows.reduce((o, r) => { if (r.back && r.back.route) o[r.back.route] = (o[r.back.route] || 0) + 1; return o; }, {}))}${rows.filter((r) => r.back && !r.backOk).map((r) => ` — ${r.id}: ${r.back.verdict}`).join('')}`);
      console.log(`M1 layers counter colours (U6 — the user's table, constructed on one card): ${JSON.stringify(fv('counterWay'))}${rows.filter((r) => r.counterWay && !r.counterWayOk).map((r) => ` — ${r.id}: ${r.counterWay.verdict}`).join('')}`);
      console.log(`M1 layers milestone counter (U6 — RED with one unearned, GREEN with all earned): ${JSON.stringify(fv('msCounter'))}${rows.filter((r) => r.msCounter && !r.msCounterOk).map((r) => ` — ${r.id}: ${r.msCounter.verdict}`).join('')}`);
      console.log(`M1 layers inaccessible press (U6 — the overlay STAYS OPEN and nothing moves): ${JSON.stringify(fv('locked'))}${rows.filter((r) => r.locked && !r.lockedOk).map((r) => ` — ${r.id}: ${r.locked.verdict}`).join('')}`);
      console.log(`M1 layers throttle (${rows[0] && rows[0].throttle ? rows[0].throttle.throttleMs : '—'} ms): ${JSON.stringify(fv('throttle'))}`);
      const cmNo = rows.filter((r) => r.counterVerdict && r.counterVerdict.startsWith('no candidate')).map((r) => r.id);
      console.log(`M1 layers counter press: ${rows.filter((r) => r.counterVerdict === 'moved').length} moved a counter's x by buying through the card, ${rows.filter((r) => r.counterVerdict === 'NOT MOVED').length} did not, ${cmNo.length} abstained${cmNo.length ? ` (nothing affordable: ${cmNo.slice(0, 8).join(', ')}${cmNo.length > 8 ? `, …(${cmNo.length})` : ''})` : ''}`);
      // ⚠ A LEG THAT NEVER RAN IS NOT A LEG THAT PASSED. `row.digits` is absent when the leg threw and the row went
      // to the catch — and the first version of these two lines counted that as one of the greens, because it
      // counted `rows.length` minus the REDS it could see. MEASURED: a build with no `layerListUI.expand` makes
      // the persistence probe throw, and the summary read `1/1 restored` over a row that was red for an exception.
      const dgNone = rows.filter((r) => !r.digits).map((r) => r.id);
      const dgRed = rows.filter((r) => r.digits && !r.digitsOk).map((r) => r.id);
      const dgAbst = rows.filter((r) => r.digits && /abstains/.test(r.digits.verdict)).map((r) => r.id);
      const d0 = rows.find((r) => r.digits && r.digits.magnitudes);
      console.log(`M1 layers digits (U2c — the readout's own string, ${d0 ? d0.digits.magnitudes : '—'} magnitudes, both widths, both states): ${rows.length - dgRed.length - dgAbst.length - dgNone.length}/${rows.length} held every box still over ${rows.reduce((n, r) => n + ((r.digits && r.digits.amounts) || 0), 0)} amount readout(s) and ${rows.reduce((n, r) => n + ((r.digits && r.digits.counters) || 0), 0)} counter(s)${dgAbst.length ? `, ${dgAbst.length} abstained` : ''}${dgNone.length ? `, ⛔ ${dgNone.length} NEVER RAN (the row threw: ${dgNone.slice(0, 6).join(', ')})` : ''}${dgRed.length ? ` (RED: ${dgRed.map((x) => `${x} ${JSON.stringify((rows.find((r) => r.id === x).digits || {}).bad)}`).join('; ')})` : ''}`);
      // U2e: THE TOOLTIP. ⚠ Two numbers, not one — `judged` is how many controls carry text the `title` does not
      // already state, and it is the only thing that makes `richer` mean anything. A row with `judged: 0` measured
      // nothing about richness and is counted as an abstention, never as a green.
      const tpNone = rows.filter((r) => !r.tips).map((r) => r.id);
      const tpRed = rows.filter((r) => r.tips && !r.tipsOk).map((r) => r.id);
      const tpAbst = rows.filter((r) => r.tips && r.tipsOk && /abstains/.test(r.tips.phoneVerdict)).map((r) => r.id);
      const tpSum = (f) => rows.reduce((n, r) => n + ((r.tips && r.tips.phone && r.tips.phone[f]) || 0), 0);
      const tpDecl = rows.filter((r) => r.tips && r.tips.phone && r.tips.phone.declared).map((r) => `${r.id} ${r.tips.phone.declaredShown}/${r.tips.phone.declared}`);
      const tvNan = rows.reduce((o, r) => { const v = r.tips && r.tips.phone && r.tips.phone.nan && r.tips.phone.nan.verdict; if (v) { const k = v.replace(/\(.*/, '(…)'); o[k] = (o[k] || 0) + 1; } return o; }, {});
      const tvTap = rows.reduce((o, r) => { const v = r.tips && r.tips.tap && r.tips.tap.verdict; if (v) { const k = v.replace(/\(.*/, '(…)').replace(/ \(buy.*/, ''); o[k] = (o[k] || 0) + 1; } return o; }, {});
      const tvHov = rows.reduce((o, r) => { const v = r.tips && r.tips.hover && r.tips.hover.verdict; if (v) { const k = v.replace(/\(.*/, '(…)'); o[k] = (o[k] || 0) + 1; } return o; }, {});
      console.log(`M1 layers tooltip (U2e — STRICTLY RICHER than the element's own \`title\`, which U2d already set on every control): ${rows.length - tpRed.length - tpAbst.length - tpNone.length}/${rows.length} green over ${tpSum('richer')} of ${tpSum('judged')} judged control(s) out of ${tpSum('controls')} (${tpSum('chips')} chip(s), ${tpSum('acts')} button(s), ${tpSum('counters')} counter(s)); ${tpSum('markupSource')} control(s) whose OWN fields carry a tag, ${rows.reduce((n, r) => n + (((r.tips && r.tips.phone && r.tips.phone.markup) || []).length), 0)} overlay(s) holding one${tpAbst.length ? `, ${tpAbst.length} abstained: ${tpAbst.slice(0, 6).map((x) => `${x} ${(rows.find((r) => r.id === x).tips || {}).phoneVerdict}`).join('; ')}` : ''}${tpNone.length ? `, ⛔ ${tpNone.length} NEVER RAN (the row threw: ${tpNone.slice(0, 6).join(', ')})` : ''}${tpRed.length ? ` (RED: ${tpRed.map((x) => `${x} ${(rows.find((r) => r.id === x).tips || {}).phoneVerdict} / desktop ${(rows.find((r) => r.id === x).tips || {}).desktopVerdict}`).join('; ')})` : ''}`);
      console.log(`M1 layers tooltip paths: a DECLARED \`tooltip\` field is drawn on ${tpDecl.length} game(s)${tpDecl.length ? ` (${tpDecl.slice(0, 8).join(', ')}${tpDecl.length > 8 ? `, …(${tpDecl.length})` : ''})` : ' — every other game reaches the tooltip by COMPOSITION alone'}; tap on touch → ${JSON.stringify(tvTap)}; hover on a pointer → ${JSON.stringify(tvHov)}; the flag across opening EVERY tooltip → ${JSON.stringify(rows.reduce((o, r) => { const v = r.tips && r.tips.phone && r.tips.phone.sweepNaN && r.tips.phone.sweepNaN.verdict; if (v) { const k = v.replace(/\(.*/, '(…)'); o[k] = (o[k] || 0) + 1; } return o; }, {}))}; a CONSTRUCTED NaN cost → ${JSON.stringify(tvNan)}; a CONSTRUCTED cost move under an OPEN tooltip → ${JSON.stringify(rows.reduce((o, r) => { const v = r.tips && r.tips.phone && r.tips.phone.live && r.tips.phone.live.verdict; if (v) { const k = v.replace(/\(.*/, '(…)'); o[k] = (o[k] || 0) + 1; } return o; }, {}))}`);
      const psNone = rows.filter((r) => !r.persist).map((r) => r.id);
      const psRed = rows.filter((r) => r.persist && !r.persistOk).map((r) => r.id);
      const psAbst = rows.filter((r) => r.persist && /abstains/.test(r.persist.verdict)).map((r) => r.id);
      console.log(`M1 layers persistence (U2c — a card CHANGED before the load is read back on a second page, at both widths; a second card left closed is the control): ${rows.length - psRed.length - psAbst.length - psNone.length}/${rows.length} restored${psAbst.length ? `, ${psAbst.length} abstained — ⚠ each with its OWN reason, not a shared one: ${psAbst.slice(0, 6).map((x) => `${x} ${(rows.find((r) => r.id === x).persist || {}).verdict}`).join('; ')}${psAbst.length > 6 ? `, …(${psAbst.length})` : ''}` : ''}${psNone.length ? `, ⛔ ${psNone.length} NEVER RAN (the row threw: ${psNone.slice(0, 6).join(', ')})` : ''}${psRed.length ? ` (RED: ${psRed.map((x) => `${x} ${(rows.find((r) => r.id === x).persist || {}).verdict}`).join('; ')})` : ''}; ${rows.filter((r) => r.persist && r.persist.cut).length} game(s) took a card whose action row the phone had CUT`);
      console.log(`M1 layers shape: tabFormat ${shp.array} array-form, ${shp.object} object/subtab-form, ${shp.none} none (engine default) over ${rows.length} games; ${ms} milestone chip(s), ${dv} divider(s); ${offSrc}/${withChips} card(s) with chips are NOT in source order; ${ps} pseudo-unlocked chip(s)${ps === 0 ? ' — visibility rule 2 is UNEXERCISED at these states (see docs/mobile.md)' : ''}`);
      console.log(`M1 layers discriminators: ${rows.filter((r) => r.chipBaseline).map((r) => `${r.id} ${r.chipBaseline.now} chips vs U2's ${r.chipBaseline.u2} (${r.chipBaseline.fell ? 'FELL' : 'DID NOT FALL'}, ${r.chipBaseline.milestones} of them milestones), ${r.chipBaseline.cardsOffSourceOrder} card(s) off source order (${r.chipBaseline.orderMoved ? 'MOVED' : 'UNMOVED'})`).join('; ') || 'no reference game in this run'}`);
      const vr = (f) => rows.reduce((o, r) => { const v = r.rules && r.rules[f] && r.rules[f].verdict; if (v) o[v] = (o[v] || 0) + 1; return o; }, {});
      console.log(`M1 layers visibility rules (constructed, judged against the probe's own expectation): msDisplay='never' → ${JSON.stringify(vr('ms'))}; pseudoUnl forced true → ${JSON.stringify(vr('pseudo'))}; a clickable given a real amount → ${JSON.stringify(vr('clickable'))}; a buyable given 1e400 → ${JSON.stringify(vr('bigAmount'))}; ${rows.filter((r) => r.rules && r.rules.restored === false).length} game(s) did not restore`);
      const llAbst = rows.filter((r) => r.layersInert && !r.layersInert.stable).map((r) => r.id);
      console.log(`M1 layers inertness: ${rows.filter((r) => r.layersInert && r.layersInert.verdict === 'unchanged').length} unchanged state hash across opening the list, ${rows.filter((r) => r.layersInert && r.layersInert.verdict === 'MOVED').length} moved, ${llAbst.length} abstained${llAbst.length ? ` (the page does not repeat its own hash: ${llAbst.join(', ')})` : ''}`);
      const noCand = rows.filter((r) => r.resetVerdict && r.resetVerdict.startsWith('no candidate')).map((r) => r.id);
      console.log(`M1 layers reset press: ${rows.filter((r) => r.resetVerdict === 'moved').length} moved player[l].points, ${rows.filter((r) => r.resetVerdict === 'NOT MOVED').length} did not, ${noCand.length} abstained${noCand.length ? ` (nothing could reset: ${noCand.join(', ')})` : ''}`);
      for (const r of rows.filter((x) => !x.ok)) console.log(`  ${r.id}: layers=${r.layersOk} digits=${r.digits ? r.digits.verdict : '—'}${r.digits && !r.digitsOk ? ' ' + JSON.stringify(r.digits) : ''} tips=${r.tips ? `${r.tips.phoneVerdict} / desktop ${r.tips.desktopVerdict} / tap ${r.tips.tap.verdict} / hover ${r.tips.hover.verdict}` : '—'}${r.tips && !r.tipsOk ? ' ' + JSON.stringify(r.tips) : ''} persist=${r.persist ? r.persist.verdict : '—'}${r.persist && !r.persistOk ? ' ' + JSON.stringify(r.persist) : ''} fit=${r.fitOk}${r.fitWidths && !r.fitOk ? ' ' + JSON.stringify(r.fitWidths) : ''} stability=${r.stabilityOk}${r.stability && !r.stabilityOk ? ' ' + JSON.stringify(r.stability) : ''} throttle=${r.throttleOk}${r.throttle && !r.throttleOk ? ' ' + JSON.stringify(r.throttle) : ''} counter=${r.counterVerdict}${r.counterMove && r.counterVerdict === 'NOT MOVED' ? ' ' + JSON.stringify(r.counterMove) : ''}${r.chipBaseline && !(r.chipBaseline.fell && r.chipBaseline.orderMoved) ? ` chipBaseline=${JSON.stringify(r.chipBaseline)}` : ''}${r.layers && !r.layersOk ? ' ' + JSON.stringify(r.layers) : ''}${r.resetVerdict && r.resetVerdict !== 'moved' ? ` reset=${r.resetVerdict} ${JSON.stringify(r.reset)}` : ''} inert=${r.inertOk} both=${r.bothOk}${r.both ? ' ' + JSON.stringify(r.both) : ''} navbarOnly=${r.navbarOnlyOk}${r.navbarOnly && !r.navbarOnlyOk ? ' ' + JSON.stringify(r.navbarOnly) : ''} state=${r.stateVerdict}${r.state ? ` (plain ${r.state.plain} / control ${r.state.plainControl} / mobile ${r.state.mobile})` : ''} geometry=${r.geometryOk} nav=${r.navOk} load=${r.loadVerdict && r.loadVerdict.ok}${r.worst && r.worst.length ? ` worst=${JSON.stringify(r.worst)}` : ''}${r.exception ? ` exception=${r.exception}` : ''}`);
    } else if (a.gate === 'options') {
      const rows = await gateOptions(browser, base, ids);
      if (a.json) writeJSON(a.json, { commit: headCommit(), base, gate: 'options', shard: shardMeta, viewport: DESKTOP, rows });
      code = rows.every((r) => r.ok) ? 0 : 1;
      console.log(`O1 options: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}`).join(' ')}`);
      const leg = (f) => `${rows.filter((r) => r[f]).length}/${rows.length}`;
      console.log(`O1 legs: section ${leg('sectionOk')}, inertness ${leg('inertOk')}, stored \u2261 URL ${leg('sameOk')}, URL overrides ${leg('overrideOk')}, the PRESS changes the page ${leg('pressOk')}, a press over a parameter ${leg('pressOverUrlOk')}, the locked button ${leg('lockedOk')}`);
      const lbl = rows.map((r) => r.section && r.section.open && r.section.open.labels.join(' \u00b7 ')).filter(Boolean)[0];
      console.log(`O1 the section, as drawn: ${lbl || '\u2014'}${rows.some((r) => r.errorCount) ? `; \u26d4 ${rows.reduce((n, r) => n + r.errorCount, 0)} page error(s)/blocked request(s): ${rows.flatMap((r) => r.errors).slice(0, 4).join(' | ')}` : '; 0 page errors, 0 blocked requests'}`);
      for (const r of rows.filter((x) => !x.ok)) console.log(`  ${r.id}: ${JSON.stringify({ section: r.section, same: r.same, override: r.override, press: r.press, locked: r.locked, pressOverUrl: r.pressOverUrl && { search: r.pressOverUrl.search, flags: optRender(r.pressOverUrl) }, errors: r.errors, exception: r.exception })}`);
      // (U4) THE DRIFT. Two halves with one rule: a game only JUDGES where the content height actually moved, because
      // "scrollTop did not move" is free on a build whose cards stopped changing height.
      const adJ = rows.filter((r) => r.anchorDrift && !/abstains/.test(r.anchorDrift.verdict));
      const adRed = adJ.filter((r) => /DRIFTED/.test(r.anchorDrift.verdict)).map((r) => r.id);
      const adRoom = rows.filter((r) => r.anchorDrift && /not scrollable/.test(r.anchorDrift.verdict)).map((r) => r.id);
      const adNone = rows.filter((r) => !r.anchorDrift).map((r) => r.id);
      const rdJ = rows.filter((r) => r.resetDrift && !/abstains/.test(r.resetDrift.verdict));
      const rdRed = rdJ.filter((r) => /DRIFTED/.test(r.resetDrift.verdict)).map((r) => r.id);
      const anch = [...new Set(rows.map((r) => (r.anchorDrift && r.anchorDrift.anchor) || (r.resetDrift && r.resetDrift.anchor)).filter(Boolean))];
      console.log(`M1 layers drift (U4 — the scroller's \`overflow-anchor\` is ${anch.join('/') || '—'}): CONSTRUCTED height change above the offset, ${adJ.length - adRed.length}/${adJ.length} judged game(s) held scrollTop still while the height moved${adRed.length ? ` (DRIFTED: ${adRed.map((x) => `${x} ${JSON.stringify(rows.find((r) => r.id === x).anchorDrift)}`).join('; ')})` : ''}, ${adRoom.length} abstained for a list that does not scroll at 390px${adNone.length ? `, ⛔ ${adNone.length} NEVER RAN (the row threw: ${adNone.slice(0, 6).join(', ')})` : ''}; the REAL reset press, ${rdJ.length - rdRed.length}/${rdJ.length} judged${rdRed.length ? ` (DRIFTED: ${rdRed.map((x) => `${x} ${JSON.stringify(rows.find((r) => r.id === x).resetDrift)}`).join('; ')})` : ''}, ${rows.filter((r) => r.resetDrift && /abstains/.test(r.resetDrift.verdict)).length} abstained (no room, or the press did not move the height)`);
      const armRows = rows.filter((r) => r.both && r.both.arm);
      if (armRows.length) console.log(`M1 au arming setting (U4 — the DEFAULT half; the arming flow itself is gates-a1.mjs --part 2): ${armRows.filter((r) => r.both.armOk).length}/${armRows.length} green over ${armRows.map((r) => `${r.id}: ${r.both.armVerdict}`).join('; ')}`);
      for (const r of rows.filter((x) => !x.ok)) console.log(`  ${r.id}: layers=${r.layersOk} digits=${r.digits ? r.digits.verdict : '—'}${r.digits && !r.digitsOk ? ' ' + JSON.stringify(r.digits) : ''} tips=${r.tips ? `${r.tips.phoneVerdict} / desktop ${r.tips.desktopVerdict} / tap ${r.tips.tap.verdict} / hover ${r.tips.hover.verdict}` : '—'}${r.tips && !r.tipsOk ? ' ' + JSON.stringify(r.tips) : ''} persist=${r.persist ? r.persist.verdict : '—'}${r.persist && !r.persistOk ? ' ' + JSON.stringify(r.persist) : ''} fit=${r.fitOk}${r.fitWidths && !r.fitOk ? ' ' + JSON.stringify(r.fitWidths) : ''} stability=${r.stabilityOk}${r.stability && !r.stabilityOk ? ' ' + JSON.stringify(r.stability) : ''} throttle=${r.throttleOk}${r.throttle && !r.throttleOk ? ' ' + JSON.stringify(r.throttle) : ''} counter=${r.counterVerdict}${r.counterMove && r.counterVerdict === 'NOT MOVED' ? ' ' + JSON.stringify(r.counterMove) : ''}${r.chipBaseline && !(r.chipBaseline.fell && r.chipBaseline.orderMoved) ? ` chipBaseline=${JSON.stringify(r.chipBaseline)}` : ''}${r.layers && !r.layersOk ? ' ' + JSON.stringify(r.layers) : ''}${r.resetVerdict && r.resetVerdict !== 'moved' ? ` reset=${r.resetVerdict} ${JSON.stringify(r.reset)}` : ''} drift=${r.anchorDrift ? r.anchorDrift.verdict : '—'}${r.anchorDrift && !r.anchorOk ? ' ' + JSON.stringify(r.anchorDrift) : ''} resetDrift=${r.resetDrift ? r.resetDrift.verdict : '—'}${r.resetDrift && /DRIFTED/.test(r.resetDrift.verdict) ? ' ' + JSON.stringify(r.resetDrift) : ''} inert=${r.inertOk} both=${r.bothOk}${r.both ? ' ' + JSON.stringify(r.both) : ''} navbarOnly=${r.navbarOnlyOk}${r.navbarOnly && !r.navbarOnlyOk ? ' ' + JSON.stringify(r.navbarOnly) : ''} state=${r.stateVerdict}${r.state ? ` (plain ${r.state.plain} / control ${r.state.plainControl} / mobile ${r.state.mobile})` : ''} geometry=${r.geometryOk} nav=${r.navOk} load=${r.loadVerdict && r.loadVerdict.ok}${r.worst && r.worst.length ? ` worst=${JSON.stringify(r.worst)}` : ''}${r.exception ? ` exception=${r.exception}` : ''}`);
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
