// V1 — the reason vocabulary, driven over a stub engine (`loader/stub-engine.mjs`).
//
// ⛔ WHAT THIS FILE IS FOR, and it is not coverage for its own sake. `gates-v1` leg 1 claims EVERY code in the
// table is witnessed by name. Several cannot occur in either reference game at any recorded state — ptr's table
// leaves `challenges` and `clickables` at policy `off`, neither table uses `buy-unless-saving` or `keepsUpgrades`,
// and no table carries a `gates` entry at all — so those are CONSTRUCTED here, deterministically and with no
// browser. The as-built lists which codes are fixture-witnessed and which are constructed-only; this file is the
// second column.
//
// ⚠ The stub is not a second engine. What is exercised is the LOADER's decision paths, which are the same code the
// two real engines run; everything that depends on an engine's own behaviour is gated in the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, codes, rowOf, Decimal } from './stub-engine.mjs';

/** One tree layer with every kind on it, plus a static sibling. `tmtStubTemp` is what the engine's updateTemp does. */
function game(over = {}) {
  const L = {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0), activeChallenge: null }),
      upgrades: { 11: { cost: new Decimal(10) }, 12: { cost: new Decimal(1000) } },
      buyables: { 11: { cost: () => new Decimal(5) } },
      challenges: { 11: {}, 12: {} },
      clickables: { 11: {} },
      milestones: { 0: { toggles: [['a', 'autoThing']] } },
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(100); t.nextAt = new Decimal(100);
        t.canReset = t.baseAmount.gte(t.requires); t.autoPrestige = over.autoPrestige === true;
        t.resetGain = new Decimal(over.resetGain === undefined ? 1 : over.resetGain);
        t.upgrades = { 11: { cost: new Decimal(10), unlocked: true }, 12: { cost: new Decimal(1000), unlocked: true } };
        t.buyables = { 11: { cost: new Decimal(5), unlocked: over.buyableUnlocked !== false, autoed: over.autoed } };
        t.challenges = { 11: { unlocked: true, completionLimit: 1 }, 12: { unlocked: true, completionLimit: 1 } };
        t.clickables = { 11: { unlocked: true, canClick: over.canClick !== false } };
      },
    },
    b: {
      name: 'beta', row: 1, type: 'static', layerShown: () => true,
      startData: () => ({ unlocked: false, points: new Decimal(0) }),
      upgrades: { 11: { cost: new Decimal(1) } },
      tmtStubTemp(tmp, player) {
        const t = tmp.b || (tmp.b = {});
        t.type = 'static'; t.baseAmount = new Decimal(player.a.points); t.requires = new Decimal(1); t.nextAt = new Decimal(1);
        t.canReset = t.baseAmount.gte(t.nextAt); t.autoPrestige = false; t.resetGain = new Decimal(1);
        t.upgrades = { 11: { cost: new Decimal(1), unlocked: true } };
      },
    },
  };
  return L;
}

const boot = (opts = {}, over = {}) => {
  const ctx = bootStub(game(over), opts);
  ctx.tmtLoader.profile('all');
  return ctx;
};

// ⛔ R2 — THE GAME'S OWN AUTOBUYER, PER BUYABLE, AND THE ROW THAT CAN SEE IT IS A BUY COUNT. The `reset` kind has
// yielded to `tmp[l].autoPrestige` since A1; a PURCHASE kind did not, and once a game grants its own buy-max the
// loader and the engine are managing the same buyable. On PTR that is q milestone 1 (`player.e.auto`,
// `player.t.autoExt`) and it is measured in gate R2-3b — but Something Tree declares no `autoed` and CANNOT witness
// it, so the condition is CONSTRUCTED here.
// ⚠ The assertion is the BUY COUNT, deliberately. A double-buy moves no mark and (on the stub) could leave the
// reason code alone, so a row that asserted a code or a hash would walk straight past the mutant that removes the
// yield; `player.a.buyables[11]` cannot.
test('a buyable the GAME declares as `autoed` is left to the game — and the row that sees it is the BUY COUNT', () => {
  const K = { options: { kinds: 'buyables' }, autoTable: { policies: { 'buyables:a': 'buy' } } };   // buyables ONLY, so the points are this kind's alone
  const on = boot(K, { autoed: true });
  on.player.a.points = new Decimal(1000);
  tick(on, 3);
  assert.equal(Number(on.player.a.buyables[11]), 0, 'the loader bought a buyable the game declares it autobuys');
  assert.equal(Number(on.player.a.points), 1000, 'and it spent nothing');
  assert.equal(rowOf(on, 'buyables:a').last.code, 'yielding:native');

  // the CONTROL, identical but for the declaration: without it the same three ticks buy, so the row above is a
  // measurement of the yield and not of an unaffordable or locked buyable
  const off = boot(K, {});
  off.player.a.points = new Decimal(1000);
  tick(off, 3);
  assert.ok(Number(off.player.a.buyables[11]) > 0, 'the control bought nothing either — the leg is vacuous');
  // ⚠ the CENSUS, not `last`: the control spends the whole purse on its first tick and then says
  // `nothing-affordable`, so the last tick's code is not the one this row is about
  assert.ok(codes(off)['acted:buyables'] > 0, 'the control never acted');
  assert.ok(Number(off.player.a.points) < 1000);
  assert.equal(codes(on)['acted:buyables'] || 0, 0, 'the yielding arm acted at least once');
});

// ⚠ FALSY IS THE WHOLE OF "NO", and 155 of the 171 games never mention `autoed` at all — an absent declaration is
// `undefined` and must buy exactly as before. ⛔ And the other half is what makes this row non-vacuous: `autoed()` is
// the GAME's own expression and nothing obliges it to return a boolean, so a TRUTHY non-boolean must yield. A
// mutant that tightens the test to `=== true` walks past the falsy half and dies on the truthy one.
test('a falsy or absent `autoed` buys exactly as before — and a TRUTHY non-boolean one yields', () => {
  const K = { options: { kinds: 'buyables' }, autoTable: { policies: { 'buyables:a': 'buy' } } };
  for (const v of [undefined, false, null, 0, '']) {
    const ctx = boot(K, { autoed: v });
    ctx.player.a.points = new Decimal(1000);
    tick(ctx, 3);
    assert.ok(Number(ctx.player.a.buyables[11]) > 0, `autoed=${JSON.stringify(v)} suppressed the purchase`);
  }
  for (const v of [1, 'yes', new Decimal(1)]) {
    const ctx = boot(K, { autoed: v });
    ctx.player.a.points = new Decimal(1000);
    tick(ctx, 3);
    assert.equal(Number(ctx.player.a.buyables[11]), 0, `a truthy autoed=${JSON.stringify(String(v))} did not yield`);
    assert.equal(rowOf(ctx, 'buyables:a').last.code, 'yielding:native');
  }
});

test('the table is internally consistent: every placeholder is a declared value, every quantity is one too', () => {
  // ⚠ A code whose template names `{cost}` while its callers pass `{price}` renders `?` forever and no leg would
  // notice — the text is still a string and the decision is still right.
  const ctx = boot();
  const C = ctx.tmtLoader.reasonCodes();
  for (const [code, def] of Object.entries(C)) {
    const used = [...def.text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    for (const k of used) assert.ok(def.values.includes(k), `code ${code}: the text uses {${k}}, which is not in its values`);
    for (const k of def.values) assert.ok(used.includes(k), `code ${code}: declares the value ${k}, which its text never renders`);
  }
  assert.ok(Object.keys(C).length >= 20, `only ${Object.keys(C).length} codes`);
  assert.ok(C.unknown, 'there is no `unknown` code — an unmapped exit would have nowhere to go');
});

test('a run that never asks for text FORMATS NOTHING', () => {
  // The cost gate, in its cheapest form. `decisions` proves the ticks happened.
  const ctx = boot();
  tick(ctx, 200);
  const st = ctx.tmtLoader.explainStats();
  assert.equal(st.formats, 0, 'the tick loop formatted a number');
  assert.equal(st.texts, 0, 'the tick loop built a reason string');
  assert.ok(st.decisions > 0, 'nothing decided at all — the stub did not run');
  // …and asking for one DOES format, so the counter is not simply dead.
  ctx.tmtLoader.explain();
  assert.ok(ctx.tmtLoader.explainStats().texts > 0, 'explain() built no text — the counter cannot see anything');
});

// ⚠ V4 MOVED THIS ROW'S TEXT AND ITS PREMISE, and both moves are the slice's subject. `games-auto/ptr.js` now
// carries a `gates` entry (the M21 pause), so "no table on the roster carries one" is false — but no leg SHORT
// enough for gates-v1 part 1 reaches PTR's q milestone 4, so the code is still constructed here. And the text now
// names the OWNER of the predicate, because the slot has four possible sources and a player has to be able to tell
// whether they typed it themselves.
test('CONSTRUCTED: blocked:gate — the `while` slot, and its text names WHOSE predicate it is', () => {
  const ctx = boot();
  ctx.tmtLoader.registerAutoFeature({ id: 'reset:a-gated', layer: 'a', kind: 'reset', policy: 'always', gate: 'false' });
  ctx.player.a.points = new Decimal(1000);
  tick(ctx, 2);
  assert.ok(codes(ctx)['blocked:gate'] > 0, JSON.stringify(codes(ctx)));
  const r = rowOf(ctx, 'reset:a-gated');
  assert.equal(r.last.code, 'blocked:gate');
  assert.equal(r.last.values.gate, 'false');
  assert.equal(r.last.values.owner, 'table');
  assert.match(r.last.text, /Blocked — the gate false \(table\) is false/);
});

test('CONSTRUCTED: off:policy — `challenges` and `clickables` sit at `off` in both real tables', () => {
  const ctx = boot();
  tick(ctx, 2);
  assert.ok(codes(ctx)['off:policy'] > 0, JSON.stringify(codes(ctx)));
  assert.equal(rowOf(ctx, 'challenges:a').last.code, 'off:policy');
  assert.equal(rowOf(ctx, 'clickables:a').last.code, 'off:policy');
});

test('CONSTRUCTED: the challenge codes — enter, in-challenge, exit, blocked:enter', () => {
  const ctx = boot({ autoTable: { order: { 'challenges:a': [11, 12] } } });
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'challenges:a').last.code, 'acted:challenge-enter');
  assert.equal(ctx.player.a.activeChallenge, 11);
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'challenges:a').last.code, 'in-challenge', 'a challenge it cannot complete yet');
  ctx.completable['a:11'] = true;
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'challenges:a').last.code, 'acted:challenge-exit');
  assert.equal(ctx.player.a.challenges[11], 1);
  ctx.enterable['a:12'] = false;
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'challenges:a').last.code, 'blocked:enter');
  ctx.enterable['a:12'] = true; ctx.completable['a:12'] = true;
  tick(ctx, 3);   // enter 12, complete-and-leave 12, then there is nothing left below its limit
  assert.equal(rowOf(ctx, 'challenges:a').last.code, 'nothing-to-do', 'every challenge is at its completion limit');
  for (const c of ['acted:challenge-enter', 'in-challenge', 'acted:challenge-exit', 'blocked:enter', 'nothing-to-do']) assert.ok(codes(ctx)[c] > 0, c);
});

test('CONSTRUCTED: the clickable codes — waiting:when and acted:clickables', () => {
  const ctx = bootStub(game({ canClick: false }), { autoTable: { clickables: { a: [{ id: 11, when: 'player.a.points.gte(3)' }] } } });
  ctx.tmtLoader.profile('all');
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'clickables:a').last.code, 'waiting:when');
  const ctx2 = bootStub(game(), { autoTable: { clickables: { a: [{ id: 11, when: 'true' }] } } });
  ctx2.tmtLoader.profile('all');
  tick(ctx2, 1);
  const r = rowOf(ctx2, 'clickables:a');
  assert.equal(r.last.code, 'acted:clickables');
  // ⚠ `deepEqual` across the vm realm fails on arrays ("same structure, not reference-equal"): the array was built
  // by the other realm's Array. JSON is the comparison that does not care which realm made it.
  assert.equal(JSON.stringify(r.last.values.ids), '[11]');
  assert.equal(JSON.stringify(ctx2.clicked), '["a:11"]');
});

test('CONSTRUCTED: waiting:milestone, both ways in — keepsUpgrades and an ungranted toggle', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'keepsUpgrades' }, keep: { 'reset:a': { layer: 'a', id: 0 } } } });
  ctx.player.points = new Decimal(1000);   // a row-1 layer's baseAmount is the GAME's points, not the layer's
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:milestone');
  assert.equal(rowOf(ctx, 'toggles:a').last.code, 'waiting:milestone', 'the milestone that would grant the toggle is not held');
  ctx.player.a.milestones.push(0);
  ctx.player.a.autoThing = false;
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'toggles:a').last.code, 'acted:toggles');
  assert.equal(ctx.player.a.autoThing, true);
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'toggles:a').last.code, 'nothing-to-do', 'every toggle the held milestones grant is already on');
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'acted:reset', 'the milestone is held, so keepsUpgrades resets');
});

test('CONSTRUCTED: holding:saving — `buy-unless-saving` is in neither real table', () => {
  const ctx = boot({ autoTable: { policies: { 'buyables:a': 'buy-unless-saving' } } });
  ctx.player.a.points = new Decimal(50);
  tick(ctx, 1);
  const r = rowOf(ctx, 'buyables:a');
  assert.equal(r.last.code, 'holding:saving');
  assert.equal(r.last.values.id, 12, 'the upgrade it is saving for');
  assert.equal(Number(ctx.player.a.buyables[11]), 0, 'and it bought nothing');
});

test('CONSTRUCTED: holding:reserve, and the reserve is re-checked between purchases', () => {
  const ctx = boot({ autoTable: { policies: { 'buyables:a': 'reserve>=20' } } });
  ctx.player.a.points = new Decimal(10);
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'holding:reserve');
  assert.equal(Number(ctx.player.a.buyables[11]), 0);
  ctx.player.a.points = new Decimal(32);
  tick(ctx, 1);
  // ⚠ WHAT THE RESERVE ACTUALLY PROMISES, measured: "nothing is bought while the layer holds NO MORE THAN N" —
  // it is checked BEFORE each purchase, not simulated after it. 32 → 27 → 22 → 17, and 17 is where it stops
  // because 17 <= 20. The reserve is a floor a single purchase may cross, and the check between purchases is what
  // stops the tick that crossed it from spending everything (R1′: 401 EP against a 400 EP reserve bought ten
  // Enhancers before that check existed).
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'acted:buyables');
  assert.equal(Number(ctx.player.a.points), 17, 'the reserve did not stop the purchases after the crossing');
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'buyables:a').last.code, 'holding:reserve', 'and the next tick holds');
});

test('CONSTRUCTED: waiting:purchase — `unlocks-purchase` reaching nothing', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'unlocks-purchase' } } }, { resetGain: 0 });
  ctx.player.points = new Decimal(1000);
  ctx.player.a.upgrades.push(11, 12);      // nothing left to unlock with the points the reset would leave
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'waiting:purchase');
});

test('CONSTRUCTED: yielding:native — the game resets the layer itself', () => {
  const ctx = bootStub(game({ autoPrestige: true }), {});
  ctx.tmtLoader.profile('all');
  ctx.player.points = new Decimal(1000);   // canReset TRUE, so the only thing that can stop it is the native yield
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'yielding:native');
  assert.deepEqual(ctx.resets, [], 'it reset anyway');
});

test('CONSTRUCTED: off:excluded carries the table\'s own reason, on a feature that is never registered', () => {
  const ctx = boot({ autoTable: { off: { 'buyables:a': 'a stub exclusion, with its reason' } }, });
  tick(ctx, 1);
  assert.equal(ctx.tmtLoader.features.find((f) => f.id === 'buyables:a'), undefined, 'an excluded feature was registered');
  const r = rowOf(ctx, 'buyables:a');
  assert.equal(r.state, 'excluded');
  assert.equal(r.last.code, 'off:excluded');
  assert.match(r.last.text, /a stub exclusion, with its reason/);
});

test('armed / locked / off are three different answers', () => {
  const ctx = boot();
  const AU = ctx.tmtLoader.auLayer;
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'upgrades:b').last.code, 'locked', 'b is not unlocked');
  ctx.tmtLoader.profile('saved');
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'upgrades:a').last.code, 'off', 'unlocked, saved off');
  ctx.player[AU].armLocked = true;
  ctx.player[AU].features['upgrades:b'] = true;
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'upgrades:b').last.code, 'armed');
  assert.equal(rowOf(ctx, 'upgrades:b').state, 'armed');
  assert.equal(ctx.tmtLoader.hookStats().actions['upgrades:b'], undefined, 'an armed, locked feature acted');
});

test('⛔ `unknown` never occurs, and the check can SEE it', () => {
  // A leg that asserts an absence proves nothing until the absence has been made present once.
  const ctx = boot();
  tick(ctx, 50);
  assert.equal(codes(ctx).unknown, undefined, JSON.stringify(codes(ctx)));
  // the one exit that reaches `unknown`: a policy the validator accepted and the switch does not implement
  // ⚠ NOT `gain>=notanumberx`: that MATCHES the gain>=Nx branch, multiplies by NaN and answers `waiting:gain-x`
  // perfectly reasonably. The exit is a policy no branch recognises at all.
  // ⚠ V2: `f.policy` is a GETTER over the precedence chain (derived < table < the player's save < setPolicy), so the
  // exit is forced at the BASE of that chain. `parsePolicy` answers null for a string no strategy row matches, and
  // the decision path's last line is what turns that into `unknown`.
  const f = ctx.tmtLoader.features.find((x) => x.id === 'reset:a');
  f.policy0 = 'mystery';
  ctx.player.points = new Decimal(1000);
  tick(ctx, 1);
  assert.ok(codes(ctx).unknown > 0, 'a policy no branch implements did not reach `unknown`');
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'unknown');
});

test('neverFired flags a feature that is on, unlocked and has still done nothing', () => {
  const ctx = boot({ options: { neverFiredSeconds: '10' } });
  ctx.player.a.points = new Decimal(100);          // so `upgrades:a` CAN act; `reset:a` never reaches its requirement
  tick(ctx, 5);
  assert.equal(rowOf(ctx, 'reset:a').neverFired, false, 'flagged before the window elapsed');
  tick(ctx, 20);
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.neverFired, true);
  assert.equal(r.acted, 0);
  assert.ok(r.eligibleFor >= 10);
  // …and a feature that HAS acted is never flagged, however long it then waits
  assert.ok(rowOf(ctx, 'upgrades:a').acted > 0, 'the control feature never acted, so it proves nothing');
  assert.equal(rowOf(ctx, 'upgrades:a').neverFired, false);
});

test('CONSTRUCTED: the last three — blocked:exit, waiting:gain and waiting:interval', () => {
  // `blocked:exit`: the engine has `canExitChallenge` (2.7 does) and says no while the challenge is completable.
  const a = boot({ autoTable: { order: { 'challenges:a': [11] } } });
  a.completable['a:11'] = true;
  a.exitable['a:11'] = false;
  tick(a, 2);
  assert.equal(rowOf(a, 'challenges:a').last.code, 'blocked:exit');
  assert.equal(a.player.a.challenges[11], 0, 'it left the challenge anyway');

  // `waiting:gain`: an ABSOLUTE threshold above the gain. Neither real table can witness this — ptr's b/g use
  // `gain>=1` on static layers, whose gain IS 1 the moment they can reset, so the branch is never the answer there.
  const b = boot({ autoTable: { policies: { 'reset:a': 'gain>=5' } } }, { resetGain: 2 });
  b.player.points = new Decimal(1000);
  tick(b, 1);
  const rb = rowOf(b, 'reset:a');
  assert.equal(rb.last.code, 'waiting:gain');
  assert.equal(rb.last.values.gain, '2');
  assert.equal(rb.last.values.need, '5');
  assert.equal(b.resets.filter((x) => x === 'a').length, 0);

  // `waiting:interval`: fires once, then waits out the clock. (something's table uses `interval>=5` / `>=90`, so
  // this one IS fixture-witnessed as well — it is here because a stub makes the elapsed number checkable.)
  const c = boot({ autoTable: { policies: { 'reset:a': 'interval>=10' } } });
  c.player.points = new Decimal(1000);
  tick(c, 1);
  assert.equal(rowOf(c, 'reset:a').last.code, 'acted:reset');
  tick(c, 3);
  const rc = rowOf(c, 'reset:a');
  assert.equal(rc.last.code, 'waiting:interval');
  assert.equal(rc.last.values.need, 10);
  assert.equal(rc.last.values.elapsed, 3);
  // ⚠ judged on the COUNTER, not on the last code: the interval elapses mid-window, it fires, and the ticks after
  // that are waiting again — so "the last decision is acted:reset" is only true on the exact tick it fired.
  tick(c, 8);
  assert.equal(c.resets.filter((x) => x === 'a').length, 2, 'the interval elapsed and it did not fire');
  assert.equal(rowOf(c, 'reset:a').acted, 2);
});

test('the reason and the decision cannot disagree: `act` moves with the action counter', () => {
  // gates-v1 leg 2 over a real leg; here in its smallest form, tick by tick.
  const ctx = boot();
  const T = ctx.tmtLoader;
  for (let i = 0; i < 60; i++) {
    ctx.player.a.points = new Decimal(Number(ctx.player.a.points) + 20);
    const before = Object.assign({}, T.hookStats().actions);
    tick(ctx, 1);
    const after = T.hookStats().actions;
    for (const f of T.features) {
      const rose = (after[f.id] || 0) > (before[f.id] || 0);
      const acted = !!(f.last && /^acted:/.test(f.last.code));
      assert.equal(acted, rose, `${f.id} at tick ${i}: code ${f.last && f.last.code}, counter ${before[f.id] || 0} → ${after[f.id] || 0}`);
    }
  }
});

test('a NaN is never handed to the GAME\'s own format() — it logs and raises player.hasNaN', () => {
  // ⛔ WHY THIS EXISTS, AND WHAT IT DOES NOT CLAIM. Every TMT `format()` begins
  // `if (isNaN(sign) || isNaN(layer) || isNaN(mag)) { player.hasNaN = true; console.error('We meet an NaN at ' + d) }`
  // — so a READOUT that formats a NaN sets off the game's own alarm and writes to its console just by describing a
  // state the game is already in. ⚠ MEASURED over the whole roster (gates-v1 --part 6): NO game's `explain()`
  // reaches such a value — `arctree` logs that line 68 times during its own load and once per `updateTemp()`, and
  // `tmtLoader.explain()` adds ZERO with the guard in place AND with it removed. So this is a precaution nothing
  // on the roster exercises, and it is driven HERE rather than left as an untested claim in the source.
  const ctx = boot();
  const T = ctx.tmtLoader;
  const nan = { code: 'waiting:gain', values: { gain: new Decimal(NaN), need: new Decimal(NaN) } };
  const ok = { code: 'waiting:gain', values: { gain: new Decimal(7), need: new Decimal(9) } };
  const b0 = ctx.fired.format;
  const t = T.reasonText(nan);
  assert.match(t, /NaN/, 'the NaN is not on screen at all — then the guard is not what is being tested');
  assert.equal(ctx.fired.format, b0, "the game's own format() was called on a NaN");
  // …and the SAME code with finite numbers DOES go through format(), so the guard is not formatting off entirely
  const b1 = ctx.fired.format;
  assert.match(T.reasonText(ok), /7/);
  assert.equal(ctx.fired.format - b1, 2, 'both quantities of the same code should have been formatted');
  // …and a NaN reached through a real decision reads as NaN rather than as a wrong number
  ctx.player.points = new Decimal(NaN);
  tick(ctx, 1);
  assert.match(rowOf(ctx, 'reset:a').last.text, /NaN/);
});

test('every table string the tab renders is ESCAPED', () => {
  const ctx = boot({ autoTable: { off: { 'buyables:a': '<img src=x onerror="alert(1)">' } } });
  const esc = ctx.tmtLoader.escapeText('<img src=x onerror="alert(1)">');
  assert.equal(esc, '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.doesNotMatch(esc, /<img/);
});

// ---------------------------------------------------------------------------------------------------------------
// V2 — the three codes the two new reset strategies added. ⛔ THEY BELONG HERE, not only in
// `loader/strategies.test.mjs`, because `gates-v1 --part 1` requires EVERY code in the vocabulary to be witnessed
// by name and runs THIS file for the constructed ones. MEASURED when they were not: `RED V1-1 EVERY code witnessed
// by name — 33 codes … unwitnessed: waiting:rate, waiting:stall-clock, waiting:stall-yield`. A vocabulary grows by
// three entries and the gate that exists for exactly that notices; the fix is to witness them, not to widen the
// gate.
// ---------------------------------------------------------------------------------------------------------------

test('CONSTRUCTED: waiting:rate — `rate-peak` while the cycle is still improving', () => {
  // no fixture uses `rate-peak`: it is new in V2 and no table names it.
  // ⚠ `kinds: reset` — measured: with every kind registered, `buyables:a` spends the layer's points (its buyable
  // costs 5) BEFORE the reset feature decides, so `gain>=Nx`'s bar drops to zero and the reset fires. The state
  // these three codes need is about the RESET rule, so the other kinds are not registered.
  const ctx = boot({ options: { kinds: 'reset', 'policy:reset:a': 'rate-peak@0/0' } });
  ctx.player.points = new Decimal(1000);        // so the engine's own canReset holds
  tick(ctx, 1);                                  // the first reset: no cycle to compare against yet
  tick(ctx, 2);                                  // …and now there is one
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.last.code, 'waiting:rate', JSON.stringify(r.last));
  assert.ok(codes(ctx)['waiting:rate'] > 0);
  // the reason carries the three numbers the player needs: the rate now, the best, and the threshold the buffer puts under it
  for (const k of ['rate', 'best', 'need', 'held', 'hold']) assert.ok(r.last.values[k] !== undefined, `values.${k} missing`);
});

/** Both reset features stalled at once, with their clocks seeded — no fixture in this repo has such a state. */
function stalled(over = {}) {
  const ctx = boot({ options: { kinds: 'reset', 'policy:reset:a': 'gain>=2x|stall>=1x/5', 'policy:reset:b': 'gain>=2x|stall>=1x/5' } }, over);
  ctx.player.points = new Decimal(1000);
  ctx.player.a.points = new Decimal(5);          // gain 1 against a bar of 2 × 5: `gain>=2x` refuses
  // ⚠ `b` NEEDS POINTS TOO, or it is not stalled at all: `gain>=2x` on a layer holding 0 has a bar of 0, so it
  // ACTS on the first tick and never becomes a candidate for the arbiter to weigh (measured — `a` fired by the
  // fallback instead of yielding, because it was the only stalled feature there was).
  ctx.player.b.points = new Decimal(10);
  ctx.player.b.unlocked = true;
  ctx.player.timePlayed = 1000;
  return ctx;
}

test('CONSTRUCTED: waiting:stall-clock — the modifier is armed and its clock has NOT run out', () => {
  const ctx = stalled();
  ctx.tmtLoader.restoreRuntime({ lastReset: { 'reset:a': 990 }, loopNo: 1, ranAt: {}, stats: {},
    stallIntervals: { 'reset:a': [100] }, stallSince: { 'reset:a': 890 } });
  tick(ctx, 1);                                  // 11 s into a 1 × 100 s clock
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.last.code, 'waiting:stall-clock', JSON.stringify(r.last));
  assert.equal(r.last.values.policy, 'gain>=Nx', 'the countdown must NAME the primary rule that is still refusing');
  assert.ok(Number(r.last.values.need) === 100 && Number(r.last.values.elapsed) < 100, JSON.stringify(r.last.values));
});

test('CONSTRUCTED: waiting:stall-yield — stalled, and another stalled feature is closer to its target', () => {
  // ⛔ THE ARBITER'S OWN STATE, which neither of the other two codes can express. `b` is static, so its progress is
  // `baseAmount / nextAt` (1000 / 1, capped at 1); `a` is normal at gain 1 against 2 × 5 — so `b` wins and `a`
  // must SAY it yielded, and to whom.
  const ctx = stalled();
  ctx.tmtLoader.restoreRuntime({ lastReset: { 'reset:a': 900, 'reset:b': 900 }, loopNo: 1, ranAt: {}, stats: {},
    stallIntervals: { 'reset:a': [50], 'reset:b': [50] }, stallSince: { 'reset:a': 850, 'reset:b': 850 } });
  tick(ctx, 1);                                  // both are 100 s past a 1 × 50 s clock
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.last.code, 'waiting:stall-yield', JSON.stringify(r.last));
  assert.equal(r.last.values.layer, 'b', 'it yielded to the wrong feature');
  assert.deepEqual(ctx.resets, ['b'], `only the closest may fire: ${JSON.stringify(ctx.resets)}`);
});

// U17 (⚖ user, 2026-09-23): the Advanced view says how long AGO a feature last acted, not the game-clock time it
// acted at. The row carries it on the SAME clock as `lastActedAt` (`player.timePlayed`), so the view computes nothing.
test('sinceActed is the game-seconds since the feature last acted, and null until it has', () => {
  const ctx = boot({ options: { neverFiredSeconds: '10' } });
  ctx.player.a.points = new Decimal(100);          // so `upgrades:a` acts; `reset:a` never does
  tick(ctx, 5);
  assert.equal(rowOf(ctx, 'reset:a').sinceActed, null, 'a feature that never acted has no "ago"');
  const r = rowOf(ctx, 'upgrades:a');
  assert.ok(r.acted > 0 && r.lastActedAt !== null, 'the control feature never acted, so it proves nothing');
  const now = Number(ctx.player.timePlayed);
  assert.equal(r.sinceActed, Math.round((now - r.lastActedAt) * 10) / 10);
  tick(ctx, 20);                                   // nothing left to buy: the clock moves, the last act does not
  const r2 = rowOf(ctx, 'upgrades:a');
  assert.ok(r2.sinceActed >= r.sinceActed, `the "ago" did not grow (${r.sinceActed} → ${r2.sinceActed})`);
  assert.equal(r2.sinceActed, Math.round((Number(ctx.player.timePlayed) - r2.lastActedAt) * 10) / 10);
});
