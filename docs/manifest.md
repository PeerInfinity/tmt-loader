# `manifests/<id>.json`

**The manifest is a pin; `games/<id>/index.html` is the source.** The loader parses the game's live `index.html`
every time (`loader/interpret.mjs`); the manifest records what the census observed at the upstream commit and what
the loader must know that the index does not say. `tools/harness/check-manifest.mjs` re-parses the index and fails
on drift — after a `git subtree pull`, re-emit the manifest.

| Field | Meaning |
|---|---|
| `schema` | `1` |
| `id`, `name`, `version`, `author` | `id` = the directory under `games/` and `?mod=`; the rest from `modInfo` |
| `upstream.{repo,url,branch,commit,pushed_at}` | the subtree's origin; `commit` must equal the squash's `git-subtree-split` |
| `engine.{tmtNum,stock_commit,moved,deviation}` | the census's engine identification |
| `entry` | the game's HTML file (`index.html`) |
| `load.onload` | the body's `onload` expression |
| `load.scripts` | local scripts in index order, render-only included, `loader.js` listed where it sits (the interpreter replaces it with the modFiles slot) |
| `load.renderOnly` | scripts the Node harness skips (their top-level functions are stubbed) |
| `load.modFilesPrefix`, `load.modFiles` | what a 2.5+ `loader.js` inserts; the prefix is read from `loader.js` when present |
| `load.external` | every non-relative URL → `vendor` (served from `vendor/`) or `drop`. A URL missing here, or a `vendor` without a path, fails the load with a named error — never a silent CDN fetch |
| `load.vendor` | `{url: {path, sha256}}` |
| `save.{keyRule,key}` | where the engine keys its save (informational; the prefix shim does not need it) |
| `headless.prestubs` | globals pre-stubbed before any file in Node |
| `headless.renderStubs` | functions the census stubbed |
| `headless.idleHash` | the census's idle state hash; gate G3 reproduces it |
| `headless.stateMask` | optional: extra keys `stateJSON()` drops (none needed in L1) |
| `license` | `githubSpdx` and the verdict of the license files' TEXT |
| `census` | the census row's content counts; gate G4 compares `ids()` counts to them |
| `patches` | local commits under `games/<id>/` (L1: none) |
| `auto` | optional (A1): the per-game automation table, `games-auto/<id>.js` — a classic script loaded right after `loader/tmt-auto.js` by the page and the Node boot (docs/automation.md). **Hand-written: the census emitter does not write it**; keep it when re-emitting a manifest. `check-manifest` checks the path shape and that the file exists |
| `generated` | the emitter and its commit |

## `manifests/index.json`

The roster, in the order games were added: `[{id, name, repo}]` — `repo` = the manifest's `upstream.repo` (what an
outside index such as the census joins on; never join on `id`). The picker reads each entry's manifest for the rest.

## Emitting

`node tools/add-game.mjs <owner/repo>` does all of the below and the gates (`docs/add-a-game.md`). By hand:


```
cd tmt-fork-census
node scripts/manifest.mjs <owner/repo | calibration:Name> --id <id> --out ../tmt-loader/manifests/<id>.json
```

Then fill `load.vendor` (fetch each `vendor` URL once into `vendor/<lib>-<version>.min.js`, record the sha256), add
`"patches": []`, add the game to `manifests/index.json`, and run `node tools/harness/check-manifest.mjs <id>`.
