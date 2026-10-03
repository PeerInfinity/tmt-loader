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
- tpl1 built the runner and a **read-only** readout; the editor (several queues with triggers, edited in the page) is
  qedit-1's, below.

## For players

- **Nothing happens unless a queue is loaded.** A page that loads no queue does not even fetch the runner. (shipq-1) A
  game's automation table may SHIP queues (its `queues` section, below, "Shipped queues"): then the runner is fetched
  with the table, in automation mode only, and the table's queues are part of the automation like its other features.
- Load one with `&autoOpt=queue=<file>` in the address (a path on the loader's site; several are separated by commas), or
  from the console with `tmtLoader.queues.load(<the queue as an object or JSON text>)`. `tmtLoader.queues.status()` says
  what each loaded queue is doing; `tmtLoader.queues.unload(<id>)` removes one.
- While a queue is loaded, the **Advanced** view of the automation tab shows a block per queue: its state, the step it is
  on and that step's comment, what a running wait waits for and its time left (qedit-1), which features it is holding,
  and what it did last. The **Queues** subtab (below) is where queues are made and edited.
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
| `version` | (qedit-1) absent = 1; `2` allows `name` and a call's `times` (below, "Version 2 of the format"); (shipq-1) `3` also allows `relies` |
| `relies` | (version 3) `{options?: {<setting>: <value>}, policies?: {<feature id>: <policy>}}` — the automation settings the queue was checked under (below, "relies") |
| `name` | (version 2) what the editor shows, ≤ 80 characters |
| `steps` | a non-empty list, run in order |

**Step kinds**

| `do` | fields | what it does |
|---|---|---|
| `call` | `fn`, `args`, (`self`), (`if`), (`times`, version 2) | calls an engine function: a global (`buyUpgrade`, `doReset`, `startChallenge`, `buyBuyable`, …) or a layer path in the state log's form (`layers.s.buyables.11.sellOne`; `self: "layers"` calls it on the declaration rather than its `tmp` copy). A call that changes nothing is not an error — the next `wait` is where a queue checks; a call that THROWS aborts the queue. (h22) **`if`**: an expression; the call is made only when it holds — otherwise the step is skipped and recorded (`call-skipped`), and an `if` that throws aborts the queue by name. It exists for TOGGLES: `startChallenge` pressed inside the challenge LEAVES it, so a plan that enters one says `"if": "String(player[\"h\"].activeChallenge) !== \"22\""` (a reflex may have entered it in the tick before the hold bound) |
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

(shipq-1) **A hold PAUSES a reset in the row cycle; it does not take it out.** The R3b row cycle (`|turn@…`) counts a
held reset as a paused member, as a `while` pauses one, so the cycle keeps what it remembers while the queue holds the
row. Before shipq-1 a held reset LEFT the row, and a row left with fewer than two members dropped its cycle and its
memory: measured, the H22 attempt played as a queue reached M29 on the stage's tick and hash and M28 180 ticks away,
because the row-3 cycle had been erased by the hold. `--auto-opt holdCycle=leave` is the old behaviour, named by the
legs measured under it (gates-m28 F1/F2).

## The state log

With the state log on (`docs/log.md`), every runner action is recorded:
- a queue's **call** is an `action` record with `source: "queue"`, `queue: {id, step, comment}` and
  `at: ["au", "queue"]` — written even when it changed nothing (the queue did press it);
- the runner's own actions are `queue` records (`do`: `load`, `trigger`, `hold`, `release`, `wait-met`, `wait-timeout`,
  `call-skipped`, `comment`, `end`, `abort`, `unload`; shipq-1: `relies` — it would start and a setting differs —,
  `condition` — a shipped queue's condition started or stopped throwing —, `rearm` and `spent`), with the queue, the
  step and its comment. A skipped call makes no
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

## The editor (qedit-1) — the `Queues` subtab

⚖ The user's rulings (2026-10-02) are the spec: steps are ENGINE actions, shown by the GAME's own names; the queues are
kept in **browser storage, per game**, plus export / import as JSON files — ⛔ never in the save (a `player` key changes
every save's full hash); v1 = editing with triggers and comments, the generated queues, the run-status, and recording
the player's presses.

### For players

Open a game with the automation tools (`&automation=1`), go to the **AU** tab and choose **Queues**.

1. **new queue** (or type a name and press Enter) adds a queue, switched **Off**. Open it (`+`) to name it, say what it
   is for, and choose when it **starts**: *when the game starts* (on every load, or as soon as it is switched on) or
   *when a condition holds* (type it — the same language as the feature conditions, e.g. `hasUpgrade("p", 11)`).
2. **add** a step: *an action* (choose the layer, then the upgrade, buyable, challenge, button or reset — by the game's
   own names), *a wait for a condition* (with a time limit, and what happens when it runs out: stop the queue or carry
   on), *a pause* (game-seconds), *pause automation tools* / *resume automation tools* (by the tools' titles), or *a
   comment*. Each step has **edit** (its fields, a note), ↑ ↓ and ×.
3. While a queue cannot run, it says why, in plain words, under its name. **On** checks it and arms it; a `start`
   queue then runs on the next tick. While it runs its block shows the **run-status**: the step it is on, the condition
   it waits for and **the time left**, the tools it has **paused**, and what it did last. An edit to a running queue is
   kept and takes effect through **run again from the top**. **Off** and **delete** release every tool it paused.
4. **export** saves the queue as a `.json` file; **import a queue file** adds one (refused, with the reasons, if this
   game cannot play it).
5. **● record my presses**, then press the game's own buttons, then **■ stop recording**: you get a new queue (Off)
   that presses them again. Presses that changed nothing are left out (and counted); the same press repeated within a
   game-second is ONE step with *× N*; a game-second or more between presses becomes a pause. Recording does not need
   the state log.
6. **queues the strategy templates wrote for this game** lists the generated queues with their own comments; **add to
   my queues** adds one (Off).

A queue keeps running until it ends, stops or is switched off; it runs once per page load (switch it Off and On, or
press *run again from the top*, to run it again). A queue the game's table ships can re-arm itself (below).

### The architecture, and why

- **Lazy** (`loader/tmt-qedit.js`), like the state log and the runner. The `Queues` subtab holds one small shell
  component (`tmtl-queues`, registered at boot with the other `tmtl-*`); opening the tab fetches the editor through
  the host's `fetchQueueEditor` door, which then registers its own components (`tmtl-qedit`, `tmtl-qqueue`,
  `tmtl-qstep`, `tmtl-qtext`). The only other door is **this game having saved queues** (the key below exists): then
  the editor is fetched at ready and arms the queues that are switched on — that is what makes a `start` queue run on
  load. A page with no saved queue that never opens the tab requests nothing new and stores nothing (gate Q1).
- **ONE runner, ONE format.** The editor plays its queues through `tmtLoader.queues` (`tmt-queue.js`) and validates
  with its `validate` — the same rules that refuse at load — translated into plain words. The editor writes **version
  2** of `tmt-queue/1` (below); an exported file is exactly what `run.mjs --queue` plays (gate Q4).
- **The store** is ONE key, `tmt-loader:<id>:queues`, through `T.storage.raw` (the loader's own per-game namespace,
  declared in docs/contract.md beside `ui.au.collapsed` and the layer list's): `{format: "tmt-queue-store/1", queues:
  [{enabled, queue}]}`. Every read and write is wrapped; an empty list removes the key. ⚠ It is inside what "clear this
  game's save" clears, as every key of that namespace is (docs/mobile.md records the same consequence for the others).
- **Names.** A step's words come from the game's declarations — an upgrade's or buyable's `title`, a challenge's
  `name`, a layer's `name`, a feature's `title` — read guarded (`withoutRaisingNaN`), HTML stripped. The ids are a
  developer detail (*show developer details* in Advanced).
- **Drafts and presses** (V2 / V6): a typed field (`tmtl-qtext`) keeps a local draft until Enter / change / blur and is
  never overwritten while focused, with every key stopped at the field (the game's hotkeys); a press keeps no state —
  it calls an operation and the view re-reads.
- **Recording** listens on the state log's own wrappers (`T.stateLog.tap`, docs/log.md): one hook path, so a press is
  seen once (gate Q11; the second-wrapper mutant counts it twice). It keeps `source: player` presses only.
- **Generated queues are SHIPPED, not generated in the page.** A template needs the planner's rolled-back copy and the
  game's facts — minutes of harness work the page does not carry ("Templates are harness-only", docs/templates.md).
  `games-queues/index.json` (written and checked by `tools/queues-catalog.mjs`, whose SOURCES name each committed
  template-written queue's game and state) lists them; the page requests it only when the player opens the list, and
  each queue file only when the player adds it (`T.fetchLoaderText`).
- **Phone**: every row is a wrapping flex row, no `white-space:nowrap`, inside the same fixed-layout table at 100 % as
  the other roots (V5) — measured at 390 px with and without `?mobile=1` (gate Q13).

### Version 2 of the format

`"version": 2` (absent = 1, exactly tpl1's format) adds two fields and nothing else: a queue's **`name`** (≤ 80
characters; the `id` stays the key) and a call's **`times`** (1–1000: the same call that many times in a row, in one
slot — each one an `action` record in the state log). A version this runner does not know, or a version-2 field
without `"version": 2`, is refused by name: a field an older runner ignored could change what a queue does.

### For developers

`tmtLoader.qedit` (once loaded): `list()`, `store()`, `create(name)`, `rename`, `setTrigger`, `setComment`,
`setEnabled(id, on)`, `restart`, `remove`, `addStep` / `setStep` / `moveStep` / `deleteStep`, `exportText` /
`download` / `importText`, `catalog()` / `addGenerated(entry)`, `describe(step)`, `actions()`, and
`record.{start, stop, status}`. `tmtLoader.qeditLoad()` fetches it.

Gates: `tools/harness/gates-qedit.mjs` (14 page rows + the grep; CI job `qedit`), `tools/harness/mutants-qedit.sh`
(seven mutants), `loader/qedit.test.mjs`; `tools/queues-catalog.mjs --check` in the fast job.

## Shipped queues (shipq-1) — queues as parts of a game's automation

⚖ The user's goal (2026-10-02): the page plays the whole game from parts a player can make sense of — **queues** (one-off
moves, with a start condition and comments), **stages** (ongoing behaviour while a condition holds) and the reflexes'
settings — all shipped as DATA in `games-auto/<id>.json`. The harness (facts, templates, planner) is the factory that
writes those parts with measured rows; the page never needs the planner. This slice is the first rung: shipped
conditional queues.

### For players

A **shipped queue** is a move the game's automation makes by itself when its moment comes — on PTR, *attempt the
Descension hindrance (H22) once you have 6 Quirk Layers: hold the resets that would end it, enter it, wait for its goal,
finish it, then let everything go again*. The **Advanced** view of the automation tab shows it as *shipped queue …* with
what it is for and its state in words: **armed — waiting for its condition**, **running** (with its step, the condition
a wait waits for and its time left, and the features it holds — each held feature says *Held by queue …*), **done**,
or why it does not start (*the automation is off*, *a feature it takes over is switched off*, *it relies on a setting
that is different*, *cooling off*). It acts only where the automation does: never under the profile `off`, and under
your own choices (`saved`) only while every feature it holds is switched on. It is never written into your own queues;
`tmtLoader.queues.copyShipped(<id>)` gives you a copy (a new id, *copy of …*, its condition written into its trigger)
that the Queues tab can import and you can edit (the editor's own button is the next slice's).

### The table's `queues` section

```json
"queues": [
  { "id": "ca-ch-h-22",
    "when": "player.q.buyables[11].plus(tmp.q.freeLayers).gte(6)",
    "rearm": "once",
    "queue": { "format": "tmt-queue/1", "version": 3, "id": "ca-ch-h-22", "trigger": {"on": "predicate", "when": "…the template's match…"},
               "relies": {"options": {"nativeYield": "slot", "stages": "on", …}}, "steps": [ … ] },
    "provenance": [ { "gate": "…", "commit": "…", "run": "…", "note": "…" } ] }
]
```

| field | |
|---|---|
| `id` | the queue's own `id` (one id: the entry and its queue must carry the same) |
| `when` | the TABLE's boundary — where the move was measured to be worth making (the stage it replaced had the same) |
| `rearm` | `once` (default): once per page load. `each`: again every time the condition turns from false to true |
| `cap`, `coolOff` | `each` only, both required: at most `cap` runs per page load, and a run starts no sooner than `coolOff.gs` game-seconds after the previous one ended |
| `enabled` | `false` ships it switched off |
| `queue` | the queue itself, INLINE (`tmt-queue/1`) |
| `provenance` | REQUIRED, as a stage's: the measured rows behind it (`tools/auto-tables.mjs --provenance` reads them as `queue:<id>`) |

**Inline, not a reference — and why.** The table is ONE document, fetched before the automation runs, and its
provenance is about exactly these steps. A reference to a file would be a second request at boot and a second file that
could drift from the measured one. The generated-queue catalog (`games-queues/`) stays the player's library; gate T1
checks that the inline queue IS what the template writes from the measured state.

**When it starts.** The entry's `when` AND the queue's own trigger (the template's match, below) — read ONCE PER LOOP,
where the stages are read (before the first feature decides): a condition that becomes true inside loop N starts the
queue in loop N+1's queue slot. That is the stage rule, and it is measured: read at the queue's slot instead, the H22
queue entered one tick earlier and every later mark moved. A condition that THROWS reads as false and says so (the
readout, one `condition` log record), as a stage's does.

**Re-arming.** `each` re-arms the queue after a run ends (done or aborted): from the top, holding nothing (⛔ every run
ends by releasing every hold, `finish`). It starts again only after (1) its condition has read FALSE at least once since
the run ended — an edge, not a level — and (2) `coolOff.gs` game-seconds have passed since that end, and (3) fewer than
`cap` runs were made; at the cap it is `spent`. A flickering condition therefore cannot loop: gate R2 drives a condition
true 3 game-s of every 6 and gets exactly `cap` runs, each ≥ the cool-off after the last. ⚖ No shipped entry uses
`each` yet: its cool-off must be MEASURED (the period of the condition it waits on, cited in the entry's provenance),
never guessed.

**`relies`** (queue format version 3) — the settings the template's check ran under: every automation option the core
reports (`tmtLoader.autoConfig()`: `nativeYield`, `stages`, `passiveYield`, `resetDefault`, `turnMark`, `exclude`,
`include`) and the policy in force of every feature the queue does NOT hold that is not the table's own (a stage's, an
option's). When the queue would START (any queue, shipped or not), the runner compares them; one that differs keeps it
from starting, by name (*it relies on the setting nativeYield = slot, and it is always*), and it is re-read every tick
until they agree. Measured: the catalog's H22 queue was checked with `exclude=challenges:h`; under the shipped table it
does not start (the challenge reflex would race it), and under its own configuration it does (gate L1).

**A configuration that leaves out a feature the queue names** (one it holds, or one in its `relies.policies`) cannot
play the queue: EXCLUDED (`exclude=<id>`, or the table's own `off`) or outside a `kinds=` restriction (the S1 anchors run
`kinds=reset,upgrades,buyables`, so no `challenges:h`). The feature is a derived one, only not registered in this run —
the table stays valid under any `kinds`, as its own feature ids are checked against the whole derived set. The queue is
left out, by name (`tmtLoader.queues.shippedSkipped()`, which says which feature and why), and the run goes on — that is
a configuration, not a broken table. A feature the game does not derive at all, and a queue the runner REFUSES for any
other reason, fail the load by name, like a bad table entry (gate shipq K2, K4).

**Memory.** A shipped queue that has done nothing yet is NOT written into `runtimeState()` — the table re-creates it —
so a run whose shipped queues never started writes exactly the record it wrote before (gate K3). Once one has run it is
written (`owner: 'table'`, its runs, its cool-off), and a restore puts it back where it was; a record without it re-arms
it fresh. `--auto-opt shippedQueues=off` measures the table without them (the templates' checks run that way:
`strategize` turns them off, so a check measures its own plan alone).

### PTR's one shipped queue

`ca-ch-h-22` — the `challenge-attempt` template's queue for H22, written from `m28/QL6` under the shipped table, with
the table's boundary *6 Quirk Layers* (the boundary of the stage it replaced, `ql6-h22-attempt`). The stage said "while
6 Quirk Layers and H22 is open: run challenges sequentially, and pause q, h, o and ss while one is active"; the queue says
the same move directly: hold h, h's challenges, q, o and ss; enter H22 unless already inside; wait for the goal (at most
the check's window, 3,600 game-s); finish it; release. From `all/M26` the table alone reaches **M29 at 81,779
(`be1df4037cbb5804`), M28 at 85,279 (`827cf164da85a931`) and M30 at 94,521 (`132127d4d5573106`)** — the stage's ticks
and hashes (gates-shipq A1, A0; at diff 0.05 the `shipq-equal@0.05` merge row).

**The readout, in a player's words (shipq-2).** With developer details off, every feature id in the queues' readout —
a hold step, what a queue holds, why it does not start, its last outcome — is drawn as the feature's TITLE, as
`held:queue` and the reason lines are; the raw ids appear only under *show developer details* (gate A1-2, the 390 px
player view).

**On an author's page (embed mode, shipq-2).** The runner is fetched from the loader's origin (`attach.mjs`, the same
`fetchQueueRunner`), and only when the table IN FORCE ships an enabled queue: `data-game="ptr"` with automation on asks
for `loader/tmt-queue.js` once; a page without `data-game`, or with an author's table that ships none, never does. Gate
E1 declares it that way (`embedverdict.mjs`, `declaredLoaderFiles(…, {queues})`).

Gates: `tools/harness/gates-shipq.mjs` (push: vocab K1–K4, rearm R1–R4, tpl T1–T3, relies L1–L2, accept A1/A0, grep X1;
page: PG, G1; the measurement legs A@1/ctl@1/A@0.05/ctl@0.05 in `qrate1.yml -f part=shipq`), `tools/harness/mutants-shipq.sh`.
