# The speed controls (speed-1)

**What a player can do.** Open any game's options (its settings button) and press **Speed controls** under the
*tmt-loader* buttons. A small panel appears over the game:

- **Pause · ×1 · ×2 · ×10 · Max** — ×1 is the game's own loop, untouched. ×2 and ×10 run that many of the game's ticks
  per normal tick; Max runs as many as this device allows. The panel shows the game-time per second you are actually
  getting (on Prestige Tree Rewritten one tick costs ~7 ms in a browser, so Max is about 6–9 game-seconds per second
  depending on the device and the state of the game).
- **Fast-forward…** opens the targets: an **amount of game time**, **until a condition** (e.g.
  `player.points.gte(1e10)` — the same expressions the automation table's gates use), or **until a ladder mark** (on the
  games that have a ladder). Each has a **limit** (default 1 hour of game time), a progress bar and a **Stop** button,
  and stops by itself if the game ends or throws.
- **Faithful** (the default) uses the game's own 0.05 s ticks: the result is the same as playing at normal speed.
  **Approximate** uses bigger ticks (0.25 s, 1 s or 5 s) for much more speed and is labelled, everywhere it shows, as
  *approximate — results can differ from normal play*.

The speed is never saved: a reload is always ×1. The panel itself stays open across reloads until you close it (✕),
which is the one thing this feature stores (`tmt-loader:<id>:ui.speed`).

## Design decisions

### Where the control lives — the options tab opens a panel over the game

The options tab is the one place every page has (`loader/options.js` is inserted with no flag), so that is the door:
one more button, **Speed controls**, on its own row under the three flags (gate O1 reads the flags as
`button[data-flag]`, and the new button carries `data-tool="speed"`, so O1's reading is unchanged). The controls
themselves are a small fixed panel over the game, bottom right, above the nav bar when there is one — because a
player watching the automation play faster needs them in view while the tree and the tabs change under them, and the
options tab is not where they are looking then. The nav bar was the other candidate; it exists only with `?navbar=1`,
and a speed control should not need a layout opt-in.

The panel wears the game's own colours (`--color` / `--background`, which every engine on the roster defines, as the
automation tab's controls do), wraps to 390 px with no `white-space: nowrap` (gate S7), and stops key events at its
edge so typing a condition never fires a game hotkey.

⛔ **Lazy.** `loader/tmt-speed.js` is requested only when the button is pressed, when the panel was left open, or when a
runner calls `tmtLoader.fetchSpeed()`. A page that never uses it requests and stores nothing new (gate S8, G1).
⛔ **Hosted page only.** The controls hold the game loop through the timer recorder (`loader/shims/timers.js`), which an
author's own page (embed mode) does not install; there the door is absent and the options tab shows no button.

### Faithful = the harness's tick, driven in frame-sized chunks

A faithful tick is `tmtLoader.tick(0.05)` — `updateTemp(); gameLoop(0.05); fixNaNs()`, the census / harness tick, with
the automation's own before/after hooks — run back to back. It is NOT the engine's interval: that one's diff is
`(Date.now() − player.time) / 1000`, variable real time, plus offline catch-up and `devSpeed`. The harness at
`diff 0.05` is the page's reference (docs/harness.md, THE TICK POLICY), and the faithful drive is that reference.

- **The loop is held, not paused.** The timer recorder gained `find(re)`, `hold(id)` and `release(id)`: the speed
  controls find the ONE interval whose callback calls `gameLoop(` (by source — no engine variable name is assumed;
  gate L1 measures one per game on the whole roster) and hold that alone. The autosave, the canvas flag and every
  component timer keep running, and `resume()` leaves a held interval held. Where no loop is found the controls fall
  back to pausing every timer, and say so.
- **Chunking.** One `requestAnimationFrame` per frame; each frame runs the ticks it owes inside a **40 ms budget**,
  checking the target after every tick, then paints. ⚠ The first cut used a 12 ms budget and ran ONE tick a frame on
  ptr — measured: `updateTemp` alone is ~7 ms in the page (`gameLoop` ~0.3 ms) — about 100 ticks/s. With 40 ms the
  page stays responsive (~20 frames a second at Max) and the throughput is what the device can do.
- **×N** owes N ticks per 50 ms of real time; a backlog larger than two frames' worth is dropped, never paid later in a
  burst. **Max** owes as many as the budget allows. **Pause** owes none.
- **The screen.** After a frame's ticks the controls run the engine loop's display-only lines where the engine has
  them (the canvas, `updateWidth`, `updateTabFormats`, popups and particles in real time), each guarded by name. None
  of them writes `player`, and the hash proof below is run with all of them in place.
- **It runs while the tab is visible.** A hidden tab gets no animation frames; the fast-forward waits, and no time is
  invented or lost.

**Measured ticks per second (faithful, Max, Chromium headless in this container, one page):**

| state | ticks/s | game-s per real s |
|---|---|---|
| ptr fresh, profile all | ~100–130 | ~5–6.5 |
| ptr m28/QL6 (Quirk Layers 6, H22 queue running) | ~100–120 | ~5–6 |
| Something Tree fresh | ~180–190 | ~9–9.5 |

(gate S1's and S2's notes carry the numbers of each run; the CI runner's are its own.)

### The engines' own loops, compared (2.2.1 `ptr` against 2.7 `something`)

Both run `setInterval(…, 50)` with `diff = (Date.now() − player.time) / 1000`, offline catch-up in chunks of
`max(remain / 10, diff)`, `diff *= player.devSpeed` when set, `player.time = now`, then `updateTemp(); gameLoop(diff);
fixNaNs()`. The differences, read in each `js/game.js`:

| | 2.2.1 (`ptr`) | 2.7 (`something`) |
|---|---|---|
| ended | global `gameEnded` | `tmp.gameEnded` |
| offline switch | `player.offlineProd` (in the save) | `options.offlineProd` (the options key) |
| offline cap | `offlineLimit * 3600000` against a `remain` in SECONDS — a cap 1000× the stated hours (an engine quirk, left alone) | `offlineLimit * 3600`, seconds |
| done offline | `player.offTime = null` | `player.offTime = undefined` |
| diff floor | `Math.max(…, 0)` | none |
| besides the tick | `if (needCanvasUpdate) resizeCanvas()` | the canvas (and resets the flag), `tmp.scrolled`, `updateOomps(diff)`, `updateWidth()`, `updateTabFormats()`, and after the tick `adjustPopupTime(trueDiff)` / `updateParticles(trueDiff)` in REAL time |

The faithful drive is the harness tick in both; the display-only lines are run once per frame (above). Both engines
call `gameLoop` by its bare name from that one interval, which is how the controls find it (gate L1 over the roster).

### Returning to ×1 — `player.time`

The engine's next tick after the fast-forward would otherwise see `now − player.time` = the whole fast-forward as one
real-time diff. So the controls **set `player.time = Date.now()` before releasing the loop**, and also keep it at now
four times a second (and every frame) while the loop is held. That is the engine's own write — its loop does
`player.time = now` every tick — and it means a reload in the middle of a fast-forward or a pause credits no offline
time either (gate S5: after 3 s held, the engine's first diff is ~0.05 s; a reload from a held loop credits ~0.25 s).

### Offline catch-up (`offTime`) — LEFT TO THE ENGINE

The three choices were: run it first, fold it into the fast-forward, or leave it to the engine. **Left to the
engine:** a fast-forward neither spends `player.offTime.remain` nor adds to it, and the engine's own loop goes on
spending it (in its usual `remain / 10` chunks) whenever it runs, i.e. at ×1. Reasons: the harness's tick never reads
`offTime`, so leaving it alone is what keeps faithful = harness; folding it in would turn the engine's coarse catch-up
into faithful ticks — a real change to what offline time gives, which is the engine's rule, not ours; and running it
first would make every fast-forward start with an unannounced coarse burst. (A future control could offer "spend my
offline time faithfully" as a target of its own.)

### Coarse mode, and `devSpeed`

Coarse ticks are `tmtLoader.tick(step)` with the player's step (0.25 / 1 / 5 game-seconds). ⛔ **`player.devSpeed` is
not used**: it is the ENGINE's key, it lives in the SAVE, and it multiplies the engine's variable diff rather than
fixing it. Writing it would put the speed into the save, which the ruling forbids. Every place the coarse mode shows —
the readout, the choice, the outcome — says *approximate — results can differ from normal play*.

### Never in `player`

The speed, the mode and the target live in `loader/tmt-speed.js`'s memory. The only `player` write is `player.time`
above (the engine's own). Gate S8 compares `player`'s key paths before and after every speed and a coarse run.

## The API (`tmtLoader.speed`, once `tmtLoader.fetchSpeed()` has resolved)

| Member | Meaning |
|---|---|
| `setSpeed(s)` | `0` (pause), `1`, `2`, `10`, `'max'`. ×1 releases the loop (with `player.time` set to now) |
| `setMode('faithful')`, `setMode('coarse', step)` | the tick: 0.05, or one of `COARSE_STEPS` (refused while a run is going) |
| `run(target)` | `{gs}` \| `{ticks}` \| `{until, cap}` \| `{mark, cap}` (+ `pace`) → a promise of the outcome `{why, text, ticks, gs, …}`, `why` one of `reached` / `cap` / `stopped` / `ended` / `error` / `already` / `refused`. A condition that throws reads false and is counted (`throws`, `lastThrow`) and said. The previous speed comes back when it ends |
| `stop()` | the Stop button |
| `status()` | `{speed, pace, mode, approximate, step, held, loop, ticksPerSec, gameSecondsPerSec, target, last, offline}` |
| `stats()` | frames, ticks, game-seconds driven, the longest frame |
| `open()`, `close()`, `isOpen()`, `showMore(on)`, `root()`, `prefKey()` | the panel |

## Proof that faithful = the harness (gate S1)

A faithful fast-forward of N ticks on the page — the loop held, every other timer live, the panel's display lines
running — lands on the SAME `hashGame` as the harness at `diff 0.05` for N ticks from the same save, automation on:
ptr fresh (profile all, 1,500 ticks), Something Tree fresh (profile all, 1,500), Arc Tree (2.6) on the plain page
(1,500, against `--no-automation`), and ptr from **m28/QL6** — stages, the row cycle, the give-up records, the H22
queue running — for 600 ticks against the page's own tick loop.

⚠ **Why QL6 is compared against the page's own loop and not Node.** From that save, Node and Chromium already differ
WITHOUT the speed controls: 10 plain `tick(0.05)`s land on `points` `2.8540956329795613e988` in Node and
`…617e988` in Chromium — the last bits of one float, from two V8s' `Math`. The same happens on a fresh ptr game by
~3,000 ticks (`14.680713888313306` against `…308`; equal at every hundred up to 2,900). It is a property of the two
JavaScript engines, measured with the plain tick, and it is why "Node ≡ page" holds exactly only over the stretches
the parity gates use. The fast-forward equals the page's own tick exactly, everywhere measured.
