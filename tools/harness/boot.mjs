// copied from PeerInfinity/tmt-fork-census lib/boot.mjs @ 27c6654 (2026-09-14), then split: script order → loader/interpret.mjs
//
// The Node boot of ONE game per process (sloppy-mode globals leak; `load()` is not idempotent in one process):
//   node boot.mjs <id> [--ticks N] [--diff d] [--leg idle|policy] [--prestubs a,b] [--until "<js>"]
//                      [--storage in.json] [--import player.json] [--save] [--save-storage out.json]
//                      [--state-out f] [--player-out f] [--ids-out f] [--census]
//                      [--profile off|all|saved] [--exclude k1,k2] [--auto-opt "k=v;k2=v2"] [--no-auto] [--no-automation]
//                      [--marks marks.json ([[name, "<js>"], …])] [--marks-continue] [--stall <game-seconds> [--stall-seen]] [--wall-ms <ms>]
//                      [--stop-mark <name>] [--snapshots] [--runtime runtime.json] [--predicates list.json] [--eval "<js>"]
//   --stop-mark: stop after the first tick that mark holds (the ladder's --to). --snapshots: each mark's first tick also
//   records the unmasked player and the memory outside it (tmtLoader.runtimeState() + the detector's). --runtime: a
//   snapshot's `runtime` restored after load() — tick/game-second counters, the registry's memory, the detector's.
//   --predicates [[name, "<js>"], …]: each string compiled with tmtLoader.predicate (new Function, global scope) and
//   evaluated once after load(). --eval: an expression evaluated at the stop (R.eval, JSON).
// Prints one line "BOOTRESULT {json}" on stdout. Scripts run via vm.runInThisContext (Node's own global — never
// host intrinsics into a sandbox: TMT's `x.constructor === Object` test fails cross-realm). The plan comes from
// loader/interpret.mjs + manifests/<id>.json, the same code path as the page; render-only files and vendored Vue are
// skipped headless (as in the census) and every top-level function the render-only files declare is stubbed.
// Untrusted-code hygiene: `process`, `require`, `fetch`, `Buffer`, `WebAssembly` … are removed from the global before
// any game file runs (private references kept first); the parent (run.mjs) also scrubs the child's env.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import { interpret, executionOrder, modFilePaths } from '../../loader/interpret.mjs';
import { installSavePrefix } from '../../loader/shims/save-prefix.js';
import { DRIVE_SRC, MONITOR_SRC } from './policy.mjs';

const proc = process;
const REPO = path.resolve(new URL('../..', import.meta.url).pathname);
const out = (o) => proc.stdout.write('BOOTRESULT ' + JSON.stringify(o) + '\n');
const argv = proc.argv.slice(2);
const A = { _: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) A._.push(a);
  else if (['save', 'census', 'no-auto', 'no-automation', 'marks-continue', 'stall-seen', 'snapshots'].includes(a.slice(2))) A[a.slice(2)] = true;
  else A[a.slice(2)] = argv[++i];
}
const ID = A._[0];
const ticks = Number(A.ticks ?? 200), diff = Number(A.diff ?? 0.05), LEG = A.leg || 'idle';
const writeOut = (f, s) => { fs.mkdirSync(path.dirname(path.resolve(f)), { recursive: true }); fs.writeFileSync(f, s); };
const manifest = JSON.parse(fs.readFileSync(path.join(REPO, `manifests/${ID}.json`), 'utf8'));
const ROOT = path.join(REPO, 'games', ID);
const realConsole = console;
const R = { id: ID, runner: 'node', files_loaded: [], files_skipped: [], file_errors: [], stubs_hit: {}, console_lines: 0 };

// ---- script order: loader/interpret.mjs ---------------------------------------------------------------
const html = fs.readFileSync(path.join(ROOT, manifest.entry || 'index.html'), 'utf8');
let plan = interpret(html, manifest);
const slot0 = executionOrder(plan).slot;
if (slot0) plan = interpret(html, manifest, { loaderSource: fs.readFileSync(path.join(ROOT, slot0.loader), 'utf8') });
const { static: statics, slot } = executionOrder(plan);
R.onload = plan.onload;

// ---- shims ----------------------------------------------------------------------------------------
const hit = (k) => { R.stubs_hit[k] = (R.stubs_hit[k] || 0) + 1; };
function stub(name) {
  const store = {};
  const fn = function () {};
  return new Proxy(fn, {
    get(t, k) {
      if (k in store) return store[k];
      if (typeof k === 'symbol') return k === Symbol.toPrimitive ? () => '' : undefined;
      if (k === 'then' || k === 'toJSON') return undefined;
      if (k === 'length') return 0;
      if (k === 'toString' || k === 'valueOf') return () => '';
      hit(`${name}.${String(k)}`);
      return (store[k] = stub(`${name}.${String(k)}`));
    },
    set(t, k, v) { store[k] = v; return true; },
    has() { return true; },
    apply() { hit(`${name}()`); return stub(`${name}()`); },
    construct() { hit(`new ${name}`); return stub(`new ${name}`); },
  });
}
// localStorage: an in-memory Storage with the page's own prefix shim on its prototype, so the harness's storage
// dumps are key-for-key what the page writes (`tmt-loader:<id>:<key>`).
class MemStorage {
  constructor() { Object.defineProperty(this, '_m', { value: new Map() }); }
  getItem(k) { k = String(k); return this._m.has(k) ? this._m.get(k) : null; }
  setItem(k, v) { this._m.set(String(k), String(v)); }
  removeItem(k) { this._m.delete(String(k)); }
  key(n) { const ks = [...this._m.keys()]; return ks[n] ?? null; }
  clear() { this._m.clear(); }
  get length() { return this._m.size; }
}
const lsStore = new MemStorage();
const storageShim = installSavePrefix(MemStorage.prototype, ID);
if (A.storage) storageShim.seed(lsStore, JSON.parse(fs.readFileSync(A.storage, 'utf8')));
const intervals = [];
const shims = {
  window: globalThis, self: globalThis, top: globalThis, parent: globalThis,
  document: (() => { const d = stub('document'); d.title = ''; d.readyState = 'complete'; return d; })(),
  navigator: { userAgent: 'node', clipboard: stub('navigator.clipboard'), language: 'en' },
  location: { href: 'http://localhost/', search: '', hash: '', protocol: 'http:', reload() { hit('location.reload'); } },
  localStorage: lsStore,
  setInterval: (fn, ms) => { intervals.push(ms); return intervals.length; }, clearInterval() {},
  setTimeout: () => { hit('setTimeout'); return 0; }, clearTimeout() {},
  requestAnimationFrame: () => { hit('requestAnimationFrame'); return 0; },
  addEventListener() { hit('addEventListener'); }, removeEventListener() {},
  confirm: () => { hit('confirm'); return true; }, prompt: () => { hit('prompt'); return ''; }, alert: () => { hit('alert'); },
  getComputedStyle: () => stub('getComputedStyle()'),
  Vue: (() => { const v = stub('Vue'); v.set = (o, k, val) => { o[k] = val; }; v.delete = (o, k) => { delete o[k]; }; return v; })(),
  app: stub('app'),
  Image: function () { return stub('Image'); }, Audio: function () { return stub('Audio'); },
  HTMLElement: function () {}, Element: function () {},
};
const CONSOLE_KEEP = console;
Object.assign(globalThis, shims);
globalThis.console = new Proxy(CONSOLE_KEEP, { get: (t, k) => (typeof t[k] === 'function' ? () => { R.console_lines++; } : t[k]) });
const sha256hex = (s) => crypto.createHash('sha256').update(s).digest('hex');
for (const k of ['process', 'require', 'module', 'exports', 'fetch', 'Buffer', 'global', 'WebAssembly']) { try { delete globalThis[k]; } catch {} }
const run = (code, filename) => vm.runInThisContext(code, { filename });
// The manifest's prestubs first, then any names the parent learned from an earlier attempt's ReferenceError.
R.prestubs = [...new Set([...(manifest.headless?.prestubs || []), ...(A.prestubs ? A.prestubs.split(',') : [])])];
for (const n of R.prestubs) globalThis[n] = stub(n);

// ---- load -----------------------------------------------------------------------------------------
const t0 = Date.now();
const loadFile = (file, abs) => {
  if (!fs.existsSync(abs)) { R.file_errors.push({ file, error: 'missing' }); return; }
  try { run(fs.readFileSync(abs, 'utf8'), file); R.files_loaded.push(file); }
  catch (e) { R.file_errors.push({ file, error: String(e && e.message || e).slice(0, 200) }); }
};
for (const s of statics) {
  if (s.inline != null) { try { run(s.inline, s.name); R.files_loaded.push(s.name); } catch (e) { R.file_errors.push({ file: s.name, error: String(e.message).slice(0, 200) }); } continue; }
  if (s.vendor) {
    // Vue is UI: skipped headless, as in the census. Any other vendored library (a number library) is game logic.
    if (/vue/i.test(s.vendor.url)) { R.files_skipped.push({ file: s.vendor.path, why: 'vendor-ui' }); continue; }
    loadFile(s.vendor.path, path.join(REPO, s.vendor.path)); continue;
  }
  if (s.renderOnly) { R.files_skipped.push({ file: s.src, why: 'render-only' }); continue; }
  loadFile(s.src, path.join(ROOT, s.src));
}
if (slot) {
  R.files_skipped.push({ file: slot.loader, why: 'loader (modFiles loaded after the static scripts)' });
  R.modFiles_prefix = slot.prefix;
  let mf = []; try { mf = run('typeof modInfo !== "undefined" && modInfo.modFiles || []', 'modFiles'); } catch {}
  R.modFiles = [...mf];
  for (const f of modFilePaths(slot, mf)) loadFile(f, path.join(ROOT, f));
}
try { if (!slot && run('typeof modInfo !== "undefined" && Array.isArray(modInfo.modFiles)', 'x')) R.modFiles_without_loader = run('modInfo.modFiles', 'x'); } catch {}
// Render-only files are skipped, so every top-level function they declare (and is not defined elsewhere) is stubbed.
R.render_stubs = [];
const declared = new Set(['loadVue', 'resizeCanvas']);
for (const sk of R.files_skipped) {
  if (sk.why !== 'render-only') continue;
  const abs = path.join(ROOT, sk.file); if (!fs.existsSync(abs)) continue;
  for (const m of fs.readFileSync(abs, 'utf8').matchAll(/^\s{0,4}function\s+([\w$]+)\s*\(/gm)) declared.add(m[1]);
}
for (const f of declared) {
  try {
    const t = run(`typeof ${f}`, 'x');
    if (t !== 'function') { globalThis[f] = function () { hit(f); }; R.render_stubs.push(f); }
    else if (f === 'loadVue' || f === 'resizeCanvas') run(`${f} = function(){ globalThis.__hit && __hit(${JSON.stringify(f)}) }`, 'x');
  } catch {}
}
globalThis.__hit = hit;
// loader/tmt-auto.js — the same file the page inserts last (after the automation table)
const OPTIONS = {};
for (const part of String(A['auto-opt'] || '').split(';')) { if (!part) continue; const i = part.indexOf('='); if (i < 0) OPTIONS[part] = '1'; else OPTIONS[part.slice(0, i)] = part.slice(i + 1); }
// automation (the page's ?automation=1) is ON by default in the harness; --no-automation = the plain page (contract only)
const AUTOMATION = !A['no-automation'];
const PROFILE = A.profile || 'off';
const EXCLUDE = A.exclude ? String(A.exclude).split(',').filter(Boolean) : [];
R.profile = PROFILE; R.automation = AUTOMATION; if (EXCLUDE.length) R.exclude = EXCLUDE; if (Object.keys(OPTIONS).length) R.options = OPTIONS;
globalThis.tmtLoader = {
  id: ID, manifest, managed: true, automation: AUTOMATION, ready: false, error: null, sha256hex, options: OPTIONS,
  pause() { return 0; }, resume() { return 0; },
  storage: { prefix: storageShim.prefix, list: () => storageShim.list(lsStore), clear: () => storageShim.clear(lsStore) },
};
// the per-game automation table (manifest.auto): DATA, inserted before tmt-auto.js as the page does (tmt-auto.js derives
// the features from it); --no-auto = no table (derived defaults only)
if (AUTOMATION && manifest.auto && !A['no-auto']) {
  try { run(fs.readFileSync(path.join(REPO, manifest.auto), 'utf8'), manifest.auto); R.auto = manifest.auto; }
  catch (e) { R.file_errors.push({ file: manifest.auto, error: String(e.message).slice(0, 200) }); }
}
try { run(fs.readFileSync(path.join(REPO, 'loader/tmt-auto.js'), 'utf8'), 'loader/tmt-auto.js'); }
catch (e) { R.file_errors.push({ file: 'loader/tmt-auto.js', error: String(e.message).slice(0, 200) }); }
R.load_ms = Date.now() - t0;
const errText = (e) => { const st = String(e && e.stack || ''); const at = (st.match(/^\s+at .*$/m) || [''])[0].trim(); return `${e && e.name || 'Error'}: ${String(e && e.message || e).slice(0, 300)}${at ? ' @ ' + at.slice(0, 160) : ''}`; };
const fail = (stage, e) => { R.ok = false; R.failed_at = stage; R.error = errText(e); out(R); proc.exit(0); };
// A global defined only in a skipped file surfaces as a ReferenceError inside load(); report the name and let the
// parent re-spawn with it pre-stubbed (bounded there).
try { run(plan.onload && /load\s*\(/.test(plan.onload) ? plan.onload : 'load()', 'onload'); run(`tmtLoader.profile(${JSON.stringify(PROFILE)})`, 'profile'); run('tmtLoader.ready = true', 'x'); }
catch (e) {
  const m = e && e.name === 'ReferenceError' && /^([\w$]+) is not defined/.exec(e.message);
  if (m && !R.prestubs.includes(m[1])) R.needs_stub = m[1];
  fail('load()', e);
}

// ---- a resumed run (--runtime): counters and memory outside player, as the snapshot recorded them ----------------------
const RUNTIME = A.runtime ? JSON.parse(fs.readFileSync(A.runtime, 'utf8')) : null;
if (RUNTIME) {
  try {
    run(`tmtLoader.ticks = ${Number(RUNTIME.ticks) || 0}; tmtLoader.gameSeconds = ${Number(RUNTIME.gameSeconds) || 0}`, 'runtime');
    if (RUNTIME.auto) {
      if (run('typeof tmtLoader.restoreRuntime', 'x') !== 'function') throw new Error('this core has no restoreRuntime (automation off?)');
      run(`tmtLoader.restoreRuntime(${JSON.stringify(RUNTIME.auto)})`, 'runtime');
    }
    R.resumed = { ticks: Number(RUNTIME.ticks) || 0, gameSeconds: Number(RUNTIME.gameSeconds) || 0, auto: !!RUNTIME.auto, monitor: !!RUNTIME.monitor };
  } catch (e) { fail('runtime', e); }
}
if (A.predicates) {
  const list = JSON.parse(fs.readFileSync(A.predicates, 'utf8'));
  R.predicates = list.map(([name, src]) => {
    const o = { name, compiles: false, evaluates: false };
    try { globalThis.__tmtPredSrc = src; run('globalThis.__tmtPred = tmtLoader.predicate(globalThis.__tmtPredSrc)', 'predicate'); o.compiles = true; } catch (e) { o.error = errText(e); return o; }
    try { o.value = !!run('globalThis.__tmtPred()', 'predicate'); o.evaluates = true; } catch (e) { o.error = errText(e); }
    return o;
  });
}

// ---- import (tmtLoader.loadFrom): the game's own importSave writes storage; the page would reload here -------
if (A.import) {
  try {
    const json = fs.readFileSync(A.import, 'utf8');
    run(`tmtLoader.loadFrom(${JSON.stringify(json)})`, 'loadFrom');
    R.imported = true;
    R.reload_requested = (R.stubs_hit['location.reload'] || 0) > 0;
    const st = storageShim.list(lsStore);
    if (A['save-storage']) writeOut(A['save-storage'], JSON.stringify(st, null, 1));
    R.storage_keys = Object.keys(st);
    R.ok = true; out(R); proc.exit(0);
  } catch (e) { fail('loadFrom', e); }
}

// ---- optional: the census's layer census + milestone trace (read-only walks; --census) ---------------------------
if (A.census) {
  try {
    R.census = run(`(function(){
      const numKeys = (o) => o && typeof o === 'object' ? Object.keys(o).filter(k => !isNaN(k)).length : 0;
      const ids = Object.keys(layers);
      const tot = { milestones:0, upgrades:0, buyables:0, challenges:0, achievements:0, clickables:0 };
      for (const l of ids) for (const k in tot) tot[k] += numKeys(layers[l] && layers[l][k]);
      return { allLayers: ids.length, ...tot };
    })()`, 'census');
  } catch (e) { R.census = { error: String(e.message).slice(0, 200) }; }
}
if (A['ids-out']) writeOut(A['ids-out'], JSON.stringify(run('tmtLoader.ids()', 'ids'), null, 1) + '\n');

// ---- ticks ---------------------------------------------------------------------------------------
// Leg "idle": no input. Leg "policy": the census's generic policy before each tick (tools/harness/policy.mjs, the same
// source the page runs). --until stops after the first tick whose predicate is true.
try {
  const t1 = Date.now();
  const MARKS = A.marks ? JSON.parse(fs.readFileSync(A.marks, 'utf8')) : [];
  const monitored = MARKS.length || A.stall || A['wall-ms'];
  if (monitored) run(`globalThis.__tmtMonitor = ${MONITOR_SRC}([${MARKS.map(([n, e]) => `[${JSON.stringify(n)}, function(){ return (${e}); }]`).join(',')}], ${Number(A.stall || 0)}, ${Number(A['wall-ms'] || 0)}, ${A['marks-continue'] ? 'true' : 'false'}, ${A['stall-seen'] ? 'true' : 'false'}, ${A['stop-mark'] ? JSON.stringify(A['stop-mark']) : 'null'}, ${A.snapshots ? 'true' : 'false'}, ${RUNTIME && RUNTIME.monitor && RUNTIME.monitor.seen && RUNTIME.monitor.seen.length ? JSON.stringify(RUNTIME.monitor) : 'null'})`, 'monitor');
  const untilSrc = monitored ? `function(){ ${A.until ? `if (${A.until}) return true;` : ''} return __tmtMonitor.check(); }` : A.until ? `function(){ return (${A.until}); }` : 'null';
  const r = run(`${DRIVE_SRC}(${ticks}, ${diff}, ${LEG === 'policy'}, ${untilSrc})`, 'ticks-' + LEG);
  if (monitored) {
    const m = run('__tmtMonitor.result()', 'monitor');
    R.marks = {};
    // hashGame: the same state without player.au — the au layer's own fields (clickables: one key per au button) move
    // with the NUMBER of registered features, so a table change moves `hash` without any game state moving
    const exAu = (j) => { const o = JSON.parse(j); delete o.au; return JSON.stringify(o); };
    for (const [n] of MARKS) R.marks[n] = m.hits[n] ? { ticks: m.hits[n].ticks, gameSeconds: m.hits[n].gameSeconds, hash: sha256hex(m.hits[n].json).slice(0, 16), hashGame: sha256hex(exAu(m.hits[n].json)).slice(0, 16), actions: m.hits[n].actions } : null;
    if (A.snapshots) { R.snapshots = {}; for (const [n] of MARKS) if (m.hits[n] && m.hits[n].snapshot) R.snapshots[n] = m.hits[n].snapshot; }
    if (A.stall || A['wall-ms']) R.stall = { window: Number(A.stall || 0), seen: !!A['stall-seen'], stalled: m.stalled, walled: m.walled, wallMs: Number(A['wall-ms'] || 0), lastProgress: m.lastProgress };
  }
  R.ticks_ms = Date.now() - t1;
  R.leg = LEG;
  if (LEG === 'policy') R.policy_errors = r.policyErrors;
  if (A.until) R.until = { expr: A.until, met: r.met, errors: r.untilErrors, stoppedAtTick: run('tmtLoader.ticks', 'x') };
  Object.assign(R, run('({ ticks: tmtLoader.ticks, gameSeconds: tmtLoader.gameSeconds })', 'x'));
  R.diff = diff;
  const SOPTS = JSON.stringify({ exclude: EXCLUDE });
  const json = run(`tmtLoader.stateJSON(${SOPTS})`, 'state');
  R.hash = await run(`tmtLoader.hash(${SOPTS})`, 'hash');
  if (EXCLUDE.length) R.hashFull = await run('tmtLoader.hash()', 'hash');
  if (AUTOMATION) R.hashGame = await run(`tmtLoader.hash({ exclude: ['au'] })`, 'hash');
  R.hook = run('tmtLoader.hookStats ? tmtLoader.hookStats() : null', 'x');
  R.features = run('(tmtLoader.features || []).map(f => f.id)', 'x');
  R.featureStates = run('(tmtLoader.features || []).map(f => { const s = tmtLoader.featureState(f.id); return [f.id, s.unlocked, s.policy]; })', 'x');
  R.derivation = run('tmtLoader.autoDerivation || null', 'x');
  R.excluded = run('tmtLoader.autoExcluded || null', 'x');
  R.state_paths = {};
  const st = JSON.parse(json);
  for (const k in st) {
    if (st[k] && typeof st[k] === 'object' && !Array.isArray(st[k])) for (const k2 in st[k]) R.state_paths[`${k}.${k2}`] = sha256hex(JSON.stringify(st[k][k2]) ?? 'u').slice(0, 16);
    else R.state_paths[k] = sha256hex(JSON.stringify(st[k]) ?? 'u').slice(0, 16);
  }
  R.summary = run(`({ points: String(player.points), unlocked: Object.keys(layers).filter(l => player[l] && player[l].unlocked) })`, 'x');
  // --stall / --detail: a readable state at the stop, for "what would a human click next"
  if (A.stall || A.detail) R.detail = run(`(function(){
    const f = (x) => { try { return x === undefined || x === null ? null : (typeof x === 'object' && x.mag !== undefined ? format(x) : String(x)); } catch (e) { return String(x); } };
    const out = {};
    for (const l in layers) { const L = layers[l], P = player[l], t = tmp[l]; if (!P || !t || L.tmtLoaderLayer || isNaN(L.row)) continue;
      if (!P.unlocked && !t.layerShown) continue;
      const o = { row: L.row, type: L.type, unlocked: !!P.unlocked, points: f(P.points), best: f(P.best), canReset: t.canReset === true, resetGain: f(t.resetGain), nextAt: f(t.nextAt), requires: f(t.requires), baseAmount: f(t.baseAmount),
        upgrades: (P.upgrades || []).join(','), milestones: (P.milestones || []).join(','), buyables: Object.fromEntries(Object.entries(P.buyables || {}).filter(([k, v]) => String(v) !== '0').map(([k, v]) => [k, f(v)])) };
      if (L.upgrades && t.upgrades) o.nextUpgrades = Object.keys(L.upgrades).filter(id => !isNaN(id) && t.upgrades[id] && t.upgrades[id].unlocked && !(P.upgrades || []).map(String).includes(String(id))).map(id => id + '@' + f(t.upgrades[id].cost)).slice(0, 6);
      if (L.milestones) o.nextMilestones = Object.keys(L.milestones).filter(id => !isNaN(id) && !(P.milestones || []).map(String).includes(String(id))).slice(0, 2).map(id => id + ': ' + (L.milestones[id].requirementDescription || ''));
      out[l] = o; }
    return out; })()`, 'detail');
  if (A.eval) { try { R.eval = run(`JSON.parse(JSON.stringify(${A.eval}))`, 'eval'); } catch (e) { R.eval = { error: errText(e) }; } }
  if (A['state-out']) writeOut(A['state-out'], json);
  if (A['player-out']) writeOut(A['player-out'], run('JSON.stringify(player)', 'player'));
  if (A.save) { run('tmtLoader.save()', 'save'); const s = storageShim.list(lsStore); R.storage_keys = Object.keys(s); if (A['save-storage']) writeOut(A['save-storage'], JSON.stringify(s, null, 1)); }
  R.ok = true;
} catch (e) { R.ok = false; R.failed_at = 'ticks'; R.error = errText(e); }
R.intervals_captured = intervals.length;
out(R);
proc.exit(0);
