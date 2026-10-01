// The yield gates — the YIELD RULE (slice tmt-yield-1): a reset yields to the game's own auto-reset (`tmp[l].autoPrestige`)
// only where the ENGINE performs it, i.e. in the layer's own `automate` slot, which every roster engine calls right after
// its `if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer)`. In the `au` layer's FALLBACK pass the engine
// skipped the layer this tick (ptr's `if (!unl(layer)) continue`), so a yield there waits for a reset that never comes.
// The lever is `--auto-opt nativeYield=slot|always` (`always` = the rule before this slice).
//   node tools/harness/gates-yield.mjs --part defect|fix|control|grep|push [--pool N] [--no-write] [--assert]
//   node tools/harness/gates-yield.mjs --part roster [--ticks N] [--deep-ticks N] [--pool N] [--assert]
//   node tools/harness/gates-yield.mjs --part leg --leg <key> [--assert]     (the measurements: the stage-needed table, the run-on)
//
// GATES (`push`, on every push in sweep.yml's `yield` job):
// Part defect   D1 from the wall m30/W226931 under the shipped table with the fix OFF (`nativeYield=always`): reset:sg
//               is decided in the FALLBACK only, yields there while the engine allows the reset, and sg never resets in
//               3,000 ticks — the run is the pre-slice loader's to the hash. D2 the same with `stages=off`; the last reason
//               is `yielding:native` and it says it was decided in the fallback.
// Part fix      Y1 the same leg with the fix ON (`nativeYield=slot`): reset:sg resets on the pinned tick, decided in the
//               fallback (the log's `at`), and the log replays EQUAL. Y2 the same with `stages=off`.
// Part control  C1 VACUITY — both passes exercised: in Y1's leg reset:b / reset:g are decided in their SLOT with the
//               auto-reset set (and yield), reset:sg in the fallback. C2 the SLOT is untouched: from all/M22 (b, g, … reset
//               by the game every tick) the two rules give one hash, with slot decisions counted and no fallback one ready.
//               C3 a VANILLA engine (no `unl` skip) with auto-prestige set: the two rules give one hash. C4 the stub units.
// Part grep     X1 no game id and no ptr layer id in loader/tmt-auto.js (the rule is derived; no family data).
// Part roster   R1 every hosted game, fresh, profile all, `--ticks` (diff 1) under both rules, plus every committed
//               all/ snapshot for `--deep-ticks`: a hash differs ONLY where a reset was decided in the fallback with the
//               auto-reset set and the engine allowing it. R2 every leg ran (a refusal names the game).
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly, GAMES } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-write', 'assert', 'leg', 'ticks', 'deep-ticks', 'only']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const GATE_PARTS = ['defect', 'fix', 'control', 'grep'];
const PART = String(a.part || 'push');
const ALL_PARTS = [...GATE_PARTS, 'push', 'roster', 'leg'];
if (!ALL_PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${ALL_PARTS.join(' | ')}`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-yield-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1800)}`); };

// ⚠ This file is the ORACLE, and ptr's ids are its data (the loader may not name them — part grep).
const WALL = 'tools/harness/snapshots/ptr/m30/W226931.json';
const M22 = 'tools/harness/snapshots/ptr/all/M22.json';
const M28F = 'tools/harness/snapshots/ptr/stages/M28.json', M30F = 'tools/harness/snapshots/ptr/stages/M30.json';
const TABLE = 'games-auto/ptr.json', LADDER = 'tools/harness/ladder/ptr.json';
const STAGE = 'q33-sg-unlock';
const LEG_TICKS = 3000;
// From the wall, 3,000 ticks, `until: player.sg.unlocked`, diff 1. The OFF pins equal main fd59423 (the loader before
// this slice) to the hash — measured on both, which is what makes `always` the old rule and not a new one.
const PIN_OFF = { on: { ticks: 229931, hashGame: '8eacbeaa755e05ff', ready: 1917 }, off: { ticks: 229931, hashGame: 'fa73bf7da212106f', ready: 1270 } };
const PIN_ON = { on: { ticks: 226986, hashGame: 'c92febbf3ac0abac' }, off: { ticks: 227045, hashGame: '16ade9bd7da9511e' } };
const C2_TICKS = 500;
// C3: a vanilla 2.2.1 / 2.7 engine (no `unl` skip) where a reset feature's auto-prestige is set inside a bounded run —
// found by part roster (the only vanilla legs whose `slot` count is non-zero; the-modding-tree's own demo is one).
const VANILLA = { id: 'something', from: 'tools/harness/snapshots/something/all/S05.json', ticks: 2000 };

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
    if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
  }
  const t0 = Date.now();
  const r = await child(args);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { wallMs: Date.now() - t0 }); } catch { return { ok: false, error: 'no result: ' + r.out.slice(-400), wallMs: Date.now() - t0 }; }
}
async function replay(log) {
  const f = path.join(TMP, `replay-${++seq}.json`);
  await child([path.join(REPO, 'tools/harness/replay.mjs'), log, '--json', f]);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')).line; } catch { return { equal: false, error: 'no result' }; }
}
async function pool(fns) {
  const out = new Array(fns.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, fns.length) }, async () => { while (i < fns.length) { const k = i++; out[k] = await fns[k](); } }));
  return out;
}
const logRecords = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');
const opt = (ny, stages) => [`nativeYield=${ny}`, stages === 'off' ? 'stages=off' : null].filter(Boolean).join(';');
// The readout the legs evaluate: reset:sg's last reason, every reset's counts (tmtLoader.nativeYieldCounts), sg's slot calls.
const EV = "(function(){ var r = tmtLoader.explain().filter(function(x){ return x.id === 'reset:sg'; })[0]; var h = tmtLoader.hookStats(); return { sg: !!player.sg.unlocked, sgp: String(player.sg.points), ap: !!tmp.sg.autoPrestige, ms6: hasMilestone('q', 6), last: r && r.last ? { code: r.last.code, values: r.last.values, text: r.last.text } : null, counts: tmtLoader.nativeYieldCounts, sgSlot: h.viaSlot.sg || 0 }; })()";
const sgResets = (recs) => recs.filter((r) => r.type === 'action' && r.call === 'doReset' && String((r.args || [])[0]) === 'sg');
const wallLeg = (ny, stages, log) => run('ptr', { 'from-snapshot': WALL, profile: 'all', 'auto-opt': opt(ny, stages), ticks: LEG_TICKS, until: 'player.sg.unlocked', log, eval: EV });

// ---- Part defect -----------------------------------------------------------------------------------------------------
async function partDefect() {
  const logs = { on: path.join(TMP, 'd-on.jsonl'), off: path.join(TMP, 'd-off.jsonl') };
  const [on, off] = await pool([() => wallLeg('always', 'on', logs.on), () => wallLeg('always', 'off', logs.off)]);
  for (const [k, x, gate] of [['on', on, `D1 the DEFECT, fix OFF (nativeYield=always), from the wall with ${STAGE} in force: reset:sg is decided only in the FALLBACK, yields there while the engine allows the reset, and sg never resets in ${LEG_TICKS} ticks`],
    ['off', off, 'D2 the same with stages=off: the last reason is yielding:native, decided in the fallback']]) {
    const c = x.eval && x.eval.counts && x.eval.counts['reset:sg'], P = PIN_OFF[k];
    const checks = { ran: !!x.ok, theOldLoaderToTheHash: x.ticks === P.ticks && x.hashGame === P.hashGame, neverReset: !!x.eval && x.eval.sg === false && sgResets(logRecords(logs[k])).length === 0,
      autoPrestigeSet: !!x.eval && x.eval.ap === true && x.eval.ms6 === true, onlyInTheFallback: !!c && c.slot === 0 && c.fallback === LEG_TICKS && x.eval.sgSlot === 0, yieldedWhileAllowed: !!c && c.fallbackReady === P.ready };
    if (k === 'off') checks.saysWhere = !!x.eval && !!x.eval.last && x.eval.last.code === 'yielding:native' && x.eval.last.values.at === 'fallback' && /decided in: fallback/.test(x.eval.last.text);
    row({ gate, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${x.ticks} / ${x.hashGame} (pin ${P.ticks} / ${P.hashGame} = main fd59423); reset:sg ${JSON.stringify(c)}; last ${JSON.stringify(x.eval && x.eval.last)} ${x.error || ''}` });
  }
}

// ---- Part fix --------------------------------------------------------------------------------------------------------
async function partFix() {
  const logs = { on: path.join(TMP, 'y-on.jsonl'), off: path.join(TMP, 'y-off.jsonl') };
  const [on, off] = await pool([() => wallLeg('slot', 'on', logs.on), () => wallLeg('slot', 'off', logs.off)]);
  const reps = await pool([() => replay(logs.on), () => replay(logs.off)]);
  for (const [k, x, rp, gate] of [['on', on, reps[0], `Y1 the FIX (nativeYield=slot), from the wall with ${STAGE} in force: reset:sg makes the reset on the pinned tick, decided in the fallback; the log replays EQUAL`],
    ['off', off, reps[1], 'Y2 the same with stages=off']]) {
    const S = sgResets(logRecords(logs[k])), P = PIN_ON[k];
    const checks = { ran: !!x.ok, pin: x.ticks === P.ticks && x.hashGame === P.hashGame, unlocked: !!x.eval && x.eval.sg === true,
      byTheTableInTheFallback: S.length === 1 && S[0].by === 'reset:sg' && S[0].source === 'auto' && JSON.stringify(S[0].at) === JSON.stringify(['sg', 'fallback']) && S[0].did === true && S[0].tick === P.ticks - 1 && S[0].why && S[0].why.code === 'acted:reset',
      replayEqual: !!rp && rp.equal === true && rp.unapplied === 0 };
    row({ gate, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${x.ticks} / ${x.hashGame} (pin ${P.ticks} / ${P.hashGame}); sg resets ${JSON.stringify(S.map((r) => ({ tick: r.tick, by: r.by, at: r.at, did: r.did })))}; reset:sg ${JSON.stringify(x.eval && x.eval.counts && x.eval.counts['reset:sg'])}; replay ${rp ? `equal ${rp.equal}, ${rp.compared && rp.compared.action} actions, ${rp.unapplied} unapplied` : '—'} ${x.error || ''}` });
  }
}

// ---- Part control ----------------------------------------------------------------------------------------------------
const EVC = '({counts: tmtLoader.nativeYieldCounts})';
async function partControl() {
  const [y, m22s, m22a, vs, va, unit] = await pool([
    () => wallLeg('slot', 'on', null),
    () => run('ptr', { 'from-snapshot': M22, profile: 'all', 'auto-opt': opt('slot'), ticks: C2_TICKS, eval: EVC }),
    () => run('ptr', { 'from-snapshot': M22, profile: 'all', 'auto-opt': opt('always'), ticks: C2_TICKS, eval: EVC }),
    () => run(VANILLA.id, { 'from-snapshot': VANILLA.from, profile: 'all', 'auto-opt': opt('slot'), ticks: VANILLA.ticks, eval: EVC }),
    () => run(VANILLA.id, { 'from-snapshot': VANILLA.from, profile: 'all', 'auto-opt': opt('always'), ticks: VANILLA.ticks, eval: EVC }),
    () => child(['--test', path.join(REPO, 'loader/yield.test.mjs')]),
  ]);
  {
    const c = (y.eval && y.eval.counts) || {};
    const checks = { ran: !!y.ok, slotYields: ['reset:b', 'reset:g'].every((id) => c[id] && c[id].slot > 0 && c[id].fallback === 0), fallbackDecided: !!c['reset:sg'] && c['reset:sg'].fallback > 0 && c['reset:sg'].slot === 0 && c['reset:sg'].fallbackReady === 1 };
    row({ gate: 'C1 VACUITY: both passes exercised in Y1\'s leg — reset:b / reset:g decided in their SLOT with the auto-reset set, reset:sg in the FALLBACK', id: 'ptr', ok: Object.values(checks).every(Boolean), notes: `${ck(checks)} — ${JSON.stringify(c)}` });
  }
  const sum = (cs, k) => Object.values(cs || {}).reduce((n, v) => n + v[k], 0);
  {
    const cs = m22s.eval && m22s.eval.counts;
    const checks = { ran: !!m22s.ok && !!m22a.ok, oneHash: m22s.hashGame === m22a.hashGame && m22s.ticks === m22a.ticks, slotDecisions: sum(cs, 'slot') > 0, noFallbackReady: sum(cs, 'fallbackReady') === 0 };
    row({ gate: `C2 the SLOT is untouched: from all/M22 (${C2_TICKS} ticks) the two rules give one hash — slot decisions with the auto-reset set, none ready in the fallback`, id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — slot ${m22s.ticks} / ${m22s.hashGame}, always ${m22a.ticks} / ${m22a.hashGame}; counts ${JSON.stringify(cs)}` });
  }
  {
    const cs = vs.eval && vs.eval.counts;
    const checks = { ran: !!vs.ok && !!va.ok, oneHash: vs.hashGame === va.hashGame && vs.ticks === va.ticks, autoPrestigeSeen: sum(cs, 'slot') > 0, neverInTheFallback: sum(cs, 'fallback') === 0 };
    row({ gate: `C3 a VANILLA engine (${VANILLA.id}, no unl skip) with auto-prestige set: the two rules give one hash, every such decision in the slot`, id: VANILLA.id, ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — from ${path.basename(VANILLA.from)} + ${VANILLA.ticks}: slot ${vs.ticks} / ${vs.hashGame}, always ${va.ticks} / ${va.hashGame}; counts ${JSON.stringify(cs)} ${vs.error || ''}` });
  }
  {
    const pass = (/# pass (\d+)/.exec(unit.out) || [])[1], fail = (/# fail (\d+)/.exec(unit.out) || [])[1];
    row({ gate: 'C4 the stub units (loader/yield.test.mjs): slot yields and says so; the fallback acts; always yields there; a vanilla loop is one answer; a bad option fails the load', id: '—', ok: unit.code === 0 && fail === '0' && Number(pass) >= 7, notes: `${pass} passed, ${fail} failed` });
  }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['sb', 'sg', 'ss', 'ba', 'ps', 'en', 'ne', 'hn', 'hs', 'ma', 'ge', 'mc', 'ai', 'sc', 'ab'];   // multi-letter only: a one-letter id is every loop variable
  const src = fs.readFileSync(path.join(REPO, 'loader/tmt-auto.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
  const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
  const hits = [];
  for (const l of lits) { if (ids.includes(l)) hits.push(`game id '${l}'`); if (ptrLayers.includes(l)) hits.push(`ptr layer id '${l}'`); }
  for (const l of ptrLayers) if (new RegExp(`\\b(?:player|tmp|layers)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`).test(code)) hits.push(`layer ${l} addressed as player/tmp/layers.${l}`);
  if (/\bunl\s*\(/.test(code)) hits.push('a call to a game\'s own unl()');
  row({ gate: 'X1 no game id, no ptr layer id and no engine-family test in loader/tmt-auto.js — the yield rule is derived from where the decision runs', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `${lits.length} string literals, ${ids.length} game ids, ${ptrLayers.length} multi-letter ptr layer ids checked` });
}

// ---- Part roster -----------------------------------------------------------------------------------------------------
// Every hosted game, fresh, under both rules; every committed all/ snapshot for a shorter leg. One leg = one game under
// one rule: {ok, hash, counts}. A hash may differ ONLY where a reset was decided in the fallback with the auto-reset set
// and the engine allowing it (`fallbackReady`), because that is the only decision the rule changes.
async function partRoster() {
  const T = Number(a.ticks || 2000), DT = Number(a['deep-ticks'] || 500);
  const only = a.only ? String(a.only).split(',') : null;
  const legs = [];
  for (const id of GAMES()) if (!only || only.includes(id)) legs.push({ id, from: null, ticks: T });
  for (const g of ['ptr', 'something']) {
    if (only && !only.includes(g)) continue;
    const dir = path.join(REPO, 'tools/harness/snapshots', g, 'all');
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) legs.push({ id: g, from: path.relative(REPO, path.join(dir, f)), ticks: DT });
  }
  const t0 = Date.now();
  const res = await pool(legs.flatMap((L) => ['slot', 'always'].map((ny) => async () => {
    const r = await run(L.id, { 'from-snapshot': L.from, profile: 'all', diff: 1, 'auto-opt': opt(ny), ticks: L.ticks, eval: EVC, 'wall-ms': 300e3 });
    return { ...L, ny, ok: !!r.ok, ticks: r.ticks, hashGame: r.hashGame, counts: (r.eval && r.eval.counts) || null, error: r.ok ? null : String(r.error || r.failed_at || 'failed').slice(0, 160) };
  })));
  const out = [];
  for (let i = 0; i < legs.length; i++) {
    const s = res[2 * i], w = res[2 * i + 1];
    const tot = (cs, k) => Object.values(cs || {}).reduce((n, v) => n + v[k], 0);
    out.push({ id: legs[i].id, from: legs[i].from, ok: s.ok && w.ok, error: s.error || w.error, same: s.ok && w.ok && s.hashGame === w.hashGame && s.ticks === w.ticks,
      slot: tot(w.counts, 'slot'), fallback: tot(w.counts, 'fallback'), ready: tot(w.counts, 'fallbackReady'), readySlot: tot(s.counts, 'fallbackReady'),
      features: Object.entries(w.counts || {}).filter(([, v]) => v.fallback > 0).map(([k, v]) => `${k} ${v.fallback}/${v.fallbackReady}`) });
  }
  const ran = out.filter((o) => o.ok), bad = out.filter((o) => !o.ok);
  const fb = ran.filter((o) => o.fallback > 0), moved = ran.filter((o) => !o.same), stray = moved.filter((o) => o.ready === 0);
  const games = (xs) => [...new Set(xs.map((o) => o.id))];
  const fmt = (o) => `${o.id}${o.from ? ' ' + path.basename(o.from, '.json') : ''} [${o.features.join(', ')}]${o.same ? '' : ' MOVED'}`;
  row({ gate: `R1 the roster: under the old rule (always), a reset decided in the FALLBACK with the auto-reset set — and a hash that moves ONLY where the engine also allowed it there`, id: `${games(ran).length} games`, ok: stray.length === 0 && ran.length > 0,
    notes: `${ran.length} legs (${legs.filter((l) => !l.from).length} fresh × ${T} ticks, ${legs.filter((l) => l.from).length} snapshot legs × ${DT}); with the auto-reset set in the slot: ${games(ran.filter((o) => o.slot > 0)).length} game(s) (${games(ran.filter((o) => o.slot > 0)).join(', ')}); in the FALLBACK: ${games(fb).length} game(s) — ${fb.map(fmt).join(' | ') || 'none'}; moved ${moved.length} leg(s) (${moved.map(fmt).join(' | ') || 'none'}); moved with no fallback decision ready: ${stray.map(fmt).join(' | ') || 'none'}; wall ${Math.round((Date.now() - t0) / 1000)} s` });
  row({ gate: 'R2 every roster leg ran under both rules (a game that does not boot is named, not counted)', id: `${out.length} legs`, ok: bad.length === 0,
    notes: bad.length ? bad.map((o) => `${o.id}${o.from ? ' ' + o.from : ''}: ${o.error}`).join('; ') : `${out.length} legs × 2 rules` });
  if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp/gates-yield-roster.json'), JSON.stringify({ commit, dirty, ticks: T, deepTicks: DT, legs: out }, null, 1) + '\n'); }
}

// ---- Part leg (measurement): the stage-needed table and the run-on from M30 -------------------------------------------
// noStage = the shipped table WITHOUT `q33-sg-unlock`; stage = the shipped table. Each leg TWICE (equal or RED).
const LEGS = {
  'noStage@1': { diff: 1, from: M28F, table: 'noStage', ny: 'slot', to: 'M30', ticks: 200000 },
  'noStage@0.05': { diff: 0.05, from: M28F, table: 'noStage', ny: 'slot', to: 'M30', ticks: 400000 },
  'stage@1': { diff: 1, from: M28F, table: 'shipped', ny: 'slot', to: 'M30', ticks: 200000 },
  'stage@0.05': { diff: 0.05, from: M28F, table: 'shipped', ny: 'slot', to: 'M30', ticks: 400000 },
  'runon@1': { diff: 1, from: M30F, table: 'shipped', ny: 'slot', to: 'M33', ticks: 100000 },
  'runon-always@1': { diff: 1, from: M30F, table: 'shipped', ny: 'always', to: 'M33', ticks: 100000 },
};
const LEG_EV = "({sg: !!player.sg.unlocked, sgp: String(player.sg.points), sgBest: String(player.sg.best), g: String(player.g.points), sgNext: String(tmp.sg.nextAt), sgCan: !!tmp.sg.canReset, ap: !!tmp.sg.autoPrestige, qms: player.q.milestones.slice(), q: player.q.upgrades.slice(), h: player.h.upgrades.slice(), hc: JSON.parse(JSON.stringify(player.h.challenges)), ss: !!player.ss.unlocked, o: !!player.o.unlocked, counts: tmtLoader.nativeYieldCounts, acts: tmtLoader.hookStats().actions, stages: tmtLoader.stageHistory()})";
async function partLeg() {
  const L = LEGS[a.leg];
  if (!L) { console.error(`REFUSED: --leg ${a.leg} is not one of ${Object.keys(LEGS).join(' | ')}`); process.exit(2); }
  const out = path.join(REPO, 'tools/harness/results/tmp', `yield-leg-${a.leg.replace(/[^\w.-]/g, '_')}`);
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  let tableFile = null;
  if (L.table === 'noStage') { const t = JSON.parse(fs.readFileSync(path.join(REPO, TABLE), 'utf8')); t.stages = (t.stages || []).filter((s) => s.id !== STAGE); tableFile = path.join(TMP, 'ptr-no-stage.json'); fs.writeFileSync(tableFile, JSON.stringify(t, null, 1)); }
  const from = JSON.parse(fs.readFileSync(path.join(REPO, L.from), 'utf8'));
  const legs = await Promise.all([0, 1].map(async (k) => {
    const sd = path.join(out, `run${k + 1}`);
    const r = await run('ptr', { 'from-snapshot': L.from, profile: 'all', diff: L.diff, ticks: L.ticks, ladder: LADDER, to: L.to, 'until-all': true, 'marks-continue': true, 'auto-opt': opt(L.ny),
      'auto-table': tableFile, 'stop-snapshot': sd, 'stop-snapshot-name': 'END', eval: LEG_EV, 'wall-ms': 5.3 * 3600e3, log: k === 0 ? path.join(out, 'run1.jsonl') : null });
    const reached = Object.fromEntries(((r.ladder && r.ladder.reached) || []).map((m) => [m.id, { ticks: m.ticks, gameSeconds: m.gameSeconds, hashGame: m.hashGame }]));
    return { ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, reached, stoppedAt: r.ladder && r.ladder.stoppedAt, eval: r.eval, wallMs: r.wallMs, error: r.error };
  }));
  const [x, y] = legs;
  const eq = x.ticks === y.ticks && x.hashGame === y.hashGame && JSON.stringify(x.reached) === JSON.stringify(y.reached);
  const since = (m) => (x.reached[m] ? Math.round((x.reached[m].gameSeconds - from.gameSeconds) * 1000) / 1000 : null);
  const S = sgResets(logRecords(path.join(out, 'run1.jsonl')));
  const outj = { key: a.leg, ...L, commit, dirty, twiceEqual: eq, m30: since('M30'), m31: since('M31'), m32: since('M32'), m33: since('M33'),
    sgResets: { n: S.length, by: S.reduce((o, r) => { const k = `${r.source}:${r.by || ''}@${(r.at || [])[1] || ''}`; o[k] = (o[k] || 0) + 1; return o; }, {}), first: S.slice(0, 3).map((r) => ({ tick: r.tick, by: r.by || r.source, at: r.at })), last: S.slice(-2).map((r) => ({ tick: r.tick, by: r.by || r.source, at: r.at })) }, legs };
  row({ gate: `L ${a.leg} — ${L.table === 'noStage' ? 'the shipped table WITHOUT ' + STAGE : 'the shipped table'}, nativeYield=${L.ny}, from ${path.basename(path.dirname(L.from))}/${path.basename(L.from, '.json')} at diff ${L.diff}, twice equal`, id: 'ptr', ok: eq && !!x.ok,
    notes: `reached ${JSON.stringify(x.reached)}; M30 ${outj.m30} M31 ${outj.m31} M32 ${outj.m32} M33 ${outj.m33} game-s since the start; stop ${x.ticks} / ${x.hashGame} ${JSON.stringify(x.stoppedAt)}; sg resets ${JSON.stringify(outj.sgResets)}; end ${JSON.stringify(x.eval)}; twice equal ${eq}; wall ${legs.map((l) => Math.round((l.wallMs || 0) / 1000)).join(' / ')} s ${x.error || ''}` });
  fs.writeFileSync(path.join(REPO, 'tools/harness/results/tmp', `yield-leg-${a.leg.replace(/[^\w.-]/g, '_')}.json`), JSON.stringify(outj, null, 1) + '\n');
}

const EXPECT = { defect: 2, fix: 2, control: 4, grep: 1, roster: 2, leg: 1 };
const FN = { defect: partDefect, fix: partFix, control: partControl, grep: partGrep, roster: partRoster, leg: partLeg };
const RUN = PART === 'push' ? GATE_PARTS : [PART];
let expected = 0;
for (const p of RUN) { expected += EXPECT[p]; await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT yield ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-yield-part-${PART}${a.leg ? '-' + a.leg.replace(/[^\w.-]/g, '_') : ''}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
