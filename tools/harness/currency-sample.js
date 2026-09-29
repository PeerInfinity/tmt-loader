// gates-c1 part 1's per-game drive (boot.mjs --planner-script): the trace's PURITY over every buyable, the regex's
// patterns per buyable (which of the probe's "none" the second pattern recovers), and the UPGRADE measurement.
var P = tmtLoader.planner, pur = P.tracePurity(), pats = [];
for (var l in layers) {
  var L = layers[l];
  if (!L || !L.buyables || typeof L.buyables !== 'object' || L.tmtLoaderLayer) continue;
  for (var id in L.buyables) {
    // C1b: the reader's own shape rule (tmt-planner.js `isBuyableDef`) — a WORD id is a buyable too (Q8)
    if (!P.isBuyableDef(L.buyables[id])) continue;
    var f = L.buyables[id].buy;
    pats.push({ layer: l, id: id, found: typeof f === 'function' ? P.decrementsIn(f, l).map(function (d) { return { how: d.how, path: d.path }; }) : null });
  }
}
// ⚠ COUNTS, not rows: Plague Tree has thousands of upgrades, and a full row list overran the BOOTRESULT line.
var U = P.readUpgrades(), cnt = { agree: 0, contradicted: 0, 'nothing-fell': 0, unscorable: 0 }, contra = [], why = {};
(U.rows || []).forEach(function (r) {
  cnt[r.verdict]++;
  if (r.verdict === 'contradicted' || r.verdict === 'nothing-fell') contra.push({ layer: r.layer, id: r.id, verdict: r.verdict, declared: r.declared, fell: r.truth && r.truth.fell });
  if (r.verdict === 'unscorable') why[r.why] = (why[r.why] || 0) + 1;
});
return { purity: pur, patterns: pats, upgrades: { counts: cnt, contradicted: contra, unscorableWhy: why, error: U.error || null } };
