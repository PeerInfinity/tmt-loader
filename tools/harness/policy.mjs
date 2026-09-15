// The census's generic policy leg (tmt-fork-census lib/boot.mjs), as SOURCE so the Node boot and the page run the
// same text: before each tick, reset any row-0 layer that can reset, buy every affordable unlocked upgrade.
// A harness input for coverage and the A1 stall measurement — not an automation feature of the loader.
export const CENSUS_POLICY_SRC = `function censusPolicy() {
  for (const l in layers) { const Ly = layers[l]; if (!Ly || !player[l] || !tmp[l]) continue;
    if (Ly.row === 0 && tmp[l].canReset && typeof doReset === 'function') doReset(l);
    if (Ly.upgrades && tmp[l].upgrades) for (const id in Ly.upgrades) { if (isNaN(id)) continue;
      if (tmp[l].upgrades[id] && tmp[l].upgrades[id].unlocked && typeof canAffordUpgrade === 'function' && canAffordUpgrade(l, id) && !hasUpgrade(l, id)) buyUpgrade(l, id); } }
}`;

/**
 * Source of a MONITOR factory (marks, stallSeconds) → {check(), result()} evaluated in the game's global scope after
 * each tick. marks = [[name, fn]]: the first tick each fn is true is recorded with ticks, gameSeconds and the stateJSON
 * at that tick. stallSeconds: the L1 stall detector — progress = a new unlocked layer / upgrade / milestone /
 * achievement / challenge completion / buyable amount; stop once stallSeconds game-seconds pass without progress.
 * WALL_MS: also stop after this much wall-clock time (walled: true).
 * check() returns true when the run should stop (every mark met, the stall window elapsed, or the wall bound).
 */
export const MONITOR_SRC = `(function(MARKS, STALL, WALL_MS, CONTINUE, SEEN){
  const t0 = Date.now(); let walled = false;
  // SEEN (--stall-seen): progress = something NEW EVER — an unlock, upgrade, milestone, achievement or challenge id not
  // held before in this run, or a buyable above its run maximum. Re-buying what a reset took away is not progress
  // (the L1 signature counts it, so a reset-and-rebuy loop never stalls).
  const seen = new Set(), bmax = {};
  const grow = () => { let g = false; const add = (k) => { if (!seen.has(k)) { seen.add(k); g = true; } };
    for (const l in layers) { const P = player[l]; if (!P || layers[l].tmtLoaderLayer) continue;
      if (P.unlocked) add(l + ':u');
      for (const [kind, arr] of [['upg', P.upgrades], ['ms', P.milestones], ['ach', P.achievements]]) for (const id of (arr || [])) add(l + ':' + kind + ':' + id);
      for (const id in (P.challenges || {})) if (Number(P.challenges[id]) > 0) add(l + ':ch:' + id + ':' + P.challenges[id]);
      for (const id in (P.buyables || {})) { const k = l + ':' + id, v = Number(P.buyables[id]); if (v > (bmax[k] ?? 0)) { bmax[k] = v; g = true; } } }
    return g; };
  const sig = () => { const o = []; for (const l in layers) { const P = player[l]; if (!P || layers[l].tmtLoaderLayer) continue;
    o.push(l, P.unlocked ? 1 : 0, (P.upgrades || []).length, (P.milestones || []).length, (P.achievements || []).length,
      JSON.stringify(P.challenges || {}), JSON.stringify(P.buyables || {})); } return o.join('|'); };
  const hits = {}; if (SEEN) grow(); let last = sig(), lastTick = tmtLoader.ticks, lastGs = tmtLoader.gameSeconds, stalled = false;
  return {
    check() {
      for (const [name, fn] of MARKS) if (!hits[name]) { let v = false; try { v = !!fn(); } catch (e) {} if (v) hits[name] = { ticks: tmtLoader.ticks, gameSeconds: tmtLoader.gameSeconds, json: tmtLoader.stateJSON() }; }
      if (STALL) { const moved = SEEN ? grow() : (() => { const s = sig(); const m = s !== last; last = s; return m; })(); if (moved) { lastTick = tmtLoader.ticks; lastGs = tmtLoader.gameSeconds; } else if (tmtLoader.gameSeconds - lastGs >= STALL) { stalled = true; return true; } }
      if (WALL_MS && Date.now() - t0 >= WALL_MS) { walled = true; return true; }
      return !CONTINUE && MARKS.length > 0 && MARKS.every(([n]) => hits[n]);
    },
    result() { return { hits, stalled, walled, lastProgress: { ticks: lastTick, gameSeconds: lastGs } }; },
  };
})`;

/** Source of a function (N, DIFF, POLICY, UNTIL) → {policyErrors, met, untilErrors}, evaluated in the game's global scope. */
export const DRIVE_SRC = `(function(N, DIFF, POLICY, UNTIL){
  const censusPolicy = (${CENSUS_POLICY_SRC});
  let policyErrors = 0, met = false, untilErrors = 0;
  for (let i = 0; i < N; i++) {
    if (POLICY) try { censusPolicy(); } catch (e) { policyErrors++ }
    tmtLoader.tick(DIFF);
    if (UNTIL) { try { if (UNTIL()) { met = true; break; } } catch (e) { untilErrors++ } }
  }
  return { policyErrors, met, untilErrors };
})`;
