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
to the game's other side nodes (selector `#app .smallNode.au` on both engines). Since V1 its tab has **two engine-native
subtabs**, `Simple` and `Advanced` (⚖ user, 2026-09-19).

### `Simple` — the toggles (the tab as it has always been)

`Simple` is FIRST in the `tabFormat` object, so it is what both engines select by default (`getStartPlayer` takes
`Object.keys(layers[l].tabFormat)[0]`) and what an old save is repaired to (`fixSave`). Its content is unchanged:

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

### `Advanced` — what each feature decided, why, and the strategy it decides by (V1 read-out, V2 editing)

One block per feature, grouped by layer in the game's own layer order, with the features that cannot run yet collapsed
to one line each. Per feature: its title and id, its state, the policy **in force** with the table's entry and the
generic derivation's beside it *when they differ*, the **reason its last decision returned** with the numbers that
decision compared, `acted N · last at <game-s> · on for <game-s>`, a *never fired* flag, and the table's `provenance`
line. It renders `tmtLoader.explain()` and computes nothing of its own.

**Since V2 it is EDITABLE** (⚖ user, 2026-09-19: *"For cases where there are multiple known strategies, I'll want the
user to be able to select which one to use, and to adjust any relevant values"*). Each running feature's block carries:

- a **strategy picker** — every strategy of that feature's kind, in the table's order. A strategy that cannot fire on
  this feature is shown DISABLED with the reason in its own label, never omitted: `gain>=Nx` can never fire on a
  **static** layer (its gain is 1 per reset, so a multiple of what it already holds is unreachable the moment it holds
  1), `keepsUpgrades` needs a `keep` milestone the table has not declared, `order` needs an `order[]`;
- one **editor per parameter** of the picked strategy, and of its modifier when one is in force;
- the stall modifier's own press (*add / remove the stall fallback*), with its clock beside it;
- an **EDITED** chip and the default it would return to, and a **use the default** press that clears the choice.

The V1 read-out is unchanged and stays LIVE beside the controls — watching the reason line change is the point of
editing. **Choices live in the save** (`player.au.edits`, below).

⚠ **Subtabs make the loader depend, on every game, on a component it had never asked for**: the engine draws the
subtab bar itself, with `tab-buttons`. Censused quote-agnostically over `games/`: **all 171 of the 171 games register
`Vue.component("tab-buttons")`**. ⛔ That is a REGISTRATION count and not a rendering result — a game could register
the component and still fail to draw the tab — so it is only the premise; `gates-v1 --part 6` opens the Advanced
subtab on every game and is the witness.

### The controls: the loader registers its OWN components

⚖ **Corrected during V2** (the user asked why the engines' own inputs could not be used on every game — they can be
SUPPLIED). Both engines' `column` / `row` render **any registered component by name** (`v-bind:is="item[0]"` with
`:layer` and `:data` — ptr `js/components.js:71-73`, something `:60-72`), so a component the LOADER registers appears
inside a `tabFormat` exactly like an engine one. Censused quote-agnostically over `games/`: **all 171 of the 171
games register `Vue.component("column")`**, which is the premise the whole design rests on. `tmt-auto.js` registers
**seven** components (four since V2, two more since V3, one more since V4b), namespaced so nothing can collide:

| component | what it is |
|---|---|
| `tmtl-editors` | the whole Advanced list — ONE instance, so the input elements keep their identity across ticks, and since V3 the one that HOLDS which blocks are folded |
| `tmtl-feature` | one feature: V1's read-only block (`v-html`), then the picker, the parameter editors, the modifier press and (V3) the escalation list |
| `tmtl-select` | the strategy picker (a `<select>`) — for the policy in force, or (V3, with `data.rung`) for one escalation rung |
| `tmtl-number` | one parameter: a text field with `−` / `+` steps, bound to LOCAL state and committed on change / Enter / blur. Since V3 it writes to one of THREE targets — the saved policy, an escalation rung, or a stall-watch setting — because everything that makes it correct (the draft that survives the re-render, the hotkey guard, the per-type step, the clamp) would otherwise be got wrong twice more |
| `tmtl-watch` | (V3) the stall watch's own controls: the on/off press, the tracker's, the three settings and the state line |
| `tmtl-progress` | (V3) the `Progress` subtab's timeline |
| `tmtl-reset` | (V4b) *reset the automation settings* — a two-press confirm at the BOTTOM of the Advanced view, under every block, because it is the one control here that cannot be undone |

⚖ **They wear the GAME's theme, not the browser's** (user, 2026-09-19: *"light text on a dark background"*). An
`<input>`, a `<select>` and a `<button>` come with the browser's own colours — black on white — which is wrong
against a dark tree. The controls take `color: var(--color)` and `background-color: var(--background)`, the two CSS
custom properties the THEME sets (ptr `style.css:16-20`), so they follow whatever theme the player picked rather
than hardcoding a dark one. Censused: **all 171 of the 171 games define `--color` and `--background`**. ⚠ Plus
`color-scheme: dark`, without which the browser goes on drawing its own light chrome INSIDE the control — the
select's arrow, the caret, the selection, the focus ring.

⛔ **`loader/tmt-auto.js` still never touches the DOM** (`docs/contract.md`). These are component *definitions* handed
to the engine's own Vue; Vue does every bit of the rendering. Nothing queries an element or holds a reference to one,
and no file under `games/` changes. ⚠ **Registration is in automation mode only** — the definitions live below the
contract-only early return, so a page without `?automation=1` has no `tmtl-*` component at all
(`gates-v2 --part 4`). In **Node** the definitions go to the harness's Vue *stub* (`boot.mjs:119`) and render nothing.

⚠ **Do NOT depend on the engines' own `text-input` / `slider` / `drop-down`:** only 154 / 154 / 152 of the 171 games
register them, and their behaviour differs by engine version. **17 register none of the three, `ptr` among them** —
one of the two reference games this whole arc is measured on. There is no second "fallback" control family: one
family on all 171, and a game that needed anything else is a RED in `gates-v2 --part 6`, not a fallback.

Three traps the components exist to avoid, each with its own leg:

1. ⛔ **The game's hotkeys.** Both engines act on a bare letter from `document.onkeydown`, so typing `p` into a field
   would PRESTIGE on ptr. Measured in each engine's own words: ptr `js/utils.js:997-1012` and something
   `js/utils.js:308-322` **both** carry `if (onFocused) return` and **both** define a global `focused(x)` — what
   2.2.1 lacks is a `text-input` COMPONENT that calls it, not the guard. `tmtl-number` stops every key event at the
   input (the game's handler is on an ANCESTOR, so it never sees it) *and* calls `focused()` where the game defines
   one; the first half works on a fork that defines neither. Measured, paired: a real key press of a live hotkey with
   the caret in the field moves nothing, and the same press outside the field acts.
2. ⚠ **Re-render while typing.** The tab re-renders every tick, so a field bound straight to the saved value would
   have a half-typed `1e` parsed out from under the caret. The field is bound to local state and refuses to overwrite
   the draft while it has focus.
3. ⚠ **`?mobile=1`.** The loader's own layer list reads each tab's `tabFormat` with its own walker
   (`loader/layerlist.js`), which knows the engines' component names and nothing else: an unknown name falls through
   `emitComp` and costs nothing — no chip, no throw. Measured at 390 px, with no horizontal page scroll and no
   control wider than the viewport.

⛔ **It is lazy — and where that matters is not where it looks.** Both engines already refuse to evaluate a
`tabFormat` they are not showing: 2.2.1 (`ptr`) skips any key whose name contains `tabformat` / `display` /
`description` whenever `player.tab != layer` (`js/technical/temp.js:96`), and 2.7 (`something`) skips `tabFormat`
and `content` outright (`temp.js:127`, with both in `activeFunctions` at `:12`), moving them only through
`updateTabFormats()`. So in **Node**, where the `au` tab is never open, neither engine ever calls the Advanced
content function at all — the headless `formats === 0` below is true, and the ENGINES guarantee it.

What the guard actually prevents is the case they do not cover: **the `au` tab is open and `Simple` is what the
player is looking at.** ptr then walks the whole `tabFormat` object on every `updateTemp()` — *both* subtabs — so
the Advanced content would be rebuilt on every tick of a tab nobody is looking at. Measured over 200 ticks with a
redraw every 10 (`gates-v1 --part 3p`): **0 formats on Simple against 2721 with `Advanced` selected** on ptr, and
**0 against 98** on something; with the tab closed, 0 on both.

⛔ **The selected subtab is NOT game state.** Both engines keep it in `player.subtabs.au.mainTabs`, a top-level
`player` key — so giving this tab subtabs would have moved every pinned `hashGame` in the repo, and a player
switching subtab would move it again mid-run. `hashGame` therefore excludes `player.subtabs.au` as well as
`player.au`, in ONE shared definition (`tmtLoader.gameState`, `docs/contract.md`). ⚠ Measured before the change:
`player.subtabs.au` was ABSENT on both engines, so deleting the key reproduces the historical bytes exactly.

### `Progress` — what this session has held for the first time (V3)

The third subtab, and the sensor the stall watch runs on. **Progress = something NEW EVER HELD in this session**: a
layer unlocked, an upgrade, a milestone, an achievement, a challenge completion, or a buyable above its own running
maximum. ⛔ **Re-buying what a reset took away is NOT progress** — the rule is a SEEN-SET, not a signature of the
save, which is exactly what makes a reset-and-rebuy loop read as a stall rather than as activity.

⛔ **It is the harness's own stall-detector rule** (`--stall-seen`, `tools/harness/policy.mjs` `MONITOR_SRC`), brought
into the core so there is ONE definition to read — the same move `hashGame` → `tmtLoader.gameState` made in V1.
`gates-v3 --part 1` compares the two event for event on ptr and on something: the seen-set, the buyable maxima, and
the tick the last progress landed on. The monitor's own text is *not* replaced, because it has to go on reproducing
every committed `stall.lastProgress` pin (`gates-p1a --part 0`'s **10531** among them) and a resumed run restores it
from a snapshot an older build wrote.

⚠ **One measured difference between the two, and each is right about a different question.** The harness monitor is
seeded from a snapshot's own `runtime.monitor` block, so it CONTINUES the memory of the run that wrote the fixture;
the core's tracker arms when it is switched on and seeds from the save in front of it. Resuming `all/M16.json` gives
identical seen-sets (107 = 107) and DIFFERENT buyable maxima over 8 keys — a buyable the original run once held and a
reset took away is above the snapshot's live value. `gates-v3 --part 1` therefore runs on FRESH legs.

```js
tmtLoader.progress()   // { armed, events: [{at, kind, layer, id, key, tick, marks}], total, dropped, byKind,
                       //   lastAt, sinceLast, typicalGap, gaps: [{dt, dirty}], stalled, threshold, cap, marks }
```

- **OFF by default**, and it leaves no trace when off: the memory is in `runtimeState()` and the block appears only
  while the tracker is armed, so a run that never uses it writes byte-for-byte the record it wrote before V3 and every
  committed snapshot stays valid (`gates-v3 --part 2`, which also asserts the record's KEY SET).
- **The per-tick work is incremental.** One full walk of everything already held, when the tracker arms; after that a
  tick reads three array LENGTHS per layer and walks only the tail of a list that grew, plus the (small) challenge and
  buyable maps. `tmtLoader.progressStats()` returns `{fullScans, polls, tails, tailItems, markChecks}` and
  **`fullScans` is 1 after a run of any length** — the counter is the cost gate, the way `formats` is V1's.
  ⚠ The claim is NOT "tails are bounded by the events": PTR's `reset:p` fires 8 times in 200 ticks, each wipes
  `player.p.upgrades`, and the re-buy grows the list again. `tailItems` states the honest one — the per-tick element
  work is bounded by what the GAME CHANGED that tick, never by what it holds.
- **The event list is bounded and the counts are exact.** The newest `cap` events are kept (200; `?autoOpt=progressEvents=<n>`);
  `total`, `dropped` and `byKind` are counted over all of them. A bound that could change a count would make the
  readout a lie.
- **`typicalGap` is the median of the last `n` gaps that are usable evidence**, and two kinds are not: a gap that
  ended while the stall watch had any feature ESCALATED (a rescue's duration is not evidence of what normal looks
  like — the same rule `stall>=Kx/N` has for a fallback-fired reset), and the first gap after arming or a load.
  ⛔ **An unusable gap never enters the window at all** — it is COUNTED (`skipped`) with its duration kept in a second
  bounded list (`skippedGaps`), and the view says so. The first cut stored it and filtered it out at read time, and
  that **silenced the watch for good**: a dirty gap EVICTS clean evidence, so after one rescue and its cool-off the
  five-gap window held five rescue gaps, `typicalGap` read `null`, and `stalled` could never be true again — the
  watch went permanently deaf on the game it had just rescued (measured on the page by `tools/harness/shots-v3.mjs`).
  The flag rides in `runtimeState()` so a resume measures the same median.
- **Ladder marks as labels.** Where `tools/harness/ladder/<id>.json` exists — **2 of the 171 games** — the host hands
  it to the core and an event carries the names of any marks it satisfied. ⛔ Evaluated only when an EVENT fires,
  never per tick; `markChecks` says so. The view is complete without one, which is what the other 169 games get.
  ⛔ **The request is LAZY and asks an INDEX first, and both halves were measured by CI.** The first cut fetched the
  ladder on every automation boot and noted a 404 in `tmtLoader.skipped`; `G1 load — automation page` judges every
  request a page makes (a failed one the manifest does not declare is a RED, and `skipped` must equal the manifest's
  declared list) and reported **169 of 171 RED** — for a file 169 of them were never going to have. So
  `loader/page.js` supplies `tmtLoader.fetchLadder()`, the core calls it only when something wants the labels (the
  `Progress` subtab's `created`, or a progress event with the tracker armed), and it reads
  `tools/harness/ladder/index.json` first, so **there is never a 404 to judge**. `loader/watch.test.mjs` keeps the
  index in step with the directory. In Node `run.mjs --ladder` passes `--ladder-labels` and sets it outright.
- **The labels are the engine's own.** A layer's name is `layers[l].name` and an item is named by its own numeric id.
  This view introduces no second naming scheme for anything the game declares.

### The stall watch — an OPTION that changes what a WAITING feature decides by (V3)

⚖ **The user's words** (2026-09-19): *"Another idea is to have an option to keep track of when progress seems to be
stalled, and switch to a strategy that's less likely to get stuck."* **OFF by default.**

⛔ **EXPERIMENTAL — it is NOT a safety net, and that is MEASURED (R2, twice equal; reproduced by the planner to the
hash).** On a healthy opening the watch is byte-identical to having it off. But on PTR from `all/M15.json` under the
shipped table AS IT STOOD AT R2 — which reaches M16 at 17058 and M22 at 29204 (⚠ M22 is **30618** since V4's `reset:q`
pause, and M21 is reached; the watch was measured before it) — switching the watch on reaches **no mark at all** in
14,000 game-seconds (`hashGame a104beb628873be7`; `reset:e` fires 2412 times against 224; `q` never unlocks). The
mechanism: **a default that is correctly PATIENT is indistinguishable, to the watch, from one that is STUCK**, so it
escalates a feature that was doing the right thing. Which feature the arbiter picks, and what the derived escalation
lists contain, have not been swept. Until they are, do not leave it on unattended.

⛔ **"Less likely to get stuck" is not a property a strategy has universally, and that is MEASURED.** `always` is the
arm that never waits on PTR's `q` (M22 at 30958) and the arm that WALLS row 1 on `p` (it resets at 10 points, so
points never reach the 200 that b and g need); `gain>=2x` is the exact reverse (plan §18.2). So there is no safe
strategy to fall back to, and the watch carries an **ordered escalation list per feature with a way back**.

**The machine.** Each feature sits on a RUNG. Rung 0 is its own policy (whatever V2's precedence resolves to); rung
*i* is the *i*-th entry of its escalation list, which is a COMPLETE policy string — parameters and modifier included.

```
primary ──(the GAME is stalled AND this feature is the arbiter's pick)──▶ rung 1 ──(again)──▶ rung 2 …
   ▲                                                                        │
   ├──(progress resumed, and has held for the cool-off)──────────────────────┘
   └──(the player edits this feature by hand)────────────────────────────────┘
```

- **Stalled** is the tracker's word: `sinceLast ≥ K × typicalGap`. With no usable gap yet there is no threshold and
  nothing escalates.
- **One escalation per stall event.** After escalating, the watch will not escalate again until either progress
  resumes or the stall has lasted another whole `K × typicalGap` — a stall that outlives its own threshold twice is a
  second stall event. The others re-decide on the next tick.
- **Only a feature that is WAITING is a candidate**, and V1's reason codes decide it: the feature's last code must
  start `waiting:`. One that is acting, locked, off, yielding, blocked or has nothing affordable is left alone.
- ⛔ **…and it must have been waiting at least as long as the stall.** Measured, and the first cut without this test
  WRECKED PTR's opening: the opening's gaps are 9–15 game-seconds so the median puts the threshold at ~21–45, while a
  healthy opening has 100-second quiet stretches BY DESIGN (§14d.6). The watch fired 13 times in 9000 game-seconds,
  put `reset:p` on `always`, and the run reached only **M07 at 2672** where the shipped table reaches **M12 at 6718**.
  A feature that reset three seconds ago is not the cause of a 45-second game stall; `f.onSince` is V1's own clock for
  exactly that question.
- **The arbiter is V2's, reused, not a second one**: of the candidates, the highest **progress fraction** first, ties
  by registration order. A kind whose strategies declare no `progress` has no fraction and ranks last.
- **The cool-off is measured in TYPICAL GAPS, not in seconds** (⚖ minimize hardcoding: a number of seconds would be a
  constant with no meaning on a game nobody has measured). Once progress resumes, a feature returns to its primary
  after `cool × typicalGap` with the game still progressing.
- **A hand edit wins.** Any saved-policy or escalation-list write puts that feature straight back on rung 0.
- ⚠ **A feature the watch escalated onto a rule that ACTS stops climbing**, because its last code is then `acted:*`
  and it is no longer a candidate. That is the machine being right: a rescue that worked is not a stall.

**Its relationship to `stall>=Kx/N`.** The modifier watches ONE feature's own reset interval and fires ONE reset; the
watch watches the GAME and changes what a feature decides BY. Both may be on. ⛔ **The watch is upstream**: it sets
the policy string before the feature decides, and the rung is a COMPLETE string — so while a feature is escalated the
modifier in force is the RUNG's, not the saved one, and a rung with no modifier suspends `stall>=Kx/N` for as long as
the rescue lasts. `loader/watch.test.mjs` drives both directions.

**Precedence**, extending V2's:

| | wins over | what it is |
|---|---|---|
| the generic derivation | — | `defaultPolicy(kind, layer)` |
| the game's table | the derivation | `autoTable.policies[<id>]` |
| `--auto-opt policy:<id>=` | the table | a harness leg's or a sweep's pin |
| the player's saved choice | all of the above | `player.au.edits[<id>].policy` |
| **the stall watch's current rung** | the save | while it is escalated — that is what the option is FOR |
| a runtime override | everything | `setPolicy` — a measurement that named a configuration must measure it |

**Defaults, and where they live.** The option is OFF. With it on and **no list edited**, a feature's list is DERIVED:
the game's table `alternatives` where it names any, else every other strategy of the kind the table marks applicable
here, in the table's order, at each row's declared defaults. ⚠ A strategy row may declare **`escalate: false`** — the
two `off` rows do — because answering a stall by stopping is not an answer; it is a fact the TABLE states, so nothing
in the watch knows which rows they are (⚖ minimize hardcoding: no layer name, no per-game literal).

⛔ **NOTHING WAS ADDED TO `startData`, so no full-hash pin moved.** The player's watch settings live at a RESERVED
entry inside V2's one key — `player.au.edits['*']` — which does not exist until they switch something on, and a
feature's own list is `player.au.edits[<id>].escalate`, a second FIELD of the same per-feature object V2 shaped for
exactly this. `'*'` can never collide with a feature id (always `<kind>:<layer>`), and every reader of `edits` looks a
feature up by id. `gates-v3 --part 2` measures the `player.au` key set on a fresh boot and on the frontier fixture.

| setting | type | provisional default | what it is a proxy for (⚖ 13d.2) |
|---|---|---|---|
| `k` | factor | **`10`** — and MEASURED, not inherited from `stall>=Kx/N`'s 3 | ten times longer than this game's own progress has been taking is not a wait, it is a stall. ⛔ A game's gaps are HEAVY-TAILED — ptr's opening has a median of 7 game-seconds and 100-second quiet stretches by design — so a small multiple of the median lands inside normal play. Measured on ptr, both legs, watch on and nothing edited: **K=3** escalates the healthy opening 6× (M12 6718 → 6798) *and* reaches only M18 on the `q` stall; **K=6** escalates it once (6755); **K=10** escalates it **0** times and is byte-identical to the control, *and* breaks the `q` stall to **M20 at 26282** where the shipped default stops at M19 / 24607. Higher is better on BOTH legs, which is why this is a default rather than a question for R2 |
| `n` | count | `5` | short enough to follow a changing game, long enough that one unusual gap does not move the median — `stall>=Kx/N`'s N, for the same reason |
| `cool` | factor | `1` | one typical gap of renewed progress is by construction "the game is moving at its normal rate again", and it needs no constant in any game's own units |

Levers: `?autoOpt=watch=1` / `track=1` / `watchK=` / `watchN=` / `watchCool=` (and `--auto-opt` headless) outrank the
save, the way every other `autoOpt` does.

**The watch's own state words** are enumerated DATA (`tmtLoader.watchCodes()`): `watch:off`, `watch:armed`,
`watch:moving`, `watch:stalled`, `watch:cooling`, `watch:escalated`. ⛔ **They are NOT reason codes**, and the
distinction is deliberate: V1's vocabulary is the set of values a DECISION returns, and `gates-v1 --part 1 / --part 2`
define it that way (every code witnessed as a decision, `acted:*` ⇔ the feature acted). The watch decides nothing a
feature does — it changes what a feature decides BY — so its words have their own table and their own witness leg, and
V1's two gates go on meaning what they mean. What appears on a feature's ROW is CONTEXT: `explain()` gains
`escalation: {rung, of, list, typed, policy, primary, since, candidate, waitingFor}` and `policy.escalated`.

**Reading and writing it:** `tmtLoader.progress()`, `progressStats()`, `progressKeys()`, `progressMonitorState()`,
`watchState()`, `watchOptions()`, `watchParams()`, `watchCodes()`, `escalationList(id)`, `escalationState(id)`;
`setWatchOption(name, value)`, `setEscalation(id, list | null)`, `setEscalationStrategy(id, rung, strategyId)`,
`setEscalationParam(id, rung, name, value[, 'modifier'])`, `addEscalationRung(id[, strategyId])`,
`removeEscalationRung(id, rung)`, `moveEscalationRung(id, rung, dir)`, `rungChoices(id, rung)`. Each write returns
`{ok, error}` and ⛔ **a refusal changes nothing and says why** — V2's rule. ⚠ An empty TYPED list is honoured and
means *never escalate this feature*; clearing it with `setEscalation(id, null)` goes back to the derived one.

### Collapsible blocks in the Advanced view (V3)

⚖ **The user's words** (2026-09-19, queued as Q1): *"I also want to make each block in the advanced automation section
collapsible, and have an expand all / collapse all button."*

Every block has a fold press; the header has **expand all** and **collapse all**, which set every block including the
ones whose default is the other way. A collapsed block still shows its state chip and the one-line reason, and an
**ESCALATED** or **never fired** feature stays visible while collapsed — those are the two things a player must not
have to open 59 blocks to find.

- **The default is unchanged**: locked and excluded features are collapsed, everything else is open, so a first load
  after this change looks exactly like the one before it.
- ⛔ **The state is NOT in `player`.** `hashGame` excludes only the top-level `au`, so a per-feature fold map under
  `player.au` would move every pinned FULL hash in the repo — at **59 keys** on `the-omega-tree`, the widest Advanced
  view measured. It is `loader/layerlist.js`'s pattern reused verbatim: `T.storage.raw`, in the loader's own
  namespace (`tmt-loader:<id>:`), key `ui.au.collapsed`, **every read and every write wrapped** because storage can
  throw and can come back empty. In Node there is no `storage.raw` at all, so both calls are no-ops and a harness run
  cannot move which blocks a player has open.
- ⚠ **Two lists, not one** (`{open, closed}`), because the default is not uniform: a single "collapsed" list could not
  express *"I opened a locked one"*, and *collapse all* then *expand all* has to be reachable from any state.
- ⚠ **TRAP (ii) is what makes it non-trivial**: the Advanced tab re-renders every tick, so a fold state held in the
  rendered HTML string is gone on the next one. It lives in `tmtl-editors`'s component data, keyed by feature id,
  surviving every re-render the way `tmtl-number` holds its draft — and it is seeded from storage once, at `created`.
- ⚠ **A consequence, recorded rather than left to be found** (`docs/mobile.md`'s rule): the key is inside what
  *"clear this game's save"* clears, because that namespace IS what it clears. A cleared game comes back with today's
  defaults.
- The engines' hotkeys cannot fire from the new presses: every one carries `@keydown.stop`, as V2's do.

`tmtLoader.collapsePrefs()`, `collapsed(id)`, `setCollapsed(id, on | null)`, `setCollapsedAll(on)`.

## Reset the automation settings (V4b)

⚖ **The user's words** (2026-09-20): *"I want a tool to reset just the automation settings to the defaults, without
resetting all of the game data."* The second half is the requirement, and it is exactly what `hashGame` already
means — it excludes `player.au` and `player.subtabs.au`, so the press **cannot** move the game.

At the BOTTOM of the `Advanced` view, under every block, because it is the one control there that cannot be undone.
**Two presses:** the first only EXPLAINS — it lists what goes, COUNTS what this save actually has to lose, and points
at the narrow tool that already exists — and the second acts.

**What it clears** (`tmtLoader.resetClears()`, which is the same data the confirm renders, so the words cannot drift
from what the function does): which features are switched on · the arming setting · every strategy, value, pause,
stop and priority you have edited · the stall watch's option and every escalation list · any override a measurement
left running.

⛔ **IT SPANS BOTH STORES, and a tool that cleared only the save would read as a bug.** The SAVE half is
`player.au.edits` (including the reserved entry `edits['*']` — the watch's own settings, which is found by a key
walk and by *nothing else*, since every other reader looks a feature up BY ID), `player.au.features`,
`armLocked` and `disclosed`. The half OUTSIDE `player` is `setPolicy`'s overrides, `setFeatureEnabled`'s, V4's
`setControl`'s, the watch's escalation rungs, the progress tracker, and V2's `rate-peak` / stall memory — a feature
the watch has ESCALATED would otherwise go on running a policy nothing on screen names.

**What it does NOT touch**, each for a reason:

- the ENGINE's own per-layer stores inside `player.au` (`points`, `best`, `clickables`, `upgrades`, …). They are the
  engine's, not the loader's. ⚠ **This is why the gate compares the LOADER's four keys against a fresh boot's and
  the engine's against what they were the instant before the press** — measured on 2.7, which writes `best` and
  `resetTime` into every side layer on EVERY TICK, so "the whole key equals a fresh boot's" is false there and a
  press that made it true would be resetting game data;
- `lastReset` / `loopNo` / `ranAt` / `stats` in the runtime record — the RUN's history, not a setting, and present in
  a fresh record too;
- the per-browser fold map (`tmt-loader:<id>:ui.au.collapsed`). A view preference, not in the save, and the press
  says so.

⚠ **The footgun is named rather than smoothed.** A player who switched twelve features on to work around one bad
strategy loses all twelve. The confirm says how many, and points at V2's per-feature **use the default**, which is
one feature and one press.

`tmtLoader.resetAutomation()` returns `{ok, cleared, error}`; `cleared` COUNTS what it removed, so a press that found
nothing says so instead of claiming to have done something.

### The reason vocabulary

⛔ **A reason is the decision's own return value, never a second opinion about it.** Each kind's decision path yields
`{act, code, values}` and the feature keeps the last one in `f.last`; the boolean the caller needs is `.act`. An
explainer that re-derived "why it did not act" from the predicates would be a second implementation of them, free to
disagree with the decision it describes, with nothing able to notice.

The vocabulary is **data** — one enumerated table in `loader/tmt-auto.js`, readable at runtime as
`tmtLoader.reasonCodes()`: code → the template its text is built from, the `values` keys that template consumes, and
`quantities`, the subset of those that goes through the GAME's own `format()`. (An id is not a quantity: running
every value through `format()` printed *"the cheapest upgrade is 21.00 at 20.00"*.) **No value is free text.**

⚖ **(R3b) A row may also declare `demand`** — which ONE of its `values` names the layer this decision is waiting
ON. It is not a second vocabulary and not a second reading of the decision; it is one more declaration on a row that
already carries the values it compared, and it is what lets the ROW CYCLE hand the turn to "whoever is waited on"
with no layer name and no game anywhere in the loader. Three rows declare one today (`blocked:after` → `sibling`,
`waiting:retry` → `layer`, `waiting:milestone` → `layer`), `reasonCodes()` publishes it, and a new code that
declares one is a new demand signal with no change to the cycle at all.

| code | when |
|---|---|
| `locked` | the feature's own `unlocked()` is false and it is not armed |
| `armed` | saved on while still locked — it waits, and starts by itself at the unlock |
| `off` | unlocked and not running (saved off, a runtime override, or the profile) |
| `off:policy` | the kind's policy is literally `off` (`challenges`, `clickables`) |
| `off:excluded` | the table's `off` map — the feature is never registered; this code appears only on `explain()`'s own row for it |
| `blocked:gate` | the `while` predicate in force is false — a PAUSE, not a stop. The text names the OWNER (the game's table / yours / derived / a runtime setting), because the slot has four possible sources |
| `blocked:predicate` | (V4) a `while` or `until` predicate could not be EVALUATED — it did not compile, or it threw. ⛔ A separate code on purpose: `holds()` turns a throw into `false`, which reads exactly like a condition legitimately not met. The message itself is in the feature's block (`controlState(id)`), because this table takes no free-text value |
| `stopped:until` | (V4) the feature's `until` predicate has held; it stays stopped until the player re-arms it, with the game-second it latched |
| `blocked:after` | an `unlockOrder` sibling is not unlocked yet |
| `blocked:enter` / `blocked:exit` | the engine refuses to enter / to leave that challenge |
| `yielding:native` | `tmp[l].autoPrestige` — the game's own auto-reset is doing it |
| `cannot-reset` | `tmp[l].canReset` is false, with the two numbers the engine compared |
| `in-challenge` | a challenge is active and not completable yet — and with no `give-up` modifier this is the WHOLE of what a feature inside a challenge can say, which is why a run could sit inside PTR's H12 for 11,878 game-seconds without the readout changing |
| `waiting:progress` | (R3a) the `give-up@B/H/Rx` modifier: how far this attempt has come as a percentage of the challenge's own goal, what fraction of the remaining distance a window must close, and how much of `H` has gone by |
| `acted:challenge-give-up` | (R3a) it LEFT a challenge without completing it, with the percentage it reached |
| `waiting:retry` | (R3a) that challenge was given up, and the layer it belongs to is not yet `R×` as strong as it was when the attempt began |
| `paused:in-challenge` | (R3a) a `while` or an `until` is stopping this feature while the game is INSIDE a challenge it entered. It names the challenge and which of the two controls did it, because a pause does not leave a challenge and the run is stranded until the player clears the condition |
| `waiting:gain` / `waiting:gain-x` | the `gain>=N` / `gain>=Nx` threshold, with the gain and what it needs |
| `waiting:gain-unit` | `gain>=Nx-unit` while the layer holds **less than one** of its own resource: the bar is N of the resource, not N× nothing. A SEPARATE code, because the two bars are different questions and a reader has to be able to tell which one is refusing |
| `waiting:interval` | seconds elapsed of the interval |
| `waiting:milestone` | `keepsUpgrades`' milestone, or the milestone that would grant a toggle |
| `waiting:purchase` | `unlocks-purchase`: the points after the reset still afford nothing |
| `waiting:turn` | (R3b) the ROW CYCLE: the engine would allow this reset and it is another member's turn. It names whose turn it is, how much of that turn is left and what this member's own turn is worth. ⚠ Reported ONLY where the engine says yes — a member that could not reset anyway keeps `cannot-reset` |
| `waiting:when` | no clickable of the layer is unlocked, clickable and `when`-true |
| `holding:reserve` | a `reserve>=…` holds the purchase, with what is held and the reserve |
| `holding:saving` | `buy-unless-saving`, with the upgrade it is saving for and its cost |
| `nothing-affordable` | there were candidates; the cheapest one and its cost |
| `nothing-to-do` | there was no candidate at all (everything owned, every challenge at its limit, nothing unlocked) |
| `acted:reset` · `acted:upgrades` · `acted:buyables` · `acted:toggles` · `acted:challenge-enter` · `acted:challenge-exit` · `acted:clickables` | it acted — one code per kind, so acting is as enumerable as every refusal |
| `unknown` | an exit no code names. **A gate failure, never a display string.** |

⚠ **Which two numbers a refused reset shows**, measured: a **static** layer's `canReset` compares `baseAmount`
against **`nextAt`**, not `requires` (ptr `js/game.js:116-119`, something `js/game.js:121-124`). `requires` is the
FIRST threshold and stops moving, so showing it read *"Cannot reset — 458.60 of 200.00"* while the engine was
refusing. A **normal** layer compares against `requires`. Where a layer declares its own `canReset()` (2.7 allows it;
a `custom` layer ends there) neither number is the criterion and the pair is indicative. ⛑ The decision always reads
`tmp[l].canReset`, the engine's own answer, so a wrong pair can mislead a reader and never move a game.

### `tmtLoader.explain()` — headless first

The page renders this; it does not compute its own. One row per registered feature, in the order the tab draws them,
plus one per feature the table excluded:

```js
{ id, title, layer, kind,
  state: 'on' | 'off' | 'armed' | 'locked' | 'excluded',
  policy: { inForce, table, derived, alternatives: [], saved, runtime, base, escalated, strategy, params, modifier },
  last: { code, text, values, tick, at } | null,
  stall, turn, escalation, control,
  acted, lastActedAt, neverFired, eligibleFor, gate, after, provenance }
```

⚠ `stall`, `turn`, `escalation` and `control` are the per-modifier / per-mechanism READOUTS, and each is `null`
unless that mechanism is in force for this feature — `stall` for `stall>=Kx/N`, `turn` for the ROW CYCLE,
`escalation` for the stall watch, `control` for `while` / `until` / `priority`. A readout belongs to its own table
ROW: before R3a, `stallState` answered for ANY feature carrying ANY modifier and told a `challenges` feature that
there had been *"no reset by this feature's own rule yet"*.

`run.mjs --explain` dumps it at the stop (`R.explain`). Every reason in the tab is therefore testable in Node with no
browser, and "what the page renders equals what the API returns" is a comparison rather than two implementations
hoping to agree.

**`neverFired`** = on, unlocked and still never acted, for at least N GAME-SECONDS. ⚠ Game-seconds, not loops: a loop
count means different things at diff 0.05 and diff 1, so the same flag would fire at 150 game-s in a census run and
3000 in a ladder leg. The default **3000 game-seconds** is justified against the rarest ACTING feature this repo has
measured — R1′'s `reset:sb` fired 13 times over a 24179 game-second leg, about one action per 1860 s, so anything
under that flags a feature that is working. `?autoOpt=neverFiredSeconds=<n>` moves it.

### What it costs — a counter, not a stopwatch

A leg is ~13.5 ms/tick and the harness runs hundreds of thousands of ticks, so `f.last` holds a **code and raw
numbers**; formatting happens on READ. `tmtLoader.explainStats()` returns `{decisions, formats, texts, codes}`, where
`codes` is a census of the whole RUN (a code seen for four hundred ticks and then replaced still counts — which is
the only way "witnessed" can mean anything) and `formats` is every number this code turned into text.
**Measured over the M15 → M16 leg: 634,218 decisions, 0 formats, 0 texts.** A headless run that never opens the tab
must format NOT ONCE; an absolute zero is not something a mutant can satisfy by moving both sides of a comparison.

`f.last` lives **outside `player` and outside `runtimeState()`** — it is a readout, recomputed next tick, and
recording it in `runtimeState` would change the `runtime` block of every committed snapshot.

⚠ **Everything the tab renders is escaped** (`tmtLoader.escapeText`): `display-text` is `v-html` in both engines, and
a `provenance` line, an `off` reason and a gate predicate are author-written text while a layer's `name` and a
feature's title are the GAME's.

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
a store the save already carries. ⚠ **Since V1 it IS in the layer's `startData`, seeded `false`** (⚖ user, 2026-09-19,
plan §15d.2: *"Yes, seed it"*). U4 kept it out so that a setting nobody had touched moved no recorded hash, and U6
measured what that cost — the reactivity bug below, routed around by owning `toggleAuto`'s click path. With the key
present from the first boot there is nothing for Vue to observe late. It cost exactly one re-record of
`gates-p1a --part 0`'s FULL-hash pin (`63f28e099536a119` → `11826e775e6f88d8`, `docs/contract.md`), carrying V1's
other full-hash cause — the au tab's new `player.subtabs.au` — in the same move. `hashGame` did not move.

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

**U6's fix owned the click path** — `toggleAuto` wrapped for exactly `['au', 'armLocked']`, routed through
`armLocked(on)`, whose `Vue.set` both creates the key and notifies `player.au`'s observer. It existed because the
other route cost a pin, and V1 paid that pin: **⚖ the key is seeded into `startData` now, and the wrapper is gone.**
With the key present from the first boot there is nothing for Vue to observe LATE, so the engines' own plain
assignment is seen on every one of the 171, and the button reaches the engine's own `toggleAuto` unwrapped, like
every other toggle in every game. `tmtLoader.armLocked(on)` survives for programmatic callers (the harness, a gate).

⛔ **Removed BY MEASUREMENT, both halves, because a wrapper removed on reasoning is a wrapper removed on hope.**
(i) With the key seeded and no wrapper, `gates-a1 --part 2`'s arming legs are green on **both** engine families —
ptr (plain assign) and something (`Vue.set`) — including the leg that asserts the button's rendered TEXT changes on
the press, which is the one that caught U6's bug. (ii) The mutant **"unseeded AND unwrapped"** is RED on ptr: that
is U6's original bug, so the leg can still see the thing it exists for. A green mutant there would have meant the
removal was untested rather than tested.

⚠ **That the wrapper COULD be reached at all was a census, not an assumption** — and the census stays, because it is
also what says the seeded key is enough: — it depends on `toggleAuto` being a
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

## Editing, precedence, and the save (V2)

⚖ **Choices live in the SAVE** (user, 2026-09-19). One new key, seeded in the `au` layer's `startData`:

```js
player.au.edits = { '<featureId>': { policy: '<the strategy string>' }, … }   // {} on every boot
```

⛔ **ONE key, and a NESTED object on purpose.** The next editing slice's `until`, `priority` and `maxActions` join as
further fields of the SAME per-feature entry, so this slice's ⚖-granted full-hash re-record is the only one the
editing arc needs; a flat `player.au.policies` beside a later `player.au.until` would have cost one re-record per
field. ⚠ It is **seeded** because Vue 2 cannot observe a property ADDED to an object after creation and 22 of the 171
engines assign plainly (U6, measured); `derive()` runs before `addLayer`, so the key exists from the first boot and
the per-feature entries are written with `Vue.set`. Measured on an OLD snapshot written before V2
(`gates-v2 --part 5`): the engines' own `fixSave` / `fixData` add the nested `edits: {}` exactly as they add a flat
field, and `hashGame` is unmoved.

**Precedence, in one place** — `f.policy` is a GETTER over it, so the tab and the decision path cannot disagree:

| | wins over | what it is |
|---|---|---|
| the generic derivation | — | `defaultPolicy(kind, layer)` |
| the game's table | the derivation | `autoTable.policies[<id>]` |
| `--auto-opt policy:<id>=` | the table | how a harness leg or a sweep pins a configuration for a whole run (applied at registration) |
| **the player's saved choice** | all of the above | `player.au.edits[<id>].policy` |
| **a runtime override** | everything | `tmtLoader.setPolicy(id, policy)` — the A/B lever and the planner's committed epoch. `setPolicy(id, null)` gives the feature back to the save |

⚠ **A saved policy this build cannot validate is IGNORED, not run** — a save written by a later version, or by hand,
falls back to the default rather than reaching the decision path.

⛔ **A pinned harness run is unmoved BY CONSTRUCTION**, not by a rule: its snapshots carry no `edits` entries, so the
middle term is empty and `f.policy` is what it has always been. `?profile=all` does **not** change that: a profile
says which features RUN, never which strategy they run — so a player who switches to `all` to watch everything keeps
their tuning, and the harness's `--profile all` legs are unaffected because their fixtures have nothing saved.

**Writing a choice** (what the components call, and what a gate can call headlessly):
`tmtLoader.setSavedPolicy(id, policy | null)`, `tmtLoader.setSavedStrategy(id, strategyId)` (keeps the modifier),
`tmtLoader.setSavedParam(id, name, value[, 'modifier'])`, `tmtLoader.setSavedModifier(id, modifierId | null)`,
`tmtLoader.savedPolicy(id)`. Each returns `{ok, policy, error}`. ⛔ **A refusal changes nothing and says why** — a
value the strategy cannot parse leaves the previous one in force and the field shows the reason; it is never silently
dropped.

## The per-feature CONTROLS — `while`, `until` and `priority` (V4)

⚖ **The user's request, verbatim** (2026-09-15, plan §13): *"an option to stop doing the resets after a specific
amount of the currency has been earned"*. §13b asks for it on EVERY kind, latching, with a manual re-arm, plus a
`priority` per feature overriding the kind order.

Three fields per feature, beside `policy` in the same `player.au.edits[<id>]` object (V2 reserved exactly this, so
there is no further ⚖ full-hash re-record). **All three are empty by default and every game behaves exactly as it
did without them.**

| control | type | what it does |
|---|---|---|
| **`while`** | `predicate` | the feature acts only while the predicate holds, and carries on the moment it is true again — a **PAUSE**. Reason `blocked:gate` |
| **`until`** | `predicate` | once the predicate has held, the feature stops acting and **STAYS stopped** even if it goes false again, until the player presses *re-arm* — a **STOP**. Reason `stopped:until`; the latch is `player.au.edits[<id>].untilHit`, the game-second it first held |
| **`priority`** | `count` | which of this **LAYER's** features acts first in a tick; 1 goes first, ties keep the kind order |

⛔ **`while` IS the table's `gates` slot, and there is only one of them.** The pause has been in the loader since S1
(`autoTable.gates`, reason `blocked:gate`) and no table on the roster had ever carried an entry — plan §26 measured
that ONE `gates` line breaks PTR's M21 wall, which is how this slice learned that what M21 needed was a pause and
not a latching stop. So a player's `while` and a game's gate are the same slot under one precedence, rather than two
mechanisms that would eventually disagree:

| | wins over | what it is |
|---|---|---|
| the generic derivation | — | nothing derives one today — plan §27 records the rule that was measured and why it is not a default |
| the game's table | the derivation | `autoTable.gates[<id>]` (`while` only), and `--auto-opt while:/until:/priority:<id>=` for a harness leg or a sweep |
| **the player's saved edit** | the table | `player.au.edits[<id>].while / .until / .priority` |
| **a runtime override** | everything | `tmtLoader.setControl(id, name, value)` — never saved, rides in `runtimeState()` |

⚠ **It does NOT pass through the stall watch's rung**, and that is V3 §21.8's own answer: the rung replaces a
POLICY, and these are not policies — a feature the watch has escalated still has the player's pause and stop.
⚠ **`null` means NOT SET and falls through; `''` means SET TO NONE and does not** — which is how a player removes a
gate the game's table shipped, rather than being stuck with it.

**The predicate language is the one the table and the ladder already share** — a JavaScript EXPRESSION over the
engine's globals, compiled with `tmtLoader.predicate` in the page's own scope: `hasMilestone('q', 4)`,
`player.h.unlocked`, `player.points.gte('1e300')`. Four rules, each with its own leg in `loader/controls.test.mjs`:

1. **Compiled once, against its SOURCE** — never per tick. The cache key is the source string itself, because the
   source can change under the reader (an edit, a load, a runtime override) and a generation counter is one more
   thing to forget to bump.
2. **A refusal changes nothing and SAYS why.** A predicate that will not compile leaves the previous value in force
   and the field shows the reason — V2's rule for a refused value, and a save this build cannot validate is IGNORED
   rather than run.
3. **A run-time throw is contained to its own feature** and is NOT reported as `false`. `holds()` turns a throw into
   `false`, which reads exactly like a condition that is merely not met; `blocked:predicate` is the difference, and
   the engine's own message is in the block.
4. **Everything typed is escaped** (`escapeText`) wherever the block renders it — the tab is `v-html`.

⛔ **It is `new Function` over text from a SAVE.** `docs/contract.md` says exactly what that widens (one more source
for a mechanism the table, the URL and the harness have all had since S1) and what it does not (the reach is
`T.predicate`'s: an expression, in the page's scope, evaluated inside `automate()` on a feature the player switched
on, never at load).

**Helpers, not a second language.** Beside each predicate box is a pick-list of the predicates the ENGINE can name
for that feature — "this layer's own resource ≥ N", "milestone k of layer L held", "layer L is unlocked" — built
from the game's own layer and milestone ids (⚖ minimize hardcoding: no per-game list anywhere). Picking one WRITES
the predicate text into the box, where it stays fully editable.

### `priority` — and what "within a layer's tick" means

An unedited feature's priority is **its kind's 1-based place in THIS game's kind order** (the table's `kindOrder`,
`--auto-opt kindOrder=`, or the generic one). So "nothing edited ⇒ byte-identical" is a property of the code rather
than a rule somebody has to keep: with nothing edited the loader returns the registration order — layer order × kind
order — as it stands, and allocates nothing.

⛔ **It cannot reach across layers, and the doc says so rather than implying otherwise.** The ENGINE decides in what
order layers run: `gameLoop` walks `layers`, and TMT 2.2.1 skips a layer the player has not unlocked (which is why
the `au` layer has a fallback pass at all). PTR's Extra Time Capsules are paid in **Boosters**, so `buyables:t` and
`buyables:b` really do compete for one currency across two layers — and no number here can order them. What
`priority` orders is one layer's own features inside its own `automate()`. A cross-layer reserve is the shared
purchase-CURRENCY reader (plan §24.11 item 3), which is a different thing and still owed.

The case it is for is V1's own readout: an `upgrades` feature taking the currency a `buyables` feature was holding
under a reserve. Put the buyables first and the reserve is respected.

⚠ **Re-arming a condition that is still REACHABLE re-latches, and that is right.** `until` is a latch on the
CONDITION, not a one-shot switch: re-arm `stop resetting p once 30 prestige points have been earned` and the feature
runs until 30 have been earned again. Measured (gate V4-3): after the press the feature acted 8 times and the latch
moved 358 s → 595 s. If the intent is "stop for good", clear the condition instead of re-arming it.

⚠ **A latch whose condition has GONE is disarmed.** If the `until` in force disappears — the player cleared it, or a
harness leg set it through the TABLE's slot and the next process is not given that slot — the stop lifts. A latch
with nothing on screen explaining it would be a feature that had silently died.

**Two examples worth having**, both measured in this arc:

- **PTR's M21 wall** (plan §24.7 / §26): a `q` reset wipes row 2 and Time Energy with it, so the policy that farms
  quirks fastest is the one that never lets TE reach the 1e30 `h` needs. `while: "!hasMilestone('q',4) || player.h.unlocked"` on
  `reset:q` — *pause once q milestone 4 holds, until h is unlocked* — makes M21 and M22 a sequence again. It is the
  entry `games-auto/ptr.js` now ships.
- **`always` on a deep NORMAL layer is a trap a player can pick from the V2 picker today** (measured by the planner,
  2026-09-20): forced onto PTR's `reset:h`, it reaches 38 hindrance spirit and then freezes quirks at 10 total —
  `reset:q` reads *"Cannot reset — 1.42e336 of 1.00e512"* — because every `h` reset wipes row 2 as well, `h`'s
  requirement is fixed and cheap while `q`'s is neither, so the cheap reset starves the dear one for ever. The user
  hit exactly this by hand. A `while` on `reset:h` is the shape that fixes it.

Read and write them: `tmtLoader.controls()` (the table as data), `controlState(id)`, `savedControl(id, name)`,
`setSavedControl(id, name, value | null)`, `setControl(id, name, value | null)`, `rearm(id)`,
`predicateHelpers(id)`. Each write returns `{ok, value, error}`. ⚠ Clearing `until` disarms its latch, and CHANGING
it re-arms — a stop belongs to the condition that set it.


## Derivation

After the game's scripts (and the table), `tmt-auto.js` walks `layers`. For every **tree layer** — a numeric `row`, not a
layer the loader added — it registers, in **layer order** (row ascending, then the order of the `layers` keys) × **kind
order**:

| Kind | Feature id | Registered when the layer declares | Default policy (no table entry) | `unlocked()` |
|---|---|---|---|---|
| `toggles` | `toggles:<l>` | a milestone with `toggles: [[layer, field], …]` | `on` | `player[l].unlocked` |
| `upgrades` | `upgrades:<l>` | numeric ids in `upgrades` | `cheapest-first`; `order-then-cheapest` when the table gives `order` | `player[l].unlocked` |
| `buyables` | `buyables:<l>` | numeric ids in `buyables` | `buy` | `player[l].unlocked` |
| `challenges` | `challenges:<l>` | numeric ids in `challenges` | `off`; **`sequential\|give-up@0.1/30/2x`** when the table gives `order` (R3a — see below) | `player[l].unlocked` |
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

⚠ **R2 re-examined that default and kept it, for a reason worth knowing: on an EMPTY purse `gain>=2x` IS `always`**
(`N × 0 = 0`), which is what makes it safe as a default — it can never refuse a layer its first reset, and on PTR's
`reset:p` a rule that does refuse one is a deadlock (measured: zero resets in 8,000 game-seconds). The same
property is what makes it a poor TABLE entry for a deep layer whose first reset wipes a row that has been
accumulating for hours. `gain>=Nx-unit` is that case's strategy and is chosen per layer, never derived.

Upgrades with a `pseudoUnl` (Prestige Tree's pseudo-upgrades) are never bought. Milestone toggles in the 2.2.1 `'multi'`
form (`{layer, varName, options}`, a string it cycles) are skipped and counted (`tmtLoader.autoDerivation.multiTogglesSkipped`).

## Kinds and policies

### The strategy table — ONE source (V2)

Before V2 a policy was written down three times: a hand-written validator regex per kind, a hand-written
`policyTemplates` list, and the knowledge (in whatever UI wanted it) that `gain>=Nx` takes a number. Three spellings
of one fact is how they drift. Since V2 a **strategy is one row of DATA** in `loader/tmt-auto.js` and everything else
is derived from it — the validator regex, the enumerable alphabet, the picker's list, the parameter editors and the
help the tab shows. ⚖ *minimize hardcoding*: **a new strategy is one table entry and no UI code at all.**

A row declares `kind`, a `template` with `{param}` placeholders (`gain>={n}x`), a `label`, a one-sentence `help` in
the player's terms, its `params`, and — where it applies — the layer types it can ever fire on with the `why` when it
cannot, or a `needs(f)` saying what this feature lacks. The row's **id** is its template with every placeholder
replaced by that parameter's letter (`gain>=Nx`), which is what `policyTemplates` lists and what the picker and the
save name a strategy by.

⛔ **A parameter's value is always the RAW STRING.** `format(parse(s)) === s` is then exact by construction rather
than by luck: `Number('10.0')` prints `10` and `new Decimal('1e600')` prints `1e+600`, so a table that stored typed
values could not round-trip its own strings. The decision path converts at the point of use — which is also where the
game's own big-number type belongs, since a `quantity` spans the whole Decimal range and `1e600` is a real threshold
at the PTR frontier.

| parameter type | accepts | used by |
|---|---|---|
| `count` | a whole number | the stall modifier's window `N` |
| `seconds` | a number of GAME-seconds | `interval>=T`, `rate-peak`'s hold |
| `factor` | a number (a dimensionless multiple) | `gain>=Nx`, the stall modifier's `K` |
| `fraction` | a number in **0 … 1** | `rate-peak`'s value buffer |
| `quantity` | the whole Decimal range, exponent and all | `gain>=N`, `reserve>=N` |
| `predicate` | (V4) a JavaScript EXPRESSION — validated by a `check` FUNCTION, not a grammar, because "is this an expression?" is not a regular language. ⛔ It declares `re: null` and a strategy TEMPLATE that named one THROWS at load: a predicate may contain `|`, which is the modifier separator, and any bracket or quote there is | the per-feature CONTROLS below |

⛔ **A policy is valid when the grammar AND the declared bounds accept it**, both from the same row. The first cut
checked only the grammar and `rate-peak@2/0` sailed through — a value buffer of 2 puts the threshold at
`best × (1 − 2)`, a NEGATIVE rate no rate can ever be under, so the strategy would have been selectable, spelled
correctly and silently incapable of ever firing. A bound a row declares and nothing enforces is documentation, not a
guard.

Read it at runtime: `tmtLoader.strategies([kind])`, `tmtLoader.modifiers([kind])`, `tmtLoader.paramTypes()`,
`tmtLoader.policyTemplates`, `tmtLoader.parsePolicy(kind, s)`, `tmtLoader.formatPolicy(kind, parsed)`,
`tmtLoader.defaultPolicyString(kind, id)`, `tmtLoader.checkParam(kind, id, name, value)`,
`tmtLoader.policyOk(kind, s)` and `tmtLoader.strategyChoices(featureId)` — the last says, per feature, whether each
strategy is available and **why not**. The whole table is byte-identical on every game (measured on ptr and
something, `gates-v2 --part 1`): the strategies are generic, so no game can have its own.

### MODIFIERS: a strategy that rides on another one

A policy may carry **one modifier**, appended with `|`: `gain>=2x|stall>=3x/5`, `sequential|give-up@0.1/30/2x`,
`gain>=2|turn@20/3x/5`. There are **four** today — `stall>=Kx/N`, `turn@W/Kx/N` and `turn-demand@W/Kx/N` on `reset`,
and `give-up@B/H/Rx` on `challenges`, all below — and the grammar, the validator and the editors took every one of
them from one more table row and no code at all (⚖ minimize hardcoding: `T.modifiers(kind)` is what the Advanced
view renders, so a modifier on a new kind needs no new `tmtl-*` component and `componentNames` does not move).

⚠ **The modifiers do not all compose the same way, and the row says which is which.** `stall>=Kx/N` and
`give-up@B/H/Rx` ride on a REFUSAL: the primary still decides, and the modifier only speaks once the primary has
said no. The two cycle modifiers do the opposite — they take the decision AWAY from the primary while their row's
cycle is live. A modifier's `readout` names the block that describes it (`stall`, `turn`), which is how
`T.stallState()` and `T.turnState()` stay honest about a feature carrying the other one.

⛔ **ONE modifier per policy**, because `|` cuts a policy string once. So a cycle member cannot also carry the
stall fallback — and it should not want to: the turn IS the patience, and the stall fallback is a second arbiter
for the same refusal.

| Kind | Policy | What it does each tick |
|---|---|---|
| `reset` | `always` | `doReset(l)` whenever `tmp[l].canReset` |
| | `gain>=N` | … when `tmp[l].resetGain ≥ N` (N is a quantity, not a count: the advanced planner derives it from the target it is resetting FOR, so it spans the Decimal range) |
| | `gain>=Nx` | … when `tmp[l].resetGain ≥ N × player[l].points` (dimensionless: "the reset at least doubles/quadruples what I hold") |
| | **`gain>=Nx-unit`** | the same, with the purse floored at ONE unit of the layer's own resource: `resetGain ≥ N × max(player[l].points, 1)`. Identical to `gain>=Nx` at every purse of one or more — the only case it changes is the one that had no content. See below |
| | `interval>=T` | … when at least T of `player.timePlayed` passed since this feature's last reset (runtime memory, not saved) |
| | `keepsUpgrades` | … only while `hasMilestone(keep.layer, keep.id)` holds (a post-milestone policy: it never starts the layer) |
| | `unlocks-purchase` | … only when `player[l].points + tmp[l].resetGain` affords the cheapest unowned, unlocked upgrade of `l`, or the next level of one of its unlocked buyables — both only where costed in the layer's own points (no `currencyInternalName` / `currencyLocation` / `currencyLayer`); else wait |
| | **`rate-peak@B/H`** | the currency-per-second optimum, with no threshold in the layer's own units. `rate = tmp[l].resetGain / (game-seconds since this feature's own last reset)`, `best` = the highest rate since that reset; reset once `(gain + 1) / elapsed < best × (1 − B)` has held **continuously** for `H` game-seconds. See below |
| | **`… \| stall>=Kx/N`** (a MODIFIER) | on top of any of the above: if the primary rule has been waiting `K ×` as long as this feature's own resets usually take, reset anyway — but only the stalled feature closest to its target goes first. See below |
| | **`… \| turn@W/Kx/N`** (a MODIFIER) | the ROW CYCLE: reset only while it is this layer's turn among the resets of its ROW, and take `W` resets per turn. Out of turn the reason is `waiting:turn`; IN turn the member still follows its own rule, and gives the turn up at once if that rule says no while the engine would allow. See below |
| | **`… \| turn-demand@W/Kx/N`** (a MODIFIER) | the same, plus: whenever a decision NAMES a member's layer as what it is waiting on, that member gets the next turn. See below |
| `upgrades` | `cheapest-first` | buys unlocked, unowned, affordable upgrades, cheapest `tmp` cost first (ties by id) |
| | `order` | only the table's `order[]`, in that order |
| | `order-then-cheapest` | the table's `order[]` first (each affordable one, in order), then `cheapest-first` over the upgrades not in it |
| `buyables` | *(before any policy)* | ⛔ **a buyable the GAME declares it autobuys is SKIPPED**, with the reason `yielding:native` — the same sentence `reset` has said about `tmp[l].autoPrestige` since A1. The condition is `tmp[l].buyables[id].autoed` (truthy), which 2.7 evaluates from the buyable's own `autoed()`; **16 of 171** games' sources carry the word (bounded text grep over `games/*/`, 2026-09-20) and a game without it is unaffected, since `undefined` is falsy. ⚠ TRUTHY, not `=== true`: `autoed()` is the game's expression and a fork returning `1` or a Decimal means yes. Measured (R2, gate R2-3b): after PTR's q milestone 1 turns on `player.e.auto` / `player.t.autoExt`, `buyables:e` was already acting 0 times and `buyables:t` acted **32** times on top of the game's own reserve-less `buyMax()` — a double-buy that moved no mark, so the row that sees it is a BUY COUNT |
| `buyables` | `buy` | each unlocked buyable (id order, or `order[]`): `buyBuyable` until the amount stops moving — what a click does, paying the cost |
| | `buyMax` | the engine's `buyMaxBuyable` where the buyable defines `buyMax`, else as `buy` |
| | `highest-first` | as `buy`, over the ids descending (PTR's own Space Building autobuyer order), unless `order[]` is given |
| | `buy-unless-saving` | as `buy`, but nothing while the layer has an unlocked, unowned upgrade costed in its own points that costs more than the points held |
| | `reserve>=N` | as `buy`, but nothing while the layer holds no more than **N** of its own points — an explicit reserve where `buy-unless-saving` derives one. The layer's points is the one currency a generic reserve can read, so a buyable costed in another layer's currency is still gated on this layer's points. Added for the advanced planner, which sets N to the threshold it is protecting (`docs/planner.md`) |
| | `reserve>=next-upgrade` | as `reserve>=N` with **N read from the game**: the cost of the cheapest unowned, unlocked upgrade of the layer costed in the layer's own points (`tmp[l].upgrades[id].cost`), re-read every tick; no such upgrade = no reserve. The generic form of "save for the upgrade, spend the surplus" — unlike `buy-unless-saving`, which stops buying altogether while any own-currency upgrade costs more than is held. ⚖ minimize hardcoding: the number is never in the table (R1′, PTR `buyables:e`) |
| `toggles` | `on` | for each held milestone (`hasMilestone(l, id)`) that declares `toggles`, sets every `player[layer][field]` that is `false` to `true` — what the game's toggle button does. The milestone only UNLOCKS the button; the field stays false until clicked |
| `challenges` | `sequential` | the first challenge in `order[]` (else id order) that is unlocked with completions below `completionLimit` (default 1): enter it with `startChallenge` when none of the layer's challenges is active; while it is active, exit-and-complete with `startChallenge` once `canCompleteChallenge` holds (and `canExitChallenge` where the engine has it). A challenge the player entered by hand is left alone. Enters / exits / give-ups are counted in `hookStats().challenges` |
| | **`… \| give-up@B/H/Rx`** (a MODIFIER) | on top of `sequential`: leave a challenge that has stopped closing the distance to its goal, and do not try it again until the layer is `R×` stronger than it was at the failed attempt. See below |
| | `off` | nothing |
| `clickables` | `when` | for each `{id, when}` the table lists for the layer: `clickClickable(l, id)` when the clickable is unlocked, `canClick`, and `when` holds |
| | `off` | nothing |

### `rate-peak@B/H` — the currency-per-second optimum (V2)

⛔ **It is what `gain>=Nx` cannot do.** The ratio rule fails wherever the bar rises with every reset while the gain
does not: PTR's `q` gains 2 Quirks a reset and its `2× held` grows geometrically, so from `all/M16.json` the derived
default stalls at M19 (24607) and reads *"Waiting — gain 2.00 of 6.00 (2× the 3.00 held)"* for the remaining ~11,500
game-seconds (plan §17, the user's own report). `rate-peak` asks the only question that needs no literal in the
layer's own units: **is the currency-per-second of this cycle still rising?** The `+ 1` is a one-unit lookahead — for
a large gain it vanishes and the rule is "the average has peaked"; for a small integer gain it is what stops the rule
waiting for a step that is not coming.

⚖ **Two parameters, both the user's** (2026-09-19): *"The strategy shouldn't be to reset immediately after the gain
per second starts going down. There should be an editable buffer."* and then *"Actually, I meant a time buffer, not a
value buffer. Maybe we should have both. A time buffer meaning don't reset until the value has stayed below the
threshold for that long."*

| | meaning | provisional default | what it is a proxy for (⚖ 13d.2) |
|---|---|---|---|
| `B` | the VALUE buffer: the threshold is `best × (1 − B)` | `0.1` | how much of the peak rate we are willing to give up before conceding the cycle has peaked. An integer gain makes the rate a SAWTOOTH — every step-up lifts it, every second between steps lowers it — and `B` is what separates a tooth from the peak |
| `H` | the TIME buffer, in GAME-seconds: the condition must hold CONTINUOUSLY for this long. The moment it reads false the clock returns to **zero**, because a step-up lifting the rate back over the threshold is exactly what the wait is for | `30` | how long a dip must last before it is a peak rather than the gap before the next step |

**`rate-peak@0/0` is the bare rule and stays selectable** — it is the CONTROL every measurement of the other two is
against. ⚖ **R2's sweep owns the real defaults**; V2 moves none and writes nothing into `games-auto/`.

### `gain>=Nx-unit` — the EMPTY PURSE, and why a ratio is not a default (R2)

⛔ **`gain>=Nx` on a layer that holds nothing is `gain >= 0` — it is `always`, and nobody had noticed.** The right-hand
side is `N × player[l].points`; when the layer holds none of its own resource that product is zero and the rule fires on
the first tick the engine allows a reset. It is not an edge case: **a layer holds nothing before its first reset (which
is what UNLOCKS it), and again after every reset of a higher row** — and on PTR's `q` it holds nothing for most of the
run besides, because `buyables:q` spends every quirk on Quirk Layers, so the purse is a residue rather than a measure of
progress.

`gain>=Nx-unit` is the same rule with the purse floored at ONE unit of the layer's own resource
(`resetGain ≥ N × max(player[l].points, 1)`). It is identical to `gain>=Nx` at every purse of one or more, so the only
behaviour it can change is the behaviour that had no content, and the refusal says which bar it is against
(`waiting:gain-unit` rather than `waiting:gain-x`).

**What it is worth, measured (gate R2-S1, from `snapshots/ptr/all/M15.json` → M22, 14,000 ticks, diff 1, every cell
twice equal):** on `reset:q` the floor moves **M16 from 24179 to 17058 game-seconds** — 7,121 game-seconds, the whole
completion of row 2 — because the shipped rule fired the instant one quirk was available, unlocked `q` early and let a
row-3 reset wipe row 2 before row 2 was done.

⛔ **AND IT IS NOT A DEFAULT.** On `reset:p` the same floor is a **DEADLOCK**: measured (gate R2-S3, a fresh game, 8,000
game-seconds, twice equal) **zero resets, `player.points` still 10**, no mark reached at all, against the shipped
`gain>=2x` reaching M12 at 6718. PTR generates no points until a prestige upgrade is bought, and no prestige upgrade can
be bought before the first prestige — so a rule that waits for a gain of 2 waits forever. That is the general shape:
**a floor on the first reset bricks any layer whose own reset is the only source of the progress the floor is waiting
for.** The floor pays exactly where a premature first reset destroys something that took a long time to build, and
costs where it does not (`reset:p` above, and Something Tree's `reset:fundamental`: S05 at 1074 game-seconds against
`gain>=2x`'s 677, gate R2-S5). Nothing the engine declares distinguishes those two cases — not the layer's row, not
whether its currency is spent down — so **which layers take the floor is a measured TABLE entry, and the derived
default for a normal layer stays `gain>=2x`.**

⚠ **The same first-cycle blindness is in `rate-peak`, and it is not fixed here.** `decideRatePeak` returns `act: true`
when `lastReset[f.id]` is undefined ("no cycle to compare against yet"), so its first reset is unconditional too —
measured on `reset:q`: every `rate-peak` cell unlocks `q` at 16917 game-seconds, exactly where `always` does, and pays
for it with M16 at 22346 instead of 17058. A fix would seed the feature's reset clock when it first becomes able to
reset, which also moves `interval>=T`'s first interval and therefore every A1/A2 pin — ⚖ a slice of its own.

### `stall>=Kx/N` — the stall fallback (V2), a MODIFIER

⚖ **The user's rule, verbatim** (2026-09-19): *"If we are stuck waiting a long time for resources to double their
previous amount, triggering a reset, then we should do a reset of whichever resource is closest to reaching its
target. We could set the timeout threshold dynamically, based on how long previous resets have taken."*

It is a **modifier, not a policy of its own**: the primary rule still decides, and the fallback only fires when the
primary has been saying no for too long. A policy that REPLACED the primary would lose the rule the player chose.

- `typical` = the **median** of the last `N` intervals between resets of this feature **that its PRIMARY rule
  fired**. The feature is *stalled* once `player.timePlayed − lastReset ≥ K × typical`.
- ⛔ **A reset the FALLBACK fired never feeds `typical`.** PTR's `q` reset by its own rule after ~10, 83 and 332
  game-seconds; if a timed-out wait fed the threshold, `typical` would grow with every timeout and the timeouts with
  it — geometrically, which is the very stall the modifier exists to break.
- A stalled feature resets when the engine's own `canReset` holds and its gain is at least 1.
- **The arbiter** — *"whichever resource is closest to reaching its target"*: at most **one** stalled feature per
  `gameLoop`, the one with the highest **progress fraction**. For a **static** layer that is `baseAmount / nextAt`
  (⛔ not `requires`, which is the first threshold and stops moving — plan §16.3 item 8); otherwise it is whatever
  ratio the chosen strategy declares as its `progress`, which is the one it is itself waiting on. A strategy with no
  measurable target (`unlocks-purchase`, `keepsUpgrades`) has no fraction and ranks last. **Ties break by
  registration order** — layer row ascending, then the `layers` key order, then kind order, the same order the tab
  draws — so the answer is identical on every run. The others re-decide on the next tick, because that reset changed
  the world they were judged in.
- ⚠ **With no own-rule interval yet there is no `typical` and the modifier is SILENT**: the feature shows its
  primary's own reason, and the block says *"no reset by this feature's own rule yet, so there is nothing to be late
  against"*. The first interval starts at the first tick the modifier ran for that feature (`stallSince`), so the
  feature's FIRST reset is an interval too — without that, a feature that resets once by its own rule and then waits
  forever has zero intervals and the fallback stays dormant on the very shape it exists for (measured on the stub
  while building it).
- `K` and `N` are **parameters with provisional defaults** (3 and 5) and ⚖ R2's sweep owns the real ones. `K = 3` is
  a proxy for "three times longer than this feature's own resets have been taking is not a wait, it is a stall";
  `N = 5` is short enough to follow a changing game and long enough that one unusual interval does not move the
  median.

**Memory** (`tmtLoader.runtimeState()`, never the save): `stallIntervals`, `stallSince`, `stallFired`, `rateBest`,
`rateHold`. ⛔ Each appears **only when it has something to say**, and intervals are recorded only for a feature whose
policy carries the modifier — so a run that uses neither new strategy writes byte-for-byte the record it wrote before
V2, and every snapshot committed in this repo stays valid.

### `turn@W/Kx/N` and `turn-demand@W/Kx/N` — the ROW CYCLE (R3b), two MODIFIERS

⚖ **The user's idea, verbatim** (2026-09-20): *"Another idea is to cycle through which same-row resource to do the
next reset. … There are a few different ways we could do this."*

**The problem it is for.** Two layers of the same ROW each reset by wiping every row below them, so each takes the
other's input away again. It is not a PTR accident — it is what a tree row IS — and on PTR it appeared three times
before anything was built for it: the M21 wall (`q` wiping the Time Energy `h` needs), all five `reset:h` policies
measuring byte-identical because the engine never even asks them, and Hindrance Spirit stuck at ONE under every
arrangement of per-feature rules. **No policy can fix it**, because whichever rule is eager takes every tick the
other one needed. What decides is whose TURN it is.

**A cycle is DERIVED, never typed.**

- Its **key is the row** — `layers[l].row`, the engine's own declaration. No layer name and no game id appears in
  the loader.
- Its **members** are every ACTIVE `reset` feature of that row, whether or not it carries a modifier. A member that
  declares nothing is bound at the declared default weight of **1**. ⛔ *A member that does not yield is not a
  member*: the planner's own probe left `reset:h` out of the cycle and it fired 44 times, wiping row 2 before the
  member whose turn it was could use it.
- A row **has** a cycle only while at least one of its reset features carries `turn@…` or `turn-demand@…`. With no
  table entry and no player edit there is no cycle anywhere, nothing is scheduled, and `runtimeState()` writes
  exactly the record it wrote before R3b.
- ⛔ **A cycle of ONE is not a cycle.** A row with fewer than two active members is DORMANT: its members decide by
  their own policies, exactly as before, and the cycle keeps whatever it has already remembered for when the row
  fills up. This is load-bearing: PTR's `reset:h` is locked until M21, and since a member is EAGER inside its turn,
  a cycle that counted one member would silently have replaced `reset:q`'s measured `gain>=2` with `always` for the
  whole M15→M21 stretch — which R2 measured reaching M16 NEVER.

**Inside its turn a member decides by its OWN policy.** The cycle says WHO may act and HOW OFTEN; it does not say
what to wait for. ⛔ The first cut of this slice made the holder EAGER ("the turn is the patience") and the
whole-stretch sweep measured what that costs: it silently replaces PTR's `reset:q` policy `gain>=2` with `always`
for every turn, and `q` then resets for ONE quirk instead of two — 249 quirks from 244 resets against the control's
559 from 279. **A member that should be eager says so with the policy `always`**, which is a choice a table or a
player makes and which carries its own provenance (⚖ minimize hardcoding).

**A holder that COULD act and whose own rule says no yields the turn at once** — and this is what makes a patient
member safe without a clock and without making anybody eager. The two ways a holder can fail to use its turn are
not the same thing:

| the holder is refused by | what it means | what the cycle does |
|---|---|---|
| the **ENGINE** (`cannot-reset`, `yielding:native`, `blocked:after`) | it is waiting on a RESOURCE | it KEEPS the turn — that is what a turn is FOR. PTR's `h` needs ~1,450 quiet game-seconds for Time Energy to reach 1e30, and it only gets them because holding the turn is what stops `q` wiping row 2 |
| its **own policy** (`waiting:gain`, `waiting:rate`, `waiting:interval`, …) | *"not yet, and it is worth more soon"* — which is ALSO productive waiting | it KEEPS the turn. ⛔ The first cut yielded here and it was measurably wrong: with `gain>=2` on PTR's `q`, the ENGINE allows a reset while the gain is still one quirk, so a twenty-reset turn ended after ONE and an eager sibling ran unscheduled. The weight exists to protect exactly this |

⚠ So a member that is not using its turn is the GUARD's business and nobody else's — there is no second mechanism.
The one case neither answers is a member that can reset exactly ONCE: its bound comes from its SECOND reset, so it
has none, and it holds the row. That is the same gap as a member that can never reset at all, and the candidate for
both is a release rule based on PROGRESS toward the threshold rather than on elapsed time — which is also what would
retire the `K` default below.

**Precedence — where the cycle sits in the chain.**

```
  until  >  while / the table's gate  >  THE ENGINE (canReset, autoPrestige, after)  >  THE CYCLE  >  the policy
```

- `until` and `while` are **above** it, so a STOPPED or PAUSED member is not in the cycle's hands at all and the
  cycle never holds a turn for one. (This is what keeps PTR's M21 pause working: `reset:q` is paused until `h` is
  unlocked, and a cycle that held the turn for it would mean `h` never reset and M21 was never reached.)
- **The engine is above it too**, so `waiting:turn` means exactly *"the game would let me and the cycle will not"*.
  A member that could not reset anyway keeps `cannot-reset`, which is the more useful sentence.
- The **policy is below it**, and while the row's cycle is live it does not decide at all. ⚠ That is a real cost,
  and it is named rather than smoothed: a `stall>=Kx/N` on a cycle member cannot be carried in the same string, and
  a **stall-watch rung** on a cycle member's reset is INERT while the cycle is live.

**The guard — `K` and `N`, and WHAT IT IS LATE AGAINST was decided by measurement.** A member that has not acted
for `K ×` as long as its own RESETS usually take gives the turn up, and is skipped for one whole rotation so that a
demand which can never be met cannot hand it straight back.

- `typical` = the **median** of the last `N` intervals between that member's **own resets** — `stall>=Kx/N`'s own
  quantity, and ⚖ the user's rule verbatim: *"we could set the timeout threshold dynamically, based on how long
  previous resets have taken"*.
- ⚠ **The clock restarts every time the holder ACTS, not when the turn began.** A turn of weight `W` spans `W`
  resets, so measuring from the turn's start compares the whole turn against the wait for ONE of its resets — every
  weight above 1 is then released mid-turn and the weight stops meaning anything (measured: `turn@5` and `turn@20`
  byte-identical).
- ⛔ **`K` DEFAULTS TO 30 HERE, WHERE `stall>=Kx/N` USES 3, AND THAT IS MEASURED RATHER THAN INHERITED.** A cycle
  member's waits are **bimodal by construction — the cycle itself creates the long ones**. PTR's `q` resets every
  ~19 game-seconds in a burst and then needs ~311 after a sibling's reset has wiped the row below, and `N` is a
  SLIDING WINDOW: a burst flushes the long waits out of the memory, the bound collapses to `3 × 19`, and the next
  legitimate wait reads as a stall. Measured over the whole stretch: at `K = 3` a weight of 20 gives a ratio of
  **1.0** and 211 quirks; at `K = 30` it gives **19.1** and reproduces a known-good arrangement byte-for-byte.
  `K = 300` and `K = 100000` are byte-identical to 30, so the answer is not sensitive above the knee.
  ⚠ **No quantity fixes this** — taking the LONGEST of the window instead of the median measures identically,
  because what is wrong is the window's CONTENTS. The real answer is a release rule based on PROGRESS toward the
  threshold; until that exists `K` is a backstop and is defaulted to behave like one. The damage a wrong answer does
  here is a FALSE RELEASE, which starves the member the cycle exists to feed.
- ⛔ **Its OWN intervals, with no pooled fallback.** A bound has to be in the member's own units: PTR's `h` needs
  ~1,450 quiet game-seconds and `q`'s resets are tens of seconds apart, so a pooled median hands `h` a threshold
  two orders of magnitude too small and releases its turn before it could possibly use it — which is exactly the
  starvation the cycle exists to end. Measured: Hindrance Spirit ends at ONE, the state before this slice.
- ⚠ **A typical of zero is not a bound.** An interval of zero is a real measurement and `K × 0` would release
  every turn on the tick it was granted, before its holder's layer had even run.
- **With no interval of its own there is NO bound**: the turn is held until the member uses it. ⚠ The cost is
  named rather than smoothed — a member that can NEVER act holds its row's turn for ever, and what protects
  against that is the player's own `while`, the demand link, and the yield rule above; not a number this file could
  derive. Every derived bound that was tried released `h` before it could reset.
- A turn therefore ends in **four** distinct ways, and they are not the same event: `complete` (spent), `released`
  (the guard took it — skipped for a rotation), `preempted` (demand moved it — **nothing skipped**) and
  `ineligible` (paused, stopped, or left the row). ⚠ Skipping a PREEMPTED member deadlocked the first cut outright: every member ended up skipped
  and the one holder that could not act had nobody left to give the turn to — a scheduler that stopped scheduling,
  and green in every hash.

**DEMAND — `turn-demand@W/Kx/N`, and where it comes from.** ⚖ 13d.2 asks what a number stands for, and a weight is a
literal. The ⚖-shaped question is *"who is actually WAITING?"* — and V1 already answers it, because every refusal
is a DECISION CODE carrying the values it compared. A code may now declare **which of its own values names the layer
it is waiting ON**:

| code | the value that names a layer |
|---|---|
| `blocked:after` | `sibling` |
| `waiting:retry` | `layer` — R3a's retry bar: *"challenge 12 failed with 1.00 of h; it will be tried again at 2.00"* |
| `waiting:milestone` | `layer` |

While any active feature's last decision names a member's layer that way, that member gets the next turn; with no
such demand the weights decide exactly as above. **No layer name and no game enters the loader**: a new reason code
that declares a `demand` value is a new demand signal and no code in the cycle changes. `T.reasonCodes()` publishes
the declaration, so a gate witnesses the set rather than trusting it.

- ⚠ **One member asking for it is enough for the whole row.** Demand only ever hands a turn to a member something
  is waiting on, so the most a member that did not ask for it can lose is its place in the rotation — which the
  guard already allows.
- ⚠ **Demand can be permanent or circular** (a bar that can never be met). That is what the guard's skip is for,
  and it is constructed rather than argued: gate `R3b-R3` stands a demand that is never satisfied and measures that
  the other member goes on acting.
- The cycle's own refusal, `waiting:turn`, declares **no** demand — a scheduler whose refusal fed itself would
  never hand a turn anywhere else.

**Readout.** `T.turnState(id)` (and the `turn` row of `explain()`) says whose turn it is, how many resets this
member's own turn is worth, how many of its own turns are remembered, its typical, and whether it is skipped.
`T.cycleState()` is the whole record, one entry per row, for a gate or a probe.

**Memory** (`tmtLoader.runtimeState().cycle`, never the save, and ⛔ **never an engine field**): per row key,
`{holder, left, since, round, at, mem, skip}`. It appears **only when a cycle exists**. ⚠ The engine field that
looks right is `player.<layer>.resetTime`, and it exists **only on the 2.7-style engine** — the 2.2.1 family has no
such field, so six of the planner's own probe cells compared against `undefined`, measured "paused for ever", and
looked like a result. Every gate leg for the cycle therefore runs on BOTH engine families.

### The derived default for the `challenges` kind (R3a)

**Without an `order` it is `off`, and it stays `off`.** A KIND default reaches every game on the roster, and the
roster is 171 games nobody has swept. Measured (gate R3a-6, the first 14 ids in the roster's own order, 600 ticks
each): **11 of the 14 register a `challenges` feature — 44 features between them** — and every one is at `off` with
nothing active at the stop. Switching the kind on would put 43 unswept features into challenges at once. ⚠ What the
sample bounds: 14 of 171 ids, 600 ticks each.

**With an `order` it is now `sequential|give-up@0.1/30/2x`.** A table that names a challenge SEQUENCE has already
opted into entering them, and until R3a that opt-in had no way OUT — `sequential` left a challenge only by winning
it. The opt-in path is the one place a moved default can only help, and it reaches no game that has not asked for
it: no table on the roster declares a challenge `order` today, which is why Something Tree's leg is byte-identical
across the change.

### `give-up@B/H/Rx` — the challenge EXIT rule, and its retry rule (R3a), a MODIFIER

⛔ **What it is for.** `sequential` has an ENTRY rule — the first unlocked, incomplete challenge — and, before R3a,
no exit rule at all: it left a challenge only by WINNING it. On PTR, from `snapshots/ptr/all/M22.json`, it completes
H11 "Upgrade Desert" in 65 game-seconds and walks straight into H12 "Speed Demon", which H11 has just unlocked and
which it is far too weak for; and it stays. Measured twice equal: **11,878 game-seconds inside H12**, the currency
flat at 1e2334 against a goal of 1e3550, `reset:q` 13 (none after entry) against the shipped table's 247. That is
the shape of every later challenge in the game, not a PTR accident.

⚖ **Everything it reads is the ENGINE's own declaration about the challenge.** The goal is `tmp[l].challenges[id].goal`;
the quantity it is scored on is whichever of `currencyLocation[name]` / `player[currencyLayer][name]` / `player[name]`
/ `player.points` the challenge declares — the same four-branch lookup `canCompleteChallenge` itself does. No
challenge id, no per-game threshold, and nothing that is not either derived or a buffer the player set.

**The quantity that moves is an EXPONENT.** A challenge's goal is orders of magnitude away from its currency, so the
rule works in `p = log(amount) / log(goal)`: 0 below one unit of the currency, 1 at the goal.

⛔ **And it is NOT `rate-peak` in disguise — the curve was measured before the rule was written, and the obvious
shape is wrong.** `p` is FRONT-LOADED: PTR's H11 goes 0 → 0.43 → 0.78 → 0.92 in thirty game-seconds and then crawls
to 1.0 over the next thirty-five. Its best AVERAGE rate is always the first ten seconds' and nothing later comes
near it, so any rule anchored to the best rate since entry abandons H11 at **99.7 % of its goal, five seconds from
the reward** (measured). What separates H11 from H12 is not the rate: it is whether `p` is still MOVING. H12 is flat
to seventeen digits from eighty game-seconds after entry onward. So the rule asks about the REMAINING DISTANCE:

> in the last `H` game-seconds, did this attempt close **more than** a fraction `B` of what was left to close?

If it did, the window succeeds and starts again from here. If it did not, the clock runs, and at `H` the feature
leaves the challenge without completing it (`acted:challenge-give-up`).

| | meaning | default | what it is a proxy for (⚖ 13d.2) |
|---|---|---|---|
| `B` | the VALUE buffer: a window must close **more than** `B ×` the distance that was left at its start | `0.1` | how fast an attempt has to be closing before it counts as still progressing. It is what separates a CRAWL (1e-9 of the gap per window — a challenge that would be reached in a billion seconds) from a CLIMB |
| `H` | the TIME buffer, in GAME-seconds: how long a failing window is given before the attempt is conceded | `30` | how long a pause in progress must last before it is a plateau rather than the gap before the next step |
| `R` | the RETRY bar: that challenge is not entered again until the layer it belongs to holds `R ×` what it held when the failed attempt began | `2` | "is the run meaningfully stronger than it was last time" — `gain>=Nx`'s own shape, on the one resource the engine guarantees a challenge's layer has, with R2's empty-purse floor on it (`R × max(held, 1)`) |

**`@0/H` is the BARE rule and the CONTROL**, exactly as `rate-peak@0/0` is: with `B = 0` a window succeeds if `p` moved
at all, so the rule gives up only when progress has stopped dead. **`R = 1` is the exit-only control** — it re-enters
the moment it has left.

⛔ **`R` is why the rule is not an oscillator.** `sequential` re-picks the challenge it has just left on the very next
tick, so an exit rule with no retry rule is a loop that enters, fails and leaves for ever — at two forced layer resets
a cycle, which on PTR is worse than staying.

**Memory** (`tmtLoader.runtimeState()`, never the save): `challengeAttempt` (the attempt in progress — the challenge,
when it began, the window's anchor, and the layer's strength at entry) and `challengeFailed` (per challenge, the
strength the failed attempt began from, as a STRING, for the reason `rateBest` is one). ⛔ Each appears **only when it
has something to say**, and nothing writes into either unless a `give-up` modifier is in force — so a run whose
tables name no modifier writes byte-for-byte the record it wrote before R3a, and every snapshot committed in this
repo stays valid.

⚠ **A run that finds itself inside a challenge it has no record of SEEDS the window at that tick** — a snapshot taken
mid-attempt, a player who entered by hand and then switched the modifier on, a `--no-runtime` control. The
alternative is an attempt that looks as if it began at time zero, which would be given up on the first tick.
`stallSince` does the same thing for the same reason.

### ⚠ What a PAUSE means on the `challenges` kind (R3a)

`while` and `until` are per-FEATURE and are evaluated BEFORE the kind decides, so a false one means the feature does
**nothing** — and inside a challenge, "nothing" is STAYING there. The decision, and the reason for it:

- **A `while` that goes false inside a challenge means STOP ENTERING, never LEAVE.** `while` is one mechanism shared
  by six kinds and its whole contract is "the feature does nothing while this is false". Making it act would make a
  pause destructive on exactly one kind — leaving a challenge is a forced layer reset — and a pause that resets a
  layer is not a pause.
- **But it is no longer silent.** Measured: `while: player.h.activeChallenge === null` on PTR's `challenges:h` — the
  shape a player writes for "only act when I am not in one" — enters H11 and then sits inside a challenge it
  completes in 65 game-seconds for the whole remaining 3,935 game-seconds of the leg, reporting `blocked:gate` and
  nothing else. The reason is now **`paused:in-challenge`**, which names the challenge and which of the two controls
  stopped the feature.
- ⇒ **The EXIT belongs to the kind's own decision, not to a control.** That is what `give-up@B/H/Rx` is.

**What the two controls CAN say** (measured, R3a gate part 2, 4,000-tick legs from `all/M22.json`):

| the control | what it does |
|---|---|
| a FEATURE-level `while` with the goal conditions for one challenge | blocks **every** challenge of the layer, the trivial ones included — one predicate per feature cannot say "this challenge now, that one later" |
| the same written per COMPLETION (`challengeCompletions(l, id) < 1 \|\| …`) | **works**: §5d′'s own form expresses a schedule by level, and PTR completes H11 and never enters H12 |
| a `while` that can go false while inside | strands the run (above) |
| an `until` | the same schedule as the per-completion `while`, with no way back — a latch is a strictly weaker entry rule |

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
  gates: { 'reset:q': "hasMilestone('h', 2)" },            // `while`: the feature PAUSES while the predicate is false
  off: { 'buyables:t': 'Extra Time Capsules cost Boosters' }, // NOT registered; the reason is required (tmtLoader.autoExcluded)
  keep: { 'reset:b': { layer: 'b', id: 0 } },              // keepsUpgrades' milestone
  clickables: { c: [{ id: 11, when: 'player.c.points.gte(10)' }] },
  provenance: { 'reset:p': 'R1′ (SUMMARY gate R1′-2.3): gain>=2x reached … against interval>=10’s …' },
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
- `provenance` (V1) needs a non-empty one-line string per entry: WHERE that entry came from — the SUMMARY gate row or
  the plan § that measured it. ⚖ minimize hardcoding has always required that as a source COMMENT; this makes it data
  too, so the `Advanced` subtab can tell a player why a default is what it is instead of leaving the answer in a file
  nobody playing the game will open (survey §4.11). An id the table EXCLUDES is still a derived candidate, so an
  exclusion may carry its provenance. It is author-written text rendered through `v-html`, and the loader escapes it.
  ⚠ It is OPTIONAL, and `games-auto/something.js` deliberately does not have it: a table without the key still works
  and its rows read `provenance: null`, which is what keeps V1's per-fork cost "unchanged";
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
  - `while:<featureId>=<predicate>` / `until:<featureId>=<predicate>` / `priority:<featureId>=<n>` — (V4) the three
    per-feature CONTROLS, in the TABLE's slot (so a player's saved edit still outranks them, exactly as it outranks
    `policy:<id>=`). An EMPTY value clears the table's own entry, which is how a control leg measures the game
    without a gate the table ships. ⛔ An id the derivation does not produce THROWS — R1′'s rule, because a mistyped
    sweep cell that quietly measured the game without the thing under test is how a number gets printed for nothing;
  - `hookAll=1` — hook every tree layer (test probe); any other key lands in `tmtLoader.autoOptions`.
- A THROW in the table or the derivation (an unknown key, an unknown feature id, a bad `include=`) is a **hard fail** of
  the run (`ok: false`, `failed_at: 'automation'`), not a run with `features: []` — the page fails its load on the same
  throw, and before R1′ the Node harness recorded the error in `file_errors` and reported `ok: true`, so a mistyped
  sweep cell measured the game with NO automation and printed a number.
- `--explain` — `tmtLoader.explain()` at the stop, in `R.explain`. `R.explain_stats` (`{decisions, formats, texts,
  codes}`) is recorded on EVERY automation run and BEFORE that dump, because a counter read after the one caller that
  formats on purpose would be measuring the reader rather than the run.
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
- `node tools/harness/gates-v4.mjs --part 1|2|3|4|5|6|7|m21|derived|fix` — the V4 gates: the `predicate` type on the
  stub plus both new codes on a real leg (1), `while` as a table entry ≡ as a saved edit (2), the `until` latch
  across a RELOAD and the re-arm (3), `priority` (4), inertness (5), the page (6), the roster (7); `m21` is the
  pause sweep that chose PTR's `gates` entry, `derived` is the rule that was tried and NOT taken, `fix` regenerates
  the fixtures the pause moves.
- `node tools/harness/gates-s1.mjs --part 1|1s|2|2s-p|2s-f|2s-q|3` the S1 gates; `gates-a1.mjs`, `gates-a2.mjs` the A1/A2 ones.
- `node tools/harness/gates-v1.mjs --part 1|2|3|4|6` — the V1 gates: every reason code witnessed by name (part 1),
  reason ≡ decision over whole legs (2), inertness and the format counter (3), subtab switching does not move
  `hashGame` (4), the roster's Advanced subtab (6). The page legs for the two reference games are in
  `gates-a1 --part 2`, beside the Simple-tab legs they must not disturb.
- `node tools/harness/sweep.mjs <id> --vary "policy:reset:e=interval>=5|always" [--opt "k=v"] <run.mjs flags>`: one run
  per value (a pool of 8), one line per value with the game-seconds to each mark. A `planner:<option>` key sweeps the
  ADVANCED planner's options instead (`--vary "planner:k=60|300|900" --planner=auto --planner-ladder …`), and every line
  then carries the round count, the planning wall time and, when the run did not reach `--stop-mark`, `dnf` with a cause
  read off the round log (`fixation` / `economy` / `blocked` / `wall`).
