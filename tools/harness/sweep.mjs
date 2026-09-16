// A policy / option sweep: one run.mjs child per value (a pool of ≤ 8), each with the same flags plus one extra
// --auto-opt entry, and one line per value with the game-seconds to each mark.
//   node sweep.mjs <id> --vary "policy:reset:e=interval>=5|interval>=10|always" [--opt "k=v;k2=v2"] [--pool 8]
//                  [--json out] <any run.mjs flags: --diff 1 --ticks N --marks f --marks-continue --stall S --stall-seen --wall-ms W>
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
const a = parseArgs(process.argv.slice(2), BOOL);
const id = a._[0];
if (!id || !a.vary) { console.error('usage: node sweep.mjs <id> --vary "key=v1|v2" [--opt "k=v"] [run.mjs flags]'); process.exit(2); }
const eq = String(a.vary).indexOf('=');
const key = String(a.vary).slice(0, eq), values = String(a.vary).slice(eq + 1).split('|');
const PLANNER_KEY = key.startsWith('planner:');
const pass = Object.entries(a).filter(([k]) => !['_', 'vary', 'opt', 'pool', 'json'].includes(k));

/** Why a line did not reach the stop mark, read off the round log — never guessed. */
function classifyDNF(rep, stopMark) {
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

function run(value) {
  return new Promise((resolve) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-sweep-'));
    const out = path.join(dir, 'r.json'), rounds = path.join(dir, 'rounds.json');
    const autoOpt = [a.opt, PLANNER_KEY ? null : `${key}=${value}`].filter(Boolean).join(';');
    const plannerOpt = [a['planner-opt'], PLANNER_KEY ? `${key.slice('planner:'.length)}=${value}` : null].filter(Boolean).join(';');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out, '--profile', 'all'];
    if (autoOpt) args.push('--auto-opt', autoOpt);
    for (const [k, v] of pass) {
      if (k === 'planner-opt') continue;                                  // rebuilt above
      if (k === 'planner') { args.push(`--planner=${v === true ? 'auto' : v}`); continue; }
      if (v === true) args.push(`--${k}`); else if (['marks', 'planner-ladder', 'from-snapshot'].includes(k)) args.push(`--${k}`, path.resolve(String(v))); else args.push(`--${k}`, String(v));
    }
    if (a.planner) { if (plannerOpt) args.push('--planner-opt', plannerOpt); args.push('--rounds-out', rounds); }
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => {
      let r;
      try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch { r = { ok: false, error: err.slice(-400) }; }
      if (a.planner) { try { r.plannerReport = JSON.parse(fs.readFileSync(rounds, 'utf8')); } catch {} }
      resolve(r);
    });
  });
}
const POOL = Number(a.pool || 8);
const results = new Array(values.length);
let next = 0;
await Promise.all(Array.from({ length: Math.min(POOL, values.length) }, async () => {
  while (next < values.length) { const i = next++; results[i] = await run(values[i]); }
}));
const stop = a['stop-mark'] ? String(a['stop-mark']) : null;
const lines = values.map((v, i) => {
  const r = results[i];
  const rep = r.plannerReport || null;
  const line = { value: v, ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hash: r.hash, stall: r.stall, marks: Object.fromEntries(Object.entries(r.marks || {}).map(([n, m]) => [n, m ? m.gameSeconds : null])), actions: r.hook?.actions, error: r.error };
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
});
for (const l of lines) console.log(JSON.stringify(l));
if (a.json) writeJSON(a.json, { id, key, opt: a.opt || null, plannerOpt: a['planner-opt'] || null, flags: Object.fromEntries(pass), lines, results: results.map(({ plannerReport, ...r }) => ({ ...r, plannerRounds: plannerReport ? plannerReport.log.length : undefined })) });
