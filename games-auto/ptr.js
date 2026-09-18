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
    'reset:t': 'interval>=5',
    'reset:e': 'interval>=5',
    'reset:s': 'interval>=5',
  },
  alternatives: {
    'reset:p': ['interval>=10', 'always', 'gain>=1'],
    'reset:b': ['keepsUpgrades'],
    'reset:g': ['keepsUpgrades'],
    'reset:t': ['always', 'gain>=1'],
    'reset:e': ['always', 'gain>=1'],
    'reset:s': ['always', 'gain>=1'],
  },
  // milestone 0 of b / g ("8 Boosters" / "8 Generators": "Keep Prestige Upgrades on reset") gates keepsUpgrades (A1 §11e.8)
  keep: { 'reset:b': { layer: 'b', id: 0 }, 'reset:g': { layer: 'g', id: 0 } },
  off: {
    'buyables:t': "Extra Time Capsules are paid in Boosters, which would lower the booster effect (A2 §12e.1)",
  },
};
