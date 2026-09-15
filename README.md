# tmt-loader

One static page that loads games built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree)
(TMT) **on each game's own engine version**, with no CDN and no build step, plus a Node harness that boots the same
games headless and is proven equal to the page.

**AI disclosure.** The code, the documentation and the harness in this repository were AI-generated (Claude Code sessions directed by PeerInfinity, who set the questions and reviewed the output). Every gate number is produced by the harness in `tools/` and can be regenerated.

## What it does

`index.html?mod=<id>` reads `manifests/<id>.json`, fetches the game's own `games/<id>/index.html`, and interprets it
(`loader/interpret.mjs`): the stylesheets, the scripts in index order (CDN libraries replaced by the copies in
`vendor/`, fonts dropped), the `modFiles` a TMT 2.5+ `loader.js` would insert, the body markup and its `onload`.
Before any game script runs it installs a `localStorage` prefix shim (every key becomes `tmt-loader:<id>:<key>`, so
games on one origin never share a save) and a timer recorder, then sets `<base href="games/<id>/">` so every relative
URL the game uses resolves without rewriting. `window.tmtLoader` (`loader/tmt-auto.js`, see `docs/contract.md`) is
the one interface a runner talks to. Without `?mod=` the page shows a picker. `?managed=1` pauses the game after
`onload` so a runner drives `tmtLoader.tick(diff)`. `?automation=1` opts in to the automation tools
(`docs/automation.md`); without it the loader adds nothing to the game — no layer, no UI, nothing in the save.

Games live under `games/<id>/` as **git subtrees**, pristine at the upstream commit their manifest records.

40 games, in the order they were added (`manifests/index.json`; the picker lists the same). The first two were added by hand in L1; the rest by `tools/add-game.mjs` from the tmt-fork-census top 100 (games with no working play page).

| id | game | upstream | engine | license |
|---|---|---|---|---|
| `ptr` | Prestige Tree Rewritten | `Jacorb90/Prestige-Tree` @ `cec9198` | TMT 2.2.1 | MIT |
| `something` | Justcubing97's Something Tree | `Justcubing97/JC97sSomethingTree` @ `30a311b` | TMT 2.7 | MIT |
| `the-dressy-tree` | The Dressy Tree | `Dressygithub/The-Dressy-Tree` @ `d553021` | TMT 2.7 | MIT |
| `the-pro-tree` | The Pro Tree | `CrazyHighNumbers69/The-Modding-Tree` @ `06ca343` | TMT 2.6.0.1 | MIT |
| `the-extended-tree` | The Extended Tree | `skylafalls/Extended-Tree` @ `d2e17b8` | TMT 2.2.1 | MIT |
| `the-omega-tree` | The Omega Tree | `Omega-pgg/The-Modding-Tree` @ `f7899c0` | TMT 2.6.6.2 | MIT |
| `the-alphabetree` | The Alphabetree | `FlareZ0000/The-Modding-Tree` @ `df0edf2` | TMT 2.6.6.2 | MIT |
| `ultimate-prestige-tree` | Ultimate Prestige Tree | `KremboMC/Ultimate-Prestige-Tree` @ `ddddb46` | TMT 2.7 | MIT |
| `the-number-tree` | The Number Tree | `liamhmn/The-Modding-Tree` @ `7a7e26d` | TMT 2.6.6.2 | MIT |
| `prestige-tree-rewritten-unsoftcapped4` | Prestige Tree Rewritten | `unsoftcapped4/Prestige-Tree-Rewritten` @ `797ba44` | TMT 2.2.1 | MIT |
| `arc-tree` | Arc Tree | `peacefulwar/Arc-Tree` @ `eb5125d` | TMT 2.7 | MIT |
| `a-tree-for-sure` | A Tree For Sure | `MsliAghtlyD/A-Tree-For-Sure` @ `bb2018f` | TMT 2.6.6.2 | MIT |
| `the-algebra-tree` | The Algebra Tree | `Sersseras/The-Modding-Tree` @ `9868edc` | TMT 2.7 | MIT |
| `the-earth-tree` | The Earth Tree | `Onesmartshark/Earth-Tree` @ `52fb645` | TMT 2.6.6.2 | MIT |
| `the-primordial-tree` | The Primordial Tree | `Inferno-Inc/The-Primordial-Tree` @ `481c8bd` | TMT 2.6.6.2 | MIT |
| `bobbit-s-tech-tree` | Bobbit's Tech Tree | `freddifred/The-Modding-Tree` @ `3bd5313` | TMT 2.6.6.2 | MIT |
| `the-ore-tree` | The Ore Tree | `Slicedberg/Ore-Tree` @ `511718c` | TMT 2.7 | MIT |
| `the-mechanic-tree` | The mechanic Tree | `great0108/The-Modding-Tree` @ `8f7d901` | TMT 2.7 | MIT |
| `the-danus-tree` | The Danus Tree | `quwpsss/The-Modding-Tree` @ `c3533ea` | TMT 2.6.6.2 | MIT |
| `collection-of-everything` | Collection of Everything | `XtremeRusher/The-Modding-Tree` @ `f8c385f` | TMT 2.6.6.2 | MIT |
| `the-congratulations-tree` | The Congratulations Tree | `MartianCreations/The-Congratulations-Tree` @ `0fe659e` | TMT 2.7 | MIT |
| `the-prestige-tree-2` | The Prestige Tree 2 | `liam43210/The-Prestige-Tree-2` @ `fcfd0d1` | TMT 2.7 | MIT |
| `the-reborn-incremental-tree` | The Reborn Incremental Tree | `Efsoone/The-Modding-Tree` @ `7ccd26d` | TMT 2.7 | MIT |
| `the-weight-tree` | The Weight Tree | `difficultcomplexity/The-Modding-Tree` @ `a0fbf45` | TMT 2.6.6.2 | MIT |
| `the-upgradeverse-tree` | The Upgradeverse Tree | `liamthecatguy/The-Upgradeverse-Tree` @ `34014a5` | TMT 2.7 | MIT |
| `the-jax-tree` | The Jax Tree | `rainbowice975/The-Jax-Tree` @ `1a26f5b` | TMT 2.7 | MIT |
| `the-douyuan-tree` | The Douyuan Tree | `temptempa/The-Modding-Tree` @ `56fedd1` | TMT 2.7 | MIT |
| `a-tree-about-layers` | A Tree About Layers | `The-Alternate-Tree/A-Tree-About-Layers` @ `485e62f` | TMT 2.7 | MIT |
| `the-unbalanced-tree` | The Unbalanced Tree | `weyrhvwvrwuvureurw/The-Modding-Tree` @ `5a0ca10` | TMT 2.6.6.2 | MIT |
| `the-layered-tree` | The Layered Tree | `TheIcyIcicle/The-Modding-Tree` @ `a795bb0` | TMT 2.6.6.2 | MIT |
| `sheep-incremental` | Sheep Incremental? | `notadragon/counting-sheep-tree` @ `d2b4372` | TMT 2.7 | MIT |
| `the-ultimate-prestige-tree` | The Ultimate Prestige Tree | `RaceproxateDev/The-Ultimate-Prestige-Tree` @ `0ec9480` | TMT 2.7 | MIT |
| `an-operation-tree` | An Operation Tree | `am30936/The-Modding-Tree` @ `7305b35` | TMT 2.7 | MIT |
| `the-necromantree` | The NecromanTree | `monkeh42/The-Modding-Tree` @ `9d089aa` | TMT 2.3.4 | MIT |
| `the-challenge-tree` | The Challenge Tree | `Seder3214/Challenge-Tree` @ `90b1677` | TMT 2.6.6.2 | MIT |
| `the-tree` | The ??? Tree | `fluffydragon23/The-Modding-Tree` @ `d4d15d9` | TMT 2.6.6.2 | MIT |
| `the-energy-factory` | The Energy Factory | `CharizUniv/The-Modding-Tree` @ `3c2ff55` | TMT 2.6.6.2 | MIT |
| `yet-another-challenge-tree-adventure` | Yet another Challenge Tree: Adventure | `new42ur3jeans/Incremental-Adventure-Trees` @ `9c1fff2` | TMT 2.6.6.2 | MIT |
| `the-periodic-table-tree` | The Periodic Table Tree | `qcy00hou12/The-Periodic-Table-Tree` @ `3348710` | TMT 2.6.6.2 | MIT |
| `the-rainbow-void-tree` | The Rainbow Void Tree | `CudjzikxmxR/The-Rainbow-Void-Tree` @ `9b67544` | TMT 2.7 | MIT |

Each game keeps its own license files and credits inside its subtree.

## Running it

The page needs HTTP (Chromium blocks `fetch()` on `file://`):

```
python3 -m http.server 8000 --bind 127.0.0.1
# open http://127.0.0.1:8000/index.html  (or ?mod=ptr, ?mod=something)
```

It works from any sub-path (GitHub Pages serves under `/tmt-loader/`); nothing is `/`-rooted.

## Harness

`npm ci` (dev-only: Playwright 1.56.0, using an already-installed Chromium), then:

| Command | What it checks |
|---|---|
| `node --test loader/` | `interpret()` on both games' `index.html` |
| `node tools/harness/run.mjs <id> --ticks N --diff d [--until "<js>"]` | Node boot (one game per process), prints `{ticks, gameSeconds, diff, hash}` |
| `node tools/harness/page.mjs <id> --ticks N --diff d` / `--gate load` | the same in headless Chromium; `--gate load` = gate G1 |
| `node tools/harness/parity.mjs <id> --ticks N --diff d` | Node ≡ page `stateJSON()` |
| `node tools/harness/check-goldens.mjs` / `check-manifest.mjs` | frozen `tmtLoader.ids()` / manifest pin vs the live `index.html` |
| `node tools/harness/upstream-export.mjs <id> --upstream <clone>` | a save exported from the upstream page imports equal |
| `node tools/harness/gates.mjs` | gates G1–G4 for every game, rows appended to `results/SUMMARY.md` |
| `node tools/harness/run.mjs <id> --ladder <file> --to <mark> [--from-snapshot <file>] [--snapshots <dir>]` | a stretch of a game's ladder, from a committed snapshot; `docs/harness.md` |
| `node tools/harness/ladder-summary.mjs` | the ladder as reached (marks, calibrated diffs, snapshot fixtures) |
| `node tools/check-pages.mjs` | gate G5: a bare `git clone` served from a sub-path loads both games |

Results are recorded in `tools/harness/results/SUMMARY.md`.

## Adding a game

See `docs/add-a-game.md` (and `docs/manifest.md`, `docs/contract.md`): `git subtree add --squash` under `games/<id>/`, emit the manifest with the
[tmt-fork-census](https://github.com/PeerInfinity/tmt-fork-census) `scripts/manifest.mjs`, vendor its CDN libraries,
run the gates.

## License

MIT (`LICENSE`) for the loader and harness. The games under `games/` carry their own licenses.
