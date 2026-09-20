// V3 — the PROGRESS TRACKER and the STALL WATCH, driven over the stub engine (`loader/stub-engine.mjs`).
//
// ⛔ WHAT THIS FILE IS FOR. The watch's machine has states no recorded fixture in this repo reaches: two features
// stalled in the same tick (the arbiter), a rescue followed by renewed progress (the cool-off), and a gap that ended
// while a feature was escalated (the guard that keeps a rescue's duration out of `typicalGap`). Every one of those is
// CONSTRUCTED here, which is the same reason `loader/reasons.test.mjs` and `loader/strategies.test.mjs` exist.
//
// ⚠ The stub is not a second engine. What is exercised is the LOADER's own code — the tracker's seen-set rule, the
// escalation machine, the arbiter and the precedence getter — which is the same code the two real engines run.
// Anything that needs an engine's own behaviour (`canReset`'s static/normal split, `Vue.set`, a real `<select>`)
// belongs in the page gates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

/** A prestige layer whose reset gain and reset permission are the caller's to script. */
function layer(name, row, type, opts = {}) {
  return {
    name, row, type, layerShown: () => true,
    startData: () => ({ unlocked: true, points: new Decimal(opts.points === undefined ? 10 : opts.points) }),
    upgrades: { 11: { cost: new Decimal(1e9) } },
    milestones: { 0: {}, 1: {} },
    tmtStubTemp(tmp, player) {
      const t = tmp[name] || (tmp[name] = {});
      t.type = type;
      t.baseAmount = new Decimal(player[name].points);
      t.requires = new Decimal(1);
      t.nextAt = new Decimal(1);
      t.canReset = opts.canReset === undefined ? true : opts.canReset;
      t.autoPrestige = false;
      t.resetGain = new Decimal(typeof opts.gain === 'function' ? opts.gain(player) : (opts.gain === undefined ? 1 : opts.gain));
      t.upgrades = { 11: { cost: new Decimal(1e9), unlocked: true } };
    },
  };
}
const boot = (layers, options) => {
  const ctx = bootStub(layers, { options: { kinds: 'reset', ...options } });
  ctx.tmtLoader.profile('all');
  return ctx;
};
/** Progress, the way a game makes it: a new upgrade id appears in the hold array. */
const grant = (ctx, l, id) => { ctx.player[l].upgrades.push(id); };
const arm = (T, over = {}) => {
  for (const [k, v] of Object.entries({ track: true, ...over })) {
    const r = T.setWatchOption(k, v);
    assert.equal(r.ok, true, `setWatchOption(${k}) refused: ${r.error}`);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Leg 1 — THE TRACKER IS INERT WHEN IT IS OFF, and that is what keeps every committed snapshot valid
// ---------------------------------------------------------------------------------------------------------------
test('with the tracker off, runtimeState() carries no V3 block at all and T.progress() is unarmed', () => {
  const ctx = boot({ a: layer('a', 1, 'normal') }), T = ctx.tmtLoader;
  tick(ctx, 50);
  grant(ctx, 'a', 11);
  tick(ctx, 50);
  const rt = T.runtimeState();
  assert.equal(rt.progress, undefined, 'a run with the tracker off wrote a `progress` block');
  assert.equal(rt.watch, undefined, 'a run with the tracker off wrote a `watch` block');
  assert.deepEqual(Object.keys(rt).sort(), ['lastReset', 'loopNo', 'ranAt', 'stats'], 'the record grew a key');
  assert.equal(T.progress().armed, false);
  assert.equal(T.progressStats().fullScans, 0, 'the tracker scanned while switched off');
  assert.equal(T.watchState().on, false);
  assert.equal(T.watchState().code, 'watch:off');
});

test('the tracker ON does not change ANY decision: the same actions, the same state, from the same start', () => {
  const run = (track) => {
    const ctx = boot({ a: layer('a', 1, 'normal', { gain: 5 }) }), T = ctx.tmtLoader;
    if (track) arm(T);
    for (let i = 0; i < 60; i++) { if (i === 20) grant(ctx, 'a', 11); tick(ctx, 1); }
    return { actions: JSON.stringify(T.hookStats().actions), resets: ctx.resets.length, points: String(ctx.player.a.points), state: T.stateJSON(T.gameState) };
  };
  const off = run(false), on = run(true);
  assert.equal(on.actions, off.actions, 'the tracker moved the action counts');
  assert.equal(on.resets, off.resets, 'the tracker moved the reset count');
  assert.equal(on.state, off.state, 'the tracker moved the game state');
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 2 — THE SEEN-SET RULE, and the counter that says the per-tick work is incremental
// ---------------------------------------------------------------------------------------------------------------
test('every kind of progress is recorded once, and re-buying what a reset took away is NOT progress', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { canReset: false }) }), T = ctx.tmtLoader;
  arm(T);
  tick(ctx, 5);
  assert.equal(T.progress().total, 0, 'the arming scan counted what was already held as progress');
  grant(ctx, 'a', 11);
  ctx.player.a.milestones.push(0);
  ctx.player.a.challenges[1] = 1;
  ctx.player.a.buyables[1] = new Decimal(3);
  tick(ctx, 1);
  const p = T.progress();
  assert.equal(p.total, 4, `four new things, got ${p.total}: ${JSON.stringify(p.byKind)}`);
  // ⚠ JSON, not deepEqual: the stub runs `tmt-auto.js` inside a `vm` context, so every object the loader returns
  // carries THAT realm's prototype and `node:assert/strict` refuses it as "same structure, not reference-equal".
  assert.equal(JSON.stringify(p.byKind), JSON.stringify({ upg: 1, ms: 1, ch: 1, buy: 1 }));
  // the reset wipes the arrays, the game re-buys, and the seen-set says that is not progress
  ctx.player.a.upgrades.length = 0;
  ctx.player.a.milestones.length = 0;
  tick(ctx, 1);
  grant(ctx, 'a', 11);
  ctx.player.a.milestones.push(0);
  tick(ctx, 1);
  assert.equal(T.progress().total, 4, 'a reset-and-rebuy loop read as progress — the detector is a signature, not a seen-set');
  // …but a buyable ABOVE its own run maximum is progress again, and below it is not
  ctx.player.a.buyables[1] = new Decimal(2);
  tick(ctx, 1);
  assert.equal(T.progress().total, 4);
  ctx.player.a.buyables[1] = new Decimal(4);
  tick(ctx, 1);
  assert.equal(T.progress().total, 5, 'a buyable above its run maximum is progress');
});

test('the per-tick work is incremental: ONE full scan for a run of any length, and tails bounded by the events', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { canReset: false }), b: layer('b', 2, 'normal', { canReset: false }) }), T = ctx.tmtLoader;
  arm(T);
  for (let i = 0; i < 400; i++) { if (i === 100) grant(ctx, 'a', 11); tick(ctx, 1); }
  const st = T.progressStats();
  assert.equal(st.fullScans, 1, `${st.fullScans} full scans over 400 ticks — the per-tick pass is walking the whole save`);
  assert.ok(st.polls >= 400, `${st.polls} polls over 400 ticks`);
  // the arming scan walks each layer's declared hold arrays; after that only a list that GREW is walked
  assert.ok(st.tails <= 12, `${st.tails} tail walks over 400 ticks with one event — the growth check is not gating them`);
});

test('the event list is BOUNDED and the counts stay exact', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { canReset: false }) }, { progressEvents: 5 }), T = ctx.tmtLoader;
  arm(T);
  tick(ctx, 1);
  for (let i = 0; i < 12; i++) { grant(ctx, 'a', 100 + i); tick(ctx, 1); }
  const p = T.progress();
  assert.equal(p.cap, 5);
  assert.equal(p.events.length, 5, 'the bound did not hold');
  assert.equal(p.total, 12, 'the bound moved the TOTAL — a count a bound can change is not a count');
  assert.equal(p.dropped, 7, `dropped ${p.dropped}`);
  assert.equal(JSON.stringify(p.byKind), '{"upg":12}', 'the per-kind census is over the whole run, not over the kept window');
  // newest first
  assert.equal(p.events[0].id, '111');
  assert.equal(p.events[4].id, '107');
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 3 — THE DYNAMIC THRESHOLD, and the guard that keeps a rescue out of it
// ---------------------------------------------------------------------------------------------------------------
test('typicalGap is the median of the last n gaps, and the FIRST gap after arming never counts', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { canReset: false }) }), T = ctx.tmtLoader;
  arm(T, { n: '5' });
  tick(ctx, 40);                       // 40 game-seconds before the first event: the first gap
  grant(ctx, 'a', 11); tick(ctx, 1);
  assert.equal(T.progress().typicalGap, null, 'the first gap after arming fed the median');
  tick(ctx, 7); grant(ctx, 'a', 12); tick(ctx, 1);     // a gap of 8
  assert.equal(T.progress().typicalGap, 8);
  tick(ctx, 11); grant(ctx, 'a', 13); tick(ctx, 1);    // a gap of 12
  assert.equal(T.progress().typicalGap, 10, 'the median of 8 and 12');
  // ⛔ AN UNUSABLE GAP IS NOT IN THE WINDOW AT ALL — it is counted, and its duration is kept in a second list. The
  // first cut stored it and filtered it, and that SILENCED the watch: a dirty gap evicted clean evidence, so after
  // one rescue the window held nothing usable and `typicalGap` read null for ever (measured on the page, §21.5).
  const p = T.progress();
  assert.equal(JSON.stringify(p.gaps), '[8,12]', 'the usable window is not the two clean gaps');
  assert.equal(p.skipped, 1, 'the first gap after arming was not counted as skipped');
  assert.equal(JSON.stringify(p.skippedGaps), '[41]', 'the skipped gap\'s own duration is not kept');
});

test('⛔ a gap that ended while a feature was ESCALATED does not feed typicalGap, and the two medians DIFFER', () => {
  // ⚠ THE CONSTRUCTION IS THE POINT. The clean gaps are 8 and 12 (median 10) and the rescue gaps are 100 and 120
  // (so the median of ALL four is 56). A leg whose numbers made the two medians equal would be green with the guard
  // removed — which is exactly the shape §18.8's three vacuous mutants had.
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '5', cool: '1' });
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);       // the first gap (unusable)
  tick(ctx, 7); grant(ctx, 'a', 12); tick(ctx, 1);       // 8, clean
  tick(ctx, 11); grant(ctx, 'a', 13); tick(ctx, 1);      // 12, clean
  assert.equal(T.progress().typicalGap, 10);
  assert.equal(T.escalationState('reset:a').rung, 0, 'escalated before anything stalled');
  // now stall: threshold is k × 10 = 20 game-seconds
  tick(ctx, 30);
  assert.equal(T.progress().stalled, true, 'the tracker did not call this a stall');
  assert.ok(T.escalationState('reset:a').rung > 0, 'the watch did not escalate a waiting feature on a stall');
  tick(ctx, 69); grant(ctx, 'a', 14); tick(ctx, 1);      // a rescue gap of 100
  tick(ctx, 30);                                         // stall again, escalate again
  tick(ctx, 89); grant(ctx, 'a', 15); tick(ctx, 1);      // a rescue gap of 120
  const p = T.progress();
  const clean = p.gaps, all = clean.concat(p.skippedGaps);
  assert.equal(JSON.stringify(clean), '[8,12]', `the usable gaps are ${JSON.stringify(clean)}, the skipped ones ${JSON.stringify(p.skippedGaps)}`);
  assert.equal(p.typicalGap, 10, 'the rescue gaps fed the median');
  assert.ok(p.skipped >= 2, `only ${p.skipped} gap(s) were skipped — the construction did not produce two rescues`);
  // ⛔ …AND THE WATCH IS STILL LISTENING. The first cut's window held only the rescue gaps by now and `typicalGap`
  // read null, which is the watch going permanently deaf on the game it had just rescued.
  assert.notEqual(p.typicalGap, null, 'the guard silenced the watch');
  // …and the number the mutant would produce, asserted so the leg cannot be vacuous
  const med = (xs) => { const a = xs.slice().sort((x, y) => x - y); const h = a.length >> 1; return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; };
  assert.notEqual(med(all), 10, `the guard is not discriminating: the median of every gap is also ${med(all)}`);
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 4 — THE MACHINE: stall → escalate → progress → cool-off → primary
// ---------------------------------------------------------------------------------------------------------------
test('the whole machine, constructed: only a WAITING feature escalates, and it comes back after the cool-off', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '1' });
  // two clean gaps of 10 give typicalGap 10 and a threshold of 20
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  assert.equal(T.progress().typicalGap, 10);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:gain-x', 'the feature is not in a waiting state');
  const base = rowOf(ctx, 'reset:a').policy.inForce;
  // ⛔ RUNG 1 MUST STILL BE A RULE THAT WAITS, or rung 2 is unreachable — and finding that out is what this leg is
  // for. A feature the watch escalated onto `always` ACTS, so its last code is `acted:reset`, so it is no longer a
  // candidate and it never climbs again. That is the machine being right (a rescue that worked is not a stall), and
  // it is why the list here is typed rather than derived: the derived list's first rung IS `always`.
  assert.equal(T.setEscalation('reset:a', ['interval>=100000', 'always']).ok, true);
  const list = T.escalationList('reset:a').list;
  assert.ok(list.length > 1, `the list is ${JSON.stringify(list)}`);

  tick(ctx, 25);
  const e1 = T.escalationState('reset:a');
  assert.equal(e1.rung, 1, 'the first stall event did not escalate exactly one rung');
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, list[0], 'the rung is not the policy in force');
  assert.equal(rowOf(ctx, 'reset:a').policy.escalated, list[0]);
  assert.equal(T.watchState().code, 'watch:stalled');
  assert.equal(T.watchState().escalated.length, 1);

  // ONE escalation per stall event: the stall has to outlive its own threshold AGAIN for the next rung
  tick(ctx, 10);
  assert.equal(T.escalationState('reset:a').rung, 1, 'the watch escalated twice inside one stall event');
  tick(ctx, 15);
  assert.equal(T.escalationState('reset:a').rung, 2, 'a stall that outlived its threshold twice did not reach rung 2');

  // progress resumes → cooling → back to the primary after cool × typicalGap
  grant(ctx, 'a', 14); tick(ctx, 1);
  assert.equal(T.progress().stalled, false);
  assert.equal(T.watchState().code, 'watch:cooling', T.watchState().text);
  assert.equal(T.escalationState('reset:a').rung, 2, 'the cool-off returned the feature immediately');
  tick(ctx, 4);
  assert.equal(T.escalationState('reset:a').rung, 2, 'the cool-off is shorter than one typical gap');
  tick(ctx, 8);
  assert.equal(T.escalationState('reset:a').rung, 0, 'the feature never came back to its primary');
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, base, 'back on a rung, not on the primary');
  assert.equal(T.watchState().escalated.length, 0);
});

test('the ARBITER is V2s, not a second one: of two waiting features the one closest to its target escalates', () => {
  // `a` is at gain 1 of 2×10 = 0.05 of its target; `b` is at gain 8 of 2×10 = 0.4 — `b` goes first.
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }), b: layer('b', 2, 'normal', { gain: 8, points: 10 }) }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '5' });
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:gain-x');
  assert.equal(rowOf(ctx, 'reset:b').last.code, 'waiting:gain-x');
  tick(ctx, 25);
  assert.equal(T.escalationState('reset:b').rung, 1, 'the feature closest to its target did not go first');
  assert.equal(T.escalationState('reset:a').rung, 0, 'BOTH features escalated on one stall event');
  assert.equal(JSON.stringify(T.watchState().escalated.map((e) => e.id)), '["reset:b"]');
});

test('a feature that is not WAITING is left alone, whatever the game is doing', () => {
  // `always` acts every tick, so its last code is `acted:reset` and it is nobody's fault the game stalled.
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }, { 'policy:reset:a': 'always' }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '1' });
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'acted:reset');
  tick(ctx, 40);
  assert.equal(T.progress().stalled, true, 'the construction did not stall');
  assert.equal(T.escalationState('reset:a').rung, 0, 'an ACTING feature was escalated');
  assert.equal(T.watchState().escalated.length, 0);
});

test('⛔ a feature that acted RECENTLY is not a candidate, however stalled the GAME is', () => {
  // ⛔ THE LEG THAT EXISTS BECAUSE THE FIRST CUT WRECKED PTR'S OPENING (V3 §21). `interval>=5` resets every 5 game-s,
  // so the feature is genuinely `waiting:interval` most ticks — and it is not the cause of a game-level stall.
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }, { 'policy:reset:a': 'interval>=5' }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '1' });
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  assert.equal(T.progress().typicalGap, 10, 'the construction did not reach a threshold of 20');
  // ⚠ 61, not 60: `interval>=5` acts on every fifth tick, and tick 60 IS one — the leg needs the feature's LAST
  // decision to be the refusal, which is the state the watch reads.
  tick(ctx, 61);
  assert.equal(T.progress().stalled, true, 'the game is not stalled, so this leg measures nothing');
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:interval', 'the feature is not in a waiting state');
  assert.ok(ctx.resets.length > 5, `the feature is not acting: ${ctx.resets.length} resets`);
  assert.equal(T.escalationState('reset:a').rung, 0, 'a feature that acts every 5 game-seconds was escalated');
  assert.equal(T.escalationState('reset:a').candidate, false);
  assert.ok(T.escalationState('reset:a').waitingFor < 20, `waitingFor ${T.escalationState('reset:a').waitingFor}`);
  // …and the SAME feature, once it really has stopped, IS a candidate
  T.setSavedPolicy('reset:a', 'interval>=100000');
  tick(ctx, 15);
  assert.ok(T.escalationState('reset:a').waitingFor < 20, `waitingFor ${T.escalationState('reset:a').waitingFor}`);
  assert.equal(T.escalationState('reset:a').rung, 0, 'escalated before it had been waiting as long as the game stall');
  tick(ctx, 15);
  assert.ok(T.escalationState('reset:a').rung > 0, 'a feature that has genuinely stopped was never escalated');
});

test('a HAND EDIT while escalated returns that feature to its primary', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '1' });
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  tick(ctx, 25);
  assert.equal(T.escalationState('reset:a').rung, 1);
  const r = T.setSavedPolicy('reset:a', 'interval>=99');
  assert.equal(r.ok, true, r.error);
  assert.equal(T.escalationState('reset:a').rung, 0, 'a hand edit left the feature on a rung');
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, 'interval>=99');
  // …and so does editing the LIST
  tick(ctx, 60);
  assert.ok(T.escalationState('reset:a').rung > 0, 'it did not escalate again');
  assert.equal(T.setEscalation('reset:a', ['always']).ok, true);
  assert.equal(T.escalationState('reset:a').rung, 0, 'editing the list left the feature on a rung');
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 5 — PRECEDENCE, the list, and the relationship to `stall>=Kx/N`
// ---------------------------------------------------------------------------------------------------------------
test('precedence: saved < the watch rung < a runtime override, in one getter', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '1' });
  assert.equal(T.setSavedPolicy('reset:a', 'gain>=3x').ok, true);
  assert.equal(T.setEscalation('reset:a', ['always']).ok, true);
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, 'gain>=3x', 'the saved choice is not in force');
  tick(ctx, 25);
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, 'always', 'the rung does not outrank the save');
  assert.equal(rowOf(ctx, 'reset:a').policy.saved, 'gain>=3x', 'the save was overwritten rather than outranked');
  T.setPolicy('reset:a', 'interval>=7');
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, 'interval>=7', 'a runtime override does not outrank the rung');
  T.setPolicy('reset:a', null);
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, 'always', 'clearing the override did not give the feature back to the rung');
});

test('the derived list is the table alternatives where it names them, else the applicable rows, and never an `off` row', () => {
  const ctx = boot({ a: layer('a', 1, 'normal'), c: { name: 'c', row: 3, type: 'none', layerShown: () => true, startData: () => ({ unlocked: true, points: new Decimal(0) }), clickables: { 11: {} } } },
    { kinds: 'reset,clickables' });
  const T = ctx.tmtLoader;
  arm(T, { watch: true });
  const resets = T.escalationList('reset:a');
  assert.equal(resets.typed, false);
  assert.ok(!resets.list.includes('gain>=2x'), 'the strategy already in force is an escalation rung of itself');
  assert.ok(resets.list.includes('always') && resets.list.includes('rate-peak@0.1/30'), JSON.stringify(resets.list));
  // ⛔ `off` declares `escalate: false`, so it is never a rung — answering a stall by stopping is not an answer
  const clicks = T.escalationList('clickables:c');
  assert.equal(JSON.stringify(clicks.list), '[]', `a do-nothing strategy reached the derived list: ${JSON.stringify(clicks.list)}`);
  assert.equal(T.strategies('clickables').find((S) => S.id === 'off').escalate, false);
  assert.equal(T.strategies('reset').find((S) => S.id === 'always').escalate, true);
  // a TYPED list wins over the derived one, and a string this build cannot validate is refused
  assert.equal(T.setEscalation('reset:a', ['interval>=5', 'always']).ok, true);
  assert.equal(JSON.stringify(T.escalationList('reset:a').list), '["interval>=5","always"]');
  assert.equal(T.escalationList('reset:a').typed, true);
  const bad = T.setEscalation('reset:a', ['banana']);
  assert.equal(bad.ok, false);
  assert.equal(JSON.stringify(T.escalationList('reset:a').list), '["interval>=5","always"]', 'a refused list changed something');
  assert.equal(T.setEscalation('reset:a', null).ok, true);
  assert.equal(T.escalationList('reset:a').typed, false, 'clearing the list did not go back to the derived one');
});

test('the rung is a COMPLETE policy string, so while escalated the feature runs the rung’s modifier, not the save’s', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }), T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '9' });
  assert.equal(T.setSavedPolicy('reset:a', 'gain>=2x|stall>=3x/5').ok, true);
  assert.equal(T.setEscalation('reset:a', ['interval>=1000']).ok, true);
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
  assert.ok(T.stallState('reset:a'), 'the saved modifier is not in force before the stall');
  tick(ctx, 25);
  assert.equal(T.escalationState('reset:a').rung, 1);
  assert.equal(rowOf(ctx, 'reset:a').policy.inForce, 'interval>=1000');
  assert.equal(T.stallState('reset:a'), null, 'the rung carried no modifier and `stall>=Kx/N` was still in force');
  // …and a rung that DOES carry one puts it back
  assert.equal(T.setEscalation('reset:a', ['interval>=1000|stall>=2x/3']).ok, true);
  tick(ctx, 60);
  assert.ok(T.escalationState('reset:a').rung > 0);
  assert.ok(T.stallState('reset:a'), 'a rung that declares a modifier did not put one in force');
  // `stallState().modifier` is the table row's ID, not the instance string — V2's shape, unchanged
  assert.equal(T.stallState('reset:a').modifier, 'stall>=Kx/N');
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 6 — the memory survives a restore, in ONE process (the exact-equality form §18.4 item 2 allows)
// ---------------------------------------------------------------------------------------------------------------
test('a run cut mid-stall and restored from runtimeState() takes the same path as the uninterrupted one', () => {
  const drive = (cut) => {
    const ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }), T = ctx.tmtLoader;
    arm(T, { watch: true, k: '2', n: '3', cool: '1' });
    tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
    tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
    tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1);
    tick(ctx, 25);                                     // escalated
    if (cut) { const rt = JSON.parse(JSON.stringify(T.runtimeState())); T.restoreRuntime(rt); }
    tick(ctx, 20);
    return { rung: T.escalationState('reset:a').rung, typical: T.progress().typicalGap, total: T.progress().total,
      gaps: JSON.stringify(T.progress().gaps), actions: JSON.stringify(T.hookStats().actions), state: T.stateJSON(T.gameState),
      watch: JSON.stringify(T.watchState().escalated) };
  };
  const plain = drive(false), resumed = drive(true);
  assert.equal(JSON.stringify(resumed), JSON.stringify(plain), 'a restore changed the path');
  assert.ok(plain.rung > 0);
});

test('a snapshot record with no `progress` block leaves the tracker unarmed, so a pre-V3 record still restores', () => {
  const ctx = boot({ a: layer('a', 1, 'normal') }), T = ctx.tmtLoader;
  arm(T);
  tick(ctx, 10);
  assert.equal(T.progress().armed, true);
  T.restoreRuntime({ lastReset: {}, loopNo: 3, ranAt: {}, stats: T.runtimeState().stats });
  assert.equal(T.progress().armed, false, 'a pre-V3 record armed the tracker from nothing');
  assert.equal(T.runtimeState().progress, undefined);
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 7 — the watch's own vocabulary, every word witnessed
// ---------------------------------------------------------------------------------------------------------------
test('every watch state word is reachable and none of them renders a `?`', () => {
  const seen = new Set();
  const note = (T) => { const w = T.watchState(); seen.add(w.code); assert.ok(w.text.indexOf('?') < 0, `${w.code} rendered a missing value: ${w.text}`); return w; };
  // off
  let ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }); let T = ctx.tmtLoader;
  arm(T); tick(ctx, 2); note(T);
  // armed (on, nothing measured yet) → moving → stalled → cooling
  ctx = boot({ a: layer('a', 1, 'normal', { gain: 1, points: 10 }) }); T = ctx.tmtLoader;
  arm(T, { watch: true, k: '2', n: '3', cool: '1' });
  tick(ctx, 2); note(T);
  tick(ctx, 5); grant(ctx, 'a', 11); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 12); tick(ctx, 1);
  tick(ctx, 9); grant(ctx, 'a', 13); tick(ctx, 1); note(T);
  tick(ctx, 25); note(T);
  grant(ctx, 'a', 14); tick(ctx, 1); note(T);
  assert.equal([...seen].sort().join(' '), 'watch:armed watch:cooling watch:moving watch:off watch:stalled');
  assert.equal(Object.keys(T.watchCodes()).sort().join(' '), 'watch:armed watch:cooling watch:escalated watch:moving watch:off watch:stalled');
});

test('the watch parameters are validated by the SAME checkParam the strategy table uses, bounds and all', () => {
  const ctx = boot({ a: layer('a', 1, 'normal') }), T = ctx.tmtLoader;
  arm(T);
  for (const [name, bad] of [['k', 'banana'], ['k', '0'], ['n', '0'], ['n', '2.5'], ['cool', '-1']]) {
    const r = T.setWatchOption(name, bad);
    assert.equal(r.ok, false, `${name}=${bad} was accepted`);
    assert.ok(r.error && r.error.length > 4, `${name}=${bad} was refused with no reason`);
  }
  assert.equal(T.setWatchOption('nonsense', 1).ok, false);
  // ⚠ the declared default, read from the TABLE rather than repeated here — the measurement that chose it (K=10,
  // §21.4) would otherwise have to be edited in two places, and the one this leg cares about is "unmoved".
  assert.equal(T.watchOptions().k, T.watchParams().find((p) => p.name === 'k').default, 'a refused value reached the save');
  assert.equal(T.setWatchOption('k', '4.5').ok, true);
  assert.equal(T.watchOptions().k, '4.5');
  // every declared parameter says what it is a proxy for (⚖ 13d.2)
  for (const p of T.watchParams()) assert.ok(p.why && p.why.length > 20, `${p.name} declares no proxy sentence`);
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 8 — the LADDER INDEX is in step with the directory
// ---------------------------------------------------------------------------------------------------------------
test('tools/harness/ladder/index.json lists exactly the games that have a ladder', () => {
  // ⛔ THE INDEX EXISTS BECAUSE A 404 IS A RED. `loader/page.js` reads it before it asks for a ladder, so a game
  // without one costs no request — CI's `G1 load — automation page` judges every request a page makes and reported
  // **169 of 171 RED** on the first cut, which fetched the ladder outright. An index that drifted from the
  // directory would put the 404 straight back.
  const dir = path.resolve(new URL('../tools/harness/ladder', import.meta.url).pathname);
  const onDisk = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => f.slice(0, -5)).sort();
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  assert.ok(Array.isArray(index.games), 'the index declares no `games` list');
  assert.equal(index.games.join(' '), onDisk.join(' '), 'the index and the directory disagree');
  assert.ok(index.note && index.note.length > 40, 'the index does not say what it is for');
});
