// The h22 gates — H22 "Descension" (M29, `hasChallenge('h', 22)`; ptr-strategy design notes §18.5 → §20): the
// `exits-challenge` facts (which resets END an attempt), and the second template, `challenge-attempt`, which holds every
// exiting reset, plays the attempt on the copy and says COMPLETE (with a queue), SHORT BY X (with the levers the
// challenge-inputs facts rank) or CANNOT PROGRESS.
//   node tools/harness/gates-h22.mjs --part fixture|verdict|grep|push [--pool N] [--facts <ptr facts file>] [--no-write] [--assert]
//   node tools/harness/gates-h22.mjs --part leg --leg <key>       (one CI measurement leg, twice; writes results/tmp/h22-leg-<key>.json)
//   node tools/harness/gates-h22.mjs --part merge --dir <dir> [--only <key>]
//
// GATES (`push`, on every push in sweep.yml's `h22` job):
// Part fixture  F1 M29 = m28/QL6 under M28's configuration (the qrate1 winner, challenge attempts held at registration)
//               playing the committed queue the template emitted there, until H22 is completed = the committed fixture.
// Part verdict  O1 from QL6 under that configuration: COMPLETE — confirmed on the copy, on the tick F1 measures live; the
//               emitted queue = the committed one; the attempt's peak is at least §18.5's interrupted 0.9992.
//               O1s the same check with a stated 25-s window (the q-reset interval §18.5 measured inside): SHORT, the
//               template's peak p equal to an INDEPENDENT boot's reading of the same instant, and the levers by the
//               source — inside H22 point gain = gain × buyableEffect("s", 11) (mod.js:50), so the Primary Space
//               Building is the sub-goal, and every input the entry zeroes (zeroed-by:h:*) is listed but never emitted;
//               the sub-goal's threshold, set on an independent boot at that instant, closes the shortfall.
//               O2 the queue played LIVE from QL6 completes H22 on the copy's tick, releases its holds, and its log
//               replays EQUAL. O2s under the SHIPPED table too: complete, and the table's own give-up@B/H (read from
//               the policy in force) would concede the attempt before it completes.
//               VAC the hold was applied: in the held leg no exiting reset fires between entry and the finish; the same
//               queue holding only the challenge layer's own features is EXITED by a sibling reset and never completes
//               — the count of held exits that never happened.
//               EV the template's state-log evidence (attempts, completions, give-ups, exits by resets) = a count read
//               independently from the same log, on a leg where the winner's resets cut every attempt.
//               O3 generality: something (fresh, all/S05) and collection-of-everything run with no throw; the funnel
//               says why each has the matches it has.
// Part grep     X1 no game id and no ptr layer id in the code this slice changed.
// MEASUREMENTS (`.github/workflows/qrate1.yml -f part=h22`, dispatch-only): M29 at diff 1 and at the page's diff 0.05 —
// the template's verdict at that tick size, then its queue played live, the whole leg TWICE (equal or RED); and the
// CANDIDATE table entry (§19-R.2: no queue — the row-3 resets paused while an h challenge is active) at both tick sizes.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'dir', 'only', 'facts']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['fixture', 'verdict', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'push', 'leg', 'merge'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const FACTS = a.facts ? path.resolve(String(a.facts)) : null;     // a mutant's regenerated facts (default: games-facts/ptr.json)
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-h22-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1600)}`); };

// ⚠ This file is the ORACLE, and ptr's ids are its data (the template's own code may not name them — part grep).
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json', M29 = 'tools/harness/snapshots/ptr/h22/M29.json';
const QUEUE = 'tools/harness/queues/h22/ch-h-22-from-QL6.json';
const WINNER = 'policy:reset:q=rate-peak@0/0|turn@10/30x/5/0/100';        // qrate1's winner (§17.2)
const CHOFF = `${WINNER};exclude=challenges:h`;                           // M28's configuration (§18.4): attempts held
// ⚖ stages-1 (user, 2026-10-01): this leg measured the table BEFORE its stages; it names that configuration (`stages=off`) rather than re-recording the pin — O2s, VAC's control and EV run past QL6, where the table's stages now act
const PRE = 'stages=off';
const PIN_QL6 = { ticks: 86071, hashGame: '6b1557b562169e2e' };
const PIN_M29 = { ticks: 87055, hashGame: '6613cb4ac28fa565' };           // measured at 61a9b0d + this slice (F1 holds it)
const GOAL = 'ch:h:22';
// §18.5: inside an attempt interrupted at q.time 25 (Q86K), points were 0.9992 of the goal's exponent. An attempt that is
// NOT cut must reach at least that.
const P_INTERRUPTED = 0.9992;
// The SOURCE (games/ptr/js): inside H22 getPointGen returns gain × buyableEffect("s", 11) (mod.js:50) — the Primary
// Space Building is the one lever the entry does not rebuild from zero; entering is an h reset (game.js:256-266), and
// h's reset zeroes every lower layer's points (the zeroed-by:h:* facts, gates-facts1 O3's mechanism).
const PRIMARY = 'player.s.buyables.11';
const SPENT_BY_ENTRY = ['player.p.points', 'player.g.points', 'player.s.points', 'player.t.points'];
const WINDOW_SHORT = 25;

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
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, ...(game === 'ptr' && FACTS ? ['--facts', FACTS] : []), ...extra]);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { file: f, exit: r.code }); } catch { return { error: 'no result (exit ' + r.code + '): ' + r.out.slice(-600), exit: r.code }; }
}
async function replay(log) {
  const f = path.join(TMP, `replay-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/replay.mjs'), log, '--json', f]);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')).line; } catch { return { equal: false, error: 'no result: ' + r.out.slice(-300) }; }
}
const logRecords = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const ca = (R) => (R && R.results ? R.results.filter((v) => v.template === 'challenge-attempt') : []);
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');
const lg = (x) => { const m = /^(-?\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(x)); return m ? Math.log10(Number(m[1])) + (m[2] ? Number(m[2]) : 0) : NaN; };
// An INDEPENDENT reading of H22's attempt from the state log: entries (h.ac → 22), and how each ended, from the action
// records' own state changes — not the template's logEvidence. `exitingInside` counts the resets of the layers the SOURCE
// says end an attempt (rows ≥ h's: h, q, o, ss — game.js:126-136) made while inside; resets of rows 0–2 do not end it.
const EXITING = ['h', 'q', 'o', 'ss'];
function attemptsFromLog(recs) {
  let ac = null; const o = { attempts: 0, completed: 0, givenUp: 0, byReset: 0, exitingInside: 0, enteredAt: null, finishedAt: null };
  for (const r of recs) {
    if (r.type === 'checkpoint' && r.summary) { ac = r.summary['h.ac'] === undefined ? null : String(r.summary['h.ac']); continue; }
    if (r.type !== 'action') continue;
    const st = r.state || {};
    if (ac === '22' && r.call === 'doReset' && r.did && EXITING.includes(String((r.args || [])[0]))) o.exitingInside++;
    if (!('h.ac' in st)) continue;
    const now = st['h.ac'] === null ? null : String(st['h.ac']);
    if (now === '22' && ac !== '22') { o.attempts++; if (o.enteredAt === null) o.enteredAt = r.tick; }
    if (ac === '22' && now !== '22') {
      if ('h.c.22' in st) { o.completed++; o.finishedAt = r.tick; }
      else if (r.why && r.why.code === 'acted:challenge-give-up') o.givenUp++;
      else if (r.call === 'doReset') o.byReset++;
    }
    ac = now;
  }
  return o;
}

// ---- Part fixture ----------------------------------------------------------------------------------------------------
async function partFixture() {
  const d = path.join(TMP, 'fx');
  const x = await run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': CHOFF, queue: QUEUE, ticks: 1100, until: "hasChallenge('h',22)", 'stop-snapshot': d, 'stop-snapshot-name': 'M29',
    eval: "({h22: Number(player.h.challenges[22]||0), ac: player.h.activeChallenge || null, q31: hasUpgrade('q',31), ql: Number(player.q.buyables[11])})" });
  const c = JSON.parse(fs.readFileSync(path.join(REPO, M29), 'utf8'));
  const built = fs.existsSync(path.join(d, 'M29.json')) ? JSON.parse(fs.readFileSync(path.join(d, 'M29.json'), 'utf8')) : null;
  const q = x.queueStatus && x.queueStatus.queues.find((z) => z.id === 'ca-ch-h-22');
  const checks = {
    ran: !!x.ok, pin: x.ticks === PIN_M29.ticks && x.hashGame === PIN_M29.hashGame, committed: c.ticks === PIN_M29.ticks && c.hashGame === PIN_M29.hashGame,
    rebuilt: !!built && built.ticks === c.ticks && built.hashGame === c.hashGame,   // hashGame, not the raw save: it carries a wall clock
    h22Completed: !!x.eval && x.eval.h22 === 1 && x.eval.ac === null, queueDone: !!q && q.state === 'done' && q.holds.length === 0,
    configNamed: c.config['auto-opt'] === CHOFF && JSON.stringify(c.config.queue) === JSON.stringify([QUEUE]) && c.config.from === QL6,
  };
  row({ gate: 'F1 M29 = QL6 under M28\'s configuration playing the template\'s queue until H22 is completed = the committed fixture', id: 'ptr', ok: Object.values(checks).every(Boolean),
    notes: `${ck(checks)} — ${x.ticks} / ${x.hashGame} (pin ${PIN_M29.ticks} / ${PIN_M29.hashGame}); ${JSON.stringify(x.eval)}; queue ${q && q.state} holds ${JSON.stringify(q && q.holds)} ${x.error || ''}` });
}

// ---- Part verdict ----------------------------------------------------------------------------------------------------
async function partVerdict() {
  const log = path.join(TMP, 'o2.jsonl'), clog = path.join(TMP, 'control.jsonl'), elog = path.join(TMP, 'evidence.jsonl');
  // the control: the same queue holding ONLY the challenge layer's own features (q, o, ss — its siblings — left free)
  const Q = JSON.parse(fs.readFileSync(path.join(REPO, QUEUE), 'utf8'));
  const C = JSON.parse(JSON.stringify(Q)); C.id = 'ca-ch-h-22-own-layer-only';
  C.steps[0].features = C.steps[0].features.filter((f) => f.endsWith(':h'));
  // (shipq-1) the control is the GATE's construction, played under `stages=off`: the template's `relies` (the settings ITS
  // queue was checked under) is not the control's claim, so it goes
  delete C.relies;
  const cfile = path.join(TMP, 'control.queue.json'); fs.writeFileSync(cfile, JSON.stringify(C));
  const jobs = [
    () => strategize('ptr', ['--from', QL6, '--goal', GOAL, '--auto-opt', CHOFF]),
    () => strategize('ptr', ['--from', QL6, '--goal', GOAL, '--auto-opt', CHOFF, '--window', String(WINDOW_SHORT)]),
    () => run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': CHOFF, queue: QUEUE, ticks: 1100, until: "hasChallenge('h',22)", log, eval: "({h22: Number(player.h.challenges[22]||0)})" }),
    () => strategize('ptr', ['--from', QL6, '--goal', GOAL, '--auto-opt', PRE]),
    () => run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': `${CHOFF};${PRE}`, queue: cfile, ticks: 1100, until: "hasChallenge('h',22)", log: clog, eval: "({h22: Number(player.h.challenges[22]||0)})" }),
    () => run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': `${WINNER};${PRE}`, ticks: 600, log: elog }),
    () => strategize('something', []), () => strategize('something', ['--from', 'tools/harness/snapshots/something/all/S05.json']), () => strategize('collection-of-everything', []),
    () => strategize('ptr', []),
  ];
  const out = new Array(jobs.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, jobs.length) }, async () => { while (next < jobs.length) { const i = next++; out[i] = await jobs[i](); } }));
  const [o1, o1s, live, ship, ctl, ev0, s0, s5, coe, pfresh] = out;

  // O1 — COMPLETE under M28's configuration
  const v1 = ca(o1)[0];
  {
    const checks = {
      verdict: !!v1 && v1.verdict === 'complete',
      confirmedOnTheLiveTick: !!v1 && !!v1.confirm && v1.confirm.completed === true && v1.confirm.at && v1.confirm.at.tick === PIN_M29.ticks,
      holdsReleased: !!v1 && !!v1.confirm && v1.confirm.state === 'done' && Array.isArray(v1.confirm.holds) && v1.confirm.holds.length === 0,
      queueIsTheCommittedOne: !!v1 && !!v1.queue && JSON.stringify(v1.queue) === JSON.stringify(Q),
      holdCoversEveryExit: !!v1 && ['reset:h', 'reset:q', 'reset:o', 'reset:ss'].every((f) => v1.binding.hold.includes(f)),
      peakAtLeastInterrupted: !!v1 && !!v1.rollback.peak && v1.rollback.peak.p >= P_INTERRUPTED,
      neutral: !!v1 && v1.neutral === true,
    };
    row({ gate: 'O1 ch:h:22 from QL6 under M28\'s configuration: COMPLETE, confirmed on the copy, the queue emitted = the committed one', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v1 ? `verdict ${v1.verdict}, t* ${JSON.stringify(v1.tStar)}, confirmed ${JSON.stringify(v1.confirm && v1.confirm.at)}, hold ${v1.binding.hold.join(',')}, peak ${JSON.stringify(v1.rollback.peak)}` : o1.error}` });
  }
  // O1s — SHORT at a 25-s window, and the levers by the source; the instant re-read by an independent boot
  const v2 = ca(o1s)[0];
  {
    const pk = v2 && v2.rollback && v2.rollback.peak;
    const sg = v2 && v2.subgoal;
    const ind = pk ? await run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': CHOFF, queue: QUEUE, ticks: pk.k,
      eval: `({pts: String(player.points), goal: String(tmp.h.challenges[22].goal), ac: player.h.activeChallenge, gen: String(getPointGen()), s11: String(player.s.buyables[11]),` +
        ` genAt: (function () { var was = player.s.buyables[11]; player.s.buyables[11] = new Decimal(${JSON.stringify(String(sg ? sg.threshold : 0))}); for (var i = 0; i < 3; i++) updateTemp(); var g = String(getPointGen()); player.s.buyables[11] = was; for (var j = 0; j < 3; j++) updateTemp(); return g; })()})` }) : null;
    const e = ind && ind.eval;
    const pInd = e ? lg(e.pts) / lg(e.goal) : NaN;
    const lev = (v2 && v2.levers) || [];
    const prim = lev.find((l) => l.input === PRIMARY);
    const spentOk = SPENT_BY_ENTRY.every((p) => { const l = lev.find((x) => x.input === p); return !l || !!l.spentByEntry; });
    const checks = {
      verdict: !!v2 && v2.verdict === 'short',
      peakEqualsAnIndependentBoot: !!e && e.ac === 22 && Math.abs(pInd - pk.p) < 2e-6 && Math.abs((lg(e.goal) - lg(e.pts)) - pk.shortLog10) < 1e-3,
      primaryIsTheSubgoal: !!sg && sg.dimension === PRIMARY && !!prim && !prim.spentByEntry && !prim.zeroedAtPeak,
      spentByEntryNeverEmitted: spentOk && lev.filter((l) => l.spentByEntry).length >= 1,
      thresholdClosesTheShortfall: !!e && lg(e.genAt) - lg(e.gen) >= pk.shortLog10 - 1e-3,
      neutral: !!v2 && v2.neutral === true,
    };
    row({ gate: `O1s ch:h:22 with a ${WINDOW_SHORT}-s window: SHORT; the peak = an independent boot's; the Primary Space Building (mod.js:50) is the sub-goal, inputs the entry zeroes never are`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — peak ${JSON.stringify(pk)}; independent p ${pInd.toFixed(6)} (points ${e && e.pts}, goal ${e && e.goal}); sub-goal ${JSON.stringify(sg)}; gain ×10^${e ? (lg(e.genAt) - lg(e.gen)).toFixed(4) : '—'} at the threshold vs the shortfall 10^${pk && pk.shortLog10}; levers ${lev.map((l) => `${l.input} ${l.distanceLog10 === undefined ? 'unpriced' : '10^' + l.distanceLog10}${l.spentByEntry ? ' (spent by entry)' : ''}${l.zeroedAtPeak ? ' (0 at peak)' : ''} step 10^${l.stepLog10}${l.plusOneLog10 !== undefined ? ' +1 10^' + l.plusOneLog10 : ''}`).join('; ')} — §18.5 read 10^2.7 short / 0.9992 at q.time 25 in an INTERRUPTED attempt (another instant)` });
  }
  // O2 — the queue played LIVE completes on the copy's tick; its log replays equal
  {
    const rp = live && live.ok ? await replay(log) : null;
    const st = live && live.queueStatus && live.queueStatus.queues.find((z) => z.id === 'ca-ch-h-22');
    const A = attemptsFromLog(logRecords(log));
    const checks = {
      completes: !!live && live.ok && live.eval && live.eval.h22 === 1, onTheCopysTick: !!live && live.ticks === PIN_M29.ticks && !!v1 && v1.confirm && v1.confirm.at && v1.confirm.at.tick === live.ticks,
      holdsReleased: !!st && st.state === 'done' && st.holds.length === 0, oneAttemptCompleted: A.attempts === 1 && A.completed === 1,
      replayEqual: !!rp && rp.equal === true && rp.unapplied === 0,
    };
    row({ gate: 'O2 the emitted queue played LIVE from QL6 completes H22 on the copy\'s tick; holds released; its log replays EQUAL', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — live ${live && live.ticks} / ${live && live.hashGame}; attempts ${JSON.stringify(A)}; queue ${st && st.state}; replay ${rp ? `equal ${rp.equal}, ${rp.compared && rp.compared.action} actions, ${rp.applied} applied, ${rp.unapplied} unapplied` : '—'} ${live && live.error || ''}` });
  }
  // O2s — the SHIPPED table: complete too, and its own give-up rule would concede first
  {
    const v = ca(ship)[0];
    const tg = v && v.tableGiveUp;
    const checks = {
      verdict: !!v && v.verdict === 'complete' && !!v.queue, holdsTheOwnChallengesFeature: !!v && v.binding.hold.includes('challenges:h'),
      giveUpReadFromThePolicy: !!tg && tg.feature === 'challenges:h' && /\|give-up@/.test(tg.policy || '') && tg.B === 0.1 && tg.H === 30,
      itWouldConcedeFirst: !!tg && !!tg.concedesAt && !!v.tStar && tg.concedesAt.t < v.tStar.gameSeconds,
    };
    row({ gate: 'O2s under the shipped table: COMPLETE as well, and the table\'s own give-up@B/H would concede the attempt before it completes', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v ? `t* ${JSON.stringify(v.tStar)}; hold ${v.binding.hold.join(',')}; table ${JSON.stringify(tg)}` : ship.error}` });
  }
  // VAC — the hold was applied: count the held exits that never happened
  {
    const H = attemptsFromLog(logRecords(log)), K = attemptsFromLog(logRecords(clog));
    const checks = { heldLegNoExitingResetInside: H.exitingInside === 0 && H.byReset === 0, controlExitedBySibling: K.byReset >= 1 && K.completed === 0, controlNeverCompletes: !!ctl && ctl.eval && ctl.eval.h22 === 0 };
    row({ gate: 'VAC the hold was applied: no exiting reset inside the held attempt; the own-layer-only hold is cut by a sibling and never completes', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — held: ${JSON.stringify(H)}; control (hold ${C.steps[0].features.join(',')}): ${JSON.stringify(K)} over ${ctl && ctl.ticks - PIN_QL6.ticks} ticks — ${K.byReset} exit(s) the full hold prevented` });
  }
  // EV — the template's evidence = an independent count of the same log
  {
    const ind = attemptsFromLog(logRecords(elog));
    const v = ev0 && ev0.ok ? ca(await strategize('ptr', ['--from', QL6, '--goal', GOAL, '--auto-opt', `${WINNER};${PRE}`, '--window', String(WINDOW_SHORT), '--log', elog]))[0] : null;
    const e = v && v.binding && v.binding.evidence;
    const checks = { evidence: !!e, attempts: !!e && e.attempts === ind.attempts && e.attempts > 1, completed: !!e && e.completed === ind.completed && e.completed === 0,
      givenUp: !!e && e.givenUp === ind.givenUp, cutByResets: !!e && e.cutByResets === ind.byReset && e.cutByResets >= e.attempts - 1 };
    row({ gate: 'EV the state-log evidence: under the winner every H22 attempt is cut by a reset (no completion, no give-up) — the template\'s count = an independent count', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — template ${JSON.stringify(e)}; independent ${JSON.stringify(ind)} (600 game-s from QL6 under ${WINNER})` });
  }
  // O3 — generality
  {
    const legs = [['something fresh', s0], ['something all/S05', s5], ['collection-of-everything fresh', coe], ['ptr fresh', pfresh]];
    const c = (r) => r && r.counts && r.counts['challenge-attempt'];
    const EXITS_CHALLENGES = [...new Set(JSON.parse(fs.readFileSync(path.join(REPO, 'games-facts/ptr.json'), 'utf8')).facts.filter((f) => f.kind === 'exits-challenge' && !f.abstain).map((f) => f.id.split(':').slice(1, 3).join(':')))].sort();
    const coeV = ca(coe)[0];
    const checks = {
      noThrow: legs.every(([, r]) => r && !r.error && r.exit === 0 && r.results.every((x) => x.verdict !== 'threw')),
      somethingHasNoChallenge: [s0, s5].every((r) => c(r) && c(r).matches === 0 && c(r).funnel.challengesWithExits === 0),
      coeShortUnpriced: !!coeV && coeV.verdict === 'short' && coeV.short && coeV.short.log10 === null,
      // (m31) DERIVED from the facts file: one match per challenge the exits-challenge facts name (h11, h12, h21, h22 and
      // h32 until m31; h31 replaces h32 since the declared stages/M30 and the itemUnlocked fix — still 5)
      ptrFreshNoneOpen: !!c(pfresh) && c(pfresh).matches === EXITS_CHALLENGES.length && EXITS_CHALLENGES.length >= 5 && c(pfresh).open === 0,
    };
    row({ gate: 'O3 generality: something and collection-of-everything run with no throw; the funnel names why', id: 'something+coe+ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ` + legs.map(([n, r]) => (c(r) ? `${n}: ${c(r).matches} match(es), ${c(r).open} open, funnel ${JSON.stringify(c(r).funnel)}, verdicts ${JSON.stringify(c(r).verdicts)}` : `${n}: ${r && r.error}`)).join(' | ') + (coeV ? ` — coe: ${coeV.reasoning.slice(-1)[0]}` : '') + ` — ptr's facts name the exits of ${EXITS_CHALLENGES.join(', ')}` });
  }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-templates.js', 'loader/tmt-queue.js', 'loader/tmt-planner.js', 'tools/harness/facts.mjs', 'tools/harness/strategize.mjs'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the code this slice changed (templates, queue runner, planner, facts.mjs, strategize)', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

// ---- Part leg (measurement, one per CI job): M29 at a tick size --------------------------------------------------------
// The template's verdict at that diff (strategize --diff), then the queue IT emitted played live at that diff from QL6
// until H22 is completed — the whole leg TWICE (equal or RED). ⚖ A verdict is a claim about ONE tick size (m28).
// `table@…`: the CANDIDATE stage-gated table entry (design notes §19-R.2 — a later slice writes it): no queue, the same
// effect as table data — the row-3 resets paused while an h challenge is active (`while`), and challenges:h entering
// with no give-up. Measured at diff 1 from QL6: H22 on the queue's own tick and hashGame.
const CANDIDATE = `${WINNER};policy:challenges:h=sequential;` + ['reset:q', 'reset:h', 'reset:o', 'reset:ss'].map((f) => `while:${f}=!player.h.activeChallenge`).join(';');
const LEGS = { 'm29@1': { diff: 1, ticks: 1100 }, 'm29@0.05': { diff: 0.05, ticks: 21000 },
  'table@1': { diff: 1, ticks: 1500, config: CANDIDATE }, 'table@0.05': { diff: 0.05, ticks: 30000, config: CANDIDATE } };
const LIVE_EV = "({h22: Number(player.h.challenges[22]||0), q: String(player.q.total), ql: Number(player.q.buyables[11]), q31: hasUpgrade('q',31)})";
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  if (L.config) {
    const legs = await Promise.all([0, 1].map(async () => {
      const live = await run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': L.config, diff: L.diff, ticks: L.ticks, until: "hasChallenge('h',22)", eval: LIVE_EV });
      return { live: { ok: live.ok, ticks: live.ticks, gameSeconds: live.gameSeconds, hashGame: live.hashGame, eval: live.eval, wallMs: live.wallMs, error: live.error } };
    }));
    const [x, y] = legs, eq = x.live.ticks === y.live.ticks && x.live.hashGame === y.live.hashGame;
    const reached = !!x.live.eval && x.live.eval.h22 === 1, since = Math.round((x.live.gameSeconds - PIN_QL6.ticks) * 1000) / 1000;
    const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, reached, sinceQL6: since, legs };
    row({ gate: `M-leg ${a.leg} — the candidate table entry (no queue) from QL6 at diff ${L.diff} until H22 is completed, twice equal`, id: 'ptr', ok: eq && reached,
      notes: `H22 ${reached ? 'COMPLETED' : 'not completed'} at +${since} game-s (tick ${x.live.ticks}, ${x.live.hashGame}; ${JSON.stringify(x.live.eval)}); twice equal ${eq}; config ${L.config}; wall ${legs.map((l) => Math.round((l.live.wallMs || 0) / 1000)).join(' / ')} s` });
    fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
    fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `h22-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(outj, null, 1) + '\n');
    return;
  }
  const legs = await Promise.all([0, 1].map(async (copy) => {
    const v = await strategize('ptr', ['--from', QL6, '--goal', GOAL, '--auto-opt', CHOFF, '--diff', String(L.diff), '--timeout-s', '5400']);
    const r0 = ca(v)[0];
    const qf = path.join(TMP, `leg-${copy}.queue.json`);
    if (r0 && r0.queue) fs.writeFileSync(qf, JSON.stringify(r0.queue));
    const live = r0 && r0.queue ? await run('ptr', { 'from-snapshot': QL6, profile: 'all', 'auto-opt': CHOFF, diff: L.diff, queue: qf, ticks: L.ticks, until: "hasChallenge('h',22)",
      eval: LIVE_EV }) : null;
    return { verdict: r0 ? { verdict: r0.verdict, tStar: r0.tStar, confirm: r0.confirm && r0.confirm.at, peak: r0.rollback && r0.rollback.peak, giveUp: r0.tableGiveUp } : { error: v.error },
      live: live ? { ok: live.ok, ticks: live.ticks, gameSeconds: live.gameSeconds, hashGame: live.hashGame, eval: live.eval, wallMs: live.wallMs, error: live.error } : null };
  }));
  const [x, y] = legs;
  const eq = !!x.live && !!y.live && x.live.ticks === y.live.ticks && x.live.hashGame === y.live.hashGame && JSON.stringify(x.verdict) === JSON.stringify(y.verdict);
  const reached = !!x.live && x.live.eval && x.live.eval.h22 === 1;
  const since = x.live ? Math.round((x.live.gameSeconds - PIN_QL6.ticks) * 1000) / 1000 : null;
  const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, reached, sinceQL6: since, legs };
  row({ gate: `M-leg ${a.leg} — the verdict at diff ${L.diff}, then its queue played live from QL6 until H22 is completed (M29), twice equal`, id: 'ptr', ok: eq && reached && x.verdict.verdict === 'complete',
    notes: `verdict ${x.verdict.verdict} t* ${JSON.stringify(x.verdict.tStar)} (confirmed at ${JSON.stringify(x.verdict.confirm)}); live: H22 ${reached ? 'COMPLETED' : 'not completed'} at +${since} game-s (tick ${x.live && x.live.ticks}, ${x.live && x.live.hashGame}; ${JSON.stringify(x.live && x.live.eval)}); twice equal ${eq}; wall ${legs.map((l) => Math.round(((l.live && l.live.wallMs) || 0) / 1000)).join(' / ')} s` });
  fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `h22-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(outj, null, 1) + '\n');
}
const MERGED = a.only ? [String(a.only)] : Object.keys(LEGS);
if (a.only && !LEGS[a.only]) { console.error(`REFUSED: --only ${a.only} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /h22-leg-.*\.json$/.test(f)) : [];
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const k of MERGED) {
    const j = got[`h22-leg-${k.replace(/[^\w.-]/g, '_')}.json`];
    row({ gate: `M-merge ${k}`, id: 'ptr', ok: !!j && j.twiceEqual && j.reached,
      notes: j ? `H22 ${j.reached ? `completed at +${j.sinceQL6} game-s` : 'NOT completed'} (tick ${j.legs[0].live && j.legs[0].live.ticks}${j.legs[0].verdict ? `; verdict ${j.legs[0].verdict.verdict}, t* ${JSON.stringify(j.legs[0].verdict.tStar)}` : '; the candidate table entry'}); commit ${j.commit}; twice equal ${j.twiceEqual}` : 'MISSING — the leg did not run or its artifact was not found' });
  }
}

const EXPECT = { fixture: 1, verdict: 7, grep: 1, leg: 1, merge: MERGED.length };
const FN = { fixture: partFixture, verdict: partVerdict, grep: partGrep, leg: partLeg, merge: partMerge };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT h22 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-h22-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
