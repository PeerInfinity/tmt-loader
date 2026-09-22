addLayer("hm", {
  name: "Heavy Multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "HVM", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      tensionunlocked: false,
      cosineunlocked: false,
      sineunlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
      atomicm: new Decimal(0),
      verysmallwave: new Decimal(0),
      smallwave: new Decimal(0),
      smallmediumwave: new Decimal(0),
      mediumwave: new Decimal(0),
      mediumlargewave: new Decimal(0),
      largewave: new Decimal(0),
      atomicmMultiplier() {
        if (this.atomicm.lt(2)) {
          return new Decimal(1).plus(this.atomicm);
        }
        if (this.atomicm.gte(2)) {
          return new Decimal(1).plus(this.atomicm.pow(0.8));
        }
      },
      hatomMultiplier() {
        if (player.ct.hatom.lt(2)) {
          return new Decimal(1).plus(player.ct.hatom);
        }
        if (player.ct.hatom.gte(2)) {
          return new Decimal(1).plus(player.ct.hatom.pow(0.8));
        }
      },
      countable: 0,
      clickableVariable: false,
      clickableLetter: "a",
      x: 0,
      y: 1,

      keepMUpgrades: false,
      keepVUpgrades: false,
      keepHMilestones: false,
      keepQUpgrades: false,
    };
  },
  color: "#252525",
  requires: new Decimal(21), // Can be a function that takes requirement increases into account
  resource: "Heavy Multipliers", // Name of prestige currency
  baseResource: "Hyper Multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.h.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [
      "keepMUpgrades",
      "keepQUpgrades",
      "keepVUpgrades",
      "keepHMilestones",
      "verysmallwave",
      "smallwave",
      "smallmediumwave",
      "mediumwave",
      "mediumlargewave",
      "largewave",
      "countable",
      "atomicm",
      "clickables",
      "clickableVariable",
      "clickableLetter",
      "x",
      "y",
      "tensionunlocked",
      "cosineunlocked",
    ];
    if (hasUpgrade("mm", 12) || hasMilestone("ct", 3)) {
      keep.push("upgrades", "milestones");
    }
    keep.push("variable");
    if (layers[reset].row > this.row) {
      layerDataReset("hm", keep);
    }
  },
  update() {
    if (player.m.points.gte(1e9) || player.hm.points >= 1) {
      player.hm.variable = new Decimal(1);
    }
    if (hasUpgrade("mm", 11)) {
      player.hm.points = player.hm.points.plus(0.01);
    }
  },

  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (player.chm.heavyTrox.gte(1))
      mult = mult.times(player.chm.hTroxMultiplierFunction());
    if (player.ct.bdust.gte(1)) mult = mult.times(player.ct.bdustEffect1());
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("mm", 11)) mult = mult.times(3);
      if (hasUpgrade("mm", 21)) mult = mult.times(2);
    }
    if (hasUpgrade("d", 42)) mult = mult.times(10);
    return mult;
  },
  passiveGeneration() {
    if (hasUpgrade("mm", 11)) return 1;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  nodeStyle() {
    let style = {
      "border-radius": "0px",
      width: "125px",
      height: "125px",
      "background-image": "linear-gradient( #3b3b3b, #1c1c1c)",
      "border-color": "rgb(34, 34, 34)",
      "font-size": "50px",
    };
    if (tmp.hm.canReset || player.hm.unlocked) {
      return { ...style };
    } else
      return {
        "font-size": "50px",
        "border-radius": "0px",
        width: "125px",
        height: "125px",
      };
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["h", "v"],
  hotkeys: [
    {
      key: "shift + h",
      description: "Shift + H: Reset for Heavy Multipliers",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.v.unlocked;
  },
  clickables: {
    11: {
      title:
        "Click me to change wether or not you convert from a quark into a wave",
      display() {},
      onClick() {
        if (player.hm.countable < 1) {
          player.hm.clickableVariable = true;
          player.hm.countable++;
        }
        player.hm.clickableVariable = !player.hm.clickableVariable;
      },
      canClick() {
        return true;
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
    12: {
      title: "Click me to change type of quark/wave being converted",
      display() {
        return "Click me to change type of quark/wave being converted";
      },
      onClick() {
        player.hm.x++;
        if (player.hm.x == 1) {
          player.hm.clickableLetter = "b";
        }
        if (player.hm.x == 2) {
          player.hm.clickableLetter = "c";
        }
        if (player.hm.x == 3) {
          player.hm.clickableLetter = "d";
        }
        if (player.hm.x == 4) {
          player.hm.clickableLetter = "e";
        }
        if (player.hm.x == 5) {
          player.hm.clickableLetter = "f";
        }
        if (player.hm.x == 6) {
          player.hm.clickableLetter = "a";
          player.hm.x = 0;
        }
      },
      canClick() {
        return true;
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
    13: {
      title: "Click me to convert!",
      display() {
        if (player.hm.clickableVariable == false) {
          if (player.hm.clickableLetter == "a") {
            return "1 up quark to 1 very small wave";
          }
          if (player.hm.clickableLetter == "b") {
            return "1 down quark to 1 small wave";
          }
          if (player.hm.clickableLetter == "c") {
            return "1 strange quark to 1 small medium wave";
          }
          if (player.hm.clickableLetter == "d") {
            return "1 charm quark to 1 medium wave";
          }
          if (player.hm.clickableLetter == "e") {
            return "1 top quark to 1 medium large wave";
          }
          if (player.hm.clickableLetter == "f") {
            return "1 bottom quark to 1 large wave";
          }
        } else {
          if (player.hm.clickableLetter == "a") {
            return "1 very small wave to 1 up quark";
          }
          if (player.hm.clickableLetter == "b") {
            return "1 small wave to 1 down quark";
          }
          if (player.hm.clickableLetter == "c") {
            return "1 small medium wave to 1 strange quark";
          }
          if (player.hm.clickableLetter == "d") {
            return "1 medium wave to 1 charm quark";
          }
          if (player.hm.clickableLetter == "e") {
            return "1 medium large wave to 1 top quark";
          }
          if (player.hm.clickableLetter == "f") {
            return "1 large wave to 1 bottom quark";
          }
        }
      },
      onClick() {
        if (player.hm.clickableVariable == false) {
          if (player.hm.clickableLetter == "a") {
            player.q.uq = player.q.uq.sub(1);
            player.hm.verysmallwave = player.hm.verysmallwave.add(1);
          }
          if (player.hm.clickableLetter == "b") {
            player.q.dq = player.q.dq.sub(1);
            player.hm.smallwave = player.hm.smallwave.add(1);
          }
          if (player.hm.clickableLetter == "c") {
            player.q.sq = player.q.sq.sub(1);
            player.hm.smallmediumwave = player.hm.smallmediumwave.add(1);
          }
          if (player.hm.clickableLetter == "d") {
            player.q.cq = player.q.cq.sub(1);
            player.hm.mediumwave = player.hm.mediumwave.add(1);
          }
          if (player.hm.clickableLetter == "e") {
            player.q.tq = player.q.tq.sub(1);
            player.hm.mediumlargewave = player.hm.mediumlargewave.add(1);
          }
          if (player.hm.clickableLetter == "f") {
            player.q.bq = player.q.bq.sub(1);
            player.hm.largewave = player.hm.largewave.add(1);
          }
        } else {
          if (player.hm.clickableLetter == "a") {
            player.q.uq = player.q.uq.add(1);
            player.hm.verysmallwave = player.hm.verysmallwave.sub(1);
          }
          if (player.hm.clickableLetter == "b") {
            player.q.dq = player.q.dq.add(1);
            player.hm.smallwave = player.hm.smallwave.sub(1);
          }
          if (player.hm.clickableLetter == "c") {
            player.q.sq = player.q.sq.add(1);
            player.hm.smallmediumwave = player.hm.smallmediumwave.sub(1);
          }
          if (player.hm.clickableLetter == "d") {
            player.q.cq = player.q.cq.add(1);
            player.hm.mediumwave = player.hm.mediumwave.sub(1);
          }
          if (player.hm.clickableLetter == "e") {
            player.q.tq = player.q.tq.add(1);
            player.hm.mediumlargewave = player.hm.mediumlargewave.sub(1);
          }
          if (player.hm.clickableLetter == "f") {
            player.q.bq = player.q.bq.add(1);
            player.hm.largewave = player.hm.largewave.sub(1);
          }
        }
      },
      canClick() {
        if (player.hm.clickableVariable == false) {
          if (player.hm.clickableLetter == "a") {
            return player.q.uq.gte(1);
          }
          if (player.hm.clickableLetter == "b") {
            return player.q.dq.gte(1);
          }
          if (player.hm.clickableLetter == "c") {
            return player.q.sq.gte(1);
          }
          if (player.hm.clickableLetter == "d") {
            return player.q.cq.gte(1);
          }
          if (player.hm.clickableLetter == "e") {
            return player.q.tq.gte(1);
          }
          if (player.hm.clickableLetter == "f") {
            return player.q.bq.gte(1);
          }
        } else {
          if (player.hm.clickableLetter == "a") {
            return player.hm.verysmallwave.gte(1);
          }
          if (player.hm.clickableLetter == "b") {
            return player.hm.smallwave.gte(1);
          }
          if (player.hm.clickableLetter == "c") {
            return player.hm.smallmediumwave.gte(1);
          }
          if (player.hm.clickableLetter == "d") {
            return player.hm.mediumwave.gte(1);
          }
          if (player.hm.clickableLetter == "e") {
            return player.hm.mediumlargewave.gte(1);
          }
          if (player.hm.clickableLetter == "f") {
            return player.hm.largewave.gte(1);
          }
        }
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
    21: {
      title: "Click me to change what wave(not sine or cosine) you oscillate",
      display() {},
      onClick() {
        player.hm.y++;
        if (player.hm.y == 7) {
          player.hm.y = 0;
        }
      },
      canClick() {
        return true;
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
    22: {
      title: "Oscillate for Sine",
      display() {
        if (player.hm.y == 1) {
          return "Oscillate very small waves for .01 atomic multipliers";
        }
        if (player.hm.y == 2) {
          return "Oscillate small waves for .1 atomic multipliers";
        }
        if (player.hm.y == 3) {
          return "Oscillate small medium waves for 1 atomic multipliers";
        }
        if (player.hm.y == 4) {
          return "Oscillate medium waves for 10 atomic multipliers";
        }
        if (player.hm.y == 5) {
          return "Oscillate medium-large waves for 50 atomic multipliers";
        }
        if (player.hm.y == 6) {
          return "Oscillate large waves for 100 atomic multipliers";
        }
      },
      onClick() {
        if (player.hm.y == 1) {
          player.hm.verysmallwave = player.hm.verysmallwave.sub(1);
          player.hm.atomicm = player.hm.atomicm.add(0.01);
        }
        if (player.hm.y == 2) {
          player.hm.smallwave = player.hm.smallwave.sub(1);
          player.hm.atomicm = player.hm.atomicm.add(0.1);
        }
        if (player.hm.y == 3) {
          player.hm.smallmediumwave = player.hm.smallmediumwave.sub(1);
          player.hm.atomicm = player.hm.atomicm.add(1);
        }
        if (player.hm.y == 4) {
          player.hm.mediumwave = player.hm.mediumwave.sub(1);
          player.hm.atomicm = player.hm.atomicm.add(10);
        }
        if (player.hm.y == 5) {
          player.hm.mediumlargewave = player.hm.mediumlargewave.sub(1);
          player.hm.atomicm = player.hm.atomicm.add(50);
        }
        if (player.hm.y == 6) {
          player.hm.largewave = player.hm.largewave.sub(1);
          player.hm.atomicm = player.hm.atomicm.add(100);
        }
      },
      canClick() {
        if (player.hm.y == 1) {
          return player.hm.verysmallwave.gte(1);
        }
        if (player.hm.y == 2) {
          return player.hm.smallwave.gte(1);
        }
        if (player.hm.y == 3) {
          return player.hm.smallmediumwave.gte(1);
        }
        if (player.hm.y == 4) {
          return player.hm.mediumwave.gte(1);
        }
        if (player.hm.y == 5) {
          return player.hm.mediumlargewave.gte(1);
        }
        if (player.hm.y == 6) {
          return player.hm.largewave.gte(1);
        }
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
    23: {
      title: "Oscillate for Cosine",
      display() {
        if (player.hm.y == 1) {
          return "Oscillate very small waves for .001 heavy atoms";
        }
        if (player.hm.y == 2) {
          return "Oscillate small waves for .01 heavy atoms";
        }
        if (player.hm.y == 3) {
          return "Oscillate small medium waves for .1 heavy atoms";
        }
        if (player.hm.y == 4) {
          return "Oscillate medium waves for 1 heavy atoms";
        }
        if (player.hm.y == 5) {
          return "Oscillate medium-large waves for 5 heavy atoms";
        }
        if (player.hm.y == 6) {
          return "Oscillate large waves for 10 heavy atoms";
        }
      },
      onClick() {
        if (player.hm.y == 1) {
          player.hm.verysmallwave = player.hm.verysmallwave.sub(1);
          player.ct.hatom = player.ct.hatom.add(0.001);
        }
        if (player.hm.y == 2) {
          player.hm.smallwave = player.hm.smallwave.sub(1);
          player.ct.hatom = player.ct.hatom.add(0.01);
        }
        if (player.hm.y == 3) {
          player.hm.smallmediumwave = player.hm.smallmediumwave.sub(1);
          player.ct.hatom = player.ct.hatom.add(0.1);
        }
        if (player.hm.y == 4) {
          player.hm.mediumwave = player.hm.mediumwave.sub(1);
          player.ct.hatom = player.ct.hatom.add(1);
        }
        if (player.hm.y == 5) {
          player.hm.mediumlargewave = player.hm.mediumlargewave.sub(1);
          player.ct.hatom = player.ct.hatom.add(5);
        }
        if (player.hm.y == 6) {
          player.hm.largewave = player.hm.largewave.sub(1);
          player.ct.hatom = player.ct.hatom.add(10);
        }
      },
      canClick() {
        if (player.hm.y == 1) {
          return player.hm.verysmallwave.gte(1);
        }
        if (player.hm.y == 2) {
          return player.hm.smallwave.gte(1);
        }
        if (player.hm.y == 3) {
          return player.hm.smallmediumwave.gte(1);
        }
        if (player.hm.y == 4) {
          return player.hm.mediumwave.gte(1);
        }
        if (player.hm.y == 5) {
          return player.hm.mediumlargewave.gte(1);
        }
        if (player.hm.y == 6) {
          return player.hm.largewave.gte(1);
        }
      },
      unlocked() {
        return player.hm.cosineunlocked;
      },
      style: {
        width: "200px",
        height: "200px",
      },
    },
  },
  upgrades: {
    11: {
      title: "10x boost to Multipliers",
      description: "Red Pill",
      cost() {
        if (hasUpgrade("hm", 12)) return new Decimal(20);
        else return new Decimal(1);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
      },
      branches: [21, 22],
    },

    12: {
      title: "10x boost to Quarks",
      description: "Violet Pill",
      cost() {
        if (hasUpgrade("hm", 11)) return new Decimal(20);
        else return new Decimal(1);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      branches: [23, 24],
    },
    21: {
      title: "Unlock more multiplier upgrades",
      description: "Red dice",
      cost() {
        if (hasUpgrade("hm", 22)) return new Decimal(40);
        else return new Decimal(3);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 11);
      },
      branches: [31],
    },

    22: {
      title: "Unlock more hyper multiplier milestones",
      description: "Red state",
      cost() {
        if (hasUpgrade("hm", 21)) return new Decimal(40);
        else return new Decimal(3);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 11);
      },
      branches: [32],
    },

    23: {
      title: "Unlock more quark upgrades",
      description: "Violet dice",
      cost() {
        if (hasUpgrade("hm", 24)) return new Decimal(40);
        else return new Decimal(3);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 12);
      },
      branches: [35],
    },

    24: {
      title: "Unlock Atomic Multipliers. ",
      description: "Violet state",
      cost() {
        if (hasUpgrade("hm", 23)) return new Decimal(40);
        else return new Decimal(3);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 12);
      },
      onPurchase() {
        player.hm.atomicm = player.hm.atomicm.add(1);
        player.hm.sineunlocked = true;
      },
      branches: [36],
    },
    31: {
      title: "Keep Multiplier upgrades on reset",
      description: "Red diaphram",
      cost() {
        if (hasUpgrade("hm", 32)) return new Decimal(100);
        else return new Decimal(10);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 21);
      },
      effect() {
        return (player.hm.auto1 = new Decimal(1));
      },
      onPurchase() {
        player[this.layer].keepMUpgrades = true;
      },
      branches: [33],
    },

    32: {
      title: "Unlock heavy atoms",
      description: "Red hearth",
      cost() {
        if (hasUpgrade("hm", 31)) return new Decimal(100);
        else return new Decimal(10);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 21);
      },
      onPurchase() {
        player.hm.cosineunlocked = true;
      },
      branches: [34],
    },

    33: {
      title: "Unlock more hyper multiplier milestones",
      description: "Heavy physics",
      cost() {
        if (hasUpgrade("hm", 34)) return new Decimal(200);
        else return new Decimal(15);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 31);
      },
    },

    34: {
      title: "Top Quarks boost multiplier gain. ",
      description: "Heavy Solution",
      cost() {
        if (hasUpgrade("hm", 33)) return new Decimal(200);
        else return new Decimal(15);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      effect() {
        return player.q.tq.plus(1).pow(0.6);
      },
      effectDisplay() {
        return format(upgradeEffect("hm", 34)) + "x";
      },
      unlocked() {
        return hasUpgrade("hm", 32);
      },
    },
    35: {
      title: "Keep quark upgrades on reset",
      description: "Violet diaphram",
      cost() {
        if (hasUpgrade("hm", 36)) return new Decimal(100);
        else return new Decimal(10);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      effect() {
        return (player.hm.auto2 = new Decimal(1));
      },
      unlocked() {
        return hasUpgrade("hm", 23);
      },
      onPurchase() {
        player[this.layer].keepQUpgrades = true;
      },
      branches: [37],
    },

    36: {
      title: "Unlock more atom challenges",
      description: "Violet thunder",
      cost() {
        if (hasUpgrade("hm", 35)) return new Decimal(100);
        else return new Decimal(10);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 24);
      },
      branches: [38],
    },

    37: {
      title: "Unlock row 2 cosmic dust upgrades",
      description: "Cellular biology",
      cost() {
        if (hasUpgrade("hm", 38)) return new Decimal(200);
        else return new Decimal(15);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 35);
      },
    },

    38: {
      title:
        "Unlock the ability to buy <i>S. Solfataricus</i><br>(prokaryotes)",
      description: "Cellular storm",
      cost() {
        if (hasUpgrade("hm", 37)) return new Decimal(200);
        else return new Decimal(15);
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        opacity: "1",
      },
      unlocked() {
        return hasUpgrade("hm", 36);
      },
    },
  },

  milestones: {
    1: {
      requirementDescription: "1 Heavy Multiplier",
      effectDescription: "It's quite heavy in here. 10x particle boost",
      done() {
        return player.hm.points.gte(1);
      },
    },
    2: {
      requirementDescription: "20 Heavy Multiplier",
      effectDescription: "Keep Vinyl Multiplier upgrades(and buyable)",
      done() {
        return player.hm.points.gte(20);
      },
      effect() {
        return (player.hm.auto3 = new Decimal(1));
      },
      onComplete() {
        player[this.layer].keepVUpgrades = true;
      },
    },
    3: {
      requirementDescription: "50 Heavy Multiplier",
      effectDescription: "Keep Hyper Multiplier Milestones on reset",
      done() {
        return player.hm.points.gte(50);
      },
      effect() {
        return (player.hm.auto4 = new Decimal(1));
      },
      onComplete() {
        player[this.layer].keepHMilestones = true;
      },
    },
    4: {
      requirementDescription: "Sine-cosine Duality(75 HM)",
      effectDescription:
        "Quarks can now freely be converted into a wave, and vice versa. The bigger/more unstable the quark, the longer the wavelength. Now enjoy the tension tab here, to vibrate each wave. This is used for obtaining atomic multipliers and heavy atoms.",
      done() {
        return player.hm.points.gte(75);
      },
      onComplete() {
        player[this.layer].tensionunlocked = true;
      },
    },
  },

  tabFormat: {
    "Prestige and Upgrades": {
      content: [
        [
          "main-display",
          function () {
            return "main-display";
          },
          { "font-family": "Times New Roman" },
        ],
        "blank",
        [
          "prestige-button",
          function () {
            return "prestige-button";
          },
          { "border-radius": "0px" },
        ],
        "blank",
        "blank",
        [
          "display-text",
          function () {
            if (player.hm.atomicm.gte(1) || hasUpgrade("hm", 24))
              return (
                "You have " +
                format(player.hm.atomicm) +
                " Atomic Multipliers | Multiplying Atoms by " +
                format(player.hm.atomicmMultiplier()) +
                "x"
              );
          },
        ],
        [
          "display-text",
          function () {
            if (player.ct.hatom.gte(1) || hasUpgrade("hm", 32))
              return (
                "You have " +
                format(player.ct.hatom) +
                " Heavy Atoms | Multiplying Vinyl Multiplier by " +
                format(player.hm.hatomMultiplier()) +
                "x"
              );
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.h.points) + " hyper multipliers";
          },
        ],
        "blank",
        "milestones",
        [
          "upgrade-tree",
          [
            [11, 12],
            [21, 22, 23, 24],
            [31, 32, 35, 36],
            [33, 34, 37, 38],
          ],
        ],
      ],
    },
    Tension: {
      content: [
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return "You have " + format(player.q.uq) + " Up Quarks";
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return "You have " + format(player.q.dq) + " Down Quarks.";
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return "You have " + format(player.q.sq) + " Strange Quarks";
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return "You have " + format(player.q.cq) + " Charm Quarks.";
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return "You have " + format(player.q.tq) + " Top Quarks";
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return "You have " + format(player.q.bq) + " Bottom Quarks.";
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return (
                "You have " +
                format(player.hm.verysmallwave) +
                " Very Small Waves"
              );
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return (
                "You have " + format(player.hm.smallwave) + " Small Waves."
              );
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return (
                "You have " +
                format(player.hm.smallmediumwave) +
                " Small-Medium Waves"
              );
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return (
                "You have " + format(player.hm.mediumwave) + " Medium Waves."
              );
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return (
                "You have " +
                format(player.hm.mediumlargewave) +
                " Medium-Large Waves"
              );
          },
        ],
        [
          "display-text",
          function () {
            if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
              return (
                "You have " + format(player.hm.largewave) + " Large Waves."
              );
          },
        ],
        function () {
          if (hasMilestone("hm", 4) || player.hm.tensionunlocked)
            return "clickables";
        },
      ],
    },
  },
});
