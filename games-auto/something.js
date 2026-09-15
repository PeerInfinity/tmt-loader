// Justcubing97's Something Tree — the automation table (A1). Registers features only; the au grid shows them in this
// order. Row 0 `unlock` (normal, 1 point) and row 1 `fundamental` (normal, 10 points; `player.fundamental.unlocked` is
// set by unlock upgrade 11). Everything is OFF by default (docs/automation.md).
(function () {
  var T = tmtLoader;
  T.autoTable = { id: 'something' };
  T.registerAutoFeature({ id: 'reset:unlock', layer: 'unlock', kind: 'reset', policy: 'always', policies: ['always', 'gain>=1'], title: 'Unlock reset', default: false });
  T.registerAutoFeature({ id: 'upgrades:unlock', layer: 'unlock', kind: 'upgrades', policy: 'cheapest-first', title: 'Unlock upgrades', default: false });
  T.registerAutoFeature({ id: 'reset:fundamental', layer: 'fundamental', kind: 'reset', policy: 'gain>=1', policies: ['gain>=1', 'always'], title: 'Fundamental reset', unlocked: function () { return player.fundamental.unlocked; }, default: false });
  T.registerAutoFeature({ id: 'upgrades:fundamental', layer: 'fundamental', kind: 'upgrades', policy: 'cheapest-first', title: 'Fundamental upgrades', unlocked: function () { return player.fundamental.unlocked; }, default: false });
  // fundamental.js defines buyables 11, 12, 13, 21, 22 (none has a buyMax: bought one at a time up to purchaseLimit)
  T.registerAutoFeature({ id: 'buyables:fundamental', layer: 'fundamental', kind: 'buyables', policy: 'buyMax', title: 'Fundamental buyables', unlocked: function () { return player.fundamental.unlocked; }, default: false });
})();
