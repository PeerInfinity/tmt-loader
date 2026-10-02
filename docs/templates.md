# Strategy templates (`loader/tmt-templates.js`, tpl1)

A **template** is engine-generic strategy code. It reads a game's **facts** (`games-facts/<id>.json`, `docs/facts.md`),
finds the places where its pattern applies, **checks** on the planner's rolled-back copy whether its plan would work,
and writes the plan as a **queue** (`docs/queues.md`). When no queue can work it says why, and names the nearest thing
that would have to change as a **sub-goal** instead of emitting a doomed queue.

⚖ The rulings this rests on (PTR-strategy design notes §5, §11, §12, §14):
- strategies are DERIVED from data, and a queue is their output; a hand-written queue is the escape hatch (`authored`);
- **no game id, layer id or item id** appears in a template: it matches FACT PATTERNS, and every id it writes into a queue
  comes from a fact or from the engine (gate X1 greps for it);
- **templates propose, the rollback checks** (§12): reading the facts gets the direction right and the moment wrong — the
  multiplier itself grows during a held run — so every number a verdict rests on is measured on the copy, and a "buy"
  verdict is played on the copy before it is believed.

Templates are **harness-only**, like the planner they extend. The page never fetches them; it can play the queue they write.

## Running one: `strategize`

```
node tools/harness/strategize.mjs <game> [--from <snapshot.json>] [--goal <goal id>] [--out queue.json] [--json verdicts.json]
                                         [--facts <file>] [--horizon <game-s>] [--lever-k <game-s>] [--all] [--diff <d>]
                                         [--auto-opt "k=v;…"] [--window <game-s>] [--log <state-log.jsonl>] [--timeout-s <s>]
```

(h22) `--auto-opt`: the automation configuration the checks run under (a stage's winning policy — the copy's reflexes
are the configuration's). `--window` / `--log`: `challenge-attempt`'s stated window and its evidence (below).
`--timeout-s`: the boot child's limit (run.mjs's default 600 s; a check at diff 0.05 ticks 20× as many copy-side ticks).
Goal ids: `upg:<l>:<id>`, `buy:<l>:<id>`, `ch:<l>:<id>`, `reset:<l>` (m30). (m30) `--auto-table <file>`: a whole
other table (run.mjs's) — the table BEFORE a stage that already records the verdict's answer, so the copy's reflexes are
the ones the template has to hold.

It boots the game at the state (`--from`, else a fresh game) with the planner, the templates and the queue runner,
matches every template against `games-facts/<game>.json`, checks each match that is OPEN at that state (the item is
unlocked and not owned; `--all` checks the others too), and prints each verdict with its reasoning, the levers, the
sub-goal and the match funnel. `--out` writes the queue when exactly one verdict carries one. Goal ids are the
planner's: `upg:<layer>:<id>`, `buy:<layer>:<id>`. Every flag is declared; nothing in the live game moves (each verdict
reports `neutral`).

To start from inside a state log, turn a checkpoint into a snapshot first:

```
node tools/harness/checkpoint.mjs <log.jsonl> --list
node tools/harness/checkpoint.mjs <log.jsonl> (--tick N | --last | --last-without q.upg=22) --out snap.json
```

## The interface

```js
{ id, needs: [fact kinds],
  match(facts, opts)      → [binding]     // the fact pattern, against the live state
  check(binding, opts)    → verdict       // the static reading, then the rollback; a buy is CONFIRMED by playing the plan
  plan(binding, verdict)  → queue | null  // pure: the verdict's measured moment, written as steps }
```

Changed from the first cut (design notes §10.3), and why:
- **`plan` takes the verdict, not the state.** The moment a queue acts on comes from the rollback, which `check` runs; a
  `plan(binding, state)` would have to re-measure it or guess it.
- **`check` calls `plan` and plays it on the copy** before it says "buy": a verdict is the plan's own confirmation, so a
  "buy" whose queue does not buy cannot leave the template (it becomes `unconfirmed`, with no queue).
- **A match is only a candidate**: `match` also reports whether the item is open at this state and why not, so a game
  with matches but nothing open says so by name.
- `run(facts, opts)` (what `strategize` calls) runs every template's matches and returns the verdicts with a per-template
  **funnel** — how many price facts, how many shaped in a field, how many with a production, how many with a reset — so
  "no match" is an answer with a reason.

## `time-priced-purchase`

**The pattern** — an item whose `price` fact has a power or exponential shape in a field F (not its currency); a
`production` fact for its currency in F; and `zeroed-by` facts naming the resets that zero F. On PTR that is every
quirk-energy upgrade: their prices grow as `(q.time+1)^k`, quirk energy accrues as `q.time^(E+1)`, and every reset of
row 3 or above zeroes `q.time`.

**What it holds** — every automation feature that calls one of those resets (each layer's `reset` and `challenges`
features: entering or leaving a challenge resets the layer), and the item's own purchase feature, so the purchase is
the queue's and no reflex spends the purse first. Derived from the features' layers and kinds, never from a list.

**The check, in order**
1. *Static*: re-measures the price's and the production's shapes in F at this instant (the facts' exponent probe,
   `planner.facts.shapeIn`). If the purse's exponent beats the price's, waiting helps; otherwise the ratio peaks, and the
   formula says roughly where.
2. *Rollback*: plays the hold on the copy — the same queue runner, the same reflexes — for a horizon (≥ 300 game-s, or
   8× the formula's peak), reading currency ÷ the CHARGED price every tick: `tmp`'s cost, computed at the tick's START,
   which is what the engine's purchase checks and subtracts (tpl1 §16.3; `tmp` costs are refreshed every tick whatever
   tab is open — the closed-tab trap is `unlocked`, read live). ⚠ An earlier line here said "the LIVE price, never
   `tmp`"; the code has judged on the charged price since tpl1, and gate m28 V3 holds it (mutant B of `mutants-m28.sh`
   is the live reading).
3. One of three verdicts:
   - **buy at t\*** — the ratio reaches 1. The plan holds, waits until the item is affordable (with a timeout from the
     measured moment), buys it through the engine, and checks the purchase happened. Then it is **played on the copy**:
     only a plan that bought is emitted.
   - **waiting cannot help** — the ratio peaks below 1. The template replays the hold to the peak and walks the
     **multiplier chain** there: each numeric getter of the currency's layer is scaled ×2 and ×4 on the copy; one that
     scales a tick's production by 2^p and 4^p is a MULTIPLIER (power p), one that moves it otherwise is EXPONENT-like.
     For a multiplier, every numeric input it reads (its own reads, and through the item effects it reads) is searched
     for the value at which the multiplier rises by (1/peak)^(1/p); the planner's knowledge chain then prices that input's
     whole route (the binding wall — a reset requirement further down counts). For an exponent, the lever is one more unit
     of what it reads, priced by that buyable's next level in its currency. The levers are ranked by their log10 distance
     and the **smallest is emitted as a sub-goal** (`{kind: 'value', dimension, threshold}`), with **no queue**.
   - **waiting helps** — the exponents are flipped; the template projects where the ratio reaches 1 and, beyond the
     horizon, says so instead of emitting an unconfirmed queue.

**Measured (tpl1, ptr)** — see the design notes §16 for every number:
- `upg:q:23` from a QL5 state (all/M26 until Quirk Layers ≥ 5, tick 77,196): **waiting cannot help** — the best ratio is
  ≈ 0.018 at q.time ≈ 41; the nearest lever is **total quirks** (32,921 → ≈ 3.4e5, ~1 order), then the next Quirk Layer
  (2^31 quirks, ~8 orders — and it would flip the exponent), then Super Boosters (a Booster wall, ~30 orders of points).
- `upg:q:22` from the last log checkpoint before the reflex bought it: **buy at t\***, confirmed on the copy; the queue
  played live buys it on the same tick.
- something and collection-of-everything: no price shaped in a non-currency field, so no match (the funnel says so).

## Options and the zeroed-at-peak rule (m28, 2026-09-30)

- **`--diff <d>`** (`opts.diff`, default 1): the tick every copy-side measurement runs at. ⚠ **A verdict is a claim
  about ONE tick size.** The charged price lags the live one by exactly one tick, so a price `∝ (F+1)^k` is charged at
  `F − diff`: on the first tick after a reset zeroes F, at diff 1, the engine charges the F = 0 price — a factor
  `2^k` below the live one (q31: 2^8.4 = 338×). Measured from ptr's m28/QL6: q31 peaks at q.time **1** at diff 1
  (10^−2.07; live 10^−4.60) and at q.time **2.35** at diff 0.05 (10^−3.50, the formula's 2.5), and the nearest lever
  moves with it — total quirks 7.06e14 at diff 1, **1.62e16** at diff 0.05. The reflex really buys at that first tick
  at diff 1 (q31 at total 7.096e14, `gates-m28` leg `winner-choff@1`); the page cannot.
- **`zeroedAtPeak`**: a lever whose input is zeroed by EVERY reset the binding holds (the `zeroed-by` facts) and is
  still 0 at the peak cannot be raised AT the peak — the run that raises it is the run that raises F, so the moment
  moves and the price with it. It is listed (`NOT a sub-goal: …`), ranked after the others, never emitted. Measured:
  q31's walk at QL6 priced Super Boosters "0 → 4.27" at q.time 1 as its nearest lever (10^1.30); sb is zeroed by h, o,
  q, ss exactly like q.time. At QL5 (q23) the peak is at q.time 38 with sb 4, so nothing there changes.

**Measured (m28, ptr, m28/QL6 = Quirk Layers 6, q11–q24; design notes §18):**
| | q31 (8.4 · 1e48) | q32 (10 · 1e58) |
|---|---|---|
| verdict (diff 1) | waiting cannot help, peak 10^−2.0689 at q.time 1 | waiting cannot help, peak 10^−12.0689 at q.time 1 |
| levers (log10 distance) | **total quirks → 7.06e14 (1.78)** · the 7th Quirk Layer 2^63 quirks (5.90) · Super Boosters (zeroed at the peak) | **the 7th Quirk Layer (5.90; E 5 → 6 does not flip 7 vs 10)** · total quirks → 1.5e27 (14.1) · Super Boosters (zeroed) |
| verdict (diff 0.05) | peak 10^−3.4991 at q.time 2.35; total quirks → 1.62e16 (3.14) | — |
| once q31 is owned (m28/Q31, tick 88,767) | — | waiting cannot help, peak 10^−3.9974; **total quirks → 2.80948e18 (3.60)** · the 7th Quirk Layer (4.11) |

**And the purchases land on the thresholds** (CI 36822076088, diff 1, every leg twice equal, from QL6 under the qrate1
winner with challenge attempts held — `exclude=challenges:h`): the reflex bought **q31 at +2,696 game-s with total quirks
7.096e14** (sub-goal 7.06e14) and **q32 — M28 — at +54,688 with 2.81084e18** (the Q31 verdict's 2.80948e18, +0.048 %),
still at 6 Quirk Layers. The QL6 q32 verdict's lever (the 7th Quirk Layer) was superseded: q31 raises q11's power 8 → 9.
Without the hold (the winner as it is) the give-up reflex re-enters H22 after every q reset and q31 is not bought in
30,000 game-s (8,000 at diff 0.05); with it, at diff 0.05, q31 at +2,760.2 (total 7.31e14 — the diff-0.05 verdict's
1.62e16 overestimates: Super Boosters were 6 at q.time 1.7, rebuilt in 34 ticks, and total quirks also raise them through
q12, which the single-input walk does not count).
qrate1's reading (10^−4.89 / 10^−17.2) is the same game read at another instant — Q86K, inside an H22 attempt at
q.time 26, with every reset excluded at registration (gate V0 reproduces it): mid-run, the ratio only falls.
⚠ The q11 lever's other input, the q-upgrade COUNT (`player.q.upgrades`, an array), is not a numeric input and is never
priced — yet buying q31 raises q11's power 8 → 9, which is most of what q32 then needs.

## `challenge-attempt` (h22, 2026-10-01)

**The pattern** — an unlocked, incomplete challenge whose attempts are ENDED by resets the automation presses: the
`exits-challenge` facts (docs/facts.md) name every reset that leaves it, and at least one is a `reset` feature. On PTR
that is every `h` challenge — 2.2.1's `rowReset` clears `activeChallenge` on every layer of a row it resets, so q, o and
ss (h's row) end an h attempt exactly as h does. That is why §18.5's 125 H22 attempts all ended at the next `rate-peak`
q reset, with no completion and no give-up.

**What it holds** — every `reset` and `challenges` feature of every exiting layer, the challenge's own `challenges`
feature included: while the queue owns the attempt, no reflex enters, leaves or gives it up. (Under a configuration
that excludes a feature at registration — M28's `exclude=challenges:h` — that feature does not exist and is not held.)

**The check** — the measurement plan is played on the copy: hold, enter, and every tick read the goal currency against
the engine's goal (R3a's `p = log(amount) / log(goal)`), for a stated window (`--window`, default 3,600 game-s — the
same cap the time-priced held run uses; a measurement bound, not a strategy literal). Three verdicts:
- **complete** — the engine's `canCompleteChallenge` holds inside the window. The plan (below) is played on the copy
  again; only a plan that completed and released its holds is emitted (else `unconfirmed`).
- **short** — the currency rose but the window ended first: the shortfall X = goal ÷ the peak amount. The attempt is
  replayed to its peak and each NUMERIC input the `challenge-inputs` fact says moves the gain inside is priced: how far
  the gain moves for ×10+1 (and for +1 of a buyable), and the value at which the gain rises by X (log-space bracket +
  bisection, the gain read the way the probe reads it). Ranked by log10 distance; the nearest is the sub-goal — but
  **never** an input the ENTRY zeroes (`zeroed-by:<challenge layer>:<input>`: entering is that layer's reset, so the
  attempt rebuilds it from 0 — m28's "no sub-goal on a currency the purchase spends") and never one that is 0 at the
  peak (m28's zeroed-at-peak rule). A challenge whose completion is a FUNCTION (`canComplete`) declares no goal value:
  the shortfall is not priced and no lever is ranked (collection-of-everything's `st` 11).
- **cannot-progress** — the goal currency never rose above its reading on entry, or no input the facts name moves it.
It also reports where the table's own exit rule — the `give-up@B/H` modifier of the policy in force, read with the
policy parser — would have conceded the attempt, from the measured trace. It does not tune it.

**The plan** — `hold` → `call startChallenge` **if not already inside** → `wait` until the engine says it entered →
`wait` until `canCompleteChallenge` (timeout: the measured moment + 10 s, `skip`) → `call startChallenge` **if inside**
(the engine completes a challenge whose goal is met as it leaves) → `release` → `wait` until a completion is recorded.
⚠ Both `if`s are load-bearing (docs/queues.md): `startChallenge` pressed INSIDE the challenge leaves it, and pressed
outside enters it. One tick of reflexes runs before a `start` queue's hold binds, and under the shipped table the
`challenges:h` reflex enters H22 in exactly that tick (measured — the first cut's queue then LEFT it); and when an
attempt was cut, the finish must not re-enter (the vacuity control's second attempt was exactly that).

**Measured (h22, ptr, m28/QL6; design notes §20):**
| | |
|---|---|
| under M28's configuration (qrate1 winner + `exclude=challenges:h`), diff 1 | **COMPLETE: 984 game-s after entry**, confirmed on the copy on tick 87,055; the queue played LIVE completes H22 on the same tick (M29), holds released, its log replays equal (70 actions) |
| the same, `--window 25` (the q-reset interval §18.5 saw) | **SHORT**: peak p 0.999175 at t = 25 (10^2.9445 short; §18.5's interrupted Q86K attempt: 0.9992 / 10^2.7); the nearest lever **the Primary Space Building `s.buyables.11` 63 → 265.8 (10^0.63)** — the guide's "Space into Primary", here ranked by the facts (its +1 moves the gain 10^0.031, ×10+1 10^4.79); p, g, s, t points priced but never the sub-goal (the entry zeroes them) |
| under the shipped table | COMPLETE as well (984 game-s); the table's `sequential\|give-up@0.1/30/2x` would concede it at **t = 211 s (p = 0.9998)** — the attempt's points grow LINEARLY (~1.05e3566/s), so the remaining distance in log closes slower than 10 % per 30 s long before the goal |
| the state log, QL6 under the winner, 600 game-s | 13 attempts: 0 completed, 0 given up, 12 ended by a reset (q ×11, h ×1), one open at the end |
| something (fresh, all/S05) / collection-of-everything | 0 matches (no challenge has exits facts) / 1 match, SHORT with the shortfall unpriced (a `canComplete` function) |

## `reset-requirement` (m30, 2026-10-01)

**The pattern** — a layer's RESET whose engine requirement (static: `tmp[l].nextAt`; normal: `tmp[l].requires`; a custom
layer has none the template can state) is read off ONE base field — the `multiplier-reads` fact of the layer's own
`baseAmount` (`reads:<l>:baseAmount`) — that OTHER resets zero (`zeroed-by:<z>:<base>`), at least one of them pressed by
the automation (a `reset` feature). On PTR that is Super Generators: `sg` is a static row-2 layer that needs 200
Generators (`player.g.points`), and eight resets the automation presses zero them — `e`, `s`, `sb`, `t` (its row
siblings: rowReset of row 2 resets row 1) and `h`, `o`, `q`, `ss` (row 3). It is challenge-attempt's hold, for a reset.
Open: the layer is shown and has never been reset (`player[l].unlocked` false) — a layer that has reset before is not
walled by its requirement; `--goal reset:<l>` names one.

**What it holds** — every `reset` and `challenges` feature of every zeroing layer (entering or leaving a challenge resets
the layer), and the layer's OWN `reset` feature: the reset is the queue's, at the moment the rollback measured.

⚠ **The order inside a tick — measured, and not what the brief said.** The brief that asked for this template said
sg's row siblings act earlier in the same tick and wipe Generators before sg decides. On ptr they do not cut them at
all: past q milestone 5, t, s and sb reset nothing (layers.js `resetsNothing`) and the game resets them itself every
few ticks — freed from the hold, the held leg is unchanged to the tick and hash (gates-m30 SIB). The resets that wipe
Generators at the requirement are the row-3 ones, q and h (gates-m30 EV: 74 wipes in 3,000 ticks, q 68, h 6). What IS
earlier is everything: PTR's gameLoop skips a layer that has never been reset (`unl`), so the automation decides that
layer's reset in its FALLBACK pass, after every other layer's slot (the check reads it off `hookStats`: `decidedIn`).
And at the 226,931 wall the reflex never resets sg even at 200: past q milestone 6 `tmp.sg.autoPrestige` is set, so
`reset:sg` YIELDS to a native auto-reset (`yielding:native`) — which the engine never performs for a locked layer.
Generators sat at 200 for 83 ticks with no reset. (That was the yield rule before yield-1. Since yield-2 the default
`nativeYield=slot` yields only in a layer's own slot; from the wall `reset:sg` then resets at tick 226,986, and the rows
above name the old rule, `nativeYield=always`; see docs/automation.md, "Where features run".) The check says so (`afterReach`: the zeroing resets still held, the
layer's own reset feature freed, ten more ticks — does anyone make the reset?). The queue's hold binds from the next
tick's first decision (docs/queues.md), and the reset is the queue's own call in its slot: hold → `wait canReset(l)` →
`call doReset(l)` → `wait player[l].unlocked` → `release`. `canReset` reads `tmp`, which is the tick's START: the wait
is met in the tick AFTER the base reached the requirement, with the zeroers still held.

**The check** — the hold is played on the copy, every tick reading the base against the engine's requirement, until the
engine's `canReset` or the window ends (`--window`, default 3,600 game-s, the same cap as the other templates). Three
verdicts:
- **reset-at** — `canReset` holds inside the window. The plan is played on the copy again; only a plan that made the
  reset and released its holds is emitted (else `unconfirmed`).
- **short** — the base rose but stayed below: X = requirement ÷ the best base. The sub-goal is the base at the
  requirement (a VALUE goal the planner's round chases, docs/planner.md Part 4), with the planner's knowledge walk of
  that value goal as the lever's binding hop. ⚠ That walk is thin: on PTR the base IS a layer's currency, so the chain
  is "g 199 → 200" — no producer or multiplier below it is priced (the next slice's input, if a short verdict ever binds).
- **cannot** — the base never rose above its first reading.
Optional evidence (`--log`): every zeroing reset the automation pressed, with the base just before it (the summary's
`<layer>.p`, so only a base that is a layer's points is readable), how often it had touched the requirement, and how
many resets of the layer itself were made.

**Measured (m30, ptr, diff 1)** — the wall: stages/M28 under the table BEFORE this slice (`snapshots/ptr/m30/
table-before-m30.json`, main 68383aa's) for 141,652 ticks → `m30/W226931` (226,931 / `e09f367518a8fb2d`; q11–q33,
7 Quirk Layers, 196 Generators, Super Generators never reset):
| | |
|---|---|
| from the wall, the table before this slice | **RESET-AT: 55 game-s into the hold**, Generators 200 = the requirement (layers.js: `requires` 200, `base` 1.05, `exponent` 1.25 → 200 at 0 Super Generators); sg decided in the fallback pass; without the queue's call nobody resets it (reset:sg yields); confirmed on the copy, the reset on tick **226,986**; the queue played LIVE resets sg on the same tick (Generators stay 200 — q milestone 6 makes sg's reset reset nothing), holds released, its log replays equal |
| the same, `--window 30` | **SHORT**: Generators 199 of 200 (10^0.0022); the sub-goal Generators ≥ 200 |
| the same queue with the ROW-3 zeroers free | never resets: q and h wipe Generators (gates-m30 VAC; 74 wipes the full hold prevented) |
| the same queue with the row SIBLINGS free | the held leg to the tick and hash (gates-m30 SIB) |
| from the q33 loop on the table's path (`m30/Q33`, 93,879; Generators 0; before q milestone 6) | RESET-AT 642 game-s into the hold (tick 94,521); there the zeroers held are enough — reset:sg makes the reset itself 2 ticks after the reach: why a STAGE works on this path |
| something (fresh, all/S05) / collection-of-everything | 2 / 9 matches, none open (the funnel and each `not-open` line say why: not shown, or already reset) |

**Recorded as a stage** — `q33-sg-unlock` (docs/automation.md, "Stages"): from q33 until Super Generators are unlocked,
the template's hold minus the reset it makes, as `while` gates that read the engine's requirement
(`player.g.points.gte(tmp.sg.nextAt)` — never its number). The table alone then reaches M30 from stages/M28 on tick
94,521 (+9,242 game-s, diff 1; +7,544.8 at diff 0.05), the template's own tick from the q33 state. The gate opens AT the
requirement, which is safe because the tick the base reaches it is a row-1 tick (g), after every zeroer's slot, and sg
is decided in the fallback right after it.
⚠ **Its limit, under the old yield rule** (gates-m30 S3, which names `nativeYield=always`): past q milestone 6 the stage
could not do it — reset:sg yielded, the gate opened at 200 and q and h wiped Generators (from the wall: 14 wipes at 200
in 3,000 ticks, no reset). Under the default since yield-2 (`nativeYield=slot`) that limit is gone: from the wall the
shipped table resets sg at tick 226,986 (gates-yield Y1), with no queue. On the table's own path q33 comes first, so
it never met it. **The stage stays**: the yield fix alone (the table without it) reaches M30 from stages/M28 at +26,614
game-s instead of +9,242 at diff 1, and does not reach it in 20,000 game-s at diff 0.05 (cloud-reports/tmt-yield-1.md).

### The REBUILD — a layer's own currency, zeroed (m31, 2026-10-02)

**The pattern, one level up.** A layer that HAS reset before is walled again when another reset zeroes its own
currency (`zeroed-by:<z>:player.<l>.points`, `effects: zeroes`) and it holds none: its next reset needs the same base the
zeroers wipe. Open: shown, reset before, and holding nothing. "Reset before" is the ENGINE's record — a layer starts
unlocked only when its `startData()` says so (2.2.1 `getStartPlayer`) and `doReset` sets `unlocked` on the first reset
(game.js:206) — so a layer that starts unlocked (PTR's p) is never a rebuild just because it holds nothing yet (ptr
fresh: none open, gates-m31 V5). The hold, the check and the verdicts are the first reset's; "the reset happened" is the
currency back above 0 (`player[l].points.gt(0)`), not `unlocked`, which is already true (mutant D of
`mutants-m31.sh`). A layer that holds its currency says why it is not open (`holds its currency (…; h, o, q, ss zero
it)`).

**Measured on ptr (Super Generators past M30):** under the table, sg resets once at M30 and never again — every row-3
reset zeroes its point, and Generators top out at 196–199 inside a q cycle of ~33 ticks (the requirement is 200). From
`m31/R95400` (stages/M30 + 879 ticks under the table before this slice: a q reset has just zeroed sg) the template says
**REBUILD — RESET-AT 520 game-s into the hold** (tick 95,920), confirmed on the copy, and with the zeroers held reset:sg
makes the reset itself 2 ticks after the reach (sg is unlocked, so it is decided in its own slot). At stages/M30 itself
it is not open (sg holds its one point).

**Worth it toward M31 — measured, not assumed** (the brief's condition for the extension; cloud-reports/tmt-m31-1.md).
A held q cycle from a fresh q reset, the row-3 resets held: Generators reach 200 at ~600 ticks, sg resets, and the
pending quirk gain climbs to 2.3e24 at 4,000 ticks (5.8e20/s) against the table's 1.2e20 every ~33 ticks (3.6e18/s).
But the held gain grows FASTER than linearly in time (≈ t^1.08 over 1,000–4,000 ticks), so `rate-peak` never sees a peak
and never cashes in: every stage that held the zeroers under the table's q policy froze total quirks at 2.45e21 for
30,000 ticks (the hold alone; with the dead cycle members gated; with h, o, ss paused). And it must stay outside the h
challenges: a hold that names `challenges:h` while an attempt is open holds its give-up too (a deadlock inside H31,
measured). What wins is the hold WITH a cash-in the hold cannot starve — `sg-keep` (docs/automation.md, "Stages").

## How a sub-goal reaches the planner (qrate1, 2026-09-30)

A `waiting cannot help` verdict ends in a **sub-goal** — `{kind: 'value', dimension, threshold, why}` — and no queue.
The sub-goal is the planner's to pursue: the P1b round (docs/planner.md Part 4) already targets VALUE goals (the ladder's
`player.<path>.gte(…)` clauses), and a sub-goal is handed to it as one.

```
node tools/harness/strategize.mjs ptr --from <state> --goal upg:q:23 --json verdict.json
node tools/harness/run.mjs ptr --from-snapshot <state> --profile all --planner=auto --planner-ladder tools/harness/ladder/ptr.json \
     --planner-goal verdict.json --rounds-out rounds.json
```

**The seam** is `tmtLoader.planner.setSubgoal(goal)` (`null` clears it); `run.mjs --planner-goal <file>` calls it after
the snapshot's runtime is restored. The file is the sub-goal itself, `{subgoal: …}`, or a strategize `--json` file that
carries exactly ONE sub-goal (several, or none, is refused by name). What the round does with it:
- it is the **active goal ahead of the ladder** until it holds (`goal.source: 'subgoal'` in the round log, id
  `value:<dimension>>=<threshold>` — the ladder's own value-goal id, so a mark clause naming the same quantity is the
  same goal); then the ladder resumes;
- its chain is the planner's own (`chainFor`), so the target is the deepest possible hop exactly as for a mark;
- a chain with no possible hop is skipped with its reason, like a blocked mark; ⚠ but the **reach estimate is recorded,
  not obeyed** (`target.outOfReach`): `reachRounds` exists so a dead top mark does not shadow the marks below it, and a
  rate goal — a total that only rises, ~1 order away — is exactly what that estimate prices as "hundreds of epochs";
- it rides in the planner's runtime state, so a snapshot carries it. With no sub-goal nothing changes: the runtime
  record and the round log are byte-identical to before (gate S2).

**Measured on ptr (design notes §17):** from the QL5 state the q23 verdict's sub-goal is `player.q.total ≥ 308372`. The
round targets it (S1). The configuration that answers it is `reset:q = rate-peak@0/0|turn@10/…` — 308,372 total quirks
2,872 game-seconds after QL5 (1,223.65 at the page's tick), against the shipped table's 109,590 (and 51,032 quirks
after 6,000 game-seconds at the page's tick; CI `36812038216`, every cell twice equal) — and from that first state the verdict
FLIPS: q23 says **buy at t\***, and its queue played live buys it on the copy's tick (T2, T3).

## Gates

`tools/harness/gates-m30.mjs --part push` (reset-requirement: the wall and the M30 fixture, O1 reset-at against the
source / O1s short / O2 live + replay / the hold's vacuity / the log evidence / O3 generality, the stage's switch and its
data, the grep) and `tools/harness/mutants-m30.sh` (a hold that misses the row siblings, a literal requirement in the
stage, a game id); its measurement, M30 at diff 1 and 0.05 and both stage orders, is `qrate1.yml -f part=m30`.
`tools/harness/gates-h22.mjs --part push` (challenge-attempt: the M29 fixture, O1 complete / O1s short with the source's
lever / O2 live + replay / O2s the shipped table / the hold's vacuity / the log evidence / O3 generality, the grep) and
`tools/harness/mutants-h22.sh` (exits that miss rowReset's same-row case, a hold that misses a sibling, a spent lever
emitted, a game id); its measurement, M29 at diff 1 and 0.05, is `qrate1.yml -f part=h22`.
`tools/harness/gates-tpl1.mjs --part oracle` (O1 q23, O2 q22, O3 generality, and the verdicts counted) and `--part grep`;
`tools/harness/gates-qrate1.mjs --part push` (the sub-goal seam S1–S3, the q23 flip T1–T3, the fixtures, the grep);
`tools/harness/mutants-tpl1.sh` (a check that skips its confirmation, a check that ignores the multiplier chain, a game
id in a template, and the runner's own). `tools/harness/gates-m28.mjs --part push` (q31/q32: the fixtures, the declared
facts state, the verdicts V0–V3, the sub-goal seam, the grep) and `tools/harness/mutants-m28.sh` (a skipped declared
state, a verdict on the live price, the zeroed-at-peak rule dropped, a game id).
