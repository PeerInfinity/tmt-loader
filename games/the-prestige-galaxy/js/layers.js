// code shortcuts:
eff = upgradeEffect;
hu = hasUpgrade;
hm = hasMilestone;
hc = hasChallenge;
ha = hasAchievement;
ic = inChallenge;
be = buyableEffect;

// text fetures
function makeRed(c) {
  return "<bdi style='color:#CC0033'>" + c + "</bdi>";
}
function makeOrange(c) {
  return "<bdi style='color:#ff9100'>" + c + "</bdi>";
}
function makeYellow(c) {
  return "<bdi style='color:#ffdd00'>" + c + "</bdi>";
}
function makeGreen(c) {
  return "<bdi style='color:#66E000'>" + c + "</bdi>";
}
function makeBlue(c) {
  return "<bdi style='color:#3379E3'>" + c + "</bdi>";
}

function makePurple(c) {
  return "<bdi style='color:#66297D'>" + c + "</bdi>";
}
function makePink(c) {
  return "<bdi style='color:#ff00ed'>" + c + "</bdi>";
}
// layers:
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
      time: new Decimal(),
    };
  },
  infoboxes: {
    layer1info: {
      title: "Welcome To The Prestige Galaxy!",
      body: "Hello! Welcome to The Prestige Galaxy. This game will have lots of upgrades to boost progression. If you ever get stuck, check achievements, as some have rewards that will help or be required for progression. Also, if you havent already, you should play The Incremental Tree before playing this game, as this is ment to be a sequal.",
    },
  },
  passiveGeneration() {
    if (hu("s", 21)) return 0.5;
    else return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
  },
  color: "#0ded16",
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
    if (hu("p", 22)) mult = mult.times(3);
    if (hu("s", 11)) mult = mult.times(3);
    if (hu("s", 13)) mult = mult.times(4);
    if (hu("s", 15)) mult = mult.times(3);
    if (hu("s", 22)) mult = mult.times(3);
    if (hu("s", 34)) mult = mult.times(4);
    if (hu("b", 12)) mult = mult.times(100);
    if (hu("b", 21)) mult = mult.times(20);

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
  autoUpgrade() {
    return hasMilestone("b", 1) && !hu("p", 25);
  },
  tabFormat: {
    upgrades: {
      content: [
        ["infobox", "layer1info"],
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "More Points",
      description:
        "For your first upgrade, double point gain. I know, very orginal.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Prestiged Points",
      description: "Another generic one. Prestige points now boost point gain.",
      cost: new Decimal(3),
      unlocked() {
        return hu("p", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(1).pow(0.4);
        if (ret.gte("1e30")) ret = ret.sqrt().times("1e15");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    13: {
      title: "Small Boost",
      description: "A small boost of 1.6x points.",
      cost: new Decimal(10),
      unlocked() {
        return hu("p", 12);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal(1.6);
        if (hu("p", 23)) ret = new Decimal(2);
        if (hu("p", 24)) ret = new Decimal(2.3);
        if (hu("p", 25)) ret = new Decimal(2.6);

        if (hu("p", 15)) ret = ret.pow(eff("p", 15));
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    14: {
      title: "Repetition...",
      description: "Prestige points boost points, but more, and caps at 500x.",
      cost: new Decimal(25),
      unlocked() {
        return hu("p", 13);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(1).pow(0.5);
        if (ret.gte("500")) ret = new Decimal(500);
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    15: {
      title: "Boost The Boost!",
      description:
        "Wait, that's used in TPTR. Anyways, raise <b>Small Boost</b>'s effect based on prestige upgrades.",
      cost: new Decimal(250),
      unlocked() {
        return hu("p", 14);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = new Decimal(player.p.upgrades.length).pow(0.75);
        if (ha("ach", 14)) ret = ret.times(1.2);
        if (ha("ach", 21)) ret = ret.times(1.25);
        if (hu("s", 22)) ret = ret.pow(1.1);
        if (hu("s", 41)) ret = ret.pow(1.35);

        return ret;
      },
      effectDisplay() {
        return "^" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    21: {
      title: "Even More Points",
      description: "Super generic. Gain 4x as many points.",
      cost: new Decimal(1000),
      unlocked() {
        return hu("p", 15);
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "More Prestige",
      description: "Still generic... Triple prestige point gain.",
      cost: new Decimal(10000),
      unlocked() {
        return hu("p", 21);
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "Big Boost",
      description: "<b>Small Boost</b>'s effect base is 2.",
      cost: new Decimal(100000),
      unlocked() {
        return hu("p", 22);
      }, // The upgrade is only visible when this is true
    },
    24: {
      title: "Biggest Boost",
      description:
        "<b>Small Boost</b>'s effect base is 2.3. I couldn't think of anything okay?",
      cost: new Decimal(350000),
      unlocked() {
        return hu("p", 23);
      }, // The upgrade is only visible when this is true
    },
    25: {
      title: "The Last One",
      description:
        "Unlock super prestige... and <b>Small Boost</b>'s effect base is 2.6. ",
      cost: new Decimal(1e6),
      unlocked() {
        return hu("p", 24);
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("s", {
  name: "super prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      time: new Decimal(),
    };
  },
  infoboxes: {},
  color: "#3d7cf7",
  requires: new Decimal(10e6), // Can be a function that takes requirement increases into account
  resource: "super prestige points", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.52, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hu("s", 13)) mult = mult.times(2);
    if (hc("s", 11)) mult = mult.times(6);
    if (hu("s", 22)) mult = mult.times(2);
    if (hu("s", 24)) mult = mult.times(eff("s", 24));
    if (hu("b", 13)) mult = mult.times(50);
    if (hu("b", 21)) mult = mult.times(20);

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
      key: "s",
      description: "S: Reset for super prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hu("p", 25) || player.s.unlocked;
  },
  tabFormat: {
    upgrades: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "upgrades",
      ],
    },
    challenges: {
      content: [
        "main-display",
        ["blank", "5px"], // Height

        "challenges",
      ],
    },
  },
  passiveGeneration() {
    return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("s", keep);
  },
  branches: ["p"],
  upgrades: {
    11: {
      title: "Super Boost",
      description:
        "Here's 2 boosts, gain 5x more points and 3x more prestige points.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Bigerest Boost",
      description: "X10 point gain.",
      cost: new Decimal(4),
      unlocked() {
        return hu("s", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Too Many Boosts",
      description:
        "X8 point gain, x4 prestige point gain, and x2 super prestige point gain. Too many indeed.",
      cost: new Decimal(10),
      unlocked() {
        return hu("s", 12);
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Nerf Upgrade?",
      description: "Divide point gain by 0.2.",
      cost: new Decimal(50),
      unlocked() {
        return hu("s", 13);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "Challenging",
      description: "Unlock a challenge and triple prestige points.",
      cost: new Decimal(100),
      unlocked() {
        return hu("s", 14);
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Prestige Generation",
      description:
        "Generate 50% of prestige points gained per second. Been waiting for automation forever.",
      cost: new Decimal(1000),
      unlocked() {
        return hu("s", 15) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    22: {
      title: "Boost Madness",
      description:
        "X5 points, x3 prestige points, x2 SP, and raise <b>Boost The Boost</b> to ^1.1.",
      cost: new Decimal(1200),
      unlocked() {
        return hu("s", 21) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    23: {
      title: "Super Points",
      description: "SP boosts points, caps at 1,000,000x. Very super.",
      cost: new Decimal(10000),
      unlocked() {
        return hu("s", 22) && hc("s", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.s.points.add(1).pow(0.32);
        if (ret.gte("1e6")) ret = new Decimal("1e6");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    24: {
      title: "Points Super",
      description: "Points boost SP, caps at 500x. Kinda super.",
      cost: new Decimal(30000),
      unlocked() {
        return hu("s", 23) && hc("s", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.points.add(1).pow(0.03);
        if (ret.gte("500")) ret = new Decimal("500");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    25: {
      title: "Logarithmic Based Formula",
      description: "SP boosts points, again, but logarithmically.",
      cost: new Decimal(125000),
      unlocked() {
        return hu("s", 24) && hc("s", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.s.points.add(1).log(4);
        if (hu("s", 35)) ret = player.s.points.add(1).log(2);

        if (hu("s", 35)) ret = ret.pow(1.2);

        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    31: {
      title: "Bigestest Boost",
      description: "Definitly making up words. Multiply points by 50x!",
      cost: new Decimal(250000),
      unlocked() {
        return hu("s", 25) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    32: {
      title: "Boosted",
      description: "Permanetly unlock boosters.",
      cost: new Decimal(1e6),
      unlocked() {
        return hu("s", 31) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    33: {
      title: "Better Boosters",
      description: "Heard that before.. Add 1 to booster effect base.",
      cost: new Decimal(1e7),
      unlocked() {
        return hu("s", 32) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    34: {
      title: "More Prestige II",
      description:
        "Yet the genericity continues, gain 4x as many prestige points.",
      cost: new Decimal(2.5e7),
      unlocked() {
        return hu("s", 33) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    35: {
      title: "Better Log",
      description:
        "The log 4 in <b>Logarithmic Based Formula</b>'s effect is now a log 2 and effect ^1.2.",
      cost: new Decimal(200e6),
      unlocked() {
        return hu("s", 34) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    41: {
      title: "I Need More!",
      description: "Raise <b>Boost The Boost</b>'s effect to ^1.35.",
      cost: new Decimal(400e6),
      unlocked() {
        return hu("s", 35) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
    42: {
      title: "Booster Booster",
      description: "Each booster adds 0.02 to it's effect base.",
      cost: new Decimal(5e12),
      unlocked() {
        return hu("s", 41) && hc("s", 11);
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.b.points.times(0.02);

        return ret;
      },
      effectDisplay() {
        return "+" + format(this.effect()) + "";
      }, // Add formatting to the effect
    },
    43: {
      title: "Upgrade Unlock",
      description: "Unlock booster upgrades.",
      cost: new Decimal(1.3e14),
      unlocked() {
        return hu("s", 42) && hc("s", 11);
      }, // The upgrade is only visible when this is true
    },
  },
  challenges: {
    11: {
      name: "Reduced Points",
      completionLimit: 1,
      challengeDescription() {
        return (
          "Base point gain is set to 1/10,000.<br>" +
          challengeCompletions(this.layer, this.id) +
          "/" +
          this.completionLimit +
          " completions"
        );
      },
      unlocked() {
        return hasUpgrade("s", 15);
      },
      goalDescription: "Get 1e11 points.",
      canComplete() {
        return player.points.gte(1e11);
      },

      rewardDescription: "Unlock more upgrades and X6 super prestige points.",
    },
  },
});
addLayer("b", {
  name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      time: new Decimal(),
    };
  },
  infoboxes: {},
  color: "#0019ff",
  requires: new Decimal(1e25), // Can be a function that takes requirement increases into account
  resource: "boosters", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 1.25, // Prestige currency exponent
  base: 4,
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (ha("ach", 33)) mult = mult.div(4);
    if (hu("b", 14)) mult = mult.div(50);

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
  layerShown() {
    return hu("s", 32) || player.b.unlocked;
  },
  tabFormat: {
    upgrades: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "5px"], // Height

        "upgrades",
      ],
    },
    milestones: {
      content: [
        "main-display",
        "resource-display",
        ["blank", "5px"], // Height

        "milestones",
      ],
    },
  },
  effect() {
    base = new Decimal(2);
    if (hu("s", 33)) base = base.plus(1);
    if (hu("b", 15)) base = base.plus(0.5);

    if (hu("s", 42)) base = base.plus(upgradeEffect("s", 42));

    let eff = new Decimal.pow(base, player.b.points);

    return eff;
  },
  effectDescription() {
    return "boosting points by " + format(tmp.b.effect) + "x";
  },
  passiveGeneration() {
    return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("b", keep);
  },
  branches: ["p"],
  upgrades: {
    11: {
      title: "Short And Simple I",
      description: "Gain 100x more points, very short and simple.",
      cost: new Decimal(21),
      unlocked() {
        return hu("s", 43);
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Short And Simple II",
      description: "Gain 100x more prestige points, it's still short.",
      cost: new Decimal(24),
      unlocked() {
        return hu("b", 11);
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Short And Simple III",
      description: "Gain 50x more SP, this is the most generic game ever.",
      cost: new Decimal(25),
      unlocked() {
        return hu("b", 12);
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Short And Simple IV",
      description: "Boosters are 50x cheaper.",
      cost: new Decimal(26),
      unlocked() {
        return hu("b", 13);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "Short And Simple V",
      description: "Add 0.5 to the booster effect base.",
      cost: new Decimal(28),
      unlocked() {
        return hu("b", 14);
      }, // The upgrade is only visible when this is true
    },
    21: {
      title: "Everything Boost",
      description: "Gain 20x more points, prestige points, and SP.",
      cost: new Decimal(31),
      unlocked() {
        return ha("ach", 43);
      }, // The upgrade is only visible when this is true
    },
  },
  milestones: {
    1: {
      requirementDescription: "7 boosters",
      effectDescription: "Autobuy the first 2 rows of prestige upgrades.",
      done() {
        return player.b.points.gte(7);
      },
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
  infoboxes: {
    achievementInfo: {
      title: "Achievements",
      body: "These are achievements. Some are just for flexing, and others are very important. Sometimes achievements can give <b>rewards</b>, so check them when you feel stuck. Achievements are only reset on <b>hard resets</b>, so you'll never lose them. This layer also contains a progress bar that shows how close you are to the endgame.",
    },
  },
  color: "yellow",

  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return true;
  },
  tabFormat: [
    "main-display",
    "blank",
    [
      "display-text",
      function () {
        return (
          "ACHIEVEMENT INFO:<br>Some achievements give rewards, so it's worth tring to get them. Some achievements have a " +
          makeRed("c") +
          makeOrange("o") +
          makeYellow("l") +
          makeGreen("o") +
          makeBlue("r") +
          makePurple("e") +
          makePink("d") +
          " border:<br>" +
          "\u2022Achievements with a " +
          makeRed("red") +
          " border are starts of a major layer.<br>\u2022Achievements with a " +
          makeBlue("blue") +
          " border are endgames of a content update.<br>\u2022Achievements with a " +
          makeGreen("green") +
          " border unlock things."
        );
      },
      {},
    ],
    "blank",
    ["bar", "progress"],
    "blank",
    "achievements",
  ],
  bars: {
    progress: {
      fillStyle: { "background-color": "yellow" },
      baseStyle: { "background-color": "white" },
      textStyle: { color: "black" },
      borderStyle() {
        return {};
      },
      direction: RIGHT,
      width: 600,
      height: 30,
      progress() {
        return new Decimal(player.ach.achievements.length).div(19);
      },
      display() {
        return (
          "You have completed " +
          formatWhole(player.ach.achievements.length) +
          " / 19 achievements"
        );
      },
      unlocked: true,
    },
  },
  tooltip: "achievements",
  achievements: {
    11: {
      name: "First Reset",
      done() {
        return player.p.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get a prestige point.",
      style() {
        return {
          border: "3px solid",
          "border-color": "red",
        };
      },
    },
    12: {
      name: "The Achievement Galaxy",
      done() {
        return hu("p", 12);
      }, // This one is a freebie
      tooltip: "Buy 2 prestige upgrades.",
    },
    13: {
      name: "Repeting Things? Already?",
      done() {
        return hu("p", 14);
      }, // This one is a freebie
      tooltip: "Buy 4 prestige upgrades.",
    },
    14: {
      name: "Point City",
      done() {
        return player.points.gte(50000);
      }, // This one is a freebie
      tooltip:
        "get 50,000 points. <br> Reward: <b>Boost The Boost</b> is 20% stronger.",
    },
    15: {
      name: "One Layer Down",
      done() {
        return hu("p", 25);
      }, // This one is a freebie
      tooltip: "Unlock super prestige.",
    },
    21: {
      name: "Almost There...",
      done() {
        return player.p.points.gte(2.5e6);
      }, // This one is a freebie
      tooltip:
        "Get 2,500,000 prestige points. <br> Reward: <b>Boost The Boost</b>'s effect is 25% stronger.",
    },
    22: {
      name: "Super Reset",
      done() {
        return player.s.points.gte(1);
      }, // This one is a freebie
      tooltip: "Super prestige.",
      style() {
        return {
          border: "3px solid",
          "border-color": "red",
        };
      },
    },
    23: {
      name: "These Upgrades Are Super",
      done() {
        return hu("s", 13);
      }, // This one is a freebie
      tooltip: "Buy super prestige upgrade 3.",
      style() {
        return {
          border: "3px solid",
          "border-color": "blue",
        };
      },
    },
    24: {
      name: "That Was Painful",
      done() {
        return hc("s", 11);
      }, // This one is a freebie
      tooltip: "Complete the first super prestige challenge.",
    },
    25: {
      name: "Finaly Some Automation",
      done() {
        return hu("s", 21);
      }, // This one is a freebie
      tooltip: "Start generating prestige points.",
    },
    31: {
      name: "Reversed Upgrade",
      done() {
        return hu("s", 24);
      }, // This one is a freebie
      tooltip: "Buy <b>Points Super</b>.",
    },
    32: {
      name: "Time For Something New",
      done() {
        return hu("s", 32);
      }, // This one is a freebie
      tooltip: "Buy <b>Boosted</b>.<br> Reward: Gain 8x more points.",
      style() {
        return {
          border: "3px solid",
          "border-color": "red",
        };
      },
    },
    33: {
      name: "So Many Points",
      done() {
        return player.points.gte(1e27);
      }, // This one is a freebie
      tooltip: "Get 1e27 points.<br> Reward: Boosters are 4x cheaper.",
    },
    34: {
      name: "Unlucky",
      done() {
        return player.b.points.gte(6);
      }, // This one is a freebie
      tooltip: "Get 6 boosters.",
      style() {
        return {
          border: "3px solid",
          "border-color": "blue",
        };
      },
    },
    35: {
      name: "That Was OP",
      done() {
        return hu("s", 41);
      }, // This one is a freebie
      tooltip: "Get <b>I Need More</b>.",
    },
    41: {
      name: "It's Very Simple...",
      done() {
        return hu("b", 11);
      }, // This one is a freebie
      tooltip: "Get <b>Short And Simple I</b>.",
    },
    42: {
      name: "Short And Simple Row",
      done() {
        return hu("b", 15);
      }, // This one is a freebie
      tooltip: "Get every <b>Short And Simple </b> upgrade.",
    },
    43: {
      name: "Let's Go To The Next Row",
      done() {
        return player.b.points.gte(30);
      }, // This one is a freebie
      tooltip:
        "Get 30 boosters.<br> Reward: Unlock the next row of booster upgrades.",
      style() {
        return {
          border: "3px solid",
          "border-color": "green",
        };
      },
    },
    44: {
      name: "Booster Madness",
      done() {
        return player.b.points.gte(33);
      }, // This one is a freebie
      tooltip: "Get 33 boosters.",
      style() {
        return {
          border: "3px solid",
          "border-color": "blue",
        };
      },
    },
  },
});
