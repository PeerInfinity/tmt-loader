// Gate R2 (plan §23/§24): the DEFAULTS sweep for row 3's entry, scored over WHOLE STRETCHES, and the rung M17–M22.
//   node tools/harness/gates-r2.mjs --part q      the reset:q axis on L1 (all/M15 → M22), every cell TWICE
//   node tools/harness/gates-r2.mjs --part e      the reset:e axis on L1 and on L2 (the fresh opening → M12)
//   node tools/harness/gates-r2.mjs --part p      the reset:p axis on L2
//   node tools/harness/gates-r2.mjs --part x      the cross of the surviving q × e cells on L1
//   node tools/harness/gates-r2.mjs --part l3     Something Tree S01–S05 — the GENERALITY control
//   node tools/harness/gates-r2.mjs --part 1      the winning table on L1 / L2 / L3, twice equal
//   node tools/harness/gates-r2.mjs --part 2      the rung M17–M22 and its fixtures
//   node tools/harness/gates-r2.mjs --part 3      the purchase kinds against the NATIVE autobuyers (q ms 1)
//   node tools/harness/gates-r2.mjs --part w      the winner with the stall watch ON against the same run without it
//
// ⛔ THE TRAP THIS BATTERY IS BUILT AROUND (plan §23, measured by the planner and again here): **a fixture bakes in
// the policy that produced it, and a layer UNLOCKS ON ITS FIRST RESET.** `snapshots/ptr/all/M16.json` was produced
// under the shipped `reset:q = gain>=2x`, which on an EMPTY purse is `gain >= 0` — it fires the instant one quirk is
// available, unlocks `q` early and lets a row-3 reset wipe row 2 before row 2 is done. A cell scored from `all/M16`
// is therefore measuring a state the winning default would never reach. **Every cell here is scored over a WHOLE
// STRETCH**: L1 from `all/M15.json` (16048 game-s, the last fixture row 3 cannot have touched) through M22, with M16
// as a COLUMN of the same run, and L2 from a fresh game.
//
// Every cell runs TWICE and a cell whose two runs disagree on the marks, the end game-second or the end `hashGame`
// is RED (⚖ V2 §18.2's rule). Every row carries `ticks_ms` and the box's 1-minute load: a full pool changes ms/tick
// and never changes game-seconds.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';

const a = parseArgs(process.argv.slice(2), ['no-summary']);
const PART = String(a.part || 'q');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 300)}`); };

const READING = [
  'Every cell is ONE run.mjs process (an L1 leg is ~14,000 ticks at 13–19 ms/tick on a quiet box), run TWICE; a cell',
  'whose two runs disagree on the marks, the end game-second or the end hashGame is RED. L1 = from',
  'snapshots/ptr/all/M15.json (16048 game-s) → M22, 14,000 ticks, diff 1, --profile all, the stall watch OFF; M16 is a',
  'COLUMN of that same run, never a starting point (a fixture bakes in the policy that produced it — plan §23).',
  'L2 = a FRESH game → M12, the opening\'s regression column (§14d.6). L3 = Something Tree S01–S05 with',
  'games-auto/something.js unchanged — the generality control, where "no change" is the result. A cell\'s label is the',
  'whole --auto-opt string it ran, so a row names the configuration it measured (§14d.2 item 14). "—" for a mark means',
  'NOT REACHED inside the leg, which is a result and not a failure: the curve beside it is the deliverable.',
  'ticks_ms and the 1-minute load are on every row; the pool changes ms/tick and never changes game-seconds.',
].join(' ');

const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const SOMETHING_LADDER = path.join(REPO, 'tools/harness/ladder/something.json');
const SNAP_ALL = path.join(REPO, 'tools/harness/snapshots/ptr/all');
const POOL = Number(a.pool || 6);
const REPEAT = Number(a.repeat || 2);

// The row-3 readout every L1 row carries (the curve a WALL is named from). Row 2's quantities stay, because a row-3
// reset WIPES them and "what did this cost row 2?" is half of every cell's answer.
export const READOUT = `({points: String(player.points), q: String(player.q.points), qBest: String(player.q.best), qTotal: String(player.q.total), qLayers: String(player.q.buyables[11]), qEnergy: String(player.q.energy), qMs: player.q.milestones.slice(), qUpg: player.q.upgrades.slice(), qUnl: player.q.unlocked, h: String(player.h.points), hUnl: player.h.unlocked, te: String(player.t.energy), teCap: String(tmp.t.effect.limit), xtc: String(player.t.buyables[11]), tBest: String(player.t.best), eAuto: player.e.auto, tAutoExt: player.t.autoExt, tAuto: player.t.auto, sAuto: player.s.auto, sbAuto: player.sb.auto, e: String(player.e.points), enh: String(player.e.buyables[11]), s: String(player.s.points), sBest: String(player.s.best), sb: String(player.sb.best), gp: String(player.g.power), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder]})`;
// L2 / L3 are shorter legs whose question is the marks, not row 3's curve.
const READOUT_OPEN = `({points: String(player.points), p: String(player.p.points), b: String(player.b.points), g: String(player.g.points), gp: String(player.g.power), t: String(player.t.points), e: String(player.e.points), s: String(player.s.points), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder]})`;
const READOUT_SOMETHING = `({points: String(player.points), fundamental: String(player.fundamental.points), fTotal: String(player.fundamental.total), primitive: String(player.primitive.points), pTotal: String(player.primitive.total), unlock: String(player.unlock.points)})`;

/** The three legs, as run.mjs flag objects. ⚠ `--ticks` bounds a leg, never the wall (§14d.2 item 11). */
const LEG = {
  L1: { id: 'ptr', marks: ['M16','M17','M18','M19','M20','M21','M22'],
    flags: { diff: 1, ticks: Number(a.ticks || 14000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M22',
      'from-snapshot': path.join(SNAP_ALL, 'M15.json'), stall: 1000000, eval: READOUT } },
  L2: { id: 'ptr', marks: ['M07','M08','M09','M10','M11','M12'],
    flags: { diff: 1, ticks: Number(a.openTicks || 8000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M12',
      stall: 1000000, eval: READOUT_OPEN } },
  L3: { id: 'something', marks: ['S01','S02','S03','S04','S05'],
    flags: { diff: 1, ticks: Number(a.sTicks || 3000), 'wall-ms': 900000, ladder: SOMETHING_LADDER, to: 'S05',
      stall: 1000000, eval: READOUT_SOMETHING } },
};
const flagsOf = (leg, extra = {}) => Object.entries({ ...LEG[leg].flags, ...extra });
const mark = (l, m) => (l.marks && l.marks[m] != null ? `${l.marks[m]}` : '—');
const marksOf = (leg, l) => LEG[leg].marks.map((m) => `${m} ${mark(l, m)}`).join(' · ');
const short = (v) => (v === undefined || v === null ? '—' : String(v).replace(/(\d)\.(\d\d\d)\d+e/, '$1.$2e').slice(0, 12));
const box = (l) => `ticks_ms ${l.ticks_ms}; wall ${Math.round((l.box?.wallMs || 0) / 1000)}s; load ${l.box?.loadStart}→${l.box?.loadEnd}; pool ${POOL}`;
const acts = (l) => Object.entries(l.actions || {}).filter(([k]) => k.startsWith('reset:')).map(([k, v]) => `${k} ${v}`).join(' ');

/** Run a set of cells on one leg and write one SUMMARY row per cell. `cells` = [{label, opt, note?}]. */
async function sweep({ gate, leg, cells, repeat = REPEAT, extra = {}, readout = 'eval' }) {
  const L = LEG[leg];
  // one line per finished RUN, so a battery in flight is legible (CLAUDE.md: telling a run in flight from a stalled one)
  let done = 0;
  const total = cells.length * repeat;
  const lines = await runCells({ id: L.id, cells, flags: flagsOf(leg, extra), pool: POOL, repeat, stop: L.flags.to,
    onRun: (c, l) => console.log(`[PROGRESS ${++done}/${total}] ${leg} ${c.label || '(the table)'} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
  lines.forEach((l, i) => {
    const c = cells[i];
    const ok = !!l.ok && (repeat < 2 || l.twiceEqual === true);
    row({ gate: `${gate} ${c.label || 'the table as it stands (control)'}`, id: L.id,
      leg: `${leg}: ${leg === 'L1' ? 'from all/M15.json' : leg === 'L2' ? 'a FRESH game' : 'something, table unchanged'}, diff 1, profile all, ${L.flags.ticks} ticks, ${repeat} run(s)`,
      ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `${marksOf(leg, l)}; ${repeat > 1 ? `twice equal: ${l.twiceEqual} (run 2 ${l.runs[1]?.gameSeconds}s/${l.runs[1]?.hashGame})` : 'ONE run'}; ${c.note ? c.note + '; ' : ''}resets ${acts(l)}; end ${readoutText(leg, l)}; ${box(l)}${l.error ? '; ERROR ' + l.error : ''}` });
  });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/r2-${gate.replace(/[^\w]+/g, '-')}.json`), { gate, leg, cells, lines });
  return lines;
}
function readoutText(leg, l) {
  const e = l.runs?.[0]?.eval || l.eval || null;
  if (!e) return '—';
  if (leg === 'L1') return `q ${e.q}/${e.qTotal} total (best ${e.qBest}), QL ${e.qLayers}, q ms [${e.qMs}], h ${e.hUnl ? e.h : 'LOCKED'}, TE ${short(e.te)} of ${short(e.teCap)} (xtc ${e.xtc}), t.best ${e.tBest}, s.best ${e.sBest}, sb ${e.sb}, EP ${short(e.e)} enh ${e.enh}, GP ${short(e.gp)}, uo ${JSON.stringify(e.uo)}, native [e.auto ${e.eAuto} t.autoExt ${e.tAutoExt} t.auto ${e.tAuto} s.auto ${e.sAuto} sb.auto ${e.sbAuto}]`;
  if (leg === 'L2') return `pts ${short(e.points)}, p ${short(e.p)}, gp ${short(e.gp)}, t ${e.t} e ${e.e} s ${e.s}, uo ${JSON.stringify(e.uo)}`;
  return `pts ${short(e.points)}, fundamental ${short(e.fundamental)}/${short(e.fTotal)}, primitive ${short(e.primitive)}/${short(e.pTotal)}, unlock ${short(e.unlock)}`;
}
// `eval` is read per RUN, so the cell line has to reach into run 1 for it — runCells returns run 1 spread at the top
// level, but `eval` is not one of the fields it lifts.
const cell = (opt, note) => ({ label: opt, opt, note });

// ---- the candidate alphabet ------------------------------------------------------------------------------------
// ⚖ 13d.2: every cell below is either TARGET-DRIVEN or a named CONTROL. `rate-peak@0/0` is the bare rule and is the
// control for every buffered `rate-peak` cell (V2 §18.2); `always` and `gain>=2` are the planner's own controls, the
// second being the digest's literal for q (L3.2: "reset for 2 quirks in one go" is q milestone 0's own requirement).
const RESET_CELLS = (f) => [
  cell('', `the TABLE AS IT STANDS — ${f} at its shipped value (the control every other cell is against)`),
  cell(`policy:reset:${f}=gain>=2x-unit`, 'the empty-purse fix: N× what is held, or N when it holds none'),
  cell(`policy:reset:${f}=gain>=2`, "the digest's literal (L3.2 for q), a named control: a threshold somebody had to FIND"),
  cell(`policy:reset:${f}=always`, 'a named control'),
  cell(`policy:reset:${f}=unlocks-purchase`, 'target-driven: the reset must afford something'),
  cell(`policy:reset:${f}=rate-peak@0/0`, 'the BARE rate rule — the control for the two buffers'),
  cell(`policy:reset:${f}=rate-peak@0.1/30`, "V2's provisional buffers"),
  cell(`policy:reset:${f}=gain>=2x|stall>=3x/5`, '⚖ the user\'s stall fallback riding on the shipped primary'),
];

// ---- the sweep parts --------------------------------------------------------------------------------------------
// ⚖ A BOUNDED SWEEP NAMES WHAT IT BOUNDED. The full eight-cell alphabet above runs on `reset:q`, which is the
// feature the slice exists for and the one nobody has swept. On `reset:e` and `reset:p` it is PRUNED to four, and
// here is the reason: R1′ already swept both against `interval>=T` / `always` / `unlocks-purchase` / `gain>=Nx`
// (gate R1′-2.3 for e, S1-2 + §14d.6 for p) and `gain>=2x` won each time, so re-running those cells would re-measure
// a settled question. What is NOT settled for them is (a) the empty purse, which is new in this slice, and (b) the
// `rate-peak` buffers, which V2 measured only from `all/M16.json` — the fixture §23 shows is damaged. So each of
// those two axes keeps: the table (control), the empty-purse candidate, V2's buffered cell, and the BARE rate rule
// that is the buffered cell's own control. `always` / `gain>=2` / `unlocks-purchase` / the stall modifier are the
// four cells dropped, and dropping them is a claim about R1′'s evidence, not about this slice's.
const PRUNED_CELLS = (f) => [
  cell('', `the TABLE AS IT STANDS — ${f} at its shipped value (the control)`),
  cell(`policy:reset:${f}=gain>=2x-unit`, 'the empty-purse fix: N× what is held, or N when it holds none'),
  cell(`policy:reset:${f}=rate-peak@0.1/30`, "V2's provisional buffers — re-measured over a whole stretch"),
  cell(`policy:reset:${f}=rate-peak@0/0`, 'the BARE rate rule — the control for the buffered cell above'),
];
const partQ = () => sweep({ gate: 'R2-S1 reset:q on L1 —', leg: 'L1', cells: RESET_CELLS('q') });
const partP = () => sweep({ gate: 'R2-S3 reset:p on L2 —', leg: 'L2', cells: PRUNED_CELLS('p') });
const partL3 = () => sweep({ gate: 'R2-S5 the DERIVED default on Something Tree —', leg: 'L3', cells: [
  cell('', 'games-auto/something.js unchanged — every one of its three resets is a TABLE entry, so a moved DERIVED default must not move this leg at all'),
  cell('policy:reset:fundamental=gain>=2x-unit', 'the candidate forced onto a normal layer of another game'),
  cell('policy:reset:fundamental=gain>=2x', 'the shipped ratio rule on the same layer — the pair that isolates the empty purse'),
] });
async function partE() {
  await sweep({ gate: 'R2-S2 reset:e on L1 —', leg: 'L1', cells: PRUNED_CELLS('e') });
  await sweep({ gate: 'R2-S2 reset:e on L2 —', leg: 'L2', cells: PRUNED_CELLS('e') });
}
/** The cross: --cross "qOpt|qOpt2" --cross-e "eOpt|eOpt2" — the surviving cells of the two axes, on L1. */
async function partX() {
  const qs = String(a.cross || 'gain>=2x-unit|gain>=2').split('|');
  const es = String(a['cross-e'] || 'gain>=2x|gain>=2x-unit').split('|');
  const cells = [];
  for (const q of qs) for (const e of es) cells.push(cell(`policy:reset:q=${q};policy:reset:e=${e}`, 'the cross of the surviving cells of the two axes'));
  await sweep({ gate: 'R2-S4 the q × e cross on L1 —', leg: 'L1', cells });
}

// ---- Part 1: the WINNING TABLE on all three legs, twice equal -----------------------------------------------------
// One cell per leg, no --auto-opt at all: the table itself is the thing under test. ⚖ A row that needs an --auto-opt
// string to reproduce is measuring an override, not a default.
async function part1() {
  // ⚠ L1 IS NOT REPEATED HERE. Part 2's pair IS the winning table's L1 row, twice equal — it is the run the fixtures
  // are written from, with no --auto-opt at all. Running it a third and fourth time would measure the same thing and
  // cost another 14,000-tick pair of legs; the SUMMARY row to read for L1 is `R2-2 the rung L1 run 1 / run 2`.
  for (const leg of ['L2', 'L3']) {
    await sweep({ gate: `R2-1 the WINNING TABLE on ${leg} —`, leg, cells: [cell('', 'no --auto-opt: the table itself')] });
  }
}

// ---- Part 2: the rung M17–M22 and its fixtures --------------------------------------------------------------------
// Run L1 TWICE with --snapshots, and write snapshots/ptr/all/<mark>.json from run 1 for every mark the two runs agree
// on. ⚠ The marks are NOT monotone in ladder order (M17 lands BEFORE M16 on the same run — measured), and a predicate
// may go FALSE again after a later row-3 reset (§14d.2 item 6), so every mark is re-evaluated at every LATER fixture.
async function part2() {
  const dirs = [fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-r2-fix1-')), fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-r2-fix2-'))];
  const L = LEG.L1;
  // ⚠ Two SEPARATE calls, because each run must write its snapshots into its OWN directory: the point of the pair
  // is that run 2 AGREES with run 1 on every fixture, and one shared dir would have the second overwrite the first.
  const [one, two] = await Promise.all([
    runCells({ id: 'ptr', cells: [cell('', 'run 1, writing fixtures')], flags: flagsOf('L1', { snapshots: dirs[0] }), pool: 1, repeat: 1, stop: 'M22' }),
    runCells({ id: 'ptr', cells: [cell('', 'run 2')], flags: flagsOf('L1', { snapshots: dirs[1] }), pool: 1, repeat: 1, stop: 'M22' }),
  ]);
  const A = one[0], B = two[0];
  const equal = A.gameSeconds === B.gameSeconds && A.hashGame === B.hashGame && JSON.stringify(A.marks) === JSON.stringify(B.marks);
  row({ gate: 'R2-2 the rung L1 run 1 (fixtures written from it)', id: 'ptr', leg: `from all/M15.json, ${L.flags.ticks} ticks, diff 1`, ok: !!A.ok, ticks: A.ticks, gameSeconds: A.gameSeconds, diff: 1, hash: A.hashGame,
    notes: `${marksOf('L1', A)}; resets ${acts(A)}; end ${readoutText('L1', A)}; ${box(A)}` });
  row({ gate: 'R2-2 the rung L1 run 2 — TWICE EQUAL', id: 'ptr', leg: `from all/M15.json, ${L.flags.ticks} ticks, diff 1`, ok: !!B.ok && equal, ticks: B.ticks, gameSeconds: B.gameSeconds, diff: 1, hash: B.hashGame,
    notes: `${marksOf('L1', B)}; equal to run 1: ${equal}; ${box(B)}` });
  // the fixtures, and the OLD → NEW line for each (a moved default re-records what it moves, by name)
  const files = (d) => Object.fromEntries(fs.readdirSync(d).map((f) => [f.replace(/\.json$/, ''), path.join(d, f)]));
  const fa = files(dirs[0]), fb = files(dirs[1]);
  for (const m of Object.keys(fa).sort()) {
    const s1 = JSON.parse(fs.readFileSync(fa[m], 'utf8'));
    const s2 = fb[m] ? JSON.parse(fs.readFileSync(fb[m], 'utf8')) : null;
    const same = !!s2 && s1.hashGame === s2.hashGame && s1.ticks === s2.ticks;
    const dest = path.join(SNAP_ALL, `${m}.json`);
    const before = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : null;
    if (same && !a['no-write']) fs.writeFileSync(dest, fs.readFileSync(fa[m]));
    row({ gate: `R2-2 fixture snapshots/ptr/all/${m}.json`, id: 'ptr', leg: 'from run 1, hashGame agreed by run 2', ok: same, ticks: s1.ticks, gameSeconds: s1.gameSeconds, diff: s1.diff, hash: s1.hashGame,
      notes: `${before ? `OLD ${before.ticks}/${before.hashGame} → NEW ${s1.ticks}/${s1.hashGame}${before.hashGame === s1.hashGame ? ' (unmoved)' : ' — MOVED by this slice\u2019s defaults'}` : `NEW (no previous fixture) ${s1.ticks}/${s1.hashGame}`}; run 2 ${s2 ? `${s2.ticks}/${s2.hashGame}` : 'MISSING'}; ${same ? (a['no-write'] ? 'NOT written (--no-write)' : 'written') : 'NOT WRITTEN (the two runs disagree)'}` });
  }
  // ⚠ every mark re-evaluated at every LATER fixture: a predicate that names a row-2 upgrade goes false on a q reset
  const later = Object.keys(fa).sort();
  const preds = JSON.parse(fs.readFileSync(PTR_LADDER, 'utf8'));
  const entries = (Array.isArray(preds) ? preds : preds.marks).filter((e) => L.marks.includes(e.id));
  const predFile = path.join(os.tmpdir(), `r2-preds-${process.pid}.json`);
  fs.writeFileSync(predFile, JSON.stringify(entries.map((e) => [e.id, e.predicate])));
  for (const m of later) {
    const r = await runCells({ id: 'ptr', cells: [cell('', `monotonicity at ${m}`)], flags: Object.entries({ diff: 1, ticks: 0, profile: 'all', 'from-snapshot': fa[m], predicates: predFile }), pool: 1, repeat: 1 });
    const v = r[0].runs[0];
    row({ gate: `R2-2 predicates re-evaluated at the ${m} fixture (§14d.2 item 6)`, id: 'ptr', leg: '0 ticks from the fixture, every R2 mark', ok: !!v.ok, ticks: v.ticks, gameSeconds: v.gameSeconds, diff: 1, hash: v.hashGame,
      notes: `${(v.predicates || []).map((x) => `${x.name} ${x.error ? 'ERROR ' + x.error : x.value}`).join(' \u00b7 ') || 'no predicate answered'}` });
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/r2-2.json'), { A, B, equal, fixtures: Object.keys(fa) });
}

// ---- Part 3: the purchase kinds against the game's OWN autobuyers --------------------------------------------------
// q milestone 1 grants `player.e.auto` (auto-Enhancers, layers.js:1332) and `player.t.autoExt` (auto-Extra-Time-
// Capsules, :1007), and the `toggles` kind switches them on. From then the GAME buys with `buyMax()` and NO reserve,
// while `buyables:e` (`reserve>=next-upgrade`) and `buyables:t` stay registered. `reset` features already yield
// (`yielding:native`); purchase kinds do NOT. The control is the same leg with the toggles feature EXCLUDED, so the
// native buyers never come on: the difference in the BUY COUNTS is the double-buy, and a mark or a hash would not
// show it. Also: `reset:t` / `reset:s` / `reset:sb` must STOP firing once q ms 3 / 4 make their `autoPrestige` true.
async function part3() {
  const from = path.join(SNAP_ALL, `${String(a.from || 'M18')}.json`);
  if (!fs.existsSync(from)) { row({ gate: 'R2-3', id: 'ptr', ok: false, notes: `no fixture ${from} — run --part 2 first` }); return; }
  const ticks = Number(a.p3ticks || 3000);
  const cells = [cell('', 'the toggles kind ON (what ships): the game buys Enhancers and Extra Time Capsules itself'),
                 cell('exclude=toggles:q', 'CONTROL: the toggles feature excluded, so the native autobuyers never come on')];
  const lines = await runCells({ id: 'ptr', cells,
    flags: Object.entries({ diff: 1, ticks, 'wall-ms': 900000, profile: 'all', 'from-snapshot': from, stall: 1000000, eval: READOUT }), pool: 2, repeat: 1 });
  const [on, off] = lines;
  const buys = (l) => ({ 'buyables:e': l.actions?.['buyables:e'] || 0, 'buyables:t': l.actions?.['buyables:t'] || 0, 'reset:t': l.actions?.['reset:t'] || 0, 'reset:s': l.actions?.['reset:s'] || 0, 'reset:sb': l.actions?.['reset:sb'] || 0, 'toggles:q': l.actions?.['toggles:q'] || 0 });
  lines.forEach((l, i) => row({ gate: `R2-3 ${cells[i].note}`, id: 'ptr', leg: `from all/${String(a.from || 'M18')}.json, ${ticks} ticks, diff 1`, ok: !!l.ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
    notes: `buy counts ${JSON.stringify(buys(l))}; end ${readoutText('L1', l)}; ${box(l)}` }));
  const bOn = buys(on), bOff = buys(off);
  row({ gate: 'R2-3 the VERDICT: does the loader double-buy what the game already buys?', id: 'ptr', leg: 'the two rows above, by BUY COUNT (not by a mark, not by a hash)', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `native ON: buyables:e ${bOn['buyables:e']} buyables:t ${bOn['buyables:t']}; native OFF (exclude=toggles:q): buyables:e ${bOff['buyables:e']} buyables:t ${bOff['buyables:t']}; e enhancers ON ${on.runs[0]?.eval?.enh} vs OFF ${off.runs[0]?.eval?.enh}; extra TC ON ${on.runs[0]?.eval?.xtc} vs OFF ${off.runs[0]?.eval?.xtc}; end hashGame ${on.hashGame} vs ${off.hashGame}; reset:t/s/sb with the natives ON ${bOn['reset:t']}/${bOn['reset:s']}/${bOn['reset:sb']} against OFF ${bOff['reset:t']}/${bOff['reset:s']}/${bOff['reset:sb']}` });
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/r2-3.json'), { on, off });
}

// ---- Part w: the stall watch as the NET under the winning table ----------------------------------------------------
// ⚖ §21.4 item 3: the watch is the net UNDER whatever default wins, not an arm of the grid. The claim it has to make
// good is that it composes: byte-identical on a HEALTHY leg (L2), and no worse on L1.
async function partW() {
  for (const leg of ['L2', 'L1']) {
    await sweep({ gate: `R2-W the watch on ${leg} —`, leg, repeat: 1, cells: [
      cell('', 'the winning table, the watch OFF (the control)'),
      cell('watch=1', 'the same table with the watch ON at its declared K = 10'),
    ] });
  }
}

/** Ad hoc, for a wave the axes above have EARNED: --part cells --leg L1 --cells "<opt>||<opt>" [--notes "a||b"]. */
async function partCells() {
  const opts = String(a.cells || '').split('||');
  const notes = String(a.notes || '').split('||');
  await sweep({ gate: `R2-S4 ${String(a.tag || 'the composition wave')} on ${String(a.leg || 'L1')} —`, leg: String(a.leg || 'L1'),
    cells: opts.map((o, i) => cell(o, notes[i] || 'a composition the single-axis sweeps earned')) });
}

const PARTS = { q: partQ, e: partE, p: partP, x: partX, l3: partL3, cells: partCells, 1: part1, 2: part2, 3: part3, w: partW };
const ENTRY = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (ENTRY) {
  if (!PARTS[PART]) { console.error(`unknown --part ${PART} (have: ${Object.keys(PARTS).join(', ')})`); process.exit(2); }
  await PARTS[PART]();
  if (!a['no-summary']) appendSection({ title: `gate R2 part ${PART} — the defaults sweep, scored over whole stretches`, commit, dirty, rows, slug: `r2-${PART}`, reading: READING });
  console.log(`\n${rows.filter((r) => r.ok).length}/${rows.length} green`);
}
