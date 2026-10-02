#!/usr/bin/env node
// shipq-1 — SHIPPED CONDITIONAL QUEUES (docs/queues.md, "Shipped queues"): queues as parts of a game's automation table,
// started by a condition the template wrote, re-armed when they should be. ptr's proof: the H22 attempt, the stage
// `ql6-h22-attempt` before this slice, ships as the queue `ca-ch-h-22` on the SAME ticks and hashes.
//
//   node tools/harness/gates-shipq.mjs --part vocab|rearm|tpl|relies|accept|grep|push|page [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-shipq.mjs --part leg --leg <key> [--assert]          (one CI job per leg: qrate1.yml -f part=shipq)
//   node tools/harness/gates-shipq.mjs --part merge --dir <artifacts> [--only <key>] [--summary] [--assert]
//
// Part vocab   K1 the schema is ONE source: the `queues` list REQUIRES provenance, the provenance gate reads a queue's
//              records as `queue:<id>`, and the shipped table validates. K2 a bad entry fails the load BY NAME (an id used
//              twice, an id that is not the queue's, `each` without a cap or a cool-off, `once` with one, a `when` that
//              does not compile, a queue the runner refuses) — five boots, five reasons. K3 the record: a run whose
//              shipped queue never started writes NO `queues` block (the runtime record is the one it wrote before), one
//              whose queue ran writes it (owner `table`), and a restore of a record without it re-creates the queue armed.
// Part rearm   R1 `once` under a FLICKERING condition (true 3 game-s of every 6) runs once. R2 `each` with a cap of 3 and a
//              cool-off of 8 game-s: exactly 3 runs, every start ≥ 8 game-s after the previous end and only after the
//              condition read false, every run's end releases its hold (and the held feature acts between runs), then
//              `spent`. R3 a condition that THROWS reads as false and says so (status + one log record), never runs. R4 the
//              profile `off`, and a held feature switched off under `saved`, keep it from starting — and the readout says
//              which.
// Part tpl     T1 the template writes the shipped queue: strategize from m28/QL6 under the shipped table emits EXACTLY the
//              table's inline `ca-ch-h-22`, and its long wait's limit is the check's window (not the measured moment).
//              T2 every template-written queue (the four in the catalog and the shipped one) starts on a predicate with NO
//              numeric literal but the item's own id, is version 3, and carries `relies`. T3 the template's when, played
//              from a state where it is FALSE (all/M26: H22 not yet unlocked), does not start the queue.
// Part relies  L1 the catalog's H22 queue (checked with `exclude=challenges:h`) does NOT start under the shipped table, by
//              name (status, log), and does under the configuration it relies on. L2 the shipped queue under
//              `nativeYield=always` does not start at QL6, and says so.
// Part accept  A1 the table ALONE from all/M26 reaches M29, M28 and M30 on today's ticks and hashes (diff 1), twice equal;
//              A0 the table BEFORE this slice (C3 a stage) on the same.
// Part grep    X1 no game or ptr layer id in the generic code this slice changed.
// Part page    PG the au tab names the shipped queue armed (all/M26), running (m28/QL6), with a held feature's reason; the
//              copy API gives the player an editable copy that the runner never stores. G1 requests: ptr's automation
//              page asks for the runner exactly once (declared by its table) and nothing else new; no key is written into
//              the player's store; a plain page and a game whose table ships no queue ask for no runner.
// MEASUREMENTS (`.github/workflows/qrate1.yml -f part=shipq`, dispatch-only): the acceptance at diff 1 and 0.05 under the
// shipped table (A@…) and under the table before this slice (ctl@…), each leg TWICE (equal or RED); merge = equal ticks
// and hashes at M28 and M29 (and M30 at diff 1).
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { loadSchemaBlock, checkTables, checkProvenance } from '../auto-tables.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert', 'summary']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'dir', 'only', 'summary']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['vocab', 'rearm', 'tpl', 'relies', 'accept', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'page', 'push', 'leg', 'merge'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-shipq-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1800)}`); };

// ⚠ This file is the ORACLE, and ptr's ids are its data (the loader may not name them — part grep).
const TABLE = 'games-auto/ptr.json';
const TABLE_BEFORE = 'tools/harness/snapshots/ptr/shipq/table-before-shipq.json';
const LADDER = 'tools/harness/ladder/ptr.json';
const M26 = 'tools/harness/snapshots/ptr/all/M26.json', QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json', M09 = 'tools/harness/snapshots/ptr/all/M09.json';
const H22Q = 'ca-ch-h-22', C3 = 'ql6-h22-attempt';
const CATALOG_H22 = 'tools/harness/queues/h22/ch-h-22-from-QL6.json';
const CHOFF = 'policy:reset:q=rate-peak@0/0|turn@10/30x/5/0/100;exclude=challenges:h';    // the configuration the catalog's H22 queue was checked under
// ⚖ THE ACCEPTANCE (the brief; gates-stages / gates-m30 pins): the table alone from all/M26, diff 1
const PIN = { M29: { ticks: 81779, hashGame: 'be1df4037cbb5804' }, M28: { ticks: 85279, hashGame: '827cf164da85a931' }, M30: { ticks: 94521, hashGame: '132127d4d5573106' } };
const CATALOG = ['tools/harness/queues/m28/q23-from-Q308K.json', CATALOG_H22, 'tools/harness/queues/m30/rr-reset-sg-from-W226931.json', 'tools/harness/queues/m31/rr-reset-sg-from-R95400.json'];

function child(args, { timeoutMs = 6 * 3600e3 } = {}) {
  return new Promise((resolve) => {
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { out += d; });
    const t = setTimeout(() => c.kill('SIGKILL'), timeoutMs);
    c.on('close', (code) => { clearTimeout(t); resolve({ code, out }); });
  });
}
let seq = 0;
async function run(id, flags) {
  const f = path.join(TMP, `run-${id}-${++seq}.json`);
  const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', f];
  for (const [k, v] of Object.entries(flags)) {
    if (v === undefined || v === null || v === false || v === '') continue;
    if (Array.isArray(v)) for (const x of v) args.push(`--${k}`, String(x));
    else if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
  }
  const t0 = Date.now();
  const r = await child(args);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { wallMs: Date.now() - t0 }); } catch { return { ok: false, error: 'no result: ' + r.out.slice(-600), wallMs: Date.now() - t0 }; }
}
async function strategize(game, extra) {
  const f = path.join(TMP, `strat-${++seq}.json`), q = path.join(TMP, `strat-q-${seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, '--out', q, ...extra]);
  let v = null, queue = null;
  try { v = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* */ }
  try { queue = JSON.parse(fs.readFileSync(q, 'utf8')); } catch { /* */ }
  return { code: r.code, out: r.out, v, queue };
}
async function pool(fns) {
  const out = new Array(fns.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, fns.length) }, async () => { while (i < fns.length) { const k = i++; out[k] = await fns[k](); } }));
  return out;
}
const logRecords = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const tableDoc = () => fixture(TABLE);
const writeTmp = (name, obj) => { const f = path.join(TMP, name); fs.writeFileSync(f, JSON.stringify(obj, null, 1)); return f; };
const shippedOf = (t, id = H22Q) => (t.queues || []).find((q) => q.id === id);
/** The shipped table plus one more shipped queue (a test entry: data the gate constructs, never shipped). */
function withQueue(entry, base = tableDoc()) { const t = JSON.parse(JSON.stringify(base)); t.queues = [...(t.queues || []), entry]; return t; }
const PROBE_PROV = { unverified: true, note: 'gates-shipq probe — constructed by the gate, never shipped' };
const QSTATUS = (id) => `(function(){ var s = tmtLoader.queues && tmtLoader.queues.status ? tmtLoader.queues.status().queues.filter(function(x){ return x.id === ${JSON.stringify(id)}; })[0] : null; return s ? { state: s.state, holds: s.holds, runs: s.shipped && s.shipped.runs, phase: s.shipped && s.shipped.phase, text: s.shipped ? s.shipped.text : s.stateText, reliesWhy: s.reliesWhy, cond: s.shipped && s.shipped.conditionError, cur: s.current && s.current.do } : null; })()`;

// ---- Part vocab --------------------------------------------------------------------------------------------------------
async function partVocab() {
  // K1
  {
    const blk = loadSchemaBlock(REPO);
    const qs = blk.TABLE_SCHEMA.properties.queues;
    const t = tableDoc();
    const noProv = JSON.parse(JSON.stringify(t)); delete noProv.queues[0].provenance;
    const errNoProv = blk.schemaErrors(noProv, blk.TABLE_SCHEMA, 'ptr.json');
    const badCommit = JSON.parse(JSON.stringify(t)); badCommit.queues[0].provenance = { gate: 'shipq-K1', commit: 'deadbee', note: 'a record whose commit is not frozen' };
    const pv = checkProvenance(badCommit, { labels: [], known: () => false });
    const c = checkTables(REPO);
    const checks = {
      schemaFresh: !c.problems.length && c.rows.every((r) => r.ok),
      requiresProvenance: !!qs && qs.items.required.includes('provenance') && errNoProv.some((e) => /missing "provenance"/.test(e)),
      gateReadsQueueRecords: pv.bad.some((b) => b.startsWith(`queue:${H22Q}:`)),
      shipsTheQueueNotTheStage: !!shippedOf(t) && !(t.stages || []).some((s) => s.id === C3),
    };
    row({ gate: 'K1 the `queues` schema is ONE source, REQUIRES provenance, and the provenance gate reads a queue\'s records', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — no-provenance errors ${JSON.stringify(errNoProv.slice(0, 2))}; bad-commit ${JSON.stringify(pv.bad.slice(0, 1))}; queues ${(t.queues || []).map((q) => q.id).join(', ')}` });
  }
  // K2 — five bad tables, five boots refused by name
  {
    const t = tableDoc(), s = shippedOf(t);
    const bad = {
      twice: (() => { const x = JSON.parse(JSON.stringify(t)); x.queues.push(JSON.parse(JSON.stringify(s))); return [x, /the id is used twice/]; })(),
      idMismatch: (() => { const x = JSON.parse(JSON.stringify(t)); x.queues[0].id = 'another-id'; return [x, /the entry and its queue carry one id/]; })(),
      eachNoCap: (() => { const x = JSON.parse(JSON.stringify(t)); x.queues[0].rearm = 'each'; return [x, /rearm "each" needs "cap"/]; })(),
      onceWithCool: (() => { const x = JSON.parse(JSON.stringify(t)); x.queues[0].coolOff = { gs: 5 }; return [x, /belong to rearm "each"/]; })(),
      runnerRefuses: (() => { const x = JSON.parse(JSON.stringify(t)); x.queues[0].queue.steps[0].features = ['reset:nowhere']; return [x, /shipped queues were refused[^]*no automation feature "reset:nowhere"/]; })(),
    };
    const keys = Object.keys(bad);
    const res = await pool(keys.map((k) => () => run('ptr', { profile: 'all', ticks: 1, 'auto-table': writeTmp(`bad-${k}.json`, bad[k][0]) })));
    const got = keys.map((k, i) => [k, !res[i].ok && bad[k][1].test(String(res[i].error || '')), String(res[i].error || '').slice(0, 140)]);
    row({ gate: 'K2 a bad shipped-queue entry fails the load BY NAME (twice, id ≠ queue id, each without cap/cool-off, once with one, a queue the runner refuses)', id: 'ptr', ok: got.every((g) => g[1]),
      notes: got.map((g) => `${g[0]} ${g[1] ? '✓' : '✗'} (${g[2]})`).join('; ') });
  }
  // K3 — the runtime record: unchanged while the queue never started; written once it ran; re-created on restore
  {
    const EV = "(function(){ var rt = tmtLoader.runtimeState(); var t = JSON.stringify(rt); return { hasQueues: t.indexOf('\"owner\":\"table\"') >= 0, keys: Object.keys(rt.auto || rt).sort() }; })()";
    const [pre, off, ran] = await pool([
      () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 50, eval: EV }),
      () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 50, 'auto-opt': 'shippedQueues=off', eval: EV }),
      () => run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: 20, eval: EV, 'stop-snapshot': TMP, 'stop-snapshot-name': 'K3' }),
    ]);
    // the record that has the queue running is restored: the queue goes on from where it was (holds and step)
    const snap = path.join(TMP, 'K3.json');
    const back = fs.existsSync(snap) ? await run('ptr', { 'from-snapshot': snap, profile: 'all', ticks: 1, eval: QSTATUS(H22Q) }) : { ok: false };
    const fresh = await run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 1, eval: QSTATUS(H22Q) });
    const checks = {
      ran: !!pre.ok && !!off.ok && !!ran.ok && !!back.ok && !!fresh.ok,
      pristineWritesNothing: !!pre.eval && !pre.eval.hasQueues && JSON.stringify(pre.eval.keys) === JSON.stringify(off.eval && off.eval.keys) && pre.hashGame === off.hashGame,
      aRunWritesIt: !!ran.eval && ran.eval.hasQueues,
      restoredRunning: !!back.eval && back.eval.state === 'running' && back.eval.holds.length === 5,
      freshIsArmed: !!fresh.eval && fresh.eval.state === 'armed' && fresh.eval.runs === 0,
    };
    row({ gate: 'K3 the record: a never-started shipped queue writes nothing (= shippedQueues=off), a running one is written and restored, a record without it re-arms it', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — M26+50 ${pre.hashGame} keys ${JSON.stringify(pre.eval && pre.eval.keys)} (off ${off.hashGame}); QL6+20 has ${ran.eval && ran.eval.hasQueues}; restored ${JSON.stringify(back.eval)}; fresh ${JSON.stringify(fresh.eval)}` });
  }
}

// ---- Part rearm --------------------------------------------------------------------------------------------------------
// The flicker: true for 3 game-s of every 6 — a condition no measured row stands behind; the GATE constructs it to drive
// the re-arm rules (the shipped table carries no `each` entry). From all/M09 (the clock runs: p is unlocked).
const FLICKER = 'Math.floor(player.timePlayed / 3) % 2 === 0';
const probeQueue = (id) => ({ format: 'tmt-queue/1', version: 2, id, name: 'flicker probe', source: 'authored',
  // no `release` step: the END must release the hold, every run (the rule a re-armed queue rests on)
  steps: [{ do: 'hold', features: ['reset:p'] }, { do: 'wait', until: 'false', timeout: { gs: 1 }, onTimeout: 'skip', comment: 'one game-second' }] });
async function partRearm() {
  const once = withQueue({ id: 'probe-once', when: FLICKER, queue: probeQueue('probe-once'), provenance: PROBE_PROV });
  const each = withQueue({ id: 'probe-each', when: FLICKER, rearm: 'each', cap: 3, coolOff: { gs: 8 }, queue: probeQueue('probe-each'), provenance: PROBE_PROV });
  const thr = withQueue({ id: 'probe-throw', when: 'player.noSuchThing.gt(0)', queue: probeQueue('probe-throw'), provenance: PROBE_PROV });
  const lo = path.join(TMP, 'once.jsonl'), le = path.join(TMP, 'each.jsonl'), lt = path.join(TMP, 'throw.jsonl');
  const fOnce = writeTmp('t-once.json', once), fEach = writeTmp('t-each.json', each), fThr = writeTmp('t-throw.json', thr);
  // mid-cool-off (8 ticks in: run 1 ended, run 2 not yet started) — nothing held, the feature deciding again
  const EVH = `(function(){ return { held: tmtLoader.queueLink.holds, active: tmtLoader.featureState('reset:p').active, status: ${QSTATUS('probe-each')} }; })()`;
  const [r1, r2, r3, r4off, r4saved, mid] = await pool([
    () => run('ptr', { 'from-snapshot': M09, profile: 'all', ticks: 80, 'auto-table': fOnce, log: lo, eval: QSTATUS('probe-once') }),
    () => run('ptr', { 'from-snapshot': M09, profile: 'all', ticks: 80, 'auto-table': fEach, log: le, eval: QSTATUS('probe-each') }),
    () => run('ptr', { 'from-snapshot': M09, profile: 'all', ticks: 30, 'auto-table': fThr, log: lt, eval: QSTATUS('probe-throw') }),
    () => run('ptr', { 'from-snapshot': M09, profile: 'off', ticks: 30, 'auto-table': fOnce, eval: QSTATUS('probe-once') }),
    () => run('ptr', { 'from-snapshot': M09, profile: 'saved', ticks: 30, 'auto-table': fOnce, eval: QSTATUS('probe-once') }),
    () => run('ptr', { 'from-snapshot': M09, profile: 'all', ticks: 8, 'auto-table': fEach, eval: EVH }),
  ]);
  const qrecs = (f, id) => logRecords(f).filter((r) => r.type === 'queue' && r.queue === id);
  // R1
  {
    const q = qrecs(lo, 'probe-once'), trig = q.filter((r) => r.do === 'trigger');
    const checks = { ran: !!r1.ok, oneRun: trig.length === 1, done: !!r1.eval && r1.eval.state === 'done' && r1.eval.runs === 1 && !r1.eval.holds.length };
    row({ gate: 'R1 `once` under a flickering condition (true 3 game-s of every 6, 80 ticks): ONE run', id: 'ptr', ok: Object.values(checks).every(Boolean), notes: `${ck(checks)} — triggers at ${JSON.stringify(trig.map((r) => r.gs))}; ${JSON.stringify(r1.eval)}` });
  }
  // R2
  {
    const recs = logRecords(le), q = recs.filter((r) => r.type === 'queue' && r.queue === 'probe-each');
    const trig = q.filter((r) => r.do === 'trigger').map((r) => r.gs), ends = q.filter((r) => r.do === 'end');
    const flick = (gs) => Math.floor(gs / 3) % 2 === 0;
    const gaps = trig.slice(1).map((t, i) => Math.round((t - ends[i].gs) * 1e6) / 1e6);
    // between two runs the condition read FALSE at least once (an edge, not a level): some whole game-second in between is a false one
    const sawFalse = trig.slice(1).every((t, i) => { for (let g = Math.ceil(ends[i].gs); g < t; g++) if (!flick(g)) return true; return false; });
    const holds = q.filter((r) => r.do === 'hold').length, rels = q.filter((r) => r.do === 'release').length;
    const m = mid.eval || {};
    const checks = {
      ran: !!r2.ok,
      threeRunsTheCap: trig.length === 3 && q.filter((r) => r.do === 'spent').length === 1 && !!r2.eval && r2.eval.phase === 'spent' && r2.eval.runs === 3,
      coolOffKept: gaps.length === 2 && gaps.every((g) => g >= 8),
      edgeNotLevel: sawFalse,
      everyRunReleased: ends.length === 3 && holds === 3 && rels === 0 && ends.every((e) => e.released === 1) && q.filter((r) => r.do === 'rearm').length === 2,
      // between two runs, nothing is held and the feature decides again (the re-armed queue starts holding nothing)
      nothingHeldBetween: !!mid.ok && m.held === null && m.active === true && !!m.status && m.status.state === 'armed' && m.status.runs === 1 && !m.status.holds.length,
      nothingHeldAtTheEnd: !!r2.eval && !r2.eval.holds.length,
    };
    row({ gate: 'R2 `each` (cap 3, cool-off 8 game-s) under the flicker: 3 runs, each ≥ 8 game-s after the last end and after a false reading, every hold released, then spent', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — starts ${JSON.stringify(trig)}; ends ${JSON.stringify(ends.map((e) => e.gs))}; gaps ${JSON.stringify(gaps)}; holds ${holds} / releases ${rels}; between runs ${JSON.stringify(m)}; ${JSON.stringify(r2.eval)}` });
  }
  // R3
  {
    const q = qrecs(lt, 'probe-throw');
    const checks = { ran: !!r3.ok, neverRan: !!r3.eval && r3.eval.state === 'armed' && r3.eval.runs === 0 && !q.some((r) => r.do === 'trigger'),
      saysSo: !!r3.eval && !!r3.eval.cond && /could not be read/.test(r3.eval.text), oneRecord: q.filter((r) => r.do === 'condition' && r.error).length === 1 };
    row({ gate: 'R3 a condition that THROWS reads as false, never starts the queue, and says so (status, one log record)', id: 'ptr', ok: Object.values(checks).every(Boolean), notes: `${ck(checks)} — ${JSON.stringify(r3.eval)}` });
  }
  // R4
  {
    const checks = { ran: !!r4off.ok && !!r4saved.ok,
      profileOff: !!r4off.eval && r4off.eval.runs === 0 && r4off.eval.phase === 'off' && /profile off/.test(r4off.eval.text),
      savedFeatureOff: !!r4saved.eval && r4saved.eval.runs === 0 && r4saved.eval.phase === 'off' && /reset:p is switched off/.test(r4saved.eval.text) };
    row({ gate: 'R4 a shipped queue acts only where the automation does: not under the profile off, not while a feature it holds is switched off — and the readout says which', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — off ${JSON.stringify(r4off.eval)}; saved ${JSON.stringify(r4saved.eval)}` });
  }
}

// ---- Part tpl ----------------------------------------------------------------------------------------------------------
/** The numeric literals of an expression once the item's own ids are taken out — a state literal is anything left. */
function stateLiterals(expr, ids) {
  let s = String(expr);
  for (const id of ids) s = s.replace(new RegExp(`(^|[^\\w.])${id}(?![\\w.])`, 'g'), '$1').replace(new RegExp(`"${id}"`, 'g'), '""');
  // `0` is not a reading of any state (an empty purse, a challenge with no completion) — every other number is
  return (s.match(/(?<![\w$])\d+(\.\d+)?(e[+-]?\d+)?/gi) || []).filter((n) => Number(n) !== 0);
}
const goalIds = (q) => { const g = String((q.source && q.source.goal) || '').split(':'); return g.length === 3 ? [g[2]] : []; };
async function partTpl() {
  const t = tableDoc(), s = shippedOf(t);
  const [st, m26] = await pool([
    () => strategize('ptr', ['--from', QL6, '--goal', 'ch:h:22']),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 200, eval: `(function(){ var w = ${JSON.stringify(s.queue.trigger.when)}, b = ${JSON.stringify(s.when)}; return { when: !!tmtLoader.predicate(w)(), boundary: !!tmtLoader.predicate(b)(), status: ${QSTATUS(H22Q)} }; })()` }),
  ]);
  // T1
  {
    const v = st.v && st.v.results && st.v.results.find((r) => r.template === 'challenge-attempt'), q = st.queue;
    const long = q && q.steps.find((x) => x.do === 'wait' && /canCompleteChallenge/.test(x.until));
    const checks = { ran: st.code === 0 && !!v && v.verdict === 'complete', emittedIsShipped: !!q && JSON.stringify(q) === JSON.stringify(s.queue),
      limitIsTheWindow: !!long && !!v && long.timeout.gs === v.window && long.timeout.gs !== v.tStar.gameSeconds + 10 };
    row({ gate: 'T1 the template writes the shipped queue: strategize from m28/QL6 under the shipped table = the table\'s inline ca-ch-h-22; its long wait\'s limit is the check\'s window', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — verdict ${v && v.verdict} (${v && v.tStar && v.tStar.gameSeconds} game-s, window ${v && v.window}); limit ${long && long.timeout.gs}; when ${q && q.trigger && q.trigger.when}` });
  }
  // T2
  {
    // the committed ones, and the one the template writes NOW (T1's) — a template that bakes a state number in is seen here
    const all = [...CATALOG.map((f) => [f, fixture(f)]), [`${TABLE} queues[${H22Q}]`, s.queue], ['strategize m28/QL6 (now)', st.queue || {}]];
    const res = all.map(([f, q]) => {
      const w = q.trigger && q.trigger.when, lits = w ? stateLiterals(w, goalIds(q)) : ['(no when)'];
      const okv = q.trigger && q.trigger.on === 'predicate' && !lits.length && q.version === 3 && !!q.relies && !!q.relies.options;
      return [f, okv, lits];
    });
    row({ gate: 'T2 every template-written queue (4 in the catalog, the shipped one, and T1\'s emitted now) starts on a predicate with NO numeric literal but its item\'s id, is version 3 and carries `relies`', id: 'ptr', ok: res.every((r) => r[1]),
      notes: res.map((r) => `${path.basename(r[0])} ${r[1] ? '✓' : '✗'}${r[2].length ? ' literals ' + JSON.stringify(r[2]) : ''}`).join('; ') });
  }
  // T3
  {
    // at all/M26 H22 is ALREADY open (H21 is done): the template's condition holds there, and the queue waits for the
    // table's own boundary — the 6th Quirk Layer, where the check was made (the template says where it CAN apply, the
    // table where it was measured to be worth it)
    const checks = { ran: !!m26.ok, templateWhenHoldsThere: !!m26.eval && m26.eval.when === true, tableBoundaryDoesNot: !!m26.eval && m26.eval.boundary === false,
      notStarted: !!m26.eval && !!m26.eval.status && m26.eval.status.state === 'armed' && m26.eval.status.runs === 0 };
    row({ gate: 'T3 at all/M26 + 200 ticks the template\'s condition holds (H22 is open) but the table\'s boundary (6 Quirk Layers) does not: the shipped queue waits armed for both', id: 'ptr', ok: Object.values(checks).every(Boolean), notes: `${ck(checks)} — ${JSON.stringify(m26.eval)}` });
  }
}

// ---- Part relies -------------------------------------------------------------------------------------------------------
async function partRelies() {
  const lr = path.join(TMP, 'relies.jsonl');
  const [noEx, withEx, ny] = await pool([
    () => run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: 20, queue: CATALOG_H22, 'auto-opt': 'shippedQueues=off', log: lr, eval: QSTATUS(H22Q) }),
    () => run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: 20, queue: CATALOG_H22, 'auto-opt': CHOFF, eval: QSTATUS(H22Q) }),
    () => run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: 20, 'auto-opt': 'nativeYield=always', eval: QSTATUS(H22Q) }),
  ]);
  {
    const q = logRecords(lr).filter((r) => r.type === 'queue' && r.queue === H22Q);
    const checks = { ran: !!noEx.ok && !!withEx.ok,
      refusedByName: !!noEx.eval && noEx.eval.state === 'armed' && /exclude = challenges:h/.test(String(noEx.eval.reliesWhy)) && q.filter((r) => r.do === 'relies').length === 1 && !q.some((r) => r.do === 'trigger'),
      startsUnderItsConfiguration: !!withEx.eval && withEx.eval.state === 'running' && !withEx.eval.reliesWhy };
    row({ gate: 'L1 `relies` is read at START: the catalog\'s H22 queue (checked with exclude=challenges:h) does not start under the shipped table, by name, and starts under its own configuration', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — shipped table ${JSON.stringify(noEx.eval)}; ${CHOFF} ${JSON.stringify(withEx.eval)}` });
  }
  {
    const checks = { ran: !!ny.ok, notStarted: !!ny.eval && ny.eval.state === 'armed' && ny.eval.runs === 0 && ny.eval.phase === 'relies' && /nativeYield = slot, and it is always/.test(String(ny.eval.text)) };
    row({ gate: 'L2 the shipped queue under nativeYield=always (it was checked under slot) does not start at QL6, and its readout says why', id: 'ptr', ok: Object.values(checks).every(Boolean), notes: `${ck(checks)} — ${JSON.stringify(ny.eval)}` });
  }
}

// ---- Part accept -------------------------------------------------------------------------------------------------------
const reachedOf = (x) => Object.fromEntries(((x.ladder && x.ladder.reached) || []).map((m) => [m.id, { ticks: m.ticks, hashGame: m.hashGame }]));
async function partAccept() {
  const base = { 'from-snapshot': M26, profile: 'all', diff: 1, ticks: 20000, ladder: LADDER, to: 'M30', 'until-all': true, 'marks-continue': true };
  const [x, y, z] = await pool([() => run('ptr', base), () => run('ptr', base), () => run('ptr', Object.assign({ 'auto-table': TABLE_BEFORE }, base))]);
  const rx = reachedOf(x), ry = reachedOf(y), rz = reachedOf(z);
  const onPin = (r) => ['M29', 'M28', 'M30'].every((m) => r[m] && r[m].ticks === PIN[m].ticks && r[m].hashGame === PIN[m].hashGame);
  {
    const checks = { ran: !!x.ok && !!y.ok, onThePins: onPin(rx), twiceEqual: JSON.stringify(rx) === JSON.stringify(ry) && x.hashGame === y.hashGame };
    row({ gate: 'A1 the SHIPPED TABLE ALONE (H22 as the queue ca-ch-h-22) from all/M26 reaches M29, M28 and M30 on today\'s ticks and hashes (diff 1), twice equal', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${['M29', 'M28', 'M30'].map((m) => `${m} ${rx[m] ? rx[m].ticks + ' / ' + rx[m].hashGame : 'NOT reached'}`).join('; ')} (pins ${JSON.stringify(PIN)}); wall ${Math.round(x.wallMs / 1000)} s` });
  }
  {
    const checks = { ran: !!z.ok, onThePins: onPin(rz) };
    row({ gate: 'A0 the table BEFORE this slice (C3 a stage) — the same ticks and hashes: the queue changed nothing in the game', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${['M29', 'M28', 'M30'].map((m) => `${m} ${rz[m] ? rz[m].ticks + ' / ' + rz[m].hashGame : 'NOT reached'}`).join('; ')}` });
  }
}

// ---- Part grep ---------------------------------------------------------------------------------------------------------
function partGrep() {
  // the same grep as gates-m30 / gates-m31 X1 (ptr's layer ids as a list: `au` is the loader's own layer, and the core,
  // tmt-auto.js, is grepped whole by gates-stages X1)
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-queue.js', 'loader/tmt-templates.js', 'loader/attach.mjs', 'tools/harness/strategize.mjs'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the generic code this slice changed (runner, templates, attach, strategize)', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

// ---- Part page ---------------------------------------------------------------------------------------------------------
async function partPage() {
  const { chromium } = await import('playwright');
  const { openContext, openGame, pageLoadFrom } = await import('./page.mjs');
  const browser = await chromium.launch(), server = await startServer(REPO);
  const RUNNER = /loader\/tmt-queue\.js/, EDITOR = /(loader\/tmt-qedit\.js|games-queues\/)/;
  const KEY = 'tmt-loader:ptr:queues';
  const f = [], g = [];
  let pgNotes = '', g1Notes = '';
  try {
    // PG — the readout, armed then running, and the copy
    {
      const { context, stats } = await openContext(browser);
      const page = await context.newPage();
      const errs = []; page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
      const ld = await openGame(page, server.url, 'ptr', { profile: 'all' });
      if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
      // G1 counts the FIRST load (the readout below reloads the page twice to load saves, and each load asks again)
      await page.evaluate(() => tmtLoader.tick(1, 30));
      const urls0 = stats.of(page).urls.slice();
      const ks0 = await page.evaluate(() => Object.keys(localStorage));
      const stamp = (file) => { const p = JSON.parse(fixture(file).player); p.time = Date.now(); p.offTime = null; return JSON.stringify(p); };
      const view = async () => page.evaluate(() => {
        showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced';
        updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats();
        return null;
      }).then(() => page.waitForTimeout(400)).then(() => page.evaluate(() => {
        const b = document.querySelector('.tmtl-queue[data-queue="ca-ch-h-22"]');
        return { block: b ? b.innerText : null, state: b ? b.getAttribute('data-state') : null, body: document.body.innerText };
      }));
      await pageLoadFrom(page, stamp(M26));
      await page.evaluate(() => tmtLoader.pause());
      await page.evaluate(() => tmtLoader.tick(0.05, 40));
      const armed = await view();
      await pageLoadFrom(page, stamp(QL6));
      await page.evaluate(() => tmtLoader.pause());
      await page.evaluate(() => tmtLoader.tick(0.05, 40));
      const running = await view();
      const copy = await page.evaluate(() => { const c = tmtLoader.queues.copyShipped('ca-ch-h-22'); return { ok: c.ok, id: c.id, name: c.queue && c.queue.name, trigger: c.queue && c.queue.trigger, valid: c.queue ? tmtLoader.queues.validate(c.queue) : null }; });
      const keyAfter = await page.evaluate((k) => tmtLoader.storage.raw.getItem.call(localStorage, k), KEY);
      if (!armed.block || !/shipped queue/.test(armed.block) || !/armed — waiting for its condition/.test(armed.block)) f.push(`armed view: ${JSON.stringify(armed.block)}`);
      if (!running.block || !/running/.test(running.block) || running.state !== 'running' || !/holding: [^\n]*reset:q/.test(running.block)) f.push(`running view: ${JSON.stringify(running.block)}`);
      if (!/Held by queue ca-ch-h-22/.test(running.body)) f.push('no feature says it is held by the shipped queue');
      if (!copy.ok || copy.id !== 'ca-ch-h-22-copy' || !/^copy of/.test(String(copy.name)) || !copy.valid || copy.valid.length || !/gte\(6\)/.test(String(copy.trigger && copy.trigger.when))) f.push(`copy ${JSON.stringify(copy)}`);
      if (keyAfter !== null) f.push(`the player's store was written: ${String(keyAfter).slice(0, 80)}`);
      if (errs.length) f.push(`page errors ${JSON.stringify(errs.slice(0, 2))}`);
      pgNotes = `armed: ${String(armed.block).replace(/\s+/g, ' ').slice(0, 160)} | running: ${String(running.block).replace(/\s+/g, ' ').slice(0, 220)} | copy ${copy.id} (${copy.name})`;
      // G1, ptr's own page: the runner once, nothing else new, no store key
      const urls = urls0;
      const nRunner = urls.filter((u) => RUNNER.test(u)).length, nEditor = stats.of(page).urls.filter((u) => EDITOR.test(u)).length;
      if (nRunner !== 1) g.push(`ptr automation page requested the runner ${nRunner} time(s) on its first load`);
      if (nEditor) g.push(`ptr automation page requested the editor or the catalog (${nEditor})`);
      const ks = await page.evaluate(() => Object.keys(localStorage));
      if ([...ks0, ...ks].some((k) => /:queues$/.test(k))) g.push(`a queues key exists: ${[...ks0, ...ks].filter((k) => /:queues$/.test(k))}`);
      g1Notes = `ptr automation, first load: runner ×${nRunner} of ${urls.length} requests; editor/catalog ×${nEditor} over the whole session; no queues key`;
      await context.close();
    }
    // G1 — a plain page, and a game whose table ships no queue
    for (const [id, opts, label] of [['ptr', { automation: false }, 'ptr plain'], ['something', { profile: 'all' }, 'something automation (no table queue)']]) {
      const { context, stats } = await openContext(browser);
      const page = await context.newPage();
      const ld = await openGame(page, server.url, id, opts);
      if (!ld.ready) g.push(`${label} did not load`);
      await page.evaluate(() => tmtLoader.tick(1, 30));
      const n = stats.of(page).urls.filter((u) => RUNNER.test(u) || EDITOR.test(u)).length;
      if (n) g.push(`${label} requested the runner or the editor (${n})`);
      g1Notes += `; ${label}: ${n}`;
      await context.close();
    }
  } finally { await browser.close(); server.stop(); }
  row({ gate: 'PG the au tab names the shipped queue: armed (all/M26), running and holding (m28/QL6), the held features name it; copyShipped gives an editable copy and stores nothing', id: 'ptr', ok: !f.length, notes: f.length ? f.join('; ') : pgNotes });
  row({ gate: 'G1 requests: the runner exactly once where the table DECLARES a queue, nothing else new, no store key; a plain page and a table without queues ask for none', id: 'ptr', ok: !g.length, notes: g.length ? g.join('; ') : g1Notes });
}

// ---- Part leg / merge (measurement) ------------------------------------------------------------------------------------
const LEGS = {
  'A@1': { diff: 1, table: 'shipped', to: 'M30', ticks: 20000 },
  'ctl@1': { diff: 1, table: 'before', to: 'M30', ticks: 20000 },
  'A@0.05': { diff: 0.05, table: 'shipped', to: 'M29', ticks: 400000 },
  'ctl@0.05': { diff: 0.05, table: 'before', to: 'M29', ticks: 400000 },
};
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  const from = fixture(M26);
  const legs = await Promise.all([0, 1].map(async () => {
    const r = await run('ptr', { 'from-snapshot': M26, profile: 'all', diff: L.diff, ticks: L.ticks, ladder: LADDER, to: L.to, 'until-all': true, 'marks-continue': true,
      'auto-table': L.table === 'before' ? TABLE_BEFORE : null, eval: QSTATUS(H22Q), 'wall-ms': 5.3 * 3600e3 });
    const reached = Object.fromEntries(((r.ladder && r.ladder.reached) || []).map((m) => [m.id, { ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame }]));
    return { ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, reached, eval: r.eval, wallMs: r.wallMs, error: r.error };
  }));
  const [x, y] = legs;
  const eq = x.ticks === y.ticks && x.hashGame === y.hashGame && JSON.stringify(x.reached) === JSON.stringify(y.reached);
  const since = (m) => (x.reached[m] ? Math.round((x.reached[m].gameSeconds - from.gameSeconds) * 1000) / 1000 : null);
  const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, m28: since('M28'), m29: since('M29'), m30: since('M30'), legs };
  row({ gate: `M-leg ${a.leg} — ${L.table === 'before' ? 'the table before shipq-1 (C3 a stage)' : 'the shipped table (H22 the queue)'} from all/M26 at diff ${L.diff}, twice equal`, id: 'ptr', ok: eq && !!x.ok && outj.m28 !== null && outj.m29 !== null,
    notes: `M29 ${outj.m29 === null ? 'NOT reached' : `+${outj.m29} (tick ${x.reached.M29.ticks}, ${x.reached.M29.hashGame})`}; M28 ${outj.m28 === null ? 'NOT reached' : `+${outj.m28} (tick ${x.reached.M28.ticks}, ${x.reached.M28.hashGame})`}; M30 ${outj.m30 === null ? '—' : `+${outj.m30} (tick ${x.reached.M30.ticks}, ${x.reached.M30.hashGame})`}; queue ${JSON.stringify(x.eval)}; twice equal ${eq}; wall ${legs.map((l) => Math.round((l.wallMs || 0) / 1000)).join(' / ')} s ${x.error || ''}` });
  fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `shipq-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(outj, null, 1) + '\n');
}
const MERGED = a.only ? [String(a.only)] : Object.keys(LEGS);
if (a.only && !LEGS[a.only]) { console.error(`REFUSED: --only ${a.only} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /shipq-leg-[^/]*\.json$/.test(f)) : [];
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const J = (k) => got[`shipq-leg-${k.replace(/[^\w.-]/g, '_')}.json`];
  for (const k of MERGED) {
    const j = J(k), r = j && j.legs[0].reached.M29;
    row({ gate: `shipq-${k} M-merge`, id: 'ptr', leg: j ? `${j.table} from all/M26` : null, ticks: r ? r.ticks : null, gameSeconds: r ? r.gameSeconds : null, diff: j ? j.diff : null, hash: r ? r.hashGame : null,
      ok: !!j && j.twiceEqual && j.m28 !== null && j.m29 !== null,
      notes: j ? `M29 +${j.m29} (${r && r.hashGame}) · M28 +${j.m28} (${j.legs[0].reached.M28 && j.legs[0].reached.M28.hashGame})${j.m30 === null ? '' : ` · M30 +${j.m30} (${j.legs[0].reached.M30.hashGame})`} game-s from all/M26 (diff ${j.diff}); commit ${j.commit}; twice equal ${j.twiceEqual}` : 'MISSING — the leg did not run or its artifact was not found' });
  }
  if (!a.only) for (const d of ['1', '0.05']) {
    const A = J(`A@${d}`), C = J(`ctl@${d}`);
    const same = !!A && !!C && ['M29', 'M28', 'M30'].every((m) => JSON.stringify(A.legs[0].reached[m] || null) === JSON.stringify(C.legs[0].reached[m] || null));
    row({ gate: `shipq-equal@${d} the shipped queue = the stage it replaced: M29, M28${d === '1' ? ', M30' : ''} on the same ticks and hashes at diff ${d}`, id: 'ptr', ok: same,
      notes: A && C ? `queue ${JSON.stringify(A.legs[0].reached)} | stage ${JSON.stringify(C.legs[0].reached)}` : 'MISSING a leg' });
  }
}

const EXPECT = { vocab: 3, rearm: 4, tpl: 3, relies: 2, accept: 2, grep: 1, page: 2, leg: 1, merge: MERGED.length + (a.only ? 0 : 2) };
const FN = { vocab: partVocab, rearm: partRearm, tpl: partTpl, relies: partRelies, accept: partAccept, grep: partGrep, page: partPage, leg: partLeg, merge: partMerge };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT shipq ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (PART === 'merge' && a.summary) appendSection({ title: 'Gate shipq merge — the H22 attempt as a shipped queue (`node tools/harness/gates-shipq.mjs --part merge --summary`)', commit, dirty, rows,
  reading: 'each leg ran TWICE (equal or RED); ticks / gameSeconds / hash are M29\'s; A = the shipped table (H22 the queue ca-ch-h-22), ctl = the table before shipq-1 (the stage ql6-h22-attempt); the merged legs\' own commit is in each row\'s notes.' });
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-shipq-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
