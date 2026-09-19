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
- **a setting, *Arm features that are not unlocked yet*** — see below;
- after the first click on any toggle, the line *"Automation tools are a loader addition (tmt-loader); every toggle is
  off by default."*

The toggles live in `player.au.features` (`{featureId: true|false}`), `player.au.disclosed` records the first click.
`au` is a side layer with no `doReset`, and neither engine resets such a layer (2.2.1 `rowReset("side")` skips
`layerDataReset`; 2.7 guards with `!isNaN(row)`), so the toggles survive every reset and are saved with the game.
`player.au` also carries the engine's own layer fields (`points`, `clickables`, …; 2.7 needs `points` because its
`gameLoop` updates `best` for every side layer). **`player.au.clickables` has one key per toggle button**, so the full
state hash moves with the NUMBER of registered features; compare game state across tables with `au` excluded (the
harness's `hashGame`).

### Arming a feature that is not unlocked yet (U4)

⚖ user, 2026-09-19. A locked feature's toggle is shown and refuses the press. With the setting
**Arm features that are not unlocked yet** on, it accepts one: the feature goes to `player.au.features` as usual, the
button reads **Armed** in amber, and *it does not run*. The moment the feature's own `unlocked()` becomes true it
starts, with no further press.

**Nothing about running changed, and that is what makes arming safe.** Every branch of the registry's `active(f)`
already ANDs with `featureUnlocked(f)`, while `isOnSaved` is stored per feature id independently of unlock state — so
an armed-but-locked feature is inert by construction, and `active()` turns it on by itself at the unlock. The setting
lifts exactly two UI predicates and reaches nothing else:

| | setting off (the default) | setting on |
|---|---|---|
| a locked feature's own toggle | `canClick` false; reads `Locked` | `canClick` true; reads `Armed` / `Off` over `locked` |
| *All features* | turns on every **unlocked** feature | turns on every feature, **locked ones included** (⚖ decided in U4: an "All" that meant "all the unlocked ones" would leave the locked buttons to be pressed one by one, and two toggles reading different predicates is a split a later reader has to re-derive) |
| `active(f)` — whether it runs | unchanged | **unchanged** |

**Where it lives.** `player.au.armLocked`, beside `player.au.disclosed` — the `au` layer's own non-feature UI state, and
a store the save already carries. ⚠ It is **not** in the layer's `startData`: a key present from the first boot would
move a recorded hash for a setting nobody has touched. Absent reads false; the first press writes it.

⚠ **U6 corrected the reason this line used to give, by measuring it.** It said "the S1 pins compare the FULL state
hash, which includes `player.au`". They do not: the S1 **pinned** rows compare ticks and `hashGame` — the state
*without* `player.au` — and would never have seen the key. What a seeded key does move is the FULL hash, which
`gates-p1a --part 0` pins for the frontier fixture. Measured on `ptr` at `2e0818811` with `armLocked: false` seeded
into `startData`:

| | without the key | with it |
|---|---|---|
| fresh boot, full hash | `6062b457fdb56dd6` | **`13cd6ddb1cd512a4`** |
| `all/M09` at 0 ticks, full hash | `97d8593fb06c4537` | **`4c4937e5074ec391`** (the import re-adds it from `startData`) |
| the same two, `--exclude au` (`hashGame`) | `8daecd949227c861` / `208197f46f08ed88` | **identical** |

So seeding is free for S1 and costs one FULL-hash pin, which is a re-record the user decides. U6 took the route that
moves neither: the key still does not exist until the player presses the button, and the press is routed through
`tmtLoader.armLocked(on)` (below).

**What it is made of.** A tabFormat `['row', [['display-text', …], ['toggle', ['au', 'armLocked']]]]` — the engine's own
components, all three registered by all 171 games (measured over `Vue.component("…")` in `games/`, quote-agnostically).
⚠ It is deliberately **not** a clickable: `buildClickables` lays the feature buttons out in a grid whose `rows` / `cols`
it computes from `features.length + 1`, and `loader/mobile.css` flattens those row boxes with `display: contents`, so a
twelfth clickable would have shifted every button's id by one and joined the flatten. A tabFormat member sits outside
both. The click runs the engine's own `toggleAuto(['au', 'armLocked'])`, which is how the field is written without
`loader/tmt-auto.js` touching the DOM — it never has, and `docs/contract.md` says so.

`tmtLoader.armLocked()` reads it and `tmtLoader.armLocked(on)` writes it (through `Vue.set`, because the key is absent
until first written and **22** of the 171 engines' own `toggleAuto` assigns plainly). `featureState(id).armable` is the
predicate both toggles read: `unlocked || armLocked`.

⛔ **AND THE BUTTON DID NOT CALL THAT SETTER — the U4 bug the user reported on 2026-09-19.** `Vue.set` was written
here and the reactivity defect shipped anyway, because the `toggle` component's click is hardcoded to the engine's
own `toggleAuto`: a careful reactive write on a path the UI never takes is not a reactive write. MEASURED on `ptr`:
the button reads `OFF`, one press leaves the text `OFF` while `player.au.armLocked` becomes `true`. Vue 2 cannot
observe a property ADDED to an object after creation, and ptr's `toggleAuto` is
`player[t[0]][t[1]] = !player[t[0]][t[1]]` — **22 of the 171 assign plainly, 149 use `Vue.set`**, which is why the
user could see it and a `Vue.set` engine would have hidden it.

**The fix owns the click path and nothing else.** `toggleAuto` is wrapped for exactly `['au', 'armLocked']`; every
other toggle in the game reaches the original by the same call, and that one path goes through `armLocked(on)`,
whose `Vue.set` both creates the key and notifies `player.au`'s own observer — which is what re-renders the engine's
button, its text and its colour.

⚠ **That the wrapper can be reached at all is a census, not an assumption** — it depends on `toggleAuto` being a
property of the global object and on the Vue instance not shadowing it, and both are the GAMES' business:
**of the 171 games, 171 declare `function toggleAuto` at top level, 149 write the field through `Vue.set` and 22
assign plainly, and 0 put `toggleAuto` in the Vue instance's `data`.** A top-level function declaration in a classic
script IS a `globalThis` property (and the same holds in the harness's `vm.runInThisContext` context), and with
nothing shadowing it the compiled template's `with(this)` falls through to exactly the property this replaces.
⚠ **The scope of those four numbers is `loaded`, and the LAST declaration wins** — which is what makes 22 the
answer rather than 24. TWO games declare `toggleAuto` in more than one file and the copies DISAGREE:
`the-yes-tree` (`js/mod.js` plain at load index 2, `js/utils/options.js` through `Vue.set` at index 14) and
`the-tree-emipiplu` (three copies, only the one under `js/` loaded). A first-match grep over the tree reports 24
plain; the copy the click actually reaches is the last one loaded, so both are `Vue.set` games and the figure is
22. The census brace-matches each declaration's body rather than windowing it, because a bounded window was
measured running past the closing brace on two long bodies and finding a `Vue.set` further down the file.

`tools/census-figures.mjs` checks all four numbers against that sentence, and `tmtLoader.armToggleOwned` says
whether the wrapper was actually installed rather than leaving it to be guessed.

⚠ **The gate asserts the RENDERED TEXT, not the flag.** The flag already changed on the build the user reported;
that is the whole bug. `gates-a1 --part 2` presses the control three times and requires the button's own text to
move, come back, and move again — on `ptr` (plain-assign) **and** on `something` (`Vue.set`), because a fix verified
only on a `Vue.set` engine proves nothing.

**The gate** is `node tools/harness/gates-a1.mjs --part 2`, one row per game: with the setting off a real press on a
locked button changes nothing; with it on the feature arms, the flag survives a reload, and 200 ticks later it is still
`active: false` with 0 actions; then the feature is unlocked **in the same page** and must go active and *act* with no
further press. The unlock is the engine's own where the engine allows it (`doReset(l)`, then the `player[l].unlocked`
flag) and the row says which path it took. ⚠ Neither sticks everywhere — measured on Something Tree, whose
`unlock.update()` recomputes `player.fundamental.unlocked` every tick and puts it straight back — so the fallback
replaces the feature's derived `unlocked()` with one that says yes, the same construction gate M1 uses for `pseudoUnl`.

⚠ **Where only that fallback was available, the "and it ACTS" half ABSTAINS**, and that is not fastidiousness: every
action the registry takes goes through the engine (`buyUpgrade`, `doReset`, …) and the engine gates each of them on
ITS OWN `player[l].unlocked`, not on the registry's predicate. Measured on Something Tree — `active` flips,
`tmp.fundamental.upgrades` stay locked, and 400 ticks with 1e30 points buy nothing. `ptr` carries that half, through
a real `doReset('p')`: `upgrades:p` goes active and buys an upgrade with no further press and no help at all.

**The mutant round** (`bf0804821`, serially, each restored from git afterwards):

| mutant | the checks that reddened |
|---|---|
| the setting ignored by the **per-feature** toggle (`canClick: featureUnlocked(f)`) | *the locked button accepts a press* (canClick false), *armed by a real press* (false), *the button says so* ("Off / locked"), *after a reload*, *it went active*, *it ACTED* — six |
| the setting ignored by the **master** toggle | exactly one: *with it on, All features armed everything including the locked* (1/78 on). Nothing else moved, which is what says the two toggles are judged apart |
| `active()` relaxed — its `featureUnlocked` dropped | *armed but locked* (active **true**), *200 ticks armed-and-locked* (active true), *after a reload* (running true) — the three that carry "it does not run while locked", and only those |

⚠ **Nothing else went red in any round.** A mutant reddening a check it cannot reach is the tell for a contaminated
tree, and the tree was committed before the round so a `git checkout` restore could not eat uncommitted work.

✅ Recorded green at `fcd0ce459`: `gates-a1 --part 2` **24/24**, both games.

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
that order inside the layer's `automate()`. Measured (S1-2k, diff 1): the generic order reaches the pinned marks slightly
earlier than reset-first — ptr A1-3 1322 / 2321 / 2893 vs 1361 / 2360 / 2936; Something Tree 301 vs 308 to unlock:upg:12
and 302 / 392 / 572 vs 309 / 399 / 579 to the primitive marks.

Why those defaults: a static layer's gain is one per reset and its reset waits on its requirement, so `always` is the
measured rule there (A2-3: the all-`always` control reached the default's state at 8035 game-s; A1's b/g ran `gain>=1`,
the same thing for a static layer; `gain>=Nx` would never fire on a static layer past its first points, since the gain
stays 1). `gain>=2x` for normal / custom layers is the one policy of the S1-2 sweeps that reached every mark on all three
swept layers without a constant: ptr `reset:p` 918 / 1627 / 2112 game-s to A1-3's marks (the table's measured
`interval>=10`: 1361 / 2360 / 2936); Something Tree `reset:fundamental` 496 to unlock:upg:12 (`interval>=5`: 308);
`reset:primitive` 446 / 951 to primitive ms 1 / ms 2 (`interval>=90`: 399 / 579). `gain>=4x` also reached all of them
(2215 at ptr (iii), 1587 on fundamental, 377 / 835 on primitive); `unlocks-purchase` walled ptr (ii) and fundamental;
`always` walled both.

Upgrades with a `pseudoUnl` (Prestige Tree's pseudo-upgrades) are never bought. Milestone toggles in the 2.2.1 `'multi'`
form (`{layer, varName, options}`, a string it cycles) are skipped and counted (`tmtLoader.autoDerivation.multiTogglesSkipped`).

## Kinds and policies

| Kind | Policy | What it does each tick |
|---|---|---|
| `reset` | `always` | `doReset(l)` whenever `tmp[l].canReset` |
| | `gain>=N` | … when `tmp[l].resetGain ≥ N` (N is a quantity, not a count: the advanced planner derives it from the target it is resetting FOR, so it spans the Decimal range) |
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
| | `reserve>=N` | as `buy`, but nothing while the layer holds no more than **N** of its own points — an explicit reserve where `buy-unless-saving` derives one. The layer's points is the one currency a generic reserve can read, so a buyable costed in another layer's currency is still gated on this layer's points. Added for the advanced planner, which sets N to the threshold it is protecting (`docs/planner.md`) |
| | `reserve>=next-upgrade` | as `reserve>=N` with **N read from the game**: the cost of the cheapest unowned, unlocked upgrade of the layer costed in the layer's own points (`tmp[l].upgrades[id].cost`), re-read every tick; no such upgrade = no reserve. The generic form of "save for the upgrade, spend the surplus" — unlike `buy-unless-saving`, which stops buying altogether while any own-currency upgrade costs more than is held. ⚖ minimize hardcoding: the number is never in the table (R1′, PTR `buyables:e`) |
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
| ptr | `reset:p` | `gain>=2x` (alt. `interval>=10`, `always`, `gain>=1`) | R1′, from S1-2's sweep + P1b's frontier control (iii): 918 / 1627 / 2112 game-s to A1-3's marks against `interval>=10`'s 1361 / 2360 / 2936, and M11 at 15582 against 15782 — and the target-driven rule ⚖ 13d.2 asks for (an interval is a proxy). `always` still walls row 1 (p resets the moment points reach 10, so points never reach the 200 the b/g pair needs, at diff 0.05 and 1); `interval>=10` was the fastest interval of 5/10/30/60/120 s and every pinned A1/A2 number and ptr snapshot was measured under it, so the pinned gates now name it explicitly |
| ptr | `reset:b`, `reset:g` | `gain>=1` (alt. `keepsUpgrades`, milestone 0 of each) | A1 table; `unlockOrder` `[g, b]`: g first ahead at every predicate and every p interval tried |
| ptr | `reset:e` | **`gain>=2x`** | R1′ (gate R1′-2.3, one 12 000-tick leg from the frontier): `e` is row 2's only NORMAL layer (exponent 0.02), so its gain is a function of how high points CLIMBED, and an interval reset spends that climb every 5 s for ~1.5 EP. `interval>=5` and `always` reach M11 only (147 resets, 16 EP held, best 400); `unlocks-purchase` M11 with 263 EP; `gain>=2x` reaches **every remaining mark of the rung** (M11 14745 · M12 14909 · M13 14132 · M14 14879 · M15 16048 · M16 24179) in 299 resets, ending on 2.35e92 EP |
| ptr | `reset:t`, `reset:s` | **`always`** | A2-3 measured `interval>=5` tying with `always` / `gain>=1` during the unlock phase; R1′-2.3 measured the tie again at the frontier (M16 24212 / 24203 against the interval's 24236) and took the constant-free rule — a static layer's gain is 1 per reset and its REQUIREMENT paces it, so a clock has nothing to be a proxy for. `unlockOrder` `[s, t, e]` (s,t,e 3550 / 6037 / 8035; t,e,s and e,t,s never reach (ii)) |
| ptr | `buyables:t` | `buy` (was off) | R1′ lifted the exclusion. The Time Energy cap is `100·(2^(TC + extra TC) − 1)·enCapMult`, so each Extra Time Capsule DOUBLES it; without them it sits at 6300 against t12's 2e5 and the whole t12 → t13 → t23 refund chain waits. Measured: with the exclusion, t upgrades [11] and `t.unlockOrder` 1; with it lifted, 11 Capsules, cap 2.49e9, t upgrades [11,12,13,14,15,23] and **unlockOrder 0**. The booster cost is real and smaller than what it buys, and the game grants the same autobuyer itself at q milestone 1 (`player.t.autoExt`) |
| ptr | `buyables:e` | `reserve>=next-upgrade` | R1′: Enhancers cost `2^(x^1.5)` EP and compete for the EP that e11 (25) → e12 (400) → e22 (1000, at unlockOrder 2) need — the e half of M12. `buy` ends 11 EP held with 4 Enhancers, `reserve>=next-upgrade` 47 EP with 3, and a literal `reserve>=25` is byte-identical to `buy` (once e11 is owned the next upgrade costs 400) |
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
  - `order:<featureId>=11,12,23` — override the table's `order[]` for one feature (upgrade / buyable / challenge order),
    so an ORDER can be swept with controls before it is written into a table; an empty list clears it;
  - `include=<featureId>,…` — drop those ids from the table's `off` map, so an EXCLUSION can be measured without editing
    the table (R1′ re-evaluated `buyables:t` this way, and then lifted it). An id the derivation does not produce, or one
    the table does not exclude, throws;
  - `exclude=<featureId>,…` — the inverse: do not register those, as if the table had excluded them. What a CONTROL needs
    (a row measured before a table lifted an exclusion cannot be reproduced without it — the A2 pins in `gates-s1` name
    `exclude=buyables:t` for exactly that reason) and what a sweep needs to switch one feature off without inventing an
    `off` policy for every kind. An unknown id, or one the table already excludes, throws;
  - `hookAll=1` — hook every tree layer (test probe); any other key lands in `tmtLoader.autoOptions`.
- A THROW in the table or the derivation (an unknown key, an unknown feature id, a bad `include=`) is a **hard fail** of
  the run (`ok: false`, `failed_at: 'automation'`), not a run with `features: []` — the page fails its load on the same
  throw, and before R1′ the Node harness recorded the error in `file_errors` and reported `ok: true`, so a mistyped
  sweep cell measured the game with NO automation and printed a number.
- `--marks marks.json` (`[[name, "<js predicate>"], …]`): the first tick each predicate holds, with gameSeconds, the
  state hash, `hashGame` (the hash without `player.au`) and the feature action counts at that tick; the run stops when
  all are met. `--marks-continue`: record without stopping.
- `--stall-seen`: the stall detector counts only something new EVER held in the run (an unlock, upgrade, milestone,
  achievement or challenge completion not held before, a buyable above its run maximum).
- `--stall <game-s>` / `--wall-ms <ms>`: stop after that many game-seconds without progress, or that much wall time; the
  result has `stall.lastProgress` and a per-layer `detail`.
- Results carry `features`, `featureStates` (`[id, unlocked, policy]`), `derivation` (`tmtLoader.autoDerivation`) and
  `excluded` (`tmtLoader.autoExcluded`).

**Runtime levers (never saved).** `tmtLoader.setPolicy(id, policy)` changes a feature's policy and
`tmtLoader.setFeatureEnabled(id, true|false|null)` overrides whether it runs at all under the current profile (`null`
clears the override; profile `off` still wins). Both are memory OUTSIDE `player` and both ride in
`tmtLoader.runtimeState()`, so an excursion rolls them back and a resumed process keeps them — that is how the advanced
planner commits a configuration for an epoch without writing a planner decision into the player's save
(`docs/planner.md`). `tmtLoader.policyTemplates` is the enumerable alphabet of each kind, with the parameterised
policies named by their template (`gain>=Nx`, `interval>=T`, `reserve>=N`) — the numbers belong to whoever chooses them.
`tmtLoader.registerRuntime(name, get, set)` adds another layer's memory to the same record.
- `node tools/harness/gates-s1.mjs --part 1|1s|2|2s-p|2s-f|2s-q|3` the S1 gates; `gates-a1.mjs`, `gates-a2.mjs` the A1/A2 ones.
- `node tools/harness/sweep.mjs <id> --vary "policy:reset:e=interval>=5|always" [--opt "k=v"] <run.mjs flags>`: one run
  per value (a pool of 8), one line per value with the game-seconds to each mark. A `planner:<option>` key sweeps the
  ADVANCED planner's options instead (`--vary "planner:k=60|300|900" --planner=auto --planner-ladder …`), and every line
  then carries the round count, the planning wall time and, when the run did not reach `--stop-mark`, `dnf` with a cause
  read off the round log (`fixation` / `economy` / `blocked` / `wall`).
