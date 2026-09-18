addLayer("a", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "yellow",
  resource: "achievements", // Name of prestige currency

  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return true;
  },

  tabFormat: {
    achievements: {
      content: [
        "main-display",

        "resource-display",
        ["blank", "5px"], // Height

        "achievements",
      ],
    },
    clicks: {
      content: [
        [
          "display-text",
          function () {
            return "You have " + format(player.clicks) + " clicks";
          },
          { "font-size": "32px" },
        ],

        ["blank", "5px"], // Height

        "clickables",
        "upgrades",
      ],
    },
  },
  clickables: {
    11: {
      title: "Clicks",
      display() {
        return "Gain +" + format(player.clickgain) + " clicks.";
      },
      onClick() {
        return (player.clicks = player.clicks.plus(player.clickgain));
      },
      canClick: true,
    },
  },
  update(diff) {
    let gain = new Decimal(1);
    let auto = new Decimal(0);

    if (hasUpgrade("a", 11)) gain = gain.times(2);
    if (hasUpgrade("a", 12)) gain = gain.times(3);
    if (hasUpgrade("a", 15)) gain = gain.times(1.5);
    if (hasUpgrade("a", 23)) gain = gain.times(upgradeEffect("a", 23));

    //
    //
    if (hasUpgrade("a", 14)) gain = gain.plus(8);
    if (hasUpgrade("a", 22)) gain = gain.plus(50);

    //
    //
    //
    if (hasUpgrade("a", 13)) auto = auto.plus(10);
    if (hasUpgrade("a", 15)) auto = auto.plus(5);
    if (hasUpgrade("a", 21)) auto = auto.plus(100);

    return (
      (player.clickgain = gain),
      (player.clicks = player.clicks.plus(auto.times(diff)))
    );
  },

  upgrades: {
    11: {
      fullDisplay:
        "<h3>What...?</h3><br>Double your clicks gain.<br><br>Cost: 20 clicks",
      cost: new Decimal(0),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(20);
      },
      pay() {
        player.clicks = player.clicks.minus(20);
      },
    },
    12: {
      fullDisplay:
        "<h3>Click Upgrades?</h3><br>Triple your clicks gain.<br><br>Cost: 100 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 11);
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(100);
      },
      pay() {
        player.clicks = player.clicks.minus(100);
      },
    },
    13: {
      fullDisplay:
        "<h3>Okay...?</h3><br>Gain +10 clicks every second.<br><br>Cost: 500 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 12);
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(500);
      },
      pay() {
        player.clicks = player.clicks.minus(500);
      },
    },
    14: {
      fullDisplay:
        "<h3>This Is Like A Whole Game</h3><br>Gain +8 clicks per click, unaffected by multipliers.<br><br>Cost: 700 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 13);
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(700);
      },
      pay() {
        player.clicks = player.clicks.minus(700);
      },
    },
    15: {
      fullDisplay:
        "<h3>Bit Of Both</h3><br>Gain 1.5x more clicks and gain +5 clicks per second.<br><br>Cost: 1400 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 14);
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(1400);
      },
      pay() {
        player.clicks = player.clicks.minus(1400);
      },
    },
    21: {
      fullDisplay:
        "<h3>Idle Power</h3><br>Gain +100 clicks per second.<br><br>Cost: 3,000 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 15);
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(3000);
      },
      pay() {
        player.clicks = player.clicks.minus(3000);
      },
    },
    22: {
      fullDisplay:
        "<h3>Need More Clicks</h3><br>Gain +50 clicks per click.<br><br>Cost: 6,500 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 21);
      }, // The upgrade is only visible when this is true
      branches: [],
      canAfford() {
        return player.clicks.gte(6500);
      },
      pay() {
        player.clicks = player.clicks.minus(6500);
      },
    },
    23: {
      fullDisplay:
        "<h3>Time Boost</h3><br>Total playtime boost clicks very slowly.<br><br>Cost: 11,000 clicks",
      cost: new Decimal(0),
      unlocked() {
        return hasUpgrade("a", 22);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal(player.timePlayed).add(1).pow(0.4);
        return ret;
      },
      tooltip() {
        return "Currently: " + format(upgradeEffect("a", 23)) + "x";
      },
      branches: [],
      canAfford() {
        return player.clicks.gte(11000);
      },
      pay() {
        player.clicks = player.clicks.minus(11000);
      },
    },
  },
  achievements: {
    11: {
      name: "You Prestiged!",
      done() {
        return player.p.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get a prestige point.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    12: {
      name: "The Two Most Generic Upgrades Ever",
      done() {
        return hasUpgrade("p", 12);
      }, // This one is a freebie
      tooltip: "Buy 2 prestige upgrades.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    13: {
      name: "Triple-Digit",
      done() {
        return player.points.gte(100);
      }, // This one is a freebie
      tooltip: "Get 100 points.<br>Reward: gain 20% more points.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    14: {
      name: "Just Like The Orginal",
      done() {
        return player.sp.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get a super prestige point.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    15: {
      name: "Lucky Number Of Upgrades",
      done() {
        return hasUpgrade("sp", 12);
      }, // This one is a freebie
      tooltip: "Buy 2 super prestige upgrades.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    21: {
      name: "OUCH HOT!",
      done() {
        return player.h.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get 1 heat.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    22: {
      name: "Inflation?",
      done() {
        return hasUpgrade("h", 12);
      }, // This one is a freebie
      tooltip: "Buy 2 heat upgrades.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    23: {
      name: "Very Meta Upgrade",
      done() {
        return hasUpgrade("h", 14);
      }, // This one is a freebie
      tooltip: "Buy 4 heat upgrades.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    24: {
      name: "FINALLY!",
      done() {
        return hasUpgrade("sp", 21);
      }, // This one is a freebie
      tooltip: "Get some QOL.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    25: {
      name: "Scientific Notation",
      done() {
        return player.points.gte(1e9);
      }, // This one is a freebie
      tooltip:
        "Reach 1,000,000,000 points.<br>Reward: Shows your progress to infinity.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    31: {
      name: "Meta Upgrade V2",
      done() {
        return hasUpgrade("sp", 25);
      }, // This one is a freebie
      tooltip: "Buy super-prestige upgrade 10.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    32: {
      name: "Meta Upgrade V3",
      done() {
        return hasUpgrade("h", 25);
      }, // This one is a freebie
      tooltip: "Buy heat upgrade 10.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    33: {
      name: "NOOOOOOOOOOO OOOOOOOOOOO OOOOOOOOOOO OOOOOOOOOOO OOOOOOOOOOO",
      done() {
        return hasUpgrade("mp", 13);
      }, // This one is a freebie
      tooltip:
        "Unlock challenges. <br> Reward: I understand your pain and suffering.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    34: {
      name: "I DID IT!",
      done() {
        return hasChallenge("mp", 11);
      }, // This one is a freebie
      tooltip: "Beat MPC1.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    35: {
      name: "How Many Challenges Are There?",
      done() {
        return hasChallenge("mp", 12);
      }, // This one is a freebie
      tooltip: "Beat MPC2.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
    41: {
      name: "Heat Factories",
      done() {
        return hasUpgrade("mp", 14);
      }, // This one is a freebie
      tooltip:
        "Buy mega-prestige upgrade 4.<br>Reward: I kinda forgot to add a <i>boost</i> so uhh x2 MP.",
      onComplete() {
        return (player.a.points = player.a.points.add(1));
      },
    },
  },
});

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
  color: "cyan",
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
    if (hasUpgrade("p", 15)) mult = mult.times(3);
    if (hasUpgrade("sp", 12)) mult = mult.times(2);
    if (hasUpgrade("h", 12)) mult = mult.times(3);
    if (hasUpgrade("sp", 21)) mult = mult.times(10);
    if (hasUpgrade("mp", 12)) mult = mult.times(10);

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
    if (hasUpgrade("mp", 11)) return 0.01;
    else return 0;
  },
  doReset(resettingLayer) {
    let keep = [];
    if (hasUpgrade("sp", 21) && resettingLayer == "sp") keep.push("upgrades");
    if (hasUpgrade("sp", 21) && resettingLayer == "h") keep.push("upgrades");
    if (hasUpgrade("mp", 12)) keep.push("upgrades");

    if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
  },
  tabFormat: {
    "prestige points": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "clickables",

        ["blank", "5px"], // Height

        "upgrades",
      ],
    },
  },
  clickables: {
    11: {
      title: "Mobile QOL",
      display() {
        return "Hold to reset for prestige points.";
      },
      onHold() {
        doReset("p");
      },
      canClick: true,
    },
  },
  upgrades: {
    11: {
      title: "Point Boost",
      description: "<i>Automagically</i> double your point generation.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Prestige Based",
      description: "Boost point gain based on prestige points.",
      cost: new Decimal(3),
      unlocked() {
        return hasUpgrade("p", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(2).pow(0.499);
        if (ret.gte("1e500")) ret = ret.sqrt().times("1e250");
        if (ret.gte("1e10000")) ret = ret.sqrt().times("1e5000");

        return ret;
      },
      effectDisplay() {
        return "" + format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    13: {
      title: "I Want More Base!",
      description: "Increase your <b>base</b> point gain by 2.",
      cost: new Decimal(10),
      unlocked() {
        return hasUpgrade("p", 12);
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "What About Both?",
      description: "Double point gain <b>and</b> add 1 to base point gain.",
      cost: new Decimal(30),
      unlocked() {
        return hasUpgrade("p", 13);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "More Prestige Points",
      description:
        "Triple your prestige point gain and unlock super prestige points.",
      cost: new Decimal(100),
      unlocked() {
        return hasUpgrade("p", 14);
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("sp", {
  name: "super prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      time: new Decimal(0),
    };
  },
  color: "#0030ff",
  requires: new Decimal(1000), // Can be a function that takes requirement increases into account
  resource: "super prestige points", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.4, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("sp", 12)) mult = mult.times(2);
    if (hasUpgrade("h", 12)) mult = mult.times(3);
    if (hasUpgrade("sp", 15)) mult = mult.times(8);
    if (hasUpgrade("sp", 25)) mult = mult.times(8);
    if (hasUpgrade("h", 25)) mult = mult.times(50);
    if (hasUpgrade("mp", 11)) mult = mult.times(10);
    if (hasUpgrade("mp", 12)) mult = mult.times(10);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);

    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["p"],
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
    return hasUpgrade("p", 15) || player.sp.unlocked;
  },
  passiveGeneration() {
    return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("sp", keep);
  },
  tabFormat: {
    "super prestige points": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "clickables",

        ["blank", "5px"], // Height
        "milestones",

        "upgrades",
      ],
    },
  },
  clickables: {
    11: {
      title: "Mobile QOL",
      display() {
        return "Hold to reset for super prestige points.";
      },
      onHold() {
        doReset("sp");
      },
      canClick: true,
    },
  },
  upgrades: {
    11: {
      title: "What's Factorial?",
      description: "Multiply point gain by 4 factorial.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Multi-Boost",
      description: "Double points, prestige points, and super prestige points.",
      cost: new Decimal(2),
      unlocked() {
        return hasUpgrade("sp", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Super Boost",
      description: "Boost points based on super prestige points.",
      cost: new Decimal(8),
      unlocked() {
        return hasUpgrade("sp", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.sp.points.add(2).pow(0.64);
        if (ret.gte("1e200")) ret = ret.sqrt().times("1e100");
        if (ret.gte("1e1400")) ret = ret.sqrt().times("1e700");

        return ret;
      },
      effectDisplay() {
        return "" + format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    14: {
      title: "New Layer",
      description: "Unlock heat.",
      cost: new Decimal(20),
      unlocked() {
        return hasUpgrade("sp", 13);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "More Super",
      description: "8x super prestige point gain.",
      cost: new Decimal(1700),
      unlocked() {
        return hasUpgrade("h", 14);
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Finaly Some QOL",
      description: "Keep prestige upgrades on reset and 10x prestige points.",
      cost: new Decimal(20000),
      unlocked() {
        return hasUpgrade("sp", 15);
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "I Don't Know",
      description: "IDK, like... 30x points i guess?",
      cost: new Decimal(200000),
      unlocked() {
        return hasUpgrade("sp", 21);
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "EXPON-Wait, nvm",
      description: "Multiply points by 1.2^20.",
      cost: new Decimal(800000),
      unlocked() {
        return hasUpgrade("sp", 22);
      }, // The upgrade is only visible when this is true
    },
    24: {
      title: "X15 Points",
      description: "The title says it all.",
      cost: new Decimal(3e6),
      unlocked() {
        return hasUpgrade("sp", 23);
      }, // The upgrade is only visible when this is true
    },
    25: {
      title: "S-Tier Boost",
      description: "X8 super prestige points and unlock a few heat upgrades.",
      cost: new Decimal(1e7),
      unlocked() {
        return hasUpgrade("sp", 24);
      }, // The upgrade is only visible when this is true
    },
    31: {
      title: "Nice",
      description: "X69 points.",
      cost: new Decimal(2e17),
      unlocked() {
        return hasUpgrade("mp", 15);
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("h", {
  name: "heat", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      time: new Decimal(0),
    };
  },
  color: "#ff1f00",
  requires: new Decimal(4e6), // Can be a function that takes requirement increases into account
  resource: "heat", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.42, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("h", 12)) mult = mult.times(3);
    if (hasUpgrade("h", 23)) mult = mult.times(4);
    if (hasUpgrade("mp", 11)) mult = mult.times(5);
    if (hasUpgrade("mp", 12)) mult = mult.times(10);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);

    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["p"],
  hotkeys: [
    {
      key: "h",
      description: "H: Reset for heat",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasUpgrade("sp", 14) || player.h.unlocked;
  },
  passiveGeneration() {
    if (hasUpgrade("mp", 14)) return 1;
    else return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("h", keep);
  },
  autoUpgrade() {
    return hasUpgrade("mp", 14);
  },
  tabFormat: {
    heat: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "clickables",

        ["blank", "5px"], // Height
        "milestones",

        "upgrades",
      ],
    },
  },
  clickables: {
    11: {
      title: "Mobile QOL",
      display() {
        return "Hold to reset for heat.";
      },
      onHold() {
        doReset("h");
      },
      canClick: true,
    },
  },
  upgrades: {
    11: {
      title: "BIG BUFF",
      description: "X25 points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Boost Everything",
      description: "Triple points - heat.",
      cost: new Decimal(3),
      unlocked() {
        return hasUpgrade("h", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "More Base Would Be Nice",
      description: "Add 1,000 to base point gain.",
      cost: new Decimal(100),
      unlocked() {
        return hasUpgrade("h", 12);
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Upgrade Unlock",
      description: "Unlock some super-prestige upgrades.",
      cost: new Decimal(10000),
      unlocked() {
        return hasUpgrade("h", 13);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "Been Waiting For This, Huh?",
      description: "Points boost points cuz' why not.",
      cost: new Decimal(200e6),
      unlocked() {
        return hasUpgrade("sp", 25);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.points.add(2).pow(0.05);
        if (ret.gte("1e500")) ret = ret.sqrt().times("1e250");
        if (ret.gte("1e10000")) ret = ret.sqrt().times("1e5000");

        return ret;
      },
      effectDisplay() {
        return "" + format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    21: {
      title: "FINALY ITS USEFUL",
      description: "Heat boost points finaly.",
      cost: new Decimal(1e9),
      unlocked() {
        return hasUpgrade("h", 15);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.h.points.add(2).pow(0.2);
        if (ret.gte("1e500")) ret = ret.sqrt().times("1e250");
        if (ret.gte("1e10000")) ret = ret.sqrt().times("1e5000");

        return ret;
      },
      effectDisplay() {
        return "" + format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    22: {
      title: "Just A Boost I",
      description: "X5 points.",
      cost: new Decimal(1e10),
      unlocked() {
        return hasUpgrade("h", 21);
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "Just A Boost II",
      description: "X4 heat.",
      cost: new Decimal(3e10),
      unlocked() {
        return hasUpgrade("h", 22);
      }, // The upgrade is only visible when this is true
    },
    24: {
      title: "Just A Boost III",
      description: "X8 points.",
      cost: new Decimal(2e11),
      unlocked() {
        return hasUpgrade("h", 23);
      }, // The upgrade is only visible when this is true
    },
    25: {
      title: "Just An UNLOCK",
      description: "Unlock mega prestige and 50x SP.",
      cost: new Decimal(8e11),
      unlocked() {
        return hasUpgrade("h", 24);
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("mp", {
  name: "mega prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "MP", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      time: new Decimal(0),
    };
  },
  color: "#d54aff",
  requires: new Decimal(5e11), // Can be a function that takes requirement increases into account
  resource: "mega prestige points", // Name of prestige currency
  baseResource: "super prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.sp.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.38, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasAchievement("a", 41)) mult = mult.times(2);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);

    return exp;
  },
  row: 3, // Row the layer is in on the tree (0 is the first row)
  branches: ["sp"],
  hotkeys: [
    {
      key: "m",
      description: "M: Reset for mega prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasUpgrade("h", 25) || player.mp.unlocked;
  },
  passiveGeneration() {
    return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("mp", keep);
  },
  tabFormat: {
    "mega prestige points": {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        "clickables",

        ["blank", "5px"], // Height
        "milestones",

        "upgrades",
      ],
    },
    challenges: {
      content: [
        ["blank", "5px"], // Height

        "challenges",
      ],
    },
  },
  clickables: {
    11: {
      title: "Mobile QOL",
      display() {
        return "Hold to reset for mega prestige points.";
      },
      onHold() {
        doReset("mp");
      },
      canClick: true,
    },
  },
  upgrades: {
    11: {
      title: "Mega Upgrade",
      description:
        "X30 points, x10 super prestige points (SP), and x5 heat. Also gain 1% of prestige pts on reset.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "All The Boosts",
      description: "Keep prestige upgrades and x10 everything before MP.",
      cost: new Decimal(3),
      unlocked() {
        return hasUpgrade("mp", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Uh Oh...",
      description: "Unlock challenges.",
      cost: new Decimal(20),
      unlocked() {
        return hasUpgrade("mp", 12);
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Let's Just Auto This",
      description: "Fully automate heat.",
      cost: new Decimal(100),
      unlocked() {
        return hasChallenge("mp", 12);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "Super Extension",
      description: "Extend SP upgrades.",
      cost: new Decimal(280),
      unlocked() {
        return hasUpgrade("mp", 14);
      }, // The upgrade is only visible when this is true
    },
  },
  challenges: {
    11: {
      name: "MPC1: Let's Start Easy",
      challengeDescription: "/100 points.",
      unlocked() {
        return hasUpgrade("mp", 13);
      },
      goalDescription: "Reach 1e40 points.",
      canComplete() {
        return player.points.gte(1e40);
      },

      rewardDescription: "X100 points.",
    },
    12: {
      name: "MPC2: Removed Base",
      challengeDescription: "Base point gain is always 1.",
      unlocked() {
        return hasChallenge("mp", 11);
      },
      goalDescription: "Reach 1e42 points.",
      canComplete() {
        return player.points.gte(1e42);
      },

      rewardDescription:
        "Add 50,000 to base point gain and unlock new mega-prestige upgrades.",
    },
  },
});
