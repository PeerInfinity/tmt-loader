// Gate R3c (plan §44–§45): Something Tree onto the DERIVED defaults, the release rule's high-water alternative, and the
// rung from `all/M25.json`.
//   node tools/harness/gates-r3c.mjs --part 0   Something Tree with NO automation table: the derived defaults, S01–S05,
//                                               twice; the deleted table NAMED as a configuration; one override per
//                                               cell to say WHICH derived default loses a mark
//   node tools/harness/gates-r3c.mjs --part 1   the dead-member rule's `mark`: the shipped LAST ANCHOR against a true
//                                               HIGH-WATER (and the high-water cleared on the member's own reset),
//                                               the WHOLE stretch `all/M15.json` → 21,000 ticks, ONE horizon, twice;
//                                               `--cell i --horizon 37048` runs ONE cell (a CI shard: the three cells
//                                               do not fit a 10-minute local wall side by side — measured, §45)
//   node tools/harness/gates-r3c.mjs --part 1m --from <dir>   the MERGE: every cell present, and the verdict
//   node tools/harness/gates-r3c.mjs --part 2 [--cell i --horizon G]   THE RUNG from `all/M25.json`: the q/h turn WEIGHT
//                                               (the tier-1 literal R3b-2 tuned for H12) against M26's wall, 30,000
//                                               ticks, twice per cell; `--part 2m --from <dir>` merges the shards
//
// ⛔ WHAT PART 0 IS FOR. ⚖ User, 2026-09-21: "We can discard the Something Tree data" — asked, and the reading chosen was
// DELETE ITS AUTOMATION TABLE. Something Tree then runs on the derived defaults like the other 169 games and stays the
// arc's generality control, now a control for the DERIVATION. So the rows here are a measurement of the derivation on
// the 2.7 reference game: a mark that the derived defaults lose is a FINDING, and the one-override cells are what name
// the default that loses it. The named-table cell is the proof that a pin which NAMES the old configuration
// (`lib.mjs` SOMETHING_OLD_TABLE, used by `gates-s1`) reproduces the old numbers to the hash.
import path from 'node:path';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, SOMETHING_OLD_TABLE } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

// ⛔ EVERY FLAG THIS FILE READS IS DECLARED, and `--assert` is a BOOLEAN (an undeclared flag takes the NEXT token as
// its value — plan §32.3). Non-boolean knobs: --part, --pool.
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-summary', 'no-write', 'assert', 'ticks', 'repeat', 'cell', 'horizon', 'from']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part ?? '0');
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 340)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH (`--assert`), counted from what the part EMITS.
// Part 0: eight cells + a verdict. Part 1: three cells + a verdict (one cell and no verdict under `--cell`).
// Part 1m: the three cells re-read + the pinned control + the verdict. Part 2: four cells + a verdict; 2m: four + verdict.
const ROWS = { 0: 9, 1: 4, '1m': 5, 2: 5, '2m': 5 };
const CELL = a.cell === undefined ? null : Number(a.cell);
const HORIZON = a.horizon === undefined ? null : Number(a.horizon);
if (CELL !== null && HORIZON === null) { console.error('REFUSED: --cell needs --horizon <game-seconds> — a shard that took its horizon from itself would agree with itself (R3b-2)'); process.exit(2); }

// ---- Part 0: Something Tree on the DERIVED defaults ----------------------------------------------------------------
const ST = { diff: 1, ticks: 3000, profile: 'all', 'wall-ms': 900000, ladder: path.join(REPO, 'tools/harness/ladder/something.json'), to: 'S05', stall: 1000000 };
const SMARKS = ['S01', 'S02', 'S03', 'S04', 'S05'];
// The pins the deleted table produced (ladder/something.json, gates-v5 part 5 until R3c) — the named cell must equal them.
const OLD = { gs: 579, hashGame: '524822d719ceea18', marks: { S01: 6, S02: 308, S03: 309, S04: 399, S05: 579 } };
// What the derived defaults do, measured twice equal at R3c — the new value of every re-recorded control. A move of the
// derivation MOVES this row, which is what a control for the derivation is for.
const DERIVED = { gs: 3000, hashGame: '03c4ee9de249916b', marks: { S01: 6, S02: null, S03: null, S04: null, S05: null } };
const RESET_FIRST = 'kindOrder=toggles,reset,upgrades,buyables,challenges,clickables';
async function part0() {
  const cells = [
    { label: '', opt: '', note: 'the DERIVED defaults — no table (the control this game now is)' },
    { label: 'the deleted table, NAMED', opt: SOMETHING_OLD_TABLE, note: 'must reproduce the old pins to the hash' },
    { label: 'policy:reset:unlock=always', opt: 'policy:reset:unlock=always', note: 'one override: the old unlock entry' },
    { label: 'policy:reset:fundamental=interval>=5', opt: 'policy:reset:fundamental=interval>=5', note: 'one override' },
    { label: 'policy:reset:primitive=interval>=90', opt: 'policy:reset:primitive=interval>=90', note: 'one override' },
    { label: 'policy:buyables:fundamental=buyMax', opt: 'policy:buyables:fundamental=buyMax', note: 'one override' },
    { label: RESET_FIRST, opt: RESET_FIRST, note: 'one override: the old kind order' },
    { label: 'policy:reset:unlock=always;policy:reset:fundamental=interval>=5', opt: 'policy:reset:unlock=always;policy:reset:fundamental=interval>=5', note: 'two overrides' },
  ];
  const lines = await runCells({ id: 'something', cells, flags: Object.entries(ST), pool: POOL, repeat: 2, stop: 'S05',
    onRun: (c, l) => console.log(`[PROGRESS] ${c.label || '(derived)'} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error}`) });
  const marksText = (l) => SMARKS.map((m) => `${m} ${l.marks?.[m] ?? '—'}`).join(' · ');
  const sameMarks = (l, want) => SMARKS.every((m) => (l.marks?.[m] ?? null) === want[m]);
  const verdicts = [];
  lines.forEach((l, i) => {
    const c = cells[i];
    let ok = !!l.ok && l.twiceEqual === true, claim = 'twice equal';
    if (i === 0) { ok = ok && l.gameSeconds === DERIVED.gs && l.hashGame === DERIVED.hashGame && sameMarks(l, DERIVED.marks); claim = `= the recorded derived value ${DERIVED.gs} / ${DERIVED.hashGame}, S01 only`; }
    if (i === 1) { ok = ok && l.gameSeconds === OLD.gs && l.hashGame === OLD.hashGame && sameMarks(l, OLD.marks); claim = `= the old table's pins ${OLD.gs} / ${OLD.hashGame}`; }
    if (i === 2) { ok = ok && SMARKS.every((m) => l.marks?.[m] != null); claim = 'reaches EVERY mark — the one override that restores the ladder'; }
    if (i >= 3 && i <= 6) { ok = ok && l.marks?.S02 == null; claim = 'does NOT reach S02 — this default is not the one that loses it'; }
    verdicts.push(ok);
    row({ gate: `R3c-0 Something Tree S01–S05 — ${c.label || 'the DERIVED defaults (no table)'}`, id: 'something', leg: 'fresh, diff 1, profile all, 3000 ticks, 2 runs',
      ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `${marksText(l)}; twice equal ${l.twiceEqual} (run 2 ${l.runs?.[1]?.gameSeconds}s/${l.runs?.[1]?.hashGame}); asserted: ${claim}; ${c.note}; actions ${JSON.stringify(l.actions || {})}` });
  });
  const n = verdicts.filter(Boolean).length;
  row({ gate: 'R3c-0 VERDICT: which derived default loses Something Tree\'s ladder', id: 'something', ok: n === cells.length, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: `${n}/${cells.length}. The derived \`reset:unlock\` = \`gain>=2x\` (a NORMAL row-0 layer, exponent 0.1, whose points only buy the unlock upgrades) fires a handful of times and never again, so unlock:upg:12 (1e5) never comes and S02–S05 are lost; \`reset:unlock=always\` alone restores them. A finding about the DERIVATION — not changed here (it reaches 170 games)` });
}

// ---- Part 1: the release rule's own alternative (plan §40.1 item 6, §40.9 item 1) --------------------------------
// ⛔ WHAT IS BEING DECIDED. R3b-2's rule lowers `mark` on a DROP, so the mark is the LAST ANCHOR: a dead member (`o`,
// `ss`) re-climbs its whole ~300 game-seconds on every turn before the plateau releases it. The alternative keeps a
// true HIGH-WATER and lets a drop restart only the CLOCK — one window `H` per turn. ⚠ THE SUBTLETY, CONSTRUCTED
// RATHER THAN ASSUMED: `h` is a LIVE member whose base (Time Energy) is wiped by `t`'s own resets, so under a
// high-water its re-climb is "below its old peak" — what keeps it its turn is that each WIPE restarts the clock.
// `high-act` is the second construction: the mark cleared when the member itself resets. Adopt only if a cell wins
// without moving M16–M24.
const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const L15 = { diff: 1, profile: 'all', ticks: Number(a.ticks || 21000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M31',  // a mark past the horizon: the leg must RECORD M27 and run on
  'from-snapshot': path.join(REPO, 'tools/harness/snapshots/ptr/all/M15.json'), 'marks-continue': true, stall: 1000000,
  eval: `({hs: String(player.h.points), qTotal: String(player.q.total), ql: String(player.q.buyables[11]), sb: String(player.sb.points), qUpg: player.q.upgrades.slice(), hChall: Object.assign({}, player.h.challenges), ch: tmtLoader.hookStats().challenges, cyc: tmtLoader.cycleState()})` };
const PMARKS = ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26', 'M27'];
// ⛔ BOTH ENDS HAVE A KNOWN ANSWER at this horizon. `turnMark=last` is R3b-2's shipped W = 10 cell (plan §40.4, CI run
// 35553187707; the planner's own leg §41) — 37048 / `6e0e67d4b2836e8e` — so this slice's code is inert for that
// reading to the hash. The DEFAULT is `high-act` since this part decided it (CI run 35566730632, cell 2, twice equal):
// 37048 / `3602cc81c88ebd17`, M25 35613.
const CONTROL_PIN = { gs: 37048, hashGame: '6e0e67d4b2836e8e', M25: 35778 };
const ADOPTED_PIN = { gs: 37048, hashGame: '3602cc81c88ebd17', M25: 35613 };
// the shipped rung (plan §40.5, independently reproduced by the planner §41) — the marks no cell may move
const PIN15 = { M16: 17058, M17: 23492, M18: 25598, M19: 25937, M20: 26612, M21: 28058, M22: 30618, M23: 30683, M24: 30736 };
const num = (s) => { const x = Number(s); return Number.isFinite(x) ? (Math.abs(x) >= 1e6 ? x.toExponential(2) : String(Math.round(x))) : String(s).slice(0, 10); };
// ⚠ THE CELLS NAME THEIR READING: cell 0 was the shipped default (`''`) when this part measured it, and the default
// moved because of it — so the control now says `turnMark=last` out loud and the DEFAULT cell is the adopted one.
const P1_CELLS = [
  { label: 'turnMark=last', opt: 'turnMark=last', note: 'R3b-2\'s reading: `mark` is the LAST ANCHOR (control)' },
  { label: 'turnMark=high', opt: 'turnMark=high', note: 'a true HIGH-WATER; a drop restarts only the clock' },
  { label: '', opt: '', note: 'the DEFAULT since R3c: `high-act`, the high-water cleared when the member itself resets' },
];
let p1Lines = null;   // the lines this process measured, for the shard file
async function part1() {
  const all = P1_CELLS;
  if (CELL !== null && !all[CELL]) { console.error(`REFUSED: no cell ${CELL} (0–${all.length - 1})`); process.exit(2); }
  const cells = CELL === null ? all : [all[CELL]];
  const repeat = Number(a.repeat || 2);
  const lines = await runCells({ id: 'ptr', cells, flags: Object.entries(L15), pool: POOL, repeat, stop: null,
    onRun: (c, l) => console.log(`[PROGRESS] ${c.label || '(default)'} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
  // ⛔ ONE HORIZON FOR EVERY CELL (V5's discarded table): the horizon is what the FIRST cell reached — or, for a
  // shard, the one it was GIVEN — and a cell that stopped short (the wall, a crash) is RED rather than a shorter row.
  const horizon = HORIZON ?? lines[0].gameSeconds;
  p1Lines = lines.map((l, i) => ({ cell: CELL === null ? i : CELL, label: cells[i].label, ok: l.ok, twiceEqual: l.twiceEqual, gameSeconds: l.gameSeconds, hashGame: l.hashGame, ticks: l.ticks, marks: l.marks, actions: l.actions, eval: l.eval || l.runs?.[0]?.eval || null, runs: (l.runs || []).map((r) => ({ gameSeconds: r.gameSeconds, hashGame: r.hashGame })) }));
  const ctl = lines[0];
  const text = (l) => { const e = l.eval || l.runs?.[0]?.eval || {}; const ch = e.ch && e.ch['challenges:h'];
    return `${PMARKS.map((m) => `${m} ${l.marks?.[m] ?? '—'}`).join(' · ')}; HS ${num(e.hs)}, quirks ${num(e.qTotal)}, QL ${num(e.ql)}, SB ${num(e.sb)}, q upg [${e.qUpg}], h challenges ${JSON.stringify(e.hChall)}, enter/exit/gaveUp ${ch ? `${ch.enter}/${ch.exit}/${ch.gaveUp}` : '—'}; turns ${e.cyc && e.cyc['3'] ? e.cyc['3'].round : '—'}; resets q ${l.actions?.['reset:q'] ?? 0} / h ${l.actions?.['reset:h'] ?? 0} / o ${l.actions?.['reset:o'] ?? 0} / ss ${l.actions?.['reset:ss'] ?? 0}`; };
  const verdict = [];
  lines.forEach((l, i) => {
    const c = cells[i];
    const unmoved = Object.entries(PIN15).every(([m, v]) => l.marks?.[m] === v);
    const ok = !!l.ok && (repeat < 2 || l.twiceEqual === true) && l.gameSeconds === horizon && unmoved;
    verdict.push({ label: c.label || 'default', ok, unmoved, m25: l.marks?.M25 ?? null, m27: l.marks?.M27 ?? null });
    row({ gate: `R3c-1 the dead-member rule's mark — ${c.label || 'the DEFAULT (high-act since R3c)'}`, id: 'ptr', leg: `all/M15 → ${L15.ticks} ticks, diff 1, profile all, ${repeat} run(s)`,
      ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame,
      notes: `${text(l)}; twice equal ${l.twiceEqual}${l.runs?.[1] ? ` (run 2 ${l.runs[1].gameSeconds}s/${l.runs[1].hashGame})` : ''}; horizon ${horizon}${l.gameSeconds === horizon ? '' : ' — STOPPED SHORT'}; M16–M24 ${unmoved ? 'unmoved' : 'MOVED'}; ${c.note}` });
  });
  if (CELL !== null) return;   // a shard reports its cell; the verdict is the merge's
  const allOk = verdict.every((v) => v.ok);
  row({ gate: 'R3c-1 VERDICT (report): does a HIGH-WATER mark win without moving M16–M24?', id: 'ptr', ok: allOk, ticks: null, gameSeconds: horizon, diff: 1, hash: null,
    notes: verdict.map((v) => `${v.label}: M25 ${v.m25 ?? '—'}, M27 ${v.m27 ?? '—'}${v.unmoved ? '' : ', M16–M24 MOVED'}`).join(' · ') + ' — the decision is read off the rows above (HS, quirks, marks), and the default moves only where one cell wins on them' });
}

// ---- Part 1m: the MERGE of the three Part 1 shards (CI) -------------------------------------------------------------
// ⛔ LESS LOOKS GREENER (the M1 matrix, R3b-2's merge): a shard that died wrote no file, and no file is no reds. So the
// merge REFUSES a missing cell by name, re-reads every cell's own verdict, and holds the control to its known answer.
async function part1m() {
  const dir = a.from ? path.resolve(String(a.from)) : null;
  const fsm = await import('node:fs');
  if (!dir || !fsm.existsSync(dir)) { console.error('REFUSED: --from <dir> holding the shard files'); process.exit(2); }
  const got = new Map();
  for (const f of fsm.readdirSync(dir).filter((x) => /^gates-r3c-part1-cell\d+\.json$/.test(x))) {
    const d = JSON.parse(fsm.readFileSync(path.join(dir, f), 'utf8'));
    for (const l of d.lines || []) got.set(l.cell, { ...l, horizon: d.horizon, commit: d.commit, rowOk: (d.rows || []).every((r) => r.ok) });
  }
  const missing = P1_CELLS.map((_, i) => i).filter((i) => !got.has(i));
  if (missing.length) { console.error(`REFUSED: cell(s) ${missing.join(', ')} produced no file — LESS LOOKS GREENER`); process.exit(1); }
  const e = (l) => l.eval || {};
  const summary = (l) => `M25 ${l.marks?.M25 ?? '—'} · M26 ${l.marks?.M26 ?? '—'} · M27 ${l.marks?.M27 ?? '—'}; HS ${num(e(l).hs)}, quirks ${num(e(l).qTotal)}, QL ${num(e(l).ql)}, SB ${num(e(l).sb)}, q upg [${e(l).qUpg}]; resets q ${l.actions?.['reset:q'] ?? 0} / h ${l.actions?.['reset:h'] ?? 0}; turns ${e(l).cyc && e(l).cyc['3'] ? e(l).cyc['3'].round : '—'}; ${l.gameSeconds} / ${l.hashGame}; twice equal ${l.twiceEqual}`;
  for (let i = 0; i < P1_CELLS.length; i++) {
    const l = got.get(i);
    row({ gate: `R3c-1m cell ${i} — ${P1_CELLS[i].label || 'the DEFAULT (high-act since R3c)'}`, id: 'ptr', leg: `all/M15 → horizon ${l.horizon}`, ok: !!l.ok && l.rowOk && l.twiceEqual === true && l.gameSeconds === l.horizon,
      ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame, notes: `${summary(l)}; measured at \`${l.commit}\` (the cell file's own commit)` });
  }
  const c = got.get(0);
  const d = got.get(2);
  row({ gate: 'R3c-1m both ends PINNED: `turnMark=last` is R3b-2\'s shipped cell to the hash, and the default is the adopted `high-act`', id: 'ptr', leg: `all/M15 → ${c.gameSeconds}`,
    ok: c.gameSeconds === CONTROL_PIN.gs && c.hashGame === CONTROL_PIN.hashGame && c.marks?.M25 === CONTROL_PIN.M25 && d.gameSeconds === ADOPTED_PIN.gs && d.hashGame === ADOPTED_PIN.hashGame && d.marks?.M25 === ADOPTED_PIN.M25,
    ticks: c.ticks, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
    notes: `last: ${c.gameSeconds} / ${c.hashGame}, M25 ${c.marks?.M25} (pin ${CONTROL_PIN.gs} / ${CONTROL_PIN.hashGame}, M25 ${CONTROL_PIN.M25}); default: ${d.gameSeconds} / ${d.hashGame}, M25 ${d.marks?.M25} (pin ${ADOPTED_PIN.gs} / ${ADOPTED_PIN.hashGame}, M25 ${ADOPTED_PIN.M25})` });
  const cells = [0, 1, 2].map((i) => got.get(i));
  const hs = (l) => Number(e(l).hs), qt = (l) => Number(e(l).qTotal);
  const better = cells.slice(1).filter((l) => (l.marks?.M25 ?? Infinity) <= (c.marks?.M25 ?? Infinity) && hs(l) >= hs(c) && qt(l) >= qt(c)).map((l) => ({ ...l, label: l.label || 'the default (high-act)' }));
  row({ gate: 'R3c-1m VERDICT (report): does a HIGH-WATER mark win without moving M16–M24?', id: 'ptr', ok: rows.every((r) => r.ok), ticks: null, gameSeconds: c.gameSeconds, diff: 1, hash: null,
    notes: `${cells.map((l, i) => `${P1_CELLS[i].label || 'default (high-act)'}: M25 ${l.marks?.M25 ?? '—'}, HS ${num(e(l).hs)}, quirks ${num(e(l).qTotal)}`).join(' · ')} — a cell WINS only if M25 is no later AND Hindrance Spirit AND quirks are no lower than the control's: ${better.length ? better.map((l) => l.label).join(', ') : 'NONE'}` });
}

// ---- Part 2: THE RUNG from `all/M25.json` — M26's wall, and the one tier-1 lever that moves it ----------------------
// ⛔ WHAT THE TRACE SAID FIRST (plan §45): q22's price is `2e11·(q.time+1)^4.2` quirk energy and energy accrues as
// `(t·M)^(QL−1)`, so at 4 Quirk Layers energy ÷ price ∝ M³·t^−0.2 — WAITING NEVER PAYS and the reset CADENCE is not
// the wall (the best ratio of a q-run sits at t ≈ 20, measured and derived). The wall is M = q11 × q21: total QUIRKS
// and Super Boosters. What schedules quirk production is the row cycle's WEIGHT — the share of row 3's turns `q` gets —
// a tier-1 literal R3b-2 tuned for H12, which is done. So the sweep is that axis, from the fixture the rung starts at.
// ⚠ A RESUMED leg (offline time credited): its game-seconds compare with other legs from `all/M25.json` only.
const L25 = { diff: 1, profile: 'all', ticks: Number(a.ticks || 30000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M31',
  'from-snapshot': path.join(REPO, 'tools/harness/snapshots/ptr/all/M25.json'), 'marks-continue': true, stall: 1000000,
  // the price PAID for q22 — `tmp` at the check is the one the tick's purchase compared against
  until: `(!globalThis.__q22 && player.q.upgrades.indexOf(22) >= 0 && (globalThis.__q22 = {g: tmtLoader.gameSeconds, price: String(tmp.q.upgrades[22].cost), qtime: String(player.q.time), qTotal: String(player.q.total), sb: String(player.sb.points), ql: String(player.q.buyables[11])}), false)`,
  eval: `({hs: String(player.h.points), qTotal: String(player.q.total), ql: String(player.q.buyables[11]), sb: String(player.sb.points), qUpg: player.q.upgrades.slice(), hChall: Object.assign({}, player.h.challenges), ch: tmtLoader.hookStats().challenges, q22: globalThis.__q22 || null, oBase: String(tmp.o.baseAmount), ssBase: String(tmp.ss.baseAmount), cyc: tmtLoader.cycleState()})` };
const RMARKS = ['M26', 'M27', 'M28', 'M29', 'M30', 'M31'];
const W = (w) => `policy:reset:q=gain>=2|turn@${w}/30x/5/0/100`;
const P2_CELLS = [
  { label: '', opt: '', note: 'the table as it ships: `reset:q` weight 10' },
  { label: W(20), opt: W(20), note: 'q weight 20' },
  { label: W(40), opt: W(40), note: 'q weight 40' },
  { label: W(80), opt: W(80), note: 'q weight 80' },
];
let p2Lines = null;
async function part2() {
  if (CELL !== null && !P2_CELLS[CELL]) { console.error(`REFUSED: no cell ${CELL} (0–${P2_CELLS.length - 1})`); process.exit(2); }
  const cells = CELL === null ? P2_CELLS : [P2_CELLS[CELL]];
  const repeat = Number(a.repeat || 2);
  const lines = await runCells({ id: 'ptr', cells, flags: Object.entries(L25), pool: POOL, repeat, stop: null,
    onRun: (c, l) => console.log(`[PROGRESS] ${c.label || '(shipped)'} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
  const horizon = HORIZON ?? lines[0].gameSeconds;
  p2Lines = lines.map((l, i) => ({ cell: CELL === null ? i : CELL, label: cells[i].label, ok: l.ok, twiceEqual: l.twiceEqual, gameSeconds: l.gameSeconds, hashGame: l.hashGame, ticks: l.ticks, marks: l.marks, actions: l.actions, eval: l.eval || l.runs?.[0]?.eval || null }));
  p2Lines.forEach((l, i) => {
    const ok = !!l.ok && (repeat < 2 || l.twiceEqual === true) && l.gameSeconds === horizon;
    row({ gate: `R3c-2 the rung from all/M25 — ${cells[i].label || 'the table as it ships (W = 10)'}`, id: 'ptr', leg: `all/M25 → ${L25.ticks} ticks, diff 1, profile all, ${repeat} run(s)`,
      ok, ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame, notes: `${rungText(l)}; horizon ${horizon}${l.gameSeconds === horizon ? '' : ' — STOPPED SHORT'}; ${cells[i].note}` });
  });
  if (CELL !== null) return;
  row({ gate: 'R3c-2 VERDICT (report)', id: 'ptr', ok: rows.every((r) => r.ok), notes: rungVerdict(p2Lines) });
}
function rungText(l) {
  const e = l.eval || {}, ch = e.ch && e.ch['challenges:h'], q = e.q22;
  return `${RMARKS.map((m) => `${m} ${l.marks?.[m] ?? '—'}`).join(' · ')}; q22 ${q ? `bought at ${q.g} for ${num(q.price)} quirk energy (q.time ${num(q.qtime)}, ${num(q.qTotal)} total quirks, SB ${q.sb}, QL ${q.ql})` : 'NOT bought'}; HS ${num(e.hs)}, quirks ${num(e.qTotal)}, QL ${num(e.ql)}, SB ${num(e.sb)}, q upg [${e.qUpg}], h ${JSON.stringify(e.hChall)}, enter/exit/gaveUp ${ch ? `${ch.enter}/${ch.exit}/${ch.gaveUp}` : '—'}; o base ${num(e.oBase)} of 14, ss base ${num(e.ssBase)}; resets q ${l.actions?.['reset:q'] ?? 0} / h ${l.actions?.['reset:h'] ?? 0} / o ${l.actions?.['reset:o'] ?? 0} / ss ${l.actions?.['reset:ss'] ?? 0}; ${l.gameSeconds} / ${l.hashGame}; twice equal ${l.twiceEqual}`;
}
function rungVerdict(ls) {
  const first = (m) => ls.filter((l) => l.marks?.[m] != null).sort((x, y) => x.marks[m] - y.marks[m])[0];
  return RMARKS.map((m) => { const f = first(m); return `${m}: ${f ? `${f.label || 'shipped'} at ${f.marks[m]}` : 'NO cell'}`; }).join(' · ') + ' — a cell that moves the table must reach every mark the shipped cell reaches, no later';
}
async function part2m() {
  const dir = a.from ? path.resolve(String(a.from)) : null;
  const fsm = await import('node:fs');
  if (!dir || !fsm.existsSync(dir)) { console.error('REFUSED: --from <dir> holding the shard files'); process.exit(2); }
  const got = new Map();
  for (const f of fsm.readdirSync(dir).filter((x) => /^gates-r3c-part2-cell\d+\.json$/.test(x))) {
    const d = JSON.parse(fsm.readFileSync(path.join(dir, f), 'utf8'));
    for (const l of d.lines || []) got.set(l.cell, { ...l, horizon: d.horizon, commit: d.commit, rowOk: (d.rows || []).every((r) => r.ok) });
  }
  const missing = P2_CELLS.map((_, i) => i).filter((i) => !got.has(i));
  if (missing.length) { console.error(`REFUSED: cell(s) ${missing.join(', ')} produced no file — LESS LOOKS GREENER`); process.exit(1); }
  const ls = P2_CELLS.map((_, i) => got.get(i));
  ls.forEach((l, i) => row({ gate: `R3c-2m cell ${i} — ${P2_CELLS[i].label || 'the table as it ships (W = 10)'}`, id: 'ptr', leg: `all/M25 → horizon ${l.horizon}`, ok: !!l.ok && l.rowOk && l.twiceEqual === true && l.gameSeconds === l.horizon,
    ticks: l.ticks, gameSeconds: l.gameSeconds, diff: 1, hash: l.hashGame, notes: `${rungText(l)}; measured at \`${l.commit}\`` }));
  row({ gate: 'R3c-2m VERDICT (report): which weight reaches the rung\'s marks first', id: 'ptr', ok: rows.every((r) => r.ok), notes: rungVerdict(ls) });
}

const PARTS = { 0: part0, 1: part1, '1m': part1m, 2: part2, '2m': part2m };
if (!PARTS[PART]) { console.error(`no part ${PART}`); process.exit(2); }
await PARTS[PART]();

const red = rows.filter((r) => !r.ok).length;
const expected = (PART === '1' || PART === '2') && CELL !== null ? 1 : ROWS[PART];
const short = `R3c part ${PART}${CELL !== null ? ` cell ${CELL}` : ''}: rows ${rows.length}/${expected} expected, ${red} RED`;
console.log(`\nVERDICT: ${short}`);
const READING = 'A cell\'s label is the whole --auto-opt string it ran (§14d.2 item 14); "—" for a mark means NOT REACHED inside the leg, which is a result. Part 0: Something Tree has NO automation table since R3c (⚖ user 2026-09-21), so the empty cell IS the derived defaults.';
if (!a['no-write']) {
  writeJSON(path.join(REPO, `tools/harness/results/gates-r3c-part${PART}${CELL !== null ? `-cell${CELL}` : ''}.json`), { gate: `R3c part ${PART}`, commit, dirty, reading: READING, horizon: HORIZON, lines: PART === '2' ? p2Lines : p1Lines, rows });
  if (!a['no-summary']) appendSection({ title: `Gate R3c part ${PART}`, commit, dirty, rows, reading: READING });
}
// ⛔ A BATTERY THAT DIES PART-WAY PRINTS FEWER ROWS, AND FEWER ROWS IS FEWER REDS.
if (a.assert && (red > 0 || rows.length < expected)) { console.error(`REFUSED: ${short}`); process.exit(1); }
