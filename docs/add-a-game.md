# Adding a game

1. **Subtree** at a pinned commit, squashed, under `games/<id>/` (never edit files there):
   ```
   git remote add -f <id>-upstream https://github.com/<owner>/<repo>.git
   git remote set-url --push <id>-upstream no-push
   git subtree add --prefix=games/<id> <full sha> --squash
   ```
   Verify `games/<id>` is not a repo of its own and `diff -r -x .git games/<id> <a clone at that sha>` is empty.
2. **Manifest** from the census emitter (`docs/manifest.md`), then `patches: []` and a `manifests/index.json` entry.
   A game the census has not booted needs a census row first.
3. **Vendor** every `load.external` URL marked `vendor`: one fetch into `vendor/`, check it is JavaScript (not an
   HTML error page), record `{path, sha256}` in `load.vendor`, name the sha256 in the commit message.
4. **Gates** (`tools/harness/results/SUMMARY.md` gets the rows):
   ```
   node --test loader/                                   # add the game to loader/interpret.test.mjs
   node tools/harness/check-manifest.mjs <id>
   node tools/harness/run.mjs <id> --ticks 200 --diff 0.05  # must print manifest.headless.idleHash.hash
   node tools/harness/check-goldens.mjs <id> --write      # then review the counts against manifest.census
   node tools/harness/gates.mjs <id>                      # G1–G4
   node tools/check-pages.mjs                             # G5
   ```
   If the Node boot needs a stub the manifest lacks, `run.mjs` re-spawns with it (≤ 12) and reports
   `respawn_prestubs`; add those to `headless.prestubs`. If a field of `player` drifts between two identical runs,
   add it to `headless.stateMask` and say why in the commit.
5. If the game cannot load without a patch: stop and record why before patching anything under `games/<id>/`.
