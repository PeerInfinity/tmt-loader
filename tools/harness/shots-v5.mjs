// The V5 screenshots the as-built cites (ptr, 390 px, `?mobile=1`, the page a phone gets):
//   1. the give-up block BEFORE and AFTER the wrap — `--root <a pre-V5 checkout>` serves the old tree for the first;
//   2. a block MID-TRANSITION with the floor: a long reason line swapped for a short one, the block keeping its
//      height — once as the player sees it and once with the reserved line (the ghost) made faintly visible;
//   3. the retry-condition choice on `challenges:h`: one press per condition, and the fields of the one in force.
//   node tools/harness/shots-v5.mjs [--root <dir>] [--tag <name>]
// Not a gate — it asserts nothing. ⛔ Every state in the frame is one the page really is in: the snapshot is loaded
// through the game's own import, and the swapped reason line is the loader's own readout state (`f.last`), exactly
// what gates-v5 part 2 constructs.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, startServer, parseArgs, entryOnly } from './lib.mjs';
import { pageLoadFrom } from './page.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const ROOT = a.root ? path.resolve(String(a.root)) : REPO;
const TAG = String(a.tag || (a.root ? 'before' : 'after'));
const browser = await chromium.launch();
const server = await startServer(ROOT);
const out = [];
const redraw = async (page) => { await page.evaluate(() => { if (tmtLoader.invalidateView) tmtLoader.invalidateView(); updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); }); await page.waitForTimeout(250); };
const shotOf = async (page, sel, file) => {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded({ timeout: 5000 });
  await page.waitForTimeout(200);
  const b = await el.boundingBox();
  await page.screenshot({ path: path.join(REPO, file), clip: { x: 0, y: Math.max(0, b.y - 8), width: 390, height: Math.min(900, b.height + 16) } });
  out.push(file);
};
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  await page.goto(new URL('index.html?mod=ptr&automation=1&profile=all&mobile=1', server.url).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
  await pageLoadFrom(page, JSON.parse(fs.readFileSync(path.join(REPO, 'tools/harness/snapshots/ptr/all/M22.json'), 'utf8')).player);
  await page.evaluate(() => tmtLoader.pause());
  await page.evaluate(() => tmtLoader.tick(1, 3));
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
  await redraw(page);
  // ---- 1. the give-up block (challenges:h) — on the OLD tree this is the frame with the steppers off the edge ----
  const giveUp = '#app button.tmtl-fold[data-fid="challenges:h"]';
  const block = async () => page.evaluate((sel) => { const b = document.querySelector(sel); return b ? true : false; }, giveUp);
  if (await block()) {
    // the fold press's PARENT row + the editors below it are the feature; shoot from the press down
    await page.evaluate(() => { const b = document.querySelector('#app button.tmtl-fold[data-fid="challenges:h"]'); b.closest('div').parentElement.setAttribute('data-v5-shot', '1'); });
    await shotOf(page, '[data-v5-shot="1"]', `tools/harness/results/ptr-au-giveup-390-${TAG}.png`);
    const edge = await page.evaluate(() => { const vw = document.documentElement.clientWidth; return [...document.querySelectorAll('[data-v5-shot="1"] input, [data-v5-shot="1"] button')].filter((e) => e.getBoundingClientRect().right > vw + 0.5).length; });
    out.push(`   (${TAG}: ${edge} interactive element(s) of the give-up block past the 390 px edge)`);
  }
  if (TAG === 'after') {
    // ---- 2. mid-transition: a long reason, then a short one — the block keeps its height -----------------------
    const fid = await page.evaluate(() => { const on = tmtLoader.explain().filter((r) => r.state === 'on' && r.acted === 0); return on[Math.floor(on.length / 2)].id; });
    const set = (code, values) => page.evaluate(({ fid, code, values }) => { const f = tmtLoader.features.find((x) => x.id === fid); f.last = { code, values, tick: 0, at: 0 }; }, { fid, code, values });
    await set('waiting:turn', { layer: 'q', row: 3, left: 12, weight: 20, mine: 1 });
    await redraw(page);
    await page.evaluate((fid) => { const b = document.querySelector(`#app .tmtl-fold[data-fid="${fid}"]`); b.closest('div').setAttribute('data-v5-mid', '1'); }, fid);
    await shotOf(page, '[data-v5-mid="1"]', 'tools/harness/results/ptr-au-floor-1-long-390.png');
    await set('off', {});
    await redraw(page);
    await shotOf(page, '[data-v5-mid="1"]', 'tools/harness/results/ptr-au-floor-2-short-390.png');
    await page.addStyleTag({ content: '.tmtl-ghost { visibility: visible !important; opacity: .28; outline: 1px dashed #c08a3e; }' });
    await page.waitForTimeout(150);
    await shotOf(page, '[data-v5-mid="1"]', 'tools/harness/results/ptr-au-floor-3-reserved-390.png');
    out.push(`   (the transition was on ${fid}; frame 3 is frame 2 with the reserved line made faintly visible by THIS script, not by the loader)`);
    await page.addStyleTag({ content: '.tmtl-ghost { visibility: hidden !important; outline: none; }' });
    // ---- 3. the retry-condition choice ----------------------------------------------------------------------------
    await page.evaluate(() => { tmtLoader.setSavedModifier('challenges:h', 'give-up@B/H/Nresets'); });
    await page.evaluate(() => tmtLoader.tick(1, 3));
    await redraw(page);
    await shotOf(page, '[data-v5-shot="1"]', 'tools/harness/results/ptr-au-retry-picker-390.png');
    out.push(`   (the retry picker: ${JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#app button.tmtl-mod[data-fid="challenges:h"]')].map((b) => `${b.dataset.on === '1' ? '●' : '○'} ${b.textContent.trim().slice(0, 70)}`)))}; reason: ${await page.evaluate(() => tmtLoader.explain().find((r) => r.id === 'challenges:h').last.text)})`);
  }
  await context.close();
} finally { await browser.close(); server.stop(); }
console.log(out.join('\n'));
