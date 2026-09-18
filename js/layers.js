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
    if (hasChallenge("p", 11)) mult = mult.times(3);
    if (hasMilestone("l", 3)) mult = mult.times(2);
    if (hasUpgrade("r", 11)) mult = mult.times(upgradeEffect("r", 11));
    if (hasUpgrade("r", 13)) mult = mult.times(upgradeEffect("r", 13));
    if (hasChallenge("r", 11)) mult = mult.times(5);
    if (hasChallenge("r", 12)) mult = mult.times(15);
    if (hasUpgrade("u", 21)) mult = mult.times(upgradeEffect("u", 21));
    if (hasMilestone("lv", 2)) mult = mult.times(1e10);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (inChallenge("r", 12)) exp = exp.times(0.6);
    if (hasMilestone("lv", 1)) exp = exp.times(1.01);
    if (hasMilestone("lv", 4)) exp = exp.times(1.05);

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
    return hasMilestone("l", 1);
  },
  passiveGeneration() {
    return hasMilestone("l", 5) ? 2 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];
    if (hasMilestone("l", 4) && resettingLayer == "r") keep.push("challenges");
    if (hasChallenge("r", 11) && resettingLayer == "r") keep.push("upgrades");

    if (hasMilestone("l", 7)) keep.push("upgrades", "challenges");

    if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
  },
  upgrades: {
    11: {
      title: "Base Increase",
      description: "Increase base point gain based on prestige points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(1).pow(0.5);
        if (hasUpgrade("r", 14)) ret = player.p.points.add(1).pow(0.64);
        return ret;
      },
      effectDisplay() {
        return "+" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    12: {
      title: "Mult Increase",
      description: "Multiply point gain based on prestige points.",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(1).pow(0.32);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    13: {
      title: "Static Increase",
      description: "Multiply points.",
      cost: new Decimal(600),
      unlocked() {
        return hasChallenge("p", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 5;
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    14: {
      title: "Genericity",
      description: "Double points per loop.",
      cost: new Decimal(4000),
      unlocked() {
        return hasChallenge("p", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal.pow(2, player.l.points);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
  },
  challenges: {
    11: {
      unlocked() {
        return hasMilestone("l", 2);
      },
      name: "Divided Points",
      challengeDescription: "Point gain is divided by 20",
      goalDescription: "Reach 100 points",
      rewardDescription: "Triple prestige points and unlock new upgrades",
      canComplete: function () {
        return player.points.gte(100);
      },
    },
  },
});
addLayer("r", {
  name: "rebirth", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["p"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
    };
  },
  color: "Purple",
  requires: new Decimal(1e5), // Can be a function that takes requirement increases into account
  resource: "rebirth points", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.35, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasMilestone("l", 4)) mult = mult.times(3);
    if (hasMilestone("l", 5)) mult = mult.times(4);
    if (hasUpgrade("s", 21)) mult = mult.times(upgradeEffect("s", 21));

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasUpgrade("s", 12)) exp = exp.times(1.05);

    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
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
    return hasMilestone("l", 3);
  },
  passiveGeneration() {
    return hasMilestone("l", 8) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];
    if (hasMilestone("l", 7) && resettingLayer == "a") keep.push("challenges");
    if (hasUpgrade("a", 14) && resettingLayer == "a") keep.push("upgrades");
    if (hasMilestone("l", 8) && resettingLayer == "a") keep.push("upgrades");
    if (hasUpgrade("a", 14) && resettingLayer == "s")
      keep.push("upgrades", "challenges");

    if (layers[resettingLayer].row > this.row) layerDataReset("r", keep);
  },
  upgrades: {
    11: {
      title: "More Prestige",
      description: "Gain more prestige points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 2.75;
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    12: {
      title: "More Points",
      description: "Gain more points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 3.25;
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    13: {
      title: "Smaller Boosts",
      description: "Gain more points and prestige points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 1.75;
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    14: {
      title: "Better Effect",
      description: "Base increase uses a better formula.",
      cost: new Decimal(3),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 0.16;
        return ret;
      },
      effectDisplay() {
        return "+" + format(this.effect()) + " exp";
      }, // Add formatting to the effect
    },
    21: {
      title: "Lucky Number",
      description: "X7.77 points.",
      cost: new Decimal(150),
      unlocked() {
        return hasMilestone("l", 4);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 7.77;
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    22: {
      title: "Small Boost",
      description: "X3.75 points.",
      cost: new Decimal(2500),
      unlocked() {
        return hasMilestone("l", 4);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 3.75;
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
  },
  challenges: {
    11: {
      unlocked() {
        return hasMilestone("l", 4);
      },
      name: "Rooted Points",
      challengeDescription: "Point gain is square rooted",
      goalDescription: "Reach 100,000 prestige points",
      rewardDescription:
        "Keep prestige upgrades on rebirth and X5 prestige points",
      canComplete: function () {
        return player.p.points.gte(1e5);
      },
    },
    12: {
      unlocked() {
        return hasMilestone("l", 4);
      },
      name: "Prestige Decrease",
      challengeDescription: "Prestige points are ^0.6",
      goalDescription: "Reach 100,000 prestige points",
      rewardDescription: "X15 prestige points",
      canComplete: function () {
        return player.p.points.gte(1e5);
      },
    },
  },
});
addLayer("u", {
  name: "upgrade points", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["p"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
    };
  },
  color: "Yellow",
  requires: new Decimal(1e18), // Can be a function that takes requirement increases into account
  resource: "upgrade points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.2, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("u", 41)) mult = mult.times(3);
    if (hasMilestone("l", 6)) mult = mult.times(4);
    mult = mult.times(buyableEffect("a", 12));
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
      key: "u",
      description: "U: Reset for upgrade points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasMilestone("l", 5);
  },
  passiveGeneration() {
    return hasMilestone("l", 8) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];
    if (hasUpgrade("a", 14) && resettingLayer == "a") keep.push("upgrades");
    if (hasUpgrade("a", 14) && resettingLayer == "s") keep.push("upgrades");

    if (layers[resettingLayer].row > this.row) layerDataReset("u", keep);
  },
  upgrades: {
    11: {
      title: "Increased Exponent",
      description: "Points are ^1.04.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 2.75;
        return ret;
      },
    },
    21: {
      title: "Prestige Increase",
      description: "X4 prestige points.",
      cost() {
        return new Decimal(2).pow(player.u.upgrades.length);
      },
      branches: [11],
      unlocked() {
        return hasUpgrade("u", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 4;
        return ret;
      },
    },
    22: {
      title: "Point Increase",
      description: "X3 points.",
      cost() {
        return new Decimal(2).pow(player.u.upgrades.length);
      },
      branches: [11],

      unlocked() {
        return hasUpgrade("u", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 3;
        return ret;
      },
    },
    31: {
      branches: [21],

      title: "Rebirth Based",
      description: "Rebirth points boost points.",
      cost() {
        return new Decimal(5).times(player.u.upgrades.length - 2);
      },
      unlocked() {
        return hasUpgrade("u", 21) && hasUpgrade("u", 22);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.r.points.add(1).pow(0.13);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    32: {
      branches: [21, 22],

      title: "Upgrade Based",
      description: "Upgrade points boost points.",
      cost() {
        return new Decimal(5).times(player.u.upgrades.length - 2);
      },
      unlocked() {
        return hasUpgrade("u", 21) && hasUpgrade("u", 22);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.u.points.add(1).pow(0.46);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    33: {
      branches: [22],

      title: "Looped Based",
      description: "Loops boost points.",
      cost() {
        return new Decimal(5).times(player.u.upgrades.length - 2);
      },
      unlocked() {
        return hasUpgrade("u", 21) && hasUpgrade("u", 22);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.l.points.add(1).pow(0.76);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    41: {
      branches: [31],

      title: "More Upgrade Points",
      description: "Triple upgrade points.",
      cost() {
        return new Decimal(45);
      },
      unlocked() {
        return hasUpgrade("u", 21) && hasUpgrade("u", 22);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 3;
        return ret;
      },
    },
  },
  tabFormat: {
    "upgrade points": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        [
          "display-text",
          function () {
            return "Be careful! Upgrade costs increase based on the amount of upgrade point upgrades you've bought and you can't respec them.";
          },
          { "font-size": "17px" },
        ],
        ["upgrade-tree", [[11], [21, 22], [31, 32, 33], [41]]],
      ],
    },
  },
});
addLayer("a", {
  name: "ascend", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["r"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
    };
  },
  color: "Orange",
  requires: new Decimal(1000), // Can be a function that takes requirement increases into account
  resource: "ascension points", // Name of prestige currency
  baseResource: "upgrade points", // Name of resource prestige is based on
  baseAmount() {
    return player.u.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.63, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("lp", 12)) mult = mult.times(upgradeEffect("lp", 12));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasMilestone("l", 7)) exp = exp.times(1.2);
    if (hasUpgrade("lp", 14)) exp = exp.times(1.07);
    if (hasUpgrade("lp", 42)) exp = exp.times(1.08);

    if (hasMilestone("l", 8)) exp = exp.pow(2);
    return exp;
  },
  row: 3, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "a",
      description: "A: Reset for ascension points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasMilestone("l", 6);
  },
  passiveGeneration() {
    return false ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("a", keep);
  },
  upgrades: {
    11: {
      title: "BIG Increase",
      description: "X100 points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 100;
        return ret;
      },
    },
    12: {
      title: "Buyable Unlock",
      description: "Unlock 2 buyables and X10 points.",
      cost: new Decimal(5),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 10;
        return ret;
      },
    },
    13: {
      title: "Upgrade Power",
      description: "Each ascension upgrade adds +^0.01 points.",
      cost: new Decimal(250e6),
      unlocked() {
        return hasMilestone("l", 7);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal(0.01).times(player.a.upgrades.length);
        return ret;
      },
      effectDisplay() {
        return "^" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    14: {
      title: "Antoher Unlock",
      description: "Unlock a new buyable and keep all upgrades on ascension.",
      cost: new Decimal(1.5e9),
      unlocked() {
        return hasMilestone("l", 7);
      }, // The upgrade is only visible when this is true
    },
  },
  buyables: {
    11: {
      title: "Repeatable Point Increase",
      cost(x) {
        return new Decimal(2).times(new Decimal.pow(2, x));
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(8, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("a", 12);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " ascension points\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/12\n\
        X" +
          format(data.effect) +
          " point gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(12),
    },
    12: {
      title: "Repeatable Upgrade Increase",
      cost(x) {
        return new Decimal(3).times(new Decimal.pow(2.7, x));
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(2.6, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("a", 12);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " ascension points\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/6\n\
        X" +
          format(data.effect) +
          " upgrade point gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(6),
    },
    13: {
      title: "Point Tripler",
      cost(x) {
        return new Decimal(400e6).times(new Decimal.pow(1.4, x.pow(1.3)));
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(3, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("a", 14);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " ascension points\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/100\n\
        X" +
          format(data.effect) +
          " point gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(100),
    },
  },
});
addLayer("s", {
  name: "shards", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["r", "u"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
    };
  },
  color: "Blue",
  requires: new Decimal("1e307"), // Can be a function that takes requirement increases into account
  resource: "shards", // Name of prestige currency
  baseResource: "rebirth points", // Name of resource prestige is based on
  baseAmount() {
    return player.r.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.006, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("s", 24)) mult = mult.times(upgradeEffect("s", 24));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasUpgrade("s", 13)) exp = exp.times(2);
    if (hasUpgrade("s", 14)) exp = exp.times(2);
    if (hasUpgrade("lp", 54)) exp = exp.times(3);
    if (hasUpgrade("s", 24)) exp = exp.times(0.5);

    return exp;
  },
  row: 3, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "s",
      description: "S: Reset for shards",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasUpgrade("lp", 43);
  },
  passiveGeneration() {
    return hasUpgrade("s", 14) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("s", keep);
  },
  upgrades: {
    11: {
      title: "More Points Needed",
      description: "^1.07 points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 100;
        return ret;
      },
    },
    12: {
      title: "More Rebirths",
      description: "^1.05 rebirth points.",
      cost: new Decimal(25),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Shard Frenzy",
      description: "Square shards.",
      cost: new Decimal(40),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "QOL",
      description: "Generate shards and square them again.",
      cost: new Decimal(120),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "Loop Boost",
      description: "Square loop power.",
      cost: new Decimal(1200),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Shards Are Useful",
      description: "Shards boost rebirth points.",
      cost: new Decimal(70e6),
      unlocked() {
        return hasUpgrade("lp", 54);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.s.points.add(1).pow(2.35);
        if (ret.gte("1e500")) ret = ret.sqrt().times("1e250");
        if (ret.gte("1e3000")) ret = ret.sqrt().times("1e1500");
        if (ret.gte("1e10000")) ret = ret.sqrt().times("1e5000");

        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    22: {
      title: "More Points",
      description: "Gain 1e100x more points.",
      cost: new Decimal(2e9),
      unlocked() {
        return hasUpgrade("lp", 54);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 1e100;
        return ret;
      },
    },
    23: {
      title: "Point Boost",
      description: "Multiply points based on shards.",
      cost: new Decimal(2e15),
      unlocked() {
        return hasUpgrade("lp", 54);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.s.points.add(1).pow(0.6);
        if (ret.gte("1e1000")) ret = ret.sqrt().times("1e500");
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    24: {
      title: "Shard Synergy",
      description: "Multiply shards based on shards but ^0.5 shards.",
      cost: new Decimal(4e15),
      unlocked() {
        return hasUpgrade("lp", 54);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.s.points.add(1).pow(0.25);
        if (ret.gte("1e50")) ret = ret.sqrt().times("1e25");
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
  },
});
addLayer("lv", {
  name: "levels", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  branches: ["u"],
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },

  color: "darkGreen",
  requires: new Decimal("1e2600"), // Can be a function that takes requirement increases into account
  resource: "levels", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 1e45,
  exponent: 1.275, // Prestige currency exponent
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
      key: "l",
      description: "L: Reset for levels",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasUpgrade("lp", 55);
  },
  resetsNothing() {
    return hasMilestone("lv", 3);
  },
  passiveGeneration() {
    return false ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("lv", keep);
  },
  milestones: {
    1: {
      requirementDescription: "1 level",
      done() {
        return player.lv.points.gte("1");
      }, // Used to determine when to give the milestone
      effectDescription: "^1.01 prestige points",
    },
    2: {
      requirementDescription: "2 levels",
      done() {
        return player.lv.points.gte("2");
      }, // Used to determine when to give the milestone
      effectDescription: "X1e10 prestige points and points",
    },
    3: {
      requirementDescription: "3 levels",
      done() {
        return player.lv.points.gte("3");
      }, // Used to determine when to give the milestone
      effectDescription: "Levels reset nothing and X1e25 points",
    },
    4: {
      requirementDescription: "4 levels",
      done() {
        return player.lv.points.gte("4");
      }, // Used to determine when to give the milestone
      effectDescription: "^1.05 prestige points",
    },
  },
});
addLayer("lp", {
  name: "loop power", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "LP", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "Grey",
  requires: new Decimal(9), // Can be a function that takes requirement increases into account
  resource: "loop power", // Name of prestige currency
  baseResource: "loops", // Name of resource prestige is based on
  baseAmount() {
    return player.l.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.8, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("lp", 13)) mult = mult.times(upgradeEffect("lp", 13));
    if (hasUpgrade("lp", 14)) mult = mult.times(upgradeEffect("lp", 14));
    if (hasUpgrade("lp", 15)) mult = mult.times(upgradeEffect("lp", 15));
    if (hasUpgrade("lp", 21)) mult = mult.times(buyableEffect("lp", 11));
    if (hasUpgrade("lp", 24)) mult = mult.times(buyableEffect("lp", 12));
    if (hasUpgrade("lp", 25)) mult = mult.times(buyableEffect("lp", 13));
    if (hasUpgrade("lp", 31)) mult = mult.times(upgradeEffect("lp", 31));
    if (hasUpgrade("lp", 33)) mult = mult.times(1e10);
    if (hasUpgrade("lp", 51)) mult = mult.times("1e500");

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (hasUpgrade("lp", 23)) exp = exp.times(1.15);
    if (hasUpgrade("lp", 32)) exp = exp.times(1.05);
    if (hasUpgrade("lp", 34)) exp = exp.times(buyableEffect("lp", 21));
    if (hasChallenge("lp", 11)) exp = exp.times(1.1);
    if (hasUpgrade("lp", 41)) exp = exp.times(upgradeEffect("lp", 41));
    if (hasUpgrade("s", 15)) exp = exp.times(2);
    if (hasUpgrade("lp", 44)) exp = exp.times(buyableEffect("lp", 22));
    if (hasUpgrade("lp", 53)) exp = exp.times(1.03);
    if (hasUpgrade("lp", 54)) exp = exp.times(1.04);
    if (hasMilestone("lp", 4)) exp = exp.times(buyableEffect("lp", 23));

    return exp;
  },
  row: 100, // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return false;
  },
  passiveGeneration() {
    return hasMilestone("l", 9) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("lp", keep);
  },
  softcap: new Decimal(1e160),
  softcapPower: new Decimal(0.7),
  upgrades: {
    11: {
      title: "Loop 11",
      description: "Loop power boosts points.",
      cost: new Decimal(40),
      unlocked() {
        return hasMilestone("l", 9);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.lp.points.add(1).pow(1.01);
        if (ret.gte("1e500")) ret = "1e500";
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    12: {
      title: "Loop 12",
      description: "Loop power boosts ascension points.",
      cost: new Decimal(45),
      unlocked() {
        return hasUpgrade("lp", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.lp.points.add(1).pow(0.75);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    13: {
      title: "Loop 13",
      description: "Loop power boosts itself.",
      cost: new Decimal(50),
      unlocked() {
        return hasUpgrade("lp", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.lp.points.add(1).pow(0.2);
        if (hasUpgrade("lp", 22)) ret = player.lp.points.add(1).pow(0.4);
        if (ret.gte(1e11)) ret = 1e11;
        if (hasUpgrade("lp", 35)) ret = player.lp.points.add(1).pow(0.13);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    14: {
      title: "Loop 14",
      description:
        "Ascension points boost loop power and ^1.07 ascension points.",
      cost: new Decimal(200),
      unlocked() {
        return hasUpgrade("lp", 13);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.a.points.add(1).pow(0.02);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    15: {
      title: "Loop 15",
      description: "Each loop upgrade doubles loop power.",
      cost: new Decimal(1400),
      unlocked() {
        return hasUpgrade("lp", 14);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal.pow(2, player.lp.upgrades.length);
        if (hasMilestone("lp", 2)) ret = ret.pow(350);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    21: {
      title: "Loop 21",
      description: "Unlock a buyable.",
      cost: new Decimal(225000),
      unlocked() {
        return hasUpgrade("lp", 15);
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "Loop 22",
      description: "Loop 13 uses a better formula.",
      cost: new Decimal(1e6),
      unlocked() {
        return hasUpgrade("lp", 21);
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "Loop 23",
      description: "Raise loop power to ^1.15.",
      cost: new Decimal(500e6),
      unlocked() {
        return hasUpgrade("lp", 22);
      }, // The upgrade is only visible when this is true
    },
    24: {
      title: "Loop 24",
      description: "Unlock another buyable.",
      cost: new Decimal(1e17),
      unlocked() {
        return hasUpgrade("lp", 23);
      }, // The upgrade is only visible when this is true
    },
    25: {
      title: "Loop 25",
      description: "Unlock yet another buyable.",
      cost: new Decimal(3e31),
      unlocked() {
        return hasUpgrade("lp", 24);
      }, // The upgrade is only visible when this is true
    },
    31: {
      title: "Loop 31",
      description: "Per loop upgrade, triple loop power.",
      cost: new Decimal(2e50),
      unlocked() {
        return hasUpgrade("lp", 25);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal.pow(3, player.lp.upgrades.length);

        if (hasMilestone("lp", 1)) ret = ret.pow(25);
        return ret;
      },
      effectDisplay() {
        return "*" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    32: {
      title: "Loop 32",
      description: "Raise loop power to ^1.05.",
      cost: new Decimal(5e75),
      unlocked() {
        return hasUpgrade("lp", 31);
      }, // The upgrade is only visible when this is true
    },
    33: {
      title: "Loop 33",
      description: "X1e10 loop power.",
      cost: new Decimal(4e92),
      unlocked() {
        return hasUpgrade("lp", 32);
      }, // The upgrade is only visible when this is true
    },
    34: {
      title: "Loop 34",
      description: "Unlock a buyable, it's different...",
      cost: new Decimal(1e136),
      unlocked() {
        return hasUpgrade("lp", 33);
      }, // The upgrade is only visible when this is true
    },
    35: {
      title: "Loop 35",
      description:
        "Remove the first hardcap of loop 13 but replace it with a softcap.",
      cost: new Decimal(1e169),
      unlocked() {
        return hasUpgrade("lp", 34);
      }, // The upgrade is only visible when this is true
    },
    41: {
      title: "Loop 41",
      description:
        "Each upgrade starting from this row raises loop power to ^1.02.",
      cost: new Decimal("1e494"),
      unlocked() {
        return hasUpgrade("lp", 35);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal.pow(1.02, player.lp.upgrades.length - 15);
        return ret;
      },
      effectDisplay() {
        return "^" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    42: {
      title: "Loop 42",
      description: "Raise ascension points to ^1.08.",
      cost: new Decimal("1e534"),
      unlocked() {
        return hasUpgrade("lp", 41);
      }, // The upgrade is only visible when this is true
    },
    43: {
      title: "Loop 43",
      description: "Unlock shards.",
      cost: new Decimal("1e595"),
      unlocked() {
        return hasUpgrade("lp", 42);
      }, // The upgrade is only visible when this is true
    },
    44: {
      title: "Loop 44",
      description: "Unlock another buyable.",
      cost: new Decimal("1e4000"),
      unlocked() {
        return hasUpgrade("lp", 43);
      }, // The upgrade is only visible when this is true
    },
    45: {
      title: "Loop 45",
      description: "nothing.",
      cost: new Decimal("1e9835"),
      unlocked() {
        return hasUpgrade("lp", 44);
      }, // The upgrade is only visible when this is true
    },
    51: {
      title: "Loop 51",
      description: "X1e500 loop power.",
      cost: new Decimal("1e10515"),
      unlocked() {
        return hasUpgrade("lp", 45);
      }, // The upgrade is only visible when this is true
    },
    52: {
      title: "Loop 52",
      description: "Unlock milestones.",
      cost: new Decimal("1e15875"),
      unlocked() {
        return hasUpgrade("lp", 51);
      }, // The upgrade is only visible when this is true
    },
    53: {
      title: "Loop 53",
      description: "Raise loop power to ^1.03.",
      cost: new Decimal("1e19250"),
      unlocked() {
        return hasUpgrade("lp", 52);
      }, // The upgrade is only visible when this is true
    },
    54: {
      title: "Loop 54",
      description: "Cube shards and unlock new upgrades.",
      cost: new Decimal("1e50215"),
      unlocked() {
        return hasUpgrade("lp", 53);
      }, // The upgrade is only visible when this is true
    },
    55: {
      title: "Loop 55",
      description: "Unlock levels.",
      cost: new Decimal("1e61816"),
      unlocked() {
        return hasUpgrade("lp", 54);
      }, // The upgrade is only visible when this is true
    },
    61: {
      title: "Loop 61",
      description: "X1e250 points.",
      cost: new Decimal("1e77945"),
      unlocked() {
        return hasUpgrade("lp", 55);
      }, // The upgrade is only visible when this is true
    },
  },
  buyables: {
    11: {
      title: "Small Loop Power Multiplier",
      cost(x) {
        return new Decimal(50000).times(new Decimal.pow(1.8, x.pow(1.18)));
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(1.25, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("lp", 21);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " loop power\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/1,000\n\
        X" +
          format(data.effect) +
          " loop power gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(1000),
    },
    12: {
      title: "Big Loop Power Multiplier",
      cost(x) {
        return new Decimal(1e17).times(new Decimal.pow(2.75, x.pow(1.1946)));
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(2, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("lp", 24);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " loop power\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/1,000\n\
        X" +
          format(data.effect) +
          " loop power gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(1000),
    },
    13: {
      title: "Huge Loop Power Multiplier",
      cost(x) {
        let cost = new Decimal(1e31).times(new Decimal.pow(8, x.pow(1.34)));
        if (cost.gte(1e50)) cost = cost.pow(1.08);
        return cost;
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(5, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("lp", 25);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " loop power\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/1,000\n\
        X" +
          format(data.effect) +
          " loop power gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(1000),
    },
    21: {
      title: "Small Exponent",
      cost(x) {
        let cost = new Decimal(3e136).times(new Decimal.pow(20, x.pow(1.3)));
        return cost;
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(1.007, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("lp", 34);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " loop power\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/50\n\
        ^" +
          format(data.effect) +
          " loop power gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(50),
    },
    22: {
      title: "Small Exponent 2",
      cost(x) {
        let cost = new Decimal("1e4000").times(
          new Decimal.pow(1000, x.pow(1.25))
        );
        return cost;
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(1.005, x);
        return eff;
      },
      unlocked() {
        return hasUpgrade("lp", 44);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " loop power\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/50\n\
        ^" +
          format(data.effect) +
          " loop power gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(50),
    },
    23: {
      title: "Large Exponent",
      cost(x) {
        let cost = new Decimal("1e67500").times(
          new Decimal.pow("1e1500", x.pow(1.45))
        );
        if (x.gte(18)) cost = cost.pow(1.0625);
        return cost;
      },
      effect(x) {
        // Effects of owning x of the items, x is a decimal

        eff = new Decimal.pow(1.01, x);
        return eff;
      },
      unlocked() {
        return hasMilestone("lp", 4);
      },
      display() {
        // Everything else displayed in the buyable button after the title
        let data = tmp[this.layer].buyables[this.id];
        return (
          "Cost: " +
          format(data.cost) +
          " loop power\n\
        Amount: " +
          player[this.layer].buyables[this.id] +
          "/100\n\
        ^" +
          format(data.effect) +
          " loop power gain "
        );
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1)
        );
      },
      purchaseLimit: new Decimal(100),
    },
  },
  clickables: {
    11: {
      title: "Fix Layer",
      display() {
        return "Click me to fix this layer if you can't buy anything";
      },
      onClick() {
        return doReset("lp");
      },
      canClick: true,
      unlocked() {
        return !hasUpgrade("lp", 11);
      },
    },
  },
  tabFormat: {
    upgrades: {
      content: [
        "main-display",
        "blank",
        ["blank", "5px"], // Height

        "upgrades",
        "clickables",
      ],
    },
    buyables: {
      content: [
        "main-display",
        "blank",
        ["blank", "5px"], // Height

        "buyables",
      ],
    },
    milestones: {
      unlocked() {
        return hasUpgrade("lp", 52);
      },
      content: [
        "main-display",
        "blank",
        ["blank", "5px"], // Height

        "milestones",
      ],
    },
    challenges: {
      content: [
        "main-display",
        "blank",
        ["blank", "5px"], // Height

        "challenges",
      ],
    },
  },
  challenges: {
    11: {
      name: "Point Leak",
      challengeDescription() {
        return "Cube root point gain after all boosts.";
      },
      unlocked() {
        return hasMilestone("l", 11);
      },
      goalDescription: "Get 1e202 points.",
      canComplete() {
        return player.points.gte("1e202");
      },

      rewardDescription: "^1.1 loop power.",
    },
  },
  milestones: {
    1: {
      requirementDescription: "1e16,668 loop power",
      done() {
        return player.lp.points.gte("1e16668");
      }, // Used to determine when to give the milestone
      effectDescription: "Raise loop 31 to ^25",
    },
    2: {
      requirementDescription: "1e22,172 loop power",
      done() {
        return player.lp.points.gte("1e22172");
      }, // Used to determine when to give the milestone
      effectDescription: "Raise loop 15 to ^350",
    },
    3: {
      requirementDescription: "1e890 shards",
      done() {
        return player.s.points.gte("1e890");
      }, // Used to determine when to give the milestone
      effectDescription: "Raise loop power to ^1.04",
    },
    4: {
      requirementDescription: "1e67760 loop power",
      done() {
        return player.lp.points.gte("1e67760");
      }, // Used to determine when to give the milestone
      effectDescription: "Unlock another buyable",
    },
  },
});
addLayer("l", {
  name: "loop", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "Grey",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "loops", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 50,
  exponent: 1.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    scaling = new Decimal(1);
    if (player.l.points.gte(4)) scaling = scaling.div(1.2);
    if (player.l.points.gte(6)) scaling = scaling.div(2.26);
    if (player.l.points.gte(8)) scaling = scaling.div(1.1);
    if (player.l.points.gte(9)) scaling = scaling.div(1.8);
    if (player.l.points.gte(10)) scaling = scaling.div(4.63);
    if (player.l.points.gte(11)) scaling = scaling.div(6);

    return scaling;
  },
  row: 100, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "L",
      description: "SHIFT + L: Get the next loop",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  bars: {
    progressToNext: {
      fillStyle: { "background-color": "Blue" },
      baseStyle: { "background-color": "grey" },
      borderStyle() {
        return {};
      },
      direction: RIGHT,
      width: 600,
      height: 35,
      progress() {
        return player.points.log(getNextAt("l"));
      },
      display() {
        return (
          "Progress to next: " +
          format(player.points.log(getNextAt("l")).times(100)) +
          "% (requires " +
          format(getNextAt("l")) +
          " points)"
        );
      },
      unlocked: true,
    },
  },
  tabFormat: {
    loops: {
      content: [
        [
          "display-text",
          function () {
            return "You are at loop " + formatWhole(player.l.points);
          },
          { "font-size": "32px" },
        ],
        "blank",
        "prestige-button",
        ["blank", "5px"], // Height
        [
          "display-text",
          function () {
            return "Loops reset everything but unlock new content";
          },
          { "font-size": "20px" },
        ],
        ["bar", "progressToNext"],
        "milestones",
      ],
    },
    "loop power": {
      unlocked() {
        return hasMilestone("l", 9);
      },
      embedLayer: "lp",

      content: [
        [
          "display-text",
          function () {
            return "You are at loop " + formatWhole(player.l.points);
          },
          { "font-size": "32px" },
        ],
        "blank",
        "prestige-button",
        ["blank", "5px"], // Height
        [
          "display-text",
          function () {
            return "Loops reset everything but unlock new content";
          },
          { "font-size": "20px" },
        ],
        ["bar", "progressToNext"],
        "milestones",
      ],
    },
  },
  milestones: {
    1: {
      requirementDescription: "Loop I",
      done() {
        return player[this.layer].points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription: "Unlock prestige.",
    },
    2: {
      requirementDescription: "Loop II",
      done() {
        return player[this.layer].points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription: "Double points and unlock a prestige challenge.",
    },
    3: {
      requirementDescription: "Loop III",
      done() {
        return player[this.layer].points.gte(3);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Unlock rebirth and double prestige points and points.",
    },
    4: {
      requirementDescription: "Loop IV",
      done() {
        return player[this.layer].points.gte(4);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Keep prestige challenges on rebirth. Unlock rebirth challenges, you don't have to do them in any order i guess. Triple rebirth points. Also unlock more rebirth upgrades.",
    },
    5: {
      requirementDescription: "Loop V",
      done() {
        return player[this.layer].points.gte(5);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Unlock upgrade points and autogain prestige points. Also X4 rebirth points.",
    },
    6: {
      requirementDescription: "Loop VI",
      done() {
        return player[this.layer].points.gte(6);
      }, // Used to determine when to give the milestone
      effectDescription: "Unlock ascension points and X4 upgrade points.",
    },
    7: {
      requirementDescription: "Loop VII",
      done() {
        return player[this.layer].points.gte(7);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Raise ascension points to ^1.2 and keep all challenges on row 2 & 3 resets. Unlock more ascension upgrades and prestige is only reset on loop.",
    },
    8: {
      requirementDescription: "Loop VIII",
      done() {
        return player[this.layer].points.gte(8);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Generate rebirth and upgrade points and keep rebirth upgrades on ascension. Square ascension point exponent.",
    },
    9: {
      requirementDescription: "Loop IX",
      done() {
        return player[this.layer].points.gte(9);
      }, // Used to determine when to give the milestone
      effectDescription: "Unlock loop power, a sub tab in loops layer.",
    },
    10: {
      requirementDescription: "Loop X",
      done() {
        return player[this.layer].points.gte(10);
      }, // Used to determine when to give the milestone
      effectDescription: "nothing...",
    },
    11: {
      requirementDescription: "Loop XI",
      done() {
        return player[this.layer].points.gte(11);
      }, // Used to determine when to give the milestone
      effectDescription: "Unlock challenges in loop power layer.",
    },
  },
  tooltip() {
    return (
      "Loop #" +
      formatWhole(player.l.points) +
      "<br> (" +
      format(player.points.log(getNextAt("l")).times(100)) +
      "%)"
    );
  },
});
addLayer("ach", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "🥇", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
    };
  },
  color: "Yellow",
  tooltip: "achievements",
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return true;
  },
  tabFormat: {
    achievements: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        ["bar", "progress"],
        "blank",
        "achievements",
      ],
    },
  },
  bars: {
    progress: {
      fillStyle: { "background-color": "green" },
      baseStyle: { "background-color": "white" },
      borderStyle() {
        return {};
      },
      direction: RIGHT,
      width: 550,
      height: 30,
      progress() {
        return new Decimal(player.ach.achievements.length).div(33);
      },
      display() {
        return (
          formatWhole(player.ach.achievements.length) +
          " / 33 achievements completed"
        );
      },
      unlocked: true,
    },
  },
  achievements: {
    11: {
      name: "Looped",
      done() {
        return player.l.points.gte(1);
      },
      tooltip: "Reach loop I.",
    },
    12: {
      name: "Half Way",
      done() {
        return player.points.gte(250);
      },
      tooltip: "Get 250 points.",
    },
    13: {
      name: "Challenges? On Row I?",
      done() {
        return player.l.points.gte(2);
      },
      tooltip: "Reach loop II.",
    },
    14: {
      name: "OH THANK GOD!",
      done() {
        return hasChallenge("p", 11);
      },
      tooltip: "Complete 'Divided Points'.",
    },
    15: {
      name: "Prestiged",
      done() {
        return hasUpgrade("p", 14);
      },
      tooltip: "Get the last prestige upgrade.",
    },
    21: {
      name: "New Layer, Yay",
      done() {
        return player.l.points.gte(3);
      },
      tooltip: "Reach loop III.",
    },
    22: {
      name: "An Upgraded Upgrade?",
      done() {
        return hasUpgrade("r", 14);
      },
      tooltip: "Buy the fourth rebirth upgrade.",
    },
    23: {
      name: "Quad-Loop",
      done() {
        return player.l.points.gte(4);
      },
      tooltip: "Reach loop IV.",
    },
    24: {
      name: "Challenger",
      done() {
        return hasChallenge("r", 11) && hasChallenge("r", 12);
      },
      tooltip: "Complete 2 rebirth challenges.",
    },
    25: {
      name: "Upgrader",
      done() {
        return hasUpgrade("r", 22);
      },
      tooltip: "Buy 6 rebirth upgrades.",
    },
    31: {
      name: "Yet Another Layer",
      done() {
        return player.l.points.gte(5);
      },
      tooltip: "Reach loop V.",
    },
    32: {
      name: "Double-Digits",
      done() {
        return player.u.points.gte(10);
      },
      tooltip: "Have 10 upgrade points.",
    },
    33: {
      name: "Now It Looks Like TPT",
      done() {
        return player.u.upgrades.length > 5;
      },
      tooltip: "Buy 3 rows of the upgrade point tree.",
    },
    34: {
      name: "It's Time For Row 3",
      done() {
        return player.a.points.gte(1);
      },
      tooltip: "Ascend.",
    },
    35: {
      name: "It's About To Get Real Fast....",
      done() {
        return hasUpgrade("a", 12);
      },
      tooltip: "Unlock the first 2 buyables.",
    },
    41: {
      name: "The Lucky Number",
      done() {
        return hasMilestone("l", 7);
      },
      tooltip: "Get loop VII.",
    },
    42: {
      name: "Carpaltunnel Prevention",
      done() {
        return hasUpgrade("a", 14);
      },
      tooltip: "Buy the 4th ascension upgrade.",
    },
    43: {
      name: "'The Ninth Dimension Doesn't Exist...'",
      done() {
        return hasMilestone("l", 9);
      },
      tooltip: "Get loop IX.",
    },
    44: {
      name: "How Many Of These Are There?",
      done() {
        return hasUpgrade("lp", 13);
      },
      tooltip: "Buy 3 loop upgrades.",
    },
    45: {
      name: "Multi-Digit Loops!",
      done() {
        return player.lp.points.gte(10);
      },
      tooltip: "Reach loop X.",
    },
    51: {
      name: "To Infinity And Beyond",
      done() {
        return player.points.gte("1.78e308");
      },
      tooltip: "Get 1.78e308 points.",
    },
    52: {
      name: "Now It's Inflated",
      done() {
        return hasUpgrade("lp", 24);
      },
      tooltip: "Buy loop 24.",
    },
    53: {
      name: "Oh No.. Not A {SOFTCAPPED}",
      done() {
        return player.lp.points.gte(1e160);
      },
      tooltip: "Get 1e160 loop power and reach the {softcap}.",
    },
    54: {
      name: "Infinite Power",
      done() {
        return player.lp.points.gte("1.78e308");
      },
      tooltip: "Get 1.78e308 loop power.",
    },
    55: {
      name: "Finally Another Reset Layer",
      done() {
        return player.s.points.gte("1");
      },
      tooltip: "Do a shard reset.",
    },
    61: {
      name: "That's Just Too Much",
      done() {
        return hasUpgrade("s", 15);
      },
      tooltip: "Buy shard upgrade 5.",
    },
    62: {
      name: "IT'S AN EVEN NUMBER!!!",
      done() {
        return player.lp.points.gte("1e4000");
      },
      tooltip: "Get 1e4,000 loop power.",
    },
    63: {
      name: "That's A Lot Of Power..",
      done() {
        return player.lp.points.gte("1e10000");
      },
      tooltip: "Get 1e10,000 loop power.",
    },
    64: {
      name: "Wait More Power Than Points?",
      done() {
        return player.lp.points.gte("1e15000");
      },
      tooltip: "Get 1e15,000 loop power.",
    },
    65: {
      name: "This Layer Has Every Feature Now",
      done() {
        return hasUpgrade("lp", 52);
      },
      tooltip: "Buy loop 52.",
    },
    71: {
      name: "Expanded Shards",
      done() {
        return hasUpgrade("lp", 54);
      },
      tooltip: "Buy loop 54.",
    },
    72: {
      name: "A New Layer? Already?",
      done() {
        return hasUpgrade("lp", 55);
      },
      tooltip: "Buy loop 55.",
    },
    73: {
      name: "How Many Rows Are There?!",
      done() {
        return hasUpgrade("lp", 61);
      },
      tooltip: "Buy loop 61.",
    },
  },
});
addLayer("mg", {
  name: "mini game", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "🕹️", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
    };
  },
  color: "white",

  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return true;
  },

  tabFormat: {
    alpha: {
      embedLayer: "mga",

      content: [
        "blank",
        "prestige-button",
        ["blank", "5px"], // Height
      ],
    },
    beta: {
      unlocked() {
        return hasUpgrade("mga", 14) || player.mgb.unlocked;
      },
      embedLayer: "mgb",

      content: [
        "blank",
        "prestige-button",
        ["blank", "5px"], // Height
      ],
    },
  },

  tooltip() {
    return "minigame";
  },
});
addLayer("mga", {
  name: "alpha", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "a", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "red",
  requires: new Decimal(1), // Can be a function that takes requirement increases into account
  resource: "alpha", // Name of prestige currency
  baseResource: "loops", // Name of resource prestige is based on
  baseAmount() {
    return player.l.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.00001, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("mga", 11)) mult = mult.times("3");
    if (hasUpgrade("mga", 12)) mult = mult.times(upgradeEffect("mga", 12));
    if (hasUpgrade("mga", 13)) mult = mult.times("4");
    if (hasUpgrade("mgb", 11)) mult = mult.times("2.5");

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);

    return exp;
  },
  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return false;
  },
  passiveGeneration() {
    return player.points.gte(0) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("mga", keep);
  },
  softcap: new Decimal("1.78e308"),
  softcapPower: new Decimal(0.8),
  upgrades: {
    11: {
      title: "Alpha 1",
      description: "Triple alpha gain.",
      cost: new Decimal(10),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 3;
        return ret;
      },
    },
    12: {
      title: "Alpha 2",
      description: "Alpha boosts alpha.",
      cost: new Decimal(50),
      unlocked() {
        return hasUpgrade("mga", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.mga.points.add(1).pow(0.3);
        return ret;
      },
    },
    13: {
      title: "Alpha 3",
      description: "Quadruple alpha gain.",
      cost: new Decimal(250),
      unlocked() {
        return hasUpgrade("mga", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 4;
        return ret;
      },
    },
    14: {
      title: "Alpha 4",
      description: "Unlock beta.",
      cost: new Decimal(1000),
      unlocked() {
        return hasUpgrade("mga", 13);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 4;
        return ret;
      },
    },
  },
  tabFormat: {
    upgrades: {
      content: [
        "main-display",
        "blank",
        ["blank", "5px"], // Height

        "upgrades",
      ],
    },
  },
});
addLayer("mgb", {
  name: "beta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "b", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "blue",
  requires: new Decimal(2500), // Can be a function that takes requirement increases into account
  resource: "beta", // Name of prestige currency
  baseResource: "alpha", // Name of resource prestige is based on
  baseAmount() {
    return player.mga.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5, // Prestige currency exponent
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
  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return false;
  },
  passiveGeneration() {
    return hasUpgrade("mga", 14) ? 1 : 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("mgb", keep);
  },
  softcap: new Decimal("1.78e308"),
  softcapPower: new Decimal(0.8),
  upgrades: {
    11: {
      title: "Beta 1",
      description: "X2.5 alpha gain.",
      cost: new Decimal(1),
      unlocked() {
        return true;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = 2.5;
        return ret;
      },
    },
  },
  tabFormat: {
    upgrades: {
      content: [
        "main-display",
        "blank",
        ["blank", "5px"], // Height

        "upgrades",
      ],
    },
  },
});
