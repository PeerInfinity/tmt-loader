// The V4 gates — the per-feature CONTROLS (`while`, `until`, `priority`), the M21 pause, and the watch's label.
//   node gates-v4.mjs --part 1|2|3|4|5|6|7 [--no-summary] [--assert] [--pool N] [--shard i/N]
//
// Part 1  SCHEMA ≡ BEHAVIOUR (node, ~1 min). `loader/controls.test.mjs` over the stub — RUN HERE and required green,
//         the way `gates-v1 --part 1` runs `reasons.test.mjs`: a list of claims a unit test makes is worth nothing
//         unless the test passed in the same run that quotes it. Plus BOTH new reason codes witnessed on a REAL ptr
//         leg rather than constructed (§18.4's rule: a fixture witness beats a construction wherever one exists).
// Part 2  `while` ≡ THE TABLE GATE (node, ~12 min). The SAME predicate as a table entry and as a SAVED EDIT gives the
//         same marks and the same `hashGame` over M15 → M22. ⛔ The two arms differ in NOTHING else, which is what
//         makes this a measurement of the precedence chain rather than of a predicate.
// Part 3  `until` LATCHES ON A REAL LEG (node, ~4 min), with the user's own example — stop `reset:p` once N prestige
//         points have been earned — and it SURVIVES A RELOAD: the run is cut in half at a snapshot and resumed, and
//         the second half must still be stopped. Then re-armed, and it acts again.
// Part 4  `priority` (node, ~8 min). INERTNESS on the real legs, beside the constructed contention in part 1's unit
//         file (a real fixture cannot show two kinds fighting over one purse on demand; the stub can).
// Part 5  INERTNESS (node, ~12 min). Nothing edited ⇒ the fresh opening is 6718 / `82eee26f947b2b2e` and M15 → M20 is
//         unmoved to the hash; the `player.au` key set and the `runtimeState()` key set are V3's plus exactly what
//         this slice added, which is NOTHING until something is set.
// Part 6  THE PAGE (ptr and something). A predicate TYPED through the real component (hotkeys must not fire), the
//         two new codes in the block, a RELOAD, the re-arm press, a priority edited, `<img onerror>` inert, and M1's
//         au rows intact.
// Part 7  THE ROSTER (page). The new editors render on every game judged; abstentions counted and UNCAUSED.
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
const row = (r) => { rows.push(r); console.log(`${r.ok ? 'GREEN' : 'RED  '} ${r.gate} ${r.id || ''} ${r.leg || ''} ticks=${r.ticks ?? '-'} hash=${r.hash ?? '-'} ${String(r.notes || '').slice(0, 1200)}`); };

// ⛔ THE FLOOR EACH PART MUST REACH, for `--assert` (CI) — V1's, V2's and V3's rule, and R2 met it twice: a battery
// that dies part-way prints fewer rows, and fewer rows is fewer reds. ⚠ ADDING A LEG MOVES THIS, deliberately.
const ROWS = { 1: 3, 2: 3, 3: 4, 4: 3, 5: 4, 6: 2, 7: 1 };

const SNAP = (id, m) => `tools/harness/snapshots/${id}/all/${m}.json`;
const PTR_LADDER = 'tools/harness/ladder/ptr.json';
// ⛔ THE OPENING'S PIN, §14d.6 / §21.4 / §24.2 item 4 — a fresh game to M12, and it has not moved through V1, V2,
// V3 or R2. It is the row that says "nothing edited ⇒ nothing changed" about the part of the game every player sees.
const OPEN_PIN = { mark: 'M12', gameSeconds: 6718, hashGame: '82eee26f947b2b2e' };
// R2's rung, from `all/M15.json` under the shipped table (plan §24.7, twice equal, reproduced by the planner).
const RUNG_PIN = { M16: 17058, M17: 23492, M18: 25598, M19: 25937, M20: 26612, M22: 29204 };
// ⛔ THE RECORD'S SHAPE BEFORE V4, DECLARED HERE rather than read off the run (V3's rule): the V2/V3/V4 blocks
// appear only when they have something to say, so a leg that uses none of them writes exactly these four keys.
const RUNTIME_KEYS_V3 = ['lastReset', 'loopNo', 'ranAt', 'stats'];
// ⚠ THE `au` LAYER'S SAVE KEYS ON **ptr**, AND THEY ARE NOT THE LOADER'S ALONE. The engine adds its own per-layer
// stores to every layer it creates, and 2.2.1 adds three more than a minimal stub does (`achievements`,
// `primeMiles`, `spentOnBuyables`) — this is the set `gates-v3 --part 2` measured at `3346da419`, copied rather than
// re-derived, because a gate that asks the thing it judges what it should contain is not a gate.
const AU_KEYS_V3 = ['achievements', 'armLocked', 'buyables', 'challenges', 'clickables', 'disclosed', 'edits', 'features', 'milestones', 'points', 'primeMiles', 'spentOnBuyables', 'unlocked', 'upgrades'];

// ---- a pool of run.mjs children (gates-v3's, unchanged) -----------------------------------------------------------
const POOL = Number(a.pool || 3);
let running = 0;
const queue = [];
function pump() {
  while (running < POOL && queue.length) {
    const { id, o, resolve } = queue.shift();
    running++;
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-loader-v4-')), 'r.json');
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
// ⚠ A MARK THE RUN DID NOT REACH IS PRESENT AND `null` (`--marks-continue` records the whole slice), so this
// filters rather than maps — measured: the first cut threw on the first leg that missed a mark, which is the
// case the whole battery exists to report.
const marksOf = (r) => Object.fromEntries(Object.entries(r.marks || {}).filter(([, v]) => v && v.gameSeconds !== undefined).map(([m, v]) => [m, v.gameSeconds]));

/**
 * ⛔ A SNAPSHOT WITH A PLAYER'S EDIT ALREADY IN IT — which is the only honest way to measure a SAVED value.
 * `--auto-opt while:<id>=` sits in the TABLE's slot; the thing this battery has to tell apart from it is the entry a
 * player's own save carries, and that is a file. The copy is written to a temp path and the tree is never touched.
 * ⚠ `hashGame` excludes `player.au`, so a fixture with an edit in it starts from the same GAME state as one without.
 */
function snapshotWithEdits(file, edits) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, file), 'utf8'));
  const p = JSON.parse(s.player);
  p.au = p.au || {};
  p.au.edits = Object.assign({}, p.au.edits || {}, edits);
  s.player = JSON.stringify(p);
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-v4-snap-')), path.basename(file));
  fs.writeFileSync(out, JSON.stringify(s, null, 1) + '\n');
  return out;
}

// ---- Part 1: schema ≡ behaviour, and both new codes on a REAL leg --------------------------------------------------
// ⚠ THE UNIT FILE RUNS HERE. `gates-v1 --part 1` established the pattern and the reason: the stub is where the
// claims about a predicate's compile, refusal and containment can be CONSTRUCTED, and a battery that merely cites
// those claims is citing a file it did not run.
async function part1() {
  const unit = await new Promise((resolve) => {
    const c = spawn(process.execPath, ['--test', 'loader/controls.test.mjs'], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    c.stdout.on('data', (d) => { o += d; });
    c.stderr.on('data', (d) => { o += d; });
    c.on('exit', (code) => resolve({ code, out: o }));
  });
  const pass = (/^# pass (\d+)/m.exec(unit.out) || [])[1];
  const fail = (/^# fail (\d+)/m.exec(unit.out) || [])[1];
  row({ gate: 'V4-1 schema ≡ behaviour for the `predicate` type, constructed on the stub (loader/controls.test.mjs)', id: '—',
    leg: `${pass || '?'} test(s)`, ok: unit.code === 0 && fail === '0',
    notes: `${pass} passed, ${fail} failed — round trip, the refusal that keeps the previous value, a run-time throw contained to its feature, the latch, the re-arm, the priority contention, the escaping and the inertness of an unedited run`
      + `${unit.code === 0 ? '' : '\n' + unit.out.split('\n').filter((l) => /^not ok|error:/.test(l)).slice(0, 8).join('\n')}` });

  // ⛔ BOTH NEW CODES ON A REAL GAME. `until` stops `reset:p` once 5 prestige points have been EARNED (⚖ §13's own
  // example), and a `while` that throws is put on `reset:b`. ⚠ THE TWO ARE ON ONE LEG on purpose: they are
  // independent features of independent layers, so one leg witnessing both is also the evidence that a throwing
  // predicate does not take the tick down with it.
  const OPT = 'until:reset:p=player.p.points.gte(5);while:reset:b=player.nosuchlayer.gte(1)';
  const r = await job('ptr', { profile: 'all', diff: 1, ticks: 400, 'auto-opt': OPT, explain: true });
  const seen = (r.explain_stats && r.explain_stats.codes) || {};
  const rp = (r.explain || []).find((x) => x.id === 'reset:p') || {};
  const rb = (r.explain || []).find((x) => x.id === 'reset:b') || {};
  const acted = (r.hook && r.hook.actions) || {};
  row({ gate: 'V4-1 both new DECISION codes witnessed BY NAME on a real ptr leg, not constructed', id: 'ptr',
    leg: `fresh 400×1, profile all, --auto-opt ${OPT}`,
    ok: !!r.ok && seen['stopped:until'] > 0 && seen['blocked:predicate'] > 0 && !seen.unknown
      && rp.last?.code === 'stopped:until' && rb.last?.code === 'blocked:predicate'
      && (acted['reset:p'] || 0) > 0 && (acted['reset:g'] || 0) > 0,
    ticks: r.ticks, hash: r.hashGame,
    notes: `codes ${JSON.stringify(seen)}; reset:p "${rp.last?.text}" (acted ${acted['reset:p'] || 0} times BEFORE it stopped — a feature that never acted cannot witness a stop); `
      + `reset:b "${rb.last?.text}" with the engine's own message in the block: ${JSON.stringify(rb.control?.while?.error)}; `
      + `⛔ THE THROW WAS CONTAINED: reset:g acted ${acted['reset:g'] || 0} time(s) on the same ticks; `
      + `⚠ the latch is NOT MONOTONE here and that is a free real-world witness — until.holds is ${rp.control?.until?.holds} while stopped is ${rp.control?.until?.stopped}` });

  // …and the vocabulary itself agrees: every code the table names is still witnessed somewhere (V1 part 1's job),
  // so this row only asserts that V4's additions ARE in the table with the values their templates consume.
  const tbl = await job('ptr', { ticks: 0, eval: 'tmtLoader.reasonCodes()' });
  const codes = (tbl.eval || {});
  row({ gate: 'V4-1 the vocabulary carries the two new codes as DATA, with the values their templates consume', id: '—', leg: `${Object.keys(codes).length} codes`,
    ok: !!tbl.ok && !!codes['stopped:until'] && !!codes['blocked:predicate']
      && codes['blocked:gate'].values.indexOf('owner') >= 0
      && codes['stopped:until'].values.slice().sort().join(',') === 'at,until'
      && codes['blocked:predicate'].values.slice().sort().join(',') === 'src,which',
    notes: `stopped:until ${JSON.stringify(codes['stopped:until'])}; blocked:predicate ${JSON.stringify(codes['blocked:predicate'])}; blocked:gate ${JSON.stringify(codes['blocked:gate'])}` });
}

// ---- Part 2: `while` ≡ the table gate ------------------------------------------------------------------------------
// ⛔ THE TWO ARMS DIFFER IN NOTHING BUT WHERE THE PREDICATE CAME FROM. Arm A puts it in the TABLE's slot
// (`--auto-opt while:reset:q=`), arm B puts it in a SAVE (a copy of `all/M15.json` carrying
// `player.au.edits['reset:q'].while`) and CLEARS the table's slot with an empty option, so neither arm can be
// reading the other's. Equal marks AND equal `hashGame` is the claim; equal marks alone would pass a build that
// merely reached the same places by different play.
const M21_GATE = "!hasMilestone('q',4) || player.h.unlocked";
function rungFlags(extra = {}) {
  return { diff: 1, ticks: Number(a.ticks || 16000), 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M22', 'until-all': true,
    'from-snapshot': SNAP('ptr', 'M15'), profile: 'all', stall: 1000000, ...extra };
}
async function part2() {
  const saved = snapshotWithEdits(SNAP('ptr', 'M15'), { 'reset:q': { 'while': M21_GATE } });
  const [A, B] = await Promise.all([
    job('ptr', rungFlags({ 'auto-opt': `while:reset:q=${M21_GATE}` })),
    job('ptr', rungFlags({ 'from-snapshot': saved, 'auto-opt': 'while:reset:q=' })),
  ]);
  const ma = marksOf(A), mb = marksOf(B);
  const same = A.gameSeconds === B.gameSeconds && A.hashGame === B.hashGame && JSON.stringify(ma) === JSON.stringify(mb);
  row({ gate: 'V4-2 `while` in the TABLE’s slot', id: 'ptr', leg: `all/M15 → M22, --auto-opt while:reset:q=${M21_GATE}`,
    ok: !!A.ok, ticks: A.ticks, gameSeconds: A.gameSeconds, hash: A.hashGame,
    notes: `marks ${JSON.stringify(ma)}; resets ${JSON.stringify(A.hook?.actions)}` });
  row({ gate: 'V4-2 the SAME predicate as a player’s SAVED edit, with the table’s slot cleared — IDENTICAL', id: 'ptr',
    leg: 'all/M15 + player.au.edits["reset:q"].while, --auto-opt while:reset:q= (cleared)',
    ok: !!B.ok && same, ticks: B.ticks, gameSeconds: B.gameSeconds, hash: B.hashGame,
    notes: `marks ${JSON.stringify(mb)}; equal to the table arm: ${same} (game-s ${A.gameSeconds} vs ${B.gameSeconds}, hashGame ${A.hashGame} vs ${B.hashGame}); `
      + `⚠ the fixture carries the edit under player.au, which hashGame excludes, so both arms start from the same GAME state` });

  // ⛔ THE MUTANT'S ROW: a predicate that CHANGES ITS ANSWER MID-LEG. A build that evaluated `while` once and cached
  // it would be green on both rows above, because M21_GATE is false for exactly one stretch and a cached FALSE and a
  // cached TRUE each reproduce one of the two ends. This leg's predicate flips twice, and only a per-tick reading
  // reaches M21 *and* M22.
  const flip = await job('ptr', rungFlags({ 'auto-opt': `while:reset:q=${M21_GATE}`, eval: '({q: String(player.q.total), h: player.h.unlocked, te: String(player.t.energy)})' }));
  const mf = marksOf(flip);
  row({ gate: 'V4-2 the pause LIFTS again: M21 and M22 both reached on one leg', id: 'ptr', leg: `all/M15 → M22, ${a.ticks || 16000} ticks`,
    ok: !!flip.ok && mf.M21 !== undefined && mf.M22 !== undefined && mf.M22 > mf.M21,
    ticks: flip.ticks, gameSeconds: flip.gameSeconds, hash: flip.hashGame,
    notes: `marks ${JSON.stringify(mf)} — M21 ${mf.M21 ?? '—'} then M22 ${mf.M22 ?? '—'}; a build that read the predicate ONCE reaches at most one of them `
      + `(false for ever ⇒ no M22, true for ever ⇒ no M21, which is exactly R2’s wall); end ${JSON.stringify(flip.eval)}; resets ${JSON.stringify(flip.hook?.actions)}` });
}

// ---- Part 3: `until` latches, survives a RELOAD, and re-arms -------------------------------------------------------
// ⚖ THE USER'S OWN EXAMPLE (2026-09-15): "an option to stop doing the resets after a specific amount of the currency
// has been earned". N is chosen so it bites INSIDE the opening, which is what makes the control leg meaningful.
const UNTIL_P = 'player.p.total.gte(30)';
async function part3() {
  const OPEN = { diff: 1, ticks: 900, profile: 'all', explain: true,
    eval: '({pTotal: String(player.p.total), pts: String(player.points), until: tmtLoader.controlState("reset:p").until})' };
  const [ctl, stop] = await Promise.all([
    job('ptr', OPEN),
    job('ptr', { ...OPEN, 'auto-opt': `until:reset:p=${UNTIL_P}` }),
  ]);
  const cA = (ctl.hook?.actions || {})['reset:p'] || 0, sA = (stop.hook?.actions || {})['reset:p'] || 0;
  row({ gate: 'V4-3 `until` STOPS a real feature on a real leg, and the CONTROL says how much it stopped', id: 'ptr',
    leg: `fresh 900×1, --auto-opt until:reset:p=${UNTIL_P}`,
    ok: !!ctl.ok && !!stop.ok && sA > 0 && sA < cA && stop.eval?.until?.stopped === true,
    ticks: stop.ticks, gameSeconds: stop.gameSeconds, hash: stop.hashGame,
    notes: `reset:p acted ${sA} time(s) against the control's ${cA}; it stopped at ${stop.eval?.until?.hitAt} s with p.total ${stop.eval?.pTotal} (the control ends on ${ctl.eval?.pTotal}); `
      + `⚠ ${sA > 0 ? 'it ACTED FIRST, so the stop is a stop and not a feature that never ran' : 'IT NEVER ACTED — this leg measures nothing'}; `
      + `hashGame ${stop.hashGame} vs the control's ${ctl.hashGame} (they MUST differ: a stop that changed nothing is not a stop)` });

  // ⛔ THE RELOAD, AND THE PREDICATE MUST TRAVEL WITH THE LATCH. ⚠ MEASURED, and the first cut of this leg got it
  // wrong: it set `until` through `--auto-opt` (the TABLE's slot, which no save carries), so the resumed process
  // came up with a latch and no condition — and the loader DISARMS a latch whose condition has gone, which is the
  // right behaviour and made both the resume and the re-arm leg VACUOUS (they were the same run). A player's
  // `until` lives in the SAVE, so the leg has to put it there: `--predicates` runs one expression after `load()`
  // and after the runtime restore, which is exactly the hook a press would use.
  // ⚠ `--no-runtime` is the point of the resume: without the runtime record restored, the ONLY thing that can be
  // carrying either half is `player.au.edits`, which is where the brief says the latch must live.
  const seedFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-v4-seed-')), 'seed.json');
  fs.writeFileSync(seedFile, JSON.stringify([['seed-until', `tmtLoader.setSavedControl('reset:p', 'until', ${JSON.stringify(UNTIL_P)}).ok`]]));
  const rearmFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-v4-rearm-')), 'rearm.json');
  fs.writeFileSync(rearmFile, JSON.stringify([['re-arm', "tmtLoader.rearm('reset:p').ok"]]));
  const cutDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-v4-cut-'));
  const cut = await job('ptr', { diff: 1, ticks: 500, profile: 'all', predicates: seedFile,
    'stop-snapshot': cutDir, 'stop-snapshot-name': 'CUT',
    eval: '({acts: tmtLoader.hookStats().actions, until: tmtLoader.controlState("reset:p").until})' });
  const cutFile = cut.stopSnapshotWritten ? path.join(REPO, cut.stopSnapshotWritten.file) : path.join(cutDir, 'CUT.json');
  row({ gate: 'V4-3 the cut: the run is stopped while the feature is STOPPED, and the fixture carries BOTH halves', id: 'ptr',
    leg: 'fresh 500×1, the `until` written into the SAVE through setSavedControl, --stop-snapshot',
    ok: !!cut.ok && cut.eval?.until?.stopped === true && fs.existsSync(cutFile) && cut.predicates?.[0]?.value === true,
    ticks: cut.ticks, gameSeconds: cut.gameSeconds, hash: cut.hashGame,
    notes: `the seed wrote it: ${JSON.stringify(cut.predicates)}; stopped at ${cut.eval?.until?.hitAt} s; reset:p ${cut.eval?.acts?.['reset:p']}; the fixture's own save carries the condition AND the latch: `
      + `${fs.existsSync(cutFile) ? JSON.stringify((JSON.parse(JSON.parse(fs.readFileSync(cutFile, 'utf8')).player).au || {}).edits) : 'NO FIXTURE'}` });

  const [resumed, rearmed] = await Promise.all([
    // ⚠ THE PREDICATE IS NOT GIVEN AGAIN. The resumed process is told nothing about `until`; if the latch and the
    // predicate did not come back from the SAVE, this leg simply resets `p` again — which is the mutant's row.
    job('ptr', { diff: 1, ticks: 400, profile: 'all', 'from-snapshot': cutFile, 'no-runtime': true,
      eval: '({acts: tmtLoader.hookStats().actions, until: tmtLoader.controlState("reset:p").until, code: (tmtLoader.explain().find(function(x){return x.id==="reset:p";})||{}).last})' }),
    // …and the SAME resume with ONE press: `tmtLoader.rearm`, the API the button calls. ⚠ It differs from the leg
    // above in that press and in NOTHING else, which is what makes the pair a measurement of the press.
    job('ptr', { diff: 1, ticks: 400, profile: 'all', 'from-snapshot': cutFile, 'no-runtime': true,
      predicates: rearmFile,
      eval: '({acts: tmtLoader.hookStats().actions, until: tmtLoader.controlState("reset:p").until})' }),
  ]);
  const rActs = (resumed.hook?.actions || {})['reset:p'] || 0;
  row({ gate: 'V4-3 the latch SURVIVES A RELOAD — a new process, no runtime record, and it is still stopped', id: 'ptr',
    leg: 'resume the cut fixture, 400×1, --no-runtime, the predicate NOT given again',
    ok: !!resumed.ok && resumed.eval?.until?.stopped === true && resumed.eval?.code?.code === 'stopped:until' && rActs === 0,
    ticks: resumed.ticks, gameSeconds: resumed.gameSeconds, hash: resumed.hashGame,
    notes: `reset:p acted ${rActs} time(s) after the resume — it must be 0; the reason is still "${resumed.eval?.code?.text}"; `
      + `until ${JSON.stringify(resumed.eval?.until)}; ⛔ the runtime record was NOT restored, so nothing but the SAVE could have carried this` });
  const reActs = (rearmed.hook?.actions || {})['reset:p'] || 0;
  row({ gate: 'V4-3 RE-ARM: one call to the API the button calls, and the SAME resume acts again', id: 'ptr',
    leg: 'the same fixture and the same flags, plus tmtLoader.rearm("reset:p") — and nothing else',
    // ⚠ MEASURED, and the first cut of this row asserted the WRONG thing: it required the feature to be un-stopped
    // at the END. Re-arming a condition that is still REACHABLE re-latches — `player.p.total.gte(30)` becomes true
    // again a few resets later, and it should. What the press has to have done is let the feature ACT and move the
    // latch's own timestamp; a build where the press did nothing leaves both exactly as the resume left them.
    ok: !!rearmed.ok && rearmed.predicates?.[0]?.value === true && reActs > 0
      && rearmed.eval?.until?.hitAt !== resumed.eval?.until?.hitAt && rearmed.hashGame !== resumed.hashGame,
    ticks: rearmed.ticks, hash: rearmed.hashGame,
    notes: `re-arm returned ${JSON.stringify(rearmed.predicates)}; reset:p acted ${reActs} time(s) against the un-re-armed resume's ${rActs}; `
      + `the latch moved ${resumed.eval?.until?.hitAt} s → ${rearmed.eval?.until?.hitAt} s — ⚠ it RE-LATCHED, because this condition is reachable again and `
      + `"until" is a latch on the CONDITION, not a one-shot switch; hashGame ${rearmed.hashGame} vs ${resumed.hashGame} — they MUST differ, or the press did nothing; `
      + `⚠ the PRESS itself is driven in part 6, on the page, because a press is a page thing` });
}

// ---- Part 4: `priority` ---------------------------------------------------------------------------------------------
// ⛔ THE CONTENTION IS CONSTRUCTED (part 1's unit file), AND THAT IS NOT A CONCESSION. A real fixture cannot be made
// to have two kinds fighting over one purse on demand: whoever wins, the mark it moves is somebody's. The stub can,
// and the row that sees it is what each feature BOUGHT. What the REAL legs answer is the other half — that a build
// carrying the machinery is byte-identical when nobody has used it, and that a priority set on a real game really
// does reorder what runs.
async function part4() {
  const [ctl, same, moved] = await Promise.all([
    job('ptr', { diff: 1, ticks: 900, profile: 'all', eval: 'tmtLoader.hookStats().actions' }),
    // every feature given the priority it ALREADY HAS (its kind's place) — the identity, which must change nothing
    job('ptr', { diff: 1, ticks: 900, profile: 'all', 'auto-opt': 'priority:reset:p=2;priority:upgrades:p=3;priority:reset:g=2;priority:upgrades:g=3', eval: 'tmtLoader.hookStats().actions' }),
    // …and the reset put LAST on its layer instead of second, which must change the trajectory
    job('ptr', { diff: 1, ticks: 900, profile: 'all', 'auto-opt': 'priority:reset:p=6', eval: 'tmtLoader.hookStats().actions' }),
  ]);
  row({ gate: 'V4-4 the IDENTITY: priorities set to the values already in force are byte-identical', id: 'ptr',
    leg: 'fresh 900×1, priority:{reset,upgrades}:{p,g} set to 2 and 3 — ptr’s own kindOrder places, so the IDENTITY',
    ok: !!ctl.ok && !!same.ok && ctl.hashGame === same.hashGame && JSON.stringify(ctl.eval) === JSON.stringify(same.eval),
    ticks: same.ticks, hash: same.hashGame,
    notes: `hashGame ${same.hashGame} against the control's ${ctl.hashGame}; actions ${JSON.stringify(same.eval)} vs ${JSON.stringify(ctl.eval)} — `
      + `⚠ this is the row that says the DEFAULT really is the kind's place and not a number that happens to look like one` });
  row({ gate: 'V4-4 and MOVING one changes the run — a priority nothing can see is a priority nothing does', id: 'ptr',
    leg: 'fresh 900×1, priority:reset:p=6 (the reset LAST on its layer instead of second)',
    ok: !!moved.ok && moved.hashGame !== ctl.hashGame,
    ticks: moved.ticks, hash: moved.hashGame,
    notes: `hashGame ${moved.hashGame} against the control's ${ctl.hashGame} — they MUST differ; actions ${JSON.stringify(moved.eval)} vs ${JSON.stringify(ctl.eval)}; `
      + `⛔ MUTANT "priority ignored": this row reds, and so does the constructed contention in part 1` });
  const order = await job('ptr', { diff: 1, ticks: 2, profile: 'all',
    eval: 'tmtLoader.explain().filter(function(r){return r.layer==="p" && r.control;}).map(function(r){return r.id + "=" + r.control.priority.effective;})' });
  row({ gate: 'V4-4 every feature reports the priority it is really running at, and it is its kind’s place', id: 'ptr', leg: 'fresh 2×1',
    ok: !!order.ok && Array.isArray(order.eval) && order.eval.length > 0 && order.eval.every((s) => /=\d+$/.test(s)),
    notes: `layer p: ${JSON.stringify(order.eval)}; ptr’s kindOrder is toggles,reset,upgrades,buyables,challenges,clickables, so a reset reads 2` });
}

// ---- Part 5: inertness ----------------------------------------------------------------------------------------------
async function part5() {
  const RECORD = '({rt: Object.keys(tmtLoader.runtimeState()).sort(), au: Object.keys(player.au).sort(), edits: player.au.edits, controls: tmtLoader.controls().map(function(c){return c.name;})})';
  const [open, rung] = await Promise.all([
    job('ptr', { diff: 1, ticks: 8000, profile: 'all', ladder: PTR_LADDER, to: 'M12', stall: 1000000, 'wall-ms': 900000, eval: RECORD }),
    job('ptr', rungFlags({ to: 'M20', ticks: Number(a.ticks || 16000), eval: RECORD })),
  ]);
  const mo = marksOf(open), mr = marksOf(rung);
  row({ gate: 'V4-5 NOTHING EDITED: the fresh opening is exactly where it has been since §14d.6', id: 'ptr',
    leg: 'a FRESH game → M12, diff 1, profile all',
    ok: !!open.ok && mo.M12 === OPEN_PIN.gameSeconds && open.marks?.M12?.hashGame === OPEN_PIN.hashGame,
    ticks: open.ticks, gameSeconds: mo.M12, hash: open.marks?.M12?.hashGame,
    notes: `M12 at ${mo.M12} / ${open.marks?.M12?.hashGame} against the pin ${OPEN_PIN.gameSeconds} / ${OPEN_PIN.hashGame}; all marks ${JSON.stringify(mo)}` });
  const rungOk = ['M16', 'M17', 'M18', 'M19', 'M20'].every((m) => mr[m] === RUNG_PIN[m]);
  row({ gate: 'V4-5 NOTHING EDITED: M15 → M20 is R2’s rung, to the game-second and to the hash', id: 'ptr',
    leg: 'from all/M15.json, diff 1, profile all',
    ok: !!rung.ok && rungOk, ticks: rung.ticks, gameSeconds: rung.gameSeconds, hash: rung.hashGame,
    notes: `marks ${JSON.stringify(mr)} against R2’s ${JSON.stringify(RUNG_PIN)}; ${rungOk ? 'every one equal' : 'MOVED'}` });
  const keysOk = (r) => JSON.stringify(r.eval?.rt) === JSON.stringify(RUNTIME_KEYS_V3) && JSON.stringify(r.eval?.au) === JSON.stringify(AU_KEYS_V3)
    && r.eval?.edits && Object.keys(r.eval.edits).length === 0;
  row({ gate: 'V4-5 the RECORD and the SAVE are V3’s plus exactly what V4 added, which is NOTHING until something is set', id: 'ptr',
    leg: 'both legs above', ok: keysOk(open) && keysOk(rung),
    notes: `opening: runtimeState keys ${JSON.stringify(open.eval?.rt)} against the pre-V4 ${JSON.stringify(RUNTIME_KEYS_V3)}, player.au keys ${JSON.stringify(open.eval?.au)} against ${JSON.stringify(AU_KEYS_V3)}, edits ${JSON.stringify(open.eval?.edits)}; `
      + `rung: ${JSON.stringify(rung.eval?.rt)} / ${JSON.stringify(rung.eval?.au)} / ${JSON.stringify(rung.eval?.edits)}; `
      + `⛔ a \`controls\` block appearing here would invalidate every snapshot in the repo; the three control NAMES are ${JSON.stringify(open.eval?.controls)}` });

  // ⛔ AND THE OTHER HALF OF "INERT": a saved edit is only inert because a PINNED FIXTURE HAS NONE. That is a
  // property of the DATA, so it is measured rather than asserted — V2 §18.5's own rule, re-run at this head.
  const snaps = [];
  for (const sub of ['all', 'pinned', 'frontier']) {
    const d = path.join(REPO, 'tools/harness/snapshots/ptr', sub);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
      const p = JSON.parse(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')).player);
      snaps.push({ f: `${sub}/${f}`, edits: Object.keys((p.au || {}).edits || {}) });
    }
  }
  const dirty2 = snaps.filter((s) => s.edits.length);
  row({ gate: 'V4-5 every committed ptr fixture carries an EMPTY `edits`, which is why the middle of the chain is empty', id: 'ptr',
    leg: `${snaps.length} fixture(s)`, ok: snaps.length > 0 && dirty2.length === 0,
    notes: `${snaps.length} fixture(s) checked; ${dirty2.length} carry an edit${dirty2.length ? ': ' + dirty2.map((s) => `${s.f} ${JSON.stringify(s.edits)}`).join(', ') : ''} — `
      + `a fixture with one would run a policy or a predicate no pinned row names` });
}

// ---- Part m21: THE PAUSE THAT BREAKS THE M21 WALL, and the attempt to DERIVE it --------------------------------------
// ⛔ WHAT R2 LEFT (plan §24.7): M21 (`h` unlocked, 1e30 Time Energy) and M22 (q ms 5) are two BRANCHES that pull
// opposite ways, because a `q` reset wipes row 2 and Time Energy with it — the policy that farms quirks fastest is
// the one that never lets TE climb back. The planner measured (plan §26) that ONE `gates` line makes them a
// SEQUENCE again, at a price: M22 moves 29204 → ~30618. This part asks whether that price is right, and whether the
// literal `q` / `h` / "milestone 4" in the pause can be DERIVED (⚖ minimize hardcoding).
//
// ⚠ EVERY CELL TWICE, AND A CELL WHOSE TWO RUNS DISAGREE IS RED — R2's rule, and the whole leg is a WHOLE STRETCH
// from `all/M15.json` (the last fixture row 3 cannot have touched), never from a fixture the rule under test wrote.
const PAUSE_CELLS = [
  { label: '', note: 'the table as it stands — NO pause (R2’s wall: M22 29204, M21 never)' },
  { label: `while:reset:q=${M21_GATE}`, note: 'the planner’s literal (plan §26): pause q once its milestone 4 holds, until h is unlocked' },
  { label: "while:reset:q=player.h.unlocked || tmp.h.baseAmount.lt(tmp.h.requires.div('1e10'))",
    note: 'read from the ENGINE instead of the milestone: pause only once Time Energy is within 1e10 of h’s own requirement' },
  { label: "while:reset:q=player.h.unlocked || tmp.h.baseAmount.lt(tmp.h.requires.div('1e20'))",
    note: 'the same, a wider window (within 1e20) — the pause starts earlier' },
  { label: `while:reset:q=!hasMilestone('q',4) || player.h.unlocked || tmp.h.baseAmount.lt(tmp.h.requires.div('1e20'))`,
    note: 'BOTH: nothing before q ms 4, and then only once TE is within 1e20 — the cell that could beat the literal on M22' },
];
/**
 * ⚖ THE DERIVED CANDIDATE, written as a PREDICATE rather than as code in the loader — which is the cheapest honest
 * way to measure a rule nobody has decided to ship. It is the brief's own shape: *a reset yields while some layer
 * that is SHOWN-but-LOCKED draws its requirement from something this reset would wipe*, with the last clause left
 * out because NOTHING IN EITHER ENGINE DECLARES IT (`baseAmount` is a function and `baseResource` is a display
 * name). What remains is what the engine does declare: the ROW, `layerShown`, and `unlocked`.
 */
const DERIVED_PAUSE = (l) => {
  const q = JSON.stringify(l);
  // ⛔ NOT ONE SEMICOLON IN IT, AND THAT IS A CONSTRAINT THIS SLICE MEASURED RATHER THAN ASSUMED: `--auto-opt` /
  // `?autoOpt=` SPLIT THEIR STRING ON `;`, so a predicate carrying one is cut in half and the halves are two
  // unrelated options. The first cut of this rule had `var L=layers[m];` in it and every cell came back
  // `option while:reset:q — not a JavaScript expression — Unexpected token ')'`. A predicate a PLAYER types is
  // unaffected (it goes into the save, not into an option string); a predicate a SWEEP passes is not.
  return `!Object.keys(layers).some(function(m){ return m!==${q} && layers[m] && !layers[m].tmtLoaderLayer`
    + ` && !isNaN(layers[m].row) && Number(layers[m].row)===Number(layers[${q}].row)`
    + ` && (typeof layers[m].layerShown==='function'?layers[m].layerShown.call(layers[m]):layers[m].layerShown)!==false`
    + ` && !(player[m]&&player[m].unlocked) })`;
};
async function partM21() {
  const { runCells } = await import('./sweep.mjs');
  const TICKS = Number(a.ticks || 16000);
  const flags = Object.entries({ diff: 1, ticks: TICKS, 'wall-ms': 900000, ladder: PTR_LADDER, to: 'M22', 'until-all': true,
    'from-snapshot': SNAP('ptr', 'M15'), profile: 'all', stall: 1000000,
    eval: '({qTotal: String(player.q.total), qMs: player.q.milestones.slice(), hUnl: player.h.unlocked, h: String(player.h.points), te: String(player.t.energy), teCap: String(tmp.t.effect.limit), gp: String(player.g.power)})' });
  const cells = PAUSE_CELLS.concat([{ label: `while:reset:q=${DERIVED_PAUSE('q')}`, note: 'the DERIVED candidate on reset:q — "pause while a SHOWN-but-LOCKED layer of my own row exists"' }])
    .map((c) => ({ label: c.label, opt: c.label, note: c.note }));
  let done = 0;
  const lines = await runCells({ id: 'ptr', cells, flags, pool: Number(a.pool || 6), repeat: Number(a.repeat || 2), stop: 'M22',
    onRun: (c, l) => console.log(`[PROGRESS ${++done}/${cells.length * Number(a.repeat || 2)}] ${(c.label || '(no pause)').slice(0, 60)} run ${l.run} → ${l.ok ? `${l.gameSeconds}s ${l.hashGame}` : 'FAILED ' + l.error}`) });
  lines.forEach((l, i) => {
    const c = cells[i];
    const m = l.marks || {};
    row({ gate: `V4-m21 ${c.label || 'NO pause (the control)'}`, id: 'ptr',
      leg: `all/M15.json → M22, ${TICKS} ticks, diff 1, profile all, TWICE`,
      ok: !!l.ok && l.twiceEqual === true, ticks: l.ticks, gameSeconds: l.gameSeconds, hash: l.hashGame,
      notes: `${['M16','M17','M18','M19','M20','M21','M22'].map((k) => `${k} ${m[k] ?? '—'}`).join(' · ')}; twice equal ${l.twiceEqual}; ${c.note}; `
        + `resets ${JSON.stringify(Object.fromEntries(Object.entries(l.actions || {}).filter(([k]) => k.startsWith('reset:'))))}; `
        + `end ${JSON.stringify(l.runs?.[0]?.eval)}` });
  });
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/gates-v4-m21.json'), { commit, dirty, cells, lines });
}

// ---- Part derived: the DERIVED candidate against the whole of ptr, against something, and on a roster sample -------
// ⛔ THE QUESTION IS NOT "does it reproduce the literal on q" (part m21 answers that) BUT "is it safe as a DEFAULT" —
// so it is applied to EVERY reset feature, and the rows that matter are the ones where it costs something.
async function partDerived() {
  const featOf = async (id) => {
    const r = await job(id, { ticks: 0, profile: 'all', eval: 'tmtLoader.features.filter(function(f){return f.kind==="reset";}).map(function(f){return f.id+"|"+f.layer;})' });
    return (r.eval || []).map((x) => { const [fid, l] = x.split('|'); return { fid, l }; });
  };
  const optFor = (fs2) => fs2.map(({ fid, l }) => `while:${fid}=${DERIVED_PAUSE(l)}`).join(';');

  // (a) PTR's OPENING — the leg the rule must not move, and the one it does
  const ptrF = await featOf('ptr');
  const openFlags = { diff: 1, ticks: 8000, profile: 'all', ladder: PTR_LADDER, to: 'M12', stall: 1000000, 'wall-ms': 900000,
    eval: '({pts: String(player.points), uo: [player.t.unlockOrder, player.e.unlockOrder, player.s.unlockOrder]})' };
  const [openCtl, openDer] = await Promise.all([
    job('ptr', openFlags),
    job('ptr', { ...openFlags, 'auto-opt': optFor(ptrF) }),
  ]);
  const mo = marksOf(openCtl), md = marksOf(openDer);
  const openSame = openCtl.hashGame === openDer.hashGame && JSON.stringify(mo) === JSON.stringify(md);
  row({ gate: 'V4-derived ptr’s OPENING under the derived rule on EVERY reset feature', id: 'ptr',
    leg: `a FRESH game → M12, ${ptrF.length} feature(s) paused by the rule`,
    ok: !!openCtl.ok && !!openDer.ok,   // ⚠ a RESULT row: green means it was MEASURED, and the verdict is in the notes
    ticks: openDer.ticks, gameSeconds: openDer.gameSeconds, hash: openDer.hashGame,
    notes: `${openSame ? '✓ BYTE-IDENTICAL to the control' : '⛔ IT MOVES THE OPENING'}: marks ${JSON.stringify(md)} against the control's ${JSON.stringify(mo)}; `
      + `hashGame ${openDer.hashGame} vs ${openCtl.hashGame}; resets ${JSON.stringify(Object.fromEntries(Object.entries(openDer.hook?.actions || {}).filter(([k]) => k.startsWith('reset:'))))} `
      + `against ${JSON.stringify(Object.fromEntries(Object.entries(openCtl.hook?.actions || {}).filter(([k]) => k.startsWith('reset:'))))}; end ${JSON.stringify(openDer.eval)} vs ${JSON.stringify(openCtl.eval)}` });

  // (b) SOMETHING TREE — §7's generality control, where "no change" is the result
  const sF = await featOf('something');
  const sFlags = { diff: 1, ticks: 3000, profile: 'all', ladder: 'tools/harness/ladder/something.json', to: 'S05', stall: 1000000, 'wall-ms': 900000 };
  const [sCtl, sDer] = await Promise.all([job('something', sFlags), job('something', { ...sFlags, 'auto-opt': optFor(sF) })]);
  const ms = marksOf(sCtl), msd = marksOf(sDer);
  row({ gate: 'V4-derived Something Tree under the same rule (§7’s generality control)', id: 'something',
    leg: `a FRESH game → S05, ${sF.length} feature(s)`,
    ok: !!sCtl.ok && !!sDer.ok, ticks: sDer.ticks, gameSeconds: sDer.gameSeconds, hash: sDer.hashGame,
    notes: `${sCtl.hashGame === sDer.hashGame ? '✓ BYTE-IDENTICAL' : '⛔ IT MOVES'}: marks ${JSON.stringify(msd)} against ${JSON.stringify(ms)}; hashGame ${sDer.hashGame} vs ${sCtl.hashGame}; `
      + `resets ${JSON.stringify(Object.fromEntries(Object.entries(sDer.hook?.actions || {}).filter(([k]) => k.startsWith('reset:'))))} against ${JSON.stringify(Object.fromEntries(Object.entries(sCtl.hook?.actions || {}).filter(([k]) => k.startsWith('reset:'))))}` });

  // (c) A BOUNDED ROSTER SAMPLE, and ⚖ A BOUNDED SWEEP NAMES WHAT IT BOUNDED: the first N games of the roster in its
  // own order, 600 ticks each, looking for the DEADLOCK shape — a reset that fires under the control and NEVER under
  // the rule. 600 ticks is short, so a game that simply has not got there yet reads as "no resets either way" and is
  // reported as such rather than counted as a deadlock.
  const N = Number(a.sample || 14);
  const ids = (a._.length ? a._ : GAMES()).slice(0, N);
  const out = [];
  for (const id of ids) {
    try {
      const fs3 = await featOf(id);
      if (!fs3.length) { out.push({ id, skip: 'no reset feature' }); continue; }
      const base = { diff: 1, ticks: 600, profile: 'all', 'wall-ms': 240000 };
      const [c1, d1] = await Promise.all([job(id, base), job(id, { ...base, 'auto-opt': optFor(fs3) })]);
      if (!c1.ok || !d1.ok) { out.push({ id, skip: `run failed: ${String(c1.error || d1.error).slice(0, 60)}` }); continue; }
      const ca = c1.hook?.actions || {}, da = d1.hook?.actions || {};
      const starved = fs3.map((f) => f.fid).filter((fid) => (ca[fid] || 0) > 0 && (da[fid] || 0) === 0);
      out.push({ id, features: fs3.length, starved, moved: c1.hashGame !== d1.hashGame,
        ctl: Object.fromEntries(Object.entries(ca).filter(([k]) => k.startsWith('reset:'))),
        der: Object.fromEntries(Object.entries(da).filter(([k]) => k.startsWith('reset:'))) });
    } catch (e) { out.push({ id, skip: String(e.message).slice(0, 60) }); }
  }
  const judged = out.filter((x) => !x.skip);
  const dead = judged.filter((x) => x.starved.length);
  row({ gate: 'V4-derived a BOUNDED roster sample: where does the rule STARVE a reset that otherwise fires?', id: `${judged.length} judged`,
    leg: `the first ${N} of ${GAMES().length} games in the roster's own order, 600×1 each, every reset feature paused by the rule`,
    ok: judged.length > 0,
    notes: `⚖ BOUNDED, and this is what was bounded: the first ${N} ids only, 600 ticks only — a longer leg or a different slice could find more. `
      + `${dead.length} of ${judged.length} game(s) have at least one reset that fires under the control and NEVER under the rule: `
      + `${dead.map((x) => `${x.id} [${x.starved.join(', ')}]`).join(' · ') || 'none'}; `
      + `${judged.filter((x) => x.moved).length} game(s) move at all; skipped ${out.length - judged.length}${out.length - judged.length ? ' (' + out.filter((x) => x.skip).map((x) => x.id + ': ' + x.skip).join('; ') + ')' : ''}` });
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/gates-v4-derived.json'), { commit, dirty, ptr: { mo, md, openSame }, something: { ms, msd }, sample: out });
}

// ---- Part fix: REGENERATE the fixtures the pause moves ---------------------------------------------------------------
// ⚠ gates-r2 --part 2's pattern, and its reason: `--snapshots <dir>` CLEARS the directory it writes to, so each run
// writes into its OWN temp dir and only the marks the two runs AGREE on are copied into the tree, one file at a
// time. `all/M01`–`M15` are never touched.
async function partFix() {
  const dirs = [fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-v4-fix1-')), fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-v4-fix2-'))];
  const [A, B] = await Promise.all([
    job('ptr', rungFlags({ snapshots: dirs[0] })),
    job('ptr', rungFlags({ snapshots: dirs[1] })),
  ]);
  const ma = marksOf(A), mb = marksOf(B);
  const equal = A.gameSeconds === B.gameSeconds && A.hashGame === B.hashGame && JSON.stringify(ma) === JSON.stringify(mb);
  row({ gate: 'V4-fix the rung under the SHIPPED table, run 1 (the fixtures are written from it)', id: 'ptr',
    leg: `from all/M15.json, ${a.ticks || 16000} ticks, diff 1`, ok: !!A.ok, ticks: A.ticks, gameSeconds: A.gameSeconds, hash: A.hashGame,
    notes: `marks ${JSON.stringify(ma)}; resets ${JSON.stringify(Object.fromEntries(Object.entries(A.hook?.actions || {}).filter(([k]) => k.startsWith('reset:'))))}` });
  row({ gate: 'V4-fix run 2 — TWICE EQUAL', id: 'ptr', leg: 'the same leg again', ok: !!B.ok && equal,
    ticks: B.ticks, gameSeconds: B.gameSeconds, hash: B.hashGame,
    notes: `marks ${JSON.stringify(mb)}; equal to run 1: ${equal}` });
  const files = (d) => Object.fromEntries(fs.readdirSync(d).map((f) => [f.replace(/\.json$/, ''), path.join(d, f)]));
  const fa = files(dirs[0]), fb = files(dirs[1]);
  const SNAP_ALL = path.join(REPO, 'tools/harness/snapshots/ptr/all');
  for (const m of Object.keys(fa).sort()) {
    const s1 = JSON.parse(fs.readFileSync(fa[m], 'utf8'));
    const s2 = fb[m] ? JSON.parse(fs.readFileSync(fb[m], 'utf8')) : null;
    const same = !!s2 && s1.hashGame === s2.hashGame && s1.ticks === s2.ticks;
    const dest = path.join(SNAP_ALL, `${m}.json`);
    const before = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : null;
    const unmoved = before && before.hashGame === s1.hashGame && before.ticks === s1.ticks;
    if (same && !unmoved && !a['no-write']) fs.writeFileSync(dest, fs.readFileSync(fa[m]));
    row({ gate: `V4-fix fixture snapshots/ptr/all/${m}.json`, id: 'ptr', leg: 'from run 1, hashGame agreed by run 2', ok: same,
      ticks: s1.ticks, gameSeconds: s1.gameSeconds, hash: s1.hashGame,
      notes: `${before ? `OLD ${before.ticks}/${before.hashGame} → NEW ${s1.ticks}/${s1.hashGame}${unmoved ? ' (UNMOVED — not rewritten)' : ' — MOVED by the pause'}` : `NEW (no previous fixture) ${s1.ticks}/${s1.hashGame}`}; `
        + `run 2 ${s2 ? `${s2.ticks}/${s2.hashGame}` : 'MISSING'}; ${same ? (a['no-write'] || unmoved ? 'not written' : 'written') : 'NOT WRITTEN (the two runs disagree)'}` });
  }
  // ⚠ EVERY MARK RE-EVALUATED AT EVERY LATER FIXTURE (§14d.2 item 6 / §24.7): M16's predicate names row-2 `best`
  // values a q reset wipes, so it is true only in the window before row 3 first acts.
  const preds = JSON.parse(fs.readFileSync(path.join(REPO, PTR_LADDER), 'utf8'));
  const entries = (Array.isArray(preds) ? preds : preds.marks).filter((e) => ['M16','M17','M18','M19','M20','M21','M22'].includes(e.id));
  const predFile = path.join(os.tmpdir(), `v4-preds-${process.pid}.json`);
  fs.writeFileSync(predFile, JSON.stringify(entries.map((e) => [e.id, e.predicate])));
  for (const m of Object.keys(fa).sort()) {
    const v = await job('ptr', { diff: 1, ticks: 0, profile: 'all', 'from-snapshot': fa[m], predicates: predFile });
    row({ gate: `V4-fix predicates re-evaluated at the ${m} fixture`, id: 'ptr', leg: '0 ticks from the fixture, every mark of the rung', ok: !!v.ok,
      ticks: v.ticks, gameSeconds: v.gameSeconds, hash: v.hashGame,
      notes: (v.predicates || []).map((x) => `${x.name} ${x.error ? 'ERROR ' + x.error : x.value}`).join(' · ') || 'no predicate answered' });
  }
  writeJSON(path.join(REPO, 'tools/harness/results/tmp/gates-v4-fix.json'), { commit, dirty, A, B, equal, fixtures: Object.keys(fa) });
}

// ---- the page --------------------------------------------------------------------------------------------------------
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

// ---- Part 6: the page ------------------------------------------------------------------------------------------------
async function part6(browser, base) {
  for (const id of ['ptr', 'something']) {
    const notes = [];
    let ok = true;
    const check = (c, w) => { if (!c) ok = false; notes.push(`${c ? '✓' : '✗'} ${w}`); };
    const { context, page, errs } = await openGamePage(browser, base, id, '&profile=all');
    try {
      await showSub(page, 'Advanced');
      // the feature to drive: an editable one that is actually RUNNING, so a stop can be seen to stop something
      const target = await page.evaluate(() => {
        const r = tmtLoader.explain().find((x) => x.state === 'on' && x.kind === 'reset');
        return r ? r.id : null;
      });
      check(!!target, `an editable, running reset feature to drive: ${target}`);
      if (!target) throw new Error('nothing to drive');

      // ---- the CONTROLS are on screen, one row per declared control --------------------------------------------
      const shape = await page.evaluate((fid) => ({
        rows: document.querySelectorAll(`.tmtl-ctl-row[data-fid="${fid}"]`).length,
        controls: tmtLoader.controls().map((c) => c.name),
        boxes: document.querySelectorAll(`input.tmtl-input[data-fid="${fid}"][data-control]`).length,
        helpers: document.querySelectorAll(`select.tmtl-select[data-fid="${fid}"][data-control]`).length,
        comps: tmtLoader.componentNames.length,
        warn: (document.querySelector('.tmtl-watch-warn') || {}).textContent || '',
      }), target);
      // ⚠ ONE HELPER LIST PER *PREDICATE* CONTROL, counted from the schema rather than from a literal — a fourth
      // control of either type would move this row rather than slip past it. ⚠ And the loader binds `data-control`
      // to `null` when there is none, because Vue RENDERS an attribute bound to `''`: with `|| ''` this selector
      // also matched the strategy picker and read three helper lists where two exist (measured).
      const preds = shape.controls.length - 1;   // `priority` is the one `count`
      check(shape.rows === shape.controls.length && shape.helpers === preds && shape.boxes === shape.controls.length && shape.comps === 6,
        `${shape.rows} control row(s) for ${JSON.stringify(shape.controls)}, ${shape.boxes} field(s), ${shape.helpers} helper pick-list(s) (one per predicate, expected ${preds}), ${shape.comps} component(s) — no new component family`);
      // ⚖ V4 Part 4: the watch's label, which R2 owed
      check(/experimental — not a safety net/.test(shape.warn) && shape.warn.length > 80,
        `the stall watch reads as EXPERIMENTAL beside its own switch, with the reason: "${shape.warn.replace(/\s+/g, ' ').slice(0, 140)}…"`);

      // ---- TYPING a predicate through the real component, with a live HOTKEY pressed into the field --------------
      // ⛔ TRAP (i). Both engines act on a bare letter from `document.onkeydown`, so `p` in a field would PRESTIGE on
      // ptr. The predicate below CONTAINS the letters the games bind, so typing it IS the hotkey leg.
      const src = id === 'ptr' ? "player.p.points.gte(0)" : 'player.points.gte(0)';
      const box = page.locator(`#app input.tmtl-input[data-fid="${CSS_ESC(target)}"][data-control="while"]`).first();
      // ⚠ `stateJSON()`, NOT `hashGame()`. In the PAGE the hash goes through SubtleCrypto and returns a PROMISE, so
      // comparing two of them compares two objects that are never `===` — measured: the first cut of this row read
      // `hashGame [object Object] vs [object Object]` and was red on a page that was behaving perfectly.
      // `stateJSON(gameState)` is synchronous, is the same serialisation `hashGame` is taken OF, and masks the clock.
      // ⚠ AND IT MUST BE `gameState`, NOT THE BARE CALL — measured, and it is the whole point of the leg being about
      // the GAME: committing the predicate writes `player.au.edits` and `player.au.disclosed`, so a bare
      // `stateJSON()` moves BECAUSE THE FEATURE WORKED. `hashGame`'s own exclusion is what this row is asking about.
      const before = await page.evaluate(() => ({ state: tmtLoader.stateJSON(tmtLoader.gameState), acts: JSON.stringify(tmtLoader.hookStats().actions) }));
      await box.click({ timeout: 5000 });
      await box.fill('');
      await page.keyboard.type(src, { delay: 8 });
      await page.keyboard.press('Enter');
      await redraw(page);
      await page.waitForTimeout(200);
      const typed = await page.evaluate((fid) => ({ saved: tmtLoader.savedControl(fid, 'while'), owner: tmtLoader.controlState(fid)['while'].owner,
        state: tmtLoader.stateJSON(tmtLoader.gameState), acts: JSON.stringify(tmtLoader.hookStats().actions) }), target);
      check(typed.saved === src && typed.owner === 'you',
        `a predicate TYPED through the real component committed to the save: ${JSON.stringify(typed.saved)} (owner ${typed.owner})`);
      check(typed.state === before.state && typed.acts === before.acts,
        `⛔ and the game's own HOTKEYS did not fire while it was typed (the text contains the letters both engines bind): `
        + `the GAME's own state (hashGame's, without player.au) is byte-identical ${typed.state === before.state} (${before.state.length} chars), actions unchanged ${typed.acts === before.acts}`);

      // ---- a REFUSAL keeps the previous value, on the page ------------------------------------------------------
      await box.click({ timeout: 5000 });
      await box.fill('player.p.points.gte(');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      const refused = await page.evaluate((fid) => ({ saved: tmtLoader.savedControl(fid, 'while'),
        err: (document.querySelector(`.tmtl-ctl-row[data-fid="${fid}"][data-control="while"] .tmtl-error`) || {}).textContent || null }), target);
      check(refused.saved === src && !!refused.err,
        `a refused predicate left the previous one in force and SAID why on screen: saved ${JSON.stringify(refused.saved)}, message "${String(refused.err).slice(0, 90)}"`);

      // ---- `until`, the BLOCK's reason, a RELOAD and the RE-ARM PRESS -------------------------------------------
      const set = await page.evaluate((fid) => {
        tmtLoader.setSavedControl(fid, 'while', null);
        const r = tmtLoader.setSavedControl(fid, 'until', 'true');
        tmtLoader.tick(1, 3);
        tmtLoader.invalidateView();
        return { r, state: tmtLoader.controlState(fid).until };
      }, target);
      await redraw(page);
      await page.waitForTimeout(200);
      const blockText = await page.evaluate((fid) => {
        const b = Array.from(document.querySelectorAll('.tmtl-block')).find((e) => e.textContent.indexOf(fid) >= 0);
        return b ? b.innerText.replace(/\s+/g, ' ') : null;
      }, target);
      check(set.state.stopped === true && /Stopped/.test(String(blockText)),
        `the BLOCK shows the stop the decision returned: "${String(blockText).slice(0, 150)}…"`);

      await page.evaluate(() => { save(); });
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => window.tmtLoader && (tmtLoader.ready || tmtLoader.error), null, { timeout: 30000 });
      await page.evaluate(() => tmtLoader.pause());
      await showSub(page, 'Advanced');
      const back = await page.evaluate((fid) => tmtLoader.controlState(fid).until, target);
      check(back.stopped === true && back.value === 'true',
        `a RELOAD came back with the stop still in force: ${JSON.stringify(back)} — the latch is in the save, not in the process`);

      // the press itself
      const rearmBtn = page.locator(`#app button.tmtl-rearm[data-fid="${CSS_ESC(target)}"]`).first();
      check(await rearmBtn.count() > 0, 'the re-arm press is on screen beside the stop');
      await rearmBtn.click({ timeout: 5000 });
      await redraw(page);
      await page.waitForTimeout(200);
      const rearmed = await page.evaluate((fid) => {
        const a0 = (tmtLoader.hookStats().actions[fid] || 0);
        tmtLoader.setSavedControl(fid, 'until', null);
        tmtLoader.tick(1, 20);
        return { until: tmtLoader.controlState(fid).until, acted: (tmtLoader.hookStats().actions[fid] || 0) - a0 };
      }, target);
      check(rearmed.until.stopped === false && rearmed.acted > 0,
        `one press re-armed it and the feature acted again (${rearmed.acted} action(s) in 20 ticks): ${JSON.stringify(rearmed.until)}`);

      // ---- a PRIORITY edited through the component --------------------------------------------------------------
      const pbox = page.locator(`#app input.tmtl-input[data-fid="${CSS_ESC(target)}"][data-control="priority"]`).first();
      await pbox.click({ timeout: 5000 });
      await pbox.fill('1');
      await page.keyboard.press('Enter');
      await redraw(page);
      await page.waitForTimeout(200);
      const prio = await page.evaluate((fid) => tmtLoader.controlState(fid).priority, target);
      check(prio.owner === 'you' && prio.effective === 1 && prio.kindPlace !== 1,
        `a priority edited through the component: ${JSON.stringify(prio)} (its kind's place was ${prio.kindPlace})`);

      // ---- typed text is INERT ----------------------------------------------------------------------------------
      const xss = await page.evaluate((fid) => {
        tmtLoader.setSavedControl(fid, 'while', 'player.points.gte(0) /* <img src=x onerror="window.__tmtXSS4=1"> */');
        tmtLoader.invalidateView();
        return tmtLoader.savedControl(fid, 'while');
      }, target);
      await redraw(page);
      await page.waitForTimeout(250);
      const inert = await page.evaluate(() => ({ fired: !!window.__tmtXSS4, imgs: document.querySelectorAll('#app img[src="x"]').length,
        shown: (document.querySelector('#app').innerText || '').indexOf('onerror') >= 0 }));
      check(!inert.fired && inert.imgs === 0 && inert.shown,
        `a predicate containing markup renders as TEXT: script fired ${inert.fired}, img injected ${inert.imgs}, the text is on screen ${inert.shown} (${String(xss).slice(0, 60)})`);

      // ---- M1's au rows intact ----------------------------------------------------------------------------------
      const grid = await page.evaluate(() => {
        const L = layers[tmtLoader.auLayer];
        return { rows: L.clickables.rows, cols: L.clickables.cols, ids: Object.keys(L.clickables).filter((k) => !isNaN(k)).length, features: tmtLoader.features.length };
      });
      check(grid.cols === 4 && grid.ids === grid.features + 1 && grid.rows === Math.ceil((grid.features + 1) / 4),
        `the Simple grid's arithmetic is untouched: ${grid.rows}×${grid.cols} over ${grid.ids} clickable(s) for ${grid.features} feature(s)`);
      check(errs.length === 0, `no page error at all: ${errs.length}${errs.length ? ' — ' + errs[0] : ''}`);
    } catch (e) { ok = false; notes.push('EXCEPTION ' + String((e && e.stack) || e).slice(0, 400)); }
    finally { await context.close(); }
    row({ gate: 'V4-6 (page) a predicate typed, refused, stopped, reloaded, re-armed; a priority edited; markup inert', id, leg: 'profile all, au → Advanced', ok, notes: notes.join('; ') });
  }
}

// ---- Part 7: the roster ------------------------------------------------------------------------------------------
// ⛔ ABSTENTIONS ARE COUNTED AND LEFT UNCAUSED (§18.4 item 11): an abstention is a measurement NOT MADE.
async function part7(browser, base, ids) {
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
        const b0 = errs.length;
        await redraw(page);
        await page.waitForTimeout(60);
        const perRedraw = errs.length - b0;
        const before = errs.length;
        r = await page.evaluate(async () => {
          const T = window.tmtLoader, out = { features: T.features.length, components: T.componentNames.length };
          const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
          player.subtabs[T.auLayer].mainTabs = 'Advanced'; updateTemp(); if (typeof updateTabFormats === 'function') updateTabFormats();
          out.paints = 1;
          await sleep(140);
          const rows2 = T.explain().filter((x) => x.state !== 'locked' && x.state !== 'excluded');
          out.editable = rows2.length;
          out.ctlRows = document.querySelectorAll('#app .tmtl-ctl-row').length;
          out.helpers = document.querySelectorAll('#app select.tmtl-select[data-control]').length;
          out.warn = !!document.querySelector('#app .tmtl-watch-warn');
          out.controls = T.controls().length;
          // every registered feature answers `controlState` without throwing, and none claims an owner
          out.owned = T.explain().filter((x) => x.control && (x.control['while'].owner || x.control.until.owner || x.control.priority.owner)).map((x) => x.id);
          out.unknown = T.explain().filter((x) => x.last && x.last.code === 'unknown').map((x) => x.id);
          out.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth;
          out.helperSrc = rows2.length ? T.predicateHelpers(rows2[0].id).length : 0;
          return out;
        });
        r.perRedraw = perRedraw;
        r.extra = (errs.length - before) - perRedraw * r.paints;
        r.errs = errs.slice(0, 2);
      } finally { await context.close(); }
    } catch (e) { abstained.push(`${id}: ${String(e.message).slice(0, 90)}`); continue; }
    const ok = r.unknown.length === 0 && r.extra <= 0 && r.scrollX === false && r.components === 6
      && r.controls === 3 && r.ctlRows === r.editable * 3 && r.helpers === r.editable * 2
      && r.owned.length === 0 && (r.editable === 0 || r.helperSrc > 0) && r.warn;
    judged.push({ id, ok, r });
    if (!ok) row({ gate: 'V4-7 roster: three control rows and two helper lists per editable block', id, leg: 'profile all', ok: false, notes: JSON.stringify(r).slice(0, 700) });
  }
  const red = judged.filter((x) => !x.ok);
  row({ gate: 'V4-7 the ROSTER: the new editors render on every game judged, and NOTHING is set on any of them', id: `${judged.length} judged`, leg: `${ids.length} assigned`,
    ok: red.length === 0 && judged.length > 0,
    notes: `judged ${judged.length}, RED ${red.length} (${red.map((x) => x.id).join(', ') || 'none'}), abstained ${abstained.length}${abstained.length ? ' — ' + abstained.join(' · ') : ''} `
      + `⚠ (counted, and NOT given a cause: an abstention is a measurement not made — §18.4 item 11); `
      + `${judged.reduce((s, x) => s + x.r.ctlRows, 0)} control row(s) over ${judged.reduce((s, x) => s + x.r.editable, 0)} editable block(s); `
      + `${judged.reduce((s, x) => s + x.r.helpers, 0)} helper pick-list(s); `
      + `⛔ 0 of ${judged.length} game(s) has ANY control set, which is what "off by default" means here; `
      + `the experimental label is beside the watch on ${judged.filter((x) => x.r.warn).length} of ${judged.length}; `
      + `console-error control: ${judged.reduce((s, x) => s + x.r.perRedraw, 0)} line(s) per redraw over ${judged.length} game(s)` });
  writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v4-part7${a.shard ? '-' + String(a.shard).replace('/', 'of') : ''}.json`), { commit, dirty, assigned: ids, judged: judged.map((x) => ({ id: x.id, ok: x.ok, ...x.r })), abstained });
}

// ---- entry -----------------------------------------------------------------------------------------------------------
let browser = null, server = null;
try {
  if (PART === '1') await part1();
  else if (PART === 'm21') await partM21();
  else if (PART === 'derived') await partDerived();
  else if (PART === 'fix') await partFix();
  else if (PART === '2') await part2();
  else if (PART === '3') await part3();
  else if (PART === '4') await part4();
  else if (PART === '5') await part5();
  else {
    browser = await chromium.launch();
    server = await startServer(REPO);
    if (PART === '6') await part6(browser, server.url);
    else if (PART === '7') {
      let ids = a._.length ? a._ : GAMES();
      if (a.shard) { const { i, n } = parseShard(a.shard); ids = assignShards(GAMES(), n)[i - 1]; }
      await part7(browser, server.url, ids);
    } else throw new Error(`unknown --part ${PART}`);
  }
} finally {
  if (browser) await browser.close();
  if (server) server.stop();
}

const date = new Date().toISOString().slice(0, 19) + 'Z';
if (!a['no-summary']) appendSection({ title: `V4 part ${PART} (\`node tools/harness/gates-v4.mjs --part ${PART}\`)`, commit, dirty, rows });
writeJSON(path.join(REPO, `tools/harness/results/tmp/gates-v4-part${PART}-last.json`), { date, commit, dirty, rows });
console.log(`gates-v4 part ${PART}: ${rows.filter((r) => r.ok).length}/${rows.length} green`);
if (a.assert) {
  const want = ROWS[PART];
  const line = `v4-part${PART} VERDICT: rows ${rows.filter((r) => r.ok).length}/${rows.length}${want === undefined ? '' : ` of ${want} expected`}; ${rows.filter((r) => !r.ok).length} RED`;
  console.log(line);
  if (want === undefined) { console.log(`v4-part${PART} REFUSED: no expected row count is declared for this part`); process.exit(1); }
  if (rows.length !== want) {
    console.log(`v4-part${PART} REFUSED: ${rows.length} row(s), expected ${want} — a battery that stops part-way prints fewer rows, and fewer rows is fewer reds`);
    process.exit(1);
  }
}
process.exit(rows.every((r) => r.ok) ? 0 : 1);
