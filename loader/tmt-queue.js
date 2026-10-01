// loader/tmt-queue.js — THE QUEUE RUNNER (tpl1; docs/queues.md): plays a `tmt-queue/1` file — a list of ENGINE actions
// with holds on the reflexes, waits and comments — inside the game's tick, and records every step in the state log.
//
// A CLASSIC script, like tmt-auto.js and tmt-log.js, run unchanged by the page and by the Node harness. It is loaded
// ONLY when a queue is: the harness's `--queue <file>` (or `--queue-runner`, which loads it with nothing to play), the
// page's `?autoOpt=queue=<file>` or the first `tmtLoader.queues.load(obj)`. It fills the automation core's
// `tmtLoader.queueLink` slot while a queue is loaded and empties it when the last one is unloaded, so a page or a run
// with no queue executes exactly what it executed before (the inertness gate).
//
// ⚖ The rulings it rests on (PTR-strategy design notes §5, §11; tpl1 brief):
//  · a step is an ENGINE action — an engine entry point and its arguments — never a DOM click;
//  · no game id, layer id or item id appears in this file: a queue names them as DATA;
//  · this slice builds the runner and a READ-ONLY readout; the editor (several queues with triggers, edited in the page)
//    is a later slice, and a queue file is plain JSON so nothing here precludes it.
//
// WHERE IT ACTS — the queue's SLOT: the `au` layer's automate, after its fallback pass (tmt-auto.js `auAutomate`).
//  · INSIDE the tick, so a replay re-applies a queue call in the same place (`logLink.queueSlot`), as it does an
//    automation call in its `runLayer` slot — between ticks a replay diverges (log-1's lesson, §13.5);
//  · AFTER every reflex of the tick has decided, so a queue's purchase is not undone or raced within the tick, and a
//    hold it places is in force from the next tick's first decision;
//  · ONCE per gameLoop, on every game (the `au` layer is a side layer: both engines call its automate every tick,
//    whatever is unlocked), and under every profile (the slot exists under `off` too, which is what a replay runs).
//  Triggers and waits are evaluated in the same slot: the instant a step would act is the instant its condition is read.
//
// ⛔ EVERY HOLD IS RELEASED when its queue ends, aborts or is unloaded — and a restore (a planner excursion) that drops
// the queue drops its holds with it. A held feature's reason (`held:queue`) names the queue and the step that placed it.
(function () {
  var T = globalThis.tmtLoader;
  if (!T || !T.queueLink || (T.queues && T.queues.ready)) return;   // needs the automation core's slot; loaded once
  var G = globalThis;
  var FORMAT = 'tmt-queue/1';
  var link = T.queueLink, logLink = T.logLink;
  var STEP_KINDS = ['call', 'hold', 'release', 'wait', 'comment'];
  var TRIGGERS = ['start', 'predicate'];
  var ON_TIMEOUT = ['abort', 'skip'];

  var loaded = [];         // [{q, state, pc, waitFrom, holds: {featureId: stepIndex}, firedAt, endedAt, outcome, last}]

  // ---- the clock: game-seconds, the game's own -----------------------------------------------------------------------
  // `player.timePlayed` is what both engines advance by `diff` every tick (`addTime`) and what the reflexes' interval
  // clocks already read; `tmtLoader.gameSeconds` where an engine has none.
  function now() {
    var t = NaN;
    try { t = Number(player.timePlayed); } catch (e) { t = NaN; }
    if (!isFinite(t)) t = Number(T.gameSeconds) || 0;
    return t;
  }
  function round6(x) { return Math.round(x * 1e6) / 1e6; }

  // ---- validation: a queue this build cannot play is REFUSED BY NAME, never half-run ----------------------------------
  function featureIds() { var o = {}; for (var i = 0; i < (T.features || []).length; i++) o[T.features[i].id] = 1; return o; }
  function resolve(root, path) { var o = root; for (var i = 0; i < path.length; i++) { if (o === null || o === undefined) return undefined; o = o[path[i]]; } return o; }
  // an engine entry point: a GLOBAL function by name, or a layer path `layers.<l>.<…>.<fn>` (the state log's form)
  function target(fn, self) {
    if (typeof fn !== 'string' || !fn) return { error: 'a call step needs "fn", the engine function to call' };
    if (fn.indexOf('.') < 0) {
      var g = G[fn];
      return typeof g === 'function' ? { fn: g, self: undefined } : { error: 'the engine has no global function "' + fn + '"' };
    }
    var parts = fn.split('.');
    if (parts[0] !== 'layers' || parts.length < 3) return { error: '"' + fn + '" is neither a global function name nor a layers.<layer>.<…>.<fn> path' };
    var p = parts.slice(1), parent = p.slice(0, -1), key = p[p.length - 1];
    var owner = resolve(layers, parent), f = owner ? owner[key] : undefined;
    if (typeof f !== 'function') return { error: '"' + fn + '" is not a function here' };
    var recv = self === 'layers' ? owner : (typeof tmp === 'object' && tmp ? resolve(tmp, parent) : undefined) || owner;
    return { fn: f, self: recv };
  }
  function compiles(src) { try { T.predicate(src); return null; } catch (e) { return String(e && e.message || e).slice(0, 160); } }
  function validate(q) {
    var errs = [];
    if (!q || typeof q !== 'object' || Array.isArray(q)) return ['a queue is a JSON object'];
    if (q.format !== FORMAT) errs.push('"format" must be "' + FORMAT + '" (got ' + JSON.stringify(q.format) + ')');
    if (typeof q.id !== 'string' || !/^[A-Za-z0-9_.:-]{1,80}$/.test(q.id)) errs.push('"id" must be 1–80 characters of letters, digits and _ . : -');
    var tr = q.trigger === undefined ? { on: 'start' } : q.trigger;
    if (!tr || TRIGGERS.indexOf(tr.on) < 0) errs.push('"trigger.on" must be one of ' + TRIGGERS.join(' | '));
    else if (tr.on === 'predicate') { var te = typeof tr.when === 'string' && tr.when ? compiles(tr.when) : 'a predicate trigger needs "when"'; if (te) errs.push('trigger.when: ' + te); }
    if (!Array.isArray(q.steps) || !q.steps.length) { errs.push('"steps" must be a non-empty array'); return errs; }
    var ids = featureIds();
    for (var i = 0; i < q.steps.length; i++) {
      var s = q.steps[i], at = 'step ' + (i + 1) + ': ';
      if (!s || STEP_KINDS.indexOf(s.do) < 0) { errs.push(at + '"do" must be one of ' + STEP_KINDS.join(' | ')); continue; }
      if (s.comment !== undefined && typeof s.comment !== 'string') errs.push(at + '"comment" must be a string');
      if (s.do === 'hold' || s.do === 'release') {
        if (s.do === 'hold' && (!Array.isArray(s.features) || !s.features.length)) { errs.push(at + 'a hold names its "features"'); continue; }
        if (s.features !== undefined && !Array.isArray(s.features)) { errs.push(at + '"features" must be an array of feature ids'); continue; }
        for (var j = 0; j < (s.features || []).length; j++) if (!ids[s.features[j]]) errs.push(at + 'no automation feature "' + s.features[j] + '" in this game');
      } else if (s.do === 'wait') {
        var we = typeof s.until === 'string' && s.until ? compiles(s.until) : 'a wait needs "until", a predicate';
        if (we) errs.push(at + 'until: ' + we);
        // ⛔ A WAIT WITH NO TIMEOUT IS REFUSED: a queue that can wait forever is a silent stall with a hold in force
        if (!s.timeout || !(Number(s.timeout.gs) > 0)) errs.push(at + 'a wait needs "timeout": {"gs": <game-seconds > 0>}');
        if (ON_TIMEOUT.indexOf(s.onTimeout) < 0) errs.push(at + '"onTimeout" must be one of ' + ON_TIMEOUT.join(' | '));
      } else if (s.do === 'call') {
        var t = target(s.fn, s.self);
        if (t.error) errs.push(at + t.error);
        if (s.args !== undefined && !Array.isArray(s.args)) errs.push(at + '"args" must be an array');
      } else if (s.do === 'comment') {
        if (typeof s.text !== 'string' && typeof s.comment !== 'string') errs.push(at + 'a comment step carries "text"');
      }
    }
    return errs;
  }

  // ---- the link: holds, the step hook and the memory, only while something is loaded ---------------------------------
  function syncLink() {
    var h = null;
    for (var i = 0; i < loaded.length; i++) for (var f in loaded[i].holds) {
      if (h === null) h = {};
      if (h[f] === undefined) h[f] = { queue: loaded[i].q.id, step: loaded[i].holds[f] + 1 };
    }
    link.holds = h;
    var any = loaded.length > 0;
    link.step = any ? stepAll : null;
    link.get = any ? getMemory : null;
    link.set = setMemory;   // always: a restore of a record WITH queues must reach the runner once it is loaded
  }

  // ---- recording -----------------------------------------------------------------------------------------------------
  function note(Q, what, extra) {
    var r = { queue: Q.q.id, step: Q.pc < Q.q.steps.length ? Q.pc + 1 : null, 'do': what };
    var s = Q.pc < Q.q.steps.length ? Q.q.steps[Q.pc] : null;
    if (s && s.comment) r.comment = s.comment;
    if (extra) for (var k in extra) r[k] = extra[k];
    if (logLink && logLink.exec !== null && typeof logLink.exec.qnote === 'function') logLink.exec.qnote(r);
  }
  function setLast(Q, text) { Q.last = { text: text, at: round6(now()), tick: Number(T.ticks) || 0 }; }

  // ---- ending: EVERY hold of the queue is released, whatever the reason ----------------------------------------------
  function releaseAll(Q) { var n = 0; for (var f in Q.holds) { delete Q.holds[f]; n++; } return n; }
  function finish(Q, state, why) {
    var n = releaseAll(Q);
    Q.state = state;
    Q.endedAt = round6(now());
    Q.outcome = why || state;
    Q.waitFrom = null;
    setLast(Q, state + (why ? ' — ' + why : '') + (n ? '; released ' + n + ' hold(s)' : ''));
    note(Q, state === 'done' ? 'end' : 'abort', { why: why || null, released: n });
    syncLink();
  }

  // ---- one queue's turn ----------------------------------------------------------------------------------------------
  function callStep(Q, s) {
    var t = target(s.fn, s.self);
    if (t.error) return { threw: t.error };
    var before = T.stateJSON(T.gameState), threw = null;
    var lx = logLink ? logLink.exec : null;
    if (lx !== null && lx && typeof lx.qbegin === 'function') lx.qbegin({ id: Q.q.id, step: Q.pc + 1, comment: s.comment || null });
    try { t.fn.apply(t.self, (s.args || []).slice()); }
    catch (e) { threw = String(e && e.message || e).slice(0, 160); }
    finally { if (lx !== null && lx && typeof lx.qend === 'function') lx.qend(); }
    return { threw: threw, did: T.stateJSON(T.gameState) !== before };
  }
  function runQueue(Q) {
    var guard = 0;
    while (Q.state === 'running') {
      if (guard++ > Q.q.steps.length + 1) break;   // every step either advances or returns; this is a seatbelt
      if (Q.pc >= Q.q.steps.length) { finish(Q, 'done', null); return; }
      var s = Q.q.steps[Q.pc], i;
      if (s.do === 'comment') {
        note(Q, 'comment', { text: s.text || s.comment });
        setLast(Q, 'comment: ' + (s.text || s.comment));
        Q.pc++;
      } else if (s.do === 'hold') {
        for (i = 0; i < s.features.length; i++) if (Q.holds[s.features[i]] === undefined) Q.holds[s.features[i]] = Q.pc;
        note(Q, 'hold', { features: s.features.slice() });
        setLast(Q, 'held ' + s.features.join(', '));
        syncLink();
        Q.pc++;
      } else if (s.do === 'release') {
        var fs = s.features ? s.features : Object.keys(Q.holds);
        for (i = 0; i < fs.length; i++) delete Q.holds[fs[i]];
        note(Q, 'release', { features: fs.slice() });
        setLast(Q, 'released ' + (fs.join(', ') || 'nothing'));
        syncLink();
        Q.pc++;
      } else if (s.do === 'call') {
        var r = callStep(Q, s);
        if (r.threw) { setLast(Q, 'call ' + s.fn + ' threw: ' + r.threw); finish(Q, 'aborted', 'step ' + (Q.pc + 1) + ': the call ' + s.fn + ' threw: ' + r.threw); return; }
        setLast(Q, 'called ' + s.fn + '(' + (s.args || []).map(function (a) { return JSON.stringify(a); }).join(', ') + ') — ' + (r.did ? 'it changed the game' : 'it changed nothing'));
        Q.pc++;
      } else if (s.do === 'wait') {
        var t0 = now();
        if (Q.waitFrom === null) Q.waitFrom = t0;
        var v, err = null;
        try { v = !!T.predicate(s.until)(); } catch (e) { err = String(e && e.message || e).slice(0, 160); }
        // ⛔ A THROW IS NOT A FALSE (V4's rule): a wait whose predicate throws aborts, by name, rather than waiting out
        // its timeout looking exactly like a condition not yet met
        if (err !== null) { finish(Q, 'aborted', 'step ' + (Q.pc + 1) + ': the wait condition threw: ' + err); return; }
        var waited = round6(t0 - Q.waitFrom);
        if (v) {
          note(Q, 'wait-met', { until: s.until, waited: waited });
          setLast(Q, 'waited ' + waited + ' s until ' + s.until);
          Q.waitFrom = null; Q.pc++;
        } else if (waited >= Number(s.timeout.gs)) {
          note(Q, 'wait-timeout', { until: s.until, waited: waited, onTimeout: s.onTimeout });
          Q.waitFrom = null;
          if (s.onTimeout === 'abort') { finish(Q, 'aborted', 'step ' + (Q.pc + 1) + ': timed out after ' + waited + ' s waiting for ' + s.until); return; }
          setLast(Q, 'skipped a wait after ' + waited + ' s: ' + s.until);
          Q.pc++;
        } else return;   // not yet: the next tick's slot asks again
      }
    }
  }
  function stepAll() {
    for (var i = 0; i < loaded.length; i++) {
      var Q = loaded[i];
      if (Q.state === 'armed') {
        var tr = Q.q.trigger || { on: 'start' }, fire = tr.on === 'start', err = null;
        if (tr.on === 'predicate') { try { fire = !!T.predicate(tr.when)(); } catch (e) { err = String(e && e.message || e).slice(0, 160); } }
        if (err !== null) { finish(Q, 'aborted', 'the trigger condition threw: ' + err); continue; }
        if (!fire) continue;
        Q.state = 'running';
        Q.firedAt = round6(now());
        note(Q, 'trigger', { on: tr.on });
        setLast(Q, 'triggered (' + tr.on + ')');
      }
      if (Q.state === 'running') runQueue(Q);
    }
  }

  // ---- the memory (runtimeState's `queues` block) --------------------------------------------------------------------
  function getMemory() {
    if (!loaded.length) return null;
    return { format: FORMAT, loaded: loaded.map(function (Q) {
      return { q: JSON.parse(JSON.stringify(Q.q)), state: Q.state, pc: Q.pc, waitFrom: Q.waitFrom, holds: Object.assign({}, Q.holds),
        firedAt: Q.firedAt, endedAt: Q.endedAt, outcome: Q.outcome, last: Q.last ? Object.assign({}, Q.last) : null };
    }) };
  }
  function setMemory(m) {
    loaded = [];
    if (m && m.loaded) for (var i = 0; i < m.loaded.length; i++) {
      var x = m.loaded[i];
      loaded.push({ q: JSON.parse(JSON.stringify(x.q)), state: x.state, pc: Number(x.pc) || 0, waitFrom: x.waitFrom === null || x.waitFrom === undefined ? null : Number(x.waitFrom),
        holds: Object.assign({}, x.holds || {}), firedAt: x.firedAt === undefined ? null : x.firedAt, endedAt: x.endedAt === undefined ? null : x.endedAt,
        outcome: x.outcome === undefined ? null : x.outcome, last: x.last || null });
    }
    syncLink();
  }

  // ---- the API -------------------------------------------------------------------------------------------------------
  function load(obj) {
    var q = obj;
    if (typeof obj === 'string') { try { q = JSON.parse(obj); } catch (e) { return { ok: false, id: null, errors: ['not JSON: ' + String(e.message).slice(0, 120)] }; } }
    var errs = validate(q);
    if (!errs.length) for (var i = 0; i < loaded.length; i++) if (loaded[i].q.id === q.id) errs.push('a queue "' + q.id + '" is already loaded — unload it first');
    if (errs.length) return { ok: false, id: q && q.id || null, errors: errs };
    var Q = { q: JSON.parse(JSON.stringify(q)), state: 'armed', pc: 0, waitFrom: null, holds: {}, firedAt: null, endedAt: null, outcome: null, last: null };
    loaded.push(Q);
    setLast(Q, 'loaded; waiting for its trigger (' + ((q.trigger && q.trigger.on) || 'start') + ')');
    note(Q, 'load', { steps: q.steps.length, trigger: (q.trigger && q.trigger.on) || 'start', from: q.source === undefined ? null : q.source });
    syncLink();
    return { ok: true, id: q.id, errors: [] };
  }
  function unload(id) {
    for (var i = 0; i < loaded.length; i++) {
      if (loaded[i].q.id !== id) continue;
      var Q = loaded[i], n = releaseAll(Q), was = Q.state;
      note(Q, 'unload', { state: was, released: n });
      loaded.splice(i, 1);
      syncLink();
      return { ok: true, id: id, state: was, released: n };
    }
    return { ok: false, id: id, error: 'no queue "' + id + '" is loaded' };
  }
  var STATE_TEXT = { armed: 'waiting for its trigger', running: 'running', done: 'finished', aborted: 'aborted' };
  function stepText(s) {
    if (s.do === 'call') return s.fn + '(' + (s.args || []).map(function (a) { return JSON.stringify(a); }).join(', ') + ')';
    if (s.do === 'wait') return 'until ' + s.until + ' (at most ' + s.timeout.gs + ' s, then ' + s.onTimeout + ')';
    if (s.do === 'hold' || s.do === 'release') return (s.features || ['every hold of this queue']).join(', ');
    return s.text || '';
  }
  function status() {
    return { ready: true, format: FORMAT, slot: [T.auLayer || 'au', 'queue'], queues: loaded.map(function (Q) {
      var cur = Q.state === 'running' || Q.state === 'armed' ? Q.q.steps[Q.pc] : null;
      return { id: Q.q.id, state: Q.state, stateText: (STATE_TEXT[Q.state] || Q.state) + (Q.outcome && Q.state !== 'running' && Q.state !== 'armed' ? ' (' + Q.outcome + ')' : ''),
        steps: Q.q.steps.length, pc: Q.pc, comment: Q.q.comment || null, source: Q.q.source === undefined ? null : Q.q.source,
        current: cur ? { index: Q.pc + 1, 'do': cur.do, text: stepText(cur), comment: cur.comment || null } : null,
        waiting: Q.waitFrom === null ? null : round6(now() - Q.waitFrom),
        holds: Object.keys(Q.holds).sort(), firedAt: Q.firedAt, endedAt: Q.endedAt, outcome: Q.outcome, last: Q.last ? Q.last.text : null };
    }) };
  }

  T.queues = { ready: true, format: FORMAT, load: load, unload: unload, status: status, validate: function (q) { return validate(q); } };
  syncLink();
})();
