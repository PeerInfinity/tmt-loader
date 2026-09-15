// window.tmtLoader — the hook layer contract (plan §3e) and the automation registry (A1; docs/automation.md).
//
// A CLASSIC script (not a module) so the page inserts it after the game's scripts and the Node harness runs the very
// same file with vm.runInThisContext. It runs BEFORE the game's `onload` (`load()`), when `layers` is complete: the
// `au` side layer is added here and every registered feature's layer is hooked here, so `load()` → `updateLayers()` /
// `setupTemp()` pick both up. It reads the engine's globals (layers, player, tmp, updateTemp, gameLoop, doReset,
// buyUpgrade, …) as BARE identifiers — `player`, `layers`, `modInfo` may be global `let`s, not globalThis properties.
// The host (loader/page.js or tools/harness/boot.mjs) creates `globalThis.tmtLoader` first with id, manifest, managed,
// automation, pause/resume, storage, `options` and, in Node, sha256hex; this file adds the rest. Without
// `tmtLoader.automation` only the contract members are defined (tick, stateJSON, hash, save, loadFrom, ids, profile('off')).
(function () {
  var T = globalThis.tmtLoader || (globalThis.tmtLoader = {});
  var G = globalThis;
  T.contract = 2;
  T.ticks = T.ticks || 0;
  T.gameSeconds = T.gameSeconds || 0;
  T.options = T.options || {};
  T.profileName = 'off';

  // ---- state -------------------------------------------------------------------------------------------------------
  // The census's state mask (`time`, `offTime`, at every depth) plus the manifest's per-game additions.
  var extra = (T.manifest && T.manifest.headless && T.manifest.headless.stateMask) || [];
  var MASK = ['time', 'offTime'].concat(extra);
  T.stateMask = MASK.slice();

  // opts.exclude: TOP-LEVEL player keys to drop (e.g. ['au'] to compare against a pre-A1 anchor).
  T.stateJSON = function (opts) {
    var excl = (opts && opts.exclude) || [];
    var root = player;
    return JSON.stringify(root, function (k, v) {
      if (MASK.indexOf(k) >= 0) return undefined;
      if (this === root && excl.indexOf(k) >= 0) return undefined;
      return v;
    });
  };

  T.hash = function (opts) {
    var json = T.stateJSON(opts);
    if (typeof T.sha256hex === 'function') return Promise.resolve(T.sha256hex(json).slice(0, 16));
    return G.crypto.subtle.digest('SHA-256', new G.TextEncoder().encode(json)).then(function (buf) {
      var hex = '';
      var b = new Uint8Array(buf);
      for (var i = 0; i < b.length; i++) hex += (b[i] < 16 ? '0' : '') + b[i].toString(16);
      return hex.slice(0, 16);
    });
  };

  // One tick = exactly the census/probe loop. `n` repeats it (one page.evaluate for a whole run).
  T.tick = function (diff, n) {
    diff = Number(diff);
    if (!(diff >= 0)) throw new Error('tick(diff): diff must be a number >= 0');
    n = n === undefined ? 1 : Number(n);
    var hasFix = typeof fixNaNs === 'function';
    for (var i = 0; i < n; i++) {
      updateTemp();
      gameLoop(diff);
      if (hasFix) fixNaNs();
      T.ticks++;
      T.gameSeconds = Math.round((T.gameSeconds + diff) * 1e9) / 1e9;
    }
    return { ticks: T.ticks, gameSeconds: T.gameSeconds };
  };

  // The game's own save() with no arguments (2.2.1's save(name=allSaves.set) must not receive one).
  T.save = function () { save(); return T.storage && T.storage.list ? T.storage.list() : null; };

  // The game's own import path: importSave(btoa(json), forced). Both engines then reload the page
  // (2.2.1 via loadSave → location.reload, 2.7 directly), so in the page the load completes on the NEXT
  // tmtLoader.ready; in Node the harness re-boots a fresh process on the storage importSave wrote.
  T.loadFrom = function (json) {
    if (typeof json !== 'string') json = JSON.stringify(json);
    importSave(btoa(json), true);
    return { reloading: true };
  };

  var KINDS = [['milestones', 'ms'], ['upgrades', 'upg'], ['buyables', 'buy'], ['challenges', 'ch'], ['achievements', 'ach']];
  // Every `${layer}:${kind}:${id}` (numeric ids only — the census's numKeys rule), each layer's row and type.
  // Layers the loader itself adds (`au`) are not game content and are left out.
  T.ids = function () {
    var out = { layers: {}, ids: [], counts: { ms: 0, upg: 0, buy: 0, ch: 0, ach: 0 } };
    for (var l in layers) {
      var L = layers[l];
      if (!L || L.tmtLoaderLayer) continue;
      out.layers[l] = { row: L.row === undefined ? null : L.row, type: L.type === undefined ? null : L.type };
      for (var k = 0; k < KINDS.length; k++) {
        var obj = L[KINDS[k][0]];
        if (!obj || typeof obj !== 'object') continue;
        for (var id in obj) {
          if (isNaN(id)) continue;
          out.ids.push(l + ':' + KINDS[k][1] + ':' + id);
          out.counts[KINDS[k][1]]++;
        }
      }
    }
    return out;
  };

  // ---- contract-only mode ----------------------------------------------------------------------------------------------
  // Automation is opt-in (`?automation=1` in the page, the harness's default): without `tmtLoader.automation` this file
  // stops here — no registry, no `au` layer, no DOM, no `player.au`. `profile()` exists and knows only `off`.
  if (!T.automation) {
    T.automation = false;
    T.profiles = ['off'];
    T.profile = function (name) {
      if (name === undefined || name === 'off') return 'off';
      throw new Error('profile "' + name + '" needs automation (?automation=1); contract-only mode knows only off');
    };
    return;
  }
  T.automation = true;

  // ---- automation registry -------------------------------------------------------------------------------------------
  // S1 (docs/automation.md): the features are DERIVED from what each tree layer declares (derive(), at the end of this
  // file), shaped by the per-game DATA table `tmtLoader.autoTable` (games-auto/<id>.js, inserted BEFORE this file).
  var AU = 'au';
  var NUM = '\\d+(\\.\\d+)?';
  var POLICIES = {
    reset: new RegExp('^(always|gain>=' + NUM + 'x?|keepsUpgrades|interval>=' + NUM + '|unlocks-purchase)$'),
    upgrades: /^(cheapest-first|order|order-then-cheapest)$/,
    buyables: /^(buyMax|buy|highest-first|buy-unless-saving)$/,
    toggles: /^on$/,
    challenges: /^(sequential|off)$/,
    clickables: /^(when|off)$/,
  };
  var KINDS_ALL = ['toggles', 'upgrades', 'buyables', 'challenges', 'clickables', 'reset'];
  var features = [];
  var byId = {};
  T.features = features;
  var hooked = {};         // layer → {original: fn|null}
  var hookOrder = [];
  var loopNo = 0;          // one per gameLoop: advanced by the au layer's automate, the last automate a gameLoop calls
  var ranAt = {};          // layer → loopNo it last ran in
  var stats = { calls: {}, viaSlot: {}, viaFallback: {}, doubles: 0, loops: 0, actions: {}, challenges: {} };
  var lastReset = {};      // feature id → player.timePlayed of its last reset (interval policy; runtime only)

  // Predicate strings (table gates, clickable `when`) compiled ONCE in the engine's global scope — the same scope as the
  // harness's --until / --marks (vm.runInThisContext of `function(){ return (<src>); }`), so a gate and a ladder mark
  // are one mini-language. A predicate that throws reads as false.
  var compiled = {};
  T.predicate = function (src) {
    if (typeof src !== 'string' || !src) throw new Error('predicate: a non-empty string is required');
    if (!compiled[src]) compiled[src] = new Function('return (' + src + ')');
    return compiled[src];
  };
  function holds(fn) { try { return !!fn(); } catch (e) { return false; } }

  function isOnSaved(f) { return !!(player[AU] && player[AU].features && player[AU].features[f.id]); }
  function featureUnlocked(f) { try { return !!f.unlocked(); } catch (e) { return false; } }
  // Whether a feature runs this tick under the current profile.
  function active(f) {
    if (T.profileName === 'off') return false;
    if (T.profileName === 'all') return featureUnlocked(f);
    return isOnSaved(f) && featureUnlocked(f);
  }
  T.featureState = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    return { id: id, layer: f.layer, kind: f.kind, policy: f.policy, saved: isOnSaved(f), unlocked: featureUnlocked(f), active: active(f), gate: f.gateSrc, gateHolds: f.gate ? holds(f.gate) : null, after: f.after.slice(), order: f.order ? f.order.slice() : null, multiSkipped: f.multiSkipped || 0 };
  };

  function D(x) { return x instanceof Decimal ? x : new Decimal(x === undefined || x === null ? 0 : x); }
  function numIds(obj) { var o = []; for (var id in obj) if (!isNaN(id)) o.push(Number(id)); return o.sort(function (a, b) { return a - b; }); }
  function owned(l, id) { return player[l].upgrades.indexOf(id) >= 0 || player[l].upgrades.indexOf(String(id)) >= 0; }
  // upgrades a feature may buy: unlocked, unowned, not a pseudo-upgrade (`pseudoUnl`, PTR)
  function buyableUpgrade(l, id) {
    var L = layers[l], U = tmp[l] && tmp[l].upgrades;
    return !!(U && U[id] && L.upgrades[id] && L.upgrades[id].pseudoUnl === undefined && U[id].unlocked && !owned(l, id));
  }
  // An upgrade / buyable costed in the layer's own points (no currencyInternalName / currencyLocation / currencyLayer):
  // the only costs `unlocks-purchase` can compare against the layer's points without reading the item's own code.
  function ownCurrency(def) { return def && def.currencyInternalName === undefined && def.currencyLocation === undefined && def.currencyLayer === undefined; }

  function wantsReset(f) {
    var l = f.layer;
    if (!tmp[l] || tmp[l].canReset !== true) return false;
    // yield to native: while the game's own auto-reset predicate holds, gameLoop resets this layer itself
    if (tmp[l].autoPrestige) return false;
    for (var i = 0; i < f.after.length; i++) if (!player[f.after[i]] || !player[f.after[i]].unlocked) return false;
    var p = f.policy, m;
    if (p === 'always') return true;
    // gain>=Nx: the gain is at least N × the points held (dimensionless); gain>=N: the gain is at least N
    if ((m = /^gain>=(.*)x$/.exec(p))) return D(tmp[l].resetGain).gte(D(player[l].points).times(Number(m[1])));
    if ((m = /^gain>=(.*)$/.exec(p))) return D(tmp[l].resetGain).gte(Number(m[1]));
    if (p === 'keepsUpgrades') return hasMilestone(f.keepMilestone.layer, f.keepMilestone.id);
    if ((m = /^interval>=(.*)$/.exec(p))) {
      var now = Number(player.timePlayed) || 0;
      return lastReset[f.id] === undefined || now - lastReset[f.id] >= Number(m[1]);
    }
    if (p === 'unlocks-purchase') return resetBuysSomething(l);
    return false;
  }
  // unlocks-purchase: the points after this reset (held + resetGain) afford the cheapest unowned unlocked upgrade of the
  // layer, or the next level of one of its unlocked buyables — both only where costed in the layer's own points.
  function resetBuysSomething(l) {
    var L = layers[l], after = D(player[l].points).plus(D(tmp[l].resetGain));
    if (L.upgrades) {
      var ids = numIds(L.upgrades);
      for (var i = 0; i < ids.length; i++) {
        if (!buyableUpgrade(l, ids[i]) || !ownCurrency(L.upgrades[ids[i]])) continue;
        if (D(tmp[l].upgrades[ids[i]].cost).lte(after)) return true;
      }
    }
    if (L.buyables && tmp[l].buyables) {
      var bs = numIds(L.buyables);
      for (var j = 0; j < bs.length; j++) {
        var B = tmp[l].buyables[bs[j]];
        if (!B || !B.unlocked || B.cost === undefined || !ownCurrency(L.buyables[bs[j]])) continue;
        try { if (D(B.cost).lte(after)) return true; } catch (e) {}
      }
    }
    return false;
  }

  function savingFor(l) {
    var L = layers[l];
    if (!L.upgrades) return false;
    var ids = numIds(L.upgrades), held = D(player[l].points);
    for (var i = 0; i < ids.length; i++) {
      if (!buyableUpgrade(l, ids[i]) || !ownCurrency(L.upgrades[ids[i]])) continue;
      if (D(tmp[l].upgrades[ids[i]].cost).gt(held)) return true;
    }
    return false;
  }
  function buyUpgradeCounted(l, id) {
    if (!canAffordUpgrade(l, id)) return 0;
    var before = player[l].upgrades.length;
    buyUpgrade(l, id);
    return player[l].upgrades.length > before ? 1 : 0;
  }
  function byCost(l) { var U = tmp[l].upgrades; return function (a, b) { var c = D(U[a].cost).cmp(D(U[b].cost)); return c !== 0 ? c : a - b; }; }

  var EXEC = {
    reset: function (f) {
      if (!wantsReset(f)) return 0;
      doReset(f.layer);
      lastReset[f.id] = Number(player.timePlayed) || 0;
      return 1;
    },
    // cheapest-first: unlocked, unowned upgrades sorted by tmp cost (ties by id); buy each one affordable, in order.
    // order: the table's order[] only. order-then-cheapest: order[] first (each affordable one, in order), then
    // cheapest-first over the upgrades not in order[]. Pseudo-upgrades (a `pseudoUnl`, PTR) are never bought.
    upgrades: function (f) {
      var l = f.layer, L = layers[l];
      if (!L.upgrades || !(tmp[l] && tmp[l].upgrades) || !player[l].unlocked) return 0;
      var n = 0, i;
      if (f.policy === 'order' || f.policy === 'order-then-cheapest') {
        var first = (f.order || []).filter(function (id) { return buyableUpgrade(l, id); });
        for (i = 0; i < first.length; i++) n += buyUpgradeCounted(l, first[i]);
        if (f.policy === 'order') return n;
      }
      var rest = numIds(L.upgrades).filter(function (id) { return buyableUpgrade(l, id) && !(f.policy === 'order-then-cheapest' && f.order && f.order.indexOf(id) >= 0); });
      rest.sort(byCost(l));
      for (i = 0; i < rest.length; i++) n += buyUpgradeCounted(l, rest[i]);
      return n;
    },
    // buyMax: each unlocked buyable (id order or order[]): the engine's buyMaxBuyable where the buyable has a buyMax,
    // else buyBuyable until the amount stops moving (bounded).
    // buy: buyBuyable until the amount stops moving (bounded) — what a click does, paying the cost — even where the
    // buyable has a buyMax (2.2.1 calls buyMaxBuyable only from autobuyers; a game's buyMax may not charge the cost).
    // highest-first: `buy`, over the ids DESCENDING (order[] when given) — what PTR's own Space Building autobuyer does
    // (layers.js s.update: i from the highest building down), so a shared pool is not sunk into the cheapest id.
    // buy-unless-saving: `buy`, but nothing while the layer has an unlocked, unowned upgrade costed in the layer's own
    // points that costs more than the points held (a reserve for it). "The same currency" is the layer's points — the
    // one currency both an upgrade (no currencyInternalName/Location/Layer) and the reserve can be read in generically.
    buyables: function (f) {
      var l = f.layer, L = layers[l], B = tmp[l] && tmp[l].buyables;
      if (!L.buyables || !B || !player[l].unlocked) return 0;
      if (f.policy === 'buy-unless-saving' && savingFor(l)) return 0;
      var ids = f.order ? f.order.slice() : numIds(L.buyables);
      if (f.policy === 'highest-first' && !f.order) ids.reverse();
      var n = 0;
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!B[id] || !B[id].unlocked) continue;
        if (f.policy === 'buyMax' && L.buyables[id].buyMax && typeof buyMaxBuyable === 'function') {
          var b0 = String(player[l].buyables[id]);
          buyMaxBuyable(l, id);
          if (String(player[l].buyables[id]) !== b0) n++;
          continue;
        }
        for (var k = 0; k < 1000; k++) {
          var before = String(player[l].buyables[id]);
          buyBuyable(l, id);
          if (String(player[l].buyables[id]) === before) break;
          n++;
        }
      }
      return n;
    },
    // on: for each milestone of the layer that declares `toggles: [[layer, field], …]` and is held, set every such
    // player[layer][field] that is `false` to `true` — what the game's own toggle button does (toggleAuto flips it).
    // The 2.2.1 'multi' form {layer, varName, options} cycles a string, not an on/off: skipped (counted at derivation).
    toggles: function (f) {
      var n = 0;
      for (var i = 0; i < f.toggleList.length; i++) {
        var t = f.toggleList[i];
        if (!hasMilestone(f.layer, t.ms)) continue;
        if (player[t.layer] && player[t.layer][t.field] === false) { player[t.layer][t.field] = true; n++; }
      }
      return n;
    },
    // sequential: the first challenge (order[] else id order) that is unlocked and below its completion limit — enter it
    // when no challenge of the layer is active; while it is active, exit-and-complete once it can be completed. A
    // challenge the feature did not choose (entered by hand) is left alone.
    challenges: function (f) {
      if (f.policy !== 'sequential') return 0;
      var l = f.layer, C = tmp[l] && tmp[l].challenges;
      if (!C || !player[l].unlocked) return 0;
      var ids = f.order ? f.order.slice() : numIds(layers[l].challenges);
      var pick = null;
      for (var i = 0; i < ids.length; i++) {
        var c = C[ids[i]];
        if (!c || !c.unlocked) continue;
        var limit = c.completionLimit === undefined ? 1 : Number(c.completionLimit);
        if (Number(player[l].challenges[ids[i]] || 0) < limit) { pick = ids[i]; break; }
      }
      var cs = stats.challenges[f.id] || (stats.challenges[f.id] = { enter: 0, exit: 0 });
      var act = player[l].activeChallenge;
      if (act !== null && act !== undefined && act !== 0 && act !== false) {
        if (pick === null || Number(act) !== pick) return 0;
        if (!canCompleteChallenge(l, pick)) return 0;
        if (typeof canExitChallenge === 'function' && !canExitChallenge(l, pick)) return 0;
        startChallenge(l, pick);
        cs.exit++;
        return 1;
      }
      if (pick === null) return 0;
      if (typeof canEnterChallenge === 'function' && !canEnterChallenge(l, pick)) return 0;
      startChallenge(l, pick);
      if (Number(player[l].activeChallenge) === pick) { cs.enter++; return 1; }
      return 0;
    },
    // when: the table's {id, when} list for the layer: click when the clickable is unlocked, canClick, and `when` holds.
    clickables: function (f) {
      if (f.policy !== 'when') return 0;
      var l = f.layer, C = tmp[l] && tmp[l].clickables, n = 0;
      if (!C || !player[l].unlocked) return 0;
      for (var i = 0; i < f.clickList.length; i++) {
        var c = f.clickList[i], tc = C[c.id];
        if (!tc || tc.unlocked === false || !tc.canClick || !holds(c.when)) continue;
        clickClickable(l, c.id);
        n++;
      }
      return n;
    },
  };

  function runLayer(l, via) {
    if (ranAt[l] === loopNo) stats.doubles++;
    ranAt[l] = loopNo;
    stats.calls[l] = (stats.calls[l] || 0) + 1;
    (via === 'slot' ? stats.viaSlot : stats.viaFallback)[l] = ((via === 'slot' ? stats.viaSlot : stats.viaFallback)[l] || 0) + 1;
    if (T.profileName === 'off') return;
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      if (f.layer !== l || !active(f)) continue;
      if (f.gate && !holds(f.gate)) continue;   // a table gate: the feature does nothing while its predicate is false
      var n = EXEC[f.kind](f);
      if (n) stats.actions[f.id] = (stats.actions[f.id] || 0) + n;
    }
  }

  // Wrap the layer's automate (the original first), or add one. automate() is the one per-layer function BOTH engines
  // call exactly once per gameLoop and never from updateTemp (activeFunctions in 2.2.1's and 2.7's temp.js).
  // autoPrestige is NOT used as a hook: both engines evaluate it into tmp inside updateTemp (a predicate, several times
  // per tick — doReset itself calls updateTemp ×3), and gameLoop only reads the tmp value (reset features yield to it).
  function hookLayer(l) {
    if (hooked[l]) return;
    var L = layers[l];
    if (!L) throw new Error('hookLayer: no layer "' + l + '"');
    if (l === AU) throw new Error('hookLayer: the au layer is not hookable');
    var original = typeof L.automate === 'function' ? L.automate : null;
    L.automate = function () {
      if (original) original.apply(this, arguments);
      runLayer(l, 'slot');
    };
    hooked[l] = { original: original };
    hookOrder.push(l);
  }
  T.hookLayer = hookLayer;
  // 2.2.1's gameLoop skips automate() for a layer the player has not unlocked (`unl(layer)`), which is exactly when a
  // reset feature must fire to unlock it. The au layer (row "side": no unl check in either engine, and called AFTER every
  // tree layer) runs the features of every hooked layer whose own slot did not run this gameLoop — exactly once.
  function auAutomate() {
    for (var i = 0; i < hookOrder.length; i++) if (ranAt[hookOrder[i]] !== loopNo) runLayer(hookOrder[i], 'fallback');
    stats.loops++;
    loopNo++;
  }
  T.hookStats = function () {
    var ch = {};
    for (var k in stats.challenges) ch[k] = { enter: stats.challenges[k].enter, exit: stats.challenges[k].exit };
    return { hooked: hookOrder.slice(), loops: stats.loops, calls: Object.assign({}, stats.calls), viaSlot: Object.assign({}, stats.viaSlot), viaFallback: Object.assign({}, stats.viaFallback), doubles: stats.doubles, actions: Object.assign({}, stats.actions), challenges: ch };
  };

  // The registry's memory OUTSIDE `player` (H1 snapshots, docs/harness.md): an interval reset's lastReset (compared with
  // player.timePlayed — undefined after a re-boot, so the policy would fire at once), the loop counter and per-layer
  // ran-at marks the double-call check reads, and the hook statistics (action counts continue across a resume).
  // Plain JSON; restoreRuntime(runtimeState()) is the identity.
  T.runtimeState = function () {
    return { lastReset: Object.assign({}, lastReset), loopNo: loopNo, ranAt: Object.assign({}, ranAt), stats: JSON.parse(JSON.stringify(stats)) };
  };
  T.restoreRuntime = function (rt) {
    if (!rt || typeof rt !== 'object') throw new Error('restoreRuntime: an object from runtimeState() is required');
    var k;
    for (k in lastReset) delete lastReset[k];
    for (k in rt.lastReset || {}) lastReset[k] = rt.lastReset[k];
    for (k in ranAt) delete ranAt[k];
    for (k in rt.ranAt || {}) ranAt[k] = rt.ranAt[k];
    loopNo = Number(rt.loopNo) || 0;
    if (rt.stats) for (k in stats) if (rt.stats[k] !== undefined) stats[k] = JSON.parse(JSON.stringify(rt.stats[k]));
    return true;
  };

  function policyOk(kind, policy) { return POLICIES[kind] && POLICIES[kind].test(policy); }

  T.registerAutoFeature = function (def) {
    if (!def || typeof def.id !== 'string' || !def.id) throw new Error('registerAutoFeature: id required');
    if (byId[def.id]) throw new Error('registerAutoFeature: duplicate id "' + def.id + '"');
    if (!POLICIES[def.kind]) throw new Error('registerAutoFeature ' + def.id + ': kind must be one of ' + KINDS_ALL.join(' | '));
    if (!policyOk(def.kind, def.policy)) throw new Error('registerAutoFeature ' + def.id + ': policy "' + def.policy + '" is not a ' + def.kind + ' policy');
    if (def.default) throw new Error('registerAutoFeature ' + def.id + ': every feature is OFF by default (default must be false)');
    if (def.policy === 'keepsUpgrades' && !(def.keepMilestone && def.keepMilestone.layer && def.keepMilestone.id !== undefined)) throw new Error('registerAutoFeature ' + def.id + ': keepsUpgrades needs keepMilestone {layer, id}');
    if ((def.policy === 'order' || def.policy === 'order-then-cheapest') && !Array.isArray(def.order)) throw new Error('registerAutoFeature ' + def.id + ': policy ' + def.policy + ' needs order[]');
    if (!layers[def.layer]) throw new Error('registerAutoFeature ' + def.id + ': no layer "' + def.layer + '"');
    // options['policy:<id>'] overrides the table's default policy (harness A/B lever; any valid policy of the kind)
    var ov = T.options && T.options['policy:' + def.id];
    if (ov !== undefined) {
      if (!policyOk(def.kind, ov)) throw new Error('registerAutoFeature ' + def.id + ': option policy "' + ov + '" is not a ' + def.kind + ' policy');
    }
    var f = {
      id: def.id, layer: def.layer, kind: def.kind, policy: ov !== undefined ? ov : def.policy, title: def.title || def.id,
      unlocked: typeof def.unlocked === 'function' ? def.unlocked : function () { return true; },
      default: false,
      policies: Array.isArray(def.policies) ? def.policies.slice() : [def.policy],
      keepMilestone: def.keepMilestone || null,
      order: def.order ? def.order.map(Number) : null,
      after: Array.isArray(def.after) ? def.after.slice() : [],
      gateSrc: typeof def.gate === 'string' ? def.gate : null,
      gate: typeof def.gate === 'string' ? T.predicate(def.gate) : null,
      toggleList: def.toggleList || [],
      multiSkipped: def.multiSkipped || 0,
      clickList: (def.clickList || []).map(function (c) { return { id: Number(c.id), whenSrc: c.when, when: T.predicate(c.when) }; }),
      derived: !!def.derived,
    };
    features.push(f);
    byId[f.id] = f;
    hookLayer(f.layer);
    buildClickables();
    return features.length;
  };
  // A feature's policy (runtime only, never saved) — the harness's A/B lever.
  T.setPolicy = function (id, policy) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    if (!policyOk(f.kind, policy)) throw new Error('policy "' + policy + '" is not a ' + f.kind + ' policy');
    f.policy = policy;
    return policy;
  };

  // ---- profiles ------------------------------------------------------------------------------------------------------
  var PROFILES = ['off', 'all', 'saved'];
  T.profiles = PROFILES.slice();
  // off = nothing runs (player.au.features ignored); all = every registered feature on with its default policy;
  // saved = player.au.features. Applied after load(); never written into the save.
  T.profile = function (name) {
    if (name === undefined) return T.profileName;
    if (PROFILES.indexOf(name) < 0) throw new Error('profile "' + name + '" is not one of ' + PROFILES.join(' | '));
    T.profileName = name;
    return name;
  };

  // ---- the au side layer -----------------------------------------------------------------------------------------------
  var DISCLOSURE = 'Automation tools are a loader addition (tmt-loader); every toggle is off by default.';
  T.auTitle = 'Automation Tools';
  var clickables = { rows: 1, cols: 4 };

  function toggleSaved(f) {
    if (!player[AU].features) player[AU].features = {};
    player[AU].features[f.id] = !player[AU].features[f.id];
    player[AU].disclosed = true;
  }
  function onColor(f) { return active(f) ? '#4f9a6a' : featureUnlocked(f) ? '#3d6f91' : '#666666'; }

  function buildClickables() {
    for (var k in clickables) if (!isNaN(k)) delete clickables[k];
    var cols = 4;
    var slots = features.length + 1;
    clickables.rows = Math.ceil(slots / cols);
    clickables.cols = cols;
    // 11: the master toggle (every unlocked registered feature on, or all off)
    clickables[11] = {
      title: 'All features',
      display: function () {
        var on = 0;
        for (var i = 0; i < features.length; i++) if (isOnSaved(features[i])) on++;
        return on + ' / ' + features.length + ' on' + (T.profileName !== 'saved' ? ' (profile ' + T.profileName + ')' : '');
      },
      unlocked: true,
      canClick: function () { return features.length > 0; },
      onClick: function () {
        var anyOff = false;
        for (var i = 0; i < features.length; i++) if (!isOnSaved(features[i]) && featureUnlocked(features[i])) anyOff = true;
        if (!player[AU].features) player[AU].features = {};
        for (var j = 0; j < features.length; j++) player[AU].features[features[j].id] = anyOff && featureUnlocked(features[j]);
        player[AU].disclosed = true;
      },
      style: { 'background-color': '#7fb2d9' },
    };
    for (var i = 0; i < features.length; i++) {
      (function (f, slot) {
        var id = (Math.floor(slot / cols) + 1) * 10 + (slot % cols) + 1;
        clickables[id] = {
          title: f.title,
          display: function () {
            if (!featureUnlocked(f)) return 'Locked';
            return (active(f) ? 'On' : 'Off') + (T.profileName !== 'saved' ? ' (profile ' + T.profileName + ')' : '') + '<br>' + f.policy;
          },
          unlocked: true,
          canClick: function () { return featureUnlocked(f); },
          onClick: function () { toggleSaved(f); },
          style: { 'background-color': function () { return onColor(f); } },
          tmtFeature: f.id,
        };
      })(features[i], i + 1);
    }
  }
  buildClickables();

  // ---- derivation: features from the engine's own data + the per-game DATA table ------------------------------------------
  // tmtLoader.autoTable (games-auto/<id>.js, inserted BEFORE this file; absent = `{}`) — every key in docs/automation.md.
  var TABLE_KEYS = ['id', 'unlockOrder', 'policies', 'alternatives', 'order', 'gates', 'off', 'keep', 'clickables', 'options', 'kindOrder'];
  var KIND_LABEL = { toggles: 'milestone toggles', upgrades: 'upgrades', buyables: 'buyables', challenges: 'challenges', clickables: 'clickables', reset: 'reset' };
  function hasNumIds(obj) { return !!obj && typeof obj === 'object' && numIds(obj).length > 0; }
  function isTreeLayer(l) { var L = layers[l]; return !!L && !L.tmtLoaderLayer && L.row !== undefined && L.row !== null && L.row !== '' && !isNaN(L.row); }
  function listOpt(name, fallback) {
    var v = T.options && T.options[name];
    return v === undefined ? fallback : String(v).split(',').filter(Boolean);
  }

  // The generic candidates, before the table and the kinds lever: [{id, layer, kind, …}] in layer order (row ascending,
  // then `layers` key order) × kind order.
  function candidates(kindOrder) {
    var ls = [], l;
    for (l in layers) if (isTreeLayer(l)) ls.push(l);
    var keyIdx = {};
    ls.forEach(function (x, i) { keyIdx[x] = i; });
    ls.sort(function (a, b) { return Number(layers[a].row) - Number(layers[b].row) || keyIdx[a] - keyIdx[b]; });
    var out = [];
    for (var i = 0; i < ls.length; i++) {
      l = ls[i];
      var L = layers[l];
      var has = {
        toggles: false,
        upgrades: hasNumIds(L.upgrades),
        buyables: hasNumIds(L.buyables),
        challenges: hasNumIds(L.challenges),
        clickables: hasNumIds(L.clickables),
        reset: L.type === 'normal' || L.type === 'static' || L.type === 'custom',
      };
      var toggleList = [], multi = 0;
      if (L.milestones && typeof L.milestones === 'object') {
        numIds(L.milestones).forEach(function (ms) {
          var tg = L.milestones[ms] && L.milestones[ms].toggles;
          if (!Array.isArray(tg)) return;
          tg.forEach(function (t) {
            if (Array.isArray(t) && typeof t[0] === 'string' && typeof t[1] === 'string') toggleList.push({ ms: ms, layer: t[0], field: t[1] });
            else multi++;
          });
        });
      }
      has.toggles = toggleList.length + multi > 0;
      for (var k = 0; k < kindOrder.length; k++) {
        var kind = kindOrder[k];
        if (!has[kind]) continue;
        out.push({ id: kind + ':' + l, layer: l, kind: kind, toggleList: kind === 'toggles' ? toggleList : null, multiSkipped: kind === 'toggles' ? multi : 0 });
      }
    }
    return out;
  }

  function derive() {
    var table = T.autoTable === undefined || T.autoTable === null ? {} : T.autoTable;
    if (typeof table !== 'object' || Array.isArray(table)) throw new Error('autoTable must be an object');
    var src = 'autoTable' + (table.id ? ' "' + table.id + '"' : '');
    for (var key in table) if (TABLE_KEYS.indexOf(key) < 0) throw new Error(src + ': unknown key "' + key + '" (known: ' + TABLE_KEYS.join(', ') + ')');
    if (table.id !== undefined && T.id && table.id !== T.id) throw new Error(src + ': id does not match the game "' + T.id + '"');
    T.autoOptions = Object.assign({}, table.options || {}, T.options || {});

    // kind order within a layer: the table's (or ?autoOpt=kindOrder=…), else the generic one (plan §5b). S1-2k (diff 1):
    // the generic order reached ptr A1-3 at 1322 / 2321 / 2893 vs reset-first 1361 / 2360 / 2936, Something Tree 301 vs
    // 308 and 302 / 392 / 572 vs 309 / 399 / 579 — faster everywhere measured
    var kindOrder = listOpt('kindOrder', table.kindOrder || KINDS_ALL);
    if (kindOrder.length !== KINDS_ALL.length || KINDS_ALL.some(function (k) { return kindOrder.indexOf(k) < 0; })) throw new Error(src + ': kindOrder must be a permutation of ' + KINDS_ALL.join(','));
    var cands = candidates(kindOrder);
    var candById = {};
    cands.forEach(function (c) { candById[c.id] = c; });
    var known = function (where, id) { if (!candById[id]) throw new Error(src + ': ' + where + ' names "' + id + '", which is not a derived feature of this game'); };
    ['policies', 'alternatives', 'order', 'gates', 'off', 'keep'].forEach(function (k) {
      if (table[k] === undefined) return;
      if (typeof table[k] !== 'object' || Array.isArray(table[k])) throw new Error(src + ': ' + k + ' must be an object keyed by feature id');
      for (var id in table[k]) known(k, id);
    });
    var clk = table.clickables || {};
    for (var cl in clk) {
      known('clickables', 'clickables:' + cl);
      if (!Array.isArray(clk[cl])) throw new Error(src + ': clickables.' + cl + ' must be a list of {id, when}');
      clk[cl].forEach(function (c) {
        if (!c || !layers[cl].clickables[c.id]) throw new Error(src + ': clickables.' + cl + ' names clickable ' + (c && c.id) + ', which the layer does not declare');
        if (typeof c.when !== 'string') throw new Error(src + ': clickables.' + cl + ' id ' + c.id + ' needs a `when` predicate string');
      });
    }
    // unlockOrder: lists of siblings; the i-th member's reset waits until those before it are unlocked. Options
    // unlockOrder=… / rowTwoOrder=… override the first / second list (a permutation of it).
    var uo = (table.unlockOrder || []).map(function (list) { return list.slice(); });
    [['unlockOrder', 0], ['rowTwoOrder', 1]].forEach(function (x) {
      var v = listOpt(x[0], null);
      if (v === null) return;
      var base = uo[x[1]];
      if (!base || v.length !== base.length || base.some(function (m) { return v.indexOf(m) < 0; })) throw new Error(src + ': option ' + x[0] + ' must be a permutation of ' + (base ? base.join(',') : '(no such unlockOrder list)'));
      uo[x[1]] = v;
    });
    var after = {};
    uo.forEach(function (list) {
      list.forEach(function (m, i) { known('unlockOrder', 'reset:' + m); after[m] = list.slice(0, i); });
    });

    var kinds = listOpt('kinds', null);
    if (kinds) kinds.forEach(function (k) { if (KINDS_ALL.indexOf(k) < 0) throw new Error('option kinds: unknown kind "' + k + '"'); });
    var off = table.off || {};
    T.autoExcluded = {};
    T.autoDerivation = { kindOrder: kindOrder.slice(), kinds: kinds ? kinds.slice() : KINDS_ALL.slice(), candidates: cands.length, registered: 0, excluded: 0, outOfKinds: 0, multiTogglesSkipped: 0, unlockOrder: uo };
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i], l = c.layer, id = c.id;
      if (c.kind === 'toggles') T.autoDerivation.multiTogglesSkipped += c.multiSkipped;
      if (kinds && kinds.indexOf(c.kind) < 0) { T.autoDerivation.outOfKinds++; continue; }
      if (off[id] !== undefined) {
        if (typeof off[id] !== 'string' || !off[id]) throw new Error(src + ': off.' + id + ' needs a reason string');
        T.autoExcluded[id] = off[id];
        T.autoDerivation.excluded++;
        continue;
      }
      var order = table.order && table.order[id];
      var policy = table.policies && table.policies[id];
      if (policy === undefined) policy = defaultPolicy(c.kind, l, !!order, !!clk[l]);
      var def = {
        id: id, layer: l, kind: c.kind, policy: policy, default: false, derived: true,
        title: titleOf(l) + ' ' + KIND_LABEL[c.kind],
        unlocked: derivedUnlocked(c.kind, l),
        policies: [policy].concat((table.alternatives && table.alternatives[id]) || []),
        keepMilestone: table.keep && table.keep[id],
        order: order,
        after: c.kind === 'reset' ? after[l] : undefined,
        gate: table.gates && table.gates[id],
        toggleList: c.toggleList, multiSkipped: c.multiSkipped,
        clickList: c.kind === 'clickables' ? clk[l] : undefined,
      };
      T.registerAutoFeature(def);
      T.autoDerivation.registered++;
    }
  }
  function titleOf(l) { var n = String(layers[l].name || l); return n.charAt(0).toUpperCase() + n.slice(1); }
  // Derived unlocked(): a purchase kind needs the layer unlocked (nothing to buy before); a reset needs the layer's node
  // visible (layerShown !== false) — the moment a human could click it, which is before it is unlocked. layerShown is
  // evaluated LIVE, not read from tmp: updateTemp computes tmp[l].layerShown before gameLoop, and a game may unlock a
  // layer inside gameLoop (Something Tree's unlock.update() sets player.fundamental.unlocked), so the tmp value lags
  // by one tick — measured: S1 part 2's diff-1 primitive sweep reached A2-1's marks one tick late (310 / 400 / 580 vs
  // 309 / 399 / 579) until this read went live.
  function derivedUnlocked(kind, l) {
    if (kind === 'reset') return function () {
      var L = layers[l];
      var v = typeof L.layerShown === 'function' ? L.layerShown.call(L) : L.layerShown;
      return v !== false;
    };
    return function () { return !!player[l] && !!player[l].unlocked; };
  }
  // Table-less defaults. reset: a static layer's gain is its requirement-paced 1 per reset, so `always` (A2-3: the
  // all-`always` control ended at the default's hash at 8035; A1's b/g ran `gain>=1`, the same thing for a static layer);
  // normal / custom: `gain>=2x` — S1-2 sweeps (diff 1): the one policy that reached every mark on ptr reset:p (918 / 1627 /
  // 2112 vs interval>=10's 1361 / 2360 / 2936), Something Tree reset:fundamental (496 vs interval>=5's 308) and
  // reset:primitive (446 / 951 vs interval>=90's 399 / 579) with no constant; unmeasured on any other game. upgrades: cheapest-first
  // (order-then-cheapest with an order[]); buyables: buy (§12e.1); toggles: on; challenges: sequential only with an
  // order[]; clickables: only with a {id, when} list.
  function defaultPolicy(kind, l, hasOrder, hasClicks) {
    if (kind === 'reset') return layers[l].type === 'static' ? 'always' : 'gain>=2x';
    if (kind === 'upgrades') return hasOrder ? 'order-then-cheapest' : 'cheapest-first';
    if (kind === 'buyables') return 'buy';
    if (kind === 'toggles') return 'on';
    if (kind === 'challenges') return hasOrder ? 'sequential' : 'off';
    return hasClicks ? 'when' : 'off';
  }

  if (typeof addLayer === 'function' && typeof layers === 'object' && !layers[AU]) {
    derive();
    addLayer(AU, {
      tmtLoaderLayer: true,
      startData: function () { return { unlocked: true, points: new Decimal(0), features: {}, disclosed: false }; },
      color: '#7fb2d9',
      row: 'side',
      symbol: 'AU',
      tooltip: T.auTitle,
      layerShown: function () { return true; },
      clickables: clickables,
      tabFormat: [
        ['display-text', function () { return '<h2>' + T.auTitle + '</h2>'; }],
        'blank',
        ['display-text', function () {
          var on = 0;
          for (var i = 0; i < features.length; i++) if (active(features[i])) on++;
          return 'Profile: <b>' + T.profileName + '</b> — ' + on + ' of ' + features.length + ' registered features running';
        }],
        ['display-text', function () { return player[AU] && player[AU].disclosed ? DISCLOSURE : ''; }],
        'blank',
        'clickables',
      ],
      automate: auAutomate,
    });
    T.auLayer = AU;
  }

  // Test probe (Part-1 gate): hook every tree layer with no features, so the wrapper-call counter covers every layer.
  if (T.options && T.options.hookAll) for (var hl in layers) if (hl !== AU && layers[hl] && !isNaN(layers[hl].row)) hookLayer(hl);
})();
