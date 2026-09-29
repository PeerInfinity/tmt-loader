// The timer recorder (plan §3c step 4, §3e pause/resume). Wraps setInterval/clearInterval, setTimeout/clearTimeout
// and requestAnimationFrame BEFORE any game script runs, so a runner can stop every interval the game and its UI
// started (game loop, autosave, canvas flag, component timers) without knowing each engine version's variable names.
//
// Intervals get a LOGICAL id that survives pause()/resume() (resume re-creates the real timer under the same
// logical id), so a component that later calls clearInterval(this.interval) still clears it. Timeouts and animation
// frames are recorded (counts) but not paused: neither game drives state from them, and Vue's own scheduling uses them.

export function installTimers(win) {
  const real = {
    setInterval: win.setInterval.bind(win), clearInterval: win.clearInterval.bind(win),
    setTimeout: win.setTimeout.bind(win), clearTimeout: win.clearTimeout.bind(win),
    requestAnimationFrame: win.requestAnimationFrame ? win.requestAnimationFrame.bind(win) : null,
  };
  const LOGICAL_BASE = 1e9; // real ids are small integers; logical ones cannot collide with them
  let next = LOGICAL_BASE;
  const intervals = new Map(); // logical id → {fn, ms, args, realId|null, createdAt}
  const counts = { setInterval: 0, clearInterval: 0, setTimeout: 0, requestAnimationFrame: 0 };
  let paused = false;

  const clearLogical = (id) => {
    const rec = intervals.get(id);
    if (!rec) return false;
    if (rec.realId != null) real.clearInterval(rec.realId);
    intervals.delete(id);
    counts.clearInterval++;
    return true;
  };
  win.setInterval = function setInterval(fn, ms, ...args) {
    counts.setInterval++;
    const id = ++next;
    const rec = { fn, ms, args, realId: null };
    if (!paused) rec.realId = real.setInterval(fn, ms, ...args);
    intervals.set(id, rec);
    return id;
  };
  win.clearInterval = function clearInterval(id) { if (!clearLogical(id)) real.clearInterval(id); };
  win.setTimeout = function setTimeout(fn, ms, ...args) { counts.setTimeout++; return real.setTimeout(fn, ms, ...args); };
  win.clearTimeout = function clearTimeout(id) { if (!clearLogical(id)) real.clearTimeout(id); };
  if (real.requestAnimationFrame) win.requestAnimationFrame = function requestAnimationFrame(cb) { counts.requestAnimationFrame++; return real.requestAnimationFrame(cb); };

  return {
    get paused() { return paused; },
    counts,
    list: () => [...intervals.entries()].map(([id, r]) => ({ id, ms: r.ms, running: r.realId != null })),
    pause() {
      for (const r of intervals.values()) if (r.realId != null) { real.clearInterval(r.realId); r.realId = null; }
      paused = true;
      return intervals.size;
    },
    resume() {
      paused = false;
      for (const r of intervals.values()) if (r.realId == null) r.realId = real.setInterval(r.fn, r.ms, ...r.args);
      return intervals.size;
    },
  };
}
