// The V4 screenshots the as-built cites: a feature PAUSED by a typed `while`, one STOPPED by `until` with the
// re-arm press beside it, and a `priority` edited — desktop and 390 px.
//   node tools/harness/shots-v4.mjs [<id>...]
// Not a gate — it asserts nothing. It exists so the pictures in the record are reproducible and named the same way
// every time. ⚠ 390 px is taken with `?mobile=1`, because that is the page a phone actually gets.
//
// ⛔ EVERY STATE IN THE FRAME IS ONE THE PAGE REALLY IS IN. The `while` is typed into the save and the tick that
// follows it is a real tick, so the "paused" block is the loader's own readout of its own last decision; the
// `until` has really latched, with the game-second it latched at. Nothing is faked into the DOM.
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, startServer, parseArgs, entryOnly } from './lib.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), []);
const ids = a._.length ? a._ : ['ptr'];
// ⚠ 1900 FOR THE DESKTOP SHOT, AND THE REASON IS MEASURED RATHER THAN A PREFERENCE: at a 1280 viewport ptr's own
// tab pane is **1737 px** wide and the page does not scroll horizontally — the engine clips it — so a 1280 shot cuts
// every long line in the block, V1's `provenance` included. Measured with and without V4's controls set: the block
// width is IDENTICAL (1737 both ways at 1280, 361 both ways at 390), so this is ptr's layout and not this slice's.
const SIZES = { desktop: { width: 1900, height: 1200, q: '' }, '390': { width: 390, height: 900, q: '&mobile=1' } };
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
      await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
      // let the game get somewhere, so the blocks below have real numbers in them
      await page.evaluate(() => tmtLoader.tick(1, 300));
      const state = await page.evaluate(() => {
        const T = window.tmtLoader;
        const rs = T.explain().filter((r) => r.state === 'on');
        const paused = rs.find((r) => r.kind === 'reset');
        // ⚠ THREE DIFFERENT FEATURES, so one picture shows all three controls in the three states a player meets.
        const stopped = rs.find((r) => r.id !== paused.id && r.kind === 'reset') || rs.find((r) => r.id !== paused.id);
        const prio = rs.find((r) => r.id !== paused.id && r.id !== (stopped || {}).id) || rs[rs.length - 1];
        // …and a fourth with a predicate that COMPILES and THROWS, because `blocked:predicate` is the state a
        // player who mistypes one actually lands in, and the block is where the engine's own message has to be.
        const broken = rs.find((r) => ![paused.id, (stopped || {}).id, (prio || {}).id].includes(r.id));
        // a `while` that is FALSE right now: the feature is paused and the block says so
        T.setSavedControl(paused.id, 'while', 'player.points.gte("1e400")');
        // an `until` that has ALREADY held: the feature is stopped, with the game-second it latched at
        if (stopped) T.setSavedControl(stopped.id, 'until', 'player.points.gte(0)');
        if (prio) T.setSavedControl(prio.id, 'priority', '1');
        if (broken) T.setSavedControl(broken.id, 'while', 'player.nosuchlayer.points.gte(1)');
        T.tick(1, 5);
        T.invalidateView();
        return { paused: paused.id, stopped: stopped && stopped.id, prio: prio && prio.id, broken: broken && broken.id,
          pausedState: T.controlState(paused.id)['while'], stoppedState: stopped && T.controlState(stopped.id).until,
          prioState: prio && T.controlState(prio.id).priority,
          brokenState: broken && T.controlState(broken.id)['while'],
          codes: T.explain().filter((r) => [paused.id, (stopped || {}).id, (broken || {}).id].includes(r.id)).map((r) => `${r.id}: ${r.last && r.last.text}`) };
      });
      await page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
      await page.waitForTimeout(500);
      const file = `tools/harness/results/${id}-au-controls-${tag}.png`;
      await page.screenshot({ path: path.join(REPO, file), fullPage: true });
      out.push(file);
      out.push(`   (${id} ${tag}: paused ${state.paused} ${JSON.stringify(state.pausedState)}; stopped ${state.stopped} ${JSON.stringify(state.stoppedState)}; priority ${state.prio} ${JSON.stringify(state.prioState)}; throwing ${state.broken} ${JSON.stringify(state.brokenState)}; ${state.codes.join(' | ')})`);
      await context.close();
    }
  }
} finally { await browser.close(); server.stop(); }
console.log(out.join('\n'));
