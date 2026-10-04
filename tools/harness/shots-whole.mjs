#!/usr/bin/env node
// whole-1 — SCREENSHOTS for the user: the run timeline in the Progress subtab (after the H22 move, a stage switched off
// and on by the player, a fast-forward and a reload), and the shipped move's steps in the player's words (with the
// developer details on, the fact ids beside them) — each at a desktop width and at a 390 px phone (`?mobile=1`).
// Not a gate (gates-whole is); a picture of what the gate drives.
//
//   node tools/harness/shots-whole.mjs [--out <dir>]      (default cloud-reports/tmt-whole-1)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, entryOnly } from './lib.mjs';
import { waitReady, pageLoadFrom } from './page.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
for (const k of Object.keys(a)) if (!['_', 'out'].includes(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const OUT = path.resolve(REPO, a.out || 'cloud-reports/tmt-whole-1');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(REPO);
const browser = await chromium.launch();
const redraw = async (page) => { await page.evaluate(() => { try { updateTemp(); } catch (e) { /* */ } if (typeof updateTabFormats === 'function') updateTabFormats(); }); await page.waitForTimeout(250); };
const QL6 = 'tools/harness/snapshots/ptr/m28/QL6.json';
const H22Q = 'ca-ch-h-22';

async function open(view) {
  const ctx = await browser.newContext(view.phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 1600 } });
  const page = await ctx.newPage();
  await page.goto(new URL(`index.html?mod=ptr&managed=1&automation=1&profile=all${view.phone ? '&mobile=1' : ''}`, server.url).href, { waitUntil: 'load' });
  await waitReady(page);
  const s = JSON.parse(fs.readFileSync(path.join(REPO, QL6), 'utf8'));
  await pageLoadFrom(page, s.player);
  await page.evaluate(() => tmtLoader.pause());
  await page.evaluate((rt) => tmtLoader.restoreRuntime(rt), s.runtime.auto);
  await page.evaluate(async () => { await tmtLoader.fetchSpeed(); await tmtLoader.fetchLadder(); tmtLoader.speed.setSpeed(0); tmtLoader.resume(); });
  return { ctx, page };
}
async function shot(page, view, name, sel) {
  const f = path.join(OUT, `${name}-${view.tag}.png`);
  await page.locator(sel).first().screenshot({ path: f });
  console.log('wrote', path.relative(REPO, f));
}
const ff = (page, spec) => page.evaluate((s) => tmtLoader.speed.run(s), spec);

for (const view of [{ tag: 'desktop', phone: false }, { tag: 'phone', phone: true }]) {
  const { ctx, page } = await open(view);
  await page.evaluate(() => tmtLoader.queues.load({ format: 'tmt-queue/1', id: 'my-note', version: 2, name: 'my little note', steps: [{ do: 'comment', text: 'hello' }] }));
  await ff(page, { until: `tmtLoader.queues.status().queues.some(function (q) { return q.id === ${JSON.stringify(H22Q)} && q.state !== 'running' && q.state !== 'armed'; })`, cap: 3600 });
  const id = await page.evaluate(() => { const s = tmtLoader.stages().find((x) => x.active); tmtLoader.parts.setStageOff(s.id, true); return s.id; });
  await ff(page, { ticks: 4 });
  await page.evaluate((x) => tmtLoader.parts.setStageOff(x, false), id);
  await ff(page, { gs: 60 });
  await page.evaluate(() => tmtLoader.save());
  await page.reload({ waitUntil: 'load' }); await waitReady(page);
  await page.evaluate(async () => { await tmtLoader.fetchSpeed(); await tmtLoader.fetchLadder(); tmtLoader.speed.setSpeed(0); tmtLoader.resume(); });
  await ff(page, { ticks: 20 });
  await page.evaluate(() => { showTab(tmtLoader.auLayer); player.subtabs[tmtLoader.auLayer].mainTabs = 'Progress'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-timeline .tmtl-tl-row', { timeout: 15000 });
  await shot(page, view, 'timeline', '.tmtl-timeline');
  // the shipped move's steps in the player's words, then with the developer details on
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Parts'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-qshipped', { timeout: 15000 });
  await page.locator('.tmtl-qshipped button.tmtl-qshipped-steps-toggle').click();
  await redraw(page);
  await shot(page, view, 'move-words', '.tmtl-qshipped');
  // the developer details (a page-side switch): the subtab is re-opened so its view reads it
  await page.evaluate(() => { tmtLoader.setDevDetails(true); player.subtabs[tmtLoader.auLayer].mainTabs = 'Progress'; });
  await redraw(page);
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Parts'; });
  await redraw(page);
  await page.waitForSelector('.tmtl-qshipped', { timeout: 15000 });
  await page.locator('.tmtl-qshipped button.tmtl-qshipped-steps-toggle').click();
  await redraw(page);
  await shot(page, view, 'move-words-dev', '.tmtl-qshipped');
  await ctx.close();
}
await browser.close(); server.stop();
