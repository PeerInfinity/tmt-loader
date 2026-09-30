// loader/tmt-log.js — THE STATE LOG (log-1; docs/log.md): every action on the game — the player's, the automation's
// and the game's own — with the state it acted on, as JSONL (`tmt-state-log/1`), and an EXACT replay on the harness.
//
// A CLASSIC script, like tmt-auto.js, run unchanged by the page and by the Node harness (vm.runInThisContext). It is
// loaded ONLY when the log is switched on — the harness's `--log` / `--replay`, the page's `?autoOpt=log=1` or the
// switch in the automation tab's developer details — and only after tmt-auto.js, whose `tmtLoader.logLink` slot it
// fills. A page or a run that never switches it on never runs a line of this file (the inertness gate).
//
// WHAT IT HOOKS, and the discipline is U12's (`loader/layerlist.js`, the reset glow):
//  · the engine's entry points, from DATA (`loader/log-hooks.json`, one list per engine FAMILY — this file names no
//    game, no layer and no item): each GLOBAL function in the family's list, and each LAYER PATH (`buyables.*.sellOne`)
//    under every layer, on `layers[l]` and on its `tmp[l]` copy (the engines copy these functions into `tmp` when they
//    set it up, and the page switches the log on long after that).
//  · `gameLoop`, only to know WHEN a call is the game's own (inside it, with no automation feature acting) and to
//    count ticks. Every caller resolves `gameLoop` by name at call time (the engines' interval, `tmtLoader.tick`).
//  ⛔ TRANSPARENT: the original runs with the caller's own `this` and ALL its arguments, its return value is returned
//  and a throw of ITS propagates untouched; every line of ours is inside a try/catch; nothing is written to `player`.
//  ⛔ ONLY THE OUTERMOST CALL IS A RECORD: `startChallenge` calling `doReset(layer, true)`, `buyUpgrade` calling
//  `buyUpg`, a layer's `doReset` calling the global for another layer — those are the press's own effects, and the
//  press is the record. A foreign wrapper round ours (the layer list's glow hook) is the same shape.
//  ⚠ ONCE INSTALLED A WRAPPER STAYS, and switching the log off makes it a pure pass-through: the layer list re-wraps
//  a `doReset` that lost its mark, so unwrapping from under it could break its chain.
(function () {
  var T = globalThis.tmtLoader;
  if (!T || !T.logLink || T.stateLog) return;   // needs the automation core (its link slot); loaded once
  var G = globalThis;
  var MARK = 'tmtLoaderStateLogHook';
  var FORMAT = 'tmt-state-log/1';
  var link = T.logLink;

  // ---- memory -------------------------------------------------------------------------------------------------------
  var on = false;          // recording
  var depth = 0;           // hooked calls in flight: only the outermost is a record
  var inLoop = 0;          // inside gameLoop
  var auto = null;         // the feature EXEC is running: {id, layer, via, buf} — its records wait for its reason code
  var tick = 0, gs = 0;    // the log's own clock: ticks completed, game-seconds (tmtLoader's where it counts them)
  var sink = null;         // function(line) — the harness's file, the page's memory, or the replay's comparison
  var cfg = null;
  var lastSum = null;      // the compact summary as of the previous record (a record's `state` is the change)
  var nextCk = Infinity;   // game-seconds of the next interval checkpoint
  var marks = [];          // ladder marks not yet held: [{id, name, fn}]
  var t0wall = 0;
  var counts = null;
  var installed = null;    // what was hooked: {family, globals: [...], layer: [...paths matched], gameLoop}
  var HOOKS = null;

  function num(x) { return Number(x); }
  function round9(x) { return Math.round(x * 1e9) / 1e9; }
  function now() { return Date.now(); }

  // ---- the hash: `hashGame`, synchronously -------------------------------------------------------------------------
  // `tmtLoader.hash` is a Promise (the page has only crypto.subtle); a record needs the hash of the state AFTER the
  // call, synchronously, so the page uses this small SHA-256. The Node harness has `sha256hex` (node:crypto), and the
  // two agree to the byte (loader/log.test.mjs). Same input as `hashGame`: `stateJSON(tmtLoader.gameState)`.
  var K256 = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
    0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70,
    0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function utf8(s) {
    var out = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length) { var d = s.charCodeAt(i + 1); if (d >= 0xdc00 && d < 0xe000) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; } else c = 0xfffd; }
      else if (c >= 0xd800 && c < 0xe000) c = 0xfffd;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  function sha256hexJS(s) {
    var b = utf8(s), l = b.length, i, j;
    var nb = ((l + 9 + 63) >> 6) << 6, m = new Array(nb);
    for (i = 0; i < l; i++) m[i] = b[i];
    m[l] = 0x80; for (i = l + 1; i < nb; i++) m[i] = 0;
    var bits = l * 8;
    for (i = 0; i < 8; i++) m[nb - 1 - i] = Math.floor(bits / Math.pow(2, 8 * i)) & 255;
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], W = new Array(64);
    for (j = 0; j < nb; j += 64) {
      for (i = 0; i < 16; i++) W[i] = (m[j + 4 * i] << 24) | (m[j + 4 * i + 1] << 16) | (m[j + 4 * i + 2] << 8) | m[j + 4 * i + 3];
      for (i = 16; i < 64; i++) {
        var x = W[i - 15], y = W[i - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var t1 = (h + S1 + ((e & f) ^ (~e & g)) + K256[i] + W[i]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var t2 = (S0 + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var hex = '';
    for (i = 0; i < 8; i++) hex += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return hex;
  }
  function hash16(json) { return (typeof T.sha256hex === 'function' ? T.sha256hex(json) : sha256hexJS(json)).slice(0, 16); }
  function gameJSON() { return T.stateJSON(T.gameState); }

  // ---- the compact summary (what a record's `state` is the change of) ----------------------------------------------
  // Per layer: points, unlocked, upgrades, milestones, achievements, every non-zero buyable and challenge, the active
  // challenge. ~0.9 KB on ptr against a 12 KB `player`, and a record carries only the keys that CHANGED since the
  // record before it (a removed key reads null). Every checkpoint carries the whole summary AND the whole `player`, so
  // any record's state is the checkpoint before it plus the deltas after.
  function str(v) { try { return v === undefined || v === null ? null : String(v); } catch (e) { return '?'; } }
  function summary() {
    var o = {}, l, P, k, a;
    try { o.points = str(player.points); } catch (e) { /* an engine without top-level points */ }
    for (l in layers) {
      if (!layers[l] || layers[l].tmtLoaderLayer) continue;
      P = player[l];
      if (!P || typeof P !== 'object') continue;
      if (P.unlocked) o[l + '.u'] = 1;
      if (P.points !== undefined) o[l + '.p'] = str(P.points);
      a = P.upgrades; if (a && a.length) o[l + '.upg'] = a.join(',');
      a = P.milestones; if (a && a.length) o[l + '.ms'] = a.join(',');
      a = P.achievements; if (a && a.length) o[l + '.ach'] = a.join(',');
      for (k in (P.buyables || {})) { var bv = str(P.buyables[k]); if (bv !== '0' && bv !== null) o[l + '.b.' + k] = bv; }
      for (k in (P.challenges || {})) { var cv = str(P.challenges[k]); if (cv !== '0' && cv !== null) o[l + '.c.' + k] = cv; }
      a = P.activeChallenge; if (a !== null && a !== undefined && a !== 0 && a !== false) o[l + '.ac'] = str(a);
    }
    return o;
  }
  function delta(sum) {
    var d = {}, k, any = false;
    if (lastSum === null) { lastSum = sum; return sum; }
    for (k in sum) if (lastSum[k] !== sum[k]) { d[k] = sum[k]; any = true; }
    for (k in lastSum) if (!(k in sum)) { d[k] = null; any = true; }
    lastSum = sum;
    return any ? d : {};
  }

  // ---- arguments: JSON, with the few values JSON cannot carry tagged --------------------------------------------------
  // a big number, whichever library the game ships (break_eternity, OmegaNum, ExpantaNum, decimal.js …): an object
  // with a toString of its own — generic on purpose, as every other reading of these types in the loader is
  function isBig(v) { return !!v && typeof v === 'object' && !Array.isArray(v) && typeof v.toString === 'function' && v.toString !== Object.prototype.toString; }
  function enc(v) {
    if (v === undefined) return { $: 'u' };
    if (typeof v === 'function') return { $: 'f' };
    if (typeof v === 'number' && !isFinite(v)) return { $: 'n', v: String(v) };
    if (v === null || typeof v !== 'object') return v;
    if (isBig(v)) return { $: 'D', v: String(v) };
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return { $: '?' }; }
  }
  function dec(v) {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.$ === 'string') {
      if (v.$ === 'u') return undefined;
      if (v.$ === 'n') return Number(v.v);
      if (v.$ === 'D') return typeof Decimal === 'function' ? new Decimal(v.v) : v.v;
      return undefined;
    }
    return v;
  }
  function encArgs(a) { var o = []; for (var i = 0; i < a.length; i++) o.push(enc(a[i])); return o; }

  // ---- emitting ------------------------------------------------------------------------------------------------------
  function emit(rec) {
    if (cfg && cfg.origin === 'page') rec.wall = now() - t0wall;
    counts.records[rec.type] = (counts.records[rec.type] || 0) + 1;
    if (rec.type === 'action') { var ck = rec.source + ':' + rec.call; counts.calls[ck] = (counts.calls[ck] || 0) + 1; }
    var line = JSON.stringify(rec);
    counts.bytes += line.length + 1;
    sink(line, rec);
  }

  // ---- the wrappers --------------------------------------------------------------------------------------------------
  function sourceNow() { return auto !== null ? 'auto' : inLoop > 0 ? 'game' : 'player'; }
  function wrapCall(orig, call, where) {
    var w = function () {
      if (!on || depth > 0) return orig.apply(this, arguments);
      var pre = null;
      try { pre = { src: sourceNow(), call: call, args: encArgs(arguments), self: where ? selfOf(where, this) : undefined, json: gameJSON() }; } catch (e) { counts.errors++; }
      depth++;
      var ok = false;
      try { var r = orig.apply(this, arguments); ok = true; return r; }
      finally { depth--; if (pre !== null) { try { after(pre, ok); } catch (e) { counts.errors++; } } }
    };
    w[MARK] = orig;
    return w;
  }
  // which object the call ran on, by identity: the `tmp` copy (both engines' UI calls it there), the `layers`
  // original, or neither (null = no receiver worth naming; a replay then calls it on the `tmp` copy)
  function selfOf(where, self) {
    try {
      if (self === resolve(tmp, where.parent)) return 'tmp';
      if (self === resolve(layers, where.parent)) return 'layers';
    } catch (e) { /* a path that no longer resolves */ }
    return null;
  }
  function after(pre, ok) {
    var json = gameJSON();
    var did = json !== pre.json;
    // ⚖ A GAME OR AUTOMATION CALL THAT CHANGED NOTHING IS COUNTED, NOT WRITTEN. The game's own autobuyers call these
    // every tick, and the automation's buy loop ends every run of purchases with one refused call per buyable ("buy
    // until the amount stops moving") — written, those would be most of the log. A call that left the game state
    // byte-identical is not needed to replay it (the replay gate is what says so). A PLAYER's refused press IS
    // written, marked `did: false`: the player clicked, and that is worth reading.
    if (!did && pre.src !== 'player') { counts.refused[pre.src] = (counts.refused[pre.src] || 0) + 1; return; }
    var rec = { type: 'action', tick: tick, gs: gs, source: pre.src };
    if (pre.src === 'auto') { rec.by = auto.id; rec.at = [auto.layer, auto.via]; }
    rec.call = pre.call;
    rec.args = pre.args;
    if (pre.self !== undefined) rec.self = pre.self;
    rec.did = did;
    if (!ok) rec.threw = true;
    rec.state = delta(summary());
    rec.hash = hash16(json);
    if (pre.src === 'auto') auto.buf.push(rec); else emit(rec);
  }
  // the `toggles` kind's field write — the one automation action that is not a call. The automation tells us.
  function recordSet(l, field, value) {
    var json = gameJSON();
    var rec = { type: 'action', tick: tick, gs: gs, source: 'auto', by: auto ? auto.id : null, at: auto ? [auto.layer, auto.via] : null,
      call: 'set', args: [l, field, enc(value)], did: true, state: delta(summary()), hash: hash16(json) };
    if (auto) auto.buf.push(rec); else emit(rec);
  }
  // the decision's own `values` (the reset's gain and rule, a give-up's progress against its bar, the ids bought), made
  // plain: numbers and strings as they are, a big number as its string, one level deep — what `say()` was told
  function plainValues(v) {
    if (!v || typeof v !== 'object') return undefined;
    var o = {}, k, x;
    for (k in v) {
      x = v[k];
      if (x === undefined || typeof x === 'function') continue;
      if (x === null || typeof x === 'string' || typeof x === 'boolean') o[k] = x;
      else if (typeof x === 'number') o[k] = isFinite(x) ? x : String(x);
      else if (isBig(x)) o[k] = String(x);
      else if (Array.isArray(x)) o[k] = x.map(function (y) { return y === null || typeof y === 'string' || typeof y === 'boolean' || (typeof y === 'number' && isFinite(y)) ? y : String(y); });
      else o[k] = enc(x);
    }
    return o;
  }
  var execLink = {
    begin: function (f, l, via) { auto = { id: f.id, layer: l, via: via, buf: [] }; },
    // `given` (a replay): the original record's reason, carried over as it was
    end: function (f, r, given) {
      var a = auto; auto = null;
      if (!a || !a.buf.length) return;
      var why = given || (r && r.code ? { code: String(r.code) } : { code: 'threw' });
      if (!given && r && r.values) { try { var pv = plainValues(r.values); if (pv) why.values = pv; } catch (e) { counts.errors++; } }
      for (var i = 0; i < a.buf.length; i++) { a.buf[i].why = why; emit(a.buf[i]); }
    },
    set: function (l, field, value) { if (on) { try { recordSet(l, field, value); } catch (e) { counts.errors++; } } },
  };
  function onEvent(ev) {
    if (!on) return;
    try { emit({ type: 'event', tick: tick, gs: gs, kind: ev.kind, layer: ev.layer, id: ev.id, key: ev.key, marks: ev.marks || null }); } catch (e) { counts.errors++; }
  }

  function wrapLoop(orig) {
    var w = function (diff) {
      if (!on) return orig.apply(this, arguments);
      inLoop++;
      try { return orig.apply(this, arguments); }
      finally { inLoop--; if (inLoop === 0) { try { tickEnd(num(diff)); } catch (e) { counts.errors++; } } }
    };
    w[MARK] = orig;
    return w;
  }
  // ⛔ CHECKPOINTS ARE TAKEN ONLY AT A TICK'S END — so a replay, which re-applies the automation's calls inside the
  // same slots and then reaches the same tick end, takes them at the same state. A ladder mark is checked there too,
  // by its own predicate, exactly as the harness's monitor checks it (after each tick) — never on an event, whose
  // timing inside a tick a replay does not reproduce.
  function tickEnd(diff) {
    tick++;
    gs = round9(gs + (diff >= 0 ? diff : 0));
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i], v = false;
      try { v = !!m.fn(); } catch (e) { v = false; }
      if (v) { marks.splice(i, 1); i--; checkpoint('mark', m.id); }
    }
    if (gs >= nextCk) { checkpoint('interval'); while (nextCk <= gs) nextCk = round9(nextCk + cfg.every); }
  }
  function checkpoint(why, mark) {
    var json = gameJSON(), sum = summary();
    lastSum = sum;
    var rec = { type: 'checkpoint', tick: tick, gs: gs, why: why };
    if (mark) rec.mark = mark;
    rec.hash = hash16(json);
    rec.summary = sum;
    rec.player = JSON.stringify(player);
    try { rec.runtime = typeof T.runtimeState === 'function' ? T.runtimeState() : null; } catch (e) { rec.runtime = null; }
    if (why === 'stop') rec.counts = { records: Object.assign({}, counts.records), calls: Object.assign({}, counts.calls), refused: Object.assign({}, counts.refused), errors: counts.errors };
    emit(rec);
  }

  // ---- installing the hooks (once) ----------------------------------------------------------------------------------
  function familyOf(hooks, id) {
    var fams = hooks.families || {}, name = hooks['default'];
    for (var k in fams) if (fams[k].members && fams[k].members.indexOf(id) >= 0) { name = k; break; }
    var g = [], lp = [], seen = {}, chain = [];
    for (var f = name; f && fams[f] && !seen[f]; f = fams[f]['extends']) { seen[f] = 1; chain.unshift(f); }
    for (var i = 0; i < chain.length; i++) { g = g.concat(fams[chain[i]].globals || []); lp = lp.concat(fams[chain[i]].layer || []); }
    return { name: name, globals: g, layer: lp };
  }
  function resolve(root, path) { var o = root; for (var i = 0; i < path.length; i++) { if (o === null || o === undefined) return undefined; o = o[path[i]]; } return o; }
  // every concrete path a pattern matches under one layer: `buyables.*.sellOne` → [['buyables','11','sellOne'], …]
  function expand(obj, parts, i, acc, out) {
    if (obj === null || obj === undefined || typeof obj !== 'object' && typeof obj !== 'function') return;
    if (i === parts.length - 1) { if (parts[i] !== '*' && typeof obj[parts[i]] === 'function') out.push(acc.concat([parts[i]])); return; }
    if (parts[i] === '*') { for (var k in obj) { var v = obj[k]; if (v && typeof v === 'object') expand(v, parts, i + 1, acc.concat([k]), out); } return; }
    expand(obj[parts[i]], parts, i + 1, acc.concat([parts[i]]), out);
  }
  function install() {
    if (installed) return installed;
    var fam = familyOf(HOOKS || { families: {} }, T.id);
    installed = { family: fam.name, globals: [], layer: [], gameLoop: false };
    for (var i = 0; i < fam.globals.length; i++) {
      var n = fam.globals[i];
      try {
        if (typeof G[n] === 'function' && !G[n][MARK]) { G[n] = wrapCall(G[n], n, null); installed.globals.push(n); }
      } catch (e) { /* not writable here: not hooked, and `installed` says so */ }
    }
    for (var l in layers) {
      if (!layers[l] || layers[l].tmtLoaderLayer) continue;
      for (var j = 0; j < fam.layer.length; j++) {
        var found = [];
        expand(layers[l], fam.layer[j].split('.'), 0, [], found);
        for (var q = 0; q < found.length; q++) {
          var p = found[q], parent = [l].concat(p.slice(0, -1)), key = p[p.length - 1];
          var call = 'layers.' + [l].concat(p).join('.');
          var where = { parent: parent };
          var roots = [['layers', layers], ['tmp', typeof tmp === 'object' ? tmp : null]];
          for (var r = 0; r < roots.length; r++) {
            var c = roots[r][1] ? resolve(roots[r][1], parent) : null;
            try { if (c && typeof c[key] === 'function' && !c[key][MARK]) c[key] = wrapCall(c[key], call, where); } catch (e) { /* frozen */ }
          }
          installed.layer.push(call);
        }
      }
    }
    try { if (typeof G.gameLoop === 'function' && !G.gameLoop[MARK]) { G.gameLoop = wrapLoop(G.gameLoop); installed.gameLoop = true; } } catch (e) { /* none */ }
    return installed;
  }

  // the ladder's marks that do not hold YET — the ones a checkpoint is taken at when they do. Returns the held ones.
  function loadMarks() {
    marks = [];
    var held = [];
    var L = T.ladder && T.ladder.marks && typeof T.ladder.marks.length === 'number' ? T.ladder.marks : [];
    for (var i = 0; i < L.length; i++) {
      var m = L[i]; if (!m || !m.id || typeof m.predicate !== 'string') continue;
      var fn; try { fn = T.predicate(m.predicate); } catch (e) { continue; }
      var v = false; try { v = !!fn(); } catch (e) { v = false; }
      if (v) held.push(m.id); else marks.push({ id: m.id, name: m.name || null, fn: fn });
    }
    return held;
  }

  // ---- start / stop ------------------------------------------------------------------------------------------------
  /** start(options, sink): options = {origin: 'harness'|'page', every (game-s between checkpoints), loader, snapshot,
   *  diff, profile, autoOpt, noCurrency, noAuto, ladder (the file the marks come from), cap}; sink(line, record). */
  function start(o, s) {
    if (on) return status();
    cfg = Object.assign({ origin: 'page', every: 600 }, o || {});
    cfg.every = Number(cfg.every) > 0 ? Number(cfg.every) : 600;
    sink = s;
    counts = { records: {}, calls: {}, refused: {}, errors: 0, bytes: 0 };
    HOOKS = T.logHooks || HOOKS;
    install();
    tick = Number(T.ticks) || 0;
    gs = Number(T.gameSeconds) || 0;
    nextCk = round9((Math.floor(gs / cfg.every) + 1) * cfg.every);
    t0wall = now();
    lastSum = null;
    var held = loadMarks();
    var json = gameJSON();
    var engine = null; try { engine = T.manifest && T.manifest.engine ? T.manifest.engine.tmtNum || null : null; } catch (e) { engine = null; }
    on = true;
    emit({ type: 'header', format: FORMAT, game: T.id || null, engine: engine, loader: cfg.loader || null, origin: cfg.origin,
      start: { tick: tick, gs: gs, snapshot: cfg.snapshot || null, hash: hash16(json), marksHeld: held },
      config: { diff: cfg.diff === undefined ? null : cfg.diff, profile: cfg.profile || T.profileName || null, autoOpt: cfg.autoOpt || null,
        noCurrency: !!cfg.noCurrency, noAuto: !!cfg.noAuto, ladder: cfg.ladder || null, every: cfg.every },
      hooks: { family: installed.family, globals: installed.globals.slice(), layer: installed.layer.slice(), gameLoop: installed.gameLoop } });
    checkpoint('start');
    // ⚠ THE TRACKER IS ARMED BEFORE THE LOG SUBSCRIBES: arming walks everything already held, and none of that is news
    link.track = true;
    try { if (typeof T.progressArm === 'function') T.progressArm(); } catch (e) { counts.errors++; }
    link.progress = onEvent;
    link.exec = execLink;
    return status();
  }
  function stop() {
    if (!on) return status();
    try { checkpoint('stop'); } catch (e) { counts.errors++; }
    on = false;
    link.exec = null; link.progress = null; link.track = false; link.replay = null;
    auto = null;
    return status();
  }
  function status() {
    return { on: on, tick: tick, gs: gs, family: installed ? installed.family : null, hooked: installed ? installed.globals.length + installed.layer.length : 0,
      records: counts ? Object.assign({}, counts.records) : {}, bytes: counts ? counts.bytes : 0, refused: counts ? Object.assign({}, counts.refused) : {},
      errors: counts ? counts.errors : 0, every: cfg ? cfg.every : null };
  }

  // ---- applying a recorded call (the replay's, and later a queue's) ------------------------------------------------
  function apply(rec) {
    if (rec.call === 'set') {
      var P = player[rec.args[0]];
      P[rec.args[1]] = dec(rec.args[2]);
      execLink.set(rec.args[0], rec.args[1], dec(rec.args[2]));
      return;
    }
    var fn, self;
    if (rec.call.indexOf('.') < 0) fn = G[rec.call];
    else {
      var parts = rec.call.split('.').slice(1), parent = parts.slice(0, -1), key = parts[parts.length - 1];
      var owner = resolve(layers, parent);
      fn = owner ? owner[key] : undefined;
      self = rec.self === 'layers' ? owner : resolve(tmp, parent);
    }
    if (typeof fn !== 'function') throw new Error('replay: `' + rec.call + '` is not a function here');
    var args = [];
    for (var i = 0; i < (rec.args || []).length; i++) args.push(dec(rec.args[i]));
    try { fn.apply(self, args); } catch (e) { /* a recorded throw throws again; the record says `threw` */ }
  }

  // ---- REPLAY (harness; exact) ---------------------------------------------------------------------------------------
  // The log is a script: boot the header's start, automation OFF (profile off — the same features registered, so the
  // same `automate` slots exist), and re-apply every `player` / `auto` / `queue` call — a player's between ticks at its
  // tick, the automation's INSIDE the tick, in the same `runLayer` slot it was made in (the automation acts inside
  // gameLoop). Never a `game` call: the engine re-does those itself. The recorder runs throughout with a COMPARING
  // sink: every action and checkpoint it writes must equal the original's, in order, hash included. Events are not
  // compared: the tracker polls inside `runLayer` only while a profile runs, so under the replay's `off` an event can
  // land later in the same tick, with a later amount.
  var CMP_ACTION = ['tick', 'source', 'by', 'at', 'call', 'args', 'self', 'did', 'threw', 'hash'];
  var CMP_CK = ['tick', 'why', 'mark', 'hash'];
  function replayer(lines, opts) {
    opts = opts || {};
    var recs = [], i;
    for (i = 0; i < lines.length; i++) { if (lines[i]) recs.push(JSON.parse(lines[i])); }
    var header = recs[0];
    if (!header || header.type !== 'header' || header.format !== FORMAT) throw new Error('replay: not a ' + FORMAT + ' log');
    var expected = recs.filter(function (r) { return r.type === 'action' || r.type === 'checkpoint'; });
    var todo = recs.filter(function (r) { return r.type === 'action' && r.source !== 'game'; });
    var stopRec = null; for (i = recs.length - 1; i >= 0; i--) if (recs[i].type === 'checkpoint' && recs[i].why === 'stop') { stopRec = recs[i]; break; }
    var lastTick = expected.length ? expected[expected.length - 1].tick : header.start.tick;
    var endTick = stopRec ? stopRec.tick : lastTick + 1;
    var k = 0, ti = 0, mismatch = null, compared = { action: 0, checkpoint: 0 }, applied = 0;
    var expSum = {}, gotSum = {};
    function acc(sumObj, r) {
      if (r.type === 'checkpoint') { for (var a in sumObj) delete sumObj[a]; Object.assign(sumObj, r.summary); return; }
      for (var b in (r.state || {})) { if (r.state[b] === null) delete sumObj[b]; else sumObj[b] = r.state[b]; }
    }
    function same(a, b, keys) {
      for (var q = 0; q < keys.length; q++) { if (JSON.stringify(a[keys[q]]) !== JSON.stringify(b[keys[q]])) return keys[q]; }
      if (a.type === 'action' && JSON.stringify(a.why || null) !== JSON.stringify(b.why || null)) return 'why';
      return null;
    }
    function strip(r) { var o = {}; for (var x in r) if (x !== 'player' && x !== 'runtime' && x !== 'summary') o[x] = r[x]; return o; }
    function compareSink(line, rec) {
      if (mismatch || (rec.type !== 'action' && rec.type !== 'checkpoint')) return;
      var e = expected[k];
      acc(gotSum, rec);
      if (!e) { mismatch = { at: k, field: 'extra', expected: null, got: strip(rec) }; return; }
      acc(expSum, e);
      var f = e.type !== rec.type ? 'type' : same(e, rec, e.type === 'action' ? CMP_ACTION : CMP_CK);
      if (f) { mismatch = { at: k, field: f, expected: strip(e), got: strip(rec), stateDiff: sumDiff(expSum, gotSum) }; return; }
      compared[rec.type]++;
      k++;
    }
    function sumDiff(a, b) {
      var out = {}, key;
      for (key in a) if (a[key] !== b[key]) out[key] = [a[key], b[key] === undefined ? null : b[key]];
      for (key in b) if (!(key in a)) out[key] = [null, b[key]];
      return out;
    }
    // apply the recorded automation calls made in THIS slot of THIS tick, in order, grouped by feature (begin/end
    // around each group, so the replayed records carry the same `by`, `at` and reason code)
    function slot(l, via) {
      while (ti < todo.length && !mismatch) {
        var r = todo[ti];
        if (r.source !== 'auto' || r.tick !== tick || !r.at || r.at[0] !== l || r.at[1] !== via) return;
        execLink.begin({ id: r.by }, l, via);
        var code = r.why ? r.why.code : null;
        try {
          while (ti < todo.length) {
            var q = todo[ti];
            if (q.source !== 'auto' || q.tick !== tick || !q.at || q.at[0] !== l || q.at[1] !== via || q.by !== r.by || (q.why ? q.why.code : null) !== code) break;
            ti++; applied++;
            apply(q);
          }
        } finally { execLink.end({ id: r.by }, null, r.why || { code: code }); }
      }
    }
    function between() {
      while (ti < todo.length && !mismatch) {
        var r = todo[ti];
        if (r.source === 'auto' || r.tick !== tick) return;
        ti++; applied++;
        apply(r);
      }
    }
    return {
      header: header,
      endTick: endTick,
      start: function (sinkOpts) {
        start(Object.assign({}, header.config, { origin: header.origin, loader: header.loader, snapshot: header.start.snapshot }, sinkOpts || {}), compareSink);
        link.replay = slot;
        // the start itself: the header's hash and the first checkpoint must already agree
        if (hash16(gameJSON()) !== header.start.hash) mismatch = mismatch || { at: -1, field: 'start.hash', expected: header.start.hash, got: hash16(gameJSON()) };
      },
      /** tick until the original's stop (or the first mismatch). `step(diff)` ticks once — tmtLoader.tick. */
      run: function (step, diff, wallMs) {
        var t0 = now();
        while (tick < endTick && !mismatch) {
          between();
          if (mismatch) break;
          step(diff);
          if (wallMs && now() - t0 > wallMs) return this.result('walled');
        }
        if (!mismatch) between();
        return this.result(null);
      },
      result: function (why) {
        if (on) { link.replay = null; stop(); }
        var unapplied = todo.length - ti;
        var missing = !mismatch && k < expected.length ? { at: k, field: 'missing', expected: strip(expected[k]), got: null } : null;
        return { equal: !mismatch && !missing && !why && unapplied === 0, why: why, compared: compared, expected: expected.length, applied: applied, unapplied: unapplied,
          mismatch: mismatch || missing, endTick: endTick, stoppedAt: tick };
      },
    };
  }

  // ---- the page's memory sink: newest records within a cap, EVERY checkpoint kept -------------------------------------
  // ⚖ (user, 2026-09-30) in memory, with a size cap and a download; OFF unless switched on. The cap drops the OLDEST
  // records first and never a checkpoint or the header — a checkpoint is what makes the records after it readable, and
  // they are small beside the records at the page's rates (one every `every` game-seconds). Where records were dropped
  // the download says so with a `gap` line, so a reader never mistakes a hole for a quiet stretch.
  function memorySink(capBytes) {
    var keep = [], recs = [], head = 0, bytes = 0, seq = 0, dropped = 0;
    var s = function (line, rec) {
      var e = { seq: seq++, line: line, tick: rec.tick };
      if (rec.type === 'header' || rec.type === 'checkpoint') keep.push(e);
      else { recs.push(e); bytes += line.length + 1; }
      while (bytes > capBytes && head < recs.length) { bytes -= recs[head].line.length + 1; recs[head] = null; head++; dropped++; }
      if (head > 1024 && head * 2 > recs.length) { recs = recs.slice(head); head = 0; }
    };
    s.text = function () {
      var all = keep.concat(recs.slice(head)).sort(function (a, b) { return a.seq - b.seq; }), out = [], prev = -1;
      for (var i = 0; i < all.length; i++) {
        if (prev >= 0 && all[i].seq !== prev + 1) out.push(JSON.stringify({ type: 'gap', dropped: all[i].seq - prev - 1, beforeTick: all[i].tick }));
        out.push(all[i].line); prev = all[i].seq;
      }
      return out.join('\n') + '\n';
    };
    s.stats = function () { return { kept: keep.length + recs.length - head, dropped: dropped, bytes: bytes, cap: capBytes }; };
    return s;
  }
  var pageSink = null;
  var DEFAULT_CAP = 4 * 1024 * 1024;
  /** The page's switch: start recording into memory (the cap from `?autoOpt=logCap=<bytes>`), or stop. */
  function setPage(onNow) {
    if (onNow && !on) {
      var cap = Number(T.options && T.options.logCap);
      pageSink = memorySink(isFinite(cap) && cap > 0 ? cap : DEFAULT_CAP);
      var ladderFile = T.ladder && T.id ? 'tools/harness/ladder/' + T.id + '.json' : null;
      // the page asks for its ladder lazily (the 2 games that have one); its marks join when it arrives
      if (T.ladder === undefined && typeof T.fetchLadder === 'function') {
        try { Promise.resolve(T.fetchLadder()).then(function () { if (on && T.ladder) loadMarks(); }); } catch (e) { /* no ladder */ }
      }
      return start({ origin: 'page', every: Number(T.options && T.options.logEvery) || 600, profile: T.profileName, ladder: ladderFile,
        autoOpt: T.options ? Object.keys(T.options).map(function (x) { return x + '=' + T.options[x]; }).join(';') : null }, pageSink);
    }
    if (!onNow && on) return stop();
    return status();
  }
  function pageText() {
    if (!pageSink) return '';
    return pageSink.text();
  }
  /** The download: the whole kept log as a .jsonl file — what is in memory now; recording carries on. */
  function download() {
    var text = pageText();
    var name = 'tmt-log-' + (T.id || 'game') + '-' + new Date().toISOString().replace(/[:.]/g, '-') + '.jsonl';
    try {
      var blob = new Blob([text], { type: 'application/x-ndjson' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
    } catch (e) { /* no DOM (the harness) */ }
    return { name: name, bytes: text.length };
  }

  T.stateLog = {
    format: FORMAT,
    start: start,
    stop: stop,
    status: function () { var s = status(); if (pageSink) s.memory = pageSink.stats(); return s; },
    apply: apply,
    replayer: replayer,
    setPage: setPage,
    text: pageText,
    download: download,
    summary: summary,
    sha256hex: sha256hexJS,
    installed: function () { return installed ? JSON.parse(JSON.stringify(installed)) : null; },
  };
})();
