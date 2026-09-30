// Gate E1 — EMBED MODE (S4; docs/embed.md): the loader's extras on an author's OWN game page.
//
//   node tools/harness/embed.mjs [<id>...] [--json out.json]        (default: ptr something — 2.2.1 and 2.7)
//
// The fixture is what an author would have: the game's OWN index.html with the one-line tag added after its scripts,
// served on one origin, and the loader served on ANOTHER (with `access-control-allow-origin: *`, as GitHub Pages and
// jsDelivr send). Both are local servers in this process; the game's own internet (vue from a CDN, a web font) is
// routed to the vendored copy or an empty answer — only the URLs its manifest lists — and anything else is blocked
// and counted, exactly as page.mjs does.
//
// ⛔ EVERY VERDICT IS THE RENDERED PAGE, as in O1: the classes on <html>, the loader's stylesheets, the bar and its
// buttons, the `au` node and `player.au`, the loader files that ran — and where a feature is on, the page is compared
// against the HOSTED page with the same parameter, never against a hand-written expectation.
//
// Legs (each its own browser context — a remembered choice is per browser):
//   i    INERT: the tag, everything loaded, nothing on → the game's own page (compared with the page WITHOUT the tag),
//        and the loader asked for exactly its five files
//   ii   AUTHOR DEFAULTS: each of the 7 non-empty `data-on` sets → exactly those features on, each equal to the hosted
//        page with the same parameters
//   iii  NOT LOADED: no button, and a URL parameter for it does nothing; mobile without the nav bar carries the bar
//   iv   A PLAYER PRESS overrides the author's default and is remembered across a reload (both directions)
//   v    THE URL overrides both the remembered choice and the author's default
//   vi   tmt-loader.json overrides the tag per field; its autoTable is the one in force (over the loader's own);
//        a broken table costs the extras, never the game
//   vii  REQUESTS: every request of every page above judged (embedverdict.mjs)
//   M    M1's layout legs: the phone page (mobile on) and the desktop page (nav bar only), geometry against the hosted twin
//   O    O1's options legs: the section (only the loaded buttons, no "All games" link), a press over a parameter drops
//        it, the locked Nav bar under the mobile layout
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { REPO, parseArgs, writeJSON, readManifest, freePort, gameDir, headCommit } from './lib.mjs';
import { openContext, waitReady, MOBILE_PROBE, PHONE_CONTEXT, DESKTOP_CONTEXT, AU_NODE_SELECTOR, LAYER_NODE_SELECTOR } from './page.mjs';
import { declaredLoaderFiles, judgeEmbed } from './embedverdict.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const FLAGS = ['mobile', 'navbar', 'automation'];

function sendFile(res, file, extraHeaders = {}) {
  let st;
  try { st = fs.statSync(file); } catch { res.writeHead(404, extraHeaders); return res.end('not found'); }
  if (!st.isFile()) { res.writeHead(404, extraHeaders); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store', ...extraHeaders });
  fs.createReadStream(file).pipe(res);
}
const inside = (root, rel) => { const f = path.resolve(root, '.' + path.posix.normalize('/' + rel)); return f.startsWith(root + path.sep) || f === root ? f : null; };

/** The tag as an author writes it. `attrs`: {load, on, game, settings} — a value of `true` is a bare attribute. */
export function embedTag(loaderBase, attrs = {}) {
  const a = Object.entries(attrs).filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => v === true ? ` data-${k}` : ` data-${k}="${String(v).replace(/"/g, '&quot;')}"`).join('');
  return `<script src="${loaderBase}v1/embed.js"${a}></script>`;
}
/** The game's own index.html with the tag added right after its last </script> (after the game's scripts). */
export function withTag(html, tag) {
  const i = html.lastIndexOf('</script>');
  if (i < 0) throw new Error('no </script> in the game\'s index.html');
  const j = i + '</script>'.length;
  return html.slice(0, j) + '\n\t' + tag + html.slice(j);
}

/** Two servers: the LOADER (the repository root, CORS *) and the AUTHOR's site (fixtures under /f/<key>/). */
export async function startEmbedServers() {
  const fixtures = new Map();
  const loader = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const f = inside(REPO, decodeURIComponent(u.pathname));
    if (!f) { res.writeHead(403); return res.end(); }
    sendFile(res, f.endsWith(path.sep) ? path.join(f, 'index.html') : f, { 'access-control-allow-origin': '*' });
  });
  const site = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const m = /^\/f\/([^/]+)\/(.*)$/.exec(decodeURIComponent(u.pathname));
    const fx = m && fixtures.get(m[1]);
    if (!fx) { res.writeHead(404); return res.end('no fixture'); }
    const rest = m[2];
    if (rest === '' || rest === 'index.html') {
      const html = fs.readFileSync(path.join(gameDir(fx.id), 'index.html'), 'utf8');
      res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' });
      return res.end(fx.tag === null ? html : withTag(html, fx.tag));
    }
    if (rest === 'tmt-loader.json') {
      if (fx.file === undefined || fx.file === null) { res.writeHead(404); return res.end('no settings file'); }
      res.writeHead(200, { 'content-type': TYPES['.json'], 'cache-control': 'no-store' });
      return res.end(typeof fx.file === 'string' ? fx.file : JSON.stringify(fx.file));
    }
    const f = inside(gameDir(fx.id), rest);
    if (!f) { res.writeHead(403); return res.end(); }
    // a SLOW author site, for leg T: the game's scripts that its index.html does NOT name (the mod files a 2.7
    // loader.js inserts as async scripts) arrive late
    if (fx.delay && /\.js$/.test(rest) && !fx.delay.static.has(rest)) return setTimeout(() => sendFile(res, f), fx.delay.ms);
    sendFile(res, f);
  });
  const listen = (srv) => new Promise((resolve, reject) => { const p = freePort(); srv.once('error', reject); srv.listen(p, '127.0.0.1', () => resolve(p)); });
  const lp = await listen(loader);
  let sp = await listen(site);
  const loaderBase = `http://127.0.0.1:${lp}/`;
  let n = 0;
  return {
    loaderBase, siteOrigin: `http://127.0.0.1:${sp}`,
    /** Registers a fixture; returns its page URL (the directory, as an author's Pages site serves it). */
    fixture(def) {
      const key = `${def.id}-${++n}`;
      fixtures.set(key, { id: def.id, tag: def.noTag ? null : embedTag(loaderBase, def.attrs || {}), file: def.file, delay: def.delay || null });
      return `http://127.0.0.1:${sp}/f/${key}/`;
    },
    stop: () => Promise.all([new Promise((r) => loader.close(r)), new Promise((r) => site.close(r))]),
  };
}

// ---------------------------------------------------------------- the fingerprint
const FP = () => {
  const T = window.tmtLoader || null;
  const au = (() => { try { return typeof player !== 'undefined' && player && !!player.au; } catch (e) { return false; } })();
  return {
    tmtLoader: !!T, ready: !!(T && T.ready), error: T ? T.error : null, embed: !!(T && T.embed),
    flags: T && T.flags ? { mobile: T.flags.mobile, navbar: T.flags.navbar, automation: T.flags.automation } : null,
    source: T ? T.flagSource || null : null, loadedFlags: T ? T.flagsLoaded || null : null,
    htmlClasses: (document.documentElement.className.match(/tmt-[\w-]+/g) || []).sort(),
    mobileCss: !!document.getElementById('tmt-loader-mobile-css'),
    navbarCss: !!document.getElementById('tmt-loader-navbar-css'),
    layerListCss: !!document.getElementById('tmt-loader-layerlist-css'),
    nav: !!document.getElementById('tmt-navbar'),
    navButtons: Array.from(document.querySelectorAll('#tmt-navbar .tmt-navbar-btn')).filter((b) => !b.hidden).map((b) => b.dataset.key).sort(),
    layerListUI: !!(T && T.layerListUI), navbarUI: !!(T && T.navbarUI), optionsUI: !!(T && T.optionsUI),
    loaderFiles: T && T.loaded ? T.loaded.filter((f) => /^loader\//.test(f)).sort() : [],
    auNodes: document.querySelectorAll('#app .smallNode.au').length, playerAu: au,
    layerNodes: document.querySelectorAll('#app .treeNode').length,
    playerKeys: (() => { try { return Object.keys(player).filter((k) => k !== 'au').sort().join(','); } catch (e) { return null; } })(),
    stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length, title: document.title,
    stored: T && T.prefs ? T.prefs.read() : null, search: location.search,
    pageErrors: T && T.pageErrors ? T.pageErrors.length : 0,
    settingsFrom: T && T.settings ? T.settings.from : null, tableFrom: T ? T.tableFrom || null : null,
    autoTable: T && T.autoTable !== undefined ? JSON.stringify(T.autoTable) : null,
    features: T && T.features ? T.features.length : 0,
    storagePrefix: T && T.storage ? T.storage.prefix : null,
  };
};
// what "the same page" means between the embed page and its hosted twin (the hosted page is built by boot(); these are
// the fields attach decides). ⚠ loaderFiles is compared WITHOUT tmt-auto.js on a page without automation: the hosted
// page carries the harness contract on every page, an author's page only with automation (attach.mjs, `contract`).
const RENDER_KEYS = ['flags', 'htmlClasses', 'mobileCss', 'navbarCss', 'layerListCss', 'nav', 'navButtons', 'layerListUI', 'navbarUI', 'auNodes', 'playerAu'];
const render = (f) => ({ ...Object.fromEntries(RENDER_KEYS.map((k) => [k, f[k]])),
  loaderFiles: f.loaderFiles.filter((x) => (f.flags && f.flags.automation) || x !== 'loader/tmt-auto.js') });
const same = (a, b) => JSON.stringify(render(a)) === JSON.stringify(render(b));
const settle = (p) => p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
const OPT = '#tmt-loader-options';
const openOptions = async (p) => {
  const bar = await p.$('#tmt-navbar button[data-key="options"]');
  if (bar && await bar.isVisible()) await bar.click(); else await p.click('#optionWheel');
  await p.waitForSelector(OPT, { timeout: 10000 });
};
const onOff = (s) => ({ mobile: s.includes('mobile'), navbar: s.includes('navbar') || s.includes('mobile'), automation: s.includes('automation') });

async function gameRow(browser, S, id) {
  const man = readManifest(id);
  const external = (man.load && man.load.external) || {};
  const vendor = (man.load && man.load.vendor) || {};
  const missing = [...(((man.load || {}).known || {}).missingAssets || []), ...(((man.load || {}).known || {}).missingScripts || [])];
  const row = { gate: 'E1', id, engine: man.engine && man.engine.tmtNum, legs: {}, requests: [] };
  const errors = [];

  /** One page in its own context. def = fixture | {hosted: '<query>'}; returns act(p) or the fingerprint. */
  const draw = async (label, def, { query = '', prefs = null, ctx = DESKTOP_CONTEXT, act = null, bare = false, expectError = false } = {}) => {
    const { context: c, stats } = await openContext(browser, { contextOptions: ctx });
    // the game's own internet: the manifest's vendored copies, and an empty answer for what the loader drops
    await c.route((u) => u.href in external, (route) => {
      const url = route.request().url();
      const v = vendor[url];
      if (v && v.path) return route.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(path.join(REPO, v.path)) });
      return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    });
    try {
      if (prefs !== null) await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) { /* blocked */ } }, ['tmt-loader:ui.flags', prefs]);
      const p = await c.newPage();
      const pageUrl = def.hosted !== undefined ? new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1${def.hosted ? `&${def.hosted}` : ''}`, S.loaderBase).href
        : S.fixture(def) + (query ? `?${query}` : '');
      await p.goto(pageUrl, { waitUntil: 'load' });
      if (bare) await p.waitForFunction(() => typeof player !== 'undefined' && document.readyState === 'complete', null, { timeout: 30000 });
      else { const r = await waitReady(p); if (!r.ready && !(expectError && r.error)) throw new Error(`${label}: not ready: ${JSON.stringify(r.error)}`); }
      await settle(p);
      // a page that NAVIGATES (a press reloads it) asked for the files of every state it was in: the first and the last
      // (every press in these legs moves between those two)
      const first = def.hosted === undefined && !bare ? await p.evaluate(FP) : null;
      const out = act ? await act(p) : await p.evaluate(FP);
      // (vii) every EMBED page's requests, judged by what it resolved
      if (def.hosted === undefined && !bare) {
        const f = await p.evaluate(FP);
        const pw = stats.of(p);
        const currency = await p.evaluate(() => !!(window.tmtLoader && window.tmtLoader.currencyData));
        const fromFile = f.tableFrom === 'author';
        const gid = def.attrs && def.attrs.game || (def.file && def.file.game) || null;
        const declared = new Set([...declaredLoaderFiles(f.flags || {}, { id: gid, auto: man.auto, currency, fromFile }),
          ...declaredLoaderFiles(first.flags || {}, { id: gid, auto: man.auto, currency, fromFile })]);
        const j = judgeEmbed({ urls: pw.urls, failed: pw.failed, loaderBase: S.loaderBase, gameBase: pageUrl.split('?')[0], external,
          declared, settings: !!(def.attrs && def.attrs.settings), missing });
        row.requests.push({ label, ok: j.ok, loaderAsked: j.loaderAsked, undeclared: j.undeclared, gameFromLoader: j.gameFromLoader,
          externalUndeclared: j.externalUndeclared, failedBad: j.failedBad.slice(0, 3), settingsAsked: j.settingsAsked, blocked: pw.blocked.length });
        if (!j.ok) errors.push(`${label}: REQUESTS ${JSON.stringify({ undeclared: j.undeclared, gameFromLoader: j.gameFromLoader, externalUndeclared: j.externalUndeclared, failedBad: j.failedBad.slice(0, 3) })}`);
      }
      errors.push(...stats.of(p).pageErrors.map((m) => `${label}: ${m}`), ...stats.of(p).blocked.map((u) => `${label}: BLOCKED ${u}`));
      return out;
    } finally { await c.close(); }
  };
  const hosted = {};
  const hostedPage = async (q) => (hosted[q] ??= await draw(`hosted ${q || 'plain'}`, { hosted: q }));
  const leg = (name, ok, detail) => { row.legs[name] = { ok: !!ok, ...detail }; };

  // a leg that THROWS is RED by name, never a row that dies: one broken leg must not hide what the others measured
  const guard = async (name, fn) => { try { await fn(); } catch (e) { leg(name, false, { exception: String((e && e.message) || e).slice(0, 300) }); } };
  // the gate's own affordance for the options tab where it does not need the section (e.g. there should be none)
  const openTab = async (p) => { const bar = await p.$('#tmt-navbar button[data-key="options"]'); if (bar && await bar.isVisible()) await bar.click(); else await p.click('#optionWheel'); };
  const press = async (p, flag) => {
    await openOptions(p);
    await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 30000 }), p.click(`${OPT} button[data-flag="${flag}"]`)]);
    const r = await waitReady(p);
    if (!r.ready) throw new Error(`not ready after the press: ${JSON.stringify(r.error)}`);
    await settle(p);
    return p.evaluate(FP);
  };
  const reload = async (p) => { await p.reload({ waitUntil: 'load' }); const r = await waitReady(p); if (!r.ready) throw new Error('not ready after reload'); await settle(p); return p.evaluate(FP); };
  // the hosted twins every leg compares against — the CONTROLS; if one of these fails, the row fails outright
  const hPlain = await hostedPage('');
  const hNavbar = await hostedPage('navbar=1');
  const hAuto = await hostedPage('automation=1');
  const hMobile = await hostedPage('mobile=1');

  // ---- i: INERT — the tag, everything loaded, nothing on, is the game's own page -------------------------------------
  await guard('i-inert', async () => {
  const bare = await draw('bare (no tag)', { id, noTag: true }, { bare: true });
  const inert = await draw('i inert', { id, attrs: {} });
  const inertReq = row.requests.find((r) => r.label === 'i inert');
  const INERT_FILES = ['loader/attach.mjs', 'loader/embed.mjs', 'loader/flags.mjs', 'loader/options.js', 'v1/embed.js'];
  leg('i-inert', inert.ready && inert.embed && !inert.error
    && JSON.stringify(inert.flags) === JSON.stringify({ mobile: false, navbar: false, automation: false })
    && inert.htmlClasses.length === 0 && !inert.mobileCss && !inert.navbarCss && !inert.layerListCss && !inert.nav
    && inert.auNodes === 0 && !inert.playerAu && JSON.stringify(inert.loaderFiles) === JSON.stringify(['loader/options.js'])
    && inert.layerNodes === bare.layerNodes && inert.layerNodes >= 1 && inert.playerKeys === bare.playerKeys && inert.stylesheets === bare.stylesheets
    && inert.title === bare.title && Object.keys(inert.stored).length === 0
    && inertReq && JSON.stringify(inertReq.loaderAsked) === JSON.stringify(INERT_FILES),
  { flags: inert.flags, htmlClasses: inert.htmlClasses, loaderFiles: inert.loaderFiles, layerNodes: [inert.layerNodes, bare.layerNodes],
    stylesheets: [inert.stylesheets, bare.stylesheets], playerKeysEqual: inert.playerKeys === bare.playerKeys, loaderAsked: inertReq && inertReq.loaderAsked });

  });
  await guard('ii-author-defaults', async () => {
  // ---- ii: each author default, alone and in combination → exactly those on, and the hosted page's twin ------------
  const subsets = [['mobile'], ['navbar'], ['automation'], ['mobile', 'navbar'], ['mobile', 'automation'], ['navbar', 'automation'], ['mobile', 'navbar', 'automation']];
  const ii = [];
  for (const s of subsets) {
    const f = await draw(`ii on=${s.join('+')}`, { id, attrs: { on: s.join(' ') } });
    const h = await hostedPage(s.map((x) => `${x}=1`).join('&'));
    const want = onOff(s);
    const srcOk = FLAGS.every((x) => want[x] ? (f.source[x] === 'author' || (x === 'navbar' && f.source[x] === 'implied')) : f.source[x] === 'default');
    ii.push({ on: s, flags: f.flags, source: f.source, equalHosted: same(f, h), srcOk, ok: JSON.stringify(f.flags) === JSON.stringify(want) && srcOk && same(f, h) && !f.error,
      ...(same(f, h) ? {} : { embed: render(f), hosted: render(h) }) });
  }
  leg('ii-author-defaults', ii.every((x) => x.ok), { rows: ii });

  });
  await guard('iii-not-loaded', async () => {
  // ---- iii: NOT LOADED — no button, a URL parameter does nothing, and the combination mobile-without-navbar ------------
  const iii = {};
  iii.urlIgnored = await draw('iii load=mobile ?navbar=1&automation=1', { id, attrs: { load: 'mobile' } }, { query: 'navbar=1&automation=1', act: async (p) => {
    const f = await p.evaluate(FP);
    await openOptions(p);
    const btns = await p.$$eval(`${OPT} button[data-flag]`, (b) => b.map((x) => x.dataset.flag));
    return { flags: f.flags, source: f.source, buttons: btns, loaderFiles: f.loaderFiles };
  } });
  iii.mobileIgnored = await draw('iii load=navbar+automation ?mobile=1', { id, attrs: { load: 'navbar automation' } }, { query: 'mobile=1', act: async (p) => {
    const f = await p.evaluate(FP);
    await openOptions(p);
    const btns = await p.$$eval(`${OPT} button[data-flag]`, (b) => b.map((x) => x.dataset.flag));
    return { flags: f.flags, source: f.source, buttons: btns, mobileCss: f.mobileCss };
  } });
  // ⚖ mobile loaded, nav bar NOT loaded, mobile on: the layout brings its bar (flags.mjs), and there is no Nav bar button
  iii.mobileNoNavbar = await draw('iii load=mobile on=mobile', { id, attrs: { load: 'mobile', on: 'mobile' } }, { ctx: PHONE_CONTEXT, act: async (p) => {
    const f = await p.evaluate(FP);
    await openOptions(p);
    const btns = await p.$$eval(`${OPT} button[data-flag]`, (b) => b.map((x) => x.dataset.flag));
    return { f, buttons: btns };
  } });
  const noneLoaded = await draw('iii load=""', { id, attrs: { load: '' } }, { query: 'mobile=1&navbar=1&automation=1', act: async (p) => {
    const f = await p.evaluate(FP);
    await openTab(p); await settle(p);
    return { f, section: (await p.$(OPT)) !== null };
  } });
  const u = iii.urlIgnored, m = iii.mobileIgnored, mn = iii.mobileNoNavbar;
  leg('iii-not-loaded', u.flags.navbar === false && u.flags.automation === false && u.source.navbar === 'absent' && u.source.automation === 'absent'
    && JSON.stringify(u.buttons) === JSON.stringify(['mobile']) && !u.loaderFiles.some((x) => /navbar|layerlist|tmt-auto/.test(x))
    && m.flags.mobile === false && m.source.mobile === 'absent' && !m.mobileCss && JSON.stringify(m.buttons) === JSON.stringify(['navbar', 'automation'])
    && mn.f.flags.mobile === true && mn.f.flags.navbar === true && mn.f.source.navbar === 'implied' && same(mn.f, hMobile)
    && JSON.stringify(mn.buttons) === JSON.stringify(['mobile'])
    && noneLoaded.f.flags && !noneLoaded.f.flags.mobile && !noneLoaded.f.flags.navbar && !noneLoaded.f.flags.automation && !noneLoaded.section && !noneLoaded.f.optionsUI,
  { urlIgnored: u, mobileIgnored: m, mobileNoNavbar: { flags: mn.f.flags, source: mn.f.source, buttons: mn.buttons, equalHosted: same(mn.f, hMobile) },
    noneLoaded: { flags: noneLoaded.f.flags, section: noneLoaded.section } });

  });
  // ---- iv: a PLAYER PRESS overrides the author's default, and is remembered across a reload ------------------------
  await guard('iv-press-remembered', async () => {
  const iv = await draw('iv on=navbar, press', { id, attrs: { on: 'navbar' } }, { act: async (p) => {
    const start = await p.evaluate(FP);
    const off = await press(p, 'navbar');            // the author said ON; the player says OFF
    const offAgain = await reload(p);                // …and it is remembered
    const autoOn = await press(p, 'automation');     // a default-off feature, turned on
    const autoAgain = await reload(p);
    const back = await press(p, 'navbar');           // and the navbar back on: remembered as the player's, not the author's
    return { start, off, offAgain, autoOn, autoAgain, back };
  } });
  leg('iv-press-remembered', iv.start.flags.navbar && iv.start.source.navbar === 'author'
    && !iv.off.flags.navbar && iv.off.source.navbar === 'stored' && iv.off.stored.navbar === false && same(iv.off, hPlain)
    && !iv.offAgain.flags.navbar && same(iv.offAgain, hPlain)
    && iv.autoOn.flags.automation && iv.autoOn.source.automation === 'stored' && same(iv.autoOn, hAuto) && same(iv.autoAgain, hAuto)
    && iv.back.flags.navbar && iv.back.source.navbar === 'stored' && iv.back.stored.navbar === true,
  { steps: Object.fromEntries(Object.entries(iv).map(([k, f]) => [k, { flags: f.flags, source: f.source, stored: f.stored }])) });

  });
  await guard('v-url-first', async () => {
  // ---- v: the URL overrides the remembered choice AND the author's default --------------------------------------------
  const v = {};
  v.onOverStoredOff = await draw('v on=navbar stored navbar:false ?navbar=1', { id, attrs: { on: 'navbar' } }, { prefs: JSON.stringify({ navbar: false }), query: 'navbar=1' });
  v.offOverAuthor = await draw('v on=navbar ?navbar=0', { id, attrs: { on: 'navbar' } }, { query: 'navbar=0' });
  v.offOverStoredOn = await draw('v stored automation:true ?automation=0', { id, attrs: {} }, { prefs: JSON.stringify({ automation: true }), query: 'automation=0' });
  v.storedOverAuthor = await draw('v on=automation stored automation:false', { id, attrs: { on: 'automation' } }, { prefs: JSON.stringify({ automation: false }) });
  leg('v-url-first', v.onOverStoredOff.flags.navbar && v.onOverStoredOff.source.navbar === 'url' && same(v.onOverStoredOff, hNavbar)
    && !v.offOverAuthor.flags.navbar && v.offOverAuthor.source.navbar === 'url' && same(v.offOverAuthor, hPlain)
    && !v.offOverStoredOn.flags.automation && v.offOverStoredOn.source.automation === 'url' && same(v.offOverStoredOn, hPlain)
    && !v.storedOverAuthor.flags.automation && v.storedOverAuthor.source.automation === 'stored' && same(v.storedOverAuthor, hPlain),
  Object.fromEntries(Object.entries(v).map(([k, f]) => [k, { flags: f.flags, source: f.source }])));

  });
  await guard('vi-settings-file', async () => {
  // ---- vi: tmt-loader.json — per field over the tag; its autoTable is the one in force ------------------------------
  // The author's table is distinctive by construction: the generic kind order REVERSED, which no game's table uses.
  const authorTable = { formatVersion: 1, kindOrder: ['clickables', 'challenges', 'buyables', 'upgrades', 'reset', 'toggles'] };
  const vi = {};
  vi.file = await draw('vi file over tag', { id, attrs: { on: 'navbar', load: 'mobile navbar automation', settings: true },
    file: { load: ['navbar', 'automation'], on: ['automation'], autoTable: authorTable } });
  vi.tagOnly = await draw('vi tag only, data-settings, no file', { id, attrs: { on: 'navbar', settings: true } });
  const loaderTable = man.auto ? fs.readFileSync(path.join(REPO, man.auto), 'utf8') : null;
  vi.gameNoFile = await draw('vi data-game, automation on', { id, attrs: { on: 'automation', game: id } });
  vi.gameAndFile = await draw('vi data-game + file table', { id, attrs: { on: 'automation', game: id, settings: true }, file: { autoTable: authorTable } });
  vi.derived = await draw('vi no game, no file', { id, attrs: { on: 'automation' } });
  vi.broken = await draw('vi a broken table', { id, attrs: { on: 'automation', settings: true }, file: { autoTable: { kindOrder: ['x'] } } }, { act: async (p) => {
    // the extras failed; the GAME did not: its tree is drawn and its loop is running
    const f = await p.evaluate(FP);
    const t0 = await p.evaluate(() => player.time);
    await p.waitForTimeout(600);
    const t1 = await p.evaluate(() => player.time);
    return { f, running: t1 !== t0 };
  }, expectError: true }).catch((e) => ({ exception: String(e.message || e).slice(0, 200) }));
  const F = vi.file;
  leg('vi-settings-file', F.flags.mobile === false && F.source.mobile === 'absent' && F.flags.navbar === false && F.flags.automation === true
    && F.settingsFrom.load === 'file' && F.settingsFrom.on === 'file' && F.tableFrom === 'author' && F.autoTable === JSON.stringify({ id: 'embed', ...authorTable }) && F.features > 0
    && vi.tagOnly.flags.navbar === true && vi.tagOnly.settingsFrom.on === 'tag'
    && vi.gameNoFile.tableFrom === (man.auto ? 'loader' : 'derived') && (man.auto ? JSON.stringify(JSON.parse(loaderTable)) === vi.gameNoFile.autoTable : vi.gameNoFile.autoTable === null)
    && vi.gameAndFile.tableFrom === 'author' && vi.gameAndFile.autoTable === JSON.stringify({ id, ...authorTable })
    && vi.derived.tableFrom === 'derived' && vi.derived.autoTable === null && vi.derived.features > 0
    && vi.broken.f && vi.broken.f.error && /autoTable|kindOrder|formatVersion/.test(vi.broken.f.error.message) && vi.broken.f.layerNodes >= 1 && vi.broken.running,
  { file: { flags: F.flags, from: F.settingsFrom, tableFrom: F.tableFrom, features: F.features }, tagOnly: { flags: vi.tagOnly.flags, from: vi.tagOnly.settingsFrom },
    gameNoFile: { tableFrom: vi.gameNoFile.tableFrom }, gameAndFile: { tableFrom: vi.gameAndFile.tableFrom }, derived: { tableFrom: vi.derived.tableFrom, features: vi.derived.features },
    broken: vi.broken.f ? { error: vi.broken.f.error, layerNodes: vi.broken.f.layerNodes, running: vi.broken.running } : vi.broken });
  // the broken page's own pageerror/console is the point of that leg — it is not an error of the gate's
  for (let k = errors.length - 1; k >= 0; k--) if (errors[k].startsWith('vi a broken table: ') && !/REQUESTS|BLOCKED/.test(errors[k])) errors.splice(k, 1);

  });
  await guard('M-layout', async () => {
  // ---- M: M1's layout legs — the phone page and the desktop nav-bar page, against their hosted twins -----------------
  const probe = (p) => p.evaluate(MOBILE_PROBE);
  const phone = await draw('M phone on=mobile', { id, attrs: { on: 'mobile' } }, { ctx: PHONE_CONTEXT, act: probe });
  const phoneHosted = await draw('M phone hosted ?mobile=1', { hosted: 'mobile=1' }, { ctx: PHONE_CONTEXT, act: probe });
  const desk = await draw('M desktop on=navbar', { id, attrs: { on: 'navbar' } }, { act: probe });
  const deskHosted = await draw('M desktop hosted ?navbar=1', { hosted: 'navbar=1' }, { act: probe });
  const deskPlain = await draw('M desktop hosted plain', { hosted: '' }, { act: probe });
  const fits = (x) => x.escaping.length === 0 && x.docScrollWidth <= x.vw + 1;
  const near = (a, b) => a.length === b.length && a.every((w, i) => Math.abs(w - b[i]) <= 2);
  leg('M-layout', fits(phone) && phone.tooSmall.length <= phoneHosted.tooSmall.length && /tmt-mobile/.test(phone.htmlClass) && phone.hasMobileCss
    && JSON.stringify(phone.navButtons) === JSON.stringify(phoneHosted.navButtons) && phone.navH > 0 && near(phone.cols, phoneHosted.cols)
    && phone.overlayPos === phoneHosted.overlayPos
    && !/tmt-mobile/.test(desk.htmlClass) && !desk.hasMobileCss && desk.hasNavbarCss && desk.navH > 0
    && JSON.stringify(desk.navButtons) === JSON.stringify(deskHosted.navButtons) && near(desk.cols, deskPlain.cols) && desk.overlayPos === deskPlain.overlayPos
    && desk.docScrollWidth <= Math.max(deskHosted.docScrollWidth, desk.vw + 1),
  { phone: { escaping: phone.escaping.length, tooSmall: [phone.tooSmall.length, phoneHosted.tooSmall.length], nav: phone.navButtons, hostedNav: phoneHosted.navButtons, cols: [phone.cols, phoneHosted.cols], overlay: [phone.overlayPos, phoneHosted.overlayPos] },
    desktop: { nav: desk.navButtons, hostedNav: deskHosted.navButtons, cols: [desk.cols, deskPlain.cols], overlay: [desk.overlayPos, deskPlain.overlayPos] } });

  });
  await guard('O-options', async () => {
  // ---- O: O1's options legs on the embed page -------------------------------------------------------------------------
  const O = {};
  O.section = await draw('O section', { id, attrs: {} }, { act: async (p) => {
    const before = await p.evaluate(() => ({ s: !!document.querySelector('#tmt-loader-options'), st: !!document.getElementById('tmt-loader-options-style') }));
    await openOptions(p);
    const open = await p.evaluate(() => {
      const s = document.querySelector('#tmt-loader-options');
      const btns = Array.from(s.querySelectorAll('button[data-flag]'));
      return { flags: btns.map((b) => b.dataset.flag), labels: btns.map((b) => b.textContent), note: s.querySelector('.tmt-loader-options-note').textContent,
        home: !!s.querySelector('.tmt-loader-options-home'), inTab: !!s.closest('.col, .fullWidth') };
    });
    await p.evaluate(() => { try { showTab('none'); } catch (e) { /* engines differ */ } });
    await p.waitForSelector(OPT, { state: 'detached', timeout: 10000 }).catch(() => {});
    const after = await p.evaluate(() => !!document.querySelector('#tmt-loader-options'));
    return { before, open, after };
  } });
  O.pressOverUrl = await draw('O press over ?mobile=1', { id, attrs: {} }, { query: 'mobile=1', act: (p) => press(p, 'mobile') });
  O.locked = await draw('O locked navbar', { id, attrs: { on: 'mobile' } }, { act: async (p) => {
    await openOptions(p);
    const label = await p.evaluate(() => { const b = document.querySelector('#tmt-loader-options button[data-flag="navbar"]'); return { text: b.textContent, locked: b.classList.contains('locked') }; });
    const before = await p.evaluate(FP);
    await p.click(`${OPT} button[data-flag="navbar"]`);
    await settle(p);
    const after = await p.evaluate(FP);
    return { label, same: same(before, after), stored: after.stored, url: after.search };
  } });
  const Os = O.section;
  leg('O-options', !Os.before.s && !Os.before.st && JSON.stringify(Os.open.flags) === JSON.stringify(FLAGS) && Os.open.labels.every((t) => /: (ON|OFF)/.test(t))
    && /reloads the page/.test(Os.open.note) && /this site/.test(Os.open.note) && !Os.open.home && Os.open.inTab && !Os.after
    && same(O.pressOverUrl, hPlain) && !/mobile=/.test(O.pressOverUrl.search) && O.pressOverUrl.stored.mobile === false
    && O.locked.label.locked && /with the mobile layout/.test(O.locked.label.text) && O.locked.same && Object.keys(O.locked.stored).length === 0,
  { section: Os, pressOverUrl: { flags: O.pressOverUrl.flags, search: O.pressOverUrl.search, stored: O.pressOverUrl.stored }, locked: O.locked });

  });

  // ---- T: THE TIMING — the extras go in when the page's own `load` fires, not when the tag runs. A 2.7 game's
  // js/technical/loader.js inserts its mod files as ASYNC scripts; on a slow site they arrive after the tag's modules
  // and, had attach run early, tmt-auto.js would derive its features from a half-built `layers`. The site delays those
  // files; the automation page must still equal its hosted twin, feature count included. A game with no such files
  // (2.2.1 names every script in its index.html) cannot show this and ABSTAINS, by name.
  await guard('T-timing', async () => {
    const statics = new Set((man.load && man.load.scripts) || []);
    const dynamic = ((man.load && man.load.modFiles) || []).length;
    if (!dynamic) { leg('T-timing', true, { verdict: 'abstains: every script is named in index.html (no async mod files)' }); return; }
    const t = await draw('T slow mod files, on=automation', { id, attrs: { on: 'automation' }, delay: { ms: 1500, static: statics } });
    leg('T-timing', t.flags.automation && !t.error && t.features === hAuto.features && t.features > 0 && same(t, hAuto),
      { features: [t.features, hAuto.features], delayed: dynamic, verdict: t.features === hAuto.features ? 'the extras waited for the late mod files' : 'THE EXTRAS RAN BEFORE THE GAME HAD LOADED' });
  });

  // ---- vii: the requests of every embed page above ------------------------------------------------------------------
  leg('vii-requests', row.requests.length > 0 && row.requests.every((r) => r.ok), { pages: row.requests.length, red: row.requests.filter((r) => !r.ok).map((r) => r.label) });

  row.errors = errors.slice(0, 8);
  row.errorCount = errors.length;
  row.ok = Object.values(row.legs).every((l) => l.ok) && errors.length === 0;
  return row;
}

async function main() {
  const a = parseArgs(process.argv.slice(2), []);
  const ids = a._.length ? a._ : ['ptr', 'something'];
  const S = await startEmbedServers();
  const browser = await chromium.launch();
  const rows = [];
  try {
    for (const id of ids) {
      const t0 = Date.now();
      let row;
      try { row = await gameRow(browser, S, id); } catch (e) { row = { gate: 'E1', id, ok: false, exception: String((e && e.stack) || e).slice(0, 800) }; }
      row.ms = Date.now() - t0;
      rows.push(row);
      const legs = row.legs ? Object.entries(row.legs).map(([k, l]) => `${k}=${l.ok ? 'ok' : 'RED'}`).join(' ') : '';
      console.log(`E1 ${id}: ${row.ok ? 'GREEN' : 'RED'} ${legs} errors=${row.errorCount ?? '-'}${row.exception ? ` EXCEPTION ${row.exception.split('\n')[0]}` : ''}`);
      if (!row.ok) console.log(JSON.stringify({ ...row, requests: undefined }, null, 1).slice(0, 6000));
    }
  } finally { await browser.close(); await S.stop(); }
  const green = rows.filter((r) => r.ok).length;
  console.log(`E1 embed: ${green}/${rows.length} GREEN`);
  if (a.json) writeJSON(a.json, { gate: 'E1', commit: headCommit(), ids, rows });
  process.exit(green === rows.length ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
