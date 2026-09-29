// C1 — the CURRENCY CONSUMERS, driven over the stub engine: `reserve` on a FOREIGN currency, the reason line that
// names the currency (or says it is unknown), and the three-valued rule that an ABSTENTION is today's behaviour.
//
// ⛔ WHAT THIS FILE IS FOR. PTR's table sets no reserve on a buyable that pays a foreign currency, so nothing in the
// shipped configuration exercises the new branch — and `gates-c1` part 4's whole claim is that it stays that way
// (inertness, to the hash). So every claim about the branch itself is CONSTRUCTED here, each one named against the
// mutant it kills: a reserve that still reads the layer's own points; an unscored entry promoted to an answer; a
// refusal that guesses a currency.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

/** Layer `a` has buyable 11 at cost 5; layer `b` holds the FOREIGN currency it really pays in (`player.b.points`). */
function game() {
  return {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      buyables: { 11: { cost: () => new Decimal(5) } },
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(1e9); t.nextAt = new Decimal(1e9);
        t.canReset = false; t.autoPrestige = false; t.resetGain = new Decimal(0);
        t.buyables = { 11: { cost: new Decimal(5), unlocked: true } };
      },
    },
    b: {
      name: 'beta', row: 1, type: 'static', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      upgrades: { 11: { cost: new Decimal(30) } },
      tmtStubTemp(tmp, player) {
        const t = tmp.b || (tmp.b = {});
        t.type = 'static'; t.baseAmount = new Decimal(0); t.requires = new Decimal(1e9); t.nextAt = new Decimal(1e9);
        t.canReset = false; t.autoPrestige = false; t.resetGain = new Decimal(0);
        t.upgrades = { 11: { cost: new Decimal(30), unlocked: true } };
      },
    },
  };
}
const DATA = (entry) => ({ generated: true, formatVersion: 1, game: 'stub', buyables: { a: { 11: entry } } });
const SCORED = { pays: 'player.b.points', cost: 'price', by: ['rollback', 'regex', 'trace'], scored: true };
/** Boot with only the buyables kind on, the given policy and generated data; the stub's buyBuyable made to pay b. */
function boot(policy, data) {
  const ctx = bootStub(game(), { options: { kinds: 'buyables' }, autoTable: { policies: { 'buyables:a': policy } } });
  ctx.tmtLoader.currencyData = data === undefined ? null : data;
  ctx.buyBuyable = (l, id) => {
    const b = ctx.tmp[l].buyables[id];
    if (!b.unlocked || !new Decimal(ctx.player.b.points).gte(b.cost)) return;
    ctx.player.b.points = new Decimal(ctx.player.b.points).plus(new Decimal(-b.cost));
    ctx.player[l].buyables[id] = new Decimal(Number(ctx.player[l].buyables[id]) + 1);
  };
  ctx.tmtLoader.profile('all');
  return ctx;
}

// MUTANT: `reserve` reads `player[l].points` whatever the data says (the pre-C1 code on the foreign branch).
test('reserve>=N protects the FOREIGN currency the generated data names — and names it in the reason', () => {
  const ctx = boot('reserve>=20', DATA(SCORED));
  ctx.player.a.points = new Decimal(1000);   // the layer's OWN points are rich: a reserve on them would never hold
  ctx.player.b.points = new Decimal(18);
  tick(ctx, 1);
  const r = rowOf(ctx, 'buyables:a');
  assert.equal(r.last.code, 'holding:reserve-in');
  assert.equal(r.last.values.currency, 'player.b.points');
  assert.equal(Number(ctx.player.a.buyables[11]), 0, 'it bought through a reserve on the currency it really spends');
  ctx.player.b.points = new Decimal(32);
  tick(ctx, 1);
  // 32 → 27 → 22 → 17: checked BEFORE each purchase, exactly as the own-points reserve is
  assert.equal(Number(ctx.player.b.points), 17);
  assert.equal(Number(ctx.player.a.buyables[11]), 3);
  assert.equal(Number(ctx.player.a.points), 1000, 'and the layer\'s own points were never the currency');
});

// MUTANT: `reserve>=next-upgrade` reads the buyable's OWN layer's upgrades for a foreign currency.
test('reserve>=next-upgrade in a foreign currency is the next upgrade costed in THAT currency', () => {
  const ctx = boot('reserve>=next-upgrade', DATA(SCORED));
  ctx.player.b.points = new Decimal(29);   // b's upgrade 11 costs 30 in b's points
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'holding:reserve-in');
  assert.equal(Number(rowOf(ctx, 'buyables:a').last.values.reserve), 30);
});

// MUTANT: an UNSCORED entry (the regex's pick, never confirmed by the rollback) promoted to an answer.
test('an unscored entry is an ABSTENTION: the reserve reads the layer\'s own points, as it did before C1', () => {
  const ctx = boot('reserve>=20', DATA({ pays: 'player.b.points', cost: 'unknown', by: [], scored: false, why: 'not affordable' }));
  ctx.player.a.points = new Decimal(10);
  ctx.player.b.points = new Decimal(1000);
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'holding:reserve', 'the old code, word for word');
  assert.equal(Number(rowOf(ctx, 'buyables:a').last.values.have), 10, 'on the layer\'s own points');
});

// MUTANT: a multi-currency price (a LIST) read as its first field.
test('a scored multi-currency price is not one field — the reserve abstains to today\'s behaviour', () => {
  const ctx = boot('reserve>=20', DATA({ pays: ['player.a.points', 'player.b.points'], cost: 'price', by: ['rollback'], scored: true }));
  ctx.player.a.points = new Decimal(10);
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'holding:reserve');
});

// MUTANT: the refusal guesses "the layer's own points" when the currency is unknown.
test('nothing affordable: the reason names the currency it waits on, or says it is unknown', () => {
  const known = boot('buy', DATA(SCORED));
  known.player.b.points = new Decimal(2);
  tick(known, 1);
  const k = rowOf(known, 'buyables:a').last;
  assert.equal(k.code, 'nothing-affordable:paid-in');
  assert.equal(k.values.currency, 'player.b.points');
  assert.equal(Number(k.values.have), 2);
  assert.match(known.tmtLoader.reasonText(k), /paid in player\.b\.points/);
  const unknown = boot('buy', null);
  unknown.player.b.points = new Decimal(2);
  tick(unknown, 1);
  const u = rowOf(unknown, 'buyables:a').last;
  assert.equal(u.code, 'nothing-affordable:currency-unknown');
  assert.match(unknown.tmtLoader.reasonText(u), /which currency pays for it is unknown/);
});

test('tmtLoader.currencyOf returns a COPY of the generated entry, and null where there is none', () => {
  const ctx = boot('buy', DATA(SCORED));
  const e = ctx.tmtLoader.currencyOf('a', 11);
  assert.deepEqual(JSON.parse(JSON.stringify(e)), SCORED);   // (a vm-realm object: compared as data)
  e.pays = 'player.x';
  assert.equal(ctx.tmtLoader.currencyOf('a', 11).pays, 'player.b.points', 'the caller mutated the loader\'s data');
  assert.equal(ctx.tmtLoader.currencyOf('a', 12), null);
  assert.equal(ctx.tmtLoader.paysIn('a', 11), 'player.b.points');
});
