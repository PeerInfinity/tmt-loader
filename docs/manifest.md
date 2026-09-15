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
| `load.known` | optional, **hand-kept** (the census emitter does not write it; `add-game.mjs` keeps it on a re-emit): what the game does in a browser that a stricter gate would call a defect. Keys, each optional: **`missingScripts`** — index-named local scripts (static or modFiles) absent from `games/<id>/`; `check-manifest` requires it to EQUAL that set (a declared file that exists, or an undeclared missing one, is drift), and the Node boot's `missing` file errors for those files are not problems. **`externalHosts`** — hosts of game-content assets the upstream page also fetches; `check-manifest` requires it to EQUAL the hostnames of the absolute `http(s)://` URLs in `index.html` and `js/**` whose path ends in an image/audio/video/font extension, minus the hosts of `load.external` (links in text and extensionless URLs are therefore not counted). **`errorsBeforeReady`** — a non-empty REASON string (not checked against the tree). Gate G1 (`page.mjs --gate load`) with a block: failed requests only for URLs whose path is in `missingScripts` (and `tmtLoader.skipped` must equal it), blocked requests only for hosts in `externalHosts`, `before-ready` page errors only when `errorsBeforeReady` is present, `after-ready` errors never; its row prints `allowed: {skipped, blockedHosts, errorsBeforeReady}`. The harness still blocks those hosts — the loader itself makes no third-party request |
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
