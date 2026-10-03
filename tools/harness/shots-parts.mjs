#!/usr/bin/env node
// parts-1 — SCREENSHOTS of the Parts subtab for the user: the game's stages, the moves it ships, a stage and a move
// switched off by the player, the readout's link into the tab — each at a desktop width and at a 390 px phone
// (`?mobile=1`). Not a gate (gates-parts is); a picture of what the gate drives.
//
//   node tools/harness/shots-parts.mjs [--out <dir>]      (default cloud-reports/tmt-parts-1)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, entryOnly } from './lib.mjs';
import { waitReady, pageLoadFrom } from './page.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
for (const k of Object.keys(a)) if (!['_', 'out'].includes(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const OUT = path.resolve(REPO, a.out || 'cloud-reports/tmt-parts-1');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(REPO);
const browser = await chromium.launch();
const redraw = async (page) => { await page.evaluate(() => { try { updateTemp(); } catch (e) { /* */ } if (typeof updateTabFormats === 'function') updateTabFormats(); }); await page.waitForTimeout(250); };
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json';

async function open(view, snap) {
  const ctx = await browser.newContext(view.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 2400 } });
  const page = await ctx.newPage();
  await page.goto(new URL(`index.html?mod=ptr&managed=1&automation=1&profile=all${view.phone ? '&mobile=1' : ''}`, server.url).href, { waitUntil: 'load' });
  await waitReady(page);
  if (snap) {
    const s = JSON.parse(fs.readFileSync(path.join(REPO, snap), 'utf8'));
    await pageLoadFrom(page, s.player);
    await page.evaluate(() => tmtLoader.pause());
    await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
  }
  return { ctx, page };
}
async function partsTab(page) {
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Parts'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-qedit', { timeout: 15000 });
  await page.waitForFunction(() => tmtLoader.queues && tmtLoader.queues.ready, null, { timeout: 15000 });
  await redraw(page);
}
async function shot(page, view, name, sel) {
  const f = path.join(OUT, `${name}-${view.tag}.png`);
  if (sel) await page.locator(sel).first().screenshot({ path: f });
  else await page.screenshot({ path: f, fullPage: true });
  console.log('wrote', path.relative(REPO, f));
}

for (const view of [{ tag: 'desktop', phone: false }, { tag: 'phone', phone: true }]) {
  const { ctx, page } = await open(view, QL6);
  await partsTab(page);
  await page.evaluate(() => tmtLoader.tick(0.05, 40));
  await redraw(page);
  // 1. the parts: two stages in force at QL6, the H22 move running
  await page.locator('.tmtl-qstage[data-stage="ql6-hold-for-q32"] button.tmtl-qstage-evidence').click();
  await page.locator('.tmtl-qshipped button.tmtl-qshipped-steps-toggle').click();
  await redraw(page);
  await shot(page, view, 'parts-stages', '.tmtl-parts-stages');
  await shot(page, view, 'parts-moves', '.tmtl-parts-shipped');
  // 2. switched off by the player: a stage and the move, and the copy in the player's own queues
  await page.locator('.tmtl-qstage[data-stage="ql5-quirk-rate"] button.tmtl-qstage-onoff').click();
  await page.locator('.tmtl-qshipped button.tmtl-qshipped-copy').click();
  await page.waitForTimeout(400);
  await page.locator('.tmtl-qshipped button.tmtl-qshipped-onoff').click();
  await page.evaluate(() => tmtLoader.tick(0.05, 2));
  await redraw(page);
  await shot(page, view, 'switched-off-stage', '.tmtl-qstage[data-stage="ql5-quirk-rate"]');
  await shot(page, view, 'switched-off-move', '.tmtl-qshipped');
  await shot(page, view, 'my-copy', '.tmtl-qqueue[data-queue="ca-ch-h-22-copy"]');
  // 3. the readout: the feature the stage set says it was switched off, and the stage's name links to its entry
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; tmtLoader.setCollapsed('reset:q', false); });
  await page.evaluate(() => tmtLoader.tick(0.05, 1));
  await redraw(page);
  const blk = page.locator('.tmtl-block', { hasText: 'stage' }).first();
  await blk.scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, view, 'readout', '.tmtl-block:has(.tmtl-stage-yours)');
  await page.locator('.tmtl-block a.tmtl-part-link[data-part="stage:ql5-quirk-rate"]').first().click();
  await redraw(page);
  await page.waitForTimeout(300);
  await shot(page, view, 'linked', '.tmtl-qstage[data-stage="ql5-quirk-rate"]');
  await ctx.close();
}
await browser.close();
server.stop();
