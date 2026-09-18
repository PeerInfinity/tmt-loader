// Gate R1′ (plan §14d): the ladder resumed from the frontier under the SIMPLE system — M11–M16, the policies the marks
// need, and the sweeps that give each of them provenance.
//   node tools/harness/gates-r1.mjs --part 1        the marks from frontier/STALL.json, twice equal, the final table
//   node tools/harness/gates-r1.mjs --part 2e       the Enhance reserve sweep (Part 2.2)
//   node tools/harness/gates-r1.mjs --part 2t       the Extra Time Capsule exclusion (Part 2.4)
//   node tools/harness/gates-r1.mjs --part 2o       the refund ORDERS through order-then-cheapest (Part 2.1)
//   node tools/harness/gates-r1.mjs --part 2r       the row-2 reset sweeps to M12 / M15 (Part 2.3)
//   node tools/harness/gates-r1.mjs --part 3        the opening's regression row (fresh game --ladder --to M12)
//   node tools/harness/gates-r1.mjs --part chain --legs N [--ticks T] [--opt "k=v"] [--tag name]   (ad hoc; the driver
//                                                  every part above uses — a run of N legs bounded by TICKS, chained
//                                                  through --stop-snapshot so a leg boundary is reproducible §12b.2/11)
// Every long row records ticks_ms and the box load. A leg is bounded by TICKS, never by the wall.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { REPO, parseArgs, writeJSON, headCommit, treeDirty, readLadder } from './lib.mjs';
import { appendSection } from './summary.mjs';

const a = parseArgs(process.argv.slice(2), ['no-summary']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id} ticks=${r.ticks ?? '-'} gs=${r.gameSeconds ?? '-'} ${String(r.notes || '').slice(0, 260)}`); };

const READING = [
  'every row is a CHAIN of legs bounded by TICKS (never by the wall), resumed from the previous leg\'s --stop-snapshot,',
  'so a leg boundary is reproducible (§12b.2 item 11) and "twice equal" measures the table, not the box. "NEW marks" lists',
  'only marks that do NOT already hold at the frontier (M01–M10 hold there, and so does M13 under R1′\'s sharpened',
  'predicate — the measurement is in ladder/ptr.json). A row with NEW marks: NONE is a WALL, not a failure: the curve',
  'beside it is the deliverable (what was accumulating, at what rate, and what stopped moving). An instantaneous',
  '`points` reading is NOT comparable between configurations — it is sampled wherever the p reset cycle happened to be',
  '(§12b.2 item 15); compare the structural quantities (TC, Time Energy and its cap, EP, SE, Generator Power, boosters,',
  'upgrades held, unlockOrder). ticks_ms and the 1-minute load are on every long row: this battery ran with 8 CPU-bound',
  'children on 8 cores, so ms/tick is roughly double the quiet-box 19–25 ms — that moves wall time, never game-seconds.',
].join(' ');
const PTR_LADDER = 'tools/harness/ladder/ptr.json';
const FRONTIER = 'tools/harness/snapshots/ptr/frontier/STALL.json';
const SNAP_ALL = 'tools/harness/snapshots/ptr/all';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-r1-'));
// The frontier state the marks are measured from (P1a-0's fixture; S1 §10a.4 / H1-2 part 2f).
const FRONT = { ticks: 14131, hashGame: 'f7a8854358ac4029' };
// Marks that already hold at the frontier: M01–M10 and M13 (H1 10b.2 item 2 — `hasUpgrade('s',13) && hasUpgrade('s',15)`
// holds since before M09, which is why R1′ sharpens M13's predicate).
const HELD_AT_FRONTIER = ['M01','M02','M03','M04','M05','M06','M07','M08','M09','M10'];
// The row-2 readout every long row carries (the curve a WALL is named from).
export const READOUT = `({points: String(player.points), b: String(player.b.points), bBest: String(player.b.best), g: String(player.g.points), gp: String(player.g.power), t: String(player.t.points), tBest: String(player.t.best), te: String(player.t.energy), teCap: String(tmp.t.effect.limit), teGain: String(tmp.t.effect.gain), xtc: String(player.t.buyables[11]), tUpg: player.t.upgrades.slice(), tMs: player.t.milestones.slice(), e: String(player.e.points), eBest: String(player.e.best), enh: String(player.e.buyables[11]), eUpg: player.e.upgrades.slice(), eMs: player.e.milestones.slice(), s: String(player.s.points), sBest: String(player.s.best), sUpg: player.s.upgrades.slice(), sMs: player.s.milestones.slice(), space: String(layers.s.space()), spent: String(player.s.spent), bld: [11,12,13,14].map(function(i){return String(player.s.buyables[i])}), sb: player.sb.unlocked, sbBest: String(player.sb.best), a41: hasAchievement('a',41), bEff: String(tmp.b.effect), bBase: String(tmp.b.effectBase), enEff: String(tmp.t.enEff), pUpg: player.p.upgrades.slice(), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder]})`;

// ---- a pool of run.mjs children ---------------------------------------------------------------------------------------
const POOL = Number(a.pool || 4);
const uptime = () => Number(fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]);
let running = 0;
const queue = [];
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(TMP, 'r-')), 'r.json');
    const args = [path.join(REPO, 'tools/harness/run.mjs'), id, '--json', out];
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null || v === false) continue;
      if (v === true) args.push(`--${k}`); else args.push(`--${k}`, String(v));
    }
    const loadStart = uptime(), t0 = Date.now();
    const c = spawn(process.execPath, args, { cwd: REPO, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    c.stderr.on('data', (d) => { err += d; });
    c.on('exit', () => {
      running--;
      let r;
      try { r = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { r = { ok: false, error: `no result: ${err.slice(-400)}` }; }
      r.load = { start: loadStart, end: uptime(), wallMs: Date.now() - t0, pool: POOL };
      resolve(r); pump();
    });
  }
}
const job = (id, o) => new Promise((resolve) => { queue.push({ id, o, resolve }); pump(); });

/** A chained run: `legs` legs of `ticks` game-seconds each, every leg resumed from the previous leg's STOP snapshot.
 *  Returns {tag, marks, legs, gameSeconds, hashGame, samples, wallMs, ticksMs, load}. */
export async function chain({ tag = 'chain', from = FRONTIER, legs = 1, ticks = 15000, to = 'M16', opt = {}, ladderFrom = 'M10', snapshots = null }) {
  const dir = fs.mkdtempSync(path.join(TMP, `${tag}-`));
  const all = { tag, marks: {}, legs: [], samples: [], wallMs: 0, ticksMs: 0, gameSeconds: null, hashGame: null, ok: true, stopped: null };
  let snapshot = from, fromMark = from ? ladderFrom : null;   // from = null → a FRESH game, the whole ladder
  for (let leg = 0; leg < legs; leg++) {
    const r = await job('ptr', {
      profile: 'all', diff: 1, ticks, 'wall-ms': 900000, ladder: PTR_LADDER, from: fromMark, to,
      'from-snapshot': snapshot, 'stop-snapshot': dir, 'stop-snapshot-name': `LEG${leg}`,
      ...(snapshots ? { snapshots } : {}),          // a mark's own snapshot (the fixture the next rung starts from)
      eval: READOUT, stall: 100000, ...opt,
    });
    all.legs.push({ leg, ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, why: r.ladder?.stoppedAt?.why, ticksMs: r.ticks_ms, wallMs: r.load.wallMs, load: r.load, error: r.error || null });
    all.wallMs += r.load.wallMs; all.ticksMs += r.ticks_ms || 0;
    all.gameSeconds = r.gameSeconds; all.hashGame = r.hashGame; all.stopped = r.ladder?.stoppedAt || null;
    all.samples.push({ leg, gameSeconds: r.gameSeconds, eval: r.eval || null, actions: r.hook?.actions || null });
    for (const w of r.snapshotsWritten || []) all.snapshots = (all.snapshots || []).concat([w]);
    for (const m of r.ladder?.reached || []) if (!all.marks[m.id]) all.marks[m.id] = m;
    if (!r.ok) { all.ok = false; all.error = r.error; break; }
    if (r.ladder?.stoppedAt?.why === 'to') break;
    snapshot = path.join(dir, `LEG${leg}.json`);
    if (!fs.existsSync(snapshot)) { all.ok = false; all.error = 'no stop snapshot'; break; }
    // a STOP snapshot's mark is LEGn, which is not a ladder id, so the resumed leg must be told where in the
    // ladder it is; the last mark reached so far is the only honest answer (H1: --from is exclusive).
    if (fromMark === null) fromMark = ladderFrom;
  }
  all.dir = dir;
  return all;
}
export const newMarks = (c) => Object.entries(c.marks).filter(([m]) => !HELD_AT_FRONTIER.includes(m)).sort().map(([m, v]) => `${m}@${v.gameSeconds}s/${v.hashGame}`);
const curve = (c) => c.samples.map((s) => `${s.gameSeconds}s: pts ${short(s.eval?.points)} b ${s.eval?.b} t ${s.eval?.t}TC/${short(s.eval?.te)}TE(cap ${short(s.eval?.teCap)},xtc ${s.eval?.xtc}) e ${s.eval?.e}EP/enh ${s.eval?.enh} s ${s.eval?.s}SE gp ${short(s.eval?.gp)} upg t[${s.eval?.tUpg}] e[${s.eval?.eUpg}]`).join(' | ');
const short = (v) => (v === undefined || v === null ? '—' : String(v).replace(/(\d)\.(\d\d\d)\d+e/, '$1.$2e').slice(0, 12));
const fmtM = (m) => (m ? `${m.gameSeconds}s/${m.hashGame}` : 'NOT MET');

// ---- ad hoc: --part chain ---------------------------------------------------------------------------------------------
async function partChain() {
  const opt = {};
  if (a.opt) opt['auto-opt'] = String(a.opt);
  const c = await chain({ tag: String(a.tag || 'chain'), legs: Number(a.legs || 1), ticks: Number(a.ticks || 15000), to: String(a.to || 'M16'), opt });
  row({ gate: `R1′ chain ${c.tag} (${c.legs.length} legs × ${a.ticks || 15000} ticks${a.opt ? `, ${a.opt}` : ''})`, id: 'ptr', leg: 'profile all, from frontier/STALL', ok: c.ok,
    ticks: c.gameSeconds, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
    notes: `new marks: ${newMarks(c).join(' ') || 'NONE'}; stopped ${JSON.stringify(c.stopped)}; curve ${curve(c)}; actions ${JSON.stringify(c.samples[c.samples.length - 1]?.actions)}; ticks_ms ${c.ticksMs}; load ${c.legs.map((l) => l.load.start).join('→')}${c.error ? '; ' + c.error : ''}` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/r1-chain-${c.tag}.json`), c);
}

// ---- Part 1: the marks from the frontier, twice equal, with the final table ------------------------------------------
// The 2×2 that ATTRIBUTES them runs in the same battery, because the two levers were chosen by a 9000-tick probe and a
// mark reached under both has to be credited to one of them: `include=buyables:t` (the Extra Time Capsule exclusion
// re-evaluated, Part 2.4) × `policy:buyables:e=reserve>=next-upgrade` (the Enhance reserve, Part 2.2).
// The two levers, as the PROBES had to express them — when part 1 ran, the table still excluded `buyables:t` and had no
// `buyables:e` policy. Both are IN the table since R1′, so `include=buyables:t` now throws ("the table does not exclude
// it") and these strings are kept only as the record of how part 1's 2×2 was configured. A re-run of part 1 expresses
// the same 2×2 as REMOVALS from the table (`exclude=`/`policy:buyables:e=buy`); parts 2o / 2r take the table as their
// base and add nothing.
const XTC = 'include=buyables:t';
const ERES = 'policy:buyables:e=reserve>=next-upgrade';
const TABLE_BASE = '';         // parts 2o / 2r: the table itself carries both levers now
const LEGS = () => Number(a.legs || 5);
const LEG_TICKS = () => Number(a.ticks || 12000);
async function part1() {
  const legs = LEGS(), ticks = LEG_TICKS();
  const cfg = [
    ['A1 both levers (run 1)', `${XTC};${ERES}`],
    ['A2 both levers (run 2 — twice equal)', `${XTC};${ERES}`],
    ['B Extra Time Capsules only', XTC],
    ['C the Enhance reserve only', ERES],
    ['D the table as it stands (control)', null],
  ];
  const cs = await Promise.all(cfg.map(([tag, opt], i) => chain({ tag: `p1-${i}`, legs, ticks, opt: opt ? { 'auto-opt': opt } : {} })));
  const A1 = cs[0], A2 = cs[1];
  cfg.forEach(([tag, opt], i) => {
    const c = cs[i];
    const twice = i === 1 ? (JSON.stringify(newMarks(A1)) === JSON.stringify(newMarks(A2)) && A1.hashGame === A2.hashGame && A1.gameSeconds === A2.gameSeconds) : null;
    row({ gate: `R1′-1 ${tag}`, id: 'ptr', leg: `profile all, diff 1, from frontier/STALL, ${legs}×${ticks} ticks${opt ? `, ${opt}` : ', no --auto-opt'}`,
      ok: c.ok && (i !== 1 || twice === true), ticks: c.gameSeconds, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
      notes: `NEW marks: ${newMarks(c).join(' ') || 'NONE'}${i === 1 ? `; equal to run 1: ${twice}` : ''}; stopped ${JSON.stringify(c.stopped)}; curve ${curve(c)}; actions ${JSON.stringify(c.samples[c.samples.length - 1]?.actions)}; ticks_ms ${c.ticksMs}; legs ${c.legs.map((l) => `${l.ticks}@${Math.round(l.wallMs / 1000)}s/load ${l.load.start}`).join(' ')}${c.error ? '; ' + c.error : ''}` });
    writeJSON(path.join(REPO, `tools/harness/results/tmp/r1-1-${i}.json`), c);
  });
  // the attribution row: which lever each new mark is owed to
  const ms = (c) => new Set(newMarks(c).map((x) => x.split('@')[0]));
  const [mA, mB, mC, mD] = [ms(A1), ms(cs[2]), ms(cs[3]), ms(cs[4])];
  const attrib = [...mA].map((m) => `${m}: both ${A1.marks[m].gameSeconds}s · xtc-only ${mB.has(m) ? cs[2].marks[m].gameSeconds + 's' : '—'} · reserve-only ${mC.has(m) ? cs[3].marks[m].gameSeconds + 's' : '—'} · table ${mD.has(m) ? cs[4].marks[m].gameSeconds + 's' : '—'}`);
  row({ gate: 'R1′-1 attribution: every new mark against the 2×2 of the two levers', id: 'ptr', leg: 'the four chains above', ok: true, ticks: null, gameSeconds: null, diff: 1, hash: null,
    notes: attrib.join(' | ') || 'no new mark under any configuration' });
}


// ---- Part 2o: the refund ORDERS through order-then-cheapest (Part 2.1) ------------------------------------------------
// Provenance for the orders: digest L2.9–L2.10 (t 12 → 13 → 23), L2.2–L2.5 (e 11 → 12 → 22), L2.14–L2.16 (s 13 → 15 → 23).
// The control is the derived `cheapest-first`, which is what reached t23 in the probe — so the row has to show whether
// NAMING the order does anything at all, and a null result is the honest one.
async function part2o() {
  const legs = Number(a.legs || 3), ticks = LEG_TICKS();
  const BASE = TABLE_BASE;
  const cfg = [
    ['control: cheapest-first everywhere (the derived default)', BASE],
    ['t 12,13,23', [BASE, 'order:upgrades:t=12,13,23'].filter(Boolean).join(';')],
    ['e 11,12,22', [BASE, 'order:upgrades:e=11,12,22'].filter(Boolean).join(';')],
    ['s 13,15,23', [BASE, 'order:upgrades:s=13,15,23'].filter(Boolean).join(';')],
    ['all three', [BASE, 'order:upgrades:t=12,13,23', 'order:upgrades:e=11,12,22', 'order:upgrades:s=13,15,23'].filter(Boolean).join(';')],
  ];
  const cs = await Promise.all(cfg.map(([tag, opt], i) => chain({ tag: `p2o-${i}`, legs, ticks, opt: opt ? { 'auto-opt': opt } : {} })));
  cfg.forEach(([tag], i) => {
    const c = cs[i], b = cs[0];
    row({ gate: `R1′-2.1 refund order — ${tag}`, id: 'ptr', leg: `from frontier/STALL, ${legs}×${ticks}`, ok: c.ok, ticks: c.gameSeconds, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
      notes: `NEW marks: ${newMarks(c).join(' ') || 'NONE'}${i ? `; control: ${newMarks(b).join(' ') || 'NONE'}` : ''}; upgrades held t[${c.samples.at(-1)?.eval?.tUpg}] e[${c.samples.at(-1)?.eval?.eUpg}] s[${c.samples.at(-1)?.eval?.sUpg}]; unlockOrder ${JSON.stringify(c.samples.at(-1)?.eval?.uo)}; curve ${curve(c)}; ticks_ms ${c.ticksMs}${c.error ? '; ' + c.error : ''}` });
    writeJSON(path.join(REPO, `tools/harness/results/tmp/r1-2o-${i}.json`), c);
  });
}

// ---- Part 2r: the row-2 reset sweeps (Part 2.3) ------------------------------------------------------------------------
// ⚖ 13d.2: `interval>=5` on t / e / s is a PROXY, and the sweep is where a target-driven replacement comes from. t and s
// are STATIC layers (layers.js:916, 1593) and e is NORMAL (1320): `gain>=Nx` cannot fire on a static layer (its gain is 1
// per reset whatever the requirement), so that cell is a named control, not a candidate.
async function part2r() {
  const legs = Number(a.legs || 2), ticks = LEG_TICKS();
  const BASE = TABLE_BASE;
  const VALUES = ['interval>=5', 'gain>=2x', 'always', 'unlocks-purchase'];
  const cells = [];
  for (const l of ['t', 'e', 's']) for (const v of VALUES) cells.push([l, v]);
  const cs = await Promise.all(cells.map(([l, v], i) => chain({ tag: `p2r-${i}`, legs, ticks, opt: { 'auto-opt': [BASE, `policy:reset:${l}=${v}`].filter(Boolean).join(';') } })));
  cells.forEach(([l, v], i) => {
    const c = cs[i];
    const isDefault = v === 'interval>=5';
    const type = l === 'e' ? 'normal' : 'static';
    row({ gate: `R1′-2.3 reset:${l} = ${v}${isDefault ? ' (the table today)' : ''}`, id: 'ptr', leg: `${type} layer, from frontier/STALL, ${legs}×${ticks}`, ok: c.ok, ticks: c.gameSeconds, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
      notes: `NEW marks: ${newMarks(c).join(' ') || 'NONE'}; reset:${l} fired ${c.samples.at(-1)?.actions?.[`reset:${l}`] ?? '—'}×${type === 'static' && v === 'gain>=2x' ? ' (a static layer gains 1 per reset: gain>=Nx can only fire while points < 0.5, so this cell is a CONTROL)' : ''}; ${l} held ${c.samples.at(-1)?.eval?.[l]} (best ${c.samples.at(-1)?.eval?.[l + 'Best']}); curve ${curve(c)}${c.error ? '; ' + c.error : ''}` });
    writeJSON(path.join(REPO, `tools/harness/results/tmp/r1-2r-${i}.json`), c);
  });
}

// ---- Part 3: the opening's regression row (a FRESH game under the new table) -------------------------------------------
async function part3() {
  const legs = Number(a.legs || 4), ticks = LEG_TICKS();
  const cs = await Promise.all([
    chain({ tag: 'p3-new', from: null, legs, ticks, to: 'M12', ladderFrom: 'M10' }),
    chain({ tag: 'p3-old', from: null, legs, ticks, to: 'M12', ladderFrom: 'M10', opt: { 'auto-opt': 'policy:reset:p=interval>=10' } }),
  ]);
  const H1 = { M01: 1, M02: 1361, M03: 2360, M04: 2629, M05: 2936, M06: 3540, M07: 3550, M08: 6037, M09: 8035 };
  cs.forEach((c, i) => {
    const tag = i === 0 ? "the table as it stands (reset:p gain>=2x)" : 'control: the same table with reset:p reverted to interval>=10 (NOT H1-1\'s configuration — the rest of R1′\'s table is still in force, which is why M09 lands at 8137 and not H1\'s 8035)';
    const cmp = Object.keys(H1).map((m) => `${m} ${c.marks[m] ? c.marks[m].gameSeconds : '—'}s (H1 ${H1[m]})`);
    row({ gate: `R1′-3 fresh game --ladder --to M12 — ${tag}`, id: 'ptr', leg: `profile all, diff 1, ${legs}×${ticks}`, ok: c.ok, ticks: c.gameSeconds, gameSeconds: c.gameSeconds, diff: 1, hash: c.hashGame,
      notes: `${cmp.join(' · ')}; later marks ${Object.entries(c.marks).filter(([m]) => !H1[m]).map(([m, v]) => `${m}@${v.gameSeconds}s/${v.hashGame}`).join(' ') || 'none'}; stopped ${JSON.stringify(c.stopped)}; ticks_ms ${c.ticksMs}${c.error ? '; ' + c.error : ''}` });
    writeJSON(path.join(REPO, `tools/harness/results/tmp/r1-3-${i}.json`), c);
  });
}


// ---- Part 1f: the FINAL TABLE, twice equal, and the mark fixtures ----------------------------------------------------
// Gate row (a): from frontier/STALL with NO --auto-opt — the table itself — twice, and the snapshots of every mark
// reached (the fixture the next rung starts from, committed under snapshots/ptr/all/).
async function part1f() {
  const legs = LEGS(), ticks = LEG_TICKS();
  const dirs = [fs.mkdtempSync(path.join(TMP, 'fix1-')), fs.mkdtempSync(path.join(TMP, 'fix2-'))];
  const [A, B] = await Promise.all([
    chain({ tag: 'p1f-1', legs, ticks, snapshots: dirs[0] }),
    chain({ tag: 'p1f-2', legs, ticks, snapshots: dirs[1] }),
  ]);
  const equal = JSON.stringify(newMarks(A)) === JSON.stringify(newMarks(B)) && A.hashGame === B.hashGame && A.gameSeconds === B.gameSeconds;
  row({ gate: 'R1′-1 (a) the FINAL TABLE from frontier/STALL, run 1', id: 'ptr', leg: `profile all, diff 1, no --auto-opt, ${legs}×${ticks} ticks`, ok: A.ok, ticks: A.gameSeconds, gameSeconds: A.gameSeconds, diff: 1, hash: A.hashGame,
    notes: `NEW marks: ${newMarks(A).join(' ') || 'NONE'}; stopped ${JSON.stringify(A.stopped)}; curve ${curve(A)}; actions ${JSON.stringify(A.samples.at(-1)?.actions)}; ticks_ms ${A.ticksMs}; legs ${A.legs.map((l) => `${Math.round(l.wallMs / 1000)}s/load ${l.load.start}`).join(' ')}${A.error ? '; ' + A.error : ''}` });
  row({ gate: 'R1′-1 (a) the FINAL TABLE from frontier/STALL, run 2 — TWICE EQUAL', id: 'ptr', leg: `profile all, diff 1, no --auto-opt, ${legs}×${ticks} ticks`, ok: B.ok && equal, ticks: B.gameSeconds, gameSeconds: B.gameSeconds, diff: 1, hash: B.hashGame,
    notes: `NEW marks: ${newMarks(B).join(' ') || 'NONE'}; equal to run 1: ${equal} (marks, end hashGame ${A.hashGame} vs ${B.hashGame}, end game-second ${A.gameSeconds} vs ${B.gameSeconds}); ticks_ms ${B.ticksMs}${B.error ? '; ' + B.error : ''}` });
  // the fixtures: every mark not already committed, from run 1, and run 2 must agree on its hashGame
  const seen = {};
  for (const w of A.snapshots || []) seen[w.mark] = w;
  const bmark = {};
  for (const w of B.snapshots || []) bmark[w.mark] = w;
  for (const m of Object.keys(seen).sort()) {
    if (HELD_AT_FRONTIER.includes(m)) continue;
    const s1 = JSON.parse(fs.readFileSync(seen[m].file, 'utf8'));
    const s2 = bmark[m] ? JSON.parse(fs.readFileSync(bmark[m].file, 'utf8')) : null;
    const same = !!s2 && s1.hashGame === s2.hashGame && s1.ticks === s2.ticks;
    const dest = path.join(REPO, SNAP_ALL, `${m}.json`);
    if (same) fs.copyFileSync(seen[m].file, dest);
    row({ gate: `R1′-1 (e) fixture snapshots/ptr/all/${m}.json`, id: 'ptr', leg: 'from run 1, hashGame agreed by run 2', ok: same, ticks: s1.ticks, gameSeconds: s1.gameSeconds, diff: s1.diff, hash: s1.hashGame,
      notes: `${same ? 'written' : 'NOT written (the two runs disagree)'}; run 1 ${s1.ticks}/${s1.hashGame}, run 2 ${s2 ? `${s2.ticks}/${s2.hashGame}` : 'MISSING'}; ${fs.existsSync(dest) ? fs.statSync(dest).size : 0} bytes` });
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/r1-1f.json'), { A, B, equal });
}

const PARTS = { 1: part1, '1f': part1f, '2o': part2o, '2r': part2r, 3: part3, chain: partChain };
// ⚠ This file EXPORTS chain() / READOUT / newMarks, so it can be imported — and a gate module whose battery runs at
// top level launches that battery on import. Measured the hard way in this slice: `node -e "import('./gates-r1.mjs')
// .then(m => console.log(m.READOUT))"`, to print one constant, started a second `--part 1` battery whose five chains
// competed with the real one for the box (12 boot children on 8 cores, 68–87 % CPU each instead of 103 %) and left
// four orphaned run.mjs children when the importing process was killed. The battery now runs only as the ENTRY point.
const ENTRY = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (ENTRY) {
  if (!PARTS[PART]) { console.error(`unknown --part ${PART} (have: ${Object.keys(PARTS).join(', ')})`); process.exit(2); }
  await PARTS[PART]();
  if (!a['no-summary']) appendSection({ title: `gate R1′ part ${PART} — the ladder from the frontier under the simple system`, commit, dirty, rows, slug: `r1-${PART}`, reading: READING });
  console.log(`\n${rows.filter((r) => r.ok).length}/${rows.length} green`);
}
