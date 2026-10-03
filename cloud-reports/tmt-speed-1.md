# tmt-speed-1 — speed controls and fast-forward in the loader, and automation memory that survives a reload

Branch `claude/speed-controls-reload-memory-y7pnl7`, from `5e2e784`. Cloud slice 3a of the whole-game ladder (the tools).

## What a player can now do

- **Open the game's options and press *Speed controls*.** A small panel opens over the game, in the game's colours,
  and it works on a phone. It has **Pause · ×1 · ×2 · ×10 · Max**. ×1 is the game's own loop, untouched. The panel
  always shows the real game-time per second (on Prestige Tree Rewritten, Max is about ×2–×5 because one tick costs
  ~8–15 ms in a browser; Something Tree reaches ~×9).
- **Fast-forward…** fast-forwards to one of three targets:
  - an amount of game time;
  - until a condition (the same expressions as the automation table's gates);
  - until a ladder mark (ptr and Something).

  Each target has a progress bar, a **Stop** button and a limit. It stops by itself if the game ends or throws. A
  condition that throws reads as false, and the panel says so.
- **Faithful by default:** the game's own 0.05 s ticks, so the result is the same as playing normally. **Approximate**
  mode uses bigger ticks (0.25 / 1 / 5 s) and is labelled everywhere it appears: *approximate — results can differ
  from normal play*.
- Speed never goes into the save, so a reload is always ×1. The panel stays open across reloads until you close it.
- **The automation remembers where it was across a reload.** A queue half way through its steps carries on from its
  step. A `once` queue that has run stays done, and the row cycle keeps its memory. If the save that loads is not the
  one the memory was written with, the memory is thrown away and the automation tab says *"The automation's memory
  belonged to a different save; it starts fresh."* An import or a hard reset also throws it away, and the tab says
  which one did.

Screenshots (desktop and phone) are in `cloud-reports/tmt-speed-1/`:
- `options-door-*`: the button in the options tab;
- `idle-*`, `idle-expanded-*`: the controls idle, collapsed and with the targets open;
- `fast-forward-*`: a run to a condition in progress;
- `approximate-*`: coarse mode, labelled;
- `memory-discarded-*`: the notice in the automation tab.

## Design decisions

**Where the control lives.** The door is the options tab, because `loader/options.js` is the one file on every page.
- It is one more button on its own row. It carries `data-tool="speed"`, not `data-flag`, so the three flag buttons and
  gate O1's reading of them are unchanged.
- The controls themselves are a fixed panel over the game: bottom-right, and above the nav bar when there is one. A
  player watching the automation needs them in view while the tabs change. The nav bar exists only with `?navbar=1`.
- It is **lazy**: `loader/tmt-speed.js` is fetched only on the press, when the panel was left open
  (`tmt-loader:<id>:ui.speed`), or by `tmtLoader.fetchSpeed()`.
- It is **hosted page only**: it needs the timer recorder, which an author's own page (embed mode) does not install.
  There, the button is absent.

**Holding the loop.** `pause()` stops every interval, including the autosave. The timer recorder therefore gained
`find(re)`, `hold(id)` and `release(id)`, and `resume()` leaves a held interval held.
- The controls hold the one interval whose callback calls `gameLoop(`, found by source, with no engine variable names.
- Gate L1 measured exactly one such 50 ms interval on **all 175** games.
- The autosave, the canvas flag and component timers keep running. If no loop were found, the controls would pause
  everything and say so.

**Faithful tick.** A faithful tick is `tmtLoader.tick(0.05)`, the harness tick. It is driven in chunks: one
animation frame at a time, with a **40 ms budget** per frame and the target checked after every tick.
- A first cut used a 12 ms budget. Measured, that ran one tick per frame, because `updateTemp` alone costs ~7 ms in
  the page.
- ×N owes N ticks per 50 ms of real time. A backlog is dropped, never paid later in a burst.
- After each frame, the engine loop's display-only lines run, each where the engine has it: the canvas,
  `updateWidth`, `updateTabFormats`, and popups and particles in real time.
- A hidden tab gets no animation frames, so the fast-forward waits.

**Measured ticks/s at Max** (ptr, profile all, 600 ticks):

| state | ticks/s | game-s/s |
|---|---|---|
| fresh | 104 | 5.2 |
| all/M08 | 43 | 2.1 |
| all/M16 | 83 | 4.1 |
| all/M25 | 87 | 4.4 |
| m28/QL6 | 82 | 4.1 |

Something Tree fresh runs at ~180 ticks/s. The driven tick costs what the plain tick costs.

**`player.time`.** The controls set it to now on release. While the loop is held they also keep it at now, four times
a second and every frame. This is the engine's own write: its loop does `player.time = now` every tick. So neither a
return to ×1 nor a reload in the middle of a fast-forward sees a phantom gap. Gate S5 measured:
- after 3 s held, the engine's first diff is 0.050 s;
- a reload from a held loop credits 0.28 s of offline time.

**`offTime`: left to the engine.** A fast-forward neither spends offline time nor adds to it, and the engine spends it
at ×1 as before. Reasons:
- The harness tick never reads `offTime`, so leaving it alone keeps faithful equal to the harness.
- Folding it into the fast-forward would change what offline time gives the player.
- Running it first would start every fast-forward with an unannounced coarse burst.

**`devSpeed`: not used.** It is the engine's key, it lives in the save, and it multiplies a variable diff. Coarse mode
is simply `tick(step)`. Gate S8 compares `player`'s key paths before and after every speed and a coarse run.

**The two engines' loops** (the table is in `docs/speed.md`). Compared with 2.2.1 (ptr), 2.7 (something) differs in
these places:
- it checks `tmp.gameEnded` where 2.2.1 has a global `gameEnded`;
- its offline switch is `options.offlineProd`, not `player.offlineProd`;
- its offline cap is in seconds. ptr compares a remainder in seconds against `offlineLimit*3600000`, a cap 1000×
  too high; that is an engine quirk, left alone;
- it marks offline time done with `undefined`, not `null`;
- it runs extra display lines around the tick: `updateOomps`, `updateWidth`, `updateTabFormats`, and popups and
  particles on the real diff.

## Reload memory

- **Where it is written.** Every engine `save` is wrapped (the autosave calls it too). Each save writes
  `{format:'tmt-automem/1', fp, at, gs, runtime: runtimeState()}` to the one declared key
  **`tmt-loader:<id>:automem`**, beside the save.
- **The fingerprint (`fp`)** is two synchronous 53-bit hashes plus the length of `stateJSON(gameState)`, which is
  exactly what `hashGame` hashes. It is synchronous because `tmtLoader.hash` is a promise, and a tick could land
  between it and the save. It was measured stable across a reload on ptr, Something (2.7) and Arc Tree (2.6).
- **When it is restored.** In `loader/page.js`, after `onload` and the profile and before the first tick, and only if
  the fingerprint matches the save that loaded. If the record has queues, every timer is paused while the queue
  runner is fetched.
- **When it is discarded.** Otherwise it is discarded and the notice is shown on the Simple subtab's disclosure line
  (no new `tabFormat` entry). `importSave` and `hardReset` are wrapped: their save writes a tombstone (only where a
  record existed), and the next load says which one it was. A refused import or a cancelled reset changes nothing.
- **When nothing is written.** A record is written only when the runtime has something to remember: a feature acted,
  an interval clock, a cycle, a queue, the tracker, or an override. A profile-`off` page, a plain page and the Node
  harness (which has no `storage.raw`) write nothing. Embed pages install no wrappers.
- **Cost per save** at QL6: median **0.6 ms**, max 3.5 ms, for a 6.5 KB record.

**Proofs (S6):**
- From QL6 with the H22 queue running, a save plus a reload gives a deep-equal runtime record: the queue is on step 4
  and the row cycle is equal. The control without the record has the queue back at step 1.
- The H22 `once` queue, run to its end, stays done across a reload and 40 ticks. The control re-arms it.
- A save that moved on behind the record (the engine's own save, unwrapped) is discarded, and the notice appears on
  screen.
- An import, and a hard reset, each discard it.
- Something and Arc Tree restore deep-equal too.

## Faithful equals the harness (S1)

On the page, the loop was held and every other timer stayed live:

| case | ticks | page `hashGame` | reference |
|---|---|---|---|
| ptr fresh | 1,500 | `d83a44ec0afa82d6` | equals Node |
| Something fresh | 1,500 | `e4ca73422d9f5007` | equals Node |
| Arc Tree plain page | 1,500 | `fb344ca8145b8524` | equals Node `--no-automation` |
| ptr from m28/QL6 (stages, cycle, give-up, the H22 queue) | 600 | `332840d8e972103a` | equals the page's own tick loop |

S3 adds two more checks against the harness:
- the condition `player.points.gte(1000)` stops on the harness's tick, 4525;
- Something's mark S01 is reached at the harness's tick, 102.

⚠ **Why QL6 is compared against the page's own loop and not Node:** see "What this brief got wrong", item 1.

## Gates

| gate | result |
|---|---|
| `npm run harness:test` | **402/402** (one red mid-slice: my `--games` flag name tripped the seam test; renamed to `--ids`) |
| auto-tables `--check` / `--provenance` | green / green |
| `queues-catalog --check` | green |
| log1 all + page | 12/12, 4/4 |
| facts `--check` | green |
| facts1 oracle / vacuity / neutral / grep | 24/24, 6/6, green, green |
| tpl1 inert / runner / oracle / grep | all exit 0 |
| qrate1, m28, h22, stages push + page, shipq push + page, m30, m31, yield push + roster | all exit 0 |
| qedit all | exit 0 |
| parts all | exit 0 |
| P1a parts 2 and 3 | 10/10, 9/9 |
| the opening pin (`gates-c1c --part 3`) | 4/4 |
| S1 part 1 | 52/52 |
| A1 part 2 (ptr, something) | **28/28 after a fix** (below) |
| E1 (ptr, something, arctree) | 3/3 |
| G1 plain + automation, M1, O1 (ptr, something, arctree) | all green |
| **new `gates-speed --part all --assert`** | **11/11** |

The A1 fix: A1 part 2 went red once, on Something. Its oracle took "the first namespaced key that is not `_options`"
to be the game's save, and the new `automem` key is now beside it. The oracle now skips `:automem`. That is a
test-helper assumption, not a pin.

The new battery's rows: S1 faithful, S2 multiplier, S3 targets, S4 coarse, S5 no-gap, S6 memory, S7 phone,
S8 inert/G1, S9 door, L1 roster loop, X1 grep. S2 measured ×1 1.00, ×2 2.00, ×10 8.77, Max 8.93 and pause 0
game-s/s on Something.

**Mutants** (`mutants-speed.sh`; tree committed first, run in a separate worktree, restored from copies): **6 killed,
0 survived.**

| mutant | killed by |
|---|---|
| faithful step 0.1 | S1 |
| memory restored onto a different save | S6 (d) |
| `player.time` not reset | S5 (first diff 3.09 s) |
| speed saved into `player` | S8 |
| a nowrap row | S7 |
| a game id in `tmt-speed.js` | X1 |

A sweep job `speed` was added to `.github/workflows/sweep.yml`.

**No pin moved.** Every battery above passed with its pins unchanged. One tracked file, `gates-c1c-part3.json`, was
rewritten by the local run and restored from a copy.

## ⚖ Decisions for the user

1. **Where the control lives:** the options button opens a floating panel.
2. **`offTime` is left to the engine.**
3. **`devSpeed` is not used.**
4. **The 40 ms frame budget.**
5. **The ladder door now exists on every page**, not only with automation. It is still lazy and asks the index first.
6. **The memory writes only when there is something to remember**, and an import or reset leaves a tombstone.
7. **The deep-state comparison is against the page's own loop** (see below).
8. **The panel stays open across reloads** through one per-game UI key. The speed itself never persists.

## What this brief got wrong

1. *"Faithful FF of N ticks = the harness at diff 0.05 for N ticks, by hash"* holds only while Node and Chromium
   agree, and they diverge in the last bits of floats (two V8s' `Math`), with plain ticks and no speed controls:
   - from QL6, 10 ticks gives `points` …613e988 in Node and …617e988 in Chromium;
   - from a fresh ptr, they are equal at every hundred ticks up to 2,900 and differ at 3,000 (`14.680713888313306`
     against `…308`).

   So the fast-forward equals the page's own tick exactly everywhere, and equals Node wherever Node equals the page.
   The docs' "Node ≡ page parity at 0.05" is exact only over short stretches. This finding is new and recorded in
   `docs/speed.md`.
2. *"Pause the engine's interval"*: `pause()` cannot do that alone, because it also stops the autosave. A
   per-interval hold was needed.
3. *"×10"* is unreachable on ptr: Max is ~×2–×5 there.
4. *"`hashGame` of the saved player"* as the fingerprint: same state definition, but it has to be a synchronous hash.
5. Writing the memory on every save would store a new key on pages whose automation did nothing, which conflicts
   with "nothing stored unless a control is used". The write is therefore conditional.
6. A side finding from the 2.7 comparison: ptr's offline cap is 1000× its stated hours. That is an engine quirk.
7. `the-modding-tree` throws `buyUpgrade is not defined` when ticked under profile `all`. This is pre-existing, not
   this slice; I found it while probing engines.

## Input for the next slice (3b: the whole-game run)

- **Compare runs by mark ticks or timings, not by long-stretch hashes.** The page and Node drift in float last bits
  after a few thousand ticks. Either use the page as its own reference (page fast-forward against the page tick loop
  is exact), or compare by mark ticks/timings between Node and the page.
- **Wall time.** A faithful page run is about as fast as one Node process: ~80–100 ticks/s on ptr, so M25 at ~35.6k
  game-s is ~712k ticks, about 2–2.5 h of wall time on one page.
- **What Node does instead.** Node can run marks in parallel from snapshots at 0.05. The page proves the end-to-end
  path. A real-page run could loop `run({mark, cap})` mark by mark, saving between marks. The reload memory makes such
  a run survive a reload or crash mid-queue.
- **Visibility.** Keep the tab visible, or run headless: rAF stops in hidden tabs.
- **Coarse mode** is for exploring only; never pin with it.
- **Deep states run slowly** (M08: 43 ticks/s). 3b should budget per mark.

## Commits

- `e223f58` feat(speed-1): speed controls and the automation's memory across a reload
- `8004869` fix(speed-1): panel layout under the game's sheet; S6 on 2.7/2.6
- `f120c8f` docs(speed-1): the engines' loops compared; the speed gate and the unit count
- `7da8163` gates(speed-1): A1-2's oracle reads the game's save key, not `automem`
- `2d18976` docs(speed-1): ticks per second at five ptr states
- (this commit) report(speed-1): `cloud-reports/tmt-speed-1.md` and screenshots
