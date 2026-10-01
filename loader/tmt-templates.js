// loader/tmt-templates.js — STRATEGY TEMPLATES (tpl1; docs/templates.md): engine-generic code that reads a game's FACTS
// (`games-facts/<id>.json`, docs/facts.md), proposes a plan, CHECKS it on the planner's rolled-back copy, and writes it
// as a QUEUE (`tmt-queue/1`, docs/queues.md) — or, when no queue can work, names the nearest lever as a sub-goal.
//
// ⚖ The rulings it rests on (PTR-strategy design notes §5, §11, §12, §14):
//  · strategies are DERIVED from data; a queue is their output (a hand-written queue is the escape hatch, `authored`);
//  · NO game id, layer id or item id appears here: a template matches FACT PATTERNS, and every id it writes into a
//    queue comes from a fact or from the engine;
//  · templates PROPOSE, the rollback CHECKS (§12): the static reading of the facts gets the DIRECTION right and the
//    MOMENT wrong (the multiplier itself grows during a held run), so every number a verdict rests on is measured on
//    the copy, and a "buy" verdict is played on the copy before it is believed.
//
// HARNESS-ONLY, like the planner it extends: loaded after loader/tmt-planner.js (`--templates`), and it needs the queue
// runner (loader/tmt-queue.js) to play a plan on the copy. The page never fetches it.
//
// THE INTERFACE (a first cut of §10.3, changed where the check needed it — docs/templates.md says why):
//   { id, needs: [fact kinds],
//     match(facts, opts)      → [binding]   — the fact pattern, against the live state (unlocked, not yet owned);
//     check(binding, opts)    → verdict     — static reading, then the rollback; a buy is CONFIRMED by playing the plan;
//     plan(binding, verdict)  → queue|null  — pure: the verdict's measured moment written as steps }
(function () {
  var T = globalThis.tmtLoader;
  var P = T && T.planner;
  if (!P || P.templates) return;
  var G = globalThis;

  // ---- numbers: the game's own type (the planner's rule: whatever `player.points` is) -------------------------------
  function NT() { var p = player.points; return p && typeof p === 'object' && typeof p.constructor === 'function' ? p.constructor : null; }
  function N(x) { var C = NT(); return C && x instanceof C ? x : new C(x === undefined || x === null ? 0 : x); }
  function lg(x) {
    if (typeof x === 'number') return x > 0 ? Math.log10(x) : -Infinity;
    try { var d = N(x); return d.lte(0) ? -Infinity : Number(d.log10()); } catch (e) { return NaN; }
  }
  function r4(x) { return isFinite(x) ? Math.round(x * 1e4) / 1e4 : x; }
  function sig(x) { return isFinite(x) ? Number(Number(x).toPrecision(6)) : String(x); }
  function settle() { for (var z = 0; z < P.settlePasses; z++) updateTemp(); }
  function getPath(path) { return P.get(path); }
  function setPath(path, v) {
    var parts = String(path).split('.'), o = player;
    for (var i = 1; i < parts.length - 1; i++) { if (o === undefined || o === null) return false; o = o[parts[i]]; }
    if (o === undefined || o === null) return false;
    o[parts[parts.length - 1]] = v; return true;
  }
  function isNum(v) { var C = NT(); return typeof v === 'number' || (!!C && v instanceof C); }
  // `player.<layer>.<…>` → the layer: the TMT contract (player[layer] is the layer's data), not game knowledge
  function layerOfPath(path) { var p = String(path).split('.'); return p[0] === 'player' && p.length > 2 && G.layers[p[1]] ? p[1] : null; }

  // ---- facts: lookups by KIND and by the fields they name, never by a game's ids -----------------------------------
  function variantsOf(f) { return f && f.variants ? f.variants : f ? [f] : []; }
  function lastVariant(f) { var v = variantsOf(f); return v.length ? v[v.length - 1] : null; }
  function byKind(facts, kind) { return (facts.facts || []).filter(function (f) { return f.kind === kind && !f.abstain; }); }
  function factById(facts, id) { var a = facts.facts || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  // ---- the item: its declaration, read LIVE (a closed tab's `tmp` is stale in the PTR family — R3c) ------------------
  var GROUP = { upgrade: 'upgrades', buyable: 'buyables' };
  function itemOf(fact) {
    var it = fact.item || {};
    for (var k in GROUP) if (it[k] !== undefined) return { layer: it.layer, kind: k, id: it[k] };
    return null;
  }
  function declOf(item) { var L = G.layers[item.layer]; var g = L && L[GROUP[item.kind]]; return g ? g[item.id] : null; }
  function livePrice(item) { var d = declOf(item); if (!d) return undefined; return typeof d.cost === 'function' ? d.cost.call(d) : d.cost; }
  // ⛔ THE PRICE THE ENGINE CHARGES is not the live declaration's. `buyUpg` checks and subtracts `tmp[l].upgrades[id].cost`
  // (2.2.1 utils.js:734-736), which `updateTemp` computed at the START of the tick — before this tick's updates moved
  // the field it reads (q.time). So in a tick's queue slot the purchase compares this tick's purse with LAST tick's
  // field value, and "currency ÷ tmp cost" read after a tick IS the engine's own affordability (canAffordUpgrade), while
  // currency ÷ the live price is one tick too strict. Measured (tpl1): from ptr's tick 76,878, at the end of tick 76,930
  // energy ÷ live = 0.922 and energy ÷ tmp = 0.9991 (canAffordUpgrade false); the reflex bought q22 in tick 76,931.
  // ⚠ `tmp` IS refreshed every tick for an upgrade's cost whatever tab is open (temp.js:96 skips only display /
  // description / `unlocked`) — the closed-tab trap is about `unlocked`, which is still read live (`unlockedLive`).
  function chargedPrice(item) {
    var t = G.tmp && G.tmp[item.layer] && G.tmp[item.layer][GROUP[item.kind]] && G.tmp[item.layer][GROUP[item.kind]][item.id];
    return t && t.cost !== undefined && t.cost !== null && typeof t.cost !== 'function' ? t.cost : livePrice(item);
  }
  // the engine's own affordability rule, where it has one (TMT contract names); currency ≥ the charged price otherwise
  function affordable(item, currency) {
    if (item.kind === 'upgrade' && typeof canAffordUpgrade === 'function') { try { return !!canAffordUpgrade(item.layer, item.id); } catch (e) { /* fall through */ } }
    try { return N(getPath(currency)).gte(chargedPrice(item)); } catch (e) { return false; }
  }
  function owned(item) {
    if (item.kind === 'upgrade') return typeof hasUpgrade === 'function' ? !!hasUpgrade(item.layer, item.id) : (player[item.layer].upgrades || []).map(String).indexOf(String(item.id)) >= 0;
    return false;   // a buyable is never "owned": the template buys its next level, and `owned` is the upgrade question
  }
  function unlockedLive(item) {
    var d = declOf(item); if (!d) return false;
    if (!player[item.layer] || !player[item.layer].unlocked) return false;
    if (d.unlocked === undefined) return true;
    try { return !!(typeof d.unlocked === 'function' ? d.unlocked.call(d) : d.unlocked); } catch (e) { return false; }
  }
  function goalId(item) { return (item.kind === 'upgrade' ? 'upg' : 'buy') + ':' + item.layer + ':' + item.id; }
  function argId(id) { return isNaN(id) ? String(id) : Number(id); }
  // the engine's own entry point for the purchase (TMT contract names)
  function buyCall(item) { return item.kind === 'upgrade' ? 'buyUpgrade' : 'buyBuyable'; }

  // ---- time-priced-purchase ------------------------------------------------------------------------------------------
  // The pattern: an item whose PRICE has a power/exponential shape in a field F; a PRODUCTION fact for its currency in F;
  // and the resets that ZERO F. Holding those resets lets F grow; the question the check answers is whether the purse
  // catches the price while it does, when, and — when it never does — what would have to change.
  var TPP = { id: 'time-priced-purchase', needs: ['price', 'production', 'zeroed-by', 'multiplier-reads'] };
  // (m28) the tick every copy-side measurement runs at: `opts.diff` (default 1, the harness's reachability ruler). The
  // charged price is `tmp`'s, computed at the tick's START, so how far it lags the live price is the tick's size —
  // at diff 1 a price ∝ (F+1)^k is charged at F−1 (a factor 2^k on the first tick after F is zeroed), at the page's
  // 0.05 at F−0.05. A verdict is a claim about ONE tick size, and it says which.
  var DIFF = 1;

  /** The features a hold must cover: every feature that calls a reset which zeroes F (its `reset` and its
   *  `challenges` feature — entering or leaving a challenge resets the layer), and the item's own purchase feature
   *  (the purchase is the queue's, at the moment the rollback chose; and a reflex must not spend the purse first). */
  function holdSet(resets, item) {
    var out = [];
    for (var i = 0; i < (T.features || []).length; i++) {
      var f = T.features[i];
      if (resets.indexOf(f.layer) >= 0 && (f.kind === 'reset' || f.kind === 'challenges')) out.push(f.id);
      else if (f.layer === item.layer && f.kind === GROUP[item.kind]) out.push(f.id);
    }
    return out;
  }

  TPP.match = function (facts, opts) {
    opts = opts || {};
    var out = [], prices = byKind(facts, 'price');
    // the FUNNEL: where each candidate dropped out — so "no match" says why, by name (O3)
    var fun = opts.funnel || {};
    fun.prices = prices.length; fun.shapedInAField = 0; fun.withProduction = 0; fun.withZeroingReset = 0;
    for (var i = 0; i < prices.length; i++) {
      var pf = prices[i], item = itemOf(pf), pcur = pf.currency || (lastVariant(pf) || {}).currency;
      if (!item || !pcur || pf.parts) continue;
      if (opts.goal && goalId(item) !== opts.goal) continue;
      var pv = lastVariant(pf), shapes = (pv && pv.shapes) || {};
      for (var F in shapes) {
        var sh = shapes[F];
        if (!sh || (sh.type !== 'power' && sh.type !== 'exponential') || F === pcur) continue;
        fun.shapedInAField++;
        var prod = factById(facts, 'production:' + pcur + ':' + F);
        if (!prod) continue;
        fun.withProduction++;
        var zs = byKind(facts, 'zeroed-by').filter(function (z) { return z.field === F && (z.effect || (lastVariant(z) || {}).effect) === 'zeroes'; });
        if (!zs.length) continue;
        fun.withZeroingReset++;
        var resets = zs.map(function (z) { return z.reset; });
        // the live state: the item is unlocked and not yet owned — a fact says what the game IS, the state says what is open
        var live = unlockedLive(item), have = live ? owned(item) : false;
        out.push({ template: TPP.id, goal: goalId(item), item: item, currency: pcur, field: F, priceShape: sh,
          facts: { price: pf.id, production: prod.id, zeroedBy: zs.map(function (z) { return z.id; }) },
          resets: resets, hold: holdSet(resets, item), open: live && !have, why: !live ? 'the item is not unlocked here' : have ? 'the item is already owned here' : null });
      }
    }
    return out;
  };

  // one tick's increment of the currency, automation OFF (what the game pays by itself), on the copy
  function increment(currency) {
    return P.excursion(function () {
      T.profile('off');
      var a = N(getPath(currency));
      T.tick(DIFF, 1);
      return N(getPath(currency)).sub(a);
    });
  }
  // a queue that only HOLDS (and waits for nothing) — the copy's held run is played by the same runner a plan is
  function holdQueue(id, hold, gs) {
    return { format: 'tmt-queue/1', id: id, source: { template: TPP.id, purpose: 'measurement on the copy' },
      steps: [{ 'do': 'hold', features: hold }, { 'do': 'wait', until: 'false', timeout: { gs: gs }, onTimeout: 'abort' }] };
  }
  function needRunner() { if (!T.queues || !T.queues.ready) throw new Error('time-priced-purchase: the queue runner is not loaded (--queue-runner)'); }

  /** The held run on the copy: currency ÷ live price every tick for `horizon` game-seconds. */
  function heldRun(b, horizon) {
    return P.excursion(function () {
      var r = T.queues.load(holdQueue('tpl-measure', b.hold, horizon + 10));
      if (!r.ok) throw new Error('the measurement queue was refused: ' + r.errors.join('; '));
      var s = [], best = null, first = null, n = Math.round(horizon / DIFF);
      for (var k = 1; k <= n; k++) {
        T.tick(DIFF, 1);
        var cur = getPath(b.currency), price = chargedPrice(b.item);
        var L = lg(cur) - lg(price), fv = Number(getPath(b.field)), can = affordable(b.item, b.currency);
        var row = { k: k, tick: T.ticks, field: sig(fv), ratioLog10: r4(L), liveLog10: r4(lg(cur) - lg(livePrice(b.item))) };
        if (can) row.affordable = true;
        s.push(row);
        if (best === null || L > best.ratioLog10) best = row;
        if (first === null && can) first = row;
        if (owned(b.item)) { row.owned = true; break; }
      }
      return { samples: s, peak: best, firstAffordable: first };
    });
  }

  /** Play a queue on the copy until it ends (or `limit` ticks): did it buy, and on which tick. */
  function playOnCopy(b, q, limit) {
    return P.excursion(function () {
      var r = T.queues.load(q);
      if (!r.ok) return { played: false, refused: r.errors };
      var at = null, st = null;
      for (var k = 1; k <= limit; k++) {
        T.tick(DIFF, 1);
        if (at === null && owned(b.item)) at = { tick: T.ticks, gameSeconds: T.gameSeconds, field: sig(Number(getPath(b.field))) };
        st = T.queues.status().queues.filter(function (x) { return x.id === q.id; })[0];
        if (st && st.state !== 'armed' && st.state !== 'running') break;
      }
      return { played: true, bought: at !== null, at: at, state: st ? st.state : null, outcome: st ? st.outcome : null };
    });
  }

  // ---- the multiplier chain (§14): which getter multiplies the production, and what would have to move ---------------
  // A getter G is a MULTIPLIER of the production when scaling its value by 2 and by 4 scales one tick's increment by
  // 2^p and 4^p (a power p); it is an EXPONENT-like input when the increment moves but not as a power of the scale.
  function sensitivity(currency, layer, fn) {
    var L = G.layers[layer], orig = L[fn];
    function incWith(k) {
      return P.excursion(function () {
        if (k !== 1) L[fn] = function () { return N(orig.apply(this, arguments)).times(k); };
        try { settle(); T.profile('off'); var a = N(getPath(currency)); T.tick(DIFF, 1); return N(getPath(currency)).sub(a); }
        finally { L[fn] = orig; }
      });
    }
    var i1 = lg(incWith(1)), i2 = lg(incWith(2)), i4 = lg(incWith(4));
    if (!isFinite(i1) || !isFinite(i2) || !isFinite(i4)) return { kind: 'unreadable' };
    var d2 = i2 - i1, d4 = i4 - i1;
    if (Math.abs(d2) < 1e-9 && Math.abs(d4) < 1e-9) return { kind: 'none' };
    if (Math.abs(d4 - 2 * d2) <= 1e-6 * Math.max(1, Math.abs(d4))) return { kind: 'multiplier', power: r4(d2 / Math.log10(2)) };
    return { kind: 'exponent', d2: r4(d2), d4: r4(d4) };
  }
  function getterValue(layer, fn) { var L = G.layers[layer]; return L[fn].call(L); }
  // the inputs a getter reads that a lever can MOVE: numeric player fields, its own and through the item effects it reads
  function inputsOf(facts, gf) {
    var v = lastVariant(gf) || {}, out = [], seen = {};
    function add(path, via) { if (seen[path]) return; var x = getPath(path); if (!isNum(x)) return; seen[path] = 1; out.push({ path: path, via: via }); }
    (v.reads || []).forEach(function (p) { add(p, null); });
    (v.tmpReads || []).forEach(function (t) {
      var m = /^tmp\.([^.]+)\.(upgrades|buyables|challenges|milestones)\.([^.]+)\.(\w+)$/.exec(t);
      if (!m) return;
      var sub = factById(facts, 'reads:' + m[1] + ':' + m[2] + '.' + m[3] + '.' + m[4]);
      if (sub) (lastVariant(sub).reads || []).forEach(function (p) { add(p, sub.id); });
    });
    return out;
  }
  /** The smallest value of `path` at which the getter reaches `target` (log-space bracket + bisection, on the copy). */
  function thresholdFor(path, layer, fn, target) {
    return P.excursion(function () {
      var x0 = getPath(path), asNum = typeof x0 === 'number';
      var lo = Math.max(lg(x0), 0), tgt = lg(target);
      function at(l) { setPath(path, asNum ? Math.pow(10, l) : N(10).pow(l)); settle(); return lg(getterValue(layer, fn)) >= tgt; }
      var step = 0.25, hi = lo + step, n = 0;
      while (!at(hi)) { lo = hi; step *= 2; hi = lo + step; if (++n > 14 || hi > 4000) return { reachable: false, why: 'the getter does not reach the target by moving ' + path + ' alone (tried to 10^' + r4(hi) + ')' }; }
      for (var i = 0; i < 48; i++) { var mid = (lo + hi) / 2; if (at(mid)) hi = mid; else lo = mid; }
      return { reachable: true, log10: r4(hi), value: sig(Math.pow(10, hi)) };
    });
  }
  // the largest log10 shortfall along a value goal's chain (the knowledge walk's hops): the binding wall
  function chainDistance(path, threshold, K) {
    var ch = P.chainFor({ id: 'value:' + path, dimension: path, threshold: String(threshold) }, K);
    var worst = null, why = null;
    (ch.hops || []).forEach(function (h) {
      var cands = [];
      if (h.threshold !== undefined && h.threshold !== null && h.held !== undefined && h.held !== null) cands.push([lg(h.threshold) - lg(h.held), h.dimension + ' ' + h.held + ' → ' + h.threshold]);
      var im = h.impossible || h.pending;
      if (im && (im.resetAt || im.requires) && im.baseAmount) cands.push([lg(im.resetAt || im.requires) - lg(im.baseAmount), (im.layer || '?') + ' needs ' + (im.resetAt || im.requires) + ' in ' + (im.requiresDimension || '?') + ', has ' + im.baseAmount]);
      cands.forEach(function (c) { if (isFinite(c[0]) && (worst === null || c[0] > worst)) { worst = c[0]; why = c[1]; } });
    });
    return { distanceLog10: worst === null ? null : r4(worst), binding: why, firstImpossible: ch.firstImpossible || null, hops: (ch.hops || []).length };
  }

  // (m28) An input the SAME resets zero as F, still at zero at the peak, cannot be raised AT the peak: the run that would
  // raise it is the run that raises F, so the moment moves (and the price with it). Read off the facts: every reset in
  // the binding has a `zeroed-by:<reset>:<input>` fact that zeroes. Measured on ptr (m28/QL6, diff 1): q31's held run
  // peaks one tick after the reset (q.time 1), where Super Boosters are 0 — zeroed by h, o, q, ss exactly like q.time —
  // and the walk priced "sb 0 → 4.27" as the nearest lever.
  function zeroedAtPeak(facts, b, input, held) {
    var all = b.resets.length > 0 && b.resets.every(function (r) {
      var z = factById(facts, 'zeroed-by:' + r + ':' + input);
      return !!z && (z.effect || (lastVariant(z) || {}).effect) === 'zeroes';
    });
    var zero = false; try { zero = N(held).lte(0); } catch (e) { zero = false; }
    return all && zero ? 'zeroed by every reset that zeroes ' + b.field + ' (' + b.resets.join(', ') + '), and still 0 at the peak: raising it moves the moment' : null;
  }

  function leverWalk(facts, b, peakK, R, E, kp, opts) {
    // replay the held run to the PEAK on the copy and read the chain there: that is where the shortfall was measured
    return P.excursion(function () {
      T.queues.load(holdQueue('tpl-peak', b.hold, peakK * DIFF + 10));
      T.tick(DIFF, peakK);
      T.queues.unload('tpl-peak');
      var layer = layerOfPath(b.currency), getters = byKind(facts, 'multiplier-reads').filter(function (g) {
        var fn = (lastVariant(g) || {}).fn || g.fn || {};
        return fn.layer === layer && !fn.group && G.layers[layer] && typeof G.layers[layer][fn.fn] === 'function';
      });
      var levers = [], tested = [];
      var K = P.knowledge({ k: Number(opts.leverK || 30) });
      for (var i = 0; i < getters.length; i++) {
        var gf = getters[i], fn = (lastVariant(gf).fn || gf.fn).fn, sen;
        try { sen = isNum(getterValue(layer, fn)) ? sensitivity(b.currency, layer, fn) : { kind: 'not-a-number' }; }
        catch (e) { sen = { kind: 'threw', error: String(e && e.message || e).slice(0, 120) }; }
        tested.push({ getter: layer + '.' + fn, fact: gf.id, sensitivity: sen });
        if (sen.kind === 'multiplier') {
          var g0 = getterValue(layer, fn), need = Math.pow(R, 1 / sen.power), target = N(g0).times(need);
          var ins = inputsOf(facts, gf);
          for (var j = 0; j < ins.length; j++) {
            var th = thresholdFor(ins[j].path, layer, fn, target), held = getPath(ins[j].path);
            var lev = { kind: 'multiplier', getter: layer + '.' + fn, power: sen.power, factor: sig(need), input: ins[j].path, via: ins[j].via, held: String(held) };
            if (!th.reachable) { lev.reachable = false; lev.why = th.why; levers.push(lev); continue; }
            lev.need = th.value; lev.moveLog10 = r4(th.log10 - Math.max(lg(held), 0));
            var cd = chainDistance(ins[j].path, th.value, K);
            lev.distanceLog10 = cd.distanceLog10 === null ? lev.moveLog10 : Math.max(lev.moveLog10, cd.distanceLog10);
            lev.binding = cd.distanceLog10 !== null && cd.distanceLog10 > lev.moveLog10 ? cd.binding : ins[j].path + ' ' + String(held) + ' → ' + th.value;
            var zp = zeroedAtPeak(facts, b, ins[j].path, held);
            if (zp) lev.zeroedAtPeak = zp;
            levers.push(lev);
          }
        } else if (sen.kind === 'exponent') {
          // an exponent-like input: the lever is ONE more unit of what it reads; a buyable's next level has a price
          var ins2 = inputsOf(facts, gf);
          for (var q = 0; q < ins2.length; q++) {
            var m = /^player\.([^.]+)\.buyables\.([^.]+)$/.exec(ins2[q].path);
            var lev2 = { kind: 'exponent', getter: layer + '.' + fn, input: ins2[q].path, held: String(getPath(ins2[q].path)), flips: E + 2 > kp };
            var zp2 = zeroedAtPeak(facts, b, ins2[q].path, getPath(ins2[q].path));
            if (zp2) lev2.zeroedAtPeak = zp2;
            if (!m) { lev2.distanceLog10 = null; lev2.why = 'no price is known for one more unit of ' + ins2[q].path; levers.push(lev2); continue; }
            var bi = { layer: m[1], kind: 'buyable', id: m[2] }, pfact = factById(facts, 'price:' + m[1] + ':buyable:' + m[2]);
            var cost = livePrice(bi), cur = pfact ? (pfact.currency || (lastVariant(pfact) || {}).currency || null) : null;
            lev2.need = 'one more level, costing ' + String(cost) + (cur ? ' of ' + cur : '');
            lev2.currency = cur; lev2.cost = String(cost);
            lev2.distanceLog10 = cur ? r4(lg(cost) - lg(getPath(cur))) : null;
            lev2.binding = cur ? cur + ' ' + String(getPath(cur)) + ' → ' + String(cost) : 'the buyable\'s currency is unknown';
            levers.push(lev2);
          }
        }
      }
      levers.sort(function (a, c) {
        if (!a.zeroedAtPeak !== !c.zeroedAtPeak) return a.zeroedAtPeak ? 1 : -1;     // (m28) never ahead of a lever the peak can use
        var da = a.distanceLog10, dc = c.distanceLog10;
        if (da === null || da === undefined) return 1; if (dc === null || dc === undefined) return -1;
        return da - dc;
      });
      return { levers: levers, tested: tested, at: { tick: T.ticks, field: sig(Number(getPath(b.field))) } };
    });
  }

  TPP.check = function (b, opts) {
    opts = opts || {};
    needRunner();
    DIFF = Number(opts.diff) || 1;
    var why = [], hash0 = P.hashes().hashGame;
    if (!b.open) return { template: TPP.id, goal: b.goal, verdict: 'abstain', reasoning: [b.why], queue: null };
    // ---- 1. the STATIC reading (the facts, re-measured at this instant) -------------------------------------------
    var priceShape = P.facts.shapeIn(b.field, function () { return livePrice(b.item); });
    var incShape = P.facts.shapeIn(b.field, function () { return increment(b.currency); });
    var kp = priceShape.type === 'power' ? Number(priceShape.exponent) : null;
    var E = incShape.type === 'power' ? Number(incShape.exponent) : null;
    var stat = { price: priceShape, increment: incShape, priceExponent: kp, productionExponent: E, integratedExponent: E === null ? null : r4(E + 1) };
    if (kp !== null && E !== null) {
      stat.direction = E + 1 > kp ? 'waiting-helps' : 'peaks';
      stat.formulaPeakT = E + 1 < kp ? r4((E + 1) / (kp - E - 1)) : null;
      why.push('static (re-measured here): the price grows as (' + b.field + '+' + (priceShape.offset || 0) + ')^' + kp + ', the purse as ' + b.field + '^' + r4(E + 1) + ' — ' + (stat.direction === 'peaks' ? 'the ratio PEAKS (formula: at ' + b.field + ' ≈ ' + stat.formulaPeakT + ')' : 'the exponent is flipped: waiting helps'));
    } else why.push('static: no power shape to compare (' + priceShape.type + ' / ' + incShape.type + '); the rollback decides alone');
    // ---- 2. the ROLLBACK: hold the resets that zero the field and watch currency ÷ price ----------------------------
    var horizon = Number(opts.horizon) || Math.min(3600, Math.max(300, stat.formulaPeakT ? Math.ceil(stat.formulaPeakT * 8) : 300));
    var run = heldRun(b, horizon);
    var rb = { horizon: horizon, hold: b.hold.slice(), samples: run.samples.length, peak: run.peak, firstAffordable: run.firstAffordable,
      trace: run.samples.filter(function (s, i) { return i < 10 || i % 10 === 9 || s === run.peak; }) };
    why.push('rollback: holding ' + b.hold.join(', ') + ' for up to ' + horizon + ' s — the best purse ÷ charged price is 10^' + run.peak.ratioLog10 + ' at ' + b.field + ' = ' + run.peak.field + ' (tick ' + run.peak.tick + ')');
    var out = { template: TPP.id, goal: b.goal, binding: b, static: stat, rollback: rb, reasoning: why, queue: null, subgoal: null, levers: null };
    if (DIFF !== 1) { out.diff = DIFF; why.push('every copy-side tick above ran at diff ' + DIFF + ' (not the default 1)'); }
    if (run.firstAffordable) {
      // ---- 3a. BUY: plan at the measured moment, and CONFIRM by playing the plan on the copy ------------------------
      out.verdict = 'buy-at';
      out.tStar = { tick: run.firstAffordable.tick, field: run.firstAffordable.field, afterTicks: run.firstAffordable.k };
      var q = TPP.plan(b, out);
      var c = playOnCopy(b, q, run.firstAffordable.k + Math.round(20 / DIFF));
      out.confirm = c;
      if (c.played && c.bought) { out.queue = q; why.push('confirmed on the copy: the queue bought ' + b.goal + ' on tick ' + c.at.tick + ' (' + b.field + ' = ' + c.at.field + ')'); }
      else { out.verdict = 'unconfirmed'; why.push('NOT confirmed: the queue played on the copy ' + (c.played ? 'ended ' + c.state + ' (' + c.outcome + ') without the purchase' : 'was refused: ' + (c.refused || []).join('; ')) + ' — no queue is emitted'); }
    } else if (stat.direction === 'waiting-helps') {
      out.verdict = 'waiting-helps';
      var last = run.samples[run.samples.length - 1], slope = E + 1 - kp;
      var more = Math.pow(10, -last.ratioLog10 / slope);
      out.projected = { field: sig(Number(last.field) * more), factor: sig(more) };
      why.push('waiting helps: the ratio rises as ' + b.field + '^' + r4(slope) + '; from 10^' + last.ratioLog10 + ' at ' + last.field + ' it reaches 1 near ' + b.field + ' ≈ ' + out.projected.field + ' — beyond the ' + horizon + '-s horizon, so no queue is confirmed');
    } else {
      // ---- 3b. WAITING CANNOT HELP: walk the multiplier chain and name the nearest lever ---------------------------
      out.verdict = 'waiting-cannot-help';
      var R = Math.pow(10, -run.peak.ratioLog10);
      why.push('waiting cannot help: at its peak the purse is ' + sig(R) + '× short, and the ratio falls after it');
      var lw = leverWalk(opts.facts, b, run.peak.k, R, E === null ? 0 : E, kp === null ? Infinity : kp, opts);
      out.levers = lw.levers; out.leverWalk = { tested: lw.tested, at: lw.at };
      var best = lw.levers.filter(function (l) { return l.distanceLog10 !== null && l.distanceLog10 !== undefined && !l.zeroedAtPeak; })[0] || null;
      if (best) {
        out.subgoal = best.kind === 'multiplier'
          ? { kind: 'value', dimension: best.input, threshold: best.need, why: 'raises ' + best.getter + ' ×' + best.factor + ' — enough for ' + b.goal + ' at the held run\'s peak' }
          : { kind: 'value', dimension: best.currency, threshold: best.cost, why: 'one more ' + best.input + ' changes the production exponent' + (best.flips ? ' — and flips it: waiting would then help' : '') };
        why.push('the nearest lever: ' + best.input + ' (' + best.binding + '; 10^' + best.distanceLog10 + ' away) — emitted as the sub-goal, no queue');
      } else why.push('no lever could be priced: no sub-goal');
    }
    out.neutral = P.hashes().hashGame === hash0;
    return out;
  };

  TPP.plan = function (b, v) {
    if (!v || v.verdict !== 'buy-at' || !v.tStar) return null;
    // the wait asks the ENGINE's own affordability question (what the purchase itself checks), never a price read here
    var it = b.item, d = declOf(it), afford = it.kind === 'upgrade'
      ? 'canAffordUpgrade(' + JSON.stringify(it.layer) + ', ' + JSON.stringify(argId(it.id)) + ')'
      : b.currency + '.gte(tmp[' + JSON.stringify(it.layer) + '].buyables[' + JSON.stringify(argId(it.id)) + '].cost)';
    var have = it.kind === 'upgrade' ? 'hasUpgrade(' + JSON.stringify(it.layer) + ', ' + JSON.stringify(argId(it.id)) + ')' : null;
    var id = 'tpp-' + b.goal.replace(/[^A-Za-z0-9_.-]/g, '-');
    var steps = [
      { 'do': 'hold', features: b.hold.slice(), comment: 'these zero ' + b.field + ' (' + b.facts.zeroedBy.join(', ') + '), and the purchase is the queue\'s' },
      { 'do': 'wait', until: afford, timeout: { gs: sig(v.tStar.afterTicks * DIFF) + 10 }, onTimeout: 'abort',
        comment: 'the rollback found it affordable ' + sig(v.tStar.afterTicks * DIFF) + ' s into the hold, at ' + b.field + ' = ' + v.tStar.field },
      { 'do': 'call', fn: buyCall(it), args: [it.layer, argId(it.id)], comment: 'buy ' + b.goal },
    ];
    if (have) steps.push({ 'do': 'wait', until: have, timeout: { gs: 2 }, onTimeout: 'abort', comment: 'the purchase happened' });
    void d;
    return { format: 'tmt-queue/1', id: id, trigger: { on: 'start' },
      source: { template: TPP.id, goal: b.goal, facts: [b.facts.price, b.facts.production].concat(b.facts.zeroedBy) },
      comment: b.goal + '\'s price grows with ' + b.field + ' (exponent ' + (v.static.priceExponent === null ? '?' : v.static.priceExponent) + '), the purse as ' + b.field + '^' + (v.static.integratedExponent === null ? '?' : v.static.integratedExponent) +
        '. Hold every reset that zeroes ' + b.field + ' and buy at the moment the rollback measured.',
      steps: steps };
  };

  var TEMPLATES = { 'time-priced-purchase': TPP };
  /** run(facts, {goal?, horizon?}) — every template's matches, each checked; what `strategize.mjs` prints. */
  function run(facts, opts) {
    opts = Object.assign({}, opts || {}, { facts: facts });
    var out = { game: T.id || null, ticks: T.ticks, gameSeconds: T.gameSeconds, results: [], counts: {} };
    for (var id in TEMPLATES) {
      var funnel = {};
      var ms = TEMPLATES[id].match(facts, Object.assign({}, opts, { funnel: funnel }));
      out.counts[id] = { funnel: funnel, matches: ms.length, open: ms.filter(function (m) { return m.open; }).length, verdicts: {} };
      for (var i = 0; i < ms.length; i++) {
        if (!ms[i].open && !opts.all) { out.results.push({ template: id, goal: ms[i].goal, verdict: 'not-open', reasoning: [ms[i].why], binding: ms[i] }); out.counts[id].verdicts['not-open'] = (out.counts[id].verdicts['not-open'] || 0) + 1; continue; }
        var v;
        try { v = TEMPLATES[id].check(ms[i], opts); } catch (e) { v = { template: id, goal: ms[i].goal, verdict: 'threw', reasoning: [String(e && e.stack || e).slice(0, 400)] }; }
        out.results.push(v);
        out.counts[id].verdicts[v.verdict] = (out.counts[id].verdicts[v.verdict] || 0) + 1;
      }
    }
    return out;
  }
  P.templates = { list: TEMPLATES, run: run, version: 1 };
})();
