addLayer("p", {
  name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "#4BDC13",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "prestige points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("bp", 11)) mult = mult.add(1);
    if (hasUpgrade("bp", 12)) mult = mult.add(1);
    if (hasUpgrade("bp", 13)) mult = mult.add(1);
    if (hasUpgrade("bp", 14)) mult = mult.add(1);
    if (hasAchievement("ac", 13)) mult = mult.add(1);
    if (hasUpgrade("sp", 21)) mult = mult.add(1);
    if (hasUpgrade("sp", 22)) mult = mult.add(1);
    if (hasUpgrade("sp", 23)) mult = mult.add(1);
    if (hasUpgrade("sp", 24)) mult = mult.add(1);

    if (hasUpgrade("sp", 31)) mult = mult.times(1.4);
    if (hasUpgrade("sp", 32)) mult = mult.times(1.4);
    if (hasUpgrade("sp", 33)) mult = mult.times(1.4);
    if (hasUpgrade("sp", 34)) mult = mult.times(1.4);

    if (hasUpgrade("r", 11)) mult = mult.times(3);
    if (hasUpgrade("r", 12)) mult = mult.times(3);
    if (hasUpgrade("r", 13)) mult = mult.times(10);
    if (hasUpgrade("m", 12)) mult = mult.times(upgradeEffect("m", 12));

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  automate() {
    return hasUpgrade("r", 11);
  },
  autoUpgrade() {
    return hasUpgrade("r", 11);
  },
  passiveGeneration() {
    return hasUpgrade("r", 11) ? 1 : 0;
  },
  hotkeys: [
    {
      key: "p",
      description: "P: Reset for prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  tabFormat: {
    "main tab": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "milestones",

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "Prestige 1",
      description: "Add 1 to base point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Prestige 2",
      description: "Add 1 to base point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Prestige 3",
      description: "Add 1 to base point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Prestige 4",
      description: "Add 1 to base point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("bp", {
  name: "better prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["p"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "#ff9100",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "better prestige points", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.475, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("sp", 11)) mult = mult.add(1);
    if (hasUpgrade("sp", 12)) mult = mult.add(1);
    if (hasUpgrade("sp", 13)) mult = mult.add(1);
    if (hasUpgrade("sp", 14)) mult = mult.add(1);
    if (hasUpgrade("r", 11)) mult = mult.times(3);
    if (hasUpgrade("r", 12)) mult = mult.times(3);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "b",
      description: "B: Reset for better prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  automate() {
    return hasUpgrade("r", 12);
  },
  autoUpgrade() {
    return hasUpgrade("r", 12);
  },
  passiveGeneration() {
    return hasUpgrade("r", 12) ? 1 : 0;
  },
  tabFormat: {
    "main tab": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "milestones",

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "Better Prestige 1",
      description: "Add 1 to base prestige point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Better Prestige 2",
      description: "Add 1 to base prestige point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Better Prestige 3",
      description: "Add 1 to base prestige point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Better Prestige 4",
      description: "Add 1 to base prestige point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Better Prestige 5",
      description: "Multiply points by *1.25",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "Better Prestige 6",
      description: "Multiply points by *1.25",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "Better Prestige 7",
      description: "Multiply points by *1.25",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    24: {
      title: "Better Prestige 8",
      description: "Multiply points by *1.25",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("sp", {
  name: "super prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["bp"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "#00ff91",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "super prestige points", // Name of prestige currency
  baseResource: "better prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.bp.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.468, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("r", 11)) mult = mult.times(3);
    if (hasUpgrade("r", 12)) mult = mult.times(3);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 3, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "s",
      description: "S: Reset for super prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.bp.unlocked;
  },
  tabFormat: {
    "main tab": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "milestones",

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "Super Prestige 1",
      description:
        "Add 1 to base better prestige point gain and 2 to point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Super Prestige 2",
      description:
        "Add 1 to base better prestige point gain and 2 to point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Super Prestige 3",
      description:
        "Add 1 to base better prestige point gain and 2 to point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Super Prestige 4",
      description:
        "Add 1 to base better prestige point gain and 2 to point gain",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Super Prestige 5",
      description:
        "Multiply point gain by *1.5 and add 1 to base prestige gain",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "Super Prestige 6",
      description:
        "Multiply point gain by *1.5 and add 1 to base prestige gain",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "Super Prestige 7",
      description:
        "Multiply point gain by *1.5 and add 1 to base prestige gain",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    24: {
      title: "Super Prestige 8",
      description:
        "Multiply point gain by *1.5 and add 1 to base prestige gain",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    31: {
      title: "Super Prestige 9",
      description: "Multiply point and prestige point gain by *1.4",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    32: {
      title: "Super Prestige 10",
      description: "Multiply point and prestige point gain by *1.4",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    33: {
      title: "Super Prestige 11",
      description: "Multiply point and prestige point gain by *1.4",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    34: {
      title: "Super Prestige 12",
      description: "Multiply point and prestige point gain by *1.4",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("r", {
  name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["sp"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "#a200ff",
  requires: new Decimal(25), // Can be a function that takes requirement increases into account
  resource: "rebirth points", // Name of prestige currency
  baseResource: "super prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.sp.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5235, // Prestige currency exponent
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
  row: 4, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "r",
      description: "R: Reset for rebirth points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.sp.unlocked;
  },
  tabFormat: {
    "main tab": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "milestones",

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "Let's Do Something Different",
      description:
        "Triple every previous layer gain and automate prestige layer",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "You Like This?",
      description:
        "Triple every previous layer gain again and automate better prestige layer",
      cost: new Decimal(2),
      unlocked() {
        return hasUpgrade("r", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "You Deserve It",
      description: "Ten-fold points and prestige points",
      cost: new Decimal(10),
      unlocked() {
        return hasUpgrade("r", 12);
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("m", {
  name: "multipliers", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["sp"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "red",
  requires: new Decimal(2500), // Can be a function that takes requirement increases into account
  resource: "multipliers", // Name of prestige currency
  baseResource: "super prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.sp.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 2,
  exponent: 1.15, // Prestige currency exponent
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
  row: 4, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "m",
      description: "M: Reset for multipliers",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.r.unlocked;
  },
  tabFormat: {
    "main tab": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "milestones",

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "Multiply, points",
      description: "Multipliers boost points",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player[this.layer].points.add(2).pow(2);
        if (ret.gte("10000")) ret = ret.sqrt().times("100");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
      tooltip: "Multipliers + 2 squared",
    },
    12: {
      title: "Multiply, prestige",
      description: "Multipliers boost super prestige points",
      cost: new Decimal(2),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player[this.layer].points.add(2).pow(3);
        if (ret.gte("10000")) ret = ret.sqrt().times("100");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
      tooltip: "Multipliers + 2 cubed",
    },
  },
});
addLayer("ac", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "🏆", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
    };
  },
  color: "yellow",

  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return true;
  },
  tabFormat: {
    achievements: {
      content: [
        "main-display",
        ["blank", "5px"], // Height

        "achievements",
      ],
    },
  },
  tooltip: "achievements",
  achievements: {
    11: {
      name: "First Reset",
      done() {
        return player.p.points.gte(1);
      }, // This one is a freebie
      tooltip: "Prestige.",
      style() {
        if (hasAchievement(this.layer, this.id))
          return {
            "background-color": "#ff0000",
          };
      },
    },
    12: {
      name: "Just Another Layer",
      done() {
        return player.bp.points.gte(1);
      }, // This one is a freebie
      tooltip: "Better prestige.",
      style() {
        if (hasAchievement(this.layer, this.id))
          return {
            "background-color": "#ff0000",
          };
      },
    },
    13: {
      name: "At Least This One Has Better Boosts...",
      done() {
        return player.sp.points.gte(1);
      }, // This one is a freebie
      tooltip: "Super prestige. <br> Reward: Add 1 to base prestige point gain",
      style() {
        if (hasAchievement(this.layer, this.id))
          return {
            "background-color": "#ff0000",
          };
      },
    },
    14: {
      name: "Wait.. This Might Be Better!",
      done() {
        return player.r.points.gte(1);
      }, // This one is a freebie
      tooltip: "Rebirth.",
      style() {
        if (hasAchievement(this.layer, this.id))
          return {
            "background-color": "#ff0000",
          };
      },
    },
    21: {
      name: "So It's A Button Simulator Now?",
      done() {
        return player.m.points.gte(1);
      }, // This one is a freebie
      tooltip: "Multiply.",
      style() {
        if (hasAchievement(this.layer, this.id))
          return {
            "background-color": "#ff5e00",
          };
      },
    },
  },
});
