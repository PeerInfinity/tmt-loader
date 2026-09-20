// Gate R3a (plan §29/§30): the Hindrance challenges — when to ENTER, when to GIVE UP, and the rung M23–M26.
//   node tools/harness/gates-r3.mjs --part 1     the ENTRY / EXIT sweep on L1 (all/M22 → M26), every cell TWICE
//   node tools/harness/gates-r3.mjs --part 2     what `while` / `until` CAN and CANNOT say on the `challenges` kind
//   node tools/harness/gates-r3.mjs --part 3     `reset:h` — the rider, over the same whole stretch
//   node tools/harness/gates-r3.mjs --part 4     the rung M23–M26 and its fixtures
//   node tools/harness/gates-r3.mjs --part 5     INERTNESS: the opening and M15 → M22, unchanged
//   node tools/harness/gates-r3.mjs --part 6     the DERIVED default for the kind — Something Tree + a bounded roster sample
//   node tools/harness/gates-r3.mjs --part 7     the PAGE: the new modifier through V2's editors, on ptr AND something
//
// ⛔ THE WALL THIS BATTERY IS BUILT AROUND, and it is not where R2 and V4 put it. `sequential` has an ENTRY rule and
// NO EXIT rule: from `all/M22.json` it completes H11 in 65 game-seconds and walks straight into H12, which H11 has
// just unlocked and which it is far too weak for — and it never comes out. Measured, twice equal, at `934dc41dc`:
// 11,878 game-seconds inside H12, the currency flat at 1e2334 against a goal of 1e3550, quirks frozen at 26 total,
// 13 `reset:q` (none after entry) against the shipped table's 247. So the questions are GIVING UP and NOT ENTERING
// TOO WEAK, and both are scored over the WHOLE stretch (§24.11 item 6) rather than from a fixture the rule under
// test has damaged.
//
// Every cell runs TWICE and a cell whose two runs disagree on the marks, the end game-second or the end `hashGame`
// is RED (⚖ V2 §18.2's rule). Every row carries `ticks_ms` and the box's 1-minute load.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, GAMES, parseArgs, writeJSON, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 340)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH (`--assert`, CI): a battery that dies part-way prints fewer rows, and fewer rows
// is fewer reds. These are the exact counts each part emits; a part that grows a leg has to come here and say so.
// ⚠ part 4 emits 2 leg rows + one row per fixture WRITTEN + one per fixture RE-EVALUATED: 2 + 2 + 2 = 6 at this head.
// A rung that reaches M25 would write two more fixtures and move this to 10 — which is the point of declaring it.
const ROWS = { 1: 7, 2: 7, 3: 6, 4: 6, 5: 3, 6: 4, 7: 2, q: 5 };

const READING = [
  'Every cell is ONE run.mjs process, run TWICE unless the row says otherwise; a cell whose two runs disagree on the',
  'marks, the end game-second or the end hashGame is RED. L1 = from snapshots/ptr/all/M22.json (30618 game-s) → M26,',
  '12,000 ticks, diff 1, --profile all, the stall watch OFF. L15 = from all/M15.json → M22, 16,000 ticks — V4\'s own',
  'stretch, carried here only as an INERTNESS control. L2 = a FRESH game → M12, the opening\'s regression column.',
  'L3 = Something Tree S01–S05 with games-auto/something.js unchanged — the generality control, where "no change" is',
  'the result. A cell\'s label is the whole --auto-opt string it ran, so a row names the configuration it measured',
  '(§14d.2 item 14). "—" for a mark means NOT REACHED inside the leg, which is a result and not a failure.',
].join(' ');

const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const SOMETHING_LADDER = path.join(REPO, 'tools/harness/ladder/something.json');
const SNAP_ALL = path.join(REPO, 'tools/harness/snapshots/ptr/all');
const POOL = Number(a.pool || 5);
const REPEAT = Number(a.repeat || 2);

// The row-3 / challenge readout every L1 row carries — the curve a WALL is named from. `hookStats().challenges`
// carries enter / exit / gaveUp, which is the only place the difference between "won it" and "walked out" lives.
export const READOUT = `({points: String(player.points), q: String(player.q.points), qTotal: String(player.q.total), qLayers: String(player.q.buyables[11]), qMs: player.q.milestones.slice(), qUpg: player.q.upgrades.slice(), h: String(player.h.points), hBest: String(player.h.best), hChall: Object.assign({}, player.h.challenges), active: player.h.activeChallenge, te: String(player.t.energy), gp: String(player.g.power), ch: tmtLoader.hookStats().challenges})`;
const READOUT_OPEN = `({points: String(player.points), p: String(player.p.points), gp: String(player.g.power), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder]})`;
const READOUT_SOMETHING = `({points: String(player.points), fundamental: String(player.fundamental.points), primitive: String(player.primitive.points), unlock: String(player.unlock.points)})`;

const LEG = {
  L1: { id: 'ptr', marks: ['M23', 'M24', 'M25', 'M26'],
    flags: { diff: 1, ticks: Number(a.ticks || 12000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M26',
      'from-snapshot': path.join(SNAP_ALL, 'M22.json'), 'marks-continue': true, stall: 1000000, eval: READOUT } },
  // ⚠ NO `--marks-continue` HERE, AND THAT IS THE WHOLE POINT OF THE ROW. The pin is the hash AT M22
  // (`0b98a21130a0b4af`, which is what `snapshots/ptr/all/M22.json` carries), not the hash of whatever a leg drifts
  // to 1,400 ticks later — so the leg STOPS at the mark and its end state IS the mark. A row that compared an end
  // hash to a fixture hash would be comparing two different states and would red on a slice that moved neither.
  L15: { id: 'ptr', marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22'],
    flags: { diff: 1, ticks: Number(a.ticks15 || 16000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M22',
      'from-snapshot': path.join(SNAP_ALL, 'M15.json'), stall: 1000000, eval: READOUT } },
  L2: { id: 'ptr', marks: ['M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
    flags: { diff: 1, ticks: Number(a.openTicks || 8000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M12', stall: 1000000, eval: READOUT_OPEN } },
  L3: { id: 'something', marks: ['S01', 'S02', 'S03', 'S04', 'S05'],
    flags: { diff: 1, ticks: Number(a.sTicks || 3000), 'wall-ms': 900000, ladder: SOMETHING_LADDER, to: 'S05', stall: 1000000, eval: READOUT_SOMETHING } },
};
const flagsOf = (leg, extra = {}) => Object.entries({ ...LEG[leg].flags, ...extra });
const mark = (l, m) => (l.marks && l.marks[m] != null ? `${l.marks[m]}` : '—');
const marksOf = (leg, l) => LEG[leg].marks.map((m) => `${m} ${mark(l, m)}`).join(' · ');
const short = (v) => (v === undefined || v === null ? '—' : String(v).replace(/(\d)\.(\d\d\d)\d+e/, '$1.$2e').slice(0, 12));
const box = (l) => `ticks_ms ${l.ticks_ms}; wall ${Math.round((l.box?.wallMs || 0) / 1000)}s; load ${l.box?.loadStart}→${l.box?.loadEnd}; pool ${POOL}`;
const acts = (l) => Object.entries(l.actions || {}).filter(([k]) => k.startsWith('reset:') || k.startsWith('challenges:')).map(([k, v]) => `${k} ${v}`).join(' ');
const cell = (opt, note) => ({ label: opt, opt, note });

function readoutText(leg, l) {
  const e = l.runs?.[0]?.eval || l.eval || null;
  if (!e) return '—';
  if (leg === 'L2') return `pts ${short(e.points)}, p ${short(e.p)}, gp ${short(e.gp)}, uo ${JSON.stringify(e.uo)}`;
  if (leg === 'L3') return `pts ${short(e.points)}, fundamental ${short(e.fundamental)}, primitive ${short(e.primitive)}, unlock ${short(e.unlock)}`;
  const c = e.ch && e.ch['challenges:h'];
  return `q ${e.q}/${e.qTotal} total, QL ${e.qLayers}, q ms [${e.qMs}], q upg [${e.qUpg}], h ${e.h} (best ${e.hBest}), h challenges ${JSON.stringify(e.hChall)}, active ${e.active}, enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'}, TE ${short(e.te)}, GP ${short(e.gp)}, pts ${short(e.points)}`;
}

/** Run a set of cells on one leg and write one SUMMARY row per cell. */
async function sweep({ gate, leg, cells, repeat = REPEAT, extra = {} }) {
  const L = LEG[leg];
  let done = 0;
  const total = cells.length * repeat;
  const lines = await runCells({ id: L.id, cells, flags: flagsOf(leg, extra), pool: POOL, repeat, stop: L.flags.to,
    onRun: (c, l) => console.log(`[PROGRESS ${++done}/${total}] ${leg} ${c.label || '(the table)'} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
  lines.forEach((l, i) => {
    const c = cells[i];
    const ok = !!l.ok && (repeat < 2 || l.twiceEqual === true);
    row({ gate: `${gate} ${c.label || 'the table as it stands (control)'}`, id: L.id,
      leg: `${leg}, diff 1, profile all, ${L.flags.ticks} ticks, ${repeat} run(s)`,
      ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `${marksOf(leg, l)}; ${repeat > 1 ? `twice equal: ${l.twiceEqual} (run 2 ${l.runs[1]?.gameSeconds}s/${l.runs[1]?.hashGame})` : 'ONE run'}; ${c.note ? c.note + '; ' : ''}${acts(l)}; end ${readoutText(leg, l)}; ${box(l)}${l.error ? '; ERROR ' + l.error : ''}` });
  });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/r3-${gate.replace(/[^\w]+/g, '-')}.json`), { gate, leg, cells, lines });
  return lines;
}

// ---- the candidates --------------------------------------------------------------------------------------------
// ⚖ 13d.2 — no arbitrary waiting. Every cell is either DERIVED from what the engine declares about the challenge, or
// a LITERAL with a named provenance, or a CONTROL. The two literals come from digest L3.13 ("grind for more quirks
// up to 100 and more Hindrance spirit up to 100 as well, and you will complete H2 in about 2–3 seconds").
const GIVEUP = `sequential|give-up@${String(a.b || '0.1')}/${String(a.h || '30')}/${String(a.r || '2')}x`;
const ENTRY_LITERAL = "challengeCompletions('h',11)<1 || (player.q.total.gte(100) && player.h.points.gte(100))";

async function part1() {
  await sweep({ gate: 'R3a-1 the ENTRY / EXIT question on L1 —', leg: 'L1', cells: [
    cell('policy:challenges:h=off', 'CONTROL: what shipped BEFORE this slice — ptr declared no `order` for challenges, so the derived default was `off` and no challenge was ever entered'),
    cell('policy:challenges:h=sequential', 'CONTROL: THE WALL ITSELF — an ENTRY rule with no EXIT rule'),
    cell(`policy:challenges:h=${GIVEUP};while:challenges:h=${ENTRY_LITERAL}`, "(a) the digest's LITERALS as an entry gate (L3.13: 100 quirks / 100 hindrance spirit), written per COMPLETION so H11 is not blocked with H12 (§5d′), with the exit rule under it"),
    cell(`policy:challenges:h=${GIVEUP.replace(/\/\d+(\.\d+)?x$/, '/1x')}`, 'EXIT ONLY: the same rule with the retry bar at R = 1, i.e. re-enter the moment it is left — the control that isolates the retry rule from the exit rule'),
    cell('', '(b) the DERIVED pair, as the table now SHIPS it: give up when the attempt stops closing the distance, retry when the challenge’s own LAYER is R× stronger than it was at the failed attempt. ⚖ A row that needs an --auto-opt string to reproduce is measuring an override, not a default'),
    cell(`policy:challenges:h=${GIVEUP.replace('@0.1/', '@0/')}`, 'the BARE rule (B = 0): give up only when progress stops DEAD — the control every buffered setting is measured against, as `rate-peak@0/0` is'),
  ] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3a-1 VERDICT: which configuration reaches M25 (H12), and at what cost to the tree', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} cells reproduced twice equal; read the marks and the enter/exit/gaveUp triple on each row — a cell that reaches no new mark is a RESULT, and the curve beside it is the deliverable` });
}

// ---- Part 2: what the two CONTROLS can and cannot say on this kind ------------------------------------------------
// ⛔ V4 (§27.12 item 2) recommended trying `while` / `until` BEFORE inventing `enterWhen` / `giveUpWhen`. This part is
// that trial, and its answer is that they give an ENTRY schedule and structurally cannot give an EXIT — because a
// paused feature does nothing, and "nothing" inside a challenge is STAYING there. Each row is a 4,000-tick leg.
async function part2() {
  const ticks = Number(a.p2ticks || 4000);
  const legs = [
    { name: 'the digest’s literals as a FEATURE-level `while`', opt: `policy:challenges:h=sequential;while:challenges:h=player.q.total.gte(100) && player.h.points.gte(100)`,
      expect: 'it blocks H11 TOO — one predicate per FEATURE cannot say "this challenge now, that one later"' },
    { name: 'the same, per COMPLETION (§5d′’s own form)', opt: `policy:challenges:h=sequential;while:challenges:h=${ENTRY_LITERAL}`,
      expect: 'H11 is entered and completed, H12 is never entered — `while` CAN express a per-challenge schedule' },
    { name: '⛔ a `while` that goes false INSIDE a challenge', opt: `policy:challenges:h=sequential;while:challenges:h=player.h.activeChallenge === null`,
      expect: 'STRANDED: it enters H11 and never leaves it — a pause does not leave a challenge, and the reason line now says so' },
    { name: 'an `until` that latches after the first completion', opt: `policy:challenges:h=sequential;until:challenges:h=hasChallenge('h',11)`,
      expect: 'the same schedule as the per-completion `while`, but with no way back — a latch is a strictly weaker entry rule' },
  ];
  const lines = await runCells({ id: 'ptr', cells: legs.map((L) => cell(L.opt, L.name)),
    flags: flagsOf('L1', { ticks, explain: true, eval: READOUT }), pool: Math.min(POOL, legs.length), repeat: 1, stop: 'M26' });
  lines.forEach((l, i) => {
    const e = l.runs[0]?.eval;
    const c = e && e.ch && e.ch['challenges:h'];
    row({ gate: `R3a-2 ${legs[i].name}`, id: 'ptr', leg: `L1, ${ticks} ticks, diff 1`, ok: !!l.ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `EXPECTED ${legs[i].expect}; MEASURED ${marksOf('L1', l)}; enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'}; active ${e?.active}; h challenges ${JSON.stringify(e?.hChall)}; reset:q ${l.actions?.['reset:q']}; ${box(l)}` });
  });
  // the unit battery that CONSTRUCTS the curves a real leg gives one of — run in the same process tree as the claim
  const unit = await new Promise((resolve) => {
    const c = spawn(process.execPath, ['--test', 'loader/challenges.test.mjs'], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    c.stdout.on('data', (d) => { o += d; });
    c.stderr.on('data', (d) => { o += d; });
    c.on('exit', (code) => resolve({ code, out: o }));
  });
  const pass = (/^# pass (\d+)/m.exec(unit.out) || [])[1];
  const fail = (/^# fail (\d+)/m.exec(unit.out) || [])[1];
  row({ gate: 'R3a-2 the EXIT RULE as unit tests on the stub (loader/challenges.test.mjs)', id: '—', leg: 'the two curves that matter, PTR’s own H11 curve, the retry bar and the two pause codes', ok: unit.code === 0 && fail === '0',
    notes: `${pass} passed, ${fail} failed — a challenge that PLATEAUS below its goal is LEFT, one that is CLIMBING is NOT, and the front-loaded H11 curve (which any best-rate-since-entry rule abandons at 99.7 %) is kept` });
  row({ gate: 'R3a-2 VERDICT: `while` / `until` give an ENTRY rule and cannot give an EXIT', id: 'ptr', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: 'both controls are per-FEATURE and evaluated BEFORE the kind decides, so a false one means the feature does nothing — and inside a challenge "nothing" is staying. The exit therefore lives in the kind’s own decision (the `give-up` modifier), and the pause says `paused:in-challenge` rather than letting a stranded run read as an ordinary gate' });
}

// ---- Part 3: the rider — `reset:h` ---------------------------------------------------------------------------------
// ⚖ Planner-measured (§27.12 item 3, the user hit it by hand): `always` starves `q` for ever, and the derived
// `gain>=2x` resets `h` ONCE and never again. The retry rule reads `player.h.points`, so what `reset:h` decides by is
// what decides whether a failed challenge is ever tried again — the rider turns out to be load-bearing for M25.
async function part3() {
  await sweep({ gate: 'R3a-3 `reset:h` under the winning challenge configuration on L1 —', leg: 'L1', cells: [
    cell(`policy:challenges:h=${GIVEUP}`, 'CONTROL: `reset:h` at the DERIVED `gain>=2x` — a ratio rule on a layer that holds 1'),
    cell(`policy:challenges:h=${GIVEUP};policy:reset:h=gain>=2x-unit`, "R2's empty-purse fix on the same ratio"),
    cell(`policy:challenges:h=${GIVEUP};policy:reset:h=gain>=1`, 'the smallest target-driven bar: one of the layer’s own resource'),
    cell(`policy:challenges:h=${GIVEUP};policy:reset:h=always`, '⚠ the trap a player can pick from the picker — the row whose `help` this slice rewrote'),
    cell(`policy:challenges:h=${GIVEUP};policy:reset:h=rate-peak@0.1/30`, 'the constant-free rule, at V2’s provisional buffers'),
  ] });
  row({ gate: 'R3a-3 VERDICT: what `reset:h` should decide by, and what `always` costs', id: 'ptr', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: 'read the `h` and `q` columns TOGETHER: both layers are row 3 and both draw on row 2, so a cheap reset on one starves the dear one on the other. The strategy row’s own `help` now says that, in engine-generic words and with no layer named' });
}

// ---- Part 4: the rung M23–M26 and its fixtures ----------------------------------------------------------------------
async function part4() {
  const dirs = [fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-r3-fix1-')), fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-r3-fix2-'))];
  const [one, two] = await Promise.all([
    runCells({ id: 'ptr', cells: [cell('', 'run 1, writing fixtures')], flags: flagsOf('L1', { snapshots: dirs[0] }), pool: 1, repeat: 1, stop: 'M26' }),
    runCells({ id: 'ptr', cells: [cell('', 'run 2')], flags: flagsOf('L1', { snapshots: dirs[1] }), pool: 1, repeat: 1, stop: 'M26' }),
  ]);
  const A = one[0], B = two[0];
  const equal = A.gameSeconds === B.gameSeconds && A.hashGame === B.hashGame && JSON.stringify(A.marks) === JSON.stringify(B.marks);
  row({ gate: 'R3a-4 the rung L1 run 1 (fixtures written from it)', id: 'ptr', leg: `from all/M22.json, ${LEG.L1.flags.ticks} ticks, diff 1, NO --auto-opt`, ok: !!A.ok, ticks: A.ticks, gameSeconds: A.gameSeconds, diff: 1, hash: A.hashGame,
    notes: `${marksOf('L1', A)}; ${acts(A)}; end ${readoutText('L1', A)}; ${box(A)}` });
  row({ gate: 'R3a-4 the rung L1 run 2 — TWICE EQUAL', id: 'ptr', leg: `from all/M22.json, ${LEG.L1.flags.ticks} ticks, diff 1`, ok: !!B.ok && equal, ticks: B.ticks, gameSeconds: B.gameSeconds, diff: 1, hash: B.hashGame,
    notes: `${marksOf('L1', B)}; equal to run 1: ${equal}; ${box(B)}` });
  const files = (d) => Object.fromEntries(fs.readdirSync(d).map((f) => [f.replace(/\.json$/, ''), path.join(d, f)]));
  const fa = files(dirs[0]), fb = files(dirs[1]);
  for (const m of Object.keys(fa).sort()) {
    const s1 = JSON.parse(fs.readFileSync(fa[m], 'utf8'));
    const s2 = fb[m] ? JSON.parse(fs.readFileSync(fb[m], 'utf8')) : null;
    const same = !!s2 && s1.hashGame === s2.hashGame && s1.ticks === s2.ticks;
    const dest = path.join(SNAP_ALL, `${m}.json`);
    const before = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : null;
    if (same && !a['no-write']) fs.writeFileSync(dest, fs.readFileSync(fa[m]));
    row({ gate: `R3a-4 fixture snapshots/ptr/all/${m}.json`, id: 'ptr', leg: 'from run 1, hashGame agreed by run 2', ok: same, ticks: s1.ticks, gameSeconds: s1.gameSeconds, diff: s1.diff, hash: s1.hashGame,
      notes: `${before ? `OLD ${before.ticks}/${before.hashGame} → NEW ${s1.ticks}/${s1.hashGame}${before.hashGame === s1.hashGame ? ' (unmoved)' : ' — MOVED'}` : `NEW (no previous fixture) ${s1.ticks}/${s1.hashGame}`}; run 2 ${s2 ? `${s2.ticks}/${s2.hashGame}` : 'MISSING'}; ${same ? (a['no-write'] ? 'NOT written (--no-write)' : 'written') : 'NOT WRITTEN (the two runs disagree)'}` });
  }
  // ⚠ EVERY MARK RE-EVALUATED AT EVERY LATER FIXTURE (§14d.2 item 6): M12's predicate was not monotone and nobody had
  // noticed, and M23–M26 name upgrades and challenge completions below the row that resets them.
  const preds = JSON.parse(fs.readFileSync(PTR_LADDER, 'utf8'));
  const entries = (Array.isArray(preds) ? preds : preds.marks).filter((e) => ['M21', 'M22', 'M23', 'M24', 'M25', 'M26'].includes(e.id));
  const predFile = path.join(os.tmpdir(), `r3-preds-${process.pid}.json`);
  fs.writeFileSync(predFile, JSON.stringify(entries.map((e) => [e.id, e.predicate])));
  for (const m of Object.keys(fa).sort()) {
    const r = await runCells({ id: 'ptr', cells: [cell('', `monotonicity at ${m}`)], flags: Object.entries({ diff: 1, ticks: 0, profile: 'all', 'from-snapshot': fa[m], predicates: predFile }), pool: 1, repeat: 1 });
    const v = r[0].runs[0];
    row({ gate: `R3a-4 predicates re-evaluated at the ${m} fixture (§14d.2 item 6)`, id: 'ptr', leg: '0 ticks from the fixture, every R3a mark', ok: !!v.ok, ticks: v.ticks, gameSeconds: v.gameSeconds, diff: 1, hash: v.hashGame,
      notes: `${(v.predicates || []).map((x) => `${x.name} ${x.error ? 'ERROR ' + x.error : x.value}`).join(' · ') || 'no predicate answered'}` });
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/r3-4.json'), { A, B, equal, fixtures: Object.keys(fa) });
}

// ---- Part 5: INERTNESS -------------------------------------------------------------------------------------------
// ⛔ THE PINS THIS SLICE MAY NOT MOVE unless a default it moved explains it, named as DATA: the fresh opening
// (6718 / 82eee26f947b2b2e) and V4's own stretch M15 → M22 (30618 / 0b98a21130a0b4af).
const OPENING = { ticks: 6718, hashGame: '82eee26f947b2b2e', mark: 'M12' };
const M22_PIN = { ticks: 30618, hashGame: '0b98a21130a0b4af' };
async function part5() {
  const open = await sweep({ gate: 'R3a-5 the fresh opening, table unchanged —', leg: 'L2', repeat: 1, cells: [cell('', 'no --auto-opt at all')] });
  const o = open[0];
  row({ gate: 'R3a-5 the opening PIN', id: 'ptr', leg: 'a fresh game → M12, stopping AT the mark', ok: o.marks?.M12 === OPENING.ticks && o.hashGame === OPENING.hashGame,
    ticks: o.ticks, gameSeconds: o.gameSeconds, diff: 1, hash: o.hashGame, notes: `M12 ${o.marks?.M12} / ${o.hashGame} against the pinned ${OPENING.ticks} / ${OPENING.hashGame}` });
  const l15 = await sweep({ gate: 'R3a-5 M15 → M22, table unchanged —', leg: 'L15', repeat: 1, cells: [cell('', 'no --auto-opt at all — V4’s own rung')] });
  const m = l15[0];
  row({ gate: 'R3a-5 the M15 → M22 PIN', id: 'ptr', leg: 'from all/M15.json → M22', ok: m.marks?.M22 === M22_PIN.ticks && m.hashGame === M22_PIN.hashGame,
    ticks: m.ticks, gameSeconds: m.gameSeconds, diff: 1, hash: m.hashGame, notes: `M22 ${m.marks?.M22} / ${m.hashGame} against the pinned ${M22_PIN.ticks} / ${M22_PIN.hashGame}; ${marksOf('L15', m)}` });
}

// ---- Part 6: should the DERIVED default for the kind become `sequential`? ------------------------------------------
// ⛔ THE FAILURE THAT MATTERS is a challenge that can never be completed trapping the run, and a kind default reaches
// every game on the roster. The sample is BOUNDED and names what it bounded.
async function part6() {
  await sweep({ gate: 'R3a-6 Something Tree, the generality control —', leg: 'L3', repeat: 1, cells: [
    cell('', 'games-auto/something.js unchanged — a moved DERIVED default must not move this leg at all'),
  ] });
  // which games have challenges a derived feature would register at all: the engine's own declaration, counted.
  const ids = GAMES();
  const sample = ids.slice(0, Number(a.sample || 14));
  const ROSTER_EVAL = [
    '(function(){',
    '  var cs = tmtLoader.features.filter(function(f){ return f.kind === "challenges"; });',
    '  return { features: cs.map(function(f){ return { id: f.id, policy: f.policy }; }),',
    '           active: cs.map(function(f){ return player[f.layer] ? player[f.layer].activeChallenge : null; }),',
    '           ch: tmtLoader.hookStats().challenges };',
    '})()',
  ].join('');
  const results = [];
  for (const id of sample) {
    const r = await runCells({ id, cells: [cell('', id)], flags: Object.entries({ diff: 1, ticks: Number(a.rosterTicks || 600), profile: 'all', 'wall-ms': 300000, eval: ROSTER_EVAL }), pool: 1, repeat: 1 });
    results.push({ id, line: r[0].runs[0] });
  }
  const withCh = results.filter((x) => (x.line.eval?.features || []).length);
  row({ gate: 'R3a-6 the BOUNDED roster sample: which games register a `challenges` feature at all', id: '—', leg: `${sample.length} games (the first ${sample.length} ids in the roster's own order), ${Number(a.rosterTicks || 600)} ticks each, diff 1`, ok: results.every((x) => x.line.ok),
    notes: `${withCh.length} of ${sample.length} register one: ${withCh.map((x) => `${x.id} [${x.line.eval.features.map((f) => `${f.id}=${f.policy}`).join(', ')}]`).join(' · ') || 'none'}` });
  row({ gate: 'R3a-6 …and what each of them was DOING at the stop', id: '—', leg: 'the same legs', ok: results.every((x) => x.line.ok),
    notes: withCh.map((x) => `${x.id}: active ${JSON.stringify(x.line.eval.active)} enter/exit/gaveUp ${JSON.stringify(x.line.eval.ch)}`).join(' · ') || 'no game in the sample registers a challenges feature' });
  row({ gate: 'R3a-6 VERDICT: the derived default for the `challenges` kind', id: '—', ok: true, ticks: null, gameSeconds: null, diff: null, hash: null,
    notes: 'a kind default reaches every game on the roster, and the roster is 171 games nobody has swept. Read the two rows above with part 1’s: the exit rule removes the trap ON PTR, which is one game' });
}

// ---- Part 7: the PAGE — the new modifier through V2's editors -------------------------------------------------------
async function part7() {
  const { chromium } = await import('playwright');
  const { startServer } = await import('./lib.mjs');
  const srv = await startServer(REPO);
  const browser = await chromium.launch();
  try {
    for (const id of ['ptr', 'something']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      const errs = [];
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      page.on('pageerror', (e) => errs.push(String(e)));
      // ⚠ THE LOADER'S PAGE IS THE REPO ROOT, NOT THE GAME'S OWN index.html — `index.html?mod=<id>&automation=1`
      // is how every other page gate opens a game (gates-v4:550), and a game's own file boots the PLAIN page with no
      // loader at all. The first cut of this row waited 60 s for `tmtLoader.features` on a page that has no tmtLoader.
      await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1`, srv.url).href, { waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (window.tmtLoader.ready || window.tmtLoader.error), null, { timeout: 60000 });
      // ⛔ THE ROW HAS TO OPEN THE VIEW, NOT JUST READ THE TABLE. `T.modifiers('challenges')` carrying the row is a
      // fact about DATA; the CLAIM is that V2's generic editors render it with no new component, and only the DOM can
      // say that. ptr's `challenges:h` is LOCKED at a fresh boot (its layer is) and a locked block renders no editors,
      // so the leg switches the feature ON — which ARMS it (U4) — and an armed block IS editable.
      const seen = await page.evaluate(async () => {
        const T = window.tmtLoader;
        const out = { kinds: [], mods: {}, components: (T.componentNames || []).length, target: null, modFields: [], button: null, ctlFields: 0, error: null };
        try {
          for (const f of T.features) if (!out.kinds.includes(f.kind)) out.kinds.push(f.kind);
          for (const k of out.kinds) out.mods[k] = T.modifiers(k).map((m) => m.id);
          const ch = T.features.filter((f) => f.kind === 'challenges')[0];
          if (!ch) return out;
          out.target = ch.id;
          // ⚠ `setFeatureEnabled` IS A RUNTIME OVERRIDE AND LEAVES THE BLOCK `locked` — measured: the state word
          // stayed `locked` and nothing rendered. What makes a locked block editable is ARMING it, which is the
          // SAVE (`player.au.armLocked` + `player.au.features[id]`), i.e. exactly what the Simple tab's press does.
          T.armLocked(true);
          if (!player[T.auLayer].features) player[T.auLayer].features = {};
          player[T.auLayer].features[ch.id] = true;
          T.setSavedPolicy(ch.id, 'sequential|give-up@0.2/40/3x');
          showTab('au');
          updateTemp();
          player.subtabs[T.auLayer].mainTabs = 'Advanced';
          updateTemp();
          T.invalidateView();
          await new Promise((r) => setTimeout(r, 500));
          const q = `[data-fid="${ch.id}"]`;
          out.state = (T.explain().find((r) => r.id === ch.id) || {}).state;
          out.button = (document.querySelector(`button.tmtl-mod${q}`) || {}).textContent || null;
          out.modFields = Array.from(document.querySelectorAll(`input.tmtl-input${q}`)).map((n) => n.getAttribute('data-param')).filter((x) => x && x.indexOf('modifier:') === 0);
          out.ctlFields = document.querySelectorAll(`.tmtl-ctl-row${q}`).length;
        } catch (e) { out.error = String((e && e.message) || e).slice(0, 200); }
        return out;
      });
      const hasCh = seen.kinds.includes('challenges');
      const wantFields = ['modifier:b', 'modifier:h', 'modifier:r'];
      const fieldsOk = JSON.stringify(seen.modFields.slice().sort()) === JSON.stringify(wantFields);
      const ok = !errs.length && !seen.error && seen.components === 7
        && (!hasCh || ((seen.mods.challenges || []).includes('give-up@B/H/Rx') && fieldsOk
            && !!seen.button && seen.button.indexOf('Give up when it stops getting closer') >= 0));
      row({ gate: `R3a-7 the page on ${id}: the new modifier through V2’s GENERIC editors`, id, leg: 'index.html?mod=<id>&automation=1, Advanced, the feature switched on', ok,
        ticks: null, gameSeconds: null, diff: null, hash: null,
        notes: `kinds [${seen.kinds.join(', ')}]; modifiers ${JSON.stringify(seen.mods)}; target ${seen.target} (state ${seen.state}); the modifier's three parameter editors rendered: ${JSON.stringify(seen.modFields)}; the button reads "${seen.button}" (⚖ read from the modifier's own table ROW — it said "the stall fallback" on every kind before this slice); V4 control rows still ${seen.ctlFields}; componentNames ${seen.components} (⛔ UNCHANGED: no new tmtl-* family); console errors ${errs.length}${seen.error ? '; EVAL ERROR ' + seen.error : ''}${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}` });
      await page.close();
    }
  } finally { await browser.close(); srv.stop(); }
}

// ---- Part q: the lever the part-3 sweep FOUND, which is not the one the brief named ---------------------------------
// ⛔ MEASURED FIRST, THEN CUT. All five `reset:h` cells of part 3 come back BYTE-IDENTICAL — same marks, same end
// hash, `reset:h` acting exactly ONCE in every one — because from `all/M22.json` the engine itself refuses:
// `reset:h` reads *"Cannot reset — 5.46e23 of 1.00e30"*. `h` needs 1e30 Time Energy, Time Energy is row 2's, and
// `reset:q` wipes row 2; the M21 pause ends the moment `h` unlocks, so `reset:q` fires 128–532 times over the leg
// and Time Energy never gets within six orders of magnitude of the requirement again. A POLICY cannot answer a
// question the engine never asks. The lever is the PAUSE on `reset:q`, which is the table's `gates` entry, and this
// part sweeps it.
// ⚖ 13d.2: cell (ii) and (iv) are the digest's own literal (L3.13, "grind … up to 100 … hindrance spirit up to 100")
// at two sizes, and (iii) is the ENGINE-DERIVED alternator — pause `q` while the sibling layer cannot reset — which
// needs no literal at all. Every one of them keeps the `!hasMilestone('q',4)` guard, because V4 measured what
// happens without it: a pause that can be true before `q` has ever reset stops `q` unlocking at all (§27.5).
const Q_GATE = (tail) => `while:reset:q=!hasMilestone('q',4) || ${tail}`;
async function partQ() {
  await sweep({ gate: 'R3a-q the `reset:q` PAUSE, under the winning challenge configuration on L1 —', leg: 'L1', cells: [
    cell(`policy:challenges:h=${GIVEUP}`, 'CONTROL: the gate the table SHIPS (`player.h.unlocked`) — the pause is over the moment `h` exists, so Time Energy never climbs again'),
    cell(`policy:challenges:h=${GIVEUP};${Q_GATE('(player.h.unlocked && player.h.points.gte(100))')}`, "the digest's literal (L3.13): keep `q` paused until the hindrance layer holds 100"),
    cell(`policy:challenges:h=${GIVEUP};${Q_GATE('tmp.h.canReset')}`, '⚖ the ENGINE-DERIVED alternator, no literal: pause `q` while the sibling layer cannot reset, and let it go the moment it can'),
    cell(`policy:challenges:h=${GIVEUP};${Q_GATE('(player.h.unlocked && player.h.points.gte(10))')}`, 'the same literal an order of magnitude smaller — the pair that shows whether 100 is a threshold or a slope'),
  ] });
  row({ gate: 'R3a-q VERDICT: what stands between this frontier and M25', id: 'ptr', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: 'read `h`, `q` and the enter/exit/gaveUp triple together on the four rows above. H12 wants BOTH ~100 quirks and ~100 hindrance spirit (digest L3.13) and the two are fed by the SAME row-2 resource, so every configuration here is choosing between them — and every challenge attempt is itself a forced layer reset that wipes it' });
}

const PARTS = { 1: part1, 2: part2, 3: part3, 4: part4, 5: part5, 6: part6, 7: part7, q: partQ };
if (!PARTS[PART]) { console.error(`unknown --part ${PART} (have: ${Object.keys(PARTS).join(', ')})`); process.exit(2); }
await PARTS[PART]();
if (!a['no-summary']) appendSection({ title: `gate R3a part ${PART} — the Hindrance challenges: enter, give up, and the rung M23–M26`, commit, dirty, rows, slug: `r3-${PART}`, reading: READING });
// ⚠ WRITTEN UNCONDITIONALLY, unlike the SUMMARY section: CI runs every part with `--no-summary` and then uploads
// this file as the job's artifact, so a `--no-summary` run that wrote nothing would upload nothing (gates-v4:942).
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-r3-part${PART}-last.json`), { date: new Date().toISOString(), commit, dirty, rows });
const green = rows.filter((r) => r.ok).length;
console.log(`\nVERDICT: rows ${green}/${rows.length} of ${ROWS[PART] ?? '?'} expected`);
if (a.assert && (rows.length !== ROWS[PART] || green !== rows.length)) process.exit(1);
