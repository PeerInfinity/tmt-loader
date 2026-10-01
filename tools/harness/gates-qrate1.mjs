// The qrate1 gates — the QUIRK-RATE sub-goal (ptr-strategy design notes §16.7 → §17): the template's sub-goal
// `{kind: 'value', dimension: player.q.total, threshold: 308372}` measured as a RATE over reflex configurations, fed to
// the planner round as its active goal, and the q23 verdict closed at the threshold.
//   node tools/harness/gates-qrate1.mjs --part fixture|subgoal|flip|grep|push|screen|planner [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-qrate1.mjs --part cell --cell <key>     (one long CI cell, twice; writes results/tmp/qrate1-cell-<key>.json)
//   node tools/harness/gates-qrate1.mjs --part merge --dir <dir>     (the CI cells, read back; refuses a missing one by name)
//
// GATES (`push` = the four, on every push in sweep.yml):
// Part fixture  F0 QL5 rebuilt from all/M26 under the shipped table (until Quirk Layers ≥ 5) = the committed fixture
//               (tick 77,196 — §12, tpl1 O1); Q308K rebuilt from it under the winning configuration = the committed one.
// Part subgoal  S1 the template's verdict at QL5, fed through `run.mjs --planner-goal`, IS the round's active goal: source
//               `subgoal`, target player.q.total ≥ the verdict's own threshold (read back from the ROUND LOG — a leg that
//               never reached its branch reads exactly like one that found nothing). S2 inert: no sub-goal → the
//               planner's decisions from pre-f1/M02 equal a pin measured at 8b30434 (before this slice). S3 the scorer
//               reads the window MAX, never the end (P1a 12a.5): a sub-goal on a SAWTOOTH dimension (player.points at the S1 frontier),
//               every confirmed candidate's progress term recomputed from its logged max, and at least one
//               candidate whose max ≠ end (else the row cannot see the trap).
// Part flip     T1 upg:q:23 at QL5 says WAITING CANNOT HELP with the sub-goal 308,372 (the input — tpl1 O1). T2 at Q308K
//               (the first state ≥ that threshold) it says BUY AT t*, confirmed on the copy. T3 the emitted queue
//               played LIVE from Q308K buys q23 on the copy's tick.
// Part grep     X1 no game id and no ptr layer id in the planner or rate.mjs (string literals and layers/player/tmp members).
// MEASUREMENTS (report; `.github/workflows/qrate1.yml`, dispatch-only — F1's ruling: measurement jobs never run on push):
// Part screen   every candidate cell from QL5 at diff 1 for 5,000 game-s (or to the threshold), each TWICE (equal or RED),
//               plus the ranking row.
// Part cell     a long cell (the control to the threshold at diff 1 over a stated horizon; the winner and the control at
//               the page's tick, diff 0.05) twice, with the state log; the rate from rate.mjs over the WHOLE stretch.
// Part planner  `--planner=auto` on the sub-goal from QL5: the default options, and the widened ones (+ keepModifiers).
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'cell', 'dir']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['fixture', 'subgoal', 'flip', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'push', 'screen', 'cell', 'merge', 'planner'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-qrate1-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1600)}`); };

const SNAPDIR = 'tools/harness/snapshots/ptr/qrate1';
const QL5 = `${SNAPDIR}/QL5.json`, Q308K = `${SNAPDIR}/Q308K.json`;
const LADDER = 'tools/harness/ladder/ptr.json';
const DIM = 'player.q.total', THRESHOLD = '308372';            // tpl1 O1's sub-goal (design notes §16.4) — re-asserted by T1
const UNTIL = `player.q.total.gte(${THRESHOLD})`;
const PIN_QL5 = { ticks: 77196, hashGame: '1fb78f9282c77b2b' };  // §12 / tpl1 O1
// The row cycle as the shipped table writes it (games-auto/ptr.json reset:q / reset:h), so a cell varies ONE thing.
const Q_TURN = '|turn@10/30x/5/0/100', H_TURN = '|turn@1/30x/5/0/100';
const WINNER = `policy:reset:q=rate-peak@0/0${Q_TURN}`;
// THE CANDIDATE AXES, each from a fact or the source (§17.2): reset:q's REGISTERED alternatives (games-auto/ptr.json),
// the row cycle's weights (R3c swept q 10/20/40/80 for M26; 5 extends it downward; h's weight 1 → 2), reset:h's
// alternatives, and challenges:h off (each give-up attempt costs two forced row-3 resets; `off` is its registered
// alternative). What quirk GAIN reads (games-facts/ptr.json `reads:q:gainMult` / `baseAmount`): q14's effect (Hindrance
// Spirit) and Generator Power — both moved only through these row-2/row-3 reflexes; nothing else it reads is unlocked.
const CELLS = {
  control: { opt: '', why: 'the shipped table: reset:q gain>=2|turn@10, reset:h always|turn@1, challenges:h give-up' },
  'q-rate-peak': { opt: WINNER, why: 'reset:q\'s registered `rate-peak@0/0` (V2: the currency-per-second optimum) keeping the cycle' },
  'q-rate-peak-bare': { opt: 'policy:reset:q=rate-peak@0/0', why: 'the same alternative exactly as the table registers it (the planner\'s candidate): it leaves the cycle' },
  'q-always': { opt: `policy:reset:q=always${Q_TURN}`, why: 'registered alternative' },
  'q-gain2x': { opt: `policy:reset:q=gain>=2x${Q_TURN}`, why: 'registered alternative' },
  'q-w5': { opt: `policy:reset:q=gain>=2|turn@5/30x/5/0/100`, why: 'the q weight below R3c\'s sweep' },
  'q-w20': { opt: `policy:reset:q=gain>=2|turn@20/30x/5/0/100`, why: 'registered alternative (R3c\'s second weight)' },
  'h-w2': { opt: `policy:reset:h=always|turn@2/30x/5/0/100`, why: 'h feeds q (q14): one more h reset per turn' },
  'h-gain2x': { opt: `policy:reset:h=gain>=2x${H_TURN}`, why: 'reset:h\'s registered alternative, in the cycle' },
  'ch-off': { opt: 'exclude=challenges:h', why: 'no challenge attempts: their forced resets cost the q-run' },
};
// The long cells (CI, one per job, each twice): the WHOLE stretch QL5 → threshold, or how far by the stated horizon.
const LONG = {
  'control@1': { cell: 'control', diff: 1, horizon: 150000 },
  'q-w20@1': { cell: 'q-w20', diff: 1, horizon: 150000 },
  'q-rate-peak-bare@1': { cell: 'q-rate-peak-bare', diff: 1, horizon: 20000 },
  'q-rate-peak@1': { cell: 'q-rate-peak', diff: 1, horizon: 20000 },
  'control@0.05': { cell: 'control', diff: 0.05, horizon: 6000 },
  'q-rate-peak@0.05': { cell: 'q-rate-peak', diff: 0.05, horizon: 6000 },
};
// S2's pin: `--planner=auto` from pre-f1/M02, 700 ticks, the ptr ladder — measured at 8b30434 (origin/main before this
// slice) in a throwaway worktree: the run's end and the round log's DECISIONS (each round with `cost` stripped).
// ⚖ RE-RECORDED (h22-1, the user's ruling 2026-10-01, design notes §19-R.1): `76a4e99d96a63bbc` → `4a8cf44689964883`.
// `instantiate` no longer emits a candidate the engine cannot parse; measured at 64aece3 + that filter, the game end is
// the same (2,061 / 70bb6ae66f6fcebe) and the round log is byte-equal once each candidate's `screen.rank` (its place in
// the pre-cut list, which the refused ids used to occupy) is stripped too: e96560ad78f9e0c3 before and after.
const PIN_INERT = { ticks: 2061, hashGame: '70bb6ae66f6fcebe', logSha16: '4a8cf44689964883', rounds: 3 };

function child(args, { timeoutMs = 3 * 3600e3 } = {}) {
  return new Promise((resolve) => {
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { out += d; });
    const t = setTimeout(() => c.kill('SIGKILL'), timeoutMs);
    c.on('close', (code) => { clearTimeout(t); resolve({ code, out }); });
  });
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } }));
  return out;
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
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { wallMs: Date.now() - t0 }); } catch { return { ok: false, error: 'no result: ' + r.out.slice(-400), wallMs: Date.now() - t0 }; }
}
async function strategize(game, extra) {
  const f = path.join(TMP, `strat-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, ...extra]);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { file: f, exit: r.code }); } catch { return { error: 'no result (exit ' + r.code + '): ' + r.out.slice(-600), exit: r.code }; }
}
async function rate(log) {
  const f = path.join(TMP, `rate-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/rate.mjs'), log, '--dim', DIM, '--threshold', THRESHOLD, '--json', f]);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return { error: r.out.slice(-300) }; }
}
const sha16 = async (s) => (await import('node:crypto')).createHash('sha256').update(s).digest('hex').slice(0, 16);
const EV = `({total: String(player.q.total), ql: Number(player.q.buyables[11]), upg: player.q.upgrades.join(','), h: String(player.h.points), hc: JSON.stringify(player.h.challenges), sb: String(player.sb.points)})`;

// ---- Part fixture ----------------------------------------------------------------------------------------------------
async function partFixture() {
  const d = path.join(TMP, 'fx');
  const [b, c] = await Promise.all([
    run('ptr', { 'from-snapshot': 'tools/harness/snapshots/ptr/all/M26.json', profile: 'all', ticks: 100000, until: 'player.q.buyables[11].gte(5)', 'stop-snapshot': d, 'stop-snapshot-name': 'QL5' }),
    run('ptr', { 'from-snapshot': QL5, profile: 'all', ticks: 20000, until: UNTIL, 'auto-opt': WINNER, eval: EV }),
  ]);
  const cq = JSON.parse(fs.readFileSync(path.join(REPO, QL5), 'utf8')), ct = JSON.parse(fs.readFileSync(path.join(REPO, Q308K), 'utf8'));
  const okA = !!b.ok && b.ticks === PIN_QL5.ticks && b.hashGame === PIN_QL5.hashGame && cq.ticks === PIN_QL5.ticks && cq.hashGame === PIN_QL5.hashGame;
  row({ gate: 'F0a the QL5 fixture: all/M26 under the shipped table until Quirk Layers ≥ 5 = the committed fixture = §12', id: 'ptr', ok: okA,
    notes: `rebuilt ${b.ticks} / ${b.hashGame}; committed ${cq.ticks} / ${cq.hashGame}; pin ${PIN_QL5.ticks} / ${PIN_QL5.hashGame} ${b.error || ''}` });
  const okB = !!c.ok && c.ticks === ct.ticks && c.hashGame === ct.hashGame && c.eval && Number(c.eval.total) >= Number(THRESHOLD);
  row({ gate: `F0b the Q308K fixture: QL5 under the winning configuration until total quirks ≥ ${THRESHOLD} = the committed fixture`, id: 'ptr', ok: okB,
    notes: `rebuilt ${c.ticks} / ${c.hashGame} (total ${c.eval && c.eval.total}, ${c.ticks - PIN_QL5.ticks} game-s after QL5); committed ${ct.ticks} / ${ct.hashGame}; config ${WINNER} ${c.error || ''}` });
}

// ---- Part subgoal ----------------------------------------------------------------------------------------------------
function plannerLeg(from, goalFile, opt, extra = {}) {
  const rounds = path.join(TMP, `rounds-${++seq}.json`);
  return run('ptr', { 'from-snapshot': from, profile: 'all', ticks: 1, planner: true, 'planner-mode': 'auto', 'planner-ladder': LADDER, 'planner-goal': goalFile, 'planner-opt': opt, 'rounds-out': rounds, ...extra })
    .then((r) => Object.assign(r, { rounds: fs.existsSync(rounds) ? JSON.parse(fs.readFileSync(rounds, 'utf8')) : null }));
}
async function partSubgoal() {
  // S1 — the template's own verdict file, fed as-is
  const v = await strategize('ptr', ['--from', QL5, '--goal', 'upg:q:23']);
  const sg = v.results && v.results[0] && v.results[0].subgoal;
  // S3's sawtooth: player.points at the S1 frontier (every reset empties it; the window max is 1e537 and the end 4e243,
  // measured) — at QL5 every default-confirmed candidate ended at its max (g.power, b.points, points), so no row there
  // could see the trap
  const sawGoal = path.join(TMP, 'points.goal.json');
  fs.writeFileSync(sawGoal, JSON.stringify({ kind: 'value', dimension: 'player.points', threshold: '1e9999' }));
  const inertRounds = path.join(TMP, 'inert-rounds.json');
  const [r1, r3, r2] = await Promise.all([
    v.file ? plannerLeg(QL5, v.file, 'maxRounds=1') : Promise.resolve({ ok: false, error: v.error }),
    plannerLeg('tools/harness/snapshots/ptr/frontier/STALL.json', sawGoal, 'maxRounds=1'),
    run('ptr', { 'from-snapshot': 'tools/harness/snapshots/ptr/pre-f1/M02.json', profile: 'all', planner: true, 'planner-mode': 'auto', 'planner-ladder': LADDER, ticks: 700, 'rounds-out': inertRounds }),
  ]);
  {
    const x = r1.rounds && r1.rounds.log && r1.rounds.log[0];
    const checks = {
      verdictHasSubgoal: !!sg && sg.kind === 'value' && sg.dimension === DIM,
      roundRan: !!x,
      sourceIsSubgoal: !!x && x.goal && x.goal.source === 'subgoal',
      targetIsTheDimension: !!x && x.target && x.target.dimension === DIM,
      thresholdIsTheVerdicts: !!x && x.target && !!sg && String(x.target.threshold) === String(sg.threshold),
      thresholdIs308372: !!x && x.target && String(x.target.threshold) === THRESHOLD,
      notSkipped: !!x && !(x.skipped || []).some((s) => s.subgoal),
    };
    row({ gate: 'S1 the template\'s sub-goal IS the round\'s active goal (strategize --json → run.mjs --planner-goal; read from the round log)', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ')} — verdict ${v.results && v.results[0] && v.results[0].verdict}, sub-goal ${JSON.stringify(sg)}; round 0 goal ${JSON.stringify(x && x.goal && { source: x.goal.source, id: x.goal.id })}, target ${JSON.stringify(x && x.target && { dimension: x.target.dimension, threshold: x.target.threshold, held: x.target.held, outOfReach: x.target.outOfReach })}; winner ${x && x.winner && x.winner.id}; ${r1.error || ''}` });
  }
  {
    const R = r2.ok && fs.existsSync(inertRounds) ? JSON.parse(fs.readFileSync(inertRounds, 'utf8')) : null;
    const s = R ? await sha16(JSON.stringify(R.log.map((x) => { const y = Object.assign({}, x); delete y.cost; return y; }))) : null;
    const ok = !!R && r2.ticks === PIN_INERT.ticks && r2.hashGame === PIN_INERT.hashGame && s === PIN_INERT.logSha16 && R.rounds === PIN_INERT.rounds && !('subgoal' in R) && R.log.every((x) => !x.goal || !('subgoal' in x.goal));
    row({ gate: 'S2 inert: with no sub-goal the planner decides exactly as before this slice (pre-f1/M02, 700 ticks; pin measured at 8b30434)', id: 'ptr', ok,
      notes: `ticks ${r2.ticks} / ${r2.hashGame}, rounds ${R && R.rounds}, decisions sha ${s} — pin ${PIN_INERT.ticks} / ${PIN_INERT.hashGame}, ${PIN_INERT.rounds} rounds, ${PIN_INERT.logSha16}; no subgoal key in the report ${!!R && !('subgoal' in R)} ${r2.error || ''}` });
  }
  {
    const x = r3.rounds && r3.rounds.log && r3.rounds.log[0];
    const W = r3.rounds && r3.rounds.options ? Number(r3.rounds.options.wProgress) : NaN;
    const conf = x ? x.candidates.filter((c) => c.confirm && c.score) : [];
    const L = (v) => { const m = /^(\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(v)); return m ? Math.log10(Number(m[1])) + (m[2] ? Number(m[2]) : 0) : NaN; };
    // Every candidate starts from the round's restored instant, whose value of the target is `target.held` (measured:
    // equal to the start measureConfig reads, to the last digit, on 8 candidates in two states). So each confirmed
    // candidate's progress term is recomputed HERE from its logged window MAX — wProgress × clip((log max − log held) /
    // (log threshold − log held)) — independently of the planner's own arithmetic. A scorer that reads the window's END
    // (a net rate, end − start) differs wherever max ≠ end, and the row requires at least one such candidate.
    const bad = [], sawtooth = [];
    const h = x && x.target ? L(x.target.held) : NaN, thr = x && x.target ? L(x.target.threshold) : NaN;
    for (const c of conf) {
      const want = W * Math.max(-1, Math.min(1, (L(c.confirm.max) - h) / (thr - h)));
      if (!(Math.abs(c.score.terms.progress - want) <= 1e-9 * Math.max(1, Math.abs(want)))) bad.push(`${c.id}: progress ${c.score.terms.progress} ≠ ${want} (from max ${c.confirm.max})`);
      if (String(c.confirm.max) !== String(c.confirm.end)) sawtooth.push(`${c.id} max ${c.confirm.max} / end ${c.confirm.end}`);
    }
    const checks = { roundRan: !!x, target: !!x && x.target && x.target.dimension === 'player.points' && x.goal.source === 'subgoal', confirmed: conf.length >= 1, fromTheMax: conf.length >= 1 && bad.length === 0, canSeeTheTrap: sawtooth.length >= 1 };
    row({ gate: 'S3 the scorer reads the window MAX, never the end or a net rate (P1a 12a.5): a sawtooth sub-goal, every confirmed candidate re-scored from its logged max', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ')} — ${conf.length} confirmed (${conf.map((c) => c.id).join(', ')}); ${bad.length ? 'MISMATCH ' + bad.join('; ') : `every progress term = ${W} × clip(log max − log held) / (log threshold − log held)`}; max ≠ end on ${sawtooth.length}: ${sawtooth.slice(0, 2).join('; ')} ${r3.error || ''}` });
  }
}

// ---- Part flip -------------------------------------------------------------------------------------------------------
async function partFlip() {
  const [t1, t2] = await Promise.all([strategize('ptr', ['--from', QL5, '--goal', 'upg:q:23']), strategize('ptr', ['--from', Q308K, '--goal', 'upg:q:23'])]);
  const v1 = t1.results && t1.results[0], v2 = t2.results && t2.results[0];
  row({ gate: `T1 upg:q:23 at QL5: WAITING CANNOT HELP, the sub-goal ${DIM} ≥ ${THRESHOLD} (the input; tpl1 O1)`, id: 'ptr', ok: !!v1 && v1.verdict === 'waiting-cannot-help' && !!v1.subgoal && v1.subgoal.dimension === DIM && String(v1.subgoal.threshold) === THRESHOLD && v1.queue === null,
    notes: `verdict ${v1 && v1.verdict}; peak 10^${v1 && v1.rollback && v1.rollback.peak.ratioLog10}; sub-goal ${JSON.stringify(v1 && v1.subgoal)} ${t1.error || ''}` });
  const ct = JSON.parse(fs.readFileSync(path.join(REPO, Q308K), 'utf8'));
  const okT2 = !!v2 && v2.verdict === 'buy-at' && !!v2.queue && !!v2.confirm && v2.confirm.played === true && v2.confirm.bought === true && v2.neutral === true;
  row({ gate: `T2 upg:q:23 at Q308K (the first state with total quirks ≥ ${THRESHOLD}): BUY AT t*, confirmed on the copy — the verdict FLIPS at the threshold`, id: 'ptr', ok: okT2,
    notes: `from tick ${ct.ticks} (total quirks ${(typeof ct.player === 'string' ? JSON.parse(ct.player) : ct.player).q.total}); verdict ${v2 && v2.verdict}; peak 10^${v2 && v2.rollback && v2.rollback.peak.ratioLog10} at ${v2 && v2.rollback && v2.rollback.peak.field}; the copy bought at ${JSON.stringify(v2 && v2.confirm && v2.confirm.at)} ${t2.error || ''}` });
  // T3 — the queue, played LIVE from the same state, buys on the copy's tick
  const qf = path.join(TMP, 'q23.queue.json');
  if (v2 && v2.queue) fs.writeFileSync(qf, JSON.stringify(v2.queue));
  const live = v2 && v2.queue ? await run('ptr', { 'from-snapshot': Q308K, profile: 'all', ticks: 400, queue: qf, until: "hasUpgrade('q',23)", eval: "({q23: hasUpgrade('q',23), t: Number(player.q.time)})" }) : { ok: false, error: 'no queue' };
  const st = live.queueStatus && live.queueStatus.queues && live.queueStatus.queues[0];
  const okT3 = !!live.ok && live.eval && live.eval.q23 === true && !!v2 && !!v2.confirm && !!v2.confirm.at && live.ticks === v2.confirm.at.tick && !!st && st.state === 'done' && st.holds.length === 0;
  row({ gate: 'T3 the emitted queue played LIVE from Q308K buys q23 on the copy\'s tick, every hold released', id: 'ptr', ok: okT3,
    notes: `live: q23 ${live.eval && live.eval.q23} at tick ${live.ticks} (q.time ${live.eval && live.eval.t}); copy ${JSON.stringify(v2 && v2.confirm && v2.confirm.at)}; queue ${st && st.state}, holds ${st && JSON.stringify(st.holds)} ${live.error || ''}` });
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-planner.js', 'tools/harness/rate.mjs'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the planner (the sub-goal seam, keepModifiers) or rate.mjs', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

// ---- Part screen (measurement) ---------------------------------------------------------------------------------------
async function partScreen() {
  const keys = Object.keys(CELLS);
  const jobs = keys.flatMap((k) => [0, 1].map((i) => ({ k, i })));
  const res = await pool(jobs, POOL, (j) => run('ptr', { 'from-snapshot': QL5, profile: 'all', ticks: 5000, until: UNTIL, 'auto-opt': CELLS[j.k].opt, eval: EV }));
  const table = [];
  for (const k of keys) {
    const [x, y] = res.filter((_, n) => jobs[n].k === k);
    const eq = !!x.ok && !!y.ok && x.ticks === y.ticks && x.hashGame === y.hashGame && x.eval.total === y.eval.total;
    const reached = !!x.eval && Number(x.eval.total) >= Number(THRESHOLD);
    table.push({ k, total: x.eval && Number(x.eval.total), gs: x.ticks - PIN_QL5.ticks, reached });
    row({ gate: `Q-screen ${k} — QL5 + 5,000 game-s (or to ${THRESHOLD}), twice equal`, id: 'ptr', ok: eq,
      notes: `${reached ? `REACHED ${THRESHOLD} at +${x.ticks - PIN_QL5.ticks} game-s` : `total ${x.eval && x.eval.total} at +5000`} (${((Number(x.eval && x.eval.total) - 32921) / (x.ticks - PIN_QL5.ticks)).toFixed(3)} quirks/game-s); h ${x.eval && x.eval.h}, H ${x.eval && x.eval.hc}; ${x.hashGame} / ${y.hashGame}; ${CELLS[k].opt || '(table)'} — ${CELLS[k].why} ${x.error || ''}${y.error || ''}` });
  }
  table.sort((p, q) => (q.reached - p.reached) || (p.reached ? p.gs - q.gs : q.total - p.total));
  row({ gate: 'Q-screen RANKING (report): by time to the threshold, then by total quirks at the horizon', id: 'ptr', ok: table.length === keys.length,
    notes: table.map((t) => `${t.k} ${t.reached ? `${THRESHOLD} at +${t.gs}` : t.total}`).join(' > ') });
}

// ---- Part cell (measurement, one per CI job) -------------------------------------------------------------------------
async function partCell() {
  const L = LONG[a.cell];
  if (!L) { console.error(`REFUSED: --cell ${a.cell} is not one of ${Object.keys(LONG).join(' | ')}`); process.exit(2); }
  const ticks = Math.round(L.horizon / L.diff);
  const legs = await Promise.all([0, 1].map((i) => {
    const log = path.join(TMP, `cell-${i}.jsonl`);
    return run('ptr', { 'from-snapshot': QL5, profile: 'all', diff: L.diff, ticks, until: UNTIL, 'auto-opt': CELLS[L.cell].opt, eval: EV, log, 'log-every': 600, 'wall-ms': 5 * 3600e3 })
      .then(async (r) => Object.assign(r, { rate: fs.existsSync(log) ? await rate(log) : null }));
  }));
  const [x, y] = legs;
  const walled = legs.some((r) => r.stall && r.stall.walled);
  const eq = !!x.ok && !!y.ok && x.ticks === y.ticks && x.hashGame === y.hashGame && x.eval.total === y.eval.total;
  const gs = (r) => Math.round((r.gameSeconds - PIN_QL5.ticks) * 1000) / 1000;
  // ⚠ `key` first and never `cell`: LONG's entries carry their own `cell` (the CELLS row), which a spread would let
  // overwrite the key — the first CI merge (36812038216) found all six cells MISSING for exactly that reason.
  const out = { ...L, key: a.cell, opt: CELLS[L.cell].opt, commit, dirty, twiceEqual: eq, walled, reached: !!x.eval && Number(x.eval.total) >= Number(THRESHOLD),
    gameSeconds: gs(x), ticks: x.ticks, hashGame: [x.hashGame, y.hashGame], eval: x.eval, rate: x.rate && { stretch: x.rate.stretch, intervals: x.rate.intervals, threshold: x.rate.threshold, series: x.rate.series }, wallMs: legs.map((r) => r.wallMs) };
  row({ gate: `Q-cell ${a.cell} — QL5 → ${THRESHOLD} at diff ${L.diff} (horizon ${L.horizon} game-s), twice equal, not walled`, id: 'ptr', ok: eq && !walled,
    notes: `${out.reached ? `REACHED at +${out.gameSeconds} game-s` : `NOT reached by +${out.gameSeconds}: total ${x.eval && x.eval.total}`}; rate ${x.rate && x.rate.stretch ? x.rate.stretch.rate.toPrecision(4) : '?'} quirks/game-s over the stretch (intervals ${x.rate && x.rate.intervals ? `${x.rate.intervals.min.toPrecision(3)} … ${x.rate.intervals.max.toPrecision(3)}` : '?'}); ${x.hashGame} / ${y.hashGame}; walled ${walled}; wall ${legs.map((r) => Math.round(r.wallMs / 1000)).join(' / ')} s ${x.error || ''}${y.error || ''}` });
  fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `qrate1-cell-${a.cell.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(out, null, 1) + '\n');
}
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /qrate1-cell-.*\.json$/.test(f)) : [];
  // matched by the FILE NAME the cell job writes (qrate1-cell-<key, sanitised>.json), never by a field inside it
  const fileOf = (k) => `qrate1-cell-${k.replace(/[^\w.-]/g, '_')}.json`;
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const k of Object.keys(LONG)) {
    const j = got[fileOf(k)];
    row({ gate: `Q-merge ${k}`, id: 'ptr', ok: !!j && j.twiceEqual && !j.walled,
      notes: j ? `${j.reached ? `${THRESHOLD} at +${j.gameSeconds} game-s` : `NOT reached by +${j.gameSeconds}: total ${j.eval && j.eval.total}`}; stretch rate ${j.rate && j.rate.stretch ? j.rate.stretch.rate.toPrecision(4) : '?'} /game-s; commit ${j.commit}; twice equal ${j.twiceEqual}; walled ${j.walled}` : 'MISSING — the cell did not run or its artifact was not found' });
  }
}

// ---- Part planner (measurement) --------------------------------------------------------------------------------------
async function partPlanner() {
  const goal = path.join(TMP, 'goal.json');
  fs.writeFileSync(goal, JSON.stringify({ kind: 'value', dimension: DIM, threshold: THRESHOLD }));
  const legs = [
    { k: 'defaults, 6 rounds', opt: 'maxRounds=6', ticks: 1800 },
    { k: 'widened + keepModifiers, 2 rounds', opt: 'maxRounds=2;keepModifiers=1;maxCandidates=999;screenK=999', ticks: 600 },
  ];
  const res = await Promise.all(legs.map((l) => plannerLeg(QL5, goal, l.opt, { ticks: l.ticks, eval: EV, 'wall-ms': 5 * 3600e3 })));
  legs.forEach((l, i) => {
    const r = res[i], log = (r.rounds && r.rounds.log) || [];
    const per = log.map((x) => `r${x.round} ${x.goal && x.goal.source}:${x.target && x.target.dimension} winner ${x.winner && x.winner.id} (${x.candidates.filter((c) => c.confirm).length} confirmed of ${x.candidates.length}; ${Math.round((x.cost && x.cost.wallMs) / 1000)} s)`);
    const allSub = log.length > 0 && log.every((x) => x.goal && x.goal.source === 'subgoal' && x.target && x.target.dimension === DIM);
    row({ gate: `Q-planner ${l.k} — --planner=auto on the sub-goal from QL5 (report)`, id: 'ptr', ok: !!r.ok && allSub,
      notes: `${per.join(' | ')}; total at the end ${r.eval && r.eval.total} (+${r.ticks - PIN_QL5.ticks} game-s) ${r.error || ''}` });
  });
}

const EXPECT = { fixture: 2, subgoal: 3, flip: 3, grep: 1, screen: Object.keys(CELLS).length + 1, cell: 1, merge: Object.keys(LONG).length, planner: 2 };
const FN = { fixture: partFixture, subgoal: partSubgoal, flip: partFlip, grep: partGrep, screen: partScreen, cell: partCell, merge: partMerge, planner: partPlanner };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT qrate1 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-qrate1-part-${PART}${a.cell ? '-' + a.cell.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
