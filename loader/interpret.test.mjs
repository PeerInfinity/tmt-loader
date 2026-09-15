import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { interpret, scriptNames, InterpretError, executionOrder, modFilePaths, loaderPrefixOf } from './interpret.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (p) => fs.readFileSync(ROOT + p, 'utf8');
const manifest = (id) => JSON.parse(read(`manifests/${id}.json`));
const FONT = 'https://fonts.googleapis.com/css?family=Inconsolata';

for (const id of ['ptr', 'something']) {
  test(`${id}: script list = manifest.load.scripts with loader.js replaced by the modFiles slot`, () => {
    const m = manifest(id);
    const loader = m.load.scripts.find((s) => /(^|\/)loader\.js$/i.test(s));
    const plan = interpret(read(`games/${id}/index.html`), m, { loaderSource: loader ? read(`games/${id}/${loader}`) : undefined });
    const want = m.load.scripts.map((s) => (s === loader ? '<modFiles>' : s));
    assert.deepEqual(scriptNames(plan), want);
    assert.deepEqual(plan.dropped, [FONT]);
    assert.equal(plan.onload, 'load()');
    const vendor = plan.scripts.filter((s) => s.vendor);
    assert.equal(vendor.length, 1);
    assert.equal(vendor[0].vendor.path, Object.values(m.load.vendor)[0].path);
    assert.ok(plan.body.html.includes('id="app"'));
    assert.equal(plan.body.html.includes('<script'), false);
    assert.deepEqual(plan.scripts.filter((s) => s.renderOnly).map((s) => s.src), m.load.renderOnly);
    const { slot } = executionOrder(plan);
    if (loader) {
      assert.equal(slot.prefix, m.load.modFilesPrefix);
      assert.equal(loaderPrefixOf(read(`games/${id}/${loader}`)), m.load.modFilesPrefix);
      assert.equal(modFilePaths(slot, m.load.modFiles)[0], m.load.modFilesPrefix + m.load.modFiles[0]);
    } else assert.equal(slot, null);
  });
}

test('ptr: stylesheets in order, local kept with their attributes, font dropped', () => {
  const plan = interpret(read('games/ptr/index.html'), manifest('ptr'));
  assert.deepEqual(plan.links.map((l) => l.href || l.external), ['style.css', 'notification.css', FONT]);
  assert.equal(plan.links[0].attrs.id, 'styleStuff');
  assert.deepEqual(plan.body.attrs, {});
});

test('something: body attributes besides onload; slot sits right after js/mod.js', () => {
  const plan = interpret(read('games/something/index.html'), manifest('something'));
  assert.deepEqual(plan.body.attrs, { onmousemove: 'updateMouse(event)' });
  const names = scriptNames(plan);
  assert.equal(names[names.indexOf('js/mod.js') + 1], '<modFiles>');
  assert.equal(plan.links.filter((l) => l.href).length, 8);
});

test('unknown external / vendor without path fail with a named error, never a silent CDN fetch', () => {
  const html = '<head><script src="https://cdn.example/x.js"></script></head><body onload="load()"></body>';
  assert.throws(() => interpret(html, { load: { external: {} } }), (e) => e instanceof InterpretError && /not in manifest/.test(e.message));
  assert.throws(() => interpret(html, { load: { external: { 'https://cdn.example/x.js': 'vendor' }, vendor: {} } }), /no path/);
});

test('module scripts skipped; inline scripts kept in order; comments ignored', () => {
  const html = '<head><!-- <script src="js/old.js"></script> --><script type="module" src="m.js"></script><script>var a=1</script><script src="./js/b.js?v=2"></script></head><body>x<script>var c</script></body>';
  const plan = interpret(html, { load: {} });
  assert.deepEqual(scriptNames(plan), ['inline#1', 'js/b.js', 'inline#2']);
  assert.equal(plan.scripts[0].inline, 'var a=1');
  assert.equal(plan.body.html, 'x');
});
