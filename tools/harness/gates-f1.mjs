// Gate F1 (plan §46–§48): HOW OFTEN SHOULD A RESET FIRE — scored at the page's REAL tick.
//   node tools/harness/gates-f1.mjs --part <p> [--cell <key>] [--pool N] [--repeat N] [--assert] [--no-summary] [--no-write]
//     --part 0   THE TICK CALIBRATION: the SAME configuration (the ladder's own — `passiveYield=off`) over three
//                stretches (early / row 2 / row 3) at `diff 1` and at the page's `diff 0.05`; is the stretch's length a
//                constant factor apart, or not?
//     --part 1   THE YIELD: the same stretches with the yield ON (the default since F1) at both ticks, beside Part 0's
//                `off` cells — plus the OPENING and the long row-3 stretch, which only fit a CI runner (`--cell`)
//     --part 2   THE DERIVED DEFAULT for a normal layer's reset (`resetDefault=`): Something Tree with NO table, ptr's
//                table-less layers (the long row-3 stretch) and a BOUNDED, NAMED roster sample scored by the progress
//                tracker's events per game-second (no ladder exists for them), seed 1
//     --part 3   SLOW THE RESETS DOWN ON PURPOSE (⚖ ruling 2): per NORMAL layer (`p` before passive generation, `e`,
//                `q`/`h`), a larger ratio `gain>=Nx`, `rate-peak`'s two buffers swept upward, and a minimum game-time
//                between resets as the labelled PROXY control (⚖ 13d.2: never a default) — and the MASKING cells that
//                slow the row that WIPES the one whose gain should compound
//     --cell <key>  run ONE cell of any part; `--group <g>` every cell of a group (a CI shard each); `--part m --cell
//                <part> --from <dir>` MERGES a part's cell files, refuses a missing one by name, prints its table
//
// ⛔ WHY THE TICK. The engine pays passive generation as `resetGain × diff` per tick and a manual reset pays `resetGain`
// ONCE, so a reset is worth a whole tick of passive income at `diff 1` and a twentieth of it at the page's 0.05. Every
// ladder number and ranking in this arc was scored at `diff 1` (plan §46a); H1 compared it against COARSER ticks only.
// ⛔ EVERY CELL IS RUN TWICE and a cell whose two runs disagree on the marks, the end game-second or `hashGame` is RED.
// ⛔ EVERY CELL CARRIES A GRACEFUL WALL (`--wall-ms`): a run killed by `timeout` writes nothing (four of the planner's
// cells were lost that way), and a walled cell is RED ("walled"), never a shorter row.
// ⚠ Resumed legs (every stretch but the opening) are credited the offline time of their fixture's boot; they compare
// with resumed legs from the SAME fixture only, which is all this gate ever does.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

// ⛔ EVERY FLAG THIS FILE READS IS DECLARED, and the booleans are booleans (an undeclared flag takes the NEXT token).
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-summary', 'no-write', 'assert', 'repeat', 'cell', 'group', 'from', 'wall-ms']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part ?? '0');
const POOL = Number(a.pool || 4);
const REPEAT = Number(a.repeat || 2);
const WALL = Number(a['wall-ms'] || 570000);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 400)}`); };

const SNAP = (m) => path.join(REPO, `tools/harness/snapshots/ptr/all/${m}.json`);
const snapGs = (m) => JSON.parse(fs.readFileSync(SNAP(m), 'utf8')).gameSeconds;
// A STRETCH: where it starts (a fixture, or a fresh game), the marks it scores, and a game-second BUDGET past its start
// that is the same at every tick (so a cell that does not reach its last mark reports "not by <start + budget>").
const STRETCHES = {
  E: { name: 'early — all/M04 → M08 (row 1: p, b, g)', from: 'M04', to: 'M08', marks: ['M05', 'M06', 'M07', 'M08'], budget: 4000 },
  R2: { name: 'row 2 — all/M15 → M16 (the row-2 push)', from: 'M15', to: 'M16', marks: ['M16'], budget: 3000 },
  R3: { name: 'row 3 — all/M22 → M24 (H11, q11–q13)', from: 'M22', to: 'M24', marks: ['M23', 'M24'], budget: 1500 },
  O: { name: 'the OPENING — fresh → M12', from: null, to: 'M12', marks: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'], budget: 9000 },
  L3: { name: 'the long row-3 stretch — all/M15 → M25', from: 'M15', to: 'M25', marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25'], budget: 21000 },
  P: { name: 'the row-1 opening — fresh → M04 (reset:p BEFORE passive Prestige Points)', from: null, to: 'M04', marks: ['M01', 'M02', 'M03', 'M04'], budget: 4000 },
  ST: { name: 'Something Tree — fresh → S05, NO table', id: 'something', ladder: 'something', from: null, to: 'S05', marks: ['S01', 'S02', 'S03', 'S04', 'S05'], budget: 600 },
};
// ⚖ THE ROSTER SAMPLE (Part 2) — BOUNDED and NAMED, chosen from the F1 census (plan §48): games with ≥ 3 normal layers
// that declare passive generation, both engine families (2.2.1 ptr-style; 2.6 / 2.7), seed 1. No ladder exists for
// them, so a cell is scored by the progress tracker (`track=1`): events per game-second over a fixed horizon.
const SAMPLE = ['the-extended-tree', 'prestige-tree-ng', 'the-normal-tree', 'the-omega-tree', 'the-function-of-time-tree', 'the-pp-tree', 'the-point-tree', 'weakling-tree'];
for (const g of SAMPLE) STRETCHES[`X:${g}`] = { name: `${g} — fresh, 600 game-s, the progress tracker`, id: g, ladder: null, from: null, to: null, marks: [], budget: 600, roster: true };
const EVAL_PROGRESS = '({events: tmtLoader.progress().total, lastAt: tmtLoader.progress().lastAt, fallbacks: tmtLoader.fallbackFires ? Object.assign({}, tmtLoader.fallbackFires) : null})';
const OFF = 'passiveYield=off';
// cell key = `<stretch>@<diff>/<config>`. `ci: true` = does not fit a 10-minute LOCAL process; run by `--cell` in CI.
const CELLS = {
  0: [
    { key: 'E@1/off', s: 'E', diff: 1, opt: OFF }, { key: 'E@0.05/off', s: 'E', diff: 0.05, opt: OFF },
    { key: 'R2@1/off', s: 'R2', diff: 1, opt: OFF }, { key: 'R2@0.05/off', s: 'R2', diff: 0.05, opt: OFF },
    { key: 'R3@1/off', s: 'R3', diff: 1, opt: OFF }, { key: 'R3@0.05/off', s: 'R3', diff: 0.05, opt: OFF },
  ],
  1: [
    { key: 'E@1/yield', s: 'E', diff: 1, opt: '' }, { key: 'E@0.05/yield', s: 'E', diff: 0.05, opt: '' },
    { key: 'R2@1/yield', s: 'R2', diff: 1, opt: '' }, { key: 'R2@0.05/yield', s: 'R2', diff: 0.05, opt: '' },
    { key: 'R3@1/yield', s: 'R3', diff: 1, opt: '' }, { key: 'R3@0.05/yield', s: 'R3', diff: 0.05, opt: '' },
    { key: 'O@1/off', s: 'O', diff: 1, opt: OFF }, { key: 'O@1/yield', s: 'O', diff: 1, opt: '' },
    { key: 'O@0.05/off', s: 'O', diff: 0.05, opt: OFF, ci: true }, { key: 'O@0.05/yield', s: 'O', diff: 0.05, opt: '', ci: true },
    { key: 'L3@1/off', s: 'L3', diff: 1, opt: OFF, ci: true }, { key: 'L3@1/yield', s: 'L3', diff: 1, opt: '', ci: true },
    { key: 'L3@0.05/off', s: 'L3', diff: 0.05, opt: OFF, ci: true }, { key: 'L3@0.05/yield', s: 'L3', diff: 0.05, opt: '', ci: true },
  ],
  2: [],
  3: [],
};
// ---- Part 2: the DERIVED default for a normal layer's reset (`resetDefault=<policy>`; the shipped one is `gain>=2x`)
const CANDIDATES = [
  { tag: 'gain2x', opt: 'resetDefault=gain>=2x', note: 'the derived default BEFORE F1, named', l3: true },
  { tag: 'stall3', opt: 'resetDefault=gain>=2x|stall>=3x/5', note: 'the USER’s stall fallback at V2’s K = 3' },
  { tag: 'stall5', opt: '', note: 'the derived default SINCE F1: `gain>=2x|stall>=5x/5`', l3: true },
  { tag: 'stall10', opt: 'resetDefault=gain>=2x|stall>=10x/5', note: 'K = 10' },
  { tag: 'rate-peak0/0', opt: 'resetDefault=rate-peak@0/0', note: 'the bare rate rule (the control)' },
  { tag: 'rate-peak0.1/30', opt: 'resetDefault=rate-peak@0.1/30', note: 'the user’s two buffers, as V2 shipped them' },
];
for (const c of CANDIDATES) {
  for (const d of [1, 0.05]) CELLS[2].push({ key: `ST@${d}/${c.tag}`, s: 'ST', diff: d, opt: c.opt, group: 'ST' });
  if (c.l3) CELLS[2].push({ key: `L3@0.05/${c.tag}`, s: 'L3', diff: 0.05, opt: c.opt, ci: true, group: `L3-${c.tag}` });
  for (const g of SAMPLE) CELLS[2].push({ key: `X:${g}@0.05/${c.tag}`, s: `X:${g}`, diff: 0.05, opt: ['track=1', c.opt].filter(Boolean).join(';'), ci: true, group: `X:${g}` });
}
// ---- Part 3: SLOW THE RESETS DOWN — one layer at a time, then the masking cells, then together ---------------------
// ⚠ The proxy control is a `while` on the core's own clock (`tmtLoader.sinceReset(id)`): it holds the feature's own
// rule back until T game-seconds have passed since that feature last reset. It is a harness lever, never a default.
const gap = (id, t) => `while:${id}=tmtLoader.sinceReset('${id}') >= ${t}`;
const P3 = [
  // p, before passive generation (the opening to M04); the control is the shipped `gain>=2x`
  ...['2x', '4x', '8x', '16x'].map((n) => ({ s: 'P', layer: 'p', tag: `gain>=${n}`, opt: `policy:reset:p=gain>=${n}` })),
  ...['0/0', '0.1/30', '0.3/60', '0.5/120'].map((b) => ({ s: 'P', layer: 'p', tag: `rate-peak@${b}`, opt: `policy:reset:p=rate-peak@${b}` })),
  ...[5, 20, 60].map((t) => ({ s: 'P', layer: 'p', tag: `gap>=${t}s`, opt: gap('reset:p', t) })),
  // e, before q ms 1 (the row-2 push); the control is the shipped `gain>=2x`
  ...['2x', '4x', '8x', '16x', '32x', '64x'].map((n) => ({ s: 'R2', layer: 'e', tag: `gain>=${n}`, opt: `policy:reset:e=gain>=${n}` })),
  ...['0/0', '0.1/30', '0.3/60'].map((b) => ({ s: 'R2', layer: 'e', tag: `rate-peak@${b}`, opt: `policy:reset:e=rate-peak@${b}` })),
  ...[5, 10, 20, 40, 60].map((t) => ({ s: 'R2', layer: 'e', tag: `gap>=${t}s`, opt: gap('reset:e', t) })),
  // MASKING on row 1: the STATIC b / g wipe p — the planner's two cells, re-measured twice (they rested on one run each)
  ...[5, 30].map((t) => ({ s: 'E', layer: 'b+g (masking p)', tag: `b,g gap>=${t}s`, opt: `${gap('reset:b', t)};${gap('reset:g', t)}` })),
  // q / h over the long row-3 stretch: q's own ratio (it keeps its turn modifier), and the MASKING cells that slow the
  // row that wipes row 2
  ...['2', '4', '8'].map((n) => ({ s: 'L3', layer: 'q', tag: `q gain>=${n}`, opt: `policy:reset:q=gain>=${n}|turn@10/30x/5/0/100`, ci: true })),
  ...[60].map((t) => ({ s: 'L3', layer: 'q+h (masking row 2)', tag: `q,h gap>=${t}s`, opt: `${gap('reset:q', t)};${gap('reset:h', t)}`, ci: true })),
  // e's best ratio from the row-2 curve, over the two WHOLE stretches it acts in (a table entry moves only on those)
  { s: 'O', layer: 'e (whole opening)', tag: 'e gain>=16x', opt: 'policy:reset:e=gain>=16x', ci: true },
  { s: 'L3', layer: 'e (whole row-3 stretch)', tag: 'e gain>=16x', opt: 'policy:reset:e=gain>=16x', ci: true },
  // together, over the whole opening: the ratio doubled on BOTH normal layers
  { s: 'O', layer: 'p+e', tag: 'p,e gain>=4x', opt: 'policy:reset:p=gain>=4x;policy:reset:e=gain>=4x', ci: true },
];
for (const c of P3) CELLS[3].push({ key: `${c.s}@0.05/${c.tag}`, s: c.s, diff: 0.05, opt: c.opt, layer: c.layer, ci: !!c.ci || c.s === 'P', group: c.ci || c.s === 'P' ? `P3-${c.s}${c.s === 'L3' ? '-' + c.tag : ''}` : `P3-${c.s}` });
const allCells = () => Object.entries(CELLS).flatMap(([p, cs]) => cs.map((c) => ({ ...c, part: p })));

function flagsOf(c) {
  const S = STRETCHES[c.s];
  const start = S.from ? snapGs(S.from) : 0;
  const f = { diff: c.diff, profile: 'all', ticks: Math.ceil(S.budget / c.diff), 'wall-ms': WALL, stall: 1e9 };
  if (S.roster) Object.assign(f, { 'random-seed': 1, eval: EVAL_PROGRESS });
  else Object.assign(f, { ladder: path.join(REPO, `tools/harness/ladder/${S.ladder || 'ptr'}.json`), to: S.to, 'marks-continue': true, eval: EVAL_PROGRESS });
  if (S.from) f['from-snapshot'] = SNAP(S.from);
  return { flags: Object.entries(f), start, id: S.id || 'ptr' };
}
/** Run cells (each twice) through ONE pool of `POOL` children; one line per cell, in order. */
async function runAll(cells) {
  const out = new Array(cells.length);
  let next = 0;
  const slots = Math.max(1, Math.floor(POOL / REPEAT));
  await Promise.all(Array.from({ length: Math.min(slots, cells.length) }, async () => {
    while (next < cells.length) {
      const i = next++, c = cells[i];
      const { flags, start, id } = flagsOf(c);
      const t0 = Date.now();
      const [l] = await runCells({ id, cells: [{ label: c.key, opt: c.opt }], flags, pool: REPEAT, repeat: REPEAT, stop: null });
      out[i] = { cell: c.key, part: c.part, s: c.s, diff: c.diff, opt: c.opt, start, commit, wallS: Math.round((Date.now() - t0) / 1000),
        ok: l.ok, twiceEqual: l.twiceEqual, gameSeconds: l.gameSeconds, ticks: l.ticks, hashGame: l.hashGame, marks: l.marks, actions: l.actions,
        walled: !!l.stall?.walled, eval: l.eval || null, runWallMs: (l.runs || []).map((r) => r.box?.wallMs), error: l.error || null };
      console.log(`[PROGRESS] ${c.key} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} twice ${l.twiceEqual} (${out[i].wallS}s wall)`);
    }
  }));
  return out;
}
const cellOk = (l) => !!l && !!l.ok && l.twiceEqual === true && !l.walled;
const durs = (l) => Object.fromEntries(STRETCHES[l.s].marks.map((m) => [m, l.marks?.[m] == null ? null : Math.round((l.marks[m] - l.start) * 100) / 100]));
const text = (l) => STRETCHES[l.s].marks.map((m) => `${m} ${l.marks?.[m] ?? `not by ${l.start + STRETCHES[l.s].budget}`}`).join(' · ');
const score = (l) => (l.eval?.events == null ? '—' : Math.round((l.eval.events / STRETCHES[l.s].budget) * 1000) / 1000);
/** The number a cell is RANKED by: the game-second its stretch's last mark landed (lower is better; unreached = ∞),
 *  or, on a roster game, the tracker's events over the horizon (higher is better — returned negated). */
const rankOf = (l) => (STRETCHES[l.s].roster ? -(l.eval?.events ?? 0) : (l.marks?.[STRETCHES[l.s].to] ?? Infinity));
const shown = (l) => (STRETCHES[l.s].roster ? `${l.eval?.events ?? '—'} events` : `${STRETCHES[l.s].to} ${l.marks?.[STRETCHES[l.s].to] ?? 'not reached'}`);
const resets = (l) => Object.entries(l.actions || {}).filter(([k]) => k.startsWith('reset:')).map(([k, v]) => `${k.slice(6)} ${v}`).join(' / ');

// ---- the tables, from whatever cell lines are present -------------------------------------------------------------
function tables(lines, part) {
  const by = Object.fromEntries(lines.map((l) => [l.cell, l]));
  for (const l of lines) {
    row({ gate: `F1-${part} ${l.cell} — ${STRETCHES[l.s].name}, diff ${l.diff}, ${l.opt || 'the default (yield ON)'}`, id: STRETCHES[l.s].id || 'ptr', leg: `${REPEAT} runs`,
      ok: cellOk(l), ticks: l.ticks, gameSeconds: l.gameSeconds, diff: l.diff, hash: l.hashGame,
      notes: `${STRETCHES[l.s].roster ? `events ${l.eval?.events ?? '—'} (${score(l)}/game-s), last at ${l.eval?.lastAt ?? '—'}` : text(l)}${l.eval?.fallbacks && Object.keys(l.eval.fallbacks).length ? `; stall-fallback resets ${JSON.stringify(l.eval.fallbacks)}` : ''}; resets ${resets(l)}; twice equal ${l.twiceEqual}${l.walled ? ' — WALLED' : ''}; wall ${l.wallS}s (runs ${JSON.stringify(l.runWallMs)} ms)${l.error ? '; ' + String(l.error).slice(-300) : ''}` });
  }
  // Part 0's verdict: the ratio of each mark's stretch-duration at 0.05 to its duration at 1, per stretch
  if (part === '0') {
    const ratios = [];
    for (const s of ['E', 'R2', 'R3']) {
      const d1 = by[`${s}@1/off`], d5 = by[`${s}@0.05/off`];
      if (!d1 || !d5) continue;
      const a1 = durs(d1), a5 = durs(d5);
      for (const m of STRETCHES[s].marks) if (a1[m] && a5[m] != null) ratios.push({ s, m, d1: a1[m], d05: a5[m], r: Math.round((a5[m] / a1[m]) * 1000) / 1000 });
    }
    const rs = ratios.map((x) => x.r), lo = Math.min(...rs), hi = Math.max(...rs);
    row({ gate: 'F1-0 VERDICT (report): is the real tick a CONSTANT factor from `diff 1` on the same configuration?', id: 'ptr',
      ok: lines.every(cellOk) && ratios.length > 0, ticks: null, gameSeconds: null, diff: null, hash: null,
      notes: `${ratios.map((x) => `${x.s} ${x.m}: ${x.d05}/${x.d1} = ${x.r}`).join(' · ')} — range ${lo}–${hi} (${hi / lo < 1.1 ? 'within 10 %: a constant factor' : 'NOT a constant factor'})` });
  }
  if (part === '1') {
    const cmp = [];
    for (const s of Object.keys(STRETCHES)) for (const d of [1, 0.05]) {
      const off = by[`${s}@${d}/off`], on = by[`${s}@${d}/yield`];
      if (!off || !on) continue;
      const m = STRETCHES[s].to, x = off.marks?.[m], y = on.marks?.[m];
      cmp.push(`${s}@${d}: ${m} ${x ?? '—'} → ${y ?? '—'}${x != null && y != null ? ` (${y < x ? 'FASTER' : y > x ? 'SLOWER' : 'equal'} ${Math.round((y - x) * 100) / 100})` : ''}`);
    }
    row({ gate: 'F1-1 VERDICT (report): the yield against `passiveYield=off`, per stretch and tick', id: 'ptr', ok: lines.every(cellOk), ticks: null, gameSeconds: null, diff: null, hash: null, notes: cmp.join(' · ') });
  }
  // Parts 2 and 3: per stretch (and, in Part 3, per layer), every candidate ranked; the best named
  if (part === '2' || part === '3') {
    const groups = new Map();
    for (const l of lines) {
      const c = CELLS[part].find((x) => x.key === l.cell);
      const k = `${l.s}@${l.diff}${c?.layer ? ` — ${c.layer}` : ''}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(l);
    }
    const out = [];
    for (const [k, ls] of groups) {
      const best = ls.slice().sort((x, y) => rankOf(x) - rankOf(y))[0];
      const ix = ls.indexOf(best);
      out.push(`${k}: ${ls.map((l) => `${l.cell.split('/').slice(1).join('/')} ${shown(l)}`).join(', ')} ⇒ best ${best.cell.split('/').slice(1).join('/')}${part === '3' && ls.length > 2 ? (ix === 0 ? ' (the CONTROL — rarer is not better)' : ix === ls.length - 1 ? ' (the RAREST — no interior optimum in range)' : ' (INTERIOR)') : ''}`);
    }
    row({ gate: part === '2' ? 'F1-2 VERDICT (report): the derived default for a normal layer, per stretch' : 'F1-3 VERDICT (report): slowing the resets, per layer — the curve and where its best sits',
      id: 'ptr', ok: lines.every(cellOk), ticks: null, gameSeconds: null, diff: null, hash: null, notes: out.join(' ‖ ') });
  }
}

// ---- Part fix: the ladder's FIXTURES regenerated under the shipped configuration (the yield ON) ---------------------
// ⛔ `all/M04.json` is "passive PP" — the first mark at which the yield can act — so every later fixture moves and
// M01–M04 do not. The shipped leg from it runs TWICE, each run writing every mark's snapshot to its own directory, and
// a fixture is committed only from a run whose twin wrote the same file (gameSeconds, full hash, hashGame) — R3c-2f's
// pattern. The DECLARED set is what the first CI run measured; a leg that writes one more or one fewer is a finding.
const FIX = { diff: 1, profile: 'all', ticks: 85000, 'wall-ms': WALL, ladder: path.join(REPO, 'tools/harness/ladder/ptr.json'), to: 'M31',
  'from-snapshot': SNAP('M04'), 'marks-continue': true, stall: 1e9 };
const FIX_DECLARED = ['M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26', 'M27'];
async function partFix() {
  const { spawn } = await import('node:child_process');
  const base = path.join(REPO, 'tools/harness/results/f1-fixtures');
  const dirs = [path.join(base, 'run1'), path.join(base, 'run2')];
  dirs.forEach((d) => { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); });
  const leg = (d, k) => new Promise((ok) => {
    const out = path.join(base, `leg${k}.json`);
    const args = [path.join(REPO, 'tools/harness/run.mjs'), 'ptr', '--json', out, '--snapshots', d];
    for (const [f, v] of Object.entries(FIX)) { if (v === true) args.push(`--${f}`); else args.push(`--${f}`, String(v)); }
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'inherit', 'inherit'] });
    c.on('exit', (code, sig) => { let r; try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { r = { ok: false, error: `no result (${code}/${sig}): ${e.message}` }; } ok(r); });
  });
  const [r1, r2] = await Promise.all(dirs.map((d, i) => leg(d, i + 1)));
  row({ gate: 'F1-fix the shipped leg from all/M04.json, twice, writing fixtures', id: 'ptr', leg: `all/M04 → ${FIX.ticks} ticks, diff 1`,
    ok: !!r1.ok && !!r2.ok && r1.gameSeconds === r2.gameSeconds && r1.hashGame === r2.hashGame && !r1.stall?.walled,
    ticks: r1.ticks, gameSeconds: r1.gameSeconds, diff: 1, hash: r1.hashGame, notes: `run 2 ${r2.gameSeconds} / ${r2.hashGame}${r1.error || r2.error ? `; ERROR ${String(r1.error || r2.error).slice(-300)}` : ''}` });
  const files = fs.readdirSync(dirs[0]).filter((f) => f.endsWith('.json')).sort();
  for (const f of files) {
    const A = JSON.parse(fs.readFileSync(path.join(dirs[0], f), 'utf8'));
    const B = fs.existsSync(path.join(dirs[1], f)) ? JSON.parse(fs.readFileSync(path.join(dirs[1], f), 'utf8')) : null;
    const C = fs.existsSync(SNAP(f.slice(0, -5))) ? JSON.parse(fs.readFileSync(SNAP(f.slice(0, -5)), 'utf8')) : null;
    const same = !!B && A.gameSeconds === B.gameSeconds && A.hash === B.hash && A.hashGame === B.hashGame;
    row({ gate: `F1-fix fixture ${A.mark} reproduces`, id: 'ptr', leg: 'the shipped leg, twice', ok: same, ticks: A.ticks, gameSeconds: A.gameSeconds, diff: 1, hash: A.hashGame,
      notes: `full hash ${A.hash}; run 2 ${B ? `${B.gameSeconds}s/${B.hash}/${B.hashGame}` : 'MISSING'}; OLD all/${f}: ${C ? `${C.ticks} ticks / ${C.gameSeconds}s / ${C.hashGame}` : 'none (NEW)'}` });
  }
  const got = files.map((f) => f.slice(0, -5));
  row({ gate: 'F1-fix VERDICT: every fixture the shipped leg wrote, written twice the same — and exactly the DECLARED set', id: 'ptr',
    ok: rows.every((r) => r.ok) && got.join(',') === FIX_DECLARED.join(','), notes: `wrote ${got.join(', ')}; declared ${FIX_DECLARED.join(', ')}` });
}

// ---- Part rows: the `maxRow` defect, held to the PLAIN page over the whole roster -----------------------------------
// ⛔ FOUND BY THIS SLICE: on a game whose rows are STRINGS, adding the `au` layer (row "side") made the engine's `maxRow`
// "side" and emptied `TREE_LAYERS`, so the game loop's per-layer pass (passive generation, `update()`) never ran on the
// automation page (loader/tmt-auto.js `repairMaxRow`). Every game is booted plain and with automation, ONE tick each,
// and the engine's `maxRow` and `TREE_LAYERS` must be byte-equal; the repairs are counted by name.
const ROWS_EVAL = `({maxRow: typeof maxRow === 'undefined' ? 'undef' : JSON.stringify(maxRow), tree: typeof TREE_LAYERS === 'undefined' ? null : JSON.stringify(TREE_LAYERS), rep: typeof tmtLoader !== 'undefined' && tmtLoader.maxRowRepairs !== undefined ? tmtLoader.maxRowRepairs : null})`;
const ROWS_REPAIRED = ['create-incremental', 'gooby-cat-tree', 'the-danus-tree', 'the-pro-tree'];
async function partRows() {
  const { spawn } = await import('node:child_process');
  const os = await import('node:os');
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const one = (id, plain) => new Promise((ok) => {
    const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'f1-rows-')), 'r.json');
    const c = spawn(process.execPath, [path.join(REPO, 'tools/harness/run.mjs'), id, '--ticks', '1', ...(plain ? ['--no-automation'] : []), '--eval', ROWS_EVAL, '--json', f], { cwd: REPO, stdio: 'ignore' });
    c.on('exit', () => { try { const r = JSON.parse(fs.readFileSync(f, 'utf8')); ok(r.ok ? r.eval : { error: r.error || r.failed_at }); } catch (e) { ok({ error: String(e) }); } });
  });
  const jobs = ids.flatMap((id) => [[id, true], [id, false]]);
  const res = {};
  let next = 0;
  await Promise.all(Array.from({ length: POOL }, async () => { while (next < jobs.length) { const [id, plain] = jobs[next++]; (res[id] ||= {})[plain ? 'plain' : 'auto'] = await one(id, plain); } }));
  const errors = ids.filter((id) => res[id].plain?.error || res[id].auto?.error);
  const differ = ids.filter((id) => !errors.includes(id) && (res[id].plain.maxRow !== res[id].auto.maxRow || res[id].plain.tree !== res[id].auto.tree));
  const repaired = ids.filter((id) => res[id].auto?.rep).sort();
  row({ gate: 'F1-rows the engine\'s maxRow and TREE_LAYERS: automation page ≡ plain page, every game, one tick', id: `${ids.length} games`, ok: ids.length > 0 && !errors.length && !differ.length,
    notes: `errors ${errors.length ? errors.map((id) => `${id}: ${String(res[id].plain?.error || res[id].auto?.error).slice(0, 160)}`).join('; ') : 'none'}; differ ${differ.length ? differ.join(', ') : 'none'}` });
  row({ gate: 'F1-rows the repair fires on exactly the four string-row games, once each', id: 'roster', ok: repaired.join(',') === ROWS_REPAIRED.join(',') && repaired.every((id) => res[id].auto.rep === 1),
    notes: `repaired ${repaired.map((id) => `${id} ×${res[id].auto.rep}`).join(', ') || 'none'}; declared ${ROWS_REPAIRED.join(', ')}` });
}

// ---- Part pin: ONE historical pin, replayed — what the off-switch mutant must redden (gates-s1 part 1 is CI's) -------
// A2-3 (i): ptr, kinds=reset,upgrades,buyables with the A2 `reset:p`, 3550 ticks at diff 1 → hashGame ff624de18438f176
// (gates-s1 PINS, gates-p1a (e)). It passes M04 (2629), so a yield that the named `passiveYield=off` fails to switch off
// changes it.
async function partPin() {
  const { spawn } = await import('node:child_process');
  const os = await import('node:os');
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'f1-pin-')), 'r.json');
  const { PRE_F1 } = await import('./lib.mjs');
  const opt = `kinds=reset,upgrades,buyables;policy:reset:p=interval>=10;${PRE_F1}`;
  await new Promise((ok) => spawn(process.execPath, [path.join(REPO, 'tools/harness/run.mjs'), 'ptr', '--profile', 'all', '--diff', '1', '--ticks', '3550', '--auto-opt', opt, '--json', f], { cwd: REPO, stdio: 'ignore' }).on('exit', ok));
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  row({ gate: 'F1-pin the historical A2-3 (i) pin, NAMING the pre-F1 configuration, reproduces', id: 'ptr', leg: `3550×1, --auto-opt ${opt}`, ok: !!r.ok && r.ticks === 3550 && r.hashGame === 'ff624de18438f176',
    ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hashGame, notes: `hashGame ${r.hashGame} (pin ff624de18438f176); resets ${JSON.stringify(Object.fromEntries(Object.entries(r.hook?.actions || {}).filter(([k]) => k.startsWith('reset:'))))}` });
}

async function main() {
  if (PART === 'pin') { await partPin(); return finish('pin', 1); }
  if (PART === 'rows') { await partRows(); return finish('rows', 2); }
  if (PART === 'fix') { await partFix(); return finish('fix', 2 + FIX_DECLARED.length); }
  if (PART === 'm') {
    const dir = a.from ? path.resolve(String(a.from)) : null;
    const want = String(a.cell ?? '');   // --part m --cell <part>: the part being merged
    if (!dir || !fs.existsSync(dir) || !CELLS[want]) { console.error('REFUSED: --part m --cell <part> --from <dir>'); process.exit(2); }
    const got = new Map();
    for (const f of fs.readdirSync(dir).filter((x) => /^gates-f1-cell-.*\.json$/.test(x))) for (const l of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).lines || []) got.set(l.cell, l);
    const missing = CELLS[want].filter((c) => !got.has(c.key)).map((c) => c.key);
    if (missing.length) { console.error(`REFUSED: cell(s) ${missing.join(', ')} produced no file — LESS LOOKS GREENER`); process.exit(1); }
    tables(CELLS[want].map((c) => got.get(c.key)), want);
    return finish(want, CELLS[want].length + 1);
  }
  if (a.cell !== undefined || a.group !== undefined) {
    const cs = a.cell !== undefined ? allCells().filter((x) => x.key === String(a.cell)) : allCells().filter((x) => x.group === String(a.group));
    if (!cs.length) { console.error(`REFUSED: no ${a.cell !== undefined ? `cell "${a.cell}"` : `group "${a.group}"`} (cells: ${allCells().map((x) => `${x.key}${x.group ? ` [${x.group}]` : ''}`).join(', ')})`); process.exit(2); }
    const lines = await runAll(cs);
    tables(lines, 'cell');
    const name = a.cell !== undefined ? cs[0].key : `group-${a.group}`;
    if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/gates-f1-cell-${name.replace(/[^A-Za-z0-9.@-]/g, '_')}.json`), { gate: 'F1 cell', commit, dirty, lines, rows });
    return finish(a.cell !== undefined ? `cell ${cs[0].key}` : `group ${a.group}`, cs.length);
  }
  if (!CELLS[PART]) { console.error(`REFUSED: no part ${PART}`); process.exit(2); }
  const cells = CELLS[PART].filter((c) => !c.ci).map((c) => ({ ...c, part: PART }));
  const lines = await runAll(cells);
  tables(lines, PART);
  if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/gates-f1-part${PART}.json`), { gate: `F1 part ${PART}`, commit, dirty, lines, rows });
  return finish(PART, cells.length + 1);
}
function finish(what, expected) {
  const red = rows.filter((r) => !r.ok).length;
  const short = `F1 ${what}: rows ${rows.length}/${expected} expected, ${red} RED`;
  console.log(`\nVERDICT: ${short}`);
  if (!a['no-summary'] && !a['no-write']) appendSection({ title: `Gate F1 ${what}`, commit, dirty, rows, reading: 'A cell key is `<stretch>@<diff>/<config>`; `off` = `passiveYield=off` (the ladder\'s own configuration), `yield` = the default since F1. "not by X" = the mark was not reached inside the stretch\'s game-second budget, which is a result.' });
  // ⛔ A DECLARED ROW COUNT IS PART OF THE GATE — exact, not a floor.
  if (a.assert && (red > 0 || rows.length !== expected)) { console.error(`REFUSED: ${short}`); process.exit(1); }
}
await main();
