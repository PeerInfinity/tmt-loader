#!/usr/bin/env node
// facts-1 — THE FACTS EXTRACTOR (docs/facts.md): the generated facts reproduce what the game source says, every probe
// leaves the live game untouched, the extractor runs on games it was not written for, and the file regenerates exactly.
//
//   node tools/harness/gates-facts1.mjs --part oracle|vacuity|neutral|determinism|grep|all
//                                       [--facts <dir>] [--kinds a,b] [--pool N] [--no-summary] [--no-write] [--assert]
//
// Part oracle       ptr's §7 rows (NewDocs/plans/tmt/ptr-strategy-design-notes.md §7, §12, §14) against the facts file,
//                   each value taken from the NOTES and the GAME SOURCE (cited per row), never from a probe's output.
//                   State readings the rows need (Quirk Layers, enGainMult, which layers are shown, which items are
//                   unlocked) come from a separate boot of each committed state with --eval — an instrument independent
//                   of the extractor. A row whose subject is locked in EVERY committed state ABSTAINS by name (green),
//                   and the lock itself is measured, not asserted. `--facts <dir>` reads another directory (a mutant's).
//                   `--kinds` keeps only the rows of those fact kinds (a mutant regenerates only its own kind).
// Part vacuity      THE RUN'S ROW: the facts of each kind per game; a kind with ZERO facts is RED unless it is declared
//                   below with the reason, and the reason is measured where it can be. No kind threw anywhere.
// Part neutral      The live state's hash after the whole extraction equals a run that extracts nothing, on five legs
//                   (ptr fresh / all/M25 / all/M27, something all/S05, collection-of-everything fresh), and every kind's
//                   excursions report `neutral` and the run `stateNeutral`.
// Part determinism  Two regenerations of every committed game into scratch: byte-identical to each other AND to the
//                   committed file (`facts.mjs --check` is the CI form of the second half).
// Part grep         No game id (any manifest) and no ptr layer id appears as a string literal in the extractor's code:
//                   tools/harness/facts.mjs, tools/harness/facts-read.js, and loader/tmt-planner.js's facts-1 section.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, headCommit, treeDirty, entryOnly, gameDir } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { statesOf, KINDS } from './facts.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'facts', 'kinds', 'pool', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PARTS = ['oracle', 'vacuity', 'neutral', 'determinism', 'grep'];
const PART = String(a.part || 'all');
if (PART !== 'all' && !PARTS.includes(PART)) { console.error(`REFUSED: --part ${PART} is not one of ${PARTS.join(' | ')} | all`); process.exit(2); }
const RUN = PART === 'all' ? PARTS : [PART];
const POOL = Number(a.pool || 6);
const FACTS = path.resolve(REPO, a.facts || 'games-facts');
const ONLY = a.kinds ? String(a.kinds).split(',') : null;
if (ONLY) for (const k of ONLY) if (!KINDS.includes(k)) { console.error(`REFUSED: --kinds ${k} is not one of ${KINDS.join(', ')}`); process.exit(2); }
const GAMES = ['ptr', 'something', 'collection-of-everything'];
const commit = headCommit(), dirty = treeDirty();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-facts1-'));
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 900)}`); };

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
async function boot(id, st, extra) {
  const f = path.join(TMP, `boot-${id}-${st.name.replace(/\W/g, '_')}-${Math.random().toString(36).slice(2)}.json`);
  const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--ticks', '0', '--profile', 'off', '--json', f, '--random-seed', '1', ...extra];
  if (st.file) args.push('--from-snapshot', st.file);
  const r = await child(args);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return { error: 'no result: ' + r.out.slice(-300) }; }
}
const readFacts = (id) => { const f = path.join(FACTS, id + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; };
const fact = (doc, id) => (doc ? doc.facts.find((f) => f.id === id) : null) || null;
// every value a fact carries, one per variant, each with the states it covers (a fact with no variants is one value)
function valuesOf(f, order) {
  if (!f) return [];
  const expand = (seen) => seen.flatMap((s) => (Array.isArray(s) ? order.slice(order.indexOf(s[0]), order.indexOf(s[1]) + 1) : [s]));
  if (!f.variants) return [{ v: f, states: expand(f.from.seen) }];
  return f.variants.map((v) => ({ v, states: expand(v.seen) }));
}
const near = (x, y, tol) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const log10s = (s) => { const m = /^([\d.]+)e(-?\d+)$/.exec(String(s)); return m ? Math.log10(Number(m[1])) + Number(m[2]) : Math.log10(Number(s)); };
const setEq = (x, y) => x.length === y.length && x.every((q) => y.includes(q));
const want = (kind) => !ONLY || ONLY.includes(kind);

// ---- the state readings, from an instrument that is NOT the extractor ------------------------------------------------
// ⚠ These name ptr's ids: this file is the ORACLE, and ids are its data. The extractor's own code may not (part grep).
const READ_PTR = `(function () {
  var row = function (l) { return layers[l] && layers[l].row; };
  var shown = function (l) { var v = layers[l].layerShown; try { return typeof v === 'function' ? v.call(layers[l]) !== false : v !== false; } catch (e) { return false; } };
  var unl = function (d) { if (!d) return null; var v = d.unlocked; try { return typeof v === 'function' ? !!v.call(d) : v !== false; } catch (e) { return false; } };
  var o = { qUnlocked: !!player.q.unlocked, ql: String(player.q.buyables[11]), free: String(tmp.q.freeLayers), M: String(layers.q.enGainMult()),
    resetsRow3: Object.keys(layers).filter(function (l) { return typeof row(l) === 'number' && row(l) >= row('q') && shown(l) && tmp[l] && tmp[l].type !== 'none'; }).sort(),
    h: { unlocked: !!player.h.unlocked, c22: unl(layers.h.challenges[22]), c31: unl(layers.h.challenges[31]), done22: Number(player.h.challenges[22] || 0) },
    qUpg: {} };
  [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33].forEach(function (id) { o.qUpg[id] = !!player.q.unlocked && unl(layers.q.upgrades[id]); });
  return o;
})()`;
const READ_CH = `(function () { var n = 0; for (var l in layers) { var L = layers[l]; if (!L || !L.challenges || !player[l] || !player[l].unlocked) continue; for (var id in L.challenges) { var C = L.challenges[id]; if (!C || typeof C !== 'object') continue; var v = C.unlocked; try { if (typeof v === 'function' ? v.call(C) : v !== false) n++; } catch (e) {} } } return n; })()`;
async function readings(id, expr) {
  const sts = statesOf(id, []);
  const rs = await pool(sts, POOL, (st) => boot(id, st, ['--eval', expr]));
  const o = {};
  sts.forEach((st, i) => { o[st.name] = rs[i].eval; if (rs[i].error || rs[i].eval === undefined) o[st.name] = { error: rs[i].error || 'no eval' }; });
  return { order: sts.map((s) => s.name), at: o };
}

// ---- Part oracle ---------------------------------------------------------------------------------------------------
// The q upgrades' prices (games/ptr/js/layers.js: q11 :3133, q12 :3146, q13 :3159, q14 :3169, q21 :3207, q22 :3220,
// q23 :3233, q24 :3243, q31 :3269, q32 :3282, q33 :3292): `base·(q.time+1)^k` in quirk energy (currencyLayer q,
// currencyInternalName energy), while player.ma.current is not "q" (true in every committed state). Notes §7a.
const Q_PRICES = { 11: [1.2, 1e2], 12: [1.4, 5e2], 13: [1.8, 7.5e2], 14: [2.4, 1e6], 21: [3.2, 1e8], 22: [4.2, 2e11], 23: [5.4, 5e19], 24: [6.8, 1e24], 31: [8.4, 1e48], 32: [10, 1e58], 33: [12, 1e81] };
// enGainMult (layers.js:2964-2970) + hasUpgrade (utils.js:633-635) + unl (utils.js:918-921) + upgradeEffect (:673-675)
// + buyableEffect (:681-683): every input it can read, over every branch. Notes §14: "q11 × q21 × o12 × ba".
const EN_GAIN_MULT = ['player.q.upgrades', 'player.q.unlocked', 'player.ma.selectionActive', 'player.o.unlocked', 'player.ba.unlocked',
  'tmp.ma.canBeMastered', 'tmp.q.row', 'tmp.q.upgrades.11.effect', 'tmp.q.upgrades.21.effect', 'tmp.o.buyables.12.effect', 'tmp.ba.negBuff'];
// q11's effect (layers.js:3139): total quirks, the q-upgrade COUNT, its improvement (utils.js:702-704). q21's (:3213):
// Super Boosters and its improvement. Notes §14.
const Q11_EFFECT = ['player.q.total', 'player.q.upgrades', 'tmp.q.impr.11.effect'];
const Q21_EFFECT = ['player.sb.points', 'tmp.q.impr.21.effect'];

async function partOracle() {
  const doc = readFacts('ptr');
  if (!doc) { row({ gate: 'O0 facts file', id: 'ptr', ok: false, notes: `no ${path.relative(REPO, FACTS)}/ptr.json` }); return; }
  const R = await readings('ptr', READ_PTR);
  const order = doc.states;
  const bad = Object.entries(R.at).filter(([, v]) => !v || v.error);
  row({ gate: 'O0 readings', id: 'ptr', ok: !bad.length && setEq(order, R.order), notes: `${R.order.length} states booted with --eval (an instrument separate from the extractor)${bad.length ? '; FAILED ' + bad.map(([k, v]) => k + ': ' + (v && v.error)).join('; ') : ''}${setEq(order, R.order) ? '' : '; the facts file covers ' + order.join(',')}` });
  const statesWhere = (pred) => R.order.filter((s) => R.at[s] && !R.at[s].error && pred(R.at[s]));

  // O1 — price: q11–q33
  if (want('price')) for (const id of Object.keys(Q_PRICES)) {
    const [k, coef] = Q_PRICES[id];
    const f = fact(doc, `price:q:upgrade:${id}`);
    const unlockedAt = statesWhere((x) => x.qUpg[id]);
    if (!unlockedAt.length) { row({ gate: `O1 price q${id}`, id: 'ptr', ok: !f, notes: f ? 'a fact exists for an upgrade the readings say is locked in every state' : `ABSTAIN (unreachable): q${id} is locked in all ${R.order.length} committed states (measured), and no fact claims it` }); continue; }
    const vals = valuesOf(f, order), probs = [];
    if (!f) probs.push('no fact');
    for (const { v, states } of vals) {
      if (v.currency !== 'player.q.energy') probs.push(`currency ${v.currency} in ${states[0]}`);
      if (!(v.reads || []).includes('player.q.time')) probs.push(`reads ${JSON.stringify(v.reads)} in ${states[0]}`);
      const s = v.shapes && v.shapes['player.q.time'];
      if (!s || s.type !== 'power' || !near(s.exponent, k, 1e-6) || s.offset !== 1 || !near(log10s(s.coef), Math.log10(coef), 1e-6)) probs.push(`shape ${JSON.stringify(s)} in ${states[0]}`);
    }
    const covered = vals.flatMap((x) => x.states), missing = unlockedAt.filter((s) => !covered.includes(s));
    if (missing.length) probs.push(`no reading at ${missing.join(',')}, where q${id} is unlocked`);
    row({ gate: `O1 price q${id}`, id: 'ptr', ok: !probs.length, notes: probs.length ? probs.join('; ') : `${coef.toExponential().replace('+', '')}·(q.time+1)^${k} in player.q.energy, in ${covered.length} state(s) from ${f.from.state}` });
  }
  // O2 — H31's goal, superexponential in completions (notes §7d): reachable only once H31 is unlocked
  if (want('price')) {
    const at = statesWhere((x) => x.h.c31);
    const f = fact(doc, 'price:h:challenge:31');
    row({ gate: 'O2 price H31 goal', id: 'ptr', ok: !at.length ? !f : !!(f && valuesOf(f, order).every(({ v }) => Object.values(v.shapes || {}).some((s) => s.type === 'superexponential'))),
      notes: !at.length ? `ABSTAIN (unreachable): H31 "Timeless" is locked in all ${R.order.length} committed states (it needs H22; measured), and no fact claims its goal` : JSON.stringify(f && f.shapes) });
  }
  // O3 — zeroed-by: q.time and q.energy (layers.js:2957-2958 q, :2649-2650 h, :3577-3578 o; game.js:126-136 rowReset
  // runs every doReset of rows ≤ the resetting row). So EVERY shown reset of row ≥ q's zeroes both, and each one's
  // writers are exactly h, q and o (all three doResets run on any row-3+ reset). Notes §7a.
  if (want('zeroed-by')) {
    const expected = [...new Set(R.order.flatMap((s) => (R.at[s] && R.at[s].resetsRow3) || []))].sort();
    for (const field of ['player.q.time', 'player.q.energy']) {
      const fs2 = doc.facts.filter((f) => f.kind === 'zeroed-by' && (f.field || (f.variants && f.variants[0].field)) === field);
      const resets = [...new Set(fs2.flatMap((f) => valuesOf(f, order).filter(({ v }) => v.effect === 'zeroes').map(({ v }) => v.reset)))].sort();
      const viaBad = fs2.flatMap((f) => valuesOf(f, order)).filter(({ v }) => !setEq(v.via || [], ['h', 'q', 'o'])).map(({ v, states }) => `${v.reset}: via ${JSON.stringify(v.via)} at ${states[0]}`);
      row({ gate: `O3 zeroed-by ${field}`, id: 'ptr', ok: setEq(resets, expected) && !viaBad.length && expected.length > 0,
        notes: `zeroed by [${resets.join(', ')}], expected every shown reset of row ≥ q's [${expected.join(', ')}] (rowReset's cascade); writers h, q, o on each${viaBad.length ? '; BAD ' + viaBad.join('; ') : ''}` });
    }
  }
  // O4 — production: quirk energy's per-tick increment in q.time (layers.js:2982-2985): ((q.time+diff)·M)^E·diff with
  // E = Quirk Layers + freeLayers − 1 (enGainExp :2972-2974) and M = enGainMult — so a power law, offset 1 at diff 1,
  // exponent E, coefficient M^E; energy itself ∝ q.time^(E+1). E = 0 is a CONSTANT rate: no shape in q.time (no fact).
  if (want('production')) {
    const f = fact(doc, 'production:player.q.energy:player.q.time');
    const vals = valuesOf(f, order), probs = [];
    let checked = 0, flat = 0;
    for (const s of statesWhere((x) => x.qUnlocked)) {
      const x = R.at[s], E = Number(x.ql) + Number(x.free) - 1;
      const hit = vals.find((q) => q.states.includes(s));
      if (E < 1) { flat++; if (hit) probs.push(`${s}: E=${E} (a constant rate) but a shape was recorded`); continue; }
      if (!hit) { probs.push(`${s}: E=${E}, no reading`); continue; }
      const r = hit.v.rate;
      checked++;
      if (r.type !== 'power' || !near(r.exponent, E, 1e-6) || r.offset !== 1 || !near(log10s(r.coef), E * Math.log10(Number(x.M)), 1e-5) || !hit.v.integrated || !near(hit.v.integrated.exponent, E + 1, 1e-6)) probs.push(`${s}: ${JSON.stringify(r)} vs E=${E}, M=${x.M}`);
    }
    row({ gate: 'O4 production q.energy in q.time', id: 'ptr', ok: !probs.length && checked > 0, notes: probs.length ? probs.join('; ') : `${checked} state(s): (q.time·M)^E with E = Quirk Layers + free − 1 and M = enGainMult read separately, energy ∝ q.time^(E+1); ${flat} state(s) at E = 0 carry no shape` });
  }
  // O5 — multiplier-reads (notes §14)
  if (want('multiplier-reads')) for (const [fid, exp, label] of [['reads:q:enGainMult', EN_GAIN_MULT, 'enGainMult'], ['reads:q:upgrades.11.effect', Q11_EFFECT, 'q11 effect'], ['reads:q:upgrades.21.effect', Q21_EFFECT, 'q21 effect']]) {
    const f = fact(doc, fid);
    const got = [...new Set(valuesOf(f, order).flatMap(({ v }) => [...(v.reads || []), ...(v.tmpReads || []), ...(v.widened || []).flatMap((w) => w.reads)]))].sort();
    row({ gate: `O5 multiplier-reads ${label}`, id: 'ptr', ok: !!f && setEq(got, exp), notes: f ? `reads (every branch, every state) ${setEq(got, exp) ? '= the source' : '≠ the source: got ' + JSON.stringify(got) + ', want ' + JSON.stringify([...exp].sort())}` : 'no fact' });
  }
  // O6 — challenge-inputs: H22 "Descension" (mod.js:50 returns early inside H22: point gain = prestige-upgrade and
  // achievement factors × buyableEffect(s, 11); s 11's effect (layers.js:1920-1924) reads its free levels, which include
  // buyableEffect(s, 15) (:1915-1918, :1677-1680)). So among BUYABLES only s 11 and s 15 move it inside; achievements 21
  // and 31 (mod.js:48-49) move it; prestige upgrades move it; the b and h factors (mod.js:52, :56) are NERFED. Notes §7b.
  if (want('challenge-inputs')) {
    const at = statesWhere((x) => x.h.unlocked && x.h.c22 && x.h.done22 < 1);
    const f = fact(doc, 'challenge-inputs:h:22');
    const vals = valuesOf(f, order), probs = [];
    if (!at.length) probs.push('H22 is open in no committed state');
    for (const s of at) if (!vals.some((q) => q.states.includes(s))) probs.push(`${s}: no reading`);
    for (const { v, states } of vals) {
      const buy = (v.moves || []).filter((m) => /\.buyables\./.test(m)).sort();
      if (v.entered !== true) probs.push(`${states[0]}: not entered`);
      if (!setEq(buy, ['player.s.buyables.11', 'player.s.buyables.15'])) probs.push(`${states[0]}: buyables moving it inside ${JSON.stringify(buy)}`);
      for (const m of ['ach:a:21', 'ach:a:31']) if (!(v.moves || []).some((x) => x.startsWith(m + ' '))) probs.push(`${states[0]}: ${m} does not move it`);
      if (!(v.moves || []).some((x) => x.startsWith('upg:p:'))) probs.push(`${states[0]}: no prestige upgrade moves it`);
      for (const n of ['player.b.points', 'player.h.points']) if (!(v.nerfed || []).includes(n)) probs.push(`${states[0]}: ${n} not nerfed`);
      if (!/challenge entered on the copy/.test(f.from.probeState || '')) probs.push('the probe-only state is not labelled');
    }
    row({ gate: 'O6 challenge-inputs H22', id: 'ptr', ok: !!f && !probs.length, notes: probs.length ? probs.join('; ') : `${at.length} state(s) with H22 open (${at[0]}…): inside only s 11 and s 15 (its free levels) among buyables, achievements 21/31 and prestige upgrades; b and h points nerfed` });
  }
  // O7 — purchase-budget: H31's 10 purchases (layers.js:1251, :1536 read player.h.chall31bought < 10 inside H31;
  // :1256, :1541 raise it). Notes §7d. Reachable only once H31 is unlocked.
  if (want('purchase-budget')) {
    const at = statesWhere((x) => x.h.c31);
    const fs3 = doc.facts.filter((f) => f.kind === 'purchase-budget' && /^purchase-budget:h:31:/.test(f.id));
    row({ gate: 'O7 purchase-budget H31', id: 'ptr', ok: !at.length ? !fs3.length : fs3.some((f) => f.limit === '10'),
      notes: !at.length ? `ABSTAIN (unreachable): H31 is locked in all ${R.order.length} committed states (measured); no budget fact claims it` : JSON.stringify(fs3.map((f) => [f.counter, f.limit])) });
  }
}

// ---- Part vacuity ----------------------------------------------------------------------------------------------------
// ⛔ A KIND WITH ZERO FACTS IS RED unless declared here, and each declaration is MEASURED by the `check` it names.
const DECLARED = {
  ptr: { 'purchase-budget': { why: 'the only budget in the source is H31\'s (layers.js:1251, :1536), and H31 is locked in every committed state', check: 'h31-locked' } },
  something: { 'challenge-inputs': { why: 'no challenge is unlocked in any committed state', check: 'no-challenges' }, 'purchase-budget': { why: 'no challenge is unlocked in any committed state, and no purchase outside one raises a counter its canAfford reads', check: 'no-challenges' } },
  'collection-of-everything': { 'purchase-budget': { why: 'its layer sources increment nothing (no ++ / += 1 outside a for header in js/layers*.js), so no purchase can raise a counter by one', check: 'no-increment' } },
};
async function partVacuity() {
  const rd = {};
  for (const id of GAMES) {
    const doc = readFacts(id);
    if (!doc) { row({ gate: 'V1 facts per kind', id, ok: false, notes: 'no facts file' }); continue; }
    const counts = Object.fromEntries(KINDS.map((k) => [k, doc.facts.filter((f) => f.kind === k).length]));
    const problems = [];
    for (const k of KINDS) {
      if (counts[k] > 0) continue;
      const d = DECLARED[id] && DECLARED[id][k];
      if (!d) { problems.push(`${k}: ZERO facts, not declared`); continue; }
      let ok = true;
      if (d.check === 'h31-locked') { rd.ptr = rd.ptr || await readings('ptr', READ_PTR); ok = rd.ptr.order.every((s) => rd.ptr.at[s] && !rd.ptr.at[s].error && rd.ptr.at[s].h.c31 === false); }
      if (d.check === 'no-challenges') { rd[id] = rd[id] || await readings(id, READ_CH); ok = rd[id].order.every((s) => rd[id].at[s] === 0); }
      if (d.check === 'no-increment') {
        const dir = path.join(gameDir(id), 'js');
        const files = fs.readdirSync(dir).filter((f) => /^layers.*\.js$/.test(f));
        ok = files.length > 0 && files.every((f) => fs.readFileSync(path.join(dir, f), 'utf8').split('\n').every((ln) => /for\s*\(/.test(ln) || !/\+\+|\+=\s*1\b/.test(ln)));
      }
      if (!ok) problems.push(`${k}: declared (${d.why}) but the check "${d.check}" does not hold`);
    }
    row({ gate: 'V1 facts per kind', id, ok: !problems.length, notes: `${KINDS.map((k) => `${k} ${counts[k]}${DECLARED[id] && DECLARED[id][k] && !counts[k] ? ' (declared: ' + DECLARED[id][k].why + ')' : ''}`).join(' · ')}${problems.length ? ' — ' + problems.join('; ') : ''}` });
    const abst = doc.facts.filter((f) => f.abstain);
    row({ gate: 'V2 nothing threw', id, ok: doc.thrown.length === 0, notes: `${doc.states.length} state(s); kinds that threw: ${doc.thrown.length ? JSON.stringify(doc.thrown) : 'none'}; ${abst.length} fact(s) abstain by name${abst.length ? ' (' + abst.slice(0, 4).map((f) => f.id + ': ' + f.abstain).join(' · ') + (abst.length > 4 ? ' …' : '') + ')' : ''}` });
  }
}

// ---- Part neutral ----------------------------------------------------------------------------------------------------
const NEUTRAL_LEGS = [['ptr', 'fresh'], ['ptr', 'tools/harness/snapshots/ptr/all/M25.json'], ['ptr', 'tools/harness/snapshots/ptr/all/M27.json'], ['something', 'tools/harness/snapshots/something/all/S05.json'], ['collection-of-everything', 'fresh']];
async function partNeutral() {
  const noop = path.join(TMP, 'noop.js');
  fs.writeFileSync(noop, 'return {};');
  const read = path.join(REPO, 'tools/harness/facts-read.js');
  const res = await pool(NEUTRAL_LEGS, Math.max(1, Math.min(POOL, 5)), async ([id, from]) => {
    const st = statesOf(id, [from])[0];
    const [x, y] = await Promise.all([boot(id, st, ['--planner', '--planner-script', read]), boot(id, st, ['--planner', '--planner-script', noop])]);
    return { id, st, x, y };
  });
  for (const { id, st, x, y } of res) {
    const ps = x.plannerScript || {};
    const kindsOk = ps.neutral && KINDS.every((k) => ps.neutral[k] === true);
    const ok = !x.error && !y.error && x.hash && x.hash === y.hash && x.hashGame === y.hashGame && ps.stateNeutral === true && kindsOk;
    const n = ps.kinds ? KINDS.map((k) => `${k} ${ps.kinds[k].length}`).join(' · ') : '';
    row({ gate: 'N1 live state untouched', id, leg: st.name, hash: x.hash, ok, notes: `after the whole extraction ${x.hash}/${x.hashGame} vs extracting nothing ${y.hash}/${y.hashGame}; stateNeutral ${ps.stateNeutral}; every kind's excursions neutral ${!!kindsOk}; ${n}${x.error || y.error ? ' — ' + (x.error || y.error) : ''}` });
  }
}

// ---- Part determinism ------------------------------------------------------------------------------------------------
async function partDeterminism() {
  const dirs = [path.join(TMP, 'd1'), path.join(TMP, 'd2')];
  for (const d of dirs) for (const id of GAMES) { const r = await child([path.join(REPO, 'tools/harness/facts.mjs'), id, '--out', d, '--jobs', String(POOL)], { timeoutMs: 1800e3 }); if (r.code) console.log(r.out.slice(-600)); }
  for (const id of GAMES) {
    const t = dirs.map((d) => (fs.existsSync(path.join(d, id + '.json')) ? fs.readFileSync(path.join(d, id + '.json'), 'utf8') : null));
    const committed = fs.existsSync(path.join(REPO, 'games-facts', id + '.json')) ? fs.readFileSync(path.join(REPO, 'games-facts', id + '.json'), 'utf8') : null;
    row({ gate: 'D1 two runs byte-identical, = committed', id, ok: !!t[0] && t[0] === t[1] && t[0] === committed, notes: `run 1 ${t[0] ? t[0].length : 'NONE'} B, run 2 ${t[1] ? t[1].length : 'NONE'} B, equal ${t[0] === t[1]}; = games-facts/${id}.json ${t[0] === committed}` });
  }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const planner = fs.readFileSync(path.join(REPO, 'loader/tmt-planner.js'), 'utf8');
  const at = planner.indexOf('// ==== facts-1');
  const srcs = [['tools/harness/facts.mjs', fs.readFileSync(path.join(REPO, 'tools/harness/facts.mjs'), 'utf8')], ['tools/harness/facts-read.js', fs.readFileSync(path.join(REPO, 'tools/harness/facts-read.js'), 'utf8')], ['loader/tmt-planner.js (facts-1 section)', at >= 0 ? planner.slice(at) : '']];
  const hits = [];
  for (const [name, src] of srcs) {
    if (!src) { hits.push(`${name}: section not found`); continue; }
    const lits = [...src.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    // a ONE-letter layer id ('e', 'p') is also ordinary text (an exponent's 'e'): it counts only where it names a layer
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');   // comments may cite what was MEASURED
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game or layer id in the extractor', id: 'ptr', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

const EXPECT = { oracle: () => 1 + (want('price') ? Object.keys(Q_PRICES).length + 1 : 0) + (want('zeroed-by') ? 2 : 0) + (want('production') ? 1 : 0) + (want('multiplier-reads') ? 3 : 0) + (want('challenge-inputs') ? 1 : 0) + (want('purchase-budget') ? 1 : 0),
  vacuity: () => GAMES.length * 2, neutral: () => NEUTRAL_LEGS.length, determinism: () => GAMES.length, grep: () => 1 };
const FN = { oracle: partOracle, vacuity: partVacuity, neutral: partNeutral, determinism: partDeterminism, grep: partGrep };
let expected = 0;
for (const p of RUN) { expected += EXPECT[p](); await FN[p](); }
const red = rows.filter((r) => !r.ok).length;
const verdict = rows.length === expected && red === 0;
console.log(`VERDICT facts-1 ${RUN.join('+')}: rows ${rows.length}/${expected}; ${red} RED${rows.length !== expected ? ' — ROW COUNT WRONG (a part died or a row went missing)' : ''}`);
if (!a['no-write']) { fs.mkdirSync(path.join(REPO, 'tools/harness/results/tmp'), { recursive: true }); fs.writeFileSync(path.join(REPO, `tools/harness/results/tmp/gates-facts1-part-${PART}-last.json`), JSON.stringify({ commit, dirty, rows }, null, 1) + '\n'); }
if (!a['no-summary']) appendSection({ title: `facts-1 — part ${PART}`, commit, dirty, rows, slug: null, reading: 'oracle = ptr §7 rows from the notes and the game source; vacuity = facts per kind, zero only where declared and measured; neutral = the live hash after extraction equals extracting nothing; determinism = two runs and the committed file byte-equal; grep = no game id in the extractor.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
