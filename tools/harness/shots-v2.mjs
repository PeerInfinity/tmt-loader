// The V2 screenshots the as-built cites: the EDITABLE `Advanced` view, desktop and 390 px, with one feature
// deliberately EDITED so the picker, the parameter editors, the EDITED chip and the "use the default" press are
// all in the picture.
//   node tools/harness/shots-v2.mjs [<id>...]
// Not a gate — it asserts nothing. It exists so the pictures in the record are reproducible and named the same way
// every time. ⚠ 390 px is taken with `?mobile=1`, because that is the page a phone actually gets: without it the
// engine keeps its two-column desktop layout and squeezes the tab into half of 390 (plan §16.3 item 16).
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, startServer, parseArgs, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const ids = a._.length ? a._ : ['ptr', 'something'];
const SIZES = { desktop: { width: 1280, height: 1000, q: '' }, '390': { width: 390, height: 900, q: '&mobile=1' } };
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
      await page.evaluate(() => tmtLoader.tick(1, 400));
      // ⛔ EDIT SOMETHING, or the picture shows the default view again. The first editable reset feature takes a
      // strategy that is NOT its default and gains the stall modifier, so the shot carries: the EDITED chip with
      // the default beside it, the picker, one editor per parameter of BOTH the strategy and the modifier, the
      // live reason line, and the "use the default" press.
      const edited = await page.evaluate(() => {
        const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded');
        if (!r) return null;
        tmtLoader.setSavedPolicy(r.id, 'interval>=25');
        tmtLoader.setSavedModifier(r.id, 'stall>=Kx/N');
        return r.id;
      });
      await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
      await page.evaluate(() => tmtLoader.tick(1, 60));
      await page.waitForTimeout(400);
      const file = `tools/harness/results/${id}-au-edited-${tag}.png`;
      await page.screenshot({ path: path.join(REPO, file), fullPage: true });
      out.push(`${file}   (edited: ${edited})`);
      await context.close();
    }
  }
} finally { await browser.close(); server.stop(); }
console.log(out.join('\n'));
