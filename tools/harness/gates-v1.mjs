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

const a = parseArgs(process.argv.slice(2), ['no-summary']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 400)}`); };

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
const EQUIV_SRC = `(function(){
  var T = tmtLoader, g = globalThis.__v1 || (globalThis.__v1 = { prev: {}, checked: 0, ticks: 0, bad: null });
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
  const out = await Promise.all(EQUIV_LEGS.map((L) => job(L.id, { ...L.o, until: EQUIV_SRC, eval: 'globalThis.__v1' }).then((r) => ({ L, r }))));
  for (const { L, r } of out) {
    const g = r.eval || {};
    const ok = !!r.ok && r.until && r.until.met === false && r.until.errors === 0 && !g.bad && g.checked > 0;
    row({ gate: 'V1-2 reason ≡ decision (every feature, every tick)', id: L.id, leg: L.key, ok, ticks: r.ticks, hash: r.hashGame,
      notes: `${g.checked} feature-ticks compared over ${g.ticks} ticks; violation ${JSON.stringify(g.bad)}; predicate errors ${r.until?.errors}; actions ${JSON.stringify(r.hook?.actions)}` });
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
// ⛔ THE TRAP THIS ROW EXISTS FOR. The engine keeps the selected subtab in `player.subtabs[layer].mainTabs`, a
// TOP-LEVEL player key that `hashGame` did not exclude. Giving the `au` tab subtabs therefore moved every pinned
// `hashGame` in the repo — and a player switching subtab mid-run would move it again. The fix is one shared
// definition (`tmtLoader.gameState`); this row is what says the fix works, from the PLAYER's side rather than the
// definition's: a run that switches Simple → Advanced → Simple must end where one that never switched ends.
async function part4(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    const end = async (switching) => {
      const { context, page, errs } = await openGamePage(browser, base, id, '&profile=all');
      try {
        await page.evaluate(() => { showTab('au'); });
        await redraw(page);
        await page.evaluate(() => tmtLoader.tick(1, 100));
        if (switching) { await selectSub(page, 'Advanced'); await page.evaluate(() => tmtLoader.tick(1, 100)); await selectSub(page, 'Simple'); }
        else await page.evaluate(() => tmtLoader.tick(1, 100));
        await page.evaluate(() => tmtLoader.tick(1, 100));
        return await page.evaluate(async () => ({ hashGame: await tmtLoader.hash(tmtLoader.gameState), hash: await tmtLoader.hash(), ticks: tmtLoader.ticks, sub: player.subtabs.au.mainTabs, errs: 0 }));
      } finally { await context.close(); }
    };
    const plain = await end(false);
    const switched = await end(true);
    check(plain.ticks === switched.ticks, `both runs ticked ${plain.ticks} / ${switched.ticks} times`);
    check(plain.hashGame === switched.hashGame, `hashGame equal: never-switched ${plain.hashGame} vs switched ${switched.hashGame}`);
    check(plain.hash !== switched.hash, `and the FULL hash DOES differ (${plain.hash} vs ${switched.hash}) — so the subtab really was written to the save, and the row is not vacuous`);
    check(switched.sub === 'Simple' && plain.sub === 'Simple', `both end on the Simple subtab (${plain.sub} / ${switched.sub})`);
    row({ gate: 'V1-4 switching Simple → Advanced → Simple does not move hashGame', id, leg: '300 ticks at diff 1, profile all', ok, ticks: plain.ticks, hash: plain.hashGame, notes: notes.join('; ') });
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
        await selectSub(page, 'Advanced');
        r = await page.evaluate(() => {
          const T = window.tmtLoader, rows = T.explain();
          const text = document.querySelector('#app').innerText || '';
          // one block per feature that is not collapsed, one collapsed line per feature that is — together, every row
          const blocks = document.querySelectorAll('#app div[style*="border-left"]').length;
          const collapsed = rows.filter((x) => x.state === 'locked' || x.state === 'excluded').length;
          return { features: T.features.length, rows: rows.length, blocks, collapsed, unknown: rows.filter((x) => x.last && x.last.code === 'unknown').map((x) => x.id),
            sub: player.subtabs.au.mainTabs, subs: Object.keys(tmp.au.tabFormat), rendered: text.indexOf('Read-only.') >= 0, len: text.length,
            scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth };
        });
        r.errs = errs.slice(0, 3);
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    const ok = r.rendered && r.sub === 'Advanced' && JSON.stringify(r.subs) === '["Simple","Advanced"]'
      && r.blocks === r.rows - r.collapsed && r.unknown.length === 0 && r.errs.length === 0;
    judged.push({ id, ok, r });
    if (!ok) row({ gate: 'V1-6 roster: the Advanced subtab', id, leg: 'profile all, 60 ticks', ok: false, notes: JSON.stringify(r) });
  }
  const red = judged.filter((x) => !x.ok);
  row({ gate: 'V1-6 the ROSTER: every game\'s Advanced subtab renders its own features', id: `${judged.length} judged`, leg: `${ids.length} assigned`, ok: red.length === 0 && judged.length > 0,
    notes: `judged ${judged.length}, RED ${red.length} (${red.map((x) => x.id).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ': ' + abstained.join(' · ') : ''}; total feature rows ${judged.reduce((s, x) => s + x.r.rows, 0)}; blocks ${judged.reduce((s, x) => s + x.r.blocks, 0)}` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v1-part6${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- entry ------------------------------------------------------------------------------------------------------
let browser = null, server = null;
try {
  if (PART === '1') await part1();
  else if (PART === '2') await part2();
  else if (PART === '3') await part3();
  else {
    browser = await chromium.launch();
    server = await startServer(REPO);
    if (PART === '4') await part4(browser, server.url);
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
process.exit(rows.every((r) => r.ok) ? 0 : 1);
