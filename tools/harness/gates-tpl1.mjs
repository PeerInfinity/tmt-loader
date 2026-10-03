#!/usr/bin/env node
// tpl1 — THE QUEUE RUNNER and THE FIRST STRATEGY TEMPLATE (docs/queues.md, docs/templates.md): a queue plays engine
// actions inside the tick and releases every hold it places; the state log records and replays it exactly; the
// `time-priced-purchase` template reaches the verdicts the design notes and the game source say it must; and nothing
// moves when no queue is loaded.
//
//   node tools/harness/gates-tpl1.mjs --part inert|runner|oracle|grep|all [--pool N] [--no-summary] [--no-write] [--assert]
//
// Part inert   No queue loaded → the existing pins are byte-identical: ptr's opening (fresh → M12) lands on gates-c1c's
//              pin O (READ from that file) with the runner LOADED and nothing in it; something and collection-of-everything
//              tick to the same hashGame and the same runtimeState keys with and without the runner.
// Part runner  Five legs on ptr (fresh), each counting the records of the kind it is about:
//              R1 hold → wait → call → end, every hold released (and the released reflex acts again);
//              R2 a wait times out → abort releases the hold;  R3 unload mid-queue releases the hold;
//              R4 the held feature's reason line names the queue and the step (explain + toggleView);
//              R5 replay of each leg's log is EQUAL, queue calls included (re-applied in the queue's slot).
// Part oracle  O1 q23 from a QL5 state (built here from all/M26, §12's recipe): WAITING CANNOT HELP, the peak against
//              an independent --eval boot, the levers against the game SOURCE (q11's formula, Quirk Layers' price
//              2^(2^x−1)), no queue. O2 q22 from the committed checkpoint before the reflex bought it (76,931): BUY AT
//              t*, confirmed on the copy; the emitted queue played LIVE buys q22 on the copy's tick, and its log replays.
//              O3 generality: something (fresh, all/S05) and collection-of-everything (fresh) run without a throw.
//              VACUITY (the run's row): the verdicts are counted — exactly the ones the oracles are about.
// Part grep    No game id (any manifest) and no ptr layer id in the runner's or the template's code.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PARTS = ['inert', 'runner', 'oracle', 'grep'];
const PART = String(a.part || 'all');
if (PART !== 'all' && !PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${PARTS.join(' | ')} | all`); process.exit(2); }
const RUN = PART === 'all' ? PARTS : [PART];
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-tpl1-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1200)}`); };
const Q = (f) => path.join(REPO, 'tools/harness/queues/tpl1', f);
const LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');

function child(args, { timeoutMs = 900e3 } = {}) {
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
/** run.mjs with flags {k: v}; `queue` may be an array (repeatable). Returns the result JSON (+ wallMs). */
async function run(id, flags) {
  const f = path.join(TMP, `run-${id}-${++seq}.json`);
  const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', f];
  for (const [k, v] of Object.entries(flags)) {
    if (v === undefined || v === null || v === false) continue;
    if (Array.isArray(v)) for (const x of v) args.push(`--${k}`, String(x));
    else if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
  }
  const t0 = Date.now();
  const r = await child(args);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { wallMs: Date.now() - t0 }); } catch { return { ok: false, error: 'no result: ' + r.out.slice(-400), wallMs: Date.now() - t0 }; }
}
async function replay(log) {
  const f = path.join(TMP, `replay-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/replay.mjs'), log, '--json', f]);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')).line; } catch { return { equal: false, error: 'no result: ' + r.out.slice(-300) }; }
}
async function strategize(game, extra) {
  const f = path.join(TMP, `strat-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, ...extra]);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { exit: r.code, out: r.out }); } catch { return { error: 'no result (exit ' + r.code + '): ' + r.out.slice(-600), exit: r.code }; }
}
function logRecords(file) { return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); }
const count = (recs, pred) => recs.filter(pred).length;

// ---- the pin, READ from gates-c1c's own source (log1's rule: a pin that moved there moves here) -----------------------
const C1C = fs.readFileSync(path.join(REPO, 'tools/harness/gates-c1c.mjs'), 'utf8');
function pinOf(key) {
  const m = new RegExp(`key: '${key}'[^\\n]*pin: \\{ mark: '(\\w+)', gs: (\\d+), hashGame: '([0-9a-f]{16})' \\}`).exec(C1C);
  if (!m) throw new Error(`gates-c1c.mjs: no pin for leg ${key} — the file changed shape; read it and update pinOf()`);
  return { mark: m[1], gs: Number(m[2]), hashGame: m[3] };
}

// ---- Part inert ------------------------------------------------------------------------------------------------------
async function partInert() {
  const PIN = pinOf('O');
  // the same flags as gates-log1's opening leg (the pin's own measurement), plus the runner
  const open = { profile: 'all', diff: 1, ticks: 8000, 'wall-ms': 570000, ladder: LADDER, to: PIN.mark, stall: 1e6, 'queue-runner': true };
  const EV = '({rt: Object.keys(tmtLoader.runtimeState()).sort(), slot: tmtLoader.queueLink.step === null && tmtLoader.queueLink.holds === null, runner: !!(tmtLoader.queues && tmtLoader.queues.ready)})';
  const jobs = [{ k: 'open' }, ...['something', 'collection-of-everything'].flatMap((id) => [{ k: 'pair', id, runner: true }, { k: 'pair', id, runner: false }])];
  const res = await pool(jobs, POOL, (j) => (j.k === 'open' ? run('ptr', open) : run(j.id, { profile: 'all', diff: 1, ticks: 300, eval: EV, 'queue-runner': j.runner })));
  const o = res[0], m = o.marks && o.marks[PIN.mark];
  // (shipq-1) ptr's TABLE ships a queue (the H22 attempt); it is armed from the start and its condition never holds
  // before M12 — so the pin also says a shipped queue that never starts moves nothing. "No queue" = none loaded by hand.
  const own = o.queueStatus ? o.queueStatus.queues.filter((q) => !q.shipped) : null, shp = o.queueStatus ? o.queueStatus.queues.filter((q) => q.shipped) : [];
  const ok = !!(o.ok && m && m.gameSeconds === PIN.gs && m.hashGame === PIN.hashGame && own && own.length === 0 && shp.every((q) => q.state === 'armed' && q.shipped.runs === 0));
  row({ gate: 'I1 inert: the runner LOADED with no queue — ptr fresh → M12 lands on the pin (gates-c1c O)', id: 'ptr', ok,
    notes: ok ? `${PIN.mark} ${PIN.gs} / ${PIN.hashGame}; runner loaded, 0 queues of its own, the table's ${shp.map((q) => q.id + ' ' + q.state).join(', ') || 'none'} (${Math.round(o.wallMs / 1000)} s)` : `EXPECTED ${PIN.mark} ${PIN.gs} / ${PIN.hashGame}, GOT ${m ? m.gameSeconds + ' / ' + m.hashGame : 'no ' + PIN.mark}; runner ${JSON.stringify(o.queueRunner)} ${o.error || ''}` });
  for (let i = 0; i < 2; i++) {
    const w = res[1 + 2 * i], wo = res[2 + 2 * i], id = jobs[1 + 2 * i].id;
    const ok2 = !!(w.ok && wo.ok && w.hashGame === wo.hashGame && w.hash === wo.hash && JSON.stringify(w.eval.rt) === JSON.stringify(wo.eval.rt) && w.eval.slot && w.eval.runner && !wo.eval.runner);
    row({ gate: 'I2 inert: 300 ticks with the runner loaded = without it (hashGame, full hash, runtimeState keys; the slot empty)', id, ok: ok2,
      notes: `with ${w.hashGame}/${w.hash}, without ${wo.hashGame}/${wo.hash}; runtimeState keys ${JSON.stringify(w.eval && w.eval.rt)} vs ${JSON.stringify(wo.eval && wo.eval.rt)}; slot empty ${w.eval && w.eval.slot}; runner ${w.eval && w.eval.runner}/${wo.eval && wo.eval.runner}` });
  }
}

// ---- Part runner -----------------------------------------------------------------------------------------------------
const EXPLAIN_P = "(function(){ var r = tmtLoader.explain().filter(function(x){ return x.id === 'reset:p'; })[0]; return { last: r && r.last ? { code: r.last.code, values: r.last.values } : null, text: r && r.last ? tmtLoader.reasonText(r.last) : null, tv: tmtLoader.toggleView('reset:p'), html: tmtLoader.enabledByHTML(tmtLoader.toggleView('reset:p')), holds: tmtLoader.queueLink.holds, codes: tmtLoader.explainStats().codes['held:queue'] || 0 }; })()";
async function partRunner() {
  const L = (n) => path.join(TMP, `${n}.jsonl`);
  const legs = [
    { n: 'R1', f: { profile: 'all', diff: 1, ticks: 200, queue: Q('hold-wait-call.json'), log: L('R1') } },
    { n: 'R2', f: { profile: 'all', diff: 1, ticks: 120, queue: Q('timeout-abort.json'), log: L('R2') } },
    // R3: the queue is unloaded at tick 30 from inside the run (the --until hook runs after every tick and returns false)
    { n: 'R3', f: { profile: 'all', diff: 1, ticks: 120, queue: Q('unload-mid.json'), log: L('R3'), until: "(tmtLoader.ticks === 30 && (globalThis.__u = tmtLoader.queues.unload('tpl1-unload-mid'))) && false", eval: 'globalThis.__u || null' } },
    { n: 'R4', f: { profile: 'all', diff: 1, ticks: 25, queue: Q('unload-mid.json'), eval: EXPLAIN_P } },
    { n: 'R0', f: { profile: 'all', diff: 1, ticks: 120 } },   // the control: the same opening with no queue at all
  ];
  const R = Object.fromEntries((await pool(legs, POOL, (l) => run('ptr', l.f))).map((r, i) => [legs[i].n, r]));
  const recs = (n) => (fs.existsSync(L(n)) ? logRecords(L(n)) : []);
  const qrec = (rs, what) => rs.filter((r) => r.type === 'queue' && r.do === what);
  const pResets = (rs, from) => count(rs, (r) => r.type === 'action' && r.source === 'auto' && r.by === 'reset:p' && r.tick >= from);
  // R1
  {
    const r = R.R1, rs = recs('R1'), st = r.queueStatus && r.queueStatus.queues[0];
    const call = rs.filter((x) => x.type === 'action' && x.source === 'queue');
    const end = qrec(rs, 'end')[0], held = qrec(rs, 'hold')[0];
    const heldResets = end && held ? count(rs, (x) => x.type === 'action' && x.source === 'auto' && x.by === 'reset:p' && x.tick > held.tick && x.tick <= end.tick) : null;
    const after = end ? pResets(rs, end.tick + 1) : 0;
    const ok = !!(r.ok && st && st.state === 'done' && st.holds.length === 0 && call.length === 1 && call[0].call === 'doReset' && call[0].did === true && call[0].queue.step === 3
      && JSON.stringify(call[0].at) === '["au","queue"]' && end && end.released === 1 && heldResets === 0 && after > 0);
    row({ gate: 'R1 hold → wait → call → end: the reflex is held, the queue calls, the end RELEASES the hold and the reflex acts again', id: 'ptr', ok,
      notes: `state ${st && st.state}, holds at the stop ${JSON.stringify(st && st.holds)}; queue records: ${['load', 'trigger', 'hold', 'wait-met', 'comment', 'end'].map((k) => `${k} ${qrec(rs, k).length}`).join(', ')}; queue calls ${call.length} (${call.map((c) => `${c.call}(${c.args}) step ${c.queue.step} at ${JSON.stringify(c.at)} did ${c.did}`).join('; ')}); reset:p by the reflex while held ${heldResets}, after the end ${after}; released at the end ${end && end.released}` });
  }
  // R2
  {
    const r = R.R2, rs = recs('R2'), st = r.queueStatus && r.queueStatus.queues[0];
    const to = qrec(rs, 'wait-timeout')[0], ab = qrec(rs, 'abort')[0], held = qrec(rs, 'hold')[0];
    const heldResets = ab && held ? count(rs, (x) => x.type === 'action' && x.source === 'auto' && x.by === 'reset:p' && x.tick > held.tick && x.tick <= ab.tick) : null;
    const after = ab ? pResets(rs, ab.tick + 1) : 0;
    const ok = !!(r.ok && st && st.state === 'aborted' && /timed out after 10 s/.test(st.outcome || '') && st.holds.length === 0 && to && to.waited === 10 && ab && ab.released === 1 && heldResets === 0 && after > 0);
    row({ gate: 'R2 a wait TIMES OUT → abort releases the hold (and the reflex acts again)', id: 'ptr', ok,
      notes: `state ${st && st.state} (${st && st.outcome}); wait-timeout after ${to && to.waited} s at tick ${to && to.tick}; abort released ${ab && ab.released}; reset:p by the reflex while held ${heldResets}, after the abort ${after}; holds at the stop ${JSON.stringify(st && st.holds)}` });
  }
  // R3
  {
    const r = R.R3, rs = recs('R3'), u = qrec(rs, 'unload')[0];
    const after = u ? pResets(rs, u.tick) : 0, before = u ? count(rs, (x) => x.type === 'action' && x.source === 'auto' && x.by === 'reset:p' && x.tick >= 1 && x.tick < u.tick) : null;
    const ok = !!(r.ok && r.eval && r.eval.ok === true && r.eval.released === 1 && r.eval.state === 'running' && u && u.released === 1 && r.queueStatus && r.queueStatus.queues.filter((q) => !q.shipped).length === 0 && before === 0 && after > 0);
    row({ gate: 'R3 UNLOAD mid-queue (tick 30, mid-wait) releases the hold', id: 'ptr', ok,
      notes: `unload() → ${JSON.stringify(r.eval)}; the unload record at tick ${u && u.tick} released ${u && u.released}; queues loaded at the stop ${r.queueStatus && r.queueStatus.queues.filter((q) => !q.shipped).length} (+ the table's ${r.queueStatus && r.queueStatus.queues.filter((q) => q.shipped).length}); reset:p by the reflex before the unload (from tick 1) ${before}, after it ${after}` });
  }
  // R4
  {
    const e = R.R4.eval || {};
    const ok = !!(R.R4.ok && e.last && e.last.code === 'held:queue' && e.last.values.queue === 'tpl1-unload-mid' && e.last.values.step === 1 && /Held by queue tpl1-unload-mid \(step 1\)/.test(e.text || '')
      && e.tv && e.tv.by === 'queue' && e.tv.word === 'Off' && /HELD/.test(e.html || '') && /tpl1-unload-mid/.test(e.html || '') && e.codes > 0);
    row({ gate: 'R4 the held feature\'s REASON names the queue and the step (explain, the toggle view, the HELD line)', id: 'ptr', ok,
      notes: `reason ${JSON.stringify(e.last)} — "${e.text}"; toggle ${e.tv && e.tv.word} by ${e.tv && e.tv.by} ${JSON.stringify(e.tv && e.tv.heldBy)}; line ${String(e.html || '').replace(/<[^>]+>/g, '').slice(0, 160)}; held:queue decisions ${e.codes}` });
  }
  // R5 — every leg's log replays EQUAL, and the queue's calls were among what was compared
  {
    const out = [];
    for (const n of ['R1', 'R2', 'R3']) {
      const rp = await replay(L(n)), rs = recs(n);
      out.push({ n, equal: rp.equal, compared: rp.compared, applied: rp.applied, unapplied: rp.unapplied, queueCalls: count(rs, (x) => x.type === 'action' && x.source === 'queue'), queueRecs: count(rs, (x) => x.type === 'queue'), mismatch: rp.mismatch || rp.error || null });
    }
    const ok = out.every((x) => x.equal && x.unapplied === 0) && out.find((x) => x.n === 'R1').queueCalls === 1 && out.every((x) => x.queueRecs > 0);
    row({ gate: 'R5 replay of a log WITH queue records is EQUAL (queue calls re-applied in the queue\'s slot)', id: 'ptr', ok,
      notes: out.map((x) => `${x.n}: equal ${x.equal}, ${x.compared ? x.compared.action + ' actions + ' + x.compared.checkpoint + ' checkpoints' : '?'} compared, ${x.applied} applied, ${x.unapplied} unapplied; queue calls ${x.queueCalls}, queue records ${x.queueRecs}${x.mismatch ? ' MISMATCH ' + JSON.stringify(x.mismatch).slice(0, 300) : ''}`).join(' | ') });
  }
}

// ---- Part oracle -----------------------------------------------------------------------------------------------------
// ⚠ This file is the ORACLE, and ptr's ids are its data. Every expected value is from the design notes (§12, §14) or
// the game SOURCE (games/ptr/js/layers.js), cited per row — never from the template's own output.
const Q22_PRE = 'tools/harness/snapshots/ptr/tpl1/q22-pre.json';       // the brief's state: the last log checkpoint without q22
const Q22_CYCLE = 'tools/harness/snapshots/ptr/tpl1/q22-cycle.json';   // the control: the end of the reflex's last q reset before it
const REFLEX_Q22_TICK = 76931;     // all/M26 — the reflex bought q22 at q.time 55 for 4.08e18 (docs/automation.md R3c)
const verdictCounts = {};
function tally(R) { for (const v of (R && R.results) || []) verdictCounts[v.verdict] = (verdictCounts[v.verdict] || 0) + 1; }
async function partOracle() {
  // ---- O1 — the QL5 state, built as §12 built it: the shipped table from all/M26 until Quirk Layers ≥ 5 ----------------
  const ql5dir = path.join(TMP, 'ql5');
  const b = await run('ptr', { 'from-snapshot': 'tools/harness/snapshots/ptr/all/M26.json', profile: 'all', ticks: 100000, until: 'player.q.buyables[11].gte(5)', 'stop-snapshot': ql5dir, 'stop-snapshot-name': 'QL5' });
  const QL5 = path.join(ql5dir, 'QL5.json');
  const [o1, indep, o2, o2c, s0, s5, coe, pfresh] = await Promise.all([
    strategize('ptr', ['--from', QL5, '--goal', 'upg:q:23']),
    // the INDEPENDENT instrument: §12's own configuration (row-3 resets and challenges:h EXCLUDED at registration, not
    // held) ticked to q.time 50 from the same state, energy and the LIVE price read by --eval
    run('ptr', { 'from-snapshot': QL5, profile: 'all', ticks: 50, 'auto-opt': 'exclude=reset:h,challenges:h,reset:q,reset:o,reset:ss', eval: "({t: Number(player.q.time), e: String(player.q.energy), live: String(layers.q.upgrades[23].cost()), stale: String(tmp.q.upgrades[23].cost), total: String(player.q.total), nUpg: player.q.upgrades.length, ql: Number(player.q.buyables[11]), free: String(tmp.q.freeLayers), impr11: String(improvementEffect('q', 11)), quirks: String(player.q.points)})" }),
    strategize('ptr', ['--from', Q22_PRE, '--goal', 'upg:q:22']),
    strategize('ptr', ['--from', Q22_CYCLE, '--goal', 'upg:q:22']),
    strategize('something', []), strategize('something', ['--from', 'tools/harness/snapshots/something/all/S05.json']), strategize('collection-of-everything', []),
    strategize('ptr', []),
  ]);
  [o1, o2, o2c].forEach(tally);
  // O1
  {
    const v = o1.results && o1.results[0], e = indep.eval || {};
    const L = (x) => Math.log10(Number(x));
    const indepLive = L(e.e) - L(e.live), indepStale = L(e.e) - L(e.stale);
    const s50 = v && v.rollback.trace.find((s) => s.field === 50);
    const levers = (v && v.levers) || [], first = levers[0] || {};
    const tot = levers.find((l) => l.input === 'player.q.total'), sb = levers.find((l) => l.input === 'player.sb.points'), qlv = levers.find((l) => l.input === 'player.q.buyables.11');
    // source: q11 = (log10(total+1)+1)^(#q upgrades) ^ impr11 (layers.js q.upgrades[11].effect); enGainMult = q11 × q21 × … ;
    // the production's exponent E = Quirk Layers + free − 1 (layers.js enGainExp) → the multiplier must rise by R^(1/E)
    const E = (e.ql || 0) + Number(e.free || 0) - 1, R = v ? Math.pow(10, -v.rollback.peak.ratioLog10) : NaN;
    const base0 = Math.log10(Number(e.total) + 1) + 1, need = Math.pow(10, base0 * Math.pow(Math.pow(R, 1 / E), 1 / (e.nUpg * Number(e.impr11)))  - 1) - 1;
    const qlCost = Math.pow(2, Math.pow(2, e.ql) - 1);   // layers.js q.buyables[11].cost: base^(base^x − 1), base 2 here
    const checks = {
      verdict: !!v && v.verdict === 'waiting-cannot-help',
      // §12: the best ratio ≈ 0.02 at q.time ≈ 50 — a band, by value
      peakBand: !!v && v.rollback.peak.ratioLog10 >= Math.log10(0.015) && v.rollback.peak.ratioLog10 <= Math.log10(0.025) && Number(v.rollback.peak.field) >= 35 && Number(v.rollback.peak.field) <= 60,
      // the template's sample at q.time 50 = the independent boot's readings there (to 1e-3 in log10): purse ÷ the price the
      // engine CHARGES (tmp, computed at the tick's start — utils.js buyUpg) and purse ÷ the live declaration
      vsIndependent: !!s50 && Math.abs(s50.ratioLog10 - indepStale) <= 1e-3 && Math.abs(s50.liveLog10 - indepLive) <= 1e-3,
      noQueue: !!v && v.queue === null,
      nearestIsTotal: first.input === 'player.q.total' && !!v.subgoal && v.subgoal.dimension === 'player.q.total',
      totalVsSource: !!tot && Math.abs(Math.log10(Number(tot.need)) - Math.log10(need)) <= 0.005,
      sbIsAWall: !!sb && sb.distanceLog10 >= 5 && /player\.points/.test(sb.binding || '') && sb.distanceLog10 > tot.distanceLog10,
      quirkLayerVsSource: !!qlv && Number(qlv.cost) === qlCost && qlv.currency === 'player.q.points' && qlv.flips === true,
      ranking: levers.map((l) => l.input).join(',') === 'player.q.total,player.q.buyables.11,player.sb.points',
      neutral: !!v && v.neutral === true,
    };
    row({ gate: 'O1 upg:q:23 at QL5: WAITING CANNOT HELP — the peak, the levers and their ranking against §12/§14 and the source; no queue', id: 'ptr', ok: !!b.ok && Object.values(checks).every(Boolean),
      notes: `${Object.entries(checks).map(([k, x]) => `${k} ${x ? '✓' : '✗'}`).join(' ')} — QL5 built at tick ${b.ticks} (§12: 77,196); verdict ${v && v.verdict}; peak 10^${v && v.rollback.peak.ratioLog10} (= ${v ? Math.pow(10, v.rollback.peak.ratioLog10).toPrecision(4) : '?'}) at q.time ${v && v.rollback.peak.field}; at q.time 50 the template reads 10^${s50 && s50.ratioLog10} charged / 10^${s50 && s50.liveLog10} live, the independent boot 10^${indepStale.toFixed(4)} (= ${Math.pow(10, indepStale).toPrecision(4)}, §12's 0.0193) / 10^${indepLive.toFixed(4)}; levers: ${levers.map((l) => `${l.input} ${l.need !== undefined ? '→ ' + l.need : ''} (10^${l.distanceLog10})`).join(' ; ')}; source: total quirks ${e.total} → ${need.toFixed(0)} (E ${E}, ${e.nUpg} upgrades, impr11 ${e.impr11}), the next Quirk Layer ${qlCost} quirks (${e.quirks} held); §14's 9e5 assumed 8e4 total quirks, this state holds ${e.total}` });
  }
  // O2 — the template says BUY; the emitted queue, played LIVE from the same state, buys q22 on the copy's tick
  {
    const v = o2.results && o2.results[0];
    const qfile = path.join(TMP, 'q22.queue.json'), log = path.join(TMP, 'q22.jsonl');
    if (v && v.queue) fs.writeFileSync(qfile, JSON.stringify(v.queue));
    const live = v && v.queue ? await run('ptr', { 'from-snapshot': Q22_PRE, profile: 'all', ticks: 400, queue: qfile, log, until: "hasUpgrade('q',22)", eval: "({q22: hasUpgrade('q',22), t: Number(player.q.time), e: String(player.q.energy)})" }) : null;
    const rs = live && fs.existsSync(log) ? logRecords(log) : [];
    const buy = rs.find((x) => x.type === 'action' && x.source === 'queue' && x.call === 'buyUpgrade' && x.did === true);
    const rp = live ? await replay(log) : null;
    const st = live && live.queueStatus && live.queueStatus.queues[0];
    const checks = {
      verdict: !!v && v.verdict === 'buy-at',
      confirmed: !!v && !!v.confirm && v.confirm.played === true && v.confirm.bought === true && !!v.confirm.at,
      liveBuys: !!live && live.ok && live.eval && live.eval.q22 === true && !!buy && buy.queue.step === 3,
      liveTickIsCopyTick: !!buy && !!v && !!v.confirm && !!v.confirm.at && buy.tick + 1 === v.confirm.at.tick,
      holdsReleased: !!st && st.state === 'done' && st.holds.length === 0,
      replayEqual: !!rp && rp.equal === true && rp.unapplied === 0,
      neutral: !!v && v.neutral === true,
      // the CONTROL, against an independent instrument — the reflex itself: from the end of its last q reset before the
      // purchase (76,878) the copy must buy on the reflex's own tick
      controlOnReflexTick: !!o2c.results && o2c.results[0].verdict === 'buy-at' && !!o2c.results[0].confirm && !!o2c.results[0].confirm.at && o2c.results[0].confirm.at.tick === REFLEX_Q22_TICK,
    };
    const sTick = (JSON.parse(fs.readFileSync(path.join(REPO, Q22_PRE), 'utf8'))).ticks;
    row({ gate: 'O2 upg:q:22 at 4 Quirk Layers: BUY AT t* — confirmed on the copy, and the queue played LIVE buys it on the same tick; its log replays', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${Object.entries(checks).map(([k, x]) => `${k} ${x ? '✓' : '✗'}`).join(' ')} — from tick ${sTick}; verdict ${v && v.verdict}; t* ${JSON.stringify(v && v.tStar)}; the copy bought at ${JSON.stringify(v && v.confirm && v.confirm.at)}; LIVE: the queue's buyUpgrade at tick ${buy ? buy.tick + 1 : '—'} (q.time ${live && live.eval && live.eval.t}) against the reflex's ${REFLEX_Q22_TICK} (${buy ? (buy.tick + 1 - REFLEX_Q22_TICK) + ' ticks' : '—'}); queue ${st && st.state}, holds ${JSON.stringify(st && st.holds)}; replay ${rp ? `equal ${rp.equal}, ${rp.compared && rp.compared.action} actions compared, ${rp.unapplied} unapplied` : '—'}; control from 76,878: ${o2c.results ? o2c.results[0].verdict + ', the copy bought at ' + JSON.stringify(o2c.results[0].confirm && o2c.results[0].confirm.at) : o2c.error}` });
  }
  // O3 — generality: no throw on games the template was not written for; the count, by name
  {
    const legs = [['something fresh', s0], ['something all/S05', s5], ['collection-of-everything fresh', coe]];
    const ok = legs.every(([, r]) => r && !r.error && r.exit === 0 && r.results.every((x) => x.verdict !== 'threw'));
    row({ gate: 'O3 generality: the template runs on something and collection-of-everything without a throw', id: 'something+coe', ok,
      notes: legs.map(([n, r]) => r && r.counts ? `${n}: ${r.counts['time-priced-purchase'].matches} match(es) (funnel ${JSON.stringify(r.counts['time-priced-purchase'].funnel)}), verdicts ${JSON.stringify(r.counts['time-priced-purchase'].verdicts)}` : `${n}: ${r && r.error}`).join(' | ') });
  }
  // VACUITY — the run's row: the oracles above were reached, and the pattern finds the time-priced q upgrades at all
  {
    const pf = pfresh.counts && pfresh.counts['time-priced-purchase'];
    // (m31) DERIVED from the facts file, no longer a literal: every q upgrade whose price fact (any state) is a POWER in
    // player.q.time — 10 (q11–q24, q31, q32) since m28/QL6, 12 (+ q33, q34) since the declared stages/M30 (⚖ the count
    // moved because a facts state was declared, not because the template did). The SET must equal the template's goals.
    const ptrFacts = JSON.parse(fs.readFileSync(path.join(REPO, 'games-facts/ptr.json'), 'utf8'));
    const timePriced = ptrFacts.facts.filter((f) => /^price:q:upgrade:/.test(f.id) && (f.variants || [f]).some((v) => v.shapes && v.shapes['player.q.time'] && v.shapes['player.q.time'].type === 'power'))
      .map((f) => 'upg:q:' + f.id.split(':').pop()).sort();
    const goals = (pfresh.results || []).filter((x) => x.template === 'time-priced-purchase').map((x) => x.goal).sort();
    const ok = verdictCounts['waiting-cannot-help'] === 1 && verdictCounts['buy-at'] === 2 && Object.keys(verdictCounts).length === 2 && !!pf && timePriced.length >= 10 && pf.matches === timePriced.length && JSON.stringify(goals) === JSON.stringify(timePriced) && pf.open === 0;
    row({ gate: `V vacuity: the verdicts COUNTED — one waiting-cannot-help (O1), two buy-at (O2 and its control), nothing else; ptr fresh matches exactly the ${timePriced.length} q upgrades the facts price as a power in q.time, none open`, id: 'ptr', ok,
      notes: `verdicts ${JSON.stringify(verdictCounts)}; ptr fresh ${pf ? `${pf.matches} matches, ${pf.open} open, ${JSON.stringify(pf.verdicts)} — goals ${pfresh.results.map((x) => x.goal).join(' ')}` : pfresh.error}` });
  }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-queue.js', 'loader/tmt-templates.js'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the runner or the template', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

const EXPECT = { inert: 3, runner: 5, oracle: 4, grep: 1 };
const FN = { inert: partInert, runner: partRunner, oracle: partOracle, grep: partGrep };
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT tpl1 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-tpl1-part-${PART}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
if (!a['no-summary']) appendSection({ title: `tpl1 — part ${PART}`, commit, dirty, rows, slug: null, reading: 'inert = no queue moves nothing; runner = holds released on end / abort / unload, the reason names the queue, replay equal; oracle = O1 waiting cannot help (q23 at QL5), O2 buy at t* (q22), O3 generality, the verdicts counted; grep = no game id in the runner or the template.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
