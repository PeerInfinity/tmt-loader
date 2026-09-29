// U2f — WHAT THE LAYER LIST COSTS PER FRAME. A MEASUREMENT INSTRUMENT, not a gate: it asserts nothing and exits 0
// whatever it finds. The numbers it prints are the ones docs/mobile.md records.
//
//   node tools/harness/cost-layerlist.mjs [<id>...] [--reps N] [--window MS] [--json out.json] [--no-delay]
//
// Four questions (the U2f brief), each measured rather than argued:
//   1. what ONE refreshInner() costs with the panel open, at a fresh save and at the deepest recorded snapshot;
//   2. how much of that is `signature()` — the hypothesis that it is the expensive half stands or falls here;
//   3. how often it actually runs, against the game's own re-render rate;
//   4. whether any of it is visible as MAIN-THREAD SCHEDULING DELAY — the only one that decides whether it matters,
//      because the in-app harness classifies a poll that did not get scheduled as STARVED and blames the slice.
//
// ⚠ Every cost here is measured through the list's OWN public surface (`tmtLoader.layerListUI`), never through a
// probe of its internals: `signature()` is reconstructed out of `groups()` + `visibleSeq()`, which is character for
// character what layerlist.js computes, so the instrument cannot drift from the code by being edited separately.
//
// ⚠ Costs 1 and 2 are taken with the engine's loop PAUSED (`?managed=1`), so what is timed is the list's own work
// and not the game's tick landing inside the window. Costs 3 and 4 RESUME the loop, because a rate and a delay are
// only meaningful against a game that is actually re-rendering.
//
// ⚠ `?automation=1` is OFF here. The automation layer adds a card (`au`) that no player has, and the question is
// what the list costs a reader.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, writeJSON, headCommit, deepestSnapshot } from './lib.mjs';
import { openContext, waitReady, pageLoadFrom, PHONE_CONTEXT } from './page.mjs';

// The two games with recorded snapshots, plus the two the U2f brief names as the busiest cards on the roster.
// ⚠ THE SECOND PAIR IS STALE, and this instrument is what measured it: `the-tearonq-i-have-no-creative-names`'s
// "111 chips" is a PRE-U2b figure, from before the chips mirrored the game's own tab (SUMMARY, commit 5f3c04403);
// at the head this slice runs on that game draws ZERO. `--census` is the answer to "so which card IS the busiest":
// it costs every game on the roster rather than trusting a name.
const DEFAULT_IDS = ['ptr', 'something', 'the-tearonq-i-have-no-creative-names', 'the-infinity-tree'];

/** One timing batch, reported as a distribution and never as a single number. `stats` carries the list's own
 *  counters across the batch, so a batch that silently rebuilt (or was throttled) says so. */
const COST_PROBE = async ({ reps, warm }) => {
  const ui = window.tmtLoader.layerListUI;
  const out = { cards: ui.cards().length };
  // performance.now()'s own resolution here, so a figure near it can be read as near it
  let res = Infinity;
  for (let i = 0; i < 5000; i++) { const a = performance.now(), b = performance.now(); if (b > a) res = Math.min(res, b - a); }
  out.clockResolutionMs = isFinite(res) ? +res.toFixed(6) : null;

  const layers = ui.cards();
  // character for character `signature()` in loader/layerlist.js
  const sigOf = () => ui.groups().map((g) => g.key + ':' + g.layers.map((l) => l + '[' + ui.visibleSeq(l).map((e) => e.key).join(' ') + ']').join(',')).join('|');

  const timed = (fn, n) => {
    for (let i = 0; i < warm; i++) fn();
    const s0 = ui.stats();
    const xs = new Array(n);
    const t0 = performance.now();
    for (let i = 0; i < n; i++) { const t = performance.now(); fn(); xs[i] = performance.now() - t; }
    const wall = performance.now() - t0;
    const s1 = ui.stats();
    const sorted = xs.slice().sort((a, b) => a - b);
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
    return { n, ms: +(wall / n).toFixed(4), p50: +q(0.5).toFixed(4), p90: +q(0.9).toFixed(4), max: +sorted[sorted.length - 1].toFixed(4),
      wallMs: +wall.toFixed(1),
      d: { refreshes: s1.refreshes - s0.refreshes, syncs: s1.syncs - s0.syncs, throttled: s1.throttled - s0.throttled,
        rebuilds: s1.rebuilds - s0.rebuilds, fits: s1.fits - s0.fits, tipSyncs: s1.tipSyncs - s0.tipSyncs } };
  };

  out.sigLength = sigOf().length;
  out.seq = layers.reduce((n, l) => n + ui.visibleSeq(l).length, 0);
  out.chips = layers.reduce((n, l) => n + ui.chipsOf(l).length, 0);
  out.counters = layers.reduce((n, l) => n + ui.countersOf(l).length, 0);
  out.acts = layers.reduce((n, l) => n + ui.actionsOf(l).length, 0);

  // ---- the panel CLOSED: the `!open` guard, which is the optimisation already present and the floor everything
  // else is measured against
  ui.close();
  out.closed = { refresh: timed(() => ui.refresh(), reps) };
  ui.open();

  // ---- the panel OPEN, no tooltip
  out.open = {
    refreshExplicit: timed(() => ui.refresh(), reps),          // the API / a press: always the whole pass
    refreshObserver: timed(() => ui.refresh(false), reps),     // the MutationObserver's own call
    signature: timed(sigOf, reps),                             // the hypothesis' subject
    groups: timed(() => ui.groups(), reps),
    visibleSeqAll: timed(() => { for (const l of layers) ui.visibleSeq(l); }, reps),
    countersAll: timed(() => { for (const l of layers) ui.countersOf(l); }, reps),
    chipsAll: timed(() => { for (const l of layers) ui.chipsOf(l); }, reps),
  };

  // ---- with a TOOLTIP OPEN (U2e): the extra composition + placeTip that rides syncCards
  const anchor = [...document.querySelectorAll('#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit), #tmt-layerlist .tmt-layerlist-counter, #tmt-layerlist .tmt-layerlist-chip')]
    .find((e) => e.getClientRects().length);
  out.tipOpened = !!(anchor && ui.tip.show(anchor));
  if (out.tipOpened) {
    out.tip = {
      refreshExplicit: timed(() => ui.refresh(), reps),
      refreshObserver: timed(() => ui.refresh(false), reps),
    };
    ui.tip.hide();
  }

  // ---- the PER-POINTER-EVENT cost (U2e's hover listeners), the one cost whose rate a reader controls directly.
  // Two paths: entering a DIFFERENT control (which opens an overlay) and re-entering the same one (which does not).
  const vis = [...document.querySelectorAll('#tmt-layerlist .tmt-layerlist-chip, #tmt-layerlist .tmt-layerlist-act, #tmt-layerlist .tmt-layerlist-counter')]
    .filter((e) => e.getClientRects().length);
  if (vis.length >= 2) {
    const ev = (el) => el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    let i = 0;
    out.pointer = {
      controls: vis.length,
      newControl: timed(() => { ev(vis[i++ % 2]); }, reps),      // alternates → showTip every time
      sameControl: timed(() => { ev(vis[0]); }, reps),           // t === tipAnchorEl → the early return
    };
    ui.tip.hide();
  }
  return out;
};

/** Question 3: how often the observer path actually fires, against the page's own frame rate. Engine RUNNING. */
const RATE_PROBE = async ({ ms, tip }) => {
  const ui = window.tmtLoader.layerListUI;
  let opened = false;
  if (tip) {
    const anchor = [...document.querySelectorAll('#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit), #tmt-layerlist .tmt-layerlist-counter, #tmt-layerlist .tmt-layerlist-chip')]
      .find((e) => e.getClientRects().length);
    opened = !!(anchor && ui.tip.show(anchor));
  }
  const s0 = ui.stats();
  let frames = 0;
  const t0 = performance.now();
  const step = () => { frames++; if (performance.now() - t0 < ms) requestAnimationFrame(step); };
  requestAnimationFrame(step);
  await new Promise((r) => setTimeout(r, ms));
  const el = performance.now() - t0, s1 = ui.stats();
  if (opened) ui.tip.hide();
  const per = (a, b) => +(((s1[a] - s0[a]) * 1000) / el).toFixed(2);
  return { ms: Math.round(el), tipOpen: opened, frames, fps: +((frames * 1000) / el).toFixed(1),
    refreshes: s1.refreshes - s0.refreshes, syncs: s1.syncs - s0.syncs, throttled: s1.throttled - s0.throttled,
    rebuilds: s1.rebuilds - s0.rebuilds, fits: s1.fits - s0.fits, tipSyncs: s1.tipSyncs - s0.tipSyncs,
    refreshesPerSec: per('refreshes'), syncsPerSec: per('syncs'), throttleMs: s1.throttleMs };
};

/**
 * Question 4: MAIN-THREAD SCHEDULING DELAY. A `setTimeout` chain at a fixed interval is exactly the shape of the
 * poll the in-app harness uses (Playwright's own `waitForFunction` polls the same way), so its LATENESS — actual
 * minus scheduled — is the observable that a STARVED verdict is made of. Long tasks (≥50 ms) are counted beside it.
 * Engine RUNNING; the caller interleaves the conditions so drift and thermal state cannot line up with one of them.
 */
const DELAY_PROBE = async ({ ms, every }) => {
  const late = [], gaps = [];
  let longCount = 0, longMs = 0;
  let po = null;
  try { po = new PerformanceObserver((l) => { for (const e of l.getEntries()) { longCount++; longMs += e.duration; } }); po.observe({ entryTypes: ['longtask'] }); } catch (e) { po = null; }
  let frames = 0, lastFrame = 0;
  const t0 = performance.now();
  const step = () => { const n = performance.now(); frames++; if (lastFrame) gaps.push(n - lastFrame); lastFrame = n; if (n - t0 < ms) requestAnimationFrame(step); };
  requestAnimationFrame(step);
  await new Promise((resolve) => {
    // ⚠ JITTERED, and this is not a detail. A poll at a FIXED 50 ms phase-locks to a 16.7 ms animation frame (50 is
    // exactly three of them), so whether a sample waits for the frame's work is decided by the window's start phase
    // rather than by the load — MEASURED: burn ×4 read p50 15.9 ms and burn ×16 read p50 0.1 ms in the same sweep,
    // which is the opposite of the truth. A jittered interval cannot line up with the frame, so lateness measures
    // the thread and not the arithmetic.
    let due = 0;
    const tick = () => {
      late.push(performance.now() - due);
      if (performance.now() - t0 >= ms) return resolve();
      const d = every + Math.random() * 16;
      due = performance.now() + d;
      setTimeout(tick, d);
    };
    const d0 = every + Math.random() * 16;
    due = performance.now() + d0;
    setTimeout(tick, d0);
  });
  const el = performance.now() - t0;
  if (po) po.disconnect();
  const pct = (arr) => { const a = arr.slice().sort((x, y) => x - y); const q = (p) => a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : null;
    return { p50: +q(0.5).toFixed(2), p90: +q(0.9).toFixed(2), p99: +q(0.99).toFixed(2), max: a.length ? +a[a.length - 1].toFixed(2) : null }; };
  const L = pct(late), G = pct(gaps);
  return { ms: Math.round(el), samples: late.length, every,
    ...L, over16: late.filter((x) => x > 16).length, over50: late.filter((x) => x > 50).length,
    frameGap: G, frames, fps: +((frames * 1000) / el).toFixed(1), longTasks: longCount, longTaskMs: +longMs.toFixed(1) };
};

// ⚠ THE CEILING, and why it has to be measured separately. The observer is driven by the GAME's re-renders, and a
// game re-renders when a number it draws MOVES — at a fresh `ptr` save nothing does (points hold at 10 until the
// first upgrade), so a natural window measures a rate near zero and says nothing about the design. This drives one
// `#app` mutation per animation frame, which is the most the coalescer can ever be asked for: the rate the
// throttling question is actually about.
const startForce = (page) => page.evaluate(() => {
  window.__u2fForce = true;
  const app = document.getElementById('app');
  const step = () => { if (!window.__u2fForce) return;
    if (app) { const d = document.createElement('span'); d.textContent = 'u2f'; app.appendChild(d); app.removeChild(d); }
    requestAnimationFrame(step); };
  requestAnimationFrame(step);
});
const stopForce = (page) => page.evaluate(() => { window.__u2fForce = false; });

/**
 * ⚠ THE POSITIVE CONTROL, and the instrument is worthless without it. A delay probe that reports "no delay" has
 * said nothing until it has been shown reporting one — this arc has twice shipped a check that could not
 * discriminate. This drives K copies of the OBSERVER's own pass per animation frame, so `burn-K` is literally the
 * list's measured per-frame cost multiplied by K. The multiplier at which the poll first sees it IS the margin,
 * measured rather than assumed.
 */
const startBurn = (page, k) => page.evaluate((n) => {
  window.__u2fBurn = true;
  const ui = window.tmtLoader.layerListUI;
  const step = () => { if (!window.__u2fBurn) return;
    for (let i = 0; i < n; i++) ui.refresh(false);
    requestAnimationFrame(step); };
  requestAnimationFrame(step);
}, k);
const stopBurn = (page) => page.evaluate(() => { window.__u2fBurn = false; });

const openPanel = (page) => page.evaluate(() => { window.tmtLoader.layerListUI.open(); });
const closePanel = (page) => page.evaluate(() => { window.tmtLoader.layerListUI.close(); });
const resume = (page) => page.evaluate(() => window.tmtLoader.resume());
const pause = (page) => page.evaluate(() => window.tmtLoader.pause());

async function measureOne(browser, base, id, { snapshot, reps, warm, window: win, delay, flat = 0, costOnly = false }) {
  const row = { id, state: snapshot ? 'snapshot' : 'fresh', snapshot: snapshot ? snapshot.file : null, ticks: snapshot ? snapshot.ticks : 0 };
  const { context } = await openContext(browser, { contextOptions: PHONE_CONTEXT });
  try {
    const page = await context.newPage();
    await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1&mobile=1`, base).href, { waitUntil: 'load' });
    const r = await waitReady(page);
    if (!r.ready) { row.error = `not ready: ${JSON.stringify(r.error)}`; return row; }
    if (snapshot) await pageLoadFrom(page, snapshot.player);
    await openPanel(page);
    await page.waitForTimeout(250);

    row.cost = await page.evaluate(COST_PROBE, { reps, warm });
    if (costOnly) { await page.close(); return row; }

    // --- questions 3 and 4 need the engine's own loop back
    await resume(page);
    await page.waitForTimeout(500);
    await openPanel(page);
    row.rate = await page.evaluate(RATE_PROBE, { ms: win, tip: false });
    row.rateTip = await page.evaluate(RATE_PROBE, { ms: win, tip: true });
    await startForce(page);
    row.rateForced = await page.evaluate(RATE_PROBE, { ms: win, tip: false });
    row.rateForcedTip = await page.evaluate(RATE_PROBE, { ms: win, tip: true });
    await stopForce(page);

    if (flat) {
      // ⚠ THE PAIRED RE-MEASUREMENT. The first battery's closed and open windows agreed, and a later one on the
      // busiest cards did not — a floor that moves between runs can hide a real difference or invent one. So the
      // three conditions are CYCLED, several times, in one browsing context on one page: every cycle is its own
      // paired comparison and the box's own drift is shared by all three rather than lining up with one.
      row.delay = [];
      await stopForce(page);
      for (let c = 0; c < flat; c++) {
        for (const cond of ['closed', 'open', 'openTip']) {
          if (cond === 'closed') await closePanel(page);
          else {
            await openPanel(page);
            if (cond === 'openTip') await page.evaluate(() => { const ui = window.tmtLoader.layerListUI;
              const a = [...document.querySelectorAll('#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit), #tmt-layerlist .tmt-layerlist-counter, #tmt-layerlist .tmt-layerlist-chip')].find((e) => e.getClientRects().length);
              if (a) ui.tip.show(a); });
            else await page.evaluate(() => window.tmtLoader.layerListUI.tip.hide());
          }
          await page.waitForTimeout(300);
          row.delay.push({ cond, cycle: c, ...(await page.evaluate(DELAY_PROBE, { ms: win, every: 40 })) });
        }
      }
      await closePanel(page);
    } else if (delay) {
      // ⚠ INTERLEAVED, closed first and closed last: a single closed/open pair cannot tell the panel from a machine
      // that got busier halfway through. The two closed windows are each other's control.
      row.delay = [];
      for (const cond of ['closed', 'open', 'closed', 'open', 'openTip', 'closed',
        'forced-closed', 'forced-open', 'forced-closed', 'forced-open', 'forced-openTip']) {
        const forced = cond.startsWith('forced-');
        if (forced) await startForce(page); else await stopForce(page);
        if (/closed$/.test(cond)) await closePanel(page);
        else {
          await openPanel(page);
          if (/openTip$/.test(cond)) await page.evaluate(() => { const ui = window.tmtLoader.layerListUI;
            const a = [...document.querySelectorAll('#tmt-layerlist .tmt-layerlist-act:not(.tmt-layerlist-nofit), #tmt-layerlist .tmt-layerlist-counter, #tmt-layerlist .tmt-layerlist-chip')].find((e) => e.getClientRects().length);
            if (a) ui.tip.show(a); });
          else await page.evaluate(() => window.tmtLoader.layerListUI.tip.hide());
        }
        await page.waitForTimeout(300);
        const d = await page.evaluate(DELAY_PROBE, { ms: win, every: 40 });
        row.delay.push({ cond, ...d });
      }
      await stopForce(page);
      // the burn sweep: the panel OPEN, the list's own per-frame pass multiplied. `burn-1` is the honest control for
      // it — the same loop at ×1, which is what one refresh per frame really costs.
      await openPanel(page);
      for (const k of [1, 4, 16, 32, 64]) {
        await startBurn(page, k);
        await page.waitForTimeout(300);
        const d = await page.evaluate(DELAY_PROBE, { ms: win, every: 40 });
        await stopBurn(page);
        row.delay.push({ cond: `burn-${k}`, ...d });
      }
      await closePanel(page);
    }
    await pause(page);
    await page.close();
  } catch (e) {
    row.error = String((e && e.message) || e).slice(0, 300);
  } finally {
    await context.close();
  }
  return row;
}

const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };

async function main() {
  const a = parseArgs(process.argv.slice(2), ['no-delay', 'fresh-only', 'census']);
  const ids = a._.length ? a._ : (a.census ? GAMES() : DEFAULT_IDS);
  const reps = Number(a.reps ?? (a.census ? 40 : 200)), warm = Number(a.warm ?? 20), win = Number(a.window ?? 3000);
  const server = await startServer(REPO);
  const browser = await chromium.launch();
  const rows = [];
  try {
    for (const id of ids) {
      const snap = a['fresh-only'] ? null : deepestSnapshot(id);
      const states = snap ? [null, snap] : [null];
      for (const s of states) {
        const row = await measureOne(browser, server.url, id, { snapshot: s, reps, warm, window: win, delay: !a['no-delay'] && !a.census && !a.flat, flat: Number(a.flat || 0), costOnly: !!a.census });
        rows.push(row);
        const c = row.cost || {};
        const o = c.open || {};
        console.log(`${row.id} (${row.state}${row.ticks ? `, ${row.ticks} ticks` : ''}): ${c.cards} card(s), ${c.seq} drawn component(s), ${c.chips} chip(s), ${c.counters} counter(s), ${c.acts} button(s)`
          + (row.error ? `  ⛔ ${row.error}` : '')
          + (o.refreshExplicit ? `\n   refresh explicit ${o.refreshExplicit.ms} ms (p90 ${o.refreshExplicit.p90}, max ${o.refreshExplicit.max}) · observer ${o.refreshObserver.ms} ms (p90 ${o.refreshObserver.p90})`
            + ` · signature ${o.signature.ms} ms (${(100 * o.signature.ms / o.refreshObserver.ms).toFixed(0)}% of the observer pass)`
            + ` · counters ${o.countersAll.ms} ms · chips ${o.chipsAll.ms} ms · CLOSED ${c.closed.refresh.ms} ms` : '')
          + (row.cost && row.cost.tip ? `\n   with a tooltip open: explicit ${row.cost.tip.refreshExplicit.ms} ms · observer ${row.cost.tip.refreshObserver.ms} ms` : '')
          + (row.cost && row.cost.pointer ? `\n   per pointerover: a NEW control ${row.cost.pointer.newControl.ms} ms · the SAME control ${row.cost.pointer.sameControl.ms} ms (${row.cost.pointer.controls} visible controls)` : '')
          + (row.rate ? `\n   rate over ${row.rate.ms} ms: ${row.rate.fps} fps, ${row.rate.refreshes} refresh(es) (${row.rate.refreshesPerSec}/s), ${row.rate.syncs} sync(s), ${row.rate.throttled} throttled, ${row.rate.rebuilds} rebuild(s)`
            + ` · with a tooltip: ${row.rateTip.refreshes} refresh(es), ${row.rateTip.syncs} sync(s), ${row.rateTip.tipSyncs} tip re-read(s)` : '')
          + (row.rateForced ? `\n   FORCED (one #app mutation per frame) over ${row.rateForced.ms} ms: ${row.rateForced.fps} fps, ${row.rateForced.refreshes} refresh(es) (${row.rateForced.refreshesPerSec}/s), ${row.rateForced.syncs} sync(s), ${row.rateForced.throttled} throttled`
            + ` · with a tooltip: ${row.rateForcedTip.refreshes} refresh(es), ${row.rateForcedTip.syncs} sync(s), ${row.rateForcedTip.tipSyncs} tip re-read(s)` : '')
          + (row.delay ? `\n   ${row.delay.map((d) => `${d.cond} p50 ${d.p50} p90 ${d.p90} max ${d.max} (${d.fps} fps, frame gap p90 ${d.frameGap.p90}/max ${d.frameGap.max}, ${d.longTasks} long task(s))`).join(' | ')}` : ''));
      }
    }
    if (a.census) {
      // ⚠ THE WORST CASE IS A MEASUREMENT, NOT A NAME. Sorted by the observer pass, which is what a frame pays.
      const ok = rows.filter((r) => r.cost && r.cost.open);
      const top = ok.slice().sort((x, y) => y.cost.open.refreshObserver.ms - x.cost.open.refreshObserver.ms);
      console.log(`\nCENSUS: ${ok.length} of ${rows.length} game-state(s) measured, ${rows.length - ok.length} threw`);
      console.log(`the TEN most expensive observer passes:`);
      for (const r of top.slice(0, 10)) console.log(`  ${r.id} (${r.state}): observer ${r.cost.open.refreshObserver.ms} ms, explicit ${r.cost.open.refreshExplicit.ms} ms, signature ${r.cost.open.signature.ms} ms (${(100 * r.cost.open.signature.ms / r.cost.open.refreshObserver.ms).toFixed(0)}%) — ${r.cost.cards} card(s), ${r.cost.seq} drawn, ${r.cost.chips} chip(s)`);
      const by = (f) => ok.slice().sort((x, y) => y.cost[f] - x.cost[f])[0];
      console.log(`most cards: ${by('cards').id} (${by('cards').cost.cards}); most drawn components: ${by('seq').id} (${by('seq').cost.seq}); most chips: ${by('chips').id} (${by('chips').cost.chips})`);
      const sig = ok.map((r) => 100 * r.cost.open.signature.ms / r.cost.open.refreshObserver.ms).sort((x, y) => x - y);
      const obs = ok.map((r) => r.cost.open.refreshObserver.ms).sort((x, y) => x - y);
      const qq = (arr, p) => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))];
      console.log(`observer pass over the roster: median ${qq(obs, 0.5).toFixed(3)} ms, p90 ${qq(obs, 0.9).toFixed(3)} ms, max ${obs[obs.length - 1].toFixed(3)} ms`);
      console.log(`signature's SHARE of it: median ${qq(sig, 0.5).toFixed(0)}%, p90 ${qq(sig, 0.9).toFixed(0)}%, max ${sig[sig.length - 1].toFixed(0)}%`);
      for (const r of rows.filter((x) => x.error)) console.log(`  ⛔ ${r.id}: ${r.error}`);
      if (a.json) writeJSON(a.json, { commit: headCommit(), base: server.url, reps, warm, census: true, viewport: PHONE_CONTEXT.viewport, rows });
      return;
    }
    if (a.flat) {
      console.log('\nPAIRED, per cycle — the p90 of the poll\'s lateness, in ms:');
      for (const r of rows) {
        if (!r.delay) continue;
        const by = (c) => r.delay.filter((d) => d.cond === c);
        const line = (c) => `${c} ${by(c).map((d) => d.p90.toFixed(1)).join(' ')} (p50 ${by(c).map((d) => d.p50.toFixed(1)).join(' ')}, fps ${by(c).map((d) => d.fps).join(' ')})`;
        console.log(`  ${r.id} (${r.state}), observer pass ${r.cost.open.refreshObserver.ms} ms:`);
        for (const c of ['closed', 'open', 'openTip']) console.log(`    ${line(c)}`);
        const w = (c) => med(by(c).map((d) => d.p90));
        console.log(`    median p90: closed ${w('closed')} → open ${w('open')} → openTip ${w('openTip')}; open beat closed in ${by('open').filter((d, i) => d.p90 > (by('closed')[i] || {}).p90).length}/${by('open').length} cycle(s)`);
      }
      if (a.json) writeJSON(a.json, { commit: headCommit(), base: server.url, reps, warm, window: win, flat: Number(a.flat), viewport: PHONE_CONTEXT.viewport, rows });
      return;
    }
    // the one comparison question 4 turns on, over every measured game-state
    const byCond = {};
    for (const r of rows) for (const d of (r.delay || [])) { (byCond[d.cond] = byCond[d.cond] || []).push(d); }
    const summary = {};
    for (const [k, ds] of Object.entries(byCond)) summary[k] = { windows: ds.length, p50: med(ds.map((d) => d.p50)), p90: med(ds.map((d) => d.p90)), max: Math.max(...ds.map((d) => d.max)), over16: ds.reduce((n, d) => n + d.over16, 0), samples: ds.reduce((n, d) => n + d.samples, 0), framegapP90: med(ds.map((d) => d.frameGap.p90)), fps: med(ds.map((d) => d.fps)), longTasks: ds.reduce((n, d) => n + d.longTasks, 0) };
    console.log(`\nSCHEDULING DELAY, medians over every window (${Object.values(byCond)[0] ? Object.values(byCond)[0][0].every : '—'} ms poll): ${JSON.stringify(summary)}`);
    if (a.json) writeJSON(a.json, { commit: headCommit(), base: server.url, reps, warm, window: win, viewport: PHONE_CONTEXT.viewport, rows, delaySummary: summary });
  } finally {
    await browser.close();
    server.stop();
  }
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
