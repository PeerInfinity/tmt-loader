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
  var AU = 'au';               // the loader's own side layer (declared here because `gameState` below names it)
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
  //
  // ⛔ EXCLUDING A LAYER ALSO DROPS `player.subtabs[<that layer>]`, AND THAT IS ONE RULE ON PURPOSE. The engines
  // keep which subtab of a layer's tab is on screen in `player.subtabs[layer].mainTabs` — a SEPARATE top-level
  // key — so a caller that drops `au` and not `subtabs.au` is asking for "the game without the automation layer"
  // and getting the automation layer's view state anyway. V1 learned this the expensive way: `hashGame` had the
  // subtabs exclusion and `--exclude au` did not, and the moment the `au` tab took subtabs all eight L1 anchor
  // rows of `gates-a1 --part 2` went red — `86067be644ce481c` → `51c48535df82cc29` on ptr idle 1000 — while
  // `hashGame` was untouched. Two spellings of one intention is how that happens; there is now one spelling.
  T.stateJSON = function (opts) {
    var excl = (opts && opts.exclude) || [];
    var root = player;
    var subs = excl.length ? root.subtabs : null;
    return JSON.stringify(root, function (k, v) {
      if (MASK.indexOf(k) >= 0) return undefined;
      if (this === root && excl.indexOf(k) >= 0) return undefined;
      if (subs && this === subs && excl.indexOf(k) >= 0) return undefined;
      return v;
    });
  };

  // ⛔ ONE DEFINITION OF "THE GAME'S STATE" — what the harness calls `hashGame`, and every consumer reads it from
  // here rather than repeating the literal. It drops the `au` LAYER, and by the rule above the au tab's selected
  // SUBTAB with it:
  //   · `player.au` — the loader's own side layer. Its `clickables` map has one key per toggle BUTTON, so the full
  //     hash moves with the NUMBER of registered features and a table change moves it without any game moving.
  //   · `player.subtabs.au` — which subtab of the `au` tab is on screen. V1 gave that tab subtabs (Simple /
  //     Advanced), and both engines then write `subtabs.au = {mainTabs: …}` at `getStartPlayer` and re-add it to an
  //     imported save through `fixData` (measured on both). Without this, every pinned `hashGame` in the repo would
  //     move — and a PLAYER switching subtab would move it again mid-run. The au tab's VIEW STATE IS NOT GAME
  //     STATE. ⚠ Measured before the change: `player.subtabs.au` is ABSENT on both engines (ptr `{q, ps, n, ma,
  //     mc}`, something `{changelog-tab, unlock, fundamental, …}`), so DELETING the key reproduces the historical
  //     bytes exactly — deletion does not reorder what is left. The brief's open question ("something's engine may
  //     already write `subtabs.au = {}`") is answered: it does not.
  T.gameState = { exclude: [AU] };
  T.hashGame = function () { return T.hash(T.gameState); };

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
  //
  // ---- THE STRATEGY TABLE (V2) — ONE SOURCE FOR THE VALIDATOR, THE ALPHABET, THE PICKER AND THE EDITORS -------------
  // ⛔ BEFORE V2 THERE WERE THREE. A policy was a string matched by a hand-written regex (`POLICIES`), listed a second
  // time by hand as a template (`policyTemplates`), and any UI that wanted to EDIT one would have been a third place
  // that knew `gain>=Nx` takes a number. Three spellings of one fact is how they drift. Now a strategy is ONE row of
  // DATA and everything else is derived from it: the validator regex per kind, the enumerable alphabet, the picker's
  // list, the parameter editors and the help the tab shows. ⚖ minimize hardcoding — a new strategy is one entry here
  // and no UI code at all.
  //
  // A row:
  //   kind      which feature kind it is a strategy FOR
  //   template  the policy string with `{param}` placeholders — `'gain>={n}x'`. With every placeholder replaced by its
  //             param's `placeholder` letter it is the row's ID (`gain>=Nx`), which is what `policyTemplates` lists and
  //             what the picker and the save use to name a strategy.
  //   label     the picker's words for it; help — ONE sentence, in the player's terms, saying what it waits for
  //   params    [{name, type, placeholder, default, min, max, label}] — `type` is one of PARAM_TYPES below
  //   layerTypes (reset only) the engine layer types it can ever fire on, and `why` when it cannot — ⚠ `gain>=Nx` can
  //             never fire on a STATIC layer (plan §14d.5): its gain is 1 per reset, so a MULTIPLE of what it already
  //             holds is unreachable the moment it holds 1. The picker must say that, not silently omit the row.
  //   needs     (f) → null when this strategy can run on that feature, else the sentence saying what it lacks
  //   progress  (f, values) → the fraction of its own target this refusal is at, for the stall fallback's ARBITER, or
  //             null where the strategy has no measurable target
  //
  // ⛔ A PARAMETER'S VALUE IS ALWAYS THE RAW STRING. `format(parse(s)) === s` is then exact by construction rather
  // than by luck: `Number('10.0')` prints `10` and `new Decimal('1e600')` prints `1e+600`, so a table that stored
  // typed values could not round-trip its own strings. The decision path converts at the point of use (`Number(p.n)`,
  // `D(p.n)`), which is also where the game's own big-number type belongs — a `quantity` spans the whole Decimal
  // range and `1e600` is a real threshold at the PTR frontier.
  var NUM = '\\d+(?:\\.\\d+)?';
  var DEC = '\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?';
  // ⚠ GROUP-FREE ON PURPOSE. Each param contributes EXACTLY ONE capture group to a strategy's pattern, so `parse`
  // can read the groups off in param order; a type whose own regex carried a group would shift every index after it.
  var PARAM_TYPES = {
    count:    { re: '\\d+', kind: 'integer', min: 1 },
    seconds:  { re: NUM,    kind: 'number',  min: 0 },
    factor:   { re: NUM,    kind: 'number',  min: 0 },
    quantity: { re: DEC,    kind: 'decimal', min: 0 },
    fraction: { re: NUM,    kind: 'number',  min: 0, max: 1 },
  };
  var STRATEGIES = [
    // --- reset -----------------------------------------------------------------------------------------------------
    { kind: 'reset', template: 'always', label: 'Always', help: 'Reset the moment the game allows it.' },
    { kind: 'reset', template: 'gain>={n}', label: 'Gain at least N', help: 'Wait until the reset would yield at least this much of the layer’s own resource.',
      params: [{ name: 'n', type: 'quantity', placeholder: 'N', default: '1', label: 'gain at least' }],
      progress: function (f, v) { return ratio(v && v.gain, v && v.need); } },
    { kind: 'reset', template: 'gain>={n}x', label: 'Gain at least N× what is held', help: 'Wait until the reset would yield at least this multiple of what the layer already holds.',
      params: [{ name: 'n', type: 'factor', placeholder: 'N', default: '2', label: 'multiple of what is held' }],
      layerTypes: ['normal', 'custom'], why: 'a static layer gains 1 per reset, so a multiple of what it already holds can never be reached (plan §14d.5)',
      progress: function (f, v) { return ratio(v && v.gain, v && v.need); } },
    { kind: 'reset', template: 'interval>={t}', label: 'Every T seconds', help: 'Reset once this many game-seconds have passed since this feature’s own last reset.',
      params: [{ name: 't', type: 'seconds', placeholder: 'T', default: '10', min: 0, label: 'seconds between resets' }],
      progress: function (f, v) { return ratio(v && v.elapsed, v && v.need); } },
    { kind: 'reset', template: 'unlocks-purchase', label: 'When the reset buys something', help: 'Wait until the points held plus the gain would afford this layer’s cheapest unowned upgrade or its next buyable level.' },
    { kind: 'reset', template: 'keepsUpgrades', label: 'Only once upgrades are kept', help: 'Wait for the milestone that lets this layer keep its upgrades through a reset.',
      needs: function (f) { return f.keepMilestone ? null : 'this game’s table declares no `keep` milestone for this feature'; } },
    // ⛔ CONSTANT-FREE, AND THAT IS THE POINT (V2 Part 2b). `gain>=Nx` fails wherever the bar rises with every reset
    // while the gain does not: PTR's `q` gains 2 Quirks a reset and its `2× held` grows geometrically, so the rule
    // stalls forever (plan §17, the user's own report). `rate-peak` asks the only question that needs no literal:
    // is the currency-per-second of THIS cycle still rising? Fire when even one more unit arriving right now could
    // not beat the best average rate seen since the last reset. For a large gain the +1 vanishes and this is "the
    // average has peaked"; for a small integer gain it is what stops the rule waiting for a step that is not coming.
    { kind: 'reset', template: 'rate-peak@{b}/{h}', label: 'At the rate peak', help: 'Reset when the resource-per-second of this cycle has clearly peaked — the optimum, with no threshold in the layer’s own units to choose.',
      params: [
        { name: 'b', type: 'fraction', placeholder: 'B', default: '0.1', label: 'give up this fraction of the best rate first' },
        { name: 'h', type: 'seconds', placeholder: 'H', default: '30', label: 'and hold below it for this many seconds' },
      ] },
    // --- upgrades --------------------------------------------------------------------------------------------------
    { kind: 'upgrades', template: 'cheapest-first', label: 'Cheapest first', help: 'Buy every unlocked, unowned, affordable upgrade, cheapest first.' },
    { kind: 'upgrades', template: 'order', label: 'The table’s order only', help: 'Buy only the upgrades this game’s table lists, in the order it lists them.',
      needs: function (f) { return f.order && f.order.length ? null : 'this game’s table declares no upgrade order for this feature'; } },
    { kind: 'upgrades', template: 'order-then-cheapest', label: 'The table’s order, then cheapest', help: 'Buy the table’s listed upgrades first, then everything else cheapest first.',
      needs: function (f) { return f.order && f.order.length ? null : 'this game’s table declares no upgrade order for this feature'; } },
    // --- buyables --------------------------------------------------------------------------------------------------
    { kind: 'buyables', template: 'buy', label: 'Buy', help: 'Buy each unlocked buyable as often as it can be afforded — what a click does.' },
    { kind: 'buyables', template: 'buyMax', label: 'Buy max', help: 'Use the game’s own buy-max where the buyable has one, otherwise buy one at a time.' },
    { kind: 'buyables', template: 'highest-first', label: 'Highest id first', help: 'Buy as above but from the highest id down, so a shared pool is not sunk into the cheapest one.' },
    { kind: 'buyables', template: 'buy-unless-saving', label: 'Buy unless saving for an upgrade', help: 'Buy nothing while this layer has an unowned upgrade in its own currency that costs more than it holds.' },
    { kind: 'buyables', template: 'reserve>={n}', label: 'Buy above a reserve of N', help: 'Buy only with the points above this reserve of the layer’s own currency.',
      params: [{ name: 'n', type: 'quantity', placeholder: 'N', default: '0', label: 'reserve' }] },
    { kind: 'buyables', template: 'reserve>=next-upgrade', label: 'Buy above the next upgrade’s cost', help: 'Buy only with the points above whatever this layer’s cheapest unowned upgrade costs right now.' },
    // --- the rest --------------------------------------------------------------------------------------------------
    { kind: 'toggles', template: 'on', label: 'Turn them on', help: 'Turn on every toggle the held milestones grant.' },
    { kind: 'challenges', template: 'sequential', label: 'One after another', help: 'Enter the first unlocked, incomplete challenge and leave it the moment it can be completed.' },
    { kind: 'challenges', template: 'off', label: 'Off', help: 'Do nothing with this layer’s challenges.' },
    { kind: 'clickables', template: 'when', label: 'When the table says', help: 'Click each clickable this game’s table lists, whenever its condition holds.',
      needs: function (f) { return f.clickList && f.clickList.length ? null : 'this game’s table lists no clickables for this feature'; } },
    { kind: 'clickables', template: 'off', label: 'Off', help: 'Do nothing with this layer’s clickables.' },
  ];
  // ---- the MODIFIERS: a strategy that rides ON another one ----------------------------------------------------------
  // ⚖ THE USER'S RULE, VERBATIM (2026-09-19): "If we are stuck waiting a long time for resources to double their
  // previous amount, triggering a reset, then we should do a reset of whichever resource is closest to reaching its
  // target. We could set the timeout threshold dynamically, based on how long previous resets have taken."
  // ⛔ SO IT IS A MODIFIER, NOT A POLICY OF ITS OWN. The primary rule still decides; the fallback only fires when the
  // primary has been saying no for K times as long as this feature's own resets have been taking. A policy that
  // REPLACED the primary would lose exactly the rule the player chose.
  var MODIFIERS = [
    { kind: 'reset', template: 'stall>={k}x/{n}', label: 'Fall back when stalled', help: 'If this feature’s own rule has been waiting K times longer than its resets usually take, reset anyway — but only the stalled feature closest to its target goes first.',
      params: [
        { name: 'k', type: 'factor', placeholder: 'K', default: '3', min: 1, label: 'stalled after K× the usual wait' },
        { name: 'n', type: 'count', placeholder: 'N', default: '5', min: 1, label: 'resets remembered' },
      ] },
  ];
  var MOD_SEP = '|';
  function reSafe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /** A row's pattern source, group-free except for one capture per parameter, in param order. */
  function patternOf(S) {
    var src = '';
    var parts = S.template.split(/(\{\w+\})/);
    for (var i = 0; i < parts.length; i++) {
      var m = /^\{(\w+)\}$/.exec(parts[i]);
      if (!m) { src += reSafe(parts[i]); continue; }
      src += '(' + PARAM_TYPES[paramOf(S, m[1]).type].re + ')';
    }
    return src;
  }
  function paramOf(S, name) {
    var ps = S.params || [];
    for (var i = 0; i < ps.length; i++) if (ps[i].name === name) return ps[i];
    throw new Error('strategy ' + S.template + ': the template names {' + name + '}, which it does not declare');
  }
  /** The row's ID: the template with every placeholder replaced by its param's letter (`gain>=Nx`). */
  function idOf(S) { return S.template.replace(/\{(\w+)\}/g, function (_, n) { return paramOf(S, n).placeholder; }); }
  (function () {
    var all = STRATEGIES.concat(MODIFIERS);
    for (var i = 0; i < all.length; i++) { all[i].id = idOf(all[i]); all[i].pattern = patternOf(all[i]); all[i].params = all[i].params || []; }
  })();
  function strategiesOf(kind) { return STRATEGIES.filter(function (S) { return S.kind === kind; }); }
  function modifiersOf(kind) { return MODIFIERS.filter(function (S) { return S.kind === kind; }); }
  function byStrategyId(kind, id) { var L = strategiesOf(kind).concat(modifiersOf(kind)); for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; }
  // ---- DERIVED: the validator, and the enumerable alphabet ----------------------------------------------------------
  // The validator each kind's policy string is checked against, built from the rows above — never written twice.
  var POLICIES = {};
  var KIND_LIST = ['reset', 'upgrades', 'buyables', 'toggles', 'challenges', 'clickables'];
  for (var ki = 0; ki < KIND_LIST.length; ki++) {
    (function (kind) {
      var prim = strategiesOf(kind).map(function (S) { return S.pattern; }).join('|');
      var mods = modifiersOf(kind);
      var suffix = mods.length ? '(?:' + reSafe(MOD_SEP) + '(?:' + mods.map(function (S) { return S.pattern; }).join('|') + '))?' : '';
      POLICIES[kind] = new RegExp('^(?:' + prim + ')' + suffix + '$');
    })(KIND_LIST[ki]);
  }
  // The ENUMERABLE alphabet of each kind — the regex above is the validator, this is the list a chooser can walk
  // (the advanced planner's candidate templates, docs/planner.md). A parameterised policy appears as its TEMPLATE
  // (`gain>=Nx`, `interval>=T`, `reserve>=N`): the number belongs to whoever chooses it, never to this file.
  T.policyTemplates = {};
  for (var kj = 0; kj < KIND_LIST.length; kj++) T.policyTemplates[KIND_LIST[kj]] = strategiesOf(KIND_LIST[kj]).map(function (S) { return S.id; });
  /** The table itself, as plain JSON — what the picker, the editors, the docs gate and the unit tests all read. */
  function strategyJSON(S) {
    return { id: S.id, kind: S.kind, template: S.template, label: S.label, help: S.help, pattern: S.pattern,
      layerTypes: S.layerTypes ? S.layerTypes.slice() : null, why: S.why || null,
      params: S.params.map(function (p) { return { name: p.name, type: p.type, placeholder: p.placeholder, default: p.default, min: p.min === undefined ? PARAM_TYPES[p.type].min : p.min, max: p.max === undefined ? (PARAM_TYPES[p.type].max === undefined ? null : PARAM_TYPES[p.type].max) : p.max, label: p.label, valueKind: PARAM_TYPES[p.type].kind }; }) };
  }
  T.strategies = function (kind) { return (kind ? strategiesOf(kind) : STRATEGIES).map(strategyJSON); };
  T.modifiers = function (kind) { return (kind ? modifiersOf(kind) : MODIFIERS).map(strategyJSON); };
  T.paramTypes = function () { var o = {}; for (var k in PARAM_TYPES) o[k] = { re: PARAM_TYPES[k].re, kind: PARAM_TYPES[k].kind, min: PARAM_TYPES[k].min }; return o; };
  /** `parse('gain>=2x|stall>=3x/5')` → {id, params, modifier}. Values are RAW STRINGS (see the note above). */
  function parsePolicy(kind, str) {
    if (typeof str !== 'string' || !str) return null;
    var cut = str.indexOf(MOD_SEP);
    var head = cut < 0 ? str : str.slice(0, cut);
    var tail = cut < 0 ? null : str.slice(cut + MOD_SEP.length);
    var S = matchRow(strategiesOf(kind), head);
    if (!S) return null;
    var out = { id: S.id, params: S.params, modifier: null };
    if (tail !== null) {
      var M = matchRow(modifiersOf(kind), tail);
      if (!M) return null;
      out.modifier = { id: M.id, params: M.params };
    }
    return out;
  }
  function matchRow(rows, s) {
    for (var i = 0; i < rows.length; i++) {
      var m = new RegExp('^' + rows[i].pattern + '$').exec(s);
      if (!m) continue;
      var p = {};
      for (var j = 0; j < rows[i].params.length; j++) p[rows[i].params[j].name] = m[j + 1];
      return { id: rows[i].id, params: p };
    }
    return null;
  }
  /** The inverse: a parsed policy back to its exact string. `formatPolicy(parsePolicy(k, s)) === s`. */
  function formatPolicy(kind, parsed) {
    if (!parsed) return null;
    var S = byStrategyId(kind, parsed.id);
    if (!S) return null;
    var out = fillTemplate(S, parsed.params);
    if (parsed.modifier) {
      var M = byStrategyId(kind, parsed.modifier.id);
      if (!M) return null;
      out += MOD_SEP + fillTemplate(M, parsed.modifier.params);
    }
    return out;
  }
  function fillTemplate(S, params) {
    return S.template.replace(/\{(\w+)\}/g, function (_, n) {
      var p = paramOf(S, n);
      var v = params && params[n] !== undefined && params[n] !== null ? String(params[n]) : String(p.default);
      return v;
    });
  }
  T.parsePolicy = parsePolicy;
  T.formatPolicy = formatPolicy;
  /** The default string for a strategy id — its template with every parameter at its declared default. */
  T.defaultPolicyString = function (kind, id) { var S = byStrategyId(kind, id); return S ? fillTemplate(S, {}) : null; };
  /** Is this parameter value acceptable for its type and bounds? Returns null, or the sentence saying why not. */
  function checkParam(S, name, value) {
    var p = paramOf(S, name), t = PARAM_TYPES[p.type];
    var s = String(value === undefined || value === null ? '' : value).trim();
    if (!new RegExp('^' + t.re + '$').test(s)) return 'not a ' + p.type + ' — ' + (p.type === 'quantity' ? 'a number, optionally with an exponent (1e600)' : p.type === 'count' ? 'a whole number' : 'a number');
    // ⚠ A BOUND FALLS BACK TO THE TYPE'S, and the first cut only did that for the minimum — so `fraction`'s max of
    // 1 was declared and never consulted, and `rate-peak@2/0` validated (measured by this file's own leg 1).
    var lo = p.min === undefined ? t.min : p.min, hi = p.max === undefined ? (t.max === undefined ? null : t.max) : p.max;
    var n = p.type === 'quantity' ? null : Number(s);
    if (n !== null && lo !== undefined && lo !== null && n < lo) return 'below the smallest value this takes (' + lo + ')';
    if (n !== null && hi !== null && n > hi) return 'above the largest value this takes (' + hi + ')';
    if (p.type === 'quantity' && lo !== undefined && lo !== null) { try { if (D(s).lt(D(String(lo)))) return 'below the smallest value this takes (' + lo + ')'; } catch (e) { /* a type that cannot compare */ } }
    return null;
  }
  T.checkParam = function (kind, id, name, value) { var S = byStrategyId(kind, id); if (!S) throw new Error('no strategy "' + id + '" of kind ' + kind); return checkParam(S, name, value); };
  /** May this feature use this strategy? `{ok, why}` — the picker shows the why rather than hiding the row. */
  function availability(f, S) {
    if (S.layerTypes) {
      var t = null;
      try { t = (tmp[f.layer] && tmp[f.layer].type) || (layers[f.layer] && layers[f.layer].type) || null; } catch (e) { t = null; }
      if (t !== null && S.layerTypes.indexOf(t) < 0) return { ok: false, why: S.why || ('this strategy only applies to a ' + S.layerTypes.join(' / ') + ' layer, and this one is ' + t) };
    }
    if (typeof S.needs === 'function') { var w = S.needs(f); if (w) return { ok: false, why: w }; }
    return { ok: true, why: null };
  }
  function ratio(a, b) {
    try {
      var x = D(a), y = D(b);
      if (!(y.gt(D(0)))) return null;
      var r = Number(String(x.div(y)));
      return isFinite(r) ? r : null;
    } catch (e) { return null; }
  }
  // ---- the reason vocabulary (V1; docs/automation.md) ----------------------------------------------------------------
  // ⛔ A REASON IS THE DECISION'S OWN RETURN VALUE, never a second opinion about it. Every exit of every kind's
  // decision path yields one of the codes below together with the raw numbers it compared; the caller takes `.act`,
  // and the feature keeps the last one in `f.last`. An explainer that RE-DERIVED "why it did not act" from the
  // predicates would be a second implementation of them, free to disagree with the decision it describes, with
  // nothing able to notice — so there is exactly ONE implementation and the readout is its output.
  //
  // The table is DATA: code → the template its text is built from, and the `values` keys that template consumes.
  // `{x}` is replaced by `values.x`, formatted by the GAME's own `format()` where it has one (`fmt` below). An exit
  // that reaches none of these is `unknown`, and `unknown` is a GATE FAILURE (gates-v1 leg 1), never a display string.
  //
  // ⛔ NO FREE-TEXT VALUE. Every `values` entry is a number, a Decimal, a layer id, a numeric item id or a list of
  // them — a display string in a value would be this table's vocabulary leaking back out of it, and a code whose
  // text came from its caller could not be enumerated, witnessed or translated.
  //
  // `quantities` names the value keys that are QUANTITIES OF THE GAME — those and only those go through the game's
  // own `format()`. An id is not a quantity: the first cut ran every value through it and the tab read "the
  // cheapest upgrade is 21.00 at 20.00", with the upgrade's id formatted as a number.
  var CODES = {
    // not running at all
    locked:               { text: 'Locked',                                                       values: [] },
    armed:                { text: 'Armed — waiting for the unlock',                               values: [] },
    off:                  { text: 'Off',                                                          values: [] },
    'off:policy':         { text: 'Off — the policy is {policy}',                                 values: ['policy'] },
    'off:excluded':       { text: 'Off — excluded from this game: {reason}',                      values: ['reason'] },
    // running, and something else says no
    'blocked:gate':       { text: 'Blocked — the gate {gate} is false',                           values: ['gate'] },
    'blocked:after':      { text: 'Blocked — waiting for {sibling} to unlock first',              values: ['sibling'] },
    'blocked:enter':      { text: 'Blocked — the game will not enter challenge {id}',             values: ['id'] },
    'blocked:exit':       { text: 'Blocked — the game will not exit challenge {id} yet',          values: ['id'] },
    'yielding:native':    { text: "Yielding — the game's own auto-reset is resetting {layer}",     values: ['layer'] },
    'cannot-reset':       { text: 'Cannot reset — {have} of {need}',                              values: ['have', 'need'], quantities: ['have', 'need'] },
    'in-challenge':       { text: 'In challenge {id} — not completable yet',                      values: ['id'] },
    // running, and the policy says not yet
    'waiting:gain':       { text: 'Waiting — gain {gain} of {need}',                              values: ['gain', 'need'], quantities: ['gain', 'need'] },
    'waiting:gain-x':     { text: 'Waiting — gain {gain} of {need} ({n}× the {have} held)',        values: ['gain', 'need', 'n', 'have'], quantities: ['gain', 'need', 'have'] },
    'waiting:interval':   { text: 'Waiting — {elapsed} s of {need} s since the last reset',        values: ['elapsed', 'need'] },
    'waiting:milestone':  { text: 'Waiting — milestone {id} of {layer} is not held',              values: ['layer', 'id'] },
    'waiting:purchase':   { text: 'Waiting — the reset would still afford nothing',               values: [] },
    // V2: the two new reset strategies. `waiting:rate` is `rate-peak` saying the cycle is still improving;
    // `waiting:stall-clock` is the stall MODIFIER's countdown, naming the primary rule that is still refusing; and
    // `waiting:stall-yield` is the ARBITER — this feature IS stalled and another stalled one is closer to its target,
    // which is the one state the other two codes cannot express.
    'waiting:rate':       { text: 'Waiting — {rate}/s now against the best {best}/s; the reset needs it under {need}/s for {hold} s and it has held {held} s', values: ['rate', 'best', 'need', 'held', 'hold'], quantities: ['rate', 'best', 'need'] },
    'waiting:stall-clock':{ text: 'Waiting — {elapsed} s of {need} s before the stall fallback may reset, and {policy} still says no', values: ['elapsed', 'need', 'policy'] },
    'waiting:stall-yield':{ text: 'Waiting — the stall fallback yielded to {layer}, which is closer to its target', values: ['layer'] },
    'waiting:when':       { text: 'Waiting — no clickable of {layer} is ready',                   values: ['layer'] },
    'holding:reserve':    { text: 'Holding — {have} under the reserve {reserve}',                 values: ['have', 'reserve'], quantities: ['have', 'reserve'] },
    'holding:saving':     { text: 'Holding — {have} while upgrade {id} costs {cost}',             values: ['have', 'id', 'cost'], quantities: ['have', 'cost'] },
    // running, and there is nothing to act on
    'nothing-affordable': { text: 'Nothing affordable — the cheapest {kind} is {id} at {cost}',   values: ['kind', 'id', 'cost'], quantities: ['cost'] },
    'nothing-to-do':      { text: 'Nothing to do — {kind} of {layer}: nothing is unlocked and unowned', values: ['kind', 'layer'] },
    // it acted — one code per kind, so `acted` is as enumerable as every refusal
    // ⚠ `rule` (V2) is WHICH rule fired it — the strategy's own id, or the modifier's when the stall fallback did.
    // Both are ids from the strategy table, so `acted:reset` stays as enumerable as every refusal.
    'acted:reset':              { text: 'Reset {layer} for {gain} ({rule})',                      values: ['layer', 'gain', 'rule'], quantities: ['gain'] },
    'acted:upgrades':           { text: 'Bought {n} upgrade(s): {ids}',                           values: ['n', 'ids'] },
    'acted:buyables':           { text: 'Bought {n} buyable(s): {ids}',                           values: ['n', 'ids'] },
    'acted:toggles':            { text: "Turned on {n} of the game's own toggle(s)",              values: ['n'] },
    'acted:challenge-enter':    { text: 'Entered challenge {id}',                                 values: ['id'] },
    'acted:challenge-exit':     { text: 'Completed and left challenge {id}',                      values: ['id'] },
    'acted:clickables':         { text: 'Clicked {n} clickable(s): {ids}',                        values: ['n', 'ids'] },
    unknown:              { text: 'UNKNOWN — an exit of the decision path that no code names',    values: [] },
  };
  T.reasonCodes = function () { var o = {}; for (var k in CODES) o[k] = { text: CODES[k].text, values: CODES[k].values.slice() }; return o; };

  // ⚠ The GAME's own `format()`, captured once (this file runs after every game script). A fork may not have one.
  var GAME_FORMAT = (function () { try { return new Function('return typeof format === "function" ? format : null')(); } catch (e) { return null; } })();
  // TMT's `format()` sets `player.hasNaN` when it meets a NaN, and the automation must not raise the game's own
  // panic flag just by DESCRIBING a state (loader/layerlist.js carries the same guard for the same reason).
  function withoutRaisingNaN(fn) {
    var had;
    try { had = player.hasNaN; } catch (e) { return fn(); }
    try { return fn(); } finally { try { if (had === false && player.hasNaN === true) player.hasNaN = false; } catch (e2) { /* not this engine's flag */ } }
  }
  // ⛔ THE COUNTER IS THE COST GATE. A leg is ~13.5 ms/tick and the harness runs hundreds of thousands of ticks, so
  // a string built per feature per tick is not acceptable. `f.last` is a code plus raw numbers; this is the ONLY
  // place a number becomes text, and `tmtLoader.explainStats().formats` must be **0** after a headless run that
  // never opened the tab (gates-v1 leg 3). An absolute zero is not something a mutant can satisfy by moving both
  // sides of a comparison.
  //
  // ⚠ `codes` is a CENSUS OF THE RUN, not of its last tick. `f.last` holds one decision, so a run that witnessed
  // `yielding:native` for 400 ticks and then acted has no trace of it at the stop — and "every code witnessed on a
  // real fixture" (gates-v1 leg 1) is a claim about the RUN. One interned-literal key and an increment per
  // decision; it is also where `unknown` would show up, and `unknown` at any count above 0 fails the gate.
  var explainStats = { decisions: 0, formats: 0, texts: 0, codes: {} };
  T.explainStats = function () { return { decisions: explainStats.decisions, formats: explainStats.formats, texts: explainStats.texts, codes: Object.assign({}, explainStats.codes) }; };
  function fmt(v) {
    explainStats.formats++;
    if (v === null || v === undefined) return '';
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'string' || typeof v === 'boolean') return String(v);
    var raw = String(v);
    // ⛔ NEVER `format()` A NaN. TMT's own formatter does not just return something odd — it logs
    // "We meet an NaN at (e^NaN)NaN" to the console AND sets `player.hasNaN`, which is the game's own panic flag.
    // MEASURED over the roster (gates-v1 --part 6): `arctree` holds such a value at a fresh save, and simply
    // DESCRIBING it set the alarm off. A readout must not do that, and the raw string is the more honest answer
    // anyway. (`withoutRaisingNaN` below still guards the flag for everything else, but it cannot un-log a line.)
    if (raw.indexOf('NaN') >= 0) return raw;
    if (GAME_FORMAT && (typeof v === 'number' || (NUMBER && v instanceof NUMBER))) {
      var s = withoutRaisingNaN(function () { try { return GAME_FORMAT(v); } catch (e) { return null; } });
      if (s !== null && s !== undefined) return String(s);
    }
    return raw;
  }
  function codeText(code, values) {
    explainStats.texts++;
    var C = CODES[code] || CODES.unknown;
    var q = C.quantities || [];
    return C.text.replace(/\{(\w+)\}/g, function (_, k) {
      if (!values || values[k] === undefined || values[k] === null) return '?';
      return q.indexOf(k) >= 0 ? fmt(values[k]) : plain(values[k]);
    });
  }
  function plain(v) { return Array.isArray(v) ? v.join(', ') : String(v); }
  T.reasonText = function (last) { return last ? codeText(last.code, last.values) : ''; };

  // `f.last` — the last decision. OUTSIDE `player` (it is not the player's game) and OUTSIDE `runtimeState()` (it
  // is a READOUT, recomputed on the next tick; recording it there would change the `runtime` block of every
  // committed snapshot and invalidate all of them).
  function say(f, code, values) {
    explainStats.decisions++;
    explainStats.codes[code] = (explainStats.codes[code] || 0) + 1;
    f.last = { code: code, values: values === undefined ? null : values, tick: T.ticks, at: Number(player.timePlayed) || 0 };
    return f.last;
  }
  // HTML escaping for every string the au tab renders through `display-text` (which is `v-html` in both engines):
  // a table's provenance line, an `off` reason and a gate predicate are AUTHOR-WRITTEN TEXT, and a layer's `name`
  // is the GAME's. None of them is markup.
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  T.escapeText = esc;

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
  // ⚖ MAY AUTOMATION BE ARMED FOR A FEATURE THAT IS NOT UNLOCKED YET? (user, 2026-09-19). Off by default, so the
  // behaviour every earlier row was measured against is the default. It is a SETTING of the `au` layer, and it lives
  // in `player[AU]` beside `disclosed` — the layer's own non-feature UI state, and the one store a save already
  // carries.
  // ⚠ WHERE IT LIVES, IN THREE STEPS, AND ONLY THE LAST IS TRUE NOW. U4 kept it OUT of `startData`, reasoning that
  // the S1 pins compare the full state hash. U6 MEASURED that and it was wrong: the S1 pinned rows compare ticks and
  // `hashGame`, the state WITHOUT `player.au`, and would never have seen the key — what a seeded key moves is the
  // FULL hash, which `gates-p1a --part 0` pins for the frontier fixture. A pin move is ⚖ the user's, so U6 routed
  // around it by owning `toggleAuto`'s click path. V1: the user GRANTED the pin move (plan §15d.2, "Yes, seed it"),
  // so `armLocked: false` IS in `startData` below, the wrapper is gone, and the pin was re-recorded ONCE —
  // `63f28e099536a119` → `11826e775e6f88d8`, carrying the au tab's new `player.subtabs.au` in the same move, with
  // `ticks` 14131, `lastProgress` 10531 and `hashGame` `f7a8854358ac4029` all unmoved.
  // ⛔ IT DOES NOT REACH `active()`, and that is the whole reason arming is SAFE rather than a foot-gun. Every branch
  // of `active()` already ANDs with `featureUnlocked(f)`, and `isOnSaved` is stored per id independently of unlock
  // state — so a feature armed while locked simply does not run, and `active()` turns it on BY ITSELF the moment the
  // feature unlocks, with no further press. The setting only lifts the two UI predicates that refuse the press.
  function armLocked() { return !!(player[AU] && player[AU].armLocked); }
  // `armable(f)`: may the player's press change this feature's saved flag? The one predicate both toggles read.
  function armable(f) { return featureUnlocked(f) || armLocked(); }
  T.armLocked = function (on) {
    if (on === undefined) return armLocked();
    if (!player[AU]) throw new Error('armLocked: no player.' + AU + ' (the au layer is not in this save yet)');
    // Vue.set, not a plain assignment: the key is absent until it is first written (see above), and 22 of the 171
    // engines' own `toggleAuto` assigns plainly — a new key written that way is not observed at all.
    if (G.Vue && typeof G.Vue.set === 'function') G.Vue.set(player[AU], 'armLocked', !!on);
    else player[AU].armLocked = !!on;
    return !!on;
  };
  // ⚠ … AND UNTIL V1 THE BUTTON DID NOT CALL THAT SETTER. U4 wrote `Vue.set` here and the reactivity bug shipped
  // anyway: the `toggle` component's click is hardcoded to the engine's own `toggleAuto`, so the careful reactive
  // write sat on a path the UI never takes. MEASURED on `ptr` (2026-09-19, the user's report): the button read
  // `OFF`, one press left the text `OFF` while `player.au.armLocked` became `true`. Vue 2 cannot observe a property
  // ADDED to an object after creation, ptr's `toggleAuto` assigns plainly
  // (`player[t[0]][t[1]] = !player[t[0]][t[1]]`), and the key was absent until that first press — so the value
  // flipped and the view never re-rendered. **22 of the 171** assign plainly and 149 use `Vue.set`, which is
  // exactly why the user saw it and a `Vue.set` engine would have hidden it.
  //
  // ⛔ U6 OWNED THE CLICK PATH (a `toggleAuto` wrapper) BECAUSE THE OTHER ROUTE COST A PIN. V1 PAID THE PIN AND THE
  // WRAPPER IS GONE. ⚖ The user granted the seed (plan §15d.2); `armLocked: false` is now in the layer's
  // `startData`, so the key exists from the first boot, there is nothing for Vue to observe LATE, and the engines'
  // own plain assignment is seen on every one of the 171. The setter above survives for programmatic callers (the
  // harness, a gate); the BUTTON reaches the engine's own `toggleAuto`, unwrapped, like every other toggle in every
  // game. MEASURED both ways before removing it — see the V1 as-built: with the seed and no wrapper, A1 part 2's
  // arming legs are green on BOTH engine families; and the mutant "unseeded AND unwrapped" is RED on ptr, which is
  // U6's original bug, so the leg can still see the thing it exists for.

  // A RUNTIME enable override (never saved, never a default): the advanced planner commits a configuration for an epoch
  // by switching individual features on and off under whatever profile is running — `off` is not a policy of every
  // kind, and writing player.au.features would put a planner decision into the player's save. Part of runtimeState(),
  // so it survives a snapshot / restore and a resumed run. `null` clears the override (back to the profile's answer).
  var enableOverride = {};
  T.setFeatureEnabled = function (id, on) {
    if (!byId[id]) throw new Error('no feature "' + id + '"');
    if (on === null || on === undefined) delete enableOverride[id]; else enableOverride[id] = !!on;
    return on === null || on === undefined ? null : !!on;
  };
  T.featureOverrides = function () { return Object.assign({}, enableOverride); };
  T.clearFeatureOverrides = function () { var n = 0; for (var k in enableOverride) { delete enableOverride[k]; n++; } return n; };
  // Whether a feature runs this tick under the current profile.
  function active(f) {
    if (T.profileName === 'off') return false;
    if (enableOverride[f.id] !== undefined) return enableOverride[f.id] && featureUnlocked(f);
    if (T.profileName === 'all') return featureUnlocked(f);
    return isOnSaved(f) && featureUnlocked(f);
  }
  T.featureState = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    return { id: id, layer: f.layer, kind: f.kind, policy: f.policy, policies: f.policies.slice(), saved: isOnSaved(f), unlocked: featureUnlocked(f), active: active(f), armable: armable(f),
      override: enableOverride[id] === undefined ? null : enableOverride[id], gate: f.gateSrc, gateHolds: f.gate ? holds(f.gate) : null,
      after: f.after.slice(), order: f.order ? f.order.slice() : null, keep: f.keepMilestone ? { layer: f.keepMilestone.layer, id: f.keepMilestone.id } : null, multiSkipped: f.multiSkipped || 0 };
  };

  // ⛔ NOT EVERY FORK CALLS ITS BIG-NUMBER TYPE `Decimal`. Most ship break_eternity, but `the-hyperoperator-tree`
  // ships ExpantaNum and `the-pro-tree` ships OmegaNum — both under the file name `break_eternity.js`, and neither
  // defines `Decimal` at all. Measured 2026-09-18 (U2g, the first G1 run over the whole roster WITH ?automation=1):
  // the au layer's startData below called `new Decimal(0)` unconditionally, so `onload load()` died with "Decimal is
  // not defined" and the automation page was dead on those two games while the plain page was green. Same shape as
  // the canReset note further down, and as U2d's `buyUpgrade` alias: a global the loader assumes and a fork lacks.
  // Read once — tmt-auto.js is inserted after every game script, so the type is already whatever this game's is.
  var NUMBER = (function () {
    for (var i = 0, n = ['Decimal', 'ExpantaNum', 'OmegaNum']; i < n.length; i++) {
      try { var C = new Function('return typeof ' + n[i] + ' !== "undefined" ? ' + n[i] + ' : null')(); if (C) return C; } catch (e) { /* not this one */ }
    }
    return null;
  })();
  function num(x) { return NUMBER ? new NUMBER(x) : x; }
  function D(x) { return NUMBER ? (x instanceof NUMBER ? x : new NUMBER(x === undefined || x === null ? 0 : x)) : x; }
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

  // ⛔ WHICH TWO NUMBERS A REFUSED RESET SHOWS — MEASURED, AND THE FIRST CUT OF V1 GOT IT WRONG. A **static**
  // layer's `canReset` compares `baseAmount` against **`nextAt`**, not `requires`: `requires` is the FIRST
  // threshold and stops moving, so ptr's `g` read "Cannot reset — 458.60 of 200.00" while the engine was refusing
  // (its `nextAt` was 9193). Both engines, in their own words: ptr `js/game.js:116-119`, something
  // `js/game.js:121-124`. A **normal** layer compares against `requires` (ptr also requires `getResetGain() > 0`).
  // ⚠ 2.7 lets a layer declare its own `canReset()`, and a `custom` layer ends in the layer's own method — there
  // neither number is the criterion and the pair is indicative. ⛑ The DECISION never uses this: it reads
  // `tmp[l].canReset`, the engine's own answer, so a wrong pair here misleads a reader and cannot move a game.
  function resetThreshold(l) {
    var t = tmp[l] || {};
    var need = t.type === 'static' ? t.nextAt : t.requires;
    if (need === undefined) need = t.requires === undefined ? t.nextAt : t.requires;
    return need === undefined ? null : need;
  }

  // ⚠ THIS FUNCTION USED TO MATCH THE POLICY STRING WITH ITS OWN REGEXES. Since V2 it reads the PARSED policy
  // (`parsedOf(f)`), whose id and parameters come from the one strategy table above — so a strategy's pattern, its
  // parameter's type and the branch that implements it cannot drift apart, and adding one is one table row plus one
  // case here. The exits are unchanged: every one still returns `{act, code, values}` and the caller reads `.act`.
  function decideReset(f) {
    var l = f.layer;
    if (!tmp[l] || tmp[l].canReset !== true) {
      // the engine's own refusal, with the two numbers it has WHERE it has them: `tmp[l].baseAmount` against
      // `tmp[l].requires` is what 2.2.1's and 2.7's own `canReset` compare for a normal / static layer. A `custom`
      // layer answers with its own `canReset()` and need not publish either, so both may be absent.
      var t = tmp[l] || {};
      return { act: false, code: 'cannot-reset', values: { have: t.baseAmount === undefined ? null : t.baseAmount, need: resetThreshold(l) } };
    }
    // yield to native: while the game's own auto-reset predicate holds, gameLoop resets this layer itself
    if (tmp[l].autoPrestige) return { act: false, code: 'yielding:native', values: { layer: l } };
    for (var i = 0; i < f.after.length; i++) if (!player[f.after[i]] || !player[f.after[i]].unlocked) return { act: false, code: 'blocked:after', values: { sibling: f.after[i] } };
    var P = parsedOf(f);
    var d = primaryReset(f, P);
    if (d.act) { d.rule = P ? P.id : null; return d; }
    // the MODIFIER rides on the refusal, and only on a refusal: the primary still decides.
    if (!P || !P.modifier) return d;
    return stallFallback(f, P, d);
  }
  /** The chosen strategy's own answer, with no modifier involved. */
  function primaryReset(f, P) {
    var l = f.layer, m;
    if (!P) return { act: false, code: 'unknown', values: null };
    if (P.id === 'always') return { act: true };
    // gain>=Nx: the gain is at least N × the points held (dimensionless); gain>=N: the gain is at least N
    if (P.id === 'gain>=Nx') {
      var have = D(player[l].points), needX = have.times(Number(P.params.n));
      if (D(tmp[l].resetGain).gte(needX)) return { act: true };
      return { act: false, code: 'waiting:gain-x', values: { gain: tmp[l].resetGain, need: needX, n: Number(P.params.n), have: player[l].points } };
    }
    if (P.id === 'gain>=N') {
      if (D(tmp[l].resetGain).gte(D(P.params.n))) return { act: true };   // Decimal: the threshold may be 1e276
      return { act: false, code: 'waiting:gain', values: { gain: tmp[l].resetGain, need: D(P.params.n) } };
    }
    if (P.id === 'keepsUpgrades') {
      if (hasMilestone(f.keepMilestone.layer, f.keepMilestone.id)) return { act: true };
      return { act: false, code: 'waiting:milestone', values: { layer: f.keepMilestone.layer, id: f.keepMilestone.id } };
    }
    if (P.id === 'interval>=T') {
      var now = Number(player.timePlayed) || 0;
      if (lastReset[f.id] === undefined || now - lastReset[f.id] >= Number(P.params.t)) return { act: true };
      return { act: false, code: 'waiting:interval', values: { elapsed: Math.round((now - lastReset[f.id]) * 10) / 10, need: Number(P.params.t) } };
    }
    if (P.id === 'unlocks-purchase') {
      if (resetBuysSomething(l)) return { act: true };
      return { act: false, code: 'waiting:purchase', values: null };
    }
    if (P.id === 'rate-peak@B/H') return decideRatePeak(f, P);
    // ⛔ the only way to reach this line is a policy the validator accepted and this switch does not implement.
    return { act: false, code: 'unknown', values: null };
  }

  // ---- rate-peak (V2 Part 2b): the currency-per-second optimum, with no threshold in the layer's own units --------
  // `rate = gain / (game-seconds since this feature's own last reset)`; `best` = the highest rate seen since that
  // reset. The bare rule fires when even ONE MORE unit of gain arriving RIGHT NOW could not beat the best:
  // `(gain + 1) / elapsed < best`. For a large gain the `+1` vanishes and this is "the average rate has peaked";
  // for a small integer gain (PTR's `q` gains 1, 2, 3 …) it is what stops the rule waiting forever for a step
  // that is not coming.
  //
  // ⚖ TWO PARAMETERS, BOTH THE USER'S (2026-09-19, mid-slice — see plan §18): *"The strategy shouldn't be to reset
  // immediately after the gain per second starts going down. There should be an editable buffer."* and then
  // *"Actually, I meant a time buffer, not a value buffer. Maybe we should have both. A time buffer meaning don't
  // reset until the value has stayed below the threshold for that long."*
  //   · `b` — the VALUE buffer: the threshold is `best × (1 − b)`, so the rule concedes the cycle only once the
  //     projected next-unit rate has fallen that fraction below the best. An integer gain makes the rate a SAWTOOTH
  //     (every step-up lifts it, every second between steps lowers it), and `b` is what separates a tooth from the
  //     peak. It is a PROXY for "how much of the peak rate we are willing to give up before conceding the cycle has
  //     peaked" (⚖ 13d.2: an arbitrary number must say what it stands for).
  //   · `h` — the TIME buffer: the condition must have held CONTINUOUSLY for `h` game-seconds. The moment it reads
  //     false the clock returns to zero, because a step-up lifting the rate back over the threshold is exactly what
  //     the wait is for.
  //   · `rate-peak@0/0` IS the bare rule and stays selectable — it is the CONTROL every measurement of the other
  //     two is against. The provisional defaults (0.1 / 30 s) are justified below and ⚖ R2's sweep owns the real
  //     ones; this slice moves no default into any table.
  //
  // ⚠ `best` AND THE HOLD CLOCK ARE KEPT AS PLAIN JSON AND RE-READ EVERY TICK, on purpose: that is the form
  // `runtimeState()` carries, so a run resumed from a snapshot taken MID-HOLD takes exactly the path an
  // uninterrupted one took. A Decimal held in memory and a Decimal round-tripped through JSON are not guaranteed to
  // be the same number, and a clock kept in a closure would not survive the restore at all.
  var rateBest = {};       // feature id → the best rate since its last reset, as a string
  var rateHold = {};       // feature id → the player.timePlayed at which the condition last BECAME true
  function decideRatePeak(f, P) {
    var l = f.layer;
    var gain = D(tmp[l].resetGain);
    // a reset that yields nothing is never the optimum of anything
    if (gain.lt(D(1))) { delete rateHold[f.id]; return { act: false, code: 'waiting:gain', values: { gain: tmp[l].resetGain, need: D(1) } }; }
    var now = Number(player.timePlayed) || 0;
    var last = lastReset[f.id];
    if (last === undefined || !(now - last > 0)) return { act: true };   // no cycle to compare against yet
    var elapsed = now - last;
    var rate = gain.div(D(elapsed));
    var best = rateBest[f.id] === undefined ? null : D(rateBest[f.id]);
    if (best === null || rate.gt(best)) { rateBest[f.id] = String(rate); best = D(rateBest[f.id]); }
    var buf = Number(P.params.b), hold = Number(P.params.h);
    var need = best.times(1 - buf);
    var over = gain.plus(D(1)).div(D(elapsed)).lt(need);
    if (!over) { delete rateHold[f.id]; return { act: false, code: 'waiting:rate', values: { rate: rate, best: best, need: need, held: 0, hold: hold } }; }
    if (rateHold[f.id] === undefined) rateHold[f.id] = now;
    var held = now - rateHold[f.id];
    if (held >= hold) return { act: true };
    return { act: false, code: 'waiting:rate', values: { rate: rate, best: best, need: need, held: r1(held), hold: hold } };
  }

  // ---- the STALL FALLBACK (V2 Part 2a): a modifier on a primary reset strategy ---------------------------------------
  // ⚖ The user's rule (2026-09-19): a feature whose own rule has been waiting far longer than that feature's resets
  // usually take is STALLED, and the stalled feature closest to its target resets anyway.
  //
  // ⛔ A RESET THAT FIRED BY THE FALLBACK MUST NOT FEED `typical`. PTR's `q` reset by its own rule after ~10, 83 and
  // 332 game-seconds; if a timed-out wait fed the threshold, `typical` would grow with every timeout and the
  // timeouts with it — geometrically, which is the very stall the modifier exists to break. So only an interval
  // between resets that the PRIMARY rule fired is remembered, and `median` of the last `n` of those is `typical`.
  // With no own-rule interval yet there is no `typical` at all and the modifier is SILENT: the feature shows its
  // primary's own reason, and the Advanced view says the fallback is waiting for its first own-rule reset.
  var stallMem = {};              // feature id → the last n own-rule intervals, in game-seconds
  var stallSince = {};            // feature id → when the modifier first ran for it (the FIRST interval's start)
  var stallFired = { loop: -1, layer: null };   // the gameLoop a fallback reset last fired in, and by whom
  // ⚠ `stallSince` EXISTS BECAUSE THE FIRST RESET OTHERWISE COSTS NOTHING AND TEACHES NOTHING. Measured on the stub
  // while building this: a feature that resets ONCE by its own rule and then waits forever has exactly ZERO
  // intervals — the one reset had no predecessor to be an interval FROM — so the fallback stayed dormant for good on
  // the very shape it exists for. The start of the first interval is the first tick the modifier ran for that
  // feature, which is a time the run already knows; it rides in `runtimeState()` with the rest, so a resumed run
  // measures the same interval an uninterrupted one did.
  function startOf(f) { return lastReset[f.id] !== undefined ? lastReset[f.id] : stallSince[f.id]; }
  function median(xs) {
    var a = xs.slice().sort(function (p, q) { return p - q; });
    var h = a.length >> 1;
    return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2;
  }
  function typicalOf(f) { var m = stallMem[f.id]; return m && m.length ? median(m) : null; }
  /** The modifier's clock starts the first tick it runs for a feature, so the FIRST reset is an interval too. */
  function armStall(f, P) { if (P && P.modifier && stallSince[f.id] === undefined) stallSince[f.id] = Number(player.timePlayed) || 0; }
  function pushInterval(f, P, dt) {
    if (!(dt > 0)) return;
    var n = Math.max(1, Math.round(Number(P.modifier.params.n)));
    var m = stallMem[f.id] || (stallMem[f.id] = []);
    m.push(Math.round(dt * 1e6) / 1e6);
    while (m.length > n) m.shift();
  }
  /** How far into its own stall clock this feature is — `null` when the modifier cannot speak yet. */
  function stallClock(f, P) {
    var typ = typicalOf(f);
    if (typ === null) return null;
    var last = startOf(f);
    if (last === undefined) return null;
    var now = Number(player.timePlayed) || 0;
    return { elapsed: now - last, need: Number(P.modifier.params.k) * typ, typical: typ };
  }
  function stallFallback(f, P, d) {
    var c = stallClock(f, P);
    if (c === null) return d;                         // dormant: nothing measured to be late against
    if (c.elapsed < c.need) return { act: false, code: 'waiting:stall-clock', values: { elapsed: r1(c.elapsed), need: r1(c.need), policy: P.id } };
    var gain = D(tmp[f.layer].resetGain);
    if (gain.lt(D(1))) return { act: false, code: 'waiting:gain', values: { gain: tmp[f.layer].resetGain, need: D(1) } };
    // ⛔ ONE STALLED FEATURE PER gameLoop. A reset changes the world the others were judged in — their gains, their
    // thresholds and (on a higher row) whether they exist at all — so the rest re-decide on the next tick.
    if (stallFired.loop === loopNo) return { act: false, code: 'waiting:stall-yield', values: { layer: stallFired.layer } };
    var win = stallWinner();
    if (win && win.f !== f) return { act: false, code: 'waiting:stall-yield', values: { layer: win.f.layer } };
    return { act: true, fallback: true };
  }
  /** THE ARBITER — "whichever resource is closest to reaching its target", across layers, this tick. */
  // Progress is a FRACTION of that feature's own target: for a STATIC layer `baseAmount / nextAt` (⛔ not `requires`,
  // which is the first threshold and stops moving — plan §16.3 item 8); otherwise whatever the chosen strategy
  // declares as its `progress` in the table, which is the ratio it is itself waiting on. A strategy with no
  // measurable target (`unlocks-purchase`, `keepsUpgrades`) has no fraction and ranks LAST.
  // ⚠ TIES BREAK BY REGISTRATION ORDER, which is layer row ascending, then the `layers` key order, then kind order —
  // the same order the tab draws and `features` holds. The comparison is strictly-greater, so the first feature of
  // an equal pair wins, deterministically and identically on every run.
  function stallWinner() {
    var best = null;
    for (var i = 0; i < features.length; i++) {
      var c = stallCandidate(features[i]);
      if (!c) continue;
      if (best === null || c.progress > best.progress) best = c;
    }
    return best;
  }
  /** Is this feature stalled RIGHT NOW, and how close is it to its own target? `null` when it is not a candidate. */
  // ⚠ It re-asks the primary rather than reusing the feature's last decision: `f.last` is the answer from the tick
  // that feature last ran in, and the arbiter is comparing states WITHIN one tick.
  function stallCandidate(g) {
    if (g.kind !== 'reset' || !active(g)) return null;
    var P = parsedOf(g);
    if (!P || !P.modifier) return null;
    if (g.gate && !holds(g.gate)) return null;
    var l = g.layer;
    if (!tmp[l] || tmp[l].canReset !== true || tmp[l].autoPrestige) return null;
    for (var i = 0; i < g.after.length; i++) if (!player[g.after[i]] || !player[g.after[i]].unlocked) return null;
    var d = primaryReset(g, P);
    if (d.act) return null;
    var c = stallClock(g, P);
    if (c === null || c.elapsed < c.need) return null;
    try { if (D(tmp[l].resetGain).lt(D(1))) return null; } catch (e) { return null; }
    var p = progressOf(g, P, d);
    return { f: g, progress: p === null ? -1 : p };
  }
  function progressOf(g, P, d) {
    var t = tmp[g.layer] || {};
    if (t.type === 'static') return ratio(t.baseAmount, t.nextAt);
    var S = byStrategyId('reset', P.id);
    return S && S.progress ? S.progress(g, d.values) : null;
  }
  function r1(x) { return Math.round(Number(x) * 10) / 10; }
  /** What the Advanced view shows about the modifier — a READOUT, never a decision (V1's rule). */
  T.stallState = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var P = parsedOf(f);
    if (!P || !P.modifier) return null;
    var c = stallClock(f, P), m = stallMem[f.id] || [];
    return { modifier: P.modifier.id, armed: c !== null, remembered: m.length, since: stallSince[f.id] === undefined ? null : r1(stallSince[f.id]), typical: c === null ? null : r1(c.typical),
      elapsed: c === null ? null : r1(c.elapsed), need: c === null ? null : r1(c.need),
      why: c === null ? 'no reset by this feature’s own rule yet, so there is nothing to be late against' : null };
  };
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

  // ⚠ `savingFor` used to answer a BOOLEAN. It now names the upgrade it is saving for, because `buy-unless-saving`'s
  // refusal is only legible with that number in it — the same loop, one more field.
  function savingForWhat(l) {
    var L = layers[l];
    if (!L.upgrades) return null;
    var ids = numIds(L.upgrades), held = D(player[l].points);
    for (var i = 0; i < ids.length; i++) {
      if (!buyableUpgrade(l, ids[i]) || !ownCurrency(L.upgrades[ids[i]])) continue;
      var c = D(tmp[l].upgrades[ids[i]].cost);
      if (c.gt(held)) return { id: ids[i], cost: c };
    }
    return null;
  }
  // The cheapest unowned, unlocked upgrade of the layer costed in the layer's OWN points, as a Decimal — or null when
  // there is none. `reserve>=next-upgrade` is exactly this number: the reserve a purchase feature must leave standing
  // is what the next upgrade of the same currency costs, read from the game (`tmp[l].upgrades[id].cost`) rather than
  // written into a table (⚖ minimize hardcoding). savingFor() asks the same question with a different answer shape.
  function cheapestOwnUpgradeCost(l) {
    var L = layers[l];
    if (!L.upgrades || !(tmp[l] && tmp[l].upgrades)) return null;
    var ids = numIds(L.upgrades), best = null;
    for (var i = 0; i < ids.length; i++) {
      if (!buyableUpgrade(l, ids[i]) || !ownCurrency(L.upgrades[ids[i]])) continue;
      var c = D(tmp[l].upgrades[ids[i]].cost);
      if (best === null || c.lt(best)) best = c;
    }
    return best;
  }
  function buyUpgradeCounted(l, id) {
    if (!canAffordUpgrade(l, id)) return 0;
    var before = player[l].upgrades.length;
    buyUpgrade(l, id);
    return player[l].upgrades.length > before ? 1 : 0;
  }
  function byCost(l) { var U = tmp[l].upgrades; return function (a, b) { var c = D(U[a].cost).cmp(D(U[b].cost)); return c !== 0 ? c : a - b; }; }

  // ⚠ EVERY MEMBER USED TO RETURN A COUNT. It now returns `{act, n, code, values}` — the same actions in the same
  // order, with the exit named. `n` is the count the caller adds to `stats.actions`; `act` is `n > 0` and is what
  // gates-v1 leg 2 compares against the action counter, tick by tick. No branch was added or removed: every
  // `return 0` of the previous version became a code, and every `return n` an `acted:` one.
  var EXEC = {
    reset: function (f) {
      armStall(f, parsedOf(f));
      var d = decideReset(f);
      if (!d.act) return d;
      var gain = tmp[f.layer] ? tmp[f.layer].resetGain : null;
      var P = parsedOf(f), before = startOf(f);
      // ⛔ ONLY AN OWN-RULE INTERVAL IS REMEMBERED (see stallFallback): a reset the FALLBACK fired must not feed the
      // threshold that decides when the fallback may fire, or the timeout grows with every timeout.
      if (P && P.modifier && !d.fallback && before !== undefined) pushInterval(f, P, (Number(player.timePlayed) || 0) - before);
      doReset(f.layer);
      lastReset[f.id] = Number(player.timePlayed) || 0;
      if (d.fallback) { stallFired.loop = loopNo; stallFired.layer = f.layer; }
      delete rateBest[f.id]; delete rateHold[f.id];   // a new cycle: neither the best rate nor the hold clock of the last one says anything about this one
      return { act: true, n: 1, code: 'acted:reset', values: { layer: f.layer, gain: gain, rule: d.fallback ? (P && P.modifier ? P.modifier.id : 'stall') : (d.rule || (P && P.id) || null) } };
    },
    // cheapest-first: unlocked, unowned upgrades sorted by tmp cost (ties by id); buy each one affordable, in order.
    // order: the table's order[] only. order-then-cheapest: order[] first (each affordable one, in order), then
    // cheapest-first over the upgrades not in order[]. Pseudo-upgrades (a `pseudoUnl`, PTR) are never bought.
    upgrades: function (f) {
      var l = f.layer, L = layers[l];
      if (!L.upgrades || !(tmp[l] && tmp[l].upgrades) || !player[l].unlocked) return { act: false, code: 'nothing-to-do', values: { kind: 'upgrades', layer: l } };
      var n = 0, i, bought = [];
      var buy = function (id) { var k = buyUpgradeCounted(l, id); if (k) { n += k; bought.push(id); } };
      var ordered = null;
      if (f.policy === 'order' || f.policy === 'order-then-cheapest') {
        ordered = (f.order || []).filter(function (id) { return buyableUpgrade(l, id); });
        for (i = 0; i < ordered.length; i++) buy(ordered[i]);
        if (f.policy === 'order') return n ? { act: true, n: n, code: 'acted:upgrades', values: { n: n, ids: bought } } : nothingBought(l, 'upgrade', ordered.sort(byCost(l)));
      }
      var rest = numIds(L.upgrades).filter(function (id) { return buyableUpgrade(l, id) && !(f.policy === 'order-then-cheapest' && f.order && f.order.indexOf(id) >= 0); });
      rest.sort(byCost(l));
      for (i = 0; i < rest.length; i++) buy(rest[i]);
      if (n) return { act: true, n: n, code: 'acted:upgrades', values: { n: n, ids: bought } };
      // ⚠ `rest` IS the candidate list, already sorted by cost — the cheapest unowned unlocked upgrade is rest[0],
      // at no extra cost to the tick. An empty `rest` (plus an empty `ordered`) means there is nothing to buy at all,
      // which is a different answer from "nothing is affordable" and reads very differently in the tab.
      return nothingBought(l, 'upgrade', ordered && ordered.length ? ordered.concat(rest).sort(byCost(l)) : rest);
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
      if (!L.buyables || !B || !player[l].unlocked) return { act: false, code: 'nothing-to-do', values: { kind: 'buyables', layer: l } };
      if (f.policy === 'buy-unless-saving') {
        var sv = savingForWhat(l);
        if (sv) return { act: false, code: 'holding:saving', values: { have: player[l].points, id: sv.id, cost: sv.cost } };
      }
      // reserve>=N: hold N of the LAYER'S OWN points back — nothing is bought while the layer holds no more than N.
      // The layer's points is the one currency a generic reserve can read (the same reasoning as buy-unless-saving);
      // a buyable costed in another layer's currency is still gated on THIS layer's points, so the chooser only picks
      // this policy when the quantity it wants to protect IS player[l].points (docs/planner.md, the candidate table).
      // reserve>=next-upgrade: the reserve is not a number in the table but the cost of the layer's cheapest unowned
      // unlocked own-currency upgrade, read live (R1′: PTR's Enhancers cost 2^(x^1.5) EP and would eat the EP that e11 /
      // e12 / e22 need — the reserve is whichever of those is next, not a literal). No such upgrade = no reserve.
      // ⚠ The reserve is checked before EVERY purchase, not once per tick. The first cut (P1b) checked it only on the
      // way in, so a tick that crossed N could spend straight back through it — with an Enhancer at 37 EP and a 400 EP
      // reserve, 401 EP buys ten of them and leaves 30. R1′: bounded in PTR only because the table's kindOrder runs
      // `upgrades` before `buyables` and EP moves in `reset` (first), so the upgrade takes the surplus first; the
      // policy is named `reserve`, so it holds.
      var rsv = /^reserve>=(.*)$/.exec(f.policy);
      var lim = null;
      if (rsv) {
        lim = rsv[1] === 'next-upgrade' ? cheapestOwnUpgradeCost(l) : D(rsv[1]);
        if (lim !== null && D(player[l].points).lte(lim)) return { act: false, code: 'holding:reserve', values: { have: player[l].points, reserve: lim } };
      }
      var reserved = function () { return lim !== null && D(player[l].points).lte(lim); };
      var ids = f.order ? f.order.slice() : numIds(L.buyables);
      if (f.policy === 'highest-first' && !f.order) ids.reverse();
      var n = 0, bought = [], held = false, seen = 0, minC = null, minId = null;
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!B[id] || !B[id].unlocked) continue;
        seen++;
        if (reserved()) { held = true; break; }
        // ⚠ the cheapest UNBOUGHT candidate, tracked only while nothing has been bought — once something has, the
        // answer is `acted:` and this costs nothing more.
        if (n === 0 && B[id].cost !== undefined) { try { var c = D(B[id].cost); if (minC === null || c.lt(minC)) { minC = c; minId = id; } } catch (e) { /* a cost this engine will not compare */ } }
        if (f.policy === 'buyMax' && L.buyables[id].buyMax && typeof buyMaxBuyable === 'function') {
          var b0 = String(player[l].buyables[id]);
          buyMaxBuyable(l, id);
          if (String(player[l].buyables[id]) !== b0) { n++; bought.push(id); }
          continue;
        }
        for (var k = 0; k < 1000; k++) {
          var before = String(player[l].buyables[id]);
          buyBuyable(l, id);
          if (String(player[l].buyables[id]) === before) break;
          n++;
          if (bought[bought.length - 1] !== id) bought.push(id);
          if (reserved()) { held = true; break; }
        }
        if (held) break;
      }
      if (n) return { act: true, n: n, code: 'acted:buyables', values: { n: n, ids: bought } };
      if (held) return { act: false, code: 'holding:reserve', values: { have: player[l].points, reserve: lim } };
      if (!seen) return { act: false, code: 'nothing-to-do', values: { kind: 'buyables', layer: l } };
      return { act: false, code: 'nothing-affordable', values: { kind: 'buyable', id: minId, cost: minC } };
    },
    // on: for each milestone of the layer that declares `toggles: [[layer, field], …]` and is held, set every such
    // player[layer][field] that is `false` to `true` — what the game's own toggle button does (toggleAuto flips it).
    // The 2.2.1 'multi' form {layer, varName, options} cycles a string, not an on/off: skipped (counted at derivation).
    toggles: function (f) {
      var n = 0, pending = null;
      for (var i = 0; i < f.toggleList.length; i++) {
        var t = f.toggleList[i];
        if (!hasMilestone(f.layer, t.ms)) { if (pending === null) pending = t; continue; }
        if (player[t.layer] && player[t.layer][t.field] === false) { player[t.layer][t.field] = true; n++; }
      }
      if (n) return { act: true, n: n, code: 'acted:toggles', values: { n: n } };
      // a milestone that is not held yet is the reason the toggle it grants is not on; otherwise every toggle the
      // held milestones grant is already true, which is this feature's finished state.
      if (pending) return { act: false, code: 'waiting:milestone', values: { layer: f.layer, id: pending.ms } };
      return { act: false, code: 'nothing-to-do', values: { kind: 'toggles', layer: f.layer } };
    },
    // sequential: the first challenge (order[] else id order) that is unlocked and below its completion limit — enter it
    // when no challenge of the layer is active; while it is active, exit-and-complete once it can be completed. A
    // challenge the feature did not choose (entered by hand) is left alone.
    challenges: function (f) {
      if (f.policy !== 'sequential') return { act: false, code: 'off:policy', values: { policy: f.policy } };
      var l = f.layer, C = tmp[l] && tmp[l].challenges;
      if (!C || !player[l].unlocked) return { act: false, code: 'nothing-to-do', values: { kind: 'challenges', layer: l } };
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
        if (pick === null || Number(act) !== pick) return { act: false, code: 'in-challenge', values: { id: Number(act) } };
        if (!canCompleteChallenge(l, pick)) return { act: false, code: 'in-challenge', values: { id: pick } };
        if (typeof canExitChallenge === 'function' && !canExitChallenge(l, pick)) return { act: false, code: 'blocked:exit', values: { id: pick } };
        startChallenge(l, pick);
        cs.exit++;
        return { act: true, n: 1, code: 'acted:challenge-exit', values: { id: pick } };
      }
      if (pick === null) return { act: false, code: 'nothing-to-do', values: { kind: 'challenges', layer: l } };
      if (typeof canEnterChallenge === 'function' && !canEnterChallenge(l, pick)) return { act: false, code: 'blocked:enter', values: { id: pick } };
      startChallenge(l, pick);
      if (Number(player[l].activeChallenge) === pick) { cs.enter++; return { act: true, n: 1, code: 'acted:challenge-enter', values: { id: pick } }; }
      return { act: false, code: 'blocked:enter', values: { id: pick } };
    },
    // when: the table's {id, when} list for the layer: click when the clickable is unlocked, canClick, and `when` holds.
    clickables: function (f) {
      if (f.policy !== 'when') return { act: false, code: 'off:policy', values: { policy: f.policy } };
      var l = f.layer, C = tmp[l] && tmp[l].clickables, n = 0, clicked = [];
      if (!C || !player[l].unlocked) return { act: false, code: 'nothing-to-do', values: { kind: 'clickables', layer: l } };
      for (var i = 0; i < f.clickList.length; i++) {
        var c = f.clickList[i], tc = C[c.id];
        if (!tc || tc.unlocked === false || !tc.canClick || !holds(c.when)) continue;
        clickClickable(l, c.id);
        clicked.push(c.id);
        n++;
      }
      if (n) return { act: true, n: n, code: 'acted:clickables', values: { n: n, ids: clicked } };
      return { act: false, code: 'waiting:when', values: { layer: l } };
    },
  };
  // "nothing was bought" told apart: an empty candidate list is `nothing-to-do`, a non-empty one names its cheapest.
  function nothingBought(l, kind, candidates) {
    if (!candidates || !candidates.length) return { act: false, code: 'nothing-to-do', values: { kind: kind + 's', layer: l } };
    var id = candidates[0];
    return { act: false, code: 'nothing-affordable', values: { kind: kind, id: id, cost: tmp[l].upgrades[id] ? tmp[l].upgrades[id].cost : null } };
  }

  function runLayer(l, via) {
    if (ranAt[l] === loopNo) stats.doubles++;
    ranAt[l] = loopNo;
    stats.calls[l] = (stats.calls[l] || 0) + 1;
    (via === 'slot' ? stats.viaSlot : stats.viaFallback)[l] = ((via === 'slot' ? stats.viaSlot : stats.viaFallback)[l] || 0) + 1;
    if (T.profileName === 'off') return;
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      if (f.layer !== l) continue;
      // ⚠ EVERY exit records, including the ones that do nothing: a feature the player can see in the tab and that
      // is not running has a reason too, and `off` / `locked` / `armed` are the three the tab shows most often.
      if (!active(f)) { say(f, featureUnlocked(f) ? 'off' : (isOnSaved(f) ? 'armed' : 'locked'), null); f.onSince = null; continue; }
      // `onSince`: when this feature last became ELIGIBLE (on, unlocked, under a profile that runs it) with nothing
      // done since. It is what `neverFired` is measured over, and it lives outside `player` like `f.last`.
      if (f.onSince === null) f.onSince = Number(player.timePlayed) || 0;
      if (f.gate && !holds(f.gate)) { say(f, 'blocked:gate', { gate: f.gateSrc }); continue; }   // a table gate: the feature does nothing while its predicate is false
      var r = EXEC[f.kind](f);
      say(f, r.code, r.values);
      if (r.n) {
        stats.actions[f.id] = (stats.actions[f.id] || 0) + r.n;
        f.lastActedAt = Number(player.timePlayed) || 0;
        f.onSince = f.lastActedAt;
      }
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
  // A later layer (loader/tmt-planner.js) keeps memory outside `player` too — its once-reached marks, its stall clocks
  // and the epoch it committed. It registers a getter/setter pair here so ONE runtimeState() carries everything a
  // snapshot, an excursion and a resumed run must restore. Nothing registers by default, so a run without the planner
  // writes exactly the record it wrote before (every committed snapshot stays valid).
  var runtimeHooks = [];
  T.registerRuntime = function (name, get, set) {
    if (!name || typeof get !== 'function' || typeof set !== 'function') throw new Error('registerRuntime(name, get, set)');
    for (var i = 0; i < runtimeHooks.length; i++) if (runtimeHooks[i].name === name) { runtimeHooks[i] = { name: name, get: get, set: set }; return name; }
    runtimeHooks.push({ name: name, get: get, set: set });
    runtimeHooks.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
    return name;
  };
  T.runtimeState = function () {
    var o = { lastReset: Object.assign({}, lastReset), loopNo: loopNo, ranAt: Object.assign({}, ranAt), stats: JSON.parse(JSON.stringify(stats)) };
    if (Object.keys(enableOverride).length) o.enabled = Object.assign({}, enableOverride);
    // a policy set at RUNTIME (setPolicy — the harness's A/B lever, the planner's committed configuration) is memory
    // outside `player` like lastReset: without it an excursion's setPolicy would leak past the restore, and a resumed
    // 9-minute process would drop the configuration the planner committed. Only the DIFFS against registration are
    // recorded, so a run that never calls setPolicy writes exactly the record it wrote before.
    var pol = {}, np = 0;
    for (var pi = 0; pi < features.length; pi++) if (features[pi].policyRuntime !== null) { pol[features[pi].id] = features[pi].policyRuntime; np++; }
    if (np) o.policies = pol;
    // ---- V2: the stall modifier's and rate-peak's memory --------------------------------------------------------
    // ⛔ EACH BLOCK APPEARS ONLY WHEN IT HAS SOMETHING TO SAY. A run in which no feature carries a modifier and none
    // uses `rate-peak` writes EXACTLY the record it wrote before V2 — which is why every snapshot committed in this
    // repo stays valid and every pinned resume reproduces. The intervals are only recorded for a feature whose
    // policy carries the modifier (`pushInterval` is reached from nowhere else), so this is a property of the code
    // and not of a run's luck.
    var sm = {}, ns = 0;
    for (var si in stallMem) if (stallMem[si].length) { sm[si] = stallMem[si].slice(); ns++; }
    if (ns) o.stallIntervals = sm;
    var rb = {}, nr = 0;
    for (var ri in rateBest) { rb[ri] = String(rateBest[ri]); nr++; }
    if (nr) o.rateBest = rb;
    var rh = {}, nh = 0;
    for (var hi in rateHold) { rh[hi] = rateHold[hi]; nh++; }
    if (nh) o.rateHold = rh;
    var ss = {}, nss = 0;
    for (var qi in stallSince) { ss[qi] = stallSince[qi]; nss++; }
    if (nss) o.stallSince = ss;
    if (stallFired.loop >= 0) o.stallFired = { loop: stallFired.loop, layer: stallFired.layer };
    if (runtimeHooks.length) { o.extra = {}; for (var i = 0; i < runtimeHooks.length; i++) o.extra[runtimeHooks[i].name] = runtimeHooks[i].get(); }
    return o;
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
    for (k in enableOverride) delete enableOverride[k];
    for (k in rt.enabled || {}) enableOverride[k] = !!rt.enabled[k];
    for (var pj = 0; pj < features.length; pj++) features[pj].policyRuntime = null;
    for (k in rt.policies || {}) if (byId[k]) { if (!policyOk(byId[k].kind, rt.policies[k])) throw new Error('restoreRuntime: policy "' + rt.policies[k] + '" is not a ' + byId[k].kind + ' policy'); byId[k].policyRuntime = rt.policies[k]; }
    for (k in stallMem) delete stallMem[k];
    for (k in rt.stallIntervals || {}) stallMem[k] = rt.stallIntervals[k].slice();
    for (k in stallSince) delete stallSince[k];
    for (k in rt.stallSince || {}) stallSince[k] = Number(rt.stallSince[k]);
    for (k in rateBest) delete rateBest[k];
    for (k in rt.rateBest || {}) rateBest[k] = String(rt.rateBest[k]);
    for (k in rateHold) delete rateHold[k];
    for (k in rt.rateHold || {}) rateHold[k] = Number(rt.rateHold[k]);
    stallFired.loop = rt.stallFired ? Number(rt.stallFired.loop) : -1;
    stallFired.layer = rt.stallFired ? rt.stallFired.layer : null;
    for (var i = 0; i < runtimeHooks.length; i++) runtimeHooks[i].set((rt.extra || {})[runtimeHooks[i].name]);
    return true;
  };

  // ⛔ A POLICY IS VALID WHEN THE GRAMMAR *AND* THE DECLARED BOUNDS ACCEPT IT, and both come from the same table
  // row. The first cut checked only the grammar, and `rate-peak@2/0` sailed through: a value buffer of 2 puts the
  // threshold at `best × (1 − 2)`, a NEGATIVE rate, which no rate can ever be under — so the strategy would have
  // been selectable, spelled correctly, and silently incapable of ever firing. A bound a row declares and nothing
  // enforces is documentation, not a guard.
  function policyOk(kind, policy) {
    if (!POLICIES[kind] || !POLICIES[kind].test(policy)) return false;
    var P = parsePolicy(kind, policy);
    if (!P) return false;
    return boundsOk(kind, P.id, P.params) && (!P.modifier || boundsOk(kind, P.modifier.id, P.modifier.params));
  }
  function boundsOk(kind, id, params) {
    var S = byStrategyId(kind, id);
    if (!S) return false;
    for (var i = 0; i < S.params.length; i++) if (checkParam(S, S.params[i].name, params[S.params[i].name])) return false;
    return true;
  }
  T.policyOk = function (kind, policy) { return !!policyOk(kind, policy); };

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
      id: def.id, layer: def.layer, kind: def.kind, policy0: ov !== undefined ? ov : def.policy, policyRuntime: null, title: def.title || def.id,
      unlocked: typeof def.unlocked === 'function' ? def.unlocked : function () { return true; },
      default: false,
      policies: Array.isArray(def.policies) ? def.policies.slice() : [def.policy],
      policyTable: def.policyTable === undefined ? null : def.policyTable,
      policyDerived: def.policyDerived === undefined ? null : def.policyDerived,
      keepMilestone: def.keepMilestone || null,
      order: def.order ? def.order.map(Number) : null,
      after: Array.isArray(def.after) ? def.after.slice() : [],
      gateSrc: typeof def.gate === 'string' ? def.gate : null,
      gate: typeof def.gate === 'string' ? T.predicate(def.gate) : null,
      toggleList: def.toggleList || [],
      multiSkipped: def.multiSkipped || 0,
      clickList: (def.clickList || []).map(function (c) { return { id: Number(c.id), whenSrc: c.when, when: T.predicate(c.when) }; }),
      derived: !!def.derived,
      // V1's readout memory, all OUTSIDE `player` and outside runtimeState(): the last decision, when this feature
      // last became eligible with nothing done since, and when it last acted. Recomputed on the next tick, so a
      // resumed process simply starts describing again — the ACTION COUNTS it is read beside are in runtimeState().
      last: null, onSince: null, lastActedAt: null,
    };
    // ---- PRECEDENCE, IN ONE PLACE -------------------------------------------------------------------------------
    // derived default  <  the game's table  <  the PLAYER's saved choice  <  a runtime override.
    // `policy0` is the first two resolved at registration (plus `--auto-opt policy:<id>=`, which is how a harness
    // leg or a sweep pins a configuration for a whole run); `policyRuntime` is `setPolicy()` — the planner's
    // committed epoch and the A/B lever, memory OUTSIDE `player`; and between them sits `player.au.edits[id].policy`,
    // the one the PLAYER typed, which lives in the save.
    // ⛔ IT IS A GETTER, NOT A CACHED FIELD. Every reader in this file, in the harness and in the page asks for
    // `f.policy`; a cached copy would need invalidating from three different writers (a press, a load, a restore)
    // and the day one of them forgot, the tab would show one policy and the decision path would run another — which
    // is precisely the class of bug V1 exists to make impossible for REASONS.
    // ⚠ A PINNED HARNESS RUN IS UNMOVED BY CONSTRUCTION: its snapshots carry no `edits` entries, so the middle term
    // is empty and `f.policy` is what it has always been. That is a property of the DATA, and `gates-v2 --part 5`
    // is what says so out loud.
    Object.defineProperty(f, 'policy', { enumerable: true, get: function () { return policyOf(f); } });
    features.push(f);
    byId[f.id] = f;
    hookLayer(f.layer);
    buildClickables();
    return features.length;
  };
  // A feature's policy (runtime only, never saved) — the harness's A/B lever and the planner's committed epoch.
  // ⚠ It OUTRANKS the player's saved choice, and that is deliberate: a measurement that named a configuration must
  // measure that configuration whatever the save says. `setPolicy(id, null)` gives the feature back to the save.
  T.setPolicy = function (id, policy) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    if (policy === null || policy === undefined) { f.policyRuntime = null; return null; }
    if (!policyOk(f.kind, policy)) throw new Error('policy "' + policy + '" is not a ' + f.kind + ' policy');
    f.policyRuntime = policy;
    return policy;
  };

  // ---- the PLAYER's saved choice (V2) ---------------------------------------------------------------------------
  // ⛔ ONE NEW SAVE KEY, AND IT IS A NESTED OBJECT ON PURPOSE. `player.au.edits` is `{<featureId>: {policy}}`, and
  // the next editing slice's `until`, `priority` and `maxActions` join as further fields of the SAME per-feature
  // object — so this slice's ⚖-granted full-hash re-record is the only one the editing arc needs. A flat
  // `player.au.policies` beside a later `player.au.until` would have cost one re-record per field.
  // ⚠ IT IS SEEDED IN `startData`: Vue 2 cannot observe a property ADDED to an object after creation, and 22 of the
  // 171 engines assign plainly (U6, measured). `derive()` runs before `addLayer`, so the key exists from the first
  // boot; the per-feature entries below are written with `Vue.set`, which both creates the key and notifies.
  function editsOf() { try { return (player[AU] && player[AU].edits) || null; } catch (e) { return null; } }
  function savedPolicyOf(f) {
    var e = editsOf();
    var v = e && e[f.id] ? e[f.id].policy : undefined;
    if (typeof v !== 'string' || !v) return null;
    // a save written by a later version, or by hand, must not be able to run a policy this build cannot validate
    return policyOk(f.kind, v) ? v : null;
  }
  function policyOf(f) { return f.policyRuntime !== null ? f.policyRuntime : (savedPolicyOf(f) || f.policy0); }
  /** The parsed form of whatever is in force, cached against the string it was parsed from. */
  function parsedOf(f) {
    var s = policyOf(f);
    if (f.policyStr !== s) { f.policyStr = s; f.policyParsed = parsePolicy(f.kind, s); }
    return f.policyParsed;
  }
  function setIn(obj, key, value) { if (G.Vue && typeof G.Vue.set === 'function') G.Vue.set(obj, key, value); else obj[key] = value; }
  function delIn(obj, key) { if (G.Vue && typeof G.Vue.delete === 'function') G.Vue.delete(obj, key); else delete obj[key]; }
  /** Write the player's chosen policy for one feature. Returns `{ok, policy, error}`; a REFUSAL changes nothing. */
  T.setSavedPolicy = function (id, policy) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var e = editsOf();
    if (!e) return { ok: false, policy: policyOf(f), error: 'this save has no automation store yet (player.' + AU + '.edits)' };
    if (policy === null || policy === undefined) { delIn(e, id); player[AU].disclosed = true; return { ok: true, policy: policyOf(f), error: null }; }
    if (typeof policy !== 'string' || !policyOk(f.kind, policy)) return { ok: false, policy: policyOf(f), error: '"' + policy + '" is not a ' + f.kind + ' strategy this build knows' };
    setIn(e, id, { policy: policy });
    player[AU].disclosed = true;
    return { ok: true, policy: policyOf(f), error: null };
  };
  T.savedPolicy = function (id) { var f = byId[id]; if (!f) throw new Error('no feature "' + id + '"'); return savedPolicyOf(f); };
  /** Change ONE parameter of the strategy in force and save the result. `{ok, policy, error}`; a refusal keeps the
   *  previous value in force and SAYS why — a typed value the strategy cannot parse is never silently dropped. */
  T.setSavedParam = function (id, name, value, which) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var P = parsedOf(f);
    if (!P) return { ok: false, policy: policyOf(f), error: 'the policy in force cannot be parsed' };
    var onMod = which === 'modifier';
    if (onMod && !P.modifier) return { ok: false, policy: policyOf(f), error: 'this feature has no modifier to edit' };
    var S = byStrategyId(f.kind, onMod ? P.modifier.id : P.id);
    var why = null;
    try { why = checkParam(S, name, value); } catch (e) { return { ok: false, policy: policyOf(f), error: String(e.message || e) }; }
    if (why) return { ok: false, policy: policyOf(f), error: why };
    var next = { id: P.id, params: Object.assign({}, P.params), modifier: P.modifier ? { id: P.modifier.id, params: Object.assign({}, P.modifier.params) } : null };
    (onMod ? next.modifier.params : next.params)[name] = String(value).trim();
    return T.setSavedPolicy(id, formatPolicy(f.kind, next));
  };
  /** Turn the modifier on (at its defaults) or off, keeping the primary strategy and its parameters. */
  T.setSavedModifier = function (id, modId) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var P = parsedOf(f);
    if (!P) return { ok: false, policy: policyOf(f), error: 'the policy in force cannot be parsed' };
    if (modId && !byStrategyId(f.kind, modId)) return { ok: false, policy: policyOf(f), error: '"' + modId + '" is not a ' + f.kind + ' modifier' };
    return T.setSavedPolicy(id, formatPolicy(f.kind, { id: P.id, params: P.params, modifier: modId ? { id: modId, params: {} } : null }));
  };
  /** The picker's list for ONE feature: every strategy of its kind, whether it can run here, and why not. */
  T.strategyChoices = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var P = parsedOf(f);
    return strategiesOf(f.kind).map(function (S) {
      var a = availability(f, S);
      return { id: S.id, label: S.label, help: S.help, available: a.ok, why: a.why, inForce: !!(P && P.id === S.id), params: strategyJSON(S).params };
    });
  };

  // ---- T.explain() — the readout, headless first (V1) -----------------------------------------------------------------
  // ⛔ THE PAGE RENDERS THIS, it does not compute its own. One row per registered feature, in the same order the
  // tab draws them, plus one per feature the table EXCLUDED (which is never registered and would otherwise have no
  // way to say why it is missing). Every reason in the tab is therefore testable in Node with no browser, and the
  // `render ≡ headless` leg of gates-v1 is a comparison rather than two implementations hoping to agree.
  //
  // ⚠ `neverFired` is measured in GAME-SECONDS, not in loops — the brief said loops, and a loop count means
  // different things in a diff-0.05 census run and a diff-1 ladder leg, so the same flag would fire at 150 game-s
  // in one and 3000 in the other. The default 3000 game-seconds is justified against the rarest ACTING feature
  // this repo has measured: R1′'s `reset:sb` fired 13 times over a 24179 game-second leg (plan §14d), i.e. about
  // one action per 1860 game-seconds, so anything under that would flag a feature that is working. 3000 is ~1.6×
  // that gap. `?autoOpt=neverFiredSeconds=<n>` moves it.
  var NEVER_FIRED_SECONDS = 3000;
  function neverFiredLimit() {
    var v = T.autoOptions && T.autoOptions.neverFiredSeconds;
    var n = v === undefined ? NaN : Number(v);
    return isFinite(n) && n > 0 ? n : NEVER_FIRED_SECONDS;
  }
  // a `values` entry as JSON: a Decimal is not serialisable, and its own `toString` is the lossless form every
  // consumer of this API (the gate, --explain, the page) can read back.
  function jsonValue(v) {
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return v.map(jsonValue);
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
    return String(v);
  }
  function jsonValues(values) {
    if (!values) return null;
    var o = {};
    for (var k in values) o[k] = jsonValue(values[k]);
    return o;
  }
  function featureStateWord(f) {
    if (active(f)) return 'on';
    if (!featureUnlocked(f)) return isOnSaved(f) ? 'armed' : 'locked';
    return 'off';
  }
  T.explain = function () {
    var out = [], now = Number(player.timePlayed) || 0, limit = neverFiredLimit();
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      var acted = stats.actions[f.id] || 0;
      var pp = parsedOf(f);
      out.push({
        id: f.id, title: f.title, layer: f.layer, kind: f.kind,
        state: featureStateWord(f),
        // V2: `saved` is the PLAYER's own choice (null when they have not made one), and `strategy` / `params` are
        // what `inForce` parses to — so the tab renders the editors from `explain()` like everything else.
        policy: { inForce: f.policy, table: f.policyTable, derived: f.policyDerived, alternatives: f.policies.slice(1),
          saved: savedPolicyOf(f), runtime: f.policyRuntime, base: f.policy0,
          strategy: pp ? pp.id : null, params: pp ? Object.assign({}, pp.params) : null,
          modifier: pp && pp.modifier ? { id: pp.modifier.id, params: Object.assign({}, pp.modifier.params) } : null },
        stall: T.stallState(f.id),
        last: f.last ? { code: f.last.code, text: codeText(f.last.code, f.last.values), values: jsonValues(f.last.values), tick: f.last.tick, at: f.last.at } : null,
        acted: acted, lastActedAt: f.lastActedAt,
        // on + unlocked for long enough, and it has still never done anything. A configuration that CANNOT fire is
        // survey §4.6, and it is the one thing a list of reasons cannot say by itself: every individual reason is
        // reasonable, and the feature is dead anyway.
        neverFired: acted === 0 && f.onSince !== null && (now - f.onSince) >= limit,
        eligibleFor: f.onSince === null ? null : Math.round((now - f.onSince) * 10) / 10,
        gate: f.gateSrc, after: f.after.slice(),
        provenance: (T.autoProvenance && T.autoProvenance[f.id]) || null,
      });
    }
    for (var id in (T.autoExcluded || {})) {
      var c = id.indexOf(':');
      out.push({
        id: id, title: id, layer: id.slice(c + 1), kind: id.slice(0, c),
        state: 'excluded',
        policy: { inForce: null, table: null, derived: null, alternatives: [], saved: null, runtime: null, base: null, strategy: null, params: null, modifier: null },
        stall: null,
        last: { code: 'off:excluded', text: codeText('off:excluded', { reason: T.autoExcluded[id] }), values: { reason: T.autoExcluded[id] }, tick: T.ticks, at: now },
        acted: 0, lastActedAt: null, neverFired: false, eligibleFor: null,
        gate: null, after: [],
        provenance: (T.autoProvenance && T.autoProvenance[id]) || null,
      });
    }
    return out;
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
  var ARM_LABEL = 'Arm features that are not unlocked yet — an armed feature waits, and starts by itself at the unlock:';
  T.auTitle = 'Automation Tools';
  var clickables = { rows: 1, cols: 4 };

  function toggleSaved(f) {
    if (!player[AU].features) player[AU].features = {};
    player[AU].features[f.id] = !player[AU].features[f.id];
    player[AU].disclosed = true;
  }
  // Green = running; blue = unlocked and off; AMBER = armed while still locked (saved on, waiting for the unlock);
  // grey = locked. The amber is the only visible difference between "armed" and "off" on a locked button, and it can
  // only appear while the setting is on, because that is the only way the flag can have been set.
  function onColor(f) { return active(f) ? '#4f9a6a' : featureUnlocked(f) ? '#3d6f91' : isOnSaved(f) ? '#8a6d3b' : '#666666'; }

  // ---- the Advanced subtab (V1 Part 2) ---------------------------------------------------------------------------
  // ⛔ IT RENDERS `T.explain()` AND COMPUTES NOTHING OF ITS OWN. Every number, word and flag below comes from the
  // rows the headless API returns, which is why `render ≡ headless` (gates-v1 leg 5) is a comparison rather than
  // two implementations hoping to agree — and why every reason in this tab is testable in Node with no browser.
  //
  // ⛔ AND IT IS LAZY. ⚠ MEASURED, because the brief had the engines the wrong way round and the correction is what
  // says where this guard earns its keep:
  //   · **2.2.1 (ptr) DOES special-case `tabFormat`** — `updateTempData` (`js/technical/temp.js:96`) skips any key
  //     whose name contains `tabformat` / `display` / `description` **whenever `player.tab != layer`**;
  //   · **2.7 (something) skips `tabFormat` and `content` unconditionally** (`temp.js:127`) and lists both in
  //     `activeFunctions` (`:12`); they move only through `updateTabFormats()`.
  // So in NODE, where the `au` tab is never open, neither engine ever calls this — `explainStats().formats === 0`
  // after a headless run is true, and it is the ENGINES that guarantee it, not this line (measured: removing the
  // guard leaves `gates-v1 --part 3` green at formats 0).
  // ⛔ WHAT THIS LINE ACTUALLY PREVENTS is the case the engines do not cover: the `au` tab IS open and `Simple` is
  // what the player is looking at. ptr then walks the WHOLE tabFormat object every `updateTemp()` — BOTH subtabs —
  // so this function is called on every tick of a tab nobody is looking at. MEASURED over 200 ticks with a redraw
  // every 10 (gates-v1 --part 3p): **0** formats on Simple against **2721** with Advanced selected on ptr, and
  // **0** against **98** on something.
  //
  // ⚠ ENGINE COMPONENTS ONLY, and `loader/tmt-auto.js` still never touches the DOM (docs/contract.md). This builds
  // a STRING that the engines' own `display-text` renders; it queries no element and holds no reference to one.
  function advancedShown() {
    try { return (player.tab === AU || player.navTab === AU) && !!player.subtabs && !!player.subtabs[AU] && player.subtabs[AU].mainTabs === 'Advanced'; } catch (e) { return false; }
  }
  var ADV_INTRO = 'What each feature decided on the last tick it was asked, and why. Read-only.';
  // ⚠ ONE BLOCK PER FEATURE, NOT A WIDE TABLE — it has to read at 390 px with no horizontal scroll, and under
  // `?mobile=1` the layer list draws this tab through its own reader, which skips a `display-text` entirely. So the
  // layout is ordinary flow with `overflow-wrap`, no column widths and no element wider than its parent.
  function chip(text, bg) { return '<span style="display:inline-block;padding:0 6px;border-radius:3px;background:' + bg + ';color:#fff;font-size:.8em;vertical-align:middle">' + esc(text) + '</span>'; }
  var STATE_BG = { on: '#4f9a6a', off: '#3d6f91', armed: '#8a6d3b', locked: '#666666', excluded: '#5a4a4a' };
  function advancedHTML() {
    if (!advancedShown()) return '';
    var rows = T.explain();
    var out = ['<div style="text-align:left;max-width:100%;overflow-wrap:anywhere;word-break:break-word">'];
    var running = 0, never = 0;
    for (var i = 0; i < rows.length; i++) { if (rows[i].state === 'on') running++; if (rows[i].neverFired) never++; }
    out.push('<div style="opacity:.75;font-size:.9em;margin-bottom:6px;text-align:left">' + esc(ADV_INTRO) + '</div>');
    out.push('<div style="margin-bottom:10px;text-align:left">Profile <b>' + esc(T.profileName) + '</b> · ' + running + ' of ' + rows.length + ' running'
      + (never ? ' · <b style="color:#c08a3e">' + never + ' never fired</b>' : '') + '</div>');
    var layer = null;
    for (var j = 0; j < rows.length; j++) {
      var r = rows[j];
      if (r.layer !== layer) {
        layer = r.layer;
        var name = layers[layer] && layers[layer].name ? String(layers[layer].name) : layer;
        out.push('<h3 style="margin:14px 0 4px 0">' + esc(name) + ' <span style="opacity:.5;font-size:.7em">' + esc(layer) + '</span></h3>');
      }
      out.push(r.state === 'locked' || r.state === 'excluded' ? collapsedBlock(r) : featureBlock(r));
    }
    out.push('</div>');
    return out.join('');
  }
  // A feature that cannot run yet is ONE LINE. There are 78 of them on ptr at a fresh save and 3 that are doing
  // anything; a full block each would bury the three.
  function collapsedBlock(r) {
    return '<div style="opacity:.6;padding:2px 0;text-align:left">' + esc(r.title) + ' <span style="opacity:.6;font-size:.85em">' + esc(r.id) + '</span> — '
      + chip(r.state === 'excluded' ? 'EXCLUDED' : 'LOCKED', STATE_BG[r.state]) + ' <span style="font-size:.9em">' + esc(r.last ? r.last.text : '') + '</span></div>';
  }
  function featureBlock(r) {
    var p = r.policy, bits = [];
    // ⚠ the table's entry and the generic derivation's shown BESIDE what is in force, and only when they DIFFER —
    // survey §4.5. Equal values side by side is noise; a difference is the whole reason the table has that row.
    bits.push('<b>' + esc(p.inForce) + '</b>');
    if (p.table !== null && p.table !== p.inForce) bits.push('table says ' + esc(p.table));
    if (p.derived !== null && p.derived !== p.inForce) bits.push('derived would be ' + esc(p.derived));
    if (p.alternatives.length) bits.push('alt ' + p.alternatives.map(esc).join(', '));
    // ⚠ `text-align:left` ON EVERY DIV, not only on the wrappers, and INHERITANCE IS NOT ENOUGH — measured: the
    // block's own child divs compute `center` with no inline style of their own, so a game's stylesheet is
    // targeting them DIRECTLY and beating what they would have inherited. An inline declaration is what wins.
    // (Seen on the first screenshots: the headings read left and every fact inside a block read centred, which is
    // prose, not a list.)
    var o = ['<div style="border-left:3px solid ' + STATE_BG[r.state] + ';background:rgba(127,178,217,.08);border-radius:4px;padding:6px 8px;margin:0 0 8px 0;text-align:left">'];
    o.push('<div style="text-align:left">' + chip(r.state.toUpperCase(), STATE_BG[r.state]) + ' <b>' + esc(r.title) + '</b> <span style="opacity:.55;font-size:.85em">' + esc(r.id) + '</span></div>');
    o.push('<div style="text-align:left;font-size:.9em;opacity:.85">policy ' + bits.join(' · ') + '</div>');
    if (r.gate) o.push('<div style="text-align:left;font-size:.9em;opacity:.85">gate <code>' + esc(r.gate) + '</code></div>');
    if (r.after && r.after.length) o.push('<div style="text-align:left;font-size:.9em;opacity:.85">after ' + r.after.map(esc).join(', ') + '</div>');
    o.push('<div style="text-align:left;margin-top:3px"><b>now:</b> ' + esc(r.last ? r.last.text : 'nothing decided yet') + '</div>');
    o.push('<div style="text-align:left;font-size:.9em;opacity:.7">acted ' + r.acted + (r.lastActedAt === null ? '' : ' · last at ' + r.lastActedAt + ' s') + (r.eligibleFor === null ? '' : ' · on for ' + r.eligibleFor + ' s') + '</div>');
    if (r.neverFired) o.push('<div style="text-align:left;font-size:.9em;color:#c08a3e">⚠ never fired — on and unlocked this whole time, and it has never acted</div>');
    // ⚠ AUTHOR-WRITTEN TEXT THROUGH `v-html`. Escaped, like every other table string above (`off` reasons, gate
    // predicates) and like the GAME's own layer names and feature titles.
    if (r.provenance) o.push('<div style="text-align:left;font-size:.85em;opacity:.65;font-style:italic;margin-top:3px">' + esc(r.provenance) + '</div>');
    o.push('</div>');
    return o.join('');
  }
  T.advancedHTML = advancedHTML;

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
      // ⚖ DECIDED (U4): with the setting ON, *All features* arms the locked ones too. An "All" that quietly meant
      // "all the unlocked ones" would leave the player pressing every locked button by hand to reach the state the
      // master toggle exists to reach in one press, and the two toggles reading DIFFERENT predicates is exactly the
      // kind of split a later reader has to re-derive. With the setting OFF both refuse, as they do today.
      onClick: function () {
        var anyOff = false;
        for (var i = 0; i < features.length; i++) if (!isOnSaved(features[i]) && armable(features[i])) anyOff = true;
        if (!player[AU].features) player[AU].features = {};
        for (var j = 0; j < features.length; j++) player[AU].features[features[j].id] = anyOff && armable(features[j]);
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
            // A locked feature reads `Locked` exactly as it did before the setting existed; with the setting on it
            // says which of the two locked states it is in, because `Armed` is what the press just bought.
            if (!featureUnlocked(f)) return !armLocked() ? 'Locked' : (isOnSaved(f) ? 'Armed' : 'Off') + '<br>locked';
            return (active(f) ? 'On' : 'Off') + (T.profileName !== 'saved' ? ' (profile ' + T.profileName + ')' : '') + '<br>' + f.policy;
          },
          unlocked: true,
          canClick: function () { return armable(f); },
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
  var TABLE_KEYS = ['id', 'unlockOrder', 'policies', 'alternatives', 'order', 'gates', 'off', 'keep', 'clickables', 'options', 'kindOrder', 'provenance'];
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
    ['policies', 'alternatives', 'order', 'gates', 'off', 'keep', 'provenance'].forEach(function (k) {
      if (table[k] === undefined) return;
      if (typeof table[k] !== 'object' || Array.isArray(table[k])) throw new Error(src + ': ' + k + ' must be an object keyed by feature id');
      for (var id in table[k]) known(k, id);
    });
    // `provenance` (V1): ONE line per feature saying WHERE its entry in this table came from — the SUMMARY row or
    // the plan § that measured it. ⚖ minimize hardcoding already required that as a source comment; this makes it
    // DATA, so the au tab's Advanced view can show the player why a default is what it is instead of leaving it in
    // a file nobody reading the game will open. Unknown feature ids throw, exactly as `off` does — and an id the
    // table EXCLUDES is still a derived candidate, so an exclusion may carry its provenance too.
    for (var pk in (table.provenance || {})) if (typeof table.provenance[pk] !== 'string' || !table.provenance[pk]) throw new Error(src + ': provenance.' + pk + ' needs a non-empty one-line string');
    T.autoProvenance = Object.assign({}, table.provenance || {});
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
    var off = Object.assign({}, table.off || {});
    // `include=<feature id>,…` (--auto-opt / ?autoOpt=): drop those ids from the table's `off` map, so an EXCLUSION can be
    // put under measurement without editing the table. ⚖ an exclusion carries a reason, and a reason is a claim about the
    // game — R1′ re-evaluated `buyables:t` ("Extra Time Capsules are paid in Boosters") this way. Loud both ways: an id
    // the derivation does not produce, or one the table does not exclude, throws rather than doing nothing.
    var inc = listOpt('include', null);
    if (inc) inc.forEach(function (id) {
      known('include', id);
      if (off[id] === undefined) throw new Error(src + ': option include names "' + id + '", which the table does not exclude');
      delete off[id];
    });
    // `exclude=<feature id>,…` — the inverse: do not register those, as if the table had excluded them. What a CONTROL
    // needs (a row measured before the table lifted an exclusion cannot be reproduced without it), and what a sweep
    // needs to turn one feature off without inventing an `off` policy for every kind. Loud the same way: an id the
    // derivation does not produce throws, and so does one the table ALREADY excludes (that is an `include=` question).
    var exc = listOpt('exclude', null);
    if (exc) exc.forEach(function (id) {
      known('exclude', id);
      if (off[id] !== undefined) throw new Error(src + ': option exclude names "' + id + '", which the table already excludes');
      off[id] = 'excluded by --auto-opt / ?autoOpt= exclude=' + id;
    });
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
      // `order:<featureId>=11,12,23` (--auto-opt / ?autoOpt=) overrides the table's order[] for one feature, the way
      // `policy:<featureId>=` overrides its policy — so an ORDER can be swept with controls before it is written into a
      // table (⚖ every order in a table carries provenance, and a sweep is where provenance comes from). Ids are numbers.
      var order = table.order && table.order[id];
      var ordOv = T.options && T.options['order:' + id];
      if (ordOv !== undefined) {
        order = String(ordOv).split(',').filter(Boolean).map(Number);
        if (order.some(function (n) { return !isFinite(n); })) throw new Error(src + ': option order:' + id + ' must be a comma-separated list of numeric ids');
        if (!order.length) order = undefined;
      }
      // BOTH answers are kept, not just the winner: the Advanced view shows the table's entry and the generic
      // derivation's beside what is in force, which is survey §4.5 ("default and current effective value side by
      // side") and the one readout that makes a table entry's cost visible at all.
      var policyDerived = defaultPolicy(c.kind, l, !!order, !!clk[l]);
      var policyTable = table.policies && table.policies[id];
      var policy = policyTable === undefined ? policyDerived : policyTable;
      var def = {
        id: id, layer: l, kind: c.kind, policy: policy, default: false, derived: true,
        policyTable: policyTable === undefined ? null : policyTable, policyDerived: policyDerived,
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
      // `type: 'none'` because `au` is never reset — and because leaving it undefined is not safe across engines.
      // The engine's canReset(layer) ends in `else return layers[layer].canReset()`, so a layer whose type matches
      // none of normal/static/none reaches a method `au` does not have. Measured on Cubedey-style 'The Stardust
      // Tree', where the whole automation boot died on `layers[layer].canReset is not a function` while the plain
      // page was green. 'none' is the declaration the engine already understands for "cannot reset".
      type: 'none',
      // ⚖ `armLocked` IS SEEDED (user, 2026-09-19, plan §15d.2: "Yes, seed it"). U4 kept it out of `startData` so
      // that a setting nobody had touched moved no recorded hash, and U6 measured what that cost: the engine's own
      // `toggle` click is hardcoded to `toggleAuto`, Vue 2 cannot observe a key ADDED after creation, and 22 of the
      // 171 engines assign plainly — so the flag flipped and the button went on reading OFF. With the key present
      // from the first boot there is nothing to observe late and the plain assignment is seen. It moves the FULL
      // hash once; the S1 pins compare `hashGame`, which does not contain `player.au` at all.
      // ⚖ `edits` IS SEEDED TOO (V2, user 2026-09-19: choices live in the save, ONE more full-hash re-record granted).
      // Same reason as `armLocked` above and one step further: Vue 2 cannot observe a key ADDED after creation, and
      // the editors bind to `player.au.edits[<id>].policy`. With the key present from the first boot the per-feature
      // entries can be written with `Vue.set` and are seen on all 171 engines. It is ONE key and a NESTED object, so
      // the next editing slice's `until` / `priority` / `maxActions` join as fields of the same per-feature entry and
      // cost no further re-record. Empty on every boot: nothing is chosen until a player chooses it.
      startData: function () { return { unlocked: true, points: num(0), features: {}, disclosed: false, armLocked: false, edits: {} }; },
      color: '#7fb2d9',
      row: 'side',
      symbol: 'AU',
      tooltip: T.auTitle,
      layerShown: function () { return true; },
      clickables: clickables,
      // ⛔ THE OBJECT FORM = SUBTABS (V1, ⚖ user 2026-09-19 §15d.3). `Simple` is FIRST, so it is what both engines
      // select by default (`getStartPlayer`: `Object.keys(layers[l].tabFormat)[0]`) and what an old save is
      // repaired to (`fixSave`). Its content is TODAY'S TAB, unchanged — the title, the profile line, the
      // disclosure, the arming row and `'clickables'`, in that order — so every standing artifact other gates read
      // (`T.auTitle`, the clickable grid's ids, U1's mobile flatten) is where it was. A third subtab (the advanced
      // planner's round log, P2) joins by being a third key; neither of these two has to move for it.
      // ⚠ NOTHING SITS ABOVE THE SUBTAB BUTTONS: the engine draws them itself, above whatever the selected subtab
      // says, and anything the loader put there would push the clickable grid down without being part of either
      // subtab's content.
      tabFormat: {
      Simple: { content: [
        ['display-text', function () { return '<h2>' + T.auTitle + '</h2>'; }],
        'blank',
        ['display-text', function () {
          var on = 0;
          for (var i = 0; i < features.length; i++) if (active(features[i])) on++;
          return 'Profile: <b>' + T.profileName + '</b> — ' + on + ' of ' + features.length + ' registered features running';
        }],
        ['display-text', function () { return player[AU] && player[AU].disclosed ? DISCLOSURE : ''; }],
        // THE SETTING, and it is a `toggle`, not a clickable (⚖ user, 2026-09-19). That distinction is the whole
        // reason it is here: `buildClickables` lays the feature buttons out in a fixed grid whose `rows` / `cols`
        // it computes from `features.length + 1`, and U1's mobile CSS flattens THOSE boxes with `display: contents`
        // — a 12th clickable would have shifted every button's id by one and joined the flatten. A tabFormat member
        // sits outside both: the grid arithmetic is untouched and the flatten never sees it.
        // `row` + `toggle` + `display-text` are the ENGINE's own components, and all three are registered by all
        // 171 games (measured, quote-agnostically, over `Vue.component("…")` in games/). `toggle`'s click runs the
        // engine's own `toggleAuto([layer, field])`, which is how the field gets written without this file touching
        // the DOM — it never has, and the contract says so.
        ['row', [['display-text', function () { return ARM_LABEL; }], ['toggle', [AU, 'armLocked']]]],
        'blank',
        'clickables',
      ] },
      Advanced: { content: [['display-text', function () { return advancedHTML(); }]] },
      },
      automate: auAutomate,
    });
    T.auLayer = AU;
  }

  // Test probe (Part-1 gate): hook every tree layer with no features, so the wrapper-call counter covers every layer.
  if (T.options && T.options.hookAll) for (var hl in layers) if (hl !== AU && layers[hl] && !isNaN(layers[hl].row)) hookLayer(hl);
})();
