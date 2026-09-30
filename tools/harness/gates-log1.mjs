#!/usr/bin/env node
// log-1 — THE STATE LOG (docs/log.md): inert when off, transparent when on, and a log that replays EXACTLY.
//
//   node tools/harness/gates-log1.mjs --part 1|2|all|page [--leg <key>[,<key>…]] [--pool N] [--no-summary] [--no-write] [--assert]
//
// Part 1  INERTNESS, log OFF. ptr's opening (fresh → M12) lands on the pin gates-c1c part 3 holds — READ from that
//         file's own text, never copied here — and a short leg per game proves the recorder never ran: no
//         `tmtLoader.stateLog`, the automation core's link slot empty, no tracker block in `runtimeState()` (arming the
//         tracker is the one thing the log adds to it), no wrapper on the engine's globals.
// Part 2  TRANSPARENCY + REPLAY, log ON. Each leg runs with the log ON and OFF (the opening: ON against the same pin);
//         the game hash, the ticks, the game-seconds and the automation's action counts must be equal (T rows). Then
//         `replay.mjs` replays the log (R rows): every action and checkpoint equal, every call re-applied, and the leg
//         must have REACHED what it is about — a leg that never records the kind of action it tests reads exactly like
//         one that recorded it and found nothing, so each asserts its own counts (below).
// Part page  THE PAGE (Playwright): an automation page that never switches the log on requests neither
//         `loader/tmt-log.js` nor `loader/log-hooks.json`, has no `tmtLoader.stateLog` and stores nothing new — with the
//         switch RENDERED in the developer details; pressing it fetches both, records a stretch, and the DOWNLOAD button
//         hands over a file every line of which parses; `?autoOpt=log=1` starts it at ready; the plain page has no door.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green (a battery that dies part-way prints
// fewer rows, and fewer rows is fewer reds).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'leg', 'pool', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
if (!['1', '2', 'all', 'page'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not 1 | 2 | all | page`); process.exit(2); }
const POOL = Number(a.pool || 4);
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 700)}`); };

// ---- the pins, READ from gates-c1c's own source (the file that holds them); a pin that moved there moves here ----------
const C1C = fs.readFileSync(path.join(REPO, 'tools/harness/gates-c1c.mjs'), 'utf8');
function pinOf(key) {
  const m = new RegExp(`key: '${key}'[^\\n]*pin: \\{ mark: '(\\w+)', gs: (\\d+), hashGame: '([0-9a-f]{16})' \\}`).exec(C1C);
  if (!m) throw new Error(`gates-c1c.mjs: no pin for leg ${key} — the file changed shape; read it and update pinOf()`);
  return { mark: m[1], gs: Number(m[2]), hashGame: m[3] };
}
const PIN_OPEN = pinOf('O');      // ptr fresh → M12

const LADDER = 'tools/harness/ladder/ptr.json';
// ⛔ THE LEGS, AND WHAT EACH MUST HAVE REACHED. `need` is asserted on the log itself (counts of records by kind), so a
// leg that stopped short of the branch it is about is RED, not a quiet green.
const LEGS = {
  open: { id: 'ptr', about: 'ptr fresh → M12 (the opening)', flags: { diff: 1, profile: 'all', ticks: 8000, 'wall-ms': 570000, ladder: LADDER, to: 'M12', stall: 1e6 },
    pin: PIN_OPEN, need: { auto: 500, markCheckpoints: 12, calls: ['auto:doReset', 'auto:buyUpgrade', 'auto:set'] } },
  m22: { id: 'ptr', about: 'ptr all/M22 → M25 (challenge entries and give-ups, a row cycle)', flags: { 'from-snapshot': 'tools/harness/snapshots/ptr/all/M22.json', profile: 'all', ticks: 20000, 'wall-ms': 570000, ladder: LADDER, to: 'M25', stall: 1e6 },
    need: { auto: 100, codes: ['acted:challenge-enter', 'acted:challenge-exit'], giveUps: 1, refusedAuto: 1, calls: ['auto:doReset', 'auto:startChallenge', 'game:doReset'] } },
  something: { id: 'something', about: 'Something Tree fresh → S05 (the table-less control: derived defaults)', flags: { diff: 1, profile: 'all', ticks: 3000, 'wall-ms': 570000, ladder: 'tools/harness/ladder/something.json', to: 'S05', stall: 1e6 },
    need: { auto: 50, calls: ['auto:doReset'] } },
  coe: { id: 'collection-of-everything', about: 'Collection of Everything fresh, 2000 ticks (many active resets)', flags: { diff: 1, profile: 'all', ticks: 2000 },
    need: { auto: 200, refusedAuto: 1, calls: ['auto:doReset'] } },
};
const PICK = a.leg ? String(a.leg).split(',') : Object.keys(LEGS);
for (const k of PICK) if (!LEGS[k]) { console.error(`REFUSED: --leg ${k} is not one of ${Object.keys(LEGS).join(', ')}`); process.exit(2); }
// the rows each part emits (per leg picked) + one verdict row — `--assert` holds the run to it
const ROWS_P1 = (PICK.includes('open') ? 1 : 0) + new Set(PICK.map((k) => LEGS[k].id)).size;
const ROWS_P2 = PICK.length * 2;
const ROWS_PAGE = 4;

function child(args, { timeoutMs = 700e3 } = {}) {
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'log1-'));
/** One run.mjs child; its full JSON result (or {ok:false, error}). */
async function run(id, flags) {
  const f = path.join(fs.mkdtempSync(path.join(TMP, 'r-')), 'r.json');
  const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', f];
  for (const [k, v] of Object.entries(flags)) { if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v)); }
  const t0 = Date.now();
  const r = await child(args);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')), { wallMs: Date.now() - t0 }); }
  catch { return { ok: false, error: `no result (exit ${r.code}): ${r.out.slice(-400)}`, wallMs: Date.now() - t0 }; }
}
async function replay(file) {
  const f = path.join(fs.mkdtempSync(path.join(TMP, 'p-')), 'p.json');
  const t0 = Date.now();
  const r = await child([path.join(REPO, 'tools/harness/replay.mjs'), file, '--json', f, '--wall-ms', '570000']);
  try { return Object.assign(JSON.parse(fs.readFileSync(f, 'utf8')).line, { exit: r.code, wallMs: Date.now() - t0 }); }
  catch { return { ok: false, error: `no result (exit ${r.code}): ${r.out.slice(-400)}`, exit: r.code, wallMs: Date.now() - t0 }; }
}
const at = (res, mark) => (res && res.marks && res.marks[mark]) || null;

// ---- Part 1: INERTNESS -----------------------------------------------------------------------------------------------
// what "the recorder never ran" means, read inside the game after a short leg with no --log
const INERT_EVAL = `(function(){ var L = tmtLoader.logLink || null; return {
  stateLog: typeof tmtLoader.stateLog,
  link: L ? [L.exec === null, L.replay === null, L.progress === null, L.track === false] : null,
  runtimeKeys: Object.keys(tmtLoader.runtimeState()).sort(),
  wrapped: ['doReset','buyBuyable','buyUpgrade','startChallenge','clickClickable','toggleAuto','gameLoop'].filter(function (n) { return typeof globalThis[n] === 'function' && !!globalThis[n].tmtLoaderStateLogHook; }),
  armed: tmtLoader.progress().armed }; })()`;
async function part1() {
  const games = [...new Set(PICK.map((k) => LEGS[k].id))];
  const jobs = [];
  if (PICK.includes('open')) jobs.push({ kind: 'pin', leg: 'open' });
  for (const g of games) jobs.push({ kind: 'eval', id: g });
  const res = await pool(jobs, POOL, async (j) => (j.kind === 'pin' ? run('ptr', LEGS.open.flags) : run(j.id, { diff: 1, profile: 'all', ticks: 300, eval: INERT_EVAL })));
  jobs.forEach((j, i) => {
    const r = res[i];
    if (j.kind === 'pin') {
      const m = at(r, PIN_OPEN.mark);
      const ok = !!(r.ok && m && m.gameSeconds === PIN_OPEN.gs && m.hashGame === PIN_OPEN.hashGame);
      row({ gate: 'log1-1 inert', id: 'ptr', leg: `${LEGS.open.about}, log OFF`, ticks: r.ticks, gameSeconds: m && m.gameSeconds, diff: 1, hash: m && m.hashGame, ok,
        notes: ok ? `lands on the pin (gates-c1c O): ${PIN_OPEN.mark} ${PIN_OPEN.gs} / ${PIN_OPEN.hashGame} (${Math.round(r.wallMs / 1000)} s)` : `EXPECTED ${PIN_OPEN.mark} ${PIN_OPEN.gs} / ${PIN_OPEN.hashGame}, GOT ${m ? m.gameSeconds + ' / ' + m.hashGame : 'no ' + PIN_OPEN.mark} ${r.error || ''}` });
    } else {
      const e = r.eval || {};
      const fails = [];
      if (!r.ok) fails.push(`run failed: ${r.error}`);
      if (e.stateLog !== 'undefined') fails.push(`tmtLoader.stateLog is ${e.stateLog}`);
      if (!e.link || e.link.some((x) => !x)) fails.push(`link slot not empty: ${JSON.stringify(e.link)}`);
      if ((e.runtimeKeys || []).includes('progress')) fails.push('runtimeState() carries a tracker block');
      if ((e.wrapped || []).length) fails.push(`wrapped: ${e.wrapped.join(',')}`);
      if (e.armed) fails.push('the tracker is armed');
      row({ gate: 'log1-1 inert', id: j.id, leg: 'fresh 300 ticks, log OFF', ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hashGame, ok: fails.length === 0,
        notes: fails.length ? fails.join('; ') : `no recorder, link empty, runtimeState keys ${JSON.stringify(e.runtimeKeys)}, nothing wrapped` });
    }
  });
}

// ---- Part 2: TRANSPARENCY + REPLAY --------------------------------------------------------------------------------------
function readLog(file) {
  const recs = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const acts = recs.filter((r) => r.type === 'action');
  const stop = recs.filter((r) => r.type === 'checkpoint' && r.why === 'stop').pop() || null;
  const calls = {}; for (const r of acts) { const k = `${r.source}:${r.call}`; calls[k] = (calls[k] || 0) + 1; }
  const codes = {}; for (const r of acts) if (r.why) codes[r.why.code] = (codes[r.why.code] || 0) + 1;
  return { recs, acts, stop, calls, codes, bytes: fs.statSync(file).size,
    auto: acts.filter((r) => r.source === 'auto').length,
    markCheckpoints: recs.filter((r) => r.type === 'checkpoint' && r.why === 'mark').length,
    refusedAuto: stop && stop.counts && stop.counts.refused ? stop.counts.refused.auto || 0 : 0,
    didFalseNonPlayer: acts.filter((r) => r.did === false && r.source !== 'player').length };
}
async function part2() {
  const jobs = [];
  for (const k of PICK) { jobs.push({ k, on: true }); if (!LEGS[k].pin) jobs.push({ k, on: false }); }
  const res = await pool(jobs, POOL, async (j) => {
    const L = LEGS[j.k];
    const flags = { ...L.flags };
    if (j.on) flags.log = path.join(TMP, `${j.k}.jsonl`);
    const r = await run(L.id, flags);
    return r;
  });
  const byLeg = {};
  jobs.forEach((j, i) => { (byLeg[j.k] ||= {})[j.on ? 'on' : 'off'] = res[i]; });
  // the replays, after every recording is on disk
  const reps = await pool(PICK, POOL, async (k) => (fs.existsSync(path.join(TMP, `${k}.jsonl`)) ? replay(path.join(TMP, `${k}.jsonl`)) : { ok: false, error: 'no log written' }));
  PICK.forEach((k, i) => {
    const L = LEGS[k], on = byLeg[k].on, off = byLeg[k].off;
    // ---- T: transparency
    const fails = [];
    if (!on.ok) fails.push(`log ON run failed: ${on.error}`);
    let hashNote;
    if (L.pin) {
      const m = at(on, L.pin.mark);
      if (!m || m.gameSeconds !== L.pin.gs || m.hashGame !== L.pin.hashGame) fails.push(`ON: ${L.pin.mark} ${m ? m.gameSeconds + ' / ' + m.hashGame : 'not reached'}, the pin says ${L.pin.gs} / ${L.pin.hashGame}`);
      hashNote = `${L.pin.mark} ${L.pin.gs} / ${L.pin.hashGame} = the pin`;
    } else {
      if (!off.ok) fails.push(`log OFF run failed: ${off.error}`);
      for (const f of ['ticks', 'gameSeconds', 'hashGame']) if (on[f] !== off[f]) fails.push(`${f} ON ${on[f]} ≠ OFF ${off[f]}`);
      if (JSON.stringify(on.hook && on.hook.actions) !== JSON.stringify(off.hook && off.hook.actions)) fails.push(`automation action counts differ: ON ${JSON.stringify(on.hook && on.hook.actions)} OFF ${JSON.stringify(off.hook && off.hook.actions)}`);
      hashNote = `ON = OFF: ${on.ticks} ticks, hashGame ${on.hashGame}, actions equal`;
    }
    if (on.log && on.log.errors) fails.push(`the recorder caught ${on.log.errors} errors of its own`);
    row({ gate: 'log1-2 transparent', id: L.id, leg: L.about, ticks: on.ticks, gameSeconds: on.gameSeconds, diff: on.diff, hash: on.hashGame, ok: fails.length === 0,
      notes: fails.length ? fails.join('; ') : `${hashNote}; log ${on.log ? Math.round(on.log.fileBytes / 1024) + ' KB' : '?'} (${Math.round(on.wallMs / 1000)} s ON${off ? ', ' + Math.round(off.wallMs / 1000) + ' s OFF' : ''})` });
    // ---- R: replay, and the leg reached what it is about
    const rp = reps[i], f2 = [];
    const file = path.join(TMP, `${k}.jsonl`);
    const lg = fs.existsSync(file) ? readLog(file) : null;
    if (!lg) f2.push('no log');
    if (!rp.ok || rp.equal !== true) f2.push(`replay NOT equal: ${JSON.stringify(rp.mismatch || rp.error || rp.why).slice(0, 400)} implicates ${JSON.stringify(rp.implicates || [])}`);
    if (lg) {
      const nAct = lg.acts.length, nCk = lg.recs.filter((r) => r.type === 'checkpoint').length;
      if (rp.compared && (rp.compared.action !== nAct || rp.compared.checkpoint !== nCk)) f2.push(`compared ${JSON.stringify(rp.compared)} ≠ the log's ${nAct} actions / ${nCk} checkpoints`);
      if (rp.unapplied) f2.push(`${rp.unapplied} calls never re-applied`);
      const N = L.need;
      if (lg.auto < N.auto) f2.push(`only ${lg.auto} automation records (needs ≥ ${N.auto})`);
      for (const c of N.calls || []) if (!lg.calls[c]) f2.push(`no ${c} record`);
      for (const c of N.codes || []) if (!lg.codes[c]) f2.push(`no action with reason ${c}`);
      if (N.giveUps && Object.keys(lg.codes).filter((c) => /give-up|gave-up|giving-up/.test(c)).reduce((t, c) => t + lg.codes[c], 0) < N.giveUps) f2.push(`no challenge give-up (codes: ${JSON.stringify(lg.codes)})`);
      if (N.markCheckpoints && lg.markCheckpoints < N.markCheckpoints) f2.push(`${lg.markCheckpoints} mark checkpoints (needs ≥ ${N.markCheckpoints})`);
      if (N.refusedAuto && lg.refusedAuto < N.refusedAuto) f2.push(`the stop counts ${lg.refusedAuto} refused automation calls (needs ≥ ${N.refusedAuto}): is \`did\` still "the state changed"?`);
      if (lg.didFalseNonPlayer) f2.push(`${lg.didFalseNonPlayer} game/automation records with did:false were WRITTEN (they are counted, not written)`);
    }
    row({ gate: 'log1-2 replay', id: L.id, leg: L.about, ticks: rp.endTick, diff: on.diff, ok: f2.length === 0,
      notes: f2.length ? f2.join('; ') : `EQUAL: ${rp.compared.action} actions + ${rp.compared.checkpoint} checkpoints, ${rp.applied} calls re-applied; calls ${JSON.stringify(lg.calls)}; codes ${JSON.stringify(lg.codes)}; ${lg.markCheckpoints} mark checkpoints; refused auto ${lg.refusedAuto} (${Math.round(rp.wallMs / 1000)} s)` });
  });
}

// ---- Part page -------------------------------------------------------------------------------------------------------
async function partPage() {
  const { chromium } = await import('playwright');
  const { openContext, openGame } = await import('./page.mjs');
  const server = await startServer(REPO);
  const browser = await chromium.launch();
  const LOGFILES = /loader\/(tmt-log\.js|log-hooks\.json)(\?|$)/;
  const showDev = (page) => page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; tmtLoader.setDevDetails(true); });
  const keys = (page) => page.evaluate(() => Object.keys(localStorage).sort());
  try {
    // (a) + (b): ONE automation page — never switched on, then switched on by the button, recorded, downloaded
    {
      const { context, stats } = await openContext(browser, { contextOptions: { acceptDownloads: true } });
      const page = await context.newPage();
      const f = [];
      const ld = await openGame(page, server.url, 'ptr', { profile: 'all' });
      if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
      await page.evaluate(() => tmtLoader.tick(1, 200));
      const k0 = await keys(page);
      await showDev(page);
      await page.waitForSelector('.tmtl-log-toggle', { timeout: 15000 }).catch(() => f.push('the switch is not rendered in the developer details'));
      const word = await page.$eval('.tmtl-log-toggle', (b) => b.textContent.trim()).catch(() => null);
      if (word !== 'record a state log') f.push(`the switch reads "${word}"`);
      await page.evaluate(() => tmtLoader.tick(1, 50));
      const asked = stats.of(page).urls.filter((u) => LOGFILES.test(u));
      if (asked.length) f.push(`requested before the switch: ${asked.join(', ')}`);
      if (await page.evaluate(() => typeof tmtLoader.stateLog) !== 'undefined') f.push('tmtLoader.stateLog exists before the switch');
      if (await page.evaluate(() => typeof doReset === 'function' && !!doReset.tmtLoaderStateLogHook)) f.push('doReset is wrapped before the switch');
      const k1 = await keys(page);
      if (JSON.stringify(k0) !== JSON.stringify(k1)) f.push(`stored keys moved: ${JSON.stringify(k0)} → ${JSON.stringify(k1)}`);
      row({ gate: 'log1-page off', id: 'ptr', leg: 'automation page, the switch rendered, never pressed', ticks: 250, ok: f.length === 0,
        notes: f.length ? f.join('; ') : `0 requests for the recorder among ${stats.of(page).urls.length}; no stateLog; stored keys unchanged (${k1.length})` });
      // (b) press it
      const g = [];
      await page.click('.tmtl-log-toggle');
      await page.waitForFunction(() => window.tmtLoader.stateLog && window.tmtLoader.stateLog.status().on, null, { timeout: 15000 }).catch(() => g.push('pressing the switch did not start the log'));
      const got = stats.of(page).urls.filter((u) => LOGFILES.test(u)).map((u) => u.replace(/.*\/loader\//, ''));
      if (got.length !== 2) g.push(`requests after the press: ${JSON.stringify(got)} (expected tmt-log.js and log-hooks.json once each)`);
      await page.evaluate(() => tmtLoader.tick(1, 700));
      await page.waitForSelector('.tmtl-log-download', { timeout: 10000 }).catch(() => g.push('no download button while recording'));
      const read = await page.$eval('.tmtl-log-read', (x) => x.textContent).catch(() => '');
      if (!/^Recording: \d+ actions/.test(read)) g.push(`the status line reads "${read.slice(0, 120)}"`);
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('.tmtl-log-download')]).catch((e) => { g.push(`no download: ${e.message}`); return [null]; });
      let n = 0, types = {}, bad = 0, head = null;
      if (dl) {
        const p = await dl.path();
        const lines = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean);
        for (const l of lines) { try { const r = JSON.parse(l); types[r.type] = (types[r.type] || 0) + 1; if (r.type === 'header') head = r; n++; } catch { bad++; } }
        if (!/^tmt-log-ptr-.*\.jsonl$/.test(dl.suggestedFilename())) g.push(`the file is named ${dl.suggestedFilename()}`);
      }
      if (bad) g.push(`${bad} lines do not parse`);
      if (!head || head.format !== 'tmt-state-log/1' || head.origin !== 'page') g.push(`header ${JSON.stringify(head).slice(0, 200)}`);
      if (!(types.action > 0)) g.push('no action records');
      if (!(types.checkpoint >= 2)) g.push(`checkpoints ${types.checkpoint || 0} (start + at least one interval)`);
      const k2 = await keys(page);
      if (JSON.stringify(k1) !== JSON.stringify(k2)) g.push(`the log stored something: ${JSON.stringify(k2)}`);
      await page.click('.tmtl-log-toggle');
      if (await page.evaluate(() => tmtLoader.stateLog.status().on)) g.push('the switch did not stop it');
      row({ gate: 'log1-page on', id: 'ptr', leg: 'the switch pressed, 700 ticks, downloaded, stopped', ticks: 950, ok: g.length === 0,
        notes: g.length ? g.join('; ') : `the file parses: ${n} lines ${JSON.stringify(types)}; stored keys unchanged; stopped by the same switch` });
      await context.close();
    }
    // (c) ?autoOpt=log=1 on something: recording from ready
    {
      const { context, stats } = await openContext(browser);
      const page = await context.newPage();
      const f = [];
      const ld = await openGame(page, server.url, 'something', { profile: 'all', autoOpt: 'log=1' });
      if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
      const on = await page.evaluate(() => !!(tmtLoader.stateLog && tmtLoader.stateLog.status().on));
      if (!on) f.push('not recording at ready');
      await page.evaluate(() => tmtLoader.tick(1, 300));
      const txt = await page.evaluate(() => tmtLoader.stateLog ? tmtLoader.stateLog.text() : '');
      const recs = txt.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } });
      if (recs.some((r) => r === null)) f.push('a line does not parse');
      const acts = recs.filter((r) => r && r.type === 'action').length;
      if (!acts) f.push('no actions recorded');
      if (stats.of(page).failed.length) f.push(`failed requests: ${stats.of(page).failed.join(', ')}`);
      row({ gate: 'log1-page autoOpt', id: 'something', leg: '?autoOpt=log=1, 300 ticks', ticks: 300, ok: f.length === 0, notes: f.length ? f.join('; ') : `recording from ready: ${recs.length} lines, ${acts} actions` });
      await context.close();
    }
    // (d) the plain page (no automation): no door at all
    {
      const { context, stats } = await openContext(browser);
      const page = await context.newPage();
      const ld = await openGame(page, server.url, 'ptr', { automation: false });
      const f = [];
      if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
      await page.evaluate(() => tmtLoader.tick(1, 100));
      const doors = await page.evaluate(() => [typeof tmtLoader.fetchStateLog, typeof tmtLoader.stateLog, typeof tmtLoader.logLink]);
      if (doors.join() !== 'undefined,undefined,undefined') f.push(`doors: ${doors.join()}`);
      const asked = stats.of(page).urls.filter((u) => LOGFILES.test(u));
      if (asked.length) f.push(`requested: ${asked.join(', ')}`);
      row({ gate: 'log1-page plain', id: 'ptr', leg: 'the plain page', ticks: 100, ok: f.length === 0, notes: f.length ? f.join('; ') : 'no fetchStateLog, no stateLog, no link slot, no request' });
      await context.close();
    }
  } finally { await browser.close(); server.stop(); }
}

if (PART === '1' || PART === 'all') await part1();
if (PART === '2' || PART === 'all') await part2();
if (PART === 'page') await partPage();
const expected = (PART === '1' ? ROWS_P1 : PART === '2' ? ROWS_P2 : PART === 'page' ? ROWS_PAGE : ROWS_P1 + ROWS_P2);
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT log1 part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-log1-part${PART}-last.json`), { commit, dirty, legs: PICK, rows });
if (!a['no-summary']) appendSection({ title: `log-1 state log — part ${PART} (legs ${PICK.join(', ')})`, commit, dirty, rows, slug: null,
  reading: 'part 1 = the log OFF is inert (the opening pin, no recorder); part 2 = the log ON is transparent (the game hash equal to OFF or the pin) and replays exactly (every record equal), with each leg asserting it reached what it is about.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
