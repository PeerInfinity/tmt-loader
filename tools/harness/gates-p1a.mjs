// The P1a gates (the advanced planner's foundation: rollback, the knowledge walk, the two goal sources —
// tmt-automation-plan §12 P1a; docs/planner.md). Appends one section to results/SUMMARY.md.
//   node gates-p1a.mjs --part 0|1|2|3 [--no-summary] [--pool N] [--write-goldens]
//
// Part 0 (P1a-0): the FRONTIER fixture — from snapshots/ptr/all/M09 at diff 1 to the stall, written as
//   snapshots/ptr/frontier/STALL.json (--stop-snapshot), and required to reproduce S1 §10a.4 exactly (14131 ticks,
//   last progress 10531, hash 63f28e099536a119, game f7a8854358ac4029). Every later part starts from that file in
//   seconds instead of re-running the 2.5-minute stretch.
// Part 1 (P1a-1): snapshot / restore / excursion / measure.
//   (a) hashGame AND the full hash before an excursion == after the restore, at every state;
//   (b) the A/B test: tick 300 after a restore-following-excursion ≡ tick 300 with no excursion (both hashes), for an
//       excursion that resets a layer, buys upgrades and ticks 200, and for one that enters a challenge where reachable;
//   (c) two identical measure() calls return identical results (determinism);
//   (d) cost: ms per snapshot, per restore, per measured game-second;
//   (e) the simple system's pinned battery (gates-s1 --part 1) and node≡page parity (gates-s1 --part 3) unchanged — the
//       planner file is NOT loaded there — plus one row per engine WITH --planner loaded and no excursion, which must
//       land on the same tick and hash as the pinned row (loading the planner is inert).
// Part 2 (P1a-2): the knowledge walk — dumps at ptr M02 / M05 / M09 / frontier and something at 399×1 and 309×1,
//   goldens under knowledge/, each re-produced twice (determinism), spot checks against the source, goal counts against
//   the census, and the cost of a full walk.
// Part 3 (P1a-3): the two goal sources — goals() dumps for the same states (goldens, twice equal), the frontier's first
//   sticky entries with the first impossible hop of each chain named, and the-omega-tree with no ladder at all.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, writeJSON, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);  // a battery, not a library — see lib.mjs

const a = parseArgs(process.argv.slice(2), ['no-summary', 'write-goldens']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} diff=${r.diff ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 300)}`); };

const PTR_LADDER = 'tools/harness/ladder/ptr.json', ST_LADDER = 'tools/harness/ladder/something.json';
const SNAP = { M02: 'tools/harness/snapshots/ptr/all/M02.json', M05: 'tools/harness/snapshots/ptr/all/M05.json', M09: 'tools/harness/snapshots/ptr/all/M09.json' };
const FRONTIER_DIR = 'tools/harness/snapshots/ptr/frontier', FRONTIER = `${FRONTIER_DIR}/STALL.json`;
const ST_DIR = 'tools/harness/snapshots/something/all';
const KDIR = path.join(REPO, 'tools/harness/knowledge');
const DETECT = { stall: 3600, 'stall-seen': true, 'wall-ms': 540000 };
// S1 §10a.4 / H1-2f: the frontier, every derived kind, diff 1, from all/M09.
const FRONTIER_PIN = { ticks: 14131, lastProgress: 10531, hash: '63f28e099536a119', hashGame: 'f7a8854358ac4029' };
// the census counts the walk is compared against (walkthrough digest §2a / tmtLoader.ids())
const PTR_CENSUS = { upg: 172, ms: 85, ach: 80, buy: 52, ch: 9 };

// ---- a pool of run.mjs children ---------------------------------------------------------------------------------------
const POOL = Number(a.pool || 3);
let running = 0;
const queue = [];
const uptime = () => { try { return execFileSync('uptime', { encoding: 'utf8' }).trim().replace(/.*load average:\s*/, ''); } catch { return null; } };
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-p1a-')), 'r.json');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out];
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null || v === false) continue;
      if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
    }
    const loadStart = uptime(), t0 = Date.now();
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => {
      running--;
      let r;
      try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { r = { ok: false, error: `no result: ${err.slice(-400)}` }; }
      r.load = { start: loadStart, end: uptime(), wallMs: Date.now() - t0, pool: POOL };
      resolve(r);
      pump();
    });
  }
}
const job = (id, o) => new Promise((resolve) => { queue.push({ id, o, resolve }); pump(); });
const tmpDir = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `tmt-loader-p1a-${p}-`));
const writeDrive = (name, src) => { const f = path.join(tmpDir('drive'), `${name}.js`); fs.writeFileSync(f, src); return f; };
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

/** The states every part walks. `from` = a committed snapshot, or `ticks` from a fresh game. */
const STATES = () => [
  { key: 'ptr-M02', id: 'ptr', from: SNAP.M02, ladder: PTR_LADDER, note: 'all/M02' },
  { key: 'ptr-M05', id: 'ptr', from: SNAP.M05, ladder: PTR_LADDER, note: 'all/M05' },
  { key: 'ptr-M09', id: 'ptr', from: SNAP.M09, ladder: PTR_LADDER, note: 'all/M09' },
  { key: 'ptr-frontier', id: 'ptr', from: FRONTIER, ladder: PTR_LADDER, note: 'frontier (all/M09 + 6096 ticks, the S1 stall)' },
  { key: 'something-S03', id: 'something', from: `${ST_DIR}/S03.json`, ladder: ST_LADDER, note: 'A2-1 (i) — the first primitive reset' },
  { key: 'something-S04', id: 'something', from: `${ST_DIR}/S04.json`, ladder: ST_LADDER, note: 'A2-1 (ii) — primitive milestone 1' },
];
// R1′ (2026-09-17): the ptr table's `reset:p` moved from `interval>=10` to `gain>=2x`. Every number and fixture in this
// file was measured under the interval, so the runs name it explicitly; a pin is a measurement of a POLICY, not of which
// one the table names. (An `auto-opt` in a row's own `opt` still wins — P1b's ctl-gain2x is exactly that control.)
const PIN_RESET_P = 'policy:reset:p=interval>=10';
const stateOpts = (s, extra = {}) => ({ profile: 'all', ...(s.from ? { 'from-snapshot': s.from, ticks: 0, diff: 1 } : { ticks: s.ticks, diff: s.diff }), ...extra });

// ---- Part 0: the frontier fixture -------------------------------------------------------------------------------------
async function part0() {
  fs.mkdirSync(path.join(REPO, FRONTIER_DIR), { recursive: true });
  // The stall's CONTROL, run in parallel: the same stretch with the detector's stop removed, 204 ticks PAST the stall
  // tick. It is what a short measurement window at the frontier must be read against (P1a-2's window row).
  const controlP = job('ptr', { profile: 'all', diff: 1, ticks: 6300, 'from-snapshot': SNAP.M09, 'wall-ms': 540000, 'auto-opt': PIN_RESET_P,
    eval: "({b: String(player.b.points), bBest: String(player.b.best), sb: player.sb.unlocked, bNextAt: String(tmp.b.nextAt), bBaseAmount: String(tmp.b.baseAmount), points: String(player.points)})" });
  const r = await job('ptr', { profile: 'all', diff: 1, ticks: 30000, 'from-snapshot': SNAP.M09, 'auto-opt': PIN_RESET_P, ...DETECT, 'stop-snapshot': FRONTIER_DIR, 'stop-snapshot-name': 'STALL' });
  const ok = !!r.ok && r.ticks === FRONTIER_PIN.ticks && r.hash === FRONTIER_PIN.hash && r.hashGame === FRONTIER_PIN.hashGame && r.stall?.lastProgress?.ticks === FRONTIER_PIN.lastProgress && !!r.stopSnapshotWritten;
  row({ gate: 'P1a-0 the frontier fixture: from all/M09 to the stall reproduces S1 §10a.4', id: 'ptr', leg: 'profile all, diff 1, stall 3600 seen', ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
    notes: `stalled ${r.stall?.stalled} at ${r.ticks} (pin ${FRONTIER_PIN.ticks}), last progress ${r.stall?.lastProgress?.ticks} (pin ${FRONTIER_PIN.lastProgress}), hashGame ${r.hashGame} (pin ${FRONTIER_PIN.hashGame}); wrote ${r.stopSnapshotWritten?.file} (${r.stopSnapshotWritten?.bytes} B); ${Math.round(r.ticks_ms / 1000)} s, load ${r.load?.start} → ${r.load?.end}` });
  const c = await controlP;
  row({ gate: 'P1a-0 the stall CONTROL: the uninterrupted run 204 ticks past the stall tick (detector stop removed)', id: 'ptr', leg: 'from all/M09, 6300 ticks, no stall stop', ok: !!c.ok && c.ticks === 14335 && c.eval && c.eval.sb === false,
    ticks: c.ticks, gameSeconds: c.gameSeconds, diff: 1, hash: c.hash,
    notes: `at 14335: boosters ${c.eval?.b} (best ${c.eval?.bBest}) — BELOW the 49 held at the stall tick — sb unlocked ${c.eval?.sb}; tmp.b.nextAt ${c.eval?.bNextAt} against baseAmount ${c.eval?.bBaseAmount} (points ${c.eval?.points}). Boosters OSCILLATE here; a rate measured over a short window reads only the rising phase` });

  // Something Tree's marks as fixtures too, by the H1 mechanism (--ladder --snapshots): every P1a state is then a
  // committed snapshot, so an excursion is measured AT the mark instead of at tick 0 of a fresh game.
  fs.rmSync(path.join(REPO, ST_DIR), { recursive: true, force: true });
  const st = await job('something', { profile: 'all', diff: 1, ticks: 2000, ladder: ST_LADDER, to: 'S05', 'until-all': true, snapshots: ST_DIR, ...DETECT });
  const reached = (st.ladder?.reached || []).map((m) => `${m.id} at ${m.ticks} (${m.hashGame})`);
  row({ gate: 'P1a-0 Something Tree mark fixtures (profile all, every kind, diff 1)', id: 'something', leg: '--ladder --to S05 --until-all --snapshots', ok: !!st.ok && ['S01', 'S02', 'S03', 'S04', 'S05'].every((m) => st.marks?.[m]),
    ticks: st.ticks, gameSeconds: st.gameSeconds, diff: 1, hash: st.hash, notes: `${reached.join(', ')}; wrote ${(st.snapshotsWritten || []).map((x) => x.mark).join(' ')}; A2-1 pins (kinds=reset,upgrades,buyables) are 309 / 399 / 579` });

  // the fixture must boot back to the same state (the import round trip every snapshot is required to survive)
  const back = await job('ptr', { profile: 'all', ticks: 0, 'from-snapshot': FRONTIER });
  row({ gate: 'P1a-0 the frontier fixture round-trips (--from-snapshot --ticks 0)', id: 'ptr', leg: 'import round trip', ok: !!back.ok && back.hash === FRONTIER_PIN.hash && back.hashGame === FRONTIER_PIN.hashGame && back.ticks === FRONTIER_PIN.ticks,
    ticks: back.ticks, gameSeconds: back.gameSeconds, diff: 1, hash: back.hash, notes: `hashGame ${back.hashGame}; ticks continue from the fixture` });
}

// ---- Part 1: snapshot / restore / excursion / measure ------------------------------------------------------------------
// (a) + (c) + (d): one drive per state, run BEFORE the tick loop, reporting JSON.
const DRIVE_ROUNDTRIP = `
var P = tmtLoader.planner, T = tmtLoader;
function ms(f, n) { var t0 = Date.now(); for (var i = 0; i < n; i++) f(); return (Date.now() - t0) / n; }
var h0 = P.hashes();
// (d) cost
var snapMs = ms(function () { P.snapshot(); }, 5);
var snap = P.snapshot();
var restoreMs = ms(function () { P.restore(snap); }, 5);
var t0 = Date.now();
var m1 = P.measure(ACTIONS, 100, { stride: 20 });
var perGameSecond = (Date.now() - t0 - restoreMs) / 100;
// (a) every excursion leaves the live state byte-identical
var afterMeasure = P.hashes();
var bare = P.excursion(function () { return 1; });
var afterBare = P.hashes();
// an excursion that resets every resettable layer, buys what it can and ticks 200
var big = P.excursion(function () {
  var ls = P.layerOrder(), i;
  for (i = 0; i < ls.length; i++) if (tmp[ls[i]] && tmp[ls[i]].canReset === true) doReset(ls[i]);
  updateTemp();
  for (i = 0; i < ls.length; i++) {
    var L = layers[ls[i]];
    if (!L.upgrades || !player[ls[i]].unlocked) continue;
    for (var id in L.upgrades) if (!isNaN(id)) { try { buyUpgrade(ls[i], Number(id)); } catch (e) {} }
  }
  tmtLoader.tick(1, 200);
  return P.hashes().hashGame;
});
var afterBig = P.hashes();
// (c) determinism: two identical measure() calls
var m2 = P.measure(ACTIONS, 100, { stride: 20 });
var same = JSON.stringify(m1) === JSON.stringify(m2);
var h1 = P.hashes();
return { before: h0, after: h1, roundTrip: h0.hash === h1.hash && h0.hashGame === h1.hashGame,
  steps: { afterMeasure: afterMeasure, afterBare: afterBare, afterBig: afterBig },
  eachStepEqual: [afterMeasure, afterBare, afterBig].every(function (h) { return h.hash === h0.hash && h.hashGame === h0.hashGame; }),
  measureDeterministic: same, measuredHashGame: m1.hashGame, measuredActions: m1.actions, bigExcursionHashGame: big,
  cost: { snapshotMs: snapMs, restoreMs: restoreMs, perMeasuredGameSecondMs: perGameSecond, ticks: T.ticks } };
`;
// (b) the A/B drive: an excursion, then the run's own --ticks 300 must land where a no-op run does.
const DRIVE_AB = `
var P = tmtLoader.planner;
var inside = P.excursion(function () {
  var ls = P.layerOrder(), i;
  for (i = 0; i < ls.length; i++) if (tmp[ls[i]] && tmp[ls[i]].canReset === true) doReset(ls[i]);
  updateTemp();
  for (i = 0; i < ls.length; i++) {
    var L = layers[ls[i]];
    if (!L.upgrades || !player[ls[i]].unlocked) continue;
    for (var id in L.upgrades) if (!isNaN(id)) { try { buyUpgrade(ls[i], Number(id)); } catch (e) {} }
  }
  tmtLoader.tick(1, 200);
  return P.hashes().hashGame;
});
return { excursion: inside };
`;
// (b′) the challenge excursion. No PTR or Something Tree state inside a wall reaches a challenge layer (S1 §10a.5), so
// the drive does what S1's unit drives did — it UNLOCKS the challenge layers ON THE COPY and enters what it can. An
// excursion that edits `player` directly is the strongest case for the rollback: the restore has to undo that too.
const DRIVE_AB_CH = `
var P = tmtLoader.planner;
var r = P.excursion(function () {
  var ls = P.layerOrder(), entered = [], forced = [];
  for (var i = 0; i < ls.length; i++) {
    var l = ls[i], L = layers[l];
    if (!L.challenges || !player[l]) continue;
    if (!player[l].unlocked) { player[l].unlocked = true; forced.push(l); }
  }
  updateTemp();
  for (var j = 0; j < ls.length; j++) {
    var l2 = ls[j], L2 = layers[l2];
    if (!L2.challenges || !player[l2] || !player[l2].unlocked) continue;
    for (var id in L2.challenges) {
      if (isNaN(id)) continue;
      try { startChallenge(l2, Number(id)); } catch (e) { continue; }
      if (Number(player[l2].activeChallenge) === Number(id)) { entered.push(l2 + ':' + id); tmtLoader.tick(1, 50); break; }
    }
  }
  return { forcedUnlocked: forced, entered: entered, hashGame: P.hashes().hashGame };
});
return r;
`;
const NOOP = 'return { noop: true };';

async function part1() {
  const states = STATES();
  // (a) (c) (d)
  const rt = await Promise.all(states.map((s) => job(s.id, stateOpts(s, { planner: true, 'planner-script': writeDrive(`rt-${s.key}`, DRIVE_ROUNDTRIP.replace(/ACTIONS/g, '[]')) }))));
  states.forEach((s, i) => {
    const r = rt[i], p = r.plannerScript || {};
    const ok = !!r.ok && p.roundTrip === true && p.eachStepEqual === true && p.measureDeterministic === true;
    row({ gate: `P1a-1 (a)(c)(d) excursion → restore is byte-identical; measure() is deterministic — ${s.note}`, id: s.id, leg: s.key, ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: r.diff, hash: p.before?.hash,
      notes: `before ${p.before?.hash} / ${p.before?.hashGame}; after ${p.after?.hash} / ${p.after?.hashGame}; every step equal ${p.eachStepEqual}; two measure() calls identical ${p.measureDeterministic}; the big excursion reached ${p.bigExcursionHashGame}; cost snapshot ${p.cost?.snapshotMs?.toFixed(1)} ms, restore ${p.cost?.restoreMs?.toFixed(1)} ms, ${p.cost?.perMeasuredGameSecondMs?.toFixed(2)} ms per measured game-second` });
  });
  // (b) the A/B test: excursion vs no-op, then 300 ticks
  for (const [label, drive] of [['reset + buy + tick 200', DRIVE_AB], ['unlock the challenge layers on the copy, enter, tick 50', DRIVE_AB_CH]]) {
    const pairs = await Promise.all(states.map(async (s) => {
      const base = stateOpts(s, { planner: true });
      const ticks = (s.from ? 0 : s.ticks) + 300;
      const [ex, ctl] = await Promise.all([
        job(s.id, { ...base, ticks: s.from ? 300 : ticks, 'planner-script': writeDrive(`ab-${s.key}`, drive) }),
        job(s.id, { ...base, ticks: s.from ? 300 : ticks, 'planner-script': writeDrive(`noop-${s.key}`, NOOP) }),
      ]);
      return { s, ex, ctl };
    }));
    for (const { s, ex, ctl } of pairs) {
      const ok = !!ex.ok && !!ctl.ok && ex.hash === ctl.hash && ex.hashGame === ctl.hashGame && ex.ticks === ctl.ticks;
      row({ gate: `P1a-1 (b) A/B: 300 ticks after an excursion (${label}) ≡ 300 ticks with none — ${s.note}`, id: s.id, leg: s.key, ok, ticks: ex.ticks, gameSeconds: ex.gameSeconds, diff: ex.diff, hash: ex.hash,
        notes: `excursion run ${ex.hash} / ${ex.hashGame}; control ${ctl.hash} / ${ctl.hashGame}; what the excursion did: ${JSON.stringify(ex.plannerScript).slice(0, 160)}` });
    }
  }
  // (e) the planner loaded and never called is inert — the pinned marks land where gates-s1 pins them
  const inert = [
    { id: 'ptr', o: { profile: 'all', diff: 1, ticks: 3550, 'auto-opt': 'kinds=reset,upgrades,buyables;' + PIN_RESET_P }, pin: { ticks: 3550, hashGame: 'ff624de18438f176' }, note: 'A2-3 (i) 3550×1, kinds=reset,upgrades,buyables' },
    { id: 'something', o: { profile: 'all', diff: 1, ticks: 399, 'auto-opt': 'kinds=reset,upgrades,buyables' }, pin: { ticks: 399, hashGame: '070dc67eca5ac00f' }, note: 'A2-1 (ii) 399×1' },
  ];
  const inertRes = await Promise.all(inert.map((x) => Promise.all([job(x.id, x.o), job(x.id, { ...x.o, planner: true })])));
  inert.forEach((x, i) => {
    const [off, on] = inertRes[i];
    const ok = !!off.ok && !!on.ok && off.hash === on.hash && off.hashGame === on.hashGame && on.hashGame === x.pin.hashGame && on.ticks === x.pin.ticks;
    row({ gate: `P1a-1 (e) loading loader/tmt-planner.js is INERT — ${x.note}`, id: x.id, leg: 'with --planner vs without', ok, ticks: on.ticks, gameSeconds: on.gameSeconds, diff: 1, hash: on.hash,
      notes: `without the planner ${off.hash} / ${off.hashGame}; with it ${on.hash} / ${on.hashGame}; S1 pin ${x.pin.hashGame}; planner members ${on.planner ? 'loaded' : 'ABSENT'}` });
  });
  // (e) the pinned batteries, re-run unchanged (the planner file is not loaded in them)
  for (const part of ['1', '3']) {
    const r = await runGates('gates-s1.mjs', part);
    row({ gate: `P1a-1 (e) the simple system's battery unchanged: gates-s1 --part ${part}`, id: 'ptr+something', leg: part === '1' ? 'pinned marks, anchors, goldens' : 'node ≡ page parity', ok: r.ok, ticks: null, gameSeconds: null, diff: null, hash: null,
      notes: `${r.line}${r.ok ? '' : ` — RED rows: ${r.red.join(' | ').slice(0, 400)}`}` });
  }
}

function runGates(script, part) {
  const t0 = Date.now();
  const c = spawn(process.execPath, [path.join(REPO, 'tools/harness', script), '--part', part, '--no-summary'], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
  return new Promise((resolve) => {
    let out = '', err = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', (code) => {
      const lines = out.trim().split('\n');
      const last = lines[lines.length - 1] || '';
      const red = lines.filter((l) => l.startsWith('RED')).map((l) => l.slice(0, 120));
      resolve({ ok: code === 0, line: `${last} (${Math.round((Date.now() - t0) / 1000)} s)`, red, err: err.slice(-300) });
    });
  });
}

// ---- Part 2: the knowledge walk ---------------------------------------------------------------------------------------
// Spot checks, each a claim about the SOURCE (walkthrough digest §3 / layers.js) that the walk must reproduce by
// measurement: [state key, goal id, field, expected].
const SPOTS = [
  ['ptr-M09', 'unlock:sb', 'dimension', 'player.b.points'], ['ptr-M09', 'unlock:sb', 'threshold', '100'],
  ['ptr-M09', 'unlock:q', 'dimension', 'player.g.power'], ['ptr-M09', 'unlock:q', 'threshold', '1e512'],
  ['ptr-M09', 'upg:e:11', 'threshold', '25'], ['ptr-M09', 'upg:e:11', 'dimension', 'player.e.points'],
  ['ptr-M09', 'upg:t:12', 'threshold', '200000'], ['ptr-M09', 'upg:t:12', 'dimension', 'player.t.energy'],
  ['ptr-M09', 'ms:b:0', 'dimension', 'player.b.best'], ['ptr-M09', 'ms:b:0', 'threshold', '8'],
  ['ptr-M09', 'ms:t:4', 'threshold', '8'],
  ['ptr-frontier', 'upg:t:12', 'threshold', '200000'], ['ptr-frontier', 'upg:t:12', 'dimension', 'player.t.energy'],
  ['ptr-frontier', 'upg:e:11', 'threshold', '25'],
  ['something-S03', 'ms:primitive:1', 'threshold', '10'],
  ['something-S04', 'ms:primitive:2', 'threshold', '100000'],
];

async function part2() {
  const states = STATES();
  const out = {};
  for (const s of states) {
    const dir = path.join(KDIR, s.id);
    fs.mkdirSync(dir, { recursive: true });
    const tmp1 = path.join(tmpDir('k'), 'k1.json'), tmp2 = path.join(tmpDir('k'), 'k2.json');
    const [r1, r2] = await Promise.all([
      job(s.id, stateOpts(s, { planner: true, 'knowledge-out': tmp1 })),
      job(s.id, stateOpts(s, { planner: true, 'knowledge-out': tmp2 })),
    ]);
    const a1 = fs.existsSync(tmp1) ? fs.readFileSync(tmp1, 'utf8') : null, a2 = fs.existsSync(tmp2) ? fs.readFileSync(tmp2, 'utf8') : null;
    const twiceEqual = !!a1 && a1 === a2;
    const K = a1 ? JSON.parse(a1) : null;
    out[s.key] = K;
    const golden = path.join(dir, `${s.key}.json`);
    let goldenOk = null, goldenNote = '';
    if (a1) {
      if (a['write-goldens'] || !fs.existsSync(golden)) { fs.writeFileSync(golden, a1); goldenOk = true; goldenNote = `golden written (${(a1.length / 1024).toFixed(0)} KB)`; }
      else { goldenOk = fs.readFileSync(golden, 'utf8') === a1; goldenNote = goldenOk ? 'byte-equal to the committed golden' : 'DIFFERS from the committed golden'; }
    }
    row({ gate: `P1a-2 knowledge() dump twice equal + golden — ${s.note}`, id: s.id, leg: s.key, ok: !!r1.ok && !!r2.ok && twiceEqual && goldenOk !== false, ticks: r1.ticks, gameSeconds: r1.gameSeconds, diff: r1.diff, hash: r1.hash,
      notes: `goals ${K?.counts?.total} (${JSON.stringify(K?.counts?.byKind)}), hidden ${K?.counts?.hidden}, unprobeable ${K?.counts?.unprobeable}, dimensions ${K?.dimensions?.length}; twice equal ${twiceEqual}; ${goldenNote}; walk ${r1.knowledge_ms} ms (run wall ${r1.load?.wallMs} ms, load ${r1.load?.start})` });
  }
  // spot checks against the source
  const spotRows = SPOTS.map(([key, id, field, want]) => {
    const K = out[key];
    const g = K ? (K.goals.find((x) => x.id === id) || K.hidden.find((x) => x.id === id)) : null;
    const got = g ? g[field] : undefined;
    return { key, id, field, want, got, ok: String(got) === String(want) };
  });
  row({ gate: 'P1a-2 spot checks: the walk reproduces the source (digest §3 / layers.js) BY MEASUREMENT', id: 'ptr+something', leg: `${spotRows.length} claims`, ok: spotRows.every((x) => x.ok), ticks: null, gameSeconds: null, diff: null, hash: null,
    notes: spotRows.map((x) => `${x.key} ${x.id}.${x.field} = ${x.got} (want ${x.want})${x.ok ? '' : ' ✗'}`).join('; ') });
  // counts against the census
  const K9 = out['ptr-M09'];
  const ids = await job('ptr', { profile: 'all', ticks: 0, diff: 1, 'ids-out': path.join(tmpDir('ids'), 'ids.json') });
  const census = ids.ok ? PTR_CENSUS : null;
  if (K9) {
    const offered = K9.counts.byKind, hiddenByKind = {};
    for (const h of K9.hidden) hiddenByKind[h.kind] = (hiddenByKind[h.kind] || 0) + 1;
    const heldAt = (kind) => {
      // held = declared − offered − hidden (what the walk must NOT have listed)
      const declared = { upg: PTR_CENSUS.upg, ms: PTR_CENSUS.ms, ach: PTR_CENSUS.ach, buy: PTR_CENSUS.buy, ch: PTR_CENSUS.ch }[kind];
      return declared - (offered[kind] || 0) - (hiddenByKind[kind] || 0);
    };
    const parts = ['upg', 'ms', 'ach', 'buy', 'ch'].map((k) => `${k}: declared ${PTR_CENSUS[k]} = offered ${offered[k] || 0} + hidden ${hiddenByKind[k] || 0} + held/out ${heldAt(k)}`);
    const ok = ['upg', 'ms', 'ach', 'buy', 'ch'].every((k) => heldAt(k) >= 0);
    row({ gate: 'P1a-2 goal counts vs the census (172 upgrades, 85 milestones, 80 achievements, 52 buyables, 9 challenges)', id: 'ptr', leg: 'all/M09', ok, ticks: K9.ticks, gameSeconds: K9.gameSeconds, diff: 1, hash: null,
      notes: `${parts.join('; ')} — "held/out" is what the walk excluded (already held, or a layer whose content it does not offer)` });
  }
  // the Time Energy cap, SEEN by measurement rather than read from layers.js:975
  const KF = out['ptr-frontier'];
  if (KF) {
    const chain = KF.chains.find((c) => c.goal === 'upg:t:12');
    const hop = chain?.hops?.find((h) => h.dimension === 'player.t.energy');
    const ok = !!hop?.impossible && !KF.producers.wait.rates['player.t.energy'];
    row({ gate: 'P1a-2 the Time Energy cap is SEEN BY MEASUREMENT (no producer moved it over the wait window)', id: 'ptr', leg: 'frontier', ok, ticks: KF.ticks, gameSeconds: KF.gameSeconds, diff: 1, hash: null,
      notes: `player.t.energy held ${hop?.held}, threshold ${hop?.threshold}; in the ${KF.producers.k}-game-second wait it is ${KF.producers.wait.rates['player.t.energy'] ? 'MOVING: ' + JSON.stringify(KF.producers.wait.rates['player.t.energy']) : 'absent from the moved set (max === min)'}; first impossible hop ${JSON.stringify(chain?.firstImpossible)}` });
  }
  // The WAIT WINDOW is a knob, and the gate prices it: the same dimension's measured rate against the window length.
  const WINDOW_DRIVE = `
var P = tmtLoader.planner, out = [];
[10, 30, 60, 150, 300].forEach(function (k) {
  out.push(P.excursion(function () {
    var d0 = new Decimal(player.b.points), min = d0, max = d0;
    for (var i = 0; i < k; i++) { tmtLoader.tick(1, 1); var v = new Decimal(player.b.points); if (v.lt(min)) min = v; if (v.gt(max)) max = v; }
    return { k: k, first: String(d0), last: String(player.b.points), min: String(min), max: String(max), rate: String(new Decimal(player.b.points).sub(d0).div(k)) };
  }));
});
return out;
`;
  const win = await job('ptr', { profile: 'all', ticks: 0, diff: 1, 'from-snapshot': FRONTIER, planner: true, 'planner-script': writeDrive('window', WINDOW_DRIVE) });
  const W = win.plannerScript || [];
  const falls = W.length === 5 && Number(W[0].rate) > Number(W[4].rate) * 2;
  row({ gate: 'P1a-2 the wait WINDOW is a knob: the measured rate of one dimension against the window length', id: 'ptr', leg: 'frontier, player.b.points', ok: !!win.ok && W.length === 5, ticks: win.ticks, gameSeconds: win.gameSeconds, diff: 1, hash: win.hash,
    notes: `${W.map((w) => `k=${w.k}: ${w.first}→${w.last} (min ${w.min}, max ${w.max}) rate ${Number(w.rate).toFixed(3)}/s`).join('; ')} — the rate ${falls ? 'FALLS by more than 2× as the window grows' : 'is stable across windows'}: a window shorter than the producing layer's reset cycle reads only its rising phase. The walk's default k is 10 (cost); --planner-k sets it` });
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/p1a-knowledge-counts.json'), Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v?.counts])));
}

// ---- Part 3: the two goal sources -------------------------------------------------------------------------------------
async function part3() {
  const states = STATES();
  const out = {};
  for (const s of states) {
    const dir = path.join(KDIR, s.id);
    fs.mkdirSync(dir, { recursive: true });
    const t1 = path.join(tmpDir('g'), 'g1.json'), t2 = path.join(tmpDir('g'), 'g2.json');
    const [r1, r2] = await Promise.all([
      job(s.id, stateOpts(s, { planner: true, 'planner-ladder': s.ladder, 'goals-out': t1 })),
      job(s.id, stateOpts(s, { planner: true, 'planner-ladder': s.ladder, 'goals-out': t2 })),
    ]);
    const a1 = fs.existsSync(t1) ? fs.readFileSync(t1, 'utf8') : null, a2 = fs.existsSync(t2) ? fs.readFileSync(t2, 'utf8') : null;
    const twice = !!a1 && a1 === a2;
    const G = a1 ? JSON.parse(a1) : null;
    out[s.key] = G;
    const golden = path.join(dir, `${s.key}.goals.json`);
    let goldenOk = null, goldenNote = '';
    if (a1) {
      if (a['write-goldens'] || !fs.existsSync(golden)) { fs.writeFileSync(golden, a1); goldenOk = true; goldenNote = `golden written (${(a1.length / 1024).toFixed(0)} KB)`; }
      else { goldenOk = fs.readFileSync(golden, 'utf8') === a1; goldenNote = goldenOk ? 'byte-equal to the committed golden' : 'DIFFERS from the committed golden'; }
    }
    row({ gate: `P1a-3 goals() dump twice equal + golden — ${s.note}`, id: s.id, leg: s.key, ok: !!r1.ok && !!r2.ok && twice && goldenOk !== false, ticks: r1.ticks, gameSeconds: r1.gameSeconds, diff: r1.diff, hash: r1.hash,
      notes: `sticky ${G?.counts?.sticky} (predicate-only ${G?.counts?.predicateOnly}), discovered ${G?.counts?.discovered}; first sticky ${G?.sticky?.[0]?.mark}; twice equal ${twice}; ${goldenNote}; goals ${r1.goals_ms} ms after a ${r1.knowledge_ms} ms walk` });
  }
  // the frontier's first sticky entries and the wall each chain names
  const GF = out['ptr-frontier'];
  if (GF) {
    const first = GF.sticky.slice(0, 6);
    const named = first.map((e) => `${e.mark} [${(e.resolved.map((r) => r.id).concat(e.values.map((v) => v.id))).join(' ')}] → ${e.chains.map((c) => c.firstImpossible ? `${c.goal}: ${c.firstImpossible.impossible.why}${c.firstImpossible.impossible.requires ? ` (${c.firstImpossible.impossible.layer} needs ${c.firstImpossible.impossible.requires} in ${c.firstImpossible.impossible.requiresDimension}, base ${c.firstImpossible.impossible.baseAmount})` : ''}` : `${c.goal}: no impossible hop`).join(' ; ')}`);
    const ok = first.length > 0 && first.every((e) => e.chains.length > 0 || e.kind === 'predicate-only');
    row({ gate: 'P1a-3 the frontier: every first sticky entry resolves, with the first impossible hop of its chain NAMED', id: 'ptr', leg: 'frontier', ok, ticks: GF.ticks, gameSeconds: GF.gameSeconds, diff: 1, hash: null, notes: named.join(' || ') });
    const top = GF.discovered.slice(0, 8).map((d) => `${d.id} (d=${d.distanceLog10 === null ? '—' : d.distanceLog10.toFixed(2)}, ${d.held}/${d.threshold}, rate ${d.rate})`);
    row({ gate: 'P1a-3 the frontier: the discovered pool is ordered by the measured distance threshold / (held + rate)', id: 'ptr', leg: 'frontier', ok: GF.discovered.length > 0, ticks: GF.ticks, gameSeconds: GF.gameSeconds, diff: 1, hash: null, notes: `${GF.discovered.length} goals; nearest 8: ${top.join('; ')}` });
  }
  // a game with NO ladder at all: discovered carries everything (the-omega-tree, TMT 2.6.6.2, no table either)
  const t = path.join(tmpDir('g'), 'omega.json');
  const r = await job('the-omega-tree', { profile: 'all', ticks: 3000, diff: 1, planner: true, 'goals-out': t });
  const G = fs.existsSync(t) ? readJSON(t) : null;
  row({ gate: 'P1a-3 a game with NO ladder: sticky is empty, discovered carries everything (the-omega-tree, no table)', id: 'the-omega-tree', leg: '3000×1 profile all', ok: !!r.ok && !!G && G.sticky.length === 0 && G.discovered.length > 0 && G.ladder === null,
    ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash, notes: `ladder ${JSON.stringify(G?.ladder)}; sticky ${G?.counts?.sticky}; discovered ${G?.counts?.discovered}; nearest ${G?.discovered?.slice(0, 5).map((d) => d.id).join(' ')}; walk ${r.knowledge_ms} ms` });
}

// ---- main -------------------------------------------------------------------------------------------------------------
const TITLES = {
  0: 'P1a part 0 (`node tools/harness/gates-p1a.mjs --part 0`) — the frontier fixture',
  1: 'P1a part 1 (`node tools/harness/gates-p1a.mjs --part 1`) — snapshot / restore / excursion / measure',
  2: 'P1a part 2 (`node tools/harness/gates-p1a.mjs --part 2`) — the knowledge walk',
  3: 'P1a part 3 (`node tools/harness/gates-p1a.mjs --part 3`) — the two goal sources',
};
const READING = {
  1: 'every row is a HASH comparison on the live state: an excursion (snapshot → act → restore) must leave it byte-identical, and a run that takes one must land exactly where a run that does not lands 300 ticks later.',
  2: 'the walk is measured, not read: thresholds for milestones and achievements come from binary search on a copy, rates from ticking a copy, and the spot-check row is the source (the digest) checked against what the measurement returned.',
  3: 'sticky = the ladder marks not yet held, resolved to knowledge goals through the engine\'s own predicate helpers; discovered = every offered goal ordered by threshold / (held + rate).',
};
if (PART === '0') await part0();
else if (PART === '1') await part1();
else if (PART === '2') await part2();
else if (PART === '3') await part3();
else throw new Error(`no part ${PART}`);

if (!a['no-summary']) appendSection({ title: TITLES[PART] || `P1a part ${PART}`, commit, dirty, rows, reading: READING[PART] || '', slug: `gates-p1a-part${PART}` });
else writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-p1a-part${PART}-last.json`), { commit, dirty, rows });
console.log(`gates-p1a part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
process.exit(rows.every((r) => r.ok) ? 0 : 1);
