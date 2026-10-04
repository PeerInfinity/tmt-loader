#!/usr/bin/env node
// climb-1 — CLIMBING PAST M30 at the page's tick, every win landing as a PART; and the run timeline's polish
// (cloud-reports/tmt-climb-1.md; docs/harness.md "The whole-game run"; docs/automation.md "Stages", "The run timeline").
//
//   node tools/harness/gates-climb.mjs --part rows|switch|unchanged|accept|full|timeline|grep|all [--only <row-key>[,…]]
//        [--seg k --segs N] [--no-summary] [--no-write] [--assert]
//
// THE RECORDS:
//   `tools/harness/recorded/whole-ptr.json`         — the chain under the table BEFORE climb-1 (whole-1's, unchanged)
//   `tools/harness/recorded/whole-ptr-climb1.json`  — the chain under the shipped table (climb-1's), legs 1–20 the same
//                                                     legs as whole-1's (the new part is not in force before M30), then
//                                                     its own legs from `whole/legs/L020` to the cap
//   `tools/harness/recorded/climb1-candidates.json` — every candidate part's 0.05 rows (whole stretches, twice each)
// Part rows
//   C1 every candidate's rows: each cell's two runs equal (ticks, hashGame, the score), the winner is the best score,
//      and the shipped table is the winner's
//   C2 the ORDER: the new stage listed after `sg-keep` (shadowed) is the table before climb-1 to the tick and hash
// Part switch
//   S1 the new part's switch, from the STATE LOG of the replayed leg that buys Improvement Boost: on at the record's tick,
//      off at More Layers, the leg's end on the record's hash, and a q reset under it at the stage's ratio
// Part unchanged (CI: `qrate1.yml -f part=climb`, segments)
//   U1 from a fresh save the shipped table reaches M01–M30 on the SAME ticks and hashGame as whole-1's record: the
//      chain's own legs replayed (fresh → L004, L004 → L010, L010 → L015, L015 → L020, L020 → the M30 leg) under the
//      shipped table, every mark compared
// Part accept
//   A1 past M30 the new chain reaches the watched climb (QL8, …) and every mark it reaches before the cap is earlier
//      than the chain before climb-1 (or that chain never reached it); the wall where it stops is named in the record
// Part full (CI, hours): F1 the climb chain's legs replayed from its committed leg fixtures = the record
// Part timeline (the real page)
//   TL6 the marks already past when first read: ONE row, "Already past N marks…", that opens to list them; no single
//       "Already past “…”" row
//   TL7 a fast-forward to a condition: words where every clause reads, else "a condition"; no code in a player's line;
//       the code under the developer details
//   TL8 newest first strictly by game time (a fast-forward recorded at its end sits at its start), ties in recorded order
// Part grep
//   X1 no game id, ptr layer id or ladder mark id in the code this slice added
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, GAMES, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'only', 'no-summary', 'no-write', 'assert', 'seg', 'segs']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
const PARTS = ['rows', 'switch', 'unchanged', 'accept', 'full', 'timeline', 'grep'];
if (![...PARTS, 'all'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not ${PARTS.join(' | ')} | all`); process.exit(2); }
const TL_ROWS = ['fold', 'words', 'order'];
const ONLY = a.only ? String(a.only).split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 2400)}`); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-climb-'));
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');

// ⚠ This file is the ORACLE, and the games' ids are its data (the loader may not name them — part grep).
const OLD_RECORD = 'tools/harness/recorded/whole-ptr.json';
const RECORD = 'tools/harness/recorded/whole-ptr-climb1.json';
const CANDIDATES = 'tools/harness/recorded/climb1-candidates.json';
const WHOLE = 'tools/harness/snapshots/ptr/whole';
const CLIMB = 'tools/harness/snapshots/ptr/whole-climb1';
const WATCH = 'tools/harness/whole/ptr-climb1-watch.json';
const TABLE = 'games-auto/ptr.json';
const TABLE_BEFORE = 'tools/harness/snapshots/ptr/whole-climb1/table-before-climb1.json';
const NEW_STAGE = 'q43-longer-quirk-runs';
const KEEP_STAGE = 'sg-keep';
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const byMark = (R) => Object.fromEntries(R.marks.map((m) => [m.id, m]));
const lg = (s) => { const m = /^(-?[\d.]+)e\+?(-?\d+)$/.exec(String(s)); if (m) return Math.log10(Number(m[1])) + Number(m[2]); const n = Number(s); return n > 0 ? Math.log10(n) : -Infinity; };

// ---- the harness side ----------------------------------------------------------------------------------------------
function child(args, { timeoutMs = 20 * 3600e3 } = {}) {
  return new Promise((resolve) => {
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (d) => { out += d; }); c.stderr.on('data', (d) => { out += d; });
    const t = setTimeout(() => c.kill('SIGKILL'), timeoutMs);
    c.on('close', (code) => { clearTimeout(t); resolve({ code, out }); });
  });
}
let seq = 0;
async function run(id, flags) {
  const f = path.join(TMP, `run-${++seq}.json`);
  const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', f];
  for (const [k, v] of Object.entries(flags)) { if (v === undefined || v === null || v === false) continue; args.push(`--${k}`); if (v !== true) args.push(String(v)); }
  const r = await child(args);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return { ok: false, error: r.out.slice(-600) }; }
}

/** Replay legs fromLeg+1 … toLeg of record R's chain under `table` (null = the shipped one), from R's leg fixture in
 *  `legDir`, watching `watch`; compare the marks (ids in `only`, or all) and each leg's end against R. */
async function replay(R, { fromLeg, toLeg, legDir, table = null, watch = null, only = null, compareLegs = true }) {
  const dir = path.join(TMP, `rp${fromLeg}-${++seq}`), legs = path.join(dir, 'legs');
  fs.mkdirSync(legs, { recursive: true });
  const prog = path.join(legs, 'progress.jsonl');
  if (fromLeg > 0) {
    const L = R.legs[fromLeg - 1];
    fs.writeFileSync(prog, JSON.stringify({ leg: fromLeg, name: L.name, ok: true, ticks: L.ticks, gameSeconds: L.gameSeconds, hashGame: L.hashGame,
      marks: R.marks.filter((m) => m.leg <= fromLeg), stop: path.join(REPO, legDir, `${L.name}.json`) }) + '\n');
  } else fs.writeFileSync(prog, '');
  const r = await child([path.join(REPO, 'tools/harness/whole.mjs'), 'ptr', '--dir', path.join(dir, 'marks'), '--legs-dir', legs, '--progress', prog, '--leg-gs', String(R.legGs), '--cap-gs', String(R.capGs),
    ...(fromLeg > 0 ? ['--resume'] : []), '--max-legs', String(toLeg - fromLeg), ...(table ? ['--auto-table', path.join(REPO, table)] : []), ...(watch ? ['--watch', path.join(REPO, watch)] : [])]);
  const lines = fs.readFileSync(prog, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.leg > fromLeg);
  const got = {}; for (const l of lines) for (const m of l.marks || []) got[m.id] = m;
  const exp = R.marks.filter((m) => m.leg > fromLeg && m.leg <= toLeg && (!only || only.includes(m.id)));
  const bad = exp.filter((m) => !got[m.id] || got[m.id].ticks !== m.ticks || got[m.id].hashGame !== m.hashGame);
  const extra = Object.keys(got).filter((id) => !R.marks.some((m) => m.id === id) && (!only || only.includes(id)));
  const legBad = compareLegs ? lines.filter((l) => !R.legs[l.leg - 1] || R.legs[l.leg - 1].hashGame !== l.hashGame || R.legs[l.leg - 1].ticks !== l.ticks) : [];
  const end = lines[lines.length - 1];
  return { r, lines, exp, got, bad, extra, legBad, end, dir, prog, ok: r.code === 0 && lines.length === toLeg - fromLeg && !bad.length && !extra.length && !legBad.length };
}

// ---- Part rows -------------------------------------------------------------------------------------------------------
function partRows() {
  const C = fixture(CANDIDATES), t = fixture(TABLE);
  const f = [], seen = [];
  for (const c of C.candidates) {
    const rs = c.runs || [];
    const eq = rs.length >= 2 && rs.every((x) => x.ticks === rs[0].ticks && x.hashGame === rs[0].hashGame && x.score === rs[0].score);
    if (!eq) f.push(`${c.id}: ${rs.length} run(s), not twice equal`);
    seen.push(`${c.id} ${c.scoreText || rs[0] && rs[0].score}${eq ? '' : ' ✗'}`);
  }
  const scored = C.candidates.filter((c) => c.runs && c.runs.length);
  const best = scored.slice().sort((x, y) => (y.runs[0].score - x.runs[0].score))[0];
  if (!best || best.id !== C.winner) f.push(`the best score is ${best && best.id}, the record names ${C.winner}`);
  const st = (t.stages || []).find((s) => s.id === NEW_STAGE);
  const shipped = st && best && best.policy && st.policies && st.policies['reset:q'] === best.policy;
  if (!shipped) f.push(`the shipped stage ${NEW_STAGE} does not carry the winner's ${best && best.policy}`);
  // a part ships with its evidence: a provenance record at the page's tick
  const prov = st && Array.isArray(st.provenance) ? st.provenance : [];
  if (!prov.some((r) => /0\.05/.test(String(r.gate)) && r.commit && r.note)) f.push(`${NEW_STAGE} has no provenance row at diff 0.05`);
  if (!st || !st.name || !st.note) f.push(`${NEW_STAGE} has no plain name and note`);
  row({ gate: `C1 every candidate's 0.05 rows twice equal, the winner the best ${C.scoreName}, and the shipped table carries it`, id: 'ptr', ok: !f.length,
    notes: `${f.length ? f.join('; ') + ' · ' : ''}${seen.join(' · ')} · horizon ${C.horizon}` });
  const o = C.order || {};
  const ids = (t.stages || []).map((x) => x.id), shippedFirst = ids.indexOf(NEW_STAGE) >= 0 && ids.indexOf(NEW_STAGE) < ids.indexOf(KEEP_STAGE);
  const oeq = shippedFirst && o.losing && o.before && o.losing.length >= 2 && o.losing.every((x) => x.hashGame === o.before.hashGame && x.ticks === o.before.ticks && x.score === o.before.score);
  row({ gate: `C2 the ORDER: ${NEW_STAGE} listed AFTER ${KEEP_STAGE} (which names the same slot) is the table before climb-1, to the tick and hash, twice; listed first it is the winner`, id: 'ptr', ok: !!oeq,
    notes: (shippedFirst ? '' : `the shipped table lists ${NEW_STAGE} AFTER ${KEEP_STAGE} (the losing order) · `) + (o.losing ? `losing ${o.losing.map((x) => `${x.ticks}/${x.hashGame}/${x.scoreText || x.score}`).join(', ')} · before ${o.before.ticks}/${o.before.hashGame}/${o.before.scoreText || o.before.score} · ${o.note || ''}` : 'no order rows in the record') });
}

// ---- Part switch -----------------------------------------------------------------------------------------------------
// The new stage's `when` holds from Improvement Boost (the record's watched mark U42) until More Layers: the leg that
// buys U42 is replayed with a state log from the climb's leg fixture before it.
async function partSwitch() {
  const R = fixture(RECORD), old = fixture(OLD_RECORD), M = byMark(R);
  const sw = (R.stages || []).find((x) => x.stage === NEW_STAGE && x.on), off = (R.stages || []).find((x) => x.stage === NEW_STAGE && !x.on);
  const u42 = M.U42, u43 = M.U43, leg = u42.leg, lf = R.legs[leg - 2];
  const legDir = fs.existsSync(path.join(REPO, CLIMB, 'legs', `${lf.name}.json`)) ? `${CLIMB}/legs` : `${WHOLE}/legs`;
  const log = path.join(TMP, 'switch.jsonl');
  const r = await run('ptr', { 'from-snapshot': `${legDir}/${lf.name}.json`, profile: 'all', ticks: Math.round(R.legGs / R.diff), stall: 1e9, log, 'log-every': 600, 'wall-ms': 6 * 3600e3 });
  const L = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
  const on = L.find((x) => x.type === 'stage' && x.stage === NEW_STAGE && x.on);
  const firstQ = L.find((x) => x.type === 'action' && x.by === 'reset:q' && x.did && on && x.tick >= on.tick);
  const st = (fixture(TABLE).stages || []).find((x) => x.id === NEW_STAGE), stagePolicy = st && st.policies && st.policies['reset:q'];
  // the cash-in it made: gain ÷ the quirks held before it (the log's state carries the quirks AFTER: held + gain) — at
  // least the stage's N, which the table before climb-1 (×2) does not wait for
  const N = stagePolicy ? Number((/gain>=([\d.]+)x/.exec(stagePolicy) || [])[1]) : NaN;
  let ratio = NaN;
  if (firstQ && firstQ.why && firstQ.why.values && firstQ.state && firstQ.state['q.p']) { const g = lg(firstQ.why.values.gain), after = lg(firstQ.state['q.p']); ratio = 1 / (Math.pow(10, after - g) - 1); }
  const ratioOk = isFinite(ratio) && ratio >= N * 0.999;
  // the leg ends at the record's leg end; the stage switches on the loop after Improvement Boost is bought
  const checks = { recorded: !!sw, afterU42: !!sw && sw.ticks >= u42.ticks && sw.ticks - u42.ticks <= 2, offAtU43: !!off && !!u43 && off.ticks >= u43.ticks && off.ticks - u43.ticks <= 2,
    logSaysSo: !!on && !!sw && on.tick === sw.ticks, ranLeg: !!r.ok && r.hashGame === R.legs[leg - 1].hashGame, cashesIn: !firstQ || ratioOk, notInOld: !(old.stages || []).some((x) => x.stage === NEW_STAGE) };
  row({ gate: `S1 the new part's switch, from the state log of leg ${leg} replayed from ${legDir.split('/').slice(-2).join('/')}/${lf.name}: ${NEW_STAGE} on the loop after Improvement Boost (the record's U42) and off after More Layers (U43), the leg ends on the record's hash, and a q reset under it cashes in at the stage's ratio`, id: 'ptr',
    ok: Object.values(checks).every(Boolean), ticks: r.ticks, gameSeconds: r.gameSeconds, diff: R.diff, hash: r.hashGame,
    notes: `${ck(checks)} — record on ${sw ? sw.ticks : '—'} (U42 ${u42.ticks}), off ${off ? off.ticks : '—'} (U43 ${u43 ? u43.ticks : '—'}); log on ${on ? on.tick : '—'}; first reset:q under it in this leg ${firstQ ? `${firstQ.tick} (gain ÷ held ${ratio.toFixed(3)}, the stage's N ${N})` : 'none in this leg'}; leg end ${r.hashGame} vs ${R.legs[leg - 1].hashGame} ${r.error || ''}` });
}

// ---- Part unchanged ----------------------------------------------------------------------------------------------------
// The segments of the BEFORE chain up to the leg that reaches M30, replayed under the SHIPPED table: every mark M01–M30
// on whole-1's tick and hashGame, and every leg's end before the M30 leg on whole-1's hash (the part is not in force).
function unchangedSegments(old) {
  const m30 = byMark(old).M30.leg;
  const fx = fs.readdirSync(path.join(REPO, WHOLE, 'legs')).filter((f) => /^L\d+\.json$/.test(f)).map((f) => Number(f.slice(1, -5))).filter((n) => n < m30).sort((x, y) => x - y);
  const starts = [0, ...fx.filter((n) => n % 5 === 0)];
  return starts.map((s, i) => ({ fromLeg: s, toLeg: i + 1 < starts.length ? starts[i + 1] : m30 }));
}
async function partUnchanged() {
  const old = fixture(OLD_RECORD), segs = unchangedSegments(old), SEG = a.seg === undefined ? null : Number(a.seg);
  const ids = old.marks.filter((m) => m.ticks <= byMark(old).M30.ticks).map((m) => m.id);
  const jobs = segs.map((s, k) => ({ ...s, k })).filter((s) => SEG === null || s.k === SEG);
  const res = await Promise.all(jobs.map((s) => replay(old, { fromLeg: s.fromLeg, toLeg: s.toLeg, legDir: `${WHOLE}/legs`, only: ids, compareLegs: false }).then((x) => ({ s, x }))));
  for (const { s, x } of res) {
    // every leg's end before the M30 leg is whole-1's (the part cannot act before it); the M30 leg's end may differ
    const m30leg = byMark(old).M30.leg;
    const legBad = x.lines.filter((l) => l.leg < m30leg && (old.legs[l.leg - 1].hashGame !== l.hashGame || old.legs[l.leg - 1].ticks !== l.ticks));
    row({ gate: `U1 segment ${s.k + 1}/${segs.length}: legs ${s.fromLeg + 1}–${s.toLeg} replayed from ${s.fromLeg ? `whole/legs/${old.legs[s.fromLeg - 1].name}` : 'a fresh save'} under the SHIPPED table = whole-1's record for every mark M01–M30 (ticks and hashGame) and every leg's end before the M30 leg`, id: 'ptr',
      ok: x.r.code === 0 && x.lines.length === s.toLeg - s.fromLeg && !x.bad.length && !legBad.length, ticks: x.end && x.end.ticks, gameSeconds: x.end && x.end.gameSeconds, diff: old.diff, hash: x.end && x.end.hashGame,
      notes: `${x.exp.length} marks (${x.exp.map((m) => `${m.id} ${m.ticks}${x.got[m.id] && x.got[m.id].hashGame === m.hashGame && x.got[m.id].ticks === m.ticks ? '✓' : '✗'}`).join(' ') || 'none'}); legs differ ${legBad.map((l) => l.name).join(', ') || 'none'} ${x.r.code ? x.r.out.slice(-300) : ''}` });
  }
  return jobs.length;
}

// ---- Part accept -------------------------------------------------------------------------------------------------------
function partAccept() {
  const R = fixture(RECORD), old = fixture(OLD_RECORD), M = byMark(R), O = byMark(old);
  const m30 = M.M30, past = R.marks.filter((m) => m.ticks > m30.ticks).sort((x, y) => x.ticks - y.ticks);
  const f = [], seen = [];
  for (let i = 0; i < old.marks.length; i++) { const m = old.marks[i]; if (m.ticks > O.M30.ticks) continue; if (!M[m.id] || M[m.id].ticks !== m.ticks || M[m.id].hashGame !== m.hashGame) f.push(`${m.id} differs from whole-1's`); }
  for (const m of past) {
    const o = O[m.id];
    if (o && o.ticks <= m.ticks) f.push(`${m.id} at ${m.gameSeconds} is not earlier than before climb-1 (${o.gameSeconds})`);
    seen.push(`${m.id} ${m.gameSeconds}${o ? ` (before ${o.gameSeconds})` : ` (before: not by ${old.capGs})`}`);
  }
  if (!M.QL8) f.push('QL8 is not reached by the cap');
  if (!R.wall || !R.wall.text) f.push('the record names no wall');
  row({ gate: `A1 the climb: M01–M30 = whole-1's (tick and hash); past M30 the shipped table reaches the 8th Quirk Layer and every later mark before the cap EARLIER than the table before climb-1; the wall where it stops is named`, id: 'ptr', ok: !f.length,
    notes: `${f.length ? f.join('; ') + ' · ' : ''}${seen.join(' · ')} · stop ${R.stop.gameSeconds} game-s, ${R.stop.totalQuirks || ''} total quirks · wall: ${R.wall ? R.wall.text : '—'}` });
}

// ---- Part full -------------------------------------------------------------------------------------------------------
async function partFull() {
  const R = fixture(RECORD), N = Number(a.segs || 1), SEG = a.seg === undefined ? null : Number(a.seg);
  const fx = fs.readdirSync(path.join(REPO, CLIMB, 'legs')).filter((f) => /^L\d+\.json$/.test(f)).map((f) => Number(f.slice(1, -5))).sort((x, y) => x - y);
  // the climb's own legs, from L020 (whole-1's fixture: legs 1–20 are whole-1's) in N segments at the committed fixtures
  const first = R.climbFromLeg, last = R.legs.length, starts = [first];
  for (let k = 1; k < N; k++) { const goal = first + Math.round((last - first) * k / N); const c = fx.reduce((b, x) => (Math.abs(x - goal) < Math.abs(b - goal) ? x : b), Infinity); if (isFinite(c) && c > starts[starts.length - 1] && c < last) starts.push(c); }
  const segs = starts.map((s, i) => ({ fromLeg: s, toLeg: i + 1 < starts.length ? starts[i + 1] : last }));
  let n = 0;
  for (let k = 0; k < segs.length; k++) {
    if (SEG !== null && k !== SEG) continue;
    n++;
    const { fromLeg, toLeg } = segs[k];
    const legDir = fromLeg === first ? `${WHOLE}/legs` : `${CLIMB}/legs`;
    const x = await replay(R, { fromLeg, toLeg, legDir, watch: WATCH });
    row({ gate: `F1 segment ${k + 1}/${segs.length}: the climb's legs ${fromLeg + 1}–${toLeg} replayed from ${legDir.split('/').slice(-2).join('/')}/${R.legs[fromLeg - 1].name} under the shipped table = the climb record, every mark and every leg's end (ticks and hashGame)`, id: 'ptr',
      ok: x.ok, ticks: x.end && x.end.ticks, gameSeconds: x.end && x.end.gameSeconds, diff: R.diff, hash: x.end && x.end.hashGame,
      notes: `${x.exp.length} marks (${x.exp.map((m) => m.id).join(' ') || 'none'}); differ ${x.bad.map((m) => `${m.id} (${x.got[m.id] ? x.got[m.id].ticks + '/' + x.got[m.id].hashGame : 'not reached'} vs ${m.ticks}/${m.hashGame})`).join(', ') || 'none'}; not in the record ${x.extra.join(', ') || 'none'}; legs differ ${x.legBad.map((l) => l.name).join(', ') || 'none'} of ${x.lines.length} ${x.r.code ? x.r.out.slice(-300) : ''}` });
  }
  return n;
}

// ---- Part timeline (the real page) -------------------------------------------------------------------------------------
let openContext, pageLoadFrom, waitReady;
let server = null;
async function fresh(browser, { mobile = false } = {}) {
  const { context } = await openContext(browser, { contextOptions: mobile ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { viewport: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(new URL(`index.html?mod=ptr&managed=1&automation=1&profile=all${mobile ? '&mobile=1' : ''}`, server.url).href, { waitUntil: 'load' });
  const ld = await waitReady(page);
  return { context, page, errs, ld };
}
async function atSnapshot(page, file) {
  const s = fixture(file);
  await pageLoadFrom(page, s.player);
  await page.evaluate(() => tmtLoader.pause());
  await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
  return s;
}
const runFF = (page, spec) => page.evaluate(async (s) => tmtLoader.speed.run(s), spec);
const FACT_ID = /\b(?:exits-challenge|zeroed-by|challenge-inputs|reads|price|production|multiplier-reads):|\b(?:ch|upg|buy|ms|reset|upgrades|buyables|challenges|clickables|toggles):[A-Za-z0-9_]+(?::\w+)?\b|\bplayer\.|\btmp\[|\bM\d\d\b|hasUpgrade\(|\.gte\(|Math\./;
const SHOTS = path.join(REPO, 'cloud-reports/tmt-climb-1');
async function openProgress(page) {
  await page.evaluate(() => { showTab(tmtLoader.auLayer); player.subtabs[tmtLoader.auLayer].mainTabs = 'Progress'; });
  // the pictures only: the game's tree-branch canvas is drawn over every tab
  await page.addStyleTag({ content: 'canvas{visibility:hidden !important}' }).catch(() => {});
  await page.waitForSelector('.tmtl-timeline .tmtl-tl-row', { timeout: 15000 });
}
async function partTimeline(browser) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const { context, page, errs } = await fresh(browser);
  // the M30 save from the chain: 30 marks already hold when the ladder first arrives
  await atSnapshot(page, `${WHOLE}/M30.json`);
  // the speed controls first, the ladder second: the marks are first read INSIDE the fast-forward below, so the
  // fast-forward (recorded at its end, placed at its start) is recorded AFTER events whose game time is later
  await page.evaluate(async () => { await tmtLoader.fetchSpeed(); tmtLoader.speed.setSpeed(0); await tmtLoader.fetchLadder(); tmtLoader.resume(); });
  const ff1 = await runFF(page, { ticks: 40 });
  // a fast-forward to a condition no clause reader knows, and one to a condition it reads (stopped at its limit)
  const ff2 = await runFF(page, { until: 'player.timePlayed > ' + JSON.stringify(0) + ' && Math.random() < 0', cap: 1 });
  const ff3 = await runFF(page, { until: "hasUpgrade('q',44) && player.o.unlocked", cap: 1 });
  const tl = await page.evaluate(() => tmtLoader.timeline());
  await openProgress(page);
  const shown = await page.evaluate(() => [...document.querySelectorAll('.tmtl-timeline .tmtl-tl-row')].map((r) => ({ kind: r.getAttribute('data-kind'), text: r.textContent.trim() })));
  if (want('fold')) {
    const late = tl.events.filter((e) => e.kind === 'mark' && e.late);
    const sum = await page.evaluate(() => { const d = document.querySelector('.tmtl-timeline details.tmtl-tl-late'); return d ? { text: d.querySelector('summary').textContent.trim(), open: d.open } : null; });
    await page.evaluate(() => { const d = document.querySelector('.tmtl-timeline details.tmtl-tl-late'); if (d) d.open = true; });
    const listed = await page.evaluate(() => [...document.querySelectorAll('.tmtl-timeline details.tmtl-tl-late[open] .tmtl-tl-late-mark')].map((x) => x.textContent.trim()));
    await page.locator('.tmtl-timeline').screenshot({ path: path.join(SHOTS, 'timeline-desktop.png') }).catch(() => {});
    const checks = { severalLate: late.length >= 2, oneRow: shown.filter((r) => r.kind === 'late').length === 1, words: !!sum && new RegExp(`Already past ${late.length} marks when the marks were first read$`).test(sum.text),
      closedByDefault: !!sum && !sum.open, listsThem: listed.length === late.length && late.every((e) => listed.some((x) => x.indexOf(e.name) >= 0)), noSingle: !shown.some((r) => /Already past “/.test(r.text)) };
    row({ gate: 'TL6 the marks already past when the marks were first read: ONE row ("Already past N marks when the marks were first read"), closed, that opens to list them by name; no single "Already past “…”" row', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${late.length} late marks; summary "${sum && sum.text}"; ${listed.length} listed; ${shown.length} rows shown` });
  }
  if (want('words')) {
    const ffs = tl.events.filter((e) => e.kind === 'ff');
    const e2 = ffs.find((e) => e.code && /Math\.random/.test(e.code)), e3 = ffs.find((e) => e.code && /hasUpgrade/.test(e.code));
    const bad = [...tl.events.map((e) => e.text), ...shown.map((r) => r.text)].filter((x) => FACT_ID.test(x));
    await page.evaluate(() => tmtLoader.setDevDetails ? tmtLoader.setDevDetails(true) : null);
    const devOn = await page.evaluate(() => (tmtLoader.devDetails ? tmtLoader.devDetails() : false));
    let devCode = [];
    if (devOn) { await runFF(page, { ticks: 1 }); await page.waitForTimeout(300); devCode = await page.evaluate(() => [...document.querySelectorAll('.tmtl-timeline .tmtl-tl-dev')].map((x) => x.textContent)); }
    const checks = { reached: ff2.why === 'cap' && ff3.why === 'cap', unreadable: !!e2 && /before reaching a condition$/.test(e2.text), readable: !!e3 && /before reaching the point where you own “[^”]+” \([^)]+\) and [A-Za-z][^.]* is unlocked$/.test(e3.text),
      noCode: !bad.length, codeKept: !!e2 && !!e3, devShowsCode: !devOn || devCode.some((x) => /Math\.random/.test(x)) };
    row({ gate: 'TL7 a fast-forward\'s line never prints a raw condition: the clause reader\'s words where every clause reads, else "a condition"; the code kept for the developer details', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — "${e2 && e2.text}" · "${e3 && e3.text}"${bad.length ? ` · WITH CODE: ${bad.slice(0, 3).join(' | ')}` : ''}; developer details ${devOn ? 'on' : 'not switchable here'}` });
  }
  if (want('order')) {
    const at = tl.events.map((e) => e.at);
    const ordered = at.every((x, i) => i === 0 || at[i - 1] >= x);
    // recorded order: ff1 ended after the marks it read inside it — so its game time is EARLIER than events recorded before it
    const iFf1 = tl.events.findIndex((e) => e.kind === 'ff' && e.gs > 1), iLate = tl.events.findIndex((e) => e.kind === 'mark' && e.late);
    const shownOrder = shown.findIndex((r) => r.kind === 'late') < shown.findIndex((r) => r.kind === 'ff' && /2s of game time/.test(r.text));
    const checks = { strictlyByGameTime: ordered, nonVacuous: iFf1 > iLate && iLate >= 0, renderedSo: shownOrder, ff1Reached: ff1.why === 'reached' };
    row({ gate: 'TL8 newest first strictly by game time: a fast-forward recorded at its end sits at the game time it started, below what happened inside it; ties keep their recorded order', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — at ${at.slice(0, 8).join(', ')}…; kinds ${tl.events.slice(0, 8).map((e) => e.kind).join(', ')}` });
  }
  if (errs.length) row({ gate: 'TL page errors', id: 'ptr', ok: false, notes: errs.slice(0, 3).join(' | ') });
  await context.close();
  // the phone picture for the report (the 390-px fit is gates-whole TL5's row)
  const { context: c2, page: p2 } = await fresh(browser, { mobile: true });
  await atSnapshot(p2, `${WHOLE}/M30.json`);
  await p2.evaluate(async () => { await tmtLoader.fetchSpeed(); tmtLoader.speed.setSpeed(0); await tmtLoader.fetchLadder(); tmtLoader.resume(); });
  await runFF(p2, { ticks: 40 });
  await runFF(p2, { until: "hasUpgrade('q',44) && player.o.unlocked", cap: 1 });
  await openProgress(p2);
  await p2.evaluate(() => { const d = document.querySelector('.tmtl-timeline details.tmtl-tl-late'); if (d) d.open = true; });
  await p2.locator('.tmtl-timeline').screenshot({ path: path.join(SHOTS, 'timeline-phone.png') }).catch(() => {});
  await c2.close();
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const srcs = [['loader/tmt-auto.js', 'loader/tmt-auto.js'], ['loader/tmt-speed.js', 'loader/tmt-speed.js'], ['loader/tmt-qedit.js', 'loader/tmt-qedit.js'], ['tools/harness/whole.mjs', 'tools/harness/whole.mjs']];
  const ids = GAMES();
  const ptrLayers = ['sg', 'sb', 'ss', 'hn', 'ps', 'hs', 'ma', 'ge', 'mc', 'en', 'ne', 'id', 'ai', 'ba'];
  const marks = (fixture('tools/harness/ladder/ptr.json').marks || []).map((m) => m.id);
  const watch = fixture(WATCH).map((m) => m.id);
  const hits = [];
  for (const [name, f] of srcs) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    // only the blocks this slice added: (climb-1)-tagged lines and the functions they introduce
    const blocks = src.split('\n').filter((l, i, all) => /climb-1/.test(l) || /\b(?:tlTarget|tlCode|tlOrdered|tlRows|CW\.|WATCH|watched)\b/.test(l));
    const code = blocks.join('\n').replace(/\/\/.*$/gm, '');
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) {
      if (ids.includes(l)) hits.push(`${name}: game id '${l}'`);
      if (ptrLayers.includes(l)) hits.push(`${name}: layer id '${l}'`);
      if (marks.includes(l) || watch.includes(l)) hits.push(`${name}: mark id '${l}'`);
    }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed`); }
  }
  // the moved clause reader is the core's now — the whole block, not just the tagged lines
  const core = fs.readFileSync(path.join(REPO, 'loader/tmt-auto.js'), 'utf8');
  const i0 = core.indexOf('(climb-1) A CONDITION IN WORDS'), i1 = core.indexOf('T.conditionWords = CW;');
  const cw = i0 > 0 && i1 > i0 ? core.slice(i0, i1).replace(/\/\/.*$/gm, '') : '';
  if (!cw) hits.push('the core clause reader block was not found');
  for (const l of [...cw.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2])) { if (ids.includes(l) || ptrLayers.includes(l)) hits.push(`clause reader: id '${l}'`); }
  row({ gate: 'X1 no game id, ptr layer id or mark id in the code this slice added (the timeline, the core clause reader, the speed note, whole.mjs)', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids, ${ptrLayers.length} layer ids, ${marks.length + watch.length} mark ids checked` });
}

async function withBrowser(fn) {
  const { chromium } = await import('playwright');
  ({ openContext, pageLoadFrom, waitReady } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  try { await fn(browser); } finally { await browser.close(); server.stop(); }
}
const doPart = (p) => PART === p || (PART === 'all' && p !== 'full' && p !== 'unchanged');
let expected = 0;
if (doPart('rows')) { partRows(); expected += 2; }
if (doPart('switch')) { await partSwitch(); expected += 1; }
if (doPart('unchanged')) { expected += await partUnchanged(); }
if (doPart('accept')) { partAccept(); expected += 1; }
if (doPart('full')) { expected += await partFull(); }
if (doPart('timeline')) {
  await withBrowser(async (browser) => { try { await partTimeline(browser); } catch (e) { row({ gate: 'TL', id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 600)}` }); } });
  expected += TL_ROWS.filter(want).length;
}
if (doPart('grep')) { partGrep(); expected += 1; }
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT climb part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-climb-part${PART}-last.json`), { commit, dirty, rows });
if (!a['no-summary']) appendSection({ title: `climb-1 past M30 by parts, and the timeline's polish — part ${PART}`, commit, dirty, rows, slug: null,
  reading: 'rows = the candidates\' 0.05 rows and the stage order; switch = the new part on at M30 from the state log; unchanged = M01–M30 on whole-1\'s ticks under the shipped table; accept = the climb past M30 against the table before; full = the climb chain again; timeline = the fold, a condition in words, the order; grep = no game id.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
