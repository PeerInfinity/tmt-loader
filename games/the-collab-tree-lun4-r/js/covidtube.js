addLayer("cv", {
  name: "Coronavirus", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CV", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "#ee003f",
  requires: new Decimal(100), // Can be a function that takes requirement increases into account
  resource: "Coronavirus", // Name of prestige currency
  baseResource: "sickness", // Name of resource prestige is based on
  passiveGeneration() {
    return hasMilestone("e", 1) ? 0.01 : 0;
  },
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.42069, // why did you do this to us
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("tb", 12)) mult = mult.mul(upgradeEffect("tb", 12));
    if (hasUpgrade("cv", 12)) mult = mult.mul(2);
    if (hasUpgrade("cv", 13)) mult = mult.mul(3);
    if (hasUpgrade("je", 11)) mult = mult.mul(upgradeEffect("je", 11));
    if (hasMilestone("e", 3)) mult = mult.mul(3);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "c",
      description: "C: Get a case of covid-19 ",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ], //plague tree
  layerShown() {
    return true;
  },
  upgrades: {
    11: {
      title: "Cough everywhere",
      description:
        "Your coughs spread the sickness around. Double sickness gain.",
      cost: new Decimal(1),
    },
    12: {
      title: "Infection spread",
      description: "Double coronavirus gain",
      cost: new Decimal(10),
    },
    13: {
      title: "Get hospitalized",
      description: "Triple coronavirus gain. Also raise sickness to the 1.25",
      cost: new Decimal(69),
    },
    14: {
      title: "Perish",
      description: "Unlock dice.",
      cost: new Decimal(420),
    },
    21: {
      title: "TBD",
      description: "Placeholder",
      cost: new Decimal(1e100),
      unlocked() {
        return hasUpgrade("ba", 11) && player.e.points.gte(5);
      },
    },
    22: {
      title: "TBD",
      description: "Placeholder",
      cost: new Decimal(1e200),
      unlocked() {
        return hasUpgrade("ba", 11) && player.e.points.gte(5);
      },
    },
    23: {
      title: "TBD",
      description: "Placeholder",
      cost: new Decimal(1e300),
      unlocked() {
        return hasUpgrade("ba", 11) && player.e.points.gte(5);
      },
    },
    24: {
      title: "TBD",
      description: "Placeholder",
      cost: new Decimal(1e400),
      unlocked() {
        return hasUpgrade("ba", 11) && player.e.points.gte(5);
      },
    },
  },
  doReset(l) {
    if (layers[l].row > this.row) {
      let keep = [];
      if (l == "tdr" && hasMilestone("tdr", 2)) keep.push("upgrades");
      layerDataReset(this.layer, keep);
    }
  },
});
addLayer("tb", {
  name: "Tuberculosis", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "TB", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "#12bee5",
  requires: new Decimal(5), // Can be a function that takes requirement increases into account
  resource: "Tuberculosis", // Name of prestige currency
  baseResource: "sickness", // Name of resource prestige is based on
  passiveGeneration() {
    return hasMilestone("e", 1) ? 0.01 : 0;
  },
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.6942, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("tb", 12)) mult = mult.mul(upgradeEffect("tb", 12));
    if (hasMilestone("e", 3)) mult = mult.mul(3);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    let exp = new Decimal(1);
    if (hasUpgrade("ba", 11) && player.e.points.gte(3)) exp = exp.mul(1.05);
    return exp;
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "t",
      description: "T: Contract Tuberculosis",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  upgrades: {
    11: {
      title: "Bacterial Infection",
      description() {
        return (
          "Total diseases increase your sickness gain. Currently: +" +
          format(this.effect())
        );
      },
      cost: new Decimal(1),
      effect() {
        return player.tb.points.add(player.cv.points).pow(0.25);
      },
    },
    12: {
      title: "Lung Damage",
      description() {
        return (
          "Tuberculosis and coronavirus boost each other's gain slightly. Currently: *" +
          format(this.effect())
        );
      },
      cost: new Decimal(5),
      effect() {
        return player.tb.points.add(player.cv.points).pow(0.25).add(1);
      },
    },
    13: {
      title: "Double Disease",
      description() {
        return (
          "Tuberculosis multiplies sickness. Currently: *" +
          format(this.effect())
        );
      },
      cost: new Decimal(25),
      effect() {
        return player.tb.points.add(1).ln().add(2);
      },
    },
    14: {
      title: "Test Tubes",
      description() {
        return "Dice get 1 more side.";
      },
      cost: new Decimal(625),
      unlocked() {
        return player.tdr.unlocked;
      },
    },
    15: {
      title: "Tube Boost",
      description() {
        return (
          "Time speed affects roll cooldown at a reduced rate. Currently sped up by: x" +
          format(tmp.t.timeCalculation.add(10).log10())
        );
      },
      cost: new Decimal(390625),
      unlocked() {
        return player.tdr.unlocked;
      },
    },
    16: {
      title: "Enter the Balancing Zone",
      description() {
        return "Unlock jacorbian energy.";
      },
      cost: new Decimal(152587890625),
      unlocked() {
        return hasMilestone("tdr", 1);
      },
    },
  },
  doReset(l) {
    if (layers[l].row > this.row) {
      let keep = [];
      if (l == "tdr" && hasMilestone("tdr", 3)) keep.push("upgrades");
      layerDataReset(this.layer, keep);
    }
  },
});
