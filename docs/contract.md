# `window.tmtLoader` — the hook contract (L1 + A1)

`loader/page.js` creates `window.tmtLoader` before any game script; `loader/tmt-auto.js` (a classic script, inserted
after the game's scripts, and run unchanged by the Node harness through `vm.runInThisContext`) fills in the members
below. Runners (the Playwright harness, later an embedding page) talk only to this object.

**Automation is opt-in.** The page defines `tmtLoader.automation` from `?automation=1` (the Node harness: ON by default,
`--no-automation` for the plain page) before `tmt-auto.js` runs. Without it the file stops after the contract members
— `tick`, `stateJSON`, `hash`, `pause`/`resume`, `save`, `loadFrom`, `ids`, `storage`, `profile('off')` — and adds
**no `au` layer, no DOM, nothing in `player`**, and the page does not load `games-auto/<id>.js`. The registry members
(`registerAutoFeature`, `features`, `setPolicy`, `featureState`, `hookLayer`, `hookStats`) are then undefined, `profile()`
accepts only `off` (anything else throws), and `?profile=` / `?autoOpt=` are ignored with a console warning.

It reads the engine's globals as **bare identifiers** inside its members, never at load: `player`, `layers`, `tmp`,
`modInfo` may be global `let`s (Something Tree's `modInfo` is), which are not `window` properties.

| Member | Meaning |
|---|---|
| `id`, `manifest` | the game id (`?mod=`) and its parsed `manifests/<id>.json` |
| `ready`, `error`, `step` | `ready` turns true after `onload` (and the managed pause); any failure sets `error = {step, message}` and shows an overlay. Poll `ready \|\| error`, never a bare timeout. |
| `automation` | `?automation=1` (docs/automation.md); `false` = contract-only mode, the rows below marked *(automation)* do not exist |
| `managed` | `?managed=1`: the loader calls `pause()` right after `onload`; the runner drives `tick()` |
| `plan`, `loaded`, `modFiles` | the `interpret()` plan, the files executed in order, the modFiles paths |
| `pause()` / `resume()` | stop / restart every `setInterval` the timer recorder saw (game loop, autosave, canvas flag, component timers). Interval ids are logical and survive a pause, so a later `clearInterval(id)` still works. Timeouts and animation frames are counted, not paused. |
| `timers` | `{paused, counts, list()}` |
| `tick(diff, n = 1)` | `n` × (`updateTemp(); gameLoop(diff); fixNaNs?.()`) — the census/probe loop; returns `{ticks, gameSeconds}` |
| `ticks`, `gameSeconds` | counters owned by `tick()`; reset by a page load |
| `stateJSON(opts)` | `JSON.stringify(player)` without keys named `time` / `offTime` at any depth, plus `manifest.headless.stateMask`; `opts.exclude` = top-level `player` keys to drop (`['au']` compares against a pre-A1 anchor) |
| `hash(opts)` | Promise of the first 16 hex of sha256(`stateJSON(opts)`) — `crypto.subtle` in the page, `node:crypto` in Node (injected as `sha256hex`); equal by gate G3 |
| `save()` | the game's own `save()` with **no argument**; returns `storage.list()` |
| `loadFrom(json)` | `importSave(btoa(json), true)` — the game's own import. **Both engines then reload the page**; the import completes on the next `ready`. In Node the harness boots a fresh process on the storage `importSave` wrote. |
| `ids()` | `{layers: {id: {row, type}}, ids: ["<layer>:<ms\|upg\|buy\|ch\|ach>:<id>"], counts}` — numeric ids only (the census rule); layers the loader adds (`au`, flagged `tmtLoaderLayer`) are left out |
| `profile(name)` | *(automation)* `off` \| `all` \| `saved`; contract-only: `off` only (docs/automation.md); no argument returns the current one. The page applies `?profile=` after `onload` (default `off` when managed, else `saved`); the Node harness `--profile` (default `off`) |
| `registerAutoFeature(def)`, `features` | *(automation)* the automation registry (docs/automation.md): kinds `reset` / `upgrades` / `buyables`, default OFF; registering hooks the layer's `automate` |
| `setPolicy(id, policy)`, `featureState(id)` | *(automation)* switch a feature's policy at runtime (never saved); a feature's saved/unlocked/active state |
| `hookLayer(layer)`, `hookStats()` | *(automation)* install the automate wrapper without a feature (test probe; `?autoOpt=hookAll=1` hooks every tree layer); per-layer call counters, `doubles`, `loops`, actions per feature |
| `options` | *(automation)* table options: `?autoOpt=k=v;k2=v2` in the page, `--auto-opt` in the harness |
| `storage` | `{prefix, raw, list(), clear()}` — the save namespace (`tmt-loader:<id>:`) and the raw `Storage` methods |

## Per-engine notes (measured in L1)

| | TMT 2.2.1 (`ptr`) | TMT 2.7 (`something`) |
|---|---|---|
| save keys | `ptr` (all slots, base64) | `<name>-<author>` and `…_options` |
| `importSave(str, true)` | `save()` then `loadSave()` → `location.reload()` | `save()` then `location.reload()` |
| intervals at load | 3 (game loop 50 ms, canvas flag 500 ms, autosave 5 s) | 3 at load; components add hold-to-buy intervals |
| `modInfo` | global `let`; no `modFiles` | global `let`; 17 `modFiles`, prefix `js/` |
| state mask | `time`, `offTime` | `time`, `offTime` (no drift found) |
| layer node selector | `#app .treeNode` | `#app .treeNode` (the `au` side node also carries `.treeNode` here, so the count is one higher with `?automation=1`) |
| side node (`au`) | `#app .smallNode.au` | `#app .smallNode.au` |
| `automate()` per `gameLoop` | once per layer, but **skipped for a layer not unlocked** (`unl(layer)`); never from `updateTemp` | once per layer, every tree layer; never from `updateTemp` |
| side layers | no reset (`rowReset("side")` skips `layerDataReset`) | no reset (`!isNaN(row)` guard); `gameLoop` writes `player[side].best` from `points` every tick |
| headless prestubs | `colors` (declared only in the skipped `canvas.js`) | none |
