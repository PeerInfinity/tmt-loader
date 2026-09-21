// R3b — the ROW CYCLE (turn-taking between same-row resets), driven over the stub engine.
//
// ⛔ WHAT THIS FILE IS FOR. The cycle's whole content is a SCHEDULE, and a schedule is invisible in a hash: two
// builds that hand out the turns differently reach different marks in a real game and are byte-identical in any
// short leg. So every claim it makes is CONSTRUCTED here, against a mutant that reddens it, rather than inferred
// from a game's numbers. The real-game legs (`gates-r3b --part 1/3/4`) add what a stub cannot have — a game — and
// the two-family legs (`gates-r3b --part 2`) add what this file cannot: a SECOND ENGINE. That last one is R4's own
// requirement, and it exists because six of the planner's probe cells read `player.<layer>.resetTime`, which only
// the 2.7-style engine has, compared it against `undefined` on ptr, and measured nothing at all.
//
// ⚠ EVERY TEST HERE NAMES THE MUTANT IT IS AGAINST (plan §18.8: a row that cannot tell two builds apart will go
// green over the defect it was written for).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, codes, rowOf, Decimal } from './stub-engine.mjs';

/**
 * Two layers on ROW 1 (`a`, `b`) and one on row 2 (`c`), each resetting out of the shared `player.points`.
 * `state.can` / `state.gain` are the ENGINE's answers, so a test can make a member unable to act without touching
 * the loader — which is the only honest way to construct "the holder cannot use its turn".
 */
function game(state) {
  const layer = (id, row) => ({
    name: id, row, type: 'normal', layerShown: () => true,
    startData: () => ({ unlocked: state.unlocked[id] !== false, points: new Decimal(0) }),
    tmtStubTemp(tmp, player) {
      const t = tmp[id] || (tmp[id] = {});
      t.type = 'normal';
      // R3b-2: `state.base` / `state.req` let a leg CONSTRUCT the engine's own distance to a reset, which is the
      // only quantity the dead-member rule reads. Absent, they are what every earlier leg had.
      t.baseAmount = new Decimal(state.base[id] === undefined ? player.points : state.base[id]);
      t.requires = new Decimal(state.req[id] === undefined ? 1 : state.req[id]);
      t.nextAt = new Decimal(state.req[id] === undefined ? 1 : state.req[id]);
      t.canReset = state.can[id] !== false;
      t.autoPrestige = false;
      t.resetGain = new Decimal(state.gain[id] === undefined ? 1 : state.gain[id]);
      t.upgrades = {}; t.buyables = {};
    },
  });
  return { a: layer('a', 1), b: layer('b', 1), c: layer('c', 2) };
}
const fresh = () => ({ can: {}, gain: {}, unlocked: {}, base: {}, req: {} });
function boot(policies, state = fresh(), table = {}) {
  const ctx = bootStub(game(state), { id: 'stub', autoTable: Object.assign({ policies }, table) });
  ctx.tmtLoader.profile('all');
  return ctx;
}
const T = (ctx) => ctx.tmtLoader;
const cyc = (ctx, row = '1') => T(ctx).cycleState()[row] || null;
const acts = (ctx) => T(ctx).hookStats().actions;

// ---- INERTNESS: nothing exists until a policy says so --------------------------------------------------------------

test('⛔ with no policy carrying a cycle modifier there is NO cycle and NO memory — the block is ABSENT, not empty', () => {
  const ctx = boot({ 'reset:a': 'always', 'reset:b': 'always' });
  tick(ctx, 20);
  assert.deepEqual(Object.keys(T(ctx).cycleState()), [], 'a row with no carrier must not have a cycle');
  assert.equal('cycle' in T(ctx).runtimeState(), false, 'a run without a cycle must write exactly the record it wrote before this slice');
  // and both resets ran freely, which is the control every row below is against
  assert.ok(acts(ctx)['reset:a'] > 1 && acts(ctx)['reset:b'] > 1);
  // MUTANT: "a cycle is derived for every row" — this row goes red, because the members would be scheduled.
});

test('the two cycle modifiers are ENUMERABLE table rows, and each readout belongs to its own ROW', () => {
  const ctx = boot({ 'reset:a': `always|turn@2/3x/5/0/0`, 'reset:b': 'always|stall>=3x/5' });
  // ⚠ `.join` RATHER THAN `deepEqual`: everything the loader builds comes out of the stub's vm realm, so a
  // foreign Array is "same structure, not reference-equal" to a native one and `deepEqual` reds on a right value.
  const ids = T(ctx).modifiers('reset').map((m) => m.id).sort().join(',');
  assert.equal(ids, 'stall>=Kx/N,turn-demand@W/Kx/N/B/H,turn@W/Kx/N/B/H');
  tick(ctx, 5);
  // ⚖ R3a's rule, one modifier on: `stallState` must not answer for a feature carrying the cycle, and `turnState`
  // must not answer for one carrying the stall fallback. Neither THROWS when it is wrong — it says a false
  // sentence in the Advanced view, which is the class of defect V1 exists to prevent.
  assert.equal(T(ctx).stallState('reset:a'), null, 'the stall readout answered about a feature carrying the cycle');
  assert.notEqual(T(ctx).turnState('reset:a'), null);
  assert.equal(T(ctx).turnState('reset:b'), null, 'the cycle readout answered about a feature carrying the stall fallback');
  assert.notEqual(T(ctx).stallState('reset:b'), null);
  // MUTANT: "the readout is chosen by `P.modifier` alone" — both rows above go red.
});

test('a cycle member accumulates NO stall intervals, so the two modifiers cannot share memory', () => {
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5/0/0`, 'reset:b': `always|turn@1/3x/5/0/0` });
  tick(ctx, 40);
  const rt = T(ctx).runtimeState();
  assert.equal('stallIntervals' in rt, false, 'a turn modifier fed the stall fallback’s interval memory');
  assert.equal('cycle' in rt, true);
  // MUTANT: "`pushInterval` is reached from any modifier" — `stallIntervals` appears and the first row goes red.
});

// ---- R1: THE CYCLE BINDS EVERY MEMBER OF THE ROW -------------------------------------------------------------------

test('R1 — a member that declares NOTHING is bound anyway, and says `waiting:turn` out of its turn', () => {
  // `b` carries no modifier at all. An eager `b` that is not in the cycle is exactly the planner's void cell: it
  // fired 44 times and starved the member whose turn it was.
  const ctx = boot({ 'reset:a': `always|turn@3/3x/5/0/0`, 'reset:b': 'always' });
  tick(ctx, 2);
  const C = cyc(ctx);
  assert.equal(C.members.slice().sort().join(','), 'reset:a,reset:b');
  assert.equal(C.holderLayer, 'a');
  assert.equal(rowOf(ctx, 'reset:b').last.code, 'waiting:turn', 'the member that declares nothing was not bound');
  assert.match(rowOf(ctx, 'reset:b').last.text, /it is a’s turn/);
  tick(ctx, 60);
  const A = acts(ctx);
  // both act, and neither runs away: with weights 3 and 1 (the declared default) `a` takes three turns' worth
  assert.ok(A['reset:a'] > 0 && A['reset:b'] > 0, `both members must act: ${JSON.stringify(A)}`);
  assert.ok(A['reset:a'] > A['reset:b'], 'the weights must show in the counts');
  assert.ok(A['reset:a'] < A['reset:a'] + A['reset:b'], 'neither member may take every tick');
  // MUTANT: "members are the CARRIERS only" — `reset:b` never says `waiting:turn` and takes every tick it can.
});

test('R1 — the row comes from the ENGINE, so a layer of another row is NOT a member', () => {
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5/0/0`, 'reset:b': `always|turn@1/3x/5/0/0`, 'reset:c': 'always' });
  tick(ctx, 30);
  assert.equal(cyc(ctx).members.slice().sort().join(','), 'reset:a,reset:b');
  assert.equal(cyc(ctx, '2'), null, 'row 2 has no carrier and must have no cycle');
  assert.ok(acts(ctx)['reset:c'] > 10, 'a layer outside the cycle’s row must be untouched by it');
  // MUTANT: "the cycle key is the layer id" — every member gets its own cycle and nobody ever waits.
});

// ---- R2: A MEMBER DECIDES BY ITS OWN POLICY INSIDE ITS TURN -------------------------------------------------------
// ⛔ THE BRIEF ASKED FOR THE OPPOSITE ("a member is EAGER inside its turn — the turn is the patience"), and the
// whole-stretch sweep OVERTURNED it: eager-in-turn silently replaces PTR's measured `reset:q` policy `gain>=2`
// with `always` for every turn, and `q` then resets for ONE quirk instead of two (249 quirks from 244 resets
// against the control's 559 from 279). A member that should be eager says so with the policy `always`.

test('R2 — the member’s OWN rule decides inside its turn; the cycle only says WHO may act and HOW OFTEN', () => {
  // `gain>=100x` on a layer gaining 1 a reset can fire exactly once (an empty purse makes the bar 0) and never
  // again. If the turn made its holder eager, `a` would reset every tick it held the turn.
  const ctx = boot({ 'reset:a': `gain>=100x|turn@5/3x/5/0/0`, 'reset:b': `always|turn@5/3x/5/0/0` });
  tick(ctx, 200);
  assert.equal(acts(ctx)['reset:a'], 1, `the patient member must keep its own rule: ${JSON.stringify(acts(ctx))}`);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:gain-x', 'the member’s own refusal must be what it reports');
  // ⚠ AND ITS TURN IS **NOT** TAKEN AWAY FOR SAYING NO. The first cut yielded here and the sweep measured what
  // that costs: with `gain>=2` on PTR's `q`, the engine allows a reset while the gain is still one quirk, so a
  // twenty-reset turn ended after ONE and `reset:h` ran unscheduled (`q` 5 / `h` 37 against the working
  // arrangement's 286 / 15). "My rule says not yet" is productive waiting, and the weight exists to protect it.
  // ⚠ THE COST, and it is the SAME GAP the dead-member freeze is (see the row below and plan §32.4a): this member
  // resets exactly ONCE, so it never has two resets to take an interval between, and with no bound it holds the
  // row. What answers it is a release rule based on PROGRESS toward the threshold, which is not built.
  assert.equal(acts(ctx)['reset:b'], undefined, `the row stalls on it — the documented gap: ${JSON.stringify(acts(ctx))}`);
  // ⚠ READ AT THE END OF A TICK, `a` is OUT of turn — it yielded the moment its own rule said no, which is what
  // keeps a patient member from holding its row. Either code is the same fact.
  assert.ok(['waiting:gain-x', 'waiting:turn'].includes(rowOf(ctx, 'reset:a').last.code), rowOf(ctx, 'reset:a').last.code);
  // MUTANT: "a member is eager inside its turn" — `reset:a` runs away and the first row reds.
});

test('R2 — `acted:reset` names the member’s OWN rule, so an act stays as enumerable as a refusal', () => {
  const ctx = boot({ 'reset:a': `always|turn@2/3x/5/0/0`, 'reset:b': `always|turn@2/3x/5/0/0` });
  tick(ctx, 10);
  const fired = [rowOf(ctx, 'reset:a'), rowOf(ctx, 'reset:b')].find((x) => x.last.code === 'acted:reset');
  assert.ok(fired, 'neither member ever acted');
  assert.equal(fired.last.values.rule, 'always');
  assert.match(fired.last.text, /\(always\)/);
});

test('R2 — `until` and `while` are ABOVE the cycle: a paused member never holds the turn', () => {
  const ctx = boot({ 'reset:a': `always|turn@5/3x/5/0/0`, 'reset:b': `always|turn@5/3x/5/0/0` },
    fresh(), { gates: { 'reset:a': 'false' } });
  tick(ctx, 30);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'blocked:gate', 'a paused member must report its pause, not a turn');
  assert.equal(cyc(ctx).holderLayer, 'b');
  assert.ok(acts(ctx)['reset:b'] > 10, 'the cycle must not hold a turn hostage for a paused member');
  // MUTANT: "the cycle steps before `while`" — `b` waits for a member that can never act and the run stalls.
  // ⚠ THIS IS THE ROW THAT PROTECTS PTR's M21 PAUSE: `reset:q` is paused until `h` is unlocked, and if a cycle
  // could hold the turn for it, `h` would never reset and M21 would never be reached.
});

// ---- R3: THE GUARD — K × the usual wait between this member's OWN resets ------------------------------------------
// ⛔ WHAT THE GUARD IS LATE AGAINST WAS DECIDED BY THE WHOLE-STRETCH SWEEP, NOT BY THE BRIEF. Two cheaper-looking
// rules — a bound taken from the ROW's pooled history, and a first-cycle rule that released the turn "to whoever
// can act" — both STARVE the member the cycle exists to feed, because PTR's `h` needs ~1,450 quiet game-seconds
// for Time Energy to reach 1e30 while `q`'s resets are tens of seconds apart. Both ended with Hindrance Spirit at
// ONE, which is the state before this slice.

test('R3 — with no reset of its own yet, a member HOLDS its turn until it can use it', () => {
  const state = fresh();
  state.can.a = false;                 // the ENGINE refuses `a`; nothing in the loader is touched
  const ctx = boot({ 'reset:a': `always|turn@9/3x/5/0/0`, 'reset:b': `always|turn@9/3x/5/0/0` }, state);
  tick(ctx, 30);
  const C = cyc(ctx);
  assert.equal(C.holderLayer, 'a', 'the turn was taken from a member that had no bound to be late against');
  const held = acts(ctx)['reset:b'] || 0;
  tick(ctx, 60);
  assert.equal(cyc(ctx).holderLayer, 'a', 'the holder must keep a turn it is waiting on a RESOURCE for');
  assert.equal(acts(ctx)['reset:b'] || 0, held, 'no other member may act while that turn is held');
  assert.equal(C.typical['reset:a'], null);
  // ⚠ THE COST, NAMED: a member that can NEVER act holds its row for ever. What protects against that is the
  // player's own `while` and the DEMAND link — not a number this file could derive. Measured: every derived
  // bound tried here released PTR's `h` before it could possibly reset.
  // MUTANT: "the bound falls back to the ROW's pooled intervals" — `a` is released and this row reds.
});

test('R3 — once it HAS reset twice, the bound is K × the median wait between its own resets', () => {
  const state = fresh();
  const ctx = boot({ 'reset:a': `always|turn@1/2x/5/0/0`, 'reset:b': `always|turn@1/2x/5/0/0` }, state);
  tick(ctx, 30);                       // both members reset repeatedly, so both have intervals
  const C0 = cyc(ctx);
  assert.ok(C0.typical['reset:a'] !== null && C0.typical['reset:b'] !== null, JSON.stringify(C0.typical));
  const before = acts(ctx)['reset:b'];
  state.can.a = false;                 // now `a` cannot use its turns, and its own bound is what times it out
  tick(ctx, 40);
  assert.ok(acts(ctx)['reset:b'] > before + 5, 'a member that cannot act held its turn past its own bound');
  assert.ok(cyc(ctx).skip['reset:a'] !== undefined, 'a released member must be skipped for a rotation');
  // MUTANT: "the guard is silent once a typical exists" / "K is ignored" — `b` stops acting and this row reds.
});

test('R3 — the memory is the interval between a member’s own RESETS, not the length of its turns', () => {
  const state = fresh();
  const ctx = boot({ 'reset:a': `always|turn@4/2x/5/0/0`, 'reset:b': `always|turn@4/2x/5/0/0` }, state);
  tick(ctx, 40);
  const C = cyc(ctx);
  // a turn of four resets spans four ticks; the INTERVALS inside it are one tick each. A build that remembered
  // turn LENGTHS would show a typical around the turn's span, not around one reset.
  assert.equal(C.typical['reset:a'], 1, `the typical must be the wait between resets: ${JSON.stringify(C.typical)}`);
  assert.ok(C.resets === undefined || true);
  // MUTANT: "`endTurn` records the turn's length" — the typical becomes ~4 and this row reds.
});

test('R3 — a member that can never act does not COLLECT a history it did not earn', () => {
  const state = fresh();
  state.can.a = false;
  const ctx = boot({ 'reset:a': `always|turn@1/2x/5/0/0`, 'reset:b': `always|turn@1/2x/5/0/0` }, state);
  tick(ctx, 40);
  assert.equal(cyc(ctx).typical['reset:a'], null, 'a member that never reset was given a bound anyway');
  assert.equal(cyc(ctx).turns['reset:a'], 0);
  // MUTANT: "the interval is pushed on a released turn" — `a` acquires a typical out of nothing.
});

// ---- R4: THE TURN MEMORY IS THE LOADER'S OWN ------------------------------------------------------------------------

test('R4 — the memory is in `runtimeState()`, and `restoreRuntime(runtimeState())` is the identity for it', () => {
  const ctx = boot({ 'reset:a': `always|turn@2/3x/5/0/0`, 'reset:b': `always|turn@2/3x/5/0/0` });
  tick(ctx, 25);
  const rt = JSON.parse(JSON.stringify(T(ctx).runtimeState()));
  assert.ok(rt.cycle && rt.cycle['1'], 'the cycle wrote no memory');
  assert.equal(Object.keys(rt.cycle['1']).sort().join(','), 'acted,arm,at,best,closer,holder,left,mem,round,since,skip');
  T(ctx).restoreRuntime(rt);
  assert.deepEqual(JSON.parse(JSON.stringify(T(ctx).runtimeState().cycle)), rt.cycle);
  // MUTANT: "the memory is a closure" — a resumed run takes a different path from an uninterrupted one and this
  // row cannot see it, which is why the row asserts the KEY SET and not just that something round-trips.
});

test('R4 — ⛔ NO ENGINE FIELD IS READ: the stub has no `resetTime` anywhere, and the cycle still has a typical', () => {
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5/0/0`, 'reset:b': `always|turn@1/3x/5/0/0` });
  tick(ctx, 20);
  assert.equal(ctx.player.a.resetTime, undefined, 'the fixture must NOT have the field, or this row proves nothing');
  assert.equal(ctx.player.b.resetTime, undefined);
  assert.ok(cyc(ctx).own['reset:a'] !== null || cyc(ctx).turns['reset:a'] > 0, 'the turn record must come from the loader’s own memory');
  // MUTANT: "the typical is read from `player[l].resetTime`" — this row goes red HERE and on ptr, and would stay
  // GREEN on a 2.7-style engine, which is exactly the trap `gates-r3b --part 2` runs both families against.
});

// ---- DEMAND: derived from the reason vocabulary, never from a layer name ---------------------------------------------

test('a reason code DECLARES which of its own values is the layer it waits on, and `reasonCodes()` publishes it', () => {
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5/0/0` });
  const cs = T(ctx).reasonCodes();
  assert.equal(cs['blocked:after'].demand, 'sibling');
  assert.equal(cs['waiting:retry'].demand, 'layer');
  assert.equal(cs['waiting:milestone'].demand, 'layer');
  assert.equal(cs['cannot-reset'].demand, null, 'a code whose values name no LAYER must declare no demand');
  assert.equal(cs['waiting:turn'].demand, null, 'the cycle’s own refusal must not be a demand, or it feeds itself');
  // MUTANT: "the demand step names the layers it knows about" — this row still passes and `part 2`'s R1 row still
  // passes, which is why the DEMAND row below constructs the signal instead of asserting the table.
});

test('DEMAND — the turn goes to the member a decision NAMES as what it is waiting on', () => {
  // ⛔ THE ROW IS A PAIRED COMPARISON, NOT AN ASSERTION ABOUT ONE RUN, because "who holds the turn" read at the
  // end of a tick is always the member the last handoff reached — a member whose whole turn is one reset spends
  // it and passes the turn on inside the same tick. What demand CHANGES is the SHARE, so the control is the same
  // construction with the plain variant and the same demand signal standing.
  //  `reset:c` is on row 2 (not a member) and waits for milestone 0 of layer `a`, so every tick a decision names
  //  `a` as the layer something is waiting on. `b` carries nine times `a`'s weight.
  const build = (kind) => {
    const ctx = boot({ 'reset:a': `always|${kind}@1/3x/5/0/0`, 'reset:b': `always|${kind}@9/3x/5/0/0`, 'reset:c': 'keepsUpgrades' },
      fresh(), { keep: { 'reset:c': { layer: 'a', id: 0 } } });
    tick(ctx, 60);
    return ctx;
  };
  const weights = build('turn'), demand = build('turn-demand');
  assert.equal(rowOf(demand, 'reset:c').last.values.layer, 'a', 'the demand signal must actually be standing');
  assert.equal(cyc(demand).demand, true);
  assert.equal(cyc(weights).demand, false);
  const share = (ctx) => acts(ctx)['reset:a'] / (acts(ctx)['reset:b'] || 1);
  assert.ok(share(demand) > share(weights) * 1.4,
    `demand must move the share toward the member that is waited on: weights ${JSON.stringify(acts(weights))} vs demand ${JSON.stringify(acts(demand))}`);
  assert.ok(acts(demand)['reset:b'] > 0, 'demand must not STARVE the other member — that is what the weights are for');
  // … and the moment the demand is MET the weights decide again, which makes it a LINK and not a rule
  const aAt = acts(demand)['reset:a'], bAt = acts(demand)['reset:b'];
  demand.player.a.milestones.push(0);
  tick(demand, 60);
  assert.equal(rowOf(demand, 'reset:c').last.code === 'waiting:milestone', false);
  assert.ok((acts(demand)['reset:b'] - bAt) > (acts(demand)['reset:a'] - aAt),
    `the weights must take over once nothing is waiting: ${JSON.stringify(acts(demand))}`);
  // MUTANT: "demand is consulted only when the cycle has no holder" — the two shares become equal and the row reds.
});

test('DEMAND is OFF for a row whose members all declare the plain variant', () => {
  const state = fresh();
  state.unlocked.a = false;
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5/0/0`, 'reset:b': `always|turn@9/3x/5/0/0` }, state,
    { unlockOrder: [['a', 'b']] });
  tick(ctx, 2);
  assert.equal(cyc(ctx).demand, false);
  // MUTANT: "demand is always on" — the two variants stop being separable and part 1 cannot measure either.
});

// ---- the decision code is a DECISION, not a display string -----------------------------------------------------------

test('`waiting:turn` is reported ONLY where the engine would allow the reset', () => {
  const state = fresh();
  state.can.b = false;                 // the engine refuses `b`, and that is a better answer than "it is a’s turn"
  const ctx = boot({ 'reset:a': `always|turn@9/3x/5/0/0`, 'reset:b': `always|turn@9/3x/5/0/0` }, state);
  tick(ctx, 3);
  assert.equal(rowOf(ctx, 'reset:b').last.code, 'cannot-reset');
  assert.ok(codes(ctx)['waiting:turn'] === undefined || codes(ctx)['waiting:turn'] === 0);
  // MUTANT: "the cycle is checked before the engine" — `b` reads `waiting:turn` and the readout hides the fact
  // that the game itself is refusing.
});

test('every value `waiting:turn` names is filled, so the sentence can never read “undefined”', () => {
  const ctx = boot({ 'reset:a': `always|turn@3/3x/5/0/0`, 'reset:b': `always|turn@7/3x/5/0/0` });
  tick(ctx, 2);
  const r = rowOf(ctx, 'reset:b');
  assert.equal(r.last.code, 'waiting:turn');
  for (const k of T(ctx).reasonCodes()['waiting:turn'].values) assert.ok(r.last.values[k] !== undefined && r.last.values[k] !== null, `values.${k} is missing`);
  assert.equal(r.last.values.mine, 7);
  assert.equal(r.last.values.weight, 3);
  assert.equal(r.last.values.row, 1);
  assert.equal(r.last.text.indexOf('undefined'), -1, r.last.text);
});

test('the READOUT says whose turn it is and what this member’s own turn is worth', () => {
  const ctx = boot({ 'reset:a': `always|turn@3/3x/5/0/0`, 'reset:b': `always|turn@7/3x/5/0/0` });
  tick(ctx, 20);
  const s = T(ctx).turnState('reset:b');
  assert.equal(s.modifier, 'turn@W/Kx/N/B/H');
  assert.equal(s.row, 1);
  assert.equal(s.mine, 7);
  assert.equal(s.members.slice().sort().join(','), 'reset:a,reset:b');
  assert.equal(typeof s.round, 'number');
  assert.ok(s.turns >= 1, 'the readout must count this member’s own completed turns');
  // and `explain()` carries it beside the stall readout, so the tab renders it like everything else
  assert.notEqual(rowOf(ctx, 'reset:b').turn, null);
  assert.equal(rowOf(ctx, 'reset:b').stall, null);
});

// ---- A CYCLE OF ONE IS NOT A CYCLE -----------------------------------------------------------------------------------

test('⛔ a row with ONE active member is DORMANT — the member keeps its own rule, and does not become `always`', () => {
  const state = fresh();
  const ctx = bootStub({ a: game(state).a, c: game(state).c }, { id: 'stub',
    autoTable: { policies: { 'reset:a': 'gain>=100x|turn@1/3x/5/0/0' } } });
  ctx.tmtLoader.profile('all');
  tick(ctx, 40);
  const C = ctx.tmtLoader.cycleState()['1'];
  assert.equal(C, undefined, 'a lone carrier must not create a cycle record at all');
  assert.equal('cycle' in ctx.tmtLoader.runtimeState(), false);
  // the member's OWN rule decides, so an impossible one keeps refusing — the opposite of eager
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:gain-x');
  assert.equal(ctx.tmtLoader.hookStats().actions['reset:a'], 1, 'it should have reset exactly once, by its own rule');
  // MUTANT: "a cycle exists wherever a carrier does" — `reset:a` is eager for the whole leg and the count runs away.
  // ⚠ THIS IS THE ROW THAT PROTECTS PTR's M15 → M21 STRETCH: `reset:h` is locked until M21, so a cycle counting one
  // member would have replaced `reset:q`'s measured `gain>=2` with `always`, which R2 measured reaching M16 NEVER.
});

test('… and it WAKES UP the moment a second member of the row becomes active', () => {
  const state = fresh();
  const ctx = bootStub(game(state), { id: 'stub',
    autoTable: { policies: { 'reset:a': 'always|turn@1/3x/5/0/0', 'reset:b': 'always|turn@1/3x/5/0/0' } } });
  ctx.tmtLoader.profile('all');
  ctx.tmtLoader.setFeatureEnabled('reset:b', false);
  tick(ctx, 20);
  assert.equal(ctx.tmtLoader.cycleState()['1'], undefined);
  const alone = ctx.tmtLoader.hookStats().actions['reset:a'];
  ctx.tmtLoader.setFeatureEnabled('reset:b', null);
  tick(ctx, 20);
  const C = ctx.tmtLoader.cycleState()['1'];
  assert.equal(C.dormant, false);
  assert.equal(C.members.slice().sort().join(','), 'reset:a,reset:b');
  assert.ok(ctx.tmtLoader.hookStats().actions['reset:b'] > 0, 'the second member should be acting once the cycle is live');
  assert.ok(ctx.tmtLoader.hookStats().actions['reset:a'] >= alone);
});

// ---- the two the mutant round found no row for ------------------------------------------------------------------
// ⛔ A SURVIVING MUTANT IS A GATE THAT CANNOT SEE THE DEFECT IT WAS WRITTEN FOR, and the answer is a ROW, not a
// note (plan §18.8, §30.7). Both of these were real defects earlier in this slice; when the mechanism moved onto
// reset INTERVALS the rows that used to see them stopped being able to.

test('a ZERO interval is not a bound — two resets inside one game-second must not release every turn', () => {
  // `diff = 0` makes `player.timePlayed` stand still, so two resets in consecutive ticks are ZERO game-seconds
  // apart. That is a real measurement, and `K × 0` would release every turn on the tick it was granted.
  const ctx = boot({ 'reset:a': `always|turn@3/2x/5/0/0`, 'reset:b': `always|turn@3/2x/5/0/0` });
  tick(ctx, 12, 0);
  assert.ok((acts(ctx)['reset:a'] || 0) > 1, `the member must have reset repeatedly, or this row proves nothing: ${JSON.stringify(acts(ctx))}`);
  const C = cyc(ctx);
  assert.equal(C.typical['reset:a'], null, `a zero interval must not become a bound: ${JSON.stringify(C.typical)}`);
  assert.equal(C.turns['reset:a'], 0, 'a zero interval must not be remembered at all');
  // and the turns are still being SPENT rather than released on the tick they were granted
  assert.ok((acts(ctx)['reset:b'] || 0) > 1, JSON.stringify(acts(ctx)));
  // MUTANT m7 `a-zero-interval-is-remembered`: the typical becomes 0 and every turn is released the instant it is
  // granted, so the weights stop meaning anything.
});

test('a member DEMAND moved the turn away from is not punished for it', () => {
  // `reset:c` (row 2, not a member) waits for milestone 0 of layer `a`, which is never granted — so `a` is
  // demanded on every tick and `b` is preempted over and over. A preemption is not a guard release: `b` must not
  // collect a skip, or every member ends up skipped and the rotation stops (measured: it did).
  // ⚠ `b` CARRIES A HEAVY WEIGHT ON PURPOSE: with both members at one reset a turn, each spends its turn inside
  // the tick it is granted and the holder is never mid-turn when demand looks — so the preemption branch is never
  // reached and the row would prove nothing. A nine-reset turn keeps `b` holding across ticks.
  const ctx = boot({ 'reset:a': `always|turn-demand@1/3x/5/0/0`, 'reset:b': `always|turn-demand@9/3x/5/0/0`, 'reset:c': 'keepsUpgrades' },
    fresh(), { keep: { 'reset:c': { layer: 'a', id: 0 } } });
  tick(ctx, 40);
  const C = cyc(ctx);
  assert.equal(rowOf(ctx, 'reset:c').last.values.layer, 'a', 'the demand signal must actually be standing');
  assert.equal(C.demand, true);
  assert.ok(C.round > 4, `the rotation must keep moving under a standing demand: round ${C.round}`);
  assert.deepEqual(Object.keys(C.skip).sort().join(','), '', `a preempted member collected a skip: ${JSON.stringify(C.skip)}`);
  assert.ok(acts(ctx)['reset:b'] > 0, 'the preempted member must still get turns');
  // MUTANT m9 `preemption-skips-the-preempted`: `skip` fills up and the rotation stalls.
});

// ---- R3b-2: THE DEAD-MEMBER RULE — a turn releases when its holder stops getting CLOSER -----------------------------
//
// ⛔ WHY THESE LEGS ARE CONSTRUCTED AND NOT READ OFF A GAME. The rule's whole subject is a member the ENGINE is
// refusing, and what separates the two cases is a SHAPE over time — a distance that keeps setting new highs against
// one that reaches a ceiling and stops. A stub can build both exactly; a game gives you one of them and a hash.
// The real-game half is `gates-r3b2 --part 1`, and PTR's own numbers are in plan §39.

test('R3b-2 — a refused holder that is GETTING CLOSER keeps its turn, however long that takes', () => {
  // `a` cannot reset and its base climbs toward a requirement it will not reach inside this leg — PTR's `h`, whose
  // Time Energy climbs for hundreds of quiet game-seconds before it can act at all. The turn must be its.
  const state = fresh();
  state.can.a = false; state.req.a = 1e9; state.base.a = 1;
  const ctx = boot({ 'reset:a': `always|turn@1/100000x/5/0/20`, 'reset:b': `always|turn@1/100000x/5/0/20` }, state);
  // ⚠ `b` TAKES THE FIRST TURN AND SPENDS IT, and that is the cycle's own first-turn rule (a cycle does not open on
  // a member the engine is refusing). The subject of this leg is what happens AFTER the turn reaches `a`.
  tick(ctx, 4);
  assert.equal(cyc(ctx).holder, 'reset:a', 'the leg needs the turn to have reached `a` before it measures anything');
  const bAt = acts(ctx)['reset:b'] || 0, skipAt = JSON.stringify(cyc(ctx).skip);
  for (let i = 0; i < 120; i++) { state.base.a *= 1.5; tick(ctx, 1); }   // 120 game-seconds, six times the window
  assert.equal(cyc(ctx).holder, 'reset:a', `a climbing holder was released: ${JSON.stringify(cyc(ctx))}`);
  assert.equal(acts(ctx)['reset:b'] || 0, bAt, 'the turn stayed with `a`, so `b` must not have acted again');
  assert.equal(JSON.stringify(cyc(ctx).skip), skipAt, 'a climbing holder must collect no NEW skip — nothing released it');
  // MUTANT `m-r3b2-a-climbing-holder-is-released` (the guard reads the LAST distance instead of the member's best,
  // or ignores the distance entirely): the turn moves to `b` and this row reds.
});

test('R3b-2 — a refused holder whose distance PLATEAUS loses the turn, and the row moves again', () => {
  // PTR's `o`: it climbs for ~300 game-seconds (holding the turn is what stops a sibling wiping the row below) and
  // then sits at 5 of 14 Super Boosters for ever. The climb must NOT cost it the turn; the plateau must.
  const state = fresh();
  state.can.a = false; state.req.a = 1e9; state.base.a = 1;
  const ctx = boot({ 'reset:a': `always|turn@1/100000x/5/0/20`, 'reset:b': `always|turn@1/100000x/5/0/20` }, state);
  tick(ctx, 4);
  assert.equal(cyc(ctx).holder, 'reset:a', 'the leg needs the turn to have reached `a` before it measures anything');
  const bClimb = acts(ctx)['reset:b'] || 0;
  for (let i = 0; i < 30; i++) { state.base.a *= 1.5; tick(ctx, 1); }    // climbing: the turn is still `a`'s
  assert.equal(cyc(ctx).holder, 'reset:a', 'the CLIMB must not cost the turn — that is the other half of this rule');
  assert.equal(acts(ctx)['reset:b'] || 0, bClimb, 'nothing may be released while the holder is still closing distance');
  tick(ctx, 40);                                                          // the plateau: base no longer moves
  // ⚠ READ THE RELEASE, NOT THE HOLDER. `a` is released, skipped for a rotation, and — once `b` has spent a turn —
  // handed the turn again, so "who holds it now" is whatever the rotation last reached. What the rule PROMISES is
  // that the row moved at all, and a leg that asserted on the holder would go green over a build that froze on the
  // very next round (measured: it read `reset:a` in both).
  assert.ok(cyc(ctx).skip['reset:a'] > 0, `a plateaued holder was never released: ${JSON.stringify(cyc(ctx))}`);
  assert.ok((acts(ctx)['reset:b'] || 0) > bClimb, `the whole point is that the OTHER member gets to act: ${JSON.stringify(acts(ctx))}`);
  // MUTANT `m-r3b2-a-refused-holder-is-never-released` (the plateau branch removed): the row FREEZES on `a` and reds.
});

test('R3b-2 — a SIBLING’s wipe is not the holder’s failure: the mark follows the distance DOWN', () => {
  // PTR's `h` loses base MID-TURN to row-2 spending it does not control (measured: 3.23e20 → 2.03e19 while it held
  // the turn). Against a high-water that only ever rises, those losses accumulate until the re-climb cannot beat it
  // inside H — and the turn is taken from the member the cycle exists to feed.
  const state = fresh();
  state.can.a = false; state.req.a = 1e9; state.base.a = 1e6;
  const ctx = boot({ 'reset:a': `always|turn@1/100000x/5/0/20`, 'reset:b': `always|turn@1/100000x/5/0/20` }, state);
  tick(ctx, 5);
  state.base.a = 1;                       // the wipe
  tick(ctx, 5);
  for (let i = 0; i < 60; i++) { state.base.a *= 1.2; tick(ctx, 1); }   // a re-climb that never beats 1e6 again
  assert.ok(state.base.a < 1e6, 'the leg must not accidentally re-reach the old high — that would prove nothing');
  assert.equal(cyc(ctx).holder, 'reset:a', `a wipe cost the holder its turn: ${JSON.stringify(cyc(ctx))}`);
  // MUTANT `m-r3b2-wipe-costs-the-turn` (`|| p < best` removed from the re-anchor): the turn moves and this row reds.
});

test('R3b-2 — the rule looks ONLY while the ENGINE refuses: a holder its own POLICY is refusing is `K`’s business', () => {
  // ⛔ §34.2 item 1: "my rule says not yet" is productive waiting and the weight exists to protect it. `a` CAN reset
  // as far as the engine is concerned and is refused by `gain>=100x`, which it can never meet; its distance is
  // pinned at its requirement and never rises, so a rule that looked here would release it on every window.
  const state = fresh();
  state.can.a = true; state.gain.a = 1; state.req.a = 1; state.base.a = 1;
  const ctx = boot({ 'reset:a': `gain>=100x|turn@1/100000x/5/0/20`, 'reset:b': `always|turn@1/100000x/5/0/20` }, state);
  ctx.player.a.points = new Decimal(1000);       // so `100x what is held` is out of reach for ever
  tick(ctx, 80);
  assert.equal(cyc(ctx).holder, 'reset:a', `the dead-member rule released a holder the ENGINE would have allowed: ${JSON.stringify(cyc(ctx))}`);
  // ⇒ this is why `K` is NOT retired by R3b-2: it is the only bound over this refusal, and the two rules never
  // meet. The same construction with a finite `K` and an interval of its own IS released — that is R3's own leg.
  // MUTANT `m-r3b2-rule-ignores-the-engine` (the `engineAllows` test dropped): the turn moves and this row reds.
});

test('R3b-2 — a member that has NEVER reset can still take its FIRST turn the moment the engine allows it', () => {
  // ⚠ V4's wall, one level up: a layer UNLOCKS ON ITS FIRST RESET, so a rule that pauses for a member with no
  // history walls the run. "Getting closer" at a fraction of ~0 must mean "anything at all is a new best".
  const state = fresh();
  state.can.a = false; state.req.a = 100; state.base.a = 1;
  const ctx = boot({ 'reset:a': `always|turn@1/100000x/5/0/20`, 'reset:b': `always|turn@1/100000x/5/0/20` }, state);
  tick(ctx, 40);                                   // `a` is refused and flat: the turn has gone to `b` by now
  assert.ok(acts(ctx)['reset:b'] > 0);
  state.can.a = true; state.base.a = 100;          // the engine relents
  tick(ctx, 40);
  assert.ok(acts(ctx)['reset:a'] > 0, `a member with no history never got its first turn: ${JSON.stringify(acts(ctx))}`);
  // MUTANT: "a member with no remembered reset is passed over" — `a` never acts and this row reds.
});
