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

## 2026-09-15T06:27:26Z — L2-2 (`node tools/add-game.mjs Dressygithub/The-Dressy-Tree`) — commit `24e29cd` (tree DIRTY) — 5/5 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-2 check-manifest | the-dressy-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 20 modFiles, subtree split d553021, games/the-dressy-tree pristine |
| L2-2 idle hash = census | the-dressy-tree | idle | 200 | 10 | 0.05 | `f0e093c5b76d1d9c` | GREEN | census f0e093c5b76d1d9c |
| L2-2 goldens counts = census | the-dressy-tree | — | 0 | 0 | — | — | GREEN | 301 ids, 25 layers; ms 17 / upg 238 / buy 12 / ch 9 / ach 25 = census |
| L2-2 G1 load (plain page) | the-dressy-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1919 ms; 9 `#app .treeNode`; 86 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-dressy-tree:dressyapper`, `tmt-loader:the-dressy-tree:dressyapper_options` |
| L2-2 empty au tab (?automation=1, no table) | the-dressy-tree | — | 0 | 0 | — | — | GREEN | ready true; features 0; tab au; "Automation Tools" rendered true; 1 clickables (the master toggle, disabled); `#app .smallNode.au` × 1; profile off; 0 page errors, 0 failed, 0 blocked |

## 2026-09-15T06:27:40Z — L2-2 dry-run (`node tools/add-game.mjs Jacorb90/Prestige-Tree Justcubing97/JC97sSomethingTree --dry-run`) — commit `24e29cd` (tree DIRTY) — 2/2 green

Reading this section: no git operation; a game already in the loader is matched by upstream.repo and its emitted manifest compared to the committed one without generated.at and the hand-written auto.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-2 dry-run reproduces manifest | ptr | — | — | — | — | — | GREEN | Jacorb90/Prestige-Tree @ cec9198c8ce9a5c6d107179871cbe84fab92ae0d; license MIT {"LICENSE":"MIT","Prestige-tree-license":"MIT"}; manifests/ptr.json equal=true |
| L2-2 dry-run reproduces manifest | something | — | — | — | — | — | GREEN | Justcubing97/JC97sSomethingTree @ 30a311be6b91470f9c7818b6747bd7426b1b1f90; license MIT {"LICENSE":"MIT","Prestige-tree-license":"MIT"}; manifests/something.json equal=true |

## 2026-09-15T06:29:08Z — L2-3 batch 1 (`node tools/add-game.mjs CrazyHighNumbers69/The-Modding-Tree skylafalls/Extended-Tree Omega-pgg/The-Modding-Tree FlareZ0000/The-Modding-Tree KremboMC/Ultimate-Prestige-Tree liamhmn/The-Modding-Tree unsoftcapped4/Prestige-Tree-Rewritten peacefulwar/Arc-Tree MsliAghtlyD/A-Tree-For-Sure Sersseras/The-Modding-Tree`) — commit `767f875` (tree DIRTY) — 38/40 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 batch 1 check-manifest | the-pro-tree | — | 0 | 0 | — | — | **RED** | [{"field":"boot.file_errors","live":[{"file":"js/ascension.js","error":"missing"},{"file":"js/objects.js","error":"missing"},{"file":"js/quantums.js","error":"missing"},{"file":"js/trans.js","error":"missing"},{"file":"js/zones.js","error":"missing"}]}] |
| L2-3 batch 1 idle hash = census | the-pro-tree | idle | 200 | 10 | 0.05 | `f2a681aabe407370` | GREEN | census f2a681aabe407370 |
| L2-3 batch 1 goldens counts = census | the-pro-tree | — | 0 | 0 | — | — | GREEN | 1595 ids, 47 layers; ms 95 / upg 1207 / buy 34 / ch 72 / ach 187 = census |
| L2-3 batch 1 G1 load (plain page) | the-pro-tree | — | — | — | 0.05 | — | **RED** | ready 870 ms; 0 `#app .treeNode`; undefined requests, undefined non-localhost, undefined failed, undefined page errors; au nodes 0; keys ; RED: ready false error {"step":"script js/ascension.js","message":"js/ascension.js: failed to load http://127.0.0.1:8337/games/the-pro-tree/js/ascension.js"}; 0 treeNodes; blocked undefined undefined; failed undefined; page errors undefined; page.evaluate: TypeError: window.tmtLoader.tick is not a function     at eval (eval at evaluate (:290:30), <anonymous>:1:30)     at UtilityScript.evaluate (<anonym |
| L2-3 batch 1 check-manifest | the-extended-tree | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, subtree split d2e17b8, games/the-extended-tree pristine |
| L2-3 batch 1 idle hash = census | the-extended-tree | idle | 200 | 10 | 0.05 | `55e28c6b0a0cb41f` | GREEN | census 55e28c6b0a0cb41f |
| L2-3 batch 1 goldens counts = census | the-extended-tree | — | 0 | 0 | — | — | GREEN | 486 ids, 42 layers; ms 103 / upg 233 / buy 58 / ch 12 / ach 80 = census |
| L2-3 batch 1 G1 load (plain page) | the-extended-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 640 ms; 10 `#app .treeNode`; 56 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-extended-tree:tet` |
| L2-3 batch 1 check-manifest | the-omega-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 29 modFiles, subtree split f7899c0, games/the-omega-tree pristine |
| L2-3 batch 1 idle hash = census | the-omega-tree | idle | 200 | 10 | 0.05 | `e243e9e70bd030f6` | GREEN | census e243e9e70bd030f6 |
| L2-3 batch 1 goldens counts = census | the-omega-tree | — | 0 | 0 | — | — | GREEN | 887 ids, 33 layers; ms 112 / upg 569 / buy 19 / ch 17 / ach 170 = census |
| L2-3 batch 1 G1 load (plain page) | the-omega-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1273 ms; 13 `#app .treeNode`; 95 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-omega-tree:2_options`, `tmt-loader:the-omega-tree:2` |
| L2-3 batch 1 check-manifest | the-alphabetree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split df0edf2, games/the-alphabetree pristine |
| L2-3 batch 1 idle hash = census | the-alphabetree | idle | 200 | 10 | 0.05 | `0c7f9352e4968734` | GREEN | census 0c7f9352e4968734 |
| L2-3 batch 1 goldens counts = census | the-alphabetree | — | 0 | 0 | — | — | GREEN | 31 ids, 51 layers; ms 11 / upg 20 / buy 0 / ch 0 / ach 0 = census |
| L2-3 batch 1 G1 load (plain page) | the-alphabetree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 967 ms; 72 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-alphabetree:Project2_options`, `tmt-loader:the-alphabetree:Project2` |
| L2-3 batch 1 check-manifest | ultimate-prestige-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split ddddb46, games/ultimate-prestige-tree pristine |
| L2-3 batch 1 idle hash = census | ultimate-prestige-tree | idle | 200 | 10 | 0.05 | `21b44c794ad7844e` | GREEN | census 21b44c794ad7844e |
| L2-3 batch 1 goldens counts = census | ultimate-prestige-tree | — | 0 | 0 | — | — | GREEN | 102 ids, 16 layers; ms 23 / upg 64 / buy 15 / ch 0 / ach 0 = census |
| L2-3 batch 1 G1 load (plain page) | ultimate-prestige-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 907 ms; 5 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:ultimate-prestige-tree:Ultimate-Prestige-Tree-Krembo_options`, `tmt-loader:ultimate-prestige-tree:Ultimate-Prestige-Tree-Krembo` |
| L2-3 batch 1 check-manifest | the-number-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 16 modFiles, subtree split 7a7e26d, games/the-number-tree pristine |
| L2-3 batch 1 idle hash = census | the-number-tree | idle | 200 | 10 | 0.05 | `707f273ea90cc68c` | GREEN | census 707f273ea90cc68c |
| L2-3 batch 1 goldens counts = census | the-number-tree | — | 0 | 0 | — | — | GREEN | 450 ids, 22 layers; ms 153 / upg 160 / buy 24 / ch 64 / ach 49 = census |
| L2-3 batch 1 G1 load (plain page) | the-number-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1107 ms; 10 `#app .treeNode`; 82 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-number-tree:factor`, `tmt-loader:the-number-tree:factor_options` |
| L2-3 batch 1 check-manifest | prestige-tree-rewritten-unsoftcapped4 | — | 0 | 0 | — | — | GREEN | 12 scripts, 0 modFiles, subtree split 797ba44, games/prestige-tree-rewritten-unsoftcapped4 pristine |
| L2-3 batch 1 idle hash = census | prestige-tree-rewritten-unsoftcapped4 | idle | 200 | 10 | 0.05 | `74da9abe6c36c5de` | GREEN | census 74da9abe6c36c5de |
| L2-3 batch 1 goldens counts = census | prestige-tree-rewritten-unsoftcapped4 | — | 0 | 0 | — | — | GREEN | 221 ids, 22 layers; ms 45 / upg 119 / buy 17 / ch 8 / ach 32 = census |
| L2-3 batch 1 G1 load (plain page) | prestige-tree-rewritten-unsoftcapped4 | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1072 ms; 7 `#app .treeNode`; 55 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:prestige-tree-rewritten-unsoftcapped4:ptr` |
| L2-3 batch 1 check-manifest | arc-tree | — | 0 | 0 | — | — | GREEN | 32 scripts, 2 modFiles, subtree split eb5125d, games/arc-tree pristine |
| L2-3 batch 1 idle hash = census | arc-tree | idle | 200 | 10 | 0.05 | `e451203623a10f70` | GREEN | census e451203623a10f70 |
| L2-3 batch 1 goldens counts = census | arc-tree | — | 0 | 0 | — | — | GREEN | 330 ids, 21 layers; ms 65 / upg 170 / buy 17 / ch 13 / ach 65 = census |
| L2-3 batch 1 G1 load (plain page) | arc-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1138 ms; 8 `#app .treeNode`; 83 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:arc-tree:Arc-Tree-TEWAR`, `tmt-loader:arc-tree:Arc-Tree-TEWAR_options` |
| L2-3 batch 1 check-manifest | a-tree-for-sure | — | 0 | 0 | — | — | GREEN | 17 scripts, 6 modFiles, subtree split bb2018f, games/a-tree-for-sure pristine |
| L2-3 batch 1 idle hash = census | a-tree-for-sure | idle | 200 | 10 | 0.05 | `5b174e70d8fd4c22` | GREEN | census 5b174e70d8fd4c22 |
| L2-3 batch 1 goldens counts = census | a-tree-for-sure | — | 0 | 0 | — | — | GREEN | 147 ids, 13 layers; ms 13 / upg 82 / buy 9 / ch 11 / ach 32 = census |
| L2-3 batch 1 G1 load (plain page) | a-tree-for-sure | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1045 ms; 5 `#app .treeNode`; 72 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:a-tree-for-sure:thismodsurewaswrittenbymsliaghtlyd`, `tmt-loader:a-tree-for-sure:thismodsurewaswrittenbymsliaghtlyd_options` |
| L2-3 batch 1 check-manifest | the-algebra-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 9868edc, games/the-algebra-tree pristine |
| L2-3 batch 1 idle hash = census | the-algebra-tree | idle | 200 | 10 | 0.05 | `82c47d7238db490c` | GREEN | census 82c47d7238db490c |
| L2-3 batch 1 goldens counts = census | the-algebra-tree | — | 0 | 0 | — | — | GREEN | 110 ids, 21 layers; ms 24 / upg 57 / buy 29 / ch 0 / ach 0 = census |
| L2-3 batch 1 G1 load (plain page) | the-algebra-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 909 ms; 7 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-algebra-tree:The-Algebra-Tree-Alvi-Deiectiones_options`, `tmt-loader:the-algebra-tree:The-Algebra-Tree-Alvi-Deiectiones` |

## 2026-09-15T06:30:59Z — L2-3 batch 2 (`node tools/add-game.mjs Onesmartshark/Earth-Tree Inferno-Inc/The-Primordial-Tree freddifred/The-Modding-Tree Slicedberg/Ore-Tree great0108/The-Modding-Tree quwpsss/The-Modding-Tree XtremeRusher/The-Modding-Tree MartianCreations/The-Congratulations-Tree liam43210/The-Prestige-Tree-2 Efsoone/The-Modding-Tree`) — commit `46d5a208` (tree DIRTY) — 39/40 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 batch 2 check-manifest | the-earth-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 52fb645, games/the-earth-tree pristine |
| L2-3 batch 2 idle hash = census | the-earth-tree | idle | 200 | 10 | 0.05 | `c5ff1a1f20bd25b4` | GREEN | census c5ff1a1f20bd25b4 |
| L2-3 batch 2 goldens counts = census | the-earth-tree | — | 0 | 0 | — | — | GREEN | 122 ids, 20 layers; ms 18 / upg 78 / buy 2 / ch 4 / ach 20 = census |
| L2-3 batch 2 G1 load (plain page) | the-earth-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 921 ms; 7 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-earth-tree:saves1`, `tmt-loader:the-earth-tree:saves1_options` |
| L2-3 batch 2 check-manifest | the-primordial-tree | — | 0 | 0 | — | — | GREEN | 19 scripts, 2 modFiles, subtree split 481c8bd, games/the-primordial-tree pristine |
| L2-3 batch 2 idle hash = census | the-primordial-tree | idle | 200 | 10 | 0.05 | `44231aea805bee8c` | GREEN | census 44231aea805bee8c |
| L2-3 batch 2 goldens counts = census | the-primordial-tree | — | 0 | 0 | — | — | GREEN | 372 ids, 21 layers; ms 144 / upg 138 / buy 13 / ch 5 / ach 72 = census |
| L2-3 batch 2 G1 load (plain page) | the-primordial-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 970 ms; 9 `#app .treeNode`; 70 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-primordial-tree:Yrahcaz7-ModTree-ThePrimordialTree_options`, `tmt-loader:the-primordial-tree:Yrahcaz7-ModTree-ThePrimordialTree` |
| L2-3 batch 2 check-manifest | bobbit-s-tech-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 3bd5313, games/bobbit-s-tech-tree pristine |
| L2-3 batch 2 idle hash = census | bobbit-s-tech-tree | idle | 200 | 10 | 0.05 | `d19ed73fc543d6e4` | GREEN | census d19ed73fc543d6e4 |
| L2-3 batch 2 goldens counts = census | bobbit-s-tech-tree | — | 0 | 0 | — | — | GREEN | 22 ids, 83 layers; ms 9 / upg 13 / buy 0 / ch 0 / ach 0 = census |
| L2-3 batch 2 G1 load (plain page) | bobbit-s-tech-tree | — | — | — | 0.05 | — | **RED** | ready 558 ms; 0 `#app .treeNode`; undefined requests, undefined non-localhost, undefined failed, undefined page errors; au nodes 0; keys ; RED: ready false error {"step":"script js/technical/temp.js","message":"js/technical/temp.js: player is not defined"}; 0 treeNodes; blocked undefined undefined; failed undefined; page errors undefined; page.evaluate: TypeError: window.tmtLoader.tick is not a function     at eval (eval at evaluate (:290:30), <anonymous>:1:30)     at UtilityScript.evaluate (<anonymous>:292:16)     at UtilityScript.<anony |
| L2-3 batch 2 check-manifest | the-ore-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 511718c, games/the-ore-tree pristine |
| L2-3 batch 2 idle hash = census | the-ore-tree | idle | 200 | 10 | 0.05 | `30cd55f3a16fbda7` | GREEN | census 30cd55f3a16fbda7 |
| L2-3 batch 2 goldens counts = census | the-ore-tree | — | 0 | 0 | — | — | GREEN | 85 ids, 11 layers; ms 9 / upg 49 / buy 7 / ch 2 / ach 18 = census |
| L2-3 batch 2 G1 load (plain page) | the-ore-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 957 ms; 5 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-ore-tree:The-Ore-Tree-Slicedberg`, `tmt-loader:the-ore-tree:The-Ore-Tree-Slicedberg_options` |
| L2-3 batch 2 check-manifest | the-mechanic-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 5 modFiles, subtree split 8f7d901, games/the-mechanic-tree pristine |
| L2-3 batch 2 idle hash = census | the-mechanic-tree | idle | 200 | 10 | 0.05 | `c4fc19da2982d95f` | GREEN | census c4fc19da2982d95f |
| L2-3 batch 2 goldens counts = census | the-mechanic-tree | — | 0 | 0 | — | — | GREEN | 103 ids, 9 layers; ms 5 / upg 84 / buy 14 / ch 0 / ach 0 = census |
| L2-3 batch 2 G1 load (plain page) | the-mechanic-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 962 ms; 4 `#app .treeNode`; 71 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-mechanic-tree:mechanicTree`, `tmt-loader:the-mechanic-tree:mechanicTree_options` |
| L2-3 batch 2 check-manifest | the-danus-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 10 modFiles, subtree split c3533ea, games/the-danus-tree pristine |
| L2-3 batch 2 idle hash = census | the-danus-tree | idle | 200 | 10 | 0.05 | `6157da6bf3d82c26` | GREEN | census 6157da6bf3d82c26 |
| L2-3 batch 2 goldens counts = census | the-danus-tree | — | 0 | 0 | — | — | GREEN | 148 ids, 14 layers; ms 20 / upg 120 / buy 8 / ch 0 / ach 0 = census |
| L2-3 batch 2 G1 load (plain page) | the-danus-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 980 ms; 6 `#app .treeNode`; 76 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-danus-tree:8318_options`, `tmt-loader:the-danus-tree:8318` |
| L2-3 batch 2 check-manifest | collection-of-everything | — | 0 | 0 | — | — | GREEN | 17 scripts, 5 modFiles, subtree split f8c385f, games/collection-of-everything pristine |
| L2-3 batch 2 idle hash = census | collection-of-everything | idle | 200 | 10 | 0.05 | `0db72462f2c3d720` | GREEN | census 0db72462f2c3d720 |
| L2-3 batch 2 goldens counts = census | collection-of-everything | — | 0 | 0 | — | — | GREEN | 56 ids, 17 layers; ms 9 / upg 26 / buy 4 / ch 4 / ach 13 = census |
| L2-3 batch 2 G1 load (plain page) | collection-of-everything | — | 3 | 0.15 | 0.05 | — | GREEN | ready 974 ms; 4 `#app .treeNode`; 72 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:collection-of-everything:XR2003_options`, `tmt-loader:collection-of-everything:XR2003` |
| L2-3 batch 2 check-manifest | the-congratulations-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 8 modFiles, subtree split 0fe659e, games/the-congratulations-tree pristine |
| L2-3 batch 2 idle hash = census | the-congratulations-tree | idle | 200 | 10 | 0.05 | `3c2ac120796dd1fa` | GREEN | census 3c2ac120796dd1fa |
| L2-3 batch 2 goldens counts = census | the-congratulations-tree | — | 0 | 0 | — | — | GREEN | 57 ids, 12 layers; ms 0 / upg 52 / buy 0 / ch 0 / ach 5 = census |
| L2-3 batch 2 G1 load (plain page) | the-congratulations-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1029 ms; 5 `#app .treeNode`; 76 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-congratulations-tree:The-Congratulations-Tree-Moon-Charm-Muahaha_options`, `tmt-loader:the-congratulations-tree:The-Congratulations-Tree-Moon-Charm-Muahaha` |
| L2-3 batch 2 check-manifest | the-prestige-tree-2 | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split fcfd0d1, games/the-prestige-tree-2 pristine |
| L2-3 batch 2 idle hash = census | the-prestige-tree-2 | idle | 200 | 10 | 0.05 | `0a00a5ad5b72f7f4` | GREEN | census 0a00a5ad5b72f7f4 |
| L2-3 batch 2 goldens counts = census | the-prestige-tree-2 | — | 0 | 0 | — | — | GREEN | 35 ids, 10 layers; ms 3 / upg 21 / buy 0 / ch 0 / ach 11 = census |
| L2-3 batch 2 G1 load (plain page) | the-prestige-tree-2 | — | 3 | 0.15 | 0.05 | — | GREEN | ready 873 ms; 5 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-prestige-tree-2:767756845683579465_options`, `tmt-loader:the-prestige-tree-2:767756845683579465` |
| L2-3 batch 2 check-manifest | the-reborn-incremental-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 7ccd26d, games/the-reborn-incremental-tree pristine |
| L2-3 batch 2 idle hash = census | the-reborn-incremental-tree | idle | 200 | 10 | 0.05 | `7381a5ddd7238b6b` | GREEN | census 7381a5ddd7238b6b |
| L2-3 batch 2 goldens counts = census | the-reborn-incremental-tree | — | 0 | 0 | — | — | GREEN | 40 ids, 10 layers; ms 15 / upg 25 / buy 0 / ch 0 / ach 0 = census |
| L2-3 batch 2 G1 load (plain page) | the-reborn-incremental-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 892 ms; 4 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-reborn-incremental-tree:The-Reborn-Incremental-Tree-Efsoone`, `tmt-loader:the-reborn-incremental-tree:The-Reborn-Incremental-Tree-Efsoone_options` |

## 2026-09-15T06:32:50Z — L2-3 batch 3 (`node tools/add-game.mjs difficultcomplexity/The-Modding-Tree liamthecatguy/The-Upgradeverse-Tree rainbowice975/The-Jax-Tree temptempa/The-Modding-Tree The-Alternate-Tree/A-Tree-About-Layers weyrhvwvrwuvureurw/The-Modding-Tree TheIcyIcicle/The-Modding-Tree notadragon/counting-sheep-tree RaceproxateDev/The-Ultimate-Prestige-Tree am30936/The-Modding-Tree`) — commit `f2294aac` (tree DIRTY) — 40/40 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 batch 3 check-manifest | the-weight-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 11 modFiles, subtree split a0fbf45, games/the-weight-tree pristine |
| L2-3 batch 3 idle hash = census | the-weight-tree | idle | 200 | 10 | 0.05 | `1cd140bc4485abc9` | GREEN | census 1cd140bc4485abc9 |
| L2-3 batch 3 goldens counts = census | the-weight-tree | — | 0 | 0 | — | — | GREEN | 142 ids, 15 layers; ms 32 / upg 62 / buy 1 / ch 12 / ach 35 = census |
| L2-3 batch 3 G1 load (plain page) | the-weight-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1010 ms; 6 `#app .treeNode`; 77 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-weight-tree:weightful`, `tmt-loader:the-weight-tree:weightful_options` |
| L2-3 batch 3 check-manifest | the-upgradeverse-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 7 modFiles, subtree split 34014a5, games/the-upgradeverse-tree pristine |
| L2-3 batch 3 idle hash = census | the-upgradeverse-tree | idle | 200 | 10 | 0.05 | `c6f0e6879154a837` | GREEN | census c6f0e6879154a837 |
| L2-3 batch 3 goldens counts = census | the-upgradeverse-tree | — | 0 | 0 | — | — | GREEN | 39 ids, 11 layers; ms 3 / upg 36 / buy 0 / ch 0 / ach 0 = census |
| L2-3 batch 3 G1 load (plain page) | the-upgradeverse-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 951 ms; 6 `#app .treeNode`; 73 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-upgradeverse-tree:The-Upgradeverse-Tree-liam`, `tmt-loader:the-upgradeverse-tree:The-Upgradeverse-Tree-liam_options` |
| L2-3 batch 3 check-manifest | the-jax-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 1a26f5b, games/the-jax-tree pristine |
| L2-3 batch 3 idle hash = census | the-jax-tree | idle | 200 | 10 | 0.05 | `395287cb861684ca` | GREEN | census 395287cb861684ca |
| L2-3 batch 3 goldens counts = census | the-jax-tree | — | 0 | 0 | — | — | GREEN | 50 ids, 10 layers; ms 4 / upg 38 / buy 0 / ch 0 / ach 8 = census |
| L2-3 batch 3 G1 load (plain page) | the-jax-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 944 ms; 5 `#app .treeNode`; 69 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-jax-tree:The-Jax-Tree-jaxxie`, `tmt-loader:the-jax-tree:The-Jax-Tree-jaxxie_options` |
| L2-3 batch 3 check-manifest | the-douyuan-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 56fedd1, games/the-douyuan-tree pristine |
| L2-3 batch 3 idle hash = census | the-douyuan-tree | idle | 200 | 10 | 0.05 | `917c52fbd8405c94` | GREEN | census 917c52fbd8405c94 |
| L2-3 batch 3 goldens counts = census | the-douyuan-tree | — | 0 | 0 | — | — | GREEN | 26 ids, 9 layers; ms 3 / upg 23 / buy 0 / ch 0 / ach 0 = census |
| L2-3 batch 3 G1 load (plain page) | the-douyuan-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 874 ms; 3 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-douyuan-tree:The-Douyuan-Tree-hhc0001_options`, `tmt-loader:the-douyuan-tree:The-Douyuan-Tree-hhc0001` |
| L2-3 batch 3 check-manifest | a-tree-about-layers | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 485e62f, games/a-tree-about-layers pristine |
| L2-3 batch 3 idle hash = census | a-tree-about-layers | idle | 200 | 10 | 0.05 | `29d319067e1477f1` | GREEN | census 29d319067e1477f1 |
| L2-3 batch 3 goldens counts = census | a-tree-about-layers | — | 0 | 0 | — | — | GREEN | 34 ids, 11 layers; ms 0 / upg 29 / buy 0 / ch 0 / ach 5 = census |
| L2-3 batch 3 G1 load (plain page) | a-tree-about-layers | — | 3 | 0.15 | 0.05 | — | GREEN | ready 921 ms; 7 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:a-tree-about-layers:mymod`, `tmt-loader:a-tree-about-layers:mymod_options` |
| L2-3 batch 3 check-manifest | the-unbalanced-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 5a0ca10, games/the-unbalanced-tree pristine |
| L2-3 batch 3 idle hash = census | the-unbalanced-tree | idle | 200 | 10 | 0.05 | `b2e289c57386e47c` | GREEN | census b2e289c57386e47c |
| L2-3 batch 3 goldens counts = census | the-unbalanced-tree | — | 0 | 0 | — | — | GREEN | 72 ids, 10 layers; ms 10 / upg 41 / buy 0 / ch 21 / ach 0 = census |
| L2-3 batch 3 G1 load (plain page) | the-unbalanced-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 914 ms; 8 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-unbalanced-tree:tutr_options`, `tmt-loader:the-unbalanced-tree:tutr` |
| L2-3 batch 3 check-manifest | the-layered-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 6 modFiles, subtree split a795bb0, games/the-layered-tree pristine |
| L2-3 batch 3 idle hash = census | the-layered-tree | idle | 200 | 10 | 0.05 | `b87fee64e88a8cb4` | GREEN | census b87fee64e88a8cb4 |
| L2-3 batch 3 goldens counts = census | the-layered-tree | — | 0 | 0 | — | — | GREEN | 43 ids, 10 layers; ms 0 / upg 29 / buy 1 / ch 0 / ach 13 = census |
| L2-3 batch 3 G1 load (plain page) | the-layered-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1009 ms; 4 `#app .treeNode`; 72 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-layered-tree:1stIcyDev`, `tmt-loader:the-layered-tree:1stIcyDev_options` |
| L2-3 batch 3 check-manifest | sheep-incremental | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split d2b4372, games/sheep-incremental pristine |
| L2-3 batch 3 idle hash = census | sheep-incremental | idle | 200 | 10 | 0.05 | `c12cdce552c2da64` | GREEN | census c12cdce552c2da64 |
| L2-3 batch 3 goldens counts = census | sheep-incremental | — | 0 | 0 | — | — | GREEN | 36 ids, 9 layers; ms 11 / upg 24 / buy 1 / ch 0 / ach 0 = census |
| L2-3 batch 3 G1 load (plain page) | sheep-incremental | — | 3 | 0.15 | 0.05 | — | GREEN | ready 900 ms; 3 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:sheep-incremental:Sheep-Incremental?-Abraham-and-Joshua-Berne`, `tmt-loader:sheep-incremental:Sheep-Incremental?-Abraham-and-Joshua-Berne_options` |
| L2-3 batch 3 check-manifest | the-ultimate-prestige-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 0ec9480, games/the-ultimate-prestige-tree pristine |
| L2-3 batch 3 idle hash = census | the-ultimate-prestige-tree | idle | 200 | 10 | 0.05 | `9c055e13370cb592` | GREEN | census 9c055e13370cb592 |
| L2-3 batch 3 goldens counts = census | the-ultimate-prestige-tree | — | 0 | 0 | — | — | GREEN | 38 ids, 9 layers; ms 22 / upg 15 / buy 0 / ch 1 / ach 0 = census |
| L2-3 batch 3 G1 load (plain page) | the-ultimate-prestige-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 905 ms; 5 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-ultimate-prestige-tree:The-Ultimate-Prestige-Tree-RaceDev_options`, `tmt-loader:the-ultimate-prestige-tree:The-Ultimate-Prestige-Tree-RaceDev` |
| L2-3 batch 3 check-manifest | an-operation-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 7305b35, games/an-operation-tree pristine |
| L2-3 batch 3 idle hash = census | an-operation-tree | idle | 200 | 10 | 0.05 | `c4de2e89b39cd023` | GREEN | census c4de2e89b39cd023 |
| L2-3 batch 3 goldens counts = census | an-operation-tree | — | 0 | 0 | — | — | GREEN | 124 ids, 13 layers; ms 31 / upg 56 / buy 2 / ch 6 / ach 29 = census |
| L2-3 batch 3 G1 load (plain page) | an-operation-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 914 ms; 5 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:an-operation-tree:An-Operation-Tree-am30936_options`, `tmt-loader:an-operation-tree:An-Operation-Tree-am30936` |

## 2026-09-15T06:33:29Z — L2-3 batch 4 (`node tools/add-game.mjs monkeh42/The-Modding-Tree Seder3214/Challenge-Tree fluffydragon23/The-Modding-Tree CharizUniv/The-Modding-Tree new42ur3jeans/Incremental-Adventure-Trees`) — commit `2f5953de` (tree DIRTY) — 20/20 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 batch 4 check-manifest | the-necromantree | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, subtree split 9d089aa, games/the-necromantree pristine |
| L2-3 batch 4 idle hash = census | the-necromantree | idle | 200 | 10 | 0.05 | `3f5285cd84e6b738` | GREEN | census 3f5285cd84e6b738 |
| L2-3 batch 4 goldens counts = census | the-necromantree | — | 0 | 0 | — | — | GREEN | 51 ids, 15 layers; ms 20 / upg 28 / buy 3 / ch 0 / ach 0 = census |
| L2-3 batch 4 G1 load (plain page) | the-necromantree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 879 ms; 7 `#app .treeNode`; 56 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-necromantree:eggbrahamtree` |
| L2-3 batch 4 check-manifest | the-challenge-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 90b1677, games/the-challenge-tree pristine |
| L2-3 batch 4 idle hash = census | the-challenge-tree | idle | 200 | 10 | 0.05 | `c201671fb6bb835d` | GREEN | census c201671fb6bb835d |
| L2-3 batch 4 goldens counts = census | the-challenge-tree | — | 0 | 0 | — | — | GREEN | 46 ids, 13 layers; ms 1 / upg 6 / buy 0 / ch 39 / ach 0 = census |
| L2-3 batch 4 G1 load (plain page) | the-challenge-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 888 ms; 8 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-challenge-tree:particles`, `tmt-loader:the-challenge-tree:particles_options` |
| L2-3 batch 4 check-manifest | the-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split d4d15d9, games/the-tree pristine |
| L2-3 batch 4 idle hash = census | the-tree | idle | 200 | 10 | 0.05 | `b6f74d0c3b038390` | GREEN | census b6f74d0c3b038390 |
| L2-3 batch 4 goldens counts = census | the-tree | — | 0 | 0 | — | — | GREEN | 28 ids, 9 layers; ms 2 / upg 21 / buy 0 / ch 1 / ach 4 = census |
| L2-3 batch 4 G1 load (plain page) | the-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 905 ms; 4 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-tree:cookina i changed my id`, `tmt-loader:the-tree:cookina i changed my id_options` |
| L2-3 batch 4 check-manifest | the-energy-factory | — | 0 | 0 | — | — | GREEN | 17 scripts, 6 modFiles, subtree split 3c2ff55, games/the-energy-factory pristine |
| L2-3 batch 4 idle hash = census | the-energy-factory | idle | 200 | 10 | 0.05 | `42713edf51fd7eaa` | GREEN | census 42713edf51fd7eaa |
| L2-3 batch 4 goldens counts = census | the-energy-factory | — | 0 | 0 | — | — | GREEN | 82 ids, 10 layers; ms 15 / upg 25 / buy 18 / ch 6 / ach 18 = census |
| L2-3 batch 4 G1 load (plain page) | the-energy-factory | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1075 ms; 4 `#app .treeNode`; 72 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-energy-factory:mymod`, `tmt-loader:the-energy-factory:mymod_options` |
| L2-3 batch 4 check-manifest | yet-another-challenge-tree-adventure | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 9c1fff2, games/yet-another-challenge-tree-adventure pristine |
| L2-3 batch 4 idle hash = census | yet-another-challenge-tree-adventure | idle | 200 | 10 | 0.05 | `ea3de4ee424602cd` | GREEN | census ea3de4ee424602cd |
| L2-3 batch 4 goldens counts = census | yet-another-challenge-tree-adventure | — | 0 | 0 | — | — | GREEN | 36 ids, 9 layers; ms 12 / upg 0 / buy 1 / ch 23 / ach 0 = census |
| L2-3 batch 4 G1 load (plain page) | yet-another-challenge-tree-adventure | — | 3 | 0.15 | 0.05 | — | GREEN | ready 879 ms; 4 `#app .treeNode`; 68 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:yet-another-challenge-tree-adventure:chalmod_options`, `tmt-loader:yet-another-challenge-tree-adventure:chalmod` |

## 2026-09-15T06:33:54Z — L2-3 large: #79 (`node tools/add-game.mjs qcy00hou12/The-Periodic-Table-Tree`) — commit `255b402b` (tree DIRTY) — 3/4 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 large: #79 check-manifest | the-periodic-table-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, subtree split 3348710, games/the-periodic-table-tree pristine |
| L2-3 large: #79 idle hash = census | the-periodic-table-tree | idle | 200 | 10 | 0.05 | `a9f10a5c6e66cff5` | GREEN | NONDETERMINISTIC (census deterministic=false, table false, paths ["N.id","N.word","N.alt","N.image"]): census 3a769f842ebcdf87, run 1 a9f10a5c6e66cff5, run 2 6b54b12acab4a7c0 — recorded, not failed |
| L2-3 large: #79 goldens counts = census | the-periodic-table-tree | — | 0 | 0 | — | — | GREEN | 182 ids, 18 layers; ms 38 / upg 53 / buy 21 / ch 5 / ach 65 = census |
| L2-3 large: #79 G1 load (plain page) | the-periodic-table-tree | — | 3 | 0.15 | 0.05 | — | **RED** | ready 1025 ms; 7 `#app .treeNode`; 80 requests, 10 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-periodic-table-tree:118`, `tmt-loader:the-periodic-table-tree:118_options`; RED: ready true error null; 7 treeNodes; blocked 10 ["https://i.postimg.cc/R0kG9kd0/slazzer-edit-image-removebg-preview.png","https://i.postimg.cc/59DXKHnn/6ce621c1-37d7-4aa1-8068-18a856d6c523.jpg","https://i.postimg.cc/x1b6Q644/c8b42708505611e88f6702e6256ec5c3-1-removebg-preview.png","https://i.postimg.cc/brn1WwgV/Studio-Project-removebg-preview.png","https://i.postimg.cc/mk54KTdq/a5219bd91f868f264f55 |

## 2026-09-15T06:34:34Z — L2-3 large: #84 (`node tools/add-game.mjs CudjzikxmxR/The-Rainbow-Void-Tree`) — commit `0bf5c1f5` (tree DIRTY) — 4/4 green

Reading this section: the subtree commits are in; manifests, index and goldens are uncommitted at the time of the run. idle hash = the plain page's Node twin (`--no-automation`, no exclusion) vs manifest.headless.idleHash; goldens counts vs manifest.census; G1 = `page.mjs <id> --gate load` (no flag).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 large: #84 check-manifest | the-rainbow-void-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 3 modFiles, subtree split 9b67544, games/the-rainbow-void-tree pristine |
| L2-3 large: #84 idle hash = census | the-rainbow-void-tree | idle | 200 | 10 | 0.05 | `a54bc54b5c495ca1` | GREEN | census a54bc54b5c495ca1 |
| L2-3 large: #84 goldens counts = census | the-rainbow-void-tree | — | 0 | 0 | — | — | GREEN | 147 ids, 12 layers; ms 28 / upg 79 / buy 0 / ch 0 / ach 40 = census |
| L2-3 large: #84 G1 load (plain page) | the-rainbow-void-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1055 ms; 6 `#app .treeNode`; 74 requests, 0 non-localhost, 0 failed, 0 page errors; au nodes 0; keys `tmt-loader:the-rainbow-void-tree:The-Rainbow-Void-Tree-nobody`, `tmt-loader:the-rainbow-void-tree:The-Rainbow-Void-Tree-nobody_options` |

## 2026-09-15T06:36:06Z — L2-3 (`node tools/check-pages.mjs --games ptr,the-omega-tree,the-dressy-tree` + the add-game batches) — commit `747d812` — 12/12 green

Reading this section: per-game gate rows are in the add-game sections above (L2-3 batch 1–4, large #79, large #84); G5 ran at 747d812 from a depth-1 clone served under /tmt-loader/.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2-3 the 38 (rank ≤ 100, live_ok false) | 38 games | — | — | — | — | — | GREEN | added 38, skipped 0 (license verdict MIT for all 38); all four gates GREEN (or nondeterministic-recorded) for 35; RED: the-pro-tree (checkManifest, load); bobbit-s-tech-tree (load); the-periodic-table-tree (load) |
| L2-3 manifests/index.json lists every added game | index | — | — | — | — | — | GREEN | 40 entries {id, name, repo} (ptr, something + 38) |
| L2-3 G5 clone | bare clone | — | — | — | — | — | GREEN | {"head":"747d812243fb843ce571db8b6bb0e7c889e46b17"} |
| L2-3 G5 G1 load ptr @ subpath | ptr | — | — | — | — | — | GREEN | {"readyMs":578,"layerNodes":8,"requests":95,"blocked":0,"failed":0,"pageErrors":0,"keys":["tmt-loader:ptr:ptr"]} |
| L2-3 G5 G1 load the-omega-tree @ subpath | the-omega-tree | — | — | — | — | — | GREEN | {"readyMs":1223,"layerNodes":13,"requests":95,"blocked":0,"failed":0,"pageErrors":0,"keys":["tmt-loader:the-omega-tree:2_options","tmt-loader:the-omega-tree:2"]} |
| L2-3 G5 G1 load the-dressy-tree @ subpath | the-dressy-tree | — | — | — | — | — | GREEN | {"readyMs":1086,"layerNodes":9,"requests":86,"blocked":0,"failed":0,"pageErrors":0,"keys":["tmt-loader:the-dressy-tree:dressyapper","tmt-loader:the-dressy-tree:dressyapper_options"]} |
| L2-3 G5 picker entries name repo@sha, engine, license | bare clone | — | — | — | — | — | GREEN | {"count":40,"bad":[]} |
| L2-3 G5 picker lists every game | bare clone | — | — | — | — | — | GREEN | {"blocked":0,"failed":[],"pageErrors":[]}; 40 listed |
| L2-3 G5 picker links stay under the sub-path | bare clone | — | — | — | — | — | GREEN | {} |
| L2-3 G5 clone unmodified | bare clone | — | — | — | — | — | GREEN | {"status":""} |
| L2-3 G5 repo clean | bare clone | — | — | — | — | — | GREEN | {"status":"## main...origin/main [ahead 2]"} |
| L2-3 repo size | git | — | — | — | — | — | GREEN | before (e917a5d): local size-pack 4.46 MiB + 1.16 MiB loose; bare single-branch clone of main 2.36 MiB. After (747d812): local size-pack 92.18 MiB + 5.00 MiB loose (includes the fetched <id>-upstream histories, never pushed); bare clone of main 81.45 MiB; games/ working tree 118 MB |

## 2026-09-15T06:59:45Z — L2b-1 (`node tools/harness/gates-l2b.mjs --part 1`) — commit `ed7c48ce` — 85/85 green

Reading this section: check-manifest now also checks `load.known` against the tree (equality). G1 is the plain page; a row with no load.known must have 0 blocked / 0 failed / 0 page errors; a row with one prints what it allowed. Parity runs on the games that carry a load.known block.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2b-1 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-dressy-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 20 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-pro-tree | — | 0 | 0 | — | — | GREEN | 48 scripts, 42 modFiles, pristine; load.known {"missingScripts":["js/ascension.js","js/objects.js","js/quantums.js","js/trans.js","js/zones.js"]}; tree: missingScripts ["js/ascension.js","js/objects.js","js/quantums.js","js/trans.js","js/zones.js"], externalHosts [] |
| L2b-1 check-manifest | the-extended-tree | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-omega-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 29 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-alphabetree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | ultimate-prestige-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-number-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 16 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | prestige-tree-rewritten-unsoftcapped4 | — | 0 | 0 | — | — | GREEN | 12 scripts, 0 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | arc-tree | — | 0 | 0 | — | — | GREEN | 32 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | a-tree-for-sure | — | 0 | 0 | — | — | GREEN | 17 scripts, 6 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-algebra-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known {"externalHosts":["i.imgur.com"]}; tree: missingScripts [], externalHosts ["i.imgur.com"] |
| L2b-1 check-manifest | the-earth-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-primordial-tree | — | 0 | 0 | — | — | GREEN | 19 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | bobbit-s-tech-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known {"errorsBeforeReady":"js/mod.js: a top-level setInterval (var timer, 10 ms) reads player.showHumanity before js/game.js declares player and load() fills it; the game's own errors, raised until onload"; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-ore-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-mechanic-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 5 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-danus-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 10 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | collection-of-everything | — | 0 | 0 | — | — | GREEN | 17 scripts, 5 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-congratulations-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 8 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-prestige-tree-2 | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-reborn-incremental-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-weight-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 11 modFiles, pristine; load.known {"externalHosts":["cdn.discordapp.com"]}; tree: missingScripts [], externalHosts ["cdn.discordapp.com"] |
| L2b-1 check-manifest | the-upgradeverse-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 7 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-jax-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-douyuan-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | a-tree-about-layers | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-unbalanced-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-layered-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 6 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | sheep-incremental | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-ultimate-prestige-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | an-operation-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-necromantree | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-challenge-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-energy-factory | — | 0 | 0 | — | — | GREEN | 17 scripts, 6 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | yet-another-challenge-tree-adventure | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 check-manifest | the-periodic-table-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 2 modFiles, pristine; load.known {"externalHosts":["i.postimg.cc"]}; tree: missingScripts [], externalHosts ["i.postimg.cc"] |
| L2b-1 check-manifest | the-rainbow-void-tree | — | 0 | 0 | — | — | GREEN | 17 scripts, 3 modFiles, pristine; load.known absent; tree: missingScripts [], externalHosts [] |
| L2b-1 G1 load (plain page) | ptr | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 630 ms; 8 `#app .treeNode`; 83 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other something ok true |
| L2b-1 G1 load (plain page) | something | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1093 ms; 10 `#app .treeNode`; 83 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-dressy-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1189 ms; 9 `#app .treeNode`; 86 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-pro-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1876 ms; 15 `#app .treeNode`; 139 requests (context), 0 blocked, 10 failed, 0 page errors; tmtLoader.skipped 5, pageErrors before/after ready 0/0; known {"missingScripts":["js/ascension.js","js/objects.js","js/quantums.js","js/trans.js","js/zones.js"]}; **allowed: {"skipped":5,"blockedHosts":[],"errorsBeforeReady":0}**; other ptr ok true |
| L2b-1 G1 load (plain page) | the-extended-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 605 ms; 10 `#app .treeNode`; 56 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-omega-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1216 ms; 13 `#app .treeNode`; 95 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-alphabetree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 882 ms; 72 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | ultimate-prestige-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 930 ms; 5 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-number-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1049 ms; 10 `#app .treeNode`; 82 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | prestige-tree-rewritten-unsoftcapped4 | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1009 ms; 7 `#app .treeNode`; 55 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | arc-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1022 ms; 8 `#app .treeNode`; 83 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | a-tree-for-sure | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 990 ms; 5 `#app .treeNode`; 72 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-algebra-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1096 ms; 7 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; known {"externalHosts":["i.imgur.com"]}; **allowed: {"skipped":0,"blockedHosts":[],"errorsBeforeReady":0}**; other ptr ok true |
| L2b-1 G1 load (plain page) | the-earth-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1065 ms; 7 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-primordial-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1196 ms; 9 `#app .treeNode`; 70 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | bobbit-s-tech-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1163 ms; 28 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 26 page errors; tmtLoader.skipped 0, pageErrors before/after ready 26/0; known {"errorsBeforeReady":"js/mod.js: a top-level setInterval (var timer, 10 ms) reads player.showHumanity before js/game.js declares player and load() fills it; the; **allowed: {"skipped":0,"blockedHosts":[],"errorsBeforeReady":26}**; other ptr ok true |
| L2b-1 G1 load (plain page) | the-ore-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 950 ms; 5 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-mechanic-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 886 ms; 4 `#app .treeNode`; 71 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-danus-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 925 ms; 6 `#app .treeNode`; 76 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | collection-of-everything | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 946 ms; 4 `#app .treeNode`; 72 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-congratulations-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 869 ms; 5 `#app .treeNode`; 76 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-prestige-tree-2 | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 854 ms; 5 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-reborn-incremental-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 847 ms; 4 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-weight-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 950 ms; 6 `#app .treeNode`; 77 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; known {"externalHosts":["cdn.discordapp.com"]}; **allowed: {"skipped":0,"blockedHosts":[],"errorsBeforeReady":0}**; other ptr ok true |
| L2b-1 G1 load (plain page) | the-upgradeverse-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 895 ms; 6 `#app .treeNode`; 73 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-jax-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 839 ms; 5 `#app .treeNode`; 69 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-douyuan-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 910 ms; 3 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | a-tree-about-layers | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 892 ms; 7 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-unbalanced-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 960 ms; 8 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-layered-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 1045 ms; 4 `#app .treeNode`; 72 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | sheep-incremental | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 868 ms; 3 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-ultimate-prestige-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 845 ms; 5 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | an-operation-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 844 ms; 5 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-necromantree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 709 ms; 7 `#app .treeNode`; 56 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-challenge-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 828 ms; 8 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 872 ms; 4 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-energy-factory | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 968 ms; 4 `#app .treeNode`; 72 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | yet-another-challenge-tree-adventure | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 800 ms; 4 `#app .treeNode`; 68 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 G1 load (plain page) | the-periodic-table-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 985 ms; 7 `#app .treeNode`; 80 requests (context), 10 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; known {"externalHosts":["i.postimg.cc"]}; **allowed: {"skipped":0,"blockedHosts":["i.postimg.cc"],"errorsBeforeReady":0}**; other ptr ok true |
| L2b-1 G1 load (plain page) | the-rainbow-void-tree | — | 3 | 0.15 | 0.05 | — | GREEN | ready true 892 ms; 6 `#app .treeNode`; 74 requests (context), 0 blocked, 0 failed, 0 page errors; tmtLoader.skipped 0, pageErrors before/after ready 0/0; no load.known — allowed: none; other ptr ok true |
| L2b-1 parity node ≡ page (plain) | the-pro-tree | idle | 200 | 10 | 0.05 | `f2a681aabe407370` | GREEN | node f2a681aabe407370 / page f2a681aabe407370; state equal true; page load vs load.known {"ok":true,"allowed":{"skipped":5,"blockedHosts":[],"errorsBeforeReady":0},"failedNotDeclared":0,"blockedNotDeclared":0,"errorsAfterReady":0}; census f2a681aabe407370 |
| L2b-1 parity node ≡ page (plain) | the-algebra-tree | idle | 200 | 10 | 0.05 | `82c47d7238db490c` | GREEN | node 82c47d7238db490c / page 82c47d7238db490c; state equal true; page load vs load.known {"ok":true,"allowed":{"skipped":0,"blockedHosts":[],"errorsBeforeReady":0},"failedNotDeclared":0,"blockedNotDeclared":0,"errorsAfterReady":0}; census 82c47d7238db490c |
| L2b-1 parity node ≡ page (plain) | bobbit-s-tech-tree | idle | 200 | 10 | 0.05 | `d19ed73fc543d6e4` | GREEN | node d19ed73fc543d6e4 / page d19ed73fc543d6e4; state equal true; page load vs load.known {"ok":true,"allowed":{"skipped":0,"blockedHosts":[],"errorsBeforeReady":27},"failedNotDeclared":0,"blockedNotDeclared":0,"errorsAfterReady":0}; census d19ed73fc543d6e4 |
| L2b-1 parity node ≡ page (plain) | the-weight-tree | idle | 200 | 10 | 0.05 | `1cd140bc4485abc9` | GREEN | node 1cd140bc4485abc9 / page 1cd140bc4485abc9; state equal true; page load vs load.known {"ok":true,"allowed":{"skipped":0,"blockedHosts":[],"errorsBeforeReady":0},"failedNotDeclared":0,"blockedNotDeclared":0,"errorsAfterReady":0}; census 1cd140bc4485abc9 |
| L2b-1 parity node ≡ page (plain) | the-periodic-table-tree | idle | 200 | 10 | 0.05 | `a9f10a5c6e66cff5` | GREEN | node a9f10a5c6e66cff5 / page f5a3d529f4b79a50; state equal false; page load vs load.known {"ok":true,"allowed":{"skipped":0,"blockedHosts":["i.postimg.cc"],"errorsBeforeReady":0},"failedNotDeclared":0,"blockedNotDeclared":0,"errorsAfterReady":0}; census 3a769f842ebcdf87 — census marks it NONDETERMINISTIC (§14c.3): recorded, need not match; first divergence {"index":9712,"key":"id","a":"milestones\":[],\"lastMilestone\":null,\"achievements\":[],\"challenges\":{},\"grid\":{},\"prevTab\":\"\"},\"N\":{\"unlocked\":true,\"id\":8,\"total\":\"0\",\"points\":\" |

## 2026-09-15T06:59:53Z — gates.mjs, automation ON — commit `ed7c48ce` (tree DIRTY) — 34/34 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| G1 load | ptr | — | 3 | 0.15 | 0.05 | — | GREEN | ready 577 ms; 8 `#app .treeNode`; 85 requests, 0 blocked, 0 failed, 0 page errors; keys `tmt-loader:ptr:ptr`; other game something: 2 keys in its own prefix, first untouched=true |
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
| G3 parity node≡page | ptr | idle | 1000 | 50 | 0.05 | `bbbea2c5700357dd` | GREEN | page bbbea2c5700357dd in 15375 ms |
| G3 parity node≡page | ptr | idle | 200 | 200 | 1 | `681ab939b36dd333` | GREEN | page 681ab939b36dd333 in 3303 ms |
| G3 parity node≡page | ptr | policy | 1000 | 50 | 0.05 | `7b32d1b37908bd26` | GREEN | page 7b32d1b37908bd26 in 16235 ms |
| G3 parity control (page +1 point, must diverge) | ptr | idle | 200 | 10 | 0.05 | `5738d67e916b743f` | GREEN | diverged at key "points" |
| G4 goldens | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers; ms 85 / upg 172 / buy 52 / ch 9 / ach 80 (census equal=true) |
| G4 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, vendor sha256 ok, subtree split cec9198, games/ptr pristine |
| G1 load | something | — | 3 | 0.15 | 0.05 | — | GREEN | ready 1157 ms; 11 `#app .treeNode`; 85 requests, 0 blocked, 0 failed, 0 page errors; keys `tmt-loader:something:Justcubing97's-Something-Tree-Justcubing97_options`, `tmt-loader:something:Justcubing97's-Something-Tree-Justcubing97`; other game ptr: 1 keys in its own prefix, first untouched=true |
| G2a determinism (node ×2) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | run2 1000 ticks 07434b9b191874b7 |
| G2b save→fresh boot on storage (node) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | 500 (6f89dc8f66c95ae2) + 500 after reload vs 1000 straight 07434b9b191874b7; saved keys 2 |
| G2b save→loadFrom (node) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | importSave requested reload=true; vs 1000 straight 07434b9b191874b7 |
| G2b save→loadFrom (page, reload) | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | page 500 6f89dc8f66c95ae2 (node 500 6f89dc8f66c95ae2); vs node 1000 straight 07434b9b191874b7 |
| G2a determinism (node ×2) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | run2 1000 ticks 3099e519164fd0e1 |
| G2b save→fresh boot on storage (node) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | 500 (67cc684a830113c8) + 500 after reload vs 1000 straight 3099e519164fd0e1; saved keys 2 |
| G2b save→loadFrom (node) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | importSave requested reload=true; vs 1000 straight 3099e519164fd0e1 |
| G2b save→loadFrom (page, reload) | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | page 500 67cc684a830113c8 (node 500 67cc684a830113c8); vs node 1000 straight 3099e519164fd0e1 |
| G2c upstream export → loadFrom | something | idle | 200 | 10 | 0.05 | `1b15b23f0003577b` | GREEN | upstream 5245df9da81803d1; equalRaw=false equalCanonical=true (raw differs in KEY ORDER only: the upstream page's async modFiles race); exported 11228 b64 chars |
| G3 idle hash = census | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | census 46bb8c5b1a96f03a @ 200×0.05; automation true (au excluded) |
| G3 parity node≡page | something | idle | 1000 | 50 | 0.05 | `07434b9b191874b7` | GREEN | page 07434b9b191874b7 in 7534 ms |
| G3 parity node≡page | something | idle | 200 | 200 | 1 | `9f1ac98062ef88e3` | GREEN | page 9f1ac98062ef88e3 in 1762 ms |
| G3 parity node≡page | something | policy | 1000 | 50 | 0.05 | `3099e519164fd0e1` | GREEN | page 3099e519164fd0e1 in 7852 ms |
| G3 parity control (page +1 point, must diverge) | something | idle | 200 | 10 | 0.05 | `f48357b2f71f5247` | GREEN | diverged at key "points" |
| G4 goldens | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers; ms 68 / upg 175 / buy 23 / ch 11 / ach 52 (census equal=true) |
| G4 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, vendor sha256 ok, subtree split 30a311b, games/something pristine |

## 2026-09-15T07:05:19Z — L2b mutant controls (`node tools/harness/gates-l2b.mjs --part mutants`) — commit `ed7c48ce` (tree DIRTY) — 5/5 green

Reading this section: GREEN here = the mutated gate went RED as it must. Each manifest was rewritten for the run and restored byte-for-byte; nothing mutated is committed.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2b mutant (a) check-manifest must be RED | the-pro-tree | — | — | — | — | — | GREEN | load.known.missingScripts emptied → check-manifest RED: [{"field":"boot.file_errors"},{"field":"load.known.missingScripts","declaredNotInTree":[],"inTreeNotDeclared":["js/ascension.js","js/objects.js","js/quantums.js","js/trans.js","js/zones.js"]}] |
| L2b mutant (a) G1 must be RED | the-pro-tree | — | — | — | — | — | GREEN | load.known.missingScripts emptied → G1 RED: failedNotDeclared 10, blockedNotDeclared 0, skippedEqualsDeclared false, page errors before ready 0 (declared false) |
| L2b mutant (b) G1 must be RED | bobbit-s-tech-tree | — | — | — | — | — | GREEN | load.known.errorsBeforeReady removed → G1 RED: failedNotDeclared 0, blockedNotDeclared 0, skippedEqualsDeclared true, page errors before ready 24 (declared false) |
| L2b mutant (c) G1 must be RED | the-periodic-table-tree | — | — | — | — | — | GREEN | load.known.externalHosts emptied → G1 RED: failedNotDeclared 0, blockedNotDeclared 10, skippedEqualsDeclared true, page errors before ready 0 (declared false) |
| L2b mutant (d) check-manifest must be RED | the-dressy-tree | — | — | — | — | — | GREEN | load.known = {missingScripts: ["js/nope.js"]} (a file that is not missing) → check-manifest RED: [{"field":"load.known.missingScripts","declaredNotInTree":["js/nope.js"],"inTreeNotDeclared":[]}] |

## 2026-09-15T07:05:54Z — L2b-1 G5 (`node tools/check-pages.mjs --games ptr,the-pro-tree,bobbit-s-tech-tree,the-periodic-table-tree`) — commit `fd56706f` — 10/10 green

Reading this section: depth-1 clone of fd56706f9b6e1c02fa119d558fb3d84d445b5e20 served under /tmt-loader/; G1 rows there are judged against each manifest's load.known (failed = the-pro-tree's 5 skipped scripts, 404 + abort each; pageErrors = bobbit's pre-load() timer; blocked = periodic's i.postimg.cc images).

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| L2b-1 G5 clone | bare clone | — | — | — | — | — | GREEN | {"clone":"/tmp/tmt-loader-pages-kdWIih/tmt-loader","head":"fd56706f9b6e1c02fa119d558fb3d84d445b5e20"} |
| L2b-1 G5 G1 load ptr @ subpath | ptr | — | — | — | — | — | GREEN | {"readyMs":585,"layerNodes":8,"requests":139,"blocked":0,"failed":0,"pageErrors":0,"keys":["tmt-loader:ptr:ptr"]} |
| L2b-1 G5 G1 load the-pro-tree @ subpath | the-pro-tree | — | — | — | — | — | GREEN | {"readyMs":1729,"layerNodes":15,"requests":139,"blocked":0,"failed":10,"pageErrors":0,"keys":["tmt-loader:the-pro-tree:1_options","tmt-loader:the-pro-tree:1"]} |
| L2b-1 G5 G1 load bobbit-s-tech-tree @ subpath | bobbit-s-tech-tree | — | — | — | — | — | GREEN | {"readyMs":890,"layerNodes":28,"requests":68,"blocked":0,"failed":0,"pageErrors":25,"keys":["tmt-loader:bobbit-s-tech-tree:btt_options","tmt-loader:bobbit-s-tech-tree:btt"]} |
| L2b-1 G5 G1 load the-periodic-table-tree @ subpath | the-periodic-table-tree | — | — | — | — | — | GREEN | {"readyMs":954,"layerNodes":7,"requests":80,"blocked":10,"failed":0,"pageErrors":0,"keys":["tmt-loader:the-periodic-table-tree:118","tmt-loader:the-periodic-table-tree:118_options"]} |
| L2b-1 G5 picker entries name repo@sha, engine, license | bare clone | — | — | — | — | — | GREEN | {"count":40,"bad":[]} |
| L2b-1 G5 picker lists every game | bare clone | — | — | — | — | — | GREEN | {"blocked":0,"failed":[],"pageErrors":[]} |
| L2b-1 G5 picker links stay under the sub-path | bare clone | — | — | — | — | — | GREEN | {} |
| L2b-1 G5 clone unmodified | bare clone | — | — | — | — | — | GREEN | {"status":""} |
| L2b-1 G5 repo clean | bare clone | — | — | — | — | — | GREEN | {"status":"## main...origin/main [ahead 1]"} |

## 2026-09-15T18:24:48Z — S1 part 1 (`node tools/harness/gates-s1.mjs --part 1`) — commit `0fba2b05` — 42/42 green

Reading this section: pinned rows compare TICKS and the game state without player.au (`hashGame`); the full hash includes player.au.clickables (one key per au button), which moves with the number of registered features. Each baseline row re-runs the commit that recorded the SUMMARY row (throwaway worktree, `hashGame` patch only) and must reproduce its tick and FULL hash.

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-1 anchor (automation, exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; features registered 77 |
| S1-1 anchor (--no-automation, contract only) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; automation false; features 0 |
| S1-1 anchor (automation, exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; features registered 77 |
| S1-1 anchor (--no-automation, contract only) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; automation false; features 0 |
| S1-1 anchor (automation, exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; features registered 77 |
| S1-1 anchor (--no-automation, contract only) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; automation false; features 0 |
| S1-1 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| S1-1 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, games/ptr pristine, auto games-auto/ptr.js |
| S1-1 anchor (automation, exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; features registered 38 |
| S1-1 anchor (--no-automation, contract only) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; automation false; features 0 |
| S1-1 anchor (automation, exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; features registered 38 |
| S1-1 anchor (--no-automation, contract only) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; automation false; features 0 |
| S1-1 anchor (automation, exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; features registered 38 |
| S1-1 anchor (--no-automation, contract only) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; automation false; features 0 |
| S1-1 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| S1-1 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, games/something pristine, auto games-auto/something.js |
| S1-1 baseline A1-3 ptr (i) b and g unlocked @ 3bc12bf | ptr | profile all | 1361 | 1361 | 1 | `d76c70bf74ede9ba` | GREEN | SUMMARY 1361 ticks / d76c70bf74ede9ba; baseline 1361 ticks / 1361 s / d76c70bf74ede9ba (game 7b9f1114d17a0166) |
| S1-1 pinned A1-3 ptr (i) b and g unlocked (kinds=reset,upgrades,buyables) | ptr | profile all | 1361 | 1361 | 1 | `ef20e24e4750c3e0` | GREEN | game state 7b9f1114d17a0166 vs baseline 7b9f1114d17a0166 — equal true; ticks 1361 vs SUMMARY 1361; features 54; actions {"reset:p":294,"upgrades:p":166,"reset:g":46,"upgrades:g":5,"reset:b":52,"upgrades:b":5} |
| S1-1 baseline A1-3 ptr (ii) keep-upgrade milestones b0 + g0 @ 3bc12bf | ptr | profile all | 2360 | 2360 | 1 | `f8a1534d326a4840` | GREEN | SUMMARY 2360 ticks / f8a1534d326a4840; baseline 2360 ticks / 2360 s / f8a1534d326a4840 (game 25f914a09d1019b1) |
| S1-1 pinned A1-3 ptr (ii) keep-upgrade milestones b0 + g0 (kinds=reset,upgrades,buyables) | ptr | profile all | 2360 | 2360 | 1 | `2173284c854d1465` | GREEN | game state 25f914a09d1019b1 vs baseline 25f914a09d1019b1 — equal true; ticks 2360 vs SUMMARY 2360; features 54; actions {"reset:p":294,"upgrades:p":166,"reset:g":46,"upgrades:g":5,"reset:b":52,"upgrades:b":5} |
| S1-1 baseline A1-3 ptr (iii) b.best ≥ 15 and g.best ≥ 15 @ 3bc12bf | ptr | profile all | 2936 | 2936 | 1 | `dc00ee1692610100` | GREEN | SUMMARY 2936 ticks / dc00ee1692610100; baseline 2936 ticks / 2936 s / dc00ee1692610100 (game 3e5f28bd379c52e0) |
| S1-1 pinned A1-3 ptr (iii) b.best ≥ 15 and g.best ≥ 15 (kinds=reset,upgrades,buyables) | ptr | profile all | 2936 | 2936 | 1 | `85fa0992924410a7` | GREEN | game state 3e5f28bd379c52e0 vs baseline 3e5f28bd379c52e0 — equal true; ticks 2936 vs SUMMARY 2936; features 54; actions {"reset:p":294,"upgrades:p":166,"reset:g":46,"upgrades:g":5,"reset:b":52,"upgrades:b":5} |
| S1-1 baseline A2-3 ptr (i) one of t/e/s unlocked @ 17260e03 | ptr | profile all | 3550 | 3550 | 1 | `0513ad9b24806ecc` | GREEN | SUMMARY 3550 ticks / 0513ad9b24806ecc; baseline 3550 ticks / 3550 s / 0513ad9b24806ecc (game ff624de18438f176) |
| S1-1 pinned A2-3 ptr (i) one of t/e/s unlocked (kinds=reset,upgrades,buyables) | ptr | profile all | 3550 | 3550 | 1 | `48533bdf076e98d2` | GREEN | game state ff624de18438f176 vs baseline ff624de18438f176 — equal true; ticks 3550 vs SUMMARY 3550; features 54; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| S1-1 baseline A2-3 ptr (ii) t ms 3 or s ms 3 (b.auto / g.auto available) @ 17260e03 | ptr | profile all | 6037 | 6037 | 1 | `f226c34064109dcb` | GREEN | SUMMARY 6037 ticks / f226c34064109dcb; baseline 6037 ticks / 6037 s / f226c34064109dcb (game b6fc0204a69bc54a) |
| S1-1 pinned A2-3 ptr (ii) t ms 3 or s ms 3 (b.auto / g.auto available) (kinds=reset,upgrades,buyables) | ptr | profile all | 6037 | 6037 | 1 | `7958e65c8b1dec44` | GREEN | game state b6fc0204a69bc54a vs baseline b6fc0204a69bc54a — equal true; ticks 6037 vs SUMMARY 6037; features 54; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| S1-1 baseline A2-3 ptr (iii) t, e and s unlocked @ 17260e03 | ptr | profile all | 8035 | 8035 | 1 | `67743dd40de0b570` | GREEN | SUMMARY 8035 ticks / 67743dd40de0b570; baseline 8035 ticks / 8035 s / 67743dd40de0b570 (game 6511fcca2c6ae896) |
| S1-1 pinned A2-3 ptr (iii) t, e and s unlocked (kinds=reset,upgrades,buyables) | ptr | profile all | 8035 | 8035 | 1 | `25b42867417882c9` | GREEN | game state 6511fcca2c6ae896 vs baseline 6511fcca2c6ae896 — equal true; ticks 8035 vs SUMMARY 8035; features 54; actions {"reset:p":804,"upgrades:p":475,"reset:g":450,"upgrades:g":90,"reset:b":547,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"reset:t":8,"upgrades:t":1,"reset:e":1,"buyables:e":1} |
| S1-1 baseline A1-3 something (i) first fundamental reset (fundamental.total ≥ 1) @ 3bc12bf | something | profile all | 102 | 5.1 | 0.05 | `bf6f8809a163efd8` | GREEN | SUMMARY 102 ticks / bf6f8809a163efd8; baseline 102 ticks / 5.1 s / bf6f8809a163efd8 (game 5a03f1523ebc337d) |
| S1-1 pinned A1-3 something (i) first fundamental reset (fundamental.total ≥ 1) (kinds=reset,upgrades,buyables) | something | profile all | 102 | 5.1 | 0.05 | `a82bc6d47e787d3f` | GREEN | game state 5a03f1523ebc337d vs baseline 5a03f1523ebc337d — equal true; ticks 102 vs SUMMARY 102; features 29; actions {"reset:unlock":3622,"upgrades:unlock":2,"reset:fundamental":37,"upgrades:fundamental":11} |
| S1-1 baseline A1-3 something (ii) unlock:upg:12 @ 3bc12bf | something | profile all | 3733 | 186.65 | 0.05 | `0253605cd2e69318` | GREEN | SUMMARY 3733 ticks / 0253605cd2e69318; baseline 3733 ticks / 186.65 s / 0253605cd2e69318 (game 646cfcd97455704b) |
| S1-1 pinned A1-3 something (ii) unlock:upg:12 (kinds=reset,upgrades,buyables) | something | profile all | 3733 | 186.65 | 0.05 | `6ec17d5d188a4f9e` | GREEN | game state 646cfcd97455704b vs baseline 646cfcd97455704b — equal true; ticks 3733 vs SUMMARY 3733; features 29; actions {"reset:unlock":3622,"upgrades:unlock":2,"reset:fundamental":37,"upgrades:fundamental":11} |
| S1-1 baseline A2-1 something (i) primitive reset ≥ 1 (primitive.total ≥ 1) @ 17260e03 | something | profile all | 4163 | 208.15 | 0.05 | `0c88dcd6b5a9e1cb` | GREEN | SUMMARY 4163 ticks / 0c88dcd6b5a9e1cb; baseline 4163 ticks / 208.15 s / 0c88dcd6b5a9e1cb (game 32c54b4e207fe18e) |
| S1-1 pinned A2-1 something (i) primitive reset ≥ 1 (primitive.total ≥ 1) (kinds=reset,upgrades,buyables) | something | profile all | 4163 | 208.15 | 0.05 | `9244e328e7c29b7b` | GREEN | game state 32c54b4e207fe18e vs baseline 32c54b4e207fe18e — equal true; ticks 4163 vs SUMMARY 4163; features 29; actions {"reset:unlock":9327,"upgrades:unlock":2,"reset:fundamental":95,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| S1-1 baseline A2-1 something (ii) primitive ms 1 ("10 Numbers") @ 17260e03 | something | profile all | 5963 | 298.15 | 0.05 | `5682500e1f849fb8` | GREEN | SUMMARY 5963 ticks / 5682500e1f849fb8; baseline 5963 ticks / 298.15 s / 5682500e1f849fb8 (game 713f792e30d60f5d) |
| S1-1 pinned A2-1 something (ii) primitive ms 1 ("10 Numbers") (kinds=reset,upgrades,buyables) | something | profile all | 5963 | 298.15 | 0.05 | `24374f1c534d1d67` | GREEN | game state 713f792e30d60f5d vs baseline 713f792e30d60f5d — equal true; ticks 5963 vs SUMMARY 5963; features 29; actions {"reset:unlock":9327,"upgrades:unlock":2,"reset:fundamental":95,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| S1-1 baseline A2-1 something (iii) primitive ms 2 ("100,000 Numbers") @ 17260e03 | something | profile all | 9563 | 478.15 | 0.05 | `449775de97d4af2d` | GREEN | SUMMARY 9563 ticks / 449775de97d4af2d; baseline 9563 ticks / 478.15 s / 449775de97d4af2d (game f77c6ac6dfd7bf1a) |
| S1-1 pinned A2-1 something (iii) primitive ms 2 ("100,000 Numbers") (kinds=reset,upgrades,buyables) | something | profile all | 9563 | 478.15 | 0.05 | `b160ef1582be13d1` | GREEN | game state f77c6ac6dfd7bf1a vs baseline f77c6ac6dfd7bf1a — equal true; ticks 9563 vs SUMMARY 9563; features 29; actions {"reset:unlock":9327,"upgrades:unlock":2,"reset:fundamental":95,"upgrades:fundamental":46,"reset:primitive":4,"upgrades:primitive":3} |
| S1-1 fresh boot: Locked/Off per feature, 17260e03 table vs derived | ptr | — | 0 | 0 | — | `d6f4178d974ab555` | GREEN | 14/14 old features same unlocked + policy; 63 derived features added: unlocked —; locked 63; excluded {"buyables:t":"Extra Time Capsules are paid in Boosters, which would lower the booster effect (A2 §12e.1)"}; derivation {"kindOrder":["toggles","reset","upgrades","buyables","challenges","clickables"],"kinds":["toggles","upgrades","buyables","challenges","clickables","reset"],"candidates":78,"registered":77,"excluded":1,"outOfKinds":0,"multiTogglesSkipped":1,"unlockOrder":[["g","b"],["s","t","e"]]} |
| S1-1 fresh boot: Locked/Off per feature, 17260e03 table vs derived | something | — | 0 | 0 | — | `87a27eed58b62fee` | GREEN | 7/7 old features same unlocked + policy; 31 derived features added: unlocked —; locked 31; excluded {}; derivation {"kindOrder":["toggles","reset","upgrades","buyables","challenges","clickables"],"kinds":["toggles","upgrades","buyables","challenges","clickables","reset"],"candidates":38,"registered":38,"excluded":0,"outOfKinds":0,"multiTogglesSkipped":0,"unlockOrder":[]} |
| S1-1 predicate compiler ≡ --until (node and page) | ptr | profile all | 300 | 300 | 1 | `ff9cdab8849d6017` | GREEN | "player.p.points.gte(5) && hasUpgrade('p', 11)": disagreement met — node false (errors 0), page false, over 300 / 300 ticks; the value turned true at 102 ticks / 102 s / f47a81cd426a06fe (game bb74cf65e2d441d1); page at that tick f47a81cd426a06fe |
| S1-1 no table: the-omega-tree derived defaults (informative) | the-omega-tree | profile all | 3000 | 3000 | 1 | `2b964b5c3c6ae7b3` | GREEN | auto none; features 59 ({"kindOrder":["toggles","upgrades","buyables","challenges","clickables","reset"],"kinds":["toggles","upgrades","buyables","challenges","clickables","reset"],"candidates":59,"registered":59,"excluded":0,"outOfKinds":0,"multiTogglesSkipped":0,"unlockOrder":[]}); stalled false walled false last progress 2173 s; actions {"reset:p":519,"upgrades:p":697,"reset:sp":43,"upgrades:sp":19,"reset:up":2,"upgrades:up":1,"reset:pb":8,"upgrades:pb":2}; unlocked ["info-tab","options-tab","changelog-tab","p","blank","tree-tab","sp","up","pb","a","stat","cp","pa","cp2","se","au"]; state: p{pts 4.15 best 4.15; upg [11]; ms []; canReset false nextAt 10.00; next upg 12@2.00} sp{pts 1.00 best 2.00; upg [11]; ms []; canReset false nextAt 10,000,000; next upg 12@3.00} up{pts 3.00 best 3.00; upg [11]; ms []; canReset false nextAt 25,000,000; next upg 12@4.00} pb{pts 3.00 best 3.00; upg [11]; ms []; canReset false nextAt 134,217,728} cp{pts 0.00 best 0.00; upg []; ms []; canReset false nextAt 1.00e42; next upg 11@100.00} cp2{pts 0.00 best 0.00; upg []; ms []; canReset false nextAt 1.00e30; next ms 1: [1] 1e30 Rebirth Points \| 2: [2] 1 Super Charge Power} se{pts 0.00 best 0.00; upg []; ms []; canReset false nextAt 1.80e308; next upg 11@10.00} |

## 2026-09-15T18:32:30Z — S1 part 1s (`node tools/harness/gates-s1.mjs --part 1s`) — commit `0fba2b05` (tree DIRTY) — 0/2 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-1 baseline §12d stall ptr @ 17260e03 | ptr | profile all | 13712 | 13712 | 1 | `57f7b715d43002e1` | **RED** | SUMMARY stalled 14131 / 46df73d4545bb4e2 / last progress 10531; baseline stalled false walled true last progress 10531; game 427d30d076764dc4 |
| S1-1 pinned §12d stall ptr (kinds=reset,upgrades,buyables) | ptr | profile all | 13516 | 13516 | 1 | `477f816f0e1cad1d` | **RED** | stalled false walled true; last progress 10531; game state c814e2201e992c38 vs baseline 427d30d076764dc4 — equal false; marks (i) one of t/e/s unlocked: 3550/ff624de18438f176 · (ii) t ms 3 or s ms 3 (b.auto / g.auto available): 6037/b6fc0204a69bc54a · (iii) t, e and s unlocked: 8035/6511fcca2c6ae896; actions {"reset:p":1352,"upgrades:p":628,"reset:g":884,"upgrades:g":90,"reset:b":954,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":6,"reset:t":8,"upgrades:t":1,"reset:e":24,"buyables:e":3}; state: p{pts 0 best 0; upg [11,12,21,13,22,23,31,32,33]; ms []; canReset true gain 2.66e29 nextAt 10.00} b{pts 52.00 best 52.00; upg [11,12,13,21,22,23]; ms [0,1]; canReset false nextAt 1.29e518} g{pts 43.00 best 43.00; upg [11,12,13,14,15,21,22,23,24,25]; ms [0,1,2]; canReset false nextAt 1.18e319} t{pts 6.00 best 6.00; upg [11]; ms [0,1,2,3]; canReset false nextAt 5.43e712; next upg 12@200,000 21@12 22@9.00 24@2.00e17 25@3.00e19; next ms 4: 8 Time Capsules} e{pts 14.00 best 14.00; upg []; ms [0,1]; buy {"11":"3.00"}; canReset false nextAt 1.00e600; next upg 11@25.00 14@3.00e23 23@2.00e20 24@2.50e28; next ms 2: 25 Enhance Points} s{pts 7.00 best 7.00; upg [11,12,13,14,15,23]; ms [0,1,2,3]; buy {"11":"14.00","12":"6.00","13":"3.00","14":"4.00"}; canReset false nextAt 8.65e668; next upg 21@13.00 22@2.50e207 24@1.00e177 25@1.00e244; next ms 4: 8 Space Energy} sb{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 100.00} q{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e512; next ms 0: 2 Total Quirks \| 1: 3 Total Quirks} |

## 2026-09-15T18:41:35Z — A1 part 2 (`node tools/harness/gates-a1.mjs --part 2`) — commit `0fba2b05` (tree DIRTY) — 22/22 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| A1-2 anchor (exclude au, profile off) | ptr | idle | 200 | 10 | 0.05 | `d9c5ace6665833d0` | GREEN | L1 anchor d9c5ace6665833d0; full state incl. au 4da26ee5249e1153; features registered 77 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | idle | 1000 | 50 | 0.05 | `86067be644ce481c` | GREEN | L1 anchor 86067be644ce481c; full state incl. au 2ededecf221fa820; features registered 77 (games-auto/ptr.js) |
| A1-2 anchor (exclude au, profile off) | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | L1 anchor 5ce24001caa4f31f; full state incl. au fa220e380c2e91fd; features registered 77 (games-auto/ptr.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | ptr | policy | 1000 | 50 | 0.05 | `5ce24001caa4f31f` | GREEN | 28 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 1 (p); au fallback (layer's slot skipped by the engine): 27 (b g t e s sb sg h q o ss m ba ps en ne hn n hs i id r ma ge mc ai c); hash = policy anchor |
| A1-2 updateTemp does not call automate | ptr | policy | 200 | 10 | 0.05 | `a5f9c1b2546f8afe` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | ptr | idle | 1000 | 50 | 0.05 | `2ededecf221fa820` | GREEN | page 2ededecf221fa820 in 26065 ms |
| A1-2 parity hookAll (counters node≡page) | ptr | policy | 200 | 10 | 0.05 | `a5f9c1b2546f8afe` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | ptr | — | 0 | 0 | — | — | GREEN | 398 ids, 35 layers |
| A1-2 check-manifest | ptr | — | 0 | 0 | — | — | GREEN | 13 scripts, 0 modFiles, games/ptr pristine, auto games-auto/ptr.js |
| A1-2 au layer in the page | ptr | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 77 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | ptr | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 77 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Prestige reset); ✓ click turned "Prestige reset" on; ✓ disclosure line after the first click; ✓ save namespaced (1 keys under tmt-loader:ptr:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/ptr-au-{off,all,toggled}.png |
| A1-2 anchor (exclude au, profile off) | something | idle | 200 | 10 | 0.05 | `46bb8c5b1a96f03a` | GREEN | L1 anchor 46bb8c5b1a96f03a; full state incl. au a716a598351c179c; features registered 38 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | idle | 1000 | 50 | 0.05 | `5739997ed0e70447` | GREEN | L1 anchor 5739997ed0e70447; full state incl. au 0c459f705233fbf2; features registered 38 (games-auto/something.js) |
| A1-2 anchor (exclude au, profile off) | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | L1 anchor 52ffa8d3c5eaba03; full state incl. au 4c7752a8a6579092; features registered 38 (games-auto/something.js) |
| A1-2 wrapper calls = 1 per hooked layer per tick | something | policy | 1000 | 50 | 0.05 | `52ffa8d3c5eaba03` | GREEN | 14 layers hooked (hookAll probe); loops 1000; doubles 0; own automate slot: 14 (planetary pbooster polygon dimension arithmetic addition subtraction multiplication division primitive numbercore corebooster fundamental unlock); au fallback (layer's slot skipped by the engine): 0; hash = policy anchor |
| A1-2 updateTemp does not call automate | something | policy | 200 | 10 | 0.05 | `c814c83dc6a9385c` | GREEN | updateTemp() ×3 after each of 200 ticks moved the counter: false; predicate errors 0 |
| A1-2 parity node≡page (full state) | something | idle | 1000 | 50 | 0.05 | `0c459f705233fbf2` | GREEN | page 0c459f705233fbf2 in 8685 ms |
| A1-2 parity hookAll (counters node≡page) | something | policy | 200 | 10 | 0.05 | `e3fcbf8a41ba25d1` | GREEN | state equal true; hookStats equal true; page loops 200 |
| A1-2 check-goldens unchanged | something | — | 0 | 0 | — | — | GREEN | 329 ids, 21 layers |
| A1-2 check-manifest | something | — | 0 | 0 | — | — | GREEN | 17 scripts, 17 modFiles, games/something pristine, auto games-auto/something.js |
| A1-2 au layer in the page | something | — | 0 | 0 | — | — | GREEN | tmp.au true; row side; doReset false; player.au.features {}; disclosed false; managed profile off; 38 features; `#app .smallNode.au` × 1; 0 page errors, 0 failed, 0 blocked |
| A1-2 au tab (page) | something | — | 0 | 0 | — | — | GREEN | ✓ unmanaged default profile = saved; ✓ 38 feature toggles; ✓ fresh boot: every toggle Off/Locked (Off, Locked); ✓ au tab renders its title; ✓ no disclosure before any click; ✓ ?profile=all: toggles On (On (profile all), Locked); ✓ ?profile=all did not write the save (saved au.features {}); ✓ reload without ?profile: Off again; ✓ an unlocked feature to click (Unlock reset); ✓ click turned "Unlock reset" on; ✓ disclosure line after the first click; ✓ save namespaced (2 keys under tmt-loader:something:); ✓ toggle persists across reload (On); ✓ 0 page errors, 0 failed, 0 blocked; screenshots results/something-au-{off,all,toggled}.png |

## 2026-09-15T18:45:24Z — S1 part 1s (`node tools/harness/gates-s1.mjs --part 1s`) — commit `0fba2b05` (tree DIRTY) — 2/2 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-1 baseline §12d stall ptr @ 17260e03 | ptr | profile all | 14131 | 14131 | 1 | `46df73d4545bb4e2` | GREEN | SUMMARY stalled 14131 / 46df73d4545bb4e2 / last progress 10531; baseline stalled true walled false last progress 10531; game f53368c9f575c56f |
| S1-1 pinned §12d stall ptr (kinds=reset,upgrades,buyables) | ptr | profile all | 14131 | 14131 | 1 | `291c24f627ecf2d4` | GREEN | stalled true walled false; last progress 10531; game state f53368c9f575c56f vs baseline f53368c9f575c56f — equal true; marks (i) one of t/e/s unlocked: 3550/ff624de18438f176 · (ii) t ms 3 or s ms 3 (b.auto / g.auto available): 6037/b6fc0204a69bc54a · (iii) t, e and s unlocked: 8035/6511fcca2c6ae896; actions {"reset:p":1413,"upgrades:p":628,"reset:g":932,"upgrades:g":90,"reset:b":998,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":6,"reset:t":8,"upgrades:t":1,"reset:e":27,"buyables:e":3}; state: p{pts 4.84e131 best 4.84e131; upg [11,12,21,13,22,23,31,32,33]; ms []; canReset true gain 4.84e131 nextAt 7.07e173} b{pts 49.00 best 49.00; upg [11,12,13,21,22,23]; ms [0,1]; canReset false nextAt 2.33e276} g{pts 38.00 best 38.00; upg [11,12,13,14,15,21,22,23,24,25]; ms [0,1,2]; canReset false nextAt 9.32e210} t{pts 6.00 best 6.00; upg [11]; ms [0,1,2,3]; canReset false nextAt 5.43e712; next upg 12@200,000 21@12 22@9.00 24@2.00e17 25@3.00e19; next ms 4: 8 Time Capsules} e{pts 17.00 best 17.00; upg []; ms [0,1]; buy {"11":"3.00"}; canReset false nextAt 1.00e600; next upg 11@25.00 14@3.00e23 23@2.00e20 24@2.50e28; next ms 2: 25 Enhance Points} s{pts 7.00 best 7.00; upg [11,12,13,14,15,23]; ms [0,1,2,3]; buy {"11":"14.00","12":"6.00","13":"3.00","14":"4.00"}; canReset false nextAt 8.65e668; next upg 21@13.00 22@2.50e207 24@1.00e177 25@1.00e244; next ms 4: 8 Space Energy} sb{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 100.00} q{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e512; next ms 0: 2 Total Quirks \| 1: 3 Total Quirks} |

## 2026-09-15T18:51:29Z — S1 part 2 (`node tools/harness/gates-s1.mjs --part 2`) — commit `36309c61` — 5/5 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-2 challenges smoke (unit-drive, ptr h 11) | ptr | kinds=challenges, sequential | 200 | 200 | 1 | `38a8bf8b85d971b7` | GREEN | A (snapshot @20 ticks, edited): enters 1 exits 0, activeChallenge 11, completions 0; B (A's player, goal currency past the goal): enters 1 exits 1, completions 11: 1, activeChallenge now 12; errors none |
| S1-2 challenges smoke (unit-drive, something arithmetic 11) | something | kinds=challenges, sequential | 200 | 200 | 1 | `587345248a2f15f8` | GREEN | A (snapshot @20 ticks, edited): enters 1 exits 0, activeChallenge 11, completions 0; B (A's player, goal currency past the goal): enters 0 exits 1, completions 11: 1, activeChallenge now null; errors none |
| S1-2 challenges smoke (a real run: the-challenge-tree cp 11, TMT 2.6.6.2) | the-challenge-tree | profile all, challenges:cp sequential | 530 | 26.5 | 0.05 | `4fad3c9a7cb0aeba` | GREEN | entered 1 ticks / 0.05 s / 1500f999e8eac14c (game 70f9104e0be55430); completed 530 ticks / 26.5 s / 4fad3c9a7cb0aeba (game 2611310b415a2ebd); challenges {"challenges:cp":{"enter":2,"exit":1}}; actions {"challenges:cp":3,"reset:cp":1}; features 22 |
| S1-2 S1 FRONTIER: ptr, every derived kind on (profile all), fresh game (monotone detector, 3600 game-s, 9-min wall) | ptr | profile all | 14131 | 14131 | 1 | `63f28e099536a119` | GREEN | stalled true, wall-bounded false; LAST PROGRESS 10531 (10531 s); game state f7a8854358ac4029; doubles 0; player.g.auto === true at 6038 (s ms 3 at 6037: +1 tick); reset:g 299 at that tick → 299 at the end (stopped growing: true); player.b.auto === true at 7323 (t ms 3 at 7322: +1 tick); reset:b 501 at that tick → 501 at the end (stopped growing: true); marks t ms 3: 7322 · s ms 3: 6037 · player.b.auto === true: 7323 · player.g.auto === true: 6038 · (i) one of t/e/s unlocked: 3550 · (ii) t ms 3 or s ms 3 (b.auto / g.auto available): 6037 · (iii) t, e and s unlocked: 8035; points 1.1875983088470332e220; actions {"reset:p":1413,"upgrades:p":628,"reset:g":299,"upgrades:g":90,"reset:b":501,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":6,"toggles:s":1,"reset:t":8,"upgrades:t":1,"toggles:t":1,"reset:e":27,"buyables:e":3}; challenges {}; state: p{pts 4.84e131 best 4.84e131; upg [11,12,21,13,22,23,31,32,33]; ms []; canReset true gain 4.84e131 nextAt 7.07e173} b{pts 49.00 best 49.00; upg [11,12,13,21,22,23]; ms [0,1]; canReset false nextAt 2.33e276} g{pts 38.00 best 38.00; upg [11,12,13,14,15,21,22,23,24,25]; ms [0,1,2]; canReset false nextAt 9.32e210} t{pts 6.00 best 6.00; upg [11]; ms [0,1,2,3]; canReset false nextAt 5.43e712; next upg 12@200,000 21@12 22@9.00 24@2.00e17 25@3.00e19; next ms 4: 8 Time Capsules} e{pts 17.00 best 17.00; upg []; ms [0,1]; buy {"11":"3.00"}; canReset false nextAt 1.00e600; next upg 11@25.00 14@3.00e23 23@2.00e20 24@2.50e28; next ms 2: 25 Enhance Points} s{pts 7.00 best 7.00; upg [11,12,13,14,15,23]; ms [0,1,2,3]; buy {"11":"14.00","12":"6.00","13":"3.00","14":"4.00"}; canReset false nextAt 8.65e668; next upg 21@13.00 22@2.50e207 24@1.00e177 25@1.00e244; next ms 4: 8 Space Energy} sb{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 100.00} q{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e512; next ms 0: 2 Total Quirks \| 1: 3 Total Quirks} |
| S1-2 frontier, informative: policy:buyables:s=highest-first;policy:buyables:e=buy-unless-saving | ptr | profile all | 12795 | 12795 | 1 | `0432e4ad94fc4005` | GREEN | stalled true, wall-bounded false; LAST PROGRESS 9195 (9195 s); game state 6cf3731c785c2c1f; doubles 0; player.g.auto === true at 6038 (s ms 3 at 6037: +1 tick); reset:g 300 at that tick → 300 at the end (stopped growing: true); player.b.auto === true at 7323 (t ms 3 at 7322: +1 tick); reset:b 498 at that tick → 498 at the end (stopped growing: true); marks t ms 3: 7322 · s ms 3: 6037 · player.b.auto === true: 7323 · player.g.auto === true: 6038 · (i) one of t/e/s unlocked: 3550 · (ii) t ms 3 or s ms 3 (b.auto / g.auto available): 6037 · (iii) t, e and s unlocked: 8035; points 1.8397171374185914e316; actions {"reset:p":1280,"upgrades:p":556,"reset:g":300,"upgrades:g":90,"reset:b":498,"upgrades:b":120,"reset:s":16,"buyables:s":27,"upgrades:s":5,"toggles:s":1,"reset:t":8,"upgrades:t":1,"toggles:t":1,"reset:e":20}; challenges {}; state: p{pts 4.60e184 best 4.60e184; upg [11,12,21,13,22,23,31,32,33]; ms []; canReset true gain 4.60e184 nextAt 3.77e246} b{pts 60.00 best 60.00; upg [11,12,13,21,22,23]; ms [0,1]; canReset false nextAt 6.61e572} g{pts 54.00 best 54.00; upg [11,12,13,14,15,21,22,23,24,25]; ms [0,1,2]; canReset false nextAt 5.51e593} t{pts 6.00 best 6.00; upg [11]; ms [0,1,2,3]; canReset false nextAt 5.43e712; next upg 12@200,000 21@12 22@9.00 24@2.00e17 25@3.00e19; next ms 4: 8 Time Capsules} e{pts 20.00 best 20.00; upg []; ms [0,1]; canReset false nextAt 1.00e600; next upg 11@25.00 14@3.00e23 23@2.00e20 24@2.50e28; next ms 2: 25 Enhance Points} s{pts 7.00 best 7.00; upg [11,12,13,14,15]; ms [0,1,2,3]; buy {"11":"14.00","12":"6.00","13":"3.00","14":"4.00"}; canReset false nextAt 8.65e668; next upg 21@13.00 22@2.50e207 23@1.00e105 24@1.00e177 25@1.00e244; next ms 4: 8 Space Energy} sb{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 100.00} q{LOCKED pts 0 best 0; upg []; ms []; canReset false nextAt 1.00e512; next ms 0: 2 Total Quirks \| 1: 3 Total Quirks} |

## 2026-09-15T18:57:32Z — S1 part 2s-p (`node tools/harness/gates-s1.mjs --part 2s-p`) — commit `36309c61` (tree DIRTY) — 6/6 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-2 sweep reset:p interval>=10 (table default) | ptr | profile all | 2936 | 2936 | 1 | `5b553ef2a725e670` | GREEN | game-s to (i) b and g unlocked / (ii) keep-upgrade milestones b0 + g0 / (iii) b.best ≥ 15 and g.best ≥ 15: 1361 / 2360 / 2936 (A1-3 at diff 1: 1361 / 2360 / 2936); ended: all marks met (last progress 2936 s); reset:p 294 |
| S1-2 sweep reset:p gain>=2x (table-less default candidate) | ptr | profile all | 2112 | 2112 | 1 | `3deb3569808695d0` | GREEN | game-s to (i) b and g unlocked / (ii) keep-upgrade milestones b0 + g0 / (iii) b.best ≥ 15 and g.best ≥ 15: 918 / 1627 / 2112 (A1-3 at diff 1: 1361 / 2360 / 2936); ended: all marks met (last progress 2112 s); reset:p 361 |
| S1-2 sweep reset:p gain>=4x | ptr | profile all | 2215 | 2215 | 1 | `9ba8f4ade188a2a0` | GREEN | game-s to (i) b and g unlocked / (ii) keep-upgrade milestones b0 + g0 / (iii) b.best ≥ 15 and g.best ≥ 15: 1064 / 1748 / 2215 (A1-3 at diff 1: 1361 / 2360 / 2936); ended: all marks met (last progress 2215 s); reset:p 299 |
| S1-2 sweep reset:p unlocks-purchase | ptr | profile all | 8281 | 8281 | 1 | `2fb3fc2d0d7b1474` | GREEN | game-s to (i) b and g unlocked / (ii) keep-upgrade milestones b0 + g0 / (iii) b.best ≥ 15 and g.best ≥ 15: 2601 / NOT MET / NOT MET (A1-3 at diff 1: 1361 / 2360 / 2936); ended: stalled (last progress 4681 s); reset:p 118 |
| S1-2 sweep reset:p always | ptr | profile all | 3871 | 3871 | 1 | `12c00a8fd24a5cac` | GREEN | game-s to (i) b and g unlocked / (ii) keep-upgrade milestones b0 + g0 / (iii) b.best ≥ 15 and g.best ≥ 15: NOT MET / NOT MET / NOT MET (A1-3 at diff 1: 1361 / 2360 / 2936); ended: stalled (last progress 271 s); reset:p 1862 |
| S1-2 sweep reset:p gain>=2x — second run (table-less default candidate) | ptr | profile all | 2112 | 2112 | 1 | `3deb3569808695d0` | GREEN | game-s to (i) b and g unlocked / (ii) keep-upgrade milestones b0 + g0 / (iii) b.best ≥ 15 and g.best ≥ 15: 918 / 1627 / 2112 (A1-3 at diff 1: 1361 / 2360 / 2936); equal to the first true; ended: all marks met (last progress 2112 s); reset:p 361 |

## 2026-09-15T19:01:26Z — S1 part 2s-f (`node tools/harness/gates-s1.mjs --part 2s-f`) — commit `36309c61` (tree DIRTY) — 6/6 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-2 sweep reset:fundamental interval>=5 (table default) | something | profile all | 308 | 308 | 1 | `8baea60a9e055234` | GREEN | game-s to (i) first fundamental reset (fundamental.total ≥ 1) / (ii) unlock:upg:12: 6 / 308 (A1-3 at diff 1: (i) 6, (ii) 308); ended: all marks met (last progress 308 s); reset:fundamental 61 |
| S1-2 sweep reset:fundamental gain>=2x (table-less default candidate) | something | profile all | 496 | 496 | 1 | `60b765f7692dc7bb` | GREEN | game-s to (i) first fundamental reset (fundamental.total ≥ 1) / (ii) unlock:upg:12: 6 / 496 (A1-3 at diff 1: (i) 6, (ii) 308); ended: all marks met (last progress 496 s); reset:fundamental 25 |
| S1-2 sweep reset:fundamental gain>=4x | something | profile all | 1587 | 1587 | 1 | `cc05fa9734483b8d` | GREEN | game-s to (i) first fundamental reset (fundamental.total ≥ 1) / (ii) unlock:upg:12: 6 / 1587 (A1-3 at diff 1: (i) 6, (ii) 308); ended: all marks met (last progress 1587 s); reset:fundamental 18 |
| S1-2 sweep reset:fundamental unlocks-purchase | something | profile all | 4442 | 4442 | 1 | `2b4af820b6a34a80` | GREEN | game-s to (i) first fundamental reset (fundamental.total ≥ 1) / (ii) unlock:upg:12: 6 / NOT MET (A1-3 at diff 1: (i) 6, (ii) 308); ended: stalled (last progress 842 s); reset:fundamental 9 |
| S1-2 sweep reset:fundamental always | something | profile all | 5536 | 5536 | 1 | `c4a0c947a4cd23fe` | GREEN | game-s to (i) first fundamental reset (fundamental.total ≥ 1) / (ii) unlock:upg:12: 6 / NOT MET (A1-3 at diff 1: (i) 6, (ii) 308); ended: stalled (last progress 1936 s); reset:fundamental 2763 |
| S1-2 sweep reset:fundamental gain>=2x — second run (table-less default candidate) | something | profile all | 496 | 496 | 1 | `60b765f7692dc7bb` | GREEN | game-s to (i) first fundamental reset (fundamental.total ≥ 1) / (ii) unlock:upg:12: 6 / 496 (A1-3 at diff 1: (i) 6, (ii) 308); equal to the first true; ended: all marks met (last progress 496 s); reset:fundamental 25 |

## 2026-09-15T19:02:37Z — S1 part 2s-q (`node tools/harness/gates-s1.mjs --part 2s-q`) — commit `36309c61` (tree DIRTY) — 5/5 green

| gate | game | leg | ticks | gameSeconds | diff | hash | result | notes |
|---|---|---|---|---|---|---|---|---|
| S1-2 sweep reset:primitive interval>=90 (table default) | something | profile all | 580 | 580 | 1 | `e038801189d07063` | GREEN | game-s to (i) primitive reset ≥ 1 (primitive.total ≥ 1) / (ii) primitive ms 1 ("10 Numbers") / (iii) primitive ms 2 ("100,000 Numbers"): 310 / 400 / 580 (A2-1 at diff 1: 309 / 399 / 579); ended: all marks met (last progress 580 s); reset:primitive 4 |
| S1-2 sweep reset:primitive gain>=2x (table-less default candidate) | something | profile all | 952 | 952 | 1 | `0221507cee45f3bf` | GREEN | game-s to (i) primitive reset ≥ 1 (primitive.total ≥ 1) / (ii) primitive ms 1 ("10 Numbers") / (iii) primitive ms 2 ("100,000 Numbers"): 310 / 447 / 952 (A2-1 at diff 1: 309 / 399 / 579); ended: all marks met (last progress 952 s); reset:primitive 11 |
| S1-2 sweep reset:primitive gain>=4x | something | profile all | 836 | 836 | 1 | `4a3f689cb33ddbd2` | GREEN | game-s to (i) primitive reset ≥ 1 (primitive.total ≥ 1) / (ii) primitive ms 1 ("10 Numbers") / (iii) primitive ms 2 ("100,000 Numbers"): 310 / 378 / 836 (A2-1 at diff 1: 309 / 399 / 579); ended: all marks met (last progress 836 s); reset:primitive 9 |
| S1-2 sweep reset:primitive unlocks-purchase | something | profile all | 619 | 619 | 1 | `f903c5f78076552e` | GREEN | game-s to (i) primitive reset ≥ 1 (primitive.total ≥ 1) / (ii) primitive ms 1 ("10 Numbers") / (iii) primitive ms 2 ("100,000 Numbers"): 310 / 499 / 619 (A2-1 at diff 1: 309 / 399 / 579); ended: all marks met (last progress 619 s); reset:primitive 3 |
| S1-2 sweep reset:primitive gain>=2x — second run (table-less default candidate) | something | profile all | 952 | 952 | 1 | `0221507cee45f3bf` | GREEN | game-s to (i) primitive reset ≥ 1 (primitive.total ≥ 1) / (ii) primitive ms 1 ("10 Numbers") / (iii) primitive ms 2 ("100,000 Numbers"): 310 / 447 / 952 (A2-1 at diff 1: 309 / 399 / 579); equal to the first true; ended: all marks met (last progress 952 s); reset:primitive 11 |
