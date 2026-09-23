// tmt-loader — the OPTIONS SECTION (docs/options.md): the loader's own opt-ins, as buttons, inside the game's own
// options tab. A CLASSIC script like loader/navbar.js, so it runs in the global lexical scope and may read the
// engine's globals as bare identifiers (docs/contract.md).
//
// ⛔ IT IS INSERTED WITH NO FLAG IN FRONT OF IT, and that is the whole point: `?mobile=1`, `?navbar=1` and
// `?automation=1` were reachable only by typing them into the address bar, and a page that carries none of them is
// exactly the page that needs to offer them. What it costs an untouched page is one <div> inside the options tab,
// while that tab is open, and nothing at all anywhere else — no <head> entry, no `player` key, no timer, no
// request. Gate M1's inertness leg is about the MODES, and nothing here turns one on by itself.
//
// ENGINE-GENERIC BY CONSTRUCTION, the same way the nav bar is. It knows no tab id. Two facts carry it, both
// measured over the whole roster by tools/census-figures.mjs, which fails if a new game ever breaks either:
//   · every game's options tab draws `<button class="opt" onclick="hardReset()">` — 2.2.1 writes it in index.html,
//     2.7 in the `options-tab` component — so a live `button.opt` IS the options tab, rendered;
//   · every game has the corner control `#optionWheel`, carrying `v-if="player.tab != '<its options tab>'"`, so the
//     wheel being ABSENT is that engine's own statement that the options tab is the open one.
// Both are required before anything is inserted: the wheel alone would be satisfied by a game that has no wheel,
// and `.opt` alone by a game that draws an option button somewhere else.
//
// ⚠ EVERY ONE OF THESE FLAGS NEEDS A RELOAD (docs/options.md): the mobile class goes on <html> before the game's
// markup, the bar decides whether a file is inserted at all, and automation decides whether the registry exists. So
// a press RELOADS — it does not pretend to switch a mode in place, and it does not leave a button that looks
// pressed and changed nothing.
(function () {
  'use strict';
  var T = window.tmtLoader;
  if (!T || !T.prefs) return;

  var ID = 'tmt-loader-options';
  var ENTRIES = [
    { flag: 'mobile', label: 'Mobile layout' },
    { flag: 'navbar', label: 'Nav bar' },
    { flag: 'automation', label: 'Automation tools' }
  ];

  var section = null;
  var buttons = Object.create(null);
  var noteEl = null;

  // ---------------------------------------------------------------- where the section goes
  /** The options tab's own HARD RESET button, or failing that any option button that is not one of ours. */
  function anchorButton() {
    var btns = document.querySelectorAll('button.opt');
    var first = null;
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (section && section.contains(b)) continue; // our own buttons wear the game's class; never anchor to them
      if (!first) first = b;
      if (/hardReset\s*\(/.test(b.getAttribute('onclick') || '')) return b;
    }
    return first;
  }
  /** The open TAB, not the table: `.col` / `.fullWidth` are the layout classes both engines give a tab column, and
   *  the section belongs at the bottom of the tab rather than inside whichever sub-table it found. */
  function containerOf(btn) {
    var el = btn.closest ? btn.closest('.col, .fullWidth') : null;
    if (el) return el;
    var t = btn.closest ? btn.closest('table') : null;
    return (t && t.parentElement) || btn.parentElement;
  }

  // ---------------------------------------------------------------- the section
  // The buttons wear the game's own `opt` class, so they look like the options they sit under in every engine
  // without this file shipping a theme. The few rules of our own are scoped under the section's id and are added
  // with it — a page whose options tab is never opened gains nothing, not even a <style>.
  var CSS = '#' + ID + '{margin-top:24px}' +
    '#' + ID + ' .' + ID + '-head{opacity:.8;font-size:.9em;letter-spacing:.04em}' +
    '#' + ID + ' .' + ID + '-note{opacity:.75;font-size:.8em;max-width:46em;margin:.4em auto 0;line-height:1.4}' +
    '#' + ID + ' table{margin:0 auto}' +
    '#' + ID + ' .' + ID + '-home{display:inline-block;margin-top:.8em;color:inherit;opacity:.85}';

  function build() {
    if (!document.getElementById(ID + '-style')) {
      var st = document.createElement('style');
      st.id = ID + '-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    section = document.createElement('div');
    section.id = ID;
    var head = document.createElement('div');
    head.className = ID + '-head';
    head.textContent = 'tmt-loader';
    var table = document.createElement('table');
    var body = document.createElement('tbody');
    var tr = document.createElement('tr');
    ENTRIES.forEach(function (e) {
      var td = document.createElement('td');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.dataset.flag = e.flag;
      b.addEventListener('click', function () { press(e.flag); });
      buttons[e.flag] = b;
      td.appendChild(b);
      tr.appendChild(td);
    });
    body.appendChild(tr);
    table.appendChild(body);
    noteEl = document.createElement('div');
    noteEl.className = ID + '-note';
    // (U15) the way back to the list of games, which is the census (⚖ user, 2026-09-23: the loader's own page is
    // not a list). An absolute URL, so the `<base href="games/<id>/">` the page runs under cannot touch it.
    var home = document.createElement('a');
    home.className = ID + '-home';
    home.href = 'https://peerinfinity.github.io/tmt-fork-census/';
    home.textContent = '\u2190 All games';
    home.title = 'The list of games, on the TMT fork census. This game is saved first if its autosave is on.';
    // the engines autosave every few seconds and only two of them save on unload, so leaving by a link could drop the
    // last seconds of play; save first, under the same switch the game's own autosave reads — `options.autosave` from
    // TMT 2.6 on, `player.autosave` before it (a 2.6+ `player` has no such field, so reading only that never saves)
    home.addEventListener('click', function () {
      try {
        var on = (typeof options === 'object' && options && 'autosave' in options) ? options.autosave
          : !!(window.player && player.autosave);
        if (on && typeof save === 'function') save();
      } catch (e) { /* leave anyway */ }
    });
    section.append(head, table, noteEl, home);
    label();
  }

  /** What each button says. The values cannot change without a reload, so this is written once at build and only
   *  re-run defensively; every write is guarded so it can never feed the observer below. */
  function label() {
    var overridden = [];
    ENTRIES.forEach(function (e) {
      var b = buttons[e.flag];
      var on = !!T.flags[e.flag];
      var src = T.flagSource[e.flag];
      var locked = e.flag === 'navbar' && T.flags.mobile && src === 'implied';
      var text = e.label + ': ' + (on ? 'ON' : 'OFF') + (locked ? ' (with the mobile layout)' : '');
      if (b.textContent !== text) b.textContent = text;
      // ⚠ guarded, like every write here: `classList.toggle` re-serializes the attribute even when the token set
      // does not move, and that is a mutation record our own observer below would answer, every frame, forever.
      if (b.classList.contains('locked') !== locked) b.classList.toggle('locked', locked);
      var title = locked
        ? 'The mobile layout always shows the bar. Turn the mobile layout off to get this button back.'
        : 'Press to turn this ' + (on ? 'off' : 'on') + ' and reload. Remembered in this browser, for every game.';
      if (b.title !== title) b.title = title;
      if (src === 'url') overridden.push('?' + e.flag + '=' + (on ? '1' : '0'));
    });
    // (U15) the first sentence says what each button IS, for a player who has never read docs/options.md; gate O1
    // reads this note for "reloads the page", so that phrase stays.
    var note = 'Added by tmt-loader, not by the game. Mobile layout: one column with large buttons, for a phone. '
      + 'Nav bar: a bar along the bottom, with a Layers view listing every layer. Automation tools: an AU tab that '
      + 'can reset and buy things for you, each feature off until you turn it on. '
      + 'Pressing one of these reloads the page. The choice is remembered in this browser for every game, '
      + 'and is not part of any game’s save.'
      + (overridden.length
        ? ' The address is answering for ' + overridden.join(' and ') + ' right now; pressing that button drops the'
          + ' parameter so the remembered choice applies.'
        : ' A link that carries ?mobile=, ?navbar= or ?automation= overrides what is remembered.');
    if (noteEl.textContent !== note) noteEl.textContent = note;
  }

  // ---------------------------------------------------------------- the press
  // ⚠ THE PARAMETER IS DROPPED ON THE WAY OUT, and it has to be. The URL answers first at boot — that is the rule
  // gate M1 leans on — so a press made on a page that carries `?mobile=1` would write a preference the next load
  // would then ignore, and the button would appear to do nothing. A deliberate press is the person answering for
  // that flag, so the address stops answering for it.
  function press(flag) {
    var b = buttons[flag];
    if (b && b.classList.contains('locked')) return; // the label says why; nothing is written and nothing reloads
    var next = !T.flags[flag];
    var prefs = T.prefs.read();
    prefs[flag] = next;
    T.prefs.write(prefs);
    var u;
    try { u = new URL(location.href); } catch (e) { location.reload(); return; }
    u.searchParams.delete(flag);
    if (u.href === location.href) location.reload(); else location.replace(u.href);
  }

  // ---------------------------------------------------------------- staying where it belongs
  // The options tab is Vue's; it is destroyed and rebuilt as tabs change, and in 2.7 the column it lives in is
  // shared with every other layer tab. So the section is (re)attached whenever the options tab is the open one and
  // REMOVED the moment it is not — it never lingers over another tab.
  function refresh() {
    if (document.getElementById('optionWheel')) { detach(); return; } // the wheel is drawn: another tab is open
    if (section && section.isConnected) { label(); return; }           // already in place: the cheap path
    var btn = anchorButton();
    if (!btn) { detach(); return; }
    if (!section) build();
    containerOf(btn).appendChild(section);
    label();
  }
  function detach() { if (section && section.isConnected) section.remove(); }

  function start() {
    refresh();
    // Driven by the game's own re-renders, like the nav bar's: no timer of ours, and coalesced to one pass per
    // animation frame. The closed-tab pass is a single getElementById; only an open options tab pays for a query.
    var queued = false;
    var obs = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; refresh(); });
    });
    var app = document.getElementById('app');
    if (app) obs.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    T.optionsUI = {
      id: ID,
      entries: ENTRIES.map(function (e) { return e.flag; }),
      section: function () { return section && section.isConnected ? section : null; },
      button: function (flag) { return buttons[flag] || null; },
      refresh: refresh,
      press: press,
      anchor: anchorButton
    };
  }

  // inserted before the game's onload, so the tab markup does not exist yet; the first pass runs at `ready`
  if (T.ready) start();
  else window.addEventListener('tmt-loader:ready', start, { once: true });
})();
