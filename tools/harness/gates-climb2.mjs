#!/usr/bin/env node
// climb-2 — CLIMB-1'S STAGE SHIPPED OFF, THE STANDING RECORD PAST THE OLD CAP, AND THE STAGE SCORED FROM SEVERAL STARTS
// (cloud-reports/tmt-climb-2.md; docs/harness.md "The whole-game run"; docs/automation.md "Stages").
//
//   node tools/harness/gates-climb2.mjs --part table|off|page|record|replay|full|robust|cell|grep|all
//        [--only <row-key>[,…]] [--seg k --segs N] [--cell <start>:<ratio>] [--no-summary] [--no-write] [--assert]
//   writers (not gates): --part write --chain <dir> [--wall <text>]   ·   --part robust-write --cells <dir>
//
// ⚖ THE USER (2026-10-05): "Ship OFF, test robustness" and "Extend the record's cap".
// THE FILES:
//   `games-auto/ptr.json`                              — the SHIPPED table: climb-1's stage with `enabled: false`
//   `tools/harness/snapshots/ptr/whole-climb1/table-climb1.json` — climb-1's table (the stage ON), a committed copy
//   `tools/harness/recorded/whole-ptr-130k.json`       — THE STANDING RECORD: the shipped table from a fresh save to
//      130,000 game-s; legs 1–35 are whole-1's own (recorded/whole-ptr.json, unchanged), then the chain resumed from
//      whole/legs/L035 under the shipped table. Its fixtures: `tools/harness/snapshots/ptr/whole-130k/` (the states past
//      M30 and the leg fixtures the rows below start from)
//   `tools/harness/recorded/climb2-robustness.json`    — the stage and its neighbours from several starts, twice each
// Part table
//   R0 the tables: climb-1's copy is games-auto/ptr.json at 30bbad5 byte for byte; the shipped table is that copy with
//      `enabled: false` on the stage and one provenance record added, nothing else; the ratio tables differ from the copy
//      only in the stage's `reset:q` (×4 IS the copy; ×2 is the table before climb-1)
// Part off
//   OFF1 `enabled: false` is never in force: the shipped chain's leg that buys Improvement Boost, replayed with a state
//      log from the standing record's leg fixture — no `stage` record for it, every quirk reset past Improvement Boost
//      cashes in at sg-keep's ×2 and not the stage's ×4, the stage reads inactive and off at the stop, and the leg ends
//      on the standing record's hash
// Part page (the real page)
//   OFF2 the Parts subtab, at the standing record's Improvement Boost state: the stage is listed, says "measured but
//      switched off in this game's table — not yet confirmed to help everywhere", offers no switch and no own condition,
//      is not counted in force, and no feature's readout names it
// Part record
//   REC1 the standing record: legs 1–35 and M01–M30 are whole-1's; legs 36–40 equal whole-1's (the old cap); past it the
//      watched states (q34, q41, q42, q43 / QL8–QL9, QL10, M32) each with a fixture on its tick and hash; the chain equals
//      climb-1's control chain (QL8 on its tick and hash, the stop's hash); the stage never switches; M31 named as the
//      wall, with numbers
// Part replay
//   REC2 the legs holding each state past M30, replayed from the record's own leg fixtures under the shipped table = the
//      record (every mark and the leg's end, ticks and hashGame)
// Part full (CI, hours): RF the standing record's own legs 36–65 again, in segments
// Part robust
//   RB1 every cell twice equal (the stop's tick and hash, and the 8th Quirk Layer's)
//   RB2 the table recomputed from the runs = the record's summary (the score per cell, the spread, the best per start,
//       whether ×4 wins at every start, the recommendation's numbers); every start fixture committed on its own hash
//   RB3 the chaos probe: in two neighbouring cells the resets are listed with their tick and energy, and the record's
//       reading of them (where the cells part) is recomputed
// Part cell (CI, about an hour): RB4 one cell (`--cell s90:4` by default) run again = the record
// Part grep
//   X1 no game id, ptr layer id or mark id in the code this slice added (the loader's climb-2 lines, climb2-cell.mjs)
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { REPO, GAMES, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, startServer, sha256hex } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'only', 'no-summary', 'no-write', 'assert', 'seg', 'segs', 'chain', 'wall', 'cells', 'cell']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
const PARTS = ['table', 'off', 'page', 'record', 'replay', 'full', 'robust', 'cell', 'grep', 'write', 'robust-write'];
if (![...PARTS, 'all'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not ${PARTS.join(' | ')} | all`); process.exit(2); }
const ONLY = a.only ? String(a.only).split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 2400)}`); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-climb2-'));
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');

// ⚠ This file is the ORACLE, and the games' ids are its data (the loader may not name them — part grep).
const OLD_RECORD = 'tools/harness/recorded/whole-ptr.json';
const RECORD = 'tools/harness/recorded/whole-ptr-130k.json';
const CLIMB1_RECORD = 'tools/harness/recorded/whole-ptr-climb1.json';
const CANDIDATES = 'tools/harness/recorded/climb1-candidates.json';
const ROBUST = 'tools/harness/recorded/climb2-robustness.json';
const WHOLE = 'tools/harness/snapshots/ptr/whole';
const FIX = 'tools/harness/snapshots/ptr/whole-130k';
const TABLES = 'tools/harness/snapshots/ptr/whole-climb2/tables';
const WATCH = 'tools/harness/whole/ptr-climb1-watch.json';
const TABLE = 'games-auto/ptr.json';
const TABLE_CLIMB1 = 'tools/harness/snapshots/ptr/whole-climb1/table-climb1.json';
const TABLE_BEFORE = 'tools/harness/snapshots/ptr/whole-climb1/table-before-climb1.json';
const CLIMB1_COMMIT = '30bbad5';
const CLIMB1_TABLE_SHA256 = '88c641f1649886734e7d27db5a7d34826f94c1d37f67042dacb5c3e0d147da6a';   // games-auto/ptr.json at 30bbad5
const STAGE = 'q43-longer-quirk-runs', KEEP = 'sg-keep';
const OFF_WORDS = 'measured but switched off in this game’s table — not yet confirmed to help everywhere';
const PAST_M30 = ['U34', 'U41', 'U42', 'U43', 'QL8', 'QL9', 'QL10', 'M32'];
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const byMark = (R) => Object.fromEntries(R.marks.map((m) => [m.id, m]));
const lg = (s) => { const m = /^(-?[\d.]+)e\+?(-?\d+)$/.exec(String(s)); if (m) return Math.log10(Number(m[1])) + Number(m[2]); const n = Number(s); return n > 0 ? Math.log10(n) : -Infinity; };
const canon = (o) => JSON.stringify(o, Object.keys(o).sort());

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
/** Replay legs fromLeg+1 … toLeg of record R under the shipped table, from the leg fixture in `legDir`, watching the
 *  states; compare every mark of those legs and each leg's end against R. */
async function replay(R, { fromLeg, toLeg, legDir }) {
  const dir = path.join(TMP, `rp${fromLeg}-${++seq}`), legs = path.join(dir, 'legs');
  fs.mkdirSync(legs, { recursive: true });
  const prog = path.join(legs, 'progress.jsonl');
  const L = R.legs[fromLeg - 1];
  fs.writeFileSync(prog, JSON.stringify({ leg: fromLeg, name: L.name, ok: true, ticks: L.ticks, gameSeconds: L.gameSeconds, hashGame: L.hashGame,
    marks: R.marks.filter((m) => m.leg <= fromLeg), stop: path.join(REPO, legDir, `${L.name}.json`) }) + '\n');
  const r = await child([path.join(REPO, 'tools/harness/whole.mjs'), 'ptr', '--dir', path.join(dir, 'marks'), '--legs-dir', legs, '--progress', prog, '--leg-gs', String(R.legGs), '--cap-gs', String(R.capGs),
    '--resume', '--max-legs', String(toLeg - fromLeg), '--watch', path.join(REPO, WATCH)]);
  const lines = fs.readFileSync(prog, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.leg > fromLeg);
  const got = {}; for (const l of lines) for (const m of l.marks || []) got[m.id] = m;
  const exp = R.marks.filter((m) => m.leg > fromLeg && m.leg <= toLeg);
  const bad = exp.filter((m) => !got[m.id] || got[m.id].ticks !== m.ticks || got[m.id].hashGame !== m.hashGame);
  const extra = Object.keys(got).filter((id) => !R.marks.some((m) => m.id === id));
  const legBad = lines.filter((l) => !R.legs[l.leg - 1] || R.legs[l.leg - 1].hashGame !== l.hashGame || R.legs[l.leg - 1].ticks !== l.ticks);
  const end = lines[lines.length - 1];
  return { r, lines, exp, got, bad, extra, legBad, end, ok: r.code === 0 && lines.length === toLeg - fromLeg && !bad.length && !extra.length && !legBad.length };
}

// ---- Part table --------------------------------------------------------------------------------------------------------
function partTable() {
  const f = [];
  // the copy against the commit itself where the history is there, and against its recorded digest always (CI checks out
  // one commit deep)
  let atClimb1 = null;
  try { atClimb1 = execFileSync('git', ['-C', REPO, 'show', `${CLIMB1_COMMIT}:${TABLE}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { /* a shallow clone */ }
  const copyText = fs.readFileSync(path.join(REPO, TABLE_CLIMB1), 'utf8');
  if (atClimb1 !== null && atClimb1 !== copyText) f.push(`${TABLE_CLIMB1} is not ${TABLE} at ${CLIMB1_COMMIT} byte for byte`);
  if (sha256hex(copyText) !== CLIMB1_TABLE_SHA256) f.push(`${TABLE_CLIMB1}'s digest is not ${TABLE}'s at ${CLIMB1_COMMIT}`);
  const C = JSON.parse(copyText), S = fixture(TABLE), B = fixture(TABLE_BEFORE);
  // the shipped table = climb-1's with `enabled: false` and ONE provenance record more on the stage, nothing else
  const cs = C.stages.find((x) => x.id === STAGE), ss = S.stages.find((x) => x.id === STAGE);
  if (!ss || ss.enabled !== false) f.push(`the shipped ${STAGE} is not enabled: false`);
  if (S.stages.filter((x) => x.enabled === false).length !== 1) f.push('another stage is shipped off');
  if (ss && cs) {
    const sp = [].concat(ss.provenance), cp = [].concat(cs.provenance);
    if (sp.length !== cp.length + 1 || JSON.stringify(sp.slice(0, cp.length)) !== JSON.stringify(cp)) f.push('the stage\'s provenance is not climb-1\'s plus one record');
    const why = sp[sp.length - 1];
    if (!why || !/switched off/.test(why.note) || !/2026-10-05/.test(why.note)) f.push('the added provenance record does not say why it is off');
    const strip = (t) => { const u = JSON.parse(JSON.stringify(t)); const x = u.stages.find((y) => y.id === STAGE); delete x.enabled; x.provenance = [].concat(x.provenance).slice(0, cp.length); return JSON.stringify(u); };
    if (strip(S) !== JSON.stringify(C)) f.push('the shipped table differs from climb-1\'s elsewhere');
    if (ss.name !== cs.name || ss.note !== cs.note || ss.when !== cs.when) f.push('the stage\'s name, note or condition moved');
  }
  // the shipped table without the disabled stage IS the table before climb-1 (what makes the control chain its run)
  { const u = JSON.parse(JSON.stringify(S)); u.stages = u.stages.filter((x) => x.enabled !== false); if (JSON.stringify(u) !== JSON.stringify(B)) f.push('the shipped table without its disabled stage is not the table before climb-1'); }
  // the ratio tables
  const ratios = fs.readdirSync(path.join(REPO, TABLES)).filter((x) => /^ratio-[\d.]+\.json$/.test(x));
  for (const r of ratios) {
    const n = r.slice(6, -5), text = fs.readFileSync(path.join(REPO, TABLES, r), 'utf8'), T = JSON.parse(text);
    if (n === '2') { if (JSON.stringify(T) !== JSON.stringify(B)) f.push('ratio-2 is not the table before climb-1'); continue; }
    if (n === '4' && text !== copyText) f.push('ratio-4 is not climb-1\'s table byte for byte');
    const u = JSON.parse(JSON.stringify(T)), st = u.stages.find((x) => x.id === STAGE);
    if (!st || st.policies['reset:q'] !== `gain>=${n}x` || st.enabled === false) f.push(`ratio-${n}: the stage's reset:q is ${st && st.policies['reset:q']}`);
    if (st) st.policies['reset:q'] = cs.policies['reset:q'];
    if (JSON.stringify(u) !== JSON.stringify(C)) f.push(`ratio-${n} differs from climb-1's table elsewhere`);
  }
  row({ gate: `R0 the tables: climb-1's copy = ${TABLE} at ${CLIMB1_COMMIT} byte for byte; the shipped table = that copy with ${STAGE} enabled: false and one provenance record that says why, nothing else (without it: the table before climb-1); every ratio table = the copy but the stage's reset:q`, id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `the copy checked ${atClimb1 === null ? 'by its digest (no history here)' : 'against the commit and by its digest'}; ${ratios.length} ratio tables (${ratios.map((r) => r.slice(6, -5)).sort((x, y) => x - y).join(', ')}); the added record: "${[].concat(ss.provenance).slice(-1)[0].note.slice(0, 120)}…"` });
}

// ---- Part off ----------------------------------------------------------------------------------------------------------
async function partOff() {
  const R = fixture(RECORD), M = byMark(R), u42 = M.U42, leg = u42.leg, lf = R.legs[leg - 2];
  const log = path.join(TMP, 'off.jsonl');
  const EVAL = `tmtLoader.stages().filter(function (s) { return s.id === ${JSON.stringify(STAGE)}; }).map(function (s) { return { active: s.active, enabled: s.enabled }; })[0]`;
  const r = await run('ptr', { 'from-snapshot': `${FIX}/legs/${lf.name}.json`, profile: 'all', ticks: Math.round(R.legGs / R.diff), stall: 1e9, log, 'log-every': 600, eval: EVAL, 'wall-ms': 6 * 3600e3 });
  const L = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
  const recs = L.filter((x) => x.type === 'stage' && x.stage === STAGE);
  const qs = L.filter((x) => x.type === 'action' && x.by === 'reset:q' && x.did && x.tick > u42.ticks);
  // a reset's cash-in: gain ÷ the quirks held before it (the log's state carries the quirks AFTER: held + gain)
  const ratios = qs.map((x) => { const g = lg(x.why && x.why.values && x.why.values.gain), after = lg(x.state && x.state['q.p']); return 1 / (Math.pow(10, after - g) - 1); }).filter(isFinite);
  const keepIn = L.filter((x) => x.type === 'stage' && x.stage === KEEP);
  const checks = { ranLeg: !!r.ok && r.hashGame === R.legs[leg - 1].hashGame, pastU42: r.ticks > u42.ticks, noStageRecord: !recs.length, resetsPastU42: qs.length > 0,
    noneAtFour: ratios.every((x) => x < 4), atTwo: ratios.every((x) => x >= 2 * 0.999), inactiveAtStop: !!r.eval && r.eval.active === false && r.eval.enabled === false,
    recordSaysSo: !(R.stages || []).some((x) => x.stage === STAGE), keepFirst: keepIn.length === 0 || keepIn[0].on === true };
  row({ gate: `OFF1 enabled: false is never in force: leg ${leg} of the standing record (it buys Improvement Boost at ${u42.gameSeconds}) replayed from whole-130k/legs/${lf.name} under the SHIPPED table with a state log — no switch of ${STAGE}, every quirk reset past Improvement Boost at sg-keep's ×2 and none at ×4, inactive at the stop, the leg's end = the record`, id: 'ptr',
    ok: Object.values(checks).every(Boolean), ticks: r.ticks, gameSeconds: r.gameSeconds, diff: R.diff, hash: r.hashGame,
    notes: `${ck(checks)} — ${recs.length} stage records for ${STAGE}; ${qs.length} q resets past U42 (${u42.ticks}), cash-in ${ratios.map((x) => '×' + x.toFixed(2)).join(' ')}; at the stop ${JSON.stringify(r.eval)}; end ${r.hashGame} vs ${R.legs[leg - 1].hashGame} ${r.error || ''}` });
}

// ---- Part page -----------------------------------------------------------------------------------------------------------
let openContext, openGame, pageLoadFrom, waitReady;
let server = null;
async function redraw(page) {
  await page.evaluate(() => { try { updateTemp(); } catch (e) { /* */ } if (typeof updateTabFormats === 'function') updateTabFormats(); });
  await page.waitForTimeout(150);
}
const SHOTS = path.join(REPO, 'cloud-reports/tmt-climb-2');
async function partPage(browser) {
  const f = [];
  const { context } = await openContext(browser, { contextOptions: { viewport: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  const ld = await openGame(page, server.url, 'ptr', { profile: 'all' });
  if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
  const s = fixture(`${FIX}/U42.json`);
  await pageLoadFrom(page, s.player);
  await page.evaluate(() => tmtLoader.pause());
  await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
  await page.evaluate(() => tmtLoader.setDevDetails(false));
  await page.evaluate(() => tmtLoader.tick(0.05, 40));
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Parts'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-qedit', { timeout: 15000 });
  await page.waitForFunction(() => tmtLoader.queues && tmtLoader.queues.ready, null, { timeout: 15000 });
  await redraw(page);
  const v = await page.evaluate((id) => {
    const e = document.querySelector(`.tmtl-qstage[data-stage="${id}"]`);
    const tx = (s) => { const x = e && e.querySelector(s); return x ? x.textContent.replace(/\s+/g, ' ').trim() : null; };
    const head = document.querySelector('.tmtl-parts-stages > div');
    const r = tmtLoader.explain().find((x) => x.id === 'reset:q');
    return { listed: !!e, state: e && e.dataset.state, stateText: tx('.tmtl-qstage-state'), note: tx('.tmtl-qstage-note'), onoff: e ? e.querySelectorAll('button.tmtl-qstage-onoff').length : -1,
      editwhen: e ? e.querySelectorAll('button.tmtl-qstage-editwhen').length : -1, evidence: e ? e.querySelectorAll('button.tmtl-qstage-evidence').length : -1, all: e ? e.textContent.replace(/\s+/g, ' ') : '',
      head: head ? head.textContent.replace(/\s+/g, ' ').trim() : null, active: tmtLoader.stages().filter((x) => x.active).map((x) => x.id), total: tmtLoader.stages().length,
      q43: hasUpgrade('q', 42) && !hasUpgrade('q', 43), named: r && r.stage ? r.stage.named : null, policy: r && r.policy.inForce,
      setOn: tmtLoader.parts.setStageOff(id, true), setWhen: tmtLoader.parts.setStageWhen(id, 'true') };
  }, STAGE);
  if (!v.listed) f.push('the stage is not listed');
  if (v.state !== 'table-off') f.push(`its state is ${v.state}`);
  if (v.stateText !== OFF_WORDS) f.push(`its line reads "${v.stateText}"`);
  if (!v.note) f.push('its note is not shown');
  if (v.onoff !== 0 || v.editwhen !== 0) f.push(`it offers ${v.onoff} switch and ${v.editwhen} own-condition buttons`);
  if (v.evidence !== 1) f.push('its evidence button is missing');
  if (!v.q43) f.push('the state is not between Improvement Boost and More Layers (a vacuous leg)');
  if (v.active.includes(STAGE)) f.push('it is in force');
  if (!v.head || !new RegExp(`— ${v.total}, ${v.active.length} in force now`).test(v.head)) f.push(`the count line reads "${v.head}"`);
  if (!v.named || v.named.includes(STAGE)) f.push(`the quirk reset's readout names ${JSON.stringify(v.named)}`);
  if (v.policy !== 'gain>=2x') f.push(`the quirk reset decides by ${v.policy}`);
  if (v.setOn.ok || v.setWhen.ok) f.push('the store accepted a switch for it');
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.addStyleTag({ content: 'canvas, #treeCanvas, .treeCanvas, svg line{display:none !important}' }).catch(() => {});
  await page.locator(`.tmtl-qstage[data-stage="${STAGE}"]`).screenshot({ path: path.join(SHOTS, 'parts-stage-off.png') }).catch(() => {});
  if (errs.length) f.push(`page errors: ${errs.slice(0, 3).join(' | ')}`);
  row({ gate: `OFF2 the Parts subtab at the standing record's Improvement Boost state: ${STAGE} is listed with "${OFF_WORDS}", its note and evidence, no switch and no own condition (the store refuses both), not counted in force, and the quirk reset's readout does not name it`, id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `"${v.stateText}" · ${v.head} · reset:q ${v.policy}, named ${JSON.stringify(v.named)} · refused: "${v.setOn.error}"` });
  await context.close();
}

// ---- Part record -------------------------------------------------------------------------------------------------------
function partRecord() {
  const R = fixture(RECORD), old = fixture(OLD_RECORD), M = byMark(R), O = byMark(old), C = fixture(CANDIDATES), f = [];
  const base = R.climbFromLeg;
  for (let i = 0; i < old.legs.length; i++) {
    const l = old.legs[i], n = R.legs[i];
    if (!n || n.ticks !== l.ticks || n.hashGame !== l.hashGame) f.push(`leg ${l.leg} is not whole-1's (${n ? n.hashGame : 'missing'} vs ${l.hashGame})`);
  }
  for (const m of old.marks) if (!M[m.id] || M[m.id].ticks !== m.ticks || M[m.id].hashGame !== m.hashGame) f.push(`${m.id} differs from whole-1's`);
  if (base !== 35) f.push(`the chain starts at leg ${base}`);
  const seen = [];
  for (const id of PAST_M30) {
    const m = M[id];
    if (!m) { f.push(`${id} not reached`); continue; }
    if (m.ticks <= O.M30.ticks) f.push(`${id} before M30`);
    let s = null; try { s = fixture(`${FIX}/${id}.json`); } catch { /* */ }
    if (!s || s.ticks !== m.ticks || s.hashGame !== m.hashGame) f.push(`${id}: no fixture on its tick and hash`);
    seen.push(`${id} ${m.gameSeconds}`);
  }
  // the chain IS climb-1's control chain (the table before climb-1 = the shipped table without its disabled stage)
  const ctl = C.candidates.find((c) => c.id === 'before'), cr = ctl && ctl.runs[0];
  if (!cr || !M.QL8 || M.QL8.ticks !== cr.ticks || M.QL8.hashGame !== cr.hashGame) f.push(`QL8 ${M.QL8 && M.QL8.ticks}/${M.QL8 && M.QL8.hashGame} is not climb-1's control ${cr && cr.ticks}/${cr && cr.hashGame}`);
  if (C.control && C.control.stop && C.control.stop.hashGame && C.control.stop.hashGame !== R.stop.hashGame) f.push(`the stop ${R.stop.hashGame} is not climb-1's control ${C.control.stop.hashGame}`);
  const cm = Object.fromEntries((C.control && C.control.marks || []).map((m) => [m.id, m]));
  for (const id of PAST_M30) if (cm[id] && M[id] && (cm[id].ticks !== M[id].ticks || cm[id].hashGame !== M[id].hashGame)) f.push(`${id} is not climb-1's control`);
  if ((R.stages || []).some((x) => x.stage === STAGE)) f.push(`${STAGE} switches in the standing record`);
  if (R.capGs < 130000 || R.stop.gameSeconds < 130000) f.push(`the cap is ${R.capGs}`);
  if (R.autoTable) f.push(`it ran under ${R.autoTable}, not the shipped table`);
  if (!R.wall || !/M31/.test(R.wall.text) || !/1e60/.test(R.wall.text) || !/\d\.\d+e51/.test(R.wall.text)) f.push('M31 is not named as the wall with its numbers');
  if (R.notReached.includes('QL8') || !R.notReached.includes('M31')) f.push(`not reached: ${R.notReached.join(' ')}`);
  for (const l of R.legs.filter((x) => x.leg > base)) if (!fs.existsSync(path.join(REPO, FIX, 'legs', `${l.name}.json`)) && [40, 42, 43, 44, 45, 50, 55, 60, 65].includes(l.leg)) f.push(`no fixture for ${l.name}`);
  row({ gate: `REC1 the standing record (${RECORD}): legs 1–40 and M01–M30 = whole-1's; past whole-1's cap the states q34, q41, q42, q43/QL8–QL9, QL10 and M32, each with its fixture; the chain = climb-1's control chain; ${STAGE} never switches; the shipped table; M31 named as the wall with its numbers`, id: 'ptr', ok: !f.length,
    ticks: R.stop.ticks, gameSeconds: R.stop.gameSeconds, diff: R.diff, hash: R.stop.hashGame,
    notes: `${f.length ? f.join('; ') + ' · ' : ''}${seen.join(' · ')} · stop ${R.stop.gameSeconds}, ${R.stop.totalQuirks} total quirks · wall: ${R.wall ? R.wall.text.slice(0, 300) : '—'}` });
}

// ---- Part replay -------------------------------------------------------------------------------------------------------
async function partReplay() {
  const R = fixture(RECORD), M = byMark(R);
  const legs = [...new Set(PAST_M30.filter((id) => M[id]).map((id) => M[id].leg))].sort((x, y) => x - y);
  const res = await Promise.all(legs.map((leg) => replay(R, { fromLeg: leg - 1, toLeg: leg, legDir: `${FIX}/legs` }).then((x) => ({ leg, x }))));
  for (const { leg, x } of res) {
    row({ gate: `REC2 leg ${leg} of the standing record replayed from whole-130k/legs/${R.legs[leg - 2].name} under the shipped table = the record (${x.exp.map((m) => m.id).join(', ')}; the leg's end)`, id: 'ptr', ok: x.ok,
      ticks: x.end && x.end.ticks, gameSeconds: x.end && x.end.gameSeconds, diff: R.diff, hash: x.end && x.end.hashGame,
      notes: `${x.exp.map((m) => `${m.id} ${m.gameSeconds} ${x.got[m.id] && x.got[m.id].ticks === m.ticks && x.got[m.id].hashGame === m.hashGame ? '✓' : `✗ (${x.got[m.id] ? x.got[m.id].ticks + '/' + x.got[m.id].hashGame : 'not reached'})`}`).join(' · ')}; end ${x.end ? x.end.hashGame : '—'} vs ${R.legs[leg - 1].hashGame}${x.extra.length ? ` · not in the record: ${x.extra.join(', ')}` : ''} ${x.r.code ? x.r.out.slice(-300) : ''}` });
  }
  return legs.length;
}

// ---- Part full ---------------------------------------------------------------------------------------------------------
async function partFull() {
  const R = fixture(RECORD), N = Number(a.segs || 1), SEG = a.seg === undefined ? null : Number(a.seg);
  const fx = fs.readdirSync(path.join(REPO, FIX, 'legs')).filter((x) => /^L\d+\.json$/.test(x)).map((x) => Number(x.slice(1, -5))).sort((x, y) => x - y);
  const first = R.climbFromLeg, last = R.legs.length, starts = [first];
  for (let k = 1; k < N; k++) { const goal = first + Math.round((last - first) * k / N); const c = fx.reduce((b, x) => (Math.abs(x - goal) < Math.abs(b - goal) ? x : b), Infinity); if (isFinite(c) && c > starts[starts.length - 1] && c < last) starts.push(c); }
  const segs = starts.map((s, i) => ({ fromLeg: s, toLeg: i + 1 < starts.length ? starts[i + 1] : last }));
  let n = 0;
  for (let k = 0; k < segs.length; k++) {
    if (SEG !== null && k !== SEG) continue;
    n++;
    const { fromLeg, toLeg } = segs[k];
    const legDir = fromLeg === first ? `${WHOLE}/legs` : `${FIX}/legs`;
    const x = await replay(R, { fromLeg, toLeg, legDir });
    row({ gate: `RF segment ${k + 1}/${segs.length}: the standing record's legs ${fromLeg + 1}–${toLeg} replayed from ${legDir.split('/').slice(-2).join('/')}/${R.legs[fromLeg - 1].name} under the shipped table = the record, every mark and every leg's end`, id: 'ptr',
      ok: x.ok, ticks: x.end && x.end.ticks, gameSeconds: x.end && x.end.gameSeconds, diff: R.diff, hash: x.end && x.end.hashGame,
      notes: `${x.exp.length} marks; differ ${x.bad.map((m) => m.id).join(', ') || 'none'}; legs differ ${x.legBad.map((l) => l.name).join(', ') || 'none'} of ${x.lines.length} ${x.r.code ? x.r.out.slice(-300) : ''}` });
  }
  return n;
}

// ---- Part robust -------------------------------------------------------------------------------------------------------
// The score: the game-second of the 8th Quirk Layer (lower is better; not by the horizon = Infinity), and the total quirks
// at the horizon (higher is better). A cell's runs must end on the same tick and hash.
// the run of a cell that carries the probe's rows (the first runs from the 90,000-s start ran before the probe read ptr's
// run clock, so their list is empty; the probe only reads, and both runs end on the same hash)
const probed = (c) => c.runs.find((r) => (r.resets || []).length) || c.runs[0];
const ql8Of = (run) => { const m = (run.marks || []).find((x) => x.id === 'QL8'); return m ? m.gameSeconds : Infinity; };
/** The summary, computed from the cells alone — the writer stores it, RB2 recomputes it. */
function summarize(Rb) {
  const starts = Rb.starts.map((s) => s.id), ratios = Rb.ratios;
  const cell = (s, r) => Rb.cells.find((c) => c.start === s && String(c.ratio) === String(r));
  const grid = {};
  for (const s of starts) {
    grid[s] = {};
    for (const r of ratios) { const c = cell(s, r); grid[s][r] = c && c.runs.length ? { ql8: ql8Of(c.runs[0]), totalLog10: Math.round(lg(c.runs[0].total) * 1000) / 1000 } : null; }
  }
  const best = {}, winsFour = {}, beatsBase = {};
  for (const s of starts) {
    const xs = ratios.filter((r) => grid[s][r]);
    const m = Math.min(...xs.map((r) => grid[s][r].ql8));
    best[s] = xs.filter((r) => grid[s][r].ql8 === m).map(String);
    winsFour[s] = best[s].includes('4');
    beatsBase[s] = Object.fromEntries(xs.filter((r) => String(r) !== '2').map((r) => [r, grid[s]['2'] ? Math.round((grid[s]['2'].ql8 - grid[s][r].ql8) * 100) / 100 : null]));
  }
  const spread = {};
  for (const r of ratios) {
    const v = starts.map((s) => grid[s][r] && grid[s][r].ql8).filter((x) => x !== null && x !== undefined);
    const fin = v.filter(isFinite);
    spread[r] = { min: fin.length ? Math.min(...fin) : null, max: fin.length ? Math.max(...fin) : null, range: fin.length ? Math.round((Math.max(...fin) - Math.min(...fin)) * 100) / 100 : null, notReached: v.length - fin.length,
      mean: fin.length ? Math.round(fin.reduce((x, y) => x + y, 0) / fin.length * 100) / 100 : null,
      meanGain: starts.every((s) => grid[s]['2'] && grid[s][r]) ? Math.round(starts.reduce((x, s) => x + (grid[s]['2'].ql8 - grid[s][r].ql8), 0) / starts.length * 100) / 100 : null,
      startsBeatingBase: starts.filter((s) => grid[s]['2'] && grid[s][r] && grid[s][r].ql8 < grid[s]['2'].ql8).length };
  }
  return { grid, best, fourWinsEverywhere: starts.every((s) => winsFour[s]), fourBeatsBaseEverywhere: starts.every((s) => beatsBase[s]['4'] > 0), beatsBase, spread };
}
function partRobust() {
  const Rb = fixture(ROBUST), R = fixture(RECORD), f1 = [], seen = [];
  for (const c of Rb.cells) {
    const rs = c.runs || [];
    const eq = rs.length >= 2 && rs.every((x) => x.ticks === rs[0].ticks && x.hashGame === rs[0].hashGame && ql8Of(x) === ql8Of(rs[0]) && JSON.stringify(x.marks) === JSON.stringify(rs[0].marks) && x.total === rs[0].total);
    if (!eq) f1.push(`${c.start}×${c.ratio}: ${rs.length} run(s), not twice equal`);
    seen.push(`${c.start}×${c.ratio} ${ql8Of(rs[0] || {})}${eq ? '' : '✗'}`);
  }
  row({ gate: `RB1 every robustness cell (${Rb.starts.length} starts × ${Rb.ratios.length} ratios, diff ${Rb.diff}, to ${Rb.horizon} game-s) twice equal: the stop's tick and hash, every watched state's, the total quirks`, id: 'ptr', ok: !f1.length && Rb.cells.length === Rb.starts.length * Rb.ratios.length && Rb.starts.length >= 4,
    notes: `${f1.length ? f1.join('; ') + ' · ' : ''}${seen.join(' · ')}` });
  const f2 = [];
  const S = summarize(Rb);
  if (JSON.stringify(S) !== JSON.stringify(Rb.summary)) f2.push('the summary is not what the cells give');
  for (const s of Rb.starts) {
    let x = null; try { x = fixture(s.fixture); } catch { /* */ }
    if (!x || x.hashGame !== s.hashGame || x.gameSeconds !== s.gameSeconds) f2.push(`${s.id}: the fixture ${s.fixture} is not on ${s.hashGame}`);
    if (s.leg) { const l = R.legs[s.leg - 1]; if (!l || l.hashGame !== s.hashGame) f2.push(`${s.id}: not the standing record's leg ${s.leg}`); }
  }
  for (const c of Rb.cells) if (!Rb.starts.some((s) => s.id === c.start) || !fs.existsSync(path.join(REPO, c.table))) f2.push(`${c.start}×${c.ratio}: no start or table`);
  if (!Rb.recommendation || !Rb.recommendation.verdict || !/^(switch it on|retune|drop)/.test(Rb.recommendation.verdict)) f2.push('no recommendation');
  row({ gate: `RB2 the robustness table recomputed from the runs = the record's summary (the score per cell, the spread per ratio, the best per start, whether ×4 wins at every start); every start fixture committed on its hash; the recommendation stated`, id: 'ptr', ok: !f2.length,
    notes: `${f2.length ? f2.join('; ') + ' · ' : ''}best per start ${Object.entries(S.best).map(([s, b]) => `${s} ×${b.join('/×')}`).join(', ')} · ×4 wins everywhere ${S.fourWinsEverywhere} · ×4 beats ×2 everywhere ${S.fourBeatsBaseEverywhere} · spread ${Object.entries(S.spread).map(([r, x]) => `×${r} ${x.min}–${x.max}`).join(', ')} · ${Rb.recommendation ? Rb.recommendation.verdict : '—'}` });
  // the chaos probe: the two neighbouring cells' resets, where they part, and the energy each held then
  const P = Rb.probe, f3 = [];
  if (!P || !P.cells || P.cells.length !== 2) f3.push('no probe');
  else {
    const [A, B] = P.cells.map((k) => Rb.cells.find((c) => `${c.start}:${c.ratio}` === k));
    if (!A || !B) f3.push('the probe names cells the record does not have');
    else {
      const ra = probed(A).resets || [], rb = probed(B).resets || [];
      let i = 0; while (i < ra.length && i < rb.length && ra[i][0] === rb[i][0]) i++;
      if (P.partAt !== i) f3.push(`the cells part at reset ${i}, the record says ${P.partAt}`);
      if (!ra.length || !rb.length) f3.push('a cell has no resets recorded');
      if (!P.reading) f3.push('no reading');
    }
  }
  row({ gate: 'RB3 the chaos probe: two neighbouring cells\' quirk resets (tick, energy held, run length) from their own runs, where they part, and the reading', id: 'ptr', ok: !f3.length,
    notes: f3.length ? f3.join('; ') : `${P.cells.join(' vs ')}: part at reset ${P.partAt} · ${P.reading.slice(0, 600)}` });
}
async function partCell() {
  const Rb = fixture(ROBUST), [s, r] = String(a.cell || 's90:4').split(':');
  const c = Rb.cells.find((x) => x.start === s && String(x.ratio) === r), st = Rb.starts.find((x) => x.id === s);
  const out = path.join(TMP, 'cell.json');
  const x = await child([path.join(REPO, 'tools/harness/climb2-cell.mjs'), 'ptr', '--layer', 'q', '--watch', path.join(REPO, WATCH), '--table', path.join(REPO, c.table), '--from', path.join(REPO, st.fixture), '--horizon', String(Rb.horizon), '--out', out]);
  let got = null; try { got = JSON.parse(fs.readFileSync(out, 'utf8')); } catch { /* */ }
  const e = c.runs[0];
  const ok = !!got && got.ok && got.stop.ticks === e.ticks && got.stop.hashGame === e.hashGame && JSON.stringify(got.marks) === JSON.stringify(e.marks) && got.stop.total === e.total;
  row({ gate: `RB4 the robustness cell ${s}×${r} run again from ${st.fixture.split('/').slice(-2).join('/')} = the record (the stop, every watched state, the total quirks)`, id: 'ptr', ok, ticks: got && got.stop.ticks, gameSeconds: got && got.stop.gameSeconds, diff: Rb.diff, hash: got && got.stop.hashGame,
    notes: got ? `QL8 ${ql8Of(got)} (record ${ql8Of(e)}); stop ${got.stop.hashGame} (record ${e.hashGame}); total ${got.stop.total}` : x.out.slice(-400) });
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = GAMES();
  const ptrLayers = ['q', 'sg', 'sb', 'ss', 'hn', 'ps', 'hs', 'ma', 'ge', 'mc', 'en', 'ne', 'id', 'ai', 'ba'];
  const marks = [...(fixture('tools/harness/ladder/ptr.json').marks || []).map((m) => m.id), ...fixture(WATCH).map((m) => m.id)];
  const hits = [];
  const scan = (name, code) => {
    code = code.replace(/\/\/.*$/gm, '');
    for (const l of [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2])) {
      if (ids.includes(l)) hits.push(`${name}: game id '${l}'`);
      if (ptrLayers.includes(l)) hits.push(`${name}: layer id '${l}'`);
      if (marks.includes(l)) hits.push(`${name}: mark id '${l}'`);
      if (l.includes(STAGE)) hits.push(`${name}: the stage id`);
    }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed`); }
  };
  // the loader: the lines this slice tagged, and the lines that read the flag
  for (const f of ['loader/tmt-auto.js', 'loader/tmt-qedit.js']) {
    const all = fs.readFileSync(path.join(REPO, f), 'utf8').split('\n');
    const keep = all.filter((l, i) => /climb-2|\.enabled\b|SHIPPED_OFF_WHY|TABLE_OFF_WORDS|table-off/.test(l) || (i > 0 && /climb-2/.test(all[i - 1])));
    if (!keep.length) hits.push(`${f}: no climb-2 line found`);
    scan(f, keep.join('\n'));
  }
  // the cell runner: the whole file (a game's id and layer arrive as arguments)
  scan('tools/harness/climb2-cell.mjs', fs.readFileSync(path.join(REPO, 'tools/harness/climb2-cell.mjs'), 'utf8'));
  row({ gate: 'X1 no game id, ptr layer id, mark id or stage id in the code this slice added (the loader\'s climb-2 lines, climb2-cell.mjs)', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `3 sources, ${ids.length} game ids, ${ptrLayers.length} layer ids, ${marks.length} mark ids checked` });
}

// ---- Part write (the standing record) ---------------------------------------------------------------------------------
async function partWrite() {
  const dir = path.resolve(String(a.chain || '')), legs = path.join(dir, 'legs'), prog = path.join(legs, 'progress.jsonl');
  if (!a.chain || !fs.existsSync(prog)) { console.error('REFUSED: --part write needs --chain <dir> with legs/progress.jsonl'); process.exit(2); }
  const old = fixture(OLD_RECORD), lines = fs.readFileSync(prog, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const seed = lines[0];
  const own = path.join(TMP, 'own.jsonl');
  fs.writeFileSync(own, lines.slice(1).map((l) => JSON.stringify(l)).join('\n') + '\n');
  const sumf = path.join(TMP, 'sum.json');
  const r = await child([path.join(REPO, 'tools/harness/whole.mjs'), 'ptr', '--dir', path.join(dir, 'marks'), '--legs-dir', legs, '--progress', own, '--leg-gs', String(old.legGs),
    '--cap-gs', String(lines[lines.length - 1].gameSeconds), '--watch', path.join(REPO, WATCH), '--summarize', sumf]);
  if (r.code) { console.error(r.out); process.exit(1); }
  const S = JSON.parse(fs.readFileSync(sumf, 'utf8'));
  const base = { legs: old.legs.filter((l) => l.leg <= seed.leg), marks: old.marks.filter((m) => m.leg <= seed.leg), stages: old.stages.filter((x) => x.ticks <= seed.ticks), queues: old.queues };
  const wall0 = base.legs.reduce((x, l) => x + l.wallMs, 0);
  const stopSnap = JSON.parse(fs.readFileSync(path.join(legs, `${lines[lines.length - 1].name}.json`), 'utf8'));
  const P = typeof stopSnap.player === 'string' ? JSON.parse(stopSnap.player) : stopSnap.player;
  const rec = { ...S, note: 'written by gates-climb2 --part write: THE STANDING RECORD — the whole-game run under the SHIPPED table (climb-1\'s stage shipped off), legs 1–' + seed.leg + ' whole-1\'s own (recorded/whole-ptr.json, unchanged — nothing the table changed since acts before them), then the chain resumed from whole/legs/' + seed.name + ' under the shipped table at diff 0.05 to the cap. It equals climb-1\'s control chain (the table before climb-1) to the hash.',
    climbFromLeg: seed.leg, table: TABLE,
    marks: [...base.marks, ...S.marks.map((m) => ({ ...m, wallMs: m.wallMs + wall0 }))].sort((x, y) => x.ticks - y.ticks),
    stages: (() => { const st = {}; for (const x of base.stages) st[x.stage] = x.on; const out = base.stages.slice(); for (const x of S.stages) { if (st[x.stage] === x.on && !x.error) continue; st[x.stage] = x.on; out.push(x); } return out; })(),
    queues: [...base.queues, ...S.queues.filter((q) => !base.queues.some((b) => b.id === q.id && b.startedAt === q.startedAt))],
    legs: [...base.legs, ...S.legs],
    stop: { ...S.stop, wallMs: S.stop.wallMs + wall0, totalQuirks: String(P.q.total), quirks: String(P.q.points), quirkLayers: String(P.q.buyables[11]), quirkUpgrades: P.q.upgrades.slice(),
      superBoosters: String(P.sb.points), superGenerators: String(P.sg.points), space: String(P.s.points), hindrances: P.h.challenges },
    wall: a.wall ? { text: String(a.wall) } : null };
  rec.notReached = (S.notReached || []).filter((id) => !rec.marks.some((m) => m.id === id));
  writeJSON(path.join(REPO, RECORD), rec);
  fs.mkdirSync(path.join(REPO, FIX, 'legs'), { recursive: true });
  for (const m of S.marks) fs.copyFileSync(path.join(dir, 'marks', `${m.id}.json`), path.join(REPO, FIX, `${m.id}.json`));
  // every 5th leg (the full segments), the robustness starts, and the leg before each state (the replays)
  const want = new Set([...S.legs.filter((l) => l.leg % 5 === 0).map((l) => l.leg), 42, 43, 44, ...S.marks.map((m) => m.leg - 1)]);
  for (const l of S.legs) if (want.has(l.leg)) fs.copyFileSync(path.join(legs, `${l.name}.json`), path.join(REPO, FIX, 'legs', `${l.name}.json`));
  console.log(`wrote ${RECORD}: ${rec.marks.length} marks (${S.marks.map((m) => m.id + '@' + m.gameSeconds).join(' ')}), ${rec.legs.length} legs, stop ${rec.stop.gameSeconds} game-s, ${rec.stop.totalQuirks} total quirks; ${want.size} leg fixtures`);
}

// ---- Part robust-write (the robustness record) ------------------------------------------------------------------------
function partRobustWrite() {
  const dir = path.resolve(String(a.cells || ''));
  const spec = JSON.parse(fs.readFileSync(path.join(dir, 'spec.json'), 'utf8'));
  const cells = [];
  for (const s of spec.starts) for (const r of spec.ratios) {
    const runs = [];
    for (const k of ['a', 'b']) {
      const f = path.join(dir, `${s.id}-r${r}-${k}.json`);
      if (!fs.existsSync(f)) continue;
      const c = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (!c.ok) throw new Error(`${f}: ${c.error}`);
      runs.push({ run: k, ticks: c.stop.ticks, gameSeconds: c.stop.gameSeconds, hashGame: c.stop.hashGame, marks: c.marks.filter((m) => m.ticks > Math.round(s.gameSeconds / spec.diff) + 1), total: c.stop.total, quirks: c.stop.quirks, layers: c.stop.layers, upgrades: c.stop.upgrades, wallMs: c.wallMs, resets: c.resets });
    }
    cells.push({ start: s.id, ratio: r, table: `${TABLES}/ratio-${r}.json`, runs });
  }
  const Rb = { format: 'tmt-climb2-robustness/1', diff: spec.diff, horizon: spec.horizon, scoreName: 'the game-second of the 8th Quirk Layer (lower is better), and the total quirks at the horizon',
    note: spec.note, starts: spec.starts, ratios: spec.ratios, cells };
  Rb.summary = summarize(Rb);
  Rb.probe = spec.probe || null;
  if (Rb.probe) {
    const [A, B] = Rb.probe.cells.map((k) => cells.find((c) => `${c.start}:${c.ratio}` === k));
    const ra = probed(A).resets, rb = probed(B).resets;
    let i = 0; while (i < ra.length && i < rb.length && ra[i][0] === rb[i][0]) i++;
    Rb.probe.partAt = i;
  }
  Rb.recommendation = spec.recommendation || null;
  writeJSON(path.join(REPO, ROBUST), Rb);
  console.log(`wrote ${ROBUST}: ${cells.length} cells; best per start ${JSON.stringify(Rb.summary.best)}; ×4 wins everywhere ${Rb.summary.fourWinsEverywhere}`);
}

async function withBrowser(fn) {
  const { chromium } = await import('playwright');
  ({ openContext, openGame, pageLoadFrom, waitReady } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  try { await fn(browser); } finally { await browser.close(); server.stop(); }
}
const doPart = (p) => PART === p || (PART === 'all' && !['full', 'cell', 'write', 'robust-write'].includes(p));
if (PART === 'write') { await partWrite(); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(0); }
if (PART === 'robust-write') { partRobustWrite(); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(0); }
let expected = 0;
if (doPart('table')) { partTable(); expected += 1; }
if (doPart('record')) { partRecord(); expected += 1; }
if (doPart('robust')) { partRobust(); expected += 3; }
if (doPart('grep')) { partGrep(); expected += 1; }
if (doPart('off')) { await partOff(); expected += 1; }
if (doPart('page')) { await withBrowser(async (browser) => { try { await partPage(browser); } catch (e) { row({ gate: 'OFF2', id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 600)}` }); } }); expected += 1; }
if (doPart('replay')) { expected += await partReplay(); }
if (doPart('full')) { expected += await partFull(); }
if (doPart('cell')) { await partCell(); expected += 1; }
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT climb2 part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-climb2-part${PART}-last.json`), { commit, dirty, rows });
if (!a['no-summary']) appendSection({ title: `climb-2 the stage shipped off, the standing record past the old cap, the stage from several starts — part ${PART}`, commit, dirty, rows, slug: null,
  reading: 'table = the shipped table is climb-1\'s with the stage off; off = the state log shows it never in force; page = the Parts subtab says why; record / replay = the standing record to 130,000 and its states replayed from its own legs; robust = the stage and its neighbours from several starts, twice each; grep = no game id.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
