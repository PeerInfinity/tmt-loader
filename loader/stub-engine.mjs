// A MINIMAL Modding-Tree-shaped engine, enough to run `loader/tmt-auto.js` under `node --test`.
//
// ⛔ WHY IT EXISTS. V1's reason vocabulary has to be WITNESSED code by code, and several codes cannot occur in
// either reference game at any recorded state: ptr's table leaves `challenges` and `clickables` at policy `off`,
// neither table uses `buy-unless-saving` or `keepsUpgrades`, and no table carries a `gates` entry at all. Driving
// those through a real engine means constructing a game; constructing a game means this file.
//
// ⚠ IT IS NOT A SECOND ENGINE AND MUST NOT BECOME ONE. It provides the globals `tmt-auto.js` reads as bare
// identifiers and nothing else, so what the test exercises is the LOADER's decision paths — the same code the two
// real engines run. Anything that needs the engines' own behaviour (`canReset`'s static/normal split, `automate`'s
// per-engine call sites, `Vue.set`) belongs in the page gates, not here.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const REPO = path.resolve(new URL('..', import.meta.url).pathname);

/** The smallest big-number type with the methods the registry calls. Values are ordinary JS numbers. */
export class Decimal {
  // ⚠ NOT `Number(v || 0)`: NaN is falsy, so that quietly turned every NaN into 0 — and a stub that cannot hold
  // a NaN cannot drive the guard that exists for NaNs.
  constructor(v) { this.v = v instanceof Decimal ? v.v : Number(v === undefined || v === null ? 0 : v); }
  gte(o) { return this.v >= new Decimal(o).v; }
  gt(o) { return this.v > new Decimal(o).v; }
  lte(o) { return this.v <= new Decimal(o).v; }
  lt(o) { return this.v < new Decimal(o).v; }
  cmp(o) { const w = new Decimal(o).v; return this.v < w ? -1 : this.v > w ? 1 : 0; }
  times(o) { return new Decimal(this.v * new Decimal(o).v); }
  plus(o) { return new Decimal(this.v + new Decimal(o).v); }
  div(o) { return new Decimal(this.v / new Decimal(o).v); }
  // ⚠ R3a: the challenge give-up rule takes the LOG of a challenge's goal and of its currency, so `log10` is one
  // of "the methods the registry calls" and belongs here. break_eternity returns NaN for `log10(0)`; so does this,
  // and the loader guards the same way against both.
  log10() { return new Decimal(Math.log10(this.v)); }
  toString() { return String(this.v); }
}

/**
 * Boot `loader/tmt-auto.js` over `layers`. Returns the context plus the drivers a test needs.
 * `opts.options` = tmtLoader.options (`--auto-opt`), `opts.autoTable` = the per-game table.
 */
export function bootStub(layers, opts = {}) {
  const ctx = { console, Decimal };
  ctx.globalThis = ctx;
  const player = { timePlayed: 0, points: new Decimal(0), tab: 'none', subtabs: {}, hasNaN: false };
  const tmp = {};
  const fired = { format: 0 };

  const numIds = (o) => Object.keys(o || {}).filter((k) => !isNaN(k)).map(Number).sort((a, b) => a - b);

  Object.assign(ctx, {
    layers, player, tmp,
    format: (x) => { fired.format++; return String(x); },
    hasMilestone: (l, id) => (player[l].milestones || []).indexOf(id) >= 0 || (player[l].milestones || []).indexOf(String(id)) >= 0,
    hasUpgrade: (l, id) => (player[l].upgrades || []).indexOf(id) >= 0,
    canAffordUpgrade: (l, id) => new Decimal(player[l].points).gte(new Decimal(tmp[l].upgrades[id].cost)),
    buyUpgrade(l, id) {
      if (!ctx.canAffordUpgrade(l, id)) return;
      player[l].points = new Decimal(player[l].points).plus(new Decimal(-tmp[l].upgrades[id].cost));
      player[l].upgrades.push(id);
    },
    buyBuyable(l, id) {
      const b = tmp[l].buyables[id];
      if (!b || !b.unlocked || !new Decimal(player[l].points).gte(new Decimal(b.cost))) return;
      player[l].points = new Decimal(player[l].points).plus(new Decimal(-b.cost));
      player[l].buyables[id] = new Decimal(Number(player[l].buyables[id]) + 1);
    },
    clickClickable(l, id) { player[l].clickables[id] = new Decimal(Number(player[l].clickables[id]) + 1); ctx.clicked.push(`${l}:${id}`); },
    // ⚠ R3a FIDELITY FIX. This used to count a COMPLETION on every exit, which no engine does: both engines'
    // `completeChallenge` bails without counting when `canCompleteChallenge` is false (games/ptr/js/game.js:298).
    // It never mattered while nothing could leave a challenge it had not won — and the give-up rule is exactly that,
    // so a stub that counted a give-up as a win would have made the retry rule untestable (the challenge would be
    // complete and never picked again) and the test would have been green on undefined behaviour.
    startChallenge(l, id) {
      if (Number(player[l].activeChallenge) === id) {
        if (ctx.canCompleteChallenge(l, id)) {
          const c = tmp[l] && tmp[l].challenges && tmp[l].challenges[id];
          const lim = c && c.completionLimit !== undefined ? Number(c.completionLimit) : 1;
          if ((player[l].challenges[id] || 0) < lim) player[l].challenges[id] = (player[l].challenges[id] || 0) + 1;
        }
        player[l].activeChallenge = null;
      } else player[l].activeChallenge = id;
    },
    canCompleteChallenge: (l, id) => !!ctx.completable[`${l}:${id}`],
    canEnterChallenge: (l, id) => ctx.enterable[`${l}:${id}`] !== false,
    canExitChallenge: (l, id) => ctx.exitable[`${l}:${id}`] !== false,
    doReset(l) { ctx.resets.push(l); player[l].points = new Decimal(Number(player[l].points) + Number(tmp[l].resetGain || 1)); player[l].unlocked = true; },
    updateTemp() { for (const l in layers) if (typeof layers[l].tmtStubTemp === 'function') layers[l].tmtStubTemp(tmp, player); },
    gameLoop(diff) { player.timePlayed += diff; for (const l in layers) if (typeof layers[l].automate === 'function') layers[l].automate(); },
    addLayer(id, def) { layers[id] = def; player[id] = Object.assign({ upgrades: [], milestones: [], challenges: {}, clickables: {}, buyables: {} }, def.startData ? def.startData() : {}); tmp[id] = { type: def.type }; },
    resets: [], clicked: [], completable: {}, enterable: {}, exitable: {}, fired, numIds,
  });
  ctx.tmtLoader = { id: opts.id || 'stub', automation: true, options: opts.options || {}, autoTable: opts.autoTable, manifest: { headless: {} }, sha256hex: null };
  // what `getStartPlayer()` does: every declared layer gets its startData plus the per-kind stores the engines add.
  for (const l in layers) player[l] = Object.assign({ upgrades: [], milestones: [], challenges: {}, clickables: {}, buyables: {} }, layers[l].startData ? layers[l].startData() : { unlocked: true });
  for (const l in layers) for (const k of ['buyables', 'clickables']) for (const id of numIds(layers[l][k])) player[l][k][id] = new Decimal(0);
  for (const l in layers) for (const id of numIds(layers[l].challenges)) player[l].challenges[id] = 0;
  vm.createContext(ctx);
  ctx.updateTemp();
  vm.runInContext(fs.readFileSync(path.join(REPO, 'loader/tmt-auto.js'), 'utf8'), ctx, { filename: 'loader/tmt-auto.js' });
  return ctx;
}

/** One tick: what `tmtLoader.tick` does, minus the parts a stub has no use for. */
export function tick(ctx, n = 1, diff = 1) { for (let i = 0; i < n; i++) { ctx.updateTemp(); ctx.gameLoop(diff); } }
export const codes = (ctx) => ctx.tmtLoader.explainStats().codes;
export const rowOf = (ctx, id) => ctx.tmtLoader.explain().find((r) => r.id === id);
