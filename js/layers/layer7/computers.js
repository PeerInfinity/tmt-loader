addLayer("co", {
  name: "Computers", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CO", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      canReset1: true,
    };
  },
  color: "#d6af2f",
  nodeStyle() {
    if (tmp.co.canReset || player.co.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(214, 175, 47) 0%, rgb(255, 207, 51) 50%, rgb(182, 144, 19) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  requires: new Decimal(150), // Can be a function that takes requirement increases into account
  resource: "Computers", // Name of prestige currency
  baseResource: "Volts", // Name of resource prestige is based on
  baseAmount() {
    return player.co.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    if (layers[reset].row > this.row) {
      layerDataReset("co", keep);
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
  branches: ["vo"],
  hotkeys: [
    {
      key: "Shift + O",
      description: "Shift + O: for Computers",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return false;
  },
});
