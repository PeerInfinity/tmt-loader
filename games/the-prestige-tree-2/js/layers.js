function makeRed(c) {
  return "<bdi style='color:#CC0033'>" + c + "</bdi>";
}

function makeBlue(c) {
  return "<bdi style='color:#3379E3'>" + c + "</bdi>";
}

function makeGreen(c) {
  return "<bdi style='color:#66E000'>" + c + "</bdi>";
}

function makePurple(c) {
  return "<bdi style='color:#66297D'>" + c + "</bdi>";
}
addLayer("p", {
  name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      time: new Decimal(0),
      power: new Decimal(0),
    };
  },
  color: "#00aeff",
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

    if (hasUpgrade("p", 23)) mult = mult.times(2);
    if (hasUpgrade("g", 11)) mult = mult.times(4);
    if (hasUpgrade("e", 11)) mult = mult.times(25);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
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
  passiveGeneration() {
    return hasMilestone("g", 2) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];
    if (hasMilestone("b", 1) && resettingLayer == "b") keep.push("upgrades");
    if (hasMilestone("g", 1) && resettingLayer == "g") keep.push("upgrades");

    if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
  },
  resetsNothing() {
    return false;
  },
  buyMax() {
    return false;
  },
  autoPrestige() {
    return false;
  },
  upgrades: {
    11: {
      title: "Let's Start Simple",
      description: "Double your point gain.",
      cost: new Decimal(1),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Better Base",
      description: "Add 1 to base point gain.",
      cost: new Decimal(3),
      unlocked() {
        return hasUpgrade("p", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Prestige Based",
      description: "Prestige points boost points.",
      cost: new Decimal(10),
      unlocked() {
        return hasUpgrade("p", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(1).pow(0.35);
        if (ret.gte("1e4000")) ret = ret.sqrt().times("1e2000");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    14: {
      title: "More Base",
      description: "Add 1 to base point gain again.",
      cost: new Decimal(100),
      unlocked() {
        return hasUpgrade("p", 13);
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Better Multiplier",
      description: "Double your point gain again.",
      cost: new Decimal(3),
      unlocked() {
        return hasUpgrade("p", 11);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.points.gte(50);
      },
      currencyDisplayName: "prestige points and 50 points", // Use if using a nonstandard currency
    },
    22: {
      title: "Upgrade Power",
      description: "Prestige upgrades bought boosts point gain.",
      cost: new Decimal(10),
      unlocked() {
        return hasUpgrade("p", 12);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.points.gte(250);
      },
      currencyDisplayName: "prestige points and 250 points", // Use if using a nonstandard currenc
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal.pow(1.18, player.p.upgrades.length);
        if (hasUpgrade("b", 22)) ret = ret.pow(3);
        if (hasUpgrade("g", 22)) ret = ret.pow(upgradeEffect("g", 22));
        if (hasUpgrade("p", 32)) ret = ret.pow(2.146);

        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effecty
    },
    23: {
      title: "Let's Start Less Simple",
      description: "Double your prestige point gain.",
      cost: new Decimal(100),
      unlocked() {
        return hasUpgrade("p", 13);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.points.gte(2000);
      },
      currencyDisplayName: "prestige points and 2,000 points", // Use if using a nonstandard currenc
    },
    24: {
      title: "Layer Unlock",
      description: "Unlock 2 new layers, boosters and generators.",
      cost: new Decimal(500),
      unlocked() {
        return hasUpgrade("p", 14) && hasUpgrade("p", 23);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.points.gte(10000);
      },
      currencyDisplayName: "prestige points and 10,000 points", // Use if using a nonstandard currenc
    },
    31: {
      title: "More Row 2 Power",
      description: "Add 0.4 to booster and generator effect bases.",
      cost: new Decimal(3e15),
      unlocked() {
        return hasUpgrade("e", 11) && hasUpgrade("p", 21);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.points.gte(1e22);
      },
      currencyDisplayName: "prestige points and 1e22 points", // Use if using a nonstandard currenc
    },
    32: {
      title: "Super Upgrade Power",
      description: "Raise <b>Upgrade Power</b>'s effect to 2.146.",
      cost: new Decimal(3e17),
      unlocked() {
        return hasUpgrade("e", 11) && hasUpgrade("p", 22);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.b.points.gte(25);
      },
      currencyDisplayName: "prestige points and 25 boosters", // Use if using a nonstandard currenc
    },
    33: {
      title: "Generation Generated",
      description: "Raise <b>Generated Generation</b>'s effect to 1.46.",
      cost: new Decimal(1e25),
      unlocked() {
        return hasUpgrade("e", 11) && hasUpgrade("p", 23);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.g.points.gte(28);
      },
      currencyDisplayName: "prestige points and 28 generators", // Use if using a nonstandard currenc
    },
    34: {
      title: "Multiplied Boost",
      description: "Multiply the booster effect base by 1.3.",
      cost: new Decimal(1e27),
      unlocked() {
        return hasUpgrade("e", 11) && hasUpgrade("p", 24);
      }, // The upgrade is only visible when this is true
      canAfford() {
        return player.g.power.gte(5e10);
      },
      currencyDisplayName: "prestige points and 5e10 generator power", // Use if using a nonstandard currenc
    },
  },
});
addLayer("b", {
  name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      time: new Decimal(0),
      power: new Decimal(0),
    };
  },
  color: "#0003ff",
  requires: new Decimal(5000), // Can be a function that takes requirement increases into account
  resource: "boosters", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 3,
  exponent: 1.25, // Prestige currency exponent
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
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "b",
      description: "B: Reset for boosters",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  tooltipLocked: "LOCKED<br>Reach 5,000 points to unlock",

  branches: ["p"],
  layerShown() {
    return hasUpgrade("p", 24) || player.b.unlocked;
  },
  passiveGeneration() {
    return false ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("b", keep);
  },
  resetsNothing() {
    return false;
  },
  buyMax() {
    return false;
  },
  autoPrestige() {
    return false;
  },
  effect() {
    base = new Decimal(2);
    if (hasUpgrade("b", 12)) base = base.add(0.35);
    if (hasUpgrade("p", 31)) base = base.add(0.4);

    if (hasUpgrade("p", 34)) base = base.times(1.3);

    let eff = new Decimal.pow(base, player.b.points);

    return eff;
  },
  effectDescription() {
    return "which boost point gain by " + format(tmp.b.effect) + "x";
  },
  milestones: {
    1: {
      requirementDescription: "6 boosters",
      effectDescription: "Keep prestige upgrades on reset.",
      done() {
        return player.b.points.gte(6);
      },
    },
  },
  upgrades: {
    11: {
      title: "Best Effect",
      description: "Best boosters boosts points.",
      cost: new Decimal(3),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.b.best.add(1).pow(1);
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effecty
    },
    12: {
      title: "Better Effect",
      description: "Add 0.35 to the booster effect base.",
      cost: new Decimal(7),
      unlocked() {
        return player.g.unlocked;
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Boost To Generators",
      description: "Raise the generator power effect to ^1.5.",
      cost: new Decimal(8),
      unlocked() {
        return player.g.unlocked;
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "Boost The Upgrade",
      description: "Cube <b>Upgrade Power</b>'s effect.",
      cost: new Decimal(10),
      unlocked() {
        return player.g.unlocked;
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("g", {
  name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      time: new Decimal(0),
      power: new Decimal(0),
    };
  },
  color: "#00d957",
  requires: new Decimal(1e6), // Can be a function that takes requirement increases into account
  resource: "generators", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 5,
  exponent: 1.2, // Prestige currency exponent
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
  tooltipLocked: "LOCKED<br>Reach 1,000,000 points to unlock",
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "g",
      description: "G: Reset for generators",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  branches: ["p"],
  layerShown() {
    return hasUpgrade("p", 24) || player.b.unlocked;
  },
  passiveGeneration() {
    return false ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];
    player.g.power = new Decimal(0);

    if (layers[resettingLayer].row > this.row) layerDataReset("g", keep);
  },
  resetsNothing() {
    return false;
  },
  buyMax() {
    return false;
  },
  autoPrestige() {
    return false;
  },
  effect() {
    base = new Decimal(2);
    if (hasUpgrade("g", 12)) base = base.add(1.5);
    if (hasUpgrade("p", 31)) base = base.add(0.4);

    let eff = player.g.points.pow(base.pow(1.05));
    if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
    return eff;
  },
  effectDescription() {
    return (
      "which generates " +
      format(tmp.g.effect) +
      " generator power every second"
    );
  },
  powerEff() {
    let eff = player.g.power.add(1).pow(0.5);
    if (hasUpgrade("b", 21)) eff = eff.pow(1.5);
    return eff;
  },
  update(diff) {
    if (player.g.unlocked)
      return (player.g.power = player.g.power.plus(tmp.g.effect.times(diff)));
  },
  milestones: {
    1: {
      requirementDescription: "7 generators",
      effectDescription: "Keep prestige upgrades on reset.",
      done() {
        return player.g.points.gte(7);
      },
    },
    2: {
      requirementDescription: "10 generators",
      effectDescription: "Gain 100% of prestige points on reset per second.",
      done() {
        return player.g.points.gte(10);
      },
    },
  },
  upgrades: {
    11: {
      title: "Prestige Booster",
      description: "Gain 4x more prestige points.",
      cost: new Decimal(3),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Better Generation",
      description: "Add 1.5 to generator effect base.",
      cost: new Decimal(8),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Generated Generation",
      description: "Generator power boosts its own gain at a reduced rate.",
      cost: new Decimal(10),
      unlocked() {
        return hasUpgrade("g", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.g.power.add(1).pow(0.2);
        if (hasUpgrade("p", 33)) ret = ret.pow(1.46);
        if (ret.gte("1e308")) ret = ret.sqrt().times("1e154");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
      canAfford() {
        return player.g.power.gte(250000);
      },
      currencyDisplayName: "generators and 250,000 generator power", // Use if using a nonstandard currency
    },
    22: {
      title: "Generated Upgrade",
      description: "Generator power boosts <b>Upgrade Power</b>.",
      cost: new Decimal(13),
      unlocked() {
        return hasUpgrade("g", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.g.power.add(1).log(1e6).pow(0.8);
        return ret.add(0.88);
      },
      effectDisplay() {
        return "^" + format(this.effect()) + "";
      }, // Add formatting to the effect
      canAfford() {
        return player.g.power.gte(5e6);
      },
      currencyDisplayName: "generators and 5,000,000 generator power", // Use if using a nonstandard currency
    },
  },
  tabFormat: {
    main: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.g.power) +
              " generator power, which boosts point gain by " +
              format(tmp.g.powerEff) +
              "x"
            );
          },
          { "font-size": "18px" },
        ],
        "milestones",
        "blank",
        "upgrades",
        "challenges",
      ],
    },
  },
});
addLayer("e", {
  name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      time: new Decimal(0),
      power: new Decimal(0),
    };
  },
  color: "#f601d6",
  requires: new Decimal(1e25), // Can be a function that takes requirement increases into account
  resource: "enhance points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.045, // Prestige currency exponent
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
  row: 3, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "e",
      description: "E: Reset for enhance points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  tooltipLocked: "LOCKED<br>Reach 1e25 points to unlock",

  branches: ["g", "b"],
  layerShown() {
    return player.b.unlocked && player.g.unlocked;
  },
  passiveGeneration() {
    return false ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("e", keep);
  },
  resetsNothing() {
    return false;
  },
  buyMax() {
    return false;
  },
  autoPrestige() {
    return false;
  },

  upgrades: {
    11: {
      title: "Prestige Enhancement",
      description:
        "Gain 25x more prestige points and unlock a new row of upgrades.",
      cost: new Decimal(1),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("ach", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
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
  bars: {
    longBoi: {
      fillStyle: { "background-color": "yellow" },
      baseStyle: { "background-color": "white" },
      textStyle: { color: "black" },
      borderStyle() {
        return {};
      },
      direction: RIGHT,
      width: 500,
      height: 30,
      progress() {
        return new Decimal(player.ach.achievements.length).div(11);
      },
      display() {
        return (
          "You have completed " +
          formatWhole(player.ach.achievements.length) +
          " / 11 achievements"
        );
      },
      unlocked: true,
    },
  },
  tooltip: "Achievements",
  tabFormat: {
    achievements: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        ["bar", "longBoi"],
        "achievements",
      ],
    },
  },
  achievements: {
    11: {
      name: "Prestigous",
      done() {
        return player.p.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get a prestige point.",
    },
    12: {
      name: "I Will Have All The Upgrades",
      done() {
        return new Decimal(player.p.upgrades.length).gte(5);
      }, // This one is a freebie
      tooltip: "Have 5 prestige upgrades.",
    },
    13: {
      name: "Prestige City",
      done() {
        return player.p.points.gte(25);
      }, // This one is a freebie
      tooltip: "Get 25 prestige points. <br> Reward: Gain 25% more points.",
    },
    14: {
      name: "Time For Something New",
      done() {
        return hasUpgrade("p", 24);
      }, // This one is a freebie
      tooltip: "Have every prestige upgrade.",
    },
    15: {
      name: "Tri-Booster",
      done() {
        return player.b.points.gte(3);
      }, // This one is a freebie
      tooltip: "Get 3 boosters.",
    },
    21: {
      name: "Generated Progress",
      done() {
        return player.g.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get a generator.",
    },
    22: {
      name: "Millionair",
      done() {
        return player.p.points.gte(1e6);
      }, // This one is a freebie
      tooltip: "Get 1,000,000 prestige points.",
    },
    23: {
      name: "Booster Madness",
      done() {
        return new Decimal(player.b.upgrades.length).gte(4);
      }, // This one is a freebie
      tooltip: "Have 4 booster upgrades.",
    },
    24: {
      name: "Generator Madness",
      done() {
        return new Decimal(player.g.upgrades.length).gte(4);
      }, // This one is a freebie
      tooltip: "Have 4 generator upgrades.",
    },
    25: {
      name: "Enhanced Gameplay",
      done() {
        return player.e.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get an enhance point.",
    },
    31: {
      name: "Layer Madness",
      done() {
        return new Decimal(player.p.upgrades.length).gte(12);
      }, // This one is a freebie
      tooltip: "Have 12 prestige upgrades.",
    },
  },
});

