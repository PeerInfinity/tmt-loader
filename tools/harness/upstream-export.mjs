// Gate G2c: a save EXPORTED from the upstream game page imports into the loader with an equal stateJSON().
// The upstream clone is served RAW and read-only (CDN allowed for THAT page only — it is the upstream page, not ours);
// its intervals are neutralised by an init script so it does not tick on its own; the same N managed ticks run there
// (updateTemp; gameLoop(diff); fixNaNs), exportSave() is captured (its textarea), then tmtLoader.loadFrom() in the
// loader (which reloads through the game's own importSave) and the two stateJSON()s are compared.
//   node upstream-export.mjs <id> --upstream <clone dir> [--ticks 200] [--diff 0.05] [--base URL]
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, firstDivergence, hash16, readManifest, writeJSON, canonicalJSON, topKeys } from './lib.mjs';
import { openContext, openGame, pageLoadFrom } from './page.mjs';

const MASK_SRC = (mask) => `JSON.stringify(player, (k, v) => ${JSON.stringify(mask)}.includes(k) ? undefined : v)`;

// With automation on (the harness default) the loader's player gains `au`, which the upstream save cannot have: the
// comparison then excludes that one top-level key (the A1 anchor rule).
export async function upstreamExport(id, { upstreamDir, ticks = 200, diff = 0.05, base, browser, automation = true }) {
  const manifest = readManifest(id);
  const mask = ['time', 'offTime', ...(manifest.headless?.stateMask || [])];
  const up = await startServer(upstreamDir);
  const row = { id, ticks, gameSeconds: Math.round(ticks * diff * 1e9) / 1e9, diff, upstream: upstreamDir, ok: false };
  try {
    // ---- the upstream page
    const { context, stats } = await openContext(browser, { allowExternal: true });
    try {
      await context.addInitScript(() => {
        window.__intervals = 0;
        window.setInterval = function () { window.__intervals++; return 0; };
      });
      const page = await context.newPage();
      await page.goto(new URL('index.html', up.url).href, { waitUntil: 'load', timeout: 60000 });
      await page.waitForFunction(() => document.readyState === 'complete' && typeof player !== 'undefined' && player && typeof tmp !== 'undefined' && tmp && Object.keys(tmp).length > 0, null, { timeout: 60000, polling: 100 });
      const r = await page.evaluate(([N, DIFF, maskSrc]) => {
        const hasFix = typeof fixNaNs === 'function';
        for (let i = 0; i < N; i++) { updateTemp(); gameLoop(DIFF); if (hasFix) fixNaNs(); }
        // capture exportSave()'s string from the textarea it creates
        let captured = null;
        const ce = document.createElement.bind(document);
        document.createElement = (tag, ...rest) => { const el = ce(tag, ...rest); if (String(tag).toLowerCase() === 'textarea') { const o = document.body.removeChild.bind(document.body); document.body.removeChild = (x) => { if (x === el) captured = el.value; document.body.removeChild = o; return o(x); }; } return el; };
        try { exportSave(); } finally { document.createElement = ce; }
        return { exported: captured, state: (0, eval)(maskSrc), intervalsNeutralised: window.__intervals };
      }, [ticks, diff, MASK_SRC(mask)]);
      Object.assign(row, { upstreamPageErrors: stats.pageErrors, intervalsNeutralised: r.intervalsNeutralised, exportedBytes: r.exported ? r.exported.length : 0, upstreamHash: hash16(r.state) });
      if (!r.exported) throw new Error('exportSave() produced no string');
      row._upstreamState = r.state;
      row._exported = r.exported;
    } finally { await context.close(); }
    // ---- the loader
    const { context: c2, stats: s2 } = await openContext(browser);
    try {
      const page = await c2.newPage();
      const r0 = await openGame(page, base, id, { managed: true, automation });
      if (!r0.ready) throw new Error(`loader not ready: ${JSON.stringify(r0.error)}`);
      const json = Buffer.from(row._exported, 'base64').toString('binary'); // atob
      const r1 = await pageLoadFrom(page, json);
      if (!r1.ready) throw new Error(`loader not ready after loadFrom: ${JSON.stringify(r1.error)}`);
      const st = await page.evaluate(async (au) => { const o = au ? tmtLoader.gameState : {}; return { json: tmtLoader.stateJSON(o), hash: await tmtLoader.hash(o), ticks: tmtLoader.ticks }; }, automation);
      row.automation = automation;
      const div = firstDivergence(row._upstreamState, st.json);
      const canonDiv = firstDivergence(canonicalJSON(row._upstreamState), canonicalJSON(st.json));
      // The upstream 2.5+ page inserts modFiles with setAttribute("async","false") — async stays TRUE — so its layer
      // (and therefore player-key) order is a network race; the loader's order is the manifest's. Equality is judged
      // on the canonical (sorted-key) JSON, and a raw-order difference is recorded, never hidden.
      const ku = topKeys(row._upstreamState), kl = topKeys(st.json);
      Object.assign(row, {
        loaderHash: st.hash, loaderTicksAfterLoad: st.ticks, blocked: s2.blocked.length, failed: s2.failed.length, pageErrors: s2.pageErrors,
        equalRaw: !div, equalCanonical: !canonDiv, canonicalHash: hash16(canonicalJSON(st.json)),
        keyOrderOnly: !!div && !canonDiv, upstreamKeyOrder: div ? ku : undefined, loaderKeyOrder: div ? kl : undefined,
        divergence: canonDiv || null, rawDivergence: div ? { index: div.index, key: div.key } : null,
      });
      row.hash = st.hash;
      row.ok = !canonDiv && s2.blocked.length === 0 && s2.failed.length === 0 && s2.pageErrors.length === 0;
    } finally { await c2.close(); }
  } catch (e) {
    row.exception = String(e && e.stack || e).slice(0, 800);
  } finally {
    up.stop();
    delete row._upstreamState; delete row._exported;
  }
  return row;
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['no-automation']);
  const id = a._[0];
  if (!id || !a.upstream) { console.error('usage: node upstream-export.mjs <id> --upstream <clone dir> [--ticks N] [--diff d]'); process.exit(2); }
  const browser = await chromium.launch();
  const server = a.base ? null : await startServer(REPO);
  let r;
  try { r = await upstreamExport(id, { upstreamDir: a.upstream, ticks: Number(a.ticks ?? 200), diff: Number(a.diff ?? 0.05), base: a.base || server.url, browser, automation: !a['no-automation'] }); }
  finally { await browser.close(); if (server) server.stop(); }
  if (r.divergence) console.log(`DIVERGED at key "${r.divergence.key}"\n  upstream: …${r.divergence.a}…\n  loader:   …${r.divergence.b}…`);
  console.log(JSON.stringify({ ...r, divergence: r.divergence ? { index: r.divergence.index, key: r.divergence.key } : null }));
  if (a.json) writeJSON(a.json, r);
  process.exit(r.ok ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
