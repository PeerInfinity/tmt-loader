// window.tmtLoader — the hook layer contract (plan §3e). L1 = contract level only: no automation features.
//
// A CLASSIC script (not a module) so the page inserts it after the game's scripts and the Node harness runs the very
// same file with vm.runInThisContext. It reads the engine's globals (layers, player, tmp, updateTemp, gameLoop,
// fixNaNs, save, importSave) only inside its members, never at load. The host (loader/page.js or
// tools/harness/boot.mjs) creates `globalThis.tmtLoader` first with id, manifest, managed, pause/resume, storage and,
// in Node, sha256hex; this file adds the rest.
(function () {
  var T = globalThis.tmtLoader || (globalThis.tmtLoader = {});
  // Engine globals are read as BARE identifiers: `player`, `layers`, `modInfo` may be global `let`s, which are not
  // properties of globalThis but are visible to this classic script through the global lexical scope.
  var G = globalThis;
  T.contract = 1;
  T.ticks = T.ticks || 0;
  T.gameSeconds = T.gameSeconds || 0;
  T.features = T.features || [];
  T.profileName = 'off';

  // The census's state mask (`time`, `offTime`, at every depth) plus the manifest's per-game additions.
  var extra = (T.manifest && T.manifest.headless && T.manifest.headless.stateMask) || [];
  var MASK = ['time', 'offTime'].concat(extra);
  T.stateMask = MASK.slice();

  T.stateJSON = function () {
    return JSON.stringify(player, function (k, v) { return MASK.indexOf(k) >= 0 ? undefined : v; });
  };

  T.hash = function () {
    var json = T.stateJSON();
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
  T.ids = function () {
    var out = { layers: {}, ids: [], counts: { ms: 0, upg: 0, buy: 0, ch: 0, ach: 0 } };
    for (var l in layers) {
      var L = layers[l];
      if (!L) continue;
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

  T.profile = function (name) {
    if (name !== 'off') throw new Error('profile "' + name + '" is not in L1 (only "off")');
    T.profileName = 'off';
    return T.profileName;
  };
  // The automation registry shape (A-rungs fill it). L1: recorded, never run.
  T.registerAutoFeature = function (def) { T.features.push(def); return T.features.length; };
})();
