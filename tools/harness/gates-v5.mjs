// The V5 gates — the Advanced automation tab: controls that WRAP on a phone, a layout that does not JUMP, and more
// RETRY conditions for challenges (plan §36, brief `tmt-auto-15`).
//   node tools/harness/gates-v5.mjs --part 1|2|3|3s|5|7 [--no-summary] [--no-write] [--assert] [--pool N] [--shard i/N]
//
// Part 1   THE WRAP (page, ptr AND something). Every interactive element inside the au tab ends inside the viewport AND
//          inside its pane, at 390 px with and without `?mobile=1` and at a desktop width; the tab's root is as wide
//          as its pane (a column that shrink-wrapped to nothing would pass "nothing past the edge" vacuously — it is
//          what `contain:inline-size` did, measured); and no tap target is smaller than it was before V5.
// Part 2   NO JUMP (page, ptr AND something). Constructed transitions on a PAUSED page: a number that grows by an
//          order of magnitude and shrinks back, a reason line that swaps to a shorter sentence, a line that appears
//          and disappears. After the SHRINK nothing below moved and no number box got narrower. CONTROL rows: the same
//          transitions with the floors switched OFF must move something — the proof this leg can see the defect.
// Part 3   RETRY CONDITIONS (node). `loader/retry.test.mjs` RUN HERE and required green, plus the conditions on the
//          REAL fixture: from `all/M22.json`, each condition WAITS with its own code and then RETRIES.
// Part 3s  THE REPORT (node, long — not in CI). Each retry condition at two or three values against today's rule,
//          from `all/M22.json` and over the whole stretch from `all/M15.json`: H12 attempts / give-ups, quirks, HS,
//          marks. ⚖ Report, don't decide — R3b-2 owns the choice.
// Part 5   INERTNESS (node). Nothing chosen ⇒ the opening 6718 / `82eee26f947b2b2e`, M15 → M24 and R3a's leg from M22
//          (`fceef65ba0f59011` — RE-RECORDED by R3b-2, see part 5) unmoved to the hash; `player.au` and
//          `runtimeState()` key sets as R3b-1 left them.
// Part 7   THE ROSTER (page). The Advanced tab at 390 px on every game judged: 0 interactive elements past the
//          viewport; abstentions COUNTED and left uncaused.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, GAMES, parseArgs, startServer, headCommit, treeDirty, writeJSON, entryOnly, assignShards, parseShard } from './lib.mjs';
import { appendSection } from './summary.mjs';
import { runCells } from './sweep.mjs';
entryOnly(import.meta.url);

// ⛔ EVERY FLAG THIS BATTERY READS IS DECLARED HERE (R3b-1: an undeclared `--assert` took the next token as its value
// and CI was green over a red battery). Booleans in the list; everything else takes a value.
const a = parseArgs(process.argv.slice(2), ['no-summary', 'no-write', 'assert']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 1400)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH, for `--assert` (CI). A battery that dies part-way prints fewer rows, and fewer
// rows is fewer reds. ⚠ ADDING A LEG MOVES THIS, deliberately.
const ROWS = { 1: 6, 2: 5, 3: 2, '3s': 22, 5: 5, 7: 1 };

const SNAP = (id, m) => path.join(REPO, `tools/harness/snapshots/${id}/all/${m}.json`);
const PTR_LADDER = path.join(REPO, 'tools/harness/ladder/ptr.json');
const POOL = Number(a.pool || 4);

// ---- the row-3 readout (R3b-1's, plus the challenge counts per id) ------------------------------------------------
const READOUT = `({q: String(player.q.points), qTotal: String(player.q.total), qLayers: String(player.q.buyables[11]), h: String(player.h.points), hBest: String(player.h.best), hChall: Object.assign({}, player.h.challenges), active: player.h.activeChallenge, sb: String(player.sb.points), ch: tmtLoader.hookStats().challenges, fail: (tmtLoader.runtimeState().challengeFailed || {})['challenges:h'] || null})`;
const short = (v) => (v === undefined || v === null ? '—' : String(v).replace(/(\d)\.(\d\d\d)\d+e/, '$1.$2e').slice(0, 12));
const markText = (l, ms) => ms.map((m) => `${m} ${l.marks && l.marks[m] != null ? l.marks[m] : '—'}`).join(' · ');

// ---- Part 3s: THE REPORT --------------------------------------------------------------------------------------------
// ⚖ REPORT, DON'T DECIDE (brief Part 3). ONE run per cell — a report's rows are inputs to R3b-2's sweep, not verdicts,
// and every row carries its whole `--auto-opt` so it names what it measured. A row is GREEN when its run completed.
const RETRY_CELLS = [
  ['', 'the table as it stands — `sequential|give-up@0.1/30/2x` (CONTROL)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/1.5x', 'R = 1.5'],
  ['policy:challenges:h=sequential|give-up@0.1/30/4x', 'R = 4'],
  ['policy:challenges:h=sequential|give-up@0.1/30/5resets', 'N = 5 resets of the highest row (frozen)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/20resets', 'N = 20 (frozen)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/60resets', 'N = 60 (frozen)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/20resets-now', 'N = 20, the highest row NOW'],
  ['policy:challenges:h=sequential|give-up@0.1/30/300s', 'T = 300 s (a proxy)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/1200s', 'T = 1200 s (a proxy)'],
  ['policy:challenges:h=sequential|give-up@0.1/30/when;arg:challenges:h.w=getBuyableAmount("q",11).gte(5)', 'WHEN Quirk Layers ≥ 5'],
  ['policy:challenges:h=sequential|give-up@0.1/30/when;arg:challenges:h.w=player.h.points.gte(5)', 'WHEN Hindrance Spirit ≥ 5'],
];
const REPORT_LEGS = {
  L22: { from: 'M22', ticks: Number(a.ticks22 || 12000), marks: ['M23', 'M24', 'M25', 'M26'] },
  L15: { from: 'M15', ticks: Number(a.ticks15 || 21000), marks: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26'] },
};
async function part3s() {
  const cells = RETRY_CELLS.map(([opt, note]) => ({ label: opt || '(the table)', opt, note }));
  const out = {};
  // `--leg L15` runs one half (the whole-stretch one is ~40 min on its own)
  for (const [leg, L] of Object.entries(REPORT_LEGS).filter(([k]) => !a.leg || k === String(a.leg))) {
    let done = 0;
    // ⚠ THE WALL MUST OUTLAST THE LEG, or the cells are not comparable — measured: under a 600 s wall one L15 cell
    // stopped at 36699 game-seconds of 37048 while its neighbours finished, and a row that ran a shorter leg than the
    // row beside it is not a comparison. 21,000 ticks is ~280 s alone and ~700 s under a loaded box.
    const flags = Object.entries({ profile: 'all', diff: 1, ticks: L.ticks, 'wall-ms': Number(a.wallMs || 1200000), ladder: PTR_LADDER, to: 'M26',
      'from-snapshot': SNAP('ptr', L.from), 'marks-continue': true, stall: 1000000, eval: READOUT });
    const lines = await runCells({ id: 'ptr', cells, flags, pool: POOL, repeat: 1, stop: 'M26',
      onRun: (c, l) => console.log(`[PROGRESS ${++done}/${cells.length}] ${leg} ${c.label} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error} (${Math.round((l.box?.wallMs || 0) / 1000)}s wall)`) });
    out[leg] = lines;
    lines.forEach((l, i) => {
      const e = l.eval || {};
      const c = e.ch && e.ch['challenges:h'];
      row({ gate: `V5-3s ${leg} ${cells[i].note}`, id: 'ptr', leg: `from all/${L.from}, ${L.ticks} ticks, diff 1, profile all, ONE run`,
        ok: !!l.ok, ticks: l.ticks, gameSeconds: l.gameSeconds, hash: l.hashGame,
        notes: `${markText(l, L.marks)}; h challenges ${JSON.stringify(e.hChall || {})}; enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'}; quirks ${short(e.q)} (total ${short(e.qTotal)}), QL ${e.qLayers}; HS ${short(e.h)} (best ${short(e.hBest)}); SB ${short(e.sb)}; resets q/h ${(l.actions || {})['reset:q'] || 0}/${(l.actions || {})['reset:h'] || 0}; active ${e.active}; wait record ${JSON.stringify(e.fail).slice(0, 160)}; opt \`${cells[i].opt || '—'}\`; ticks_ms ${l.ticks_ms}${l.error ? '; ERROR ' + l.error : ''}` });
    });
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/gates-v5-part3s.json'), { commit, dirty, cells, out });
}

// ---- the page ---------------------------------------------------------------------------------------------------------
async function openAdvanced(browser, base, id, { width, mobile, snapshot = null, warm = 0 }) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1&profile=all${mobile ? '&mobile=1' : ''}`, base).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
  if (snapshot) {
    const { pageLoadFrom } = await import('./page.mjs');
    const s = JSON.parse(fs.readFileSync(snapshot, 'utf8'));
    await pageLoadFrom(page, s.player);
  }
  await page.evaluate(() => tmtLoader.pause());
  if (warm) await page.evaluate((n) => tmtLoader.tick(1, n), warm);
  await page.evaluate(() => { showTab('au'); player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
  await redraw(page);
  const more = page.locator('#app button.tmtl-expand-all').first();
  if (await more.count()) { await more.click({ timeout: 5000 }); await redraw(page); }
  return { context, page, errs };
}
async function redraw(page) {
  await page.evaluate(() => { if (tmtLoader.invalidateView) tmtLoader.invalidateView(); updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
  await page.waitForTimeout(150);
}
// ⛔ THE CELLS OF PARTS 1 AND 2. ptr at `all/M22` (the give-up block the defect was reported on, H11 done, H12 failed,
// the retry bar live) and Something Tree fresh + 200 ticks (the other engine family, whose tab is styled differently —
// R3a needed `text-align:left` INLINE because a game's stylesheet beat inheritance).
const GAMES5 = [{ id: 'ptr', snapshot: SNAP('ptr', 'M22'), warm: 3 }, { id: 'something', snapshot: null, warm: 200 }];
// ⛔ THE TAP TARGETS BEFORE V5, MEASURED at `f37b2029f` on both games at 390 (with and without `?mobile=1`) and 1280:
// the narrowest box 107.2 px, the narrowest button 21.8 px, a button 44 px tall under `?mobile=1` (mobile.css) and
// 19 px without, a select 21 px tall. A wrap that shrank any of them to fit would be the defect in a new place.
const TAPS = { input: 107, buttonW: 21.5, buttonH: { mobile: 43.5, plain: 18.5 }, selectH: 20.5 };

/** Everything that must be on screen for the wrap to be judged — the watch, a rung list, a cycle, a retry predicate. */
async function constructEverything(page, id) {
  return page.evaluate(async (id) => {
    const T = window.tmtLoader, out = { did: [] };
    T.setWatchOption('watch', true); out.did.push('watch ON (escalation lists render their editors)');
    const r = T.explain().filter((x) => x.state === 'on' && x.kind === 'reset');
    if (r[0]) { T.setSavedModifier(r[0].id, 'turn@W/Kx/N/B/H'); out.did.push(`${r[0].id} carries the row cycle (five more fields)`); }
    const ch = T.explain().find((x) => x.kind === 'challenges' && x.state !== 'locked' && x.state !== 'excluded');
    if (ch) {
      T.setSavedStrategy(ch.id, 'sequential');
      T.setSavedModifier(ch.id, 'give-up@B/H/when');
      T.setSavedParam(ch.id, 'w', 'getBuyableAmount("q",11).gte(5)', 'modifier');
      out.did.push(`${ch.id} retries WHEN a predicate holds (the wide field)`);
    }
    if (r[1]) { T.setSavedControl(r[1].id, 'while', 'player.points.gte(1)'); out.did.push(`${r[1].id} has a typed while`); }
    T.invalidateView();
    return out;
  }, id);
}
/** The measurement: every interactive element in the au tab, against the viewport AND its pane. */
const MEASURE = () => {
  const vw = document.documentElement.clientWidth;
  const roots = [...document.querySelectorAll('#app .tmtl-root')];
  const out = { vw, scrollW: document.documentElement.scrollWidth, roots: [], past: [], n: 0, taps: { input: 1e9, buttonW: 1e9, buttonH: 1e9, selectH: 1e9 }, font: null };
  for (const r of roots) {
    const pane = r.closest('.upgTable') || r.parentElement;
    const pr = pane.getBoundingClientRect(), rr = r.getBoundingClientRect();
    out.roots.push({ w: Math.round(rr.width), pane: Math.round(pr.width) });
    if (!out.font) out.font = getComputedStyle(r).fontFamily.slice(0, 60);
    const edge = Math.min(vw, pr.right) + 0.5;
    // ⛔ AND THE ROOT'S OWN OVERFLOW, because a BOX can lie. Measured: with a label `white-space:nowrap` again — the
    // brief's own mutant — the label's TEXT runs past the screen while its box stays capped at `max-width:100%`, so a
    // bounding-rect check alone came back green on the very defect this part exists for. `scrollWidth` is what sees
    // content that does not fit; a label is checked the same way, and an `<input>` is NOT (a field legitimately holds
    // more text than it shows).
    if (r.scrollWidth > r.clientWidth + 1) out.past.push(`the tab's own content overflows its column: scrollWidth ${r.scrollWidth} of ${r.clientWidth}`);
    for (const e of r.querySelectorAll('input, select, button, .tmtl-label')) {
      const b = e.getBoundingClientRect();
      if (!b.width) continue;
      if (e.tagName !== 'SPAN') out.n++;
      if (b.right > edge) out.past.push(`${e.tagName.toLowerCase()}${e.className ? '.' + String(e.className).split(' ')[0] : ''} "${(e.textContent || e.value || '').trim().slice(0, 30)}" right ${Math.round(b.right)}`);
      if (e.classList.contains('tmtl-label') && e.scrollWidth > e.clientWidth + 1) out.past.push(`label "${(e.textContent || '').trim().slice(0, 30)}" does not fit its own box: ${e.scrollWidth} of ${e.clientWidth}`);
      if (e.tagName === 'INPUT' && !/width:\s*100%/.test(e.getAttribute('style') || '')) out.taps.input = Math.min(out.taps.input, b.width);
      if (e.tagName === 'BUTTON') { out.taps.buttonW = Math.min(out.taps.buttonW, b.width); out.taps.buttonH = Math.min(out.taps.buttonH, b.height); }
      if (e.tagName === 'SELECT') out.taps.selectH = Math.min(out.taps.selectH, b.height);
    }
  }
  return out;
};

// ---- Part 1: the WRAP ---------------------------------------------------------------------------------------------------
async function part1(browser, base) {
  for (const G of GAMES5) {
    for (const v of [{ tag: '390 ?mobile=1', width: 390, mobile: true, phone: true }, { tag: '390 plain', width: 390, mobile: false, phone: true }, { tag: '1280 desktop', width: 1280, mobile: false, phone: false }]) {
      let r = null, did = null, err = null;
      try {
        const { context, page, errs } = await openAdvanced(browser, base, G.id, { width: v.width, mobile: v.mobile, snapshot: G.snapshot, warm: G.warm });
        try {
          did = await constructEverything(page, G.id);
          await redraw(page);
          const arm = page.locator('#app button.tmtl-reset-arm').first();
          if (await arm.count()) { await arm.click({ timeout: 5000 }); await redraw(page); }
          r = await page.evaluate(MEASURE);
          r.errs = errs.slice(0, 2);
        } finally { await context.close(); }
      } catch (e) { err = String(e.message).slice(0, 200); }
      if (!r) { row({ gate: 'V5-1 the WRAP', id: G.id, leg: v.tag, ok: false, notes: `no measurement: ${err}` }); continue; }
      const H = v.mobile ? TAPS.buttonH.mobile : TAPS.buttonH.plain;
      const wide = r.roots.every((x) => x.w >= x.pane - 1) && r.roots.length >= 2;
      const taps = r.taps.input >= TAPS.input && r.taps.buttonW >= TAPS.buttonW && r.taps.buttonH >= H && r.taps.selectH >= TAPS.selectH;
      row({ gate: 'V5-1 the WRAP: nothing interactive past the viewport or its pane, the tab is its pane’s width, no tap target smaller', id: G.id, leg: v.tag,
        ok: r.past.length === 0 && r.scrollW <= r.vw && wide && taps && r.n > 40,
        notes: `${r.past.length} of ${r.n} interactive element(s) (+ every field label) past the edge${r.past.length ? ': ' + r.past.slice(0, 6).join(' · ') : ''}; scrollWidth ${r.scrollW} of ${r.vw}; `
          + `roots ${JSON.stringify(r.roots)} (⛔ a root narrower than its pane is the VACUOUS green — contain:inline-size measured 0 px); `
          + `taps: input ≥ ${Math.round(r.taps.input * 10) / 10} (want ${TAPS.input}), button ${Math.round(r.taps.buttonW * 10) / 10} × ${Math.round(r.taps.buttonH * 10) / 10} (want ${TAPS.buttonW} × ${H}), select h ${Math.round(r.taps.selectH * 10) / 10}; font ${r.font}; constructed: ${(did && did.did || []).join('; ')}; page errors ${r.errs.length}` });
    }
  }
}

// ---- Part 2: NO JUMP ----------------------------------------------------------------------------------------------------
// ⛔ EVERY TRANSITION IS CONSTRUCTED. The UI arc's three tries at catching a shift in the wild measured nothing (the page
// was not ticking; a two-minute gain below float precision; data that moved with 0 of 60 boxes changing), because a
// box changes size only when its string's LENGTH does. So the leg WRITES the loader's own readout state — a feature's
// last decision (`f.last`, the code and the values V1's table formats) and the moment it became eligible (`onSince`,
// which is what "never fired" is measured from) — redraws, and measures every block below it and every number box.
// ⚠ A "nothing moved" row is evidence ONLY beside its CONTROL: the same transitions with the floors switched OFF
// (`tmtLoader.setViewFloors(false)`) must move something, or the leg could not see the defect at all.
const LAYOUT = (fid) => {
  const y = (e) => Math.round((e.getBoundingClientRect().top + window.scrollY) * 10) / 10;
  const me = document.querySelector(`#app .tmtl-fold[data-fid="${fid}"]`);
  const myTop = me ? y(me) : 0;
  const below = [...document.querySelectorAll('#app .tmtl-fold')].filter((e) => y(e) > myTop + 1).map((e) => ({ id: e.dataset.fid, top: y(e) }));
  const nums = [...document.querySelectorAll('#app .tmtl-num')].filter((e) => !e.closest('.tmtl-ghost')).map((e) => ({ k: e.dataset.k, w: Math.round(e.getBoundingClientRect().width * 10) / 10 }));
  return { below, nums };
};
const compare = (A, B) => {
  const moved = B.below.filter((b, i) => A.below[i] && A.below[i].id === b.id && Math.abs(A.below[i].top - b.top) > 0.5).length;
  let narrower = 0, wider = 0;
  for (const b of B.nums) { const x = A.nums.find((n) => n.k === b.k); if (!x) continue; if (b.w < x.w - 0.3) narrower++; if (b.w > x.w + 0.3) wider++; }
  return { moved, narrower, wider, of: B.below.length };
};
async function transitions(page, fid) {
  const lay = () => page.evaluate(LAYOUT, fid);
  const setLast = async (code, values) => {
    await page.evaluate(({ fid, code, values }) => {
      const f = tmtLoader.features.find((x) => x.id === fid);
      const v = {};
      for (const k in values) v[k] = typeof values[k] === 'string' && /^[\d.]+e\d+$/.test(values[k]) ? new Decimal(values[k]) : values[k];
      f.last = { code, values: v, tick: f.last ? f.last.tick : 0, at: f.last ? f.last.at : 0 };
    }, { fid, code, values });
    await redraw(page);
  };
  const setOn = async (ago) => { await page.evaluate(({ fid, ago }) => { const f = tmtLoader.features.find((x) => x.id === fid); f.onSince = Number(player.timePlayed) - ago; }, { fid, ago }); await redraw(page); };
  const q = (x) => ({ gain: x, need: x, n: 2, have: x });
  const o = {};
  // (a) a NUMBER grows by one order of magnitude — 9.99e9 → 1.00e10, one character — and shrinks back
  await setLast('waiting:gain-x', q('9.99e9')); const a0 = await lay();
  await setLast('waiting:gain-x', q('1.00e10')); const a1 = await lay();
  await setLast('waiting:gain-x', q('9.99e9')); const a2 = await lay();
  o.grow = compare(a0, a1); o.shrink = compare(a1, a2);
  // (b) the reason line swaps to a SHORTER sentence (three lines at 390 px → one)
  await setLast('waiting:turn', { layer: 'q', row: 3, left: 12, weight: 20, mine: 1 }); const b0 = await lay();
  await setLast('off', {}); const b1 = await lay();
  o.swap = compare(b0, b1);
  // (c) a line APPEARS and then DISAPPEARS — "never fired" (and the header's count with it)
  await setOn(0); const c0 = await lay();
  await setOn(1e6); const c1 = await lay();
  await setOn(0); const c2 = await lay();
  o.appear = compare(c0, c1); o.vanish = compare(c1, c2);
  return o;
}
async function part2(browser, base) {
  for (const G of GAMES5) {
    const res = {};
    for (const floors of [true, false]) {
      const { context, page } = await openAdvanced(browser, base, G.id, { width: 390, mobile: true, snapshot: G.snapshot, warm: G.warm });
      try {
        await page.evaluate((on) => tmtLoader.setViewFloors(on), floors);
        await redraw(page);
        // the target: an ON feature that never acted (so "never fired" is constructible), near the MIDDLE of the list
        const fid = await page.evaluate(() => { const on = tmtLoader.explain().filter((r) => r.state === 'on' && r.acted === 0); return on.length ? on[Math.floor(on.length / 2)].id : null; });
        res[floors] = { fid, t: fid ? await transitions(page, fid) : null };
        // …and the same swap on a COLLAPSED block, whose one line wraps at 390 px
        if (fid) {
          await page.locator('#app button.tmtl-collapse-all').first().click({ timeout: 5000 });
          await redraw(page);
          const t2 = await transitions(page, fid);
          res[floors].collapsedSwap = t2.swap;
        }
      } finally { await context.close(); }
    }
    const on = res[true], off = res[false];
    const f = (x) => JSON.stringify(x);
    if (!on.t || !off.t) { row({ gate: 'V5-2 NO JUMP', id: G.id, leg: '390 ?mobile=1', ok: false, notes: 'no target feature' }); continue; }
    row({ gate: 'V5-2 NO JUMP (floors ON): after a number SHRINKS back, a sentence gets SHORTER or a line DISAPPEARS, nothing below moved and no number box got narrower', id: G.id, leg: `390 ?mobile=1, target ${on.fid}`,
      ok: on.t.grow.wider > 0 && on.t.grow.narrower === 0 && on.t.shrink.moved === 0 && on.t.shrink.narrower === 0 && on.t.swap.moved === 0 && on.t.vanish.moved === 0 && on.t.vanish.narrower === 0 && on.collapsedSwap.moved === 0,
      notes: `grow ${f(on.t.grow)} (the box must be WIDER); shrink ${f(on.t.shrink)}; swap ${f(on.t.swap)}; collapsed swap ${f(on.collapsedSwap)}; appear ${f(on.t.appear)} (a FIRST appearance may move things once — a floor grows); vanish ${f(on.t.vanish)}` });
    row({ gate: 'V5-2 CONTROL (floors OFF): the same transitions DO move things — the proof this leg can see the defect', id: G.id, leg: `390 ?mobile=1, target ${off.fid}`,
      ok: off.t.shrink.narrower > 0 && off.t.swap.moved > 0 && off.t.vanish.moved > 0 && off.collapsedSwap.moved > 0,
      notes: `shrink ${f(off.t.shrink)} (boxes must NARROW); swap ${f(off.t.swap)}; collapsed swap ${f(off.collapsedSwap)}; vanish ${f(off.t.vanish)} (blocks must MOVE)` });
  }
  // ⛔ AND IN REAL PLAY, NOT ONLY CONSTRUCTED: ptr ticking from `all/M22` with a redraw after every tick. With the floors
  // a block's top can only ever go DOWN the page (a floor grows) — never back up. The control is the same run with the
  // floors off; the height the floors hold is the COST, reported.
  const play = {};
  for (const floors of [true, false]) {
    const { context, page } = await openAdvanced(browser, base, 'ptr', { width: 390, mobile: true, snapshot: SNAP('ptr', 'M22'), warm: 0 });
    try {
      await page.evaluate((on) => tmtLoader.setViewFloors(on), floors);
      await redraw(page);
      let prev = null, up = 0, down = 0, samples = 0;
      const N = Number(a.playTicks || 60), halves = [0, 0];
      for (let i = 0; i < N; i++) {
        await page.evaluate(() => tmtLoader.tick(1, 1));
        await redraw(page);
        const L = await page.evaluate(() => [...document.querySelectorAll('#app .tmtl-fold')].map((e) => Math.round(e.getBoundingClientRect().top + window.scrollY)));
        if (prev) for (let j = 0; j < Math.min(prev.length, L.length); j++) { if (L[j] < prev[j]) up++; if (L[j] > prev[j]) { down++; halves[i < N / 2 ? 0 : 1]++; } }
        prev = L; samples++;
      }
      const h = await page.evaluate(() => Math.round(document.querySelector('.tmtl-watch').parentElement.getBoundingClientRect().height));
      play[floors] = { up, down, samples, height: h, halves };
    } finally { await context.close(); }
  }
  row({ gate: 'V5-2 REAL PLAY: ptr from all/M22, a redraw per tick — with the floors no block ever moves back UP the page', id: 'ptr', leg: `390 ?mobile=1, ${a.playTicks || 60} ticks`,
    ok: play[true].up === 0,
    notes: `floors ON: ${play[true].up} block move(s) up, ${play[true].down} down over ${play[true].samples} redraws (first half ${play[true].halves[0]}, second ${play[true].halves[1]} — a floor grows the first time a line reaches a new longest, so the moves thin out); CONTROL floors OFF: ${play[false].up} up, ${play[false].down} down ${play[false].up + play[false].down === 0 ? '(⚠ the control saw NO movement in this stretch, so this row alone proves nothing — the constructed rows above are the evidence)' : ''}; `
      + `the COST — the tab's height at the end: ${play[true].height} px with the floors, ${play[false].height} px without (+${play[true].height - play[false].height} px held)` });
}

// ---- Part 3: the retry conditions -------------------------------------------------------------------------------------
async function runJob(o) {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v5-')), 'r.json');
  const args = [path.join(REPO, 'tools/harness/run.mjs'), 'ptr', '--json', out];
  for (const [k, v] of Object.entries(o)) { if (v === undefined || v === null || v === false) continue; if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v)); }
  await new Promise((res) => { const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'ignore'] }); c.on('exit', res); });
  try { return JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { return { ok: false, error: 'no result' }; }
}
async function part3() {
  const unit = await new Promise((resolve) => {
    const c = spawn(process.execPath, ['--test', 'loader/retry.test.mjs', 'loader/challenges.test.mjs'], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    c.stdout.on('data', (d) => { o += d; });
    c.on('exit', (code) => resolve({ code, out: o }));
  });
  const pass = (/^# pass (\d+)/m.exec(unit.out) || [])[1], fail = (/^# fail (\d+)/m.exec(unit.out) || [])[1];
  row({ gate: 'V5-3 the retry conditions, constructed: loader/retry.test.mjs + loader/challenges.test.mjs (stub engine), RUN HERE', id: '—', leg: 'node --test',
    ok: unit.code === 0 && fail === '0' && Number(pass) === 28, notes: `${pass} passed, ${fail} failed (the two files declare 28 — 11 + 17; a count that DROPS is a file that stopped running)` });
  // ⛔ ON THE REAL FIXTURE, each condition must do BOTH halves: WAIT with its own code, and then RETRY — H12 entered
  // again (enter ≥ 3: H11, H12, H12 again). The predicate names a game-second past the first give-up, so it goes true
  // inside the leg by construction (M22 is at 30618, and the first give-up measured at ~+120).
  const C = [
    ['sequential|give-up@0.1/30/5resets', null, 'waiting:retry-resets'],
    ['sequential|give-up@0.1/30/60s', null, 'waiting:retry-clock'],
    ['sequential|give-up@0.1/30/when', 'player.timePlayed > 30918', 'waiting:retry-when'],
  ];
  const got = await Promise.all(C.map(([pol, w]) => runJob({ profile: 'all', diff: 1, ticks: 500, 'from-snapshot': SNAP('ptr', 'M22'),
    'auto-opt': `policy:challenges:h=${pol}${w ? ';arg:challenges:h.w=' + w : ''}`, explain: true, eval: READOUT })));
  const lines = got.map((r, i) => {
    const codes = (r.explain_stats && r.explain_stats.codes) || {};
    const c = r.eval && r.eval.ch && r.eval.ch['challenges:h'];
    return { pol: C[i][0], waited: codes[C[i][2]] || 0, enter: c ? c.enter : 0, gaveUp: c ? c.gaveUp : 0, ok: !!r.ok };
  });
  row({ gate: 'V5-3 on the REAL fixture (ptr all/M22 + 500 ticks): every new condition WAITS with its own code and then RETRIES', id: 'ptr', leg: '500 ticks, diff 1, profile all',
    ok: lines.every((l) => l.ok && l.waited > 0 && l.enter >= 3 && l.gaveUp >= 1),
    notes: lines.map((l) => `${l.pol}: waited ${l.waited} decision(s), enter ${l.enter}, gave up ${l.gaveUp}`).join(' · ') });
}

// ---- Part 5: INERTNESS -------------------------------------------------------------------------------------------------
// ⛔ THE PINS, DECLARED rather than read off a run (V3's rule). The opening is §14d.6's; R3a's leg is §30's; M15 → M24
// and Something Tree's S01–S05 were MEASURED at the pre-V5 head `f37b2029f` in a control worktree (the record says so).
const OPEN_PIN = { gs: 6718, hashGame: '82eee26f947b2b2e' };
// ⛔ RE-RECORDED BY R3b-2, AND THE MOVE IS A TABLE ENTRY RATHER THAN A REGRESSION. This leg runs 12,000 ticks
// from `all/M22.json` (30618 → 42618) — ALL of it past M21, which is where PTR's row 3 gains its second active
// member — so R3b-2's cycle entry in `games-auto/ptr.js` is live for the whole of it. CI at `3842e441a` is what
// caught the move, and the new value was reproduced TWICE on the local box (`fceef65ba0f59011`, 42618 both runs).
// WHAT IT BOUGHT, which is why the pin moves rather than the table: the old pin's run entered H12 twice, gave up
// once and never completed it; this one enters THIRTEEN times, gives up eleven, and **COMPLETES H12 — M25 at
// 35176** — ending with 8797 Hindrance Spirit and 1807 total quirks against R3a's 1065. ⚠ The OPENING
// (6718 / `82eee26f947b2b2e`) and M15 → M24 (30736 / `b73aef45c9ce7d08`, every mark to the second) are UNMOVED in
// the same CI run — the cycle is dormant until `h` unlocks — so this is the one pin the entry touches.
// ⛔ RE-RECORDED AGAIN BY R3c PART 1, AS DATA: the dead-member rule's default reading moved to `high-act` (gate R3c-1,
// CI run 35566730632). CI run 35567293573 at `f9480d21e` measured 42618 / `fb935758c4cc4f64` against the old
// `fceef65ba0f59011` — enter/exit/gaveUp 13/2/11 UNCHANGED — and it is the ONLY pin the adoption moved: the opening,
// M15 → M24 (`b73aef45c9ce7d08`), R3a's M22 pin, the R3b/R3b-2 inertness rows and the M1 roster all held in that run.
const R3A_PIN = { gs: 42618, hashGame: 'fb935758c4cc4f64', ch: '13/2/11' };
// measured at `f37b2029f` (pre-V5), 2026-09-20, in a control worktree — M24's hash is also the `all/M24` fixture's own
const M24_PIN = { gs: 30736, hashGame: 'b73aef45c9ce7d08', marks: { M16: 17058, M17: 23492, M18: 25598, M19: 25937, M20: 26612, M21: 28058, M22: 30618, M23: 30683, M24: 30736 } };
// ⛔ RE-RECORDED BY R3c PART 0, AS DATA, AND THE CAUSE IS A RULING, NOT A REGRESSION: Something Tree's automation
// table was DELETED (⚖ user 2026-09-21, "We can discard the Something Tree data" → "delete its automation table"), so
// this leg is now the generality control for the DERIVED defaults. Old: 579 / `524822d719ceea18`, S01–S05 at
// 6 · 308 · 309 · 399 · 579 under the table. New, measured twice equal at R3c: the leg runs its whole 3000 ticks and
// reaches S01 ONLY (6) — the derived `reset:unlock` = `gain>=2x` (a NORMAL layer, exponent 0.1) fires 7 times and then
// never again, so unlock:upg:12 (1e5 Unlock Points) never comes; `reset:unlock=always` alone restores every mark
// (455 · 456 · 507 · 901). A finding about the DERIVATION, which is what this control now exists to watch.
const S05_PIN = { gs: 3000, hashGame: '03c4ee9de249916b', marks: { S01: 6, S02: null, S03: null, S04: null, S05: null } };
// the record's SHAPE as R3b-1 left it, measured at `f37b2029f` (gates-r3b part 5's L2 row) — V5 adds NOTHING here
const RT_KEYS = ['lastReset', 'loopNo', 'ranAt', 'stats'];
const AU_KEYS = ['achievements', 'armLocked', 'buyables', 'challenges', 'clickables', 'disclosed', 'edits', 'features', 'milestones', 'points', 'primeMiles', 'spentOnBuyables', 'unlocked', 'upgrades'];
async function part5() {
  const KEYS = `({rt: Object.keys(tmtLoader.runtimeState()).sort(), au: Object.keys(player.au).sort(), edits: JSON.stringify(player.au.edits), ch: tmtLoader.hookStats().challenges})`;
  const [open, m24, r3a, st] = await Promise.all([
    runJob({ profile: 'all', diff: 1, ticks: 8000, ladder: PTR_LADDER, to: 'M12', stall: 1000000, eval: KEYS }),
    runJob({ profile: 'all', diff: 1, ticks: 16000, ladder: PTR_LADDER, to: 'M24', 'from-snapshot': SNAP('ptr', 'M15'), stall: 1000000, 'wall-ms': 600000 }),
    runJob({ profile: 'all', diff: 1, ticks: 12000, 'from-snapshot': SNAP('ptr', 'M22'), stall: 1000000, 'wall-ms': 600000, eval: KEYS }),
    (async () => {
      const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v5-')), 'r.json');
      await new Promise((res) => { const c = spawn(process.execPath, [path.join(REPO, 'tools/harness/run.mjs'), 'something', '--json', out, '--profile', 'all', '--diff', '1', '--ticks', '3000', '--ladder', path.join(REPO, 'tools/harness/ladder/something.json'), '--to', 'S05', '--stall', '1000000'], { cwd: REPO, stdio: 'ignore' }); c.on('exit', res); });
      try { return JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { return { ok: false }; }
    })(),
  ]);
  const gsOf = (r, m) => (r.marks && r.marks[m] ? r.marks[m].gameSeconds : null);
  const e = open.eval || {};
  row({ gate: 'V5-5 the OPENING: a fresh game to M12, nothing chosen', id: 'ptr', leg: '8000 ticks, diff 1, profile all', ticks: open.ticks, gameSeconds: open.gameSeconds, hash: open.hashGame,
    ok: open.gameSeconds === OPEN_PIN.gs && open.hashGame === OPEN_PIN.hashGame && JSON.stringify(e.rt) === JSON.stringify(RT_KEYS) && JSON.stringify(e.au) === JSON.stringify(AU_KEYS) && e.edits === '{}',
    notes: `${open.gameSeconds} / ${open.hashGame} (pin ${OPEN_PIN.gs} / ${OPEN_PIN.hashGame}); runtimeState keys [${e.rt}] (want [${RT_KEYS}]); player.au keys [${e.au}] (want R3b-1's ${AU_KEYS.length}); edits ${e.edits}` });
  row({ gate: 'V5-5 M15 → M24, the rung as it ships', id: 'ptr', leg: 'from all/M15, stop at M24', ticks: m24.ticks, gameSeconds: m24.gameSeconds, hash: m24.hashGame,
    ok: m24.gameSeconds === M24_PIN.gs && m24.hashGame === M24_PIN.hashGame && Object.entries(M24_PIN.marks).every(([m, v]) => v === null || gsOf(m24, m) === v),
    notes: `${m24.gameSeconds} / ${m24.hashGame} (pin ${M24_PIN.gs} / ${M24_PIN.hashGame}); marks ${['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'].map((m) => `${m} ${gsOf(m24, m) ?? '—'}`).join(' · ')}` });
  const r3e = r3a.eval || {}, c = r3e.ch && r3e.ch['challenges:h'];
  row({ gate: 'V5-5 R3a’s leg from all/M22 — the give-up rule as it ships (R = 2×, the derived default)', id: 'ptr', leg: 'from all/M22, 12000 ticks', ticks: r3a.ticks, gameSeconds: r3a.gameSeconds, hash: r3a.hashGame,
    ok: r3a.gameSeconds === R3A_PIN.gs && r3a.hashGame === R3A_PIN.hashGame && c && `${c.enter}/${c.exit}/${c.gaveUp}` === R3A_PIN.ch,
    notes: `${r3a.gameSeconds} / ${r3a.hashGame} (pin ${R3A_PIN.gs} / ${R3A_PIN.hashGame}); enter/exit/gaveUp ${c ? `${c.enter}/${c.exit}/${c.gaveUp}` : '—'} (pin ${R3A_PIN.ch}); runtimeState keys [${r3e.rt}] — R3a's two blocks and nothing of V5's` });
  row({ gate: 'V5-5 Something Tree S01–S05 on the DERIVED defaults (no table since R3c)', id: 'something', leg: '3000 ticks to S05', ticks: st.ticks, gameSeconds: st.gameSeconds, hash: st.hashGame,
    ok: !!st.ok && st.gameSeconds === S05_PIN.gs && st.hashGame === S05_PIN.hashGame && Object.entries(S05_PIN.marks).every(([m, v]) => gsOf(st, m) === v),
    notes: `${st.gameSeconds} / ${st.hashGame} (pin ${S05_PIN.gs} / ${S05_PIN.hashGame}); marks ${['S01', 'S02', 'S03', 'S04', 'S05'].map((m) => `${m} ${gsOf(st, m) ?? '—'}`).join(' · ')}` });
  const n = rows.filter((r) => r.ok).length;
  row({ gate: 'V5-5 VERDICT: nothing chosen ⇒ nothing moved', id: 'both', ok: n === rows.length, notes: `${n}/${rows.length}. V5 adds to the SAVE only \`player.au.edits[<id>].args\` (a side parameter a player typed) and to \`runtimeState()\` only object records inside \`challengeFailed\` (a new retry condition in force) — neither exists unless chosen` });
}

// ---- Part 7: the ROSTER ------------------------------------------------------------------------------------------------
async function part7(browser, base, ids) {
  const judged = [], abstained = [];
  for (const id of ids) {
    let r = null;
    try {
      const { context, page, errs } = await openAdvanced(browser, base, id, { width: 390, mobile: true, warm: 0 });
      try {
        const ready = await page.evaluate(() => !!(window.tmtLoader && tmtLoader.ready && tmtLoader.automation));
        if (!ready) { abstained.push(`${id}: the automation page did not come up`); continue; }
        r = await page.evaluate(MEASURE);
        r.errs = errs.length;
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    const ok = r.past.length === 0 && r.scrollW <= r.vw && r.roots.length >= 2 && r.roots.every((x) => x.w >= x.pane - 1);
    judged.push({ id, ok, r });
    if (!ok) row({ gate: 'V5-7 roster: the Advanced tab at 390 px', id, leg: '?mobile=1, profile all', ok: false, notes: JSON.stringify({ past: r.past.slice(0, 4), roots: r.roots, scrollW: r.scrollW }).slice(0, 600) });
  }
  const red = judged.filter((x) => !x.ok);
  const fonts = {};
  for (const x of judged) fonts[x.r.font] = (fonts[x.r.font] || 0) + 1;
  row({ gate: 'V5-7 the ROSTER: the Advanced tab at 390 px — 0 interactive elements past the viewport on every game judged', id: `${judged.length} judged`, leg: `${ids.length} assigned`,
    ok: red.length === 0 && judged.length > 0,
    notes: `judged ${judged.length}, RED ${red.length} (${red.map((x) => x.id).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ' — ' + abstained.join(' · ') : ''} ⚠ (counted, and NOT given a cause); `
      + `${judged.reduce((s, x) => s + x.r.n, 0)} interactive element(s) measured; the tab's font: ${JSON.stringify(fonts)}` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v5-part7${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- entry -----------------------------------------------------------------------------------------------------------
const NODE = { 3: part3, '3s': part3s, 5: part5 };
const PAGE = { 1: part1, 2: part2, 7: part7 };
if (!NODE[PART] && !PAGE[PART]) { console.error(`unknown --part ${PART} (${[...Object.keys(NODE), ...Object.keys(PAGE)].join(', ')})`); process.exit(2); }
if (NODE[PART]) await NODE[PART]();
else {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const server = await startServer(REPO);
  try {
    if (PART === '7') {
      const all = GAMES();
      let ids = a._.length ? a._ : all;
      if (a.shard) { const { i, n } = parseShard(a.shard); ids = assignShards(all, n)[i - 1]; }
      await part7(browser, server.url, ids);
    } else await PAGE[PART](browser, server.url);
  } finally { await browser.close(); server.stop(); }
}

if (!a['no-write']) writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v5-part${PART}-last.json`), { date: new Date().toISOString(), commit, dirty, rows });
const green = rows.filter((r) => r.ok).length;
console.log(`\nVERDICT: rows ${green}/${rows.length} of ${ROWS[PART] ?? '?'} expected`);
if (!a['no-summary']) appendSection({ title: `V5 the Advanced tab — part ${PART}`, commit, dirty, rows, slug: `gates-v5-part${PART}` });
if (a.assert && (green !== rows.length || rows.length !== ROWS[PART])) process.exit(1);
