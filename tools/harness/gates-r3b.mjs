// Gate R3b-1 (plan §31a/§31b/§32): the ROW CYCLE — turn-taking between same-row resets, demand-driven, and H12.
//   node tools/harness/gates-r3b.mjs --part 1     the CYCLE sweep on the whole stretch (all/M15 → 37048), every cell TWICE
//   node tools/harness/gates-r3b.mjs --part 2     R1–R4, the four requirements, on BOTH engine families
//   node tools/harness/gates-r3b.mjs --part 3     H12 "Speed Demon" — the ENTRY-STATE question, read off the source first
//   node tools/harness/gates-r3b.mjs --part 4     the rung M25 / M26 and its fixtures
//   node tools/harness/gates-r3b.mjs --part 5     INERTNESS: the opening, M15 → M24, and the key sets
//   node tools/harness/gates-r3b.mjs --part 7     THE RATIO: over the WHOLE STRETCH, does a weight of W actually
//                                                 buy W resets per round? (§34 — stub legs cannot see this)
//   node tools/harness/gates-r3b.mjs --part 6     the PAGE: the cycle's parameters through V2's editors, ptr AND something
//
// ⛔ THE WALL THIS BATTERY IS BUILT AROUND, and it is the third appearance of ONE shape (plan §24.7, §30.2 item 1,
// §31). Two layers of the same ROW each reset by wiping every row below them, so each takes the other's input away
// again. On PTR row 3 that is `h` (a fixed, cheap 1e30 Time Energy) against `q` (a Generator Power requirement that
// is neither), and no arrangement of per-feature POLICIES fixes it: `always` on `h` ends with 38 Hindrance Spirit and
// every quirk frozen, the shipped table ends with ONE Hindrance Spirit, and R3a's derived pause never unlocks `h` at
// all. What decides is WHOSE TURN IT IS — so the thing under measurement here is a scheduler, not a threshold.
//
// ⚠ ONE HORIZON FOR EVERY CELL OF PART 1, INCLUDING THE CONTROL. The planner's own table (plan §31a) read the
// control at 42048 and the three turn-taking rows at 37048, so its quirk counts are not comparable across rows — it
// said so in the handshake. Every cell here is 21,000 ticks from `all/M15.json`, i.e. 37048 game-seconds, and every
// cell runs TWICE; a cell whose two runs disagree on the marks, the end game-second or the end `hashGame` is RED.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, GAMES, parseArgs, writeJSON, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

// ⛔ `assert` IS DECLARED A BOOLEAN, AND CI FOUND OUT WHY. `parseArgs` gives an undeclared flag the NEXT token as
// its value — so `--no-summary --assert | tee` left `a.assert` UNDEFINED and the battery exited 0 over a run that
// printed `VERDICT: rows 2/10 of 9 expected`. The job was green and the gate was red. (`gates-r3.mjs` has the same
// omission with the opposite symptom: `--assert --pool 4` makes `assert` the string "--pool" — truthy, so the
// refusal works — and swallows the pool size.) ⚠ A checkmark is not a verdict; this is that lesson inside the
// tool that produces the checkmark.
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 340)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH (`--assert`, CI): a battery that dies part-way prints fewer rows, and fewer rows
// is fewer reds. ⚠ RE-MEASURED AGAINST WHAT EACH PART ACTUALLY EMITS rather than against what its author expected —
// CI has caught exactly this on five slices running (plan §30.3).
// V5: part 7 gained the `turn@60` cell at the shipped K (plan §35 item 2): 3 → 4.
const ROWS = { 1: 9, 2: 10, 3: 6, 4: 4, 5: 5, 6: 2, 7: 4 };

const READING = [
  'Every cell is ONE run.mjs process, run TWICE unless the row says otherwise; a cell whose two runs disagree on the',
  'marks, the end game-second or the end hashGame is RED. L15 = from snapshots/ptr/all/M15.json (16048 game-s),',
  '21,000 ticks, diff 1, --profile all, the stall watch OFF — so every row of part 1 ends at 37048 game-seconds and',
  'the quirk counts ARE comparable (the planner\'s own table read its control 5,000 game-s later than its other rows',
  'and said so). L1 = from all/M22.json → M26, the rung\'s own leg. L2 = a FRESH game → M12, the opening\'s',
  'regression column. L3 = Something Tree S01–S05 with games-auto/something.js unchanged — the generality control,',
  'where "no change" is the result. A cell\'s label is the whole --auto-opt string it ran, so a row names the',
  'configuration it measured (§14d.2 item 14). "—" for a mark means NOT REACHED inside the leg, which is a result.',
].join(' ');

const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const SOMETHING_LADDER = path.join(REPO, 'tools/harness/ladder/something.json');
const SNAP_ALL = path.join(REPO, 'tools/harness/snapshots/ptr/all');
const POOL = Number(a.pool || 5);
const REPEAT = Number(a.repeat || 2);

// The row-3 readout every L15/L1 row carries. ⚠ `q.time` and `q.energy` are in it because part 3 found that they are
// what H12 is actually measured against (see part 3's header), and `qbuy11` (Quirk Layers) because it is the EXPONENT
// on quirk-energy regrowth. `cycleState()` is the scheduler's own record — whose turn, how long its turns take.
export const READOUT = `({points: String(player.points), q: String(player.q.points), qTotal: String(player.q.total), qLayers: String(player.q.buyables[11]), qMs: player.q.milestones.slice(), qUpg: player.q.upgrades.slice(), qTime: String(player.q.time), qEnergy: String(player.q.energy), h: String(player.h.points), hBest: String(player.h.best), hChall: Object.assign({}, player.h.challenges), active: player.h.activeChallenge, te: String(player.t.energy), gp: String(player.g.power), sb: String(player.sb.points), ch: tmtLoader.hookStats().challenges, cyc: tmtLoader.cycleState()})`;
const READOUT_OPEN = `({points: String(player.points), p: String(player.p.points), gp: String(player.g.power), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder], cyc: tmtLoader.cycleState(), rtKeys: Object.keys(tmtLoader.runtimeState()).sort(), auKeys: Object.keys(player.au).sort()})`;
const READOUT_SOMETHING = `({points: String(player.points), fundamental: String(player.fundamental.points), primitive: String(player.primitive.points), unlock: String(player.unlock.points), cyc: tmtLoader.cycleState()})`;

const LEG = {
  L15: { id: 'ptr', marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26'],
    flags: { diff: 1, ticks: Number(a.ticks || 21000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M26',
      'from-snapshot': path.join(SNAP_ALL, 'M15.json'), 'marks-continue': true, stall: 1000000, eval: READOUT } },
  // ⚠ NO `--marks-continue` HERE, AND THAT IS THE POINT OF THE ROW (R3a's own note): the inertness claim is about
  // the marks and the state AT M24, not about whatever a leg drifts to afterwards — so the leg STOPS at the mark
  // and its end state IS the mark. A row that compared an end hash 6,000 ticks later would be comparing two
  // different states and would red on a slice that moved neither.
  L15m24: { id: 'ptr', marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'],
    flags: { diff: 1, ticks: Number(a.ticks24 || 16000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M24',
      'from-snapshot': path.join(SNAP_ALL, 'M15.json'), stall: 1000000, eval: READOUT } },
  L1: { id: 'ptr', marks: ['M23', 'M24', 'M25', 'M26'],
    flags: { diff: 1, ticks: Number(a.ticks1 || 12000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M26',
      'from-snapshot': path.join(SNAP_ALL, 'M22.json'), 'marks-continue': true, stall: 1000000, eval: READOUT } },
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

function cycText(e) {
  const c = e && e.cyc;
  if (!c || !Object.keys(c).length) return 'no cycle';
  return Object.entries(c).map(([k, v]) => `row ${k}: ${v.round} turns, holder ${v.holderLayer}, typical ${JSON.stringify(v.typical)}${v.demand ? ', on demand' : ''}`).join(' | ');
}
function readoutText(leg, l) {
  const e = l.runs?.[0]?.eval || l.eval || null;
  if (!e) return '—';
  if (leg === 'L2') return `pts ${short(e.points)}, p ${short(e.p)}, gp ${short(e.gp)}, uo ${JSON.stringify(e.uo)}, ${cycText(e)}, runtime keys [${(e.rtKeys || []).join(',')}], player.au keys [${(e.auKeys || []).join(',')}]`;
  if (leg === 'L3') return `pts ${short(e.points)}, fundamental ${short(e.fundamental)}, primitive ${short(e.primitive)}, unlock ${short(e.unlock)}, ${cycText(e)}`;
  const c = e.ch && e.ch['challenges:h'];
  return `q ${e.q}/${e.qTotal} total, QL ${e.qLayers}, q ms [${e.qMs}], q upg [${e.qUpg}], q.time ${short(e.qTime)}, q.energy ${short(e.qEnergy)}, h ${e.h} (best ${e.hBest}), h challenges ${JSON.stringify(e.hChall)}, active ${e.active}, enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'}, TE ${short(e.te)}, GP ${short(e.gp)}, SB ${short(e.sb)}, pts ${short(e.points)}, ${cycText(e)}`;
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
  writeJSON(path.join(REPO, `tools/harness/results/tmp/r3b-${gate.replace(/[^\w]+/g, '-')}.json`), { gate, leg, cells, lines });
  return lines;
}

// ---- the candidates ------------------------------------------------------------------------------------------------
// ⚖ 13d.2 — no arbitrary waiting. The WEIGHT is the one literal here and it is a sweep AXIS, which is where a literal
// comes from; K and N are the guard's two buffers, carried from `stall>=Kx/N` at its own defaults; and the DEMAND
// variant needs no weight at all, which is the point of measuring it against them.
// R3b-2: every pre-existing row keeps the dead-member rule SILENT (`/0/0` — B and H at zero, a window of zero is
// no window), so each of them reproduces the value it was pinned at. The rows that MEASURE that rule say so.
const GUARD = `${String(a.k || '3')}x/${String(a.n || '5')}/0/0`;
// ⚠ `reset:h=always` INSIDE THE CELL, AND IT IS THE POINT OF THE CELL. A member decides by its OWN policy inside
// its turn (the first cut made it eager and the sweep measured what that costs `q`: one quirk a reset instead of
// two). `h`'s derived `gain>=2x` can fire exactly once — an empty purse makes the bar zero — and never again, so a
// cycle member that must be eager says so with `always`, which is a table's choice carrying its own provenance.
const turn = (w, kind = 'turn') => `policy:reset:q=gain>=2|${kind}@${w}/${GUARD};policy:reset:h=always|${kind}@1/${GUARD}`;

async function part1() {
  await sweep({ gate: 'R3b-1 the ROW CYCLE over the whole stretch —', leg: 'L15', cells: [
    cell('', 'CONTROL: the table as it SHIPS at this head — no cycle anywhere. Re-measured at 37048 so its quirk count is comparable with the rows below (the planner\'s own control was read at 42048)'),
    cell('policy:reset:h=always', 'CONTROL: the eager `reset:h` the user hit by hand — the starvation this slice exists to fix, and the row that says what "h grows" costs when nobody is taking turns'),
    cell(turn(1), 'W = 1: strict alternation — one q reset per h reset'),
    cell(turn(5), 'W = 5'),
    cell(`policy:reset:q=gain>=2|turn@20/${GUARD};policy:reset:h=gain>=2x|turn@1/${GUARD}`, 'W = 20 with `reset:h` left at its DERIVED `gain>=2x` — the control that says what "a member decides by its own rule" costs when that rule can fire only once'),
    cell(turn(20), 'W = 20 — the planner\'s probe found the interior optimum near here'),
    cell(turn(60), 'W = 60'),
    cell(turn(1, 'turn-demand'), 'the DEMAND-driven variant at W = 1: whenever a decision names a member\'s layer as what it is waiting on (R3a\'s retry bar does), that member gets the turn; with no demand the weights decide'),
  ] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b-1 VERDICT: which cycle configuration grows `h` without starving `q`, and what the ratio costs', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} cells reproduced twice equal; read Hindrance Spirit, total quirks, q upgrades and the enter/exit/gaveUp triple ACROSS the rows — every row ends at the same game-second, so the columns are comparable` });
}

// ---- Part 2: R1–R4, the four requirements the planner's nine void cells taught ------------------------------------
// ⛔ EACH IS A CLAIM ABOUT THE MECHANISM, NOT ABOUT PTR, so each runs on BOTH ENGINE FAMILIES — ptr (a 2.2.1-style
// engine) and Something Tree (a 2.7-style one). R4 is the reason: six of the planner's cells read
// `player.<layer>.resetTime`, which EXISTS ONLY on 2.7, compared it against `undefined` on ptr, and measured
// nothing — and the tell was two complementary gates both reading false. A leg green on one family proves nothing
// about the other, which is why every row here is a pair.
// ⛔ AND THE 2.7 EXEMPLAR IS NOT `something`, WHICH IS A FINDING RATHER THAN A CHOICE. Measured at 600 ticks,
// `--profile all`: Something Tree has exactly ONE active reset feature on every row it reaches (`unlock` on row 0,
// `fundamental` on row 1, `primitive` on row 2) and the deeper row-2 layers never unlock inside its whole ladder —
// so it CANNOT host a cycle at its frontier, and legs written against it would measure a dormant row and read as
// green. The 2.7 family therefore needs a third game, and the roster is where it comes from: a bounded scan of the
// first 24 ids found `collection-of-everything` (17 layers carrying `player[l].resetTime`, five active resets on
// row 1 at 600 ticks) and `the-congratulations-tree` (12, three on row 1). The first is used here; ptr carries
// `resetTime` on ZERO layers, which is the other half of what R4 is about.
// ⚠ `lastActedAt`, NOT the ACTION COUNT, and CI found the difference. `hookStats().actions` CONTINUES ACROSS A
// RESUME — it is part of `runtimeState()` and a fixture carries it — so on a leg that starts from `all/M22.json`
// the counter already reads 13 for `reset:q` before the leg has run a tick, and a row that asked "did the paused
// member act?" answered yes about thirteen resets that happened in a previous process. `f.lastActedAt` lives
// OUTSIDE `runtimeState()` (V1's readout memory), so it is null at the start of every process and `!== null` means
// "acted in THIS leg" — which is what every one of these rows is actually asking.
const FAM_EVAL = `({cyc: tmtLoader.cycleState(), acts: tmtLoader.hookStats().actions, turnCodes: (tmtLoader.explainStats().codes['waiting:turn'] || 0), rt: (function(){var n=0;for(var l in layers){if(layers[l].tmtLoaderLayer)continue;if(player[l]&&player[l].resetTime!==undefined)n++;}return n;})(), on: (function(){var o={};tmtLoader.explain().forEach(function(r){if(r.kind==='reset'&&r.state==='on')o[r.id]=(layers[r.layer]||{}).row;});return o;})(), acted: (function(){var o={};tmtLoader.explain().forEach(function(r){if(r.kind==='reset')o[r.id]=r.lastActedAt===undefined?null:r.lastActedAt;});return o;})(), last: (function(){var o={};tmtLoader.explain().forEach(function(r){if(r.kind==='reset')o[r.id]=r.last?r.last.code:null;});return o;})()})`;
const PATIENT = 'gain>=1e300';   // a bar no layer in either family can clear — the "patient policy" every R2 leg needs
const FAMILIES = [
  { id: 'ptr', family: '2.2.1-style — ZERO layers carry `player[l].resetTime`', rowKey: '3', carrier: 'reset:q', other: 'reset:h', wantRT: 0,
    flags: { diff: 1, ticks: Number(a.p2ticks || 4000), profile: 'all', stall: 1000000, 'wall-ms': 300000,
      'from-snapshot': path.join(SNAP_ALL, 'M22.json'), eval: FAM_EVAL } },
  // ⚠ `mush` AND `w`, NOT `bam`: measured on this build, `reset:bam` stops being active part-way through the leg,
  // and a row whose only carrier has gone leaves no cycle record at all — the row then reads `ABSENT` and says
  // nothing about the mechanism. The carrier has to be a member that is still there at the stop.
  { id: 'collection-of-everything', family: '2.7-style — 17 layers carry `player[l].resetTime`', rowKey: '1', carrier: 'reset:mush', other: 'reset:w', wantRT: 1,
    flags: { diff: 1, ticks: Number(a.p2ticks2 || 1500), profile: 'all', stall: 1000000, 'wall-ms': 300000, eval: FAM_EVAL } },
];
async function part2() {
  for (const F of FAMILIES) {
    const legs = [
      { key: 'R1', name: 'the cycle BINDS EVERY MEMBER of the row',
        opt: `policy:${F.carrier}=always|turn@5/${GUARD};policy:${F.other}=always`,
        note: `only \`${F.carrier}\` carries the modifier, and \`${F.other}\` is given a policy that can always fire so the ENGINE is the only thing that can refuse it. R1 holds iff \`${F.other}\` is a member anyway and WAITS — the planner's void cell left an eager one out and it fired 44 times, wiping the row below before the member whose turn it was could use it` },
      { key: 'R2', name: 'a member decides by its OWN policy inside its turn',
        opt: `policy:${F.carrier}=${PATIENT}|turn@2/${GUARD};policy:${F.other}=always|turn@2/${GUARD}`,
        note: `the carrier keeps a primary no layer of either family can ever clear (\`${PATIENT}\`) and the other is eager. R2 holds iff the patient member does NOT act — the turn is not a licence — and does NOT block: it yields the moment its own rule says no, so the eager member goes on acting` },
      { key: 'R3', name: 'a member the cycle cannot use does not stop the rotation',
        opt: `policy:${F.carrier}=always|turn@9/${GUARD};policy:${F.other}=always|turn@9/${GUARD};while:${F.carrier}=false`,
        note: `a PERMANENT block, constructed: \`${F.carrier}\` is paused for the whole leg. A cycle that could not move past it would hand it turn after turn and the rotation would stop dead` },
      { key: 'R4', name: 'the turn memory is the LOADER’s own',
        opt: `policy:${F.carrier}=always|turn@2/${GUARD};policy:${F.other}=always|turn@2/${GUARD}`,
        note: `the record is \`cycleState().own\` / \`.turns\` — the median wait between that member's OWN resets. ⛔ The tempting engine field is \`player[l].resetTime\`, and this row reports how many layers of THIS game carry it: a memory read from it would be \`undefined\` on a 2.2.1 game and a number on a 2.7 one, which is exactly how six of the planner's probe cells measured nothing and looked like a result` },
    ];
    for (const L of legs) {
      const lines = await runCells({ id: F.id, cells: [cell(L.opt, L.note)], flags: Object.entries(F.flags), pool: 1, repeat: 1 });
      const l = lines[0];
      const e = l.runs?.[0]?.eval || l.eval || null;
      const C = (e && e.cyc && e.cyc[F.rowKey]) || null;
      const A = (e && e.acts) || {};
      const AT = (e && e.acted) || {};           // lastActedAt: null unless the feature acted in THIS process
      const LAST = (e && e.last) || {};
      const TC = e ? e.turnCodes : 0;            // how many `waiting:turn` DECISIONS the whole leg made
      const rt = e ? e.rt : null;
      const didAct = (id) => AT[id] !== null && AT[id] !== undefined;
      let ok = !!l.ok && !!C && !C.dormant;
      let why = '';
      if (ok && L.key === 'R1') { ok = C.members.length >= 2 && didAct(F.other) && TC > 0;
        why = `${C.members.length} members, ${F.other} acted at ${AT[F.other]}, and the leg made ${TC} \`waiting:turn\` decisions — which cannot happen at all unless a non-carrier is bound`; }
      if (ok && L.key === 'R2') { ok = C.round >= 2 && !didAct(F.carrier) && didAct(F.other);
        why = `round ${C.round}; the patient ${F.carrier} did NOT act (lastActedAt ${AT[F.carrier]}, reading \`${LAST[F.carrier]}\`) and did not block — ${F.other} acted at ${AT[F.other]}`; }
      // ⚠ WHAT THIS ROW DOES NOT ASSERT, AND WHY — TWO CLAUSES, BOTH REMOVED BY MEASUREMENT.
      //   · "and another member acted" is a claim about the GAME, not the scheduler, and it is FALSE on
      //     `collection-of-everything`: pausing a row-1 reset can starve the whole of its row, because that is
      //     what that tree's row 1 is.
      //   · "and the paused member reads `blocked:gate`" is a claim about the PAUSE, and it is false whenever the
      //     paused layer's node stops being shown mid-leg: `runLayer` asks `active(f)` BEFORE it evaluates any
      //     predicate, so such a member reads `locked` — a STRONGER form of "the cycle cannot use it". Reported.
      //   · AND A THIRD, removed by the mechanism this slice measured its way to: "the rotation keeps moving, at
      //     least one full turn per member". It does not have to. A holder waiting on the ENGINE keeps its turn
      //     for as long as it takes — that is the whole point, and on ptr `reset:h` legitimately holds row 3's
      //     turn while Time Energy climbs. Asserting the rotation moves would be asserting the starvation back in.
      // What is left is the claim that is about the PAUSE: the cycle steps over a member it may not use, rather
      // than handing it a turn. `round >= 2` says a turn was granted at all, to somebody who is not the carrier.
      if (ok && L.key === 'R3') { ok = C.round >= 2 && !didAct(F.carrier)
        && C.holder !== F.carrier && !(C.turns[F.carrier] > 0);
        why = `round ${C.round} over ${C.members.length} member(s); the paused ${F.carrier} reads \`${LAST[F.carrier]}\`, never held the turn (holder ${C.holderLayer}), remembers ${C.turns[F.carrier]} resets and did not act in this leg`; }
      if (ok && L.key === 'R4') { ok = Object.values(C.own).some((v) => v !== null) && (F.wantRT ? rt > 0 : rt === 0);
        why = `own ${JSON.stringify(C.own)}, resets remembered ${JSON.stringify(C.turns)}, layers carrying player[l].resetTime: ${rt}`; }
      row({ gate: `R3b-${L.key} ${L.name}`, id: F.id, leg: `${F.family}, row ${F.rowKey}, ${F.flags.ticks} ticks, ONE run`, ok,
        ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
        notes: `cell \`${L.opt}\`; ${L.note}; ${why}; ⚠ action counts CONTINUE across a resume, so this row reads \`lastActedAt\` (null until the feature acts in THIS process), not \`hookStats().actions\` (${JSON.stringify(A)}); cycle rows [${Object.keys((e && e.cyc) || {}).join(',')}]; row ${F.rowKey} ${C ? `members [${C.members.join(', ')}] · ${C.round} turns · holder ${C.holderLayer} · own ${JSON.stringify(C.own)} · skip ${JSON.stringify(C.skip)}` : 'ABSENT'}; active resets by row ${JSON.stringify((e && e.on) || {})}; ${acts(l)}; ${box(l)}${l.error ? '; ERROR ' + l.error : ''}` });
    }
  }
  // ⛔ THE ROW THAT SAYS WHY THE 2.7 LEG IS NOT ON `something`, and it is a MEASUREMENT, not a note: it goes RED the
  // day Something Tree grows a second active reset on any row, which is the day these legs should move back onto it.
  {
    const lines = await runCells({ id: 'something', cells: [cell('', 'the reference 2.7 game at its own frontier')],
      flags: Object.entries({ diff: 1, ticks: Number(a.sTicks || 3000), profile: 'all', stall: 1000000, 'wall-ms': 300000,
        ladder: SOMETHING_LADDER, to: 'S05', eval: FAM_EVAL }), pool: 1, repeat: 1 });
    const l = lines[0];
    const e = l.runs?.[0]?.eval || l.eval || null;
    const byRow = {};
    for (const [fid, r] of Object.entries((e && e.on) || {})) (byRow[String(r)] || (byRow[String(r)] = [])).push(fid);
    const biggest = Math.max(0, ...Object.values(byRow).map((x) => x.length));
    row({ gate: 'R3b-R4b why the 2.7 leg is NOT on Something Tree — measured, not assumed', id: 'something',
      leg: 'S01 → S05, diff 1, profile all, ONE run', ok: !!l.ok && biggest < 2 && (e ? e.rt > 0 : false),
      ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `active resets by row ${JSON.stringify(byRow)}; the biggest row holds ${biggest} — so there is no cycle to construct here and a leg written against it would measure a DORMANT row and read green. ${e ? e.rt : '?'} layers carry \`player[l].resetTime\`, which is what makes it the 2.7 exemplar in the first place. ⚠ This row goes RED the day Something Tree grows a second active reset on one row, and that is the day these legs move back onto it; ${box(l)}` });
  }
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b-R VERDICT: the four requirements, on BOTH engine families', id: 'both', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} rows green. ⛔ A row green on one family says nothing about the other — R4 exists because six of the planner's probe cells compared against \`player[l].resetTime\`, which only the 2.7 family has, and measured "paused for ever" on ptr` });
}

// ---- Part 3: H12 "Speed Demon" — the source FIRST, then the sweep --------------------------------------------------
// ⛔ WHY IT FAILS AT 290 HINDRANCE SPIRIT, READ OFF `games/ptr/js/layers.js` BEFORE ANY CELL WAS RUN, and the digest's
// L3.13 ("grind for more quirks up to 100 and more Hindrance spirit up to 100 as well, and you will complete H2 in
// about 2–3 seconds") is measuring the wrong two quantities:
//   · h12's goal is **1e3550 POINTS** (`layers.js:2745`), and its in-challenge effect is `baseDiv12()`
//     (`layers.js:2693-2696`): the Booster/Generator BASES are divided by
//     `sqrt(player.q.time) × (3·player.sb.points³ + 1) + 1`.
//   · `player.q.time` is the game-seconds since the `q` layer last reset (`layers.js:2983` adds `diff`), and it is
//     zeroed by `q.doReset` AND by `h.doReset` (`layers.js:2957` and `2649`) — so ENTERING H12 zeroes it, and the
//     divisor then GROWS as sqrt(t) for as long as the attempt lasts. "Divided more over time" is literal: H12 is a
//     RACE, and R3a's measurement of it ("flat to seventeen digits from 80 game-seconds after entry") is the divisor
//     winning, not the tree being weak.
//   · the same two `doReset`s zero `player.q.energy`, and quirk energy is what multiplies point gain
//     (`mod.js:57`, `tmp.q.enEff = (q.energy+1)²`). It regrows as `q.time^(QuirkLayers + freeLayers − 1)` integrated
//     (`layers.js:2983-2984`), i.e. with an EXPONENT set by `player.q.buyables[11]`.
//   ⇒ the quantity that decides H12 is not Hindrance Spirit and not the quirk COUNT: it is how fast quirk energy can
//   regrow from zero, which is QUIRK LAYERS (and the q upgrades that multiply `enGainMult`) against sqrt(q.time).
//   Hindrance Spirit helps only through `tmp.h.effect`, one more multiplier on the same gain — which is why 290 of it
//   changes nothing while the exponent is unchanged. ⚠ AND IT IS THE CYCLE'S OWN COST: every `h` reset zeroes quirk
//   energy, so a cycle that gives `h` many turns is paying for Hindrance Spirit in the exact currency H12 needs.
async function part3() {
  const best = String(a.best || '20');
  await sweep({ gate: 'R3b-3 H12 — the ENTRY STATE, over the whole stretch —', leg: 'L15', cells: [
    cell(turn(best), `the best weight from part 1 (W = ${best}) as the baseline this part varies`),
    cell(`${turn(best)};policy:buyables:q=buyMax`, 'QUIRK LAYERS as the exponent: buy them as fast as the quirks arrive (`buyMax` instead of the derived `buy`), because `q.buyables[11]` is the EXPONENT on quirk-energy regrowth and the divisor is only sqrt(q.time)'),
    cell(`${turn(best)};while:challenges:h=hasMilestone('q',5) && player.q.time.lt(30)`, "ENTER RIGHT AFTER A q RESET: `player.q.time` is zeroed by entering, but the q upgrades q11–q13 are PRICED in it (`layers.js:3133/3146/3159`), so a low q.time at entry is a cheaper in-challenge shop. A `while` a player could write"),
    cell(`${turn(best)};while:challenges:h=hasMilestone('q',5) && player.q.buyables[11].gte(6)`, 'ENTER ONLY WITH THE EXPONENT: wait for 6 Quirk Layers before trying H12 at all — the derived form of "strong enough", read off the quantity the source says decides'),
  ] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b-3 VERDICT: does any reflex arrangement reach M25 — and if not, what is the wall\'s NAME', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} cells twice equal. ⚠ Read M25 and the enter/exit/gaveUp triple together with q.energy and QL at the end of each row. If none reaches M25 that is the RESULT, and plan §31 names this mark as the first where the ADVANCED planner's measured candidates plausibly earn their cost` });
  row({ gate: 'R3b-3 the digest\'s L3.13 CORRECTED by the source', id: 'ptr', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: 'h12 goal 1e3550 POINTS (layers.js:2745); in-challenge the Booster/Generator bases are divided by sqrt(player.q.time)·(3·sb³+1)+1 (baseDiv12, layers.js:2693); q.time AND q.energy are zeroed by both q.doReset and h.doReset (2957 / 2649); quirk energy regrows with an exponent of player.q.buyables[11] (2983-2984) and multiplies point gain as (q.energy+1)² (mod.js:57). ⇒ "100 quirks and 100 hindrance spirit" names neither quantity that decides it' });
}

// ---- Part 4: the rung and its fixtures ----------------------------------------------------------------------------
async function part4() {
  const best = String(a.best || '20');
  const dirs = [path.join(os.tmpdir(), `r3b-snap-1-${process.pid}`), path.join(os.tmpdir(), `r3b-snap-2-${process.pid}`)];
  dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));
  const both = await Promise.all([
    runCells({ id: 'ptr', cells: [cell(turn(best), 'run 1, writing fixtures')], flags: flagsOf('L15', { snapshots: dirs[0] }), pool: 1, repeat: 1, stop: 'M26' }),
    runCells({ id: 'ptr', cells: [cell(turn(best), 'run 2')], flags: flagsOf('L15', { snapshots: dirs[1] }), pool: 1, repeat: 1, stop: 'M26' }),
  ]);
  const [r1, r2] = both.map((x) => x[0]);
  const agree = r1.ok && r2.ok && r1.gameSeconds === r2.gameSeconds && r1.hashGame === r2.hashGame;
  row({ gate: `R3b-4 the rung under the cycle (W = ${best}), twice`, id: 'ptr', leg: 'L15, diff 1, profile all, 2 runs', ok: agree,
    ticks: r1.ticks, gameSeconds: r1.gameSeconds, diff: 1, hash: r1.hashGame,
    notes: `${marksOf('L15', r1)}; run 2 ${r2.gameSeconds}s/${r2.hashGame}; ${acts(r1)}; end ${readoutText('L15', r1)}; ${box(r1)}` });
  const written = fs.existsSync(dirs[0]) ? fs.readdirSync(dirs[0]).filter((f) => f.endsWith('.json')).sort() : [];
  for (const f of written) {
    const A = JSON.parse(fs.readFileSync(path.join(dirs[0], f), 'utf8'));
    const B = fs.existsSync(path.join(dirs[1], f)) ? JSON.parse(fs.readFileSync(path.join(dirs[1], f), 'utf8')) : null;
    const same = !!B && A.gameSeconds === B.gameSeconds && A.hash === B.hash && A.hashGame === B.hashGame;
    row({ gate: `R3b-4 fixture ${A.mark} reproduces`, id: 'ptr', leg: 'L15', ok: same, ticks: A.ticks, gameSeconds: A.gameSeconds, diff: A.diff, hash: A.hashGame,
      notes: `mark ${A.mark}; full hash ${A.hash}; run 2 ${B ? `${B.gameSeconds}s/${B.hash}/${B.hashGame}` : 'MISSING'}; runtime keys [${Object.keys(A.runtime || {}).sort().join(',')}]` });
  }
  row({ gate: 'R3b-4 VERDICT: which fixtures this rung would MOVE, and every consumer of the selector', id: 'ptr', ok: rows.every((r) => r.ok), ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: '⚠ `deepestSnapshot()` picks ptr\'s deepest fixture by TICKS (tools/harness/page.mjs, tools/harness/cost-layerlist.mjs), so ANY mark added or moved here shifts what those two read. Fixtures are written to a TEMP dir by this part and committed only by the slice, deliberately' });
}

// ---- Part 5: INERTNESS -------------------------------------------------------------------------------------------
// ⛔ EVERYTHING NEW IS OFF UNTIL A TABLE OR A PLAYER TURNS IT ON, and this part is what says so rather than the
// prose. A row cycle exists only where a reset feature's policy carries one of the two cycle modifiers.
async function part5() {
  await sweep({ gate: 'R3b-5 INERTNESS —', leg: 'L2', cells: [cell('', 'the OPENING to M12 with the table as it ships: no cycle, and `runtimeState()` / `player.au` key sets as R3a left them')] });
  await sweep({ gate: 'R3b-5 INERTNESS —', leg: 'L15m24', cells: [cell('', 'M15 → M24 with the table as it ships: every mark of the rung, and the state AT M24')] });
  await sweep({ gate: 'R3b-5 INERTNESS —', leg: 'L3', cells: [cell('', 'Something Tree S01–S05, games-auto/something.js unchanged: "no change" is the result')] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b-5 VERDICT: the pins this slice must not move', id: 'both', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length}. The opening must read 6718 / \`82eee26f947b2b2e\`; the runtime key set gains \`cycle\` ONLY where a cycle exists, so the L2 row's key list is the claim` });
  row({ gate: 'R3b-5 the key sets, declared', id: 'ptr', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: 'ADDED by this slice: `runtimeState().cycle` (absent unless a row has a cycle) — {holder,left,since,round,at,mem,skip} per row key. NOTHING is added to `player`, `player.au` or any `startData`, so no full-hash pin moves' });
}

// ---- Part 6: the PAGE ---------------------------------------------------------------------------------------------
// ⛔ THE TABLE IS NOT THE EVIDENCE — R3a's own lesson (§30.2a): `tmtLoader.modifiers('reset')` carrying the new rows
// is a fact about DATA, and the CLAIM is that V2's generic editors RENDER their parameters with no new component.
// Only the DOM can say that, and only on an ARMED feature (a locked block renders no editors).
async function part6() {
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
      // ⚠ THE LOADER'S PAGE IS THE REPO ROOT — a game's own index.html boots the PLAIN page with no loader at all.
      await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1`, srv.url).href, { waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (window.tmtLoader.ready || window.tmtLoader.error), null, { timeout: 60000 });
      const kind = id === 'ptr' ? 'turn' : 'turn-demand';
      const seen = await page.evaluate(async (k) => {
        const T = window.tmtLoader;
        const out = { mods: [], components: (T.componentNames || []).length, target: null, modFields: [], buttons: [], ctlFields: 0, turnLine: null, state: null, error: null };
        try {
          out.mods = T.modifiers('reset').map((m) => m.id);
          const f = T.features.filter((x) => x.kind === 'reset')[0];
          if (!f) return out;
          out.target = f.id;
          // ⚠ `setFeatureEnabled` is a RUNTIME override and leaves a locked block LOCKED (R3a §30.2a). What makes
          // one editable is ARMING it — the SAVE — which is exactly what the Simple tab's press does.
          T.armLocked(true);
          if (!player[T.auLayer].features) player[T.auLayer].features = {};
          player[T.auLayer].features[f.id] = true;
          T.setSavedPolicy(f.id, `always|${k}@7/4x/6/0.25/45`);
          showTab('au');
          updateTemp();
          player.subtabs[T.auLayer].mainTabs = 'Advanced';
          updateTemp();
          T.invalidateView();
          await new Promise((r) => setTimeout(r, 500));
          const q = `[data-fid="${f.id}"]`;
          out.state = (T.explain().find((r) => r.id === f.id) || {}).state;
          out.buttons = Array.from(document.querySelectorAll(`button.tmtl-mod${q}`)).map((n) => ({ mod: n.getAttribute('data-mod'), on: n.getAttribute('data-on'), text: (n.textContent || '').trim() }));
          out.modFields = Array.from(document.querySelectorAll(`input.tmtl-input${q}`)).map((n) => n.getAttribute('data-param')).filter((x) => x && x.indexOf('modifier:') === 0);
          out.ctlFields = document.querySelectorAll(`.tmtl-ctl-row${q}`).length;
          const spans = Array.from(document.querySelectorAll(`div${q} span, ${q} ~ * span`)).map((n) => (n.textContent || '').trim());
          out.turnLine = spans.find((t) => /turn|only one reset of this row/i.test(t)) || null;
        } catch (e) { out.error = String((e && e.message) || e).slice(0, 200); }
        return out;
      }, kind);
      // ⛔ THE TABLE IS NOT THE EVIDENCE: what this row claims is that V2's GENERIC editors render the cycle's five
      // parameters, that each modifier ROW gets its own button (⚠ before this slice ONE button could only ever
      // reach `mods[0]`, so the row cycle would have been unreachable from the tab on the one kind that has it),
      // and that no new component family appeared.
      // R3b-2: the cycle's parameters are now FIVE — `B` and `H` are the dead-member rule's, and they go through the
      // same generic editors, which is the whole argument for having put a scheduler in a modifier row.
      const wantFields = ['modifier:b', 'modifier:h', 'modifier:k', 'modifier:n', 'modifier:w'];
      const fieldsOk = JSON.stringify(seen.modFields.slice().sort()) === JSON.stringify(wantFields);
      const btnOk = seen.buttons.length === seen.mods.length
        && seen.buttons.some((b) => b.mod === `${kind}@W/Kx/N` && b.on === '1' && /remove/.test(b.text))
        && seen.buttons.some((b) => b.mod === 'stall>=Kx/N' && b.on === '0' && /add/.test(b.text));
      const ok = !errs.length && !seen.error && seen.components === 7 && fieldsOk && btnOk
        && seen.mods.includes('turn@W/Kx/N/B/H') && seen.mods.includes('turn-demand@W/Kx/N/B/H');
      row({ gate: `R3b-6 the page on ${id}: the CYCLE through V2’s GENERIC editors`, id, leg: 'index.html?mod=<id>&automation=1, Advanced, the feature armed', ok,
        ticks: null, gameSeconds: null, diff: null, hash: null,
        notes: `policy \`always|${kind}@7/4x/6\`; target ${seen.target} (state ${seen.state}); reset modifiers ${JSON.stringify(seen.mods)}; ONE BUTTON PER ROW: ${JSON.stringify(seen.buttons)}; the cycle's three parameter editors rendered: ${JSON.stringify(seen.modFields)}; the readout line "${seen.turnLine}"; V4 control rows still ${seen.ctlFields}; componentNames ${seen.components} (⛔ UNCHANGED: no new tmtl-* family); console errors ${errs.length}${seen.error ? '; EVAL ERROR ' + seen.error : ''}${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}` });
      await page.close();
    }
  } finally { await browser.close(); srv.stop(); }
}

// ---- Part 7: THE RATIO, over the WHOLE STRETCH ----------------------------------------------------------------------
// ⛔ THE ROW THE SLICE DID NOT HAVE, AND THE DEFECT IT WOULD HAVE CAUGHT. §33/§34: the built cycle failed to
// reproduce a configuration that demonstrably works, and the signature was that `turn@5` and `turn@20` measured
// BYTE-IDENTICAL — the weight was not honoured at all. Every leg of part 2 is on the stub, where a member is
// granted a turn and spends it inside a tick or two; NONE of them can see a weight that collapses only when a
// member's own rule says "not yet" and its waits are long. The question has to be asked of a REAL game over a
// WHOLE stretch, and it has to be asked as a RATIO rather than as a hash.
//
// ⚠ `exclude=reset:o,reset:ss` is part of the cell, not a convenience: PTR's row 3 has FOUR active members from
// M21 and two of them can never reset there, so a run without the exclusion measures the dead-member freeze
// instead of the ratio (§33 row (f)). The freeze is a REAL and separate defect — plan §32.4a names its candidate.
async function part7() {
  const cells = [
    cell(`exclude=reset:o,reset:ss;policy:reset:q=gain>=2|turn@5/${String(a.k7 || '100000')}x/5/0/0;policy:reset:h=always|turn@1/${String(a.k7 || '100000')}x/5/0/0`, 'W = 5'),
    cell(`exclude=reset:o,reset:ss;policy:reset:q=gain>=2|turn@20/${String(a.k7 || '100000')}x/5/0/0;policy:reset:h=always|turn@1/${String(a.k7 || '100000')}x/5/0/0`, 'W = 20 — the ORACLE’s own configuration (plan §33 row (b)); a build that reproduces it lands on `d2da5ef3a490f92a`'),
    // ⛔ V5 (owed from R3b-1, plan §35 item 2): THE CELL THAT LETS MUTANT m17 BE SEEN. At the SHIPPED guard (K = 30)
    // a twenty-reset turn spans ~380 game-seconds against a bound of ~570, so a guard clock started at the TURN'S
    // START and one started at the holder's LAST ACT both stay under it and m17 is invisible. Sixty resets span
    // ~1,140 — past the bound — so only the act clock keeps the turn; the turn-start clock releases it mid-turn.
    // ⚠ `K = 30` here, NOT the cells' `k7` (100000 = guard off): with the guard switched off no clock is consulted
    // and the row could not see a clock defect by construction.
    cell(`exclude=reset:o,reset:ss;policy:reset:q=gain>=2|turn@60/30x/5/0/0;policy:reset:h=always|turn@1/30x/5/0/0`, 'W = 60 at the SHIPPED guard K = 30 — the turn outlasts K × typical, so the guard\'s CLOCK ORIGIN decides (mutant m17)'),
  ];
  const lines = await sweep({ gate: 'R3b-7 the RATIO over the whole stretch —', leg: 'L15', cells, repeat: Number(a.repeat7 || 1) });
  const ratios = lines.map((l) => {
    const A = l.actions || {};
    return { q: A['reset:q'] || 0, h: A['reset:h'] || 0, r: (A['reset:h'] || 0) ? (A['reset:q'] || 0) / A['reset:h'] : 0, hash: l.hashGame };
  });
  // ⛔ THE CLAIM IS A RATIO AND A SEPARATION, not a hash: `W` resets of the weighted member per reset of the
  // weight-1 member, within a factor of two, AND the two weights must not land on the same run.
  const ok5 = ratios[0].r >= 2.5 && ratios[0].r <= 10;
  const ok20 = ratios[1].r >= 10 && ratios[1].r <= 40;
  const ok60 = ratios[2].r >= 30 && ratios[2].r <= 120;
  const distinct = new Set(ratios.map((x) => x.hash)).size === ratios.length;
  row({ gate: 'R3b-7 VERDICT: a weight of W buys about W resets per round, and different weights are different runs', id: 'ptr',
    leg: 'L15, diff 1, profile all', ok: ok5 && ok20 && ok60 && distinct, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `W=5 → ${ratios[0].q}/${ratios[0].h} = ${ratios[0].r.toFixed(1)} (want 2.5–10); W=20 → ${ratios[1].q}/${ratios[1].h} = ${ratios[1].r.toFixed(1)} (want 10–40); W=60 at K=30 → ${ratios[2].q}/${ratios[2].h} = ${ratios[2].r.toFixed(1)} (want 30–120); distinct runs: ${distinct} (${ratios.map((x) => x.hash).join(' / ')}). ⛔ BEFORE §34's fix the first two cells were 5/37 and byte-identical — which is what a weight that is never honoured looks like, and what no stub leg could see` });
}

const PARTS = { 1: part1, 2: part2, 3: part3, 4: part4, 5: part5, 6: part6, 7: part7 };
if (!PARTS[PART]) { console.error(`unknown --part ${PART} (1..6)`); process.exit(2); }
await PARTS[PART]();

if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-r3b-part${PART}-last.json`), { date: new Date().toISOString(), commit, dirty, rows });
const green = rows.filter((r) => r.ok).length;
console.log(`\nVERDICT: rows ${green}/${rows.length} of ${ROWS[PART] ?? '?'} expected`);
if (!a['no-summary']) appendSection({ title: `R3b-1 the ROW CYCLE — part ${PART}`, commit, dirty, rows, reading: READING, slug: `gates-r3b-part${PART}` });
if (a.assert && (green !== rows.length || rows.length !== ROWS[PART])) process.exit(1);
