// Prestige Tree Rewritten — the automation table (A1, A2). Registers features only; the au grid shows them in this order.
// Rows 0–1: the p reset + upgrades, and the static b/g pair; row 2 (A2): the t/e/s triple. Everything is OFF by default (docs/automation.md).
(function () {
  var T = tmtLoader;
  // unlockOrder: which of the row-1 pair resets first. Both are static at 200 points, but the SECOND one unlocked
  // costs ×5000 (`unlockOrder` in layers.js requires()), so the second pair member's reset waits for the first to unlock.
  // Table option: ?autoOpt=unlockOrder=b,g / --auto-opt unlockOrder=b,g. Default g,b: A1 part 3 measured both at diff 1
  // (reset:p interval>=10) — g first reached both unlocked / both keep-upgrade milestones / both best ≥ 15 at
  // 1361 / 2360 / 2936 game-s vs b first 1532 / 2491 / 3067, and g first was ahead at every p interval tried (5–120 s).
  var order = String((T.options && T.options.unlockOrder) || 'g,b').split(',');
  if (order.length !== 2 || order.indexOf('b') < 0 || order.indexOf('g') < 0) throw new Error('games-auto/ptr.js: unlockOrder must be b,g or g,b');
  T.autoTable = { id: 'ptr', unlockOrder: order };

  // reset:p default interval>=10, not always: `always` resets p the moment points reach 10 (gain 1), so points never
  // reach the 200 the b/g pair needs — a hard wall at diff 0.05 and diff 1 alike (A1 part 3). gain>=N (N>1) never
  // fires at all from a fresh game (no point generation before the first p reset). An interval resets p once at once,
  // then lets points accumulate; 10 s reached the row-1 predicates fastest of 5/10/30/60/120 s.
  T.registerAutoFeature({ id: 'reset:p', layer: 'p', kind: 'reset', policy: 'interval>=10', policies: ['interval>=10', 'always', 'gain>=1'], title: 'Prestige reset', default: false });
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

  // ---- row 2 (A2): the t / e / s triple -------------------------------------------------------------------------------
  // All three open at 1e120 points, but each unlock raises the other two's `unlockOrder` (game.js doReset,
  // `increaseUnlockOrder`) and `requires` is 1e120 × 1e180^(unlockOrder^1.415): the second costs 1e300, the third
  // 1e600 (unlockOrder stays raised after the unlock, so every later reset of the second / third pays it too, until
  // their "acts as if chosen first" upgrade). rowTwoOrder = which unlocks first, second, third: the i-th member's reset
  // waits for the members before it. Table option ?autoOpt=rowTwoOrder=t,e,s / --auto-opt rowTwoOrder=t,e,s.
  // Default s,t,e — A2 part 3, diff 1, game-s to (i) one unlocked / (ii) t or s ms 3 / (iii) all three:
  // s,t,e 3550 / 6037 / 8035 · s,e,t 3550 / 6037 / not in the run · t,e,s 3550 / never / never (second unlock 6879) ·
  // e,t,s 3550 / never / never (no second unlock). Space first pays: its buildings multiply point gain, which is what
  // the 1e300 second requirement needs; Enhancers, bought with a reset-starved currency, do not.
  var order3 = String((T.options && T.options.rowTwoOrder) || 's,t,e').split(',');
  if (order3.length !== 3 || ['t', 'e', 's'].some(function (l) { return order3.indexOf(l) < 0; })) throw new Error('games-auto/ptr.js: rowTwoOrder must be a permutation of t,e,s');
  T.autoTable.rowTwoOrder = order3;
  var shown3 = { t: function () { return player.b.unlocked; }, e: function () { return player.b.unlocked && player.g.unlocked; }, s: function () { return player.g.unlocked; } };
  // reset defaults interval>=5 for all three (A2 part 3 sweeps, one layer at a time, the others at their defaults): the
  // requirement, not the policy, paces a row-2 reset — interval 5–30 (s) / 5–60 (t) tie exactly with `always` and
  // `gain>=1`; s at 60 costs 10 game-s, at 120 270; t at 120 costs 70 on (iii); e unlocks last, at (iii), so its
  // interval cannot move (i)–(iii) (every value equal). The shortest of the tied intervals is the default.
  var pol3 = { t: 'interval>=5', e: 'interval>=5', s: 'interval>=5' };
  [['t', 'Time reset'], ['e', 'Enhance reset'], ['s', 'Space reset']].forEach(function (x) {
    var l = x[0];
    T.registerAutoFeature({
      id: 'reset:' + l, layer: l, kind: 'reset', policy: pol3[l], policies: [pol3[l], 'always', 'gain>=1'], title: x[1],
      after: order3.slice(0, order3.indexOf(l)), unlocked: shown3[l], default: false,
    });
  });
  T.registerAutoFeature({ id: 'upgrades:t', layer: 't', kind: 'upgrades', policy: 'cheapest-first', title: 'Time upgrades', unlocked: function () { return player.t.unlocked; }, default: false });
  T.registerAutoFeature({ id: 'upgrades:e', layer: 'e', kind: 'upgrades', policy: 'cheapest-first', title: 'Enhance upgrades', unlocked: function () { return player.e.unlocked; }, default: false });
  T.registerAutoFeature({ id: 'upgrades:s', layer: 's', kind: 'upgrades', policy: 'cheapest-first', title: 'Space upgrades', unlocked: function () { return player.s.unlocked; }, default: false });
  // Buyables: policy `buy` (buyBuyable while the amount moves = what a click does, paying the cost). NOT `buyMax`: in
  // 2.2.1 nothing but an autobuyer calls buyMaxBuyable (no component does), and PTR's buyMax() bodies set the amount to
  // the affordable target WITHOUT subtracting the cost — they are the game's own q-milestone autobuyers (e.auto, autoBld).
  // e: Enhancers (11); s: the Space Buildings 11–20 (paid in Generator Power, bounded by space). t's only buyable (Extra
  // Time Capsules) is paid in Boosters, which would lower the booster effect — not registered.
  T.registerAutoFeature({ id: 'buyables:e', layer: 'e', kind: 'buyables', policy: 'buy', title: 'Enhancers', unlocked: function () { return player.e.unlocked; }, default: false });
  T.registerAutoFeature({ id: 'buyables:s', layer: 's', kind: 'buyables', policy: 'buy', title: 'Space Buildings', unlocked: function () { return player.s.unlocked; }, default: false });
})();
