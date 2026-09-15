# Automation tools (`loader/tmt-auto.js`)

The loader can play parts of a game for you: resets, upgrade and buyable purchases, the game's own milestone toggles,
challenges, clickables. **Every feature is off by default.** Nothing in a game changes: no formula is edited, and a
feature only calls the engine's own functions (`doReset`, `buyUpgrade`, `buyBuyable` / `buyMaxBuyable`,
`startChallenge`, `clickClickable`, or the field write a toggle button makes) at the point in the tick where the engine
calls each layer's `automate()`.

Since S1 the features are **derived from what each layer declares** — every Modding Tree game gets them with no per-game
code — and a per-game **data table** (`games-auto/<id>.js`) holds only what the game's authors did not declare: orders,
measured policy constants, exclusions with a reason, gates.

## Enabling

Automation is **opt-in**: add `automation=1` to the URL. Without it the loader is the game plus the hook contract
(`docs/contract.md`) — no `au` layer, no toggles, nothing written to the save, `games-auto/<id>.js` never fetched — and
`?profile=` / `?autoOpt=` are ignored with a console warning.

```
index.html?mod=<id>&automation=1                 # the au tab, toggles as saved
index.html?mod=<id>&automation=1&profile=all     # everything at once
```

The harness is the other way round: `run.mjs`, `page.mjs` runs, `parity.mjs`, `gates*.mjs` default to automation ON and
take `--no-automation` for the plain page; `page.mjs --gate load` checks the PLAIN page unless given `--automation`.
A save made with automation keeps its `player.au`; opened without the flag the engine carries that key along untouched
and nothing reads it.

## The `au` side layer

With `?automation=1`, `tmt-auto.js` adds a side layer **`au` ("Automation Tools", symbol AU)** to every game, shown next
to the game's other side nodes (selector `#app .smallNode.au` on both engines). Its tab has:

- one toggle per registered feature: **On / Off / Locked** (Locked while the feature's `unlocked()` is false), with the
  feature's policy under it;
- a master toggle, *All features*: turns every unlocked feature on, or (when all are on) all off;
- a profile readout: the active profile and how many features are running;
- after the first click on any toggle, the line *"Automation tools are a loader addition (tmt-loader); every toggle is
  off by default."*

The toggles live in `player.au.features` (`{featureId: true|false}`), `player.au.disclosed` records the first click.
`au` is a side layer with no `doReset`, and neither engine resets such a layer (2.2.1 `rowReset("side")` skips
`layerDataReset`; 2.7 guards with `!isNaN(row)`), so the toggles survive every reset and are saved with the game.
`player.au` also carries the engine's own layer fields (`points`, `clickables`, …; 2.7 needs `points` because its
`gameLoop` updates `best` for every side layer). **`player.au.clickables` has one key per toggle button**, so the full
state hash moves with the NUMBER of registered features; compare game state across tables with `au` excluded (the
harness's `hashGame`).

## Profiles

| Profile | What runs | Selected by |
|---|---|---|
| `off` | nothing — `player.au.features` is ignored | default under `?managed=1`, in the Node harness, and the only profile without `?automation=1` |
| `all` | every registered feature whose `unlocked()` holds, with its default policy | `?profile=all`, `--profile all` |
| `saved` | the features toggled on in `player.au.features` (and unlocked) | default for a normal page load with `?automation=1` |

A profile is applied after `load()` and is never written into the save: reload without `?profile=` and the toggles
show what the save says. `tmtLoader.profile(name)` switches at runtime.

## Derivation

After the game's scripts (and the table), `tmt-auto.js` walks `layers`. For every **tree layer** — a numeric `row`, not a
layer the loader added — it registers, in **layer order** (row ascending, then the order of the `layers` keys) × **kind
order**:

| Kind | Feature id | Registered when the layer declares | Default policy (no table entry) | `unlocked()` |
|---|---|---|---|---|
| `toggles` | `toggles:<l>` | a milestone with `toggles: [[layer, field], …]` | `on` | `player[l].unlocked` |
| `upgrades` | `upgrades:<l>` | numeric ids in `upgrades` | `cheapest-first`; `order-then-cheapest` when the table gives `order` | `player[l].unlocked` |
| `buyables` | `buyables:<l>` | numeric ids in `buyables` | `buy` | `player[l].unlocked` |
| `challenges` | `challenges:<l>` | numeric ids in `challenges` | `off`; `sequential` when the table gives `order` | `player[l].unlocked` |
| `clickables` | `clickables:<l>` | numeric ids in `clickables` | `off`; `when` when the table lists the layer's clickables | `player[l].unlocked` |
| `reset` | `reset:<l>` | a prestige: `type` `normal`, `static` or `custom` | `always` for a static layer; `gain>=2x` for normal / custom | `layerShown !== false` evaluated live (the node is visible) — not `tmp[l].layerShown`, which `updateTemp` computes before `gameLoop` and so lags a layer the game unlocks inside `gameLoop` by one tick |

The generic **kind order** is `toggles → upgrades → buyables → challenges → clickables → reset` (one-off purchases before
repeatable ones; the reset last, so a tick's purchases spend the pre-reset balance). A table may give its own
`kindOrder` (both shipped tables do: every A1/A2 number was measured with the reset first). Features of one layer run in
that order inside the layer's `automate()`.

Why those defaults: a static layer's gain is one per reset and its reset waits on its requirement, so `always` is the
measured rule there (A2-3: the all-`always` control reached the default's state at 8035 game-s; A1's b/g ran `gain>=1`,
the same thing for a static layer). `gain>=2x` for normal layers is **unmeasured as a default** in the derivation's
code; S1 part 2's sweeps are its basis (`tools/harness/results/SUMMARY.md`, the S1-2 rows).

Upgrades with a `pseudoUnl` (Prestige Tree's pseudo-upgrades) are never bought. Milestone toggles in the 2.2.1 `'multi'`
form (`{layer, varName, options}`, a string it cycles) are skipped and counted (`tmtLoader.autoDerivation.multiTogglesSkipped`).

## Kinds and policies

| Kind | Policy | What it does each tick |
|---|---|---|
| `reset` | `always` | `doReset(l)` whenever `tmp[l].canReset` |
| | `gain>=N` | … when `tmp[l].resetGain ≥ N` |
| | `gain>=Nx` | … when `tmp[l].resetGain ≥ N × player[l].points` (dimensionless: "the reset at least doubles/quadruples what I hold") |
| | `interval>=T` | … when at least T of `player.timePlayed` passed since this feature's last reset (runtime memory, not saved) |
| | `keepsUpgrades` | … only while `hasMilestone(keep.layer, keep.id)` holds (a post-milestone policy: it never starts the layer) |
| | `unlocks-purchase` | … only when `player[l].points + tmp[l].resetGain` affords the cheapest unowned, unlocked upgrade of `l`, or the next level of one of its unlocked buyables — both only where costed in the layer's own points (no `currencyInternalName` / `currencyLocation` / `currencyLayer`); else wait |
| `upgrades` | `cheapest-first` | buys unlocked, unowned, affordable upgrades, cheapest `tmp` cost first (ties by id) |
| | `order` | only the table's `order[]`, in that order |
| | `order-then-cheapest` | the table's `order[]` first (each affordable one, in order), then `cheapest-first` over the upgrades not in it |
| `buyables` | `buy` | each unlocked buyable (id order, or `order[]`): `buyBuyable` until the amount stops moving — what a click does, paying the cost |
| | `buyMax` | the engine's `buyMaxBuyable` where the buyable defines `buyMax`, else as `buy` |
| | `highest-first` | as `buy`, over the ids descending (PTR's own Space Building autobuyer order), unless `order[]` is given |
| | `buy-unless-saving` | as `buy`, but nothing while the layer has an unlocked, unowned upgrade costed in its own points that costs more than the points held |
| `toggles` | `on` | for each held milestone (`hasMilestone(l, id)`) that declares `toggles`, sets every `player[layer][field]` that is `false` to `true` — what the game's toggle button does. The milestone only UNLOCKS the button; the field stays false until clicked |
| `challenges` | `sequential` | the first challenge in `order[]` (else id order) that is unlocked with completions below `completionLimit` (default 1): enter it with `startChallenge` when none of the layer's challenges is active; while it is active, exit-and-complete with `startChallenge` once `canCompleteChallenge` holds (and `canExitChallenge` where the engine has it). A challenge the player entered by hand is left alone. Enters / exits are counted in `hookStats().challenges` |
| | `off` | nothing |
| `clickables` | `when` | for each `{id, when}` the table lists for the layer: `clickClickable(l, id)` when the clickable is unlocked, `canClick`, and `when` holds |
| | `off` | nothing |

**`buy` vs `buyMax`.** TMT 2.2.1 calls `buyMaxBuyable` only from autobuyers — no component calls it — and Prestige
Tree's `buyMax()` bodies raise the amount to the affordable target **without subtracting the cost** (they are the
game's own milestone-gated autobuyers, `e.auto` / `s.autoBld`). A feature that stands in for clicks uses `buy`.

**Yield to native.** A `reset` feature does nothing while `tmp[l].autoPrestige` is truthy: the game's own auto-reset
predicate holds (typically its toggle is on), and `gameLoop` resets the layer itself.

A feature with a table **gate** does nothing while the gate's predicate is false; a reset feature named in
`unlockOrder` does nothing until the siblings before it are unlocked.

## Where features run

Each registered feature's layer gets its `automate()` wrapped: the game's original `automate` runs first, then the
layer's active features in kind order. `automate` is the per-layer function both engines call once per `gameLoop` and
never from `updateTemp` (`autoPrestige` is not a hook: it is a predicate both engines evaluate inside `updateTemp`).
TMT 2.2.1's `gameLoop` skips `automate` for a layer the player has not unlocked; for those, the `au` layer's own
`automate` — called after every tree layer — runs the features of each hooked layer whose slot did not run. Every hooked
layer's features run exactly once per tick (`tmtLoader.hookStats()` counts it; gate A1-1).

## The data table (`games-auto/<id>.js`)

A classic script named by the manifest's `auto` field, inserted **before** `tmt-auto.js` (page and harness), which reads
it when it derives the features. It only assigns data:

```js
tmtLoader.autoTable = {
  id: 'ptr',                                               // must equal the game id
  unlockOrder: [['g', 'b'], ['s', 't', 'e']],              // sibling lists: the i-th member's reset waits for those before it
  kindOrder: ['toggles', 'reset', 'upgrades', 'buyables', 'challenges', 'clickables'],
  policies: { 'reset:p': 'interval>=10' },                 // a feature's default policy
  alternatives: { 'reset:p': ['always', 'gain>=1'] },      // listed next to the default (featureState / the au tab)
  order: { 'upgrades:e': [11], 'challenges:h': [11, 12] }, // upgrades order / order-then-cheapest, buyables order, challenge sequence
  gates: { 'reset:q': "hasMilestone('h', 2)" },            // the feature does nothing while the predicate is false
  off: { 'buyables:t': 'Extra Time Capsules cost Boosters' }, // NOT registered; the reason is required (tmtLoader.autoExcluded)
  keep: { 'reset:b': { layer: 'b', id: 0 } },              // keepsUpgrades' milestone
  clickables: { c: [{ id: 11, when: 'player.c.points.gte(10)' }] },
  options: { },                                            // free-form; merged under ?autoOpt= into tmtLoader.autoOptions
};
```

Every key is optional; **a game without a table (or `{ id }`) gets the derived defaults**. Rules, all checked at load
(a failure throws, which fails the page load):

- an unknown top-level key throws;
- every feature id in `policies`, `alternatives`, `order`, `gates`, `off`, `keep`, `unlockOrder` (as `reset:<l>`) and
  `clickables` (as `clickables:<l>`) must be one the derivation produces for this game — checked against the whole
  derived set, so a table stays valid under any `kinds` restriction;
- `off` needs a reason string; `clickables` entries need an `id` the layer declares and a `when` string;
- `kindOrder` is a permutation of the six kinds;
- ⚖ minimize hardcoding: a NUMBER or an ORDER in a table carries its provenance in a comment (a SUMMARY row or a plan §).

**Predicates** (`gates`, clickable `when`) are JavaScript expressions over the engine's globals, compiled once with
`new Function('return (' + src + ')')` — the global scope, the same one the harness's `--until` / `--marks` strings run
in (gate S1-1 checks both agree at every tick, in Node and in the page): `hasUpgrade('t', 23)`, `player.q.unlocked`,
`player.points.gte('1e300')`, `tmtLoader.autoOptions.x === '1'`. A predicate that throws reads as false.
`tmtLoader.predicate(src)` returns the compiled function.

## The two tables (measured defaults)

| Game | Feature | Table policy | Why (`tools/harness/results/SUMMARY.md`) |
|---|---|---|---|
| ptr | `reset:p` | `interval>=10` | A1-3: `always` resets p the moment points reach 10, so points never reach the 200 the b/g pair needs (a hard wall at diff 0.05 and 1); 10 s reached the row-1 predicates fastest of 5/10/30/60/120 s |
| ptr | `reset:b`, `reset:g` | `gain>=1` (alt. `keepsUpgrades`, milestone 0 of each) | A1 table; `unlockOrder` `[g, b]`: g first ahead at every predicate and every p interval tried |
| ptr | `reset:t`, `reset:e`, `reset:s` | `interval>=5` | A2-3: the requirement paces a row-2 reset — s at 5–30 and t at 5–60 tie exactly with both controls; `unlockOrder` `[s, t, e]` (s,t,e 3550 / 6037 / 8035; t,e,s and e,t,s never reach (ii)) |
| ptr | `buyables:t` | off | Extra Time Capsules cost Boosters (lowers the booster effect) |
| something | `reset:unlock` | `always` | A1 table |
| something | `reset:fundamental` | `interval>=5` | A1-3: `gain>=1` resets about every tick and starves unlock gain; 5 s → 308 game-s to unlock:upg:12 of 2/5/10/20/30/60 |
| something | `reset:primitive` | `interval>=90` | A2-1 sweep: 90 s → 399 / 579 game-s to primitive ms 1 / ms 2 (60 → 429 / 17109; 120 → 429 / 669; 5 = 10 = `always` = `gain>=1` → 501 / —) |
| something | `buyables:fundamental` | `buyMax` | A1 table (none of 11–22 defines `buyMax`: bought one at a time) |

Everything else in both games is derived.

## Harness levers

- `--profile off|all|saved`, `--exclude au` (hash without the `au` layer), `--no-auto` (no table: derived defaults only).
- `--auto-opt "k=v;k2=v2"` (page: `?autoOpt=`):
  - `policy:<featureId>=<policy>` — override a feature's policy (any valid policy of its kind), e.g. `policy:reset:p=always`;
  - `kinds=reset,upgrades,buyables` — register only those kinds (the pinned-behaviour gate and A/B rows);
  - `kindOrder=reset,upgrades,…` — override the kind order;
  - `unlockOrder=b,g` / `rowTwoOrder=t,e,s` — override the table's first / second `unlockOrder` list (a permutation of it);
  - `hookAll=1` — hook every tree layer (test probe); any other key lands in `tmtLoader.autoOptions`.
- `--marks marks.json` (`[[name, "<js predicate>"], …]`): the first tick each predicate holds, with gameSeconds, the
  state hash, `hashGame` (the hash without `player.au`) and the feature action counts at that tick; the run stops when
  all are met. `--marks-continue`: record without stopping.
- `--stall-seen`: the stall detector counts only something new EVER held in the run (an unlock, upgrade, milestone,
  achievement or challenge completion not held before, a buyable above its run maximum).
- `--stall <game-s>` / `--wall-ms <ms>`: stop after that many game-seconds without progress, or that much wall time; the
  result has `stall.lastProgress` and a per-layer `detail`.
- Results carry `features`, `featureStates` (`[id, unlocked, policy]`), `derivation` (`tmtLoader.autoDerivation`) and
  `excluded` (`tmtLoader.autoExcluded`).
- `node tools/harness/gates-s1.mjs --part 1|1s|2|2s-p|2s-f|2s-q|3` the S1 gates; `gates-a1.mjs`, `gates-a2.mjs` the A1/A2 ones.
- `node tools/harness/sweep.mjs <id> --vary "policy:reset:e=interval>=5|always" [--opt "k=v"] <run.mjs flags>`: one run
  per value (a pool of 8), one line per value with the game-seconds to each mark.
