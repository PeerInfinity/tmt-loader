addLayer("lore", {
  startData() {
    return {
      unlocked: true,
      points: Decimal.dZero,
    };
  },
  color: "#567890", // The color for this layer, which affects many elements.
  row: "side", // The row this layer is on (0 is the first row).
  symbol: "L", // The row this layer is on (0 is the first row).
  position: 10,
  layerShown() {
    return true;
  }, // Returns a bool for if this layer's node should be visible in the tree.
  upgrades: {
    // Look in the upgrades docs to see what goes here!
  },
  type: "none", // Determines the formula used for calculating prestige currency.
  tooltip: "Lore", // Determines the formula used for calculating prestige currency.
  infoboxes: {
    collabtree1: {
      unlocked() {
        return true;
      },
      title: "The Collab Tree: Part I",
      body() {
        return "I've been watching these mod creators try make something great. Suprised to see how it's going. Everytime these people get together and work it fails. This time they might have a chance. I won't say who I am, but I've been watching and observing for a very long time. I was sent by somebody to scout the modding tree's mod creators and take notes. Certainly this mix of mod-creators won't do anything special, right? We have C.V.T.C, the infectious modder, who's two layers have sprouted in your premises. If you want to find success, get through all of these mod creator's work.";
      },
    },
  },
  tabFormat: [
    [
      "raw-html",
      function () {
        return "<h2>Note: The lore for TCT aligns with the canon for <br><a href=https://icecreamdudes.github.io/Incremental-God-Tree>Gods of Incremental</a> and <a href=https://icecreamdudes.github.io/Incremental-God-Tree>Incremental God Tree</a>.";
      },
    ],
    ["blank", "25px"], //Change link to gods of incremental when it's released
    ["infobox", "collabtree1"],
  ],
});
