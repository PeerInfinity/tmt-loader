# The harness path for long games: ladder, snapshots, diff calibration

> ⛔ **A `gates-*.mjs` file is a battery, not a library.** Its body runs at top level, so importing one — to read a
> constant, say — RUNS it: boot children, and for `gates-h1 --part 1` and `gates-p1a --part 0` a rewrite of the
> committed fixtures under `snapshots/ptr/`. The nine top-level ones call `entryOnly(import.meta.url)` (lib.mjs)
> and refuse to be imported, saying what to do instead; `gates-r1.mjs` does the same by wrapping its body in
> `if (ENTRY)`. Run them; do not import them.

A full game of a Modding Tree fork is days of game time; at diff 1 one Prestige Tree Rewritten game-day is tens of
minutes of wall time in Node. The harness therefore measures a game as a **ladder** of machine-checkable marks, keeps a
**snapshot** at every mark it reaches, and runs each new stretch **from the previous mark's snapshot** at the coarsest
**diff** the calibration allows. Everything here is harness-side: the page, the save format and the automation core's
behaviour are unchanged (the core only gained `tmtLoader.runtimeState()` / `restoreRuntime()`, automation mode only).

## The ladder file

`tools/harness/ladder/<game>.json` — header keys, then one mark per line:

```json
{
  "game": "ptr",
  "plan": "…where the marks come from…",
  "diffRule": "…",
  "helpers": { "hasUpgrade": "games/ptr/js/utils.js:633", … },
  "marks": [
    {"id": "M02", "name": "b and g unlocked", "predicate": "player.b.unlocked && player.g.unlocked", "wall": "…", "source": {"plan": "§3a M02", "digest": ["L1.2"], "reached": "A1-3 (i) …"}, "diff": 1, "diffSource": "H1-3 @… ×1 1361s, ×5 …"},
    …
  ]
}
```

- **`predicate`** is a JS expression over the engine's globals — the same mini-language as `run.mjs --until` / `--marks`
  and the automation table's `gates` (compiled once with `new Function` in the game's global scope). A predicate that
  throws reads as **false** (PTR's `getBuyableAmount` returns a plain `0` for a locked layer, so `.gte(1)` throws until
  the layer unlocks).
- **`source`** carries provenance: the plan row, the walkthrough-digest steps, the SUMMARY row that first reached it.
- **`diff`** is the calibrated diff for the mark (below); `null` until a run has calibrated it.
- Marks are ordered as the walkthrough orders them; a run may reach them out of order (PTR's M10, the native toggles,
  holds before M09 when the `toggles` kind runs).

`gates-h1.mjs --part 1` checks that every predicate compiles and that the helpers exist at the recorded lines.

## Runner flags (`tools/harness/run.mjs`)

| Flag | Meaning |
|---|---|
| `--ladder <file>` | the marks are the ladder's entries after `--from` (exclusive) through `--to` (inclusive; default the last), recorded without stopping; the run stops at the first tick `--to` holds (or a stall / the wall / `--ticks`) |
| `--from <mark>` / `--to <mark>` | the slice |
| `--until-all` | stop when **every** mark of the slice holds instead of when `--to` does |
| `--snapshots <dir>` | at the first tick each mark holds, write `<dir>/<mark>.json` |
| `--from-snapshot <file>` | boot from a snapshot (below); `--from` defaults to its mark and `--diff` to its diff |
| `--no-runtime` | (a control) restore the snapshot's counters but not the memory outside `player` |
| `--predicates <list.json>` | `[[name, "<js>"], …]` compiled and evaluated once after load (`R.predicates`) |
| `--eval "<js>"` | an expression evaluated at the stop, returned as JSON (`R.eval`) |
| `--planner` | load `loader/tmt-planner.js` after `tmt-auto.js` and run nothing (P1a; the page never fetches it) |
| `--planner=auto` \| `--planner=suggest` | also DRIVE it: `planner.beforeTick()` runs **between** ticks and plans one epoch at a time (P1b). `auto` commits the winning configuration of the simple system to the live game; `suggest` plans and logs and commits nothing — the page's Suggest mode, headless. `--planner-mode <m>` is the same switch spelled apart |
| `--planner-opt "k=v;k2=v2"` | the planner's options (`k`, `screenK`, the score weights, the clocks — `docs/planner.md`); an unknown key throws |
| `--planner-ladder <file>` | the ladder JSON becomes `tmtLoader.plannerLadder`, the sticky goal source |
| `--planner-k <n>` / `--knowledge-out` / `--goals-out` | P1a: the producer window, and the dumps written at the stop |
| `--rounds-out <file>` | the planner's report at the stop: mode, options, reached / abandoned marks, clocks, divergences and the full round log (`docs/planner.md`, "reading a round log") |

A driven run's one-line result gains `planner: {mode, rounds, commits, divergences, reached, options, wallMs,
measuredGameSeconds}`. A planning round that THROWS stops the run (`failed_at: 'planner'`): a live game left running a
configuration nobody chose is worse than a red row. The planner's own memory — the once-reached marks, the stall clocks,
the committed epoch — rides in `tmtLoader.runtimeState()` with the registry's, so a snapshot carries it and a chained
`--from-snapshot` leg continues the campaign instead of restarting it.

The result (and the one-line summary) gains `ladder: {from, to, reached: [{id, ticks, gameSeconds, hash, hashGame}],
stoppedAt: {ticks, gameSeconds, why}}` with `why` = `to` | `stalled` | `walled` | `ticks`. Long runs keep using
`--stall <game-s> --stall-seen --wall-ms 540000` (one process ≤ 10 min).

## Snapshots

A snapshot is

```
{ mark, commit, dirty, ticks, gameSeconds, diff, hash, hashGame, config: {profile, auto-opt, from},
  player: "<JSON.stringify(player)>",
  runtime: { auto: tmtLoader.runtimeState(), monitor: {seen, bmax, lastTick, lastGs} } }
```

taken **after** the mark's tick (the same state the mark's `hashGame` hashes). `runtime.auto` is the automation core's
memory outside `player`: each interval reset's `lastReset` (compared with `player.timePlayed`; undefined after a re-boot,
so the policy would fire at once), the loop counter and per-layer ran-at marks of the double-call check, and the hook
statistics (action counts continue). Since P1b it also carries, **only when they are not empty**, the runtime
`policies` set with `setPolicy` (otherwise an excursion's policy change would leak past the restore, and a chained
process would drop the configuration the planner committed), the runtime `enabled` overrides, and `extra.planner` —
whatever a later layer registered with `tmtLoader.registerRuntime`. A run that uses none of them writes exactly the
record it wrote before, so every committed snapshot stays valid. `runtime.monitor` is the stall detector's seen-set, buyable maxima and last-progress
point, so a resumed run stalls where the uninterrupted one does. `dirty` ignores `tools/harness/snapshots` and
`tools/harness/results`.

`--from-snapshot` boots through the existing `--load-from` path — one child calls the game's own
`importSave(btoa(player), true)` (`tmtLoader.loadFrom`), a fresh child boots on the storage that wrote — then restores
`runtime` and sets `tmtLoader.ticks` / `gameSeconds` to the snapshot's counts, so **ticks and game-seconds continue**. The
importing child registers the same features as the run (same `--auto-opt`), so even the full hash (which includes
`player.au.clickables`, one key per au button) round-trips. Marks compare **`hashGame`** (the state without `player.au`)
across any change to the feature set.

**A snapshot of the STOP.** `run.mjs --stop-snapshot <dir> [--stop-snapshot-name <name>]` writes the same record at the
run's stop (a stall, the wall, `--ticks`) instead of at a mark — the fixture a run that ends nowhere near a ladder mark
leaves behind. `tools/harness/snapshots/ptr/frontier/STALL.json` is the S1 frontier stall taken that way (gate
`gates-p1a --part 0` writes it and requires it to reproduce §10a.4: 14131 ticks, hash `63f28e099536a119`).

⚠ **A resume is byte-faithful in `player`, not necessarily in `tmp`.** `tmp` is not a pure function of `player`:
2.2.1's `getNextAt` reads `tmp[layer].nextAt` and `tmp[layer].baseAmount` (game.js:36-52), so it is self-referential
and has more than one fixed point. Measured at the frontier: `tmp.b.nextAt` is `2.33e276` in the uninterrupted run and
`9.85e167` after a resume at a byte-identical `player`. H1-2's resume fidelity (M02 / M07 → M09 land on the same tick
and `hashGame`) is a measurement of those states, not a general guarantee; a rung that resumes deep in a run should
re-measure the stretch it depends on. See `docs/planner.md`.

**Fixtures.** Snapshots of the marks the tables reach are committed under `tools/harness/snapshots/<game>/<set>/`:
for PTR, `pinned/` (`--auto-opt kinds=reset,upgrades,buyables` plus the A2 policy set, the configuration every pinned
number was measured in — a pin is a measurement of a CONFIGURATION, so it names one rather than inheriting whatever the
table says today), `all/` (every derived kind, the configuration rungs continue from — **M01–M10 were measured under the
A2 policies and M11–M16 under R1′'s table**, which is in each snapshot's `config`) and `frontier/` (the S1 stall itself,
which R1′ walked through: M11 14745 · M12 14909 · M13 14132 · M14 14879 · M15 16048 · M16 24179, and M17 holds at M16);
for Something Tree, `all/` (S01–S05, profile all, every kind — each lands on the A2-1 tick and `hashGame`). A PTR
`player` is ~11 KB, a snapshot ~15–18 KB. Measured fidelity (H1-2): a resume lands on every later mark at the same tick, game-second and
`hashGame` as the fresh run, and reproduces the frontier stall's tick and full hash; without `runtime` (the control) it
lands one tick early where an interval reset was mid-interval.

## Diff calibration

The engine's `gameLoop(diff)` is not linear in diff: a coarse diff reaches a mark at a different game-second (resets and
purchases happen at most once per tick; a layer unlocked inside `gameLoop` shows a one-tick class of difference). The
rule: for diffs {1, 5, 20, 60}, two fresh runs each to the ladder's calibrated range; **a diff is usable for a mark when
both runs' game-seconds at the mark are within 2 % of diff 1's** (hashes differ at a coarse diff — the criterion is the
mark's timing). The ladder records the coarsest usable diff per mark (`diff`, with the measurement in `diffSource`);
marks no calibration reached stay `null` and are filled by the rung that first reaches them, by the same rule. Diff 1 is
the reference, not ground truth (Something Tree's A2-1 (i) is 208 s at diff 0.05 and 309 s at diff 1). Node ≡ page parity
stays at diff 0.05 and is untouched by any of this. `gates-h1.mjs --part 3` runs it (and records wall-clock per run and
the box load); `--part 3v` re-runs the ladder at each mark's recorded diff.

## How a rung uses it

```
node tools/harness/run.mjs ptr --profile all --ladder tools/harness/ladder/ptr.json \
  --from-snapshot tools/harness/snapshots/ptr/all/M09.json --to M16 \
  --diff <the ladder's diff for the marks> --stall 3600 --stall-seen --wall-ms 540000 \
  --snapshots tools/harness/snapshots/ptr/all --json out.json
```

1. Start from the committed snapshot of the last mark reached (`--from-snapshot <prev mark>`), in the configuration the
   rung changes (`--auto-opt`, or the table itself).
2. Run `--ladder --to <next mark>`; a sweep varies one policy and compares game-seconds to the next mark.
3. When a new mark is reached, commit its snapshot (the fixture the next rung starts from), calibrate its `diff` if it is
   `null`, and print the ladder with `node tools/harness/ladder-summary.mjs [--append]`.
4. A change to the core or a table re-checks the earlier fixtures by resuming from them: the marks after must land at
   the recorded tick and `hashGame` (or the change is a finding, not a re-record).
