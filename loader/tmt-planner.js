// tmtLoader.planner — the ADVANCED automation's foundation (tmt-automation-plan §11b, §12 P1a; docs/planner.md).
//
// A CLASSIC script like loader/tmt-auto.js, loaded AFTER it. P1a is HARNESS-ONLY: the page never fetches this file
// (boot.mjs --planner inserts it); it adds no DOM, no layer, nothing to `player`, and running nothing in it is inert.
// It is the second system next to the simple reflexes of tmt-auto.js — it decides nothing yet: it reads, measures and
// remembers.
//
// Commitments carried over from omsi-loops' planner (AUTOMATION.md §1):
//   1. ZERO hand-scripted game knowledge. No layer id, upgrade id, currency name or number appears in this file.
//      Everything game-specific is discovered from `layers` / `tmp` / `player` or measured on a copy. Engine API names
//      (updateTemp, doReset, getStartPlayer, hasMilestone, …) are the TMT contract, not game knowledge, and every one
//      is reached through a `typeof` guard so a fork that renames it fails loudly instead of silently.
//   2. The ENGINE is ground truth: a rate, a gain or a threshold is measured by running the engine on a copy.
//   3. DETERMINISM: every walk is ordered (row, then `layers` key order, then numeric id); nothing reads a clock.
//   4. The LIVE game is never rolled back. Headless the harness process IS the copy: snapshot() → fn() → restore().
//      In the page (P2) the same code runs in a worker on its own copy.
(function () {
  var T = globalThis.tmtLoader || (globalThis.tmtLoader = {});
  if (!T.automation) { T.planner = { available: false, why: 'the planner needs the automation core (tmtLoader.automation)' }; return; }

  var P = {};
  T.planner = P;
  P.available = true;
  P.contract = 1;
  P.settlePasses = 3;

  // ---- engine API ------------------------------------------------------------------------------------------------
  // Every engine entry point this file uses, resolved through typeof so a fork missing one is named, not guessed at.
  var API = {};
  function api(name) {
    if (name in API) return API[name];
    var f = null;
    try { f = eval('typeof ' + name + ' === "function" ? ' + name + ' : null'); } catch (e) { f = null; }
    return (API[name] = f);
  }
  function has(name) { return api(name) !== null; }
  function need(name) { var f = api(name); if (!f) throw new Error('tmtLoader.planner: this engine has no ' + name + '() — the planner needs it'); return f; }
  var D = function (x) { return x instanceof Decimal ? x : new Decimal(x === undefined || x === null ? 0 : x); };
  function isDec(x) { return x instanceof Decimal; }
  function numLike(x) { return typeof x === 'number' || isDec(x); }
  function dstr(x) { try { return String(D(x)); } catch (e) { return null; } }
  // log10 of a non-negative quantity, as a plain number, for ordering and for the threshold search
  function lg(x) { try { var d = D(x); return d.lte(0) ? -Infinity : Number(d.log10()); } catch (e) { return NaN; } }

  P.engine = function () {
    var names = ['getStartPlayer', 'fixSave', 'updateTemp', 'gameLoop', 'doReset', 'buyUpgrade', 'buyBuyable', 'startChallenge', 'clickClickable', 'canAffordUpgrade', 'canAffordPurchase', 'hasMilestone', 'hasAchievement', 'hasUpgrade', 'hasChallenge', 'getBuyableAmount', 'canEnterChallenge', 'canCompleteChallenge', 'canExitChallenge', 'buyMaxBuyable', 'fixNaNs', 'setupTemp', 'updateLayers'];
    var o = {};
    for (var i = 0; i < names.length; i++) o[names[i]] = has(names[i]);
    return o;
  };

  // ---- stable ordering -------------------------------------------------------------------------------------------
  // Determinism rule: layers by row ascending then `layers` key order (side layers last, in key order); ids numeric.
  function numIds(obj) { var o = []; for (var id in obj) if (!isNaN(id)) o.push(Number(id)); return o.sort(function (a, b) { return a - b; }); }
  function allLayers() {
    var ls = [], keyIdx = {}, i = 0, l;
    for (l in layers) { if (!layers[l] || layers[l].tmtLoaderLayer) continue; ls.push(l); keyIdx[l] = i++; }
    ls.sort(function (a, b) {
      var ra = Number(layers[a].row), rb = Number(layers[b].row);
      var na = isNaN(ra), nb = isNaN(rb);
      if (na !== nb) return na ? 1 : -1;          // side layers after the tree
      if (!na && ra !== rb) return ra - rb;
      return keyIdx[a] - keyIdx[b];
    });
    return ls;
  }
  P.layerOrder = allLayers;
  // A layer declaration read LIVE (never from tmp): tmp skips `unlocked` outside the open tab and turns a function it
  // never evaluated into Decimal(1) at setupTemp, so a tmp read of those is a stale truthy value (tmt-auto.js hit the
  // same trap with layerShown — S1 §10a.2 item 3).
  function live(obj, key) {
    if (!obj) return undefined;
    var v = obj[key];
    if (typeof v !== 'function') return v;
    try { return v.call(obj); } catch (e) { return undefined; }
  }
  // tmp is NOT a safe reader for `unlocked`: updateTempData skips every `unlocked` outside `upgrades` while the layer's
  // tab is not open (2.2.1 temp.js:96), and setupTemp seeds an un-evaluated function as Decimal(1) — truthy forever.
  // So a locked buyable or challenge reads UNLOCKED out of tmp. Every `unlocked` here is read live from the declaration.
  function itemUnlocked(decl, tmpItem) {
    var v = live(decl, 'unlocked');
    if (v !== undefined) return v !== false;
    if (tmpItem && tmpItem.unlocked !== undefined) return !!tmpItem.unlocked;
    return true;
  }
  function layerShown(l) { var v = live(layers[l], 'layerShown'); return v !== false; }
  function unlockedLayer(l) { return !!(player[l] && player[l].unlocked); }

  // ---- paths over `player` ---------------------------------------------------------------------------------------
  // A DIMENSION is a path into `player` — 'player.points', 'player.<layer>.<field>', 'player.<layer>.buyables.<id>'.
  // Every threshold, every measured rate and every chain hop speaks this one key space.
  function getPath(path) {
    var parts = String(path).split('.'), o = globalThis;
    if (parts[0] !== 'player') return undefined;
    o = player;
    for (var i = 1; i < parts.length; i++) { if (o === undefined || o === null) return undefined; o = o[parts[i]]; }
    return o;
  }
  function setPath(path, v) {
    var parts = String(path).split('.'), o = player;
    for (var i = 1; i < parts.length - 1; i++) { if (o === undefined || o === null) return false; o = o[parts[i]]; }
    if (o === undefined || o === null) return false;
    o[parts[parts.length - 1]] = v;
    return true;
  }
  P.get = getPath;
  // Every numeric leaf of `player`, depth-limited, in a deterministic order. MASK: the state mask (time / offTime at
  // any depth, the manifest's additions) — a clock is not a resource.
  function numericLeaves(maxDepth) {
    var mask = T.stateMask || ['time', 'offTime'];
    var out = [];
    (function walk(o, path, depth) {
      var keys = Object.keys(o);
      keys.sort();
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (mask.indexOf(k) >= 0) continue;
        if (depth === 1 && layers[k] && layers[k].tmtLoaderLayer) continue;   // the loader's own au layer is not game state
        var v = o[k], p = path + '.' + k;
        if (numLike(v)) { out.push(p); continue; }
        if (v && typeof v === 'object' && !Array.isArray(v) && !isDec(v) && depth < maxDepth) walk(v, p, depth + 1);
      }
    })(player, 'player', 1);
    return out;
  }
  function leafMap(maxDepth) {
    var paths = numericLeaves(maxDepth === undefined ? 3 : maxDepth), m = {};
    for (var i = 0; i < paths.length; i++) { var v = getPath(paths[i]); m[paths[i]] = numLike(v) ? D(v) : null; }
    return m;
  }

  // ---- Part 1: snapshot / restore / excursion / measure -----------------------------------------------------------
  // `extra`: the module-level engine state outside `player` that an excursion can touch. Enumerated GENERICALLY — every
  // own scalar property of the global object — so a fork's own flags are carried without naming one here. The gate
  // reports which of them an excursion actually moved (the measurement the brief asked for).
  var EXTRA_SKIP = { NaN: 1, Infinity: 1, undefined: 1 };
  function extraNames() {
    var out = [], k;
    for (k in globalThis) {
      if (EXTRA_SKIP[k]) continue;
      var v;
      try { v = globalThis[k]; } catch (e) { continue; }
      var t = typeof v;
      if (t === 'boolean' || t === 'number' || t === 'string') out.push(k);
    }
    out.sort();
    return out;
  }
  function readExtra() { var n = extraNames(), o = {}; for (var i = 0; i < n.length; i++) { try { o[n[i]] = globalThis[n[i]]; } catch (e) {} } return o; }
  function writeExtra(e) { if (!e) return 0; var n = 0; for (var k in e) { try { if (globalThis[k] !== e[k]) { globalThis[k] = e[k]; n++; } } catch (err) {} } return n; }
  P.extraNames = extraNames;

  // Objects on the global that HOLD the live player by identity (2.2.1's allSaves[allSaves.set] is the player itself).
  // Rebuilding `player` would leave them pointing at the old object, so restore re-points them. Identity only — no name.
  function playerHolders(old) {
    var refs = [], k, v, k2;
    for (k in globalThis) {
      try { v = globalThis[k]; } catch (e) { continue; }
      if (v === old) { refs.push([globalThis, k]); continue; }
      if (!v || typeof v !== 'object' || Array.isArray(v) || isDec(v)) continue;
      if (v === tmp || v === layers) continue;
      var ks = Object.keys(v);
      for (var i = 0; i < ks.length; i++) { k2 = ks[i]; try { if (v[k2] === old) refs.push([v, k2]); } catch (e) {} }
    }
    return refs;
  }

  var sha = function (s) { return typeof T.sha256hex === 'function' ? T.sha256hex(s).slice(0, 16) : null; };
  /** The two hashes the harness compares: the full state and the state without the au layer (S1 §10a.2 item 1). */
  P.hashes = function () {
    return { hash: sha(T.stateJSON()), hashGame: sha(T.stateJSON({ exclude: ['au'] })) };
  };

  /** An opaque record of everything an excursion can move. */
  P.snapshot = function () {
    return {
      player: JSON.stringify(player),
      runtime: T.runtimeState(),
      extra: readExtra(),
      counters: { ticks: T.ticks, gameSeconds: T.gameSeconds },
      profile: T.profileName,
    };
  };

  /**
   * The live `player` rebuilt from the record through the ENGINE'S OWN deserialization — the path load() and
   * importSave() take after JSON.parse: Object.assign(getStartPlayer(), data) then fixSave() (2.2.1 utils.js:359-370 /
   * :440-452, 2.7 utils/save.js:189-200 / :274-287). setupTemp() is NOT called (it is not idempotent); one updateTemp()
   * at the end is the only extra evaluation, and gate P1a-1 measures that it is state-neutral.
   */
  P.restore = function (snap) {
    if (!snap || typeof snap.player !== 'string') throw new Error('planner.restore: a record from planner.snapshot() is required');
    var getStart = need('getStartPlayer'), fix = need('fixSave'), upd = need('updateTemp');
    var old = player;
    var refs = playerHolders(old);
    player = Object.assign(getStart(), JSON.parse(snap.player));
    fix();
    // versionCheck() is part of the engine's own post-parse path (2.2.1 load() calls it right after fixSave, and
    // importSave's reload runs the whole of load()). Without it a restored save differs from the live one in the
    // version fields alone: fixData rewrites an `undefined` default to null, and only versionCheck writes it back.
    var vc = api('versionCheck');
    if (vc) vc();
    for (var i = 0; i < refs.length; i++) refs[i][0][refs[i][1]] = player;
    // 2.2.1 keeps the LIVE player inside `allSaves` (`let allSaves` — a lexical global, not a globalThis property, so
    // the identity scan above cannot see it). save() would otherwise write the stale object. Engine API, not game data.
    try { if (typeof allSaves === 'object' && allSaves) for (var s in allSaves) if (allSaves[s] === old) allSaves[s] = player; } catch (e) {}
    writeExtra(snap.extra);
    T.restoreRuntime(snap.runtime);
    T.ticks = snap.counters.ticks;
    T.gameSeconds = snap.counters.gameSeconds;
    if (snap.profile !== undefined) T.profile(snap.profile);
    // The engine settles tmp with SEVERAL passes after a load (2.2.1 load(): updateTemp ×3, doReset: ×3; 2.7 load():
    // ×2) because tmp is not a pure function of player: getNextAt reads tmp[layer].nextAt and tmp[layer].baseAmount
    // (game.js:36-52), so one pass leaves a second-order value at a different fixed point. Measured at the frontier
    // with ONE pass: tmp.b.canReset read true in the walk and false in the very next excursion's measurement, and
    // doReset(b) then did nothing. P.settlePasses matches the engine's own convention; the A/B test (gate P1a-1 (b))
    // measures that the extra passes leave the run's trajectory byte-identical.
    for (var n = 0; n < P.settlePasses; n++) upd();
    return true;
  };

  /** snapshot → fn() → restore, whatever fn does or throws. Returns fn's value. */
  P.excursion = function (fn) {
    var snap = P.snapshot();
    try { return fn(); } finally { P.restore(snap); }
  };

  // The action alphabet, each applied through the engine's own entry point (never by editing `player`).
  var APPLY = {
    reset: function (a) { need('doReset')(a.layer); },
    buyUpgrade: function (a) { need('buyUpgrade')(a.layer, a.id); },
    buyBuyable: function (a) { need('buyBuyable')(a.layer, a.id); },
    buyMax: function (a) { need('buyMaxBuyable')(a.layer, a.id); },
    startChallenge: function (a) { need('startChallenge')(a.layer, a.id); },
    click: function (a) { need('clickClickable')(a.layer, a.id); },
  };
  P.actionKinds = Object.keys(APPLY).sort();

  function playerSummary() {
    var ls = allLayers(), o = { points: dstr(player.points), layers: {} };
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i], p = player[l];
      if (!p) continue;
      o.layers[l] = {
        unlocked: !!p.unlocked,
        points: p.points === undefined ? null : dstr(p.points),
        best: p.best === undefined ? null : dstr(p.best),
        total: p.total === undefined ? null : dstr(p.total),
        upgrades: (p.upgrades || []).map(String).sort(),
        milestones: (p.milestones || []).map(String).sort(),
        achievements: (p.achievements || []).map(String).sort(),
        buyables: (function () { var b = {}, ids = numIds(p.buyables || {}); for (var j = 0; j < ids.length; j++) b[ids[j]] = dstr(p.buyables[ids[j]]); return b; })(),
        challenges: (function () { var c = {}, ids = numIds(p.challenges || {}); for (var j = 0; j < ids.length; j++) c[ids[j]] = Number(p.challenges[ids[j]] || 0); return c; })(),
      };
    }
    return o;
  }
  P.summary = playerSummary;

  /**
   * measure(actions, k, opts): an EXCURSION that applies `actions` through the engine and then ticks k game-seconds at
   * diff 1 with the simple system's current profile. Returns the copy's hashes, a player summary and per-tick samples
   * of player.points and every layer's points. The live state is byte-identical afterwards (gate P1a-1).
   */
  P.measure = function (actions, k, opts) {
    actions = actions || [];
    k = Number(k || 0);
    opts = opts || {};
    var diff = opts.diff === undefined ? 1 : Number(opts.diff);
    var stride = Math.max(1, Number(opts.stride || 1));
    return P.excursion(function () {
      var applied = [], i;
      for (i = 0; i < actions.length; i++) {
        var a = actions[i];
        var f = APPLY[a.kind];
        if (!f) throw new Error('planner.measure: unknown action kind "' + a.kind + '" (known: ' + P.actionKinds.join(', ') + ')');
        var before = P.hashes().hashGame;
        var err = null;
        try { f(a); } catch (e) { err = String(e && e.message || e).slice(0, 200); }
        need('updateTemp')();
        applied.push({ kind: a.kind, layer: a.layer === undefined ? null : a.layer, id: a.id === undefined ? null : a.id, moved: P.hashes().hashGame !== before, error: err });
      }
      var ls = allLayers();
      var samples = [];
      var sample = function () {
        var row = [dstr(player.points)];
        for (var j = 0; j < ls.length; j++) row.push(player[ls[j]] && player[ls[j]].points !== undefined ? dstr(player[ls[j]].points) : null);
        return row;
      };
      samples.push(sample());
      for (i = 0; i < k; i++) { T.tick(diff, 1); if ((i + 1) % stride === 0 || i === k - 1) samples.push(sample()); }
      var h = P.hashes();
      return { actions: applied, ticks: k, diff: diff, stride: stride, profile: T.profileName, hash: h.hash, hashGame: h.hashGame, sampleLayers: ls.slice(), samples: samples, summary: playerSummary() };
    });
  };

  // ---- the Proxy trace: which `player` fields a predicate reads ---------------------------------------------------
  // A recording Proxy over `player` (the probes/census.mjs seed, NewDocs/plans/tmt/probes/census.mjs). Plain objects
  // are wrapped recursively so a read records its full path; a Decimal or an array is a LEAF (wrapping a Decimal would
  // record its internals, and array membership is not a dimension).
  function traceReads(fn) {
    var reads = [], seen = {};
    var record = function (p, v) {
      if (seen[p]) return;
      seen[p] = 1;
      reads.push({ path: p, kind: isDec(v) ? 'decimal' : typeof v === 'number' ? 'number' : Array.isArray(v) ? 'array' : typeof v === 'boolean' ? 'boolean' : v === null || v === undefined ? 'absent' : typeof v });
    };
    var wrap = function (obj, path) {
      return new Proxy(obj, {
        get: function (t, k) {
          if (typeof k === 'symbol') return t[k];
          var v = t[k], p = path + '.' + String(k);
          if (v && typeof v === 'object' && !isDec(v) && !Array.isArray(v)) return wrap(v, p);
          record(p, v);
          return v;
        },
      });
    };
    var real = player, value, error = null;
    player = wrap(real, 'player');
    try { value = fn(); } catch (e) { error = String(e && e.message || e).slice(0, 160); } finally { player = real; }
    return { value: value, error: error, reads: reads, numeric: reads.filter(function (r) { return r.kind === 'decimal' || r.kind === 'number'; }).map(function (r) { return r.path; }) };
  }
  P.trace = traceReads;

  // ---- threshold probing by perturbation (omsi AUTOMATION.md §3.2) -------------------------------------------------
  // A predicate the walk cannot read a number out of (a milestone's / achievement's done()) gets its threshold
  // MEASURED: set one traced field on the copy, re-evaluate, binary search the minimal passing value.
  var HUGE = null;
  function huge() { if (!HUGE) HUGE = Decimal.pow(10, 1e6); return HUGE; }
  function probeField(path, test, asDecimal) {
    // exponential bracket on log10, then binary search, then an integer refinement where the value is small enough
    var CAP = asDecimal ? 1e6 : 300;
    var mk = function (e) { return asDecimal ? Decimal.pow(10, e) : Math.pow(10, e); };
    var at = function (v) { setPath(path, v); return !!test(); };
    if (at(asDecimal ? new Decimal(0) : 0)) return { threshold: '0', exact: true, note: 'holds at zero' };
    var lo = null, hi = null, e;
    if (at(mk(0))) { lo = -Infinity; hi = 0; }
    else {
      for (e = 1; e <= CAP; e = e < 8 ? e + 1 : Math.min(CAP, e * 2)) {
        if (at(mk(e))) { hi = e; lo = e === 1 ? 0 : (e <= 8 ? e - 1 : e / 2); break; }
        if (e >= CAP) break;
      }
      if (hi === null) return { threshold: null, exact: false, note: 'no pass below 1e' + CAP };
    }
    if (lo === -Infinity) {
      // between 0 and 1: search the mantissa directly
      var a = 0, b = 1;
      for (var j = 0; j < 60; j++) { var m = (a + b) / 2; if (at(asDecimal ? new Decimal(m) : m)) b = m; else a = m; }
      return { threshold: String(b), exact: false, note: 'below 1' };
    }
    for (var i = 0; i < 80 && hi - lo > 1e-12 * Math.max(1, Math.abs(hi)); i++) {
      var mid = (lo + hi) / 2;
      if (at(mk(mid))) hi = mid; else lo = mid;
    }
    var val = mk(hi);
    // integer refinement: a threshold a human would read as "8" must come back as 8, not 8.000000001
    if (hi < 15) {
      var n = Math.ceil(Number(asDecimal ? Number(val) : val) - 1e-9);
      if (n >= 0 && at(asDecimal ? new Decimal(n) : n) && (n === 0 || !at(asDecimal ? new Decimal(n - 1) : n - 1))) {
        return { threshold: String(n), exact: true, note: 'integer' };
      }
    }
    return { threshold: dstr(val), exact: false, note: 'log10 search' };
  }

  /**
   * probe(test): the dimension and threshold of a boolean predicate, discovered by perturbation on the CALLER'S copy.
   * Pass A — each traced numeric field raised alone to 1e1000000: the one that flips the predicate is its dimension,
   * binary-searched. Pass B — all of them at once: a flip means a conjunction (recorded unprobeable with its fields),
   * no flip means the predicate is gated on something that is not a number here (also unprobeable).
   * Every perturbed value is saved and restored; the caller's excursion is the safety net.
   */
  P.probe = function (test) {
    var tr = traceReads(test);
    if (tr.error) return { probeable: false, why: 'the predicate throws: ' + tr.error, reads: tr.reads };
    if (tr.value) return { probeable: false, why: 'already true', reads: tr.reads };
    var fields = tr.numeric;
    if (!fields.length) return { probeable: false, why: 'no numeric field read', reads: tr.reads };
    var saved = {}, i, flips = [];
    for (i = 0; i < fields.length; i++) saved[fields[i]] = getPath(fields[i]);
    var restoreAll = function () { for (var j = 0; j < fields.length; j++) setPath(fields[j], saved[fields[j]]); };
    try {
      for (i = 0; i < fields.length; i++) {
        var asDec = isDec(saved[fields[i]]);
        setPath(fields[i], asDec ? huge() : Number.MAX_VALUE / 1e10);
        var flipped = false;
        try { flipped = !!test(); } catch (e) { flipped = false; }
        setPath(fields[i], saved[fields[i]]);
        if (flipped) flips.push(fields[i]);
      }
      if (!flips.length) {
        for (i = 0; i < fields.length; i++) setPath(fields[i], isDec(saved[fields[i]]) ? huge() : Number.MAX_VALUE / 1e10);
        var all = false;
        try { all = !!test(); } catch (e) { all = false; }
        restoreAll();
        return { probeable: false, why: all ? 'conjunction: no single field flips it, all of them do' : 'not a numeric gate: raising every traced field does not flip it', fields: fields, reads: tr.reads };
      }
      var dim = flips[0];
      var asDecimal = isDec(saved[dim]);
      var r = probeField(dim, test, asDecimal);
      setPath(dim, saved[dim]);
      return { probeable: true, dimension: dim, threshold: r.threshold, exact: r.exact, how: r.note, held: dstr(saved[dim]), alsoFlips: flips.slice(1), fields: fields };
    } finally { restoreAll(); }
  };

  // ---- currency resolution ---------------------------------------------------------------------------------------
  // Mirrors the engine's canAffordPurchase (2.2.1 utils.js:706-724): currencyInternalName with currencyLocation /
  // currencyLayer / neither, else the layer's own points. A currencyLocation is an OBJECT, not a path — its path is
  // recovered by identity search inside `player` (generic; no name appears here).
  function locatePath(obj) {
    if (!obj || typeof obj !== 'object') return null;
    var ls = Object.keys(player), i, j;
    for (i = 0; i < ls.length; i++) {
      var v = player[ls[i]];
      if (v === obj) return 'player.' + ls[i];
      if (!v || typeof v !== 'object' || isDec(v) || Array.isArray(v)) continue;
      var ks = Object.keys(v);
      for (j = 0; j < ks.length; j++) if (v[ks[j]] === obj) return 'player.' + ls[i] + '.' + ks[j];
    }
    return null;
  }
  function currencyOf(layer, thing) {
    if (!thing) return { dimension: 'player.' + layer + '.points', how: 'the layer\'s own points' };
    var name = thing.currencyInternalName;
    if (!name) return { dimension: 'player.' + layer + '.points', how: 'the layer\'s own points' };
    if (thing.currencyLocation) {
      var base = locatePath(thing.currencyLocation);
      return base ? { dimension: base + '.' + name, how: 'currencyLocation (located by identity in player)' }
                  : { dimension: null, how: 'currencyLocation is not reachable from player', currency: name };
    }
    if (thing.currencyLayer) return { dimension: 'player.' + thing.currencyLayer + '.' + name, how: 'currencyLayer + currencyInternalName' };
    return { dimension: 'player.' + name, how: 'currencyInternalName on player' };
  }

  // The dimension a layer's requirement is measured in: the fields layers[l].baseAmount() reads. One numeric read is
  // the dimension; several make it multi (recorded, not guessed).
  function baseDimension(l) {
    var L = layers[l];
    if (!L || typeof L.baseAmount !== 'function') return { dimension: null, how: 'the layer declares no baseAmount()' };
    var tr = traceReads(function () { return L.baseAmount.call(L); });
    if (tr.error) return { dimension: null, how: 'baseAmount() throws: ' + tr.error };
    if (tr.numeric.length === 1) return { dimension: tr.numeric[0], how: 'traced through baseAmount()' };
    if (!tr.numeric.length) return { dimension: null, how: 'baseAmount() reads no numeric player field', reads: tr.reads.map(function (r) { return r.path; }) };
    return { dimension: tr.numeric[0], how: 'traced through baseAmount(), several fields read', multi: tr.numeric.slice() };
  }
  P.baseDimension = baseDimension;

  // ---- Part 2: the knowledge walk --------------------------------------------------------------------------------
  function owned(l, id) { var u = player[l] && player[l].upgrades || []; return u.indexOf(Number(id)) >= 0 || u.indexOf(String(id)) >= 0; }
  function held(l, kind, id) {
    var p = player[l];
    if (!p) return false;
    if (kind === 'upg') return owned(l, id);
    if (kind === 'ms') return (p.milestones || []).map(String).indexOf(String(id)) >= 0;
    if (kind === 'ach') return (p.achievements || []).map(String).indexOf(String(id)) >= 0;
    return false;
  }
  function tmpItem(l, group, id) { return tmp[l] && tmp[l][group] ? tmp[l][group][id] : undefined; }

  /** Every goal the game currently OFFERS, with its dimension and threshold. Held goals are excluded. */
  function goalWalk(opts) {
    opts = opts || {};
    var out = [], hidden = [], notes = [];
    var ls = allLayers(), i, j, ids, id, L, t;
    for (i = 0; i < ls.length; i++) {
      var l = ls[i];
      L = layers[l]; t = tmp[l];
      if (!L || !t || !player[l]) continue;
      var shown = layerShown(l), unl = unlockedLayer(l);
      // 1. unlock:<l> — a shown, locked layer. Dimension = what its baseAmount() reads; threshold = tmp.requires.
      if (shown && !unl) {
        var bd = baseDimension(l);
        out.push({ id: 'unlock:' + l, kind: 'unlock', layer: l, dimension: bd.dimension, dimensionHow: bd.how,
          threshold: t.requires === undefined ? null : dstr(t.requires), held: bd.dimension ? dstr(getPath(bd.dimension)) : dstr(t.baseAmount), source: 'tmp.requires / tmp.baseAmount' });
      }
      // 2. layer-next:<l> — the next reset's requirement of an unlocked layer.
      if (unl && t.nextAt !== undefined && t.type !== 'none') {
        var bd2 = baseDimension(l);
        out.push({ id: 'layer-next:' + l, kind: 'layer-next', layer: l, dimension: bd2.dimension, dimensionHow: bd2.how,
          threshold: dstr(t.nextAt), held: bd2.dimension ? dstr(getPath(bd2.dimension)) : dstr(t.baseAmount), source: 'tmp.nextAt' });
      }
      // 3. upg:<l>:<id> — unlocked and unowned. A pseudo-upgrade (pseudoUnl, the discoverable class) that is not
      //    unlocked yet is HIDDEN, not offered: its gate is traced, never guessed.
      if (L.upgrades) {
        ids = numIds(L.upgrades);
        for (j = 0; j < ids.length; j++) {
          id = ids[j];
          if (held(l, 'upg', id)) continue;
          var U = tmpItem(l, 'upgrades', id), decl = L.upgrades[id];
          var uUnl = itemUnlocked(decl, U);
          var cur = currencyOf(l, U || decl);
          var row = { id: 'upg:' + l + ':' + id, kind: 'upg', layer: l, item: id, dimension: cur.dimension, dimensionHow: cur.how,
            threshold: U && U.cost !== undefined ? dstr(U.cost) : null, held: cur.dimension ? dstr(getPath(cur.dimension)) : null, source: 'tmp.upgrades[' + id + '].cost' };
          if (U && U.multiRes) { row.multiRes = true; row.dimensions = U.multiRes.map(function (m) { var c = currencyOf(l, m); return { dimension: c.dimension, threshold: dstr(m.cost) }; }); }
          if (!unl || !uUnl) {
            row.hidden = true;
            row.gate = traceGate(l, decl, unl, uUnl, row.id);
            hidden.push(row);
          } else out.push(row);
        }
      }
      // 4. buy:<l>:<id> — the next level of an unlocked buyable.
      if (L.buyables && unl) {
        ids = numIds(L.buyables);
        for (j = 0; j < ids.length; j++) {
          id = ids[j];
          var B = tmpItem(l, 'buyables', id);
          var bUnl = itemUnlocked(L.buyables[id], B);
          var cb = currencyOf(l, B || L.buyables[id]);
          var brow = { id: 'buy:' + l + ':' + id, kind: 'buy', layer: l, item: id, dimension: cb.dimension, dimensionHow: cb.how,
            threshold: B && B.cost !== undefined ? dstr(B.cost) : null, held: cb.dimension ? dstr(getPath(cb.dimension)) : null,
            amount: player[l].buyables ? dstr(player[l].buyables[id]) : null, source: 'tmp.buyables[' + id + '].cost' };
          if (bUnl) out.push(brow);
          else { brow.hidden = true; brow.gate = traceGate(l, L.buyables[id], unl, bUnl, brow.id); hidden.push(brow); }
        }
      }
      // 5. ms / ach — no declared cost: dimension and threshold by PROBING done().
      var probeKinds = [['milestones', 'ms'], ['achievements', 'ach']];
      for (var pk = 0; pk < probeKinds.length; pk++) {
        var group = probeKinds[pk][0], kd = probeKinds[pk][1];
        if (!L[group]) continue;
        ids = numIds(L[group]);
        for (j = 0; j < ids.length; j++) {
          id = ids[j];
          if (held(l, kd, id)) continue;
          var decl2 = L[group][id];
          if (!decl2 || typeof decl2.done !== 'function') continue;
          var mrow = { id: kd + ':' + l + ':' + id, kind: kd, layer: l, item: id, dimension: null, threshold: null, held: null, source: 'probed: done()' };
          if (opts.probe === false) { mrow.unprobeable = 'probing off'; out.push(mrow); continue; }
          var pr = P.probe(function () { return decl2.done.call(decl2); });
          if (pr.probeable) {
            mrow.dimension = pr.dimension; mrow.dimensionHow = 'probed (Pass A)'; mrow.threshold = pr.threshold;
            mrow.held = dstr(getPath(pr.dimension)); mrow.exact = pr.exact; mrow.probeHow = pr.how;
            if (pr.alsoFlips && pr.alsoFlips.length) mrow.alsoFlips = pr.alsoFlips;
          } else {
            mrow.unprobeable = pr.why;
            mrow.reads = (pr.reads || []).map(function (r) { return r.path; });
            mrow.fields = pr.fields || mrow.reads;
            // A done() no number gates is usually gated on what the player HOLDS — the same membership probe the hidden
            // gates use turns "no numeric field read" into "it needs that upgrade / milestone / achievement".
            var doneFn = (function (d2) { return function () { return d2.done.call(d2); }; })(decl2);
            var req = probeMembership(doneFn, mrow.reads, mrow.id);
            if (req.length) mrow.requires = req;
          }
          out.push(mrow);
        }
      }
      // 6. ch:<l>:<id> — the challenge goal and its currency. `unlocked` is read LIVE (tmp skips it outside the tab).
      if (L.challenges && unl) {
        ids = numIds(L.challenges);
        for (j = 0; j < ids.length; j++) {
          id = ids[j];
          var C = L.challenges[id], Ct = tmpItem(l, 'challenges', id);
          if (!itemUnlocked(C, Ct)) continue;
          var limit = Ct && Ct.completionLimit !== undefined ? Number(Ct.completionLimit) : 1;
          var done = Number(player[l].challenges && player[l].challenges[id] || 0);
          if (done >= limit) continue;
          var cc = currencyOf(l, Ct || C);
          out.push({ id: 'ch:' + l + ':' + id, kind: 'ch', layer: l, item: id, dimension: cc.dimension, dimensionHow: cc.how,
            threshold: Ct && Ct.goal !== undefined ? dstr(Ct.goal) : null, held: cc.dimension ? dstr(getPath(cc.dimension)) : null,
            completions: done, completionLimit: limit, active: Number(player[l].activeChallenge || 0) === id, source: 'tmp.challenges[' + id + '].goal' });
        }
      }
    }
    return { goals: out, hidden: hidden, notes: notes };
  }

  // A hidden goal's gating condition: the fields its unlocked() (and any pseudo-gate the engine declares) reads —
  // traced, never named. TMT keeps "what the player holds" in per-layer ARRAYS (upgrades / milestones / achievements)
  // and a challenges map, so a gate that reads one of those is asking for a specific MEMBER. Which one is discovered by
  // PERTURBATION: add each declared id in turn on the copy and re-evaluate the gate (the array analogue of the numeric
  // threshold probe). That is what turns "this upgrade is hidden" into "it needs that one".
  var HOLD_GROUPS = { upgrades: 'upg', milestones: 'ms', achievements: 'ach' };
  function probeMembership(test, readPaths, self) {
    var needs = [], i, j, m, l2, group, ids, id;
    // A predicate that short-circuits on "already held" flips when its OWN id is added: that is not a requirement.
    var keep = function (gid) { if (gid !== self && needs.indexOf(gid) < 0) needs.push(gid); };
    var seenPath = {};
    for (i = 0; i < readPaths.length; i++) {
      var path = readPaths[i];
      if (seenPath[path]) continue;
      seenPath[path] = 1;
      m = /^player\.([^.]+)\.(upgrades|milestones|achievements)$/.exec(path);
      if (m) {
        l2 = m[1]; group = m[2];
        if (!layers[l2] || !layers[l2][group] || !player[l2] || !Array.isArray(player[l2][group])) continue;
        var arr = player[l2][group];
        ids = numIds(layers[l2][group]);
        for (j = 0; j < ids.length; j++) {
          id = ids[j];
          if (arr.map(String).indexOf(String(id)) >= 0) continue;
          arr.push(id);
          var flip = false;
          try { flip = !!test(); } catch (e) { flip = false; }
          arr.pop();
          if (flip) keep(HOLD_GROUPS[group] + ':' + l2 + ':' + id);
        }
        continue;
      }
      m = /^player\.([^.]+)\.challenges$/.exec(path);
      if (m) {
        l2 = m[1];
        if (!layers[l2] || !layers[l2].challenges || !player[l2] || !player[l2].challenges) continue;
        ids = numIds(layers[l2].challenges);
        for (j = 0; j < ids.length; j++) {
          id = ids[j];
          var was = player[l2].challenges[id];
          player[l2].challenges[id] = (Number(was) || 0) + 1e6;
          var f2 = false;
          try { f2 = !!test(); } catch (e) { f2 = false; }
          player[l2].challenges[id] = was;
          if (f2) keep('ch:' + l2 + ':' + id);
        }
      }
    }
    return needs;
  }

  function traceGate(l, decl, layerUnlocked, itemIsUnlocked, selfId) {
    var g = { layerUnlocked: layerUnlocked, itemUnlocked: itemIsUnlocked, conditions: [], requires: [] };
    var names = ['unlocked', 'pseudoUnl', 'pseudoCan'];
    for (var i = 0; i < names.length; i++) {
      if (!decl || typeof decl[names[i]] !== 'function') continue;
      var fn = (function (nm) { return function () { return decl[nm].call(decl); }; })(names[i]);
      var tr = traceReads(fn);
      var cond = { which: names[i], value: tr.error ? null : !!tr.value, error: tr.error, fields: tr.reads.map(function (r) { return r.path; }) };
      if (cond.value === false) {
        cond.requires = probeMembership(fn, cond.fields, selfId);
        for (var j = 0; j < cond.requires.length; j++) if (g.requires.indexOf(cond.requires[j]) < 0) g.requires.push(cond.requires[j]);
        var pr = P.probe(fn);
        if (pr.probeable) { cond.dimension = pr.dimension; cond.threshold = pr.threshold; cond.held = pr.held; }
        else cond.unprobeable = pr.why;
      }
      g.conditions.push(cond);
    }
    if (!layerUnlocked) { g.conditions.push({ which: 'layer', value: false, fields: ['player.' + l + '.unlocked'] }); if (g.requires.indexOf('unlock:' + l) < 0) g.requires.push('unlock:' + l); }
    return g;
  }

  /**
   * Producers: what MOVES a dimension, measured on the copy.
   *   wait      — tick k game-seconds with the simple system's current profile; every numeric leaf that moved, and by
   *               how much per game-second.
   *   reset:<l> — doReset(l) on the copy: the gain it took, then k ticks for the post-reset regrowth (P1b's capacity
   *               probe seed). Its own requirement is the next hop of a chain.
   * One excursion for the wait, one per reset layer. `k` is on the record; nothing here reads a clock.
   */
  function producerWalk(dims, k, heads) {
    k = Number(k || 10);
    // The WAIT producer. A net rate alone lies here: with the simple system running, a dimension that a reset empties
    // and regrows can come back to EXACTLY its starting value over the window and read as inert (measured on PTR at
    // M09: player.points oscillates 10 → 0 → 5.5e9 → 10 across 10 ticks, net 0). So the window is sampled EVERY tick
    // and each path carries min / max as well as the net rate; "nothing moves this" means max === min, not rate === 0.
    var wait = P.excursion(function () {
      var first = leafMap(3), cur = first, seen = {}, p;
      for (p in first) if (first[p] !== null) seen[p] = { min: first[p], max: first[p] };
      for (var i = 0; i < k; i++) {
        T.tick(1, 1);
        cur = leafMap(3);
        for (p in cur) {
          if (cur[p] === null) continue;
          if (!seen[p]) { seen[p] = { min: cur[p], max: cur[p] }; continue; }
          if (cur[p].lt(seen[p].min)) seen[p].min = cur[p];
          if (cur[p].gt(seen[p].max)) seen[p].max = cur[p];
        }
      }
      var rates = {}, moved = [];
      for (p in cur) {
        if (cur[p] === null || !(p in first) || first[p] === null) continue;
        var range = seen[p];
        var still = range.max.eq(range.min);
        if (still) continue;
        rates[p] = { rate: dstr(cur[p].sub(first[p]).div(k)), first: dstr(first[p]), last: dstr(cur[p]), min: dstr(range.min), max: dstr(range.max) };
        moved.push(p);
      }
      return { kind: 'wait', ticks: k, diff: 1, profile: T.profileName, rates: rates, moved: moved.sort() };
    });
    var resets = [];
    for (var i = 0; i < heads.length; i++) resets.push(measureReset(heads[i], k));
    var byDim = {}, all = {}, q;
    for (q = 0; q < dims.length; q++) if (dims[q]) all[dims[q]] = 1;
    for (q in wait.rates) all[q] = 1;
    for (q = 0; q < resets.length; q++) for (var dq in (resets[q].delta || {})) all[dq] = 1;
    var allDims = Object.keys(all).sort();
    for (var d = 0; d < allDims.length; d++) {
      var dim = allDims[d];
      var list = [];
      if (wait.rates[dim] !== undefined) list.push({ producer: 'wait', rate: wait.rates[dim].rate, per: 'game-second', min: wait.rates[dim].min, max: wait.rates[dim].max });
      for (var r2 = 0; r2 < resets.length; r2++) {
        var R = resets[r2];
        if (!R.delta || R.delta[dim] === undefined) continue;
        if (D(R.delta[dim]).lte(0)) continue;   // a negative delta is what the reset COSTS, not what it produces
        list.push({ producer: 'reset:' + R.layer, delta: R.delta[dim], canReset: R.canReset, canResetAtMeasure: R.canResetAtMeasure, atRequirement: !!R.atRequirement,
          resetAt: R.resetAt, requires: R.requires, nextAt: R.nextAt, requiresDimension: R.requiresDimension, baseAmount: R.baseAmount, regrowth: R.regrowth ? R.regrowth[dim] : undefined });
      }
      if (list.length) byDim[dim] = list;
    }
    return { wait: wait, resets: resets, byDimension: byDim, k: k };
  }

  // The tmp-derived half of a reset producer, read from the LIVE tmp before any excursion. It must be captured up
  // front: PTR's getNextAt is self-referential (game.js:36-52 reads tmp[layer].nextAt and tmp[layer].baseAmount), so a
  // restore's updateTemp moves it, and a walk that read some layers before an excursion and others after would mix two
  // instants. Measured at the frontier: tmp.b.nextAt is 2.33e276 in the uninterrupted run and 9.85e167 after a resume
  // at a BYTE-IDENTICAL player — tmp is not a pure function of player.
  function resetHead(l) {
    var bd = baseDimension(l);
    var head = { layer: l, kind: 'reset', canReset: tmp[l].canReset === true, type: tmp[l].type === undefined ? null : String(tmp[l].type),
      resetGain: tmp[l].resetGain === undefined ? null : dstr(tmp[l].resetGain), requires: tmp[l].requires === undefined ? null : dstr(tmp[l].requires),
      nextAt: tmp[l].nextAt === undefined ? null : dstr(tmp[l].nextAt), requiresDimension: bd.dimension,
      baseAmount: tmp[l].baseAmount === undefined ? null : dstr(tmp[l].baseAmount), unlocked: unlockedLayer(l) };
    // What the base dimension must REACH, by the engine's own canReset (game.js:114-124): a static layer waits for
    // nextAt (the next level's cost), a normal one for requires. Naming `requires` for a static layer would report 200
    // where the wall is 2.33e276.
    head.resetAt = head.type === 'static' ? head.nextAt : head.requires;
    return head;
  }

  function measureReset(head, k) {
    var l = head.layer;
    // A reset the game will not allow right now still has to appear in a chain — "e points come from an e reset, which
    // needs 1e600 points" is the answer the regression is for. So it is measured with the requirement INJECTED on the
    // copy (omsi's injected-resource measurement, AUTOMATION.md §3.3): raise the layer's own base dimension to its
    // requirement, updateTemp, and measure the reset from THERE. Every such row carries atRequirement: true.
    var m = P.excursion(function () {
      // tmp is path-dependent (see restore), so whether this layer can reset is decided HERE, on the copy, not from
      // the head. If it cannot, the requirement is injected into its base dimension and the reset is measured from
      // there (omsi's injected-resource measurement) — every such row carries atRequirement: true.
      var inject = null, can = tmp[l].canReset === true;
      if (!can) {
        if (!head.requiresDimension || head.resetAt == null) return { blocked: 'canReset is false and the requirement has no traced dimension' };
        // The requirement can MOVE with the injection: a static layer's nextAt is a function of the base dimension
        // through gainMult (measured on PTR's b at the frontier — injecting points at nextAt raised nextAt). So the
        // injection chases the fixed point a bounded number of times, and says so if it does not reach one.
        var target = head.resetAt, rounds = [];
        for (var r0 = 0; r0 < 4; r0++) {
          var cur = getPath(head.requiresDimension);
          setPath(head.requiresDimension, isDec(cur) ? D(target) : Number(target));
          for (var z = 0; z < P.settlePasses; z++) need('updateTemp')();
          rounds.push(target);
          if (tmp[l].canReset === true) break;
          var next = tmp[l].type === 'static' ? tmp[l].nextAt : tmp[l].requires;
          if (next === undefined) break;
          var nx = dstr(next);
          if (nx === target) break;
          target = nx;
        }
        inject = { dimension: head.requiresDimension, to: target, rounds: rounds.length };
        if (tmp[l].canReset !== true) return { blocked: 'canReset is still false after ' + rounds.length + ' injection rounds (' + head.requiresDimension + ' up to ' + target + ')', inject: inject };
      }
      var before = leafMap(3);
      need('doReset')(l);
      need('updateTemp')();
      var after = leafMap(3), delta = {}, p;
      for (p in after) { if (!(p in before) || before[p] === null || after[p] === null) continue; if (!after[p].eq(before[p])) delta[p] = dstr(after[p].sub(before[p])); }
      var gain = after['player.' + l + '.points'] && before['player.' + l + '.points'] ? dstr(after['player.' + l + '.points'].sub(before['player.' + l + '.points'])) : null;
      T.tick(1, k);
      var later = leafMap(3), regrowth = {};
      for (p in later) { if (!(p in after) || after[p] === null || later[p] === null) continue; if (!later[p].eq(after[p])) regrowth[p] = dstr(later[p].sub(after[p]).div(k)); }
      return { delta: delta, regrowth: regrowth, measuredGain: gain, inject: inject, canResetAtMeasure: can };
    });
    if (m.blocked) { head.notMeasured = m.blocked; if (m.inject) head.injected = m.inject; return head; }
    head.delta = m.delta;
    head.regrowth = m.regrowth;
    head.regrowthTicks = k;
    head.measuredGain = m.measuredGain;
    head.canResetAtMeasure = m.canResetAtMeasure;
    if (m.inject) { head.atRequirement = true; head.injected = m.inject; }
    return head;
  }

  /**
   * The regression chain of one goal: goal → dimension → the producers that move it → (a reset's own requirement →
   * its dimension → …) down to the game's own points, depth-limited, cycles cut. Each hop names the measured rate and
   * whether it is currently IMPOSSIBLE — a locked layer, canReset false with the requirement above the base amount, or
   * a dimension nothing measured moves (a capped sub-resource).
   */
  function chainOf(goal, prod, maxDepth, index) {
    var hops = [], seenGoal = {}, seenDim = {}, depth = 0, g = goal, i;
    // A HIDDEN goal's first hop is its GATE, not a dimension: "t23 needs t13" comes from the membership probe, and the
    // regression continues into that goal. Cycles are cut; an unresolved requirement stops the walk and says so.
    var needsOf = function (x) {
      if (x && x.gate && x.gate.requires && x.gate.requires.length) return x.gate.requires;
      if (x && x.requires && x.requires.length) return x.requires;
      return null;
    };
    while (g && needsOf(g) && depth < maxDepth) {
      if (seenGoal[g.id]) { hops.push({ gate: g.id, cut: 'cycle' }); g = null; break; }
      seenGoal[g.id] = 1;
      var needs = needsOf(g);
      var hop = { gate: g.id, needs: needs.slice() };
      hops.push(hop);
      var next = index[needs[0]];
      if (!next) { hop.unresolved = needs[0]; g = null; break; }
      g = next;
      depth++;
    }
    var dim = g ? g.dimension : null, threshold = g ? g.threshold : null;
    while (dim && depth < maxDepth) {
      if (seenDim[dim]) { hops.push({ dimension: dim, cut: 'cycle' }); break; }
      seenDim[dim] = 1;
      var list = prod.byDimension[dim] || [];
      if (!list.length && prod.wait.rates[dim] !== undefined) list = [{ producer: 'wait', rate: prod.wait.rates[dim].rate, per: 'game-second', min: prod.wait.rates[dim].min, max: prod.wait.rates[dim].max }];
      // The hop NAMES its producers; the measured detail for each lives once in producers.byDimension (a chain that
      // repeated it made the dump 2.5× larger and said nothing new).
      var h = { dimension: dim, held: dstr(getPath(dim)), threshold: threshold === undefined ? null : threshold,
        producers: list.map(function (x) { return x.producer; }) };
      var waitHop = null;
      for (i = 0; i < list.length; i++) if (list[i].producer === 'wait') waitHop = list[i];
      if (waitHop) { h.rate = waitHop.rate; h.windowMin = waitHop.min; h.windowMax = waitHop.max; }
      var shortfall = threshold != null && h.held != null && D(h.held).lt(D(threshold));
      var resetHop = null;
      for (i = 0; i < list.length; i++) if (list[i].producer !== 'wait') { resetHop = list[i]; break; }
      // inert = the wait window never moved it at all (max === min: it is not in `rates`), and no reset produces it
      if (shortfall && !resetHop && !waitHop) h.impossible = { why: 'no measured producer moves this dimension: it did not move at all over the ' + prod.k + '-game-second wait (capped or inert)', window: prod.k };
      else if (resetHop && resetHop.canReset === false) {
        var L2 = resetHop.producer.slice('reset:'.length);
        // "canReset is false" is only a WALL when waiting does not fix it. The wait window already measured how high
        // the requiring dimension got: if it reached the requirement inside the window the reset is merely PENDING (the
        // base amount is between two resets), and calling that impossible would name the wrong wall.
        var rd = resetHop.requiresDimension, w = rd ? prod.wait.rates[rd] : null;
        var reached = !!(w && resetHop.resetAt != null && D(w.max).gte(D(resetHop.resetAt)));
        if (!layerShown(L2)) h.impossible = { why: 'the producing layer is not shown', layer: L2 };
        else if (reached) h.pending = { why: 'canReset is false at this instant, but the requirement was reached inside the wait window', layer: L2, resetAt: resetHop.resetAt, baseAmount: resetHop.baseAmount, windowMax: w.max, window: prod.k };
        else h.impossible = { why: 'canReset is false: the requirement is above the base amount', layer: L2, resetAt: resetHop.resetAt, requires: resetHop.requires, nextAt: resetHop.nextAt, baseAmount: resetHop.baseAmount, requiresDimension: rd, windowMax: w ? w.max : null };
      }
      hops.push(h);
      if (!resetHop || !resetHop.requiresDimension) break;
      dim = resetHop.requiresDimension;
      threshold = resetHop.canReset === false ? resetHop.resetAt : null;
      depth++;
    }
    var first = null;
    for (var j = 0; j < hops.length; j++) if (hops[j].impossible) { first = { at: j, dimension: hops[j].dimension, impossible: hops[j].impossible }; break; }
    return { goal: goal.id, hidden: !!goal.hidden, hops: hops, firstImpossible: first, depth: hops.length };
  }

  /** knowledge(): goals, producers and chains — one deterministic walk, everything measured on a copy. */
  P.knowledge = function (opts) {
    opts = opts || {};
    var k = Number(opts.k || 10), maxDepth = Number(opts.depth || 6);
    var h0 = P.hashes();
    // Every probe runs on a COPY: one excursion around the whole goal walk, so a perturbed field can never survive.
    var heads = [], hl = allLayers();
    for (var q = 0; q < hl.length; q++) {
      var lq = hl[q];
      if (!layers[lq] || !player[lq] || !tmp[lq]) continue;
      if (!layerShown(lq)) continue;
      if (tmp[lq].type === 'none' || tmp[lq].type === undefined) continue;
      heads.push(resetHead(lq));
    }
    var walked = P.excursion(function () { return goalWalk(opts); });
    var dims = {}, i;
    for (i = 0; i < walked.goals.length; i++) if (walked.goals[i].dimension) dims[walked.goals[i].dimension] = 1;
    dims['player.points'] = 1;
    var dimList = Object.keys(dims).sort();
    var prod = producerWalk(dimList, k, heads);
    var index = {};
    for (i = 0; i < walked.goals.length; i++) index[walked.goals[i].id] = walked.goals[i];
    for (i = 0; i < walked.hidden.length; i++) if (!index[walked.hidden[i].id]) index[walked.hidden[i].id] = walked.hidden[i];
    var chains = [];
    for (i = 0; i < walked.goals.length; i++) chains.push(chainOf(walked.goals[i], prod, maxDepth, index));
    for (i = 0; i < walked.hidden.length; i++) chains.push(chainOf(walked.hidden[i], prod, maxDepth, index));
    var counts = { total: walked.goals.length, hidden: walked.hidden.length, byKind: {} };
    for (i = 0; i < walked.goals.length; i++) counts.byKind[walked.goals[i].kind] = (counts.byKind[walked.goals[i].kind] || 0) + 1;
    counts.unprobeable = walked.goals.filter(function (g) { return g.unprobeable; }).length;
    return {
      contract: P.contract, game: T.id || null, ticks: T.ticks, gameSeconds: T.gameSeconds, profile: T.profileName,
      probeTicks: k, depth: maxDepth, counts: counts,
      goals: walked.goals, hidden: walked.hidden, dimensions: dimList,
      producers: { wait: prod.wait, resets: prod.resets, byDimension: prod.byDimension, k: prod.k },
      chains: chains,
      // the walk's own selftest (omsi AUTOMATION.md §3.2: probing asserts the snapshot is identical before and after)
      stateNeutral: P.hashes().hashGame === h0.hashGame && P.hashes().hash === h0.hash,
    };
  };

  // ---- Part 3: the two goal sources -------------------------------------------------------------------------------
  // The ladder (authored data, tmtLoader.plannerLadder — the harness hands it in) is the STICKY list; the knowledge
  // walk's goals are the discovered fallback pool. A mark's predicate is resolved to knowledge goal ids through the
  // ENGINE's own predicate helpers (hasUpgrade / hasMilestone / … are TMT API, not game knowledge); anything else stays
  // a predicate-only goal.
  var MARK_PATTERNS = [
    { re: /^hasUpgrade\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)$/, to: function (m) { return 'upg:' + m[1] + ':' + m[2]; } },
    { re: /^hasMilestone\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)$/, to: function (m) { return 'ms:' + m[1] + ':' + m[2]; } },
    { re: /^hasAchievement\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)$/, to: function (m) { return 'ach:' + m[1] + ':' + m[2]; } },
    { re: /^hasChallenge\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)$/, to: function (m) { return 'ch:' + m[1] + ':' + m[2]; } },
    { re: /^challengeCompletions\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)\s*>=?\s*\d+$/, to: function (m) { return 'ch:' + m[1] + ':' + m[2]; } },
    { re: /^getBuyableAmount\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)\.(?:gte|gt|eq)\(.*\)$/, to: function (m) { return 'buy:' + m[1] + ':' + m[2]; } },
    { re: /^player\.([A-Za-z_$][\w$]*)\.unlocked$/, to: function (m) { return 'unlock:' + m[1]; } },
  ];
  // A milestone's `toggles: [[layer, field], …]` declaration is how TMT grants a native automation flag, so a mark that
  // names such a flag (player.<l>.<field>) resolves to the milestone that grants it — discovered from the declarations,
  // the same walk tmt-auto.js derives its `toggles` features from.
  function toggleIndex() {
    var idx = {}, ls = allLayers();
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i], M = layers[l] && layers[l].milestones;
      if (!M) continue;
      var ids = numIds(M);
      for (var j = 0; j < ids.length; j++) {
        var tg = M[ids[j]].toggles;
        if (!Array.isArray(tg)) continue;
        for (var t = 0; t < tg.length; t++) if (Array.isArray(tg[t]) && typeof tg[t][0] === 'string' && typeof tg[t][1] === 'string') idx['player.' + tg[t][0] + '.' + tg[t][1]] = 'ms:' + l + ':' + ids[j];
      }
    }
    return idx;
  }
  var VALUE_RE = /^(player\.[A-Za-z_$][\w$.]*)\.(?:gte|gt)\((.*)\)$/;
  function resolveMark(src) {
    var parts = String(src).split('&&').map(function (s) { return s.trim().replace(/^\((.*)\)$/, '$1').trim(); });
    var ids = [], values = [], unresolved = [], toggles = toggleIndex();
    for (var i = 0; i < parts.length; i++) {
      var hit = null, m, j;
      for (j = 0; j < MARK_PATTERNS.length; j++) {
        m = MARK_PATTERNS[j].re.exec(parts[i]);
        if (m) { hit = MARK_PATTERNS[j].to(m); break; }
      }
      if (!hit && toggles[parts[i]]) hit = toggles[parts[i]];            // a native toggle: the milestone that grants it
      if (hit) { if (ids.indexOf(hit) < 0) ids.push(hit); continue; }     // two clauses can name the same goal
      m = VALUE_RE.exec(parts[i]);
      if (m) {
        // a VALUE goal (omsi's kind-b): the threshold expression is evaluated in the game's own scope, never parsed
        var thr = null;
        try { thr = dstr(T.predicate(m[2])()); } catch (e) { thr = null; }
        if (thr !== null) { values.push({ id: 'value:' + m[1] + '>=' + thr, dimension: m[1], threshold: thr, src: parts[i] }); continue; }
      }
      unresolved.push(parts[i]);
    }
    return { ids: ids, values: values, unresolved: unresolved };
  }
  P.resolveMark = resolveMark;

  // distance = threshold / (held + rate × 1 game-second) — the omsi frontier idea, on measured numbers. Ties by kind
  // then id, so the order is stable. Returned as log10 (a Decimal ratio does not sort in a float comparator).
  var KIND_ORDER = ['unlock', 'upg', 'buy', 'ms', 'ach', 'ch', 'layer-next'];
  function distanceOf(g, prod) {
    if (g.threshold == null || g.held == null) return { distance: null, why: 'no threshold or no held value' };
    var rate = g.dimension && prod.wait.rates[g.dimension] !== undefined ? prod.wait.rates[g.dimension].rate : '0';
    var denom = D(g.held).plus(D(rate));
    if (denom.lte(0)) return { distance: null, rate: rate, why: 'nothing held and no measured rate' };
    var l = lg(D(g.threshold)) - lg(denom);
    return { distance: isFinite(l) ? l : null, log10: isFinite(l) ? l : null, rate: rate };
  }

  /** A chain for any {id, dimension, threshold} against an existing knowledge dump (a mark's value goal). */
  P.chainFor = function (goal, K) {
    var index = {}, i;
    for (i = 0; i < K.goals.length; i++) index[K.goals[i].id] = K.goals[i];
    for (i = 0; i < K.hidden.length; i++) if (!index[K.hidden[i].id]) index[K.hidden[i].id] = K.hidden[i];
    return chainOf(goal, K.producers, Number(K.depth || 6), index);
  };

  /** goals(): {sticky, discovered} — the two sources, one API. Both are DATA (JSON), decided by nobody yet. */
  P.goals = function (opts) {
    opts = opts || {};
    var K = opts.knowledge || P.knowledge(opts);
    var byId = {}, i, j;
    for (i = 0; i < K.goals.length; i++) byId[K.goals[i].id] = K.goals[i];
    var chainById = {};
    for (i = 0; i < K.chains.length; i++) chainById[K.chains[i].goal] = K.chains[i];
    var ladder = opts.ladder || T.plannerLadder || null;
    var marks = ladder ? (Array.isArray(ladder) ? ladder : ladder.marks || []) : [];
    var sticky = [];
    for (i = 0; i < marks.length; i++) {
      var m = marks[i];
      var holdsNow = false, perr = null;
      try { holdsNow = !!T.predicate(m.predicate)(); } catch (e) { perr = String(e && e.message || e).slice(0, 120); }
      if (holdsNow) continue;
      var r = resolveMark(m.predicate);
      var entry = { mark: m.id, name: m.name || null, predicate: m.predicate, predicateError: perr, resolved: [], values: [], unresolved: r.unresolved, chains: [] };
      for (j = 0; j < r.values.length; j++) {
        var v = r.values[j];
        entry.values.push({ id: v.id, dimension: v.dimension, threshold: v.threshold, held: dstr(getPath(v.dimension)) });
        entry.chains.push(P.chainFor(v, K));
      }
      for (j = 0; j < r.ids.length; j++) {
        var gid = r.ids[j];
        var g = byId[gid] || null;
        entry.resolved.push({ id: gid, offered: !!g, dimension: g ? g.dimension : null, threshold: g ? g.threshold : null, held: g ? g.held : null });
        if (chainById[gid]) entry.chains.push(chainById[gid]);
      }
      if (!r.ids.length && !r.values.length) entry.kind = 'predicate-only';
      sticky.push(entry);
    }
    var discovered = K.goals.map(function (g) {
      var d = distanceOf(g, K.producers);
      return { id: g.id, kind: g.kind, layer: g.layer, dimension: g.dimension, threshold: g.threshold, held: g.held,
        rate: d.rate === undefined ? null : d.rate, distanceLog10: d.distance === null ? null : d.distance, why: d.why || null,
        firstImpossible: chainById[g.id] ? chainById[g.id].firstImpossible : null };
    });
    discovered.sort(function (a, b) {
      var da = a.distanceLog10, db = b.distanceLog10;
      if (da === null && db !== null) return 1;
      if (db === null && da !== null) return -1;
      if (da !== null && db !== null && da !== db) return da - db;
      var ka = KIND_ORDER.indexOf(a.kind), kb = KIND_ORDER.indexOf(b.kind);
      if (ka !== kb) return ka - kb;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    return { contract: P.contract, game: T.id || null, ticks: T.ticks, gameSeconds: T.gameSeconds,
      ladder: ladder ? { game: ladder.game || null, marks: marks.length } : null,
      sticky: sticky, discovered: discovered,
      counts: { sticky: sticky.length, discovered: discovered.length, predicateOnly: sticky.filter(function (s) { return s.kind === 'predicate-only'; }).length } };
  };

  /** What the harness dumps at the end of a run (or at a mark). */
  P.dump = function (opts) {
    var K = P.knowledge(opts);
    return { knowledge: K, goals: P.goals({ knowledge: K, ladder: (opts || {}).ladder }) };
  };
})();
