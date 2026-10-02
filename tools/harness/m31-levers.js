// (m31) The LEVERS of a VALUE goal whose producer is a layer's RESET GAIN (the planner-script gates-m31.mjs runs; boot.mjs
// --planner-script, with --queue-runner). The goal is M31's: a layer's TOTAL (player.<l>.total) at a threshold, and what
// raises it is the layer's reset gain (`tmp[l].resetGain`) — a reading of one instant that no template prices, because the
// gain is not produced per tick (no `production` fact; docs/facts.md) and the planner's chain finds no producer for it in
// its 30-s wait (measured at stages/M30).
// The FACTS' MULTIPLIER WALK, measured: the inputs are every numeric field the `multiplier-reads` facts of the layer's
// gain getters read (baseAmount, gainMult), followed through the getters their tmp reads name, PLUS every unlocked
// layer's points and buyable amounts (the sensitivity probe's candidates, docs/facts.md "challenge-inputs") — because the
// gain's base is a STOCK (Generator power) whose producer no fact links to it. Each input is perturbed (×10 + 1; +1 for
// a buyable) on the copy, the hold `M31_OPTS.hold` (the resets that would spend the gain) is placed, the copy is ticked
// `M31_OPTS.k` ticks, and the gain read against the same run unperturbed. The elasticity e = Δlog10 gain per order of the
// input; an input that moves it is a LEVER, and its distance to the goal is log10(target ÷ gain at the window's end) ÷ e
// orders of the input (a first-order reading; the leading few are then bisected on the copy).
// Harness-only. Prepended by the caller: `var M31_OPTS = {layer, target, k, hold, facts, bisect}`.
var O = typeof M31_OPTS === 'object' ? M31_OPTS : {};
var T = tmtLoader, P = T.planner, F = O.facts || { facts: [] }, L = O.layer, K = Number(O.k || 100), DIFF = Number(O.diff || 1);
var lv = function (x) { return x && x.variants ? x.variants[x.variants.length - 1] : x; };
var byId = {}; F.facts.forEach(function (x) { byId[x.id] = x; });
var lg = function (x) { try { var d = new Decimal(x); return d.lte(0) ? -Infinity : Number(d.log10()); } catch (e) { return NaN; } };
var get = P.get;
function set(path, v) { var p = path.split('.'), o = player; for (var i = 1; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; }
// ---- the walk over the facts: the gain getters' reads, through the tmp getters they name ----------------------------
var seen = {}, inputs = {}, queue = [['reads:' + L + ':baseAmount', 0], ['reads:' + L + ':gainMult', 0]];
while (queue.length) {
  var it = queue.shift(), id = it[0], d = it[1];
  if (seen[id] || d > 4) continue; seen[id] = 1;
  var f = lv(byId[id]); if (!f) continue;
  (f.reads || []).forEach(function (p) { if (!inputs[p]) inputs[p] = { via: id }; });
  (f.tmpReads || []).forEach(function (t) {
    var m = /^tmp\.([^.]+)\.([^.]+)$/.exec(t), n = /^tmp\.([^.]+)\.(upgrades|buyables|challenges|milestones|impr)\.([^.]+)\.(\w+)/.exec(t);
    if (m) queue.push(['reads:' + m[1] + ':' + m[2], d + 1]);
    else if (n) queue.push(['reads:' + n[1] + ':' + n[2] + '.' + n[3] + '.' + n[4], d + 1]);
  });
}
// + every unlocked layer's points and buyable amounts (the base is a stock no fact links to its producer)
Object.keys(layers).forEach(function (l) {
  if (!player[l] || !player[l].unlocked || !layers[l] || layers[l].tmtLoaderLayer) return;
  if (player[l].points !== undefined && !inputs['player.' + l + '.points']) inputs['player.' + l + '.points'] = { via: 'an unlocked layer\'s points' };
  Object.keys(player[l].buyables || {}).forEach(function (b) { var p = 'player.' + l + '.buyables.' + b; if (!inputs[p] && layers[l].buyables && layers[l].buyables[b]) inputs[p] = { via: 'an unlocked layer\'s buyable' }; });
});
var names = Object.keys(inputs).filter(function (p) { var v = get(p); return v !== undefined && v !== null && (typeof v === 'number' || (typeof v === 'object' && typeof v.log10 === 'function')); }).sort();
// ---- the measurement ------------------------------------------------------------------------------------------------
var holdQ = function (id) { return { format: 'tmt-queue/1', id: id, source: 'authored', steps: [{ 'do': 'hold', features: O.hold }, { 'do': 'wait', until: 'false', timeout: { gs: K * DIFF + 10 }, onTimeout: 'abort' }] }; };
function gainAfter(perturb) {
  return P.excursion(function () {
    if (perturb) perturb();
    for (var z = 0; z < P.settlePasses; z++) updateTemp();
    var r = T.queues.load(holdQ('m31-levers')); if (!r.ok) throw new Error(r.errors.join('; '));
    T.tick(DIFF, K);
    return { gain: String(tmp[L].resetGain), total: String(player[L].total) };
  });
}
var base = gainAfter(null), g0 = lg(base.gain), need = lg(O.target) - g0, out = [];
for (var i = 0; i < names.length; i++) {
  var p = names[i], v0 = get(p), isBuy = /\.buyables\./.test(p), isNum = typeof v0 === 'number';
  var mk = function (x) { return isNum ? Number(x) : new Decimal(x); };
  var step = isBuy ? [1, 'plus one'] : [10, '×10+1'];
  var r1;
  try { r1 = gainAfter(function () { var cur = get(p); set(p, isBuy ? mk(new Decimal(cur).plus(1)) : mk(new Decimal(cur).times(10).plus(1))); }); }
  catch (e) { out.push({ input: p, via: inputs[p].via, threw: String(e && e.message || e).slice(0, 120) }); continue; }
  var dg = lg(r1.gain) - g0;
  if (!isFinite(dg) || Math.abs(dg) < 1e-9) continue;
  var row = { input: p, via: inputs[p].via, held: String(v0), step: step[1], gainMovesLog10: Math.round(dg * 1e4) / 1e4 };
  if (dg > 0) {
    // first-order: orders of the input (×10 steps), or units (+1 steps), to close log10(target ÷ gain)
    row.firstOrder = isBuy ? { units: Math.round(need / dg * 100) / 100 } : { ordersOfInput: Math.round(need / dg * 100) / 100 };
    row.distanceLog10 = isBuy ? null : Math.round(need / dg * 100) / 100;
  }
  out.push(row);
}
out.sort(function (a, b) { var x = a.distanceLog10, y = b.distanceLog10; if (x === undefined || x === null) return 1; if (y === undefined || y === null) return -1; return x - y; });
return { layer: L, target: O.target, k: K, diff: DIFF, hold: O.hold, base: base, needLog10: Math.round(need * 1e4) / 1e4, walked: Object.keys(seen).filter(function (s) { return byId[s]; }), candidates: names.length, levers: out, hashGame: P.hashes().hashGame };
