// Embed mode (S4, docs/embed.md): the parts that can be wrong in a way no single page shows — the v1 settings, the
// order that decides whether a feature is on, the request verdict gate E1 uses, and the shape of the files that make
// up the author's tag. Node builtins and relative imports only: the `units` job installs nothing.
//
// ⛔ THE MATRIX IS THE TEST, as in flags.test.mjs: for a LOADED feature every cell of {url on, url off, url absent} ×
// {stored on, stored off, stored absent} × {author on, author off} is asserted for the value AND for who said so; for
// a feature that is NOT loaded, every one of those cells is off and `absent`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FLAGS, serializePrefs, parsePrefs, resolveEmbedFlags, readSettings, normaliseSettings, parseList } from './flags.mjs';
import { declaredLoaderFiles, judgeEmbed } from '../tools/harness/embedverdict.mjs';
import { gamePath } from '../tools/harness/lib.mjs';

const P = (q) => new URLSearchParams(q);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '..');
const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');

test('the order for a LOADED feature: URL → remembered → author default → off (every cell, value and source)', () => {
  for (const flag of ['automation', 'navbar', 'mobile']) {
    for (const url of ['1', '0', null]) for (const stored of [true, false, undefined]) for (const author of [true, false]) {
      const settings = { load: { mobile: true, navbar: true, automation: true }, on: { [flag]: author } };
      const r = resolveEmbedFlags(P(url === null ? '' : `${flag}=${url}`), stored === undefined ? {} : { [flag]: stored }, settings);
      const want = url !== null ? { on: url === '1', source: 'url' }
        : stored !== undefined ? { on: stored, source: 'stored' }
        : author ? { on: true, source: 'author' } : { on: false, source: 'default' };
      const cell = `${flag} url=${url} stored=${stored} author=${author}`;
      if (flag === 'navbar' || !(flag === 'mobile' && want.on)) {
        assert.equal(r[flag], want.on, cell);
        assert.equal(r.source[flag], want.source, cell);
      }
      if (flag === 'mobile') {
        assert.equal(r.mobile, want.on, cell);
        assert.equal(r.source.mobile, want.source, cell);
        // the layout always brings the bar
        if (want.on) { assert.equal(r.navbar, true, cell); assert.equal(r.source.navbar, 'implied', cell); }
      }
    }
  }
});

test('a feature that is NOT loaded is off in every cell — the URL, the store and the author default all ignored', () => {
  for (const flag of FLAGS) {
    for (const url of ['1', '0', null]) for (const stored of [true, false, undefined]) for (const author of [true, false]) {
      const load = { mobile: true, navbar: true, automation: true, [flag]: false };
      const r = resolveEmbedFlags(P(url === null ? '' : `${flag}=${url}`), stored === undefined ? {} : { [flag]: stored }, { load, on: { [flag]: author } });
      assert.equal(r[flag], false, `${flag} url=${url} stored=${stored} author=${author}`);
      assert.equal(r.source[flag], 'absent');
      assert.equal(r.loaded[flag], false);
    }
  }
});

test('⚖ mobile loaded, nav bar NOT loaded: the layout still brings its bar (implied), and nothing else can turn the bar on', () => {
  const S = { load: { mobile: true, navbar: false, automation: true }, on: { mobile: true } };
  const r = resolveEmbedFlags(P('navbar=0'), { navbar: false }, S);
  assert.deepEqual([r.mobile, r.navbar, r.source.navbar], [true, true, 'implied']);
  const off = resolveEmbedFlags(P('navbar=1'), { navbar: true }, { ...S, on: {} });
  assert.deepEqual([off.mobile, off.navbar, off.source.navbar], [false, false, 'absent']);
});

test('with the tag and nothing else: every feature loaded, none on — the inert page', () => {
  const S = readSettings({}, null);
  assert.deepEqual(S.load, { mobile: true, navbar: true, automation: true });
  assert.deepEqual(S.on, { mobile: false, navbar: false, automation: false });
  assert.equal(S.game, null);
  assert.equal(S.table, undefined);
  assert.deepEqual(S.from, { load: 'default', on: 'default', game: 'default', table: 'default' });
  const r = resolveEmbedFlags(P(''), {}, S);
  assert.deepEqual([r.mobile, r.navbar, r.automation], [false, false, false]);
});

test('the six settings from the TAG: data-load and data-on name each feature separately', () => {
  const S = readSettings({ load: 'mobile automation', on: 'automation', game: 'ptr' }, null);
  assert.deepEqual(S.load, { mobile: true, navbar: false, automation: true });
  assert.deepEqual(S.on, { mobile: false, navbar: false, automation: true });
  assert.equal(S.game, 'ptr');
  assert.deepEqual(S.from, { load: 'tag', on: 'tag', game: 'tag', table: 'default' });
  // an empty data-load loads nothing; commas and spaces both separate
  assert.deepEqual(readSettings({ load: '' }, null).load, { mobile: false, navbar: false, automation: false });
  assert.deepEqual(parseList('mobile,navbar  automation', 't'), { mobile: true, navbar: true, automation: true });
});

test('tmt-loader.json replaces the tag PER FIELD; a field it does not carry leaves the tag\'s answer', () => {
  const S = readSettings({ load: 'mobile navbar', on: 'navbar', game: 'ptr' }, { on: ['mobile'], autoTable: { formatVersion: 1 } });
  assert.deepEqual(S.load, { mobile: true, navbar: true, automation: false });   // the tag's
  assert.deepEqual(S.on, { mobile: true, navbar: false, automation: false });    // the file's
  assert.equal(S.game, 'ptr');                                                   // the tag's
  assert.deepEqual(S.table, { formatVersion: 1 });
  assert.deepEqual(S.from, { load: 'tag', on: 'file', game: 'tag', table: 'file' });
  // the file can also UNSET the game (null) and load nothing ([])
  const T = readSettings({ game: 'ptr' }, { game: null, load: [] });
  assert.equal(T.game, null);
  assert.deepEqual(T.load, { mobile: false, navbar: false, automation: false });
});

test('what the settings refuse, they refuse by name and keep the page working', () => {
  const said = [];
  const w = (m) => said.push(m);
  const S = readSettings({ load: 'mobile tablet', on: 'navbar', game: '../../etc' }, { colour: 'red', load: ['navbar'] }, w);
  assert.deepEqual(S.load, { mobile: false, navbar: true, automation: false });
  assert.equal(S.game, null, 'a game id that is not a loader id is dropped');
  assert.ok(said.some((m) => /"tablet" is not a feature/.test(m)));
  assert.ok(said.some((m) => /unknown key "colour"/.test(m)));
  assert.ok(said.some((m) => /is not a loader id/.test(m)));
  // on by default but not loaded: said, and off
  const said2 = [];
  const S2 = readSettings({ load: 'mobile', on: 'automation' }, null, (m) => said2.push(m));
  assert.equal(S2.on.automation, false);
  assert.ok(said2.some((m) => /"automation" is on by default but not loaded/.test(m)));
  // a file that is not an object is ignored, with a warning
  const said3 = [];
  assert.deepEqual(readSettings({ on: 'navbar' }, ['x'], (m) => said3.push(m)).on.navbar, true);
  assert.ok(said3.some((m) => /not a JSON object/.test(m)));
  assert.deepEqual(normaliseSettings({ on: { navbar: true }, load: { navbar: false } }).on.navbar, false);
});

test('the player\'s answer is stored either way on an author\'s page, and only "on" on the hosted page', () => {
  assert.equal(serializePrefs({ navbar: false }), null, 'hosted: a false is never written');
  assert.equal(serializePrefs({ navbar: false, mobile: true }), '{"mobile":true}');
  assert.equal(serializePrefs({ navbar: false }, { keepFalse: true }), '{"navbar":false}');
  assert.deepEqual(parsePrefs(serializePrefs({ navbar: false, automation: true }, { keepFalse: true })), { navbar: false, automation: true });
});

test('E1 request verdict: exactly the loader files the resolved features need, and none for a feature that is off', () => {
  const inert = declaredLoaderFiles({ mobile: false, navbar: false, automation: false });
  assert.deepEqual([...inert].sort(), ['loader/attach.mjs', 'loader/embed.mjs', 'loader/flags.mjs', 'loader/options.js', 'v1/embed.js']);
  const mob = declaredLoaderFiles({ mobile: true, navbar: true, automation: false });
  assert.ok(mob.has('loader/mobile.css') && mob.has('loader/navbar.js') && !mob.has('loader/tmt-auto.js'));
  const auto = declaredLoaderFiles({ automation: true }, { id: 'ptr', auto: 'games-auto/ptr.json', currency: true });
  assert.ok(auto.has('loader/tmt-auto.js') && auto.has('manifests/ptr.json') && auto.has('games-auto/ptr.json') && auto.has('games-data/ptr.json'));
  assert.ok(!declaredLoaderFiles({ automation: true }).has('games-data/index.json'), 'no game id: no loader data asked for');
  assert.ok(!declaredLoaderFiles({ automation: true }, { id: 'ptr', auto: 'games-auto/ptr.json', fromFile: true }).has('games-auto/ptr.json'), 'the author\'s table replaces the loader\'s');

  const L = 'http://127.0.0.1:1/', G = 'http://127.0.0.1:2/f/x/';
  const base = { loaderBase: L, gameBase: G, external: { 'https://cdn.example/vue.js': 'vendor' }, declared: inert };
  const urls = ['v1/embed.js', 'loader/embed.mjs', 'loader/flags.mjs', 'loader/attach.mjs', 'loader/options.js'].map((f) => L + f).concat([G, G + 'js/game.js', 'https://cdn.example/vue.js']);
  assert.equal(judgeEmbed({ ...base, urls, failed: [] }).ok, true);
  // a stylesheet for a feature that is off
  const extra = judgeEmbed({ ...base, urls: urls.concat(L + 'loader/navbar.css'), failed: [] });
  assert.deepEqual([extra.ok, extra.undeclared], [false, ['loader/navbar.css']]);
  // a hosted game file, from the loader's site
  const hostedFile = gamePath('x', 'js/game.js');   // the seam's spelling (R8)
  const hostedCopy = judgeEmbed({ ...base, declared: new Set([...inert, hostedFile]), urls: urls.concat(L + hostedFile), failed: [] });
  assert.deepEqual([hostedCopy.ok, hostedCopy.gameFromLoader], [false, [hostedFile]]);
  // an external URL the manifest does not list
  assert.equal(judgeEmbed({ ...base, urls: urls.concat('https://evil.example/x.js'), failed: [] }).ok, false);
  // tmt-loader.json: only when the tag asks; a 404 is the author's "no file" and allowed then
  assert.equal(judgeEmbed({ ...base, urls: urls.concat(G + 'tmt-loader.json'), failed: [] }).ok, false);
  assert.equal(judgeEmbed({ ...base, settings: true, urls: urls.concat(G + 'tmt-loader.json'), failed: [`${G}tmt-loader.json HTTP 404`] }).ok, true);
  // a failing game file is RED unless the manifest declares it missing
  assert.equal(judgeEmbed({ ...base, urls, failed: [`${G}img/a.png HTTP 404`] }).ok, false);
  assert.equal(judgeEmbed({ ...base, urls, failed: [`${G}img/a.png HTTP 404`], missing: ['img/a.png'] }).ok, true);
});

test('⛔ attach and the embed files never name the seam: an author\'s page has no game URL (S3 → S4)', () => {
  for (const f of ['loader/attach.mjs', 'loader/embed.mjs', 'v1/embed.js']) {
    const code = read(f).split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n').replace(/\/\/.*$/gm, '');
    assert.ok(!/gameBase|installSavePrefix|<base|\.href\s*=\s*gameHref/.test(code), `${f} builds a game URL or a save prefix`);
  }
  // and page.js calls attach where it always ran its extras
  const page = read('loader/page.js');
  assert.match(page, /attachStyles\(\{ T, abs \}\)/);
  assert.match(page, /await attachScripts\(/);
  assert.ok(page.indexOf('attachStyles(') < page.indexOf('document.body.innerHTML = plan.body.html'), 'the stylesheets before the markup');
  assert.ok(page.indexOf('await attachScripts(') < page.indexOf('new Function(plan.onload)'), 'the scripts before onload');
});

test('v1/embed.js is a classic script that loads the rest RELATIVE TO ITS OWN URL (Pages and jsDelivr alike)', () => {
  const e = read('v1/embed.js');
  assert.match(e, /document\.currentScript/);
  assert.match(e, /import\(new URL\('\.\.\/loader\/embed\.mjs', me\.src\)/);
  assert.ok(!/\bimport\s+[{*\w]/.test(e.replace(/\/\/.*$/gm, '')), 'no static import: it is not a module');
  assert.ok(!/peerinfinity\.github\.io|jsdelivr/i.test(e.replace(/\/\/.*$/gm, '')), 'no host is spelled in code');
  // embed.mjs imports only its relative neighbours
  const m = read('loader/embed.mjs');
  for (const [, spec] of m.matchAll(/^import .* from '([^']+)';/gm)) assert.ok(spec.startsWith('./'), spec);
});
