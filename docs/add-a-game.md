# Adding a game

One command does it, from a checkout of [tmt-fork-census](https://github.com/PeerInfinity/tmt-fork-census) beside this
repository (`--census <dir>` or `TMT_CENSUS` otherwise; the census is a dev-time dependency of the tool only — the page
and the harness never import it):

```
node tools/add-game.mjs <owner/repo> --dry-run          # id, SHA, license verdicts and the manifest; no git
node tools/add-game.mjs <owner/repo> [<owner/repo>...]  # add, then gate
```

A game must have a census row (booted, with its shallow clone under `clones/`). Options: `--id <id>` and
`--sha <full sha>` override the defaults for a single target; `--tag <text>` prefixes the SUMMARY gate names;
`--au-check` also opens the game with `?automation=1` and checks that the empty `au` tab renders; `--json <out>`.
It prints one JSON line per game: `{id, repo, rank, sha, license, added, gates: {checkManifest, idleHash, goldens, load}}`
(plus `skipped`, `detail`, `idCollision`, `error` where they apply).

## What it does

1. **Preflight** (every target first; no git operation):
   - **id** = the census row's `mod_name` lower-cased, every run of non-alphanumerics → `-`, trimmed. A mod name
     written in a non-Latin script slugs to the empty string (墙树, 层级树 — both in the census top 100), so the id
     falls back to the **repository name**, then the **owner**: a GitHub repo name and owner are always ASCII, so
     one of them always slugs, and every candidate is data the census already holds — no transliteration table and
     no per-game knowledge. The run reports `idFrom` whenever the id did not come from the mod name. It collides
     with an existing `manifests/<id>.json`, the same slug of an existing manifest's `name`, or an id produced
     earlier in the same run → `-<owner>` is appended (`idCollision` reports it; this is per RUN, so a batch must
     go in as ONE invocation or two candidates can claim the same id; e.g. `prestige-tree-rewritten-unsoftcapped4`
     beside `ptr`). An id that still fails `^[a-z0-9-]+$` is refused (pass `--id`). A repo already in the loader
     (matched on `upstream.repo`) keeps its id and is not added again; `--dry-run` then reports whether the emitted
     manifest reproduces the committed one.
   - **Manifest**: `scripts/manifest.mjs <owner/repo> --id <id>` from the census, into a temp file; `load.vendor` is
     filled from the vendored files the existing manifests already pin (sha256 re-checked against `vendor/`); a `vendor`
     URL no manifest pins **stops the run** before any git operation (vendor it by hand: fetch into
     `vendor/<lib>-<version>.min.js`, check it is JavaScript, record `{path, sha256}` in a manifest); `patches: []`;
     no `auto` (a game without a per-game table still gets the registry and an empty `au` tab under `?automation=1`).
2. **Subtree** (the working tree must have no tracked changes — `git subtree add` refuses them):
   ```
   git remote add -f <id>-upstream https://github.com/<owner>/<repo>.git
   git remote set-url --push <id>-upstream no-push
   git subtree add --prefix=games/<id> <full sha> --squash
   diff -r -x .git games/<id> <census clone>                # must be empty, else abort and report — never patch
   ```
3. **Manifest + index**: `manifests/<id>.json`, and `{id, name, repo}` appended to `manifests/index.json` (the picker's
   roster; `repo` = `upstream.repo`, what the census joins on).
4. **Gates** (rows appended to `tools/harness/results/SUMMARY.md`; a red gate keeps the subtree, which is pristine and
   licensed, and is recorded as `RED: <message>`):
   - `check-manifest` — the pin vs the live `index.html`, vendor sha256, `games/<id>` pristine at the squash;
   - **idle hash**: `run.mjs <id> --ticks 200 --diff 0.05 --no-automation` = `manifest.headless.idleHash.hash` (the
     census's). A game the census marks nondeterministic is run twice and recorded `nondeterministic`, not failed;
   - **goldens**: `tools/harness/goldens/<id>.ids.json` written, counts = `manifest.census`;
   - **G1 load**: `page.mjs <id> --gate load` on the plain page — 0 non-localhost requests, 0 failed, 0 page errors,
     ≥ 1 `#app .treeNode`, 0 `au` nodes — except what the manifest's hand-kept `load.known` declares (docs/manifest.md).
     A new game that is red only because its index names a missing script, its own timers throw before `load()`, or it
     hotlinks images: re-run `check-manifest <id>` with `"known": {}` in `load`, copy the drift it reports into the block
     (plus an `errorsBeforeReady` reason if needed), and re-run the gates. `add-game.mjs` keeps an existing `known`.

5. **The roster doc**: [games.md](games.md), regenerated from `manifests/` — `add-game.mjs` does this itself, at the
   end of phase 3, and records a G6 row for it. Doing it by hand is `node tools/games-table.mjs`. Gate G6 holds the
   doc to `manifests/index.json` (every game, once, in that order), so a game added without it is a red gate:
   `node tools/games-table.mjs --check`, or `gates.mjs --only G6`.

Commit what the tool leaves uncommitted (`manifests/`, `tools/harness/goldens/`, `docs/games.md`, `SUMMARY.md`) on top
of its subtree commits, then run `node tools/check-pages.mjs` (G5) on the committed HEAD. For several games, pass them in one call:
all subtrees go in first, then the manifests and gates, so one commit covers the batch.

## By hand, when the tool cannot

- If the Node boot needs a stub the manifest lacks, `run.mjs` re-spawns with it (≤ 12) and reports
  `respawn_prestubs`; add those to `headless.prestubs`. If a field of `player` drifts between two identical runs, add it
  to `headless.stateMask` and say why in the commit.
- If the game cannot load without a patch: stop and record why before patching anything under `games/<id>/`.
- Optional for a game with unusual markup: add it to `loader/interpret.test.mjs` (`node --test loader/`).
