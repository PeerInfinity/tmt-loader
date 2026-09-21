// Gate R3c (plan §44–§45): Something Tree onto the DERIVED defaults, the release rule's high-water alternative, and the
// rung from `all/M25.json`.
//   node tools/harness/gates-r3c.mjs --part 0   Something Tree with NO automation table: the derived defaults, S01–S05,
//                                               twice; the deleted table NAMED as a configuration; one override per
//                                               cell to say WHICH derived default loses a mark
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
const KNOWN = new Set(['_', 'part', 'pool', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part ?? '0');
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 340)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH (`--assert`), counted from what the part EMITS.
// Part 0: eight cells + a verdict.
const ROWS = { 0: 9 };

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

const PARTS = { 0: part0 };
if (!PARTS[PART]) { console.error(`no part ${PART}`); process.exit(2); }
await PARTS[PART]();

const red = rows.filter((r) => !r.ok).length;
const short = `R3c part ${PART}: rows ${rows.length}/${ROWS[PART]} expected, ${red} RED`;
console.log(`\nVERDICT: ${short}`);
const READING = 'A cell\'s label is the whole --auto-opt string it ran (§14d.2 item 14); "—" for a mark means NOT REACHED inside the leg, which is a result. Part 0: Something Tree has NO automation table since R3c (⚖ user 2026-09-21), so the empty cell IS the derived defaults.';
if (!a['no-write']) {
  writeJSON(path.join(REPO, `tools/harness/results/gates-r3c-part${PART}.json`), { gate: `R3c part ${PART}`, commit, dirty, reading: READING, rows });
  if (!a['no-summary']) appendSection({ title: `Gate R3c part ${PART}`, commit, dirty, rows, reading: READING });
}
// ⛔ A BATTERY THAT DIES PART-WAY PRINTS FEWER ROWS, AND FEWER ROWS IS FEWER REDS.
if (a.assert && (red > 0 || rows.length < ROWS[PART])) { console.error(`REFUSED: ${short}`); process.exit(1); }
