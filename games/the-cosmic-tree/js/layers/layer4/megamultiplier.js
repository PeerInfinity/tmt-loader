addLayer("mm", {
  name: "Mega Multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "MM", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
      upgradesBought: new Decimal(0),
      keep: false,
    };
  },
  color: "#511111",
  requires: new Decimal(300), // Can be a function that takes requirement increases into account
  resource: "Mega Multipliers", // Name of prestige currency
  baseResource: "Heavy Multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.hm.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = ["keep"];

    if (layers[reset].row > this.row) {
      layerDataReset("mm", keep);
    }
  },
  update() {},
  nodeStyle: {
    "border-radius": "0px",
    width: "150px",
    height: "100px",
    animation: "shake 0.5s linear infinite",
    "font-size": "50px",
  },
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (getBuyableAmount("d", 14).gte(1))
      mult = mult.times(buyableEffect("d", 14));
    if (hasUpgrade("d", 35)) mult = mult.times(1.5);
    if (hasUpgrade("d", 47)) mult = mult.times(2);
    if (hasUpgrade("e", 22)) mult = mult.times(10);
    if (hasUpgrade("e", 23)) mult = mult.times(100);
    if (hasUpgrade("e", 24)) mult = mult.times(50);
    if (getBuyableAmount("e", 101).gte(1))
      mult = mult.times(buyableEffect("e", 101));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  row: 3, // Row the layer is in on the tree (0 is the first row)
  branches: ["hm", "chm"],
  hotkeys: [
    {
      key: "Ctrl + M",
      description: "Ctrl + M: Reset for Mega Multiplier",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.chm.unlocked;
  },

  upgrades: {
    11: {
      title: "Mega Atrocities",
      description:
        "Passively Generate Heavy Multiplier, and enjoy a 3x boost to every multiplier stat(except hyper)",
      cost: new Decimal(1),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 1.2s linear infinite",
      },
    },
    12: {
      title: "Titanic Multiplier",
      description:
        "30x particle boost, and keep Heavy Multiplier upgrades and milestones on reset",
      cost: new Decimal(2),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 1s linear infinite",
      },
    },
    13: {
      title: "Gargantuan Overload",
      description:
        "2x Mechanical Multiplier gain, 7x Vinyl Multiplier gain, and keep Arzendics on reset ",
      cost: new Decimal(3),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 0.8s linear infinite",
      },
      onPurchase() {
        player[this.layer].keep = true;
      },
    },
    21: {
      title: "Colossal Conondrum",
      description: "2x Heavy Multiplier gain, 5x Scrap Gain, ",
      cost: new Decimal(7),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 0.6s linear infinite",
      },
    },
    22: {
      title: "Humongous Overture",
      description: "Mega Multiplier now boosts vinyl and multiplier gain.",
      cost: new Decimal(12),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 1.7s linear infinite",
      },
      effect() {
        if (hasUpgrade("mm", 32)) {
          return player.mm.points.add(1).pow(0.8);
        } else return player.mm.points.add(1).pow(0.5);
      },
      effectDisplay() {
        return format(upgradeEffect("mm", 22)) + "x";
      },
    },
    23: {
      title: "Minigun",
      description: "10x quark boost, 5x Atom boost ",
      cost: new Decimal(20),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 1.11s linear infinite",
      },
    },
    31: {
      title: "Crammed Cannon",
      description: "MEGA LAUNCH GAIN!!! 20x particle boost ",
      cost: new Decimal(35),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 3s linear infinite",
      },
    },
    32: {
      title: "Polar Function",
      description: "Improve upgrade 22's formula",
      cost: new Decimal(50),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 0.05s linear infinite",
      },
    },
    33: {
      title: "Badass Megachute",
      description: "Double Cell gain, e.g. all organelles, etc... ",
      cost: new Decimal(120),
      style: {
        width: "200px",
        height: "200px",
        "font-size": "16px",
        animation: "shake 1.3s linear infinite",
      },
    },
  },
  buyables: {
    12: {
      cost(x) {
        return new Decimal(x.plus(1)).pow(2);
      },
      title: "Upmodal Chaos",
      display() {
        return (
          "Vinyl Multiplier's buyable is MEGA-BUFFED" +
          " <br>cost: " +
          format(this.cost()) +
          " Mega Multipliers |" +
          " effect: " +
          format(this.effect()) +
          "x"
        );
      },
      effect(x) {
        return new Decimal(2).mul(x.mul(1000));
      },
      canBuyMax: true,
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },

      buy() {
        player.mm.points = player.mm.points.sub(this.cost());

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        width: "300px",
        height: "300px",
        "font-size": "27px",
        animation: "shake 12s linear infinite",
      },
    },
    13: {
      cost(x) {
        return new Decimal(x).mul(5).add(x.plus(2));
      },
      title: "Affluent Fracas",
      display() {
        return (
          "Heavy Multiplier now boosts Vinyl multiplier, each buying improves the formula" +
          " <br>cost: " +
          format(this.cost()) +
          " Mega Multipliers |" +
          " effect: " +
          format(this.effect()) +
          "x"
        );
      },
      effect(x) {
        return player.hm.points.add(1).add(x).pow(0.8);
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      canBuyMax: true,
      buyMax() {
        let costPerUnit = this.cost();

        let max = new Decimal(1);

        max = player.mm.points.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.mm.points = player.mm.points.sub(costPerUnit.mul(max));

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        width: "300px",
        height: "300px",
        "font-size": "22px",
        animation: "shake 12s linear infinite",
      },
    },
  },
});
