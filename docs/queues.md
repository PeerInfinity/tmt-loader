# Action queues (`loader/tmt-queue.js`, tpl1)

A **queue** is a short list of actions to take on the game, in order: press an engine function, hold some of the
automation's features while waiting for a condition, then let them go. The automation's features are **reflexes** —
each one decides every tick on its own. A queue is for what a reflex cannot express: *stop resetting for a while,
wait until something becomes affordable, buy it, carry on.*

Queues are usually written by a **strategy template** from the game's facts (`docs/templates.md`); a queue written by
hand is the escape hatch and says so (`"source": "authored"`). Either way a queue file is plain JSON.

⚖ The rulings this rests on (PTR-strategy design notes §5, §11):
- a step is an **engine action** — an engine function and its arguments (`buyUpgrade("q", 22)`), never a click on the page;
- the runner names no game, layer or item: a queue names them as data;
- this slice builds the runner and a **read-only** readout. Editing queues in the page, and several queues with
  triggers managed there, is the next slice; nothing here precludes it.

## For players

- **Nothing happens unless a queue is loaded.** A page that loads no queue does not even fetch the runner.
- Load one with `&autoOpt=queue=<file>` in the address (a path on the loader's site; several are separated by commas), or
  from the console with `tmtLoader.queues.load(<the queue as an object or JSON text>)`. `tmtLoader.queues.status()` says
  what each loaded queue is doing; `tmtLoader.queues.unload(<id>)` removes one.
- While a queue is loaded, the **Advanced** view of the automation tab shows a block per queue: its state, the step it is
  on and that step's comment, which features it is holding, and what it did last.
- A feature a queue is **holding** says so in its own block: *"Held by queue X (step N) — it is released when the queue
  ends, aborts or is unloaded"*, and its on/off button reads **Off** with a **HELD** line naming the queue. Your own
  saved on/off choice is not changed; the queue only overrides it while it holds.

## The format (`tmt-queue/1`)

```json
{"format": "tmt-queue/1", "id": "tpp-upg-q-22", "trigger": {"on": "start"},
 "source": {"template": "time-priced-purchase", "goal": "upg:q:22", "facts": ["price:q:upgrade:22", "…"]},
 "comment": "why this queue exists",
 "steps": [
  {"do": "hold", "features": ["reset:q", "reset:h", "challenges:h", "upgrades:q"], "comment": "these zero q.time"},
  {"do": "wait", "until": "player.q.energy.gte(layers[\"q\"].upgrades[22].cost())", "timeout": {"gs": 27}, "onTimeout": "abort"},
  {"do": "call", "fn": "buyUpgrade", "args": ["q", 22]},
  {"do": "wait", "until": "hasUpgrade(\"q\", 22)", "timeout": {"gs": 2}, "onTimeout": "abort"}
 ]}
```

| field | |
|---|---|
| `id` | 1–80 letters, digits, `_ . : -`; unique among the loaded queues |
| `trigger` | `{"on": "start"}` (default) — the first tick after it is loaded; `{"on": "predicate", "when": "<expression>"}` — the first tick on which the expression holds |
| `source` | `"authored"`, or `{template, goal, facts}` for a generated queue |
| `steps` | a non-empty list, run in order |

**Step kinds**

| `do` | fields | what it does |
|---|---|---|
| `call` | `fn`, `args`, (`self`), (`if`) | calls an engine function: a global (`buyUpgrade`, `doReset`, `startChallenge`, `buyBuyable`, …) or a layer path in the state log's form (`layers.s.buyables.11.sellOne`; `self: "layers"` calls it on the declaration rather than its `tmp` copy). A call that changes nothing is not an error — the next `wait` is where a queue checks; a call that THROWS aborts the queue. (h22) **`if`**: an expression; the call is made only when it holds — otherwise the step is skipped and recorded (`call-skipped`), and an `if` that throws aborts the queue by name. It exists for TOGGLES: `startChallenge` pressed inside the challenge LEAVES it, so a plan that enters one says `"if": "String(player[\"h\"].activeChallenge) !== \"22\""` (a reflex may have entered it in the tick before the hold bound) |
| `hold` | `features` | holds those automation features (ids as the Advanced view shows them: `reset:q`, `upgrades:q`, …) until released |
| `release` | (`features`) | releases those, or every hold of this queue when `features` is left out |
| `wait` | `until`, `timeout: {gs}`, `onTimeout: abort \| skip` | waits until the expression holds, at most `gs` game-seconds; then aborts the queue or skips to the next step. A wait with no timeout is refused (a queue that can wait forever is a silent stall with its holds in force). An expression that throws aborts the queue, by name (a throw is not a false) |
| `comment` | `text` | a note; recorded in the state log and shown in the readout |

Any step may carry a `comment`. Expressions are the language the table's gates and the ladder already use: a
JavaScript expression over the game's globals, compiled once (`tmtLoader.predicate`).

**Refused, by name, never half-run.** A queue with an unknown format or step kind, a feature this game does not have,
an expression that does not compile, an engine function that does not exist, or a wait without a timeout is refused
when it is loaded, with every reason listed, and nothing is loaded.

## When a queue acts — the queue's slot

Once per tick, in the `au` layer's automate **after its fallback pass**: after every feature of the tick has decided,
and still inside the tick. Triggers and waits are read there too, so the condition a step acts on is the state it acts
on. The reasons:
- inside the tick, so a replay can re-apply a queue's call in the same place (between ticks a replay diverges — the state
  log learned that for the automation's own calls);
- after the reflexes, so nothing undoes or races a queue's purchase within the tick, and a hold it places is in force
  from the next tick's first decision (⚠ so the tick in which a hold is placed still ran its reflexes);
- the `au` layer is a side layer that both engines call every tick whatever is unlocked, under every profile.

## Holds

A hold is a runtime override, never written to the save: it wins over the profile `all`, the player's saved choice and
a runtime enable override (the advanced planner's epoch) — everything except the profile `off`. ⛔ **Every hold is
released when its queue ends, aborts or is unloaded**, and a restore that drops the queue (a planner excursion on the
copy) drops its holds with it. Two queues may hold the same feature; it stays held until both let go.

## The state log

With the state log on (`docs/log.md`), every runner action is recorded:
- a queue's **call** is an `action` record with `source: "queue"`, `queue: {id, step, comment}` and
  `at: ["au", "queue"]` — written even when it changed nothing (the queue did press it);
- the runner's own actions are `queue` records (`do`: `load`, `trigger`, `hold`, `release`, `wait-met`, `wait-timeout`,
  `call-skipped`, `comment`, `end`, `abort`, `unload`), with the queue, the step and its comment. A skipped call makes no
  `action` record, so the replay has nothing to re-apply for it.

The replay re-applies queue calls in the queue's slot exactly as it re-applies the automation's calls in theirs, and
compares them like every other action. `queue` records are readings, like progress events: not re-applied, not
compared — what a hold changed shows up as the automation's own (compared) actions.

## Memory

The runner's position, wait clocks and holds are part of `tmtLoader.runtimeState()` (a `queues` block) **only while a
queue is loaded**: a run with no queue writes exactly the record it wrote before. A snapshot taken while a queue was
loaded needs the runner to resume (the harness loads it by itself; anywhere else a restore without the runner is
refused by name rather than run differently).

## For developers: the harness

```
node tools/harness/run.mjs <game> … --queue <file> [--queue <file> …]   load queues before the first tick
node tools/harness/run.mjs <game> … --queue-runner                      the runner with nothing loaded
```

The result carries `queueStatus` (every queue's state, step, holds and last action). The queues are loaded after the
state log starts, so `--log` records the `load`. Committed test queues: `tools/harness/queues/tpl1/`; template-emitted fixtures: `tools/harness/queues/m28/`, `queues/h22/`, `queues/m30/`.

Gates: `tools/harness/gates-tpl1.mjs` — part `inert` (no queue moves nothing: the opening pin with the runner loaded,
two other games ticked with and without it), part `runner` (hold → wait → call → end; a timeout aborting; an unload
mid-queue; the held reason; replay equal), part `oracle` (the template, `docs/templates.md`), part `grep`.
`tools/harness/mutants-tpl1.sh`; `loader/queue.test.mjs`.

## What the editor will add (the next slice)

Editing a queue's steps in the page, several queues with their triggers managed there, saving them with the game, and
recording clicks as engine calls. A queue file stays plain JSON in this format, so an editor reads and writes the same
files the harness plays.
