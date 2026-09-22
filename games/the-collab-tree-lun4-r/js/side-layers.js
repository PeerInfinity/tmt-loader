addLayer("a", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "a", // This appears on the layer's node. Default is the id with the first letter capitalized
  color: "#F5754E",
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  tooltip: "Achievements",
  resource: "achievements", // Name of prestige currency
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  row: "side", // Row the layer is in on the tree (0 is the first row)
  layerShown() {
    return true;
  },
  update(diff) {
    player.a.points = new Decimal(player.a.achievements.length).add();
  },
  achievements: {
    11: {
      name: "Pointy :D",
      done() {
        return hasUpgrade("poi", 11);
      },
      tooltip: "Get PU11.",
    },
    12: {
      name: "Dice?",
      done() {
        return player.tdr.points.gte(1);
      },
      tooltip: "Unlock dice.",
    },
  },
});
