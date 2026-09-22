addLayer("ct", {
  name: "Crafting Table", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CT", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(1),
      hq: new Decimal(0), // Hyper Quarks
      sdust: new Decimal(0), // Stardust
      amult: new Decimal(0), // Atomic multiplier

      stars: new Decimal(0),

      hatom: new Decimal(0),
      nuke: new Decimal(0),

      fire: new Decimal(0),
      bastion: new Decimal(0),
      volcano: new Decimal(0),
      supernova: new Decimal(0),
      galaxy: new Decimal(0),
      blackhole: new Decimal(0),
      whitehole: new Decimal(0),
      bigBang: new Decimal(0),
      spaceCrystal: new Decimal(0),

      bdust: new Decimal(0), // black dust
      bdustEffect1() {
        return new Decimal(2).mul(this.bdust);
      },
      bdustEffect2() {
        return new Decimal(4).mul(this.bdust.mul(20));
      },
      vdust: new Decimal(0), // vortex dust
      edust: new Decimal(0), // ethereal dust
      pdust: new Decimal(0), // primal dust
      pmdust: new Decimal(0), // primeval dust
      pshard: new Decimal(0), // primeval shard
      blackKnife: new Decimal(0),
      dementedCrystal: new Decimal(0), // demented Crystal

      crystalFlake: new Decimal(0),
      flakeEffect1() {
        return new Decimal(1.5).mul(this.crystalFlake);
      },
      flakeEffect2() {
        return new Decimal(3).mul(this.crystalFlake.mul(15));
      },
    };
  },
  color: "#291103",
  requires: new Decimal(400), // Can be a function that takes requirement increases into account
  resource: "Crafting Table", // Name of prestige currency
  baseResource: "Multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.m.points;
  }, // Get the current amount of baseResource
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);

    return mult;
  },
  tooltip() {
    return "Craft 'till your heart is content!";
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  row: "side", // Row the layer is in on the tree (0 is the first row)
  update() {
    if (hasUpgrade("m", 16)) {
      player.ct.variable = new Decimal(1);
    }
  },
  hotkeys: [],
  layerShown() {
    return player.ct.unlocked;
  },
  update(diff) {
    if (getBuyableAmount("t", 34).gte(1) || hasMilestone("t", 1))
      player.ct.sdust = player.ct.sdust.plus(
        new Decimal(0.1).mul(getBuyableAmount("t", 34)).mul(diff),
      );
  },
  tabFormat: {
    Crafting: {
      content: [
        "main-display",

        "blank",
        ["infobox", "lore"],

        [
          "row",
          [
            ["buyable", "11"],
            ["buyable", "12"],
          ],
        ],
        [
          "row",
          [
            ["buyable", "13"],
            ["buyable", "14"],
          ],
        ],
        [
          "row",
          [
            ["buyable", "15"],
            ["buyable", "16"],
          ],
        ],
        [
          "row",
          [
            ["buyable", "17"],
            ["buyable", "18"],
          ],
        ],
        [
          "row",
          [
            ["buyable", "19"],
            ["buyable", "20"],
          ],
        ],
        [
          "row",
          [
            ["buyable", "21"],
            ["buyable", "22"],
          ],
        ],
        [
          "row",
          [
            ["buyable", "23"],
            ["buyable", "24"],
          ],
        ],
        function () {
          return inChallenge("d", 18) ? ["row", [["buyable", "25"]]] : null;
        },
      ],
    },
    Inventory: {
      content: [
        "blank",
        [
          "raw-html",
          () => {
            let html =
              "<div style='width:600px; height:800px; overflow:auto;'>";
            if (player.ct.hq.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.hq} Hyper Quarks</div>`;
            }
            if (player.ct.sdust.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.sdust} Star Dust</div>`;
            }
            if (player.ct.amult.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.amult} Atomic Multiplier</div>`;
            }
            if (player.ct.hatom.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.hatom} Heavy Atoms</div>`;
            }
            if (player.ct.stars.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.stars} Stars</div>`;
            }

            if (player.ct.fire.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.fire} Units of Fire</div>`;
            }
            if (player.ct.bastion.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.bastion} Bastions</div>`;
            }

            // Continuation of fire chain, when I eventually make it

            if (player.ct.bdust.gte(1)) {
              html += `<div style='font-size: 35px'>You have ${player.ct.bdust} Black Dust</div>`;
            }
            return html;
          },
        ],
      ],
    },

    "The Capsule": {
      content: [["buyable", "666"]],
    },
  },

  infoboxes: {
    lore: {
      title: "Crafting Table",
      body() {
        return `The Crafting Table allows you to craft items using resources you've gathered.
         Currently, this feature is under development and will be expanded in future updates.`;
      },
    },
  },

  buyables: {
    11: {
      cost(x) {
        return [new Decimal(3).mul(x.plus(1)), new Decimal(300).mul(x.plus(1))];
      },
      title() {
        return "Hyper Quarks";
      },
      display() {
        return (
          "Exchange " +
          format(this.cost()[0]) +
          " Hyper Multipliers and " +
          format(this.cost()[1]) +
          " Quarks for 1 Hyper Quark"
        );
      },
      canAfford() {
        if (
          player.h.points.gte(this.cost()[0]) &&
          player.q.points.gte(this.cost()[1])
        ) {
          return true;
        } else {
          return false;
        }
      },
      unlocked() {
        if (inChallenge("a", 12)) return false;
        else if (hasMilestone("h", 3)) return true;
      },
      buy() {
        player.h.points = player.h.points.sub(this.cost()[0]);
        player.q.points = player.q.points.sub(this.cost()[1]);
        player.ct.hq = player.ct.hq.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style() {
        return {
          backgroundImage: this.canAfford()
            ? "linear-gradient(90deg, rgb(0, 255, 13) 0%, rgb(214, 240, 227) 50%, rgb(187, 0, 212) 100%)"
            : "linear-gradient(90deg, rgb(0, 255, 21) 0%, rgb(214, 240, 227) 50%, rgb(183, 0, 207) 100%)",
          borderRadius: "0px",
          border: "4px ridge #788C82",
          fontSize: "20px",
          padding: "20px",
          width: "400px",
          height: "150px",
          fontColor: "#000000",
          fontFamily: "Times New Roman",
          animation: "rippleMove 20s ease infinite",
        };
      },
      purchaseLimit: 5,
    },
    12: {
      cost(x) {
        return new Decimal(2);
      },
      title() {
        return "Helium";
      },
      display() {
        return "Exchange 2 protons and 2 neutrons and 2 electrons for a Helium Atom";
      },
      canAfford() {
        if (
          player.a.protons.gte(this.cost()) &&
          player.a.neutrons.gte(this.cost()) &&
          player.a.electrons.gte(this.cost())
        ) {
          return true;
        } else {
          return false;
        }
      },
      unlocked() {
        if (hasAchievement("ach", 31)) return true;
      },
      buy() {
        player.a.protons = player.a.protons.sub(this.cost());
        player.a.neutrons = player.a.neutrons.sub(this.cost());
        player.a.electrons = player.a.electrons.sub(this.cost());
        player.ac.helium = player.ac.helium.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style() {
        return {
          backgroundImage:
            "linear-gradient(90deg, rgba(8, 34, 0, 0.48) 0%, rgb(43, 43, 43) 50%, rgb(48, 0, 0) 100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          backgroundSize: "800% 800%",
          fontSize: "20px",
          padding: "20px",
          width: "400px",
          height: "150px",
          fontColor: "#000000",
          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },

    15: {
      cost(x) {
        return new Decimal(100).mul(x.plus(1).pow(0.5));
      },
      title() {
        return "Stars";
      },
      display() {
        return (
          "Exchange stardust for stars. Each star boosts cosmic dust and vinyl multiplier production by 2x " +
          "cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        return new Decimal(2).mul(player.ct.stars);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      },
      canAfford() {
        if (player.ct.stars.gte(1e9)) return false;
        return player.ct.sdust.gte(this.cost());
      },
      unlocked() {
        return (
          getBuyableAmount("t", 34).gte(1) || player.ct.stars > new Decimal(1)
        );
      },
      buyMax() {},
      buy() {
        player.ct.sdust = player.ct.sdust.sub(this.cost());

        player.ct.stars = player.ct.stars.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style() {
        return {
          backgroundImage: this.canAfford()
            ? "linear-gradient(90deg, rgb(240, 205, 29) 0%, rgb(255, 159, 15) 50%, rgb(140, 87, 21) 100%)"
            : "linear-gradient(90deg, rgb(240, 205, 29) 0%, rgb(255, 159, 15) 50%, rgb(140, 87, 21) 100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          fontSize: "20px",
          padding: "20px",
          width: "400px",
          height: "150px",
          backgroundSize: "800% 800%",
          fontColor: "#000000",
          fontSize: "17px",
          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },

    20: {
      cost(x) {
        return new Decimal(5).mul(x.plus(1));
      },
      title() {
        return "Fire";
      },
      display() {
        return (
          "Burn Basalt to unlock the heat of all evil " +
          "cost(Basalt): " +
          format(this.cost())
        );
      },

      canAfford() {
        if (player.ct.fire.gte(1e9)) return false;
        return player.d.basalt.gte(this.cost());
      },
      unlocked() {
        return hasUpgrade("d", 24);
      },
      buyMax() {
        let costPerUnit = this.cost();

        let max = player.d.basalt.div(costPerUnit).floor();

        return [costPerUnit, max];
      },
      buy() {
        let [costPerUnit, max] = this.buyMax();
        if (max.lt(1)) max = new Decimal(1);
        player.d.basalt = player.d.basalt.sub(costPerUnit.mul(max));

        player.ct.fire = player.ct.fire.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style() {
        return {
          backgroundImage: this.canAfford()
            ? "linear-gradient(90deg, rgb(221, 156, 25) 0%, rgb(206, 80, 7) 50%, rgb(226, 223, 7)100%)"
            : "linear-gradient(90deg, rgb(221, 156, 25) 0%, rgb(206, 80, 7) 50%, rgb(226, 223, 7)100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          fontSize: "16px",
          padding: "20px",
          width: "400px",
          height: "150px",
          backgroundSize: "800% 800%",
          fontColor: "#000000",

          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },
    21: {
      cost(x) {
        return new Decimal(15).mul(x.plus(1));
      },
      title() {
        return "Bastions";
      },
      display() {
        return (
          "Combine basalt to create Bastions, the opposite of fire. Bastions boost dimensional points " +
          "cost(Basalt): " +
          format(this.cost())
        );
      },
      effect() {
        return new Decimal(1).add(player.ct.bastion.mul(0.1));
      },

      canAfford() {
        if (player.ct.fire.gte(1e9)) return false;
        return player.d.basalt.gte(this.cost());
      },
      unlocked() {
        return hasUpgrade("d", 29);
      },
      buyMax() {
        let costPerUnit = this.cost()[0];

        let max = player.d.basalt.div(costPerUnit).floor();

        return [costPerUnit, max];
      },
      buy() {
        let [costPerUnit, max] = this.buyMax();
        if (max.lt(1)) max = new Decimal(1);
        player.d.basalt = player.d.basalt.sub(costPerUnit.mul(max));

        player.ct.bastion = player.ct.bastion.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style() {
        return {
          backgroundImage: this.canAfford()
            ? "linear-gradient(90deg, rgb(49, 45, 37) 0%, rgb(65, 48, 38) 50%, rgb(128, 127, 100)100%)"
            : "linear-gradient(90deg, rgb(49, 45, 37) 0%, rgb(65, 48, 38) 50%, rgb(128, 127, 100)100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          fontSize: "16px",
          padding: "20px",
          width: "400px",
          height: "150px",
          backgroundSize: "800% 800%",
          fontColor: "#000000",

          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },
    23: {
      cost(x) {
        let y = player.ct.bdust;
        return [
          new Decimal(15).mul(y.plus(1)),
          new Decimal(1500).mul(y.plus(1)),
          new Decimal(1e10).mul(y.plus(1)),
        ];
      },
      title() {
        return "Black Knife";
      },
      display() {
        return (
          "Combine Nissionite, Boracite, and Cosmic Dust for Black Dust... a very, very interesting material | " +
          "cost(Nissionite): " +
          format(this.cost()[0]) +
          " | cost(Boracite): " +
          format(this.cost()[1]) +
          " | cost(Cosmic Dust): " +
          format(this.cost()[2]) +
          " | Effect: " +
          format(player[this.layer].bdustEffect1()) +
          "x -  boracite, cosmic dust, heavy multiplier + " +
          format(player[this.layer].bdustEffect2()) +
          "x - to particles"
        );
      },

      canAfford() {
        return false;
      },
      unlocked() {
        let unlocked = false;

        return unlocked;
      },

      buyMax() {
        let costPerUnit = this.cost()[0];
        let max = player.n.points.div(costPerUnit).floor();

        let costPerUnit2 = this.cost()[1];
        let max2 = player.b.points.div(costPerUnit2).floor();

        let costPerUnit3 = this.cost()[2];
        let max3 = player.c.points.div(costPerUnit3).floor();

        let trueMax = Decimal.min(max3, Decimal.min(max, max2));
        return [costPerUnit, costPerUnit2, costPerUnit3, trueMax];
      },
      buy() {
        let [costPerUnit, costPerUnit2, costPerUnit3, trueMax] = this.buyMax();
        if (trueMax.lt(1)) trueMax = new Decimal(1);
        player.n.points = player.n.points.sub(costPerUnit.mul(trueMax));
        player.b.points = player.b.points.sub(costPerUnit2.mul(trueMax));
        player.c.points = player.c.points.sub(costPerUnit3.mul(trueMax));

        player.ct.bdust = player.ct.bdust.add(trueMax);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(trueMax),
        );
      },
      style() {
        return {
          backgroundImage:
            "linear-gradient(90deg, rgb(18, 20, 20) 0%, rgb(13, 18, 19) 50%,rgb(13, 13, 22)100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          fontSize: "16px",
          padding: "20px",
          width: "400px",
          height: "185px",
          backgroundSize: "800% 800%",
          color: "#817878",

          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },
    24: {
      // Make later
      cost(x) {
        let y = player.ct.bdust;
        return [
          new Decimal(15).mul(y.plus(1)),
          new Decimal(1500).mul(y.plus(1)),
          new Decimal(1e10).mul(y.plus(1)),
        ];
      },
      title() {
        return "Vortex Dust";
      },
      display() {
        return (
          "Combine Nissionite, Boracite, and Cosmic Dust for Black Dust... a very, very interesting material | " +
          "cost(Nissionite): " +
          format(this.cost()[0]) +
          " | cost(Boracite): " +
          format(this.cost()[1]) +
          " | cost(Cosmic Dust): " +
          format(this.cost()[2]) +
          " | Effect: " +
          format(player[this.layer].bdustEffect1()) +
          "x -  boracite, cosmic dust, heavy multiplier + " +
          format(player[this.layer].bdustEffect2()) +
          "x - to particles"
        );
      },

      canAfford() {
        return false;
      },
      unlocked() {
        let unlocked = false;

        return unlocked;
      },

      buyMax() {
        let costPerUnit = this.cost()[0];
        let max = player.n.points.div(costPerUnit).floor();

        let costPerUnit2 = this.cost()[1];
        let max2 = player.b.points.div(costPerUnit2).floor();

        let costPerUnit3 = this.cost()[2];
        let max3 = player.c.points.div(costPerUnit3).floor();

        let trueMax = Decimal.min(max3, Decimal.min(max, max2));
        return [costPerUnit, costPerUnit2, costPerUnit3, trueMax];
      },
      buy() {
        let [costPerUnit, costPerUnit2, costPerUnit3, trueMax] = this.buyMax();
        if (trueMax.lt(1)) trueMax = new Decimal(1);
        player.n.points = player.n.points.sub(costPerUnit.mul(trueMax));
        player.b.points = player.b.points.sub(costPerUnit2.mul(trueMax));
        player.c.points = player.c.points.sub(costPerUnit3.mul(trueMax));

        player.ct.bdust = player.ct.bdust.add(trueMax);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(trueMax),
        );
      },
      style() {
        return {
          backgroundImage:
            "linear-gradient(90deg, rgb(18, 20, 20) 0%, rgb(13, 18, 19) 50%,rgb(13, 13, 22)100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          fontSize: "16px",
          padding: "20px",
          width: "400px",
          height: "185px",
          backgroundSize: "800% 800%",
          color: "#817878",

          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },
    25: {
      cost(x) {
        let y = player.ct.nuke;
        return [
          new Decimal(40),
          new Decimal(10),
          new Decimal(1),
          new Decimal(200),
          new Decimal(7),
          new Decimal(1e14),
        ];
      },
      title() {
        return "Nukes";
      },
      display() {
        return (
          "cost(Units of Fire): " +
          format(this.cost()[0]) +
          " | cost(Bombs): " +
          format(this.cost()[1]) +
          " | cost(Mecha Bombs): " +
          format(this.cost()[2]) +
          " | cost(mechanical multiplier): " +
          format(this.cost()[3]) +
          " | cost(black dust): " +
          format(this.cost()[4]) +
          " | cost(Atoms): " +
          format(this.cost()[5])
        );
      },

      purchaseLimit: new Decimal(1),
      canAfford() {
        return (
          player.ct.fire.gte(this.cost()[0]) &&
          player.chm.bomb.gte(this.cost()[1]) &&
          player.chm.mechanicalBomb.gte(this.cost()[2]) &&
          player.chm.points.gte(this.cost()[3]) &&
          player.ct.bdust.gte(this.cost()[4]) &&
          player.a.points.gte(this.cost()[5])
        );
      },
      unlocked() {
        return hasChallenge("d", 17);
      },
      buy() {
        player.ct.fire = player.ct.fire.sub(this.cost()[0]);
        player.chm.bomb = player.chm.bomb.sub(this.cost()[1]);
        player.chm.mechanicalBomb = player.chm.mechanicalBomb.sub(
          this.cost()[2],
        );
        player.chm.points = player.chm.points.sub(this.cost()[3]);
        player.ct.bdust = player.ct.bdust.sub(this.cost()[4]);
        player.a.points = player.a.points.sub(this.cost()[5]);

        pkayer.ct.nuke = player.ct.nuke.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style() {
        return {
          backgroundColor: "Yellow",
          borderRadius: "0px",
          border: "4px ridge #797979",
          fontSize: "16px",
          padding: "20px",
          width: "400px",
          height: "185px",
          backgroundSize: "800% 800%",
          color: "#817878",

          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },
  },
});
