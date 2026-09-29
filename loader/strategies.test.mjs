// V2 — the STRATEGY TABLE, and the two new reset strategies, driven over the stub engine (`loader/stub-engine.mjs`).
//
// ⛔ WHAT THIS FILE IS FOR. V2 made a policy one row of DATA and derived the validator, the alphabet, the picker and
// the editors from it. That is only worth anything if the row and the BEHAVIOUR cannot drift apart, so leg 1 of
// `gates-v2` is exactly this file: every strategy's pattern round-trips, the validator accepts what the table
// generates and nothing else, and every parameter is driven across its declared range against a real decision.
//
// ⚠ The stub is not a second engine (see `loader/stub-engine.mjs`). What is exercised is the LOADER's decision
// paths, which are the same code the two real engines run. The stall fallback's ARBITER needs a state with TWO
// stalled features at once, and no recorded fixture in this repo has one — so it is CONSTRUCTED here, which is the
// same reason `loader/reasons.test.mjs` exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

/** A layer whose reset gain follows a schedule of the caller's choosing. */
function layer(name, row, type, gainAt, over = {}) {
  return {
    name, row, type, layerShown: () => true,
    startData: () => ({ unlocked: true, points: new Decimal(0) }),
    upgrades: { 11: { cost: new Decimal(10) } },
    tmtStubTemp(tmp, player) {
      const t = tmp[name] || (tmp[name] = {});
      t.type = type;
      t.baseAmount = new Decimal(player[name].points);
      t.requires = new Decimal(over.requires === undefined ? 1 : over.requires);
      t.nextAt = new Decimal(over.nextAt === undefined ? 1 : over.nextAt);
      t.canReset = over.canReset === undefined ? true : over.canReset;
      t.autoPrestige = false;
      t.resetGain = new Decimal(gainAt(player.timePlayed, player[name].points));
      t.upgrades = { 11: { cost: new Decimal(10), unlocked: true } };
    },
  };
}
const boot = (layers, options) => { const ctx = bootStub(layers, { options: { kinds: 'reset', ...options } }); ctx.tmtLoader.profile('all'); return ctx; };

// ---------------------------------------------------------------------------------------------------------------
// Leg 1 — SCHEMA ≡ BEHAVIOUR
// ---------------------------------------------------------------------------------------------------------------
const anyCtx = () => boot({ a: layer('a', 1, 'normal', () => 1) }, {});

test('every strategy and modifier round-trips: format(parse(s)) === s, at the defaults and across each range', () => {
  const T = anyCtx().tmtLoader;
  const rows = [...T.strategies(), ...T.modifiers()];
  assert.ok(rows.length >= 20, `only ${rows.length} rows in the table`);
  for (const S of rows) {
    // the string the table itself generates
    const base = S.params.length === 0 ? S.template : null;
    const samples = [];
    if (base !== null) samples.push(base);
    // …and one per parameter at its declared minimum, its default and (where declared) its maximum
    const fill = (over) => S.template.replace(/\{(\w+)\}/g, (_, n) => {
      const p = S.params.find((x) => x.name === n);
      return String(over[n] === undefined ? p.default : over[n]);
    });
    samples.push(fill({}));
    for (const p of S.params) {
      if (p.min !== null && p.min !== undefined) samples.push(fill({ [p.name]: p.min }));
      if (p.max !== null && p.max !== undefined) samples.push(fill({ [p.name]: p.max }));
      if (p.type === 'quantity') samples.push(fill({ [p.name]: '1e600' }));
      if (p.type === 'seconds' || p.type === 'factor' || p.type === 'fraction') samples.push(fill({ [p.name]: '2.5' }));
    }
    for (const s of samples) {
      const isMod = T.modifiers().some((m) => m.id === S.id);
      // a modifier is only ever written after a primary, so it round-trips inside one
      const full = isMod ? `${T.defaultPolicyString(S.kind, T.policyTemplates[S.kind][0])}|${s}` : s;
      const parsed = T.parsePolicy(S.kind, full);
      assert.ok(parsed, `${S.id}: the validator's own sample ${JSON.stringify(full)} does not parse`);
      assert.equal(T.formatPolicy(S.kind, parsed), full, `${S.id}: ${JSON.stringify(full)} did not round-trip`);
    }
  }
});

test('the validator accepts exactly what the table generates — and a mutated parameter of the wrong type is refused', () => {
  const ctx = anyCtx(), T = ctx.tmtLoader;
  // ACCEPTS: every default string, on its own kind, registered for real
  for (const S of T.strategies()) {
    const s = T.defaultPolicyString(S.kind, S.id);
    assert.ok(T.parsePolicy(S.kind, s), `${S.kind} ${S.id}: ${s} rejected`);
    // …and on NO OTHER kind (a `buyables` policy is not a `reset` policy)
    for (const other of Object.keys(T.policyTemplates)) {
      if (other === S.kind) continue;
      const hasTwin = T.strategies(other).some((x) => x.id === S.id);
      if (!hasTwin) assert.equal(T.parsePolicy(other, s), null, `${s} parsed as a ${other} policy`);
    }
  }
  // REFUSES — and through `policyOk`, which is what the loader itself validates with: the GRAMMAR and the declared
  // BOUNDS together. `rate-peak@2/0` is the case that matters: it parses perfectly and a value buffer of 2 puts the
  // threshold at a negative rate, so the strategy could never fire. A bound nothing enforces is documentation.
  for (const bad of ['gain>=', 'gain>=x', 'gain>=2xx', 'interval>=1e5', 'rate-peak', 'rate-peak@0', 'rate-peak@2/0',
    'stall>=3x/5', 'gain>=2x|stall>=3x', 'gain>=2x|', 'gain>=2x|stall>=3x/5|stall>=3x/5', 'mystery',
    'gain>=2x|stall>=0x/5', 'gain>=2x|stall>=3x/0']) {
    assert.equal(T.policyOk('reset', bad), false, `${JSON.stringify(bad)} was accepted`);
  }
  // and every string the table generates passes the SAME gate
  for (const S of T.strategies('reset')) assert.equal(T.policyOk('reset', T.defaultPolicyString('reset', S.id)), true, S.id);
});

test('checkParam names its refusal for every declared type, and every default passes its own check', () => {
  const T = anyCtx().tmtLoader;
  for (const S of [...T.strategies(), ...T.modifiers()]) {
    for (const p of S.params) {
      assert.equal(T.checkParam(S.kind, S.id, p.name, p.default), null, `${S.id}.${p.name}: its own default is refused`);
      // ⚠ V5: a `predicate` parameter (a side one) accepts `banana` — it IS an expression; its refusal is one that
      // does not compile
      const bad = p.type === 'predicate' ? 'banana(' : 'banana';
      assert.ok(T.checkParam(S.kind, S.id, p.name, bad), `${S.id}.${p.name}: accepted "${bad}"`);
      if (p.min !== null && p.min !== undefined && Number(p.min) > 0) assert.ok(T.checkParam(S.kind, S.id, p.name, '0'), `${S.id}.${p.name}: accepted 0 under a minimum of ${p.min}`);
      if (p.max !== null && p.max !== undefined) assert.ok(T.checkParam(S.kind, S.id, p.name, String(Number(p.max) + 1)), `${S.id}.${p.name}: accepted a value over its maximum`);
    }
  }
  // the whole Decimal range really is available to a `quantity`
  assert.equal(T.checkParam('reset', 'gain>=N', 'n', '1e600'), null);
  assert.equal(T.checkParam('buyables', 'reserve>=N', 'n', '1e600'), null);
});

test('the picker says WHY a strategy is unavailable rather than hiding it — gain>=Nx on a STATIC layer', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', () => 1), b: layer('b', 1, 'static', () => 1) }, {});
  const T = ctx.tmtLoader;
  const onNormal = T.strategyChoices('reset:a').find((c) => c.id === 'gain>=Nx');
  const onStatic = T.strategyChoices('reset:b').find((c) => c.id === 'gain>=Nx');
  assert.equal(onNormal.available, true);
  assert.equal(onStatic.available, false, 'gain>=Nx offered on a static layer, where it can never fire');
  assert.match(onStatic.why, /static/i);
  // and the list is the WHOLE alphabet of the kind, in the table's order — nothing is omitted
  assert.deepEqual(T.strategyChoices('reset:b').map((c) => c.id), T.policyTemplates.reset);
  // keepsUpgrades needs a `keep` milestone and says so
  const keep = T.strategyChoices('reset:a').find((c) => c.id === 'keepsUpgrades');
  assert.equal(keep.available, false);
  assert.match(keep.why, /keep/);
});

test('every parameter is DRIVEN: the decision moves when the value does', () => {
  // gain>=N across its range: the same state acts at a low threshold and waits at a high one
  for (const [n, acts] of [['1', true], ['2', true], ['3', false], ['1e600', false]]) {
    const ctx = boot({ a: layer('a', 1, 'normal', () => 2) }, { 'policy:reset:a': `gain>=${n}` });
    tick(ctx, 1);
    assert.equal(ctx.resets.length > 0, acts, `gain>=${n} on a gain of 2`);
  }
  // interval>=T: the number of resets over a fixed window is the window over T
  for (const [t, want] of [['1', 100], ['10', 10], ['50', 2]]) {
    const ctx = boot({ a: layer('a', 1, 'normal', () => 1) }, { 'policy:reset:a': `interval>=${t}` });
    tick(ctx, 100);
    assert.equal(ctx.resets.length, want, `interval>=${t} over 100 game-seconds`);
  }
  // gain>=Nx: a bigger multiple waits longer
  const counts = ['1', '2', '4'].map((n) => {
    const ctx = boot({ a: layer('a', 1, 'normal', (t) => 1 + Math.floor(t / 10)) }, { 'policy:reset:a': `gain>=${n}x` });
    tick(ctx, 200);
    return ctx.resets.length;
  });
  assert.ok(counts[0] > counts[1] && counts[1] > counts[2], `gain>=Nx did not get stricter with N: ${counts}`);
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 2 — rate-peak, and its two parameters
// ---------------------------------------------------------------------------------------------------------------
test('rate-peak@0/0 is the bare rule: it resets at the currency-per-second optimum with no threshold', () => {
  // a gain that rises and then flattens: the average rate peaks and the rule must notice
  const gain = (t, p) => Math.min(1 + Math.floor(t / 20), 4);
  const ctx = boot({ a: layer('a', 1, 'normal', gain) }, { 'policy:reset:a': 'rate-peak@0/0' });
  tick(ctx, 400);
  assert.ok(ctx.resets.length > 0, 'rate-peak never reset at all');
  const r = rowOf(ctx, 'reset:a');
  assert.ok(['acted:reset', 'waiting:rate', 'waiting:gain'].includes(r.last.code), r.last.code);
});

test('the VALUE buffer delays the reset, and the TIME buffer delays it further — 0/0 is the control', () => {
  // ⛔ STRICTLY FEWER, NOT "NO MORE THAN". MEASURED by the mutant round: with `<=` the leg was GREEN under
  // "the value buffer is ignored" (`best × (1 − B)` → `best`), because a mutant that changes nothing satisfies
  // equality perfectly. The weak form already ships; what has to be asserted is the DELTA.
  const gain = (t) => Math.min(1 + Math.floor(t / 20), 4);
  const run = (b, h) => { const ctx = boot({ a: layer('a', 1, 'normal', gain) }, { 'policy:reset:a': `rate-peak@${b}/${h}` }); tick(ctx, 600); return ctx.resets.length; };
  const bare = run('0', '0'), valued = run('0.5', '0'), timed = run('0', '50'), both = run('0.5', '50');
  assert.ok(bare > 0, 'the control never reset');
  assert.ok(valued < bare, `a value buffer did not delay: ${valued} vs the bare rule's ${bare}`);
  assert.ok(timed < bare, `a time buffer did not delay: ${timed} vs the bare rule's ${bare}`);
  assert.ok(both <= Math.min(valued, timed), `the two together are faster than either alone: ${both} vs ${valued} / ${timed}`);
});

test('the HOLD CLOCK returns to zero the moment the condition reads false', () => {
  // ⛔ THE CLOCK IS READ FROM `runtimeState()`, NOT FROM THE REASON. MEASURED by the mutant round: reading
  // `last.values.held` left this leg GREEN under "the hold clock never clears", because the `!over` branch reports
  // `held: 0` LITERALLY whether or not the clock was actually cleared — the readout says zero either way. The
  // clock's own state is `rateHold`, and that is the thing the mutation moves.
  let step = 0;
  const gain = () => 2 + step;
  const ctx = boot({ a: layer('a', 1, 'normal', gain) }, { 'policy:reset:a': 'rate-peak@0/40' });
  const clock = () => (ctx.tmtLoader.runtimeState().rateHold || {})['reset:a'];
  tick(ctx, 1);                    // the first reset (no cycle to compare against yet)
  tick(ctx, 20);                   // the condition begins to hold
  assert.ok(clock() !== undefined, 'the hold clock never started');
  assert.ok(Number(rowOf(ctx, 'reset:a').last.values.held) > 0, 'the reason does not report the hold either');
  step = 40;                       // a step-up: the rate jumps back over the threshold
  tick(ctx, 1);
  assert.equal(clock(), undefined, 'a step-up did not clear the hold clock');
  assert.equal(Number(rowOf(ctx, 'reset:a').last.values.held), 0);
  // …and it starts again from zero rather than resuming where it was
  step = 0;
  tick(ctx, 5);
  const restarted = clock();
  assert.ok(restarted !== undefined && Number(player_time(ctx) - restarted) <= 5, `the clock resumed instead of restarting: ${restarted}`);
});
const player_time = (ctx) => Number(ctx.player.timePlayed);

// ---------------------------------------------------------------------------------------------------------------
// Leg 3 — the stall fallback
// ---------------------------------------------------------------------------------------------------------------
/** A layer whose `gain>=2x` fires a few times and then stalls for good: the gain is CAPPED while the bar doubles. */
const stalling = (name, row, cap, per) => layer(name, row, 'normal', (t) => Math.min(1 + Math.floor(t / per), cap));

test('the stall fallback fires only after K× the TYPICAL own-rule interval, and only with an interval to go on', () => {
  const ctx = boot({ a: stalling('a', 1, 6, 5) }, { 'policy:reset:a': 'gain>=2x|stall>=2x/5' });
  // before any own-rule reset there is no `typical` at all and the modifier is SILENT
  tick(ctx, 1);
  const s0 = rowOf(ctx, 'reset:a').stall;
  assert.equal(s0.modifier, 'stall>=Kx/N');
  tick(ctx, 400);
  const rt = ctx.tmtLoader.runtimeState();
  assert.ok(rt.stallIntervals && rt.stallIntervals['reset:a'] && rt.stallIntervals['reset:a'].length >= 1,
    `no own-rule intervals were remembered: ${JSON.stringify(rt.stallIntervals)}`);
  // ⚠ MEASURED WHILE WRITING THIS: with a SHORT typical and K = 2 the fallback pre-empts the feature's own rule —
  // it fires at 2× a 5-second interval, which is sooner than the rule's next chance — so the remembered list stays
  // at ONE entry for good. That is the modifier working, not failing, and it is why the bound in the next test is
  // computed from the own-rule intervals rather than from how many of them there are.
  assert.ok(ctx.resets.length > 3, `the fallback never broke the stall: ${ctx.resets.length} reset(s)`);
});

test('⛔ a reset fired BY THE FALLBACK never feeds `typical` — against a reference the mutant CANNOT move', () => {
  // ⛔ THE REFERENCE IS A SEPARATE CONTROL RUN, not this run's own later history. A mutant that let a timed-out wait
  // feed `typical` would grow BOTH the threshold and the intervals it is computed from, so a bound taken from the
  // mutated run would grow with it and the leg would pass. The control runs the SAME fixture with K so large that
  // the fallback can never fire, which makes its intervals purely own-rule — and nothing the mutant does can reach
  // them. (PTR's q measured ~10, 83, 332 s by its own rule; a timed-out wait feeding the threshold makes that
  // sequence geometric, which is the very stall the modifier exists to break.)
  const control = boot({ a: stalling('a', 1, 6, 5) }, { 'policy:reset:a': 'gain>=2x|stall>=100000x/5' });
  tick(control, 600);
  const own = (control.tmtLoader.runtimeState().stallIntervals || {})['reset:a'] || [];
  assert.ok(own.length >= 1, `the control produced no own-rule interval at all: ${JSON.stringify(own)}`);

  const ctx = boot({ a: stalling('a', 1, 6, 5) }, { 'policy:reset:a': 'gain>=2x|stall>=2x/5' });
  tick(ctx, 660);
  const after = (ctx.tmtLoader.runtimeState().stallIntervals || {})['reset:a'] || [];
  // every interval the run remembered must be one the CONTROL also produced — i.e. an own-rule one
  for (const iv of after) assert.ok(own.indexOf(iv) >= 0, `a remembered interval ${iv} is not an own-rule one (${JSON.stringify(own)})`);
  // …and the fallback's waits therefore stay bounded by K × the largest own-rule interval, from the control
  const bound = 2 * Math.max(...own) + 2;
  const resets = ctx.resets.length;
  assert.ok(resets > 4, `the fallback never broke the stall: ${resets} reset(s)`);
  const spacing = 600 / (resets - 4);
  assert.ok(spacing <= bound, `the fallback's waits grew: ~${spacing.toFixed(1)} s apart against a bound of ${bound} s taken from the control`);
});

test('CONSTRUCTED: the ARBITER picks the feature with the HIGHEST progress fraction, and only one per tick', () => {
  // ⛔ NO FIXTURE IN THIS REPO HAS TWO STALLED FEATURES AT ONCE, so the state is built — and built PRECISELY, by
  // restoring a runtime that puts both features past their stall clocks on the very next tick with fractions that
  // are known and different. `a` sits at gain 3 against a bar of 2 × 5 = 10 (0.30); `b` at gain 9 against
  // 2 × 5 = 10 (0.90). A mutant that took the LOWEST fraction reverses the answer, which "one per tick" alone
  // cannot see.
  const fixed = (name, gain) => ({
    name, row: 1, type: 'normal', layerShown: () => true,
    startData: () => ({ unlocked: true, points: new Decimal(5) }),
    tmtStubTemp(tmp, player) {
      const t = tmp[name] || (tmp[name] = {});
      t.type = 'normal'; t.baseAmount = new Decimal(player[name].points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
      t.canReset = true; t.autoPrestige = false; t.resetGain = new Decimal(gain);
    },
  });
  const mk = () => {
    const ctx = boot({ a: fixed('a', 3), b: fixed('b', 9) }, { 'policy:reset:a': 'gain>=2x|stall>=1x/5', 'policy:reset:b': 'gain>=2x|stall>=1x/5' });
    ctx.player.timePlayed = 1000;
    ctx.tmtLoader.restoreRuntime({
      lastReset: { 'reset:a': 900, 'reset:b': 900 }, loopNo: 10, ranAt: {}, stats: {},
      stallIntervals: { 'reset:a': [50], 'reset:b': [50] }, stallSince: { 'reset:a': 850, 'reset:b': 850 },
    });
    return ctx;
  };
  const ctx = mk();
  // both are 100 game-seconds past a 1 × 50 s clock, so both are stalled on the next tick
  tick(ctx, 1);
  assert.deepEqual(ctx.resets, ['b'], `the arbiter did not pick the feature closest to its target: ${JSON.stringify(ctx.resets)}`);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:stall-yield', `the loser did not say why: ${rowOf(ctx, 'reset:a').last.code}`);
  assert.equal(rowOf(ctx, 'reset:a').last.values.layer, 'b');
  // and the one that yielded re-decides on the NEXT tick, in the world the winner's reset left behind
  tick(ctx, 1);
  assert.ok(ctx.resets.length <= 2, `more than one fallback reset landed per tick: ${JSON.stringify(ctx.resets)}`);
});

test('the modifier writes NOTHING into runtimeState when no feature carries one', () => {
  // ⛔ THE BYTE-FOR-BYTE CLAIM. Every snapshot committed in this repo was written before V2; a run that uses none of
  // V2's memory must write exactly the record it wrote then, or all of them are invalid.
  const ctx = boot({ a: layer('a', 1, 'normal', () => 1) }, { 'policy:reset:a': 'interval>=10' });
  tick(ctx, 200);
  const rt = ctx.tmtLoader.runtimeState();
  for (const k of ['stallIntervals', 'stallSince', 'stallFired', 'rateBest', 'rateHold']) {
    assert.equal(rt[k], undefined, `runtimeState() grew a \`${k}\` key on a run that uses no V2 strategy`);
  }
  assert.deepEqual(Object.keys(rt).sort(), ['lastReset', 'loopNo', 'ranAt', 'stats']);
});

test('restoreRuntime(runtimeState()) is the identity for the new memory too', () => {
  const ctx = boot({ a: stalling('a', 1, 6, 5) }, { 'policy:reset:a': 'gain>=2x|stall>=2x/5' });
  tick(ctx, 200);
  const rt = JSON.parse(JSON.stringify(ctx.tmtLoader.runtimeState()));
  ctx.tmtLoader.restoreRuntime(rt);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.tmtLoader.runtimeState())), rt);
  // …and a run resumed from it takes the same path as one that was never interrupted
  const mk = () => { const c = boot({ a: stalling('a', 1, 6, 5) }, { 'policy:reset:a': 'gain>=2x|stall>=2x/5' }); return c; };
  const plain = mk(); tick(plain, 300);
  const cut = mk(); tick(cut, 200);
  const mid = JSON.parse(JSON.stringify(cut.tmtLoader.runtimeState()));
  const midPlayer = JSON.parse(JSON.stringify(cut.player));
  const resumed = mk();
  resumed.player.timePlayed = midPlayer.timePlayed;
  resumed.player.a.points = new Decimal(midPlayer.a.points.v);   // the stub's Decimal serialises as {v}
  resumed.tmtLoader.restoreRuntime(mid);
  tick(resumed, 100);
  assert.equal(String(resumed.player.a.points), String(plain.player.a.points), 'the resumed run diverged from the uninterrupted one');
  assert.equal(resumed.resets.length + cut.resets.length, plain.resets.length, 'the resumed run made a different number of resets');
});

// ---------------------------------------------------------------------------------------------------------------
// Leg 4 — PRECEDENCE, and the refusal that keeps the previous value
// ---------------------------------------------------------------------------------------------------------------
test('derived < table < the player’s saved choice < a runtime override', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', () => 1) }, {});
  const T = ctx.tmtLoader;
  const f = T.features.find((x) => x.id === 'reset:a');
  assert.equal(f.policy, 'gain>=2x|stall>=5x/5', 'the derived default moved (F1: `gain>=2x|stall>=5x/5`, gate F1-2)');
  assert.equal(T.setSavedPolicy('reset:a', 'interval>=30').ok, true);
  assert.equal(f.policy, 'interval>=30', 'the saved choice did not take effect');
  assert.equal(ctx.player.au.edits['reset:a'].policy, 'interval>=30', 'the choice is not in the save');
  T.setPolicy('reset:a', 'always');
  assert.equal(f.policy, 'always', 'a runtime override did not outrank the save');
  T.setPolicy('reset:a', null);
  assert.equal(f.policy, 'interval>=30', 'clearing the override did not fall back to the save');
  T.setSavedPolicy('reset:a', null);
  assert.equal(f.policy, 'gain>=2x|stall>=5x/5', 'clearing the save did not fall back to the default');
  // a saved choice is NOT runtime memory: it is in `player`, and runtimeState must not carry it
  T.setSavedPolicy('reset:a', 'always');
  assert.equal(T.runtimeState().policies, undefined, 'a saved choice leaked into runtimeState()');
});

test('a value the strategy refuses leaves the previous one in force and SAYS why', () => {
  const ctx = boot({ a: layer('a', 1, 'normal', () => 1) }, {});
  const T = ctx.tmtLoader;
  T.setSavedPolicy('reset:a', 'gain>=2x');
  const bad = T.setSavedParam('reset:a', 'n', 'banana');
  assert.equal(bad.ok, false);
  assert.ok(bad.error && bad.error.length > 3, 'the refusal said nothing');
  assert.equal(bad.policy, 'gain>=2x', 'the refused edit changed the policy anyway');
  assert.equal(T.features.find((x) => x.id === 'reset:a').policy, 'gain>=2x');
  // ⛔ AND NOTHING REACHED THE SAVE. MEASURED by the mutant round: asserting only `ok === false` cannot tell the
  // two layers apart — `setSavedParam`'s `checkParam` buys the MESSAGE, and `setSavedPolicy`'s `policyOk` is the
  // guard. With the message layer bypassed the value still never lands, because the second layer refuses
  // `gain>=bananax`; with the GUARD bypassed it does, and only this line sees that.
  assert.equal(ctx.player.au.edits['reset:a'].policy, 'gain>=2x', 'a refused value reached the save');
  const good = T.setSavedParam('reset:a', 'n', '3');
  assert.equal(good.ok, true);
  assert.equal(good.policy, 'gain>=3x');
  // the modifier is edited the same way, and turning it on keeps the primary and its parameter
  assert.equal(T.setSavedModifier('reset:a', 'stall>=Kx/N').policy, 'gain>=3x|stall>=3x/5');
  assert.equal(T.setSavedParam('reset:a', 'k', '4', 'modifier').policy, 'gain>=3x|stall>=4x/5');
  assert.equal(T.setSavedModifier('reset:a', null).policy, 'gain>=3x');
  // and a save written by hand with a policy this build cannot validate is IGNORED, not run
  ctx.player.au.edits['reset:a'] = { policy: 'mystery' };
  assert.equal(T.features.find((x) => x.id === 'reset:a').policy, 'gain>=2x|stall>=5x/5', 'an unvalidatable saved policy was put in force (it falls back to the DERIVED default, F1)');
});
