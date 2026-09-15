// Justcubing97's Something Tree — the automation table: DATA only (docs/automation.md); the core derives the features.
tmtLoader.autoTable = {
  id: 'something',
  // Every A1/A2 number was measured with a layer's reset BEFORE its purchases (the A1/A2 registration order).
  kindOrder: ['toggles', 'reset', 'upgrades', 'buyables', 'challenges', 'clickables'],
  policies: {
    'reset:unlock': 'always',                // A1 table
    // A1-3 (diff 1, game-s to unlock:upg:12): 5 → 308, 10 → 343, 20 → 435, 30 → 549, 60 → 784, 2 → not in 3000;
    // gain>=1 resets ~every tick and starves unlock gain (points^0.1)
    'reset:fundamental': 'interval>=5',
    // A2-1 sweep (diff 1, game-s to primitive ms 1 / ms 2): 90 → 399 / 579; 60 → 429 / 17109; 120 → 429 / 669;
    // 5 = 10 = always = gain>=1 → 501 / not in 20000
    'reset:primitive': 'interval>=90',
    'buyables:fundamental': 'buyMax',        // A1 table (buyables 11–22 define no buyMax: one at a time to purchaseLimit)
  },
  alternatives: {
    'reset:unlock': ['gain>=1'],
    'reset:fundamental': ['gain>=1', 'always'],
    'reset:primitive': ['always', 'gain>=1'],
  },
};
