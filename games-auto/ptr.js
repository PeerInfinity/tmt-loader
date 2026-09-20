// Prestige Tree Rewritten — the automation table: DATA only (docs/automation.md). The core (loader/tmt-auto.js) derives
// reset / upgrades / buyables / toggles / challenges / clickables features for every tree layer; this table holds what the
// game does not declare. Every number and order below comes from a measured row in tools/harness/results/SUMMARY.md.
tmtLoader.autoTable = {
  id: 'ptr',
  // Siblings: the i-th member's reset waits until those before it are unlocked (each unlock raises the others' requirement).
  // [g, b]: A1-3 (diff 1) g first reached both unlocked / b0+g0 / both best ≥ 15 at 1361 / 2360 / 2936 game-s vs b first
  // 1532 / 2491 / 3067, ahead at every p interval tried. [s, t, e]: A2-3 order rows — s,t,e 3550 / 6037 / 8035; s,e,t
  // 3550 / 6037 / —; t,e,s and e,t,s never reach (ii). Options unlockOrder=… / rowTwoOrder=… override them.
  unlockOrder: [['g', 'b'], ['s', 't', 'e']],
  // Every A1/A2 number was measured with a layer's reset BEFORE its purchases (the A1/A2 registration order).
  kindOrder: ['toggles', 'reset', 'upgrades', 'buyables', 'challenges', 'clickables'],
  policies: {
    // R1′ (this slice's default): `gain>=2x` — the target-driven rule ⚖ 13d.2 asks for, and the faster one. S1-2's sweep
    // (docs/automation.md; SUMMARY 2026-09-15 S1-2s) 918 / 1627 / 2112 game-s to A1-3's three marks against
    // `interval>=10`'s 1361 / 2360 / 2936 (28 % ahead), and P1b's frontier control (iii) (§12b.4) reached M11 at 15582
    // against the interval's 15782. NOT re-derived here: R1′ took it as given (plan §14b option 1). `always` still
    // walls row 1 (p resets at 10 points, so points never reach the 200 the b/g pair needs, A1-3); `interval>=10` was
    // the fastest of 5/10/30/60/120 s and is kept as an alternative, since every pinned A1/A2 number was measured in it.
    'reset:p': 'gain>=2x',
    // A1 table: b/g reset whenever they can (static: gain is 1 per reset)
    'reset:b': 'gain>=1',
    'reset:g': 'gain>=1',
    // A2-3 sweeps: the requirement paces a row-2 reset — 5 ties with always / gain>=1 (s to 30, t to 60, e everywhere)
    // — measured while row 2 was being UNLOCKED, where t and s are static (gain 1 per reset, layers.js:916/1593) and the
    // requirement really does pace them. R1′'s frontier sweep (gate R1′-2.3) leaves both where they are.
    // ⚖ 13d.2 again: an interval survives only where NO target-driven rule matches it. One does. `always` is the
    // derived default for a static layer precisely because its gain is 1 per reset and its REQUIREMENT paces it, so
    // there is nothing for a clock to be a proxy for. Measured from frontier/STALL under this table, one 12000-tick
    // leg each (gate R1′-2.3): `interval>=5` reaches M16 at 24236 / 24236 (t / s) and `always` at 24212 / 24203 — a
    // tie to within 0.1 %, constant-free, which is the tie A2-3 already saw during the unlock phase (the all-`always`
    // control reached (iii) at the default's 8035). `gain>=Nx` cannot fire on a static layer at all and stalls both.
    'reset:t': 'always',
    'reset:s': 'always',
    // ⚖ 13d.2 in one row. `e` is the one NORMAL layer of row 2 (layers.js:1320, exponent 0.02), so its gain is a
    // function of how high points climbed — and an interval reset SPENDS that climb every 5 seconds for ~1.5 EP.
    // `gain>=2x` waits until the reset at least doubles the EP held and takes the whole climb at once. Measured from
    // frontier/STALL, one 12000-tick leg (gate R1′-2.3): `interval>=5` / `always` reach NO new mark and end with 16 EP
    // held (best 400) after 147 resets; `unlocks-purchase` reaches M11 at 14745 with 263 EP; **`gain>=2x` reaches every
    // remaining mark of the rung — M11 14745 · M12 14909 · M13 14132 · M14 14879 · M15 16067 · M16 24236 — in 299
    // resets, ending with 2.35e92 EP.** The interval was a PROXY for "let points climb first"; this is that, said
    // directly.
    'reset:e': 'gain>=2x',
    // R1′: Enhancers (e buyable 11) cost `2^(x^1.5)` EP (layers.js:1502) and compete for the EP that the e half of M12's
    // tax refund needs — e11 (25) → e12 (400) → e22 (1000 EP, all at e.unlockOrder 2; layers.js:1361/1373/1416). The
    // reserve is READ from the game, never written here: `reserve>=next-upgrade` is the cost of e's cheapest unowned
    // unlocked EP-costed upgrade, so it follows the chain as it is bought. Measured from frontier/STALL, 9000 ticks
    // (gate R1′-2.2): `buy` 11 EP held (best 36) with 4 Enhancers · `reserve>=next-upgrade` 47 EP (best 47) with 3 ·
    // and the literal `reserve>=25` is byte-identical to `buy`, because once e11 is owned the next upgrade costs 400.
    'buyables:e': 'reserve>=next-upgrade',
    // ⛔ R2, AND THE ONE DEFAULT THIS SLICE MOVED. `q` is row 3 and NORMAL, so it inherited the derived `gain>=2x` —
    // which on an EMPTY purse is `gain >= 0`, i.e. `always` (docs/automation.md, "the EMPTY PURSE"). `q` holds nothing
    // almost all the time, because `buyables:q` spends every quirk on Quirk Layers (cost `2^(2^x − 1)`: 1, 2, 8, 128 …),
    // so the ratio was against a RESIDUE and the rule fired the instant one quirk existed — unlocking `q` at 16917 and
    // letting a row-3 reset wipe row 2 before row 2 was done. Measured over a WHOLE STRETCH (gate R2-S1, from
    // `snapshots/ptr/all/M15.json` → M22, 14 000 ticks, diff 1, every cell twice equal — scoring from `all/M16.json`
    // was itself the trap, since that fixture was written under the rule being judged):
    //   `gain>=2x` (shipped)  M16 24179 · M17 16917 · M18 24274 · M19 24607 · then nothing for ~5 400 game-s
    //   `gain>=2x-unit`       M16 17058 · M17 23492 · M18 25598 · M19 25931 · then nothing
    //   **`gain>=2`**         M16 17058 · M17 23492 · M18 25598 · M19 25931 · M20 26594 · **M22 29194**
    //   `always`              M16 NEVER · M17 16917 · M18 24056 · M19 25290 · M20 26473
    //   `unlocks-purchase`    M16 22346 · M18 22477 · then nothing (q buyable 11 costs 1 quirk, so it affords something
    //                         on the first reset: on this layer the target-driven rule IS the degenerate one)
    //   `rate-peak@0/0`       M16 22346 · M18 24609 · M19 26218 · M20 27299 · **M21 27652** · no M22
    //   `rate-peak@0.1/30`    M16 22346 · M18 26214 · M19 28062 · M20 29323 · M21 29676 · no M22
    // Two facts add up to this entry. (1) **The floor is worth 7 121 game-seconds at M16** — the whole completion of
    // row 2 — and `gain>=2x-unit` and `gain>=2` are IDENTICAL until the first reset leaves `q` holding one, which is
    // the measurement that isolates the empty purse from the constant. (2) **Past that point the ratio stalls and the
    // fixed bar does not**: the Quirk Layer cost outruns the gain, `2× held` runs away, and only `gain>=2` reaches
    // M20 and M22. ⚖ 13d.2 counts `gain>=N` as target-driven, and this N is the layer's own first milestone —
    // q ms 0 is `player.q.total.gte(2)`, the digest's L3.2 and G1's "if you can, try to reset for 2 quirks in one go".
    // ⚠ The stall MODIFIER cannot substitute: `gain>=2x-unit|stall>=3x/5` and `|stall>=2x/5` are BYTE-IDENTICAL to the
    // bare `gain>=2x-unit` over this leg (same 30048 / `b483e2d3d5ba1137`) — with 3 q resets in 14 000 ticks the
    // fallback never accumulates the history it needs. ⚠ And M21 is NOT gated by `reset:h`: `policy:reset:h=gain>=2x-unit`
    // beside this entry is byte-identical too. What gates M21 is Time Energy having to re-climb to 1e30 between q
    // resets, so the policy that farms quirks fastest is the one that never gets there (R2 part 2).
    'reset:q': 'gain>=2',
  },
  // ⛔ R2's WALL AT M21, BROKEN BY A PAUSE — and the whole finding is that it is a PAUSE and not a latching STOP.
  // `h` needs 1e30 Time Energy to reset and `hasMilestone('q',4)` to be SHOWN (M20). Time Energy is row 2's, and a
  // `q` reset WIPES row 2 — so the policy that farms quirks fastest is the one that never lets Time Energy climb
  // back, and R2 measured M21 and M22 as two BRANCHES that pull opposite ways (plan §24.7): `gain>=2` reaches M20
  // and M22 and never M21, while the two `rate-peak` cells reach M21 and never M22.
  // ⚖ 13d.2 — no arbitrary waiting: this is not a clock. It stops resetting `q` at the exact moment `q` has nothing
  // left to unlock on this rung (its milestone 4 is the last one row 2 can buy) and starts again the moment the
  // thing it was waiting FOR has happened. Both terms are the engine's own.
  //
  // MEASURED over a WHOLE STRETCH (gate V4-m21, from `snapshots/ptr/all/M15.json` → M22, 16,000 ticks, diff 1,
  // every cell TWICE and every cell equal; the planner reproduced the winning row independently at 3346da419):
  //   NO pause (the control)   M16 17058 · M17 23492 · M18 25598 · M19 25937 · M20 26612 · M21 —     · M22 29204
  //   **this entry**           M16 17058 · M17 23492 · M18 25598 · M19 25937 · M20 26612 · M21 28058 · M22 30618
  //   …with `|| TE within 1e20 of h's requirement` added — BYTE-IDENTICAL to this entry (the extra term is inert:
  //      by the time q ms 4 holds, Time Energy is already inside the window)
  //   `h.unlocked || tmp.h.baseAmount.lt(tmp.h.requires.div('1e10'))`   M16 17058 and then NOTHING — and
  //   `…div('1e20')` is byte-identical to it (32048 / `a40493595e4663d1`). ⛔ Reading the REQUIREMENT from the
  //      engine instead of naming the milestone pauses `q` before it has ever reset, and a layer UNLOCKS ON ITS
  //      FIRST RESET — so `q` never unlocks at all. The milestone is not a literal standing in for the requirement;
  //      it is the only term that can be true before the layer exists.
  //   the DERIVED candidate (pause while a SHOWN-but-LOCKED layer of my own row exists) M16–M21 to the second, and
  //      then NO M22 — see `provenance` and plan §27: it deadlocks on PTR itself.
  // ⚠ THE PRICE IS THE CLIMB, NOT THE RULE. M22 moves 29204 → 30618, i.e. **+1414 game-seconds**, and the pause
  // itself lasts 26612 → 28058 = **1446**. The delay IS the time Time Energy needs to reach 1e30 with row 2 intact;
  // no pause predicate can make that cheaper, because it is the game's cost and not a scheduling choice.
  gates: {
    'reset:q': "!hasMilestone('q',4) || player.h.unlocked",
  },
  alternatives: {
    'reset:p': ['interval>=10', 'always', 'gain>=1'],
    'reset:b': ['keepsUpgrades'],
    'reset:g': ['keepsUpgrades'],
    'reset:t': ['interval>=5', 'gain>=1'],
    'reset:e': ['interval>=5', 'unlocks-purchase', 'always', 'gain>=1'],
    'reset:s': ['interval>=5', 'gain>=1'],
    'buyables:e': ['buy', 'buy-unless-saving'],
    'reset:q': ['gain>=2x-unit', 'rate-peak@0/0', 'gain>=2x', 'always'],
  },
  // milestone 0 of b / g ("8 Boosters" / "8 Generators": "Keep Prestige Upgrades on reset") gates keepsUpgrades (A1 §11e.8)
  keep: { 'reset:b': { layer: 'b', id: 0 }, 'reset:g': { layer: 'g', id: 0 } },
  // NO `order` entries: R1′ swept the three refund chains the digest names — t 12,13,23 (L2.9–L2.10), e 11,12,22
  // (L2.2–L2.5), s 13,15,23 (L2.14–L2.16) — through `order-then-cheapest` against the derived `cheapest-first`, one
  // arm each and all three together, 3×12000 ticks from frontier/STALL (gate R1′-2.1). All five arms are IDENTICAL:
  // same marks, t upgrades [11,12,13,14,15,23], e [11,12], s [11,12,13,14,15,23], unlockOrder [0,2,0], 319 EP held
  // (best 400), 7 TC, 7 SE, 62 boosters. `cheapest-first` already buys a refund chain in a viable order, because each
  // link is the cheapest unowned thing in its currency by the time the currency can afford it — so an `order` here
  // would be a literal with no measured effect behind it.

  // R1′ LIFTED the one exclusion this table had. It read: 'buyables:t': "Extra Time Capsules are paid in Boosters, which
  // would lower the booster effect (A2 §12e.1)". The reason is a claim about the game, and it is false at the row-2
  // frontier: the Time Energy cap is `100·(2^(TC + extra TC) − 1)·enCapMult` (layers.js:975), so every Extra Time Capsule
  // DOUBLES it, and without them the cap sits at 6300 against t12's 2e5 — the whole t12 → t13 → t23 refund chain
  // (digest L2.9–L2.10) waits on it. Measured from frontier/STALL, 9000 ticks (gate R1′-2.4): with the exclusion, t
  // upgrades [11], Time Energy 6300 at its cap, t.unlockOrder still 1; with it lifted, 11 Extra Time Capsules, cap
  // 2.49e9, t upgrades [11,12,13,14,15,23] and **t.unlockOrder 1 → 0** — the t half of M12 — with M11 at 14960 instead
  // of 15582 and Generator Power 8.36e119 instead of 1.14e117. The booster cost is real and smaller: 57 boosters
  // instead of 61, i.e. effectBase^4 = 13.6978^4 ≈ 3.5e4× of point gain, against Time Energy's own effect
  // (`(TE+1)^1.2`) rising 36,248 → ~1.9e11. The game itself grants this autobuyer later (`ab` 14 / `player.t.autoExt`
  // at q milestone 1, layers.js:1007) — the exclusion was early, not wrong in kind.
  off: {},
  // ⚖ MINIMIZE HARDCODING has always required that a number or an order in a table carry its provenance in a
  // COMMENT. V1 makes it DATA as well: one line per entry, naming the gate row that measured it, so the au tab's
  // Advanced view can tell a player why a default is what it is instead of leaving the answer in a file nobody
  // playing the game will open (survey §4.11). The long comments above stay exactly where they are — this is the
  // one line each of them would give a reader who is looking at the tab, not at the source.
  // ⚠ Author-written text rendered through `display-text`, which is `v-html`: the loader escapes it (`escapeText`).
  provenance: {
    'reset:p': "R1′ (SUMMARY gate R1′-2.3, and S1-2's sweep): `gain>=2x` reached A1-3's three marks at 918 / 1627 / 2112 game-s against `interval>=10`'s 1361 / 2360 / 2936, and M11 at 15582 against 15782 — the target-driven rule ⚖ 13d.2 asks for.",
    'reset:b': "A1 table (SUMMARY gate A1-3): a static layer's gain is 1 per reset and its requirement paces it, so b resets whenever it can.",
    'reset:g': "A1 table (SUMMARY gate A1-3): as `reset:b`; `unlockOrder [g, b]` puts g first — 1361 / 2360 / 2936 game-s against b-first's 1532 / 2491 / 3067, ahead at every p interval tried.",
    'reset:t': "A2-3, re-measured at the frontier (SUMMARY gate R1′-2.3): `always` reaches M16 at 24212 against `interval>=5`'s 24236 — a tie to within 0.1 %, and constant-free.",
    'reset:s': "A2-3, re-measured at the frontier (SUMMARY gate R1′-2.3): `always` reaches M16 at 24203 against `interval>=5`'s 24236 — the same tie.",
    'reset:e': "R1′ (SUMMARY gate R1′-2.3): e is row 2's only NORMAL layer, so its gain follows how high points climbed and an interval reset spends that climb every 5 s. `gain>=2x` reaches every remaining mark of the rung (M11 14745 · M12 14909 · M15 16048 · M16 24179); `interval>=5` and `always` reach none of them.",
    'buyables:e': "R1′ (SUMMARY gate R1′-2.2): the reserve is READ from the game, never written here. `reserve>=next-upgrade` ends 47 EP held with 3 Enhancers against `buy`'s 11 EP with 4 — and a literal `reserve>=25` is byte-identical to `buy`, because once e11 is owned the next upgrade costs 400.",
    'reset:q': "R2 (SUMMARY gate R2-S1), scored over a WHOLE STRETCH from `all/M15.json` → M22: the derived `gain>=2x` is `gain >= 0` while q holds nothing, so it unlocked q at 16917 and a row-3 reset wiped row 2 — M16 24179 and then nothing past M19. `gain>=2` reaches M16 at 17058, M20 at 26594 and M22 at 29194; 2 is q milestone 0's own requirement (2 total quirks). \u2014 V4 added its PAUSE (gate V4-m21, every cell twice): without it M21 is never reached and M22 lands at 29204; with it M21 lands at 28058 and M22 at 30618, M16\u2013M20 unmoved to the second. The +1414 game-s at M22 is the 1446 game-s Time Energy needs to reach 1e30 with row 2 intact \u2014 the game's cost, not the rule's.",
    'buyables:t': "R1′ (SUMMARY gate R1′-2.4) LIFTED the exclusion this table used to carry. With it: t upgrades [11], Time Energy 6300 at its cap, `t.unlockOrder` 1. Without it: 11 Extra Time Capsules, cap 2.49e9, t upgrades [11,12,13,14,15,23] and `t.unlockOrder` 0 — the t half of M12.",
  },
};
