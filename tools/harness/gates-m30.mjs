// The m30 gates — Super Generators (M30, `hasUpgrade('q',33) && player.sg.unlocked`; ptr-strategy arc, slice tmt-m30-1):
// the third template, `reset-requirement` (a reset whose requirement sits on a base that OTHER resets zero: hold them,
// play to the engine's requirement, say RESET-AT / SHORT BY X / CANNOT), and the stage that records its answer in the
// table, `q33-sg-unlock`, so the table alone reaches M30.
//   node tools/harness/gates-m30.mjs --part fixture|verdict|stage|grep|push [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-m30.mjs --part leg --leg <key> [--assert]      (one CI job per leg: qrate1.yml -f part=m30)
//   node tools/harness/gates-m30.mjs --part merge --dir <artifacts> [--only <key>] [--summary] [--assert]
//   --summary (merge only): append the merged rows to results/SUMMARY.md — the rows the stage's provenance cites
//   (gate ids `m30-<leg>`), so a measurement made outside CI is still a committed row.
//
// GATES (`push`, on every push in sweep.yml's `m30` job):
// Part fixture  F0 the WALL state m30/W226931 = stages/M28 under the table BEFORE this slice (m30/table-before-m30.json,
//               byte-equal to main 68383aa's games-auto/ptr.json) for 141,652 ticks: q33 owned, Super Generators never
//               reset. F1 stages/M30 = stages/M28 under the SHIPPED TABLE ALONE, through the ladder = the committed fixture.
// Part verdict  O1 from the wall under the table before this slice: RESET-AT, confirmed on the copy; the requirement the
//               template reads = the SOURCE's (layers.js: sg requires 200, base 1.05, exponent 1.25 → 200 at 0 Super
//               Generators); the hold covers every zeroing reset the source names, the row siblings included; the queue
//               emitted = the committed one. O1s the same with a stated 30-s window: SHORT, the sub-goal is the base at the
//               requirement. O2 the queue played LIVE from the wall unlocks sg on the copy's tick, releases its holds, and
//               its log replays EQUAL. VAC the hold was applied: no zeroing reset fires in the held leg before the reset;
//               the same queue with the row SIBLINGS left free is cut and never resets. EV the state-log evidence (from a
//               3,000-tick leg at the wall: Generators touch 200 and a zeroing reset wipes them) = an independent count.
//               O3 generality: something and collection-of-everything run with no throw; the funnel says why.
// Part stage    S1 the acceptance run's state log: `q33-sg-unlock` switches ON at the q33 tick and OFF at the M30 tick;
//               between them no zeroing reset fires and `reset:sg` makes the reset. S2 the stage is the template's answer
//               as DATA: its gates are exactly the template's hold minus the reset it makes, each predicate states the
//               engine's requirement expression, and no predicate carries the requirement's number.
// Part grep     X1 no game id and no ptr layer id in the generic code this slice changed.
// MEASUREMENTS (`.github/workflows/qrate1.yml -f part=m30`, dispatch-only): the acceptance from stages/M28 under the table
// alone at diff 1 and 0.05, and the whole stretch from all/M26 in both stage orders at diff 1 — each leg TWICE (equal
// or RED). The A@1 leg runs on past M30 to name the next wall.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly, gameDir } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert', 'summary']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'dir', 'only', 'summary']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['fixture', 'verdict', 'stage', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'push', 'leg', 'merge'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-m30-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1800)}`); };

// ⚠ This file is the ORACLE, and ptr's ids are its data (the template's own code may not name them — part grep).
const TABLE = 'games-auto/ptr.json';
const LADDER = 'tools/harness/ladder/ptr.json';
const PRE_TABLE = 'tools/harness/snapshots/ptr/m30/table-before-m30.json';   // main 68383aa's table, byte for byte
const M26 = 'tools/harness/snapshots/ptr/all/M26.json', M28F = 'tools/harness/snapshots/ptr/stages/M28.json';
// ⚖ (user, 2026-10-01) not all/: an all/ mark enrols in derived rosters (facts.mjs, currency-data, deepestSnapshot)
const M30F = 'tools/harness/snapshots/ptr/stages/M30.json';
const WALL = 'tools/harness/snapshots/ptr/m30/W226931.json';
const QUEUE = 'tools/harness/queues/m30/rr-reset-sg-from-W226931.json';
const STAGE = 'q33-sg-unlock';
const GOAL = 'reset:sg';
const PIN_W = { ticks: 226931, hashGame: 'e09f367518a8fb2d' };                     // stages/M28 + 141,652 ticks under PRE_TABLE
const PIN_M30 = { ticks: 94521, hashGame: '132127d4d5573106' };            // stages/M28 under the shipped table → M30 (diff 1)
const PIN_Q33 = 93879;                                                     // the loop q33 is bought in, on that path
const PIN_RESET = { ticks: 226986 };                                  // the queue's reset tick from the wall (diff 1)
// The SOURCE (games/ptr/js/layers.js:2526-2560): sg is a STATIC row-2 layer, `requires: new Decimal(200)`, `base()` 1.05
// and `exponent()` 1.25 (1.04 / 1.225 only when mastered), `baseAmount() { return player.g.points }`, `layerShown` q33.
// TMT's static cost at 0 points is requires × base^(0^exponent) = 200 (gainMult 1 without ss21; it divides the AMOUNT,
// and 0 ÷ anything is 0). Every reset of row ≥ 2 other than sg zeroes g (rowReset, game.js:126-136): its row-2
// siblings e, s, sb, t act EARLIER in the same tick (layers order: t 897, e 1302, s 1574, sb 2451, sg 2526) and the row-3
// layers h, q, o, ss after it.
const SRC = { requires: 200, base: 1.05, exponent: 1.25 };
const ZEROERS = ['e', 's', 'sb', 't', 'h', 'q', 'o', 'ss'];
const SIBLINGS = ['e', 's', 'sb', 't'];
const WINDOW_SHORT = 30;
const EV_TICKS = 3000;

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
async function strategize(game, extra) {
  const f = path.join(TMP, `strat-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, ...extra]);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { file: f, exit: r.code }); } catch { return { error: 'no result (exit ' + r.code + '): ' + r.out.slice(-600), exit: r.code }; }
}
async function replay(log) {
  const f = path.join(TMP, `replay-${++seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/replay.mjs'), log, '--json', f]);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')).line; } catch { return { equal: false, error: 'no result: ' + r.out.slice(-300) }; }
}
async function pool(fns) {
  const out = new Array(fns.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, fns.length) }, async () => { while (i < fns.length) { const k = i++; out[k] = await fns[k](); } }));
  return out;
}
const logRecords = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const rr = (R) => (R && R.results ? R.results.filter((v) => v.template === 'reset-requirement') : []);
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const num = (x) => { const m = /^(-?\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(x)); return m ? Number(m[1]) * Math.pow(10, m[2] ? Number(m[2]) : 0) : NaN; };
// An INDEPENDENT reading of a state log: every doReset of a layer the SOURCE says zeroes Generators, with Generators just
// before it (the summary's `g.p`), and the sg resets — not the template's rrEvidence.
function zeroingsFromLog(recs) {
  let g = null; const o = { zeroings: 0, touched: 0, maxBefore: null, by: {}, sg: [], firstTick: null, lastTick: null };
  for (const r of recs) {
    if (r.type === 'checkpoint' && r.summary) { g = r.summary['g.p'] === undefined ? null : r.summary['g.p']; continue; }
    if (r.type !== 'action') continue;
    const before = g;
    if (r.state && 'g.p' in r.state) g = r.state['g.p'];
    if (r.call !== 'doReset') continue;
    const L = String((r.args || [])[0]);
    if (L === 'sg') { o.sg.push({ tick: r.tick, by: r.by || r.source, did: r.did, gBefore: before }); continue; }
    if (!ZEROERS.includes(L)) continue;
    o.zeroings++; o.by[r.by || r.source] = (o.by[r.by || r.source] || 0) + 1;
    if (o.firstTick === null) o.firstTick = r.tick; o.lastTick = r.tick;
    if (before === null) continue;
    if (o.maxBefore === null || num(before) > num(o.maxBefore)) o.maxBefore = String(before);
    if (num(before) >= SRC.requires) o.touched++;
  }
  return o;
}
const preTableHash = () => fs.readFileSync(path.join(REPO, PRE_TABLE), 'utf8');
/** The shipped table without this slice's stage — must equal PRE_TABLE (no other entry moved). */
function shippedMinusStage() { const t = fixture(TABLE); t.stages = (t.stages || []).filter((s) => s.id !== STAGE); return JSON.stringify(t, null, 2) + '\n'; }
const writeTmp = (name, obj) => { const f = path.join(TMP, name); fs.writeFileSync(f, JSON.stringify(obj, null, 1)); return f; };
/** The shipped table with this slice's stage moved to the END of the list (the other order). */
function stageLastTable() {
  const t = fixture(TABLE);
  const i = t.stages.findIndex((s) => s.id === STAGE);
  if (i < 0) throw new Error('the shipped table has no ' + STAGE + ' stage');
  const [s] = t.stages.splice(i, 1); t.stages.push(s);
  return t;
}

// ---- Part fixture ----------------------------------------------------------------------------------------------------
async function partFixture() {
  const m28 = fixture(M28F);
  const dW = path.join(TMP, 'fw'), dA = path.join(TMP, 'fa');
  const [w, x] = await pool([
    () => run('ptr', { 'from-snapshot': M28F, profile: 'all', 'auto-table': PRE_TABLE, ticks: PIN_W.ticks - m28.ticks, 'wall-ms': 3 * 3600e3, 'stop-snapshot': dW, 'stop-snapshot-name': 'W226931',
      eval: "({q33: hasUpgrade('q',33), sg: !!player.sg.unlocked, g: String(player.g.points), next: String(tmp.sg.nextAt)})" }),
    () => run('ptr', { 'from-snapshot': M28F, profile: 'all', ticks: PIN_M30.ticks - m28.ticks + 50, ladder: LADDER, to: 'M30', 'until-all': true, 'marks-continue': true, snapshots: dA }),
  ]);
  {
    const c = fixture(WALL), built = fs.existsSync(path.join(dW, 'W226931.json')) ? JSON.parse(fs.readFileSync(path.join(dW, 'W226931.json'), 'utf8')) : null;
    const checks = { ran: !!w.ok, pin: w.ticks === PIN_W.ticks && w.hashGame === PIN_W.hashGame, committed: c.ticks === PIN_W.ticks && c.hashGame === PIN_W.hashGame,
      rebuilt: !!built && built.ticks === c.ticks && built.hashGame === c.hashGame, theWall: !!w.eval && w.eval.q33 === true && w.eval.sg === false,
      preTableIsTheShippedMinusTheStage: preTableHash() === shippedMinusStage(), configNamed: c.config.from === M28F && c.config['auto-table'] === PRE_TABLE && c.config['auto-opt'] === null };
    row({ gate: 'F0 the wall m30/W226931 = stages/M28 under the table BEFORE this slice for 141,652 ticks: q33 owned, Super Generators never reset', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${w.ticks} / ${w.hashGame} (pin ${PIN_W.ticks} / ${PIN_W.hashGame}); ${JSON.stringify(w.eval)}; wall ${Math.round((w.wallMs || 0) / 1000)} s ${w.error || ''}` });
  }
  {
    const c = fixture(M30F), r = ((x.ladder && x.ladder.reached) || []).find((m) => m.id === 'M30');
    const checks = { ran: !!x.ok, reached: !!r, pin: !!r && r.ticks === PIN_M30.ticks && r.hashGame === PIN_M30.hashGame, committed: c.ticks === PIN_M30.ticks && c.hashGame === PIN_M30.hashGame && c.mark === 'M30',
      rebuilt: !!r && r.hash === c.hash, configNamed: c.config.profile === 'all' && c.config['auto-opt'] === null && c.config.from === M28F && !c.config['auto-table'] };
    row({ gate: 'F1 stages/M30 = stages/M28 under the SHIPPED TABLE ALONE, through the ladder = the committed fixture', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${r ? `${r.ticks} / ${r.hashGame} (full ${r.hash})` : 'not reached'} (committed ${c.ticks} / ${c.hashGame}; +${c.ticks - m28.ticks} game-s from stages/M28) ${x.error || ''}` });
  }
}

// ---- Part verdict ----------------------------------------------------------------------------------------------------
async function partVerdict() {
  const log = path.join(TMP, 'o2.jsonl'), clog = path.join(TMP, 'control.jsonl'), elog = path.join(TMP, 'evidence.jsonl');
  const Q = fixture(QUEUE);
  // the control: the same queue with the row SIBLINGS free (only the row-3 zeroers and the reset itself held)
  const C = JSON.parse(JSON.stringify(Q)); C.id = 'rr-reset-sg-siblings-free';
  C.steps[0].features = C.steps[0].features.filter((f) => !SIBLINGS.some((s) => f === `reset:${s}`));
  const cfile = path.join(TMP, 'control.queue.json'); fs.writeFileSync(cfile, JSON.stringify(C));
  const T = { 'auto-table': PRE_TABLE };
  const jobs = [
    () => strategize('ptr', ['--from', WALL, '--goal', GOAL, '--auto-table', PRE_TABLE]),
    () => strategize('ptr', ['--from', WALL, '--goal', GOAL, '--auto-table', PRE_TABLE, '--window', String(WINDOW_SHORT)]),
    () => run('ptr', { 'from-snapshot': WALL, profile: 'all', ...T, queue: QUEUE, ticks: 3000, until: 'player.sg.unlocked', log, eval: "({sg: !!player.sg.unlocked, sgp: String(player.sg.points), g: String(player.g.points)})" }),
    () => run('ptr', { 'from-snapshot': WALL, profile: 'all', ...T, queue: cfile, ticks: 3000, until: 'player.sg.unlocked', log: clog, eval: "({sg: !!player.sg.unlocked})" }),
    () => run('ptr', { 'from-snapshot': WALL, profile: 'all', ...T, ticks: EV_TICKS, log: elog, eval: "({sg: !!player.sg.unlocked, g: String(player.g.points)})" }),
    () => run('ptr', { 'from-snapshot': WALL, profile: 'all', ...T, ticks: 0, eval: "({next: String(tmp.sg.nextAt), req: String(tmp.sg.requires), base: Number(layers.sg.base()), exp: Number(layers.sg.exponent()), sgp: String(player.sg.points), type: tmp.sg.type, row: tmp.sg.row, gm: String(tmp.sg.gainMult)})" }),
    () => strategize('something', []), () => strategize('something', ['--from', 'tools/harness/snapshots/something/all/S05.json']), () => strategize('collection-of-everything', []),
    () => strategize('ptr', []),
  ];
  const [o1, o1s, live, ctl, ev0, src, s0, s5, coe, pfresh] = await pool(jobs);

  // O1 — RESET-AT from the wall, the requirement read against the source
  const v1 = rr(o1)[0];
  {
    const e = src && src.eval, srcText = fs.readFileSync(path.join(gameDir('ptr'), 'js/layers.js'), 'utf8');
    const blk = srcText.slice(srcText.indexOf('addLayer("sg"'), srcText.indexOf('addLayer("h"'));
    const declared = /requires:\s*new Decimal\(200\)/.test(blk) && /type:\s*"static"/.test(blk) && /baseAmount\(\)\s*\{return player\.g\.points\}/.test(blk) && /\?1\.04:1\.05/.test(blk) && /\?1\.225:1\.25/.test(blk);
    const formula = SRC.requires * Math.pow(SRC.base, Math.pow(0, SRC.exponent));
    const at = v1 && v1.confirm && v1.confirm.at;
    const checks = {
      verdict: !!v1 && v1.verdict === 'reset-at', confirmed: !!at && v1.confirm.reset === true && v1.confirm.state === 'done' && Array.isArray(v1.confirm.holds) && v1.confirm.holds.length === 0,
      onThePinnedTick: !!at && at.tick === PIN_RESET.ticks,
      requirementIsTheSource: declared && !!e && e.type === 'static' && e.row === 2 && e.base === SRC.base && e.exp === SRC.exponent && num(e.sgp) === 0 && num(e.next) === formula && formula === 200 &&
        !!v1 && num(v1.tStar.requirement) === formula,
      generatorsAtTheReset: !!v1 && num(v1.tStar.base) >= formula,
      holdCoversEveryZeroer: !!v1 && ZEROERS.every((z) => v1.binding.hold.includes(`reset:${z}`)) && v1.binding.hold.includes('challenges:h') && v1.binding.hold.includes('reset:sg') &&
        JSON.stringify([...v1.binding.siblings].sort()) === JSON.stringify([...SIBLINGS].sort()) && JSON.stringify([...v1.binding.zeroers].sort()) === JSON.stringify([...ZEROERS].sort()),
      queueIsTheCommittedOne: !!v1 && !!v1.queue && JSON.stringify(v1.queue) === JSON.stringify(Q),
      neutral: !!v1 && v1.neutral === true,
    };
    row({ gate: 'O1 reset:sg from the wall under the table before this slice: RESET-AT, confirmed on the copy; the requirement = layers.js (200 at 0 SG); the hold covers every zeroer, the siblings included', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v1 ? `verdict ${v1.verdict}, t* ${JSON.stringify(v1.tStar)}, confirmed ${JSON.stringify(at)}, hold ${v1.binding.hold.join(',')}, siblings ${v1.binding.siblings.join(',')}` : o1.error}; engine ${JSON.stringify(e)}; source declared ${declared}, formula ${formula}` });
  }
  // O1s — SHORT at a 30-s window
  {
    const v = rr(o1s)[0];
    const sg = v && v.subgoal, pk = v && v.rollback && v.rollback.peak;
    const checks = { verdict: !!v && v.verdict === 'short', shortfallPositive: !!v && v.short && v.short.log10 > 0, subgoalIsTheBaseAtTheRequirement: !!sg && sg.dimension === 'player.g.points' && num(sg.threshold) === SRC.requires,
      noQueue: !!v && v.queue === null, neutral: !!v && v.neutral === true };
    row({ gate: `O1s reset:sg with a ${WINDOW_SHORT}-s window: SHORT, the sub-goal Generators ≥ the requirement, no queue`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v ? `short ${JSON.stringify(v.short)}; peak ${JSON.stringify(pk)}; sub-goal ${JSON.stringify(sg)}; lever ${JSON.stringify(v.levers && v.levers[0])}` : o1s.error}` });
  }
  // O2 — the queue played LIVE: sg unlocked on the copy's tick; its log replays equal
  {
    const rp = live && live.ok ? await replay(log) : null;
    const st = live && live.queueStatus && live.queueStatus.queues.find((z) => z.id === Q.id);
    const Z = zeroingsFromLog(logRecords(log));
    const checks = {
      unlocks: !!live && live.ok && live.eval && live.eval.sg === true && num(live.eval.sgp) === 1, onTheCopysTick: !!live && live.ticks === PIN_RESET.ticks && !!v1 && v1.confirm && v1.confirm.at && v1.confirm.at.tick === live.ticks,
      byTheQueue: Z.sg.length === 1 && Z.sg[0].by === 'queue' && Z.sg[0].did === true && num(Z.sg[0].gBefore) >= SRC.requires,
      holdsReleased: !!st && st.state === 'done' && st.holds.length === 0, replayEqual: !!rp && rp.equal === true && rp.unapplied === 0,
    };
    row({ gate: 'O2 the emitted queue played LIVE from the wall unlocks Super Generators on the copy\'s tick; holds released; its log replays EQUAL', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — live ${live && live.ticks} / ${live && live.hashGame} ${JSON.stringify(live && live.eval)}; sg resets ${JSON.stringify(Z.sg)}; queue ${st && st.state}; replay ${rp ? `equal ${rp.equal}, ${rp.compared && rp.compared.action} actions, ${rp.unapplied} unapplied` : '—'} ${live && live.error || ''}` });
  }
  // VAC — the hold was applied: count the zeroings it prevented
  {
    const H = zeroingsFromLog(logRecords(log)), K = zeroingsFromLog(logRecords(clog));
    const sibCut = Object.entries(K.by).filter(([b]) => SIBLINGS.some((s) => b === `reset:${s}`)).reduce((n, [, c]) => n + c, 0);
    const checks = { heldLegNoZeroing: H.zeroings === 0, controlCutBySiblings: sibCut >= 1 && K.touched >= 1, controlNeverResets: !!ctl && ctl.eval && ctl.eval.sg === false && K.sg.length === 0 };
    row({ gate: 'VAC the hold was applied: no zeroing reset in the held leg; with the row SIBLINGS free, Generators touch the requirement, a sibling wipes them, and sg never resets', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — held: ${JSON.stringify(H)}; control (hold ${C.steps[0].features.join(',')}) over ${ctl && ctl.ticks - PIN_W.ticks} ticks: ${JSON.stringify(K)} — ${sibCut} sibling reset(s) the full hold prevented` });
  }
  // EV — the template's evidence = an independent count of the same log
  {
    const ind = zeroingsFromLog(logRecords(elog));
    const v = ev0 && ev0.ok ? rr(await strategize('ptr', ['--from', WALL, '--goal', GOAL, '--auto-table', PRE_TABLE, '--window', String(WINDOW_SHORT), '--log', elog]))[0] : null;
    const e = v && v.binding && v.binding.evidence;
    const checks = { evidence: !!e && e.readable === true, zeroings: !!e && e.zeroings === ind.zeroings && e.zeroings > 0, touched: !!e && e.touched === ind.touched && e.touched >= 1,
      maxBefore: !!e && num(e.maxBefore) === num(ind.maxBefore), noSgReset: !!e && e.ownResets === 0 && ind.sg.length === 0 && ev0.eval && ev0.eval.sg === false };
    row({ gate: `EV the state-log evidence: from the wall under the table before this slice, ${EV_TICKS} ticks — Generators touch the requirement and a zeroing reset wipes them; the template's count = an independent count`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — template ${JSON.stringify(e)}; independent ${JSON.stringify(ind)}; end ${JSON.stringify(ev0 && ev0.eval)}` });
  }
  // O3 — generality
  {
    const legs = [['something fresh', s0], ['something all/S05', s5], ['collection-of-everything fresh', coe], ['ptr fresh', pfresh]];
    const c = (r) => r && r.counts && r.counts['reset-requirement'];
    const checks = {
      noThrow: legs.every(([, r]) => r && !r.error && r.exit === 0 && r.results.every((x) => x.verdict !== 'threw')),
      funnelSaysWhy: legs.every(([, r]) => !!c(r) && c(r).funnel && c(r).funnel.resetFeatures >= c(r).funnel.withRequirement && c(r).funnel.zeroedByAutomation === c(r).matches),
      notOpenSaysWhy: legs.every(([, r]) => rr(r).every((x) => x.verdict !== 'not-open' || (x.reasoning && x.reasoning[0]))),
      ptrFreshNoneOpen: !!c(pfresh) && c(pfresh).open === 0,
    };
    row({ gate: 'O3 generality: something and collection-of-everything run with no throw; the funnel names why', id: 'something+coe+ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ` + legs.map(([n, r]) => (c(r) ? `${n}: ${c(r).matches} match(es), ${c(r).open} open, funnel ${JSON.stringify(c(r).funnel)}, verdicts ${JSON.stringify(c(r).verdicts)}` : `${n}: ${r && r.error}`)).join(' | ') });
  }
}

// ---- Part stage ------------------------------------------------------------------------------------------------------
async function partStage() {
  const log = path.join(TMP, 's1.jsonl'), m28 = fixture(M28F);
  const x = await run('ptr', { 'from-snapshot': M28F, profile: 'all', ticks: PIN_M30.ticks - m28.ticks + 5, until: 'player.sg.unlocked', log, eval: "({sg: !!player.sg.unlocked, q33: hasUpgrade('q',33)})" });
  // S1 — the switch, read from the state log
  {
    const recs = logRecords(log);
    const st = recs.filter((r) => r.type === 'stage' && r.stage === STAGE).map((r) => [r.on, r.tick]);
    const on = st.find(([o]) => o), off = st.find(([o]) => !o);
    const inside = recs.filter((r) => r.type === 'action' && on && r.tick >= on[1]);
    const Z = zeroingsFromLog(inside);
    const blocked = recs.filter((r) => r.type === 'action').length;
    const checks = { ran: !!x.ok && x.eval && x.eval.sg === true, onAtQ33: !!on && on[1] === PIN_Q33, sgOnTheM30Tick: x.ticks === PIN_M30.ticks && x.hashGame === PIN_M30.hashGame,
      noZeroingInside: Z.zeroings === 0, byTheTable: Z.sg.length === 1 && Z.sg[0].by === 'reset:sg' && Z.sg[0].did === true && Z.sg[0].tick === PIN_M30.ticks,
      offAfter: !off || off[1] >= PIN_M30.ticks };
    row({ gate: `S1 ${STAGE} switches ON at the q33 loop; no zeroing reset fires while it is in force; reset:sg makes the reset on the M30 tick`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — stage records ${JSON.stringify(st)}; inside ${JSON.stringify(Z)}; ${x.ticks} / ${x.hashGame}; ${blocked} action records ${x.error || ''}` });
  }
  // S2 — the stage is the template's answer as data, with the engine's requirement and no number
  {
    const t = fixture(TABLE), S = (t.stages || []).find((s) => s.id === STAGE), Q = fixture(QUEUE);
    const hold = Q.steps[0].features.filter((f) => f !== GOAL).sort();
    const keys = S ? Object.keys(S.gates || {}).sort() : [];
    const preds = S ? [S.when, ...Object.values(S.gates || {})] : [];
    const req = /tmp\.sg\.nextAt|tmp\[["']sg["']\]\.nextAt/;
    const literal = preds.filter((p) => new RegExp(`(^|[^\\w.])${SRC.requires}(?![\\w.])`).test(p) || /\d+e\d+/.test(p));
    const checks = { present: !!S, gatesAreTheHold: !!S && JSON.stringify(keys) === JSON.stringify(hold), everyGateReadsTheRequirement: !!S && Object.values(S.gates).every((g) => req.test(g)),
      noRequirementLiteral: !!S && literal.length === 0, whenIsState: !!S && /hasUpgrade\('q',\s*33\)/.test(S.when) && /!player\.sg\.unlocked/.test(S.when), noPolicies: !!S && !S.policies };
    row({ gate: `S2 ${STAGE} is the template's answer as DATA: its gates = the template's hold minus the reset it makes, each reads the engine's requirement, none carries its number`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — gates ${JSON.stringify(S && S.gates)}; the template's hold ${JSON.stringify(hold)}; when ${S && S.when}; literal hits ${JSON.stringify(literal)}` });
  }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-templates.js', 'loader/tmt-queue.js', 'loader/tmt-auto.js', 'tools/harness/strategize.mjs'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the generic code (templates, queue runner, the automation, strategize)', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

// ---- Part leg (measurement, one per CI job) ----------------------------------------------------------------------------
// A@…: the acceptance, stages/M28 under the SHIPPED TABLE ALONE to M30 (A@1 runs on to name the next wall: the ladder to
// M33, a stop snapshot). first@1 / last@1: the whole stretch from all/M26 with the stage FIRST (shipped) and LAST.
const LEGS = {
  'A@1': { diff: 1, from: M28F, table: 'shipped', to: 'M33', ticks: 150000, snapshots: true },
  'A@0.05': { diff: 0.05, from: M28F, table: 'shipped', to: 'M30', ticks: 400000 },
  'first@1': { diff: 1, from: M26, table: 'shipped', to: 'M30', ticks: 40000 },
  'last@1': { diff: 1, from: M26, table: 'last', to: 'M30', ticks: 40000 },
};
const LEG_EV = "({q: player.q.upgrades.slice(), g: String(player.g.points), sg: !!player.sg.unlocked, sgp: String(player.sg.points), qms: player.q.milestones.slice(), autoBld: !!player.s.autoBld, h31: Number(player.h.challenges[31] || 0), ql: Number(player.q.buyables[11].plus(tmp.q.freeLayers)), total: String(player.q.total), ac: player.h.activeChallenge, stages: tmtLoader.stageHistory()})";
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  const out = path.join(REPO, 'tools/harness/results/tmp', `m30-leg-${a.leg.replace(/[^\w.-]/g, '_')}`);
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const tableFile = L.table === 'last' ? writeTmp('ptr-stage-last.json', stageLastTable()) : null;
  const from = fixture(L.from);
  const legs = await Promise.all([0, 1].map(async (k) => {
    const sd = path.join(out, `run${k + 1}`);
    const r = await run('ptr', { 'from-snapshot': L.from, profile: 'all', diff: L.diff, ticks: L.ticks, ladder: LADDER, to: L.to, 'until-all': true, 'marks-continue': true,
      'auto-table': tableFile, snapshots: L.snapshots ? sd : null, 'stop-snapshot': sd, 'stop-snapshot-name': 'END', eval: LEG_EV, 'wall-ms': 5.3 * 3600e3 });
    const reached = Object.fromEntries(((r.ladder && r.ladder.reached) || []).map((m) => [m.id, { ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame }]));
    return { ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, reached, stoppedAt: r.ladder && r.ladder.stoppedAt, eval: r.eval, wallMs: r.wallMs, error: r.error };
  }));
  const [x, y] = legs;
  const eq = x.ticks === y.ticks && x.hashGame === y.hashGame && JSON.stringify(x.reached) === JSON.stringify(y.reached);
  const since = (m) => (x.reached[m] ? Math.round((x.reached[m].gameSeconds - from.gameSeconds) * 1000) / 1000 : null);
  const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, m28: since('M28'), m29: since('M29'), m30: since('M30'), m31: since('M31'), m32: since('M32'), m33: since('M33'), legs };
  row({ gate: `M-leg ${a.leg} — ${L.table === 'last' ? 'the shipped table with ' + STAGE + ' LAST' : 'the shipped table'} from ${path.basename(path.dirname(L.from))}/${path.basename(L.from, '.json')} at diff ${L.diff}, twice equal`, id: 'ptr', ok: eq && !!x.ok && outj.m30 !== null,
    notes: `M30 ${outj.m30 === null ? 'NOT reached' : `+${outj.m30} game-s (tick ${x.reached.M30.ticks}, ${x.reached.M30.hashGame})`}; reached ${JSON.stringify(x.reached)}; stop ${x.ticks} / ${x.hashGame} ${JSON.stringify(x.stoppedAt)}; end ${JSON.stringify(x.eval)}; twice equal ${eq}; wall ${legs.map((l) => Math.round((l.wallMs || 0) / 1000)).join(' / ')} s ${x.error || ''}` });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `m30-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(outj, null, 1) + '\n');
}
const MERGED = a.only ? [String(a.only)] : Object.keys(LEGS);
if (a.only && !LEGS[a.only]) { console.error(`REFUSED: --only ${a.only} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /m30-leg-[^/]*\.json$/.test(f)) : [];
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const J = (k) => got[`m30-leg-${k.replace(/[^\w.-]/g, '_')}.json`];
  for (const k of MERGED) {
    const j = J(k);
    const r30 = j && j.legs[0].reached.M30;
    row({ gate: `m30-${k} M-merge`, id: 'ptr', leg: j ? `${j.table} from ${path.basename(path.dirname(j.from))}/${path.basename(j.from, '.json')}` : null, ticks: r30 ? r30.ticks : null, gameSeconds: r30 ? r30.gameSeconds : null, diff: j ? j.diff : null, hash: r30 ? r30.hashGame : null,
      ok: !!j && j.twiceEqual && j.m30 !== null,
      notes: j ? `M30 ${j.m30 === null ? 'NOT reached' : '+' + j.m30} game-s from ${path.basename(j.from)} (diff ${j.diff}); M31 ${j.m31} · M32 ${j.m32} · M33 ${j.m33}; commit ${j.commit}; twice equal ${j.twiceEqual}` : 'MISSING — the leg did not run or its artifact was not found' });
  }
  if (!a.only) {
    const F = J('first@1'), Lt = J('last@1'), A1 = J('A@1');
    row({ gate: `m30-order ${STAGE} FIRST (shipped) reaches M30 no later than LAST, from all/M26 at diff 1 — and the shipped path's M30 = the acceptance's`, id: 'ptr', ok: !!F && !!Lt && !!A1 && F.m30 !== null && (Lt.m30 === null || F.m30 <= Lt.m30) &&
      F.legs[0].reached.M30.hashGame === A1.legs[0].reached.M30.hashGame && F.legs[0].reached.M30.ticks === A1.legs[0].reached.M30.ticks,
      notes: F && Lt ? `first: M30 tick ${F.legs[0].reached.M30 && F.legs[0].reached.M30.ticks} (${F.legs[0].reached.M30 && F.legs[0].reached.M30.hashGame}); last: ${Lt.m30 === null ? 'never' : `tick ${Lt.legs[0].reached.M30.ticks} (${Lt.legs[0].reached.M30.hashGame})`}; acceptance ${A1 && A1.legs[0].reached.M30 && A1.legs[0].reached.M30.ticks}` : 'MISSING a leg' });
  }
}

const EXPECT = { fixture: 2, verdict: 6, stage: 2, grep: 1, leg: 1, merge: MERGED.length + (a.only ? 0 : 1) };
const FN = { fixture: partFixture, verdict: partVerdict, stage: partStage, grep: partGrep, leg: partLeg, merge: partMerge };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT m30 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (PART === 'merge' && a.summary) appendSection({ title: `Gate m30 merge — the stage ${STAGE} measured (\`node tools/harness/gates-m30.mjs --part merge --summary\`)`, commit, dirty, rows,
  reading: 'each leg ran TWICE (equal or RED); gameSeconds is the game clock at M30; the merged legs\' own commit is in each row\'s notes.' });
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-m30-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
