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
//  · tpl1 built the runner and a READ-ONLY readout; the editor (several queues with triggers, edited in the page) is
//    qedit-1's `loader/tmt-qedit.js`, which plays its queues through THIS runner — one runner, one format.
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
  // (qedit-1) THE VERSION FIELD. A queue with no `version` is version 1, exactly the format tpl1 shipped. Version 2 adds
  // two fields and nothing else: a queue's `name` (what the editor shows; the `id` stays the key) and a call's `times`
  // (the call made N times in a row in one slot — the recorder folds a run of identical presses into one step). A
  // version this runner does not know is REFUSED by name: a field it would ignore could change what a queue does.
  var VERSIONS = [1, 2, 3];
  var MAX_TIMES = 1000;
  // (shipq-1) VERSION 3 adds ONE field, `relies`: the automation settings the queue was CHECKED under (the template
  // writes it from the configuration its rollback ran in) — `{options: {<lever>: <value>}, policies: {<feature id>:
  // <policy>}}`. The runner reads them when the queue would START: a setting that differs keeps it from starting, by
  // name (`relies`), and it is re-read every tick until they agree. An older runner would IGNORE the field and start
  // anyway, which is why it needs the version.
  var RELIES_KEYS = ['options', 'policies'];
  var REARMS = ['once', 'each'];

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
  // (shipq-1) the automation settings a `relies` block names, as the core reports them in force (`autoConfig`)
  function configNow() { try { return typeof T.autoConfig === 'function' ? T.autoConfig() : {}; } catch (e) { return {}; } }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

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
    var ver = q.version === undefined ? 1 : q.version;
    if (VERSIONS.indexOf(ver) < 0) errs.push('"version" must be one of ' + VERSIONS.join(' | ') + ' (got ' + JSON.stringify(q.version) + ')');
    if (q.name !== undefined && (ver < 2 || typeof q.name !== 'string' || q.name.length > 80)) errs.push('"name" needs "version": 2 and is text of at most 80 characters');
    if (q.relies !== undefined) {
      var rv = q.relies;
      if (ver < 3 || !rv || typeof rv !== 'object' || Array.isArray(rv)) errs.push('"relies" needs "version": 3 and is {options?: {…}, policies?: {…}}');
      else for (var rk in rv) {
        if (RELIES_KEYS.indexOf(rk) < 0) { errs.push('relies: unknown key "' + rk + '" (known: ' + RELIES_KEYS.join(', ') + ')'); continue; }
        if (!rv[rk] || typeof rv[rk] !== 'object' || Array.isArray(rv[rk])) { errs.push('relies.' + rk + ' must be an object'); continue; }
        var cfg = configNow();
        for (var rn in rv[rk]) {
          if (typeof rv[rk][rn] !== 'string') errs.push('relies.' + rk + '.' + rn + ' must be a string');
          if (rk === 'options' && !(rn in cfg)) errs.push('relies.options: "' + rn + '" is not an automation setting this build reports (' + Object.keys(cfg).join(', ') + ')');
          if (rk === 'policies' && !featureIds()[rn]) errs.push('relies.policies: no automation feature "' + rn + '" in this game');
        }
      }
    }
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
        if (s.times !== undefined && (ver < 2 || !(s.times === Math.floor(s.times) && s.times >= 1 && s.times <= MAX_TIMES))) errs.push(at + '"times" needs "version": 2 and is a whole number from 1 to ' + MAX_TIMES);
        // (h22) `if`: the call is made only when this holds — `startChallenge` LEAVES the challenge it is pressed inside,
        // so a plan that enters one must not press it when a reflex already entered in the tick before the hold bound
        if (s['if'] !== undefined) { var ie = typeof s['if'] === 'string' && s['if'] ? compiles(s['if']) : '"if" must be a non-empty predicate'; if (ie) errs.push(at + 'if: ' + ie); }
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
    // (shipq-1) a SHIPPED queue's condition is read where the table's stages are — once per loop, before the first
    // feature decides — so a condition that becomes true inside loop N starts the queue in loop N+1's slot
    link.loopStart = shipped().length ? loopStart : null;
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
    if (Q.owner === 'table') afterRun(Q);
    syncLink();
  }

  // ---- one queue's turn ----------------------------------------------------------------------------------------------
  function callStep(Q, s) {
    var t = target(s.fn, s.self);
    if (t.error) return { threw: t.error };
    var before = T.stateJSON(T.gameState), threw = null;
    var lx = logLink ? logLink.exec : null;
    if (lx !== null && lx && typeof lx.qbegin === 'function') lx.qbegin({ id: Q.q.id, step: Q.pc + 1, comment: s.comment || null });
    // (qedit-1) `times`: the same call N times in a row, in this one slot; a throw stops the run and aborts the queue
    var n = s.times === undefined ? 1 : s.times;
    try { for (var k = 0; k < n; k++) t.fn.apply(t.self, (s.args || []).slice()); }
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
        if (s['if'] !== undefined) {
          var cv, ce = null;
          try { cv = !!T.predicate(s['if'])(); } catch (e) { ce = String(e && e.message || e).slice(0, 160); }
          if (ce !== null) { finish(Q, 'aborted', 'step ' + (Q.pc + 1) + ': the call\'s "if" threw: ' + ce); return; }
          if (!cv) { note(Q, 'call-skipped', { fn: s.fn, 'if': s['if'] }); setLast(Q, 'did not call ' + s.fn + ': ' + s['if'] + ' is false'); Q.pc++; continue; }
        }
        var r = callStep(Q, s);
        if (r.threw) { setLast(Q, 'call ' + s.fn + ' threw: ' + r.threw); finish(Q, 'aborted', 'step ' + (Q.pc + 1) + ': the call ' + s.fn + ' threw: ' + r.threw); return; }
        setLast(Q, 'called ' + s.fn + '(' + (s.args || []).map(function (a) { return JSON.stringify(a); }).join(', ') + ')' + (s.times > 1 ? ' ×' + s.times : '') + ' — ' + (r.did ? 'it changed the game' : 'it changed nothing'));
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
      if (Q.owner === 'table') {
        // (shipq-1) a SHIPPED queue: its condition was read at the loop's start (`loopStart`); off under the profile
        // `off` and while a feature it holds is switched off — it acts only where the player has handed the
        // automation those features
        if (Q.state === 'armed') {
          if (!Q.fire) continue;
          Q.fire = false;
          var rw = reliesWhy(Q.q);
          if (rw) { if (Q.relyWhy !== rw) { Q.relyWhy = rw; note(Q, 'relies', { why: rw }); setLast(Q, 'did not start: ' + rw); } continue; }
          Q.relyWhy = null;
          Q.state = 'running'; Q.runs++; Q.sawFalse = false;
          Q.firedAt = round6(now());
          note(Q, 'trigger', { on: 'condition', run: Q.runs });
          setLast(Q, 'started (run ' + Q.runs + (Q.rearm === 'each' ? ' of at most ' + Q.cap : '') + '): its condition holds');
        }
        if (Q.state === 'running' && shippedOff(Q) === null) runQueue(Q);
        continue;
      }
      if (Q.state === 'armed') {
        var rw2 = reliesWhy(Q.q);
        if (rw2) { if (Q.relyWhy !== rw2) { Q.relyWhy = rw2; note(Q, 'relies', { why: rw2 }); setLast(Q, 'did not start: ' + rw2); } continue; }
        Q.relyWhy = null;
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

  // ---- (shipq-1) `relies`: the settings a queue was checked under, read when it would START --------------------------
  // null when they agree (or the queue states none); else the first difference, in words.
  function reliesWhy(q) {
    var r = q.relies;
    if (!r) return null;
    var cfg = configNow(), k;
    for (k in (r.options || {})) if (String(cfg[k]) !== String(r.options[k])) return 'it relies on the setting ' + k + ' = ' + r.options[k] + ', and it is ' + cfg[k];
    for (k in (r.policies || {})) {
      var fs = T.featureState ? (function () { try { return T.featureState(k); } catch (e) { return null; } })() : null;
      var pol = fs ? fs.policy : '(no such feature)';
      if (String(pol) !== String(r.policies[k])) return 'it relies on ' + k + ' deciding by "' + r.policies[k] + '", and it decides by "' + pol + '"';
    }
    return null;
  }

  // ---- (shipq-1) SHIPPED queues: the `queues` section of the game's automation table (docs/queues.md, "Shipped") -----
  // The automation core validates the section with the table and hands the entries over as `tmtLoader.autoQueues`; the
  // runner loads every ENABLED one at once, beside (never into) the player's own store. Each is `owner: 'table'`:
  //  · it STARTS when its condition holds — the entry's `when` (the table's measured boundary) AND the queue's own trigger
  //    (the template's match) — read at the LOOP's start, as a stage's `when` is; a condition that throws reads as false
  //    and says so;
  //  · it is OFF under the profile `off`, and while a feature it holds is switched off (`featureOn`): it presses the jobs
  //    of those features, so it acts only where the player handed them to the automation;
  //  · `rearm: once` (the default) runs it once per page load; `each` runs it again each time the condition turns from
  //    false to true, after a COOL-OFF (game-seconds since the last run ended) and at most `cap` times. ⛔ every run
  //    ends by releasing every hold (`finish`), and a re-armed queue starts holding nothing.
  //  · a shipped queue cannot be unloaded or overwritten; `copyShipped(id)` gives the player a copy to edit in their own
  //    store (the editor), with a new id.
  function shipped() { return loaded.filter(function (Q) { return Q.owner === 'table'; }); }
  function entries() { return Array.isArray(T.autoQueues) ? T.autoQueues.filter(function (e) { return e && e.enabled !== false; }) : []; }
  function freshShipped(e) {
    return { q: clone(e.queue), state: 'armed', pc: 0, waitFrom: null, holds: {}, firedAt: null, endedAt: null, outcome: null, last: null,
      owner: 'table', when: e.when || null, rearm: e.rearm || 'once', cap: e.rearm === 'each' ? Number(e.cap) : 1,
      coolOff: e.rearm === 'each' ? Number(e.coolOff.gs) : 0, runs: 0, sawFalse: true, coolUntil: null, fire: false, relyWhy: null, condErr: null, offWhy: null, spent: false };
  }
  function pristine(Q) { return Q.state === 'armed' && Q.runs === 0 && Q.coolUntil === null && Q.pc === 0; }
  function condSrc(Q) {
    var tr = Q.q.trigger || { on: 'start' }, parts = [];
    if (Q.when) parts.push('(' + Q.when + ')');
    if (tr.on === 'predicate') parts.push('(' + tr.when + ')');
    return parts.length ? parts.join(' && ') : 'true';
  }
  // (shipq-2) the features a queue names that this run's configuration left out: excluded, or outside its `kinds`
  function absentNamed(q) {
    var names = heldFeatures(q), rp = q && q.relies && q.relies.policies && typeof q.relies.policies === 'object' ? q.relies.policies : {};
    for (var r in rp) if (names.indexOf(r) < 0) names.push(r);
    var ex = T.autoExcluded || {}, ok = T.autoOutOfKinds || {};
    return { excluded: names.filter(function (f) { return ex[f] !== undefined; }), outOfKinds: names.filter(function (f) { return ok[f] !== undefined; }) };
  }
  function heldFeatures(q) {
    var out = [];
    var st = q && Array.isArray(q.steps) ? q.steps : [];
    for (var i = 0; i < st.length; i++) if (st[i] && st[i].do === 'hold' && Array.isArray(st[i].features)) for (var j = 0; j < st[i].features.length; j++) if (out.indexOf(st[i].features[j]) < 0) out.push(st[i].features[j]);
    return out;
  }
  /** null when a shipped queue may act; else why not, in words */
  function shippedOff(Q) {
    if (T.profileName === 'off') return 'the automation is off (profile off)';
    var hf = heldFeatures(Q.q);
    for (var i = 0; i < hf.length; i++) if (typeof link.featureOn === 'function' && !link.featureOn(hf[i])) return hf[i] + ' is switched off, and this queue takes over its job';
    return null;
  }
  function loopStart() {
    var t = now();
    for (var i = 0; i < loaded.length; i++) {
      var Q = loaded[i];
      if (Q.owner !== 'table') continue;
      Q.fire = false;
      Q.offWhy = shippedOff(Q);
      if (Q.state !== 'armed' || Q.offWhy !== null) continue;
      var v = false;
      try { v = !!T.predicate(condSrc(Q))(); if (Q.condErr !== null) { Q.condErr = null; note(Q, 'condition', { error: null }); } }
      catch (e) { var m = String(e && e.message || e).slice(0, 160); v = false; if (Q.condErr !== m) { Q.condErr = m; note(Q, 'condition', { error: m }); } }
      if (!v) { Q.sawFalse = true; continue; }
      if (!Q.sawFalse) continue;                                  // `each`: the condition must turn false first
      if (Q.coolUntil !== null && t < Q.coolUntil) continue;      // the cool-off since the last run ended
      Q.fire = true;
    }
  }
  // after a run of a shipped queue ends (done or aborted): `each` re-arms it — from the top, holding nothing — until the cap
  function afterRun(Q) {
    if (Q.rearm !== 'each') return;
    if (Q.runs >= Q.cap) { Q.spent = true; note(Q, 'spent', { runs: Q.runs, cap: Q.cap }); setLast(Q, 'ran ' + Q.runs + ' time(s), its cap: it will not start again in this page load'); return; }
    Q.holds = {};
    Q.state = 'armed'; Q.pc = 0; Q.waitFrom = null;
    Q.coolUntil = round6(now() + Q.coolOff);
    note(Q, 'rearm', { runs: Q.runs, cap: Q.cap, coolUntil: Q.coolUntil });
    setLast(Q, 'run ' + Q.runs + ' ' + Q.outcome + '; armed again: it starts when its condition turns false and then true, not before ' + Q.coolOff + ' game-s');
  }
  function loadShipped() {
    var errs = [], es = entries();
    shippedSkip = [];
    for (var i = 0; i < es.length; i++) {
      var e = es[i];
      // a configuration that leaves out a feature the queue names (held, or in its `relies.policies`) cannot play it:
      // EXCLUDED (`exclude=<id>`, or the table's `off`) or outside a `kinds=` restriction (shipq-2: the S1 anchors run
      // `kinds=reset,upgrades,buyables`) — the feature is a derived one, just not registered in this run. The queue is
      // left out, by name (`shippedSkipped`), and the run goes on: that is a configuration, not a broken table (h22's
      // and m28's legs measure under `exclude=challenges:h`). A feature the game does not derive AT ALL is still refused
      // by `validate` below.
      var named = absentNamed(e.queue);
      if (named.excluded.length || named.outOfKinds.length) {
        shippedSkip.push({ id: e.id, why: 'it ' + [named.excluded.length ? 'needs ' + named.excluded.join(', ') + ', which this configuration excludes' : null,
          named.outOfKinds.length ? 'needs ' + named.outOfKinds.join(', ') + ', which this configuration\'s kinds= leaves out' : null].filter(Boolean).join(', and ') });
        continue;
      }
      var ve = validate(e.queue);
      for (var j = 0; j < loaded.length; j++) if (loaded[j].q.id === e.queue.id) ve.push('a queue "' + e.queue.id + '" is already loaded');
      if (ve.length) { errs.push({ id: e.id, errors: ve }); continue; }
      try { T.predicate(condSrc(freshShipped(e))); } catch (x) { errs.push({ id: e.id, errors: ['when: ' + String(x && x.message || x).slice(0, 160)] }); continue; }
      var Q = freshShipped(e);
      loaded.push(Q);
      setLast(Q, 'shipped with the game\'s table; waiting for its condition');
    }
    shippedErrs = errs;
    for (var k = 0; k < errs.length; k++) if (typeof console !== 'undefined') console.warn('tmt-loader: the shipped queue ' + errs[k].id + ' was refused: ' + errs[k].errors.join('; '));
  }
  var shippedErrs = [], shippedSkip = [];

  // ---- the memory (runtimeState's `queues` block) --------------------------------------------------------------------
  // (shipq-1) a SHIPPED queue that has done nothing yet (armed, never run) is NOT written: it is the table's, and the
  // table re-creates it — so a run whose shipped queues never started writes exactly the record it wrote before.
  function getMemory() {
    var keep = loaded.filter(function (Q) { return !(Q.owner === 'table' && pristine(Q)); });
    if (!keep.length) return null;
    return { format: FORMAT, loaded: keep.map(function (Q) {
      var o = { q: JSON.parse(JSON.stringify(Q.q)), state: Q.state, pc: Q.pc, waitFrom: Q.waitFrom, holds: Object.assign({}, Q.holds),
        firedAt: Q.firedAt, endedAt: Q.endedAt, outcome: Q.outcome, last: Q.last ? Object.assign({}, Q.last) : null };
      if (Q.owner === 'table') { o.owner = 'table'; o.runs = Q.runs; o.sawFalse = Q.sawFalse; o.coolUntil = Q.coolUntil; o.spent = Q.spent; }
      return o;
    }) };
  }
  function setMemory(m) {
    var got = m && m.loaded ? m.loaded : [], byId = {}, i;
    for (i = 0; i < got.length; i++) if (got[i].owner === 'table') byId[got[i].q.id] = got[i];
    loaded = [];
    // the table's queues first, in the table's order: from the record where it has them, fresh where it does not
    var es = entries();
    for (i = 0; i < es.length; i++) {
      var shippedOk = true;
      for (var k = 0; k < shippedErrs.length; k++) if (shippedErrs[k].id === es[i].id) shippedOk = false;
      for (var k2 = 0; k2 < shippedSkip.length; k2++) if (shippedSkip[k2].id === es[i].id) shippedOk = false;
      if (!shippedOk) continue;
      var Q = freshShipped(es[i]), x0 = byId[es[i].queue.id];
      if (x0) {
        Q.state = x0.state; Q.pc = Number(x0.pc) || 0; Q.waitFrom = x0.waitFrom === null || x0.waitFrom === undefined ? null : Number(x0.waitFrom);
        Q.holds = Object.assign({}, x0.holds || {}); Q.firedAt = x0.firedAt === undefined ? null : x0.firedAt; Q.endedAt = x0.endedAt === undefined ? null : x0.endedAt;
        Q.outcome = x0.outcome === undefined ? null : x0.outcome; Q.last = x0.last || null; Q.runs = Number(x0.runs) || 0; Q.sawFalse = x0.sawFalse !== false;
        Q.coolUntil = x0.coolUntil === undefined ? null : x0.coolUntil; Q.spent = !!x0.spent;
      } else setLast(Q, 'shipped with the game\'s table; waiting for its condition');
      loaded.push(Q);
    }
    for (i = 0; i < got.length; i++) {
      var x = got[i];
      if (x.owner === 'table') continue;
      loaded.push({ q: JSON.parse(JSON.stringify(x.q)), state: x.state, pc: Number(x.pc) || 0, waitFrom: x.waitFrom === null || x.waitFrom === undefined ? null : Number(x.waitFrom),
        holds: Object.assign({}, x.holds || {}), firedAt: x.firedAt === undefined ? null : x.firedAt, endedAt: x.endedAt === undefined ? null : x.endedAt,
        outcome: x.outcome === undefined ? null : x.outcome, last: x.last || null, relyWhy: null });
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
    var Q = { q: JSON.parse(JSON.stringify(q)), state: 'armed', pc: 0, waitFrom: null, holds: {}, firedAt: null, endedAt: null, outcome: null, last: null, relyWhy: null };
    loaded.push(Q);
    setLast(Q, 'loaded; waiting for its trigger (' + ((q.trigger && q.trigger.on) || 'start') + ')');
    note(Q, 'load', { steps: q.steps.length, trigger: (q.trigger && q.trigger.on) || 'start', from: q.source === undefined ? null : q.source });
    syncLink();
    return { ok: true, id: q.id, errors: [] };
  }
  function unload(id) {
    for (var i = 0; i < loaded.length; i++) {
      if (loaded[i].q.id !== id) continue;
      if (loaded[i].owner === 'table') return { ok: false, id: id, error: 'queue "' + id + '" ships with the game\'s automation table and cannot be unloaded — copyShipped("' + id + '") gives you a copy to edit' };
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
    if (s.do === 'call') return s.fn + '(' + (s.args || []).map(function (a) { return JSON.stringify(a); }).join(', ') + ')' + (s.times > 1 ? ' ×' + s.times : '');
    if (s.do === 'wait') return 'until ' + s.until + ' (at most ' + s.timeout.gs + ' s, then ' + s.onTimeout + ')';
    if (s.do === 'hold' || s.do === 'release') return (s.features || ['every hold of this queue']).join(', ');
    return s.text || '';
  }
  function status() {
    // (shipq-1) the queues loaded by hand (or by the editor) first, then the table's — a caller that loaded ONE queue
    // finds it at [0], as before the table could ship any
    var order = loaded.filter(function (Q) { return Q.owner !== 'table'; }).concat(shipped());
    return { ready: true, format: FORMAT, slot: [T.auLayer || 'au', 'queue'], queues: order.map(function (Q) {
      var cur = Q.state === 'running' || Q.state === 'armed' ? Q.q.steps[Q.pc] : null;
      return { id: Q.q.id, state: Q.state, stateText: (STATE_TEXT[Q.state] || Q.state) + (Q.outcome && Q.state !== 'running' && Q.state !== 'armed' ? ' (' + Q.outcome + ')' : ''),
        steps: Q.q.steps.length, pc: Q.pc, comment: Q.q.comment || null, source: Q.q.source === undefined ? null : Q.q.source,
        current: cur ? { index: Q.pc + 1, 'do': cur.do, text: stepText(cur), comment: cur.comment || null } : null,
        waiting: Q.waitFrom === null ? null : round6(now() - Q.waitFrom),
        // (qedit-1) the run-status view: what a running wait is waiting for, and how long it has left before its timeout
        wait: cur && cur.do === 'wait' && Q.state === 'running' ? { until: cur.until, timeout: Number(cur.timeout.gs), onTimeout: cur.onTimeout,
          waited: Q.waitFrom === null ? 0 : round6(now() - Q.waitFrom), left: round6(Math.max(0, Number(cur.timeout.gs) - (Q.waitFrom === null ? 0 : now() - Q.waitFrom))) } : null,
        name: typeof Q.q.name === 'string' ? Q.q.name : null, trigger: Q.q.trigger || { on: 'start' },
        holds: Object.keys(Q.holds).sort(), firedAt: Q.firedAt, endedAt: Q.endedAt, outcome: Q.outcome, last: Q.last ? Q.last.text : null,
        relies: Q.q.relies || null, reliesWhy: Q.relyWhy || null, shipped: Q.owner === 'table' ? shippedView(Q) : null };
    }) };
  }
  // (shipq-1) the readout's words for a shipped queue: armed (waiting for its condition), running, done — and why it is not
  function shippedView(Q) {
    var t = now(), cooling = Q.state === 'armed' && Q.coolUntil !== null && t < Q.coolUntil;
    Q.offWhy = shippedOff(Q);   // read now: under the profile `off` the loop's hook does not run at all
    var phase = Q.state === 'running' ? 'running' : Q.state === 'armed' ? (Q.offWhy ? 'off' : Q.relyWhy ? 'relies' : cooling ? 'cooling' : (Q.runs && !Q.sawFalse) ? 'rearmed' : 'armed') : Q.spent ? 'spent' : Q.state;
    var words = { off: 'not running — ' + Q.offWhy, relies: 'its condition holds, but it does not start — ' + Q.relyWhy, cooling: 'armed again, cooling off: ' + round6(Q.coolUntil - t) + ' game-s left',
      rearmed: 'armed again — it starts the next time its condition turns false and then true', armed: 'armed — waiting for its condition', running: 'running',
      done: 'done', aborted: 'stopped (' + Q.outcome + ')', spent: 'done — ran ' + Q.runs + ' time(s), its cap' }[phase] || phase;
    if (Q.condErr) words += ' — ⚠ its condition could not be read (' + Q.condErr + '), so it reads as false';
    return { phase: phase, text: words, when: Q.when, condition: condSrc(Q), rearm: Q.rearm, cap: Q.cap, coolOff: Q.coolOff, runs: Q.runs,
      coolLeft: cooling ? round6(Q.coolUntil - t) : null, conditionError: Q.condErr };
  }
  /** (shipq-1) a COPY of a shipped queue for the player's own store: a new id, a name that says where it came from. It is
   *  never written anywhere by the runner — the editor (`tmtLoader.qedit`) is what stores it. */
  function copyShipped(id) {
    for (var i = 0; i < loaded.length; i++) {
      var Q = loaded[i];
      if (Q.q.id !== id || Q.owner !== 'table') continue;
      var c = clone(Q.q);
      c.id = (c.id + '-copy').slice(0, 80);
      c.version = Math.max(2, c.version || 1);
      c.name = ('copy of ' + (Q.q.name || Q.q.id)).slice(0, 80);
      if (Q.when) {
        var tw = c.trigger && c.trigger.on === 'predicate' ? c.trigger.when : null;
        c.trigger = { on: 'predicate', when: tw ? '(' + Q.when + ') && (' + tw + ')' : Q.when };
      }
      return { ok: true, id: c.id, queue: c };
    }
    return { ok: false, id: id, error: 'no shipped queue "' + id + '"' };
  }

  T.queues = { ready: true, format: FORMAT, load: load, unload: unload, status: status, validate: function (q) { return validate(q); },
    copyShipped: copyShipped, shippedErrors: function () { return clone(shippedErrs); }, shippedSkipped: function () { return clone(shippedSkip); } };
  loadShipped();
  syncLink();
})();
