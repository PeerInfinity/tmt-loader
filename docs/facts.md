# Game facts (`games-facts/`, facts-1) — what the game IS, read off the engine

A **fact** says what a game *is*, not what to do in it: what an item costs and what that cost reads, which resets zero
which fields, what moves a field over time, what a getter depends on, what a challenge changes, how many purchases a
challenge allows. Strategy templates (later) read facts and derive queues from them; nothing here decides anything.

⚖ The rulings this rests on (tmt PTR-strategy design notes §5, §11; automation plan §40-R ruling B):
- **Facts are DATA, per game, in files.** GENERATED facts (this page) and AUTHORED facts (engine traps, guide
  schedules, each with a digest citation) live in SEPARATE homes. Only the generated side exists so far.
- **No game id, layer id or item id in tool or loader code.** Every probe below is generic; engine API names
  (`doReset`, `startChallenge`, `getPointGen`, the declaration keys `cost` / `goal` / `effect`) are the TMT contract.
  Gate X1 greps for it.
- **The live game is never touched.** Every probe runs inside the planner's excursion (snapshot → act → restore) or puts
  back the very object it perturbed; every kind's excursions report `neutral`, every state `stateNeutral`, and gate N1
  compares the live hash after a whole extraction with a run that extracts nothing.

## Where it lives, and why there

```
games-facts/<id>.json      one per extracted game (format tmt-facts/1), GENERATED — never edited by hand
games-facts/index.json     the games that have one
tools/harness/facts.mjs    the generator (boots each state, merges, writes / checks)
tools/harness/facts-read.js  the planner-script each boot runs: tmtLoader.planner.extractFacts()
loader/tmt-planner.js      the probes themselves (`planner.facts`, `planner.extractFacts`) — harness-only, never fetched by the page
```

Beside `games-data/` (C1's generated currency data), not inside it: the two are different generated data with
different generators, formats and regeneration costs (C1 boots every game; facts boot every committed snapshot of a
few games), and keeping each directory one generator's output keeps `--check-index` and `--check` simple. The probes
live in the planner because they ARE planner instruments (rollback, `traceReads`, the threshold probe) and a template's
`check` will want them at runtime. The page does not fetch facts yet.

## Running it

```
node tools/harness/facts.mjs <game> [--jobs N]                     write games-facts/<game>.json (+ the index)
node tools/harness/facts.mjs <game> --from fresh --from <snapshot>… --out <dir>   chosen states only, to a scratch dir
node tools/harness/facts.mjs <game> --kinds price,zeroed-by --out <dir>          some kinds only, to a scratch dir
node tools/harness/facts.mjs --check [--jobs N]                    regenerate every indexed game in memory; exit 1 if any file is stale
node tools/harness/facts.mjs --check-index                         no boot: the index names exactly the files on disk
```

- **States.** The fresh boot, then every committed `tools/harness/snapshots/<id>/all/*.json` in MARK order. A partial
  extraction (`--from`, `--kinds`) must go to `--out`: `games-facts/` holds only full ones.
- **Every flag is declared**; an unknown one exits 2.
- **Neutral or nothing.** A state whose extraction moved the live hash, or a kind whose excursions did, is a hard
  error and nothing is written (`NOT NEUTRAL — <state>: …`).
- **Randomness.** Every boot is seeded (`--random-seed 1`); a state that drew any randomness is re-read under seeds 2
  and 3 and every fact they disagree on abstains (`the game draws randomness …`), C1's rule.
- **Cost** (this box, 8 jobs): ptr 28 states ≈ 3.5 min wall (≈ 15 CPU-min: the in-challenge sensitivity probe is most
  of it), something 6 states 4 s, collection-of-everything 1.5 s.
- **CI**: the `facts-1` job runs `--check-index` and `--check` (freshness), then the gate battery below.

## The file (`tmt-facts/1`)

```json
{ "generated": true, "generator": "tools/harness/facts.mjs", "generatorVersion": 1, "format": "tmt-facts/1",
  "game": "ptr", "base": null, "engine": "2.2.1", "upstream": {"repo": "…", "commit": "…"},
  "states": ["fresh", "all/M01", …, "all/M27"], "seeds": [1],
  "summary": {"price": {"facts": 77, "abstained": 0, "variants": 9}, …},
  "thrown": [],
  "facts": [ {"id": "price:q:upgrade:23", "kind": "price", …, "from": {"how": "traceReads + probe:exponent",
              "state": "all/M26", "seen": [["all/M26", "all/M27"]], "loader": "facts.mjs v1"}}, … ] }
```

- **`from`** — the provenance record: `how` (the instrument), `state` (the EARLIEST state the fact was seen in),
  `seen` (every state, as runs `[first, last]` over `states`), `loader` (the generator's version), and `probeState`
  where a reading needed a probe-only state (a challenge entered on the copy, a requirement injected, a field seeded) —
  every such label any state needed, joined with ` | `.
  ⚠ `loader` is the generator VERSION, not a commit: a commit in a regenerable, `--check`ed file goes stale on every
  commit (and S1T's rule is that no gate reads git).
- **Merging states.** A fact with ONE value in every state it was read in is written once. A fact whose value DIFFERS
  between states (a production coefficient as the multiplier grows; a getter whose branch changed) is written with
  every value as a `variant`, each with its own `seen` — never one silently overwriting another.
- **Readings are not facts.** A price's current value, a gain's current value, a field's value at the state are
  readings of one instant and are not written; shapes, read sets and effects are.
- **`base`** is `null`: a derived fork's file will later name its base and override by `id`. Not built.

## The kinds

Each kind: the probe, what it reads from the engine, and how it ABSTAINS. An abstention is a fact entry with
`abstain: "<why>"` and no value — never a guess.

### `price` — what an item costs, what the price reads, and its shape in each read
For every upgrade, buyable and challenge GOAL that is unlocked at the state (layer unlocked, the item's `unlocked`
evaluated LIVE — `tmp` is not a safe reader for it), owned or not:
- **currency**: an upgrade's by the engine's `canAffordPurchase` rule; a challenge's by `canCompleteChallenge`'s
  (nothing declared = `player.points`, not the layer's points); a buyable's from C1's scored data, else `null` with why.
- **reads**: `traceReads(cost | goal)` over `player`, and `tmpReads` over `tmp` (the trace now optionally wraps `tmp`).
- **shapes**: the **EXPONENT PROBE** on each numeric read — on the copy, set the field to each value of a fixed grid
  (`0, 1, 2, 5, 10, 20, 50, 100, 1e3 … 1e6`), read the price, put the SAME object back, and fit:
  `power` (`coef·(v + offset)^exponent`; the offset is solved from the reading at 0), `exponential` (`log10Base` per
  unit), `superexponential` (log10 of the price a power law in v), `flat` (read but not moved by it), `irregular`
  (none fits; the local log-log slopes are kept as the evidence — a cost scaling that kicks in at 25 lands here), or
  `unscored` (fewer than four finite readings). A floored price that fits within 1 is `rounded: true`. A multi-currency
  price (an object of numbers) gets a shape per PART. A constant price is `constant: true`.
- Abstains: the price function throws; its value is neither a number nor an object of numbers.

### `zeroed-by` — one fact per (reset, field)
For every layer SHOWN at the state with a reset type: `doReset(l)` on the copy — at the injected requirement when it
cannot reset (P1a's injection, now `injectRequirement`, shared), forced only when injection fails (labelled) — under a
**write tracer**: a write-through Proxy over `player` that records every assignment with the innermost layer `doReset`
running (every layer's `doReset` is wrapped for the call and unwrapped after).
- **effect** `zeroes` | `lowers` (from the values before and after), **via** = the doResets that wrote the field its
  final value. ptr's `q.time` under a `ss` reset: via `h, q, o` — `ss` has no line that touches it; `rowReset` runs
  h's, q's and o's doResets, each of which writes it.
- ⚠ **A committed snapshot is taken right after a reset**, so most fields are already 0 there and a value diff sees
  nothing (3 fields at ptr `all/M27`). A field the reset WROTE but that ended where it started is ambiguous, so a second
  pass SEEDS exactly those fields to x·10+1 on a fresh copy and resets again (`probeState: … field seeded`).
- ⚠ **An engine may mutate a number IN PLACE**: ptr's `layOver` copies a fresh Decimal's fields into the live one
  (`utils.js:989-994`). So number objects are wrapped too (a write to one is recorded against the number's path), and
  every reading is a COPY, never the live object. Without it every layer's `points` was invisible to the probe.
- ⚠ P1a's `leafMap` masks `time` at EVERY depth, so its reset deltas never showed `q.time`. The facts' leaf map masks
  the state mask at depth 1 only (`player.time`, `player.offTime` are wall clocks; a layer's `time` is game state).
- Abstains: `doReset` throws.

### `production` — what moves a field over time, and its shape in each clock
With the automation OFF (what the game does on its own), after normalising the instant: tick 10 game-seconds at diff 1
and find what moved and which fields are CLOCKS (+diff every tick). A clock DRIVES something when perturbing it
(×10+1000) changes some moved field's one-tick increment. For each driver, the exponent probe on the increment: set the
clock to each grid value, tick once, fit every moved field's increment. Facts: `production:<field>:<clock>` with the
`rate` shape and, for a power, the `integrated` exponent (+1); and `production:<field>` (what moves at all, whether it is
a clock, which drivers it has).
- ⚠ **Normalise first.** `tmp` is not a pure function of `player`, and every excursion restores through the engine:
  a baseline read before the first restore is a different instant (measured — every clock read as a driver).
- ⚠ **A tick is never traced**: a tick run under `traceReads`' Proxy lost a whole layer object from ptr's `player`.

### `multiplier-reads` — what every numeric getter reads
Found GENERICALLY: every zero-argument function a layer object declares (action hooks skipped by their contract names;
anything else that writes `player` is caught by a purity check and restored), plus each item's `effect` /
`rewardEffect`. Kept when it returns a number. `reads` (player), `tmpReads`, `members` (each declared id of every
upgrades / milestones / achievements array it read, toggled on the copy: the ones that move its value), and `widened`
(a boolean read that is false — a layer's `unlocked` — flipped and re-traced; and the reads a member toggle reveals).
ptr's `enGainMult`: q11 and q21's effects, Solarity buyable 12's (widened by `player.o.unlocked=true`), `tmp.ba.negBuff`
(widened by `player.ba.unlocked=true`).

### `challenge-inputs` — the IN-CHALLENGE SENSITIVITY probe
For every challenge open at the state (layer unlocked, `unlocked` LIVE, completions below the limit — a locked
challenge is NEVER entered): enter it on the copy through `startChallenge` and check the engine says so (`entered`);
read the goal currency's gain (`player.points` → `getPointGen()`; a layer's points → `tmp.<l>.resetGain`; anything else
→ one tick's increment on a copy, never traced); perturb each candidate — every unlocked layer's points and buyable
amounts (×10+1), every member of a hold array the gain function reads (toggled), any other numeric read — each in its
OWN excursion with three `updateTemp`s, against a baseline read the same way. `moves` (inside), `movesOutside` (the same
probe without entering; once per currency per state), `nerfed` = outside − inside, `threw` (a candidate whose
perturbation threw, by name). `probeState: the challenge entered on the copy through startChallenge`.
- ⚠ A first cut undid each perturbation in place and drifted (tmp path dependence): ptr's Extra Time Capsules read as
  moving H22's point gain. Three clean passes show they do not; gate O6 pins that.
- Abstains: the engine did not enter; the gain reader throws.

### `purchase-budget` — a counter a purchase raises by one, and its limit
Outside any challenge and inside each open one (entered on the copy): for each unlocked buyable / unowned upgrade with
a `canAfford`, trace it; make it affordable; buy it through the engine; a numeric read that ROSE BY EXACTLY ONE is a
counter candidate; its limit is the threshold probe's (P1a's Pass A) on `!canAfford()` with the counter alone moving —
probed twice, with everything else lifted to 1e300 and then 1e600. A BUDGET's limit does not move; a RESOURCE's does
(ptr's Space buildings raise `player.s.spent` by one, and that "limit" was wherever the lifted space ran out, 3e329), so
only an exact limit equal in both probes is a fact. Items sharing a counter are one fact.

## The gates (`tools/harness/gates-facts1.mjs`, CI job `facts-1`)

| part | what it holds |
|---|---|
| `oracle` | ptr's §7 rows against the file, each value from the design notes and the game SOURCE (cited per row), never from a probe; state readings from a separate `--eval` boot of every state. q11–q24 prices (exponent, offset 1, coefficient, currency) · q31–q33 and H31's goal ABSTAIN (locked in every state — measured) · `q.time` / `q.energy` zeroed by exactly the shown resets of row ≥ 3, writers h, q, o · quirk energy's increment `(q.time·M)^E`, E = Quirk Layers + free − 1, M = `enGainMult` per state · `enGainMult` / q11 / q21 read sets = the source · H22: inside, only Space buildings 11 and 15 among buyables, achievements 21/31 and prestige upgrades; b and h nerfed · H31's budget ABSTAINS (locked) |
| `vacuity` | facts per kind per game; a kind with ZERO facts is RED unless declared, and each declaration is measured (ptr budget: H31 locked in every state; something: no challenge unlocked in any state; collection-of-everything budget: its layer sources increment nothing); nothing threw |
| `neutral` | the live hash after the whole extraction = a run extracting nothing, and every kind neutral: ptr fresh / all/M25 / all/M27, something all/S05, collection-of-everything fresh |
| `determinism` | two regenerations byte-identical to each other and to the committed file |
| `grep` | no game id and no ptr layer id in the extractor (string literals; `layers` / `player` / `tmp` member access outside comments) |

`tools/harness/mutants-facts1.sh <out>`: A the exponent probe returns a constant (O1 q23 red) · B zeroed-by ignores
rowReset's cascade (O3 red) · C the sensitivity probe never enters but claims it did (O6 red) · D the exponent probe
leaks its perturbation (N1 red) · E a game id in the tool (X1 red). Unit tests: `loader/facts.test.mjs` (the fitter's
classes on known formulas; the probe returns the same object it perturbed).

## What is NOT extracted

- **Authored facts**: engine-family traps (entering H22 after `respec()` zeroes buildings while `spent` stays; a
  `buyMax` with a closed tab reads stale `tmp`), H31's native automation being off inside, the guides' schedules and
  recipes. They will live in their own file with digest citations (§40-R ruling B).
- **Unlock prerequisites** as facts of their own (the planner's hidden-goal gate probe already measures them).
- **Anything not reachable from a committed snapshot.** ptr's q31–q33, H31 and its budget, Super Generators' later
  items: no committed state unlocks them, so they abstain by name. A fact needs a state; a state is never faked.
- **Games beyond the three committed** (ptr, something, collection-of-everything). The tool runs on any roster game;
  adding one is `facts.mjs <id>` and a vacuity declaration for any kind it has none of.
