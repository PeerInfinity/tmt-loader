addLayer("cv", {
  name: "Civilization", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CV", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      canReset1: true,
    };
  },
  color: "#521ea5",
  nodeStyle() {
    if (tmp.cv.canReset || player.cv.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(56, 19, 145) 0%, rgb(52, 21, 224) 50%, rgb(50, 11, 141) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  requires: new Decimal(100), // Can be a function that takes requirement increases into account
  resource: "Civilizations", // Name of prestige currency
  baseResource: "Evolution Points", // Name of resource prestige is based on
  baseAmount() {
    return player.e.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    if (layers[reset].row > this.row) {
      layerDataReset("cv", keep);
    }
  },
  update() {},

  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  row: 6, // Row the layer is in on the tree (0 is the first row)
  branches: ["vo", "e"],
  hotkeys: [
    {
      key: "Shift + v",
      description: "Shift + V: for Civilizations",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return false;
  },
});
