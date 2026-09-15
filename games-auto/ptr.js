// Prestige Tree Rewritten — the automation table (A1). Registers features only; the au grid shows them in this order.
// Rows 0–1: the p reset + upgrades, and the static b/g pair. Everything is OFF by default (docs/automation.md).
(function () {
  var T = tmtLoader;
  // unlockOrder: which of the row-1 pair resets first. Both are static at 200 points, but the SECOND one unlocked
  // costs ×5000 (`unlockOrder` in layers.js requires()), so the second pair member's reset waits for the first to unlock.
  // Table option: ?autoOpt=unlockOrder=g,b / --auto-opt unlockOrder=g,b. Default b,g (A1 part 3 measured both).
  var order = String((T.options && T.options.unlockOrder) || 'b,g').split(',');
  if (order.length !== 2 || order.indexOf('b') < 0 || order.indexOf('g') < 0) throw new Error('games-auto/ptr.js: unlockOrder must be b,g or g,b');
  T.autoTable = { id: 'ptr', unlockOrder: order };

  T.registerAutoFeature({ id: 'reset:p', layer: 'p', kind: 'reset', policy: 'always', policies: ['always', 'gain>=1'], title: 'Prestige reset', default: false });
  T.registerAutoFeature({ id: 'upgrades:p', layer: 'p', kind: 'upgrades', policy: 'cheapest-first', title: 'Prestige upgrades', unlocked: function () { return player.p.unlocked; }, default: false });
  // the b/g milestone 0 ("8 Boosters" / "8 Generators": "Keep Prestige Upgrades on reset.") is the keepsUpgrades gate
  [['b', 'Booster reset'], ['g', 'Generator reset']].forEach(function (x) {
    var l = x[0];
    T.registerAutoFeature({
      id: 'reset:' + l, layer: l, kind: 'reset', policy: 'gain>=1', policies: ['gain>=1', 'keepsUpgrades'], title: x[1],
      keepMilestone: { layer: l, id: 0 }, after: order[1] === l ? [order[0]] : [],
      unlocked: function () { return player.p.unlocked; }, default: false,
    });
  });
  T.registerAutoFeature({ id: 'upgrades:b', layer: 'b', kind: 'upgrades', policy: 'cheapest-first', title: 'Booster upgrades', unlocked: function () { return player.b.unlocked; }, default: false });
  T.registerAutoFeature({ id: 'upgrades:g', layer: 'g', kind: 'upgrades', policy: 'cheapest-first', title: 'Generator upgrades', unlocked: function () { return player.g.unlocked; }, default: false });
})();
