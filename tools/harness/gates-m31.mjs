// The m31 gates — facts past q33, and toward M31 (`hasMilestone('q',7) && player.s.autoBld`: 1e60 total quirks;
// ptr-strategy arc, slice tmt-m31-1).
//   node tools/harness/gates-m31.mjs --part facts|verdict|stage|grep|push [--facts <dir>] [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-m31.mjs --part levers [--assert]                (the M31 value goal's levers; a measurement)
//   node tools/harness/gates-m31.mjs --part leg --leg <key> [--assert]       (one CI job per leg: qrate1.yml -f part=m31)
//   node tools/harness/gates-m31.mjs --part merge --dir <artifacts> [--only <key>] [--summary] [--assert]
//
// GATES (`push`, on every push in sweep.yml's `m31` job):
// Part facts    D1 the facts state DECLARED: stages/M30 (outside every challenge; q34 and H31 unlocked there — read by a
//               separate --eval boot) is in facts-states.json after m28/QL6, with a `why`, and the facts file reads it.
//               D2 (O2) H31's goal = the source over 0 … completionLimit: superexponential 2.5 · 50 · 1e5325, domain the
//               limit. D3 (O7) H31's budget = the source: player.h.chall31bought, limit 10, on t 11 and e 11 exactly.
//               D4 itemUnlocked = the engine: no fact claims an item whose unlocked() is falsy — ptr's H32 in every state,
//               and collection-of-everything's `if (cond) return true` items at fresh (both read by --eval boots).
//               D5 q34's price = the source (2.5e94·(q.time+1)^15 in quirk energy) at stages/M30.
//               `--facts <dir>` reads another directory (a mutant's regeneration).
// Part verdict  V1 time-priced-purchase on q34 from stages/M30: WAITING CANNOT HELP, the levers ranked by the facts'
//               multiplier walk. V2 challenge-attempt on H31: SHORT (10^1158 of points), no reachable lever, the table's
//               give-up named. V3 reset-requirement on sg AT stages/M30: not open (it holds its one Super Generator), with
//               the reason. V4 the REBUILD (this slice's extension): from m31/R95400 — the table before this slice, 879
//               ticks past M30, a q reset having zeroed sg — RESET-AT, confirmed, the reflex makes the reset once the
//               zeroers are held, and the queue = the committed one. V5 the extension's reach: a layer that STARTS unlocked
//               is never a rebuild (ptr fresh: none open), and something / collection-of-everything run with no throw.
// Part stage    S1 the stage `sg-keep` is the template's answer as DATA: its gates = V4's hold minus the reset it makes,
//               each reading the engine's requirement, none its number — the base's zeroers act while Super Generators hold
//               their currency or Generators meet the requirement; the zeroers of the currency itself (h, o, ss, h's
//               challenges) only when it is empty AND at the requirement; q cashes in by the derived default's ratio rule
//               (`gain>=2x`), because `rate-peak` never sees a peak in a held cycle (measured); its `when` is state. S2 from
//               m31/R95400 under the SHIPPED table: no zeroing reset fires, and reset:sg rebuilds Super Generators on the
//               template's tick. S3 the named WALL: m31/W124521 = stages/M30 + 30,000 game-s under the shipped table
//               (5.104e25 total quirks, q milestones 0–6, 7 Quirk Layers), rebuilt to its pin.
// Part grep     X1 no game id and no ptr layer id in the generic code this slice changed (templates, the facts probes).
// MEASUREMENTS (dispatch-only, `.github/workflows/qrate1.yml -f part=m31`): `levers` (M31's value goal, ranked) and the
// legs — from stages/M30 under the shipped table at diff 1 and 0.05, the stage order, and the control without it — each
// leg TWICE (equal or RED); merge refuses a missing leg.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert', 'summary']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'dir', 'only', 'summary', 'facts']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['facts', 'verdict', 'stage', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'push', 'levers', 'leg', 'merge'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-m31-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 2400)}`); };

// ⚠ This file is the ORACLE, and ptr's ids are its data (the generic code may not name them — part grep).
const FACTS_DIR = path.resolve(a.facts || path.join(REPO, 'games-facts'));
const TABLE = 'games-auto/ptr.json';
const LADDER = 'tools/harness/ladder/ptr.json';
const M30F = 'tools/harness/snapshots/ptr/stages/M30.json';
const PRE_TABLE = 'tools/harness/snapshots/ptr/m31/table-before-m31.json';   // main f14ac74's table, byte for byte
const REBUILD = 'tools/harness/snapshots/ptr/m31/R95400.json';              // stages/M30 + 879 ticks under PRE_TABLE
const QUEUE = 'tools/harness/queues/m31/rr-reset-sg-from-R95400.json';
const WALL = 'tools/harness/snapshots/ptr/m31/W124521.json';                // stages/M30 + 30,000 game-s under the shipped table
const PIN_WALL = { ticks: 124521, hashGame: '41ed4f4f303019da', total: '5.103998705401289e25' };
const STATES_FILE = 'tools/harness/snapshots/ptr/facts-states.json';
const STAGE = 'sg-keep';
const PIN_M30 = { ticks: 94521, hashGame: '132127d4d5573106' };
const PIN_R = { ticks: 95400, hashGame: 'cb98879733061da4' };
const PIN_REBUILD_TICK = 95920;               // V4: the copy's reset:sg tick from m31/R95400 (diff 1)
// The SOURCE (games/ptr/js/layers.js): H31 "Timeless" goal 1e50^(c^2.5)·1e5325, softcapped past 20 completions; its
// completionLimit 10 (+10 per achievement a71, a74); canAfford of t 11 (Extra Time Capsules, :1251) and e 11 (Enhancers,
// :1536) `… && (inChallenge("h", 31) ? player.h.chall31bought < 10 : true)`, raised by :1256 / :1541; q34 "Booster
// Madness" 2.5e94·(q.time+1)^15 in quirk energy (:3302); H32 "Option D" unlocked() = tmp.ps.buyables[11].effects.hindr.
// sg: static, requires 200, base 1.05, exponent 1.25 (200 Generators at 0 Super Generators), baseAmount g points; its
// points are reset by every row-3 reset (sg doReset: layerDataReset when the resetting row > 2).
const H31 = { exponent: 2.5, log10Scale: 50, at0: 5325 };
const BUDGET = { counter: 'player.h.chall31bought', limit: '10', items: ['e/buyable/11', 't/buyable/11'] };
const Q34 = { exponent: 15, coef: 2.5e94 };
const ZEROERS = ['e', 's', 'sb', 't', 'h', 'q', 'o', 'ss'];
const OWN_ZEROERS = ['h', 'o', 'q', 'ss'];
const SG_REQ = 200;
const TARGET = '1e60';

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
async function pool(fns) {
  const out = new Array(fns.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, fns.length) }, async () => { while (i < fns.length) { const k = i++; out[k] = await fns[k](); } }));
  return out;
}
const logRecords = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const num = (x) => { const m = /^(-?\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(x)); return m ? Number(m[1]) * Math.pow(10, m[2] ? Number(m[2]) : 0) : NaN; };
const lg10 = (x) => { const m = /^(-?\d+(?:\.\d+)?)(?:e\+?(-?\d+))?$/i.exec(String(x)); return m ? Math.log10(Number(m[1])) + (m[2] ? Number(m[2]) : 0) : NaN; };
const near = (x, y, tol) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const byTpl = (R, t) => (R && R.results ? R.results.filter((v) => v.template === t) : []);
const readDoc = (id) => { const f = path.join(FACTS_DIR, id + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; };
function expand(doc, seen) { const out = []; for (const r of seen || []) { const [x, y] = Array.isArray(r) ? r : [r, r]; const i0 = doc.states.indexOf(x), i1 = doc.states.indexOf(y); for (let i = i0; i >= 0 && i <= i1; i++) out.push(doc.states[i]); } return out; }
function valuesOf(doc, f) { if (!f) return []; if (!f.variants) return [{ v: f, states: expand(doc, f.from && f.from.seen) }]; return f.variants.map((v) => ({ v, states: expand(doc, v.seen) })); }
const fact = (doc, id) => doc.facts.find((f) => f.id === id);
// An INDEPENDENT reading of a state log: every doReset of a layer the SOURCE says can zero Generators, the ones that DID
// (Generators fell), and the sg resets with Generators just before each.
function zeroingsFromLog(recs) {
  let g = null; const o = { resets: 0, zeroings: 0, by: {}, sg: [] };
  for (const r of recs) {
    if (r.type === 'checkpoint' && r.summary) { g = r.summary['g.p'] === undefined ? null : r.summary['g.p']; continue; }
    if (r.type !== 'action') continue;
    const before = g;
    if (r.state && 'g.p' in r.state) g = r.state['g.p'];
    if (r.call !== 'doReset') continue;
    const L = String((r.args || [])[0]);
    if (L === 'sg') { o.sg.push({ tick: r.tick, by: r.by || r.source, did: r.did, gBefore: before }); continue; }
    if (!ZEROERS.includes(L)) continue;
    o.resets++;
    if (before === null || g === null || !(num(g) < num(before))) continue;
    o.zeroings++; o.by[r.by || r.source] = (o.by[r.by || r.source] || 0) + 1;
  }
  return o;
}

// ---- Part facts --------------------------------------------------------------------------------------------------------
// The engine's own reading of `unlocked` (layerSupport.js: undeclared → true; every reader tests the value's truth) and
// the state readings the rows need — a separate --eval boot of each state the facts file names (never the extractor).
const READ_PTR = `(function () {
  var unl = function (d) { if (!d) return null; var v = d.unlocked; try { return !!(typeof v === 'function' ? v.call(d) : v === undefined ? true : v); } catch (e) { return false; } };
  return { h: !!player.h.unlocked, ac: player.h.activeChallenge || null, c31: unl(layers.h.challenges[31]), c32: unl(layers.h.challenges[32]),
    lim31: (function () { try { return Number(layers.h.challenges[31].completionLimit()); } catch (e) { return null; } })(),
    q34: !!player.q.unlocked && unl(layers.q.upgrades[34]), q34owned: hasUpgrade('q', 34) };
})()`;
const READ_COE = `(function () {
  var out = {};
  for (var l in layers) { var L = layers[l]; if (!L || !player[l] || !player[l].unlocked) continue;
    ['upgrades', 'buyables', 'challenges'].forEach(function (g) { var o = L[g]; if (!o || typeof o !== 'object') return;
      for (var id in o) { var d = o[id]; if (!d || typeof d !== 'object' || isNaN(Number(id))) continue; var v = d.unlocked;
        try { out[l + ':' + g + ':' + id] = !!(typeof v === 'function' ? v.call(d) : v === undefined ? true : v); } catch (e) { out[l + ':' + g + ':' + id] = null; } } }); }
  return out;
})()`;
async function readings(game, states, expr) {
  const res = await pool(states.map((s) => () => run(game, { ...(s === 'fresh' ? {} : { 'from-snapshot': path.join('tools/harness/snapshots', game, s + '.json') }), ticks: 0, eval: expr })));
  return Object.fromEntries(states.map((s, i) => [s, res[i] && res[i].ok ? res[i].eval : { error: res[i] && res[i].error }]));
}
async function partFacts() {
  const doc = readDoc('ptr'), coe = readDoc('collection-of-everything');
  if (!doc) { row({ gate: 'D0 facts file', id: 'ptr', ok: false, notes: `no ${path.relative(REPO, FACTS_DIR)}/ptr.json` }); return; }
  const states = doc.states.slice();
  const [R, RC] = await Promise.all([readings('ptr', states, READ_PTR), coe ? readings('collection-of-everything', coe.states, READ_COE) : Promise.resolve({})]);
  const at = (pred) => states.filter((s) => R[s] && !R[s].error && pred(R[s]));
  // D1 — the declared state
  {
    const decl = fixture(STATES_FILE).states.map((x) => x.file);
    const e = R['stages/M30'];
    const checks = { declared: decl.includes('stages/M30.json') && decl.indexOf('stages/M30.json') > decl.indexOf('m28/QL6.json'),
      why: fixture(STATES_FILE).states.every((x) => typeof x.why === 'string' && x.why.length > 20),
      read: doc.states[doc.states.length - 1] === 'stages/M30',
      outsideEveryChallenge: !!e && e.ac === null, q34UnlockedNotOwned: !!e && e.q34 === true && e.q34owned === false, h31Unlocked: !!e && e.c31 === true,
      firstSuchState: at((x) => x.q34 || x.c31).join(',') === 'stages/M30' };
    row({ gate: 'D1 the facts state past q33 is DECLARED (stages/M30): outside every challenge, q34 and H31 unlocked there and nowhere earlier', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — declared ${JSON.stringify(decl)}; stages/M30 ${JSON.stringify(e)}; the facts read ${doc.states.length} states` });
  }
  // D2 — O2, H31's goal over its own domain
  {
    const where = at((x) => x.c31), f = fact(doc, 'price:h:challenge:31'), probs = [];
    if (!f) probs.push('no fact');
    const covered = [];
    for (const { v, states: ss } of valuesOf(doc, f)) {
      covered.push(...ss);
      const sh = v.shapes && v.shapes['player.h.challenges.31'];
      if (!sh || sh.type !== 'superexponential' || !near(sh.exponent, H31.exponent, 1e-6) || !near(sh.log10Scale, H31.log10Scale, 1e-6) || !near(lg10(sh.at0), H31.at0, 1e-9)) probs.push(`shape ${JSON.stringify(sh)} at ${ss[0]}`);
      for (const s of ss) if (!sh || !sh.domain || sh.domain.max !== R[s].lim31) probs.push(`domain ${JSON.stringify(sh && sh.domain)} at ${s} (completionLimit ${R[s].lim31})`);
    }
    for (const s of where) if (!covered.includes(s)) probs.push(`no reading at ${s}`);
    row({ gate: 'D2 (O2) H31\'s goal = the source over 0 … completionLimit: superexponential 2.5 · 50 · 1e5325', id: 'ptr', ok: where.length > 0 && !probs.length,
      notes: probs.length ? probs.join('; ') : `${JSON.stringify(f.shapes || (f.variants && f.variants.map((x) => x.shapes)))} at ${where.join(',')}` });
  }
  // D3 — O7, H31's purchase budget
  {
    const where = at((x) => x.c31), fs3 = doc.facts.filter((f) => f.kind === 'purchase-budget' && /^purchase-budget:h:31:/.test(f.id));
    const f = fs3[0];
    const checks = { one: fs3.length === 1, counter: !!f && f.counter === BUDGET.counter, limit: !!f && f.limit === BUDGET.limit,
      items: !!f && JSON.stringify((f.items || []).map((x) => x.join('/')).sort()) === JSON.stringify(BUDGET.items),
      everyState: !!f && where.length > 0 && where.every((s) => valuesOf(doc, f).some(({ states: ss }) => ss.includes(s))), inside: !!f && f.inside && f.inside.layer === 'h' && String(f.inside.challenge) === '31' };
    row({ gate: 'D3 (O7) H31\'s purchase budget = the source: player.h.chall31bought, limit 10, Extra Time Capsules and Enhancers', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${JSON.stringify(fs3.map((x) => [x.id, x.limit, x.items]))}; H31 unlocked at ${where.join(',')}` });
  }
  // D4 — itemUnlocked reads `unlocked()` as the engine does: undefined is LOCKED
  {
    const hidden = at((x) => x.h && x.c32 === false), claims = [];
    for (const f of doc.facts.filter((x) => /^(price:h:challenge:32|challenge-inputs:h:32|exits-challenge:h:32(:|$)|purchase-budget:h:32:)/.test(x.id)))
      for (const { states: ss } of valuesOf(doc, f)) for (const s of ss) if (hidden.includes(s)) claims.push(`${f.id}@${s}`);
    const coeClaims = [];
    if (coe) for (const f of coe.facts.filter((x) => x.kind === 'price' && x.item)) {
      const g = f.item.upgrade !== undefined ? 'upgrades' : f.item.buyable !== undefined ? 'buyables' : 'challenges', id = f.item.upgrade ?? f.item.buyable ?? f.item.challenge;
      for (const { states: ss } of valuesOf(coe, f)) for (const s of ss) if (RC[s] && RC[s][`${f.item.layer}:${g}:${id}`] === false) coeClaims.push(`${f.id}@${s}`);
    }
    const coeLocked = coe ? coe.states.reduce((n, s) => n + Object.values(RC[s] || {}).filter((v) => v === false).length, 0) : 0;
    row({ gate: 'D4 itemUnlocked = the engine: no fact claims an item whose unlocked() is falsy (ptr H32; collection-of-everything\'s `if (cond) return true` items)', id: 'ptr+coe',
      ok: hidden.length > 0 && !claims.length && !!coe && coeLocked > 0 && !coeClaims.length,
      notes: `ptr: H32 hidden in ${hidden.length} state(s) (${hidden[0]}…${hidden[hidden.length - 1]}), ${claims.length} claim(s) ${claims.slice(0, 6).join(', ')}; collection-of-everything: ${coeLocked} item(s) locked by the engine's reading, ${coeClaims.length} claim(s) ${coeClaims.slice(0, 6).join(', ')}` });
  }
  // D5 — q34's price, the newly reachable time-priced purchase
  {
    const f = fact(doc, 'price:q:upgrade:34'), where = at((x) => x.q34), probs = [];
    for (const { v, states: ss } of valuesOf(doc, f)) {
      const sh = v.shapes && v.shapes['player.q.time'];
      if (v.currency !== 'player.q.energy' || !sh || sh.type !== 'power' || !near(sh.exponent, Q34.exponent, 1e-6) || sh.offset !== 1 || !near(lg10(sh.coef), Math.log10(Q34.coef), 1e-6)) probs.push(`${JSON.stringify(sh)} in ${v.currency} at ${ss[0]}`);
    }
    if (!f) probs.push('no fact');
    row({ gate: 'D5 q34\'s price = the source: 2.5e94·(q.time+1)^15 in quirk energy', id: 'ptr', ok: where.length > 0 && !probs.length, notes: probs.length ? probs.join('; ') : `${JSON.stringify(f.shapes)} at ${where.join(',')}` });
  }
}

// ---- Part verdict ----------------------------------------------------------------------------------------------------
async function partVerdict() {
  const Q = fs.existsSync(path.join(REPO, QUEUE)) ? fixture(QUEUE) : null;
  const STARTS_UNLOCKED = "Object.keys(layers).filter(function (l) { var d = layers[l].startData; try { return typeof d !== 'function' || !!d.call(layers[l]).unlocked; } catch (e) { return true; } })";
  const [m30, rb, s0, coe, pfresh, fx, su] = await pool([
    () => strategize('ptr', ['--from', M30F, '--timeout-s', '3000']),
    () => strategize('ptr', ['--from', REBUILD, '--goal', 'reset:sg', '--auto-table', PRE_TABLE]),
    () => strategize('something', []), () => strategize('collection-of-everything', []), () => strategize('ptr', []),
    () => run('ptr', { 'from-snapshot': M30F, profile: 'all', 'auto-table': PRE_TABLE, ticks: PIN_R.ticks - PIN_M30.ticks, eval: "({sg: String(player.sg.points), sgu: !!player.sg.unlocked, qt: String(player.q.time), ac: player.h.activeChallenge})" }),
    () => run('collection-of-everything', { ticks: 0, eval: STARTS_UNLOCKED }),
  ]);
  // V1 — q34
  {
    const v = byTpl(m30, 'time-priced-purchase').find((x) => x.goal === 'upg:q:34');
    const lev = (v && v.levers) || [];
    const checks = { verdict: !!v && v.verdict === 'waiting-cannot-help', shortfallLarge: !!v && v.rollback && v.rollback.peak && v.rollback.peak.ratioLog10 < -10,
      levers: lev.length >= 2 && lev.some((l) => l.input === 'player.q.buyables.11') && lev.some((l) => l.input === 'player.q.total'),
      subgoal: !!v && !!v.subgoal && v.subgoal.kind === 'value', noQueue: !!v && v.queue === null, neutral: !!v && v.neutral === true };
    row({ gate: 'V1 time-priced-purchase on q34 from stages/M30: WAITING CANNOT HELP, the levers ranked by the facts\' multiplier walk', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v ? `peak 10^${v.rollback.peak.ratioLog10} at q.time ${v.rollback.peak.field}; levers ${lev.map((l) => `${l.input} ${l.distanceLog10 === null || l.distanceLog10 === undefined ? '—' : '10^' + l.distanceLog10}${l.zeroedAtPeak ? ' (zeroed at the peak)' : ''}`).join(' · ')}; sub-goal ${JSON.stringify(v.subgoal)}` : m30.error}` });
  }
  // V2 — H31
  {
    const v = byTpl(m30, 'challenge-attempt').find((x) => x.goal === 'ch:h:31');
    const lev = (v && v.levers) || [];
    const reachable = lev.filter((l) => l.distanceLog10 !== null && l.distanceLog10 !== undefined && !l.spentByEntry && !l.zeroedAtPeak);
    const checks = { verdict: !!v && v.verdict === 'short', farShort: !!v && v.short && v.short.log10 > 1000, nearestFar: reachable.length > 0 && reachable[0].distanceLog10 > 100,
      tableGivesUp: !!v && (v.reasoning || []).some((x) => /would concede this attempt/.test(x)), noQueue: !!v && v.queue === null, neutral: !!v && v.neutral === true };
    row({ gate: 'V2 challenge-attempt on H31 "Timeless" from stages/M30: SHORT by 10^1158 of points, its nearest lever out of reach; the table\'s give-up named', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v ? `short ${JSON.stringify(v.short)}; nearest ${reachable[0] ? reachable[0].input + ' 10^' + reachable[0].distanceLog10 : '—'}; ${(v.reasoning || []).filter((x) => /concede/.test(x)).join(' ')}` : m30.error}` });
  }
  // V3 — sg at stages/M30: not open, it holds its one Super Generator
  {
    const v = byTpl(m30, 'reset-requirement').find((x) => x.goal === 'reset:sg');
    const checks = { notOpen: !!v && v.verdict === 'not-open', why: !!v && /holds its currency/.test((v.reasoning || [])[0] || '') && v.binding && v.binding.rebuild === true,
      ownZeroers: !!v && JSON.stringify((v.binding.facts.ownZeroedBy || []).map((z) => z.split(':')[1]).sort()) === JSON.stringify([...OWN_ZEROERS].sort()) };
    row({ gate: 'V3 reset-requirement on sg AT stages/M30: not open — it holds its one Super Generator; the facts name the resets that zero it (h, o, q, ss)', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v ? `${v.verdict}: ${(v.reasoning || [])[0]}; own zeroers ${JSON.stringify(v.binding.facts.ownZeroedBy)}` : m30.error}` });
  }
  // V4 — the REBUILD from m31/R95400
  {
    const v = byTpl(rb, 'reset-requirement').find((x) => x.goal === 'reset:sg'), at = v && v.confirm && v.confirm.at;
    const c = fixture(REBUILD);
    const checks = {
      fixture: c.ticks === PIN_R.ticks && c.hashGame === PIN_R.hashGame && !!fx && fx.ticks === PIN_R.ticks && fx.hashGame === PIN_R.hashGame && c.config['auto-table'] === PRE_TABLE && c.config.from === M30F,
      theState: !!fx && fx.eval && fx.eval.sg === '0' && fx.eval.sgu === true && fx.eval.ac === null,
      rebuild: !!v && v.binding && v.binding.rebuild === true && v.binding.open === true,
      verdict: !!v && v.verdict === 'reset-at', confirmed: !!at && v.confirm.reset === true && v.confirm.state === 'done' && v.confirm.holds.length === 0 && at.tick === PIN_REBUILD_TICK,
      requirementIsTheSource: !!v && num(v.tStar.requirement) === SG_REQ && num(v.tStar.base) >= SG_REQ,
      holdCoversEveryZeroer: !!v && ZEROERS.every((z) => v.binding.hold.includes(`reset:${z}`)) && v.binding.hold.includes('challenges:h') && v.binding.hold.includes('reset:sg'),
      theReflexMakesIt: !!v && !!v.afterReach && v.afterReach.reset === true,
      queueIsTheCommittedOne: !!v && !!v.queue && !!Q && JSON.stringify(v.queue) === JSON.stringify(Q), neutral: !!v && v.neutral === true };
    row({ gate: 'V4 the REBUILD (reset-requirement extended to a layer\'s own currency): from m31/R95400 — Super Generators zeroed by a row-3 reset — RESET-AT, confirmed; held, reset:sg makes it itself', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${v ? `t* ${JSON.stringify(v.tStar)}; confirmed ${JSON.stringify(at)}; after the reach ${JSON.stringify(v.afterReach)}; ${(v.reasoning || [])[0]}` : rb.error}; fixture ${fx && fx.ticks} / ${fx && fx.hashGame} ${JSON.stringify(fx && fx.eval)}` });
  }
  // V5 — the extension's reach
  {
    const c = (r) => r && r.counts && r.counts['reset-requirement'];
    const legs = [['something fresh', s0], ['collection-of-everything fresh', coe], ['ptr fresh', pfresh]];
    const pv = byTpl(pfresh, 'reset-requirement');
    // the witness: collection-of-everything's layers that START unlocked (its startData, read by a separate boot) and whose
    // own points another reset zeroes (met11) — unlocked with nothing held, never a rebuild
    const startsUnl = (su && su.ok && Array.isArray(su.eval)) ? su.eval : [];
    const witness = byTpl(coe, 'reset-requirement').filter((x) => x.binding && startsUnl.includes(x.binding.layer) && (x.binding.facts.ownZeroedBy || []).length > 0);
    const checks = { noThrow: legs.every(([, r]) => r && !r.error && r.exit === 0 && r.results.every((x) => x.verdict !== 'threw')),
      ptrFreshNoneOpen: !!c(pfresh) && c(pfresh).open === 0, startsUnlockedIsNoRebuild: pv.every((x) => !x.binding || !x.binding.rebuild) && witness.length > 0 && witness.every((x) => x.binding.rebuild === false) };
    row({ gate: 'V5 the extension\'s reach: a layer that STARTS unlocked is never a rebuild (ptr fresh: none open); something and collection-of-everything run with no throw', id: 'something+coe+ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ` + legs.map(([n, r]) => (c(r) ? `${n}: ${c(r).matches} match(es), ${c(r).open} open, verdicts ${JSON.stringify(c(r).verdicts)}` : `${n}: ${r && r.error}`)).join(' | ') + ` — coe's layers that start unlocked with their points zeroed by another reset: ${witness.map((x) => x.binding.layer + (x.binding.rebuild ? ' REBUILD' : '')).join(', ')}` });
  }
}

// ---- Part stage ------------------------------------------------------------------------------------------------------
async function partStage() {
  const t = fixture(TABLE), S = (t.stages || []).find((s) => s.id === STAGE), Q = fs.existsSync(path.join(REPO, QUEUE)) ? fixture(QUEUE) : null;
  // S1 — the stage is the template's answer as data
  {
    const hold = Q ? Q.steps[0].features.filter((f) => f !== 'reset:sg').sort() : [];
    const keys = S ? Object.keys(S.gates || {}).sort() : [];
    const preds = S ? [S.when, ...Object.values(S.gates || {})] : [];
    const literal = preds.filter((p) => new RegExp(`(^|[^\\w.])${SG_REQ}(?![\\w.])`).test(p) || /\d+e\d+/.test(p));
    const ownZ = OWN_ZEROERS.filter((z) => z !== 'q').map((z) => `reset:${z}`).concat(['challenges:h']);
    const base = 'player.sg.points.gt(0) || player.g.points.gte(tmp.sg.nextAt)', own = 'player.sg.points.eq(0) && player.g.points.gte(tmp.sg.nextAt)';
    const checks = { present: !!S, gatesAreTheHold: !!S && !!Q && JSON.stringify(keys) === JSON.stringify(hold), everyGateReadsTheRequirement: !!S && Object.values(S.gates).every((g) => /tmp\.sg\.nextAt/.test(g)),
      theCurrencysZeroersOnlyWhenEmpty: !!S && ownZ.every((f) => S.gates[f] === own) && keys.filter((k) => !ownZ.includes(k)).every((f) => S.gates[f] === base),
      noRequirementLiteral: !!S && literal.length === 0, whenIsState: !!S && /player\.sg\.unlocked/.test(S.when) && /hasUpgrade\('q',\s*33\)/.test(S.when) && /!player\.h\.activeChallenge/.test(S.when),
      cashIn: !!S && S.policies && S.policies['reset:q'] === 'gain>=2x', listedFirst: (t.stages || [])[0] && t.stages[0].id === STAGE,
      provenance: !!S && Array.isArray(S.provenance) && S.provenance.length > 0 && S.provenance.every((p) => p.gate && p.commit && p.note),
      // no other entry moved: the shipped table minus this stage is the table before this slice, byte for byte
      onlyThisStageAdded: (() => { const u = fixture(TABLE); u.stages = (u.stages || []).filter((x) => x.id !== STAGE); return JSON.stringify(u, null, 2) + '\n' === fs.readFileSync(path.join(REPO, PRE_TABLE), 'utf8'); })() };
    row({ gate: `S1 ${STAGE} is the template's answer as DATA: its gates = V4's hold minus the reset it makes, each reads the engine's requirement, none its number; q cashes in by gain>=2x; its when is state`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — when ${S && S.when}; policies ${JSON.stringify(S && S.policies)}; gates ${JSON.stringify(S && S.gates)}; the template's hold ${JSON.stringify(hold)}; literal hits ${JSON.stringify(literal)}` });
  }
  // S2 — the switch, from the rebuild state under the shipped table
  {
    const log = path.join(TMP, 's2.jsonl');
    const x = await run('ptr', { 'from-snapshot': REBUILD, profile: 'all', ticks: PIN_REBUILD_TICK - PIN_R.ticks + 5, until: 'player.sg.points.gt(0)', log, eval: "({sg: String(player.sg.points), g: String(player.g.points)})" });
    const recs = logRecords(log), Z = zeroingsFromLog(recs);
    const st = recs.filter((r) => r.type === 'stage' && r.stage === STAGE).map((r) => [r.on, r.tick]);
    const checks = { ran: !!x.ok && x.eval && num(x.eval.sg) >= 1, on: st.length > 0 && st[0][0] === true && (st.length === 1 || st[1][1] >= x.ticks), noZeroing: Z.zeroings === 0,
      byTheTable: Z.sg.length >= 1 && Z.sg[0].by === 'reset:sg' && Z.sg[0].did === true, onTheTemplatesTick: x.ticks === PIN_REBUILD_TICK };
    row({ gate: `S2 from m31/R95400 under the SHIPPED table: ${STAGE} is in force, no zeroing reset fires, and reset:sg rebuilds Super Generators on the template's tick`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — stage ${JSON.stringify(st)}; ${x.ticks} / ${x.hashGame} ${JSON.stringify(x.eval)}; zeroings ${JSON.stringify(Z)} ${x.error || ''}` });
  }
  // S3 — the named wall, rebuilt
  {
    const dW = path.join(TMP, 'fw');
    const w = await run('ptr', { 'from-snapshot': M30F, profile: 'all', ticks: PIN_WALL.ticks - PIN_M30.ticks, 'stop-snapshot': dW, 'stop-snapshot-name': 'W124521',
      eval: "({total: String(player.q.total), qms: player.q.milestones.length, ql: String(player.q.buyables[11].plus(tmp.q.freeLayers)), m31: hasMilestone('q',7) && !!player.s.autoBld})" });
    const c = fixture(WALL), built = fs.existsSync(path.join(dW, 'W124521.json')) ? JSON.parse(fs.readFileSync(path.join(dW, 'W124521.json'), 'utf8')) : null;
    const checks = { ran: !!w.ok, pin: w.ticks === PIN_WALL.ticks && w.hashGame === PIN_WALL.hashGame, committed: c.ticks === PIN_WALL.ticks && c.hashGame === PIN_WALL.hashGame,
      rebuilt: !!built && built.hashGame === c.hashGame, notM31: !!w.eval && w.eval.m31 === false && w.eval.total === PIN_WALL.total && w.eval.qms === 7,
      configNamed: c.config.from === M30F && c.config['auto-opt'] === null && !c.config['auto-table'] };
    row({ gate: 'S3 the named WALL m31/W124521 = stages/M30 + 30,000 game-s under the shipped table: 5.104e25 total quirks, M31 not reached', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${w.ticks} / ${w.hashGame} (pin ${PIN_WALL.ticks} / ${PIN_WALL.hashGame}); ${JSON.stringify(w.eval)} ${w.error || ''}` });
  }
}

// S3 is in partStage (below S2): the wall state, rebuilt
// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const planner = fs.readFileSync(path.join(REPO, 'loader/tmt-planner.js'), 'utf8');
  const srcs = [['loader/tmt-templates.js', fs.readFileSync(path.join(REPO, 'loader/tmt-templates.js'), 'utf8')], ['loader/tmt-planner.js (facts-1 section)', planner.slice(planner.indexOf('// ==== facts-1'))], ['tools/harness/strategize.mjs', fs.readFileSync(path.join(REPO, 'tools/harness/strategize.mjs'), 'utf8')]];
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the generic code this slice changed (templates, the facts probes, strategize; the stage is data)', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

// ---- Part levers (measurement) -----------------------------------------------------------------------------------------
// M31's value goal: total quirks ≥ 1e60. Its producer is the q reset's gain, which no template prices (no production
// fact; the planner's chain finds no producer in its 30-s wait). tools/harness/m31-levers.js walks the facts'
// multiplier-reads from q's own gain getters and measures each input on the copy over a held window.
const HOLD = ['reset:h', 'challenges:h', 'reset:q', 'reset:o', 'reset:ss'];
const LEVER_STATES = { 'stages/M30': M30F, 'm31/R95400': REBUILD };
async function partLevers() {
  const facts = fs.readFileSync(path.join(FACTS_DIR, 'ptr.json'), 'utf8');
  const script = fs.readFileSync(path.join(REPO, 'tools/harness/m31-levers.js'), 'utf8');
  const res = await pool(Object.entries(LEVER_STATES).map(([name, from]) => async () => {
    const f = path.join(TMP, `levers-${name.replace(/\W/g, '_')}.js`);
    fs.writeFileSync(f, `var M31_OPTS = { layer: 'q', target: '${TARGET}', k: 300, hold: ${JSON.stringify(HOLD)}, facts: ${facts} };\n` + script);
    return [name, await run('ptr', { 'from-snapshot': from, profile: 'all', ticks: 0, planner: true, 'queue-runner': true, 'planner-script': f })];
  }));
  for (const [name, r] of res) {
    const p = r && r.plannerScript;
    const ok = !!p && !p.error && Array.isArray(p.levers) && p.levers.some((l) => l.distanceLog10 > 0);
    row({ gate: `L1 M31's value goal (total quirks ≥ ${TARGET}) from ${name}: the levers of the q reset's gain, walked from the facts and measured over a 300-tick hold`, id: 'ptr', ok,
      notes: ok ? `gain after the hold ${p.base.gain} (10^${p.needLog10} short of ${TARGET}); ${p.candidates} inputs walked (${p.walked.length} getters); ranked: ` + p.levers.filter((l) => l.distanceLog10 !== undefined).slice(0, 10).map((l) => `${l.input} [${l.step} → gain 10^${l.gainMovesLog10}] ${l.distanceLog10 === null ? `${l.firstOrder.units} units` : `10^${l.distanceLog10} of it`}`).join(' · ') : JSON.stringify(p || r.error).slice(0, 600) });
  }
}

// ---- Part leg (measurement, one per CI job) ----------------------------------------------------------------------------
// A@…: the acceptance, stages/M30 under the SHIPPED TABLE ALONE toward M31 (and on to M33). ctl@1: the table without
// this slice's stage (PRE_TABLE). last@1: the stage moved to the end of the list.
const LEGS = {
  'A@1': { diff: 1, from: M30F, table: 'shipped', to: 'M33', ticks: 30000 },          // 30,000 game-s
  'A@0.05': { diff: 0.05, from: M30F, table: 'shipped', to: 'M33', ticks: 120000 },    // 6,000 game-s
  'ctl@1': { diff: 1, from: M30F, table: 'before', to: 'M33', ticks: 30000 },
  'ctl@0.05': { diff: 0.05, from: M30F, table: 'before', to: 'M33', ticks: 120000 },
  'last@1': { diff: 1, from: M30F, table: 'last', to: 'M33', ticks: 30000 },
};
const LEG_EV = "({total: String(player.q.total), qms: player.q.milestones.slice(), autoBld: !!player.s.autoBld, ql: Number(player.q.buyables[11].plus(tmp.q.freeLayers)), sg: String(player.sg.points), q34: hasUpgrade('q',34), h31: Number(player.h.challenges[31] || 0), ac: player.h.activeChallenge, g: String(player.g.points)})";
const writeTmp = (name, obj) => { const f = path.join(TMP, name); fs.writeFileSync(f, JSON.stringify(obj, null, 1)); return f; };
function stageLastTable() { const t = fixture(TABLE); const i = t.stages.findIndex((s) => s.id === STAGE); const [s] = t.stages.splice(i, 1); t.stages.push(s); return t; }
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  const key = a.leg.replace(/[^\w.-]/g, '_');
  const out = path.join(REPO, 'tools/harness/results/tmp', `m31-leg-${key}`);
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const tableFile = L.table === 'last' ? writeTmp('ptr-stage-last.json', stageLastTable()) : L.table === 'before' ? PRE_TABLE : null;
  const from = fixture(L.from);
  const legs = await Promise.all([0, 1].map(async (k) => {
    const sd = path.join(out, `run${k + 1}`);
    const r = await run('ptr', { 'from-snapshot': L.from, profile: 'all', diff: L.diff, ticks: L.ticks, ladder: LADDER, to: L.to, 'until-all': true, 'marks-continue': true,
      'auto-table': tableFile, snapshots: sd, 'stop-snapshot': sd, 'stop-snapshot-name': 'END', eval: LEG_EV, 'wall-ms': 5.3 * 3600e3 });
    const reached = Object.fromEntries(((r.ladder && r.ladder.reached) || []).map((m) => [m.id, { ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame }]));
    return { ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, reached, stoppedAt: r.ladder && r.ladder.stoppedAt, eval: r.eval, wallMs: r.wallMs, error: r.error };
  }));
  const [x, y] = legs;
  const eq = x.ticks === y.ticks && x.hashGame === y.hashGame && JSON.stringify(x.reached) === JSON.stringify(y.reached);
  const since = (m) => (x.reached[m] ? Math.round((x.reached[m].gameSeconds - from.gameSeconds) * 1000) / 1000 : null);
  const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, m31: since('M31'), m32: since('M32'), m33: since('M33'), endTotal: x.eval && x.eval.total, legs };
  row({ gate: `M-leg ${a.leg} — ${L.table === 'last' ? 'the shipped table with ' + STAGE + ' LAST' : L.table === 'before' ? 'the table before this slice' : 'the shipped table'} from stages/M30 at diff ${L.diff}, twice equal`, id: 'ptr', ok: eq && !!x.ok,
    notes: `M31 ${outj.m31 === null ? 'NOT reached' : `+${outj.m31} game-s`}; reached ${JSON.stringify(x.reached)}; stop ${x.ticks} / ${x.hashGame} (+${Math.round((x.gameSeconds - from.gameSeconds) * 1000) / 1000} game-s) ${JSON.stringify(x.stoppedAt)}; end ${JSON.stringify(x.eval)}; twice equal ${eq}; wall ${legs.map((l) => Math.round((l.wallMs || 0) / 1000)).join(' / ')} s ${x.error || ''}` });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `m31-leg-${key}.json`), JSON.stringify(outj, null, 1) + '\n');
}
const MERGED = a.only ? [String(a.only)] : Object.keys(LEGS);
if (a.only && !LEGS[a.only]) { console.error(`REFUSED: --only ${a.only} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
function partMerge() {
  const dir = path.resolve(a.dir || path.join(REPO, 'tools/harness/results/tmp'));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => /m31-leg-[^/]*\.json$/.test(f)) : [];
  const got = {};
  for (const f of files) got[path.basename(f)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const J = (k) => got[`m31-leg-${k.replace(/[^\w.-]/g, '_')}.json`];
  for (const k of MERGED) {
    const j = J(k), x = j && j.legs[0];
    row({ gate: `m31-${k} M-merge`, id: 'ptr', leg: j ? `${j.table} from stages/M30` : null, ticks: x ? x.ticks : null, gameSeconds: x ? x.gameSeconds : null, diff: j ? j.diff : null, hash: x ? x.hashGame : null,
      ok: !!j && j.twiceEqual,
      notes: j ? `M31 ${j.m31 === null ? 'NOT reached' : '+' + j.m31} game-s (diff ${j.diff}); end total quirks ${j.endTotal}; ${JSON.stringify(x.eval)}; commit ${j.commit}; twice equal ${j.twiceEqual}` : 'MISSING — the leg did not run or its artifact was not found' });
  }
  if (!a.only) {
    const A = J('A@1'), C = J('ctl@1'), Lt = J('last@1'), A5 = J('A@0.05'), C5 = J('ctl@0.05');
    const tot = (j) => (j ? lg10(j.endTotal) : NaN);
    row({ gate: `m31-stage ${STAGE} (shipped) ends each stretch with MORE total quirks than the table before this slice, at diff 1 and 0.05; FIRST no worse than LAST`, id: 'ptr',
      ok: !!A && !!C && !!A5 && !!C5 && !!Lt && tot(A) > tot(C) && tot(A5) > tot(C5) && tot(A) >= tot(Lt),
      notes: A && C && A5 && C5 && Lt ? `diff 1: shipped 10^${tot(A).toFixed(3)} vs before 10^${tot(C).toFixed(3)}; diff 0.05: 10^${tot(A5).toFixed(3)} vs 10^${tot(C5).toFixed(3)}; last 10^${tot(Lt).toFixed(3)}` : 'MISSING a leg' });
  }
}

const EXPECT = { facts: 5, verdict: 5, stage: 3, grep: 1, levers: Object.keys(LEVER_STATES).length, leg: 1, merge: MERGED.length + (a.only ? 0 : 1) };
const FN = { facts: partFacts, verdict: partVerdict, stage: partStage, grep: partGrep, levers: partLevers, leg: partLeg, merge: partMerge };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT m31 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (PART === 'merge' && a.summary) appendSection({ title: `Gate m31 merge — toward M31 (\`node tools/harness/gates-m31.mjs --part merge --summary\`)`, commit, dirty, rows,
  reading: 'each leg ran TWICE (equal or RED); gameSeconds is the game clock at the stop; the merged legs\' own commit is in each row\'s notes.' });
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-m31-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
