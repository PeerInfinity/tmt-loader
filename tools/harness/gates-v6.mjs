// The V6 gates — every feature's ON/OFF in the ADVANCED view, synchronised with the Simple grid (⚖ Q5, user
// 2026-09-20: "toggle each of the automation tools on and off, and for this to be synchronized with the simple
// automation tab"; clarified 2026-09-22: "the same set of toggles as the simple grid"). Brief `tmt-auto-20`, plan §51.
//   node tools/harness/gates-v6.mjs --part 1|2|3|4|5|6|page|7|shots [--no-summary] [--no-write] [--assert] [--shard i/N] [<id>...]
//
// ⛔ THERE IS ONE STORE, AND EVERY LEG IS ABOUT IT. Both views press `toggleSaved` and read `player.au.features`
// through the grid's own predicates (`isOnSaved` / `active()` / `armable`), so "synchronised" is true by
// construction; these legs PROVE it rather than assume it, each against the view the press did NOT come from.
// Every page opens `&managed=1&profile=saved` — the page is paused before its first tick (plan §49e: any leg that
// counts actions after a pause must start MANAGED), and `saved` because a managed page's default profile is `off`.
//
// Part 1   SYNCHRONISED, BOTH WAYS, NO RELOAD (ptr AND something). (a) a press ON in Advanced → the grid's RENDERED
//          button reads On and `player.au.features[id] === true`; (b) a real click OFF on the grid → the Advanced
//          toggle reads Off; (c) the master press in either view is what the other shows. Each also with the OTHER
//          view left MOUNTED: the grid's own `onClick` run while Advanced is on screen must move the Advanced toggle
//          (a component that kept its own copy would be re-seeded by a view switch and pass the switch half).
// Part 2   IT CHANGES WHAT THE FEATURE DOES (ptr AND something). Managed, nothing on → N ticks → 0 actions by
//          ANY feature; the feature pressed ON in Advanced → N ticks → its own count > 0.
// Part 3   RELOAD PERSISTENCE through the Advanced control (the grid's A1-2 leg, for the new control).
// Part 4   ARMING. Setting off: a locked feature's Advanced toggle refuses and SAYS WHY; setting on (the Simple tab's
//          own toggle, a real click): the press ARMS — `Armed` in BOTH views.
// Part 5   OVERRIDE DISPLAY. `?profile=all`: every Advanced toggle's word is the grid's, every block says the
//          PROFILE decides, and `player.au.features` stays `{}` in the save. A RUNTIME override (`setFeatureEnabled`):
//          the block says so, a press writes the SAVE and leaves the override in force (the grid's behaviour).
// Part 6   `tmtLoader.resetAutomation()` → every Advanced toggle reads Off / Locked with no reload.
// Part 7   THE ROSTER (one recorded run, not CI — V1 part 6's shape). Advanced on every game at 390 px: one toggle per
//          registered feature, 0 interactive elements past the viewport; abstentions COUNTED and left uncaused.
// shots    Screenshots for the user (ptr and something, 1280 and 390): a block On, one Armed, one Overridden.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, GAMES, parseArgs, startServer, headCommit, treeDirty, writeJSON, entryOnly, assignShards, parseShard } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { pageLoadFrom } from './page.mjs';
entryOnly(import.meta.url);

// ⛔ EVERY FLAG THIS BATTERY READS IS DECLARED HERE (R3b-1). Booleans in the list; everything else takes a value.
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const PART = String(a.part || 'page');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ${String(r.notes || '').slice(0, 1400)}`); };
// ⛔ THE ROWS EACH PART MUST PRINT, for `--assert` (CI): a battery that dies part-way prints fewer rows, and fewer
// rows is fewer reds. ⚠ ADDING A LEG MOVES THIS, deliberately.
const ROWS = { 1: 6, 2: 2, 3: 2, 4: 2, 5: 4, 6: 2, page: 18, 7: 1, shots: 2 };
const GAMES6 = ['ptr', 'something'];
// Part 2's starting states: a mid-game fixture where the lowest reset is affordable at once (F1's fresh chain for
// ptr, R3c's for Something Tree) — a fresh save's first reset can be minutes of play away.
const SNAP = { ptr: 'tools/harness/snapshots/ptr/all/M12.json', something: 'tools/harness/snapshots/something/all/S02.json' };

// ---- the page ---------------------------------------------------------------------------------------------------------
async function openPage(browser, base, id, { q = '', width = 1280, mobile = false, context = null } = {}) {
  const ctx = context || await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  const url = new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1&managed=1${/profile=/.test(q) ? '' : '&profile=saved'}${mobile ? '&mobile=1' : ''}${q}`, base).href;
  const go = async () => {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
  };
  await go();
  return { context: ctx, page, errs, reload: go };
}
async function redraw(page) {
  await page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
  await page.waitForTimeout(120);
}
async function view(page, which) {
  await page.evaluate((w) => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = w; }, which);
  await redraw(page);
}
// what the ADVANCED toggle renders — its text, from the DOM, not the API behind it
const advWord = (page, fid) => page.evaluate((f) => { const b = document.querySelector(`#app button.tmtl-onoff[data-fid="${CSS.escape(f)}"]`); return b ? b.textContent.trim() : null; }, fid);
const advWords = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#app button.tmtl-onoff')].map((b) => [b.dataset.fid, b.textContent.trim()])));
// what the SIMPLE grid's button renders for a feature — the engine's own `clickable`, found by its title in the DOM
// (⚠ the text is the engine's rendering of `display()`, so `<br>` arrives as a newline)
const gridText = (page, fid) => page.evaluate((f) => {
  const AU = tmtLoader.auLayer, C = layers[AU].clickables;
  const k = Object.keys(C).find((x) => C[x].tmtFeature === f);
  if (!k) return { err: 'no clickable' };
  const hits = [...document.querySelectorAll('#app button.upg')].filter((b) => { const h = b.querySelector('h2'); return h && h.textContent.trim() === C[k].title; });
  if (hits.length !== 1) return { err: `${hits.length} grid buttons titled "${C[k].title}"` };
  const t = hits[0].innerText.replace(C[k].title, '').trim();
  return { text: t, word: t.split(/\s|\n/)[0] };
}, fid);
const gridMaster = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('#app button.upg')].find((x) => { const h = x.querySelector('h2'); return h && h.textContent.trim() === 'All features'; }); return b ? b.innerText.replace('All features', '').trim() : null; });
const saved = (page) => page.evaluate(() => JSON.stringify(player[tmtLoader.auLayer].features));
const clickAdv = async (page, fid) => { await page.locator(`#app button.tmtl-onoff[data-fid="${fid}"]`).first().click({ timeout: 5000 }); await page.waitForTimeout(80); };
const clickGrid = async (page, fid) => {
  const title = await page.evaluate((f) => { const C = layers[tmtLoader.auLayer].clickables; return C[Object.keys(C).find((x) => C[x].tmtFeature === f)].title; }, fid);
  await page.locator('#app button.upg').filter({ has: page.locator('h2', { hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) }).first().click({ timeout: 5000 });
  await redraw(page);
};
const unlockedIds = (page) => page.evaluate(() => tmtLoader.features.map((f) => tmtLoader.featureState(f.id)).filter((s) => s.unlocked).map((s) => s.id));
function checker() {
  const notes = [];
  let ok = true;
  return { notes, get ok() { return ok; }, check: (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); } };
}

// ---- Part 1: SYNCHRONISED, BOTH WAYS -----------------------------------------------------------------------------------
async function part1(browser, base) {
  for (const id of GAMES6) {
    const { context, page, errs } = await openPage(browser, base, id);
    try {
      await page.evaluate(() => tmtLoader.storage.clear());
      const ids = await unlockedIds(page);
      const fid = ids[0];
      // (a) ADVANCED → SIMPLE
      let C = checker();
      if (!fid) { row({ gate: 'V6-1a a press in ADVANCED is what the grid shows', id, ok: false, notes: 'no unlocked feature at a fresh save' }); }
      else {
        await view(page, 'Advanced');
        C.check(await advWord(page, fid) === 'Off' && await saved(page) === '{}', `fresh: the Advanced toggle for ${fid} reads "${await advWord(page, fid)}", features ${await saved(page)}`);
        await clickAdv(page, fid);
        C.check(await advWord(page, fid) === 'On', `a real click on the Advanced toggle → it reads "${await advWord(page, fid)}" in place (no redraw)`);
        C.check(await page.evaluate((f) => player[tmtLoader.auLayer].features[f] === true && player[tmtLoader.auLayer].disclosed === true, fid), `player.au.features["${fid}"] === true, disclosed true (${await saved(page)})`);
        await view(page, 'Simple');
        const g = await gridText(page, fid);
        C.check(g.word === 'On', `the Simple grid's rendered button reads "${(g.text || g.err || '').replace(/\n/g, ' / ')}"`);
        row({ gate: 'V6-1a a press ON in ADVANCED is what the Simple grid shows — no reload', id, leg: `feature ${fid}`, ok: C.ok, notes: C.notes.join('; ') });
        // (b) SIMPLE → ADVANCED, by a real click on the grid; then the grid's own onClick with ADVANCED MOUNTED
        C = checker();
        await clickGrid(page, fid);
        C.check(await page.evaluate((f) => player[tmtLoader.auLayer].features[f] === false, fid), `a real click on the grid button → features["${fid}"] = false`);
        await view(page, 'Advanced');
        C.check(await advWord(page, fid) === 'Off', `→ the Advanced toggle reads "${await advWord(page, fid)}"`);
        // ⛔ THE HALF A LOCAL COPY CANNOT PASS: the view is NOT switched, so nothing re-creates the component — the
        // grid's own press function runs, the page redraws as a paused page does, and the toggle must follow.
        await page.evaluate((f) => { const C2 = layers[tmtLoader.auLayer].clickables; C2[Object.keys(C2).find((x) => C2[x].tmtFeature === f)].onClick(); }, fid);
        await redraw(page);
        C.check(await advWord(page, fid) === 'On', `the GRID's own onClick with Advanced still on screen → the toggle reads "${await advWord(page, fid)}"`);
        await page.evaluate((f) => { const C2 = layers[tmtLoader.auLayer].clickables; C2[Object.keys(C2).find((x) => C2[x].tmtFeature === f)].onClick(); }, fid);
        await redraw(page);
        C.check(await advWord(page, fid) === 'Off', `and again → "${await advWord(page, fid)}"`);
        row({ gate: 'V6-1b a press OFF in SIMPLE is what the Advanced toggle shows — by a view switch AND with Advanced mounted', id, leg: `feature ${fid}`, ok: C.ok, notes: C.notes.join('; ') });
        // (c) THE MASTER, both ways
        C = checker();
        const N = await page.evaluate(() => tmtLoader.features.length);
        await page.locator('#app button.tmtl-all-features').first().click({ timeout: 5000 });
        await page.waitForTimeout(80);
        const onA = await page.evaluate(() => Object.values(player[tmtLoader.auLayer].features).filter(Boolean).length);
        const wA = await advWords(page);
        C.check(onA === ids.length && ids.every((x) => wA[x] === 'On'), `Advanced "All features" → ${onA} on (the ${ids.length} unlocked), each of their toggles reads On`);
        C.check(await page.evaluate(() => document.querySelector('#app .tmtl-all-read').textContent.trim()) === `${ids.length} / ${N} on`, `its readout "${await page.evaluate(() => document.querySelector('#app .tmtl-all-read').textContent.trim())}"`);
        await view(page, 'Simple');
        const gm = await gridMaster(page);
        const gw = await Promise.all(ids.map((x) => gridText(page, x)));
        C.check(gm === `${ids.length} / ${N} on` && gw.every((x) => x.word === 'On'), `→ the grid's master reads "${gm}" and all ${ids.length} unlocked buttons read On`);
        await page.locator('#app button.upg').filter({ has: page.locator('h2', { hasText: /^All features$/ }) }).first().click({ timeout: 5000 });
        await redraw(page);
        C.check(await saved(page) !== '{}' && await page.evaluate(() => Object.values(player[tmtLoader.auLayer].features).filter(Boolean).length) === 0, 'the GRID\'s master pressed → 0 on');
        await view(page, 'Advanced');
        const wB = await advWords(page);
        C.check(Object.values(wB).every((w) => w === 'Off' || w === 'Locked') && Object.keys(wB).length === N, `→ all ${Object.keys(wB).length} Advanced toggles read Off/Locked (${[...new Set(Object.values(wB))].join(', ')})`);
        C.check(errs.length === 0, `${errs.length} page errors ${errs.slice(0, 2).join(' | ')}`);
        row({ gate: 'V6-1c the MASTER press in either view is what the other shows (the SAME onClick)', id, leg: `${ids.length} unlocked of ${N}`, ok: C.ok, notes: C.notes.join('; ') });
      }
    } catch (e) { row({ gate: 'V6-1 EXCEPTION', id, ok: false, notes: String(e && e.stack || e).slice(0, 400) }); }
    finally { await context.close(); }
  }
}

// ---- Part 2: IT CHANGES WHAT THE FEATURE DOES ------------------------------------------------------------------------
// ⛔ MANAGED START (plan §49e): the engine's own interval never runs before the harness's first tick, so the two
// counts compare like with like. ⚠ THE FEATURE IS CHOSEN BY MEASUREMENT, not by name or kind — and by THIS leg's own
// protocol. Two cuts that did not: (1) the lowest-row reset acted 0 times on BOTH games, correctly — F1's passive-yield
// rule makes `reset:p` yield at M12 and `reset:fundamental` at S02; (2) "the feature that acts most under
// `?profile=all`" named `reset:fundamental` (17 actions), which acts only because OTHER features change the state
// under it — alone it yields. So the REFERENCE runs exactly the leg (same fixture, N ticks with nothing on, then ONE
// feature on for N ticks) per unlocked candidate in registration order, and names the first that acts. It switches the
// candidate on with the RUNTIME override (`setFeatureEnabled`), which does not read the saved map, so the mutant this
// leg exists for (`active()` reading a stale saved map) cannot move the reference — only the leg.
async function reference(browser, base, id, s, N) {
  const R = await openPage(browser, base, id);
  try {
    await R.page.evaluate(() => tmtLoader.storage.clear());
    await pageLoadFrom(R.page, s.player);
    const ids = await R.page.evaluate(() => tmtLoader.features.filter((f) => tmtLoader.featureState(f.id).unlocked).map((f) => f.id));
    const tried = [];
    for (const f of ids) {
      if (tried.length) await pageLoadFrom(R.page, s.player);
      const n = await R.page.evaluate(([f, n]) => { const T = tmtLoader; T.tick(0.05, n); const a0 = T.hookStats().actions[f] || 0; T.setFeatureEnabled(f, true); T.tick(0.05, n); return (T.hookStats().actions[f] || 0) - a0; }, [f, N]);
      tried.push(`${f} ${n}`);
      if (n > 0) return { id: f, n, tried };
    }
    return { id: null, n: 0, tried };
  } finally { await R.page.evaluate(() => tmtLoader.storage.clear()).catch(() => {}); await R.context.close(); }
}
async function part2(browser, base) {
  const N = Number(a.ticks || 600);   // 200 was measured too short: Something Tree's `reset:unlock` sat at gain 2781 of the 3050 its 2× rule asks for
  for (const id of GAMES6) {
    const s = JSON.parse(fs.readFileSync(path.join(REPO, SNAP[id]), 'utf8'));
    const ref = await reference(browser, base, id, s, N);
    const { context, page, errs } = await openPage(browser, base, id);
    const C = checker();
    try {
      await page.evaluate(() => tmtLoader.storage.clear());
      await pageLoadFrom(page, s.player);
      const st0 = await page.evaluate(() => ({ profile: tmtLoader.profile(), managed: tmtLoader.managed, features: JSON.stringify(player[tmtLoader.auLayer].features), acts: tmtLoader.hookStats().actions }));
      C.check(st0.profile === 'saved' && st0.managed === true, `from ${SNAP[id].split('/').slice(-2).join('/')}: managed ${st0.managed}, profile ${st0.profile}, saved features ${st0.features}`);
      C.check(!!ref.id, `the reference (this protocol, the runtime override, per candidate): ${ref.tried.join(', ')}${ref.id ? ` → ${ref.id}` : ' — NOTHING acted alone'}`);
      const fid = ref && ref.id;
      await page.evaluate(() => { for (const f of tmtLoader.features) if (player[tmtLoader.auLayer].features[f.id]) tmtLoader.pressFeature(f.id); });
      const total = (acts) => Object.values(acts || {}).reduce((x, y) => x + y, 0);
      const before = await page.evaluate(() => tmtLoader.hookStats().actions);
      await page.evaluate((n) => tmtLoader.tick(0.05, n), N);
      const off = await page.evaluate(() => tmtLoader.hookStats().actions);
      C.check(total(off) - total(before) === 0, `every feature OFF in both views → ${N} ticks → ${total(off) - total(before)} actions by any feature`);
      await view(page, 'Advanced');
      await clickAdv(page, fid);
      C.check(await advWord(page, fid) === 'On', `${fid} pressed ON in Advanced (reads "${await advWord(page, fid)}")`);
      await page.evaluate((n) => tmtLoader.tick(0.05, n), N);
      const on = await page.evaluate(() => tmtLoader.hookStats().actions);
      const mine = (on[fid] || 0) - (off[fid] || 0);
      C.check(mine > 0, `→ ${N} more ticks → ${fid} acted ${mine} time(s)`);
      C.check(errs.length === 0, `${errs.length} page errors`);
    } catch (e) { C.check(false, 'EXCEPTION ' + String(e && e.stack || e).slice(0, 300)); }
    finally { await context.close(); }
    row({ gate: 'V6-2 the Advanced toggle changes what the feature DOES (managed start, counts compared)', id, leg: `${N} ticks off, ${N} on, diff 0.05`, ok: C.ok, notes: C.notes.join('; ') });
  }
}

// ---- Part 3: RELOAD PERSISTENCE ------------------------------------------------------------------------------------------
async function part3(browser, base) {
  for (const id of GAMES6) {
    const { context, page, errs, reload } = await openPage(browser, base, id);
    const C = checker();
    try {
      await page.evaluate(() => tmtLoader.storage.clear());
      await reload();
      const fid = (await unlockedIds(page))[0];
      await view(page, 'Advanced');
      await clickAdv(page, fid);
      await page.evaluate(() => save());
      await reload();
      C.check(await page.evaluate((f) => player[tmtLoader.auLayer].features[f] === true, fid), `after save + reload: features["${fid}"] = ${await page.evaluate((f) => player[tmtLoader.auLayer].features[f], fid)}`);
      await view(page, 'Advanced');
      C.check(await advWord(page, fid) === 'On', `the Advanced toggle reads "${await advWord(page, fid)}"`);
      await view(page, 'Simple');
      const g = await gridText(page, fid);
      C.check(g.word === 'On', `the grid reads "${(g.text || g.err || '').replace(/\n/g, ' / ')}"`);
      await page.evaluate(() => tmtLoader.storage.clear());
      C.check(errs.length === 0, `${errs.length} page errors`);
    } catch (e) { C.check(false, 'EXCEPTION ' + String(e && e.stack || e).slice(0, 300)); }
    finally { await context.close(); }
    row({ gate: 'V6-3 a press in ADVANCED persists across a reload (the grid\'s A1-2 leg, through the new control)', id, ok: C.ok, notes: C.notes.join('; ') });
  }
}

// ---- Part 4: ARMING --------------------------------------------------------------------------------------------------------
async function part4(browser, base) {
  for (const id of GAMES6) {
    const { context, page, errs } = await openPage(browser, base, id);
    const C = checker();
    try {
      await page.evaluate(() => tmtLoader.storage.clear());
      const fid = await page.evaluate(() => { const s = tmtLoader.features.map((f) => tmtLoader.featureState(f.id)).find((x) => !x.unlocked); return s ? s.id : null; });
      if (!fid) { row({ gate: 'V6-4 arming', id, ok: false, notes: 'no locked feature at a fresh save' }); continue; }
      await view(page, 'Advanced');
      C.check(await advWord(page, fid) === 'Locked', `setting OFF: ${fid}'s Advanced toggle reads "${await advWord(page, fid)}"`);
      await clickAdv(page, fid);
      const why = await page.evaluate((f) => { const e = document.querySelector(`#app .tmtl-onoff-why[data-fid="${CSS.escape(f)}"]`); return e ? e.textContent.trim() : null; }, fid);
      C.check(await page.evaluate((f) => !player[tmtLoader.auLayer].features[f], fid) && await advWord(page, fid) === 'Locked', `a real press REFUSED: features["${fid}"] unset, still "${await advWord(page, fid)}"`);
      C.check(!!why && /locked/.test(why) && /Arm features/.test(why), `and says why: "${why}"`);
      await view(page, 'Simple');
      C.check((await gridText(page, fid)).word === 'Locked', `the grid still reads Locked`);
      // the setting, through the Simple tab's own `toggle` (a real click, the engine's toggleAuto — A1-2's path)
      await page.locator('#app button.smallUpg').first().click({ timeout: 5000 });
      await redraw(page);
      C.check(await page.evaluate(() => tmtLoader.armLocked()) === true, 'the arming setting switched ON by its own button');
      await view(page, 'Advanced');
      C.check(await advWord(page, fid) === 'Off', `setting ON: the Advanced toggle reads "${await advWord(page, fid)}" (a locked feature, pressable)`);
      await clickAdv(page, fid);
      C.check(await advWord(page, fid) === 'Armed' && await page.evaluate((f) => player[tmtLoader.auLayer].features[f] === true && !tmtLoader.featureState(f).active, fid), `a press ARMS it: "${await advWord(page, fid)}", saved true, not active`);
      const gone = await page.evaluate((f) => !document.querySelector(`#app .tmtl-onoff-why[data-fid="${CSS.escape(f)}"]`), fid);
      C.check(gone, 'the refusal line is gone once the press is accepted');
      await view(page, 'Simple');
      const g = await gridText(page, fid);
      C.check(g.word === 'Armed' && /locked/.test(g.text), `and the grid reads "${(g.text || g.err || '').replace(/\n/g, ' / ')}"`);
      // ⚖ U4 through the ADVANCED master: with the setting on, "All features" arms the LOCKED ones too — the grid's
      // own onClick, so both views show every feature saved on, and the second press clears them all.
      await view(page, 'Advanced');
      const N = await page.evaluate(() => tmtLoader.features.length);
      const clear = async () => { if (await page.evaluate(() => Object.values(player[tmtLoader.auLayer].features).some(Boolean))) { await page.locator('#app button.tmtl-all-features').first().click({ timeout: 5000 }); await page.waitForTimeout(80); } };
      await clear();   // the armed candidate is on, so the first press is "every armable on" — back to a clean slate first
      await clear();
      await page.locator('#app button.tmtl-all-features').first().click({ timeout: 5000 });
      await page.waitForTimeout(80);
      const on = await page.evaluate(() => Object.values(player[tmtLoader.auLayer].features).filter(Boolean).length);
      const wm = await advWords(page);
      C.check(on === N && Object.values(wm).every((w) => w === 'On' || w === 'Armed'), `setting ON: the Advanced "All features" armed everything, locked included (${on}/${N} saved on; ${[...new Set(Object.values(wm))].join(', ')})`);
      await view(page, 'Simple');
      C.check(await gridMaster(page) === `${N} / ${N} on`, `and the grid's master reads "${await gridMaster(page)}"`);
      await view(page, 'Advanced');
      await page.locator('#app button.tmtl-all-features').first().click({ timeout: 5000 });
      await page.waitForTimeout(80);
      C.check(await page.evaluate(() => Object.values(player[tmtLoader.auLayer].features).filter(Boolean).length) === 0, 'pressed again: 0 on');
      C.check(errs.length === 0, `${errs.length} page errors`);
    } catch (e) { C.check(false, 'EXCEPTION ' + String(e && e.stack || e).slice(0, 300)); }
    finally { await context.close(); }
    row({ gate: 'V6-4 ARMING through the Advanced toggle: refused and explained with the setting off; Armed in BOTH views with it on', id, ok: C.ok, notes: C.notes.join('; ') });
  }
}

// ---- Part 5: THE OVERRIDE DISPLAY ----------------------------------------------------------------------------------------
async function part5(browser, base) {
  for (const id of GAMES6) {
    // (a) the PROFILE
    {
      const { context, page, errs } = await openPage(browser, base, id, { q: '&profile=all' });
      const C = checker();
      try {
        await page.evaluate(() => tmtLoader.storage.clear());
        await view(page, 'Advanced');
        const w = await advWords(page);
        const by = await page.evaluate(() => [...document.querySelectorAll('#app .tmtl-onoff-by')].map((e) => ({ fid: e.dataset.fid, by: e.dataset.by, text: e.textContent })));
        const grid = await page.evaluate(() => { const C2 = layers[tmtLoader.auLayer].clickables, o = {}; for (const k in C2) if (C2[k].tmtFeature) o[C2[k].tmtFeature] = C2[k].display().split('<br>')[0].replace(/ \(profile \w+\)$/, ''); return o; });
        const N = Object.keys(grid).length;
        const agree = Object.keys(grid).filter((f) => grid[f] === w[f]).length;
        C.check(N > 0 && agree === N, `every Advanced toggle's word is the grid's: ${agree}/${N} (${[...new Set(Object.values(w))].join(', ')})`);
        C.check(Object.values(w).includes('On'), 'and the unlocked ones read On under the profile');
        C.check(by.length === N && by.every((x) => x.by === 'profile' && /OVERRIDDEN/.test(x.text) && /“all”/.test(x.text) && /saved choice is off/.test(x.text)), `every block says the PROFILE decides (${by.length}/${N}): "${(by[0] || {}).text}"`);
        await page.evaluate(() => save());
        const st = await page.evaluate(() => { const raw = tmtLoader.storage.raw, o = []; for (let i = 0; i < raw.length.call(localStorage); i++) { const k = raw.key.call(localStorage, i); if (!k.endsWith('_options')) o.push(raw.getItem.call(localStorage, k)); } return o; });
        const inSave = st.map((x) => { try { let j = JSON.parse(atob(x)); if (j[j.set]) j = j[j.set]; return JSON.stringify(j.au && j.au.features); } catch (e) { return 'unparsed'; } });
        C.check(await saved(page) === '{}' && inSave.length > 0 && inSave.every((x) => x === '{}'), `player.au.features ${await saved(page)}; in the save ${inSave.join(',')}`);
        C.check(errs.length === 0, `${errs.length} page errors`);
      } catch (e) { C.check(false, 'EXCEPTION ' + String(e && e.stack || e).slice(0, 300)); }
      finally { await context.close(); }
      row({ gate: 'V6-5a ?profile=all: every Advanced toggle shows what the grid shows, says the PROFILE decides, and writes nothing to the save', id, ok: C.ok, notes: C.notes.join('; ') });
    }
    // (b) a RUNTIME override — measured against what the grid's own press does under one
    {
      const { context, page, errs } = await openPage(browser, base, id);
      const C = checker();
      try {
        await page.evaluate(() => tmtLoader.storage.clear());
        const fid = (await unlockedIds(page))[0];
        // THE GRID FIRST — what it does today is the specification: its press writes the save, the override stays
        const grid = await page.evaluate((f) => { const T = tmtLoader; T.setFeatureEnabled(f, true); const C2 = layers[T.auLayer].clickables; C2[Object.keys(C2).find((x) => C2[x].tmtFeature === f)].onClick(); const r = { saved: player[T.auLayer].features[f], override: T.featureOverrides()[f], active: T.featureState(f).active }; delete player[T.auLayer].features[f]; T.setFeatureEnabled(f, null); return r; }, fid);
        C.check(grid.saved === true && grid.override === true, `the GRID's press under a runtime override: saved ${grid.saved}, override still ${grid.override} (the behaviour to match)`);
        await page.evaluate((f) => tmtLoader.setFeatureEnabled(f, true), fid);
        await view(page, 'Advanced');
        const byOf = () => page.evaluate((f) => { const e = document.querySelector(`#app .tmtl-onoff-by[data-fid="${CSS.escape(f)}"]`); return e ? { by: e.dataset.by, text: e.textContent } : null; }, fid);
        let b = await byOf();
        C.check(await advWord(page, fid) === 'On' && b && b.by === 'runtime' && /runtime setting/.test(b.text) && /saved choice is off/.test(b.text), `override ON, saved off: the toggle reads "${await advWord(page, fid)}" and the block says "${b && b.text}"`);
        const others = await page.evaluate(() => document.querySelectorAll('#app .tmtl-onoff-by').length);
        C.check(others === 1, `only that block carries the line (${others})`);
        await clickAdv(page, fid);
        await redraw(page);
        b = await byOf();
        const s1 = await page.evaluate((f) => ({ saved: player[tmtLoader.auLayer].features[f], override: tmtLoader.featureOverrides()[f] }), fid);
        C.check(s1.saved === true && s1.override === true && b && /saved choice is on/.test(b.text), `a press in Advanced wrote the SAVE (${s1.saved}) and left the override (${s1.override}): "${b && b.text}"`);
        await clickAdv(page, fid);
        await redraw(page);
        const s2 = await page.evaluate((f) => ({ saved: player[tmtLoader.auLayer].features[f], override: tmtLoader.featureOverrides()[f] }), fid);
        C.check(s2.saved === false && s2.override === true && await advWord(page, fid) === 'On', `pressed again: saved ${s2.saved}, override ${s2.override}, still "${await advWord(page, fid)}" — the override decides`);
        await view(page, 'Simple');
        C.check((await gridText(page, fid)).word === 'On', 'the grid reads On too');
        await page.evaluate((f) => tmtLoader.setFeatureEnabled(f, null), fid);
        await view(page, 'Advanced');
        C.check(await advWord(page, fid) === 'Off' && !(await byOf()), `override cleared → "${await advWord(page, fid)}", no line`);
        C.check(errs.length === 0, `${errs.length} page errors`);
      } catch (e) { C.check(false, 'EXCEPTION ' + String(e && e.stack || e).slice(0, 300)); }
      finally { await context.close(); }
      row({ gate: 'V6-5b a RUNTIME override: the block names it; a press writes the SAVE and does not clear it (as the grid\'s does)', id, ok: C.ok, notes: C.notes.join('; ') });
    }
  }
}

// ---- Part 6: AFTER THE RESET -------------------------------------------------------------------------------------------
async function part6(browser, base) {
  for (const id of GAMES6) {
    const { context, page, errs } = await openPage(browser, base, id);
    const C = checker();
    try {
      await page.evaluate(() => tmtLoader.storage.clear());
      await view(page, 'Advanced');
      await page.locator('#app button.tmtl-all-features').first().click({ timeout: 5000 });
      await page.waitForTimeout(80);
      const w0 = await advWords(page);
      const on0 = Object.values(w0).filter((x) => x === 'On').length;
      C.check(on0 > 0, `${on0} toggles On after "All features"`);
      const r = await page.evaluate(() => tmtLoader.resetAutomation());
      await redraw(page);
      const w1 = await advWords(page);
      C.check(r.ok && r.cleared.features === on0, `resetAutomation() cleared ${r.cleared && r.cleared.features} switched-on feature(s)`);
      C.check(Object.values(w1).every((x) => x === 'Off' || x === 'Locked') && Object.keys(w1).length === Object.keys(w0).length, `with no reload every Advanced toggle reads Off/Locked (${[...new Set(Object.values(w1))].join(', ')}, ${Object.keys(w1).length})`);
      C.check(await saved(page) === '{}', `features ${await saved(page)}`);
      C.check(errs.length === 0, `${errs.length} page errors`);
    } catch (e) { C.check(false, 'EXCEPTION ' + String(e && e.stack || e).slice(0, 300)); }
    finally { await context.close(); }
    row({ gate: 'V6-6 after tmtLoader.resetAutomation() every Advanced toggle reads Off with no reload', id, ok: C.ok, notes: C.notes.join('; ') });
  }
}

// ---- Part 7: THE ROSTER -------------------------------------------------------------------------------------------------
async function part7(browser, base, ids) {
  const judged = [], abstained = [];
  for (const id of ids) {
    let r = null;
    try {
      const { context, page, errs } = await openPage(browser, base, id, { width: 390, mobile: true });
      try {
        const ready = await page.evaluate(() => !!(window.tmtLoader && tmtLoader.ready && tmtLoader.automation));
        if (!ready) { abstained.push(`${id}: the automation page did not come up`); continue; }
        await view(page, 'Advanced');
        r = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth, past = [];
          let n = 0;
          for (const e of document.querySelectorAll('#app .tmtl-root input, #app .tmtl-root select, #app .tmtl-root button')) {
            const b = e.getBoundingClientRect();
            if (!b.width) continue;
            n++;
            if (b.right > vw + 0.5) past.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} right ${Math.round(b.right)}`);
          }
          const tog = document.querySelectorAll('#app button.tmtl-onoff').length;
          return { features: tmtLoader.features.length, toggles: tog, past, n, scrollW: document.documentElement.scrollWidth, vw };
        });
        r.errs = errs.length;
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    const ok = r.toggles === r.features && r.past.length === 0 && r.scrollW <= r.vw;
    judged.push({ id, ok, r });
    if (!ok) console.log(`RED   ${id} ${JSON.stringify(r).slice(0, 400)}`);
  }
  const red = judged.filter((x) => !x.ok);
  row({ gate: 'V6-7 the ROSTER: the Advanced tab at 390 px has one toggle per registered feature and nothing interactive past the viewport', id: `${judged.length} judged`, leg: `${ids.length} assigned`,
    ok: red.length === 0 && judged.length > 0,
    notes: `judged ${judged.length}, RED ${red.length} (${red.map((x) => `${x.id} ${x.r.toggles}/${x.r.features} past ${x.r.past.length}`).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ' — ' + abstained.join(' · ') : ''} ⚠ (counted, and NOT given a cause); `
      + `${judged.reduce((s, x) => s + x.r.toggles, 0)} toggles over ${judged.reduce((s, x) => s + x.r.features, 0)} registered features; ${judged.reduce((s, x) => s + x.r.n, 0)} interactive elements measured; ${judged.filter((x) => x.r.features === 0).length} game(s) register no feature` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v6-part7${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- shots: what the user looks at -------------------------------------------------------------------------------------
async function shots(browser, base) {
  // ⚠ FROM THE MID-GAME FIXTURE (part 2's): at a fresh save ptr has ONE unlocked feature, so there is no second one to
  // show OVERRIDDEN — the first cut's ptr shot showed only the On block. Each of the three blocks is its own image.
  const dir = path.join(REPO, 'tools/harness/results');   // flat: `results/*.png` is what .gitignore covers
  fs.mkdirSync(dir, { recursive: true });
  for (const id of GAMES6) {
    const out = [];
    const s = JSON.parse(fs.readFileSync(path.join(REPO, SNAP[id]), 'utf8'));
    for (const w of [1280, 390]) {
      const { context, page } = await openPage(browser, base, id, { width: w, mobile: w === 390 });
      try {
        await page.evaluate(() => tmtLoader.storage.clear());
        await pageLoadFrom(page, s.player);
        const st = await page.evaluate(() => tmtLoader.features.map((f) => tmtLoader.featureState(f.id)));
        const unl = st.filter((x) => x.unlocked), on = unl[0], over = unl[1] || null, arm = st.find((x) => !x.unlocked) || null;
        await page.evaluate(([o, v, m]) => { tmtLoader.armLocked(true); tmtLoader.pressFeature(o); if (m) tmtLoader.pressFeature(m); if (v) tmtLoader.setFeatureEnabled(v, true); }, [on.id, over && over.id, arm && arm.id]);
        await view(page, 'Advanced');
        await page.locator('#app button.tmtl-collapse-all').first().click({ timeout: 5000 });
        await redraw(page);
        const file0 = path.join(dir, `v6-${id}-advanced-${w}.png`);
        await page.locator('#app button.tmtl-all-features').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: file0 });
        out.push(path.relative(REPO, file0));
        for (const [tag, f] of [['on', on], ['overridden', over], ['armed', arm]]) {
          if (!f) { out.push(`${tag}: none on this fixture`); continue; }
          await page.locator(`#app button.tmtl-fold[data-fid="${f.id}"]`).first().click({ timeout: 5000 });
          await redraw(page);
          const blk = page.locator(`#app button.tmtl-onoff[data-fid="${f.id}"]`).first().locator('xpath=../..');
          await blk.scrollIntoViewIfNeeded();
          const file = path.join(dir, `v6-${id}-${tag}-${w}.png`);
          await blk.screenshot({ path: file });
          out.push(`${tag} ${f.id} ${path.relative(REPO, file)}`);
        }
        await page.evaluate(() => tmtLoader.storage.clear());
      } finally { await context.close(); }
    }
    row({ gate: 'V6 screenshots: a block On, one Armed, one Overridden', id, ok: out.filter((x) => /\.png$/.test(x)).length === 8, notes: out.join(', ') });
  }
}

// ---- entry -----------------------------------------------------------------------------------------------------------
const PAGE = { 1: part1, 2: part2, 3: part3, 4: part4, 5: part5, 6: part6, shots };
if (!PAGE[PART] && PART !== 'page' && PART !== '7') { console.error(`unknown --part ${PART} (1..7, page, shots)`); process.exit(2); }
{
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const server = await startServer(REPO);
  try {
    if (PART === '7') {
      const all = GAMES();
      let ids = a._.length ? a._ : all;
      if (a.shard) { const { i, n } = parseShard(a.shard); ids = assignShards(all, n)[i - 1]; }
      await part7(browser, server.url, ids);
    } else if (PART === 'page') { for (const p of [1, 2, 3, 4, 5, 6]) await PAGE[p](browser, server.url); }
    else await PAGE[PART](browser, server.url);
  } finally { await browser.close(); server.stop(); }
}

if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v6-part${PART}${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}-last.json`), { date: new Date().toISOString(), commit, dirty, rows });
const green = rows.filter((r) => r.ok).length;
console.log(`\nVERDICT: rows ${green}/${rows.length} of ${ROWS[PART] ?? '?'} expected`);
if (!a['no-summary']) appendSection({ title: `V6 the Advanced toggle — part ${PART}`, commit, dirty, rows, slug: `gates-v6-part${PART}` });
if (a.assert && (green !== rows.length || rows.length !== ROWS[PART])) process.exit(1);
