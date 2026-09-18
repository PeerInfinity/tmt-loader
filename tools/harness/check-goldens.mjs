// Gate G4a: tmtLoader.ids() frozen per game in goldens/<id>.ids.json; any add/remove/change fails.
//   node check-goldens.mjs [<id>...] [--write] [--page]     (--page also compares the page's ids() to the golden)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO, GAMES, parseArgs, readManifest, startServer, writeJSON } from './lib.mjs';
import { runNode } from './run.mjs';

const goldenPath = (id) => path.join(REPO, `tools/harness/goldens/${id}.ids.json`);
const CENSUS_KEYS = { ms: 'milestones', upg: 'upgrades', buy: 'buyables', ch: 'challenges', ach: 'achievements' };

export function nodeIds(id) {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-ids-')), 'ids.json');
  const r = runNode(id, { ticks: 0, 'ids-out': f });
  if (!r.ok) throw new Error(`${id}: boot failed at ${r.failed_at}: ${r.error}`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

export function compareIds(golden, live) {
  const g = new Set(golden.ids), l = new Set(live.ids);
  const added = live.ids.filter((x) => !g.has(x)), removed = golden.ids.filter((x) => !l.has(x));
  const layersChanged = Object.keys({ ...golden.layers, ...live.layers }).filter((k) => JSON.stringify(golden.layers[k]) !== JSON.stringify(live.layers[k]));
  const orderChanged = !added.length && !removed.length && golden.ids.join('\n') !== live.ids.join('\n');
  return { ok: !added.length && !removed.length && !layersChanged.length && !orderChanged, added, removed, layersChanged, orderChanged };
}

async function main() {
  const a = parseArgs(process.argv.slice(2), ['write', 'page']);
  const ids = a._.length ? a._ : GAMES();
  const rows = [];
  let browser = null, server = null;
  try {
    for (const id of ids) {
      // A game that cannot boot headless is ONE red row, not the end of the batch: this runs over the whole
      // roster, and an abort here means every id after it is never measured and never reported. Measured while
      // adding the census top 100 — `the-tree-prestige` dies in its own getResetGain and took 15 games with it.
      let live;
      try { live = nodeIds(id); }
      catch (e) { rows.push({ id, ok: false, error: String(e.message || e).slice(0, 400) }); console.log(JSON.stringify(rows.at(-1))); continue; }
      const m = readManifest(id);
      const censusCounts = Object.fromEntries(Object.entries(CENSUS_KEYS).map(([k, c]) => [k, m.census?.[c] ?? null]));
      const countsMatchCensus = Object.keys(CENSUS_KEYS).every((k) => live.counts[k] === censusCounts[k]);
      if (a.write) writeJSON(goldenPath(id), { id, commit: m.upstream.commit, ...live });
      if (!fs.existsSync(goldenPath(id))) { rows.push({ id, ok: false, error: 'no golden (run with --write)' }); continue; }
      const golden = JSON.parse(fs.readFileSync(goldenPath(id), 'utf8'));
      const row = { id, counts: live.counts, censusCounts, countsMatchCensus, layers: Object.keys(live.layers).length, ids: live.ids.length, node: compareIds(golden, live) };
      if (a.page) {
        const { chromium } = await import('playwright');
        const { openContext, openGame } = await import('./page.mjs');
        browser ??= await chromium.launch();
        server ??= await startServer(REPO);
        const { context } = await openContext(browser);
        try {
          const page = await context.newPage();
          await openGame(page, server.url, id);
          row.page = compareIds(golden, await page.evaluate(() => tmtLoader.ids()));
        } finally { await context.close(); }
      }
      row.ok = row.node.ok && (!row.page || row.page.ok);
      rows.push(row);
      console.log(JSON.stringify(row));
    }
  } finally { if (browser) await browser.close(); if (server) server.stop(); }
  console.log(`check-goldens: ${rows.map((r) => `${r.id}=${r.ok ? 'GREEN' : 'RED'}`).join(' ')}`);
  if (a.json) writeJSON(a.json, rows);
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2); });
