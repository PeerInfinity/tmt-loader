// The stages gates — the table's STAGE-GATED entries (stages-1; ptr-strategy design notes §19-R.2, "planner finds, data
// records"): what the harness found at QL5 and QL6, written into `games-auto/ptr.json` as `stages`, so the page plays
// them with no planner, no queue and no harness configuration.
//
//   node tools/harness/gates-stages.mjs --part vocab|switch|pins|fixture|grep|push|page [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-stages.mjs --part leg --leg <key> [--assert]      (one CI job per leg: qrate1.yml -f part=stages)
//   node tools/harness/gates-stages.mjs --part merge --dir <artifacts> [--only <key>] [--assert]
//
// Part vocab    V1 the schema is ONE source and REQUIRES a stage's provenance; the provenance gate checks a stage's
//               records. V2 a stage whose `when` THROWS reads as FALSE on the real game — the policy is the table's, the
//               readout and the state log say so — and the same stage with a `when` that holds DOES change the game
//               (vacuity). V3 a bad stage fails the load by name. V4 the cost: evaluations = loops × stages, and the
//               ms/tick with and without them over the same pre-QL5 stretch (inert there: equal hashes).
// Part switch   S1 from all/M26 the state log shows `ql5-quirk-rate` switch on at the QL5 tick and `reset:q`'s rule
//               change there (gain>=N before, rate-peak after). S2 from all/M26 to H22 + 300 ticks:
//               `ql6-hold-for-q32` on at the QL6 tick and (shipq-1) the table's shipped queue `ca-ch-h-22` — the H22
//               attempt that was the stage `ql6-h22-attempt` — starting in that loop, ONE uncut H22 attempt, the queue
//               done at the H22 tick, no challenge entered after it (the hold). S3 mid-attempt the readout NAMES the
//               queue (the reason text, the block HTML, its status). S4 a player's saved edit beats a stage. S5 a queue
//               hold beats a stage.
// Part pins     P1 the QL5 rebuild (tpl1 O1 / qrate1 F0a) is unmoved. P2 the stage path reaches q23 on the tick and
//               hash the `--auto-opt` resume of the same winner measured — the table now carries that configuration.
// Part fixture  F1 stages/M29 and F2 stages/M28 = all/M26 under the shipped table, one ladder run = the committed fixtures.
// Part grep     X1 no game or ptr layer id in loader/tmt-auto.js (the stages are DATA).
// Part page     PG a real page (`?automation=1&profile=all`) loaded from the stages/M29 save names the stages in force.
// MEASUREMENTS (`.github/workflows/qrate1.yml -f part=stages`, dispatch-only): the whole stretch from all/M26 under the
// SHIPPED TABLE ALONE (order A: H22 first) at diff 1 and 0.05, and the losing order (B: q31/q32 first) at diff 1 — each
// leg TWICE (equal or RED). The diff-1 A leg writes the M28 + M29 fixtures (committed as stages/) and runs on to name the next stall.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { loadSchemaBlock, checkTables, checkProvenance } from '../auto-tables.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'dir', 'only']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['vocab', 'switch', 'pins', 'fixture', 'grep'];
// `page` is a gate too, run as its own CI step (it needs the Playwright browser); `push` is the five node parts
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'page', 'push', 'leg', 'merge'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-stages-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1800)}`); };

// ⚠ This file is the ORACLE, and ptr's ids are its data (the loader may not name them — part grep).
const TABLE = 'games-auto/ptr.json';
const LADDER = 'tools/harness/ladder/ptr.json';
// ⚖ (user, 2026-10-01) the M28/M29 fixtures live in `stages/`, NOT `all/`: an `all/` mark enrols in facts.mjs's and
// currency-data.mjs's state lists and in deepestSnapshot(), and the first state with H31 unlocked fires two facts-1
// oracles that find generator gaps (design notes §21) — that enrolment is the M30 slice's, with those findings.
const M26 = 'tools/harness/snapshots/ptr/all/M26.json', M28F = 'tools/harness/snapshots/ptr/stages/M28.json', M29F = 'tools/harness/snapshots/ptr/stages/M29.json';
const QL5F = 'tools/harness/snapshots/ptr/qrate1/QL5.json';
const PIN_QL5 = { ticks: 77196, hashGame: '1fb78f9282c77b2b' };          // §17.2 / tpl1 O1 / qrate1 F0a
const PIN_Q23 = { ticks: 80134, hashGame: 'c2d9442da073bfab' };          // QL5 under `--auto-opt policy:reset:q=<winner>` until q23 (stages-1, measured at f66f217)
const WINNER = 'rate-peak@0/0|turn@10/30x/5/0/100';                      // qrate1's winner (§17.2)
const C1 = 'ql5-quirk-rate', C2 = 'ql6-hold-for-q32', C3 = 'ql6-h22-attempt';
// (shipq-1) C3 is no longer a stage: the H22 attempt ships as the table's conditional QUEUE `ca-ch-h-22` (docs/queues.md,
// "Shipped queues"), on the same ticks and hashes (gates-shipq). The losing order B is measured on the table BEFORE that
// slice, kept byte for byte, where C3 was still a stage.
const H22Q = 'ca-ch-h-22';
const TABLE_BEFORE_SHIPQ = 'tools/harness/snapshots/ptr/shipq/table-before-shipq.json';
const QL = 'player.q.buyables[11].plus(tmp.q.freeLayers)';
const EXITING = ['h', 'q', 'o', 'ss'];                                    // the resets that end an h attempt (h22's exits-challenge facts)

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
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { wallMs: Date.now() - t0 }); } catch { return { ok: false, error: 'no result: ' + r.out.slice(-400), wallMs: Date.now() - t0 }; }
}
async function pool(fns) {
  const out = new Array(fns.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, fns.length) }, async () => { while (i < fns.length) { const k = i++; out[k] = await fns[k](); } }));
  return out;
}
const logRecords = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');
const tableDoc = () => JSON.parse(fs.readFileSync(path.join(REPO, TABLE), 'utf8'));
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
/** The shipped table with the two QL6 stages in the OTHER order (B: hold for q31/q32 first, then H22). */
function orderBTable() {
  const t = fixture(TABLE_BEFORE_SHIPQ);
  const i2 = t.stages.findIndex((s) => s.id === C2), i3 = t.stages.findIndex((s) => s.id === C3);
  if (i2 < 0 || i3 < 0) throw new Error('the shipped table has no ' + C2 + ' / ' + C3 + ' stage');
  const s = t.stages.slice(); const lo = Math.min(i2, i3);
  const [x, y] = [s[i2], s[i3]];
  s.splice(Math.max(i2, i3), 1); s.splice(lo, 1); s.splice(lo, 0, x, y);    // C2 before C3, everything else in place
  t.stages = s;
  return t;
}
const writeTmp = (name, obj) => { const f = path.join(TMP, name); fs.writeFileSync(f, JSON.stringify(obj, null, 1)); return f; };
/** Every stage record of a state log, as [stage, on, tick, error]. */
const stageRecs = (recs) => recs.filter((r) => r.type === 'stage').map((r) => [r.stage, r.on, r.tick, r.error || null]);
const resetRules = (recs, layer) => recs.filter((r) => r.type === 'action' && r.by === `reset:${layer}` && r.call === 'doReset' && r.why && r.why.code === 'acted:reset').map((r) => [r.tick, r.why.values.rule]);

// ---- Part vocab --------------------------------------------------------------------------------------------------------
async function partVocab() {
  // V1 — one schema, provenance required, and the provenance gate reads a stage's records
  {
    const blk = loadSchemaBlock(REPO);
    const st = blk.TABLE_SCHEMA.properties.stages;
    const t = tableDoc();
    const noProv = Object.assign({}, t, { stages: t.stages.map((s, i) => { if (i) return s; const c = Object.assign({}, s); delete c.provenance; return c; }) });
    const errNoProv = blk.schemaErrors(noProv, blk.TABLE_SCHEMA, 'ptr.json');
    const badCommit = Object.assign({}, t, { stages: [Object.assign({}, t.stages[0], { provenance: { gate: 'stages-V1', commit: 'deadbee', note: 'a record whose commit is not frozen' } })] });
    const pv = checkProvenance(badCommit, { labels: [], known: () => false });
    const c = checkTables(REPO);
    const checks = {
      schemaFresh: !c.problems.length && c.rows.every((r) => r.ok),
      requiresProvenance: !!st && st.items.required.includes('provenance') && errNoProv.some((e) => /missing "provenance"/.test(e)),
      shippedHasStages: Array.isArray(t.stages) && [C1, C2].every((id) => t.stages.some((s) => s.id === id)) && !t.stages.some((s) => s.id === C3) && (t.queues || []).some((q) => q.id === H22Q),
      gateReadsStageRecords: pv.bad.some((b) => b.startsWith(`stage:${t.stages[0].id}:`)),
    };
    row({ gate: 'V1 the stages schema is ONE source, REQUIRES provenance, and the provenance gate reads a stage\'s records', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — no-provenance errors: ${JSON.stringify(errNoProv.slice(0, 2))}; bad-commit: ${JSON.stringify(pv.bad.slice(0, 1))}; stages ${t.stages.map((s) => s.id).join(', ')}` });
  }
  // V2 — a THROWING `when` reads as false on the real game; the same stage with a `when` that holds changes the game
  const probe = (when) => { const t = tableDoc(); t.stages = [{ id: 'probe', when, policies: { 'reset:p': 'always' }, provenance: { unverified: true, note: 'gates-stages V2 probe' } }, ...t.stages]; return t; };
  const EVP = "(function(){ var r = tmtLoader.explain().filter(function(x){ return x.id === 'reset:p'; })[0]; return { inForce: r.policy.inForce, stage: r.stage, last: r.last && r.last.stage, text: r.last ? tmtLoader.reasonText(r.last) : null, stages: tmtLoader.stages().filter(function(s){ return s.id === 'probe'; }), hist: tmtLoader.stageHistory() }; })()";
  const fThrow = writeTmp('probe-throws.json', probe('player.nosuchLayer.points.gte(1)')), fTrue = writeTmp('probe-true.json', probe('true'));
  const logT = path.join(TMP, 'v2.jsonl');
  // V3 — load refusals on the real game
  const dup = tableDoc(); dup.stages = [...dup.stages, Object.assign({}, dup.stages[0])];
  const unk = tableDoc(); unk.stages = [{ id: 'unknown-feature', when: 'true', policies: { 'reset:zz': 'always' }, provenance: { unverified: true, note: 'V3' } }];
  const fDup = writeTmp('dup.json', dup), fUnk = writeTmp('unk.json', unk);
  // V4 — the cost over a stretch where no stage is in force (all/M26 → +250 ticks: QL5 is +265)
  const [thr, tru, ship, dupR, unkR, costOn, costOff] = await pool([
    () => run('ptr', { profile: 'all', diff: 1, ticks: 60, 'auto-table': fThrow, eval: EVP, log: logT }),
    () => run('ptr', { profile: 'all', diff: 1, ticks: 60, 'auto-table': fTrue, eval: EVP }),
    () => run('ptr', { profile: 'all', diff: 1, ticks: 60 }),
    () => run('ptr', { profile: 'all', diff: 1, ticks: 1, 'auto-table': fDup }),
    () => run('ptr', { profile: 'all', diff: 1, ticks: 1, 'auto-table': fUnk }),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 250, eval: '(tmtLoader.stageStats())' }),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 250, 'auto-opt': 'stages=off', eval: '(tmtLoader.stageStats())' }),
  ]);
  {
    const e = thr.eval || {}, st = (e.stages || [])[0] || {};
    const recs = stageRecs(logRecords(logT)).filter((r) => r[0] === 'probe');
    const checks = {
      ran: !!thr.ok && !!tru.ok && !!ship.ok,
      tablePolicyInForce: e.inForce === 'gain>=2x',
      notActive: st.active === false && typeof st.error === 'string' && st.error.length > 0,
      readoutSaysSo: !!e.stage && e.stage.errors.length === 1 && e.stage.errors[0].stage === 'probe' && /could not be evaluated/.test(String(e.text)),
      gameUnmoved: thr.hashGame === ship.hashGame && thr.ticks === ship.ticks,
      oneLogRecord: recs.length === 1 && recs[0][1] === false && recs[0][3] === st.error,
      vacuity: !!tru.eval && tru.eval.inForce === 'always' && tru.hashGame !== ship.hashGame,
    };
    row({ gate: 'V2 a stage whose `when` THROWS reads as FALSE (the table\'s policy, the readout and the state log say so); one that holds moves the game', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — throws: ${e.inForce} / ${thr.hashGame}; shipped ${ship.hashGame}; holds: ${tru.eval && tru.eval.inForce} / ${tru.hashGame}; text "${String(e.text).slice(0, 220)}"; log ${JSON.stringify(recs)}` });
  }
  {
    const why = (r) => String(r.error || (r.file_errors || []).map((x) => x.error).join(' ') || '');
    const checks = { duplicateRefused: !dupR.ok && /used twice/.test(why(dupR)), unknownRefused: !unkR.ok && /not a derived feature/.test(why(unkR)) };
    row({ gate: 'V3 a bad stage FAILS THE LOAD by name (a duplicate id, a feature the game does not have)', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — dup: ${why(dupR).slice(0, 200)} | unknown: ${why(unkR).slice(0, 200)}` });
  }
  {
    const s = costOn.eval || {};
    const msOn = costOn.ticks_ms / 250, msOff = costOff.ticks_ms / 250;
    const checks = { ran: !!costOn.ok && !!costOff.ok, inertBeforeQL5: costOn.hashGame === costOff.hashGame && costOn.ticks === costOff.ticks,
      oneEvalPerStagePerLoop: s.loops === 250 && s.evals === 250 * s.stages && s.stages === tableDoc().stages.length, offEvaluatesNothing: !!costOff.eval && costOff.eval.evals === 0 };
    row({ gate: 'V4 the cost: ONE evaluation per stage per loop, nothing under `stages=off`, and the game identical before QL5', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${JSON.stringify(s)}; ms/tick ${msOn.toFixed(2)} with the stages vs ${msOff.toFixed(2)} without (whole boot+run wall ÷ ticks, one sample each: a report, not a bound); ${costOn.ticks} / ${costOn.hashGame}` });
  }
}

// ---- Part switch -------------------------------------------------------------------------------------------------------
async function partSwitch() {
  const m29 = fixture(M29F);
  const log1 = path.join(TMP, 's1.jsonl'), log2 = path.join(TMP, 's2.jsonl');
  const EV_END = "(function(){ var r = function(id){ return tmtLoader.explain().filter(function(x){ return x.id === id; })[0]; }; var ch = r('challenges:h'); return { ql: Number(" + QL + "), h22: Number(player.h.challenges[22]||0), ac: player.h.activeChallenge, chPolicy: ch.policy.inForce, chStage: ch.stage, stages: tmtLoader.stages().map(function(s){ return [s.id, s.active]; }), stats: tmtLoader.stageStats() }; })()";
  const EV_MID = "(function(){ var R = tmtLoader.advancedRows(); var row = function(id){ return R.filter(function(x){ return x.id === id; })[0]; }; var q = row('reset:q'), ch = row('challenges:h'); return { ac: player.h.activeChallenge, q: { code: q.last && q.last.code, values: q.last && q.last.values, text: tmtLoader.reasonText(q.last), stage: q.stage, html: tmtLoader.featureBlockHTML(q, false) }, ch: { code: ch.last && ch.last.code, text: tmtLoader.reasonText(ch.last), stage: ch.stage, policy: ch.policy.inForce, html: tmtLoader.featureBlockHTML(ch, false) }, ctl: tmtLoader.controlState('reset:q')['while'], qs: (function(){ var s = tmtLoader.queues.status().queues.filter(function(x){ return x.id === '' + H22Q + ''; })[0]; return s ? { state: s.state, phase: s.shipped && s.shipped.phase, cur: s.current && s.current.do, until: s.wait && s.wait.until } : null; })() }; })()";
  // S4 — the QL5 fixture with a PLAYER's saved edit restoring the table's own reset:q (hashGame excludes `au`)
  const ql5 = fixture(QL5F), pl = JSON.parse(ql5.player);
  pl.au.edits = { 'reset:q': { policy: 'gain>=2|turn@10/30x/5/0/100' } };
  const fEdit = writeTmp('QL5-edited.json', Object.assign({}, ql5, { player: JSON.stringify(pl) }));
  const EV_Q = "(function(){ var q = tmtLoader.explain().filter(function(x){ return x.id === 'reset:q'; })[0]; return { inForce: q.policy.inForce, saved: q.policy.saved, stage: q.stage, last: q.last && q.last.code, held: tmtLoader.queueLink.holds }; })()";
  // S5 — a queue that holds reset:q for 45 game-s from the QL5 fixture, then ends (and so releases)
  const fQueue = writeTmp('hold-q.json', { format: 'tmt-queue/1', id: 'stages-S5-hold', trigger: { on: 'start' }, source: 'authored',
    steps: [{ do: 'hold', features: ['reset:q'] }, { do: 'wait', until: 'false', timeout: { gs: 45 }, onTimeout: 'skip' }] });
  const logQ = path.join(TMP, 's5.jsonl'), logC = path.join(TMP, 's5c.jsonl');
  const [r1, ql6, r2, mid, edit, off, shipped, qmid, qrun, qctl] = await pool([
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 300, log: log1 }),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 12000, until: `${QL}.gte(6)` }),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: m29.ticks + 300 - fixture(M26).ticks, log: log2, eval: EV_END }),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 12000, until: `${QL}.gte(6) && player.h.activeChallenge && player.q.time.gte(100)`, eval: EV_MID }),
    () => run('ptr', { 'from-snapshot': fEdit, profile: 'all', ticks: 600, eval: EV_Q }),
    () => run('ptr', { 'from-snapshot': QL5F, profile: 'all', ticks: 600, 'auto-opt': 'stages=off', eval: EV_Q }),
    () => run('ptr', { 'from-snapshot': QL5F, profile: 'all', ticks: 600, eval: EV_Q }),
    () => run('ptr', { 'from-snapshot': QL5F, profile: 'all', ticks: 30, queue: fQueue, eval: EV_Q }),
    () => run('ptr', { 'from-snapshot': QL5F, profile: 'all', ticks: 200, queue: fQueue, log: logQ, eval: EV_Q }),
    () => run('ptr', { 'from-snapshot': QL5F, profile: 'all', ticks: 200, log: logC }),
  ]);
  // S1
  {
    const recs = logRecords(log1), st = stageRecs(recs), rules = resetRules(recs, 'q');
    const before = rules.filter(([t]) => t < PIN_QL5.ticks), after = rules.filter(([t]) => t >= PIN_QL5.ticks);
    const checks = {
      ran: !!r1.ok,
      oneSwitch: st.length === 1 && st[0][0] === C1 && st[0][1] === true,
      atTheQL5Tick: st.length === 1 && st[0][2] === PIN_QL5.ticks,
      tableRuleBefore: before.length > 0 && before.every(([, r]) => r === 'gain>=N'),
      stageRuleAfter: after.length > 0 && after.every(([, r]) => r === 'rate-peak@B/H'),
    };
    row({ gate: `S1 from all/M26 the state log switches ${C1} ON at the QL5 tick (${PIN_QL5.ticks}); reset:q's rule changes there`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — stage records ${JSON.stringify(st)}; reset:q ${before.length} × ${[...new Set(before.map((x) => x[1]))]} (last ${before.length ? before[before.length - 1][0] : '-'}) then ${after.length} × ${[...new Set(after.map((x) => x[1]))]} (first ${after.length ? after[0][0] : '-'})` });
  }
  // S2
  {
    const recs = logRecords(log2), st = stageRecs(recs);
    const T6 = ql6.ticks, T22 = m29.ticks;
    let ac = null; const att = { entered: [], completed: [], exitingInside: 0, enteredAfter: 0 };
    for (const r of recs) {
      if (r.type === 'checkpoint' && r.summary) { ac = r.summary['h.ac'] === undefined ? null : String(r.summary['h.ac']); continue; }
      if (r.type !== 'action') continue;
      const s = r.state || {};
      if (ac !== null && r.call === 'doReset' && r.did && EXITING.includes(String((r.args || [])[0]))) att.exitingInside++;
      if (!('h.ac' in s)) continue;
      const now = s['h.ac'] === null ? null : String(s['h.ac']);
      if (now !== null && ac === null) { att.entered.push([r.tick, now, r.by || r.source]); if (r.tick >= T22) att.enteredAfter++; }
      if (ac !== null && now === null && ('h.c.22' in s)) att.completed.push(r.tick);
      ac = now;
    }
    const want = [[C1, true, PIN_QL5.ticks], [C2, true, T6]];
    const got = st.map((x) => [x[0], x[1], x[2]]);
    // (shipq-1) the attempt is the shipped queue's: it starts in the loop the hold stage switches on, and ends at H22
    const qr = recs.filter((r) => r.type === 'queue' && r.queue === H22Q);
    const qTrig = qr.filter((r) => r.do === 'trigger').map((r) => r.tick), qEnd = qr.filter((r) => r.do === 'end').map((r) => r.tick);
    const sameSet = (x, y) => JSON.stringify([...x].map(String).sort()) === JSON.stringify([...y].map(String).sort());
    const e = r2.eval || {};
    const checks = {
      ran: !!r2.ok && !!ql6.ok,
      stageRecordsAtThePredictedTicks: got.length === want.length && sameSet(got, want),
      queueStartsWithTheStageAndEndsAtH22: qTrig.length === 1 && qTrig[0] === T6 && qEnd.length === 1 && qEnd[0] === T22,
      oneUncutAttempt: att.entered.length === 1 && att.entered[0][1] === '22' && att.entered[0][2] === 'queue' && att.entered[0][0] >= T6 && att.completed.length === 1 && att.exitingInside === 0,
      noEntryAfter: att.enteredAfter === 0,
      holdInForceAtTheEnd: e.chPolicy === 'off' && !!e.chStage && e.chStage.policy === C2 && e.h22 === 1,
    };
    row({ gate: `S2 from all/M26: ${C2} ON at the QL6 tick and the shipped queue ${H22Q} starts in that loop, ONE uncut H22 attempt, the queue done at the H22 tick, then the hold`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — QL6 at ${T6} (an independent run), H22 at ${T22} (stages/M29); stage records ${JSON.stringify(got)}; queue trigger ${JSON.stringify(qTrig)} end ${JSON.stringify(qEnd)}; entries ${JSON.stringify(att.entered)}, completed ${JSON.stringify(att.completed)}, exiting resets inside ${att.exitingInside}, entries after H22 ${att.enteredAfter}; end ${JSON.stringify({ chPolicy: e.chPolicy, chStage: e.chStage && e.chStage.policy, stages: e.stages })}` });
  }
  // S3
  {
    const e = mid.eval || {}, q = e.q || {}, ch = e.ch || {};
    const checks = {
      ran: !!mid.ok && e.ac !== null && e.ac !== undefined,
      // (shipq-1) the attempt is the shipped queue's: every exiting feature says which queue holds it, by name
      reasonNamesTheQueue: q.code === 'held:queue' && q.values && q.values.queue === H22Q && new RegExp(`queue ${H22Q}`).test(String(q.text)),
      blockNamesIt: new RegExp(H22Q).test(String(q.html)) && new RegExp(`STAGE[^]*${C1}`).test(String(q.html)),
      queueRunningOnItsWait: !!e.qs && e.qs.state === 'running' && e.qs.phase === 'running' && e.qs.cur === 'wait' && /canCompleteChallenge/.test(String(e.qs.until)),
      challengeRowNamesIt: ch.code === 'held:queue' && new RegExp(`queue ${H22Q}`).test(String(ch.text)),
    };
    row({ gate: 'S3 mid-attempt the readout NAMES the shipped queue: the reason lines, the Advanced block, and the queue\'s own status', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — tick ${mid.ticks}; reset:q "${String(q.text).slice(0, 160)}"; challenges:h "${String(ch.text).slice(0, 160)}"` });
  }
  // S4
  {
    const checks = {
      ran: !!edit.ok && !!off.ok && !!shipped.ok,
      editInForce: !!edit.eval && edit.eval.inForce === 'gain>=2|turn@10/30x/5/0/100' && edit.eval.saved === 'gain>=2|turn@10/30x/5/0/100' && edit.eval.stage && edit.eval.stage.shadowedBy === 'you',
      sameGameAsNoStages: edit.hashGame === off.hashGame && edit.ticks === off.ticks,
      vacuity: shipped.hashGame !== off.hashGame && !!shipped.eval && shipped.eval.inForce === WINNER,
    };
    row({ gate: 'S4 a PLAYER\'s saved edit beats a stage: from QL5 the edited save plays exactly the table without its stages', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — edited ${edit.ticks} / ${edit.hashGame} (${JSON.stringify(edit.eval && edit.eval.stage)}); stages=off ${off.hashGame}; shipped ${shipped.hashGame} (${shipped.eval && shipped.eval.inForce})` });
  }
  // S5
  {
    const qr = logRecords(logQ), cr = logRecords(logC);
    const rel = qr.filter((r) => r.type === 'queue' && ['release', 'end', 'abort'].includes(r.do)).map((r) => r.tick);
    const relTick = rel.length ? Math.min(...rel) : null;
    const qResets = resetRules(qr, 'q'), cResets = resetRules(cr, 'q');
    const checks = {
      ran: !!qmid.ok && !!qrun.ok && !!qctl.ok,
      heldWhileStageInForce: !!qmid.eval && qmid.eval.last === 'held:queue' && qmid.eval.inForce === WINNER && !!qmid.eval.stage && qmid.eval.stage.policy === C1,
      noResetWhileHeld: relTick !== null && qResets.every(([t]) => t >= relTick),
      // after the release the feature decides again, under the STAGE's policy (rate-peak may still be WAITING: a 45-s hold
      // leaves a quirk rate that is still rising — measured: no reset in the next 159 ticks — so the row asks for the
      // decision, not for an act); any reset it does make is the stage's rule
      backUnderTheStageAfterRelease: !!qrun.eval && qrun.eval.held === null && qrun.eval.last !== 'held:queue' && qrun.eval.inForce === WINNER && !!qrun.eval.stage && qrun.eval.stage.policy === C1 && qResets.every(([, r]) => r === 'rate-peak@B/H'),
      controlActsDuringTheHold: relTick !== null && cResets.some(([t]) => t < relTick),
    };
    row({ gate: 'S5 a QUEUE HOLD beats a stage: held (and named) while the stage is in force, the stage\'s rule after the release', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — mid-hold ${JSON.stringify(qmid.eval)}; queue released at ${relTick}; at the end ${JSON.stringify(qrun.eval && { last: qrun.eval.last, inForce: qrun.eval.inForce, stage: qrun.eval.stage && qrun.eval.stage.policy, held: qrun.eval.held })}; reset:q with the queue ${JSON.stringify(qResets.slice(0, 3))}; without ${JSON.stringify(cResets.slice(0, 3))}` });
  }
}

// ---- Part pins ---------------------------------------------------------------------------------------------------------
async function partPins() {
  const [ql5, q23] = await pool([
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 1000, until: 'player.q.buyables[11].gte(5)' }),
    () => run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: 8000, until: "hasUpgrade('q',23)" }),
  ]);
  row({ gate: 'P1 the QL5 rebuild (tpl1 O1, qrate1 F0a: all/M26 under the shipped table until Quirk Layers ≥ 5) is unmoved', id: 'ptr', ok: !!ql5.ok && ql5.ticks === PIN_QL5.ticks && ql5.hashGame === PIN_QL5.hashGame,
    notes: `${ql5.ticks} / ${ql5.hashGame} (pin ${PIN_QL5.ticks} / ${PIN_QL5.hashGame}) ${ql5.error || ''}` });
  row({ gate: 'P2 the stage path reaches q23 on the tick and hash of QL5 resumed under `--auto-opt policy:reset:q=<winner>` (the table carries the configuration)', id: 'ptr', ok: !!q23.ok && q23.ticks === PIN_Q23.ticks && q23.hashGame === PIN_Q23.hashGame,
    notes: `${q23.ticks} / ${q23.hashGame} (the resume's ${PIN_Q23.ticks} / ${PIN_Q23.hashGame}) ${q23.error || ''}` });
}

// ---- Part fixture ------------------------------------------------------------------------------------------------------
// ONE ladder run from all/M26 under the shipped table until M28 AND M29 hold, recording each where it first holds: each
// committed fixture is rebuilt to its tick and hashGame, and names the configuration it was written under.
async function partFixture() {
  const m26 = fixture(M26), want = { M29: fixture(M29F), M28: fixture(M28F) };
  const x = await run('ptr', { 'from-snapshot': M26, profile: 'all', ticks: want.M28.ticks - m26.ticks + 50, ladder: LADDER, to: 'M29', 'until-all': true, 'marks-continue': true });   // the slice M27–M29 (M29 is AFTER M28 in the ladder; it lands first)
  const reached = Object.fromEntries(((x.ladder && x.ladder.reached) || []).map((m) => [m.id, m]));
  for (const k of ['M29', 'M28']) {
    const c = want[k], r = reached[k];
    const checks = { ran: !!x.ok, reached: !!r, pin: !!r && r.ticks === c.ticks && r.hashGame === c.hashGame && r.hash === c.hash,
      configNamed: c.config.profile === 'all' && c.config['auto-opt'] === null && c.config.from === M26 && !c.config['auto-table'], mark: c.mark === k };
    row({ gate: `F${k === 'M29' ? 1 : 2} stages/${k} = all/M26 under the SHIPPED TABLE ALONE, through the ladder = the committed fixture`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${r ? `${r.ticks} / ${r.hashGame} (full ${r.hash})` : 'not reached'} (committed ${c.ticks} / ${c.hashGame}, full ${c.hash}; +${c.ticks - m26.ticks} game-s from all/M26; config ${JSON.stringify(c.config)}) ${x.error || ''}` });
  }
}

// ---- Part page — the PAGE names the stage (a real browser: `?automation=1&profile=all`) ---------------------------------
// The stages/M29 save loaded into the page (the game's own importSave, then a reload), ticked at the page's diff for 40 ticks
// so the stages are evaluated by the page's own loop, then the `au` tab's Advanced view opened the way its button does.
// Real time is far too slow to reach a mark: the harness rows are the evidence for M28/M29; this is the readout.
async function partPage() {
  const { chromium } = await import('playwright');
  const { pageLoadFrom } = await import('./page.mjs');
  const browser = await chromium.launch(), server = await startServer(REPO);
  const errs = [];
  let out = null;
  try {
    const context = await browser.newContext(), page = await context.newPage();
    page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
    await page.goto(new URL('index.html?mod=ptr&automation=1&profile=all', server.url).href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
    // ⚠ the save's own `time` is when the fixture was WRITTEN, and the page credits everything since as offline progress
    // (measured: 81,779 → 245,464 game-s on load, q32 bought before the first readout) — so it is stamped NOW
    // and its BANKED offline time (`offTime.remain`, 858,679 s in this save) is cleared for the same reason
    const pl = JSON.parse(fixture(M29F).player); pl.time = Date.now(); pl.offTime = null;
    await pageLoadFrom(page, JSON.stringify(pl));
    await page.evaluate(() => tmtLoader.pause());
    out = await page.evaluate(() => {
      tmtLoader.tick(0.05, 40);
      showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced';
      updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats();
      return { profile: tmtLoader.profile(), gs: Number(player.timePlayed), stages: tmtLoader.stages().map((s) => [s.id, s.active]) };
    });
    await page.waitForTimeout(400);
    out.text = await page.evaluate(() => document.body.innerText);
    out.url = page.url();
    await context.close();
  } finally { await browser.close(); server.stop(); }
  const t = (out && out.text) || '';
  const checks = {
    loaded: !!out && out.profile === 'all' && /automation=1/.test(out.url) && out.gs < fixture(M29F).gameSeconds + 60,
    // (m30) only the three stages this row is about: a later stage the table lists (q33-sg-unlock) is not in force at M29
    stagesInForce: !!out && JSON.stringify(out.stages.filter(([id]) => [C1, C2].includes(id))) === JSON.stringify([[C2, true], [C1, true]]) &&
      out.stages.filter(([id]) => ![C1, C2].includes(id)).every(([, on]) => on === false),
    viewNamesThem: new RegExp(`STAGE\\s*${C1}`).test(t) && new RegExp(`STAGE\\s*${C2}`).test(t) && new RegExp(`stage ${C2}`).test(t),
    noPageError: !errs.length,
  };
  row({ gate: 'PG the PAGE (?automation=1&profile=all, the stages/M29 save, 40 ticks at 0.05) — the Advanced view names the stages in force', id: 'ptr', ok: Object.values(checks).every(Boolean),
    notes: `${ck(checks)} — at ${out && out.gs} game-s; stages ${JSON.stringify(out && out.stages)}; the view: ${(t.match(new RegExp(`[^\\n]*(STAGE|stage) (${C1}|${C2})[^\\n]*`, 'g')) || []).slice(0, 3).map((x) => x.slice(0, 140)).join(' | ')}; errors ${JSON.stringify(errs.slice(0, 2))}` });
}

// ---- Part grep ---------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['sb', 'sg', 'ss', 'ba', 'ps', 'en', 'ne', 'hn', 'hs', 'ma', 'ge', 'mc', 'ai', 'sc', 'ab'];   // 'id' is ptr's Ideas layer AND a word every table row uses: not checkable as a literal
  const src = fs.readFileSync(path.join(REPO, 'loader/tmt-auto.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
  const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
  const hits = [];
  for (const l of lits) { if (ids.includes(l)) hits.push(`game id '${l}'`); if (ptrLayers.includes(l)) hits.push(`ptr layer id '${l}'`); }
  for (const id of [C1, C2, C3]) if (code.includes(id)) hits.push(`stage id '${id}'`);
  for (const l of ['q', 'h', 'ss', 'o']) if (new RegExp(`\\b(?:player|tmp|layers)\\s*\\.\\s*${l}\\b`).test(code)) hits.push(`layer ${l} addressed as player/tmp/layers.${l}`);
  row({ gate: 'X1 no game id, ptr layer id or stage id in loader/tmt-auto.js — the stages are DATA', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `${lits.length} string literals, ${ids.length} game ids, ${ptrLayers.length} multi-letter ptr layer ids, 3 stage ids checked` });
}

// ---- Part leg (measurement, one per CI job): the whole stretch from all/M26 ----------------------------------------------
// ⛔ UNDER THE TABLE ALONE: no `--auto-opt`, no queue, no planner. `B@1` hands in the shipped table with the two QL6
// stages swapped (`--auto-table`, the losing order as a TABLE, not as a configuration). `A@1` goes on past M28/M29 to
// M30 (q33 + Super Generators) or its tick bound, and stops there: the stall the next slice starts from.
const LEGS = {
  'A@1': { diff: 1, table: 'A', to: 'M30', ticks: 150000, snapshots: true },
  'B@1': { diff: 1, table: 'B', to: 'M29', ticks: 150000 },
  'A@0.05': { diff: 0.05, table: 'A', to: 'M29', ticks: 1800000 },
};
const LEG_EV = "({ql: Number(" + QL + "), total: String(player.q.total), q: player.q.upgrades.slice(), h: Object.assign({}, player.h.challenges), ac: player.h.activeChallenge, sg: !!player.sg.unlocked, stages: tmtLoader.stageHistory(), ch: tmtLoader.hookStats().challenges})";
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  const out = path.join(REPO, 'tools/harness/results/tmp', `stages-leg-${a.leg.replace(/[^\w.-]/g, '_')}`);
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const tableFile = L.table === 'B' ? writeTmp('ptr-order-B.json', orderBTable()) : null;
  const legs = await Promise.all([0, 1].map(async (k) => {
    const sd = path.join(out, `run${k + 1}`);
    const r = await run('ptr', { 'from-snapshot': M26, profile: 'all', diff: L.diff, ticks: L.ticks, ladder: LADDER, to: L.to, 'until-all': true, 'marks-continue': true,
      'auto-table': tableFile, snapshots: L.snapshots ? sd : null, 'stop-snapshot': sd, 'stop-snapshot-name': 'END', eval: LEG_EV, 'wall-ms': 5.3 * 3600e3 });
    const reached = Object.fromEntries(((r.ladder && r.ladder.reached) || []).map((m) => [m.id, { ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame }]));
    return { ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, reached, stoppedAt: r.ladder && r.ladder.stoppedAt, eval: r.eval, wallMs: r.wallMs, error: r.error };
  }));
  const [x, y] = legs;
  const eq = x.ticks === y.ticks && x.hashGame === y.hashGame && JSON.stringify(x.reached) === JSON.stringify(y.reached);
  const both = !!x.reached.M28 && !!x.reached.M29;
  const since = (m) => (x.reached[m] ? Math.round((x.reached[m].gameSeconds - fixture(M26).gameSeconds) * 1000) / 1000 : null);
  const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, m28: since('M28'), m29: since('M29'), m30: since('M30'), legs };
  // the loser's row is a REPORT (it must complete, twice equal); the shipped order's must reach both marks
  row({ gate: `M-leg ${a.leg} — order ${L.table} (${L.table === 'A' ? 'the shipped table' : 'the shipped table, QL6 stages swapped'}) from all/M26 at diff ${L.diff}, twice equal`, id: 'ptr', ok: eq && !!x.ok && (L.table === 'B' || both),
    notes: `M28 ${outj.m28 === null ? 'NOT reached' : `+${outj.m28} game-s (tick ${x.reached.M28.ticks}, ${x.reached.M28.hashGame})`}; M29 ${outj.m29 === null ? 'NOT reached' : `+${outj.m29} game-s (tick ${x.reached.M29.ticks}, ${x.reached.M29.hashGame})`}; M30 ${outj.m30 === null ? 'not reached' : '+' + outj.m30}; stop ${x.ticks} / ${x.hashGame} ${JSON.stringify(x.stoppedAt)}; end ${JSON.stringify(x.eval)}; twice equal ${eq}; wall ${legs.map((l) => Math.round((l.wallMs || 0) / 1000)).join(' / ')} s ${x.error || ''}` });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `stages-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(outj, null, 1) + '\n');
}
const MERGED = a.only ? [String(a.only)] : Object.keys(LEGS);
if (a.only && !LEGS[a.only]) { console.error(`REFUSED: --only ${a.only} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /stages-leg-[^/]*\.json$/.test(f)) : [];
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const J = (k) => got[`stages-leg-${k.replace(/[^\w.-]/g, '_')}.json`];
  for (const k of MERGED) {
    const j = J(k);
    row({ gate: `M-merge ${k}`, id: 'ptr', ok: !!j && j.twiceEqual && (j.table === 'B' || (j.m28 !== null && j.m29 !== null)),
      notes: j ? `M28 ${j.m28 === null ? 'NOT reached' : '+' + j.m28} · M29 ${j.m29 === null ? 'NOT reached' : '+' + j.m29} game-s from all/M26 (diff ${j.diff}); commit ${j.commit}; twice equal ${j.twiceEqual}` : 'MISSING — the leg did not run or its artifact was not found' });
  }
  if (!a.only) {
    const A1 = J('A@1'), B1 = J('B@1');
    const last = (j) => (j && j.m28 !== null && j.m29 !== null ? Math.max(j.m28, j.m29) : Infinity);
    row({ gate: 'M-order the shipped order (A: H22 first) reaches BOTH marks sooner than the other (B: q31/q32 first), diff 1', id: 'ptr', ok: !!A1 && !!B1 && last(A1) < last(B1),
      notes: A1 && B1 ? `A: M29 +${A1.m29}, M28 +${A1.m28} → both by +${last(A1)}; B: M28 +${B1.m28}, M29 +${B1.m29} → both by ${last(B1) === Infinity ? 'never (inside the bound)' : '+' + last(B1)}` : 'MISSING a leg' });
  }
}

const EXPECT = { vocab: 4, switch: 5, pins: 2, fixture: 2, grep: 1, page: 1, leg: 1, merge: MERGED.length + (a.only ? 0 : 1) };
const FN = { vocab: partVocab, switch: partSwitch, pins: partPins, fixture: partFixture, grep: partGrep, page: partPage, leg: partLeg, merge: partMerge };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT stages ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-stages-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
