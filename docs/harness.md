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

## The full sweep runs in CI, sharded (`--shard i/N`)

Every UI slice owes a full `--gate mobile` sweep over all 171 games. Locally that is one machine held for around
three quarters of an hour (measured 2026-09-18: ~16 s/game, ~46 min for the roster — U2b's visibility rules pushed it
up by adding four in-page probe evaluations and two forced rebuilds per game). `.github/workflows/sweep.yml` runs it
on every push to `main` across ten runners instead, so a slice can verify a **bounded local set** — `ptr`, `something`,
and whatever its own change can actually be seen on — and let CI own the roster.

### Running one shard locally

```
node tools/harness/page.mjs --gate mobile --shard 3/10 --dry-run          # which games is shard 3? (no browser)
node tools/harness/page.mjs --gate mobile --shard 3/10 --json shards/m1-3.json
node tools/harness/merge-shards.mjs shards --expect 10                    # the verdict
```

`i/N` is **one-based**, like Playwright's own `--shard=1/10`. The slice is a pure function of the roster and `N`, so
`--shard 3/10` here and shard 3 in CI are the same games — verified across machines, not assumed: `--dry-run` locally
reproduces exactly the roster CI's shards 1, 5 and 10 recorded being assigned. `--shard` also works with an explicit roster
(`page.mjs a b c --gate mobile --shard 1/3`), which is how the arrangement is tested without a full sweep.

### What the merge asserts, and why it is not optional

⛔ **A shard that dies before running anything reads as GREEN.** `npm ci` falls over, the runner is reclaimed, the
checkout times out — the shard produces no rows, and an absence of failures is indistinguishable from a pass. Worse,
the incentive runs backwards: a sharding bug that silently drops games makes the whole run **faster and greener**.
Speed is not evidence here and neither is an exit code.

So every shard records the roster it was **assigned** alongside the rows it produced, and `merge-shards.mjs` refuses
the run unless those reconstruct the roster. Four independent refusals:

1. every shard index `1..N` present exactly once, all shards agreeing on `N`;
2. every shard reporting the same `commit` — a shard built from another tree is not part of this answer;
3. each shard's rows covering exactly its own assigned roster, which is what catches a shard that started, ran four
   games and died (its file exists, its rows are green, and its job may well have exited 0);
4. the union of the rows covering the full roster **exactly once** — nothing missing, nothing twice.

A hung game is covered by the same mechanism rather than a special case: the gate has no per-game timeout, so a
shard that hangs is killed by the job's `timeout-minutes` and produces no JSON — which the merge reports as a missing
shard, naming every game that shard was assigned. ⚠ That is the *only* thing standing between a hang and a green run,
so do not raise `timeout-minutes` past the point where a stuck shard would outlive the run.

It exits 1 naming the ids. `loader/shard.test.mjs` drives it: nine shards out of ten, a shard truncated mid-slice, a
commit mismatch, an empty matrix. Those tests were written against deliberately broken versions of the merge and the
partition, and each mutant turns them red — which is the only reason to believe they mean anything.

⚠ **An abstention must survive sharding.** `the-periodic-table-tree` and five others do not repeat their own hash, so
the M1 state leg abstains on them rather than reaching a verdict. A shard boundary must never promote that to a pass
or a failure; the merge carries it through and reports the count.

### Interleaved, not chunked

`assignShards` is longest-processing-time-first: heaviest game to the lightest shard so far, ties to the lowest index.
When every cost is equal that degenerates to plain round-robin over the id-sorted roster, so interleaving is the floor
and the cost model can only improve on it.

⚠ **Two cost models have been wrong here, and the second one is the interesting one.**

The first was *cost ∝ views*. Only `ptr` and `something` have deep snapshots, so only they are swept at every tab that
save can open — 20 and 14 views against everyone else's 1 — which looks like 20× the work. It is not: most of a game's
cost is fixed (three boots for the state leg and its control, the navbar-only leg's paired control, the layers legs),
and an extra view costs about 0.94 s. That model put one shard on a single game.

The second was `12 s + 1 s × (views − 1)`, which replaced it. The first green CI run (171 games, `a665c24`, 2026-09-18)
measured what no view count can see — **the dominant term is how expensive the game itself is to boot and tick**:

| game | views | CI wall |
|---|---|---|
| `the-gaming-tree` | 1 | 53.4 s |
| `the-point-tree` | 1 | 47.2 s |
| `plague-tree-vorona-cirus-treesease` | 1 | 41.1 s |
| `ptr` | 20 | 14.6 s |
| `something` | 14 | 10.2 s |
| *median / mean / fastest* | 1 | *3.3 s / 4.8 s / 1.6 s* |

`ptr` is not in the top three. The spread between the median game and the slowest is 30×, and "it averages out over
the ~17 games a shard holds" — which this document claimed before that run — came out **false**: the shards ran 47 s
to 157 s, a ×3.33 spread.

So `shardCost` consults a **measured table**, `tools/harness/shard-costs.json`, and falls back to the view estimate for
a game nobody has timed yet. Regenerate it after a green sweep:

```
node tools/harness/merge-shards.mjs shards --expect 10 --write-costs tools/harness/shard-costs.json
```

It refuses to write from a run that did not cover the roster — a partial run's timings would teach the next run to
balance against games nobody timed.

⚠ **Do not read the in-sample number as the result.** The table predicts ×1.02 on the run it was built from; the very
next run came out **×2.22** — better than the ×3.33 it replaced, and nowhere near the prediction. The gap is not a
modelling failure, it is the runners. Measured across the two runs, the SAME game's wall clock moves by 0.57× to
1.93× (median 1.05, quartiles 0.94 and 1.37), and an oracle given run 2's own timings in advance would have scored
×1.02 on run 2 — a number no table written beforehand can reach. **×2 is roughly the floor for a static cost table
here**, and chasing it further is chasing noise. Three runs so far: ×3.33 without the table, then ×2.22 and ×1.90
with it.

⚠ **Nothing about coverage depends on any of this.** The table will go stale, a new game will not be in it, and
neither matters: `assignShards` partitions the roster exactly once whatever the costs are, asserted over
N ∈ {1, 2, 3, 7, 10, 17, 170, 171, 200} in `loader/shard.test.mjs`. **A bad cost model makes CI slower; it cannot make
it wrong.**

### What CI is, and is not

⚖ **Report-only, not a required check** (2026-09-18), until the sweep has a few green runs behind it. Nothing in branch
protection references it; a red is a red X on the commit and blocks nothing.

Measured over the first three green runs (171 games, 10 shards each): **3 m 43 s**, 3 m 01 s and 3 m 08 s end to end, against **32.5 minutes** for the same sweep locally (mean 11.4 s/game — ⚠ not the ~50 s/game this arc was
briefed at). Each shard job was 97–197 s, of which roughly 90 s is checkout, `npm ci` and the Playwright install
— so the sweep itself is the smaller half of a shard's wall clock, and pushing past 10 shards buys little.

⚠ If you see a RED on `the-periodic-table-tree`'s state leg, **investigate it — do not re-run.** That leg used to
return a false RED about 7.9 % of sweeps, which on a per-push job is a red roughly weekly for no reason; `e3ba99c74`
took it to ~1 in 80,000 by demanding four further plain draws before it will say MOVED. A red there is now a finding.

CI pins Node to the version the local sweep runs (`NODE_VERSION` in the workflow), because the merged output is
compared against a local full sweep's verdicts and a different engine is a variable nobody wants in that comparison.

**CI and a local sweep agree, measured.** The merged output of both CI runs was compared against a full local
unsharded sweep at the same code: the roster is an **identical set** of 171, and `ok`, `inertOk`, `geometryOk`,
`navOk`, `bothOk`, `navbarOnlyOk`, `layersOk`, `rulesOk`, `ready`, the per-game view count and the per-game chip
count are **identical on every game**. The state leg abstained on the same six either way, and nothing reported
MOVED. The shard assignment is identical across machines too: `--shard i/10 --dry-run` locally reproduces byte for
byte the rosters CI's shards recorded being assigned.

### Publishing is a separate, manual workflow

⚖ **User ruling, 2026-09-18: the Pages deploy no longer happens on every push.** The repo was on `build_type: legacy`
with source `{branch: main, path: /}`, so every push republished the site; it is now `build_type: workflow`, and
`.github/workflows/pages.yml` is `workflow_dispatch` only. **To publish: `gh workflow run pages.yml --ref main`.**

WHAT is served did not change — the legacy build served the branch's tracked tree from the repo root, and the workflow
stages `git archive HEAD`, which is exactly that. Only WHEN moved. The artifact is 242 MB over 12,864 files, 128 MiB
compressed, against a 1 GB Pages limit; excluding `.git` (210 MB) is what keeps it there.

⛔ Do not add a `push:` trigger to `pages.yml`, and do not let `sweep.yml` deploy. `loader/workflows.test.mjs` asserts
both, because the way a ruling like this gets undone is not malice but convenience.
