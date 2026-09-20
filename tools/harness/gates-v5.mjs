// The V5 gates — the Advanced automation tab: controls that WRAP on a phone, a layout that does not JUMP, and more
// RETRY conditions for challenges (plan §36, brief `tmt-auto-15`).
//   node tools/harness/gates-v5.mjs --part 1|2|3|3s|5|7 [--no-summary] [--no-write] [--assert] [--pool N] [--shard i/N]
//
// Part 1   THE WRAP (page, ptr AND something). Every interactive element inside the au tab ends inside the viewport AND
//          inside its pane, at 390 px with and without `?mobile=1` and at a desktop width; the tab's root is as wide
//          as its pane (a column that shrink-wrapped to nothing would pass "nothing past the edge" vacuously — it is
//          what `contain:inline-size` did, measured); and no tap target is smaller than it was before V5.
// Part 2   NO JUMP (page, ptr AND something). Constructed transitions on a PAUSED page: a number that grows by an
//          order of magnitude and shrinks back, a reason line that swaps to a shorter sentence, a line that appears
//          and disappears. After the SHRINK nothing below moved and no number box got narrower. CONTROL rows: the same
//          transitions with the floors switched OFF must move something — the proof this leg can see the defect.
// Part 3   RETRY CONDITIONS (node). `loader/retry.test.mjs` RUN HERE and required green, plus the conditions on the
//          REAL fixture: from `all/M22.json`, each condition WAITS with its own code and then RETRIES.
// Part 3s  THE REPORT (node, long — not in CI). Each retry condition at two or three values against today's rule,
//          from `all/M22.json` and over the whole stretch from `all/M15.json`: H12 attempts / give-ups, quirks, HS,
//          marks. ⚖ Report, don't decide — R3b-2 owns the choice.
// Part 5   INERTNESS (node). Nothing chosen ⇒ the opening 6718 / `82eee26f947b2b2e`, M15 → M24 and R3a's leg from M22
//          (`dc862c221837bc17`) unmoved to the hash; `player.au` and `runtimeState()` key sets as R3b-1 left them.
// Part 7   THE ROSTER (page). The Advanced tab at 390 px on every game judged: 0 interactive elements past the
//          viewport; abstentions COUNTED and left uncaused.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, GAMES, parseArgs, startServer, headCommit, treeDirty, writeJSON, entryOnly, assignShards, parseShard } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

// ⛔ EVERY FLAG THIS BATTERY READS IS DECLARED HERE (R3b-1: an undeclared `--assert` took the next token as its value
// and CI was green over a red battery). Booleans in the list; everything else takes a value.
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert', 'no-floor']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 1400)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH, for `--assert` (CI). A battery that dies part-way prints fewer rows, and fewer
// rows is fewer reds. ⚠ ADDING A LEG MOVES THIS, deliberately.
const ROWS = { 1: 6, 2: 4, 3: 2, '3s': 22, 5: 5, 7: 1 };

const SNAP = (id, m) => path.join(REPO, `tools/harness/snapshots/${id}/all/${m}.json`);
const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const POOL = Number(a.pool || 4);

// ---- the row-3 readout (R3b-1's, plus the challenge counts per id) ------------------------------------------------
const READOUT = `({q: String(player.q.points), qTotal: String(player.q.total), qLayers: String(player.q.buyables[11]), h: String(player.h.points), hBest: String(player.h.best), hChall: Object.assign({}, player.h.challenges), active: player.h.activeChallenge, sb: String(player.sb.points), ch: tmtLoader.hookStats().challenges, fail: (tmtLoader.runtimeState().challengeFailed || {})['challenges:h'] || null})`;
const short = (v) => (v === undefined || v === null ? '—' : String(v).replace(/(\d)\.(\d\d\d)\d+e/, '$1.$2e').slice(0, 12));
const markText = (l, ms) => ms.map((m) => `${m} ${l.marks && l.marks[m] != null ? l.marks[m] : '—'}`).join(' · ');

// ---- Part 3s: THE REPORT --------------------------------------------------------------------------------------------
// ⚖ REPORT, DON'T DECIDE (brief Part 3). ONE run per cell — a report's rows are inputs to R3b-2's sweep, not verdicts,
// and every row carries its whole `--auto-opt` so it names what it measured. A row is GREEN when its run completed.
const RETRY_CELLS = [
  ['', 'the table as it stands — `sequential|give-up@0.1/30/2x` (CONTROL)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/1.5x', 'R = 1.5'],
  ['policy:challenges:h=sequential|give-up@0.1/30/4x', 'R = 4'],
  ['policy:challenges:h=sequential|give-up@0.1/30/5resets', 'N = 5 resets of the highest row (frozen)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/20resets', 'N = 20 (frozen)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/60resets', 'N = 60 (frozen)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/20resets-now', 'N = 20, the highest row NOW'],
  ['policy:challenges:h=sequential|give-up@0.1/30/300s', 'T = 300 s (a proxy)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/1200s', 'T = 1200 s (a proxy)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/when;arg:challenges:h.w=getBuyableAmount("q",11).gte(5)', 'WHEN Quirk Layers ≥ 5'],
  ['policy:challenges:h=sequential|give-up@0.1/30/when;arg:challenges:h.w=player.h.points.gte(5)', 'WHEN Hindrance Spirit ≥ 5'],
];
const REPORT_LEGS = {
  L22: { from: 'M22', ticks: Number(a.ticks22 || 12000), marks: ['M23', 'M24', 'M25', 'M26'] },
  L15: { from: 'M15', ticks: Number(a.ticks15 || 21000), marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26'] },
};
async function part3s() {
  const cells = RETRY_CELLS.map(([opt, note]) => ({ label: opt || '(the table)', opt, note }));
  const out = {};
  for (const [leg, L] of Object.entries(REPORT_LEGS)) {
    let done = 0;
    const flags = Object.entries({ profile: 'all', diff: 1, ticks: L.ticks, 'wall-ms': 600000, ladder: PTR_LADDER, to: 'M26',
      'from-snapshot': SNAP('ptr', L.from), 'marks-continue': true, stall: 1000000, eval: READOUT });
    const lines = await runCells({ id: 'ptr', cells, flags, pool: POOL, repeat: 1, stop: 'M26',
      onRun: (c, l) => console.log(`[PROGRESS ${++done}/${cells.length}] ${leg} ${c.label} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
    out[leg] = lines;
    lines.forEach((l, i) => {
      const e = l.eval || {};
      const c = e.ch && e.ch['challenges:h'];
      row({ gate: `V5-3s ${leg} ${cells[i].note}`, id: 'ptr', leg: `from all/${L.from}, ${L.ticks} ticks, diff 1, profile all, ONE run`,
        ok: !!l.ok, ticks: l.ticks, gameSeconds: l.gameSeconds, hash: l.hashGame,
        notes: `${markText(l, L.marks)}; h challenges ${JSON.stringify(e.hChall || {})}; enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'}; quirks ${short(e.q)} (total ${short(e.qTotal)}), QL ${e.qLayers}; HS ${short(e.h)} (best ${short(e.hBest)}); SB ${short(e.sb)}; resets q/h ${(l.actions || {})['reset:q'] || 0}/${(l.actions || {})['reset:h'] || 0}; active ${e.active}; wait record ${JSON.stringify(e.fail).slice(0, 160)}; opt \`${cells[i].opt || '—'}\`; ticks_ms ${l.ticks_ms}${l.error ? '; ERROR ' + l.error : ''}` });
    });
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/gates-v5-part3s.json'), { commit, dirty, cells, out });
}

// ---- entry -----------------------------------------------------------------------------------------------------------
const PARTS = { '3s': part3s };
if (!PARTS[PART]) { console.error(`unknown --part ${PART} (${Object.keys(PARTS).join(', ')})`); process.exit(2); }
await PARTS[PART]();

if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v5-part${PART}-last.json`), { date: new Date().toISOString(), commit, dirty, rows });
const green = rows.filter((r) => r.ok).length;
console.log(`\nVERDICT: rows ${green}/${rows.length} of ${ROWS[PART] ?? '?'} expected`);
if (!a['no-summary']) appendSection({ title: `V5 the Advanced tab — part ${PART}`, commit, dirty, rows, slug: `gates-v5-part${PART}` });
if (a.assert && (green !== rows.length || rows.length !== ROWS[PART])) process.exit(1);
