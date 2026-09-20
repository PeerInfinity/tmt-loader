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
      t.baseAmount = new Decimal(player.points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
      t.canReset = state.can[id] !== false;
      t.autoPrestige = false;
      t.resetGain = new Decimal(state.gain[id] === undefined ? 1 : state.gain[id]);
      t.upgrades = {}; t.buyables = {};
    },
  });
  return { a: layer('a', 1), b: layer('b', 1), c: layer('c', 2) };
}
const fresh = () => ({ can: {}, gain: {}, unlocked: {} });
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
  const ctx = boot({ 'reset:a': `always|turn@2/3x/5`, 'reset:b': 'always|stall>=3x/5' });
  // ⚠ `.join` RATHER THAN `deepEqual`: everything the loader builds comes out of the stub's vm realm, so a
  // foreign Array is "same structure, not reference-equal" to a native one and `deepEqual` reds on a right value.
  const ids = T(ctx).modifiers('reset').map((m) => m.id).sort().join(',');
  assert.equal(ids, 'stall>=Kx/N,turn-demand@W/Kx/N,turn@W/Kx/N');
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
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5`, 'reset:b': `always|turn@1/3x/5` });
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
  const ctx = boot({ 'reset:a': `always|turn@3/3x/5`, 'reset:b': 'always' });
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
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5`, 'reset:b': `always|turn@1/3x/5`, 'reset:c': 'always' });
  tick(ctx, 30);
  assert.equal(cyc(ctx).members.slice().sort().join(','), 'reset:a,reset:b');
  assert.equal(cyc(ctx, '2'), null, 'row 2 has no carrier and must have no cycle');
  assert.ok(acts(ctx)['reset:c'] > 10, 'a layer outside the cycle’s row must be untouched by it');
  // MUTANT: "the cycle key is the layer id" — every member gets its own cycle and nobody ever waits.
});

// ---- R2: A MEMBER IS EAGER INSIDE ITS TURN --------------------------------------------------------------------------

test('R2 — the TURN is the patience: a policy that could never fire acts anyway inside its turn', () => {
  // `gain>=100x` on a layer gaining 1 a reset is the planner's deadlock cell in its purest form: after the first
  // reset the bar is 100× what is held and the gain is 1, so the member's own rule never says yes again.
  const ctx = boot({ 'reset:a': `gain>=100x|turn@2/3x/5`, 'reset:b': `gain>=100x|turn@2/3x/5` });
  tick(ctx, 60);
  const C = cyc(ctx);
  assert.ok(C.round >= 4, `the cycle deadlocked at round ${C.round} — a patient policy decided inside a turn`);
  assert.ok(acts(ctx)['reset:a'] >= 4 && acts(ctx)['reset:b'] >= 4, JSON.stringify(acts(ctx)));
  assert.equal(rowOf(ctx, 'reset:a').last.code === 'waiting:gain-x', false, 'the member’s own rule must not decide in its turn');
  // MUTANT: "the member's primary still decides inside its turn" — round stays at 1 or 2 and both counts stay at 1.
});

test('R2 — `acted:reset` NAMES the cycle as the rule that fired it, so an act is as enumerable as a refusal', () => {
  const ctx = boot({ 'reset:a': `gain>=100x|turn@2/3x/5`, 'reset:b': `gain>=100x|turn@2/3x/5` });
  tick(ctx, 10);
  const r = rowOf(ctx, 'reset:a');
  const fired = [r, rowOf(ctx, 'reset:b')].find((x) => x.last.code === 'acted:reset');
  assert.ok(fired, 'neither member ever acted');
  assert.equal(fired.last.values.rule, 'in-turn');
  assert.match(fired.last.text, /\(in-turn\)/);
});

test('R2 — `until` and `while` are ABOVE the cycle: a paused member never holds the turn', () => {
  const ctx = boot({ 'reset:a': `always|turn@5/3x/5`, 'reset:b': `always|turn@5/3x/5` },
    fresh(), { gates: { 'reset:a': 'false' } });
  tick(ctx, 30);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'blocked:gate', 'a paused member must report its pause, not a turn');
  assert.equal(cyc(ctx).holderLayer, 'b');
  assert.ok(acts(ctx)['reset:b'] > 10, 'the cycle must not hold a turn hostage for a paused member');
  // MUTANT: "the cycle steps before `while`" — `b` waits for a member that can never act and the run stalls.
  // ⚠ THIS IS THE ROW THAT PROTECTS PTR's M21 PAUSE: `reset:q` is paused until `h` is unlocked, and if a cycle
  // could hold the turn for it, `h` would never reset and M21 would never be reached.
});

// ---- R3: THE GUARD — a member that cannot act RELEASES the turn ------------------------------------------------------

test('R3 — with no history yet, the turn is released the moment the holder cannot act and another member can', () => {
  const state = fresh();
  state.can.a = false;                 // the ENGINE refuses `a`; nothing in the loader is touched
  const ctx = boot({ 'reset:a': `always|turn@9/3x/5`, 'reset:b': `always|turn@9/3x/5` }, state);
  tick(ctx, 30);
  assert.ok(acts(ctx)['reset:b'] > 5, `the first turn was never released: ${JSON.stringify(acts(ctx))}`);
  assert.equal(acts(ctx)['reset:a'], undefined);
  // MUTANT: "the guard is silent without a typical" — `b` never acts at all, which is first-cycle blindness
  // (R2 §24.11 item 4) repeated silently.
});

test('R3 — once there IS a history the bound is K × the median of that member’s own COMPLETED turns', () => {
  const state = fresh();
  const ctx = boot({ 'reset:a': `always|turn@1/2x/5`, 'reset:b': `always|turn@1/2x/5` }, state);
  tick(ctx, 20);                       // both members complete turns; each turn is one tick long
  const C0 = cyc(ctx);
  assert.ok(C0.typical['reset:a'] !== null && C0.typical['reset:b'] !== null, JSON.stringify(C0.typical));
  const before = acts(ctx)['reset:b'];
  state.can.a = false;                 // now `a` cannot use its turns; the bound is K × its own typical
  tick(ctx, 30);
  assert.ok(acts(ctx)['reset:b'] > before + 5, 'a member that cannot act held its turn past the bound');
  // MUTANT: "the typical is the median over ALL turns ever, released ones included" — the bound grows with every
  // timeout and the guard stops guarding, which is `stall>=Kx/N`'s own reason for the same rule.
});

test('R3 — a RELEASED turn never feeds the typical', () => {
  const state = fresh();
  state.can.a = false;
  const ctx = boot({ 'reset:a': `always|turn@1/2x/5`, 'reset:b': `always|turn@1/2x/5` }, state);
  tick(ctx, 40);
  const C = cyc(ctx);
  assert.equal(C.turns['reset:a'], 0, 'a turn `a` never used was remembered as one of its own turns');
  assert.equal(C.own['reset:a'], null);
  assert.ok(C.turns['reset:b'] > 0, 'the member that DID use its turns must have a record, or this row proves nothing');
  // MUTANT: "`endTurn` records the length whether it was released or not" — `turns['reset:a']` becomes a count
  // and `own['reset:a']` a number, and the bound then grows with every timeout — `stall>=Kx/N`'s own reason.
});

test('R3 — a member that can NEVER act does not stop the cycle, however loudly it is demanded', () => {
  // A PERMANENT DEMAND, constructed: `reset:c` is on row 2 (not a member) and waits for milestone 0 of layer `a`,
  // which is never granted — so every tick, for ever, a decision names `a` as the layer it is waiting on. `a`
  // itself can never reset (the ENGINE refuses it). This is Part 2's "demand can be circular or permanent".
  const state = fresh();
  state.can.a = false;
  const ctx = boot({ 'reset:a': `always|turn-demand@1/2x/5`, 'reset:b': `always|turn-demand@1/2x/5`, 'reset:c': 'keepsUpgrades' },
    state, { keep: { 'reset:c': { layer: 'a', id: 0 } } });
  tick(ctx, 60);
  assert.equal(rowOf(ctx, 'reset:c').last.code, 'waiting:milestone', 'the demand signal must actually be standing');
  assert.equal(rowOf(ctx, 'reset:c').last.values.layer, 'a');
  const C = cyc(ctx);
  assert.equal(C.demand, true);
  assert.ok(C.round >= 4, `the cycle stuck at round ${C.round} under a demand that can never be met`);
  assert.ok(acts(ctx)['reset:b'] > 5, `the other member was starved by an unmeetable demand: ${JSON.stringify(acts(ctx))}`);
  assert.equal(acts(ctx)['reset:a'], undefined);
  // MUTANT: "a released member is eligible for a demand grant at once" — the demand re-grants on the very next
  // tick for ever, `b` acts at most once, and the row goes red on the count.
});

// ---- R4: THE TURN MEMORY IS THE LOADER'S OWN ------------------------------------------------------------------------

test('R4 — the memory is in `runtimeState()`, and `restoreRuntime(runtimeState())` is the identity for it', () => {
  const ctx = boot({ 'reset:a': `always|turn@2/3x/5`, 'reset:b': `always|turn@2/3x/5` });
  tick(ctx, 25);
  const rt = JSON.parse(JSON.stringify(T(ctx).runtimeState()));
  assert.ok(rt.cycle && rt.cycle['1'], 'the cycle wrote no memory');
  assert.equal(Object.keys(rt.cycle['1']).sort().join(','), 'at,holder,left,mem,round,since,skip');
  T(ctx).restoreRuntime(rt);
  assert.deepEqual(JSON.parse(JSON.stringify(T(ctx).runtimeState().cycle)), rt.cycle);
  // MUTANT: "the memory is a closure" — a resumed run takes a different path from an uninterrupted one and this
  // row cannot see it, which is why the row asserts the KEY SET and not just that something round-trips.
});

test('R4 — ⛔ NO ENGINE FIELD IS READ: the stub has no `resetTime` anywhere, and the cycle still has a typical', () => {
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5`, 'reset:b': `always|turn@1/3x/5` });
  tick(ctx, 20);
  assert.equal(ctx.player.a.resetTime, undefined, 'the fixture must NOT have the field, or this row proves nothing');
  assert.equal(ctx.player.b.resetTime, undefined);
  assert.ok(cyc(ctx).own['reset:a'] !== null || cyc(ctx).turns['reset:a'] > 0, 'the turn record must come from the loader’s own memory');
  // MUTANT: "the typical is read from `player[l].resetTime`" — this row goes red HERE and on ptr, and would stay
  // GREEN on a 2.7-style engine, which is exactly the trap `gates-r3b --part 2` runs both families against.
});

// ---- DEMAND: derived from the reason vocabulary, never from a layer name ---------------------------------------------

test('a reason code DECLARES which of its own values is the layer it waits on, and `reasonCodes()` publishes it', () => {
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5` });
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
    const ctx = boot({ 'reset:a': `always|${kind}@1/3x/5`, 'reset:b': `always|${kind}@9/3x/5`, 'reset:c': 'keepsUpgrades' },
      fresh(), { keep: { 'reset:c': { layer: 'a', id: 0 } } });
    tick(ctx, 60);
    return ctx;
  };
  const weights = build('turn'), demand = build('turn-demand');
  assert.equal(rowOf(demand, 'reset:c').last.values.layer, 'a', 'the demand signal must actually be standing');
  assert.equal(cyc(demand).demand, true);
  assert.equal(cyc(weights).demand, false);
  const share = (ctx) => acts(ctx)['reset:a'] / (acts(ctx)['reset:b'] || 1);
  assert.ok(share(demand) > share(weights) * 2,
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
  const ctx = boot({ 'reset:a': `always|turn@1/3x/5`, 'reset:b': `always|turn@9/3x/5` }, state,
    { unlockOrder: [['a', 'b']] });
  tick(ctx, 2);
  assert.equal(cyc(ctx).demand, false);
  // MUTANT: "demand is always on" — the two variants stop being separable and part 1 cannot measure either.
});

// ---- the decision code is a DECISION, not a display string -----------------------------------------------------------

test('`waiting:turn` is reported ONLY where the engine would allow the reset', () => {
  const state = fresh();
  state.can.b = false;                 // the engine refuses `b`, and that is a better answer than "it is a’s turn"
  const ctx = boot({ 'reset:a': `always|turn@9/3x/5`, 'reset:b': `always|turn@9/3x/5` }, state);
  tick(ctx, 3);
  assert.equal(rowOf(ctx, 'reset:b').last.code, 'cannot-reset');
  assert.ok(codes(ctx)['waiting:turn'] === undefined || codes(ctx)['waiting:turn'] === 0);
  // MUTANT: "the cycle is checked before the engine" — `b` reads `waiting:turn` and the readout hides the fact
  // that the game itself is refusing.
});

test('every value `waiting:turn` names is filled, so the sentence can never read “undefined”', () => {
  const ctx = boot({ 'reset:a': `always|turn@3/3x/5`, 'reset:b': `always|turn@7/3x/5` });
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
  const ctx = boot({ 'reset:a': `always|turn@3/3x/5`, 'reset:b': `always|turn@7/3x/5` });
  tick(ctx, 20);
  const s = T(ctx).turnState('reset:b');
  assert.equal(s.modifier, 'turn@W/Kx/N');
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
    autoTable: { policies: { 'reset:a': 'gain>=100x|turn@1/3x/5' } } });
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
    autoTable: { policies: { 'reset:a': 'gain>=100x|turn@1/3x/5', 'reset:b': 'gain>=100x|turn@1/3x/5' } } });
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
  assert.ok(ctx.tmtLoader.hookStats().actions['reset:a'] > alone, 'the member should be eager once the cycle is live');
  assert.ok(ctx.tmtLoader.hookStats().actions['reset:b'] > 0);
});
