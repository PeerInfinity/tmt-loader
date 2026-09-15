// The census's generic policy leg (tmt-fork-census lib/boot.mjs), as SOURCE so the Node boot and the page run the
// same text: before each tick, reset any row-0 layer that can reset, buy every affordable unlocked upgrade.
// A harness input for coverage and the A1 stall measurement — not an automation feature of the loader.
export const CENSUS_POLICY_SRC = `function censusPolicy() {
  for (const l in layers) { const Ly = layers[l]; if (!Ly || !player[l] || !tmp[l]) continue;
    if (Ly.row === 0 && tmp[l].canReset && typeof doReset === 'function') doReset(l);
    if (Ly.upgrades && tmp[l].upgrades) for (const id in Ly.upgrades) { if (isNaN(id)) continue;
      if (tmp[l].upgrades[id] && tmp[l].upgrades[id].unlocked && typeof canAffordUpgrade === 'function' && canAffordUpgrade(l, id) && !hasUpgrade(l, id)) buyUpgrade(l, id); } }
}`;

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
