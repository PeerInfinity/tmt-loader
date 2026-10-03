#!/usr/bin/env node
// speed-1 — THE SPEED CONTROLS AND THE AUTOMATION'S MEMORY ACROSS A RELOAD (docs/speed.md; docs/automation.md, "Memory
// across a reload"), driven through the PAGE (Playwright) and compared against the Node harness.
//
//   node tools/harness/gates-speed.mjs --part page|roster|grep|all [--only <row-key>[,…]] [--no-summary] [--no-write] [--assert]
//
// Part page
//   S1 faithful   a FAITHFUL fast-forward of N ticks on the page — the engine's loop HELD, every other timer live — lands
//                 on the SAME `hashGame` as the harness at `diff 0.05` for N ticks from the same save, automation on:
//                 ptr fresh (profile all), ptr from m28/QL6 (stages, the row cycle, the give-up records, a running
//                 shipped queue), Something Tree fresh (profile all), and Arc Tree (2.6) on the PLAIN page against
//                 `--no-automation`
//   S2 multiplier the speed changes game-time per second: ×1 ≈ 1 (the engine's own loop), ×2 ≈ 2, ×10 above ×2,
//                 max above ×2; PAUSE stops it (no game time passes) and the readout says so
//   S3 targets    each target type reaches and stops: an amount of game time (exact ticks), a condition (the same
//                 tick the harness's `--until` stops on), a ladder MARK (Something's S01, the harness's tick), the
//                 CAP (a condition that never holds), a THROWING condition (reads false, counted, said), the Stop
//                 button, the game ENDING and a tick that THROWS
//   S4 coarse     the approximate mode: its ticks are the chosen step, the panel and the outcome say "approximate", and
//                 the state differs from the faithful run of the same game time (expected — the label is the assertion)
//   S5 no-gap     returning to ×1 leaves no phantom offline gap: after a 3 s pause the engine's next ticks advance by
//                 real time, not 3 s more; a reload in the middle of a held loop credits no offline time
//   S6 memory     reload memory: mid-queue (m28/QL6 → the H22 queue running → save → reload: the runtime record is
//                 deep-equal, the queue is on its step; the control without the record restarts it), a `once` queue
//                 that ran stays done, the row cycle's memory survives, a DIFFERENT save discards it and the automation
//                 tab says so, an import discards it, a hard reset discards it; the cost per save
//   S7 phone      at 390 px (plain, `?navbar=1`, `?mobile=1`), the controls open and expanded: nothing past the edge,
//                 no page scroll, no `white-space: nowrap` inside them, every button reachable
//   S8 inert      G1: a page whose speed controls are never used requests no `loader/tmt-speed.js` and no ladder,
//                 stores no new key (a profile-`off` automation page's save writes no `automem`); speed is never in
//                 `player` (the key paths before and after every speed and a coarse run are the same)
//   S9 door       the options tab's "Speed controls" button opens them, and they come back open after a reload (the one
//                 declared key `tmt-loader:<id>:ui.speed`); closing them removes the key and returns to ×1
// Part roster
//   L1 loop       every game on the roster: the plain page's timer recorder holds exactly the interval(s) that call
//                 `gameLoop(` — the one the speed controls hold — at least one per game
// Part grep
//   X1 no game id, ptr layer id or ladder mark id in the code this slice added.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, GAMES, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'only', 'no-summary', 'no-write', 'assert', 'ids']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
if (!['page', 'roster', 'grep', 'all'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not page | roster | grep | all`); process.exit(2); }
const PAGE_ROWS = ['faithful', 'multiplier', 'targets', 'coarse', 'no-gap', 'memory', 'phone', 'inert', 'door'];
const ONLY = a.only ? String(a.only).split(',') : null;
if (ONLY) for (const o of ONLY) if (!PAGE_ROWS.includes(o)) { console.error(`REFUSED: --only ${o} is not one of ${PAGE_ROWS.join(', ')}`); process.exit(2); }
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1600)}`); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-speed-'));
const want = (k) => !ONLY || ONLY.includes(k);

// ⚠ This file is the ORACLE, and the games' ids are its data (the loader may not name them — part grep).
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json';
const H22Q = 'ca-ch-h-22';
const MEM_KEY = (id) => `tmt-loader:${id}:automem`;
const SPEED_KEY = (id) => `tmt-loader:${id}:ui.speed`;

// ---- the harness side ----------------------------------------------------------------------------------------------
function child(args, { timeoutMs = 3600e3 } = {}) {
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

// ---- page helpers ------------------------------------------------------------------------------------------------------
let openContext, openGame, pageLoadFrom, waitReady;
let server = null;
async function fresh(browser, { id = 'ptr', width = 1280, height = 900, managed = true, automation = true, profile = 'all', extra = '' } = {}) {
  const { context, stats } = await openContext(browser, { contextOptions: { viewport: { width, height } } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  const q = `index.html?mod=${id}${managed ? '&managed=1' : ''}${automation ? '&automation=1' : ''}${automation && profile ? `&profile=${profile}` : ''}${extra}`;
  const t0 = Date.now();
  await page.goto(new URL(q, server.url).href, { waitUntil: 'load' });
  const ld = await waitReady(page, t0);
  return { context, page, stats, errs, ld };
}
const speedUp = (page) => page.evaluate(async () => { const S = await tmtLoader.fetchSpeed(); return !!S; });
/** the engine's loop HELD and every other timer live: the faithful drive with the real page around it */
const holdAndLive = (page) => page.evaluate(() => { tmtLoader.speed.setSpeed(0); tmtLoader.resume(); return tmtLoader.timers.list(); });
const runFF = (page, spec) => page.evaluate(async (s) => { const t0 = performance.now(); const r = await tmtLoader.speed.run(s); return Object.assign({}, r, { wall: performance.now() - t0, hashGame: await tmtLoader.hashGame(), T: tmtLoader.ticks }); }, spec);
async function atSnapshot(page, file) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, file), 'utf8'));
  await pageLoadFrom(page, s.player);
  await page.evaluate(() => tmtLoader.pause());
  await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
  return s;
}
const raw = (page, k) => page.evaluate((x) => tmtLoader.storage.raw.getItem.call(localStorage, x), k);
const allKeys = (page) => page.evaluate(() => { const r = tmtLoader.storage.raw, o = []; for (let i = 0; i < r.length.call(localStorage); i++) o.push(r.key.call(localStorage, i)); return o.sort(); });
const qstate = (page, id = H22Q) => page.evaluate((x) => { const q = tmtLoader.queues.status().queues.find((y) => y.id === x); return q ? { state: q.state, pc: q.pc, step: q.step } : null; }, id);
async function reload(page) { await page.reload({ waitUntil: 'load' }); return waitReady(page); }

// ---- S1 ---------------------------------------------------------------------------------------------------------------
async function legFaithful(browser) {
  const f = [], seen = [];
  // ⚠ FROM A DEEP SAVE THE PAGE AND NODE ALREADY DIFFER, WITHOUT THE SPEED CONTROLS: m28/QL6 + 10 plain `tick(0.05)`s
  // lands on `points` 2.8540956329795613e988 in Node and …617e988 in Chromium — the last bits of one float, from two V8s'
  // Math. So the deep case compares the fast-forward with the PAGE's own tick loop (the page runner's drive, the same
  // browser), and carries the Node control in its notes; the fresh cases compare with Node directly.
  const cases = [
    { name: 'ptr fresh, profile all', id: 'ptr', n: 1500, flags: { profile: 'all', diff: 0.05, ticks: 1500 } },
    { name: 'ptr m28/QL6 (stages, cycle, give-up, the H22 queue)', id: 'ptr', n: 600, snap: QL6, flags: { 'from-snapshot': QL6, profile: 'all', diff: 0.05, ticks: 600 }, pageRef: true },
    { name: 'something fresh, profile all', id: 'something', n: 1500, flags: { profile: 'all', diff: 0.05, ticks: 1500 } },
    { name: 'arctree (2.6) plain page', id: 'arctree', n: 1500, plain: true, flags: { 'no-automation': true, diff: 0.05, ticks: 1500 } },
  ];
  const harness = await Promise.all(cases.map((c) => run(c.id, c.flags)));
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i], H = harness[i], hH = H.hashGame || H.hash;   // the plain page's harness reports `hash` (no au layer)
    const { context, page, errs, ld } = await fresh(browser, { id: c.id, automation: !c.plain, profile: c.plain ? null : 'all' });
    if (!ld.ready) { f.push(`${c.name}: did not load ${JSON.stringify(ld.error)}`); await context.close(); continue; }
    if (c.snap) await atSnapshot(page, c.snap);
    await speedUp(page);
    const tl = await holdAndLive(page);
    const r = await runFF(page, { ticks: c.n });
    const st = await page.evaluate(() => tmtLoader.speed.status());
    const live = tl.filter((t) => t.running).length, heldN = tl.filter((t) => t.held).length;
    let ref = hH, refName = 'the harness (Node)';
    if (c.pageRef) {
      // the page's own drive: the same save, the same restore, N × tmtLoader.tick(0.05) in one evaluate (page.mjs's loop)
      const b = await fresh(browser, { id: c.id });
      await atSnapshot(b.page, c.snap);
      ref = await b.page.evaluate((n) => { for (let k = 0; k < n; k++) tmtLoader.tick(0.05); return tmtLoader.hashGame(); }, c.n);
      refName = 'the page\'s own tick loop';
      await b.context.close();
    }
    if (!H.ok) f.push(`${c.name}: the harness run failed ${H.error || ''}`);
    if (r.why !== 'reached' || r.ticks !== c.n) f.push(`${c.name}: the fast-forward ${JSON.stringify({ why: r.why, ticks: r.ticks })}`);
    if (r.hashGame !== ref) f.push(`${c.name}: page ${r.hashGame} ≠ ${refName} ${ref} after ${c.n} ticks at 0.05`);
    if (heldN !== 1 || live < 2) f.push(`${c.name}: timers during the drive ${JSON.stringify(tl)}`);
    if (st.loop.how !== 'found') f.push(`${c.name}: the game loop was not found (${st.loop.how})`);
    if (errs.length) f.push(`${c.name}: page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`${c.name}: ${c.n} ticks → ${r.hashGame} = ${refName} ${ref}${c.pageRef ? ` (Node control: ${hH}, the V8 float difference above)` : ''} (${Math.round(c.n * 1000 / r.wall)} ticks/s on the page, ${live} timers live, 1 held)`);
    await context.close();
  }
  row({ gate: 'S1 faithful: a faithful fast-forward of N ticks on the page = the harness at diff 0.05 for N ticks, by hashGame, automation on (the game loop held, every other timer live)', id: 'ptr+something+arctree', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

// ---- S2 ---------------------------------------------------------------------------------------------------------------
async function legMultiplier(browser) {
  const f = [], seen = {};
  const { context, page, errs } = await fresh(browser, { id: 'something', managed: false, profile: 'off' });
  await speedUp(page);
  // game time per real second, from the game's own clock (player.timePlayed), over a window of real time
  const rate = (sp, ms = 2500) => page.evaluate(async ([s, w]) => {
    tmtLoader.speed.setSpeed(s);
    await new Promise((r) => setTimeout(r, 400));          // settle
    const g0 = Number(player.timePlayed), t0 = performance.now();
    await new Promise((r) => setTimeout(r, w));
    const g1 = Number(player.timePlayed), t1 = performance.now();
    const st = tmtLoader.speed.status();
    return { gsps: (g1 - g0) * 1000 / (t1 - t0), readout: document.querySelector('#tmt-speed .tmts-read') ? document.querySelector('#tmt-speed .tmts-read').textContent : null, held: st.held, meter: st.gameSecondsPerSec };
  }, [sp, ms]);
  await page.evaluate(() => tmtLoader.speed.open(false));
  for (const s of [1, 2, 10, 'max', 0, 1]) seen[String(s) + (seen[String(s)] ? 'b' : '')] = await rate(s);
  const r1 = seen['1'], r2 = seen['2'], r10 = seen['10'], rm = seen.max, r0 = seen['0'], r1b = seen['1b'];
  if (!(r1.gsps > 0.8 && r1.gsps < 1.25) || r1.held) f.push(`×1 ${JSON.stringify(r1)}`);
  if (!(r2.gsps > 1.6 && r2.gsps < 2.3) || !r2.held) f.push(`×2 ${JSON.stringify(r2)}`);
  if (!(r10.gsps > r2.gsps * 1.5 && r10.gsps < 10.6)) f.push(`×10 ${JSON.stringify(r10)}`);
  if (!(rm.gsps > r2.gsps * 1.5)) f.push(`max ${JSON.stringify(rm)}`);
  if (r0.gsps !== 0 || !/Paused/.test(r0.readout || '')) f.push(`pause ${JSON.stringify(r0)}`);
  if (!(r1b.gsps > 0.8 && r1b.gsps < 1.25) || r1b.held) f.push(`back to ×1 ${JSON.stringify(r1b)}`);
  if (errs.length) f.push(`page errors ${errs.slice(0, 2).join(' | ')}`);
  row({ gate: 'S2 multiplier: the speed changes game-time per second (×1 the engine\'s own loop, ×2, ×10, max), pause stops it, ×1 again is the engine\'s loop', id: 'something', ok: !f.length,
    notes: f.length ? f.join('; ') : ['1', '2', '10', 'max', '0', '1b'].map((k) => `${k}: ${seen[k].gsps.toFixed(2)} game-s/s`).join(' · ') + ` · readout at ×10: "${(r10.readout || '').slice(0, 90)}"` });
  await context.close();
}

// ---- S3 ---------------------------------------------------------------------------------------------------------------
async function legTargets(browser) {
  const f = [], seen = [];
  // (a) an amount of game time; (b) a condition — the harness's `--until` tick; (c) the cap; (d) a throwing condition;
  // (e) the stop button; (f) the game ending; (g) a tick that throws
  const COND = 'player.points.gte(1000)';
  const [Hc, Hm] = await Promise.all([
    run('ptr', { profile: 'all', diff: 0.05, ticks: 20000, until: COND }),
    run('something', { profile: 'all', diff: 0.05, ticks: 20000, until: "player.fundamental.total.gte(1)" }),
  ]);
  {
    const { context, page, errs } = await fresh(browser, { id: 'ptr' });
    await speedUp(page);
    await page.evaluate(() => tmtLoader.speed.open(false));
    const g = await runFF(page, { gs: 7.5 });
    if (g.why !== 'reached' || g.ticks !== 150 || Math.abs(g.gs - 7.5) > 1e-6) f.push(`(a) amount ${JSON.stringify(g)}`);
    else seen.push(`(a) 7.5 game-s = ${g.ticks} ticks`);
    const c = await runFF(page, { until: COND, cap: 3600 });
    const cTicks = (g.T + c.ticks);
    // the TICK is Node's (the harness's `--until`); the STATE is compared with the page's own drive loop to the same
    // condition — past ~3,000 ticks Node and Chromium differ in the last digit of `points` (S1's note), and this
    // condition lands at ~4,500
    const ref = await (async () => { const b = await fresh(browser, { id: 'ptr' }); const o = await b.page.evaluate((src) => { const fn = new Function('return (' + src + ')'); for (let k = 0; k < 20000; k++) { tmtLoader.tick(0.05); if (fn()) break; } return tmtLoader.hashGame().then((h) => ({ t: tmtLoader.ticks, h })); }, COND); await b.context.close(); return o; })();
    if (c.why !== 'reached' || cTicks !== Hc.ticks || cTicks !== ref.t || c.hashGame !== ref.h) f.push(`(b) condition: page ${c.why} at tick ${cTicks} ${c.hashGame}; harness ${Hc.until && Hc.until.met} at ${Hc.ticks}; the page's own loop at ${ref.t} ${ref.h}`);
    else seen.push(`(b) ${COND} reached at tick ${cTicks} = the harness's ${Hc.ticks}, ${c.hashGame} = the page's own loop`);
    const al = await runFF(page, { until: COND, cap: 10 });
    if (al.why !== 'already' || al.ticks !== 0) f.push(`(b′) an already-true condition ran ${JSON.stringify(al)}`);
    const cap = await runFF(page, { until: 'player.points.lt(0)', cap: 2 });
    if (cap.why !== 'cap' || cap.ticks !== 40) f.push(`(c) cap ${JSON.stringify(cap)}`);
    else seen.push(`(c) never-true stopped at the cap: ${cap.ticks} ticks = 2 game-s`);
    const th = await runFF(page, { until: 'noSuchGlobal.x > 1', cap: 1 });
    if (th.why !== 'cap' || th.throws !== 21 || !/threw 21 times/.test(th.text) || !/read as false/.test(th.text)) f.push(`(d) throwing condition ${JSON.stringify(th)}`);
    else seen.push(`(d) a throwing condition read false ${th.throws}× and said so`);
    // (e) the Stop button, pressed in the panel while a long run is going
    await page.evaluate(() => { tmtLoader.speed.showMore(true); window.__ff = tmtLoader.speed.run({ gs: 1e6 }); });
    await page.waitForTimeout(600);
    const prog = await page.evaluate(() => ({ bar: !document.querySelector('#tmt-speed .tmts-bar').hasAttribute('hidden'), stop: !document.querySelector('#tmt-speed .tmts-stop').hasAttribute('hidden'), s: tmtLoader.speed.status().target }));
    await page.click('#tmt-speed .tmts-stop');
    const st = await page.evaluate(async () => { const r = await window.__ff; return Object.assign({}, r, { held: tmtLoader.speed.status().held, last: document.querySelector('#tmt-speed .tmts-last').textContent }); });
    if (!prog.bar || !prog.stop || !prog.s || !(prog.s.ticks > 0) || st.why !== 'stopped' || st.held || !/Stopped by you/.test(st.last)) f.push(`(e) stop ${JSON.stringify({ prog, st })}`);
    else seen.push(`(e) Stop pressed after ${st.ticks} ticks: "${st.last.slice(0, 60)}"`);
    // (f) the game ENDING: the engine's own flag (2.2.1 keeps it in a global `gameEnded`)
    const en = await page.evaluate(async () => { window.gameEnded = true; const r = await tmtLoader.speed.run({ gs: 100 }); const r2 = await (async () => { window.gameEnded = false; return null; })(); return r; });
    if (en.why !== 'ended') f.push(`(f) the game ending ${JSON.stringify(en)}`);
    const en2 = await page.evaluate(async () => { const p = tmtLoader.speed.run({ gs: 100 }); await new Promise((r) => setTimeout(r, 300)); window.gameEnded = true; const r = await p; window.gameEnded = false; return r; });
    if (en2.why !== 'ended' || !(en2.ticks > 0)) f.push(`(f′) the game ending mid-run ${JSON.stringify(en2)}`);
    else seen.push(`(f) the game ending stopped it (before: 0 ticks; mid-run: after ${en2.ticks})`);
    // (g) a tick that throws: the run stops, says so, and the game is back on its own loop
    const er = await page.evaluate(async () => { const gl = window.gameLoop; let k = 0; window.gameLoop = function (d) { if (++k > 5) throw new Error('boom'); return gl(d); }; const r = await tmtLoader.speed.run({ gs: 100 }); window.gameLoop = gl; return Object.assign({}, r, { held: tmtLoader.speed.status().held }); });
    if (er.why !== 'error' || er.ticks !== 5 || er.held || !/boom/.test(er.text)) f.push(`(g) a throwing tick ${JSON.stringify(er)}`);
    else seen.push(`(g) a tick that threw stopped the run after ${er.ticks} ticks`);
    if (errs.length) f.push(`ptr page errors ${errs.slice(0, 2).join(' | ')}`);
    await context.close();
  }
  {
    // (h) a ladder MARK: Something Tree's S01 — the same tick as the harness's `--until <S01's predicate>`
    const { context, page, errs, stats } = await fresh(browser, { id: 'something' });
    await speedUp(page);
    await page.evaluate(() => { tmtLoader.speed.open(false); tmtLoader.speed.showMore(true); });
    await page.waitForFunction(() => { const r = document.querySelector('#tmt-speed .tmts-markrow'); return r && !r.hasAttribute('hidden'); }, null, { timeout: 15000 });
    const opts = await page.evaluate(() => Array.from(document.querySelectorAll('#tmt-speed .tmts-mark option')).map((o) => o.value));
    await page.selectOption('#tmt-speed .tmts-mark', 'S01');
    const p = page.evaluate(() => new Promise((res) => { const chk = () => { const s = tmtLoader.speed.status(); if (!s.target && s.last && s.last.kind === 'mark') res(s.last); else setTimeout(chk, 50); }; chk(); }));
    await page.click('#tmt-speed .tmts-go-mark');
    const m = await p;
    const hg = await page.evaluate(() => tmtLoader.hashGame());
    const asked = stats.of(page).urls.filter((u) => /tools\/harness\/ladder\//.test(u)).map((u) => u.replace(/^.*tools\/harness\//, ''));
    if (m.why !== 'reached' || m.ticks !== Hm.ticks || hg !== Hm.hashGame) f.push(`(h) mark S01: page ${m.why} ${m.ticks} ${hg}, harness ${Hm.ticks} ${Hm.hashGame}`);
    else seen.push(`(h) the mark S01 reached at tick ${m.ticks} = the harness's, ${opts.length} marks offered, asked ${asked.join(', ')}`);
    if (errs.length) f.push(`something page errors ${errs.slice(0, 2).join(' | ')}`);
    await context.close();
  }
  row({ gate: 'S3 targets: an amount (exact ticks), a condition and a ladder mark (the harness\'s --until tick), the cap, a throwing condition (read false, said), Stop, the game ending, a throwing tick', id: 'ptr+something', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

// ---- S4 ---------------------------------------------------------------------------------------------------------------
async function legCoarse(browser) {
  const f = [];
  const { context, page, errs } = await fresh(browser, { id: 'ptr' });
  await speedUp(page);
  await page.evaluate(() => { tmtLoader.speed.open(false); tmtLoader.speed.showMore(true); });
  await page.click('#tmt-speed #tmt-speed-coarse');
  await page.selectOption('#tmt-speed select[aria-label="Approximate tick"]', '1');
  await page.evaluate(() => tmtLoader.speed.setMode('coarse', 1));
  const ui = await page.evaluate(() => ({ status: tmtLoader.speed.status(), read: document.querySelector('#tmt-speed .tmts-read').textContent, label: document.querySelector('label[for="tmt-speed-coarse"]').textContent }));
  const c = await runFF(page, { gs: 100 });
  const last = await page.evaluate(() => document.querySelector('#tmt-speed .tmts-last').textContent);
  await context.close();
  const b = await fresh(browser, { id: 'ptr' });
  await speedUp(b.page);
  const fa = await runFF(b.page, { gs: 100 });
  await b.context.close();
  if (!ui.status.approximate || ui.status.step !== 1) f.push(`status ${JSON.stringify(ui.status)}`);
  if (!/approximate/.test(ui.read) || !/differ from normal play/.test(ui.read) || !/differ from normal play/.test(ui.label)) f.push(`labels: "${ui.read}" / "${ui.label}"`);
  if (c.why !== 'reached' || c.ticks !== 100 || c.mode !== 'coarse' || !/Approximate/.test(c.text) || !/differ from normal play/.test(last)) f.push(`the coarse run ${JSON.stringify(c)} / "${last}"`);
  if (fa.ticks !== 2000 || fa.hashGame === c.hashGame) f.push(`faithful ${fa.ticks} ${fa.hashGame} vs coarse ${c.hashGame} — expected to differ`);
  if (errs.length) f.push(`page errors ${errs.slice(0, 2).join(' | ')}`);
  row({ gate: 'S4 coarse: approximate ticks are labelled approximate everywhere (readout, choice, outcome) and land on a different state than the faithful run (expected)', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `100 game-s: coarse 100 ticks of 1 s → ${c.hashGame}; faithful 2000 ticks → ${fa.hashGame}; readout "${ui.read.slice(0, 80)}"` });
}

// ---- S5 ---------------------------------------------------------------------------------------------------------------
async function legNoGap(browser) {
  const f = [];
  const { context, page, errs } = await fresh(browser, { id: 'ptr', managed: false, profile: 'off' });
  await speedUp(page);
  // (a) a 3-second pause, then ×1: the engine's own loop resumes from NOW
  // the ENGINE's own diffs, observed: its loop calls `gameLoop` by its bare name, so a pass-through records each diff
  const a1 = await page.evaluate(async () => {
    const gl = window.gameLoop, diffs = [];
    window.gameLoop = function (d) { diffs.push(d); return gl.apply(this, arguments); };
    try {
      await new Promise((r) => setTimeout(r, 300));
      const before = diffs.length;
      tmtLoader.speed.setSpeed(0);
      const n0 = diffs.length;
      await new Promise((r) => setTimeout(r, 3000));
      const during = diffs.length - n0, gap = Date.now() - player.time;
      tmtLoader.speed.setSpeed(1);
      const n1 = diffs.length;
      await new Promise((r) => setTimeout(r, 600));
      const after = diffs.slice(n1);
      return { before, during, gapWhileHeld: gap, after: after.length, firstAfter: after[0], maxAfter: Math.max(...after), sumAfter: after.reduce((x, y) => x + y, 0) };
    } finally { window.gameLoop = gl; }
  });
  if (!(a1.before > 2)) f.push(`the engine's loop was not running before the pause (${a1.before} calls)`);
  if (a1.during !== 0) f.push(`the pause let the engine tick ${a1.during} times`);
  if (a1.gapWhileHeld > 600) f.push(`player.time was ${a1.gapWhileHeld} ms stale while held`);
  if (!(a1.after > 2) || !(a1.maxAfter < 0.5) || !(a1.sumAfter < 1)) f.push(`back at ×1 the engine's diffs: first ${a1.firstAfter}, max ${a1.maxAfter}, sum ${a1.sumAfter} over ${a1.after} ticks (a phantom gap is a diff of ~3 s)`);
  // (b) a reload in the middle of a held loop credits no offline time
  await page.evaluate(() => { tmtLoader.speed.setSpeed(0); });
  await page.waitForTimeout(3000);
  await page.evaluate(() => tmtLoader.save());
  // reloaded MANAGED (paused at onload), so the offline credit `load()` computed is read before the engine spends any
  await page.goto(new URL('index.html?mod=ptr&managed=1&automation=1&profile=off', server.url).href, { waitUntil: 'load' });
  await waitReady(page);
  const b1 = await page.evaluate(() => ({ remain: player.offTime ? Number(player.offTime.remain) : 0 }));
  if (!(b1.remain < 1)) f.push(`after a reload from a held loop, ${b1.remain.toFixed(2)} s of offline time was credited`);
  if (errs.length) f.push(`page errors ${errs.slice(0, 2).join(' | ')}`);
  row({ gate: 'S5 no phantom gap: returning to ×1 after 3 s held advances by real time only; a reload from a held loop credits no offline time; offline catch-up untouched', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `paused 3 s: 0 engine ticks; player.time ≤ ${a1.gapWhileHeld} ms stale while held; ×1 again: the engine's first diff ${a1.firstAfter.toFixed(3)} s, max ${a1.maxAfter.toFixed(3)} s over ${a1.after} ticks; reload from held: ${b1.remain.toFixed(3)} s offline` });
}

// ---- S6 ---------------------------------------------------------------------------------------------------------------
async function legMemory(browser) {
  const f = [], seen = [];
  const K = MEM_KEY('ptr');
  const rt = (page) => page.evaluate(() => JSON.stringify(tmtLoader.runtimeState()));
  // (a) mid-queue: QL6, the H22 queue running, save, reload
  {
    const { context, page, errs } = await fresh(browser, { id: 'ptr' });
    await atSnapshot(page, QL6);
    await page.evaluate(() => tmtLoader.tick(0.05, 60));
    const q0 = await qstate(page);
    const costs = [];
    for (let i = 0; i < 20; i++) costs.push(await page.evaluate(() => { tmtLoader.save(); return tmtLoader.autoMemory.status().lastMs; }));
    const r0 = await rt(page);
    const rec = JSON.parse(await raw(page, K));
    const keys0 = await allKeys(page);
    await reload(page);
    const st = await page.evaluate(() => tmtLoader.autoMemory.status());
    const r1 = await rt(page), q1 = await qstate(page);
    const cy0 = JSON.parse(r0).cycle, cy1 = JSON.parse(r1).cycle;
    if (q0.state !== 'running' || q1.state !== 'running' || q1.pc !== q0.pc) f.push(`(a) the H22 queue ${JSON.stringify(q0)} → ${JSON.stringify(q1)}`);
    if (r1 !== r0) f.push('(a) the runtime record after the reload is not the one before it');
    if (st.state !== 'restored') f.push(`(a) memory ${JSON.stringify(st)}`);
    if (!cy0 || JSON.stringify(cy0) !== JSON.stringify(cy1)) f.push('(c) the row cycle\'s memory did not survive');
    if (!rec || rec.format !== 'tmt-automem/1' || !rec.fp || !rec.runtime) f.push(`(a) the record ${JSON.stringify(rec).slice(0, 200)}`);
    if (keys0.filter((k) => !k.startsWith('tmt-loader:ptr:')).length) f.push(`(a) keys outside the namespace ${keys0}`);
    costs.sort((x, y) => x - y);
    const med = costs[10], max = costs[19];
    if (!(med < 20)) f.push(`(cost) median ${med} ms per save`);
    seen.push(`(a) H22 queue on step ${q1.pc + 1} (running) after the reload, the runtime record deep-equal (${r0.length} bytes), the row cycle's memory equal (round ${Object.values(cy1 || {})[0] && Object.values(cy1)[0].round}); cost per save median ${med} ms, max ${max} ms, record ${rec.runtime ? JSON.stringify(rec).length : 0} bytes`);
    // (a′) the CONTROL: the same reload without the record — the queue is NOT where it was
    await page.evaluate((k) => tmtLoader.storage.raw.removeItem.call(localStorage, k), K);
    await reload(page);
    const qc = await qstate(page);
    const stc = await page.evaluate(() => tmtLoader.autoMemory.status());
    if (qc && qc.state === 'running' && qc.pc === q0.pc) f.push(`(a′) the control kept the queue's step without the record: ${JSON.stringify(qc)}`);
    else seen.push(`(a′) control without the record: the queue is ${qc ? qc.state + ' at step ' + (qc.pc + 1) : 'absent'} (memory ${stc.state})`);
    // (d) a DIFFERENT save: the game's save moves on behind the record (the engine's own save, unwrapped — another tab)
    await atSnapshot(page, QL6);
    await page.evaluate(() => { tmtLoader.tick(0.05, 30); tmtLoader.save(); tmtLoader.tick(0.05, 30); save.tmtLoaderAutomem(); });
    await reload(page);
    const d = await page.evaluate(() => ({ st: tmtLoader.autoMemory.status(), rec: tmtLoader.autoMemory.record(), q: tmtLoader.queues.status().queues.map((x) => x.id + ':' + x.state) }));
    await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Simple'; updateTemp(); });
    await page.waitForTimeout(300);
    const shown = await page.evaluate(() => { const n = document.querySelector('.tmtl-automem-notice'); return n ? n.textContent : null; });
    if (d.st.state !== 'discarded' || d.st.why !== 'other' || d.rec !== null) f.push(`(d) a different save: ${JSON.stringify(d)}`);
    if (!shown || !/belonged to a different save; it starts fresh/.test(shown)) f.push(`(d) the automation tab says "${shown}"`);
    else seen.push(`(d) a different save: discarded, the record removed, the tab says "${shown}"`);
    await page.screenshot({ path: path.join(TMP, 'memory-discarded.png') });
    if (errs.length) f.push(`(a) page errors ${errs.slice(0, 2).join(' | ')}`);
    await context.close();
  }
  // (b) a `once` queue that ran stays done: the H22 queue run to its end by the harness (diff 1), then save + reload
  {
    const dir = path.join(TMP, 'snap');
    const H = await run('ptr', { 'from-snapshot': QL6, profile: 'all', diff: 1, ticks: 3000,
      until: `(function(){var q=tmtLoader.queues.status().queues.filter(function(x){return x.id==='${H22Q}'})[0];return q&&q.state==='done'})()`,
      'stop-snapshot': dir, 'stop-snapshot-name': 'DONE' });
    const snapFile = path.relative(REPO, path.join(dir, 'DONE.json'));
    if (!H.ok || !fs.existsSync(path.join(dir, 'DONE.json'))) f.push(`(b) the harness could not run the queue to its end ${H.error || ''}`);
    else {
      const { context, page, errs } = await fresh(browser, { id: 'ptr' });
      await atSnapshot(page, snapFile);
      await page.evaluate(() => tmtLoader.tick(0.05, 20));
      const b0 = await qstate(page);
      await page.evaluate(() => tmtLoader.save());
      await reload(page);
      const b1 = await qstate(page);
      await page.evaluate(() => tmtLoader.tick(0.05, 40));
      const b2 = await qstate(page);
      // the control: no record → the table re-creates its queue, and its condition still holds
      await page.evaluate((k) => tmtLoader.storage.raw.removeItem.call(localStorage, k), K);
      await reload(page);
      await page.evaluate(() => tmtLoader.tick(0.05, 40));
      const bc = await qstate(page);
      if (b0.state !== 'done' || b1.state !== 'done' || b2.state !== 'done') f.push(`(b) the once queue ${JSON.stringify([b0, b1, b2])}`);
      if (bc.state === 'done') f.push(`(b′) the control (no record) also left it done — the row proves nothing: ${JSON.stringify(bc)}`);
      else seen.push(`(b) the once queue stays done across the reload and 40 ticks (control without the record: ${bc.state} at step ${bc.pc + 1})`);
      if (errs.length) f.push(`(b) page errors ${errs.slice(0, 2).join(' | ')}`);
      await context.close();
    }
  }
  // (e) an IMPORT discards it; (f) a HARD RESET discards it
  {
    const { context, page, errs } = await fresh(browser, { id: 'ptr' });
    await atSnapshot(page, QL6);
    await page.evaluate(() => { tmtLoader.tick(0.05, 30); tmtLoader.save(); });
    const had = await raw(page, K);
    const s = JSON.parse(fs.readFileSync(path.join(REPO, QL6), 'utf8'));
    await pageLoadFrom(page, s.player);              // the game's own import, of the SAME save — and still discarded
    const e = await page.evaluate(() => ({ st: tmtLoader.autoMemory.status(), rec: tmtLoader.autoMemory.record() }));
    if (!had || e.st.state !== 'discarded' || e.st.why !== 'import' || e.rec !== null) f.push(`(e) import ${JSON.stringify(e)}`);
    else seen.push(`(e) an import discarded it: "${e.st.notice}"`);
    await page.evaluate((rt0) => { tmtLoader.restoreRuntime(rt0); tmtLoader.tick(0.05, 30); tmtLoader.save(); }, s.runtime.auto);
    const had2 = await raw(page, K);
    page.once('dialog', (dlg) => dlg.accept());
    const nav = page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => { hardReset(); }).catch(() => {});
    await nav; await waitReady(page);
    const r = await page.evaluate(() => ({ st: tmtLoader.autoMemory.status(), rec: tmtLoader.autoMemory.record(), pts: String(player.points) }));
    if (!had2 || r.st.state !== 'discarded' || r.st.why !== 'reset' || r.rec !== null) f.push(`(f) hard reset ${JSON.stringify(r)}`);
    else seen.push(`(f) a hard reset discarded it: "${r.st.notice}"`);
    if (errs.length) f.push(`(e) page errors ${errs.slice(0, 2).join(' | ')}`);
    await context.close();
  }
  row({ gate: 'S6 memory: resumes mid-queue (control restarts), a once queue stays done, the row cycle survives, a different save / an import / a hard reset discard it and the tab says so; cost per save', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

// ---- S7 ---------------------------------------------------------------------------------------------------------------
const MEASURE = `(() => {
  const root = document.getElementById('tmt-speed');
  if (!root) return { none: true };
  const vw = document.documentElement.clientWidth, past = [], nowrap = [];
  const els = [root, ...root.querySelectorAll('*')];
  for (const e of els) {
    const r = e.getBoundingClientRect();
    if (r.width && (r.right > vw + 0.5 || r.left < -0.5)) past.push((e.className || e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    if (getComputedStyle(e).whiteSpace === 'nowrap' && e.tagName !== 'OPTION') nowrap.push(e.className || e.tagName);   // an <option> is the browser's own nowrap, drawn in its own popup
  }
  const btns = [...root.querySelectorAll('button')].filter((b) => b.offsetParent !== null);
  const hidden = btns.filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > innerHeight + 0.5 || r.top < -0.5; }).length;
  return { n: els.length, vw, past, nowrap, scrollW: document.documentElement.scrollWidth, rootW: Math.round(root.getBoundingClientRect().width), buttons: btns.length, offscreen: hidden };
})()`;
async function legPhone(browser) {
  const f = [], seen = [];
  for (const [tag, extra] of [['plain', ''], ['navbar', '&navbar=1'], ['mobile', '&mobile=1']]) {
    const { context, page, errs } = await fresh(browser, { id: 'ptr', width: 390, height: 844, extra });
    await speedUp(page);
    await page.evaluate(() => { tmtLoader.speed.open(false); tmtLoader.speed.showMore(true); });
    await page.waitForTimeout(400);
    const m = await page.evaluate(MEASURE);
    await page.evaluate(() => { window.__ff = tmtLoader.speed.run({ gs: 1e6 }); });
    await page.waitForTimeout(500);
    const m2 = await page.evaluate(MEASURE);
    await page.evaluate(() => tmtLoader.speed.stop());
    for (const [k, x] of [['open', m], ['running', m2]]) {
      if (x.none || x.past.length || x.nowrap.length || x.scrollW > x.vw || x.offscreen || x.rootW > x.vw - 16 + 0.5) f.push(`${tag}/${k}: ${JSON.stringify({ past: x.past && x.past.slice(0, 3), nowrap: x.nowrap, scrollW: x.scrollW, vw: x.vw, rootW: x.rootW, offscreen: x.offscreen })}`);
    }
    if (errs.length) f.push(`${tag}: page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`${tag}: ${m.n} elements, ${m.buttons} buttons, 0 past, 0 nowrap, panel ${m.rootW}/${m.vw}`);
    await context.close();
  }
  row({ gate: 'S7 phone: at 390 px (plain, nav bar, mobile layout) the controls open, expanded and running: nothing past the edge, no page scroll, no nowrap, every button on screen', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

// ---- S8 ---------------------------------------------------------------------------------------------------------------
// the key paths of `player` to depth 3, without the state mask (`time`, `offTime`: the engine's own clock fields)
function keyPaths(o, pre = '', out = []) {
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const k of Object.keys(o)) { if (k === 'time' || k === 'offTime') continue; out.push(pre + k); if (pre.split('.').length < 3) keyPaths(o[k], pre + k + '.', out); }
  return out;
}
async function legInert(browser) {
  const f = [], seen = [];
  for (const [tag, automation] of [['plain', false], ['automation (profile off)', true]]) {
    const { context, page, stats, errs } = await fresh(browser, { id: 'ptr', automation, profile: 'off' });
    const k0 = await allKeys(page);
    await page.evaluate(() => { tmtLoader.tick(0.05, 50); tmtLoader.save(); });
    await page.click('#optionWheel');
    await page.waitForTimeout(300);
    const k1 = await allKeys(page);
    const asked = stats.of(page).urls.filter((u) => /loader\/tmt-speed\.js|tools\/harness\/ladder\//.test(u));
    const t = await page.evaluate(() => ({ speed: typeof tmtLoader.speed, door: typeof tmtLoader.fetchSpeed, loaded: tmtLoader.loaded.filter((x) => /speed/.test(x)), btn: !!document.querySelector('#tmt-loader-options button[data-tool="speed"]'),
      mem: tmtLoader.autoMemory ? tmtLoader.autoMemory.status() : null }));
    const newKeys = k1.filter((k) => !k0.includes(k) && !/^tmt-loader:ptr:ptr$/.test(k));
    if (asked.length) f.push(`${tag}: requested ${asked.join(', ')}`);
    if (newKeys.length) f.push(`${tag}: new keys ${newKeys.join(', ')}`);
    if (t.speed !== 'undefined' || t.loaded.length || t.door !== 'function') f.push(`${tag}: ${JSON.stringify(t)}`);
    if (!t.btn) f.push(`${tag}: the options tab has no Speed controls button`);
    if (automation && (!t.mem || t.mem.writes !== 0 || t.mem.saves < 1)) f.push(`${tag}: the memory wrote on a page with nothing to remember ${JSON.stringify(t.mem)}`);
    if (errs.length) f.push(`${tag}: page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`${tag}: 0 speed/ladder requests of ${stats.of(page).urls.length}, keys ${k1.length} (no new), the door present, ${automation ? `saves ${t.mem.saves}, memory writes 0` : 'no memory'}`);
    await context.close();
  }
  // speed is never in `player`: the key paths before and after every speed and a coarse run are the same
  {
    const { context, page, errs } = await fresh(browser, { id: 'ptr', managed: false, profile: 'off' });
    const p0 = await page.evaluate(() => JSON.parse(JSON.stringify(player)));
    await speedUp(page);
    await page.evaluate(async () => { const S = tmtLoader.speed; S.open(false); for (const s of [2, 10, 'max', 0]) { S.setSpeed(s); await new Promise((r) => setTimeout(r, 250)); } S.setMode('coarse', 5); await S.run({ gs: 50 }); S.setMode('faithful'); await S.run({ gs: 2 }); S.setSpeed(1); tmtLoader.save(); });
    const p1 = await page.evaluate(() => JSON.parse(JSON.stringify(player)));
    const a0 = new Set(keyPaths(p0)), a1 = new Set(keyPaths(p1));
    const added = [...a1].filter((k) => !a0.has(k)), removed = [...a0].filter((k) => !a1.has(k));
    const dev = [p0.devSpeed, p1.devSpeed];
    if (added.length || removed.length || dev[0] !== dev[1]) f.push(`player keys moved: +${added.slice(0, 5)} -${removed.slice(0, 5)} devSpeed ${dev}`);
    if (errs.length) f.push(`speed page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`player: ${a1.size} key paths before and after every speed + a coarse run, devSpeed ${dev[1]}`);
    await context.close();
  }
  row({ gate: 'S8 inert: never used → no tmt-speed.js, no ladder request, no new key (a profile-off save writes no automem); speed never in player', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

// ---- S9 ---------------------------------------------------------------------------------------------------------------
async function legDoor(browser) {
  const f = [];
  const { context, page, stats, errs } = await fresh(browser, { id: 'something', managed: false, profile: 'off' });
  await page.click('#optionWheel');
  await page.waitForSelector('#tmt-loader-options button[data-tool="speed"]', { timeout: 10000 });
  await page.click('#tmt-loader-options button[data-tool="speed"]');
  await page.waitForSelector('#tmt-speed', { timeout: 10000 });
  const k1 = await raw(page, SPEED_KEY('something'));
  await page.click('#tmt-speed button[data-speed="10"]');
  await page.waitForTimeout(300);
  const s1 = await page.evaluate(() => tmtLoader.speed.status());
  await reload(page);
  await page.waitForSelector('#tmt-speed', { timeout: 10000 });
  const s2 = await page.evaluate(() => ({ st: tmtLoader.speed.status(), open: tmtLoader.speed.isOpen() }));
  await page.click('#tmt-speed button[data-speed="2"]');
  await page.click('#tmt-speed .tmts-x');
  const s3 = await page.evaluate((k) => ({ st: tmtLoader.speed.status(), open: tmtLoader.speed.isOpen(), key: tmtLoader.storage.raw.getItem.call(localStorage, k) }), SPEED_KEY('something'));
  await page.click('#optionWheel');
  await page.waitForSelector('#tmt-loader-options', { timeout: 10000 });
  const flags = await page.evaluate(() => { return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(Array.from(document.querySelectorAll('#tmt-loader-options button[data-flag]')).map((b) => b.dataset.flag))))); });
  if (k1 !== '{"open":true}') f.push(`the key after opening: ${k1}`);
  if (s1.speed !== 10 || !s1.held) f.push(`×10 pressed: ${JSON.stringify(s1)}`);
  if (!s2.open || s2.st.speed !== 1 || s2.st.held) f.push(`after the reload: ${JSON.stringify(s2)} (open, and ×1 — the speed is never remembered)`);
  if (s3.open || s3.key !== null || s3.st.speed !== 1 || s3.st.held) f.push(`after closing: ${JSON.stringify(s3)}`);
  if (JSON.stringify(flags) !== '["mobile","navbar","automation"]') f.push(`the options' flags ${JSON.stringify(flags)}`);
  if (errs.length) f.push(`page errors ${errs.slice(0, 2).join(' | ')}`);
  row({ gate: 'S9 door: the options tab\'s Speed controls button opens them; they come back open (at ×1) after a reload from the one key; closing removes it and returns to ×1', id: 'something', ok: !f.length,
    notes: f.length ? f.join('; ') : `key ${k1}; ×10 held; reloaded: open at ×1; closed: key removed, ×1, the three flag buttons unchanged; ${stats.of(page).urls.filter((u) => /tmt-speed/.test(u)).length} request(s) for the file` });
  await context.close();
}

async function partPage() {
  const { chromium } = await import('playwright');
  ({ openContext, openGame, pageLoadFrom, waitReady } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  const LEGS = { faithful: legFaithful, multiplier: legMultiplier, targets: legTargets, coarse: legCoarse, 'no-gap': legNoGap, memory: legMemory, phone: legPhone, inert: legInert, door: legDoor };
  try {
    for (const k of PAGE_ROWS) {
      if (!want(k)) continue;
      try { await LEGS[k](browser); } catch (e) { row({ gate: `S ${k}`, id: '—', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 600)}` }); }
    }
  } finally { await browser.close(); server.stop(); }
}

// ---- Part roster -----------------------------------------------------------------------------------------------------
async function partRoster() {
  const { chromium } = await import('playwright');
  ({ openContext, openGame, pageLoadFrom, waitReady } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  const ids = a.ids ? String(a.ids).split(',') : GAMES();
  const none = [], many = [], bad = [], counts = {};
  try {
    const { context } = await openContext(browser);
    for (const id of ids) {
      const page = await context.newPage();
      try {
        const r = await openGame(page, server.url, id, { managed: true, automation: false });
        if (!r.ready) { bad.push(`${id}: ${JSON.stringify(r.error)}`); continue; }
        const L = await page.evaluate(() => tmtLoader.timers.find(/\bgameLoop\s*\(/));
        counts[L.length] = (counts[L.length] || 0) + 1;
        if (!L.length) none.push(id); else if (L.length > 1) many.push(`${id}:${L.map((x) => x.ms).join('/')}`);
        if (L.length && L.some((x) => x.ms !== 50)) many.push(`${id}: interval ${L.map((x) => x.ms)} ms`);
      } catch (e) { bad.push(`${id}: ${String(e.message).slice(0, 120)}`); }
      finally { await page.close(); }
    }
    await context.close();
  } finally { await browser.close(); server.stop(); }
  row({ gate: 'L1 loop: every game\'s plain page records exactly one 50 ms interval that calls gameLoop( — the one the speed controls hold', id: `${ids.length} games`, ok: !none.length && !many.length && !bad.length,
    notes: `${JSON.stringify(counts)} (count of loop intervals → games)` + (none.length ? ` · NONE: ${none.join(', ')}` : '') + (many.length ? ` · MORE THAN ONE / not 50 ms: ${many.join(', ')}` : '') + (bad.length ? ` · did not load: ${bad.join('; ')}` : '') });
}

// ---- Part grep -----------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = GAMES();
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const marks = [];
  for (const g of JSON.parse(fs.readFileSync(path.join(REPO, 'tools/harness/ladder/index.json'), 'utf8')).games) for (const m of JSON.parse(fs.readFileSync(path.join(REPO, `tools/harness/ladder/${g}.json`), 'utf8')).marks) marks.push(m.id);
  const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
  const cut = (src, from, to) => { const i = src.indexOf(from), j = src.indexOf(to, i); if (i < 0 || j < 0) throw new Error(`grep: marker ${from} not found`); return src.slice(i, j); };
  const srcs = [['loader/tmt-speed.js', read('loader/tmt-speed.js')], ['loader/shims/timers.js', read('loader/shims/timers.js')],
    ['loader/tmt-auto.js (the memory)', cut(read('loader/tmt-auto.js'), '// ---- (speed-1) THE AUTOMATION', '// ⛔ A POLICY IS VALID WHEN')],
    ['loader/attach.mjs (the door)', cut(read('loader/attach.mjs'), '// ---- (speed-1) THE SPEED CONTROLS', '// the OPTIONS SECTION')],
    ['loader/options.js (the door)', cut(read('loader/options.js'), '// (speed-1) THE SPEED CONTROLS', 'noteEl = document.createElement')],
    ['loader/page.js (the restore)', cut(read('loader/page.js'), '// (speed-1) THE AUTOMATION', 'if (MANAGED) T.pause();')]];
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
    notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids, ${ptrLayers.length} layer ids and ${marks.length} mark ids checked against every string literal and member access` });
}

if (PART === 'page' || PART === 'all') await partPage();
if (PART === 'roster' || PART === 'all') await partRoster();
if (PART === 'grep' || PART === 'all') partGrep();
const expected = (PART === 'page' || PART === 'all' ? (ONLY ? ONLY.length : PAGE_ROWS.length) : 0) + (PART === 'roster' || PART === 'all' ? 1 : 0) + (PART === 'grep' || PART === 'all' ? 1 : 0);
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT speed part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-speed-part${PART}-last.json`), { commit, dirty, rows });
if (!a['no-summary']) appendSection({ title: `speed-1 speed controls and the automation's memory across a reload — part ${PART}`, commit, dirty, rows, slug: null,
  reading: 'page = the speed controls driven through Playwright: faithful = the harness at 0.05 by hash, the multiplier and pause, every target with its cap, the approximate label, no phantom offline gap, the reload memory (resume, once, cycle, discard on a different save / import / reset), the phone width, inertness, the door; roster = every game\'s loop is found; grep = no game id.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
