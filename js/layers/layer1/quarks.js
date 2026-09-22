addLayer("q", {
  name: "Quarks", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      uq: new Decimal(0), // Up Quarks
      dq: new Decimal(0), // Down Quarks
      sq: new Decimal(0), // Strange Quarks
      cq: new Decimal(0), // Charm Quarks
      tq: new Decimal(0), // Top Quarks
      bq: new Decimal(0), // Bottom Quarks
    };
  },
  color: "#ff36de",
  passiveGeneration() {
    if (hasMilestone("ce", 1)) return 1;
    else if (hasUpgrade("c", 11)) return 0.01;
  },
  onPrestige() {
    if (hasUpgrade("c", 16)) {
      let chance = Math.floor(Math.random() * 10);
      if (chance == 1) {
        player.c.mathfrag = player.c.mathfrag.add(1);
      }
      if (chance == 2) {
        player.c.negmathfrag = player.c.negmathfrag.add(1);
      }
    }
  },
  requires: new Decimal(50), // Can be a function that takes requirement increases into account
  resource: "Quarks", // Name of prestige currency
  baseResource: "particles", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  exponent: 0.4, // Prestige currency exponent
  nodeStyle() {
    if (tmp.q.canReset || player.q.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(255, 47, 255) 0%, rgb(245, 64, 252) 50%, rgb(211, 23, 202) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
        "border-radius": "100px",
        width: "86px",
        height: "123px",
      };
    } else
      return {
        width: "86px",
        height: "123px",
        "border-radius": "100px",
      };
  },
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (player.ce.points.gte(1)) mult = mult.times(upgradeEffect("ce", 24));
    if (hasUpgrade("m", 15)) mult = mult.times(1.5);
    if (getBuyableAmount("ce", 104).gte(1))
      mult = mult.times(buyableEffect("ce", 104));
    if (player.b.Moonstone.gte(1))
      mult = mult.times(player.b.moonstoneMultiplier());
    if (hasUpgrade("mm", 23)) mult = mult.times(10);
    if (hasUpgrade("n", 13)) mult = mult.times(10);
    mult = mult.times(player.ct.hq.plus(1));
    if (hasUpgrade("m", 23)) mult = mult.times(2);
    if (hasUpgrade("m", 24)) mult = mult.times(1.1);

    if (hasUpgrade("hm", 12)) mult = mult.times(10);
    if (hasUpgrade("m", 34)) mult = mult.times(1.5);

    if (buyableEffect("ce", 14)) mult = mult.times(buyableEffect("ce", 14));
    if (getBuyableAmount("t", 13).gte(1))
      mult = mult.times(buyableEffect("t", 13));
    if (getBuyableAmount("t", 23).gte(1))
      mult = mult.times(buyableEffect("t", 23));
    if (inChallenge("t", 11)) {
      mult = mult.times(1);
    } else {
      if (hasUpgrade("a", 12)) mult = mult.times(upgradeEffect("a", 12));
      if (inChallenge("a", 12)) {
        mult = mult.times(1);
      } else if (hasMilestone("h", 2)) {
        mult = mult.times(player.h.points.pow(0.5).plus(1));
      }
      if (hasUpgrade("v", 15)) mult = mult.times(upgradeEffect("v", 15));
      if (hasUpgrade("c", 24)) mult = mult.times(10);
    }
    if (player.ce.points.gte(1))
      mult = mult.times(new Decimal(4).mul(player.ce.points));

    return mult;
  },
  doReset(reset) {
    if (player.n.layer1CanReset) {
      return null;
    }
    let keep = [];
    keep.push("uq");
    keep.push("dq");
    keep.push("sq");
    keep.push("cq");
    keep.push("tq");
    keep.push("bq");
    if (player.hm.keepQUpgrades) {
      keep.push("upgrades");
    }
    if (layers[reset].row > this.row) {
      layerDataReset("q", keep);
    }
  },

  gainExp() {
    // Calculate the exponent on main currency from bonuses

    if (player.art.dquark.gte(1)) return new Decimal(2);
    return new Decimal(1);
  },
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "q",
      description: "Q: Reset for quarks",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  update(diff) {
    if (hasUpgrade("q", 15)) {
      player.q.uq = player.q.uq.plus(new Decimal(0.001).mul(diff));
    }
    if (player.q.dq >= 1) {
      player.q.uq = player.q.uq.plus(
        new Decimal(0.001).mul(player.q.dq).mul(diff),
      );
    }
    if (player.q.sq >= 1) {
      player.q.dq = player.q.dq.plus(
        new Decimal(0.01).mul(player.q.sq).mul(diff),
      );
    }
    if (player.q.cq >= 1) {
      player.q.sq = player.q.sq.plus(
        new Decimal(0.1).mul(player.q.cq).mul(diff),
      );
    }
    if (player.q.tq >= 1) {
      player.q.cq = player.q.cq.plus(
        new Decimal(0.5).mul(player.q.tq).mul(diff),
      );
    }
    if (player.q.bq >= 1) {
      player.q.tq = player.q.tq.plus(new Decimal(1).mul(player.q.bq).mul(diff));
    }
    if (player.a.neutrons >= 1) {
      player.q.bq = player.q.bq.plus(
        new Decimal(0.001).mul(player.a.neutrons).mul(diff),
      );
    }
  },

  tabFormat: {
    "Upgrades and Prestige": {
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
          "upgrades",
          function () {
            return ("upgrades", "1");
          },
        ],
        [
          "upgrades",
          function () {
            return ("upgrades", "2");
          },
        ],
      ],
    },
    "Quark types": {
      content: [
        ["infobox", "lore"],
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.q.uq) + " Up Quarks";
          },
          {
            "font-size": "25px",
            color: "#000000",
            border: "4px solid #d400ff",
            padding: "18px",
            "background-image":
              "linear-gradient(90deg,rgba(255, 0, 251, 1) 0%, rgba(238, 0, 255, 1) 50%, rgba(187, 0, 212, 1) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.q.dq) + " Down Quarks";
          },
          {
            "font-size": "25px",
            color: "#000000",
            border: "4px solid #67007c",
            padding: "18px",
            "background-image":
              "linear-gradient(90deg,rgb(134, 0, 132) 0%, rgb(87, 0, 94) 50%, rgb(95, 0, 107) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return (
              '<div class="shake-animation-light">You have ' +
              format(player.q.sq) +
              " Strange Quarks"
            );
          },
          {
            "font-size": "25px",
            color: "#000000",
            border: "4px solid #032500",
            padding: "18px",
            "background-image":
              "linear-gradient(90deg,rgb(0, 85, 11) 0%, rgb(2, 49, 0) 50%, rgb(0, 48, 2) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",

        [
          "display-text",
          function () {
            return (
              '<div class="shake-animation-medium">You have ' +
              format(player.q.cq) +
              " Charm Quarks"
            );
          },
          {
            "font-size": "25px",
            color: "#000000",
            border: "4px solid #090081",
            padding: "18px",
            "background-image":
              "linear-gradient(90deg,rgb(11, 0, 172) 0%, rgb(10, 0, 100) 50%, rgb(5, 0, 48) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",

        [
          "display-text",
          function () {
            return (
              '<div class="shake-animation-intense">You have ' +
              format(player.q.tq) +
              " Top Quarks"
            );
          },
          {
            "font-size": "25px",
            color: "#000000",
            border: "4px solid #5a5a5a",
            padding: "18px",
            "background-image":
              "linear-gradient(90deg,rgb(77, 77, 77) 0%, rgb(68, 68, 68) 50%, rgb(43, 43, 43) 100%)",
          },
        ],
        "blank",
        "blank",
        "blank",

        [
          "display-text",
          function () {
            return (
              '<div class="vibrate">You have ' +
              format(player.q.bq) +
              " Bottom Quarks"
            );
          },
          {
            "font-size": "25px",
            color: "#000000",
            border: "4px solid #181818",
            padding: "18px",
            "background-image":
              "linear-gradient(90deg,rgb(36, 36, 36) 0%, rgb(26, 26, 26) 50%, rgb(19, 19, 19) 100%)",
          },
        ],
        "blank",
        "blank",
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "11"],
                "blank",
                ["buyable", "12"],
                "blank",
                ["buyable", "13"],
              ],
            ],
          ],
        ],
        "blank",
        ["h-line", "700px"],
        "blank",
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "21"],
                "blank",
                ["buyable", "22"],
                "blank",
                ["buyable", "23"],
              ],
            ],
          ],
        ],
        "blank",
        ["h-line", "700px"],
        "blank",
        ["column", [["row", [["buyable", "31"]]]]],
      ],
    },
  },
  infoboxes: {
    lore: {
      title: "Quarks explained",
      body() {
        return `Quarks are currently one of the smallest known subatomic particles. They make up protons and neutrons in pairs of 3.
         According to the U.S. Department of Energy.gov site, there are 6 types of quarks, each with different properties. Up, Down, Strange, Charm, Top, and Bottom.
         Quarks have 3 fundamental properties: Charge, Spin and Color. Charge comes from the law of electromagnetism where quarks are either positive or negative.
         It's important to note charges can be decimals. Spin represents the momentum(angular) and is always 1/2(One half).
         Color(a charge) is similar to standard positive and negative but has three distinct states. Blue, red and yellow(Quarks aren't any of these colors).
         Colors help bind 3 quarks together as each quark needs to be a different color. Protons and neutrons are colorless. Any type of Quark can be any color.
          Up and Down quarks make up most matter in the universe, with Up quarks being positively charged, lightest, and most stable.
         Down quarks are negatively charged, slightly heavier, and less stable. Strange and Charm quarks are more massive and less stable, with Strange being negatively charged and Charm positively charged.
         Top and Bottom quarks are the heaviest and least stable, with Top being positively charged and Bottom negatively charged.
         Thanks to Wikipedia and the Department of Energy for this information. Note: wikipedia isn't always reliable, but I did fact check.`;
      },
    },
  },

  upgrades: {
    11: {
      title: "Another Tree?",
      description: "2x Particle Boost",
      cost: new Decimal(2),
    },
    12: {
      title: "6 fold",
      description: "1.9x Multiplier Boost",
      cost: new Decimal(6),
    },
    13: {
      title: "Self-sustaining",
      description: "Particles boost particles",
      cost: new Decimal(10),
      effect() {
        if (hasUpgrade("d", 38)) return player.points.add(1).pow(0.3);
        if (inChallenge("a", 11)) return new Decimal(1);
        else return player.points.add(1).pow(0.2);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      },
    },
    14: {
      title: "The Generalist",
      description: "Stability doesn't matter. Double Multipliers",
      cost: new Decimal(18),
    },
    15: {
      title: "Rebound",
      description: "Quarks now boost particles",
      cost: new Decimal(24),
      effect() {
        return player[this.layer].points.add(1).pow(0.125);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
    },
    16: {
      title: "Generator",
      description: "1.5x boost to particle gain",
      cost: new Decimal(40),
    },
    21: {
      title: "Quarks unlocked",
      description: "Passively generate up quarks.",
      cost: new Decimal(50),
    },
    22: {
      title: "Buymax",
      description: "Buy max quark converters",
      cost: new Decimal(500),
    },
    23: {
      title: "Buymaxer",
      description: "Buy a 2x particle boost",
      cost: new Decimal(1e12),
      unlocked() {
        return hasUpgrade("hm", 23);
      },
    },
    24: {
      title: "Señor",
      description: "Boost Atoms gain by 2",
      cost: new Decimal(2e13),
      unlocked() {
        return hasUpgrade("hm", 23);
      },
    },
    25: {
      title: "El classico",
      description: "Telescopes now boost multiplier gain",
      cost: new Decimal(4e14),
      effect() {
        return player.c.t.plus(1).pow(0.5);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
      unlocked() {
        return hasUpgrade("hm", 23);
      },
    },
    26: {
      title: "A sine of things to come",
      description: "Two times particle gain",
      cost: new Decimal(1e15),
      unlocked() {
        return hasUpgrade("hm", 23);
      },
    },
  },
  buyables: {
    11: {
      cost() {
        return new Decimal(1);
      },
      title() {
        return "Down Quark converter";
      },
      display() {
        return "Exchange your Up Quarks for Down Quarks. Each quark boosts the gain of the quark below it";
      },
      canAfford() {
        return player.q.uq.gte(this.cost(1));
      },
      buyMax() {
        if (hasUpgrade("q", 22)) return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.q.uq.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.q.uq = player.q.uq.sub(costPerUnit.mul(max));
        player.q.dq = player.q.dq.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "costs 1 Up Quark",
    },
    12: {
      cost() {
        return new Decimal(10);
      },
      title() {
        return "Strange Quark converter";
      },
      display() {
        return "Exchange your Down Quarks for Strange Quarks";
      },
      canAfford() {
        return player.q.dq.gte(this.cost(1));
      },
      buyMax() {
        if (hasUpgrade("q", 22)) return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.q.dq.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.q.dq = player.q.dq.sub(costPerUnit.mul(max));
        player.q.sq = player.q.sq.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "Costs 10 Down Quarks",
    },
    13: {
      cost() {
        return new Decimal(100);
      },
      title() {
        return "Charm Quark converter";
      },
      display() {
        return "Exchange your Strange Quarks for Charm Quarks";
      },
      canAfford() {
        return player.q.sq.gte(this.cost(1));
      },
      buyMax() {
        if (hasUpgrade("q", 22)) return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.q.sq.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.q.sq = player.q.sq.sub(costPerUnit.mul(max));
        player.q.cq = player.q.cq.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "Costs 100 Strange Quarks",
    },
    21: {
      cost() {
        return new Decimal(1000);
      },
      title() {
        return "Top Quark converter";
      },
      display() {
        return "Exchange your Charm Quarks for Top Quarks";
      },
      canAfford() {
        return player.q.cq.gte(this.cost(1));
      },
      buyMax() {
        if (hasUpgrade("q", 22)) return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.q.cq.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.q.cq = player.q.cq.sub(costPerUnit.mul(max));
        player.q.tq = player.q.tq.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "Costs 1000 Charm Quarks",
    },
    22: {
      cost() {
        return new Decimal(10000);
      },
      title() {
        return "Bottom Quark converter";
      },
      display() {
        return "Exchange your Top Quarks for Bottom Quarks";
      },
      canAfford() {
        return player.q.tq.gte(this.cost(1));
      },
      buyMax() {
        if (hasUpgrade("q", 22)) return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.q.tq.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.q.tq = player.q.tq.sub(costPerUnit.mul(max));
        player.q.bq = player.q.bq.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "Costs 10,000 Top Quarks",
    },
    23: {
      cost() {
        return new Decimal(100);
      },
      title() {
        return "Neutron converter";
      },
      display() {
        return "Exchange your Bottom Quarks for neutrons";
      },
      canAfford() {
        return player.q.bq.gte(this.cost(1));
      },
      buyMax() {
        if (hasUpgrade("q", 22)) return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);
        if (this.buyMax()) {
          max = player.q.bq.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);

          player.q.uq = new Decimal(1);
          player.q.dq = new Decimal(0);
          player.q.sq = new Decimal(0);
          player.q.cq = new Decimal(0);
          player.q.tq = new Decimal(0);
          player.q.bq = new Decimal(0);
          player.a.neutrons = player.a.neutrons.add(1);
          setBuyableAmount(
            this.layer,
            this.id,
            getBuyableAmount(this.layer, this.id).add(1),
          );
        }
      },
      tooltip: "Costs 100 Bottom Quarks, but this resets all quarks",
    },
    31: {
      cost() {
        return new Decimal(1e100);
      },
      title() {
        return "Divine Quark";
      },
      display() {
        return "1 googol bottom quarks(1e100) for 1 divine quark";
      },
      canAfford() {
        return player.q.bq.gte(this.cost(1));
      },
      purchaseLimit: 1,
      buy() {
        player.q.bq = new Decimal(0);
        player.art.dquark = new Decimal(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },

      style() {
        return {
          backgroundImage:
            "linear-gradient(90deg, rgba(255, 251, 0, 0.48) 0%, rgb(196, 196, 196) 50%, rgb(218, 215, 21) 100%)",
          borderRadius: "0px",
          border: "0px solid #797979",
          backgroundSize: "800% 800%",
          fontSize: "20px",
          padding: "20px",
          width: "400px",
          height: "250px",
          fontColor: "#000000",
          fontFamily: "Comic Sans",
          animation:
            "rippleMove 2s ease infinite, scalar 0.5s ease-in-out infinite",
        };
      },
    },
  },
});
