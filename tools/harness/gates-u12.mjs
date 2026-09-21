// Gate U12 (docs/mobile.md, "The reset glow"): the layer list's `doReset` / `rowReset` hook.
//   node tools/harness/gates-u12.mjs --part 1 [<id>...] [--pool 4]   THE HOOK IS TRANSPARENT: one scripted sequence of
//                                               the engine's own resets and ticks, driven twice — on a page that loads
//                                               the list (hook installed, list OPEN, so the glow path runs) and on one
//                                               that does not — and the FULL game state compared, with every call's
//                                               return value and throw. Every game by default.
//   node tools/harness/gates-u12.mjs --part 2 [<id>...]   THE COST WITH AUTOMATION ON: the engine running in real time
//                                               with the automation and the list open — resets per second through the
//                                               hook, glow restarts per second, and the wrapper's own overhead per call.
//
// ⛔ WHY PART 1 IS NOT `renderInert`. This is the first time the arc REPLACES an engine global rather than reading one,
// so "the list wrote nothing" is not the claim; "the engine behaved exactly as it would have without us" is. So the
// sequence calls `doReset(l)` and `doReset(l, true)` for EVERY layer (the second argument is load-bearing: a forced
// reset skips the gain and completes challenges), with engine ticks between — the automation on where the game has a
// table, so its own `doReset(f.layer)` crosses the wrapper too — and compares `stateJSON(tmtLoader.gameState)` at the
// end, plus the sequence of what each call returned or threw. ⚠ A game that does not repeat ITSELF (two no-list pages
// differing) ABSTAINS BY NAME: a divergence there is the game's, not the wrapper's.
import { chromium } from 'playwright';
import path from 'node:path';
import { REPO, GAMES, parseArgs, startServer, writeJSON, headCommit, treeDirty, readManifest, deepestSnapshot, entryOnly } from './lib.mjs';
import { openContext, waitReady, pageLoadFrom } from './page.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const KNOWN = new Set(['_', 'part', 'pool', 'no-summary', 'no-write', 'assert']);
for (const k of Object.keys(a)) if (!KNOWN.has(k)) { console.error(`REFUSED: unknown flag --${k}`); process.exit(2); }
const PART = String(a.part ?? '1');
const POOL = Number(a.pool || 4);
const IDS = a._.length ? a._ : GAMES();
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${String(r.notes || '').slice(0, 300)}`); };

// the sequence, in the page. Deterministic by construction: layers in `layers` key order, fixed ticks.
const SEQ_STEP = ([l, force]) => {
  let out;
  try { const r = force ? doReset(l, true) : doReset(l); out = [l, force, typeof r, r === undefined ? null : String(r)]; }
  catch (e) { out = [l, force, 'throw', String(e && e.message || e).slice(0, 120)]; }
  try { tmtLoader.tick(1, 2); } catch (e) { out.push('tick threw ' + String(e && e.message || e).slice(0, 80)); }
  return out;
};

async function sequence(page, withList) {
  const ls = await page.evaluate(() => Object.keys(layers).filter((l) => l !== 'au'));
  const info = await page.evaluate((w) => {
    const ui = window.tmtLoader.layerListUI;
    if (w) { if (!ui) return { error: 'no layer list on the list page' }; ui.open(); }
    return { hooked: ui ? ui.resetHook() : null, isWrapper: typeof doReset === 'function' && !!doReset.tmtLoaderLayerListHook };
  }, withList);
  if (info.error) return { error: info.error };
  const steps = [];
  for (const force of [false, true]) {
    for (const l of ls) {
      steps.push(await page.evaluate(SEQ_STEP, [l, force]));
      // let a frame through, so the list's own observer-driven refresh (and any rebuild a reset caused) runs
      // between the engine's calls, as it does in play
      await page.waitForTimeout(20);
    }
  }
  await page.evaluate(() => tmtLoader.tick(0.05, 40));
  const end = await page.evaluate(() => {
    const ui = window.tmtLoader.layerListUI;
    return { state: tmtLoader.stateJSON(tmtLoader.gameState), stats: ui ? ui.stats() : null, log: ui ? ui.resetLog() : null, hooked: ui ? ui.resetHook() : null };
  });
  return { info, steps, ...end };
}

async function part1() {
  const srv = await startServer(REPO);
  const browser = await chromium.launch();
  try {
    const queue = [...IDS];
    const results = [];
    const worker = async () => {
      for (;;) {
        const id = queue.shift();
        if (!id) return;
        const t0 = Date.now();
        const { context, stats } = await openContext(browser);
        try {
          const auto = !!readManifest(id).auto;
          const snap = deepestSnapshot(id);
          const run = async (withList) => {
            const page = await context.newPage();
            const q = `&managed=1${withList ? '&navbar=1' : ''}${auto ? '&automation=1' : ''}`;
            await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}${q}`, srv.url).href, { waitUntil: 'load' });
            const r0 = await waitReady(page);
            if (!r0.ready) throw new Error(`not ready: ${JSON.stringify(r0.error)}`);
            if (snap) { const r = await pageLoadFrom(page, snap.player); if (!r.ready) throw new Error(`not ready after loadFrom: ${JSON.stringify(r.error)}`); }
            const s = await sequence(page, withList);
            await page.close();
            return s;
          };
          const A = await run(true), B = await run(false);
          if (A.error || B.error) throw new Error(A.error || B.error);
          const sameSteps = JSON.stringify(A.steps) === JSON.stringify(B.steps), sameState = A.state === B.state;
          let control = null;
          if (!(sameSteps && sameState)) { const C = await run(false); control = C.state === B.state && JSON.stringify(C.steps) === JSON.stringify(B.steps); }
          const firstStep = sameSteps ? null : A.steps.findIndex((s, i) => JSON.stringify(s) !== JSON.stringify(B.steps[i]));
          let firstChar = null;
          if (!sameState) { let i = 0; while (i < A.state.length && A.state[i] === B.state[i]) i++; firstChar = { at: i, a: A.state.slice(Math.max(0, i - 60), i + 60), b: B.state.slice(Math.max(0, i - 60), i + 60) }; }
          const resets = A.stats ? A.stats.resets : null, forced = A.steps.filter((s) => s[1] && s[2] !== 'throw').length;
          const hooked = A.info.hooked && A.info.hooked.doReset && A.info.hooked.rowReset && A.info.isWrapper;
          const verdict = !hooked ? `THE HOOK WAS NOT INSTALLED (${JSON.stringify(A.info)})`
            : sameSteps && sameState ? 'identical'
            : control === false ? 'abstains (the game does not repeat itself: two no-list pages differ)'
            : 'DIVERGED';
          const r = { gate: 'U12-1 the doReset hook is TRANSPARENT: full state + every call identical with and without the list', id,
            leg: `${snap ? snap.file.replace(/^tools\/harness\/snapshots\//, '') : 'fresh'}${auto ? ', automation on' : ''}`, ok: verdict === 'identical' || /^abstains/.test(verdict),
            ticks: null, gameSeconds: null, diff: 1, hash: null, verdict, resets, glows: A.stats && A.stats.glows,
            notes: `${verdict}; ${A.steps.length} calls (${A.steps.filter((s) => s[2] === 'throw').length} threw, identically), ${resets} real reset(s) seen by the hook, ${A.stats && A.stats.glows} glow(s), ${A.stats && A.stats.glowsOwed} owed`
              + `${firstStep !== null && firstStep >= 0 ? `; first differing call #${firstStep}: ${JSON.stringify(A.steps[firstStep])} vs ${JSON.stringify(B.steps[firstStep])}` : ''}`
              + `${firstChar ? `; state differs at char ${firstChar.at}: …${firstChar.a}… vs …${firstChar.b}…` : ''}; page errors ${stats.pageErrors.length}; ${Math.round((Date.now() - t0) / 1000)} s` };
          results.push(r);
          row(r);
        } catch (e) {
          const r = { gate: 'U12-1 the doReset hook is TRANSPARENT', id, leg: '—', ok: false, verdict: 'EXCEPTION', notes: `EXCEPTION ${String(e && e.message || e).slice(0, 300)}` };
          results.push(r); row(r);
        } finally { await context.close(); }
      }
    };
    await Promise.all(Array.from({ length: POOL }, worker));
    const by = (v) => results.filter((r) => r.verdict === v).length;
    const abst = results.filter((r) => /^abstains/.test(r.verdict)).map((r) => r.id);
    const drove = results.filter((r) => r.resets > 0).length;
    row({ gate: 'U12-1 VERDICT: the with/without-hook state comparison over the roster', id: `${results.length} games`, leg: '—', ok: results.every((r) => r.ok) && results.length === IDS.length,
      ticks: null, gameSeconds: null, diff: 1, hash: null,
      notes: `${by('identical')} of ${results.length} identical, ${results.filter((r) => r.verdict === 'DIVERGED').length} DIVERGED, ${abst.length} abstained${abst.length ? ` (${abst.join(', ')})` : ''}, ${results.filter((r) => !r.ok && r.verdict !== 'DIVERGED').length} other RED; ${drove} of ${results.length} drove at least one REAL reset through the wrapper (${results.reduce((s, r) => s + (r.resets || 0), 0)} in all)` });
  } finally { await browser.close(); srv.stop(); }
}

// ---- Part 2: the cost, automation ON ------------------------------------------------------------------------------
// The engine's own loop, UNPAUSED (no `managed=1`), with the automation and the list open, for WALL_MS of real time.
// Counted from the list's own stats: resets the hook saw, glow STARTS, resets absorbed into a running glow (owed) and
// re-lit at its end. And the wrapper's own per-call overhead: the same early-returning `doReset` (a layer that
// cannot reset) called N times through the wrapper and through the original it holds.
const WALL_MS = 10000;
async function part2() {
  const srv = await startServer(REPO);
  const browser = await chromium.launch();
  try {
    for (const id of IDS) {
      const { context } = await openContext(browser);
      try {
        const page = await context.newPage();
        const auto = !!readManifest(id).auto;
        await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&navbar=1&automation=1`, srv.url).href, { waitUntil: 'load' });
        await waitReady(page);
        const snap = deepestSnapshot(id);
        if (snap) await pageLoadFrom(page, snap.player);
        const m = await page.evaluate(async (ms) => {
          const ui = tmtLoader.layerListUI;
          ui.open();
          const s0 = ui.stats(), t0 = performance.now();
          const by = {};
          await new Promise((r) => setTimeout(r, ms));
          const s1 = ui.stats(), dt = (performance.now() - t0) / 1000;
          for (const e of ui.resetLog()) by[e.layer] = (by[e.layer] || 0) + 1;
          // the wrapper's overhead on a call that returns early: a layer the engine says cannot reset right now
          const orig = doReset.tmtLoaderLayerListHook;
          const l = Object.keys(layers).find((x) => { try { return tmp[x].canReset === false && !isNaN(Number(layers[x].row)); } catch (e) { return false; } });
          let perCall = null;
          if (l && orig) {
            const N = 20000, time = (f) => { const t = performance.now(); for (let i = 0; i < N; i++) f(l); return (performance.now() - t) / N * 1e6; };
            time(doReset); time(orig);
            const w = [], o = [];
            for (let k = 0; k < 3; k++) { w.push(time(doReset)); o.push(time(orig)); }
            perCall = { layer: l, wrappedNs: Math.round(Math.min(...w)), origNs: Math.round(Math.min(...o)) };
          }
          const d = (k) => s1[k] - s0[k];
          return { dt, resets: d('resets'), glows: d('glows'), owed: d('glowsOwed'), relit: d('glowsRelit'), carries: d('glowCarries'), refreshes: d('refreshes'), recentByLayer: by, perCall };
        }, WALL_MS);
        const rate = (n) => Math.round(n / m.dt * 10) / 10;
        row({ gate: 'U12-2 the reset glow with AUTOMATION ON, real time, the list open', id, leg: `${snap ? snap.file.replace(/^tools\/harness\/snapshots\//, '') : 'fresh'}, ${auto ? 'automation table' : 'derived automation'}, ${Math.round(m.dt)} s`,
          ok: m.glows + m.relit <= m.resets + 1e-9 || m.resets === 0, ticks: null, gameSeconds: null, diff: null, hash: null,
          notes: `${m.resets} resets through the hook (${rate(m.resets)}/s; recent by layer ${JSON.stringify(m.recentByLayer)}); glow starts ${m.glows} + re-lit at an end ${m.relit} = ${rate(m.glows + m.relit)}/s of DOM restarts; ${m.owed} absorbed into a running glow; ${m.carries} carried over a rebuild; ${m.refreshes} list refreshes; the wrapper on an early-returning doReset(${m.perCall && m.perCall.layer}): ${m.perCall ? `${m.perCall.wrappedNs} ns vs ${m.perCall.origNs} ns unwrapped` : 'not measured (no layer that cannot reset)'}` });
      } catch (e) {
        row({ gate: 'U12-2 the reset glow with AUTOMATION ON', id, ok: false, notes: `EXCEPTION ${String(e && e.message || e).slice(0, 300)}` });
      } finally { await context.close(); }
    }
  } finally { await browser.close(); srv.stop(); }
}

const PARTS = { 1: part1, 2: part2 };
if (!PARTS[PART]) { console.error(`no part ${PART}`); process.exit(2); }
await PARTS[PART]();

const red = rows.filter((r) => !r.ok).length;
const short = `U12 part ${PART}: rows ${rows.length}, ${red} RED`;
console.log(`\nVERDICT: ${short}`);
const READING = PART === '1'
  ? 'Part 1: each game runs ONE scripted sequence — doReset(l) then doReset(l, true) for every layer in `layers` key order, two 1 s engine ticks after each call, then 40 ticks of 0.05 s — at its deepest snapshot, on a `?navbar=1` page (the hook installed, the list OPEN) and on a plain one; "identical" means the full `stateJSON(tmtLoader.gameState)` AND every call\'s return/throw are byte-equal. "abstains" = two plain pages differ, so the game does not repeat itself.'
  : 'Part 2: the engine\'s own loop in real time (unpaused), automation on, the list open; counts are the list\'s own stats over the window.';
if (!a['no-write']) {
  writeJSON(path.join(REPO, `tools/harness/results/gates-u12-part${PART}.json`), { gate: `U12 part ${PART}`, commit, dirty, reading: READING, rows });
  if (!a['no-summary']) appendSection({ title: `Gate U12 part ${PART}`, commit, dirty, rows, reading: READING });
}
if (a.assert && red > 0) { console.error(`REFUSED: ${short}`); process.exit(1); }
