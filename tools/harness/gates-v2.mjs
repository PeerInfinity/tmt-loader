// The V2 gates — the STRATEGY TABLE, the two new reset strategies, and the EDITABLE `Advanced` subtab (plan §18).
//   node gates-v2.mjs --part 1|2|3|4|5|6 [--no-summary] [--assert] [--pool N] [--shard i/N]
//
// Part 1  SCHEMA ≡ BEHAVIOUR (node, seconds). `loader/strategies.test.mjs` over the stub engine, RUN HERE and
//         required green — round-trip for every row, the validator's accept/refuse set, every parameter driven so
//         the decision moves when the value does — plus the derived-ness of the alphabet read out of a real game.
// Part 2  THE STALL, FIXED, BY NAME (node, ~1 h). The user's stall from `all/M16.json` (plan §17), each strategy
//         twice, with the three controls the planner measured beside them, plus the row-2 sanity leg.
//         ⛔ REPORT, NOT DECIDE: this part moves no default and writes nothing into `games-auto/`.
// Part 3  DETERMINISM AND RESUME (node, ~15 min). Twice-equal `hashGame` for both new strategies; and a run
//         snapshotted MID-STALL-CLOCK and MID-HOLD, then resumed, equal to the uninterrupted one.
// Part 4  AN EDIT IS NOT COSMETIC (page). A real typed / selected edit on ptr and on something changes
//         `explain()`'s `policy.inForce`, is written to the save, SURVIVES A RELOAD, returns to the default on one
//         press, is REFUSED loudly when the strategy cannot parse it, cannot fire a game HOTKEY while being typed,
//         and changes what the feature DOES — against a two-load control that measures its own floor first.
// Part 5  INERTNESS (node, ~5 min). With no edit made, M15 → M16 is still 24179 / `9e2eadb7c58c0078` with equal
//         action counts, and the new save key is PRESENT AND EMPTY on both a fresh boot and an old snapshot.
// Part 6  THE ROSTER (page, ~20 min). Every game opens `Advanced` with the loader's own components rendered and
//         accepting an edit. ONE control family: a game that would need anything else is a RED, not a fallback.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { REPO, GAMES, parseArgs, startServer, headCommit, treeDirty, writeJSON, entryOnly, assignShards, parseShard } from './lib.mjs';
import { appendSection } from './summary.mjs';
entryOnly(import.meta.url);

const a = parseArgs(process.argv.slice(2), ['no-summary', 'assert']);
const PART = String(a.part || '1');
const commit = headCommit(), dirty = treeDirty();
const rows = [];
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 900)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH, for `--assert` (CI) — the same reasoning as `gates-v1`'s `ROWS`: a battery
// that dies part-way prints fewer rows, and fewer rows is fewer reds. These are the exact counts each part emits.
const ROWS = { 1: 3, 2: 13, 3: 5, 4: 8, 5: 3, 6: 1 };

// ⚠ V3 ADDED TWO COMPONENTS (`tmtl-watch`, `tmtl-progress`) and V4b ADDED ONE (`tmtl-reset`), so what was the
// literal 4 here is now a DECLARED count in one place. It is deliberately not read off `tmtLoader.componentNames` —
// a gate that asks the thing it is judging how many it should have is not a gate.
const COMPONENTS_EXPECTED = 7;
const SNAP = (id, m) => `tools/harness/snapshots/${id}/all/${m}.json`;
// The R1′ leg V1's inertness is measured on, and V2's after it (plan §14d, §16.1).
const M16_PIN = { ticks: 24179, hashGame: '9e2eadb7c58c0078' };
// ⚠ THE WHOLE CONFIGURATION, NOT THE ONE FEATURE THAT MOVED (plan §14d.2 item 14): every measurement below names
// the policy it ran under, so a later default move cannot silently re-point what these numbers describe.
const Q = (cell) => `policy:reset:q=${cell}`;

// ---- a pool of run.mjs children ---------------------------------------------------------------------------------
const POOL = Number(a.pool || 3);
let running = 0;
const queue = [];
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v2-')), 'r.json');
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
const runUnit = (file) => new Promise((resolve) => {
  const c = spawn(process.execPath, ['--test', file], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
  let o = '';
  c.stdout.on('data', (d) => { o += d; });
  c.stderr.on('data', (d) => { o += d; });
  c.on('exit', (code) => resolve({ code, out: o, pass: (/^# pass (\d+)/m.exec(o) || [])[1], fail: (/^# fail (\d+)/m.exec(o) || [])[1] }));
});

// ---- Part 1: schema ≡ behaviour ---------------------------------------------------------------------------------
// ⛔ THE UNIT TESTS ARE RUN HERE, not cited. A list of properties a test file claims to check is worth nothing
// unless the file passed in the same run that quotes it — the same rule `gates-v1 --part 1` applies to the
// constructed reason codes.
async function part1() {
  const unit = await runUnit('loader/strategies.test.mjs');
  row({ gate: 'V2-1 the strategy table: round-trip, the validator\'s accept/refuse set, every parameter DRIVEN', id: '—',
    leg: 'loader/strategies.test.mjs (stub engine)', ok: unit.code === 0 && unit.fail === '0',
    notes: `${unit.pass} passed, ${unit.fail} failed${unit.code === 0 ? '' : '\n' + unit.out.split('\n').filter((l) => /^not ok|error:/.test(l)).slice(0, 8).join('\n')}` });
  const r2 = await runUnit('loader/reasons.test.mjs');
  row({ gate: 'V2-1 V1\'s reason vocabulary still holds with the three new codes in it', id: '—', leg: 'loader/reasons.test.mjs',
    ok: r2.code === 0 && r2.fail === '0', notes: `${r2.pass} passed, ${r2.fail} failed` });

  // …and the DERIVED-NESS itself, read out of a booted game rather than out of the source: the alphabet a chooser
  // walks IS the table's rows, every default string validates, and nothing in the table names a game or a layer.
  const probe = `(function(){
    var T = tmtLoader, out = { kinds: {}, defaults: {}, bad: [], names: [] };
    var all = T.strategies().concat(T.modifiers());
    for (var k in T.policyTemplates) {
      out.kinds[k] = { alphabet: T.policyTemplates[k], fromTable: T.strategies(k).map(function (S) { return S.id; }) };
      for (var i = 0; i < T.policyTemplates[k].length; i++) {
        var d = T.defaultPolicyString(k, T.policyTemplates[k][i]);
        out.defaults[k + ' ' + T.policyTemplates[k][i]] = d;
        if (!T.policyOk(k, d)) out.bad.push(k + ' ' + d);
        if (T.formatPolicy(k, T.parsePolicy(k, d)) !== d) out.bad.push('round-trip ' + k + ' ' + d);
      }
    }
    out.count = all.length;
    out.components = T.componentNames;
    out.vue = T.vueVersion;
    return out;
  })()`;
  // ⛔ AND THE TABLE IS THE SAME TABLE ON EVERY GAME — which is what "generic, no layer names anywhere" actually
  // means, measured rather than searched for.
  // ⚠ The first cut searched the table's own prose for each game's layer ids and names. It cannot work: ptr's
  // layers are `a`, `b`, `t`, `s`, `h`, `n`, and a single letter is also an English word and a parameter
  // placeholder — "K times longer" flagged `t` / Time, and every other one-letter id followed. A word search over
  // prose cannot answer "does this name a layer"; comparing the table across games can.
  const shape = `(function(){ var T = tmtLoader; return JSON.stringify({ s: T.strategies(), m: T.modifiers(), t: T.paramTypes(), a: T.policyTemplates }); })()`;
  const [r, sameA, sameB] = await Promise.all([
    job('ptr', { ticks: 0, profile: 'all', eval: probe }),
    job('ptr', { ticks: 0, profile: 'all', eval: shape }),
    job('something', { ticks: 0, profile: 'all', eval: shape }),
  ]);
  const identical = !!sameA.eval && sameA.eval === sameB.eval;
  const e = r.eval || {};
  const mismatched = Object.entries(e.kinds || {}).filter(([, v]) => JSON.stringify(v.alphabet) !== JSON.stringify(v.fromTable)).map(([k]) => k);
  row({ gate: 'V2-1 the alphabet, the validator and the defaults are all DERIVED from the one table', id: 'ptr', leg: `${e.count} row(s)`,
    ok: !!r.ok && mismatched.length === 0 && (e.bad || []).length === 0 && identical,
    notes: `policyTemplates ≡ the table for every kind: ${mismatched.length === 0} (${mismatched.join(', ') || 'none mismatched'}); defaults that do not validate or round-trip: ${(e.bad || []).join(', ') || 'none'}; the WHOLE table (rows, modifiers, parameter types, alphabet) is byte-identical on ptr and on something: ${identical} (${(sameA.eval || '').length} chars) — the strategies are generic, so no game can have its own; Vue in NODE: ${e.vue === null ? 'the harness STUB (boot.mjs:119), which has no version and renders nothing' : e.vue} — the four definitions are handed to it and go nowhere, which is why the components are judged in the page (part 4): ${JSON.stringify(e.components)}; ${JSON.stringify(e.defaults)}` });
}

// ---- Part 2: the stall, fixed, by name --------------------------------------------------------------------------
// ⛔ THE USER'S OWN STALL (plan §17). From `all/M16.json` with `?profile=all`, `reset:q` under the derived default
// `gain>=2x` stops at M19 (24607) and reads "Waiting — gain 2.00 of 6.00 (2× the 3.00 held)" for the remaining
// ~11,500 game-seconds. The planner measured three controls ONE RUN EACH; every cell here is run TWICE and a cell
// whose two runs disagree is RED, because a number measured once is not a measurement.
const STALL_CELLS = [
  { key: 'gain>=2x (the derived default — the STALL)', cell: 'gain>=2x' },
  { key: 'gain>=2x|stall>=3x/5 (the user\'s fallback)', cell: 'gain>=2x|stall>=3x/5' },
  { key: 'gain>=2x|stall>=2x/5 (a tighter K)', cell: 'gain>=2x|stall>=2x/5' },
  { key: 'rate-peak@0/0 (the bare rule — the CONTROL for the two buffers)', cell: 'rate-peak@0/0' },
  { key: 'rate-peak@0.1/30 (the provisional defaults)', cell: 'rate-peak@0.1/30' },
  { key: 'rate-peak@0.25/0 (value buffer only)', cell: 'rate-peak@0.25/0' },
  { key: 'rate-peak@0/120 (time buffer only)', cell: 'rate-peak@0/120' },
  { key: 'always (planner control)', cell: 'always' },
  { key: 'gain>=2 (planner control — the digest\'s literal)', cell: 'gain>=2' },
  { key: 'unlocks-purchase (planner control — stalls earlier)', cell: 'unlocks-purchase' },
];
async function part2() {
  const base = { profile: 'all', diff: 1, ticks: 12000, 'from-snapshot': SNAP('ptr', 'M16'), ladder: 'tools/harness/ladder/ptr.json', to: 'M22' };
  for (const C of STALL_CELLS) {
    const [A, B] = await Promise.all([job('ptr', { ...base, 'auto-opt': Q(C.cell) }), job('ptr', { ...base, 'auto-opt': Q(C.cell) })]);
    const mk = (r) => Object.fromEntries((r.ladder?.reached || []).map((m) => [m.id, m.gameSeconds]));
    const ma = mk(A), mb = mk(B);
    const same = A.ticks === B.ticks && A.hashGame === B.hashGame && JSON.stringify(ma) === JSON.stringify(mb);
    row({ gate: 'V2-2 the stall from all/M16.json', id: 'ptr', leg: C.key, ok: !!A.ok && !!B.ok && same, ticks: A.ticks, hash: A.hashGame,
      notes: `M20 ${ma.M20 ?? '—'} · M22 ${ma.M22 ?? '—'} · marks ${JSON.stringify(ma)}; resets of q ${A.hook?.actions?.['reset:q'] ?? '—'}; stoppedAt ${A.ladder?.stoppedAt?.why}; TWICE EQUAL ${same} (run 2 ${B.ticks}/${B.hashGame}, marks ${JSON.stringify(mb)}); ${Math.round(A.wallMs / 1000)} s` });
  }
  // ⛔ THE ROW-2 SANITY LEG. A strategy that breaks the frontier stall and RUINS the opening is not an improvement,
  // so each new strategy also runs the leg R1′ measured `reset:e` on — `all/M15` → M16, whose shipped answer is
  // 24179. `reset:e` is row 2's only NORMAL layer, which is why it is the one that can tell the difference.
  for (const cell of ['rate-peak@0/0', 'rate-peak@0.1/30', 'gain>=2x|stall>=3x/5']) {
    const o = { profile: 'all', diff: 1, ticks: 12000, 'from-snapshot': SNAP('ptr', 'M15'), ladder: 'tools/harness/ladder/ptr.json', to: 'M16', 'auto-opt': `policy:reset:e=${cell}` };
    const r = await job('ptr', o);
    const m = (r.ladder?.reached || []).find((x) => x.id === 'M16');
    row({ gate: 'V2-2 row 2 sanity: all/M15 → M16 with the new strategy on reset:e', id: 'ptr', leg: `reset:e=${cell}`, ok: !!r.ok,
      ticks: r.ticks, hash: r.hashGame, notes: `M16 ${m ? m.gameSeconds : 'NOT REACHED'} against the shipped 24179 (gain>=2x); stoppedAt ${r.ladder?.stoppedAt?.why}; resets of e ${r.hook?.actions?.['reset:e'] ?? '—'}; ${Math.round(r.wallMs / 1000)} s` });
  }
}

// ---- Part 3: determinism and resume -----------------------------------------------------------------------------
// ⛔ THE MEMORY REALLY IS IN `runtimeState()`. A run cut in half and resumed must carry the new strategies' memory
// across the cut — and the cut has to land MID-CLOCK for the claim to mean anything: mid stall clock for the
// modifier, mid HOLD for `rate-peak`'s time buffer. The mutant "the clock lives in a closure" reds exactly this.
//
// ⛔⛔ AND THE CLAIM IS THE MEMORY AND THE ACTIONS, NOT THE END-STATE HASH — MEASURED, after the first cut of this
// leg asserted the hash and went red on both arms. **A cut-and-resume is not equal to an uninterrupted run on this
// fixture, and automation has nothing to do with it.** Driven with `--profile off`, where no feature runs at all:
// ptr `all/M16` + 200 ticks against the same run cut at 100, seven differing leaves, and they name the cause —
// `player.time` 1789851460523 → 1789851466315 and `player.offTime.remain` 348659.923 → 348665.715, a difference of
// exactly the 5.8 wall-clock SECONDS the snapshot spent on disk, with `points`, `p.points`, `p.best`, `p.total` and
// `g.power` following it. The engine credits OFFLINE TIME for the gap between the snapshot and the resumed boot;
// `time` and `offTime` are in the state mask, their CONSEQUENCE is not, and zeroing `offTime.remain` in a
// `--predicates` (which runs after `load()`) is too late to stop it. So the hash cannot be part of this claim, and
// the floor row below is what says so out loud rather than leaving a green that quietly dropped its hardest check.
// ⚠ The EXACT end-state equality does exist where a re-boot is not involved: `loader/strategies.test.mjs` restores a
// mid-run `runtimeState()` in ONE process and requires the resumed run to land on the uninterrupted run's state,
// and `gates-v2 --part 1` runs it.
async function part3() {
  const CELLS = [
    // ⚠ K = 1, not the default 3: the fallback has to actually FIRE in the second half, or the mutant that loses the
    // memory changes nothing in the window and the leg is vacuous. Measured at the default: q's stall clock needs
    // ~3657 game-s from its last reset at 24605, which is past the end of this leg.
    { key: 'gain>=2x|stall>=1x/5 — cut MID-STALL-CLOCK', cell: 'gain>=2x|stall>=1x/5', want: ['stallIntervals', 'stallSince'] },
    { key: 'rate-peak@0.1/60 — cut MID-HOLD', cell: 'rate-peak@0.1/60', want: ['rateBest'] },
  ];
  for (const C of CELLS) {
    // ⛔ FROM `all/M18.json`, NOT `all/M16.json` — and the reason is the second half of what R2 broke here. Both
    // cells are about `reset:q`'s own runtime memory, so the leg has to start where `reset:q` can ACT. At the M16
    // this gate was written against (24179 game-s) q was already unlocked, because the old `reset:q = gain>=2x`
    // fired on an empty purse and unlocked it at 16917. R2's M16 is 17058 and q does not unlock until M17 at 23492,
    // so from there `decideReset` returns `cannot-reset` before the rate rule is ever consulted and `rateBest` is
    // empty at EVERY cut tick the probe tried (measured: 600/900/1200/1500/1800/2100/2400, all `rateBest=0`).
    // `all/M18.json` is the first fixture where q is unlocked AND has milestones, so the memory this row is about
    // actually exists there.
    const base = { profile: 'all', diff: 1, 'from-snapshot': SNAP('ptr', 'M18'), 'auto-opt': Q(C.cell) };
    const RT = 'tmtLoader.runtimeState()';
    const [A, B] = await Promise.all([job('ptr', { ...base, ticks: 3000, eval: RT }), job('ptr', { ...base, ticks: 3000, eval: RT })]);
    const twice = A.ticks === B.ticks && A.hashGame === B.hashGame && JSON.stringify(A.hook?.actions) === JSON.stringify(B.hook?.actions);
    row({ gate: 'V2-3 twice equal', id: 'ptr', leg: C.key, ok: !!A.ok && !!B.ok && twice, ticks: A.ticks, hash: A.hashGame,
      notes: `run 1 ${A.ticks}/${A.hashGame}, run 2 ${B.ticks}/${B.hashGame}; actions equal ${JSON.stringify(A.hook?.actions) === JSON.stringify(B.hook?.actions)}; memory ${JSON.stringify(newMemory(A.eval))}` });

    // ⛔ THE CUT TICK IS DERIVED, NOT A LITERAL — and the literal is what R2 broke. This leg's claim is that a run
    // cut **MID-clock** carries its memory, so the cut has to LAND mid-clock; a fixed 1500 did, at the `all/M16.json`
    // this gate was written against. R2 moved that fixture (24179 → 17058 game-s) and 1500 then landed just after a
    // reset had cleared `rateBest`, so `midClock` read false and the row went red — CI run 35497627066, which is a
    // tuned constant going stale, not a defect in the code under test. Probe instead: walk a bounded ladder of cut
    // ticks and take the FIRST whose CUT snapshot actually carries the memory this cell is about. The row names the
    // tick it used and every tick it tried, so a cell that finds none is still legible.
    const CUT_TICKS = [1500, 1200, 1800, 900, 2100, 600, 2400];
    let cut = null, mem = {}, cutAt = null, dir = null;
    const tried = [];
    for (const t of CUT_TICKS) {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v2-cut-'));
      cut = await job('ptr', { ...base, ticks: t, 'stop-snapshot': dir, 'stop-snapshot-name': 'CUT' });
      cutAt = t;
      try { mem = JSON.parse(fs.readFileSync(path.join(dir, 'CUT.json'), 'utf8')).runtime.auto || {}; } catch (e) { mem = {}; }
      tried.push(`${t}:${C.want.map((k) => `${k}=${(mem[k] && Object.keys(mem[k]).length) || 0}`).join(',')}`);
      if (C.want.every((k) => mem[k] !== undefined && Object.keys(mem[k]).length > 0)) break;
    }
    const rest = await job('ptr', { profile: 'all', diff: 1, ticks: 3000 - cutAt, 'from-snapshot': path.join(dir, 'CUT.json'), 'auto-opt': Q(C.cell), eval: RT });
    const carried = ['stallIntervals', 'stallSince', 'stallFired', 'rateBest', 'rateHold'].filter((k) => mem[k] !== undefined);
    const midClock = C.want.every((k) => mem[k] !== undefined && Object.keys(mem[k]).length > 0);
    const sameMem = JSON.stringify(newMemory(rest.eval)) === JSON.stringify(newMemory(A.eval));
    const sameActs = JSON.stringify(rest.hook?.actions) === JSON.stringify(A.hook?.actions);
    const ok = !!cut.ok && !!rest.ok && rest.ticks === A.ticks && midClock && sameMem && sameActs;
    row({ gate: 'V2-3 a run cut MID-clock and resumed carries the memory, and acts identically', id: 'ptr', leg: C.key, ok, ticks: rest.ticks, hash: rest.hashGame,
      notes: `cut at ${cut.ticks} (tick ${cutAt} of the probe ladder; tried ${tried.join(' ')}), resumed to ${rest.ticks}; the snapshot's runtime CARRIES ${carried.join(', ') || 'NOTHING — the clock is not in runtimeState'} ${JSON.stringify(carried.reduce((o, k) => (o[k] = mem[k], o), {}))}; the cut landed MID-clock (${C.want.join(' + ')} non-empty): ${midClock}; the resumed run's own memory EQUALS the uninterrupted run's: ${sameMem} (${JSON.stringify(newMemory(rest.eval))} vs ${JSON.stringify(newMemory(A.eval))})${Object.keys(newMemory(A.eval)).length ? '' : ' ⚠ BOTH EMPTY at the stop, so this half is vacuous on this cell — a reset immediately before the end clears rate-peak\'s memory by design; what carries the claim here is the MID-CLOCK snapshot above and the action counts below, and the mutant that keeps the memory in a closure reds the first of those'}; action counts equal: ${sameActs}; ⚠ hashGame ${rest.hashGame} against ${A.hashGame} is NOT asserted — see the floor row` });
  }
  // ⛔ THE FLOOR, WITH NO AUTOMATION IN IT AT ALL. Without this row the two above would read as "we chose not to
  // check the hash"; with it, the reason is a measurement.
  const F = { profile: 'off', diff: 1, 'from-snapshot': SNAP('ptr', 'M16'), ticks: 200 };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v2-floor-'));
  const full = await job('ptr', { ...F, eval: '({ time: player.time, off: player.offTime && player.offTime.remain, pts: String(player.points) })' });
  const half = await job('ptr', { ...F, ticks: 100, 'stop-snapshot': dir, 'stop-snapshot-name': 'CUT' });
  const back = await job('ptr', { profile: 'off', diff: 1, ticks: 100, 'from-snapshot': path.join(dir, 'CUT.json'), eval: '({ time: player.time, off: player.offTime && player.offTime.remain, pts: String(player.points) })' });
  const moved = full.hashGame !== back.hashGame;
  const gapMs = (back.eval?.time || 0) - (full.eval?.time || 0);
  const gapOff = (back.eval?.off || 0) - (full.eval?.off || 0);
  row({ gate: 'V2-3 the FLOOR: a cut-and-resume is not byte-equal even with NO automation running', id: 'ptr', leg: 'profile OFF, 200 ticks against 100 + 100', ok: !!full.ok && !!back.ok && moved,
    ticks: full.ticks, hash: full.hashGame,
    notes: `uninterrupted ${full.hashGame}, cut-and-resumed ${back.hashGame} — different: ${moved}. The cause, in the engine's own fields: player.time ${full.eval?.time} → ${back.eval?.time} (${Math.round(gapMs)} ms) and player.offTime.remain ${full.eval?.off} → ${back.eval?.off} (${gapOff.toFixed(3)} s) — the same gap, which is the wall-clock time the snapshot spent on disk; points ${full.eval?.pts} → ${back.eval?.pts} follows it. `
      + `⚠ THIS ROW IS GREEN WHEN THE HASHES DIFFER, because that is the measured property; if it ever goes RED the harness has become resume-exact and the two rows above should assert the hash again` });
}
/** Only the memory V2 added — the rest of runtimeState() is V1's and is not what this part is about. */
function newMemory(rt) {
  const o = {};
  for (const k of ['stallIntervals', 'stallSince', 'stallFired', 'rateBest', 'rateHold']) if (rt && rt[k] !== undefined) o[k] = rt[k];
  return o;
}

// ---- the page ---------------------------------------------------------------------------------------------------
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
const redraw = (page) => page.evaluate(() => { updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); });
const showAdvanced = async (page) => {
  await page.evaluate(() => { showTab('au'); });
  await redraw(page);
  await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
  await redraw(page);
  await page.waitForTimeout(200);
};

// ---- Part 4: an edit is not cosmetic ----------------------------------------------------------------------------
// ⚠ EVERY LOCATOR NAMES ITS FEATURE. The first cut used `input.tmtl-input` with `.first()` and typed into whichever
// feature happened to be drawn first, then reported that the value had not committed — the leg was measuring the
// wrong block. The components carry `data-fid`, so a gate points at ONE feature.
async function part4(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    const { context, page } = await openGamePage(browser, base, id, '&profile=all');
    try {
      await showAdvanced(page);
      const target = await page.evaluate(() => {
        const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded');
        return r ? { fid: r.id, inForce: r.policy.inForce, strategy: r.policy.strategy, base: r.policy.base } : null;
      });
      check(!!target, `the Advanced tab is showing an editable reset feature (${target ? target.fid + ' at ' + target.inForce : 'NONE'})`);
      if (!target) throw new Error('nothing to edit');
      const sel = (q) => page.locator(`#app ${q}[data-fid="${CSS_ESC(target.fid)}"]`).first();

      // ⛔ THE COMPONENTS ARE THE LOADER'S OWN ON EVERY GAME — `ptr` registers NONE of the engines' three input
      // components, which is the whole reason they are supplied rather than depended on.
      const present = await page.evaluate(() => ({
        selects: document.querySelectorAll('#app select.tmtl-select').length,
        engineHas: ['text-input', 'slider', 'drop-down'].filter((n) => !!(window.Vue && Vue.options.components[n])),
        ours: tmtLoader.componentNames, vue: Vue.version,
      }));
      check(present.selects > 0 && present.ours.length === COMPONENTS_EXPECTED,
        `the loader's own components rendered: ${present.selects} picker(s), ${JSON.stringify(present.ours)} — Vue ${present.vue}, this engine's own inputs: ${present.engineHas.join(', ') || 'NONE of text-input / slider / drop-down'}`);

      // ---- a real SELECT of a different strategy ------------------------------------------------------------
      const options = await sel('select.tmtl-select').locator('option:not([disabled])').evaluateAll((os) => os.map((o) => o.value));
      const want = options.find((o) => o !== target.strategy);
      await sel('select.tmtl-select').selectOption(want);
      await redraw(page);
      await page.waitForTimeout(150);
      const afterSel = await page.evaluate((fid) => {
        const r = tmtLoader.explain().find((x) => x.id === fid);
        return { inForce: r.policy.inForce, strategy: r.policy.strategy, stored: (player.au.edits[fid] || {}).policy };
      }, target.fid);
      check(afterSel.strategy === want && afterSel.inForce !== target.inForce,
        `a real <select> changed explain()'s policy.inForce: ${target.inForce} → ${afterSel.inForce} (strategy ${want})`);
      check(afterSel.stored === afterSel.inForce, `…and it is IN THE SAVE: player.au.edits["${target.fid}"].policy = ${afterSel.stored}`);

      // ---- a real TYPED edit, into THIS feature's own field ---------------------------------------------------
      await page.evaluate((fid) => { tmtLoader.setSavedPolicy(fid, 'interval>=10'); }, target.fid);
      await redraw(page);
      await page.waitForTimeout(150);
      const fld = sel('input.tmtl-input');
      check(await fld.count() > 0, `the picked strategy's parameter has an editor of its own (data-fid="${target.fid}")`);
      await fld.click();
      await fld.fill('45');
      await fld.press('Enter');
      await redraw(page);
      await page.waitForTimeout(150);
      const typed = await page.evaluate((fid) => tmtLoader.explain().find((x) => x.id === fid).policy.inForce, target.fid);
      check(typed === 'interval>=45', `a typed value committed on Enter: ${typed}`);

      // a REFUSED value leaves the previous one in force and SAYS so, in this block
      await fld.click();
      await fld.fill('banana');
      await fld.press('Enter');
      await page.waitForTimeout(150);
      const refused = await page.evaluate((fid) => ({
        inForce: tmtLoader.explain().find((x) => x.id === fid).policy.inForce,
        said: Array.from(document.querySelectorAll('#app .tmtl-error')).map((e) => e.textContent.trim()).filter(Boolean),
      }), target.fid);
      check(refused.inForce === 'interval>=45' && refused.said.length > 0,
        `a value the strategy refuses left ${refused.inForce} in force and SAID so in the block: ${JSON.stringify(refused.said)}`);

      // ---- it SURVIVES A RELOAD ---------------------------------------------------------------------------------
      await page.evaluate((fid) => { tmtLoader.setSavedPolicy(fid, 'interval>=45'); save(); }, target.fid);
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      await page.evaluate(() => tmtLoader.pause());
      const reloaded = await page.evaluate((fid) => {
        const r = tmtLoader.explain().find((x) => x.id === fid);
        return { inForce: r.policy.inForce, saved: r.policy.saved, stored: (player.au.edits[fid] || {}).policy };
      }, target.fid);
      check(reloaded.inForce === 'interval>=45' && reloaded.stored === 'interval>=45', `the edit survived a RELOAD: ${JSON.stringify(reloaded)}`);

      // ---- and ONE PRESS puts it back ---------------------------------------------------------------------------
      await showAdvanced(page);
      await sel('button.tmtl-default').click({ timeout: 4000 });
      await redraw(page);
      await page.waitForTimeout(150);
      const back = await page.evaluate((fid) => {
        const r = tmtLoader.explain().find((x) => x.id === fid);
        return { inForce: r.policy.inForce, saved: r.policy.saved, stored: (player.au.edits[fid] || {}).policy };
      }, target.fid);
      check(back.inForce === target.base && back.saved === null && back.stored === undefined,
        `one press returned it to the default ${target.base} and cleared the save entry (${JSON.stringify(back)})`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
    finally { await context.close(); }
    row({ gate: 'V2-4 (page) a real edit: picker, typed value, refusal, reload, one press back', id, leg: 'profile all, au → Advanced', ok, notes: notes.join('; ') });
  }
}
const CSS_ESC = (s) => String(s).replace(/"/g, '\\"');

// ---- Part 4c: the HOTKEY trap, paired ----------------------------------------------------------------------------
// ⛔ BOTH ENGINES ACT ON A BARE LETTER from `document.onkeydown`, so typing `p` into a field would PRESTIGE. Measured
// in each engine's own words: ptr `js/utils.js:997-1012` and something `js/utils.js:308-322` BOTH carry
// `if (onFocused) return` and both define a global `focused(x)` — the brief said 2.2.1 has no such guard and that is
// WRONG; what 2.2.1 lacks is a `text-input` COMPONENT that calls it. The component stops the event at the input
// (the game's handler is on an ANCESTOR), which works even on a fork that defines neither.
// ⚠ AND IT IS PAIRED, ON A STATE WHERE THE CONTROL CAN ACT. `?profile=off` so the automation is not resetting the
// layer out from under the probe, and the page is ticked until the engine's own `canReset` holds — otherwise the
// control key does nothing for a reason that has nothing to do with the guard, and the leg reads "this key is dead
// everywhere".
async function part4c(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    // ⚠ THE GAME MUST FIRST BE IN A STATE WHERE THE HOTKEY WOULD ACT, and on ptr that needs the LAYER UNLOCKED:
    // its handler is `if (player[hotkeys[key].layer].unlocked) onPress()`, and at a fresh save `p` is not. Measured:
    // with `?profile=off` from the start, ptr has NO single-letter hotkey that could act at all and the pair cannot
    // be driven. So the automation runs long enough to unlock the layer and is then switched OFF, which is what
    // stops it resetting the layer out from under the probe.
    const { context, page } = await openGamePage(browser, base, id, '&profile=all');
    try {
      await showAdvanced(page);
      // put a parameterised strategy on the first editable reset feature so there is a field to type into
      const fid = await page.evaluate(() => {
        const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded');
        if (r) tmtLoader.setSavedPolicy(r.id, 'interval>=10');
        return r ? r.id : null;
      });
      await redraw(page);
      await page.waitForTimeout(150);
      // let the game accumulate until a single-letter hotkey of an UNLOCKED layer would really do something
      const hot = await page.evaluate(() => {
        tmtLoader.tick(1, 400);          // under `all`: the layers unlock
        tmtLoader.profile('off');        // …and then nothing automates, so the probe owns the state
        tmtLoader.tick(1, 400);
        const keys = Object.keys(hotkeys || {}).filter((k) => k.length === 1 && /[a-z]/i.test(k)
          && hotkeys[k] && player[hotkeys[k].layer] && player[hotkeys[k].layer].unlocked && tmp[hotkeys[k].layer] && tmp[hotkeys[k].layer].canReset === true);
        return keys[0] || null;
      });
      check(!!hot, `this game has a single-letter hotkey that would ACT at this state: ${hot || 'NONE — the pair below cannot be driven'}`);
      if (hot) {
        const snap = () => page.evaluate(() => tmtLoader.hash());
        const fld = page.locator(`#app input.tmtl-input[data-fid="${CSS_ESC(fid)}"]`).first();
        await fld.click();
        const b0 = await snap();
        await page.keyboard.press(hot);
        await page.waitForTimeout(150);
        const b1 = await snap();
        check(b0 === b1, `a REAL key press of the live hotkey "${hot}" with the caret in the field did not move the game state (${b0})`);
        // the CONTROL: the same real key press, with the field blurred
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await page.waitForTimeout(80);
        await page.keyboard.press(hot);
        await page.waitForTimeout(150);
        const b2 = await snap();
        check(b1 !== b2, `…and the SAME key press outside the field DOES act (${b1} → ${b2}) — so the zero above is the guard, not a dead key`);
        // …and the field still holds what was typed: the key never reached it as a hotkey NOR was swallowed
        const val = await page.evaluate((f) => { const e = document.querySelector(`#app input.tmtl-input[data-fid="${f}"]`); return e ? e.value : null; }, fid);
        check(val !== null, `the field is still there afterwards (value ${JSON.stringify(val)})`);
      }
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
    finally { await context.close(); }
    row({ gate: 'V2-4 (page) a game HOTKEY typed into a field does not reach the game', id, leg: 'profile off, paired against the same key outside the field', ok, notes: notes.join('; ') });
  }
}

// ---- Part 4b: …and it changes what the feature DOES --------------------------------------------------------------
// ⛔ THE FLOOR IS MEASURED FIRST. A page's state is NOT reproducible across two loads — the engine's own interval
// runs between `load()` and `pause()` and leaves its mark in `player` (V1, plan §16.3 item 10) — so two control
// loads are run and their action counts compared BEFORE the edited arm is believed. The edit is chosen to be
// unmistakable (`always` against the derived `gain>=2x`), and the claim is that the edited arm is outside the
// spread the two controls define, not that any two numbers are equal.
async function part4b(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    const arm = async (edit) => {
      const { context, page } = await openGamePage(browser, base, id, '&profile=all');
      try {
        const fid = await page.evaluate(() => { const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded'); return r ? r.id : null; });
        // ⚠ THE EDIT HAS TO CHANGE THE RULE. The first cut always wrote `always`, and `something`'s `reset:unlock`
        // ALREADY runs `always` — so the "edited" arm was byte-identical to the control and the leg read as a
        // failure of the editors rather than of its own choice of edit.
        if (edit && fid) await page.evaluate((f) => {
          const now = tmtLoader.explain().find((x) => x.id === f).policy.inForce;
          // R3c Part 0: `something`'s table is deleted, so its `reset:unlock` is the derived `gain>=2x` — against which
          // `interval>=60` acts 5 times to the control's 3 in 300 ticks (CI run 35565198991: too close to see). The
          // edit goes to `always` unless the rule in force already is it, which is the unmistakable contrast.
          tmtLoader.setSavedPolicy(f, now === 'always' ? 'interval>=60' : 'always');
        }, fid);
        await page.evaluate(() => tmtLoader.tick(1, 300));
        return await page.evaluate((f) => ({ fid: f, acted: tmtLoader.hookStats().actions[f] || 0, inForce: tmtLoader.explain().find((x) => x.id === f).policy.inForce }), fid);
      } finally { await context.close(); }
    };
    try {
      const c1 = await arm(false), c2 = await arm(false), e1 = await arm(true);
      const spread = Math.abs(c1.acted - c2.acted);
      check(c1.fid === e1.fid && c1.inForce === c2.inForce, `all three arms are the same feature under the same rule (${c1.fid}: ${c1.inForce})`);
      check(spread <= Math.max(2, Math.round(0.05 * Math.max(1, c1.acted))), `the FLOOR first: two control loads over 300 ticks acted ${c1.acted} / ${c2.acted} (spread ${spread})`);
      check(e1.inForce !== c1.inForce, `the edited arm really is under a DIFFERENT rule (${c1.inForce} → ${e1.inForce})`);
      check(Math.abs(e1.acted - c1.acted) > spread + 2, `and it ACTED DIFFERENTLY: ${e1.acted} against the controls' ${c1.acted} / ${c2.acted} — a picker that wrote the save while the decision path read the table could not move this`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 300)); }
    row({ gate: 'V2-4 (page) the edit changes what the feature DOES, against a two-load control', id, leg: '300 ticks, three page loads', ok, notes: notes.join('; ') });
  }
}

// ---- Part 4d: the PLAIN page, and ?mobile=1 ----------------------------------------------------------------------
// ⛔ TWO CLAIMS THE OTHER LEGS CANNOT MAKE.
//   (i) THE PLAIN PAGE REGISTERS NOTHING. The component definitions live below `tmt-auto.js`'s contract-only early
//       return, so a page without `?automation=1` must have no `tmtl-*` component in `Vue.options.components` at
//       all — the same promise the rest of the automation makes about `player`, the `au` layer and the DOM.
//   (ii) `?mobile=1` AND AN UNKNOWN COMPONENT NAME. Under the mobile layout the loader's own LAYER LIST reads each
//       tab's `tabFormat` with its own walker (`loader/layerlist.js`), which knows the engines' component names and
//       nothing else. Measured in the source: `emitComp` falls through to `if (!PLURAL[name]) return;`, so a name
//       it does not know costs NOTHING — no chip, no throw. This leg is what turns reading that into a result, and
//       it also takes the 390 px view, where the whole point is that the editors still fit.
async function part4d(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    try {
      // (i) the PLAIN page
      const ctxP = await browser.newContext();
      const pg = await ctxP.newPage();
      const perrs = [];
      pg.on('pageerror', (e) => perrs.push(String(e.message).slice(0, 160)));
      await pg.goto(new URL(`index.html?mod=${encodeURIComponent(id)}`, base).href, { waitUntil: 'load' });
      await pg.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      const plain = await pg.evaluate(() => ({
        automation: tmtLoader.automation,
        ours: Object.keys(Vue.options.components).filter((n) => n.indexOf('tmtl-') === 0),
        names: tmtLoader.componentNames === undefined ? 'undefined' : tmtLoader.componentNames,
        au: player[('au')] === undefined ? 'absent' : 'PRESENT',
      }));
      await ctxP.close();
      check(plain.automation === false && plain.ours.length === 0 && plain.names === 'undefined' && plain.au === 'absent',
        `the PLAIN page: automation ${plain.automation}, tmtl-* components registered ${JSON.stringify(plain.ours)}, tmtLoader.componentNames ${plain.names}, player.au ${plain.au}`);

      // (ii) ?mobile=1 at 390 px
      const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const mp = await ctxM.newPage();
      const merrs = [];
      mp.on('pageerror', (e) => merrs.push(String(e.message).slice(0, 160)));
      mp.on('console', (m) => { if (m.type() === 'error') merrs.push('console: ' + m.text().slice(0, 160)); });
      await mp.goto(new URL(`index.html?mod=${encodeURIComponent(id)}&automation=1&profile=all&mobile=1`, base).href, { waitUntil: 'load' });
      await mp.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      await mp.evaluate(() => tmtLoader.pause());
      await showAdvanced(mp);
      const m0 = merrs.length;
      const mob = await mp.evaluate(() => {
        // the LAYER LIST's own walker over the au tab, with a component name it has never heard of in it
        let chips = null, threw = null;
        try { chips = tmtLoader.layerListUI ? tmtLoader.layerListUI.chipsOf(tmtLoader.auLayer).length : 'no layer list'; }
        catch (e) { threw = String(e.message).slice(0, 120); }
        return { chips, threw,
          selects: document.querySelectorAll('#app select.tmtl-select').length,
          scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          widest: Math.max(0, ...Array.from(document.querySelectorAll('#app select.tmtl-select, #app input.tmtl-input')).map((e) => e.getBoundingClientRect().right)) };
      });
      await ctxM.close();
      check(mob.threw === null, `the layer list's walker met the loader's own component names and did not throw (chips for the au tab: ${mob.chips}; ${mob.threw || 'no error'})`);
      check(mob.selects > 0 && mob.scrollX === false && mob.widest <= 390,
        `at 390 px with ?mobile=1 the editors render and NOTHING overflows: ${mob.selects} picker(s), horizontal page scroll ${mob.scrollX}, rightmost control edge ${Math.round(mob.widest)} px of 390`);
      check(merrs.length - m0 === 0, `…and the mobile view added no console error of its own (${merrs.length - m0}${merrs.length ? '; first: ' + merrs[0] : ''})`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
    row({ gate: 'V2-4 (page) the PLAIN page registers nothing, and ?mobile=1 at 390 px costs nothing', id, leg: 'plain page + mobile layout', ok, notes: notes.join('; ') });
  }
}

// ---- Part 5: inertness -------------------------------------------------------------------------------------------
async function part5() {
// ⛔ THE PIN NAMES ITS CONFIGURATION (§14d.2 item 14, again — R2). This leg's 24179 / `9e2eadb7c58c0078` was
// measured when the table left `reset:q` on the DERIVED `gain>=2x`. R2 moved that entry to `gain>=2` and the same
// leg now reaches M16 at 17058, so the pin is reproduced by NAMING the policy it was measured under rather than
// by inheriting whatever the table says today. The claim this row makes is about THIS slice's own change being
// inert, not about which default ships; the shipped table's L1 leg is pinned by `gates-r2 --part 2`.
  const o = { profile: 'all', diff: 1, ticks: 12000, 'auto-opt': 'policy:reset:q=gain>=2x', 'from-snapshot': SNAP('ptr', 'M15'), ladder: 'tools/harness/ladder/ptr.json', to: 'M16' };
  const [A, B] = await Promise.all([job('ptr', o), job('ptr', o)]);
  const twice = A.ticks === B.ticks && A.hashGame === B.hashGame && JSON.stringify(A.hook?.actions) === JSON.stringify(B.hook?.actions);
  row({ gate: 'V2-5 with NO edit made, the M15 → M16 leg is unmoved', id: 'ptr', leg: 'profile all, diff 1', ok: !!A.ok && !!B.ok && twice && A.ticks === M16_PIN.ticks && A.hashGame === M16_PIN.hashGame,
    ticks: A.ticks, hash: A.hashGame, notes: `run 1 ${A.ticks}/${A.hashGame}, run 2 ${B.ticks}/${B.hashGame}; pin ${M16_PIN.ticks}/${M16_PIN.hashGame} (R1′ §14d, measured before V1 and before V2); action counts equal ${JSON.stringify(A.hook?.actions) === JSON.stringify(B.hook?.actions)}; formats ${A.explain_stats?.formats}, texts ${A.explain_stats?.texts}, decisions ${A.explain_stats?.decisions}; ${Math.round(A.wallMs / 1000)} s` });

  // ⛔ THE NEW SAVE KEY IS PRESENT AND EMPTY — on a FRESH boot (it is in `startData`) and on an OLD SNAPSHOT, where
  // the engines' own `fixSave` / `fixData` must add it. V1 measured that for a FLAT field (`armLocked`); `edits` is
  // a NESTED OBJECT and a different shape, which is exactly why it is re-measured rather than assumed.
  const probe = `({ edits: player[tmtLoader.auLayer].edits, keys: Object.keys(player[tmtLoader.auLayer]), type: Object.prototype.toString.call(player[tmtLoader.auLayer].edits) })`;
  for (const [key, opts] of [['a FRESH boot', { profile: 'all', ticks: 1, diff: 1, eval: probe }],
    ['an OLD snapshot (all/M15, written before V2)', { profile: 'all', ticks: 1, diff: 1, 'from-snapshot': SNAP('ptr', 'M15'), eval: probe }]]) {
    for (const id of ['ptr']) {
      const r = await job(id, opts);
      const e = r.eval || {};
      row({ gate: 'V2-5 player.au.edits is present and EMPTY', id, leg: key, ok: !!r.ok && e.type === '[object Object]' && e.edits && Object.keys(e.edits).length === 0,
        notes: `edits ${JSON.stringify(e.edits)} (${e.type}); player.au keys ${JSON.stringify(e.keys)} — a nested object, so the next editing slice's until / priority / maxActions join the same per-feature entry and cost no further re-record` });
    }
  }
}

// ---- Part 6: the roster -----------------------------------------------------------------------------------------
// ⛔ ONE CONTROL FAMILY. The loader registers its own components, so every game gets the same editors; a game that
// would have needed something else is a RED, not a second family. Judged / abstained / red, abstentions NAMED.
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
        await page.evaluate(() => tmtLoader.tick(1, 30));
        // the paired control (V1 part 6, plan §16.3 item 12): a redraw that changes nothing, taken first
        const b0 = errs.length;
        await redraw(page);
        await page.waitForTimeout(60);
        const perRedraw = errs.length - b0;
        const before = errs.length;
        // ⛔ THE SELECTION MUST COST EXACTLY ONE REDRAW, because the control above is ONE redraw. MEASURED:
        // `showAdvanced()` does two (one to open the tab, one after setting the subtab), so on a game that logs on
        // EVERY redraw the leg saw one extra and called it the subtab's — `arctree`, which logs
        // "We meet an NaN at (e^NaN)NaN" once per `updateTemp()` from its own values (plan §16.3 item 12). The tab
        // is already open here, so the subtab is set and redrawn once, which is what the control measured.
        await page.evaluate(() => { player.subtabs[tmtLoader.auLayer].mainTabs = 'Advanced'; });
        await redraw(page);
        await page.waitForTimeout(200);
        r = await page.evaluate(() => {
          const T = window.tmtLoader, rows = T.explain();
          const editable = rows.filter((x) => x.state !== 'locked' && x.state !== 'excluded');
          const sels = document.querySelectorAll('#app select.tmtl-select');
          const out = { features: T.features.length, rows: rows.length, editable: editable.length, selects: sels.length,
            inputs: document.querySelectorAll('#app input.tmtl-input').length,
            components: T.componentNames.slice(), vue: window.Vue ? Vue.version : null,
            engineInputs: ['text-input', 'slider', 'drop-down'].filter((n) => !!(window.Vue && Vue.options.components[n])),
            unknown: rows.filter((x) => x.last && x.last.code === 'unknown').map((x) => x.id),
            rendered: (document.querySelector('#app').innerText || '').indexOf('What each feature decided') >= 0,
            scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth, accepted: null };
          // …and one of them ACCEPTS AN EDIT, through the loader's own API the component calls.
          // ⚠ THE FEATURE IS THE FIRST ONE WITH AN ALTERNATIVE, NOT THE FIRST ONE ON SCREEN. MEASURED: the first
          // editable row is very often `upgrades:<l>`, whose only alternatives (`order`, `order-then-cheapest`)
          // both NEED an `order[]` that the game's table does not declare — so the picker correctly offers none,
          // and a gate that edited the first row read that as a failure of the editors (the-dressy-tree,
          // the-pro-tree, the-extended-tree, the-omega-tree, the-alphabetree, all in the first minute). A game
          // where NO feature has an alternative abstains by name; it does not red.
          const pick = editable.map((r) => ({ fid: r.id, alt: T.strategyChoices(r.id).filter((c) => c.available && !c.inForce)[0] })).find((x) => x.alt);
          if (pick) {
            const { fid, alt } = pick;
            const was = T.explain().find((x) => x.id === fid).policy.inForce;
            const res = T.setSavedStrategy(fid, alt.id);
            const now = T.explain().find((x) => x.id === fid).policy.inForce;
            T.setSavedPolicy(fid, null);
            out.accepted = { fid, was, to: alt.id, now, ok: res.ok && now !== was, cleared: T.explain().find((x) => x.id === fid).policy.inForce === was };
          } else if (editable.length) {
            out.accepted = { ok: null, why: 'no feature of this game has an alternative strategy available' };
          }
          return out;
        });
        r.perRedraw = perRedraw;
        r.extra = (errs.length - before) - perRedraw;
        r.errs = errs.slice(0, 2);
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    const ok = r.rendered && r.unknown.length === 0 && r.extra <= 0 && r.scrollX === false
      && r.components.length === COMPONENTS_EXPECTED
      && (r.editable === 0 || (r.selects >= 1 && r.accepted && (r.accepted.ok === null || (r.accepted.ok && r.accepted.cleared))));
    judged.push({ id, ok, r });
    if (!ok) row({ gate: 'V2-6 roster: the editable Advanced subtab', id, leg: 'profile all, 30 ticks', ok: false, notes: JSON.stringify(r).slice(0, 700) });
  }
  const red = judged.filter((x) => !x.ok);
  const vues = {};
  judged.forEach((x) => { vues[x.r.vue] = (vues[x.r.vue] || 0) + 1; });
  const lacking = judged.filter((x) => x.r.engineInputs.length === 0).length;
  row({ gate: 'V2-6 the ROSTER: the loader\'s own editors render and accept an edit on every game', id: `${judged.length} judged`, leg: `${ids.length} assigned`,
    ok: red.length === 0 && judged.length > 0,
    notes: `edits driven on ${judged.filter((x) => x.r.accepted && x.r.accepted.ok === true).length} game(s); ${judged.filter((x) => x.r.accepted && x.r.accepted.ok === null).length} game(s) have NO feature with an alternative strategy available (abstained on that check alone, named: ${judged.filter((x) => x.r.accepted && x.r.accepted.ok === null).map((x) => x.id).join(', ') || 'none'}); judged ${judged.length}, RED ${red.length} (${red.map((x) => x.id).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ': ' + abstained.join(' · ') : ''}; pickers ${judged.reduce((s, x) => s + x.r.selects, 0)}, fields ${judged.reduce((s, x) => s + x.r.inputs, 0)}, editable feature rows ${judged.reduce((s, x) => s + x.r.editable, 0)}; Vue versions ${JSON.stringify(vues)}; games registering NONE of the engines' own text-input / slider / drop-down: ${lacking} — every one of them still got the SAME editors, which is the point of the loader registering its own`});
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v2-part6${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- entry ------------------------------------------------------------------------------------------------------
let browser = null, server = null;
try {
  if (PART === '1') await part1();
  else if (PART === '2') await part2();
  else if (PART === '3') await part3();
  else if (PART === '5') await part5();
  else {
    browser = await chromium.launch();
    server = await startServer(REPO);
    if (PART === '4') { await part4(browser, server.url); await part4b(browser, server.url); await part4c(browser, server.url); await part4d(browser, server.url); }
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
if (!a['no-summary']) appendSection({ title: `V2 part ${PART} (\`node tools/harness/gates-v2.mjs --part ${PART}\`)`, commit, dirty, rows });
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v2-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-v2 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
if (a.assert) {
  const want = ROWS[PART];
  const line = `v2-part${PART} VERDICT: rows ${rows.filter((r) => r.ok).length}/${rows.length}${want === undefined ? '' : ` of ${want} expected`}; ${rows.filter((r) => !r.ok).length} RED`;
  console.log(line);
  if (want === undefined) { console.log(`v2-part${PART} REFUSED: no expected row count is declared for this part`); process.exit(1); }
  if (rows.length !== want) {
    console.log(`v2-part${PART} REFUSED: ${rows.length} row(s), expected ${want} — a battery that stops part-way prints fewer rows, and fewer rows is fewer reds`);
    process.exit(1);
  }
}
process.exit(rows.every((r) => r.ok) ? 0 : 1);
