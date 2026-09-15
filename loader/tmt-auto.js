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
  var AU = 'au';
  var POLICIES = {
    reset: /^(always|gain>=\d+(\.\d+)?|keepsUpgrades|interval>=\d+(\.\d+)?)$/,
    upgrades: /^(cheapest-first|order)$/,
    buyables: /^(buyMax|buy)$/,
  };
  var features = [];
  var byId = {};
  T.features = features;
  var hooked = {};         // layer → {original: fn|null}
  var hookOrder = [];
  var loopNo = 0;          // one per gameLoop: advanced by the au layer's automate, the last automate a gameLoop calls
  var ranAt = {};          // layer → loopNo it last ran in
  var stats = { calls: {}, viaSlot: {}, viaFallback: {}, doubles: 0, loops: 0, actions: {} };
  var lastReset = {};      // feature id → player.timePlayed of its last reset (interval policy; runtime only)

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
    return { id: id, layer: f.layer, kind: f.kind, policy: f.policy, saved: isOnSaved(f), unlocked: featureUnlocked(f), active: active(f) };
  };

  function D(x) { return x instanceof Decimal ? x : new Decimal(x === undefined || x === null ? 0 : x); }
  function numIds(obj) { var o = []; for (var id in obj) if (!isNaN(id)) o.push(Number(id)); return o.sort(function (a, b) { return a - b; }); }

  function wantsReset(f) {
    var l = f.layer;
    if (!tmp[l] || tmp[l].canReset !== true) return false;
    for (var i = 0; i < f.after.length; i++) if (!player[f.after[i]] || !player[f.after[i]].unlocked) return false;
    var p = f.policy, m;
    if (p === 'always') return true;
    if ((m = /^gain>=(.*)$/.exec(p))) return D(tmp[l].resetGain).gte(Number(m[1]));
    if (p === 'keepsUpgrades') return hasMilestone(f.keepMilestone.layer, f.keepMilestone.id);
    if ((m = /^interval>=(.*)$/.exec(p))) {
      var now = Number(player.timePlayed) || 0;
      return lastReset[f.id] === undefined || now - lastReset[f.id] >= Number(m[1]);
    }
    return false;
  }

  var EXEC = {
    reset: function (f) {
      if (!wantsReset(f)) return 0;
      doReset(f.layer);
      lastReset[f.id] = Number(player.timePlayed) || 0;
      return 1;
    },
    // cheapest-first: unlocked, unowned upgrades sorted by tmp cost (ties by id); buy each one affordable, in order.
    // `order`: the table's explicit order[]. The game's pseudo-upgrades (a `pseudoUnl`, PTR) are never bought.
    upgrades: function (f) {
      var l = f.layer, L = layers[l], U = tmp[l] && tmp[l].upgrades;
      if (!L.upgrades || !U || !player[l].unlocked) return 0;
      var ids = f.policy === 'order' ? f.order.slice() : numIds(L.upgrades);
      ids = ids.filter(function (id) {
        return U[id] && L.upgrades[id] && L.upgrades[id].pseudoUnl === undefined && U[id].unlocked && player[l].upgrades.indexOf(id) < 0 && player[l].upgrades.indexOf(String(id)) < 0;
      });
      if (f.policy === 'cheapest-first') {
        ids.sort(function (a, b) { var c = D(U[a].cost).cmp(D(U[b].cost)); return c !== 0 ? c : a - b; });
      }
      var n = 0;
      for (var i = 0; i < ids.length; i++) {
        if (!canAffordUpgrade(l, ids[i])) continue;
        var before = player[l].upgrades.length;
        buyUpgrade(l, ids[i]);
        if (player[l].upgrades.length > before) n++;
      }
      return n;
    },
    // buyMax: each unlocked buyable (id order or order[]): the engine's buyMaxBuyable where the buyable has a buyMax,
    // else buyBuyable until the amount stops moving (bounded).
    // buy: buyBuyable until the amount stops moving (bounded) — what a click does, paying the cost — even where the
    // buyable has a buyMax (2.2.1 calls buyMaxBuyable only from autobuyers; a game's buyMax may not charge the cost).
    buyables: function (f) {
      var l = f.layer, L = layers[l], B = tmp[l] && tmp[l].buyables;
      if (!L.buyables || !B || !player[l].unlocked) return 0;
      var ids = f.order ? f.order.slice() : numIds(L.buyables);
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
      var n = EXEC[f.kind](f);
      if (n) stats.actions[f.id] = (stats.actions[f.id] || 0) + n;
    }
  }

  // Wrap the layer's automate (the original first), or add one. automate() is the one per-layer function BOTH engines
  // call exactly once per gameLoop and never from updateTemp (activeFunctions in 2.2.1's and 2.7's temp.js).
  // autoPrestige is NOT used: both engines evaluate it into tmp inside updateTemp (a predicate, several times per tick
  // — doReset itself calls updateTemp ×3), and gameLoop only reads the tmp value.
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
    return { hooked: hookOrder.slice(), loops: stats.loops, calls: Object.assign({}, stats.calls), viaSlot: Object.assign({}, stats.viaSlot), viaFallback: Object.assign({}, stats.viaFallback), doubles: stats.doubles, actions: Object.assign({}, stats.actions) };
  };

  function policyOk(kind, policy) { return POLICIES[kind] && POLICIES[kind].test(policy); }

  T.registerAutoFeature = function (def) {
    if (!def || typeof def.id !== 'string' || !def.id) throw new Error('registerAutoFeature: id required');
    if (byId[def.id]) throw new Error('registerAutoFeature: duplicate id "' + def.id + '"');
    if (!POLICIES[def.kind]) throw new Error('registerAutoFeature ' + def.id + ': kind must be reset | upgrades | buyables');
    if (!policyOk(def.kind, def.policy)) throw new Error('registerAutoFeature ' + def.id + ': policy "' + def.policy + '" is not a ' + def.kind + ' policy');
    if (def.default) throw new Error('registerAutoFeature ' + def.id + ': every feature is OFF by default (default must be false)');
    if (def.policy === 'keepsUpgrades' && !(def.keepMilestone && def.keepMilestone.layer && def.keepMilestone.id !== undefined)) throw new Error('registerAutoFeature ' + def.id + ': keepsUpgrades needs keepMilestone {layer, id}');
    if (def.policy === 'order' && !Array.isArray(def.order)) throw new Error('registerAutoFeature ' + def.id + ': policy order needs order[]');
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
    };
    features.push(f);
    byId[f.id] = f;
    hookLayer(f.layer);
    buildClickables();
    return features.length;
  };
  // A feature's policy among its declared alternatives (runtime only, never saved) — the harness's A/B lever.
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

  if (typeof addLayer === 'function' && typeof layers === 'object' && !layers[AU]) {
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
