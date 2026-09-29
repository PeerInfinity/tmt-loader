// A policy / option sweep: one run.mjs child per CELL (a pool of ≤ 8), each with the same flags plus that cell's
// extra --auto-opt entries, and one line per cell with the game-seconds to each mark.
//   node sweep.mjs <id> --vary "policy:reset:e=interval>=5|interval>=10|always" [--opt "k=v;k2=v2"] [--pool 8]
//                  [--json out] <any run.mjs flags: --diff 1 --ticks N --marks f --marks-continue --stall S --stall-seen --wall-ms W>
//
// ⚖ R2: TWO EXTENSIONS, both because a defaults sweep is not a one-axis question (plan §23).
//   · `--vary` MAY BE REPEATED. Each occurrence is an AXIS and the cells are their CROSS PRODUCT, so
//     `--vary "policy:reset:q=a|b" --vary "policy:reset:e=c|d"` is four cells, each naming its whole configuration.
//     (parseArgs keeps only the last of a repeated flag, so the axes are read off process.argv directly.)
//   · `--repeat N` runs every cell N times. A cell whose runs disagree on the marks, the end game-second or the end
//     `hashGame` is reported `twiceEqual: false` — ⚖ V2 §18.2's rule, and the only way a sweep row is evidence.
// Every line carries `ticks_ms` and the box's 1-minute load at the start and end of its own child, because a sweep
// that fills the pool changes ms/tick and never changes game-seconds — a reader has to be able to see which is which.
//
// The PLANNER's options are swept the same way with a `planner:` key (P1b, docs/planner.md):
//   node sweep.mjs ptr --vary "planner:k=60|300|900" --planner=auto --planner-ladder ladder/ptr.json
//                      --planner-opt "screenK=4" --marks m.json --marks-continue --stop-mark M09 --pool 2
// `planner:<option>` goes into --planner-opt (merged over --planner-opt's own entries), everything else into --auto-opt.
// DNF is a FIRST-CLASS result: a line that did not reach `--stop-mark` is reported `dnf: true` with a cause read off the
// round log — `fixation` (the same winner every round with no rise in the target), `economy` (the target never moved at
// all), `blocked` (every goal blocked, the planner fell back to the root dimension) or `wall` (the process ran out of
// wall-clock before the game ran out of progress).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, writeJSON } from './lib.mjs';

const BOOL = ['marks-continue', 'stall-seen', 'no-auto'];

const loadavg = () => Number(fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]);

/** Why a line did not reach the stop mark, read off the round log — never guessed. */
export function classifyDNF(rep, stopMark) {
  if (!rep || !rep.log || !rep.log.length) return 'no-rounds';
  if (stopMark && rep.reached && rep.reached[stopMark]) return null;
  const log = rep.log, last = log.slice(-Math.min(log.length, 5));
  const roots = log.filter((r) => r.goal && r.goal.source === 'root').length;
  const rose = last.filter((r) => r.clock && r.clock.rose).length;
  const winners = new Set(last.map((r) => r.winner && r.winner.id));
  if (roots >= Math.max(1, Math.floor(log.length / 2))) return 'blocked';
  if (rose === 0 && winners.size === 1) return 'fixation';
  if (rose === 0) return 'economy';
  return 'wall';
}

/** One run.mjs child. `flags` are run.mjs flags; `autoOpt` / `plannerOpt` are the cell's own strings. */
function runChild({ id, flags, autoOpt, plannerOpt, planner, roundsWanted }) {
  return new Promise((resolve) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-sweep-'));
    const out = path.join(dir, 'r.json'), rounds = path.join(dir, 'rounds.json');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out, '--profile', 'all'];
    if (autoOpt) args.push('--auto-opt', autoOpt);
    for (const [k, v] of flags) {
      if (k === 'planner-opt') continue;                                  // rebuilt by the caller
      if (k === 'planner') { args.push(`--planner=${v === true ? 'auto' : v}`); continue; }
      if (v === true) args.push(`--${k}`); else if (['marks', 'planner-ladder', 'from-snapshot', 'ladder', 'snapshots', 'stop-snapshot'].includes(k)) args.push(`--${k}`, path.resolve(String(v))); else args.push(`--${k}`, String(v));
    }
    if (planner) { if (plannerOpt) args.push('--planner-opt', plannerOpt); args.push('--rounds-out', rounds); }
    const load0 = loadavg(), t0 = Date.now();
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => {
      let r;
      try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch { r = { ok: false, error: err.slice(-400) }; }
      if (roundsWanted) { try { r.plannerReport = JSON.parse(fs.readFileSync(rounds, 'utf8')); } catch {} }
      r.box = { loadStart: load0, loadEnd: loadavg(), wallMs: Date.now() - t0 };
      resolve(r);
    });
  });
}

/** The line one RUN of a cell contributes — the shape every sweep row in SUMMARY.md is built from. */
function lineOf(cell, r, stop) {
  const rep = r.plannerReport || null;
  const line = { value: cell.label, opt: cell.opt || null, ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hash: r.hash, hashGame: r.hashGame,
    stall: r.stall, marks: Object.fromEntries(Object.entries(r.marks || {}).map(([n, m]) => [n, m ? m.gameSeconds : null])),
    actions: r.hook?.actions, ticks_ms: r.ticks_ms, box: r.box, eval: r.eval, predicates: r.predicates, error: r.error };
  if (rep) {
    line.rounds = rep.log.length;
    line.commits = rep.commits;
    line.divergences = rep.divergences.length;
    line.plannerWallMs = rep.log.reduce((t, x) => t + (x.cost?.wallMs || 0), 0);
    const lastTarget = rep.log.length ? rep.log[rep.log.length - 1].target : null;
    line.targetMax = lastTarget ? lastTarget.held : null;
    line.dnfCause = classifyDNF(rep, stop);
    line.dnf = !!(stop && !(r.marks || {})[stop]);
  } else if (stop) line.dnf = !(r.marks || {})[stop];
  return line;
}

/** Two runs of one cell agree iff they agree on the MARKS, the end game-second and the end hashGame. */
export const runsAgree = (a, b) => !!a && !!b && a.gameSeconds === b.gameSeconds && a.hashGame === b.hashGame && JSON.stringify(a.marks) === JSON.stringify(b.marks);

/**
 * Run `cells` (each {label, opt, plannerOpt?}) `repeat` times each through a pool of `pool` children.
 * Returns [{...line of run 1, runs: [line…], twiceEqual}] in cell order. ⚠ ONE CELL PER PROCESS: an L1 leg is
 * ~14,000 ticks at 13–19 ms/tick, so a child that ran two cells would outlast any honest wall bound.
 */
export async function runCells({ id, cells, flags = [], pool = 8, repeat = 1, planner = null, stop = null, onRun = null }) {
  const jobs = [];
  for (let i = 0; i < cells.length; i++) for (let k = 0; k < repeat; k++) jobs.push({ i, k });
  const out = cells.map(() => []);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(pool, jobs.length) }, async () => {
    while (next < jobs.length) {
      const { i, k } = jobs[next++];
      const r = await runChild({ id, flags, autoOpt: cells[i].opt, plannerOpt: cells[i].plannerOpt, planner, roundsWanted: !!planner });
      const line = lineOf(cells[i], r, stop);
      line.run = k + 1;
      out[i][k] = line;
      if (onRun) onRun(cells[i], line);
    }
  }));
  return out.map((runs, i) => ({ ...runs[0], runs, twiceEqual: repeat < 2 ? null : runs.every((r) => runsAgree(runs[0], r)) }));
}

// ---- the CLI ----------------------------------------------------------------------------------------------------
async function main() {
  const a = parseArgs(process.argv.slice(2), BOOL);
  const id = a._[0];
  // ⚠ READ OFF process.argv, not off parseArgs: `--vary` may be repeated (one AXIS each) and parseArgs keeps the last.
  const varies = [];
  for (let i = 0; i < process.argv.length; i++) {
    const v = process.argv[i];
    if (v === '--vary') varies.push(process.argv[i + 1]);
    else if (v.startsWith('--vary=')) varies.push(v.slice('--vary='.length));
  }
  if (!id || !varies.length) { console.error('usage: node sweep.mjs <id> --vary "key=v1|v2" [--vary "key2=v3|v4"] [--repeat 2] [--opt "k=v"] [run.mjs flags]'); process.exit(2); }
  const axes = varies.map((s) => { const eq = s.indexOf('='); return { key: s.slice(0, eq), values: s.slice(eq + 1).split('|') }; });
  const flags = Object.entries(a).filter(([k]) => !['_', 'vary', 'opt', 'pool', 'json', 'repeat'].includes(k));
  // the cross product, in axis order; a cell's label NAMES its whole configuration (§14d.2 item 14)
  let combos = [[]];
  for (const ax of axes) combos = combos.flatMap((c) => ax.values.map((v) => c.concat([{ key: ax.key, value: v }])));
  const planner = a.planner || null;
  const cells = combos.map((combo) => {
    const autoParts = combo.filter((c) => !c.key.startsWith('planner:')).map((c) => `${c.key}=${c.value}`);
    const planParts = combo.filter((c) => c.key.startsWith('planner:')).map((c) => `${c.key.slice('planner:'.length)}=${c.value}`);
    return { label: combo.map((c) => `${c.key}=${c.value}`).join(';'),
      opt: [a.opt, ...autoParts].filter(Boolean).join(';'),
      plannerOpt: [a['planner-opt'], ...planParts].filter(Boolean).join(';') };
  });
  const lines = await runCells({ id, cells, flags, pool: Number(a.pool || 8), repeat: Number(a.repeat || 1), planner, stop: a['stop-mark'] ? String(a['stop-mark']) : null });
  for (const l of lines) console.log(JSON.stringify(l));
  if (a.json) writeJSON(a.json, { id, axes, opt: a.opt || null, plannerOpt: a['planner-opt'] || null, repeat: Number(a.repeat || 1), flags: Object.fromEntries(flags), lines });
}
// ⚠ ENTRY-ONLY (the trap §14d.2 item 10 names): this module EXPORTS runCells, and a module whose battery runs at top
// level starts that battery on import.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) await main();
