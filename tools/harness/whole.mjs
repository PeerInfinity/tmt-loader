#!/usr/bin/env node
// whole-1 — THE WHOLE-GAME RUN, CHAINED: a fresh save under the shipped table alone, at the page's tick, through the
// ladder, in one-process LEGS of a fixed game-time, each resumed from the previous leg's stop snapshot (docs/harness.md,
// "The whole-game run").
//
//   node tools/harness/whole.mjs <id> --dir <snapshots dir> [--diff 0.05] [--leg-gs 2000] [--cap-gs 130000]
//        [--profile all] [--resume] [--legs-dir <dir>] [--progress <file.jsonl>]
//
// ⛔ A resumed leg equals the uninterrupted run exactly (measured whole-1: fresh → M04 at 0.05 in one process and as
// fresh → M02 + M02 → M04 land on the same tick and the same FULL hash at M02, M03 and M04), so the chain is the run.
// Each leg:
//   · boots from the last leg's STOP snapshot (`--from-snapshot`), the counters and the memory outside `player` with it;
//   · watches every mark NOT YET REACHED (a ladder of those alone, so a mark that holds out of ladder order — M26 after
//     M27 — is recorded at its own tick, never skipped and never recorded late);
//   · writes a mark's snapshot into `--dir` at the first tick it holds, and its own STOP snapshot into `--legs-dir`;
//   · appends one line to `--progress`: its ticks, game-seconds, wall time, the marks it reached, and the parts in force
//     (`stageHistory()`, the queue runner's records) at its stop.
// The run ends at the cap (`--cap-gs`, game-seconds since the fresh save), when every mark holds, or on an error.
// `--resume` continues a chain from the last line of `--progress`.
// `--summarize <out.json>`: write the RECORD of a finished chain (the marks, the stop, the legs' wall time, the stages'
// switches and the queues' runs, de-duplicated across legs) from `--progress` — what gates-whole reads.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO, parseArgs, entryOnly } from './lib.mjs';
import { runNode } from './run.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['resume']);
const KNOWN = new Set(['_', 'dir', 'diff', 'leg-gs', 'cap-gs', 'profile', 'resume', 'legs-dir', 'progress', 'ladder', 'auto-opt', 'summarize']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const id = a._[0];
if (!id || !a.dir) { console.error('usage: node whole.mjs <id> --dir <snapshots dir> [--diff 0.05] [--leg-gs 2000] [--cap-gs 130000]'); process.exit(2); }
const DIR = path.resolve(String(a.dir));
const LEGS = path.resolve(String(a['legs-dir'] || path.join(REPO, 'tools/harness/results', `whole-legs-${path.basename(DIR)}`)));
const PROGRESS = path.resolve(String(a.progress || path.join(LEGS, 'progress.jsonl')));
const DIFF = Number(a.diff ?? 0.05), LEG_GS = Number(a['leg-gs'] ?? 2000), CAP_GS = Number(a['cap-gs'] ?? 130000);
const LADDER = path.resolve(String(a.ladder || path.join(REPO, `tools/harness/ladder/${id}.json`)));
const L = JSON.parse(fs.readFileSync(LADDER, 'utf8'));
const MARKS = Array.isArray(L) ? L : L.marks;
if (a.summarize) { summarize(String(a.summarize)); process.exit(0); }
fs.mkdirSync(DIR, { recursive: true }); fs.mkdirSync(LEGS, { recursive: true });

// the chain's state: the marks reached so far, and where the next leg starts
function summarize(out) {
  const lines = fs.readFileSync(PROGRESS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  if (lines.some((l) => !l.ok)) throw new Error('the chain has a failed leg');
  const names = Object.fromEntries(MARKS.map((m) => [m.id, String(m.name || '').replace(/\*/g, '')]));
  let wall = 0;
  const marks = [], stages = [], queues = [], state = {}, qseen = {};
  for (const l of lines) {
    for (const m of l.marks) marks.push({ id: m.id, name: names[m.id], ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame, wallMs: wall + m.wallMs, leg: l.leg });
    for (const r of (l.parts && l.parts.stages) || []) {
      // a process's FIRST evaluation records what it finds in force: a switch only where the state changed
      if (state[r.stage] === r.on && !r.error) continue;
      state[r.stage] = r.on;
      stages.push({ stage: r.stage, on: r.on, ticks: r.tick, gameSeconds: Math.round(r.tick * DIFF * 1e6) / 1e6, ...(r.error ? { error: r.error } : {}) });
    }
    for (const q of (l.parts && l.parts.queues) || []) {
      const k = `${q.id}@${q.firedAt}`;
      if (q.firedAt === null || q.firedAt === undefined) continue;
      if (!qseen[k]) { qseen[k] = { id: q.id, startedAt: q.firedAt, endedAt: null, outcome: null }; queues.push(qseen[k]); }
      if (q.endedAt !== null && q.endedAt !== undefined) { qseen[k].endedAt = q.endedAt; qseen[k].outcome = q.outcome; qseen[k].state = q.state; }
    }
    wall += l.wallMs;
  }
  const last = lines[lines.length - 1];
  const rec = { format: 'tmt-whole/1', id: path.basename(LADDER, '.json'), note: 'written by tools/harness/whole.mjs --summarize: the whole-game run from a fresh save under the shipped table alone, chained in one-process legs (a resumed leg = the uninterrupted run, to the hash)',
    diff: DIFF, legGs: LEG_GS, capGs: CAP_GS, profile: String(a.profile || 'all'), commit: JSON.parse(fs.readFileSync(path.join(DIR, `${marks[0].id}.json`), 'utf8')).commit,
    marks: marks.sort((x, y) => x.ticks - y.ticks), notReached: MARKS.map((m) => m.id).filter((id) => !marks.some((x) => x.id === id)),
    stop: { ticks: last.ticks, gameSeconds: last.gameSeconds, hashGame: last.hashGame, wallMs: wall, inForce: last.parts && last.parts.inForce, points: last.parts && last.parts.points },
    stages, queues, legs: lines.map((l) => ({ leg: l.leg, ticks: l.ticks, gameSeconds: l.gameSeconds, wallMs: l.wallMs, ticksPerSec: l.ticksPerSec })) };
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(path.resolve(out), JSON.stringify(rec, null, 1) + '\n');
  console.log(`wrote ${out}: ${marks.length} marks, ${stages.length} stage switches, ${queues.length} queue runs, stop ${last.gameSeconds} game-s`);
}

let reached = {}, from = null, legNo = 0, gs = 0;
if (a.resume && fs.existsSync(PROGRESS)) {
  const lines = fs.readFileSync(PROGRESS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  for (const l of lines) { for (const m of l.marks) reached[m.id] = m; }
  const last = lines[lines.length - 1];
  if (last) { from = last.stop; legNo = last.leg; gs = last.gameSeconds; }
} else fs.writeFileSync(PROGRESS, '');

const EVAL = `({ stages: tmtLoader.stageHistory ? tmtLoader.stageHistory() : null,
  inForce: tmtLoader.stages ? tmtLoader.stages().filter(function (s) { return s.active; }).map(function (s) { return s.id; }) : null,
  queues: tmtLoader.queues && tmtLoader.queues.status ? tmtLoader.queues.status().queues.map(function (q) { return { id: q.id, state: q.state, outcome: q.outcome, runs: q.runs, firedAt: q.firedAt, endedAt: q.endedAt, last: q.last }; }) : null,
  points: String(player.points) })`;

while (gs < CAP_GS) {
  const todo = MARKS.filter((m) => !reached[m.id]);
  if (!todo.length) { console.log('every mark holds'); break; }
  legNo++;
  const name = `L${String(legNo).padStart(3, '0')}`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'whole-'));
  // a ladder of the marks not yet reached, behind a placeholder named after the leg's start (so `--from` slices after it)
  const ladderFile = path.join(tmp, 'ladder.json');
  const head = from ? [{ id: path.basename(from, '.json'), name: 'start of the leg', predicate: 'false' }] : [];
  fs.writeFileSync(ladderFile, JSON.stringify({ marks: [...head, ...todo] }));
  const ticks = Math.round(Math.min(LEG_GS, CAP_GS - gs) / DIFF);
  const o = { profile: String(a.profile || 'all'), diff: DIFF, ticks, ladder: ladderFile, stall: 1e9, snapshots: DIR,
    'stop-snapshot': LEGS, 'stop-snapshot-name': name, eval: EVAL, 'wall-ms': 6 * 3600e3 };
  if (a['auto-opt']) o['auto-opt'] = String(a['auto-opt']);
  if (from) o['from-snapshot'] = from;
  const t0 = Date.now();
  const r = runNode(id, o);
  const wallMs = Date.now() - t0;
  if (!r.ok) { console.error(`leg ${name} FAILED: ${r.failed_at} ${r.error}`); fs.appendFileSync(PROGRESS, JSON.stringify({ leg: legNo, name, ok: false, error: String(r.error).slice(0, 600) }) + '\n'); process.exit(1); }
  const startTicks = from ? JSON.parse(fs.readFileSync(from, 'utf8')).ticks : 0;
  const marks = (r.ladder ? r.ladder.reached : []).filter((m) => !reached[m.id]).map((m) => ({ ...m,
    // the wall time AT the mark: the leg's wall, apportioned by ticks (a leg's ticks cost about the same each)
    wallMs: Math.round(wallMs * (m.ticks - startTicks) / Math.max(1, r.ticks - startTicks)) }));
  for (const m of marks) reached[m.id] = { ...m, leg: legNo };
  gs = r.gameSeconds;
  from = path.join(LEGS, `${name}.json`);
  const line = { leg: legNo, name, ok: true, startTicks, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, wallMs, ticksPerSec: Math.round((r.ticks - startTicks) / (wallMs / 1000)),
    marks, stop: from, parts: r.eval };
  fs.appendFileSync(PROGRESS, JSON.stringify(line) + '\n');
  console.log(`${name} → ${r.ticks} ticks, ${r.gameSeconds} game-s, ${Math.round(wallMs / 1000)} s wall (${line.ticksPerSec} ticks/s)${marks.length ? ' · ' + marks.map((m) => `${m.id}@${m.gameSeconds}`).join(' ') : ''} · in force ${JSON.stringify(r.eval && r.eval.inForce)}`);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`stopped at ${gs} game-s (cap ${CAP_GS}); ${Object.keys(reached).length} marks reached`);
