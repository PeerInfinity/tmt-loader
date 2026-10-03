// parts-1 — THE PLAYER'S OWN SWITCHES ON THE TABLE'S PARTS (docs/automation.md, "Stages" → "Switched off by you";
// docs/queues.md, "Shipped queues" → "Switched off by you") and the queue format's VERSION 4 (a limit in ticks), over
// the stub engine. The page legs (the Parts subtab, the store, the reload) are `tools/harness/gates-parts.mjs`.
// ⚠ Every row names the mutant it is against.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';
const J = (x) => JSON.stringify(x);

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const PROV = { gate: 'parts-test', commit: 'abcdef0', note: 'a constructed part' };
function game() {
  return {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
        t.canReset = true; t.autoPrestige = false; t.resetGain = new Decimal(1);
      },
    },
  };
}
const TABLE = () => ({
  policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV },
  stages: [
    { id: 's1', name: 'the first', note: 'a stage that sets the reset', when: 'flag', policies: { 'reset:a': 'gain>=5' }, provenance: PROV },
    { id: 's2', when: 'flag', policies: { 'reset:a': 'gain>=7' }, provenance: PROV },
  ],
  queues: [{ id: 'sq', when: 'flag', provenance: PROV, queue: { format: 'tmt-queue/1', id: 'sq', steps: [{ do: 'hold', features: ['reset:a'] }, { do: 'wait', until: 'false', timeout: { gs: 50 }, onTimeout: 'abort' }] } }],
});
function boot(table = TABLE(), runner = false) {
  const ctx = bootStub(game(), { autoTable: table });
  ctx.flag = false;
  ctx.tmtLoader.profile('all');
  if (runner) vm.runInContext(fs.readFileSync(path.join(REPO, 'loader/tmt-queue.js'), 'utf8'), ctx, { filename: 'loader/tmt-queue.js' });
  return ctx;
}
const T = (ctx) => ctx.tmtLoader;
const pol = (ctx) => rowOf(ctx, 'reset:a').policy.inForce;

test('a stage SWITCHED OFF BY THE PLAYER is not in force: its feature falls to the next stage, then the table; the reason line and the row say so', () => {
  const ctx = boot();
  ctx.flag = true; tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=5');
  assert.equal(T(ctx).parts.setStageOff('s1', true).ok, true);
  tick(ctx, 1);
  // MUTANT "a switched-off stage still in force": these red
  assert.equal(pol(ctx), 'gain>=7', 'the next stage that names the feature takes it');
  assert.equal(T(ctx).stages().find((s) => s.id === 's1').active, false);
  assert.equal(T(ctx).stages().find((s) => s.id === 's1').offByYou, true);
  assert.equal(J(rowOf(ctx, 'reset:a').stage.offByYou), J(['s1']));
  assert.match(T(ctx).reasonText(rowOf(ctx, 'reset:a').last), /stage s1 switched off by you/);
  assert.equal(T(ctx).parts.setStageOff('s2', true).ok, true);
  tick(ctx, 1);
  assert.equal(pol(ctx), 'always', 'with both off, the table');
  const h = T(ctx).stageHistory().filter((r) => r.stage === 's1');
  assert.equal(h[h.length - 1].on, false);
  assert.equal(h[h.length - 1].by, 'you');
  assert.equal(T(ctx).parts.setStageOff('s1', false).ok, true);
  tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=5', 'switched back on, it is in force again');
  // MUTANT "an override written into player": the switches are never in the save
  T(ctx).parts.setStageOff('s2', true);
  assert.ok(!JSON.stringify(ctx.player).includes('stagesOff') && !JSON.stringify(ctx.player).includes('tmt-parts'));
  assert.equal(T(ctx).parts.setStageOff('nosuch', true).ok, false);
});

test('the player\'s own condition for a stage is checked like a gate, evaluated instead of the table\'s, and given back by an empty one', () => {
  const ctx = boot();
  assert.equal(T(ctx).parts.setStageWhen('s1', 'flag &&').ok, false, 'a condition that does not compile is refused, nothing stored');
  assert.equal(J(T(ctx).parts.get().when), J({}));
  assert.equal(T(ctx).parts.setStageWhen('s1', 'mine').ok, true);
  ctx.mine = true; tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=5', 'in force by the player\'s condition while the table\'s is false');
  assert.equal(T(ctx).stages()[0].whenYours, 'mine');
  assert.equal(T(ctx).stages()[0].whenInForce, 'mine');
  assert.equal(T(ctx).parts.setStageWhen('s1', '').ok, true);
  tick(ctx, 1);
  assert.equal(pol(ctx), 'always');
  assert.equal(T(ctx).stages()[0].whenYours, null);
});

test('with NO switch set, nothing moves: the evaluation count, the explain rows and the runtime record are what they were', () => {
  const a = boot(), b = boot();
  a.flag = true; b.flag = true;
  T(b).parts.get();   // reading the (empty) store
  tick(a, 5); tick(b, 5);
  assert.equal(JSON.stringify(T(a).explain()), JSON.stringify(T(b).explain()));
  assert.equal(J(T(a).stageStats()), J(T(b).stageStats()));
  assert.equal(JSON.stringify(T(a).runtimeState()), JSON.stringify(T(b).runtimeState()));
  assert.ok(!('offByYou' in rowOf(a, 'reset:a').stage), 'the row grows no key without a switch');
  // a switched-off stage is not evaluated at all (evaluations = loops × stages in force by the table)
  T(b).parts.setStageOff('s2', true); tick(a, 3); tick(b, 3);
  assert.equal(T(a).stageStats().evals - T(b).stageStats().evals, 3);
});

test('a shipped queue SWITCHED OFF BY THE PLAYER is skipped by name, its holds released; switched back on it is armed fresh', () => {
  const ctx = boot(TABLE(), true), Q = () => T(ctx).queues.status().queues.find((q) => q.id === 'sq');
  ctx.flag = true; tick(ctx, 3);
  assert.equal(Q().state, 'running');
  assert.ok(T(ctx).queueLink.holds && T(ctx).queueLink.holds['reset:a']);
  assert.equal(T(ctx).parts.setQueueOff('sq', true).ok, true);
  // MUTANT "a switched-off shipped queue still running": these red
  assert.equal(Q(), undefined);
  assert.equal(T(ctx).queueLink.holds, null, 'every hold it placed is released');
  assert.equal(J(T(ctx).queues.shippedSkipped()), J([{ id: 'sq', why: 'switched off by you', byYou: true }]));
  tick(ctx, 3);
  assert.equal(Q(), undefined);
  assert.equal(T(ctx).queues.copyShipped('sq').ok, true, 'a switched-off queue can still be copied');
  assert.equal(T(ctx).parts.setQueueOff('sq', false).ok, true);
  assert.equal(Q().state, 'armed');
  tick(ctx, 2);
  assert.equal(Q().state, 'running');
  // a page load with it switched off: the runner reads the store when it loads
  const c2 = bootStub(game(), { autoTable: TABLE() });
  c2.tmtLoader.profile('all');
  c2.tmtLoader.parts.setQueueOff('sq', true);
  vm.runInContext(fs.readFileSync(path.join(REPO, 'loader/tmt-queue.js'), 'utf8'), c2, { filename: 'loader/tmt-queue.js' });
  assert.equal(c2.tmtLoader.queues.status().queues.length, 0);
  assert.equal(c2.tmtLoader.queues.shippedSkipped()[0].why, 'switched off by you');
  assert.ok(!JSON.stringify(c2.player).includes('queuesOff'));
  assert.equal(c2.tmtLoader.parts.setQueueOff('nosuch', true).ok, false);
});

test('VERSION 4: a wait\'s limit in ticks — refused without the version, met at once in the slot of its call, timed out after N ticks whatever the tick size', () => {
  const ctx = boot({ policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV } }, true), L = T(ctx).queues;
  const q = (id, until, extra = {}) => ({ format: 'tmt-queue/1', id, version: 4, steps: [{ do: 'wait', until, timeout: { ticks: 2 }, onTimeout: 'abort' }], ...extra });
  assert.match(L.validate({ ...q('x', 'true'), version: 3 }).join(), /needs "version": 4/);
  assert.match(L.validate({ format: 'tmt-queue/1', id: 'x', version: 4, steps: [{ do: 'wait', until: 'true', timeout: { ticks: 1.5 }, onTimeout: 'abort' }] }).join(), /whole number of ticks/);
  assert.match(L.validate({ format: 'tmt-queue/1', id: 'x', version: 4, steps: [{ do: 'wait', until: 'true', timeout: { ticks: 2, gs: 2 }, onTimeout: 'abort' }] }).join(), /not also "gs"/);
  assert.equal(J(L.validate(q('x', 'true'))), J([]));
  assert.equal(L.load(q('met', 'true')).ok, true);
  tick(ctx, 1);
  assert.equal(L.status().queues.find((x) => x.id === 'met').state, 'done', 'met in its first slot');
  assert.equal(L.load(q('never', 'false')).ok, true);
  tick(ctx, 2, 0.05);
  assert.equal(L.status().queues.find((x) => x.id === 'never').state, 'running');
  assert.equal(L.status().queues.find((x) => x.id === 'never').wait.unit, 'ticks');
  assert.ok('waitTicks' in T(ctx).runtimeState().queues.loaded.find((x) => x.q.id === 'never'));
  tick(ctx, 1, 0.05);
  const n = L.status().queues.find((x) => x.id === 'never');
  assert.equal(n.state, 'aborted');
  assert.match(n.outcome, /timed out after 2 tick\(s\)/);
  // a version-3 record (no tick wait) carries no `waitTicks`
  assert.ok(!('waitTicks' in T(ctx).runtimeState().queues.loaded.find((x) => x.q.id === 'met')));
});
