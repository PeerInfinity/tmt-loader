// The planner-script `gates-c1c.mjs --part 2` runs BEFORE the ticks of a LIFTED leg (boot.mjs --planner-script): the
// currency reader's own lift, applied to the LIVE state so the automation can reach the word-id purchase things it
// could not reach from fresh play (measured: none in 7200 game-s at diff 1, none in a game-week at diff 60).
// For every WORD-id upgrade / buyable of every tree layer (and a BUTTON — a buyable whose data says `raises`): the layer is unlocked, and the currency it pays in is raised
// to ten times its published cost — an upgrade's DECLARED currency (the engine's canAffordPurchase), a buyable's
// SCORED single field from the generated data. A buyable with no scored field, or a cost that is not a number object,
// is left alone and counted. Enumerated by SHAPE; nothing is named. Runs identically on the BEFORE tree (it uses no
// planner code: the number type is the one `player.points` is an instance of). Returns what it lifted, as JSON.
var C = player.points.constructor, N = function (x) { return x instanceof C ? x : new C(x); };
var lifted = [], skipped = [];
function setPath(p, v) { var parts = p.split('.'), o = player; for (var i = 1; i < parts.length - 1; i++) { if (!o) return false; o = o[parts[i]]; } if (!o) return false; o[parts[parts.length - 1]] = v; return true; }
function getPath(p) { var parts = p.split('.'), o = player; for (var i = 1; i < parts.length; i++) { if (o === undefined || o === null) return undefined; o = o[parts[i]]; } return o; }
function raise(path, cost, what) {
  var c; try { c = N(cost); if (!(c.gt(0))) throw 0; } catch (e) { skipped.push(what + ' (no usable cost)'); return; }
  var cur = getPath(path), want = c.times(10);
  if (cur === undefined) { skipped.push(what + ' (no field ' + path + ')'); return; }
  if (typeof cur === 'number') want = Number(want);
  else if (N(cur).gte(want)) { lifted.push(what + ' → ' + path + ' (already)'); return; }
  setPath(path, want);
  lifted.push(what + ' → ' + path);
}
for (var l in layers) {
  var L = layers[l];
  if (!L || L.tmtLoaderLayer || !player[l] || L.row === undefined || isNaN(L.row)) continue;
  var any = false;
  var U = L.upgrades;
  if (U && typeof U === 'object') for (var k in U) {
    if (!isNaN(k) || !U[k] || typeof U[k] !== 'object' || Array.isArray(U[k])) continue;
    any = true;
    var t = tmp[l] && tmp[l].upgrades && tmp[l].upgrades[k];
    var d = U[k], path = d.currencyInternalName ? (d.currencyLayer ? 'player.' + d.currencyLayer + '.' + d.currencyInternalName : (d.currencyLocation ? null : 'player.' + d.currencyInternalName)) : 'player.' + l + '.points';
    if (!path) { skipped.push(l + ' upgrade ' + k + ' (currencyLocation)'); continue; }
    raise(path, t ? t.cost : d.cost, l + ' upgrade ' + k);
  }
  // ⚠ THE SAME LIFT ON BOTH SIDES: the gate prepends `var LIFT_DATA = <HEAD's games-data>` so the BEFORE tree (whose own
  // data lacks C1c's scores and `raises`) is lifted exactly as HEAD is.
  var D0 = typeof LIFT_DATA !== 'undefined' ? LIFT_DATA : tmtLoader.currencyData;
  var B = L.buyables, data = D0 && D0.buyables && D0.buyables[l];
  if (B && typeof B === 'object') for (var b in B) {
    var e = data && data[b];
    // word ids, and a BUTTON (`raises`) whatever its id — the two things C1c changes the buying of
    if ((!isNaN(b) && !(e && e.raises !== undefined)) || !B[b] || typeof B[b] !== 'object' || Array.isArray(B[b])) continue;
    any = true;
    if (!e || !e.scored || typeof e.pays !== 'string' || e.cost !== 'price') { skipped.push(l + ' buyable ' + b + ' (no scored single-field price)'); continue; }
    var tb = tmp[l] && tmp[l].buyables && tmp[l].buyables[b];
    raise(e.pays, tb ? tb.cost : undefined, l + ' buyable ' + b);
  }
  if (any) player[l].unlocked = true;
}
return { lifted: lifted, skipped: skipped };
