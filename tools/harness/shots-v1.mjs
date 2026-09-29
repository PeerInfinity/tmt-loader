// The four screenshots of the `au` tab the V1 as-built cites: {Simple, Advanced} × {desktop, 390 px}, per game.
//   node tools/harness/shots-v1.mjs [<id>...]
// Not a gate — it asserts nothing. It exists so the pictures in the record are reproducible and named the same way
// every time, instead of being whatever a gate happened to leave in results/ under a name that meant something else.
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, startServer, parseArgs, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const ids = a._.length ? a._ : ['ptr', 'something'];
// ⚠ 390 px is taken with `?mobile=1`, because that is the page a phone actually gets: without it the engine keeps
// its two-column desktop layout and squeezes the tab into half of 390, which is not what anyone sees.
const SIZES = { desktop: { width: 1280, height: 900, q: '' }, '390': { width: 390, height: 844, q: '&mobile=1' } };
const browser = await chromium.launch();
const server = await startServer(REPO);
const out = [];
try {
  for (const id of ids) {
    for (const [tag, size] of Object.entries(SIZES)) {
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height } });
      const page = await context.newPage();
      await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1&profile=all${size.q}`, server.url).href, { waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      await page.evaluate(() => tmtLoader.pause());
      await page.evaluate(() => { showTab('au'); });
      // a few hundred ticks, so the reasons have something to say rather than all reading `locked`
      await page.evaluate(() => tmtLoader.tick(1, 400));
      for (const sub of ['Simple', 'Advanced']) {
        await page.evaluate((s) => { player.subtabs[tmtLoader.auLayer].mainTabs = s; updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); }, sub);
        await page.waitForTimeout(350);
        const file = `tools/harness/results/${id}-au-${sub.toLowerCase()}-${tag}.png`;
        await page.screenshot({ path: path.join(REPO, file), fullPage: true });
        out.push(file);
      }
      await context.close();
    }
  }
} finally { await browser.close(); server.stop(); }
console.log(out.join('\n'));
