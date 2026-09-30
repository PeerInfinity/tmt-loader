// tmt-loader embed mode, v1 — the ONE LINE an author adds to their own game page (docs/embed.md):
//
//   <script src="https://peerinfinity.github.io/tmt-loader/v1/embed.js"></script>
//
// placed AFTER the game's own <script> tags. Optional attributes (the v1 interface, ⚖ R1 — never changed within v1):
//   data-load="mobile navbar automation"   which features are OFFERED (a button in the game's options tab); default all
//   data-on="…"                            which of those are ON when a player has not chosen; default none
//   data-game="<loader id>"                the game's id on the loader's site, to use the loader's data for it
//   data-settings                          also read tmt-loader.json beside the page (it wins over the tag, per field)
//
// A CLASSIC script on purpose: `document.currentScript` is how it knows where it was served from, and everything else
// is loaded relative to that — so the same file works from the loader's site (always the latest 1.x) and from
// jsDelivr at an exact tag (`cdn.jsdelivr.net/gh/PeerInfinity/tmt-loader@v1.0.0/v1/embed.js`, frozen).
//
// ⛔ THE PAGE'S `load` EVENT IS HELD until the extras are in place, then let through. The game's `onload` (TMT's
// `<body onload="load()">`) is what builds the tree, and the automation tools must be in before it runs — the hosted
// page runs it at that same point. If the loader cannot be reached, or keeps the game waiting longer than TIME_LIMIT_MS,
// the event is let through anyway and the game starts without the extras: nothing here may keep a game from starting.
(function () {
  'use strict';
  var TIME_LIMIT_MS = 20000;
  var me = document.currentScript;
  if (!me || !me.src) { console.warn('tmt-loader: embed.js must be a plain <script src> in the page'); return; }
  if (window.tmtLoader) { console.warn('tmt-loader: already on this page; this second tag does nothing'); return; }
  if (document.readyState === 'complete') {
    console.warn('tmt-loader: embed.js ran after the page finished loading, too late for the game\'s onload — put the tag in the page\'s HTML, after the game\'s scripts');
    return;
  }
  var dataset = {};
  for (var k in me.dataset) dataset[k] = me.dataset[k];

  // ⚠ THE EXTRAS GO IN WHEN THE PAGE'S OWN `load` FIRES, not when this tag runs. A 2.7 game's js/technical/loader.js
  // inserts its mod files as ASYNC scripts, so when this tag runs the game's layers may not exist yet; the `load`
  // event is the one moment every script the page asked for has run and the game's onload has not. It is held there,
  // the extras are inserted and run, and then it is let through — the gap the hosted page's boot() runs attach in.
  var held = false, done = false, released = false, gaveUp = false, after = [], onHeld = [], timer = null;
  function isPageLoad(ev) { return ev.target === document || ev.target === window; }
  function hold(ev) {
    if (released || !isPageLoad(ev)) return;
    ev.stopImmediatePropagation();   // the game's onload (and every other load listener) waits for the extras
    if (held) return;
    held = true;
    timer = setTimeout(giveUp, TIME_LIMIT_MS);   // the limit counts only the time the GAME is kept waiting
    for (var i = 0; i < onHeld.length; i++) onHeld[i]();
    setTimeout(maybeRelease, 0);
  }
  window.addEventListener('load', hold, true);
  function maybeRelease() {
    if (!done || !held || released) return;
    released = true;
    clearTimeout(timer);
    window.removeEventListener('load', hold, true);
    window.dispatchEvent(new Event('load'));   // synchronous: every load listener, the game's onload among them, has run
    for (var i = 0; i < after.length; i++) after[i]();
  }
  function release() {
    return new Promise(function (resolve) {
      if (released) return resolve();   // already let through (the time limit): the game's onload has run
      after.push(resolve); done = true; maybeRelease();
    });
  }
  function loaded() { return new Promise(function (resolve) { if (held) resolve(); else onHeld.push(resolve); }); }
  function giveUp() {
    if (done) return;
    gaveUp = true;
    console.warn('tmt-loader: the extras took longer than ' + TIME_LIMIT_MS / 1000 + ' s; the game starts without them');
    done = true;
    maybeRelease();
  }

  import(new URL('../loader/embed.mjs', me.src).href)
    .then(function (m) {
      return m.embed({ src: me.src, dataset: dataset, stop: function () { return gaveUp; }, loaded: loaded, release: release });
    })
    .catch(function (e) {
      console.error('tmt-loader: could not load the extras; the game runs without them.', e);
      if (!window.tmtLoader) window.tmtLoader = { embed: true, ready: false, error: { step: 'import', message: String((e && e.message) || e) } };
      done = true;
      maybeRelease();
    });
})();
