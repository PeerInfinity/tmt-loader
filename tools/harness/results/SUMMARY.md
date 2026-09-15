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

## 2026-09-15 — G5 bare clone — commit `7e6dd26` — GREEN

`node tools/check-pages.mjs`: `git clone --depth 1 file://…` (head `7e6dd26`) served under `http://127.0.0.1:<port>/tmt-loader/`.

| gate | game | ticks | gameSeconds | diff | result | notes |
|---|---|---|---|---|---|---|
| G5 G1 @ subpath | ptr | 3 | 0.15 | 0.05 | GREEN | ready 698 ms; 8 `#app .treeNode`; 83 requests, 0 blocked, 0 failed, 0 page errors; key `tmt-loader:ptr:ptr` |
| G5 G1 @ subpath | something | 3 | 0.15 | 0.05 | GREEN | ready 1258 ms; 10 `#app .treeNode`; 83 requests, 0 blocked, 0 failed, 0 page errors; 2 keys under `tmt-loader:something:` |
| G5 picker | both | — | — | — | GREEN | lists `ptr`, `something` (name, version, repo @ short SHA, TMT version, license); links stay under `/tmt-loader/` |
| G5 clone/repo unmodified | — | — | — | — | GREEN | `git status --porcelain --ignored` empty in the clone; repo `## main...origin/main` |

## 2026-09-15 — A1 input: first stall under the census policy leg (not a gate)

`node tools/harness/run.mjs <id> --leg policy --ticks 7000 --diff 1 --until "<no new unlock/upgrade/milestone/achievement/challenge/buyable for 3600 game-s>"` (coarse diff 1 s; predicate in the L1 as-built record).

| game | stopped at tick | gameSeconds | diff | hash | last progress | state at the stall |
|---|---|---|---|---|---|---|
| ptr | 3737 | 3737 | 1 | `a173a49f8f7b0a35` | tick 137 | `p` upgrades 11/12/13, achievements 11–14, 2485 p points; the policy resets row 0 only, so `b`/`g` (row 1, static) never start — a hard wall for this policy |
| something | 3603 | 3603 | 1 | `7e650585d14da513` | tick 3 | `unlock:upg:11` bought, `fundamental` (row 1) unlocked, 6690 unlock points vs `unlock:upg:12` cost 1e5 — a RATE stall inside the window, not shown to be a hard wall |

## 2026-09-15T02:12:57Z — A1 part 1 (`node tools/harness/gates-a1.mjs --part 1`) — commit `b8ea910` — 20/20 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A1-1 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; full state incl. au e5904022fe01b4e7; features registered 0 |
| A1-1 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; full state incl. au 808f414b4af2eb35; features registered 0 |
| A1-1 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; full state incl. au f2671f93963037f0; features registered 0 |
| A1-1 wrapper calls = 1 per hooked layer per tick | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | 28 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 1 (p); au fallback (layer's slot skipped by the engine): 27 (b g t e s sb sg h q o ss m ba ps hn n hs i ma ge mc en ne id r ai c); hash = policy anchor |
| A1-1 updateTemp does not call automate | ptr | policy | 200 | 10 | 0.05 | `97141569b33c5de7` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-1 parity node≡page (full state) | ptr | idle | 1000 | 50 | 0.05 | `808f414b4af2eb35` | GREEN | page 808f414b4af2eb35 in 15510 ms |
| A1-1 parity hookAll (counters node≡page) | ptr | policy | 200 | 10 | 0.05 | `97141569b33c5de7` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-1 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A1-1 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, games/ptr pristine |
| A1-1 au layer in the page | ptr | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 0 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-1 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; full state incl. au cb34c9322027a585; features registered 0 |
| A1-1 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; full state incl. au efa5506071b42912; features registered 0 |
| A1-1 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; full state incl. au 7856a4816d1e18c5; features registered 0 |
| A1-1 wrapper calls = 1 per hooked layer per tick | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | 14 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 14 (planetary pbooster polygon dimension arithmetic addition subtraction multiplication division primitive numbercore corebooster fundamental unlock); au fallback (layer's slot skipped by the engine): 0; hash = policy anchor |
| A1-1 updateTemp does not call automate | something | policy | 200 | 10 | 0.05 | `8aaa3060bed39bbf` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-1 parity node≡page (full state) | something | idle | 1000 | 50 | 0.05 | `efa5506071b42912` | GREEN | page efa5506071b42912 in 7270 ms |
| A1-1 parity hookAll (counters node≡page) | something | policy | 200 | 10 | 0.05 | `039ce87b1be3b857` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-1 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A1-1 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, games/something pristine |
| A1-1 au layer in the page | something | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 0 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |

## 2026-09-15T02:23:36Z — A1 part 2 (`node tools/harness/gates-a1.mjs --part 2`) — commit `dbfdedb` — 21/22 green

RED row = a gate-script defect, not the loader: the paused gate page never ran 2.7's `updateTabFormats()` (engine interval only), so the disclosure line was not re-rendered; fixed in `d896228`. (A first run at `56d5a4b`, 20/22, failed on the button selector `.clickable` — the engines render `button.upg`; not kept.)

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A1-2 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; full state incl. au f1b54fe7a8f6ec0c; features registered 6 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; full state incl. au cc9e09a32a6ecea0; features registered 6 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; full state incl. au b89968d92638ba53; features registered 6 (games-auto/ptr.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | 28 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 1 (p); au fallback (layer's slot skipped by the engine): 27 (b g t e s sb sg h q o ss m ba ps hn n hs i ma ge mc en ne id r ai c); hash = policy anchor |
| A1-2 updateTemp does not call automate | ptr | policy | 200 | 10 | 0.05 | `ebb6c80f1249990e` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | ptr | idle | 1000 | 50 | 0.05 | `cc9e09a32a6ecea0` | GREEN | page cc9e09a32a6ecea0 in 15550 ms |
| A1-2 parity hookAll (counters node≡page) | ptr | policy | 200 | 10 | 0.05 | `ebb6c80f1249990e` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A1-2 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, games/ptr pristine, auto games-auto/ptr.js |
| A1-2 au layer in the page | ptr | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 6 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | ptr | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 6 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Prestige reset); ✓ click turned "Prestige reset" on; ✓ disclosure line after the first click; ✓ save namespaced (1 keys under tmt-loader:ptr:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/ptr-au-{off,all,toggled}.png |
| A1-2 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; full state incl. au bd1a9cc2ed83d909; features registered 5 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; full state incl. au 9100eadd57b440f9; features registered 5 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; full state incl. au 4464cd103a481d08; features registered 5 (games-auto/something.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | 14 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 14 (planetary pbooster polygon dimension arithmetic addition subtraction multiplication division primitive numbercore corebooster fundamental unlock); au fallback (layer's slot skipped by the engine): 0; hash = policy anchor |
| A1-2 updateTemp does not call automate | something | policy | 200 | 10 | 0.05 | `e0d5b8db02275e6e` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | something | idle | 1000 | 50 | 0.05 | `9100eadd57b440f9` | GREEN | page 9100eadd57b440f9 in 7460 ms |
| A1-2 parity hookAll (counters node≡page) | something | policy | 200 | 10 | 0.05 | `ad17b17c25e71530` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A1-2 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, games/something pristine, auto games-auto/something.js |
| A1-2 au layer in the page | something | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 5 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | something | — | 0 | 0 | — | — | **RED** | ✓ unmanaged default profile = saved; ✓ 5 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Unlock reset); ✓ click turned "Unlock reset" on; ✗ disclosure line after the first click; ✓ save namespaced (2 keys under tmt-loader:something:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/something-au-{off,all,toggled}.png |

## 2026-09-15T02:26:44Z — A1 part 2 (`node tools/harness/gates-a1.mjs --part 2`) — commit `d896228` (tree DIRTY) — 22/22 green

“DIRTY” = this file only (the uncommitted `dbfdedb` section above); code at `d896228`. Screenshots `results/<id>-au-{off,all,toggled}.png` are on disk (gitignored, as L1's G1 screenshots).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A1-2 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; full state incl. au f1b54fe7a8f6ec0c; features registered 6 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; full state incl. au cc9e09a32a6ecea0; features registered 6 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; full state incl. au b89968d92638ba53; features registered 6 (games-auto/ptr.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | 28 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 1 (p); au fallback (layer's slot skipped by the engine): 27 (b g t e s sb sg h q o ss m ba ps hn n hs i ma ge mc en ne id r ai c); hash = policy anchor |
| A1-2 updateTemp does not call automate | ptr | policy | 200 | 10 | 0.05 | `ebb6c80f1249990e` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | ptr | idle | 1000 | 50 | 0.05 | `cc9e09a32a6ecea0` | GREEN | page cc9e09a32a6ecea0 in 14898 ms |
| A1-2 parity hookAll (counters node≡page) | ptr | policy | 200 | 10 | 0.05 | `ebb6c80f1249990e` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A1-2 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, games/ptr pristine, auto games-auto/ptr.js |
| A1-2 au layer in the page | ptr | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 6 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | ptr | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 6 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Prestige reset); ✓ click turned "Prestige reset" on; ✓ disclosure line after the first click; ✓ save namespaced (1 keys under tmt-loader:ptr:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/ptr-au-{off,all,toggled}.png |
| A1-2 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; full state incl. au bd1a9cc2ed83d909; features registered 5 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; full state incl. au 9100eadd57b440f9; features registered 5 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; full state incl. au 4464cd103a481d08; features registered 5 (games-auto/something.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | 14 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 14 (planetary pbooster polygon dimension arithmetic addition subtraction multiplication division primitive numbercore corebooster fundamental unlock); au fallback (layer's slot skipped by the engine): 0; hash = policy anchor |
| A1-2 updateTemp does not call automate | something | policy | 200 | 10 | 0.05 | `e0d5b8db02275e6e` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | something | idle | 1000 | 50 | 0.05 | `9100eadd57b440f9` | GREEN | page 9100eadd57b440f9 in 7260 ms |
| A1-2 parity hookAll (counters node≡page) | something | policy | 200 | 10 | 0.05 | `ad17b17c25e71530` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A1-2 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, games/something pristine, auto games-auto/something.js |
| A1-2 au layer in the page | something | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 5 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | something | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 5 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Unlock reset); ✓ click turned "Unlock reset" on; ✓ disclosure line after the first click; ✓ save namespaced (2 keys under tmt-loader:something:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/something-au-{off,all,toggled}.png |

## 2026-09-15T03:08:36Z — A1 part 3 (`node tools/harness/gates-a1.mjs --part 3`) — commit `3bc12bf` — 22/22 green

Reading this section: GREEN = the run completed and (where a second run exists) was equal; a predicate's own verdict is in its notes (MET / NOT MET). Node children ran in parallel (8 cores), so wall times are contended. Controls: the brief's original defaults (`reset:p always`, `reset:fundamental gain>=1`) meet no row-1 / (ii) predicate — the reason the tables' defaults are intervals. PTR's "next stall" hit the 2 min wall before any 3600 game-s stall (progress still at tick 2502); Something Tree's stalled at tick 309. Per-layer state at the stop: `results/tmp/a1-3-<id>-stall.json` (gitignored).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A1-3 rung (defaults: reset:p interval>=10, unlockOrder g,b) (i) b and g unlocked | ptr | profile all | 1361 | 1361 | 1 | `d76c70bf74ede9ba` | GREEN | MET; second run 1361 ticks / 1361 s / d76c70bf74ede9ba — equal true |
| A1-3 rung (defaults: reset:p interval>=10, unlockOrder g,b) (ii) keep-upgrade milestones b0 + g0 | ptr | profile all | 2360 | 2360 | 1 | `f8a1534d326a4840` | GREEN | MET; second run 2360 ticks / 2360 s / f8a1534d326a4840 — equal true |
| A1-3 rung (defaults: reset:p interval>=10, unlockOrder g,b) (iii) b.best ≥ 15 and g.best ≥ 15 | ptr | profile all | 2936 | 2936 | 1 | `dc00ee1692610100` | GREEN | MET; second run 2936 ticks / 2936 s / dc00ee1692610100 — equal true |
| A1-3 pair order b,g (alternative) (i) b and g unlocked | ptr | profile all | 1532 | 1532 | 1 | `6bd493d0ad2b08c0` | GREEN | b first 1532 ticks / 1532 s / 6bd493d0ad2b08c0 vs g first 1361 ticks / 1361 s / d76c70bf74ede9ba: g first ahead by 171 game-s |
| A1-3 pair order b,g (alternative) (ii) keep-upgrade milestones b0 + g0 | ptr | profile all | 2491 | 2491 | 1 | `e28fcfe0e8569c4c` | GREEN | b first 2491 ticks / 2491 s / e28fcfe0e8569c4c vs g first 2360 ticks / 2360 s / f8a1534d326a4840: g first ahead by 131 game-s |
| A1-3 pair order b,g (alternative) (iii) b.best ≥ 15 and g.best ≥ 15 | ptr | profile all | 3067 | 3067 | 1 | `43cbc8f8a9713ddd` | GREEN | b first 3067 ticks / 3067 s / 43cbc8f8a9713ddd vs g first 2936 ticks / 2936 s / dc00ee1692610100: g first ahead by 131 game-s |
| A1-3 fine diff (8 min wall bound) (i) b and g unlocked | ptr | profile all | 21863 | 1093.15 | 0.05 | `84d886d33feecf9d` | GREEN | MET |
| A1-3 fine diff (8 min wall bound) (ii) keep-upgrade milestones b0 + g0 | ptr | profile all | 33246 | 1662.3 | 0.05 | — | GREEN | NOT MET (run stopped at 33246 ticks) |
| A1-3 fine diff (8 min wall bound) (iii) b.best ≥ 15 and g.best ≥ 15 | ptr | profile all | 33246 | 1662.3 | 0.05 | — | GREEN | NOT MET (run stopped at 33246 ticks) |
| A1-3 reset:p always (brief default) — control | ptr | profile all | 1532 | 1532 | 1 | `d664a9fe3b94608f` | GREEN | marks: NOT MET · NOT MET · NOT MET; stalled false (last progress tick 271); points 0 |
| A1-3 rung (defaults: reset:fundamental interval>=5) (i) first fundamental reset (fundamental.total ≥ 1) | something | profile all | 102 | 5.1 | 0.05 | `bf6f8809a163efd8` | GREEN | MET; second run 102 ticks / 5.1 s / bf6f8809a163efd8 — equal true |
| A1-3 rung (defaults: reset:fundamental interval>=5) (ii) unlock:upg:12 | something | profile all | 3733 | 186.65 | 0.05 | `0253605cd2e69318` | GREEN | MET; second run 3733 ticks / 186.65 s / 0253605cd2e69318 — equal true |
| A1-3 rung (defaults: reset:fundamental interval>=5) (iii) primitive ms 1 (next milestone in the tree) | something | profile all | 14000 | 700 | 0.05 | — | GREEN | NOT MET (run stopped at 14000 ticks); second run NOT MET — equal true |
| A1-3 coarse diff (i) first fundamental reset (fundamental.total ≥ 1) | something | profile all | 6 | 6 | 1 | `c3444d05fd80bba0` | GREEN | MET |
| A1-3 coarse diff (ii) unlock:upg:12 | something | profile all | 308 | 308 | 1 | `86da1eaa518021ad` | GREEN | MET |
| A1-3 coarse diff (iii) primitive ms 1 (next milestone in the tree) | something | profile all | 3000 | 3000 | 1 | — | GREEN | NOT MET (run stopped at 3000 ticks) |
| A1-3 reset:fundamental gain>=1 (brief default) — control | something | profile all | 3898 | 3898 | 1 | `d1764146deb48480` | GREEN | marks: 6 ticks / 6 s / c3444d05fd80bba0 · NOT MET · NOT MET; stalled false (last progress tick 1936); actions {"reset:unlock":10,"upgrades:unlock":1,"reset:fundamental":1944,"upgrades:fundamental":10} |
| A1-3 next stall (diff 1, 3600 game-s window, 2 min wall) | ptr | profile all | 2524 | 2524 | 1 | `2d117683c6b0d022` | GREEN | stalled false, wall-bounded true; last progress tick 2502 (2502 s); actions {"reset:p":253,"upgrades:p":166,"reset:g":26,"upgrades:g":3,"reset:b":32,"upgrades:b":4}; state: p{pts 0 best 0; upg [11,12,13,21,22,23]; ms []; canReset true nextAt 10.31} b{pts 5.00 best 9.00; upg [11,12,13,21]; ms [0]; canReset false nextAt 33,655,009; next upg 22@15.00 23@18.00; next ms 1: 15 Boosters} g{pts 8.00 best 8.00; upg [11,12,13]; ms [0]; canReset false nextAt 5.07e11; next upg 15@15.00; next ms 1: 10 Generators \| 2: 15 Generators} t{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e120; next ms 0: 2 Time Capsules \| 1: 3 Time Capsules} e{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e120; next ms 0: 2 Enhance Points \| 1: 5 Enhance Points} s{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e120; next ms 0: 2 Space Energy \| 1: 3 Space Energy} |
| A1-3 next stall (diff 1, 3600 game-s window, 2 min wall) | something | profile all | 3909 | 3909 | 1 | `81870407a95d871c` | GREEN | stalled true, wall-bounded false; last progress tick 309 (309 s); actions {"reset:unlock":2346,"upgrades:unlock":2,"reset:fundamental":781,"upgrades:fundamental":11}; state: unlock{pts 7,403,960 best 7,403,960; upg [11,12]; ms []; canReset true nextAt 1.062e16; next upg 13@1.000e20 14@1.000e50 15@1.000e400 16@1.000e925 17@1.000e1550} fundamental{pts 3.314e16 best 3.314e16; upg [11,12,13,14,15,16,17,21,22,23,24]; ms []; canReset true nextAt 1.061e16} primitive{pts 0.000 best 0.000; upg []; ms []; canReset true nextAt 3.470e16; next upg 11@1.000 12@40.000 13@1,000,000 14@250,000,000; next ms 1: 1: 10 Numbers \| 2: 2: 100,000 Numbers} |
| A1-3 parity node≡page, profile all, at a predicate tick | ptr | profile all | 1361 | 1361 | 1 | `d76c70bf74ede9ba` | GREEN | page d76c70bf74ede9ba in 27338 ms; hookStats equal true; actions {"reset:p":136,"upgrades:p":37,"reset:g":7,"upgrades:g":1,"reset:b":1} |
| A1-3 parity node≡page, profile all, at a predicate tick | something | profile all | 102 | 5.1 | 0.05 | `bf6f8809a163efd8` | GREEN | page bf6f8809a163efd8 in 1052 ms; hookStats equal true; actions {"reset:unlock":90,"upgrades:unlock":1,"reset:fundamental":1,"upgrades:fundamental":1} |
| A1-3 parity node≡page, profile all, at a predicate tick | something | profile all | 3733 | 186.65 | 0.05 | `0253605cd2e69318` | GREEN | page 0253605cd2e69318 in 39798 ms; hookStats equal true; actions {"reset:unlock":3622,"upgrades:unlock":2,"reset:fundamental":37,"upgrades:fundamental":11} |

## 2026-09-15T03:36:29Z — A2 part 1 (`node tools/harness/gates-a2.mjs --part 1`) — commit `71da72e` — 23/23 green

Reading this section: GREEN = the run completed and (where a second run exists) was equal; a predicate's own verdict is in its notes (MET / NOT MET). The sweep rows are ordered by policy; the default is the fastest to (ii), ties broken by (iii).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-1 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; features registered 7 |
| A2-1 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; features registered 7 |
| A2-1 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; features registered 7 |
| A2-1 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A2-1 rung (default reset:primitive interval>=90) (i) primitive reset ≥ 1 (primitive.total ≥ 1) | something | profile all | 4163 | 208.15 | 0.05 | `0c88dcd6b5a9e1cb` | GREEN | MET; second run 4163 ticks / 208.15 s / 0c88dcd6b5a9e1cb — equal true |
| A2-1 rung (default reset:primitive interval>=90) (ii) primitive ms 1 ("10 Numbers") | something | profile all | 5963 | 298.15 | 0.05 | `5682500e1f849fb8` | GREEN | MET; second run 5963 ticks / 298.15 s / 5682500e1f849fb8 — equal true |
| A2-1 rung (default reset:primitive interval>=90) (iii) primitive ms 2 ("100,000 Numbers") | something | profile all | 9563 | 478.15 | 0.05 | `449775de97d4af2d` | GREEN | MET; second run 9563 ticks / 478.15 s / 449775de97d4af2d — equal true |
| A2-1 coarse diff (sweep row interval>=90) (i) primitive reset ≥ 1 (primitive.total ≥ 1) | something | profile all | 309 | 309 | 1 | `6da92645ec93a9ab` | GREEN | MET |
| A2-1 coarse diff (sweep row interval>=90) (ii) primitive ms 1 ("10 Numbers") | something | profile all | 399 | 399 | 1 | `53240faafd36f329` | GREEN | MET |
| A2-1 coarse diff (sweep row interval>=90) (iii) primitive ms 2 ("100,000 Numbers") | something | profile all | 579 | 579 | 1 | `30d121d791768aa4` | GREEN | MET |
| A2-1 sweep reset:primitive interval>=5 | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=10 | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=30 | something | profile all | 20000 | 20000 | 1 | `5ad9aa738e6504bf` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 654; actions {"reset:unlock":10697,"upgrades:unlock":2,"reset:fundamental":3997,"upgrades:fundamental":7205,"reset:primitive":654,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=60 | something | profile all | 17109 | 17109 | 1 | `5d0661751e5e7690` | GREEN | game-s to (i)/(ii)/(iii): 309 / 429 / 17109; primitive resets 281; actions {"reset:unlock":9705,"upgrades:unlock":2,"reset:fundamental":3421,"upgrades:fundamental":3368,"reset:primitive":281,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=90 — fastest | something | profile all | 579 | 579 | 1 | `30d121d791768aa4` | GREEN | game-s to (i)/(ii)/(iii): 309 / 399 / 579; primitive resets 4; actions {"reset:unlock":341,"upgrades:unlock":2,"reset:fundamental":115,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=120 | something | profile all | 669 | 669 | 1 | `00a563430e2de3ff` | GREEN | game-s to (i)/(ii)/(iii): 309 / 429 / 669; primitive resets 4; actions {"reset:unlock":395,"upgrades:unlock":2,"reset:fundamental":133,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive interval>=180 | something | profile all | 849 | 849 | 1 | `d234618fa372212c` | GREEN | game-s to (i)/(ii)/(iii): 309 / 489 / 849; primitive resets 4; actions {"reset:unlock":503,"upgrades:unlock":2,"reset:fundamental":169,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive interval>=240 | something | profile all | 789 | 789 | 1 | `4dce5624e4639a9d` | GREEN | game-s to (i)/(ii)/(iii): 309 / 549 / 789; primitive resets 3; actions {"reset:unlock":469,"upgrades:unlock":2,"reset:fundamental":157,"upgrades:fundamental":35,"reset:primitive":3,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive interval>=300 | something | profile all | 909 | 909 | 1 | `54c4783f5595f490` | GREEN | game-s to (i)/(ii)/(iii): 309 / 609 / 909; primitive resets 3; actions {"reset:unlock":541,"upgrades:unlock":2,"reset:fundamental":181,"upgrades:fundamental":35,"reset:primitive":3,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive always — control | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive gain>=1 — control | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 parity node≡page, profile all, at (ii)'s tick | something | profile all | 5963 | 298.15 | 0.05 | `5682500e1f849fb8` | GREEN | page 5682500e1f849fb8 in 64589 ms; hookStats equal true; actions {"reset:unlock":5803,"upgrades:unlock":2,"reset:fundamental":59,"upgrades:fundamental":22,"reset:primitive":2,"upgrades:primitive":1} |
| A2-1 next stall (diff 1, 3600 game-s window, 2 min wall) | something | profile all | 7132 | 7132 | 1 | `1245e4f55d88c686` | GREEN | stalled false, wall-bounded true; last progress tick 7110 (7110 s); marks ; points 0; actions {"reset:unlock":4128,"upgrades:unlock":2,"reset:fundamental":1426,"upgrades:fundamental":922,"reset:primitive":76,"upgrades:primitive":3}; state: unlock{pts 83,034,973 best 0.000; upg [11,12]; ms []; canReset false nextAt 1.000; next upg 13@1.000e20 14@1.000e50 15@1.000e400 16@1.000e925 17@1.000e1550} fundamental{pts 1.926e27 best 1.926e27; upg [23,11,12,13,14,15,16,17,21,22,24,25,26]; ms []; canReset false nextAt 10.000; next upg 27@1.000e51} primitive{pts 42,178,180 best 42,178,180; upg [11,12,13]; ms [1,2]; canReset true gain 221,286 nextAt 1.926e27; next upg 14@250,000,000; next ms 3: 3: 1e11 Numbers \| 4: 4: 1e24 Numbers} |

## 2026-09-15T03:45:19Z — A2 part 1b (`node tools/harness/gates-a2.mjs --part 1b`) — commit `f555f22` — 1/1 green

Reading this section: the detector counts only something new ever held (see policy.mjs MONITOR_SRC, SEEN); marks are recorded without stopping the run.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-1 next stall, monotone detector (--stall-seen; diff 1, 3600 game-s window, 2 min wall) | something | profile all | 4359 | 4359 | 1 | `df1cb770b800142e` | GREEN | stalled true, wall-bounded false; last progress tick 759 (759 s); marks (i) primitive reset ≥ 1 (primitive.total ≥ 1): 309 ticks / 309 s / 6da92645ec93a9ab · (ii) primitive ms 1 ("10 Numbers"): 399 ticks / 399 s / 53240faafd36f329 · (iii) primitive ms 2 ("100,000 Numbers"): 579 ticks / 579 s / 30d121d791768aa4; points 0; actions {"reset:unlock":2525,"upgrades:unlock":2,"reset:fundamental":871,"upgrades:fundamental":550,"reset:primitive":46,"upgrades:primitive":3}; state: unlock{pts 48,465,544 best 0.000; upg [11,12]; ms []; canReset false nextAt 1.000; next upg 13@1.000e20 14@1.000e50 15@1.000e400 16@1.000e925 17@1.000e1550} fundamental{pts 0.000 best 0.000; upg [23]; ms []; canReset false nextAt 10.000; next upg 11@1.000 12@5.000 13@15.000 14@30.000 15@150.000 16@1,000} primitive{pts 24,280,000 best 24,280,000; upg [11,12,13]; ms [1,2]; canReset false nextAt 1.000e12; next upg 14@250,000,000; next ms 3: 3: 1e11 Numbers \| 4: 4: 1e24 Numbers} |

## 2026-09-15T03:45:19Z — A2 part 2 (`node tools/harness/gates-a2.mjs --part 2`) — commit `f555f22` — 7/7 green

Reading this section: the PTR table is A1's (no row-2 feature). A mark is the first tick its predicate held; the run does not stop on marks (--marks-continue), only on the stall window or the wall.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-2 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; features registered 6 |
| A2-2 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; features registered 6 |
| A2-2 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; features registered 6 |
| A2-2 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A2-2 row-2 wall: detector (diff 1, 3600 game-s window, 10 min wall), A1 table | ptr | profile all | 7096 | 7096 | 1 | `01f57735d8b7c11b` | GREEN | stalled true, wall-bounded false; last progress tick 3496 (3496 s); marks points ≥ 1e120 (t/e/s requirement): 3540 ticks / 3540 s / adff35c576bfdba6 · t, e and s canReset: 3550 ticks / 3550 s / 84b973f38e599e82 · b ms 1 ("15 Boosters"): 2860 ticks / 2860 s / d2762c4bfdf21377 · g ms 1 ("10 Generators"): 2629 ticks / 2629 s / fe7c1a8541d77dd8 · g ms 2 ("15 Generators"): 2936 ticks / 2936 s / dc00ee1692610100 · p upg 31–33 owned: 3495 ticks / 3495 s / 233b34f55aa45f0a · points ≥ 1e300 (a second row-2 unlock's requirement): NOT MET; points 2.1939103989963358e237; actions {"reset:p":710,"upgrades:p":169,"reset:g":85,"upgrades:g":10,"reset:b":80,"upgrades:b":6}; state: p{pts 4.82e157 best 4.82e157; upg [11,12,13,21,22,23,31,32,33]; ms []; canReset true gain 3.91e154 nextAt 1.32e237} b{pts 36.00 best 36.00; upg [11,12,13,21,22,23]; ms [0,1]; canReset false nextAt 1.13e238} g{pts 38.00 best 38.00; upg [11,12,13,14,15,21,22,24,23,25]; ms [0,1,2]; canReset false nextAt 2.85e241} t{LOCKED pts 0 best 0; upg []; ms []; canReset true gain 1.00 nextAt 1.00e120; next ms 0: 2 Time Capsules \| 1: 3 Time Capsules} e{LOCKED pts 0 best 0; upg []; ms []; canReset true gain 220.00 nextAt 1.66e237; next ms 0: 2 Enhance Points \| 1: 5 Enhance Points} s{LOCKED pts 0 best 0; upg []; ms []; canReset true gain 1.00 nextAt 1.00e120; next ms 0: 2 Space Energy \| 1: 3 Space Energy} |
| A2-2 detector second run equal | ptr | profile all | 7096 | 7096 | 1 | `01f57735d8b7c11b` | GREEN | stalled true (not wall-bounded: true), last progress tick 3496; ticks/hash/marks/lastProgress equal true; wall 134849 / 135363 ms |
| A2-2 parity node≡page, profile all, at "points ≥ 1e120" | ptr | profile all | 3540 | 3540 | 1 | `adff35c576bfdba6` | GREEN | page adff35c576bfdba6 in 78918 ms; hookStats equal true; actions {"reset:p":354,"upgrades:p":169,"reset:g":76,"upgrades:g":10,"reset:b":73,"upgrades:b":6} |

## 2026-09-15T04:19:17Z — A2 part 3 (`node tools/harness/gates-a2.mjs --part 3`) — commit `b695e47` — 12/12 green

Reading this section: diff 1 (PTR under the A2 table costs ~25 ms/tick); the rung run stops when (iii) holds.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-3 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; features registered 14 |
| A2-3 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; features registered 14 |
| A2-3 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; features registered 14 |
| A2-3 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A2-3 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; features registered 7 |
| A2-3 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; features registered 7 |
| A2-3 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; features registered 7 |
| A2-3 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A2-3 rung (defaults: rowTwoOrder s,t,e, reset:s/t/e interval>=5) (i) one of t/e/s unlocked | ptr | profile all | 3550 | 3550 | 1 | `0513ad9b24806ecc` | GREEN | MET; second run 3550 ticks / 3550 s / 0513ad9b24806ecc — equal true |
| A2-3 rung (defaults: rowTwoOrder s,t,e, reset:s/t/e interval>=5) (ii) t ms 3 or s ms 3 (b.auto / g.auto available) | ptr | profile all | 6037 | 6037 | 1 | `f226c34064109dcb` | GREEN | MET; second run 6037 ticks / 6037 s / f226c34064109dcb — equal true |
| A2-3 rung (defaults: rowTwoOrder s,t,e, reset:s/t/e interval>=5) (iii) t, e and s unlocked | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | MET; second run 8035 ticks / 8035 s / 67743dd40de0b570 — equal true |
| A2-3 parity node≡page, profile all, at (i)'s tick | ptr | profile all | 3550 | 3550 | 1 | `0513ad9b24806ecc` | GREEN | page 0513ad9b24806ecc in 81715 ms; hookStats equal true; actions {"reset:p":355,"upgrades:p":169,"reset:g":76,"upgrades:g":10,"reset:b":74,"upgrades:b":6,"reset:s":1,"buyables:s":1} |

## 2026-09-15T04:24:44Z — A2 part 3o (`node tools/harness/gates-a2.mjs --part 3o`) — commit `b695e47` (tree DIRTY) — 7/7 green

Reading this section: order / control runs record the marks without stopping and end on the monotone stall detector (3600 game-s) or a 9-min wall; the default row is the stall run itself.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-3 order s,t,e (default) | ptr | profile all | 14131 | 14131 | 1 | `46df73d4545bb4e2` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035 |
| A2-3 order t,e,s (alternative) | ptr | profile all | 13621 | 13621 | 1 | `36c021543e8916d8` | GREEN | game-s to (i)/(ii)/(iii): 3550 / NOT MET / NOT MET vs default 3550 / 6037 / 8035; run ended: stalled true (last progress 10021 s), wall-bounded false; row-2 actions {"reset:t":6,"upgrades:t":1,"reset:e":25,"buyables:e":3} |
| A2-3 order e,t,s (alternative) | ptr | profile all | 11047 | 11047 | 1 | `6e9d28250a5561d5` | GREEN | game-s to (i)/(ii)/(iii): 3550 / NOT MET / NOT MET vs default 3550 / 6037 / 8035; run ended: stalled true (last progress 7447 s), wall-bounded false; row-2 actions {"reset:e":28,"buyables:e":3} |
| A2-3 order s,e,t (alternative) | ptr | profile all | 15048 | 15048 | 1 | `262b57d69dd437a5` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / NOT MET vs default 3550 / 6037 / 8035; run ended: stalled false (last progress 13244 s), wall-bounded true; row-2 actions {"reset:s":14,"buyables:s":19,"upgrades:s":5,"reset:e":109,"buyables:e":4,"upgrades:e":1} |
| A2-3 reset:t/e/s all always — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035 vs default 3550 / 6037 / 8035; run ended: stalled false, wall-bounded false |
| A2-3 reset:t/e/s all gain>=1 — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035 vs default 3550 / 6037 / 8035; run ended: stalled false, wall-bounded false |
| A2-3 next stall, default table (monotone detector; diff 1, 3600 game-s window, 9 min wall) | ptr | profile all | 14131 | 14131 | 1 | `46df73d4545bb4e2` | GREEN | stalled true, wall-bounded false; last progress tick 10531 (10531 s); marks (i) one of t/e/s unlocked: 3550 ticks / 3550 s / 0513ad9b24806ecc · (ii) t ms 3 or s ms 3 (b.auto / g.auto available): 6037 ticks / 6037 s / f226c34064109dcb · (iii) t, e and s unlocked: 8035 ticks / 8035 s / 67743dd40de0b570; points 1.1875983088470332e220; actions {"reset:p":1413,"upgrades:p":628,"reset:g":932,"upgrades:g":90,"reset:b":998,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":6,"reset:t":8,"upgrades:t":1,"reset:e":27,"buyables:e":3}; state: p{pts 4.84e131 best 4.84e131; upg [11,12,21,13,22,23,31,32,33]; ms []; canReset true gain 4.84e131 nextAt 7.07e173} b{pts 49.00 best 49.00; upg [11,12,13,21,22,23]; ms [0,1]; canReset false nextAt 2.33e276} g{pts 38.00 best 38.00; upg [11,12,13,14,15,21,22,23,24,25]; ms [0,1,2]; canReset false nextAt 9.32e210} t{pts 6.00 best 6.00; upg [11]; ms [0,1,2,3]; canReset false nextAt 5.43e712; next upg 12@200,000 21@12 22@9.00 24@2.00e17 25@3.00e19; next ms 4: 8 Time Capsules} e{pts 17.00 best 17.00; upg []; ms [0,1]; buy {"11":"3.00"}; canReset false nextAt 1.00e600; next upg 11@25.00 14@3.00e23 23@2.00e20 24@2.50e28; next ms 2: 25 Enhance Points} s{pts 7.00 best 7.00; upg [11,12,13,14,15,23]; ms [0,1,2,3]; buy {"11":"14.00","12":"6.00","13":"3.00","14":"4.00"}; canReset false nextAt 8.65e668; next upg 21@13.00 22@2.50e207 24@1.00e177 25@1.00e244; next ms 4: 8 Space Energy} sb{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 100.00} q{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e512; next ms 0: 2 Total Quirks \| 1: 3 Total Quirks} |

## 2026-09-15T04:33:46Z — A2 part 3s-s (`node tools/harness/gates-a2.mjs --part 3s-s`) — commit `b695e47` (tree DIRTY) — 7/7 green

Reading this section: reset:s swept with the other row-2 resets at their defaults (see 3s-t for the rule).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-3 sweep reset:s interval>=5 — fastest (shortest of ties) | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:s 16; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:s interval>=10 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:s 16; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:s interval>=30 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:s 16; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:s interval>=60 | ptr | profile all | 8045 | 8045 | 1 | `c92d29fac57dafac` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6047 / 8045; reset:s 16; actions {"reset:p":805,"upgrades:p":475,"reset:g":455,"upgrades:g":90,"reset:b":545,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:s interval>=120 | ptr | profile all | 8305 | 8305 | 1 | `577e30b4b1d5d3e6` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6307 / 8305; reset:s 16; actions {"reset:p":831,"upgrades:p":475,"reset:g":468,"upgrades:g":90,"reset:b":570,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:s always — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:s 16; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:s gain>=1 — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:s 16; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |

## 2026-09-15T04:38:57Z — A2 part 3s-t (`node tools/harness/gates-a2.mjs --part 3s-t`) — commit `b695e47` (tree DIRTY) — 7/7 green

Reading this section: reset:t swept with the other row-2 resets at their defaults; the default is the fastest to (ii), ties by (iii), then the shortest interval (a static layer's reset waits on its requirement, so short intervals tie with the controls).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-3 sweep reset:t interval>=5 — fastest (shortest of ties) | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:t 8; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:t interval>=10 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:t 8; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:t interval>=30 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:t 8; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:t interval>=60 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:t 8; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:t interval>=120 | ptr | profile all | 8105 | 8105 | 1 | `b1e22ce6a29dde5e` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8105; reset:t 8; actions {"reset:p":811,"upgrades:p":475,"reset:g":455,"upgrades:g":90,"reset:b":552,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:t always — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:t 8; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:t gain>=1 — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:t 8; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |

## 2026-09-15T04:44:10Z — A2 part 3s-e (`node tools/harness/gates-a2.mjs --part 3s-e`) — commit `b695e47` (tree DIRTY) — 7/7 green

Reading this section: reset:e swept with the other row-2 resets at their defaults (see 3s-t for the rule).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-3 sweep reset:e interval>=5 — fastest (shortest of ties) | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:e interval>=10 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:e interval>=30 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:e interval>=60 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:e interval>=120 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:e always — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| A2-3 sweep reset:e gain>=1 — control | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | game-s to (i)/(ii)/(iii): 3550 / 6037 / 8035; reset:e 1; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |

## 2026-09-15T06:01:55Z — L2 part 1 (`node tools/harness/gates-l2.mjs --part 1`) — commit `e917a5d` — 10/10 green

Reading this section: automation is opt-in: the plain page and `run.mjs --no-automation` are the game plus the contract; the census anchors hold with no `--exclude au`.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-1 G1 load, plain page (no flag) | ptr | — | 3 | 0.15 | 0.05 | — | GREEN | ready 628 ms; 8 `#app .treeNode` (L1: 8); `#app .smallNode.au` × 0; player.au absent; games-auto requests 0; 83 requests, 0 blocked, 0 failed, 0 page errors |
| L2-1 G1 load WITH ?automation=1 (control) | ptr | — | 3 | 0.15 | 0.05 | — | GREEN | ready 869 ms; 8 `#app .treeNode`; `#app .smallNode.au` × 1; player.au present; games-auto requests 1 (/games-auto/ptr.js); 85 requests, 0 blocked, 0 failed, 0 page errors |
| L2-1 census idle hash, Node --no-automation (no --exclude) | ptr | — | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | census d9c5ace6665833d0; automation false; features 0; player keys incl. au: false |
| L2-1 census idle hash, plain page (no --exclude) | ptr | — | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | census d9c5ace6665833d0; page 3972 ms; 0 blocked, 0 failed, 0 page errors |
| L2-1 ?profile=all&autoOpt= without the flag → ignored + warning | ptr | — | 0 | 0 | — | — | GREEN | ready true; automation false; profile off; registerAutoFeature undefined; au false; options {}; au nodes 0; warnings: "tmt-loader: ?profile= is ignored without ?automation=1", "tmt-loader: ?autoOpt= is ignored without ?automation=1"; 0 page errors, 0 console errors |
| L2-1 G1 load, plain page (no flag) | something | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1190 ms; 10 `#app .treeNode` (L1: 10); `#app .smallNode.au` × 0; player.au absent; games-auto requests 0; 83 requests, 0 blocked, 0 failed, 0 page errors |
| L2-1 G1 load WITH ?automation=1 (control) | something | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1318 ms; 11 `#app .treeNode`; `#app .smallNode.au` × 1; player.au present; games-auto requests 1 (/games-auto/something.js); 85 requests, 0 blocked, 0 failed, 0 page errors |
| L2-1 census idle hash, Node --no-automation (no --exclude) | something | — | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | census 46bb8c5b1a96f03a; automation false; features 0; player keys incl. au: false |
| L2-1 census idle hash, plain page (no --exclude) | something | — | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | census 46bb8c5b1a96f03a; page 3738 ms; 0 blocked, 0 failed, 0 page errors |
| L2-1 ?profile=all&autoOpt= without the flag → ignored + warning | something | — | 0 | 0 | — | — | GREEN | ready true; automation false; profile off; registerAutoFeature undefined; au false; options {}; au nodes 0; warnings: "tmt-loader: ?profile= is ignored without ?automation=1", "tmt-loader: ?autoOpt= is ignored without ?automation=1"; 0 page errors, 0 console errors |

## 2026-09-15T06:01:56Z — gates.mjs, automation ON — commit `e917a5d` (tree DIRTY) — 34/34 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| G1 load | ptr | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1669 ms; 8 `#app .treeNode`; 85 requests, 0 blocked, 0 failed, 0 page errors; keys `tmt-loader:ptr:ptr`; other game something: 2 keys in its own prefix, first untouched=true |
| G2a determinism (node ×2) | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | run2 1000 ticks bbbea2c5700357dd |
| G2b save→fresh boot on storage (node) | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | 500 (b4432a973059b267) + 500 after reload vs 1000 straight bbbea2c5700357dd; saved keys 1 |
| G2b save→loadFrom (node) | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | importSave requested reload=true; vs 1000 straight bbbea2c5700357dd |
| G2b save→loadFrom (page, reload) | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | page 500 b4432a973059b267 (node 500 b4432a973059b267); vs node 1000 straight bbbea2c5700357dd |
| G2a determinism (node ×2) | ptr | policy | 1000 | 50 | 0.05 | `7b32d1b37908bd26` | GREEN | run2 1000 ticks 7b32d1b37908bd26 |
| G2b save→fresh boot on storage (node) | ptr | policy | 1000 | 50 | 0.05 | `7b32d1b37908bd26` | GREEN | 500 (aed8f2f6ef58c1aa) + 500 after reload vs 1000 straight 7b32d1b37908bd26; saved keys 1 |
| G2b save→loadFrom (node) | ptr | policy | 1000 | 50 | 0.05 | `7b32d1b37908bd26` | GREEN | importSave requested reload=true; vs 1000 straight 7b32d1b37908bd26 |
| G2b save→loadFrom (page, reload) | ptr | policy | 1000 | 50 | 0.05 | `7b32d1b37908bd26` | GREEN | page 500 aed8f2f6ef58c1aa (node 500 aed8f2f6ef58c1aa); vs node 1000 straight 7b32d1b37908bd26 |
| G2c upstream export → loadFrom | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | upstream d9c5ace6665833d0; equalRaw=true equalCanonical=true; exported 13924 b64 chars |
| G3 idle hash = census | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | census d9c5ace6665833d0 @ 200×0.05; automation true (au excluded) |
| G3 parity node≡page | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | page bbbea2c5700357dd in 29382 ms |
| G3 parity node≡page | ptr | idle | 200 | 200 | 1 | `681ab939b36dd333` | GREEN | page 681ab939b36dd333 in 7142 ms |
| G3 parity node≡page | ptr | policy | 1000 | 50 | 0.05 | `7b32d1b37908bd26` | GREEN | page 7b32d1b37908bd26 in 30539 ms |
| G3 parity control (page +1 point, must diverge) | ptr | idle | 200 | 10 | 0.05 | `5738d67e916b743f` | GREEN | diverged at key "points" |
| G4 goldens | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers; ms 85 / upg 172 / buy 52 / ch 9 / ach 80 (census equal=true) |
| G4 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, vendor sha256 ok, subtree split cec9198, games/ptr pristine |
| G1 load | something | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1238 ms; 11 `#app .treeNode`; 85 requests, 0 blocked, 0 failed, 0 page errors; keys `tmt-loader:something:Justcubing97's-Something-Tree-Justcubing97_options`, `tmt-loader:something:Justcubing97's-Something-Tree-Justcubing97`; other game ptr: 1 keys in its own prefix, first untouched=true |
| G2a determinism (node ×2) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | run2 1000 ticks 07434b9b191874b7 |
| G2b save→fresh boot on storage (node) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | 500 (6f89dc8f66c95ae2) + 500 after reload vs 1000 straight 07434b9b191874b7; saved keys 2 |
| G2b save→loadFrom (node) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | importSave requested reload=true; vs 1000 straight 07434b9b191874b7 |
| G2b save→loadFrom (page, reload) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | page 500 6f89dc8f66c95ae2 (node 500 6f89dc8f66c95ae2); vs node 1000 straight 07434b9b191874b7 |
| G2a determinism (node ×2) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | run2 1000 ticks 3099e519164fd0e1 |
| G2b save→fresh boot on storage (node) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | 500 (67cc684a830113c8) + 500 after reload vs 1000 straight 3099e519164fd0e1; saved keys 2 |
| G2b save→loadFrom (node) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | importSave requested reload=true; vs 1000 straight 3099e519164fd0e1 |
| G2b save→loadFrom (page, reload) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | page 500 67cc684a830113c8 (node 500 67cc684a830113c8); vs node 1000 straight 3099e519164fd0e1 |
| G2c upstream export → loadFrom | something | idle | 200 | 10 | 0.05 | `3b3387ad418fed58` | GREEN | upstream 686f6bdfdeb146ba; equalRaw=false equalCanonical=true (raw differs in KEY ORDER only: the upstream page's async modFiles race); exported 11228 b64 chars |
| G3 idle hash = census | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | census 46bb8c5b1a96f03a @ 200×0.05; automation true (au excluded) |
| G3 parity node≡page | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | page 07434b9b191874b7 in 8239 ms |
| G3 parity node≡page | something | idle | 200 | 200 | 1 | `9f1ac98062ef88e3` | GREEN | page 9f1ac98062ef88e3 in 1714 ms |
| G3 parity node≡page | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | page 3099e519164fd0e1 in 13563 ms |
| G3 parity control (page +1 point, must diverge) | something | idle | 200 | 10 | 0.05 | `f48357b2f71f5247` | GREEN | diverged at key "points" |
| G4 goldens | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers; ms 68 / upg 175 / buy 23 / ch 11 / ach 52 (census equal=true) |
| G4 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, vendor sha256 ok, subtree split 30a311b, games/something pristine |

## 2026-09-15T06:11:07Z — A1 part 2 (`node tools/harness/gates-a1.mjs --part 2`) — commit `e917a5d` (tree DIRTY) — 22/22 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A1-2 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; full state incl. au e46d4e0a59172eaf; features registered 14 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; full state incl. au bbbea2c5700357dd; features registered 14 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; full state incl. au 7b32d1b37908bd26; features registered 14 (games-auto/ptr.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | 28 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 1 (p); au fallback (layer's slot skipped by the engine): 27 (b g t e s sb sg h q o ss m ba ps hn n hs i ma ge mc en ne id r ai c); hash = policy anchor |
| A1-2 updateTemp does not call automate | ptr | policy | 200 | 10 | 0.05 | `00a4d66586c7396e` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | page bbbea2c5700357dd in 22124 ms |
| A1-2 parity hookAll (counters node≡page) | ptr | policy | 200 | 10 | 0.05 | `00a4d66586c7396e` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A1-2 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, games/ptr pristine, auto games-auto/ptr.js |
| A1-2 au layer in the page | ptr | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 14 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | ptr | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 14 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Prestige reset); ✓ click turned "Prestige reset" on; ✓ disclosure line after the first click; ✓ save namespaced (1 keys under tmt-loader:ptr:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/ptr-au-{off,all,toggled}.png |
| A1-2 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; full state incl. au c3332a16dcef363c; features registered 7 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; full state incl. au 07434b9b191874b7; features registered 7 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; full state incl. au 3099e519164fd0e1; features registered 7 (games-auto/something.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | 14 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 14 (planetary pbooster polygon dimension arithmetic addition subtraction multiplication division primitive numbercore corebooster fundamental unlock); au fallback (layer's slot skipped by the engine): 0; hash = policy anchor |
| A1-2 updateTemp does not call automate | something | policy | 200 | 10 | 0.05 | `d25c967e821a0d6a` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | page 07434b9b191874b7 in 23142 ms |
| A1-2 parity hookAll (counters node≡page) | something | policy | 200 | 10 | 0.05 | `15d3fc1cb1de1bcf` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A1-2 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, games/something pristine, auto games-auto/something.js |
| A1-2 au layer in the page | something | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 7 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | something | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 7 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Unlock reset); ✓ click turned "Unlock reset" on; ✓ disclosure line after the first click; ✓ save namespaced (2 keys under tmt-loader:something:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/something-au-{off,all,toggled}.png |

## 2026-09-15T06:14:37Z — A2 part 1 (`node tools/harness/gates-a2.mjs --part 1`) — commit `e917a5d` (tree DIRTY) — 23/23 green

Reading this section: GREEN = the run completed and (where a second run exists) was equal; a predicate's own verdict is in its notes (MET / NOT MET). The sweep rows are ordered by policy; the default is the fastest to (ii), ties broken by (iii).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A2-1 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; features registered 7 |
| A2-1 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; features registered 7 |
| A2-1 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; features registered 7 |
| A2-1 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A2-1 rung (default reset:primitive interval>=90) (i) primitive reset ≥ 1 (primitive.total ≥ 1) | something | profile all | 4163 | 208.15 | 0.05 | `0c88dcd6b5a9e1cb` | GREEN | MET; second run 4163 ticks / 208.15 s / 0c88dcd6b5a9e1cb — equal true |
| A2-1 rung (default reset:primitive interval>=90) (ii) primitive ms 1 ("10 Numbers") | something | profile all | 5963 | 298.15 | 0.05 | `5682500e1f849fb8` | GREEN | MET; second run 5963 ticks / 298.15 s / 5682500e1f849fb8 — equal true |
| A2-1 rung (default reset:primitive interval>=90) (iii) primitive ms 2 ("100,000 Numbers") | something | profile all | 9563 | 478.15 | 0.05 | `449775de97d4af2d` | GREEN | MET; second run 9563 ticks / 478.15 s / 449775de97d4af2d — equal true |
| A2-1 coarse diff (sweep row interval>=90) (i) primitive reset ≥ 1 (primitive.total ≥ 1) | something | profile all | 309 | 309 | 1 | `6da92645ec93a9ab` | GREEN | MET |
| A2-1 coarse diff (sweep row interval>=90) (ii) primitive ms 1 ("10 Numbers") | something | profile all | 399 | 399 | 1 | `53240faafd36f329` | GREEN | MET |
| A2-1 coarse diff (sweep row interval>=90) (iii) primitive ms 2 ("100,000 Numbers") | something | profile all | 579 | 579 | 1 | `30d121d791768aa4` | GREEN | MET |
| A2-1 sweep reset:primitive interval>=5 | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=10 | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=30 | something | profile all | 20000 | 20000 | 1 | `5ad9aa738e6504bf` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 654; actions {"reset:unlock":10697,"upgrades:unlock":2,"reset:fundamental":3997,"upgrades:fundamental":7205,"reset:primitive":654,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=60 | something | profile all | 17109 | 17109 | 1 | `5d0661751e5e7690` | GREEN | game-s to (i)/(ii)/(iii): 309 / 429 / 17109; primitive resets 281; actions {"reset:unlock":9705,"upgrades:unlock":2,"reset:fundamental":3421,"upgrades:fundamental":3368,"reset:primitive":281,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=90 — fastest | something | profile all | 579 | 579 | 1 | `30d121d791768aa4` | GREEN | game-s to (i)/(ii)/(iii): 309 / 399 / 579; primitive resets 4; actions {"reset:unlock":341,"upgrades:unlock":2,"reset:fundamental":115,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive interval>=120 | something | profile all | 669 | 669 | 1 | `00a563430e2de3ff` | GREEN | game-s to (i)/(ii)/(iii): 309 / 429 / 669; primitive resets 4; actions {"reset:unlock":395,"upgrades:unlock":2,"reset:fundamental":133,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive interval>=180 | something | profile all | 849 | 849 | 1 | `d234618fa372212c` | GREEN | game-s to (i)/(ii)/(iii): 309 / 489 / 849; primitive resets 4; actions {"reset:unlock":503,"upgrades:unlock":2,"reset:fundamental":169,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive interval>=240 | something | profile all | 789 | 789 | 1 | `4dce5624e4639a9d` | GREEN | game-s to (i)/(ii)/(iii): 309 / 549 / 789; primitive resets 3; actions {"reset:unlock":469,"upgrades:unlock":2,"reset:fundamental":157,"upgrades:fundamental":35,"reset:primitive":3,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive interval>=300 | something | profile all | 909 | 909 | 1 | `54c4783f5595f490` | GREEN | game-s to (i)/(ii)/(iii): 309 / 609 / 909; primitive resets 3; actions {"reset:unlock":541,"upgrades:unlock":2,"reset:fundamental":181,"upgrades:fundamental":35,"reset:primitive":3,"upgrades:primitive":3} |
| A2-1 sweep reset:primitive always — control | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 sweep reset:primitive gain>=1 — control | something | profile all | 20000 | 20000 | 1 | `0c865919e527e189` | GREEN | game-s to (i)/(ii)/(iii): 309 / 501 / NOT MET; primitive resets 754; actions {"reset:unlock":10797,"upgrades:unlock":2,"reset:fundamental":3847,"upgrades:fundamental":8305,"reset:primitive":754,"upgrades:primitive":2} |
| A2-1 parity node≡page, profile all, at (ii)'s tick | something | profile all | 5963 | 298.15 | 0.05 | `5682500e1f849fb8` | GREEN | page 5682500e1f849fb8 in 144437 ms; hookStats equal true; actions {"reset:unlock":5803,"upgrades:unlock":2,"reset:fundamental":59,"upgrades:fundamental":22,"reset:primitive":2,"upgrades:primitive":1} |
| A2-1 next stall (diff 1, 3600 game-s window, 2 min wall) | something | profile all | 3908 | 3908 | 1 | `0da3d59c9ecb9d57` | GREEN | stalled false, wall-bounded true; last progress tick 3870 (3870 s); marks ; points 1.21512526604597e28; actions {"reset:unlock":2265,"upgrades:unlock":2,"reset:fundamental":781,"upgrades:fundamental":490,"reset:primitive":40,"upgrades:primitive":3}; state: unlock{pts 42,803,354 best 0.000; upg [11,12]; ms []; canReset false nextAt 1.000; next upg 13@1.000e20 14@1.000e50 15@1.000e400 16@1.000e925 17@1.000e1550} fundamental{pts 3.889e28 best 3.889e28; upg [23,11,12,13,14,15,16,17,21,22,24,25,26]; ms []; canReset false nextAt 10.000; next upg 27@1.000e51} primitive{pts 20,700,364 best 20,700,364; upg [11,12,13]; ms [1,2]; canReset true gain 596,606 nextAt 3.889e28; next upg 14@250,000,000; next ms 3: 3: 1e11 Numbers \| 4: 4: 1e24 Numbers} |
