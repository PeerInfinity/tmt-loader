#!/usr/bin/env node
// parts-1 — EVERY AUTOMATION PART VISIBLE AND EDITABLE (docs/automation.md, "Stages" → "Switched off by you";
// docs/queues.md, "The Parts subtab"), driven through the PAGE (Playwright), plus the format's version 4 headless.
//
//   node tools/harness/gates-parts.mjs --part page|v4|grep|all [--only <row-key>[,…]] [--no-summary] [--no-write] [--assert]
//
// Part page  every row drives the real page (ptr unless it says otherwise), managed (`?managed=1`: ticks are the gate's):
//   P1 inert     an automation page whose Parts subtab is never opened — Simple and Advanced shown, 200 ticks — requests
//                no `loader/tmt-qedit.js`, stores no new key (no `tmt-loader:ptr:parts`), and the core's switch store
//                was never written (G1)
//   P2 listed    at m28/QL6 the Parts subtab lists every stage of the table with its NAME, its NOTE, its condition as
//                clauses (each with its truth now), what it sets by feature TITLES, whether it is in force, and its
//                evidence; and the shipped queue, marked as part of the game's automation, with its LIVE state
//                (running: its step, its time left, what it has paused) — and with developer details off no raw feature
//                id anywhere in the two lists (the steps and the evidence opened)
//   P3 copy      "copy to my queues" puts an editable copy in the player's own queues (Off); renamed and given a step
//                through the editor's own fields, it is stored in the ONE queue key; the shipped one is unchanged
//   P4 queue-off "switch off for me" on the RUNNING shipped queue: its holds are released at once, it is skipped by name
//                ("switched off by you"); reloaded, it is still skipped, the switch is in the ONE declared key
//                `tmt-loader:ptr:parts` and nowhere in `player`, and the table the page fetched is the file on disk;
//                "switch back on" arms it again
//   P5 stage-off "switch off for me" on a stage in force (ql5-quirk-rate at QL6): the feature it set falls back to the
//                table's own policy, the reason line and the feature's block say "switched off by you"; reloaded, still
//                off; switched back on, the stage's policy is back
//   P6 when      "change its condition for me": a condition that does not compile is refused with the reason and
//                nothing is stored; a valid one is in force by the player's condition; "use the game's condition"
//                gives it back
//   P7 link      the Advanced view's STAGE name and the shipped-queue block's link open the Parts subtab on that
//                part's entry
//   P8 phone     at 390 px (with and without `?mobile=1`), every list opened: nothing past the edge, no page scroll,
//                the Parts root as wide as its pane, no `white-space:nowrap` inside it
//   P9 engines   Something Tree (2.7, no table) and Arc Tree (2.6): the Parts subtab opens with no stage or shipped list,
//                the player's queues work, nothing past the edge at 390 px, no page error
// Part v4     V1 the H22 queue the table ships (version 4: its two confirmations in TICKS) played from m28/QL6 until H22
//                is completed, at diff 1 and at 0.05, against the SAME queue written in game-seconds (version 3, the
//                table before this slice): equal ticks and hashes at the completion — no pin moves — and both
//                confirmations are met in the slot of their call (0 ticks waited), in the state log
// Part grep   X1 no game id and no ptr layer id in the code this slice changed (the editor, the runner, the core).
// ⛔ EVERY FLAG IS DECLARED; `--assert` requires the exact row count, all green.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, entryOnly, startServer } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'only', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part || 'all');
if (!['page', 'v4', 'grep', 'all'].includes(PART)) { console.error(`REFUSED: --part ${PART} is not page | v4 | grep | all`); process.exit(2); }
const PAGE_ROWS = ['inert', 'listed', 'copy', 'queue-off', 'stage-off', 'when', 'link', 'phone', 'engines'];
const ONLY = a.only ? String(a.only).split(',') : null;
if (ONLY) for (const o of ONLY) if (!PAGE_ROWS.includes(o)) { console.error(`REFUSED: --only ${o} is not one of ${PAGE_ROWS.join(', ')}`); process.exit(2); }
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 1200)}`); };
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-parts-'));
const want = (k) => !ONLY || ONLY.includes(k);

// ⚠ This file is the ORACLE, and ptr's ids are its data (the loader may not name them — part grep).
const PARTS_KEY = 'tmt-loader:ptr:parts', QUEUES_KEY = 'tmt-loader:ptr:queues';
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json';
const H22Q = 'ca-ch-h-22', RATE = 'ql5-quirk-rate', HOLD = 'ql6-hold-for-q32';
const TABLE = 'games-auto/ptr.json';
const tableDoc = () => JSON.parse(fs.readFileSync(path.join(REPO, TABLE), 'utf8'));
// a raw feature id in words a player reads: `<kind>:<layer>`
const RAW_ID = /(^|[^\w:-])(reset|upgrades|buyables|challenges|clickables|toggles|milestones):[a-z0-9]+(?![\w:])/;

// ---- page helpers ------------------------------------------------------------------------------------------------------
let openContext, openGame, pageLoadFrom, waitReady;
let server = null;
async function redraw(page) {
  await page.evaluate(() => { try { updateTemp(); } catch (e) { /* */ } if (typeof updateTabFormats === 'function') updateTabFormats(); });
  await page.waitForTimeout(150);
}
async function tick(page, n, diff = 0.05) { await page.evaluate(([d, k]) => tmtLoader.tick(d, k), [diff, n]); await redraw(page); }
async function showParts(page) {
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Parts'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-qedit', { timeout: 15000 });
  await page.waitForFunction(() => tmtLoader.queues && tmtLoader.queues.ready, null, { timeout: 15000 });
  await redraw(page);
}
const keys = (page) => page.evaluate(() => Object.keys(localStorage).sort());
const raw = (page, k) => page.evaluate((x) => tmtLoader.storage.raw.getItem.call(localStorage, x), k);
async function fresh(browser, { width = 1280, mobile = false, id = 'ptr', profile = 'all' } = {}) {
  const { context, stats } = await openContext(browser, { contextOptions: { viewport: { width, height: 900 } } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  let ld;
  if (mobile) { await page.goto(new URL(`index.html?mod=${id}&managed=1&automation=1&mobile=1&profile=${profile}`, server.url).href, { waitUntil: 'load' }); ld = await waitReady(page); }
  else ld = await openGame(page, server.url, id, { profile });
  return { context, page, stats, errs, ld };
}
/** m28/QL6 on the page: the save and the automation's memory, as the harness restores them. Reloads the page (the
 *  player's stored switches survive it, as they survive any reload). */
async function atQL6(page) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, QL6), 'utf8'));
  await pageLoadFrom(page, s.player);
  await page.evaluate(() => tmtLoader.pause());
  await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
}
const status = (page, id = H22Q) => page.evaluate((x) => { const q = tmtLoader.queues.status().queues.find((y) => y.id === x); return q ? { state: q.state, holds: q.holds, phase: q.shipped && q.shipped.phase } : null; }, id);
const policy = (page, f) => page.evaluate((x) => tmtLoader.explain().find((r) => r.id === x).policy.inForce, f);

// ---- the legs ----------------------------------------------------------------------------------------------------------
async function legInert(browser) {
  const f = [];
  const { context, page, stats, ld } = await fresh(browser);
  if (!ld.ready) f.push(`did not load: ${JSON.stringify(ld.error)}`);
  const k0 = await keys(page);
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Simple'; });
  await tick(page, 100);
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
  await tick(page, 100);
  const asked = stats.of(page).urls.filter((u) => /loader\/tmt-qedit\.js|games-queues\//.test(u));
  if (asked.length) f.push(`requested without the Parts tab: ${asked.join(', ')}`);
  const k1 = await keys(page);
  if (JSON.stringify(k0) !== JSON.stringify(k1)) f.push(`stored keys moved: ${JSON.stringify(k0)} → ${JSON.stringify(k1)}`);
  const t = await page.evaluate((k) => ({ writes: tmtLoader.parts.writes(), key: tmtLoader.parts.key(), stored: tmtLoader.storage.raw.getItem.call(localStorage, k), qedit: typeof tmtLoader.qedit, subs: Object.keys(layers[tmtLoader.auLayer].tabFormat) }), PARTS_KEY);
  if (t.writes !== 0 || t.stored !== null) f.push(`the switch store was written: ${JSON.stringify(t)}`);
  if (t.key !== PARTS_KEY) f.push(`the declared key is ${t.key}`);
  if (t.qedit !== 'undefined') f.push('tmtLoader.qedit exists');
  if (JSON.stringify(t.subs) !== '["Simple","Advanced","Progress","Parts"]') f.push(`subtabs ${JSON.stringify(t.subs)}`);
  row({ gate: 'P1 inert: the Parts subtab never opened → no editor request, no new key, the switch store never written', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `0 editor requests among ${stats.of(page).urls.length}; stored keys unchanged (${k1.length}); parts writes 0; subtabs ${t.subs.join('/')}` });
  await context.close();
}

async function legListed(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await atQL6(page);
  await page.evaluate(() => tmtLoader.setDevDetails(false));
  await showParts(page);
  await tick(page, 40);
  for (const b of await page.locator('button.tmtl-qstage-evidence, button.tmtl-qshipped-evidence, button.tmtl-qshipped-steps-toggle').all()) { await b.click(); await page.waitForTimeout(20); }
  await redraw(page);
  const t = tableDoc();
  const v = await page.evaluate(() => {
    const tx = (e, s) => { const x = e.querySelector(s); return x ? x.textContent.replace(/\s+/g, ' ').trim() : null; };
    return {
      stages: [...document.querySelectorAll('.tmtl-qstage')].map((e) => ({ id: e.dataset.stage, state: e.dataset.state, name: tx(e, '.tmtl-qstage-name'), note: tx(e, '.tmtl-qstage-note'), stateText: tx(e, '.tmtl-qstage-state'),
        clauses: [...e.querySelectorAll('.tmtl-qcond-clause')].map((c) => ({ now: c.dataset.now, text: c.textContent.replace(/\s+/g, ' ').trim() })),
        sets: [...e.querySelectorAll('.tmtl-qstage-sets')].map((c) => ({ id: c.dataset.feature, text: c.textContent.replace(/\s+/g, ' ').trim() })), ev: e.querySelectorAll('.tmtl-qstage-ev > div').length })),
      shipped: [...document.querySelectorAll('.tmtl-qshipped')].map((e) => ({ id: e.dataset.queue, state: e.dataset.state, name: tx(e, '.tmtl-qshipped-name'), stateText: tx(e, '.tmtl-qshipped-state'), all: e.textContent.replace(/\s+/g, ' '),
        step: tx(e, '.tmtl-qrun-step'), wait: tx(e, '.tmtl-qrun-wait'), holds: tx(e, '.tmtl-qrun-holds'), steps: e.querySelectorAll('.tmtl-qshipped-step').length, ev: e.querySelectorAll('.tmtl-qshipped-ev > div').length })),
      playerText: [...document.querySelectorAll('.tmtl-parts-stages, .tmtl-parts-shipped')].map((e) => e.textContent).join('\n'),
      titles: Object.fromEntries(tmtLoader.features.map((x) => [x.id, x.title])),
      active: tmtLoader.stages().filter((s) => s.active).map((s) => s.id),
    };
  });
  if (v.stages.length !== t.stages.length) f.push(`${v.stages.length} stages listed for ${t.stages.length} in the table`);
  for (const S of t.stages) {
    const x = v.stages.find((y) => y.id === S.id);
    if (!x) { f.push(`stage ${S.id} not listed`); continue; }
    if (x.name !== S.name) f.push(`${S.id}: name "${x.name}" (want "${S.name}")`);
    if (!S.note || x.note !== S.note) f.push(`${S.id}: note missing or not the table's`);
    if (!x.clauses.length || x.clauses.some((c) => !['yes', 'no', 'error'].includes(c.now))) f.push(`${S.id}: condition clauses ${JSON.stringify(x.clauses)}`);
    const named = [...Object.keys(S.policies || {}), ...Object.keys(S.gates || {})];
    if (x.sets.length !== named.length || x.sets.some((s) => !v.titles[s.id] || !s.text.includes(v.titles[s.id]))) f.push(`${S.id}: what it sets ${JSON.stringify(x.sets.map((s) => s.text.slice(0, 50)))}`);
    if (x.ev !== [].concat(S.provenance).length) f.push(`${S.id}: ${x.ev} evidence lines for ${[].concat(S.provenance).length} records`);
    const on = v.active.includes(S.id);
    if ((x.state === 'on') !== on || (on && !/in force now/.test(x.stateText))) f.push(`${S.id}: shows ${x.state} "${x.stateText}", in force ${on}`);
  }
  if (!v.stages.some((x) => x.state === 'on')) f.push('no stage in force at QL6 (a vacuous leg)');
  const sq = v.shipped.find((x) => x.id === H22Q);
  if (!sq) f.push('the shipped queue is not listed');
  else {
    if (!/part of this game’s automation/.test(sq.all)) f.push('it is not marked as part of the game\'s automation');
    if (sq.state !== 'running' || !/running/.test(sq.stateText)) f.push(`its state "${sq.stateText}" (${sq.state})`);
    if (!sq.step || !/step \d+ of 7/.test(sq.step)) f.push(`step line "${sq.step}"`);
    if (!sq.wait || !/left of/.test(sq.wait)) f.push(`wait line "${sq.wait}"`);
    if (!sq.holds || !sq.holds.includes(v.titles['reset:q'])) f.push(`holds line "${sq.holds}"`);
    if (sq.steps !== 7 || sq.ev < 1) f.push(`${sq.steps} steps, ${sq.ev} evidence lines`);
  }
  const rawIds = (v.playerText.match(new RegExp(RAW_ID.source, 'g')) || []);
  if (rawIds.length) f.push(`raw feature ids in the player view: ${rawIds.slice(0, 5).join(', ')}`);
  row({ gate: 'P2 listed: every stage (name, note, condition clauses with their truth, what it sets by title, in force, evidence) and the shipped queue (part of the game, running, its step, time left, holds) — no raw feature id', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${v.stages.map((x) => `${x.id} "${x.name}" ${x.state} (${x.clauses.length} clauses, ${x.sets.length} sets, ${x.ev} evidence)`).join(' · ')} · ${sq.name}: "${sq.stateText}", "${sq.step.slice(0, 60)}…", "${sq.wait}"` });
  await context.close();
}

async function legCopy(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await showParts(page);
  const before = JSON.stringify(await page.evaluate(() => tmtLoader.autoQueues));
  await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] button.tmtl-qshipped-copy`).click();
  const id = `${H22Q}-copy`;
  await page.waitForFunction((x) => tmtLoader.qedit.list().some((q) => q.id === x), id, { timeout: 10000 }).catch(() => f.push('the copy did not arrive in the player\'s queues'));
  await redraw(page);
  const B = page.locator(`.tmtl-qqueue[data-queue="${id}"]`);
  if (!(await B.count())) f.push('no block for the copy');
  else {
    const nm = B.locator('input.tmtl-qqueue-rename'); await nm.fill('my own Descension attempt'); await nm.press('Enter'); await redraw(page);
    await B.locator('select.tmtl-qadd-kind').selectOption('comment'); await B.locator('button.tmtl-qadd-go').click(); await redraw(page);
  }
  const st = await page.evaluate((x) => { const e = tmtLoader.qedit.store().queues.find((y) => y.queue.id === x); return e ? { enabled: e.enabled, name: e.queue.name, steps: e.queue.steps.length, version: e.queue.version, trigger: e.queue.trigger } : null; }, id);
  const stored = await raw(page, QUEUES_KEY);
  const after = JSON.stringify(await page.evaluate(() => tmtLoader.autoQueues));
  if (!st || st.enabled || st.name !== 'my own Descension attempt' || st.steps !== 8) f.push(`the stored copy ${JSON.stringify(st)}`);
  if (!st || st.trigger.on !== 'predicate' || !/freeLayers/.test(st.trigger.when)) f.push('the copy\'s trigger does not carry the table\'s boundary');
  if (!stored || !stored.includes('my own Descension attempt')) f.push(`the queue key does not hold it`);
  if (before !== after) f.push('the shipped queue changed');
  const again = await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] button.tmtl-qshipped-copy`).click().then(() => page.waitForTimeout(300)).then(() => page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] .tmtl-error`).textContent().catch(() => ''));
  if (!/already have the copy/.test(again)) f.push(`a second copy said "${again}"`);
  row({ gate: 'P3 copy: "copy to my queues" → an editable copy (Off), renamed and given a step in the editor, stored in the queue key; the shipped one unchanged', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${id}: ${JSON.stringify({ ...st, trigger: st.trigger.on })}; a second press: "${again.trim()}"` });
  await context.close();
}

async function legQueueOff(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await atQL6(page);
  await showParts(page);
  await tick(page, 20);
  const s0 = await status(page);
  const h0 = await page.evaluate(() => JSON.stringify(tmtLoader.queueLink.holds));
  await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] button.tmtl-qshipped-onoff`).click();
  await redraw(page);
  const s1 = await status(page);
  const h1 = await page.evaluate(() => tmtLoader.queueLink.holds);
  const shown = (await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] .tmtl-qshipped-state`).textContent()).trim();
  await tick(page, 20);
  const s2 = await status(page);
  const stored = await raw(page, PARTS_KEY);
  const inPlayer = await page.evaluate(() => /queuesOff|tmt-parts/.test(JSON.stringify(player)));
  // the reload: a fresh page, the same browser store
  await page.reload({ waitUntil: 'load' });
  await waitReady(page);
  const r = await page.evaluate(([id, k]) => ({ skipped: tmtLoader.queues.shippedSkipped(), loaded: tmtLoader.queues.status().queues.map((q) => q.id), table: tmtLoader.autoQueues.map((e) => [e.id, e.enabled]), off: tmtLoader.parts.queueOff(id),
    fetched: tmtLoader.autoQueues.find((e) => e.id === id).queue }), [H22Q, PARTS_KEY]);
  const disk = tableDoc().queues.find((e) => e.id === H22Q).queue;
  await showParts(page);
  const shown2 = (await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] .tmtl-qshipped-state`).textContent()).trim();
  await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] button.tmtl-qshipped-onoff`).click();
  await redraw(page);
  const back = await page.evaluate(([id, k]) => ({ st: (tmtLoader.queues.status().queues.find((q) => q.id === id) || {}).state, stored: tmtLoader.storage.raw.getItem.call(localStorage, k) }), [H22Q, PARTS_KEY]);
  if (!s0 || s0.state !== 'running' || !/reset:q/.test(h0)) f.push(`at QL6 it was not running and holding: ${JSON.stringify(s0)} ${h0}`);
  if (s1 !== null || h1 !== null) f.push(`after the switch: ${JSON.stringify(s1)}, holds ${JSON.stringify(h1)}`);
  if (s2 !== null) f.push(`it came back after 20 ticks: ${JSON.stringify(s2)}`);
  if (!/switched off by you/.test(shown)) f.push(`the entry says "${shown}"`);
  if (!stored || !JSON.parse(stored).queuesOff.includes(H22Q)) f.push(`the key holds ${stored}`);
  if (inPlayer) f.push('the switch is in `player`');
  if (!r.off || r.loaded.includes(H22Q) || !r.skipped.some((x) => x.id === H22Q && x.why === 'switched off by you')) f.push(`after the reload: ${JSON.stringify({ off: r.off, loaded: r.loaded, skipped: r.skipped })}`);
  if (JSON.stringify(r.table) !== JSON.stringify([[H22Q, true]]) || JSON.stringify(r.fetched) !== JSON.stringify(disk)) f.push('the table the page holds is not the file on disk, or its entry was switched off in it');
  if (!/switched off by you/.test(shown2)) f.push(`after the reload the entry says "${shown2}"`);
  if (back.st !== 'armed' || back.stored !== null) f.push(`switched back on: ${JSON.stringify(back)}`);
  row({ gate: 'P4 queue-off: the running shipped queue switched off for me — holds released, skipped by name, still after a reload; the switch only in the declared key; the table untouched; back on → armed', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `running holding ${h0} → off: no queue, no hold; "${shown}"; key ${stored}; reload: skipped ${JSON.stringify(r.skipped)}; table = disk; back on: ${back.st}, key removed` });
  await context.close();
}

async function legStageOff(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await atQL6(page);
  await page.evaluate(() => tmtLoader.setDevDetails(false));
  await showParts(page);
  await tick(page, 2);
  const t = tableDoc(), st = t.stages.find((s) => s.id === RATE), feat = Object.keys(st.policies)[0];
  const p0 = await policy(page, feat);
  await page.locator(`.tmtl-qstage[data-stage="${RATE}"] button.tmtl-qstage-onoff`).click();
  await tick(page, 3);
  const p1 = await policy(page, feat);
  const reason = await page.evaluate((x) => { const r = tmtLoader.explain().find((y) => y.id === x); return { text: tmtLoader.reasonText(r.last), view: r.stage }; }, feat);
  const shown = (await page.locator(`.tmtl-qstage[data-stage="${RATE}"] .tmtl-qstage-state`).textContent()).trim();
  await page.evaluate((x) => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; tmtLoader.setCollapsed(x, false); }, feat);
  await tick(page, 1);
  const block = await page.evaluate(() => { const e = document.querySelector('.tmtl-block .tmtl-stage-yours'); return e ? e.closest('.tmtl-block').textContent.replace(/\s+/g, ' ') : null; });
  await page.reload({ waitUntil: 'load' }); await waitReady(page);
  await atQL6(page);
  await tick(page, 2);
  const p2 = await policy(page, feat);
  const off2 = await page.evaluate((x) => tmtLoader.stages().find((s) => s.id === x), RATE);
  await showParts(page);
  await page.locator(`.tmtl-qstage[data-stage="${RATE}"] button.tmtl-qstage-onoff`).click();
  await tick(page, 2);
  const p3 = await policy(page, feat);
  const stored = await raw(page, PARTS_KEY);
  if (p0 !== st.policies[feat]) f.push(`at QL6 ${feat} decides by ${p0}, not the stage's ${st.policies[feat]} (a vacuous leg)`);
  if (p1 !== t.policies[feat]) f.push(`switched off: ${feat} decides by ${p1}, not the table's ${t.policies[feat]}`);
  if (!/stage ql5-quirk-rate switched off by you/.test(reason.text)) f.push(`the reason line "${reason.text}"`);
  if (!/switched off by you/.test(shown)) f.push(`the entry says "${shown}"`);
  if (!block || !/switched off by you/.test(block)) f.push('the feature\'s block does not say it');
  if (p2 !== t.policies[feat] || !off2.offByYou || off2.active) f.push(`after the reload: ${p2}, ${JSON.stringify({ off: off2.offByYou, active: off2.active })}`);
  if (p3 !== st.policies[feat] || stored !== null) f.push(`back on: ${p3}, key ${stored}`);
  row({ gate: 'P5 stage-off: a stage in force switched off for me — its feature falls back to the table\'s policy, the reason line and the block say so, still after a reload; back on, the stage\'s again', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `${feat}: ${p0} → ${p1}; reason "${reason.text.slice(0, 160)}"; reload ${p2}; back on ${p3}, key removed` });
  await context.close();
}

async function legWhen(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await atQL6(page);
  await showParts(page);
  await tick(page, 2);
  const t = tableDoc(), st = t.stages.find((s) => s.id === HOLD), feat = Object.keys(st.policies)[0];
  const p0 = await policy(page, feat);
  const S = page.locator(`.tmtl-qstage[data-stage="${HOLD}"]`);
  await S.locator('button.tmtl-qstage-editwhen').click(); await redraw(page);
  const inp = S.locator('input.tmtl-qstage-when');
  await inp.fill('player.('); await inp.press('Enter'); await redraw(page);
  const said = await S.locator('.tmtl-error').first().textContent().catch(() => '');
  const k1 = await raw(page, PARTS_KEY);
  await inp.fill('false'); await inp.press('Enter');
  await tick(page, 2);
  const p1 = await policy(page, feat);
  const v1 = await page.evaluate((x) => tmtLoader.stages().find((s) => s.id === x), HOLD);
  const k2 = await raw(page, PARTS_KEY);
  const label = await S.textContent();
  await S.locator('button.tmtl-qstage-gamewhen').click();
  await tick(page, 2);
  const p2 = await policy(page, feat);
  const k3 = await raw(page, PARTS_KEY);
  if (p0 !== st.policies[feat]) f.push(`at QL6 ${feat} decides by ${p0} (a vacuous leg)`);
  if (!/does not understand/.test(said) || k1 !== null) f.push(`a bad condition: said "${said}", stored ${k1}`);
  if (p1 === st.policies[feat] || v1.active || v1.whenYours !== 'false') f.push(`by the player's own condition: ${p1}, ${JSON.stringify({ active: v1.active, whenYours: v1.whenYours })}`);
  if (!k2 || JSON.parse(k2).when[HOLD] !== 'false') f.push(`the key holds ${k2}`);
  if (!/your own condition/.test(label)) f.push('the entry does not say the condition is the player\'s');
  if (p2 !== st.policies[feat] || k3 !== null) f.push(`the game's condition back: ${p2}, key ${k3}`);
  row({ gate: 'P6 when: my own condition for a stage — a bad one refused and nothing stored, a good one in force instead of the table\'s, "use the game\'s condition" gives it back', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `refused: "${said.trim().slice(0, 100)}"; "false" → ${feat} ${p0} → ${p1}; key ${k2}; given back → ${p2}` });
  await context.close();
}

async function legLink(browser) {
  const f = [];
  const { context, page } = await fresh(browser);
  await atQL6(page);
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; tmtLoader.setCollapsedAll(false); });
  await tick(page, 2);
  const chip = page.locator(`.tmtl-block a.tmtl-part-link[data-part="stage:${RATE}"]`).first();
  if (!(await chip.count())) f.push('no link on the STAGE name');
  else {
    await chip.click();
    await page.waitForSelector(`.tmtl-qstage[data-stage="${RATE}"]`, { timeout: 15000 }).catch(() => f.push('the Parts subtab did not open on the stage'));
    await redraw(page);
    const v = await page.evaluate((x) => ({ sub: player.subtabs[tmtLoader.auLayer].mainTabs, focused: !!document.querySelector(`.tmtl-qstage[data-stage="${x}"][data-focused="1"]`), top: Math.round(document.querySelector(`.tmtl-qstage[data-stage="${x}"]`).getBoundingClientRect().top) }), RATE);
    if (v.sub !== 'Parts' || !v.focused) f.push(`after the stage link: ${JSON.stringify(v)}`);
  }
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
  await tick(page, 1);
  const ql = page.locator(`.tmtl-queue[data-queue="${H22Q}"] a.tmtl-part-link`);
  if (!(await ql.count())) f.push('no link on the shipped-queue block');
  else {
    await ql.click();
    await page.waitForSelector(`.tmtl-qshipped[data-queue="${H22Q}"][data-focused="1"]`, { timeout: 15000 }).catch(() => f.push('the Parts subtab did not open on the shipped queue'));
  }
  row({ gate: 'P7 link: the STAGE name and the shipped-queue block in the Advanced view open the Parts subtab on that part\'s entry', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : `stage:${RATE} and queue:${H22Q} each opened Parts on their own entry (focused)` });
  await context.close();
}

const MEASURE = () => {
  const vw = document.documentElement.clientWidth;
  const r = document.querySelector('#app .tmtl-qedit');
  if (!r) return { vw, none: true };
  const shell = r.closest('.tmtl-queues-shell');
  const pane = (shell && shell.closest('.upgTable')) || r.parentElement;
  const pr = pane.getBoundingClientRect(), rr = r.getBoundingClientRect();
  const out = { vw, scrollW: document.documentElement.scrollWidth, root: Math.round(rr.width), pane: Math.round(pr.width), past: [], nowrap: [], n: 0 };
  const edge = Math.min(vw, pr.right) + 0.5;
  if (r.scrollWidth > r.clientWidth + 1) out.past.push(`the Parts root overflows its column: ${r.scrollWidth} of ${r.clientWidth}`);
  for (const e of r.querySelectorAll('*')) {
    // (a <select>'s <option> is the browser's own nowrap, inside a control that wraps as one box)
    if (getComputedStyle(e).whiteSpace === 'nowrap' && e.textContent.trim() && e.tagName !== 'OPTION' && e.tagName !== 'OPTGROUP') out.nowrap.push(`${e.tagName.toLowerCase()}.${String(e.className || '').split(' ')[0]}`);
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
    await atQL6(page);
    await page.evaluate(() => tmtLoader.parts.setStageWhen('ql5-quirk-rate', 'player.q.buyables[11].plus(tmp.q.freeLayers).gte(5) && player.points.gte(new Decimal("1e100"))'));
    await showParts(page);
    await tick(page, 20);
    await page.locator(`.tmtl-qshipped[data-queue="${H22Q}"] button.tmtl-qshipped-copy`).click();
    await page.waitForTimeout(300);
    for (const b of await page.locator('button.tmtl-qstage-evidence, button.tmtl-qstage-editwhen, button.tmtl-qshipped-evidence, button.tmtl-qshipped-steps-toggle, button.tmtl-qstep-edit').all()) { await b.click(); await page.waitForTimeout(20); }
    await redraw(page);
    const m = await page.evaluate(MEASURE);
    const tag = mobile ? '?mobile=1' : 'plain';
    seen.push({ tag, ...m, past: m.past ? m.past.length : null, nowrap: m.nowrap ? m.nowrap.length : null });
    if (m.none) f.push(`${tag}: no Parts root`);
    else {
      if (m.past.length) f.push(`${tag}: ${m.past.length} past the edge: ${m.past.slice(0, 4).join(' · ')}`);
      if (m.nowrap.length) f.push(`${tag}: white-space:nowrap in ${m.nowrap.slice(0, 4).join(', ')}`);
      if (m.scrollW > m.vw) f.push(`${tag}: page scrollWidth ${m.scrollW} > ${m.vw}`);
      if (m.root < m.pane - 1 || m.root < 150) f.push(`${tag}: the Parts root is ${m.root} px in a ${m.pane} px pane (vacuous)`);
      if (m.n < 200) f.push(`${tag}: only ${m.n} elements measured`);
    }
    await context.close();
  }
  row({ gate: 'P8 phone: at 390 px, every list opened, nothing in the Parts subtab is past the edge, no page scroll, no nowrap, the root as wide as its pane', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.map((s) => `${s.tag}: ${s.n} elements, 0 past, 0 nowrap, scrollWidth ${s.scrollW}/${s.vw}, root ${s.root} of pane ${s.pane}`).join(' · ') });
}

async function legEngines(browser) {
  const f = [], seen = [];
  for (const id of ['something', 'arctree']) {
    const { context, page, errs, ld } = await fresh(browser, { id, width: 390, mobile: true });
    if (!ld.ready) { f.push(`${id}: did not load ${JSON.stringify(ld.error)}`); await context.close(); continue; }
    await showParts(page);
    const v = await page.evaluate(() => ({ stages: document.querySelectorAll('.tmtl-qstage').length, shipped: document.querySelectorAll('.tmtl-qshipped').length, intro: !!document.querySelector('.tmtl-parts-intro'), mine: !!document.querySelector('.tmtl-qnew-go'),
      api: [tmtLoader.qedit.stages().length, tmtLoader.qedit.shipped().length], parts: tmtLoader.parts.get() }));
    await page.locator('button.tmtl-qnew-go').click(); await redraw(page);
    const made = await page.evaluate(() => tmtLoader.qedit.list().length);
    const m = await page.evaluate(MEASURE);
    if (v.stages || v.shipped || v.api.join() !== '0,0') f.push(`${id}: lists ${JSON.stringify(v)}`);
    if (!v.intro || !v.mine || made !== 1) f.push(`${id}: the subtab ${JSON.stringify(v)}, ${made} queue(s) made`);
    if (m.none || m.past.length || m.scrollW > m.vw || m.root < m.pane - 1 || m.nowrap.length) f.push(`${id}: phone ${JSON.stringify({ past: m.past && m.past.slice(0, 3), nowrap: m.nowrap, scrollW: m.scrollW, root: m.root, pane: m.pane })}`);
    if (errs.length) f.push(`${id}: page errors ${errs.slice(0, 2).join(' | ')}`);
    seen.push(`${id}: no stage, no shipped queue, a queue made; 390 px: ${m.n} elements, 0 past`);
    await context.close();
  }
  row({ gate: 'P9 engines: Something (2.7) and Arc Tree (2.6) — the Parts subtab with no game parts, the player\'s queues work, nothing past the edge at 390 px', id: 'something+arctree', ok: !f.length,
    notes: f.length ? f.join('; ') : seen.join(' · ') });
}

async function partPage() {
  const { chromium } = await import('playwright');
  ({ openContext, openGame, pageLoadFrom, waitReady } = await import('./page.mjs'));
  server = await startServer(REPO);
  const browser = await chromium.launch();
  const LEGS = { inert: legInert, listed: legListed, copy: legCopy, 'queue-off': legQueueOff, 'stage-off': legStageOff, when: legWhen, link: legLink, phone: legPhone, engines: legEngines };
  try {
    for (const k of PAGE_ROWS) {
      if (!want(k)) continue;
      try { await LEGS[k](browser); } catch (e) { row({ gate: `P ${k}`, id: 'ptr', ok: false, notes: `threw: ${String(e && e.stack || e).slice(0, 500)}` }); }
    }
  } finally { await browser.close(); server.stop(); }
}

// ---- Part v4 -----------------------------------------------------------------------------------------------------------
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
async function run(flags) {
  const f = path.join(TMP, `run-${++seq}.json`);
  const args = [path.join(REPO, 'tools/harness/run.mjs'), 'ptr', '--json', f];
  for (const [k, v] of Object.entries(flags)) if (v !== undefined && v !== null) args.push(`--${k}`, String(v));
  const r = await child(args);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return { ok: false, error: r.out.slice(-600) }; }
}
async function partV4() {
  const t = tableDoc(), e = t.queues.find((x) => x.id === H22Q);
  // the table BEFORE this slice's v4: the same queue, version 3, its two confirmations in game-seconds
  const old = JSON.parse(JSON.stringify(t)), oq = old.queues.find((x) => x.id === H22Q).queue;
  oq.version = 3;
  for (const s of oq.steps) if (s.timeout && s.timeout.ticks !== undefined) s.timeout = { gs: 2 };
  const oldFile = path.join(TMP, 'table-gs.json'); fs.writeFileSync(oldFile, JSON.stringify(old, null, 2));
  const tickWaits = e.queue.steps.map((s, i) => [i + 1, s]).filter(([, s]) => s.timeout && s.timeout.ticks !== undefined).map(([i]) => i);
  const legs = [];
  for (const [diff, ticks] of [['1', 1100], ['0.05', 22000]]) {
    const log = path.join(TMP, `v4-${diff}.jsonl`);
    const [nu, ol] = await Promise.all([
      run({ 'from-snapshot': QL6, profile: 'all', diff, ticks, until: "hasChallenge('h',22)", log, eval: "hasChallenge('h',22)" }),
      run({ 'from-snapshot': QL6, profile: 'all', diff, ticks, until: "hasChallenge('h',22)", 'auto-table': oldFile }),
    ]);
    const recs = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
    const met = recs.filter((r) => r.type === 'queue' && r.queue === H22Q && r.do === 'wait-met' && tickWaits.includes(r.step));
    legs.push({ diff, nu, ol, met });
  }
  const f = [];
  if (e.queue.version !== 4 || tickWaits.length !== 2) f.push(`the shipped queue: version ${e.queue.version}, ${tickWaits.length} tick waits`);
  for (const L of legs) {
    if (!L.nu.ok || !L.ol.ok) f.push(`diff ${L.diff}: a run failed ${L.nu.error || ''} ${L.ol.error || ''}`);
    if (L.nu.ticks !== L.ol.ticks || L.nu.hashGame !== L.ol.hashGame) f.push(`diff ${L.diff}: ticks ${L.nu.ticks} / ${L.nu.hashGame} against the game-seconds queue's ${L.ol.ticks} / ${L.ol.hashGame}`);
    if (L.met.length !== 2 || L.met.some((r) => r.waitedTicks !== 0)) f.push(`diff ${L.diff}: the confirmations ${JSON.stringify(L.met.map((r) => ({ step: r.step, waitedTicks: r.waitedTicks })))}`);
    if (L.nu.eval !== true) f.push(`diff ${L.diff}: H22 not completed in the run (${L.nu.ticks} ticks)`);
  }
  row({ gate: 'V1 v4: the shipped H22 queue (two confirmations in TICKS) = the same queue in game-seconds — equal ticks and hashes at the H22 completion from m28/QL6 at diff 1 and 0.05; each confirmation met in its call\'s slot', id: 'ptr', ok: !f.length,
    notes: f.length ? f.join('; ') : legs.map((L) => `diff ${L.diff}: ${L.nu.ticks} / ${L.nu.hashGame} = ${L.ol.ticks} / ${L.ol.hashGame}; steps ${L.met.map((r) => r.step).join(',')} met with 0 ticks waited`).join(' · ') });
}

// ---- Part grep ---------------------------------------------------------------------------------------------------------
function partGrep() {
  const ids = JSON.parse(fs.readFileSync(path.join(REPO, 'manifests/index.json'), 'utf8')).map((g) => g.id);
  const ptrLayers = ['p', 'b', 'g', 't', 'e', 's', 'sb', 'sg', 'h', 'q', 'o', 'ss', 'm', 'ba', 'ps', 'en', 'ne', 'hn', 'n', 'hs', 'i', 'id', 'r', 'ma', 'ge', 'mc', 'ai', 'c', 'a', 'sc', 'ab'];
  const ptrParts = [RATE, HOLD, H22Q, 'sg-keep', 'q33-sg-unlock'];
  const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
  // the core is 6,000 lines that earlier slices' greps own; this slice's code in it is two blocks, cut by their markers
  const cut = (src, from, to) => { const i = src.indexOf(from), j = src.indexOf(to, i); if (i < 0 || j < 0) throw new Error(`grep: marker ${from} not found`); return src.slice(i, j); };
  const core = read('loader/tmt-auto.js');
  const srcs = [['loader/tmt-qedit.js', read('loader/tmt-qedit.js')], ['loader/tmt-queue.js', read('loader/tmt-queue.js')], ['loader/tmt-templates.js', read('loader/tmt-templates.js')],
    ['loader/tmt-auto.js (the switch store)', cut(core, "// ---- (parts-1) THE PLAYER'S OWN SWITCHES", 'var stagesNow = [], stagesOff')],
    ['loader/tmt-auto.js (the part links)', cut(core, "// (parts-1) A PART'S NAME IS A LINK", 'function featureBlock')],
    ['loader/tmt-auto.js (the Parts subtab)', cut(core, '// (parts-1) THE `Parts` SUBTAB', 'function advancedShown')]];
  const hits = [];
  for (const [name, src] of srcs) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
    const lits = [...code.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((m) => m[2]);
    for (const l of lits) {
      if (ids.includes(l)) hits.push(`${name}: game id '${l}'`);
      if (ptrLayers.includes(l) && l.length > 1) hits.push(`${name}: layer id '${l}'`);
      for (const p of ptrParts) if (l.includes(p)) hits.push(`${name}: ptr's part '${p}'`);
    }
    for (const l of ptrLayers) { const re = new RegExp(`\\b(?:layers|player|tmp)\\s*(?:\\.\\s*${l}\\b|\\[\\s*['"\`]${l}['"\`]\\s*\\])`); if (re.test(code)) hits.push(`${name}: layer id ${l} addressed as layers/player/tmp.${l}`); }
  }
  row({ gate: 'X1 no game id, ptr layer id or ptr part id in the code this slice changed', id: '—', ok: !hits.length,
    notes: hits.length ? hits.join('; ') : `${srcs.length} sources, ${ids.length} game ids, ${ptrLayers.length} ptr layer ids and ${ptrParts.length} part ids checked against every string literal and member access` });
}

if (PART === 'page' || PART === 'all') await partPage();
if (PART === 'v4' || PART === 'all') await partV4();
if (PART === 'grep' || PART === 'all') partGrep();
const expected = (PART === 'page' || PART === 'all' ? (ONLY ? ONLY.length : PAGE_ROWS.length) : 0) + (PART === 'v4' || PART === 'all' ? 1 : 0) + (PART === 'grep' || PART === 'all' ? 1 : 0);
const green = rows.filter((r) => r.ok).length;
const verdict = rows.length === expected && green === rows.length;
console.log(`VERDICT parts part ${PART}: ${green}/${rows.length} GREEN (expected ${expected} rows)${verdict ? '' : ' — RED'}`);
if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-parts-part${PART}-last.json`), { commit, dirty, rows });
if (!a['no-summary']) appendSection({ title: `parts-1 every automation part visible and editable — part ${PART}`, commit, dirty, rows, slug: null,
  reading: 'page = the Parts subtab driven through Playwright: inert until opened, the stages and the shipped queue listed with their live state, copy, switch off for me (queue and stage) surviving a reload in the one declared key, my own condition, the readout\'s links, the phone width, two other engines; v4 = the tick limits move no pin; grep = no game id.' });
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(a.assert && !verdict ? 1 : 0);
