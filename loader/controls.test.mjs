// V4 — the per-feature CONTROLS (`while`, `until`, `priority`), driven over the stub engine.
//
// ⛔ WHAT THIS FILE IS FOR. `while` and `until` are `new Function` over text a PLAYER types and a SAVE carries, and
// `priority` reorders the decision path itself. Neither reference game's table declares any of the three, so every
// claim about them is either constructed here or it is not measured at all. The page legs (`gates-v4 --part 6`) add
// what a stub cannot have — a real keyboard, a real `v-html`, a real reload — and the real-game legs
// (`gates-v4 --part 2/3/4`) add what a stub cannot have either: a game.
//
// ⚠ EVERY TEST HERE NAMES THE MUTANT IT IS AGAINST. A row that cannot tell two builds apart is a row that will go
// green over the defect it was written for (plan §18.8: three of nine mutants came back green on their first round,
// and all three were vacuous legs rather than mutations that could not matter).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, codes, rowOf, Decimal } from './stub-engine.mjs';

/** One tree layer carrying an upgrade kind, a buyable kind and a reset, all costed in the layer's OWN points. */
function game(over = {}) {
  return {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked: true, points: new Decimal(0) }),
      upgrades: { 11: { cost: new Decimal(10) } },
      buyables: { 11: { cost: () => new Decimal(5) } },
      milestones: { 0: { toggles: [['a', 'autoThing']] } },
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(100); t.nextAt = new Decimal(100);
        t.canReset = t.baseAmount.gte(t.requires); t.autoPrestige = false;
        t.resetGain = new Decimal(over.resetGain === undefined ? 1 : over.resetGain);
        t.upgrades = { 11: { cost: new Decimal(10), unlocked: true } };
        t.buyables = { 11: { cost: new Decimal(5), unlocked: true } };
      },
    },
  };
}
const boot = (opts = {}, over = {}) => { const ctx = bootStub(game(over), opts); ctx.tmtLoader.profile('all'); return ctx; };
const T = (ctx) => ctx.tmtLoader;

// ---- the `predicate` PARAM TYPE: schema ≡ behaviour ---------------------------------------------------------------

test('the `predicate` type declares NO grammar, and that is what keeps it out of a policy string', () => {
  const ctx = boot();
  const types = T(ctx).paramTypes();
  assert.equal(types.predicate.re, null, 'a predicate given a regex would be a predicate a policy string could contain');
  assert.equal(types.predicate.kind, 'text');
  // and the CONTROLS are declared in the same schema shape the strategy table uses, so the editors stay generic
  // ⚠ `.join` RATHER THAN `deepEqual`: everything the loader builds comes out of the stub's vm realm, so a foreign
  // Array is "same structure, not reference-equal" to a native one and `deepEqual` reds on a value that is right.
  assert.equal(T(ctx).controls().map((c) => c.name).join(','), 'while,until,priority');
  assert.equal(T(ctx).controls()[0].type, 'predicate');
  assert.equal(T(ctx).controls()[2].type, 'count');
});

test('ROUND TRIP: what is saved is what comes back, byte for byte, including the characters a grammar would eat', () => {
  const ctx = boot();
  // `|` is the MODIFIER separator, `<` and `"` are what `v-html` cares about, `'` is what a naive quoting would break
  const src = 'player.a.points.gte(5) || (player.a.upgrades.indexOf(11) >= 0 && "x" !== \'y\')';
  const r = T(ctx).setSavedControl('reset:a', 'while', src);
  assert.equal(r.ok, true, r.error);
  assert.equal(T(ctx).savedControl('reset:a', 'while'), src);
  assert.equal(T(ctx).controlState('reset:a')['while'].value, src);
  assert.equal(rowOf(ctx, 'reset:a').gate, src, 'explain() must show the predicate in force as a plain string');
  // and it is IN THE SAVE, under `au`, where `hashGame` cannot see it
  assert.equal(ctx.player.au.edits['reset:a']['while'], src);
});

test('A REFUSAL CHANGES NOTHING AND SAYS WHY — the previous value stays in force (V2’s rule, the brief’s Part 1b)', () => {
  const ctx = boot();
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', 'player.a.points.gte(1)').ok, true);
  const bad = T(ctx).setSavedControl('reset:a', 'while', 'player.a.points.gte(');
  assert.equal(bad.ok, false);
  assert.match(bad.error, /not a JavaScript expression/);
  assert.equal(bad.value, 'player.a.points.gte(1)', 'the refusal returned a different value from the one still in force');
  assert.equal(T(ctx).savedControl('reset:a', 'while'), 'player.a.points.gte(1)');
  // MUTANT: "a predicate is committed before it is compiled" — this row reds, because the broken text would be saved
  assert.equal(ctx.player.au.edits['reset:a']['while'], 'player.a.points.gte(1)');
});

test('A RUN-TIME THROW IS CONTAINED TO ITS OWN FEATURE, and it does NOT read as `false`', () => {
  const ctx = boot();
  ctx.player.a.points = new Decimal(1000);
  // `upgrades:a` gets a predicate that compiles and throws; `buyables:a` gets none
  assert.equal(T(ctx).setSavedControl('upgrades:a', 'while', 'player.nosuchlayer.points.gte(1)').ok, true);
  tick(ctx, 1);
  const u = rowOf(ctx, 'upgrades:a'), b = rowOf(ctx, 'buyables:a');
  assert.equal(u.last.code, 'blocked:predicate', JSON.stringify(u.last));
  assert.equal(u.last.values.which, 'while');
  assert.notEqual(u.last.code, 'blocked:gate', 'a throw must not be reported as a condition that is merely false');
  // ⛔ THE OTHER FEATURE STILL DECIDED, ON THE SAME TICK. A throw that killed the tick would leave this at 0.
  assert.ok(Number(ctx.player.a.buyables[11]) > 0, 'the throwing feature took the tick down with it');
  assert.ok(String(b.last.code).startsWith('acted:'), b.last.code);
  assert.deepEqual(ctx.player.a.upgrades.length, 0, 'the paused feature bought anyway');
  // and the message is available where the brief asks for it — the BLOCK, not the reason values
  const st = T(ctx).controlState('upgrades:a');
  assert.ok(st['while'].error, 'controlState() carries no error for a predicate that threw');
  assert.equal(st['while'].holds, null, 'a throw is not a boolean answer');
  assert.equal(Object.keys(u.last.values).sort().join(','), 'src,which', 'no free-text value in the reason vocabulary');
});

// ---- `while` — the PAUSE, and it is the table’s `gates` slot -------------------------------------------------

test('`while` IS the table’s gate slot: a saved edit outranks the table, and the reason names WHOSE it is', () => {
  const ctx = bootStub(game(), { autoTable: { policies: { 'reset:a': 'always' }, gates: { 'reset:a': 'false' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  tick(ctx, 1);
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.last.code, 'blocked:gate');
  assert.equal(r.last.values.owner, 'table');
  assert.equal(ctx.resets.length, 0);
  // the player's own `while` sits ABOVE the table's entry — V2's precedence, one slot
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', 'true').ok, true);
  tick(ctx, 1);
  assert.equal(T(ctx).controlState('reset:a')['while'].owner, 'you');
  assert.ok(ctx.resets.length > 0, 'the player’s own `while` did not outrank the table’s gate');
  // …and an EMPTY string is "no condition", which is how a table's gate is removed rather than replaced
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', '').ok, true);
  assert.equal(T(ctx).controlState('reset:a')['while'].value, '');
  assert.equal(T(ctx).controlState('reset:a')['while'].owner, 'you');
});

test('`while` IS RE-EVALUATED EVERY TICK — the pause lifts by itself when the predicate comes back true', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', 'player.a.autoThing === true').ok, true);
  ctx.player.points = new Decimal(1000);
  tick(ctx, 2);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'blocked:gate');
  const paused = ctx.resets.length;
  ctx.player.a.autoThing = true;                       // the world moves; nothing is re-saved
  tick(ctx, 2);
  assert.ok(ctx.resets.length > paused, 'the pause did not lift when the predicate became true');
  ctx.player.a.autoThing = false;                      // ⛔ AND IT GOES BACK ON — a pause is NOT a latch
  const resumed = ctx.resets.length;
  tick(ctx, 2);
  assert.equal(ctx.resets.length, resumed, '`while` latched: it is the pause, not the stop');
  // MUTANT: "`while` is evaluated once and cached" — both halves of this row red under it
});

test('`while` re-reads a predicate the player CHANGES mid-leg, and compiles the new one', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  T(ctx).setSavedControl('reset:a', 'while', 'false');
  tick(ctx, 2);
  assert.equal(ctx.resets.length, 0);
  T(ctx).setSavedControl('reset:a', 'while', 'true');   // a DIFFERENT source, so a cache keyed on anything else stales
  tick(ctx, 2);
  assert.ok(ctx.resets.length > 0, 'the compiled predicate was cached against something other than its source');
});

// ---- `until` — the LATCHING stop ---------------------------------------------------------------------------------

test('`until` LATCHES: once it has held the feature stays stopped, even after the predicate goes false again', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  // ⚠ A NON-MONOTONE PREDICATE ON PURPOSE. This is the one shape that tells `until` apart from `while`, and it is
  // not exotic: R2 measured PTR's own M16 predicate going false again after a row-3 reset.
  assert.equal(T(ctx).setSavedControl('reset:a', 'until', 'player.a.autoThing === true').ok, true);
  ctx.player.points = new Decimal(1000);
  tick(ctx, 2);
  const before = ctx.resets.length;
  assert.ok(before > 0, 'the feature never acted, so the stop below proves nothing');
  ctx.player.a.autoThing = true;
  tick(ctx, 1);
  const r = rowOf(ctx, 'reset:a');
  assert.equal(r.last.code, 'stopped:until');
  assert.equal(r.last.values.until, 'player.a.autoThing === true');
  const stopped = ctx.resets.length;
  ctx.player.a.autoThing = false;                      // ⛔ THE CONDITION LIFTS AND THE FEATURE DOES NOT
  tick(ctx, 3);
  assert.equal(ctx.resets.length, stopped, '`until` behaved like `while`');
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'stopped:until');
  assert.equal(T(ctx).controlState('reset:a').until.holds, false, 'the predicate really is false again');
  assert.equal(T(ctx).controlState('reset:a').until.stopped, true);
  // MUTANT: "until behaves like while" — the last three rows red
});

test('THE LATCH IS IN THE SAVE, not in runtime memory — which is the only place a reload could find it', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  T(ctx).setSavedControl('reset:a', 'until', 'true');
  ctx.player.points = new Decimal(1000);
  tick(ctx, 1);
  assert.equal(typeof ctx.player.au.edits['reset:a'].untilHit, 'number', 'the latch is not in player.au.edits');
  assert.equal(T(ctx).controlState('reset:a').until.hitAt, ctx.player.au.edits['reset:a'].untilHit);
  // ⛔ AND IT IS NOT IN `runtimeState()`: a record that carried it would make it a property of the PROCESS, and a
  // resumed process is not a reload. (It must also stay out of `hashGame`, which excludes `player.au` — gate V4-5.)
  const rt = T(ctx).runtimeState();
  assert.equal(JSON.stringify(rt).indexOf('untilHit'), -1, 'the latch leaked into the runtime record');
  // MUTANT: "the latch is not saved" — the first two rows red
});

test('RE-ARM is the way back, and it is the only one', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  T(ctx).setSavedControl('reset:a', 'until', 'player.a.autoThing === true');
  ctx.player.points = new Decimal(1000);
  ctx.player.a.autoThing = true;
  tick(ctx, 2);
  const stopped = ctx.resets.length;
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'stopped:until');
  ctx.player.a.autoThing = false;
  assert.equal(T(ctx).rearm('reset:a').ok, true);
  tick(ctx, 2);
  assert.ok(ctx.resets.length > stopped, 're-arming did not start the feature again');
  assert.equal(T(ctx).controlState('reset:a').until.stopped, false);
  // re-arming something that is not stopped is a REFUSAL that says so, not a silent no-op
  const again = T(ctx).rearm('reset:a');
  assert.equal(again.ok, false);
  assert.match(again.error, /not stopped/);
});

test('CLEARING `until` disarms its latch, and CHANGING it re-arms — a stop belongs to its own condition', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  T(ctx).setSavedControl('reset:a', 'until', 'true');
  tick(ctx, 1);
  assert.equal(T(ctx).controlState('reset:a').until.stopped, true);
  T(ctx).setSavedControl('reset:a', 'until', 'player.a.autoThing === true');   // a DIFFERENT condition
  assert.equal(T(ctx).controlState('reset:a').until.stopped, false, 'the latch survived the condition that set it');
  const n = ctx.resets.length;
  tick(ctx, 2);
  assert.ok(ctx.resets.length > n);
  T(ctx).setSavedControl('reset:a', 'until', 'true');
  tick(ctx, 1);
  assert.equal(T(ctx).controlState('reset:a').until.stopped, true);
  T(ctx).setSavedControl('reset:a', 'until', null);                            // cleared
  assert.equal(T(ctx).controlState('reset:a').until.stopped, false);
  assert.equal(ctx.player.au.edits['reset:a'], undefined, 'an entry with nothing left in it should be dropped');
});

test('`until` runs BEFORE `while`: a feature that has stopped says so, not that its gate is false', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  T(ctx).setSavedControl('reset:a', 'until', 'true');
  T(ctx).setSavedControl('reset:a', 'while', 'false');
  tick(ctx, 1);
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'stopped:until');
});

// ---- `priority` — the order a LAYER’s features act in ----------------------------------------------------------

test('PRIORITY DECIDES WHO GETS THE CURRENCY, and the row that sees it is what each one BOUGHT', () => {
  // ⛔ A CONSTRUCTED CONTENTION, and it is the case V1's readouts named: one layer, one purse, two kinds that both
  // want it. 10 points buys EITHER the upgrade (10) OR two buyables (5 each) — so whoever acts first takes it all.
  const K = { autoTable: { kindOrder: ['toggles', 'upgrades', 'buyables', 'challenges', 'clickables', 'reset'],
    policies: { 'upgrades:a': 'cheapest-first', 'buyables:a': 'buy', 'reset:a': 'always' } } };
  const base = bootStub(game(), K); T(base).profile('all');
  base.player.a.points = new Decimal(10);
  tick(base, 1);
  assert.equal(base.player.a.upgrades.join(','), '11', 'the kind order should have let upgrades go first');
  assert.equal(Number(base.player.a.buyables[11]), 0);

  const flipped = bootStub(game(), K); T(flipped).profile('all');
  flipped.player.a.points = new Decimal(10);
  assert.equal(T(flipped).setSavedControl('buyables:a', 'priority', '1').ok, true);
  tick(flipped, 1);
  // ⛔ THE ASSERTION IS THE PURCHASE, NOT A LABEL. A mutant that ignores `priority` and only reports it differently
  // walks straight past a row that checks `controlState()`; it cannot walk past this one.
  assert.equal(Number(flipped.player.a.buyables[11]), 2, 'the buyable did not get the purse first');
  assert.equal(flipped.player.a.upgrades.length, 0, 'the upgrade was bought anyway');
  // MUTANT: "priority ignored" — both rows red
});

test('PRIORITY TIES KEEP THE KIND ORDER, and its DEFAULT is the kind’s own place in this game’s order', () => {
  const K = { autoTable: { kindOrder: ['toggles', 'upgrades', 'buyables', 'challenges', 'clickables', 'reset'] } };
  const ctx = bootStub(game(), K); T(ctx).profile('all');
  assert.equal(T(ctx).controlState('upgrades:a').priority.effective, 2);
  assert.equal(T(ctx).controlState('buyables:a').priority.effective, 3);
  assert.equal(T(ctx).controlState('reset:a').priority.effective, 6);
  assert.equal(T(ctx).controlState('upgrades:a').priority.owner, null, 'an unedited priority must not read as set');

  // the SAME number on two features is a tie, and a tie is the kind order — measured by what each one bought
  ctx.player.a.points = new Decimal(10);
  T(ctx).setSavedControl('upgrades:a', 'priority', '1');
  T(ctx).setSavedControl('buyables:a', 'priority', '1');
  tick(ctx, 1);
  assert.equal(ctx.player.a.upgrades.join(','), '11', 'a tie did not keep the kind order');
  assert.equal(Number(ctx.player.a.buyables[11]), 0);

  // and a table that REORDERS the kinds reorders the defaults with it — no literal anywhere
  const rev = bootStub(game(), { autoTable: { kindOrder: ['reset', 'buyables', 'upgrades', 'toggles', 'challenges', 'clickables'] } });
  T(rev).profile('all');
  assert.equal(T(rev).controlState('reset:a').priority.effective, 1);
  assert.equal(T(rev).controlState('buyables:a').priority.effective, 2);
});

// ---- INERTNESS: nothing edited ⇒ nothing changed ------------------------------------------------------------------

test('NOTHING EDITED: the record, the save key set and the running order are exactly what they were', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  tick(ctx, 20);
  const rt = T(ctx).runtimeState();
  assert.equal(rt.controls, undefined, 'a run that sets no control must write the record it wrote before V4');
  assert.equal(Object.keys(ctx.player.au).sort().join(','), 'armLocked,buyables,challenges,clickables,disclosed,edits,features,milestones,points,unlocked,upgrades');
  assert.equal(Object.keys(ctx.player.au.edits).length, 0, 'a run that edits nothing must leave `edits` empty');
  // every feature reports its kind's place and nothing claims an owner
  for (const r of T(ctx).explain()) if (r.control) {
    assert.equal(r.control.priority.owner, null);
    assert.equal(r.control['while'].owner, null);
    assert.equal(r.control.until.owner, null);
  }
});

test('A RUNTIME override is memory OUTSIDE `player`, rides in `runtimeState()` and outranks the save', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  T(ctx).setSavedControl('reset:a', 'while', 'true');
  T(ctx).setControl('reset:a', 'while', 'false');
  tick(ctx, 2);
  assert.equal(ctx.resets.length, 0, 'the runtime override did not outrank the save');
  assert.equal(T(ctx).controlState('reset:a')['while'].owner, 'runtime');
  const rt = T(ctx).runtimeState();
  assert.equal(JSON.stringify(rt.controls), JSON.stringify({ 'reset:a': { 'while': 'false' } }));
  assert.equal(ctx.player.au.edits['reset:a']['while'], 'true', 'a runtime override must not be written into the save');
  // …and it hands the feature back when cleared
  T(ctx).setControl('reset:a', 'while', null);
  tick(ctx, 1);
  assert.ok(ctx.resets.length > 0);
  assert.equal(T(ctx).runtimeState().controls, undefined);
  // a restore validates what it is given rather than running it
  assert.throws(() => T(ctx).restoreRuntime({ lastReset: {}, loopNo: 0, ranAt: {}, stats: {}, controls: { 'reset:a': { 'while': 'player.a.points.gte(' } } }), /not a JavaScript expression/);
});

test('A SAVED VALUE THIS BUILD CANNOT VALIDATE IS IGNORED, NOT RUN — V2’s rule, and here it is `new Function`', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  ctx.player.points = new Decimal(1000);
  // what a hand-edited or later-version save can look like: it never went through `setSavedControl`
  ctx.player.au.edits['reset:a'] = { 'while': 'this ( is not ( an expression' };
  tick(ctx, 2);
  assert.ok(ctx.resets.length > 0, 'an unparseable saved predicate must fall back, not pause the feature for ever');
  assert.equal(T(ctx).controlState('reset:a')['while'].owner, null);
  ctx.player.au.edits['reset:a'] = { priority: 'banana' };
  assert.equal(T(ctx).controlState('reset:a').priority.owner, null);
  assert.equal(T(ctx).controlState('reset:a').priority.effective, 6);
});

// ---- the view: a predicate is AUTHOR TEXT through `v-html` ---------------------------------------------------------

test('A TYPED PREDICATE IS ESCAPED wherever the block renders it', () => {
  const ctx = boot({ autoTable: { policies: { 'reset:a': 'always' } } });
  T(ctx).profile('all');
  const nasty = 'player.a.points.gte(1) /* <img src=x onerror="alert(1)"> */';
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', nasty).ok, true);
  assert.equal(T(ctx).setSavedControl('reset:a', 'until', nasty).ok, true);
  tick(ctx, 1);
  const html = T(ctx).featureBlockHTML(rowOf(ctx, 'reset:a'), false);
  assert.equal(html.indexOf('<img'), -1, 'the predicate reached v-html unescaped');
  assert.ok(html.indexOf('&lt;img') >= 0, 'the predicate is not rendered at all, so this row measures nothing');
  assert.ok(html.indexOf('onerror=&quot;') >= 0 || html.indexOf('onerror=&#39;') >= 0 || html.indexOf('&quot;alert') >= 0, html.slice(0, 400));
});

test('EVERY new reason code is in the vocabulary, with the values its template consumes', () => {
  const ctx = boot();
  const codeTable = T(ctx).reasonCodes();
  assert.equal(codeTable['stopped:until'].values.sort().join(','), 'at,until');
  assert.equal(codeTable['blocked:predicate'].values.sort().join(','), 'src,which');
  assert.equal(codeTable['blocked:gate'].values.sort().join(','), 'gate,owner');
  // ⚠ and every one of them is a DECISION code: it is what a feature's own path returned, not a second opinion
  assert.ok(!('stopped:until' in T(ctx).watchCodes()), 'a decision code must not also be a watch state word');
});

test('THE HELPERS WRITE PREDICATE TEXT and nothing else — every one is built from what the GAME declares', () => {
  const ctx = boot();
  const hs = T(ctx).predicateHelpers('reset:a');
  assert.ok(hs.length >= 3, JSON.stringify(hs));
  for (const h of hs) {
    assert.equal(typeof h.src, 'string');
    assert.equal(T(ctx).controls()[0].type, 'predicate');
    assert.equal(checkOne(ctx, h.src), null, `the helper ${h.src} is not a predicate this build accepts`);
  }
  assert.ok(hs.some((h) => h.src === "hasMilestone('a', 0)"), 'the layer’s own milestone ids are not offered');
  assert.ok(hs.some((h) => h.src === 'player.a.unlocked'), 'the tree’s own layer ids are not offered');
  // picking one is the same write the text box makes
  assert.equal(T(ctx).setSavedControl('reset:a', 'while', hs[0].src).ok, true);
  assert.equal(T(ctx).savedControl('reset:a', 'while'), hs[0].src);
});
function checkOne(ctx, src) { const r = ctx.tmtLoader.setSavedControl('reset:a', 'while', src); ctx.tmtLoader.setSavedControl('reset:a', 'while', null); return r.ok ? null : r.error; }
