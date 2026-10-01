// tpl1 — the QUEUE RUNNER (`loader/tmt-queue.js`, docs/queues.md) over the stub engine (`loader/stub-engine.mjs`).
//
// What the runner promises, each a test: a queue this build cannot play is refused BY NAME; every hold is released
// when its queue ends, aborts or is unloaded; a held feature's reason names the queue and the step; a wait with a
// throwing condition aborts rather than waits; the runner's memory is in `runtimeState()` ONLY while a queue is
// loaded, and a restore without it unloads everything (a planner excursion leaves nothing behind).
// ⚠ The stub is not a second engine: what is exercised is the runner and the core's slot, the same code the real
// engines run. The real-engine legs (ptr, replay, the page) are `tools/harness/gates-tpl1.mjs`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { bootStub, tick, codes, rowOf, Decimal } from './stub-engine.mjs';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);

function game() {
  return {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      upgrades: { 11: { cost: new Decimal(3) } },
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
        t.canReset = true; t.autoPrestige = false; t.resetGain = new Decimal(1);
        t.upgrades = { 11: { cost: new Decimal(3), unlocked: true } };
      },
    },
  };
}
function boot() {
  const ctx = bootStub(game(), { options: { 'policy:reset:a': 'always' } });
  ctx.tmtLoader.profile('all');
  vm.runInContext(fs.readFileSync(path.join(REPO, 'loader/tmt-queue.js'), 'utf8'), ctx, { filename: 'loader/tmt-queue.js' });
  return ctx;
}
const Q = (steps, extra = {}) => ({ format: 'tmt-queue/1', id: 'q1', source: 'authored', steps, ...extra });

test('loading the runner with no queue changes nothing: no queues block, no holds, the slot empty', () => {
  const plain = bootStub(game(), { options: { 'policy:reset:a': 'always' } });
  plain.tmtLoader.profile('all');
  const ctx = boot();
  tick(plain, 5); tick(ctx, 5);
  assert.equal(ctx.tmtLoader.queueLink.step, null);
  assert.equal(ctx.tmtLoader.queueLink.holds, null);
  assert.equal(JSON.stringify(ctx.tmtLoader.runtimeState()), JSON.stringify(plain.tmtLoader.runtimeState()));
  assert.equal(ctx.tmtLoader.stateJSON(), plain.tmtLoader.stateJSON());
});

test('a queue this build cannot play is REFUSED BY NAME and nothing is loaded', () => {
  const ctx = boot(), L = ctx.tmtLoader.queues;
  const bad = [
    [{ format: 'tmt-queue/0', id: 'x', steps: [{ do: 'comment', text: 'c' }] }, /format/],
    [Q([{ do: 'hold', features: ['reset:nosuch'] }]), /no automation feature "reset:nosuch"/],
    [Q([{ do: 'wait', until: 'true', onTimeout: 'abort' }]), /a wait needs "timeout"/],
    [Q([{ do: 'wait', until: 'true', timeout: { gs: 5 }, onTimeout: 'goto' }]), /onTimeout/],
    [Q([{ do: 'wait', until: 'player.(', timeout: { gs: 5 }, onTimeout: 'abort' }]), /until:/],
    [Q([{ do: 'call', fn: 'noSuchEngineFunction', args: [] }]), /no global function "noSuchEngineFunction"/],
    [Q([{ do: 'jump' }]), /"do" must be one of/],
    [Q([{ do: 'comment', text: 'c' }], { trigger: { on: 'mark' } }), /trigger\.on/],
  ];
  for (const [q, re] of bad) {
    const r = L.load(q);
    assert.equal(r.ok, false, JSON.stringify(q));
    assert.match(r.errors.join(' | '), re);
  }
  assert.equal(L.status().queues.length, 0);
  assert.equal(ctx.tmtLoader.runtimeState().queues, undefined);
});

test('hold → wait → call → end: the reflex is held, its reason names the queue and step, and the hold is RELEASED at the end', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  const r = T.queues.load(Q([
    { do: 'hold', features: ['reset:a'], comment: 'keep it' },
    { do: 'wait', until: 'player.timePlayed >= 3', timeout: { gs: 10 }, onTimeout: 'abort' },
    { do: 'call', fn: 'doReset', args: ['a'] },
  ]));
  assert.equal(r.ok, true, r.errors && r.errors.join('; '));
  ctx.resets.length = 0;
  tick(ctx, 1);   // trigger + hold in this tick's queue slot (after the reflexes)
  assert.equal(JSON.stringify(Object.keys(T.queueLink.holds)), JSON.stringify(['reset:a']));
  tick(ctx, 1);   // the reflex is now held
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'held:queue');
  assert.equal(JSON.stringify(rowOf(ctx, 'reset:a').last.values), JSON.stringify({ queue: 'q1', step: 1 }));   // cross-realm: compare as JSON
  assert.match(T.reasonText(rowOf(ctx, 'reset:a').last), /Held by queue q1 \(step 1\)/);
  const tv = T.toggleView('reset:a');
  assert.equal(tv.by, 'queue'); assert.equal(JSON.stringify(tv.heldBy), JSON.stringify({ queue: 'q1', step: 1 }));
  assert.match(T.enabledByHTML(tv), /HELD/);
  const before = ctx.resets.length;
  tick(ctx, 1);   // timePlayed 3: the wait is met, the call fires, the queue ends
  assert.equal(ctx.resets.length - before, 1, 'exactly the queue\'s own reset while held');
  const st = T.queues.status().queues[0];
  assert.equal(st.state, 'done');
  assert.equal(st.holds.length, 0);
  assert.equal(T.queueLink.holds, null, 'every hold released at the end');
  tick(ctx, 1);
  assert.notEqual(rowOf(ctx, 'reset:a').last.code, 'held:queue');
  assert.ok(codes(ctx)['held:queue'] > 0);
});

test('a wait that times out with onTimeout abort ABORTS and releases every hold; skip moves on', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  T.queues.load(Q([{ do: 'hold', features: ['reset:a'] }, { do: 'wait', until: 'false', timeout: { gs: 2 }, onTimeout: 'abort' }, { do: 'comment', text: 'never' }]));
  tick(ctx, 5);
  const st = T.queues.status().queues[0];
  assert.equal(st.state, 'aborted');
  assert.match(st.outcome, /timed out after 2 s/);
  assert.equal(T.queueLink.holds, null);
  const c2 = boot();
  c2.tmtLoader.queues.load(Q([{ do: 'wait', until: 'false', timeout: { gs: 2 }, onTimeout: 'skip' }, { do: 'comment', text: 'after' }]));
  tick(c2, 5);
  assert.equal(c2.tmtLoader.queues.status().queues[0].state, 'done');
});

test('a wait whose condition THROWS aborts by name (a throw is not a false)', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  T.queues.load(Q([{ do: 'hold', features: ['reset:a'] }, { do: 'wait', until: 'player.nosuch.gte(1)', timeout: { gs: 100 }, onTimeout: 'abort' }]));
  tick(ctx, 2);
  const st = T.queues.status().queues[0];
  assert.equal(st.state, 'aborted');
  assert.match(st.outcome, /threw/);
  assert.equal(T.queueLink.holds, null);
});

test('(h22) a call with `if` is made only when the predicate holds; a false one is skipped and recorded, a throwing one aborts by name', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  T.queues.load(Q([
    { do: 'call', fn: 'doReset', args: ['a'], if: 'false' },
    { do: 'call', fn: 'doReset', args: ['a'], if: 'true' },
  ], { id: 'qif' }));
  T.profile('off');
  ctx.resets.length = 0;
  tick(ctx, 1);
  assert.equal(ctx.resets.length, 1, 'only the call whose `if` held was made');
  const st = T.queues.status().queues[0];
  assert.equal(st.state, 'done');
  const c2 = boot();
  c2.tmtLoader.queues.load(Q([{ do: 'hold', features: ['reset:a'] }, { do: 'call', fn: 'doReset', args: ['a'], if: 'player.nosuch.gte(1)' }]));
  tick(c2, 1);
  const s2 = c2.tmtLoader.queues.status().queues[0];
  assert.equal(s2.state, 'aborted');
  assert.match(s2.outcome, /"if" threw/);
  assert.equal(c2.tmtLoader.queueLink.holds, null);
  const r = boot().tmtLoader.queues.load(Q([{ do: 'call', fn: 'doReset', args: ['a'], if: 'player.(' }]));
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' | '), /if:/);
});

test('UNLOAD mid-queue releases the holds; the slot empties when the last queue goes', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  T.queues.load(Q([{ do: 'hold', features: ['reset:a'] }, { do: 'wait', until: 'false', timeout: { gs: 1000 }, onTimeout: 'abort' }]));
  tick(ctx, 3);
  assert.equal(T.queues.status().queues[0].state, 'running');
  assert.ok(T.queueLink.holds['reset:a']);
  const u = T.queues.unload('q1');
  assert.equal(u.ok, true); assert.equal(u.released, 1);
  assert.equal(T.queueLink.holds, null);
  assert.equal(T.queueLink.step, null);
  assert.equal(T.runtimeState().queues, undefined);
});

test('a predicate trigger arms the queue and fires it in the slot of the tick where it first holds', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  T.queues.load(Q([{ do: 'comment', text: 'go' }], { trigger: { on: 'predicate', when: 'player.timePlayed >= 4' } }));
  tick(ctx, 3);
  assert.equal(T.queues.status().queues[0].state, 'armed');
  tick(ctx, 1);
  const st = T.queues.status().queues[0];
  assert.equal(st.state, 'done'); assert.equal(st.firedAt, 4);
});

test('memory: runtimeState carries the queue while loaded; a restore of a record without it UNLOADS (an excursion leaves nothing)', () => {
  const ctx = boot(), T = ctx.tmtLoader;
  const before = T.runtimeState();
  T.queues.load(Q([{ do: 'hold', features: ['reset:a'] }, { do: 'wait', until: 'false', timeout: { gs: 1000 }, onTimeout: 'abort' }]));
  tick(ctx, 2);
  const mid = T.runtimeState();
  assert.equal(mid.queues.loaded[0].state, 'running');
  assert.equal(mid.queues.loaded[0].pc, 1);
  T.restoreRuntime(before);
  assert.equal(T.queues.status().queues.length, 0);
  assert.equal(T.queueLink.holds, null);
  T.restoreRuntime(mid);   // and back: the position, the wait clock and the hold come back with it
  assert.equal(T.queues.status().queues[0].pc, 1);
  assert.ok(T.queueLink.holds['reset:a']);
});

test('a record WITH queues refuses to restore where the runner is not loaded (a throw, not a different run)', () => {
  const ctx = boot();
  ctx.tmtLoader.queues.load(Q([{ do: 'wait', until: 'false', timeout: { gs: 1000 }, onTimeout: 'abort' }]));
  const rt = ctx.tmtLoader.runtimeState();
  const plain = bootStub(game(), {});
  assert.throws(() => plain.tmtLoader.restoreRuntime(rt), /queue runner/);
});
