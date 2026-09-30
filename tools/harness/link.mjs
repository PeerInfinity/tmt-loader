// Gate L1 — LINK MODE (S5; docs/link.md): `index.html?repo=<owner>/<name>[@<commit>][&source=…]`.
//
//   node tools/harness/link.mjs [--json out.json] [--only <leg>,<leg>] [--live]
//
// ⛔ THE NETWORK IS FAKED. Link mode reaches three services the gate must not depend on — an author's GitHub Pages
// site (`<owner>.github.io`), jsDelivr (`cdn.jsdelivr.net`, and its listing API `data.jsdelivr.com`) and GitHub's API
// (`api.github.com`). Each is answered here, inside the browser context (Playwright routes by host), in the shape the
// real one has (measured, plan S0 item 3 + "Measured facts"): CORS `*` everywhere; jsDelivr sends an index.html as
// `text/plain` and a file over 20 MB as HTTP 403 "File size exceeded the configured limit of 20 MB."; GitHub's API
// answers `commits/HEAD` with a bare sha under `Accept: application/vnd.github.sha`. The files each fake serves are the
// games' own (the loader's copies, games/<id>/), under whatever repository name a leg registers. Every request any of
// them answers is COUNTED, and the loader itself is a local server — so every request a page makes is accounted for
// (leg R), as G1 does. Anything else is blocked and is a RED.
//
// `--live` is NOT the gate: it opens ONE real game from EACH real source (a handful of requests, labelled LIVE), and
// asserts only that each came up from the source it was forced to.
//
// Legs (each its own browser context, so a session cache or a stored preference never leaks between them):
//   S-pages / S-cdn / S-hosted   each source ALONE (`&source=`): the game comes up from that source and asks no other
//   F-order        unpinned: the author's site down → jsDelivr at the latest commit; pinned: jsDelivr down → hosted
//   F-oversize     a file over 20 MB on the CDN → the hosted copy (the recorded list, and jsDelivr's listing API)
//   A-api          `@<commit>` makes no API request; "latest" makes one, and a reload in the tab makes none (cached)
//   K-save         a listed game keeps its manifest id: a save written on the hosted page is the link page's save
//   U-unknown      an unknown repository derives its manifest and boots (2.2.1 and 2.7), with the derived id
//   D-declined     a declined game loads, and its recorded reason is shown
//   J-settings     the author's tmt-loader.json is read through the chosen source and its autoTable is the one in force
//   X-attach       ?mobile=1, ?navbar=1, ?automation=1 and a stored choice: the link page equals its hosted twin
//   E-errors       a link that is not a repository, or a repository no source has: the page says so in plain words
//   R-requests     every page above: each request declared (loader, the chosen source, the API only where expected)
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { REPO, parseArgs, writeJSON, readManifest, freePort, gameDir, gamePath, headCommit } from './lib.mjs';
import { openContext, waitReady, DESKTOP_CONTEXT } from './page.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const CORS = { 'access-control-allow-origin': '*' };
const inside = (root, rel) => { const f = path.resolve(root, '.' + path.posix.normalize('/' + rel)); return f.startsWith(root + path.sep) ? f : null; };
const lc = (s) => String(s).toLowerCase();
const FAKE_HOSTS = /(^|\.)github\.io$|^cdn\.jsdelivr\.net$|^data\.jsdelivr\.com$|^api\.github\.com$/;

// ---------------------------------------------------------------- the loader: a local server (the repository root)
export async function startLoader() {
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    let f = inside(REPO, decodeURIComponent(u.pathname));
    if (!f && u.pathname === '/') f = path.join(REPO, 'index.html');
    if (!f) { res.writeHead(403); return res.end(); }
    let st; try { st = fs.statSync(f); } catch { res.writeHead(404); return res.end('not found'); }
    if (st.isDirectory()) { f = path.join(f, 'index.html'); try { st = fs.statSync(f); } catch { res.writeHead(404); return res.end(); } }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  const port = freePort();
  await new Promise((r, j) => { srv.once('error', j); srv.listen(port, '127.0.0.1', r); });
  return { base: `http://127.0.0.1:${port}/`, stop: () => new Promise((r) => srv.close(r)) };
}

const listFiles = (root, rel = '') => fs.readdirSync(path.join(root, rel), { withFileTypes: true }).flatMap((e) => e.isDirectory()
  ? listFiles(root, path.posix.join(rel, e.name)) : [{ name: path.posix.join(rel, e.name), size: fs.statSync(path.join(root, rel, e.name)).size }]);

// ---------------------------------------------------------------- the fakes: one "world" per leg
/**
 * A world of repositories: repo(owner/name, {id, commit, latest, pages, cdn, over, listing, apiDown, settings})
 *   id        the game whose files (games/<id>/) this repository serves
 *   commit    the commit jsDelivr serves it at (default: that game's manifest upstream.commit); any other → 404
 *   latest    what GitHub says HEAD is (default: commit)
 *   pages     'up' | 'down' (the author's site answers 404)       cdn 'up' | 'down' (503)
 *   over      paths jsDelivr refuses as over 20 MB               listing [{name,size}] | 'too-big' (jsDelivr's 403)
 *   apiDown   GitHub answers 403 (the hourly limit) to everything
 *   settings  the author's tmt-loader.json (object or text), served by Pages and jsDelivr beside index.html
 */
export function makeWorld() {
  const repos = new Map();
  const W = { repos, api: [], listing: [], served: [], refused: [] };
  W.repo = (full, cfg) => {
    const [owner, name] = full.split('/');
    const man = readManifest(cfg.id);
    const commit = cfg.commit || man.upstream.commit;
    repos.set(lc(full), { owner, name, pages: 'up', cdn: 'up', over: [], listing: undefined, ...cfg, commit, latest: cfg.latest || commit });
    return W;
  };
  const find = (o, n) => repos.get(lc(`${o}/${n}`)) || null;
  const file = (route, cfg, rest, { cdn = false } = {}) => {
    if (rest === '' ) rest = 'index.html';
    if (rest === 'tmt-loader.json') {
      if (cfg.settings === undefined) return route.fulfill({ status: 404, headers: CORS, contentType: 'text/plain', body: 'not found' });
      return route.fulfill({ status: 200, headers: CORS, contentType: cdn ? 'application/json; charset=utf-8' : 'application/json', body: typeof cfg.settings === 'string' ? cfg.settings : JSON.stringify(cfg.settings) });
    }
    if (cdn && cfg.over.includes(rest)) { W.refused.push(rest); return route.fulfill({ status: 403, headers: CORS, contentType: 'text/plain; charset=utf-8', body: 'File size exceeded the configured limit of 20 MB.' }); }
    const f = inside(gameDir(cfg.id), rest);
    if (!f || !fs.existsSync(f) || !fs.statSync(f).isFile()) return route.fulfill({ status: 404, headers: CORS, contentType: 'text/plain', body: 'not found' });
    W.served.push(rest);
    const ext = path.extname(f).toLowerCase();
    // jsDelivr sends HTML as text/plain (measured); a Pages site as text/html
    const type = cdn && ext === '.html' ? 'text/plain; charset=utf-8' : TYPES[ext] || 'application/octet-stream';
    return route.fulfill({ status: 200, headers: CORS, contentType: type, body: fs.readFileSync(f) });
  };
  W.handle = (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { ...CORS, 'access-control-allow-headers': '*' } });
    const parts = decodeURIComponent(u.pathname).split('/').slice(1);
    if (/\.github\.io$/.test(u.hostname)) {
      const owner = u.hostname.replace(/\.github\.io$/, '');
      const cfg = find(owner, parts[0]);
      if (!cfg || cfg.pages === 'down') return route.fulfill({ status: 404, headers: CORS, contentType: 'text/html', body: '<h1>404</h1><p>There isn\'t a GitHub Pages site here.</p>' });
      return file(route, cfg, parts.slice(1).join('/'));
    }
    if (u.hostname === 'cdn.jsdelivr.net') {
      const m = parts[0] === 'gh' && /^([^@]+)@(.+)$/.exec(parts[2] || '');
      const cfg = m && find(parts[1], m[1]);
      if (!cfg || !cfg.commit.startsWith(m[2])) return route.fulfill({ status: 404, headers: CORS, contentType: 'text/plain', body: 'Couldn\'t find the requested release version' });
      if (cfg.cdn === 'down') return route.fulfill({ status: 503, headers: CORS, contentType: 'text/plain', body: 'unavailable' });
      return file(route, cfg, parts.slice(3).join('/'), { cdn: true });
    }
    if (u.hostname === 'data.jsdelivr.com') {
      W.listing.push(u.href);
      const m = /^\/v1\/packages\/gh\/([^/]+)\/([^@/]+)@(.+)$/.exec(decodeURIComponent(u.pathname));
      const cfg = m && find(m[1], m[2]);
      // default: the real listing of the files served (their sizes on disk); 'too-big' = jsDelivr declining a repository over 50 MB
      if (cfg && cfg.listing === undefined) cfg.listing = listFiles(gameDir(cfg.id));
      if (!cfg || cfg.listing === 'too-big') return route.fulfill({ status: 403, headers: CORS, contentType: 'application/json', body: JSON.stringify({ status: 403, message: 'Package size exceeded the configured limit of 50 MB.' }) });
      return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ type: 'gh', files: cfg.listing.map((f) => ({ name: '/' + f.name, size: f.size })) }) });
    }
    if (u.hostname === 'api.github.com') {
      W.api.push(u.href);
      const m = /^\/repos\/([^/]+)\/([^/]+)(\/commits\/HEAD)?$/.exec(decodeURIComponent(u.pathname));
      const cfg = m && find(m[1], m[2]);
      if (cfg && cfg.apiDown) return route.fulfill({ status: 403, headers: CORS, contentType: 'application/json', body: JSON.stringify({ message: 'API rate limit exceeded' }) });
      if (!cfg) return route.fulfill({ status: 404, headers: CORS, contentType: 'application/json', body: JSON.stringify({ message: 'Not Found' }) });
      if (m[3]) return route.fulfill({ status: 200, headers: CORS, contentType: 'application/vnd.github.sha', body: cfg.latest });
      return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ full_name: `${cfg.owner}/${cfg.name}` }) });
    }
    return route.abort('blockedbyclient');
  };
  return W;
}

// ---------------------------------------------------------------- the fingerprint (the fields attach decides + the link record)
const FP = () => {
  const T = window.tmtLoader || null;
  const au = (() => { try { return typeof player !== 'undefined' && player && !!player.au; } catch (e) { return false; } })();
  const banner = document.getElementById('tmt-loader-link');
  const over = document.getElementById('tmt-loader-error');
  return {
    ready: !!(T && T.ready), error: T ? T.error : null, id: T ? T.id : null, link: T ? T.link || null : null,
    derived: !!(T && T.manifest && T.manifest.derived), tableFrom: T ? T.tableFrom || null : null,
    autoTable: T && T.autoTable !== undefined ? JSON.stringify(T.autoTable) : null,
    flags: T && T.flags ? { ...T.flags } : null, flagSource: T ? T.flagSource || null : null,
    htmlClasses: (document.documentElement.className.match(/tmt-[\w-]+/g) || []).sort(),
    mobileCss: !!document.getElementById('tmt-loader-mobile-css'), navbarCss: !!document.getElementById('tmt-loader-navbar-css'),
    nav: !!document.getElementById('tmt-navbar'),
    navButtons: Array.from(document.querySelectorAll('#tmt-navbar .tmt-navbar-btn')).filter((b) => !b.hidden).map((b) => b.dataset.key).sort(),
    loaderFiles: T && T.loaded ? T.loaded.filter((f) => /^loader\//.test(f)).sort() : [],
    auNodes: document.querySelectorAll('#app .smallNode.au').length, playerAu: au,
    layerNodes: document.querySelectorAll('#app .treeNode').length,
    features: T && T.features ? T.features.length : 0,
    storagePrefix: T && T.storage ? T.storage.prefix : null,
    base: (document.querySelector('base') || {}).href || null,
    banner: banner ? banner.textContent : null, bannerWarnings: banner ? Array.from(banner.querySelectorAll('.tmt-loader-link-warning')).map((e) => e.textContent) : [],
    overlay: over ? over.textContent : null,
    points: (() => { try { return String(player.points); } catch (e) { return null; } })(),
  };
};
const TWIN_KEYS = ['flags', 'flagSource', 'htmlClasses', 'mobileCss', 'navbarCss', 'nav', 'navButtons', 'loaderFiles', 'auNodes', 'playerAu', 'layerNodes', 'features'];
const twin = (f) => JSON.stringify(Object.fromEntries(TWIN_KEYS.map((k) => [k, f[k]])));

// ---------------------------------------------------------------- the request verdict (leg R)
/**
 * Every request one link page made, judged. `expect` = {id, known, source (the one it came up from), auto, automation,
 * fromAuthor, api (the API requests allowed), vendor (loader vendor paths the plan may use), failed: [url prefixes that
 * may fail: a source that was tried and did not work]}.
 */
export function judgeLink({ urls, failed, blocked, loaderBase, expect }) {
  const L = new URL(loaderBase);
  const bad = [];
  const gamesDir = gamePath('', '').replace(/\/+$/, '/');
  const allowedLoader = (p) => {
    if (p === '' || p === 'index.html' || /^loader\/[\w./-]+$/.test(p)) return true;
    if (['manifests/index.json', 'manifests/declined.json', 'vendor/index.json', 'link/cdn-over-limit.json'].includes(p)) return true;
    if (/^vendor\/[\w.-]+\.js$/.test(p)) return true;
    if (expect.known && p === `manifests/${expect.id}.json`) return true;
    if (expect.known && expect.automation && !expect.fromAuthor && expect.auto && p === expect.auto) return true;
    if (expect.known && expect.automation && (p === 'games-data/index.json' || p === `games-data/${expect.id}.json`)) return true;
    if (p.startsWith(gamesDir)) return expect.source === 'hosted' && p.startsWith(gamePath(expect.id, ''));
    return false;
  };
  const sourceBase = expect.base;
  let api = 0;
  for (const u of urls) {
    let x; try { x = new URL(u); } catch { continue; }
    if (x.protocol === 'data:' || x.protocol === 'blob:') continue;
    if (x.origin === L.origin) { const p = x.pathname.slice(L.pathname.length); if (!allowedLoader(p)) bad.push(`loader: ${p}`); continue; }
    if (x.hostname === 'api.github.com') { api++; continue; }
    if (x.hostname === 'data.jsdelivr.com') { if (!expect.listing) bad.push(`listing asked: ${u}`); continue; }
    if (sourceBase && u.startsWith(sourceBase)) continue;
    if ((expect.tried || []).some((t) => u.startsWith(t))) continue;
    bad.push(`other: ${u}`);
  }
  if (api > (expect.api ?? 0)) bad.push(`API requests: ${api} > ${expect.api ?? 0}`);
  const failedBad = failed.filter((f) => {
    const u = String(f).split(' ')[0];
    if (/net::ERR_ABORTED/.test(String(f)) && !failed.some((g) => g !== f && String(g).split(' ')[0] === u)) return false;
    if ((expect.tried || []).some((t) => u.startsWith(t))) return false;          // a source that did not work
    if (sourceBase && u === new URL('tmt-loader.json', sourceBase).href && / HTTP 404$/.test(String(f))) return false;   // no author file
    if (u.startsWith('https://data.jsdelivr.com/') && expect.listing) return false;  // the listing declines a big repository
    if (u.startsWith('https://api.github.com/') && expect.apiFails) return false;
    return true;
  });
  const ok = bad.length === 0 && failedBad.length === 0 && blocked.length === 0;
  return { ok, bad, failedBad, blocked, api };
}

// ---------------------------------------------------------------- the legs
async function run(browser, S, only) {
  const legs = {};
  const pages = [];
  const leg = (name, ok, detail = {}) => { legs[name] = { ok: !!ok, ...detail }; };
  const want = (name) => !only || only.some((o) => name.startsWith(o));
  const guard = async (name, fn) => { if (!want(name)) return; try { await fn(); } catch (e) { leg(name, false, { exception: String((e && e.message) || e).slice(0, 400) }); } };
  const PTR = readManifest('ptr'), SOME = readManifest('something'), WALL = readManifest('the-wall-tree');

  /**
   * One context: world W, pages opened in turn (same tab unless `newTab`). steps = [{q, prefs?, act?, expect?}].
   * Returns [{fp, req, ms}] per step.
   */
  const session = async (label, W, steps) => {
    const { context: c, stats } = await openContext(browser, { contextOptions: DESKTOP_CONTEXT });
    try {
      await c.route((u) => FAKE_HOSTS.test(u.hostname), (route) => W.handle(route));
      // a remembered choice, as E1 plants it: before any page script (so before the save-prefix shim), every navigation
      const prefs = steps.find((s) => s.prefs);
      if (prefs) await c.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) { /* blocked */ } }, ['tmt-loader:ui.flags', prefs.prefs]);
      const p = await c.newPage();
      const out = [];
      for (const s of steps) {
        const before = { urls: stats.of(p).urls.length, failed: stats.of(p).failed.length, blocked: stats.of(p).blocked.length };
        const t0 = Date.now();
        await p.goto(new URL(`index.html?${s.q}`, S.base).href, { waitUntil: 'load' });
        const r = await waitReady(p, t0, 45000).catch((e) => ({ ready: false, error: { message: String(e.message || e) } }));
        await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
        const fp = await p.evaluate(FP);
        const act = s.act ? await s.act(p) : undefined;
        const pw = stats.of(p);
        const urls = pw.urls.slice(before.urls), failed = pw.failed.slice(before.failed), blocked = pw.blocked.slice(before.blocked);
        let req = null;
        if (s.expect) {
          const e = typeof s.expect === 'function' ? s.expect(fp) : s.expect;
          req = judgeLink({ urls, failed, blocked, loaderBase: S.base, expect: { ...e, base: e.base || (fp.link && fp.base) } });
          pages.push({ label: `${label} · ${s.q}`, ok: req.ok, bad: req.bad.slice(0, 4), failedBad: req.failedBad.slice(0, 4), blocked: req.blocked.slice(0, 4), api: req.api });
        }
        out.push({ fp, req, act, ms: Date.now() - t0, errors: pw.pageErrors.slice() });
      }
      return out;
    } finally { await c.close(); }
  };
  // the expectation of a page that came up (link mode) from `source`, with `tried` sources that did not work
  const ex = (id, known, source, more = {}) => (fp) => ({ id, known, source, auto: known ? readManifest(id).auto : null,
    automation: !!(fp.flags && fp.flags.automation), fromAuthor: fp.tableFrom === 'author', ...more });
  const up = (fp, source, id) => fp.ready && !fp.error && fp.link && fp.link.source === source && fp.id === id && fp.layerNodes > 0;
  const TRIED = { pages: (o, n) => `https://${lc(o)}.github.io/${n}/`, cdn: (o, n, c) => `https://cdn.jsdelivr.net/gh/${o}/${n}@${c}/` };

  // ---- S: each source alone ------------------------------------------------------------------------------------------
  for (const src of ['pages', 'cdn', 'hosted']) await guard(`S-${src}`, async () => {
    const W = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr' });
    const [a] = await session(`S-${src}`, W, [{ q: `repo=Jacorb90/Prestige-Tree@${PTR.upstream.commit}&source=${src}&managed=1`, expect: ex('ptr', true, src) }]);
    const base = { pages: TRIED.pages('Jacorb90', 'Prestige-Tree'), cdn: TRIED.cdn('Jacorb90', 'Prestige-Tree', PTR.upstream.commit), hosted: new URL(gamePath('ptr', ''), S.base).href }[src];
    leg(`S-${src}`, up(a.fp, src, 'ptr') && a.fp.base === base && a.fp.link.tried.length === 1 && W.api.length === 0 && a.req.ok,
      { base: a.fp.base, tried: a.fp.link && a.fp.link.tried, api: W.api.length, requests: a.req && a.req.ok, error: a.fp.error });
  });

  // ---- F: the fallback order -----------------------------------------------------------------------------------------
  await guard('F-order', async () => {
    // unpinned: the author's site is down → jsDelivr at the LATEST commit (which GitHub reports)
    const W1 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', pages: 'down' });
    const [a] = await session('F-order unpinned', W1, [{ q: 'repo=Jacorb90/Prestige-Tree&managed=1',
      expect: ex('ptr', true, 'cdn', { api: 1, tried: [TRIED.pages('Jacorb90', 'Prestige-Tree')] }) }]);
    // pinned: jsDelivr is down → the hosted copy (the Pages site is not tried: hosted comes before it for a pin)
    const W2 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', cdn: 'down' });
    const [b] = await session('F-order pinned', W2, [{ q: `repo=Jacorb90/Prestige-Tree@${PTR.upstream.commit}&managed=1`,
      expect: ex('ptr', true, 'hosted', { tried: [TRIED.cdn('Jacorb90', 'Prestige-Tree', PTR.upstream.commit)] }) }]);
    // unpinned, Pages AND jsDelivr down → hosted, the page saying why it moved on
    const W3 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', pages: 'down', cdn: 'down' });
    const [c] = await session('F-order both down', W3, [{ q: 'repo=Jacorb90/Prestige-Tree&managed=1',
      expect: ex('ptr', true, 'hosted', { api: 1, tried: [TRIED.pages('Jacorb90', 'Prestige-Tree'), TRIED.cdn('Jacorb90', 'Prestige-Tree', PTR.upstream.commit)] }) }]);
    const order = (fp) => fp.link ? fp.link.tried.map((t) => `${t.source}:${t.ok ? 'ok' : 'no'}`).join(' ') : null;
    leg('F-order', up(a.fp, 'cdn', 'ptr') && order(a.fp) === 'pages:no cdn:ok' && a.fp.link.commit === PTR.upstream.commit
      && up(b.fp, 'hosted', 'ptr') && order(b.fp) === 'cdn:no hosted:ok'
      && up(c.fp, 'hosted', 'ptr') && order(c.fp) === 'pages:no cdn:no hosted:ok' && /because/.test(JSON.stringify(c.fp.link.notices))
      && a.req.ok && b.req.ok && c.req.ok,
    { unpinned: order(a.fp), pinned: order(b.fp), bothDown: order(c.fp), why: c.fp.link && c.fp.link.notices });
  });

  await guard('F-oversize', async () => {
    // the recorded list (link/cdn-over-limit.json): the-wall-tree at its tested commit → straight to the hosted copy,
    // never asking jsDelivr for a file of the game (nor its listing: the record covers that commit)
    const W1 = makeWorld().repo('hanlaosan1/The-Wall-Tree', { id: 'the-wall-tree', over: ['discord.png', 'remove.png'] });
    const [a] = await session('F-oversize recorded', W1, [{ q: `repo=hanlaosan1/The-Wall-Tree@${WALL.upstream.commit}&managed=1`, expect: ex('the-wall-tree', true, 'hosted') }]);
    // jsDelivr's LISTING (a commit the record does not cover): a file over 20 MB there → the hosted copy
    const other = 'f'.repeat(40);
    const W2 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', commit: other, listing: [{ name: 'index.html', size: 5000 }, { name: 'music/theme.ogg', size: 25 * 1024 * 1024 }] });
    const [b] = await session('F-oversize listing', W2, [{ q: `repo=Jacorb90/Prestige-Tree@${other}&managed=1`, expect: ex('ptr', true, 'hosted', { listing: true }) }]);
    // …and a listing with nothing over the limit → jsDelivr it is
    const W3 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', commit: other, listing: [{ name: 'index.html', size: 5000 }] });
    const [c] = await session('F-oversize listing small', W3, [{ q: `repo=Jacorb90/Prestige-Tree@${other}&managed=1`, expect: ex('ptr', true, 'cdn', { listing: true }) }]);
    const why = (fp) => (fp.link && fp.link.tried[0] && fp.link.tried[0].why) || '';
    leg('F-oversize', up(a.fp, 'hosted', 'the-wall-tree') && /20 MB/.test(why(a.fp)) && /discord\.png/.test(why(a.fp)) && W1.served.length === 0 && W1.listing.length === 0
      && up(b.fp, 'hosted', 'ptr') && /theme\.ogg/.test(why(b.fp)) && W2.listing.length === 1 && W2.served.length === 0
      && up(c.fp, 'cdn', 'ptr') && W3.listing.length === 1
      && a.req.ok && b.req.ok && c.req.ok,
    { recorded: why(a.fp), listing: why(b.fp), small: c.fp.link && c.fp.link.source, cdnFilesServed: [W1.served.length, W2.served.length] });
  });

  // ---- A: the API ----------------------------------------------------------------------------------------------------
  await guard('A-api', async () => {
    const W1 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', pages: 'down' });
    await session('A-api pinned', W1, [{ q: `repo=Jacorb90/Prestige-Tree@${PTR.upstream.commit}&managed=1`, expect: ex('ptr', true, 'cdn') }]);
    const W2 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', pages: 'down' });
    const r = await session('A-api latest', W2, [
      { q: 'repo=Jacorb90/Prestige-Tree&managed=1', expect: ex('ptr', true, 'cdn', { api: 1, tried: [TRIED.pages('Jacorb90', 'Prestige-Tree')] }) },
      { q: 'repo=Jacorb90/Prestige-Tree&managed=1', expect: ex('ptr', true, 'cdn', { api: 0, tried: [TRIED.pages('Jacorb90', 'Prestige-Tree')] }) },
    ]);
    // an author's site that works needs no API request even for "latest"
    const W3 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr' });
    const [c] = await session('A-api pages', W3, [{ q: 'repo=Jacorb90/Prestige-Tree&managed=1', expect: ex('ptr', true, 'pages') }]);
    leg('A-api', W1.api.length === 0 && W2.api.length === 1 && /commits\/HEAD$/.test(W2.api[0]) && up(r[0].fp, 'cdn', 'ptr') && up(r[1].fp, 'cdn', 'ptr')
      && up(c.fp, 'pages', 'ptr') && W3.api.length === 0,
    { pinned: W1.api.length, latestTwoLoads: W2.api.length, pagesLatest: W3.api.length });
  });

  // ---- K: a listed game keeps its id, and its save ---------------------------------------------------------------------
  await guard('K-save', async () => {
    const W = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr' });
    const r = await session('K-save', W, [
      { q: 'mod=ptr&managed=1', act: (p) => p.evaluate(() => { player.points = new Decimal(424242); save(); return String(player.points); }) },
      { q: `repo=jacorb90/prestige-tree@${PTR.upstream.commit}&source=cdn&managed=1`, expect: ex('ptr', true, 'cdn'),
        act: (p) => p.evaluate(() => player.points.gte(424242)) },
    ]);
    leg('K-save', r[0].act === '424242' && up(r[1].fp, 'cdn', 'ptr') && r[1].fp.storagePrefix === 'tmt-loader:ptr:' && r[1].act === true,
      { id: r[1].fp.id, prefix: r[1].fp.storagePrefix, carried: r[1].act, points: r[1].fp.points });
  });

  // ---- U: an unknown repository --------------------------------------------------------------------------------------
  await guard('U-unknown', async () => {
    const W = makeWorld().repo('some-author/My-Tree', { id: 'ptr', commit: 'a'.repeat(40) }).repo('other-author/Async.Tree', { id: 'something', commit: 'b'.repeat(40) });
    const [a] = await session('U 2.2.1', W, [{ q: `repo=some-author/My-Tree@${'a'.repeat(40)}&source=cdn&managed=1`, expect: ex('gh--some-author--my-tree', false, 'cdn', { listing: true }) }]);
    const [b] = await session('U 2.7', W, [{ q: `repo=other-author/Async.Tree@${'b'.repeat(40)}&source=pages&managed=1`, expect: ex('gh--other-author--async-tree', false, 'pages') }]);
    const [h] = await session('U hosted twin', W, [{ q: 'mod=something&managed=1' }]);
    leg('U-unknown', up(a.fp, 'cdn', 'gh--some-author--my-tree') && a.fp.derived && a.fp.storagePrefix === 'tmt-loader:gh--some-author--my-tree:'
      && up(b.fp, 'pages', 'gh--other-author--async-tree') && b.fp.derived && b.fp.layerNodes === h.fp.layerNodes
      && a.req.ok && b.req.ok && a.errors.length === 0 && b.errors.length === 0,
    { ids: [a.fp.id, b.fp.id], nodes: [a.fp.layerNodes, b.fp.layerNodes, h.fp.layerNodes], errors: [...a.errors, ...b.errors].slice(0, 3) });
  });

  // ---- D: a declined game ---------------------------------------------------------------------------------------------
  await guard('D-declined', async () => {
    const declined = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/declined.json'), 'utf8'));
    const d = declined[0];
    const W = makeWorld().repo(d.repo, { id: 'ptr', commit: 'c'.repeat(40) });
    const [a] = await session('D-declined', W, [{ q: `repo=${d.repo}@${'c'.repeat(40)}&managed=1`, expect: ex(null, false, 'cdn', { listing: true }) }]);
    const shown = a.fp.bannerWarnings.join(' ');
    leg('D-declined', a.fp.ready && a.fp.link && a.fp.link.declined && shown.includes(d.reason) && shown.includes(d.short),
      { repo: d.repo, shown: shown.slice(0, 200) });
  });

  // ---- J: the author's tmt-loader.json --------------------------------------------------------------------------------
  await guard('J-settings', async () => {
    const authorTable = { formatVersion: 1, kindOrder: ['clickables', 'challenges', 'buyables', 'upgrades', 'reset', 'toggles'] };
    const r = {};
    for (const src of ['pages', 'cdn']) {
      const W = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', settings: { autoTable: authorTable } });
      [r[src]] = await session(`J ${src}`, W, [{ q: `repo=Jacorb90/Prestige-Tree@${PTR.upstream.commit}&source=${src}&managed=1&automation=1`, expect: ex('ptr', true, src),
        act: (p) => p.evaluate(() => ({ order: tmtLoader.autoTable && tmtLoader.autoTable.kindOrder, id: tmtLoader.autoTable && tmtLoader.autoTable.id })) }]);
    }
    // no file → the loader's own table (games-auto/ptr.json), as on the hosted page
    const W0 = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr' });
    const [n] = await session('J none', W0, [{ q: `repo=Jacorb90/Prestige-Tree@${PTR.upstream.commit}&source=cdn&managed=1&automation=1`, expect: ex('ptr', true, 'cdn') }]);
    const ok = (x) => x.fp.ready && x.fp.tableFrom === 'author' && JSON.stringify(x.act.order) === JSON.stringify(authorTable.kindOrder) && x.act.id === 'ptr' && x.fp.features > 0;
    leg('J-settings', ok(r.pages) && ok(r.cdn) && n.fp.tableFrom === 'loader' && JSON.parse(n.fp.autoTable).kindOrder[0] === 'toggles',
      { pages: r.pages.act, cdn: r.cdn.act, none: n.fp.tableFrom });
  });

  // ---- X: attach's flags, exactly as on the hosted page ------------------------------------------------------------------
  await guard('X-attach', async () => {
    const cases = [['mobile=1'], ['navbar=1'], ['automation=1'], ['', '{"navbar":true}'], ['navbar=0', '{"navbar":true,"automation":true}']];
    const out = [];
    for (const [q, prefs] of cases) {
      const W = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr' });
      const r = await session(`X ${q || prefs}`, W, [
        { q: `mod=ptr&managed=1${q ? `&${q}` : ''}`, prefs },
        { q: `repo=Jacorb90/Prestige-Tree@${PTR.upstream.commit}&source=pages&managed=1${q ? `&${q}` : ''}`, prefs, expect: ex('ptr', true, 'pages') },
      ]);
      out.push({ q: q || `stored ${prefs}`, same: twin(r[0].fp) === twin(r[1].fp), link: r[1].fp.flags, hosted: r[0].fp.flags, diff: twin(r[0].fp) === twin(r[1].fp) ? null : [twin(r[0].fp), twin(r[1].fp)] });
    }
    // the stored cases must have READ the store (a leg that plants nothing compares two inert pages)
    const stored = out.filter((o) => o.q.startsWith('stored'));
    leg('X-attach', out.every((o) => o.same) && stored.length === 1 && stored[0].link.navbar === true && out[4].link.automation === true && out[4].link.navbar === false,
      { cases: out });
  });

  // ---- E: the page says what went wrong ---------------------------------------------------------------------------------
  await guard('E-errors', async () => {
    const W = makeWorld().repo('Jacorb90/Prestige-Tree', { id: 'ptr', pages: 'down', cdn: 'down' });
    const [a] = await session('E not a repo', W, [{ q: 'repo=not-a-repository' }]);
    const [b] = await session('E bad commit', W, [{ q: 'repo=Jacorb90/Prestige-Tree@main' }]);
    const W2 = makeWorld().repo('nobody/Gone-Tree', { id: 'ptr', commit: 'e'.repeat(40), pages: 'down', cdn: 'down' });
    const [c] = await session('E nothing works', W2, [{ q: `repo=nobody/Gone-Tree@${'e'.repeat(40)}` }]);
    const [d] = await session('E bad source', W, [{ q: 'repo=Jacorb90/Prestige-Tree&source=ftp' }]);
    leg('E-errors', /is not a repository/.test(a.fp.overlay || '') && /is not a commit/.test(b.fp.overlay || '')
      && /could not be loaded from any source/.test(c.fp.overlay || '') && /jsDelivr: .*HTTP 503/.test(c.fp.overlay || '') && /author's own site .*HTTP 404/.test(c.fp.overlay || '')
      && /is not a source/.test(d.fp.overlay || '') && [a, b, c, d].every((x) => !x.fp.ready && /could not be opened/.test(x.fp.overlay || '')),
    { messages: [a, b, c, d].map((x) => (x.fp.overlay || '').slice(0, 160)) });
  });

  // ---- R: every request of every link page above ---------------------------------------------------------------------
  if (!only || only.includes('R')) leg('R-requests', pages.length > 0 && pages.every((p) => p.ok), { pages: pages.length, red: pages.filter((p) => !p.ok) });
  return legs;
}

// ---------------------------------------------------------------- LIVE (not the gate): one real game from each real source
async function live(browser, S) {
  const out = {};
  const m = readManifest('ptr');
  for (const src of ['pages', 'cdn', 'hosted']) {
    const { context: c, stats } = await openContext(browser, { contextOptions: DESKTOP_CONTEXT, allowExternal: true });
    try {
      const p = await c.newPage();
      await p.goto(new URL(`index.html?repo=${m.upstream.repo}@${m.upstream.commit}&source=${src}&managed=1`, S.base).href, { waitUntil: 'load' });
      const r = await waitReady(p, Date.now(), 60000).catch((e) => ({ ready: false, error: String(e) }));
      const fp = await p.evaluate(FP);
      const hosts = [...new Set(stats.of(p).urls.map((u) => { try { return new URL(u).hostname; } catch { return u; } }))];
      out[src] = { ok: !!(r.ready && fp.link && fp.link.source === src && fp.layerNodes > 0), source: fp.link && fp.link.source, base: fp.base, requests: stats.of(p).urls.length, hosts, error: fp.error };
    } finally { await c.close(); }
    console.log(`L1 LIVE ${src}: ${out[src].ok ? 'up' : 'DOWN'} (${out[src].requests} requests; hosts ${out[src].hosts.join(' ')})${out[src].error ? ` ${JSON.stringify(out[src].error)}` : ''}`);
  }
  return out;
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['live']);
  const S = await startLoader();
  const browser = await chromium.launch();
  let legs, liveOut = null;
  try {
    if (a.live) liveOut = await live(browser, S);
    else legs = await run(browser, S, a.only ? String(a.only).split(',') : null);
  } finally { await browser.close(); await S.stop(); }
  if (liveOut) { const ok = Object.values(liveOut).every((x) => x.ok); console.log(`L1 LIVE: ${ok ? 'each real source served the game' : 'a real source did not'}`); process.exit(ok ? 0 : 1); }
  for (const [k, l] of Object.entries(legs)) {
    console.log(`L1 ${k}: ${l.ok ? 'ok' : 'RED'}`);
    if (!l.ok) console.log(JSON.stringify(l, null, 1).slice(0, 3000));
  }
  const n = Object.keys(legs).length, green = Object.values(legs).filter((l) => l.ok).length;
  console.log(`L1 link: ${green}/${n} legs GREEN`);
  if (a.json) writeJSON(a.json, { gate: 'L1', commit: headCommit(), legs });
  process.exit(green === n && n > 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
