// yield-1 — a reset yields to the game's own auto-reset ONLY where the engine performs it (docs/automation.md, "Where
// features run"). Driven over the stub engine with the ENGINE's own loop body: every roster engine does
// `if (tmp[l].autoPrestige && tmp[l].canReset) doReset(l); if (layers[l].automate) layers[l].automate();`, and five
// engine files skip the whole body for a layer the player has never reset (`if (!unl(layer)) continue`). That skip
// is the one thing a test needs from an engine here, so this file adds it to the stub's loop and nothing else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootStub, tick, rowOf, Decimal } from './stub-engine.mjs';

/** One normal tree layer `a`, its auto-prestige set by `ap`, the reset allowed while its base holds ≥ 100. */
function game(unlocked, ap = true) {
  return {
    a: {
      name: 'alpha', row: 1, type: 'normal', layerShown: () => true,
      startData: () => ({ unlocked, points: new Decimal(0) }),
      tmtStubTemp(tmp, player) {
        const t = tmp.a || (tmp.a = {});
        t.type = 'normal'; t.baseAmount = new Decimal(player.points); t.requires = new Decimal(100); t.nextAt = new Decimal(100);
        t.canReset = t.baseAmount.gte(t.requires); t.autoPrestige = ap; t.resetGain = new Decimal(1);
      },
    },
  };
}
/** The engine's loop body (see the header), with the `unl` skip. Each engine reset is counted apart from the loader's. */
function engine(ctx, { skipLocked = true } = {}) {
  ctx.engineResets = 0;
  ctx.gameLoop = (diff) => {
    ctx.player.timePlayed += diff;
    for (const l in ctx.layers) {
      const tree = !ctx.layers[l].tmtLoaderLayer;
      if (tree && skipLocked && !ctx.player[l].unlocked) continue;
      if (tree && ctx.tmp[l].autoPrestige && ctx.tmp[l].canReset) { ctx.engineResets++; ctx.doReset(l); }
      if (typeof ctx.layers[l].automate === 'function') ctx.layers[l].automate();
    }
  };
  return ctx;
}
// ⚖ the default is `always` until the user rules (tmt-auto.js, yield-1): these tests name the rule they drive
const boot = (unlocked, options = { nativeYield: 'slot' }, ap = true) => {
  const ctx = engine(bootStub(game(unlocked, ap), { options }));
  ctx.tmtLoader.profile('all');
  ctx.player.points = new Decimal(1000);   // canReset TRUE throughout: only the yield can stop the loader
  return ctx;
};
// the stub's objects come from another realm: compare them as plain JSON
const plain = (x) => (x === undefined ? x : JSON.parse(JSON.stringify(x)));
const own = (ctx) => ctx.resets.length - ctx.engineResets;   // the LOADER's resets

test('the SLOT: the engine checked the auto-reset right before it, so the loader yields — and says where', () => {
  const ctx = boot(true);
  tick(ctx, 3);
  assert.equal(ctx.engineResets, 3, 'the engine resets the layer once per tick');
  assert.equal(own(ctx), 0, 'the loader reset a layer the engine resets itself (a double reset)');
  const last = rowOf(ctx, 'reset:a').last;
  assert.equal(last.code, 'yielding:native');
  assert.equal(last.values.at, 'slot');
  assert.deepEqual(plain(ctx.tmtLoader.nativeYieldCounts['reset:a']), { slot: 3, fallback: 0, fallbackReady: 0 });
});

test('the FALLBACK (nativeYield=slot): the engine skipped the layer, so nothing yields — the loader makes the first reset, then the engine takes over', () => {
  const ctx = boot(false);
  tick(ctx, 1);
  assert.equal(ctx.engineResets, 0, 'the engine reset a layer it skips');
  assert.equal(own(ctx), 1, 'the fallback yielded to a reset that does not come');
  assert.equal(rowOf(ctx, 'reset:a').last.code, 'acted:reset');
  assert.equal(ctx.player.a.unlocked, true);
  tick(ctx, 2);   // unlocked now: the engine's own loop body runs, and the slot yields to it
  assert.equal(ctx.engineResets, 2);
  assert.equal(own(ctx), 1);
  assert.equal(rowOf(ctx, 'reset:a').last.values.at, 'slot');
  assert.deepEqual(plain(ctx.tmtLoader.nativeYieldCounts['reset:a']), { slot: 2, fallback: 1, fallbackReady: 1 });
});

test('nativeYield=always — the rule before yield-1 — yields in the fallback too, says so, and the layer never resets', () => {
  const ctx = boot(false, { nativeYield: 'always' });
  tick(ctx, 5);
  assert.equal(ctx.resets.length, 0);
  const last = rowOf(ctx, 'reset:a').last;
  assert.equal(last.code, 'yielding:native');
  assert.equal(last.values.at, 'fallback');
  assert.match(last.text, /decided in: fallback/);
  assert.deepEqual(plain(ctx.tmtLoader.nativeYieldCounts['reset:a']), { slot: 0, fallback: 5, fallbackReady: 5 });
});

test('a vanilla loop (no skip): the slot runs every tick, so `slot` and `always` decide identically', () => {
  const run = (o) => { const c = boot(false, o); engine(c, { skipLocked: false }); tick(c, 4); return [c.engineResets, own(c), rowOf(c, 'reset:a').last.code]; };
  assert.deepEqual(run({ nativeYield: 'slot' }), run({ nativeYield: 'always' }));
  assert.deepEqual(run({ nativeYield: 'slot' }), [4, 0, 'yielding:native']);
});

test('no auto-prestige: nothing is counted and nothing yields', () => {
  const ctx = boot(false, { nativeYield: 'slot' }, false);
  tick(ctx, 1);
  assert.equal(own(ctx), 1);
  assert.equal(ctx.tmtLoader.nativeYieldCounts['reset:a'], undefined);
});

test('a mistyped nativeYield is a hard fail of the load, by name', () => {
  assert.throws(() => boot(true, { nativeYield: 'fallback' }), /option nativeYield must be one of slot, always/);
});

test('⚖ the DEFAULT is the rule before yield-1 (always) until the user rules on the pins slot moves', () => {
  const ctx = boot(false, {});
  tick(ctx, 2);
  assert.equal(ctx.resets.length, 0);
  assert.equal(rowOf(ctx, 'reset:a').last.values.at, 'fallback');
});

test('the slot history survives a runtime round trip; a record from before it starts afresh', () => {
  const ctx = boot(true);
  tick(ctx, 2);
  const rt = ctx.tmtLoader.runtimeState();
  assert.equal(typeof rt.stats.slotAt.a, 'number');
  assert.equal('slotAt' in rt, false, 'yield-1 added a top-level runtime key (it lives inside `stats`)');
  const old = JSON.parse(JSON.stringify(rt)); delete old.stats.slotAt;
  ctx.tmtLoader.restoreRuntime(old);
  assert.deepEqual(plain(ctx.tmtLoader.runtimeState().stats.slotAt), {});
  tick(ctx, 1);
  assert.equal(own(ctx), 0);
});
