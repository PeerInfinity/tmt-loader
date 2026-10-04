// loader/tmt-speed.js — THE SPEED CONTROLS (speed-1; docs/speed.md): pause, ×1 / ×2 / ×10 / max, and a fast-forward to a
// target (an amount of game time, a condition, a ladder mark), in the game's own ticks by default.
//
// A CLASSIC script, like loader/options.js: it runs in the global lexical scope and reads the engine's globals as bare
// identifiers. ⛔ LAZY: the page inserts it only when the player presses "Speed controls" in the game's options tab (or
// has left the controls open in this browser, `tmt-loader:<id>:ui.speed`), or when a runner calls
// `tmtLoader.fetchSpeed()`. A page that never does either requests nothing new and stores nothing new (gate G1).
//
// ⚖ THE RULINGS (user, 2026-10-03):
//   · FAITHFUL BY DEFAULT. A faithful tick is the harness's tick — `tmtLoader.tick(0.05)`, i.e. `updateTemp();
//     gameLoop(0.05); fixNaNs()` — run back to back, in chunks that fit one animation frame. The harness at `diff 0.05`
//     is the page's reference (docs/harness.md, THE TICK POLICY), so a faithful fast-forward of N ticks lands on the
//     SAME state as the harness's N ticks (gate S-H1). It is not the engine's own interval, whose diff is variable
//     real time; it is the tick every pinned 0.05 number was measured at.
//   · COARSE IS OPTIONAL AND LABELLED: bigger fixed ticks, from a few named steps, shown everywhere as "approximate —
//     results can differ from normal play". ⛔ It does NOT use `player.devSpeed`: that is the ENGINE's key, in the
//     SAVE, and the speed is never saved. Coarse mode is simply `tick(step)` with its own diff.
//   · ×1 IS THE ENGINE'S OWN LOOP, UNTOUCHED. Any other speed HOLDS that one interval (the timer recorder's `hold`;
//     the autosave, the canvas flag and every component timer keep running) and drives the ticks itself: ×N = N
//     ticks per 50 ms of real time, max = as many as one frame's budget allows, pause = none.
//   · ON THE WAY BACK TO ×1, `player.time` IS SET TO NOW — and it is kept at now on every frame while the loop is
//     held, which is the ENGINE's own write (its loop does `player.time = now` every tick). So neither a return to
//     normal nor a reload in the middle of a fast-forward sees the fast-forward (or a pause) as offline time.
//   · OFFLINE CATCH-UP (`player.offTime`) IS LEFT TO THE ENGINE: a fast-forward neither consumes it nor adds to it
//     (the harness's tick never reads it either, which is what keeps faithful = harness). Pending catch-up resumes
//     in the engine's own loop at ×1. The decision and its reasons: docs/speed.md.
//   · NOTHING HERE WRITES `player` except `player.time` (above). The speed lives in this file's memory only; a reload
//     is always ×1.
(function () {
  'use strict';
  var T = window.tmtLoader;
  if (!T || T.speed || typeof T.tick !== 'function') return;
  var G = window;

  var FAITHFUL = 0.05;                       // the page's reference tick (docs/harness.md)
  var COARSE_STEPS = [0.25, 1, 5];           // the approximate steps a player can pick, game-seconds per tick
  var SPEEDS = [0, 1, 2, 10, 'max'];
  var BUDGET_MS = 40;                        // per frame: one ptr tick costs ~7 ms in the page (updateTemp), so a 16 ms budget ran ONE tick a frame — measured, docs/speed.md
  var CAP_DEFAULT = 3600;                    // a condition / mark target stops after this much game time
  var PREF = 'ui.speed';                     // the ONE key this file stores: whether the controls are left open

  // ---- the engine's globals, read as bare identifiers ---------------------------------------------------------------
  var ended = new Function("try { var e = (typeof gameEnded !== 'undefined' && gameEnded) || (typeof tmp !== 'undefined' && tmp && tmp.gameEnded); return !!e && !(typeof player !== 'undefined' && player && player.keepGoing); } catch (e) { return false; }");
  // what the engine's own loop does besides the tick, for the SCREEN only (2.7: the canvas, the width, the tab formats,
  // popups and particles in real time). Every name is guarded: an engine without it simply does not have that line.
  var displayExtras = new Function('rd', [
    "try { if (typeof needCanvasUpdate !== 'undefined' && needCanvasUpdate && typeof resizeCanvas === 'function') resizeCanvas(); } catch (e) {}",
    "try { if (typeof updateWidth === 'function') updateWidth(); } catch (e) {}",
    "try { if (typeof updateTabFormats === 'function') updateTabFormats(); } catch (e) {}",
    "try { if (typeof adjustPopupTime === 'function') adjustPopupTime(rd); } catch (e) {}",
    "try { if (typeof updateParticles === 'function') updateParticles(rd); } catch (e) {}",
  ].join('\n'));
  function setTime() { try { if (typeof player !== 'undefined' && player) player.time = Date.now(); } catch (e) { /* */ } }
  function compile(src) {
    if (typeof T.predicate === 'function') return T.predicate(src);
    return new Function('return (' + src + ')');
  }
  function fmt(x) { return typeof format === 'function' ? safe(function () { return format(x); }, String(x)) : String(x); }
  function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
  function round(x, k) { var p = Math.pow(10, k || 0); return Math.round(x * p) / p; }
  function gsText(s) {
    s = Number(s) || 0;
    if (s < 120) return round(s, s < 10 ? 2 : 1) + ' s';
    if (s < 7200) return round(s / 60, 1) + ' min';
    if (s < 172800) return round(s / 3600, 1) + ' h';
    return round(s / 86400, 1) + ' days';
  }

  // ---- the engine's loop: found once, held while any speed but ×1 is in force ---------------------------------------
  // The one interval whose callback calls `gameLoop(` — found by SOURCE through the timer recorder, so no engine's
  // variable name is assumed. Measured on the roster by gate S-L1. Where none is found, every interval is paused
  // instead (T.pause) and the status says so: the controls still work, the autosave waits.
  var loop = null;
  function findLoop() {
    if (loop) return loop;
    var ids = [], how = 'none';
    if (T.timers && typeof T.timers.find === 'function') { ids = T.timers.find(/\bgameLoop\s*\(/).map(function (x) { return x.id; }); how = ids.length ? 'found' : 'pause-all'; }
    else how = 'pause-all';
    loop = { ids: ids, how: how };
    return loop;
  }
  var holding = false, pausedAll = false;
  function hold() {
    if (holding) return;
    var L = findLoop();
    if (L.how === 'found') for (var i = 0; i < L.ids.length; i++) T.timers.hold(L.ids[i]);
    else if (T.timers && !T.timers.paused && typeof T.pause === 'function') { T.pause(); pausedAll = true; }
    holding = true;
    startClock();
  }
  function release() {
    if (!holding) return;
    setTime();                     // ⛔ the engine must not see the fast-forward (or the pause) as a real-time gap
    var L = findLoop();
    if (L.how === 'found') for (var i = 0; i < L.ids.length; i++) T.timers.release(L.ids[i]);
    else if (pausedAll && typeof T.resume === 'function') { T.resume(); pausedAll = false; }
    holding = false;
    stopClock();
  }
  // while held, `player.time` is kept at now — four times a second and on every driven frame — so a reload, or an
  // autosave read back later, never credits the held time as offline progress
  var clockId = null;
  function startClock() { if (clockId === null) clockId = G.setInterval(setTime, 250); setTime(); }
  function stopClock() { if (clockId !== null) { G.clearInterval(clockId); clockId = null; } }

  // ---- (speed-2) A SAVE THAT CARRIES `player.devSpeed` ----------------------------------------------------------------
  // The engines multiply the tick by `player.devSpeed` when the save has it set. WHERE is read from their SOURCE, as the
  // loop is found: 2.2.1 does it in its interval AND inside `gameLoop` (so even the faithful `gameLoop(0.05)` is N×
  // bigger, and the game's own speed is N²), 2.7 in its interval only (faithful ticks stay 0.05, the game's own loop
  // runs N× faster). Either way a faithful fast-forward is not how THIS save plays, and the panel says so.
  // ⛔ The loader never writes it: it is a setting inside the player's save.
  var devWhere = null;
  function devSpeedWhere() {
    if (devWhere) return devWhere;
    var inTick = safe(function () { return typeof gameLoop === 'function' && /\bdevSpeed\b/.test(String(gameLoop)); }, false);
    var L = findLoop(), inLoop = false;
    if (L.how === 'found' && typeof T.timers.find === 'function') inLoop = T.timers.find(/\bdevSpeed\b/).some(function (x) { return L.ids.indexOf(x.id) >= 0; });
    devWhere = { inTick: inTick, inLoop: inLoop };
    return devWhere;
  }
  function devSpeedNow() {
    var v = safe(function () { return player.devSpeed; }, undefined), n = Number(v);
    if (!v || n === 1) return null;              // the engine's own test is `if (player.devSpeed)`
    var w = devSpeedWhere();
    if (!w.inTick && !w.inLoop) return null;     // an engine that never reads it: the key is inert
    return { n: n, inTick: w.inTick, inLoop: w.inLoop };
  }
  function devSpeedText(d) {
    var tail = ' It is a setting inside your save; the loader does not change it.';
    if (d.inTick) return 'This save has the game\'s developer speed set (×' + d.n + '), so even faithful ticks are ' + d.n + '× bigger — results differ from normal play.' + tail;
    return 'This save has the game\'s developer speed set (×' + d.n + '): the game\'s own loop runs ' + d.n + '× faster, while faithful ticks stay 0.05 s — so a fast-forward differs from how this save plays.' + tail;
  }

  // ---- state ----------------------------------------------------------------------------------------------------------
  var speed = 1;                 // 0 (pause) | 1 | 2 | 10 | 'max'
  var mode = 'faithful';         // 'faithful' | 'coarse'
  var coarseStep = 1;
  var target = null;             // the running fast-forward, or null
  var lastStop = null;           // the last one's outcome
  var owe = 0, lastFrame = 0, rafId = null;
  var meter = { t0: 0, ticks0: 0, gs0: 0, tps: 0, gsps: 0, samples: [] };
  var stats = { frames: 0, ticks: 0, gs: 0, maxFrameMs: 0, runs: 0, holds: 0 };
  var listeners = [];
  function step() { return mode === 'coarse' ? coarseStep : FAITHFUL; }
  function pace() { return target ? target.pace : speed; }

  function want() { return target !== null || (speed !== 1); }
  function sync() {
    if (want()) { hold(); schedule(); } else { release(); cancel(); }
    notify();
  }
  function schedule() {
    if (rafId !== null) return;
    lastFrame = lastFrame || performance.now();
    rafId = G.requestAnimationFrame(frame);
  }
  function cancel() { if (rafId !== null) { G.cancelAnimationFrame(rafId); rafId = null; } lastFrame = 0; owe = 0; }

  // ONE FRAME: the ticks this frame owes, inside the budget, each checked against the target; then the screen.
  function frame(now) {
    rafId = null;
    if (!want()) return;
    now = performance.now();
    var dt = Math.min(Math.max(now - lastFrame, 0), 250);
    lastFrame = now;
    setTime();
    var p = pace(), n = 0, limit;
    if (p === 'max') limit = Infinity;
    else { owe += dt / 50 * p; limit = Math.floor(owe); }
    var deadline = now + BUDGET_MS, d = step();
    try {
      while (n < limit) {
        if (ended()) { finish('ended'); break; }
        T.tick(d, 1);
        n++; stats.ticks++; stats.gs += d;
        if (target) {
          target.ticks++; target.gs = round(target.gs + d, 9);
          if (checkTarget()) break;
        }
        if (performance.now() > deadline) break;
      }
    } catch (e) {
      if (target) finish('error', e); else { lastStop = { why: 'error', text: 'The game threw while speeding up: ' + msg(e) + '. Back to normal speed.', at: Date.now() }; speed = 1; }
    }
    if (p !== 'max') { owe -= n; if (owe > 2 * Math.max(1, Number(p) || 1)) owe = 2 * Math.max(1, Number(p) || 1); }   // a backlog is dropped, never paid later in a burst
    stats.frames++;
    var spent = performance.now() - now;
    if (spent > stats.maxFrameMs) stats.maxFrameMs = round(spent, 2);
    measure(now, n, n * d);
    if (n) displayExtras(dt / 1000);
    if (want()) schedule(); else sync();
    notify();
  }
  function measure(now, n, gs) {
    meter.samples.push([now, n, gs]);
    while (meter.samples.length && now - meter.samples[0][0] > 1000) meter.samples.shift();
    var span = meter.samples.length ? now - meter.samples[0][0] : 0, tn = 0, tg = 0;
    for (var i = 1; i < meter.samples.length; i++) { tn += meter.samples[i][1]; tg += meter.samples[i][2]; }
    meter.tps = span > 100 ? round(tn * 1000 / span, 0) : meter.tps;
    meter.gsps = span > 100 ? round(tg * 1000 / span, 2) : meter.gsps;
  }
  function msg(e) { return String(e && e.message || e).slice(0, 160); }

  // ---- targets -------------------------------------------------------------------------------------------------------
  function checkTarget() {
    var t = target;
    if (t.kind === 'gs') { if (t.ticks >= t.of) return finish('reached'); return false; }
    var ok = false;
    try { ok = !!t.fn(); } catch (e) { t.throws++; t.lastThrow = msg(e); ok = false; }
    if (ok) return finish('reached');
    if (t.gs >= t.cap - 1e-9) return finish('cap');
    return false;
  }
  var resolveRun = null;
  function finish(why, err) {
    var t = target;
    if (!t) return true;
    target = null;
    var text;
    var where = gsText(t.gs) + ' of game time (' + t.ticks.toLocaleString('en-US') + ' ticks)';
    if (why === 'reached') text = (t.kind === 'gs' ? 'Done: ' : 'Reached ' + t.label + ' after ') + where + '.';
    else if (why === 'cap') text = 'Stopped at the limit (' + gsText(t.cap) + ') without reaching ' + t.label + '.';
    else if (why === 'stopped') text = 'Stopped by you after ' + where + '.';
    else if (why === 'ended') text = 'The game has ended; stopped after ' + where + '.';
    else if (why === 'error') text = 'Stopped: the game threw (' + msg(err) + ') after ' + where + '.';
    else text = 'Stopped (' + why + ') after ' + where + '.';
    if (t.throws) text += ' The condition threw ' + t.throws + ' time' + (t.throws === 1 ? '' : 's') + ' (' + t.lastThrow + ') and was read as false.';
    if (t.mode === 'coarse') text += ' Approximate ticks of ' + t.step + ' s: results can differ from normal play.';
    lastStop = { why: why, text: text, at: Date.now(), kind: t.kind, label: t.label, ticks: t.ticks, gs: t.gs, mode: t.mode, step: t.step, throws: t.throws, lastThrow: t.lastThrow, error: err ? msg(err) : null };
    // (whole-1) the run timeline: the fast-forward, at the game time it started from
    try { if (T.timeline && typeof T.timeline.note === 'function') T.timeline.note('ff', { why: why, label: t.label, target: t.kind, src: t.src || '', name: t.markName || '', gs: t.gs, ticks: t.ticks, mode: t.mode, step: t.step, startGs: t.startGs }); } catch (e) { /* the record never costs the run */ }
    var r = resolveRun; resolveRun = null;
    speed = t.before;          // the speed in force before the run comes back (×1 = the engine's own loop)
    sync();
    if (r) r(lastStop);
    return true;
  }

  // run({gs}|{ticks}|{until, cap}|{mark, cap}, {pace}) → a promise of the outcome. One run at a time.
  function run(spec) {
    spec = spec || {};
    if (target) return Promise.resolve({ why: 'refused', text: 'A fast-forward is already running — stop it first.' });
    var d = step(), t = { kind: null, of: 0, cap: 0, ticks: 0, gs: 0, throws: 0, lastThrow: null, fn: null, label: '', mode: mode, step: d,
      before: speed === 0 ? 0 : speed, pace: spec.pace || (speed === 2 || speed === 10 ? speed : 'max'), startedAt: Date.now(), startTicks: T.ticks, startGs: Number(player && player.timePlayed) || 0 };
    if (SPEEDS.indexOf(t.pace) < 1) return Promise.resolve({ why: 'refused', text: 'pace must be 1, 2, 10 or max' });
    if (spec.ticks !== undefined || spec.gs !== undefined) {
      var ticks = spec.ticks !== undefined ? Math.round(Number(spec.ticks)) : Math.round(Number(spec.gs) / d);
      if (!(ticks > 0) || !isFinite(ticks)) return Promise.resolve({ why: 'refused', text: 'An amount of game time above 0 is needed.' });
      t.kind = 'gs'; t.of = ticks; t.label = gsText(ticks * d) + ' of game time';
    } else if (spec.until !== undefined || spec.mark !== undefined) {
      var src = spec.until, label;
      if (spec.mark !== undefined) {
        var L = T.ladder, m = L && L.marks ? L.marks.filter(function (x) { return x.id === spec.mark; })[0] : null;
        if (!m) return Promise.resolve({ why: 'refused', text: 'This game has no ladder mark "' + spec.mark + '" (fetch the ladder first).' });
        src = m.predicate; label = 'the mark ' + m.id + ' (' + m.name + ')'; t.markName = String(m.name || '').replace(/\*/g, '');
      } else label = 'the condition ' + src;
      if (typeof src !== 'string' || !src.trim()) return Promise.resolve({ why: 'refused', text: 'Type a condition first.' });
      try { t.fn = compile(src); } catch (e) { return Promise.resolve({ why: 'refused', text: 'The condition is not something the game understands: ' + msg(e) }); }
      t.kind = spec.mark !== undefined ? 'mark' : 'until'; t.src = src; t.label = label;
      t.cap = spec.cap !== undefined ? Number(spec.cap) : CAP_DEFAULT;
      if (!(t.cap > 0)) return Promise.resolve({ why: 'refused', text: 'The limit must be above 0.' });
      var now0 = false; try { now0 = !!t.fn(); } catch (e) { t.throws++; t.lastThrow = msg(e); }
      if (now0) { lastStop = { why: 'already', text: label.charAt(0).toUpperCase() + label.slice(1) + ' already holds — nothing to do.', at: Date.now(), kind: t.kind, label: label, ticks: 0, gs: 0 }; notify(); return Promise.resolve(lastStop); }
    } else return Promise.resolve({ why: 'refused', text: 'run({gs}|{ticks}|{until, cap}|{mark, cap})' });
    if (ended()) { lastStop = { why: 'ended', text: 'The game has ended; nothing to fast-forward.', at: Date.now(), ticks: 0, gs: 0 }; notify(); return Promise.resolve(lastStop); }
    target = t; stats.runs++;
    var p = new Promise(function (res) { resolveRun = res; });
    sync();
    return p;
  }
  function stop() { if (target) finish('stopped'); return lastStop; }
  function setSpeed(x) {
    if (x === 'pause') x = 0;
    if (typeof x === 'string' && x !== 'max') x = Number(x);
    if (SPEEDS.indexOf(x) < 0) throw new Error('speed must be one of 0 (pause), 1, 2, 10, max');
    if (target) { if (x === 0 || x === 1) { stop(); speed = x; } else target.pace = x; }
    else speed = x;
    owe = 0;
    sync();
    return status();
  }
  function setMode(m, st) {
    if (m !== 'faithful' && m !== 'coarse') throw new Error('mode must be faithful or coarse');
    if (target) throw new Error('stop the fast-forward before changing the tick');
    if (m === 'coarse') { var s = st === undefined ? coarseStep : Number(st); if (COARSE_STEPS.indexOf(s) < 0) throw new Error('a coarse step is one of ' + COARSE_STEPS.join(', ')); coarseStep = s; }
    mode = m;
    notify();
    return status();
  }
  function status() {
    var t = target;
    return {
      speed: speed, pace: pace(), mode: mode, approximate: mode === 'coarse', step: step(), held: holding,
      loop: findLoopInfo(), ticksPerSec: meter.tps, gameSecondsPerSec: meter.gsps,
      target: t ? { kind: t.kind, label: t.label, ticks: t.ticks, gs: t.gs, of: t.of, cap: t.cap, src: t.src || null, throws: t.throws, lastThrow: t.lastThrow,
        frac: t.kind === 'gs' ? t.ticks / t.of : Math.min(1, t.gs / t.cap), pace: t.pace } : null,
      last: lastStop, offline: safe(function () { return player.offTime ? Number(player.offTime.remain) || 0 : 0; }, 0),
      devSpeed: devSpeedNow(),
    };
  }
  function findLoopInfo() { var L = findLoop(); return { how: L.how, ids: L.ids.slice() }; }
  function notify() { for (var i = 0; i < listeners.length; i++) try { listeners[i](); } catch (e) { /* */ } }

  T.speed = {
    FAITHFUL: FAITHFUL, COARSE_STEPS: COARSE_STEPS.slice(), SPEEDS: SPEEDS.slice(), CAP_DEFAULT: CAP_DEFAULT,
    status: status, setSpeed: setSpeed, setMode: setMode, run: run, stop: stop,
    stats: function () { return Object.assign({}, stats, { held: holding, pausedAll: pausedAll, clock: clockId !== null }); },
    onChange: function (fn) { listeners.push(fn); },
    prefKey: function () { return T.storage && T.storage.prefix ? T.storage.prefix + PREF : null; },
  };

  // =====================================================================================================================
  // THE CONTROLS — a small panel over the game, in plain words, in the game's own colours (`--color` / `--background`,
  // which every engine on the roster defines). Opened from the options tab; remembered open in `ui.speed`.
  // ⛔ NO `white-space: nowrap` anywhere in it, and it wraps to fit a 390 px phone (gate S-P1).
  // =====================================================================================================================
  var ID = 'tmt-speed';
  var THEMED = 'color:var(--color,#dfdfdf);background-color:var(--background,#0f0f0f)';
  var CSS = [
    '#' + ID + '{position:fixed;right:8px;bottom:8px;z-index:2147483000;' + THEMED + ';border:1px solid rgba(127,178,217,.55);border-radius:6px;',
    'padding:6px 8px;max-width:min(440px,calc(100vw - 16px));max-height:calc(100vh - 16px - var(--tmt-navbar-h,0px));overflow-y:auto;box-sizing:border-box;font:13px/1.35 system-ui,sans-serif;text-align:left;',
    'box-shadow:0 2px 10px rgba(0,0,0,.35);overflow-wrap:anywhere;word-break:break-word}',
    'html.tmt-navbar #' + ID + '{bottom:calc(var(--tmt-navbar-h,56px) + 8px)}',
    '#' + ID + ' .tmts-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:2px 0;min-width:0}',
    // the game's own sheet styles bare elements (centred text, its font): the panel says left, and sizes its own
    '#' + ID + ',#' + ID + ' *{text-align:left}',
    '#' + ID + ' button,#' + ID + ' input:not([type=radio]),#' + ID + ' select{' + THEMED + ';color-scheme:dark;border:1px solid rgba(127,178,217,.45);border-radius:3px;font:inherit;padding:2px 7px;min-height:26px;max-width:100%;box-sizing:border-box}',
    '#' + ID + ' button{cursor:pointer}',
    '#' + ID + ' button[aria-pressed="true"]{background-color:rgba(127,178,217,.35);font-weight:bold}',
    '#' + ID + ' input.tmts-num{width:5em}',
    '#' + ID + ' input.tmts-cond{flex:1 1 12em;min-width:0;font-family:monospace}',
    '#' + ID + ' select{min-width:0}',
    '#' + ID + ' input[type=radio]{flex:0 0 auto;margin:0 2px 0 0}',
    '#' + ID + ' .tmts-row>label{flex:1 1 12em;min-width:0}',
    '#' + ID + ' select.tmts-mark{flex:1 1 10em}',
    '#' + ID + ' .tmts-read{opacity:.9;flex:1 1 10em;min-width:0}',
    '#' + ID + ' .tmts-approx{color:#e7b75a}',
    '#' + ID + ' .tmts-dev{color:#e7b75a;font-size:.92em}',
    '#' + ID + ' .tmts-bar{height:6px;flex:1 1 8em;min-width:4em;border:1px solid rgba(127,178,217,.45);border-radius:3px;overflow:hidden}',
    '#' + ID + ' .tmts-bar>div{display:block;margin:0;height:100%;background:rgba(127,178,217,.75);width:0}',   // margin 0: the game centres a bare div
    '#' + ID + ' .tmts-more{border-top:1px solid rgba(127,178,217,.3);margin-top:4px;padding-top:4px}',
    '#' + ID + ' .tmts-note{opacity:.75;font-size:.9em}',
    '#' + ID + ' .tmts-last{font-size:.92em}',
    '#' + ID + ' .tmts-x{margin-left:auto}',
  ].join('');
  var ui = null;
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === 'text') e.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  var FAITH_WORDS = 'Faithful: the game\'s own 0.05 s ticks — the same result as playing normally';
  var SPEED_WORDS = { 0: 'Pause', 1: '×1', 2: '×2', 10: '×10', max: 'Max' };
  var UNITS = [['s', 1, 'seconds'], ['min', 60, 'minutes'], ['h', 3600, 'hours']];
  function build() {
    if (!document.getElementById(ID + '-style')) { var st = el('style', { id: ID + '-style' }); st.textContent = CSS; document.head.appendChild(st); }
    var root = el('div', { id: ID, role: 'region', 'aria-label': 'Speed controls' });
    // the game's hotkeys listen on the document: typing "p" in a field here must never prestige
    ['keydown', 'keyup', 'keypress'].forEach(function (k) { root.addEventListener(k, function (e) { e.stopPropagation(); }); });
    var speedBtns = {};
    var row1 = el('div', { class: 'tmts-row' }, [el('b', { text: 'Speed' })]);
    SPEEDS.forEach(function (s) {
      var b = el('button', { type: 'button', 'data-speed': String(s), title: s === 0 ? 'Pause the game' : s === 1 ? 'Normal speed: the game\'s own loop' : s === 'max' ? 'As fast as this device allows' : s + ' times normal speed', text: SPEED_WORDS[s],
        onclick: function () { try { setSpeed(s); } catch (e) { /* */ } } });
      speedBtns[s] = b; row1.appendChild(b);
    });
    var moreBtn = el('button', { type: 'button', class: 'tmts-morebtn', 'aria-expanded': 'false', text: 'Fast-forward…', onclick: function () { showMore(!ui.moreOpen); } });
    row1.appendChild(moreBtn);
    row1.appendChild(el('button', { type: 'button', class: 'tmts-x', title: 'Close the speed controls (the game goes back to normal speed)', 'aria-label': 'Close', text: '✕', onclick: function () { close(); } }));
    var read = el('div', { class: 'tmts-read' });
    var row2 = el('div', { class: 'tmts-row' }, [read]);
    var bar = el('div', { class: 'tmts-bar', hidden: '' }, [el('div')]);
    var stopBtn = el('button', { type: 'button', class: 'tmts-stop', hidden: '', text: 'Stop', onclick: function () { stop(); } });
    var row3 = el('div', { class: 'tmts-row' }, [bar, stopBtn]);
    var last = el('div', { class: 'tmts-last' });
    var dev = el('div', { class: 'tmts-dev', role: 'note', hidden: '' });

    // the targets
    var amt = el('input', { class: 'tmts-num', type: 'number', min: '0', step: 'any', value: '10', 'aria-label': 'Amount of game time' });
    var unit = el('select', { 'aria-label': 'Unit' }); UNITS.forEach(function (u) { var o = el('option', { value: String(u[1]), text: u[2] }); if (u[0] === 'min') o.selected = true; unit.appendChild(o); });
    var goT = el('button', { type: 'button', class: 'tmts-go-gs', text: 'Go', onclick: function () { run({ gs: Number(amt.value) * Number(unit.value) }); } });
    var cond = el('input', { class: 'tmts-cond', type: 'text', placeholder: 'a condition, e.g. player.points.gte(1e10)', 'aria-label': 'Condition', spellcheck: 'false' });
    var capA = el('input', { class: 'tmts-num', type: 'number', min: '0', step: 'any', value: '1', 'aria-label': 'Limit' });
    var capU = el('select', { 'aria-label': 'Limit unit' }); UNITS.forEach(function (u) { var o = el('option', { value: String(u[1]), text: u[2] }); if (u[0] === 'h') o.selected = true; capU.appendChild(o); });
    var goC = el('button', { type: 'button', class: 'tmts-go-until', text: 'Go', onclick: function () { run({ until: cond.value, cap: Number(capA.value) * Number(capU.value) }); } });
    var markSel = el('select', { class: 'tmts-mark', 'aria-label': 'Ladder mark' });
    var goM = el('button', { type: 'button', class: 'tmts-go-mark', text: 'Go', onclick: function () { if (markSel.value) run({ mark: markSel.value, cap: Number(capA.value) * Number(capU.value) }); } });
    var markRow = el('div', { class: 'tmts-row tmts-markrow', hidden: '' }, [el('span', { text: 'Until the mark' }), markSel, goM]);
    var faith = el('input', { type: 'radio', name: ID + '-mode', value: 'faithful', id: ID + '-faithful' }); faith.checked = true;
    var coarse = el('input', { type: 'radio', name: ID + '-mode', value: 'coarse', id: ID + '-coarse' });
    var stepSel = el('select', { 'aria-label': 'Approximate tick' }); COARSE_STEPS.forEach(function (s) { var o = el('option', { value: String(s), text: s + ' s ticks' }); if (s === coarseStep) o.selected = true; stepSel.appendChild(o); });
    function modeChange() { try { setMode(coarse.checked ? 'coarse' : 'faithful', Number(stepSel.value)); } catch (e) { faith.checked = mode === 'faithful'; coarse.checked = mode === 'coarse'; } }
    faith.addEventListener('change', modeChange); coarse.addEventListener('change', modeChange); stepSel.addEventListener('change', function () { if (coarse.checked) modeChange(); });
    var faithLabel = el('label', { for: ID + '-faithful', text: FAITH_WORDS });
    var more = el('div', { class: 'tmts-more', hidden: '' }, [
      el('div', { class: 'tmts-row' }, [el('span', { text: 'Fast-forward' }), amt, unit, el('span', { text: 'of game time' }), goT]),
      el('div', { class: 'tmts-row' }, [el('span', { text: 'Until' }), cond, goC]),
      markRow,
      el('div', { class: 'tmts-row' }, [el('span', { text: '…stopping after at most' }), capA, capU, el('span', { text: 'of game time' })]),
      el('div', { class: 'tmts-row' }, [faith, faithLabel]),
      el('div', { class: 'tmts-row' }, [coarse, el('label', { for: ID + '-coarse', class: 'tmts-approx', text: 'Approximate: bigger ticks, much faster — results can differ from normal play' }), stepSel]),
      el('div', { class: 'tmts-note', text: 'Added by tmt-loader. Nothing here is saved in the game; a reload is always normal speed. Fast-forward runs while this tab is visible.' }),
    ]);
    root.append(row1, row2, dev, row3, last, more);
    ui = { root: root, dev: dev, faithLabel: faithLabel, speedBtns: speedBtns, read: read, bar: bar, stopBtn: stopBtn, last: last, more: more, moreBtn: moreBtn, moreOpen: false, markSel: markSel, markRow: markRow,
      faith: faith, coarse: coarse, stepSel: stepSel, amt: amt, unit: unit, cond: cond, capA: capA, capU: capU };
  }
  function showMore(on) {
    ui.moreOpen = !!on;
    if (on) ui.more.removeAttribute('hidden'); else ui.more.setAttribute('hidden', '');
    ui.moreBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) loadMarks();
  }
  var marksAsked = false;
  function loadMarks() {
    if (marksAsked || typeof T.fetchLadder !== 'function') return;
    marksAsked = true;
    Promise.resolve(T.fetchLadder()).then(function (L) {
      L = L || T.ladder;
      if (!ui || !L || !Array.isArray(L.marks) || !L.marks.length) return;
      ui.markSel.innerHTML = '';
      L.marks.forEach(function (m) { ui.markSel.appendChild(el('option', { value: m.id, text: m.id + ' — ' + m.name })); });
      ui.markRow.removeAttribute('hidden');
    }).catch(function () { /* no ladder */ });
  }
  function render() {
    if (!ui || !ui.root.isConnected) return;
    var s = status(), p = s.pace;
    for (var k in ui.speedBtns) { var on = String(p) === k || (s.target === null && String(s.speed) === k); var v = on ? 'true' : 'false'; if (ui.speedBtns[k].getAttribute('aria-pressed') !== v) ui.speedBtns[k].setAttribute('aria-pressed', v); }
    var words = (s.speed === 0 && !s.target ? 'Paused' : p === 1 ? 'Normal speed (the game\'s own loop)' : p === 'max' ? 'Max speed' : '×' + p)
      + ' · ' + (s.approximate ? 'approximate ticks of ' + s.step + ' s — results can differ from normal play' : 'faithful ticks' + (s.devSpeed ? ' (not faithful on this save: developer speed ×' + s.devSpeed.n + ')' : ''));
    if (s.held && (s.speed !== 0 || s.target)) words += ' · ' + s.gameSecondsPerSec + ' game-s per second (' + s.ticksPerSec.toLocaleString('en-US') + ' ticks/s)';
    if (s.loop.how === 'pause-all' && s.held) words += ' · every game timer is paused while this runs';
    setText(ui.read, words);
    ui.read.classList.toggle('tmts-approx', s.approximate);
    if (s.devSpeed) { setText(ui.dev, devSpeedText(s.devSpeed)); if (ui.dev.hidden) ui.dev.hidden = false; }
    else if (!ui.dev.hidden) ui.dev.hidden = true;
    setText(ui.faithLabel, s.devSpeed ? 'Faithful: the game\'s own 0.05 s ticks — not faithful on this save (its developer speed is ×' + s.devSpeed.n + ')' : FAITH_WORDS);
    if (s.target) {
      ui.bar.removeAttribute('hidden'); ui.stopBtn.removeAttribute('hidden');
      ui.bar.firstChild.style.width = Math.round(s.target.frac * 1000) / 10 + '%';
      var t = s.target;
      setText(ui.last, 'Fast-forwarding to ' + t.label + ': ' + gsText(t.gs) + (t.kind === 'gs' ? ' of ' + gsText(t.of * s.step) : ' (limit ' + gsText(t.cap) + ')')
        + (t.throws ? ' · the condition threw ' + t.throws + '× (' + t.lastThrow + ') and reads as false' : ''));
    } else {
      if (!ui.bar.hasAttribute('hidden')) ui.bar.setAttribute('hidden', '');
      if (!ui.stopBtn.hasAttribute('hidden')) ui.stopBtn.setAttribute('hidden', '');
      setText(ui.last, s.last ? s.last.text : '');
    }
  }
  function setText(e, t) { if (e.textContent !== t) e.textContent = t; }
  // (speed-2) THE PANEL RENDERS IN THE SAME TASK AS THE CHANGE. It used to queue the render for the next animation frame,
  // so for up to a frame (longer on a slow CPU, and never in a hidden tab) the readout still said the old speed or mode,
  // and anything reading the page then — a script, a screen reader, gate S4 on CI — read the old words. A render is a
  // status() and a few text compares; `notify` runs once per change and once per driven frame, so this costs nothing.
  listeners.push(render);
  function open(remember) {
    if (!ui) build();
    if (!ui.root.isConnected) document.body.appendChild(ui.root);
    if (remember !== false) writePref(true);
    render();
    return ui.root;
  }
  function close() {
    if (target) stop();
    if (speed !== 1) setSpeed(1);
    if (ui && ui.root.isConnected) ui.root.remove();
    writePref(false);
  }
  function writePref(on) {
    var k = T.speed.prefKey();
    if (!k || !T.storage.raw) return;
    try { if (on) T.storage.raw.setItem.call(localStorage, k, '{"open":true}'); else T.storage.raw.removeItem.call(localStorage, k); } catch (e) { /* a blocked store costs the preference */ }
  }
  T.speed.open = open;
  T.speed.close = close;
  T.speed.isOpen = function () { return !!(ui && ui.root.isConnected); };
  T.speed.root = function () { return ui ? ui.root : null; };
  T.speed.showMore = function (on) { if (!ui) build(); showMore(on); };
  T.speed.render = render;
})();
