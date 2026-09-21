// The L2 gates. Appends one section to results/SUMMARY.md.
//   node gates-l2.mjs --part 1 [<id>...]
// Part 1 (L2-1, automation opt-in): the PLAIN page (no ?automation=1) — G1 load green, 0 × #app .smallNode.au, no
// player.au, no games-auto/ request, the L1 #app .treeNode counts; the census idle hash 200×0.05 WITHOUT --exclude au in
// Node (--no-automation) and in the page; ?profile=all&autoOpt=… without the flag is ignored with a console warning; a
// control with the flag (the au node is there and games-auto/ is requested where the manifest has a table).
// gates.mjs, gates-a1.mjs --part 2 and gates-a2.mjs --part 1 are run separately (they write their own sections).
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, readManifest, headCommit, treeDirty, entryOnly } from './lib.mjs';
import { runNode } from './run.mjs';
import { runPage, openContext, openGame, AU_NODE_SELECTOR, LAYER_NODE_SELECTOR } from './page.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);  // a battery, not a library — see lib.mjs

// L1's G1 layer-node counts (SUMMARY, L1 section; plan §10a) — A1 made something's 11 with the au node
const L1_TREE_NODES = { ptr: 8, something: 10 };

const a = parseArgs(process.argv.slice(2));
const PART = String(a.part || '1');
const ids = a._.length ? a._ : GAMES();
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${r.notes || ''}`); };

if (PART !== '1') { console.error('gates-l2.mjs: --part 1 (parts 2 and 3 are recorded by tools/add-game.mjs)'); process.exit(2); }

const browser = await chromium.launch();
const server = await startServer(REPO);
const base = server.url;
try {
  for (const id of ids) {
    const m = readManifest(id);
    const census = m.headless.idleHash;
    // G1 on the plain page (page.mjs --gate load without --automation), and the control with the flag
    for (const automation of [false, true]) {
      const out = execFileSync(process.execPath, [path.join(REPO, 'tools/harness/page.mjs'), id, '--gate', 'load', '--base', base, ...(automation ? ['--automation'] : [])], { encoding: 'utf8', cwd: REPO }).split('\n').filter((l) => l.startsWith('{'));
      const r = JSON.parse(out[0]);
      const wantAuto = !!m.auto;
      const ok = automation
        ? r.ok && r.auNodes === 1 && r.playerAu === true && r.gamesAutoRequests.length === (wantAuto ? 1 : 0)
        : r.ok && r.auNodes === 0 && r.playerAu === false && r.gamesAutoRequests.length === 0 && !(r.gamesDataRequests || []).length && (L1_TREE_NODES[id] === undefined || r.layerNodes === L1_TREE_NODES[id]);
      row({ gate: automation ? 'L2-1 G1 load WITH ?automation=1 (control)' : 'L2-1 G1 load, plain page (no flag)', id, ok, ticks: r.ticks, gameSeconds: Math.round(r.ticks * 0.05 * 1e9) / 1e9, diff: 0.05, hash: null,
        notes: `ready ${r.loadMs} ms; ${r.layerNodes} \`${LAYER_NODE_SELECTOR}\`${!automation && L1_TREE_NODES[id] !== undefined ? ` (L1: ${L1_TREE_NODES[id]})` : ''}; \`${AU_NODE_SELECTOR}\` × ${r.auNodes}; player.au ${r.playerAu ? 'present' : 'absent'}; games-auto requests ${r.gamesAutoRequests.length}${r.gamesAutoRequests.length ? ' (' + r.gamesAutoRequests.map((u) => new URL(u).pathname).join(', ') + ')' : ''}; ${r.requests} requests, ${r.blocked} blocked, ${r.failed.length} failed, ${r.pageErrors.length} page errors` });
    }
    // the census idle anchor with no exclusion: Node --no-automation and the plain page
    {
      const n = runNode(id, { ticks: census.ticks, diff: census.diff, automation: false });
      row({ gate: 'L2-1 census idle hash, Node --no-automation (no --exclude)', id, ok: n.ok && n.hash === census.hash && n.automation === false && !n.exclude && !(n.features || []).length, ticks: n.ticks, gameSeconds: n.gameSeconds, diff: census.diff, hash: n.hash,
        notes: `census ${census.hash}; automation ${n.automation}; features ${(n.features || []).length}; player keys incl. au: ${Object.keys(n.state_paths || {}).some((k) => k === 'au' || k.startsWith('au.'))}` });
      const p = await runPage(browser, base, id, { ticks: census.ticks, diff: census.diff, automation: false });
      row({ gate: 'L2-1 census idle hash, plain page (no --exclude)', id, ok: p.hash === census.hash && p.automation === false && p.blocked === 0 && p.failed === 0 && p.pageErrors.length === 0, ticks: p.ticks, gameSeconds: p.gameSeconds, diff: census.diff, hash: p.hash,
        notes: `census ${census.hash}; page ${p.ms} ms; ${p.blocked} blocked, ${p.failed} failed, ${p.pageErrors.length} page errors` });
    }
    // ?profile= / ?autoOpt= without the flag: ignored with a warning, not an error
    {
      const { context, stats } = await openContext(browser);
      try {
        const page = await context.newPage();
        await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&managed=1&profile=all&autoOpt=hookAll=1`, base).href, { waitUntil: 'load' });
        const r = await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error) ? { ready: tmtLoader.ready, error: tmtLoader.error } : null, null, { timeout: 30000 }).then((h) => h.jsonValue());
        const info = await page.evaluate(() => ({ automation: tmtLoader.automation, profile: tmtLoader.profile(), registry: typeof tmtLoader.registerAutoFeature, au: 'au' in player || !!layers.au, options: JSON.stringify(tmtLoader.options) }));
        const auNodes = await page.locator(AU_NODE_SELECTOR).count();
        const warned = stats.consoleWarnings.filter((w) => /ignored without \?automation=1/.test(w));
        const ok = r.ready && !r.error && info.automation === false && info.profile === 'off' && info.registry === 'undefined' && !info.au && auNodes === 0 && warned.length === 2 && stats.pageErrors.length === 0 && stats.consoleErrors.length === 0;
        row({ gate: 'L2-1 ?profile=all&autoOpt= without the flag → ignored + warning', id, ok, ticks: 0, gameSeconds: 0, diff: null, hash: null,
          notes: `ready ${r.ready}; automation ${info.automation}; profile ${info.profile}; registerAutoFeature ${info.registry}; au ${info.au}; options ${info.options}; au nodes ${auNodes}; warnings: ${warned.map((w) => '"' + w + '"').join(', ')}; ${stats.pageErrors.length} page errors, ${stats.consoleErrors.length} console errors` });
      } finally { await context.close(); }
    }
  }
} finally {
  await browser.close();
  server.stop();
}

appendSection({ title: `L2 part 1 (\`node tools/harness/gates-l2.mjs --part 1\`)`, commit, dirty, rows, reading: 'automation is opt-in: the plain page and `run.mjs --no-automation` are the game plus the contract; the census anchors hold with no `--exclude au`.' });
process.exit(rows.every((r) => r.ok) ? 0 : 1);
