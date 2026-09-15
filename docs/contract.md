# `window.tmtLoader` — the hook contract (L1)

`loader/page.js` creates `window.tmtLoader` before any game script; `loader/tmt-auto.js` (a classic script, inserted
after the game's scripts, and run unchanged by the Node harness through `vm.runInThisContext`) fills in the members
below. Runners (the Playwright harness, later an embedding page) talk only to this object.

It reads the engine's globals as **bare identifiers** inside its members, never at load: `player`, `layers`, `tmp`,
`modInfo` may be global `let`s (Something Tree's `modInfo` is), which are not `window` properties.

| Member | Meaning |
|---|---|
| `id`, `manifest` | the game id (`?mod=`) and its parsed `manifests/<id>.json` |
| `ready`, `error`, `step` | `ready` turns true after `onload` (and the managed pause); any failure sets `error = {step, message}` and shows an overlay. Poll `ready \|\| error`, never a bare timeout. |
| `managed` | `?managed=1`: the loader calls `pause()` right after `onload`; the runner drives `tick()` |
| `plan`, `loaded`, `modFiles` | the `interpret()` plan, the files executed in order, the modFiles paths |
| `pause()` / `resume()` | stop / restart every `setInterval` the timer recorder saw (game loop, autosave, canvas flag, component timers). Interval ids are logical and survive a pause, so a later `clearInterval(id)` still works. Timeouts and animation frames are counted, not paused. |
| `timers` | `{paused, counts, list()}` |
| `tick(diff, n = 1)` | `n` × (`updateTemp(); gameLoop(diff); fixNaNs?.()`) — the census/probe loop; returns `{ticks, gameSeconds}` |
| `ticks`, `gameSeconds` | counters owned by `tick()`; reset by a page load |
| `stateJSON()` | `JSON.stringify(player)` without keys named `time` / `offTime` at any depth, plus `manifest.headless.stateMask` |
| `hash()` | Promise of the first 16 hex of sha256(`stateJSON()`) — `crypto.subtle` in the page, `node:crypto` in Node (injected as `sha256hex`); equal by gate G3 |
| `save()` | the game's own `save()` with **no argument**; returns `storage.list()` |
| `loadFrom(json)` | `importSave(btoa(json), true)` — the game's own import. **Both engines then reload the page**; the import completes on the next `ready`. In Node the harness boots a fresh process on the storage `importSave` wrote. |
| `ids()` | `{layers: {id: {row, type}}, ids: ["<layer>:<ms\|upg\|buy\|ch\|ach>:<id>"], counts}` — numeric ids only (the census rule) |
| `profile(name)` | only `"off"` in L1; anything else throws |
| `registerAutoFeature(def)`, `features` | the automation registry shape; L1 records, never runs |
| `storage` | `{prefix, raw, list(), clear()}` — the save namespace (`tmt-loader:<id>:`) and the raw `Storage` methods |

## Per-engine notes (measured in L1)

| | TMT 2.2.1 (`ptr`) | TMT 2.7 (`something`) |
|---|---|---|
| save keys | `ptr` (all slots, base64) | `<name>-<author>` and `…_options` |
| `importSave(str, true)` | `save()` then `loadSave()` → `location.reload()` | `save()` then `location.reload()` |
| intervals at load | 3 (game loop 50 ms, canvas flag 500 ms, autosave 5 s) | 3 at load; components add hold-to-buy intervals |
| `modInfo` | global `let`; no `modFiles` | global `let`; 17 `modFiles`, prefix `js/` |
| state mask | `time`, `offTime` | `time`, `offTime` (no drift found) |
| layer node selector | `#app .treeNode` | `#app .treeNode` |
| headless prestubs | `colors` (declared only in the skipped `canvas.js`) | none |
