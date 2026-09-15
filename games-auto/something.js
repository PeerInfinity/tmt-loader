// Justcubing97's Something Tree — the automation table (A1). Registers features only; the au grid shows them in this
// order. Row 0 `unlock` (normal, 1 point) and row 1 `fundamental` (normal, 10 points; `player.fundamental.unlocked` is
// set by unlock upgrade 11). Everything is OFF by default (docs/automation.md).
(function () {
  var T = tmtLoader;
  T.autoTable = { id: 'something' };
  T.registerAutoFeature({ id: 'reset:unlock', layer: 'unlock', kind: 'reset', policy: 'always', policies: ['always', 'gain>=1'], title: 'Unlock reset', default: false });
  T.registerAutoFeature({ id: 'upgrades:unlock', layer: 'unlock', kind: 'upgrades', policy: 'cheapest-first', title: 'Unlock upgrades', default: false });
  // reset:fundamental default interval>=5, not gain>=1: gain>=1 resets fundamental ~every tick (points stay ~0), which
  // starves unlock gain (points^0.1) — unlock:upg:12 (1e5 unlock points) never came (A1 part 3, stall at 1936 game-s).
  // Measured at diff 1, game-s to unlock:upg:12: interval 5 → 308, 10 → 343, 20 → 435, 30 → 549, 60 → 784; 2 → not in 3000.
  T.registerAutoFeature({ id: 'reset:fundamental', layer: 'fundamental', kind: 'reset', policy: 'interval>=5', policies: ['interval>=5', 'gain>=1', 'always'], title: 'Fundamental reset', unlocked: function () { return player.fundamental.unlocked; }, default: false });
  T.registerAutoFeature({ id: 'upgrades:fundamental', layer: 'fundamental', kind: 'upgrades', policy: 'cheapest-first', title: 'Fundamental upgrades', unlocked: function () { return player.fundamental.unlocked; }, default: false });
  // fundamental.js defines buyables 11, 12, 13, 21, 22 (none has a buyMax: bought one at a time up to purchaseLimit)
  T.registerAutoFeature({ id: 'buyables:fundamental', layer: 'fundamental', kind: 'buyables', policy: 'buyMax', title: 'Fundamental buyables', unlocked: function () { return player.fundamental.unlocked; }, default: false });
})();
