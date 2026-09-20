// R3a — the challenge GIVE-UP rule (`sequential|give-up@B/H/Rx`), driven over the stub engine.
//
// ⛔ WHY THESE ARE UNIT TESTS AND NOT A FIXTURE LEG. Every row here is a claim about a CURVE — "a challenge that
// plateaus below its goal is left, one that is still climbing is not" — and a real game gives you one curve per
// four-minute leg. The stub lets the curve be the INPUT, so the rule can be shown against the two shapes that
// matter, against PTR's own measured H11 curve, and against the mutants that would pass a plateau-only test.
//
// ⚠ Every test names the MUTANT it is against (`tools/harness/mutants-r3.sh`). A row nothing can red is not a gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, codes, rowOf, Decimal } from './stub-engine.mjs';

// ---- the scripted game -------------------------------------------------------------------------------------------
// One NORMAL layer `h` with two challenges. `curve(t)` is the CHALLENGE CURRENCY as a function of the game-seconds
// SINCE ENTRY, in the only units that matter to the rule: the exponent of the goal already reached. The layer's own
// resource (`player.h.points`) is what the RETRY rule reads, so the test drives that too.
const GOAL = new Decimal(1e300);          // log10 = 300; `p` is log10(points) / 300

function game(o = {}) {
  const entered = { at: null, id: null };
  return {
    h: {
      name: 'hindrance', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(o.held === undefined ? 1 : o.held), activeChallenge: null }),
      challenges: { 11: {}, 12: {} },
      tmtStubTemp(tmp, player) {
        const t = tmp.h || (tmp.h = {});
        t.type = 'normal'; t.baseAmount = new Decimal(0); t.requires = new Decimal(1e9); t.nextAt = new Decimal(1e9);
        t.canReset = false; t.autoPrestige = false; t.resetGain = new Decimal(0);
        const a = player.h.activeChallenge;
        if (a === null || a === undefined) { entered.at = null; entered.id = null; }
        else if (entered.id !== Number(a)) { entered.at = Number(player.timePlayed); entered.id = Number(a); }
        const dt = entered.at === null ? 0 : Number(player.timePlayed) - entered.at;
        // ⚠ A FORK WHOSE OWN `doReset` WIPES ITS OWN LAYER. `rowReset` leaves a SAME-ROW layer's data alone unless
        // that layer's own `doReset` touches it (games/ptr/js/game.js), and PTR's `h` does not — so on PTR the
        // strength at ENTRY and the strength at the GIVE-UP happen to be equal, and nothing there can tell the two
        // readings apart. `wipeInside` supplies the engine shape that can.
        if (o.wipeInside) player.h.points = new Decimal(a === null || a === undefined ? Number(player.h.points) : 0);
        // the currency the challenge is scored on — `player.points`, which is what `canCompleteChallenge` reads
        // when a challenge declares no `currencyInternalName` (the engine's own default branch).
        player.points = new Decimal(Math.pow(10, 300 * (a === null || a === undefined ? 0 : o.curve(dt, Number(a)))));
        t.challenges = {
          11: { unlocked: true, completionLimit: 1, goal: GOAL },
          12: { unlocked: true, completionLimit: 1, goal: GOAL },
        };
      },
    },
  };
}
const boot = (o, table) => {
  const ctx = bootStub(game(o), { autoTable: Object.assign({ order: { 'challenges:h': [11, 12] } }, table || {}) });
  ctx.tmtLoader.profile('all');
  // the stub's `canCompleteChallenge` is a flag; make it read the same thing the engine does — the currency against
  // the goal — so "completable" is a consequence of the curve rather than a second, independent knob.
  ctx.canCompleteChallenge = (l, id) => Number(ctx.player[l].activeChallenge) === id && ctx.player.points.gte(GOAL);
  return ctx;
};
const row = (ctx) => rowOf(ctx, 'challenges:h').last;
const POLICY = (b, h, r) => `sequential|give-up@${b}/${h}/${r}x`;

// ---- the two shapes that matter ------------------------------------------------------------------------------------
test('a challenge that PLATEAUS below its goal is LEFT — and the reason names how far it got', () => {
  // p rises to 0.6 in 40 s and then never moves again — PTR's H12, in miniature.
  const ctx = boot({ curve: (dt) => Math.min(0.6, dt / 66.7) }, { policies: { 'challenges:h': POLICY(0.1, 30, 2) } });
  tick(ctx, 200);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 1, JSON.stringify(codes(ctx)));
  assert.ok(codes(ctx)['acted:challenge-give-up'] > 0);
  assert.ok(codes(ctx)['waiting:progress'] > 0, 'it waited before it gave up');
  assert.equal(ctx.player.h.challenges[11], 0, '⛔ a give-up is NOT a completion');
});

test('a challenge that is still CLIMBING is NOT left — mutant `gives up while still climbing`', () => {
  // p closes 20 % of what is left every 30 s for ever: always above a 10 % bar, never finished inside the leg.
  const ctx = boot({ curve: (dt) => 1 - Math.pow(0.8, dt / 30) }, { policies: { 'challenges:h': POLICY(0.1, 30, 2) } });
  tick(ctx, 400);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0, JSON.stringify(codes(ctx)));
  assert.equal(row(ctx).code, 'waiting:progress');
});

test('⛔ the window is RECENT, not the average since entry — PTR’s own H11 curve is NOT abandoned', () => {
  // The measured H11 shape (plan §30): p = 0 · 0.43 · 0.78 · 0.92 · 0.97 · 0.988 · 0.997 at 0/10/20/30/40/50/60 s,
  // reaching the goal at 65. Its best AVERAGE rate is the first ten seconds' and nothing later comes near it, so a
  // rule anchored to the best rate since entry abandons it at 99.7 % of its goal. This one must not.
  const H11 = [[0, 0], [10, 0.4314], [20, 0.776], [30, 0.919], [40, 0.9696], [50, 0.9878], [60, 0.9968], [65, 1.001]];
  const at = (dt) => { let v = 0; for (const [t, p] of H11) if (dt >= t) v = p; return v; };
  const ctx = boot({ curve: at }, { policies: { 'challenges:h': POLICY(0.1, 30, 2) } });
  tick(ctx, 70);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0, 'it must not give up on a challenge it is about to win');
  assert.equal(ctx.player.h.challenges[11], 1, 'it completed it');
});

test('B = 0 is the BARE rule and the control: a dead-flat attempt is left, one that moves at all is kept', () => {
  const flat = boot({ curve: () => 0.5 }, { policies: { 'challenges:h': POLICY(0, 20, 2) } });
  tick(flat, 100);
  assert.equal(flat.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 1, 'flat at B=0 is given up');
  // a crawl no `B` above zero would accept, kept by `@0/H` because it is still moving
  const creep = boot({ curve: (dt) => 0.5 + dt * 1e-9 }, { policies: { 'challenges:h': POLICY(0, 20, 2) } });
  tick(creep, 100);
  assert.equal(creep.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0, '@0/H gives up only when progress stops dead');
  // …and the same crawl IS given up once B asks for a tenth of the remaining distance
  const bar = boot({ curve: (dt) => 0.5 + dt * 1e-9 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  tick(bar, 100);
  assert.equal(bar.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 1, 'B is what separates a crawl from a climb');
});

// ---- the retry rule ---------------------------------------------------------------------------------------------
test('after a give-up the challenge is NOT re-entered until the layer is R× stronger — mutant `no retry`', () => {
  const ctx = boot({ curve: () => 0.5, held: 4 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  tick(ctx, 60);
  const s = ctx.tmtLoader.hookStats().challenges['challenges:h'];
  assert.equal(s.gaveUp, 1);
  assert.equal(s.enter, 1, '⛔ it did not walk straight back in');
  assert.equal(row(ctx).code, 'waiting:retry');
  assert.equal(String(row(ctx).values.need), '8', '4 held at the failed attempt, R = 2');
  ctx.player.h.points = new Decimal(8);
  tick(ctx, 2);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].enter, 2, 'the layer is strong enough, so it tries again');
});

test('⛔ the retry bar is the strength the attempt STARTED from — mutant `retry bar read at the give-up`', () => {
  // The layer holds 4 outside and is wiped to 0 for as long as the attempt lasts. The bar must be R × 4, not
  // R × 1 (which is what the empty-purse floor would turn a give-up-time reading into) — the second would let the
  // run walk straight back into a challenge it has just failed, on a layer that has not grown at all.
  const ctx = boot({ curve: () => 0.5, held: 4, wipeInside: true }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  tick(ctx, 60);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 1);
  assert.equal(row(ctx).code, 'waiting:retry');
  assert.equal(String(row(ctx).values.need), '8', 'R × what it held at ENTRY (4), not R × what being inside left (0 → floored to 1)');
});

test('⛔ the retry bar has R2’s EMPTY-PURSE FLOOR — a layer holding nothing does not re-enter at once', () => {
  const ctx = boot({ curve: () => 0.5, held: 0 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  tick(ctx, 60);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].enter, 1, 'R × 0 would be no condition at all');
  assert.equal(String(row(ctx).values.need), '2', 'the purse is floored at one unit, so the bar is R × 1');
});

// ---- the pause, and what it leaves behind -------------------------------------------------------------------------
test('a `while` that goes false INSIDE a challenge says so, and names which control — mutant `a stranded pause reads as an ordinary gate`', () => {
  const ctx = boot({ curve: (dt) => Math.min(0.6, dt / 66.7) }, { gates: { 'challenges:h': 'player.h.activeChallenge === null' } });
  ctx.tmtLoader.setPolicy('challenges:h', 'sequential');
  tick(ctx, 5);
  assert.equal(ctx.player.h.activeChallenge, 11, 'it entered while the gate was true');
  assert.equal(row(ctx).code, 'paused:in-challenge');
  assert.equal(row(ctx).values.which, 'while');
  assert.equal(row(ctx).values.id, 11);
  assert.ok(ctx.tmtLoader.reasonText(row(ctx)).indexOf('does not leave a challenge') > 0, ctx.tmtLoader.reasonText(row(ctx)));
});

test('an `until` that latches inside a challenge says the same thing, and names `until`', () => {
  const ctx = boot({ curve: (dt) => Math.min(0.6, dt / 66.7) }, {});
  ctx.tmtLoader.setPolicy('challenges:h', 'sequential');
  ctx.tmtLoader.setControl('challenges:h', 'until', 'player.h.activeChallenge !== null');
  tick(ctx, 5);
  assert.equal(row(ctx).code, 'paused:in-challenge');
  assert.equal(row(ctx).values.which, 'until');
});

test('⚠ a predicate that THREW keeps `blocked:predicate` even inside a challenge — that is the bigger news', () => {
  const ctx = boot({ curve: (dt) => Math.min(0.6, dt / 66.7) }, {});
  ctx.tmtLoader.setPolicy('challenges:h', 'sequential');
  tick(ctx, 3);
  assert.equal(ctx.player.h.activeChallenge, 11);
  ctx.tmtLoader.setControl('challenges:h', 'while', 'player.nosuchlayer.gte(1)');
  tick(ctx, 2);
  assert.equal(row(ctx).code, 'blocked:predicate', 'a mistyped predicate is not the same news as a stranded pause');
  assert.equal(row(ctx).values.which, 'while');
});

test('a pause on a kind that strands NOTHING keeps its own code', () => {
  const ctx = boot({ curve: () => 0 }, { gates: { 'challenges:h': 'false' } });
  ctx.tmtLoader.setPolicy('challenges:h', 'sequential');
  tick(ctx, 3);
  assert.equal(row(ctx).code, 'blocked:gate', 'nothing was entered, so nothing is stranded');
});

// ---- the guards --------------------------------------------------------------------------------------------------
test('the ENGINE still has the last word on leaving: `canExitChallenge` refusing reports blocked:exit', () => {
  const ctx = boot({ curve: () => 0.5 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  ctx.exitable['h:11'] = false;
  tick(ctx, 60);
  assert.equal(row(ctx).code, 'blocked:exit');
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0);
});

test('a challenge whose goal this engine does not publish is judged by NOTHING — the pre-slice reason, unchanged', () => {
  const g = game({ curve: () => 0.5 });
  const inner = g.h.tmtStubTemp;
  g.h.tmtStubTemp = function (tmp, player) { inner(tmp, player); delete tmp.h.challenges[11].goal; delete tmp.h.challenges[12].goal; };
  const ctx = bootStub(g, { autoTable: { order: { 'challenges:h': [11, 12] }, policies: { 'challenges:h': POLICY(0.1, 20, 2) } } });
  ctx.tmtLoader.profile('all');
  ctx.canCompleteChallenge = () => false;
  tick(ctx, 60);
  assert.equal(row(ctx).code, 'in-challenge');
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0);
});

test('⛔ `sequential` WITHOUT the modifier is unchanged — the control that attributes every row above', () => {
  const ctx = boot({ curve: (dt) => Math.min(0.6, dt / 66.7) }, { policies: { 'challenges:h': 'sequential' } });
  tick(ctx, 200);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0);
  assert.equal(row(ctx).code, 'in-challenge', 'it is still in there, saying what it always said');
  assert.equal(ctx.player.h.activeChallenge, 11);
});

test('⛔ `sequential|give-up@…` is a POLICY, not an unknown one — mutant `the kind reads the policy STRING`', () => {
  const ctx = boot({ curve: () => 0.5 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  tick(ctx, 2);
  assert.notEqual(row(ctx).code, 'off:policy', 'reading `f.policy` as a bare string would turn the whole feature off');
  assert.equal(ctx.tmtLoader.explain().find((r) => r.id === 'challenges:h').policy.modifier.id, 'give-up@B/H/Rx');
});

// ---- the memory ---------------------------------------------------------------------------------------------------
test('the rule’s memory round-trips through runtimeState(), and is ABSENT when no modifier is in force', () => {
  const off = boot({ curve: () => 0.5 }, { policies: { 'challenges:h': 'sequential' } });
  tick(off, 20);
  const k = Object.keys(off.tmtLoader.runtimeState());
  assert.ok(k.indexOf('challengeAttempt') < 0 && k.indexOf('challengeFailed') < 0, `a run with no modifier writes the pre-slice record: ${k}`);

  const ctx = boot({ curve: () => 0.5, held: 4 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  tick(ctx, 60);
  const rt = ctx.tmtLoader.runtimeState();
  assert.ok(rt.challengeFailed['challenges:h'][11] !== undefined, JSON.stringify(rt.challengeFailed));
  ctx.tmtLoader.restoreRuntime(JSON.parse(JSON.stringify(rt)));
  assert.deepEqual(ctx.tmtLoader.runtimeState().challengeFailed, rt.challengeFailed, 'restoreRuntime(runtimeState()) is the identity');
});

test('⚠ a run that finds itself inside a challenge with NO record SEEDS the window rather than giving up at once', () => {
  const ctx = boot({ curve: () => 0.5 }, { policies: { 'challenges:h': POLICY(0.1, 20, 2) } });
  ctx.player.h.activeChallenge = 11;                 // as a resumed save, or a player who entered by hand, would
  ctx.player.timePlayed = 5000;
  tick(ctx, 2);
  assert.equal(row(ctx).code, 'waiting:progress', 'the window starts here, not at time zero');
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 0);
  tick(ctx, 30);
  assert.equal(ctx.tmtLoader.hookStats().challenges['challenges:h'].gaveUp, 1, '…and then it is judged like any other');
});
