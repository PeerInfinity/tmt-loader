// The V3 screenshots the as-built cites: an ESCALATED feature, the `Progress` timeline, and the Advanced view with
// every block COLLAPSED — desktop and 390 px.
//   node tools/harness/shots-v3.mjs [<id>...]
// Not a gate — it asserts nothing. It exists so the pictures in the record are reproducible and named the same way
// every time. ⚠ 390 px is taken with `?mobile=1`, because that is the page a phone actually gets (plan §16.3 item 16).
//
// ⛔ THE ESCALATION IS DRIVEN, NOT WAITED FOR. A real stall on ptr needs the M16 fixture and 12,000 ticks; what the
// picture has to show is the VIEW, so the shot constructs the state the view renders — the watch on, a feature whose
// rule cannot fire, and enough progress recorded for a threshold to exist. Everything in the frame is the loader's
// own readout of a state it really is in; nothing is faked into the DOM.
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, startServer, parseArgs, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const ids = a._.length ? a._ : ['ptr'];
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
      // the watch on (which arms the tracker), then enough play for a threshold to exist
      await page.evaluate(() => { tmtLoader.setWatchOption('watch', true); tmtLoader.setWatchOption('k', '1'); });
      await page.evaluate(() => tmtLoader.tick(1, 700));
      const info = await page.evaluate(() => {
        // a feature whose own rule cannot fire for a long time, so the watch has something to rescue
        const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded');
        if (r) tmtLoader.setSavedPolicy(r.id, 'gain>=1e600');
        return r ? r.id : null;
      });
      // ⛔ TICK UNTIL IT ESCALATES, BOUNDED, rather than ticking a round number and hoping. The first cut ticked 900
      // and the shot came back `watch:armed` with rung 0 — a picture of the view NOT doing the thing it is a picture
      // of. The loop says how far it had to go, and the caption below states the state the shot really is in.
      const state = await page.evaluate((fid) => {
        for (let i = 0; i < 40; i++) {
          tmtLoader.tick(1, 200);
          if (tmtLoader.escalationState(fid).rung > 0) break;
        }
        const p = tmtLoader.progress();
        return { rung: tmtLoader.escalationState(fid), watch: tmtLoader.watchState().code, progress: p.total,
          typicalGap: p.typicalGap, stalled: p.stalled, at: Math.round(Number(player.timePlayed)),
          gaps: p.gaps, lastAt: p.lastAt, sinceLast: p.sinceLast, opts: tmtLoader.watchOptions() };
      }, info);

      const shot = async (which, name) => {
        await page.evaluate((w) => { player.subtabs[tmtLoader.auLayer].mainTabs = w; updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); }, which);
        await page.waitForTimeout(400);
        const file = `tools/harness/results/${id}-${name}-${tag}.png`;
        await page.screenshot({ path: path.join(REPO, file), fullPage: true });
        out.push(file);
      };
      await shot('Advanced', 'au-escalated');
      await shot('Progress', 'au-progress');
      await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
      await page.waitForTimeout(200);
      await page.locator('#app button.tmtl-collapse-all').first().click({ timeout: 5000 });
      await page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
      await shot('Advanced', 'au-collapsed');
      out.push(`   (${id} ${tag}: at ${state.at} game-s, watch ${state.watch}, ${state.progress} progress event(s), typical gap ${state.typicalGap} s, stalled ${state.stalled}, gaps ${JSON.stringify(state.gaps)}, opts ${JSON.stringify(state.opts)}, rung ${JSON.stringify(state.rung)})`);
      await context.close();
    }
  }
} finally { await browser.close(); server.stop(); }
console.log(out.join('\n'));
