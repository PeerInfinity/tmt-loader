// The m28 gates — REACHING M28 (`hasUpgrade('q', 32)`; ptr-strategy design notes §17.8 → §18): a committed state past
// q24, the facts regenerated over it by a DECLARED mechanism, the time-priced-purchase template on q31 and q32 there,
// and the sub-goal it emits handed to the planner.
//   node tools/harness/gates-m28.mjs --part fixture|facts|verdict|subgoal|grep|push [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-m28.mjs --part leg --leg <key>       (one CI measurement leg, twice; writes results/tmp/m28-leg-<key>.json)
//   node tools/harness/gates-m28.mjs --part merge --dir <dir> [--only <key>]  (the CI legs, read back by FILE NAME; refuses a missing one)
//
// GATES (`push`, on every push in sweep.yml's `m28` job):
// Part fixture  F1 Q86K = qrate1's Q308K → the q23 queue strategize emitted there → the qrate1 winner configuration for
//               6,000 game-s (the end state of §17.4's leg) = the committed fixture. F2 QL6 = Q86K → the same configuration
//               until no challenge is active (the H22 give-up, 3 ticks) = the committed fixture — the DECLARED facts state.
// Part facts    D1 the committed facts carry the declared state, and q31 / q32's prices are PRESENT there as the source's
//               power shapes (8.4 · 1e48, 10 · 1e58 in q.time). D2 VACUITY: a price-only regeneration through the default
//               state list (facts.mjs, no --from) produces them too — a mechanism that silently skips a declared state
//               leaves q31 / q32 "locked in every state", and facts-1's O1 would then ABSTAIN green. D3 a declaration
//               naming a missing file, a mark or a duplicate is a HARD ERROR.
// Part verdict  V0 qrate1's scratch reading (§17.4: q31 10^−4.89, q32 10^−17.2) reproduced by an independent boot of Q86K
//               with every row-3 reset and challenges:h EXCLUDED at registration. V1 q31 at QL6: WAITING CANNOT HELP, the
//               levers ranked, the sub-goal player.q.total at the threshold the SOURCE gives for the measured shortfall
//               (q11 = (log10(total+1)+1)^#upgrades, energy ∝ (t·M)^(QL−1)). V2 q32 at QL6: WAITING CANNOT HELP, the
//               sub-goal the next Quirk Layer (q.points ≥ 2^(2^6−1), layers.js), Super Boosters NOT a sub-goal. V3 the
//               verdict's peak is the CHARGED price's (the tick-start `tmp`, §16): an independent boot holding the same
//               features for the same ticks reads the same ratio, and the live price's differs.
//               F3 Q31 = QL6 under the winner with challenge attempts held until the reflex buys q31 (tick 88,767).
//               V4 q32 at Q31: q31 raised q11's power (8 → 9 upgrades), so the nearest lever is total quirks again, at
//               the source's threshold, and the measured purchase (CI, quoted) lands on it.
// Part subgoal  S1 the q31 verdict's sub-goal, fed through `run.mjs --planner-goal`, IS round 0's active goal.
// Part grep     X1 no game id and no ptr layer id in the code this slice changed (templates, planner, facts.mjs, strategize).
// MEASUREMENTS (report; `.github/workflows/qrate1.yml` with `-f part=m28`, dispatch-only):
// Part leg      a stretch from QL6 in STAGES (q31 bought → q32 bought), each stage a run with a stop
//               snapshot the next resumes from, the whole leg TWICE (equal or RED): a fixed configuration, or the planner
//               driven by the template's sub-goal.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { statesOf, declaredStates } from './facts.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'dir', 'only']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['fixture', 'facts', 'verdict', 'subgoal', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'push', 'leg', 'merge'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-m28-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1600)}`); };

const Q308K = 'tools/harness/snapshots/ptr/qrate1/Q308K.json';
const Q86K = 'tools/harness/snapshots/ptr/m28/Q86K.json', QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json', Q31 = 'tools/harness/snapshots/ptr/m28/Q31.json';
const CHOFF = `policy:reset:q=rate-peak@0/0|turn@10/30x/5/0/100;exclude=challenges:h`;   // the winner with challenge attempts held
const Q23 = 'tools/harness/queues/m28/q23-from-Q308K.json';
const LADDER = 'tools/harness/ladder/ptr.json';
const WINNER = 'policy:reset:q=rate-peak@0/0|turn@10/30x/5/0/100';     // qrate1's winner (§17.2), the configuration both fixtures ran
const PIN_Q86K = { ticks: 86068, hashGame: '17d487cece5a5587' };          // = §17.4's end state (86,068; total quirks 1.17e13)
const PIN_QL6 = { ticks: 86071, hashGame: '6b1557b562169e2e' };
const PIN_Q31 = { ticks: 88767, hashGame: '66ef6823848ad208' };            // = CI 36822076088 leg winner-choff@1, stage q31
// QUOTED from the measurement (CI 36822076088 at f565355, leg winner-choff@1, twice equal): from Q31 the same
// configuration bought q32 at tick 140,759 with total quirks 2.8108370421808497e18 — the oracle V4's threshold meets.
const Q32_BOUGHT_AT_TOTAL = 2.8108370421808497e18;
// The SOURCE (games/ptr/js/layers.js): q31 `1e48*(time+1)^8.4` (:3262), q32 `1e58*(time+1)^10` (:3275); a Quirk Layer
// costs `base^(base^x − 1)` quirks with base 2 (:3043-3052), so the 7th (x = 6) costs 2^63; quirk energy accrues as
// `(q.time·enGainMult)^(QL + free − 1)·diff` (:2984), and q11 = `(log10(total+1)+1)^#upgrades` (:3139).
const PRICE = { 31: [8.4, 1e48], 32: [10, 1e58] };
const QL7_COST_LOG10 = 63 * Math.log10(2);
// qrate1's scratch reading at the end of §17.4's leg (the brief's oracle): best purse ÷ price, at the run's start.
const QRATE1 = { 31: -4.89, 32: -17.2 };
const HOLD_EXCLUDE = 'exclude=reset:h,challenges:h,reset:q,upgrades:q,reset:o,reset:ss';   // §12's recipe (the hold, at registration)

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
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, ...extra]);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { file: f, exit: r.code }); } catch { return { error: 'no result (exit ' + r.code + '): ' + r.out.slice(-600), exit: r.code }; }
}
const near = (x, y, tol) => Number.isFinite(Number(x)) && Math.abs(Number(x) - y) <= tol;
const lg = (x) => { const m = /^(-?\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(x)); return m ? Math.log10(Number(m[1])) + (m[2] ? Number(m[2]) : 0) : NaN; };
const snapEval = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const EV = `({total: String(player.q.total), qp: String(player.q.points), ql: Number(player.q.buyables[11]), upg: player.q.upgrades.join(','), hc: JSON.stringify(player.h.challenges), ac: player.h.activeChallenge || null, sb: String(player.sb.points), qt: Number(player.q.time)})`;

// ---- Part fixture ----------------------------------------------------------------------------------------------------
async function partFixture() {
  const d = path.join(TMP, 'fx');
  const [x, y, z] = await Promise.all([
    run('ptr', { 'from-snapshot': Q308K, profile: 'all', ticks: 6000, queue: Q23, 'auto-opt': WINNER, 'stop-snapshot': d, 'stop-snapshot-name': 'Q86K', eval: EV }),
    run('ptr', { 'from-snapshot': Q86K, profile: 'all', ticks: 3000, until: '!player.h.activeChallenge', 'auto-opt': WINNER, eval: EV }),
    run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: 20000, until: "hasUpgrade('q',31)", 'auto-opt': CHOFF, eval: EV }),
  ]);
  const c1 = snapEval(Q86K), c2 = snapEval(QL6);
  const q = ((x.queueStatus && x.queueStatus.queues) || x.queues || [])[0];   // run.mjs reports the runner as `queueStatus`
  const ok1 = !!x.ok && x.ticks === PIN_Q86K.ticks && x.hashGame === PIN_Q86K.hashGame && c1.ticks === PIN_Q86K.ticks && c1.hashGame === PIN_Q86K.hashGame &&
    !!q && q.state === 'done' && x.eval && x.eval.ql === 6 && /\b24\b/.test(x.eval.upg) && x.eval.ac === 22 && JSON.stringify(c1.config.queue) === JSON.stringify([Q23]);
  row({ gate: 'F1 Q86K: Q308K → the q23 queue → the qrate1 winner for 6,000 game-s = the committed fixture (§17.4\'s end state)', id: 'ptr', ok: ok1,
    notes: `rebuilt ${x.ticks} / ${x.hashGame}; committed ${c1.ticks} / ${c1.hashGame}; pin ${PIN_Q86K.ticks} / ${PIN_Q86K.hashGame}; queue ${q && q.state}; QL ${x.eval && x.eval.ql}, q upgrades ${x.eval && x.eval.upg}, total ${x.eval && x.eval.total}, inside H${x.eval && x.eval.ac}; config.queue ${JSON.stringify(c1.config.queue)} ${x.error || ''}` });
  const ok2 = !!y.ok && y.ticks === PIN_QL6.ticks && y.hashGame === PIN_QL6.hashGame && c2.ticks === PIN_QL6.ticks && c2.hashGame === PIN_QL6.hashGame && y.eval && y.eval.ac === null && y.eval.ql === 6;
  row({ gate: 'F2 QL6: Q86K under the same configuration until no challenge is active = the committed fixture (the declared facts state)', id: 'ptr', ok: ok2,
    notes: `rebuilt ${y.ticks} / ${y.hashGame} (+${y.ticks - PIN_Q86K.ticks} ticks; in a challenge: ${y.eval && y.eval.ac}; q.time ${y.eval && y.eval.qt}; Super Boosters ${y.eval && y.eval.sb}); committed ${c2.ticks} / ${c2.hashGame}; pin ${PIN_QL6.ticks} / ${PIN_QL6.hashGame} ${y.error || ''}` });
  const c3 = snapEval(Q31);
  const ok3 = !!z.ok && z.ticks === PIN_Q31.ticks && z.hashGame === PIN_Q31.hashGame && c3.ticks === PIN_Q31.ticks && c3.hashGame === PIN_Q31.hashGame && z.eval && /\b31\b/.test(z.eval.upg) && z.eval.ql === 6;
  row({ gate: 'F3 Q31: QL6 under the winner with challenge attempts held until the reflex buys q31 = the committed fixture (the q32 verdict\'s state)', id: 'ptr', ok: ok3,
    notes: `rebuilt ${z.ticks} / ${z.hashGame} (+${z.ticks - PIN_QL6.ticks} game-s from QL6; total ${z.eval && z.eval.total}; q.time ${z.eval && z.eval.qt}; Super Boosters ${z.eval && z.eval.sb}); committed ${c3.ticks} / ${c3.hashGame}; pin ${PIN_Q31.ticks} / ${PIN_Q31.hashGame} ${z.error || ''}` });
}

// ---- Part facts ------------------------------------------------------------------------------------------------------
function priceRows(doc, state) {
  const probs = [];
  for (const id of Object.keys(PRICE)) {
    const [k, coef] = PRICE[id];
    const f = (doc.facts || []).find((x) => x.id === `price:q:upgrade:${id}`);
    if (!f) { probs.push(`q${id}: NO FACT`); continue; }
    if (f.abstain) { probs.push(`q${id}: abstains (${f.abstain})`); continue; }
    const vs = f.variants || [f];
    const v = vs[vs.length - 1], s = v.shapes && v.shapes['player.q.time'];
    if (!s || s.type !== 'power' || !near(s.exponent, k, 1e-6) || s.offset !== 1 || !near(lg(s.coef), Math.log10(coef), 1e-6)) probs.push(`q${id}: shape ${JSON.stringify(s)}`);
    if ((v.currency || f.currency) !== 'player.q.energy') probs.push(`q${id}: currency ${v.currency || f.currency}`);
    if (!JSON.stringify(f.from && f.from.seen).includes(state)) probs.push(`q${id}: not seen at ${state} (${JSON.stringify(f.from && f.from.seen)})`);
  }
  return probs;
}
async function partFacts() {
  const decl = declaredStates('ptr');
  const declared = decl.map((d) => d.name);
  const doc = JSON.parse(fs.readFileSync(path.join(REPO, 'games-facts/ptr.json'), 'utf8'));
  {
    const probs = [];
    if (!declared.includes('m28/QL6')) probs.push(`the declaration names ${JSON.stringify(declared)}`);
    for (const n of declared) if (!doc.states.includes(n)) probs.push(`games-facts/ptr.json does not carry the declared state ${n}`);
    probs.push(...priceRows(doc, 'm28/QL6'));
    row({ gate: 'D1 the committed facts carry the declared state, and q31 / q32 are PRESENT there with the source\'s shapes (8.4 · 1e48, 10 · 1e58 in q.time)', id: 'ptr', ok: !probs.length,
      notes: probs.length ? probs.join('; ') : `declared ${JSON.stringify(declared)}; ${doc.states.length} states, the last ${doc.states.slice(-2).join(', ')}; q31 1e48·(q.time+1)^8.4, q32 1e58·(q.time+1)^10 in player.q.energy, seen at m28/QL6` });
  }
  {
    // D2 — the MECHANISM, not the committed file: regenerate prices through the DEFAULT state list
    const out = path.join(TMP, 'facts-price');
    const r = await child([path.join(REPO, 'tools/harness/facts.mjs'), 'ptr', '--kinds', 'price', '--out', out, '--jobs', String(POOL)]);
    let sdoc = null; try { sdoc = JSON.parse(fs.readFileSync(path.join(out, 'ptr.json'), 'utf8')); } catch { /* reported */ }
    const probs = sdoc ? [] : [`no scratch file (exit ${r.code}): ${r.out.slice(-300)}`];
    if (sdoc) {
      const want = statesOf('ptr', []).map((s) => s.name);
      if (JSON.stringify(sdoc.states) !== JSON.stringify(want)) probs.push(`states ${sdoc.states.length} ≠ statesOf ${want.length}`);
      for (const n of declared) if (!sdoc.states.includes(n)) probs.push(`the regeneration SKIPPED the declared state ${n}`);
      probs.push(...priceRows(sdoc, 'm28/QL6'));
    }
    row({ gate: 'D2 VACUITY: a price-only regeneration through the default state list (no --from) produces q31 / q32 at the declared state', id: 'ptr', ok: !probs.length,
      notes: probs.length ? probs.join('; ') : `${sdoc.states.length} states (= statesOf), q31 and q32 shaped at m28/QL6 — without the declared state both would read "locked in every state" and facts-1's O1 would ABSTAIN green` });
  }
  {
    // D3 — a declaration is never skipped: missing file, a mark, a duplicate — each a hard error
    const base = path.join(TMP, 'decl');
    fs.mkdirSync(path.join(base, 'x'), { recursive: true });
    fs.writeFileSync(path.join(base, 'x', 'S.json'), '{}');
    const cases = {
      missing: [{ file: 'x/NOPE.json', why: 't' }],
      mark: [{ file: 'all/M01.json', why: 't' }],
      duplicate: [{ file: 'x/S.json', why: 't' }, { file: 'x/S.json', why: 't' }],
      outside: [{ file: '../S.json', why: 't' }],
      noWhy: [{ file: 'x/S.json' }],
    };
    fs.mkdirSync(path.join(base, 'all'), { recursive: true }); fs.writeFileSync(path.join(base, 'all', 'M01.json'), '{}');
    const res = {};
    for (const [k, states] of Object.entries(cases)) {
      fs.writeFileSync(path.join(base, 'facts-states.json'), JSON.stringify({ format: 'tmt-facts-states/1', states }));
      try { declaredStates('ptr', base); res[k] = 'ACCEPTED'; } catch (e) { res[k] = 'refused: ' + String(e.message).replace(base, '<base>').slice(0, 90); }
    }
    fs.writeFileSync(path.join(base, 'facts-states.json'), JSON.stringify({ format: 'tmt-facts-states/1', states: [{ file: 'x/S.json', why: 't' }] }));
    let good; try { good = declaredStates('ptr', base).map((d) => d.name); } catch (e) { good = 'threw ' + e.message; }
    const ok = Object.values(res).every((v) => v.startsWith('refused')) && JSON.stringify(good) === JSON.stringify(['x/S']);
    row({ gate: 'D3 a declaration naming a missing file, a mark, a duplicate, a path outside, or no reason is a HARD ERROR (never skipped)', id: '—', ok,
      notes: `${Object.entries(res).map(([k, v]) => `${k}: ${v}`).join(' · ')} · a good one: ${JSON.stringify(good)}` });
  }
}

// ---- Part verdict ----------------------------------------------------------------------------------------------------
const holdQueue = (hold, gs) => ({ format: 'tmt-queue/1', id: 'm28-v3-hold', source: 'authored', comment: 'gate V3: the template\'s hold, for an independent reading',
  steps: [{ do: 'hold', features: hold }, { do: 'wait', until: 'false', timeout: { gs }, onTimeout: 'abort' }] });
const RATIO = (id) => `(function(){var L=function(x){return new Decimal(x).log10().toNumber()};var e=L(player.q.energy);return {qt: Number(player.q.time), charged: e - L(tmp.q.upgrades[${id}].cost), live: e - L(layers.q.upgrades[${id}].cost()), total: String(player.q.total), upg: player.q.upgrades.length}})()`;
async function partVerdict() {
  const [o, v31, v32, v32b] = await Promise.all([
    Promise.all([31, 32].map((id) => run('ptr', { 'from-snapshot': Q86K, profile: 'all', ticks: 1, 'auto-opt': HOLD_EXCLUDE, eval: RATIO(id) }))),
    strategize('ptr', ['--from', QL6, '--goal', 'upg:q:31']),
    strategize('ptr', ['--from', QL6, '--goal', 'upg:q:32']),
    strategize('ptr', ['--from', Q31, '--goal', 'upg:q:32']),
  ]);
  {
    const r31 = o[0].eval || {}, r32 = o[1].eval || {};
    const ok = near(r31.charged, QRATE1[31], 0.005) && near(r32.charged, QRATE1[32], 0.05);
    row({ gate: `V0 qrate1's reading reproduced (Q86K, row-3 resets + challenges:h excluded at registration, 1 tick): q31 10^${QRATE1[31]}, q32 10^${QRATE1[32]}`, id: 'ptr', ok,
      notes: `q31 charged 10^${r31.charged && r31.charged.toFixed(4)} (live 10^${r31.live && r31.live.toFixed(4)}), q32 charged 10^${r32.charged && r32.charged.toFixed(4)} (live 10^${r32.live && r32.live.toFixed(4)}) at q.time ${r31.qt} — inside H22, mid-run: the ratio FALLS from here ${o[0].error || ''}${o[1].error || ''}` });
  }
  const V1 = v31.results && v31.results[0], V2 = v32.results && v32.results[0];
  {
    const probs = [];
    if (!V1) probs.push('no verdict ' + (v31.error || ''));
    else {
      if (V1.verdict !== 'waiting-cannot-help' || V1.queue !== null) probs.push(`verdict ${V1.verdict}`);
      if (V1.static.priceExponent !== PRICE[31][0] || V1.static.integratedExponent !== 6) probs.push(`static ${V1.static.priceExponent} vs ${V1.static.integratedExponent}`);
      const L = V1.levers || [], ins = L.map((l) => l.input + (l.zeroedAtPeak ? '(zeroed)' : ''));
      if (JSON.stringify(ins) !== JSON.stringify(['player.q.total', 'player.q.buyables.11', 'player.sb.points(zeroed)'])) probs.push(`levers ${JSON.stringify(ins)}`);
      for (let i = 1; i < L.length; i++) if (!L[i].zeroedAtPeak && !L[i - 1].zeroedAtPeak && !(L[i].distanceLog10 >= L[i - 1].distanceLog10)) probs.push('levers not ranked by distance');
      const ql = L.find((l) => l.input === 'player.q.buyables.11');
      if (!ql || ql.currency !== 'player.q.points' || !near(lg(ql.cost), QL7_COST_LOG10, 1e-6)) probs.push(`QL lever ${JSON.stringify(ql && [ql.currency, ql.cost])} ≠ 2^63 quirks`);
      // the threshold from the SOURCE: q11 must rise by R^(1/E) (energy ∝ M^E, E = QL − 1 = 5), q11 = (log10(T+1)+1)^n
      const R = -V1.rollback.peak.ratioLog10, sg = V1.subgoal || {};
      const ql6 = snapEval(QL6), P = typeof ql6.player === 'string' ? JSON.parse(ql6.player) : ql6.player;
      const n = P.q.upgrades.length, base = Math.log10(Number(P.q.total) + 1) + 1;
      const want = (base * Math.pow(10, R / 5 / n)) - 1;
      if (sg.dimension !== 'player.q.total' || !near(lg(sg.threshold), want, 2e-3)) probs.push(`sub-goal ${JSON.stringify(sg)} ≠ player.q.total ≥ 10^${want.toFixed(4)} (source)`);
      V1.sourceThresholdLog10 = want;
    }
    row({ gate: 'V1 q31 at QL6: WAITING CANNOT HELP; levers q.total < the next Quirk Layer (2^63) < Super Boosters (zeroed at the peak — not a sub-goal); sub-goal total quirks at the SOURCE\'s threshold', id: 'ptr', ok: !probs.length,
      notes: probs.length ? probs.join('; ') : `peak 10^${V1.rollback.peak.ratioLog10} at q.time ${V1.rollback.peak.field}; levers ${(V1.levers || []).map((l) => `${l.input} 10^${l.distanceLog10}${l.zeroedAtPeak ? ' (zeroed at the peak)' : ''}`).join(' < ')}; sub-goal ${V1.subgoal.dimension} ≥ ${V1.subgoal.threshold} (source 10^${V1.sourceThresholdLog10.toFixed(4)})` });
  }
  {
    const probs = [];
    if (!V2) probs.push('no verdict ' + (v32.error || ''));
    else {
      if (V2.verdict !== 'waiting-cannot-help' || V2.queue !== null) probs.push(`verdict ${V2.verdict}`);
      if (V2.static.priceExponent !== PRICE[32][0] || V2.static.integratedExponent !== 6) probs.push(`static ${V2.static.priceExponent} vs ${V2.static.integratedExponent}`);
      const L = V2.levers || [], ins = L.map((l) => l.input + (l.zeroedAtPeak ? '(zeroed)' : ''));
      if (JSON.stringify(ins) !== JSON.stringify(['player.q.buyables.11', 'player.q.total', 'player.sb.points(zeroed)'])) probs.push(`levers ${JSON.stringify(ins)}`);
      const sg = V2.subgoal || {};
      if (sg.dimension !== 'player.q.points' || !near(lg(sg.threshold), QL7_COST_LOG10, 1e-6)) probs.push(`sub-goal ${JSON.stringify(sg)} ≠ player.q.points ≥ 2^63`);
      const ql = L[0]; if (!ql || ql.flips !== false) probs.push('the 7th Quirk Layer must NOT flip the exponent (E+2 = 7 < 10)');
    }
    row({ gate: 'V2 q32 at QL6: WAITING CANNOT HELP; the nearest lever the next Quirk Layer (exponent; does not flip 7 vs 10); sub-goal q.points ≥ 2^63 (source)', id: 'ptr', ok: !probs.length,
      notes: probs.length ? probs.join('; ') : `peak 10^${V2.rollback.peak.ratioLog10} at q.time ${V2.rollback.peak.field}; levers ${(V2.levers || []).map((l) => `${l.input} 10^${l.distanceLog10}${l.zeroedAtPeak ? ' (zeroed at the peak)' : ''}`).join(' < ')}; sub-goal ${V2.subgoal.dimension} ≥ ${V2.subgoal.threshold}` });
  }
  {
    // V3 — an INDEPENDENT boot: the same hold, as a queue, for the peak's tick count; the ratio read with the tick-start tmp
    const probs = [];
    let notes = '';
    if (!V1) probs.push('no verdict');
    else {
      const qf = path.join(TMP, 'v3-hold.json');
      fs.writeFileSync(qf, JSON.stringify(holdQueue(V1.rollback.hold, V1.rollback.horizon + 10)));
      const r = await run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: V1.rollback.peak.k, queue: qf, eval: RATIO(31) });
      const e = r.eval || {};
      if (r.ticks !== V1.rollback.peak.tick) probs.push(`tick ${r.ticks} ≠ ${V1.rollback.peak.tick}`);
      if (!near(e.charged, V1.rollback.peak.ratioLog10, 2e-4)) probs.push(`charged 10^${e.charged} ≠ the verdict's 10^${V1.rollback.peak.ratioLog10}`);
      if (!(Math.abs(e.live - e.charged) > 0.5)) probs.push(`live 10^${e.live} too close to charged — the row cannot tell them apart`);
      notes = `independent boot at tick ${r.ticks} (q.time ${e.qt}): charged 10^${e.charged && e.charged.toFixed(4)} ${near(e.charged, V1.rollback.peak.ratioLog10, 2e-4) ? '=' : '≠'} the verdict's 10^${V1.rollback.peak.ratioLog10}; live 10^${e.live && e.live.toFixed(4)} (the price at q.time ${e.qt} — one tick later than the engine charges) ${r.error || ''}`;
    }
    row({ gate: 'V3 the verdict is judged against the CHARGED price (tick-start tmp, §16): an independent boot under the same hold reads the same peak, and the live price would not', id: 'ptr', ok: !probs.length, notes: probs.length ? probs.join('; ') + ' — ' + notes : notes });
  }
  {
    // V4 — q32 once q31 is owned: q31 raised q11's POWER (the upgrade count 8 → 9), which no lever prices, so the
    // QL6 verdict's sub-goal (the 7th Quirk Layer) is superseded; here the nearest lever is total quirks again, at the
    // SOURCE's threshold — and the measured purchase (CI, quoted above) lands on it
    const V = v32b.results && v32b.results[0], probs = [];
    let want = NaN;
    if (!V) probs.push('no verdict ' + (v32b.error || ''));
    else {
      if (V.verdict !== 'waiting-cannot-help' || V.queue !== null) probs.push(`verdict ${V.verdict}`);
      const L = V.levers || [], sg = V.subgoal || {};
      if (!L[0] || L[0].input !== 'player.q.total' || L[0].zeroedAtPeak) probs.push(`nearest lever ${L[0] && L[0].input}`);
      const c = snapEval(Q31), P = typeof c.player === 'string' ? JSON.parse(c.player) : c.player;
      const n = P.q.upgrades.length, base = Math.log10(Number(P.q.total) + 1) + 1, R = -V.rollback.peak.ratioLog10;
      want = (base * Math.pow(10, R / 5 / n)) - 1;
      if (n !== 9) probs.push(`${n} q upgrades held, not 9`);
      if (sg.dimension !== 'player.q.total' || !near(lg(sg.threshold), want, 2e-3)) probs.push(`sub-goal ${JSON.stringify(sg)} ≠ player.q.total ≥ 10^${want.toFixed(4)} (source)`);
      if (!near(lg(sg.threshold), Math.log10(Q32_BOUGHT_AT_TOTAL), 1e-3)) probs.push(`the threshold 10^${lg(sg.threshold).toFixed(4)} misses the measured purchase at 10^${Math.log10(Q32_BOUGHT_AT_TOTAL).toFixed(4)}`);
    }
    row({ gate: 'V4 q32 once q31 is owned (Q31): the nearest lever is total quirks at the SOURCE\'s threshold, and the measured purchase (CI 36822076088) lands on it', id: 'ptr', ok: !probs.length,
      notes: probs.length ? probs.join('; ') : `peak 10^${V.rollback.peak.ratioLog10} at q.time ${V.rollback.peak.field}; levers ${(V.levers || []).map((l) => `${l.input} 10^${l.distanceLog10}${l.zeroedAtPeak ? ' (zeroed at the peak)' : ''}`).join(' < ')}; sub-goal ${V.subgoal.dimension} ≥ ${V.subgoal.threshold} (source 10^${want.toFixed(4)}); bought at ${Q32_BOUGHT_AT_TOTAL} (+${((Q32_BOUGHT_AT_TOTAL / Number(V.subgoal.threshold) - 1) * 100).toFixed(3)} %)` });
  }
  partVerdict.v31 = v31;
}

// ---- Part subgoal ----------------------------------------------------------------------------------------------------
async function partSubgoal() {
  const v = partVerdict.v31 || await strategize('ptr', ['--from', QL6, '--goal', 'upg:q:31']);
  const sg = v.results && v.results[0] && v.results[0].subgoal;
  const rounds = path.join(TMP, 'rounds-s1.json');
  const r = v.file ? await run('ptr', { 'from-snapshot': QL6, profile: 'all', ticks: 1, planner: true, 'planner-mode': 'auto', 'planner-ladder': LADDER, 'planner-goal': v.file, 'planner-opt': 'maxRounds=1', 'rounds-out': rounds }) : { ok: false, error: v.error };
  const R = fs.existsSync(rounds) ? JSON.parse(fs.readFileSync(rounds, 'utf8')) : null;
  const x = R && R.log && R.log[0];
  const checks = {
    verdictHasSubgoal: !!sg && sg.kind === 'value' && sg.dimension === 'player.q.total',
    roundRan: !!x,
    sourceIsSubgoal: !!x && x.goal && x.goal.source === 'subgoal',
    targetIsTheDimension: !!x && x.target && x.target.dimension === 'player.q.total',
    thresholdIsTheVerdicts: !!x && x.target && !!sg && String(x.target.threshold) === String(sg.threshold),
  };
  row({ gate: 'S1 the q31 verdict\'s sub-goal IS round 0\'s active goal (strategize --json → run.mjs --planner-goal; read from the round log)', id: 'ptr', ok: Object.values(checks).every(Boolean),
    notes: `${Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ')} — sub-goal ${JSON.stringify(sg && { dimension: sg.dimension, threshold: sg.threshold })}; round 0 goal ${JSON.stringify(x && x.goal && { source: x.goal.source, id: x.goal.id })}, target ${JSON.stringify(x && x.target && { dimension: x.target.dimension, threshold: x.target.threshold, held: x.target.held })}; winner ${x && x.winner && x.winner.id} ${r.error || ''}` });
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-templates.js', 'loader/tmt-planner.js', 'tools/harness/facts.mjs', 'tools/harness/strategize.mjs'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the code this slice changed (templates, planner, facts.mjs, strategize)', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

// ---- Part leg (measurement, one per CI job) ---------------------------------------------------------------------------
// A leg = STAGES from QL6, each a run to its `until` (or its horizon) with a stop snapshot the next stage resumes from.
// `planner` stages drive `--planner=auto` with the template's sub-goal (strategize at the stage's start state).
// ⚠ q31 → q32 directly, NOT through the 7th Quirk Layer the q32 verdict at QL6 names: buying q31 raises q11's POWER
// (the upgrade count, 8 → 9), which the lever walk cannot price (an array is not a numeric input), and a local chained
// leg bought q32 at 6 Quirk Layers (tick 140,759). A stage named after the template's lever would never complete.
const STAGES = [
  { k: 'q31', until: "hasUpgrade('q',31)" },
  { k: 'q32', until: "hasUpgrade('q',32)" },
];
const WIDE = 'keepModifiers=1;maxCandidates=999;screenK=999';
const LEGS = {
  // the qrate1 winner as it is: the H22 give-up reflex re-enters H22 hundreds of times (the control)
  'winner@1': { diff: 1, opt: WINNER, horizons: [30000] },
  // the winner with challenge ATTEMPTS held (exclude=challenges:h — the registered alternative qrate1 screened as ch-off)
  'winner-choff@1': { diff: 1, opt: `${WINNER};exclude=challenges:h`, horizons: [20000, 120000] },
  // the page's tick: is q31 reached, and when (the template's diff-0.05 verdict asks for ~23× more quirks)
  'winner-choff@0.05': { diff: 0.05, opt: `${WINNER};exclude=challenges:h`, horizons: [8000, 120000] },
  'winner@0.05': { diff: 0.05, opt: WINNER, horizons: [8000] },
  // the PIPELINE: the planner on the template's sub-goal at each stage's start, from the shipped table (no auto-opt):
  // stage q31 WIDENED (qrate1's configuration: the pool that can confirm a reset:q policy, ~4 min a round), without and
  // with the challenge-hold candidate; stage q32 at the DEFAULT options (a round ~15 s — 170 rounds of widening would
  // be ~12 runner-hours) keeping whatever stage q31 committed, which rides in the stop snapshot's planner state
  'planner-wide@1': { diff: 1, opt: '', planner: [`${WIDE};maxRounds=12`, ''], horizons: [3600, 120000] },
  'planner-wide-ch@1': { diff: 1, opt: '', planner: [`${WIDE};challengeCandidates=1;maxRounds=12`, 'challengeCandidates=1'], horizons: [3600, 120000] },
};
async function stageRun(L, st, from, outDir, i) {   // eslint-disable-line max-params
  const ticks = Math.round(L.horizons[i] / L.diff);
  const flags = { 'from-snapshot': from, profile: 'all', diff: L.diff, ticks, until: st.until, 'auto-opt': L.opt, eval: EV, 'wall-ms': 5 * 3600e3, 'stop-snapshot': outDir, 'stop-snapshot-name': st.k };
  let verdict = null;
  const popt = L.planner ? L.planner[i] : null;
  if (L.planner) {
    const goal = st.k === 'q31' ? 'upg:q:31' : 'upg:q:32';
    const v = await strategize('ptr', ['--from', from, '--goal', goal, ...(L.diff !== 1 ? ['--diff', String(L.diff)] : [])]);
    const r0 = v.results && v.results[0];
    verdict = r0 ? { verdict: r0.verdict, subgoal: r0.subgoal, peak: r0.rollback && r0.rollback.peak } : { error: v.error };
    if (!r0 || !r0.subgoal) return { ok: false, verdict, error: 'no sub-goal to hand the planner' };
    Object.assign(flags, { planner: true, 'planner-mode': 'auto', 'planner-ladder': LADDER, 'planner-goal': v.file, 'planner-opt': popt || undefined, 'rounds-out': path.join(outDir, st.k + '.rounds.json') });
  }
  const r = await run('ptr', flags);
  r.verdict = verdict;
  if (L.planner && fs.existsSync(flags['rounds-out'])) {
    const R = JSON.parse(fs.readFileSync(flags['rounds-out'], 'utf8'));
    r.roundsTotal = (R.log || []).length;
    r.winners = {};
    for (const x of R.log || []) { const w = x.winner && x.winner.id; r.winners[w] = (r.winners[w] || 0) + 1; }
    r.rounds = (R.log || []).slice(0, 12).map((x) => ({ round: x.round, source: x.goal && x.goal.source, target: x.target && x.target.dimension, winner: x.winner && x.winner.id, confirmed: x.candidates.filter((c) => c.confirm).length, of: x.candidates.length, refused: x.candidates.filter((c) => c.refused).length, wallS: Math.round((x.cost && x.cost.wallMs || 0) / 1000) }));
  }
  return r;
}
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  const legs = await Promise.all([0, 1].map(async (copy) => {
    const out = path.join(TMP, `leg-${copy}`);
    fs.mkdirSync(out, { recursive: true });
    let from = QL6;
    const stages = [];
    for (let i = 0; i < L.horizons.length; i++) {
      const st = STAGES[i];
      const r = await stageRun(L, st, from, out, i);
      // read off the END STATE, never off the stop's reason: a leg that ran out of horizon reads like one that stopped
      const reached = !!r.eval && (st.k === 'q31' ? /\b31\b/.test(r.eval.upg) : st.k === 'ql7' ? r.eval.ql >= 7 : /\b32\b/.test(r.eval.upg));
      stages.push({ stage: st.k, ok: !!r.ok, reached: !!reached, ticks: r.ticks, gameSeconds: r.gameSeconds, sinceQL6: r.gameSeconds !== undefined ? Math.round((r.gameSeconds - PIN_QL6.ticks) * 1000) / 1000 : null,
        hashGame: r.hashGame, eval: r.eval, walled: !!(r.stall && r.stall.walled), verdict: r.verdict, rounds: r.rounds, roundsTotal: r.roundsTotal, winners: r.winners, wallMs: r.wallMs, error: r.error });
      if (!reached || !r.ok) break;
      from = path.join(out, st.k + '.json');
    }
    return stages;
  }));
  const [x, y] = legs;
  const eq = x.length === y.length && x.every((s, i) => s.ticks === y[i].ticks && s.hashGame === y[i].hashGame);
  const out = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, stages: x, wallMs: legs.map((s) => s.reduce((t, q) => t + (q.wallMs || 0), 0)) };
  row({ gate: `M-leg ${a.leg} — QL6 → q31 → q32 (M28) at diff ${L.diff}, twice equal`, id: 'ptr', ok: eq && x.every((s) => s.ok && !s.walled),
    notes: x.map((s) => `${s.stage} ${s.reached ? 'REACHED' : 'not reached'} at +${s.sinceQL6} game-s (tick ${s.ticks}; total ${s.eval && s.eval.total}, QL ${s.eval && s.eval.ql}, H22 ${s.eval && JSON.parse(s.eval.hc || '{}')[22]})${s.verdict ? ` [verdict ${s.verdict.verdict}, sub-goal ${s.verdict.subgoal && s.verdict.subgoal.dimension} ≥ ${s.verdict.subgoal && s.verdict.subgoal.threshold}]` : ''}${s.rounds ? ` [${s.roundsTotal} rounds; first: ${s.rounds.map((q) => `r${q.round} ${q.winner} (${q.confirmed}/${q.of}, ${q.wallS} s)`).join('; ')}; winners ${JSON.stringify(s.winners)}]` : ''}`).join(' → ') + `; ${x.map((s) => s.hashGame).join('/')} vs ${y.map((s) => s.hashGame).join('/')}; wall ${out.wallMs.map((w) => Math.round(w / 1000)).join(' / ')} s` });
  fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `m28-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(out, null, 1) + '\n');
}
// `--only <key>`: a dispatch that ran ONE leg (qrate1.yml `-f leg=…`) merges that one, by name; nothing else is implied
const MERGED = a.only ? [String(a.only)] : Object.keys(LEGS);
if (a.only && !LEGS[a.only]) { console.error(`REFUSED: --only ${a.only} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /m28-leg-.*\.json$/.test(f)) : [];
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const k of MERGED) {
    const j = got[`m28-leg-${k.replace(/[^\w.-]/g, '_')}.json`];
    row({ gate: `M-merge ${k}`, id: 'ptr', ok: !!j && j.twiceEqual && j.stages.every((s) => s.ok && !s.walled),
      notes: j ? j.stages.map((s) => `${s.stage} ${s.reached ? `at +${s.sinceQL6}` : `not reached by +${s.sinceQL6} (total ${s.eval && s.eval.total})`}`).join(' → ') + `; commit ${j.commit}; twice equal ${j.twiceEqual}` : 'MISSING — the leg did not run or its artifact was not found' });
  }
}

const EXPECT = { fixture: 3, facts: 3, verdict: 5, subgoal: 1, grep: 1, leg: 1, merge: MERGED.length };
const FN = { fixture: partFixture, facts: partFacts, verdict: partVerdict, subgoal: partSubgoal, grep: partGrep, leg: partLeg, merge: partMerge };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT m28 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-m28-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
