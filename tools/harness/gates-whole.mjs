#!/usr/bin/env node
// whole-1 — THE WHOLE-GAME RUN at the page's tick, its real-page checks, the run timeline, and the templates' words
// (cloud-reports/tmt-whole-1.md; docs/harness.md "The whole-game run"; docs/automation.md "The run timeline").
//
//   node tools/harness/gates-whole.mjs --part chain|full|page|timeline|tpl|grep|all [--only <row-key>[,…]]
//        [--no-summary] [--no-write] [--assert]
//
// THE RECORD: `tools/harness/recorded/whole-ptr.json` — the chain `tools/harness/whole.mjs` ran from a FRESH save under
// the shipped table alone at diff 0.05 (every mark: tick, game-seconds, hashGame, wall time; the parts in force), and
// the fixtures it wrote, `tools/harness/snapshots/ptr/whole/<mark>.json`.
// Part chain (the push row, bounded)
//   W1 fresh → the early marks at 0.05 in ONE process = the record's ticks and hashGame, mark by mark, and the fixtures'
//   W2 a resumed stretch (whole/<A> → the next mark reached) = the record
// Part full (CI, `.github/workflows/qrate1.yml -f part=whole`, hours; `--seg k --segs N` one segment of N)
//   WF the whole chain again, in segments from the committed whole/ fixtures = the record, every mark
// Part page
//   P1 checkpoints: the checkpoint's save in the REAL page, automation on, the shipped table, a faithful fast-forward
//      "until the next mark" with a cap — the mark's tick against the harness's from the same checkpoint (drift allowed
//      and stated: Node and Chromium differ in a float's last bits past ~3,000 ticks); ticks/s per stretch
//   P2 the page RELOADED in the middle of the H22 queue: the queue is on the same step after it (the reload memory),
//      the timeline says so, and the run reaches M29 — its tick against the harness's
// Part timeline
//   TL1 every kind recorded: a mark, a stage switching, a shipped move starting and ending, the player's own queue
//       starting and ending, a fast-forward, a reload
//   TL2 it survives a reload (the reload memory), and the stages already in force are not recorded twice
//   TL3 bounded: past its cap the oldest are dropped and counted
//   TL4 plain words: no fact id, feature id, expression or ladder id in a player's line (they are in developer details)
//   TL5 fits a phone: at 390 px the Progress subtab's timeline has no horizontal overflow and no `nowrap`
// Part tpl
//   A1 the template-written queues (the shipped one and the four in the catalog) speak in titles: no fact id in a
//      comment, each fact id kept in the step's `dev`
//   A2 T1: strategize from m28/QL6 under the shipped table emits EXACTLY the table's inline queue
//   B1 the confirmations of time-priced-purchase and reset-requirement are `{ticks: 2}` (version 4) in what the
//      templates write now and in the committed queues
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
const KNOWN = new Set(['_', 'part', 'only', 'no-summary', 'no-write', 'assert', 'record', 'seg', 'segs']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
const PARTS = ['chain', 'full', 'page', 'timeline', 'tpl', 'grep'];
if (![...PARTS, 'all'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not ${PARTS.join(' | ')} | all`); process.exit(2); }
const PAGE_ROWS = ['checkpoints', 'reload'];
const TL_ROWS = ['kinds', 'reload', 'bounded', 'words', 'phone'];
const ONLY = a.only ? String(a.only).split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 2400)}`); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-whole-'));
const ck = (checks) => Object.entries(checks).map(([k, y]) => `${k} ${y ? '✓' : '✗'}`).join(' ');

// ⚠ This file is the ORACLE, and the games' ids are its data (the loader may not name them — part grep).
const RECORD_FILE = String(a.record || 'tools/harness/recorded/whole-ptr.json');
const WHOLE = 'tools/harness/snapshots/ptr/whole';
const LADDER = 'tools/harness/ladder/ptr.json';
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json';
const H22Q = 'ca-ch-h-22';
const TABLE = 'games-auto/ptr.json';
const CATALOG = ['tools/harness/queues/m28/q23-from-Q308K.json', 'tools/harness/queues/h22/ch-h-22-from-QL6.json',
  'tools/harness/queues/m30/rr-reset-sg-from-W226931.json', 'tools/harness/queues/m31/rr-reset-sg-from-R95400.json'];
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
const record = () => fixture(RECORD_FILE);
const byMark = (R) => Object.fromEntries(R.marks.map((m) => [m.id, m]));

// ---- the harness side ----------------------------------------------------------------------------------------------
function child(args, { timeoutMs = 4 * 3600e3 } = {}) {
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
async function strategize(game, extra) {
  const f = path.join(TMP, `strat-${++seq}.json`), q = path.join(TMP, `strat-q-${seq}.json`);
  const r = await child([path.join(REPO, 'tools/harness/strategize.mjs'), game, '--json', f, '--out', q, ...extra]);
  let v = null, queue = null;
  try { v = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* */ }
  try { queue = JSON.parse(fs.readFileSync(q, 'utf8')); } catch { /* */ }
  return { code: r.code, out: r.out, v, queue };
}

// ---- Part chain ------------------------------------------------------------------------------------------------------
async function partChain() {
  const R = record(), M = byMark(R);
  // W1: the early marks, fresh, in one process — every mark the record reached by the bound
  const BOUND = 30000;
  const early = R.marks.filter((m) => m.ticks <= BOUND).sort((x, y) => x.ticks - y.ticks);
  const last = early[early.length - 1];
  const r = await run('ptr', { profile: 'all', diff: 0.05, ticks: last.ticks + 1, ladder: LADDER, to: 'M53', stall: 1e9 });
  const got = Object.fromEntries((r.ladder ? r.ladder.reached : []).map((m) => [m.id, m]));
  const bad = early.filter((m) => !got[m.id] || got[m.id].ticks !== m.ticks || got[m.id].hashGame !== m.hashGame);
  const fx = early.filter((m) => { try { const s = fixture(`${WHOLE}/${m.id}.json`); return s.ticks !== m.ticks || s.hashGame !== m.hashGame; } catch { return true; } });
  row({ gate: `W1 fresh → ${early.length} marks at diff 0.05 under the shipped table, one process = the record and the whole/ fixtures (ticks and hashGame)`, id: 'ptr', ok: !!r.ok && !bad.length && !fx.length,
    ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 0.05, hash: r.hashGame,
    notes: `${early.map((m) => `${m.id} ${m.ticks}${got[m.id] && got[m.id].ticks === m.ticks && got[m.id].hashGame === m.hashGame ? '✓' : `✗(${got[m.id] ? got[m.id].ticks + '/' + got[m.id].hashGame : 'not reached'})`}`).join(' ')}${fx.length ? ` · fixtures differ: ${fx.map((m) => m.id).join(', ')}` : ''} ${r.error || ''}` });
  // W2: a resumed stretch — the first pair after the opening with a short span
  const order = R.marks.slice().sort((x, y) => x.ticks - y.ticks);
  let A = null, B = null;
  for (let i = 0; i + 1 < order.length; i++) if (order[i].ticks > BOUND && order[i + 1].ticks - order[i].ticks >= 2000 && order[i + 1].ticks - order[i].ticks <= 15000) { A = order[i]; B = order[i + 1]; break; }
  if (!A) { row({ gate: 'W2 a resumed stretch = the record', id: 'ptr', ok: false, notes: 'no short stretch in the record' }); return; }
  const s = await run('ptr', { 'from-snapshot': `${WHOLE}/${A.id}.json`, profile: 'all', ticks: B.ticks - A.ticks + 1, ladder: LADDER, from: A.id, to: B.id, stall: 1e9 });
  const sb = s.ladder && s.ladder.reached.find((m) => m.id === B.id);
  row({ gate: `W2 whole/${A.id} → ${B.id} resumed at diff 0.05 = the record`, id: 'ptr', ok: !!s.ok && !!sb && sb.ticks === B.ticks && sb.hashGame === B.hashGame,
    ticks: sb && sb.ticks, gameSeconds: sb && sb.gameSeconds, diff: 0.05, hash: sb && sb.hashGame,
    notes: `${B.id} ${sb ? `${sb.ticks} / ${sb.hashGame}` : 'not reached'} (record ${B.ticks} / ${B.hashGame}; +${B.ticks - A.ticks} ticks) ${s.error || ''}` });
}

// ---- Part full -------------------------------------------------------------------------------------------------------
// The whole chain in SEGMENTS, each from a committed whole/ fixture (or the fresh save) to the next segment's start, one
// process each — a resumed leg equals the uninterrupted run exactly, so the segments together are the chain, and CI runs
// them side by side (`--seg k --segs N`; the boundaries are the record's marks nearest to N equal shares of its ticks).
function segments(R, n) {
  const order = R.marks.slice().sort((x, y) => x.ticks - y.ticks);
  const cuts = [null];
  for (let k = 1; k < n; k++) {
    const goal = R.stop.ticks * k / n;
    const m = order.reduce((b, x) => (Math.abs(x.ticks - goal) < Math.abs((b ? b.ticks : Infinity) - goal) ? x : b), null);
    if (m && !cuts.includes(m) && (!cuts[cuts.length - 1] || m.ticks > cuts[cuts.length - 1].ticks)) cuts.push(m);
  }
  return cuts.map((c, i) => ({ from: c, to: cuts[i + 1] || null }));
}
async function partFull() {
  const R = record(), N = Number(a.segs || 1), SEG = a.seg === undefined ? null : Number(a.seg);
  const segs = segments(R, N);
  for (let k = 0; k < segs.length; k++) {
    if (SEG !== null && k !== SEG) continue;
    const { from, to } = segs[k];
    const t0 = from ? from.ticks : 0, t1 = to ? to.ticks : R.stop.ticks;
    // the marks still to come at the segment's start, behind a placeholder named after the start (run.mjs slices after it)
    const todo = R.marks.filter((m) => m.ticks > t0).map((m) => m.id);
    const L = fixture(LADDER), lf = path.join(TMP, `seg${k}-ladder.json`);
    fs.writeFileSync(lf, JSON.stringify({ marks: [...(from ? [{ id: from.id, name: 'start', predicate: 'false' }] : []), ...L.marks.filter((m) => todo.includes(m.id))] }));
    const r = await run('ptr', { ...(from ? { 'from-snapshot': `${WHOLE}/${from.id}.json` } : {}), profile: 'all', diff: 0.05, ticks: t1 - t0, ladder: lf, stall: 1e9, 'wall-ms': 6 * 3600e3 });
    const got = Object.fromEntries((r.ladder ? r.ladder.reached : []).map((m) => [m.id, m]));
    const exp = R.marks.filter((m) => m.ticks > t0 && m.ticks <= t1);
    const bad = exp.filter((m) => !got[m.id] || got[m.id].ticks !== m.ticks || got[m.id].hashGame !== m.hashGame);
    const extra = Object.keys(got).filter((id) => !exp.some((m) => m.id === id));
    const endOk = to ? true : r.hashGame === R.stop.hashGame;
    row({ gate: `WF segment ${k + 1}/${segs.length}: ${from ? `whole/${from.id}` : 'fresh'} → ${to ? to.id : `the cap (${R.stop.gameSeconds} game-s)`} at 0.05 = the record, every mark (ticks and hashGame)`, id: 'ptr',
      ok: !!r.ok && !bad.length && !extra.length && endOk, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 0.05, hash: r.hashGame,
      notes: `${exp.length} marks; differ ${bad.map((m) => `${m.id} (${got[m.id] ? got[m.id].ticks + '/' + got[m.id].hashGame : 'not reached'} vs ${m.ticks}/${m.hashGame})`).join(', ') || 'none'}; not in the record ${extra.join(', ') || 'none'}${to ? '' : `; stop ${r.hashGame} (record ${R.stop.hashGame})`} ${r.error || ''}` });
  }
}

// ---- page helpers ----------------------------------------------------------------------------------------------------
let openContext, pageLoadFrom, waitReady;
let server = null;
async function fresh(browser, { width = 1280, height = 900, mobile = false } = {}) {
  const { context } = await openContext(browser, { contextOptions: mobile ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { viewport: { width, height } } });
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
/** the speed controls and the ladder, the engine's loop held and every other timer live */
const ready = (page) => page.evaluate(async () => { await tmtLoader.fetchSpeed(); await tmtLoader.fetchLadder(); tmtLoader.speed.setSpeed(0); tmtLoader.resume(); return !!tmtLoader.ladder; });
const runFF = (page, spec) => page.evaluate(async (s) => { const t0 = performance.now(); const r = await tmtLoader.speed.run(s); return Object.assign({}, r, { wall: performance.now() - t0, hashGame: await tmtLoader.hashGame(), gp: Number(player.timePlayed) }); }, spec);
const qstate = (page) => page.evaluate((x) => { const q = tmtLoader.queues.status().queues.find((y) => y.id === x); return q ? { state: q.state, pc: q.pc, outcome: q.outcome } : null; }, H22Q);
async function reload(page) { await page.reload({ waitUntil: 'load' }); return waitReady(page); }

// THE CHECKPOINTS: [from, to] — the brief's four, as the 0.05 chain reached them (each `to` is the next mark reached
// after `from` in the record unless named)
function checkpoints(R) {
  const order = R.marks.slice().sort((x, y) => x.ticks - y.ticks), M = byMark(R);
  const next = (id) => { const i = order.findIndex((m) => m.id === id); return i >= 0 && i + 1 < order.length ? order.find((m, k) => k > i && m.ticks > order[i].ticks) : null; };
  const out = [];
  for (const [f, t] of [['M12', null], ['M22', null], ['M26', 'M29'], ['M28', 'M30']]) {
    if (!M[f]) continue;
    const to = t ? M[t] : next(f);
    if (to && to.ticks > M[f].ticks) out.push({ from: M[f], to });
  }
  return out;
}

// ---- P1 --------------------------------------------------------------------------------------------------------------
async function legCheckpoints(browser) {
  const R = record(), f = [], seen = [], rates = [];
  for (const c of checkpoints(R)) {
    const ref = c.to.ticks - c.from.ticks;
    const { context, page, errs, ld } = await fresh(browser);
    if (!ld.ready) { f.push(`${c.from.id}: did not load`); await context.close(); continue; }
    await atSnapshot(page, `${WHOLE}/${c.from.id}.json`);
    await ready(page);
    const capGs = Math.ceil(ref * 0.05 * 1.5 + 600);
    const r = await runFF(page, { mark: c.to.id, cap: capGs });
    const tps = Math.round(r.ticks * 1000 / r.wall);
    rates.push({ from: c.from.id, to: c.to.id, ticks: r.ticks, tps });
    const d = r.ticks - ref, rel = ref ? Math.abs(d) / ref : 0;
    // drift is allowed (the two V8s); the mark must be reached, and within 2 % of the harness's span
    if (r.why !== 'reached') f.push(`${c.from.id} → ${c.to.id}: ${r.why} after ${r.ticks} ticks (harness ${ref})`);
    else if (rel > 0.02) f.push(`${c.from.id} → ${c.to.id}: page ${r.ticks} ticks against the harness's ${ref} (${(rel * 100).toFixed(2)} %)`);
    if (errs.length) f.push(`${c.from.id}: page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`${c.from.id} → ${c.to.id}: page ${r.ticks} ticks, harness ${ref} (${d >= 0 ? '+' : ''}${d}, ${(rel * 100).toFixed(3)} %), ${tps} ticks/s, ${Math.round(r.wall / 1000)} s`);
    await context.close();
  }
  if (!seen.length) f.push('no checkpoint in the record');
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/whole-page-rates.json'), rates);
  row({ gate: 'P1 checkpoints: the checkpoint\'s save in the real page, faithful fast-forward until the next mark = the harness at 0.05 from the same save, by mark tick (within 2 %, drift stated)', id: 'ptr', ok: !f.length,
    notes: (f.length ? f.join('; ') + ' · ' : '') + seen.join(' · ') });
}

// ---- P2 --------------------------------------------------------------------------------------------------------------
async function legReload(browser) {
  const R = record(), M = byMark(R), f = [];
  if (!M.M26 || !M.M29) { row({ gate: 'P2 reload mid-queue', id: 'ptr', ok: false, notes: 'the record has no M26 → M29' }); return; }
  const ref = M.M29.ticks - M.M26.ticks;
  const { context, page, errs } = await fresh(browser);
  await atSnapshot(page, `${WHOLE}/M26.json`);
  await ready(page);
  // to the H22 queue running, then into its long wait
  const r1 = await runFF(page, { until: `tmtLoader.queues.status().queues.some(function (q) { return q.id === ${JSON.stringify(H22Q)} && q.state === 'running'; })`, cap: ref * 0.05 + 600 });
  const r2 = await runFF(page, { ticks: 200 });
  const before = await qstate(page);
  await page.evaluate(() => tmtLoader.save());
  const rec = await page.evaluate(() => tmtLoader.autoMemory.record());
  await reload(page);
  const after = await qstate(page);
  const mem = await page.evaluate(() => tmtLoader.autoMemory.status());
  const tlAfter = await page.evaluate(() => tmtLoader.timeline());
  await ready(page);
  const r3 = await runFF(page, { mark: 'M29', cap: ref * 0.05 + 3600 });
  const total = r1.ticks + r2.ticks + r3.ticks, d = total - ref, rel = Math.abs(d) / ref;
  const h22 = await page.evaluate(() => hasChallenge('h', 22));
  const checks = { running: !!before && before.state === 'running', recordHasQueue: !!rec && !!rec.runtime && !!rec.runtime.queues,
    restored: mem.state === 'restored', sameStep: !!after && !!before && after.state === 'running' && after.pc === before.pc,
    timelineSaysReload: tlAfter.events.length > 0 && tlAfter.events[0].kind === 'reload' && tlAfter.events.some((e) => e.kind === 'shipped' && e.what === 'start'),
    reachedM29: r3.why === 'reached' && h22, within2pc: rel <= 0.02, noErrors: !errs.length };
  row({ gate: 'P2 the page reloaded in the MIDDLE of the H22 queue: the queue resumes on the same step (the reload memory), the timeline says so, and the run reaches M29 (tick against the harness)', id: 'ptr', ok: Object.values(checks).every(Boolean),
    notes: `${ck(checks)} — queue ${JSON.stringify(before)} → ${JSON.stringify(after)}; memory ${mem.state}; ${r1.ticks} + ${r2.ticks} + ${r3.ticks} = ${total} ticks against the harness's ${ref} (${d >= 0 ? '+' : ''}${d}, ${(rel * 100).toFixed(3)} %); ${Math.round(total * 1000 / (r1.wall + r2.wall + r3.wall))} ticks/s ${errs.slice(0, 2).join(' | ')}` });
  await context.close();
}

// ---- Part timeline ---------------------------------------------------------------------------------------------------
// ONE page, from m28/QL6 (two stages in force, the H22 move starts there): the ladder fetched (marks), a player's queue,
// a fast-forward, a reload.
const MINE = { format: 'tmt-queue/1', id: 'whole-mine', version: 2, name: 'my little note', steps: [{ do: 'comment', text: 'hello from my queue' }] };
const FACT_ID = /\b(?:exits-challenge|zeroed-by|challenge-inputs|reads|price|production|multiplier-reads):|\b(?:ch|upg|buy|ms|reset|upgrades|buyables|challenges|clickables|toggles):[A-Za-z0-9_]+(?::\w+)?\b|\bplayer\.|\btmp\[|\bM\d\d\b/;
async function partTimeline(browser) {
  const shared = {};
  const { context, page, errs } = await fresh(browser);
  await atSnapshot(page, QL6);
  await ready(page);
  await page.evaluate((q) => tmtLoader.queues.load(q), MINE);
  const ff = await runFF(page, { ticks: 400 });
  const t1 = await page.evaluate(() => tmtLoader.timeline());
  if (want('kinds')) {
    const kinds = {}; for (const e of t1.events) kinds[e.kind + (e.what ? ':' + e.what : '')] = (kinds[e.kind + (e.what ? ':' + e.what : '')] || 0) + 1;
    // a shipped move ENDING and a stage switching OFF need game time; the record's own chain has them — read from the
    // queue's own end on this page: fast-forward until the H22 move is done
    const r = await runFF(page, { until: `tmtLoader.queues.status().queues.some(function (q) { return q.id === ${JSON.stringify(H22Q)} && q.state !== 'running' && q.state !== 'armed'; })`, cap: 3600 });
    // a stage switching OFF: the player switches one in force off (the Parts subtab's switch), then back on
    const offId = await page.evaluate(() => { const s = tmtLoader.stages().find((x) => x.active); if (!s) return null; tmtLoader.parts.setStageOff(s.id, true); return s.id; });
    await runFF(page, { ticks: 4 });
    if (offId) await page.evaluate((id) => tmtLoader.parts.setStageOff(id, false), offId);
    await runFF(page, { ticks: 4 });
    const t2 = await page.evaluate(() => tmtLoader.timeline());
    for (const e of t2.events) { const k = e.kind + (e.what ? ':' + e.what : '') + (e.kind === 'stage' ? (e.on ? ':on' : ':off') : ''); kinds[k + '#2'] = (kinds[k + '#2'] || 0) + 1; }
    const has = (p) => t2.events.some(p);
    const checks = { mark: has((e) => e.kind === 'mark'), stageOn: has((e) => e.kind === 'stage' && e.on), stageOff: has((e) => e.kind === 'stage' && !e.on && e.by === 'you' && /\(you switched it off\)$/.test(e.text)),
      shippedStart: has((e) => e.kind === 'shipped' && e.what === 'start'), shippedEnd: has((e) => e.kind === 'shipped' && e.what !== 'start'),
      mineStart: has((e) => e.kind === 'queue' && e.what === 'start'), mineEnd: has((e) => e.kind === 'queue' && e.what === 'end'), ff: has((e) => e.kind === 'ff' && e.why === 'reached'),
      ffReached: r.why === 'reached', countsAdd: Object.values(t2.counts).reduce((x, y) => x + y, 0) === t2.total };
    shared.t2 = t2;
    row({ gate: 'TL1 the timeline records every kind: a mark, a stage on and off, a shipped move starting and ending, the player\'s own queue starting and ending, a fast-forward', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${t2.total} events ${JSON.stringify(t2.counts)}; newest: ${t2.events.slice(0, 6).map((e) => `[${e.time}] ${e.text}`).join(' | ')}` });
  }
  if (want('reload')) {
    const tb = await page.evaluate(() => tmtLoader.timeline());
    await page.evaluate(() => tmtLoader.save());
    await reload(page);
    await ready(page);
    await runFF(page, { ticks: 40 });
    const ta = await page.evaluate(() => tmtLoader.timeline());
    const old = ta.events.filter((e) => e.kind !== 'reload').slice(-tb.events.length);
    const stageFirstAgain = ta.events.filter((e) => e.kind === 'stage' && e.tick > 0 && tb.events.every((x) => !(x.kind === 'stage' && x.id === e.id && x.on === e.on && x.at === e.at))).filter((e) => e.on && tb.events.some((x) => x.kind === 'stage' && x.id === e.id && x.on));
    const checks = { reloadEvent: ta.events.some((e) => e.kind === 'reload'), kept: tb.events.every((e) => ta.events.some((x) => x.kind === e.kind && x.at === e.at && x.text === e.text)),
      marksKept: Object.keys(tb.marks).every((k) => ta.marks[k] === tb.marks[k]), noStageTwice: !stageFirstAgain.length, total: ta.total >= tb.total + 1 };
    row({ gate: 'TL2 the timeline survives a reload with the automation\'s memory (every event kept, a reload event added, stages already in force not recorded twice)', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — before ${tb.total}, after ${ta.total}; newest after: ${ta.events.slice(0, 3).map((e) => e.text).join(' | ')}${stageFirstAgain.length ? `; twice: ${stageFirstAgain.map((e) => e.text).join(' | ')}` : ''}` });
    void old;
  }
  if (want('bounded')) {
    const t0 = await page.evaluate(() => tmtLoader.timeline());
    const n = t0.cap + 15 - t0.events.length > 0 ? t0.cap + 15 - t0.events.length : 15;
    await page.evaluate(async (k) => { for (let i = 0; i < k; i++) await tmtLoader.speed.run({ ticks: 1 }); }, n);
    const tb = await page.evaluate(() => tmtLoader.timeline());
    const bytes = await page.evaluate(() => { tmtLoader.save(); const r = tmtLoader.autoMemory.record(); return r && r.timeline ? JSON.stringify(r.timeline).length : 0; });
    const checks = { capped: tb.events.length === tb.cap, dropped: tb.dropped > 0, totalCounts: tb.total === t0.total + n, newestFirst: tb.events[0].kind === 'ff', storedBounded: bytes > 0 && bytes < 120000 };
    row({ gate: 'TL3 the timeline is bounded: the newest cap events kept, the dropped ones counted, the stored record small', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${n} fast-forwards added; ${tb.events.length} kept of ${tb.total} (cap ${tb.cap}, dropped ${tb.dropped}); stored ${bytes} bytes` });
  }
  if (want('words')) {
    const t = shared.t2 || await page.evaluate(() => tmtLoader.timeline());
    // the rendered rows, as the player reads them, developer details off
    await page.evaluate(() => { showTab(tmtLoader.auLayer); player.subtabs[tmtLoader.auLayer].mainTabs = 'Progress'; });
    await page.waitForSelector('.tmtl-timeline', { timeout: 15000 });
    const shown = await page.evaluate(() => [...document.querySelectorAll('.tmtl-timeline .tmtl-tl-row')].map((r) => r.textContent.trim()));
    const devShown = await page.evaluate(() => document.querySelectorAll('.tmtl-timeline .tmtl-tl-dev').length);
    const bad = [...t.events.map((e) => e.text), ...shown].filter((x) => FACT_ID.test(x));
    const checks = { rows: shown.length > 0, noIds: !bad.length, noDevByDefault: devShown === 0, everySentence: t.events.every((e) => /^[A-Z]/.test(e.text)) };
    row({ gate: 'TL4 plain words: no fact id, feature id, expression or ladder id in a player\'s timeline line', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — ${shown.length} rows shown${bad.length ? `; WITH IDS: ${bad.slice(0, 4).join(' | ')}` : ''}; e.g. ${shown.slice(0, 4).join(' | ')}` });
  }
  if (errs.length) row({ gate: 'TL page errors', id: 'ptr', ok: false, notes: errs.slice(0, 3).join(' | ') });
  await context.close();
  if (want('phone')) {
    const { context: c2, page: p2 } = await fresh(browser, { mobile: true });
    await atSnapshot(p2, QL6);
    await ready(p2);
    await runFF(p2, { ticks: 200 });
    await p2.evaluate(() => { showTab(tmtLoader.auLayer); player.subtabs[tmtLoader.auLayer].mainTabs = 'Progress'; });
    await p2.waitForSelector('.tmtl-timeline .tmtl-tl-row', { timeout: 15000 });
    const m = await p2.evaluate(() => {
      const root = document.querySelector('.tmtl-timeline'), r = root.getBoundingClientRect();
      const over = [...root.querySelectorAll('*')].filter((x) => x.getBoundingClientRect().right > window.innerWidth + 1).length;
      const nowrap = [...root.querySelectorAll('*')].concat([root]).filter((x) => getComputedStyle(x).whiteSpace === 'nowrap').length;
      return { right: r.right, vw: window.innerWidth, over, nowrap, scroll: document.documentElement.scrollWidth > window.innerWidth + 1, rows: root.querySelectorAll('.tmtl-tl-row').length };
    });
    await p2.locator('.tmtl-timeline').screenshot({ path: path.join(REPO, 'tools/harness/results/tmp/whole-timeline-phone.png') }).catch(() => {});
    const checks = { rows: m.rows > 0, inside: m.right <= m.vw + 1 && m.over === 0, noNowrap: m.nowrap === 0, noPageScroll: !m.scroll };
    row({ gate: 'TL5 the timeline fits a phone: at 390 px nothing past the edge, no nowrap, no page scroll', id: 'ptr', ok: Object.values(checks).every(Boolean), notes: `${ck(checks)} — ${JSON.stringify(m)}` });
    await c2.close();
  }
}

// ---- Part tpl --------------------------------------------------------------------------------------------------------
const PLAYER_ID = /\b(?:exits-challenge|zeroed-by|challenge-inputs|reads):|\b(?:ch|upg|buy|ms|reset):[a-z0-9]+:?\w*/;
async function partTpl() {
  const t = fixture(TABLE), shipped = (t.queues || []).find((q) => q.id === H22Q);
  const all = [[`${TABLE} queues[${H22Q}]`, shipped.queue], ...CATALOG.map((f) => [f, fixture(f)])];
  // A1
  {
    const bad = [], seen = [];
    for (const [f, q] of all) {
      const lines = [q.comment, ...q.steps.map((s) => s.comment)].filter(Boolean);
      const hits = lines.filter((x) => PLAYER_ID.test(x));
      // the facts a hold names (the ids the comments used to carry): each must be kept in a developer field
      const facts = ((q.source && q.source.facts) || []).filter((id) => /^(exits-challenge|zeroed-by):/.test(id));
      const devHas = facts.every((id) => [q.dev, ...q.steps.map((s) => s.dev)].some((d) => d && d.includes(id)));
      if (hits.length) bad.push(`${path.basename(f)}: ${hits[0].slice(0, 140)}`);
      if (!devHas) bad.push(`${path.basename(f)}: a fact id is in no step's dev`);
      seen.push(`${path.basename(f)}: “${String(q.comment).slice(0, 90)}…”`);
    }
    row({ gate: 'A1 the template-written queues speak in titles: no fact id in any comment, every fact id kept in a developer field (`dev`)', id: 'ptr', ok: !bad.length,
      notes: bad.length ? bad.join('; ') : seen.join(' · ') });
  }
  // A2 = shipq's T1
  {
    const st = await strategize('ptr', ['--from', QL6, '--goal', 'ch:h:22']);
    const v = st.v && st.v.results && st.v.results.find((r) => r.template === 'challenge-attempt');
    const checks = { ran: st.code === 0 && !!v && v.verdict === 'complete', emittedIsShipped: !!st.queue && JSON.stringify(st.queue) === JSON.stringify(shipped.queue) };
    row({ gate: 'A2 (T1) strategize from m28/QL6 under the shipped table emits EXACTLY the table\'s inline queue (its words included)', id: 'ptr', ok: Object.values(checks).every(Boolean),
      notes: `${ck(checks)} — verdict ${v && v.verdict}; comment “${st.queue && st.queue.comment}”` });
  }
  // B1
  {
    const conf = (q) => q.steps.filter((s) => s.do === 'wait' && s.timeout && (s.timeout.ticks !== undefined || Number(s.timeout.gs) <= 2));
    const bad = [];
    for (const [f, q] of all) {
      if (q.source.template === 'challenge-attempt') continue;
      const c = conf(q);
      if (!c.length || c.some((s) => s.timeout.ticks !== 2) || q.version !== 4) bad.push(`${path.basename(f)}: ${JSON.stringify(c.map((s) => s.timeout))} version ${q.version}`);
    }
    const src = fs.readFileSync(path.join(REPO, 'loader/tmt-templates.js'), 'utf8');
    const gs2 = (src.match(/timeout: \{ gs: 2 \}/g) || []).length;   // the challenge-attempt measurement plan keeps its two (converted at plan)
    row({ gate: 'B1 time-priced-purchase and reset-requirement confirm in TICKS ({ticks: 2}, version 4): the committed queues and the template source', id: 'ptr', ok: !bad.length && gs2 === 2,
      notes: `${bad.join('; ') || 'q23, rr-sg (m30), rr-sg (m31): {ticks: 2}, version 4'}; \`{ gs: 2 }\` left in the source: ${gs2} (challenge-attempt's measurement plan, converted to ticks by its plan)` });
  }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = GAMES();
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const marks = [];
  for (const g of fixture('tools/harness/ladder/index.json').games) for (const m of fixture(`tools/harness/ladder/${g}.json`).marks) marks.push(m.id);
  const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
  const cut = (src, from, to) => { const i = src.indexOf(from), j = src.indexOf(to, i); if (i < 0 || j < 0) throw new Error(`grep: marker ${from} not found`); return src.slice(i, j); };
  const srcs = [['loader/tmt-auto.js (the timeline)', cut(read('loader/tmt-auto.js'), '// ---- (whole-1) THE RUN TIMELINE', '// ---- (speed-1) THE AUTOMATION')],
    ['loader/tmt-templates.js (the words)', cut(read('loader/tmt-templates.js'), '// (whole-1) THE PLAYER\'S WORDS', 'function conditional(')],
    ['tools/harness/whole.mjs', read('tools/harness/whole.mjs')]];
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) {
      if (ids.includes(l)) hits.push(`${name}: game id '${l}'`);
      if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`);
      if (marks.includes(l)) hits.push(`${name}: ladder mark '${l}'`);
    }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game id, ptr layer id or ladder mark id in the code this slice added', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids, ${ptrLayers.length} layer ids and ${marks.length} mark ids checked` });
}

async function withBrowser(fn) {
  const { chromium } = await import('playwright');
  ({ openContext, pageLoadFrom, waitReady } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  try { await fn(browser); } finally { await browser.close(); server.stop(); }
}
const doPart = (p) => PART === p || (PART === 'all' && p !== 'full');
let expected = 0;
if (doPart('chain')) { await partChain(); expected += 2; }
if (doPart('full')) { await partFull(); expected += a.seg === undefined ? segments(record(), Number(a.segs || 1)).length : 1; }
if (doPart('page')) {
  await withBrowser(async (browser) => {
    if (want('checkpoints')) { try { await legCheckpoints(browser); } catch (e) { row({ gate: 'P1 checkpoints', id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 600)}` }); } expected++; }
    if (want('reload')) { try { await legReload(browser); } catch (e) { row({ gate: 'P2 reload mid-queue', id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 600)}` }); } expected++; }
  });
}
if (doPart('timeline')) {
  await withBrowser(async (browser) => { try { await partTimeline(browser); } catch (e) { row({ gate: 'TL', id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 600)}` }); } });
  expected += TL_ROWS.filter(want).length;
}
if (doPart('tpl')) { await partTpl(); expected += 3; }
if (doPart('grep')) { partGrep(); expected += 1; }
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT whole part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-whole-part${PART}-last.json`), { commit, dirty, rows });
if (!a['no-summary']) appendSection({ title: `whole-1 the whole-game run, the page checks, the timeline — part ${PART}`, commit, dirty, rows, slug: null,
  reading: 'chain = the record\'s early marks fresh and a resumed stretch, to the tick and hash; full = the whole chain again; page = the real page from the checkpoints to the next mark, and a reload in the middle of the H22 queue; timeline = every kind, a reload, the bound, plain words, a phone; tpl = titles in the templates\' comments, T1, ticks for the confirmations; grep = no game id.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
