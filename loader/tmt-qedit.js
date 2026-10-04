// loader/tmt-qedit.js — THE QUEUE EDITOR (qedit-1; docs/queues.md, "The editor"): the player's own action queues, kept
// in this browser per game, edited in the automation tab's `Queues` subtab, played by the ONE runner (`tmt-queue.js`).
//
// A CLASSIC script, like tmt-auto.js, tmt-log.js and tmt-queue.js. It is fetched ONLY through the host's
// `fetchQueueEditor` door: the `Queues` subtab opened, this game having saved queues (the declared key below), or
// `tmtLoader.qeditLoad()`. A page that does none of these never runs a line of it (G1, gates-qedit `inert`).
//
// ⚖ The user's rulings (2026-10-02) it rests on:
//  · a step is an ENGINE action, never a DOM click — and the editor SHOWS it by the GAME's own names (the upgrade's
//    title, the buyable's title, the challenge's name, the layer's name); ids are a developer detail;
//  · the queues live in BROWSER STORAGE, per game: ONE key, `tmt-loader:<id>:queues`, through `T.storage.raw` — the
//    loader's own namespace, declared in docs/contract.md beside the others. ⛔ NEVER in `player`: a key there changes
//    every save's full hash. Plus export / import as JSON files — the exported file is what `run.mjs --queue` plays;
//  · v1 = edit (queues, triggers, steps, comments) + the generated queues + the run-status + recording the player's
//    presses. Recording listens on the STATE LOG's hooks (`T.stateLog.tap`): ONE hook path, no second wrapper, and the
//    log itself need not be on.
//  · no game id, layer id or item id in this file: they come from the game's own declarations or from a queue's data.
//
// DISCIPLINE (the V2 / V6 lessons): a TYPED field keeps a local draft until it is committed (change / Enter / blur) and
// refuses to be overwritten while it has focus; a PRESS keeps no state of its own — it calls an operation here and the
// view re-reads. The view is built from this file's API on every redraw; nothing here holds an element.
(function () {
  var T = globalThis.tmtLoader;
  if (!T || !T.automation || !T.uiKit || (T.qedit && T.qedit.ready)) return;
  var G = globalThis;
  var K = T.uiKit, VUE = K.vue;
  var KEY = 'queues';
  var STORE_FORMAT = 'tmt-queue-store/1';
  var FORMAT = 'tmt-queue/1';
  var VERSION = 2;
  var AU = T.auLayer || 'au';

  // ---- the store: ONE key in the loader's own per-game namespace ----------------------------------------------------
  // `{format: 'tmt-queue-store/1', queues: [{enabled: bool, queue: <tmt-queue/1>}]}`. Every read and write is wrapped:
  // a private window or a full store costs the persistence, never the page. In Node there is no `storage.raw`, so the
  // store is memory only.
  var store = null;
  function storeKey() { var st = T.storage; return st && st.prefix && st.raw ? st.prefix + KEY : null; }
  function blank() { return { format: STORE_FORMAT, queues: [] }; }
  function readStore() {
    if (store) return store;
    store = blank();
    try {
      var k = storeKey(), raw = k ? T.storage.raw.getItem.call(localStorage, k) : null;
      var v = raw ? JSON.parse(raw) : null;
      if (v && v.format === STORE_FORMAT && Array.isArray(v.queues)) {
        for (var i = 0; i < v.queues.length; i++) {
          var e = v.queues[i];
          if (e && e.queue && typeof e.queue === 'object' && typeof e.queue.id === 'string') store.queues.push({ enabled: !!e.enabled, queue: e.queue });
        }
      }
    } catch (e) { store = blank(); }
    return store;
  }
  var writes = 0;
  function writeStore() {
    writes++;
    try {
      var k = storeKey();
      if (!k) return;
      var s = readStore();
      // nothing kept is nothing to remember: the key goes, and the next boot requests nothing
      if (s.queues.length) T.storage.raw.setItem.call(localStorage, k, JSON.stringify(s));
      else T.storage.raw.removeItem.call(localStorage, k);
    } catch (e) { /* a full or read-only store */ }
  }
  function find(id) { var s = readStore(); for (var i = 0; i < s.queues.length; i++) if (s.queues[i].queue.id === id) return s.queues[i]; return null; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---- the runner ------------------------------------------------------------------------------------------------
  function runner() { return T.queues && T.queues.ready ? T.queues : null; }
  function ensureRunner() {
    if (runner()) return Promise.resolve(runner());
    if (typeof T.fetchQueueRunner === 'function') return T.fetchQueueRunner().then(function () { return runner(); });
    return Promise.resolve(null);
  }
  var armedAs = {};   // id → the JSON the runner was given, so an edit since then is visible ("restart to use it")
  function loadedIds() {
    var R = runner(), o = {};
    if (!R) return o;
    var st = R.status();
    for (var i = 0; i < st.queues.length; i++) o[st.queues[i].id] = st.queues[i];
    return o;
  }
  // ⛔ EVERY HOLD IS RELEASED when a queue is switched off, deleted or restarted: the runner's own `unload` does it
  function unloadIfLoaded(id) {
    var R = runner();
    if (!R || !loadedIds()[id]) return null;
    delete armedAs[id];
    return R.unload(id);
  }
  function arm(e) {
    var R = runner();
    if (!R) return { ok: false, errors: ['the queue runner is not loaded yet'] };
    var errs = validate(e.queue);
    if (errs.length) return { ok: false, errors: errs };
    unloadIfLoaded(e.queue.id);
    var r = R.load(clone(e.queue));
    if (r.ok) armedAs[e.queue.id] = JSON.stringify(e.queue);
    return { ok: r.ok, errors: plainAll(r.errors || []) };
  }

  // ---- validation, in plain words --------------------------------------------------------------------------------
  // The RUNNER's validate is the judge (one rule set, the one that refuses at load); this only says it for a player.
  var PLAIN = [
    [/^step (\d+): until: a wait needs .until., a predicate$/, function (m) { return 'Step ' + m[1] + ': a wait needs a condition to wait for.'; }],
    [/^step (\d+): if: .if. must be a non-empty predicate$/, function (m) { return 'Step ' + m[1] + ': the “only if” condition is empty.'; }],
    [/^step (\d+): until: (.*)$/, function (m) { return 'Step ' + m[1] + ': the condition to wait for is not something the game understands (' + m[2] + ').'; }],
    [/^step (\d+): if: (.*)$/, function (m) { return 'Step ' + m[1] + ': the “only if” condition is not something the game understands (' + m[2] + ').'; }],
    [/^step (\d+): a wait needs "timeout".*$/, function (m) { return 'Step ' + m[1] + ': a wait needs a time limit, in game-seconds, above 0.'; }],
    [/^step (\d+): "onTimeout".*$/, function (m) { return 'Step ' + m[1] + ': say what happens when the time limit runs out (stop the queue, or skip the wait).'; }],
    [/^step (\d+): no automation feature "(.*)" in this game$/, function (m) { return 'Step ' + m[1] + ': this game has no automation tool “' + m[2] + '”.'; }],
    [/^step (\d+): a hold names its "features"$/, function (m) { return 'Step ' + m[1] + ': choose at least one automation tool to pause.'; }],
    [/^step (\d+): the engine has no global function "(.*)"$/, function (m) { return 'Step ' + m[1] + ': this game has no action “' + m[2] + '”.'; }],
    [/^step (\d+): a call step needs "fn".*$/, function (m) { return 'Step ' + m[1] + ': choose the action to take.'; }],
    [/^step (\d+): "(.*)" is not a function here$/, function (m) { return 'Step ' + m[1] + ': this game has no action “' + m[2] + '”.'; }],
    [/^step (\d+): a comment step carries "text"$/, function (m) { return 'Step ' + m[1] + ': a comment needs some text.'; }],
    [/^step (\d+): "times".*$/, function (m) { return 'Step ' + m[1] + ': “how many times” is a whole number from 1 to 1000.'; }],
    [/^step (\d+): "do" must be.*$/, function (m) { return 'Step ' + m[1] + ': this is not a kind of step this page knows.'; }],
    [/^trigger\.when: a predicate trigger needs "when"$/, function () { return 'The start condition is empty: type the condition this queue waits for before it starts.'; }],
    [/^trigger\.when: (.*)$/, function (m) { return 'The start condition is not something the game understands (' + m[1] + ').'; }],
    [/^"steps" must be a non-empty array$/, function () { return 'A queue needs at least one step.'; }],
    [/^"format" must be.*$/, function (m) { return 'This is not a queue file (' + m[0] + ').'; }],
    [/^"version" must be.*$/, function (m) { return 'This queue was written for a newer page than this one (' + m[0] + ').'; }],
    [/^\x22name\x22 needs.*$/, function () { return 'A name is text of at most 80 characters (and needs "version": 2).'; }],
    [/^\x22id\x22 must be.*$/, function () { return 'The queue’s id must be 1–80 letters, digits or _ . : -'; }],
  ];
  function plain(msg) {
    for (var i = 0; i < PLAIN.length; i++) { var m = PLAIN[i][0].exec(msg); if (m) return PLAIN[i][1](m); }
    msg = String(msg);
    return msg.charAt(0).toUpperCase() + msg.slice(1) + (/[.!?]$/.test(msg) ? '' : '.');
  }
  function plainAll(list) { return list.map(plain); }
  /** The reasons a queue cannot run, in plain words (empty = it can). The runner's validate, then the editor's own. */
  function validate(q) {
    var R = runner();
    if (!R) return ['The queue runner is not loaded yet.'];
    return plainAll(R.validate(q));
  }

  // ---- the GAME's own names --------------------------------------------------------------------------------------
  function text(v) {
    var s = '';
    try { s = typeof v === 'function' ? v() : v; } catch (e) { s = ''; }
    if (s === undefined || s === null) return '';
    return String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ').trim().slice(0, 70);
  }
  function guarded(fn) { try { return K.withoutRaisingNaN(fn); } catch (e) { return ''; } }
  function layerName(l) {
    return guarded(function () { var L = layers[l]; return (L && text(L.name)) || l; }) || l;
  }
  var GROUP_WORD = { upgrades: 'upgrade', buyables: 'buyable', challenges: 'challenge', clickables: 'button' };
  function itemName(l, group, id) {
    var n = guarded(function () {
      var d = layers[l] && layers[l][group] ? layers[l][group][id] : null;
      if (!d) return '';
      // the field the engine's own component draws as the item's name
      return text(d.title) || text(d.name) || '';
    });
    return n || (GROUP_WORD[group] || group) + ' ' + id;
  }
  // an engine call → its words. The FUNCTIONS are the engines' public entry points (docs/log.md's hook list), not game ids.
  var CALLS = {
    buyUpgrade: { verb: 'Buy upgrade', group: 'upgrades' }, buyUpg: { verb: 'Buy upgrade', group: 'upgrades' },
    buyBuyable: { verb: 'Buy', group: 'buyables' }, buyMaxBuyable: { verb: 'Buy as many as you can of', group: 'buyables' },
    startChallenge: { verb: 'Enter (or leave) challenge', group: 'challenges' }, completeChallenge: { verb: 'Complete challenge', group: 'challenges' },
    clickClickable: { verb: 'Press', group: 'clickables' }, doReset: { verb: 'Reset for', group: null }, respecBuyables: { verb: 'Respec the buyables of', group: null },
  };
  function featureTitle(id) {
    var fs = T.features || [];
    for (var i = 0; i < fs.length; i++) if (fs[i].id === id) return fs[i].title && fs[i].title !== id ? fs[i].title + ' (' + layerName(fs[i].layer) + ')' : id;
    return id;
  }
  function secs(x) { var n = Number(x); return (Math.round(n * 10) / 10) + ' s'; }
  // (parts-1) a wait's limit in words: game-seconds, or (format version 4) the game's ticks
  function limit(t) { return t && t.ticks !== undefined ? t.ticks + ' tick' + (Number(t.ticks) === 1 ? '' : 's') : secs(t && t.gs); }
  function isPause(s) { return s.do === 'wait' && String(s.until).trim() === 'false' && s.onTimeout === 'skip'; }
  /** One step in the player's words: {kind, title, detail} — `detail` is the raw form, shown with developer details. */
  function describe(s) {
    if (!s || typeof s !== 'object') return { kind: '?', title: '(not a step)', detail: '' };
    if (s.do === 'call') {
      var c = CALLS[s.fn], a = s.args || [], t;
      if (c && c.group && a.length >= 2 && layers[a[0]]) t = c.verb + ' “' + itemName(a[0], c.group, a[1]) + '” (' + layerName(a[0]) + ')';
      else if (c && !c.group && a.length >= 1 && layers[a[0]]) t = c.verb + ' ' + layerName(a[0]);
      else if (/^layers\./.test(String(s.fn))) {
        var p = String(s.fn).split('.');
        t = 'Press “' + p.slice(-1)[0] + '” of ' + (p[3] && layers[p[1]] && layers[p[1]][p[2]] ? itemName(p[1], p[2], p[3]) : p.slice(2, -1).join(' ')) + (layers[p[1]] ? ' (' + layerName(p[1]) + ')' : '');
      } else t = 'Call ' + s.fn + '(' + a.map(function (x) { return JSON.stringify(x); }).join(', ') + ')';
      if (s.times > 1) t += ' × ' + s.times;
      if (s['if']) t += ' — only if ' + condWords(s['if']);
      return { kind: 'action', title: t, detail: s.fn + '(' + a.map(function (x) { return JSON.stringify(x); }).join(', ') + ')' };
    }
    if (s.do === 'wait') {
      if (isPause(s)) return { kind: 'pause', title: 'Pause for ' + secs(s.timeout && s.timeout.gs) + ' of game time', detail: 'wait until false, ' + (s.timeout && s.timeout.gs) + ' s, then skip' };
      return { kind: 'wait', title: 'Wait until ' + (s.until ? condWords(s.until) : '…') + ' — at most ' + limit(s.timeout) + ', then ' + (s.onTimeout === 'skip' ? 'carry on' : 'stop the queue'), detail: 'wait ' + (s.until || '') };
    }
    if (s.do === 'hold') return { kind: 'pause tools', title: 'Pause the automation’s ' + (s.features || []).map(featureTitle).join(', '), detail: 'hold ' + (s.features || []).join(', ') };
    if (s.do === 'release') return { kind: 'resume tools', title: s.features ? 'Let the automation’s ' + s.features.map(featureTitle).join(', ') + ' run again' : 'Let every tool this queue paused run again', detail: 'release ' + (s.features || []).join(', ') };
    if (s.do === 'comment') return { kind: 'comment', title: s.text || s.comment || '', detail: 'comment' };
    return { kind: String(s.do), title: String(s.do), detail: '' };
  }

  // ---- the game's own lists: every action a step can take, by name --------------------------------------------------
  function gameLayers() {
    var out = [];
    for (var l in layers) { if (!layers[l] || layers[l].tmtLoaderLayer || l === AU) continue; out.push(l); }
    return out;
  }
  function numericIds(obj) { var o = []; for (var k in obj) if (!isNaN(k) && obj[k] && typeof obj[k] === 'object') o.push(k); return o; }
  function buyFn() { return typeof G.buyUpgrade === 'function' ? 'buyUpgrade' : 'buyUpg'; }
  /** Per layer, the actions a player can put in a step: [{layer, name, actions: [{key, fn, args, label}]}] */
  function actions() {
    var out = [], ls = gameLayers();
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i], L = layers[l], acts = [];
      if (L.type && L.type !== 'none' && typeof G.doReset === 'function') acts.push({ fn: 'doReset', args: [l], label: 'Reset for ' + layerName(l) });
      var groups = [['upgrades', buyFn(), 'Buy upgrade'], ['buyables', 'buyBuyable', 'Buy'], ['challenges', 'startChallenge', 'Enter (or leave) challenge'], ['clickables', 'clickClickable', 'Press']];
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g][0];
        if (!L[grp] || typeof G[groups[g][1]] !== 'function') continue;
        var ids = grp === 'upgrades' || grp === 'buyables' ? T.purchaseIds(L[grp]) : numericIds(L[grp]);
        for (var j = 0; j < ids.length; j++) acts.push({ fn: groups[g][1], args: [l, isNaN(ids[j]) ? ids[j] : Number(ids[j])], label: groups[g][2] + ' “' + itemName(l, grp, ids[j]) + '”' });
      }
      for (var a = 0; a < acts.length; a++) acts[a].key = acts[a].fn + ':' + JSON.stringify(acts[a].args);
      if (acts.length) out.push({ layer: l, name: layerName(l), actions: acts });
    }
    return out;
  }
  function featureList() { return (T.features || []).map(function (f) { return { id: f.id, title: featureTitle(f.id) }; }); }

  // ---- operations: each returns {ok, errors[, id]} and leaves the store written ------------------------------------
  function slug(name) { return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'queue'; }
  function freeId(base) { var id = base, n = 2; while (find(id)) id = base + '-' + n++; return id; }
  function create(name, steps) {
    name = String(name || '').trim().slice(0, 80) || 'my queue';
    var q = { format: FORMAT, version: VERSION, id: freeId(slug(name)), name: name, trigger: { on: 'start' }, source: 'authored', comment: '',
      steps: steps && steps.length ? steps : [{ 'do': 'comment', text: 'a new queue — add its steps below' }] };
    readStore().queues.push({ enabled: false, queue: q });
    writeStore();
    return { ok: true, errors: [], id: q.id };
  }
  function edit(id, fn) {
    var e = find(id);
    if (!e) return { ok: false, errors: ['There is no queue “' + id + '”.'] };
    var q = clone(e.queue), why = fn(q);
    if (why) return { ok: false, errors: [why] };
    if (!q.version || q.version < VERSION) q.version = VERSION;   // the editor writes version 2 (`name`, `times`)
    e.queue = q;
    writeStore();
    return { ok: true, errors: [], id: id };
  }
  function rename(id, name) {
    name = String(name || '').trim();
    if (!name) return { ok: false, errors: ['A queue needs a name.'] };
    if (name.length > 80) return { ok: false, errors: ['A name is at most 80 characters.'] };
    return edit(id, function (q) { q.name = name; });
  }
  function setComment(id, t) { return edit(id, function (q) { if (t) q.comment = String(t); else delete q.comment; }); }
  function setTrigger(id, tr) {
    if (!tr || (tr.on !== 'start' && tr.on !== 'predicate')) return { ok: false, errors: ['A queue starts when the game starts, or when a condition holds.'] };
    return edit(id, function (q) { q.trigger = tr.on === 'start' ? { on: 'start' } : { on: 'predicate', when: String(tr.when || '') }; });
  }
  function stepAt(q, i) { return i >= 0 && i < q.steps.length; }
  function addStep(id, step, at) {
    return edit(id, function (q) {
      if (!step || typeof step !== 'object') return 'That is not a step.';
      var i = at === undefined || at === null ? q.steps.length : Math.max(0, Math.min(q.steps.length, at));
      q.steps.splice(i, 0, clone(step));
    });
  }
  function setStep(id, i, step) { return edit(id, function (q) { if (!stepAt(q, i)) return 'There is no step ' + (i + 1) + '.'; q.steps[i] = clone(step); }); }
  function moveStep(id, i, dir) {
    return edit(id, function (q) {
      var j = i + dir;
      if (!stepAt(q, i) || !stepAt(q, j)) return 'That step cannot move that way.';
      var t = q.steps[i]; q.steps[i] = q.steps[j]; q.steps[j] = t;
    });
  }
  function deleteStep(id, i) {
    return edit(id, function (q) {
      if (!stepAt(q, i)) return 'There is no step ' + (i + 1) + '.';
      if (q.steps.length === 1) return 'A queue needs at least one step — delete the queue instead.';
      q.steps.splice(i, 1);
    });
  }
  /** Switch a queue on (it is checked, then armed: a `start` queue runs on the next tick) or off (unloaded; its holds go). */
  function setEnabled(id, on) {
    var e = find(id);
    if (!e) return { ok: false, errors: ['There is no queue “' + id + '”.'] };
    if (on) {
      var r = arm(e);
      if (!r.ok) return r;
      e.enabled = true;
    } else {
      unloadIfLoaded(id);
      e.enabled = false;
    }
    writeStore();
    return { ok: true, errors: [], id: id };
  }
  /** Run it again from the top with what is saved now (an edit to an armed queue takes effect only through this). */
  function restart(id) {
    var e = find(id);
    if (!e) return { ok: false, errors: ['There is no queue “' + id + '”.'] };
    if (!e.enabled) return setEnabled(id, true);
    return arm(e);
  }
  // ⛔ DELETE RELEASES ITS HOLDS: a deleted queue is unloaded first, so nothing it paused stays paused
  function remove(id) {
    var s = readStore();
    for (var i = 0; i < s.queues.length; i++) {
      if (s.queues[i].queue.id !== id) continue;
      var u = unloadIfLoaded(id);
      s.queues.splice(i, 1);
      writeStore();
      return { ok: true, errors: [], id: id, released: u && u.released || 0 };
    }
    return { ok: false, errors: ['There is no queue “' + id + '”.'] };
  }

  // ---- export / import --------------------------------------------------------------------------------------------
  // The file is the queue itself, in the format the harness plays (`run.mjs --queue <file>`), one-space indent as the
  // committed queue files are. Import keeps the object exactly as parsed, so export → import → export is byte-equal.
  function exportText(id) { var e = find(id); return e ? JSON.stringify(e.queue, null, 1) + '\n' : null; }
  function fileName(id) { return 'tmt-queue-' + (T.id || 'game') + '-' + id + '.json'; }
  function download(id) {
    var t = exportText(id);
    if (t === null) return { ok: false, errors: ['There is no queue “' + id + '”.'] };
    try {
      var blob = new Blob([t], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = fileName(id);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
    } catch (e) { /* no DOM (the harness) */ }
    return { ok: true, errors: [], name: fileName(id), bytes: t.length };
  }
  /** Import ONE queue (a JSON text). Refused, with every reason, unless the runner would load it; never half-added. */
  function importText(txt, opts) {
    var q;
    try { q = JSON.parse(txt); } catch (e) { return { ok: false, errors: ['This file is not JSON (' + String(e.message).slice(0, 100) + ').'] }; }
    if (!q || typeof q !== 'object' || Array.isArray(q)) return { ok: false, errors: ['This file is not a queue.'] };
    var errs = validate(q);
    if (!errs.length && find(q.id)) errs.push('You already have a queue with the id “' + q.id + '” — delete or rename that one first.');
    if (errs.length) return { ok: false, errors: errs };
    readStore().queues.push({ enabled: false, queue: q });
    writeStore();
    return { ok: true, errors: [], id: q.id, from: opts && opts.from || null };
  }

  // ---- the generated queues: shipped beside the game data --------------------------------------------------------
  // ⚖ SHIPPED, NOT GENERATED HERE: a template needs the planner's rolled-back copy and the game's facts, minutes of
  // harness work that the page does not carry (docs/templates.md, "Templates are harness-only"). The catalog,
  // `games-queues/index.json`, lists per game the committed queues the templates wrote; it is requested only when the
  // player opens the list (never at boot), and each queue file only when the player adds it.
  var catalogState = { asked: false, loading: false, error: null, entries: null };
  function catalog() {
    if (catalogState.asked) return catalogState.promise;
    catalogState.asked = true; catalogState.loading = true;
    catalogState.promise = (typeof T.fetchLoaderText === 'function' ? T.fetchLoaderText('games-queues/index.json') : Promise.reject(new Error('no loader files on this page')))
      .then(function (t) {
        var c = JSON.parse(t);
        if (!c || c.format !== 'tmt-queue-catalog/1' || !c.games) throw new Error('games-queues/index.json is not a queue catalog');
        catalogState.entries = (c.games[T.id] || []).slice();
        catalogState.loading = false;
        return catalogState.entries;
      }).catch(function (e) { catalogState.loading = false; catalogState.error = String(e && e.message || e).slice(0, 160); catalogState.asked = false; return null; });
    return catalogState.promise;
  }
  function addGenerated(entry) {
    if (!entry || typeof entry.file !== 'string') return Promise.resolve({ ok: false, errors: ['That is not a catalog entry.'] });
    return ensureRunner().then(function () { return T.fetchLoaderText(entry.file); })
      .then(function (t) { return importText(t, { from: entry.file }); }, function (e) { return { ok: false, errors: ['The queue file could not be loaded (' + String(e && e.message || e).slice(0, 120) + ').'] }; });
  }

  // ---- RECORD MY PRESSES ------------------------------------------------------------------------------------------
  // Listens on the state log's hooks (`T.stateLog.tap`) — the one hook path; the log itself need not be on, and with it
  // off nothing is recorded anywhere but here. Only the PLAYER's presses are kept (`source: player` — never the
  // automation's, a queue's or the game's own), and only those that changed the game: a press that bought nothing is
  // counted and left out. On stop:
  //  · a run of the SAME press with less than a game-second between them is ONE step with `times` (version 2);
  //  · a gap of a game-second or more between presses becomes a pause step (a wait on `false` that skips at its limit),
  //    so a replay waits as the player did; delete the pauses to make the queue press as fast as it can;
  //  · the queue is added to the list switched OFF, for the player to read and edit before it runs.
  var GAP = 1;
  var rec = { on: false, presses: [], refused: 0, odd: 0, untap: null, busy: false, error: null, startedGs: 0 };
  function plainArg(v) { return v === null || typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)); }
  function onTap(ev) {
    if (!rec.on || ev.source !== 'player') return;
    if (!ev.did) { rec.refused++; return; }
    var args = ev.args || [];
    for (var i = 0; i < args.length; i++) if (!plainArg(args[i])) { rec.odd++; return; }
    rec.presses.push({ fn: ev.call, args: args.slice(), self: ev.self === 'layers' ? 'layers' : null, gs: Number(player.timePlayed) || Number(ev.gs) || 0 });
  }
  function recStart() {
    if (rec.on || rec.busy) return Promise.resolve(recStatus());
    rec.busy = true; rec.error = null;
    var go = function () {
      if (!T.stateLog || typeof T.stateLog.tap !== 'function') throw new Error('the recorder (the state log’s hooks) is not available');
      rec.presses = []; rec.refused = 0; rec.odd = 0;
      rec.untap = T.stateLog.tap(onTap);
      rec.on = true; rec.busy = false;
      rec.startedGs = Number(player.timePlayed) || 0;
      return recStatus();
    };
    var p = T.stateLog ? Promise.resolve() : (typeof T.fetchStateLog === 'function' ? T.fetchStateLog() : Promise.reject(new Error('no recorder on this page')));
    return p.then(go).catch(function (e) { rec.busy = false; rec.error = String(e && e.message || e).slice(0, 160); return recStatus(); });
  }
  function same(a, b) { return a.fn === b.fn && a.self === b.self && JSON.stringify(a.args) === JSON.stringify(b.args); }
  function foldPresses(ps) {
    var steps = [], i = 0;
    while (i < ps.length) {
      var p = ps[i], n = 1;
      while (i + n < ps.length && same(ps[i + n], p) && ps[i + n].gs - ps[i + n - 1].gs < GAP) n++;
      var last = ps[i + n - 1];
      var st = { 'do': 'call', fn: p.fn, args: p.args.slice() };
      if (p.self) st.self = p.self;
      if (n > 1) st.times = n;
      steps.push(st);
      var next = ps[i + n];
      if (next && next.gs - last.gs >= GAP) {
        var gap = Math.round((next.gs - last.gs) * 10) / 10;
        steps.push({ 'do': 'wait', until: 'false', timeout: { gs: gap }, onTimeout: 'skip', comment: 'recorded: ' + gap + ' game-seconds passed before your next press' });
      }
      i += n;
    }
    return steps;
  }
  function recStop() {
    if (!rec.on) return { ok: false, errors: ['Nothing is being recorded.'] };
    if (rec.untap) rec.untap();
    rec.untap = null; rec.on = false;
    var ps = rec.presses.slice();
    if (!ps.length) return { ok: false, errors: ['No presses were recorded' + (rec.refused ? ' (' + rec.refused + ' press(es) changed nothing and were left out)' : '') + '.'] };
    var steps = foldPresses(ps);
    var when = new Date();
    var name = 'recorded ' + when.getFullYear() + '-' + ('0' + (when.getMonth() + 1)).slice(-2) + '-' + ('0' + when.getDate()).slice(-2) + ' ' + ('0' + when.getHours()).slice(-2) + ':' + ('0' + when.getMinutes()).slice(-2);
    var r = create(name, steps);
    edit(r.id, function (q) {
      q.comment = 'Recorded from your presses: ' + ps.length + ' press(es), as ' + steps.filter(function (s) { return s.do === 'call'; }).length + ' action step(s)'
        + (rec.refused ? '; ' + rec.refused + ' press(es) that changed nothing were left out' : '') + (rec.odd ? '; ' + rec.odd + ' press(es) whose arguments a file cannot hold were left out' : '') + '.';
    });
    return { ok: true, errors: [], id: r.id, presses: ps.length, steps: steps.length };
  }
  function recStatus() { return { on: rec.on, busy: rec.busy, presses: rec.presses.length, refused: rec.refused, odd: rec.odd, error: rec.error }; }

  // ---- the run-status -------------------------------------------------------------------------------------------
  var STATE_WORDS = { armed: 'waiting for its start', running: 'running', done: 'finished', aborted: 'stopped' };
  function view() {
    var s = readStore(), L = loadedIds(), out = [];
    for (var i = 0; i < s.queues.length; i++) {
      var e = s.queues[i], q = e.queue, st = L[q.id] || null, cur = null;
      if (st && st.current) { var d = describe(q.steps[st.current.index - 1] || {}); cur = { index: st.current.index, title: d.title, comment: st.current.comment }; }
      var errs = runner() ? validate(q) : [];
      out.push({
        id: q.id, name: q.name || q.id, enabled: e.enabled, comment: q.comment || '', trigger: q.trigger || { on: 'start' }, source: q.source === undefined ? null : q.source,
        steps: q.steps.map(function (x, k) { var d = describe(x); return { i: k, kind: d.kind, title: d.title, detail: d.detail, comment: x.comment || '', step: x }; }),
        errors: errs,
        run: st ? { state: st.state, words: STATE_WORDS[st.state] || st.state, outcome: st.outcome, current: cur, wait: st.wait,
          holds: st.holds.map(featureTitle), holdIds: st.holds.slice(), last: st.last, steps: st.steps } : null,
        stale: !!(st && armedAs[q.id] && armedAs[q.id] !== JSON.stringify(q)),
      });
    }
    return out;
  }
  /** Queues the runner holds that are not in this list (a `?autoOpt=queue=` file, the console): shown, read-only. */
  function others() {
    var L = loadedIds(), o = [];
    for (var id in L) if (!find(id) && !L[id].shipped) o.push({ id: id, words: STATE_WORDS[L[id].state] || L[id].state, holds: L[id].holds.map(featureTitle), last: L[id].last });
    return o;
  }

  // ---- boot: arm every switched-on queue ----------------------------------------------------------------------------
  var booted = null;
  function boot() {
    if (booted) return booted;
    booted = ensureRunner().then(function () {
      var s = readStore(), report = { armed: [], refused: [] };
      for (var i = 0; i < s.queues.length; i++) {
        var e = s.queues[i];
        if (!e.enabled || loadedIds()[e.queue.id]) continue;
        var r = arm(e);
        if (r.ok) report.armed.push(e.queue.id); else report.refused.push({ id: e.queue.id, errors: r.errors });
      }
      bootReport = report;
      return report;
    });
    return booted;
  }
  var bootReport = null;

  // ---- (parts-1) THE GAME'S OWN PARTS: its stages and the queues its table ships -----------------------------------
  // ⚖ the user's goal (2026-10-02): a player SEES every part shaping their game, reads it in plain words, and can turn
  // it off (or, for a stage, give it their own condition) FOR THEMSELVES. The parts are the table's DATA, read through
  // the core (`T.stages()`, `T.autoQueues`, the runner's `status()`); the player's switches go through the core's ONE
  // declared key (`T.parts`, `tmt-loader:<id>:parts`) — never the table, never the save. This file only shows them.

  // A CONDITION, READABLY: split at its top-level `&&` (only where there is no top-level `||`), and each clause read in
  // words where it is one of the engines' own questions (an upgrade owned, a milestone, a challenge open or completed, a
  // layer unlocked, a challenge running, a currency against a reset's requirement) — by the GAME's names. A clause it
  // cannot read stays code. Each clause carries its truth NOW (✓ / ✗ / ⚠), read through the same compiled predicates.
  function splitTop(src, op) {
    var out = [], depth = 0, q = null, start = 0;
    for (var i = 0; i < src.length; i++) {
      var c = src.charAt(i);
      if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; continue; }
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') depth--;
      else if (depth === 0 && src.substr(i, op.length) === op) { out.push(src.slice(start, i)); start = i + op.length; i += op.length - 1; }
    }
    out.push(src.slice(start));
    return out.map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function unwrap(x) {
    x = x.trim();
    while (x.charAt(0) === '(' && x.charAt(x.length - 1) === ')' && balanced(x.slice(1, -1))) x = x.slice(1, -1).trim();
    return x;
  }
  function balanced(x) { var d = 0, q = null; for (var i = 0; i < x.length; i++) { var c = x.charAt(i); if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; } if (c === '"' || c === "'") q = c; else if (c === '(') d++; else if (c === ')') { d--; if (d < 0) return false; } } return d === 0; }
  function clauses(src) {
    var x = unwrap(String(src || ''));
    if (!x) return [];
    if (splitTop(x, '||').length > 1) return [x];
    var parts = splitTop(x, '&&');
    var out = [];
    for (var i = 0; i < parts.length; i++) { var u = unwrap(parts[i]); var sub = splitTop(u, '||').length > 1 ? [u] : splitTop(u, '&&'); out.push.apply(out, sub.length > 1 ? clauses(u) : [u]); }
    return out;
  }
  var ID = '["\']?([A-Za-z0-9_]+)["\']?';
  var L_ = '(?:\\.([A-Za-z_][A-Za-z0-9_]*)|\\[["\']([^"\']+)["\']\\])';   // player.x  |  player["x"]
  function lay(m, i) { return m[i] || m[i + 1]; }
  function milestoneName(l, id) { return guarded(function () { var d = layers[l] && layers[l].milestones ? layers[l].milestones[id] : null; return d ? text(d.requirementDescription) : ''; }) || 'milestone ' + id; }
  function resourceName(l) { return guarded(function () { return text((tmp[l] && tmp[l].resource) || (layers[l] && layers[l].resource)); }) || layerName(l) + ' points'; }
  var CLAUSE = [
    [new RegExp('^hasUpgrade\\(\\s*' + ID + '\\s*,\\s*' + ID + '\\s*\\)$'), function (m, neg) { return (neg ? 'you do not own ' : 'you own ') + '“' + itemName(m[1], 'upgrades', m[2]) + '” (' + layerName(m[1]) + ')'; }],
    [new RegExp('^hasMilestone\\(\\s*' + ID + '\\s*,\\s*' + ID + '\\s*\\)$'), function (m, neg) { return (neg ? 'you do not have ' : 'you have ') + 'the ' + layerName(m[1]) + ' milestone “' + milestoneName(m[1], m[2]) + '”'; }],
    [new RegExp('^hasChallenge\\(\\s*' + ID + '\\s*,\\s*' + ID + '\\s*\\)$'), function (m, neg) { return '“' + itemName(m[1], 'challenges', m[2]) + '” (' + layerName(m[1]) + ') is ' + (neg ? 'not ' : '') + 'completed'; }],
    [new RegExp('^maxedChallenge\\(\\s*' + ID + '\\s*,\\s*' + ID + '\\s*\\)$'), function (m, neg) { return '“' + itemName(m[1], 'challenges', m[2]) + '” (' + layerName(m[1]) + ') is ' + (neg ? 'not yet fully' : 'fully') + ' completed'; }],
    [new RegExp('^canCompleteChallenge\\(\\s*' + ID + '\\s*,\\s*' + ID + '\\s*\\)$'), function (m, neg) { return 'the goal of “' + itemName(m[1], 'challenges', m[2]) + '” is ' + (neg ? 'not ' : '') + 'met'; }],
    [new RegExp('^player' + L_ + '\\.unlocked$'), function (m, neg) { return layerName(lay(m, 1)) + ' is ' + (neg ? 'not yet ' : '') + 'unlocked'; }],
    [new RegExp('^player' + L_ + '\\.activeChallenge$'), function (m, neg) { return neg ? 'no ' + layerName(lay(m, 1)) + ' challenge is running' : 'you are inside a ' + layerName(lay(m, 1)) + ' challenge'; }],
    [new RegExp('^String\\(player' + L_ + '\\.activeChallenge\\)\\s*(===|!==)\\s*["\']([^"\']+)["\']$'), function (m, neg) { var inside = (m[3] === '===') !== neg; return 'you are ' + (inside ? '' : 'not ') + 'inside “' + itemName(lay(m, 1), 'challenges', m[4]) + '”'; }],
    [new RegExp('^tmp' + L_ + '\\.challenges\\[' + ID + '\\]\\.unlocked$'), function (m, neg) { return '“' + itemName(lay(m, 1), 'challenges', m[3]) + '” (' + layerName(lay(m, 1)) + ') is ' + (neg ? 'not yet ' : '') + 'open'; }],
    [new RegExp('^tmp' + L_ + '\\.layerShown\\s*===\\s*true$'), function (m, neg) { return layerName(lay(m, 1)) + ' is ' + (neg ? 'not ' : '') + 'shown'; }],
    [new RegExp('^player' + L_ + '\\.points\\.(gt|eq|lte)\\(0\\)$'), function (m, neg) { var some = (m[3] === 'gt') !== neg; return 'you have ' + (some ? 'some' : 'no') + ' ' + resourceName(lay(m, 1)); }],
    [new RegExp('^player' + L_ + '\\.points\\.gte\\(tmp' + L_ + '\\.nextAt\\)$'), function (m, neg) { return 'your ' + resourceName(lay(m, 1)) + ' ' + (neg ? 'do not yet reach' : 'reach') + ' what ' + layerName(lay(m, 3)) + ' needs for its next reset'; }],
    [new RegExp('^canReset\\(\\s*' + ID + '\\s*\\)$'), function (m, neg) { return layerName(m[1]) + ' can ' + (neg ? 'not yet ' : '') + 'reset'; }],
    [new RegExp('^player' + L_ + '\\.buyables\\[' + ID + '\\](\\.plus\\(tmp' + L_ + '\\.[A-Za-z0-9_]+\\))?\\.(gte|gt)\\((\\d+(?:\\.\\d+)?)\\)$'), function (m, neg) {
      var l = lay(m, 1), n = Number(m[8]) + (m[7] === 'gt' ? 1 : 0);
      return '“' + itemName(l, 'buyables', m[3]) + '” (' + layerName(l) + ')' + (m[4] ? ', counting the free ones,' : '') + (neg ? ' is below ' : ' is at least ') + n; }],
  ];
  /** One clause in words, or null when it is not one of the questions this page can read. */
  function clauseWords(c) {
    var x = unwrap(c), neg = false;
    var ors = splitTop(x, '||');
    if (ors.length > 1) { var ws = ors.map(clauseWords); return ws.every(function (w) { return w; }) ? ws.join(', or ') : null; }
    while (x.charAt(0) === '!' && x.charAt(1) !== '=') { neg = !neg; x = unwrap(x.slice(1)); }
    for (var i = 0; i < CLAUSE.length; i++) { var m = CLAUSE[i][0].exec(x); if (m) { try { return CLAUSE[i][1](m, neg); } catch (e) { return null; } } }
    return null;
  }
  /** (parts-1) a condition in words when every clause of it can be read, else its code */
  function condWords(src) {
    var r = clauses(src).map(clauseWords);
    return r.length && r.every(function (x) { return x; }) ? r.join(' and ') : String(src);
  }
  function truth(src) { try { return T.predicate(src)() ? 'yes' : 'no'; } catch (e) { return 'error'; } }
  /** A condition as a list of {words, code, now}: `words` null where only the code can say it. */
  function readable(src) {
    return clauses(src).map(function (c) { return { words: clauseWords(c), code: c, now: truth(c) }; });
  }
  function provLines(recs) {
    return [].concat(recs || []).map(function (r) {
      // the measurement's own words, with every feature id drawn as its title (the player view's rule, shipq-2)
      return { note: T.titleIds ? T.titleIds(r.note || '') : r.note || '', where: r.unverified ? 'no measured row behind it' : 'gate ' + r.gate + (r.run ? ', CI run ' + r.run : '') + ', at ' + String(r.commit || '').slice(0, 9) };
    });
  }
  function featureWithLayer(id) { return featureTitle(id); }
  function kindOf(id) { var i = String(id).indexOf(':'); return i < 0 ? '' : String(id).slice(0, i); }
  /** The table's stages, for a player: name, note, condition in words, in force now, what it sets by TITLES, evidence. */
  function stagesView() {
    var st = typeof T.stages === 'function' ? T.stages() : [];
    return st.map(function (S) {
      var sets = [];
      for (var f in S.policies) sets.push({ id: f, title: featureWithLayer(f), what: 'decides by “' + (T.policyStringWords ? T.policyStringWords(kindOf(f), S.policies[f]) : S.policies[f]) + '”', raw: S.policies[f] });
      for (var g in S.gates) {
        var rw = readable(S.gates[g]), words = rw.every(function (x) { return x.words; }) ? rw.map(function (x) { return x.words; }).join(' and ') : null;
        sets.push({ id: g, title: featureWithLayer(g), what: 'acts only while ' + (words || S.gates[g]), raw: S.gates[g], code: !words });
      }
      var state = S.off ? 'option-off' : S.offByYou ? 'yours-off' : S.error ? 'error' : S.active ? 'on' : 'waiting';
      return { id: S.id, name: S.name || S.id, note: S.note || '', state: state,
        stateWords: { 'option-off': 'not in force — this run has the stages switched off (an option)', 'yours-off': 'switched off by you — the game’s own settings apply to what it sets',
          error: '⚠ its condition could not be read (' + S.error + '), so it is not in force', on: 'in force now', waiting: 'not in force now — waiting for its condition' }[state],
        when: S.whenInForce, whenTable: S.when, whenYours: S.whenYours, condition: readable(S.whenInForce), sets: sets, evidence: provLines(S.provenance), offByYou: S.offByYou,
        since: S.since };
    });
  }
  /** The queues the game's table ships, for a player: name, what for, state in words, condition, steps, evidence. */
  function shippedView() {
    var es = Array.isArray(T.autoQueues) ? T.autoQueues : [], R = runner(), L = loadedIds();
    var skipped = {}, refused = {};
    if (R && R.shippedSkipped) R.shippedSkipped().forEach(function (x) { skipped[x.id] = x; });
    if (R && R.shippedErrors) R.shippedErrors().forEach(function (x) { refused[x.id] = x; });
    var tw = function (t) { return T.titleIds ? T.titleIds(t) : t; };
    return es.map(function (e) {
      var q = e.queue, st = L[e.id] && L[e.id].shipped ? L[e.id] : null, off = !!(T.parts && T.parts.queueOff(e.id));
      var cond = (e.when ? '(' + e.when + ')' : '') + (q.trigger && q.trigger.on === 'predicate' ? (e.when ? ' && ' : '') + '(' + q.trigger.when + ')' : '');
      var state, words;
      if (off) { state = 'yours-off'; words = 'switched off by you — it will not start in this browser until you switch it back on'; }
      else if (e.enabled === false) { state = 'shipped-off'; words = 'the game ships it switched off'; }
      else if (skipped[e.id]) { state = 'skipped'; words = 'not part of this run — ' + tw(skipped[e.id].why); }
      else if (refused[e.id]) { state = 'refused'; words = 'refused: ' + refused[e.id].errors.join('; '); }
      else if (!st) { state = R ? 'none' : 'loading'; words = R ? 'not loaded' : 'loading…'; }
      else { state = st.shipped.phase; words = tw(st.shipped.text); }
      var cur = null;
      if (st && st.current && st.state === 'running') { var d = describe(q.steps[st.current.index - 1] || {}); cur = { index: st.current.index, title: d.title, comment: st.current.comment }; }
      return { id: e.id, name: q.name || e.id, comment: q.comment || '', dev: q.dev || '', state: state, words: words, offByYou: off,
        rearm: e.rearm === 'each' ? 'again each time its condition turns true, at most ' + e.cap + ' times, ' + (e.coolOff && e.coolOff.gs) + ' game-s apart' : 'once per page load',
        condition: readable(cond || 'true'), conditionCode: cond,
        steps: q.steps.map(function (x, k) { var d = describe(x); return { i: k, title: d.title, detail: d.detail, comment: x.comment || '', dev: x.dev || '' }; }),
        run: st ? { state: st.state, current: cur, wait: st.wait, holds: st.holds.map(featureTitle), last: lastWords(tw(st.last)), steps: st.steps } : null,
        evidence: provLines(T.autoQueueProvenance && T.autoQueueProvenance[e.id]) };
    });
  }
  // the runner's last-outcome line names the condition a wait met or a call skipped on: in words where it can be read
  function lastWords(t) {
    if (typeof t !== 'string') return t;
    var m = /^(.*? until )(.+)$/.exec(t) || /^(did not call \S+: )(.+)( is false)$/.exec(t);
    return m ? m[1] + condWords(m[2]) + (m[3] || '') : t;
  }
  function setStageOff(id, off) { return T.parts ? T.parts.setStageOff(id, off) : { ok: false, error: 'not available on this page' }; }
  function setStageWhen(id, src) { return T.parts ? T.parts.setStageWhen(id, src) : { ok: false, error: 'not available on this page' }; }
  function setShippedOff(id, off) { return T.parts ? T.parts.setQueueOff(id, off) : { ok: false, error: 'not available on this page' }; }
  /** Copy a shipped queue into the player's own queues (switched Off): the runner's `copyShipped`, the editor's import. */
  function copyShipped(id) {
    return ensureRunner().then(function (R) {
      if (!R || typeof R.copyShipped !== 'function') return { ok: false, errors: ['The queue runner is not loaded.'] };
      var c = R.copyShipped(id);
      if (!c.ok) return { ok: false, errors: [plain(c.error)] };
      if (find(c.id)) return { ok: false, errors: ['You already have the copy “' + (c.queue.name || c.id) + '” — it is in your queues below.'], id: c.id };
      return importText(JSON.stringify(c.queue), { from: 'shipped:' + id });
    });
  }

  // ---- the components -------------------------------------------------------------------------------------------
  var BTN = K.BTN_STYLE, SEL = K.SELECT_STYLE, ROOT = K.ROOT_STYLE;
  var PRED = K.PRED_FIELD_STYLE, FIELD = K.FIELD_STYLE;
  // ⛔ EVERY ROW WRAPS (V5): flex rows with `flex-wrap:wrap`, no `white-space:nowrap` anywhere, every block `min-width:0`
  // — a 390 px phone puts a control on the next line rather than past the edge.
  var ROW = 'display:flex;flex-wrap:wrap;align-items:center;gap:3px;min-width:0;max-width:100%;text-align:left;margin:2px 0';
  var BLOCK = 'text-align:left;min-width:0;max-width:100%;box-sizing:border-box;border-left:3px solid #7fb2d9;background:rgba(127,178,217,.08);border-radius:4px;padding:6px 8px;margin:0 0 8px 0';
  var SUB = 'text-align:left;min-width:0;max-width:100%;box-sizing:border-box;margin:2px 0 2px 8px';
  var ERR = 'color:#d07a7a;font-size:.9em;text-align:left';
  var DIM = 'opacity:.7;font-size:.9em;text-align:left';
  function clock() { try { return tmp[AU].auViewGen; } catch (e) { return player.timePlayed; } }

  var COMPONENTS = {
    // ONE TEXT FIELD, with V2's draft discipline: bound to a local draft, committed on change / Enter / blur, never
    // overwritten while focused, every key stopped at the field (the game's bare-letter hotkeys), `focused()` called.
    // `data` = {value, label, kind: 'text'|'predicate'|'number', commit(v) → {ok, errors}, cls}
    'tmtl-qtext': {
      props: ['data'],
      data: function () { return { draft: String(this.data.value === undefined || this.data.value === null ? '' : this.data.value), editing: false, error: null }; },
      watch: { 'data.value': function (v) { if (!this.editing) { this.draft = String(v === undefined || v === null ? '' : v); this.error = null; } } },
      methods: {
        onFocus: function () { this.editing = true; K.setFocused(true); },
        onBlur: function () { this.commit(); this.editing = false; K.setFocused(false); },
        onKey: function (e) { if (e.key === 'Enter') this.commit(); else if (e.key === 'Escape') { this.draft = String(this.data.value === undefined || this.data.value === null ? '' : this.data.value); this.error = null; } },
        commit: function () {
          var cur = String(this.data.value === undefined || this.data.value === null ? '' : this.data.value);
          if (this.draft === cur) { this.error = null; return; }
          var r = this.data.commit(this.draft);
          this.error = r && r.ok ? null : (r && r.errors && r.errors.join(' ')) || 'not accepted';
          if (r && r.ok && this.data.reset) this.draft = '';   // a "name it and create" field empties once it has acted
          this.$emit('changed');
        },
      },
      computed: { fstyle: function () { return this.data.kind === 'number' ? FIELD : PRED; }, wide: function () { return this.data.kind !== 'number'; } },
      template: '<span class="tmtl-qfield" style="display:inline-flex;flex-wrap:wrap;align-items:center;min-width:0;max-width:100%;box-sizing:border-box;text-align:left;margin:1px 0" :style="wide ? \'width:100%\' : \'\'">'
        + '<span v-if="data.label" style="opacity:.75;font-size:.85em;min-width:0;max-width:100%;overflow-wrap:anywhere;margin:0 3px 0 0">{{ data.label }}</span>'
        + '<input type="text" :class="\'tmtl-qinput \' + (data.cls || \'\')" v-model="draft" :style="fstyle + \';text-align:left\'" @focus="onFocus" @blur="onBlur" @change="commit"'
        + ' @keydown.stop="onKey" @keyup.stop @keypress.stop>'
        + '<span v-if="error" class="tmtl-error" style="' + ERR + ';display:block;flex:1 1 100%">{{ error }}</span>'
        + '</span>',
    },
    // ONE STEP: its words, its comment, ↑ ↓ ×, and (opened) the fields of its kind
    'tmtl-qstep': {
      props: ['data'],
      data: function () { return { open: false, err: null }; },
      computed: {
        s: function () { return this.data.st.step; },
        pick: function () {
          if (this.s.do !== 'call') return null;
          var k = this.s.fn + ':' + JSON.stringify(this.s.args || []);
          return k;
        },
        actionOpts: function () { return this.data.acts; },
        featureOpts: function () { return this.data.features; },
        held: function () { var o = {}; (this.s.features || []).forEach(function (f) { o[f] = true; }); return o; },
      },
      methods: {
        put: function (fn) { var s = clone(this.s); fn(s); var r = setStep(this.data.qid, this.data.st.i, s); this.err = r.ok ? null : r.errors.join(' '); this.$emit('changed'); return r; },
        move: function (d) { var r = moveStep(this.data.qid, this.data.st.i, d); this.err = r.ok ? null : r.errors.join(' '); this.$emit('changed'); },
        drop: function () { var r = deleteStep(this.data.qid, this.data.st.i); this.err = r.ok ? null : r.errors.join(' '); this.$emit('changed'); },
        setAction: function (e) {
          var k = e.target.value, all = this.data.acts, hit = null;
          for (var i = 0; i < all.length && !hit; i++) for (var j = 0; j < all[i].actions.length; j++) if (all[i].actions[j].key === k) { hit = all[i].actions[j]; break; }
          if (hit) this.put(function (s) { s.fn = hit.fn; s.args = hit.args.slice(); delete s.self; });
        },
        setTimes: function (v) { var n = Number(v); return this.put(function (s) { if (n === 1) delete s.times; else s.times = n; }); },
        setUntil: function (v) { return this.put(function (s) { s.until = v; }); },
        setGs: function (v) { var n = Number(v); return this.put(function (s) { s.timeout = { gs: n }; }); },
        setOnTimeout: function (e) { var v = e.target.value; this.put(function (s) { s.onTimeout = v; }); },
        toggleFeature: function (id) { this.put(function (s) { var f = s.features || []; var i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.push(id); if (f.length || s.do === 'hold') s.features = f; else delete s.features; }); },
        setText: function (v) { return this.put(function (s) { s.text = v; }); },
        setComment: function (v) { return this.put(function (s) { if (v) s.comment = v; else delete s.comment; }); },
        fwrap: function (v, fn) { return { value: v, commit: fn }; },
      },
      template: '<div class="tmtl-qstep" :data-step="data.st.i + 1" :data-kind="s.do" style="' + SUB + ';border-bottom:1px solid rgba(127,178,217,.15);padding:2px 0">'
        + '<div style="' + ROW + '">'
        +   '<span style="' + DIM + '">{{ data.st.i + 1 }}.</span>'
        +   '<span class="tmtl-qstep-title" style="min-width:0;overflow-wrap:anywhere;flex:1 1 12em;text-align:left">{{ data.st.title }}</span>'
        +   '<button type="button" class="tmtl-qstep-up" style="' + BTN + '" title="earlier" @click="move(-1)" @keydown.stop>↑</button>'
        +   '<button type="button" class="tmtl-qstep-down" style="' + BTN + '" title="later" @click="move(1)" @keydown.stop>↓</button>'
        +   '<button type="button" class="tmtl-qstep-edit" style="' + BTN + '" @click="open = !open" @keydown.stop>{{ open ? \'done\' : \'edit\' }}</button>'
        +   '<button type="button" class="tmtl-qstep-del" style="' + BTN + '" title="delete this step" @click="drop" @keydown.stop>×</button>'
        + '</div>'
        + '<div v-if="data.st.comment && s.do !== \'comment\'" class="tmtl-qstep-comment" style="' + SUB + ';' + DIM + '">— {{ data.st.comment }}</div>'
        + '<div v-if="data.dev" style="' + SUB + ';' + DIM + ';font-family:monospace;font-size:.8em">{{ data.st.detail }}</div>'
        + '<div v-if="open" class="tmtl-qstep-fields" style="' + SUB + '">'
        +   '<div v-if="s.do === \'call\'" style="' + ROW + '">'
        +     '<select class="tmtl-qstep-action" style="' + SEL + '" :value="pick" @change="setAction" @keydown.stop>'
        +       '<optgroup v-for="g in actionOpts" :key="g.layer" :label="g.name"><option v-for="a in g.actions" :key="a.key" :value="a.key">{{ a.label }}</option></optgroup>'
        +       '<option v-if="pick && !data.known[pick]" :value="pick">{{ data.st.title }}</option>'
        +     '</select>'
        +     '<tmtl-qtext :data="{ value: s.times || 1, label: \'how many times\', kind: \'number\', cls: \'tmtl-qstep-times\', commit: setTimes }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +   '</div>'
        +   '<div v-if="s.do === \'wait\'" style="text-align:left">'
        +     '<tmtl-qtext :data="{ value: s.until, label: \'wait until (a condition on the game, e.g. hasUpgrade(\\u0022p\\u0022, 11))\', kind: \'predicate\', cls: \'tmtl-qstep-until\', commit: setUntil }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +     '<div style="' + ROW + '"><tmtl-qtext :data="{ value: s.timeout && s.timeout.gs, label: \'at most (game-seconds)\', kind: \'number\', cls: \'tmtl-qstep-gs\', commit: setGs }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +       '<select class="tmtl-qstep-ontimeout" style="' + SEL + '" :value="s.onTimeout" @change="setOnTimeout" @keydown.stop><option value="abort">then stop the queue</option><option value="skip">then carry on</option></select></div>'
        +   '</div>'
        +   '<div v-if="s.do === \'hold\' || s.do === \'release\'" style="' + ROW + '">'
        +     '<span style="' + DIM + '">{{ s.do === \'hold\' ? \'pause these tools:\' : \'let these run again (none chosen = all this queue paused):\' }}</span>'
        +     '<button v-for="f in featureOpts" :key="f.id" type="button" class="tmtl-qstep-feature" :data-feature="f.id" :data-on="held[f.id] ? 1 : 0" style="' + BTN + '" :style="held[f.id] ? \'outline:2px solid #7fb2d9\' : \'opacity:.75\'" @click="toggleFeature(f.id)" @keydown.stop>{{ (held[f.id] ? \'\\u2713 \' : \'\') + f.title }}</button>'
        +   '</div>'
        +   '<tmtl-qtext v-if="s.do === \'comment\'" :data="{ value: s.text, label: \'comment\', kind: \'text\', cls: \'tmtl-qstep-text\', commit: setText }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +   '<tmtl-qtext v-if="s.do !== \'comment\'" :data="{ value: s.comment, label: \'note on this step\', kind: \'text\', cls: \'tmtl-qstep-note\', commit: setComment }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        + '</div>'
        + '<div v-if="err" class="tmtl-error" style="' + ERR + '">{{ err }}</div>'
        + '</div>',
    },
    // ONE QUEUE: name, on/off, its run-status, its start, its steps, adding a step, export, delete
    'tmtl-qqueue': {
      props: ['data'],
      data: function () { return { open: true, confirm: false, err: null, addKind: 'call', addAction: '', pickLayer: '' }; },
      computed: {
        q: function () { return this.data.q; },
        known: function () { var o = {}; this.data.acts.forEach(function (g) { g.actions.forEach(function (a) { o[a.key] = true; }); }); return o; },
        layerActs: function () {
          var l = this.pickLayer || (this.data.acts[0] && this.data.acts[0].layer);
          for (var i = 0; i < this.data.acts.length; i++) if (this.data.acts[i].layer === l) return this.data.acts[i].actions;
          return [];
        },
      },
      methods: {
        done: function (r) { this.err = r && !r.ok ? r.errors.join(' ') : null; this.$emit('changed'); return r; },
        toggle: function () { this.done(setEnabled(this.q.id, !this.q.enabled)); },
        restart: function () { this.done(restart(this.q.id)); },
        exp: function () { this.done(download(this.q.id)); },
        del: function () { this.confirm = false; this.done(remove(this.q.id)); },
        rename: function (v) { return rename(this.q.id, v); },
        setComment: function (v) { return setComment(this.q.id, v); },
        setOn: function (e) { var on = e.target.value; this.done(setTrigger(this.q.id, on === 'start' ? { on: 'start' } : { on: 'predicate', when: this.q.trigger.when || '' })); },
        setWhen: function (v) { return setTrigger(this.q.id, { on: 'predicate', when: v }); },
        setLayer: function (e) { this.pickLayer = e.target.value; },
        add: function () {
          var k = this.addKind, s;
          if (k === 'call') {
            var a = null, acts = this.layerActs, key = this.$refs.act ? this.$refs.act.value : '';
            for (var i = 0; i < acts.length; i++) if (acts[i].key === key) a = acts[i];
            if (!a) a = acts[0];
            if (!a) return this.done({ ok: false, errors: ['This game has no actions to choose from.'] });
            s = { 'do': 'call', fn: a.fn, args: a.args.slice() };
          } else if (k === 'wait') s = { 'do': 'wait', until: '', timeout: { gs: 60 }, onTimeout: 'abort' };
          else if (k === 'pause') s = { 'do': 'wait', until: 'false', timeout: { gs: 10 }, onTimeout: 'skip' };
          else if (k === 'hold') s = { 'do': 'hold', features: [] };
          else if (k === 'release') s = { 'do': 'release' };
          else s = { 'do': 'comment', text: 'a note' };
          this.done(addStep(this.q.id, s));
        },
      },
      template: '<div class="tmtl-qqueue" :data-queue="q.id" :data-enabled="q.enabled ? 1 : 0" :data-state="q.run ? q.run.state : \'off\'" style="' + BLOCK + '">'
        + '<div style="' + ROW + '">'
        +   '<button type="button" class="tmtl-qqueue-fold" style="' + BTN + '" @click="open = !open" @keydown.stop>{{ open ? \'−\' : \'+\' }}</button>'
        +   '<b class="tmtl-qqueue-name" style="min-width:0;overflow-wrap:anywhere;flex:1 1 10em;text-align:left">{{ q.name }}</b>'
        +   '<button type="button" class="tmtl-qqueue-onoff" :data-on="q.enabled ? 1 : 0" style="' + BTN + '" @click="toggle" @keydown.stop>{{ q.enabled ? \'On\' : \'Off\' }}</button>'
        +   '<button v-if="q.enabled" type="button" class="tmtl-qqueue-restart" style="' + BTN + '" @click="restart" @keydown.stop>run again from the top</button>'
        +   '<button type="button" class="tmtl-qqueue-export" style="' + BTN + '" @click="exp" @keydown.stop>export</button>'
        +   '<button v-if="!confirm" type="button" class="tmtl-qqueue-del" style="' + BTN + '" @click="confirm = true" @keydown.stop>delete…</button>'
        +   '<span v-if="confirm" style="' + ROW + '"><button type="button" class="tmtl-qqueue-del-go" style="' + BTN + '" @click="del" @keydown.stop>yes, delete it</button>'
        +     '<button type="button" class="tmtl-qqueue-del-no" style="' + BTN + '" @click="confirm = false" @keydown.stop>keep it</button></span>'
        + '</div>'
        // THE RUN-STATUS: which step, what it waits for and the time left, which tools it has paused, the last outcome
        + '<div class="tmtl-qrun" style="' + SUB + '">'
        +   '<div v-if="!q.run" style="' + DIM + '">{{ q.enabled ? \'on, not armed\' : \'off — switch it On to arm it\' }} · starts {{ q.trigger.on === \'start\' ? \'when the game starts (or as soon as it is switched on)\' : \'when \' + (q.trigger.when || \'…\') + \' holds\' }}</div>'
        +   '<div v-else style="text-align:left"><span class="tmtl-qrun-state" :data-state="q.run.state"><b>{{ q.run.words }}</b></span><span v-if="q.run.outcome && q.run.state !== \'running\'"> — {{ q.run.outcome }}</span>'
        +     '<span v-if="q.stale" class="tmtl-qrun-stale" style="color:#c08a3e"> · edited since it was armed: press <i>run again from the top</i> to use the changes</span></div>'
        +   '<div v-if="q.run && q.run.current" class="tmtl-qrun-step" style="text-align:left">step {{ q.run.current.index }} of {{ q.run.steps }}: {{ q.run.current.title }}<span v-if="q.run.current.comment" style="opacity:.7"> — {{ q.run.current.comment }}</span></div>'
        +   '<div v-if="q.run && q.run.wait" class="tmtl-qrun-wait" style="text-align:left">waiting for <code style="overflow-wrap:anywhere">{{ q.run.wait.until }}</code> — <b>{{ Math.round(q.run.wait.left * 10) / 10 }} s</b> left of {{ q.run.wait.timeout }}</div>'
        +   '<div v-if="q.run && q.run.holds.length" class="tmtl-qrun-holds" style="text-align:left">has paused: {{ q.run.holds.join(\', \') }}</div>'
        +   '<div v-if="q.run && q.run.last" class="tmtl-qrun-last" style="' + DIM + '">last: {{ q.run.last }}</div>'
        + '</div>'
        + '<div v-if="q.errors.length" class="tmtl-qerrors" style="' + SUB + '"><div style="' + ERR + '"><b>It cannot run yet:</b></div><div v-for="e in q.errors" :key="e" class="tmtl-qerror" style="' + ERR + '">• {{ e }}</div></div>'
        + '<div v-if="err" class="tmtl-error" style="' + ERR + '">{{ err }}</div>'
        + '<div v-if="open" style="text-align:left;min-width:0">'
        +   '<tmtl-qtext :data="{ value: q.name, label: \'name\', kind: \'text\', cls: \'tmtl-qqueue-rename\', commit: rename }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +   '<div style="' + ROW + '"><span style="' + DIM + '">starts</span>'
        +     '<select class="tmtl-qqueue-trigger" style="' + SEL + '" :value="q.trigger.on" @change="setOn" @keydown.stop><option value="start">when the game starts</option><option value="predicate">when a condition holds</option></select></div>'
        +   '<tmtl-qtext v-if="q.trigger.on === \'predicate\'" :data="{ value: q.trigger.when, label: \'the condition\', kind: \'predicate\', cls: \'tmtl-qqueue-when\', commit: setWhen }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +   '<tmtl-qtext :data="{ value: q.comment, label: \'what this queue is for\', kind: \'text\', cls: \'tmtl-qqueue-comment\', commit: setComment }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +   '<div v-if="data.dev" style="' + SUB + ';' + DIM + '">id {{ q.id }}<span v-if="q.source && q.source.template"> · written by the template {{ q.source.template }} for {{ q.source.goal }}</span></div>'
        +   '<div class="tmtl-qsteps" style="text-align:left;min-width:0">'
        +     '<tmtl-qstep v-for="st in q.steps" :key="q.id + \':\' + st.i" :data="{ qid: q.id, st: st, acts: data.acts, known: known, features: data.features, dev: data.dev }" @changed="$emit(\'changed\')"></tmtl-qstep>'
        +   '</div>'
        +   '<div class="tmtl-qadd" style="' + ROW + '"><span style="' + DIM + '">add</span>'
        +     '<select class="tmtl-qadd-kind" style="' + SEL + '" v-model="addKind" @keydown.stop>'
        +       '<option value="call">an action</option><option value="wait">a wait for a condition</option><option value="pause">a pause (game-seconds)</option>'
        +       '<option value="hold">pause automation tools</option><option value="release">resume automation tools</option><option value="comment">a comment</option></select>'
        +     '<select v-if="addKind === \'call\'" class="tmtl-qadd-layer" style="' + SEL + '" :value="pickLayer || (data.acts[0] && data.acts[0].layer)" @change="setLayer" @keydown.stop>'
        +       '<option v-for="g in data.acts" :key="g.layer" :value="g.layer">{{ g.name }}</option></select>'
        +     '<select v-if="addKind === \'call\'" ref="act" class="tmtl-qadd-action" style="' + SEL + '" @keydown.stop>'
        +       '<option v-for="a in layerActs" :key="a.key" :value="a.key">{{ a.label }}</option></select>'
        +     '<button type="button" class="tmtl-qadd-go" style="' + BTN + '" @click="add" @keydown.stop>add step</button>'
        +   '</div>'
        + '</div>'
        + '</div>',
    },
    // (parts-1) ONE CONDITION, readably: each clause in words (or its code) with its truth now
    'tmtl-qcond': {
      props: ['data'],
      template: '<div class="tmtl-qcond" style="' + SUB + '">'
        + '<div v-for="(c, k) in data.c" :key="k" class="tmtl-qcond-clause" :data-now="c.now" style="' + ROW + '">'
        +   '<span :style="c.now === \'yes\' ? \'color:#4f9a6a\' : c.now === \'no\' ? \'opacity:.7\' : \'color:#d07a7a\'">{{ c.now === \'yes\' ? \'✓\' : c.now === \'no\' ? \'✗\' : \'⚠\' }}</span>'
        +   '<span v-if="c.words" class="tmtl-qcond-words" style="min-width:0;overflow-wrap:anywhere;flex:1 1 12em;text-align:left">{{ c.words }}</span>'
        +   '<code v-else class="tmtl-qcond-code" style="min-width:0;overflow-wrap:anywhere;flex:1 1 12em;text-align:left;font-size:.85em">{{ c.code }}</code>'
        +   '<code v-if="c.words && data.dev" style="min-width:0;overflow-wrap:anywhere;flex:1 1 100%;text-align:left;font-size:.8em;opacity:.6">{{ c.code }}</code>'
        + '</div>'
        + '</div>',
    },
    // (parts-1) ONE STAGE of the game's table: name, note, in force now, its condition, what it sets by TITLES, its
    // evidence; switch off for me, my own condition
    'tmtl-qstage': {
      props: ['data'],
      data: function () { return { err: null, showEv: false, editWhen: false }; },
      computed: { s: function () { return this.data.s; } },
      methods: {
        done: function (r) { this.err = r && !r.ok ? (r.error || (r.errors || []).join(' ')) : null; this.$emit('changed'); return r; },
        toggle: function () { this.done(setStageOff(this.s.id, !this.s.offByYou)); },
        setWhen: function (v) { var r = setStageWhen(this.s.id, v); this.$emit('changed'); return { ok: r.ok, errors: r.ok ? [] : ['The game does not understand this condition (' + r.error + ').'] }; },
        gameWhen: function () { this.done(setStageWhen(this.s.id, null)); },
      },
      template: '<div class="tmtl-qstage tmtl-part" :data-part="\'stage:\' + s.id" :data-stage="s.id" :data-state="s.state" style="' + BLOCK + ';border-left-color:#5f8f6a">'
        + '<div style="' + ROW + '">'
        +   '<b class="tmtl-qstage-name" style="min-width:0;overflow-wrap:anywhere;flex:1 1 10em;text-align:left">{{ s.name }}</b>'
        +   '<button type="button" class="tmtl-qstage-onoff" :data-off="s.offByYou ? 1 : 0" style="' + BTN + '" @click="toggle" @keydown.stop>{{ s.offByYou ? \'switch back on\' : \'switch off for me\' }}</button>'
        + '</div>'
        + '<div class="tmtl-qstage-state" :style="s.state === \'on\' ? \'color:#4f9a6a;text-align:left\' : s.state === \'error\' ? \'' + ERR + '\' : s.state === \'yours-off\' ? \'color:#c08a3e;text-align:left\' : \'' + DIM + '\'"><b>{{ s.stateWords }}</b></div>'
        + '<div v-if="s.note" class="tmtl-qstage-note" style="text-align:left;min-width:0;overflow-wrap:anywhere">{{ s.note }}</div>'
        + '<div style="' + DIM + ';margin-top:3px">{{ s.whenYours ? \'in force while (your own condition):\' : \'in force while:\' }}</div>'
        + '<tmtl-qcond :data="{ c: s.condition, dev: data.dev }"></tmtl-qcond>'
        + '<div style="' + DIM + ';margin-top:3px">while it is in force, it sets:</div>'
        + '<div v-for="x in s.sets" :key="x.id + x.what" class="tmtl-qstage-sets" :data-feature="x.id" style="' + SUB + ';overflow-wrap:anywhere">• <b>{{ x.title }}</b> {{ x.what }}<span v-if="data.dev" style="opacity:.6;font-size:.85em"> ({{ x.id }}: {{ x.raw }})</span></div>'
        + '<div style="' + ROW + ';margin-top:3px">'
        +   '<button type="button" class="tmtl-qstage-evidence" style="' + BTN + '" @click="showEv = !showEv" @keydown.stop>{{ showEv ? \'hide the evidence\' : \'why: the measurements behind it\' }}</button>'
        +   '<button type="button" class="tmtl-qstage-editwhen" style="' + BTN + '" @click="editWhen = !editWhen" @keydown.stop>{{ editWhen ? \'done\' : \'change its condition for me\' }}</button>'
        +   '<button v-if="s.whenYours" type="button" class="tmtl-qstage-gamewhen" style="' + BTN + '" @click="gameWhen" @keydown.stop>use the game’s condition</button>'
        + '</div>'
        + '<div v-if="showEv" class="tmtl-qstage-ev" style="' + SUB + '"><div v-for="(e, k) in s.evidence" :key="k" style="' + SUB + ';overflow-wrap:anywhere;border-bottom:1px solid rgba(127,178,217,.15)">{{ e.note }} <span style="opacity:.6;font-size:.85em">({{ e.where }})</span></div></div>'
        + '<div v-if="editWhen" style="' + SUB + '">'
        +   '<tmtl-qtext :data="{ value: s.whenYours || s.whenTable, label: \'in force while (the same language as the feature conditions; empty = the game’s own)\', kind: \'predicate\', cls: \'tmtl-qstage-when\', commit: setWhen }" @changed="$emit(\'changed\')"></tmtl-qtext>'
        +   '<div style="' + DIM + '">the game’s own: <code style="overflow-wrap:anywhere">{{ s.whenTable }}</code></div>'
        + '</div>'
        + '<div v-if="data.dev" style="' + DIM + '">id {{ s.id }}</div>'
        + '<div v-if="err" class="tmtl-error" style="' + ERR + '">{{ err }}</div>'
        + '</div>',
    },
    // (parts-1) ONE QUEUE THE GAME'S TABLE SHIPS: read-only, marked as part of the game's automation, its live state;
    // copy to my queues, switch off for me
    'tmtl-qshipped': {
      props: ['data'],
      data: function () { return { err: null, note: null, showSteps: false, showEv: false }; },
      computed: { q: function () { return this.data.q; } },
      methods: {
        toggle: function () { var r = setShippedOff(this.q.id, !this.q.offByYou); this.err = r.ok ? null : r.error; this.$emit('changed'); },
        copy: function () {
          var self = this;
          copyShipped(self.q.id).then(function (r) { self.err = r.ok ? null : r.errors.join(' '); self.note = r.ok ? 'copied into your queues (below), switched Off — edit it there' : null; self.$emit('changed'); });
        },
      },
      template: '<div class="tmtl-qshipped tmtl-part" :data-part="\'queue:\' + q.id" :data-queue="q.id" :data-state="q.state" style="' + BLOCK + ';border-left-color:#8a7fd9">'
        + '<div style="' + ROW + '">'
        +   '<b class="tmtl-qshipped-name" style="min-width:0;overflow-wrap:anywhere;flex:1 1 10em;text-align:left">{{ q.name }}</b>'
        +   '<button type="button" class="tmtl-qshipped-copy" style="' + BTN + '" @click="copy" @keydown.stop>copy to my queues</button>'
        +   '<button type="button" class="tmtl-qshipped-onoff" :data-off="q.offByYou ? 1 : 0" style="' + BTN + '" @click="toggle" @keydown.stop>{{ q.offByYou ? \'switch back on\' : \'switch off for me\' }}</button>'
        + '</div>'
        + '<div style="' + DIM + '">part of this game’s automation — a move it makes by itself, {{ q.rearm }}</div>'
        + '<div class="tmtl-qshipped-state" :style="q.state === \'running\' ? \'color:#4f9a6a;text-align:left\' : q.state === \'yours-off\' ? \'color:#c08a3e;text-align:left\' : \'text-align:left\'"><b>{{ q.words }}</b></div>'
        + '<div v-if="q.run && q.run.current" class="tmtl-qrun-step" style="' + SUB + '">step {{ q.run.current.index }} of {{ q.run.steps }}: {{ q.run.current.title }}<span v-if="q.run.current.comment" style="opacity:.7"> — {{ q.run.current.comment }}</span></div>'
        + '<div v-if="q.run && q.run.wait" class="tmtl-qrun-wait" style="' + SUB + '">waiting — <b>{{ Math.round(q.run.wait.left * 10) / 10 }} {{ q.run.wait.unit === \'ticks\' ? \'tick(s)\' : \'s\' }}</b> left of {{ q.run.wait.timeout }}</div>'
        + '<div v-if="q.run && q.run.holds.length" class="tmtl-qrun-holds" style="' + SUB + '">has paused: {{ q.run.holds.join(\', \') }}</div>'
        + '<div v-if="q.run && q.run.last" class="tmtl-qrun-last" style="' + SUB + ';' + DIM + '">last: {{ q.run.last }}</div>'
        + '<div v-if="q.comment" class="tmtl-qshipped-comment" style="text-align:left;min-width:0;overflow-wrap:anywhere;margin-top:3px">{{ q.comment }}</div>'
        + '<div v-if="data.dev && q.dev" class="tmtl-qshipped-dev" style="' + DIM + ';overflow-wrap:anywhere;font-size:.85em;text-align:left">{{ q.dev }}</div>'
        + '<div style="' + DIM + ';margin-top:3px">it starts when:</div>'
        + '<tmtl-qcond :data="{ c: q.condition, dev: data.dev }"></tmtl-qcond>'
        + '<div style="' + ROW + ';margin-top:3px">'
        +   '<button type="button" class="tmtl-qshipped-steps-toggle" style="' + BTN + '" @click="showSteps = !showSteps" @keydown.stop>{{ showSteps ? \'hide its steps\' : \'its \' + q.steps.length + \' steps\' }}</button>'
        +   '<button type="button" class="tmtl-qshipped-evidence" style="' + BTN + '" @click="showEv = !showEv" @keydown.stop>{{ showEv ? \'hide the evidence\' : \'why: the measurements behind it\' }}</button>'
        + '</div>'
        + '<div v-if="showSteps" class="tmtl-qshipped-steps" style="' + SUB + '"><div v-for="st in q.steps" :key="st.i" class="tmtl-qshipped-step" style="' + SUB + ';overflow-wrap:anywhere;border-bottom:1px solid rgba(127,178,217,.15)">{{ st.i + 1 }}. {{ st.title }}<span v-if="st.comment" style="opacity:.7"> — {{ st.comment }}</span><div v-if="data.dev" style="opacity:.6;font-family:monospace;font-size:.8em">{{ st.detail }}</div><div v-if="data.dev && st.dev" class="tmtl-qstep-dev" style="opacity:.6;font-size:.8em;text-align:left">{{ st.dev }}</div></div></div>'
        + '<div v-if="showEv" class="tmtl-qshipped-ev" style="' + SUB + '"><div v-for="(e, k) in q.evidence" :key="k" style="' + SUB + ';overflow-wrap:anywhere;border-bottom:1px solid rgba(127,178,217,.15)">{{ e.note }} <span style="opacity:.6;font-size:.85em">({{ e.where }})</span></div></div>'
        + '<div v-if="data.dev" style="' + DIM + '">id {{ q.id }}</div>'
        + '<div v-if="note" class="tmtl-qnote" style="color:#4f9a6a;text-align:left">{{ note }}</div>'
        + '<div v-if="err" class="tmtl-error" style="' + ERR + '">{{ err }}</div>'
        + '</div>',
    },
    // THE TAB
    'tmtl-qedit': {
      props: ['layer', 'data'],
      data: function () { return { gen: 0, err: null, note: null, newName: '', showCat: false, catBusy: false }; },
      computed: {
        clock: function () { return clock(); },
        dev: function () { void this.gen; return T.devDetails ? T.devDetails() : false; },
        acts: function () { void this.gen; return actions(); },
        features: function () { return featureList(); },
        queues: function () { void this.clock; void this.gen; return view(); },
        others: function () { void this.clock; void this.gen; return others(); },
        recording: function () { void this.clock; void this.gen; return recStatus(); },
        cat: function () { void this.gen; return { loading: catalogState.loading, error: catalogState.error, entries: catalogState.entries }; },
        boot: function () { void this.gen; return bootReport; },
        // (parts-1) the game's own parts, re-read every redraw (live: in force now, running, the time left)
        stages: function () { void this.clock; void this.gen; return stagesView(); },
        shipped: function () { void this.clock; void this.gen; return shippedView(); },
        stagesOn: function () { return this.stages.filter(function (x) { return x.state === 'on'; }).length; },
      },
      created: function () { var self = this; ensureRunner().then(function () { self.gen++; }); },
      // (parts-1) a part's name pressed in the readout (`T.showPart`) brings its entry into sight, once
      mounted: function () { this.focusPart(); },
      updated: function () { this.focusPart(); },
      methods: {
        bump: function () { this.gen++; },
        focusPart: function () {
          var f = T.partFocus;
          if (!f || f.done || !this.$el || !this.$el.querySelector) return;
          var el = this.$el.querySelector('[data-part="' + f.kind + ':' + String(f.id).replace(/"/g, '') + '"]');
          if (!el) return;
          f.done = true;
          try { el.scrollIntoView({ block: 'start' }); } catch (e) { /* no layout */ }
          el.setAttribute('data-focused', '1');
          el.style.outline = '2px solid #7fb2d9';
          setTimeout(function () { try { el.style.outline = ''; el.removeAttribute('data-focused'); } catch (e) { /* gone */ } }, 2500);
        },
        done: function (r, okNote) { this.err = r && !r.ok ? r.errors.join(' ') : null; this.note = r && r.ok && okNote ? okNote : null; this.gen++; return r; },
        create: function (v) { var r = this.done(create(v || 'my queue'), 'added “' + (v || 'my queue') + '” — it is Off until you switch it On'); return r; },
        createNow: function () { this.create(''); },
        rec: function () {
          var self = this;
          if (rec.on) { var r = recStop(); self.done(r, r.ok ? 'recorded ' + r.presses + ' press(es) as ' + r.steps + ' step(s) — the new queue is at the bottom, Off' : null); return; }
          recStart().then(function () { self.gen++; });
          self.gen++;
        },
        onFile: function (e) {
          var self = this, f = e && e.target && e.target.files && e.target.files[0];
          if (!f) return;
          var rd = new FileReader();
          rd.onload = function () { ensureRunner().then(function () { self.done(importText(String(rd.result)), 'imported — it is Off until you switch it On'); }); };
          rd.readAsText(f);
          try { e.target.value = ''; } catch (x) { /* read-only in some browsers */ }
        },
        openCat: function () { var self = this; self.showCat = !self.showCat; if (self.showCat) { self.catBusy = true; catalog().then(function () { self.catBusy = false; self.gen++; }); } },
        addGen: function (entry) { var self = this; addGenerated(entry).then(function (r) { self.done(r, 'added — it is Off until you switch it On'); }); },
      },
      template: '<div class="tmtl-root tmtl-qedit" style="' + ROOT + '">'
        // (parts-1) THE PARTS — the game's own first (what is shaping this game now), then the player's own queues
        + '<div class="tmtl-parts-intro" style="' + DIM + ';margin-bottom:6px;text-align:left">This game’s automation is built from <b>parts</b>: its <b>stages</b> change how some features decide while a condition holds, its <b>moves</b> are one-off queues it plays when their moment comes, and <b>your queues</b> are your own. You can switch any of the game’s parts off for yourself — that is kept in this browser for this game, never in your save, and the game’s own data is not changed.</div>'
        + '<div v-if="stages.length" class="tmtl-parts-stages" style="text-align:left;min-width:0;margin-bottom:8px">'
        +   '<div style="text-align:left"><b>Stages</b> <span style="' + DIM + '">— {{ stages.length }}, {{ stagesOn }} in force now. The first stage in this list that is in force wins where two set the same thing.</span></div>'
        +   '<tmtl-qstage v-for="x in stages" :key="x.id" :data="{ s: x, dev: dev }" @changed="bump"></tmtl-qstage>'
        + '</div>'
        + '<div v-if="shipped.length" class="tmtl-parts-shipped" style="text-align:left;min-width:0;margin-bottom:8px">'
        +   '<div style="text-align:left"><b>Moves this game makes</b> <span style="' + DIM + '">— queues that ship with this game’s automation. Read-only here: copy one to your queues to change it.</span></div>'
        +   '<tmtl-qshipped v-for="x in shipped" :key="x.id" :data="{ q: x, dev: dev }" @changed="bump"></tmtl-qshipped>'
        + '</div>'
        + '<div class="tmtl-parts-mine" style="text-align:left"><b>Your queues</b></div>'
        + '<div style="' + DIM + ';margin-bottom:6px;text-align:left">A <b>queue</b> is a list of steps the automation takes in order: press one of the game’s own buttons, wait for something, pause or resume the automation’s own tools, or just a note. Each queue starts when the game starts or when a condition you type holds, and is kept by this browser for this game (not in your save). Export one to keep it or share it.</div>'
        // the recorder
        + '<div class="tmtl-qrec" style="' + ROW + ';margin-bottom:6px">'
        +   '<button type="button" class="tmtl-qrec-toggle" :data-on="recording.on ? 1 : 0" style="' + BTN + '" @click="rec" @keydown.stop>{{ recording.on ? \'■ stop recording\' : (recording.busy ? \'loading…\' : \'● record my presses\') }}</button>'
        +   '<span class="tmtl-qrec-read" style="' + DIM + '">{{ recording.on ? \'recording: \' + recording.presses + \' press(es) so far\' + (recording.refused ? \', \' + recording.refused + \' that changed nothing (left out)\' : \'\') : \'press the game’s buttons while recording, then stop: you get a queue that presses them again\' }}</span>'
        +   '<span v-if="recording.error" class="tmtl-error" style="' + ERR + '">{{ recording.error }}</span>'
        + '</div>'
        + '<div v-if="note" class="tmtl-qnote" style="color:#4f9a6a;text-align:left">{{ note }}</div>'
        + '<div v-if="err" class="tmtl-error tmtl-qedit-error" style="' + ERR + '">{{ err }}</div>'
        + '<div v-if="boot && boot.refused.length" style="' + ERR + '">These saved queues are switched on but could not be armed: <span v-for="b in boot.refused" :key="b.id">{{ b.id }} ({{ b.errors.join(\' \') }}) </span></div>'
        // the queues
        + '<div class="tmtl-qlist" style="text-align:left;min-width:0">'
        +   '<tmtl-qqueue v-for="q in queues" :key="q.id" :data="{ q: q, acts: acts, features: features, dev: dev, gen: gen }" @changed="bump"></tmtl-qqueue>'
        +   '<div v-if="!queues.length" style="' + DIM + ';text-align:left;margin:4px 0">No queues yet.</div>'
        + '</div>'
        + '<div v-if="others.length" style="' + SUB + ';' + DIM + '">Also running (loaded from the address or the console, not kept here): <span v-for="o in others" :key="o.id" class="tmtl-qother">{{ o.id }} — {{ o.words }}<span v-if="o.holds.length">, has paused {{ o.holds.join(\', \') }}</span>; </span></div>'
        + '<div class="tmtl-qnew" style="' + ROW + ';margin-top:6px">'
        +   '<button type="button" class="tmtl-qnew-go" style="' + BTN + '" @click="createNow" @keydown.stop>new queue</button>'
        +   '<span style="' + DIM + '">or name it:</span>'
        +   '<span style="flex:1 1 12em;min-width:0"><tmtl-qtext :data="{ value: \'\', label: \'\', kind: \'text\', cls: \'tmtl-qnew-name\', reset: true, commit: create }"></tmtl-qtext></span>'
        + '</div>'
        + '<div class="tmtl-qimport" style="' + ROW + '"><span style="' + DIM + '">import a queue file:</span>'
        +   '<input type="file" accept=".json,application/json" class="tmtl-qimport-file" style="' + K.CONTROL + ';max-width:100%;min-width:0;font-size:.85em" @change="onFile" @keydown.stop></div>'
        // the generated queues
        + '<div class="tmtl-qcat" style="text-align:left;margin-top:6px;min-width:0">'
        +   '<button type="button" class="tmtl-qcat-toggle" style="' + BTN + '" @click="openCat" @keydown.stop>{{ showCat ? \'hide the generated queues\' : \'queues the strategy templates wrote for this game\' }}</button>'
        +   '<div v-if="showCat" style="' + SUB + '">'
        +     '<div v-if="catBusy" style="' + DIM + '">loading…</div>'
        +     '<div v-else-if="cat.error" style="' + ERR + '">{{ cat.error }}</div>'
        +     '<div v-else-if="!cat.entries || !cat.entries.length" style="' + DIM + '">none for this game yet.</div>'
        +     '<div v-for="c in (cat.entries || [])" :key="c.file" class="tmtl-qcat-entry" :data-file="c.file" style="' + SUB + ';border-bottom:1px solid rgba(127,178,217,.15)">'
        +       '<div style="' + ROW + '"><b style="min-width:0;overflow-wrap:anywhere;flex:1 1 12em;text-align:left">{{ c.title }}</b><button type="button" class="tmtl-qcat-add" style="' + BTN + '" @click="addGen(c)" @keydown.stop>add to my queues</button></div>'
        +       '<div style="' + DIM + '">{{ c.comment }}</div>'
        +       '<div v-if="c.state" style="' + DIM + '">written for the state {{ c.state }}</div>'
        +     '</div>'
        +   '</div>'
        + '</div>'
        + '</div>',
    },
  };
  var names = [];
  if (VUE && typeof VUE.component === 'function') {
    for (var cn in COMPONENTS) { VUE.component(cn, COMPONENTS[cn]); names.push(cn); if (T.componentNames) T.componentNames.push(cn); }
  }

  T.qedit = {
    ready: true, key: KEY, storeFormat: STORE_FORMAT, version: VERSION, components: names,
    boot: boot, storeKey: storeKey, store: function () { return clone(readStore()); }, writes: function () { return writes; },
    list: view, others: others, describe: describe, actions: actions, features: featureList, validate: validate,
    create: create, rename: rename, setComment: setComment, setTrigger: setTrigger, setEnabled: setEnabled, restart: restart, remove: remove,
    addStep: addStep, setStep: setStep, moveStep: moveStep, deleteStep: deleteStep,
    exportText: exportText, download: download, importText: importText, fileName: fileName,
    catalog: catalog, addGenerated: addGenerated,
    // (parts-1) the game's own parts, as the Parts subtab shows them, and the player's switches on them
    stages: stagesView, shipped: shippedView, readable: readable, condWords: condWords,
    setStageOff: setStageOff, setStageWhen: setStageWhen, setShippedOff: setShippedOff, copyShipped: copyShipped,
    record: { start: recStart, stop: recStop, status: recStatus, fold: foldPresses },
  };
})();
