// The A1 gates (automation registry + au side layer). Appends one section to results/SUMMARY.md.
//   node gates-a1.mjs --part 1|2 [<id>...]
// Part 1 (A1-1): anchors with `au` excluded, the wrapper-call counter, updateTemp never calls automate, parity, goldens,
// manifest, and the au layer present in Node and the page. `--no-auto` keeps any manifest `auto` table out (Part 1 is
// the registry with games-auto/ absent). Part 2 (A1-2): A1-1's rows re-run WITH the tables at profile off, plus the page
// checks of the au tab (all Off; ?profile=all shows On without writing the save; a toggle persists; the disclosure).
// Every row carries the commit, ticks, gameSeconds, diff and hash.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, readManifest, headCommit, treeDirty, writeJSON } from './lib.mjs';
import { runNode } from './run.mjs';
import { openContext, openGame, pageTick } from './page.mjs';
import { parity } from './parity.mjs';
import { checkManifest } from './check-manifest.mjs';
import { nodeIds, compareIds } from './check-goldens.mjs';

// L1's off-profile anchors (results/SUMMARY.md, L1 section at 56c5e34): idle 1000×0.05 and census policy 1000×0.05.
// The 200×0.05 idle anchor is the census's, read from manifest.headless.idleHash.
const ANCHORS = {
  ptr: { idle1000: '86067be644ce481c', policy1000: '5ce24001caa4f31f' },
  something: { idle1000: '5739997ed0e70447', policy1000: '52ffa8d3c5eaba03' },
};
export const AU_NODE_SELECTOR = '#app .smallNode.au';

const a = parseArgs(process.argv.slice(2), ['no-summary']);
const PART = String(a.part || '1');
const ids = a._.length ? a._ : GAMES();
const noAuto = PART === '1';
const commit = headCommit(), dirty = treeDirty();
const date = new Date().toISOString().slice(0, 19) + 'Z';
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${r.leg || ''} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} diff=${r.diff ?? '-'} hash=${r.hash ?? '-'} ${r.notes || ''}`); };
const base0 = { 'no-auto': noAuto || undefined };

const browser = await chromium.launch();
const server = await startServer(REPO);
const base = server.url;
try {
  for (const id of ids) {
    const m = readManifest(id);
    const tag = noAuto ? 'A1-1' : 'A1-2';
    // anchors, au excluded
    const census = m.headless.idleHash;
    for (const [leg, ticks, want] of [['idle', census.ticks, census.hash], ['idle', 1000, ANCHORS[id].idle1000], ['policy', 1000, ANCHORS[id].policy1000]]) {
      const r = runNode(id, { ...base0, ticks, diff: 0.05, leg, exclude: 'au' });
      row({ gate: `${tag} anchor (exclude au, profile off)`, id, leg, ok: r.ok && r.hash === want && r.profile === 'off' && !r.file_errors?.length, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 0.05, hash: r.hash,
        notes: `L1 anchor ${want}; full state incl. au ${r.hashFull}; features registered ${r.features?.length ?? 0}${r.auto ? ` (${r.auto})` : ''}${r.file_errors?.length ? '; FILE ERRORS ' + JSON.stringify(r.file_errors) : ''}` });
    }
    // wrapper-call counter: every tree layer hooked (no features), census policy leg so resets happen
    {
      const r = runNode(id, { ...base0, ticks: 1000, diff: 0.05, leg: 'policy', exclude: 'au', 'auto-opt': 'hookAll=1' });
      const h = r.hook || { hooked: [], calls: {} };
      const perLayer = h.hooked.every((l) => h.calls[l] === r.ticks);
      const slot = Object.keys(h.viaSlot || {}), fb = Object.keys(h.viaFallback || {});
      row({ gate: `${tag} wrapper calls = 1 per hooked layer per tick`, id, leg: 'policy', ok: r.ok && perLayer && h.doubles === 0 && h.loops === r.ticks && h.hooked.length > 0 && r.hash === ANCHORS[id].policy1000, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 0.05, hash: r.hash,
        notes: `${h.hooked.length} layers hooked (hookAll probe); loops ${h.loops}; doubles ${h.doubles}; own automate slot: ${slot.length} (${slot.join(' ')}); au fallback (layer's slot skipped by the engine): ${fb.length}${fb.length ? ' (' + fb.join(' ') + ')' : ''}; hash = policy anchor` });
    }
    // updateTemp never calls automate: after each tick, updateTemp() ×3 must not move the counter
    {
      const until = `(function(){ var a = JSON.stringify(tmtLoader.hookStats().calls); updateTemp(); updateTemp(); updateTemp(); return JSON.stringify(tmtLoader.hookStats().calls) !== a; })()`;
      const r = runNode(id, { ...base0, ticks: 200, diff: 0.05, leg: 'policy', 'auto-opt': 'hookAll=1', until });
      row({ gate: `${tag} updateTemp does not call automate`, id, leg: 'policy', ok: r.ok && r.until && r.until.met === false && r.until.errors === 0, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 0.05, hash: r.hash,
        notes: `updateTemp() ×3 after each of ${r.ticks} ticks moved the counter: ${r.until?.met}; predicate errors ${r.until?.errors}` });
    }
    // parity node ≡ page at 1000×0.05 idle (full state, au included); and a hookAll page run shows the same counters
    {
      const p = await parity(id, { ticks: 1000, diff: 0.05, leg: 'idle', base, browser });
      row({ gate: `${tag} parity node≡page (full state)`, id, leg: 'idle', ok: p.ok, ticks: p.ticks, gameSeconds: p.gameSeconds, diff: 0.05, hash: p.node?.hash, notes: p.ok ? `page ${p.page.hash} in ${p.page.ms} ms` : `DIVERGED ${JSON.stringify(p.divergence || p.error).slice(0, 300)}` });
      const q = await parity(id, { ticks: 200, diff: 0.05, leg: 'policy', base, browser, autoOpt: 'hookAll=1' });
      const same = JSON.stringify(q.node?.hook) === JSON.stringify(q.page?.hook);
      row({ gate: `${tag} parity hookAll (counters node≡page)`, id, leg: 'policy', ok: q.ok && same, ticks: q.ticks, gameSeconds: q.gameSeconds, diff: 0.05, hash: q.node?.hash, notes: `state equal ${q.ok}; hookStats equal ${same}; page loops ${q.page?.hook?.loops}` });
    }
    // goldens (au is not game content) + manifest
    {
      const live = nodeIds(id);
      const golden = JSON.parse(fs.readFileSync(path.join(REPO, `tools/harness/goldens/${id}.ids.json`), 'utf8'));
      const c = compareIds(golden, live);
      row({ gate: `${tag} check-goldens unchanged`, id, ok: c.ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: `${live.ids.length} ids, ${Object.keys(live.layers).length} layers${c.ok ? '' : ' ' + JSON.stringify(c).slice(0, 300)}` });
      const cm = checkManifest(id);
      row({ gate: `${tag} check-manifest`, id, ok: cm.ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: cm.ok ? `${cm.scripts} scripts, ${cm.modFiles} modFiles, games/${id} pristine${m.auto ? `, auto ${m.auto}` : ''}` : JSON.stringify(cm.problems).slice(0, 300) });
    }
    // the au layer in the page: tmp.au, player.au shape, node rendered, 0 errors
    {
      const { context, stats } = await openContext(browser);
      try {
        const page = await context.newPage();
        const r = await openGame(page, base, id, { managed: true });
        const info = await page.evaluate(() => ({ tmpAu: !!tmp.au, row: layers.au && layers.au.row, doReset: !!(layers.au && layers.au.doReset), features: JSON.stringify(player.au.features), disclosed: player.au.disclosed, profile: tmtLoader.profile(), registered: tmtLoader.features.length }));
        const nodes = await page.locator(AU_NODE_SELECTOR).count();
        const ok = r.ready && info.tmpAu && info.row === 'side' && !info.doReset && info.features === '{}' && info.disclosed === false && info.profile === 'off' && nodes === 1 && stats.pageErrors.length === 0 && stats.failed.length === 0 && stats.blocked.length === 0;
        row({ gate: `${tag} au layer in the page`, id, ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: `tmp.au ${info.tmpAu}; row ${info.row}; doReset ${info.doReset}; player.au.features ${info.features}; disclosed ${info.disclosed}; managed profile ${info.profile}; ${info.registered} features; \`${AU_NODE_SELECTOR}\` × ${nodes}; ${stats.pageErrors.length} page errors, ${stats.failed.length} failed, ${stats.blocked.length} blocked` });
      } finally { await context.close(); }
    }
    if (!noAuto) await part2Page(id);
  }
} finally {
  await browser.close();
  server.stop();
}

// A1-2 page checks, one context per game (one origin, one localStorage): fresh boot all Off; ?profile=all shows On and
// does not write the save; a manual toggle persists across reload; the disclosure line appears on the first click.
async function part2Page(id) {
  const { context, stats } = await openContext(browser);
  const shotDir = path.join(REPO, 'tools/harness/results');
  const notes = [];
  let ok = true;
  const check = (cond, what) => { if (!cond) ok = false; notes.push(`${cond ? '✓' : '✗'} ${what}`); };
  try {
    const page = await context.newPage();
    // normal (unmanaged) boot: the page's default profile is `saved`
    const url = (q = '') => new URL(`index.html?mod=${encodeURIComponent(id)}${q}`, base).href;
    const open = async (q) => { await page.goto(url(q), { waitUntil: 'load' }); await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 }); await page.evaluate(() => tmtLoader.pause()); };
    const auTab = async () => { await page.evaluate(() => showTab('au')); await page.waitForTimeout(400); };
    const buttons = () => page.evaluate(() => Object.keys(layers.au.clickables).filter((k) => !isNaN(k) && k !== '11').map((k) => ({ id: k, title: layers.au.clickables[k].title, display: layers.au.clickables[k].display() })));
    const saved = () => page.evaluate(() => { const raw = tmtLoader.storage.raw, o = {}; for (let i = 0; i < raw.length.call(localStorage); i++) { const k = raw.key.call(localStorage, i); o[k] = raw.getItem.call(localStorage, k); } return o; });

    await open('');
    await page.evaluate(() => tmtLoader.storage.clear());
    await open('');
    check(await page.evaluate(() => tmtLoader.profile()) === 'saved', 'unmanaged default profile = saved');
    await auTab();
    let b = await buttons();
    check(b.length === (await page.evaluate(() => tmtLoader.features.length)) && b.length > 0, `${b.length} feature toggles`);
    check(b.every((x) => /^(Off|Locked)/.test(x.display)), `fresh boot: every toggle Off/Locked (${[...new Set(b.map((x) => x.display.split('<')[0]))].join(', ')})`);
    const domText = await page.locator('#app').innerText();
    check(domText.includes('Automation Tools'), 'au tab renders its title');
    check(!domText.includes('loader addition'), 'no disclosure before any click');
    await page.screenshot({ path: path.join(shotDir, `${id}-au-off.png`) });
    await page.evaluate(() => save());
    const before = await saved();

    await open('&profile=all');
    await auTab();
    b = await buttons();
    check(b.some((x) => /^On/.test(x.display)) && b.every((x) => /^(On|Locked)/.test(x.display)), `?profile=all: toggles On (${[...new Set(b.map((x) => x.display.split('<')[0]))].join(', ')})`);
    await page.screenshot({ path: path.join(shotDir, `${id}-au-all.png`) });
    await page.evaluate(() => save());
    const afterAll = await saved();
    const featuresOf = (st) => { const k = Object.keys(st).find((x) => !x.endsWith('_options')); try { let j = JSON.parse(atob(st[k])); if (j[j.set]) j = j[j.set]; return JSON.stringify(j.au && j.au.features); } catch (e) { return 'unparsed ' + e.message; } };
    check(featuresOf(afterAll) === '{}' && featuresOf(before) === '{}', `?profile=all did not write the save (saved au.features ${featuresOf(afterAll)})`);

    await open('');
    await auTab();
    b = await buttons();
    check(b.every((x) => /^(Off|Locked)/.test(x.display)), 'reload without ?profile: Off again');

    // manual toggle: click the first unlocked feature's button in the DOM
    const target = b.find((x) => /^Off/.test(x.display));
    check(!!target, `an unlocked feature to click (${target && target.title})`);
    if (target) {
      await page.locator('#app button.upg').filter({ hasText: target.title }).first().click();
      await page.waitForTimeout(400);
      const st = await page.evaluate((k) => ({ on: player.au.features[layers.au.clickables[k].tmtFeature], disclosed: player.au.disclosed, text: document.querySelector('#app').innerText }), target.id);
      check(st.on === true, `click turned "${target.title}" on`);
      check(st.disclosed === true && st.text.includes('Automation tools are a loader addition (tmt-loader); every toggle is off by default.'), 'disclosure line after the first click');
      await page.screenshot({ path: path.join(shotDir, `${id}-au-toggled.png`) });
      await page.evaluate(() => save());
      const keys = Object.keys(await saved());
      check(keys.every((k) => k.startsWith(`tmt-loader:${id}:`)), `save namespaced (${keys.length} keys under tmt-loader:${id}:)`);
      await open('');
      const st2 = await page.evaluate((k) => ({ on: player.au.features[layers.au.clickables[k].tmtFeature], disclosed: player.au.disclosed }), target.id);
      await auTab();
      const b2 = await buttons();
      check(st2.on === true && /^On/.test(b2.find((x) => x.id === target.id).display), 'toggle persists across reload (On)');
      await page.evaluate(() => tmtLoader.storage.clear());
    }
    check(stats.pageErrors.length === 0 && stats.failed.length === 0 && stats.blocked.length === 0, `${stats.pageErrors.length} page errors, ${stats.failed.length} failed, ${stats.blocked.length} blocked`);
  } catch (e) { ok = false; notes.push('EXCEPTION ' + String(e && e.stack || e).slice(0, 400)); }
  finally { await context.close(); }
  row({ gate: 'A1-2 au tab (page)', id, ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: notes.join('; ') + `; screenshots results/${id}-au-{off,all,toggled}.png` });
}

const SUMMARY = path.join(REPO, 'tools/harness/results/SUMMARY.md');
const cell = (v) => (v === null || v === undefined ? '—' : String(v).replace(/\|/g, '\\|'));
let md = `\n## ${date} — A1 part ${PART} (\`node tools/harness/gates-a1.mjs --part ${PART}\`) — commit \`${commit}\`${dirty ? ' (tree DIRTY)' : ''} — ${rows.filter((r) => r.ok).length}/${rows.length} green\n\n| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${cell(r.gate)} | ${r.id} | ${cell(r.leg)} | ${cell(r.ticks)} | ${cell(r.gameSeconds)} | ${cell(r.diff)} | ${r.hash ? '`' + r.hash + '`' : '—'} | ${r.ok ? 'GREEN' : '**RED**'} | ${cell(r.notes)} |\n`;
if (!a['no-summary']) fs.appendFileSync(SUMMARY, md);
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-a1-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-a1 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
process.exit(rows.every((r) => r.ok) ? 0 : 1);
