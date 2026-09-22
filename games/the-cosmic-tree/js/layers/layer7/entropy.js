addLayer("en", {
  name: "Entropy", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "EN", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      canReset1: true,
    };
  },
  color: "#26d492",
  nodeStyle() {
    if (tmp.co.canReset || player.co.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(39, 255, 172) 0%, rgb(107, 253, 197) 50%, rgb(14, 168, 109) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  requires: new Decimal(45), // Can be a function that takes requirement increases into account
  resource: "Entropy", // Name of prestige currency
  baseResource: "Stargazed Metal", // Name of resource prestige is based on
  baseAmount() {
    return player.en.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    if (layers[reset].row > this.row) {
      layerDataReset("en", keep);
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
  branches: ["sm", "vo"],
  hotkeys: [
    {
      key: "Shift + E",
      description: "Shift + E: for Entropy",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return false;
  },
});
