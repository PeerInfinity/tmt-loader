addLayer("c", {
  name: "Cosmic Dust", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      t: new Decimal(0),
      adt: new Decimal(0),
      sat: new Decimal(0),
      mathfrag: new Decimal(0),
      negmathfrag: new Decimal(0),
      polarity: new Decimal(0),
      polarityTime: 0,

      aChallengeUnlocked: false,
      cellUnlocked: false,
      updated: false,
      permanentGeneration: false,
      sMult() {
        return Decimal.sqrt(player.ct.sdust.plus(1));
      },
      multiplier() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else return player.ce.dna.plus(1).pow(0.1);
      },
    };
  },
  softcap() {
    let nissionite = player.n.points.toNumber();
    let equation = (0.1 + nissionite) / (challengeCompletions("n", 11) + 1);
    if (inChallenge("n", 11)) return new Decimal(equation);
    if (challengeCompletions("n", 11) >= 6 && inChallenge("n", 11))
      return new Decimal(0.99);
    else return new Decimal(50);
  },
  softcapPower() {
    let nissionite = player.n.points.toNumber();
    let equation =
      (0.01 + nissionite * 0.01) / (challengeCompletions("n", 11) * 2 + 1);
    if (challengeCompletions("n", 11) >= 6 && inChallenge("n", 11))
      equation = 0.001;
    if (inChallenge("n", 11)) return new Decimal(equation);
    else return new Decimal(0.2);
  },
  doReset(reset) {
    let keep = [
      "aChallengeUnlocked",
      "permanetGeneration",
      "mathfrag",
      "polarityTime",
      "polarity",
      "negmathfrag",
    ];
    if (!player.sm.canReset) {
      return null;
    }
    keep.push("t");
    keep.push("adt");
    keep.push("sat");

    keep.push("updated");
    keep.push("cellUnlocked");
    if (player.b.keepCUpgrades) {
      keep.push("upgrades");
      keep.push("clickables");
      keep.push("infoboxes");
    }
    if (layers[reset].row > this.row) {
      layerDataReset("c", keep);
    }
  },
  color: "#0004ff",
  nodeStyle() {
    if (tmp.c.canReset || player.c.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(49, 46, 221) 0%, rgb(0, 26, 255) 50%, rgb(7, 38, 211) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  best: new Decimal(0),
  requires: new Decimal(1000000), // Can be a function that takes requirement increases into account
  resource: "Cosmic Dust", // Name of prestige currency
  baseResource: "Quarks", // Name of resource prestige is based on
  baseAmount() {
    return player.q.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.4, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    mult = mult.times(player.c.multiplier());
    if (hasUpgrade("ce", 12)) mult = mult.times(2);
    if (player.ce.points.gte(1)) mult = mult.times(upgradeEffect("ce", 24));
    if (inChallenge("a", 21)) mult = mult.times(0.5);
    if (getBuyableAmount("t", 12).gte(1))
      if (getGridData("art", 201) == 2) mult = mult.times(5);
    mult = mult.times(buyableEffect("t", 12));
    if (player.ct.stars.gte(1)) mult = mult.times(buyableEffect("ct", 15));
    if (player.ce.points.gte(1))
      mult = mult.times(new Decimal(4).mul(player.ce.points));
    if (getBuyableAmount("t", 24).gte(1))
      mult = mult.times(buyableEffect("t", 24));
    if (getBuyableAmount("ce", 102).gte(1))
      mult = mult.times(buyableEffect("ce", 102));
    if (player.chm.multiplicitiveInverse.gte(1))
      mult = mult.times(player.chm.mInverseFunction());

    if (player.b.Arbitorite.gte(1))
      mult = mult.times(player.b.arbitoriteMultiplier());
    if (player.b.Bloodstone.gte(1))
      mult = mult.times(player.b.bloodstoneMultiplier());
    if (player.ct.bdust.gte(1)) mult = mult.times(player.ct.bdustEffect1());
    mult = mult.times(player.b.koriumMultiplier());
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("n", 12)) mult = mult.times(5);
      if (challengeCompletions("n", 11) >= 1)
        mult = mult.times(challengeEffect("n", 11));
    }
    if (hasUpgrade("d", 39)) mult = mult.times(1e12);
    if (hasUpgrade("d", 45)) mult = mult.times(1e13);
    if (challengeCompletions("n", 11) >= 1)
      mult = mult.times(challengeEffect("n", 11));
    if (player.ct.sdust.gte(1)) mult = mult.times(player.c.sMult());
    return mult;
  },
  passiveGeneration() {
    if (getBuyableAmount("t", 33).gte(1))
      return new Decimal(0.01).mul(getBuyableAmount("t", 33));
    if (hasMilestone("b", 1) || hasMilestone("ct", 2)) return new Decimal(1);
    if (player.c.permanentGeneration) return new Decimal(1);
  },
  update() {
    if (
      player.q.points.gte(500000) ||
      player.c.points >= 1 ||
      player.hm.points >= 1 ||
      player.ce.points >= 1
    ) {
      player.c.variable = new Decimal(1);
    }
    if (hasMilestone("b", 1)) {
      player.c.t = player.c.t.add(0.1);
    }
    if (player.c.polarityTime > 0) {
      player.c.polarityTime -= 1;
    }
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "c",
      description: "C: Reset for cosmic dust ",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  branches: ["a", "q"],
  layerShown() {
    return player.a.unlocked;
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
            return "You have " + format(player.q.points) + " quarks.";
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.c.mathfrag) + " math fragments.";
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.c.negmathfrag) +
              " negative math fragments."
            );
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ct.sdust) +
              " Star dust." +
              " | <br>boosting cosmic dust and atoms by " +
              format(player.c.sMult()) +
              "x"
            );
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.c.polarity) +
              " polarity | " +
              "lasting for " +
              format(player.c.polarityTime) +
              " ticks."
            );
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        "blank",
        "upgrades",
      ],
    },
    Astronomy: {
      content: [
        [
          "display-text",
          function () {
            return "You have " + format(player.c.t) + " telescopes.";
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            if (hasChallenge("a", 11))
              return (
                "You have " + format(player.c.adt) + " advanced telescopes."
              );
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            if (player.c.adt.gte(1)) {
              return (
                "You have " + format(player.c.adt) + " advanced telescopes."
              );
            }
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        [
          "display-text",
          function () {
            if (player.c.sat.gte(1)) {
              return (
                "You have " +
                format(player.c.sat) +
                " super advanced telescopes."
              );
            }
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        "blank",
        ["clickable", "11"],
        "blank",
        "buyables",
        "blank",
        ["infobox", "lore"],
        ["clickable", "12"],
        ["h-line", "800px"],
        [
          "row",
          [
            ["clickable", 13],
            ["clickable", 14],
          ],
        ],
      ],
    },
  },
  clickables: {
    11: {
      display() {
        return "Click me for telescopes";
      },
      onClick() {
        if (hasUpgrade("c", 14)) {
          player.c.t = player.c.t.add(4);
        } else if (hasUpgrade("c", 13)) {
          player.c.t = player.c.t.add(2);
        } else {
          player.c.t = player.c.t.add(1);
        }
      },
      canClick() {
        return true;
      },
    },
    12: {
      display() {
        return "Resets Cosmic Dust, telescopes, advanced and super to 1";
      },
      onClick() {
        if (
          confirm(
            "Are you sure? This doesn't count as a reset, just resets the currencies to one",
          ) == false
        ) {
          return;
        }
        player.c.points = new Decimal(1);
        player.c.t = new Decimal(1);
        player.c.adt = new Decimal(1);
        player.c.sat = new Decimal(1);
      },
      canClick() {
        return true;
      },
    },
    13: {
      title:
        "Annihilate 1 math fragment and 1 negative math fragment to gain 1 stardust",

      display() {
        return `Annihilate 1 math fragment and 1 negative math fragment to gain 1 stardust. If negative is too large, convert two into one positive. Too many negative fragments in a 
      reaction could create polarity, which reduces stardust gain for as long as it lasts(1-5 minutes).`;
      },
      onClick() {
        if (player.c.negmathfrag.gt(player.c.mathfrag)) {
          player.c.polarity = player.c.polarity.add(
            player.c.negmathfrag.sub(player.c.mathfrag),
          );
          player.c.polarityTime = Math.floor(Math.random() * 1800);
          if (player.c.polarityTime < 600) {
            player.c.polarityTime = 600;
          }
          player.c.negmathfrag = player.c.negmathfrag.sub(player.c.mathfrag);
          player.c.mathfrag = new Decimal(0);
        }
        if (player.c.mathfrag.gte(player.c.negmathfrag)) {
          player.ct.sdust = player.ct.sdust.add(
            player.c.mathfrag
              .sub(player.c.negmathfrag)
              .plus(1)
              .sub(player.c.polarity),
          );
          player.c.mathfrag = player.c.mathfrag.sub(player.c.negmathfrag);
          player.c.negmathfrag = new Decimal(0);
        }
      },
      canClick() {
        return player.c.mathfrag.gte(1) && player.c.negmathfrag.gte(1);
      },
      unlocked() {
        return hasUpgrade("c", 17);
      },
      style: {
        width: "300px",
        height: "300px",
        "font-size": "13px",
      },
    },
    14: {
      title:
        "Convert 2 negative math fragments into 1 positive math fragment. This is used for stardust",

      onClick() {
        player.c.negmathfrag = player.c.negmathfrag.sub(2);
        player.c.mathfrag = player.c.mathfrag.add(1);
      },
      canClick() {
        return player.c.mathfrag.gte(1) && player.c.negmathfrag.gte(2);
      },
      unlocked() {
        return hasUpgrade("c", 17);
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "15px",
      },
    },
  },
  upgrades: {
    11: {
      title: "Dusty",
      description: "Passively generate 1% of Quarks",
      cost: new Decimal(3),
    },
    15: {
      title: "Best Buy",
      description: "Best Cosmic Dust boosts particles",
      cost: new Decimal(2),
      effect() {
        return Decimal.log(player.c.best.add(1.001), 1.005);
      },
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
    },
    12: {
      title: "Radar technology",
      description:
        "Utilized advanced telescopes to perform a search of the universe. Who knows what you may unlock. Unlock the Orbital Station",
      cost: new Decimal(3),
      currencyDisplayName: "advanced telescopes",
      currencyInternalName: "adt",
      currencyLayer: "c",
      onPurchase() {
        player.OS.unlocked = true;
      },
      unlocked() {
        return hasChallenge("a", 11);
      },
      effect() {
        player.c.unlocked6 = new Decimal(1);
      },
    },
    13: {
      title: "Clickable grind",
      description: "Obtain 2 telescopes per click",
      cost: new Decimal(9),
    },
    14: {
      title: "Clickable grind 2.0",
      description: "Obtain 4 telescopes per click",
      cost: new Decimal(12),
      unlocked() {
        return true;
      },
    },
    16: {
      title: "Refractive Power",
      description:
        "1/10 chance for a math fragment or negative math fragment, from prestiging for quarks. This is used for stardust",
      cost: new Decimal(30),
      unlocked() {
        return true;
      },
    },
    17: {
      title: "Highend Observatory",
      description:
        "Annilihate positive and negative math fragments to gain stardust. Read more under astronomy tab",
      cost: new Decimal(51),
      unlocked() {
        return true;
      },
    },
    21: {
      title: "Astronomical gains",
      description: "10x particle gain",
      cost: new Decimal(35000),
      unlocked() {
        return hasUpgrade("hm", 37);
      },
    },
    22: {
      title: "Frequent arcs",
      description: "10x particle gain",
      cost: new Decimal(60000),
      unlocked() {
        return hasUpgrade("hm", 37);
      },
    },
    23: {
      title: "Diamond Mines",
      description: "10x atom gain",
      cost: new Decimal(75000),
      unlocked() {
        return hasUpgrade("hm", 37);
      },
    },
    24: {
      title: "Furious storm",
      description: "10x quark gain",
      cost: new Decimal(105000),
      unlocked() {
        return hasUpgrade("hm", 37);
      },
    },
  },
  buyables: {
    11: {
      cost() {
        return new Decimal(100);
      },
      title() {
        return "Advanced Telescope converter";
      },
      display() {
        return "Exchange your telescopes for advanced telescopes";
      },
      canAfford() {
        return player.c.t.gte(this.cost(1));
      },
      unlocked() {
        return hasChallenge("a", 11) || player.c.adt.gte(1);
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.c.t.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.c.t = player.c.t.sub(costPerUnit.mul(max));
        player.c.adt = player.c.adt.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "Costs 100 telescopes",
    },
    12: {
      cost() {
        return new Decimal(20);
      },
      title() {
        return "Super Advanced Telescope converter";
      },
      display() {
        return "Exchange your advanced telescopes for super advanced telescopes";
      },
      canAfford() {
        return player.c.adt.gte(this.cost(1));
      },
      unlocked() {
        return player.c.adt.gte(1);
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost(1);
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.c.adt.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }

        player.c.adt = player.c.adt.sub(costPerUnit.mul(max));
        player.c.sat = player.c.sat.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      tooltip: "Costs 20 advanced telescopes",
    },
  },
  infoboxes: {
    lore: {
      title: "Universe charting",
      body() {
        return "Clicking each clickable sacrfices x amount of telescopes, advanced telescopes and cosmic dust and any other resource listed. However, some reveal new stats or other goodies. Clicking a previously bought clickable will NOT add any boosts ";
      },
      unlocked() {
        return hasUpgrade("c", 12);
      },
    },
  },
});
