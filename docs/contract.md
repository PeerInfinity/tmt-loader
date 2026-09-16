# `window.tmtLoader` — the hook contract (L1 + A1 + S1)

`loader/page.js` creates `window.tmtLoader` before any game script; `loader/tmt-auto.js` (a classic script, inserted
after the game's scripts, and run unchanged by the Node harness through `vm.runInThisContext`) fills in the members
below. Runners (the Playwright harness, later an embedding page) talk only to this object.

**Automation is opt-in.** The page defines `tmtLoader.automation` from `?automation=1` (the Node harness: ON by default,
`--no-automation` for the plain page) before `tmt-auto.js` runs. Without it the file stops after the contract members
— `tick`, `stateJSON`, `hash`, `pause`/`resume`, `save`, `loadFrom`, `ids`, `storage`, `profile('off')` — and adds
**no `au` layer, no DOM, nothing in `player`**, and the page does not load `games-auto/<id>.js`. The registry members
(`registerAutoFeature`, `features`, `setPolicy`, `featureState`, `hookLayer`, `hookStats`, `runtimeState`, `predicate`, `autoDerivation`, …) are then undefined, `profile()`
accepts only `off` (anything else throws), and `?profile=` / `?autoOpt=` are ignored with a console warning.

It reads the engine's globals as **bare identifiers** inside its members, never at load: `player`, `layers`, `tmp`,
`modInfo` may be global `let`s (Something Tree's `modInfo` is), which are not `window` properties.

| Member | Meaning |
|---|---|
| `id`, `manifest` | the game id (`?mod=`) and its parsed `manifests/<id>.json` |
| `ready`, `error`, `step` | `ready` turns true after `onload` (and the managed pause); any failure (a loader input that does not load, or a script's own top-level error — see `pageErrors`) sets `error = {step, message}` and shows an overlay. Poll `ready \|\| error`, never a bare timeout. |
| `automation` | `?automation=1` (docs/automation.md); `false` = contract-only mode, the rows below marked *(automation)* do not exist |
| `managed` | `?managed=1`: the loader calls `pause()` right after `onload`; the runner drives `tick()` |
| `plan`, `loaded`, `modFiles` | the `interpret()` plan, the files executed in order (skipped files are not in it), the modFiles paths |
| `skipped` | manifest-relative paths of game scripts (static or modFiles) that **failed to load and were skipped**, in order; one `console.warn` each. A browser skips a `<script src>` that 404s and keeps going, so the loader does too. The loader's own inputs — the manifest, `index.html`, `loader.js`'s source, a vendored file, `loader/tmt-auto.js`, `games-auto/<id>.js` — still fail the load. Gate G1 allows a skip only for a path in the manifest's `load.known.missingScripts` (docs/manifest.md) |
| `pageErrors` | every uncaught error that reaches `window`, as `{when: 'before-ready' \| 'after-ready', message, filename}`, appended as they happen. **Attribution rule:** while a script is being inserted, only an error whose `ev.filename` equals that script's resolved `src` (an inline script: the document URL) is the script's own and fails the load (overlay, `error`). Errors from a game's timers, earlier scripts or Vue do not fail the load; they are recorded here. G1 allows `before-ready` entries only when `load.known.errorsBeforeReady` is declared, and `after-ready` entries never |
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
| `autoTable` | *(automation)* the per-game DATA table, assigned by `games-auto/<id>.js` BEFORE `tmt-auto.js` runs (absent = `{}`): `id`, `unlockOrder`, `kindOrder`, `policies`, `alternatives`, `order`, `gates`, `off`, `keep`, `clickables`, `options` (docs/automation.md); an unknown key or feature id throws at load |
| `features` | *(automation)* the registered features, in layer order × kind order — DERIVED from each tree layer's declarations (`toggles` / `upgrades` / `buyables` / `challenges` / `clickables` / `reset`) and shaped by `autoTable` |
| `autoDerivation`, `autoExcluded`, `autoOptions` | *(automation)* the derivation's summary (`kindOrder`, `kinds`, `candidates`, `registered`, `excluded`, `outOfKinds`, `multiTogglesSkipped`, `unlockOrder`); the table's `off` entries with their reasons; the table's `options` with `?autoOpt=` on top |
| `predicate(src)` | *(automation)* the compiled predicate `new Function('return (' + src + ')')` (cached) — the global scope, the harness's `--until` / `--marks` language |
| `registerAutoFeature(def)` | *(automation)* registers one feature by hand (what the derivation calls): kinds as above, a valid policy for the kind, `default` must be false (true throws); registering hooks the layer's `automate` |
| `setPolicy(id, policy)`, `featureState(id)` | *(automation)* switch a feature's policy at runtime (never saved); a feature's saved/unlocked/active state |
| `hookLayer(layer)`, `hookStats()` | *(automation)* install the automate wrapper without a feature (test probe; `?autoOpt=hookAll=1` hooks every tree layer); per-layer call counters, `doubles`, `loops`, `actions` per feature, `challenges` enters / exits per feature |
| `runtimeState()`, `restoreRuntime(rt)` | *(automation)* the registry's memory outside `player` as plain JSON — each interval reset's `lastReset`, the loop counter and ran-at marks, the hook statistics — and its restore (`restoreRuntime(runtimeState())` is the identity); the harness's snapshots carry it (`docs/harness.md`) |
| `options` | *(automation)* `?autoOpt=k=v;k2=v2` in the page, `--auto-opt` in the harness: `policy:<id>=…`, `kinds=…`, `kindOrder=…`, `unlockOrder=…`, `rowTwoOrder=…`, `hookAll=1`, free keys |
| `storage` | `{prefix, raw, list(), clear()}` — the save namespace (`tmt-loader:<id>:`) and the raw `Storage` methods |
| `planner` | *(automation, HARNESS-ONLY in P1a)* the ADVANCED automation's foundation — `snapshot()` / `restore()` / `excursion()` / `measure()`, `knowledge()`, `goals()` (docs/planner.md). It exists only when `loader/tmt-planner.js` has been loaded, which **only `tools/harness/boot.mjs --planner` does**: the page does not fetch the file at all until P2. Loading it is inert — no layer, no DOM, nothing in `player`, and a run that loads it lands on the same tick and hash as one that does not. Without `tmtLoader.automation` the file defines `planner = {available: false, why}` and stops |
| `plannerLadder` | *(harness)* the parsed `ladder/<game>.json` the planner reads as its sticky goal source (`--planner-ladder`) |

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
