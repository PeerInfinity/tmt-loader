// tmt-loader — mobile mode, tier 2 (docs/mobile.md). A CLASSIC script, inserted after loader/tmt-auto.js and only
// when `?mobile=1`, so it runs in the global lexical scope and can read the engine's `player` / `showTab` as bare
// identifiers (they may be global `let`s / function declarations, not window properties — see docs/contract.md).
//
// It adds a bottom nav bar and tap-to-open tooltips. It is PURE UI: it never writes `player`, never registers a
// timer, and never calls the game's loop. Tier 1 (loader/mobile.css) stands on its own if this file is removed.
//
// ENGINE-GENERIC BY CONSTRUCTION. The nav bar does not know any tab id: the ids differ between engines (2.2.1 uses
// 'info'/'options'/'help'; 2.7 uses 'info-tab'/'options-tab'). Instead each button FORWARDS a click to the game's
// own corner control (#optionWheel, #info, #help), whose onclick already names the right tab for that engine. The
// same indirection gives the active state for free: those controls carry `v-if="player.tab != '<their tab>'"`, so a
// control that has been seen and is now absent means its tab is the open one.
(function () {
  'use strict';
  var T = window.tmtLoader;
  if (!T || !T.mobile) return; // unreachable without ?mobile=1: page.js only inserts this file when the flag is on

  var NAV_ID = 'tmt-mobile-nav';
  var TIP_CLASS = 'tmt-mobile-tip';

  // key: our name · label: what the button says · target: the game control it forwards to (null = handled directly)
  var ENTRIES = [
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
      b.className = 'tmt-mobile-navbtn';
      b.dataset.key = e.key;
      b.hidden = true; // shown by refresh() once its target has been seen
      var g = document.createElement('span');
      g.className = 'tmt-mobile-glyph';
      g.textContent = e.glyph;
      var l = document.createElement('span');
      l.className = 'tmt-mobile-label';
      l.textContent = e.label;
      b.append(g, l);
      b.addEventListener('click', function () {
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
    ENTRIES.forEach(function (e) {
      buttons[e.key].classList.toggle('active', e.key === openKey);
    });
    var h = nav.offsetHeight;
    if (h) document.documentElement.style.setProperty('--tmt-mobile-nav-h', h + 'px');
  }

  // ---- tooltips on touch. Two engine shapes: 2.2.1 `[tooltip]` (shown by :hover:before/:after) and 2.6/2.7
  // `.tooltipBox > .tooltip` (shown by opacity). One class of OURS covers both; see mobile.css. The listener bubbles
  // and never calls preventDefault, so the element's own click (open a tab, buy an upgrade) still happens.
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
    document.addEventListener('click', onClick, false);
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
    T.mobileUI = { nav: nav, refresh: refresh, entries: ENTRIES.map(function (e) { return e.key; }), seen: seen };
  }

  // mobile.js is inserted BEFORE the game's onload, so the engine's corner controls do not exist yet; the nav is
  // built here and discovers them on the first refresh after `ready`.
  if (T.ready) start();
  else window.addEventListener('tmt-loader:ready', start, { once: true });
})();
