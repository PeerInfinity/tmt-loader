// Link mode's browser-free half (loader/link.mjs, S5; docs/link.md). `node:` builtins and relative imports only — the
// `units` job installs nothing. Gate L1 (tools/harness/link.mjs) drives the same code in a browser against fake hosts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  parseRepo, parseSource, linkId, sourceOrder, pagesBase, cdnBase, linkBase, deriveExternal, vendorFor, deriveManifest,
  withDerived, needsVendorIndex, resolveLatest, cdnOverLimit, sessionCache, resolveLink, LinkError, SOURCE_NAMES,
} from './link.mjs';
import { interpret, executionOrder } from './interpret.mjs';
import { gameDir, gamePath } from '../tools/harness/lib.mjs';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(REPO, p), 'utf8'));
const VENDOR = readJSON('vendor/index.json');
const SHA = 'cec9198c8ce9a5c6d107179871cbe84fab92ae0d';

test('parseRepo: the link grammar, and plain words when it is wrong', () => {
  assert.deepEqual(parseRepo('Jacorb90/Prestige-Tree'), { owner: 'Jacorb90', name: 'Prestige-Tree', repo: 'Jacorb90/Prestige-Tree', commit: null });
  assert.deepEqual(parseRepo(`Jacorb90/Prestige-Tree@${SHA.toUpperCase()}`).commit, SHA);
  assert.equal(parseRepo('a/b.git@abc1234').name, 'b');
  assert.equal(parseRepo('o/My.Tree_2').name, 'My.Tree_2');
  for (const [bad, why] of [['', /is not a repository/], ['justaname', /is not a repository/], ['a/b/c', /is not a repository/],
    ['-a/b', /not a GitHub user/], ['a/..', /not a GitHub repository name/], ['a/b@main', /is not a commit/], ['a/b@abc', /is not a commit/]]) {
    assert.throws(() => parseRepo(bad), (e) => e instanceof LinkError && why.test(e.message), bad);
  }
});

test('parseSource', () => {
  assert.equal(parseSource(null), null);
  assert.equal(parseSource(''), null);
  assert.equal(parseSource('CDN'), 'cdn');
  assert.throws(() => parseSource('ftp'), /is not a source/);
});

test('⚖ D1: a listed game keeps its manifest id; any other repository gets gh--<owner>--<name>', () => {
  const index = readJSON('manifests/index.json');
  assert.deepEqual(linkId(parseRepo('jacorb90/prestige-tree'), index), { id: 'ptr', known: true, name: 'Prestige Tree Rewritten' });
  const u = linkId(parseRepo('Some-One/My.Tree_2'), index);
  assert.deepEqual(u, { id: 'gh--some-one--my-tree-2', known: false, name: null });
  assert.match(u.id, /^[a-z0-9-]+$/, 'the automation table schema allows exactly [a-z0-9-]');
  for (const g of index) assert.ok(!g.id.startsWith('gh--'), `a listed id collides with the derived form: ${g.id}`);
  // every listed repository maps to its own id (no two index rows share a repository)
  for (const g of index) assert.equal(linkId(parseRepo(g.repo), index).id, g.id);
});

test('the source order: unpinned = R3; pinned = the CDN first, Pages last; forced = one; hosted only when listed', () => {
  assert.deepEqual(sourceOrder({ pinned: false, known: true }), ['pages', 'cdn', 'hosted']);
  assert.deepEqual(sourceOrder({ pinned: true, known: true }), ['cdn', 'hosted', 'pages']);
  assert.deepEqual(sourceOrder({ pinned: false, known: false }), ['pages', 'cdn']);
  assert.deepEqual(sourceOrder({ pinned: true, known: false }), ['cdn', 'pages']);
  assert.deepEqual(sourceOrder({ pinned: true, known: false, force: 'hosted' }), ['hosted']);
});

test('the bases', () => {
  assert.equal(pagesBase('Jacorb90', 'Prestige-Tree'), 'https://jacorb90.github.io/Prestige-Tree/');
  assert.equal(pagesBase('Foo', 'foo.github.io'), 'https://foo.github.io/');
  assert.equal(cdnBase('a', 'b', SHA), `https://cdn.jsdelivr.net/gh/a/b@${SHA}/`);
  assert.equal(linkBase({ kind: 'cdn', owner: 'a', name: 'b', commit: SHA }), cdnBase('a', 'b', SHA));
  assert.equal(linkBase({ kind: 'pages', owner: 'a', name: 'b', final: 'https://x.example/' }), 'https://x.example/');
  assert.throws(() => linkBase({ kind: 'hosted' }), /gameBase/);
});

test('vendor/index.json IS the union of the manifests\' load.vendor (it is derived, not a second list)', () => {
  const union = {};
  for (const f of fs.readdirSync(path.join(REPO, 'manifests')).sort()) {
    if (!f.endsWith('.json') || f === 'index.json' || f === 'declined.json') continue;
    for (const [u, v] of Object.entries(readJSON(`manifests/${f}`).load.vendor || {})) {
      if (union[u]) assert.deepEqual(union[u], { path: v.path, sha256: v.sha256 }, `two manifests vendor ${u} differently`);
      union[u] = { path: v.path, sha256: v.sha256 };
    }
  }
  assert.deepEqual(VENDOR, union, 'regenerate vendor/index.json from the manifests (docs/link.md, "The derived manifest")');
  for (const v of Object.values(VENDOR)) assert.ok(fs.existsSync(path.join(REPO, v.path)), v.path);
});

test('the derived manifest: vendored Vue swapped, everything else from another site left out', () => {
  const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=X"><link href="css/a.css" rel="stylesheet">
    <!-- <script src="https://evil.example/x.js"></script> -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script><script src="https://unpkg.com/vue@2.7.14/dist/vue.js"></script>
    <script src="https://cdn.example/firebase.js"></script><script type="module" src="https://m.example/m.js"></script><script src="js/game.js"></script>`;
  const d = deriveExternal(html, VENDOR);
  assert.deepEqual(d.external, { 'https://cdn.jsdelivr.net/npm/vue@2.6.12': 'vendor', 'https://unpkg.com/vue@2.7.14/dist/vue.js': 'vendor',
    'https://cdn.example/firebase.js': 'drop', 'https://fonts.googleapis.com/css?family=X': 'drop' });
  assert.equal(d.vendor['https://unpkg.com/vue@2.7.14/dist/vue.js'].path, 'vendor/vue-2.7.16.min.js');
  assert.ok(d.notes.some((n) => /Vue 2\.7\.16/.test(n)) && d.notes.some((n) => /firebase\.js is left out/.test(n)));
  assert.equal(vendorFor('https://x/vue@3.4.0', VENDOR), null);
  const { manifest } = deriveManifest({ id: 'gh--a--b', parsed: parseRepo('a/b'), commit: SHA, html, vendorIndex: VENDOR });
  const plan = interpret(html, manifest);
  assert.deepEqual(plan.scripts.map((s) => s.vendor ? s.vendor.path : s.src), ['vendor/vue-2.6.12.min.js', 'vendor/vue-2.7.16.min.js', 'js/game.js']);
});

test('a listed manifest against a page it did not see: its own verdicts intact, only new URLs derived', () => {
  const m = readJSON('manifests/ptr.json');
  const page = '<script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script><script src="https://new.example/x.js"></script>';
  assert.equal(needsVendorIndex('<script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script>', m), false);
  assert.equal(needsVendorIndex(page, m), true);
  const w = withDerived(m, page, VENDOR);
  assert.equal(w.manifest.load.external['https://fonts.googleapis.com/css?family=Inconsolata'], 'drop');
  assert.equal(w.manifest.load.external['https://new.example/x.js'], 'drop');
  assert.equal(m.load.external['https://new.example/x.js'], undefined, 'the listed manifest itself is not changed');
  assert.deepEqual(w.manifest.load.scripts, m.load.scripts);
});

// ---------------------------------------------------------------- the network, faked
const res = (status, body, url) => ({ ok: status >= 200 && status < 300, status, url, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)), json: async () => (typeof body === 'string' ? JSON.parse(body) : body) });
const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m }; };

test('"latest": one API request, then the session cache; plain words when GitHub will not say', async () => {
  const calls = [];
  const fetch = async (u, o) => { calls.push([u, o && o.headers && o.headers.Accept]); return res(200, SHA + '\n'); };
  const cache = sessionCache(memStore());
  assert.deepEqual(await resolveLatest(parseRepo('a/b'), { fetch, cache }), { commit: SHA, cached: false });
  assert.deepEqual(await resolveLatest(parseRepo('A/B'), { fetch, cache }), { commit: SHA, cached: true });
  assert.deepEqual(calls, [['https://api.github.com/repos/a/b/commits/HEAD', 'application/vnd.github.sha']]);
  await assert.rejects(resolveLatest(parseRepo('c/d'), { fetch: async () => res(403, '{}'), cache }), /60 questions an hour/);
  await assert.rejects(resolveLatest(parseRepo('c/d'), { fetch: async () => res(404, '{}'), cache }), /no such repository/);
  await assert.rejects(resolveLatest(parseRepo('c/d'), { fetch: async () => res(200, '<html>'), cache }), /not a commit id/);
  // a cache that throws costs the cache, never the answer
  const broken = sessionCache({ getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } });
  assert.equal((await resolveLatest(parseRepo('a/b'), { fetch, cache: broken })).commit, SHA);
});

test('files over 20 MB: the record first (and it covers a listed game at its tested commit), then jsDelivr\'s listing', async () => {
  const recorded = readJSON('link/cdn-over-limit.json');
  const wall = readJSON('manifests/the-wall-tree.json');
  const never = async () => { throw new Error('the listing must not be asked'); };
  assert.deepEqual(await cdnOverLimit(parseRepo(wall.upstream.repo), wall.upstream.commit, { fetch: never, recorded }), { files: ['discord.png', 'remove.png'], from: 'record' });
  assert.deepEqual(await cdnOverLimit(parseRepo('Jacorb90/Prestige-Tree'), SHA, { fetch: never, recorded, covered: true }), { files: [], from: 'record' });
  const listing = async () => res(200, { files: [{ name: '/a.png', size: 21 * 1024 * 1024 }, { name: '/b.js', size: 10 }] });
  assert.deepEqual(await cdnOverLimit(parseRepo('x/y'), SHA, { fetch: listing, recorded }), { files: ['a.png'], from: 'listing' });
  assert.deepEqual((await cdnOverLimit(parseRepo('x/y'), SHA, { fetch: async () => res(403, {}), recorded })).files, null);
  // every recorded key names a listed repository at its manifest's commit (the record's own claim)
  const index = readJSON('manifests/index.json');
  for (const k of Object.keys(recorded.files)) {
    const [repo, commit] = k.split('@');
    const g = index.find((x) => x.repo.toLowerCase() === repo.toLowerCase());
    assert.ok(g, `${k}: not a listed repository`);
    assert.equal(readJSON(`manifests/${g.id}.json`).upstream.commit, commit, `${k}: not that game's tested commit`);
  }
});

/** A fake network: the loader's files from disk, and the three services from `hosts`. Records every URL. */
function fakeNet(hosts) {
  const urls = [];
  const fetch = async (u, o) => {
    urls.push(String(u));
    const x = new URL(u);
    if (x.origin === 'http://loader.test') {
      const f = path.join(REPO, decodeURIComponent(x.pathname));
      return fs.existsSync(f) && fs.statSync(f).isFile() ? res(200, fs.readFileSync(f, 'utf8'), String(u)) : res(404, 'nf', String(u));
    }
    const h = hosts(x, o);
    return h || res(404, 'nf', String(u));
  };
  return { fetch, urls };
}
const PTR_INDEX = path.join(gameDir('ptr'), 'index.html');
const PTR_HTML = fs.existsSync(PTR_INDEX) ? fs.readFileSync(PTR_INDEX, 'utf8') : null;
const deps = (params, net, extra = {}) => ({ params: new URLSearchParams(params), fetch: net.fetch, cache: sessionCache(memStore()),
  abs: (p) => new URL(p, 'http://loader.test/').href, gameBase: (id, s) => (s ? linkBase(s) : new URL(gamePath(id, ''), 'http://loader.test/').href),
  interpret, executionOrder, ...extra });

test('resolveLink: a pinned listed game comes from jsDelivr with no API request; the status says what it is doing', { skip: !PTR_HTML && 'the games submodule is not checked out' }, async () => {
  const said = [];
  const net = fakeNet((x) => x.hostname === 'cdn.jsdelivr.net' && x.pathname.endsWith('/index.html') ? res(200, PTR_HTML, x.href) : null);
  const r = await resolveLink(deps(`repo=Jacorb90/Prestige-Tree@${SHA}`, net, { status: (t) => said.push(t) }));
  assert.equal(r.id, 'ptr');
  assert.equal(r.link.source, 'cdn');
  assert.equal(r.gameHref, cdnBase('Jacorb90', 'Prestige-Tree', SHA));
  assert.equal(net.urls.filter((u) => u.includes('api.github.com')).length, 0);
  assert.equal(net.urls.filter((u) => u.includes('data.jsdelivr.com')).length, 0, 'the record covers a listed game at its tested commit');
  assert.ok(said.some((t) => /from jsDelivr \(version cec9198\)/.test(t)), said.join(' | '));
  assert.equal(r.table, null);
});

test('resolveLink: fallback reasons are kept, in order, and the last error lists every source', { skip: !PTR_HTML && 'the games submodule is not checked out' }, async () => {
  const net = fakeNet((x) => x.hostname.endsWith('github.io') ? res(404, 'nf', x.href) : x.hostname === 'cdn.jsdelivr.net' ? res(503, 'down', x.href) : null);
  // the hosted copy is moved to a host this fake does not serve (as if the games repository were gone), so everything fails
  const gone = { gameBase: (id, s) => (s ? linkBase(s) : `http://gone.test/${id}/`) };
  await assert.rejects(resolveLink(deps(`repo=Jacorb90/Prestige-Tree@${SHA}`, net, gone)), (e) => {
    assert.match(e.message, /could not be loaded from any source/);
    assert.deepEqual(e.link.tried.map((t) => t.source), ['cdn', 'hosted', 'pages']);
    assert.match(e.message, new RegExp(`${SOURCE_NAMES.cdn}: the game's index.html: HTTP 503`));
    return true;
  });
});

test('resolveLink: an unknown repository derives its manifest; a page with no scripts is not a game', async () => {
  const html = '<html><body onload="load()"><div id="app"></div><script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script><script src="js/game.js"></script></body></html>';
  const net = fakeNet((x) => x.hostname === 'someone.github.io' && x.pathname === '/Tree/index.html' ? res(200, html, x.href) : null);
  const r = await resolveLink(deps('repo=Someone/Tree', net));
  assert.equal(r.id, 'gh--someone--tree');
  assert.equal(r.manifest.derived, true);
  assert.equal(r.link.source, 'pages');
  assert.deepEqual(r.plan.scripts.map((s) => s.vendor ? s.vendor.path : s.src), ['vendor/vue-2.6.12.min.js', 'js/game.js']);
  const empty = fakeNet((x) => x.hostname === 'someone.github.io' ? res(200, '<h1>My README</h1>', x.href) : null);
  await assert.rejects(resolveLink(deps('repo=Someone/Tree&source=pages', empty)), /has no scripts — there is no game there/);
});

test('resolveLink: a declined game loads with its reason; the author\'s tmt-loader.json supplies the table', async () => {
  const declined = readJSON('manifests/declined.json')[0];
  const html = '<body onload="load()"><script src="js/game.js"></script></body>';
  const table = { formatVersion: 1, kindOrder: ['reset'] };
  const net = fakeNet((x) => {
    if (!x.hostname.endsWith('github.io')) return null;
    if (x.pathname.endsWith('/tmt-loader.json')) return res(200, { autoTable: table, on: ['navbar'] }, x.href);
    return res(200, html, x.href);
  });
  const d = deps(`repo=${declined.repo}`, net);
  const r = await resolveLink(d);
  assert.ok(r.link.warnings.some((w) => w.includes(declined.reason)));
  assert.deepEqual(r.table.value, { id: r.id, ...table });
  // cached for the session: a second resolve in the same tab does not ask for the file again
  const before = net.urls.filter((u) => u.endsWith('tmt-loader.json')).length;
  await resolveLink(d);
  assert.equal(net.urls.filter((u) => u.endsWith('tmt-loader.json')).length, before);
});
