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
export const READOUT = `({points: String(player.points), b: String(player.b.points), bBest: String(player.b.best), g: String(player.g.points), gp: String(player.g.power), t: String(player.t.points), tBest: String(player.t.best), te: String(player.t.energy), teCap: String(tmp.t.effect.limit), teGain: String(tmp.t.effect.gain), xtc: String(player.t.buyables[11]), tUpg: player.t.upgrades.slice(), tMs: player.t.milestones.slice(), e: String(player.e.points), eBest: String(player.e.best), enh: String(player.e.buyables[11]), eUpg: player.e.upgrades.slice(), eMs: player.e.milestones.slice(), s: String(player.s.points), sBest: String(player.s.best), sUpg: player.s.upgrades.slice(), sMs: player.s.milestones.slice(), space: String(layers.s.space()), spent: String(player.s.spent), bld: [11,12,13,14].map(function(i){return String(player.s.buyables[i])}), sb: player.sb.unlocked, uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder]})`;

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
export async function chain({ tag = 'chain', from = FRONTIER, legs = 1, ticks = 15000, to = 'M16', opt = {}, ladderFrom = 'M10' }) {
  const dir = fs.mkdtempSync(path.join(TMP, `${tag}-`));
  const all = { tag, marks: {}, legs: [], samples: [], wallMs: 0, ticksMs: 0, gameSeconds: null, hashGame: null, ok: true, stopped: null };
  let snapshot = from, fromMark = ladderFrom;
  for (let leg = 0; leg < legs; leg++) {
    const r = await job('ptr', {
      profile: 'all', diff: 1, ticks, 'wall-ms': 900000, ladder: PTR_LADDER, from: fromMark, to,
      'from-snapshot': snapshot, 'stop-snapshot': dir, 'stop-snapshot-name': `LEG${leg}`,
      eval: READOUT, stall: 100000, ...opt,
    });
    all.legs.push({ leg, ok: !!r.ok, ticks: r.ticks, gameSeconds: r.gameSeconds, hashGame: r.hashGame, why: r.ladder?.stoppedAt?.why, ticksMs: r.ticks_ms, wallMs: r.load.wallMs, load: r.load, error: r.error || null });
    all.wallMs += r.load.wallMs; all.ticksMs += r.ticks_ms || 0;
    all.gameSeconds = r.gameSeconds; all.hashGame = r.hashGame; all.stopped = r.ladder?.stoppedAt || null;
    all.samples.push({ leg, gameSeconds: r.gameSeconds, eval: r.eval || null, actions: r.hook?.actions || null });
    for (const m of r.ladder?.reached || []) if (!all.marks[m.id]) all.marks[m.id] = m;
    if (!r.ok) { all.ok = false; all.error = r.error; break; }
    if (r.ladder?.stoppedAt?.why === 'to') break;
    snapshot = path.join(dir, `LEG${leg}.json`);
    if (!fs.existsSync(snapshot)) { all.ok = false; all.error = 'no stop snapshot'; break; }
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
const XTC = 'include=buyables:t';
const ERES = 'policy:buyables:e=reserve>=next-upgrade';
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

const PARTS = { 1: part1, chain: partChain };
if (!PARTS[PART]) { console.error(`unknown --part ${PART} (have: ${Object.keys(PARTS).join(', ')})`); process.exit(2); }
await PARTS[PART]();
if (!a['no-summary']) appendSection({ title: `gate R1′ part ${PART} — the ladder from the frontier under the simple system`, commit, dirty, rows, slug: `r1-${PART}` });
console.log(`\n${rows.filter((r) => r.ok).length}/${rows.length} green`);
