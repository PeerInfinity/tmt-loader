// The A2 gates (row 2 in both games). Appends one section to results/SUMMARY.md.
//   node gates-a2.mjs --part 1|1b|2|3|3o|3s-t|3s-e|3s-s [--no-summary]
// Part 1 (A2-1, something): the off anchors (au excluded) and goldens unchanged; the rung under profile all — primitive
// reset ≥ 1, primitive ms 1, primitive ms 2 — at diff 0.05 twice equal and at diff 1; the reset:primitive interval sweep
// with `always` / `gain>=1` as control rows (diff 1); parity node ≡ page under profile all at (ii)'s tick; the next stall
// (L1 detector, 3600 game-s, 2 min wall).
// Node children run through a pool (≤ 8 at once, each ≤ 10 min); every row carries the commit, ticks, gameSeconds,
// diff and hash.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, parseArgs, startServer, readManifest, headCommit, treeDirty, writeJSON, entryOnly } from './lib.mjs';
import { runNode } from './run.mjs';
import { parity } from './parity.mjs';
import { nodeIds, compareIds } from './check-goldens.mjs';
entryOnly(import.meta.url);  // a battery, not a library — see lib.mjs

// L1's off-profile anchors (results/SUMMARY.md, L1 section at 56c5e34); the 200×0.05 idle anchor is manifest.headless.idleHash.
const ANCHORS = {
  ptr: { idle1000: '86067be644ce481c', policy1000: '5ce24001caa4f31f' },
  something: { idle1000: '5739997ed0e70447', policy1000: '52ffa8d3c5eaba03' },
};
export const MARKS = {
  something: [
    ['(i) primitive reset ≥ 1 (primitive.total ≥ 1)', 'player.primitive.total.gte(1)'],
    ['(ii) primitive ms 1 ("10 Numbers")', "hasMilestone('primitive', 1)"],
    ['(iii) primitive ms 2 ("100,000 Numbers")', "hasMilestone('primitive', 2)"],
  ],
};

const a = parseArgs(process.argv.slice(2), ['no-summary']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const date = new Date().toISOString().slice(0, 19) + 'Z';
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} diff=${r.diff ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 300)}`); };
const HEADERS = {
  '1b': 'Reading this section: the detector counts only something new ever held (see policy.mjs MONITOR_SRC, SEEN); marks are recorded without stopping the run.',
  2: 'Reading this section: the PTR table is A1\'s (no row-2 feature). A mark is the first tick its predicate held; the run does not stop on marks (--marks-continue), only on the stall window or the wall.',
  3: 'Reading this section: diff 1 (PTR under the A2 table costs ~25 ms/tick); the rung run stops when (iii) holds.',
  '3o': 'Reading this section: order / control runs record the marks without stopping and end on the monotone stall detector (3600 game-s) or a 9-min wall; the default row is the stall run itself.',
  '3s-t': 'Reading this section: reset:t swept with the other row-2 resets at their defaults; the default is the fastest to (ii), ties by (iii), then the shortest interval (a static layer\'s reset waits on its requirement, so short intervals tie with the controls).',
  '3s-e': 'Reading this section: reset:e swept with the other row-2 resets at their defaults (see 3s-t for the rule).',
  '3s-s': 'Reading this section: reset:s swept with the other row-2 resets at their defaults (see 3s-t for the rule).',
  1: 'Reading this section: GREEN = the run completed and (where a second run exists) was equal; a predicate\'s own verdict is in its notes (MET / NOT MET). The sweep rows are ordered by policy; the default is the fastest to (ii), ties broken by (iii).',
};

// ---- a pool of run.mjs children --------------------------------------------------------------------------------------
const POOL = Number(a.pool || 8);
let running = 0;
const queue = [];
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-a2-')), 'r.json');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out];
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null || v === false) continue;
      if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
    }
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => {
      running--;
      try { resolve(JSON.parse(fs.readFileSync(out, 'utf8'))); } catch (e) { resolve({ ok: false, error: `no result: ${err.slice(-400)}` }); }
      pump();
    });
  }
}
const job = (id, o) => new Promise((resolve) => { queue.push({ id, o, resolve }); pump(); });
function marksFile(list) {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-marks-')), 'marks.json');
  fs.writeFileSync(f, JSON.stringify(list));
  return f;
}
const fmtMark = (m) => (m ? `${m.ticks} ticks / ${m.gameSeconds} s / ${m.hash}` : 'NOT MET');
const gs = (m) => (m ? m.gameSeconds : null);

function markRows(tag, id, marks, r1, r2, diff) {
  for (const [n] of marks) {
    const x = r1.marks?.[n], y = r2 ? r2.marks?.[n] : undefined;
    const equal = r2 ? JSON.stringify(x) === JSON.stringify(y) : null;
    row({ gate: `${tag} ${n}`, id, leg: 'profile all', ok: !!r1.ok && (r2 ? !!r2.ok && equal : true), ticks: x?.ticks ?? r1.ticks, gameSeconds: x?.gameSeconds ?? r1.gameSeconds, diff, hash: x?.hash ?? null,
      notes: `${x ? 'MET' : `NOT MET (run stopped at ${r1.ticks} ticks)`}${r2 ? `; second run ${fmtMark(y)} — equal ${equal}` : ''}${r1.error ? '; ' + r1.error : ''}` });
  }
}
function detailBrief(r) {
  return Object.entries(r.detail || {}).map(([l, o]) => `${l}{${o.unlocked ? '' : 'LOCKED '}pts ${o.points}${o.best ? ' best ' + o.best : ''}; upg [${o.upgrades}]; ms [${o.milestones}]${Object.keys(o.buyables || {}).length ? '; buy ' + JSON.stringify(o.buyables) : ''}; canReset ${o.canReset}${o.canReset ? ' gain ' + o.resetGain : ''}${o.nextAt ? ' nextAt ' + o.nextAt : ''}${o.nextUpgrades?.length ? '; next upg ' + o.nextUpgrades.join(' ') : ''}${o.nextMilestones?.length ? '; next ms ' + o.nextMilestones.join(' | ') : ''}}`).join(' ');
}
function stallRow(tag, id, r, diff, file) {
  row({ gate: tag, id, leg: 'profile all', ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff, hash: r.hash,
    notes: `stalled ${r.stall?.stalled}, wall-bounded ${r.stall?.walled}; last progress tick ${r.stall?.lastProgress?.ticks} (${r.stall?.lastProgress?.gameSeconds} s); ${r.marks ? 'marks ' + Object.entries(r.marks).map(([n, m]) => `${n}: ${fmtMark(m)}`).join(' · ') + '; ' : ''}points ${r.summary?.points}; actions ${JSON.stringify(r.hook?.actions)}; state: ${detailBrief(r)}${r.error ? '; ' + r.error : ''}` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/${file}`), r);
}
async function offAnchors(tag, id) {
  const m = readManifest(id);
  const census = m.headless.idleHash;
  const legs = [['idle', census.ticks, census.hash], ['idle', 1000, ANCHORS[id].idle1000], ['policy', 1000, ANCHORS[id].policy1000]];
  const rs = await Promise.all(legs.map(([leg, ticks]) => job(id, { ticks, diff: 0.05, leg, exclude: 'au' })));
  legs.forEach(([leg, ticks, want], i) => {
    const r = rs[i];
    row({ gate: `${tag} anchor (exclude au, profile off)`, id, leg, ok: r.ok && r.hash === want && r.profile === 'off' && !r.file_errors?.length, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 0.05, hash: r.hash,
      notes: `L1 anchor ${want}; features registered ${r.features?.length ?? 0}${r.file_errors?.length ? '; FILE ERRORS ' + JSON.stringify(r.file_errors) : ''}` });
  });
  const live = nodeIds(id);
  const golden = JSON.parse(fs.readFileSync(path.join(REPO, `tools/harness/goldens/${id}.ids.json`), 'utf8'));
  const c = compareIds(golden, live);
  row({ gate: `${tag} check-goldens unchanged`, id, ok: c.ok, ticks: 0, gameSeconds: 0, diff: null, hash: null, notes: `${live.ids.length} ids, ${Object.keys(live.layers).length} layers${c.ok ? '' : ' ' + JSON.stringify(c).slice(0, 300)}` });
}
async function parityRow(tag, id, ticks, diff, autoOpt) {
  const p = await parity(id, { ticks, diff, leg: 'idle', base, browser, profile: 'all', autoOpt });
  const same = JSON.stringify(p.node?.hook) === JSON.stringify(p.page?.hook);
  row({ gate: tag, id, leg: 'profile all', ok: p.ok && same, ticks: p.ticks, gameSeconds: p.gameSeconds, diff, hash: p.node?.hash,
    notes: p.ok ? `page ${p.page.hash} in ${p.page.ms} ms; hookStats equal ${same}; actions ${JSON.stringify(p.node?.hook?.actions)}` : `DIVERGED ${JSON.stringify(p.divergence || p.error).slice(0, 300)}` });
}

// ---- Part 1 ----------------------------------------------------------------------------------------------------------
const SWEEP_PRIMITIVE = ['interval>=5', 'interval>=10', 'interval>=30', 'interval>=60', 'interval>=90', 'interval>=120', 'interval>=180', 'interval>=240', 'interval>=300'];
async function part1() {
  const id = 'something';
  const M = MARKS[id], mf = marksFile(M);
  // the wall-bounded stall run is queued first: its reach inside 2 min depends on the CPU it gets
  const stall = job(id, { profile: 'all', diff: 1, ticks: 200000, stall: 3600, 'wall-ms': 120000 });
  const anchors = offAnchors('A2-1', id);
  const r1 = job(id, { profile: 'all', diff: 0.05, ticks: 40000, marks: mf, 'wall-ms': 540000 });
  const r2 = job(id, { profile: 'all', diff: 0.05, ticks: 40000, marks: mf, 'wall-ms': 540000 });
  const sweep = [...SWEEP_PRIMITIVE, 'always', 'gain>=1'].map((p) => [p, job(id, { profile: 'all', diff: 1, ticks: 20000, marks: mf, 'wall-ms': 540000, 'auto-opt': `policy:reset:primitive=${p}` })]);
  await anchors;
  const [a1, a2] = await Promise.all([r1, r2]);
  markRows('A2-1 rung (default reset:primitive interval>=90)', id, M, a1, a2, 0.05);
  const S = [];
  for (const [p, pr] of sweep) S.push([p, await pr]);
  const def = S.find(([p]) => p === 'interval>=90')[1];
  markRows('A2-1 coarse diff (sweep row interval>=90)', id, M, def, null, 1);
  // the default is the fastest to (ii), ties by (iii); control rows never qualify
  const cand = S.filter(([p]) => p.startsWith('interval>='));
  const key = ([, r]) => [gs(r.marks?.[M[1][0]]) ?? Infinity, gs(r.marks?.[M[2][0]]) ?? Infinity];
  cand.sort((x, y) => { const kx = key(x), ky = key(y); return kx[0] - ky[0] || kx[1] - ky[1]; });
  const best = cand[0][0];
  for (const [p, r] of S) {
    const control = !p.startsWith('interval>=');
    row({ gate: `A2-1 sweep reset:primitive ${p}${control ? ' — control' : ''}${p === best ? ' — fastest' : ''}`, id, leg: 'profile all', ok: !!r.ok && (control || p !== 'interval>=90' || best === 'interval>=90'), ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
      notes: `game-s to (i)/(ii)/(iii): ${M.map(([n]) => gs(r.marks?.[n]) ?? 'NOT MET').join(' / ')}; primitive resets ${r.hook?.actions?.['reset:primitive'] ?? 0}; actions ${JSON.stringify(r.hook?.actions)}${r.error ? '; ' + r.error : ''}` });
  }
  const t2 = a1.marks?.[M[1][0]];
  if (t2) await parityRow('A2-1 parity node≡page, profile all, at (ii)\'s tick', id, t2.ticks, 0.05);
  stallRow('A2-1 next stall (diff 1, 3600 game-s window, 2 min wall)', id, await stall, 1, 'a2-1-something-stall.json');
}

// Part 1b: the same next-stall question with the monotone detector (--stall-seen): at 71da72e the L1 signature never
// stalled Something Tree (a primitive reset every 90 s wipes and re-buys fundamental's upgrades — "progress" to it).
async function part1b() {
  const id = 'something';
  const r = await job(id, { profile: 'all', diff: 1, ticks: 200000, stall: 3600, 'stall-seen': true, 'wall-ms': 120000, marks: marksFile(MARKS[id]), 'marks-continue': true });
  stallRow('A2-1 next stall, monotone detector (--stall-seen; diff 1, 3600 game-s window, 2 min wall)', id, r, 1, 'a2-1b-something-stall.json');
}

// ---- Part 2 ----------------------------------------------------------------------------------------------------------
// PTR under the A1 table (no row-2 feature): where the row-1 → row-2 wall is. The detector at a 10-min wall, twice, marks
// recorded without stopping the run.
MARKS.ptrWall = [
  ['points ≥ 1e120 (t/e/s requirement)', "player.points.gte('1e120')"],
  ['t, e and s canReset', 'tmp.t.canReset === true && tmp.e.canReset === true && tmp.s.canReset === true'],
  ['b ms 1 ("15 Boosters")', "hasMilestone('b', 1)"],
  ['g ms 1 ("10 Generators")', "hasMilestone('g', 1)"],
  ['g ms 2 ("15 Generators")', "hasMilestone('g', 2)"],
  ['p upg 31–33 owned', 'hasUpgrade("p", 31) && hasUpgrade("p", 32) && hasUpgrade("p", 33)'],
  ['points ≥ 1e300 (a second row-2 unlock\'s requirement)', "player.points.gte('1e300')"],
];
async function part2() {
  const id = 'ptr';
  const M = MARKS.ptrWall, mf = marksFile(M);
  const o = { profile: 'all', diff: 1, ticks: 2000000, stall: 3600, 'wall-ms': 600000, marks: mf, 'marks-continue': true };
  const w1 = job(id, o), w2 = job(id, o);
  await offAnchors('A2-2', id);
  const [r1, r2] = await Promise.all([w1, w2]);
  stallRow('A2-2 row-2 wall: detector (diff 1, 3600 game-s window, 10 min wall), A1 table', id, r1, 1, 'a2-2-ptr-stall.json');
  const same = r1.hash === r2.hash && r1.ticks === r2.ticks && JSON.stringify(r1.marks) === JSON.stringify(r2.marks) && JSON.stringify(r1.stall?.lastProgress) === JSON.stringify(r2.stall?.lastProgress);
  row({ gate: 'A2-2 detector second run equal', id, leg: 'profile all', ok: !!r1.ok && !!r2.ok && same && r1.stall?.stalled === true && r1.stall?.walled === false, ticks: r2.ticks, gameSeconds: r2.gameSeconds, diff: 1, hash: r2.hash,
    notes: `stalled ${r2.stall?.stalled} (not wall-bounded: ${!r2.stall?.walled}), last progress tick ${r2.stall?.lastProgress?.ticks}; ticks/hash/marks/lastProgress equal ${same}; wall ${r1.ticks_ms} / ${r2.ticks_ms} ms` });
  const t = r1.marks?.[M[0][0]];
  if (t) await parityRow('A2-2 parity node≡page, profile all, at "points ≥ 1e120"', id, t.ticks, 1);
}

// ---- Part 3 ----------------------------------------------------------------------------------------------------------
// PTR row 2 with the A2 table. `3`: anchors + goldens, the rung twice (diff 1, stops at (iii)), parity at (i)'s tick.
// `3o`: the unlock orders (the three "which first" + s,e,t), the all-always / all-gain>=1 controls, the next stall
// (monotone detector). `3s-t|3s-e|3s-s`: one layer's reset interval sweep, the other two at their defaults.
MARKS.ptr = [
  ['(i) one of t/e/s unlocked', 'player.t.unlocked || player.e.unlocked || player.s.unlocked'],
  ['(ii) t ms 3 or s ms 3 (b.auto / g.auto available)', "hasMilestone('t', 3) || hasMilestone('s', 3)"],
  ['(iii) t, e and s unlocked', 'player.t.unlocked && player.e.unlocked && player.s.unlocked'],
];
const PTR_DEFAULT_ORDER = 's,t,e', PTR_DEFAULT_RESET = 'interval>=5';
async function part3() {
  const id = 'ptr', M = MARKS.ptr, mf = marksFile(M);
  const w1 = job(id, { profile: 'all', diff: 1, ticks: 30000, marks: mf, 'wall-ms': 540000 });
  const w2 = job(id, { profile: 'all', diff: 1, ticks: 30000, marks: mf, 'wall-ms': 540000 });
  await offAnchors('A2-3', id);
  await offAnchors('A2-3', 'something'); // loader/tmt-auto.js changed in part 3 (the `buy` policy)
  const [r1, r2] = await Promise.all([w1, w2]);
  markRows(`A2-3 rung (defaults: rowTwoOrder ${PTR_DEFAULT_ORDER}, reset:s/t/e interval>=5)`, id, M, r1, r2, 1);
  const t = r1.marks?.[M[0][0]];
  if (t) await parityRow('A2-3 parity node≡page, profile all, at (i)\'s tick', id, t.ticks, 1);
}
async function part3o() {
  const id = 'ptr', M = MARKS.ptr, mf = marksFile(M);
  const base3 = { profile: 'all', diff: 1, ticks: 30000, marks: mf, 'marks-continue': true, stall: 3600, 'stall-seen': true, 'wall-ms': 540000 };
  const stall = job(id, base3);
  const orders = ['t,e,s', 'e,t,s', 's,e,t'].map((o) => [o, job(id, { ...base3, 'auto-opt': `rowTwoOrder=${o}` })]);
  const controls = ['always', 'gain>=1'].map((p) => [p, job(id, { profile: 'all', diff: 1, ticks: 30000, marks: mf, stall: 3600, 'stall-seen': true, 'wall-ms': 540000, 'auto-opt': ['t', 'e', 's'].map((l) => `policy:reset:${l}=${p}`).join(';') })]);
  const def = await stall;
  const fmt = (r) => M.map(([n]) => gs(r.marks?.[n]) ?? 'NOT MET').join(' / ');
  row({ gate: `A2-3 order ${PTR_DEFAULT_ORDER} (default)`, id, leg: 'profile all', ok: !!def.ok, ticks: def.ticks, gameSeconds: def.gameSeconds, diff: 1, hash: def.hash, notes: `game-s to (i)/(ii)/(iii): ${fmt(def)}` });
  for (const [o, pr] of orders) {
    const r = await pr;
    row({ gate: `A2-3 order ${o} (alternative)`, id, leg: 'profile all', ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
      notes: `game-s to (i)/(ii)/(iii): ${fmt(r)} vs default ${fmt(def)}; run ended: stalled ${r.stall?.stalled} (last progress ${r.stall?.lastProgress?.gameSeconds} s), wall-bounded ${r.stall?.walled}; row-2 actions ${JSON.stringify(Object.fromEntries(Object.entries(r.hook?.actions || {}).filter(([k]) => /:(t|e|s)$/.test(k))))}` });
  }
  for (const [p, pr] of controls) {
    const r = await pr;
    row({ gate: `A2-3 reset:t/e/s all ${p} — control`, id, leg: 'profile all', ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
      notes: `game-s to (i)/(ii)/(iii): ${fmt(r)} vs default ${fmt(def)}; run ended: stalled ${r.stall?.stalled}, wall-bounded ${r.stall?.walled}` });
  }
  stallRow('A2-3 next stall, default table (monotone detector; diff 1, 3600 game-s window, 9 min wall)', id, def, 1, 'a2-3-ptr-stall.json');
}
async function part3s(layer) {
  const id = 'ptr', M = MARKS.ptr, mf = marksFile(M);
  const vals = ['interval>=5', 'interval>=10', 'interval>=30', 'interval>=60', 'interval>=120', 'always', 'gain>=1'];
  const rs = vals.map((p) => [p, job(id, { profile: 'all', diff: 1, ticks: 30000, marks: mf, 'wall-ms': 540000, 'auto-opt': `policy:reset:${layer}=${p}` })]);
  const done = [];
  for (const [p, pr] of rs) done.push([p, await pr]);
  const key = (r) => [gs(r.marks?.[M[1][0]]) ?? Infinity, gs(r.marks?.[M[2][0]]) ?? Infinity];
  const cand = done.filter(([p]) => p.startsWith('interval>=')).sort((x, y) => key(x[1])[0] - key(y[1])[0] || key(x[1])[1] - key(y[1])[1] || Number(x[0].slice(10)) - Number(y[0].slice(10)));
  for (const [p, r] of done) {
    const control = !p.startsWith('interval>=');
    row({ gate: `A2-3 sweep reset:${layer} ${p}${control ? ' — control' : ''}${p === cand[0][0] ? ' — fastest (shortest of ties)' : ''}`, id, leg: 'profile all', ok: !!r.ok && (control || p !== PTR_DEFAULT_RESET || cand[0][0] === PTR_DEFAULT_RESET), ticks: r.ticks, gameSeconds: r.gameSeconds, diff: 1, hash: r.hash,
      notes: `game-s to (i)/(ii)/(iii): ${M.map(([n]) => gs(r.marks?.[n]) ?? 'NOT MET').join(' / ')}; reset:${layer} ${r.hook?.actions?.['reset:' + layer] ?? 0}; actions ${JSON.stringify(r.hook?.actions)}${r.error ? '; ' + r.error : ''}` });
  }
}

const browser = await chromium.launch();
const server = await startServer(REPO);
const base = server.url;
try {
  if (PART === '1') await part1();
  else if (PART === '1b') await part1b();
  else if (PART === '2') await part2();
  else if (PART === '3') await part3();
  else if (PART === '3o') await part3o();
  else if (/^3s-[tes]$/.test(PART)) await part3s(PART.slice(3));
  else throw new Error(`no part ${PART}`);
} finally {
  await browser.close();
  server.stop();
}

const SUMMARY = path.join(REPO, 'tools/harness/results/SUMMARY.md');
const cell = (v) => (v === null || v === undefined ? '—' : String(v).replace(/\|/g, '\\|'));
let md = `\n## ${date} — A2 part ${PART} (\`node tools/harness/gates-a2.mjs --part ${PART}\`) — commit \`${commit}\`${dirty ? ' (tree DIRTY)' : ''} — ${rows.filter((r) => r.ok).length}/${rows.length} green\n\n${HEADERS[PART] ? HEADERS[PART] + '\n\n' : ''}| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${cell(r.gate)} | ${r.id} | ${cell(r.leg)} | ${cell(r.ticks)} | ${cell(r.gameSeconds)} | ${cell(r.diff)} | ${r.hash ? '`' + r.hash + '`' : '—'} | ${r.ok ? 'GREEN' : '**RED**'} | ${cell(r.notes)} |\n`;
if (!a['no-summary']) fs.appendFileSync(SUMMARY, md);
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-a2-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-a2 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
process.exit(rows.every((r) => r.ok) ? 0 : 1);
