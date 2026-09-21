// The P1b gates (the advanced planner DECIDES: epochs × candidate configurations of the simple system —
// tmt-automation-plan §11f, §12 P1b; docs/planner.md). Appends one section to results/SUMMARY.md.
//   node gates-p1b.mjs --part 1|2|2s [--no-summary] [--no-sweeps] [--pool N] [--k N] [--screenK N] [--legs N] [--hours H] [--wall MS]
//   --part 2 runs the campaign, the controls, Something Tree, the clocks AND the sweeps; --part 2s is the sweeps alone.
//
// Part 1 (P1b-1): the round.
//   (a) DETERMINISM: two --planner=auto runs from snapshots/ptr/all/M02 for 1500 game-seconds end at the same hashGame
//       with identical round logs (the logs compared with their `cost` blocks stripped — wall-clock ms is the one thing
//       in the record no decision reads).
//   (b) THE OPENING under the planner: a fresh game to M09, chained through --stop-snapshot in ≤ 9-minute processes,
//       each mark's game-second against the simple system's table (M01 1 · M02 1361 · M03 2360 · M04 2629 · M05 2936 ·
//       M06 3540 · M07 3550 · M08 6037 · M09 8035). The criterion is "no mark later than the table's by more than one
//       epoch length" — the planner spends an epoch before it can react, so a one-epoch lag is the floor, not a defect.
//   (c) the same on SOMETHING TREE (2.7) from a fresh game to S05 — the generality control (A2-1: 309 / 399 / 579).
//   (d) LIVE vs COPY: every committed epoch that ran to its full length must end on the hashGame the winner's
//       measurement ended on. The planner records any inequality as a defect (`divergences`); this row asserts it is
//       empty in every run of the part, including the chained legs.
//   (e) COST: wall ms per round and per epoch, the measured game-seconds per round, and the opening's total wall
//       against the simple system's same opening (the control run).
// Part 2 (P1b-2): the stall clocks and the frontier campaign — see the header of part2() below.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, writeJSON, entryOnly, withPreF1, PRE_F1 } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);  // a battery, not a library — see lib.mjs

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-sweeps']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 400)}`); };

const PTR_LADDER = 'tools/harness/ladder/ptr.json', ST_LADDER = 'tools/harness/ladder/something.json';
const SNAP = { M02: 'tools/harness/snapshots/ptr/all/M02.json', M09: 'tools/harness/snapshots/ptr/all/M09.json' };
const FRONTIER = 'tools/harness/snapshots/ptr/frontier/STALL.json';
const ST_DIR = 'tools/harness/snapshots/something/all';
// The SIMPLE system's opening, measured (A1-3 / A2-2 / A2-3, re-pinned S1-1 @777eceeb; the ladder's `source.reached`).
const SIMPLE_PTR = { M01: 1, M02: 1361, M03: 2360, M04: 2629, M05: 2936, M06: 3540, M07: 3550, M08: 6037, M09: 8035 };
// Something Tree under profile `all`, every kind, diff 1 (P1a-0's fixtures): S01 6 · S02 308 · S03 309 · S04 399 · S05 579.
const SIMPLE_ST = { S01: 6, S02: 308, S03: 309, S04: 399, S05: 579 };
const WALL = Number(a.wall || 480000);                 // one process's tick budget; a round runs between ticks (--wall for a smoke run)
const K = Number(a.k || 300), SCREENK = Number(a.screenK || 4);
const PLANNER_OPT = (o = {}) => Object.entries({ k: K, screenK: SCREENK, ...o }).map(([k, v]) => `${k}=${v}`).join(';');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-p1b-'));

// ---- a pool of run.mjs children ---------------------------------------------------------------------------------
const POOL = Number(a.pool || 2);
let running = 0;
const queue = [];
const uptime = () => { try { return execFileSync('uptime', { encoding: 'utf8' }).trim().replace(/.*load average:\s*/, ''); } catch { return null; } };
function pump() {
  while (running < POOL && queue.length) {
    const { id, o: o0, resolve } = queue.shift();
    const o = withPreF1(o0);   // F1: every leg of this historical gate names the pre-F1 configuration (lib.mjs PRE_F1)
    running++;
    const out = path.join(fs.mkdtempSync(path.join(TMP, 'job-')), 'r.json');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out];
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null || v === false) continue;
      // ⚠ `--planner auto` (a space) is NOT the same flag: run.mjs parses --planner as a boolean, so the mode would land
      // in the positionals and the planner would load INERT — a chained battery that quietly measures the simple system
      // and prints its numbers as the planner's (measured: the first smoke run reproduced the table exactly, 0 rounds).
      if (k === 'planner') { args.push(`--planner=${v === true ? 'auto' : v}`); continue; }
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
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const marksFile = (ladder, ids) => {
  const L = readJSON(path.join(REPO, ladder));
  const f = path.join(fs.mkdtempSync(path.join(TMP, 'marks-')), 'marks.json');
  fs.writeFileSync(f, JSON.stringify(L.marks.filter((m) => !ids || ids.includes(m.id)).map((m) => [m.id, m.predicate])));
  return f;
};
/** A round log with everything a clock wrote stripped — what two runs must agree on byte for byte. */
const stripCost = (rep) => JSON.stringify(rep.log.map((r) => { const { cost, ...rest } = r; return rest; }));

/**
 * One run chained through --stop-snapshot into as many ≤ WALL processes as it takes (the 9-minute rule). The planner's
 * own memory rides in `runtimeState`, so a chained leg CONTINUES the campaign — the reached marks, the stall clocks and
 * the committed configuration all survive the process boundary.
 *   targetGs  stop once this many game-seconds have been played from the start state (the campaign's 6 game-hours)
 *   legTicks  the ticks one leg asks for (a leg may be cut shorter by the wall; the next one continues)
 *   evalExpr  evaluated at every leg's stop — the per-leg readout the curves are made of
 */
async function chained(id, { from = null, marks, stopMark, ticks = 200000, legTicks = null, targetGs = null, legs = Number(a.legs || 8),
  planner = 'auto', plannerOpt = PLANNER_OPT(), ladder = null, opt = {}, evalExpr = null, tag = 'chain' }) {
  const dir = fs.mkdtempSync(path.join(TMP, `${tag}-`));
  let snapshot = from, startGs = null;
  const all = { tag, marks: {}, rounds: [], divergences: [], legs: [], samples: [], wallMs: 0, plannerWallMs: 0, measuredGameSeconds: 0 };
  for (let leg = 0; leg < legs; leg++) {
    const roundsFile = path.join(dir, `leg${leg}.rounds.json`);
    const want = targetGs !== null && startGs !== null ? Math.max(1, Math.min(legTicks ?? ticks, targetGs - (all.gameSeconds - startGs))) : (legTicks ?? ticks);
    const r = await job(id, {
      profile: 'all', diff: 1, ticks: want, 'wall-ms': WALL, marks, 'marks-continue': true, 'stop-mark': stopMark, 'auto-opt': PIN_RESET_P,
      ...(snapshot ? { 'from-snapshot': snapshot } : {}),
      ...(planner ? { planner, 'planner-ladder': ladder, 'planner-opt': plannerOpt, 'rounds-out': roundsFile } : {}),
      ...(evalExpr ? { eval: evalExpr } : {}),
      'stop-snapshot': dir, 'stop-snapshot-name': `LEG${leg}`, ...opt,
    });
    all.legs.push({ leg, ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, wallMs: r.load.wallMs, rounds: r.planner?.rounds ?? null, mode: r.planner?.mode ?? null, error: r.error || null, load: r.load });
    all.wallMs += r.load.wallMs;
    if (!r.ok) { all.error = r.error; break; }
    if (planner && r.planner?.mode !== 'auto' && r.planner?.mode !== 'suggest') { all.error = `leg ${leg} did not DRIVE the planner (mode ${r.planner?.mode ?? 'absent'}) — the run measured the simple system`; break; }
    if (startGs === null) startGs = (r.fromSnapshot?.gameSeconds ?? 0);
    for (const [m, v] of Object.entries(r.marks || {})) if (v && !all.marks[m]) all.marks[m] = v;
    if (evalExpr) all.samples.push({ leg, gameSeconds: r.gameSeconds, ticks: r.ticks, eval: r.eval });
    const rep = planner && fs.existsSync(roundsFile) ? readJSON(roundsFile) : null;
    if (rep) {
      all.rounds.push(...rep.log); all.divergences.push(...rep.divergences);
      all.plannerWallMs += rep.log.reduce((t, x) => t + (x.cost?.wallMs || 0), 0);
      all.measuredGameSeconds += rep.log.reduce((t, x) => t + (x.cost?.measuredGameSeconds || 0), 0);
      all.options = rep.options; all.report = { reached: rep.reached, abandoned: rep.abandoned, clocks: rep.clocks };
    }
    all.ticks = r.ticks; all.gameSeconds = r.gameSeconds; all.hashGame = r.hashGame; all.hash = r.hash; all.summary = r.summary;
    if (r.marks && stopMark && r.marks[stopMark]) { all.stopped = 'mark'; break; }
    if (targetGs !== null && all.gameSeconds - startGs >= targetGs) { all.stopped = 'target'; break; }
    const snapFile = path.join(dir, `LEG${leg}.json`);
    if (!fs.existsSync(snapFile)) { all.stopped = 'no-snapshot'; break; }
    snapshot = snapFile;
    if (leg === legs - 1) all.stopped = 'legs';
  }
  return all;
}

// ---- Part 1 -------------------------------------------------------------------------------------------------------
// R1′ (2026-09-17): the ptr table's `reset:p` moved from `interval>=10` to `gain>=2x`. Every number and fixture in this
// file was measured under the interval, so the runs name it explicitly; a pin is a measurement of a POLICY, not of which
// one the table names. (An `auto-opt` in a row's own `opt` still wins — P1b's ctl-gain2x is exactly that control.)
const PIN_RESET_P = 'policy:reset:p=interval>=10;' + PRE_F1;   // F1: named, see lib.mjs
async function part1() {
  const ptrMarks = marksFile(PTR_LADDER), stMarks = marksFile(ST_LADDER);
  // (b) and (c) and the control run in parallel with (a).
  const openP = chained('ptr', { marks: ptrMarks, stopMark: 'M09', ladder: PTR_LADDER, legs: Number(a.legs || 8) });
  const stP = chained('something', { marks: stMarks, stopMark: 'S05', ladder: ST_LADDER, legs: 3 });
  const controlP = job('ptr', { profile: 'all', diff: 1, ticks: 20000, marks: ptrMarks, 'marks-continue': true, 'stop-mark': 'M09', 'wall-ms': WALL, 'auto-opt': PIN_RESET_P });

  // (a) determinism: two identical runs from all/M02
  const detOpts = { profile: 'all', diff: 1, ticks: 1500, 'from-snapshot': SNAP.M02, 'auto-opt': PIN_RESET_P, planner: 'auto', 'planner-ladder': PTR_LADDER, 'planner-opt': PLANNER_OPT(), 'wall-ms': WALL };
  const d1f = path.join(TMP, 'det1.json'), d2f = path.join(TMP, 'det2.json');
  const [d1, d2] = await Promise.all([job('ptr', { ...detOpts, 'rounds-out': d1f }), job('ptr', { ...detOpts, 'rounds-out': d2f })]);
  const r1 = fs.existsSync(d1f) ? readJSON(d1f) : null, r2 = fs.existsSync(d2f) ? readJSON(d2f) : null;
  const logsEqual = !!(r1 && r2) && stripCost(r1) === stripCost(r2);
  row({ gate: 'P1b-1 (a) determinism: two --planner=auto runs from all/M02, 1500 game-s', id: 'ptr', leg: `k=${K} screenK=${SCREENK}`,
    ok: !!d1.ok && !!d2.ok && d1.hashGame === d2.hashGame && d1.ticks === d2.ticks && logsEqual,
    ticks: d1.ticks, gameSeconds: d1.gameSeconds, diff: 1, hash: d1.hash,
    notes: `hashGame ${d1.hashGame} vs ${d2.hashGame}; ${r1?.rounds} rounds vs ${r2?.rounds}, round logs identical (cost stripped): ${logsEqual}; commits ${r1?.commits}/${r2?.commits}; divergences ${r1?.divergences.length}/${r2?.divergences.length}; wall ${d1.load.wallMs} / ${d2.load.wallMs} ms` });

  const open = await openP;
  const late = [], table = [];
  for (const [m, gs] of Object.entries(SIMPLE_PTR)) {
    const got = open.marks[m]?.gameSeconds ?? null;
    table.push(`${m} ${got ?? '—'}/${gs}`);
    if (got === null || got > gs + K) late.push(`${m} ${got ?? 'not reached'} > ${gs}+${K}`);
  }
  row({ gate: 'P1b-1 (b) the opening under the planner: fresh game → M09, chained ≤ 8-minute processes', id: 'ptr', leg: `k=${K} screenK=${SCREENK}, ${open.legs.length} legs`,
    ok: !!open.marks.M09 && late.length === 0, ticks: open.ticks, gameSeconds: open.gameSeconds, diff: 1, hash: open.hashGame,
    notes: `planner/simple game-seconds: ${table.join(' · ')}${late.length ? ` — LATER by more than one epoch (${K}): ${late.join(', ')}` : ' — none later than the table by more than one epoch'}; ${open.rounds.length} rounds, stopped ${open.stopped}${open.error ? ` ERROR ${String(open.error).slice(0, 200)}` : ''}` });

  const st = await stP;
  const stLate = [], stTable = [];
  for (const [m, gs] of Object.entries(SIMPLE_ST)) {
    const got = st.marks[m]?.gameSeconds ?? null;
    stTable.push(`${m} ${got ?? '—'}/${gs}`);
    if (got === null || got > gs + K) stLate.push(`${m} ${got ?? 'not reached'}`);
  }
  row({ gate: 'P1b-1 (c) Something Tree (2.7) under the planner: fresh game → S05 — the generality control', id: 'something', leg: `k=${K} screenK=${SCREENK}, ${st.legs.length} legs`,
    ok: !!st.marks.S05 && stLate.length === 0, ticks: st.ticks, gameSeconds: st.gameSeconds, diff: 1, hash: st.hashGame,
    notes: `planner/simple: ${stTable.join(' · ')}${stLate.length ? ` — LATER: ${stLate.join(', ')}` : ' — none later by more than one epoch'}; ${st.rounds.length} rounds, stopped ${st.stopped}${st.error ? ` ERROR ${String(st.error).slice(0, 200)}` : ''}` });

  // (d) live vs copy
  const divs = [...open.divergences, ...st.divergences, ...(r1?.divergences || []), ...(r2?.divergences || [])];
  const fullEpochs = [...open.rounds, ...st.rounds, ...(r1?.log || []), ...(r2?.log || [])].filter((x) => x.reason === 'epoch-end' || x.reason === 'divergence').length;
  row({ gate: 'P1b-1 (d) live vs copy: every full epoch ends on the hashGame its winner measured', id: 'ptr+something', leg: 'every run of part 1',
    ok: divs.length === 0, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${fullEpochs} epochs ran to their full length across (a) (b) (c); divergences ${divs.length}${divs.length ? ': ' + JSON.stringify(divs.slice(0, 3)) : ' — the copy IS the prediction'}` });

  // (e) cost
  const ctrl = await controlP;
  const rs = open.rounds;
  const per = (f) => rs.length ? Math.round(rs.reduce((t, x) => t + (x.cost?.[f] || 0), 0) / rs.length) : null;
  row({ gate: 'P1b-1 (e) cost: the round, the epoch, and the opening against the simple system', id: 'ptr', leg: `k=${K} screenK=${SCREENK}`,
    ok: !!ctrl.ok && rs.length > 0, ticks: ctrl.ticks, gameSeconds: ctrl.gameSeconds, diff: 1, hash: ctrl.hashGame,
    notes: `per round: ${per('wallMs')} ms (knowledge ${per('knowledgeMs')} · screen ${per('screenMs')} · confirm ${per('confirmMs')} · ${per('measuredGameSeconds')} measured game-s); ${rs.length} rounds over ${open.gameSeconds} game-s = ${Math.round(open.gameSeconds / Math.max(1, rs.length))} game-s per epoch; opening wall ${Math.round(open.wallMs / 1000)} s in ${open.legs.length} legs (planning ${Math.round(open.plannerWallMs / 1000)} s, ${open.measuredGameSeconds} measured game-s) vs the SIMPLE control ${Math.round(ctrl.load.wallMs / 1000)} s to M09 at ${ctrl.marks?.M09?.gameSeconds} game-s (hashGame ${ctrl.marks?.M09?.hashGame}); load ${open.legs[0]?.load?.start} → ${open.legs[open.legs.length - 1]?.load?.end}` });
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/p1b-part1-runs.json'), { commit, dirty, k: K, screenK: SCREENK, open: { ...open, rounds: open.rounds.length }, st: { ...st, rounds: st.rounds.length }, det: { d1: d1.hashGame, d2: d2.hashGame, logsEqual }, control: { ticks: ctrl.ticks, marks: ctrl.marks, wallMs: ctrl.load.wallMs } });
}

// ---- Part 2: the stall clocks, the frontier campaign and the controls ---------------------------------------------
// (1) THE CAMPAIGN: from snapshots/ptr/frontier/STALL.json (the S1 stall), --planner=auto with the sticky ladder, for
//     `--hours` game-hours, chained through --stop-snapshot — run TWICE and required to be equal (hashGame and the round
//     log with its cost blocks stripped).
// (2) THE CONTROLS over the same stretch from the same snapshot, each stating which stall it measures:
//     (i)  the simple system unchanged (S1's frontier configuration, profile all, no planner) — the S1 stall itself;
//     (ii) everything OFF (profile off) — does anything move on its own?
//     (iii) the simple system with reset:p gain>=2x (S1's sweep winner) — is the stall the p cadence?
// (3) SOMETHING TREE from S03 for 3000 game-seconds, planner against the simple system — the 2.7 generality row.
// (4) the clocks: which goals stalled, which were abandoned and in which round, read off the campaign's log.
// Every readout is sampled at each leg's stop (`--eval`), so the curves are per LEG, with the game-second on each row;
// a wall-cut leg is shorter than the requested slice and the next leg continues from its snapshot.
const READOUT = "(function(){var o={points:String(player.points),layers:{}};for(var l in layers){if(!player[l]||layers[l].tmtLoaderLayer||isNaN(layers[l].row))continue;if(!player[l].unlocked)continue;o.layers[l]=[String(player[l].points),String(player[l].best)];}return o;})()";

// ⚠ The campaign's legs are bounded by TICKS, not by the wall. A wall-cut leg boundary depends on how loaded the box
// is, and a resume re-settles `tmp` (three passes, P1a 12a.2 item 1) — so two runs whose legs split at different
// game-seconds are not the same run, and "twice equal" would measure the box instead of the planner. LEG game-seconds
// is small enough that the wall never binds at the frontier (~2.5 min a leg there against an 8-minute wall).
async function part2() {
  const HOURS = Number(a.hours || 6), HOUR = 3600, LEG = Number(a.legTicks || 900);
  const ptrMarks = marksFile(PTR_LADDER), stMarks = marksFile(ST_LADDER);
  const campaignOpts = (tag) => ({ from: FRONTIER, marks: ptrMarks, ladder: PTR_LADDER, targetGs: HOURS * HOUR, legTicks: LEG,
    legs: Number(a.legs || 40), evalExpr: READOUT, tag });
  // the two campaign runs and the three controls; the pool bounds how many processes are live at once
  const campA = await chained('ptr', campaignOpts('campA'));
  const campB = await chained('ptr', campaignOpts('campB'));
  const ctlOpts = (tag, opt) => ({ from: FRONTIER, marks: ptrMarks, targetGs: HOURS * HOUR, legTicks: HOUR, legs: Number(a.legs || 40),
    evalExpr: READOUT, planner: false, tag, opt });
  const [ctl1, ctl2, ctl3] = await Promise.all([
    chained('ptr', ctlOpts('ctl-simple', {})),
    chained('ptr', ctlOpts('ctl-off', { profile: 'off' })),
    chained('ptr', ctlOpts('ctl-gain2x', { 'auto-opt': 'policy:reset:p=gain>=2x' })),
  ]);
  const curve = (c) => c.samples.map((s) => `${s.gameSeconds}s pts ${String(s.eval?.points).slice(0, 10)}${s.eval?.layers?.b ? ` b ${s.eval.layers.b[0]}/${s.eval.layers.b[1]}` : ''}${s.eval?.layers?.t ? ` t ${String(s.eval.layers.t[0]).slice(0, 8)}` : ''}${s.eval?.layers?.e ? ` e ${String(s.eval.layers.e[0]).slice(0, 8)}` : ''}${s.eval?.layers?.s ? ` s ${String(s.eval.layers.s[0]).slice(0, 8)}` : ''}`).join(' | ');
  const equal = campA.hashGame === campB.hashGame && JSON.stringify(campA.rounds.map(({ cost, ...r }) => r)) === JSON.stringify(campB.rounds.map(({ cost, ...r }) => r));
  const newMarks = (c) => Object.entries(c.marks).filter(([m, v]) => v && !['M01','M02','M03','M04','M05','M06','M07','M08','M09','M10','M13'].includes(m)).map(([m, v]) => `${m}@${v.gameSeconds}`);
  row({ gate: `P1b-2 (1) the frontier campaign: ${HOURS} game-hours from the S1 stall under the planner, TWICE`, id: 'ptr', leg: `k=${K} screenK=${SCREENK}, ${campA.legs.length} legs`,
    ok: !!campA.gameSeconds && equal && !campA.error && !campB.error, ticks: campA.ticks, gameSeconds: campA.gameSeconds, diff: 1, hash: campA.hashGame,
    notes: `twice equal: ${equal} (hashGame ${campA.hashGame} vs ${campB.hashGame}, ${campA.rounds.length} vs ${campB.rounds.length} rounds); marks newly reached: ${newMarks(campA).join(', ') || 'NONE'}; curve ${curve(campA)}; ${campA.error || campB.error || ''}` });
  for (const [name, c, what] of [['(i) the simple system unchanged (S1 frontier config)', ctl1, 'the S1 stall itself: the detector\'s seen-set stall, not a frozen game'],
    ['(ii) everything OFF', ctl2, 'what moves with no automation at all'],
    ['(iii) the simple system with reset:p gain>=2x', ctl3, 'whether the stall is the p cadence (S1\'s sweep winner)']]) {
    row({ gate: `P1b-2 (2) control ${name}`, id: 'ptr', leg: `${HOURS} game-hours from the same snapshot — measures ${what}`,
      ok: !c.error, ticks: c.ticks, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
      notes: `marks newly reached: ${newMarks(c).join(', ') || 'NONE'}; curve ${curve(c)}; ${c.error || ''}` });
  }
  // (3) Something Tree from S03, planner against the simple system
  const stFrom = `${ST_DIR}/S03.json`;
  const [stP, stS] = await Promise.all([
    chained('something', { from: stFrom, marks: stMarks, ladder: ST_LADDER, targetGs: 3000, legTicks: 3000, legs: 4, tag: 'st-planner', evalExpr: READOUT }),
    chained('something', { from: stFrom, marks: stMarks, targetGs: 3000, legTicks: 3000, legs: 4, planner: false, tag: 'st-simple', evalExpr: READOUT }),
  ]);
  const stMarksOf = (c) => Object.entries(c.marks).filter(([, v]) => v).map(([m, v]) => `${m}@${v.gameSeconds}`).join(' ');
  row({ gate: 'P1b-2 (3) Something Tree (2.7) from S03, 3000 game-seconds: the planner against the simple system', id: 'something', leg: `k=${K} screenK=${SCREENK}`,
    ok: !stP.error && !stS.error, ticks: stP.ticks, gameSeconds: stP.gameSeconds, diff: 1, hash: stP.hashGame,
    notes: `planner: ${stMarksOf(stP) || 'no new mark'} (${stP.rounds.length} rounds, hashGame ${stP.hashGame}) · simple: ${stMarksOf(stS) || 'no new mark'} (hashGame ${stS.hashGame}); A2-1's own numbers are 309 / 399 / 579 from a FRESH game` });
  // (4) the clocks
  const clocks = campA.report?.clocks || {};
  const stalled = Object.entries(clocks).filter(([, c]) => c.stall > 0).map(([k2, c]) => `${k2} ${c.stall}/${c.rounds} on ${c.dimension}${c.armed ? '' : ' (frozen)'}`);
  const abandoned = Object.entries(campA.report?.abandoned || {}).map(([k2, v]) => `${k2}@round ${v.round} (${v.why})`);
  row({ gate: 'P1b-2 (4) the stall clocks: what accrued, what was abandoned, and in which round', id: 'ptr', leg: 'read off the campaign\'s round log',
    ok: Object.keys(clocks).length > 0, ticks: campA.ticks, gameSeconds: campA.gameSeconds, diff: 1, hash: null,
    notes: `clocks with accrual: ${stalled.join(' · ') || 'none'}; abandoned: ${abandoned.join(' · ') || 'none'}; goalStallK=${campA.options?.goalStallK} fixK=${campA.options?.fixK}` });
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/p1b-part2-runs.json'), { commit, dirty, hours: HOURS, k: K, screenK: SCREENK,
    campA: { ...campA, rounds: campA.rounds.length }, campB: { ...campB, rounds: campB.rounds.length }, equal,
    controls: { simple: ctl1, off: ctl2, gain2x: ctl3 }, something: { planner: { ...stP, rounds: stP.rounds.length }, simple: stS } });
}

// ---- Part 2's sweeps (item 5) --------------------------------------------------------------------------------------
// ⚠ BOUNDED, and the bound is named: one sweep CELL is one ≤ 8-minute process (the standing rule), and the opening to
// M09 does not fit in one at any k — so the opening objective here is the game-seconds to M05 and M07 from a fresh
// game, and the frontier objective is ONE game-hour from the S1 stall, not six. The full-length numbers are the
// campaign's own rows above. DNF is a first-class result (sweep.mjs classifies it from the round log).
function runSweep(id, vary, extra) {
  return new Promise((resolve) => {
    const out = path.join(fs.mkdtempSync(path.join(TMP, 'sweep-')), 's.json');
    const args = [path.join(REPO, 'tools/harness/sweep.mjs'), id, '--vary', vary, '--json', out, '--pool', String(POOL), '--diff', '1',
      '--planner=auto', '--planner-ladder', PTR_LADDER, ...extra];
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => { try { resolve(JSON.parse(fs.readFileSync(out, 'utf8'))); } catch { resolve({ lines: [], error: err.slice(-300) }); } });
  });
}
async function part2Sweeps() {
  const ptrMarks = marksFile(PTR_LADDER);
  const opening = ['--marks', ptrMarks, '--marks-continue', '--stop-mark', 'M07', '--ticks', '20000', '--wall-ms', String(WALL)];
  const frontier = ['--marks', ptrMarks, '--marks-continue', '--from-snapshot', FRONTIER, '--ticks', '3600', '--wall-ms', String(WALL)];
  const cells = [
    ['k (the epoch horizon), opening to M05 / M07', 'ptr', 'planner:k=60|300|900', [...opening, '--planner-opt', `screenK=${SCREENK}`]],
    ['screenK (candidates confirmed), opening to M05 / M07', 'ptr', 'planner:screenK=2|4|8', [...opening, '--planner-opt', `k=${K}`]],
    ['goalStallK (rounds before a goal is abandoned), ONE game-hour at the frontier', 'ptr', 'planner:goalStallK=3|6|12', [...frontier, '--planner-opt', `k=${K};screenK=${SCREENK}`]],
    ['wCapacity (the acceleration term), ONE game-hour at the frontier', 'ptr', 'planner:wCapacity=0|10|50', [...frontier, '--planner-opt', `k=${K};screenK=${SCREENK}`]],
  ];
  for (const [what, id, vary, extra] of cells) {
    const r = await runSweep(id, vary, extra);
    const fmt = (l) => `${l.value}: ${l.dnf ? `DNF(${l.dnfCause || '—'})` : ''}${l.marks?.M05 ? ` M05 ${l.marks.M05}` : ''}${l.marks?.M07 ? ` M07 ${l.marks.M07}` : ''} gs ${l.gameSeconds} rounds ${l.rounds ?? '—'} target ${String(l.targetMax ?? '—').slice(0, 10)} plan ${Math.round((l.plannerWallMs || 0) / 1000)}s`;
    row({ gate: `P1b-2 (5) sweep: ${what}`, id, leg: vary, ok: (r.lines || []).length > 0 && r.lines.every((l) => l.ok !== false),
      ticks: null, gameSeconds: null, diff: 1, hash: null,
      notes: `${(r.lines || []).map(fmt).join(' · ')}${r.error ? ` ERROR ${r.error}` : ''}` });
  }
}

async function main() {
  if (PART === '1') await part1();
  else if (PART === '2') { await part2(); if (!a['no-sweeps']) await part2Sweeps(); }
  else if (PART === '2s') await part2Sweeps();
  else { console.error(`unknown --part ${PART}`); process.exit(2); }
  const green = rows.filter((r) => r.ok).length;
  if (!a['no-summary']) appendSection({ title: `P1b-${PART} — the planner's round (epochs × configurations of the simple system)`, commit, dirty, rows, slug: `p1b-part${PART}`,
    reading: 'every row is one run.mjs battery; the planner runs BETWEEN ticks and commits one configuration of the simple system per epoch (docs/planner.md)' });
  console.log(`${green}/${rows.length} green`);
  process.exit(green === rows.length ? 0 : 1);
}
main();
