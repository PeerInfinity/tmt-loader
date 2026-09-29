// gates-c1 part 2's per-game drive (boot.mjs --planner-script): the decrement PATTERNS each buyable's buy() matches,
// by pattern name — so the second pattern's recovery of the probe's "none" is counted, not estimated.
var P = tmtLoader.planner, pats = [];
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
return { patterns: pats };
