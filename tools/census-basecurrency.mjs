#!/usr/bin/env node
// Which layers declare the GLOBAL `player.points` as their base currency (docs/mobile.md, "The global currency on a
// first-row card"). This is the census the figures in that section come from, so they can be re-measured rather
// than remembered.
//
//   node tools/census-basecurrency.mjs [<id>...] [--json out.json]
//
// ⛔ A RUNTIME census, not a static one, and deliberately. A layer's declaration reaches `layers[l]` through
// `addLayer(...)` and through whatever the mod does to it at load; reading `baseAmount.toString()` off the live
// object is the only way to see what the list itself will see. It boots every game once (~10 min for the roster).
//
// ⛔ AND IT READS SOURCE, NEVER VALUES. Comparing `tmp[l].baseAmount` with `player.points` for equality reports 6
// layers on `ptr` and ZERO on `something` at a fresh save — an artefact of the numbers, and backwards.
import { chromium } from 'playwright';
import { REPO, GAMES, startServer, writeJSON, headCommit } from './harness/lib.mjs';
import { openContext } from './harness/page.mjs';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
// ⚠ `--json out.json`'s VALUE is not a game id. Measured the hard way: without this the path was taken as the
// roster and the census ran over one nonexistent game and printed zeros.
const ids = args.filter((a, i) => !a.startsWith('--') && i !== jsonAt + 1);
const roster = ids.length ? ids : GAMES();

// The SAME two rules loader/layerlist.js applies, written out again here: comments stripped with a SPACE (so a
// match can be removed but never spliced together), then the global `player.points` on a word boundary.
const PROBE = `(() => {
  const S = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const G = /(^|[^\\w$.])player\\s*\\.\\s*points\\b/;
  const strip = (x) => String(x).replace(/\\/\\*[\\s\\S]*?\\*\\//g, ' ').replace(/\\/\\/[^\\n\\r]*/g, ' ');
  const out = [];
  S(() => { for (const l of LAYERS) {
    const b = S(() => layers[l].baseAmount, undefined);
    const src = (b === undefined || b === null) ? '' : strip(b);
    const row = S(() => tmp[l].row, undefined);
    out.push({ l, row: typeof row === 'number' ? row : String(row), numericRow: typeof row === 'number',
      global: G.test(src), globalRaw: G.test(String(b == null ? '' : b)),
      baseResource: String(S(() => { const t = tmp[l].baseResource; return t === undefined ? layers[l].baseResource : t; }, '')),
      shown: S(() => !!tmp[l].layerShown, false) });
  } }, null);
  return out;
})()`;

const srv = await startServer(REPO);
const browser = await chromium.launch();
const games = [];
try {
  for (const id of roster) {
    const { context } = await openContext(browser);
    try {
      const page = await context.newPage();
      await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1`, srv.url).href, { waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 40000 });
      games.push({ id, layers: await page.evaluate(PROBE) });
    } catch (e) { games.push({ id, err: String(e).slice(0, 200) }); }
    finally { await context.close(); }
  }
} finally { await browser.close(); srv.stop(); }

const errs = games.filter((g) => g.err);
const all = games.flatMap((g) => (g.layers || []).map((x) => ({ ...x, id: g.id })));
const glob = all.filter((x) => x.global);
const row0 = glob.filter((x) => x.numericRow && x.row === 0);
const per = row0.reduce((o, x) => { o[x.id] = (o[x.id] || 0) + 1; return o; }, {});
const dist = Object.values(per).reduce((o, n) => { o[n] = (o[n] || 0) + 1; return o; }, {});
const labels = glob.reduce((o, x) => { o[x.baseResource] = (o[x.baseResource] || 0) + 1; return o; }, {});
const top = Object.entries(labels).sort((a, b) => b[1] - a[1]).slice(0, 10);
const out = { commit: headCommit(), games: games.length, errors: errs.map((g) => g.id),
  layers: all.length, global: glob.length, globalBeforeCommentStrip: all.filter((x) => x.globalRaw).length,
  strippedOut: all.filter((x) => x.globalRaw && !x.global).map((x) => `${x.id}/${x.l}`),
  row0: row0.length, row0Games: Object.keys(per).length, none: games.length - Object.keys(per).length,
  perGame: dist, multi: Object.entries(per).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]),
  shownAtFreshSave: row0.filter((x) => x.shown).length, labels: top,
  nonNumericRow: glob.filter((x) => !(x.numericRow && x.row === 0)).length };
console.log(`base-currency census at ${out.commit}: ${out.layers} layers over ${out.games} game(s)${errs.length ? ` (${errs.length} FAILED: ${errs.map((g) => g.id).join(', ')})` : ''}`);
console.log(`  declaring the GLOBAL player.points: ${out.global} (${out.globalBeforeCommentStrip} before the comment strip${out.strippedOut.length ? `; cut: ${out.strippedOut.join(', ')}` : ''})`);
console.log(`  of those, on a NUMERIC row 0: ${out.row0} across ${out.row0Games}/${out.games} game(s); ${out.none} game(s) with none`);
console.log(`  games by count: ${JSON.stringify(out.perGame)}; ${out.multi.length} with more than one${out.multi.length ? ` (${out.multi.slice(0, 6).map(([g, n]) => `${g} ${n}`).join(', ')})` : ''}`);
console.log(`  baseResource labels over the ${out.global}: ${top.map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`  row-0 declarers already layerShown at a fresh save: ${out.shownAtFreshSave}`);
if (jsonAt >= 0 && args[jsonAt + 1]) writeJSON(args[jsonAt + 1], { ...out, games });
