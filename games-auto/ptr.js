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
  },
  alternatives: {
    'reset:p': ['interval>=10', 'always', 'gain>=1'],
    'reset:b': ['keepsUpgrades'],
    'reset:g': ['keepsUpgrades'],
    'reset:t': ['interval>=5', 'gain>=1'],
    'reset:e': ['interval>=5', 'unlocks-purchase', 'always', 'gain>=1'],
    'reset:s': ['interval>=5', 'gain>=1'],
    'buyables:e': ['buy', 'buy-unless-saving'],
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
};
