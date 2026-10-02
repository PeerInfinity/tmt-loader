#!/usr/bin/env node
// qedit-1 — THE QUEUE EDITOR (docs/queues.md, "The editor"), driven through the PAGE (Playwright).
//
//   node tools/harness/gates-qedit.mjs --part page|grep|all [--only <row-key>[,…]] [--no-summary] [--no-write] [--assert]
//
// Part page  every row drives the real page (ptr unless it says otherwise), managed (`?managed=1`: ticks are the gate's):
//   Q1  inert       an automation page whose Queues subtab is never opened — Simple and Advanced shown, 200 ticks —
//                   requests neither `loader/tmt-qedit.js`, `loader/tmt-queue.js` nor `games-queues/`, stores no new key,
//                   (shipq-1: the runner exactly once when the game's table ships a queue — declared, as ptr's does)
//                   has no `tmtLoader.qedit`; and the PLAIN page has no editor door at all
//   Q2  persist     a queue with EVERY step kind (an action, a wait, a pause, pause-tools, resume-tools, a comment) and a
//                   queue comment, made through the UI; reloaded, it is still there — in the ONE declared key
//                   `tmt-loader:<id>:queues`, and nowhere in `player`
//   Q3  names       the steps read the GAME's own names (the upgrade's title, the layer's name, the tools' titles), and
//                   with developer details off no step shows a raw call
//   Q4  roundtrip   export (the download) → delete → import (the file input) → export: byte-equal; the exported file is
//                   played by the HARNESS (`run.mjs --queue`) to its end
//   Q5  refuse      import refuses an invalid queue, with its reasons in plain words, and stores nothing
//   Q6  start       a `start` queue switched on runs on the next load, by itself
//   Q7  predicate   a `predicate` queue waits while its condition is false and starts on the tick it holds
//   Q8  status      while a queue waits: the run-status shows the step, the condition, the time left and the tools it
//                   has paused (by title); at its end every hold is released
//   Q9  release     switching a holding queue OFF, and DELETING one, releases its holds
//   Q10 generated   the generated-queue list (the catalog) loads q23's queue with its auto-written comment; on the
//                   harness-built state it was written for (qrate1/Q308K) it runs to its end and buys q:23
//   Q11 record      the player's presses (real clicks on the game's own buttons, the state log OFF) become steps, a run
//                   of the same press folded into one step with `times`; each press counted ONCE (one hook path)
//   Q12 replay      the recorded queue, played from the same start with the log ON, makes the same calls with the same
//                   arguments and the same effects as the same presses made by hand (the two state logs compared)
//   Q13 phone       at 390 px (with and without `?mobile=1`): nothing in the editor past the edge, no horizontal page
//                   scroll, and the editor's root is as wide as its pane (the V5 lesson: no vacuous green)
//   Q14 engines     the other engine families — Something Tree (2.7) and Arc Tree (2.6.6.2): the editor opens, offers the
//                   game's actions by their own names, a queue made of one of them and a hold runs to its end and
//                   releases, and at 390 px (`?mobile=1`) nothing is past the edge
// Part grep   G1 no game id (any manifest) and no ptr layer id in the editor's code.
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'only', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
if (!['page', 'grep', 'all'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not page | grep | all`); process.exit(2); }
const PAGE_ROWS = ['inert', 'persist', 'names', 'roundtrip', 'refuse', 'start', 'predicate', 'status', 'release', 'generated', 'record', 'replay', 'phone', 'engines'];
const ONLY = a.only ? String(a.only).split(',') : null;
if (ONLY) for (const o of ONLY) if (!PAGE_ROWS.includes(o)) { console.error(`REFUSED: --only ${o} is not one of ${PAGE_ROWS.join(', ')}`); process.exit(2); }
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 900)}`); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-qedit-'));
const want = (k) => !ONLY || ONLY.includes(k);

// the files the editor's doors fetch — G1 judges every request a page makes
const EDITOR_FILES = /(loader\/tmt-qedit\.js|loader\/tmt-queue\.js|games-queues\/)/;
const KEY = 'tmt-loader:ptr:queues';
const Q308K = 'tools/harness/snapshots/ptr/qrate1/Q308K.json';
const M09 = 'tools/harness/snapshots/ptr/all/M09.json';

// ---- page helpers ------------------------------------------------------------------------------------------------------
let openContext, openGame, pageLoadFrom;
async function redraw(page) {
  await page.evaluate(() => { try { updateTemp(); } catch (e) { /* */ } if (typeof updateTabFormats === 'function') updateTabFormats(); });
  await page.waitForTimeout(120);
}
async function tick(page, n, diff = 1) { await page.evaluate(([d, k]) => tmtLoader.tick(d, k), [diff, n]); await redraw(page); }
async function showQueues(page) {
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Queues'; });
  await redraw(page);   // no tick: opening the tab must not move the game (Q10 arms its queue before the first tick)
  await page.waitForSelector('.tmtl-qedit', { timeout: 15000 });
  await page.waitForFunction(() => tmtLoader.queues && tmtLoader.queues.ready, null, { timeout: 15000 });
  await redraw(page);
}
const keys = (page) => page.evaluate(() => Object.keys(localStorage).sort());
// ⚠ RAW: the save-prefix shim patches Storage.prototype, so a plain getItem would prefix the key a second time
const stored = (page) => page.evaluate((k) => tmtLoader.storage.raw.getItem.call(localStorage, k), KEY);
const block = (page, id) => page.locator(`.tmtl-qqueue[data-queue="${id}"]`);
async function fresh(browser, { width = 1280, mobile = false, autoOpt = null, profile = 'off', id = 'ptr' } = {}) {
  const { context, stats } = await openContext(browser, { contextOptions: { viewport: { width, height: 900 }, acceptDownloads: true } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  const ld = mobile
    ? await (async () => { await page.goto(new URL(`index.html?mod=${id}&managed=1&automation=1&mobile=1&profile=${profile}`, server.url).href, { waitUntil: 'load' }); return (await import('./page.mjs')).waitReady(page); })()
    : await openGame(page, server.url, id, { profile, autoOpt });
  return { context, page, stats, errs, ld };
}
/** Make a queue straight through the editor's API (the UI legs make theirs by pressing). */
async function apiQueue(page, q, on) {
  const r = await page.evaluate(([qq, o]) => { const x = tmtLoader.qedit.importText(JSON.stringify(qq)); if (!x.ok) return x; return o ? tmtLoader.qedit.setEnabled(qq.id, true) : x; }, [q, on]);
  await redraw(page);
  return r;
}
// ⚠ ptr's game clock (`player.timePlayed`, what a queue's waits count in) does not move until the prestige layer is
// unlocked (its `addTime` returns early) — so the legs that wait on time unlock it first, and save that.
const clockOn = (page) => page.evaluate(() => { player.p.unlocked = true; tmtLoader.save(); });
async function download(page, sel) {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click(sel)]);
  const p = path.join(TMP, dl.suggestedFilename());
  await dl.saveAs(p);
  return { file: p, name: dl.suggestedFilename(), text: fs.readFileSync(p, 'utf8') };
}
let server = null;

// ---- the legs --------------------------------------------------------------------------------------------------------
async function legInert(browser) {
  const f = [];
  let n = 0;
  {
    const { context, page, stats, ld } = await fresh(browser, { profile: 'all' });
    if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
    const k0 = await keys(page);
    await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Simple'; });
    await tick(page, 100);
    await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
    await tick(page, 100);
    // (shipq-1) ptr's TABLE ships a queue (its `queues` section), so the RUNNER is requested at boot — DECLARED by the
    // table, and exactly once; the editor and the catalog still are not
    const shipsQueues = (JSON.parse(fs.readFileSync(path.join(REPO, 'games-auto/ptr.json'), 'utf8')).queues || []).some((e) => e.enabled !== false);
    const asked = stats.of(page).urls.filter((u) => EDITOR_FILES.test(u) && !(shipsQueues && /loader\/tmt-queue\.js/.test(u)));
    if (asked.length) f.push(`requested without the Queues tab: ${asked.join(', ')}`);
    const runnerAsked = stats.of(page).urls.filter((u) => /loader\/tmt-queue\.js/.test(u)).length;
    if (runnerAsked !== (shipsQueues ? 1 : 0)) f.push(`the runner was requested ${runnerAsked} time(s) (the table ${shipsQueues ? 'ships' : 'ships no'} queue)`);
    const t = await page.evaluate(() => ({ qedit: typeof tmtLoader.qedit, door: typeof tmtLoader.fetchQueueEditor, shell: (tmtLoader.componentNames || []).includes('tmtl-queues'), subs: Object.keys(layers[tmtLoader.auLayer].tabFormat) }));
    if (t.qedit !== 'undefined') f.push('tmtLoader.qedit exists');
    if (t.door !== 'function') f.push('no fetchQueueEditor door');
    if (!t.shell) f.push('the Queues shell is not registered');
    if (JSON.stringify(t.subs) !== '["Simple","Advanced","Progress","Queues"]') f.push(`subtabs ${JSON.stringify(t.subs)}`);
    const k1 = await keys(page);
    if (JSON.stringify(k0) !== JSON.stringify(k1)) f.push(`stored keys moved: ${JSON.stringify(k0)} → ${JSON.stringify(k1)}`);
    n = stats.of(page).urls.length;
    await context.close();
  }
  {
    const { context, stats } = await openContext(browser);
    const page = await context.newPage();
    const ld = await openGame(page, server.url, 'ptr', { automation: false });
    if (!ld.ready) f.push(`plain page did not load: ${JSON.stringify(ld.error)}`);
    await page.evaluate(() => tmtLoader.tick(1, 50));
    const d = await page.evaluate(() => [typeof tmtLoader.fetchQueueEditor, typeof tmtLoader.qedit, String(tmtLoader.componentNames)]);
    if (d.join() !== 'undefined,undefined,undefined') f.push(`plain page doors: ${d.join()}`);
    if (stats.of(page).urls.some((u) => EDITOR_FILES.test(u))) f.push('the plain page requested an editor file');
    await context.close();
  }
  row({ gate: 'Q1 inert: no Queues tab opened → no editor request, no new key, no qedit; the plain page has no door', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `0 editor requests among ${n}; stored keys unchanged; subtabs Simple/Advanced/Progress/Queues; the plain page has no fetchQueueEditor, qedit or componentNames` });
}

async function legPersist(browser) {
  const f = [];
  const { context, page, ld } = await fresh(browser);
  if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
  await showQueues(page);
  // create, named, through the name field (Enter commits)
  const name = page.locator('input.tmtl-qnew-name');
  await name.fill('every kind'); await name.press('Enter');
  await redraw(page);
  const id = await page.evaluate(() => (tmtLoader.qedit.list().find((q) => q.name === 'every kind') || {}).id);
  if (!id) f.push('the name field did not create a queue');
  const B = block(page, id);
  // the queue's comment
  const qc = B.locator('input.tmtl-qqueue-comment'); await qc.fill('made by the gate: one step of every kind'); await qc.press('Enter');
  // add one of each kind (an action is picked from the game's own lists: layer then item)
  for (const kind of ['call', 'wait', 'pause', 'hold', 'release', 'comment']) {
    await B.locator('select.tmtl-qadd-kind').selectOption(kind);
    if (kind === 'call') { await B.locator('select.tmtl-qadd-layer').selectOption('p'); await redraw(page); await B.locator('select.tmtl-qadd-action').selectOption('buyUpgrade:["p",11]').catch(async () => B.locator('select.tmtl-qadd-action').selectOption('buyUpg:["p",11]')); }
    await B.locator('button.tmtl-qadd-go').click();
    await redraw(page);
  }
  // fill the wait (condition + time limit) and the pause-tools step (two tools), through their fields
  const steps = B.locator('.tmtl-qstep');
  const nSteps = await steps.count();
  const waitStep = B.locator('.tmtl-qstep[data-kind="wait"]').nth(0);
  await waitStep.locator('button.tmtl-qstep-edit').click(); await redraw(page);
  const until = waitStep.locator('input.tmtl-qstep-until'); await until.fill('player.points.gte(1)'); await until.press('Enter');
  const gs = waitStep.locator('input.tmtl-qstep-gs'); await gs.fill('30'); await gs.press('Enter');
  await redraw(page);
  const holdStep = B.locator('.tmtl-qstep[data-kind="hold"]');
  await holdStep.locator('button.tmtl-qstep-edit').click(); await redraw(page);
  await holdStep.locator('button.tmtl-qstep-feature[data-feature="reset:p"]').click(); await redraw(page);
  await holdStep.locator('button.tmtl-qstep-feature[data-feature="upgrades:p"]').click(); await redraw(page);
  const errsShown = await B.locator('.tmtl-qerror').count();
  const before = await page.evaluate((i) => JSON.stringify(tmtLoader.qedit.store().queues.find((e) => e.queue.id === i).queue), id);
  const raw = await stored(page);
  const playerHas = await page.evaluate((i) => JSON.stringify(player).includes(i) || JSON.stringify(player).includes('tmt-queue'), id);
  // reload: the page reads the key and the editor shows the same queue
  await page.reload({ waitUntil: 'load' });
  await (await import('./page.mjs')).waitReady(page);
  await showQueues(page);
  const after = await page.evaluate((i) => { const e = tmtLoader.qedit.store().queues.find((x) => x.queue.id === i); return e ? JSON.stringify(e.queue) : null; }, id);
  const kinds = await page.evaluate((i) => { const q = tmtLoader.qedit.store().queues.find((x) => x.queue.id === i).queue; return q.steps.map((s) => s.do === 'wait' && s.until === 'false' ? 'pause' : s.do); }, id);
  const shown = await block(page, id).locator('.tmtl-qstep').count();
  const ks = await keys(page);
  if (nSteps !== 7) f.push(`${nSteps} steps after adding six to the first (want 7)`);
  if (JSON.stringify(kinds.slice(1).sort()) !== JSON.stringify(['call', 'comment', 'hold', 'pause', 'release', 'wait'])) f.push(`step kinds ${JSON.stringify(kinds)}`);
  if (errsShown) f.push(`${errsShown} validation reason(s) shown for a queue that should run`);
  if (!raw || !raw.includes(id)) f.push(`the declared key ${KEY} does not hold it`);
  if (playerHas) f.push('the queue is in `player`');
  if (after !== before) f.push(`after the reload the stored queue differs:\n${before}\n${after}`);
  if (shown !== 7) f.push(`after the reload the editor shows ${shown} steps`);
  const extra = ks.filter((k) => /queue/i.test(k) && k !== KEY);
  if (extra.length) f.push(`other queue keys stored: ${extra.join(', ')}`);
  row({ gate: 'Q2 persist: every step kind + a comment, made in the page; reloaded, in the declared key, not in player', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `queue ${id}: ${JSON.stringify(kinds)}; ${KEY} holds it (${raw.length} B); player does not; equal after the reload` });
  await context.close();
  return id;
}

async function legNames(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showQueues(page);
  const want = await page.evaluate(() => ({ up: String(layers.p.upgrades[11].title), layer: String(layers.p.name), reset: tmtLoader.features.find((x) => x.id === 'reset:p').title }));
  await apiQueue(page, { format: 'tmt-queue/1', version: 2, id: 'names', name: 'names', steps: [
    { do: 'call', fn: 'buyUpgrade', args: ['p', 11] }, { do: 'call', fn: 'doReset', args: ['p'] }, { do: 'hold', features: ['reset:p'] }, { do: 'release' }] }, false);
  await page.evaluate(() => tmtLoader.setDevDetails(false));
  await tick(page, 1);
  const titles = await block(page, 'names').locator('.tmtl-qstep-title').allTextContents();
  if (!titles[0] || !titles[0].includes(`“${want.up}”`) || !titles[0].includes(want.layer)) f.push(`step 1 reads "${titles[0]}" (want the upgrade's title “${want.up}” and the layer's name ${want.layer})`);
  if (!titles[1] || !titles[1].includes(want.layer)) f.push(`step 2 reads "${titles[1]}"`);
  if (!titles[2] || !titles[2].includes(want.reset)) f.push(`step 3 reads "${titles[2]}" (want the tool's title ${want.reset})`);
  const raw = titles.filter((t) => /buyUpgrade|doReset|\(\s*"p"|reset:p/.test(t));
  if (raw.length) f.push(`raw calls shown: ${raw.join(' | ')}`);
  // the action picker lists the game's names too
  const opts = await block(page, 'names').locator('select.tmtl-qadd-action option').allTextContents();
  if (!opts.some((o) => o.includes(`“${want.up}”`))) f.push('the action picker does not offer the upgrade by its title');
  row({ gate: 'Q3 names: steps and the action picker read the game\'s own titles, not ids', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${titles.map((t) => `"${t}"`).join(', ')}; picker offers “${want.up}”` });
  await context.close();
}

async function legRoundtrip(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showQueues(page);
  const Qx = { format: 'tmt-queue/1', version: 2, id: 'trip', name: 'round trip', trigger: { on: 'start' }, source: 'authored', comment: 'exported, imported, exported',
    steps: [{ do: 'hold', features: ['reset:p'], comment: 'nothing resets p' }, { do: 'wait', until: 'false', timeout: { gs: 3 }, onTimeout: 'skip' }, { do: 'call', fn: 'doReset', args: ['p'], times: 2 }, { do: 'release' }, { do: 'comment', text: 'done' }] };
  const r0 = await apiQueue(page, Qx, false);
  if (!r0.ok) f.push(`could not make it: ${r0.errors}`);
  await tick(page, 1);
  const d1 = await download(page, '.tmtl-qqueue[data-queue="trip"] button.tmtl-qqueue-export');
  await block(page, 'trip').locator('button.tmtl-qqueue-del').click(); await redraw(page);
  await block(page, 'trip').locator('button.tmtl-qqueue-del-go').click(); await redraw(page);
  if (await block(page, 'trip').count()) f.push('delete did not remove it');
  await page.setInputFiles('input.tmtl-qimport-file', d1.file);
  await page.waitForFunction(() => tmtLoader.qedit.list().some((q) => q.id === 'trip'), null, { timeout: 10000 }).catch(() => f.push('the import did not add it'));
  await redraw(page);
  const d2 = await download(page, '.tmtl-qqueue[data-queue="trip"] button.tmtl-qqueue-export');
  if (d1.text !== d2.text) f.push('the two exports differ');
  if (d1.name !== 'tmt-queue-ptr-trip.json') f.push(`the file is named ${d1.name}`);
  // the harness plays the exported file
  const r = spawnSync(process.execPath, ['tools/harness/run.mjs', 'ptr', '--from-snapshot', 'tools/harness/snapshots/ptr/all/M02.json', '--ticks', '20', '--diff', '1', '--queue', d1.file], { cwd: REPO, encoding: 'utf8', timeout: 300000 });
  let line = null; try { line = JSON.parse(r.stdout.trim().split('\n').pop()); } catch { line = null; }
  const q = line && line.queues ? line.queues.find((x) => x.id === 'trip') : null;
  if (!q || q.state !== 'done' || (q.holds || []).length) f.push(`run.mjs --queue: ${q ? JSON.stringify(q) : (r.stderr || r.stdout || '').slice(-300)}`);
  row({ gate: 'Q4 roundtrip: export → import → export is byte-equal, and run.mjs --queue plays the exported file', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${d1.name}, ${d1.text.length} B, equal both ways; run.mjs: ${JSON.stringify(q)}` });
  await context.close();
}

async function legRefuse(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showQueues(page);
  const bad = [
    ['no-timeout.json', JSON.stringify({ format: 'tmt-queue/1', id: 'bad1', steps: [{ do: 'wait', until: 'true', onTimeout: 'abort' }] }), /time limit/],
    ['no-tool.json', JSON.stringify({ format: 'tmt-queue/1', id: 'bad2', steps: [{ do: 'hold', features: ['reset:nosuch'] }] }), /no automation tool/],
    ['bad-cond.json', JSON.stringify({ format: 'tmt-queue/1', id: 'bad3', trigger: { on: 'predicate', when: 'player.(' }, steps: [{ do: 'comment', text: 'x' }] }), /start condition/],
    ['not-json.json', '{ this is not', /not JSON/],
  ];
  const k0 = await stored(page);
  const said = [];
  for (const [name, text, re] of bad) {
    const p = path.join(TMP, name); fs.writeFileSync(p, text);
    await page.setInputFiles('input.tmtl-qimport-file', p);
    await page.waitForSelector('.tmtl-qedit-error', { timeout: 5000 }).catch(() => {});
    await redraw(page);
    const msg = await page.locator('.tmtl-qedit-error').first().textContent().catch(() => '');
    said.push(msg.trim().slice(0, 90));
    if (!re.test(msg)) f.push(`${name}: the page said "${msg.trim().slice(0, 160)}"`);
  }
  const k1 = await stored(page);
  if (k0 !== k1) f.push(`the store moved: ${k1}`);
  const n = await page.evaluate(() => tmtLoader.qedit.list().length);
  if (n) f.push(`${n} queue(s) added`);
  row({ gate: 'Q5 refuse: import refuses an invalid queue, says why in plain words, stores nothing', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : said.map((s) => `"${s}"`).join(' · ') });
  await context.close();
}

async function legStart(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showQueues(page);
  await clockOn(page);
  await apiQueue(page, { format: 'tmt-queue/1', version: 2, id: 'boot', name: 'on load', steps: [{ do: 'comment', text: 'hello' }, { do: 'hold', features: ['reset:p'] }, { do: 'wait', until: 'false', timeout: { gs: 3 }, onTimeout: 'skip' }, { do: 'release' }] }, false);
  // switched on through its own button
  await block(page, 'boot').locator('button.tmtl-qqueue-onoff').click(); await redraw(page);
  // a FRESH load of the page (not the Queues tab): the saved key is the door
  await page.reload({ waitUntil: 'load' });
  await (await import('./page.mjs')).waitReady(page);
  await page.waitForFunction(() => tmtLoader.queues && tmtLoader.queues.ready && tmtLoader.queues.status().queues.some((q) => q.id === 'boot'), null, { timeout: 15000 }).catch(() => f.push('not armed after the reload'));
  const s0 = await page.evaluate(() => (tmtLoader.queues.status().queues.find((q) => q.id === 'boot') || {}).state);
  await page.evaluate(() => tmtLoader.tick(1, 1));
  const s1 = await page.evaluate(() => { const q = tmtLoader.queues.status().queues.find((x) => x.id === 'boot'); return { state: q.state, holds: q.holds, firedAt: q.firedAt }; });
  await page.evaluate(() => tmtLoader.tick(1, 6));
  const s2 = await page.evaluate(() => { const q = tmtLoader.queues.status().queues.find((x) => x.id === 'boot'); return { state: q.state, holds: q.holds, link: tmtLoader.queueLink.holds }; });
  if (s0 !== 'armed') f.push(`at ready it is ${s0}`);
  if (s1.state !== 'running' || JSON.stringify(s1.holds) !== '["reset:p"]') f.push(`after one tick ${JSON.stringify(s1)}`);
  if (s2.state !== 'done' || s2.holds.length || s2.link !== null) f.push(`at the end ${JSON.stringify(s2)}`);
  row({ gate: 'Q6 start: a start queue switched on runs on the next load by itself, and ends with its holds released', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `ready: ${s0}; tick 1: running, holding reset:p (fired at ${s1.firedAt}); tick 7: done, no hold` });
  await context.close();
}

async function legPredicate(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await clockOn(page);
  await showQueues(page);
  // built through the UI: trigger select + condition field
  await page.locator('button.tmtl-qnew-go').click(); await redraw(page);
  const id = await page.evaluate(() => tmtLoader.qedit.list().slice(-1)[0].id);
  const B = block(page, id);
  await B.locator('select.tmtl-qqueue-trigger').selectOption('predicate'); await redraw(page);
  const w = B.locator('input.tmtl-qqueue-when'); await w.fill('player.timePlayed >= 20'); await w.press('Enter'); await redraw(page);
  await B.locator('button.tmtl-qqueue-onoff').click(); await redraw(page);
  const seen = [];
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate((x) => ({ pts: Number(player.timePlayed), st: (tmtLoader.queues.status().queues.find((q) => q.id === x) || {}).state, at: (tmtLoader.queues.status().queues.find((q) => q.id === x) || {}).firedAt }), id);
    seen.push(s);
    if (s.st === 'done') break;
    await page.evaluate(() => tmtLoader.tick(1, 1));
  }
  const early = seen.filter((s) => s.pts < 19.5 && s.st !== 'armed');
  const done = seen.find((s) => s.st === 'done');
  if (early.length) f.push(`left "armed" before the condition held (pts = game-seconds here): ${JSON.stringify(early[0])}`);
  if (!done) f.push(`never ran: last ${JSON.stringify(seen[seen.length - 1])}`);
  const armedWhileLow = seen.filter((s) => s.pts < 19.5 && s.st === 'armed').length;
  if (armedWhileLow < 10) f.push(`only ${armedWhileLow} armed observations below the condition (a vacuous leg)`);
  row({ gate: 'Q7 predicate: armed while its condition (player.timePlayed >= 20, typed in the page) is false, runs on the tick it holds', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `armed for ${armedWhileLow} ticks below 20 game-seconds; ran when the clock reached ${done.pts} (fired at ${done.at} s)` });
  await context.close();
}

async function legStatus(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showQueues(page);
  await clockOn(page);
  const titles = await page.evaluate(() => ['reset:p', 'upgrades:p'].map((id) => tmtLoader.features.find((x) => x.id === id).title));
  const r = await apiQueue(page, { format: 'tmt-queue/1', version: 2, id: 'status', name: 'status', steps: [
    { do: 'hold', features: ['reset:p', 'upgrades:p'] },
    { do: 'wait', until: 'player.timePlayed >= 15', timeout: { gs: 100 }, onTimeout: 'abort', comment: 'wait for 15 game-seconds' },
    { do: 'release' }] }, true);
  if (!r.ok) f.push(`not armed: ${r.errors}`);
  await tick(page, 5);
  const v = await page.evaluate(() => {
    const b = document.querySelector('.tmtl-qqueue[data-queue="status"]');
    const t = (s) => { const e = b.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return { state: b.dataset.state, step: t('.tmtl-qrun-step'), wait: t('.tmtl-qrun-wait'), holds: t('.tmtl-qrun-holds'), last: t('.tmtl-qrun-last'),
      held: tmtLoader.featureState ? tmtLoader.featureState('reset:p') : null, link: tmtLoader.queueLink.holds };
  });
  if (v.state !== 'running') f.push(`state ${v.state}`);
  if (!v.step || !/step 2 of 3/.test(v.step) || !/wait for 15 game-seconds/.test(v.step)) f.push(`step line "${v.step}"`);
  if (!v.wait || !v.wait.includes('player.timePlayed >= 15') || !/\d+(\.\d)? s left of 100/.test(v.wait)) f.push(`wait line "${v.wait}"`);
  if (!v.holds || !titles.every((t) => v.holds.includes(t))) f.push(`holds line "${v.holds}" (want ${titles.join(', ')})`);
  if (!v.link || !v.link['reset:p']) f.push('reset:p is not held');
  // the Advanced read-only block says the same, with the time left
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
  await tick(page, 1);
  const adv = await page.evaluate(() => { const e = document.querySelector('.tmtl-queue[data-queue="status"] .tmtl-queue-wait'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; });
  if (!adv || !/s left of 100/.test(adv)) f.push(`the Advanced block's wait line "${adv}"`);
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Queues'; });
  await tick(page, 20);
  const end = await page.evaluate(() => ({ st: tmtLoader.queues.status().queues.find((q) => q.id === 'status').state, link: tmtLoader.queueLink.holds, holdsShown: !!document.querySelector('.tmtl-qqueue[data-queue="status"] .tmtl-qrun-holds') }));
  if (end.st !== 'done' || end.link !== null || end.holdsShown) f.push(`at the end ${JSON.stringify(end)}`);
  row({ gate: 'Q8 status: the step, the condition and its time left, the paused tools by title; every hold released at the end', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `"${v.step}" · "${v.wait}" · "${v.holds}" · Advanced: "${adv}" · end: done, no hold` });
  await context.close();
}

async function legRelease(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showQueues(page);
  const mk = (id) => ({ format: 'tmt-queue/1', version: 2, id, name: id, steps: [{ do: 'hold', features: ['reset:p'] }, { do: 'wait', until: 'false', timeout: { gs: 500 }, onTimeout: 'abort' }] });
  await apiQueue(page, mk('off-me'), true); await apiQueue(page, mk('delete-me'), true);
  await tick(page, 2);
  const h0 = await page.evaluate(() => JSON.stringify(tmtLoader.queueLink.holds));
  await block(page, 'off-me').locator('button.tmtl-qqueue-onoff').click(); await tick(page, 1);
  const h1 = await page.evaluate(() => ({ holds: tmtLoader.queueLink.holds, loaded: tmtLoader.queues.status().queues.map((q) => q.id) }));
  await block(page, 'delete-me').locator('button.tmtl-qqueue-del').click(); await redraw(page);
  await block(page, 'delete-me').locator('button.tmtl-qqueue-del-go').click(); await tick(page, 1);
  const h2 = await page.evaluate(() => ({ holds: tmtLoader.queueLink.holds, loaded: tmtLoader.queues.status().queues.map((q) => q.id), stored: tmtLoader.qedit.list().map((q) => q.id) }));
  if (!/reset:p/.test(h0)) f.push(`nothing held to begin with: ${h0}`);
  if (h1.loaded.includes('off-me') || !h1.holds || h1.holds['reset:p'].queue !== 'delete-me') f.push(`after Off: ${JSON.stringify(h1)}`);
  if (h2.holds !== null || h2.loaded.length || h2.stored.includes('delete-me')) f.push(`after delete: ${JSON.stringify(h2)}`);
  row({ gate: 'Q9 release: Off and delete each release the queue\'s holds', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `held ${h0}; Off → held only by delete-me; deleted → no hold, nothing loaded` });
  await context.close();
}

async function legGenerated(browser) {
  const f = [];
  // the configuration the queue was written and checked under (gates-m28: qrate1's winner, stages off)
  const { context, page, stats } = await fresh(browser, { profile: 'all', autoOpt: 'policy:reset:q=rate-peak@0/0|turn@10/30x/5/0/100;stages=off' });
  const s = JSON.parse(fs.readFileSync(path.join(REPO, Q308K), 'utf8'));
  await pageLoadFrom(page, s.player);
  await page.evaluate(() => tmtLoader.pause());
  // the snapshot's automation memory too, as the harness restores it (boot.mjs) — without it the challenge reflex has
  // forgotten its give-up and re-enters H22 on the first tick, and the queue's wait cannot be met inside it
  await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
  await showQueues(page);
  await page.locator('button.tmtl-qcat-toggle').click();
  await page.waitForSelector('.tmtl-qcat-entry', { timeout: 15000 }).catch(() => f.push('the catalog listed nothing'));
  const entries = await page.locator('.tmtl-qcat-entry').count();
  const file = 'tools/harness/queues/m28/q23-from-Q308K.json';
  const comment = JSON.parse(fs.readFileSync(path.join(REPO, file), 'utf8')).comment;
  const shownComment = await page.locator(`.tmtl-qcat-entry[data-file="${file}"]`).textContent().catch(() => '');
  if (!shownComment.includes(comment.slice(0, 40))) f.push('the entry does not show the template\'s comment');
  await page.locator(`.tmtl-qcat-entry[data-file="${file}"] button.tmtl-qcat-add`).click();
  await page.waitForFunction(() => tmtLoader.qedit.list().some((q) => q.id === 'tpp-upg-q-23'), null, { timeout: 10000 }).catch(() => f.push('not added'));
  await redraw(page);
  const stepComments = await block(page, 'tpp-upg-q-23').locator('.tmtl-qstep-comment').count();
  await block(page, 'tpp-upg-q-23').locator('button.tmtl-qqueue-onoff').click(); await redraw(page);
  const had = await page.evaluate(() => hasUpgrade('q', 23));
  let st = null;
  for (let i = 0; i < 80 && !(st && (st.state === 'done' || st.state === 'aborted')); i++) {
    await page.evaluate(() => tmtLoader.tick(1, 1));
    st = await page.evaluate(() => { const q = tmtLoader.queues.status().queues.find((x) => x.id === 'tpp-upg-q-23'); return q ? { state: q.state, outcome: q.outcome, holds: q.holds, last: q.last, gs: Number(player.timePlayed) } : null; });
  }
  const got = await page.evaluate(() => hasUpgrade('q', 23));
  const asked = stats.of(page).urls.filter((u) => /games-queues\/|tools\/harness\/queues\//.test(u)).map((u) => u.replace(/.*:\d+\//, ''));
  if (had) f.push('q:23 was already held at the state');
  if (!st || st.state !== 'done' || !got || st.holds.length) f.push(`the queue: ${JSON.stringify(st)}; hasUpgrade q 23 = ${got}`);
  if (stepComments < 4) f.push(`${stepComments} step comments shown`);
  row({ gate: 'Q10 generated: the catalog adds q23\'s queue with its comments; on qrate1/Q308K it runs to its end and buys q:23', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${entries} catalog entries; requests ${JSON.stringify(asked)}; ${stepComments} step comments; ${st.last}` });
  await context.close();
}

// the recording's start: M09, profile off, two currencies raised so the presses can buy (a harness-built state)
async function recStart(page) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, M09), 'utf8'));
  const p = JSON.parse(s.player);
  await pageLoadFrom(page, typeof s.player === 'string' ? s.player : JSON.stringify(s.player));
  void p;
  await page.evaluate(() => { tmtLoader.pause(); player.t.points = new Decimal(100); player.e.points = new Decimal(1e6); });
  return page.evaluate(() => JSON.stringify(player));
}
const PRESSES = [['t', 'upg', 21], ['t', 'upg', 22], ['e', 'buy', 11], ['e', 'buy', 11], ['e', 'buy', 11], ['e', 'upg', 11]];
async function press(page, l, kind, id) {
  await page.evaluate((x) => { showTab(x); }, l);
  await redraw(page);
  const title = await page.evaluate(([x, k, i]) => String(k === 'upg' ? tmp[x].upgrades[i].title : tmp[x].buyables[i].title).replace(/<[^>]*>/g, '').trim(), [l, kind, id]);
  const sel = kind === 'upg' ? `#app button.upg.${l}` : '#app button.buyable';
  const btn = page.locator(sel, { has: page.locator(kind === 'upg' ? 'h3' : 'h2', { hasText: title }) }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await redraw(page);
}
let recorded = null, startJSON = null;
async function legRecord(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  startJSON = await recStart(page);
  await showQueues(page);
  await page.locator('button.tmtl-qrec-toggle').click();
  await page.waitForFunction(() => tmtLoader.qedit.record.status().on, null, { timeout: 15000 }).catch(() => f.push('recording did not start'));
  for (const [l, k, i] of PRESSES) await press(page, l, k, i);
  const mid = await page.evaluate(() => ({ st: tmtLoader.qedit.record.status(), log: tmtLoader.stateLog.status().on, wrapped: [buyBuyable, buyUpg].map((fn) => !!fn.tmtLoaderStateLogHook && !fn.tmtLoaderStateLogHook.tmtLoaderStateLogHook) }));
  await showQueues(page);
  await page.locator('button.tmtl-qrec-toggle').click(); await redraw(page);
  recorded = await page.evaluate(() => { const l = tmtLoader.qedit.list(); const q = l[l.length - 1]; return q ? tmtLoader.qedit.store().queues.find((e) => e.queue.id === q.id).queue : null; });
  const calls = recorded ? recorded.steps.filter((s) => s.do === 'call').map((s) => `${s.fn}(${s.args.join(',')})${s.times ? '×' + s.times : ''}`) : [];
  const want = ['buyUpg(t,21)', 'buyUpg(t,22)', 'buyBuyable(e,11)×3', 'buyUpg(e,11)'];
  if (mid.log) f.push('the state log was ON while recording (it must not need to be)');
  if (mid.st.presses !== PRESSES.length) f.push(`${mid.st.presses} presses counted for ${PRESSES.length} clicks (one hook path counts each once)`);
  if (!mid.wrapped.every(Boolean)) f.push(`the engine functions are not wrapped exactly once: ${JSON.stringify(mid.wrapped)}`);
  if (JSON.stringify(calls) !== JSON.stringify(want)) f.push(`recorded ${JSON.stringify(calls)} (want ${JSON.stringify(want)})`);
  if (recorded && recorded.steps.some((s) => s.do === 'wait')) f.push('a pause was recorded on a paused page');
  const opened = recorded ? await block(page, recorded.id).locator('.tmtl-qstep-title').allTextContents() : [];
  row({ gate: 'Q11 record: real clicks (the log OFF) → steps, a repeated press folded to ×N, each press counted once', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${mid.st.presses} presses → ${JSON.stringify(calls)}; shown as ${opened.map((t) => `"${t}"`).join(', ')}; the log never on` });
  await context.close();
}
async function legReplay(browser) {
  const f = [];
  if (!recorded || !startJSON) { row({ gate: 'Q12 replay: the recorded queue makes the same calls with the same effects as the presses (two state logs compared)', id: 'ptr', ok: false, notes: 'Q11 produced no queue' }); return; }
  const actions = (page) => page.evaluate(() => tmtLoader.stateLog.text().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.type === 'action' && (r.source === 'player' || r.source === 'queue')).map((r) => ({ source: r.source, call: r.call, args: r.args, did: r.did, state: r.state })));
  // (a) by hand, the log ON
  let hand;
  {
    const { context, page } = await fresh(browser);
    await pageLoadFrom(page, startJSON);
    await page.evaluate(() => tmtLoader.pause());
    await page.evaluate(() => tmtLoader.fetchStateLog().then(() => tmtLoader.stateLog.setPage(true)));
    for (const [l, k, i] of PRESSES) await press(page, l, k, i);
    hand = await actions(page);
    await context.close();
  }
  // (b) the recorded queue, the log ON
  let played, st;
  {
    const { context, page } = await fresh(browser);
    await pageLoadFrom(page, startJSON);
    await page.evaluate(() => tmtLoader.pause());
    await page.evaluate(() => tmtLoader.fetchStateLog().then(() => tmtLoader.stateLog.setPage(true)));
    await showQueues(page);
    const r = await apiQueue(page, recorded, true);
    if (!r.ok) f.push(`not armed: ${r.errors}`);
    await page.evaluate(() => tmtLoader.tick(1, 1));
    st = await page.evaluate((id) => tmtLoader.queues.status().queues.find((q) => q.id === id), recorded.id);
    played = await actions(page);
    await context.close();
  }
  const key = (x) => JSON.stringify([x.call, x.args, x.did, Object.keys(x.state || {}).filter((k) => /\.(upg|b\.\d+)$/.test(k)).sort().map((k) => [k, x.state[k]])]);
  const hk = hand.map(key), pk = played.map(key);
  if (hand.some((x) => x.source !== 'player') || hand.length !== PRESSES.length) f.push(`by hand: ${hand.length} player records`);
  if (played.some((x) => x.source !== 'queue')) f.push('the replay wrote a non-queue record');
  if (JSON.stringify(hk) !== JSON.stringify(pk)) f.push(`differ:\nby hand ${hk.join(' | ')}\nqueue   ${pk.join(' | ')}`);
  if (!st || st.state !== 'done') f.push(`the queue ${JSON.stringify(st)}`);
  row({ gate: 'Q12 replay: the recorded queue makes the same calls with the same effects as the presses (two state logs compared)', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${hand.length} player records = ${played.length} queue records (call, args, did, the upgrade/buyable keys they changed); the queue done` });
}

const MEASURE = () => {
  const vw = document.documentElement.clientWidth;
  const r = document.querySelector('#app .tmtl-qedit');
  if (!r) return { vw, none: true };
  const pane = r.closest('.upgTable') || r.parentElement.closest('.tmtl-queues-shell') || r.parentElement;
  const shell = r.closest('.tmtl-queues-shell');
  const pr = (shell && shell.closest('.upgTable') || pane).getBoundingClientRect(), rr = r.getBoundingClientRect();
  const out = { vw, scrollW: document.documentElement.scrollWidth, root: Math.round(rr.width), pane: Math.round(pr.width), past: [], n: 0 };
  const edge = Math.min(vw, pr.right) + 0.5;
  if (r.scrollWidth > r.clientWidth + 1) out.past.push(`the editor overflows its column: ${r.scrollWidth} of ${r.clientWidth}`);
  for (const e of r.querySelectorAll('input, select, button, .tmtl-qstep-title, .tmtl-qqueue-name, .tmtl-qrun div, span, b, div')) {
    const b = e.getBoundingClientRect();
    if (!b.width) continue;
    out.n++;
    if (b.right > edge) out.past.push(`${e.tagName.toLowerCase()}.${String(e.className || '').split(' ')[0]} "${(e.textContent || e.value || '').trim().slice(0, 30)}" right ${Math.round(b.right)}`);
  }
  return out;
};
async function legPhone(browser) {
  const f = [], seen = [];
  for (const mobile of [false, true]) {
    const { context, page } = await fresh(browser, { width: 390, mobile });
    await showQueues(page);
    const made = await apiQueue(page, { format: 'tmt-queue/1', version: 2, id: 'phone-a-rather-long-queue-id-that-must-wrap', name: 'a queue with a long name that has to wrap on a phone screen, word by word', comment: 'a long comment that also has to wrap at three hundred and ninety pixels wide, word by word',
      trigger: { on: 'predicate', when: 'player.points.gte(new Decimal("1e1000")) && hasUpgrade("p", 11) && player.p.points.gte(10)' },
      steps: [{ do: 'call', fn: 'buyUpgrade', args: ['p', 11], times: 3, comment: 'a step note that is long enough to need two lines on a phone' }, { do: 'wait', until: 'player.points.gte(new Decimal("1e100")) || hasUpgrade("p", 12)', timeout: { gs: 120 }, onTimeout: 'skip' },
        { do: 'hold', features: ['reset:p', 'upgrades:p', 'reset:b', 'reset:g'] }, { do: 'release' }, { do: 'comment', text: 'a comment step whose text is long enough to wrap, several times over, on a phone' }] }, true);
    if (!made.ok) f.push(`${mobile ? '?mobile=1' : 'plain'}: the queue was refused: ${made.errors}`);
    await tick(page, 2);
    for (const b of await page.locator('button.tmtl-qstep-edit').all()) { await b.click(); await page.waitForTimeout(30); }
    await page.locator('button.tmtl-qcat-toggle').click();
    await page.waitForSelector('.tmtl-qcat-entry', { timeout: 10000 }).catch(() => {});
    await redraw(page);
    const m = await page.evaluate(MEASURE);
    seen.push({ mobile, ...m, past: m.past ? m.past.length : null });
    if (m.none) f.push(`${mobile ? '?mobile=1' : 'plain'}: no editor`);
    else {
      if (m.past.length) f.push(`${mobile ? '?mobile=1' : 'plain'}: ${m.past.length} past the edge: ${m.past.slice(0, 4).join(' · ')}`);
      if (m.scrollW > m.vw) f.push(`${mobile ? '?mobile=1' : 'plain'}: page scrollWidth ${m.scrollW} > ${m.vw}`);
      if (m.root < m.pane - 1 || m.root < 150) f.push(`${mobile ? '?mobile=1' : 'plain'}: the editor is ${m.root} px in a ${m.pane} px pane (vacuous)`);
      if (m.n < 80) f.push(`${mobile ? '?mobile=1' : 'plain'}: only ${m.n} elements measured`);
    }
    await context.close();
  }
  row({ gate: 'Q13 phone: at 390 px nothing in the editor is past the edge, no page scroll, the editor is as wide as its pane', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.map((s) => `${s.mobile ? '?mobile=1' : 'plain'}: ${s.n} elements, 0 past, scrollWidth ${s.scrollW}/${s.vw}, editor ${s.root} of pane ${s.pane}`).join(' · ') });
}

async function legEngines(browser) {
  const f = [], seen = [];
  for (const id of ['something', 'arctree']) {
    const { context, page, errs, ld } = await fresh(browser, { id, width: 390, mobile: true });
    if (!ld.ready) { f.push(`${id}: did not load ${JSON.stringify(ld.error)}`); await context.close(); continue; }
    await showQueues(page);
    const a = await page.evaluate(() => {
      const acts = tmtLoader.qedit.actions(), all = [].concat(...acts.map((g) => g.actions));
      const up = all.find((x) => /^Buy upgrade “/.test(x.label)) || all[0];
      const feat = tmtLoader.features[0] ? tmtLoader.features[0].id : null;
      return { layers: acts.length, n: all.length, up, feat, raw: all.filter((x) => /“(upgrade|buyable) \d+”/.test(x.label)).length };
    });
    if (!a.up) { f.push(`${id}: no actions offered`); await context.close(); continue; }
    const q = { format: 'tmt-queue/1', version: 2, id: 'eng', name: 'engine', steps: [{ do: 'hold', features: [a.feat] }, { do: 'call', fn: a.up.fn, args: a.up.args }, { do: 'comment', text: 'done' }, { do: 'release' }] };
    const r = await apiQueue(page, q, true);
    if (!r.ok) f.push(`${id}: refused ${r.errors}`);
    await tick(page, 2);
    const st = await page.evaluate(() => { const x = tmtLoader.queues.status().queues.find((y) => y.id === 'eng'); return x ? { state: x.state, holds: x.holds } : null; });
    if (!st || st.state !== 'done' || st.holds.length || await page.evaluate(() => tmtLoader.queueLink.holds !== null)) f.push(`${id}: the queue ${JSON.stringify(st)}`);
    const title = await page.locator('.tmtl-qqueue[data-queue="eng"] .tmtl-qstep-title').nth(1).textContent();
    const m = await page.evaluate(MEASURE);
    if (m.none || m.past.length || m.scrollW > m.vw || m.root < m.pane - 1) f.push(`${id}: phone ${JSON.stringify({ past: m.past && m.past.slice(0, 3), scrollW: m.scrollW, root: m.root, pane: m.pane })}`);
    if (errs.length) f.push(`${id}: page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`${id}: ${a.n} actions over ${a.layers} layers (${a.raw} with no title of their own), "${title.trim()}" ran to done; 390 px: ${m.n} elements, 0 past`);
    await context.close();
  }
  row({ gate: 'Q14 engines: Something (2.7) and Arc Tree (2.6): names offered, a queue runs and releases, nothing past the edge at 390 px', id: 'something+arctree', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

async function partPage() {
  const { chromium } = await import('playwright');
  ({ openContext, openGame, pageLoadFrom } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  const LEGS = { inert: legInert, persist: legPersist, names: legNames, roundtrip: legRoundtrip, refuse: legRefuse, start: legStart, predicate: legPredicate,
    status: legStatus, release: legRelease, generated: legGenerated, record: legRecord, replay: legReplay, phone: legPhone, engines: legEngines };
  try {
    for (const k of PAGE_ROWS) {
      if (!want(k)) continue;
      if (k === 'replay' && ONLY && !ONLY.includes('record')) { await legRecord(browser); rows.pop(); }
      try { await LEGS[k](browser); } catch (e) { row({ gate: `Q ${k}`, id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 500)}` }); }
    }
  } finally { await browser.close(); server.stop(); }
}

// ---- Part grep -------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const srcs = ['loader/tmt-qedit.js'].map((f) => [f, fs.readFileSync(path.join(REPO, f), 'utf8')]);
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) { if (ids.includes(l)) hits.push(`${name}: game id '${l}'`); if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`); }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'G1 no game or layer id in the editor', id: '—', ok: !hits.length, notes: hits.length ? hits.join('; ') : `${srcs.length} source, ${ids.length} game ids and ${ptrLayers.length} ptr layer ids checked against every string literal and every layers/player/tmp member access` });
}

if (PART === 'page' || PART === 'all') await partPage();
if (PART === 'grep' || PART === 'all') partGrep();
const expected = (PART === 'grep' ? 0 : (ONLY ? ONLY.length : PAGE_ROWS.length)) + (PART === 'page' ? 0 : 1);
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT qedit part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-qedit-part${PART}-last.json`), { commit, dirty, rows });
if (!a['no-summary']) appendSection({ title: `qedit-1 queue editor — part ${PART}`, commit, dirty, rows, slug: null,
  reading: 'page = the editor driven through Playwright: inert until opened, persistence in the declared key, the game\'s names, export/import, refusal, both triggers, the run-status, holds released, a generated queue, recording and its replay, the phone width; grep = no game id in the editor.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
