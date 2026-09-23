# For developers — how tmt-loader works

This is the technical half of the [README](../README.md): how the page loads a game, how to run it locally, the
harness and its gates, and how a game is added. The per-topic documents it links hold the detail.

## How it works

One static page that loads games built on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree)
(TMT) **on each game's own engine version**, with no CDN and no build step, plus a Node harness that boots the same
games headless and is proven equal to the page.

`index.html?mod=<id>` reads `manifests/<id>.json`, fetches the game's own `games/<id>/index.html`, and interprets it
(`loader/interpret.mjs`): the stylesheets, the scripts in index order (CDN libraries replaced by the copies in
`vendor/`, fonts dropped), the `modFiles` a TMT 2.5+ `loader.js` would insert, the body markup and its `onload`.
Before any game script runs it installs a `localStorage` prefix shim (every key becomes `tmt-loader:<id>:<key>`, so
games on one origin never share a save) and a timer recorder, then sets `<base href="games/<id>/">` so every relative
URL the game uses resolves without rewriting. `window.tmtLoader` (`loader/tmt-auto.js`, see [docs/contract.md](contract.md)) is
the one interface a runner talks to. Without `?mod=` the page shows a picker. `?managed=1` pauses the game after
`onload` so a runner drives `tmtLoader.tick(diff)`. `?automation=1` opts in to the automation tools
([docs/automation.md](automation.md)); without it the loader adds nothing to the game — no layer, no UI, nothing in the save.
`?mobile=1` opts in to the mobile layout ([docs/mobile.md](mobile.md)): one column, master-detail and a bottom nav bar, for
engines that ship no `@media` query at all — likewise inert without the flag. `?navbar=1` opts in to that **nav bar
alone**, which is wanted on a desktop too; `?mobile=1` implies it. The bar's first button opens the **layer list** —
the game's layers as cards grouped by tree row, each with a working reset button, a counter per category the
layer draws and a button per thing you can act on, expanding to chips for every feature in the order and with the
membership the game's own tab gives them; a selectable alternate view of the tree, not a replacement for it.

All three opt-ins are also **buttons in the game's own options tab** ([docs/options.md](options.md)), and a
choice made there is remembered in this browser for every game. The URL still answers first whenever it says
anything about a flag, in both directions, and a page with neither a parameter nor a remembered choice is inert.

Games live under `games/<id>/` as **git subtrees**, pristine at the upstream commit their manifest records.

The roster is **[docs/games.md](games.md)** — every game, with a `play` and a `mobile` link, its upstream
repo and pinned commit, its engine version and its license. It is generated from `manifests/` by
`node tools/games-table.mjs` — which `tools/add-game.mjs` runs itself — and gate G6 holds it to
`manifests/index.json`, so it cannot drift from what the loader actually hosts. Each game keeps its own license files and credits inside its subtree.

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
| `node tools/harness/page.mjs <id> --ticks N --diff d` / `--gate load` / `--gate mobile` | the same in headless Chromium; `--gate load` = gate G1, `--gate mobile` = gate M1, the layout, the nav bar **and** the layer list ([docs/mobile.md](mobile.md)) |
| `node tools/harness/page.mjs <id>... --gate options` | gate O1 — the Options section, the remembered preference and the URL override ([docs/options.md](options.md)) |
| `node tools/harness/parity.mjs <id> --ticks N --diff d` | Node ≡ page `stateJSON()` |
| `node tools/harness/check-goldens.mjs` / `check-manifest.mjs` | frozen `tmtLoader.ids()` / manifest pin vs the live `index.html` |
| `node tools/harness/upstream-export.mjs <id> --upstream <clone>` | a save exported from the upstream page imports equal |
| `node tools/harness/gates.mjs` | gates G1–G4 for every game and the repo-wide G6, rows appended to [`results/SUMMARY.md`](../tools/harness/results/SUMMARY.md) |
| `node tools/harness/run.mjs <id> --ladder <file> --to <mark> [--from-snapshot <file>] [--snapshots <dir>]` | a stretch of a game's ladder, from a committed snapshot; [docs/harness.md](harness.md) |
| `node tools/harness/ladder-summary.mjs` | the ladder as reached (marks, calibrated diffs, snapshot fixtures) |
| `node tools/check-pages.mjs` | gate G5: a bare `git clone` served from a sub-path loads both games |
| `node tools/games-table.mjs --check` (also gate G7) | `manifests/declined.json`: every declined game has a reason and is not also hosted |
| `node tools/harness/triage.mjs <id>...` | reports what KIND each red is (declarable / broken / drift) with the evidence beside it; writes nothing |
| `node tools/games-table.mjs --check` | gate G6: [docs/games.md](games.md) lists every hosted game, once, in `manifests/index.json` order, and matches the generator |

Results are recorded in [`tools/harness/results/SUMMARY.md`](../tools/harness/results/SUMMARY.md).

## Adding a game

See [docs/add-a-game.md](add-a-game.md) (and [docs/manifest.md](manifest.md), [docs/contract.md](contract.md)): `git subtree add --squash` under `games/<id>/`, emit the manifest with the
[tmt-fork-census](https://github.com/PeerInfinity/tmt-fork-census) `scripts/manifest.mjs`, vendor its CDN libraries,
run the gates.

## The census and the loader

The games here come from **[tmt-fork-census](https://github.com/PeerInfinity/tmt-fork-census)** ([live results](https://peerinfinity.github.io/tmt-fork-census/)) — a survey of the ~1,900 GitHub
forks of The Modding Tree and Prestige Tree, which ranks them by how branching the tree is, how much content it
has and whether it still boots. The loader hosts the ranked games whose own play page no longer works, and the
census links back: every row it ranks that the loader hosts carries a `loader` and a `mobile` link beside the
author's own.

The two repositories meet at one file format. A game's `manifests/<id>.json` here is emitted by the census's
`scripts/manifest.mjs` — a pin of what the census observed at the recorded commit — and `check-manifest.mjs`
holds the live `index.html` to it.

| | repository | live |
|---|---|---|
| loader (this repo) | [PeerInfinity/tmt-loader](https://github.com/PeerInfinity/tmt-loader) | https://peerinfinity.github.io/tmt-loader/ |
| census | [PeerInfinity/tmt-fork-census](https://github.com/PeerInfinity/tmt-fork-census) | https://peerinfinity.github.io/tmt-fork-census/ |
