addLayer("b", {
  infoboxes: {
    lore: {
      title: "Boracite",
      body() {
        return "Boracite is a rare Earth mineral, its atomic composition is MG3B7O13CL(those numbers are supposed to be subscripts). Boracite is the stand-in for the other path atoms could take, essentially all inorganic material. Cells, is the organic pathway.";
      },
    },
    lore2: {
      title: "Geodes",
      body() {
        return `Geodes are an RNG buyable, where you have a random chance of getting some cool materials. They can either boost stats or be used in craftables! All geode stats survive resets(except explicit layer stats, like boracite)
           `;
      },
    },
  },
  name: "Boracite", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 5, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
      keepCUpgrades: false,

      boraciteGeodePoint: new Decimal(0),

      Agate: new Decimal(0),
      Moonstone: new Decimal(0),
      moonstoneMultiplier() {
        return new Decimal(1).add(this.Moonstone.mul(1.5));
      },
      arbitoriteMultiplier() {
        return new Decimal(1.2).add(this.Arbitorite.mul(4));
      },
      voidstoneMultiplier() {
        if (this.Voidstone.lte(1)) {
          return new Decimal(1);
        } else {
          return new Decimal(10000).add(this.Voidstone.mul(10000));
        }
      },
      Arbitorite: new Decimal(0),
      Grandulum: new Decimal(0),
      Voidstone: new Decimal(0),

      tetraGeodePoint: new Decimal(0),

      Orpiment: new Decimal(0),
      Realgar: new Decimal(0),
      Tigium: new Decimal(0),
      Vauqrase: new Decimal(0),
      Xenoomium: new Decimal(0),
      realgarMultiplier() {
        return new Decimal(1).add(this.Realgar.mul(1.6));
      },
      tigiumMultiplier() {
        return new Decimal(1).add(this.Tigium.mul(2.22));
      },
      vauqraseMultiplier() {
        return this.Vauqrase.lt(1)
          ? new Decimal(1)
          : new Decimal(1).add(this.Vauqrase.mul(40));
      },
      xenoomiumMultiplier() {
        return this.Xenoomium.lt(1)
          ? new Decimal(1)
          : new Decimal(400000).add(this.Xenoomium.mul(400000));
      },

      geometricGeodePoint: new Decimal(0),

      Panenite: new Decimal(0),
      Jahelium: new Decimal(0),
      Trilithium: new Decimal(0),
      Orbindium: new Decimal(0),
      Bloodstone: new Decimal(0),

      paneniteMultiplier() {
        return new Decimal(1).add(this.Panenite.mul(1.5432));
      },
      orbindiumMultiplier() {
        return this.Orbindium.lt(1)
          ? new Decimal(1)
          : new Decimal(3).add(this.Orbindium.mul(5));
      },
      bloodstoneMultiplier() {
        return this.Bloodstone.lt(1)
          ? new Decimal(1)
          : new Decimal(1000000).add(this.Bloodstone.mul(1000000));
      },

      megaGeodePoint: new Decimal(0),

      Kalium: new Decimal(0),
      Korium: new Decimal(0),
      Kessium: new Decimal(0),
      Megatronics: new Decimal(0),

      koriumMultiplier() {
        return this.Korium.lt(1)
          ? new Decimal(1)
          : new Decimal(2).mul(this.Korium.mul(2));
      },
      kessiumMultiplier() {
        return this.Kessium.lt(1)
          ? new Decimal(1)
          : new Decimal(4).mul(this.Kessium.mul(16));
      },
      megatronicsMultiplier() {
        return this.Megatronics.lt(1) ? new Decimal(1) : new Decimal(10);
      }, // finish
    };
  },
  color: "#36d1e6",
  softcap: new Decimal(150),
  softcapPower: new Decimal(0.5),
  requires: new Decimal(2000000), // Can be a function that takes requirement increases into account
  resource: "Boracite", // Name of prestige currency
  baseResource: "Cosmic Dust", // Name of resource prestige is based on
  baseAmount() {
    return player.c.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [
      "Agate",
      "Moonstone",
      "Arbitorite",
      "Grandulum",
      "Voidestone",
      "Orpiment",
      "Realgar",
      "Tigium",
      "Vauqrase",
      "Xenoomium",
      "Panenite",
      "Jahelium",
      "Trilithium",
      "Orbindium",
      "Bloodstone",
      "Kalium",
      "Korium",
      "Kessium",
      "Megatronics",
    ];

    if (layers[reset].row > this.row) {
      layerDataReset("b", keep);
    }
  },

  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (player.ct.bdust.gte(1)) mult = mult.times(player.ct.bdustEffect1());
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("n", 12)) mult = mult.times(4);
    }
    if (hasUpgrade("d", 31)) mult = mult.times(20);
    if (hasUpgrade("d", 43)) mult = mult.times(100);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  nodeStyle() {
    let style = {
      "border-radius": "0px",
      animation: "spin 8s linear infinite",
      "background-image": "linear-gradient( #35bee0, #39c0ff)",
      width: "100px",
      height: "100px",
    };
    if (player.b.unlocked || tmp.b.canReset) {
      return { ...style };
    } else return { "border-radius": "0px" };
  },
  update() {
    if (player.b.boraciteGeodePoint.gte(1)) {
      let chance = Math.random();
      if (chance < 1 / 25000) {
        player.b.Voidstone = player.b.Voidstone.plus(1);
      } else if (chance < 1 / 4000) {
        player.b.Grandulum = player.b.Grandulum.plus(1);
      } else if (chance < 1 / 150) {
        player.b.Arbitorite = player.b.Arbitorite.plus(1);
      } else if (chance < 1 / 40) {
        player.b.Moonstone = player.b.Moonstone.plus(1);
      } else if (chance < 1 / 20) {
        player.b.Agate = player.b.Agate.plus(1);
      } else if (chance < 1 / 5) {
        player.b.points = player.b.points.plus(1);
      } else {
        player.b.boraciteGeodePoint = player.b.boraciteGeodePoint.plus(1);
      }
      player.b.boraciteGeodePoint = player.b.boraciteGeodePoint.sub(1);
    }
    if (player.b.tetraGeodePoint.gte(1)) {
      let chance = Math.random();
      if (chance < 1 / 65000) {
        player.b.Xenoomium = player.b.Xenoomium.plus(1);
      } else if (chance < 1 / 2000) {
        player.b.Vauqrase = player.b.Vauqrase.plus(1);
      } else if (chance < 1 / 120) {
        player.b.Realgar = player.b.Realgar.plus(1);
      } else if (chance < 1 / 66) {
        player.b.Tigium = player.b.Tigium.plus(1);
      } else if (chance < 1 / 15) {
        player.b.Orpiment = player.b.Orpiment.plus(1);
      } else if (chance < 1 / 3) {
        player.t.points = player.t.points.plus(1);
      } else {
        player.b.tetraGeodePoint = player.b.tetraGeodePoint.plus(1);
      }
      player.b.tetraGeodePoint = player.b.tetraGeodePoint.sub(1);
    }
    if (player.b.geometricGeodePoint.gte(1)) {
      let chance = Math.random();
      if (chance < 1 / 40000) {
        player.b.Bloodstone = player.b.Bloodstone.plus(1);
      } else if (chance < 1 / 8000) {
        player.b.Orbindium = player.b.Orbindium.plus(1);
      } else if (chance < 1 / 720) {
        player.b.Trilithium = player.b.Trilithium.plus(1);
      } else if (chance < 1 / 45) {
        player.b.Jahelium = player.b.Jahelium.plus(1);
      } else if (chance < 1 / 12.22) {
        player.b.Panenite = player.b.Panenite.plus(1);
      } else if (chance < 1 / 2) {
        player.chm.geometricDome = player.chm.geometricDome.plus(1);
      } else {
        player.b.geometricGeodePoint = player.b.geometricGeodePoint.plus(1);
      }
      player.b.geometricGeodePoint = player.b.geometricGeodePoint.sub(1);
    }
    if (player.b.megaGeodePoint.gte(1)) {
      let chance = Math.random();
      if (chance < 1 / 80000) {
        player.b.Megatronics = player.b.Megatronics.plus(1);
      } else if (chance < 1 / 12000) {
        player.b.Kessium = player.b.Kessium.plus(1);
      } else if (chance < 1 / 1400) {
        player.b.Korium = player.b.Korium.plus(1);
      } else if (chance < 1 / 240) {
        player.b.Kalium = player.b.Kalium.plus(1);
      } else if (chance < 1 / 70) {
        player.mm.points = player.mm.points.plus(1);
      } else {
        player.b.megaGeodePoint = player.b.megaGeodePoint.plus(1);
      }
      player.b.megaGeodePoint = player.b.megaGeodePoint.sub(1);
    }
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["t", "c"],
  hotkeys: [
    {
      key: "b",
      description: "B: Reset for Boracite",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.chm.unlocked;
  },
  milestones: {
    1: {
      requirementDescription: "1 Boracite",
      effectDescription:
        "<b>BRR!!</b> It's cold. Passively generate Cosmic Dust at 100%, also passively generate telescopes. And keep cosmic dust upgrades on reset.",
      done() {
        return player.b.points.gte(1);
      },
      onComplete() {
        player.c.permanetGeneration = true;
        player[this.layer].keepCUpgrades = true;
      },
    },
    2: {
      requirementDescription: "3 Boracite",
      effectDescription: "Unlock the Tetra Geode!",
      done() {
        return player.b.points.gte(3);
      },
    },
    3: {
      requirementDescription: "4 Boracite",
      effectDescription: "Unlock an Agate craftable",
      done() {
        return player.b.points.gte(4);
      },
    },
    4: {
      requirementDescription: "7 Boracite",
      effectDescription: "Unlock the Geometric Dome Geode!",
      done() {
        return player.b.points.gte(7);
      },
    },
    5: {
      requirementDescription: "150 Boracite",
      effectDescription: "Unlock the Mega Geode!",
      done() {
        return player.b.points.gte(150);
      },
      unlocked() {
        return challengeCompletions("n", 11) >= 3;
      },
    },
  },
  tabFormat: {
    "The Palisade Walls": {
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
            return "You have " + format(player.c.points) + " Cosmic Dust.";
          },
        ],
        "blank",
        ["infobox", "lore"],
        "milestones",

        "challenges",
      ],
    },
    Geodes: {
      content: [
        ["infobox", "lore2"],
        [
          "row",
          [
            ["buyable", "11"],
            "blank",
            ["v-line", "200px"],
            "blank",
            [
              "display-text",
              function () {
                return (
                  format(player.b.points) +
                  " Boracite<br>" +
                  format(player.b.Agate) +
                  " Agate<br>" +
                  format(player.b.Moonstone) +
                  " Moonstone<br>" +
                  format(player.b.Arbitorite) +
                  " Arbitorite<br>" +
                  format(player.b.Grandulum) +
                  " Grandulum<br>" +
                  format(player.b.Voidstone) +
                  "<i> Voidstone</i>"
                );
              },
              { "font-size": "25px" },
            ],
            "blank",
            ["v-line", "200px"],
            "blank",
            [
              "display-text",
              function () {
                return (
                  "Boosts:<br> " +
                  "Boracite: Obvious<br>" +
                  "Agate: None<br>" +
                  "Moonstone: " +
                  format(player.b.moonstoneMultiplier()) +
                  "x, for Quarks<br>" +
                  "Arbitorite: " +
                  format(player.b.arbitoriteMultiplier()) +
                  "x, for Cosmic Dust<br>" +
                  "Grandulum: None<br>" +
                  "Void Stone: " +
                  format(player.b.voidstoneMultiplier()) +
                  "x, to Vinyl Multiplier"
                );
              },
            ],
          ],
        ],
        "blank",
        ["h-line", "800px"],
        "blank",
        [
          "row",
          () => {
            return hasMilestone("b", 2)
              ? [
                  ["buyable", "12"],
                  "blank",
                  ["v-line", "200px"],
                  "blank",
                  [
                    "display-text",
                    format(player.t.points) +
                      " Tetra<br>" +
                      format(player.b.Orpiment) +
                      " Orpiment<br>" +
                      format(player.b.Tigium) +
                      " Tigium<br>" +
                      format(player.b.Realgar) +
                      " Realgar<br>" +
                      format(player.b.Vauqrase) +
                      " Vauqrase<br>" +
                      format(player.b.Xenoomium) +
                      "<i> Xenoomium</i>",
                    { "font-size": "25px" },
                  ],
                  "blank",
                  ["v-line", "200px"],
                  "blank",
                  [
                    "display-text",
                    "Boosts:<br> " +
                      "Tetra: Obvious<br>" +
                      "Orpiment: None<br>" +
                      "Tigium: None<br>" +
                      "Realgar: " +
                      format(player.b.realgarMultiplier()) +
                      "x, for Atoms<br>" +
                      "Vauqrase: " +
                      format(player.b.vauqraseMultiplier()) +
                      "x, for Mechanical Multiplier(and scrap)<br>" +
                      "Xenoomium: " +
                      format(player.b.xenoomiumMultiplier()) +
                      "x, to Multiplier",
                  ],
                ]
              : null;
          },
        ],
        "blank",
        ["h-line", "800px"],
        ["blank", "60px"],
        [
          "row",
          () => {
            return hasMilestone("b", 4)
              ? [
                  ["buyable", "13"],
                  ["blank", "60px"],
                  ["blank", "60px"],
                  [
                    "display-text",
                    format(player.chm.geometricDome) +
                      " Geometric Domes<br>" +
                      format(player.b.Panenite) +
                      " Panenite<br>" +
                      format(player.b.Jahelium) +
                      " Jahelium<br>" +
                      format(player.b.Trilithium) +
                      " Trilithium<br>" +
                      format(player.b.Orbindium) +
                      " Orbindium<br>" +
                      format(player.b.Bloodstone) +
                      " <i>Bloodstone</i><br>",
                    { "font-size": "25px" },
                  ],
                  "blank",
                  ["v-line", "200px"],
                  "blank",
                  [
                    "display-text",
                    "Boosts:<br> " +
                      "Panenite: " +
                      format(player.b.paneniteMultiplier()) +
                      "x, for particles<br>" +
                      "Jahelium: " +
                      "None<br>" +
                      "Trilithium: " +
                      "None<br>" +
                      "Orbindium: " +
                      format(player.b.orbindiumMultiplier()) +
                      "x, for Tetra<br>" +
                      "Bloodstone: " +
                      format(player.b.bloodstoneMultiplier()) +
                      "x, for Cosmic Dust",
                  ],
                ]
              : null;
          },
        ],
        ["blank", "60px"],
        ["h-line", "800px"],
        "blank",
        [
          "row",
          () => {
            return hasMilestone("b", 5)
              ? [
                  ["buyable", "14"],
                  "blank",
                  ["v-line", "200px"],
                  "blank",
                  [
                    "display-text",
                    format(player.mm.points) +
                      " Mega Multiplier<br>" +
                      format(player.b.Kalium) +
                      " Kalium<br>" +
                      format(player.b.Korium) +
                      " Korium<br>" +
                      format(player.b.Kessium) +
                      " Kessium<br>" +
                      format(player.b.Megatronics) +
                      " Megatronics<br>",
                    { "font-size": "21px" },
                  ],
                  "blank",
                  ["v-line", "200px"],
                  "blank",
                  [
                    "display-text",
                    "Boosts:<br> " +
                      "Mega Multiplier: Obvious<br>" +
                      "Kalium: None<br>" +
                      "Korium: " +
                      format(player.b.koriumMultiplier()) +
                      "x, for Cosmic Dust<br>" +
                      "Kessium: " +
                      format(player.b.kessiumMultiplier()) +
                      "x, for Atoms<br>" +
                      "Megatronics: " +
                      format(player.b.megatronicsMultiplier()) +
                      "x, for Dimensional Points(Dimensions)<br>",
                  ],
                ]
              : null;
          },
        ],
      ],
    },
  },
  buyables: {
    11: {
      cost() {
        return new Decimal(1);
      },
      title: "Boracite Geode",
      display() {
        return (
          "Spend Boracite for random materials! They can boost various stats or be used to craft craftables" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.b.points.gte(this.cost());
      },
      buyMax() {
        let costPerUnit = new Decimal(1);
        let max = new Decimal(1);

        max = player.b.points.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.b.points = player.b.points.sub(costPerUnit.mul(max));
        player.b.boraciteGeodePoint = player.b.boraciteGeodePoint.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "100px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "15px",
        width: "250px",
        height: "200px",
      },
    },
    12: {
      cost() {
        return new Decimal(30);
      },
      title: "Tetra Geode",
      display() {
        return (
          "Spend Tetra for random materials! They can boost various stats or be used to craft craftables" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.t.points.gte(this.cost());
      },
      buyMax() {
        let costPerUnit = new Decimal(1);
        let max = new Decimal(1);

        max = player.t.points.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.t.points = player.t.points.sub(costPerUnit.mul(max));
        player.b.tetraGeodePoint = player.b.tetraGeodePoint.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      unlocked() {
        return hasMilestone("b", 2);
      },
      style: {
        "border-radius": "100px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "15px",
        width: "250px",
        height: "200px",
      },
    },
    13: {
      cost() {
        return new Decimal(150);
      },
      title: "Geometric Geode",
      display() {
        return (
          "Spend Geometric Domes for random materials! They can boost various stats or be used to craft craftables" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.chm.geometricDome.gte(this.cost());
      },
      buyMax() {
        let costPerUnit = new Decimal(1);
        let max = new Decimal(1);

        max = player.chm.geometricDome.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.chm.geometricDome = player.chm.geometricDome.sub(
          costPerUnit.mul(max),
        );
        player.b.geometricGeodePoint = player.b.geometricGeodePoint.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      unlocked() {
        return hasMilestone("b", 2);
      },
      class: ["diamond"],
      style() {
        let style = {
          "border-radius": "0px",
          "border-color": "#000000",

          "font-family": "Times New Roman",
          "font-size": "15px",
          width: "250px",
          height: "200px",
        };
        if (this.canAfford() == true) {
          return { "background-color": "#40ba24", ...style };
        }
        return { ...style };
      },
    },
    14: {
      cost() {
        return new Decimal(15);
      },
      title: "Mega Geode",
      display() {
        return (
          "Spend Mega Multipliers for random materials! They can boost various stats or be used to craft craftables" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.mm.points.gte(this.cost());
      },
      buyMax() {
        let costPerUnit = new Decimal(1);
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
        player.b.megaGeodePoint = player.b.megaGeodePoint.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      unlocked() {
        return hasMilestone("b", 2);
      },

      style() {
        let style = {
          "border-radius": "0px",
          "border-color": "#000000",
          animation: "shake 8s linear infinite",
          "font-family": "Times New Roman",
          "font-size": "15px",
          width: "250px",
          height: "200px",
        };

        return { ...style };
      },
    },
  },
});
