#!/usr/bin/env node
// qedit-1 — SCREENSHOTS of the queue editor for the user: the editor, the run-status and the recorder, each at a desktop
// width and at a 390 px phone (`?mobile=1`). Not a gate (gates-qedit is); a picture of what the gate drives.
//
//   node tools/harness/shots-qedit.mjs [--out <dir>]      (default cloud-reports/tmt-qedit-1)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, entryOnly } from './lib.mjs';
import { waitReady, pageLoadFrom } from './page.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
for (const k of Object.keys(a)) if (!['_', 'out'].includes(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const OUT = path.resolve(REPO, a.out || 'cloud-reports/tmt-qedit-1');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(REPO);
const browser = await chromium.launch();
const redraw = async (page) => { await page.evaluate(() => { try { updateTemp(); } catch (e) { /* */ } if (typeof updateTabFormats === 'function') updateTabFormats(); }); await page.waitForTimeout(200); };

async function open(view) {
  const ctx = await browser.newContext(view.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(new URL(`index.html?mod=ptr&managed=1&automation=1&profile=off${view.phone ? '&mobile=1' : ''}`, server.url).href, { waitUntil: 'load' });
  await waitReady(page);
  return { ctx, page };
}
async function queuesTab(page) {
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Queues'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-qedit', { timeout: 15000 });
  await page.waitForFunction(() => tmtLoader.queues && tmtLoader.queues.ready, null, { timeout: 15000 });
  await redraw(page);
}
async function shot(page, view, name) {
  const f = path.join(OUT, `${name}-${view.tag}.png`);
  await page.screenshot({ path: f, fullPage: true });
  console.log('wrote', path.relative(REPO, f));
}
const EDIT = { format: 'tmt-queue/1', version: 2, id: 'first-steps', name: 'first steps', comment: 'buy the first upgrade, wait for the clock, keep prestige resets away for a while',
  trigger: { on: 'start' }, steps: [
    { do: 'comment', text: 'the opening, by hand once and then by this queue' },
    { do: 'call', fn: 'buyUpgrade', args: ['p', 11], comment: 'points start flowing' },
    { do: 'hold', features: ['reset:p', 'upgrades:p'], comment: 'no prestige while it waits' },
    { do: 'wait', until: 'player.timePlayed >= 30', timeout: { gs: 60 }, onTimeout: 'abort' },
    { do: 'call', fn: 'buyUpgrade', args: ['p', 12], times: 1 },
    { do: 'wait', until: 'false', timeout: { gs: 5 }, onTimeout: 'skip' },
    { do: 'release' }] };

for (const view of [{ tag: 'desktop', phone: false }, { tag: 'phone', phone: true }]) {
  // 1. the editor: a queue of every kind, one step opened, a predicate-triggered second queue, the generated list open
  {
    const { ctx, page } = await open(view);
    await page.evaluate(() => { player.p.unlocked = true; });
    await queuesTab(page);
    await page.evaluate((q) => { tmtLoader.qedit.importText(JSON.stringify(q)); const r = tmtLoader.qedit.create('when the clock passes a minute'); tmtLoader.qedit.setTrigger(r.id, { on: 'predicate', when: 'player.timePlayed >= 60' }); tmtLoader.qedit.addStep(r.id, { do: 'wait', until: '', timeout: { gs: 10 }, onTimeout: 'abort' }); }, EDIT);
    await redraw(page);
    await page.locator('.tmtl-qqueue[data-queue="first-steps"] .tmtl-qstep[data-step="4"] button.tmtl-qstep-edit').click();
    await page.locator('button.tmtl-qcat-toggle').click();
    await page.waitForSelector('.tmtl-qcat-entry', { timeout: 10000 }).catch(() => {});
    await redraw(page);
    await shot(page, view, 'editor');
    // 2. the run-status: the queue switched on, running, waiting with its holds
    await page.evaluate(() => tmtLoader.qedit.setEnabled('first-steps', true));
    await page.evaluate(() => { player.points = new Decimal(10); tmtLoader.tick(1, 8); });
    await redraw(page);
    await page.locator('.tmtl-qqueue[data-queue="first-steps"]').scrollIntoViewIfNeeded();
    await shot(page, view, 'run-status');
    await ctx.close();
  }
  // 3. the recorder: recording (the count), then the queue it made
  {
    const { ctx, page } = await open(view);
    const s = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/harness/snapshots/ptr/all/M09.json'), 'utf8'));
    await pageLoadFrom(page, s.player);
    await page.evaluate(() => { tmtLoader.pause(); player.t.points = new Decimal(100); player.e.points = new Decimal(1e6); });
    await queuesTab(page);
    await page.locator('button.tmtl-qrec-toggle').click();
    await page.waitForFunction(() => tmtLoader.qedit.record.status().on, null, { timeout: 15000 });
    // the presses, made as the player makes them: the game's own buttons
    await page.evaluate(() => { buyUpg('t', 21); buyUpg('t', 22); buyBuyable('e', 11); buyBuyable('e', 11); buyBuyable('e', 11); buyUpg('e', 11); });
    await queuesTab(page);
    await shot(page, view, 'recorder-recording');
    await page.locator('button.tmtl-qrec-toggle').click();
    await redraw(page);
    await shot(page, view, 'recorder-done');
    await ctx.close();
  }
}
await browser.close(); server.stop();
