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

  // ⚠ ONE HOOK SLOT, SET BY THE AUTOMATION SECTION BELOW (V3): the progress tracker arms before the first `gameLoop`
  // and polls after each one, which is exactly where the harness's own monitor calls `check()`. It stays `null` in
  // contract-only mode, where this file returns long before the tracker exists.
  var onTick = null;
  // One tick = exactly the census/probe loop. `n` repeats it (one page.evaluate for a whole run).
  T.tick = function (diff, n) {
    diff = Number(diff);
    if (!(diff >= 0)) throw new Error('tick(diff): diff must be a number >= 0');
    n = n === undefined ? 1 : Number(n);
    var hasFix = typeof fixNaNs === 'function';
    if (onTick) onTick('before');
    for (var i = 0; i < n; i++) {
      updateTemp();
      gameLoop(diff);
      if (hasFix) fixNaNs();
      T.ticks++;
      T.gameSeconds = Math.round((T.gameSeconds + diff) * 1e9) / 1e9;
      if (onTick) onTick('after');
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
    // ⚠ `escalate: false` (V3): a strategy whose whole content is "do nothing" is never an automatic escalation
    // RUNG — answering a stall by stopping is not an answer. It is a fact this ROW declares, so the watch's derived
    // list needs no knowledge of which rows they are (⚖ minimize hardcoding). A player may still pick it by hand.
    { kind: 'challenges', template: 'off', label: 'Off', help: 'Do nothing with this layer’s challenges.', escalate: false },
    { kind: 'clickables', template: 'when', label: 'When the table says', help: 'Click each clickable this game’s table lists, whenever its condition holds.',
      needs: function (f) { return f.clickList && f.clickList.length ? null : 'this game’s table lists no clickables for this feature'; } },
    { kind: 'clickables', template: 'off', label: 'Off', help: 'Do nothing with this layer’s clickables.', escalate: false },
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
      layerTypes: S.layerTypes ? S.layerTypes.slice() : null, why: S.why || null, escalate: S.escalate !== false,
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
  // ⚠ `g.kind`, NOT the literal `'reset'` (V3): the stall WATCH reuses this arbiter for features of every kind, and
  // a hardcoded kind would have looked up a `reset` row for an `upgrades` feature. A kind whose strategies declare no
  // `progress` has no fraction and ranks last, which is the same answer `unlocks-purchase` already gets.
  function progressOf(g, P, d) {
    var t = tmp[g.layer] || {};
    if (g.kind === 'reset' && t.type === 'static') return ratio(t.baseAmount, t.nextAt);
    var S = P ? byStrategyId(g.kind, P.id) : null;
    return S && S.progress ? S.progress(g, d && d.values) : null;
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

  // ---- THE PROGRESS TRACKER (V3 Part 1) — ONE definition of "the game made progress" -------------------------------
  // ⛔ THE HARNESS HAD THIS FIRST AND NOW READS THE CORE'S. `tools/harness/policy.mjs`'s `MONITOR_SRC` carries the L1
  // stall detector's `--stall-seen` rule: progress is something NEW EVER HELD in this run — a layer unlocked, an
  // upgrade, a milestone, an achievement, a challenge completion, or a buyable above its own run maximum. Re-buying
  // what a reset took away is NOT progress, which is the whole reason the rule is a SEEN-SET and not a signature.
  // It needs no ladder file, so it works on all 171 games; 2 of them have a ladder.
  // ⚠ TWO SPELLINGS OF ONE INTENTION DRIFT — `hashGame` became `tmtLoader.gameState` for exactly this reason (V1
  // §16.3 item 3). The rule now lives HERE, `T.progressKeys()` publishes the id alphabet, and the harness's monitor
  // is held to it by `gates-v3 --part 1`. ⚠ The monitor's own text is NOT replaced: it must keep reproducing every
  // committed `stall.lastProgress` pin (`gates-p1a --part 0`'s 10531 among them), and a resumed run restores the
  // monitor's memory from a snapshot written by an older build. So there are two IMPLEMENTATIONS of one rule with a
  // gate that compares them event for event, which is the honest form of "the harness reads the core's" when the
  // harness's copy is load-bearing for pins this slice may not move (V3 §21, and the ⚖ re-record is the user's).
  //
  // ⛔ OFF BY DEFAULT, AND IT LEAVES NO TRACE WHEN OFF. The tracker's memory lives in `runtimeState()` and the block
  // appears ONLY while the tracker is armed, so a run that never uses it writes byte-for-byte the record it wrote
  // before V3 — every committed snapshot stays valid, and CI's anchors are the proof (`gates-v3 --part 2`).
  //
  // ⛔ THE PER-TICK WORK IS INCREMENTAL, AND A COUNTER IS WHAT SAYS SO (V1's rule for `formats`, in a new place).
  // A full walk of every held id happens exactly ONCE, when the tracker arms. After that a tick reads three ARRAY
  // LENGTHS per layer and walks only the TAIL of a list that grew, plus the (small) challenge and buyable maps. So
  // `progressStats().fullScans` is **1** after a run of any length, and `tails` is bounded by the number of events —
  // not by the tick count. ⚠ A hold array that SHRANK (a reset wiped it) re-points the length and re-walks the tail
  // when it grows back; every id in it is already in the seen-set, so nothing is counted twice. That is the seen-set
  // rule, not an optimisation: it is what makes a reset-and-rebuy loop stall rather than read as progress.
  // ⚠ AND THE CLAIM THE COUNTERS MAKE IS NOT "tails are bounded by the events" — MEASURED, and it is false: PTR's
  // `reset:p` fires 8 times in 200 ticks, each one WIPES `player.p.upgrades`, and the re-buy grows the list again, so
  // a tail is walked per regrowth. The honest claim is the one `tailItems` states: the per-tick element work is
  // bounded by what THE GAME CHANGED that tick, never by what it holds — 174 items over 400 polls on that leg, with
  // `fullScans` at 1. A mutant that re-walks the save per tick reds `fullScans`; one that drops the length check
  // multiplies `tailItems` by the size of the save.
  var PROG_KINDS = [['upgrades', 'upg'], ['milestones', 'ms'], ['achievements', 'ach']];
  // ⚠ THE EVENT LIST IS BOUNDED AND THE COUNTS ARE EXACT. A late PTR run holds thousands of things; the view wants
  // the newest ones. So the list keeps the newest `EVENT_CAP` events and `total` / `dropped` / `byKind` are counted
  // over ALL of them — a bound that silently changed a count would make the readout a lie. `?autoOpt=progressEvents=<n>`
  // moves it (the same lever `neverFiredSeconds` uses).
  var EVENT_CAP = 200;
  function eventCap() { var v = T.autoOptions && T.autoOptions.progressEvents, n = v === undefined ? NaN : Number(v); return isFinite(n) && n > 0 ? Math.floor(n) : EVENT_CAP; }
  // ⚠ `GAP_N` IS THE WATCH'S `n` — the tracker keeps at most that many usable gaps, so the two cannot disagree about
  // which gaps the median is over. The tracker itself never decides anything; `stalled` is reported, not acted on.
  var polledLoop = -1;
  var prog = null;   // null until armed; then {seen, bmax, lens, events, total, byKind, dropped, gaps, gapDirty, lastAt, firstAt, marks}
  var progStats = { fullScans: 0, polls: 0, tails: 0, tailItems: 0, markChecks: 0 };
  T.progressStats = function () { return { fullScans: progStats.fullScans, polls: progStats.polls, tails: progStats.tails, tailItems: progStats.tailItems, markChecks: progStats.markChecks, armed: prog !== null }; };
  /** The id alphabet, as DATA — what a key of the seen-set looks like, for the gate that compares the two copies. */
  T.progressKeys = function () { return { unlocked: '<layer>:u', upgrade: '<layer>:upg:<id>', milestone: '<layer>:ms:<id>', achievement: '<layer>:ach:<id>', challenge: '<layer>:ch:<id>:<completions>', buyable: '<layer>:<id> above its run maximum' }; };

  function progressTracked() {
    // `?autoOpt=track=1` / `--auto-opt track=1` is the harness's and a gate's lever, and it OUTRANKS the save the way
    // every other autoOpt does. The watch needs the tracker, so turning the watch on arms it.
    var o = T.autoOptions || {};
    if (watchArmed()) return true;
    if (o.track !== undefined) return truthy(o.track);
    var w = watchSettings();
    return w.track === true;
  }
  function truthy(v) { return !(v === false || v === 'false' || v === '0' || v === 0 || v === '' || v === undefined || v === null); }
  /** Arm the tracker: ONE full walk of everything already held, which is the run's starting point, not progress. */
  function armProgress() {
    var now = Number(player.timePlayed) || 0;
    prog = { seen: {}, bmax: {}, lens: {}, events: [], total: 0, byKind: {}, dropped: 0, gaps: [], skippedGaps: [], skipped: 0, gapDirty: true, lastAt: now, firstAt: now, marks: {} };
    progStats.fullScans++;
    scanProgress(true);
    // ⛔ THE SEED IS NOT PROGRESS and the FIRST GAP DOES NOT COUNT. `gapDirty` starts true, so the stretch from the
    // arming point to the first event never feeds `typicalGap` — the run was already however far along it was, and a
    // resumed run would otherwise measure a gap the uninterrupted run never had (⚠ the brief's rule, and §18.4 item 2's
    // reason for it). A restore that CARRIES the tracker's memory carries `gapDirty` too, so a resume is faithful.
    // ⚠ `gapDirty` IS RE-SET **AFTER** THE SCAN, not before it. MEASURED by this file's own leg 3: the arming walk
    // goes through `addSeen` → `pushEvent` for every id already held, and `pushEvent`'s last act is
    // `gapDirty = anyEscalated()` — which is false at arming time. So seeding a save that holds anything at all
    // CLEARED the flag, and the first gap (41 game-seconds in the leg) fed the median. Everything the seed wrote is
    // discarded here, the flag included.
    prog.total = 0; prog.events.length = 0; prog.dropped = 0; prog.byKind = {}; prog.gaps.length = 0; prog.skippedGaps.length = 0; prog.skipped = 0; prog.gapDirty = true;
  }
  T.progressArm = function () { if (prog === null) armProgress(); return prog !== null; };
  /** One incremental pass. Cheap by construction: three lengths per layer plus the two small numeric maps. */
  function pollProgress() { if (prog === null) return false; progStats.polls++; return scanProgress(false); }
  // ⛔ THE POLL POINT, TWICE, AND BOTH ARE LOAD-BEARING.
  //   · `runLayer` polls once per `gameLoop`, BEFORE the first feature of that loop decides — which is what lets the
  //     watch act on this tick's stall rather than the last one's;
  //   · `T.tick` polls again AFTER `gameLoop`, which is exactly where the harness's monitor calls `check()`. Without
  //     it the core would be one tick behind the monitor for anything the engine grants after the `au` slot, and
  //     `gates-v3 --part 1` asserts the two are EQUAL event for event, not equal within a tick.
  // The scan is idempotent (it is a comparison against the seen-set), so polling twice adds no event twice; it costs
  // two incremental passes per tick, and `progressStats().polls` is what says so out loud.
  function progressTickHook(when) {
    if (!progressTracked()) { if (prog !== null) { prog = null; clearWatch(); } return; }
    if (prog === null) armProgress();            // ⚠ BEFORE the first gameLoop: the same state the monitor seeds from
    else if (when === 'after') pollProgress();
  }
  /** The light form the hot path reads — `T.progress()` copies the whole event list and is a READOUT, not a sensor. */
  function progressNow() {
    if (prog === null) return { stalled: false, typicalGap: null, threshold: null, sinceLast: null, total: 0 };
    var now = Number(player.timePlayed) || 0, typ = typicalGap(), k = Number(watchParam('k'));
    return { stalled: typ !== null && (now - prog.lastAt) >= k * typ, typicalGap: typ === null ? null : typ,
      threshold: typ === null ? null : k * typ, sinceLast: now - prog.lastAt, total: prog.total };
  }

  /** The scan. `full` walks every held id (arming only); otherwise only what the lengths say changed. */
  function scanProgress(full) {
    var grew = false, l, P, i, k, n;
    for (l in layers) {
      var L = layers[l];
      if (!L || L.tmtLoaderLayer) continue;
      P = player[l];
      if (!P) continue;
      var st = prog.lens[l] || (prog.lens[l] = { u: 0, upg: 0, ms: 0, ach: 0 });
      if (P.unlocked) { if (!st.u) { st.u = 1; if (addSeen(l + ':u', 'unlocked', l, null)) grew = true; } } else st.u = 0;
      for (i = 0; i < PROG_KINDS.length; i++) {
        var arr = P[PROG_KINDS[i][0]], kind = PROG_KINDS[i][1];
        if (!arr || typeof arr.length !== 'number') continue;
        n = arr.length;
        var from = full ? 0 : st[kind];
        if (n > st[kind] || full) {
          progStats.tails++;
          progStats.tailItems += n - from;
          for (k = from; k < n; k++) if (addSeen(l + ':' + kind + ':' + arr[k], kind, l, arr[k])) grew = true;
        }
        st[kind] = n;
      }
      // ⚠ THE CHALLENGE AND BUYABLE MAPS ARE WALKED EVERY POLL, and that is not a full scan of the save: they are
      // per-layer numeric maps with a handful of keys (ptr's largest is 6), there is no length to compare them by,
      // and a buyable's own maximum is the one piece of state the rule keeps of its own.
      for (k in (P.challenges || {})) if (Number(P.challenges[k]) > 0) { if (addSeen(l + ':ch:' + k + ':' + P.challenges[k], 'ch', l, k)) grew = true; }
      for (k in (P.buyables || {})) {
        // ⚠ `Number(<the game's big-number type>)` — EXACTLY what the harness's monitor does, because the two are
        // compared event for event. A Decimal coerces through its own `toString`; a value past 1e308 reads Infinity,
        // and Infinity > Infinity is false, so a buyable that huge simply stops being progress. The monitor has that
        // property today and the core must have the SAME one, not a better one.
        var bk = l + ':' + k, v = Number(P.buyables[k]);
        // ⚠ A BUYABLE IS NOT IN THE SEEN-SET — its own running maximum IS its memory, which is the split the monitor
        // makes too (`bmax` beside `seen`). Keeping `<l>:<id>@<amount>` in the set instead would grow one key per
        // level ever reached (PTR's boosters pass 50) and would make `progressMonitorState().seen` incomparable with
        // the monitor's. So the maximum moves and the event is pushed directly.
        if (v > (prog.bmax[bk] === undefined ? 0 : prog.bmax[bk])) { prog.bmax[bk] = v; pushEvent('buy', l, k, bk + '@' + v); grew = true; }
      }
    }
    return grew;
  }
  // ⚠ A BUYABLE'S EVENT ID CARRIES ITS AMOUNT (`<l>:<id>@<n>`) so the timeline can show "Boosters reached 52" more
  // than once, while the SEEN-SET question is answered by `bmax` — the same split the monitor makes (`bmax` outside
  // `seen`). Everything else is identified by the id alone, because holding it twice is not a thing.
  function addSeen(key, kind, l, id) {
    if (prog.seen[key]) return false;
    prog.seen[key] = 1;
    pushEvent(kind, l, id, key);
    return true;
  }
  function pushEvent(kind, l, id, key) {
    var now = Number(player.timePlayed) || 0;
    // the GAP that just ended. ⛔ A gap that ended while the watch had ANY feature escalated does not feed
    // `typicalGap` — a rescue's duration is not evidence of what normal looks like (the same guard `stall>=Kx/N`
    // already has), and neither does the first gap after arming or a load.
    // ⛔⛔ AN UNUSABLE GAP IS NOT STORED AT ALL, AND THE FIRST CUT STORED IT AND FILTERED IT — WHICH SILENCED THE
    // WATCH FOR GOOD. MEASURED by `tools/harness/shots-v3.mjs` on the page: after one rescue and its cool-off, the
    // five-gap window held five gaps every one of which was flagged as rescue time, `typicalGap` read NULL, and
    // `stalled` could never be true again — the watch had gone permanently deaf on a game it had just rescued. The
    // bug is that a dirty gap EVICTS clean evidence: the window is supposed to be "the last n gaps that are usable
    // evidence", so the unusable ones never enter it. They are COUNTED, and their durations kept in a second bounded
    // list, because "we spent 100 and 120 game-seconds rescuing" is worth reading and is what makes the guard's own
    // leg non-vacuous (a leg that cannot see the number the mutant would produce cannot fail on it).
    var dt = now - prog.lastAt;
    if (dt > 0) {
      var g = { dt: Math.round(dt * 1e6) / 1e6 };
      if (prog.gapDirty) {
        prog.skipped++;
        prog.skippedGaps.push(g.dt);
        while (prog.skippedGaps.length > gapWindow()) prog.skippedGaps.shift();
      } else {
        prog.gaps.push(g);
        while (prog.gaps.length > gapWindow()) prog.gaps.shift();
      }
    }
    prog.lastAt = now;
    prog.gapDirty = anyEscalated();
    prog.total++;
    prog.byKind[kind] = (prog.byKind[kind] || 0) + 1;
    var ev = { at: Math.round(now * 1e6) / 1e6, kind: kind, layer: l, id: id === null || id === undefined ? null : String(id), key: key, tick: T.ticks, marks: ladderMarksNow() };
    prog.events.push(ev);
    if (prog.events.length > eventCap()) { prog.events.shift(); prog.dropped++; }
  }
  /** How many gaps the median is over — the watch's own `n`, so the two cannot disagree. */
  function gapWindow() { var n = Math.round(Number(watchParam('n'))); return isFinite(n) && n >= 1 ? n : 5; }
  /** The median of the last `n` gaps that are usable evidence, or null when there are none yet. */
  function typicalGap() {
    if (prog === null || !prog.gaps.length) return null;
    var xs = [];
    for (var i = 0; i < prog.gaps.length; i++) xs.push(prog.gaps[i].dt);
    return median(xs);
  }
  // ---- the LADDER's mark names as labels (2 of 171 games have one) --------------------------------------------------
  // ⚠ THE VIEW IS COMPLETE WITHOUT A LADDER, and 169 of the 171 games have none. `tmtLoader.ladder` is set by the HOST
  // (loader/page.js fetches `tools/harness/ladder/<id>.json` and ignores a 404; the harness passes its own `--ladder`
  // file) — this file never fetches anything, exactly as it never touches the DOM. A mark is `{id, name, predicate}`
  // and its predicate is compiled by `T.predicate`, the same mini-language a table gate and a ladder mark already
  // share. ⛔ EVALUATED ONLY WHEN AN EVENT FIRES, never per tick: a mark is a state predicate, an event is when the
  // state changed, and `progressStats().markChecks` is what says the cost is per EVENT.
  // ⚠ THE HOST IS ASKED ONCE, LAZILY, AND ONLY BY SOMETHING THAT WANTS THE LABELS. `loader/page.js` supplies
  // `T.fetchLadder` (which reads an INDEX first, so a game without a ladder costs no 404 — CI judged the first cut's
  // 404 on 169 games); the Node harness sets `T.ladder` outright from `--ladder-labels`. This file fetches nothing.
  var ladderAsked = false;
  function requestLadder() {
    if (ladderAsked || T.ladder !== undefined) return;
    ladderAsked = true;
    try { if (typeof T.fetchLadder === 'function') T.fetchLadder(); } catch (e) { /* the host has none */ }
  }
  T.requestLadder = requestLadder;
  function ladderMarks() {
    var L = T.ladder;
    if (L === undefined) { requestLadder(); return null; }
    return L && L.marks && typeof L.marks.length === 'number' ? L.marks : null;
  }
  function ladderMarksNow() {
    var ms = ladderMarks();
    if (!ms) return null;
    var out = null;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (!m || !m.id || typeof m.predicate !== 'string') continue;
      if (prog.marks[m.id]) continue;
      progStats.markChecks++;
      var fn;
      try { fn = T.predicate(m.predicate); } catch (e) { continue; }
      if (!holds(fn)) continue;
      prog.marks[m.id] = Math.round((Number(player.timePlayed) || 0) * 1e6) / 1e6;
      (out || (out = [])).push(m.name ? m.id + ' — ' + m.name : m.id);
    }
    return out;
  }
  /** THE READOUT. Newest first, with the counts exact whatever the bound dropped. */
  T.progress = function () {
    if (prog === null) return { armed: false, events: [], total: 0, dropped: 0, byKind: {}, lastAt: null, sinceLast: null, typicalGap: null, gaps: [], skipped: 0, skippedGaps: [], stalled: false, threshold: null, cap: eventCap(), marks: {} };
    var now = Number(player.timePlayed) || 0, typ = typicalGap(), k = Number(watchParam('k'));
    var ev = prog.events.slice().reverse();
    return { armed: true, events: ev, total: prog.total, dropped: prog.dropped, byKind: Object.assign({}, prog.byKind),
      lastAt: r1(prog.lastAt), firstAt: r1(prog.firstAt), sinceLast: r1(now - prog.lastAt),
      typicalGap: typ === null ? null : r1(typ), gaps: prog.gaps.map(function (g) { return r1(g.dt); }),
      skipped: prog.skipped, skippedGaps: prog.skippedGaps.map(r1),
      stalled: typ !== null && (now - prog.lastAt) >= k * typ, threshold: typ === null ? null : r1(k * typ),
      cap: eventCap(), marks: Object.assign({}, prog.marks), keys: Object.keys(prog.seen).length };
  };
  /** What the harness's monitor calls its own state, in the monitor's shape, so a gate can compare them directly. */
  T.progressMonitorState = function () {
    if (prog === null) return null;
    return { seen: Object.keys(prog.seen).sort(), bmax: Object.assign({}, prog.bmax), lastGs: prog.lastAt };
  };

  // ---- THE STALL WATCH (V3 Part 2) — the GAME stops progressing, so a waiting feature changes what it decides BY ----
  // ⚖ THE USER'S RULE, VERBATIM (2026-09-19): *"Another idea is to have an option to keep track of when progress seems
  // to be stalled, and switch to a strategy that's less likely to get stuck."* — accepted as an OPTION, OFF BY DEFAULT.
  //
  // ⛔ "LESS LIKELY TO GET STUCK" IS NOT A PROPERTY A STRATEGY HAS UNIVERSALLY, AND THAT IS MEASURED, not argued:
  // `always` is the arm that never waits on PTR's `q` (M22 at 30958) and the arm that WALLS row 1 on `p` (it resets at
  // 10 points, so points never reach the 200 that b and g need — A1-3); `gain>=2x` is the exact reverse (it wins row 1
  // and row 2's `e`, and stalls `q` at M19 for 11,500 game-seconds). So there is no "safe" strategy to fall back to,
  // and this is an ORDERED ESCALATION LIST per feature with a way BACK, not a one-way switch (plan §18.2's table is
  // the measurement that rules the one-way version out).
  //
  // ---- THE MACHINE, EXACTLY ----------------------------------------------------------------------------------------
  // Per feature: one integer RUNG. 0 = its own policy (the primary — derived / table / `--auto-opt` / the player's
  // saved choice, whichever V2's precedence resolves to); rung i > 0 = the i-th entry of its escalation list, which is
  // a COMPLETE policy string, parameters and modifier included.
  //
  //   primary ──(the GAME is stalled AND this feature is the arbiter's pick)──▶ rung 1 ──(same again)──▶ rung 2 …
  //      ▲                                                                        │
  //      └──(progress resumed, and has held for the cool-off)───────────────────────┘
  //      └──(the player edits this feature by hand)────────────────────────────────┘
  //
  //   · STALLED is the tracker's word: `sinceLast ≥ K × typicalGap`, `typicalGap` the median of the last `n` gaps that
  //     are usable evidence. With no usable gap yet there is no threshold and NOTHING escalates.
  //   · ONE ESCALATION PER STALL EVENT. After escalating, the watch will not escalate again until either progress
  //     resumes or the stall has lasted another whole `K × typicalGap` — a stall that outlives its own threshold twice
  //     is a second stall event, and the next rung is the answer to it.
  //   · THE COOL-OFF IS MEASURED IN TYPICAL GAPS, not in seconds (⚖ minimize hardcoding: a number of seconds would be
  //     a constant with no meaning on a game nobody has measured). `cool` is a FACTOR: once progress has resumed, a
  //     feature returns to its primary after `cool × typicalGap` game-seconds with the game still progressing. At the
  //     default 1 that is "the game has been going at its normal rate for one normal gap".
  //   · A HAND EDIT WINS. Any of `setSavedPolicy` / `setSavedStrategy` / `setSavedParam` / `setSavedModifier` /
  //     `setEscalation` on a feature puts that feature straight back on rung 0 — the player just told the watch what
  //     they want, and leaving them on a rung would show them a policy they did not choose.
  //
  // ---- PRECEDENCE, extending V2's ----------------------------------------------------------------------------------
  //   derived  <  the game's table  <  `--auto-opt policy:<id>=`  <  the player's saved choice  <  THE WATCH'S RUNG  <
  //   a runtime override (`setPolicy`, the planner's committed epoch).
  // ⛔ The rung sits UNDER the runtime override on purpose, for V2's reason: a measurement that named a configuration
  // must measure that configuration. And it sits OVER the save because that is what the option the player switched on
  // is FOR — with the order the other way round the watch could never move anything a player had tuned.
  //
  // ---- WHERE THE STATE LIVES ---------------------------------------------------------------------------------------
  //   the player's CHOICES → `player.au.edits` (V2's one key): each feature's list at `edits[<id>].escalate`, and the
  //     option itself at the RESERVED entry `edits['*']` (below). ⛔ NOTHING IS ADDED TO `startData`, so a fresh boot
  //     and every committed snapshot are byte-identical and no full-hash pin moves — which is the claim
  //     `gates-v3 --part 2` measures rather than inherits.
  //   the watch's own STATE (which rung, the clocks) → `runtimeState()`, and only while it has something to say.
  var WATCH_KEY = '*';
  // ⛔ WHY A RESERVED KEY INSIDE `edits` AND NOT A NEW `player.au` FIELD. A new key in the `au` layer's `startData`
  // moves the FULL state hash, and `gates-p1a --part 0` pins one — a pin move is ⚖ the USER's, and the brief says to
  // stop and report rather than spend one. `edits` is `{}` at every boot and gains a key only when the player writes
  // one, so putting the option there costs NOTHING until it is used. `'*'` can never collide with a feature id, which
  // is always `<kind>:<layer>` with `kind` one of the six; every reader of `edits` looks a feature up BY ID
  // (`savedPolicyOf`, `setSavedPolicy`), so the entry is invisible to all of them.
  // ⚠ The DEFAULTS below are provisional and justified, and ⚖ R2's sweep owns the real ones — this slice moves none.
  var WATCH_PARAMS = [
    // ⛔ K = 10, AND IT IS MEASURED, NOT INHERITED. The obvious default was `stall>=Kx/N`'s 3, and 3 is WRONG
    // here for a reason about the DISTRIBUTION rather than about taste: a game's progress gaps are heavy-tailed
    // (ptr's opening has a median of 7 game-seconds and quiet stretches of 100+ BY DESIGN — §14d.6), so a small
    // multiple of the MEDIAN lands inside normal play. Measured on ptr, both legs, watch on, nothing edited:
    //   K=3  — the opening escalates 6× and M12 slips 6718 → 6798; the `q` stall reaches only M18 (3 q resets),
    //          because an early escalation of `reset:e` onto `interval>=5` starves the very thing q needs;
    //   K=6  — the opening escalates 1× and M12 slips to 6755;
    //   K=10 — the opening escalates 0× and is BYTE-IDENTICAL to the control (M12 6718, hashGame
    //          82eee26f947b2b2e), and the `q` stall reaches M20 at 26282 where the shipped default stops at
    //          M19 / 24607 and sits there for the remaining 11,500 game-seconds.
    // Higher is better on BOTH legs, which is the opposite of a trade-off and is why this is a default rather than
    // a question for R2. ⚖ R2 still owns the real one; this slice moves no table default and writes nothing into
    // `games-auto/`.
    { name: 'k', type: 'factor', default: '10', min: 1, label: 'stalled after K× the typical gap',
      why: 'ten times longer than this game’s own progress has been taking is not a wait, it is a stall — and a smaller multiple of a heavy-tailed median lands inside normal play (measured: at K=3 ptr’s healthy opening escalates six times)' },
    { name: 'n', type: 'count', default: '5', min: 1, label: 'progress gaps remembered',
      why: 'short enough to follow a changing game, long enough that one unusual gap does not move the median — `stall>=Kx/N`’s N, for the same reason' },
    { name: 'cool', type: 'factor', default: '1', min: 0, label: 'return to the primary after this many typical gaps',
      why: 'a feature should not be yanked back by one lucky item; one typical gap of renewed progress is by construction “the game is moving at its normal rate again”, and it needs no constant in any game’s own units' },
  ];
  var WATCH_ROW = { template: 'the stall watch', params: WATCH_PARAMS };
  T.watchParams = function () { return WATCH_PARAMS.map(function (p) { var t = PARAM_TYPES[p.type]; return { name: p.name, type: p.type, default: p.default, min: p.min === undefined ? t.min : p.min, max: p.max === undefined ? (t.max === undefined ? null : t.max) : p.max, label: p.label, why: p.why, valueKind: t.kind }; }); };
  function watchParamRow(name) { for (var i = 0; i < WATCH_PARAMS.length; i++) if (WATCH_PARAMS[i].name === name) return WATCH_PARAMS[i]; return null; }
  function watchSettings() { var e = editsOf(); var w = e && e[WATCH_KEY]; return w && typeof w === 'object' ? w : {}; }
  /** One watch parameter's value in force: `--auto-opt watch<Name>=` beats the save beats the declared default. */
  function watchParam(name) {
    var row = watchParamRow(name);
    if (!row) return null;
    var o = T.autoOptions || {}, ov = o['watch' + name.charAt(0).toUpperCase() + name.slice(1)];
    if (ov !== undefined && !checkParam(WATCH_ROW, name, ov)) return String(ov).trim();
    var s = watchSettings()[name];
    if (typeof s === 'string' && !checkParam(WATCH_ROW, name, s)) return s;
    return row.default;
  }
  /** Is the watch on? `?autoOpt=watch=1` (a gate's and the harness's lever) beats the save; OFF is the default. */
  function watchArmed() {
    var o = T.autoOptions || {};
    if (o.watch !== undefined) return truthy(o.watch);
    return watchSettings().watch === true;
  }
  T.watchOn = watchArmed;
  T.watchTracking = progressTracked;
  /** Write one of the player's watch choices. `{ok, error}`; a refusal changes nothing and says why (V2's rule). */
  T.setWatchOption = function (name, value) {
    var e = editsOf();
    if (!e) return { ok: false, error: 'this save has no automation store yet (player.' + AU + '.edits)' };
    var flags = { watch: 1, track: 1 };
    if (!flags[name] && !watchParamRow(name)) return { ok: false, error: '"' + name + '" is not a watch setting (' + Object.keys(flags).concat(WATCH_PARAMS.map(function (p) { return p.name; })).join(', ') + ')' };
    var why = null;
    if (!flags[name]) { try { why = checkParam(WATCH_ROW, name, value); } catch (err) { why = String(err.message || err); } }
    if (why) return { ok: false, error: why };
    var next = Object.assign({}, watchSettings());
    if (flags[name]) next[name] = !!value; else next[name] = String(value).trim();
    // ⚠ Vue.set, because `edits['*']` is a key ADDED to an object after creation and 22 of the 171 engines assign
    // plainly (U6, measured) — the same reason every per-feature entry is written this way.
    setIn(e, WATCH_KEY, next);
    player[AU].disclosed = true;
    if (progressTracked()) T.progressArm(); else { prog = null; clearWatch(); }
    invalidateView();
    return { ok: true, error: null, settings: T.watchOptions() };
  };
  T.watchOptions = function () {
    var w = watchSettings(), o = { watch: watchArmed(), track: progressTracked(), saved: { watch: w.watch === true, track: w.track === true } };
    for (var i = 0; i < WATCH_PARAMS.length; i++) o[WATCH_PARAMS[i].name] = watchParam(WATCH_PARAMS[i].name);
    return o;
  };

  // ---- the ESCALATION LIST -----------------------------------------------------------------------------------------
  // ⛔ DERIVED, NOT TYPED, UNTIL THE PLAYER TYPES ONE (⚖ minimize hardcoding: no layer name, no per-game literal).
  // The order is: the game's table `alternatives` for this feature where it names any, else every OTHER strategy of
  // this feature's kind that the table marks applicable HERE — in the table's own order, at each row's declared
  // defaults, and skipping any row that declares `escalate: false`.
  // ⚠ `escalate: false` IS A TABLE FACT, NOT A HARDCODE. `challenges: off` and `clickables: off` are strategies whose
  // whole content is "do nothing", so escalating a stalled feature ONTO one would answer a stall by stopping. The row
  // says so itself; nothing here knows which rows they are.
  var escRung = {};        // feature id → which rung it is on (absent = 0, the primary)
  var escSince = {};       // feature id → the game-second it reached its current rung
  var watchClock = { stalledAt: null, escalatedAt: null, coolFrom: null, events: 0 };
  function anyEscalated() { for (var k in escRung) if (escRung[k] > 0) return true; return false; }
  function clearWatch() { for (var k in escRung) delete escRung[k]; for (var j in escSince) delete escSince[j]; watchClock.stalledAt = null; watchClock.escalatedAt = null; watchClock.coolFrom = null; watchClock.events = 0; }
  /** The PLAYER's typed list for one feature, validated entry by entry, or null when they have not typed one. */
  function savedEscalationOf(f) {
    var e = editsOf(), v = e && e[f.id] ? e[f.id].escalate : undefined;
    if (!v || typeof v.length !== 'number') return null;
    // ⚠ A STORED EMPTY LIST IS HONOURED, and it means *never escalate this feature* — see `removeEscalationRung`.
    var out = [];
    for (var i = 0; i < v.length; i++) if (typeof v[i] === 'string' && policyOk(f.kind, v[i])) out.push(v[i]);
    return out;
  }
  /** The base policy: everything V2's precedence resolves to BELOW the watch. The rung is derived FROM this. */
  function basePolicy(f) { return savedPolicyOf(f) || f.policy0; }
  function escalationList(f) {
    var saved = savedEscalationOf(f);
    if (saved) return saved;
    var alts = [], i;
    for (i = 1; i < f.policies.length; i++) if (typeof f.policies[i] === 'string' && policyOk(f.kind, f.policies[i])) alts.push(f.policies[i]);
    if (alts.length) return alts;
    // ⚠ NOT `f.policy` — that is the getter, and it reads the rung, which reads this list. The exclusion is against
    // the BASE policy's strategy id, which is what the feature would be running with the watch switched off.
    var P = parsePolicy(f.kind, basePolicy(f));
    var rows = strategiesOf(f.kind), out = [];
    for (i = 0; i < rows.length; i++) {
      var S = rows[i];
      if (S.escalate === false) continue;
      if (P && S.id === P.id) continue;
      if (!availability(f, S).ok) continue;
      var s = fillTemplate(S, {});
      if (policyOk(f.kind, s)) out.push(s);
    }
    return out;
  }
  T.escalationList = function (id) { var f = byId[id]; if (!f) throw new Error('no feature "' + id + '"'); return { list: escalationList(f), typed: savedEscalationOf(f) !== null, rung: escRung[id] || 0 }; };
  /** Write the player's own escalation list for one feature (or `null` to go back to the derived one). */
  T.setEscalation = function (id, list) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var e = editsOf();
    if (!e) return { ok: false, error: 'this save has no automation store yet (player.' + AU + '.edits)' };
    var entry = Object.assign({}, e[id] || {});
    if (list === null || list === undefined) delete entry.escalate;
    else {
      if (typeof list.length !== 'number') return { ok: false, error: 'an escalation list is a list of strategy strings' };
      var out = [];
      for (var i = 0; i < list.length; i++) {
        if (typeof list[i] !== 'string' || !policyOk(f.kind, list[i])) return { ok: false, error: '"' + list[i] + '" is not a ' + f.kind + ' strategy this build knows' };
        out.push(list[i]);
      }
      entry.escalate = out;
    }
    // a feature with nothing left in its entry loses the entry, so `edits` never keeps an empty shell
    if (entry.policy === undefined && entry.escalate === undefined) delIn(e, id); else setIn(e, id, entry);
    player[AU].disclosed = true;
    handEdited(id);
    invalidateView();
    return { ok: true, error: null, list: escalationList(f), typed: savedEscalationOf(f) !== null };
  };
  /** ⛔ A HAND EDIT RETURNS THAT FEATURE TO ITS PRIMARY — the player just said what they want. */
  function handEdited(id) { if (escRung[id]) { delete escRung[id]; delete escSince[id]; } }

  // ---- the tick: poll the tracker, then decide whether to escalate -------------------------------------------------
  // ⛔ ONCE PER `gameLoop`, BEFORE ANY FEATURE OF THAT LOOP DECIDES — `runLayer` calls it, so it runs ahead of the
  // first feature whatever order the engines call the layers' `automate` slots in.
  var watchLoop = -1;
  function watchTick() {
    if (!progressTracked()) { if (prog !== null) { prog = null; clearWatch(); } return; }
    if (prog === null) armProgress();
    pollProgress();
    if (!watchArmed()) { if (anyEscalated()) clearWatch(); return; }
    // ⚠ `progressNow()`, not `T.progress()` — the readout copies the whole bounded event list and reverses it, and
    // this runs on a 13.5 ms/tick leg. The sensor answers four numbers.
    var p = progressNow(), now = Number(player.timePlayed) || 0;
    if (!p.stalled) {
      // progress is happening (or there is no threshold yet): start the cool-off at the first such tick and bring
      // every escalated feature home once it has held for `cool × typicalGap`.
      watchClock.stalledAt = null;
      if (anyEscalated()) {
        if (watchClock.coolFrom === null) watchClock.coolFrom = now;
        var need = Number(watchParam('cool')) * (p.typicalGap === null ? 0 : p.typicalGap);
        if (now - watchClock.coolFrom >= need) { for (var k in escRung) { delete escRung[k]; delete escSince[k]; } watchClock.escalatedAt = null; watchClock.coolFrom = null; }
      } else { watchClock.coolFrom = null; watchClock.escalatedAt = null; }
      return;
    }
    watchClock.coolFrom = null;
    if (watchClock.stalledAt === null) watchClock.stalledAt = now;
    // ONE escalation per stall event: a stall that has outlived its own threshold AGAIN is the next stall event.
    if (watchClock.escalatedAt !== null && (now - watchClock.escalatedAt) < (p.threshold === null ? Infinity : p.threshold)) return;
    var win = watchWinner(p.threshold);
    if (!win) return;
    var list = escalationList(win.f), at = escRung[win.f.id] || 0;
    if (at >= list.length) return;                      // the top rung: there is nothing further to try
    escRung[win.f.id] = at + 1;
    escSince[win.f.id] = now;
    watchClock.escalatedAt = now;
    // ⛔ THE GAP THAT IS CURRENTLY OPEN IS NOW UNUSABLE, AND MARKING IT HERE IS THE WHOLE GUARD. MEASURED by
    // `loader/watch.test.mjs` leg 3: `pushEvent` sets `gapDirty` from `anyEscalated()` at the END of the previous
    // gap, which is before any escalation this stall caused — so the RESCUE's own 100-game-second gap came back
    // CLEAN and fed the median (8, 12, 100 instead of 8, 12). A rescue's duration is not evidence of what normal
    // looks like; that is the same rule `stall>=Kx/N` already has for a fallback-fired reset, and it has to be
    // written down at the moment the escalation happens, not inferred at the moment the gap closes.
    if (prog !== null) prog.gapDirty = true;
    watchClock.events++;
    // ⚠ The rung changed the policy in force, so the parsed cache and the view both have to know.
    win.f.policyStr = null;
    invalidateView();
  }
  /** ⛔ ONLY A FEATURE THAT IS WAITING IS A CANDIDATE — V1's reason codes decide, and nothing re-derives them. */
  // A feature that is ACTING, locked, off, yielding to the game's own auto-reset, blocked, or has nothing affordable
  // is left alone: changing its strategy answers a stall it is not the cause of. `f.last` is the code from the tick it
  // last ran in, which is exactly what "currently waiting" means for a feature that runs once per loop.
  //
  // ⛔⛔ AND IT MUST HAVE BEEN WAITING FOR AT LEAST AS LONG AS THE STALL — MEASURED, AND THE FIRST CUT WITHOUT THIS
  // TEST WRECKED PTR'S OPENING (V3 §21, the brief's own hazard). The gap distribution of a fresh game is heavy-tailed:
  // the first upgrades arrive 9–15 game-seconds apart, so the median over the last `n` gaps is ~14 and `K = 3` puts
  // the threshold at ~45 — while a perfectly healthy opening has 100-second quiet stretches BY DESIGN (§14d.6). With
  // the game-level test alone the watch fired 13 times in 9000 game-seconds, put `reset:p` on rung 2 (`always`, which
  // resets at 10 points), and the run reached only **M07 at 2672** where the shipped table reaches **M12 at 6718** —
  // the exact failure the measurement in plan §18.2 already named for `always` on row 1.
  // ⚠ The fix is not a bigger constant, and it is not the median: it is that a feature which reset three seconds ago
  // is NOT the cause of a 45-second game stall. `f.onSince` is V1's own clock for "eligible with nothing done since",
  // which is exactly this question, and it is already reset on every action. In the opening `reset:p` acts every few
  // seconds, so it never clears the bar and the opening is untouched; at the `q` stall it has done nothing for 11,500
  // game-seconds and clears it by three orders of magnitude.
  function watchCandidate(g, threshold) {
    if (!active(g)) return null;
    if (!g.last || String(g.last.code).indexOf('waiting:') !== 0) return null;
    if (g.gate && !holds(g.gate)) return null;
    if (!escalationList(g).length) return null;
    if (threshold !== null && threshold !== undefined) {
      if (g.onSince === null) return null;
      if (((Number(player.timePlayed) || 0) - g.onSince) < threshold) return null;
    }
    // the ARBITER's number is V2's, unchanged: how far into its own target this refusal is (`progressOf`).
    var P = parsedOf(g), p = null;
    try { p = progressOf(g, P, { values: g.last.values }); } catch (e) { p = null; }
    return { f: g, progress: p === null ? -1 : p };
  }
  /** ⛔ V2's ARBITER, REUSED — highest progress fraction first, ties by registration order. Not a second one. */
  function watchWinner(threshold) { return pickByProgress(features, function (g) { return watchCandidate(g, threshold); }); }
  function pickByProgress(list, candidateOf) {
    var best = null;
    for (var i = 0; i < list.length; i++) {
      var c = candidateOf(list[i]);
      if (!c) continue;
      if (best === null || c.progress > best.progress) best = c;
    }
    return best;
  }
  /** The policy the watch has put in force for this feature, or null when it is on its primary. */
  function watchPolicy(f) {
    var at = escRung[f.id];
    if (!at) return null;
    var list = escalationList(f);
    return list[at - 1] || null;
  }
  // ---- the WATCH's own state words, enumerated as DATA ---------------------------------------------------------------
  // ⚠ THEY ARE NOT REASON CODES, and that distinction is deliberate — see §21. V1's vocabulary is the set of values a
  // DECISION returns, and `gates-v1 --part 1 / --part 2` define it that way (every code witnessed as a decision, and
  // `acted:*` ⇔ the feature acted). The watch does not decide anything a feature does; it changes what a feature
  // decides BY, so its words live in their own enumerated table with their own witness leg and V1's two gates keep
  // meaning what they mean.
  var WATCH_CODES = {
    'watch:off':       'Off — the stall watch is not switched on',
    'watch:armed':     'Watching — not enough progress measured yet to say what a normal gap is',
    'watch:moving':    'Watching — the game is progressing ({sinceLast} s since the last of {total}, typically {typicalGap} s)',
    'watch:stalled':   'STALLED — {sinceLast} s since the last progress, against a typical {typicalGap} s (threshold {threshold} s)',
    'watch:escalated': '{n} feature(s) escalated — the stall watch changed what they decide by',
    'watch:cooling':   'Cooling off — progress resumed {since} s ago; {n} escalated feature(s) return to their own rule at {need} s',
  };
  T.watchCodes = function () { return Object.assign({}, WATCH_CODES); };
  T.watchState = function () {
    var p = T.progress(), now = Number(player.timePlayed) || 0;
    var esc = [], k;
    for (k in escRung) if (escRung[k] > 0) esc.push({ id: k, rung: escRung[k], of: escalationList(byId[k]).length, policy: watchPolicy(byId[k]), since: r1(escSince[k]) });
    esc.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    var code = !watchArmed() ? 'watch:off'
      : watchClock.coolFrom !== null && esc.length ? 'watch:cooling'
      : p.stalled ? 'watch:stalled'
      : p.typicalGap === null ? 'watch:armed' : 'watch:moving';
    var need = Number(watchParam('cool')) * (p.typicalGap === null ? 0 : p.typicalGap);
    var values = { sinceLast: p.sinceLast, total: p.total, typicalGap: p.typicalGap, threshold: p.threshold, n: esc.length,
      since: watchClock.coolFrom === null ? null : r1(now - watchClock.coolFrom), need: r1(need) };
    return { on: watchArmed(), tracking: progressTracked(), code: code, text: watchText(code, values), values: values,
      escalated: esc, events: watchClock.events, options: T.watchOptions(),
      stalledSince: watchClock.stalledAt === null ? null : r1(watchClock.stalledAt),
      escalatedAt: watchClock.escalatedAt === null ? null : r1(watchClock.escalatedAt) };
  };
  function watchText(code, values) {
    return String(WATCH_CODES[code] || code).replace(/\{(\w+)\}/g, function (_, n) { return values && values[n] !== undefined && values[n] !== null ? String(values[n]) : '?'; });
  }
  /** One feature's watch row, for `explain()` — null when the watch has nothing to say about it. */
  function escalationOf(f) {
    if (!watchArmed()) return null;
    var list = escalationList(f), at = escRung[f.id] || 0;
    if (!list.length && !at) return null;
    return { rung: at, of: list.length, list: list.slice(), typed: savedEscalationOf(f) !== null,
      policy: at ? watchPolicy(f) : null, primary: basePolicy(f), since: at ? r1(escSince[f.id]) : null,
      // ⚠ THE SAME BAR THE DECISION USES, or the view would promise an escalation that can never happen.
      candidate: !!watchCandidate(f, progressNow().threshold),
      waitingFor: f.onSince === null ? null : r1((Number(player.timePlayed) || 0) - f.onSince) };
  }
  T.escalationState = function (id) { var f = byId[id]; if (!f) throw new Error('no feature "' + id + '"'); return escalationOf(f); };

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
    // ⛔ ONCE PER `gameLoop`, AHEAD OF THE FIRST FEATURE OF THAT LOOP (V3). `runLayer` is called from each layer's own
    // `automate` wrapper and from the `au` layer's fallback, so this is the earliest point that is guaranteed to come
    // before any feature decides, whatever order the engines walk the layers in. `watchTick` polls the progress
    // tracker and then escalates at most one waiting feature — so a feature's very next decision is made under the
    // rung the stall it is part of just bought.
    if (watchLoop !== loopNo) { watchLoop = loopNo; watchTick(); }
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
    // ---- V3: the progress tracker's and the stall watch's memory ------------------------------------------------
    // ⛔ EACH BLOCK APPEARS ONLY WHEN IT HAS SOMETHING TO SAY, for V2's reason and with V2's consequence: a run with
    // the tracker off writes EXACTLY the record it wrote before V3, so every snapshot committed in this repo stays
    // valid and every pinned resume reproduces. `gates-v3 --part 2` measures that rather than asserting it.
    // ⚠ `gapDirty` IS PART OF THE MEMORY on purpose. Without it a resumed run would re-apply the "the first gap after
    // a load does not count" rule to a gap the uninterrupted run was already halfway through, and the two would
    // measure different medians from the same state.
    if (prog !== null) o.progress = { seen: Object.keys(prog.seen), bmax: Object.assign({}, prog.bmax),
      lens: JSON.parse(JSON.stringify(prog.lens)), events: JSON.parse(JSON.stringify(prog.events)),
      total: prog.total, byKind: Object.assign({}, prog.byKind), dropped: prog.dropped,
      gaps: JSON.parse(JSON.stringify(prog.gaps)), skippedGaps: prog.skippedGaps.slice(), skipped: prog.skipped,
      gapDirty: !!prog.gapDirty, lastAt: prog.lastAt, firstAt: prog.firstAt,
      marks: Object.assign({}, prog.marks) };
    var er = {}, ne = 0;
    for (var ei in escRung) if (escRung[ei] > 0) { er[ei] = escRung[ei]; ne++; }
    if (ne) o.watch = { rung: er, since: Object.assign({}, escSince), clock: { stalledAt: watchClock.stalledAt, escalatedAt: watchClock.escalatedAt, coolFrom: watchClock.coolFrom, events: watchClock.events } };
    else if (watchClock.events) o.watch = { rung: {}, since: {}, clock: { stalledAt: watchClock.stalledAt, escalatedAt: watchClock.escalatedAt, coolFrom: watchClock.coolFrom, events: watchClock.events } };
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
    // ---- V3 ------------------------------------------------------------------------------------------------------
    // ⚠ A RECORD WITHOUT A `progress` BLOCK LEAVES THE TRACKER UNARMED, which is what a pre-V3 snapshot means and
    // what a run with the tracker off means. It then arms fresh at the first tick, seeds from whatever the save
    // already holds, and treats the stretch from there as the first gap (which does not count).
    prog = null;
    if (rt.progress) {
      var g = rt.progress;
      prog = { seen: {}, bmax: Object.assign({}, g.bmax || {}), lens: JSON.parse(JSON.stringify(g.lens || {})),
        events: (g.events || []).slice(), total: Number(g.total) || 0, byKind: Object.assign({}, g.byKind || {}),
        dropped: Number(g.dropped) || 0, gaps: (g.gaps || []).slice(), skippedGaps: (g.skippedGaps || []).slice(),
        skipped: Number(g.skipped) || 0, gapDirty: !!g.gapDirty,
        lastAt: Number(g.lastAt) || 0, firstAt: Number(g.firstAt) || 0, marks: Object.assign({}, g.marks || {}) };
      for (var si = 0; si < (g.seen || []).length; si++) prog.seen[g.seen[si]] = 1;
    }
    clearWatch();
    if (rt.watch) {
      for (k in rt.watch.rung || {}) if (byId[k]) { escRung[k] = Number(rt.watch.rung[k]); byId[k].policyStr = null; }
      for (k in rt.watch.since || {}) escSince[k] = Number(rt.watch.since[k]);
      var wc = rt.watch.clock || {};
      watchClock.stalledAt = wc.stalledAt === null || wc.stalledAt === undefined ? null : Number(wc.stalledAt);
      watchClock.escalatedAt = wc.escalatedAt === null || wc.escalatedAt === undefined ? null : Number(wc.escalatedAt);
      watchClock.coolFrom = wc.coolFrom === null || wc.coolFrom === undefined ? null : Number(wc.coolFrom);
      watchClock.events = Number(wc.events) || 0;
    }
    watchLoop = -1;
    polledLoop = -1;
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
  // ⛔ PRECEDENCE, EXTENDED ONCE BY V3 AND STILL IN ONE PLACE:
  //   derived  <  the game's table  <  `--auto-opt policy:<id>=`  <  the player's SAVED choice  <  the stall WATCH's
  //   current rung  <  a runtime override (`setPolicy`).
  // `basePolicy(f)` is everything below the watch, and the watch's own list is derived FROM it — which is also why
  // `escalationList` must never read `f.policy` (that getter is this function, and it reads the rung).
  function policyOf(f) { return f.policyRuntime !== null ? f.policyRuntime : (watchPolicy(f) || basePolicy(f)); }
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
    // ⚠ THE PER-FEATURE ENTRY IS MERGED, NOT REPLACED (V3): `escalate` is a second field of the same object, and a
    // policy write that overwrote the whole entry would silently drop the list the player typed.
    var entry = Object.assign({}, e[id] || {});
    if (policy === null || policy === undefined) {
      delete entry.policy;
      if (entry.escalate === undefined) delIn(e, id); else setIn(e, id, entry);
      player[AU].disclosed = true; handEdited(id); invalidateView(); return { ok: true, policy: policyOf(f), error: null };
    }
    if (typeof policy !== 'string' || !policyOk(f.kind, policy)) return { ok: false, policy: policyOf(f), error: '"' + policy + '" is not a ' + f.kind + ' strategy this build knows' };
    entry.policy = policy;
    setIn(e, id, entry);
    player[AU].disclosed = true;
    // ⛔ A HAND EDIT RETURNS THIS FEATURE TO ITS PRIMARY (V3, ⚖ the brief): the player has just said what they want,
    // and leaving them on an escalation rung would show them a policy they did not choose.
    handEdited(id);
    invalidateView();
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
  /** Pick a different STRATEGY, at its own defaults, keeping whatever modifier is in force. */
  T.setSavedStrategy = function (id, strategyId) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var S = byStrategyId(f.kind, strategyId);
    if (!S || S.kind !== f.kind) return { ok: false, policy: policyOf(f), error: '"' + strategyId + '" is not a ' + f.kind + ' strategy' };
    var a = availability(f, S);
    if (!a.ok) return { ok: false, policy: policyOf(f), error: a.why };
    var P = parsedOf(f);
    return T.setSavedPolicy(id, formatPolicy(f.kind, { id: S.id, params: {}, modifier: P && P.modifier ? P.modifier : null }));
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


  // ---- editing an escalation LIST, rung by rung (V3 Part 2) ----------------------------------------------------------
  // ⛔ EVERY ONE OF THESE GOES THROUGH `T.setEscalation`, which validates each entry and puts the feature back on its
  // primary — so there is ONE write path and one refusal message, exactly as V2's four policy writers all end in
  // `setSavedPolicy`. ⚠ The FIRST edit of a DERIVED list materialises it: the list the player sees is the list they
  // start from, and a derived list that silently reverted after one edit would be the worst of both.
  function rungList(f) { return escalationList(f).slice(); }
  function rungIndex(list, rung) { var i = Math.round(Number(rung)) - 1; return i >= 0 && i < list.length ? i : -1; }
  T.setEscalationStrategy = function (id, rung, strategyId) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var S = byStrategyId(f.kind, strategyId);
    if (!S || S.kind !== f.kind) return { ok: false, error: '"' + strategyId + '" is not a ' + f.kind + ' strategy' };
    var a = availability(f, S);
    if (!a.ok) return { ok: false, error: a.why };
    var list = rungList(f), i = rungIndex(list, rung);
    if (i < 0) return { ok: false, error: 'this feature has no rung ' + rung };
    var was = parsePolicy(f.kind, list[i]);
    list[i] = formatPolicy(f.kind, { id: S.id, params: {}, modifier: was && was.modifier ? was.modifier : null });
    return T.setEscalation(id, list);
  };
  T.setEscalationParam = function (id, rung, name, value, which) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var list = rungList(f), i = rungIndex(list, rung);
    if (i < 0) return { ok: false, error: 'this feature has no rung ' + rung };
    var P = parsePolicy(f.kind, list[i]);
    if (!P) return { ok: false, error: 'rung ' + rung + ' cannot be parsed' };
    var onMod = which === 'modifier';
    if (onMod && !P.modifier) return { ok: false, error: 'that rung has no modifier to edit' };
    var S = byStrategyId(f.kind, onMod ? P.modifier.id : P.id), why = null;
    try { why = checkParam(S, name, value); } catch (e) { return { ok: false, error: String(e.message || e) }; }
    if (why) return { ok: false, error: why };
    var next = { id: P.id, params: Object.assign({}, P.params), modifier: P.modifier ? { id: P.modifier.id, params: Object.assign({}, P.modifier.params) } : null };
    (onMod ? next.modifier.params : next.params)[name] = String(value).trim();
    list[i] = formatPolicy(f.kind, next);
    return T.setEscalation(id, list);
  };
  /** Append a rung. With no strategy named, the first one of the kind that is available and not already listed. */
  T.addEscalationRung = function (id, strategyId) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var list = rungList(f), pick = null;
    if (strategyId) { var S = byStrategyId(f.kind, strategyId); if (!S || S.kind !== f.kind) return { ok: false, error: '"' + strategyId + '" is not a ' + f.kind + ' strategy' }; if (!availability(f, S).ok) return { ok: false, error: availability(f, S).why }; pick = fillTemplate(S, {}); }
    else {
      var rows = strategiesOf(f.kind);
      for (var i = 0; i < rows.length && pick === null; i++) {
        if (rows[i].escalate === false || !availability(f, rows[i]).ok) continue;
        var s = fillTemplate(rows[i], {});
        if (list.indexOf(s) < 0) pick = s;
      }
      if (pick === null) return { ok: false, error: 'every strategy this feature can use is already a rung' };
    }
    list.push(pick);
    return T.setEscalation(id, list);
  };
  T.removeEscalationRung = function (id, rung) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var list = rungList(f), i = rungIndex(list, rung);
    if (i < 0) return { ok: false, error: 'this feature has no rung ' + rung };
    list.splice(i, 1);
    // ⚠ AN EMPTY TYPED LIST IS NOT "NO LIST" — it is *never escalate this feature*, and it has to be storable, or
    // removing the last rung would silently hand the player the DERIVED list back and the feature would go on
    // escalating. `savedEscalationOf` therefore honours a stored `[]`, and `escalationList` returns it.
    return T.setEscalation(id, list);
  };
  T.moveEscalationRung = function (id, rung, dir) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var list = rungList(f), i = rungIndex(list, rung), j = i + (Number(dir) > 0 ? 1 : -1);
    if (i < 0) return { ok: false, error: 'this feature has no rung ' + rung };
    if (j < 0 || j >= list.length) return { ok: false, error: 'that rung is already at the end of the list' };
    var t = list[i]; list[i] = list[j]; list[j] = t;
    return T.setEscalation(id, list);
  };
  /** One rung's editable shape, for the page: the picker's options and one field per parameter. */
  T.rungChoices = function (id, rung) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var list = escalationList(f), i = rungIndex(list, rung);
    if (i < 0) return null;
    var P = parsePolicy(f.kind, list[i]);
    return { policy: list[i], strategy: P ? P.id : null, params: P ? Object.assign({}, P.params) : null,
      modifier: P && P.modifier ? { id: P.modifier.id, params: Object.assign({}, P.modifier.params) } : null,
      options: strategiesOf(f.kind).map(function (S) { var a = availability(f, S); return { id: S.id, label: S.label, help: S.help, available: a.ok && S.escalate !== false, why: a.ok ? (S.escalate === false ? 'a do-nothing strategy is never an escalation rung' : null) : a.why, inForce: !!(P && P.id === S.id), params: strategyJSON(S).params }; }) };
  };

  // ---- WHICH BLOCKS ARE COLLAPSED (V3 Part 3, ⚖ the user's Q1) -------------------------------------------------------
  // ⚖ THE USER'S WORDS (2026-09-19): *"I also want to make each block in the advanced automation section collapsible,
  // and have an expand all / collapse all button."*
  // ⛔ THE STATE IS NOT IN `player`, AND THAT IS THE WHOLE REASON THIS IS THREE LINES OF STORAGE RATHER THAN A SAVE
  // KEY. `hashGame` excludes only the top-level `au`, so a per-feature expand map under `player.au` would move every
  // pinned FULL hash in the repo — at **59 keys** on `the-omega-tree`, which is the widest Advanced view measured.
  // The store is `loader/layerlist.js`'s pattern, reused verbatim: `T.storage.raw`, inside the loader's OWN namespace
  // (`tmt-loader:<id>:`), so two games cannot share a block's state and this file invents no second mechanism.
  // ⚠ EVERY READ AND EVERY WRITE IS WRAPPED. Storage can throw and can come back empty — a private window, blocked
  // site data, a quota — and a view with nothing stored renders exactly as it did before this existed. In NODE there
  // is no `storage.raw` at all (`boot.mjs` supplies `prefix` and `list` only), so `prefKey()` is null, both calls are
  // no-ops, and the headless view keeps today's defaults. That is deliberate: which blocks a player has open is not
  // something a harness run should be able to move.
  // ⚠ IT IS A CONSEQUENCE, recorded rather than left to be found: the key is inside what "clear this game's save"
  // clears, because that namespace IS what it clears. A cleared game comes back with today's defaults.
  var COLLAPSE_KEY = 'ui.au.collapsed';
  // ⛔ TWO LISTS, NOT ONE, because the DEFAULT is not uniform: a locked or excluded feature is collapsed today and
  // everything else is open (V1's rule, unchanged — "there are 78 of them on ptr at a fresh save and 3 that are doing
  // anything"). A single "collapsed" list could not express "I opened a locked one", and `collapse all` followed by
  // `expand all` has to come back to the same place a first load would.
  var collapsePrefs = null;
  function collapsePrefKey() { var st = T.storage; return st && st.prefix && st.raw ? st.prefix + COLLAPSE_KEY : null; }
  function collapseRead() {
    if (collapsePrefs) return collapsePrefs;
    collapsePrefs = { open: {}, closed: {} };
    try {
      var k = collapsePrefKey();
      var raw = k && T.storage.raw.getItem.call(localStorage, k);
      var v = raw ? JSON.parse(raw) : null;
      if (v && typeof v === 'object') for (var side in { open: 1, closed: 1 }) {
        var list = v[side];
        if (list && typeof list.length === 'number') for (var i = 0; i < list.length; i++) if (typeof list[i] === 'string') collapsePrefs[side][list[i]] = true;
      }
    } catch (e) { /* no storage, or a value we did not write: the view renders with today's defaults */ }
    return collapsePrefs;
  }
  function collapseWrite() {
    try {
      var k = collapsePrefKey();
      if (!k) return;
      var p = collapseRead(), open = Object.keys(p.open), closed = Object.keys(p.closed);
      if (open.length || closed.length) T.storage.raw.setItem.call(localStorage, k, JSON.stringify({ open: open, closed: closed }));
      else T.storage.raw.removeItem.call(localStorage, k);   // nothing remembered is nothing to remember
    } catch (e) { /* a full or read-only store costs the preference, never the view */ }
  }
  /** Today's rule, and the ONE place it is written: a feature that cannot run yet is one line. */
  function collapsedByDefault(r) { return r.state === 'locked' || r.state === 'excluded'; }
  function isCollapsed(r) {
    var p = collapseRead();
    if (p.open[r.id]) return false;
    if (p.closed[r.id]) return true;
    return collapsedByDefault(r);
  }
  T.collapsed = function (id) { var rows = explainForView(); for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return isCollapsed(rows[i]); return null; };
  T.collapsePrefs = function () { var p = collapseRead(); return { open: Object.keys(p.open), closed: Object.keys(p.closed) }; };
  /** Set one block. `null` puts it back on the default, which is what keeps the store small. */
  T.setCollapsed = function (id, on) {
    var rows = explainForView(), r = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) r = rows[i];
    if (!r) throw new Error('no feature row "' + id + '"');
    var p = collapseRead();
    delete p.open[id]; delete p.closed[id];
    if (on !== null && on !== undefined && !!on !== collapsedByDefault(r)) (!!on ? p.closed : p.open)[id] = true;
    collapseWrite();
    return isCollapsed(r);
  };
  /** Expand all / collapse all — every block the view is showing, defaults included. */
  T.setCollapsedAll = function (on) {
    var rows = explainForView(), p = collapseRead(), n = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      delete p.open[r.id]; delete p.closed[r.id];
      if (!!on !== collapsedByDefault(r)) (!!on ? p.closed : p.open)[r.id] = true;
      n++;
    }
    collapseWrite();
    return n;
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
          saved: savedPolicyOf(f), runtime: f.policyRuntime, base: f.policy0, escalated: watchPolicy(f),
          strategy: pp ? pp.id : null, params: pp ? Object.assign({}, pp.params) : null,
          modifier: pp && pp.modifier ? { id: pp.modifier.id, params: Object.assign({}, pp.modifier.params) } : null },
        stall: T.stallState(f.id),
        // V3: the stall watch's row for this feature — `null` when the watch is off, so a run without it renders
        // exactly the rows it rendered before.
        escalation: escalationOf(f),
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
        policy: { inForce: null, table: null, derived: null, alternatives: [], saved: null, runtime: null, base: null, escalated: null, strategy: null, params: null, modifier: null },
        stall: null, escalation: null,
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
  // ⚠ V1's word was "Read-only." — V2 is the slice that stopped it being true.
  var ADV_INTRO = 'What each feature decided on the last tick it was asked, and why — and the strategy it decides by, which you can change here.';
  var PROG_INTRO = 'Everything this session has held for the first time, newest first — an unlock, an upgrade, a milestone, an achievement, a challenge completion or a buyable past its own best. Re-buying what a reset took away is not progress, which is what makes a stall visible.';
  // ⚠ THE PLAYER'S WORDS FOR THE SIX KINDS, and the only place they are written. The IDs beside them are the GAME's own.
  var PROG_LABEL = { unlocked: 'unlocked', upg: 'upgrade', ms: 'milestone', ach: 'achievement', ch: 'challenge', buy: 'buyable' };
  // ⚠ ONE BLOCK PER FEATURE, NOT A WIDE TABLE — it has to read at 390 px with no horizontal scroll, and under
  // `?mobile=1` the layer list draws this tab through its own reader, which skips a `display-text` entirely. So the
  // layout is ordinary flow with `overflow-wrap`, no column widths and no element wider than its parent.
  function chip(text, bg) { return '<span style="display:inline-block;padding:0 6px;border-radius:3px;background:' + bg + ';color:#fff;font-size:.8em;vertical-align:middle">' + esc(text) + '</span>'; }
  var STATE_BG = { on: '#4f9a6a', off: '#3d6f91', armed: '#8a6d3b', locked: '#666666', excluded: '#5a4a4a' };
  // A feature that cannot run yet is ONE LINE. There are 78 of them on ptr at a fresh save and 3 that are doing
  // anything; a full block each would bury the three.
  // ⚠ IT IS NO LONGER ONLY FOR `locked` / `excluded` (V3 Part 3): the player can collapse any block, so the state
  // word is the ROW's rather than one of two literals, and the two things that must stay visible while collapsed say
  // so on the one line — an ESCALATED feature (the watch changed what it decides by, and the player has to be able
  // to see that without opening 59 blocks) and a NEVER-FIRED one (the flag exists because every individual reason
  // looks reasonable while the feature is dead).
  function collapsedBlock(r) {
    var bits = '';
    if (r.policy && r.policy.escalated) bits += ' ' + chip('ESCALATED', '#a06a3e');
    if (r.neverFired) bits += ' <span style="color:#c08a3e">⚠ never fired</span>';
    return '<div class="tmtl-collapsed" style="opacity:' + (r.state === 'on' ? '.85' : '.6') + ';padding:2px 0;text-align:left">' + esc(r.title) + ' <span style="opacity:.6;font-size:.85em">' + esc(r.id) + '</span> — '
      + chip(r.state.toUpperCase(), STATE_BG[r.state]) + bits + ' <span style="font-size:.9em">' + esc(r.last ? r.last.text : '') + '</span></div>';
  }
  function featureBlock(r) {
    var p = r.policy, bits = [];
    // ⚠ the table's entry and the generic derivation's shown BESIDE what is in force, and only when they DIFFER —
    // survey §4.5. Equal values side by side is noise; a difference is the whole reason the table has that row.
    bits.push('<b>' + esc(p.inForce) + '</b>');
    // V2: an EDITED feature has to READ as edited, with the answer it would go back to beside it — that is what
    // makes "one press returns it to the default" a visible offer rather than a guess.
    if (p.saved) bits.push(chip('EDITED', '#7fb2d9') + ' default ' + esc(p.base));
    if (p.runtime) bits.push(chip('OVERRIDDEN', '#8a6d3b') + ' by a runtime setting');
    // V3: an ESCALATED feature is visibly different from an EDITED one and from an OVERRIDDEN one, and it names the
    // rule it came FROM — the stall watch moved it, so the player's own answer has to stay on screen beside it.
    if (p.escalated) bits.push(chip('ESCALATED', '#a06a3e') + ' by the stall watch · its own rule is ' + esc(r.escalation ? r.escalation.primary : '?'));
    if (p.table !== null && p.table !== p.inForce) bits.push('table says ' + esc(p.table));
    if (p.derived !== null && p.derived !== p.inForce) bits.push('derived would be ' + esc(p.derived));
    if (p.alternatives.length) bits.push('alt ' + p.alternatives.map(esc).join(', '));
    // ⚠ `text-align:left` ON EVERY DIV, not only on the wrappers, and INHERITANCE IS NOT ENOUGH — measured: the
    // block's own child divs compute `center` with no inline style of their own, so a game's stylesheet is
    // targeting them DIRECTLY and beating what they would have inherited. An inline declaration is what wins.
    // (Seen on the first screenshots: the headings read left and every fact inside a block read centred, which is
    // prose, not a list.)
    // ⛔ `class="tmtl-block"`, ADDED IN V3 BECAUSE A GATE WAS MATCHING A STYLE SUBSTRING. `gates-a1 --part 2` and
    // `gates-v1 --part 4` counted feature blocks with `div[style*="border-left"]`, and V3's own stall-watch panel
    // has a left border too — so the count came back ONE too high (7 blocks against 6 feature rows) and the leg went
    // red on a view that was rendering perfectly. Same shape as §18.4 item 9's `Read-only.`: a gate keyed to
    // something that is not the thing it is asking about. The class is what it is asking about.
    var o = ['<div class="tmtl-block" style="border-left:3px solid ' + STATE_BG[r.state] + ';background:rgba(127,178,217,.08);border-radius:4px;padding:6px 8px;margin:0 0 8px 0;text-align:left">'];
    o.push('<div style="text-align:left">' + chip(r.state.toUpperCase(), STATE_BG[r.state]) + ' <b>' + esc(r.title) + '</b> <span style="opacity:.55;font-size:.85em">' + esc(r.id) + '</span></div>');
    o.push('<div style="text-align:left;font-size:.9em;opacity:.85">policy ' + bits.join(' · ') + '</div>');
    if (r.gate) o.push('<div style="text-align:left;font-size:.9em;opacity:.85">gate <code>' + esc(r.gate) + '</code></div>');
    if (r.after && r.after.length) o.push('<div style="text-align:left;font-size:.9em;opacity:.85">after ' + r.after.map(esc).join(', ') + '</div>');
    o.push('<div style="text-align:left;margin-top:3px"><b>now:</b> ' + esc(r.last ? r.last.text : 'nothing decided yet') + '</div>');
    o.push('<div style="text-align:left;font-size:.9em;opacity:.7">acted ' + r.acted + (r.lastActedAt === null ? '' : ' · last at ' + r.lastActedAt + ' s') + (r.eligibleFor === null ? '' : ' · on for ' + r.eligibleFor + ' s') + '</div>');
    if (r.neverFired) o.push('<div style="text-align:left;font-size:.9em;color:#c08a3e">⚠ never fired — on and unlocked this whole time, and it has never acted</div>');
    if (r.escalation && r.escalation.rung) o.push('<div style="text-align:left;font-size:.9em;color:#c08a3e">the stall watch has this feature on rung ' + r.escalation.rung + ' of ' + r.escalation.of
      + ' since ' + r.escalation.since + ' s — it returns to <b>' + esc(r.escalation.primary) + '</b> once progress resumes and holds</div>');
    else if (r.escalation && r.escalation.candidate) o.push('<div style="text-align:left;font-size:.9em;opacity:.7">the stall watch is watching this feature — it is waiting, so a stall would escalate it</div>');
    // ⚠ AUTHOR-WRITTEN TEXT THROUGH `v-html`. Escaped, like every other table string above (`off` reasons, gate
    // predicates) and like the GAME's own layer names and feature titles.
    if (r.provenance) o.push('<div style="text-align:left;font-size:.85em;opacity:.65;font-style:italic;margin-top:3px">' + esc(r.provenance) + '</div>');
    o.push('</div>');
    return o.join('');
  }
  // ---- THE EDITORS (V2 Part 3) — the loader registers its OWN Vue input components ---------------------------------
  // ⚖ CORRECTED MID-SLICE (user, 2026-09-19): the brief's first plan was to build the controls out of `clickable`s,
  // because only 154 of the 171 games register `text-input` and 152 register `drop-down`. The user asked why the
  // engines' inputs could not simply be SUPPLIED, and they can: both engines' `column` / `row` render ANY registered
  // component by NAME (`v-bind:is="item[0]"` with `:layer` and `:data` — ptr `js/components.js:71-73`, something
  // `:60-72`), so a component the LOADER registers appears inside a `tabFormat` exactly like an engine one. That is
  // ONE control family on all 171 games instead of a baseline and an enhancement, and it removes the dependency on
  // three components whose behaviour differs by engine version and which `ptr` ITSELF does not have (none of
  // `text-input`, `slider` or `drop-down`).
  //
  // ⛔ `loader/tmt-auto.js` STILL NEVER TOUCHES THE DOM (docs/contract.md). These are component DEFINITIONS handed to
  // the engine's own Vue; Vue does every bit of the rendering. Nothing here queries an element or holds a reference
  // to one, and no file under `games/` changes.
  //
  // ⚠ NAMESPACED (`tmtl-`), so a game's own component can never be shadowed by one of these, nor these by one of
  // its. ⚠ REGISTERED IN AUTOMATION MODE ONLY: this code is below the contract-only early return, so the plain page
  // registers nothing at all — `gates-v2` asserts that.
  var VUE = (function () { try { return new Function('return typeof Vue !== "undefined" ? Vue : null')(); } catch (e) { return null; } })();
  T.vueVersion = VUE && VUE.version ? String(VUE.version) : null;
  T.componentNames = [];

  // ⛔ THE VIEW READS A PER-TICK CACHE OF `explain()`, AND THAT IS A SAFETY PROPERTY, NOT AN OPTIMISATION.
  // A Vue computed that WRITES a reactive property re-triggers itself. `explain()` formats numbers through the
  // game's own `format()` inside `withoutRaisingNaN`, which RESTORES `player.hasNaN` to false when the formatter
  // raised it — a reactive write. On a game whose values make the formatter raise it (measured on `arctree` in V1's
  // roster leg, where the GAME raises it on every `updateTemp()`), render → write → render is a loop. One shared
  // answer per tick bounds that to a single extra render, and it also means the header's `display-text` and the
  // component below do not each pay for a full explain().
  // ⛔⛔ AND THE REFRESH POINT IS `updateTemp()`, NOT THE CLOCK — MEASURED, after the first cut keyed the cache on
  // `(ticks, timePlayed, editGen)` and `gates-a1 --part 2` went red on BOTH engines. That leg pokes
  // `tmtLoader.autoProvenance` directly and redraws; with a clock-keyed cache the poke changed nothing the key
  // could see, the view kept the previous answer, and on a PAUSED page it would have kept it for ever. A cache
  // whose only invalidation is the game clock is stale by construction for every out-of-band change there is.
  // The header's `display-text` runs inside `updateTemp()` — which is exactly "the view is being rebuilt" — so IT
  // recomputes and the component reuses that answer. A Vue re-render does NOT call `updateTemp`, so the render →
  // reactive-write → render loop is still bounded by one shared answer per redraw, which is the whole reason the
  // cache exists (see above).
  // ⚠ An EDIT invalidates immediately as well, because a page under `?managed=1` does not redraw on its own.
  var viewCache = { rows: null };
  var editGen = 0;
  function explainForView(fresh) {
    if (fresh || viewCache.rows === null) viewCache.rows = T.explain();
    return viewCache.rows;
  }
  function invalidateView() { viewCache.rows = null; editGen++; }
  T.invalidateView = invalidateView;
  // ⛔⛔ AND THE COMPONENT NEEDS A REACTIVE DEPENDENCY THAT IS NOT THE CLOCK. MEASURED, and it is the second half
  // of the same defect: refreshing the cache inside `updateTemp()` is not enough, because Vue only re-renders a
  // computed whose REACTIVE inputs changed — and on a PAUSED page `player.timePlayed` never moves, so the tab kept
  // showing the previous rows however fresh the cache was. `gates-a1 --part 2`'s XSS leg pokes
  // `tmtLoader.autoProvenance` and redraws with no tick at all, and stayed red through the cache fix alone.
  // `tmp` IS in the engines' Vue data and is NOT in `stateJSON` (which serialises `player`), so a counter there is
  // reactive and cannot move a hash. The au layer declares it as a plain function; both engines' `updateTempData`
  // evaluate a layer-level function into `tmp` on every redraw, which is exactly the cadence the view wants.
  // ⚠ It returns a CONSTANT while the Advanced view is off screen, so a tab nobody is looking at churns nothing.
  var viewGen = 0;
  function auViewGen() { return advancedShown() ? ++viewGen : 0; }

  // ---- the read-only half: V1's blocks, unchanged, exposed so a component can render one -------------------------
  function advancedHeaderHTML() {
    if (!advancedShown()) return '';
    var rows = explainForView(true);   // the redraw IS the refresh point — see explainForView
    var running = 0, never = 0, edited = 0, escalated = 0;
    for (var i = 0; i < rows.length; i++) { if (rows[i].state === 'on') running++; if (rows[i].neverFired) never++; if (rows[i].policy && rows[i].policy.saved) edited++; if (rows[i].policy && rows[i].policy.escalated) escalated++; }
    return '<div style="text-align:left;max-width:100%;overflow-wrap:anywhere;word-break:break-word">'
      + '<div style="opacity:.75;font-size:.9em;margin-bottom:6px;text-align:left">' + esc(ADV_INTRO) + '</div>'
      + '<div style="margin-bottom:4px;text-align:left">Profile <b>' + esc(T.profileName) + '</b> · ' + running + ' of ' + rows.length + ' running'
      + (never ? ' · <b style="color:#c08a3e">' + never + ' never fired</b>' : '')
      + (edited ? ' · <b style="color:#7fb2d9">' + edited + ' edited</b>' : '')
      + (escalated ? ' · <b style="color:#a06a3e">' + escalated + ' escalated</b>' : '') + '</div></div>';
  }
  T.advancedHTML = advancedHeaderHTML;
  // ⚠ THE CALLER DECIDES (V3 Part 3). Until V3 the choice was the STATE's alone; now it is the player's, held
  // component-side and defaulting to the state's answer — so this function takes the flag rather than deciding.
  // ⛑ The one-argument call still behaves exactly as it did, which is what keeps every other consumer working.
  T.featureBlockHTML = function (r, collapsed) { return (collapsed === undefined ? (r.state === 'locked' || r.state === 'excluded') : !!collapsed) ? collapsedBlock(r) : featureBlock(r); };
  T.advancedRows = explainForView;

  // ---- the components ---------------------------------------------------------------------------------------------
  // ⚠ TRAP (i) — THE GAME'S HOTKEYS. Both engines listen on `document.onkeydown` and act on a bare letter, so typing
  // `p` into a field would PRESTIGE on ptr. Measured, in each engine's own words: ptr `js/utils.js:997-1012` and
  // something `js/utils.js:308-322` BOTH carry `if (onFocused) return` and both define a global `focused(x)` — the
  // brief said 2.2.1 has no such guard and that is wrong; what 2.2.1 lacks is a `text-input` COMPONENT that CALLS
  // it. So this component does both, and the first one is the load-bearing half: every key event is stopped at the
  // input (the game's handler is on an ANCESTOR, so it never sees the event), and `focused(true/false)` is called
  // where the game defines it, which is what its own input does. A fork that defines neither still cannot fire a
  // hotkey, because the event never reaches the document.
  function setFocused(on) { try { var f = new Function('return typeof focused === "function" ? focused : null')(); if (f) f(!!on); } catch (e) { /* a fork without it */ } }
  // ⚖ THE CONTROLS WEAR THE GAME'S OWN THEME (user, 2026-09-19: *"update the new edit, drop-down, and button
  // controls to fit better with a dark theme — light text on a dark background"*). An `<input>`, a `<select>` and a
  // `<button>` come with the BROWSER's colours — black on white — which is exactly wrong against a dark tree and
  // was what the first screenshots showed.
  // ⛔ AND THE COLOURS ARE THE GAME'S, NOT DARK ONES OF OUR OWN. Both engines paint the page from two CSS custom
  // properties the THEME sets — `--color` and `--background` (ptr `style.css:16-20`) — and those are what the tab's
  // own text is already inheriting. Censused over `games/`: **all 171 of 171 define both**. So the controls take
  // `color: var(--color)` and a surface derived from `var(--background)`, which gives light-on-dark on a dark theme
  // and dark-on-light on a light one, from ONE rule and with no theme sniffing anywhere (⚖ minimize hardcoding).
  // The literals after the commas are the fallback for a fork that somehow defines neither, and they are the
  // engines' own default theme values.
  var THEMED = 'color:var(--color,#dfdfdf);background-color:var(--background,#0f0f0f)';
  // ⚠ `color-scheme: dark` is what stops the BROWSER from drawing its own light chrome inside the control — the
  // select's arrow, the field's caret and selection, the focus ring. Setting the background alone leaves a white
  // arrow well on a dark field, which is the half-fix that looks worse than no fix.
  var CONTROL = THEMED + ';color-scheme:dark;border:1px solid rgba(127,178,217,.45);border-radius:3px';
  var FIELD_STYLE = CONTROL + ';width:7.5em;max-width:40vw;margin:0 3px;padding:1px 4px;font-family:inherit;font-size:.9em';
  var SELECT_STYLE = CONTROL + ';max-width:min(100%,22em);padding:1px 4px;font-family:inherit;font-size:.9em';
  var BTN_STYLE = CONTROL + ';margin:0 1px;padding:1px 6px;font-family:inherit;font-size:.9em;cursor:pointer';

  var COMPONENTS = {
    // ONE parameter. `data` = {fid, which, name, value, label, type, min, max} plus, since V3, an optional TARGET:
    //   · nothing        → the feature's saved policy (`setSavedParam`) — V2's behaviour, unchanged
    //   · `rung: <n>`    → that escalation rung's own parameter (`setEscalationParam`)
    //   · `watch: true`  → one of the stall watch's three settings (`setWatchOption`)
    // ⛔ ONE COMPONENT, NOT THREE. Everything that makes this field correct is in it — trap (ii)'s draft that survives
    // the per-tick re-render, trap (i)'s hotkey guard, the per-type step rule and the clamp to the row's own bounds —
    // and a second copy of it for rungs would be a second place for each of those to be got wrong.
    // ⚠ TRAP (ii) — RE-RENDER WHILE TYPING. The Advanced tab re-renders on every tick, so a field bound straight to
    // the saved value would have a half-typed `1e` parsed out from under the caret. The field is bound to LOCAL
    // state and commits on change / Enter / blur; the watcher refuses to overwrite the draft while the field has
    // focus, which is the other half of the same rule.
    'tmtl-number': {
      props: ['data'],
      data: function () { return { draft: String(this.data.value), editing: false, error: null }; },
      watch: { 'data.value': function (v) { if (!this.editing) { this.draft = String(v); this.error = null; } } },
      methods: {
        onFocus: function () { this.editing = true; setFocused(true); },
        onBlur: function () { this.commit(); this.editing = false; setFocused(false); },
        onKey: function (e) { if (e.key === 'Enter') this.commit(); else if (e.key === 'Escape') { this.draft = String(this.data.value); this.error = null; } },
        write: function (v) {
          var d = this.data;
          if (d.watch) return T.setWatchOption(d.name, v);
          if (d.rung) return T.setEscalationParam(d.fid, d.rung, d.name, v, d.which);
          return T.setSavedParam(d.fid, d.name, v, d.which);
        },
        commit: function () {
          if (this.draft === String(this.data.value)) { this.error = null; return; }
          var r = this.write(this.draft);
          this.error = r.ok ? null : r.error;
          if (r.ok) this.draft = String(this.data.value);
        },
        // ⚠ A STEP IS CLAMPED TO THE PARAMETER'S OWN BOUNDS, so the buttons can never hand the validator a value it
        // is about to refuse: one press below a minimum would otherwise show an error the player did not type.
        // The step RULE is per type, because one rule cannot serve a count, a number of seconds and a quantity that
        // may be 1e600: ±1 for a count, ±0.05 for a fraction, ×1.5 (+0.5) for a number, and ×2 for a quantity.
        step: function (dir) {
          var v = this.data.value, t = this.data.type, next, lo = this.data.min, hi = this.data.max;
          var clamp = function (x) {
            if (lo !== null && lo !== undefined && x < Number(lo)) x = Number(lo);
            if (hi !== null && hi !== undefined && x > Number(hi)) x = Number(hi);
            return Math.round(x * 1e6) / 1e6;
          };
          if (t === 'quantity') { try { next = String(dir > 0 ? D(v).times(2) : D(v).div(2)); } catch (e) { next = v; } }
          else if (t === 'count') next = String(clamp(Math.round(Number(v)) + dir));
          else if (t === 'fraction') next = String(clamp(Number(v) + dir * 0.05));
          else next = String(clamp(Number(v) * (dir > 0 ? 1.5 : 1 / 1.5) + dir * 0.5));
          var r = this.write(next);
          this.error = r.ok ? null : r.error;
          if (r.ok) this.draft = String(this.data.value);
        },
      },
      template: '<span style="display:inline-block;text-align:left;margin:2px 8px 2px 0;white-space:nowrap">'
        + '<span style="opacity:.75;font-size:.85em">{{ data.label }}</span>'
        // ⚠ `data-fid` / `data-param` are how a GATE points at ONE feature's field. The first cut of `gates-v2`
        // located `input.tmtl-input` with `.first()` and typed into whichever feature happened to be drawn first,
        // then reported that the value had not committed — the leg was measuring the wrong block.
        + '<input type="text" class="tmtl-input" :data-fid="data.fid" :data-param="data.which + \':\' + data.name" :data-rung="data.rung || 0"'
        + ' :value="draft" :title="data.label" style="' + FIELD_STYLE + '"'
        + ' @input="draft = $event.target.value" @change="commit" @focus="onFocus" @blur="onBlur"'
        + ' @keydown.stop="onKey" @keyup.stop @keypress.stop>'
        + '<button type="button" style="' + BTN_STYLE + '" @click="step(-1)" @keydown.stop>&minus;</button>'
        + '<button type="button" style="' + BTN_STYLE + '" @click="step(1)" @keydown.stop>+</button>'
        + '<span v-if="error" class="tmtl-error" style="color:#d07a7a;font-size:.85em;display:block;white-space:normal">{{ error }}</span>'
        + '</span>',
    },
    // The STRATEGY PICKER. `data` = {fid, value, options: [{id, label, help, available, why}]} and, since V3, an
    // optional `rung: <n>` — the same picker editing one escalation rung instead of the policy in force.
    // ⚠ An unavailable strategy is SHOWN, disabled, with the reason in its own label — `gain>=Nx` can never fire on
    // a static layer (plan §14d.5), and a picker that silently omitted it would leave the player wondering.
    'tmtl-select': {
      props: ['data'],
      data: function () { return { error: null }; },
      methods: {
        onChange: function (e) {
          var r = this.data.rung ? T.setEscalationStrategy(this.data.fid, this.data.rung, e.target.value)
            : T.setSavedStrategy(this.data.fid, e.target.value);
          this.error = r.ok ? null : r.error;
        },
      },
      template: '<span style="display:inline-block;text-align:left">'
        + '<select class="tmtl-select" :data-fid="data.fid" :data-rung="data.rung || 0" :value="data.value" style="' + SELECT_STYLE + '"'
        + ' @change="onChange" @keydown.stop @keyup.stop>'
        + '<option v-for="o in data.options" :value="o.id" :disabled="!o.available">{{ o.label }}{{ o.available ? \'\' : \' — \' + o.why }}</option>'
        + '</select>'
        + '<span v-if="error" class="tmtl-error" style="color:#d07a7a;font-size:.85em;display:block">{{ error }}</span>'
        + '</span>',
    },
    // ONE feature: V1's read-only block, then the picker, the modifier switch and one editor per parameter.
    'tmtl-feature': {
      props: ['data'],
      computed: {
        r: function () { return this.data.row; },
        // ⚠ THE COLLAPSE FLAG IS A PROP, HELD BY `tmtl-editors` — see TRAP (ii) there. This component only renders it.
        html: function () { return T.featureBlockHTML(this.data.row, this.data.collapsed); },
        editable: function () { var r = this.data.row; return !this.data.collapsed && r.state !== 'excluded' && r.state !== 'locked'; },
        rungs: function () {
          var r = this.data.row, e = r.escalation, out = [];
          if (!e) return out;
          for (var i = 1; i <= e.list.length; i++) {
            var c = T.rungChoices(r.id, i);
            if (!c) continue;
            var fields = [], add = function (which, id, params) {
              var all = which === 'modifier' ? T.modifiers(r.kind) : T.strategies(r.kind), S = null;
              for (var j = 0; j < all.length; j++) if (all[j].id === id) S = all[j];
              if (!S) return;
              for (var k = 0; k < S.params.length; k++) {
                var pp = S.params[k];
                fields.push({ key: i + ':' + which + ':' + pp.name, fid: r.id, rung: i, which: which, name: pp.name, type: pp.type,
                  label: pp.label, min: pp.min, max: pp.max, value: (params && params[pp.name] !== undefined) ? params[pp.name] : pp.default });
              }
            };
            if (c.strategy) add('primary', c.strategy, c.params);
            if (c.modifier) add('modifier', c.modifier.id, c.modifier.params);
            out.push({ key: r.id + '#' + i, n: i, picker: { fid: r.id, rung: i, value: c.strategy, options: c.options }, fields: fields, on: e.rung === i, policy: c.policy });
          }
          return out;
        },
        esc: function () { return this.data.row.escalation; },
        picker: function () {
          var r = this.data.row;
          return { fid: r.id, kind: r.kind, value: r.policy.strategy, options: T.strategyChoices(r.id) };
        },
        fields: function () {
          var r = this.data.row, out = [], i;
          var add = function (which, id, params) {
            var S = null, all = which === 'modifier' ? T.modifiers(r.kind) : T.strategies(r.kind);
            for (var j = 0; j < all.length; j++) if (all[j].id === id) S = all[j];
            if (!S) return;
            for (var k = 0; k < S.params.length; k++) {
              var p = S.params[k];
              out.push({ key: which + ':' + p.name, fid: r.id, which: which, name: p.name, type: p.type,
                label: p.label, min: p.min, max: p.max,
                value: (params && params[p.name] !== undefined) ? params[p.name] : p.default });
            }
          };
          if (r.policy.strategy) add('primary', r.policy.strategy, r.policy.params);
          if (r.policy.modifier) add('modifier', r.policy.modifier.id, r.policy.modifier.params);
          return out;
        },
        mods: function () { return T.modifiers(this.data.row.kind); },
        modOn: function () { return !!this.data.row.policy.modifier; },
        edited: function () { return !!this.data.row.policy.saved; },
      },
      methods: {
        toggleMod: function () { T.setSavedModifier(this.data.row.id, this.modOn ? null : this.mods[0].id); },
        toDefault: function () { T.setSavedPolicy(this.data.row.id, null); },
        toggleOpen: function () { this.$emit('toggle', this.data.row.id); },
        addRung: function () { var r = T.addEscalationRung(this.data.row.id); this.rungError = r.ok ? null : r.error; },
        dropRung: function (n) { var r = T.removeEscalationRung(this.data.row.id, n); this.rungError = r.ok ? null : r.error; },
        moveRung: function (n, d) { var r = T.moveEscalationRung(this.data.row.id, n, d); this.rungError = r.ok ? null : r.error; },
        listToDefault: function () { T.setEscalation(this.data.row.id, null); this.rungError = null; },
      },
      data: function () { return { rungError: null }; },
      template: '<div style="text-align:left">'
        + '<h3 v-if="data.head" style="margin:14px 0 4px 0;text-align:left">{{ data.layerName }} <span style="opacity:.5;font-size:.7em">{{ data.row.layer }}</span></h3>'
        // ⚖ Q1: every block collapses, one press each. The chevron is BESIDE the block rather than inside the HTML,
        // because the block is a `v-html` string and a handler cannot live in one.
        + '<div style="display:flex;align-items:flex-start;gap:4px;text-align:left">'
        +   '<button type="button" class="tmtl-fold" :data-fid="data.row.id" :data-open="data.collapsed ? 0 : 1"'
        +   ' :title="data.collapsed ? \'show this feature\' : \'collapse this feature\'" style="' + BTN_STYLE + ';flex:0 0 auto;margin-top:2px"'
        +   ' @click="toggleOpen" @keydown.stop>{{ data.collapsed ? \'+\' : \'\\u2212\' }}</button>'
        +   '<div style="flex:1 1 auto;min-width:0" v-html="html"></div>'
        + '</div>'
        + '<div v-if="editable" style="text-align:left;margin:-6px 0 10px 0;padding:0 0 0 11px">'
        +   '<div style="text-align:left;margin-bottom:2px">'
        +     '<span style="opacity:.75;font-size:.85em;margin-right:4px">strategy</span>'
        +     '<tmtl-select :data="picker"></tmtl-select>'
        +     '<button v-if="edited" type="button" class="tmtl-default" :data-fid="data.row.id" style="' + BTN_STYLE + ';margin-left:6px" @click="toDefault" @keydown.stop>use the default</button>'
        +   '</div>'
        +   '<div v-if="fields.length" style="text-align:left">'
        +     '<tmtl-number v-for="f in fields" :key="f.key" :data="f"></tmtl-number>'
        +   '</div>'
        +   '<div v-if="mods.length" style="text-align:left;font-size:.9em">'
        +     '<button type="button" class="tmtl-mod" :data-fid="data.row.id" style="' + BTN_STYLE + '" @click="toggleMod" @keydown.stop>{{ modOn ? \'remove the stall fallback\' : \'add the stall fallback\' }}</button>'
        +     '<span v-if="data.row.stall && data.row.stall.why" style="opacity:.7;margin-left:6px">{{ data.row.stall.why }}</span>'
        +     '<span v-else-if="data.row.stall" style="opacity:.7;margin-left:6px">typical {{ data.row.stall.typical }} s over {{ data.row.stall.remembered }} own-rule reset(s) · {{ data.row.stall.elapsed }} s of {{ data.row.stall.need }} s</span>'
        +   '</div>'
        // ---- the ESCALATION LIST (V3): the rungs the stall watch would try, in order ------------------------------
        +   '<div v-if="esc" class="tmtl-esc" :data-fid="data.row.id" style="text-align:left;font-size:.9em;margin-top:4px;border-top:1px dashed rgba(127,178,217,.35);padding-top:3px">'
        +     '<div style="opacity:.75">if the game stalls, try in order <span v-if="!esc.typed" style="opacity:.7">(derived — nothing typed here yet)</span>'
        +       '<button v-if="esc.typed" type="button" class="tmtl-esc-default" :data-fid="data.row.id" style="' + BTN_STYLE + ';margin-left:6px" @click="listToDefault" @keydown.stop>use the derived list</button>'
        +     '</div>'
        +     '<div v-for="g in rungs" :key="g.key" class="tmtl-rung" :data-fid="data.row.id" :data-rung="g.n" style="text-align:left;padding:1px 0">'
        +       '<span :style="g.on ? \'color:#c08a3e;font-weight:bold\' : \'opacity:.7\'">{{ g.n }}.</span> '
        +       '<tmtl-select :data="g.picker"></tmtl-select>'
        // ⚠ `data-fid` / `data-rung` ON THE BUTTON ITSELF, not only on the row that contains it — V2 §Part 4's rule,
        // and the first cut of `gates-v3 --part 5` timed out on exactly this: the attributes were on the wrapper and
        // `button.tmtl-rung-del[data-fid=…]` matched nothing while five such buttons were on screen.
        +       '<button type="button" class="tmtl-rung-up" :data-fid="data.row.id" :data-rung="g.n" style="' + BTN_STYLE + '" title="earlier" @click="moveRung(g.n, -1)" @keydown.stop>\u2191</button>'
        +       '<button type="button" class="tmtl-rung-down" :data-fid="data.row.id" :data-rung="g.n" style="' + BTN_STYLE + '" title="later" @click="moveRung(g.n, 1)" @keydown.stop>\u2193</button>'
        +       '<button type="button" class="tmtl-rung-del" :data-fid="data.row.id" :data-rung="g.n" style="' + BTN_STYLE + '" title="remove this rung" @click="dropRung(g.n)" @keydown.stop>\u00d7</button>'
        +       '<span v-if="g.on" style="color:#c08a3e;margin-left:4px">\u25c0 in force now</span>'
        +       '<div v-if="g.fields.length" style="text-align:left"><tmtl-number v-for="f in g.fields" :key="f.key" :data="f"></tmtl-number></div>'
        +     '</div>'
        +     '<div v-if="!rungs.length" style="opacity:.7">nothing \u2014 this feature is never escalated</div>'
        +     '<button type="button" class="tmtl-rung-add" :data-fid="data.row.id" style="' + BTN_STYLE + '" @click="addRung" @keydown.stop>add a rung</button>'
        +     '<span v-if="rungError" class="tmtl-error" style="color:#d07a7a;margin-left:6px">{{ rungError }}</span>'
        +   '</div>'
        + '</div></div>',
    },
    // ---- THE STALL WATCH's own controls (V3) ------------------------------------------------------------------------
    // ⚠ IT IS A COMPONENT, NOT PART OF THE HEADER STRING. The header is a `display-text` function — that is where V1's
    // lazy guard lives and `gates-v1 --part 3p` measures it — and a string cannot carry a click handler.
    'tmtl-watch': {
      props: ['data'],
      computed: {
        w: function () { return this.data.watch; },
        fields: function () {
          var o = this.data.watch.options, out = [];
          var ps = T.watchParams();
          for (var i = 0; i < ps.length; i++) out.push({ key: 'w:' + ps[i].name, watch: true, fid: null, which: 'watch', name: ps[i].name,
            type: ps[i].type, label: ps[i].label, min: ps[i].min, max: ps[i].max, value: o[ps[i].name] });
          return out;
        },
      },
      methods: {
        toggleWatch: function () { var r = T.setWatchOption('watch', !this.data.watch.on); this.error = r.ok ? null : r.error; },
        toggleTrack: function () { var r = T.setWatchOption('track', !this.data.watch.options.saved.track); this.error = r.ok ? null : r.error; },
      },
      data: function () { return { error: null }; },
      template: '<div class="tmtl-watch" style="text-align:left;margin:0 0 8px 0;padding:4px 6px;border-left:3px solid #a06a3e;background:rgba(160,106,62,.1);border-radius:4px">'
        + '<div style="text-align:left">'
        +   '<button type="button" class="tmtl-watch-toggle" :data-on="w.on ? 1 : 0" style="' + BTN_STYLE + '" @click="toggleWatch" @keydown.stop>{{ w.on ? \'the stall watch is ON\' : \'the stall watch is off\' }}</button>'
        +   '<button v-if="!w.on" type="button" class="tmtl-track-toggle" :data-on="w.options.saved.track ? 1 : 0" style="' + BTN_STYLE + ';margin-left:4px" @click="toggleTrack" @keydown.stop>{{ w.options.saved.track ? \'progress tracker ON\' : \'progress tracker off\' }}</button>'
        +   '<span style="opacity:.8;margin-left:6px">{{ w.text }}</span>'
        + '</div>'
        + '<div v-if="w.on" style="text-align:left"><tmtl-number v-for="f in fields" :key="f.key" :data="f"></tmtl-number></div>'
        + '<div v-if="w.on && w.escalated.length" style="text-align:left;color:#c08a3e">escalated: <span v-for="e in w.escalated" :key="e.id">{{ e.id }} \u2192 {{ e.policy }} (rung {{ e.rung }} of {{ e.of }}) </span></div>'
        + '<span v-if="error" class="tmtl-error" style="color:#d07a7a;font-size:.85em;display:block">{{ error }}</span>'
        + '</div>',
    },
    // ---- the PROGRESS subtab (V3 Part 1) ---------------------------------------------------------------------------
    // ⚠ IT RENDERS `T.progress()` AND COMPUTES NOTHING OF ITS OWN, which is V1's rule and is why the timeline is
    // testable in Node (`gates-v3 --part 5` compares the rendered rows against the API's).
    // ⚠ THE LABELS ARE THE ENGINE'S OWN. A layer's name comes from `layers[l].name` and an item is named by its own
    // numeric id — this view introduces no second naming scheme for anything the game declares (U7's open question
    // about a prose-name lift is the user's, and nothing here settles it).
    'tmtl-progress': {
      props: ['layer', 'data'],
      computed: {
        p: function () {
          var clock = 0;
          try { clock = tmp[AU].auViewGen; } catch (e) { clock = player.timePlayed; }
          var p = T.progress();
          p.clock = clock;
          p.rows = p.events.map(function (e) {
            var name = e.layer;
            try { name = layers[e.layer] && layers[e.layer].name ? String(layers[e.layer].name) : e.layer; } catch (err) { name = e.layer; }
            return { key: e.key + '@' + e.at, at: e.at, what: PROG_LABEL[e.kind] || e.kind, layerName: name, layer: e.layer, id: e.id, marks: e.marks };
          });
          p.watch = T.watchState();
          return p;
        },
      },
      created: function () { T.requestLadder(); },   // the one place that WANTS the mark names
      methods: { arm: function () { T.setWatchOption('track', true); } },
      template: '<div style="text-align:left;max-width:100%;overflow-wrap:anywhere;word-break:break-word">'
        + '<div style="opacity:.75;font-size:.9em;margin-bottom:6px;text-align:left">' + '' + PROG_INTRO + '</div>'
        + '<div v-if="!p.armed" style="text-align:left">'
        +   '<button type="button" class="tmtl-track-on" style="' + BTN_STYLE + '" @click="arm" @keydown.stop>start tracking progress</button>'
        +   '<span style="opacity:.75;margin-left:6px">nothing is recorded while the tracker is off, and a run that never uses it costs nothing.</span>'
        + '</div>'
        + '<div v-else style="text-align:left">'
        +   '<div style="text-align:left;margin-bottom:4px"><b>{{ p.total }}</b> thing(s) first held in this session'
        +     '<span v-if="p.lastAt !== null"> \u00b7 last progress <b>{{ p.sinceLast }}</b> game-s ago (at {{ p.lastAt }} s)</span>'
        +     '<span v-if="p.typicalGap !== null"> \u00b7 typical gap <b>{{ p.typicalGap }}</b> s over {{ p.gaps.length }}</span>'
        +     '<span v-if="p.skipped"> \u00b7 {{ p.skipped }} stretch(es) not counted (a rescue, or the one before the first event)</span>'
        +     '<span v-if="p.stalled" style="color:#c08a3e"> \u00b7 <b>STALLED</b> (over {{ p.threshold }} s)</span>'
        +   '</div>'
        +   '<div style="text-align:left;font-size:.9em;opacity:.8;margin-bottom:4px">{{ p.watch.text }}</div>'
        +   '<div v-if="p.dropped" style="text-align:left;font-size:.85em;opacity:.7">showing the newest {{ p.cap }} \u2014 {{ p.dropped }} older event(s) are counted above and not listed</div>'
        +   '<div v-for="r in p.rows" :key="r.key" class="tmtl-prog-row" style="text-align:left;padding:1px 0;border-bottom:1px solid rgba(127,178,217,.12)">'
        +     '<span style="opacity:.65;font-size:.85em">{{ r.at }} s</span> '
        +     '<b>{{ r.layerName }}</b> <span style="opacity:.55;font-size:.85em">{{ r.layer }}</span> '
        +     '<span>{{ r.what }}</span><span v-if="r.id !== null"> {{ r.id }}</span>'
        +     '<span v-if="r.marks" style="color:#7fb2d9"> \u2014 {{ r.marks.join(", ") }}</span>'
        +   '</div>'
        +   '<div v-if="!p.rows.length" style="opacity:.7;text-align:left">nothing yet \u2014 the tracker records what the game has not held before, and the save it started from does not count.</div>'
        + '</div></div>',
    },
    // The LIST. One instance for the whole Advanced view, so the input elements keep their identity across ticks.
    'tmtl-editors': {
      props: ['layer', 'data'],
      // ⛔⛔ TRAP (ii), AND THE COLLAPSE MAP IS EXACTLY WHAT IT IS ABOUT. The Advanced tab re-renders every tick, so a
      // fold state held in the rendered HTML string is gone on the next one. It lives HERE, component-side, keyed by
      // feature id, surviving every re-render the way `tmtl-number` holds its draft — and it is SEEDED from
      // `T.storage.raw` once, at `created`, so a reload comes back where the player left it.
      data: function () { return { fold: Object.create(null), gen: 0 }; },
      created: function () {
        var p = T.collapsePrefs();
        for (var i = 0; i < p.open.length; i++) this.fold[p.open[i]] = false;
        for (var j = 0; j < p.closed.length; j++) this.fold[p.closed[j]] = true;
      },
      methods: {
        // ⚠ `gen` is what makes Vue re-render: a key ADDED to a plain object is not reactive in Vue 2 (the same rule
        // that made `armLocked` invisible until V1 seeded it — U6, measured on 22 of the 171 engines).
        toggle: function (id) {
          var now = this.isFolded(id);
          this.fold[id] = !now;
          T.setCollapsed(id, !now);
          this.gen++;
        },
        all: function (on) {
          var rows = T.advancedRows();
          for (var i = 0; i < rows.length; i++) this.fold[rows[i].id] = !!on;
          T.setCollapsedAll(on);
          this.gen++;
        },
        isFolded: function (id) {
          if (this.fold[id] !== undefined) return this.fold[id];
          var c = T.collapsed(id);
          return c === null ? false : c;
        },
      },
      computed: {
        blocks: function () {
          // ⚠ `player.timePlayed` is read on purpose: it is what makes this computed re-evaluate every tick, which
          // is what keeps V1's reason line LIVE. Without a reactive dependency that moves, the view would render
          // once and then sit there.
          // the reactive dependency: `tmp.au.auViewGen` moves on every redraw while this view is on screen, which
          // is what keeps the reason line LIVE and what makes an out-of-band change visible on a paused page.
          var clock = 0;
          try { clock = tmp[AU].auViewGen; } catch (e) { clock = player.timePlayed; }
          var rows = explainForView(), out = [], prev = null, gen = this.gen;
          for (var i = 0; i < rows.length; i++) {
            var l = rows[i].layer;
            var name = l;
            try { name = layers[l] && layers[l].name ? String(layers[l].name) : l; } catch (e) { name = l; }
            out.push({ row: rows[i], head: l !== prev, layerName: name, clock: clock, gen: gen, collapsed: this.isFolded(rows[i].id) });
            prev = l;
          }
          return out;
        },
        watch: function () { return T.watchState(); },
        folded: function () { var b = this.blocks, n = 0; for (var i = 0; i < b.length; i++) if (b[i].collapsed) n++; return n; },
      },
      template: '<div style="text-align:left;max-width:100%;overflow-wrap:anywhere;word-break:break-word">'
        + '<tmtl-watch :data="{watch: watch}"></tmtl-watch>'
        // ⚖ Q1's second half: expand all / collapse all, and they set EVERY block including the ones whose default is
        // the other way — `collapse all` then `expand all` has to be reachable from any state.
        + '<div style="text-align:left;margin-bottom:6px;font-size:.9em">'
        +   '<button type="button" class="tmtl-expand-all" style="' + BTN_STYLE + '" @click="all(false)" @keydown.stop>expand all</button>'
        +   '<button type="button" class="tmtl-collapse-all" style="' + BTN_STYLE + '" @click="all(true)" @keydown.stop>collapse all</button>'
        +   '<span style="opacity:.7;margin-left:6px">{{ folded }} of {{ blocks.length }} collapsed</span>'
        + '</div>'
        + '<tmtl-feature v-for="b in blocks" :key="b.row.id" :data="b" @toggle="toggle"></tmtl-feature>'
        + '</div>',
    },
  };
  if (VUE && typeof VUE.component === 'function') {
    for (var cn in COMPONENTS) { VUE.component(cn, COMPONENTS[cn]); T.componentNames.push(cn); }
  }
  T.componentDefs = function () { var o = {}; for (var k in COMPONENTS) o[k] = true; return o; };

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

  // ⛔ INSTALLED HERE, NOT WHERE `T.tick` IS DEFINED: the tracker lives below the contract-only early return, so a
  // page without `?automation=1` leaves `onTick` null and `T.tick` does exactly what it did before V3.
  onTick = progressTickHook;

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
      // the Advanced view's reactive heartbeat — see `auViewGen` above. NOT game state: it lives in `tmp`.
      auViewGen: auViewGen,
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
      // ⛔ THE HEADER IS STILL A `display-text` FUNCTION, AND THAT IS WHERE THE LAZY GUARD LIVES. ptr's
      // `updateTempData` evaluates every function in the WHOLE `tabFormat` object — both subtabs — whenever the au
      // tab is the open tab (`js/technical/temp.js:96`), so this function is called on every tick of a tab the
      // player may be looking at with `Simple` selected. `advancedHeaderHTML()` returns '' unless `Advanced` is on
      // screen, and `gates-v1 --part 3p` is the PAIRED measurement that says so (0 formats on Simple against
      // thousands with Advanced selected). Removing the guard still reds that leg.
      // ⚠ The blocks themselves are a COMPONENT, not more HTML, because they now contain inputs: a string rebuilt
      // every tick would replace the `<input>` element under the player's caret. Vue keeps one instance per feature
      // (`:key`) and only updates its props, which is the whole reason the editors are components at all.
      Advanced: { content: [
        ['display-text', function () { return advancedHeaderHTML(); }],
        // ⛔ THE BARE STRING FORM, WITH NO `data` — because `['tmtl-editors', null]` PUT A `null` IN THE TAB FORMAT
        // AND FOUR ENGINES CRASH ON IT. MEASURED in CI (`G1 load — automation page`, 4 RED at
        // `onload load(): Cannot read properties of null (reading 'constructor')`): the-necromantree,
        // the-prestige-tree, the-christmas-tree and the-romeo-julliet-tree all walk `tmp` with
        //   `else if ((!!x) && (x.constructor === Object) || (typeof x === "object") && traversable.includes(x.constructor.name))`
        // and `&&` binds tighter than `||`, so a `null` skips the guarded half and reaches `null.constructor` in
        // the UNGUARDED half. `typeof null === "object"` is the whole bug. The engines' `column` accepts a bare
        // component name (`v-if="!Array.isArray(item)"`), which passes no `data` at all and puts no `null`
        // anywhere — and this component never wanted one.
        // ⚠ V1 could not hit this: its Advanced content was `[['display-text', fn]]`, with no null in it.
        'tmtl-editors',
      ] },
      // ⛔ THE THIRD KEY, AND `Simple` STAYS FIRST. Both engines select `Object.keys(tabFormat)[0]` in
      // `getStartPlayer` and repair an old save to it in `fixSave`, so the ORDER here is what decides which subtab a
      // first load shows — and every pinned number was measured with `Simple` on screen. A fourth subtab (the
      // advanced planner's round log, P2) joins the same way; neither of the first two has to move for it.
      // ⚠ THE BARE COMPONENT FORM AGAIN, with no `data`: `['tmtl-progress', null]` would put a `null` into the object
      // four engines walk into `tmp` and kill their `load()` (§18.4 item 11 — `the-necromantree`,
      // `the-prestige-tree`, `the-christmas-tree`, `the-romeo-julliet-tree`; `&&` binds tighter than `||` and
      // `typeof null === "object"`). There is no `null` anywhere in this tab format, and CI's
      // `G1 load — automation page` is what says so over all 171.
      Progress: { content: [
        'tmtl-progress',
      ] },
      },
      automate: auAutomate,
    });
    T.auLayer = AU;
  }

  // Test probe (Part-1 gate): hook every tree layer with no features, so the wrapper-call counter covers every layer.
  if (T.options && T.options.hookAll) for (var hl in layers) if (hl !== AU && layers[hl] && !isNaN(layers[hl].row)) hookLayer(hl);
})();
