// tmt-loader — the LAYER LIST (docs/mobile.md). A CLASSIC script, inserted after loader/navbar.js and only when
// `?navbar=1` (which `?mobile=1` implies), so it runs in the global lexical scope and can read the engine's `player`
// / `tmp` / `LAYERS` and call `showTab` / `doReset` / `buyUpgrade` / `buyBuyable` / `startChallenge` / `unlockUpg`
// and the engines' own predicates `pseudoUnl` / `milestoneShown` / `hasMilestone` / `maxedChallenge` as bare
// identifiers (they may be global `let`s / function declarations, not window properties — see docs/contract.md).
//
// A SELECTABLE ALTERNATE VIEW OF THE TREE, never a replacement for it (⚖ user, 2026-09-17): the Layers button sits
// to the LEFT of Tree in the nav bar and opens this overlay; Tree still shows the tree. The shape is the one the
// paid Android port of PTR uses — the layers as a scrollable list of cards, grouped by tree row.
//
// THE CARD ACTS, it does not only navigate (⚖ user, 2026-09-18): its reset button really resets and its chips really
// buy. Every action goes through the ENGINE's own function, on the engine's own terms — this file never assigns to
// `player`, registers no timer and adds no clickable id, so it cannot move an automation anchor (gate M1's layers
// leg and gates-s1 --part 1 measure both claims). ⚠ Assigning nothing is NOT the same as the state holding still:
// see `withoutRaisingNaN` below, and the note on `act()` about `updateTemp()`.
//
// SINCE U2b, THE CHIPS MIRROR THE GAME'S OWN TAB (⚖ user, 2026-09-18). The list does not arrange them: it walks
// the layer's `tabFormat` — or the engine's default layout where a layer declares none — and takes exactly the
// components that layout draws, in the order it draws them, with a divider wherever the category changes. State is
// a chip's APPEARANCE, never its position.
//
// SINCE U2d, THE COLLAPSED CARD IS TWO ROWS (⚖ user, 2026-09-18) and the chips are the EXPANDED view alone. Row one
// is a COUNTER per category the layer draws — `x/y` for the categories you finish (upgrades, challenges,
// achievements, milestones) and the TOTAL OWNED for the ones you accumulate (buyables, clickables); row two is an
// ACTION BUTTON per component you can act on. ⚖ The two rows wrap and fit INDEPENDENTLY of each other, and ⚖ the
// button SET is "unlocked and not yet bought" — affordability decides only whether a button is lit or greyed, never
// whether it is there and never where it sits, which is the same rule U2 applied to the chips. How many buttons a
// row holds is MEASURED at render against the row's own width (`fitCards`), never a constant, and it is re-measured
// on a resize.
//
// SINCE U2e, A CHIP SAYS WHAT IT COSTS AND WHAT IT DOES (⚖ user, 2026-09-18). One overlay, opened by a hover on a
// pointer and a tap on a touch screen, whose first line IS the element's own `title` attribute and whose second is
// composed out of the engine's own fields for that CATEGORY — a declared `tooltip`, then the description, the
// effect and the cost. The `title` attributes U2d added stay exactly as they were: they are the accessible name and
// the no-JS fallback, and reading the overlay's first line off them is what makes it impossible for the two to
// disagree. See `DETAIL` and `tipDetail` below.
//
// SINCE U5, A CHIP WEARS THE GAME'S OWN COLOURS (⚖ user, 2026-09-19) — purchased, affordable, unaffordable, in
// the engine's own three-way reading rather than U2b's single `opacity: .45`. The colours are never ours: they are
// resolved by the GAME's stylesheet through `engineBg`, and the affordable one is the LAYER's own `tmp[l].color`,
// which is exactly what the engines' own upgrade and buyable buttons take inline. See `SKIN` and `chipSkin`.
// ⛔ VOCABULARY: the engines' `.locked` means CANNOT AFFORD. It does NOT mean "not unlocked" — which is what
// `locked` meant in this file until U2b deleted that state. Red is for unaffordable, never for absent.
//
// AND SINCE U5, BACK RETURNS TO THE VIEW YOU CAME FROM (⚖ user, 2026-09-19): a layer opened FROM THIS LIST comes
// back to the list, one opened from the tree comes back to the tree. The memory is one variable in this closure —
// SESSION-ONLY, nothing in `player`, nothing in storage — and it never swallows the engine's own back handler.
// See `cameFrom` and `onDocClick`.
//
// ENGINE-GENERIC BY CONSTRUCTION. It knows no layer, no upgrade and no game: every value comes from `tmp[l]` /
// `player[l]` / `layers[l]`, and anything that evaluates game code is wrapped — a throw costs one card, never the
// list. In particular it NEVER calls the global `canReset(layer)`: that function ends in
// `else return layers[layer].canReset()`, so a layer whose `type` matches none of normal/static/none reaches a
// method it does not have (it is what killed The Stardust Tree's automation boot). `tmp[l].canReset` is the same
// value, already computed by the engine's own `updateTemp`.
(function () {
  'use strict';
  var T = window.tmtLoader;
  if (!T || !T.navbar) return; // unreachable without the flag: page.js only inserts this file when it is on

  var PANEL_ID = 'tmt-layerlist';
  var CHIP_TOKENS = 3;   // "about three tokens" — the measured chip rule
  // ⚖ THE COUNTERS ARE THROTTLED (user, 2026-09-18, who agreed a throttle is fine). 250 ms = 4 Hz: a counter is a
  // number you read, not an animation, and 250 ms is below the delay at which a readout starts to feel stale —
  // while the refresh it rides on is driven by the game's own re-renders, coalesced per animation frame, so up to
  // 60 Hz. It is the card's heaviest per-refresh work (one pass per category per card), so this is a 15x cut.
  // ⚠ Only the OBSERVER path is throttled. An explicit `refresh()` — the API, a press, opening the panel — is a
  // caller asking for a fresh read and always does the whole thing; a throttle that swallowed those would make the
  // list lie right after the press that changed it.
  var COUNTER_MS = 250;

  // ---------------------------------------------------------------- which cards are open, remembered
  // ⚖ THE EXPANDER MUST NOT RESET ON EVERY LOAD (user, 2026-09-18), per layer and per game. The store is the
  // loader's OWN namespace, `tmtLoader.storage` (loader/page.js), which is already keyed `tmt-loader:<id>:` — so
  // two games cannot share a card's state, and this file invents no second store. One key holds the ids of the
  // cards that are open; a card not named in it is closed, which is also what an absent key says.
  // ⚠ IT IS WRITTEN THROUGH `storage.raw`, not through `localStorage` — the prefix shim would namespace it just the
  // same, but going through the raw methods is what states WHICH namespace this key is in, and it keeps the list
  // independent of a game that re-patches `Storage.prototype` after the shim.
  // ⚠ A CONSEQUENCE, recorded rather than left to be discovered (docs/mobile.md): the key is inside what "clear
  // this game's save" clears, because that namespace IS the thing it clears. A cleared game comes back with every
  // card closed, which is exactly what a first load does.
  // ⚠ STORAGE CAN THROW AND CAN COME BACK EMPTY — a private window, blocked site data, a quota. Every read and
  // every write is wrapped, and a list with nothing stored renders exactly as it did before this existed.
  var PREF_KEY = 'ui.layerlist.expanded';
  var prefs = null;   // {layer: true}; null until the first read, an object forever after
  function prefKey() {
    var st = T.storage;
    return st && st.prefix && st.raw ? st.prefix + PREF_KEY : null;
  }
  function prefRead() {
    if (prefs) return prefs;
    prefs = Object.create(null);
    try {
      var k = prefKey();
      var raw = k && T.storage.raw.getItem.call(localStorage, k);
      var list = raw ? JSON.parse(raw) : null;
      if (list && typeof list.length === 'number') {
        for (var i = 0; i < list.length; i++) if (typeof list[i] === 'string') prefs[list[i]] = true;
      }
    } catch (e) { /* no storage, or a value we did not write: the list renders with every card closed */ }
    return prefs;
  }
  function prefWrite() {
    try {
      var k = prefKey();
      if (!k) return;
      var open = Object.keys(prefRead());
      if (open.length) T.storage.raw.setItem.call(localStorage, k, JSON.stringify(open));
      else T.storage.raw.removeItem.call(localStorage, k);   // nothing open is nothing to remember
    } catch (e) { /* a full or read-only store costs the preference, never the list */ }
  }

  // ---------------------------------------------------------------- (U8) a resource row, once shown, STAYS shown
  // ⚖ "after the first time the UI row for a secondary currency for a layer is displayed, it doesn't get hidden
  // after a reset. That change would reduce layout shifting during resets." (user, 2026-09-19) — the same
  // complaint U2c's digit reservation answers, with a different cause.
  //
  // WHAT MAKES THE ROW VANISH, and it is structural rather than a matcher bug: `resourcesOf` emits a row only
  // while the layer's own text still has an unclaimed occurrence of the resource's value, and the ENGINE's amounts
  // claim first. At a reset `points`, `best`, `total` and the candidate are all zero, the engine's zeros consume
  // every `0` the text states, and every candidate comes back unattributed. MEASURED on `ptr` at its M16 snapshot:
  // `doReset('q', true)` (q's row is above t's, so it resets t) takes `t.energy` 6.29e28 → 0 and the card's
  // resource row disappears — the layer's text then reads "You have 0 Time Energy … Your best Time Capsules is 0",
  // whose two zeros both go to engine readouts.
  //
  // ⚠ WHY REMEMBERING IT IS SOUND, AND WHAT IT DOES NOT CLAIM. The VALUE never depended on the text: `keys` comes
  // straight off `player[l]` and is readable at every state. Only DETECTION consults prose. So what is remembered
  // is "this key is a resource on this layer" — a fact about the LAYER, not about the moment — and a remembered
  // row always renders the current number. Nothing is extrapolated and no stale value is ever shown.
  //
  // ⛔ AND ONLY AN UNAMBIGUOUS ONE IS REMEMBERED. `r.collide` says two keys claimed the same printed number, and
  // the attribution between those two is by `player[l]` key order ALONE. A key is written to the store the first
  // time it is shown with `collide === false`; a collided row still renders (both quantities are right) but is not
  // made permanent, because freezing one coin-flip forever is worse than the flicker this fixes.
  //
  // ⚠ THE STORE IS `storage.raw` IN THE GAME'S OWN NAMESPACE, exactly as `PREF_KEY` above — never `player`. A
  // per-layer key set inside `player` would move every pinned `hashGame` and put a UI preference into the save.
  // Every read and write is wrapped: storage throws, and comes back empty in a private window. A cleared save
  // forgetting the set is CORRECT — it is the same namespace "clear this game's save" clears, and a first load has
  // nothing remembered either.
  var RES_KEY = 'ui.layerlist.resources';
  var NO_KEYS = Object.create(null);
  var seenRes = null;   // {layer: {key: true}}; null until the first read, an object forever after
  function seenKey() {
    var st = T.storage;
    return st && st.prefix && st.raw ? st.prefix + RES_KEY : null;
  }
  function seenRead() {
    if (seenRes) return seenRes;
    seenRes = Object.create(null);
    try {
      var k = seenKey();
      var raw = k && T.storage.raw.getItem.call(localStorage, k);
      var o = raw ? JSON.parse(raw) : null;
      if (o && typeof o === 'object') {
        for (var l in o) {
          var list = o[l];
          if (!list || typeof list.length !== 'number') continue;
          var m = seenRes[l] = Object.create(null);
          for (var i = 0; i < list.length; i++) if (typeof list[i] === 'string') m[list[i]] = true;
        }
      }
    } catch (e) { /* no storage, or a value we did not write: nothing is remembered, which is a first load */ }
    return seenRes;
  }
  function seenWrite() {
    try {
      var k = seenKey();
      if (!k) return;
      var all = seenRead(), o = {}, any = false;
      for (var l in all) { var ks = Object.keys(all[l]); if (ks.length) { o[l] = ks; any = true; } }
      if (any) T.storage.raw.setItem.call(localStorage, k, JSON.stringify(o));
      else T.storage.raw.removeItem.call(localStorage, k);
    } catch (e) { /* a full or read-only store costs the memory, never the row */ }
  }
  /** The keys remembered for one layer. Read on the render path, so it allocates nothing when there are none. */
  function seenOf(l) { return seenRead()[l] || NO_KEYS; }
  /** Remember one key — and WRITE ONLY WHEN THE SET REALLY GREW. This runs inside every render of every card. */
  function seenAdd(l, k) {
    var all = seenRead();
    if (all[l] && all[l][k]) return false;
    if (!all[l]) all[l] = Object.create(null);
    all[l][k] = true;
    seenWrite();
    return true;
  }

  // ---------------------------------------------------------------- reading the engine, never trusting it
  // Every read of game data goes through this: `tmp[l].foo` can throw (a getter a layer defines, a tmp entry the
  // engine has not built yet), and one layer's throw must not cost the list.
  function safe(fn, dflt) { try { var v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }
  function str(v) { return typeof v === 'string' ? v : (v === null || v === undefined ? '' : String(v)); }
  // a title/name may be declared as a function, and `tmp` may hold the evaluated copy; prefer tmp, fall back to a
  // guarded call on the declaration itself (`this` = the component, which is how the engine calls it)
  function textOf(obj, tmpObj, field) {
    var t = safe(function () { return tmpObj ? tmpObj[field] : undefined; }, undefined);
    if (typeof t === 'string') return t;
    return safe(function () { var v = obj[field]; return typeof v === 'function' ? v.call(obj) : v; }, '');
  }
  function stripTags(s) { return str(s).replace(/<[^>]*>/g, ' '); }

  // ---------------------------------------------------------------- which layers get a card
  // The engine's own answer, read out of `tmp`: a node exists for a layer whose `layerShown` is truthy, and a
  // `'ghost'` one is the invisible spacer the engines use for tree alignment (PTR's `blank`).
  //
  // `player[l].unlocked` is NOT part of the inclusion test, although the brief's table listed it: every engine
  // creates a `player` entry for its SYSTEM pseudo-layers (`info-tab`, `options-tab`, `tree-tab`) with
  // `unlocked: true` and no node, so including an unlocked layer would put three cards in the list that the tree
  // does not show. It decides the GREYED state instead, which is what it is good for.
  function shown(l) {
    var s = safe(function () { return tmp[l].layerShown; }, false);
    return !!s && s !== 'ghost';
  }
  function rowOf(l) { return safe(function () { return tmp[l].row; }, undefined); }

  /** The rows, in the tree's own order: numeric rows ascending, then the named ones ('side', 'otherside', …) in
   * declaration order. Within a row, `position` then the layer id — the sort `updateLayers()` itself uses. */
  function groups() {
    var byRow = Object.create(null), seen = [];
    safe(function () { return LAYERS.slice(); }, []).forEach(function (l) {
      if (!safe(function () { return !!tmp[l]; }, false)) return;
      var row = rowOf(l);
      if (row === undefined || row === null || row === '') return; // not on the tree at all
      if (!shown(l)) return;
      var key = String(row);
      if (!byRow[key]) { byRow[key] = { row: row, key: key, layers: [] }; seen.push(key); }
      byRow[key].layers.push(l);
    });
    seen.forEach(function (k) {
      var g = byRow[k];
      g.layers.sort(function (a, b) {
        var pa = safe(function () { return layers[a].position; }, a), pb = safe(function () { return layers[b].position; }, b);
        if (pa === pb) return a > b ? 1 : -1;
        return pa > pb ? 1 : -1;
      });
    });
    var nums = seen.filter(function (k) { return k !== '' && !isNaN(Number(k)); }).sort(function (a, b) { return Number(a) - Number(b); });
    var rest = seen.filter(function (k) { return nums.indexOf(k) < 0; });
    return nums.concat(rest).map(function (k) { return byRow[k]; });
  }

  function rowLabel(row) {
    if (!isNaN(Number(row))) return 'Row ' + row;
    var s = str(row);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ---------------------------------------------------------------- the chips
  // The rule, MEASURED (docs/mobile.md): the first letter of each alphabetic word, numeric tokens kept WHOLE, about
  // three tokens — then a disambiguation pass over whatever still collides ON THE SAME CARD.
  //   "Prestige Boost" → PB · "Self-Synergy" → SS · "10 Generators" → 10G (not 1G, which "15 Generators" also gives)
  function chipTokens(title) {
    var words = stripTags(title).split(/[^A-Za-z0-9]+/).filter(Boolean);
    return words.map(function (w) { return /^[0-9]+$/.test(w) ? w : w.charAt(0).toUpperCase(); });
  }
  /** `items` carry `.tokens`; sets `.chip` on each, and no two the same. Two phases, in this order because one more
   * TOKEN says something about the component where a digit says only "not that one". */
  function nameChips(items) {
    items.forEach(function (it) { it.take = CHIP_TOKENS; });
    // 1. while a collision can be answered by one more token, answer it that way. The first member of a group keeps
    //    the short chip, so `I Need More!` stays `INM` and its sequels grow.
    for (var pass = 0; pass < 8; pass++) {
      var by = Object.create(null), extended = false;
      items.forEach(function (it) { var k = it.tokens.slice(0, it.take).join(''); (by[k] = by[k] || []).push(it); });
      Object.keys(by).forEach(function (k) {
        if (by[k].length < 2) return;
        by[k].forEach(function (it, i) { if (i > 0 && it.take < it.tokens.length) { it.take++; extended = true; } });
      });
      if (!extended) break;
    }
    // 2. whatever still collides takes the smallest digit that is FREE against every chip already assigned.
    //    ⚠ Checked against the WHOLE set, never incremented blindly: a base can itself end in a digit, so "N" + 28
    //    and "N2" + 8 are the same string — MEASURED on falling-mountain-s-alterprestige, whose `Nanoprestige` has
    //    58 components and a crowd of one-token "Nano…" titles, where a blind counter collided at `N28`.
    var seen = Object.create(null);
    items.forEach(function (it) {
      var base = it.tokens.slice(0, it.take).join(''), chip = base, n = 1;
      while (seen[chip]) { n++; chip = base + n; }
      seen[chip] = true;
      it.chip = chip;
    });
  }

  // ---------------------------------------------------------------- WHERE THE ORDER AND THE MEMBERSHIP COME FROM
  // ⚖ A chip should look, and sit, like the thing it stands for in the game's own tab (user, 2026-09-18). So the
  // list does not arrange the chips at all: it WALKS THE LAYER'S TAB LAYOUT and takes what that layout draws, in
  // the order it draws it. One walker answers all four of the requests — membership, order, the category
  // boundaries the dividers sit on, and where the milestones go.
  //
  // ⚠ This REPLACES U2's state ordering (`open → done → locked`). State is a chip's APPEARANCE now, never its
  // position: a chip that moves when you complete something is a chip that moves under your finger.
  //
  // The categories a chip can come from. `act: null` means the component is passive — pressing its chip opens the
  // tab, because there is nothing for the engine to do.
  var KINDS = {
    upgrades:   { field: 'title',                  act: 'upgrade' },
    buyables:   { field: 'title',                  act: 'buyable' },
    challenges: { field: 'name',                   act: 'challenge' },
    // ⚖ MILESTONES GET CHIPS (user, 2026-09-18), reversing U2's exclusion with the reasons on the table: their
    // text is a requirement string, they are passive, and they roughly double the chip count. Abbreviated by the
    // same rule as every other chip, and one that yields no tokens gets no chip.
    milestones: { field: 'requirementDescription', act: null }
  };
  // component name → the category it draws. `clickables` and `achievements` draw NO CHIP — a clickable's `display()`
  // is prose rather than a short name and an achievement is not something you press (docs/mobile.md) — but since
  // U2d they are still WALKED, because the collapsed card counts every category the tab draws, not only the four
  // that earn chips. `KINDS` above is what decides the chips; this is what decides the walk.
  var PLURAL = { upgrades: 'upgrades', buyables: 'buyables', challenges: 'challenges', milestones: 'milestones',
    clickables: 'clickables', achievements: 'achievements' };
  var SINGLE = { upgrade: 'upgrades', buyable: 'buyables', challenge: 'challenges', milestone: 'milestones',
    clickable: 'clickables', achievement: 'achievements' };
  var TREE = { 'upgrade-tree': 'upgrades', 'buyable-tree': 'buyables' }; // data = rows of ids, in reading order
  // The engine's own default when a layer declares NO `tabFormat` — read out of `layer-tab` in
  // `js/technical/systemComponents.js`, where BOTH reference engines (2.2.1 and 2.7) write the same family.
  // Note what it says: MILESTONES FIRST and UPGRADES FOURTH, nearly the reverse of the source order U2 used.
  var DEFAULT_FORMAT = ['infoboxes', 'main-display', 'prestige-button', 'resource-display', 'milestones',
    '@midsection', 'clickables', 'buyables', 'upgrades', 'challenges', 'achievements'];
  var MAX_DEPTH = 8;

  function declOf(kind, l, id) { return safe(function () { return layers[l][kind][id]; }, null); }
  function tmpOf(kind, l, id) { return safe(function () { return tmp[l][kind][id]; }, null); }

  // ---------------------------------------------------------------- (U11) A `tmp.unlocked` THE ENGINE NEVER COMPUTED
  // ⚖ "after the page first loads, the Layers view shows the chips for 9 different buyables in the space energy
  // layer … if the space energy panel is then opened and closed, then the Layers view will correctly only show the
  // chips for the 5 … that are actually available" (user, 2026-09-20).
  //
  // ⛔ THE CAUSE IS ONE ENGINE FAMILY'S OWN OPTIMISATION, not the list and not `updateBuyableTemp`. The PTR family's
  // `updateTempData` (`ptr`, `prestige-tree-ng`, `the-extended-tree` — 3 of 171, and the only 3 whose body has
  // this clause; the other 168 re-evaluate every `unlocked` on every tick) opens with
  //     if ((…display… || …description… || (item == "unlocked" && pre2 != "upgrades")) && player.tab != layer) continue;
  // i.e. every `unlocked` EXCEPT an upgrade's is evaluated only while that layer's tab is the open one. Until it
  // has been, `tmp` holds `setupTemp`'s seed for a function — `new Decimal(1)`, which is TRUTHY — so every buyable,
  // clickable, challenge, milestone and achievement that declares an `unlocked()` reads as unlocked. After the tab
  // HAS been open once it holds the value from then, and goes stale again as the game moves on.
  // ⚠ `updateBuyableTemp(l)` does NOT help and was measured not to (docs/mobile.md, U11): it calls
  // `updateTempData` without the `layer` argument, so `player.tab != undefined` is true and `unlocked` is skipped
  // THERE TOO. Evaluating the whole temp pass ourselves is therefore not the narrow fix; it is not a fix at all.
  //
  // So on THOSE engines, for a layer that is NOT the open tab, the list asks the declaration itself — the same
  // function, called the way the engine calls it (`layerData[item]()`, so `this` is the component). Everywhere else
  // it keeps reading `tmp`, which is what the engine itself draws from. Calling it is calling GAME code: it is
  // `safe()`d, falls back to the `tmp` reading on a throw, and rides inside the `withoutRaisingNaN` of every pass.
  // The skip is DERIVED from the engine's own source, the way U10 derives the tree tab's name — never a game list.
  var skipsUnlocked = null;
  function engineSkipsUnlocked() {
    if (skipsUnlocked === null) {
      skipsUnlocked = safe(function () {
        var s = typeof updateTempData === 'function' ? String(updateTempData) : '';
        return /item\s*==+\s*['"]unlocked['"]/.test(s) && /player\.tab\s*!=+\s*layer/.test(s);
      }, false);
    }
    return skipsUnlocked;
  }
  function unlockedOf(kind, l, id, t) {
    var fromTmp = function () { return safe(function () { var u = t.unlocked; return u === undefined ? true : !!u; }, true); };
    if (kind === 'upgrades' || !engineSkipsUnlocked()) return fromTmp();
    if (safe(function () { return player.tab === l; }, false)) return fromTmp(); // the engine computes it this tick
    var d = declOf(kind, l, id);
    var f = safe(function () { return d.unlocked; }, undefined);
    if (typeof f !== 'function') return fromTmp();
    var v = safe(function () { return { v: !!f.call(d) }; }, null);
    return v ? v.v : fromTmp();
  }

  /** The component ids of one category, in the order the engine draws them.
   *  · the grid categories (`upgrades` / `buyables` / `challenges`) render `v-for row` then `v-for col` at
   *    `row*10+col`, so the numeric id IS the row/column position and ascending numeric id is reading order;
   *  · `milestones` renders `v-for id in Object.keys(tmp[l].milestones)`, so declaration order is the order.
   *  ⚠ The grid is BOUNDED by `rows` / `cols`. TMT 2.7 derives them to cover every numeric id (`setRowCol`), so
   *  there the bound is vacuous — but 2.2.1 does NOT derive them, so an id outside a declared grid is simply never
   *  drawn, and a chip for it would be a chip for something the tab does not show. */
  function idsOf(kind, l) {
    var src = safe(function () { return layers[l][kind]; }, null) || safe(function () { return tmp[l][kind]; }, null);
    if (!src || typeof src !== 'object') return [];
    var ids = [];
    for (var k in src) {
      if (!safe(function () { var v = src[k]; return !!v && typeof v === 'object'; }, false)) continue;
      if (kind === 'milestones') { ids.push(k); continue; }
      if (isNaN(k)) continue; // the census's numeric-id rule: `rows`, `cols`, `respec` are not components
      ids.push(k);
    }
    if (kind === 'milestones') return ids;
    ids.sort(function (a, b) { return Number(a) - Number(b); });
    var rows = safe(function () { return tmp[l][kind].rows; }, undefined);
    var cols = safe(function () { return tmp[l][kind].cols; }, undefined);
    if (typeof rows === 'number' && typeof cols === 'number' && rows > 0 && cols > 0) {
      ids = ids.filter(function (id) {
        var n = Number(id);
        return Math.floor(n / 10) >= 1 && Math.floor(n / 10) <= rows && n % 10 >= 1 && n % 10 <= cols;
      });
    }
    return ids;
  }

  /** The layer's tab layout, flattened to the components it draws. `out` collects `{layer, kind, id}` in order.
   *  ⚠ `tabFormat` HAS TWO SHAPES and both are common across the roster:
   *   · an ARRAY — the component list, in display order;
   *   · a plain OBJECT — subtabs, of which only `player.subtabs[l].mainTabs` is on screen. The components in the
   *     other subtabs are genuinely hidden, which is the whole of visibility rule 3.
   *  Read from `tmp`, never from `layers`: a `tabFormat()` declared as a FUNCTION (PTR has one) is evaluated into
   *  `tmp` by the engine's own `updateTemp`, and its result is what the tab actually renders. */
  function layoutOf(l, out, depth, seen) {
    if (depth > MAX_DEPTH || seen[l]) return;
    seen[l] = true;
    var fmt = safe(function () { return tmp[l].tabFormat; }, undefined);
    if (fmt && typeof fmt === 'object' && !Array.isArray(fmt)) {
      var key = safe(function () { return player.subtabs[l].mainTabs; }, undefined);
      var sub = safe(function () { return fmt[key] !== undefined ? fmt[key] : fmt[Object.keys(fmt)[0]]; }, null);
      if (!sub) return;
      var emb = safe(function () { return sub.embedLayer; }, null);
      if (emb) return layoutOf(emb, out, depth + 1, seen);
      return walkList(safe(function () { return sub.content; }, null), l, out, depth + 1, seen);
    }
    walkList(Array.isArray(fmt) ? fmt : DEFAULT_FORMAT, l, out, depth + 1, seen);
  }

  /** One `column` / `row` data array. The engines' own `column` component accepts exactly three item shapes — a
   *  bare component name, `[name, data]` and `[name, data, style]` — and renders NOTHING for anything else, which
   *  is why an empty `[]` (a game's own `(cond ? [...] : [])`) costs nothing here either. */
  function walkList(list, l, out, depth, seen) {
    if (!Array.isArray(list) || depth > MAX_DEPTH) return;
    list.forEach(function (item) {
      if (typeof item === 'string') return emitComp(item, undefined, l, out, depth, seen);
      if (Array.isArray(item) && (item.length === 2 || item.length === 3)) return emitComp(item[0], item[1], l, out, depth, seen);
    });
  }

  function emitComp(name, data, l, out, depth, seen) {
    if (name === 'column' || name === 'row') return walkList(data, l, out, depth + 1, seen);
    // `["layer-proxy", [otherLayer, content]]` draws ANOTHER layer's components on this tab. The chip then acts on
    // that layer, which is why a chip carries its own `layer` rather than the card's.
    if (name === 'layer-proxy') {
      var ol = safe(function () { return data[0]; }, null);
      if (ol) walkList(safe(function () { return data[1]; }, null), ol, out, depth + 1, seen);
      return;
    }
    // nested subtabs: again, only the ACTIVE one is on screen
    if (name === 'microtabs') {
      var mt = safe(function () { return tmp[l].microtabs[data][player.subtabs[l][data]]; }, null);
      if (!mt) return;
      var emb = safe(function () { return mt.embedLayer; }, null);
      if (emb) return layoutOf(emb, out, depth + 1, seen);
      return walkList(safe(function () { return mt.content; }, null), l, out, depth + 1, seen);
    }
    if (name === '@midsection') return walkList(safe(function () { return tmp[l].midsection; }, null), l, out, depth + 1, seen);
    if (TREE[name]) { // data = an array of rows, each an array of ids, drawn in that order
      var kindT = TREE[name];
      if (!Array.isArray(data)) return;
      data.forEach(function (rw) { if (Array.isArray(rw)) rw.forEach(function (id) { out.push({ layer: l, kind: kindT, id: String(id) }); }); });
      return;
    }
    if (SINGLE[name]) { if (data !== undefined && data !== null) out.push({ layer: l, kind: SINGLE[name], id: String(data) }); return; }
    if (!PLURAL[name]) return;
    var kind = PLURAL[name], ids = idsOf(kind, l);
    // ⚠ A plural component can carry a RESTRICTION: TMT 2.7 renders `v-for row in (data === undefined ?
    // tmp[l][kind].rows : data)` — rows for the grid categories, ids for milestones. TMT 2.2.1's same-named
    // components take no such prop, and the one that DOES take `data` reads it as a px SIZE ("100px"). So the
    // signal is that the data is an ARRAY, which a size never is.
    if (Array.isArray(data) && data.length) {
      var pick = Object.create(null);
      data.forEach(function (x) { pick[String(x)] = true; });
      ids = ids.filter(function (id) { return kind === 'milestones' ? !!pick[String(id)] : !!pick[String(Math.floor(Number(id) / 10))]; });
    }
    ids.forEach(function (id) { out.push({ layer: l, kind: kind, id: String(id) }); });
  }

  // ---------------------------------------------------------------- VISIBILITY — three rules, not one
  // A component earns a chip when the engine's own render condition would draw it. `chipState` returns the state a
  // DRAWN component is in, or `null` for one the tab does not show — so one function answers both questions and
  // they cannot drift apart. Rule 3 (its category is reachable in the CURRENT tab layout) is not here at all: it is
  // the walker above, which never emits what the layout does not reach.
  function chipState(kind, l, id) {
    var t = tmpOf(kind, l, id);
    if (!t) return null;
    var unlocked = unlockedOf(kind, l, id, t); // (U11) not `tmp` alone: see `engineSkipsUnlocked`
    if (kind === 'upgrades') {
      if (!unlocked) {
        // ⚠ `unlocked === false` does NOT mean hidden. PTR renders a SECOND button for a pseudo-unlocked upgrade
        // — `v-if="pseudoUnl(layer, data) && !(tmp[layer].upgrades[data].unlocked)"` — a visible teaser you press
        // to unlock it. The game's own function is the only one that knows; a throw means "not pseudo".
        return safe(function () { return typeof pseudoUnl === 'function' && !!pseudoUnl(l, Number(id)); }, false) ? 'pseudo' : null;
      }
      return safe(function () { var a = player[l].upgrades || []; return a.indexOf(Number(id)) >= 0 || a.indexOf(String(id)) >= 0; }, false) ? 'done' : 'open';
    }
    if (!unlocked) return null;
    if (kind === 'milestones') {
      // the engines' second condition, and it is the PLAYER's setting: `milestoneShown` reads `msDisplay`, so
      // "never" hides every milestone and "incomplete" hides the done ones — on the tab and therefore here too.
      if (!safe(function () { return typeof milestoneShown === 'function' ? !!milestoneShown(l, id) : true; }, true)) return null;
      return safe(function () { return typeof hasMilestone === 'function' && !!hasMilestone(l, id); }, false) ? 'done' : 'open';
    }
    if (kind === 'challenges') {
      var active = safe(function () { return String(player[l].activeChallenge) === String(id); }, false);
      var maxed = safe(function () {
        if (typeof maxedChallenge === 'function') return !!maxedChallenge(l, Number(id));
        if (typeof hasChallenge === 'function') return !!hasChallenge(l, Number(id));
        var c = player[l].challenges || {}; return Number(c[id]) > 0;
      }, false);
      // both engines hide a finished challenge behind the player's own "hide completed" option (2.2.1 puts the
      // flag on `player`, 2.7 on `options`) — a fourth render condition, and it belongs to the player
      var hiding = safe(function () { return !!player.hideChallenges; }, false) || safe(function () { return !!options.hideChallenges; }, false);
      if (hiding && maxed && !active) return null;
      if (active) return 'active';
      var done = safe(function () { var c = player[l].challenges || {}; return Number(c[id]) > 0; }, false);
      return (maxed || done) ? 'done' : 'open';
    }
    if (kind === 'achievements') {
      // both engines draw an achievement on `unlocked` alone and paint it `bought` / `locked` by `hasAchievement`
      return safe(function () { return typeof hasAchievement === 'function' && !!hasAchievement(l, id); }, false) ? 'done' : 'open';
    }
    return 'open'; // buyables and clickables: `unlocked` is the whole of the engine's condition
  }

  /** The layer's drawn components, in the tab layout's order, with each one's state. Cheap enough to recompute on
   *  every refresh — it is what tells the list that the arrangement itself has changed. */
  function visibleSeq(l) {
    var seq = [];
    layoutOf(l, seq, 0, Object.create(null));
    var out = [], seen = Object.create(null);
    seq.forEach(function (e) {
      var key = e.layer + '/' + e.kind + '/' + e.id;
      if (seen[key]) return;                 // a layout may name the same component twice; it gets ONE chip, the first
      var st = chipState(e.kind, e.layer, e.id);
      if (st === null) return;               // the tab does not draw it
      seen[key] = true;
      out.push({ layer: e.layer, kind: e.kind, id: e.id, key: key, state: st });
    });
    return out;
  }

  /** One chip per DRAWN component that has a usable short name — one with none gets no chip rather than a
   *  meaningless one, the rule a milestone with no readable `requirementDescription` inherits. */
  function chipsOf(l) {
    var items = [];
    visibleSeq(l).forEach(function (e) {
      var K = KINDS[e.kind];
      if (!K) return;
      var title = textOf(declOf(e.kind, e.layer, e.id), tmpOf(e.kind, e.layer, e.id), K.field);
      var tokens = chipTokens(title);
      if (!tokens.length) return; // no usable title → no chip
      // ⚠ the id is a NUMBER, not the object key's string. The engines push whatever `buyUpgrade` is handed
      // straight into `player[l].upgrades`, and `hasUpgrade` tests it with `.includes(11)` — a `"11"` in the
      // save is an upgrade that is bought, paid for, and does nothing. MEASURED on ptr: the chip wrote
      // `["11"]` where the game's own button writes `[11]`. A milestone id is a plain key and stays one.
      items.push({ layer: e.layer, kind: e.kind, act: K.act, id: e.kind === 'milestones' ? e.id : Number(e.id),
        key: e.key, title: stripTags(title).trim(), tokens: tokens, state: e.state });
    });
    nameChips(items);
    return items; // ⚠ NO sort. The order IS the tab layout's, which is the whole of U2b.
  }

  // ---------------------------------------------------------------- THE COLLAPSED CARD (U2d)
  // ⚖ Two rows, not one flowing block (user, 2026-09-18): the COUNTERS own the first, the ACTION BUTTONS the
  // second, and they wrap and fit independently of each other. U2's flat "first six chips, then +N" is gone — the
  // question it raised (the tab layout puts MILESTONES first, so the first six could be nothing but the passive
  // category, and 8 of the roster's 47 multi-category cards hid a whole category behind the `+N`) is retired by
  // this card rather than answered: every category the layer draws now has a counter, whether or not it has a chip.
  //
  // What each category READS, and why the two shapes (⚖ user, 2026-09-18):
  //  · the ones you FINISH — milestones, upgrades, challenges, achievements — read `x/y`, earned over drawn;
  //  · the ones you ACCUMULATE — buyables, clickables — read THE TOTAL OWNED, one number. A buyable holds an
  //    AMOUNT and is never "done", so an `x/y` of "how many you own at least one of" would be a ratio out of a
  //    denominator that means nothing. It scans differently from its neighbours, and that is the honest reading.
  var COUNTERS = {
    upgrades:     { label: 'Upg',   name: 'Upgrades bought',        mode: 'ratio' },
    buyables:     { label: 'Buy',   name: 'Buyables owned',         mode: 'owned' },
    challenges:   { label: 'Chal',  name: 'Challenges completed',   mode: 'ratio' },
    clickables:   { label: 'Click', name: 'Clickables owned',       mode: 'owned' },
    milestones:   { label: 'Mile',  name: 'Milestones earned',      mode: 'ratio' },
    achievements: { label: 'Ach',   name: 'Achievements earned',    mode: 'ratio' }
  };

  // A TMT amount is a Decimal, a plain number, or (2.7's clickable default) a string.
  // ⚠ IS IT AN AMOUNT is a question about the TYPE, not about the magnitude. An early version asked
  // `isFinite(v.toNumber())`, which is FALSE for any Decimal past 1.8e308 — and TMT games run there routinely
  // (ptr's own points read 6.7e3284 at the gate's snapshot). That would have dropped a real buyable out of its
  // own total, silently, on exactly the saves where the number matters most.
  function isAmount(v) {
    if (typeof v === 'number') return isFinite(v);
    return safe(function () { return !!v && typeof v === 'object' && typeof v.toNumber === 'function'; }, false);
  }
  function positiveAmt(v) {
    if (typeof v === 'number') return v > 0;
    return safe(function () { return typeof v.gt === 'function' ? !!v.gt(0) : Number(v.toNumber()) > 0; }, false);
  }
  function addAmt(acc, v) { // sum as the engine's own type where we can, so a Decimal total stays a Decimal
    if (acc === null) return v;
    return safe(function () { return typeof acc.add === 'function' ? acc.add(v) : (typeof v === 'object' && v !== null && typeof v.add === 'function' ? v.add(acc) : acc + v); }, acc);
  }
  function whole(v) { return safe(function () { return typeof formatWhole === 'function' ? str(formatWhole(v)) : str(v); }, str(v)); }

  /** The amount a component of an ACCUMULATING category holds, or `null` for one that holds none.
   *  ⚠ THE TWO ENGINES DISAGREE ABOUT A CLICKABLE'S DEFAULT and it is what decides "which clickables get no
   *  counter". TMT 2.2.1 starts every clickable at `new Decimal(0)` (`getStartClickables`, utils.js:194); TMT 2.7
   *  starts it at `""` (utils/save.js:102). So "is the state a number?" separates a clickable that holds an amount
   *  from one that holds nothing on 2.7 and NOT on 2.2.1, where every clickable would read as a numeric zero and
   *  earn a box saying `0` — exactly the meaningless zero the user ruled out. The rule that works on both is the
   *  VALUE: a clickable counts only while it holds a number above zero, so a category that will never hold one
   *  simply never gets a box. A BUYABLE always has an amount (both engines define `getBuyableAmount`), so it keeps
   *  its box at zero — the asymmetry is the engines', not ours. */
  function ownedAmount(kind, l, id) {
    if (kind === 'buyables') {
      var b = safe(function () { return typeof getBuyableAmount === 'function' ? getBuyableAmount(l, Number(id)) : player[l].buyables[id]; }, null);
      return isAmount(b) ? b : null;
    }
    var c = safe(function () { return player[l].clickables[id]; }, null);
    return isAmount(c) && positiveAmt(c) ? c : null;
  }

  // ---------------------------------------------------------------- U6: THE COUNTERS WEAR COLOURS TOO
  // ⚖ "match what the main view already says" (user, 2026-09-19), who settled every case:
  //
  //   | counter      | GREEN          | RED                                       | the layer's own colour |
  //   |--------------|----------------|-------------------------------------------|------------------------|
  //   | milestones   | all earned     | any not yet earned                        | never                  |
  //   | achievements | all earned     | any not yet earned                        | never                  |
  //   | upgrades     | all bought     | none of the unbought is affordable        | otherwise              |
  //   | challenges   | all completed  | any not completed                         | never                  |
  //   | buyables     | never          | nothing in the category is BUYABLE now    | otherwise              |
  //   | clickables   | never          | nothing is CLICKABLE now                  | otherwise              |
  //
  // ⚖ MILESTONES AND ACHIEVEMENTS ARE RED WHENEVER ONE IS UNEARNED — user, verbatim: "Unearned milestones and
  // achievements are displayed in red in the main view and earned ones are displayed in green. And so we should use
  // green and red, not layer colors." ⚠ This OVERTURNED the recommendation this slice was briefed with (layer
  // colour, on the reasoning that red implies something actionable): the rule is the MAIN VIEW's rule, and the main
  // view wins. ⚖ A BUYABLE IS NEVER GREEN — it holds an amount and is never "done", so "all earned" has no
  // referent (user, 2026-09-18, which is also why its counter is a total and not an `x/y`).
  // ⚠ CHALLENGES AND CLICKABLES WERE NOT NAMED BY THE USER. The two rows above apply the same principle by
  // ANALOGY — a challenge is an earned/total category like a milestone, a clickable an owned one like a buyable —
  // and they are recorded as an INFERENCE (docs/mobile.md) so they are cheap to correct.
  //
  // ⚠ THE COLOURS ARE THE GAME'S, read exactly as the chips' are (`engineBg`, and `tmp[l].color` for the layer's
  // own): the category's OWN class first, so the counter matches the boxes it counts, and the family's bare
  // `bought` / `locked` as the fallback — every one of the 171 declares those bare (measured, U5), so a fork that
  // styles no `.milestoneDone` still gets a green rather than no colour at all.
  // ⚠ A CHALLENGE COUNTER AND A CHALLENGE CHIP MAY LEGITIMATELY DIFFER. The engines paint a challenge on their own
  // scale (`.hChallenge.canComplete` is amber, not the `.bought`/`.locked` pair); the counter answers the user's
  // green/red question and the chip wears the engine's own control colour. That is not a disagreement to fix.
  var COUNTER_SKIN = {
    upgrades:     { done: 'upg bought',         no: 'upg locked',         layerClass: true, layerWhenAvailable: true },
    buyables:     { done: null,                 no: 'buyable locked',     layerWhenAvailable: true },
    clickables:   { done: null,                 no: 'upg locked',         layerWhenAvailable: true },
    challenges:   { done: 'hChallenge done',    no: 'locked' },
    milestones:   { done: 'milestoneDone',      no: 'milestone' },
    achievements: { done: 'achievement bought', no: 'achievement locked', layerClass: true }
  };
  function counterBg(cls, fallback) { return (cls ? engineBg(cls) : '') || engineBg(fallback); }

  /** IS THERE ANYTHING TO DO IN THIS CATEGORY RIGHT NOW — per component, the engine's own reading, and the same
   *  one the action row's lit/grey asks (`affordable`) plus the same limit test its membership asks (`belowLimit`).
   *  ⚠ A PSEUDO-UNLOCKED upgrade is not "available": it is the teaser you press to unlock rather than to buy, and
   *  `canAffordUpgrade` is not the question its own button asks. ⚠ A clickable has no chip and no button, so this
   *  is the ONLY place its `canClick` is read. */
  function componentAvailable(kind, l, id, state) {
    if (kind === 'upgrades') return state === 'open' && affordable({ kind: 'upgrades', layer: l, id: Number(id) });
    if (kind === 'buyables') return belowLimit(l, id) && affordable({ kind: 'buyables', layer: l, id: id });
    if (kind === 'clickables') return safe(function () { return !!tmp[l].clickables[id].canClick; }, false);
    return false;
  }

  /** THE THREE-WAY READING for one COUNTER: `{ key, bg }`, in the same vocabulary the chips use — `bought` for a
   *  finished category, `can` for one with something to do in it, `locked` for one with nothing. */
  function counterSkin(l, g) {
    var S = COUNTER_SKIN[g.kind];
    if (!S) return { key: null, bg: '' };
    var pfx = S.layerClass ? l + ' ' : '';
    // an ACCUMULATING category is never finished, which is the whole reason its counter is a total and not an x/y
    if (g.mode === 'ratio' && g.y > 0 && g.x >= g.y) return { key: 'bought', bg: counterBg(pfx + S.done, 'bought') };
    if (S.layerWhenAvailable && g.available) return { key: 'can', bg: safe(function () { return str(tmp[l].color); }, '') };
    return { key: 'locked', bg: counterBg(pfx + S.no, 'locked') };
  }

  /** ONE COUNTER PER CATEGORY THE LAYER DRAWS, in the tab layout's own order (first appearance wins) — and only
   *  for a category that is non-empty after the three visibility rules, because `visibleSeq` never yields what the
   *  tab does not draw. A `ratio` counter's `y` is what the tab draws, so a player who has set `msDisplay` to
   *  `'incomplete'` sees the milestones they have left rather than a total that includes what the tab is hiding —
   *  the card reads the same tab the chips do. */
  function countersOf(l) {
    var order = [], by = Object.create(null);
    visibleSeq(l).forEach(function (e) {
      var C = COUNTERS[e.kind];
      if (!C) return;
      if (!by[e.kind]) { by[e.kind] = { kind: e.kind, label: C.label, name: C.name, mode: C.mode, x: 0, y: 0, total: null, any: false, available: false }; order.push(e.kind); }
      var g = by[e.kind];
      // (U6) … and whether there is anything to DO in this category, which is what decides the layer colour.
      // Asked at most until the first yes: it is game code, once per drawn component, on the counters' own budget.
      if (!g.available) g.available = componentAvailable(e.kind, e.layer, e.id, e.state);
      if (C.mode === 'ratio') { g.y++; if (e.state === 'done') g.x++; g.any = true; return; }
      var amt = ownedAmount(e.kind, e.layer, e.id);
      if (amt === null) return;
      g.any = true;
      g.total = addAmt(g.total, amt);
    });
    return order.map(function (k) { return by[k]; }).filter(function (g) {
      return g.mode === 'ratio' ? g.y > 0 : g.any;
    }).map(function (g) {
      g.text = g.mode === 'ratio' ? g.x + '/' + g.y : whole(g.total);
      // the width a counter RESERVES, in characters, so a growing number cannot move the row (see also
      // `tabular-nums` in layerlist.css). A ratio can never be wider than `y/y`; an accumulating total can, so the
      // reservation only ever grows — it is never given back, which is what keeps the reflow one-way.
      g.chars = g.mode === 'ratio' ? String(g.y).length * 2 + 1 : g.text.length;
      return g;
    });
  }

  /** WHICH COMPONENTS GET AN ACTION BUTTON — ⚖ "unlocked and not yet bought", in tab-layout order (user,
   *  2026-09-18), and NOT "affordable right now": affordability decides lit-vs-grey below and nothing else, so a
   *  button never moves out from under a finger. Three readings the user's phrase leaves open, decided here:
   *   · a MILESTONE has no action at all (it is passive, and pressing its chip opens the tab), so it never gets a
   *     button — its counter is how the collapsed card carries it;
   *   · a PSEUDO-UNLOCKED upgrade is NOT unlocked. It is a real control on the tab (the teaser you press to unlock
   *     the upgrade rather than to buy it), but the rule says unlocked, so it stays in the expanded chip row;
   *   · a BUYABLE is bought REPEATEDLY, so "not yet bought" cannot mean what it means for an upgrade. It qualifies
   *     while it can still be bought AT ALL — below its `purchaseLimit` where one is declared, and never on
   *     affordability. ⚠ 155 of the 171 games carry `purchaseLimit` (154 defaulting it to `Decimal(Infinity)` in
   *     their own `layerSupport.js`); on the 16 that do not — `ptr` among them — the test is vacuous and a buyable
   *     always qualifies, which is exactly what those engines' own buttons do. ⚠ NOT a 2.7-versus-2.2.1 split:
   *     that was this file's first reading, from a grep over two games, and the census says otherwise.
   *  A CHALLENGE qualifies while it is not completed, active or not: `startChallenge` is what its own button calls
   *  in both states.
   *  ⚠ Clickables and achievements are walked for their COUNTERS but never get a button: an achievement is not
   *  something you press, and a clickable has no short name to press it by (docs/mobile.md) — the same reason
   *  neither gets a chip. */
  function belowLimit(l, id) {
    var lim = safe(function () { var t = tmp[l].buyables[id]; return t ? t.purchaseLimit : undefined; }, undefined);
    if (lim === undefined || lim === null) return true;
    var amt = safe(function () { return typeof getBuyableAmount === 'function' ? getBuyableAmount(l, Number(id)) : player[l].buyables[id]; }, null);
    if (amt === null) return true;
    return safe(function () { return typeof amt.gte === 'function' ? !amt.gte(lim) : !(Number(amt) >= Number(lim.toNumber ? lim.toNumber() : lim)); }, true);
  }
  function actionable(c) {
    if (c.act === null) return false;             // milestones
    if (c.state === 'done' || c.state === 'pseudo') return false;
    if (c.kind === 'buyables') return belowLimit(c.layer, c.id);
    return true;                                  // upgrades `open`, challenges `open` or `active`
  }
  /** LIT OR GREY, and nothing else. The engine's own affordability, asked the way its own button asks it. */
  function affordable(c) {
    if (c.kind === 'upgrades') return safe(function () { return typeof canAffordUpgrade === 'function' ? !!canAffordUpgrade(c.layer, c.id) : true; }, true);
    if (c.kind === 'buyables') return safe(function () { return !!tmp[c.layer].buyables[c.id].canAfford; }, true);
    return true;                                  // starting a challenge costs nothing in either engine
  }
  function actionsOf(chips) { return chips.filter(actionable); }

  // ---------------------------------------------------------------- U5: THE CHIP WEARS THE GAME'S OWN COLOURS
  // ⚖ "purchased, affordable, unaffordable — the game's own three-way reading" (user, 2026-09-19). Until U5 a chip
  // carried no affordability at all: `done` was `opacity: .45` and that was the whole scheme.
  //
  // ⛔ THE VOCABULARY TRAP, and it wires the colours backwards if it is missed. The engines' `.locked` class means
  // **cannot afford**. It does NOT mean "not unlocked" — which is what `locked` meant in this file until U2b removed
  // that state, and since U2b a component the tab does not draw gets NO CHIP AT ALL rather than a greyed one. So red
  // is for unaffordable, never for absent, and there is no state left for "absent" to be confused with.
  //
  // ⚠ THERE IS NOTHING TO CHOOSE HERE. The three colours are the GAME's, not a palette of ours:
  //  · purchased  — whatever the game paints its own bought control (`.bought` / `.milestoneDone` / `.done`);
  //  · affordable — the LAYER'S OWN `tmp[l].color`, which is what the engines' upgrade and buyable buttons take
  //    inline (`v-bind:style="[canAfford ? {'background-color': tmp[layer].color} : {}]"`) and is also what the card
  //    already reads for its badge. `.can` declares NO background of its own in any engine on the roster;
  //  · unaffordable — whatever the game paints `.locked` (or `.milestone`, the unearned milestone's own box).
  // MEASURED over all 171 games (2026-09-19): every one declares a BARE `.bought` and a BARE `.locked` rule, so the
  // colour is reachable from anywhere in the document, and four games do NOT use the family's `#77bf5f`/`#bf8f8f`
  // (`the-congratulations-tree` hsl(), `the-factoree` 8-digit hex, `the-prestige-tree` `var(--boughtcolor)`,
  // `the-rainbow-void-tree` its own pair), while three put `!important` on `.locked`. A table of hex values here
  // would be wrong on those seven and would go stale on the rest; asking the stylesheet is right on all 171.
  //
  // ⚠ THE CLASSES ARE NOT PUT ON THE CHIP. They carry GEOMETRY as well as colour — `.upg` is 120x120 in PTR,
  // `.milestone` is `width: 100%; height: 75px`, `.hChallenge` is 300x300 — and a chip wearing them would blow up
  // the 44 px tap target and the measured action-row fit. Only the COLOUR is taken, off an off-screen probe.
  //
  // ⚠ WHERE THE PROBE SITS, and why it is not inside the mechanism it measures (U4's rule):
  //  · `document.body`, not `#app` — the engines set their theme custom properties ON `document.body`
  //    (`document.body.style.setProperty('--boughtcolor', …)` in the-prestige-tree), so the variables resolve, while
  //    `#app` is what BOTH our MutationObservers watch and what MOBILE_PROBE's `#app .upg` geometry selector reads.
  //    A probe parked in `#app` would have been measured as an undersized tap target by our own gate.
  //  · `visibility: hidden` and off-screen, NEVER `display: none`: a display-none element has no used value and any
  //    rule keyed on rendering would drop out — that is this instrument's version of U4's suppression trigger.
  //  · inserted and removed inside one synchronous block, so no frame and no geometry probe can ever see it.
  var SKIN = {
    // the classes the ENGINE's own control wears, read out of both reference engines' `components.js`:
    //  · upgrade   `{[layer]: true, upg: true, bought|locked|can}` — the layer class is part of it, because the
    //    engines key gradient rules on it (`.hn.grad:not(.locked):not(.bought)`);
    //  · buyable   `{buyable: true, can|locked}` — a buyable is bought repeatedly and is never `bought`;
    //  · challenge — the control you PRESS is its start button, `{longUpg, can, [layer]}` with the layer's colour
    //    inline in every state, because starting a challenge costs nothing. Only "completed" has a colour of its
    //    own, the challenge box's `.hChallenge.done`;
    //  · milestone — has no control to press at all, so its chip stands for the BOX: `.milestoneDone` or the bare
    //    `.milestone`, which in every engine on the roster is the SAME red as `.locked`.
    upgrades:   { done: 'upg bought',      no: 'upg locked',    layerClass: true },
    buyables:   { done: '',                no: 'buyable locked' },
    challenges: { done: 'hChallenge done', no: '' },
    milestones: { done: 'milestoneDone',   no: 'milestone' }
  };
  // ⚠ THE PALETTE IS READ WHEN THE LIST OPENS, and cached until it opens again. It cannot go stale under the
  // player: a theme is changed on the game's own Options tab, and reaching that tab closes this overlay. Reading it
  // per refresh instead would insert an element into the document 4x a second for a value that does not move.
  var skinCache = null;
  function engineBg(cls) {
    if (!skinCache) skinCache = Object.create(null);
    if (cls in skinCache) return skinCache[cls];
    var v = '';
    try {
      var el = document.createElement('span');
      el.className = cls;
      el.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;visibility:hidden';
      document.body.appendChild(el);
      v = str(getComputedStyle(el).backgroundColor);
      document.body.removeChild(el);
    } catch (e) { v = ''; }
    // a fully transparent answer is NO answer (an undefined `var()`, a class this engine does not style): the chip
    // keeps its own plain box rather than being painted `rgba(0, 0, 0, 0)` and claiming it wore the game's colour
    if (!v || v === 'transparent' || /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(v)) v = '';
    skinCache[cls] = v;
    return v;
  }

  /** THE THREE-WAY READING for one chip: `{ key, bg }`, where `key` is the engine's own word for the state
   *  (`bought` / `can` / `locked`, plus `pseudo` for the engines' second upgrade button) and `bg` is the colour
   *  the game paints it. `bg` is '' where the engine gives that component no background of its own. */
  function chipSkin(c) {
    var S = SKIN[c.kind];
    if (!S) return { key: null, bg: '' };
    var pfx = S.layerClass ? c.layer + ' ' : '';
    if (c.state === 'pseudo') {
      // the engines' SECOND upgrade button — the teaser you press to unlock rather than to buy. Its own classes are
      // `{[layer], upg, pseudo, plocked|can}` and it takes NO inline colour, so the whole answer is in the sheet.
      var pc = safe(function () { return !!tmp[c.layer].upgrades[c.id].pseudoCan; }, false);
      return { key: 'pseudo', bg: engineBg(pfx + 'upg pseudo ' + (pc ? 'can' : 'plocked')) };
    }
    if (c.state === 'done') return { key: 'bought', bg: S.done ? engineBg(pfx + S.done) : '' };
    // ⚠ A PASSIVE COMPONENT IS NEVER "AFFORDABLE" — there is nothing to buy. `affordable()` answers `true` for
    // everything it has no cost for, which is right for its OTHER caller (an action button is lit or grey, and a
    // milestone never gets one) and wrong here: an unearned milestone is red on the game's own tab. So the passive
    // case is decided BEFORE affordability is asked, rather than by writing a second affordability reader.
    if (c.act !== null && affordable(c)) return { key: 'can', bg: safe(function () { return str(tmp[c.layer].color); }, '') };
    return { key: 'locked', bg: S.no ? engineBg(pfx + S.no) : '' };
  }

  /** Paint one control that stands for a component. ⚠ APPEARANCE ONLY — U2's ruling stands: affordability moves
   *  with the engine's tick at 20/s and may decide how a control LOOKS, never where it sits or whether it is there
   *  (`signature()` carries no state).
   *  ⚠ `memo` IS WHERE THE LAST ANSWER IS REMEMBERED, and it is a separate object per ELEMENT rather than per
   *  component. Since U6 the same chip object backs two controls — the expanded view's chip and the collapsed
   *  card's action button — and a memo shared between them would let whichever painted first swallow the other's
   *  paint for good (the second call would read its own answer back as "unchanged" and write nothing). */
  function paintSkin(el, c, memo) {
    var s = chipSkin(c);
    if (memo.skinKey === s.key && memo.skinBg === s.bg) return false;
    memo.skinKey = s.key; memo.skinBg = s.bg;
    if (s.key) el.dataset.skin = s.key; else delete el.dataset.skin;
    el.style.backgroundColor = s.bg;
    return true;
  }
  function paintChip(el, c) { return paintSkin(el, c, c); }
  /** The chips of one card, repainted. Rides the THROTTLED path with the counters and the action row's lit/grey:
   *  a colour is a readout, and `affordable()` is game code called once per chip. */
  function paintChips(rec) { rec.chips.forEach(function (c, i) { if (rec.chipEls[i]) { paintChip(rec.chipEls[i], c); syncChipCount(rec.chipEls[i], c); } }); }

  // ---------------------------------------------------------------- (U10) HOW MANY YOU OWN, ON THE CHIP ITSELF
  // ⚖ "In both expanded view and collapsed view, the Layers view should show the number purchased in each chip
  // for the buyables" (user, 2026-09-20). BOTH views take the same string from the same reader, for the reason U8
  // had to make the reset text one source: a chip that reads one way expanded and another collapsed changes at the
  // instant of the transition.
  //
  // ⚠ ONE READER, AND IT IS THE COUNTERS' OWN: `ownedAmount('buyables', …)`, i.e. the engine's
  // `getBuyableAmount`. ⛔ That is NOT the same as `player[l].buyables[id]` — censused over the 171 at
  // `934dc41dc`: 165 games define it as exactly that read, THREE return `unl(layer) ? player[layer].buyables[id] : 0`
  // (`ptr`, `prestige-tree-ng`, `the-extended-tree`) and one wraps it in `new Decimal`. The accessor is what the
  // engine's own buttons read, so it is what the chip reads.
  // ⚠ A BUYABLE AT ZERO STILL HAS A CHIP AND STILL PRINTS `0` — `ownedAmount` keeps a buyable's box at zero
  // while a clickable only counts above zero, and that asymmetry is the engines' (see the comment on `ownedAmount`).
  // Hiding the number at zero would be the one reading that is not honest: the chip is there either way.
  // ⚠ FORMATTED BY THE ENGINE (`whole()` → `formatWhole`), and every path that calls this is already inside
  // `withoutRaisingNaN` (`rebuild` and `refresh` both wrap their whole pass), so formatting a NaN cannot leave
  // `player.hasNaN` raised. The list writes NOTHING to `player`.
  var COUNT_SIGN = '\u00d7';   // the × is DECORATION and lives in CSS (`::before`), so the span holds digits alone
  /** The formatted amount a buyable chip shows, or `null` for a chip that is not a buyable or whose amount the
   *  engine will not give us. Never an invented `0`. */
  function chipCount(c) {
    if (c.kind !== 'buyables') return null;
    var a = ownedAmount('buyables', c.layer, c.id);
    return a === null ? null : whole(a);
  }
  /** The chip's TEXT, for BOTH views: a name span always, and a count span for a buyable.
   *  ⚠ TWO SPANS, not one string. The short name can itself END IN A DIGIT — `nameChips` disambiguates a
   *  collision with one (`N28` on `falling-mountain-s-alterprestige`) — so `chip + count` concatenated would be
   *  genuinely ambiguous. The name is also what the gate reads to assert the names are unique. */
  function drawChipText(el, c) {
    el.textContent = '';
    var n = document.createElement('span');
    n.className = 'tmt-layerlist-chip-name';
    n.textContent = c.chip;
    el.appendChild(n);
    el.title = c.title;
    if (c.kind !== 'buyables') return;
    // ⚠ THE SIGN AND THE DIGITS ARE SEPARATE BOXES, and that is what makes the reservation EXACT. `min-width`
    // is in `ch` — one digit column — and the × is NOT a digit: measured at 13 px, a digit is 7.83 px and the
    // × is 8.5, so a `2ch` reservation written across `×36` reserved 15.7 px for a 24.1 px string and the chip
    // grew with the number anyway (the first build of this did exactly that). The sign is CONSTANT, so it lives
    // outside the reserved box — as the container's `::before`, which on an inline-flex container is a flex item.
    var q = document.createElement('span');
    q.className = 'tmt-layerlist-chip-count';
    var d = document.createElement('span');
    d.className = 'tmt-layerlist-chip-n';
    q.appendChild(d);
    el.appendChild(q);
    syncChipCount(el, c);
  }
  /** The count, re-read on the THROTTLED path (`paintChips` / `syncActions`) beside the colours — it is a readout
   *  and `getBuyableAmount` is game code, so it wants the counters' budget and not a frame's.
   *  ⚠ `data-count` IS THE MEMO AND THE MACHINE-READABLE VALUE IN ONE: the formatted number, so a gate can
   *  compare it against `getBuyableAmount` without parsing the rendered glyphs, and an unchanged number writes
   *  nothing to the DOM.
   *  ⚠ THE `title` CARRIES IT TOO, because U2e's rule is that the tooltip's FIRST LINE *is* the element's own
   *  `title` — a chip that showed ×3 while its tooltip said only the name would be the one disagreement that rule
   *  exists to make impossible. */
  function syncChipCount(el, c) {
    if (c.kind !== 'buyables') return false;
    var t = chipCount(c);
    var s = t === null ? '' : t;
    if (el.dataset.count === s) return false;
    el.dataset.count = s;
    var q = el.querySelector('.tmt-layerlist-chip-n');
    if (q) q.textContent = s;
    el.title = s === '' ? c.title : c.title + ' ' + COUNT_SIGN + s;
    return true;
  }
  /** ⚠ THE COUNT RESERVES ITS WIDTH, by the rule `syncCounters` already keeps for an accumulating total: a
   *  reservation in `ch` (a fixed digit column, because layerlist.css puts tabular figures on the panel) that only
   *  ever GROWS. A width that shrank back would move the row the moment a number did — ⚖ U2c, *"prevent the
   *  layout from shifting as the number of digits in the numbers changes"*.
   *  ⚠ ONE RESERVATION PER CARD, shared by the expanded chips and the collapsed action buttons, so the two
   *  views are the same width as well as the same string, and so the buyables in a row line up with each other.
   *  ⚠ THE FLOOR IS MEASURED, not chosen: `COUNT_CHARS_MIN` is the widest buyable count the whole roster
   *  renders at the states the sweep drives, so no game on the roster can widen a chip AT ALL. Past it the box
   *  grows once per order of magnitude and never gives the width back — which is the honest answer for a number
   *  with no bound: `formatWhole` reaches ELEVEN characters at the magnitudes a TMT save really reaches
   *  (`1.111e3,284`), and reserving eleven columns on a 44 px chip would cost every game the row's density for a
   *  width almost no card will ever want. */
  var COUNT_CHARS_MIN = 2;   // measured over all 171 at `934dc41dc` — see docs/mobile.md
  function fitChipCounts(rec) {
    var want = Math.max(rec.countChars, COUNT_CHARS_MIN);
    var widest = function (el) { var t = el && el.dataset ? str(el.dataset.count) : ''; if (t.length > want) want = t.length; };
    rec.chipEls.forEach(widest);
    rec.actionEls.forEach(function (a) { widest(a.el); });
    if (want === rec.countChars) return false;
    rec.countChars = want;
    var qs = rec.el.querySelectorAll('.tmt-layerlist-chip-n');
    for (var i = 0; i < qs.length; i++) qs[i].style.minWidth = want + 'ch';
    return true;
  }

  // ---------------------------------------------------------------- the card's own readouts
  // 2.2.1 computes `tmp[l].prestigeButtonText` in `updateTemp` and its component reads it; 2.7 has no such tmp key
  // and its component calls the GLOBAL `prestigeButtonText(layer)`. Read the tmp copy where the engine keeps one,
  // and fall back to the global — the same order each engine's own prestige button uses.
  // MEASURED: `prestigeButtonText` is game code and can throw (the-chronicle-tree's `mk` reads `.lt` of undefined at
  // a fresh save), and a layer may legitimately return ''. Either way the button still has to say what it is, so an
  // empty result falls back to the bare word.
  function resetText(l) {
    var t = safe(function () { return tmp[l].prestigeButtonText; }, undefined);
    if (typeof t === 'string' && t) return t;
    var g = safe(function () { return typeof prestigeButtonText === 'function' ? str(prestigeButtonText(l)) : ''; }, '');
    return g || 'Reset';
  }
  function amountOf(l) {
    return safe(function () {
      var p = player[l] && player[l].points;
      if (p === undefined || p === null) return '';
      return typeof formatWhole === 'function' ? str(formatWhole(p)) : str(p);
    }, '');
  }

  // ---------------------------------------------------------------- U7: THE RESET LINE IS ALWAYS TWO LINES
  // ⚖ "make it always two lines, splitting it between 'Reset for +1 boosters' and 'x / y points'" (user,
  // 2026-09-19). Until U7 this file collapsed the engines' own `<br><br>` to a SPACE, so the card's tallest readout
  // was ONE run of text — and a run of text is one line or two depending on how many digits are in it today.
  // Both of the options the comment there weighed were real (the engines' break is for a tall tab button; dropping
  // it in CSS jams the two halves together); the third was not considered: keep the break as a STRUCTURAL split
  // into two rows, each with its own line box.
  //
  // ⛔ AND THE WRAP IS THE SMALLER HALF OF THE BUG. The engines' two prestige strings fail DIFFERENTLY:
  //  · `static` emits its `<br><br>` unconditionally, so its second line always exists and only ever wraps;
  //  · `normal` drops the WHOLE second half once `resetGain.gte(100)` or `points.gte(1e3)`, so its card goes
  //    from two lines to one AS THE GAME PROGRESSES — a permanent height change, not a flicker.
  // ⚠ MEASURED, and it corrects the brief this slice was written from: `static` is unconditional in 170 of the
  // 171 games but NOT in all of them — `the-factoree` wraps its static second half in
  // `player[layer].points.lt(1e7) ? … : (!canReset(layer) ? … : "")`, so that game's static layers collapse to one
  // line too. RESERVING TWO LINE BOXES UNCONDITIONALLY is what fixes every one of those; a height that collapsed
  // when the second half is absent would re-introduce the `normal` case, which is why the reservation lives in the
  // stylesheet and is NOT keyed on `line2` being non-empty.
  //
  // ⚠ THE SPLIT IS ON THE FIRST RUN OF `<br>`s AND ONLY THE FIRST. 39 games declare 106 per-LAYER
  // `prestigeButtonText` overrides (the engines' `else return layers[layer].prestigeButtonText()` branch), and
  // their break counts run 0 ×36, 1 ×22, 2 ×35, 3 ×5, 4 ×4, 5 ×1, 6 ×2, 8 ×1 — measured, docs/mobile.md. So
  // whatever is left after the first run keeps today's SPACE COLLAPSE, and a string with no break at all puts
  // everything on line one and leaves line two empty. An empty line two still occupies its row.
  // ⚠ `resetText` already falls back to the bare word `Reset` for a layer whose text throws or returns '' — that
  // fallback is one line, and it must occupy two like every other.
  var RESET_BREAK = /(?:<br\s*\/?>\s*)+/i;
  function resetLines(s) {
    var t = str(s), m = RESET_BREAK.exec(t);
    if (!m) return [t, ''];
    return [t.slice(0, m.index), t.slice(m.index + m[0].length).replace(/<br\s*\/?>/gi, ' ')];
  }

  // ⚠ RENDERING A CARD CAN MAKE THE ENGINE WRITE `player`. Every TMT engine's `format()` begins
  //     if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) { player.hasNaN = true; return "NaN" }
  // and a game's own prestige text can format a NaN — MEASURED on the-quantum-tree, whose `Qc` layer says
  // "Next at NaN Qt" at a fresh save. The engine would set the flag itself the moment that tab is rendered; the list
  // renders every layer's button at once, so it would set it EARLY, put it in the save and move the state hash.
  // So: if the flag was down before we rendered and is up afterwards, we put it back. We never lower a flag the
  // game had already raised — that one is the player's game, and it is not ours to hide.
  function withoutRaisingNaN(fn) {
    var had;
    try { had = player.hasNaN; } catch (e) { return fn(); }
    try { return fn(); } finally { try { if (had === false && player.hasNaN === true) player.hasNaN = false; } catch (e2) { /* not this engine's flag */ } }
  }

  // ---------------------------------------------------------------- THE TOOLTIP (U2e)
  // ⚖ A CHIP SHOULD SAY WHAT IT COSTS AND WHAT IT DOES, not only what it is called (user, 2026-09-18).
  //
  // ⚠ A TOOLTIP ALREADY EXISTED and that is what this one has to beat. U2d put `title` on every chip, counter and
  // action button, so a desktop hover already opened the browser's own tooltip with the component's short name.
  // Those attributes STAY — they are the accessible name and the no-JS fallback — and three things they cannot do
  // are the whole of this section: a `title` is only the short NAME, native `title` does nothing on TOUCH (and the
  // phone is the case the list was built for), and it cannot be positioned, so it cannot be kept on screen.
  //
  // ⚠ THE TIP'S FIRST LINE *IS* THE ELEMENT'S `title` ATTRIBUTE, read off the element rather than recomposed. So
  // "if your tooltip and the title disagree, that is a bug in yours" is not a rule to remember: the two cannot
  // disagree, because there is one string. Everything below is about the SECOND line.
  //
  // ENGINE-GENERIC, per CATEGORY and never per game: `DETAIL` names exactly the fields that category's own engine
  // component renders, in the order it renders them, read the same way every other value in this file is (`tmp`
  // first, then a guarded call on the declaration). Measured over the two reference engines' `components.js`:
  //   · 2.2.1 `upgrade`   — title, `description`, "Currently: " `effectDisplay`|`effect`, "Cost: " `cost` + currency
  //   · 2.7   `upgrade`   — the same four, plus a `<tooltip>` component beside them
  //   · `buyable`         — title then `display`, which in both engines is the prose that carries its own cost
  //   · `challenge`       — `challengeDescription`, "Goal: ", "Reward: " `rewardDescription`, "Currently: "
  //   · `milestone`       — `requirementDescription` (the chip's own name) then `effectDescription`
  var DETAIL = {
    upgrades: [{ text: 'description' },
      { num: 'effect', text: 'effectDisplay', label: 'Currently' },
      { num: 'cost', whole: true, label: 'Cost', currency: 'resource', multi: 'multiRes' }],
    // ⚠ NO SEPARATE COST LINE FOR A BUYABLE, and it is measured rather than assumed: a buyable's `display` already
    // states it. On `ptr`'s `t/11` it reads "Cost: 138 Boosters\nAmount: 21 + 7", so a composed cost line would say
    // the same number twice.
    buyables: [{ text: 'display' }],
    challenges: [{ text: 'challengeDescription' },
      { num: 'goal', label: 'Goal', currency: 'points' },
      { text: 'rewardDescription', label: 'Reward' },
      { num: 'rewardEffect', text: 'rewardDisplay', label: 'Currently' }],
    milestones: [{ text: 'effectDescription' }]
  };

  // ⚠ THE FIELDS ARE HTML — the engines render every one of them through `v-html`, so they carry `<br>`, `<b>` and
  // colour spans, and `create-incremental`'s upgrade tooltips carry `<sub>` and `&#8594;`. Tags out FIRST with the
  // regex `stripTags` (never by parsing), and only THEN the entities, through a `textarea`: its content model is
  // text, so assigning to its `innerHTML` decodes `&#8594;` without ever creating an element. The other order could
  // turn `&lt;b&gt;` into a tag.
  var decoder = null;
  function decodeEntities(s) {
    if (s.indexOf('&') < 0) return s;
    return safe(function () {
      if (!decoder) decoder = document.createElement('textarea');
      decoder.innerHTML = s;
      return decoder.value;
    }, s);
  }
  /** One of the engine's prose fields as one line of ours: no markup, runs of spaces collapsed, NEWLINES KEPT —
   *  a buyable's `display` is multi-line in the engine too (`white-space: pre-line` there and here). */
  function tipLine(s) {
    return decodeEntities(stripTags(s)).replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n').trim();
  }
  function fmtNum(v, whole) {
    return safe(function () {
      if (whole && typeof formatWhole === 'function') return str(formatWhole(v));
      if (typeof format === 'function') return str(format(v));
      return str(v);
    }, '');
  }
  /** The currency a cost or a goal is denominated in, asked the way the engines' own components ask it: the
   *  component's `currencyDisplayName` where it declares one, else the LAYER's `resource` (an upgrade's cost) or
   *  the engines' literal fallback for a challenge goal. */
  function currencyOf(part, l, decl, t) {
    var c = textOf(decl, t, 'currencyDisplayName');
    if (str(c).trim()) return tipLine(c);
    if (part.currency === 'resource') return tipLine(safe(function () { return str(tmp[l].resource); }, ''));
    return part.currency === 'points' ? 'points' : '';
  }
  // ⚠ A `tmp` ENTRY CAN STILL BE THE FUNCTION — the engines evaluate a declaration into `tmp` only where it takes no
  // argument (`1-clicker`'s buyable `display()` stays a function there), so a value that IS one falls through to the
  // guarded call, exactly as `textOf` does for the prose fields.
  function numFieldOf(field, decl, t) {
    var v = safe(function () { return t ? t[field] : undefined; }, undefined);
    if (v !== undefined && v !== null && typeof v !== 'function') return v;
    return safe(function () { var x = decl[field]; return typeof x === 'function' ? x.call(decl) : x; }, undefined);
  }
  function labelled(label, text) { return label ? label + ': ' + text : text; }

  /** THE SECOND LINE: what the component costs and does, composed out of the engine's own fields.
   *  ⚠ WRAPPED IN `withoutRaisingNaN`, and this is the call site that most needs it: every TMT `format()` opens
   *  `if (isNaN(...)) player.hasNaN = true`, a game's own cost and effect strings are exactly the text that formats
   *  a NaN (`the-quantum-tree`'s `Qc` reads "Next at NaN Qt" at a fresh save), and a tooltip renders MORE of them
   *  than anything before it. The flag goes back only if this composition was what raised it.
   *  ⚠ A THROW COSTS ONE TOOLTIP, NEVER THE LIST: `description` and `effectDisplay` are game code. Every read is
   *  through `safe`/`textOf` already, and the whole composition is inside one try as well. */
  function tipDetail(kind, l, id) {
    return withoutRaisingNaN(function () {
      try {
        var decl = declOf(kind, l, id), t = tmpOf(kind, l, id);
        var out = [];
        // ⚠ A DECLARED `tooltip` IS ADDITIVE, not a substitute for the composition. In TMT 2.7 the `<tooltip>`
        // component sits BESIDE the button's own description block, so the field is extra text; a rule that used it
        // INSTEAD would drop the cost and the effect, which are the reason this tooltip exists. Measured: it is not
        // the common case either — neither reference game DRAWS a chipped component that declares one (docs/mobile.md).
        var tip = tipLine(textOf(decl, t, 'tooltip'));
        if (tip) out.push(tip);
        (DETAIL[kind] || []).forEach(function (part) {
          if (part.text && !part.num) { var s = tipLine(textOf(decl, t, part.text)); if (s) out.push(labelled(part.label, s)); return; }
          if (part.text) { var d = tipLine(textOf(decl, t, part.text)); if (d) { out.push(labelled(part.label, d)); return; } }
          var v = numFieldOf(part.num, decl, t);
          if (isAmount(v)) {
            var cur = part.currency ? currencyOf(part, l, decl, t) : '';
            out.push(labelled(part.label, fmtNum(v, part.whole) + (cur ? ' ' + cur : '')));
            return;
          }
          // ⚠ `multiRes` — a cost in SEVERAL currencies, which four games on the roster declare (`ptr` among them)
          // and where `cost` itself is undefined. The engines render one line per entry; so does this.
          if (!part.multi) return;
          var m = numFieldOf(part.multi, decl, t);
          if (!m || typeof m.length !== 'number') return;
          var parts = [];
          for (var i = 0; i < m.length; i++) {
            var c = safe(function () { return m[i].cost; }, undefined);
            if (!isAmount(c)) continue;
            var n = tipLine(safe(function () { return str(m[i].currencyDisplayName); }, ''))
              || tipLine(safe(function () { return str(tmp[l].resource); }, ''));
            parts.push(fmtNum(c, part.whole) + (n ? ' ' + n : ''));
          }
          if (parts.length) out.push(labelled(part.label, parts.join(' + ')));
        });
        return out.join('\n');
      } catch (e) { return ''; }
    });
  }

  // ---------------------------------------------------------------- U7: A LAYER'S OTHER RESOURCES
  // ⚖ "Some layers have more than one resource whose quantity is only reported in that layer's panel. For example,
  // the generators layer has 'generators' and 'generator power'. Is there a way we can detect what resources are on
  // each layer and display them all in the Layers view?" (user, 2026-09-19). `ptr`'s `g` is exactly that: the card
  // already shows `player.g.points` (the generators), and `player.g.power` — Generator Power — is stated nowhere
  // outside that layer's own tab.
  //
  // ⛔ DETECTION IS EASY; CLASSIFICATION IS THE WHOLE PROBLEM. A layer's `startData()` routinely carries Decimals
  // that are not resources at all — `unlockOrder`, `setBuyableAmount`, `autoTime`, `prevH`, `target`, `cost`,
  // `spent`, `buildLim`. Two discriminators were measured over the roster (docs/mobile.md):
  //  · "is this key used as a `currencyInternalName` somewhere" — 136 of the 1,713 (layer, key) pairs. ⛔ REJECTED:
  //    it misses ~92% of the real ones, `power` among them;
  //  · "does the layer SHOW it to the player" — which is also the user's own phrasing ("whose quantity is only
  //    reported in that layer's panel"), and it is the rule below.
  //
  // ⚠ AND IT IS A RUNTIME TEST, NOT A NAME MATCH. The static form of the same question (`format(…​.key)` anywhere in
  // the game's files) is FILE-SCOPED and over-counts badly: one `format(x.power)` matches every layer's `power` in
  // that file. So the list evaluates the layer's own display text and keeps a candidate only when THIS value is in
  // it — and the string the card prints is the very string that was found there, not a re-formatting of it.
  //
  // ⚠ WHERE THE TEXT COMES FROM, AND IT IS NOT `tmp`. The engines' `updateTempData` skips every key whose name
  // carries "display", "description" or "tabformat" unless that LAYER's tab is the open one, so a closed layer's
  // `tmp[l].tabFormat` still holds `setupTemp`'s placeholder (`new Decimal(1)`) wherever its display data was a
  // function. The DECLARATION is the only place those functions survive, so that is what is walked here — a second,
  // smaller walk than `layoutOf`, because it answers a different question (the strings the tab would render, not
  // the components it would draw) out of the only source that can answer it.
  // ⚠ CALLING THEM IS CALLING GAME CODE. Every call is `safe()`d, the whole pass rides inside `withoutRaisingNaN`
  // (`refresh`), and the list's standing claim — ⛔ it writes NOTHING to `player` — is ASSERTED per game by the M1
  // gate's own state-hash leg across a full render rather than assumed here.

  // the keys every engine puts in `player[l]` itself — the union of 2.2.1's `getStartPlayer` and 2.7's
  // `getStartLayerData`. Everything else in there came from the layer's own `startData()`.
  var ENGINE_PLAYER_KEYS = { points: 1, best: 1, total: 1, unlocked: 1, resetTime: 1, forceTooltip: 1,
    noRespecConfirm: 1, buyables: 1, clickables: 1, spentOnBuyables: 1, upgrades: 1, milestones: 1,
    lastMilestone: 1, primeMiles: 1, achievements: 1, challenges: 1, grid: 1, prevTab: 1, activeChallenge: 1,
    subtabs: 1, infoboxes: 1 };
  // ⚠ A DECIMAL, not `isAmount`'s wider test. A plain number in `startData` is a timer or a counter (`first: 0`,
  // `autoTime`), never a resource the tab prints with `format()`; admitting them would put the bookkeeping the
  // discriminator above exists to keep out back in through the type test.
  function isDecimalAmt(v) { return safe(function () { return !!v && typeof v === 'object' && typeof v.toNumber === 'function'; }, false); }

  // the three components both reference engines render free HTML through (`components.js`), all `v-html` of `data`
  var TEXT_COMPS = { 'display-text': 1, 'raw-html': 1, 'tall-display-text': 1 };
  function declFmt(l) {
    return safe(function () { var f = layers[l].tabFormat; return typeof f === 'function' ? f.call(layers[l]) : f; }, undefined);
  }
  function textData(data, l) {
    var v = safe(function () { return typeof data === 'function' ? data.call(layers[l]) : data; }, '');
    return typeof v === 'string' ? v : '';
  }
  /** The prose THIS layer's own tab would render, in the tab layout's order: `layers[l].display` (the free-text
   *  member the engines draw above the components) and every text component the DECLARED layout reaches. Bounded
   *  by `MAX_DEPTH` and by `seen`, like every other walk in this file. */
  function collectText(l, out, depth, seen) {
    if (depth > MAX_DEPTH || seen[l]) return;
    seen[l] = true;
    var d = safe(function () { var x = layers[l].display; return typeof x === 'function' ? x.call(layers[l]) : x; }, '');
    if (typeof d === 'string' && d) out.push(d);
    var fmt = declFmt(l);
    if (fmt && typeof fmt === 'object' && !Array.isArray(fmt)) {
      var key = safe(function () { return player.subtabs[l].mainTabs; }, undefined);
      var sub = safe(function () { return fmt[key] !== undefined ? fmt[key] : fmt[Object.keys(fmt)[0]]; }, null);
      if (!sub) return;
      var emb = safe(function () { return sub.embedLayer; }, null);
      if (emb) return collectText(emb, out, depth + 1, seen);
      return walkText(safe(function () { return sub.content; }, null), l, out, depth + 1, seen);
    }
    walkText(Array.isArray(fmt) ? fmt : DEFAULT_FORMAT, l, out, depth + 1, seen);
  }
  function walkText(list, l, out, depth, seen) {
    if (!Array.isArray(list) || depth > MAX_DEPTH) return;
    list.forEach(function (item) {
      if (typeof item === 'string') return textComp(item, undefined, l, out, depth, seen);
      if (Array.isArray(item) && (item.length === 2 || item.length === 3)) return textComp(item[0], item[1], l, out, depth, seen);
    });
  }
  function textComp(name, data, l, out, depth, seen) {
    if (name === 'column' || name === 'row') return walkText(data, l, out, depth + 1, seen);
    if (name === 'layer-proxy') {
      var ol = safe(function () { return data[0]; }, null);
      if (ol) walkText(safe(function () { return data[1]; }, null), ol, out, depth + 1, seen);
      return;
    }
    if (name === 'microtabs') {
      var mt = safe(function () { return layers[l].microtabs[data][player.subtabs[l][data]]; }, null);
      if (!mt) return;
      var emb = safe(function () { return mt.embedLayer; }, null);
      if (emb) return collectText(emb, out, depth + 1, seen);
      return walkText(safe(function () { return mt.content; }, null), l, out, depth + 1, seen);
    }
    if (name === '@midsection') return walkText(safe(function () { return layers[l].midsection; }, null), l, out, depth + 1, seen);
    if (TEXT_COMPS[name] && data !== undefined && data !== null) { var t = textData(data, l); if (t) out.push(t); }
  }
  /** The layer's whole display text, tags out, as one string. */
  function displayTextOf(l) {
    var out = [];
    collectText(l, out, 0, Object.create(null));
    return decodeEntities(stripTags(out.join('\n')));
  }

  // ⚠ MATCHED ON A NUMBER BOUNDARY, NEVER AS A BARE SUBSTRING. A bookkeeping key sitting at zero formats to `0`,
  // and `0` is inside every `10`, `100` and `1.00e5` on the tab — a plain `indexOf` would admit the whole of what
  // the discriminator exists to exclude. The boundary is "not another digit, comma or decimal point", plus an `e`
  // on the right so `1.00` does not match inside `1.00e5`.
  var NUM_L = /[0-9.,]/, NUM_R = /[0-9.,eE]/;
  function countAsNumber(text, sub) {
    if (!sub) return 0;
    var n = 0;
    for (var i = text.indexOf(sub); i >= 0; i = text.indexOf(sub, i + 1)) {
      if (i > 0 && NUM_L.test(text.charAt(i - 1))) continue;
      var after = text.charAt(i + sub.length);
      if (after && NUM_R.test(after)) continue;
      n++;
    }
    return n;
  }

  // ⛔ AN OCCURRENCE BUDGET, NOT A BARE "IS THIS NUMBER IN THE TEXT" — and this is the correction the first
  // version of this detector needed. MEASURED on `the-infinity-tree` at a fresh save, where every amount on every
  // layer is `0.00`: a bare membership test reported 23 resources across 9 cards, 21 of them sharing a value, and
  // the things it admitted were `resetting`, `buyableSpent`, `timeSpent`, `lastElectron`, `electronGain` — the
  // whole of the bookkeeping the discriminator exists to exclude. One `0.00` in "You have 0.00 energy" cannot be
  // evidence for six different keys.
  //
  // So an occurrence is CONSUMED by whoever claims it, and the engine's own amounts claim FIRST: a layer's text
  // routinely states its `points`, `best` and `total` itself ("Your best Generators is 0"), and those numbers
  // belong to readouts the card already has. What is left over is what the layer says about something else.
  // Candidates take it in `player[l]`'s own key order.
  // ⚠ MEASURED, and this is what the rule buys: on `ptr` it removes `q.time` — a bookkeeping Decimal that happens
  // to hold exactly `q.energy`'s 2,011, which the bare test admitted AND gave `energy`'s own prose label to.
  // ⚠ AND WHAT IT COSTS: a layer whose readouts are ALL the same number can attribute none of them. `ptr`'s `g` at
  // the M16 snapshot is exactly that — `points`, `best`, `total` and `power` are all `0` — so Generator Power,
  // which is the user's own example, is not reported AT THAT STATE. It is at every state where the numbers differ.
  // That is an abstention the text genuinely cannot resolve, not a rule that could be tightened out of it.
  var ENGINE_AMOUNT_KEYS = ['points', 'best', 'total', 'spentOnBuyables'];
  /** Claim one occurrence of `v`'s formatted value, in whichever of the two forms the text still has left.
   *  Returns the string that was claimed, or `null` when the text has none to give. */
  function takeOccurrence(text, budget, v) {
    var forms = [fmtNum(v, false), fmtNum(v, true)];
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      if (!f || (i === 1 && f === forms[0])) continue;
      if (budget[f] === undefined) budget[f] = countAsNumber(text, f);
      if (budget[f] > 0) { budget[f]--; return f; }
    }
    return null;
  }

  /** (U8) THE STRING A RESOURCE ROW PRINTS — OURS, FOR EVERY ROW, attributed or remembered.
   *  ⚠ IT CHANGES SOURCE, and that is the decision rather than an implementation detail. Until U8 a row printed
   *  the OCCURRENCE IT CLAIMED, i.e. the GAME's own rendering of the number, lifted out of the layer's prose. A
   *  remembered row has claimed nothing, so it has to format the value itself — and the two formatters can
   *  disagree: `takeOccurrence` accepts `format` OR `formatWhole`, which differ for a non-zero value under 1000
   *  (`format` gives `12.00`, `formatWhole` gives `12`). A row that printed the claimed string while attributed
   *  and ours while not would CHANGE ITS OWN STRING at the moment of the reset — which is the layout shift this
   *  item exists to remove, reintroduced at the only instant that matters.
   *  ⚖ So ONE formatter for both, at the cost of sometimes disagreeing with the layer's own prose. MEASURED over
   *  the whole roster at the states the sweep drives (171 games, fresh + deep views, 16 rows in all): printing
   *  `format` changes **3** of those 16 strings — `the-dressy-tree Mi.clicky`, `the-danus-tree p.progress` and
   *  `the-rainbow-void-tree p.clickingMult`, all `1` → `1.00` — where `formatWhole` would change **10**.
   *  ⚠ `format`, not `formatWhole`: a resource is an arbitrary Decimal and `formatWhole` ROUNDS a fractional one
   *  (12.5 → `13`), which is a wrong number rather than a differently-spelled one. The two agree at 0, above
   *  1,000 and below 0.95, so the disagreement is confined to that one band. */
  function resAmount(v) { return fmtNum(v, false); }

  // ---------------------------------------------------------------- (U9) THE GLOBAL CURRENCY ON A FIRST-ROW CARD
  // ⚖ "Points should be displayed as a secondary currency in the first layer, at least in ptr. Is there a clean
  // rule that would do that?" (user, 2026-09-20). ⛔ `resourcesOf` enumerates `player[l]` keys, so the GLOBAL
  // `player.points` can never be one of them — that is the whole reason it was missing, and it is why this needs a
  // rule rather than a wider filter.
  //
  // THE RULE IS THE ENGINE'S OWN DECLARATION. A layer's `baseAmount` is the thing it resets FOR; where its source
  // reads the global `player.points`, the global currency IS that layer's base currency, and there is nothing to
  // guess. Read as SOURCE, never as a VALUE — ⛔ comparing `tmp[l].baseAmount` to `player.points` for equality is
  // the trap this item's first measurement fell into: at a fresh save the numbers coincide or fail to coincide by
  // accident, and it reported 6 layers on `ptr` against 0 on `something` and `the-point-tree`, which is backwards.
  // A source read is value-independent and says the same thing at every state. (It is U7's
  // everything-is-zero-at-a-fresh-save trap wearing a different hat.)
  //
  // ⚠ `player[...]` IS NOT THE GLOBAL. `player[this.layer].points` and `player.p.points` are a LAYER's currency;
  // the boundary before `player` is what keeps `xplayer.points` and `foo.player.points` out.
  //
  // ⚖ ROW 0 ONLY, which is what makes this "the FIRST layer", and it is read through `rowOf` — the same reader
  // `groups()` places the cards with, so the row a card sits in and the row this rule asks about cannot drift
  // apart. ⚠ Numeric 0: TMT also has `side` layers and `row` is not always a number.
  // ⚖ AND ON EVERY ROW-0 LAYER THAT DECLARES IT, not on one chosen out of them. 28 games have 2-8 such layers
  // (docs/mobile.md carries the census); showing the number on each is TRUE on each, showing it on one would be
  // tidier and arbitrary. The user rules; this is what ships meanwhile.
  //
  // ⚠ THE LABEL IS `baseResource`, AND THAT DOES NOT REOPEN U7's RULING. U7 ships the player KEY as a row's label
  // because a name LIFTED out of the surrounding prose was right 2 times in 13. `baseResource` is not lifted: it
  // is a field the game's author wrote to name this very quantity. Authored, so it is used; and authored, so it is
  // used VERBATIM — 7 layers label it `TBD`, which is a fork's own placeholder and is rendered as it stands
  // (⚖ MINIMIZE HARDCODING: a per-game name table is exactly what we do not do).
  var GLOBAL_RES_KEY = '@points';   // `@` prefixed like `currencyKey`'s own globals, so no `player[l]` key can collide
  var BASE_IS_GLOBAL = /(^|[^\w$.])player\s*\.\s*points\b/;
  /** ⛔ COMMENTS OUT FIRST, and this is MEASURED rather than tidiness. `gooby-cat-tree`'s `p` and `Fr` both carry a
   *  commented-out `//return player.points` under the line that actually runs (`player[this.layer].buyables[11]`),
   *  and a raw source test admitted BOTH — two layers, on the one game it would then have been wrong about, out of
   *  194. Replaced with a SPACE, never removed, so nothing can be spliced into a match that was not there.
   *  ⚠ It is a stripper, not a tokenizer: `//` inside a string literal or a regex would be cut too. The failure
   *  mode of that is a row that does not appear, never a row that appears with the wrong number. */
  function stripComments(src) { return String(src).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n\r]*/g, ' '); }
  /** The declared global row for this layer, or `null`. Reads DECLARATIONS only; writes nothing. */
  function globalResOf(l) {
    if (rowOf(l) !== 0) return null;
    var src = safe(function () { var b = layers[l].baseAmount; return (b === undefined || b === null) ? '' : stripComments(b); }, '');
    if (!BASE_IS_GLOBAL.test(src)) return null;
    var v = safe(function () { return player.points; }, null);
    if (!isDecimalAmt(v)) return null;
    var label = str(safe(function () { var t = tmp[l].baseResource; return t === undefined ? layers[l].baseResource : t; }, ''));
    return { key: GLOBAL_RES_KEY, label: label || 'points', value: v };
  }

  /** THE LAYER'S OTHER RESOURCES — every Decimal in `player[l]` the engine did not put there whose value the
   *  layer's own text states, in `player[l]`'s own key order.
   *  ⚠ THE LABEL IS THE KEY, and that is a DECISION rather than a limitation of the scan. The prose name
   *  ("generator power") lives only in the words around the number, and lifting them is a heuristic that reads
   *  badly often enough to be the user's call rather than ours — `T.layerListUI.resourceText(l)` is what a caller
   *  lifts them from, and the U7 record carries the sample it would have produced. ⛔ No per-game name table:
   *  ⚖ MINIMIZE HARDCODING.
   *  ⚠ TWO KEYS CAN HOLD EQUAL VALUES, in which case the text cannot say which of them it is stating. Both are
   *  kept — the card is reporting quantities, and both quantities are right — and `collide` records that the
   *  attribution is ambiguous so the gate can measure how often it happens. */
  function resourcesOf(l) {
    var p = safe(function () { return player[l]; }, null);
    // (U9) the DECLARED row, which is not a `player[l]` key and is therefore not subject to the attribution below
    var g = globalResOf(l);
    if (!p || typeof p !== 'object') p = null;
    var keys = [];
    if (p) for (var k in p) {
      if (ENGINE_PLAYER_KEYS[k]) continue;
      if (!isDecimalAmt(safe(function () { return p[k]; }, null))) continue;
      keys.push(k);
    }
    if (!keys.length && !g) return [];
    // ⚠ (U8) NO LONGER `if (!text) return []`. A layer whose display text this pass could not read still has its
    // `player[l]` values, and a REMEMBERED key renders from the value; an empty text simply claims nothing.
    var text = displayTextOf(l);
    var budget = Object.create(null);
    if (text && p) ENGINE_AMOUNT_KEYS.forEach(function (k) {
      var v = safe(function () { return p[k]; }, null);
      if (isDecimalAmt(v)) takeOccurrence(text, budget, v);
    });
    // PASS ONE: who claims what. Two resources CAN print the same number where the layer states it twice; the card
    // is reporting quantities and both are right, and `collide` records that the attribution between them is by
    // key order alone — which is also what keeps such a key OUT of the remembered set.
    var claim = Object.create(null), byText = Object.create(null);
    // (U9) THE DECLARED ROW CLAIMS BEFORE ANY CANDIDATE, for the same reason the engine's own amounts do: a layer
    // whose tab states the global points would otherwise have that occurrence taken by whichever `player[l]` key
    // happens to hold the same number, and the card would report the global's value under a bookkeeping key's name.
    var gShown = null;
    if (g && text) { gShown = takeOccurrence(text, budget, g.value); if (gShown !== null) byText[gShown] = (byText[gShown] || 0) + 1; }
    if (text) keys.forEach(function (k) {
      var shown = takeOccurrence(text, budget, safe(function () { return p[k]; }, null));
      if (shown === null) return;
      claim[k] = shown;
      byText[shown] = (byText[shown] || 0) + 1;
    });
    // PASS TWO: the rows, in `player[l]`'s own key order — the SAME order for a remembered row as for an
    // attributed one, so a row does not move along the line the moment it stops being attributable.
    var sticky = seenOf(l), out = [];
    // (U9) FIRST, and only because it is the layer's BASE currency: the card's head already prints
    // `player[l].points`, so the two readouts read as "what this layer resets for" then "what it holds".
    // ⚠ `sticky` is always false here and the key is NOT added to the remembered set — U8's memory exists to keep
    // a row that would otherwise VANISH, and a DECLARED row cannot: the declaration does not depend on what the
    // layer's prose states this tick. It carries the flag so that every row in this list answers the same
    // questions; it is one list and one renderer, never a second path.
    if (g) {
      var gCollide = gShown !== null && byText[gShown] > 1;
      out.push({ layer: l, key: g.key, label: g.label, value: g.value, text: resAmount(g.value),
        claimed: gShown, collide: gCollide, sticky: false, global: true });
    }
    keys.forEach(function (k) {
      var shown = claim[k], has = shown !== undefined, collide = has && byText[shown] > 1;
      if (has && !collide) seenAdd(l, k);
      if (!has && !sticky[k]) return;
      var v = safe(function () { return p[k]; }, null);
      out.push({ layer: l, key: k, label: k, value: v, text: resAmount(v), claimed: has ? shown : null,
        collide: collide, sticky: !has, global: false });
    });
    return out;
  }

  // ---------------------------------------------------------------- U7: PER-CATEGORY PROGRESS (the expanded card)
  // ⚖ "when a layer is in expanded view, can we add a row to display the progress towards the next unearned item
  // from each category, like how we display progress towards the next reset for the layer? Is there a way to detect
  // what the cheapest unearned item from each category is? If not, then we can just pick the one whose chip is
  // currently listed first." (user, 2026-09-19).
  //
  // WHAT THE ENGINES DECLARE, and it decides which categories can have a row at all:
  //   | upgrades     | `tmp[l].upgrades[id].cost`  | ✅ comparable while the currency matches                   |
  //   | buyables     | `tmp[l].buyables[id].cost`  | ✅ `tmp` holds it ALREADY EVALUATED at the current amount  |
  //   | challenges   | `goal`                      | a goal, not a cost — comparable within one currency       |
  //   | milestones   | —                           | `requirementDescription` is PROSE. No number exists.      |
  //   | achievements | —                           | the same                                                  |
  //   | clickables   | —                           | no cost concept                                           |
  // So: ⛔ A CATEGORY WITH NO NUMBER CONCEPT GETS NO ROW — milestones, achievements, clickables. "Progress" with no
  // denominator is not a weaker row, it is a different thing; the three categories above the line are the ones a
  // `x / y` can be honest about, and the gate reports which categories on which games produced none.
  // ⚖ (U13) OVERTURNED FOR ONE CASE ONLY: a BUYABLE whose cost we looked for and could not get keeps its row as
  // `? / ?` (user, 2026-09-19: "Let's go with two question marks, rather than hiding the row"). ⛔ It does NOT reach
  // the three numberless categories — they have no cost to look for, so they still get no row at all.
  //
  // ⚖ CHEAPEST WHERE A COST EXISTS AND THE CURRENCIES AGREE, FIRST-LISTED OTHERWISE — which is the user's own
  // stated fallback, so no ruling was needed to ship it. "The currencies agree" is asked on the engine's own
  // identity for a currency (`currencyKey`), because two costs in different currencies do not compare at all and
  // picking the numerically smaller of them would be picking by an accident of scale.
  //
  // ⚠ "UNEARNED" IS NOT ONE PREDICATE, and this is `actionable()`'s rule read one level down (it works on CHIPS,
  // which exist only for a component with a usable short name; a progress row does not need one). Upgrades: drawn
  // and `open` — not bought, and a PSEUDO teaser is not a thing you buy. Buyables: never "earned" at all, so the
  // row means "progress to the NEXT one", and one at its `purchaseLimit` has no next one and is skipped rather
  // than shown at 100%. Challenges: not completed, active or not.
  //
  // ⚠ ONLY CATEGORIES THE CARD ACTUALLY DRAWS, which `visibleSeq` is: a row for a hidden category would leak
  // exactly what U2c's visibility rules hide.
  /** The `DETAIL` part that reads a category's numeric target — the SAME object the tooltip composes its cost line
   *  out of, so the two readers cannot drift. ⚠ A BUYABLE is the one category `DETAIL` carries no cost part for (a
   *  buyable's own `display` already states its cost, so the overlay composes none); the part below is declared in
   *  exactly the shape `DETAIL`'s other two use and goes through the same `numFieldOf` / `currencyOf` / `fmtNum`. */
  function detailPart(kind, field) {
    var parts = DETAIL[kind] || [];
    for (var i = 0; i < parts.length; i++) if (parts[i].num === field) return parts[i];
    return null;
  }
  var TARGET = { upgrades: detailPart('upgrades', 'cost'), challenges: detailPart('challenges', 'goal'),
    buyables: { num: 'cost', whole: true, label: 'Cost', currency: 'resource', multi: 'multiRes' } };

  /** THE CURRENT AMOUNT of whatever a component is bought with — `canAffordPurchase` (both engines' `js/utils.js`)
   *  and `canCompleteChallenge` (`js/game.js`), written once and generically, in their own four branches.
   *  ⚠ THE TWO DEFAULTS DIFFER, and it is measured rather than inferred: an upgrade's and a buyable's fallback is
   *  `player[layer].points`, a CHALLENGE's is the GLOBAL `player.points`. A single reader with one fallback would
   *  be wrong on every challenge whose layer has points of its own.
   *  ⚠ Read through `numFieldOf`, i.e. `tmp` first: the engines hand their own `canAffordPurchase` the TMP copy of
   *  the component, so a `currencyLocation` that tmp holds stale is stale for the engine's own affordability too. */
  function currencyAmount(l, kind, decl, t) {
    var name = numFieldOf('currencyInternalName', decl, t);
    if (name) {
      var loc = numFieldOf('currencyLocation', decl, t);
      if (loc) return safe(function () { return loc[name]; }, null);
      var lr = numFieldOf('currencyLayer', decl, t);
      if (lr) return safe(function () { return player[lr][name]; }, null);
      return safe(function () { return player[name]; }, null);
    }
    if (kind === 'challenges') return safe(function () { return player.points; }, null);
    return safe(function () { return player[l].points; }, null);
  }
  /** The IDENTITY of that currency, so "do these two costs compare?" is answerable at all. A `currencyLocation` is
   *  an OBJECT and two components can name the same key in different locations, so a location is identified by
   *  reference (its index in this category's own list) rather than by a word. */
  function currencyKey(l, kind, decl, t, locs) {
    var name = numFieldOf('currencyInternalName', decl, t);
    if (!name) return kind === 'challenges' ? '@points' : '@' + l + '.points';
    var loc = numFieldOf('currencyLocation', decl, t);
    if (loc) { var i = locs.indexOf(loc); if (i < 0) { i = locs.length; locs.push(loc); } return str(name) + '@loc' + i; }
    var lr = numFieldOf('currencyLayer', decl, t);
    return str(name) + (lr ? '@' + str(lr) : '@player');
  }
  // ---- (U13) WHAT A BUYABLE REALLY COSTS: the generated data, never a convention of ours --------------------------
  // `games-data/<id>.json` (C1, tools/currency-data.mjs) says per buyable which field it PAYS in (`pays`: one path,
  // several, or null) and whether its published cost is the price (`cost`: price | requirement | unknown), each
  // scored harness-side by a rollback buy. The two are READ APART on purpose — you could know the currency and not
  // the price — even though today they abstain on the same entries (docs/mobile.md).
  // ⛔ NO SECOND READER: the entry comes from `tmtLoader.currencyOf`, which the automation page defines. A plain
  // page never runs that half of loader/tmt-auto.js, so there — and only there — the same lookup is made here, over
  // the `tmtLoader.currencyData` the host fetched when this list was first opened (page.js). Undefined until it
  // arrives, so every buyable abstains (`? / ?`) until then, and the one refresh on arrival fills them in.
  function currencyEntry(l, id) {
    if (typeof T.currencyOf === 'function') return T.currencyOf(l, id);
    var d = T.currencyData, e = d && d.buyables && d.buyables[l] && d.buyables[l][String(id)];
    return e || null;
  }
  /** `path`: the ONE measured field this buyable pays in, else null (several, none, unscored, no entry, no data yet)
   *  — `paysIn`'s own rule. `priced`: the engine's published `cost` is really what it takes (`price`) or the bar it
   *  must clear (`requirement`); `unknown`, no entry or no data is not. */
  function buyableCurrency(l, id) {
    var e = currencyEntry(l, id);
    return { path: e && e.scored === true && typeof e.pays === 'string' ? e.pays : null,
      priced: !!e && (e.cost === 'price' || e.cost === 'requirement') };
  }
  function readPlayerPath(p) {
    var parts = String(p).split('.');
    if (parts[0] !== 'player') return null;
    return safe(function () {
      var o = player;
      for (var i = 1; i < parts.length; i++) { if (o === undefined || o === null) return null; o = o[parts[i]]; }
      return o;
    }, null);
  }
  /** The measured field's name, as the card's own readouts name things: a layer's `points` is that layer's
   *  `resource` (the card head's own label), the global one is the game's `pointsName`, and anything else is its
   *  PATH below `player` — U7's rule for the other resources ("THE LABEL IS THE KEY"), so `ptr`'s buildings read
   *  `g.power`, the same key the `g` card's own resource row shows. No name table: nothing here knows a game. */
  function pathLabel(p) {
    if (p === 'player.points') return safe(function () { return str(modInfo.pointsName); }, '') || 'points';
    var m = /^player\.([^.]+)\.points$/.exec(p);
    var r = m ? tipLine(safe(function () { return str(tmp[m[1]].resource); }, '')) : '';
    return r || String(p).replace(/^player\./, '');
  }
  function ltAmt(a, b) {
    return safe(function () { return typeof a.lt === 'function' ? !!a.lt(b) : Number(a) < Number(b); }, false);
  }
  function gteAmt(a, b) {
    return safe(function () { return typeof a.gte === 'function' ? !!a.gte(b) : Number(a) >= Number(b); }, false);
  }
  /** The ENGINE's own answer to "can this be bought right now", or `null` where it declares none.
   *  ⚠ THREE-VALUED ON PURPOSE. `affordable()` defaults an undeclared answer to `true`, which is right for lighting
   *  a button and would make the guard below fire on every component that declares nothing at all. */
  function engineAfford(kind, l, id) {
    if (kind === 'upgrades') return safe(function () { return typeof canAffordUpgrade === 'function' ? !!canAffordUpgrade(l, Number(id)) : null; }, null);
    if (kind === 'buyables') return safe(function () { var c = tmp[l].buyables[id].canAfford; return c === undefined ? null : !!c; }, null);
    return null;   // starting a challenge costs nothing in either engine, so there is no answer to disagree with
  }
  function unearned(kind, l, id, state) {
    if (kind === 'upgrades') return state === 'open';
    if (kind === 'challenges') return state !== 'done';
    if (kind === 'buyables') return belowLimit(l, id);
    return false;
  }

  /** ONE ROW PER CATEGORY THE CARD DRAWS that has a numeric target and something unearned in it, in the tab
   *  layout's own order. `how` records which rule chose the item — `cheapest`, `first` (the currencies did not
   *  agree) or `only` (one candidate, where the two rules cannot differ) — so a check on the choice can say
   *  whether it was ever exercised. `skipped` counts the components passed over for `multiRes`. */
  function progressOf(l) {
    var order = [], by = Object.create(null);
    visibleSeq(l).forEach(function (e) {
      var part = TARGET[e.kind];
      if (!part) return;
      if (!by[e.kind]) { by[e.kind] = { kind: e.kind, cand: [], locs: [], skipped: 0, drawn: 0 }; order.push(e.kind); }
      var g = by[e.kind];
      g.drawn++;
      if (!unearned(e.kind, e.layer, e.id, e.state)) return;
      var decl = declOf(e.kind, e.layer, e.id), t = tmpOf(e.kind, e.layer, e.id);
      if (e.kind === 'buyables') {
        // (U13) THE GENERATED DATA DECIDES BOTH HALVES — see `buyableCurrency`. A cost that is not known is still a
        // CANDIDATE: that is the `? / ?` row the ruling keeps. A cost that IS known but is no single amount is the
        // `multiRes` case below, exactly as before.
        var bc = buyableCurrency(e.layer, e.id);
        var bv = bc.priced ? numFieldOf(part.num, decl, t) : null;
        if (bc.priced && !isAmount(bv)) { if (part.multi && numFieldOf(part.multi, decl, t)) g.skipped++; return; }
        // ⚠ Two costs compare only when the SAME measured field pays both; an unknown half is a currency of its own,
        // so a category holding one falls back to first-listed, which is the user's stated fallback.
        g.cand.push({ layer: e.layer, kind: e.kind, id: e.id, decl: decl, tmp: t, target: bc.priced ? bv : null,
          path: bc.path, cur: bc.path && bc.priced ? 'path:' + bc.path : '?' + e.layer + '/' + e.id });
        return;
      }
      var v = numFieldOf(part.num, decl, t);
      if (!isAmount(v)) {
        // ⚠ `multiRes` — a cost in SEVERAL currencies, where `cost` itself is undefined; four games on the roster
        // declare it, `ptr` among them. A `x / y` row has no meaning for those, so they are SKIPPED and counted,
        // never rendered as `undefined / undefined`.
        if (part.multi && numFieldOf(part.multi, decl, t)) g.skipped++;
        return;
      }
      g.cand.push({ layer: e.layer, kind: e.kind, id: e.id, decl: decl, tmp: t, target: v,
        cur: currencyKey(e.layer, e.kind, decl, t, g.locs) });
    });
    var rows = [], dropped = [], suspect = [];
    order.map(function (k) { return by[k]; }).filter(function (g) { return g.cand.length; }).forEach(function (g) {
      var same = g.cand.every(function (c) { return c.cur === g.cand[0].cur; });
      var one = g.cand[0];
      if (same) g.cand.forEach(function (c) { if (ltAmt(c.target, one.target)) one = c; });
      var part = TARGET[g.kind];
      var buy = g.kind === 'buyables';
      // (U13) A BUYABLE'S NUMERATOR IS THE MEASURED FIELD, or `?`. ⛔ Never `currencyAmount`'s fallback to the
      // layer's own points: nothing in the engine declares what a buyable costs (0 of 841 buyable definitions carry
      // `currencyInternalName`), so that fallback was a convention of ours, and on `ptr`'s `s` it shipped
      // `17 / 6.28e350 space energy` where the game spends generator power.
      var amt = buy ? (one.path ? readPlayerPath(one.path) : null) : currencyAmount(one.layer, one.kind, one.decl, one.tmp);
      var haveKnown = isAmount(amt), needKnown = one.target !== null && isAmount(one.target);
      // ⛔ THE CROSS-CHECK, NOT THE MECHANISM (U13; before it, this dropped the row). In every engine-generic path
      // affordability implies amount ≥ cost, so "the engine says it can be bought and the field we read is short"
      // means OUR READER is wrong. That is a defect for the gate to fail on, not a state to render around: the row
      // still ships, and `suspect` names it. ⚠ The converse is NOT a signal — a game's `canAfford` routinely ANDs a
      // second condition (`layers.s.space().gt(0)`), so "engine says no, we say yes" is ordinary.
      var eng = engineAfford(one.kind, one.layer, one.id);
      if (eng === true && haveKnown && needKnown && !gteAmt(amt, one.target)) suspect.push({ kind: g.kind, layer: one.layer, id: one.id });
      var cur = buy ? (one.path ? pathLabel(one.path) : '') : part.currency ? currencyOf(part, one.layer, one.decl, one.tmp) : '';
      var K = KINDS[g.kind];
      var title = stripTags(textOf(one.decl, one.tmp, K ? K.field : 'title')).trim() || (one.kind + ' ' + one.id);
      var C = COUNTERS[g.kind];
      var have = haveKnown ? fmtNum(amt, part.whole) : '?', need = needKnown ? fmtNum(one.target, part.whole) : '?';
      rows.push({ kind: g.kind, layer: one.layer, id: one.id, label: C ? C.label : g.kind, name: title,
        how: g.cand.length === 1 ? 'only' : same ? 'cheapest' : 'first', candidates: g.cand.length,
        skipped: g.skipped, currency: cur, pays: buy ? one.path : null,
        have: have, need: need, haveKnown: haveKnown, needKnown: needKnown,
        text: have + ' / ' + need + (cur ? ' ' + cur : '') });
    });
    // ⚠ `multiRes` is counted per CATEGORY even where the category produced a row, so a page that skipped one is
    // never silent about it: four games on the roster declare a cost in several currencies at once.
    order.forEach(function (k) { if (by[k].skipped) dropped.push({ kind: k, layer: l, why: 'multiRes', n: by[k].skipped }); });
    return { rows: rows, dropped: dropped, suspect: suspect };
  }

  // ---- the overlay, and what it is anchored to
  // ONE overlay for the whole list, so "opening one closes any other" is the shape of the thing rather than a rule
  // it has to keep. It is identified by the component KEY, not by the element: the action row is rebuilt whenever
  // its membership moves, so an open tooltip's element can be replaced underneath it (see `syncTip`).
  var tipEl = null;        // the overlay
  var tipTitleEl = null, tipBodyEl = null;
  var tipKey = null;       // {card, role, kind, id, layer} — the component, never the element
  var tipAnchorEl = null;  // the element it is placed against, re-found after a rebuild
  var tipRich = false;     // did the last write find anything the `title` does not say?
  var TIP_GAP = 6, TIP_EDGE = 8;

  function buildTip() {
    if (tipEl) return;
    tipEl = document.createElement('div');
    tipEl.className = 'tmt-layerlist-tip';
    tipEl.id = 'tmt-layerlist-tip';
    tipEl.hidden = true;
    tipEl.setAttribute('role', 'tooltip');
    tipTitleEl = document.createElement('div');
    tipTitleEl.className = 'tmt-layerlist-tip-title';
    tipBodyEl = document.createElement('div');
    tipBodyEl.className = 'tmt-layerlist-tip-body';
    tipEl.append(tipTitleEl, tipBodyEl);
    // ⚠ A CHILD OF THE PANEL, NEVER OF A CARD. The card carries `contain: layout` (U2c), which makes it the
    // containing block for a `position: fixed` descendant — a tooltip inside a card could not be clamped to the
    // screen, which is the whole of the "nothing escapes at 390 px" promise. The panel itself has no containment.
    panel.appendChild(tipEl);
  }

  /** Which of our controls a press or a hover landed on, `null` for anything else in the panel. The same shape as
   *  `tipTargetOf` in loader/navbar.js, which walks up to the game's `[tooltip]` / `.tooltipBox` — these are OUR
   *  elements, so they need their own walk, and U1's RULES are what is shared (see `onTipClick`). */
  function tipTargetOf(node) {
    for (var el = node; el && el !== panel; el = el.parentElement) {
      if (!el.classList) continue;
      if (el.classList.contains('tmt-layerlist-chip') || el.classList.contains('tmt-layerlist-act')
        || el.classList.contains('tmt-layerlist-counter')) return el;
    }
    return null;
  }
  function tipKeyOf(el) {
    var card = el.closest ? el.closest('.tmt-layerlist-card') : null;
    var cardLayer = card ? card.dataset.layer : null;
    var role = el.classList.contains('tmt-layerlist-counter') ? 'counter'
      : el.classList.contains('tmt-layerlist-act') ? 'act' : 'chip';
    return { card: cardLayer, role: role, kind: el.dataset.kind || '',
      id: role === 'counter' ? null : str(el.dataset.cid),
      layer: role === 'counter' ? cardLayer : (el.dataset.layer || cardLayer) };
  }
  /** The element a key points at TODAY. Found by walking the card's controls and comparing the data attributes
   *  rather than by building a selector: an id is the game's own object key and a selector would have to escape it. */
  function tipAnchorOf(k) {
    var rec = k && k.card ? cards[k.card] : null;
    if (!rec) return null;
    var cls = k.role === 'counter' ? '.tmt-layerlist-counter' : k.role === 'act' ? '.tmt-layerlist-act' : '.tmt-layerlist-chip';
    var list = rec.el.querySelectorAll(cls);
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.dataset.kind !== k.kind) continue;
      if (k.role === 'counter') return e;
      if (str(e.dataset.cid) === str(k.id) && (e.dataset.layer || k.card) === k.layer) return e;
    }
    return null;
  }

  /** The two lines. ⚠ The FIRST is the element's own `title`, so the overlay cannot contradict the native tooltip.
   *  Returns whether there is a SECOND — a tooltip with no detail says exactly what the browser's already says. */
  function writeTip(el, k) {
    var title = str(el.getAttribute ? el.getAttribute('title') : '');
    var body = k.role === 'counter' ? '' : tipDetail(k.kind, k.layer, k.id);
    tipTitleEl.textContent = title;
    tipBodyEl.textContent = body;
    tipRich = !!body && body !== title;
    return tipRich;
  }

  /** Placed against the anchor, CLAMPED INSIDE THE PANEL — which is the visible list, and already sits above the
   *  nav bar (`bottom: var(--tmt-navbar-h)`), so one clamp keeps the tooltip on screen AND off the bar. Above the
   *  control by preference, below it when there is no room above, and never outside either edge. */
  function placeTip(el) {
    tipEl.style.left = '0px';
    tipEl.style.top = '0px';
    var r = el.getBoundingClientRect(), t = tipEl.getBoundingClientRect(), p = panel.getBoundingClientRect();
    var vw = document.documentElement.clientWidth || p.right, vh = document.documentElement.clientHeight || p.bottom;
    var minX = Math.max(TIP_EDGE, p.left + TIP_EDGE), maxX = Math.min(vw - TIP_EDGE, p.right - TIP_EDGE) - t.width;
    var minY = Math.max(TIP_EDGE, p.top + TIP_EDGE), maxY = Math.min(vh - TIP_EDGE, p.bottom - TIP_EDGE) - t.height;
    var x = r.left + r.width / 2 - t.width / 2;
    tipEl.style.left = Math.round(maxX < minX ? minX : Math.max(minX, Math.min(x, maxX))) + 'px';
    var y = r.top - t.height - TIP_GAP;
    if (y < minY) y = r.bottom + TIP_GAP;
    tipEl.style.top = Math.round(maxY < minY ? minY : Math.max(minY, Math.min(y, maxY))) + 'px';
  }

  function showTip(el) {
    if (!el || !panel || !panel.contains(el)) return false;
    // ⚠ AND IT MUST BE ON SCREEN. A collapsed card hides its whole chip row, and a control with no layout has no box
    // to place a tooltip against — `getBoundingClientRect()` is all zeroes there, so the overlay would land in the
    // top-left corner pointing at nothing, and the next `syncTip` would close it again. Refusing it here is what makes
    // the two agree. MEASURED by the gate's own constructed re-read leg, which opened one on a hidden chip and read
    // `THE REFRESH CLOSED THE TOOLTIP`.
    if (!el.getClientRects().length) return false;
    buildTip();
    var k = tipKeyOf(el);
    if (tipAnchorEl && tipAnchorEl !== el) hideTip();   // ONE overlay: opening one closes any other, by construction
    tipKey = k;
    tipAnchorEl = el;
    writeTip(el, k);
    tipEl.hidden = false;
    try { el.setAttribute('aria-describedby', tipEl.id); } catch (e) { /* the title attribute is still the name */ }
    placeTip(el);
    stats.tips++;
    if (tipRich) stats.tipsRich++;
    return true;
  }
  function hideTip() {
    if (!tipEl || tipEl.hidden) { tipKey = null; tipAnchorEl = null; return false; }
    tipEl.hidden = true;
    if (tipAnchorEl) { try { tipAnchorEl.removeAttribute('aria-describedby'); } catch (e) { /* already gone */ } }
    tipKey = null;
    tipAnchorEl = null;
    return true;
  }
  function toggleTip(el) {
    if (tipEl && !tipEl.hidden && tipAnchorEl === el) return hideTip();
    return showTip(el);
  }
  /** ⚠ COST AND EFFECT MOVE EVERY TICK, so an open tooltip is re-read — on the SAME throttled path as the counters
   *  (`syncCards`, 250 ms) and in full on every explicit `refresh()`. One per frame would undo U2d's throttle; never
   *  would leave a stale number on screen for as long as the finger is down. And it RE-ANCHORS: the action row is
   *  rebuilt whenever its membership moves, so the element can be replaced under an open tooltip. A control that is
   *  gone, or that its card has collapsed out of sight, closes it. */
  function syncTip() {
    if (!tipEl || tipEl.hidden || !tipKey) return;
    var el = tipAnchorEl && panel.contains(tipAnchorEl) ? tipAnchorEl : tipAnchorOf(tipKey);
    if (!el || !el.getClientRects().length) return void hideTip();
    tipAnchorEl = el;
    writeTip(el, tipKey);
    placeTip(el);
    stats.tipSyncs++;
  }

  // ---- ⚖ HOVER ON A POINTER, TAP ON TOUCH — U1's rule (loader/navbar.js), kept, with its two constraints:
  // the listener never calls `preventDefault`, so the chip's own click still buys; and opening one tooltip closes
  // any other. (⚠ The PHASE differs, for a measured reason — see the `addEventListener` call in `build`.) What is NOT shared is the guard: U1's game-element tooltips are `T.mobile` only,
  // because on a desktop the game's own CSS `:hover` already opens them. Ours are keyed on the DEVICE
  // (`(hover: none)`) instead, because the list is wanted at a desktop width under `?navbar=1` too — where
  // `T.mobile` is false and there would otherwise be no way to open a tooltip on a phone-sized touch screen.
  // MEASURED in the gate's own two contexts: the phone one reports `(hover: none)`, `(pointer: coarse)` and
  // `maxTouchPoints: 1`; the desktop one reports `(hover: hover)`, `(pointer: fine)` and `0` — and the phone
  // context keeps `(hover: none)` when the gate resizes it to 1280, which is right: it is the device, not the width.
  function hoverable() { return safe(function () { return !window.matchMedia('(hover: none)').matches; }, true); }
  function onTipOver(ev) {
    // a pointerType of '' or undefined is a synthetic event: treat it as a mouse, which is what a hover test wants
    if (ev.pointerType && ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return;
    var t = tipTargetOf(ev.target);
    if (!t) { if (tipAnchorEl && !panel.contains(ev.target)) hideTip(); return; }
    if (t !== tipAnchorEl) showTip(t);
  }
  function onTipOut(ev) {
    if (ev.pointerType && ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return;
    if (!tipAnchorEl) return;
    // leaving for something INSIDE the same control is not leaving it
    var to = ev.relatedTarget;
    if (to && tipAnchorEl.contains(to)) return;
    if (tipTargetOf(ev.target) !== tipAnchorEl) return;
    hideTip();
  }
  function onTipClick(ev) {
    if (hoverable() && ev.pointerType !== 'touch') return;  // a mouse already has the hover path
    var t = tipTargetOf(ev.target);
    if (!t) return void hideTip();                          // a tap anywhere else in the list closes it
    toggleTip(t);
  }

  // ---------------------------------------------------------------- the DOM
  var panel = null, body = null, open = false, sig = null, cards = Object.create(null);
  // the throttle's clock, and what the gate reads to tell a throttled build from an unthrottled one
  var lastSync = 0, stats = { refreshes: 0, syncs: 0, throttled: 0, rebuilds: 0, fits: 0, tips: 0, tipsRich: 0, tipSyncs: 0, glows: 0, counterGlows: 0, resets: 0, hooks: 0, glowCarries: 0, glowsOwed: 0, glowsRelit: 0, currencyArrivals: 0 };

  function build() {
    if (panel) return;
    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Layers');
    var head = document.createElement('div');
    head.className = 'tmt-layerlist-head';
    var title = document.createElement('span');
    title.className = 'tmt-layerlist-title';
    title.textContent = 'Layers';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'tmt-layerlist-close';
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', function () { hide(); });
    head.append(title, close);
    body = document.createElement('div');
    body.className = 'tmt-layerlist-body';
    panel.append(head, body);
    document.body.appendChild(panel);
    buildTip();
    // ⚖ hover on a pointer, tap on touch (U2e) — see `onTipClick` for what is shared with loader/navbar.js and what
    // is not. Scoped to the PANEL, not to the document: these are our own controls, and a listener on the document
    // would be a second handler racing U1's on every click in the game.
    panel.addEventListener('pointerover', onTipOver, false);
    panel.addEventListener('pointerout', onTipOut, false);
    // ⚠ THE CLICK LISTENER IS ON THE CAPTURE PHASE, and it is the one place U1's shape had to be adapted rather
    // than copied. U1's is a bubble delegate on the document, which is right for the GAME's elements. Ours sits on
    // the panel over controls that RE-RENDER when they are pressed: buying an upgrade moves the action row's
    // membership, `drawActions` replaces every button in it, and by the time a bubble listener ran its `event.target`
    // would be a DETACHED element with no path back to the panel — so a tap that bought something would open no
    // tooltip at all, while a tap on an unaffordable one would. On the way down the element is still live. The half
    // of U1's rule that matters is kept exactly: nothing here calls `preventDefault`, so the control's own click
    // still happens, and a tooltip whose control has gone closes on the next sync.
    panel.addEventListener('click', onTipClick, true);
    // (U12) a reset that arrived while its layer was still glowing re-lights it the moment that glow ENDS
    panel.addEventListener('animationend', onGlowEnd, false);
  }

  function card(l) {
    var el = document.createElement('div');
    el.className = 'tmt-layerlist-card';
    el.dataset.layer = l;

    var openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'tmt-layerlist-open';
    var badge = document.createElement('span');
    badge.className = 'tmt-layerlist-badge';
    // the engine renders a layer's symbol with `v-html` (it is routinely markup — a <br>, a styled span), so the
    // badge does too. It is the game's own string, already rendered as HTML by the game on this same page.
    badge.innerHTML = safe(function () { var s = tmp[l].symbol; return typeof s === 'string' ? s : str(l).toUpperCase(); }, str(l).toUpperCase());
    // a symbol is usually one or two characters, but it is free text: 2.7's system layers carry 'Changelog-tab', and
    // an engine renders it in a 100 px tree node where a card's badge is 44. The step is on the TEXT, not the markup,
    // so a symbol that is an <img> (collection-of-everything) keeps the plain size and its own width rule.
    badge.dataset.len = String(Math.min(badge.textContent.replace(/\s+/g, '').length, 9));
    var meta = document.createElement('span');
    meta.className = 'tmt-layerlist-meta';
    var name = document.createElement('span');
    name.className = 'tmt-layerlist-name';
    var amount = document.createElement('span');
    amount.className = 'tmt-layerlist-amount';
    meta.append(name, amount);
    openBtn.append(badge, meta);
    openBtn.addEventListener('click', function () { openTab(l); });
    // ⚠ THE EXPANDER SITS IN THE CARD'S HEAD, not in either of the two rows, because it has to be pressable in
    // BOTH states — the expanded card hides the counters and the buttons, so a toggle living in either of them
    // could not be pressed to collapse again. In the head it also costs no vertical space of its own.
    var head = document.createElement('div');
    head.className = 'tmt-layerlist-cardhead';
    head.appendChild(openBtn);
    el.appendChild(head);

    // ---- (U7) THE LAYER'S OTHER RESOURCES, in BOTH states: they are readouts of the same kind as the amount in
    // the head, not controls, so hiding them behind the expander would hide the thing the user asked to see.
    // ⚠ Built empty and always present, for the same reason the two collapsed rows are: a resource can APPEAR
    // without the rebuild signature moving (a key the tab only names once it is above zero), and a row that only
    // existed when it started non-empty would have nowhere to put it. `:empty` hides it.
    var resourceBox = document.createElement('div');
    resourceBox.className = 'tmt-layerlist-resources';
    el.appendChild(resourceBox);

    // the prestige button, on the engine's own condition for having one at all
    // ⚖ (U7) TWO ROWS, ALWAYS. The two spans are built ONCE and never replaced — only their contents move — so
    // the block's height is decided by the stylesheet's reservation and not by whether the engine emitted a
    // second half this tick. `data-line` is what the gate reads them back by.
    var reset = null, resetL1 = null, resetL2 = null;
    if (safe(function () { return tmp[l].type; }, null) !== 'none') {
      reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'tmt-layerlist-reset';
      resetL1 = document.createElement('span');
      resetL1.className = 'tmt-layerlist-resetline';
      resetL1.dataset.line = '1';
      resetL2 = document.createElement('span');
      resetL2.className = 'tmt-layerlist-resetline';
      resetL2.dataset.line = '2';
      reset.append(resetL1, resetL2);
      reset.addEventListener('click', function () { act(function () { doReset(l); }); });
      el.appendChild(reset);
    }

    // ---- (U7) PER-CATEGORY PROGRESS, in the EXPANDED card and UNDER the reset button — ⚠ the reset line's second
    // half IS the per-LAYER progress display, so these sit beneath it and are styled to match it.
    var progressBox = document.createElement('div');
    progressBox.className = 'tmt-layerlist-progress';
    el.appendChild(progressBox);

    var chips = chipsOf(l);
    var chipBox = null, more = null, counterBox = null, actionBox = null;
    if (chips.length) {
      // ---- the EXPANDED view: U2b's chip row, untouched, minus the `+N` cut. Every chip is in it now, because
      // the collapsed card is no longer a PREFIX of the chips — it is two rows of its own.
      chipBox = document.createElement('div');
      chipBox.className = 'tmt-layerlist-chips';
      chips.forEach(function (c, i) {
        // ⚖ DIVIDERS BETWEEN THE CATEGORIES (user, 2026-09-18). A divider is emitted BEFORE the chip whose
        // category it introduces, which is what keeps one off both ends: there is none before the first chip, and
        // since U2d the row is all-or-nothing, so no cut can leave one trailing either.
        if (i > 0 && chips[i - 1].kind !== c.kind) {
          var d = document.createElement('span');
          d.className = 'tmt-layerlist-divider';
          d.setAttribute('aria-hidden', 'true');
          d.dataset.between = chips[i - 1].kind + '|' + c.kind;
          chipBox.appendChild(d);
        }
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tmt-layerlist-chip';
        b.dataset.state = c.state;
        b.dataset.kind = c.kind;       // also what gives a MILESTONE chip its square corners, in CSS
        b.dataset.cid = c.id;
        b.dataset.layer = c.layer;     // a `layer-proxy` chip acts on ANOTHER layer than the card it sits on
        drawChipText(b, c);            // (U10) the short name, and — for a buyable — how many you own
        paintChip(b, c);               // (U5) the game's own colour for this component in this state
        b.addEventListener('click', function () { chipPressed(c); });
        chipBox.appendChild(b);
      });
      el.appendChild(chipBox);
      more = document.createElement('button');
      more.type = 'button';
      more.className = 'tmt-layerlist-more';
      // ⚠ NO DIGIT ON THE TOGGLE. U2's label was `+N`, the count hidden behind it; the counter row now states
      // every one of those totals outright, so a number here would be a second, shakier answer to a question the
      // row above has already answered — and one more number to hold still. A chevron says only "there is more".
      // the state this card was left in, LAST LOAD or last rebuild — the store is read here, once per card, which
      // is also what makes a rebuild (an unlocked layer, a switched subtab) keep the card as the player left it.
      var wasOpen = !!prefRead()[l];
      if (wasOpen) el.classList.add('tmt-layerlist-expanded');
      setMore(more, wasOpen);
      more.addEventListener('click', function () { setExpanded(l, !cards[l].el.classList.contains('tmt-layerlist-expanded')); });
      head.appendChild(more);
    }
    // ---- the COLLAPSED view, row one: the counters
    // ⚠ BOTH ROWS ARE ALWAYS BUILT, empty or not, and `:empty` is what hides them: a category can APPEAR without
    // the rebuild signature moving (a clickable's first amount, an upgrade that comes back into reach), and a row
    // that only existed when it started non-empty would have nowhere to put it.
    var counters = countersOf(l);
    counterBox = document.createElement('div');
    counterBox.className = 'tmt-layerlist-counters';
    el.appendChild(counterBox);
    // ---- and row two: what you can act on. A SEPARATE box, so the two wrap and fit independently of each other.
    var actions = actionsOf(chips);
    actionBox = document.createElement('div');
    actionBox.className = 'tmt-layerlist-actions';
    el.appendChild(actionBox);
    var rec = { el: el, layer: l, head: head, name: name, amount: amount, reset: reset, chips: chips, more: more,
      glowEl: openBtn,                    // (U11) what carries the reset glow (its `::before`); U12 drives it from `doReset`
      counterMark: null,                  // (U11) each counter's last number, for the summary-chip glow
      resetL1: resetL1, resetL2: resetL2,
      chipEls: chipBox ? [].slice.call(chipBox.querySelectorAll('.tmt-layerlist-chip')) : [],
      counterBox: counterBox, counterKeys: '', counterEls: [], reserved: Object.create(null),
      resourceBox: resourceBox, resourceKeys: '', resourceEls: [], resReserved: Object.create(null),
      progressBox: progressBox, progressKeys: '', progressEls: [],
      actionBox: actionBox, actionKeys: '', actionEls: [], countChars: 0 };
    cards[l] = rec;
    drawCounters(rec, counters);
    drawResources(rec, resourcesOf(l));
    drawProgress(rec, progressOf(l).rows);
    drawActions(rec, actions);
    fitChipCounts(rec);   // (U10) the counts are written at build; their reservation is applied here, not a sync later
    return el;
  }

  /** OPEN OR CLOSE ONE CARD — the button's own path, and the API's. Writes the store, and re-fits the action row
   *  on the way back: a card built OPEN has its buttons in a `display: none` row, where `getBoundingClientRect()`
   *  reports every one of them at the same zero top, so the fit pass at build time could not see where the browser
   *  had wrapped them. `fitCards` skips an open card for that reason, and this is where the measurement it skipped
   *  is paid. MEASURED on `the-unbalanced-tree`'s `i` without it: a card reopened from the store and then closed
   *  showed all 10 of its buttons on TWO lines, 261 px tall, against the 7 on one line and 211 px it had before. */
  function setExpanded(l, on) {
    var rec = cards[l];
    if (!rec || !rec.more) return false;
    on = !!on;
    rec.el.classList.toggle('tmt-layerlist-expanded', on);
    setMore(rec.more, on);
    if (on) prefRead()[l] = true; else delete prefRead()[l];
    prefWrite();
    if (!on) fitCards([l]);
    syncTip();          // the state it hid may be the control an open tooltip was anchored to
    return on;
  }

  function setMore(btn, expanded) {
    btn.textContent = expanded ? '\u2303' : '\u2304';   // ⌃ / ⌄
    btn.title = expanded ? 'Show less' : 'Show every component';
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  /** Row one. Rebuilt only when the SET of categories changes; otherwise `syncCounters` moves the numbers. */
  function drawCounters(rec, counters) {
    rec.counterBox.textContent = '';
    rec.counterEls = counters.map(function (g) {
      var box = document.createElement('span');
      box.className = 'tmt-layerlist-counter';
      box.dataset.kind = g.kind;      // also what gives the MILESTONE counter its square corners, in CSS
      box.dataset.mode = g.mode;
      box.title = g.name;
      var lab = document.createElement('span');
      lab.className = 'tmt-layerlist-counter-label';
      lab.textContent = g.label;
      var val = document.createElement('span');
      val.className = 'tmt-layerlist-counter-value';
      box.append(lab, val);
      rec.counterBox.appendChild(box);
      return { kind: g.kind, box: box, val: val };   // (U6) `skinKey` / `skinBg` are the paint memo, added on first paint
    });
    rec.counterKeys = counters.map(function (g) { return g.kind; }).join(' ');
    syncCounters(rec, counters);
  }
  function syncCounters(rec, counters) {
    counters.forEach(function (g, i) {
      var e = rec.counterEls[i];
      if (!e || e.kind !== g.kind) return;
      e.val.textContent = g.text;
      e.box.dataset.x = g.mode === 'ratio' ? String(g.x) : '';
      e.box.dataset.y = g.mode === 'ratio' ? String(g.y) : '';
      e.box.dataset.total = g.mode === 'ratio' ? '' : g.text;
      // ⚠ THE RESERVATION ONLY GROWS. A width that shrank back would move the row the moment a number did, which
      // is the jitter the reservation exists to prevent (see `chars` above, and `tabular-nums` in the CSS).
      var want = Math.max(g.chars, rec.reserved[g.kind] || 0);
      if (want !== rec.reserved[g.kind]) { rec.reserved[g.kind] = want; e.val.style.minWidth = want + 'ch'; }
      paintCounter(rec.layer, e, g);   // (U6) and the counter's own colour, on the same budget as the digits
    });
  }
  /** (U6) Paint one counter. Same shape as `paintSkin`, and the memo is the counter's element record for the same
   *  reason: one memo per ELEMENT, never per category. */
  function paintCounter(l, e, g) {
    var sk = counterSkin(l, g);
    if (e.skinKey === sk.key && e.skinBg === sk.bg) return false;
    e.skinKey = sk.key; e.skinBg = sk.bg;
    if (sk.key) e.box.dataset.skin = sk.key; else delete e.box.dataset.skin;
    e.box.style.backgroundColor = sk.bg;
    return true;
  }

  // ---------------------------------------------------------------- (U7) the two new rows
  /** THE OTHER RESOURCES. Same shape as the counters: rebuilt only when the SET of keys changes, otherwise the
   *  values move in place — and the value's width reservation only ever GROWS, for the reason `syncCounters`
   *  states (a width that shrank back would move the row the moment a number did). */
  function drawResources(rec, rs) {
    rec.resourceBox.textContent = '';
    rec.resourceEls = rs.map(function (r) {
      var box = document.createElement('span');
      box.className = 'tmt-layerlist-resource';
      box.dataset.key = r.key;
      var lab = document.createElement('span');
      lab.className = 'tmt-layerlist-resource-label';
      // (U9) THE LABEL IS NOT ALWAYS THE KEY any more, and the two are separate fields for exactly one row: the
      // DECLARED global-currency row, whose label is the game author's own `baseResource`. Every `player[l]` key
      // still ships `label === key` (U7's ruling), so nothing else on any card moves.
      lab.textContent = r.label === undefined ? r.key : r.label;
      var val = document.createElement('span');
      val.className = 'tmt-layerlist-resource-value';
      box.append(lab, val);
      rec.resourceBox.appendChild(box);
      return { key: r.key, box: box, val: val };
    });
    rec.resourceKeys = rs.map(function (r) { return r.key; }).join(' ');
    syncResources(rec, rs);
  }
  function syncResources(rec, rs) {
    rs.forEach(function (r, i) {
      var e = rec.resourceEls[i];
      if (!e || e.key !== r.key) return;
      e.val.textContent = r.text;
      e.box.title = (r.label === undefined ? r.key : r.label) + ': ' + r.text;
      e.box.dataset.collide = r.collide ? 'yes' : 'no';
      // (U9) reported, never styled — the `sticky` flag's own rule one line down. A row the player reads must not
      // change appearance because of where the list learned about it.
      e.box.dataset.global = r.global ? 'yes' : 'no';
      // (U8) whether this row is REMEMBERED right now — written here and not in `drawResources`, because a row
      // flips between attributed and remembered without the KEY SET moving, which is the only thing a rebuild
      // watches. It is reported, never styled: a row the player has already seen must not change appearance
      // depending on whether the layer's prose happens to state its number this tick.
      e.box.dataset.sticky = r.sticky ? 'yes' : 'no';
      var want = Math.max(r.text.length, rec.resReserved[r.key] || 0);
      if (want !== rec.resReserved[r.key]) { rec.resReserved[r.key] = want; e.val.style.minWidth = want + 'ch'; }
    });
  }

  /** THE PER-CATEGORY PROGRESS ROWS. Rebuilt when the CATEGORY set or the chosen component changes — which is a
   *  purchase, an unlock or a completion, never a tick — and otherwise only the numbers move. */
  function drawProgress(rec, ps) {
    rec.progressBox.textContent = '';
    rec.progressEls = ps.map(function (g) {
      var row = document.createElement('div');
      row.className = 'tmt-layerlist-prog';
      row.dataset.kind = g.kind;
      row.dataset.cid = g.id;
      row.dataset.layer = g.layer;
      row.dataset.how = g.how;
      var lab = document.createElement('span');
      lab.className = 'tmt-layerlist-prog-label';
      lab.textContent = g.label;
      var nm = document.createElement('span');
      nm.className = 'tmt-layerlist-prog-name';
      var val = document.createElement('span');
      val.className = 'tmt-layerlist-prog-value';
      // (U13) the two halves are elements of their own, so a `?` can carry its own class and its own reason
      var have = document.createElement('span'), need = document.createElement('span'), cur = document.createElement('span');
      have.className = 'tmt-layerlist-prog-have';
      need.className = 'tmt-layerlist-prog-need';
      cur.className = 'tmt-layerlist-prog-cur';
      val.append(have, document.createTextNode(' / '), need, cur);
      row.append(lab, nm, val);
      rec.progressBox.appendChild(row);
      return { key: g.kind + '/' + g.layer + '/' + g.id, box: row, name: nm, val: val, have: have, need: need, cur: cur };
    });
    rec.progressKeys = ps.map(function (g) { return g.kind + '/' + g.layer + '/' + g.id; }).join(' ');
    syncProgress(rec, ps);
  }
  function syncProgress(rec, ps) {
    ps.forEach(function (g, i) {
      var e = rec.progressEls[i];
      if (!e) return;
      e.name.textContent = g.name;
      // ⚠ (U13) the RULE can change under an unchanged key, so it is synced, not drawn once: before the data lands
      // every buyable abstains and the pick is `first`; after it, `cheapest` can pick the SAME component (MEASURED on
      // `the-energy-factory`'s `energy/11`), and a mark written only at draw time kept saying `first`.
      e.box.dataset.how = g.how;
      e.have.textContent = g.have;
      e.need.textContent = g.need;
      e.cur.textContent = g.currency ? ' ' + g.currency : '';
      // ⚖ (U13) A `?` IS AN ANSWER, NOT AN APOLOGY — nearly a quarter of the roster's buyables have one. It says
      // which half is not known and why, in the same place every other readout keeps its explanation.
      markUnknown(e.have, !g.haveKnown, 'Not known: this game does not declare what this is bought with, and no single field was measured paying for it');
      markUnknown(e.need, !g.needKnown, 'Not known: this game does not declare what this costs, and its published cost was not measured to be the price');
      e.box.dataset.have = g.haveKnown ? 'known' : 'unknown';
      e.box.dataset.need = g.needKnown ? 'known' : 'unknown';
      e.box.title = g.name + ' \u2014 ' + g.text;
    });
  }
  function markUnknown(el, on, why) {
    el.classList.toggle('tmt-layerlist-prog-q', on);
    if (on) el.title = why; else el.removeAttribute('title');
  }

  /** Row two. Rebuilt when the SET changes — which affordability can never do; only a purchase, an unlock or a
   *  completion can. The lit/grey class is the only thing a tick moves. */
  function drawActions(rec, actions) {
    rec.actionBox.textContent = '';
    rec.actionEls = actions.map(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tmt-layerlist-act';
      b.dataset.kind = c.kind;
      b.dataset.cid = c.id;
      b.dataset.layer = c.layer;
      drawChipText(b, c);   // (U10) THE SAME call the expanded chip makes, so the two views cannot disagree
      b.addEventListener('click', function () { chipPressed(c); });
      rec.actionBox.appendChild(b);
      return { chip: c, el: b };
    });
    rec.actionKeys = actions.map(function (c) { return c.key; }).join(' ');
    syncActions(rec);
  }
  /** ⚖ (U6) AN ACTION BUTTON WEARS THE SAME SKIN AS ITS CHIP (user, 2026-09-19): it stands for the same component,
   *  so the collapsed card and the expanded one say the same thing about it. Until U6 the skin was applied where the
   *  CHIPS are built and nowhere else, so the collapsed card was still on U2d's lit/grey alone — MEASURED on `ptr`,
   *  same card: the action button read `skin=null bg=rgba(0, 0, 0, 0)` while its chip read `skin="locked"
   *  bg=rgb(191, 143, 143)`.
   *  ⚠ `data-afford` STAYS. The two attributes answer different questions — lit/grey is "can I press this right
   *  now", the skin is "what IS this" — and the collapsed card wants both. */
  function syncActions(rec) {
    rec.actionEls.forEach(function (a) {
      a.el.dataset.afford = affordable(a.chip) ? 'yes' : 'no';
      paintSkin(a.el, a.chip, a);   // the memo is the ACTION's own record, never the shared chip object
      syncChipCount(a.el, a.chip);  // (U10) and the same count the expanded chip shows — its memo is `data-count`
    });
  }

  /** HOW MANY BUTTONS A ROW HOLDS — ⚖ measured at render, never a constant (user, 2026-09-18). Every candidate is
   *  in the DOM; the ones the browser wrapped onto a second line are hidden. Measured against the row's OWN box, so
   *  a wider card holds more and a phone holds fewer, and re-measured on a resize.
   *  ⚠ Read in one batch, after the cards are in the document: `getBoundingClientRect()` forces layout, and a
   *  per-card read during construction would force one per card. Hiding a trailing flex item cannot move the items
   *  before it, so one pass is enough. */
  function fitCards(list) {
    var boxes = [];
    (list || Object.keys(cards)).forEach(function (l) {
      var rec = cards[l];
      if (!rec || !rec.actionBox || !rec.actionEls.length) return;
      // ⚠ an OPEN card hides the whole action row, and a `display: none` row has no layout to measure — every
      // button would report the same zero top and none would be marked as having wrapped. It is measured when the
      // card closes again (`setExpanded`), which is the first moment the row has a box at all.
      if (rec.el.classList.contains('tmt-layerlist-expanded')) return;
      rec.actionEls.forEach(function (a) { a.el.classList.remove('tmt-layerlist-nofit'); });
      boxes.push(rec);
    });
    boxes.forEach(function (rec) {
      var top = null, cut = false;
      rec.actionEls.forEach(function (a) {
        var t = a.el.getBoundingClientRect().top;
        a.hide = false;
        if (top === null) { top = t; return; }
        if (cut || t > top + 1) { cut = true; a.hide = true; } else { a.hide = false; }
      });
      rec.actionEls.forEach(function (a) { if (a.hide) a.el.classList.add('tmt-layerlist-nofit'); });
      rec.fitted = rec.actionEls.filter(function (a) { return !a.hide; }).length;
    });
    if (boxes.length) stats.fits++;
  }

  function rebuild() { return withoutRaisingNaN(rebuildInner); }
  function rebuildInner() {
    var gs = groups();
    body.textContent = '';
    cards = Object.create(null);
    gs.forEach(function (g) {
      var sec = document.createElement('section');
      sec.className = 'tmt-layerlist-row';
      sec.dataset.row = String(g.row);
      var h = document.createElement('h3');
      h.className = 'tmt-layerlist-rowlabel';
      h.textContent = rowLabel(g.row);
      sec.appendChild(h);
      var grid = document.createElement('div');
      grid.className = 'tmt-layerlist-grid';
      g.layers.forEach(function (l) { grid.appendChild(card(l)); });
      sec.appendChild(grid);
      body.appendChild(sec);
    });
    sig = signature(gs);
    stats.rebuilds++;
    // (U12) a reset MOVES membership, so the rebuild it causes lands inside its own glow: carry that glow over
    Object.keys(cards).forEach(function (l) { carryGlow(cards[l]); });
    // the cards are in the document now, so this is where the row width exists to be measured
    fitCards(null);
  }

  /** What a REBUILD is keyed on: the rows and their layers, and — since U2b — each card's drawn components in the
   * tab layout's order. A chip's STATE is deliberately absent: state is appearance, and rebuilding on it would put
   * the chips back to hopping under a finger. What is present is MEMBERSHIP and ORDER, because the list mirrors
   * the normal view and the normal view does change when an upgrade unlocks or a subtab is switched. */
  function signature(gs) {
    return gs.map(function (g) {
      return g.key + ':' + g.layers.map(function (l) {
        return l + '[' + visibleSeq(l).map(function (e) { return e.key; }).join(' ') + ']';
      }).join(',');
    }).join('|');
  }

  /** The live values: the amount, the prestige text, and each control's state. Never REORDERS — a rebuild is what
   * handles an arrangement that really changed (see `signature`), so nothing moves under a finger. */
  /** `refresh(false)` is the OBSERVER's call and may skip the counters (see `COUNTER_MS`); every other caller —
   *  the API, a press, opening the panel — gets the whole thing. */
  function refresh(force) {
    if (!panel || !open) return;
    var f = force !== false;
    return withoutRaisingNaN(function () { return refreshInner(f); });
  }
  function refreshInner(force) {
    stats.refreshes++;
    hookResets();   // (U12) one identity compare per global: re-hooks only if something replaced them
    var gs = groups();
    if (signature(gs) !== sig) { rebuild(); }
    Object.keys(cards).forEach(function (l) {
      var c = cards[l];
      var unlocked = safe(function () { return !!(player[l] && player[l].unlocked); }, false);
      c.el.classList.toggle('tmt-layerlist-locked', !unlocked);
      var res = safe(function () { return str(tmp[l].resource); }, '');
      var nm = safe(function () { return str(tmp[l].name); }, '');
      c.name.textContent = res || nm || l;
      c.amount.textContent = amountOf(l);
      if (c.reset) {
        // ⚖ (U7) TWO LINES, ALWAYS — see `resetLines`. The engines' own `<br><br>` IS the split point, so the
        // two halves keep their own line boxes instead of being collapsed into one run of text whose height
        // answers to the digit count.
        var rl = resetLines(resetText(l));
        c.resetL1.innerHTML = rl[0];
        c.resetL2.innerHTML = rl[1];
        var can = safe(function () { return !!tmp[l].canReset; }, false);
        c.reset.classList.toggle('can', can);
        c.reset.classList.toggle('locked', !can);
        var col = safe(function () { return str(tmp[l].color); }, '');
        c.reset.style.backgroundColor = can && col ? col : '';
      }
      var badge = c.el.querySelector('.tmt-layerlist-badge');
      if (badge) badge.style.backgroundColor = safe(function () { return str(tmp[l].color); }, '');
      c.chips.forEach(function (chip, i) {
        // a chip that went away entirely is a MEMBERSHIP change, which the signature above has already rebuilt
        // for; here `null` can only be a race inside one frame, so the chip keeps the state it had.
        var st = chipState(chip.kind, chip.layer, chip.id);
        if (st === null) return;
        chip.state = st;
        if (c.chipEls[i]) c.chipEls[i].dataset.state = st;
      });
    });
    syncCards(force);
  }

  /** THE THROTTLED HALF: the counters and the action row. One pass per category per card, so it is the card's
   *  heaviest work and the one the rate in `COUNTER_MS` is about. A row is REDRAWN only when its membership moved
   *  — which affordability can never do — and re-fitted only when it was redrawn. */
  function syncCards(force) {
    var now = Date.now();
    if (!force && (now - lastSync) < COUNTER_MS) { stats.throttled++; return; }
    lastSync = now;
    stats.syncs++;
    var refit = [];
    Object.keys(cards).forEach(function (l) {
      var rec = cards[l];
      var cs = countersOf(l), ck = cs.map(function (g) { return g.kind; }).join(' ');
      if (ck !== rec.counterKeys) { drawCounters(rec, cs); refit.push(l); } else syncCounters(rec, cs);
      glowOnRise(rec, cs);   // (U11) numbers `countersOf` already computed, compared with the last sync's
      // (U7) the other resources and the per-category progress, on this same budget: both are one pass per card
      // over what the card already walks, and both are readouts rather than controls, so a 4 Hz read is what they
      // want. ⚠ `resourcesOf` is the one that calls GAME CODE (the layer's own display functions) — it is here,
      // once per card per sync, and not on the frame path.
      var rs = resourcesOf(l), rk = rs.map(function (r) { return r.key; }).join(' ');
      if (rk !== rec.resourceKeys) drawResources(rec, rs); else syncResources(rec, rs);
      var ps = progressOf(l).rows, pk = ps.map(function (g) { return g.kind + '/' + g.layer + '/' + g.id; }).join(' ');
      if (pk !== rec.progressKeys) drawProgress(rec, ps); else syncProgress(rec, ps);
      var as = actionsOf(rec.chips), ak = as.map(function (c) { return c.key; }).join(' ');
      if (ak !== rec.actionKeys) { drawActions(rec, as); refit.push(l); } else syncActions(rec);
      paintChips(rec);   // (U5) and the chips' own three-way colour, on the same budget as the lit/grey above
      // (U10) …and the width the buyable counts reserve, AFTER both rows have written theirs: one pass per card,
      // and it writes nothing at all unless the widest count on the card actually grew.
      if (fitChipCounts(rec)) refit.push(l);
    });
    if (refit.length) fitCards(refit);
    // an open tooltip is re-read and re-anchored HERE, so it rides the counters' own throttle rather than the frame
    syncTip();
  }

  // ---------------------------------------------------------------- (U12) THE RESET GLOW: A HOOK ON `doReset`
  // ⚖ "the circle for that layer … briefly get a glow effect after that layer resets … fade over a second. This
  // isn't a core feature, so if this idea would impose CPU costs, we can drop the idea" (user, 2026-09-20), and ⚖
  // "I want the glow only on the layer that triggered the reset, not in the Layers whose resources got wiped as a
  // side effect" (user, 2026-09-20). ⚖ "I would prefer hooking doReset. I expect that to be more reliable."
  //
  // ⛔ WHY NOT A SAMPLER ANY MORE (U11 shipped one; the user found it dead on ptr): U11 read `player[l].resetTime`,
  // which 158 of 171 engines zero in `doReset`, and on the other 13 (ptr among them) fell back to "this layer's
  // points fell to exactly zero" — which a progressed save essentially never does, because those games keep points
  // across a reset through milestones. So on the 13 NOTHING glowed in play. And on the 158 the clock is zeroed for
  // every layer the reset WIPES too, which the user has now ruled against. Both halves are gone; this is the whole
  // signal.
  //
  // THE HOOK. All 171 games declare `doReset` and `rowReset` as top-level function declarations in a classic
  // script (measured over the manifests' own script lists), so each is a writable property of `window`, and every
  // caller resolves the name at CALL time: the engines' own `v-on:click="doReset(layer)"`, `gameLoop`'s
  // auto-prestige, `startChallenge`'s `doReset(layer, true)`, this list's own reset button, and the automation's
  // `doReset(f.layer)`. Replacing the property intercepts every one of them with no per-game code.
  //  · A RESET IS A CALL THAT GOT PAST THE EARLY RETURNS. `doReset` returns early when the layer cannot afford it,
  //    and on `resetsNothing` after the gain; the one thing every engine does only once it really resets is call
  //    `rowReset(x, layer)` with the pressed layer (171 of 171 bodies, after every early return). So `rowReset` is
  //    hooked too, and all it does is mark the call in flight as PROCEEDED. A press that bought nothing glows nothing.
  //  · ONLY THE OUTERMOST CALL IS AN EVENT. A `doReset` reached from INSIDE another one (a layer's own `doReset`
  //    calling the global for another layer) is a side effect of the press, which is exactly what the ruling says
  //    must not glow — and a second wrapper around ours (see `hookResets`) is the same shape, so it cannot
  //    double-count either.
  //  · ⛔ TRANSPARENT: the original runs with the caller's own `this` and ALL its arguments (`doReset(layer, force)`
  //    — the second is load-bearing), its return value is returned, a throw of ITS propagates untouched, and every
  //    line of ours is inside a try/catch, so a failure in a decoration can never break a player's reset. Nothing is
  //    written to `player`. The gate is not `renderInert` but a with/without comparison (gates-u12 --part 1).
  //  · An EVENT, not a sample: it fires on the reset itself, and two resets are two glows (the second restarts it).
  //  · ⚖ AN AUTOMATED RESET GLOWS TOO: "If a layer is constantly glowing, then it is correctly informing the player
  //    that that layer is constantly being reset" (user, 2026-09-20). So there is no "was it the player?" test.
  //  · ⚖ AT MOST ONE RESTART PER SECOND PER LAYER: "We don't need to distinguish whether resets are happening more
  //    than once per second" (user, 2026-09-20). A reset that arrives while its layer's glow is still running does
  //    not restart it — it is remembered, and the glow is lit again on that animation's own `animationend`. So a
  //    layer resetting every tick glows CONTINUOUSLY (never a dark gap before the next event re-lights it, which is
  //    what dropping the event would give) for ONE restart a second instead of one per tick; and a layer resetting
  //    once every ten seconds glows every time. The end is an EVENT, not a timer: this file still registers none.
  //    ⚖ "I want to avoid flicker if possible" (user) — which is why an owed reset is PAID at the end rather than
  //    dropped. The owed flag lives in this closure keyed by LAYER (`glowOwed`), not on the record or the element:
  //    a card rebuilt inside its glow carries the glow over (`carryGlow`) and it is THAT element's `animationend`
  //    that pays it. Under reduced motion no flag is ever set (`reducedMotion`), so none can be left unpaid.
  var HOOK_MARK = 'tmtLoaderLayerListHook';
  var inReset = null;   // the OUTERMOST doReset call in flight: { layer, proceeded }
  var glowAt = Object.create(null);   // layer → performance.now() of its last glow, so a card REBUILT inside the
  // second (a reset moves membership, so it often is) picks the same glow up where it was rather than losing it
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function wrapDoReset(orig) {
    var w = function doReset(layer) {
      var outer = false;
      try { if (inReset === null) { inReset = { layer: String(layer), proceeded: false }; outer = true; } } catch (e) { /* ours only */ }
      if (!outer) return orig.apply(this, arguments);
      var done = false, r;
      try { r = orig.apply(this, arguments); done = true; } finally {
        var call = inReset;
        inReset = null;
        if (done) { try { if (call && call.proceeded) onReset(call.layer); } catch (e) { /* a decoration never breaks a reset */ } }
      }
      return r;
    };
    w[HOOK_MARK] = orig;
    return w;
  }
  function wrapRowReset(orig) {
    var w = function rowReset(row, layer) {
      try { if (inReset !== null && String(layer) === inReset.layer) inReset.proceeded = true; } catch (e) { /* ours only */ }
      return orig.apply(this, arguments);
    };
    w[HOOK_MARK] = orig;
    return w;
  }
  /** HOOK ONCE, and again if the global was replaced. A function carrying our mark is ours and is left alone; any
   *  other function in the slot (an engine that rebuilt its globals, or a foreign wrapper put round ours) is wrapped
   *  — and the outermost-call rule above is what makes a wrapper round a wrapper count one reset once. */
  function hookResets() {
    try {
      if (typeof window.doReset === 'function' && !window.doReset[HOOK_MARK]) { window.doReset = wrapDoReset(window.doReset); stats.hooks++; }
      if (typeof window.rowReset === 'function' && !window.rowReset[HOOK_MARK]) { window.rowReset = wrapRowReset(window.rowReset); stats.hooks++; }
    } catch (e) { /* no hook, no glow: the list itself is unaffected */ }
  }
  function hooked() {
    return { doReset: !!(typeof window.doReset === 'function' && window.doReset[HOOK_MARK]),
      rowReset: !!(typeof window.rowReset === 'function' && window.rowReset[HOOK_MARK]) };
  }
  var resetLog = [];   // the last few events, for the gate: which layer, and whether a card showed it
  var glowOwed = Object.create(null);   // layer → true: a reset arrived inside its running glow
  var GLOW_MS = 1000;                   // the animation's own length (layerlist.css) — and so the restart limit
  // ⚖ "I also want the reduced motion setting to disable this glow" (user, 2026-09-20). OFF STRUCTURALLY, not just
  // unpainted: under the preference NOTHING happens — no class flip, no `--tmt-glow` write, no owed flag, no
  // `glows` count. Read at the EVENT, never cached, because a viewer can change it with the page open. The CSS rule
  // (`animation: none`, layerlist.css) stays as well, for a build where this guard is ever missed.
  function reducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function onReset(l) {
    stats.resets++;
    var rec = open ? cards[l] : null, how = 'closed';
    if (rec && rec.glowEl && reducedMotion()) { delete glowOwed[l]; how = 'reduced'; }
    else if (rec && rec.glowEl) {
      var t = glowAt[l];
      if (t !== undefined && now() - t < GLOW_MS) { glowOwed[l] = true; stats.glowsOwed++; how = 'owed'; }
      else { delete glowOwed[l]; glowAt[l] = now(); glow(rec); how = 'lit'; }
    }
    resetLog.push({ layer: l, how: how });
    if (resetLog.length > 32) resetLog.shift();
  }
  function onGlowEnd(ev) {
    try {
      if (!/^tmt-layerlist-glow-[ab]$/.test(String(ev.animationName))) return;
      var btn = ev.target && ev.target.closest ? ev.target.closest('.tmt-layerlist-open') : null;
      var host = btn && btn.closest('[data-layer]');
      var l = host ? host.dataset.layer : null;
      if (!l || !glowOwed[l]) return;
      delete glowOwed[l];
      if (reducedMotion()) return;   // the preference was switched on while it was glowing
      var rec = open ? cards[l] : null;
      if (rec && rec.glowEl === btn) { glowAt[l] = now(); glow(rec); stats.glowsRelit++; }
    } catch (e) { /* a decoration */ }
  }
  /** A card built while its layer's glow is still running takes the glow up at the point it had reached, through a
   *  negative `animation-delay` (layerlist.css), so a rebuild cannot cut the second short. */
  function carryGlow(rec) {
    var t = glowAt[rec.layer];
    if (t === undefined || !rec.glowEl || reducedMotion()) return;
    var el = now() - t;
    if (!(el >= 0 && el < GLOW_MS)) return;
    rec.glowEl.style.setProperty('--tmt-glow-delay', (-Math.round(el)) + 'ms');
    glowEl(rec.glowEl, rec.layer);
    stats.glowCarries++;
  }
  function glow(rec) { if (rec.glowEl) { rec.glowEl.style.removeProperty('--tmt-glow-delay'); glowEl(rec.glowEl, rec.layer); stats.glows++; } }
  function glowEl(b, l) {
    var col = safe(function () { return str(tmp[l].color); }, '');
    if (col) b.style.setProperty('--tmt-glow', col);
    var next = b.classList.contains('tmt-layerlist-glow-a') ? 'b' : 'a';
    b.classList.remove('tmt-layerlist-glow-a', 'tmt-layerlist-glow-b');
    b.classList.add('tmt-layerlist-glow-' + next);
  }

  // …AND THE SUMMARY CHIPS. ⚖ "if it's cheap, then we could also apply the glow effect for one second to the x / y
  // summary chips after a purchase in that category is made" (user, 2026-09-20) — built only after the layer half
  // was measured at noise level (docs/mobile.md). The event is THE COUNTER'S NUMBER ROSE since the last sync: `x`
  // for an earned-over-drawn counter, the total for an owned one — numbers `countersOf` has just computed, so this
  // is a comparison and nothing else. A purchase is exactly that for upgrades and buyables; for milestones,
  // achievements and challenges the same rule lights an EARNING, the analogue in a category you do not buy (an
  // inference, recorded as one). A number that FALLS (a reset) lights nothing here — that is the circle's event.
  // Keyed by CATEGORY, so a redraw of the row (its membership moved) keeps the baseline; a card REBUILD does not.
  function glowOnRise(rec, cs) {
    var was = rec.counterMark, now = Object.create(null), n = 0;
    cs.forEach(function (g, i) {
      var v = g.mode === 'ratio' ? g.x : g.total;
      now[g.kind] = v;
      if (!was || was[g.kind] === undefined || was[g.kind] === null || v === null) return;
      if (!rose(was[g.kind], v)) return;
      var e = rec.counterEls[i];
      if (e && e.kind === g.kind) { glowEl(e.box, rec.layer); n++; }
    });
    rec.counterMark = now;
    stats.counterGlows += n;
    return n;
  }
  function rose(a, b) {
    return safe(function () { return typeof b === 'number' ? b > Number(a) : (b && typeof b.gt === 'function' ? !!b.gt(a) : false); }, false);
  }

  // ---------------------------------------------------------------- acting
  // Every action is the ENGINE's own function on the engine's own terms — the same call its own button makes, no
  // more. A throw costs the press, not the list.
  //
  // ⚠ It does NOT call `updateTemp()` afterwards, tempting though that is on a paused page: `updateTemp` is the
  // engine's own tick work, and in some games it WRITES `player` — MEASURED on the-periodic-table-tree, where one
  // call moves `player.He.Inflate` 3 → 4 and `player.He.BalDiv` 2 → 3 (which is also why that game never repeats
  // its own hash). A UI does not drive the engine's tick. In play the loop recomputes tmp 20×/s, so the readouts
  // are at most one tick stale; under `?managed=1` they hold still, which is what a paused page is for.
  function act(fn) {
    try { fn(); } catch (e) { if (window.console) console.warn('tmt-loader: layer list action failed', e); }
    refresh();
  }

  // ---------------------------------------------------------------- U5: BACK RETURNS TO THE VIEW YOU CAME FROM
  // ⚖ "open a layer from the Layers list and Back should return you to the LIST, not the tree" (user, 2026-09-19).
  //
  // ⛔ THE LIST STILL WRITES NOTHING TO `player`, and this memory is not in storage either: it is ONE VARIABLE in
  // this closure. SESSION-ONLY BY DECISION (docs/mobile.md): a remembered view that outlived a reload would open the
  // overlay over a layer tab nobody remembers choosing, and the engines already keep their OWN per-layer `prevTab`
  // in the save — a second, longer-lived memory of ours beside it is the one that would disagree with it.
  //
  // ⚠ IT IS NOT AN INTERCEPT, and that is measured rather than tidy-mindedness. `goBack` is NOT "hardcoded to the
  // tree": over the 171 games (2026-09-19) 154 wire their back control to
  // `goBack(player.navTab == 'none' ? player.tab : player.navTab)`, whose 2.7 body reads a per-layer
  // `player[layer].prevTab` this file knows nothing about; 8 call a two-branch `goBack()`
  // (`player.navTab !== 'none' ? showTab('none') : showTab(player.lastSafeTab)`, PTR's shape); and 9 go straight to
  // `showTab('tree'|'none')`. Swallowing the click would replace every one of those answers with ours. So the
  // engine's own handler runs untouched and the LIST is opened over whatever it navigated to — which is what the
  // overlay is: a view over a tab, never a tab of its own.
  //
  // ⚠ THE CONTROL IS FOUND BY CLASS, and the two names cover the roster: every game's back button is
  // `class="back"` or `class="other-back"` (measured over all 171 `index.html` plus each engine's `layer-tab`
  // component, which writes `back == 'big' ? 'other-back' : 'back'`). Three games also put `class="back"` on the
  // HELP tab's own back — it cannot match here, because that tab is not the layer the list opened.
  var cameFrom = null;   // the layer tab THIS LIST opened, for as long as it is still the tab on screen
  function currentTab() { return safe(function () { return str(player.tab); }, ''); }
  function backControlOf(node) {
    for (var el = node; el && el !== document; el = el.parentElement) {
      if (el.classList && (el.classList.contains('back') || el.classList.contains('other-back'))) return el;
    }
    return null;
  }
  // ⚠ CAPTURE, because the condition is about the tab that is on screen NOW and the engine's own handler is about
  // to change it. The list is opened on the next FRAME instead, which is after the whole dispatch — a microtask
  // would run between the capture listener and the target's own one, i.e. before the engine had navigated. A frame,
  // not a timeout: this file registers no timer (see `start`).
  // ⚠ NOTHING HERE CALLS `preventDefault` OR `stopPropagation` (U1's rule, and U2e's measurement that a
  // `stopPropagation` in a capture handler is exactly what swallows a control's own click).
  function onDocClick(ev) {
    if (cameFrom === null) return;
    if (backControlOf(ev.target) && currentTab() === cameFrom) {
      cameFrom = null;
      requestAnimationFrame(function () { show(); });
      return;
    }
    // ⚠ THE MEMORY IS ONLY ABOUT THE TAB ON SCREEN, and this is the half that fails if it is set unconditionally:
    // a layer opened from the list, left by the nav bar, and reached again FROM THE TREE must come back to the tree.
    // Any click that moved the tab drops it.
    requestAnimationFrame(function () { if (cameFrom !== null && currentTab() !== cameFrom) cameFrom = null; });
  }

  // ⚖ (U6) PRESSING AN INACCESSIBLE LAYER DOES NOTHING AT ALL (user, 2026-09-19).
  // ⚠ Nothing was broken in the ENGINE: every `showTab` begins `if (LAYERS.includes(name) && !layerunlocked(name))
  // return` — a silent no-op. The list hid itself FIRST and asked afterwards, so the overlay closed, the tab did
  // not change, and the player was left looking at whatever tab happened to be open. MEASURED on `ptr` at M05,
  // pressing `t`: `open` true → false, `player.tab` 'none' → 'none', `cameFrom` null → 't'.
  // ⚠ THE ENGINE'S OWN PREDICATE decides, where it has one. The card's greyed class reads `player[l].unlocked`
  // (`refreshInner`), which is NOT the same question: ptr's `layerunlocked` also lets a layer you can reset into
  // through. The one that decides whether the tab opens is the engine's, so that is the one asked; a game without
  // it falls back to the card's own reading.
  function reachable(l) {
    var v = safe(function () { return typeof layerunlocked === 'function' ? !!layerunlocked(l) : null; }, null);
    if (v !== null) return v;
    return safe(function () { return !!(player[l] && player[l].unlocked); }, false);
  }
  function openTab(l) {
    // ⚠ BEFORE `hide()`, and with no `cameFrom` write either: U5's remembered view must not record a tab that
    // never opened — a memory set here would send the next back press to the list from a tab the list never opened.
    if (!reachable(l)) return false;
    hide();
    cameFrom = l;   // (U5) we are the view this tab was opened from
    try { showTab(l); } catch (e) { /* a game without showTab keeps the card inert rather than throwing */ }
    return true;
  }

  // A chip in the `open` (or `active`) state ACTS; one that is `done`, or one whose category has no action at all
  // (a milestone is passive), OPENS THE TAB instead. An action the engine will not take today (an upgrade you
  // cannot afford) is a no-op here exactly as it is on the game's own button — this file adds no affordability
  // rule of its own. It acts on the CHIP's layer, which a `layer-proxy` chip makes different from the card's.
  function chipPressed(c) {
    if (c.act === null || c.state === 'done') return openTab(c.layer);
    act(function () {
      // a `pseudo` chip stands for the engine's SECOND button — the teaser that unlocks the upgrade rather than
      // buying it — so it makes that button's call, not the buy
      if (c.state === 'pseudo') { if (typeof unlockUpg === 'function') unlockUpg(c.layer, c.id); return; }
      // ⚠ THE ENGINE'S OWN NAME, WHICHEVER IT HAS. `buyUpgrade` is an ALIAS the TMT engines grew later: 169 of the
      // 171 games define it, ALL 171 define `buyUpg`, and TWO — `the-modding-tree` (2.0.5.1) and `the-burning-tree` —
      // define ONLY `buyUpg`, so a chip on those two called a function that does not exist and bought nothing.
      // MEASURED by U2d's counter-press leg, which is the first thing ever to drive a chip: the U2 gate pressed the
      // RESET button and nothing else, so a press that silently did nothing was green for two slices.
      if (c.act === 'upgrade') (typeof buyUpgrade === 'function' ? buyUpgrade : buyUpg)(c.layer, c.id);
      else if (c.act === 'buyable') buyBuyable(c.layer, c.id);
      else if (c.act === 'challenge') startChallenge(c.layer, c.id);
    });
  }

  function show() {
    build();
    wantCurrency();
    // (U5) the game's palette is read HERE and cached until the list opens again: a theme is changed on the game's
    // own Options tab, and reaching that tab closes this overlay, so there is no path by which it can go stale.
    skinCache = null;
    open = true;
    panel.hidden = false;
    rebuild();
    refresh();
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh();
  }
  /** (U13) THE FIRST OPEN ASKS FOR THE CURRENCY DATA — and nothing before it does (⚖ user, 2026-09-20: lazily, on
   *  the Layers view's first open). The list renders at once with every buyable abstaining (`? / ?`, which is
   *  correct for a question not yet answered); the answer's arrival costs ONE refresh, and none at all if the
   *  list was closed by then (the next `show()` refreshes anyway). On an automation page the host already holds
   *  the data and the promise is resolved, so the same line is one refresh and no request. */
  var currencyWanted = false;
  function wantCurrency() {
    if (currencyWanted || typeof T.fetchCurrencyData !== 'function') return;
    currencyWanted = true;
    Promise.resolve(T.fetchCurrencyData()).then(function () {
      stats.currencyArrivals++;
      if (open) refresh();
    }, function () { /* the host already turned a failure into `null`: the rows keep abstaining */ });
  }
  function hide() {
    if (!panel) return;
    hideTip();          // the overlay belongs to the list: a closed list has no tooltip open behind it
    open = false;
    panel.hidden = true;
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh();
  }

  function start() {
    build();
    // (U12) the reset glow's hook, installed once the engine's globals exist — on every page that loads the list,
    // open or not, so the wrapper's transparency is a property of the PAGE and not of the panel being open.
    hookResets();
    // Driven by the game's own re-renders, like the nav bar: no timer of ours, coalesced to one refresh per
    // animation frame, and only while the panel is open.
    var queued = false;
    var obs = new MutationObserver(function () {
      if (!open || queued) return;
      queued = true;
      // ⚠ `false`: this is the path the throttle is for. A game re-renders continuously, so without it the
      // counters would recompute once per animation frame for every card on the page.
      requestAnimationFrame(function () { queued = false; refresh(false); });
    });
    var app = document.getElementById('app');
    if (app) obs.observe(app, { childList: true, subtree: true, characterData: true });
    // (U5) Back returns to the view you came from. On the DOCUMENT, because the control belongs to the game and is
    // re-rendered with every tab; in the capture phase, because the condition is about the tab it is leaving.
    document.addEventListener('click', onDocClick, true);
    // ⚖ THE FIT MUST SURVIVE A RESIZE (user, 2026-09-18). A resize moves no game DOM, so the observer above never
    // sees it; the row is simply re-measured. Still no timer of ours, and still nothing written to `player`.
    var rq = false;
    window.addEventListener('resize', function () {
      if (!open || rq) return;
      rq = true;
      requestAnimationFrame(function () { rq = false; fitCards(null); });
    });
    T.layerListUI = {
      panel: panel,
      open: show, close: hide,
      toggle: function () { open ? hide() : show(); },
      isOpen: function () { return open; },
      refresh: refresh,
      groups: groups,
      chipsOf: chipsOf,
      visibleSeq: visibleSeq,
      countersOf: countersOf,
      actionsOf: function (l) { return actionsOf(chipsOf(l)); },
      // (U7) the reset button's two lines, apart — the split the card renders, not a second reading of it
      resetLines: function (l) { return resetLines(resetText(l)); },
      // (U7) the layer's OTHER resources, and the text they were detected in. The text is what a caller lifts a
      // prose label out of; the list itself ships the KEY as the label (see `resourcesOf`).
      resources: function (l) { return resourcesOf(l).map(function (r) { return { layer: r.layer, key: r.key, label: r.label, text: r.text, collide: r.collide, sticky: r.sticky, claimed: r.claimed, global: !!r.global }; }); },
      /** (U8) The keys this game has already shown unambiguously, per layer — the remembered set itself, read out
       *  of the loader's own namespace. */
      resourceMemory: function () { var all = seenRead(), o = {}; for (var l in all) o[l] = Object.keys(all[l]); return o; },
      /** (U8) FORGET IT — the cache and the stored key together, which is the pre-U8 behaviour back for this game.
       *  ⚠ BOTH HALVES OR NEITHER: clearing only the stored key would leave the in-memory map standing and the
       *  rows would not move, which is also why the gate's own leg cannot do this from outside.
       *  ⚠ AND IT DOES NOT RE-RENDER. The next render fills the set again from whatever the layers' text states
       *  then — which is the one moment the WRITE itself can be watched, and the gate's leg P watches exactly it.
       *  A `refresh()` in here would have re-armed the set before any caller could look at it. */
      forgetResources: function () { seenRes = Object.create(null); seenWrite(); return true; },
      resourceText: displayTextOf,
      // (U7) the per-category progress rows, with the rule that chose each one
      progress: progressOf,
      fit: function () { fitCards(null); },
      // (U2c) which cards are OPEN, and the button's own path for opening one. The gate drives the list through
      // this rather than through the chevron, because a click is not a neutral probe — some games count every
      // click on the document (docs/mobile.md, "Two engine facts").
      expanded: function () { return Object.keys(cards).filter(function (l) { return cards[l].el.classList.contains('tmt-layerlist-expanded'); }); },
      expand: function (l, on) { return setExpanded(l, on === undefined ? true : on); },
      prefKey: prefKey,
      // (U5) the view a layer tab was opened FROM, for as long as it is the tab on screen — `null` for one opened
      // from the tree, which is the half of the ruling a memory set unconditionally would break. Read-only.
      cameFrom: function () { return cameFrom; },
      // (U5) what the game paints this chip, and the engine's own word for the state — the list's own answer, which
      // the gate compares against an expectation it rebuilds from `tmp` / `player` itself.
      chipSkin: function (l) { return chipsOf(l).map(function (c) { var s = chipSkin(c); return { key: c.key, kind: c.kind, id: c.id, layer: c.layer, state: c.state, skin: s.key, bg: s.bg }; }); },
      // (U6) the same for the COUNTERS, whose three-way reading is the user's rule rather than the component's:
      // `available` is "is there anything to do in this category right now", which is what earns the layer colour.
      counterSkin: function (l) { return countersOf(l).map(function (g) { var s = counterSkin(l, g); return { kind: g.kind, mode: g.mode, x: g.x, y: g.y, text: g.text, available: g.available, skin: s.key, bg: s.bg }; }); },
      // (U2e) THE TOOLTIP. The gate drives it through this rather than through a click wherever it is not the tap
      // itself that is under test, for the same reason `expand` exists: a click is not a neutral probe.
      tip: {
        show: function (el) { return showTip(el); },
        hide: hideTip,
        isOpen: function () { return !!(tipEl && !tipEl.hidden); },
        el: function () { return tipEl; },
        // the two lines, apart: the first IS the element's `title`, the second is what this slice added
        title: function () { return tipEl && !tipEl.hidden ? str(tipTitleEl.textContent) : null; },
        body: function () { return tipEl && !tipEl.hidden ? str(tipBodyEl.textContent) : null; },
        text: function () { return tipEl && !tipEl.hidden ? [str(tipTitleEl.textContent), str(tipBodyEl.textContent)].filter(Boolean).join('\n') : null; },
        key: function () { return tipKey ? { card: tipKey.card, role: tipKey.role, kind: tipKey.kind, id: tipKey.id, layer: tipKey.layer } : null; },
        rich: function () { return !!(tipEl && !tipEl.hidden && tipRich); },
        hoverable: hoverable
      },
      stats: function () { return { refreshes: stats.refreshes, syncs: stats.syncs, throttled: stats.throttled, rebuilds: stats.rebuilds, fits: stats.fits, throttleMs: COUNTER_MS, tips: stats.tips, tipsRich: stats.tipsRich, tipSyncs: stats.tipSyncs, glows: stats.glows, counterGlows: stats.counterGlows, resets: stats.resets, hooks: stats.hooks, glowCarries: stats.glowCarries, glowsOwed: stats.glowsOwed, glowsRelit: stats.glowsRelit, currencyArrivals: stats.currencyArrivals }; },
      // (U12) whether `doReset` / `rowReset` are the list's wrappers right now, and the last reset events it saw
      resetHook: hooked,
      glowOwed: function () { return Object.keys(glowOwed); },
      resetLog: function () { return resetLog.map(function (e) { return { layer: e.layer, how: e.how }; }); },
      cards: function () { return Object.keys(cards); }
    };
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh(); // the Layers button appears once this object exists
  }

  // layerlist.js is inserted BEFORE the game's onload, so the engine's own markup does not exist yet.
  if (T.ready) start();
  else window.addEventListener('tmt-loader:ready', start, { once: true });
})();
