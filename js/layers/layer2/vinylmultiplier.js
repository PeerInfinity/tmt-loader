addLayer("v", {
  name: "Vinyl Multipliers", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "VM", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
    };
  },
  color: "#c7d500",
  requires: new Decimal(5), // Can be a function that takes requirement increases into account
  resource: "Vinyl Multipliers", // Name of prestige currency
  baseResource: "Hyper Multipliers", // Name of resource prestige is based on
  best: new Decimal(0),
  baseAmount() {
    return player.h.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  passiveGeneration() {
    if (hasMilestone("o", 7)) return new Decimal(1);
    if (getBuyableAmount("t", 31).gte(1))
      return new Decimal(0.1).mul(getBuyableAmount("t", 31));
  },
  nodeStyle() {
    if (tmp.v.canReset || player.v.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(216, 255, 45) 0%, rgb(218, 233, 17) 50%, rgb(252, 249, 33) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    }
  },
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (buyableEffect("ce", 14)) mult = mult.times(buyableEffect("ce", 14));
    if (player.ct.stars.gte(1)) mult = mult.times(buyableEffect("ct", 15));

    if (getBuyableAmount("t", 14).gte(1))
      mult = mult.times(buyableEffect("t", 14));
    if (getBuyableAmount("t", 41).gte(1))
      mult = mult.times(buyableEffect("t", 41));
    if (player.ct.hatom.gte(0.01))
      mult = mult.times(player.hm.hatomMultiplier());
    if (getBuyableAmount("ce", 107).gte(1))
      mult = mult.times(buyableEffect("ce", 107));

    if (inChallenge("t", 11)) {
    } else {
      if (hasUpgrade("a", 23)) mult = mult.times(2);
    }
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("mm", 13)) mult = mult.times(7);
      if (hasUpgrade("mm", 22)) mult = mult.times(upgradeEffect("mm", 22));
      if (getBuyableAmount("mm", 13).gte(1))
        mult = mult.times(buyableEffect("mm", 13));
      if (challengeCompletions("n", 11) >= 1)
        mult = mult.times(challengeEffect("n", 11));
      if (hasUpgrade("mm", 11)) mult = mult.times(3);
    }
    if (player.b.Voidstone.gte(1))
      mult = mult.times(player.b.voidstoneMultiplier());
    if (hasUpgrade("d", 12)) mult = mult.times(100);
    if (hasUpgrade("d", 46)) mult = mult.times(10);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  doReset(reset) {
    let keep = [];
    if (!player.nm.layersCanReset) {
      return null;
    }
    if (player.hm.keepVUpgrades) {
      keep.push("upgrades");
      keep.push("buyables");
    }
    if (layers[reset].row > this.row) {
      layerDataReset("v", keep);
    }
  },
  update() {
    if (
      player.m.points.gte(12500) ||
      player.v.points >= 1 ||
      player.hm.points >= 1 ||
      player.ce.points >= 1
    ) {
      player.v.variable = new Decimal(1);
    }
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "v",
      description: "V: Reset for vinyl multipliers",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  branches: ["h"],
  layerShown() {
    return player.h.unlocked;
  },
  tabFormat: {
    Main: {
      content: [
        "main-display",
        "prestige-button",
        [
          "display-text",
          function () {
            return "You have " + format(player.hm.points) + " hyper multiplier";
          },
          {},
        ],
        "buyables",
        "upgrades",
        [
          "toggle",
          function () {
            if (hasUpgrade("v", 12)) return ["h", "autoPrestige"];
          },
        ],
      ],
    },
  },
  upgrades: {
    11: {
      title: "Vinility",
      description: "5x particle gain, 3x multiplier gain",
      cost: new Decimal(1),
      effect() {
        if (inChallenge("a", 12)) return new Decimal(1);
        else return new Decimal(5);
      },
    },
    12: {
      title: "Hyper Vinyl",
      description: "Auto-Prestige Hyper Multiplier(Toggle)",
      cost: new Decimal(2),
      effect() {
        player.v.hyperAuto = new Decimal(1);
      },
    },
    13: {
      title: "Milestony",
      description: "Unlock more Hyper Multiplier Milestones",
      cost: new Decimal(3),
    },
    13: {
      title: "Milestony",
      description: "Unlock more Hyper Multiplier Milestones",
      cost: new Decimal(3),
    },
    15: {
      title: "Plasticity",
      description: "Best Vinyl Multipliers now boost multipliers",
      cost: new Decimal(5),
      effect() {
        if (inChallenge("a", 12)) return new Decimal(1);
        else return Decimal.log(player.v.best.add(1.001), 1.001);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
    },
    16: {
      title: "Obomb",
      description: "Unlock the vinyl buyable",
      cost: new Decimal(10),
    },
  },
  buyables: {
    11: {
      cost(x) {
        return new Decimal(1).mul(2).pow(x);
      },
      title: "The Multiplier",
      display() {
        return (
          "Buy a 2x boost to Multipliers.   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " vinyl multipliers"
        );
      },
      unlocked() {
        return hasUpgrade("v", 16);
      },
      effect(x) {
        if (inChallenge("d", 14)) {
          return new Decimal(2).mul(x);
        }
        if (getBuyableAmount("mm", 12).gte(1)) {
          return new Decimal(2).mul(x).mul(buyableEffect("mm", 12));
        } else return new Decimal(2).mul(x);
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        width: "500px",
        "font-size": "20px",
      },
    },
  },
});
