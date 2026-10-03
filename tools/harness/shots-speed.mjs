#!/usr/bin/env node
// speed-1 — SCREENSHOTS of the speed controls for the user: the controls idle, fast-forwarding to a target, and the
// automation tab's notice when the automation's memory belonged to a different save — each at a desktop width and at
// a 390 px phone (`?mobile=1`). Not a gate (gates-speed is); a picture of what the gate drives.
//
//   node tools/harness/shots-speed.mjs [--out <dir>]      (default cloud-reports/tmt-speed-1)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, entryOnly } from './lib.mjs';
import { waitReady, pageLoadFrom } from './page.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
for (const k of Object.keys(a)) if (!['_', 'out'].includes(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const OUT = path.resolve(REPO, a.out || 'cloud-reports/tmt-speed-1');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(REPO);
const browser = await chromium.launch();
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json';
const VIEWS = [{ name: 'desktop', phone: false }, { name: 'phone', phone: true }];

async function open(view, { managed = false, automation = true } = {}) {
  const ctx = await browser.newContext(view.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(new URL(`index.html?mod=ptr${managed ? '&managed=1' : ''}${automation ? '&automation=1&profile=all' : ''}${view.phone ? '&mobile=1' : ''}`, server.url).href, { waitUntil: 'load' });
  await waitReady(page);
  return { ctx, page };
}
const shot = async (page, name) => { await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, name) }); console.log('wrote', path.relative(REPO, path.join(OUT, name))); };

for (const view of VIEWS) {
  // 1. idle: opened from the options tab's button, the targets expanded
  {
    const { ctx, page } = await open(view);
    await page.evaluate(() => { const b = document.querySelector('#tmt-navbar button[data-key="options"]'); if (b && b.offsetParent) b.click(); else document.getElementById('optionWheel').click(); });
    await page.waitForSelector('#tmt-loader-options button[data-tool="speed"]', { timeout: 10000 });
    await page.locator('#tmt-loader-options button[data-tool="speed"]').scrollIntoViewIfNeeded();
    await shot(page, `options-door-${view.name}.png`);
    await page.click('#tmt-loader-options button[data-tool="speed"]');
    await page.waitForSelector('#tmt-speed', { timeout: 10000 });
    await page.evaluate(() => { try { showTab('none'); } catch (e) { /* */ } });
    await shot(page, `idle-${view.name}.png`);
    await page.click('#tmt-speed .tmts-morebtn');
    await shot(page, `idle-expanded-${view.name}.png`);
    await ctx.close();
  }
  // 2. fast-forwarding to a target: a condition, from the opening, with the progress bar and Stop
  {
    const { ctx, page } = await open(view);
    await page.evaluate(async () => { const S = await tmtLoader.fetchSpeed(); S.open(false); S.showMore(true); });
    await page.fill('#tmt-speed .tmts-cond', 'player.points.gte(1e6)');
    await page.click('#tmt-speed .tmts-go-until');
    await page.waitForTimeout(2500);
    await shot(page, `fast-forward-${view.name}.png`);
    await page.click('#tmt-speed .tmts-stop');
    await shot(page, `stopped-${view.name}.png`);
    // the approximate mode, labelled
    await page.click('#tmt-speed #tmt-speed-coarse');
    await page.evaluate(() => { window.__ff = tmtLoader.speed.run({ gs: 3600 }); });
    await page.waitForTimeout(1500);
    await shot(page, `approximate-${view.name}.png`);
    await page.evaluate(() => tmtLoader.speed.stop());
    await ctx.close();
  }
  // 3. the memory discarded: the save moved on behind the record (another tab's save), reload, the automation tab
  {
    const { ctx, page } = await open(view, { managed: true });
    const s = JSON.parse(fs.readFileSync(path.join(REPO, QL6), 'utf8'));
    await pageLoadFrom(page, s.player);
    await page.evaluate(() => tmtLoader.pause());
    await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
    await page.evaluate(() => { tmtLoader.tick(0.05, 30); tmtLoader.save(); tmtLoader.tick(0.05, 30); save.tmtLoaderAutomem(); });
    await page.reload({ waitUntil: 'load' }); await waitReady(page);
    await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Simple'; updateTemp(); });
    await page.waitForSelector('.tmtl-automem-notice', { timeout: 10000 });
    await page.locator('.tmtl-automem-notice').scrollIntoViewIfNeeded();
    await shot(page, `memory-discarded-${view.name}.png`);
    await ctx.close();
  }
}
await browser.close();
server.stop();
