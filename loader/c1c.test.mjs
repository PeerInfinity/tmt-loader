// C1c — the three defects V6 + C1b left (tmt-automation-plan §53): the planner's number helper by CAPABILITY, ONE
// enumeration of purchase things by shape, and a BUTTON's purchase judged by the amount it raises.
//
// ⛔ WHY CONSTRUCTED. Part 1's abstention ("the game's number type has no pow() — the probe operation abstains") cannot
// happen on the roster: every library the 175 games ship has every method the planner calls (measured, gates-c1c
// part 1). So the only place the abstention runs is here, over a stub number type that LACKS methods — and the
// positive claim ("no global `Decimal` is needed") is a stub whose type is reachable ONLY as `player.points`'s
// constructor. Each test names the MUTANT it is against (`tools/harness/mutants-c1c.sh`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

/** A value out of the vm realm, as plain JSON (a vm Array is not deepStrictEqual to this realm's). */
const J = (x) => JSON.parse(JSON.stringify(x));

const REPO = path.resolve(new URL('..', import.meta.url).pathname);
const PLANNER = fs.readFileSync(path.join(REPO, 'loader/tmt-planner.js'), 'utf8');

/** A number type with EVERY method the planner calls, reachable under no global name. */
class Num extends Decimal {
  constructor(v) { super(v instanceof Decimal ? v.v : v); }
  sub(o) { return new Num(this.v - new Num(o).v); }
  abs() { return new Num(Math.abs(this.v)); }
  max(o) { return new Num(Math.max(this.v, new Num(o).v)); }
  pow(o) { return new Num(Math.pow(this.v, new Num(o).v)); }
  times(o) { return new Num(this.v * new Num(o).v); }
  plus(o) { return new Num(this.v + new Num(o).v); }
  div(o) { return new Num(this.v / new Num(o).v); }
  log10() { return new Num(Math.log10(this.v)); }
  valueOf() { return this.v; }
}

function oneLayer(buyables = {}, extra = {}) {
  return {
    a: Object.assign({
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      buyables,
      tmtStubTemp(tmp) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(0); t.requires = new Decimal(1e9); t.nextAt = new Decimal(1e9);
        t.canReset = false; t.autoPrestige = false; t.resetGain = new Decimal(0);
        t.buyables = {};
        for (const id of Object.keys(buyables)) if (buyables[id] && typeof buyables[id] === 'object') t.buyables[id] = { cost: new Decimal(5), unlocked: true, canAfford: buyables[id].canAfford !== false };
      },
    }, extra),
  };
}

/** Boot the automation, then REMOVE every global number name, give `player.points` type `Type`, load the planner. */
function plannerOver(Type) {
  const ctx = bootStub(oneLayer());
  delete ctx.Decimal;
  ctx.player.points = new Type(10);
  ctx.player.a.points = new Type(3);
  vm.runInContext(PLANNER, ctx, { filename: 'loader/tmt-planner.js' });
  return ctx;
}

// MUTANT m1 "the helper names a library again" (`x instanceof Decimal ? …`): with no global `Decimal` it throws.
test('Part 1: the planner computes in the game’s own number type with NO global `Decimal`', () => {
  const ctx = plannerOver(Num);
  assert.equal(typeof ctx.Decimal, 'undefined');
  const n = ctx.tmtLoader.planner.numbers();
  assert.equal(n.resolved, true);
  for (const op of Object.keys(n.ops)) assert.deepEqual(J(n.ops[op].missing), [], op);
  // the threshold probe: huge(), the power-of-ten bracket and the integer refinement all run in `Num`
  const pr = ctx.tmtLoader.planner.probe(() => ctx.player.a.points.gte(50));
  assert.equal(pr.probeable, true, JSON.stringify(pr));
  assert.equal(pr.dimension, 'player.a.points');
  assert.equal(pr.threshold, '50');
  assert.equal(ctx.player.a.points.v, 3, 'the probe restores what it perturbed');
});

// The same resolution on the break_eternity-shaped stub the rest of the suite uses (the 172-game case).
test('Part 1: the type is whatever `player.points` is an instance of — the stub’s own class here', () => {
  const ctx = plannerOver(Num);
  const trace = ctx.tmtLoader.planner.trace(() => ctx.player.a.points.gte(1));
  // resolving the type must not RECORD a read: the trace names only what the predicate read
  assert.deepEqual(J(trace.reads.map((r) => r.path)), ['player.a.points']);
  assert.equal(trace.reads[0].kind, 'decimal');
});

// MUTANT: a missing method COERCED to a float instead of abstaining. The stub `Decimal` has no pow / sub / abs / max.
test('Part 1: a method the type LACKS makes that operation abstain BY NAME — never a coercion', () => {
  const ctx = plannerOver(Decimal);
  const n = ctx.tmtLoader.planner.numbers();
  assert.deepEqual(J(n.ops.probe.missing), ['pow']);
  assert.deepEqual(J(n.ops.read.missing), ['sub', 'abs']);
  assert.deepEqual(J(n.ops.plan.missing), ['max']);
  const pr = ctx.tmtLoader.planner.probe(() => ctx.player.a.points.gte(50));
  assert.equal(pr.probeable, false);
  assert.match(pr.why, /has no pow\(\) — the probe operation abstains/);
  assert.throws(() => ctx.tmtLoader.planner.knowledge({}), /has no max\(\) — the plan operation abstains/);
  assert.throws(() => ctx.tmtLoader.planner.readBuyable('a', 11), /has no sub\(\), abs\(\) — the read operation abstains/);
});

test('Part 1: a game whose `player.points` is not a number object abstains by name, it does not guess', () => {
  const ctx = bootStub(oneLayer());
  delete ctx.Decimal;
  ctx.player.points = 10;
  vm.runInContext(PLANNER, ctx, { filename: 'loader/tmt-planner.js' });
  const n = ctx.tmtLoader.planner.numbers();
  assert.equal(n.resolved, false);
  assert.match(n.ops.read.missing[0], /no number type/);
});

// ---- Part 2: ONE enumeration ------------------------------------------------------------------------------------
// MUTANT m3 "numeric order changed" (declaration order, or strings): the pinned runs bought in numeric order.
test('Part 2: purchaseIds = numeric ids ascending AS NUMBERS, then word ids that hold an object, in declaration order', () => {
  const ctx = bootStub(oneLayer());
  const ids = ctx.tmtLoader.purchaseIds({
    frontBuy: {}, 21: {}, rows: 3, cols: () => 2, 3: {}, respec() {}, layer: 'a', 'd-11': {}, 100: {},
    front: { canAfford: false, buy() {} }, nul: null, arr: [1], respecConfirm: false,
  });
  assert.deepEqual(J(ids), [3, 21, 100, 'frontBuy', 'd-11']);
  assert.equal(typeof ids[0], 'number');
});

// MUTANT m2 "the enumeration admits a face": a buyable DECLARING `canAfford: false` is a display, not a purchase.
test('Part 2: a display-only object (canAfford: false as a CONSTANT) is not a purchase thing; a canAfford() function is', () => {
  const ctx = bootStub(oneLayer());
  assert.equal(ctx.tmtLoader.isPurchaseDef({ canAfford: false, buy() {} }), false);
  assert.equal(ctx.tmtLoader.isPurchaseDef({ canAfford() { return false; } }), true);
  assert.equal(ctx.tmtLoader.isObjectDef({ canAfford: false }), true, 'the READER still reads it (it abstains there)');
});

test('Part 2: the buyables kind BUYS a word-id buyable, and registers a feature for a layer that has only word ids', () => {
  const ctx = bootStub(oneLayer({ Dim1: { cost: () => new Decimal(5) } }), { options: { kinds: 'buyables' } });
  ctx.player.a.buyables.Dim1 = new Decimal(0);
  ctx.player.a.points = new Decimal(12);
  ctx.tmtLoader.profile('all');
  tick(ctx, 1);
  assert.equal(Number(ctx.player.a.buyables.Dim1), 2);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'acted:buyables');
});

// ---- Part 3: a BUTTON --------------------------------------------------------------------------------------------
function buttonGame(data) {
  const B = { face: { canAfford: false, buy() {} }, faceBuy: { cost: () => new Decimal(5) } };
  const ctx = bootStub(oneLayer(B), { options: { kinds: 'buyables' } });
  ctx.player.a.buyables.face = new Decimal(0);
  ctx.player.a.buyables.faceBuy = new Decimal(0);
  // the button's buy(): spends, and adds to the FACE — never to itself (universal-reconstruction's createSquareBuyables)
  ctx.buyBuyable = (l, id) => {
    const t = ctx.tmp[l].buyables[id];
    if (!t || !t.canAfford || !new Decimal(ctx.player[l].points).gte(t.cost)) return;
    ctx.player[l].points = new Decimal(ctx.player[l].points).plus(new Decimal(-t.cost));
    ctx.player[l].buyables.face = new Decimal(Number(ctx.player[l].buyables.face) + 1);
  };
  ctx.tmtLoader.currencyData = data;
  ctx.player.a.points = new Decimal(17);
  ctx.tmtLoader.profile('all');
  tick(ctx, 1);
  return ctx;
}
// MUTANT: the kind judges a purchase by the buyable's OWN amount only (the pre-C1c rule) — the button then spends
// once per tick and reports that it bought nothing.
test('Part 3: a button’s purchase is judged by the amount the data says it RAISES — bought to exhaustion, and counted', () => {
  const ctx = buttonGame({ generated: true, formatVersion: 1, game: 'stub', buyables: { a: { faceBuy: { pays: 'player.a.points', cost: 'price', by: ['rollback'], scored: true, raises: 'face' } } } });
  assert.equal(Number(ctx.player.a.buyables.face), 3);
  assert.equal(Number(ctx.player.a.points), 2);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'acted:buyables');
});
test('Part 3: with NO data the button is today’s rule — one purchase a tick, reported as nothing bought (three-valued: unknown = before)', () => {
  const ctx = buttonGame(null);
  assert.equal(Number(ctx.player.a.buyables.face), 1);
  assert.notEqual(rowOf(ctx, 'buyables:a').last.code, 'acted:buyables');
});
