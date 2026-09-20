// tmt-loader — the bottom nav bar (docs/mobile.md). A CLASSIC script, inserted after loader/tmt-auto.js and only
// when `?navbar=1` (which `?mobile=1` implies), so it runs in the global lexical scope and can read the engine's
// `player` / `showTab` as bare identifiers (they may be global `let`s / function declarations, not window
// properties — see docs/contract.md).
//
// The BAR is its own opt-in, wanted on a desktop as much as on a phone. The tap-to-open tooltips at the bottom of
// this file are not: they belong to the mobile LAYOUT and stay guarded on `T.mobile`, as does the automation tab's
// grid flatten (it fixes a wrap that only happens in the narrow single column). It is PURE UI: it never writes
// `player`, never registers a timer, and never calls the game's loop. loader/mobile.css stands on its own if this
// file is removed, and this file stands on its own without loader/mobile.css.
//
// ENGINE-GENERIC BY CONSTRUCTION. The nav bar does not know any tab id: the ids differ between engines (2.2.1 uses
// 'info'/'options'/'help'; 2.7 uses 'info-tab'/'options-tab'). Instead each button FORWARDS a click to the game's
// own corner control (#optionWheel, #info, #help), whose onclick already names the right tab for that engine. The
// same indirection gives the active state for free: those controls carry `v-if="player.tab != '<their tab>'"`, so a
// control that has been seen and is now absent means its tab is the open one.
(function () {
  'use strict';
  var T = window.tmtLoader;
  if (!T || !T.navbar) return; // unreachable without the flag: page.js only inserts this file when it is on

  var NAV_ID = 'tmt-navbar';
  var TIP_CLASS = 'tmt-mobile-tip'; // the tooltips are the LAYOUT's, not the bar's — the name says which tier owns them

  // key: our name · label: what the button says · target: the game control it forwards to (null = handled directly)
  // `layers` is FIRST, so the Layers button sits immediately left of Tree; it stays hidden until
  // loader/layerlist.js has installed `tmtLoader.layerListUI`, so this file is still a whole bar without it.
  var ENTRIES = [
    { key: 'layers', label: 'Layers', glyph: '☰', target: null },
    { key: 'tree', label: 'Tree', glyph: '☷', target: null },
    { key: 'info', label: 'Info', glyph: 'i', target: '#info' },
    { key: 'help', label: 'Help', glyph: '?', target: '#help' },
    { key: 'options', label: 'Options', glyph: '⚙', target: '#optionWheel' }
  ];

  var seen = Object.create(null); // key -> the target has existed at some point this session
  var buttons = Object.create(null);
  var nav = null;

  function onTree() {
    // 'none' is the tree in every engine the loader hosts (2.2.1 `.back` uses it; 2.7 `showTab` reads
    // `var toTreeTab = name == "none"`). Read as a bare identifier: showTab is a function declaration.
    try { showTab('none'); } catch (e) { /* a game without showTab keeps the button inert rather than throwing */ }
  }

  function build() {
    if (nav) return;
    nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.setAttribute('role', 'navigation');
    ENTRIES.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tmt-navbar-btn';
      b.dataset.key = e.key;
      b.hidden = true; // shown by refresh() once its target has been seen
      var g = document.createElement('span');
      g.className = 'tmt-navbar-glyph';
      g.textContent = e.glyph;
      var l = document.createElement('span');
      l.className = 'tmt-navbar-label';
      l.textContent = e.label;
      b.append(g, l);
      b.addEventListener('click', function () {
        if (e.key === 'layers') return T.layerListUI ? T.layerListUI.toggle() : undefined;
        if (T.layerListUI) T.layerListUI.close(); // the list is an overlay over the tab this button is about to open
        if (e.target === null) return onTree();
        var el = document.querySelector(e.target);
        if (el) el.click(); // the game's own handler, with the tab id that engine uses
      });
      nav.appendChild(b);
      buttons[e.key] = b;
    });
    document.body.appendChild(nav);
    buttons.tree.hidden = false; // the tree is always reachable
  }

  function refresh() {
    if (!nav) return;
    var openKey = null;
    // the layer list is OURS, so its button needs no discovery: it exists exactly while the overlay does, and it is
    // the active one exactly while the overlay is open
    buttons.layers.hidden = !T.layerListUI;
    var listOpen = !!(T.layerListUI && T.layerListUI.isOpen());
    ENTRIES.forEach(function (e) {
      if (e.target === null) return;
      var present = !!document.querySelector(e.target);
      if (present) seen[e.key] = true;
      var b = buttons[e.key];
      b.hidden = !seen[e.key];
      // seen but gone = its own `v-if` is false = we are on that tab
      if (seen[e.key] && !present) openKey = e.key;
    });
    if (openKey === null) {
      // no system tab is open; the tree button is the active one only when no layer tab is open either
      try { openKey = (typeof player !== 'undefined' && player && player.tab === 'none') ? 'tree' : null; } catch (e2) { openKey = null; }
    }
    if (listOpen) openKey = 'layers'; // the overlay is over whatever tab is underneath it
    ENTRIES.forEach(function (e) {
      buttons[e.key].classList.toggle('active', e.key === openKey);
    });
    // the bar WRITES this; the mobile layout READS it, to pad the bottom of a column the bar would cover. It is
    // written in both modes: harmless with no layout to read it, and the layout is never installed without the bar.
    var h = nav.offsetHeight;
    if (h) document.documentElement.style.setProperty('--tmt-navbar-h', h + 'px');
    // The loader's OWN automation tab gets a hook, because its clickables are laid out in fixed rows of four and a
    // row narrower than four wraps ragged (measured 3+1 at 412–536 px). mobile.css flattens them there. Scoped to
    // this one tab on purpose: a game's own grids are its design, and we do not restyle those. LAYOUT-ONLY: at a
    // desktop width four per row is what the registry asked for and there is nothing to fix.
    if (T.mobile) {
      var onAu = false;
      try { onAu = typeof player !== 'undefined' && player && player.tab === 'au'; } catch (e) { onAu = false; }
      document.documentElement.classList.toggle('tmt-mobile-au', onAu);
    }
  }

  // ---- the tree canvas follows the page (MOBILE ONLY, and for the same reason the tooltips are: without the
  // layout the document does not scroll and there is nothing to follow).
  //
  // ⛔ NOTHING IN ANY ENGINE REDRAWS THE TREE ON A SCROLL. Censused over all 171 `canvas.js` files at 3346da419:
  // **0** listen on `scroll`; **3** listen on `wheel`, which a touch device never fires. The only cadence is
  // `setInterval(function(){ needCanvasUpdate = true }, 500)` plus the game loop's `if (needCanvasUpdate)
  // resizeCanvas()` — so after a flick the branches stand where the last redraw left them for up to half a
  // second. mobile.css §6 puts the canvas in the viewport's coordinate space; this is what keeps it THERE while
  // the page moves under it.
  //
  // ⚠ `resizeCanvas`, NOT the cheaper-looking `drawTree`, and BOTH halves of that were measured rather than
  // assumed. `resizeCanvas` is the entry point the engine's own cadence calls (`if (needCanvasUpdate)
  // resizeCanvas()`), and it is the one that SIZES the bitmap before drawing — which matters twice:
  //   · the canvas carries the engine's `v-if`, so switching to a tab and back gives the tree a BRAND-NEW element
  //     at the HTML default of 300×150. Measured on ptr under `?managed=1`, where the cadence is stopped:
  //     `drawTree()` alone painted the whole tree into a 300×150 bitmap and 7 of 7 judged nodes fell outside it;
  //   · how big the bitmap should be is the GAME's answer, not ours. 164 games size it to `innerWidth ×
  //     innerHeight`, 6 to `#treeTab.scrollWidth/scrollHeight`, 1 to `document.body`'s (censused at 3346da419).
  //   · and `universal-reconstruction`'s `resizeCanvas` also calls `drawResearchBranches()`, so `drawTree` alone
  //     would leave half of that game's tree behind.
  // `drawTree` stays as the fallback for an engine that somehow has no `resizeCanvas`; all 171 have both, and
  // every one of them is pure rendering (`clearRect` + `drawTreeBranch`), which is what lets PURE UI stay true.
  //
  // Coalesced to one redraw per animation FRAME, for the reason the MutationObserver below carries, and PASSIVE:
  // a listener that cannot preventDefault lets the compositor scroll without waiting for us.
  var redraws = 0, scrollQueued = false;
  function redrawTree() {
    try { if (typeof resizeCanvas === 'function') { resizeCanvas(); redraws++; return true; } } catch (e) { /* a game that throws keeps the bar alive */ }
    try { if (typeof drawTree === 'function') { drawTree(); redraws++; return true; } } catch (e2) { /* ditto */ }
    return false;
  }
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () { scrollQueued = false; redrawTree(); });
  }

  // ---- tooltips on touch (MOBILE ONLY — a pointer that hovers already opens them, and pinning one open on every
  // click is not what a desktop reader asked for). Two engine shapes: 2.2.1 `[tooltip]` (shown by :hover:before/
  // :after) and 2.6/2.7 `.tooltipBox > .tooltip` (shown by opacity). One class of OURS covers both; see mobile.css,
  // which is where these rules live. The listener bubbles and never calls preventDefault, so the element's own
  // click (open a tab, buy an upgrade) still happens.
  function tipTargetOf(node) {
    for (var el = node; el && el !== document; el = el.parentElement) {
      if (el.hasAttribute && (el.hasAttribute('tooltip') || el.classList.contains('tooltipBox'))) return el;
    }
    return null;
  }
  function onClick(ev) {
    var t = tipTargetOf(ev.target);
    var open = document.querySelectorAll('.' + TIP_CLASS);
    for (var i = 0; i < open.length; i++) if (open[i] !== t) open[i].classList.remove(TIP_CLASS);
    if (t) t.classList.toggle(TIP_CLASS);
  }

  function start() {
    build();
    refresh();
    if (T.mobile) document.addEventListener('click', onClick, false);
    if (T.mobile) window.addEventListener('scroll', onScroll, { passive: true });
    // Driven by the game's own re-renders, not by a timer of ours: nothing here is anything tmtLoader.pause() or
    // tmtLoader.timers has to account for. Vue repaints the points readout every tick, so the observer fires many
    // times per patch; coalesce to one refresh per animation FRAME. A frame, not a timeout — frames are never
    // paused, and a trailing one means the last change is still reflected under ?managed=1, where the loop is
    // stopped and a tab change may be the only mutation there is.
    var queued = false;
    var obs = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; refresh(); });
    });
    var app = document.getElementById('app');
    if (app) obs.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    T.navbarUI = { nav: nav, refresh: refresh, entries: ENTRIES.map(function (e) { return e.key; }), seen: seen,
      redrawTree: redrawTree, treeRedraws: function () { return redraws; } };
  }

  // navbar.js is inserted BEFORE the game's onload, so the engine's corner controls do not exist yet; the nav is
  // built here and discovers them on the first refresh after `ready`.
  if (T.ready) start();
  else window.addEventListener('tmt-loader:ready', start, { once: true });
})();
