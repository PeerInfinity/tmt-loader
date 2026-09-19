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
    var unlocked = safe(function () { var u = t.unlocked; return u === undefined ? true : !!u; }, true);
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
      if (!by[e.kind]) { by[e.kind] = { kind: e.kind, label: C.label, name: C.name, mode: C.mode, x: 0, y: 0, total: null, any: false }; order.push(e.kind); }
      var g = by[e.kind];
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
   *     affordability. ⚠ Only TMT 2.7 declares that field (it defaults it to `Decimal(Infinity)` in
   *     `layerSupport.js:127`); 2.2.1 has no such concept, so there the test is vacuous and a buyable always
   *     qualifies — which is exactly what that engine's own button does.
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

  // ---------------------------------------------------------------- the DOM
  var panel = null, body = null, open = false, sig = null, cards = Object.create(null);
  // the throttle's clock, and what the gate reads to tell a throttled build from an unthrottled one
  var lastSync = 0, stats = { refreshes: 0, syncs: 0, throttled: 0, rebuilds: 0, fits: 0 };

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

    // the prestige button, on the engine's own condition for having one at all
    var reset = null;
    if (safe(function () { return tmp[l].type; }, null) !== 'none') {
      reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'tmt-layerlist-reset';
      reset.addEventListener('click', function () { act(function () { doReset(l); }); });
      el.appendChild(reset);
    }

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
        b.textContent = c.chip;
        b.title = c.title;
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
      setMore(more, false);
      more.addEventListener('click', function () { setMore(more, el.classList.toggle('tmt-layerlist-expanded')); });
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
    var rec = { el: el, head: head, name: name, amount: amount, reset: reset, chips: chips, more: more,
      chipEls: chipBox ? [].slice.call(chipBox.querySelectorAll('.tmt-layerlist-chip')) : [],
      counterBox: counterBox, counterKeys: '', counterEls: [], reserved: Object.create(null),
      actionBox: actionBox, actionKeys: '', actionEls: [] };
    cards[l] = rec;
    drawCounters(rec, counters);
    drawActions(rec, actions);
    return el;
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
      return { kind: g.kind, box: box, val: val };
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
    });
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
      b.textContent = c.chip;
      b.title = c.title;
      b.addEventListener('click', function () { chipPressed(c); });
      rec.actionBox.appendChild(b);
      return { chip: c, el: b };
    });
    rec.actionKeys = actions.map(function (c) { return c.key; }).join(' ');
    syncActions(rec);
  }
  function syncActions(rec) {
    rec.actionEls.forEach(function (a) { a.el.dataset.afford = affordable(a.chip) ? 'yes' : 'no'; });
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
        // the engines' prestige strings carry `<br><br>` to break a tall tab button in two; on a card the line is
        // one run of text, and dropping the break in CSS would jam the two halves together ("space energyReq:")
        c.reset.innerHTML = resetText(l).replace(/<br\s*\/?>/gi, ' ');
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
      var as = actionsOf(rec.chips), ak = as.map(function (c) { return c.key; }).join(' ');
      if (ak !== rec.actionKeys) { drawActions(rec, as); refit.push(l); } else syncActions(rec);
    });
    if (refit.length) fitCards(refit);
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

  function openTab(l) {
    hide();
    try { showTab(l); } catch (e) { /* a game without showTab keeps the card inert rather than throwing */ }
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
      if (c.act === 'upgrade') buyUpgrade(c.layer, c.id);
      else if (c.act === 'buyable') buyBuyable(c.layer, c.id);
      else if (c.act === 'challenge') startChallenge(c.layer, c.id);
    });
  }

  function show() {
    build();
    open = true;
    panel.hidden = false;
    rebuild();
    refresh();
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh();
  }
  function hide() {
    if (!panel) return;
    open = false;
    panel.hidden = true;
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh();
  }

  function start() {
    build();
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
      fit: function () { fitCards(null); },
      stats: function () { return { refreshes: stats.refreshes, syncs: stats.syncs, throttled: stats.throttled, rebuilds: stats.rebuilds, fits: stats.fits, throttleMs: COUNTER_MS }; },
      cards: function () { return Object.keys(cards); }
    };
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh(); // the Layers button appears once this object exists
  }

  // layerlist.js is inserted BEFORE the game's onload, so the engine's own markup does not exist yet.
  if (T.ready) start();
  else window.addEventListener('tmt-loader:ready', start, { once: true });
})();
