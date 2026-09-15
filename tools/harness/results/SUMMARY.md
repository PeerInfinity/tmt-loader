# Gate results

One section per `node tools/harness/gates.mjs` run (newest last). Every state claim carries ticks, gameSeconds, diff and
the 16-hex sha256 of `tmtLoader.stateJSON()`. Commit = the loader HEAD the run measured.

## 2026-09-15T01:44:00Z — commit `56c5e34` — 34/34 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| G1 load | ptr | — | 3 | 0.15000000000000002 | 0.05 | — | GREEN | ready 896 ms; 8 `#app .treeNode`; 83 requests, 0 blocked, 0 failed, 0 page errors; keys `tmt-loader:ptr:ptr`; other game something: 2 keys in its own prefix, first untouched=true |
| G2a determinism (node ×2) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | run2 1000 ticks 86067be644ce481c |
| G2b save→fresh boot on storage (node) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | 500 (04bf5c40c38a6dc3) + 500 after reload vs 1000 straight 86067be644ce481c; saved keys 1 |
| G2b save→loadFrom (node) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | importSave requested reload=true; vs 1000 straight 86067be644ce481c |
| G2b save→loadFrom (page, reload) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | page 500 04bf5c40c38a6dc3 (node 500 04bf5c40c38a6dc3); vs node 1000 straight 86067be644ce481c |
| G2a determinism (node ×2) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | run2 1000 ticks 5ce24001caa4f31f |
| G2b save→fresh boot on storage (node) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | 500 (9c275b639f698756) + 500 after reload vs 1000 straight 5ce24001caa4f31f; saved keys 1 |
| G2b save→loadFrom (node) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | importSave requested reload=true; vs 1000 straight 5ce24001caa4f31f |
| G2b save→loadFrom (page, reload) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | page 500 9c275b639f698756 (node 500 9c275b639f698756); vs node 1000 straight 5ce24001caa4f31f |
| G2c upstream export → loadFrom | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | upstream d9c5ace6665833d0; equalRaw=true equalCanonical=true; exported 13924 b64 chars |
| G3 idle hash = census | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | census d9c5ace6665833d0 @ 200×0.05 |
| G3 parity node≡page | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | page 86067be644ce481c in 18429 ms |
| G3 parity node≡page | ptr | idle | 200 | 200 | 1 | `44ec9c60c088213d` | GREEN | page 44ec9c60c088213d in 4020 ms |
| G3 parity node≡page | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | page 5ce24001caa4f31f in 18863 ms |
| G3 parity control (page +1 point, must diverge) | ptr | idle | 200 | 10 | 0.05 | `784092ada96062fc` | GREEN | diverged at key "points" |
| G4 goldens | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers; ms 85 / upg 172 / buy 52 / ch 9 / ach 80 (census equal=true) |
| G4 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, vendor sha256 ok, subtree split cec9198, games/ptr pristine |
| G1 load | something | — | 3 | 0.15000000000000002 | 0.05 | — | GREEN | ready 1262 ms; 10 `#app .treeNode`; 83 requests, 0 blocked, 0 failed, 0 page errors; keys `tmt-loader:something:Justcubing97's-Something-Tree-Justcubing97_options`, `tmt-loader:something:Justcubing97's-Something-Tree-Justcubing97`; other game ptr: 1 keys in its own prefix, first untouched=true |
| G2a determinism (node ×2) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | run2 1000 ticks 5739997ed0e70447 |
| G2b save→fresh boot on storage (node) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | 500 (455930bb322cd712) + 500 after reload vs 1000 straight 5739997ed0e70447; saved keys 2 |
| G2b save→loadFrom (node) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | importSave requested reload=true; vs 1000 straight 5739997ed0e70447 |
| G2b save→loadFrom (page, reload) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | page 500 455930bb322cd712 (node 500 455930bb322cd712); vs node 1000 straight 5739997ed0e70447 |
| G2a determinism (node ×2) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | run2 1000 ticks 52ffa8d3c5eaba03 |
| G2b save→fresh boot on storage (node) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | 500 (96818152a334a5f2) + 500 after reload vs 1000 straight 52ffa8d3c5eaba03; saved keys 2 |
| G2b save→loadFrom (node) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | importSave requested reload=true; vs 1000 straight 52ffa8d3c5eaba03 |
| G2b save→loadFrom (page, reload) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | page 500 96818152a334a5f2 (node 500 96818152a334a5f2); vs node 1000 straight 52ffa8d3c5eaba03 |
| G2c upstream export → loadFrom | something | idle | 200 | 10 | 0.05 | `89642048592ff831` | GREEN | upstream 4459f3046e6f52c5; equalRaw=false equalCanonical=true (raw differs in KEY ORDER only: the upstream page's async modFiles race); exported 11228 b64 chars |
| G3 idle hash = census | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | census 46bb8c5b1a96f03a @ 200×0.05 |
| G3 parity node≡page | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | page 5739997ed0e70447 in 9227 ms |
| G3 parity node≡page | something | idle | 200 | 200 | 1 | `2a0be3ac78a32fdb` | GREEN | page 2a0be3ac78a32fdb in 1899 ms |
| G3 parity node≡page | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | page 52ffa8d3c5eaba03 in 10012 ms |
| G3 parity control (page +1 point, must diverge) | something | idle | 200 | 10 | 0.05 | `215f3c3fdb5d2c05` | GREEN | diverged at key "points" |
| G4 goldens | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers; ms 68 / upg 175 / buy 23 / ch 11 / ach 52 (census equal=true) |
| G4 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, vendor sha256 ok, subtree split 30a311b, games/something pristine |
