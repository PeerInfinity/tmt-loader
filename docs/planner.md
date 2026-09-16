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
- `--planner-k <n>` → the wait window the producers are measured over, in game-seconds (default **10**, for cost). ⚠ It
  is a knob, not a constant: see the window measurement under *Producers*. `knowledge({k, regrowthK})` splits it — `k` is
  the wait window, `regrowthK` the (cheap) window each reset's post-reset regrowth is measured over; omitting
  `regrowthK` keeps both at `k`, which is P1a's behaviour and what the committed goldens hold.

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
  rate === 0. ⚠ The rate is **window-dependent**. Measured at the PTR frontier on `player.b.points`: **0.300/s at
  k=10, 0.167 at k=30, 0.117 at k=60, 0.080 at k=150, 0.030 at k=300** (min 0, max 62 — a higher-row reset wipes it
  mid-window). A window shorter than the producing layer's reset cycle reads only its rising phase, so `k` belongs to
  the caller (`--planner-k`), and a chain that says "reachable" on a short window is saying something about that
  window. The gate prices it (`gates-p1a --part 2`).
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

## Part 4 — the ROUND: the planner configures the reflexes per EPOCH (P1b)

**The planner does not act per tick.** Per **epoch** it chooses the *configuration* of the simple system — which derived
features run, with which policy — by generate-and-test on the rolled-back copy, and commits the winner to the live game
for the epoch (tmt-automation-plan §11f). This is omsi's "plan the next loop's queue" with the loop replaced by an epoch
and the queue by a reflex configuration.

Why this shape: the reflexes are engine-generic and already right at the tick level — they read `tmp` at the moment of
acting, which is the only correct instant (Part 1). What they cannot do is choose *between* configurations or *wait*. And
because a configuration played on the copy for the epoch **is** the live outcome (same state, same deterministic engine),
the winner's measured trajectory is the prediction: any live-vs-copy inequality is a defect, not noise.

```
node tools/harness/run.mjs ptr --profile all --diff 1 --planner=auto      --planner-ladder tools/harness/ladder/ptr.json --planner-opt "k=300;screenK=4" --rounds-out rounds.json
```

`--planner=auto` commits; `--planner=suggest` plans and logs without committing (the page's Suggest mode, headless);
bare `--planner` is P1a's inert load. The harness calls `tmtLoader.planner.beforeTick()` between ticks — never inside
one, because a round plays candidates on a copy.

### The round, step by step (`tmtLoader.planner.round()`)

1. **Normalise the planning instant.** The round begins with `restore(snapshot())` on the live state. ⚠ This is not
   ceremony: `tmp` is not a pure function of `player` (Part 1), so the first candidate would otherwise be measured at the
   live tick's `tmp` and the second at a restored one — two different instants — and the winner's trajectory would not be
   the live game's. It is the one place the planner touches the live state, and it is byte-faithful in `player`.
2. **Targeting.** The active goal is the first `sticky` entry (ladder order) that is **not yet reached** and not
   abandoned. *Reached* is a MEMORY (`planner.reached`, part of `runtimeState` so it survives a snapshot and a resumed
   process): a mark that held once stays reached, because a ladder mark can stop holding (a row-2 reset wipes the row-1
   milestones — P1a 12a.2 item 8). When the sticky list is empty or every entry is blocked, the fallback is the best
   `discovered` goal (omsi's heuristic mode).
   The **target dimension** is the deepest hop of the goal's chain that is possible **within the epoch** (omsi's *setup
   leaf*): the goal's own dimension if a producer can move it, else the first hop down the chain whose producer can.
   ⚠ "Possible" is asked over the epoch, and so is the WALK that answers it (`knowledgeK` follows `k`): `canReset` is an instant
   (P1a 12a.5), so a reset whose requirement regrows in 40 game-seconds reads *impossible* to a 10-second window while
   the epoch being planned is 300 seconds long. A `canReset is false` hop counts as possible when the producing layer's
   measured cycle (`resetAt / regrowth`) fits inside `k`.
   ⚠ **Possible is not REACHABLE.** A dimension that moves every tick can still be 380 orders of magnitude short of what
   the hop above it needs (the PTR frontier: `player.points` against the e reset's 1.0004e600). `reachable()` prices the
   distance with the same measured model the screen uses — one epoch's projected log-gain against the log-distance left
   — and a target that needs more than `reachRounds` epochs is skipped like a blocked one, with the estimate in its
   reason. Without it the first ladder entry is pursued forever and every entry below it starves (omsi §4a's "a dead top
   goal shadows the goals below it"); with it the frontier's active goal is M15, boosters 49 of 100. A goal whose
   chain has no possible hop is **blocked**; the round moves to the next sticky entry (goal-LIST-scoped setup rounds) and
   the blocked one keeps its own clock. Where a mark resolves to several goals (a conjunction), the round works on the
   nearest open one — the smallest log10 shortfall, ties by chain order.
3. **Candidates** are templates over feature KINDS and POLICY families (`tmtLoader.policyTemplates`), never over layer
   names. The **incumbent** is always a candidate. Every other candidate differs from it in exactly ONE feature — a
   one-step neighbourhood, so each confirmation answers one question:

   | for every unlocked | the candidates |
   |---|---|
   | `reset:<l>` | the feature's policy switched to each registered alternative and to each template of the kind: `always`, **`gain>=N` with N derived from the target** (what the round still needs, where the reset's gain lands in the dimension being chased), `gain>=Nx` for each `gainX`, `unlocks-purchase`, `keepsUpgrades` where the table names a milestone; plus `off` — the **hold** candidate for that layer |
   | `upgrades:<l>` | `off` (save the currency); the table's `order` policies where it has an `order[]` |
   | `buyables:<l>` | `off`; `highest-first`; `buy-unless-saving`; `reserve>=<the target's threshold>` when the target dimension IS that feature's layer's points |
   | `toggles` / `challenges` / `clickables` | as they are — the planner decides nothing there in P1b |

   The set is cut to `maxCandidates` **round-robin over the features** — every unlocked feature contributes its
   best-ranked candidate before any feature contributes a second (the incumbent always survives). A flat cut by the
   screen's ranking drops whole layers whenever the screen cannot discriminate, which is exactly when the target is
   frozen and the candidate that could unfreeze it is the one being dropped.
   ⚖ **USER RULING (2026-09-15, plan §13d): no arbitrary waiting.** *"A reset whose purpose is N of its resource fires
   the moment the gain reaches N; do not wait some arbitrary amount of time."* So the templates are target-driven —
   `gain>=N`, `gain>=Nx`, `unlocks-purchase`, `reserve>=N` — and **no `interval>=T` candidate is generated**: the
   `intervals` option is empty by default and exists so a sweep can put the ruling itself under measurement. An
   incumbent that carries an interval (both shipped tables do) stays as the control row, and a sweep that leaves an
   interval as a default owes the record a sentence about what it is a proxy for (A1's `reset:p interval>=10` stood in
   for "let points reach the 200 the b/g pair needs"). The `off` candidate is not a clock either: it holds a reset for
   the epoch the round is deciding, which is the decision's own horizon.

4. **The screen** (the cheap model, omsi §3.6) projects the target's **peak** after the epoch. The model is a sawtooth:
   the dimension climbs at the measured wait rate and is emptied by whichever enabled reset consumes it most often, so
   the peak is one period's climb — the whole window when nothing consumes it — plus the measured gain of any reset that
   *produces* the target. A reset's expected count is bounded twice: by the policy's own cadence **and** by the game's —
   a reset waits for `canReset`, so it cannot fire faster than its requirement regrows (the measured cycle
   `resetAt / regrowth`). ⚠ Without that second bound every candidate projects the same number, because a locked row-2
   layer with a 1e120 requirement prices as if it reset every interval (measured at M02 before the bound was there).
   The top `screenK` go to confirmation, and the screen's ranking against the confirmed one is logged every round (omsi's
   divergence log): a screen that never disagrees with the engine is not measuring anything, and one that always
   disagrees is wasting the budget.
5. **Confirmation** — the engine is ground truth. Each screened candidate is `measure`d on the copy for `k`
   game-seconds with its configuration applied, sampling the target every tick. Per candidate: the target's **max** over
   the window and its end value (never a net rate — P1a 12a.5), the tick the active goal was reached at (if it was), the
   ladder marks held at the end, the **capacity** term (the peak of the window's last quarter against the first
   quarter's — omsi's `probeCapacity` transplanted: what the epoch buys for the NEXT epoch), the number of discovered
   goals that got closer (the frontier term), and the copy's `hashGame`.
6. **Score** = `wReach`·(goal reached, earlier is worth more) + `wProgress`·(log-progress of the target's max toward its
   threshold) + `wGoal`·(the same for the GOAL's own dimension, when the round is spent on a setup leaf below it) +
   `wCapacity`·capacity + `wFrontier`·(goals closer). ⚠ The goal term is not a refinement: without it a candidate that
   grows the leaf by starving the goal wins every epoch — `off:reset:b` maximises `player.points` precisely because a b
   reset SPENDS points, and `b.best` is what the mark asks for. It is flat for every candidate when the goal's dimension
   genuinely cannot move, which is exactly when the setup leaf is the right thing to optimise. A candidate that reaches the active goal inside the
   window wins outright, earliest tick first; ties break on the stable candidate order.
7. **Commit.** The winner's configuration is applied to the live simple system (`setPolicy` + the runtime enable
   override — never `player.au.features`: a planner decision is not the player's saved toggle) and the epoch's expected
   end state is recorded. The live game then ticks the epoch under the reflexes, and `beforeTick()` re-plans at the
   epoch's end or **earlier on an event**: the active goal is reached, the set of unlocked layers changes, or the live
   `hashGame` at the epoch's end differs from the copy's — which cannot happen by construction, so it is recorded in
   `divergences` as a defect rather than papered over.

### The stall clocks (omsi §4a, both kinds)

- For an **active** goal the clock runs on the target dimension: a round whose target did not rise accrues, a rising one
  resets, and `goalStallK` accrued rounds abandon the goal. Abandonment is list hygiene — the entry stays in the list
  marked `abandoned` with the round number — and the next entry becomes active.
- For a **blocked** goal the clock runs on the blocked hop's dimension and stays **frozen until that dimension first
  moves** during the goal's tenure. On a wall like the PTR frontier's 1e600 points requirement a flat-window accrual
  would abandon every entry on the first pass.
- **Anti-fixation**: when the same winner is committed `fixK` rounds in a row with no rise in the target, the next round
  must confirm at least one candidate that differs in a RESET policy (omsi's `updateStagnation` escalation).

### Options (every constant is a knob)

`--planner-opt "k=300;screenK=4;wCapacity=10"`. ⚖ Zero hand-scripted game knowledge means no weight may be a bare
literal in a decision either.

⚠ **Provenance, honestly.** The defaults below are the ones P1b-1's battery was measured WITH; only the rows that name
a sweep have one behind them. The rest are hand-chosen starting points, and the sweep that fixes them is gate P1b-2
(`gates-p1b.mjs --part 2s`, `sweep.mjs --vary "planner:<option>=…"`). A default with no sweep row is a knob, not a result.

| option | default | what it is | provenance of the default |
|---|---|---|---|
| `k` | 300 | the epoch horizon in game-seconds: how long each candidate is measured and the winner then runs | hand-chosen (≥ the measured b/g reset cycle at the opening); P1b-2 sweeps 60 / 300 / 900 |
| `screenK` | 4 | screened candidates that reach engine confirmation | hand-chosen (omsi's is 8, at a much cheaper confirmation); P1b-2 sweeps 2 / 4 / 8 |
| `maxCandidates` | 24 | the generated set, cut round-robin over the features | hand-chosen: one candidate per unlocked feature at the opening states |
| `goalStallK` | 6 | rounds without a rise before the active goal is abandoned | hand-chosen; P1b-2 sweeps 3 / 6 / 12 |
| `fixK` | 3 | identical winners in a row with no rise before the escalation arms | hand-chosen |
| `wReach` / `wProgress` / `wGoal` / `wCapacity` / `wFrontier` | 1000 / 100 / 200 / 10 / 1 | the score's weights | hand-chosen so that reaching the goal dominates and the goal's own dimension outranks its setup leaf; P1b-2 sweeps `wCapacity` |
| `knowledgeK` | 0 = the epoch | the knowledge walk's WAIT window, in game-seconds — "what moves this, and how far, over the epoch I am about to commit". ⚠ P1a's own default is 10 s, chosen for the cost of a dump, and it is the wrong question for a planner: measured at the S1 stall, `player.e.points` (what M11 asks for) does not move at 10 / 30 / 100 s and moves at 300 s, and `player.points` reaches 2.56e609 inside 300 s — above the e reset's 1.0004e600 requirement, which is what turns that hop from `impossible` into `pending` | measured, P1b-2 control (i) |
| `regrowthK` | 10 | the window each reset's post-reset regrowth is measured over — a rate, not a reach, so it stays cheap | P1a-2 |
| `depth` | 6 | chain depth | P1a |
| `gainX` | `2,4` | the `gain>=Nx` candidates | S1's measured reset policies |
| `intervals` | *(empty)* | `interval>=T` seeds — none by default | ⚖ the no-arbitrary-waiting ruling |
| `minRise` | 1e-9 | the log10 rise that counts as a rise for the clocks | — |
| `reachRounds` | 100 | epochs at the measured rate beyond which a goal's target counts as out of reach and the goal yields | hand-chosen: two orders of magnitude of slack over the ~4 epochs M15 needs at the frontier |
| `maxRounds` | 0 | 0 = unbounded; a bound for a probe | — |

### Reading a round log (`--rounds-out`, `planner.rounds[]`)

The file is `planner.report()`: the mode, the options, the reached / abandoned marks, the clocks, the divergences, and
`log[]` — one record per round, which is exactly what P2's tab will display:

```
{ round, ticks, gameSeconds, mode, reason,          // reason: first-round | epoch-end | goal-reached | unlock-changed | divergence
  goal:   {source: 'sticky'|'discovered', id, name, predicate, chain: [{goal, firstImpossible}]},
  skipped: [{mark, dimension, why}],                 // the blocked entries this round walked past
  target: {dimension, threshold, held, hop, goal, chainIndex},
  clock:  {dimension, stall, armed, rose, rounds, best},
  candidates: [ {id, kind, feature, policy, delta: [{feature, policy|enabled, was}],
                 screen: {projected, log10, rank, rate, period, consumer, producers},
                 confirm: {max, maxLog10, end, capacity, reachedAt, marksHeld, frontierCloser, hashGame},
                 score:  {total, terms: {reach, progress, capacity, frontier}}} ],
  screenDivergence: {screened, screenBest, confirmedBest, agree, displacement},
  winner: {id, delta, score, confirm}, epoch: {ticks, endsAtTick, expected, committed},
  cost:   {knowledgeMs, screenMs, confirmMs, measuredGameSeconds, wallMs} }
```

Read it in this order: **`target`** (what the round was trying to grow, and why — the chain's first possible hop),
**`winner.delta`** (what it changed about the simple system; an empty delta means "keep going"), **`candidates[].confirm.max`**
(what the engine said each one would reach), and **`screenDivergence.agree`** (whether the cheap model would have picked
the same one). `cost` is the only block a clock wrote, and no decision reads it — the determinism gate strips it before
comparing two runs' logs.

### What P1b does NOT decide

Challenge entry, clickables and respec stay with the simple system's reflexes (and its table). Purchases are configured
(on / off / policy) but never chosen item by item. The planner also never edits `player` — every action it takes goes
through `setPolicy` / the enable override, and every action the *game* takes goes through the engine's own entry points.
