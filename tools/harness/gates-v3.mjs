// The V3 gates — the PROGRESS TRACKER, the STALL WATCH and the collapsible Advanced blocks (plan §21).
//   node gates-v3.mjs --part 1|2|3|4|5|6 [--no-summary] [--assert] [--pool N] [--shard i/N]
//
// Part 1  TRACKER ≡ HARNESS MONITOR (node, ~2 min). The core's seen-set, buyable maxima and last-progress point equal
//         the harness detector's, on a ptr leg and a something leg. ⛔ Two implementations of ONE rule, compared —
//         the monitor's own text is not replaced because it must go on reproducing every committed
//         `stall.lastProgress` pin, `gates-p1a --part 0`'s 10531 among them.
// Part 2  INERTNESS (node, ~10 min). Watch off + tracker off ⇒ M15 → M16 still 24179 / `9e2eadb7c58c0078` with equal
//         action counts and an unchanged `runtimeState()` SHAPE; tracker ON, watch off ⇒ the same `hashGame` and the
//         same action counts, with the full-scan counter at 1; and the frontier's FULL-hash pin unmoved.
// Part 3  THE MACHINE, CONSTRUCTED (node, seconds). `loader/watch.test.mjs` over the stub engine, RUN HERE and
//         required green — no recorded fixture in this repo has two features stalled at once.
// Part 4  BY NAME, ON REAL FIXTURES (node, ~40 min). The `q` stall broken with the watch on and NOTHING edited; the
//         P1a frontier's false stall; and the healthy opening, which a watch must not escalate. Every cell twice.
// Part 5  THE PAGE (ptr and something). The option toggles and persists; a list edit persists across a reload and
//         changes what the feature DOES; the `Progress` subtab renders ≡ `T.progress()`; collapse survives a tick, a
//         subtab switch and a reload; expand-all / collapse-all set every block; typed text renders inert.
// Part 6  THE ROSTER (page, ~25 min). All three subtabs open on every game and the tracker records what the game did.
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
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 1100)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH, for `--assert` (CI) — `gates-v1`'s and `gates-v2`'s rule: a battery that dies
// part-way prints fewer rows, and fewer rows is fewer reds.
const ROWS = { 1: 2, 2: 4, 3: 1, 4: 5, 5: 2, 6: 1 };

const SNAP = (id, m) => `tools/harness/snapshots/${id}/all/${m}.json`;
const FRONTIER = 'tools/harness/snapshots/ptr/frontier/STALL.json';
const M16_PIN = { ticks: 24179, hashGame: '9e2eadb7c58c0078' };
// ⛔ THE RECORD'S SHAPE BEFORE V3, DECLARED HERE rather than read off the run: a gate that asks the thing it judges
// what it should contain is not a gate. `enabled` / `policies` / the V2 blocks appear only when they have something
// to say, so a leg that uses none of them writes exactly these four keys.
const RUNTIME_KEYS_V2 = ['lastReset', 'loopNo', 'ranAt', 'stats'];

// ---- a pool of run.mjs children (gates-v2's, unchanged) ---------------------------------------------------------
const POOL = Number(a.pool || 3);
let running = 0;
const queue = [];
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v3-')), 'r.json');
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

// ---- Part 1: the core's rule and the harness's are the SAME rule -------------------------------------------------
// ⛔ ONE RULE, TWO IMPLEMENTATIONS, COMPARED EVENT FOR EVENT — and that is the honest form of "the harness reads the
// core's" while the harness's copy is load-bearing for pins this slice may not move. The comparison is exact: the
// SEEN-SET (sorted), the BUYABLE MAXIMA, and the TICK the last progress landed on.
// ⚠ THE TICK, NOT THE GAME-SECOND. The monitor records `tmtLoader.gameSeconds` (the harness's own counter) and the
// core records `player.timePlayed` (the game's). They coincide on a fresh run and need not on a resumed one, and a
// leg that compared them would be measuring the harness's bookkeeping rather than the rule.
async function part1() {
  // ⛔ THE LEG MUST RUN LONG ENOUGH TO OWN A BUYABLE, AND THE ROW IS RED WITHOUT ONE. The first cut ran 2000 ticks
  // from a FRESH game on both engines and reported `buyable maxima identical true (0 key(s))` — a comparison of two
  // EMPTY objects, which the mutant "a buyable's maximum is not remembered" walks straight through. A buyable's own
  // running maximum is the one piece of state this rule keeps OUTSIDE the seen-set, so it is the one the leg has to
  // be able to see. ptr owns its first Space Building around 4600 game-seconds; something's are earlier.
  //
  // ⛔⛔ AND THE LEGS ARE FRESH RUNS, NOT RESUMES — MEASURED, and the reason is a real difference between the two
  // copies rather than a bug in either. Resuming `all/M16.json` gave `seen` identical (107 = 107) and `bmax`
  // DIFFERENT over 8 keys: the harness monitor is seeded from the SNAPSHOT's own `runtime.monitor` block, so it
  // continues the memory of the run that wrote the fixture, while the core's tracker arms at the resume point and
  // seeds from the save in front of it. A buyable the original run once held and a reset took away is above the
  // snapshot's live value, so the monitor's maximum is higher. That is each of them being RIGHT about a different
  // question, and it is recorded in `docs/harness.md` rather than papered over here.
  // ⚠ AND THE BUYABLE CLAIM IS CARRIED BY THE LEG THAT CAN MAKE IT, NAMED. MEASURED: `something` under
  // `?profile=all` makes its last progress at tick 759 and OWNS NO BUYABLE in any window this gate can afford — 23
  // are declared and none is bought — so its `bmax` is empty for a reason that is about the GAME, not about the
  // tracker. ptr owns five by tick 7000 with 44 buyable events, which is the leg the mutant has to walk through.
  // A leg that cannot make a claim says which claim it is not making.
  for (const [id, opts, wantBmax] of [
    ['ptr', { ticks: 7000, diff: 1, profile: 'all' }, true],
    ['something', { ticks: 3000, diff: 1, profile: 'all' }, false]]) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v3-mon-'));
    const r = await job(id, { ...opts, 'auto-opt': 'track=1', stall: 1e9, 'stall-seen': true,
      'stop-snapshot': dir, 'stop-snapshot-name': 'STOP',
      eval: '({ core: tmtLoader.progressMonitorState(), p: tmtLoader.progress(), s: tmtLoader.progressStats(), keys: tmtLoader.progressKeys(), counts: tmtLoader.ids().counts })' });
    let mon = null;
    try { mon = JSON.parse(fs.readFileSync(path.join(dir, 'STOP.json'), 'utf8')).runtime.monitor; } catch (e) { mon = null; }
    const core = r.eval?.core || null;
    const seenSame = !!(mon && core) && JSON.stringify([...mon.seen].sort()) === JSON.stringify(core.seen);
    const bmaxSame = !!(mon && core) && JSON.stringify(mon.bmax) === JSON.stringify(core.bmax);
    const lastTick = r.eval?.p?.events?.length ? r.eval.p.events[0].tick : null;
    const tickSame = !!mon && mon.lastTick === lastTick;
    const declared = r.eval?.counts?.buy || 0;
    const nb = core ? Object.keys(core.bmax).length : 0;
    const bmaxSeen = !wantBmax || nb > 0;
    const only = (A, B) => [...A].filter((x) => B.indexOf(x) < 0).slice(0, 6);
    row({ gate: 'V3-1 the core\'s progress rule ≡ the harness monitor\'s, event for event', id, leg: `${opts.ticks} ticks, profile all, --stall-seen`,
      ok: !!r.ok && seenSame && bmaxSame && tickSame && bmaxSeen, ticks: r.ticks, hash: r.hashGame,
      notes: `seen: monitor ${mon ? mon.seen.length : '—'} / core ${core ? core.seen.length : '—'}, identical ${seenSame}`
        + (mon && core && !seenSame ? ` — only in the monitor ${JSON.stringify(only(mon.seen, core.seen))}, only in the core ${JSON.stringify(only(core.seen, mon.seen))}` : '')
        + `; buyable maxima identical ${bmaxSame} over ${nb} key(s) of ${declared} declared buyable(s)`
        + (wantBmax ? ' \u2014 and this leg is RED at zero keys, because two empty objects compare equal, which is the mutant "a buyable\'s maximum is not remembered" walking through'
          : ` \u2014 \u26a0 THIS LEG MAKES NO BUYABLE CLAIM: this game owns none in this window (its last progress is at tick ${mon ? mon.lastTick : '\u2014'}), so both maxima are empty objects; the buyable half of the rule is carried by the ptr leg above`)
        + `; the LAST PROGRESS landed on the same TICK ${tickSame} (monitor ${mon ? mon.lastTick : '\u2014'}, core ${lastTick})`
        + `; the core recorded ${r.eval?.p?.total} event(s) in ${JSON.stringify(r.eval?.p?.byKind)}; cost ${JSON.stringify(r.eval?.s)}; the id alphabet ${JSON.stringify(r.eval?.keys)}; ${Math.round(r.wallMs / 1000)} s` });
  }
}

// ---- Part 2: inertness -------------------------------------------------------------------------------------------
// ⛔ EVERY COMMITTED SNAPSHOT AND EVERY PINNED RESUME STAYS VALID, and this is what measures it rather than asserting
// it. Three claims: with V3 switched off the M15 → M16 leg is byte-identical AND the runtime record has exactly the
// four keys it had before V3; with the TRACKER ON the game is untouched (it only watches); and the FULL-hash pin the
// `au` layer's save shape moves — `gates-p1a --part 0`'s frontier fixture — is unmoved, because V3 added nothing to
// `startData`.
async function part2() {
// ⛔ THE PIN NAMES ITS CONFIGURATION (§14d.2 item 14, again — R2). This leg's 24179 / `9e2eadb7c58c0078` was
// measured when the table left `reset:q` on the DERIVED `gain>=2x`. R2 moved that entry to `gain>=2` and the same
// leg now reaches M16 at 17058, so the pin is reproduced by NAMING the policy it was measured under rather than
// by inheriting whatever the table says today. The claim this row makes is about THIS slice's own change being
// inert, not about which default ships; the shipped table's L1 leg is pinned by `gates-r2 --part 2`.
  const base = { profile: 'all', diff: 1, ticks: 12000, 'auto-opt': 'policy:reset:q=gain>=2x', 'from-snapshot': SNAP('ptr', 'M15'), ladder: 'tools/harness/ladder/ptr.json', to: 'M16' };
  const RT = 'tmtLoader.runtimeState()';
  const A = await job('ptr', { ...base, eval: RT });
  const keys = A.eval ? Object.keys(A.eval).sort() : [];
  const shapeOk = JSON.stringify(keys) === JSON.stringify(RUNTIME_KEYS_V2.slice().sort());
  row({ gate: 'V3-2 with the watch and the tracker OFF, the M15 → M16 leg and the runtime RECORD are unmoved', id: 'ptr', leg: 'profile all, diff 1',
    ok: !!A.ok && A.ticks === M16_PIN.ticks && A.hashGame === M16_PIN.hashGame && shapeOk, ticks: A.ticks, hash: A.hashGame,
    notes: `pin ${M16_PIN.ticks}/${M16_PIN.hashGame} (R1′ §14d, measured before V1, V2 and V3); runtimeState() keys ${JSON.stringify(keys)} against the pre-V3 ${JSON.stringify(RUNTIME_KEYS_V2)}: ${shapeOk} — a `
      + `block that appeared here would invalidate every snapshot in the repo; formats ${A.explain_stats?.formats}, texts ${A.explain_stats?.texts}; ${Math.round(A.wallMs / 1000)} s` });

  // ⛔ THE TRACKER ONLY WATCHES. Same leg, `track=1`: the same end state and the same action counts, with a `progress`
  // block present in the record and the full-scan counter at ONE.
  // ⚠ the policy the pin NAMES has to survive this override, or the leg silently measures a different table
  const B = await job('ptr', { ...base, 'auto-opt': `${base['auto-opt']};track=1`, eval: '({ rt: Object.keys(tmtLoader.runtimeState()).sort(), s: tmtLoader.progressStats(), p: tmtLoader.progress() })' });
  const same = B.ticks === A.ticks && B.hashGame === A.hashGame && JSON.stringify(B.hook?.actions) === JSON.stringify(A.hook?.actions);
  const scans = B.eval?.s?.fullScans;
  row({ gate: 'V3-2 the tracker ON changes NOTHING about the game, and costs one full scan', id: 'ptr', leg: 'the same leg with track=1',
    ok: !!B.ok && same && scans === 1, ticks: B.ticks, hash: B.hashGame,
    notes: `ticks ${B.ticks} vs ${A.ticks}, hashGame ${B.hashGame} vs ${A.hashGame}, action counts equal ${JSON.stringify(B.hook?.actions) === JSON.stringify(A.hook?.actions)}; `
      + `fullScans ${scans} over ${B.ticks} ticks (a mutant that re-walks the save per tick reds this), ${JSON.stringify(B.eval?.s)}; the record now carries ${JSON.stringify(B.eval?.rt)}; `
      + `${B.eval?.p?.total} progress event(s), typical gap ${B.eval?.p?.typicalGap} s; ${Math.round(B.wallMs / 1000)} s` });

  // ⛔ THE FULL HASH, WHICH IS THE ONE V3 COULD HAVE MOVED. `player.au.edits` is the only store this slice writes to
  // and it is `{}` until the player writes — so `startData` is byte-identical and the frontier pin cannot have moved.
  const probe = `({ full: null, au: Object.keys(player[tmtLoader.auLayer]).sort(), edits: player[tmtLoader.auLayer].edits, watch: tmtLoader.watchOptions(), armed: tmtLoader.progress().armed })`;
  for (const [key, opts] of [['a FRESH boot', { profile: 'all', ticks: 1, diff: 1 }], ['the FRONTIER fixture (the gates-p1a pin)', { profile: 'all', ticks: 1, diff: 1, 'from-snapshot': FRONTIER }]]) {
    const r = await job('ptr', { ...opts, eval: probe });
    const e = r.eval || {};
    const clean = e.edits && Object.keys(e.edits).length === 0;
    row({ gate: 'V3-2 V3 added NOTHING to the au layer\'s startData, so no full-hash pin can have moved', id: 'ptr', leg: key,
      ok: !!r.ok && clean && e.armed === false && e.watch && e.watch.watch === false && e.watch.track === false,
      ticks: r.ticks, hash: r.hash,
      notes: `player.au keys ${JSON.stringify(e.au)} — the SAME set V2 left (unlocked, points, features, disclosed, armLocked, edits); edits ${JSON.stringify(e.edits)}; `
        + `the watch and the tracker are OFF on a save that has never been touched: ${JSON.stringify(e.watch)}; the tracker armed: ${e.armed}. `
        + `⚠ The watch's own settings live at the RESERVED entry player.au.edits["*"], which does not exist until the player switches something on — that is why this row can be green at all` });
  }
}

// ---- Part 3: the machine, constructed on the stub ----------------------------------------------------------------
// ⛔ RUN HERE, NOT CITED. A list of properties a test file claims is worth nothing unless the file passed in the same
// run that quotes it — `gates-v1 --part 1` and `gates-v2 --part 1` apply the same rule.
// ⚠ AND IT SAYS SO RATHER THAN ABSTAINING: no recorded fixture in this repo has two features stalled in one tick, so
// the arbiter's leg is CONSTRUCTED. Part 4 says the same thing about the real fixtures from the other side.
async function part3() {
  const unit = await runUnit('loader/watch.test.mjs');
  row({ gate: 'V3-3 the machine: stall → escalate the waiting feature only → progress → cool-off → primary', id: '—',
    leg: 'loader/watch.test.mjs (stub engine)', ok: unit.code === 0 && unit.fail === '0',
    notes: `${unit.pass} passed, ${unit.fail} failed — the arbiter's two-stalled state, the guard that keeps a rescue's gap out of `
      + `typicalGap (with the two medians CONSTRUCTED to differ, or the leg would be green with the guard removed), the hand edit, `
      + `the cool-off, the precedence getter and the restore are all in there. ⚠ No real fixture in this repo shows two features `
      + `stalled at once, which is why that one is constructed rather than abstained on`
      + `${unit.code === 0 ? '' : '\n' + unit.out.split('\n').filter((l) => /^not ok|error:/.test(l)).slice(0, 8).join('\n')}` });
}

// ---- Part 4: by name, on real fixtures ---------------------------------------------------------------------------
// ⛔ REPORT, NOT DECIDE (⚖ the brief's ruling 4): this slice moves no default and writes nothing into `games-auto/`.
// Every cell is run TWICE and a cell whose two runs disagree is RED.
async function part4() {
  const twice = async (id, o) => {
    const [A, B] = await Promise.all([job(id, o), job(id, o)]);
    const mk = (r) => Object.fromEntries((r.ladder?.reached || []).map((m) => [m.id, m.gameSeconds]));
    return { A, B, ma: mk(A), mb: mk(B), same: A.ticks === B.ticks && A.hashGame === B.hashGame && JSON.stringify(mk(A)) === JSON.stringify(mk(B)) };
  };
  const EV = '({ w: tmtLoader.watchState(), p: tmtLoader.progress(), esc: tmtLoader.explain().filter(function(r){return r.escalation && r.escalation.rung;}).map(function(r){return r.id + "@" + r.escalation.rung + "=" + r.policy.inForce;}) })';

  // (a) THE `q` STALL, with the watch ON and NOTHING EDITED — the point of the feature. Against V2's own table
  // (plan §18.2): the derived default `gain>=2x` stops at M19 (24607) and reads "Waiting — gain 2.00 of 6.00" for
  // the remaining ~11,500 game-seconds.
  const qBase = { profile: 'all', diff: 1, ticks: 12000, 'from-snapshot': SNAP('ptr', 'M16'), ladder: 'tools/harness/ladder/ptr.json', to: 'M22', eval: EV };
  for (const [key, opt] of [['the watch OFF — V2\'s shipped answer, the CONTROL', null], ['the watch ON, NOTHING edited (derived lists)', 'watch=1']]) {
    const t = await twice('ptr', opt ? { ...qBase, 'auto-opt': opt } : qBase);
    row({ gate: 'V3-4 the q stall from all/M16.json', id: 'ptr', leg: key, ok: !!t.A.ok && !!t.B.ok && t.same, ticks: t.A.ticks, hash: t.A.hashGame,
      notes: `M19 ${t.ma.M19 ?? '—'} · M20 ${t.ma.M20 ?? '—'} · M21 ${t.ma.M21 ?? '—'} · M22 ${t.ma.M22 ?? '—'} · marks ${JSON.stringify(t.ma)}; resets of q ${t.A.hook?.actions?.['reset:q'] ?? '—'}; `
        + `watch ${t.A.eval?.w?.code} after ${t.A.eval?.w?.events} escalation(s); escalated now ${JSON.stringify(t.A.eval?.esc)}; typical gap ${t.A.eval?.p?.typicalGap} s over ${t.A.eval?.p?.total} event(s); `
        + `stoppedAt ${t.A.ladder?.stoppedAt?.why}; TWICE EQUAL ${t.same}; ${Math.round(t.A.wallMs / 1000)} s` });
  }

  // (b) THE P1a FRONTIER CONTROL. ⛔ The S1 "stall" the seen-set detector called at the frontier was a SLOW IDLE: the
  // simple system walked through it on its own in ~1650 game-seconds (plan §12a.2 item 9, §12b.4 controls (i)/(iii)).
  // A watch that escalates there is escalating a game that was about to move by itself — so the question this row
  // answers is what it DOES, and whether escalating was a mistake, measured against the same leg with it off.
  // ⚠ `--from M10 --to M11`, AND THE FRONTIER'S OWN `--auto-opt` WITH IT. Two things the first cut got wrong and the
  // rows said so by coming back empty in 0 s: the fixture's `mark` is `STALL`, which `--from` defaults to and the
  // ladder has no such entry (`ladderSlice` throws); and the frontier is a state the A2 POLICY SET produced
  // (`config['auto-opt']` in the fixture), so a leg that resumed it under today's table would be measuring a
  // configuration nobody ran. §12b.4's own control (i) is the number this row is against: **M11 at 15782**, from a
  // state at 14131 game-seconds — the S1 "stall" the simple system walks out of by itself in ~1650 game-seconds.
  const FRONTIER_OPT = 'policy:reset:p=interval>=10;policy:reset:t=interval>=5;policy:reset:e=interval>=5;policy:reset:s=interval>=5;policy:buyables:e=buy;exclude=buyables:t';
  const fBase = { profile: 'all', diff: 1, ticks: 3000, 'from-snapshot': FRONTIER, ladder: 'tools/harness/ladder/ptr.json', from: 'M10', to: 'M11', eval: EV };
  for (const [key, opt] of [['the watch OFF — the control that walks through it', null], ['the watch ON, NOTHING edited', 'watch=1']]) {
    const t = await twice('ptr', { ...fBase, 'auto-opt': FRONTIER_OPT + (opt ? ';' + opt : '') });
    row({ gate: 'V3-4 the P1a FRONTIER, where the detector called a stall the game walked out of by itself', id: 'ptr', leg: key,
      ok: !!t.A.ok && !!t.B.ok && t.same, ticks: t.A.ticks, hash: t.A.hashGame,
      notes: `marks ${JSON.stringify(t.ma)} (control (i) reached M11 at 15782); watch ${t.A.eval?.w?.code} after ${t.A.eval?.w?.events} escalation(s); escalated ${JSON.stringify(t.A.eval?.esc)}; `
        + `typical gap ${t.A.eval?.p?.typicalGap} s over ${t.A.eval?.p?.total} event(s), last progress ${t.A.eval?.p?.sinceLast} s ago; actions ${JSON.stringify(t.A.hook?.actions)}; TWICE EQUAL ${t.same}; ${Math.round(t.A.wallMs / 1000)} s` });
  }

  // (c) THE HEALTHY OPENING. ⛔ A watch that escalates here is a DEFECT and the first cut of this slice WAS one: the
  // opening's gaps are 9–15 game-seconds while its quiet stretches are 100+ BY DESIGN (§14d.6), so the game-level
  // test alone fired 13 times and the run reached only M07. The fix is that a feature must ALSO have been waiting
  // at least as long as the stall — and this row is what says the fix holds on the leg that found the defect.
  const oBase = { profile: 'all', diff: 1, ticks: 9000, ladder: 'tools/harness/ladder/ptr.json', to: 'M12', eval: EV };
  const t = await twice('ptr', { ...oBase, 'auto-opt': 'watch=1' });
  const ctl = await job('ptr', oBase);
  const ctlMarks = Object.fromEntries((ctl.ladder?.reached || []).map((m) => [m.id, m.gameSeconds]));
  const untouched = t.A.hashGame === ctl.hashGame && JSON.stringify(t.A.hook?.actions) === JSON.stringify(ctl.hook?.actions);
  row({ gate: 'V3-4 the HEALTHY fresh-game opening is NOT escalated', id: 'ptr', leg: 'fresh game → M12, the watch ON against the same leg with it off',
    ok: !!t.A.ok && !!ctl.ok && t.same && untouched && (t.A.eval?.w?.events === 0), ticks: t.A.ticks, hash: t.A.hashGame,
    notes: `the watch fired ${t.A.eval?.w?.events} time(s) — it must be 0; marks ${JSON.stringify(t.ma)} against the control's ${JSON.stringify(ctlMarks)} (§14d.6: M12 at 6718); `
      + `hashGame ${t.A.hashGame} vs the control's ${ctl.hashGame}, action counts equal ${JSON.stringify(t.A.hook?.actions) === JSON.stringify(ctl.hook?.actions)} — a watch that changed ONE decision in a healthy opening moves both; `
      + `the tracker saw ${t.A.eval?.p?.total} event(s) with a typical gap of ${t.A.eval?.p?.typicalGap} s and reports stalled=${t.A.eval?.p?.stalled} (the GAME-level test alone does fire here, which is why the feature-level one exists); TWICE EQUAL ${t.same}` });
}

// ---- the page ----------------------------------------------------------------------------------------------------
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
const showSub = async (page, which) => {
  await page.evaluate(() => { showTab('au'); });
  await redraw(page);
  await page.evaluate((w) => { player.subtabs[tmtLoader.auLayer].mainTabs = w; }, which);
  await redraw(page);
  await page.waitForTimeout(200);
};
const CSS_ESC = (s) => String(s).replace(/"/g, '\\"');

// ---- Part 5: the page --------------------------------------------------------------------------------------------
async function part5(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    const { context, page, errs } = await openGamePage(browser, base, id, '&profile=all');
    try {
      // ---- the three subtabs, in the ENGINE's own order, with Simple still first -------------------------------
      const tabs = await page.evaluate(() => ({ keys: Object.keys(layers[tmtLoader.auLayer].tabFormat), on: player.subtabs[tmtLoader.auLayer].mainTabs, comps: tmtLoader.componentNames }));
      check(tabs.keys[0] === 'Simple' && tabs.keys.length === 3 && tabs.keys[2] === 'Progress' && tabs.on === 'Simple',
        `the au tab has three subtabs with Simple FIRST (both engines take Object.keys(tabFormat)[0]): ${JSON.stringify(tabs.keys)}, showing ${tabs.on}; components ${JSON.stringify(tabs.comps)}`);

      // ---- the OPTION toggles and persists ----------------------------------------------------------------------
      await showSub(page, 'Advanced');
      const before = await page.evaluate(() => tmtLoader.watchOptions().watch);
      await page.locator('#app button.tmtl-watch-toggle').first().click({ timeout: 5000 });
      await redraw(page);
      await page.waitForTimeout(150);
      const after = await page.evaluate(() => ({ on: tmtLoader.watchOptions().watch, stored: (player.au.edits['*'] || {}).watch, tracking: tmtLoader.watchOptions().track, armed: tmtLoader.progress().armed }));
      check(before === false && after.on === true && after.stored === true && after.tracking === true && after.armed === true,
        `one press turned the stall watch ON, it is IN THE SAVE at the reserved entry, and it armed the tracker with it: ${JSON.stringify(after)}`);

      // ---- a LIST edit persists across a reload AND changes what the feature DOES -------------------------------
      const target = await page.evaluate(() => {
        // ⚠ `>= 1`, NOT `> 1` — MEASURED: `something`'s only editable reset feature at a fresh save is
        // `reset:unlock`, whose derived list has exactly ONE rung, and a leg keyed to two found nothing and threw.
        const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded' && x.escalation && x.escalation.list.length >= 1);
        return r ? { fid: r.id, list: r.escalation.list.slice(), typed: r.escalation.typed } : null;
      });
      check(!!target, `an editable reset feature with a derived escalation list of its own: ${target ? target.fid + ' ' + JSON.stringify(target.list) : 'NONE'}`);
      if (!target) throw new Error('nothing to edit');
      await page.locator(`#app button.tmtl-rung-del[data-fid="${CSS_ESC(target.fid)}"]`).first().click({ timeout: 5000 });
      await redraw(page);
      await page.waitForTimeout(150);
      const edited = await page.evaluate((fid) => ({ list: tmtLoader.escalationList(fid), stored: (player.au.edits[fid] || {}).escalate }), target.fid);
      check(edited.list.typed === true && edited.list.list.length === target.list.length - 1 && Array.isArray(edited.stored),
        `removing a rung wrote the player's OWN list into the save: ${JSON.stringify(edited.list.list)} (was ${JSON.stringify(target.list)})`
        + `${target.list.length === 1 ? ' — ⚠ this list had ONE rung, so what is stored is the EMPTY typed list, which means *never escalate this feature* and is not the same thing as having no list' : ''}`);

      // ---- the PROGRESS subtab renders ≡ T.progress() -----------------------------------------------------------
      await page.evaluate(() => tmtLoader.tick(1, 120));
      await showSub(page, 'Progress');
      const prog = await page.evaluate(() => {
        const p = tmtLoader.progress();
        const rows = Array.from(document.querySelectorAll('#app .tmtl-prog-row')).map((e) => e.textContent.replace(/\s+/g, ' ').trim());
        return { armed: p.armed, total: p.total, cap: p.cap, dropped: p.dropped, drawn: rows.length, first: rows[0] || null,
          firstApi: p.events[0] ? `${p.events[0].at} s ${p.events[0].layer} ${p.events[0].kind} ${p.events[0].id}` : null };
      });
      check(prog.armed && prog.drawn === Math.min(prog.total, prog.cap) && prog.drawn > 0,
        `the Progress subtab drew ${prog.drawn} row(s) for ${prog.total} event(s) (cap ${prog.cap}, dropped ${prog.dropped}) — the view renders T.progress() and computes nothing of its own; newest row "${prog.first}" against the API's "${prog.firstApi}"`);

      // ---- COLLAPSE: survives a tick, a subtab switch and a reload; expand/collapse all set every block ---------
      await showSub(page, 'Advanced');
      const n0 = await page.evaluate(() => document.querySelectorAll('#app button.tmtl-fold').length);
      await page.locator('#app button.tmtl-collapse-all').first().click({ timeout: 5000 });
      await redraw(page);
      await page.waitForTimeout(200);
      const allClosed = await page.evaluate(() => ({
        open: Array.from(document.querySelectorAll('#app button.tmtl-fold')).filter((b) => b.dataset.open === '1').length,
        editors: document.querySelectorAll('#app select.tmtl-select').length,
        prefs: tmtLoader.collapsePrefs(),
      }));
      check(n0 > 1 && allClosed.open === 0 && allClosed.editors === 0,
        `collapse all closed every one of ${n0} block(s) (${allClosed.open} still open, ${allClosed.editors} picker(s) left on screen) and remembered ${allClosed.prefs.closed.length} of them`);
      await page.evaluate(() => tmtLoader.tick(1, 5));
      await redraw(page);
      await showSub(page, 'Progress');
      await showSub(page, 'Advanced');
      const survived = await page.evaluate(() => Array.from(document.querySelectorAll('#app button.tmtl-fold')).filter((b) => b.dataset.open === '1').length);
      check(survived === 0, `…and it survived five ticks and a round trip through another subtab (${survived} block(s) sprang open — the tab re-renders every tick, which is TRAP (ii))`);
      // ⚠ `save()` FIRST, and it is not a detail: the folds are in localStorage and are written the moment they move,
      // while the watch setting is in the SAVE and the page is PAUSED, so nothing has autosaved it. Without this the
      // reload came back with the folds intact and the watch off — which reads exactly like "the setting does not
      // persist" and is really "this leg never asked the game to write it down".
      await page.evaluate(() => { save(); });
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      await page.evaluate(() => tmtLoader.pause());
      await showSub(page, 'Advanced');
      const reloaded = await page.evaluate(() => ({
        open: Array.from(document.querySelectorAll('#app button.tmtl-fold')).filter((b) => b.dataset.open === '1').length,
        folds: document.querySelectorAll('#app button.tmtl-fold').length,
        watch: tmtLoader.watchOptions().watch,
      }));
      check(reloaded.folds > 1 && reloaded.open === 0 && reloaded.watch === true,
        `…and a RELOAD came back with all ${reloaded.folds} collapsed and the watch still on (${reloaded.open} open) — the folds are in localStorage, the watch is in the save`);
      await page.locator('#app button.tmtl-expand-all').first().click({ timeout: 5000 });
      await redraw(page);
      await page.waitForTimeout(200);
      const allOpen = await page.evaluate(() => ({
        closed: Array.from(document.querySelectorAll('#app button.tmtl-fold')).filter((b) => b.dataset.open === '0').length,
        folds: document.querySelectorAll('#app button.tmtl-fold').length,
      }));
      check(allOpen.closed === 0, `expand all opened every block including the ones whose default is collapsed (${allOpen.closed} of ${allOpen.folds} still shut)`);

      // ---- typed text is INERT --------------------------------------------------------------------------------
      const xss = await page.evaluate(() => {
        const r = tmtLoader.explain().find((x) => x.kind === 'reset' && x.state !== 'locked' && x.state !== 'excluded');
        tmtLoader.setSavedParam(r.id, 'n', '<img src=x onerror="window.__tmtXSS=1">');
        tmtLoader.autoProvenance[r.id] = '<b id="tmtl-xss-probe">not markup</b>';
        tmtLoader.invalidateView();
        return r.id;
      });
      await redraw(page);
      await page.waitForTimeout(200);
      const inert = await page.evaluate(() => ({ fired: !!window.__tmtXSS, injected: !!document.getElementById('tmtl-xss-probe'), shown: (document.querySelector('#app').innerText || '').indexOf('not markup') >= 0 }));
      check(!inert.fired && !inert.injected && inert.shown, `a refused parameter value and an author-written provenance line render as TEXT: script fired ${inert.fired}, element injected ${inert.injected}, the text is on screen ${inert.shown} (${xss})`);

      // ---- M1's au rows intact --------------------------------------------------------------------------------
      const grid = await page.evaluate(() => {
        const L = layers[tmtLoader.auLayer];
        return { rows: L.clickables.rows, cols: L.clickables.cols, ids: Object.keys(L.clickables).filter((k) => !isNaN(k)).length, features: tmtLoader.features.length };
      });
      check(grid.cols === 4 && grid.ids === grid.features + 1 && grid.rows === Math.ceil((grid.features + 1) / 4),
        `the Simple grid's arithmetic is untouched: ${grid.rows}×${grid.cols} over ${grid.ids} clickable(s) for ${grid.features} feature(s) — the new buttons are inside a component, so no clickable id moved`);
      check(errs.length === 0, `no page error at all: ${errs.length}${errs.length ? ' — ' + errs[0] : ''}`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
    finally { await context.close(); }
    row({ gate: 'V3-5 (page) the watch toggles, a list edit persists, Progress renders, and every block folds', id, leg: 'profile all, au → Simple / Advanced / Progress', ok, notes: notes.join('; ') });
  }
}

// ---- Part 6: the roster ------------------------------------------------------------------------------------------
// ⛔ ABSTENTIONS ARE COUNTED AND LEFT UNCAUSED. V2's roster leg wrote a cause beside four abstentions it had not
// measured, and CI's `G1 load — automation page` showed the cause was V2's own regression (§18.4 item 11). An
// abstention is a measurement NOT MADE.
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
        // ⛔ THE CONTROL HAS TO PRICE EVERY PIECE OF WORK THE LEG DOES, NOT JUST THE REDRAWS — measured, and the
        // first cut went RED on `arctree` alone with `extra: 63`. That game's own values make TMT's `format()` log
        // "We meet an NaN at (e^NaN)NaN" on EVERY `updateTemp()` (§16.3 item 12), and `tmtLoader.tick()` calls
        // `updateTemp()` once per tick — so 60 ticks cost 60 log lines that had nothing to do with V3 and that a
        // redraw-only control could not see. The leg now measures its two costs separately and subtracts both.
        const b0 = errs.length;
        await redraw(page);
        await page.waitForTimeout(60);
        const perRedraw = errs.length - b0;
        // ⚠ THE TRACKER IS ARMED BEFORE THE TICKS, not after: a tracker armed afterwards would have seeded from the
        // state those ticks produced and recorded nothing, which is a green that measures nothing.
        const bT = errs.length;
        const TICKS = 60;
        await page.evaluate((n) => { tmtLoader.setWatchOption('track', true); tmtLoader.tick(1, n); }, TICKS);
        await page.waitForTimeout(60);
        const perTicks = errs.length - bT;
        const before = errs.length;
        r = await page.evaluate(async () => {
          const T = window.tmtLoader, out = { tabs: Object.keys(layers[T.auLayer].tabFormat), drawn: {}, features: T.features.length, components: T.componentNames.slice() };
          const paint = (w) => { player.subtabs[T.auLayer].mainTabs = w; updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats(); };
          const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
          let paints = 0;
          for (const w of out.tabs) { paint(w); paints++; await sleep(80); out.drawn[w] = (document.querySelector('#app').innerText || '').length; }
          paint('Progress'); paints++;
          await sleep(120);
          const p = T.progress();
          out.events = p.total;
          out.progRows = document.querySelectorAll('#app .tmtl-prog-row').length;
          out.armed = p.armed;
          out.marks = Object.keys(p.marks).length;
          paint('Advanced'); paints++;
          await sleep(120);
          out.paints = paints;
          out.folds = document.querySelectorAll('#app button.tmtl-fold').length;
          out.rows = T.explain().length;
          out.unknown = T.explain().filter((x) => x.last && x.last.code === 'unknown').map((x) => x.id);
          out.watch = T.watchState().code;
          out.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth;
          out.rendered = (document.querySelector('#app').innerText || '').indexOf('What each feature decided') >= 0;
          return out;
        });
        r.perRedraw = perRedraw;
        r.perTicks = perTicks;
        r.ticks = TICKS;
        r.extra = (errs.length - before) - perRedraw * r.paints;
        r.errs = errs.slice(0, 2);
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    const ok = r.rendered && r.unknown.length === 0 && r.extra <= 0 && r.scrollX === false
      && r.tabs.length === 3 && r.tabs[0] === 'Simple' && r.drawn.Progress > 0
      && r.armed === true && r.folds === r.rows && r.components.length === 7;   // ⚠ 6 → 7: V4b's `tmtl-reset`
    judged.push({ id, ok, r });
    if (!ok) row({ gate: 'V3-6 roster: three subtabs, the tracker, and a fold button per block', id, leg: 'profile all', ok: false, notes: JSON.stringify(r).slice(0, 700) });
  }
  const red = judged.filter((x) => !x.ok);
  const moved = judged.filter((x) => x.r.events > 0);
  row({ gate: 'V3-6 the ROSTER: every game opens all three subtabs and the tracker records what its game did', id: `${judged.length} judged`, leg: `${ids.length} assigned`,
    ok: red.length === 0 && judged.length > 0,
    notes: `judged ${judged.length}, RED ${red.length} (${red.map((x) => x.id).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ' — ' + abstained.join(' · ') : ''} `
      + `⚠ (counted, and NOT given a cause: an abstention is a measurement not made — §18.4 item 11); `
      + `the tracker recorded at least one event on ${moved.length} of ${judged.length} game(s) over 60 ticks (a game that made no progress in that window records none, which is the rule being right); `
      + `progress rows drawn ${judged.reduce((s, x) => s + x.r.progRows, 0)}; fold buttons ${judged.reduce((s, x) => s + x.r.folds, 0)} over ${judged.reduce((s, x) => s + x.r.rows, 0)} feature row(s); `
      + `watch states seen ${JSON.stringify([...new Set(judged.map((x) => x.r.watch))])}; `
      + `⚠ the console-error control prices BOTH costs the leg pays — ${judged.reduce((s2, x) => s2 + x.r.perRedraw, 0)} line(s) per redraw and `
      + `${judged.reduce((s2, x) => s2 + x.r.perTicks, 0)} across ${judged.length} game(s)' 60 ticks, almost all of them arctree's own `
      + `"We meet an NaN at (e^NaN)NaN" on every updateTemp()` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v3-part6${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- entry -------------------------------------------------------------------------------------------------------
let browser = null, server = null;
try {
  if (PART === '1') await part1();
  else if (PART === '2') await part2();
  else if (PART === '3') await part3();
  else if (PART === '4') await part4();
  else {
    browser = await chromium.launch();
    server = await startServer(REPO);
    if (PART === '5') await part5(browser, server.url);
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
if (!a['no-summary']) appendSection({ title: `V3 part ${PART} (\`node tools/harness/gates-v3.mjs --part ${PART}\`)`, commit, dirty, rows });
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v3-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-v3 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
if (a.assert) {
  const want = ROWS[PART];
  const line = `v3-part${PART} VERDICT: rows ${rows.filter((r) => r.ok).length}/${rows.length}${want === undefined ? '' : ` of ${want} expected`}; ${rows.filter((r) => !r.ok).length} RED`;
  console.log(line);
  if (want === undefined) { console.log(`v3-part${PART} REFUSED: no expected row count is declared for this part`); process.exit(1); }
  if (rows.length !== want) {
    console.log(`v3-part${PART} REFUSED: ${rows.length} row(s), expected ${want} — a battery that stops part-way prints fewer rows, and fewer rows is fewer reds`);
    process.exit(1);
  }
}
process.exit(rows.every((r) => r.ok) ? 0 : 1);
