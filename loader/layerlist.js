// tmt-loader — the LAYER LIST (docs/mobile.md). A CLASSIC script, inserted after loader/navbar.js and only when
// `?navbar=1` (which `?mobile=1` implies), so it runs in the global lexical scope and can read the engine's `player`
// / `tmp` / `LAYERS` and call `showTab` / `doReset` / `buyUpgrade` / `buyBuyable` / `startChallenge` as bare
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
  var CHIP_CAP = 6;      // chips a card shows before the "+N" button; see docs/mobile.md for why 6
  var CHIP_TOKENS = 3;   // "about three tokens" — the measured chip rule

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

  // Sources, in order. Milestones are deliberately absent: their text is a REQUIREMENT string
  // (`requirementDescription`, "2 Time Capsules"), they are passive, and they inflate the chip count.
  // `display()` is prose, not a short name — PTR's `ab` clickables all render the bare text "1", which is why
  // clickables are not a source either.
  var SOURCES = [
    { kind: 'upgrades', field: 'title', act: 'upgrade' },
    { kind: 'buyables', field: 'title', act: 'buyable' },
    { kind: 'challenges', field: 'name', act: 'challenge' }
  ];

  /** One chip per component of a layer that HAS a usable short name — a component with none gets no chip rather
   * than a meaningless one. State is read from `player` alone (no game code runs here). */
  function chipsOf(l) {
    var items = [];
    SOURCES.forEach(function (src) {
      var decl = safe(function () { return layers[l][src.kind]; }, null);
      if (!decl || typeof decl !== 'object') return;
      for (var id in decl) {
        if (isNaN(id)) continue; // the census's numeric-id rule: `rows`, `respec` and friends are not components
        var obj = safe(function () { return decl[id]; }, null);
        if (!obj) continue;
        var title = textOf(obj, safe(function () { return tmp[l][src.kind][id]; }, null), src.field);
        var tokens = chipTokens(title);
        if (!tokens.length) continue; // no usable title → no chip
        // ⚠ the id is a NUMBER, not the object key's string. The engines push whatever `buyUpgrade` is handed
        // straight into `player[l].upgrades`, and `hasUpgrade` tests it with `.includes(11)` — a `"11"` in the
        // save is an upgrade that is bought, paid for, and does nothing. MEASURED on ptr: the chip wrote
        // `["11"]` where the game's own button writes `[11]`.
        items.push({ layer: l, kind: src.kind, act: src.act, id: Number(id), title: stripTags(title).trim(), tokens: tokens, state: chipState(l, src, id) });
      }
    });
    nameChips(items);
    // ORDER: what you can act on, then what is done, then what is locked — by state, never by affordability, which
    // moves every tick and would make the chips hop about. Ties keep the source order above, then the numeric id.
    var rank = { open: 0, active: 0, done: 1, locked: 2 };
    return items.map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) { return (rank[a.it.state] - rank[b.it.state]) || (a.i - b.i); })
      .map(function (x) { return x.it; });
  }

  function chipState(l, src, id) {
    var unlocked = safe(function () { var u = tmp[l][src.kind][id].unlocked; return u === undefined ? true : !!u; }, true);
    if (!unlocked) return 'locked';
    if (src.kind === 'upgrades') {
      var owned = safe(function () { var a = player[l].upgrades || []; return a.indexOf(Number(id)) >= 0 || a.indexOf(String(id)) >= 0; }, false);
      return owned ? 'done' : 'open';
    }
    if (src.kind === 'challenges') {
      if (safe(function () { return String(player[l].activeChallenge) === String(id); }, false)) return 'active';
      var done = safe(function () { var c = player[l].challenges || {}; return Number(c[id]) > 0; }, false);
      return done ? 'done' : 'open';
    }
    return 'open';
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
    el.appendChild(openBtn);

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
    var chipBox = null, more = null;
    if (chips.length) {
      chipBox = document.createElement('div');
      chipBox.className = 'tmt-layerlist-chips';
      chips.forEach(function (c, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tmt-layerlist-chip';
        b.dataset.state = c.state;
        b.dataset.kind = c.kind;
        b.dataset.cid = c.id;
        b.textContent = c.chip;
        b.title = c.title;
        if (i >= CHIP_CAP) b.classList.add('tmt-layerlist-overflow');
        b.addEventListener('click', function () { chipPressed(l, c); });
        chipBox.appendChild(b);
      });
      if (chips.length > CHIP_CAP) {
        more = document.createElement('button');
        more.type = 'button';
        more.className = 'tmt-layerlist-more';
        more.textContent = '+' + (chips.length - CHIP_CAP);
        more.addEventListener('click', function () {
          var all = el.classList.toggle('tmt-layerlist-expanded');
          more.textContent = all ? '−' : '+' + (chips.length - CHIP_CAP);
        });
        chipBox.appendChild(more);
      }
      el.appendChild(chipBox);
    }
    cards[l] = { el: el, name: name, amount: amount, reset: reset, chips: chips, chipEls: chipBox ? [].slice.call(chipBox.querySelectorAll('.tmt-layerlist-chip')) : [] };
    return el;
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
  }

  function signature(gs) {
    return gs.map(function (g) { return g.key + ':' + g.layers.join(','); }).join('|');
  }

  /** The live values: the amount, the prestige text, and each control's state. Never rebuilds — the chips keep the
   * order they were given, so nothing moves under a finger. */
  function refresh() {
    if (!panel || !open) return;
    return withoutRaisingNaN(refreshInner);
  }
  function refreshInner() {
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
        var st = chipState(l, { kind: chip.kind }, chip.id);
        chip.state = st;
        if (c.chipEls[i]) c.chipEls[i].dataset.state = st;
      });
    });
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

  // A chip in the `open` (or `active`) state ACTS; one that is done or locked OPENS THE TAB instead. An action the
  // engine will not take today (an upgrade you cannot afford) is a no-op here exactly as it is on the game's own
  // button — this file adds no affordability rule of its own.
  function chipPressed(l, c) {
    if (c.state === 'done' || c.state === 'locked') return openTab(l);
    act(function () {
      if (c.act === 'upgrade') buyUpgrade(l, c.id);
      else if (c.act === 'buyable') buyBuyable(l, c.id);
      else if (c.act === 'challenge') startChallenge(l, c.id);
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
      requestAnimationFrame(function () { queued = false; refresh(); });
    });
    var app = document.getElementById('app');
    if (app) obs.observe(app, { childList: true, subtree: true, characterData: true });
    T.layerListUI = {
      panel: panel,
      open: show, close: hide,
      toggle: function () { open ? hide() : show(); },
      isOpen: function () { return open; },
      refresh: refresh,
      groups: groups,
      chipsOf: chipsOf,
      cards: function () { return Object.keys(cards); }
    };
    if (T.navbarUI && T.navbarUI.refresh) T.navbarUI.refresh(); // the Layers button appears once this object exists
  }

  // layerlist.js is inserted BEFORE the game's onload, so the engine's own markup does not exist yet.
  if (T.ready) start();
  else window.addEventListener('tmt-loader:ready', start, { once: true });
})();
