// qedit-1 — the QUEUE EDITOR's model (`loader/tmt-qedit.js`), the runner's version 2 (`times`, `name`) and the state
// log's TAP, over the stub engine. The page itself (the components, the clicks, the phone width) is
// `tools/harness/gates-qedit.mjs`; what is tested here is the code underneath it, which runs unchanged in both.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { bootStub, tick, Decimal } from './stub-engine.mjs';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const J = (x) => JSON.parse(JSON.stringify(x));   // values from the vm's realm, compared as data
const run = (ctx, f) => vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });

function game() {
  return {
    a: {
      name: 'Alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(100) }),
      upgrades: { 11: { title: '<b>First</b> Light', cost: new Decimal(3) }, 12: { title: () => 'Second', cost: new Decimal(3) } },
      buyables: { 11: { title: 'Widget', cost: () => new Decimal(1) } },
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
        t.canReset = true; t.autoPrestige = false; t.resetGain = new Decimal(1);
        t.upgrades = { 11: { cost: new Decimal(3), unlocked: true }, 12: { cost: new Decimal(3), unlocked: true } };
        t.buyables = { 11: { cost: new Decimal(1), unlocked: true, canAfford: true } };
      },
    },
  };
}
/** The stub with a STORE: `storage.raw` over a map, the way the page's prefix shim hands the raw methods over. */
function boot({ store = new Map(), log = false } = {}) {
  const ctx = bootStub(game(), { options: { 'policy:reset:a': 'always' } });
  ctx.localStorage = {};
  const raw = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  ctx.tmtLoader.storage = { prefix: 'tmt-loader:stub:', raw };
  run(ctx, 'loader/tmt-queue.js');
  if (log) { ctx.tmtLoader.logHooks = JSON.parse(fs.readFileSync(path.join(REPO, 'loader/log-hooks.json'), 'utf8')); run(ctx, 'loader/tmt-log.js'); }
  run(ctx, 'loader/tmt-qedit.js');
  return { ctx, T: ctx.tmtLoader, E: ctx.tmtLoader.qedit, store };
}
const KEY = 'tmt-loader:stub:queues';

test('the store is ONE declared key in the loader namespace, never `player`; a reload reads it back', () => {
  const { ctx, E, store } = boot();
  const r = E.create('My First Queue');
  assert.equal(r.ok, true);
  assert.equal(r.id, 'my-first-queue');
  assert.deepEqual([...store.keys()], [KEY]);
  assert.ok(!JSON.stringify(ctx.player).includes('my-first-queue'));
  const again = boot({ store });
  assert.equal(again.E.list()[0].name, 'My First Queue');
  assert.equal(again.E.list()[0].enabled, false, 'a new queue is OFF until the player switches it on');
  E.remove(r.id);
  assert.equal(store.size, 0, 'nothing kept is nothing stored: the key goes');
});

test('steps: add, edit, move, delete; the last step cannot be deleted; the editor writes version 2', () => {
  const { E } = boot();
  const id = E.create('s').id;
  E.addStep(id, { do: 'call', fn: 'buyUpgrade', args: ['a', 11] });
  E.addStep(id, { do: 'wait', until: 'hasUpgrade("a", 11)', timeout: { gs: 5 }, onTimeout: 'abort' });
  E.moveStep(id, 2, -1);
  const q = E.store().queues[0].queue;
  assert.deepEqual(J(q.steps.map((s) => s.do)), ['comment', 'wait', 'call']);
  assert.equal(q.version, 2);
  assert.equal(E.moveStep(id, 0, -1).ok, false);
  E.deleteStep(id, 0); E.deleteStep(id, 0);
  const last = E.deleteStep(id, 0);
  assert.equal(last.ok, false);
  assert.match(last.errors[0], /at least one step/);
});

test('import REFUSES an invalid queue with reasons in plain words, and adds nothing; export → import → export is byte-equal', () => {
  const { E } = boot();
  const bad = E.importText(JSON.stringify({ format: 'tmt-queue/1', id: 'x', steps: [{ do: 'wait', until: 'true', onTimeout: 'abort' }, { do: 'hold', features: ['reset:zz'] }] }));
  assert.equal(bad.ok, false);
  assert.deepEqual(J(bad.errors), ['Step 1: a wait needs a time limit, in game-seconds, above 0.', 'Step 2: this game has no automation tool “reset:zz”.']);
  assert.equal(E.list().length, 0);
  assert.match(E.importText('{nope').errors[0], /not JSON/);
  const q = { format: 'tmt-queue/1', version: 2, id: 'rt', name: 'round trip', comment: 'c', steps: [{ do: 'call', fn: 'buyBuyable', args: ['a', 11], times: 3 }] };
  assert.equal(E.importText(JSON.stringify(q)).ok, true);
  const t1 = E.exportText('rt');
  E.remove('rt');
  assert.equal(E.importText(t1).ok, true);
  assert.equal(E.exportText('rt'), t1);
  assert.match(E.importText(t1).errors[0], /already have a queue/);
});

test('switching a queue off and DELETING it release its holds; a start queue runs once armed', () => {
  const { ctx, T, E } = boot();
  const mk = (id) => ({ format: 'tmt-queue/1', id, steps: [{ do: 'hold', features: ['reset:a'] }, { do: 'wait', until: 'false', timeout: { gs: 99 }, onTimeout: 'abort' }] });
  E.importText(JSON.stringify(mk('one'))); E.importText(JSON.stringify(mk('two')));
  assert.equal(E.setEnabled('one', true).ok, true); assert.equal(E.setEnabled('two', true).ok, true);
  tick(ctx, 2);
  assert.ok(T.queueLink.holds['reset:a']);
  E.setEnabled('one', false);
  assert.equal(T.queueLink.holds['reset:a'].queue, 'two');
  E.remove('two');
  assert.equal(T.queueLink.holds, null);
  assert.equal(T.queues.status().queues.length, 0);
});

test('an invalid queue cannot be switched on, and says why', () => {
  const { E } = boot();
  const id = E.create('w').id;
  E.addStep(id, { do: 'wait', until: '', timeout: { gs: 1 }, onTimeout: 'abort' });
  const r = E.setEnabled(id, true);
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /Step 2: a wait needs a condition/);
  assert.equal(E.list()[0].enabled, false);
});

test('names: a step reads the game\'s own title (HTML stripped, functions called) and the layer\'s name', () => {
  const { E } = boot();
  assert.equal(E.describe({ do: 'call', fn: 'buyUpgrade', args: ['a', 11] }).title, 'Buy upgrade “First Light” (Alpha)');
  assert.equal(E.describe({ do: 'call', fn: 'buyUpgrade', args: ['a', 12] }).title, 'Buy upgrade “Second” (Alpha)');
  assert.equal(E.describe({ do: 'call', fn: 'buyBuyable', args: ['a', 11], times: 4 }).title, 'Buy “Widget” (Alpha) × 4');
  assert.equal(E.describe({ do: 'wait', until: 'false', timeout: { gs: 2.5 }, onTimeout: 'skip' }).title, 'Pause for 2.5 s of game time');
  const acts = E.actions();
  assert.deepEqual(J(acts.map((g) => g.name)), ['Alpha']);
  assert.ok(acts[0].actions.some((x) => x.label === 'Buy upgrade “First Light”' && x.fn === 'buyUpgrade'));
});

test('the recorder folds a run of the same press into `times`, and a gap of a game-second or more into a pause', () => {
  const { E } = boot();
  const P = (fn, args, gs) => ({ fn, args, self: null, gs });
  const steps = E.record.fold([P('buyBuyable', ['a', 11], 0), P('buyBuyable', ['a', 11], 0.2), P('buyBuyable', ['a', 11], 0.4), P('buyUpgrade', ['a', 11], 0.4), P('buyUpgrade', ['a', 12], 3.4), P('buyBuyable', ['a', 11], 3.5)]);
  assert.deepEqual(J(steps.map((s) => s.do === 'call' ? `${s.fn}${s.times ? '×' + s.times : ''}` : `pause ${s.timeout.gs}`)),
    ['buyBuyable×3', 'buyUpgrade', 'pause 3', 'buyUpgrade', 'buyBuyable']);
});

test('the runner\'s version 2: `times` calls N times in one slot; `times` or `name` without version 2 and an unknown version are refused by name', () => {
  const { ctx, T } = boot();
  const v = (q) => T.queues.validate(Object.assign({ format: 'tmt-queue/1', id: 'v', steps: [{ do: 'comment', text: 'x' }] }, q));
  assert.match(v({ version: 5 }).join(), /"version" must be one of 1 \| 2 \| 3 \| 4/);   // (shipq-1) version 3 adds `relies`; (parts-1) 4 a limit in ticks
  assert.match(v({ name: 'n' }).join(), /"name" needs "version": 2/);
  assert.match(v({ steps: [{ do: 'call', fn: 'buyBuyable', args: ['a', 11], times: 2 }] }).join(), /"times" needs "version": 2/);
  assert.match(v({ version: 2, steps: [{ do: 'call', fn: 'buyBuyable', args: ['a', 11], times: 0 }] }).join(), /"times"/);
  assert.deepEqual(J(v({ version: 2, name: 'n', steps: [{ do: 'call', fn: 'buyBuyable', args: ['a', 11], times: 4 }] })), []);
  T.queues.load({ format: 'tmt-queue/1', version: 2, id: 't', steps: [{ do: 'call', fn: 'buyBuyable', args: ['a', 11], times: 4 }] });
  tick(ctx, 1);
  assert.equal(Number(ctx.player.a.buyables[11]), 4);
  assert.equal(T.queues.status().queues[0].state, 'done');
});

test('the state log\'s TAP: the recorder hears a player press ONCE with the log off, the automation\'s as `auto`, and detaching empties the link', () => {
  const { ctx, T } = boot({ log: true });
  const heard = [];
  const untap = T.stateLog.tap((ev) => heard.push(ev));
  assert.equal(T.stateLog.status().on, false);
  ctx.buyUpgrade('a', 11);
  ctx.player.a.points = new Decimal(0);
  ctx.buyUpgrade('a', 12);   // refused: changed nothing
  assert.deepEqual(J(heard.map((e) => [e.source, e.call, JSON.stringify(e.args), e.did])), [['player', 'buyUpgrade', '["a",11]', true], ['player', 'buyUpgrade', '["a",12]', false]]);
  ctx.player.a.points = new Decimal(100);
  T.profile('all');
  tick(ctx, 1);
  assert.ok(heard.slice(2).every((e) => e.source === 'auto' || e.source === 'game'), JSON.stringify(heard.slice(2)));
  untap();
  assert.equal(T.logLink.exec, null);
  assert.equal(T.stateLog.taps(), 0);
  ctx.buyBuyable('a', 11);
  assert.equal(heard.filter((e) => e.source === 'player').length, 2, 'nothing heard once detached');
});
