// Gate R3b-2 (plan §39): the DEAD-MEMBER RULE — a turn releases when its holder stops getting CLOSER — row 3's
// cycle in ptr's table, and H12 "Speed Demon" (M25).
//   node tools/harness/gates-r3b2.mjs --part 1   the RULE on real engines: constructed legs on ptr AND a 2.7-family
//                                                game, plus the ORACLE row with NO `exclude=`
//   node tools/harness/gates-r3b2.mjs --part 2   the TABLE: weight × `reset:h` policy × variant, whole stretch,
//                                                ONE horizon for every cell
//   node tools/harness/gates-r3b2.mjs --part 3   H12's ENTRY STATE: the curve, read from real states along the run
//   node tools/harness/gates-r3b2.mjs --part 4   INERTNESS: the opening, M15 → M24, and the declared key set
//
// ⛔ WHAT THIS BATTERY IS FOR, AND THE DEFECT IT IS AGAINST. PTR's row 3 has FOUR active reset members once `h`
// unlocks (`h, q, o, ss`) and a turn that reaches `o` or `ss` FREEZES the row. Measured from `all/M21.json` with
// the guard off, every 25 game-seconds: from 28950 on, `o` holds the turn with `tmp.o.baseAmount` FLAT at 5 of 14
// Super Boosters and `tmp.ss.baseAmount` flat at 17 of 28, for 1,100+ game-seconds and still counting, while `h`
// (4.4e33 of 1e30) and `q` both read `canReset === true` and cannot act. The only arrangement that worked carried
// `exclude=reset:o,reset:ss` — an OVERRIDE NAMING TWO LAYERS, which is the thing the loader is not allowed to know.
//
// ⛔ AND THE PREMISE THE PLAN HANDED THE RULE IS WRONG IN ITS DETAIL — which is why the first thing this slice did
// was measure it. Plan §32.4a says the discriminator is that `tmp.h.baseAmount` rises for the whole of `h`'s wait
// and `ss`'s "does not move at all". `ss`'s DOES move: while it holds the turn nothing on its row can wipe row 2,
// so it climbs 0 → 17 (and `o`'s 0 → 5) over ~300 game-seconds — and then plateaus for ever. Both dead members
// spend their first five minutes getting genuinely closer. What separates them from `h` is that `h` keeps setting
// NEW HIGHS until it crosses; they never beat a high they reached once.
//
// ⚠ ONE HORIZON FOR EVERY CELL OF PART 2, and V5's lesson behind it: a table had to be discarded because one cell
// stopped 349 game-seconds short under the wall, and a row that ran a shorter leg is not a comparison.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

// ⛔ EVERY FLAG THIS FILE READS IS DECLARED, and `--assert` is a BOOLEAN. `parseArgs` gives an undeclared flag the
// NEXT token as its value, which is how CI once reported green over a battery that printed `rows 2/10 of 9`
// (plan §32.3). The non-boolean knobs are listed in the usage block above the parts that read them.
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 340)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH (`--assert`, CI), measured against what each part actually EMITS rather than
// against what its author expected — five slices running have been caught by the difference.
// Part 1: two L21 rows + three L15 rows + a verdict. Part 2: nine cells + a verdict. Part 3: one row per `--stops`
// entry (four by default) + a verdict. Part 4: one opening row + two M15→M24 rows + a verdict.
const ROWS = { 1: 6, 2: 10, 3: 5, 4: 4 };

const READING = [
  'L15 = from snapshots/ptr/all/M15.json (16048 game-s), 21,000 ticks, diff 1, --profile all, the stall watch OFF —',
  'so every row of part 2 ends at 37048 game-seconds and the columns ARE comparable. L21 = from all/M21.json, the',
  'fixture at which row 3 first has four active members, which is where the freeze lives. L2 = a FRESH game → M12,',
  'the opening\'s regression column. A cell\'s label is the whole --auto-opt string it ran, so a row names the',
  'configuration it measured (§14d.2 item 14). "—" for a mark means NOT REACHED inside the leg, which is a result.',
  'The dead-member rule is the `/B/H` tail of a `turn@W/Kx/N/B/H` policy: B is the fraction of what is LEFT that the',
  'holder must close, H the window it has to close it in, and `/0/0` is the rule SWITCHED OFF (a window of zero is',
  'no window) — which is what every row pinned before this slice carries, so that each of them reproduces.',
].join(' ');

const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const SNAP_ALL = path.join(REPO, 'tools/harness/snapshots/ptr/all');
const POOL = Number(a.pool || 4);
const REPEAT = Number(a.repeat || 2);

// ⚠ `distance` / `mark` / `closer` ARE THE RULE'S OWN THREE QUANTITIES, and they are in every readout because a row
// that reported only the marks could not tell "the rule never fired" from "the rule fired and bought nothing".
const READOUT = `({points: String(player.points), q: String(player.q.points), qTotal: String(player.q.total), qLayers: String(player.q.buyables[11]), qMs: player.q.milestones.slice(), qUpg: player.q.upgrades.slice(), qTime: String(player.q.time), qEnergy: String(player.q.energy), h: String(player.h.points), hBest: String(player.h.best), hChall: Object.assign({}, player.h.challenges), active: player.h.activeChallenge, te: String(player.t.energy), gp: String(player.g.power), sb: String(player.sb.points), ch: tmtLoader.hookStats().challenges, cyc: tmtLoader.cycleState()})`;
const READOUT_OPEN = `({points: String(player.points), p: String(player.p.points), gp: String(player.g.power), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder], cyc: tmtLoader.cycleState(), rtKeys: Object.keys(tmtLoader.runtimeState()).sort(), auKeys: Object.keys(player.au).sort()})`;

const LEG = {
  L15: { id: 'ptr', marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26'],
    flags: { diff: 1, ticks: Number(a.ticks || 21000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M26',
      'from-snapshot': path.join(SNAP_ALL, 'M15.json'), 'marks-continue': true, stall: 1000000, eval: READOUT } },
  L15m24: { id: 'ptr', marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'],
    flags: { diff: 1, ticks: Number(a.ticks24 || 16000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M24',
      'from-snapshot': path.join(SNAP_ALL, 'M15.json'), stall: 1000000, eval: READOUT } },
  L21: { id: 'ptr', marks: ['M22', 'M23', 'M24', 'M25'],
    flags: { diff: 1, ticks: Number(a.ticks21 || 4000), 'wall-ms': 600000, ladder: PTR_LADDER, to: 'M25',
      'from-snapshot': path.join(SNAP_ALL, 'M21.json'), 'marks-continue': true, stall: 1000000, eval: READOUT } },
  L2: { id: 'ptr', marks: ['M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
    flags: { diff: 1, ticks: Number(a.openTicks || 8000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M12', stall: 1000000, eval: READOUT_OPEN } },
};
const flagsOf = (leg, extra = {}) => Object.entries({ ...LEG[leg].flags, ...extra });
const mark = (l, m) => (l.marks && l.marks[m] != null ? `${l.marks[m]}` : '—');
const marksOf = (leg, l) => LEG[leg].marks.map((m) => `${m} ${mark(l, m)}`).join(' · ');
const short = (v) => (v === undefined || v === null ? '—' : String(v).replace(/(\d)\.(\d\d\d)\d+e/, '$1.$2e').slice(0, 12));
const box = (l) => `ticks_ms ${l.ticks_ms}; wall ${Math.round((l.box?.wallMs || 0) / 1000)}s; pool ${POOL}`;
const acts = (l) => Object.entries(l.actions || {}).filter(([k]) => k.startsWith('reset:') || k.startsWith('challenges:')).map(([k, v]) => `${k} ${v}`).join(' ');
const cell = (opt, note) => ({ label: opt, opt, note });
const evalOf = (l) => l.runs?.[0]?.eval || l.eval || null;

/** The scheduler's own record, INCLUDING the dead-member rule's three quantities. */
function cycText(e) {
  const c = e && e.cyc;
  if (!c || !Object.keys(c).length) return 'no cycle';
  return Object.entries(c).map(([k, v]) => `row ${k}: ${v.round} turns, holder ${v.holderLayer}, typical ${JSON.stringify(v.typical)}, distance ${JSON.stringify(v.distance)}, mark ${JSON.stringify(v.mark)}${v.demand ? ', on demand' : ''}`).join(' | ');
}
function readoutText(leg, l) {
  const e = evalOf(l);
  if (!e) return '—';
  if (leg === 'L2') return `pts ${short(e.points)}, p ${short(e.p)}, gp ${short(e.gp)}, uo ${JSON.stringify(e.uo)}, ${cycText(e)}, runtime keys [${(e.rtKeys || []).join(',')}], player.au keys [${(e.auKeys || []).join(',')}]`;
  const c = e.ch && e.ch['challenges:h'];
  return `q ${e.q}/${e.qTotal} total, QL ${e.qLayers}, q ms [${e.qMs}], q upg [${e.qUpg}], q.time ${short(e.qTime)}, q.energy ${short(e.qEnergy)}, h ${e.h} (best ${e.hBest}), h challenges ${JSON.stringify(e.hChall)}, active ${e.active}, enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'}, TE ${short(e.te)}, SB ${short(e.sb)}, pts ${short(e.points)}, ${cycText(e)}`;
}

/** Run a set of cells on one leg and write one SUMMARY row per cell. */
async function sweep({ gate, leg, cells, repeat = REPEAT, extra = {}, judge = null }) {
  const L = LEG[leg];
  let done = 0;
  const total = cells.length * repeat;
  const lines = await runCells({ id: L.id, cells, flags: flagsOf(leg, extra), pool: POOL, repeat, stop: L.flags.to,
    onRun: (c, l) => console.log(`[PROGRESS ${++done}/${total}] ${leg} ${c.label || '(the table)'} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
  const horizon = lines.length && lines[0].ok ? lines[0].gameSeconds : null;
  lines.forEach((l, i) => {
    const c = cells[i];
    let ok = !!l.ok && (repeat < 2 || l.twiceEqual === true);
    let why = '';
    // ⛔ A CELL THAT STOPPED SHORT OF THE HORIZON IS RED, AND THIS IS V5's LESSON MADE MECHANICAL: it had to
    // DISCARD a whole table because one cell stopped 349 game-seconds short under the wall, and a row that ran a
    // shorter leg is not a comparison. The horizon is whatever the FIRST cell of the sweep reached, so a sweep
    // does not need its horizon written down anywhere — and a run that walled or stalled is caught by the same
    // test, because both of them end early. ⚠ A cell that reached its `--to` mark legitimately ends early too,
    // so the test only bites where the leg is meant to run to the tick budget (`marks-continue`).
    if (ok && L.flags['marks-continue'] && horizon !== null && l.gameSeconds !== horizon) {
      ok = false;
      why = `STOPPED SHORT: ${l.gameSeconds} game-seconds against this sweep's horizon of ${horizon}${l.stall?.walled ? ' (WALLED)' : l.stall?.stalled ? ' (STALLED)' : ''} — a row that ran a shorter leg is not a comparison; `;
    }
    if (ok && judge) { const v = judge(l, c); ok = v.ok; why = v.why ? v.why + '; ' : ''; }
    row({ gate: `${gate} ${c.label || 'the table as it stands (control)'}`, id: L.id,
      leg: `${leg}, diff 1, profile all, ${L.flags.ticks} ticks, ${repeat} run(s)`,
      ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `${marksOf(leg, l)}; ${repeat > 1 ? `twice equal: ${l.twiceEqual} (run 2 ${l.runs[1]?.gameSeconds}s/${l.runs[1]?.hashGame})` : 'ONE run'}; ${why}${c.note ? c.note + '; ' : ''}${acts(l)}; end ${readoutText(leg, l)}; ${box(l)}${l.error ? '; ERROR ' + l.error : ''}` });
  });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/r3b2-${gate.replace(/[^\w]+/g, '-')}.json`), { gate, leg, cells, lines });
  return lines;
}

// ---- the configurations ---------------------------------------------------------------------------------------
// ⚖ 13d.2: the WEIGHT is the one literal and it is a sweep AXIS, which is where a literal comes from. `K`/`N` are
// the guard's two buffers at their measured defaults (§34.4); `B`/`H` are the dead-member rule's, and they are the
// axis part 2 varies.
const GUARD = `${String(a.k || '30')}x/${String(a.n || '5')}`;
const BH = `${String(a.b || '0')}/${String(a.h || '100')}`;
// ⚠ `OFF` is the guard switched off — a `K` no wait can reach — which is how a row isolates the dead-member rule
// from `K`. It is the same device §34.4 used to isolate `K` from the weight.
const OFF = `100000x/${String(a.n || '5')}`;
const turn = (w, { kind = 'turn', hPol = 'always', bh = BH, guard = GUARD } = {}) =>
  `policy:reset:q=gain>=2|${kind}@${w}/${guard}/${bh};policy:reset:h=${hPol}|${kind}@1/${guard}/${bh}`;
// ⛔ THE TWO DEAD MEMBERS, NAMED — IN A GATE, WHICH IS WHERE A LAYER NAME BELONGS. `o` and `ss` carry no policy in
// any table: they are BOUND members running at the modifier row's declared defaults, which is exactly how the rule
// reaches them without any table naming them. But it also means a carrier's `/0/0` CANNOT switch the rule off for
// them — measured, and it is what made the first cut of the freeze control read identically to the row it was the
// control for (q 11 / h 8 in both). So a row that wants the rule OFF EVERYWHERE has to say so on all four members,
// and these two keep their DERIVED primaries (`gain>=2x` on the normal `o`, `always` on the static `ss`) and their
// default weight of 1, so the only thing that changes between the control and its subject is `/B/H`.
const dead = (bh, guard = GUARD) =>
  `;policy:reset:o=gain>=2x|turn@1/${guard}/${bh};policy:reset:ss=always|turn@1/${guard}/${bh}`;
// ⛔ THE HACK THIS SLICE EXISTS TO REMOVE. Every row that still carries it says so in its note, and part 1's
// verdict is exactly "the row with no `exclude=` reproduces the row with it".
const EXCL = 'exclude=reset:o,reset:ss;';

// ---- Part 1: the RULE on real engines, and the ORACLE with no `exclude=` -----------------------------------------
// ⛔ THE ACCEPTANCE TEST THE PLANNER SET (plan §33, §34.4, §39): the built cycle at
// `gain>=2|turn@20/30x/5` + `always|turn@1/30x/5` with `exclude=reset:o,reset:ss` lands on `d2da5ef3a490f92a`,
// 73 Hindrance Spirit, 673 total quirks, `reset:q` 286 / `reset:h` 15, M22 30618 · M23 30683 · M24 30736, against
// the shipped control's `53b5a8eba511ec77` and 1 HS / 559 quirks. Part 1 is done when the SAME configuration
// WITHOUT the exclude reaches the same row.
// ⚠ AND "THE SAME ROW" IS NOT "THE SAME HASH", which is a result rather than a concession. `o` and `ss` are real
// members of row 3: any rule that releases them releases them after some POSITIVE time, so a run that schedules
// them at all takes a different path from one that pretends they do not exist. The comparable quantities are the
// ladder marks, Hindrance Spirit, the quirk count and the q/h ratio — and the row reports the cost in game-seconds
// that the two dead members actually took, which is the number a reader wants and no hash would show.
async function part1() {
  // ⛔ THE GUARD IS SWITCHED OFF IN BOTH CELLS, ON PURPOSE, AND THAT IS ITSELF A MEASUREMENT. At the shipped
  // `K = 30` these two rows are INDISTINGUISHABLE on this leg — both hand out exactly 20 turns in 4,000 ticks and
  // neither reaches M22 — because `K` releases `q` and `h` often enough to keep the rotation nominally moving
  // while `o` and `ss` still eat it. A control that cannot tell the two builds apart is not a control (§34.5's
  // lesson, and the mutant round found this row failing it), so the guard is removed and the dead-member rule is
  // then the ONLY thing that can release a turn. ⇒ this also answers "does the rule retire K?" from the other
  // side: it does not, and K does not subsume it either — they release different holders.
  // ⚠ AND THE ROUND COUNT IS NOT THE QUANTITY. With the guard off a frozen row still shows the turns it handed
  // out BEFORE it froze, so the measurement is how much ROW-3 WORK actually got done: `reset:q` + `reset:h`.
  await sweep({ gate: 'R3b2-1 the dead-member rule on the FREEZE itself —', leg: 'L21', repeat: Number(a.repeat21 || 2), cells: [
    cell(turn(1, { bh: '0/0', guard: OFF }) + dead('0/0', OFF), 'CONTROL — the FREEZE, reproduced: the rule OFF (`/0/0`) and the guard off, with all four members. `o` takes the turn and holds it with its base flat at 5 of 14 Super Boosters, `ss` at 17 of 28, while `h` and `q` both read `canReset === true` and cannot act'),
    cell(turn(1, { guard: OFF }) + dead(BH, OFF), 'the RULE ON at the shipped default. Row 3 must get back to work — this is the row that says the freeze is fixed on a REAL ENGINE, not only on the stub'),
  ], judge: (l, c) => {
    const e = evalOf(l), C = e && e.cyc && e.cyc['3'];
    if (!C) return { ok: false, why: 'row 3 has no cycle at all, so this row measured nothing' };
    const on = c.opt.includes(`/${BH}`);
    const work = (l.actions?.['reset:q'] || 0) + (l.actions?.['reset:h'] || 0);
    const why = `${work} row-3 resets (q ${l.actions?.['reset:q'] || 0} / h ${l.actions?.['reset:h'] || 0}) in ${C.round} turns`;
    return on ? { ok: work >= 15, why: `${why} — the rule ON must get row 3 working again` }
              : { ok: work <= 10, why: `${why} — the CONTROL must show the freeze; if this is high the freeze is not reproduced and the row below proves nothing` };
  } });
  await sweep({ gate: 'R3b2-1 the ORACLE —', leg: 'L15', cells: [
    cell(EXCL + turn(20, { bh: '0/0' }).replace(/;/g, ';'), '⛔ THE HACK: the planner\'s own oracle configuration, with the two dead members EXCLUDED and the rule off. This is the row the one below has to match, and it is expected to reproduce `d2da5ef3a490f92a` — 73 Hindrance Spirit, 673 total quirks, `reset:q` 286 / `reset:h` 15, M22–M24 identical to the shipped control'),
    cell(turn(20), '⛔ THE ACCEPTANCE TEST: the same configuration with NO `exclude=` and no layer name anywhere. `o` and `ss` are real members and the dead-member rule is what stops them freezing the row'),
    cell(turn(20, { bh: '0/0' }), 'the same, rule OFF — the row that says the rule is what made the difference, rather than the exclude having been unnecessary all along'),
  ] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b2-1 VERDICT: does the row with NO `exclude=` reach the oracle\'s row?', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} rows green; read Hindrance Spirit, total quirks and the q/h ratio ACROSS the three L15 rows — they end at the same game-second, so the columns are comparable. The HASHES are expected to differ between the excluded and the un-excluded rows and that is not a failure: scheduling two more members is a different run` });
}

// ---- Part 2: what `games-auto/ptr.js` should say ------------------------------------------------------------------
// ⛔ ONE HORIZON FOR EVERY CELL (V5's discarded table). Axes: the weight on `reset:q`, `reset:h`'s own policy
// inside its turn, and the plain variant against the demand-driven one. The dead-member rule is ON in every cell,
// because without it half of them freeze and a frozen cell is not a measurement of a weight.
async function part2() {
  await sweep({ gate: 'R3b2-2 ptr\'s table —', leg: 'L15', cells: [
    cell('', 'CONTROL: the table as it SHIPS at this head — no cycle anywhere, re-measured at 37048 so its quirk count is comparable with the rows below'),
    cell(turn(5), 'W = 5'),
    cell(turn(10), 'W = 10'),
    cell(turn(20), 'W = 20 — the oracle\'s own weight'),
    cell(turn(40), 'W = 40'),
    cell(turn(20, { hPol: 'gain>=2x' }), 'W = 20 with R3a\'s `gain>=2x` on `reset:h` inside its turn — the planner\'s probe DEADLOCKED a turn on it, and this row confirms or overturns that under the REAL mechanism'),
    cell(turn(20, { kind: 'turn-demand' }), 'W = 20, the DEMAND-driven variant'),
    cell(turn(20, { bh: '0.1/100' }), 'W = 20 with B = 0.1 — the dead-member rule asked to see a TENTH of what is left closed, rather than "anything at all". The control for B = 0 being the right default'),
    cell(turn(20, { bh: '0/300' }), 'W = 20 with H = 300 — a window three times the default, i.e. how much the answer depends on it'),
  ] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b2-2 VERDICT: the configuration ptr\'s table should name, with provenance', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} cells reproduced twice equal; score on M22–M26, Hindrance Spirit, total quirks, Quirk Layers, Super Boosters, the q upgrade list and the enter/exit/gaveUp triple. ⚠ M22–M24 did NOT move under the planner's oracle (the cycle only engages once \`h\` unlocks at M21) — a cell that moves them owes an explanation` });
}

// ---- Part 3: H12 "Speed Demon" (M25) and what its ENTRY STATE costs ------------------------------------------------
// ⛔ WHAT H12 IS, READ OFF THE SOURCE (plan §32.5, and it is why no threshold rule reaches it). The goal is 1e3550
// POINTS; in-challenge the Booster and Generator BASES are divided by `sqrt(player.q.time) × (3·sb³ + 1) + 1`, and
// `player.q.time` is ZEROED on entry (both `q.doReset` and `h.doReset` zero it) — so the divisor GROWS as √t and
// the attempt is a RACE. Quirk energy is zeroed too and regrows as `q.time^(QL + free − 1)`, with `(q.energy+1)²`
// multiplying point gain — so the QUIRK-LAYER COUNT AT ENTRY sets the exponent of the race, and SUPER BOOSTERS
// MAGNIFY the divisor, which is the opposite of the direction the whole rung has been pushing.
// ⇒ the quantity to vary is the ENTRY STATE, and these rows read it off real states along the run rather than
// constructing one: `--stop-snapshot` at a series of game-seconds, each carrying whatever Quirk Layers, Hindrance
// Spirit and Super Boosters the run had reached by then.
async function part3() {
  const stops = String(a.stops || '2000,6000,10000,14000').split(',').map((s) => Number(s.trim())).filter(Boolean);
  const dir = path.join(REPO, 'tools/harness/results/tmp/r3b2-entry');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of stops) {
    const lines = await runCells({ id: 'ptr', cells: [cell(turn(20), `the entry state ${t} ticks into the whole stretch under the shipped cycle`)],
      flags: Object.entries({ ...LEG.L15.flags, ticks: t, 'stop-snapshot': dir, 'stop-snapshot-name': `E${t}`, eval: READOUT }), pool: 1, repeat: 1 });
    const l = lines[0], e = evalOf(l);
    row({ gate: `R3b2-3 the ENTRY STATE at ${t} ticks —`, id: 'ptr', ok: !!l.ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      leg: `L15 truncated to ${t} ticks, diff 1, profile all, ONE run`,
      notes: `${marksOf('L15', l)}; what the challenge would INHERIT at this point: Quirk Layers ${e?.qLayers}, Super Boosters ${short(e?.sb)}, Hindrance Spirit ${short(e?.h)}, q upgrades [${e?.qUpg}], q.time ${short(e?.qTime)}, q.energy ${short(e?.qEnergy)} — ⚠ `
        + `a state taken right after a row wipe and one taken after a long quiet climb differ in everything the challenge inherits, and \`q.time\` is the tell; ${acts(l)}; ${box(l)}` });
  }
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b2-3 VERDICT: which quantity moves H12\'s peak fraction of its goal exponent', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} entry states captured (${dir}); read Quirk Layers against Super Boosters across the rows — the first sets the EXPONENT on quirk-energy regrowth and the second MAGNIFIES the divisor, so they pull opposite ways and a single "how strong am I" number cannot stand for both` });
}

// ---- Part 4: INERTNESS -------------------------------------------------------------------------------------------
// ⛔ EVERY FEATURE OFF BY DEFAULT, AND THE ROWS THAT SAY SO. `games-auto/ptr.js` names a cycle only where this slice
// put one, so a run that names none must take exactly the path it took before — to the HASH, not to the marks.
async function part4() {
  await sweep({ gate: 'R3b2-4 INERTNESS the opening —', leg: 'L2', cells: [
    cell('', 'a FRESH game to M12 with the table as it ships. The opening is pinned at 6718 / `82eee26f947b2b2e` and must not move: this slice added two PARAMETERS to two modifier rows that no game\'s table names'),
  ] });
  await sweep({ gate: 'R3b2-4 INERTNESS M15 → M24 —', leg: 'L15m24', cells: [
    cell('', 'the shipped table from `all/M15.json`, stopping AT M24. M16 17058 · M17 23492 · M18 25598 · M19 25937 · M20 26612 · M21 28058 · M22 30618 · M23 30683 · M24 30736, and `0b98a21130a0b4af` at M22'),
    cell(turn(20, { bh: '0/0' }), 'the cycle ON with the dead-member rule OFF (`/0/0`) — the row that says the rule is INERT when its window is zero, i.e. that every measurement pinned before this slice still reproduces'),
  ] });
  const c = rows.filter((r) => r.ok).length;
  row({ gate: 'R3b2-4 VERDICT: nothing moved that this slice did not move on purpose', id: 'ptr', ok: c === rows.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${c}/${rows.length} rows green; the declared key set of \`runtimeState().cycle\` is now {acted, arm, at, closer, holder, left, mark, mem, round, since, skip} — \`mark\` and \`closer\` are this slice's, and \`loader/cycle.test.mjs\` asserts the whole set` });
}

const PARTS = { 1: part1, 2: part2, 3: part3, 4: part4 };
if (!PARTS[PART]) { console.error(`no part ${PART}`); process.exit(2); }
await PARTS[PART]();

const red = rows.filter((r) => !r.ok).length;
const short2 = `R3b2 part ${PART}: rows ${rows.length}/${ROWS[PART]} expected, ${red} RED`;
console.log(`\nVERDICT: ${short2}`);
if (!a['no-write']) {
  writeJSON(path.join(REPO, `tools/harness/results/gates-r3b2-part${PART}.json`), { gate: `R3b2 part ${PART}`, commit, dirty, reading: READING, rows });
  if (!a['no-summary']) appendSection(`Gate R3b2 part ${PART} — the dead-member rule, ptr's table, and M25`, READING, rows, { commit, dirty });
}
// ⛔ A BATTERY THAT DIES PART-WAY PRINTS FEWER ROWS, AND FEWER ROWS IS FEWER REDS.
if (a.assert && (red > 0 || rows.length < ROWS[PART])) { console.error(`REFUSED: ${short2}`); process.exit(1); }
