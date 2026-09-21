// F1 Part 1 — a reset YIELDS to passive generation, driven over the stub engine.
//
// ⚖ The user (2026-09-21): *"I would expect that manually resetting is a bad idea when there is a passive generation
// of even 5 percent."* Both engines pay `tmp[l].passiveGeneration × resetGain × diff` into an UNLOCKED layer every
// tick (ptr `js/game.js:346/354`); the loader never read it. These legs construct every case the brief names — the
// threshold, the unlock wall, the off-switch the historical pins name, the three value types the roster declares, and
// a cycle member the game starts paying — each against the mutant that reddens it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

/** Two normal layers on row 1 (`a`, `b`); `state.pg[id]` is what the ENGINE declares as `passiveGeneration`. */
function game(state) {
  const layer = (id) => ({
    name: id, row: 1, type: 'normal', layerShown: () => true,
    startData: () => ({ unlocked: state.unlocked[id] !== false, points: new Decimal(0) }),
    tmtStubTemp(tmp) {
      const t = tmp[id] || (tmp[id] = {});
      t.type = 'normal';
      t.baseAmount = new Decimal(10); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
      t.canReset = true; t.autoPrestige = false;
      t.resetGain = new Decimal(state.gain && state.gain[id] !== undefined ? state.gain[id] : 5);
      t.upgrades = {}; t.buyables = {};
      if (state.pg[id] === undefined) delete t.passiveGeneration; else t.passiveGeneration = state.pg[id];
    },
  });
  return { a: layer('a'), b: layer('b') };
}
const fresh = () => ({ pg: {}, unlocked: {} });
function boot(policies, state = fresh(), options = {}) {
  const ctx = bootStub(game(state), { id: 'stub', autoTable: { formatVersion: 1, policies }, options });
  ctx.tmtLoader.profile('all');
  return ctx;
}
const acts = (ctx) => ctx.tmtLoader.hookStats().actions;

test('a layer the game pays passively does NOT reset, and says `yielding:passive` with the rate', () => {
  const s = fresh(); s.pg.a = 0.05;             // ptr's `o`: 5 % of the reset's gain per second
  const ctx = boot({ 'reset:a': 'always', 'reset:b': 'always' }, s);
  tick(ctx, 20);
  assert.equal(acts(ctx)['reset:a'] || 0, 0, 'a passively paid layer was reset');
  assert.ok(acts(ctx)['reset:b'] > 10, 'the unpaid sibling is the control and must reset freely');
  const r = rowOf(ctx, 'reset:a').last;
  assert.equal(r.code, 'yielding:passive');
  assert.match(r.text, /pays a 5% of a reset’s gain every second/);
  // MUTANT: "the yield is never consulted" — reset:a acts 20 times and this row goes red.
});

test('⛔ the OFF-SWITCH: `passiveYield=off` resets exactly as before F1 — what every historical pin names', () => {
  const s = fresh(); s.pg.a = 1;
  const on = boot({ 'reset:a': 'always' }, s);
  const off = boot({ 'reset:a': 'always' }, s, { passiveYield: 'off' });
  const none = boot({ 'reset:a': 'always' }, fresh());
  tick(on, 15); tick(off, 15); tick(none, 15);
  assert.equal(acts(on)['reset:a'] || 0, 0);
  assert.equal(acts(off)['reset:a'], acts(none)['reset:a'], 'off must be the layer with no passive generation at all');
  assert.equal(ctx2json(off), ctx2json(none), 'off must leave no trace in the state');
  // MUTANT: "the off-switch does not switch it off" — `off` yields and the second assert goes red.
});
const ctx2json = (ctx) => JSON.stringify({ a: String(ctx.player.a.points), r: ctx.resets.length });

test('THE THRESHOLD: the rate must EXCEED it; the default is 0, i.e. ANY passive generation', () => {
  const s = fresh(); s.pg.a = 0.05;
  const def = boot({ 'reset:a': 'always' }, s);
  const low = boot({ 'reset:a': 'always' }, s, { passiveYield: '0.01' });
  const high = boot({ 'reset:a': 'always' }, s, { passiveYield: '0.1' });
  const eq = boot({ 'reset:a': 'always' }, s, { passiveYield: '0.05' });
  [def, low, high, eq].forEach((c) => tick(c, 10));
  assert.equal(acts(def)['reset:a'] || 0, 0, 'the default must yield to 5 %');
  assert.equal(acts(low)['reset:a'] || 0, 0, '5 % exceeds 1 %: must yield');
  assert.ok(acts(high)['reset:a'] > 5, '5 % does not exceed 10 %: must reset');
  assert.ok(acts(eq)['reset:a'] > 5, 'a rate EQUAL to the threshold does not exceed it');
  // MUTANT: "the yield ignores the threshold" — `high` and `eq` never reset and go red.
});

test('⛔ THE UNLOCK WALL: a layer that has never reset is not paid, so it must NOT yield — it resets and unlocks', () => {
  const s = fresh(); s.pg.a = 1; s.unlocked.a = false;
  const ctx = boot({ 'reset:a': 'always' }, s);
  tick(ctx, 1);
  assert.equal(ctx.player.a.unlocked, true, 'the first reset must happen: it is what unlocks the layer');
  assert.ok(acts(ctx)['reset:a'] >= 1);
  tick(ctx, 5);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'yielding:passive', 'once unlocked, the engine pays it and the yield holds');
  // MUTANT: "the yield fires on a layer that has never reset" — reset:a never acts and the layer never unlocks.
});

test('the three value types the roster declares — a number, a Decimal, a boolean — and absent / zero / NaN', () => {
  const cases = [[0.5, true], [new Decimal(0.5), true], [true, true], [undefined, false], [0, false], [new Decimal(0), false], [NaN, false], [false, false]];
  for (const [v, yields] of cases) {
    const s = fresh(); s.pg.a = v;
    const ctx = boot({ 'reset:a': 'always' }, s);
    tick(ctx, 5);
    assert.equal((acts(ctx)['reset:a'] || 0) === 0, yields, `passiveGeneration ${String(v)}: ${yields ? 'must' : 'must not'} yield`);
  }
});

test('a CYCLE member the game pays passively leaves the cycle, and its row-mate goes back to its own rule', () => {
  const s = fresh();
  const ctx = boot({ 'reset:a': 'always|turn@3/3x/5/0/0', 'reset:b': 'always|turn@1/3x/5/0/0' }, s);
  tick(ctx, 10);
  assert.ok(ctx.tmtLoader.cycleState()['1'], 'the control: two members, one cycle');
  s.pg.a = 1;
  const b0 = acts(ctx)['reset:b'] || 0;
  tick(ctx, 20);
  const C = ctx.tmtLoader.cycleState()['1'];
  assert.ok(!C || C.dormant, `a passively paid member must not keep the cycle open: ${JSON.stringify(C)}`);
  assert.equal((acts(ctx)['reset:b'] || 0) - b0, 20, 'the remaining member must reset on every tick, as `always` says');
  // MUTANT: "a yielding member stays a cycle member" — it holds turns it cannot use and `b` waits.
});

test('a mistyped `passiveYield` is a HARD FAIL, not a run that quietly measures something else', () => {
  assert.throws(() => boot({ 'reset:a': 'always' }, fresh(), { passiveYield: 'of' }), /passiveYield must be "off" or a number/);
  assert.throws(() => boot({ 'reset:a': 'always' }, fresh(), { passiveYield: '-1' }), /passiveYield/);
});

// ---- F1 Parts 2–3: the levers the reset-frequency measurements need -------------------------------------------------

test('`resetDefault=<policy>` replaces the DERIVED default of a NORMAL layer only — a table entry still wins', () => {
  const s = fresh();
  const ctx = bootStub(game(s), { id: 'stub', autoTable: { formatVersion: 1, policies: { 'reset:b': 'always' } }, options: { resetDefault: 'rate-peak@0/0' } });
  const pol = (id) => ctx.tmtLoader.features.find((f) => f.id === id).policy;
  assert.equal(pol('reset:a'), 'rate-peak@0/0', 'the derived default must be the option');
  assert.equal(pol('reset:b'), 'always', 'a table entry outranks a derived default');
  assert.throws(() => bootStub(game(fresh()), { id: 'stub', autoTable: { formatVersion: 1 }, options: { resetDefault: 'gain>=twox' } }), /resetDefault/);
  // MUTANT: "the option is ignored" — reset:a stays `gain>=2x` and the first assert goes red.
});

test('`tmtLoader.sinceReset(id)` — game-seconds since that feature last reset; Infinity before its first', () => {
  const ctx = boot({ 'reset:a': 'interval>=3' });
  assert.equal(ctx.tmtLoader.sinceReset('reset:a'), Infinity);
  tick(ctx, 1);
  assert.equal(ctx.tmtLoader.sinceReset('reset:a'), 0, 'it reset on the first tick');
  tick(ctx, 2);
  assert.equal(ctx.tmtLoader.sinceReset('reset:a'), 2);
  assert.throws(() => ctx.tmtLoader.sinceReset('reset:zz'), /no feature/);
});

test('`tmtLoader.fallbackFires` counts the resets the STALL FALLBACK fired, and nothing else', () => {
  // `a` resets by its own rule (`gain>=10`) every tick while the gain is 10, so its typical interval is 1 s; then the
  // gain drops to 1, its own rule refuses, and after 2× the typical the fallback resets anyway. `b` is `always`.
  const s = fresh(); s.gain = { a: 10 };
  const ctx = boot({ 'reset:a': 'gain>=10|stall>=2x/1', 'reset:b': 'always' }, s);
  tick(ctx, 5);
  const own = acts(ctx)['reset:a'];
  assert.equal(ctx.tmtLoader.fallbackFires['reset:a'] || 0, 0, 'no fallback while the own rule fires');
  s.gain.a = 1;
  tick(ctx, 10);
  const F = ctx.tmtLoader.fallbackFires;
  assert.ok((F['reset:a'] || 0) >= 1, `the fallback must have fired: ${JSON.stringify(F)}`);
  assert.equal(acts(ctx)['reset:a'] - own, F['reset:a'], 'every reset after the drop is a fallback reset');
  assert.equal(F['reset:b'] || 0, 0, 'an own-rule reset is never counted');
  // MUTANT: "every reset is counted" — reset:b is counted and the last assert goes red.
});
