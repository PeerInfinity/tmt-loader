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
  // ⛔ V4: A TYPE WHOSE VALIDATOR IS A FUNCTION, NOT A REGEX — §18.9 said this is what `until` would need, and it is.
  // A predicate is a JavaScript EXPRESSION, and "is this a JavaScript expression?" is not a regular language. The
  // check is the only honest one there is: it must COMPILE. Everything else about the editors — the draft that
  // survives the re-render, the refusal that keeps the previous value, the save, the precedence — is already
  // generic over the `type`, which is why this is one table row and not a second editing system.
  function checkPredicate(s) {
    if (!s) return null;   // EMPTY IS A VALUE: it means "no condition", and it is how a player clears one
    try { T.predicate(s); } catch (e) { return 'not a JavaScript expression — ' + String((e && e.message) || e); }
    return null;
  }
  var PARAM_TYPES = {
    count:    { re: '\\d+', kind: 'integer', min: 1 },
    seconds:  { re: NUM,    kind: 'number',  min: 0 },
    factor:   { re: NUM,    kind: 'number',  min: 0 },
    quantity: { re: DEC,    kind: 'decimal', min: 0 },
    fraction: { re: NUM,    kind: 'number',  min: 0, max: 1 },
    // ⚠ `re: null` — and `patternOf` REFUSES it in a strategy template, loudly. A predicate can contain `|`, which
    // is the MODIFIER separator, and any bracket or quote there is; a policy string is a grammar and a predicate is
    // not a token of it. This type exists for the per-feature CONTROLS below, which are their own fields.
    predicate:{ re: null,   kind: 'text',    check: checkPredicate },
  };
  var STRATEGIES = [
    // --- reset -----------------------------------------------------------------------------------------------------
    // ⚠ R3a, PART 3 — THE ROW'S OWN HELP NOW SAYS WHAT `always` COSTS, because a player can pick it from the
    // picker and the cost is invisible from the row. MEASURED TWICE on PTR (plan §27.12 item 3, the user hit it by
    // hand, and §30's sweep): `reset:h` at `always` ends with 38 of its own resource and every quirk FROZEN at 10,
    // `reset:q` reading "Cannot reset — 1.42e336 of 1.00e512" for the rest of the run. Both layers are row 3 and
    // both draw on row 2, `h`'s requirement is fixed and cheap while `q`'s is neither — so the cheap reset takes the
    // shared input away again long before the dear one can ever meet its own. The wording names no layer and no
    // game: it is the general shape, and it is the second instance of it this arc has met (§27.6 is the first).
    { kind: 'reset', template: 'always', label: 'Always',
      help: 'Reset the moment the game allows it. ⚠ Where this reset also wipes what a SIBLING layer is still accumulating, the layer with the cheaper requirement starves the one with the dearer — it takes the shared input away again long before the slower layer can meet its own requirement.' },
    { kind: 'reset', template: 'gain>={n}', label: 'Gain at least N', help: 'Wait until the reset would yield at least this much of the layer’s own resource.',
      params: [{ name: 'n', type: 'quantity', placeholder: 'N', default: '1', label: 'gain at least' }],
      progress: function (f, v) { return ratio(v && v.gain, v && v.need); } },
    { kind: 'reset', template: 'gain>={n}x', label: 'Gain at least N× what is held', help: 'Wait until the reset would yield at least this multiple of what the layer already holds.',
      params: [{ name: 'n', type: 'factor', placeholder: 'N', default: '2', label: 'multiple of what is held' }],
      layerTypes: ['normal', 'custom'], why: 'a static layer gains 1 per reset, so a multiple of what it already holds can never be reached (plan §14d.5)',
      progress: function (f, v) { return ratio(v && v.gain, v && v.need); } },
    // ⛔ R2: THE EMPTY-PURSE SIBLING OF THE ROW ABOVE, AND THE REASON IT EXISTS IS A DEFECT IN THAT ROW.
    // `gain>=Nx` reads `resetGain >= N × player[l].points`. When the layer holds NOTHING the right-hand side is
    // `N × 0 = 0`, so the rule is `gain >= 0` — it is `always`, and it fires on the FIRST tick the engine allows a
    // reset. That is not a small edge case: a layer holds nothing before its first reset (which is what UNLOCKS it)
    // and again after every reset of a higher row, so on PTR the shipped `gain>=2x` unlocked `q` the instant one
    // quirk was available and let a row-3 reset wipe row 2 before row 2 was done (plan §23, measured).
    // ⚖ 13d.2 asks what a reset is FOR. A MULTIPLE of nothing is not a target; N of the layer's own resource is, and
    // it is the same N the player already chose — no second literal, and identical to `gain>=Nx` at every purse of
    // one unit or more (`N × max(held, 1)`), so the only behaviour it changes is the one that had no content.
    { kind: 'reset', template: 'gain>={n}x-unit', label: 'Gain at least N× what is held (N when it holds none)',
      help: 'As “gain at least N× what is held”, except that while the layer holds less than one of its own resource the reset waits for N of it — a multiple of nothing is no condition at all.',
      params: [{ name: 'n', type: 'factor', placeholder: 'N', default: '2', label: 'multiple of what is held, or of one unit' }],
      layerTypes: ['normal', 'custom'], why: 'a static layer gains 1 per reset, so a multiple of what it already holds (or of one unit, when it holds none) can never be reached (plan §14d.5)',
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
  // ---- R3b-2: THE DEAD-MEMBER RULE — a turn releases when its holder stops getting CLOSER ---------------------------
  // ⛔ THE DEFECT THIS EXISTS FOR, MEASURED (plan §32.4, §33 row (f), and reproduced by this slice from
  // `all/M21.json` with the guard off): PTR's row 3 has FOUR active reset members once `h` unlocks — `h, q, o, ss` —
  // and the rotation reaching `o` FREEZES THE ROW. The trace is unambiguous: from 28950 on, `o` holds the turn with
  // `tmp.o.baseAmount` FLAT at 5 of 14 Super Boosters and `tmp.ss.baseAmount` flat at 17 of 28, for 1,100+ game-
  // seconds and still counting, while `h` (4.4e33 of 1e30) and `q` both read `canReset === true` and cannot act.
  // The guard `K× the usual wait between this layer's resets` is blind to it by construction: `o` has never reset,
  // so it has no interval of its own and therefore NO BOUND AT ALL (the pooled fallback was measured starving `h`,
  // plan §32.1 item 2). The working arrangement carried `exclude=reset:o,reset:ss` — an override naming two layers,
  // which is the thing the loader is not allowed to know.
  //
  // ⛔ AND THE PREMISE THE PLAN HANDED THIS RULE IS WRONG IN ITS DETAIL — MEASURED BEFORE IT WAS BUILT. §32.4a and
  // the brief both say the discriminator is that *"`tmp.h.baseAmount` RISES toward its threshold for the whole of
  // `h`'s wait and `ss`'s does not move"*. `ss`'s DOES move: while it holds the turn nothing on its row can wipe
  // row 2, so its base climbs 0 → 17 (and `o`'s 0 → 5) over ~300 game-seconds — and THEN plateaus for ever. Both
  // dead members spend their first five minutes getting genuinely closer. So "is it moving?" does not separate them
  // from `h`; what separates them is that `h` keeps setting NEW HIGHS until it crosses, and `o`/`ss` never beat a
  // high they reached once. ⇒ the anchor is the member's BEST engine-distance so far, not its last one.
  //
  // ⚖ THE SHAPE IS R3a's GIVE-UP RULE, APPLIED TO A TURN (plan §30.2 item 2, §32.4a): *in the last H game-seconds,
  // did this holder close more than a fraction B of what was LEFT to close?* Every term is the ENGINE'S OWN — the
  // fraction is `tmp[l].baseAmount` toward the very threshold `canReset` compares it against — and `turnDistance`
  // is the one place that knows which threshold that is. No layer name, no game id, no clock in any game's units
  // beyond the buffer H the player sets, exactly as R3a's `B`/`H` are.
  // ⛔ B DEFAULTS TO 0 AND THAT IS THE MEASURED ANSWER, NOT A TIMID ONE. `@0/H` is R3a's own control — "release only
  // when the distance stops dead" — and it is what the plateau above needs: `o` beats its best by SOMETHING every
  // ~50 game-seconds while it climbs and by exactly nothing afterwards. It also makes the reading of the fraction
  // (linear or logarithmic) IRRELEVANT, because a strict increase is a strict increase under either — which is why
  // this rule can reuse `ratio()` where R3a's had to take logs.
  // ⛔ AND IT ONLY EVER LOOKS WHILE THE ENGINE IS REFUSING. A holder the engine WOULD allow is not waiting on the
  // game, it is waiting on its own policy — "my rule says not yet" is productive waiting (§34.2 item 1), the weight
  // exists to protect it, and the backstop for it is `K`. ⇒ `K` IS NOT RETIRED: the two rules answer two different
  // refusals and neither can see the other's. That is structural, and the sweep measures it.
  var TURN_BH = [
    { name: 'b', type: 'fraction', placeholder: 'B', default: '0', label: 'must close this fraction of what is left' },
    { name: 'h', type: 'seconds', placeholder: 'H', default: '100', label: 'give the turn up after this long without getting closer' },
  ];
  var MODIFIERS = [
    // ⚠ `readout: 'stall'` — R3a. `T.stallState(id)` is called for EVERY feature by `explain()`, and until this
    // slice it could assume that "has a modifier" meant "has THIS modifier". With a second modifier on another kind,
    // a `challenges` feature carrying `give-up` was answered with the stall fallback's readout — *"no reset by this
    // feature's own rule yet"*, about a feature that does not reset. Nothing threw: it was a false sentence in the
    // Advanced view, which is the class of defect V1 exists to prevent. The ROW says which readout is its own.
    { kind: 'reset', template: 'stall>={k}x/{n}', label: 'Fall back when stalled', readout: 'stall', help: 'If this feature’s own rule has been waiting K times longer than its resets usually take, reset anyway — but only the stalled feature closest to its target goes first.',
      params: [
        { name: 'k', type: 'factor', placeholder: 'K', default: '3', min: 1, label: 'stalled after K× the usual wait' },
        { name: 'n', type: 'count', placeholder: 'N', default: '5', min: 1, label: 'resets remembered' },
      ] },
    // ---- R3a: the challenge GIVE-UP rule — the exit `sequential` never had ------------------------------------
    // ⛔ THE BOTTLENECK, MEASURED (plan §29, reproduced twice by R3a). `sequential` has an ENTRY rule (“the first
    // unlocked, incomplete challenge”) and NO EXIT rule. On PTR it completes H11 in 65 game-seconds and then walks
    // straight into H12, which H11 has just unlocked and which it is far too weak for — and it STAYS: 11,878
    // game-seconds with the currency flat at 1e2334 against a goal of 1e3550, every quirk frozen, because inside a
    // challenge the rest of the tree cannot climb. It is the shape of every later challenge, not a PTR accident.
    //
    // ⚖ MINIMIZE HARDCODING: every term is the ENGINE'S OWN DECLARATION ABOUT THIS CHALLENGE — its `goal`, the
    // currency it is measured in (`currencyInternalName` / `currencyLayer` / `currencyLocation`, the same four-branch
    // lookup `canCompleteChallenge` itself does) and the layer the challenge belongs to. No challenge id, no
    // per-game threshold, and no clock that is not a buffer the player set.
    //
    // ⛔ AND IT IS NOT `rate-peak` IN DISGUISE — R3a MEASURED THE CURVE BEFORE WRITING THE RULE, and the obvious
    // shape is wrong. Progress toward a goal is an EXPONENT question (1e2334 of 1e3550), so the quantity that moves
    // is `p = log(amount) / log(goal)`; but p is FRONT-LOADED. PTR's H11 goes 0 → 0.43 → 0.78 → 0.92 in thirty
    // game-seconds and then crawls to 1.0 over the next thirty-five — so the best AVERAGE rate is always the first
    // few seconds', and any rule anchored to it condemns a challenge that is about to be won. (Measured: with
    // `p / elapsed` and `best` since entry, H11 is abandoned at 99.7 % of its goal, five seconds from the reward.)
    // What separates H11 from H12 is not the rate, it is whether p is STILL MOVING: H12 is flat to seventeen digits
    // from 80 game-seconds after entry onward. So the rule asks a question about the REMAINING DISTANCE:
    //   in the last H game-seconds, did this attempt close more than a fraction B of what was left to close?
    // ⚖ B and H are the two buffers the user asked for by name for `rate-peak` (plan §18), with B's meaning rotated
    // onto the quantity that moves here; `@0/H` is the bare rule ("give up only when progress stops dead") and is
    // the control every measurement of the other settings is against, exactly as `rate-peak@0/0` is.
    //
    // ⛔ AND R IS WHY THE RULE IS NOT AN OSCILLATOR. `sequential` re-picks the challenge it has just left on the
    // very next tick, so an exit rule with no retry rule is a loop that enters, fails and leaves for ever — at two
    // forced layer resets a cycle. R defers the next attempt until the challenge's OWN LAYER holds R× what it held
    // when the attempt failed: `gain>=Nx`'s shape, on the one resource the engine guarantees a challenge has
    // (`player[layer].points`), with R2's empty-purse floor on it (a multiple of nothing is no condition at all).
    // `R = 1` is the exit-only control.
    // ⛔ V5: THE ROW ABOVE IS NOW GENERATED — one per RETRY CONDITION (`RETRY_CONDITIONS`, below this table). The
    // first of them is R3a's row, byte for byte: same template, same id, same labels, same defaults.
    // ---- R3b: THE ROW CYCLE — same-row resets that wipe each other's input TAKE TURNS ---------------------------
    // ⚖ THE USER'S IDEA, VERBATIM (2026-09-20): "Another idea is to cycle through which same-row resource to do the
    // next reset. … There are a few different ways we could do this." — and, on the planner's ranked recommendation,
    // "I agree with your recommendations. Please continue."
    //
    // ⛔ THE SHAPE OF THE PROBLEM, MEASURED THREE TIMES BEFORE THIS ROW EXISTED (plan §24.7 M21, §30.2 item 1, §31).
    // Two layers of the SAME ROW each reset by wiping every row below, so each one takes the other's input away
    // again. On PTR row 3 that is `h` (a fixed, cheap 1e30 Time Energy) against `q` (a Generator Power requirement
    // that is neither) — and NO arrangement of per-feature policies fixes it, because whichever rule is eager takes
    // every tick the other one needed. `always` on `h` ends with 38 Hindrance Spirit and every quirk frozen; the
    // shipped table ends with ONE Hindrance Spirit. The question is not what either rule waits for. It is WHOSE
    // TURN IT IS.
    //
    // ⛔ A CYCLE IS DERIVED, NOT TYPED. Its members are the reset features of the layers on the SAME ROW — the
    // ENGINE'S OWN `row` — and a row HAS a cycle only while at least one of those features carries this modifier.
    // With no table entry and no player edit there is no cycle anywhere and nothing moves at all (gate R3b-5).
    // ⛔ AND IT BINDS EVERY MEMBER OF THE ROW, carrier or not, at one turn's worth of resets by default. That is the
    // first thing the planner's void cells taught: a `reset:h` that was left OUT of the cycle fired 44 times and
    // starved `q` before `q`'s turn could be used. A member that does not yield is not a member (gate R3b-R1).
    // ⛔ INSIDE ITS TURN A MEMBER DECIDES BY ITS OWN POLICY, AND THE WHOLE-STRETCH SWEEP IS WHAT SAYS SO. The
    // first cut made a member EAGER in its turn — "the turn is the patience" — and it is measurably WRONG: on PTR
    // it replaces `reset:q`'s measured `gain>=2` with `always` for every turn, and `q` then resets for ONE quirk
    // instead of two (measured over the whole stretch: 249 quirks from 244 resets against the control's 559 from
    // 279). A member that SHOULD be eager says so with the policy `always`, which is a choice a table or a player
    // makes and carries its own provenance — ⚖ minimize hardcoding, and it is what the planner's own probe did.
    // ⚠ The deadlock the requirement came from is real and is the GUARD's job, not the composition's.
    // ⛔ THE GUARD IS THE USER'S OWN DYNAMIC-THRESHOLD RULE, AND WHAT IT IS LATE AGAINST WAS DECIDED BY MEASUREMENT.
    // K: a member that has not acted for K times as long as its own RESETS usually take releases the turn, and is
    // skipped for one whole rotation so a demand that can never be met cannot take it straight back (§24.6's
    // deadlock, and Part 2's circular demand). The typical is the median of the last N intervals between that
    // member's OWN resets — `stall>=Kx/N`'s own quantity, which is the user's rule verbatim: *"we could set the
    // timeout threshold dynamically, based on how long previous resets have taken"*.
    // ⛔ AND WITH NO INTERVAL OF ITS OWN THERE IS NO BOUND AT ALL — the turn is HELD until the member uses it.
    // Two cheaper-looking rules were measured and both STARVE the member the cycle exists to feed: a bound taken
    // from the ROW's pooled intervals gives PTR's `h` a threshold two orders of magnitude too small (`h` needs
    // ~1,450 quiet game-seconds for Time Energy to reach 1e30; `q`'s intervals are tens of seconds), and a
    // first-cycle rule that released the turn "to whoever can act" released it immediately, every time. Both end
    // with Hindrance Spirit at ONE, which is the state before this slice. ⚠ The cost is named rather than
    // smoothed: a member that can NEVER act holds its row's turn for ever, and what protects against that is the
    // player's own `while` and the demand link — not a number this file could derive.
    { kind: 'reset', template: 'turn@{w}/{k}x/{n}/{b}/{h}', readout: 'turn', cycle: true, label: 'Take turns with the same row',
      help: 'Reset only when it is this layer’s turn among the resets of its ROW, and take W resets per turn — so two same-row resets that wipe each other’s input stop racing. Inside its turn the layer still follows its own rule.',
      params: [
        { name: 'w', type: 'count', placeholder: 'W', default: '1', min: 1, label: 'resets in one turn' },
        // ⛔ K = 30, AND IT IS MEASURED, NOT INHERITED — the default was 3, copied from `stall>=Kx/N`, and 3 BREAKS
        // THE WEIGHT. A cycle member's waits are BIMODAL BY CONSTRUCTION: the cycle itself creates the long ones.
        // PTR's `q` resets every ~19 game-seconds in a burst and then needs ~311 after a sibling's reset has wiped
        // the row below, and `N` is a SLIDING WINDOW — so a burst flushes the long waits out of the memory, the
        // bound collapses to `3 × 19`, and the next legitimate wait is read as a stall. Measured over the whole
        // stretch from `all/M15.json` to 37048: at K = 3 a weight of 20 yields a `q`/`h` ratio of **1.0** and 211
        // quirks; at K = 30 it yields **19.1** and reproduces a known-good arrangement BYTE-FOR-BYTE
        // (`d2da5ef3a490f92a`, 73 Hindrance Spirit, 673 quirks, M22–M24 identical to the control). K = 300 and
        // K = 100000 are byte-identical to K = 30, so the answer is not sensitive above the knee.
        // ⚖ AND THE WATCH'S OWN `k` WAS MOVED 3 → 10 FOR THE SAME KIND OF REASON (heavy-tailed gaps; see
        // WATCH_PARAMS). A `K` inherited across mechanisms that ask different questions is a default nobody measured.
        // ⚠ `stall>=Kx/N` KEEPS ITS OWN K = 3, and that is not an inconsistency: it asks "is this feature's own
        // rule unusually late?", where a small multiple of a median is right. A cycle asks "is this member failing
        // to USE its turn?", and the damage a wrong answer does is a FALSE RELEASE that starves the member the
        // cycle exists to feed. ⚠ No quantity fixed this — the LONGEST of the window measures identically, because
        // the window's contents are what is wrong. The real answer is a release rule based on PROGRESS toward the
        // threshold (plan §32.4a), and until that exists K is a backstop and is set to behave like one.
        { name: 'k', type: 'factor', placeholder: 'K', default: '30', min: 1, label: 'give the turn up after K× the usual wait between this layer’s resets' },
        { name: 'n', type: 'count', placeholder: 'N', default: '5', min: 1, label: 'resets remembered' },
      ].concat(TURN_BH) },
    // ⚖ 13d.2, AND IT IS THE SAME MECHANISM WITH ONE MORE LINK. A weight is a literal; the ⚖-shaped question is
    // "who is actually WAITING?" — and the loader already answers it, because V1 made every refusal a DECISION CODE
    // carrying the values it compared. A code may now declare WHICH of its values names the layer it is waiting ON
    // (`demand` in the CODES table): R3a's retry bar says *"challenge 12 failed with 1.00 of h; it will be tried
    // again at 2.00"*, and `h` in that sentence is a demand on layer `h`. While such a demand names a member of the
    // cycle, that member gets the turn; with none, the weights decide exactly as above. NO LAYER NAME AND NO GAME
    // ENTERS THIS FILE: a new reason code that declares a `demand` value is a new demand signal and no code here.
    // ⚠ ONE MEMBER ASKING FOR IT IS ENOUGH for the whole row, because demand only ever hands a turn to a member
    // something is waiting on — the most a member that did not ask for it can lose is its place in the rotation,
    // which the guard above already allows.
    { kind: 'reset', template: 'turn-demand@{w}/{k}x/{n}/{b}/{h}', readout: 'turn', cycle: 'demand', label: 'Take turns, and give the turn to whoever is waited on',
      help: 'As “take turns with the same row”, except that whenever something in the game is waiting for a quantity of one member’s layer, that member gets the next turn.',
      params: [
        { name: 'w', type: 'count', placeholder: 'W', default: '1', min: 1, label: 'resets in one turn' },
        { name: 'k', type: 'factor', placeholder: 'K', default: '30', min: 1, label: 'give the turn up after K× the usual wait between this layer’s resets' },
        { name: 'n', type: 'count', placeholder: 'N', default: '5', min: 1, label: 'resets remembered' },
      ].concat(TURN_BH) },
  ];
  // ---- V5: RETRY CONDITIONS — what a challenge that was given up waits for before it is tried again ------------------
  // ⚖ THE USER'S REQUEST, VERBATIM (2026-09-20): "In the advanced automation tab, we will want more options for the
  // condition to wait for before retrying challenges. Another option might be total resets on the current highest
  // row."
  // ⛔ A CONDITION IS A ROW, AND EACH ROW BECOMES ONE MODIFIER. The give-up half (`B` and `H`) is R3a's and is shared;
  // the retry half is the row's own template SUFFIX, its own parameters and its own `wait` function. So the picker's
  // buttons, the parameter editors, the validator, the round-trip and the docs gate all see an ordinary modifier row,
  // and a later condition is one more entry here and NO UI code (⚖ minimize hardcoding).
  // ⛔ THE FIRST ROW IS R3a's RULE, UNCHANGED, AND IT STAYS THE DEFAULT: same template (`give-up@{b}/{h}/{r}x`), same
  // id, same record (the layer's strength as a STRING, exactly as R3a wrote it), same reason code. No default moves
  // in this slice, and every pinned number is measured to reproduce (gates-v5).
  // `wait(f, params, id, rec)` → null when the challenge may be tried again, else `{code, values}` — the refusal,
  // in V1's vocabulary. `seed(f, params, now)` → the record written AT THE GIVE-UP (`startHeld` is the strength the
  // failed attempt started from, which is what R3a's rule compares against).
  var GIVE_UP_BH = [
    { name: 'b', type: 'fraction', placeholder: 'B', default: '0.1', label: 'must close this fraction of what is left' },
    { name: 'h', type: 'seconds', placeholder: 'H', default: '30', label: 'within this many seconds' },
  ];
  var RETRY_CONDITIONS = [
    { suffix: '{r}x', label: 'Give up when it stops getting closer',
      help: 'Leave a challenge without completing it once the attempt has stopped closing the distance to its goal — and wait until the layer is stronger before trying that challenge again.',
      params: [{ name: 'r', type: 'factor', placeholder: 'R', default: '2', min: 1, label: 'retry once the layer holds this multiple of what it held' }],
      seed: function (f, P, now, startHeld) { return startHeld; },
      wait: function (f, P, id, rec) {
        var need = D(retryHeld(rec)).times(Number(P.r));
        return D(player[f.layer].points).gte(need) ? null : { code: 'waiting:retry', values: { id: id, layer: f.layer, had: player[f.layer].points, need: need } };
      } },
    // ⚖ ASSUMPTION (planner, plan §36 — the user was asked and did not answer; cheap to overturn): "the current highest
    // row" is the highest row with an unlocked layer that this automation can reset, AT THE MOMENT OF THE GIVE-UP, and
    // it is FROZEN for that wait — so the bar cannot jump when a new row opens mid-wait. The other reading is the
    // next row, one suffix away (`-now`), so the choice is the player's and the default is neither.
    // ⛔ WHAT IS COUNTED IS THIS AUTOMATION'S OWN RESETS. A reset the player clicks, or one the game's own auto-reset
    // makes, is NOT counted, and that is not an oversight: no engine field declares a reset on every family —
    // `player.<l>.resetTime` exists only on the 2.7-style engine and ptr has none (plan §31a's six void cells), and
    // `total` / `best` are the GAME's own `startData` on 2.2.1 (only 2.7's `getStartLayerData` adds them). A count
    // built on either would be a different rule on different games. The readout names the layers it counts, so a
    // count that is not moving (a member whose reset the game's own autobuyer does) is visible for what it is.
    { suffix: '{n}resets', label: 'Give up when it stops getting closer; retry after N resets of the highest row',
      help: 'As the first give-up rule, but the challenge is tried again once this automation has made N resets of the highest row it could reset when the attempt was given up (that row is fixed for the wait). Resets you click, or that the game makes by itself, are not counted.',
      params: [{ name: 'n', type: 'count', placeholder: 'N', default: '10', min: 1, label: 'retry after this many resets of the highest row' }],
      seed: function (f, P, now, startHeld) { return resetsSeed(startHeld, false); },
      wait: function (f, P, id, rec) { return resetsWait(f, P, id, rec, false); } },
    { suffix: '{n}resets-now', label: 'Give up when it stops getting closer; retry after N resets of the highest row NOW',
      help: 'As the row above, except that the row counted is the highest one right now — if a new row opens during the wait, its resets are the ones that count from then on.',
      params: [{ name: 'n', type: 'count', placeholder: 'N', default: '10', min: 1, label: 'retry after this many resets of the highest row' }],
      seed: function (f, P, now, startHeld) { return resetsSeed(startHeld, true); },
      wait: function (f, P, id, rec) { return resetsWait(f, P, id, rec, true); } },
    // ⚖ 13d.2 — A CLOCK IS A PROXY, and it is labelled as one. Offered because a player may want exactly this; never a
    // default, and its help says what it stands in for.
    { suffix: '{t}s', label: 'Give up when it stops getting closer; retry after T seconds',
      help: 'As the first give-up rule, but the challenge is tried again once this many game-seconds have passed since it was given up. ⚠ A clock is a PROXY for "the run is stronger now" — it waits the same whether the run grew or not.',
      params: [{ name: 't', type: 'seconds', placeholder: 'T', default: '600', min: 0, label: 'retry after this many game-seconds' }],
      seed: function (f, P, now, startHeld) { return { held: startHeld, at: now }; },
      wait: function (f, P, id, rec) {
        var r = retryObject(rec), now = Number(player.timePlayed) || 0;
        if (r.at === undefined) r.at = now;              // a condition chosen after the give-up starts its clock here
        var el = now - r.at, t = Number(P.t);
        return el >= t ? null : { code: 'waiting:retry-clock', values: { id: id, elapsed: r1(el), need: t } };
      } },
    // ⛔ THE GENERAL FORM IS V4's PREDICATE TYPE. A predicate has no grammar and cannot sit inside a policy string (`|`
    // is the modifier separator), so its parameter is declared `side: true` — it is stored BESIDE the policy, in the
    // same `player.au.edits[<id>]` object (`args`), and edited by the same field. Empty is "no condition": the
    // challenge is tried again at once, which is R3a's `R = 1` exit-only control.
    // ⚠ WHAT IS NOT OFFERED, AND WHY: "retry once the challenge's own goal looks reachable from outside it". The
    // progress an attempt WOULD make cannot be read from the outside state without entering the challenge and rolling
    // back (a rollback is harness-only — docs/planner.md), so a row claiming it would be a guess.
    { suffix: 'when', label: 'Give up when it stops getting closer; retry when a condition holds',
      help: 'As the first give-up rule, but the challenge is tried again once the condition you type holds (a JavaScript expression, like the pause and stop conditions). Empty means no condition — it is tried again at once. It cannot be “when the challenge would now succeed”: that can only be known by entering it.',
      params: [{ name: 'w', type: 'predicate', side: true, default: '', label: 'retry once this is true' }],
      seed: function (f, P, now, startHeld) { return { held: startHeld }; },
      wait: function (f, P, id, rec) {
        var c = sidePredicate(f, 'w');
        if (!c.src) return null;
        var v = evalPredicate(c);
        if (v.error) return { code: 'blocked:retry-when', values: { id: id, src: c.src } };
        return v.value ? null : { code: 'waiting:retry-when', values: { id: id, src: c.src } };
      } },
  ];
  (function () {
    var rows = RETRY_CONDITIONS.map(function (R) {
      return { kind: 'challenges', template: 'give-up@{b}/{h}/' + R.suffix, label: R.label, help: R.help, retry: R,
        params: GIVE_UP_BH.map(function (p) { return Object.assign({}, p); }).concat(R.params.map(function (p) { return Object.assign({}, p); })) };
    });
    // after the reset kind's modifiers, where R3a's single row used to be
    var cut = 0;
    for (var k = 0; k < MODIFIERS.length; k++) if (MODIFIERS[k].template === 'stall>={k}x/{n}') cut = k + 1;
    Array.prototype.splice.apply(MODIFIERS, [cut, 0].concat(rows));
  })();
  // ---- the per-feature CONTROLS (V4) — not policies, and that is why they are their own table -------------------------
  // ⚖ THE USER'S REQUEST, VERBATIM (2026-09-15, plan §13): "an option to stop doing the resets after a specific
  // amount of the currency has been earned" — that is `until`. §13b asks for it on EVERY kind, latching, with a
  // manual re-arm, plus a `priority` per feature overriding the kind order.
  //
  // ⛔ ONE PREDICATE MECHANISM, TWO CONTROLS, AND THE PAUSE ALREADY EXISTED. `while` is NOT a new slot: it is the
  // table's own `gates` entry, which has been in the loader since S1 and which no table on the roster had ever
  // carried (plan §26 measured that a single `gates` line breaks PTR's M21 wall, so what M21 needed was a PAUSE and
  // not a latching STOP). A player's `while` and the game's gate are therefore the SAME slot under V2's precedence,
  // and `blocked:gate` goes on being the reason — now naming WHOSE predicate it is.
  //
  // ⛔ AND THEY ARE NOT POLICIES. A policy is one string per feature, parsed by a grammar, chosen from an alphabet;
  // these are three independent FIELDS with three types, two of which have no grammar at all. Making `until` a
  // strategy would have meant every strategy of every kind gaining a predicate parameter that most of them ignore.
  // They live beside `policy` in the same `player.au.edits[<id>]` object (V2 §18.5 reserved exactly this) and they
  // read PAST the stall watch's rung rather than through it (V3 §21.8): a feature the watch has escalated still has
  // the player's `while` and `until`.
  var CONTROLS = [
    { name: 'while', type: 'predicate', default: '', label: 'act only while', control: true,
      help: 'The feature does nothing while this is false, and carries on the moment it is true again — a PAUSE, not a stop. Leave it empty for no condition.' },
    { name: 'until', type: 'predicate', default: '', label: 'stop once', control: true,
      help: 'Once this has been true, the feature stops acting and stays stopped even if it goes false again — a STOP, with a re-arm press beside it. Leave it empty for no condition.' },
    // ⚠ A `count` WHOSE DEFAULT IS NOT A LITERAL. An unedited feature's priority is its KIND's place in this game's
    // kind order (1-based), which is the order it already runs in — so "nothing edited" is byte-identical by
    // construction rather than by a rule, and the number a player sees is the one that is really deciding.
    { name: 'priority', type: 'count', default: null, label: 'priority (1 = first)', control: true,
      help: 'Which of this LAYER’s features acts first in a tick; 1 goes first. Ties keep the kind order. It cannot reach across layers — the engine decides in what order layers run.' },
  ];
  var CONTROL_ROW = { template: 'the per-feature controls', params: CONTROLS };
  function controlRow(name) { for (var i = 0; i < CONTROLS.length; i++) if (CONTROLS[i].name === name) return CONTROLS[i]; return null; }
  T.controls = function () {
    return CONTROLS.map(function (p) {
      var t = PARAM_TYPES[p.type];
      return { name: p.name, type: p.type, default: p.default, label: p.label, help: p.help, valueKind: t.kind,
        min: p.min === undefined ? t.min : p.min, max: p.max === undefined ? (t.max === undefined ? null : t.max) : p.max };
    });
  };
  var MOD_SEP = '|';
  function reSafe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /** A row's pattern source, group-free except for one capture per parameter, in param order. */
  function patternOf(S) {
    var src = '';
    var parts = S.template.split(/(\{\w+\})/);
    for (var i = 0; i < parts.length; i++) {
      var m = /^\{(\w+)\}$/.exec(parts[i]);
      if (!m) { src += reSafe(parts[i]); continue; }
      var pt = PARAM_TYPES[paramOf(S, m[1]).type];
      if (!pt || !pt.re) throw new Error('strategy ' + S.template + ': {' + m[1] + '} is a ' + paramOf(S, m[1]).type + ', which has no grammar and cannot appear in a policy string');
      src += '(' + pt.re + ')';
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
      params: S.params.map(function (p) { return { name: p.name, type: p.type, placeholder: p.placeholder, default: p.default, min: p.min === undefined ? PARAM_TYPES[p.type].min : p.min, max: p.max === undefined ? (PARAM_TYPES[p.type].max === undefined ? null : PARAM_TYPES[p.type].max) : p.max, label: p.label, valueKind: PARAM_TYPES[p.type].kind }; }).map(function (j, i) { if (S.params[i].side) j.side = true; return j; }) };
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
      var p = {}, g = 0;
      // ⚠ V5: a `side` parameter (a predicate) has NO capture group — it is stored beside the string — so the groups
      // are read off by a counter of the parameters that DO have one, in template order.
      for (var j = 0; j < rows[i].params.length; j++) if (!rows[i].params[j].side) p[rows[i].params[j].name] = m[++g];
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
    // V4: a type may declare a `check` FUNCTION instead of a grammar (`predicate`). It answers the same way — null,
    // or the sentence the field shows — so every caller above and below this line is unchanged.
    if (typeof t.check === 'function') return t.check(s);
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
    // ⚠ V4: `owner` SAYS WHOSE PREDICATE IT IS. The slot now has four possible sources (the generic derivation, the
    // game's table, the player's own `while`, a runtime override) and "Blocked — the gate X is false" could not tell
    // a player whether they had typed X themselves. `owner` is an enumerated word this file owns, not free text.
    'blocked:gate':       { text: 'Blocked — the gate {gate} ({owner}) is false',                 values: ['gate', 'owner'] },
    // ⛔ V4: A PREDICATE THAT THROWS IS NOT A PREDICATE THAT IS FALSE, and a silent `false` is the trap this code
    // exists to avoid: a player types `player.q.pionts` and the feature pauses for ever with a reason that reads
    // exactly like a condition legitimately not met. ⚠ NO ERROR TEXT IN THE VALUES — "no free-text value" is this
    // table's rule; the message is in the feature's BLOCK, from `controlState(id)`, which is where the brief asks
    // for it. `which` is one of the CONTROLS' own names.
    'blocked:predicate':  { text: 'Blocked — the “{which}” condition {src} could not be evaluated (see the block)',  values: ['which', 'src'] },
    // ⛔ V4: THE LATCH, and it is a DECISION code like every other: the feature is running, unlocked and refusing,
    // and the refusal is permanent until the player re-arms it. `at` is the game-second the condition first held.
    'stopped:until':      { text: 'Stopped — {until} held at {at} s; re-arm it in the tab to start again',           values: ['until', 'at'] },
    // ⚖ R3b: `demand` NAMES WHICH OF A CODE'S OWN VALUES IS THE LAYER IT IS WAITING ON. It is not a new vocabulary
    // and not a second reading of the decision — it is one more DECLARATION on a row that already carries the
    // values it compared, and it is what makes "the turn goes to the layer something is waiting on" derivable with
    // no layer name and no game anywhere in this file. A code that declares one is a demand signal; a new code that
    // declares one is a new demand signal and no code in the cycle changes. `T.reasonCodes()` publishes it, so a
    // gate can witness the set rather than trust it.
    'blocked:after':      { text: 'Blocked — waiting for {sibling} to unlock first',              values: ['sibling'], demand: 'sibling' },
    'blocked:enter':      { text: 'Blocked — the game will not enter challenge {id}',             values: ['id'] },
    'blocked:exit':       { text: 'Blocked — the game will not exit challenge {id} yet',          values: ['id'] },
    'yielding:native':    { text: "Yielding — the game's own auto-reset is resetting {layer}",     values: ['layer'] },
    'cannot-reset':       { text: 'Cannot reset — {have} of {need}',                              values: ['have', 'need'], quantities: ['have', 'need'] },
    'in-challenge':       { text: 'In challenge {id} — not completable yet',                      values: ['id'] },
    // ⛔ R3a: THE FOUR CODES THE `challenges` KIND HAD NO WAY TO SAY. `in-challenge` above is the WHOLE of what a
    // feature inside a challenge could report before this slice, and it is the same sentence whether the attempt is
    // winning, hopeless or abandoned — which is why a run could sit inside PTR's H12 for 11,878 game-seconds and
    // never say anything but "not completable yet".
    // ⚖ `pct` and `need` are PERCENTAGES OF THIS CHALLENGE'S OWN GOAL, not quantities of the game: they are already
    // dimensionless, so they must not go through `format()` (the `quantities` rule above, read the other way).
    'waiting:progress':   { text: 'In challenge {id} — {pct}% of the way to its goal; it must close {need}% of what is left, and {held} s of {hold} s have gone by', values: ['id', 'pct', 'need', 'held', 'hold'] },
    'acted:challenge-give-up': { text: 'Gave up challenge {id} at {pct}% of its goal — it closed under {need}% of what was left for {hold} s', values: ['id', 'pct', 'need', 'hold'] },
    'waiting:retry':      { text: 'Waiting — challenge {id} failed with {had} of {layer}; it will be tried again at {need}', values: ['id', 'layer', 'had', 'need'], quantities: ['had', 'need'], demand: 'layer' },
    // ⛔ V5: THE OTHER RETRY CONDITIONS, one code each, and each says WHICH condition it is and HOW FAR ALONG. None
    // declares a `demand`: a count over a ROW names no single layer it is waiting on, and the row cycle's demand link
    // (R3b) is exactly the place a second reading of it would do damage.
    'waiting:retry-resets': { text: 'Waiting — challenge {id} failed; it is tried again after {need} resets of row {row} by this automation: {done} of {need} so far ({layers})', values: ['id', 'done', 'need', 'row', 'layers'] },
    'waiting:retry-clock':  { text: 'Waiting — challenge {id} failed; it is tried again {need} s after it was given up: {elapsed} s so far', values: ['id', 'elapsed', 'need'] },
    'waiting:retry-when':   { text: 'Waiting — challenge {id} failed; it is tried again once {src} holds', values: ['id', 'src'] },
    // a retry condition that THROWS is not one that is false (V4's rule for `while` / `until`, and the same reason)
    'blocked:retry-when':   { text: 'Blocked — the retry condition {src} for challenge {id} could not be evaluated', values: ['id', 'src'] },
    // ⛔ THE ONE STATE A PAUSE ON THIS KIND CAN LEAVE BEHIND, AND IT IS MEASURED. Entering a challenge is not
    // idempotent: it puts the GAME into a mode that only this feature will take it out of. A `while` that goes false
    // while the game is inside one therefore means "stop entering" AND "never leave" — R3a measured a run stranded
    // inside PTR's H11, a challenge it completes in 65 game-seconds, for the whole remaining 3,935 of its leg, with
    // `blocked:gate` as its only reason. The reason line now names the challenge and which control did it.
    'paused:in-challenge': { text: 'Paused inside challenge {id} — the “{which}” condition {src} stops this feature, and a pause does not leave a challenge', values: ['id', 'which', 'src'] },
    // running, and the policy says not yet
    'waiting:gain':       { text: 'Waiting — gain {gain} of {need}',                              values: ['gain', 'need'], quantities: ['gain', 'need'] },
    'waiting:gain-x':     { text: 'Waiting — gain {gain} of {need} ({n}× the {have} held)',        values: ['gain', 'need', 'n', 'have'], quantities: ['gain', 'need', 'have'] },
    'waiting:gain-unit':  { text: 'Waiting — gain {gain} of {need} ({n}× one unit; the layer holds {have})', values: ['gain', 'need', 'n', 'have'], quantities: ['gain', 'need', 'have'] },
    'waiting:interval':   { text: 'Waiting — {elapsed} s of {need} s since the last reset',        values: ['elapsed', 'need'] },
    'waiting:milestone':  { text: 'Waiting — milestone {id} of {layer} is not held',              values: ['layer', 'id'], demand: 'layer' },
    'waiting:purchase':   { text: 'Waiting — the reset would still afford nothing',               values: [] },
    // V2: the two new reset strategies. `waiting:rate` is `rate-peak` saying the cycle is still improving;
    // `waiting:stall-clock` is the stall MODIFIER's countdown, naming the primary rule that is still refusing; and
    // `waiting:stall-yield` is the ARBITER — this feature IS stalled and another stalled one is closer to its target,
    // which is the one state the other two codes cannot express.
    'waiting:rate':       { text: 'Waiting — {rate}/s now against the best {best}/s; the reset needs it under {need}/s for {hold} s and it has held {held} s', values: ['rate', 'best', 'need', 'held', 'hold'], quantities: ['rate', 'best', 'need'] },
    'waiting:stall-clock':{ text: 'Waiting — {elapsed} s of {need} s before the stall fallback may reset, and {policy} still says no', values: ['elapsed', 'need', 'policy'] },
    'waiting:stall-yield':{ text: 'Waiting — the stall fallback yielded to {layer}, which is closer to its target', values: ['layer'] },
    // ⛔ R3b: THE ROW CYCLE's own refusal, and it is a DECISION code like every other — the feature is running,
    // unlocked, the ENGINE would allow the reset, and the cycle is holding it back for a named sibling. It is
    // reported only where the engine says yes: a member that could not reset anyway keeps `cannot-reset`, so
    // `waiting:turn` means exactly "the game would let me and the cycle will not".
    'waiting:turn':       { text: 'Waiting — it is {layer}’s turn among row {row}’s resets ({left} of {weight} left); this layer takes {mine} per turn', values: ['layer', 'row', 'left', 'weight', 'mine'] },
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
  T.reasonCodes = function () { var o = {}; for (var k in CODES) o[k] = { text: CODES[k].text, values: CODES[k].values.slice(), demand: CODES[k].demand || null }; return o; };

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
  // ⚠ V5: THE SENTENCE IS BUILT AS PARTS — its literal text and its VALUES kept apart — so the view can put each value
  // in a box of its own (the no-jump floors, below) without formatting anything twice: `codeText` is the parts joined,
  // and `explainStats.formats` counts exactly what it counted before. `k` is set on a part that is a NUMBER (a formatted
  // quantity, or a plain number such as a count or a number of seconds); an id list or a layer name is plain text.
  function codeParts(code, values) {
    explainStats.texts++;
    var C = CODES[code] || CODES.unknown;
    var q = C.quantities || [], out = [], re = /\{(\w+)\}/g, i = 0, m;
    while ((m = re.exec(C.text)) !== null) {
      if (m.index > i) out.push({ s: C.text.slice(i, m.index), k: null });
      var k = m[1], v = values ? values[k] : undefined;
      if (v === undefined || v === null) out.push({ s: '?', k: null });
      else if (q.indexOf(k) >= 0) out.push({ s: fmt(v), k: k });
      else out.push({ s: plain(v), k: typeof v === 'number' ? k : null });
      i = re.lastIndex;
    }
    if (i < C.text.length) out.push({ s: C.text.slice(i), k: null });
    return out;
  }
  function codeText(code, values) { return joinParts(codeParts(code, values)); }
  function joinParts(ps) { var t = ''; for (var i = 0; i < ps.length; i++) t += ps[i].s; return t; }
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
  // THIS GAME's kind order, as `derive()` resolved it (the table's, `--auto-opt kindOrder=`, or the generic one).
  // It is what a feature's DEFAULT `priority` is read from, so a table that reorders the kinds reorders the
  // defaults with it and a player editing one number is editing the same scale the loader is already using.
  var kindOrderNow = KINDS_ALL.slice();
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
    // ---- R3b: THE ROW CYCLE, AND WHERE IT SITS IN THE CHAIN -------------------------------------------------------
    // ⛔ THE PRECEDENCE, IN ONE PLACE. `until` and `while` are ABOVE this (they are decided in `runLayer`, before
    // any kind's decision path is entered), so a STOPPED or PAUSED member is not in the cycle's hands at all and
    // PTR's M21 pause on `reset:q` goes on unlocking `h` exactly as it did. The ENGINE is above it too — the three
    // questions answered just above this line — so `waiting:turn` means "the game would let me and the cycle will
    // not", and a member that could not reset anyway keeps `cannot-reset`. BELOW it is the member's own POLICY,
    // which does not decide at all while its row has a cycle: inside its turn the member is eager, and outside it
    // the member does nothing. ⚠ That is a real cost and it is named rather than smoothed — a stall-watch RUNG on
    // a cycle member's reset, and a `stall>=Kx/N` on it, are both inert while the cycle is on (docs/automation.md).
    var turn = turnStep(f);
    if (turn && !turn.act) return turn;
    var P = parsedOf(f);
    var d = primaryReset(f, P);
    if (d.act) { d.rule = P ? P.id : null; if (turn) return d; return d; }
    // ⛔ R3b — AND A HOLDER WHOSE OWN POLICY REFUSES **KEEPS** ITS TURN. The first cut yielded here, reasoning
    // that a member which COULD reset and chooses not to has nothing to wait for. That is measurably wrong, and
    // the oracle is a configuration that works: with `gain>=2` on PTR's `q`, Generator Power climbs back to where
    // the ENGINE allows a reset while the gain is still ONE quirk — so the policy refuses, the turn was handed
    // away, and a twenty-reset turn ended after ONE reset. Measured: `reset:q` 5 and `reset:h` 37 over the stretch,
    // i.e. `reset:h = always` running unscheduled, against the working arrangement's 286 / 15.
    // ⚠ "My rule says not yet" IS productive waiting — `gain>=2`, `rate-peak` and `interval>=T` all mean "soon,
    // and it is worth more then". The weight exists to protect exactly that. What answers a member that is not
    // using its turn is the GUARD, and only the guard.
    if (!stallMod(P)) return d;
    return stallFallback(f, P, d);
  }
  /** The chosen strategy's own answer, with no modifier involved. */
  function primaryReset(f, P) {
    var l = f.layer, m;
    if (!P) return { act: false, code: 'unknown', values: null };
    if (P.id === 'always') return { act: true };
    // gain>=Nx: the gain is at least N × the points held (dimensionless); gain>=N: the gain is at least N
    if (P.id === 'gain>=Nx' || P.id === 'gain>=Nx-unit') {
      // ⛔ `gain>=Nx` on an EMPTY purse is `gain >= 0`, i.e. `always` — see the strategy table. `gain>=Nx-unit`
      // is the same rule with the purse floored at ONE UNIT of the layer's own resource, so the two differ ONLY
      // while the layer holds less than one, and the refusal says which bar it is against.
      var held = D(player[l].points);
      var floored = P.id === 'gain>=Nx-unit' && held.lt(D(1));
      var needX = (floored ? D(1) : held).times(Number(P.params.n));
      if (D(tmp[l].resetGain).gte(needX)) return { act: true };
      return { act: false, code: floored ? 'waiting:gain-unit' : 'waiting:gain-x',
        values: { gain: tmp[l].resetGain, need: needX, n: Number(P.params.n), have: player[l].points } };
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
  function armStall(f, P) { if (stallMod(P) && stallSince[f.id] === undefined) stallSince[f.id] = Number(player.timePlayed) || 0; }
  function pushInterval(f, P, dt) {
    if (!(dt > 0)) return;
    var M = stallMod(P);
    if (!M) return;
    var n = Math.max(1, Math.round(Number(M.params.n)));
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
    var M = stallMod(P);
    if (!M) return null;
    return { elapsed: now - last, need: Number(M.params.k) * typ, typical: typ };
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
    if (!stallMod(P)) return null;
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
    // ⚠ ONE PLACE KNOWS WHICH THRESHOLD THE ENGINE COMPARES AGAINST, and it is `turnDistance` (R3b-2). A static
    // layer's strategies have no useful fraction of their own — `gain>=1` on one is `1 of 1` for ever — so this
    // branch has always been the engine's own distance, and it is now the engine's own distance BY NAME.
    // ⚠ The NORMAL branch is deliberately NOT moved onto it: this fraction is the stall arbiter's, and the arbiter
    // asks *"how far into its own TARGET is this refusal"* — a policy question, whose answer is the policy's. Every
    // caller of this function has already established `canReset === true`, so the engine's distance would read 1.0
    // for all of them and the arbiter would have nothing to rank by. R3b-2's rule asks the opposite question about
    // the opposite case (a holder the ENGINE refuses), which is why it calls `turnDistance` directly.
    var t = tmp[g.layer] || {};
    if (g.kind === 'reset' && t.type === 'static') return turnDistance(g);
    var S = P ? byStrategyId(g.kind, P.id) : null;
    return S && S.progress ? S.progress(g, d && d.values) : null;
  }
  /**
   * ⛔ THE ENGINE'S OWN DISTANCE TO BEING ALLOWED TO RESET, and it mirrors `canReset` BRANCH FOR BRANCH
   * (each game's own `js/game.js`): a NORMAL layer resets when `baseAmount >= requires`, a STATIC one when
   * `baseAmount >= nextAt`. Reading `requires` for a static layer is the V1 §16.3 item 8 trap — on PTR's `ss` the
   * two differ (28 against its `requires`), so the fraction would be measured against a bar the engine does not use.
   * A `custom` or `none` layer declares no threshold this file can read (its `canReset` is the game's own function),
   * so it has NO distance and every rule built on one must say so rather than guess: `null`.
   */
  function turnDistance(f) {
    var t = tmp[f.layer];
    if (!t) return null;
    var goal = t.type === 'static' ? t.nextAt : t.type === 'normal' ? t.requires : null;
    if (goal === undefined || goal === null) return null;
    return ratio(t.baseAmount, goal);
  }
  function r1(x) { return Math.round(Number(x) * 10) / 10; }

  // ---- R3b: THE ROW CYCLE (the modifier rows above say WHY) ----------------------------------------------------------
  // ⛔ ONE PLACE KNOWS WHICH MODIFIER IS WHICH, AND IT IS THE ROW. R3a learned this the cheap way (`readout`); this
  // slice adds a second reset modifier, so every path that meant "the STALL modifier" has to say so. `stallMod(P)`
  // is that sentence, and `armStall` / `pushInterval` / `stallFallback` / `stallCandidate` all go through it — a
  // feature carrying `turn@…` must not accumulate stall intervals, must not reach the stall arbiter, and must not
  // add a `stallIntervals` block to `runtimeState()` it will never read.
  function stallMod(P) {
    if (!P || !P.modifier) return null;
    var M = byStrategyId('reset', P.modifier.id);
    return M && M.readout === 'stall' ? P.modifier : null;
  }
  /** The cycle modifier a feature declares, or null. `demand` is the variant's own declaration. */
  function turnMod(f) {
    if (f.kind !== 'reset') return null;
    var P = parsedOf(f);
    if (!P || !P.modifier) return null;
    var M = byStrategyId('reset', P.modifier.id);
    return M && M.cycle ? { id: M.id, params: P.modifier.params, demand: M.cycle === 'demand' } : null;
  }
  // The DEFAULTS a bound member that declares nothing runs under — read off the `turn@W/Kx/N/B/H` row's own parameters,
  // never written twice (⚖ minimize hardcoding: moving a default is moving one table row).
  function turnDefaults() {
    // ⚠ The fallback object is what a build with no such row would run under, and it is INERT by construction: `h`
    // of 0 makes R3b-2's dead-member rule silent (it needs a positive window), exactly as `w` of 1 makes the weight
    // silent. The live values come from the row below it.
    var M = byStrategyId('reset', 'turn@W/Kx/N/B/H'), o = { w: 1, k: 3, n: 5, b: 0, h: 0 };
    if (!M) return o;
    for (var i = 0; i < M.params.length; i++) o[M.params[i].name] = Number(M.params[i].default);
    return o;
  }
  function turnParams(f) {
    var m = turnMod(f), d = turnDefaults();
    if (!m) return { w: Math.max(1, Math.round(d.w)), k: d.k, n: Math.max(1, Math.round(d.n)), b: Number(d.b), hold: Number(d.h), carrier: false };
    return { w: Math.max(1, Math.round(Number(m.params.w))), k: Number(m.params.k), n: Math.max(1, Math.round(Number(m.params.n))),
      b: Number(m.params.b), hold: Number(m.params.h), carrier: true };
  }
  function rowOf(f) { try { var r = layers[f.layer] && layers[f.layer].row; return r === undefined ? null : r; } catch (e) { return null; } }
  // ⚠ READ-ONLY, and that is why it is not `untilStep` / `whileStep`. Those two LATCH and they write — calling them
  // from the cycle's own pass would stop a feature a game-second before `runLayer` does, and would double-write the
  // `until` latch. This asks the same two questions and changes nothing.
  function cyclePaused(f) {
    if (untilHitOf(f) !== null) return true;
    var c = predicateOf(f, 'while');
    if (!c.src) return false;
    var v = evalPredicate(c);
    return !!v.error || !v.value;
  }
  /** Would the ENGINE allow this member's reset right now? (The same three questions `decideReset` opens with.) */
  function engineAllows(f) {
    var l = f.layer;
    if (!tmp[l] || tmp[l].canReset !== true || tmp[l].autoPrestige) return false;
    for (var i = 0; i < f.after.length; i++) if (!player[f.after[i]] || !player[f.after[i]].unlocked) return false;
    return true;
  }
  var cycles = {};   // row key → {holder, left, since, round, at, mem:{id:[turn lengths]}, skip:{id: round}}
  /** Every row that HAS a cycle this tick, with every active reset feature of that row as a member. */
  function cycleRows() {
    var by = {}, order = [];
    for (var i = 0; i < features.length; i++) {
      var g = features[i];
      if (g.kind !== 'reset' || !active(g)) continue;
      var r = rowOf(g);
      if (r === null || r === undefined) continue;
      var key = String(r);
      if (!by[key]) { by[key] = { row: r, key: key, members: [], on: false, demand: false }; order.push(key); }
      by[key].members.push(g);
      var m = turnMod(g);
      if (m) { by[key].on = true; if (m.demand) by[key].demand = true; }
    }
    var out = [];
    for (var j = 0; j < order.length; j++) if (by[order[j]].on) out.push(by[order[j]]);
    return out;
  }
  function cycleOf(f) {
    var C = cycles[String(rowOf(f))];
    return C && !C.dormant && C.ids && C.ids.indexOf(f.id) >= 0 ? C : null;
  }
  // ⛔ A ZERO INTERVAL IS NOT A BOUND, and there is exactly ONE place that says so — `pushCycleInterval`'s
  // `dt > 0`. Two resets that land inside one game-second (a run at `diff` 0, or a fork whose loop can reset twice
  // in a tick) are zero game-seconds apart, and `K × 0` would release every turn on the tick it was granted,
  // before its holder's layer had even run. ⚠ The first cut ALSO checked the median here, and the mutant round
  // found that redundant: a second guard on the same fact is a guard no leg can redden.
  function medianPos(xs) { return xs && xs.length ? median(xs) : null; }
  // ⛔ OWN INTERVALS ONLY — NO POOLED FALLBACK, AND THE SWEEP IS WHAT SAYS SO. A member's bound has to be in ITS
  // own units: PTR's `h` needs ~1,450 quiet game-seconds for Time Energy to reach 1e30, and `q`'s intervals are
  // tens of seconds, so a pooled median hands `h` a bound two orders of magnitude too small and releases its turn
  // before it could possibly use it — which is precisely the starvation the cycle exists to end.
  function typicalTurn(C, f) { return medianPos(C.mem[f.id]); }
  /** The member's OWN typical, with no pooled fallback — what the readout and the gates report. */
  function ownTypical(C, f) { return medianPos(C.mem[f.id]); }
  // ⛔ A TURN CAN END IN FOUR WAYS AND THEY ARE NOT THE SAME EVENT — the stub's permanent-demand leg found this
  // by deadlocking on the version that had two. `how`:
  //   'complete'   the member spent its whole turn → the LENGTH is remembered, and nothing is skipped
  //   'released'   the GUARD took it back → nothing is remembered (a threshold fed by its own timeouts grows with
  //                them, `stall>=Kx/N`'s own reason), and the member is skipped for one whole rotation so a demand
  //                that can never be met cannot hand it straight back
  //   'preempted'  DEMAND moved the turn to a member something is waiting on → nothing remembered and NOTHING
  //                SKIPPED. ⚠ Skipping here is what deadlocked the first cut: the member the demand interrupted
  //                was punished for it, every member ended up skipped, and the one holder that could not act had
  //                nobody left to release the turn to — a scheduler that stopped scheduling, green in every hash.
  //   'ineligible' the member was paused, stopped, or left the row → nothing remembered, nothing skipped
  function endTurn(C, id, how) {
    if (how === 'released') C.skip[id] = C.round + Math.max(1, C.ids.length);
    C.holder = null; C.left = 0; C.since = null; C.acted = null; C.closer = null;
  }
  // ⛔ R3b-2's ANCHOR IS THE MEMBER'S BEST DISTANCE SO FAR, AND IT SURVIVES ITS TURNS. A per-turn anchor measures
  // "did it climb since this turn began", which is TRUE OF THE DEAD MEMBERS — `o` climbs 0 → 5 of 14 every turn it
  // is given, because holding the turn is what stops a sibling wiping the row below. What it never does is beat a
  // high it has reached once. So `best` is the run's high-water for that member, and a member that cannot better it
  // for `H` game-seconds while the ENGINE is refusing it has nothing this turn can buy.
  // ⚠ AND A DROP RE-ANCHORS DOWNWARD, which is the brief's own question — *"a holder whose progress was destroyed by
  // a SIBLING is not 'not getting closer' in the sense that should cost it the turn — or is it?"* — answered by
  // measurement: it is NOT. PTR's `h` loses base MID-TURN to row-2 spending it does not control (3.23e20 → 2.03e19
  // between two samples 25 game-seconds apart, measured while `h` held the turn), and against a high-water that only
  // ever rises those losses accumulate until the re-climb cannot beat it inside `H` and the turn is taken from the
  // one member the cycle exists to feed. A drop is evidence about the ROW, not about the holder, so the mark follows
  // it down and the clock restarts. `m-r3b2-wipe-costs-the-turn` is the mutant that removes this and it reddens.
  function noteCloser(C, f, now) {
    var p = turnDistance(f);
    if (p === null) { C.closer = now; return null; }   // no threshold this file can read ⇒ the rule abstains
    if (!C.best) C.best = {};
    var best = C.best[f.id];
    if (best === undefined) { C.best[f.id] = p; C.closer = now; return p; }
    var gap = 1 - best, need = gap > 0 ? turnParams(f).b * gap : 0;
    // ⚠ STRICTLY GREATER, R3a's own reason: at B = 0 a plateau closes exactly 0 of 0, and `>=` would read that as
    // progress and never release — which is the state the rule exists to leave.
    if (p - best > need || p < best) { C.best[f.id] = p; C.closer = now; }
    return p;
  }
  /** ⛔ WHAT THE GUARD IS LATE AGAINST, AND THE MEASUREMENT THAT DECIDED IT — read the modifier row. */
  function pushCycleInterval(f, prev) {
    var C = cycleOf(f);
    if (!C) return;
    if (prev === undefined) prev = C.arm && C.arm[f.id];
    if (prev === undefined) return;
    var dt = (Number(player.timePlayed) || 0) - prev;
    if (!(dt > 0)) return;
    var m = C.mem[f.id] || (C.mem[f.id] = []);
    m.push(Math.round(dt * 1e6) / 1e6);
    while (m.length > turnParams(f).n) m.shift();
  }
  function grantTurn(C, f) {
    C.holder = f.id;
    C.left = turnParams(f).w;
    C.since = Number(player.timePlayed) || 0;
    C.acted = null;
    // R3b-2: the dead-member clock starts with the turn. `best` is NOT cleared — it is the member's high-water for
    // the whole run, and clearing it here would hand every member a fresh climb to re-run on every rotation.
    C.closer = C.since;
    // ⚠ THE FIRST WAIT IS AN INTERVAL TOO — `stallSince`'s precedent, for `stallSince`'s reason (§V2): a member
    // whose first reset had no predecessor has ZERO intervals and would hold its turn for ever. The clock starts
    // the moment it is handed a turn.
    if (C.arm === undefined) C.arm = {};
    if (C.arm[f.id] === undefined && lastReset[f.id] === undefined) C.arm[f.id] = C.since;
    C.at = C.ids.indexOf(f.id);
    C.round++;
  }
  function eligibleMember(C, f) { return !!f && !cyclePaused(f) && !(C.skip[f.id] > C.round); }
  /** The next member in the rotation that may hold a turn; null when every member is paused. */
  function nextMember(C, R) {
    var n = R.members.length, i, f, first = null;
    if (!n) return null;
    for (var pass = 0; pass < 2; pass++) {
      for (i = 1; i <= n; i++) {
        f = R.members[((C.at < 0 ? -1 : C.at) + i + n) % n];
        if (!eligibleMember(C, f)) continue;
        // ⚠ THE FIRST TURN OF A CYCLE GOES TO A MEMBER THAT CAN USE IT. With nothing remembered there is no bound
        // the guard could release a stuck first turn against, so the cycle simply does not open on a member the
        // engine is refusing. Once one turn has completed the median rule takes over and this branch is dead.
        if (C.round === 0 && pass === 0 && !engineAllows(f)) { if (!first) first = f; continue; }
        return f;
      }
      if (first) return first;
      // every member is skipped: clear the skips rather than deadlock (a skip is a fairness rule, not a stop)
      for (var k in C.skip) delete C.skip[k];
    }
    return null;
  }
  /** ⚖ THE DEMAND STEP — derived from the reason vocabulary, never from a layer name (see the modifier row). */
  function demandedMember(C, R) {
    var want = {};
    for (var i = 0; i < features.length; i++) {
      var g = features[i], last = g.last;
      if (!last || !CODES[last.code] || !CODES[last.code].demand) continue;
      var v = last.values && last.values[CODES[last.code].demand];
      if (typeof v === 'string' && v) want[v] = true;
    }
    var n = R.members.length;
    for (var j = 1; j <= n; j++) {
      var f = R.members[((C.at < 0 ? -1 : C.at) + j + n) % n];
      if (want[f.layer] && eligibleMember(C, f)) return f;
    }
    return null;
  }
  // ⛔ ONCE PER `gameLoop`, AHEAD OF THE FIRST FEATURE — the same point `watchTick` runs at, and for the same
  // reason: `runLayer` is called from each layer's own `automate` and from the au layer's fallback, so this is the
  // earliest point guaranteed to come before any member decides, whatever order the engines walk the layers in.
  function cycleTick() {
    var rs = cycleRows(), seen = {}, i;
    for (i = 0; i < rs.length; i++) {
      var R = rs[i];
      // ⛔ A CYCLE OF ONE IS NOT A CYCLE, AND THIS IS LOAD-BEARING ON PTR. A cycle's whole content is "whose turn
      // is it", and with one active member the answer is always "yours" — which, since a member is EAGER inside
      // its turn, would silently turn that member's policy into `always`. On PTR row 3 `reset:h` is LOCKED until
      // M21, so a cycle that counted one member would have replaced `reset:q`'s measured `gain>=2` with `always`
      // for the whole M15→M21 stretch, and R2 measured `always` on `q` reaching M16 NEVER (plan §24.3). So a row
      // with fewer than two active members is DORMANT: the members decide by their own policies, exactly as they
      // did before this slice, and the cycle keeps whatever it has already remembered for when the row fills up.
      var active2 = R.members.length >= 2;
      if (!active2 && !cycles[R.key]) continue;
      seen[R.key] = 1;
      var C = cycles[R.key] || (cycles[R.key] = { holder: null, left: 0, since: null, acted: null, closer: null, round: 0, at: -1, mem: {}, skip: {}, arm: {}, best: {} });
      C.ids = R.members.map(function (g) { return g.id; });
      C.demand = R.demand;
      C.dormant = !active2;
      if (!active2) { if (C.holder) endTurn(C, C.holder, 'ineligible'); continue; }
      var now = Number(player.timePlayed) || 0;
      if (C.holder && (!byId[C.holder] || C.ids.indexOf(C.holder) < 0 || cyclePaused(byId[C.holder]))) endTurn(C, C.holder, 'ineligible');
      if (C.holder) {
        var h = byId[C.holder], typ = typicalTurn(C, h);
        // ⛔ R3b-2 — THE DEAD-MEMBER RULE, AND IT LOOKS ONLY WHILE THE ENGINE IS REFUSING. A holder the engine WOULD
        // allow is waiting on its own policy, which is productive waiting the weight exists to protect (§34.2
        // item 1); its backstop is `K` below, and the two rules never see each other's case. The modifier row above
        // carries the whole argument and the trace that measured it.
        if (!engineAllows(h)) {
          if (C.closer === null || C.closer === undefined) C.closer = now;
          noteCloser(C, h, now);
          var hold = turnParams(h).hold;
          if (hold > 0 && (now - C.closer) >= hold) endTurn(C, C.holder, 'released');
        } else { C.closer = now; }
      }
      if (C.holder) {
        // ⛔ SINCE ITS LAST ACT, NOT SINCE THE TURN BEGAN. A turn of weight W spans W resets; measuring from the
        // turn's start compares one member's WHOLE turn against the wait for ONE of its resets, so any weight
        // above 1 is released mid-turn and the weight stops meaning anything (measured: weight 5 and weight 20
        // byte-identical). The question the guard asks is "has this member gone K× longer than usual without a
        // reset?", so the clock restarts every time it acts.
        var sinceAct = C.acted === null || C.acted === undefined ? C.since : C.acted;
        if (typ !== null && (now - sinceAct) > turnParams(h).k * typ) endTurn(C, C.holder, 'released');
      }
      if (C.demand) { var d = demandedMember(C, R); if (d && d.id !== C.holder) { if (C.holder) endTurn(C, C.holder, 'preempted'); grantTurn(C, d); } }
      if (!C.holder) { var nx = nextMember(C, R); if (nx) grantTurn(C, nx); }
    }
    // ⚠ A ROW WHOSE CYCLE IS SWITCHED OFF LEAVES NO MEMORY BEHIND, which is what makes `runtimeState()` inert for a
    // run that never had one (gate R3b-5): the block is absent, not empty.
    for (var k in cycles) if (!seen[k]) delete cycles[k];
  }
  /** The cycle's answer for one member, or null when its row has none. Read by `decideReset` and by the readout. */
  function turnStep(f) {
    var C = cycleOf(f);
    if (!C) return null;
    // A member that asks before the cycle has a holder takes the turn — it is the first eligible one of this tick
    // in layer order, which is deterministic, and it cannot produce a refusal that names nobody.
    if (!C.holder) grantTurn(C, f);
    if (C.holder === f.id) return { act: true, cycle: C };
    var h = byId[C.holder];
    return { act: false, code: 'waiting:turn',
      values: { layer: h ? h.layer : null, row: rowOf(f), left: C.left, weight: h ? turnParams(h).w : null, mine: turnParams(f).w } };
  }
  /** Count one reset against the holder's turn; hand the turn on the moment the turn is spent. */
  function turnSpend(f, prev) {
    var C = cycleOf(f);
    if (!C) return;
    pushCycleInterval(f, prev);
    if (C.holder !== f.id) return;
    C.acted = Number(player.timePlayed) || 0;
    C.left--;
    if (C.left > 0) return;
    endTurn(C, f.id, 'complete');
    var R = null, rs = cycleRows();
    for (var i = 0; i < rs.length; i++) if (rs[i].key === String(rowOf(f))) R = rs[i];
    if (!R) return;
    var nx = nextMember(C, R);
    if (nx) grantTurn(C, nx);
  }
  /** What the Advanced view shows about the cycle — a READOUT, never a decision (V1's rule). */
  T.turnState = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var P = parsedOf(f);
    var M = P && P.modifier ? byStrategyId(f.kind, P.modifier.id) : null;
    if (!M || M.readout !== 'turn') return null;   // R3a's rule: a modifier's readout belongs to its own ROW
    var C = cycleOf(f);
    if (!C) {
      var D = cycles[String(rowOf(f))];
      return { modifier: P.modifier.id, row: rowOf(f), members: D ? D.ids.slice() : [], holder: null, mine: turnParams(f).w,
        dormant: true, turns: D && D.mem[f.id] ? D.mem[f.id].length : 0,
        why: D ? 'only one reset of this row is running, so there is nothing to take turns with — this feature decides by its own rule'
               : 'this feature is not running, so its row has no cycle yet' };
    }
    var h = byId[C.holder];
    return { modifier: P.modifier.id, row: rowOf(f), members: C.ids.slice(), holder: h ? h.layer : null,
      mine: turnParams(f).w, left: C.left, round: C.round, demand: !!C.demand,
      typical: (function () { var t = typicalTurn(C, f); return t === null ? null : r1(t); })(),
      ownTypical: (function () { var t = ownTypical(C, f); return t === null ? null : r1(t); })(),
      resets: (C.mem[f.id] || []).length,
      // R3b-2: what the dead-member rule can see about THIS member — the engine's own distance to being allowed to
      // reset, the best it has ever reached, and how long it has gone without bettering it. `sinceCloser` is the
      // HOLDER's clock, so it is null for anybody else: a member that is not holding a turn is not on one.
      distance: (function () { var d = turnDistance(f); return d === null ? null : d; })(),
      best: C.best && C.best[f.id] !== undefined ? C.best[f.id] : null,
      sinceCloser: C.holder === f.id && C.closer !== null && C.closer !== undefined ? r1((Number(player.timePlayed) || 0) - C.closer) : null,
      hold: turnParams(f).hold, bar: turnParams(f).b,
      turns: (C.mem[f.id] || []).length, skipped: C.skip[f.id] > C.round,
      why: C.holder === f.id ? null : (h ? 'it is ' + h.layer + '’s turn' : 'no member of this row can take a turn') };
  };
  /** Every cycle in force, for a gate or a probe. `{}` while no row has one. */
  T.cycleState = function () {
    var o = {};
    for (var k in cycles) {
      var C = cycles[k], h = byId[C.holder];
      o[k] = { members: C.ids.slice(), holder: C.holder, holderLayer: h ? h.layer : null, left: C.left,
        since: C.since, closer: C.closer === undefined ? null : C.closer, round: C.round, demand: !!C.demand, dormant: !!C.dormant,
        typical: {}, own: {}, turns: {}, distance: {}, best: {}, skip: Object.assign({}, C.skip) };
      // ⚠ `typical` is the EFFECTIVE bound (a member's own turns, else the row's pooled ones); `own` is the
      // member's own median with no fallback, and `turns` how many of its own COMPLETED turns are remembered. A
      // gate that asked only the effective one could not tell "this member has a history" from "the row does".
      for (var i = 0; i < C.ids.length; i++) {
        var g = byId[C.ids[i]], t = typicalTurn(C, g), ot = ownTypical(C, g);
        o[k].typical[C.ids[i]] = t === null ? null : r1(t);
        o[k].own[C.ids[i]] = ot === null ? null : r1(ot);
        o[k].turns[C.ids[i]] = (C.mem[C.ids[i]] || []).length;
        o[k].distance[C.ids[i]] = turnDistance(g);
        o[k].best[C.ids[i]] = C.best && C.best[C.ids[i]] !== undefined ? C.best[C.ids[i]] : null;
      }
    }
    return o;
  };

  // ---- R3a: the challenge GIVE-UP rule's own reading of the engine --------------------------------------------------
  // ⛔ THE FOUR-BRANCH LOOKUP IS THE ENGINE'S, NOT OURS. `canCompleteChallenge` (games/ptr/js/game.js:275, and the
  // same function in 2.7) decides a challenge by comparing ONE quantity against `goal`, and which quantity that is
  // the challenge itself declares: `currencyLocation[name]`, else `player[currencyLayer][name]`, else `player[name]`,
  // else `player.points`. A give-up rule that measured anything ELSE would be judging the attempt by a number the
  // game does not score it on — so this mirrors that lookup and nothing more.
  function challengeTmp(l, id) { var t = tmp[l]; return (t && t.challenges && t.challenges[id]) || null; }
  function challengeAmount(l, id) {
    var c = challengeTmp(l, id);
    if (!c) return null;
    try {
      var name = c.currencyInternalName;
      if (!name) return player.points;
      if (c.currencyLocation) return c.currencyLocation[name];
      if (c.currencyLayer) return player[c.currencyLayer][name];
      return player[name];
    } catch (e) { return null; }           // a fork whose challenge names a store this save has not got
  }
  // ⚠ `log10(0)` IS NaN IN break_eternity, AND FORMATTING A NaN SETS THE GAME'S OWN PANIC FLAG (`player.hasNaN`,
  // the same trap `fmt` carries a guard for). Below one unit of the currency there is no exponent to speak of and
  // the honest answer is zero, so the log is never taken there.
  function log10Of(x) {
    if (x === null || x === undefined) return null;
    var d;
    try { d = D(x); } catch (e) { return null; }
    if (!d || typeof d.log10 !== 'function' || typeof d.lt !== 'function') return null;
    var v;
    try { if (d.lt(D(1))) return 0; v = Number(d.log10()); } catch (e) { return null; }
    return isFinite(v) ? v : null;
  }
  /** How far this attempt has come, as a fraction of the GOAL'S OWN EXPONENT: 0 below one unit, 1 at the goal. */
  function challengeProgress(l, id) {
    var c = challengeTmp(l, id);
    if (!c) return null;
    var g = log10Of(c.goal);
    if (g === null || !(g > 0)) return null;     // a goal of one unit or less has no exponent to be a fraction of
    var a = log10Of(challengeAmount(l, id));
    return a === null ? null : a / g;
  }
  /** The layer's own resource, floored at one unit — R2's empty-purse lesson: a multiple of nothing is no condition. */
  function layerHeld(l) { var h = D(player[l] && player[l].points); return h.lt(D(1)) ? D(1) : h; }

  var chAttempt = {};   // feature id → {id, at, held, anchorAt, anchorP} — the attempt in progress
  var chFailed = {};    // feature id → {<challenge id>: "<the layer's own points when that attempt began>"}
  var pct = function (x) { return Math.round(Number(x) * 1000) / 10; };

  /** The attempt record, SEEDED at the first tick the rule runs for a challenge it has no record of. */
  // ⚠ A RESUMED RUN CAN FIND ITSELF INSIDE A CHALLENGE IT HAS NO MEMORY OF — a snapshot taken mid-attempt, a player
  // who entered by hand and then switched the modifier on, or a `--no-runtime` control. Seeding the window HERE is
  // `stallSince`'s own precedent and its own reason: the alternative is an attempt that looks as if it began at
  // time zero, which would give up on the first tick. The cost is one window, which is what the first attempt is
  // for anyway.
  function attemptOf(f, id, now) {
    var m = chAttempt[f.id];
    // ⚠ `startHeld` IS SEEDED FROM THE PRESENT ON A SEEDED ATTEMPT, and that is the honest reading: the retry rule
    // asks "is the layer stronger than it was when this failed", and for an attempt whose start nothing recorded the
    // only strength this process can honestly name is the one it can see.
    // ⚠ NO `at` FIELD. The first cut carried the entry time as well, and nothing ever read it — the window works
    // off `anchorAt`, which moves. A record a resume restores is not the place for a value no decision consults, and
    // a mutant that changed it reddened nothing, which is how it was found.
    if (!m || m.id !== id) m = chAttempt[f.id] = { id: id, held: null, anchorAt: now, anchorP: null, startHeld: String(layerHeld(f.layer)) };
    return m;
  }
  /**
   * The give-up decision for the challenge this feature is inside. `G` is the parsed MODIFIER.
   * Returns {give, code, values}; `give` true means leave it without completing it.
   */
  function decideGiveUp(f, G, id) {
    var l = f.layer, now = Number(player.timePlayed) || 0;
    var m = attemptOf(f, id, now);
    var p = challengeProgress(l, id);
    // a challenge whose goal or currency this engine does not publish cannot be judged — and saying so is better
    // than guessing: the feature reports exactly what it reported before this slice.
    if (p === null) return { give: false, code: 'in-challenge', values: { id: id } };
    if (m.anchorP === null) m.anchorP = p;
    var b = Number(G.params.b), h = Number(G.params.h);
    var gap = 1 - m.anchorP;
    var need = gap > 0 ? b * gap : 0;
    var closed = p - m.anchorP;
    // ⚠ STRICTLY GREATER. With B = 0 (`@0/H`, the bare rule and the control) a plateau closes exactly 0 of 0,
    // and `>=` would call that progress and never give up — which is the very state the rule exists to leave.
    if (closed > need) { m.anchorAt = now; m.anchorP = p; m.held = null; return { give: false, code: 'waiting:progress', values: { id: id, pct: pct(p), need: pct(b), held: 0, hold: h } }; }
    if (m.held === null) m.held = m.anchorAt;
    var held = now - m.held;
    if (held >= h) return { give: true, code: 'acted:challenge-give-up', values: { id: id, pct: pct(p), need: pct(b), hold: h } };
    return { give: false, code: 'waiting:progress', values: { id: id, pct: pct(p), need: pct(b), held: r1(held), hold: h } };
  }
  /** After a give-up: `{code, values}` while this challenge must still wait, or null once it may be tried again.
   *  ⛔ V5: the condition is the MODIFIER ROW's own (`RETRY_CONDITIONS`); this function only finds the record. */
  function retryWait(f, G, id) {
    var rec = chFailed[f.id];
    if (!rec || rec[id] === undefined) return null;
    var M = byStrategyId(f.kind, G.id);
    if (!M || !M.retry) return null;
    var r = rec[id];
    // a condition that keeps state (a count, a clock) turns R3a's string record into an object the first time it reads
    // it; R3a's own row never does, so its record stays exactly what it wrote
    if (M.retry !== RETRY_CONDITIONS[0] && typeof r === 'string') r = rec[id] = { held: r };
    return M.retry.wait(f, G.params, id, r);
  }
  /** The record written AT THE GIVE-UP. R3a's row writes exactly what R3a wrote — the strength as a STRING. */
  function retrySeed(f, G, startHeld) {
    var M = byStrategyId(f.kind, G.id);
    var R = M && M.retry ? M.retry : RETRY_CONDITIONS[0];
    return R.seed(f, G.params, Number(player.timePlayed) || 0, startHeld);
  }
  /** The strength the failed attempt started from, from either shape of record. */
  function retryHeld(rec) { return typeof rec === 'string' ? rec : (rec && rec.held !== undefined ? rec.held : '1'); }
  /** An OBJECT record, from either shape — a condition switched on AFTER the give-up finds R3a's string and keeps it. */
  function retryObject(rec) { return typeof rec === 'string' ? { held: rec } : (rec || {}); }
  // ---- the reset COUNT (V5) ---------------------------------------------------------------------------------------
  // ⛔ THE LOADER'S OWN MEMORY, AND AN INCREMENT, NEVER A DIFFERENCE AGAINST A BASE. `stats.actions` is the loader's
  // per-feature action count; it is in `runtimeState()` and it CONTINUES ACROSS A RESUME (R3b-1 §33), while a run that
  // resumes WITHOUT the runtime record starts it at zero again. A count kept as "actions now − actions at the give-up"
  // would go negative on the second kind of resume; so the record keeps the last value it SAW per feature and adds
  // only what it has seen grow, and a counter that went backwards is re-read rather than subtracted. The record is in
  // `runtimeState().challengeFailed` only while a wait is live, keyed by feature and challenge, so a resumed run
  // continues the count where the uninterrupted one would have been.
  /** The highest row with an unlocked layer this automation can reset, and that row's reset features. */
  function highestResetRow() {
    var best = null, fids = [], layersOf = [];
    for (var i = 0; i < features.length; i++) {
      var g = features[i];
      if (g.kind !== 'reset' || !isTreeLayer(g.layer)) continue;
      var u = false;
      try { u = !!(player[g.layer] && player[g.layer].unlocked); } catch (e) { u = false; }
      if (!u) continue;
      var row = Number(layers[g.layer].row);
      if (best === null || row > best) { best = row; fids = []; layersOf = []; }
      if (row === best) { fids.push(g.id); layersOf.push(g.layer); }
    }
    return { row: best, fids: fids, layers: layersOf };
  }
  function actionsOf(fid) { return Number(stats.actions[fid]) || 0; }
  function resetsSeed(startHeld, live) {
    var H = highestResetRow(), seen = {};
    // the LIVE reading watches every reset feature, because the row it counts can change under it
    var watch = live ? features.filter(function (g) { return g.kind === 'reset'; }).map(function (g) { return g.id; }) : H.fids;
    for (var i = 0; i < watch.length; i++) seen[watch[i]] = actionsOf(watch[i]);
    return { held: startHeld, row: H.row, fids: H.fids.slice(), layers: H.layers.slice(), done: 0, seen: seen };
  }
  function resetsWait(f, P, id, rec, live) {
    var r = rec;
    // a condition chosen AFTER the give-up (R3a's string record) seeds its count HERE — `attemptOf`'s precedent: the
    // only moment this process can honestly name is the one it can see
    if (r.seen === undefined) { var s0 = resetsSeed(r.held, live); for (var k0 in s0) r[k0] = s0[k0]; }
    if (live) { var H = highestResetRow(); r.row = H.row; r.fids = H.fids.slice(); r.layers = H.layers.slice(); }
    var inRow = {};
    for (var i = 0; i < r.fids.length; i++) inRow[r.fids[i]] = true;
    for (var fid in r.seen) {
      var n = actionsOf(fid), was = Number(r.seen[fid]) || 0;
      if (n > was && inRow[fid]) r.done += n - was;
      r.seen[fid] = n;                                   // a counter that went BACKWARDS is re-read, never subtracted
    }
    if (live) for (var j = 0; j < r.fids.length; j++) if (r.seen[r.fids[j]] === undefined) r.seen[r.fids[j]] = actionsOf(r.fids[j]);
    var need = Math.round(Number(P.n));
    if (r.done >= need) return null;
    return { code: 'waiting:retry-resets', values: { id: id, done: r.done, need: need, row: r.row === null ? '—' : r.row, layers: r.layers.slice() } };
  }
  // ---- a SIDE parameter (V5): a predicate stored beside the policy string --------------------------------------------
  //   the declared default ('')  <  `--auto-opt arg:<id>.<name>=`  <  the PLAYER's `player.au.edits[<id>].args[<name>]`
  //   <  a runtime override (`setArg`) — the controls' own precedence (V4), for the same reasons.
  function sideSaved(f, name) {
    var e = editsOf(), a = e && e[f.id] ? e[f.id].args : undefined;
    var v = a && typeof a === 'object' ? a[name] : undefined;
    if (typeof v !== 'string') return null;
    return checkPredicate(v) ? null : v;          // a save this build cannot compile is ignored, never run
  }
  function sideArg(f, name) {
    if (f.args && f.args[name] !== undefined && f.args[name] !== null) return f.args[name];
    var s = sideSaved(f, name);
    if (s !== null) return s;
    var o = T.options && T.options['arg:' + f.id + '.' + name];
    return o === undefined ? '' : String(o).trim();
  }
  function sidePredicate(f, name) {
    var src = sideArg(f, name);
    if (!src) return { src: null, fn: null, error: null };
    var c = f.predCache || (f.predCache = {}), key = 'arg:' + name;
    if (!c[key] || c[key].src !== src) {
      var err = null, fn = null;
      try { fn = T.predicate(src); } catch (e) { err = String((e && e.message) || e); }
      c[key] = { src: src, fn: fn, error: err };
    }
    return c[key];
  }
  /** Every side parameter of the modifier in force, with its value — what the editors show. */
  function sideArgsOf(f, M) {
    var o = {};
    if (!M) return o;
    for (var i = 0; i < M.params.length; i++) if (M.params[i].side) o[M.params[i].name] = sideArg(f, M.params[i].name);
    return o;
  }
  /** What the Advanced view shows about the modifier — a READOUT, never a decision (V1's rule). */
  T.stallState = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var P = parsedOf(f);
    if (!P || !P.modifier) return null;
    var M = byStrategyId(f.kind, P.modifier.id);
    if (!M || M.readout !== 'stall') return null;     // R3a: a modifier's readout belongs to its own ROW
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
      var P = parsedOf(f), before = startOf(f), beforeReset = lastReset[f.id];
      // ⛔ ONLY AN OWN-RULE INTERVAL IS REMEMBERED (see stallFallback): a reset the FALLBACK fired must not feed the
      // threshold that decides when the fallback may fire, or the timeout grows with every timeout.
      if (stallMod(P) && !d.fallback && before !== undefined) pushInterval(f, P, (Number(player.timePlayed) || 0) - before);
      doReset(f.layer);
      lastReset[f.id] = Number(player.timePlayed) || 0;
      // R3b: one reset spent out of this member's turn, and the interval it closes is what its guard is late
      // against. `beforeReset` is this feature's PREVIOUS own reset, captured before `lastReset` was overwritten.
      turnSpend(f, beforeReset);
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
      var n = 0, bought = [], held = false, seen = 0, minC = null, minId = null, autoed = [];
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!B[id] || !B[id].unlocked) continue;
        // ⛔ YIELD TO THE GAME'S OWN AUTOBUYER — PER BUYABLE (R2). `reset` has yielded to `tmp[l].autoPrestige` since
        // A1; a PURCHASE kind did not, and the moment a game grants its own buy-max the two are managing the same
        // buyable. PTR's q milestone 1 turns on `player.e.auto` (Enhancers, layers.js:1332) and `player.t.autoExt`
        // (Extra Time Capsules, :1007), and the game then buys both with `buyMax()` and NO reserve. Measured
        // (gate R2-3b, from `all/M19.json`, 1500 ticks, twice equal): with the natives on, `buyables:e` acted **0**
        // times — it was already inert — and `buyables:t` acted **32**, which is the double-buy, on top of the
        // native buyer, for 2 more capsules and no mark moved.
        // ⚖ MINIMIZE HARDCODING: the condition is the GAME'S OWN DECLARATION, not a table entry. 2.7 lets a buyable
        // declare `autoed()` and the engine evaluates it into `tmp[l].buyables[id].autoed` (verified live on ptr:
        // t11 and e11 both true at the M19 fixture). The word appears in **16 of 171** games' sources by a bounded
        // text grep over `games/*/`, re-measured 2026-09-20 — a game that does not declare it is unaffected, because
        // a game that does not declare it is unaffected, because `undefined` is falsy.
        // ⚠ TRUTHY, NOT `=== true`. A strict comparison was the first cut and it is the defect it is meant to
        // prevent, upside down: `autoed()` is the GAME's own expression and nothing makes it return a boolean —
        // a fork returning `1`, or a Decimal, means YES, and a strict check would silently go on double-buying.
        // Falsy is the whole of "no", and that is what the 155 games with no declaration rely on.
        if (B[id].autoed) { autoed.push(id); continue; }
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
      // every unlocked buyable of this layer is the GAME's to buy — the same sentence `reset` already says
      if (!seen && autoed.length) return { act: false, code: 'yielding:native', values: { layer: l } };
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
    // ⛔ R3a: WITH THE `give-up@B/H/Rx` MODIFIER the same rule gains an EXIT and a RETRY rule. Both ride on the
    // refusal, exactly as the reset kind's stall modifier does — the primary still decides who to enter and when to
    // exit-and-complete, and the modifier only speaks where `sequential` alone had nothing to say.
    // ⚠ READ THROUGH `parsedOf`, NOT OFF THE POLICY STRING. With a modifier the string is `sequential|give-up@…`,
    // and the old `f.policy !== 'sequential'` test would have reported the whole feature `off:policy`.
    challenges: function (f) {
      var P = parsedOf(f);
      if (!P || P.id !== 'sequential') return { act: false, code: 'off:policy', values: { policy: f.policy } };
      var G = P.modifier;
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
      var cs = stats.challenges[f.id] || (stats.challenges[f.id] = { enter: 0, exit: 0, gaveUp: 0 });
      if (cs.gaveUp === undefined) cs.gaveUp = 0;
      var act = player[l].activeChallenge;
      if (act !== null && act !== undefined && act !== 0 && act !== false) {
        if (pick === null || Number(act) !== pick) return { act: false, code: 'in-challenge', values: { id: Number(act) } };
        if (canCompleteChallenge(l, pick)) {
          if (typeof canExitChallenge === 'function' && !canExitChallenge(l, pick)) return { act: false, code: 'blocked:exit', values: { id: pick } };
          startChallenge(l, pick);
          cs.exit++;
          delete chAttempt[f.id];
          return { act: true, n: 1, code: 'acted:challenge-exit', values: { id: pick } };
        }
        if (!G) return { act: false, code: 'in-challenge', values: { id: pick } };
        var g = decideGiveUp(f, G, pick);
        if (!g.give) return { act: false, code: g.code, values: g.values };
        // ⚠ THE ENGINE STILL HAS THE LAST WORD ON LEAVING. `canExitChallenge` is the same guard the exit-and-complete
        // path asks, and a challenge a fork refuses to let go of is not one a rule here can walk out of.
        if (typeof canExitChallenge === 'function' && !canExitChallenge(l, pick)) return { act: false, code: 'blocked:exit', values: { id: pick } };
        // ⛔ THE STRENGTH THIS ATTEMPT STARTED FROM is what the retry rule compares against, and it is recorded at
        // ENTRY rather than read here: entering a challenge is a forced layer reset, so by now `player[l].points` is
        // whatever being INSIDE has left, which is a measurement of the challenge and not of the run's strength.
        (chFailed[f.id] || (chFailed[f.id] = {}))[pick] = retrySeed(f, G, chAttempt[f.id].startHeld);
        startChallenge(l, pick);
        cs.gaveUp++;
        delete chAttempt[f.id];
        return { act: true, n: 1, code: g.code, values: g.values };
      }
      if (pick === null) return { act: false, code: 'nothing-to-do', values: { kind: 'challenges', layer: l } };
      if (G) {
        var w = retryWait(f, G, pick);
        if (w !== null) return { act: false, code: w.code, values: w.values };
      }
      if (typeof canEnterChallenge === 'function' && !canEnterChallenge(l, pick)) return { act: false, code: 'blocked:enter', values: { id: pick } };
      var before = G ? layerHeld(l) : null;
      startChallenge(l, pick);
      if (Number(player[l].activeChallenge) === pick) {
        cs.enter++;
        if (G) { delete chAttempt[f.id]; attemptOf(f, pick, Number(player.timePlayed) || 0).startHeld = String(before); }
        return { act: true, n: 1, code: 'acted:challenge-enter', values: { id: pick } };
      }
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

  // ---- V4: `until` (the LATCHING stop) and `while` (the NON-LATCHING pause) ----------------------------------------
  /** `until`: once it has held, the feature stops and STAYS stopped until the player re-arms it. */
  function untilStep(f) {
    var hit = untilHitOf(f);
    var c = predicateOf(f, 'until');
    // ⚠ THE LATCH IS CHECKED BEFORE THE PREDICATE IS EVALUATED. That is what makes it a latch rather than a second
    // reading of the same condition: `until` is not monotone in general (M16's predicate is not — R2 measured it),
    // so a rule that re-read it every tick would be `while` spelled differently.
    if (hit !== null) { if (!c.src) { writeEdit(f.id, 'untilHit', null); return null; } return { code: 'stopped:until', values: { until: c.src, at: hit } }; }
    if (!c.src) return null;
    var v = evalPredicate(c);
    if (v.error) return { code: 'blocked:predicate', values: { which: 'until', src: c.src } };
    if (!v.value) return null;
    var now = Math.round((Number(player.timePlayed) || 0) * 10) / 10;
    writeEdit(f.id, 'untilHit', now);
    invalidateView();
    return { code: 'stopped:until', values: { until: c.src, at: now } };
  }
  /** `while`: the feature acts only while the predicate holds — the table's `gates` slot, with a player's edit on it. */
  function whileStep(f) {
    var c = predicateOf(f, 'while');
    if (!c.src) return null;
    var v = evalPredicate(c);
    if (v.error) return { code: 'blocked:predicate', values: { which: 'while', src: c.src } };
    if (v.value) return null;
    return { code: 'blocked:gate', values: { gate: c.src, owner: controlOwner(f, 'while') } };
  }
  // ---- R3a: what a PAUSE on this kind LEAVES BEHIND --------------------------------------------------------------
  // ⚖ THE DECISION, AND THE REASON IT GOES THIS WAY. A `while` that goes false while the game is inside a challenge
  // means STOP ENTERING, never LEAVE — because `while` is ONE mechanism shared by six kinds and its whole contract is
  // "the feature does nothing while this is false". Making it act would make a pause destructive on exactly one kind
  // (leaving a challenge is a forced layer RESET), and a pause that resets a layer is not a pause.
  // ⛔ BUT SILENCE WAS THE DEFECT, AND IT IS MEASURED. R3a put `while: player.h.activeChallenge === null` on PTR's
  // `challenges:h` — the shape a player writes for "only act when I am not in one" — and the run entered H11, went
  // false, and sat inside a challenge it completes in 65 game-seconds for the remaining 3,935 of the leg, reporting
  // `blocked:gate` and nothing else. So the KIND declares when a pause has stranded the game, and the reason line
  // says so and names which control did it. Only `challenges` declares one, and that is not an accident of this
  // game: it is the only kind whose act puts the GAME into a mode that only this feature will take it out of.
  var STRANDED = {
    challenges: function (f) {
      var a = player[f.layer] && player[f.layer].activeChallenge;
      return a === null || a === undefined || a === 0 || a === false ? null : Number(a);
    },
  };
  /** The `paused:in-challenge` values, or null when this pause strands nothing. */
  function strandedBy(f, stop) {
    if (!STRANDED[f.kind]) return null;
    var which = stop.code === 'stopped:until' ? 'until' : stop.code === 'blocked:gate' ? 'while' : null;
    if (!which) return null;             // a predicate that THREW keeps its own code — that is the bigger news
    var id = STRANDED[f.kind](f);
    if (id === null) return null;
    return { id: id, which: which, src: which === 'until' ? stop.values.until : stop.values.gate };
  }

  // ---- V4: PRIORITY — the order a LAYER's features act in, inside one tick ------------------------------------------
  // ⛔ CACHED PER `gameLoop`, NOT PER LAYER CALL, and there is a measurement behind the shape: `runLayer` is called
  // once per hooked layer per loop, so re-sorting inside it would be O(layers × features log features) every tick
  // for a feature nobody has edited. The cache is rebuilt at the same once-per-loop point `watchTick` runs at.
  // ⚠ AND THE COMMON CASE ALLOCATES NOTHING. With no priority edited anywhere, `byLayer` — registration order,
  // which IS layer order × kind order — is returned as it stands, so "nothing edited ⇒ byte-identical" is a
  // property of the code rather than a claim a gate has to keep re-checking. (It checks anyway: gate V4-5.)
  // ⛔ IT CANNOT REACH ACROSS LAYERS. The ENGINE decides in what order layers run (`gameLoop` walks `layers`, and
  // 2.2.1 skips a layer the player has not unlocked, which is why the `au` layer has a fallback pass at all). PTR's
  // Extra Time Capsules spend Boosters, so `buyables:t` and `buyables:b` DO compete for one currency across two
  // layers — and no number here can order them. The doc and the block both say so rather than implying otherwise.
  var byLayer = {};
  var orderCache = {};
  var orderLoop = -1;
  function layerOrder(l) {
    if (orderLoop !== loopNo) { orderCache = {}; orderLoop = loopNo; }
    if (orderCache[l]) return orderCache[l];
    var base = byLayer[l] || (byLayer[l] = features.filter(function (f) { return f.layer === l; }));
    var moved = false;
    for (var i = 0; i < base.length; i++) if (priorityOf(base[i]) !== base[i].kindIndex) { moved = true; break; }
    if (!moved) return (orderCache[l] = base);
    // ⚠ A STABLE SORT, so TIES KEEP THE KIND ORDER (§13b's own words). Array#sort is stable in every engine these
    // games run on; the index tiebreak makes it so whatever the engine does.
    var idx = {};
    base.forEach(function (f, i2) { idx[f.id] = i2; });
    return (orderCache[l] = base.slice().sort(function (a, b) { return priorityOf(a) - priorityOf(b) || idx[a.id] - idx[b.id]; }));
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
    // ⚠ R3b: THE CYCLE STEPS BESIDE THE WATCH, and AFTER it on purpose — the watch may change a feature's policy
    // this tick, and whether a feature CARRIES the cycle modifier is read from the policy in force.
    if (watchLoop !== loopNo) { watchLoop = loopNo; watchTick(); orderLoop = -1; cycleTick(); }
    var list = layerOrder(l);
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      // ⚠ EVERY exit records, including the ones that do nothing: a feature the player can see in the tab and that
      // is not running has a reason too, and `off` / `locked` / `armed` are the three the tab shows most often.
      if (!active(f)) { say(f, featureUnlocked(f) ? 'off' : (isOnSaved(f) ? 'armed' : 'locked'), null); f.onSince = null; continue; }
      // `onSince`: when this feature last became ELIGIBLE (on, unlocked, under a profile that runs it) with nothing
      // done since. It is what `neverFired` is measured over, and it lives outside `player` like `f.last`.
      if (f.onSince === null) f.onSince = Number(player.timePlayed) || 0;
      // ---- V4: the two PREDICATE controls, in this order and for this reason -----------------------------------
      // ⛔ `until` FIRST, because a feature that has STOPPED has stopped: reporting `blocked:gate` for something the
      // player told to stop would name the wrong reason, and the latch is not conditional on the pause.
      // ⚠ A RUN-TIME THROW IS CONTAINED TO ITS OWN FEATURE and never reads as `false` — `continue`, not `throw`, so
      // every other feature of the layer still decides this tick (the brief's Part 1(b), and it is what a player
      // who mistypes one predicate needs: one dead feature, not a dead tick).
      var stop = untilStep(f) || whileStep(f);
      if (stop) { var strand = strandedBy(f, stop); say(f, strand ? 'paused:in-challenge' : stop.code, strand || stop.values); continue; }
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
    for (var k in stats.challenges) ch[k] = { enter: stats.challenges[k].enter, exit: stats.challenges[k].exit, gaveUp: stats.challenges[k].gaveUp || 0 };
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
    // ---- V4: the RUNTIME overrides of the three per-feature controls --------------------------------------------
    // ⛔ ONE BLOCK, AND ONLY WHEN IT HAS SOMETHING TO SAY — V2's and V3's rule, with V2's and V3's consequence: a run
    // in which nothing calls `setControl` writes EXACTLY the record it wrote before V4, so every snapshot committed
    // in this repo stays valid and every pinned resume reproduces. `gates-v4 --part 5` measures that.
    // ⚠ The `until` LATCH IS NOT HERE. It is in the SAVE (`player.au.edits[<id>].untilHit`), because a stop a
    // reload forgets means nothing to a player — and the save is what a resume restores anyway.
    var ct = {}, nc = 0;
    for (var ci = 0; ci < features.length; ci++) {
      var cf = features[ci], one = null;
      for (var cn2 = 0; cn2 < CONTROLS.length; cn2++) { var nm = CONTROLS[cn2].name; if (cf.controls[nm] !== null && cf.controls[nm] !== undefined) (one || (one = {}))[nm] = cf.controls[nm]; }
      if (one) { ct[cf.id] = one; nc++; }
    }
    if (nc) o.controls = ct;
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
    // ---- R3b: the ROW CYCLE's memory ------------------------------------------------------------------------------
    // ⛔ THE SAME RULE AS EVERY BLOCK ABOVE, FOR THE SAME REASON: it appears only when it has something to say. The
    // cycle's whole state is the LOADER's own — ⛔ never `player.<layer>.resetTime`, which exists only on the
    // 2.7-style engine (the planner's nine void cells compared six of themselves against `undefined` on ptr and
    // measured nothing) — so a run whose tables name no cycle writes EXACTLY the record it wrote before this slice
    // and every snapshot committed in this repo stays valid (gate R3b-5).
    var cy = {}, ncy = 0;
    for (var yi in cycles) {
      var YC = cycles[yi];
      cy[yi] = { holder: YC.holder, left: YC.left, since: YC.since, acted: YC.acted === undefined ? null : YC.acted,
        closer: YC.closer === undefined ? null : YC.closer,
        round: YC.round, at: YC.at, mem: JSON.parse(JSON.stringify(YC.mem)), skip: Object.assign({}, YC.skip),
        arm: Object.assign({}, YC.arm || {}), best: Object.assign({}, YC.best || {}) };
      ncy++;
    }
    if (ncy) o.cycle = cy;
    // ---- R3a: the challenge give-up rule's memory ----------------------------------------------------------------
    // ⛔ THE SAME RULE, FOR THE SAME REASON, WITH THE SAME CONSEQUENCE (V2's and V3's): each block appears only when
    // it has something to say, and nothing writes into either object unless a `give-up` modifier is in force — so a
    // run whose tables name no modifier writes EXACTLY the record it wrote before this slice, every snapshot
    // committed in this repo stays valid, and `gates-v3 --part 2`'s key-set row does not move.
    // ⚠ The failed-attempt strengths are STRINGS, like `rateBest`, because a Decimal held in memory and one
    // round-tripped through JSON are not guaranteed to be the same number — and a resumed run has to take the path
    // the uninterrupted one took.
    var ca = {}, nca = 0;
    for (var ai in chAttempt) { ca[ai] = Object.assign({}, chAttempt[ai]); nca++; }
    if (nca) o.challengeAttempt = ca;
    var cg = {}, ncg = 0;
    // ⚠ V5: a record may now be an OBJECT (a reset count, a clock), so the copy is DEEP — a shallow one would hand
    // the caller the live counters. R3a's string records serialise exactly as before.
    for (var gi in chFailed) { cg[gi] = JSON.parse(JSON.stringify(chFailed[gi])); ncg++; }
    if (ncg) o.challengeFailed = cg;
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
    // V4: the runtime control overrides, validated the same way a restored policy is — a record this build cannot
    // validate is a THROW, not a silently different configuration.
    for (var cj = 0; cj < features.length; cj++) for (var ck = 0; ck < CONTROLS.length; ck++) features[cj].controls[CONTROLS[ck].name] = null;
    for (k in rt.controls || {}) if (byId[k]) for (var cn3 in rt.controls[k]) {
      if (!controlRow(cn3)) throw new Error('restoreRuntime: "' + cn3 + '" is not a per-feature control');
      var cw = checkParam(CONTROL_ROW, cn3, rt.controls[k][cn3]);
      if (cw) throw new Error('restoreRuntime: control ' + k + '.' + cn3 + ' — ' + cw);
      byId[k].controls[cn3] = rt.controls[k][cn3];
    }
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
    for (k in cycles) delete cycles[k];
    for (k in rt.cycle || {}) {
      var rc = rt.cycle[k];
      cycles[k] = { holder: rc.holder === undefined ? null : rc.holder, left: Number(rc.left) || 0,
        since: rc.since === null || rc.since === undefined ? null : Number(rc.since),
        acted: rc.acted === null || rc.acted === undefined ? null : Number(rc.acted), round: Number(rc.round) || 0,
        closer: rc.closer === null || rc.closer === undefined ? null : Number(rc.closer),
        at: rc.at === undefined ? -1 : Number(rc.at), mem: JSON.parse(JSON.stringify(rc.mem || {})),
        skip: Object.assign({}, rc.skip || {}), arm: Object.assign({}, rc.arm || {}), best: Object.assign({}, rc.best || {}), ids: [] };
    }
    for (k in chAttempt) delete chAttempt[k];
    for (k in rt.challengeAttempt || {}) chAttempt[k] = Object.assign({}, rt.challengeAttempt[k]);
    for (k in chFailed) delete chFailed[k];
    for (k in rt.challengeFailed || {}) chFailed[k] = JSON.parse(JSON.stringify(rt.challengeFailed[k]));
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
    // V4: a table predicate that does not COMPILE is a hard fail of the load, exactly as `gate` has always been —
    // the check is `T.predicate`, the one every other predicate in this file goes through.
    ['gate', 'gateDerived', 'until'].forEach(function (k) {
      if (typeof def[k] === 'string' && def[k]) { var why = checkPredicate(def[k]); if (why) throw new Error('registerAutoFeature ' + def.id + ': ' + k + ' — ' + why); }
    });
    if (def.priority !== undefined && def.priority !== null) {
      var pw = checkParam(CONTROL_ROW, 'priority', def.priority);
      if (pw) throw new Error('registerAutoFeature ' + def.id + ': priority — ' + pw);
    }
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
      // ---- V4: the per-feature CONTROLS, and the GATE is now one of them ------------------------------------------
      // `gate0` is the slot's TABLE value (`autoTable.gates[<id>]`, or `--auto-opt while:<id>=`), compiled HERE so a
      // table that ships a predicate which does not compile fails the page load exactly as it always has.
      // `gateDerived` is what the generic derivation would say (null today — plan §27 records why).
      // `controls` is the runtime override layer, memory OUTSIDE `player` like `policyRuntime`.
      gate0: typeof def.gate === 'string' && def.gate ? def.gate : null,
      gateDerived: typeof def.gateDerived === 'string' && def.gateDerived ? def.gateDerived : null,
      until0: typeof def.until === 'string' && def.until ? def.until : null,
      priority0: def.priority === undefined || def.priority === null ? null : Math.round(Number(def.priority)),
      controls: { 'while': null, until: null, priority: null },
      // its kind's 1-based place in THIS game's kind order — the default `priority`, so "nothing edited" is the
      // order the loader has always run in, by construction
      kindIndex: kindOrderNow.indexOf(def.kind) + 1,
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
    // ⛔ V4: `gateSrc` AND `gate` ARE GETTERS OVER THE SAME PRECEDENCE, for the reason `policy` is one — the tab, the
    // decision path and `explain()` must not be able to disagree about which predicate is in force, and a cached
    // copy would need invalidating from four writers. `gate` is still the compiled FUNCTION (or null), so every
    // consumer written before V4 goes on working unchanged.
    Object.defineProperty(f, 'gateSrc', { enumerable: true, get: function () { return controlOf(f, 'while'); } });
    Object.defineProperty(f, 'gate', { enumerable: false, get: function () { var c = predicateOf(f, 'while'); return c.fn; } });
    features.push(f);
    byId[f.id] = f;
    byLayer = {}; orderCache = {};   // V4: the per-layer running order is derived from `features`, so it is rebuilt
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

  // ---- V4: THE PER-FEATURE CONTROLS — ONE precedence, in ONE place, for all three ---------------------------------
  //   the generic derivation  <  the game's TABLE (`autoTable.gates`, and `--auto-opt while:/until:/priority:<id>=`)
  //   <  the PLAYER's saved edit (`player.au.edits[<id>].while | .until | .priority`)  <  a runtime override.
  // It is V2's chain with ONE link fewer: it does NOT pass through the stall watch's rung, and that is V3 §21.8's
  // own answer — the rung replaces a POLICY, and these are not policies, so a feature the watch has escalated still
  // has the player's pause and stop.
  // ⚠ `null` means NOT SET and falls through; `''` means SET TO NONE and does not — which is how a player removes a
  // gate the game's table shipped (PTR's `reset:q`). A count has no "explicitly none": clearing it drops the key.
  var CTL_BASE = { 'while': 'gate0', until: 'until0', priority: 'priority0' };
  var CTL_DERIVED = { 'while': 'gateDerived' };
  function savedControl(f, name) {
    var e = editsOf();
    var v = e && e[f.id] ? e[f.id][name] : undefined;
    if (v === undefined || v === null) return null;
    // ⚠ A SAVE THIS BUILD CANNOT VALIDATE IS IGNORED, NOT RUN — V2's rule for a saved policy, and it matters more
    // here: `while` and `until` are `new Function` over text from a save file (docs/contract.md says what that
    // widens and what it does not).
    if (checkParam(CONTROL_ROW, name, v)) return null;
    return name === 'priority' ? Math.round(Number(v)) : String(v);
  }
  function controlOf(f, name) {
    var r = f.controls ? f.controls[name] : null;
    if (r !== null && r !== undefined) return r;
    var s = savedControl(f, name);
    if (s !== null) return s;
    var t = f[CTL_BASE[name]];
    if (t !== null && t !== undefined) return t;
    var d = CTL_DERIVED[name] ? f[CTL_DERIVED[name]] : null;
    return d === undefined ? null : d;
  }
  /** WHOSE value is in force — `runtime` | `you` | `table` | `derived`, or null when nothing set one. */
  function controlOwner(f, name) {
    if (f.controls && f.controls[name] !== null && f.controls[name] !== undefined) return 'runtime';
    if (savedControl(f, name) !== null) return 'you';
    var t = f[CTL_BASE[name]];
    if (t !== null && t !== undefined) return 'table';
    var d = CTL_DERIVED[name] ? f[CTL_DERIVED[name]] : null;
    return d === null || d === undefined ? null : 'derived';
  }
  // ⛔ COMPILED ONCE, AGAINST THE SOURCE — never per tick. `parsedOf` does exactly this for a policy string and for
  // the same reason: the source can change under the reader (an edit, a load, a runtime override), so the cache key
  // is the source itself rather than a generation counter somebody has to remember to bump.
  // ⚠ A COMPILE ERROR IS KEPT, not thrown away. `holds()` turns a run-time throw into `false`, which is the right
  // answer for a gate and the WRONG thing to show a player who has mistyped one — so the error travels with the
  // compiled form and the decision path has a code for it.
  function predicateOf(f, name) {
    var src = controlOf(f, name);
    if (!src) return { src: null, fn: null, error: null };
    var c = f.predCache || (f.predCache = {});
    if (!c[name] || c[name].src !== src) {
      var err = null, fn = null;
      try { fn = T.predicate(src); } catch (e) { err = String((e && e.message) || e); }
      c[name] = { src: src, fn: fn, error: err };
    }
    return c[name];
  }
  /** A predicate's answer, with a RUN-TIME throw kept apart from a false: `{value, error}`. */
  function evalPredicate(c) {
    if (!c.fn) return { value: null, error: c.error || (c.src ? 'it did not compile' : null) };
    try { return { value: !!c.fn(), error: null }; } catch (e) { return { value: null, error: String((e && e.message) || e) }; }
  }
  /** The game-second `until` first held, or null. ⛔ IT IS IN THE SAVE: a latch a reload forgets means nothing to
   *  a player, and it lives under `au`, which `hashGame` excludes — so it cannot move a pinned game state. */
  function untilHitOf(f) {
    var e = editsOf(), v = e && e[f.id] ? e[f.id].untilHit : undefined;
    if (typeof v === 'number' && isFinite(v)) return v;
    return v === true ? 0 : null;
  }
  /** Write one field of a feature's edit entry, MERGING (V3's rule), and drop the entry when nothing is left. */
  function writeEdit(id, name, value) {
    var e = editsOf();
    if (!e) return false;
    var entry = Object.assign({}, e[id] || {});
    if (value === undefined || value === null) delete entry[name]; else entry[name] = value;
    var left = 0;
    for (var k in entry) left++;
    if (left) setIn(e, id, entry); else delIn(e, id);
    return true;
  }
  /** A feature's EFFECTIVE priority: the number in force, else its kind's 1-based place in this game's kind order. */
  function priorityOf(f) { var p = controlOf(f, 'priority'); return p === null || p === undefined ? f.kindIndex : p; }
  T.savedControl = function (id, name) { var f = byId[id]; if (!f) throw new Error('no feature "' + id + '"'); if (!controlRow(name)) throw new Error('no control "' + name + '"'); var e = editsOf(); var v = e && e[id] ? e[id][name] : undefined; return v === undefined ? null : v; };
  /** Write the player's own `while` / `until` / `priority`. `{ok, value, error}`; ⛔ a REFUSAL changes nothing and
   *  says why — V2's rule, and the one the brief names for a predicate that will not compile. */
  T.setSavedControl = function (id, name, value) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var row = controlRow(name);
    if (!row) return { ok: false, value: controlOf(f, name), error: '"' + name + '" is not one of ' + CONTROLS.map(function (c) { return c.name; }).join(' / ') };
    var e = editsOf();
    if (!e) return { ok: false, value: controlOf(f, name), error: 'this save has no automation store yet (player.' + AU + '.edits)' };
    if (value === null || value === undefined) {
      writeEdit(id, name, null);
      // ⚠ CLEARING `until` DISARMS ITS LATCH TOO. A stop condition the player has removed must not go on stopping
      // the feature from a flag nothing is showing them any more.
      if (name === 'until') writeEdit(id, 'untilHit', null);
      player[AU].disclosed = true; invalidateView();
      return { ok: true, value: controlOf(f, name), error: null };
    }
    var v = row.type === 'predicate' ? String(value).trim() : String(value).trim();
    var why = checkParam(CONTROL_ROW, name, v);
    if (why) return { ok: false, value: controlOf(f, name), error: why };
    var was = controlOf(f, name);
    writeEdit(id, name, row.type === 'count' ? Math.round(Number(v)) : v);
    // ⚠ A CHANGED `until` RE-ARMS: the latch belongs to the condition that set it, and carrying it over to a
    // different condition would stop a feature for a reason that is no longer on screen.
    if (name === 'until' && was !== v) writeEdit(id, 'untilHit', null);
    player[AU].disclosed = true;
    invalidateView();
    return { ok: true, value: controlOf(f, name), error: null };
  };
  /** The RUNTIME override (never saved) — the harness's lever for these three, as `setPolicy` is for a policy. */
  T.setControl = function (id, name, value) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    if (!controlRow(name)) throw new Error('no control "' + name + '"');
    if (value === null || value === undefined) { f.controls[name] = null; invalidateView(); return null; }
    var v = String(value).trim();
    var why = checkParam(CONTROL_ROW, name, v);
    if (why) throw new Error('setControl ' + id + '.' + name + ': ' + why);
    f.controls[name] = controlRow(name).type === 'count' ? Math.round(Number(v)) : v;
    invalidateView();
    return f.controls[name];
  };
  /** Re-arm a feature its `until` has stopped. `{ok, error}` — the ONE way back, and it is the player's press. */
  T.rearm = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    if (untilHitOf(f) === null) return { ok: false, error: 'this feature is not stopped' };
    if (!editsOf()) return { ok: false, error: 'this save has no automation store yet (player.' + AU + '.edits)' };
    writeEdit(id, 'untilHit', null);
    invalidateView();
    return { ok: true, error: null };
  };
  /** Everything the tab and a gate need about one feature's three controls, from ONE place. */
  T.controlState = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var out = {};
    for (var i = 0; i < CONTROLS.length; i++) {
      var name = CONTROLS[i].name, row = CONTROLS[i];
      if (row.type === 'predicate') {
        var c = predicateOf(f, name), v = c.fn ? evalPredicate(c) : { value: null, error: c.error };
        out[name] = { value: controlOf(f, name), owner: controlOwner(f, name), holds: v.value, error: c.error || v.error,
          table: f[CTL_BASE[name]], derived: CTL_DERIVED[name] ? f[CTL_DERIVED[name]] : null, saved: T.savedControl(id, name) };
      } else {
        out[name] = { value: controlOf(f, name), owner: controlOwner(f, name), effective: priorityOf(f), kindPlace: f.kindIndex,
          table: f[CTL_BASE[name]], derived: null, saved: T.savedControl(id, name) };
      }
    }
    out.until.hitAt = untilHitOf(f);
    out.until.stopped = untilHitOf(f) !== null;
    return out;
  };
  // ---- V4b: RESET THE AUTOMATION SETTINGS, and NOTHING ELSE -------------------------------------------------------
  // ⚖ THE USER'S REQUEST, verbatim (2026-09-20): *"I want a tool to reset just the automation settings to the
  // defaults, without resetting all of the game data."* The second half is the requirement, and it is exactly what
  // `hashGame` already means: it excludes `player.au` and `player.subtabs.au`, so this press CANNOT move the game.
  //
  // ⛔ ITS SPECIFICATION IS A DEEP-EQUAL, NEVER A FIELD LIST. After the press `player.au` must equal what a FRESH
  // BOOT has, and `runtimeState()` must be back to its fresh key set. A list of fields to clear would go stale the
  // next time this arc adds one — V4 added four (`while`, `until`, `untilHit`, `priority`) and V3 added `escalate`
  // before it — and it would go stale SILENTLY. What makes the deep-equal sufficient is a property every field here
  // holds and every later one must: AN ABSENT FIELD BEHAVES IDENTICALLY TO ITS DEFAULT.
  //
  // ⛔ AND IT SPANS BOTH STORES. Clearing only the save leaves a feature the stall watch has ESCALATED, or one a
  // `setPolicy` runtime override is driving, running a policy nothing on screen names — the settings would read as
  // reset and the game would not behave as if they were.
  //
  // ⚠ WHAT IT DOES *NOT* TOUCH, and each has a reason:
  //   · the ENGINE's own per-layer stores under `player.au` (`points`, `clickables`, `upgrades`, …). They are the
  //     engine's, not the loader's, and `clickables` has one key per toggle BUTTON.
  //   · `lastReset` / `loopNo` / `ranAt` / `stats` in the runtime record. Those are the RUN's history — how long
  //     since each feature last reset, and what it has done — not a setting; they are in a fresh record too, and
  //     clearing them would move every pinned resume.
  //   · the per-browser fold map (`tmt-loader:<id>:ui.au.collapsed`). It is a VIEW preference, not a setting, it is
  //     not in the save, and the press says so.
  var RESET_CLEARS = [
    'which features are switched on',
    'the arming setting',
    'every strategy, value, pause, stop and priority you have edited',
    'the stall watch\u2019s option and every escalation list',
    'any override a measurement left running',
  ];
  T.resetClears = function () { return RESET_CLEARS.slice(); };
  /**
   * Put the automation back to what a fresh save has. `{ok, cleared, error}` — `cleared` COUNTS what it removed, so
   * a press that found nothing says so rather than claiming to have done something.
   * ⛔ IT IS NOT UNDOABLE, so the PRESS is two-step (see `tmtl-reset`); this function is the one that acts.
   */
  T.resetAutomation = function () {
    var au = player[AU];
    if (!au) return { ok: false, cleared: null, error: 'this save has no automation store yet' };
    var cleared = { features: 0, edits: 0, runtimePolicies: 0, runtimeControls: 0, runtimeEnabled: 0, escalations: 0, tracker: false, armLocked: false };
    var k;
    // ---- the SAVE ----------------------------------------------------------------------------------------------
    var e = editsOf();
    if (e) for (k in e) { cleared.edits++; delIn(e, k); }   // ⚠ INCLUDING the reserved `'*'` entry (the stall
                                                           //   watch's own settings): it is found by a key walk
                                                           //   and by NOTHING else — every other reader looks a
                                                           //   feature up BY ID and cannot see it.
    // ⚠ DELETED, NOT SET FALSE. A fresh save's `features` is `{}`, and "back to what a fresh save has" is the whole
    // specification — a map of explicit `false`s is a different object and would fail the deep-equal that is the
    // gate. `delIn` is `Vue.delete` where there is a Vue, so the observer is notified; a later toggle then ADDS a
    // key plainly, which is exactly what it does on a save that has never been touched.
    if (au.features) for (k in au.features) { if (au.features[k]) cleared.features++; delIn(au.features, k); }
    if (au.armLocked) { cleared.armLocked = true; au.armLocked = false; }
    au.disclosed = false;
    // ---- the memory OUTSIDE `player` ---------------------------------------------------------------------------
    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      if (f.policyRuntime !== null) { cleared.runtimePolicies++; f.policyRuntime = null; }
      for (var c = 0; c < CONTROLS.length; c++) if (f.controls[CONTROLS[c].name] !== null) { cleared.runtimeControls++; f.controls[CONTROLS[c].name] = null; }
      if (escRung[f.id]) cleared.escalations++;
    }
    cleared.runtimeEnabled = T.clearFeatureOverrides();
    clearWatch();
    if (prog !== null) { cleared.tracker = true; prog = null; }
    // ⚠ V2's DECISION MEMORY goes with the policies it belongs to: a `rate-peak` best and a stall history are
    // memory OF a configuration, and the configuration has just been removed.
    for (k in stallMem) delete stallMem[k];
    for (k in stallSince) delete stallSince[k];
    for (k in rateBest) delete rateBest[k];
    for (k in rateHold) delete rateHold[k];
    stallFired.loop = -1; stallFired.layer = null;
    for (i = 0; i < features.length; i++) { features[i].predCache = null; features[i].policyStr = undefined; }
    orderCache = {};
    invalidateView();
    return { ok: true, cleared: cleared, error: null };
  };

  // ---- the helper PICK-LISTS (V4) — the predicates the ENGINE can name for this feature --------------------------
  // ⚠ A BLANK TEXT BOX IS NOT AN AFFORDANCE. These WRITE the predicate text into the field, where it stays fully
  // editable — they are a starting point, never a second language. ⚖ minimize hardcoding: every one is built from
  // what the GAME declares (its layer ids, its milestone ids, its own `hasMilestone`), not from a per-game list.
  // ⚠ MEMOISED PER FEATURE. The Advanced tab re-renders every tick and every OPEN block would otherwise walk the
  // whole `layers` map and one layer's milestone ids on each one. The answer cannot move: layer ids and milestone
  // ids are fixed at boot (what changes is whether they are HELD, which is the predicate's business, not the list's).
  var helperCache = {};
  T.predicateHelpers = function (id) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    if (helperCache[id]) return helperCache[id];
    var l = f.layer, out = helperCache[id] = [], L = layers[l] || {};
    var name = String(L.name || l);
    out.push({ src: 'player.' + l + '.points.gte(100)', label: name + ': at least 100 of its own resource (edit the number)' });
    out.push({ src: 'player.' + l + '.total.gte(100)', label: name + ': 100 earned in total (edit the number)' });
    try {
      var ms = numIds(L.milestones || {});
      for (var i = 0; i < ms.length && i < 12; i++) out.push({ src: "hasMilestone('" + l + "', " + ms[i] + ')', label: name + ': milestone ' + ms[i] + ' held' });
    } catch (e) { /* a layer without milestones */ }
    // every layer the tree declares, so "…until the NEXT layer is unlocked" needs no typing at all
    try {
      var ks = [];
      for (var k in layers) if (k !== AU && layers[k] && !layers[k].tmtLoaderLayer && layers[k].row !== undefined) ks.push(k);
      for (var j = 0; j < ks.length; j++) out.push({ src: 'player.' + ks[j] + '.unlocked', label: String(layers[ks[j]].name || ks[j]) + ' is unlocked' });
    } catch (e2) { /* a fork with no layers map */ }
    return out;
  };
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
      // ⚠ V4: the entry is dropped only when NOTHING is left in it. Before V4 this read `entry.escalate === undefined`
      // — one named sibling — and `while` / `until` / `untilHit` / `priority` would each have been silently deleted
      // with the policy. The test is now "does this object still hold anything?", which no later field can outgrow.
      writeEdit(id, 'policy', null);
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
  // ---- V5: a SIDE parameter's save — the same `edits[<id>]` object, one more field (`args`), merged ----------------
  function setSavedArg(f, name, value) {
    var e = editsOf();
    if (!e) return { ok: false, policy: policyOf(f), error: 'this save has no automation store yet (player.' + AU + '.edits)' };
    var v = value === null || value === undefined ? '' : String(value).trim();
    var cur = e[f.id] && e[f.id].args && typeof e[f.id].args === 'object' ? Object.assign({}, e[f.id].args) : {};
    if (v === '') delete cur[name]; else cur[name] = v;
    var left = 0;
    for (var k in cur) left++;
    writeEdit(f.id, 'args', left ? cur : null);
    player[AU].disclosed = true;
    invalidateView();
    return { ok: true, policy: policyOf(f), error: null };
  }
  T.savedArg = function (id, name) { var f = byId[id]; if (!f) throw new Error('no feature "' + id + '"'); var v = sideSaved(f, name); return v === null ? null : v; };
  /** The RUNTIME override of a side parameter (never saved) — the harness's lever, as `setControl` is for a control. */
  T.setArg = function (id, name, value) {
    var f = byId[id];
    if (!f) throw new Error('no feature "' + id + '"');
    var w = value === null || value === undefined ? null : checkPredicate(String(value).trim());
    if (w) throw new Error('setArg ' + id + '.' + name + ' — ' + w);
    if (!f.args) f.args = {};
    if (value === null || value === undefined) delete f.args[name]; else f.args[name] = String(value).trim();
    invalidateView();
    return sideArg(f, name);
  };
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
    if (paramOf(S, name).side) return setSavedArg(f, name, value);
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
    // ⚠ V5: a SIDE parameter belongs to the FEATURE, not to one rung's string — the same field, whichever rung shows it
    if (paramOf(S, name).side) { var ra = setSavedArg(f, name, value); return { ok: ra.ok, error: ra.error }; }
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
      modifier: P && P.modifier ? { id: P.modifier.id, params: Object.assign({}, P.modifier.params, sideArgsOf(f, byStrategyId(f.kind, P.modifier.id))) } : null,
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
  // ⚠ V5: `parts` is the sentence's own parts (`codeParts`), so the view can box each number; `text` is them joined
  // — the same string, formatted once.
  function lastRow(L) { var ps = codeParts(L.code, L.values); return { code: L.code, text: joinParts(ps), values: jsonValues(L.values), tick: L.tick, at: L.at, parts: ps }; }
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
          modifier: pp && pp.modifier ? { id: pp.modifier.id, params: Object.assign({}, pp.modifier.params, sideArgsOf(f, byStrategyId(f.kind, pp.modifier.id))) } : null },
        stall: T.stallState(f.id),
        // R3b: the ROW CYCLE's row for this feature — `null` unless its policy carries a cycle modifier, so a run
        // without one renders exactly the rows it rendered before (R3a's `readout` rule, one modifier on).
        turn: T.turnState(f.id),
        // V3: the stall watch's row for this feature — `null` when the watch is off, so a run without it renders
        // exactly the rows it rendered before.
        escalation: escalationOf(f),
        last: f.last ? lastRow(f.last) : null,
        acted: acted, lastActedAt: f.lastActedAt,
        // on + unlocked for long enough, and it has still never done anything. A configuration that CANNOT fire is
        // survey §4.6, and it is the one thing a list of reasons cannot say by itself: every individual reason is
        // reasonable, and the feature is dead anyway.
        neverFired: acted === 0 && f.onSince !== null && (now - f.onSince) >= limit,
        eligibleFor: f.onSince === null ? null : Math.round((now - f.onSince) * 10) / 10,
        // ⚠ `gate` STAYS A STRING, and it is the `while` value in force. Every consumer written before V4 — the
        // block, `gates-a1`, `gates-v1` — reads it as one, and the slot did not change, only who may fill it.
        // `control` is the whole answer beside it (V4), from `controlState()`, which is the ONE place that knows.
        gate: f.gateSrc, after: f.after.slice(), control: T.controlState(f.id),
        provenance: (T.autoProvenance && T.autoProvenance[f.id]) || null,
      });
    }
    for (var id in (T.autoExcluded || {})) {
      var c = id.indexOf(':');
      out.push({
        id: id, title: id, layer: id.slice(c + 1), kind: id.slice(0, c),
        state: 'excluded',
        policy: { inForce: null, table: null, derived: null, alternatives: [], saved: null, runtime: null, base: null, escalated: null, strategy: null, params: null, modifier: null },
        stall: null, escalation: null, control: null,
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
  // ⛔ V4 Part 4 — THE ONE SENTENCE BESIDE THE SWITCH, and it is `docs/automation.md`'s own (R2's measurement, in the
  // words a player reads rather than a plan §). It names the MECHANISM, because the number belongs to one game and
  // the mechanism belongs to every patient default there is.
  var WATCH_WARN = 'A default that is correctly PATIENT looks exactly like one that is STUCK, so the watch can escalate a feature that was doing the right thing: measured on Prestige Tree Rewritten, switching it on reached no ladder mark at all where leaving it off reached six. Do not leave it on unattended.';
  var PROG_INTRO = 'Everything this session has held for the first time, newest first — an unlock, an upgrade, a milestone, an achievement, a challenge completion or a buyable past its own best. Re-buying what a reset took away is not progress, which is what makes a stall visible.';
  // ⚠ THE PLAYER'S WORDS FOR THE SIX KINDS, and the only place they are written. The IDs beside them are the GAME's own.
  var PROG_LABEL = { unlocked: 'unlocked', upg: 'upgrade', ms: 'milestone', ach: 'achievement', ch: 'challenge', buy: 'buyable' };
  // ⚠ ONE BLOCK PER FEATURE, NOT A WIDE TABLE — it has to read at 390 px with no horizontal scroll, and under
  // `?mobile=1` the layer list draws this tab through its own reader, which skips a `display-text` entirely. So the
  // layout is ordinary flow with `overflow-wrap`, no column widths and no element wider than its parent.
  function chip(text, bg) { return '<span style="display:inline-block;padding:0 6px;border-radius:3px;background:' + bg + ';color:#fff;font-size:.8em;vertical-align:middle">' + esc(text) + '</span>'; }
  // V4: the player's word for each link of the controls' precedence chain. `you` is the one that has to be
  // unmistakable — a condition the player typed and a condition the GAME's table shipped read identically otherwise.
  var CTL_WORD = { runtime: 'a runtime setting', you: 'yours', table: 'the game’s table', derived: 'derived' };
  var STATE_BG = { on: '#4f9a6a', off: '#3d6f91', armed: '#8a6d3b', locked: '#666666', excluded: '#5a4a4a' };
  // A feature that cannot run yet is ONE LINE. There are 78 of them on ptr at a fresh save and 3 that are doing
  // anything; a full block each would bury the three.
  // ⚠ IT IS NO LONGER ONLY FOR `locked` / `excluded` (V3 Part 3): the player can collapse any block, so the state
  // word is the ROW's rather than one of two literals, and the two things that must stay visible while collapsed say
  // so on the one line — an ESCALATED feature (the watch changed what it decides by, and the player has to be able
  // to see that without opening 59 blocks) and a NEVER-FIRED one (the flag exists because every individual reason
  // looks reasonable while the feature is dead).
  // ---- V5 PART 2: A LAYOUT THAT DOES NOT JUMP -----------------------------------------------------------------------
  // ⚖ THE USER (2026-09-20): "the layout keeps shifting as the data keeps changing. Somewhere else we set up code to
  // prevent UI elements from shrinking after the first time they grow. Can we implement something like this here?"
  // ⛔ WHAT JUMPS, MEASURED BEFORE ANYTHING WAS BUILT (gates-v5 part 2, constructed on a PAUSED page, because the
  // UI arc's three unconstructed tries all measured nothing): TWO problems, and they need TWO fixes.
  //   (b) SENTENCES AND LINES are what move the page. A reason line swapping to a shorter sentence moved all 63 blocks
  //       below it on ptr by 38 px at 390 px; a "never fired" line appearing moved them by 32. A digit floor does
  //       nothing for either. ⇒ each LINE of a block is a SLOT that remembers the longest thing it has shown and keeps
  //       that thing's height, as an invisible copy stacked in the same grid cell ("ghost"): a reserved line whose
  //       height only grows, and a line that disappears leaves its height behind. ⛔ No element is measured — this file
  //       touches no DOM (docs/contract.md) — the browser's own grid sizing takes the max of the two.
  //   (a) NUMBERS moved nothing vertically in any construction (even 9.99e9 → 1.00e1000 in three places), but they
  //       shift every word after them sideways. ⇒ the UI arc's technique, as its requirements: every number in its
  //       OWN box — the digits alone, the × / % / s / unit left outside it in the sentence — with tabular figures and
  //       an inline `min-width` in `ch` that only ever GROWS: never a cap, never the renderable worst case.
  //       ⚠ `ch` is one character here, not only one digit: the tab's font is Inconsolata (monospace) on all four games
  //       measured, where `.`, `e`, `,` and `-` are exactly 1ch; gates-v5 part 7 records the font on every game judged.
  // ⛔ THE FLOORS LIVE COMPONENT-SIDE — on the `tmtl-editors` instance, keyed by feature id + line (+ value), exactly as
  // `tmtl-number` keeps its draft and V3 keeps the collapse map (TRAP (ii): the tab re-renders every tick, so a floor
  // kept in the rendered string is gone on the next one). NOT in `player`, not in `runtimeState()`. ⚖ They RESET when
  // the Advanced subtab is left or the page reloads — the instance goes with it — and that is the point at which the
  // whole view is re-laid anyway; a floor carried over would keep the widths of numbers from a state the player has
  // moved away from (a big reset shrinks everything at once). The layer list's floors are per session for the same
  // reason. The header (a `display-text`, not a component) keeps its own and drops it whenever the tab is off screen.
  var FLOORS_ON = true;
  /** The control switch for gates-v5 part 2's CONTROL rows — a page-side flag, never saved. */
  T.setViewFloors = function (on) { FLOORS_ON = !!on; invalidateView(); return FLOORS_ON; };
  T.newFloors = function () { return { w: Object.create(null), g: Object.create(null) }; };
  var NUM_STYLE = 'display:inline-block;font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right;margin:0';
  /** One number in its own box, reserving the widest it has been under this key. */
  function numHTML(F, key, text) {
    var t = String(text), mw = 0;
    if (F && FLOORS_ON) { mw = F.w[key] || 0; if (t.length > mw) F.w[key] = mw = t.length; }
    return '<span class="tmtl-num" data-k="' + esc(key) + '" style="' + NUM_STYLE + (mw ? ';min-width:' + mw + 'ch' : '') + '">' + esc(t) + '</span>';
  }
  /** A sentence from its parts, every NUMBER boxed (see `codeParts`). */
  function partsHTML(F, key, parts) {
    var o = '';
    for (var i = 0; i < parts.length; i++) o += parts[i].k ? numHTML(F, key + '.' + parts[i].k, parts[i].s) : esc(parts[i].s);
    return o;
  }
  function lastHTML(F, key, last) {
    if (!last) return '';
    if (!last.parts) return esc(last.text);
    return partsHTML(F, key + ':' + last.code, last.parts);
  }
  /**
   * One LINE of the view, which keeps the height of the longest thing it has shown. `html` is the line ('' when the
   * line is absent this time), `len` its plain length. ⚠ The ghost is the longest by CHARACTER COUNT, which on the same
   * line with the same styles is the one that wraps the most.
   */
  function slotHTML(F, key, html, len, inline) {
    if (!F || !FLOORS_ON) return html || '';
    var g = F.g[key];
    if (html && (!g || len >= g.len)) { F.g[key] = { len: len, html: html }; return html; }
    if (!g) return '';
    var box = inline ? 'span' : 'div', disp = inline ? 'inline-grid' : 'grid';
    return '<' + box + ' class="tmtl-slot" style="display:' + disp + ';text-align:left;max-width:100%;margin:0">'
      + (html ? '<' + box + ' style="grid-area:1/1;min-width:0;margin:0;text-align:left">' + html + '</' + box + '>' : '')
      + '<' + box + ' class="tmtl-ghost" aria-hidden="true" style="grid-area:1/1;min-width:0;margin:0;text-align:left;visibility:hidden">' + g.html + '</' + box + '>'
      + '</' + box + '>';
  }
  var plainLen = function (html) { return String(html).replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/g, 'x').length; };
  function line(F, fid, key, html) { return slotHTML(F, fid + '|' + key, html, html ? plainLen(html) : 0); }
  // A feature that cannot run yet is ONE LINE. There are 78 of them on ptr at a fresh save and 3 that are doing
  // anything; a full block each would bury the three.
  // ⚠ IT IS NO LONGER ONLY FOR `locked` / `excluded` (V3 Part 3): the player can collapse any block, so the state
  // word is the ROW's rather than one of two literals, and the two things that must stay visible while collapsed say
  // so on the one line — an ESCALATED feature (the watch changed what it decides by, and the player has to be able
  // to see that without opening 59 blocks) and a NEVER-FIRED one (the flag exists because every individual reason
  // looks reasonable while the feature is dead).
  function collapsedBlock(r, F) {
    var bits = '';
    if (r.policy && r.policy.escalated) bits += ' ' + chip('ESCALATED', '#a06a3e');
    if (r.neverFired) bits += ' <span style="color:#c08a3e">⚠ never fired</span>';
    return line(F, r.id, 'col', '<div class="tmtl-collapsed" style="opacity:' + (r.state === 'on' ? '.85' : '.6') + ';padding:2px 0;text-align:left">' + esc(r.title) + ' <span style="opacity:.6;font-size:.85em">' + esc(r.id) + '</span> — '
      + chip(r.state.toUpperCase(), STATE_BG[r.state]) + bits + ' <span style="font-size:.9em">' + lastHTML(F, r.id + '|col', r.last) + '</span></div>');
  }
  function featureBlock(r, F) {
    var p = r.policy, bits = [], id = r.id;
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
    // ⚠ V5: EVERY LINE BELOW GOES THROUGH `line()`, present or not, so a line that disappears leaves its height.
    var o = ['<div class="tmtl-block" style="border-left:3px solid ' + STATE_BG[r.state] + ';background:rgba(127,178,217,.08);border-radius:4px;padding:6px 8px;margin:0 0 8px 0;text-align:left">'];
    o.push(line(F, id, 'title', '<div style="text-align:left">' + chip(r.state.toUpperCase(), STATE_BG[r.state]) + ' <b>' + esc(r.title) + '</b> <span style="opacity:.55;font-size:.85em">' + esc(r.id) + '</span></div>'));
    o.push(line(F, id, 'policy', '<div style="text-align:left;font-size:.9em;opacity:.85">policy ' + bits.join(' · ') + '</div>'));
    // ---- V4: the two PREDICATE controls and the priority, in the READ-ONLY half -------------------------------------
    // ⚠ WHOSE PREDICATE IT IS is on the line, for the reason the reason code carries it: the slot has four possible
    // sources and "gate X" could not tell a player whether they had typed X themselves.
    // ⛔ AND A PREDICATE THAT WILL NOT EVALUATE SAYS SO HERE. That is the brief's own rule — a run-time throw reads
    // as `false` to `holds()`, which is indistinguishable from a condition legitimately not met, and the block is
    // where the difference has to be visible. The message is the ENGINE's; it is escaped like every other string.
    var ctl = r.control;
    var wl = '';
    if (ctl && ctl['while'].value) wl = '<div style="text-align:left;font-size:.9em;opacity:.85">acts only while <code>' + esc(ctl['while'].value) + '</code> <span style="opacity:.7">(' + esc(CTL_WORD[ctl['while'].owner] || ctl['while'].owner) + ')</span>'
      + (ctl['while'].error ? ' <span style="color:#d07a7a">⚠ ' + esc(ctl['while'].error) + '</span>' : ctl['while'].holds === false ? ' <span style="color:#c08a3e">— false now</span>' : '') + '</div>';
    else if (r.gate) wl = '<div style="text-align:left;font-size:.9em;opacity:.85">gate <code>' + esc(r.gate) + '</code></div>';
    o.push(line(F, id, 'while', wl));
    o.push(line(F, id, 'until', ctl && ctl.until.value ? '<div style="text-align:left;font-size:.9em;opacity:.85">stops once <code>' + esc(ctl.until.value) + '</code> <span style="opacity:.7">(' + esc(CTL_WORD[ctl.until.owner] || ctl.until.owner) + ')</span>'
      + (ctl.until.error ? ' <span style="color:#d07a7a">⚠ ' + esc(ctl.until.error) + '</span>' : ctl.until.stopped ? ' <span style="color:#c08a3e">— STOPPED at ' + esc(ctl.until.hitAt) + ' s</span>' : '') + '</div>' : ''));
    o.push(line(F, id, 'prio', ctl && ctl.priority.owner ? '<div style="text-align:left;font-size:.9em;opacity:.85">priority <b>' + esc(ctl.priority.effective) + '</b> <span style="opacity:.7">(' + esc(CTL_WORD[ctl.priority.owner] || ctl.priority.owner) + '; its kind’s place is ' + esc(ctl.priority.kindPlace) + ') — within this layer only</span></div>' : ''));
    o.push(line(F, id, 'after', r.after && r.after.length ? '<div style="text-align:left;font-size:.9em;opacity:.85">after ' + r.after.map(esc).join(', ') + '</div>' : ''));
    o.push(line(F, id, 'now', '<div style="text-align:left;margin-top:3px"><b>now:</b> ' + (r.last ? lastHTML(F, id + '|now', r.last) : 'nothing decided yet') + '</div>'));
    // ⚠ V5: `last at` IS ROUNDED TO A TENTH. It printed the raw float (`115100.98603999999 s`), whose length changed
    // with the float noise from one act to the next — a line that re-wrapped for no reason a player could see.
    o.push(line(F, id, 'acted', '<div style="text-align:left;font-size:.9em;opacity:.7">acted ' + numHTML(F, id + '|acted', r.acted)
      + (r.lastActedAt === null ? '' : ' · last at ' + numHTML(F, id + '|lastAt', r1(r.lastActedAt)) + ' s')
      + (r.eligibleFor === null ? '' : ' · on for ' + numHTML(F, id + '|onFor', r.eligibleFor) + ' s') + '</div>'));
    o.push(line(F, id, 'never', r.neverFired ? '<div style="text-align:left;font-size:.9em;color:#c08a3e">⚠ never fired — on and unlocked this whole time, and it has never acted</div>' : ''));
    var el = '';
    if (r.escalation && r.escalation.rung) el = '<div style="text-align:left;font-size:.9em;color:#c08a3e">the stall watch has this feature on rung ' + r.escalation.rung + ' of ' + r.escalation.of
      + ' since ' + r.escalation.since + ' s — it returns to <b>' + esc(r.escalation.primary) + '</b> once progress resumes and holds</div>';
    else if (r.escalation && r.escalation.candidate) el = '<div style="text-align:left;font-size:.9em;opacity:.7">the stall watch is watching this feature — it is waiting, so a stall would escalate it</div>';
    o.push(line(F, id, 'esc', el));
    // ⚠ AUTHOR-WRITTEN TEXT THROUGH `v-html`. Escaped, like every other table string above (`off` reasons, gate
    // predicates) and like the GAME's own layer names and feature titles.
    o.push(line(F, id, 'prov', r.provenance ? '<div style="text-align:left;font-size:.85em;opacity:.65;font-style:italic;margin-top:3px">' + esc(r.provenance) + '</div>' : ''));
    o.push('</div>');
    return o.join('');
  }
  /** The modifier's readout beside its buttons (the stall fallback's clock, the row cycle's turn) — one slot, numbers
   *  boxed. It was Vue text until V5, and its numbers move every tick. */
  T.modReadoutHTML = function (r, fl) {
    var F = fl || null, id = r.id, h = '';
    if (r.stall && r.stall.why) h = esc(r.stall.why);
    else if (r.stall) h = 'typical ' + numHTML(F, id + '|st.t', r.stall.typical) + ' s over ' + numHTML(F, id + '|st.n', r.stall.remembered) + ' own-rule reset(s) · '
      + numHTML(F, id + '|st.e', r.stall.elapsed) + ' s of ' + numHTML(F, id + '|st.need', r.stall.need) + ' s';
    if (r.turn && r.turn.why) h += (h ? ' · ' : '') + esc(r.turn.why);
    else if (r.turn) h += (h ? ' · ' : '') + 'its turn now · ' + numHTML(F, id + '|tu.l', r.turn.left) + ' of ' + numHTML(F, id + '|tu.m', r.turn.mine) + ' left · row ' + esc(r.turn.row) + ': '
      + numHTML(F, id + '|tu.n', r.turn.members.length) + ' member(s)' + (r.turn.demand ? ', on demand' : '');
    return slotHTML(F, id + '|mod', h, h ? plainLen(h) : 0, true);
  };
  /** Any one-line readout, as a slot — the stall watch's status sentence uses it. */
  T.slotHTML = function (fl, key, text) { return slotHTML(fl || null, key, text ? esc(text) : '', text ? String(text).length : 0, true); };
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
  // ⚠ V5: the header's FLOORS. It is a `display-text` function, not a component, so they live here — and they are
  // DROPPED whenever the Advanced view is off screen, which is when the component's own floors go too.
  var HDR_F = null;
  function advancedHeaderHTML() {
    if (!advancedShown()) { HDR_F = null; return ''; }
    if (!HDR_F) HDR_F = T.newFloors();
    var rows = explainForView(true);   // the redraw IS the refresh point — see explainForView
    var running = 0, never = 0, edited = 0, escalated = 0;
    for (var i = 0; i < rows.length; i++) { if (rows[i].state === 'on') running++; if (rows[i].neverFired) never++; if (rows[i].policy && rows[i].policy.saved) edited++; if (rows[i].policy && rows[i].policy.escalated) escalated++; }
    var F = HDR_F;
    return '<div class="tmtl-root" style="' + ROOT_STYLE + '">'
      + '<div style="opacity:.75;font-size:.9em;margin-bottom:6px;text-align:left">' + esc(ADV_INTRO) + '</div>'
      + line(F, '', 'hdr', '<div style="margin-bottom:4px;text-align:left">Profile <b>' + esc(T.profileName) + '</b> · ' + numHTML(F, 'hdr.run', running) + ' of ' + numHTML(F, 'hdr.all', rows.length) + ' running'
      + (never ? ' · <b style="color:#c08a3e">' + numHTML(F, 'hdr.never', never) + ' never fired</b>' : '')
      + (edited ? ' · <b style="color:#7fb2d9">' + numHTML(F, 'hdr.edited', edited) + ' edited</b>' : '')
      + (escalated ? ' · <b style="color:#a06a3e">' + numHTML(F, 'hdr.esc', escalated) + ' escalated</b>' : '') + '</div>') + '</div>';
  }
  T.advancedHTML = advancedHeaderHTML;
  // ⚠ THE CALLER DECIDES (V3 Part 3). Until V3 the choice was the STATE's alone; now it is the player's, held
  // component-side and defaulting to the state's answer — so this function takes the flag rather than deciding.
  // ⛑ The one-argument call still behaves exactly as it did, which is what keeps every other consumer working.
  // ⚠ V5: `fl` is the caller's FLOORS (`T.newFloors()`, held component-side). Without it the block renders exactly
  // as it did, plus the number boxes, which reserve nothing.
  T.featureBlockHTML = function (r, collapsed, fl) {
    var F = fl || null;
    return (collapsed === undefined ? (r.state === 'locked' || r.state === 'excluded') : !!collapsed) ? collapsedBlock(r, F) : featureBlock(r, F);
  };
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
  // V4: a predicate field. `width:100%` inside a block that is already `min-width:0`, so it fills the block at 390 px
  // and never widens it — the mobile rule (`docs/mobile.md`): no control wider than the viewport, no page scroll.
  var PRED_FIELD_STYLE = CONTROL + ';width:100%;box-sizing:border-box;margin:1px 0;padding:1px 4px;font-family:monospace;font-size:.85em';
  var SELECT_STYLE = CONTROL + ';max-width:min(100%,22em);padding:1px 4px;font-family:inherit;font-size:.9em';
  var BTN_STYLE = CONTROL + ';margin:0 1px;padding:1px 6px;font-family:inherit;font-size:.9em;cursor:pointer';
  // ⛔ V5 PART 1 — THE ROOT TAKES THE PANE'S WIDTH, NOT ITS OWN TEXT'S. MEASURED on ptr at 1280 px, desktop: the
  // engine renders a subtab's content through its `column` component, whose `.upgTable` is a WRAPPING COLUMN
  // flexbox — and a flex item there is laid out at the MAX-CONTENT width of what is in it. So the loader's column came
  // out **1766 px wide inside a 634 px pane** (865 on Something Tree), the pane (`overflow:hidden`) clipped it, and
  // every long line and every control past the pane's edge was unreadable and unreachable: 413 elements past it at
  // 1280, 712 at 390 without `?mobile=1` — the same whether or not a control was on screen, which is why V4 read it as
  // "ptr's layout" (shots-v4.mjs). `?mobile=1` alone was spared, because mobile.css clamps `.upgCol`.
  // ⛔ A FIXED-LAYOUT TABLE AT 100 % IS THE ONE BOX WHOSE WIDTH IS ITS CONTAINER'S RATHER THAN ITS CONTENT'S: measured
  // on both engines at 390 and 1280, with and without `?mobile=1`, the root is exactly the pane's width every time.
  // ⚠ `contain:inline-size` was measured first and is a TRAP: the column shrink-wraps to NOTHING (0 px wide) and a
  // "no element past the viewport" count over it comes back 0 — a vacuous green, which is why gates-v5 part 1 also
  // asserts the root is as wide as its pane.
  var ROOT_STYLE = 'text-align:left;max-width:100%;overflow-wrap:anywhere;word-break:break-word;display:table;table-layout:fixed;width:100%;box-sizing:border-box';

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
          // V4: the FOURTH target — one of the per-feature controls (`while` / `until` / `priority`). The field is
          // the same field: the draft that survives the re-render, the hotkey guard and the refusal that keeps the
          // previous value are what make it correct, and a `predicate` needs every one of them.
          if (d.control) return T.setSavedControl(d.fid, d.name, v === '' ? null : v);
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
      computed: {
        // ⚠ A `predicate` IS A SENTENCE, NOT A NUMBER: 7.5em would show a player four characters of what they typed.
        // The type decides the width and whether the steppers are there at all — there is no step rule for text.
        wide: function () { return this.data.type === 'predicate'; },
        fieldStyle: function () { return this.wide ? PRED_FIELD_STYLE : FIELD_STYLE; },
      },
      // ⛔ V5 PART 1 — THE ROW WRAPS; THE CONTROL GROUP DOES NOT. Until V5 the whole field — label, box and both
      // steppers — sat in ONE `white-space:nowrap` span, so a long label pushed the box and the `−` / `+` off the
      // right edge: measured at 390 px on ptr (`all/M22`, the give-up block), NINE elements past the viewport, the
      // steppers at x = 617 and 642, and `scrollWidth` 390 — the page does not scroll sideways, so those controls
      // were UNREACHABLE, not merely cramped. Now the field is a WRAPPING flex row: the label is its own item and
      // wraps its own words, and the box with its steppers is one item that never breaks apart, so a narrow screen
      // puts the control on the next line instead of past the edge, and a wide one keeps it beside its label as
      // before. ⚠ Every size of the box and the buttons is UNCHANGED (FIELD_STYLE / BTN_STYLE) — a tap target is
      // no smaller than it was (gates-v5 part 1 measures that against the pre-V5 numbers).
      template: '<span class="tmtl-field" style="display:inline-flex;flex-wrap:wrap;align-items:center;max-width:100%;min-width:0;box-sizing:border-box;text-align:left;margin:2px 0;padding-right:8px;vertical-align:middle;white-space:normal" :style="wide ? \'width:100%\' : \'\'">'
        // ⚠ `margin:0` AND `text-align:left` ON EACH ITEM, and both are load-bearing: ptr's stylesheet opens with
        // `* { text-align: center; margin: auto }`, and an `auto` margin CENTRES a flex item — measured, the label
        // came out at x = 183 of 390 and the box below it at x = 110 (V1's "an inline declaration is what wins",
        // in the two places flexbox made new).
        + '<span class="tmtl-label" style="opacity:.75;font-size:.85em;min-width:0;max-width:100%;overflow-wrap:anywhere;text-align:left;margin:0 3px 0 0">{{ data.label }}</span>'
        + '<span class="tmtl-ctlgrp" style="display:inline-flex;align-items:center;white-space:nowrap;max-width:100%;text-align:left;margin:0" :style="wide ? \'flex:1 1 100%\' : \'flex:0 0 auto\'">'
        // ⚠ `data-fid` / `data-param` are how a GATE points at ONE feature's field. The first cut of `gates-v2`
        // located `input.tmtl-input` with `.first()` and typed into whichever feature happened to be drawn first,
        // then reported that the value had not committed — the leg was measuring the wrong block.
        + '<input type="text" class="tmtl-input" :data-fid="data.fid" :data-param="data.which + \':\' + data.name" :data-rung="data.rung || 0"'
        // ⚠ `|| null`, NOT `|| ''`: Vue 2 REMOVES an attribute bound to null and RENDERS one bound to the empty
        // string, so `[data-control]` would match every parameter field in the block. Measured — `gates-v4 --part 6`
        // counted three "helper pick-lists" where two exist, because the strategy picker carried `data-control=""`.
        + ' :data-control="data.control || null" :placeholder="data.placeholder || \'\'"'
        + ' :value="draft" :title="data.help || data.label" :style="fieldStyle"'
        + ' @input="draft = $event.target.value" @change="commit" @focus="onFocus" @blur="onBlur"'
        + ' @keydown.stop="onKey" @keyup.stop @keypress.stop>'
        + '<button v-if="!wide" type="button" style="' + BTN_STYLE + '" @click="step(-1)" @keydown.stop>&minus;</button>'
        + '<button v-if="!wide" type="button" style="' + BTN_STYLE + '" @click="step(1)" @keydown.stop>+</button>'
        + '</span>'
        + '<span v-if="error" class="tmtl-error" style="color:#d07a7a;font-size:.85em;display:block;flex:1 1 100%;white-space:normal">{{ error }}</span>'
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
          // ⚠ V4 — THE HELPER PICK-LIST. It does NOT introduce a second language: it WRITES predicate TEXT into the
          // same saved field the text box edits, where it stays fully editable. Picking the blank first option is a
          // no-op, so the list can sit at its placeholder and never claim to be showing what is in force.
          if (this.data.control) {
            if (!e.target.value) { this.error = null; return; }
            var c = T.setSavedControl(this.data.fid, this.data.control, e.target.value);
            this.error = c.ok ? null : c.error;
            return;
          }
          var r = this.data.rung ? T.setEscalationStrategy(this.data.fid, this.data.rung, e.target.value)
            : T.setSavedStrategy(this.data.fid, e.target.value);
          this.error = r.ok ? null : r.error;
        },
      },
      template: '<span style="display:inline-block;text-align:left;max-width:100%">'
        + '<select class="tmtl-select" :data-fid="data.fid" :data-rung="data.rung || 0" :data-control="data.control || null" :value="data.value" style="' + SELECT_STYLE + '"'
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
        html: function () { return T.featureBlockHTML(this.data.row, this.data.collapsed, this.data.fl); },
        // V5: the modifier's readout, as one slot with its numbers boxed (see `T.modReadoutHTML`)
        modReadout: function () { return T.modReadoutHTML(this.data.row, this.data.fl); },
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
        // ⚖ R3a: the button NAMES the modifier it toggles, from the table — it used to say "the stall fallback"
        // whatever kind it was on, and the second modifier made that a lie on every `challenges` feature.
        // ⛔ R3b: AND ONE BUTTON COULD ONLY EVER REACH `mods[0]`. R3a's fix named the row it toggled; with a
        // SECOND modifier on the `reset` kind the naming was right and the reach was not — the row cycle was
        // unreachable from the tab on the one kind that has it. One button PER ROW, each labelled from its own row
        // and each showing whether it is the one in force, is the same fix carried to the end (⚖ minimize
        // hardcoding: a third modifier is one more table row and no code here).
        modRows: function () {
          var on = this.data.row.policy.modifier;
          return this.mods.map(function (m) { return { id: m.id, label: m.label, help: m.help, on: !!on && on.id === m.id }; });
        },
        edited: function () { return !!this.data.row.policy.saved; },
        // ---- V4: the three per-feature CONTROLS, rendered GENERICALLY from `T.controls()` ------------------------
        // ⚖ minimize hardcoding, the same way V2's parameter editors are built from the strategy table: a fourth
        // control would be one more row of `CONTROLS` and no code here at all.
        ctlFields: function () {
          var r = this.data.row, cs = r.control;
          if (!cs) return [];
          return T.controls().map(function (c) {
            var st = cs[c.name] || {};
            return { key: 'ctl:' + c.name, fid: r.id, control: c.name, name: c.name, type: c.type, which: 'control',
              label: c.label, help: c.help, min: c.min, max: c.max,
              // ⚠ AN UNSET `priority` SHOWS ITS EFFECTIVE NUMBER, not an empty box: the number that is really
              // deciding is its kind's place, and a blank field would hide the scale the player is editing on.
              value: st.value === null || st.value === undefined ? (c.type === 'count' ? String(st.effective) : '') : String(st.value),
              placeholder: c.type === 'predicate' ? 'no condition' : '',
              owner: st.owner || null, holds: st.holds === undefined ? null : st.holds, error: st.error || null,
              stopped: !!st.stopped, hitAt: st.hitAt === undefined ? null : st.hitAt,
              effective: st.effective === undefined ? null : st.effective, kindPlace: st.kindPlace === undefined ? null : st.kindPlace };
          });
        },
        helperOptions: function () {
          var hs = T.predicateHelpers(this.data.row.id);
          return [{ id: '', label: 'suggestions — pick one to fill the box', available: true }]
            .concat(hs.map(function (h) { return { id: h.src, label: h.label, available: true }; }));
        },
      },
      methods: {
        setCtl: function (name, v) { var r = T.setSavedControl(this.data.row.id, name, v); this.ctlError = r.ok ? null : r.error; },
        clearCtl: function (name) { this.setCtl(name, null); },
        rearm: function () { var r = T.rearm(this.data.row.id); this.ctlError = r.ok ? null : r.error; },
        toggleMod: function (id) { T.setSavedModifier(this.data.row.id, this.data.row.policy.modifier && this.data.row.policy.modifier.id === id ? null : id); },
        toDefault: function () { T.setSavedPolicy(this.data.row.id, null); },
        toggleOpen: function () { this.$emit('toggle', this.data.row.id); },
        addRung: function () { var r = T.addEscalationRung(this.data.row.id); this.rungError = r.ok ? null : r.error; },
        dropRung: function (n) { var r = T.removeEscalationRung(this.data.row.id, n); this.rungError = r.ok ? null : r.error; },
        moveRung: function (n, d) { var r = T.moveEscalationRung(this.data.row.id, n, d); this.rungError = r.ok ? null : r.error; },
        listToDefault: function () { T.setEscalation(this.data.row.id, null); this.rungError = null; },
      },
      data: function () { return { rungError: null, ctlError: null }; },
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
        +     '<button v-for="m in modRows" :key="m.id" type="button" class="tmtl-mod" :data-fid="data.row.id" :data-mod="m.id" :data-on="m.on ? 1 : 0" style="' + BTN_STYLE + '" :title="m.help" @click="toggleMod(m.id)" @keydown.stop>{{ (m.on ? \'remove \' : \'add \') + \'“\' + m.label + \'”\' }}</button>'
        +     '<span v-if="modReadout" class="tmtl-modread" style="opacity:.7;margin-left:6px" v-html="modReadout"></span>'
        +   '</div>'
        // ---- the per-feature CONTROLS (V4): the pause, the stop and the priority ----------------------------------
        // ⚖ §13b, the user's own two requests. ⚠ Every press carries `@keydown.stop`, and the text boxes are
        // `tmtl-number` instances, so the engines' bare-letter hotkeys cannot fire from any of them (V2's trap (i)).
        +   '<div v-if="ctlFields.length" class="tmtl-ctl" :data-fid="data.row.id" style="text-align:left;font-size:.9em;margin-top:4px;border-top:1px dashed rgba(127,178,217,.35);padding-top:3px">'
        +     '<div v-for="c in ctlFields" :key="c.key" class="tmtl-ctl-row" :data-fid="data.row.id" :data-control="c.name" style="text-align:left;padding:1px 0">'
        +       '<tmtl-number :data="c"></tmtl-number>'
        +       '<span v-if="c.owner" style="opacity:.7">in force: {{ c.type === \'count\' ? c.effective : c.value }} ({{ c.owner === \'you\' ? \'yours\' : c.owner === \'table\' ? \'the game\\u2019s table\' : c.owner }})</span>'
        +       '<button v-if="c.owner === \'you\'" type="button" class="tmtl-ctl-clear" :data-fid="data.row.id" :data-control="c.name" style="' + BTN_STYLE + '" title="clear this" @click="clearCtl(c.name)" @keydown.stop>×</button>'
        +       '<span v-if="c.error" class="tmtl-error" style="color:#d07a7a;display:block">⚠ {{ c.error }}</span>'
        +       '<span v-else-if="c.name === \'while\' && c.value && c.holds === false" style="color:#c08a3e"> — false now, so this feature is paused</span>'
        +       '<span v-if="c.stopped" style="color:#c08a3e"> — STOPPED at {{ c.hitAt }} s</span>'
        +       '<button v-if="c.stopped" type="button" class="tmtl-rearm" :data-fid="data.row.id" style="' + BTN_STYLE + ';margin-left:4px" @click="rearm" @keydown.stop>re-arm it</button>'
        +       '<span v-if="c.name === \'priority\'" style="opacity:.6;display:block">its kind’s place is {{ c.kindPlace }} · this orders THIS layer’s features only — the engine decides in what order layers run</span>'
        +       '<tmtl-select v-if="c.type === \'predicate\'" :data="{fid: data.row.id, control: c.name, value: \'\', options: helperOptions}"></tmtl-select>'
        +     '</div>'
        +     '<span v-if="ctlError" class="tmtl-error" style="color:#d07a7a">{{ ctlError }}</span>'
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
        // V5: the status sentence changes as the watch does — one slot, so it keeps its tallest height
        wText: function () { return T.slotHTML(this.data.fl, 'watch', this.data.watch.text); },
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
        // ---- V4 Part 4: the LABEL, owed from R2 ------------------------------------------------------------------
        // ⛔ IT READ AS A PLAIN SWITCH, and it is not one. R2 measured it, twice equal, and the planner reproduced it
        // to the hash: on PTR from `all/M15.json` under the shipped table the watch reaches NO MARK AT ALL in 14,000
        // game-seconds against the control's six. The one-sentence reason is the mechanism, not the number, because
        // the number is about one game and the mechanism is about every patient default there is.
        // ⚠ The behaviour is UNCHANGED by this slice; its own sweep is a later one.
        + '<div class="tmtl-watch-warn" style="text-align:left;color:#c08a3e;font-size:.9em;margin-bottom:3px">'
        +   '<b>experimental — not a safety net.</b> <span style="opacity:.85">' + esc(WATCH_WARN) + '</span>'
        + '</div>'
        + '<div style="text-align:left">'
        +   '<button type="button" class="tmtl-watch-toggle" :data-on="w.on ? 1 : 0" style="' + BTN_STYLE + '" @click="toggleWatch" @keydown.stop>{{ w.on ? \'the stall watch is ON\' : \'the stall watch is off\' }}</button>'
        +   '<button v-if="!w.on" type="button" class="tmtl-track-toggle" :data-on="w.options.saved.track ? 1 : 0" style="' + BTN_STYLE + ';margin-left:4px" @click="toggleTrack" @keydown.stop>{{ w.options.saved.track ? \'progress tracker ON\' : \'progress tracker off\' }}</button>'
        +   '<span style="opacity:.8;margin-left:6px" v-html="wText"></span>'
        + '</div>'
        + '<div v-if="w.on" style="text-align:left"><tmtl-number v-for="f in fields" :key="f.key" :data="f"></tmtl-number></div>'
        + '<div v-if="w.on && w.escalated.length" style="text-align:left;color:#c08a3e">escalated: <span v-for="e in w.escalated" :key="e.id">{{ e.id }} \u2192 {{ e.policy }} (rung {{ e.rung }} of {{ e.of }}) </span></div>'
        + '<span v-if="error" class="tmtl-error" style="color:#d07a7a;font-size:.85em;display:block">{{ error }}</span>'
        + '</div>',
    },
    // ---- V4b: RESET THE AUTOMATION SETTINGS ------------------------------------------------------------------------
    // ⛔ TWO PRESSES, AND THE FIRST ONE ONLY EXPLAINS. The press is not undoable and its footgun is real and NAMED
    // rather than smoothed: a player who switched twelve features on to work around one bad strategy loses all
    // twelve. So the confirm LISTS what goes, COUNTS what is actually there to lose, and points at the narrow tool
    // that already exists — V2's per-feature *use the default*, which is one feature and one press.
    // ⚠ It sits at the BOTTOM of the Advanced view, under the blocks, because it is the one control here that
    // cannot be undone and nothing should be able to hit it while reaching for something else.
    'tmtl-reset': {
      props: ['data'],
      data: function () { return { armed: false, done: null, error: null }; },
      computed: {
        // what a press would actually cost THIS save, counted rather than described
        cost: function () {
          var rows = this.data.rows || [], on = 0, edited = 0, i;
          for (i = 0; i < rows.length; i++) {
            if (rows[i].state === 'on' || rows[i].state === 'armed') on++;
            var p = rows[i].policy, c = rows[i].control;
            if ((p && (p.saved || p.runtime)) || (c && (c['while'].owner === 'you' || c.until.owner === 'you' || c.priority.owner === 'you'))) edited++;
          }
          return { on: on, edited: edited, watch: this.data.watch && this.data.watch.options && this.data.watch.options.saved
            ? (this.data.watch.options.saved.watch || this.data.watch.options.saved.track) : false };
        },
        clears: function () { return T.resetClears(); },
      },
      methods: {
        arm: function () { this.armed = true; this.done = null; this.error = null; },
        cancel: function () { this.armed = false; },
        go: function () {
          var r = T.resetAutomation();
          this.armed = false;
          this.done = r.ok ? r.cleared : null;
          this.error = r.ok ? null : r.error;
        },
      },
      template: '<div class="tmtl-reset" style="text-align:left;margin:14px 0 4px 0;padding:4px 6px;border-left:3px solid #8a4a4a;background:rgba(138,74,74,.1);border-radius:4px">'
        + '<button v-if="!armed" type="button" class="tmtl-reset-arm" style="' + BTN_STYLE + '" @click="arm" @keydown.stop>reset the automation settings\u2026</button>'
        + '<span v-if="!armed && !done" style="opacity:.75;margin-left:6px;font-size:.9em">back to what a new save has \u2014 the game itself is not touched.</span>'
        + '<div v-if="armed" style="text-align:left">'
        +   '<div style="color:#c08a3e"><b>This cannot be undone.</b> It clears, for this game:</div>'
        +   '<ul style="text-align:left;margin:2px 0 4px 18px;padding:0">'
        +     '<li v-for="w in clears" :key="w" style="text-align:left">{{ w }}</li>'
        +   '</ul>'
        +   '<div style="text-align:left">Right now that is <b>{{ cost.on }}</b> feature(s) switched on and <b>{{ cost.edited }}</b> you have edited'
        +     '<span v-if="cost.watch">, and the stall watch\u2019s own setting</span>.</div>'
        +   '<div style="text-align:left;opacity:.8;font-size:.9em">To change ONE feature back instead, use <b>use the default</b> in its own block. '
        +     'Which blocks you have folded is remembered by this browser, not by the save, and is left alone.</div>'
        +   '<div style="text-align:left;opacity:.8;font-size:.9em">Your game \u2014 points, layers, upgrades, everything you have played \u2014 is not touched.</div>'
        +   '<button type="button" class="tmtl-reset-go" style="' + BTN_STYLE + ';margin-top:3px" @click="go" @keydown.stop>yes, reset the automation settings</button>'
        +   '<button type="button" class="tmtl-reset-cancel" style="' + BTN_STYLE + '" @click="cancel" @keydown.stop>cancel</button>'
        + '</div>'
        + '<div v-if="done" class="tmtl-reset-done" style="text-align:left;color:#4f9a6a">done \u2014 cleared {{ done.features }} switched-on feature(s), {{ done.edits }} saved edit(s)'
        +   '<span v-if="done.runtimePolicies + done.runtimeControls + done.runtimeEnabled"> and {{ done.runtimePolicies + done.runtimeControls + done.runtimeEnabled }} override(s) a measurement had left running</span>.</div>'
        + '<span v-if="error" class="tmtl-error" style="color:#d07a7a;display:block">{{ error }}</span>'
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
      template: '<div class="tmtl-root" style="' + ROOT_STYLE + '">'
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
        // ⛔ V5: THE NO-JUMP FLOORS, held HERE and deliberately NOT in `data` — a reactive object written during a
        // render would re-trigger it. One per instance: they go when the Advanced subtab does (see `numHTML`).
        this.fl = T.newFloors();
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
            out.push({ row: rows[i], head: l !== prev, layerName: name, clock: clock, gen: gen, collapsed: this.isFolded(rows[i].id), fl: this.fl });
            prev = l;
          }
          return out;
        },
        watch: function () { return T.watchState(); },
        floors: function () { return this.fl; },
        // ⚠ the same per-tick rows `blocks` is built from, so the reset's COUNT of what a press would cost cannot
        // disagree with what the player is looking at.
        rowsNow: function () { return this.blocks.map(function (b) { return b.row; }); },
        folded: function () { var b = this.blocks, n = 0; for (var i = 0; i < b.length; i++) if (b[i].collapsed) n++; return n; },
      },
      template: '<div class="tmtl-root" style="' + ROOT_STYLE + '">'
        + '<tmtl-watch :data="{watch: watch, fl: floors}"></tmtl-watch>'
        // ⚖ Q1's second half: expand all / collapse all, and they set EVERY block including the ones whose default is
        // the other way — `collapse all` then `expand all` has to be reachable from any state.
        + '<div style="text-align:left;margin-bottom:6px;font-size:.9em">'
        +   '<button type="button" class="tmtl-expand-all" style="' + BTN_STYLE + '" @click="all(false)" @keydown.stop>expand all</button>'
        +   '<button type="button" class="tmtl-collapse-all" style="' + BTN_STYLE + '" @click="all(true)" @keydown.stop>collapse all</button>'
        +   '<span style="opacity:.7;margin-left:6px">{{ folded }} of {{ blocks.length }} collapsed</span>'
        + '</div>'
        + '<tmtl-feature v-for="b in blocks" :key="b.row.id" :data="b" @toggle="toggle"></tmtl-feature>'
        // ⚠ LAST, under every block: it is the one control here that cannot be undone.
        + '<tmtl-reset :data="{rows: rowsNow, watch: watch}"></tmtl-reset>'
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
  // V4: `--auto-opt while:<id>=… / until:<id>=… / priority:<id>=…`, in the TABLE's slot (so the player's saved edit
  // still outranks it, exactly as it outranks `policy:<id>=`). An empty value means "as if the table had none".
  function ctlOpt(name, id, fromTable) {
    var v = T.options && T.options[name + ':' + id];
    if (v === undefined) return fromTable;
    var s = String(v).trim();
    if (!s) return undefined;
    var why = checkParam(CONTROL_ROW, name, s);
    if (why) throw new Error('option ' + name + ':' + id + ' — ' + why);
    return name === 'priority' ? Math.round(Number(s)) : s;
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
    kindOrderNow = kindOrder.slice();   // V4: a feature's DEFAULT `priority` is its kind's place in THIS order
    var cands = candidates(kindOrder);
    var candById = {};
    cands.forEach(function (c) { candById[c.id] = c; });
    var known = function (where, id) { if (!candById[id]) throw new Error(src + ': ' + where + ' names "' + id + '", which is not a derived feature of this game'); };
    // ⛔ V4: A MISTYPED CONTROL OPTION IS A HARD FAIL, not a run that quietly measures the game without it. That is
    // R1′'s own finding applied to the three new levers — before it, a mistyped sweep cell measured the game with NO
    // automation and printed a number (docs/automation.md, "Harness levers").
    for (var optk in (T.options || {})) {
      var om = /^(while|until|priority):(.+)$/.exec(optk);
      if (om) known('option ' + om[1] + ':', om[2]);
    }
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
        // V4: the three per-feature CONTROLS at the TABLE's level, each with a `--auto-opt` override in the same
        // slot `policy:<id>=` occupies — so a gate or a stop can be SWEPT with controls before it is written into a
        // table (⚖ every entry in a table carries provenance, and a sweep is where provenance comes from). An
        // EMPTY value clears the table's own entry, which is how a control leg measures the game without it.
        gate: ctlOpt('while', id, table.gates && table.gates[id]),
        until: ctlOpt('until', id, undefined),
        priority: ctlOpt('priority', id, undefined),
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
    // ⚖ R3a, PART 1 ITEM 5 — THE DERIVED DEFAULT, AND WHAT MOVED AND WHAT DID NOT.
    // ⛔ WITHOUT an `order` it stays `off`. A KIND default reaches every game on the roster, and the roster is 171
    // games nobody has swept; the failure that matters — a challenge that can never be completed trapping the run
    // — is exactly what the exit rule removes ON PTR, which is one game. A bounded sample is not a licence to switch
    // a kind on everywhere (gate R3a-6 says what it bounded), and §27.6's answer to the same question was the same.
    // ✅ WITH an `order` it now carries the EXIT RULE. A table that names a challenge sequence has already opted
    // into entering them, and until this slice that opt-in had no way OUT: `sequential` left a challenge only by
    // winning it. So the opt-in path is the one place a moved default can only help, and it reaches no game that
    // has not asked for it (measured: no table on the roster declares a challenge `order` today).
    if (kind === 'challenges') return hasOrder ? 'sequential|give-up@0.1/30/2x' : 'off';
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
