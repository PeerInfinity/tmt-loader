addLayer("r", {
  name: "rank", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  autoPrestige() {
    return hasMilestone("p", 2);
  },
  resetsNothing() {
    return hasMilestone("p", 2) || hasMilestone("h", 1);
  },
  color: "blue",
  requires: new Decimal(5), // Can be a function that takes requirement increases into account
  resource: "ranks", // Name of prestige currency
  baseResource: "rank power", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 2.5,
  exponent: 1.25, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasMilestone("tr", 2)) exp = exp.times(1.1);
    if (hasMilestone("tr", 5)) exp = exp.times(1.1);
    if (hasMilestone("p", 3)) exp = exp.times(1.2);
    if (hasMilestone("tr", 6)) exp = exp.times(1.23);
    if (hasMilestone("h", 1)) exp = exp.times(1.3);

    return exp;
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "r",
      description: "R: Reset for ranks",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  canBuyMax() {
    return hasMilestone("tr", 3) || hasMilestone("p", 3);
  },

  doReset(resettingLayer) {
    let keep = [];
    if (hasMilestone("tr", 2) && resettingLayer == "t") keep.push("milestones");
    if (hasMilestone("p", 1) && resettingLayer == "t") keep.push("milestones");
    if (hasMilestone("h", 1) && resettingLayer == "t") keep.push("milestones");

    if (layers[resettingLayer].row > this.row) layerDataReset("r", keep);
  },

  milestones: {
    1: {
      requirementDescription: "Rank 1",
      done() {
        return player[this.layer].points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription: "Double rank power",
    },
    2: {
      requirementDescription: "Rank 2",
      done() {
        return player[this.layer].points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription: "Multiply rank power by ranks+1",
      unlcoked() {
        return hasMilestone("r", 1);
      },
    },
    3: {
      requirementDescription: "Rank 4",
      done() {
        return player[this.layer].points.gte(4);
      }, // Used to determine when to give the milestone
      effectDescription: "X10 rank power",
      unlcoked() {
        return hasMilestone("r", 2);
      },
    },
    4: {
      requirementDescription: "Rank 20",
      done() {
        return player[this.layer].points.gte(20);
      }, // Used to determine when to give the milestone
      effectDescription: "X40 rank power",
      unlcoked() {
        return hasMilestone("r", 3);
      },
    },
    5: {
      requirementDescription: "Rank 27",
      done() {
        return player[this.layer].points.gte(27);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.3 tiers",
      unlcoked() {
        return hasMilestone("r", 4);
      },
    },
    6: {
      requirementDescription: "Rank 43",
      done() {
        return player[this.layer].points.gte(43);
      }, // Used to determine when to give the milestone
      effectDescription: "X75 rank power",
      unlcoked() {
        return hasMilestone("r", 5);
      },
    },
    7: {
      requirementDescription: "Rank 64",
      done() {
        return player[this.layer].points.gte(64);
      }, // Used to determine when to give the milestone
      effectDescription: "X1,000,000 rank power",
      unlcoked() {
        return hasMilestone("r", 6);
      },
    },
    8: {
      requirementDescription: "Rank 75",
      done() {
        return player[this.layer].points.gte(75);
      }, // Used to determine when to give the milestone
      effectDescription: "Tiers ^1.06",
      unlcoked() {
        return hasMilestone("r", 7);
      },
    },
    9: {
      requirementDescription: "Rank 87",
      done() {
        return player[this.layer].points.gte(87);
      }, // Used to determine when to give the milestone
      effectDescription: "Pent+1^4 boosts rank power",
      unlcoked() {
        return hasMilestone("r", 8);
      },
    },
    10: {
      requirementDescription: "Rank 92",
      done() {
        return player[this.layer].points.gte(92);
      }, // Used to determine when to give the milestone
      effectDescription: "X1e9 rank power",
      unlcoked() {
        return hasMilestone("r", 9);
      },
    },
    11: {
      requirementDescription: "Rank 109",
      done() {
        return player[this.layer].points.gte(109);
      }, // Used to determine when to give the milestone
      effectDescription: "X1,000 rank power",
      unlcoked() {
        return hasMilestone("r", 10);
      },
    },
    12: {
      requirementDescription: "Rank 136",
      done() {
        return player[this.layer].points.gte(136);
      }, // Used to determine when to give the milestone
      effectDescription: "X10,000,000 rank power",
      unlcoked() {
        return hasMilestone("r", 11);
      },
    },
    13: {
      requirementDescription: "Rank 151",
      done() {
        return player[this.layer].points.gte(151);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.1 tiers",
      unlcoked() {
        return hasMilestone("r", 12);
      },
    },
    14: {
      requirementDescription: "Rank 153",
      done() {
        return player[this.layer].points.gte(153);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.13 penta",
      unlcoked() {
        return hasMilestone("r", 13);
      },
    },
    15: {
      requirementDescription: "Rank 232",
      done() {
        return player[this.layer].points.gte(232);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.11 penta",
      unlcoked() {
        return hasMilestone("r", 14);
      },
    },
  },
});
addLayer("t", {
  branches: ["r"],
  name: "tier", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  canBuyMax() {
    return hasMilestone("p", 3);
  },
  resetsNothing() {
    return hasMilestone("p", 3) || hasMilestone("h", 1);
  },
  color: "orange",
  requires: new Decimal(5), // Can be a function that takes requirement increases into account
  resource: "tiers", // Name of prestige currency
  baseResource: "ranks", // Name of resource prestige is based on
  baseAmount() {
    return player.r.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 1.2,
  exponent: 1.02, // Prestige currency exponent
  roundUpCost: true,
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasMilestone("r", 5)) exp = exp.times(1.3);
    if (hasMilestone("r", 8)) exp = exp.times(1.06);
    if (hasMilestone("r", 13)) exp = exp.times(1.1);
    if (hasMilestone("tr", 7)) exp = exp.times(1.15);
    if (hasMilestone("t", 6)) exp = exp.times(1.5);

    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "t",
      description: "T: Reset for tiers",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  doReset(resettingLayer) {
    let keep = [];
    if (hasMilestone("p", 2) && resettingLayer == "tr") keep.push("milestones");
    if (hasMilestone("h", 1) && resettingLayer == "t") keep.push("milestones");

    if (layers[resettingLayer].row > this.row) layerDataReset("t", keep);
  },

  milestones: {
    1: {
      requirementDescription: "Tier 1",
      done() {
        return player[this.layer].points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription: "X4 rank power gain",
    },
    2: {
      requirementDescription: "Tier 2",
      done() {
        return player[this.layer].points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription: "Multiply rank power by tiers cubed",
    },
    3: {
      requirementDescription: "Tier 3",
      done() {
        return player[this.layer].points.gte(3);
      }, // Used to determine when to give the milestone
      effectDescription: "Multiply rank power by rank power+1^0.4",
    },
    4: {
      requirementDescription: "Tier 6",
      done() {
        return player[this.layer].points.gte(6);
      }, // Used to determine when to give the milestone
      effectDescription: "X100 rank power",
    },
    5: {
      requirementDescription: "Tier 16",
      done() {
        return player[this.layer].points.gte(16);
      }, // Used to determine when to give the milestone
      effectDescription: "X123,456 rank power",
    },
    6: {
      requirementDescription: "Tier 35",
      done() {
        return player[this.layer].points.gte(35);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.5 tiers",
    },
  },
});
addLayer("tr", {
  branches: ["t"],

  name: "tetr", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  resetsNothing() {
    return hasMilestone("h", 2);
  },
  color: "green",
  requires: new Decimal(7), // Can be a function that takes requirement increases into account
  resource: "tetr", // Name of prestige currency
  baseResource: "tiers", // Name of resource prestige is based on
  baseAmount() {
    return player.t.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 1.1,
  exponent: 1.14, // Prestige currency exponent
  roundUpCost: true,
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasMilestone("p", 4)) exp = exp.times(1.14);
    if (hasMilestone("h", 2)) exp = exp.times(1.4);

    return exp;
  },
  row: 3, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "e",
      description: "E: Reset for tetr",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("tr", keep);
  },

  milestones: {
    1: {
      requirementDescription: "Tetr 1",
      done() {
        return player[this.layer].points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription: "X8 rank power",
    },
    2: {
      requirementDescription: "Tetr 2",
      done() {
        return player[this.layer].points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription: "Keep rank milestones on tier and ranks are easier",
    },
    3: {
      requirementDescription: "Tetr 3",
      done() {
        return player[this.layer].points.gte(3);
      }, // Used to determine when to give the milestone
      effectDescription: "Buy max ranks and multiply rank power by tetr+1^2.6",
    },
    4: {
      requirementDescription: "Tetr 5",
      done() {
        return player[this.layer].points.gte(5);
      }, // Used to determine when to give the milestone
      effectDescription: "X1,000 rank power",
    },
    5: {
      requirementDescription: "Tetr 7",
      done() {
        return player[this.layer].points.gte(7);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.1 ranks",
    },
    6: {
      requirementDescription: "Tetr 10",
      done() {
        return player[this.layer].points.gte(10);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.23 ranks",
    },
    7: {
      requirementDescription: "Tetr 12",
      done() {
        return player[this.layer].points.gte(12);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.15 tiers",
    },
    8: {
      requirementDescription: "Tetr 14",
      done() {
        return player[this.layer].points.gte(14);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.075 rank power",
    },
  },
});
addLayer("p", {
  branches: ["tr"],

  name: "penta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  resetsNothing() {
    return hasMilestone("h", 2);
  },
  color: "red",
  requires: new Decimal(6), // Can be a function that takes requirement increases into account
  resource: "penta", // Name of prestige currency
  baseResource: "tetr", // Name of resource prestige is based on
  baseAmount() {
    return player.tr.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 1.18,
  exponent: 1.18, // Prestige currency exponent
  roundUpCost: true,
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasMilestone("r", 14)) exp = exp.times(1.13);
    if (hasMilestone("r", 15)) exp = exp.times(1.11);

    return exp;
  },
  row: 4, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "p",
      description: "P: Reset for penta",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
  },

  milestones: {
    1: {
      requirementDescription: "Penta 1",
      done() {
        return player[this.layer].points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription: "Keep rank milestones on tier and X25,000 rank power",
    },
    2: {
      requirementDescription: "Penta 2",
      done() {
        return player[this.layer].points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Keep tier milestones on tetr and auto rank, rank resets nothing, and ^1.12 rank power",
    },
    3: {
      requirementDescription: "Penta 3",
      done() {
        return player[this.layer].points.gte(3);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Buy max tiers and ranks, they reset nothing, and ^1.2 ranks",
    },
    4: {
      requirementDescription: "Penta 4",
      done() {
        return player[this.layer].points.gte(4);
      }, // Used to determine when to give the milestone
      effectDescription: "^1.14 tetr",
    },
  },
});
addLayer("h", {
  branches: ["p"],

  name: "hepta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "violet",
  requires: new Decimal(5), // Can be a function that takes requirement increases into account
  resource: "hepta", // Name of prestige currency
  baseResource: "penta", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 1.27,
  exponent: 1.08, // Prestige currency exponent
  roundUpCost: true,
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 5, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "h",
      description: "H: Reset for hepta",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("h", keep);
  },

  milestones: {
    1: {
      requirementDescription: "Hepta 1",
      done() {
        return player[this.layer].points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Keep rank milestones, tier milestones, and ranks and tiers reset nothing, and ^1.3 ranks and X1,000,000 rank power",
    },
    2: {
      requirementDescription: "Hepta 2",
      done() {
        return player[this.layer].points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription: "Penta and tetr resets nothing and ^1.4 tetr",
    },
  },
});
