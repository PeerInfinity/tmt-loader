# The state log (`loader/tmt-log.js`)

The state log records **every action taken on the game** — the ones you make, the ones the automation makes, and the
ones the game makes by itself — together with **the state each one acted on**. It is for finding out what happened
around a point where progress stopped: which button was pressed, by whom, why, and what the game looked like then.

It is **off unless you switch it on**, and switching it on changes nothing in the game.

## For players

1. Open a game with the automation tools (`&automation=1`), go to the **AU** tab, choose **Advanced**, and press
   **show developer details**.
2. Press **record a state log**. From then on every action is recorded in this tab's memory.
3. Press **download log** at any time to save what has been recorded as a `.jsonl` file (one record per line). Recording
   carries on.
4. Press **stop the state log** to stop.

What to know:

- **Nothing is saved.** The log lives in the tab's memory only; reloading the page loses it. Download it first.
- **It has a size limit** (4 MB by default). Past it, the **oldest** records are dropped first. The checkpoints (full
  copies of your save, one every 600 game-seconds and one at each ladder mark) are always kept, and the downloaded file
  has a `gap` line wherever records were dropped, saying how many.
- **Nothing is fetched until you press the button.** A page that never switches it on loads no extra file.
- `&autoOpt=log=1` in the address starts it as soon as the game is ready (`&autoOpt=log=1;logCap=<bytes>` changes the
  limit, `logEvery=<game-seconds>` the checkpoint spacing).

## What a record looks like

The file is JSON Lines, format `tmt-state-log/1`. The first line is the **header**; every other line is one of three
kinds of record.

```
{"type":"header","format":"tmt-state-log/1","game":"ptr","engine":"2.2.1","loader":"<commit>","origin":"harness|page",
 "start":{"tick":0,"gs":0,"snapshot":null|"tools/harness/snapshots/…","hash":"…","marksHeld":[…]},
 "config":{"diff":1,"profile":"all","autoOpt":…,"noCurrency":false,"noAuto":false,"ladder":"tools/harness/ladder/ptr.json","every":600},
 "hooks":{"family":"ptr","globals":[…],"layer":[…],"gameLoop":true}}
{"type":"action","tick":…,"gs":…,"source":"auto","by":"reset:q","at":["q","slot"],"call":"doReset","args":["q"],
 "did":true,"state":{"q.p":"12","points":"1.2e345"},"hash":"…","why":{"code":"acted:reset","values":{"layer":"q","gain":"3","rule":"…"}}}
{"type":"event","tick":…,"gs":…,"kind":"upg","layer":"q","id":"22","key":"q:upg:22","marks":["M26 — …"]}
{"type":"checkpoint","tick":…,"gs":…,"why":"start|interval|mark|stop","mark":"M12","hash":"…",
 "summary":{…},"player":"<the whole save as JSON>","runtime":{…}}
```

- **`source`** — who acted. `player`: you (a button, a hotkey). `auto`: the automation, with **`by`** (the feature),
  **`at`** (the layer and the point in the tick it acted in), **`why.code`** (the reason code its decision returned —
  the same codes as the Advanced view; `docs/automation.md`, "The reason vocabulary") and **`why.values`** (that
  decision's own numbers, one level deep: a reset's gain and the rule that fired, a give-up's progress against its
  bar, the ids an upgrade run bought). `game`: the game's own
  automation (its auto-prestige, an autobuyer) — a call made inside the game's tick with no automation feature acting.
  `queue` is reserved for the action queues that come next; nothing writes it yet.
- **`call`, `args`** — the engine function and its arguments, exactly as called: `doReset`, `buyUpgrade`, `buyBuyable`,
  `startChallenge` (it also LEAVES the active challenge), a path like `layers.s.buyables.11.sellOne`, or `set` for the
  one automation action that is not a call (the `toggles` kind switching a milestone's toggle on). Only the OUTERMOST
  call is a record: `startChallenge` calling `doReset` inside itself is part of the press.
- **`did`** — whether the call changed the game at all (the saved state before and after differ). A press of yours that
  bought nothing is still recorded, with `did: false`. **A game or automation call that changed nothing is counted,
  not written** (in the `stop` checkpoint's `counts.refused`): the automation's buy loop ends every run of purchases
  with one refused call per buyable, and written out those were 84 % of the log on ptr's M22 → M25.
- **`state`** — what changed in the **summary** since the record before (key → new value, `null` = gone). The summary
  is per layer: points (`<l>.p`), unlocked (`<l>.u`), upgrades, milestones, achievements (`<l>.upg` / `.ms` / `.ach`),
  every non-zero buyable and challenge (`<l>.b.<id>`, `<l>.c.<id>`), the active challenge (`<l>.ac`), and the game's
  points. Every checkpoint carries the whole summary AND the whole save, so any record's state is the checkpoint before
  it plus the changes after.
- **`hash`** — the game hash after the action: the same number as the harness's `hashGame` (the save without the
  automation's own layer).
- **`event`** — something held for the FIRST time (a layer unlocked, an upgrade, a milestone, a challenge completion, a
  buyable above its best), from the Progress tracker (`docs/automation.md`, "Progress") — the log subscribes to it
  rather than having a second idea of what progress is. `marks` names any ladder mark the event satisfied.
- **Checkpoints** are taken only at the END of a tick: at the start, every `every` game-seconds, the first tick each
  ladder mark holds (the same test the harness's ladder uses), and at the stop. On the page they also carry `wall`
  (milliseconds since the log started) on every record.

## What it hooks

The engine's own entry points — the functions a button, a hotkey, the automation or the game itself calls. They are
**data** in `loader/log-hooks.json`, one list per **engine family** (the recorder names no game, layer or item):

- every family: `doReset`, `buyUpg`, `buyUpgrade`, `buyBuyable`, `buyMaxBuyable`, `startChallenge`,
  `completeChallenge`, `respecBuyables`, `clickClickable`, `clickGrid`, `toggleAuto`, `resetRow` (where the game
  declares them), and each layer's `buyables.*.sellOne`, `buyables.*.sellAll`, `clickables.masterButtonPress`;
- the PTR family adds `unlockUpg` (pseudo-upgrades), Mastery's `startMastery` / `completeMastery`, and a tree node's
  own `onClick`; Arc Tree adds its Awakening buttons.

Measured over the roster (log-1): the globals are writable functions in 175 of 175 games (`buyUpgrade` in 172 — two
games do not have it and one declares it with `let`; `unlockUpg` in 4; `clickGrid` in 158). The layer paths come from
a census of every game's click handlers.

**What it does not see:** a game's own autobuyer that changes the save directly without calling one of these (PTR's
Space Building autobuyer calls `buyMax()` on the buyable itself) shows up only as a change in the next record's
`state` — which is enough, because the game does it again by itself in a replay. A click on something the hook list
does not name (a particle, a game's own custom button) is not recorded; if it changes the game, the harness replay
below says so.

⛔ **Transparency.** Every hook runs the original with the caller's own `this`, all of its arguments, returns its
return value and lets its errors through untouched; nothing is written to the save. Once installed a hook stays for
the life of the page, and switching the log off turns it into a plain pass-through.

## For developers: the harness, and the replay

```
node tools/harness/run.mjs <id> … --log out.jsonl [--log-every 600]    # the log of this run
node tools/harness/replay.mjs out.jsonl [--json r.json]                 # replay it; exit 0 = every record equal
```

`--log` works with every other flag (`--from-snapshot`, `--ladder`, `--profile`, `--auto-opt`), except a DRIVEN planner
(`--planner=auto|suggest`), whose rollback excursions tick the game and are refused by name. The boot child writes the
file itself, line by line — never through its result line (the >64 KB truncation R3c found).

**The replay is the log's test.** It boots the header's start (a fresh game, or the same snapshot through the same
route), with the automation loaded under the same options but **switched off** (profile `off`: the same features are
registered, so the same points in the tick exist, and nothing decides). It then re-applies every `player` and `auto`
call — yours between ticks at the tick you made them, the automation's INSIDE the tick, at the same layer's slot where
it was made (the automation acts inside the game's tick) — and never a `game` call, because the game re-does those
by itself. The recorder runs again as it replays, and **every action and checkpoint it writes must equal the
original's**: tick, source, feature, call, arguments, `did`, reason code and hash. Equal all the way means the log
captured everything that mattered. The first difference is printed with the record, the summary keys that differ, and
the entry points they point at (a buyable's amount → the buyable functions; an upgrade list → `buyUpg`/`buyUpgrade`;
no summary key at all → a toggle, a clickable, or a family entry point missing from `log-hooks.json`).

Measured (log-1, diff 1): ptr fresh → M12, ptr `all/M22.json` → M25 (10,188 actions — 187 by the automation, among
them 9 challenge entries, 7 give-ups and 2 exits — and 10,001 by the game's own auto-prestige; 17 checkpoints), Something
Tree fresh → S05 and Collection of Everything fresh 2,000 ticks all replay with every record equal. Size: ptr's M22 →
M25 is 2.3 MB for 5,000 game-seconds, a checkpoint ~17 KB. Cost: the log serialises the save twice per hooked call;
on Collection of Everything (12,011 refused automation calls in 2,000 ticks) that is ~2.8× the wall time.

⚠ **Events are not compared** by the replay: the Progress tracker checks for news inside the automation's own slot
only while a profile runs, so under the replay's `off` an event can arrive later in the same tick, with a later amount.
They are a reading, not an action; nothing is re-applied from them.

⚠ **A page log replays only approximately** (⚖ user, 2026-09-30). The page's ticks are the browser's, and their
lengths are not recorded, so `replay.mjs` refuses a page log by name. A page log is for reading; its checkpoints hold the
whole save, which the harness can resume from.

Gates: `tools/harness/gates-log1.mjs` — part 1 (log OFF is inert: the opening pin, no recorder anywhere), part 2 (log ON
is transparent — the game hash equal to the run without it — and replays exactly, on four legs that each assert they
reached what they are about), part `page` (the switch, the download, `?autoOpt=log=1`, no request until pressed);
`tools/harness/mutants-log1.sh` (nine mutants, each red in the gate that can see it); `loader/log.test.mjs`.
