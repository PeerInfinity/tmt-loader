// The A1 gates (automation registry + au side layer). Appends one section to results/SUMMARY.md.
//   node gates-a1.mjs --part 1|2|3 [<id>...]
// Part 1 (A1-1): anchors with `au` excluded, the wrapper-call counter, updateTemp never calls automate, parity, goldens,
// manifest, and the au layer present in Node and the page. `--no-auto` keeps any manifest `auto` table out (Part 1 is
// the registry with games-auto/ absent). Part 2 (A1-2): A1-1's rows re-run WITH the tables at profile off, plus the page
// checks of the au tab (all Off; ?profile=all shows On without writing the save; a toggle persists; the disclosure).
// Part 3 (A1-3): the rung under profile all — each predicate's first tick (marks) with gameSeconds + hash, a second run
// equal; PTR's pair order both ways; the next stall per game (L1 detector, 3600 game-s, 2 min wall); parity node ≡ page
// under profile all at the (i) predicate's tick count. Node runs go in parallel child processes (each ≤ 10 min).
// Every row carries the commit, ticks, gameSeconds, diff and hash.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, readManifest, headCommit, treeDirty, writeJSON, entryOnly, gateCoverage, coverageLine } from './lib.mjs';
import { runNode } from './run.mjs';
import { openContext, openGame, pageTick } from './page.mjs';
import { parity } from './parity.mjs';
import { checkManifest } from './check-manifest.mjs';
import { nodeIds, compareIds } from './check-goldens.mjs';
import os from 'node:os';
import { spawn } from 'node:child_process';
entryOnly(import.meta.url);  // a battery, not a library — see lib.mjs

// L1's off-profile anchors (results/SUMMARY.md, L1 section at 56c5e34): idle 1000×0.05 and census policy 1000×0.05.
// The 200×0.05 idle anchor is the census's, read from manifest.headless.idleHash.
const ANCHORS = {
  ptr: { idle1000: '86067be644ce481c', policy1000: '5ce24001caa4f31f' },
  something: { idle1000: '5739997ed0e70447', policy1000: '52ffa8d3c5eaba03' },
};
const MARKS = {
  ptr: [['(i) b and g unlocked', 'player.b.unlocked && player.g.unlocked'], ['(ii) keep-upgrade milestones b0 + g0', "hasMilestone('b',0) && hasMilestone('g',0)"], ['(iii) b.best ≥ 15 and g.best ≥ 15', 'player.b.best.gte(15) && player.g.best.gte(15)']],
  // fundamental.js has no milestones: (iii) is the next milestone in the tree, primitive ms 1 ("10 Numbers") — a row-2
  // layer no A1 feature resets, so it is expected unmet (a finding, and A2's input)
  something: [['(i) first fundamental reset (fundamental.total ≥ 1)', 'player.fundamental.total.gte(1)'], ['(ii) unlock:upg:12', "hasUpgrade('unlock', 12)"], ['(iii) primitive ms 1 (next milestone in the tree)', "hasMilestone('primitive', 1)"]],
};
export const AU_NODE_SELECTOR = '#app .smallNode.au';

const a = parseArgs(process.argv.slice(2), ['no-summary', 'assert']);
const PART = String(a.part || '1');
const ids = a._.length ? a._ : GAMES();
const noAuto = PART === '1';
const commit = headCommit(), dirty = treeDirty();
const date = new Date().toISOString().slice(0, 19) + 'Z';
const rows = [];
// ⚖ U16: which ids' player view actually had a table note to replace — the per-game check is an equality, so the
// question "did anything exercise it at all?" belongs to the RUN, and is answered once, after the loop.
const provSeen = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ${r.leg || ''} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} diff=${r.diff ?? '-'} hash=${r.hash ?? '-'} ${r.notes || ''}`); };
const base0 = { 'no-auto': noAuto || undefined };

const browser = await chromium.launch();
const server = await startServer(REPO);
const base = server.url;
try {
  if (PART === '3') await part3();
  else for (const id of ids) {
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
      row({ gate: `${tag} check-manifest`, id, ok: cm.ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: cm.ok ? `${cm.scripts} scripts, ${cm.modFiles} modFiles, games/${id} pristine${cm.mediaFiles ? ` up to ${cm.mediaFiles} processed media files` : ''}${m.auto ? `, auto ${m.auto}` : ''}` : JSON.stringify(cm.problems).slice(0, 300) });
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
    if (!noAuto) { await part2Page(id); await part2Arm(id); await part2Advanced(id); }
  }
  // ⚖ U16: the player view's provenance replacement, asked of the RUN. A run in which no game had a note to
  // replace has not tested that line — and saying so is the difference between a green and a green that means
  // something. (A single-game run on a game with no notes therefore goes red HERE, on purpose.)
  if (PART === '2' && provSeen.length) {
    const with_ = provSeen.filter(([, n]) => n > 0);
    row({ gate: 'A1-2 the PLAYER view’s table notes were exercised by this run', id: provSeen.map(([i]) => i).join('+'), ok: with_.length > 0, ticks: 0, gameSeconds: 0, diff: null, hash: null,
      notes: with_.length ? `${with_.map(([i, n]) => `${i} ${n}`).join(', ')} note(s) on drawn rows` : `no game in this run drew a block carrying a table note (${provSeen.map(([i, n]) => `${i} ${n}`).join(', ')}) — the replacement is untested here` });
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
    const url = (q = '') => new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1${q}`, base).href;
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
      // the page is paused: refresh tmp (2.2.1 tab text) and 2.7's updateTabFormats() — both run in the engines' interval, not in gameLoop
      await page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
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

// ⚠ THE SENTINEL FOR "THE ADVANCED VIEW IS ON SCREEN" IS THE INTRO'S FIRST WORDS, NOT ITS LAST.
// It used to be the literal `Read-only.`, and V2 is the slice that stopped that being true — the view is EDITABLE
// now, so the sentence changed and three checks here went red on a string rather than on a behaviour. MEASURED:
// `✗ Advanced renders` on a view that was rendering perfectly. A gate keyed to a display string is keyed to prose;
// this one is at least keyed to the part of the prose that says what the view IS, which a later slice has no
// reason to reword.
// ⛔ AND IT IS SPELLED OUT AT EACH USE, not hoisted into a constant: all three live inside a
// `page.evaluate()`, which runs in the BROWSER, where a Node-side `const` is simply not in scope. The first cut
// of this fix made it a constant and turned the red into `ReferenceError: ADV_SENTINEL is not defined` — a
// different red, on the same leg, for a reason that had nothing to do with the view.
const ADV_SENTINEL_NOTE = 'What each feature decided';   // the sentinel, for a reader grepping for it

// ---- Part 2 (U4): MAY AUTOMATION BE ARMED FOR A FEATURE THAT IS NOT UNLOCKED YET? ----------------------------------
// ⚖ user, 2026-09-19. The setting is `player.au.armLocked`, written by the `au` tab's own `toggle`; it lifts the two UI
// predicates that refuse a press on a locked feature's button and NOTHING ELSE.
//
// The whole claim, and the order it has to be driven in:
//   1. with the setting OFF the button still refuses — the behaviour every earlier row was measured against is the
//      DEFAULT, so this half is what says the change is opt-in;
//   2. with it ON the feature can be armed and the flag PERSISTS across a reload;
//   3. and it DOES NOT RUN while it is locked — `active()` is untouched, and every one of its branches already ANDs
//      with `featureUnlocked`, which is exactly what makes arming safe rather than a foot-gun;
//   4. ⚠ AND THEN IT STARTS BY ITSELF. This is the step the leg exists for: storing a flag proves nothing a
//      `localStorage` write would not. The feature is unlocked IN THE SAME PAGE and must go `active` and ACT with no
//      further press. The mutant that relaxes `active()` to drop its `featureUnlocked` reds step 3; a build that
//      ignored the setting in either toggle reds step 1 or 2.
//
// The unlock is the engine's OWN where the engine allows it, and the row says which path it took: `doReset(l)` on the
// candidate's layer, then the `player[l].unlocked` flag. ⚠ Neither sticks on every engine — MEASURED on Something
// Tree, whose `unlock.update()` recomputes `player.fundamental.unlocked` every tick and puts it straight back — so
// the fallback replaces the FEATURE's own derived predicate with one that says yes, which is the same construction
// the mobile gate uses for `pseudoUnl`. On ptr the engine's own `doReset('p')` is enough.
async function part2Arm(id) {
  const { context, stats } = await openContext(browser);
  const notes = [];
  let ok = true;
  const check = (cond, what) => { if (!cond) ok = false; notes.push(`${cond ? '\u2713' : '\u2717'} ${what}`); };
  try {
    const page = await context.newPage();
    const url = new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1`, base).href;
    const open = async () => {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      await page.evaluate(() => tmtLoader.pause());
      await page.evaluate(() => showTab('au'));
      await page.waitForTimeout(300);
    };
    // the page is paused, so tmp and 2.7's tab formats are refreshed by hand — the engines do both in their own
    // interval, not in gameLoop (the same reason part2Page does it)
    const redraw = () => page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
    const state = (k) => page.evaluate((kk) => {
      const T = window.tmtLoader, AU = T.auLayer, c = layers[AU].clickables[kk], s = T.featureState(c.tmtFeature);
      // (U6) … and WHAT THE SETTING'S OWN BUTTON RENDERS. The flag is not the claim: it already flipped on the
      // build the user reported, and the button still read `OFF`.
      const b = [...document.querySelectorAll('#app button.smallUpg')][0];
      return { armLocked: T.armLocked(), stored: player[AU].armLocked, canClick: c.canClick(), display: c.display(),
        saved: s.saved, unlocked: s.unlocked, active: s.active, armable: s.armable,
        toggleText: b ? b.textContent.trim() : null, seeded: player[AU].armLocked !== undefined,
        actions: T.hookStats().actions[c.tmtFeature] || 0 };
    }, k);

    await open();
    await page.evaluate(() => tmtLoader.storage.clear());
    await open();
    // A LOCKED CANDIDATE, and a purchase kind by preference: a purchase kind's derived `unlocked()` IS
    // `player[l].unlocked`, which is the flag an unlock can be driven through. A `reset` feature's is the layer's
    // `layerShown`, which is the game's own function and not a value.
    const pick = await page.evaluate(() => {
      const T = window.tmtLoader, AU = T.auLayer;
      const st = T.features.map((f) => T.featureState(f.id));
      const cand = st.find((x) => !x.unlocked && x.kind !== 'reset' && player[x.layer] && player[x.layer].unlocked === false)
        || st.find((x) => !x.unlocked);
      if (!cand) return { locked: 0, features: st.length };
      for (const k in layers[AU].clickables) if (layers[AU].clickables[k].tmtFeature === cand.id) {
        return { k, id: cand.id, layer: cand.layer, kind: cand.kind, title: layers[AU].clickables[k].title,
          locked: st.filter((x) => !x.unlocked).length, features: st.length };
      }
      return { locked: st.filter((x) => !x.unlocked).length, features: st.length };
    });
    if (!pick.k) {
      notes.push(`abstains: no locked feature at a fresh save (${pick.locked}/${pick.features} locked)`);
      row({ gate: 'A1-2 arming a locked feature (page)', id, ok: true, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: notes.join('; ') });
      return;
    }
    notes.push(`candidate ${pick.id} (${pick.kind} on ${pick.layer}), ${pick.locked}/${pick.features} features locked`);
    const press = async () => { await page.locator('#app button.upg').filter({ hasText: pick.title }).first().click(); await redraw(); };
    const master = async () => { await page.locator('#app button.upg').filter({ hasText: 'All features' }).first().click(); await redraw(); };
    // ⚠ a real click on the engine's own control, and a beat for Vue to re-render: the claim under test is what
    // the button SHOWS after the press, which is one `nextTick` away from the write that caused it.
    const setting = async () => { await page.locator('#app button.smallUpg').first().click(); await redraw(); await page.waitForTimeout(80); };
    // how many features the save says are on, and whether OUR candidate is one of them — the master toggle is judged
    // on both, because "it armed nothing" and "it turned nothing on at all" are different defects
    const tally = () => page.evaluate((fid) => {
      const T = window.tmtLoader, AU = T.auLayer, f = player[AU].features || {};
      return { on: Object.keys(f).filter((k) => f[k]).length, cand: !!f[fid], features: T.features.length };
    }, pick.id);

    // ---- 1. THE DEFAULT: the setting is off and the button refuses ------------------------------------------------
    const s0 = await state(pick.k);
    // ⚖ SINCE V1 THE KEY IS SEEDED (`startData`, user 2026-09-19 §15d.2), so the default is `false` and PRESENT,
    // not absent. What this half asserts is unchanged and is the half that matters: the behaviour every earlier row
    // was measured against is still the DEFAULT — the setting is off and the locked button still refuses.
    check(s0.armLocked === false && s0.stored === false, `default: armLocked off, and seeded false in the save (player.au.armLocked ${s0.stored})`);
    check(s0.canClick === false && s0.display === 'Locked' && s0.armable === false, `default: the toggle refuses (canClick ${s0.canClick}, display "${s0.display}")`);
    await press();
    const s1 = await state(pick.k);
    check(s1.saved === false, `default: a real press on the locked button changed nothing (saved ${s1.saved})`);
    // …and the MASTER toggle refuses it too, which is a predicate of its own and therefore a mutant of its own.
    // ⚠ Judged on TWO numbers: the locked candidate must stay off AND the unlocked features must have come on, or a
    // master toggle that did nothing at all would pass the half that matters here.
    await master();
    const m1 = await tally();
    check(m1.cand === false && m1.on > 0, `default: *All features* turned ${m1.on}/${m1.features} on and did NOT arm the locked ${pick.id}`);
    await master();   // every armable one is on now, so the second press clears them all — back to a clean slate
    const m1b = await tally();
    check(m1b.on === 0, `*All features* pressed again cleared the ${m1.on} it set (${m1b.on} on)`);

    // ---- 2. THE SETTING ON, through its own control ---------------------------------------------------------------
    await setting();
    const s2 = await state(pick.k);
    check(s2.armLocked === true && s2.stored === true, `the au tab's own toggle wrote player.au.armLocked = ${s2.stored}`);
    // ⛔ (U6) AND THE BUTTON SAYS SO. This is the leg the user's 2026-09-19 report is about: on `ptr` the press
    // flipped `player.au.armLocked` to true and the button went on reading `OFF`, because Vue 2 cannot observe a
    // key ADDED to an object after creation and 24 of the 171 engines' `toggleAuto` assigns plainly. Asserting the
    // FLAG would have been green on that build; asserting the RENDERED TEXT is what catches it.
    // ⚠ The two halves are the press and the press BACK, so a button stuck on `ON` fails as surely as one stuck
    // on `OFF`, and the text is not compared against a literal — the engines' wording is theirs.
    check(s0.toggleText !== null && s2.toggleText !== null && s2.toggleText !== s0.toggleText,
      `the setting's own button RE-RENDERED on the press ("${s0.toggleText}" → "${s2.toggleText}"; the key is seeded, so the ENGINE's own toggleAuto is enough: ${s2.seeded})`);
    await setting();
    const s2b = await state(pick.k);
    check(s2b.armLocked === false && s2b.toggleText === s0.toggleText,
      `and back on the second press (armLocked ${s2b.armLocked}, button "${s2b.toggleText}")`);
    await setting();
    const s2c = await state(pick.k);
    check(s2c.armLocked === true && s2c.toggleText === s2.toggleText, `and on again (armLocked ${s2c.armLocked}, button "${s2c.toggleText}")`);
    check(s2.canClick === true && s2.armable === true, `with it on, the locked button accepts a press (canClick ${s2.canClick})`);
    // ⚖ and *All features* arms the locked ones too (decided in U4, docs/automation.md)
    await master();
    const m2 = await tally();
    check(m2.cand === true && m2.on === m2.features, `with it on, *All features* armed everything including the locked (${m2.on}/${m2.features} on)`);
    await master();
    const m2b = await tally();
    check(m2b.on === 0, `and cleared them again (${m2b.on} on) — so the per-feature press below stands alone`);
    await press();
    const s3 = await state(pick.k);
    check(s3.saved === true, `armed by a real press (player.au.features["${pick.id}"] = ${s3.saved})`);
    check(s3.display.startsWith('Armed'), `the button says so ("${s3.display.replace(/<br>/g, ' / ')}")`);
    // ---- 3. AND IT DOES NOT RUN --------------------------------------------------------------------------------
    check(s3.unlocked === false && s3.active === false, `armed but locked: unlocked ${s3.unlocked}, active ${s3.active}`);
    await page.evaluate(() => window.tmtLoader.tick(0.05, 200));
    await redraw();
    const s4 = await state(pick.k);
    check(s4.active === false && s4.actions === 0, `200 ticks armed-and-locked: active ${s4.active}, actions ${s4.actions}`);

    // ---- and it PERSISTS ------------------------------------------------------------------------------------------
    await page.evaluate(() => save());
    await open();
    const s5 = await state(pick.k);
    check(s5.stored === true && s5.saved === true && s5.active === false,
      `after a reload: armLocked ${s5.stored}, armed ${s5.saved}, running ${s5.active}`);

    // ---- 4. UNLOCK IT IN THE SAME PAGE, with no further press ----------------------------------------------------
    const unlock = await page.evaluate(([l, fid]) => {
      const T = window.tmtLoader, f = T.features.find((x) => x.id === fid);
      const how = [];
      try { if (tmp[l] && tmp[l].canReset) { doReset(l); how.push("doReset('" + l + "')"); } } catch (e) { how.push('doReset threw: ' + String(e.message).slice(0, 60)); }
      T.tick(0.05, 1);
      if (!T.featureState(fid).unlocked && player[l]) { player[l].unlocked = true; T.tick(0.05, 1); how.push('player.' + l + '.unlocked = true'); }
      let engine = T.featureState(fid).unlocked;
      if (!engine) { f.unlocked = () => true; how.push("the feature's derived unlocked() replaced with one that says yes"); }
      return { engine, how: how.join(' then '), unlocked: T.featureState(fid).unlocked, active: T.featureState(fid).active };
    }, [pick.layer, pick.id]);
    notes.push(`unlocked by: ${unlock.how}${unlock.engine ? '' : ' (the engine put its own flag back, so the predicate was constructed)'}`);
    check(unlock.unlocked === true && unlock.active === true, `the moment it unlocked it went active, with NO further press (active ${unlock.active})`);
    // ---- AND IT ACTS. `active` is a predicate; an action is the thing a flag write could not fake. If nothing is
    // affordable the layer is GIVEN currency — constructed, and the note says when that was needed.
    // ⚠ JUDGED ONLY WHERE THE UNLOCK WAS THE ENGINE'S OWN, and that is not fastidiousness. Every action the registry
    // takes goes through the engine (`buyUpgrade`, `doReset`, …) and the engine gates each of them on ITS OWN
    // `player[l].unlocked`, not on the registry's predicate — so where only the derived predicate could be
    // constructed, the engine still refuses every purchase and an action is impossible for a reason that has nothing
    // to do with arming. MEASURED on Something Tree: `active` flips, `tmp.fundamental.upgrades` stay locked, and
    // 400 ticks with 1e30 points buy nothing. Reddening there would be blaming the setting for the engine, and
    // passing there would be worse. ptr carries this half, through a real `doReset('p')`.
    const acted = await page.evaluate(async ([l, fid]) => {
      const T = window.tmtLoader;
      const n = () => T.hookStats().actions[fid] || 0;
      T.tick(0.05, 200);
      if (n() > 0) return { actions: n(), gift: null };
      const was = player[l].points;
      const C = [];
      for (const nm of ['Decimal', 'ExpantaNum', 'OmegaNum']) { try { const c = new Function('return typeof ' + nm + ' !== "undefined" ? ' + nm + ' : null')(); if (c) C.push(c); } catch (e) { /* not this one */ } }
      player[l].points = C.length ? new C[0]('1e30') : 1e30;
      T.tick(0.05, 200);
      return { actions: n(), gift: `player.${l}.points ${String(was)} -> 1e30` };
    }, [pick.layer, pick.id]);
    await redraw();
    const s6 = await state(pick.k);
    if (!unlock.engine) {
      notes.push(`\u2014 the action half ABSTAINS: only the derived predicate could be constructed, so the engine still gates every purchase on its own player.${pick.layer}.unlocked (${acted.actions} action(s) after ${acted.gift})`);
    } else {
      check(acted.actions > 0, `it ACTED on its own: ${acted.actions} action(s)${acted.gift ? ` (after ${acted.gift} — nothing was affordable at the state the unlock left)` : ' with no help at all'}`);
    }
    check(s6.display.startsWith('On'), `and the button now reads "${s6.display.replace(/<br>/g, ' / ')}"`);
    await page.evaluate(() => tmtLoader.storage.clear());
    check(stats.pageErrors.length === 0 && stats.failed.length === 0 && stats.blocked.length === 0, `${stats.pageErrors.length} page errors, ${stats.failed.length} failed, ${stats.blocked.length} blocked`);
  } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
  finally { await context.close(); }
  row({ gate: 'A1-2 arming a locked feature (page)', id, ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: notes.join('; ') });
}

// ---- Part 2 (V1): the `Advanced` SUBTAB -----------------------------------------------------------------------------
// ⚖ user, 2026-09-19 (plan §15d.3): the `au` tab takes two engine-native subtabs, `Simple` (today's grid, unchanged)
// and `Advanced` (one block per feature, read-only). It lives beside `part2Page` rather than in `gates-v1.mjs`
// because it opens the SAME tab those legs open, and a second battery answering the same question in its own page is
// how two answers start disagreeing.
//
// The four things that can go wrong and would not show anywhere else:
//   1. the default selection moves off `Simple` — every existing leg of this file reads that tab, and an engine
//      picks `Object.keys(tabFormat)[0]`, so the ORDER of two object keys is load-bearing;
//   2. the Advanced view disagrees with `tmtLoader.explain()` — the whole point of the headless API is that the page
//      renders it, so this is a COMPARISON, not a second opinion;
//   3. a table string reaches `v-html` unescaped. `provenance`, an `off` reason and a gate predicate are
//      author-written text and `display-text` is `v-html` on both engines;
//   4. it does not read at phone width. The brief's shape is "one block per feature, not a wide table" precisely
//      because a table scrolls sideways at 390 px.
async function part2Advanced(id) {
  const { context, stats } = await openContext(browser);
  const notes = [];
  let ok = true;
  const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
  // ⚖ U16 (this file's OWN rework, agreed with the automation arc 2026-09-23): the player view gets its own ROW,
  // not extra checks on the row above, because the two read DIFFERENT VIEWS of the same tab and a reader has to be
  // able to see which one went red. It starts RED: a throw anywhere before the pass leaves `NOT RUN` in the summary
  // rather than a row that quietly never happened.
  const notes2 = ['✗ NOT RUN — the leg threw before the player-view pass'];
  let ok2 = false;
  const check2 = (c, w) => { if (!c) ok2 = false; notes2.push(`${c ? '✓' : '✗'} ${w}`); };
  try {
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });   // the phone width the brief names
    await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1&profile=all`, base).href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
    await page.evaluate(() => tmtLoader.pause());
    await page.evaluate(() => tmtLoader.storage.clear());
    await page.evaluate(() => { showTab('au'); });
    const redraw = () => page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
    await redraw();
    await page.waitForTimeout(300);

    const shape = await page.evaluate(() => ({ subs: Object.keys(tmp.au.tabFormat), sel: player.subtabs.au.mainTabs, features: tmtLoader.features.length }));
    // ⚠ THREE SINCE V3 (`Progress`), and the ORDER is the load-bearing half: both engines select
    // `Object.keys(tabFormat)[0]` in `getStartPlayer` and repair an old save to it in `fixSave`, so `Simple` being
    // FIRST is what every other leg of this file depends on. A fourth (P2's round log) joins the same way.
    check(JSON.stringify(shape.subs) === '["Simple","Advanced","Progress"]', `the au tab has exactly the subtabs ${JSON.stringify(shape.subs)}`);
    check(shape.sel === 'Simple', `a fresh boot selects ${shape.sel} — the tab every other leg of this file reads`);
    const simple = await page.evaluate(() => ({ text: document.querySelector('#app').innerText, adv: (document.querySelector('#app').innerText || '').indexOf('What each feature decided') >= 0 }));
    check(simple.text.includes('Automation Tools') && !simple.adv, 'Simple still renders the title, and none of the Advanced view');

    // run the game a little so there is something to say, then select Advanced the way the engine's button does
    await page.evaluate(() => tmtLoader.tick(1, 300));
    await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
    await redraw();
    await page.waitForTimeout(300);

    // ---- THE PLAYER VIEW, which is the DEFAULT one -------------------------------------------------------------
    // ⚠ EVERYTHING BELOW THIS PASS READS A VIEW A PLAYER NEVER SEES. U16 moved the ids, the rule codes, the
    // table / derived / alternative comparisons and the measurement notes behind a switch that starts OFF, and the
    // three legs that compare render ≡ headless turn it ON because those are exactly the things they compare. That
    // left the default view asserted by nothing — the gap tmt-automation-planning-2 named when the switch landed.
    // The pass runs FIRST, on the same boot, before the switch is ever touched: a leg that flipped it back would be
    // reading a view that had been in the other state, and the collapse / floor state is per-instance.
    //
    // What it holds, all of it derived from `explain()` rather than typed here:
    //   ① the switch really is off on a fresh boot — otherwise every check below passes on the dev view;
    //   ② one block per runnable feature, each with the on/off button that carries its state word (in the player
    //      view the block no longer names its own id, so the button's `data-fid` is the only hook there is);
    //   ③ a REASON per block, non-empty and not a bare echo of the state word — a block drawn with an empty
    //      `now:` line is the failure a count-only leg sails straight past;
    //   ④ no rule code and no feature id anywhere in the rendered TEXT. Both are read off the rows, and only the
    //      CODE-SHAPED ones are asserted absent: a policy whose `inForce` is an ordinary word ("always") is SUPPOSED
    //      to appear, because the player view spells the strategy out in words.
    //   ⑤ the stall watch's buttons say what a press does, in words.
    const plain = await page.evaluate(() => {
      const T = window.tmtLoader, rows = T.explain();
      const root = document.querySelector('#app');
      const text = root.innerText || '';
      const runnable = rows.filter((r) => r.state !== 'locked' && r.state !== 'excluded');
      const codeShaped = (v) => typeof v === 'string' && /[>=<|/:]/.test(v);
      const problems = [];
      let withButton = 0, withReason = 0;
      for (const r of runnable) {
        const btn = root.querySelector(`button.tmtl-onoff[data-fid="${(window.CSS && CSS.escape) ? CSS.escape(r.id) : r.id}"]`);
        if (!btn) { problems.push(`${r.id}: no on/off button`); continue; }
        if (!(btn.innerText || '').trim()) { problems.push(`${r.id}: the on/off button has no word`); continue; }
        withButton++;
        const block = btn.parentElement && btn.parentElement.querySelector('div.tmtl-block');
        if (!block) { problems.push(`${r.id}: no block beside the button`); continue; }
        const bt = block.innerText || '';
        const line = bt.split('\n').find((L) => L.trim().toLowerCase().startsWith('now:'));
        if (line === undefined) { problems.push(`${r.id}: no \`now:\` line`); continue; }
        const reason = line.trim().slice(4).trim();
        if (!reason) { problems.push(`${r.id}: the \`now:\` line is EMPTY`); continue; }
        if (reason.toLowerCase() === r.state) { problems.push(`${r.id}: the reason only echoes the state word (${reason})`); continue; }
        if (!r.last && reason !== 'nothing decided yet') { problems.push(`${r.id}: no decision, yet the line reads "${reason}"`); continue; }
        withReason++;
      }
      const leakedIds = rows.filter((r) => codeShaped(r.id) && text.indexOf(r.id) >= 0).map((r) => r.id);
      const leakedCodes = rows.filter((r) => r.policy && codeShaped(r.policy.inForce) && text.indexOf(r.policy.inForce) >= 0).map((r) => `${r.id}=${r.policy.inForce}`);
      const watch = [...root.querySelectorAll('button.tmtl-watch-toggle')].map((b) => (b.innerText || '').trim());
      return { dev: T.devDetails(), runnable: runnable.length, withButton, withReason, problems: problems.slice(0, 6),
        devDivs: root.querySelectorAll('.tmtl-dev').length, devToggle: (root.querySelector('button.tmtl-dev-toggle') || {}).innerText,
        // ⚠ OVER THE RUNNABLE ROWS, NOT ALL OF THEM — the control caught this: a collapsed row (locked or
        // excluded) draws ONE LINE and no provenance at all, so `rows.filter(has a note)` compared 11 notes against
        // the 4 lines the 6 drawn blocks carry, and the leg went red on a view rendering exactly right.
        plainProv: root.querySelectorAll('.tmtl-prov-plain').length, provWithNotes: runnable.filter((r) => r.provenance).length,
        leakedIds: leakedIds.slice(0, 4), leakedCodes: leakedCodes.slice(0, 4), watch,
        codeShapedIds: rows.filter((r) => codeShaped(r.id)).length, codeShapedPolicies: rows.filter((r) => r.policy && codeShaped(r.policy.inForce)).length };
    });
    check2(plain.dev === false, `a fresh boot draws the PLAYER view (devDetails ${plain.dev}), and the switch offers "${plain.devToggle}"`);
    check2(plain.devDivs === 0, `no developer-detail line is drawn (${plain.devDivs} \`.tmtl-dev\`)`);
    check2(plain.withButton === plain.runnable && plain.problems.length === 0,
      `one block per runnable feature, each with its on/off word (${plain.withButton} of ${plain.runnable})${plain.problems.length ? ': ' + plain.problems.join(' · ') : ''}`);
    check2(plain.withReason === plain.runnable, `and each block says in words what it decided (${plain.withReason} of ${plain.runnable} non-empty reasons)`);
    check2(plain.leakedIds.length === 0, `no feature id in the rendered text (${plain.codeShapedIds} code-shaped ids checked)${plain.leakedIds.length ? ': ' + plain.leakedIds.join(', ') : ''}`);
    check2(plain.leakedCodes.length === 0, `no rule code in the rendered text (${plain.codeShapedPolicies} code-shaped policies checked)${plain.leakedCodes.length ? ': ' + plain.leakedCodes.join(', ') : ''}`);
    check2(plain.codeShapedIds > 0 && plain.codeShapedPolicies > 0, `and the two absences are not vacuous — there ARE ${plain.codeShapedIds} ids and ${plain.codeShapedPolicies} policies that would show`);
    // ⚠ EQUALITY ONLY, AND THE VACUITY IS THE ROSTER'S QUESTION, NOT THIS GAME'S. The control measured `something`
    // with 0 notes on its 5 drawn rows — a legitimate zero (its table has none there), which a `> 0` clause turned
    // red on a correct view. A per-game non-vacuity check cannot be right for a game that has nothing to exercise
    // it; what has to be true is that SOME game in the run did. That is the row after the loop.
    provSeen.push([id, plain.provWithNotes]);
    check2(plain.plainProv === plain.provWithNotes, `every table note a drawn block carries is replaced by the one fact a player can use (${plain.plainProv} plain lines, ${plain.provWithNotes} of the ${plain.runnable} drawn rows carry a note${plain.provWithNotes ? '' : ' — this game does not exercise it'})`);
    check2(plain.watch.length === 1 && /turn the stall watch (on|off)/.test(plain.watch[0]), `the stall watch's button says what a press does: ${JSON.stringify(plain.watch)}`);
    await page.screenshot({ path: path.join(REPO, `tools/harness/results/${id}-au-advanced-player-390.png`), fullPage: true });
    ok2 = notes2.length > 1 && notes2.slice(1).every((n) => n.startsWith('✓'));
    notes2.shift();   // the NOT RUN placeholder: the pass ran

    // ⚖ U16: ids, rule codes and the table's notes are DEVELOPER DETAILS, drawn only while the switch is on — and
    // render ≡ headless below is a comparison of exactly those, so the rest of this leg reads the view with them shown
    await page.evaluate(() => tmtLoader.setDevDetails(true));
    await redraw();
    await page.waitForTimeout(300);

    const adv = await page.evaluate(() => {
      const T = window.tmtLoader, rows = T.explain();
      // ⛔ `.tmtl-block`, NOT `div[style*="border-left"]` — V3's stall-watch panel has a left border too, and the
      // substring match counted it as a feature block (7 against 6 rows, red on a view rendering perfectly).
      const blocks = [...document.querySelectorAll('#app div.tmtl-block')];
      const collapsed = rows.filter((x) => x.state === 'locked' || x.state === 'excluded');
      const text = document.querySelector('#app').innerText || '';
      // render ≡ headless, per feature: the block that NAMES this id must carry its reason text and its policy
      const mismatches = [];
      for (const r of rows) {
        if (r.state === 'locked' || r.state === 'excluded') {
          if (text.indexOf(r.id) < 0) mismatches.push(`${r.id}: no collapsed line`);
          continue;
        }
        const b = blocks.find((el) => (el.innerText || '').indexOf(r.id) >= 0);
        if (!b) { mismatches.push(`${r.id}: no block`); continue; }
        const t = b.innerText || '';
        if (r.last && t.indexOf(r.last.text) < 0) mismatches.push(`${r.id}: reason "${r.last.text}" not in the block`);
        if (t.indexOf(r.policy.inForce) < 0) mismatches.push(`${r.id}: policy ${r.policy.inForce} not in the block`);
        if (r.provenance && t.indexOf(r.provenance.slice(0, 40)) < 0) mismatches.push(`${r.id}: provenance missing`);
      }
      return { rows: rows.length, blocks: blocks.length, collapsed: collapsed.length, mismatches: mismatches.slice(0, 6),
        unknown: rows.filter((x) => x.last && x.last.code === 'unknown').map((x) => x.id),
        scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rendered: text.indexOf('What each feature decided') >= 0, title: text.indexOf('Automation Tools') };
    });
    check(adv.rendered, 'Advanced renders');
    check(adv.rows === shape.features + (Object.keys(await page.evaluate(() => window.tmtLoader.autoExcluded || {})).length), `explain() has one row per registered feature plus each excluded one (${adv.rows} rows, ${shape.features} features)`);
    check(adv.blocks === adv.rows - adv.collapsed, `one block per feature that can run (${adv.blocks} blocks, ${adv.collapsed} collapsed, ${adv.rows} rows)`);
    check(adv.mismatches.length === 0, `render ≡ headless for every row${adv.mismatches.length ? ': ' + adv.mismatches.join(' · ') : ''}`);
    check(adv.unknown.length === 0, `no feature's last decision is \`unknown\`${adv.unknown.length ? ': ' + adv.unknown.join(', ') : ''}`);
    check(adv.scrollX <= 0, `no horizontal scroll at 390 px (scrollWidth − clientWidth = ${adv.scrollX})`);
    await page.screenshot({ path: path.join(REPO, `tools/harness/results/${id}-au-advanced-390.png`), fullPage: true });

    // ⛔ AN INJECTED `<img onerror>` IN A TABLE STRING RENDERS INERT. `display-text` is `v-html`, and `provenance`
    // is author-written text. Constructed, because no table on the roster carries markup — and a leg that asserts
    // an absence proves nothing until the absence has been made present once, so the same string is also checked
    // to be PRESENT as text.
    const xss = await page.evaluate(() => {
      const T = window.tmtLoader, id = T.features[0].id;
      T.autoProvenance[id] = '<img src=x onerror="window.__tmtPwned = 1">';
      updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats();
      return new Promise((res) => setTimeout(() => {
        const text = document.querySelector('#app').innerText || '';
        res({ pwned: window.__tmtPwned === 1, imgs: document.querySelectorAll('#app div.tmtl-block img').length, asText: text.indexOf('onerror=') >= 0, id });
      }, 250));
    });
    check(xss.pwned === false && xss.imgs === 0, `an injected <img onerror> in ${xss.id}'s provenance did not execute and created no element (pwned ${xss.pwned}, imgs ${xss.imgs})`);
    check(xss.asText === true, 'and the same string IS on screen, as text — so the check is not passing on an empty render');

    // back to Simple, and the grid is where it was
    await page.evaluate(() => { delete window.tmtLoader.autoProvenance[window.tmtLoader.features[0].id]; player.subtabs[tmtLoader.auLayer].mainTabs = 'Simple'; });
    await redraw();
    await page.waitForTimeout(250);
    const back = await page.evaluate(() => ({ buttons: [...document.querySelectorAll('#app button.upg')].length, text: (document.querySelector('#app').innerText || '').indexOf('What each feature decided') }));
    check(back.buttons === shape.features + 1, `back on Simple: ${back.buttons} clickable buttons (${shape.features} features + the master toggle)`);
    check(back.text < 0, 'and none of the Advanced view is left on screen');
    check(stats.pageErrors.length === 0 && stats.failed.length === 0 && stats.blocked.length === 0, `${stats.pageErrors.length} page errors, ${stats.failed.length} failed, ${stats.blocked.length} blocked`);
  } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
  finally { await context.close(); }
  row({ gate: 'A1-2 the Advanced subtab (page, 390 px)', id, ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: notes.join('; ') + `; screenshot results/${id}-au-advanced-390.png` });
  row({ gate: 'A1-2 the Advanced subtab — PLAYER view (developer details off, 390 px)', id, ok: ok2, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: notes2.join('; ') + `; screenshot results/${id}-au-advanced-player-390.png` });
}

// ---- Part 3 --------------------------------------------------------------------------------------------------------
function runAsync(id, o) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-a1-3-'));
  const out = path.join(tmp, 'r.json');
  const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out];
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null) args.push(`--${k}`, String(v));
  return new Promise((resolve) => {
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => { try { resolve(JSON.parse(fs.readFileSync(out, 'utf8'))); } catch (e) { resolve({ ok: false, error: `no result: ${err.slice(-400)}` }); } });
  });
}
function marksFile(id) {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-marks-')), 'marks.json');
  fs.writeFileSync(f, JSON.stringify(MARKS[id]));
  return f;
}
function fmtMark(m) { return m ? `${m.ticks} ticks / ${m.gameSeconds} s / ${m.hash}` : 'NOT MET'; }
async function part3() {
  const want = (id) => ids.includes(id);
  const jobs = {};
  if (want('ptr')) {
    const mf = marksFile('ptr');
    jobs.ptr1 = runAsync('ptr', { profile: 'all', diff: 1, ticks: 14000, marks: mf });
    jobs.ptr2 = runAsync('ptr', { profile: 'all', diff: 1, ticks: 14000, marks: mf });
    jobs.ptrBG = runAsync('ptr', { profile: 'all', diff: 1, ticks: 14000, marks: mf, 'auto-opt': 'unlockOrder=b,g' });
    jobs.ptrFine = runAsync('ptr', { profile: 'all', diff: 0.05, ticks: 40000, marks: mf, 'wall-ms': 480000 });
    jobs.ptrAlways = runAsync('ptr', { profile: 'all', diff: 1, ticks: 14000, marks: mf, stall: 3600, 'wall-ms': 120000, 'auto-opt': 'policy:reset:p=always' });
    jobs.ptrStall = runAsync('ptr', { profile: 'all', diff: 1, ticks: 200000, stall: 3600, 'wall-ms': 120000 });
  }
  if (want('something')) {
    const mf = marksFile('something');
    jobs.st1 = runAsync('something', { profile: 'all', diff: 0.05, ticks: 14000, marks: mf });
    jobs.st2 = runAsync('something', { profile: 'all', diff: 0.05, ticks: 14000, marks: mf });
    jobs.stD1 = runAsync('something', { profile: 'all', diff: 1, ticks: 3000, marks: mf });
    jobs.stGain = runAsync('something', { profile: 'all', diff: 1, ticks: 14000, marks: mf, stall: 3600, 'wall-ms': 120000, 'auto-opt': 'policy:reset:fundamental=gain>=1' });
    jobs.stStall = runAsync('something', { profile: 'all', diff: 1, ticks: 200000, stall: 3600, 'wall-ms': 120000 });
  }
  const R = Object.fromEntries(await Promise.all(Object.entries(jobs).map(async ([k, p]) => [k, await p])));
  const names = (id) => MARKS[id].map((m) => m[0]);
  const markRows = (id, a, b, diff, tag) => {
    for (const n of names(id)) {
      const x = a.marks?.[n], y = b ? b.marks?.[n] : undefined;
      const equal = b ? JSON.stringify(x) === JSON.stringify(y) : null;
      row({ gate: `A1-3 ${tag} ${n}`, id, leg: 'profile all', ok: a.ok && (b ? b.ok && equal : true), ticks: x?.ticks ?? a.ticks, gameSeconds: x?.gameSeconds ?? a.gameSeconds, diff, hash: x?.hash ?? null,
        notes: `${x ? 'MET' : `NOT MET (run stopped at ${a.ticks} ticks)`}${b ? `; second run ${fmtMark(y)} — equal ${equal}` : ''}${a.error ? '; ' + a.error : ''}` });
    }
  };
  if (want('ptr')) {
    markRows('ptr', R.ptr1, R.ptr2, 1, "rung (the table's defaults: reset:p, unlockOrder g,b — reset:p is gain>=2x since R1′, interval>=10 before it; these rows compare run 1 with run 2, they are not pinned to a second count)");
    for (const n of names('ptr')) {
      const g = R.ptr1.marks?.[n], b = R.ptrBG.marks?.[n];
      row({ gate: `A1-3 pair order b,g (alternative) ${n}`, id: 'ptr', leg: 'profile all', ok: R.ptrBG.ok, ticks: b?.ticks, gameSeconds: b?.gameSeconds, diff: 1, hash: b?.hash, notes: `b first ${fmtMark(b)} vs g first ${fmtMark(g)}: g first ahead by ${b && g ? b.gameSeconds - g.gameSeconds : '—'} game-s` });
    }
    markRows('ptr', R.ptrFine, null, 0.05, 'fine diff (8 min wall bound)');
    const al = R.ptrAlways;
    row({ gate: 'A1-3 reset:p always (brief default) — control', id: 'ptr', leg: 'profile all', ok: al.ok, ticks: al.ticks, gameSeconds: al.gameSeconds, diff: 1, hash: al.hash, notes: `marks: ${names('ptr').map((n) => fmtMark(al.marks?.[n])).join(' · ')}; stalled ${al.stall?.stalled} (last progress tick ${al.stall?.lastProgress?.ticks}); points ${al.summary?.points}` });
  }
  if (want('something')) {
    markRows('something', R.st1, R.st2, 0.05, 'rung (defaults: reset:fundamental interval>=5)');
    markRows('something', R.stD1, null, 1, 'coarse diff');
    const g = R.stGain;
    row({ gate: 'A1-3 reset:fundamental gain>=1 (brief default) — control', id: 'something', leg: 'profile all', ok: g.ok, ticks: g.ticks, gameSeconds: g.gameSeconds, diff: 1, hash: g.hash, notes: `marks: ${names('something').map((n) => fmtMark(g.marks?.[n])).join(' · ')}; stalled ${g.stall?.stalled} (last progress tick ${g.stall?.lastProgress?.ticks}); actions ${JSON.stringify(g.hook?.actions)}` });
  }
  for (const [id, k] of [['ptr', 'ptrStall'], ['something', 'stStall']]) {
    if (!want(id)) continue;
    const r = R[k];
    const d = r.detail || {};
    const brief = Object.entries(d).map(([l, o]) => `${l}{${o.unlocked ? '' : 'LOCKED '}pts ${o.points}${o.best ? ' best ' + o.best : ''}; upg [${o.upgrades}]; ms [${o.milestones}]${Object.keys(o.buyables || {}).length ? '; buy ' + JSON.stringify(o.buyables) : ''}; canReset ${o.canReset}${o.nextAt ? ' nextAt ' + o.nextAt : ''}${o.nextUpgrades?.length ? '; next upg ' + o.nextUpgrades.join(' ') : ''}${o.nextMilestones?.length ? '; next ms ' + o.nextMilestones.join(' | ') : ''}}`).join(' ');
    row({ gate: 'A1-3 next stall (diff 1, 3600 game-s window, 2 min wall)', id, leg: 'profile all', ok: r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
      notes: `stalled ${r.stall?.stalled}, wall-bounded ${r.stall?.walled}; last progress tick ${r.stall?.lastProgress?.ticks} (${r.stall?.lastProgress?.gameSeconds} s); actions ${JSON.stringify(r.hook?.actions)}; state: ${brief}` });
    writeJSON(path.join(REPO, `tools/harness/results/tmp/a1-3-${id}-stall.json`), r);
  }
  // parity under profile all at the (i) predicate's tick count
  const pars = [];
  if (want('ptr') && R.ptr1.marks?.[names('ptr')[0]]) pars.push(['ptr', R.ptr1.marks[names('ptr')[0]].ticks, 1]);
  if (want('something') && R.st1.marks?.[names('something')[0]]) pars.push(['something', R.st1.marks[names('something')[0]].ticks, 0.05], ['something', R.st1.marks[names('something')[1]]?.ticks, 0.05]);
  for (const [id, ticks, diff] of pars) {
    if (!ticks) continue;
    const p = await parity(id, { ticks, diff, leg: 'idle', base, browser, profile: 'all' });
    const same = JSON.stringify(p.node?.hook) === JSON.stringify(p.page?.hook);
    row({ gate: 'A1-3 parity node≡page, profile all, at a predicate tick', id, leg: 'profile all', ok: p.ok && same, ticks: p.ticks, gameSeconds: p.gameSeconds, diff, hash: p.node?.hash,
      notes: p.ok ? `page ${p.page.hash} in ${p.page.ms} ms; hookStats equal ${same}; actions ${JSON.stringify(p.node?.hook?.actions)}` : `DIVERGED ${JSON.stringify(p.divergence || p.error).slice(0, 300)}` });
  }
}

const SUMMARY = path.join(REPO, 'tools/harness/results/SUMMARY.md');
const cell = (v) => (v === null || v === undefined ? '—' : String(v).replace(/\|/g, '\\|'));
let md = `\n## ${date} — A1 part ${PART} (\`node tools/harness/gates-a1.mjs --part ${PART}\`) — commit \`${commit}\`${dirty ? ' (tree DIRTY)' : ''} — ${rows.filter((r) => r.ok).length}/${rows.length} green\n\n| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${cell(r.gate)} | ${r.id} | ${cell(r.leg)} | ${cell(r.ticks)} | ${cell(r.gameSeconds)} | ${cell(r.diff)} | ${r.hash ? '`' + r.hash + '`' : '—'} | ${r.ok ? 'GREEN' : '**RED**'} | ${cell(r.notes)} |\n`;
if (!a['no-summary']) fs.appendFileSync(SUMMARY, md);
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-a1-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-a1 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
// `--assert` (V1, for CI): green rows are only half a verdict. A battery that booted one game and threw inside the
// second printed `1/12 green` and exited 0 — fewer games is fewer rows is fewer reds. `gateCoverage` refuses a run
// whose rows do not cover the roster it was GIVEN, and one where the games did not all run the same battery.
if (a.assert) {
  const label = `a1-part${PART}`;
  const c = gateCoverage(rows, ids, { label });
  console.log(coverageLine(c, label));
  if (!c.ok) { console.log(`${label} REFUSED:`); for (const p of c.problems) console.log(`  · ${p}`); process.exit(1); }
}
process.exit(rows.every((r) => r.ok) ? 0 : 1);
