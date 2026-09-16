# The advanced planner (`tmtLoader.planner`) — P1a: rollback, knowledge, goals

There are **two automation systems** in this loader (⚖ user ruling, tmt-automation-plan §11):

| | the SIMPLE system (`loader/tmt-auto.js`, A1–S1) | the ADVANCED system (`loader/tmt-planner.js`, P1a→) |
|---|---|---|
| what it is | per-layer reflexes run from each layer's `automate()` | a planner that measures the game on a rolled-back copy |
| what it knows | a policy per feature, plus per-game DATA (`games-auto/<id>.js`) | nothing in advance: it discovers goals, thresholds, producers and chains at runtime |
| when it runs | inside `gameLoop`, every tick | **between** ticks, never inside one |
| where | page and harness, every feature OFF by default | P1a: the HARNESS only (`--planner`); P2: a Web Worker in the page |
| what P1a decides | — | **nothing**. P1a reads, measures and remembers; P1b decides |

The advanced system carries omsi-loops' commitments verbatim (`frontend/modules/omsi-loops/AUTOMATION.md` §1):
**zero hand-scripted game knowledge**, **the engine is ground truth**, **determinism**, and **the live game is never
rolled back**. Headless the harness process IS the copy: `snapshot()` → act → `restore()`. In P2 the copy is a worker.

⚖ Zero hand-scripted game knowledge means: **no layer id, upgrade id, currency name or number appears in
`loader/tmt-planner.js`**. Engine API names (`updateTemp`, `doReset`, `getStartPlayer`, `fixSave`, `hasMilestone`, …) are
the TMT contract, not game knowledge; every one is reached through a `typeof` guard, so a fork that renames one fails by
name instead of guessing. Authored per-game DATA lives in files with provenance (`ladder/<game>.json`,
`games-auto/<id>.js`).

## Loading it

```
node tools/harness/run.mjs ptr --profile all --planner [--planner-ladder tools/harness/ladder/ptr.json]
                               [--planner-script drive.js] [--knowledge-out k.json] [--goals-out g.json]
```

`--planner` runs `loader/tmt-planner.js` after `tmt-auto.js`, in the same classic-script way. **The page never fetches
it** (P1a is harness-only) and loading it is inert: it adds no layer, no DOM and nothing to `player`, and a run that
loads it lands on the same tick and the same hash as one that does not (gate P1a-1 (e)).

- `--planner-ladder <file>` → `tmtLoader.plannerLadder`, the authored sticky goal source.
- `--planner-script <file>` → the file's source runs in the game's global scope, wrapped in a function, **before** the
  tick loop; its JSON return lands in the result's `plannerScript`. This is how a gate drives an excursion.
- `--knowledge-out` / `--goals-out` → the dumps below, written at the stop (after the ticks).

## Part 1 — snapshot / restore / excursion / measure

```js
const snap = tmtLoader.planner.snapshot();   // {player: <JSON>, runtime, extra, counters, profile}
tmtLoader.planner.restore(snap);             // the live player rebuilt THROUGH THE ENGINE
tmtLoader.planner.excursion(fn);             // snapshot → fn() → restore, returning fn's value
tmtLoader.planner.measure(actions, k, opts); // an excursion that acts, then ticks k game-seconds at diff 1
```

`restore()` takes **the path the engine's own `load()` / `importSave()` take after `JSON.parse`**:

```
player = Object.assign(getStartPlayer(), JSON.parse(snap.player));   // 2.2.1 utils.js:359-370 / :440-452
fixSave();                                                            // 2.7 utils/save.js:189-200 / :274-287
versionCheck();                                                       // part of the same path — see below
restoreRuntime(); ticks / gameSeconds / profile;
updateTemp() × P.settlePasses;
```

`setupTemp()` is never called (it is not idempotent). Three details are measured, not assumed:

1. **`versionCheck()` is part of the path.** Without it a restored save differs from the live one in the version fields
   alone: `fixData` rewrites an `undefined` default to `null`, and only `versionCheck` writes it back. One call, and the
   restored `player` is byte-identical.
2. **`extra`** — the module-level engine state an excursion can touch — is enumerated **generically**: every own scalar
   property of the global object, captured and written back. Measured over a reset-everything excursion on PTR, the
   globals that move are `id`, `item`, `layerResetting`, `lr`, `row`, `thing`, `x` — the engine's sloppy-mode `for…in`
   loop variables. No engine flag (`gameEnded`, `needCanvasUpdate`, `NaNalert`) moved. ⚠ A global declared with `let`
   (2.2.1's `allSaves`, `modInfo`) is **not** a `globalThis` property and no scan can see it; `allSaves` holds the live
   `player` by identity, so `restore()` re-points its slots explicitly.
3. **`P.settlePasses` = 3, matching the engine's own convention** (2.2.1 `load()` and `doReset` call `updateTemp` three
   times; 2.7's `load()` twice). ⚠ **`tmp` is not a pure function of `player`**: `getNextAt` reads `tmp[layer].nextAt`
   and `tmp[layer].baseAmount` (game.js:36-52), so it is self-referential and has more than one fixed point. Measured at
   the PTR frontier: `tmp.b.nextAt` is `2.33e276` in the uninterrupted run and `9.85e167` after a resume at a
   **byte-identical `player`**, and with one settle pass `tmp.b.canReset` read `true` in the walk and `false` in the
   very next excursion. Consequences: a tmp-derived number is a reading of one instant, the planner decides
   `canReset` on the copy rather than from a remembered head, and gate P1a-1 (b) measures that the extra passes leave
   the run's trajectory byte-identical.

`measure(actions, k)` applies each action through the engine's own entry point — `{kind: 'reset' | 'buyUpgrade' |
'buyBuyable' | 'buyMax' | 'startChallenge' | 'click', layer, id}` → `doReset` / `buyUpgrade` / `buyBuyable` /
`buyMaxBuyable` / `startChallenge` / `clickClickable`, never by editing `player` — then ticks `k` game-seconds at diff 1
with the simple system's current profile, and returns the copy's `hash` / `hashGame`, a player summary and per-tick
samples of `player.points` and every layer's points. Two identical calls return identical results.

## Part 2 — the knowledge walk (`tmtLoader.planner.knowledge()`)

One deterministic walk (layers by row, then `layers` key order; ids numeric) returning **goals**, **producers** and
**chains**. Cost on PTR: ~2–4 s per walk; on Something Tree ~0.7 s.

### Goals — everything the game currently OFFERS (held ones excluded)

| kind | id | dimension | threshold |
|---|---|---|---|
| `unlock:<l>` | a shown but locked layer | what `layers[l].baseAmount()` READS (Proxy-traced) | `tmp[l].requires` |
| `layer-next:<l>` | an unlocked layer's next reset | the same | `tmp[l].nextAt` |
| `upg:<l>:<id>` | unlocked, unowned | the item's currency, by the engine's own `canAffordPurchase` rule | `tmp` cost |
| `buy:<l>:<id>` | the next level | the same | `tmp` cost |
| `ms:<l>:<id>`, `ach:<l>:<id>` | not held | **probed** (below) | **probed** |
| `ch:<l>:<id>` | unlocked, below its completion limit | the challenge's currency | `tmp` goal |

A **dimension** is a path into `player` — `player.points`, `player.<layer>.<field>`, `player.<layer>.buyables.<id>`.
Thresholds, held values, measured rates and chain hops all speak this one key space.

- The **currency** follows `canAffordPurchase` exactly (`currencyInternalName` with `currencyLocation` /
  `currencyLayer` / neither, else the layer's own points). A `currencyLocation` is an *object*, not a path; its path is
  recovered by identity search inside `player`.
- ⚠ **`tmp` is not a safe reader for `unlocked`**: `updateTempData` skips every `unlocked` outside `upgrades` while
  that layer's tab is not open (2.2.1 temp.js:96), and `setupTemp` seeds an un-evaluated function as `Decimal(1)` —
  truthy forever. A locked buyable or challenge therefore reads UNLOCKED out of `tmp`. Every `unlocked` here is
  evaluated live from the declaration, with the same receiver the engine uses.
- **Hidden goals** are the ones the game does not offer yet (the layer is locked, or the item's `unlocked()` /
  `pseudoUnl()` / `pseudoCan()` is false). They are listed separately, each with the *fields* its gate reads and — by
  perturbation — the goals it NEEDS.

### Probing (omsi `AUTOMATION.md` §3.2, transplanted)

A milestone or achievement declares no cost, only `done()`. So:

1. **Trace**: run `done()` with `player` replaced by a recording Proxy (plain objects wrapped recursively, a Decimal or
   an array a leaf). That yields the fields it reads.
2. **Pass A**: raise each numeric field alone to `1e1000000`. The one that flips `done()` is the dimension; its
   threshold is then binary-searched on log10 and refined to an exact integer where it is small enough.
3. **Pass B**: if none flips it alone, raise all of them — a flip means a conjunction, no flip means it is not a numeric
   gate. Either way the goal is recorded `unprobeable` **with the fields it read**.
4. **Membership**: a gate that reads a HOLD array (`player.<l>.upgrades` / `.milestones` / `.achievements`, or the
   `challenges` map) is asking for a member. Which one is found by adding each declared id in turn and re-evaluating —
   the array analogue of the threshold probe. That is what turns "this upgrade is hidden" into "it needs that one",
   and it is where a chain like `upg:t:23 ← upg:t:13 ← upg:t:12` comes from.

Every perturbed value is saved and restored, and the whole walk runs inside one excursion; the dump carries
`stateNeutral`, the hash comparison of the live state before and after.

### Producers — what MOVES a dimension, measured

- **`wait`**: tick `k` game-seconds on the copy with the simple system's current profile, sampling every tick. Each
  moved path carries the net `rate`, plus `min` / `max` over the window. ⚠ A net rate alone lies here: a dimension a
  reset empties and regrows can return to exactly its starting value (measured on PTR at M09: `player.points`
  oscillates 10 → 0 → 5.5e9 → 10 across ten ticks, net 0). "Nothing moves this" therefore means **max === min**, not
  rate === 0.
- **`reset:<l>`**: `doReset(l)` on the copy, the full delta of every numeric leaf, the measured gain, and the regrowth
  rate over `k` further ticks (the seed of P1b's capacity probe). A reset the game will not allow right now is measured
  with its requirement **injected** (omsi's injected-resource measurement, §3.3): the base dimension is raised to
  `resetAt` — `tmp.nextAt` for a static layer, `tmp.requires` for a normal one, by the engine's own `canReset` rule —
  and the row carries `atRequirement: true`. ⚠ The requirement can MOVE with the injection (a static layer's `nextAt`
  is a function of the base dimension through `gainMult`), so the injection chases the fixed point up to four rounds
  and says so if it does not reach one.

### Chains

`goal → dimension → producer → (that producer's requirement → dimension → producer …)`, depth-limited, cycles cut. A
hidden goal's chain starts with its **gate** hops (`{gate, needs}`) and continues into the first requirement. Each hop
names its producers (the measured detail lives once in `producers.byDimension`) and, where it applies, one of:

- `impossible` — the producing layer is not shown; or `canReset` is false with the requirement above the base amount
  and the wait window never reached it; or nothing measured moved the dimension at all (a capped sub-resource).
- `pending` — `canReset` is false at this instant, but the requirement WAS reached inside the wait window.

`firstImpossible` is the first such hop: the wall, named.

## Part 3 — the two goal sources (`tmtLoader.planner.goals()`)

```js
{ sticky: [ {mark, predicate, resolved: [...], values: [...], unresolved: [...], chains: [...]} ],
  discovered: [ {id, kind, dimension, threshold, held, rate, distanceLog10, firstImpossible} ] }
```

- **`sticky`** = the ladder's marks (`ladder/<game>.json`) **not held right now**, in ladder order. Each mark's
  predicate is resolved to knowledge goal ids through the ENGINE's own predicate helpers (`hasUpgrade`,
  `hasMilestone`, `hasAchievement`, `hasChallenge`, `challengeCompletions`, `getBuyableAmount`, `player.<l>.unlocked`),
  a `player.<path>.gte(<expr>)` clause becomes a **value goal** (the threshold expression is evaluated in the game's own
  scope, never parsed), and a clause naming a native automation flag resolves to the milestone whose `toggles`
  declaration grants it. Clauses that resolve to nothing are kept verbatim as a predicate-only goal.
  ⚠ "Not held right now" is not "not yet reached": a ladder mark can stop holding (a row-2 reset wipes the row-1
  milestones, so PTR's M03 is unheld again at M09). The ladder is monotone in intent, not in state; remembering what
  was once reached is P1b's job.
- **`discovered`** = every offered goal ordered by the measured distance `threshold / (held + rate × 1 game-second)`,
  reported as its log10, ties broken by kind then id. A game with no ladder at all has an empty `sticky` and a
  `discovered` pool carrying everything (measured on the-omega-tree: 283 goals, no table, no ladder).

## Gates and goldens

`node tools/harness/gates-p1a.mjs --part 0|1|2|3` (see the file header). The knowledge and goals dumps for six states
are committed under `tools/harness/knowledge/<game>/` and re-produced twice per run; `--write-goldens` re-records them.
The states are committed snapshots: `snapshots/ptr/all/{M02,M05,M09}`, `snapshots/ptr/frontier/STALL.json` (the S1
frontier stall, written by `run.mjs --stop-snapshot`) and `snapshots/something/all/{S03,S04}`.

## What P1b adds

Candidate templates (reset now / wait k / buy set / enter challenge / respec), the capacity probe on top of the measured
post-reset regrowth, a rate-extrapolation screen with engine confirmation on the copy, scoring, the round loop between
ticks, and per-goal stall clocks. Nothing in P1a chooses anything.
