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


  // ---- Part 4: the ROUND — the planner chooses the simple system's CONFIGURATION for an EPOCH ----------------------
  // tmt-automation-plan §11f. The planner does not act per tick: per EPOCH it picks which derived features run, with
  // which policy, by generate-and-test on the rolled-back copy, and commits the winner to the live game. This is omsi's
  // "plan the next loop's queue" with the loop replaced by an epoch and the queue by a reflex configuration.
  //   * the reflexes are engine-generic and already right at the tick level (they read tmp at the moment of acting);
  //     what they cannot do is choose BETWEEN configurations or WAIT.
  //   * a configuration played on the copy for the epoch IS the live outcome (same state, same deterministic engine),
  //     so the winner's measured trajectory is the prediction and any live-vs-copy inequality is a DEFECT, not noise.
  //   * candidates are templates over feature KINDS and POLICY families (T.policyTemplates), never over layer names.
  // Every constant is an OPTION with a default whose provenance is a sweep row (docs/planner.md).
  var OPT_DEFAULTS = {
    k: 300,               // the epoch horizon, in game-seconds: how long each candidate is measured and the winner then runs
    screenK: 4,           // how many screened candidates reach engine confirmation
    maxCandidates: 24,    // the generated set, cut to this ROUND-ROBIN over the features (the incumbent always survives)
    goalStallK: 6,        // rounds without a rise in the target before the active goal is abandoned
    fixK: 3,              // identical winners in a row with no rise before the anti-fixation escalation arms
    wReach: 1000,         // score weight: the active goal reached inside the window (dominant)
    wProgress: 100,       // score weight: log-progress of the target's MAX toward its threshold
    wGoal: 200,           // score weight: the same for the GOAL's own dimension when the target is a setup leaf below it
    wCapacity: 10,        // score weight: is the trajectory still accelerating (last quarter vs first quarter)
    wFrontier: 1,         // score weight: discovered goals that got closer
    knowledgeK: 10,       // the producer wait window of the knowledge walk (P1a's --planner-k)
    depth: 6,             // chain depth of the knowledge walk
    gainX: '2,4',         // the gain>=Nx candidates a reset feature is offered
    intervals: '',        // ⚖ user ruling 2026-09-15 (no arbitrary waiting): EMPTY — no interval candidate is generated
    minRise: 1e-9,        // the log10 rise that counts as a rise for the stall clocks
    reachRounds: 100,     // a goal whose target needs more than this many epochs at the MEASURED rate yields to the next
    maxRounds: 0,         // 0 = unbounded; a bound for a probe
  };
  P.optionDefaults = OPT_DEFAULTS;
  P.options = {};
  for (var od in OPT_DEFAULTS) P.options[od] = OPT_DEFAULTS[od];
  /** --planner-opt k=v;… — every weight and window is a knob, never a literal in a decision. */
  P.setOptions = function (o) {
    for (var k in o || {}) {
      if (!(k in OPT_DEFAULTS)) throw new Error('tmtLoader.planner: unknown option "' + k + '" (known: ' + Object.keys(OPT_DEFAULTS).sort().join(', ') + ')');
      var v = o[k];
      P.options[k] = typeof OPT_DEFAULTS[k] === 'number' ? Number(v) : String(v);
      if (typeof OPT_DEFAULTS[k] === 'number' && !isFinite(P.options[k])) throw new Error('tmtLoader.planner: option "' + k + '" must be a number');
    }
    return P.options;
  };
  var O = function (k) { return P.options[k]; };
  var numList = function (s) { return String(s).split(',').map(function (x) { return Number(x); }).filter(function (x) { return isFinite(x) && x > 0; }); };
  // COST ONLY. No decision anywhere below reads a clock; the wall numbers live in the round log's `cost` block, which
  // the determinism gate strips before comparing two runs' logs.
  var wallMs = function () { try { return Date.now(); } catch (e) { return 0; } };

  P.mode = 'off';                                   // off | suggest | auto  (--planner=auto, docs/harness.md)
  P.rounds = [];                                    // the round log (also --rounds-out); NOT runtime state — a log
  // The planner's memory outside `player`: what it must not forget across a snapshot, an excursion or a resumed
  // 9-minute process. Registered with the simple system's runtimeState so ONE record carries everything (tmt-auto.js).
  var S = null;
  function freshState() {
    return { round: 0, reached: {}, abandoned: {}, clocks: {}, epoch: null, lastWinner: null, sameWinner: 0, escalate: false,
      escalateN: 0, unlocks: null, divergences: [], commits: 0, goal: null };
  }
  S = freshState();
  P.state = function () { return S; };
  if (typeof T.registerRuntime === 'function') T.registerRuntime('planner', function () { return JSON.parse(JSON.stringify(S)); }, function (v) { S = v ? JSON.parse(JSON.stringify(v)) : freshState(); });

  // ---- the configuration of the simple system ---------------------------------------------------------------------
  // A CONFIGURATION is {enabled: {featureId: bool}, policies: {featureId: policy}} over every registered feature, in
  // the registry's own order. `enabled` goes through the runtime override (never player.au.features: a planner decision
  // is not the player's saved toggle), `policies` through setPolicy. Both are runtime state, so an excursion rolls them
  // back with everything else.
  function featureList() { var o = [], fs = T.features || []; for (var i = 0; i < fs.length; i++) o.push(T.featureState(fs[i].id)); return o; }
  function enabledOf(st) { return st.override !== null ? st.override : (T.profileName === 'all' ? true : !!st.saved); }
  function currentConfig() {
    var cfg = { enabled: {}, policies: {} }, fs = featureList();
    for (var i = 0; i < fs.length; i++) { cfg.enabled[fs[i].id] = enabledOf(fs[i]); cfg.policies[fs[i].id] = fs[i].policy; }
    return cfg;
  }
  P.configuration = currentConfig;
  function applyConfig(cfg) {
    var id;
    for (id in cfg.policies) T.setPolicy(id, cfg.policies[id]);
    for (id in cfg.enabled) T.setFeatureEnabled(id, cfg.enabled[id]);
    return cfg;
  }
  P.applyConfig = applyConfig;
  function cloneConfig(c) { return { enabled: Object.assign({}, c.enabled), policies: Object.assign({}, c.policies) }; }
  /** What a candidate CHANGES against the incumbent — the only part worth logging (and what the page will show). */
  function configDelta(base, cfg) {
    var d = [], id;
    for (id in cfg.policies) if (cfg.policies[id] !== base.policies[id]) d.push({ feature: id, policy: cfg.policies[id], was: base.policies[id] });
    for (id in cfg.enabled) if (cfg.enabled[id] !== base.enabled[id]) d.push({ feature: id, enabled: cfg.enabled[id], was: base.enabled[id] });
    d.sort(function (a, b) { return a.feature < b.feature ? -1 : a.feature > b.feature ? 1 : 0; });
    return d;
  }

  // ---- candidates: templates over feature KINDS and POLICY families ------------------------------------------------
  // The incumbent is always a candidate (omsi's "repeat", cheap insurance). Every other candidate differs from it in
  // exactly ONE feature — a one-step neighbourhood, so the set stays small and each confirmation answers one question.
  var PURCHASE_KINDS = { upgrades: 1, buyables: 1 };
  /**
   * ⚖ USER RULING (2026-09-15, relayed by the planner; plan §13d): **no arbitrary waiting.** "A reset whose purpose is
   * N of its resource fires the moment the gain reaches N; do not wait some arbitrary amount of time." So the candidate
   * templates are TARGET-DRIVEN — `gain>=N` with N derived from what the round is resetting FOR, `gain>=Nx`,
   * `unlocks-purchase`, `reserve>=N` — and no `interval>=T` candidate is generated at all. An incumbent that carries an
   * interval (both shipped tables do) stays as the control row, and a sweep that leaves one as a default owes the record
   * a sentence about what the interval is a PROXY for. The `off` candidate is not a clock either: it holds a reset for
   * the epoch the round is deciding, which is the decision's own horizon.
   */
  function instantiate(template, st, target) {
    // A parameterised template gets its numbers from the TARGET or from the OPTIONS, never from a literal here.
    var out = [], i, v;
    if (template === 'gain>=Nx') { v = numList(O('gainX')); for (i = 0; i < v.length; i++) out.push('gain>=' + v[i] + 'x'); return out; }
    if (template === 'interval>=T') {
      // ⚖ no arbitrary waiting: the `intervals` option is EMPTY by default, so no interval candidate is generated. It
      // stays a knob so a sweep can put the ruling itself under measurement (`--planner-opt "intervals=5,30"`).
      v = numList(O('intervals'));
      for (i = 0; i < v.length; i++) out.push('interval>=' + v[i]);
      return out;
    }
    if (template === 'gain>=N') {
      // N = what this round still needs, when the reset's gain is measured in the dimension the round is chasing:
      // "fire the moment the gain reaches what I am resetting FOR". The layer's own points is the dimension a reset
      // gain lands in, so the template only applies where the target (or the goal above it) IS that dimension.
      var own = 'player.' + st.layer + '.points';
      var pairs = [[target && target.dimension, target && target.threshold, target && target.held],
                   [target && target.goalDimension, target && target.goalThreshold, target && target.goalHeld]];
      for (i = 0; i < pairs.length; i++) {
        if (pairs[i][0] !== own || pairs[i][1] == null) continue;
        var thr = D(pairs[i][1]), have = pairs[i][2] == null ? D(0) : D(pairs[i][2]);
        var need = thr.sub(have);
        if (need.lte(0)) need = thr;
        var n = dstr(need);
        if (n && /^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(n)) out.push('gain>=' + n);
      }
      return out;
    }
    if (template === 'keepsUpgrades') return st.keep ? ['keepsUpgrades'] : [];
    if (template === 'order' || template === 'order-then-cheapest') return st.order && st.order.length ? [template] : [];
    if (template === 'reserve>=N') {
      // a reserve only means something when what the planner is protecting IS this feature's own currency
      if (!target || !target.dimension || target.dimension !== 'player.' + st.layer + '.points' || target.threshold == null) return [];
      if (!/^\d+(\.\d+)?([eE][+-]?\d+)?$/.test(String(target.threshold))) return [];      // a reserve must be a plain quantity
      return ['reserve>=' + target.threshold];
    }
    return [template];
  }
  function policyCandidates(st, target) {
    var tpl = (T.policyTemplates && T.policyTemplates[st.kind]) || [], out = [], i, j, seen = {};
    var add = function (p) { if (p && p !== st.policy && !seen[p]) { seen[p] = 1; out.push(p); } };
    for (i = 0; i < st.policies.length; i++) add(st.policies[i]);              // the table's registered alternatives
    for (i = 0; i < tpl.length; i++) { var v = instantiate(tpl[i], st, target); for (j = 0; j < v.length; j++) add(v[j]); }
    return out;
  }
  function generateCandidates(base, target) {
    var list = [{ id: 'incumbent', config: cloneConfig(base), kind: 'incumbent', feature: null }];
    var fs = featureList(), i, j;
    for (i = 0; i < fs.length; i++) {
      var st = fs[i];
      if (!st.unlocked) continue;                                  // a locked feature cannot run, so nothing to decide
      var isReset = st.kind === 'reset', isBuy = !!PURCHASE_KINDS[st.kind];
      if (!isReset && !isBuy) continue;                            // toggles / challenges / clickables run as they are
      if (isReset || isBuy) {
        var pols = policyCandidates(st, target);
        for (j = 0; j < pols.length; j++) {
          var c = cloneConfig(base); c.policies[st.id] = pols[j]; c.enabled[st.id] = true;
          list.push({ id: 'policy:' + st.id + '=' + pols[j], config: c, kind: st.kind, feature: st.id, policy: pols[j] });
        }
      }
      if (base.enabled[st.id]) {                                   // the WAIT candidate for this layer: hold it back
        var c2 = cloneConfig(base); c2.enabled[st.id] = false;
        list.push({ id: 'off:' + st.id, config: c2, kind: st.kind, feature: st.id, policy: 'off' });
      }
    }
    return list;
  }

  /**
   * The screened pool, cut to `maxCandidates` ROUND-ROBIN over the features — every unlocked feature contributes its
   * best-ranked candidate before any feature contributes a second. ⚠ A flat `slice(0, maxCandidates)` cuts by the
   * screen's ranking, and the screen cannot discriminate at all when the target dimension is frozen: the tie-break is
   * then the candidate id, so whole layers fall off the end alphabetically. Measured on the fresh-game opening: the
   * planner had turned the row-0 reset off, `player.points` stopped moving, and for 20 rounds not one candidate that
   * could turn it back on was inside the pool — the escalation had nothing to escalate to.
   */
  function selectPool(order, maxN) {
    var groups = {}, keys = [], i, key;
    for (i = 0; i < order.length; i++) {
      key = order[i].id === 'incumbent' ? '' : (order[i].feature || order[i].id);
      if (!groups[key]) { groups[key] = []; keys.push(key); }
      groups[key].push(order[i]);
    }
    var out = [], round = 0, added = true;
    while (out.length < maxN && added) {
      added = false;
      for (i = 0; i < keys.length && out.length < maxN; i++) if (groups[keys[i]].length > round) { out.push(groups[keys[i]][round]); added = true; }
      round++;
    }
    return out;
  }

  // ---- the screen: a rate extrapolation from P1a's measured producers ----------------------------------------------
  // The cheap model (omsi §3.6). It ranks; the ENGINE decides. Its ranking against the confirmed one is logged every
  // round (the divergence log): a screen that never disagrees is measuring nothing, one that always disagrees is
  // wasting the budget. It is deliberately crude — a reset's expected count over the epoch from its MEASURED cycle.
  function resetProducersOf(K, dim) {
    var list = (K.producers.byDimension[dim] || []), out = [], i;
    for (i = 0; i < list.length; i++) if (list[i].producer.indexOf('reset:') === 0) out.push(list[i]);
    return out;
  }
  function resetRowOf(K, layer) { for (var i = 0; i < K.producers.resets.length; i++) if (K.producers.resets[i].layer === layer) return K.producers.resets[i]; return null; }
  /** The measured cycle of a reset, in game-seconds: how long its base dimension needs to climb back to its requirement. */
  function cycleOf(K, layer) {
    var R = resetRowOf(K, layer);
    if (!R || !R.requiresDimension || R.resetAt == null) return null;
    var re = R.regrowth && R.regrowth[R.requiresDimension];
    if (re == null) { var w = K.producers.wait.rates[R.requiresDimension]; re = w ? w.rate : null; }
    if (re == null) return null;
    var rate = D(re);
    if (rate.lte(0)) return null;
    var need = D(R.resetAt);
    try { return Math.max(1, Number(need.div(rate))); } catch (e) { return null; }
  }
  /**
   * How often this reset can fire in k game-seconds. TWO bounds, and the smaller wins: the POLICY's own cadence, and
   * the game's — a reset waits for `canReset`, so it cannot fire faster than its requirement regrows (the measured
   * cycle). Without the second bound the screen prices a locked row-2 layer whose requirement is 1e120 as if it reset
   * every interval, and every candidate then projects the same number (measured at M02 before this was here).
   */
  function expectedResets(K, st, policy, enabled, k) {
    if (!enabled || !st.unlocked) return 0;
    var cyc = cycleOf(K, st.layer);
    var nCycle = cyc === null ? 0 : Math.floor(k / cyc);
    var m = /^interval>=(.*)$/.exec(policy);
    var nPolicy = m ? Math.floor(k / Math.max(1e-9, Number(m[1]))) : nCycle;
    var g = /^gain>=(.*)x$/.exec(policy);
    if (g) nPolicy = Math.floor(nCycle / Math.max(1, Number(g[1])));   // "wait until the gain is N× what I hold" ≈ N cycles
    return Math.max(0, Math.min(nCycle, nPolicy));
  }
  /**
   * The projected PEAK of the target dimension after the epoch under this configuration. The model is a sawtooth: the
   * dimension climbs at the measured wait rate and is emptied by whichever enabled reset consumes it most often, so the
   * peak is one period's climb — the whole window when nothing consumes it. A reset that PRODUCES the target adds its
   * measured gain per expected reset. The wait rate is measured WITH the incumbent running (P1a's producer walk), so
   * the incumbent's own projection is nearly a measurement and every other candidate is that baseline adjusted.
   */
  function screenCandidate(cand, K, target, k) {
    var dim = target.dimension;
    var held = D(target.held == null ? 0 : target.held);
    var w = K.producers.wait.rates[dim];
    var rate = w ? D(w.rate).max(0) : D(0);
    var fs = featureList(), byLayer = {}, i;
    for (i = 0; i < fs.length; i++) if (fs[i].kind === 'reset') byLayer[fs[i].layer] = fs[i];
    var period = k, consumer = null, produced = D(0), producers = [];
    var resets = K.producers.resets;
    for (i = 0; i < resets.length; i++) {
      var R = resets[i], st = byLayer[R.layer];
      if (!st || !R.delta || R.delta[dim] === undefined) continue;
      var n = expectedResets(K, st, cand.config.policies[st.id], cand.config.enabled[st.id], k);
      if (!n) continue;
      var d = D(R.delta[dim]);
      if (d.lt(0)) { var per = k / n; if (per < period) { period = per; consumer = { layer: R.layer, resets: n, period: per }; } }
      else if (d.gt(0)) { produced = produced.plus(d.times(n)); producers.push({ layer: R.layer, resets: n, gain: R.delta[dim] }); }
    }
    var proj = held.plus(rate.times(Math.min(k, period))).plus(produced);
    return { projected: dstr(proj), projectedLog10: lg(proj), rate: w ? w.rate : null, period: period, consumer: consumer, producers: producers };
  }

  // ---- confirmation: the engine plays the candidate on the copy ----------------------------------------------------
  /**
   * measureConfig: an EXCURSION that applies the configuration and ticks k game-seconds at diff 1, sampling the target
   * dimension every tick. Returns the target's MAX over the window (never the net rate — P1a 12a.5), its end value, the
   * capacity term (last quarter's peak against the first quarter's), the marks newly held, and the copy's hashGame —
   * which is what the live game must land on at the epoch's end.
   */
  function measureConfig(cfg, k, target, activePred, marks, frontier) {
    var dim = target.dimension, gdim = target.goalDimension || null;
    return P.excursion(function () {
      applyConfig(cfg);
      var i, v, vals = [], v0 = D(getPath(dim) == null ? 0 : getPath(dim));
      var gmax = gdim ? D(getPath(gdim) == null ? 0 : getPath(gdim)) : null, g0 = gmax;
      var reachedAt = null;
      for (i = 0; i < k; i++) {
        T.tick(1, 1);
        v = getPath(dim); vals.push(v === null || v === undefined ? D(0) : D(v));
        if (gdim) { var gv = getPath(gdim); if (gv !== null && gv !== undefined && D(gv).gt(gmax)) gmax = D(gv); }
        if (reachedAt === null && activePred) { var ok = false; try { ok = !!activePred(); } catch (e) { ok = false; } if (ok) reachedAt = i + 1; }
      }
      var max = v0, end = vals.length ? vals[vals.length - 1] : v0;
      for (i = 0; i < vals.length; i++) if (vals[i].gt(max)) max = vals[i];
      // capacity (omsi's probeCapacity, transplanted): is the trajectory still ACCELERATING — what this epoch buys for
      // the NEXT one. The peak of the window's last quarter against the peak of its first.
      var q = Math.max(1, Math.floor(vals.length / 4)), qa = vals.length ? vals[0] : v0, qb = vals.length ? vals[vals.length - 1] : v0;
      for (i = 0; i < q && i < vals.length; i++) if (vals[i].gt(qa)) qa = vals[i];
      for (i = Math.max(0, vals.length - q); i < vals.length; i++) if (vals[i].gt(qb)) qb = vals[i];
      var capacity = lg(qb) - lg(qa);
      var held = {}, n;
      for (n = 0; n < (marks || []).length; n++) { var ok2 = false; try { ok2 = !!marks[n].fn(); } catch (e) { ok2 = false; } if (ok2) held[marks[n].id] = true; }
      var closer = 0;
      for (n = 0; n < (frontier || []).length; n++) {
        var f = frontier[n], now = getPath(f.dimension);
        if (now === null || now === undefined) continue;
        try { if (D(now).gt(D(f.held))) closer++; } catch (e) {}
      }
      var h = P.hashes();
      return { ticks: k, max: dstr(max), maxLog10: lg(max), end: dstr(end), endLog10: lg(end), start: dstr(v0), startLog10: lg(v0),
        goalDimension: gdim, goalMax: gdim ? dstr(gmax) : null, goalStart: gdim ? dstr(g0) : null,
        capacity: isFinite(capacity) ? capacity : 0, reachedAt: reachedAt, marksHeld: Object.keys(held).sort(), frontierCloser: closer,
        hash: h.hash, hashGame: h.hashGame, gameSeconds: T.gameSeconds };
    });
  }
  P.measureConfig = measureConfig;

  /** score = weighted sum; the goal reached inside the window dominates, earliest tick first. Ties: candidate order. */
  /** log-progress of a quantity's measured max from where it started toward its threshold, clipped to [-1, 1]. */
  function logProgress(startLog, maxLog, threshold) {
    var gain = maxLog - startLog;
    if (!isFinite(gain)) gain = 0;
    var hi = threshold == null ? null : lg(threshold);
    var span = hi === null || !isFinite(hi) || !isFinite(startLog) ? null : hi - startLog;
    return span !== null && span > 0 ? Math.max(-1, Math.min(1, gain / span)) : Math.max(-1, Math.min(1, gain / 100));
  }
  function scoreOutcome(c, target, k) {
    var terms = {};
    terms.reach = c.reachedAt === null ? 0 : O('wReach') * (1 + (k - c.reachedAt) / Math.max(1, k));
    terms.progress = O('wProgress') * logProgress(c.startLog10, c.maxLog10, target.threshold);
    // the GOAL's own dimension, when the round is spent on a setup leaf below it: a candidate that grows the leaf by
    // starving the goal is not progress. Flat for every candidate when the goal's dimension genuinely cannot move —
    // which is exactly when the setup leaf is the right thing to optimise.
    terms.goal = c.goalDimension ? O('wGoal') * logProgress(lg(c.goalStart), lg(c.goalMax), target.goalThreshold) : 0;
    terms.capacity = O('wCapacity') * (isFinite(c.capacity) ? Math.max(-10, Math.min(10, c.capacity)) : 0);
    terms.frontier = O('wFrontier') * c.frontierCloser;
    var total = terms.reach + terms.progress + terms.goal + terms.capacity + terms.frontier;
    return { total: total, terms: terms };
  }

  // ---- targeting: the goal's chain, and the deepest hop that is currently POSSIBLE ---------------------------------
  // omsi's setup leaf (§4a): when the goal's own dimension has no possible producer, the round is spent on the first
  // hop down the chain that does. A goal with no possible hop at all is BLOCKED and the round moves to the next entry
  // of the goal LIST (goal-list-scoped setup rounds), the blocked one keeping its own clock.
  // ⚠ A PROBED threshold can saturate. P1a's probe raises a field until done() flips and binary-searches the minimum;
  // where the field is a plain JS number the largest value it can hold is the double ceiling, so a gate the probe could
  // not satisfy comes back as ~1.797e308 — the representation's limit, not a number the game ever names. Measured: the
  // fresh-game fallback chased `ach:a:42` at 1.79769313522374e308 for ten rounds. Such a goal is not targetable.
  var LOG10_MAX = Math.log10(Number.MAX_VALUE);
  // ⚠ AT the ceiling, not ABOVE it. `>= LOG10_MAX` also catches every legitimate Decimal threshold above 1.8e308 — at
  // the PTR frontier the e reset's own requirement is 1.0004e600, and reading that as "the probe's limit" told the
  // round that M11 and M14 were unreachable for a reason that is not true (measured in the campaign's first leg).
  function saturated(threshold) { if (threshold == null) return false; var l = lg(threshold); return isFinite(l) && Math.abs(l - LOG10_MAX) <= 1e-6; }
  function shortfallOf(t) {
    if (t.threshold == null || t.held == null) return Infinity;
    var a = lg(t.threshold), b = lg(t.held);
    return isFinite(a) && isFinite(b) ? a - b : Infinity;
  }
  /**
   * Is this hop possible WITHIN THE EPOCH? P1a's chain answers a different question: it classifies a hop against the
   * knowledge walk's wait window (`knowledgeK`, 10 game-seconds by default), and `canReset` is an INSTANT (P1a 12a.5).
   * A reset whose requirement regrows in 40 game-seconds therefore reads "impossible: the requirement is above the base
   * amount" while the epoch it is being planned for is 300 game-seconds long — and the round walks past the goal's own
   * dimension down to the root currency, where a candidate is rewarded for HOARDING the very currency the reset must
   * spend. Measured on the fresh-game opening: 20 rounds chasing `player.points` against a receding static requirement
   * while `b.best` / `g.best` (what M03 actually asks for) crawled. So the horizon of the question is the epoch: a
   * `canReset is false` hop is possible when the producing layer's MEASURED cycle (`resetAt / regrowth`, the same
   * number the screen prices) fits inside k.
   */
  function hopPossible(h, K, k) {
    if (!h.impossible) return true;
    var imp = h.impossible;
    if (!imp.layer || String(imp.why || '').indexOf('canReset is false') !== 0) return false;
    var cyc = cycleOf(K, imp.layer);
    return cyc !== null && cyc <= k;
  }
  function targetFromChain(ch, idx, K) {
    if (!ch || !ch.hops || !ch.hops.length) return null;
    var i, h;
    for (i = 0; i < ch.hops.length; i++) {
      h = ch.hops[i];
      if (!h.dimension || h.cut) continue;
      if (!hopPossible(h, K, O('k'))) continue;
      if (saturated(h.threshold)) return { blocked: true, dimension: h.dimension, threshold: h.threshold, held: h.held, goal: ch.goal, chainIndex: idx, why: 'the probed threshold saturated the double ceiling: it is the probe\'s limit, not a number the game names' };
      // The GOAL's own dimension (the chain's first hop) travels with the target. A round spent on a setup leaf is
      // still a round spent ON THE GOAL, and the score prices both: measured, a candidate that grows the leaf by
      // turning OFF the very reset that converts it into the goal's dimension wins every epoch and undoes the goal
      // (`off:reset:b` maximises `player.points` precisely because a b reset spends points — and b.best is what the
      // mark asks for).
      var g0 = null;
      for (var j = 0; j < ch.hops.length; j++) if (ch.hops[j].dimension) { g0 = ch.hops[j]; break; }
      return { dimension: h.dimension, threshold: h.threshold === undefined ? null : h.threshold, held: h.held, hop: i, goal: ch.goal, chainIndex: idx, blocked: false,
        goalDimension: g0 && g0.dimension !== h.dimension ? g0.dimension : null,
        goalThreshold: g0 && g0.dimension !== h.dimension ? (g0.threshold === undefined ? null : g0.threshold) : null,
        goalHeld: g0 && g0.dimension !== h.dimension ? g0.held : null,
        withinEpoch: h.impossible ? { layer: h.impossible.layer, cycle: cycleOf(K, h.impossible.layer) } : null };
    }
    var fi = ch.firstImpossible;
    var dimHop = null;
    for (i = 0; i < ch.hops.length; i++) if (ch.hops[i].dimension) { dimHop = ch.hops[i]; break; }
    var use = fi ? { dimension: fi.dimension, why: fi.impossible && fi.impossible.why } : dimHop ? { dimension: dimHop.dimension, why: 'no hop of this chain has a possible producer' } : null;
    if (!use) return { blocked: true, dimension: null, threshold: null, held: null, goal: ch.goal, chainIndex: idx, why: 'this goal resolved to no dimension' };
    var src = null;
    for (i = 0; i < ch.hops.length; i++) if (ch.hops[i].dimension === use.dimension) { src = ch.hops[i]; break; }
    return { blocked: true, dimension: use.dimension, threshold: src && src.threshold !== undefined ? src.threshold : null, held: src ? src.held : null, goal: ch.goal, chainIndex: idx, why: use.why };
  }
  /**
   * Is the target REACHABLE from here, at the rate the walk just measured? "Possible" (a producer moves the dimension)
   * is not the same as "reachable": at the PTR frontier `player.points` moves every tick and the hop it is a setup leaf
   * for wants 1.0004e600 against 1.19e220 — 380 orders of magnitude, which no epoch closes. Without this the round
   * pursues the first ladder entry forever and the entries below it never get a round (omsi's "a dead top goal shadows
   * the goals below it", §4a). The estimate is measured, not assumed: one epoch's projected log-gain from the wait rate
   * plus any producing reset, against the log-distance still to cover.
   */
  function reachable(t, K) {
    if (t.threshold == null || t.held == null) return { ok: true, why: 'no threshold to be far from' };
    var hi = lg(t.threshold), lo = lg(t.held);
    if (!isFinite(hi)) return { ok: true, why: 'the threshold is not a finite log' };
    if (!isFinite(lo)) lo = 0;
    var dist = hi - lo;
    if (dist <= 0) return { ok: true, dist: dist };
    var sc = screenCandidate({ config: currentConfig() }, K, t, O('k'));
    var gain = sc.projectedLog10 - lo;
    if (!isFinite(gain) || gain <= 0) return { ok: false, dist: dist, perEpoch: 0, why: 'the measured configuration does not move this dimension over an epoch' };
    var rounds = dist / gain;
    return { ok: rounds <= O('reachRounds'), dist: dist, perEpoch: gain, rounds: rounds };
  }
  function targetForChains(chains, K) {
    var open = [], blocked = [], i, t;
    for (i = 0; i < (chains || []).length; i++) {
      t = targetFromChain(chains[i], i, K);
      if (!t) continue;
      if (!t.blocked) {
        var r = reachable(t, K);
        t.reach = r;
        if (!r.ok) { t.blocked = true; t.why = 'out of reach at the measured rate: ' + (r.why || (Math.round(r.rounds) + ' epochs of ' + O('k') + ' game-seconds to cover ' + r.dist.toFixed(1) + ' orders of magnitude')); }
      }
      (t.blocked ? blocked : open).push(t);
    }
    if (open.length) {
      // the mark needs every clause, so the round works on the NEAREST open one (smallest log10 shortfall); ties by chain
      open.sort(function (a, b) { var d = shortfallOf(a) - shortfallOf(b); return d !== 0 ? d : a.chainIndex - b.chainIndex; });
      return open[0];
    }
    return blocked.length ? blocked[0] : { blocked: true, dimension: null, threshold: null, held: null, why: 'this goal has no chain at all' };
  }

  // ---- the stall clocks (omsi §4a, both kinds) ---------------------------------------------------------------------
  // For an ACTIVE goal the clock runs on the target dimension: a round whose target did not rise accrues, a rising one
  // resets, and goalStallK accrued rounds abandon the goal (list hygiene: it stays in the list, marked, with the round).
  // For a BLOCKED goal the clock runs on the blocked hop's dimension and stays FROZEN until that dimension first moves
  // during the goal's tenure — on a wall like the PTR frontier's 1e600 points requirement, a flat-window accrual would
  // abandon every entry on the first pass.
  // ⚠ Every number the clock keeps must be JSON-SAFE: the planner's state round-trips through JSON.stringify on every
  // restore (it rides in runtimeState), and JSON turns ±Infinity and NaN into `null`. A dimension sitting at 0 has
  // log10 −Infinity, so a clock that stored it read `best: null` again after the very next excursion — "no best yet",
  // which reads as a RISE — and no goal could ever stall. Measured: 5 rounds at `player.p.points` 0 with rose: true.
  var lgOr = function (x) { if (x === null || x === undefined) return null; var l = lg(x); return isFinite(l) ? l : null; };
  function clockFor(key, dim, held, blocked) {
    var c = S.clocks[key];
    if (!c || c.dimension !== dim) { c = S.clocks[key] = { dimension: dim, best: lgOr(held), first: lgOr(held), stall: 0, armed: !blocked, moved: false, rounds: 0 }; return c; }
    return c;
  }
  function accrue(c, held, blocked) {
    c.rounds++;
    var v = lgOr(held);
    if (v !== null && c.first !== null && Math.abs(v - c.first) > O('minRise')) c.moved = true;
    if (v !== null && c.first === null) { c.moved = true; c.first = v; }     // it left the floor (0 → something)
    if (blocked && !c.armed) { if (c.moved) c.armed = true; return c; }      // frozen until the blocked dimension first moves
    c.armed = true;
    if (v !== null && (c.best === null || v > c.best + O('minRise'))) { c.best = v; c.stall = 0; c.rose = true; }
    else { c.stall++; c.rose = false; }
    return c;
  }

  // ---- one round ---------------------------------------------------------------------------------------------------
  // The ladder resolved to {id, name, predicate, fn} once per ladder object — beforeTick() asks for it on EVERY live
  // tick, and rebuilding 53 records per tick for a 6-game-hour campaign is 1.1 M allocations for one predicate call.
  var MARKS_CACHE = null, MARKS_FOR = null;
  function ladderMarks() {
    var L = T.plannerLadder || null;
    if (MARKS_FOR === L && MARKS_CACHE) return MARKS_CACHE;
    var out = [], marks = L ? (Array.isArray(L) ? L : L.marks || []) : [];
    for (var i = 0; i < marks.length; i++) out.push({ id: marks[i].id, name: marks[i].name || null, predicate: marks[i].predicate, fn: T.predicate(marks[i].predicate) });
    MARKS_FOR = L; MARKS_CACHE = out;
    return out;
  }
  function holdsNow(m) { try { return !!m.fn(); } catch (e) { return false; } }

  /**
   * round(): one planning round. Reads the knowledge walk, picks the active goal and the target dimension, generates
   * candidate configurations, screens them, confirms the survivors on the copy, scores, and (mode `auto`) commits the
   * winner to the live simple system for the epoch. Returns the round record (docs/planner.md, "the round log").
   */
  P.round = function (opts) {
    opts = opts || {};
    var t0 = wallMs(), reason = opts.reason || 'epoch-end';
    // The planning instant is NORMALISED first: restore(snapshot()) settles tmp the way every excursion's restore will.
    // Without it candidate 1 is measured at the live tick's tmp and candidate 2 at a restored tmp — tmp is not a pure
    // function of player (P1a 12a.2 item 1), so the two are different instants and the winner's trajectory would not be
    // the live one. This is the one place the planner touches the live state, and it is byte-faithful in `player`.
    P.restore(P.snapshot());
    var marks = ladderMarks(), i, j;
    for (i = 0; i < marks.length; i++) if (holdsNow(marks[i]) && !S.reached[marks[i].id]) S.reached[marks[i].id] = { round: S.round, ticks: T.ticks, gameSeconds: T.gameSeconds };
    var tk = wallMs();
    var K = P.knowledge({ k: O('knowledgeK'), depth: O('depth') });
    var G = P.goals({ knowledge: K });
    var knowledgeMs = wallMs() - tk;

    // --- the active goal: the first sticky entry not yet reached and not abandoned whose chain has a possible hop ---
    var entries = [], skipped = [];
    for (i = 0; i < G.sticky.length; i++) {
      var e = G.sticky[i];
      if (S.reached[e.mark] || S.abandoned[e.mark]) continue;
      entries.push(e);
    }
    var active = null, target = null;
    for (i = 0; i < entries.length; i++) {
      var t = targetForChains(entries[i].chains, K);
      if (!t.blocked) { active = { source: 'sticky', mark: entries[i].mark, name: entries[i].name, predicate: entries[i].predicate, entry: entries[i] }; target = t; break; }
      skipped.push({ mark: entries[i].mark, dimension: t.dimension, why: t.why });
      var c = clockFor(entries[i].mark, t.dimension, t.held, true);
      accrue(c, t.held, true);
      if (c.armed && c.stall >= O('goalStallK')) S.abandoned[entries[i].mark] = { round: S.round, why: 'blocked and stalled ' + c.stall + ' rounds on ' + t.dimension };
    }
    // the fallback (omsi's heuristic mode): the best DISCOVERED goal when the sticky list is empty or all-blocked
    if (!active) {
      var chainById = {};
      for (i = 0; i < K.chains.length; i++) chainById[K.chains[i].goal] = K.chains[i];
      for (i = 0; i < G.discovered.length; i++) {
        var g = G.discovered[i], ch = chainById[g.id];
        if (!ch) continue;
        if (saturated(g.threshold)) continue;
        var td = targetForChains([ch], K);
        if (td.blocked) continue;
        active = { source: 'discovered', mark: g.id, name: g.kind, predicate: null, goal: g };
        target = td;
        break;
      }
    }
    // The LAST RESORT: the game's own root dimension, with no threshold — just grow it. `player.points` is the TMT
    // contract (every fork has it; P1a's walk already treats it as a dimension), not game knowledge. It matters because
    // a configuration the planner itself committed can FREEZE the economy — measured on the fresh-game opening: after an
    // epoch that won by holding points back, nothing moved any dimension, every sticky chain read "no measured producer
    // moves this" and the round had nothing to optimise, so the incumbent won every tie and the run never recovered.
    if (!active) {
      active = { source: 'root', mark: 'root:player.points', name: 'the game\'s own points', predicate: null };
      target = { dimension: 'player.points', threshold: null, held: dstr(getPath('player.points')), hop: 0, goal: 'root', chainIndex: 0, blocked: false, why: 'every goal is blocked: grow the root dimension' };
    }
    var rec = { round: S.round, ticks: T.ticks, gameSeconds: T.gameSeconds, mode: P.mode, reason: reason,
      goal: active ? { source: active.source, id: active.mark, name: active.name, predicate: active.predicate, chain: active.entry ? active.entry.chains.map(function (c2) { return { goal: c2.goal, firstImpossible: c2.firstImpossible ? c2.firstImpossible.dimension : null }; }) : null } : null,
      skipped: skipped, target: target || null, candidates: [], winner: null, epoch: null,
      reached: Object.keys(S.reached).sort(), abandoned: Object.keys(S.abandoned).sort(),
      cost: { knowledgeMs: knowledgeMs } };
    if (!active || !target || !target.dimension) {   // only when the game has no `player.points` at all
      rec.why = 'no goal with a possible hop: nothing to plan this round';
      rec.cost.wallMs = wallMs() - t0;
      S.round++; P.rounds.push(rec);
      S.epoch = { startTick: T.ticks, endsAtTick: T.ticks + O('k'), expected: null, config: null, goal: null };
      return rec;
    }
    S.goal = active.mark;

    // --- the clock of the active goal, and the anti-fixation escalation ---
    var clock = clockFor(active.mark, target.dimension, target.held, false);
    accrue(clock, target.held, false);
    rec.clock = { dimension: clock.dimension, stall: clock.stall, armed: clock.armed, rose: !!clock.rose, rounds: clock.rounds, best: clock.best };
    if (clock.stall >= O('goalStallK')) {
      S.abandoned[active.mark] = { round: S.round, why: 'the target ' + target.dimension + ' did not rise for ' + clock.stall + ' rounds' };
      rec.abandonedNow = active.mark;
    }
    var escalate = S.escalate || (S.sameWinner >= O('fixK') && !clock.rose);
    rec.escalate = !!escalate;

    // --- candidates, screen, confirmation, score ---
    var base = currentConfig();
    var cands = generateCandidates(base, target);
    var ts = wallMs();
    for (i = 0; i < cands.length; i++) cands[i].screen = screenCandidate(cands[i], K, target, O('k'));
    var order = cands.slice();
    // The tie-break when the model cannot tell (a frozen target projects the same number for everything): prefer a
    // candidate that turns a feature ON over one that turns a feature off, and only then the id. A configuration that
    // produces nothing is the one being escaped, so "switch something on" is the right coin-flip — and it is
    // deterministic, which a random one would not be.
    var turnsOn = function (c) { for (var q in c.config.enabled) if (c.config.enabled[q] && !base.enabled[q]) return 1; return 0; };
    order.sort(function (a, b) {
      if (a.id === 'incumbent') return -1;
      if (b.id === 'incumbent') return 1;
      var d = (b.screen.projectedLog10 || -Infinity) - (a.screen.projectedLog10 || -Infinity);
      if (d !== 0 && isFinite(d)) return d;
      var t = turnsOn(b) - turnsOn(a);
      if (t !== 0) return t;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    for (i = 0; i < order.length; i++) order[i].screenRank = i;
    var pool = selectPool(order, Math.max(1, O('maxCandidates')));
    var screened = pool.slice(0, Math.max(1, O('screenK')));
    // the escalation (omsi's updateStagnation): at least one candidate that differs in a RESET policy must be confirmed
    // ⚠ "differs in a reset policy" must mean the POLICY, not merely the feature: `off:reset:<l>` names a reset feature
    // and changes nothing about how it resets, so an escalation satisfied by one is no escalation at all.
    var isResetPolicy = function (c) { return c.kind === 'reset' && c.id.indexOf('policy:') === 0; };
    if (escalate) {
      var hasReset = false, alt = [];
      for (i = 0; i < screened.length; i++) if (isResetPolicy(screened[i])) hasReset = true;
      for (i = 0; i < pool.length; i++) if (isResetPolicy(pool[i]) && screened.indexOf(pool[i]) < 0) alt.push(pool[i]);
      // ⚠ The escalation ROTATES. Escalating to the same candidate every round is not an escape: measured on the frozen
      // opening, the escalation offered the same reset-policy candidate for twenty rounds while the one that could
      // restart the economy sat at rank 9 and was never confirmed. The index is part of the state, so it is
      // deterministic and it walks the whole list.
      if (!hasReset && alt.length) {
        var pick = alt[(S.escalateN || 0) % alt.length];
        S.escalateN = (S.escalateN || 0) + 1;
        screened.push(pick);
        rec.escalated = pick.id;
      }
    }
    var screenMs = wallMs() - ts;
    var frontier = [];
    for (i = 0; i < G.discovered.length; i++) { var dg = G.discovered[i]; if (dg.dimension && dg.held != null) frontier.push({ id: dg.id, dimension: dg.dimension, held: dg.held }); }
    var activeFn = active.source === 'sticky' ? T.predicate(active.predicate) : null;
    var tc = wallMs(), measured = 0;
    for (i = 0; i < screened.length; i++) {
      screened[i].confirm = measureConfig(screened[i].config, O('k'), target, activeFn, marks, frontier);
      screened[i].score = scoreOutcome(screened[i].confirm, target, O('k'));
      measured += O('k');
    }
    var confirmMs = wallMs() - tc;
    // the winner: the goal reached inside the window wins outright (earliest tick first), then the score, then order
    var winner = null;
    for (i = 0; i < screened.length; i++) {
      var c3 = screened[i];
      if (!winner) { winner = c3; continue; }
      var a = winner.confirm, b = c3.confirm;
      if ((a.reachedAt === null) !== (b.reachedAt === null)) { if (b.reachedAt !== null) winner = c3; continue; }
      if (a.reachedAt !== null && b.reachedAt !== null && a.reachedAt !== b.reachedAt) { if (b.reachedAt < a.reachedAt) winner = c3; continue; }
      if (c3.score.total > winner.score.total) winner = c3;
    }
    // the confirmed ranking against the screen's (omsi's divergence log)
    var confirmedOrder = screened.slice().sort(function (a2, b2) { return b2.score.total - a2.score.total; });
    rec.screenDivergence = { screened: screened.map(function (c4) { return c4.id; }), confirmedBest: confirmedOrder.length ? confirmedOrder[0].id : null,
      screenBest: screened.length ? screened[0].id : null, agree: screened.length ? (confirmedOrder[0].id === screened[0].id) : null,
      displacement: confirmedOrder.map(function (c5) { return screened.indexOf(c5); }).map(function (v, ix) { return Math.abs(v - ix); }).reduce(function (x, y) { return x + y; }, 0) };
    rec.candidates = pool.map(function (c6) {
      return { id: c6.id, kind: c6.kind, feature: c6.feature, policy: c6.policy || null, delta: configDelta(base, c6.config),
        screen: { projected: c6.screen.projected, log10: c6.screen.projectedLog10, rank: c6.screenRank, rate: c6.screen.rate, period: c6.screen.period, consumer: c6.screen.consumer, producers: c6.screen.producers },
        confirm: c6.confirm ? { max: c6.confirm.max, maxLog10: c6.confirm.maxLog10, end: c6.confirm.end, capacity: c6.confirm.capacity, reachedAt: c6.confirm.reachedAt, marksHeld: c6.confirm.marksHeld, frontierCloser: c6.confirm.frontierCloser, goalMax: c6.confirm.goalMax, hashGame: c6.confirm.hashGame } : null,
        score: c6.score || null };
    });
    rec.winner = winner ? { id: winner.id, delta: configDelta(base, winner.config), score: winner.score, confirm: { max: winner.confirm.max, reachedAt: winner.confirm.reachedAt, hashGame: winner.confirm.hashGame, marksHeld: winner.confirm.marksHeld } } : null;
    rec.cost = { knowledgeMs: knowledgeMs, screenMs: screenMs, confirmMs: confirmMs, measuredGameSeconds: measured, wallMs: wallMs() - t0 };

    // --- commit ---
    if (winner) {
      S.sameWinner = winner.id === S.lastWinner ? S.sameWinner + 1 : 0;
      S.lastWinner = winner.id;
      S.escalate = escalate && winner.id === 'incumbent';
      if (P.mode === 'auto') {
        applyConfig(winner.config);
        S.commits++;
        S.epoch = { startTick: T.ticks, endsAtTick: T.ticks + O('k'), expected: winner.confirm.hashGame, expectedGameSeconds: winner.confirm.gameSeconds,
          candidate: winner.id, goal: active.mark, target: target.dimension, round: S.round };
      } else {
        S.epoch = { startTick: T.ticks, endsAtTick: T.ticks + O('k'), expected: null, candidate: winner.id, goal: active.mark, target: target.dimension, round: S.round, suggestOnly: true };
      }
      rec.epoch = { ticks: O('k'), endsAtTick: S.epoch.endsAtTick, expected: S.epoch.expected, committed: P.mode === 'auto' };
    }
    rec.unlocks = unlockSignature();
    S.unlocks = rec.unlocks;
    S.round++;
    P.rounds.push(rec);
    return rec;
  };

  // A layer's unlocked state is an EVENT: a configuration chosen while a layer was locked has nothing to say about the
  // game the tick after it unlocks. The signature is the ordered list of unlocked layers (no layer id is written here).
  function unlockSignature() { var ls = allLayers(), o = []; for (var i = 0; i < ls.length; i++) if (player[ls[i]] && player[ls[i]].unlocked) o.push(ls[i]); return o.join(','); }

  /**
   * beforeTick(): the hook the harness's drive (and P2's page loop) calls BETWEEN ticks. It re-plans at the epoch's end
   * or earlier on an EVENT — the active goal reached, a configured feature's layer changing unlocked state, or the live
   * trajectory diverging from the winner's measured one. The divergence must be impossible by construction, so it is
   * recorded as a DEFECT rather than papered over.
   */
  P.beforeTick = function () {
    if (P.mode !== 'auto' && P.mode !== 'suggest') return null;
    if (O('maxRounds') && S.round >= O('maxRounds')) return null;
    if (!S.epoch) return P.round({ reason: 'first-round' });
    if (S.goal && S.reached[S.goal] === undefined) {
      var m = null, ms = ladderMarks();
      for (var i = 0; i < ms.length; i++) if (ms[i].id === S.goal) { m = ms[i]; break; }
      if (m && holdsNow(m)) {
        S.reached[S.goal] = { round: S.round, ticks: T.ticks, gameSeconds: T.gameSeconds };
        return P.round({ reason: 'goal-reached' });
      }
    }
    var sig = unlockSignature();
    if (S.unlocks !== null && sig !== S.unlocks) { S.unlocks = sig; return P.round({ reason: 'unlock-changed' }); }
    if (T.ticks >= S.epoch.endsAtTick) {
      var why = 'epoch-end';
      if (S.epoch.expected) {
        var live = P.hashes().hashGame;
        if (live !== S.epoch.expected) {
          // the copy played exactly this configuration from exactly this state: an inequality is a DEFECT
          S.divergences.push({ round: S.epoch.round, ticks: T.ticks, gameSeconds: T.gameSeconds, expected: S.epoch.expected, live: live, candidate: S.epoch.candidate });
          why = 'divergence';
        }
      }
      return P.round({ reason: why });
    }
    return null;
  };

  /** The run's planner record: the mode, the options, the state and the round log (--rounds-out). */
  P.report = function () {
    return { contract: P.contract, game: T.id || null, mode: P.mode, options: Object.assign({}, P.options),
      ticks: T.ticks, gameSeconds: T.gameSeconds, rounds: P.rounds.length, commits: S.commits,
      reached: S.reached, abandoned: S.abandoned, divergences: S.divergences,
      clocks: S.clocks, epoch: S.epoch, configuration: currentConfig(), log: P.rounds };
  };

  /** What the harness dumps at the end of a run (or at a mark). */
  P.dump = function (opts) {
    var K = P.knowledge(opts);
    return { knowledge: K, goals: P.goals({ knowledge: K, ladder: (opts || {}).ladder }) };
  };
})();
