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
    // A1-3: `always` walls row 1 (p resets at 10 points, never reaching b/g's 200); interval 10 fastest of 5/10/30/60/120 s
    'reset:p': 'interval>=10',
    // A1 table: b/g reset whenever they can (static: gain is 1 per reset)
    'reset:b': 'gain>=1',
    'reset:g': 'gain>=1',
    // A2-3 sweeps: the requirement paces a row-2 reset — 5 ties with always / gain>=1 (s to 30, t to 60, e everywhere)
    'reset:t': 'interval>=5',
    'reset:e': 'interval>=5',
    'reset:s': 'interval>=5',
  },
  alternatives: {
    'reset:p': ['always', 'gain>=1'],
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
