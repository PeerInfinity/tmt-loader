addLayer("tdr", {
  name: "The Daily Roll",
  symbol() {
    return `<h6>${player.tdr.points.toNumber()}d${formatWhole(tmp.tdr.effect)}`;
  }, // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: Decimal.dZero,
      totalroll: Decimal.dZero,
      lastRoll: "",
      rollType: "additive",
      cooldown: 0,
      luck: 0,
    };
  },
  color: "#4BDC13",
  branches: ["cv", "tb"],
  effectDescription() {
    return `each having ${formatWhole(tmp.tdr.effect)} sides.`;
  },
  effect() {
    let sides = new Decimal(2);
    if (hasUpgrade("tb", 14)) sides = sides.add(1);
    sides = sides.add(buyableEffect("tdr", 11));
    sides = sides.add(buyableEffect("tdr", 12));
    sides = sides.add(buyableEffect("je", 11));
    if (hasUpgrade("ba", 11) && player.e.points.gte(2)) sides = sides.add(2);
    return sides;
  },
  requires: Decimal.dTen,
  resource: "dice",
  baseResource: "sickness",
  baseAmount() {
    return player.points;
  },
  type: "static",
  base: 10,
  exponent: Decimal.dOne,
  gainMult: Decimal.dOne,
  gainExp: Decimal.dOne,
  row: 1,
  hotkeys: [
    {
      key: "d",
      description: "D: Obtain some dice",
      onPress() {
        if (canReset("tdr")) doReset("tdr");
      },
    },
  ],
  layerShown() {
    return player.tdr.unlocked || hasUpgrade("cv", 14);
  },
  rollSumEffect() {
    const effect = player.tdr.totalroll.add(1);
    const exponent = Decimal.dOne;
    if (hasMilestone("tdr", 4)) exponent = exponent.mul(1.5);
    return effect.pow(exponent);
  },
  roll() {
    const rolls = [];
    for (let i = 0; i < player.tdr.points.toNumber(); i++) {
      rolls.push(
        new Decimal(Math.random())
          .mul(tmp.tdr.effect)
          .floor()
          .add(1)
          .toNumber(),
      );
    }
    player.tdr.lastRoll = rolls.join(", ");
    let score = Decimal.dZero;
    let sixes = 0;
    for (let i of rolls) {
      if (i == 6) sixes++;
      if (i == 20 && !hasMilestone("tdr", 5)) player.tdr.milestones.push(5);
    }
    if (sixes >= 6 && !hasMilestone("tdr", 2)) player.tdr.milestones.push(2);
    if (player.tdr.rollType === "additive") {
      score = rolls.reduce(
        (accumulated, current) => accumulated.add(current),
        Decimal.dZero,
      );
    } else {
      score = rolls.reduce(
        (accumulated, current) => accumulated.mul(current),
        Decimal.dOne,
      );
    }
    player.tdr.totalroll = player.tdr.totalroll.add(
      Decimal.mul(score, hasMilestone("e", 2) ? 2 : 1),
    );
    return;
  },
  clickables: {
    11: {
      title: "Daily Reminder to Roll",
      canClick() {
        return player.tdr.cooldown <= 0;
      },
      onClick() {
        layers.tdr.roll();
        let cool = 86400;
        if (hasChallenge(this.layer, 11)) {
          cool -= player.e.points.min(20).mul(3600).toNumber();
        }
        player.tdr.cooldown = cool;
      },
      display() {
        return `Roll your dice.
                Cooldown: ${formatTime(player.tdr.cooldown)}`;
      },
    },
  },
  buyables: {
    11: {
      title: "More spherical dice",
      cost(x = getBuyableAmount(this.layer, this.id)) {
        return new Decimal(100).pow(x.pow(2));
      },
      display() {
        return (
          "Add 1 side to all dice.<br>Cost: " +
          format(this.cost()) +
          " coronavirus<br>Currently: +" +
          formatWhole(getBuyableAmount(this.layer, this.id))
        );
      },
      canAfford() {
        return player.cv.points.gte(this.cost());
      },
      effect() {
        return getBuyableAmount(this.layer, this.id);
      },
      buy() {
        player.cv.points = player.cv.points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      unlocked() {
        return hasMilestone(this.layer, 1);
      },
    },
    12: {
      title: "Increased Luck",
      cost(x = getBuyableAmount(this.layer, this.id)) {
        return new Decimal(1e16).mul(Decimal.pow(16, x.pow(2)));
      },
      display() {
        return (
          "Jacorbian energy boosts dice sides.<br>Cost: " +
          format(this.cost()) +
          " Tuberculosis<br>Currently: +" +
          formatWhole(this.effect())
        );
      },
      canAfford() {
        return player.tb.points.gte(this.cost());
      },
      effect() {
        return getBuyableAmount(this.layer, this.id)
          .sqrt()
          .mul(player.je.points.add(10).log10().sqrt());
      },
      buy() {
        player.tb.points = player.tb.points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      unlocked() {
        return hasMilestone(this.layer, 3);
      },
    },
  },
  milestones: {
    1: {
      requirementDescription: "10 dice",
      effectDescription: "Unlock a buyable, and another tab at 15 dice",
      done() {
        return player.tdr.points.gte(10);
      },
    },
    2: {
      requirementDescription: "6 6s rolled",
      effectDescription:
        "Gain 666x coronavirus, and keep coronavirus upgrades on dice reset",
      done() {
        return false;
      },
    },
    3: {
      requirementDescription: "20 dice",
      effectDescription:
        "Keep tuberculosis upgrades on dice reset, and unlock another buyable",
      done() {
        return player.tdr.points.gte(20);
      },
    },
    4: {
      requirementDescription: "30 dice",
      effectDescription: "Raise the dice effect to the 1.5",
      done() {
        return player.tdr.points.gte(30);
      },
    },
    5: {
      requirementDescription: "Roll a 20",
      effectDescription: "Gain 20x Jacorbian Energy",
      done() {
        return false;
      },
    },
  },
  challenges: {
    11: {
      name: "Luck Testing",
      fullDisplay:
        "You have 1d20 seconds to complete this challenge. Completion is required for lycoris reset. If the challenge is failed or you quit, you lose all your lycoris flowers.<br>Goal: 1e16 sickness<br>Reward: The first 20 lycoris flowers each subtract 1 hour from roll timer",
      canComplete() {
        return player.points.gte(1e16);
      },
      onEnter() {
        player.tdr.luck = Math.floor(Math.random() * 20) + 1;
      },
      onExit() {
        player.e.points = new Decimal(0);
        player.e.total = new Decimal(0);
        player.e.milestones = [];
      },
    },
  },
  update(diff) {
    if (player.tdr.cooldown > 0) {
      player.tdr.cooldown -=
        diff *
        (hasUpgrade("tb", 15)
          ? tmp.t.timeCalculation.add(10).log10().toNumber()
          : 1) *
        (hasUpgrade("je", 13) ? upgradeEffect("je", 13).toNumber() : 1);
    }
    player.tdr.cooldown = Math.max(player.tdr.cooldown, 0);
    if (inChallenge(this.layer, 11)) player.tdr.luck = player.tdr.luck - diff;
    if (player.tdr.luck <= 0) {
      completeChallenge(this.layer, 11);
    }
  },
  tabFormat: {
    Dice: {
      unlocked: true,
      content: [
        "main-display",
        "prestige-button",
        [
          "display-text",
          () =>
            `Your rolls have added up to ${formatWhole(
              player.tdr.totalroll,
            )}, multiplying point gain by ${format(tmp.tdr.rollSumEffect)}`,
        ],
        "blank",
        "clickables",
        "blank",
        ["display-text", () => `Latest roll: ${player.tdr.lastRoll}`],
        "blank",
        "buyables",
      ],
    },
    Milestones: {
      unlocked() {
        return player.tdr.points.gte(5);
      },
      content: ["milestones"],
    },
    Challenges: {
      unlocked() {
        return player.tdr.points.gte(15);
      },
      content: ["challenges"],
    },
  },
});
