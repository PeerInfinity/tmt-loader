# tmt-loader

One static page that loads games built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree)
(TMT) **on each game's own engine version**, with no CDN and no build step, plus a Node harness that boots the same
games headless and is proven equal to the page.

**AI disclosure.** The code, the documentation and the results page in this repository were AI-generated (Claude Code sessions directed by PeerInfinity, who set the questions and reviewed the output). Every number is produced by the scripts here, run against the games' own source files, and can be regenerated with the harness in `tools/`.

## What it does

`index.html?mod=<id>` reads `manifests/<id>.json`, fetches the game's own `games/<id>/index.html`, and interprets it
(`loader/interpret.mjs`): the stylesheets, the scripts in index order (CDN libraries replaced by the copies in
`vendor/`, fonts dropped), the `modFiles` a TMT 2.5+ `loader.js` would insert, the body markup and its `onload`.
Before any game script runs it installs a `localStorage` prefix shim (every key becomes `tmt-loader:<id>:<key>`, so
games on one origin never share a save) and a timer recorder, then sets `<base href="games/<id>/">` so every relative
URL the game uses resolves without rewriting. `window.tmtLoader` (`loader/tmt-auto.js`, see `docs/contract.md`) is
the one interface a runner talks to. Without `?mod=` the page shows a picker. `?managed=1` pauses the game after
`onload` so a runner drives `tmtLoader.tick(diff)`.

Games live under `games/<id>/` as **git subtrees**, pristine at the upstream commit their manifest records.

| id | game | upstream | engine | license |
|---|---|---|---|---|
| `ptr` | Prestige Tree Rewritten | `Jacorb90/Prestige-Tree` @ `cec9198` | TMT 2.2.1 | MIT |
| `something` | Justcubing97's Something Tree | `Justcubing97/JC97sSomethingTree` @ `30a311b` | TMT 2.7 | MIT |

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
| `node tools/check-pages.mjs` | a bare `git clone` served from a sub-path loads both games |

Results are recorded in `tools/harness/results/SUMMARY.md`.

## Adding a game

See `docs/add-a-game.md`: `git subtree add --squash` under `games/<id>/`, emit the manifest with the
[tmt-fork-census](https://github.com/PeerInfinity/tmt-fork-census) `scripts/manifest.mjs`, vendor its CDN libraries,
run the gates.

## License

MIT (`LICENSE`) for the loader and harness. The games under `games/` carry their own licenses.
