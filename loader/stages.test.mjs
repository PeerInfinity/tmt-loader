// stages-1 — the table's STAGES (design notes §19-R.2, "planner finds, data records"), driven over the stub engine.
//
// A stage is a `policies` / `gates` overlay in force only while its `when` predicate holds. These rows pin what the
// real-game legs (`tools/harness/gates-stages.mjs`) cannot construct cheaply: every link of the precedence, the
// first-match rule, the ONE-evaluation-per-loop cost, the timing of a switch, and a `when` that throws.
// ⚠ Every row names the mutant it is against (the house rule of controls.test.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

const PROV = { gate: 'stages-test', commit: 'abcdef0', note: 'a constructed stage' };
/** One normal layer with a reset; `ctx.flag` / `ctx.flag2` / `ctx.open` are the globals the predicates read. */
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
const stage = (o) => Object.assign({ provenance: PROV }, o);
function boot(table, options) {
  const ctx = bootStub(game(), { autoTable: table, options });
  ctx.flag = false; ctx.flag2 = false; ctx.open = true;
  ctx.tmtLoader.profile('all');
  return ctx;
}
const T = (ctx) => ctx.tmtLoader;
const pol = (ctx) => rowOf(ctx, 'reset:a').policy.inForce;

test('PRECEDENCE (policy): table < stage < `--auto-opt policy:` < the player\'s edit < a runtime override', () => {
  const table = { policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV }, stages: [stage({ id: 's1', when: 'flag', policies: { 'reset:a': 'gain>=5' } })] };
  const ctx = boot(table);
  tick(ctx, 1);
  assert.equal(pol(ctx), 'always', 'the stage is in force while its `when` is false');
  ctx.flag = true; tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=5');
  assert.equal(rowOf(ctx, 'reset:a').stage.policy, 's1');
  // MUTANT "stage precedence above a player's edit": this row reds
  assert.equal(T(ctx).setSavedPolicy('reset:a', 'interval>=7').ok, true);
  assert.equal(pol(ctx), 'interval>=7', 'the player\'s saved choice must beat a stage');
  assert.equal(rowOf(ctx, 'reset:a').stage.policy, null);
  assert.equal(rowOf(ctx, 'reset:a').stage.shadowedBy, 'you');
  T(ctx).setPolicy('reset:a', 'gain>=9');
  assert.equal(pol(ctx), 'gain>=9');
  assert.equal(rowOf(ctx, 'reset:a').stage.shadowedBy, 'runtime');
  T(ctx).setPolicy('reset:a', null);
  T(ctx).setSavedPolicy('reset:a', null);
  assert.equal(pol(ctx), 'gain>=5', 'clearing the edit gives the feature back to the stage');
  ctx.flag = false; tick(ctx, 1);
  assert.equal(pol(ctx), 'always', 'and the stage ends when its `when` goes false — no latch');
  // `--auto-opt policy:<id>=` pins a configuration for the whole run, whatever the stages say
  const opt = boot(table, { 'policy:reset:a': 'gain>=3' });
  opt.flag = true; tick(opt, 2);
  assert.equal(pol(opt), 'gain>=3');
  assert.equal(rowOf(opt, 'reset:a').stage.shadowedBy, 'option');
});

test('PRECEDENCE (`while`): table gate < stage gate < `--auto-opt while:` < the player\'s edit; the reason NAMES the stage', () => {
  const table = { gates: { 'reset:a': 'open' }, provenance: { 'reset:a': PROV }, stages: [stage({ id: 'hold-a', when: 'flag', gates: { 'reset:a': 'flag2' } })] };
  const ctx = boot(table);
  ctx.flag = true; tick(ctx, 1);
  let r = rowOf(ctx, 'reset:a');
  assert.equal(r.last.code, 'blocked:stage');
  assert.equal(r.last.values.stage, 'hold-a');
  assert.match(r.last.text, /stage hold-a/, 'the reason line names the stage');
  assert.match(T(ctx).reasonText(r.last), /stage hold-a/);
  assert.equal(T(ctx).controlState('reset:a')['while'].owner, 'stage');
  assert.equal(T(ctx).controlState('reset:a')['while'].stage, 'hold-a');
  assert.equal(r.stage['while'], 'hold-a');
  // the block HTML names it too (the Advanced view's policy block and reason line)
  const html = T(ctx).featureBlockHTML(T(ctx).advancedRows().find((x) => x.id === 'reset:a'), false);
  assert.match(html, /stage hold-a/);
  // the player's own `while` beats the stage
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', 'open').ok, true);
  tick(ctx, 1);
  assert.notEqual(rowOf(ctx, 'reset:a').last.code, 'blocked:stage');
  assert.equal(T(ctx).controlState('reset:a')['while'].owner, 'you');
  // and `--auto-opt while:` beats it (and the table's own gate is what is left when no stage holds)
  const opt = boot(table, { 'while:reset:a': 'open' });
  opt.flag = true; tick(opt, 1);
  assert.equal(T(opt).controlState('reset:a')['while'].owner, 'table');
  assert.notEqual(rowOf(opt, 'reset:a').last.code, 'blocked:stage');
});

test('A `when` THAT THROWS READS AS FALSE, and the feature\'s reason SAYS SO', () => {
  const table = { policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV }, stages: [stage({ id: 'broken', when: 'nosuch.thing > 1', policies: { 'reset:a': 'gain>=5' } })] };
  const ctx = boot(table);
  tick(ctx, 2);
  // MUTANT "a throwing `when` reads as true": the policy below would be gain>=5
  assert.equal(pol(ctx), 'always', 'a stage whose `when` throws must NOT be in force');
  const st = T(ctx).stages()[0];
  assert.equal(st.active, false);
  assert.match(st.error, /nosuch/);
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.stage.errors[0].stage, 'broken');
  assert.equal(r.last.stage.error.stage, 'broken');
  assert.match(r.last.text, /stage broken could not be evaluated/);
  assert.match(T(ctx).reasonText(r.last), /could not be evaluated/);
  const h = T(ctx).stageHistory();
  assert.equal(h.length, 1, 'the throw is ONE transition, not one record per tick');
  assert.equal(h[0].on, false);
  assert.match(h[0].error, /nosuch/);
});

test('FIRST MATCH WINS per feature and slot, in list order', () => {
  const table = { policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV }, stages: [
    stage({ id: 'first', when: 'flag', policies: { 'reset:a': 'gain>=5' } }),
    stage({ id: 'second', when: 'flag2', policies: { 'reset:a': 'gain>=7' }, gates: { 'reset:a': 'open' } })] };
  const ctx = boot(table);
  ctx.flag = true; ctx.flag2 = true; tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=5', 'both hold: the earlier stage wins the policy');
  assert.equal(T(ctx).controlState('reset:a')['while'].stage, 'second', 'and the later one still fills the slot only it names');
  ctx.flag = false; tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=7');
});

test('COST: ONE evaluation per stage per loop, and a switch made INSIDE loop N first acts in loop N+1', () => {
  const table = { policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV }, stages: [
    stage({ id: 's1', when: 'flag', policies: { 'reset:a': 'gain>=5' } }), stage({ id: 's2', when: 'flag2', policies: { 'reset:a': 'gain>=7' } })] };
  const ctx = boot(table);
  tick(ctx, 10);
  const s = T(ctx).stageStats();
  assert.equal(s.loops, 10);
  assert.equal(s.evals, 20, 'evaluations = loops × stages — never per feature, never per read');
  for (let i = 0; i < 50; i++) { pol(ctx); T(ctx).explain(); }
  assert.equal(T(ctx).stageStats().evals, 20, 'reading the policy or the readout evaluates nothing');
  ctx.flag = true;                       // set BETWEEN loops: the next loop's first act sees it
  assert.equal(pol(ctx), 'always', 'not in force until a loop has evaluated it');
  tick(ctx, 1);
  assert.equal(pol(ctx), 'gain>=5');
  const h = T(ctx).stageHistory();
  assert.equal(h[h.length - 1].stage, 's1');
  assert.equal(h[h.length - 1].on, true);
  // `stages=off` evaluates nothing and the table is what it was
  const off = boot(table, { stages: 'off' });
  off.flag = true; tick(off, 5);
  assert.equal(T(off).stageStats().evals, 0);
  assert.equal(pol(off), 'always');
});

test('NOTHING ELSE MOVES: a table with no stages has no `stage` key anywhere and evaluates nothing', () => {
  const ctx = boot({ policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV } });
  tick(ctx, 5);
  const r = rowOf(ctx, 'reset:a');
  assert.equal('stage' in r, false);
  assert.equal('stage' in r.last, false);
  assert.equal(T(ctx).stageStats().evals, 0);
});

test('LOAD REFUSALS — each by name, the load fails', () => {
  const base = { policies: { 'reset:a': 'always' }, provenance: { 'reset:a': PROV } };
  const bad = (stages, re, options) => assert.throws(() => boot(Object.assign({}, base, { stages }), options), re);
  bad([stage({ id: 'x', when: 'flag', policies: { 'reset:a': 'gain>=5' } }), stage({ id: 'x', when: 'flag2', policies: { 'reset:a': 'always' } })], /used twice/);
  bad([stage({ id: 'x', when: 'flag', policies: { 'reset:zz': 'always' } })], /not a derived feature/);
  bad([stage({ id: 'x', when: 'flag', policies: { 'reset:a': 'sometimes' } })], /not a reset policy/);
  bad([stage({ id: 'x', when: 'flag(', policies: { 'reset:a': 'always' } })], /when — not a JavaScript expression/);
  bad([stage({ id: 'x', when: 'flag', gates: { 'reset:a': 'open(' } })], /gate reset:a — not a JavaScript expression/);
  bad([stage({ id: 'x', when: 'flag' })], /sets nothing/);
  // MUTANT "a stage with no provenance passes validation": the schema requires it
  bad([{ id: 'x', when: 'flag', policies: { 'reset:a': 'always' } }], /missing "provenance"/);
  bad([stage({ id: 'x', when: 'flag', policies: { 'reset:a': 'always' } })], /option stages must be/, { stages: 'maybe' });
});
