// The H1 gates (the harness path every rung runs on; tmt-automation-plan §6, §8). Appends one section to results/SUMMARY.md.
//   node gates-h1.mjs --part 1|2|2f|3|3v [--no-summary] [--pool N]
// Part 1 (H1-1): the ptr ladder loads (every predicate compiles in the game's global scope; the helpers exist at the lines
// the ladder names); a fresh `--ladder --to M09 --snapshots` run at diff 1 under the A2 configuration
// (kinds=reset,upgrades,buyables) lands on the pinned ticks with the pinned `hashGame`; the same run with every kind
// (the S1 frontier configuration) to M01–M10; every snapshot's hashGame equals its mark's and survives the import
// round trip (0 ticks after --from-snapshot: the same hash and hashGame). Snapshots are written to
// tools/harness/snapshots/ptr/{pinned,all}/ (committed fixtures).
// Part 2 (H1-2): resume fidelity — from pinned/M07 to M09 (same game-seconds + hashGame as the fresh run), and the
// --no-runtime control. Part 2f: the frontier from all/M09 twice (S1's frontier row) + the §12d stall from pinned/M09,
// with the digest's Q1/Q2 numbers at the stop (a quiet box: pool ≤ 2).
// Part 3 (H1-3): the diff calibration — diff 1 / 5 / 20 / 60, twice each, ptr `--to M09` and Something Tree's five pinned
// marks; wall-clock and box load per run; the ladders' `diff` fields filled by the 2 % rule. Part 3v: the ladder-diff run.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, writeJSON, readLadder, writeLadder, firstDivergence, maskedPlayer } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { ladderSlice } from './run.mjs';

const a = parseArgs(process.argv.slice(2), ['no-summary', 'rerender']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} diff=${r.diff ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 300)}`); };

const PTR_LADDER = 'tools/harness/ladder/ptr.json', ST_LADDER = 'tools/harness/ladder/something.json';
const SNAP = { pinned: 'tools/harness/snapshots/ptr/pinned', all: 'tools/harness/snapshots/ptr/all' };
const KINDS_PINNED = 'kinds=reset,upgrades,buyables';
const DETECT = { stall: 3600, 'stall-seen': true, 'wall-ms': 540000 };
// The brief's pins (SUMMARY rows; S1-1 @777eceeb re-pinned every one with its hashGame): [ticks, hashGame | null].
// M04 / M06 are A2-2 marks recorded before hashGame existed (ticks only). M05 / M09 were recorded under other predicates
// (b.best/g.best ≥ 15; t, e and s unlocked) at the same tick — the state after a tick is the state, so the hash applies.
const PTR_PINS = { M02: [1361, '7b9f1114d17a0166'], M03: [2360, '25f914a09d1019b1'], M04: [2629, null], M05: [2936, '3e5f28bd379c52e0'], M06: [3540, null], M07: [3550, 'ff624de18438f176'], M08: [6037, 'b6fc0204a69bc54a'], M09: [8035, '6511fcca2c6ae896'] };
// S1 §10a.4 (the frontier, every kind, fresh game) and §12d / S1-1s (kinds restricted)
const FRONTIER = { ticks: 14131, lastProgress: 10531, hash: '63f28e099536a119', hashGame: 'f7a8854358ac4029' };
const STALL12D = { ticks: 14131, lastProgress: 10531, hashGame: 'f53368c9f575c56f' };
const Q_EVAL = "({unlockOrder: {t: player.t.unlockOrder, e: player.e.unlockOrder, s: player.s.unlockOrder}, space: layers.s.space(), spent: player.s.spent, sBest: player.s.best, sPoints: player.s.points, buildings: player.s.buyables, a53: hasAchievement('a', 53), tEnergy: player.t.energy, tPoints: player.t.points, ePoints: player.e.points, enhancers: player.e.buyables[11], gPower: player.g.power, points: player.points})";

// ---- a pool of run.mjs children ---------------------------------------------------------------------------------------
const POOL = Number(a.pool || (PART === '2f' ? 2 : PART === '3' || PART === '3v' ? 2 : PART === '3r' ? 3 : 4));
let running = 0;
const queue = [];
const uptime = () => { try { return execFileSync('uptime', { encoding: 'utf8' }).trim().replace(/.*load average:\s*/, ''); } catch { return null; } };
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-h1-')), 'r.json');
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
const tmpDir = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `tmt-loader-h1-${p}-`));
const readSnap = (f) => JSON.parse(fs.readFileSync(path.resolve(REPO, f), 'utf8'));
const fmtM = (m) => (m ? `${m.ticks}/${m.gameSeconds}s/${m.hashGame}` : 'NOT MET');

// ---- Part 1 -----------------------------------------------------------------------------------------------------------
async function part1() {
  const L = readLadder(PTR_LADDER);
  const ids = L.marks.map((m) => m.id);
  const want = Array.from({ length: 53 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`);
  const shapeOk = JSON.stringify(ids) === JSON.stringify(want) && L.marks.every((m) => typeof m.name === 'string' && typeof m.predicate === 'string' && m.predicate && m.wall !== undefined && m.source && m.source.plan && 'diff' in m);
  const pf = path.join(tmpDir('preds'), 'preds.json');
  fs.writeFileSync(pf, JSON.stringify(L.marks.map((m) => [m.id, m.predicate])));
  const helperNames = Object.keys(L.helpers).filter((h) => h !== 'Decimal');
  const boot = job('ptr', { ticks: 0, diff: 1, profile: 'all', predicates: pf, eval: `({${helperNames.map((h) => `${h}: typeof ${h}`).join(', ')}, Decimal: typeof Decimal})` });
  // M37's getBuyableAmount: PTR's utils.js returns a plain 0 while the layer is not unl() — the same predicate once ps is
  // unlocked (edited in this throwaway run only)
  const m37 = L.marks.find((m) => m.id === 'M37');
  const unl = job('ptr', { ticks: 0, diff: 1, eval: `(player.ps.unlocked = true, (function(){ try { return { value: !!(${m37.predicate}), amount: String(getBuyableAmount('ps', 11)) }; } catch (e) { return { error: String(e) }; } })())` });

  for (const d of Object.values(SNAP)) fs.rmSync(path.join(REPO, d), { recursive: true, force: true });
  const base = { profile: 'all', diff: 1, ticks: 30000, ladder: PTR_LADDER, ...DETECT };
  const pinned = job('ptr', { ...base, to: 'M09', 'auto-opt': KINDS_PINNED, snapshots: SNAP.pinned });
  const all = job('ptr', { ...base, to: 'M10', 'until-all': true, snapshots: SNAP.all });

  const b = await boot;
  const P = b.predicates || [];
  const compiles = P.filter((p) => p.compiles).length, evaluates = P.filter((p) => p.evaluates).length;
  const throwing = P.filter((p) => p.compiles && !p.evaluates);
  row({ gate: 'H1-1 ladder loads: 53 marks, every predicate compiles (tmtLoader.predicate = new Function, global scope)', id: 'ptr', leg: 'boot, 0 ticks', ok: !!b.ok && shapeOk && P.length === 53 && compiles === 53, ticks: b.ticks, gameSeconds: b.gameSeconds, diff: 1, hash: b.hash,
    notes: `ids M01–M53 in order with name/predicate/wall/source/diff: ${shapeOk}; compile ${compiles}/53; evaluate at boot without throwing ${evaluates}/53${throwing.length ? ' — throws: ' + throwing.map((p) => `${p.name} (${p.error})`).join('; ') : ''}; true at boot: ${P.filter((p) => p.value).map((p) => p.name).join(' ') || 'none'}` });
  const u = await unl;
  row({ gate: 'H1-1 M37 predicate once ps is unl() (the boot throw is PTR returning 0, not a Decimal, for a locked layer — utils.js:657–658)', id: 'ptr', leg: 'boot, ps.unlocked edited', ok: !!u.ok && u.eval && u.eval.error === undefined && u.eval.value === false, ticks: u.ticks, gameSeconds: u.gameSeconds, diff: 1, hash: u.hash,
    notes: `eval ${JSON.stringify(u.eval)} (a throwing predicate reads false in the monitor and in table gates)` });
  const helperRows = Object.entries(L.helpers).map(([h, where]) => {
    const [file, line] = where.split(' ')[0].split(':');
    const src = fs.readFileSync(path.join(REPO, 'games/ptr', file.replace(/^games\/ptr\//, '')), 'utf8').split('\n');
    const atLine = line ? new RegExp(`^function ${h}\\s*\\(`).test(src[Number(line) - 1] || '') : /Decimal/.test(src.join('\n'));
    return [h, where, atLine, b.eval?.[h]];
  });
  row({ gate: 'H1-1 predicate helpers exist in PTR 2.2.1 at the recorded lines', id: 'ptr', leg: 'source + boot', ok: helperRows.every(([, , at, t]) => at && t === 'function'), ticks: 0, gameSeconds: 0, diff: null, hash: null,
    notes: helperRows.map(([h, w, at, t]) => `${h} @ ${w}: line ${at ? 'matches' : 'DOES NOT match'}, typeof ${t}`).join('; ') });

  const r = await pinned;
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/h1-1-pinned.json'), r);
  for (const m of ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09']) {
    const x = r.marks?.[m], pin = PTR_PINS[m];
    const ok = !!r.ok && !!x && (!pin || (x.ticks === pin[0] && (!pin[1] || x.hashGame === pin[1])));
    row({ gate: `H1-1 fresh --ladder --to M09 (${KINDS_PINNED}) ${m}`, id: 'ptr', leg: 'profile all', ok, ticks: x?.ticks, gameSeconds: x?.gameSeconds, diff: 1, hash: x?.hash,
      notes: `hashGame ${x?.hashGame}; pin ${pin ? `${pin[0]} ticks${pin[1] ? ' / ' + pin[1] + ' — equal ' + (x?.hashGame === pin[1]) : ' (no hashGame recorded)'}` : 'none (first measurement)'}; actions at the mark ${JSON.stringify(x?.actions)}` });
  }
  row({ gate: 'H1-1 the pinned run stops at --to', id: 'ptr', leg: 'profile all', ok: !!r.ok && r.ladder?.stoppedAt?.why === 'to' && r.ticks === r.marks?.M09?.ticks, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
    notes: `ladder ${JSON.stringify({ from: r.ladder?.from, to: r.ladder?.to, stoppedAt: r.ladder?.stoppedAt, reached: r.ladder?.reached?.length })}; ticks_ms ${r.ticks_ms} (${(r.ticks_ms / r.ticks).toFixed(1)} ms/tick); load ${r.load.start} → ${r.load.end}` });
  const ra = await all;
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/h1-1-all.json'), ra);
  row({ gate: 'H1-1 fresh --ladder --to M10 --until-all, every kind (the S1 frontier configuration)', id: 'ptr', leg: 'profile all', ok: !!ra.ok && ra.ladder?.stoppedAt?.why === 'to' && ra.ladder.reached.length === 10, ticks: ra.ticks, gameSeconds: ra.gameSeconds, diff: 1, hash: ra.hash,
    notes: `marks ${ra.ladder?.reached?.map((m) => `${m.id} ${m.ticks}/${m.hashGame}${r.marks?.[m.id] ? (r.marks[m.id].ticks === m.ticks && r.marks[m.id].hashGame === m.hashGame ? ' (= pinned run)' : ' (≠ pinned run)') : ''}`).join(' · ')}; S1 §10a.4: g.auto 6038, b.auto 7323; ticks_ms ${ra.ticks_ms}` });

  // the snapshots: exist, their hashGame is the mark's, the import round trip (0 ticks) returns the same hash + hashGame
  const checks = [];
  for (const [set, res, opt] of [['pinned', r, KINDS_PINNED], ['all', ra, null]]) {
    for (const w of res.snapshotsWritten || []) {
      const s = readSnap(w.file);
      checks.push([set, w, s, job('ptr', { ticks: 0, profile: 'all', 'auto-opt': opt, 'from-snapshot': w.file })]);
    }
  }
  for (const [set, w, s, p] of checks) {
    const z = await p;
    const mk = (set === 'pinned' ? r : ra).marks[w.mark];
    const ok = s.hashGame === mk.hashGame && s.ticks === mk.ticks && !!z.ok && z.hash === s.hash && z.hashGame === s.hashGame && z.ticks === s.ticks && z.gameSeconds === s.gameSeconds;
    row({ gate: `H1-1 snapshot ${set}/${w.mark}: hashGame = the mark's; import round trip (0 ticks) equal`, id: 'ptr', leg: `${set === 'pinned' ? KINDS_PINNED : 'every kind'}`, ok, ticks: s.ticks, gameSeconds: s.gameSeconds, diff: s.diff, hash: s.hash,
      notes: `${w.file}: ${w.bytes} bytes (player ${w.playerBytes}); hashGame ${s.hashGame}; after --from-snapshot --ticks 0: hash ${z.hash} hashGame ${z.hashGame} at ${z.ticks}/${z.gameSeconds}s${z.error ? '; ' + z.error : ''}` });
  }
}

// ---- Part 2 -----------------------------------------------------------------------------------------------------------
async function resumeRow(tag, from, to, opt, { control = false, fresh } = {}) {
  const dir = tmpDir('resume');
  const r = await job('ptr', { profile: 'all', ticks: 30000, ladder: PTR_LADDER, 'from-snapshot': from, to, 'auto-opt': opt, snapshots: dir, ...DETECT, 'no-runtime': control });
  const cmp = [], divs = [];
  let ok = !!r.ok && r.ladder?.stoppedAt?.why === 'to';
  for (const m of ladderSlice(path.join(REPO, PTR_LADDER), readSnap(from).mark, to).map((e) => e.id)) {
    const f = fresh[m], x = r.marks?.[m];
    const eq = !!x && !!f && x.gameSeconds === f.gameSeconds && x.ticks === f.ticks && x.hashGame === f.hashGame;
    if (!eq) ok = false;
    cmp.push(`${m}: resumed ${fmtM(x)} vs fresh ${fmtM(f)} — equal ${eq}`);
    // the first divergent key: the resumed run's snapshot at the mark vs the fresh one (masked, au dropped)
    if (x && f && x.hashGame !== f.hashGame && f.player) {
      const mine = JSON.parse(fs.readFileSync(path.join(dir, `${m}.json`), 'utf8'));
      const drop = (t) => { const o = JSON.parse(maskedPlayer(t)); delete o.au; return JSON.stringify(o); };
      const d = firstDivergence(drop(f.player), drop(mine.player));
      if (d) divs.push(`${m} first divergent key "${d.key}" — fresh …${d.a.slice(80, 200)}… resumed …${d.b.slice(80, 200)}…`);
    }
  }
  row({ gate: tag, id: 'ptr', leg: opt ? opt : 'every kind', ok: control ? !!r.ok : ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
    notes: `${control ? '(control — informative; green = it ran) ' : ''}${cmp.join(' · ')}${divs.length ? '; ' + divs.join(' · ') : ''}; resumed ${JSON.stringify(r.resumed)}; ticks_ms ${r.ticks_ms}${r.error ? '; ' + r.error : ''}` });
  return r;
}
async function part2() {
  const fresh = {};
  for (const f of fs.readdirSync(path.join(REPO, SNAP.pinned))) { const s = readSnap(path.join(SNAP.pinned, f)); fresh[s.mark] = { ticks: s.ticks, gameSeconds: s.gameSeconds, hashGame: s.hashGame, player: s.player }; }
  const freshAll = {};
  for (const f of fs.readdirSync(path.join(REPO, SNAP.all))) { const s = readSnap(path.join(SNAP.all, f)); freshAll[s.mark] = { ticks: s.ticks, gameSeconds: s.gameSeconds, hashGame: s.hashGame, player: s.player }; }
  const rows2 = [
    resumeRow('H1-2 resume pinned/M07 → --to M09: M08 and M09 at the fresh run\'s game-seconds and hashGame', `${SNAP.pinned}/M07.json`, 'M09', KINDS_PINNED, { fresh }),
    resumeRow('H1-2 control: resume pinned/M07 → M09 with --no-runtime (counters only; the registry\'s lastReset / stats and the detector start empty)', `${SNAP.pinned}/M07.json`, 'M09', KINDS_PINNED, { fresh, control: true }),
    resumeRow('H1-2 resume pinned/M02 → --to M05 (rows 0–1: the interval reset:p)', `${SNAP.pinned}/M02.json`, 'M05', KINDS_PINNED, { fresh }),
    resumeRow('H1-2 control: resume pinned/M02 → M05 with --no-runtime', `${SNAP.pinned}/M02.json`, 'M05', KINDS_PINNED, { fresh, control: true }),
    resumeRow('H1-2 resume all/M07 → --to M09, every kind', `${SNAP.all}/M07.json`, 'M09', null, { fresh: freshAll }),
  ];
  await Promise.all(rows2);
}
// Part 2f: from M09 to the stall (≈ 6100 ticks at diff 1 — 3–4 min each on a quiet box)
async function part2f() {
  const L = readLadder(PTR_LADDER);
  const o = { profile: 'all', ticks: 100000, ladder: PTR_LADDER, to: 'M53', ...DETECT, eval: Q_EVAL };
  const runs = [
    ['H1-2 FRONTIER from all/M09 (every kind), run 1', job('ptr', { ...o, 'from-snapshot': `${SNAP.all}/M09.json` }), FRONTIER, null],
    ['H1-2 FRONTIER from all/M09 (every kind), run 2', job('ptr', { ...o, 'from-snapshot': `${SNAP.all}/M09.json` }), FRONTIER, null],
  ];
  const done = [];
  for (const [tag, p, want] of runs) {
    const r = await p;
    done.push(r);
    const ok = !!r.ok && r.stall?.stalled && !r.stall?.walled && r.ticks === want.ticks && r.stall?.lastProgress?.ticks === want.lastProgress && r.hash === want.hash && r.hashGame === want.hashGame;
    const second = done.length === 2;
    const equal = second && done[0].hash === done[1].hash && done[0].ticks === done[1].ticks && JSON.stringify(done[0].eval) === JSON.stringify(done[1].eval);
    row({ gate: tag + (second ? ' (twice equal)' : ''), id: 'ptr', leg: 'profile all, --from-snapshot', ok: ok && (!second || equal), ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
      notes: `S1 §10a.4: stalled ${want.ticks} / last progress ${want.lastProgress} / ${want.hash} (game ${want.hashGame}); resumed: stalled ${r.stall?.stalled} walled ${r.stall?.walled} last progress ${r.stall?.lastProgress?.ticks} (${r.stall?.lastProgress?.gameSeconds} s), game ${r.hashGame}${second ? `; equal to run 1 ${equal}` : ''}; ladder reached ${r.ladder?.reached?.map((m) => `${m.id}@${m.ticks}`).join(' ') || 'none'}; doubles ${r.hook?.doubles}; actions ${JSON.stringify(r.hook?.actions)}; ticks_ms ${r.ticks_ms} (${(r.ticks_ms / Math.max(1, r.ticks - 8035)).toFixed(1)} ms/tick resumed); load ${r.load.start} → ${r.load.end}` });
    if (!second) {
      const q = r.eval || {};
      row({ gate: 'H1-2 frontier numbers for R1 (digest §6 Q1 / Q2): unlockOrder, space(), spent, buildings', id: 'ptr', leg: 'at the stop', ok: !!r.ok && q.error === undefined, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
        notes: `unlockOrder t ${q.unlockOrder?.t} / e ${q.unlockOrder?.e} / s ${q.unlockOrder?.s}; layers.s.space() ${q.space}; player.s.spent ${q.spent}; s.best ${q.sBest} (s.points ${q.sPoints}); a53 ${q.a53}; buildings ${JSON.stringify(q.buildings)}; t.energy ${q.tEnergy}; t ${q.tPoints} TC; e ${q.ePoints} EP, Enhancers ${q.enhancers}; g.power ${q.gPower}; points ${q.points}` });
      writeJSON(path.join(REPO, 'tools/harness/results/tmp/h1-2-frontier.json'), r);
    }
  }
  const s = await job('ptr', { ...o, 'from-snapshot': `${SNAP.pinned}/M09.json`, 'auto-opt': KINDS_PINNED });
  row({ gate: `H1-2 §12d stall from pinned/M09 (${KINDS_PINNED})`, id: 'ptr', leg: 'profile all, --from-snapshot', ok: !!s.ok && s.stall?.stalled && !s.stall?.walled && s.ticks === STALL12D.ticks && s.stall?.lastProgress?.ticks === STALL12D.lastProgress && s.hashGame === STALL12D.hashGame, ticks: s.ticks, gameSeconds: s.gameSeconds, diff: 1, hash: s.hash,
    notes: `§12d / S1-1s: stalled ${STALL12D.ticks} / last progress ${STALL12D.lastProgress} / game ${STALL12D.hashGame}; resumed: stalled ${s.stall?.stalled} walled ${s.stall?.walled} last progress ${s.stall?.lastProgress?.ticks}, game ${s.hashGame}; Q numbers ${JSON.stringify(s.eval)}; ticks_ms ${s.ticks_ms}; load ${s.load.start} → ${s.load.end}` });
}

// ---- Part 3 -----------------------------------------------------------------------------------------------------------
const DIFFS = [1, 5, 20, 60];
const CAL = {
  ptr: { ladder: PTR_LADDER, to: 'M09', last: 9, gs: 12000, eval: 'String(player.t.energy)' },
  something: { ladder: ST_LADDER, to: 'S05', last: 5, gs: 3000, eval: null },
};
const within = (x, y) => Math.abs(x - y) / y <= 0.02;
async function part3() {
  // --rerender: the rows and the ladder fields from the saved calibration JSON (no new runs) — used once, when the first
  // record's row criterion counted a diff that does not reach a mark as RED
  if (a.rerender) return renderCalibration(JSON.parse(fs.readFileSync(path.join(REPO, 'tools/harness/results/tmp/h1-3-calibration.json'), 'utf8')));
  const jobs = [];
  // diff 1 first (the reference) — then coarse; twice each; Something Tree's runs are seconds long
  for (const d of DIFFS) for (const game of ['ptr', 'something']) for (const run of [1, 2]) {
    const C = CAL[game], dir = tmpDir(`cal-${game}-${d}`);
    jobs.push({ game, d, run, dir, p: job(game, { profile: 'all', diff: d, ticks: Math.ceil(C.gs / d), ladder: C.ladder, to: C.to, 'auto-opt': KINDS_PINNED, snapshots: dir, ...DETECT }) });
  }
  const res = {};
  for (const j of jobs) {
    const r = await j.p;
    const L = readLadder(CAL[j.game].ladder);
    const ids = L.marks.slice(0, CAL[j.game].last).map((m) => m.id);
    const marks = Object.fromEntries(ids.map((m) => [m, r.marks?.[m] ? { ticks: r.marks[m].ticks, gameSeconds: r.marks[m].gameSeconds, hashGame: r.marks[m].hashGame } : null]));
    let tEnergy = null;
    if (j.game === 'ptr' && fs.existsSync(path.join(j.dir, 'M09.json'))) tEnergy = String(JSON.parse(JSON.parse(fs.readFileSync(path.join(j.dir, 'M09.json'), 'utf8')).player).t.energy);
    (res[j.game] ||= {})[`${j.d}/${j.run}`] = { ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, ticks_ms: r.ticks_ms, load: r.load, marks, tEnergy, why: r.ladder?.stoppedAt?.why, error: r.error };
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/h1-3-calibration.json'), { commit, dirty, date: new Date().toISOString(), res });
  return renderCalibration({ commit, dirty, res });
}
function renderCalibration({ commit, dirty, res }) {
  for (const game of ['ptr', 'something']) {
    const R = res[game], C = CAL[game];
    const L = readLadder(C.ladder);
    const ids = L.marks.slice(0, C.last).map((m) => m.id);
    const ref = R['1/1'].marks;
    for (const d of DIFFS) for (const run of [1, 2]) {
      const x = R[`${d}/${run}`];
      const twin = R[`${d}/${run === 1 ? 2 : 1}`];
      const equal = JSON.stringify(x.marks) === JSON.stringify(twin.marks);
      const cells = ids.map((m) => { const v = x.marks[m], r1 = ref[m]; if (!v || !r1) return `${m} ${v ? v.gameSeconds : 'NOT MET'}`; const pct = ((v.gameSeconds - r1.gameSeconds) / r1.gameSeconds * 100); return `${m} ${v.gameSeconds}s (${pct >= 0 ? '+' : ''}${pct.toFixed(2)} %${within(v.gameSeconds, r1.gameSeconds) ? '' : ' ✗'}${d !== 1 ? (v.hashGame === r1.hashGame ? ', hash =' : ', hash ≠') : ''})`; });
      const msTick = x.ticks ? x.ticks_ms / x.ticks : null;
      const dayWall = x.gameSeconds ? x.ticks_ms / x.gameSeconds * 86400 / 1000 : null;
      row({ gate: `H1-3 calibration ${game} diff ${d} run ${run}`, id: game, leg: `profile all, ${KINDS_PINNED}, --to ${C.to}`, ok: x.ok && equal && (d !== 1 || x.why === 'to'), ticks: x.ticks, gameSeconds: x.gameSeconds, diff: d, hash: null,
        notes: `${d !== 1 ? `ended ${x.why}; ` : ''}${cells.join(' · ')}; twice equal ${equal}; ticks_ms ${x.ticks_ms} (${msTick?.toFixed(2)} ms/tick; a game-day ≈ ${dayWall ? (dayWall / 60).toFixed(1) : '—'} min wall); load (1/5/15 min) start ${x.load.start} end ${x.load.end}${game === 'ptr' ? `; t.energy at M09 ${x.tEnergy}` : ''}${x.error ? '; ' + x.error : ''}` });
    }
    // the ladder's diff: the coarsest diff whose BOTH runs land within 2 % of diff 1's game-seconds (hashes differ — timing is the criterion)
    const date = new Date().toISOString().slice(0, 10);
    const chosen = [];
    for (const m of L.marks.slice(0, C.last)) {
      let best = null;
      for (const d of DIFFS) {
        const r1 = ref[m.id];
        const ok = r1 && [1, 2].every((run) => R[`${d}/${run}`].marks[m.id] && within(R[`${d}/${run}`].marks[m.id].gameSeconds, r1.gameSeconds));
        if (ok) best = d;
      }
      m.diff = best;
      m.diffSource = `H1-3 @${commit}${dirty ? ' (dirty)' : ''} ${date}: ${DIFFS.map((d) => `×${d} ${R[`${d}/1`].marks[m.id]?.gameSeconds ?? '—'}s`).join(', ')} (within 2 % of ×1: ${DIFFS.filter((d) => ref[m.id] && [1, 2].every((run) => R[`${d}/${run}`].marks[m.id] && within(R[`${d}/${run}`].marks[m.id].gameSeconds, ref[m.id].gameSeconds))).join(', ') || 'none'})`;
      chosen.push(`${m.id} ×${best}`);
    }
    writeLadder(C.ladder, L);
    row({ gate: `H1-3 ladder diff fields set (${C.ladder})`, id: game, leg: 'the 2 % rule', ok: L.marks.slice(0, C.last).every((m) => m.diff !== null), ticks: null, gameSeconds: null, diff: null, hash: null,
      notes: `${chosen.join(' · ')}; later marks stay null` });
  }
}
// Part 3v: the ladder-diff run — consecutive marks sharing a diff form one segment; a segment starts from the previous
// segment's last snapshot; each mark must land within 2 % of the diff-1 calibration run's game-seconds.
async function part3v() {
  const cal = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/harness/results/tmp/h1-3-calibration.json'), 'utf8'));
  for (const game of ['ptr', 'something']) {
    const C = CAL[game], L = readLadder(C.ladder);
    const marks = L.marks.slice(0, C.last);
    const segs = [];
    for (const m of marks) { if (segs.length && segs[segs.length - 1].diff === m.diff) segs[segs.length - 1].ids.push(m.id); else segs.push({ diff: m.diff, ids: [m.id] }); }
    const dir = tmpDir(`ladderdiff-${game}`);
    let from = null, wall = 0, ok = true;
    const cells = [];
    for (const s of segs) {
      const to = s.ids[s.ids.length - 1];
      const r = await job(game, { profile: 'all', diff: s.diff, ticks: Math.ceil(C.gs / s.diff), ladder: C.ladder, to, 'auto-opt': KINDS_PINNED, snapshots: dir, ...DETECT, ...(from ? { 'from-snapshot': from } : {}) });
      wall += r.ticks_ms || 0;
      for (const m of s.ids) {
        const x = r.marks?.[m], r1 = cal.res[game]['1/1'].marks[m];
        const good = !!x && !!r1 && within(x.gameSeconds, r1.gameSeconds);
        if (!good) ok = false;
        cells.push(`${m} ×${s.diff} ${x ? x.gameSeconds : 'NOT MET'}s vs ×1 ${r1?.gameSeconds}s${good ? '' : ' ✗'}`);
      }
      if (!r.ok || r.ladder?.stoppedAt?.why !== 'to') { ok = false; cells.push(`segment → ${to} ended ${r.ladder?.stoppedAt?.why} ${r.error || ''}`); break; }
      from = path.join(dir, `${to}.json`);
    }
    row({ gate: `H1-3 ladder-diff run (${segs.map((s) => `×${s.diff} → ${s.ids[s.ids.length - 1]}`).join(', ')})`, id: game, leg: `profile all, ${KINDS_PINNED}`, ok, ticks: null, gameSeconds: null, diff: 'per mark', hash: null,
      notes: `${cells.join(' · ')}; segments ${segs.length}; ticks_ms total ${wall}` });
  }
}

// Part 3r: the calibration a rung actually needs — from each committed pinned snapshot to the NEXT mark at diff 5 / 20 / 60,
// twice each; the reference is the fresh diff-1 run (= the next snapshot; H1-2 shows a diff-1 resume lands on it exactly).
// Fills `diffFromPrev` (the coarsest diff usable for the stretch from the previous mark's snapshot).
async function part3r() {
  const L = readLadder(PTR_LADDER);
  const snaps = Object.fromEntries(fs.readdirSync(path.join(REPO, SNAP.pinned)).map((f) => { const s = readSnap(path.join(SNAP.pinned, f)); return [s.mark, s]; }));
  const ids = L.marks.slice(0, 9).map((m) => m.id);
  const jobs = [];
  for (let i = 1; i < ids.length; i++) for (const d of [5, 20, 60]) for (const run of [1, 2]) {
    const prev = snaps[ids[i - 1]], next = snaps[ids[i]];
    const span = next.gameSeconds - prev.gameSeconds;
    jobs.push({ m: ids[i], d, run, p: job('ptr', { profile: 'all', diff: d, ticks: Math.ceil((span * 3 + 120) / d), ladder: PTR_LADDER, to: ids[i], 'from-snapshot': `${SNAP.pinned}/${ids[i - 1]}.json`, 'auto-opt': KINDS_PINNED, stall: 3600, 'stall-seen': true, 'wall-ms': 540000 }) });
  }
  const R = {};
  for (const j of jobs) { const r = await j.p; (R[j.m] ||= {})[`${j.d}/${j.run}`] = { ok: !!r.ok, gs: r.marks?.[j.m]?.gameSeconds ?? null, ticks: r.ticks, hashGame: r.marks?.[j.m]?.hashGame ?? null, why: r.ladder?.stoppedAt?.why, ticks_ms: r.ticks_ms, load: r.load, error: r.error }; }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/h1-3r-calibration.json'), { commit, dirty, date: new Date().toISOString(), R });
  const date = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < ids.length; i++) {
    const m = ids[i], prev = snaps[ids[i - 1]], ref = snaps[m];
    const span = ref.gameSeconds - prev.gameSeconds;
    const usable = [1];
    const cells = [5, 20, 60].map((d) => {
      const x1 = R[m][`${d}/1`], x2 = R[m][`${d}/2`];
      const eq = x1.gs === x2.gs && x1.hashGame === x2.hashGame;
      // within 2 % of the mark's game-seconds (the brief's rule), and — stricter — of the stretch's own length
      const okAbs = x1.gs !== null && eq && within(x1.gs, ref.gameSeconds);
      const okSpan = okAbs && Math.abs(x1.gs - ref.gameSeconds) <= 0.02 * span;
      if (okAbs) usable.push(d);
      return `×${d}: ${x1.gs ?? 'NOT MET (' + x1.why + ')'}${x1.gs !== null ? ` (${(x1.gs - ref.gameSeconds >= 0 ? '+' : '')}${x1.gs - ref.gameSeconds} s = ${((x1.gs - ref.gameSeconds) / ref.gameSeconds * 100).toFixed(2)} % of the mark, ${((x1.gs - ref.gameSeconds) / span * 100).toFixed(1)} % of the stretch${okSpan ? '' : okAbs ? '; outside 2 % of the stretch' : ' ✗'})` : ''}, twice equal ${eq}, ${x1.ticks_ms} ms`;
    });
    const lm = L.marks.find((x) => x.id === m);
    lm.diffFromPrev = Math.max(...usable);
    lm.diffFromPrevSource = `H1-3r @${commit}${dirty ? ' (dirty)' : ''} ${date}: from pinned/${ids[i - 1]} (${prev.gameSeconds} s) — ×1 ${ref.gameSeconds} s (the fresh run), ${[5, 20, 60].map((d) => `×${d} ${R[m][`${d}/1`].gs ?? '—'} s`).join(', ')}`;
    const allRan = [5, 20, 60].every((d) => R[m][`${d}/1`].ok && R[m][`${d}/2`].ok && R[m][`${d}/1`].gs === R[m][`${d}/2`].gs);
    row({ gate: `H1-3r from pinned/${ids[i - 1]} → ${m} at a coarse diff`, id: 'ptr', leg: `profile all, ${KINDS_PINNED}, --from-snapshot`, ok: allRan, ticks: null, gameSeconds: ref.gameSeconds, diff: '5/20/60', hash: null,
      notes: `stretch ${prev.gameSeconds} → ${ref.gameSeconds} s (${span} s) at ×1; ${cells.join(' · ')}; diffFromPrev = ×${lm.diffFromPrev}; load ${R[m]['5/1'].load.start}` });
  }
  writeLadder(PTR_LADDER, L);
}

const parts = { 1: part1, 2: part2, '2f': part2f, 3: part3, '3v': part3v, '3r': part3r };
if (!parts[PART]) throw new Error(`no part ${PART}`);
await parts[PART]();
const READING = {
  1: 'marks compare `hashGame` (the state without player.au); pins are the SUMMARY rows S1-1 re-pinned at 777eceeb. Snapshots are written to tools/harness/snapshots/ptr/{pinned,all}/ and committed.',
  3: 'per mark: game-seconds and the % against diff 1 run 1 (✗ = outside 2 %); "hash =/≠" compares the mark\'s hashGame with diff 1 (a coarse diff is a different trajectory — timing is the criterion). Load = `uptime` 1/5/15-min averages at the child\'s spawn and exit (pool 2).',
};
if (!a['no-summary']) appendSection({ title: `H1 part ${PART} (\`node tools/harness/gates-h1.mjs --part ${PART}\`)`, commit, dirty, rows, reading: READING[PART] || '', slug: `gates-h1-part${PART}` });
console.log(`gates-h1 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
process.exit(rows.every((r) => r.ok) ? 0 : 1);
