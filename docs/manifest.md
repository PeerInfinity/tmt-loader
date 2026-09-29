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
| `load.known` | optional, **hand-kept** (the census emitter does not write it; `add-game.mjs` keeps it on a re-emit): what the game does in a browser that a stricter gate would call a defect. Keys, each optional: **`missingScripts`** — index-named local scripts (static or modFiles) absent from `games/<id>/`; `check-manifest` requires it to EQUAL that set (a declared file that exists, or an undeclared missing one, is drift), and the Node boot's `missing` file errors for those files are not problems. **`missingAssets`** (2026-09-22) — the same fact for an image, audio or font file: relative `src`/`href` values in the entry document (comments stripped; root-absolute `/…` paths excluded, they name the site and not the game) whose path ends in an asset extension and which `games/<id>/` does not hold, compared **case-sensitively** as a web server does; `check-manifest` requires it to EQUAL that set, and G1 then allows a failed request for exactly those paths. One game declares it: `the-cosmic-tree`, whose `index.html` names `resources/mNote.png` while the repository ships `resources/mnote.png` — fine on a case-insensitive disk, a 404 on GitHub Pages. ⛔ **It is a record of what upstream ships, not a licence to patch it**: renaming or copying the file would be a change to `games/<id>/` outside the media exception, which is in-place media modification only, and `check-manifest` reds it. A path built at runtime cannot be derived and is not declarable here; a game that needs one stays declined. **`externalHosts`** — hosts of game-content assets the upstream page also fetches; `check-manifest` requires it to EQUAL the hostnames of the absolute `http(s)://` URLs in `index.html` and `js/**` whose path ends in an image/audio/video/font extension, minus the hosts of `load.external` (links in text and extensionless URLs are therefore not counted). **`errorsBeforeReady`** — a non-empty REASON string (not checked against the tree). Gate G1 (`page.mjs --gate load`) with a block: failed requests only for URLs whose path is in `missingScripts` (and `tmtLoader.skipped` must equal it), blocked requests only for hosts in `externalHosts`, `before-ready` page errors only when `errorsBeforeReady` is present, `after-ready` errors never; its row prints `allowed: {skipped, blockedHosts, errorsBeforeReady}`. The harness still blocks those hosts — the loader itself makes no third-party request |
| `save.{keyRule,key}` | where the engine keys its save (informational; the prefix shim does not need it) |
| `headless.prestubs` | globals pre-stubbed before any file in Node |
| `headless.renderStubs` | functions the census stubbed |
| `headless.idleHash` | the census's idle state hash; gate G3 reproduces it. **`headless.idleHash.census`** — RETIRED 2026-09-22 (Q6): it recorded the census's hash where the census boot and the page disagreed. Its one instance, `the-collab-tree-lun4-r` (`cheese.cycle`), was the census boot pre-clearing `player.offTime`; the census no longer does, its hash for that game is now the page's, and `check-manifest` refuses the block. |
| `headless.stateMask` | optional: extra keys `stateJSON()` drops (none needed in L1) |
| `license` | `githubSpdx` and the verdict of the license files' TEXT |
| `census` | the census row's content counts; gate G4 compares `ids()` counts to them |
| `patches` | local commits under `games/<id>/` (L1: none) |
| `auto` | optional (A1; C1): the per-game automation table, **exactly `games-auto/<id>.json`** — a JSON DOCUMENT (schema `schemas/games-auto.schema.json`, validated by `tools/auto-tables.mjs` in CI and by the loader at load) that the page FETCHES in automation mode and the Node boot reads, both handing it to `loader/tmt-auto.js` as `tmtLoader.autoTable` before that file runs (docs/automation.md, "The data table"). Until C1 it was a classic script, `games-auto/<id>.js`, that assigned the object. **Hand-written: the census emitter does not write it**; keep it when re-emitting a manifest. `check-manifest` checks the exact path and that the file exists |
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

## Generated data: `games-data/` (C1) — NOT a manifest field

Authored and GENERATED per-game data live in visibly different homes (§40-R ruling B). `manifests/` and `games-auto/`
are AUTHORED; `games-data/<id>.json` is GENERATED by `tools/currency-data.mjs` — which field each buyable really pays in,
scored by a rollback buy (docs/automation.md, "The currency reader") — and says so in its own first key
(`"generated": true`, with `generator`, `generatorVersion`, `formatVersion`, the game's `upstream.commit` from this
manifest, and the `states` / `seeds` it was read in). Never edit one by hand: `tools/currency-data.mjs --write`
regenerates the roster, and `--check` (CI job `c1`) fails on any file a regeneration would change.
⚠ It is a SIBLING of `manifests/`, never inside it: `tools/add-game.mjs` reads every top-level `manifests/*.json` except
`index.json` as a game manifest, so a `manifests/<id>.currency.json` would be read as a game called `<id>.currency`.
`games-data/index.json` names the 103 games that have a file; the page reads it first so a game without one makes no
request that fails.
