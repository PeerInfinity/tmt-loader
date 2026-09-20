// The V1 gates — the automation's REASONS (plan §16), and the `Advanced` subtab of the `au` tab that shows them.
//   node gates-v1.mjs --part 1|2|3|4|6 [--no-summary] [--pool N] [--shard i/N]
//
// Part 1  every code in the vocabulary WITNESSED BY NAME, and the witness table said out loud: which game, which
//         fixture, which leg — or "constructed", with the unit test that constructs it. `unknown` at any count is a
//         failure, and so is a code nothing witnesses at all.
// Part 2  REASON ≡ DECISION. Over whole legs, for every feature and every tick: `last.code` is an `acted:` one if
//         and only if that feature's action counter rose on that tick. Checked IN the run (a `--until` predicate
//         that latches a violation), not from the end state.
// Part 3  INERTNESS. The M15 → M16 leg twice, ending on the pre-slice `hashGame`; and `explainStats().formats === 0`
//         over the whole of it — a headless run must never turn a number into text.
// Part 4  T1. A page run that switches `Simple → Advanced → Simple` mid-run ends on the same `hashGame` as one that
//         never switches. The au tab's VIEW state is not game state.
// Part 6  THE ROSTER. `?automation=1` on every game, `Advanced` selected: the tab renders, the block count equals
//         the feature count, no `unknown`, no console error. Judged / abstained / red, with the abstentions named.
//
// (Part 5 — the page legs for the two reference games — lives in `gates-a1 --part 2`, beside the Simple-tab legs it
// must not disturb. A second battery opening the same tab would be a second answer to the same question.)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, headCommit, treeDirty, writeJSON, entryOnly, gateCoverage, coverageLine, assignShards, parseShard } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'assert']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 400)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH, for `--assert` (CI). A battery that dies part-way through prints fewer rows,
// and fewer rows is fewer reds: exiting 0 because nothing that RAN failed is the same green as a full pass. These
// are deliberately the exact counts each part emits today, not a lower bound — a part that grows a leg has to come
// here and say so, which is the point. (Same reasoning as `gateCoverage`'s per-game row-count check for `gates-a1`;
// this battery's rows are not per-game, so it needs its own floor.)
const ROWS = { 1: 9, 2: 3, 3: 2, '3p': 2, 4: 4, 6: 1 };

const SNAP = (id, m) => `tools/harness/snapshots/${id}/all/${m}.json`;
// M15 → M16: R1′'s own leg, and the one long ptr leg V1's inertness is measured on (plan §14d).
const M16_PIN = { ticks: 24179, hashGame: '9e2eadb7c58c0078', hash: '2495123714005471' };

// ---- a pool of run.mjs children ---------------------------------------------------------------------------------
const POOL = Number(a.pool || 3);
let running = 0;
const queue = [];
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v1-')), 'r.json');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out];
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null || v === false) continue;
      if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
    }
    const t0 = Date.now();
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => {
      running--;
      let r;
      try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { r = { ok: false, error: `no result: ${err.slice(-400)}` }; }
      r.wallMs = Date.now() - t0;
      resolve(r);
      pump();
    });
  }
}
const job = (id, o) => new Promise((resolve) => { queue.push({ id, o, resolve }); pump(); });

// ---- Part 1: the witness table ----------------------------------------------------------------------------------
// ⚠ EVERY CODE, BY NAME. A leg's `explain_stats.codes` is a census of the RUN, not of its last tick, so a code seen
// for four hundred ticks and then replaced still counts — which is the only way "witnessed" can mean anything.
//
// ⛔ THE CODES NO FIXTURE CAN SHOW, and why, measured: ptr's table leaves `challenges` and `clickables` at policy
// `off` (so the four challenge codes, `blocked:exit` and the two clickable codes never occur); neither table uses
// `buy-unless-saving` (`holding:saving`) or `keepsUpgrades`; no table on the roster carries a `gates` entry
// (`blocked:gate`); and `armed` needs a locked feature toggled on, which is a press. Those are CONSTRUCTED in
// `loader/reasons.test.mjs` over a stub engine, which this part runs and requires green — a list of codes the unit
// test claims to cover is worth nothing unless the test passed in the same run that quotes it.
const CONSTRUCTED = [
  'blocked:gate', 'off:policy', 'blocked:enter', 'blocked:exit', 'in-challenge',
  'acted:challenge-enter', 'acted:challenge-exit', 'waiting:when', 'acted:clickables',
  'waiting:milestone', 'acted:toggles', 'holding:saving', 'waiting:purchase', 'waiting:gain', 'armed',
  // V2's three. No fixture can show them either: no table names `rate-peak` or the `stall` modifier, and the
  // ARBITER's state needs TWO reset features stalled in the same tick, which no recorded state has. All three are
  // constructed in `loader/reasons.test.mjs`, which this part RUNS and requires green.
  'waiting:rate', 'waiting:stall-clock', 'waiting:stall-yield',
];
const LEGS = [
  { key: 'ptr fresh 400×1 (profile all)', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 400, explain: true } },
  { key: 'ptr fresh 400×1 (profile saved — nothing turned on)', id: 'ptr', o: { profile: 'saved', diff: 1, ticks: 400, explain: true } },
  { key: 'ptr all/M10 + 600×1', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 600, 'from-snapshot': SNAP('ptr', 'M10'), explain: true } },
  { key: 'ptr all/M11 + 600×1', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 600, 'from-snapshot': SNAP('ptr', 'M11'), explain: true } },
  { key: 'ptr all/M15 + 600×1', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 600, 'from-snapshot': SNAP('ptr', 'M15'), explain: true } },
  { key: 'ptr fresh 400×1, --auto-opt exclude=buyables:t', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 400, 'auto-opt': 'exclude=buyables:t', explain: true } },
  { key: 'something fresh 600×1 (profile all)', id: 'something', o: { profile: 'all', diff: 1, ticks: 600, explain: true } },
];

async function part1() {
  const legs = await Promise.all(LEGS.map((L) => job(L.id, L.o).then((r) => ({ L, r }))));
  const first = {};            // code → the first leg that witnessed it
  for (const { L, r } of legs) {
    const seen = (r.explain_stats && r.explain_stats.codes) || {};
    // `off:excluded` is never a DECISION — an excluded feature is not registered and nothing decides for it. It is
    // witnessed on `explain()`'s own row for that feature, which is the only place it can be.
    const fromRows = {};
    for (const x of r.explain || []) if (x.last && !seen[x.last.code]) fromRows[x.last.code] = true;
    const added = [];
    for (const c of [...Object.keys(seen), ...Object.keys(fromRows)]) if (!first[c]) { first[c] = L.key; added.push(c); }
    row({ gate: `V1-1 leg: ${L.key}`, id: L.id, leg: `${Object.keys(seen).length + Object.keys(fromRows).length} code(s)`, ok: !!r.ok && !seen.unknown, ticks: r.ticks, hash: r.hashGame,
      notes: `codes ${JSON.stringify(seen)}; rows-only ${JSON.stringify(Object.keys(fromRows))}; NEW here: ${added.join(', ') || 'none'}; formats ${r.explain_stats?.formats}` });
  }
  // the unit tests that construct the rest — run in the same process tree as the claim they support
  const unit = await new Promise((resolve) => {
    const c = spawn(process.execPath, ['--test', 'loader/reasons.test.mjs'], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    c.stdout.on('data', (d) => { o += d; });
    c.stderr.on('data', (d) => { o += d; });
    c.on('exit', (code) => resolve({ code, out: o }));
  });
  const pass = (/^# pass (\d+)/m.exec(unit.out) || [])[1];
  const fail = (/^# fail (\d+)/m.exec(unit.out) || [])[1];
  row({ gate: 'V1-1 the constructed codes: loader/reasons.test.mjs (stub engine)', id: '—', leg: `${CONSTRUCTED.length} code(s) constructed`, ok: unit.code === 0 && fail === '0',
    notes: `${pass} passed, ${fail} failed; constructs ${CONSTRUCTED.join(', ')}` });

  // …and the verdict: the union covers the whole vocabulary, nothing is `unknown`, nothing is unwitnessed.
  const all = Object.keys(await codeTable());
  const witnessed = new Set([...Object.keys(first), ...(unit.code === 0 ? CONSTRUCTED : [])]);
  const missing = all.filter((c) => c !== 'unknown' && !witnessed.has(c));
  const claimedButSeen = CONSTRUCTED.filter((c) => first[c]);   // a note, not a failure: a fixture found one anyway
  const table = all.map((c) => `${c} ← ${first[c] || (CONSTRUCTED.includes(c) ? 'CONSTRUCTED (reasons.test.mjs)' : c === 'unknown' ? 'never, by design' : 'NOTHING')}`);
  row({ gate: 'V1-1 EVERY code witnessed by name', id: '—', leg: `${all.length} codes`, ok: missing.length === 0 && !first.unknown,
    notes: `unwitnessed: ${missing.join(', ') || 'none'}; unknown witnessed: ${!!first.unknown}; ⚠ listed as constructed but a fixture showed it too: ${claimedButSeen.join(', ') || 'none'}\n  ${table.join('\n  ')}` });
}
/** The vocabulary itself, read from the loader rather than copied into this file. */
async function codeTable() {
  const r = await job('ptr', { ticks: 0, eval: 'tmtLoader.reasonCodes()' });
  if (!r.ok || !r.eval) throw new Error('could not read tmtLoader.reasonCodes(): ' + JSON.stringify(r.error || r.eval));
  return r.eval;
}

// ---- Part 2: reason ≡ decision ----------------------------------------------------------------------------------
// ⛔ CHECKED INSIDE THE RUN, TICK BY TICK. The end state cannot answer this: `f.last` holds ONE decision, and a
// disagreement four thousand ticks ago leaves no trace in it. `--until` runs after every tick, so the comparison
// runs there and LATCHES — the run stops on the first violation and `__v1` carries what it was.
// ⛔ AND ITS BASELINE IS SAMPLED BEFORE THE FIRST TICK, NOT ON THE FIRST CHECK. The first cut let `prev` start
// empty, which is right for a fresh game and WRONG for a resumed one: `restoreRuntime` brings the snapshot's action
// counts back, so on tick 1 every restored counter reads as "it rose" against an empty baseline. Measured: the
// M15 → M16 leg went red at its very first tick on `reset:sb` (`before: 0, after: 1`) — an artifact of the probe,
// not a disagreement in the code. `--predicates` runs once after `load()` and after the runtime restore, which is
// exactly the hook a baseline needs; `seeded` is asserted in the row so a run where it did not happen cannot pass.
const EQUIV_SEED = `(function(){
  var a = tmtLoader.hookStats().actions, p = {};
  for (var k in a) p[k] = a[k];
  globalThis.__v1 = { prev: p, checked: 0, ticks: 0, bad: null, seeded: true, base: JSON.parse(JSON.stringify(p)) };
  return true;
})()`;
const EQUIV_SRC = `(function(){
  var T = tmtLoader, g = globalThis.__v1 || (globalThis.__v1 = { prev: {}, checked: 0, ticks: 0, bad: null, seeded: false });
  var acts = T.hookStats().actions;
  g.ticks++;
  for (var i = 0; i < T.features.length; i++) {
    var f = T.features[i];
    var rose = (acts[f.id] || 0) > (g.prev[f.id] || 0);
    var said = !!(f.last && f.last.code.indexOf('acted:') === 0);
    g.checked++;
    if (said !== rose) { g.bad = { id: f.id, code: f.last ? f.last.code : null, before: g.prev[f.id] || 0, after: acts[f.id] || 0, tick: T.ticks, said: said, rose: rose }; }
  }
  g.prev = {};
  for (var k in acts) g.prev[k] = acts[k];
  return !!g.bad;
})()`;
const EQUIV_LEGS = [
  { key: 'ptr all/M15 → M16 (the R1′ leg)', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 9000, 'from-snapshot': SNAP('ptr', 'M15') } },
  { key: 'ptr fresh 3000×1', id: 'ptr', o: { profile: 'all', diff: 1, ticks: 3000 } },
  { key: 'something fresh 3000×1', id: 'something', o: { profile: 'all', diff: 1, ticks: 3000 } },
];
async function part2() {
  const seed = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v1-seed-')), 'predicates.json');
  fs.writeFileSync(seed, JSON.stringify([['v1-equiv-baseline', EQUIV_SEED]]));
  const out = await Promise.all(EQUIV_LEGS.map((L) => job(L.id, { ...L.o, predicates: seed, until: EQUIV_SRC, eval: 'globalThis.__v1' }).then((r) => ({ L, r }))));
  for (const { L, r } of out) {
    const g = r.eval || {};
    // ⚠ `g.ticks` counts the ticks THIS leg ran; `r.ticks` continues from the snapshot's count on a resumed leg, so
    // they are equal only for a fresh game. What must hold on both is that every feature was compared on every tick.
    const feats = (r.features || []).length;
    const ok = !!r.ok && r.until && r.until.met === false && r.until.errors === 0 && !g.bad
      && g.seeded === true && g.ticks > 0 && feats > 0 && g.checked === g.ticks * feats;
    row({ gate: 'V1-2 reason ≡ decision (every feature, every tick)', id: L.id, leg: L.key, ok, ticks: r.ticks, hash: r.hashGame,
      notes: `${g.checked} feature-ticks = ${g.ticks} tick(s) × ${feats} features (run ended at tick ${r.ticks}); baseline seeded before tick 1: ${g.seeded}, from ${JSON.stringify(g.base)}; violation ${JSON.stringify(g.bad)}; predicate errors ${r.until?.errors}; actions ${JSON.stringify(r.hook?.actions)}` });
  }
}

// ---- Part 3: inertness ------------------------------------------------------------------------------------------
async function part3() {
  const o = { profile: 'all', diff: 1, ticks: 12000, 'from-snapshot': SNAP('ptr', 'M15'), ladder: 'tools/harness/ladder/ptr.json', to: 'M16' };
  const [A, B] = await Promise.all([job('ptr', o), job('ptr', o)]);
  const twice = A.ticks === B.ticks && A.hashGame === B.hashGame && A.hash === B.hash && JSON.stringify(A.hook?.actions) === JSON.stringify(B.hook?.actions);
  row({ gate: 'V1-3 the M15 → M16 leg is TWICE EQUAL and lands on the PRE-SLICE hashGame', id: 'ptr', leg: 'profile all, diff 1', ok: !!A.ok && !!B.ok && twice && A.ticks === M16_PIN.ticks && A.hashGame === M16_PIN.hashGame,
    ticks: A.ticks, hash: A.hashGame, notes: `run 1 ${A.ticks}/${A.hashGame}, run 2 ${B.ticks}/${B.hashGame}; pin ${M16_PIN.ticks}/${M16_PIN.hashGame} (R1′ §14d, measured before V1); action counts equal ${JSON.stringify(A.hook?.actions) === JSON.stringify(B.hook?.actions)}; ${Math.round(A.wallMs / 1000)} s`});
  // ⛔ THE COST GATE IS A COUNTER, NOT A STOPWATCH. A timing row is noise; an absolute ZERO is not something a
  // mutant can satisfy by moving both sides of a comparison. `formats` counts every number this code turns into
  // text, and a headless run that never opens a tab must do that NOT ONCE.
  const st = A.explain_stats || {};
  row({ gate: 'V1-3 a headless run FORMATS NOTHING (the lazy guard)', id: 'ptr', leg: `${A.ticks} ticks`, ok: st.formats === 0 && st.texts === 0 && st.decisions > 0,
    ticks: A.ticks, hash: A.hashGame, notes: `decisions ${st.decisions}, formats ${st.formats}, texts ${st.texts}; ${((A.ticks_ms || 0) / (A.ticks || 1)).toFixed(1)} ms/tick` });
}

// ---- Part 3, the page half: WHERE THE LAZY GUARD ACTUALLY WORKS ---------------------------------------------------
// ⛔⛔ THE BRIEF HAD THIS BACKWARDS, AND THE HEADLESS ZERO DOES NOT TEST IT. The brief (and the planner's own
// "measured after it was written" addendum) said ptr's `temp.js` has NO special case for `tabFormat`, so its
// `display-text` functions run every tick whether the tab is open or not, and 2.7's only when needed. Measured:
//   · **2.2.1 (`ptr`) DOES special-case it** — `updateTempData` (`js/technical/temp.js:96`) skips any key whose
//     name contains `tabformat` / `display` / `description` **whenever `player.tab != layer`**;
//   · **2.7 (`something`) skips `tabFormat` and `content` unconditionally** in `updateTempData` (`:127`) and lists
//     both in `activeFunctions` (`:12`) — they move only through `updateTabFormats()`.
// So in NODE, where the `au` tab is never open, NEITHER engine ever calls the Advanced content function. The
// headless `formats === 0` row is TRUE and is guaranteed by the ENGINES — it says nothing about the guard.
// MEASURED as a mutant: the lazy guard removed leaves `gates-v1 --part 3` at **2/2 green, formats 0**.
//
// The guard's real job is the case the engines do NOT cover: the `au` tab IS the open tab and `Simple` is what the
// player is looking at. ptr then walks the WHOLE `tabFormat` object every `updateTemp()` — both subtabs — so
// `advancedHTML()` is called on every tick of a tab the player is not looking at. That is what this pair measures,
// and it is PAIRED: the same spin with `Advanced` selected MUST format, or the zero above is "nothing ever calls
// it" rather than "the guard works".
const SPIN = (n) => `(function(){ for (var i = 0; i < ${n}; i++) { tmtLoader.tick(1, 10); updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); } return tmtLoader.explainStats().formats; })()`;
async function part3page(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '\u2713' : '\u2717'} ${w}`); };
    const { context, page } = await openGamePage(browser, base, id, '&profile=all');
    try {
      await page.evaluate(() => { showTab('au'); });
      await redraw(page);
      const f = () => page.evaluate(() => tmtLoader.explainStats().formats);
      const a0 = await f(); await page.evaluate(SPIN(20)); const a1 = await f();
      check(a1 - a0 === 0, `au tab OPEN on Simple, 200 ticks with a redraw every 10: ${a1 - a0} format(s) — the Advanced content must not run for a tab nobody is looking at`);
      await selectSub(page, 'Advanced');
      const b0 = await f(); await page.evaluate(SPIN(20)); const b1 = await f();
      check(b1 - b0 > 0, `and with Advanced SELECTED the same spin formats ${b1 - b0} time(s) — so the zero above is the guard, not an absence of callers`);
      await page.evaluate(() => { showTab('none'); });
      const c0 = await f(); await page.evaluate(SPIN(20)); const c1 = await f();
      check(c1 - c0 === 0, `and with the au tab CLOSED (Advanced still selected): ${c1 - c0} format(s)`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 300)); }
    finally { await context.close(); }
    row({ gate: 'V1-3 (page) the lazy guard: the Advanced content runs ONLY when it is on screen', id, leg: 'au tab open, Simple vs Advanced vs closed', ok, notes: notes.join('; ') });
  }
}

// ---- the page --------------------------------------------------------------------------------------------------
async function openGamePage(browser, base, id, q = '') {
  const context = await browser.newContext();
  const errs = [];
  const page = await context.newPage();
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1${q}`, base).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
  await page.evaluate(() => tmtLoader.pause());
  return { context, page, errs };
}
/** The engines redraw `tmp` and (2.7) the tab formats in their OWN interval, not in gameLoop; the page is paused. */
const redraw = (page) => page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
/** Select a subtab the way the engine's own button does — through `player.subtabs`, which is what the button writes. */
const selectSub = async (page, name) => { await page.evaluate((n) => { player.subtabs[tmtLoader.auLayer].mainTabs = n; }, name); await redraw(page); await page.waitForTimeout(120); };

// ---- Part 4: T1 — the subtab is NOT game state -------------------------------------------------------------------
// ⛔ THE TRAP THIS ROW EXISTS FOR. The engines keep the selected subtab in `player.subtabs[layer].mainTabs`, a
// TOP-LEVEL player key that `hashGame` did not exclude. Giving the `au` tab subtabs therefore moved every pinned
// `hashGame` in the repo — and a player switching subtab would move it again mid-run. The fix is one shared
// definition (`tmtLoader.gameState`); this part is what says the fix works, from the PLAYER's side.
//
// ⛔⛔ AND IT IS MEASURED IN NODE, NOT ACROSS TWO PAGE LOADS — MEASURED, after the first cut did it the obvious way
// and went red on both engines. **A page's `hashGame` is not reproducible across two page loads at all.** The
// engines' own interval runs between `load()` and `tmtLoader.pause()`, and what it leaves behind is in `player`:
// on ptr every layer's `first` differed (`p.first` 0.434 against 0.394), on something `timePlayed` (300.292
// against 300.324), `resetTime` and, through them, `points`. A control arm that only REDREW — same ticks, no
// subtab touched — came back different from the plain arm too, which is the tell: the instrument was measuring
// page-load timing, and a subtab could have moved anything at all without being visible in it.
//
// So the A/B runs in Node, where the tick loop is the only clock, and the PAGE gets the one question a single page
// can answer without a second load: does selecting a subtab, with no ticks in between, move `hashGame`?
const SUB_SET = (n, at) => `(function(){
  if (tmtLoader.ticks === ${at}) player.subtabs[tmtLoader.auLayer].mainTabs = ${JSON.stringify(n)};
  return false;
})()`;
const SUB_BOTH = `(function(){
  var k = tmtLoader.auLayer;
  if (tmtLoader.ticks === 100) player.subtabs[k].mainTabs = 'Advanced';
  if (tmtLoader.ticks === 200) player.subtabs[k].mainTabs = 'Simple';
  return false;
})()`;
async function part4node() {
  for (const id of ['ptr', 'something']) {
    const base = { profile: 'all', diff: 1, ticks: 300 };
    const ev = "({ sub: player.subtabs[tmtLoader.auLayer].mainTabs })";
    const [ctl, adv, both] = await Promise.all([
      job(id, { ...base, eval: ev }),
      job(id, { ...base, until: SUB_SET('Advanced', 100), eval: ev }),
      job(id, { ...base, until: SUB_BOTH, eval: ev }),
    ]);
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    check(ctl.ticks === 300 && adv.ticks === 300 && both.ticks === 300, `all three arms ran 300 ticks (${ctl.ticks}/${adv.ticks}/${both.ticks})`);
    check(adv.eval?.sub === 'Advanced' && both.eval?.sub === 'Simple' && ctl.eval?.sub === 'Simple',
      `the arms ended on the subtabs they were driven to (control ${ctl.eval?.sub}, switched ${adv.eval?.sub}, round trip ${both.eval?.sub})`);
    check(ctl.hashGame === adv.hashGame && ctl.hashGame === both.hashGame,
      `hashGame is the SAME in all three: ${ctl.hashGame} / ${adv.hashGame} / ${both.hashGame}`);
    // ⛔ and the row is not vacuous: leaving the tab on Advanced really did write the save.
    check(ctl.hash !== adv.hash, `the FULL hash DOES move when the tab is left on Advanced (${ctl.hash} → ${adv.hash}) — so the subtab is genuinely in the save, and the equality above is a result`);
    check(ctl.hash === both.hash, `…and comes back when the player switches back (round trip ${both.hash} = control ${ctl.hash})`);
    row({ gate: 'V1-4 (node) switching subtab does not move hashGame', id, leg: '300×1, profile all, three arms', ok, ticks: ctl.ticks, hash: ctl.hashGame, notes: notes.join('; ') });
  }
}
// The page's half: ONE page, ONE state, the subtab selected by a REAL CLICK on the engine's own subtab button, and
// the two hashes read with NOTHING in between.
//
// ⛔⛔ AND NOTHING MEANS NOTHING — NOT EVEN A REDRAW. MEASURED on `something`, after the first cut called
// `updateTemp()` around each selection the way the rest of this file does: `updateTemp()` IS NOT INERT on that
// engine. Setting `player.subtabs.au.mainTabs` alone moves **nothing at all** in the game state (the exclusion
// works); the very next `updateTemp(); updateTabFormats()` moves **`player.unlock.nextLayerProgress`**
// (0.4894316062684439 → 0.4930765702896837). That is this repo's standing "no `updateTemp()` between ticks"
// constraint showing up in a new place, and it is exactly the shape of a probe that perturbs what it measures: the
// leg reads red, the subtab is innocent, and the instrument wrote the difference. The floor itself is stable —
// four reads 150 ms apart with no switch at all give ONE hash on both engines — so once the redraws are gone the
// comparison is a real one. Whether the tab RENDERS is a different question, and `gates-a1 --part 2` answers it.
async function part4page(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    const { context, page } = await openGamePage(browser, base, id, '&profile=all');
    try {
      await page.evaluate(() => { showTab('au'); });
      await redraw(page);
      await page.evaluate(() => tmtLoader.tick(1, 200));
      const read = () => page.evaluate(async () => ({ g: await tmtLoader.hash(tmtLoader.gameState), f: await tmtLoader.hash(), sub: player.subtabs[tmtLoader.auLayer].mainTabs }));
      // the CONTROL first: two reads with nothing between them. A leg that compares two reads has to know its floor.
      const z0 = await read();
      await page.waitForTimeout(200);
      const z1 = await read();
      check(z0.g === z1.g && z0.f === z1.f, `the floor is still: two reads 200 ms apart with no switch give ${z0.g} / ${z1.g}`);
      // ⚠ THE PRESS IS BOUNDED AND IT SAYS WHICH PATH IT TOOK. The subtab buttons are `button.tabButton` and are
      // VISIBLE on both engines (measured), but Playwright's actionability wait timed out on `something` — the same
      // shape U6 met on `the-shenanigans-tree-rewritten`, where a toast intercepts pointer events and an unbounded
      // click spent 30 s and then threw. So: a real click, bounded; on a timeout, the same element's own click
      // handler dispatched directly, which is still the ENGINE's handler and not a state poke. The note records it.
      const how = [];
      const clickSub = async (name) => {
        const b = page.locator('#app button.tabButton').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first();
        try { await b.click({ timeout: 4000 }); how.push(`${name}: click`); }
        catch (e) { await b.dispatchEvent('click'); how.push(`${name}: dispatched (the real click did not land: ${String(e.message).split('\n')[0].slice(0, 60)})`); }
        await page.waitForTimeout(200);
      };
      const a = await read();
      await clickSub('Advanced');
      const b = await read();
      await clickSub('Simple');
      const c = await read();
      check(a.sub === 'Simple' && b.sub === 'Advanced' && c.sub === 'Simple', `the engine's own subtab buttons took the tab ${a.sub} → ${b.sub} → ${c.sub} (${how.join('; ')})`);
      check(a.g === b.g && a.g === c.g, `hashGame unmoved across the whole switch: ${a.g} / ${b.g} / ${c.g}`);
      check(a.f !== b.f, `the FULL hash moved on the way in (${a.f} → ${b.f}) — the engine really wrote the selection, so the equality above is a result`);
      check(a.f === c.f, `and came back on the way out (${c.f})`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 300)); }
    finally { await context.close(); }
    row({ gate: 'V1-4 (page) a real subtab click does not move hashGame', id, leg: 'one page, 200 ticks, no updateTemp between the reads', ok, notes: notes.join('; ') });
  }
}

// ---- Part 6: the roster (T2's witness) ---------------------------------------------------------------------------
// ⛔ WHAT T2 ACTUALLY MEASURED, and what it did not. 171 of 171 games REGISTER `Vue.component("tab-buttons")`. That
// is a registration count, not a rendering result: before this row, no gate had opened an OBJECT-form `au` tab on
// any game but the two with an `auto` table. This is the row that turns the registration into a result.
async function part6(browser, base, ids) {
  const judged = [], abstained = [];
  for (const id of ids) {
    let r = null;
    try {
      const { context, page, errs } = await openGamePage(browser, base, id, '&profile=all');
      try {
        const ready = await page.evaluate(() => !!(window.tmtLoader && tmtLoader.ready && tmtLoader.automation && tmtLoader.features));
        if (!ready) { abstained.push(`${id}: the automation page did not come up`); await context.close(); continue; }
        await page.evaluate(() => { showTab('au'); });
        await redraw(page);
        await page.evaluate(() => tmtLoader.tick(1, 60));
        // ⛔ THE ERROR CHECK IS PAIRED, NOT ABSOLUTE — and the first two cuts of it were both wrong, in different
        // ways, which is why it is spelled out.
        //   (i) ABSOLUTE was wrong: `the-pro-tree` reds on its own 404s and `bobbit-s-tech-tree` on its own
        //       `player is not defined`. G1 and M1 carry the manifest's `load.known` allowances for exactly that
        //       noise; a new gate that forgets them re-discovers it as its own failure.
        //   (ii) A BASELINE TAKEN BEFORE THE SELECTION was also wrong, because selecting a subtab COSTS A REDRAW
        //       and a redraw is not free on every game. MEASURED on `arctree`: it logs "We meet an NaN at
        //       (e^NaN)NaN" 68 times during its own load and ONE MORE on every `updateTemp()` — while still on
        //       Simple, with nothing of ours involved. `tmtLoader.explain()` on its own adds ZERO.
        // So the control is a redraw that changes nothing, taken on the same page immediately before: the Advanced
        // selection must cost no more console noise than a plain redraw already does. Both numbers are recorded.
        const b0 = errs.length;
        await redraw(page);
        await page.waitForTimeout(80);
        const perRedraw = errs.length - b0;
        const before = errs.length;
        await selectSub(page, 'Advanced');
        r = await page.evaluate(() => {
          const T = window.tmtLoader, rows = T.explain();
          const text = document.querySelector('#app').innerText || '';
          // one block per feature that is not collapsed, one collapsed line per feature that is — together, every row
          // ⛔ `.tmtl-block` since V3 — the stall-watch panel also has a left border, so a style-substring match
          // counts it as a feature block (see gates-a1 --part 2, which went red on exactly that).
          const blocks = document.querySelectorAll('#app div.tmtl-block').length;
          const collapsed = rows.filter((x) => x.state === 'locked' || x.state === 'excluded').length;
          return { features: T.features.length, rows: rows.length, blocks, collapsed, unknown: rows.filter((x) => x.last && x.last.code === 'unknown').map((x) => x.id),
            sub: player.subtabs.au.mainTabs, subs: Object.keys(tmp.au.tabFormat), rendered: text.indexOf('What each feature decided') >= 0, len: text.length,
            scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth };
        });
        r.errsBefore = b0;
        r.perRedraw = perRedraw;
        r.newErrs = errs.slice(before, before + 3);
        r.extra = (errs.length - before) - perRedraw;   // what the SUBTAB cost beyond a plain redraw
        r.errs = errs.slice(0, 2);
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    // ⚠ THREE SUBTABS SINCE V3 (`Progress`), and `Simple` FIRST is the load-bearing half: both engines select
    // `Object.keys(tabFormat)[0]`. A fourth (P2's round log) joins the same way and this literal moves again.
    const ok = r.rendered && r.sub === 'Advanced' && JSON.stringify(r.subs) === '["Simple","Advanced","Progress"]'
      && r.blocks === r.rows - r.collapsed && r.unknown.length === 0 && r.extra <= 0 && r.scrollX === false;
    judged.push({ id, ok, r });
    if (!ok) row({ gate: 'V1-6 roster: the Advanced subtab', id, leg: 'profile all, 60 ticks', ok: false, notes: JSON.stringify(r) });
  }
  const red = judged.filter((x) => !x.ok);
  row({ gate: 'V1-6 the ROSTER: every game\'s Advanced subtab renders its own features', id: `${judged.length} judged`, leg: `${ids.length} assigned`, ok: red.length === 0 && judged.length > 0,
    notes: `judged ${judged.length}, RED ${red.length} (${red.map((x) => x.id).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ': ' + abstained.join(' · ') : ''}; total feature rows ${judged.reduce((s, x) => s + x.r.rows, 0)}, blocks ${judged.reduce((s, x) => s + x.r.blocks, 0)}, collapsed ${judged.reduce((s, x) => s + x.r.collapsed, 0)}; games carrying errors of their OWN before the subtab was touched: ${judged.filter((x) => x.r.errsBefore > 0).length}, and ${judged.filter((x) => x.r.perRedraw > 0).length} that log on EVERY redraw — the paired control is what keeps those off this leg` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v1-part6${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- entry ------------------------------------------------------------------------------------------------------
let browser = null, server = null;
try {
  if (PART === '1') await part1();
  else if (PART === '2') await part2();
  else if (PART === '3') await part3();   // the node half; `--part 3p` is the page half, where the guard lives
  else {
    browser = await chromium.launch();
    server = await startServer(REPO);
    if (PART === '3p') await part3page(browser, server.url);
    else if (PART === '4') { await part4node(); await part4page(browser, server.url); }
    else if (PART === '6') {
      let ids = a._.length ? a._ : GAMES();
      if (a.shard) { const { i, n } = parseShard(a.shard); ids = assignShards(GAMES(), n)[i - 1]; }
      await part6(browser, server.url, ids);
    } else throw new Error(`unknown --part ${PART}`);
  }
} finally {
  if (browser) await browser.close();
  if (server) server.stop();
}

const date = new Date().toISOString().slice(0, 19) + 'Z';
if (!a['no-summary']) appendSection({ title: `V1 part ${PART} (\`node tools/harness/gates-v1.mjs --part ${PART}\`)`, commit, dirty, rows });
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v1-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-v1 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
if (a.assert) {
  const want = ROWS[PART];
  const line = `v1-part${PART} VERDICT: rows ${rows.filter((r) => r.ok).length}/${rows.length}${want === undefined ? '' : ` of ${want} expected`}; ${rows.filter((r) => !r.ok).length} RED`;
  console.log(line);
  if (want === undefined) { console.log(`v1-part${PART} REFUSED: no expected row count is declared for this part`); process.exit(1); }
  if (rows.length !== want) {
    console.log(`v1-part${PART} REFUSED: ${rows.length} row(s), expected ${want} — a battery that stops part-way prints fewer rows, and fewer rows is fewer reds`);
    process.exit(1);
  }
}
process.exit(rows.every((r) => r.ok) ? 0 : 1);
