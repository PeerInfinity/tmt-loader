// V5 — RETRY CONDITIONS for a challenge that was given up (`sequential|give-up@B/H/<condition>`), over the stub.
//
// ⚖ The user (2026-09-20): "we will want more options for the condition to wait for before retrying challenges.
// Another option might be total resets on the current highest row."
// ⛔ Each condition is a ROW of `RETRY_CONDITIONS` in loader/tmt-auto.js and becomes one ordinary modifier; these tests
// drive every row's `wait` on a constructed game, and each names the MUTANT it is against
// (`tools/harness/mutants-v5.sh`). A row nothing can red is not a gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, codes, rowOf, Decimal } from './stub-engine.mjs';

const GOAL = new Decimal(1e300);

/**
 * `h` (row 1) carries the challenges, and plateaus at p = 0.5 inside either one, so a give-up is certain.
 * `x` and `y` are ROW 2 and reset whenever `state.can[l]` allows; `z` is ROW 3 and stays LOCKED until the test
 * unlocks it — which is how "a new row opens mid-wait" is constructed.
 */
function game(state) {
  const resetter = (id, row) => ({
    name: id, row, type: 'normal', layerShown: () => true,
    startData: () => ({ unlocked: id !== 'z', points: new Decimal(0) }),
    tmtStubTemp(tmp) {
      const t = tmp[id] || (tmp[id] = {});
      t.type = 'normal'; t.baseAmount = new Decimal(1); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
      t.canReset = !!state.can[id]; t.autoPrestige = false; t.resetGain = new Decimal(1);
      t.upgrades = {}; t.buyables = {};
    },
  });
  const entered = { at: null, id: null };
  return {
    h: {
      name: 'hindrance', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(4), activeChallenge: null }),
      challenges: { 11: {}, 12: {} },
      tmtStubTemp(tmp, player) {
        const t = tmp.h || (tmp.h = {});
        t.type = 'normal'; t.baseAmount = new Decimal(0); t.requires = new Decimal(1e9); t.nextAt = new Decimal(1e9);
        t.canReset = false; t.autoPrestige = false; t.resetGain = new Decimal(0);
        const a = player.h.activeChallenge;
        if (a === null || a === undefined) { entered.at = null; entered.id = null; }
        else if (entered.id !== Number(a)) { entered.at = Number(player.timePlayed); entered.id = Number(a); }
        player.points = new Decimal(Math.pow(10, 300 * (a === null || a === undefined ? 0 : 0.5)));
        t.challenges = { 11: { unlocked: true, completionLimit: 1, goal: GOAL }, 12: { unlocked: true, completionLimit: 1, goal: GOAL } };
      },
    },
    x: resetter('x', 2), y: resetter('y', 2), z: resetter('z', 3),
  };
}
function boot(policy, state = { can: {} }, extra = {}) {
  const policies = Object.assign({ 'challenges:h': policy, 'reset:x': 'always', 'reset:y': 'always', 'reset:z': 'always' }, extra.policies || {});
  const ctx = bootStub(game(state), { id: 'stub', options: extra.options, autoTable: { order: { 'challenges:h': [11, 12] }, policies } });
  ctx.tmtLoader.profile('all');
  ctx.canCompleteChallenge = (l, id) => Number(ctx.player[l].activeChallenge) === id && ctx.player.points.gte(GOAL);
  return ctx;
}
const T = (ctx) => ctx.tmtLoader;
const row = (ctx) => rowOf(ctx, 'challenges:h').last;
const ch = (ctx) => T(ctx).hookStats().challenges['challenges:h'] || { enter: 0, exit: 0, gaveUp: 0 };
/** Out of the stub's vm realm, so `deepEqual` compares values rather than prototypes. */
const J = (x) => JSON.parse(JSON.stringify(x));
/** Tick until the first give-up has happened (the plateau is left after H = 20 s of no progress). */
// ⚠ and ONE tick more: the give-up's own tick reports `acted:challenge-give-up`; the wait is the NEXT decision.
function toGiveUp(ctx) { for (let i = 0; i < 80 && ch(ctx).gaveUp < 1; i++) tick(ctx, 1); assert.equal(ch(ctx).gaveUp, 1, JSON.stringify(codes(ctx))); tick(ctx, 1); }

// ---- the table ---------------------------------------------------------------------------------------------------
test('every retry condition is an ENUMERABLE modifier row of the challenges kind, and R3a’s row is FIRST and UNCHANGED', () => {
  const ctx = boot('sequential');
  const ids = T(ctx).modifiers('challenges').map((m) => m.id);
  assert.deepEqual(J(ids), ['give-up@B/H/Rx', 'give-up@B/H/Nresets', 'give-up@B/H/Nresets-now', 'give-up@B/H/Ts', 'give-up@B/H/when']);
  const r3a = T(ctx).modifiers('challenges')[0];
  assert.equal(r3a.template, 'give-up@{b}/{h}/{r}x');
  assert.deepEqual(J(r3a.params.map((p) => [p.name, p.default])), [['b', '0.1'], ['h', '30'], ['r', '2']]);
  // ⛔ the derived default is R3a's string, byte for byte — no default moves in this slice
  assert.equal(T(ctx).defaultPolicyString('challenges', 'sequential'), 'sequential');
  for (const s of ['sequential|give-up@0.1/30/2x', 'sequential|give-up@0.1/30/10resets', 'sequential|give-up@0.1/30/10resets-now', 'sequential|give-up@0.1/30/600s', 'sequential|give-up@0.1/30/when']) {
    assert.equal(T(ctx).formatPolicy('challenges', T(ctx).parsePolicy('challenges', s)), s, `${s} round-trips`);
  }
  // the predicate is a SIDE parameter: declared, editable, and never part of the string
  const when = T(ctx).modifiers('challenges')[4];
  assert.deepEqual(J(when.params.map((p) => [p.name, p.type, !!p.side])), [['b', 'fraction', false], ['h', 'seconds', false], ['w', 'predicate', true]]);
});

test('⛔ R3a’s rule keeps R3a’s RECORD — the strength as a STRING, exactly as before — mutant `every condition writes an object`', () => {
  const ctx = boot('sequential|give-up@0.1/20/2x');
  toGiveUp(ctx);
  assert.equal(row(ctx).code, 'waiting:retry');
  assert.equal(typeof T(ctx).runtimeState().challengeFailed['challenges:h'][11], 'string', JSON.stringify(T(ctx).runtimeState().challengeFailed));
});

// ---- (ii) N resets of the highest row ------------------------------------------------------------------------------
test('RESETS: the wait counts this automation’s resets of the highest row SINCE the give-up — mutant `count from the total`', () => {
  const state = { can: { x: true, y: true } };
  const ctx = boot('sequential|give-up@0.1/20/10resets', state);
  toGiveUp(ctx);
  // x and y were resetting all through the attempt; none of those may count
  const w = row(ctx);
  assert.equal(w.code, 'waiting:retry-resets', JSON.stringify(w));
  assert.equal(w.values.row, 2);
  assert.deepEqual(J(w.values.layers), ['x', 'y']);
  assert.ok(w.values.done <= 2, `resets made BEFORE the give-up were counted: ${w.values.done}`);
  const enters = ch(ctx).enter;
  tick(ctx, 3);
  assert.equal(ch(ctx).enter, enters, 'not yet');
  assert.match(T(ctx).reasonText(row(ctx)), /of 10 so far \(x, y\)/, T(ctx).reasonText(row(ctx)));
  tick(ctx, 5);
  assert.equal(ch(ctx).enter, enters + 1, `ten resets of row 2 (two a tick) and it tries again: ${JSON.stringify(row(ctx))}`);
});

test('RESETS: a member that does not reset does not count, and the count says so — mutant `count every reset feature`', () => {
  const state = { can: { x: true, y: false } };
  const ctx = boot('sequential|give-up@0.1/20/4resets', state);
  toGiveUp(ctx);
  const d0 = row(ctx).values.done;
  tick(ctx, 2);
  assert.equal(row(ctx).values.done, d0 + 2, 'x alone: one a tick');
  // a reset on ANOTHER row (h is row 1) must not count either — nothing resets there, which is the point of the row
  assert.deepEqual(J(row(ctx).values.layers), ['x', 'y']);
});

test('⚖ RESETS: the row is FROZEN at the give-up — a row that opens mid-wait does not move the bar; `-now` follows it — mutants `nothing frozen`, `count every reset feature`', () => {
  for (const [pol, frozen] of [['sequential|give-up@0.1/20/60resets', true], ['sequential|give-up@0.1/20/60resets-now', false]]) {
    const state = { can: { x: true, y: true } };
    const ctx = boot(pol, state);
    toGiveUp(ctx);
    // row 3 opens; on row 2 only `x` goes on resetting, and `z` resets on row 3 — ONE reset a tick on each row, so a
    // count that took in both rows would move by two a tick and could not be mistaken for either reading
    ctx.player.z.unlocked = true; state.can.y = false; state.can.z = true;
    tick(ctx, 1);
    const d0 = row(ctx).values.done;
    tick(ctx, 4);
    const w = row(ctx);
    assert.equal(w.code, 'waiting:retry-resets', JSON.stringify(w));
    if (frozen) {
      assert.equal(w.values.row, 2, `${pol}: the row moved: ${JSON.stringify(w)}`);
      assert.deepEqual(J(w.values.layers), ['x', 'y']);
    } else {
      assert.equal(w.values.row, 3, `${pol}: the row did not follow: ${JSON.stringify(w)}`);
      assert.deepEqual(J(w.values.layers), ['z']);
    }
    assert.equal(w.values.done - d0, 4, `${pol}: one reset a tick of the row it counts, not both rows' — ${d0} → ${w.values.done}`);
  }
});

test('⛔ RESETS: a RESUMED run continues the count, and a resume that lost the action counters does not go backwards', () => {
  const state = { can: { x: true, y: true } };
  const ctx = boot('sequential|give-up@0.1/20/20resets', state);
  toGiveUp(ctx);
  tick(ctx, 3);
  const before = row(ctx).values.done;
  const rt = JSON.parse(JSON.stringify(T(ctx).runtimeState()));
  // (a) the uninterrupted-equivalent resume: the record and the counters both come back
  T(ctx).restoreRuntime(rt);
  tick(ctx, 1);
  assert.equal(row(ctx).values.done, before + 2, 'the count continues');
  // (b) a resume WITHOUT the action counters (a `--no-runtime`-style load): they read 0 again
  const rt2 = JSON.parse(JSON.stringify(T(ctx).runtimeState()));
  const kept = row(ctx).values.done;
  rt2.stats.actions = {};
  T(ctx).restoreRuntime(rt2);
  tick(ctx, 1);
  assert.ok(row(ctx).values.done >= kept, `the count went BACKWARDS across a resume: ${kept} → ${row(ctx).values.done}`);
  assert.ok(row(ctx).values.done <= kept + 2, `…or counted the whole counter again: ${kept} → ${row(ctx).values.done}`);
});

// ---- (iii) a clock ---------------------------------------------------------------------------------------------------
test('CLOCK: the challenge is tried again T game-seconds after the give-up, and the readout counts them', () => {
  const ctx = boot('sequential|give-up@0.1/20/15s');
  toGiveUp(ctx);
  const enters = ch(ctx).enter;
  tick(ctx, 5);
  assert.equal(row(ctx).code, 'waiting:retry-clock');
  assert.match(T(ctx).reasonText(row(ctx)), /15 s after it was given up: 6 s so far/, T(ctx).reasonText(row(ctx)));
  tick(ctx, 11);
  assert.equal(ch(ctx).enter, enters + 1, 'and then it tries again');
});

// ---- (iv) a predicate ------------------------------------------------------------------------------------------------
test('WHEN: a typed condition decides; it is SAVED beside the policy, never inside it — mutant `the predicate is ignored`', () => {
  const ctx = boot('sequential|give-up@0.1/20/when');
  toGiveUp(ctx);
  assert.equal(ch(ctx).enter, 2, 'empty is NO condition: tried again at once (R3a’s R = 1 control)');
  const r = T(ctx).setSavedParam('challenges:h', 'w', 'player.h.points.gte(100)', 'modifier');
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(T(ctx).savedPolicy('challenges:h'), null, 'the policy string was not written: the predicate is not a token of it');
  assert.equal(T(ctx).savedArg('challenges:h', 'w'), 'player.h.points.gte(100)');
  assert.equal(rowOf(ctx, 'challenges:h').policy.modifier.params.w, 'player.h.points.gte(100)', 'and the editors see it');
  for (let i = 0; i < 80 && ch(ctx).gaveUp < 2; i++) tick(ctx, 1);
  const enters = ch(ctx).enter;
  tick(ctx, 3);
  assert.equal(row(ctx).code, 'waiting:retry-when');
  assert.equal(ch(ctx).enter, enters, 'false: it waits');
  ctx.player.h.points = new Decimal(100);
  tick(ctx, 1);
  assert.equal(ch(ctx).enter, enters + 1, 'true: it tries again');
});

test('WHEN: a condition that THROWS is not one that is false — `blocked:retry-when`; one that does not compile is refused', () => {
  const ctx = boot('sequential|give-up@0.1/20/when');
  T(ctx).setArg('challenges:h', 'w', 'player.nosuchlayer.points.gte(1)');
  toGiveUp(ctx);
  tick(ctx, 2);
  assert.equal(row(ctx).code, 'blocked:retry-when');
  const bad = T(ctx).setSavedParam('challenges:h', 'w', 'player.h.points.gte(', 'modifier');
  assert.equal(bad.ok, false);
  assert.match(bad.error, /not a JavaScript expression/);
});

test('WHEN: `--auto-opt arg:<id>.w=` is the harness’s lever, below the player’s saved value', () => {
  const ctx = boot('sequential|give-up@0.1/20/when', { can: {} }, { options: { 'arg:challenges:h.w': 'false' } });
  toGiveUp(ctx);
  tick(ctx, 3);
  assert.equal(row(ctx).code, 'waiting:retry-when');
  assert.equal(ch(ctx).enter, 1);
  T(ctx).setSavedParam('challenges:h', 'w', 'true', 'modifier');
  tick(ctx, 1);
  assert.equal(ch(ctx).enter, 2, 'the saved value outranks the option');
});

// ---- inertness -------------------------------------------------------------------------------------------------------
test('⛔ with no give-up modifier there is no retry memory at all, and `edits.args` appears only when a player types one', () => {
  const ctx = boot('sequential');
  tick(ctx, 60);
  const k = Object.keys(T(ctx).runtimeState());
  assert.ok(!k.includes('challengeFailed'), k.join(','));
  assert.equal(JSON.stringify(ctx.player.au.edits), '{}');
});
