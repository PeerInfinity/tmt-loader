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
                                         [--facts <file>] [--horizon <game-s>] [--lever-k <game-s>] [--all]
```

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
   8× the formula's peak), reading currency ÷ the LIVE price every tick (⚠ never `tmp`: in the PTR family a closed tab's
   `tmp` lags — §12's 0.0193 was exactly that).
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

## Gates

`tools/harness/gates-tpl1.mjs --part oracle` (O1 q23, O2 q22, O3 generality, and the verdicts counted) and `--part grep`;
`tools/harness/mutants-tpl1.sh` (a check that skips its confirmation, a check that ignores the multiplier chain, a game
id in a template, and the runner's own).
