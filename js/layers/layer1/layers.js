addLayer("m", {
  name: "Multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      multiplier() {
        if (inChallenge("a", 21)) return new Decimal(1);
        return player.ce.rna.plus(1).pow(0.3);
      },
    };
  },
  color: "#ff0000",
  nodeStyle() {
    if (tmp.m.canReset || player.m.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(255, 0, 0) 0%, rgb(255, 80, 80) 50%, rgb(177, 8, 8) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "Multipliers", // Name of prestige currency
  baseResource: "particles", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.4, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("m", 14)) mult = mult.times(2);
    if (hasUpgrade("q", 12)) mult = mult.times(1.9);
    if (player.b.Voidstone.gte(1))
      mult = mult.times(player.b.voidstoneMultiplier());
    if (hasUpgrade("q", 13)) mult = mult.times(2);

    if (hasUpgrade("m", 22)) mult = mult.times(2);
    if (hasUpgrade("m", 24)) mult = mult.times(1.1);
    if (inChallenge("a", 12)) mult = mult.times(0.33333);

    if (hasUpgrade("n", 13)) mult = mult.times(10);
    if (hasUpgrade("hm", 11)) mult = mult.times(10);
    if (hasUpgrade("m", 32)) mult = mult.times(1.5);
    mult = mult.times(player.m.multiplier());
    if (getBuyableAmount("t", 11).gte(1))
      mult = mult.times(buyableEffect("t", 11));
    if (getBuyableAmount("t", 22).gte(1))
      mult = mult.times(buyableEffect("t", 22));
    if (inChallenge("t", 11)) {
      mult = mult.times(1);
    } else {
      if (getBuyableAmount("v", 11).gte(1))
        mult = mult.times(buyableEffect("v", 11).plus(1));
      if (hasUpgrade("v", 11)) mult = mult.times(3);
      if (hasChallenge("a", 12)) mult = mult.times(challengeEffect("a", 12));
      if (hasUpgrade("v", 14)) mult = mult.times(upgradeEffect("v", 14));
      if (hasUpgrade("a", 22)) mult = mult.times(3);
      if (inChallenge("a", 12)) {
        mult = mult.times(1);
      } else if (hasMilestone("h", 2)) {
        mult = mult.times(player.h.points.pow(0.5).plus(1));
      }
    }
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("mm", 11)) mult = mult.times(3);
      if (hasUpgrade("mm", 22)) mult = mult.times(upgradeEffect("mm", 22));
    }

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    if (player.art.alienEssence.gte(1)) return new Decimal(2);
    return new Decimal(1);
  },
  doReset(reset) {
    let keep = [];
    if (player.n.layer1CanReset) {
      return null;
    }

    if (player.hm.keepMUpgrades) {
      keep.push("upgrades");
    }
    if (layers[reset].row > this.row) {
      layerDataReset("m", keep);
    }
  },

  passiveGeneration() {
    if (inChallenge("a", 12)) return 0;
    else if (hasMilestone("h", 6)) return 0.01;
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
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
    return true;
  },
  tabFormat: {
    Multiplier: {
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
            return "You have " + format(player.points) + " particles.";
          },
        ],
        "blank",
        [
          "column",
          [
            [
              "row",
              [
                ["upgrade", "11"],
                ["upgrade", "12"],
                ["upgrade", "13"],
                ["upgrade", "14"],
                ["upgrade", "15"],
                ["upgrade", "16"],
              ],
            ],
          ],
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["upgrade", "21"],
                ["upgrade", "22"],
                ["upgrade", "23"],
                ["upgrade", "24"],
                ["upgrade", "25"],
                ["upgrade", "26"],
              ],
            ],
          ],
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["upgrade", "31"],
                ["upgrade", "32"],
                ["upgrade", "33"],
                ["upgrade", "34"],
                ["upgrade", "35"],
                ["upgrade", "36"],
              ],
            ],
          ],
        ],
        "challenges",
      ],
    },
  },

  upgrades: {
    11: {
      title: "Humble beginnings",
      description: "A cosmic... multipliers aren't cosmic. 2x Particle boost",
      cost: new Decimal(3),
    },
    12: {
      title: "Deviance",
      description:
        "Multipliers have no direct correlation with particles. But maybe a virtual one. 1.75x Particle Boost",
      cost: new Decimal(6),
    },
    13: {
      title: "Hyperance",
      description: "Multipliers now boost particles.",
      cost: new Decimal(11),
      effect() {
        if (getBuyableAmount("t", 25).gte(1))
          return player[this.layer].points
            .plus(1)
            .pow(0.3)
            .plus(1)
            .mul(buyableEffect("t", 25));
        else if (hasUpgrade("a", 25))
          return player[this.layer].points.plus(1).log10().pow(1.4).plus(1);
        else if (hasUpgrade("m", 25))
          return player[this.layer].points.plus(3).log10().pow(0.6).plus(1);
        else return player[this.layer].points.plus(2).log10().pow(0.5).plus(1);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
    },
    14: {
      title: "Cosmic-y",
      description: "2x Multiplier gain",
      cost: new Decimal(20),
    },
    15: {
      title: "Quirks",
      description: "Quarks are now boosted!",
      cost: new Decimal(80),
    },
    16: {
      title: "Humility",
      description: "Unlock the Crafting Table and Inventory",
      cost: new Decimal(120),
      effect() {
        if (hasUpgrade("m", 16)) player.ct.unlocked = true;
      },
    },
    21: {
      title: "Ferocity",
      description: "2.5x particle gain",
      cost: new Decimal(180),
    },
    22: {
      title: "Row 2",
      description: "4x particle gain",
      cost: new Decimal(10000),
      unlocked() {
        if (hasUpgrade("a", 14)) return true;
      },
    },
    23: {
      title: "Row 2.1",
      description: "4x multiplier boost",
      cost: new Decimal(20000),
      unlocked() {
        if (hasUpgrade("a", 14)) return true;
      },
    },
    24: {
      title: "Uptown",
      description: "4x quark boost",
      cost: new Decimal(50000),
      unlocked() {
        if (hasUpgrade("a", 14)) return true;
      },
    },
    25: {
      title: "Downtown",
      description: "^1.1 boost to all three aforementioned boosts",
      cost: new Decimal(75000),
      unlocked() {
        if (hasUpgrade("a", 14)) return true;
      },
    },
    26: {
      title: "Efficiency",
      description: "Improve upgrade 13's effect",
      cost: new Decimal(125000),
      unlocked() {
        if (hasUpgrade("a", 14)) return true;
      },
    },
    31: {
      title: "Manchosia",
      description: "Double Particle gain",
      cost: new Decimal(1e11),
      unlocked() {
        if (hasUpgrade("hm", 21)) return true;
      },
    },
    32: {
      title: "Multanizer",
      description: "1.5x boost to multiplier gain",
      cost: new Decimal(1e12),
      unlocked() {
        if (hasUpgrade("hm", 21)) return true;
      },
    },
    33: {
      title: "Trignometry",
      description: "Triangulate gain!",
      cost: new Decimal(1e13),
      unlocked() {
        if (hasUpgrade("hm", 21)) return true;
      },
    },
    34: {
      title: "Jargon",
      description: "Atomizer is a new inside joke",
      cost: new Decimal(1e14),
      unlocked() {
        if (hasUpgrade("hm", 21)) return true;
      },
    },
    35: {
      title: "BBC",
      description: "Big Black Center multiplies gain by 1.5",
      cost: new Decimal(1e15),
      unlocked() {
        if (hasUpgrade("hm", 21)) return true;
      },
    },
    36: {
      title: "The Big Bucks",
      description: "2x particle boost",
      cost: new Decimal(1e16),
      unlocked() {
        if (hasUpgrade("hm", 21)) return true;
      },
    },
  },
});
