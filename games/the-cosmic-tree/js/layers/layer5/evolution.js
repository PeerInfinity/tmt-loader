addLayer("e", {
  name: "Evolution", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      hyperCanReset: true,

      evolutionEffect() {
        return new Decimal(37500).mul(player.e.best.plus(1));
      },
      organism: new Decimal(0),
      orgoCount: new Decimal(5),
      orgoNumber: new Decimal(5),
      evolutionCount: 0,
      displayTextFunction() {
        if (this.evolutionCount == 0) {
          return "Eukaryotes";
        }
        if (this.evolutionCount == 1) {
          return "Coral";
        }
        if (this.evolutionCount == 2) {
          return "Flatworms";
        }
        if (this.evolutionCount == 3) {
          return "Fish";
        }
        if (this.evolutionCount == 4) {
          return "Apes";
        }
        if (this.evolutionCount == 5) {
          return "Humans 2.0";
        }
      },
    };
  },
  bars: {
    bigBar: {
      direction: LEFT,
      width: 600,
      height: 50,
      fillStyle: { color: "blue", "background-color": "lightblue" },
      textStyle: {
        "font-size": "20px",
        "font-family": "Arial",
        "text-align": "center",

        color: "white",
      },
      borderStyle: { border: "4px solid white", "border-radius": "0px" },
      display() {
        return (
          "Organisms needed until Evolution: " +
          format(player.e.orgoCount) +
          " Organisms"
        );
      },
      progress() {
        return player[this.layer].orgoCount.div(player[this.layer].orgoNumber);
      },
    },
  },
  nodeStyle() {
    if (tmp.e.canReset || player.e.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(30, 121, 196) 0%, rgb(49, 197, 255) 50%, rgb(31, 119, 153) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  color: "#2688e4",
  best: new Decimal(0),
  requires() {
    return new Decimal(17).add(player.e.points);
  }, // Can be a function that takes requirement increases into account
  resource: "Evolution Points", // Name of prestige currency
  baseResource: "Organs", // Name of resource prestige is based on
  baseAmount() {
    return player.o.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = ["hyperCanReset"];

    if (layers[reset].row > this.row) {
      layerDataReset("e", keep);
    }
  },
  update() {},

  infoboxes: {
    evolution: {
      title: "Evolution",
      body() {
        return `Over the course of millions of years, single celled organisms became complex beings, like a human, dog, or blue whale.
            Now you will simulate the same. Also, cost increases for every evolution point you own
             `;
      },
    },
    orgos: {
      title: "Organisms",
      body() {
        return `Every x amount of organisms you get, you progress to a higher being. For example, once you pass the first hurdle of 5 organisms, you
            upgrade to coral
             `;
      },
    },
  },
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  row: 4, // Row the layer is in on the tree (0 is the first row)
  branches: ["o"],
  hotkeys: [
    {
      key: "e",
      description: "E: Reset for Evolution Points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.o.unlocked;
  },
  milestones: {
    0: {
      requirementDescription: "Eden of Evolution",
      effectDescription:
        "Passively Generate Cells, Hyper Multiplier is no longer reset by anything",
      done() {
        return player.e.points.gte(1);
      },
      onPurchase() {
        player[this.layer].hyperCanReset = false;
      },
    },
  },
  upgrades: {
    11: {
      title: "Beginnings of a New Evil",
      description: "10000x Cell Gain, 100x Tetra Gain",
      cost: new Decimal(1),
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [12],
    },
    12: {
      title: "Oceanic Beginnings",
      description: "1000000x Cell Gain, best Evolution Points boosts cell gain",
      cost() {
        return new Decimal(1);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      unlocked() {
        return hasUpgrade("e", 11);
      },
      branches: [13, 14],
    },
    13: {
      title: "Extraterrestrial Beginnings",
      description: "5000x Cell Gain",
      cost() {
        if (hasUpgrade("e", 14)) return new Decimal(10);
        else return new Decimal(2);
      },

      unlocked() {
        return hasUpgrade("e", 12);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [15],
    },
    15: {
      title: "Alien Bindings",
      description: "Unlock cosmic cells, under the Orbital Station",
      cost() {
        if (hasUpgrade("e", 16)) return new Decimal(15);
        else return new Decimal(3);
      },
      unlocked() {
        return hasUpgrade("e", 13);
      },
      onPurchase() {
        player.OS.ccellsUnlocked = true;
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [17],
    },
    17: {
      title: "Cosmic Catastrophe",
      description: "Cosmic Cells now boost Cell Gain",
      cost() {
        if (hasUpgrade("e", 18)) return new Decimal(20);
        else return new Decimal(4);
      },
      unlocked() {
        return hasUpgrade("e", 15);
      },
      effect() {
        let mult = new Decimal(100).mul(player.OS.ccells.plus(1));
        if (mult.gte(1e6)) mult = new Decimal(1e6);
        return mult;
      },
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [19],
    },
    19: {
      title: "Astronomical Odyssey",
      description:
        "Unlock Foreign Organs in the Orbital Station, best evolution points now also boost MM",
      cost() {
        if (hasUpgrade("e", 20)) return new Decimal(25);
        else return new Decimal(5);
      },
      effect() {
        return Decimal.log2(player.e.best.add(2)).mul(5);
      },
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
      unlocked() {
        return hasUpgrade("e", 17);
      },
      onPurchase() {
        player.OS.fOrgansUnlocked = true;
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [21],
    },
    21: {
      title: "E.T.",
      description: "Foreign Organs now boost Organ Gain",
      cost() {
        if (hasUpgrade("e", 20)) return new Decimal(30);
        else return new Decimal(6);
      },
      effect() {
        let mult = new Decimal(1).add(player.OS.fOrgans.plus(1).mul(0.1));
        if (mult.gte(10)) mult = new Decimal(10);
        return mult;
      },
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
      unlocked() {
        return hasUpgrade("e", 19);
      },

      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [23],
    },
    23: {
      title: "NASA's Big Break",
      description:
        "Unlock Alien Lifeforms in the Orbital Station, 100 times Mega Multiplier Boost",
      cost() {
        if (hasUpgrade("e", 24)) return new Decimal(35);
        else return new Decimal(7);
      },

      unlocked() {
        return hasUpgrade("e", 21);
      },

      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      onPurchase() {
        player.OS.aLifeformunlocked = true;
      },
      branches: [23],
    },
    14: {
      title: "Coral Keep",
      description: "50x Tetra Gain",
      cost() {
        if (hasUpgrade("e", 13)) return new Decimal(10);
        else return new Decimal(2);
      },
      unlocked() {
        return hasUpgrade("e", 12);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [16],
    },
    16: {
      title: "Great Barrier Reef",
      description: "Double Organism gain, Organisms now boost cell gain",
      cost() {
        if (hasUpgrade("e", 15)) return new Decimal(15);
        else return new Decimal(3);
      },
      unlocked() {
        return hasUpgrade("e", 14);
      },
      effect() {
        return new Decimal(1000).mul(player[this.layer].organism.plus(1));
      },
      effectDisplay() {
        return "Currently: " + format(this.effect()) + "x";
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [18],
    },
    18: {
      title: "Flatworm Cavern",
      description:
        "Double Organ gain(not the actual currency, but the organs themselves)",
      cost() {
        if (hasUpgrade("e", 17)) return new Decimal(20);
        else return new Decimal(4);
      },
      unlocked() {
        return hasUpgrade("e", 16);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [20],
    },
    20: {
      title: "Schools in fishion",
      description: "Triple Organ Gain",
      cost() {
        if (hasUpgrade("e", 19)) return new Decimal(25);
        else return new Decimal(5);
      },
      unlocked() {
        return hasUpgrade("e", 18);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [22],
    },
    22: {
      title: "Reign of the Ape Lord",
      description: "Double Organ Gain, Ten Times Mega Multiplier Gain",
      cost() {
        if (hasUpgrade("e", 21)) return new Decimal(30);
        else return new Decimal(6);
      },
      unlocked() {
        return hasUpgrade("e", 20);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
      branches: [24],
    },
    24: {
      title: "Revival of Origin",
      description: "Triple Organ Gain, Fifty Times Mega Multiplier Gain",
      cost() {
        if (hasUpgrade("e", 23)) return new Decimal(35);
        else return new Decimal(7);
      },
      unlocked() {
        return hasUpgrade("e", 22);
      },
      style: {
        "font-size": "15px",
        width: "200px",
        height: "200px",
      },
    },
  },
  buyables: {
    101: {
      cost(x) {
        return new Decimal(1).mul(x.plus(1));
      },
      display() {
        return (
          "Buy a Mega Multiplier multiplier(no pun intended)" +
          " | Cost: " +
          format(this.cost()) +
          " | effect: " +
          format(this.effect()) +
          "x"
        );
      },

      canAfford() {
        return player.e.points.gte(this.cost());
      },
      effect(x) {
        return new Decimal(5).mul(x.plus(1));
      },
      buy() {
        player.e.points = player.e.points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "20px",
        width: "300px",
        height: "300px",
      },
    },
    11: {
      cost(x) {
        return [
          new Decimal(1e41).mul(x.plus(1)),
          new Decimal(1e44).mul(x.plus(1)),
          new Decimal(1e32).mul(x.plus(1)),
          new Decimal(1e31).mul(x.plus(1)),
          new Decimal(1e29).mul(x.plus(1)),
          new Decimal(1e40).mul(x.plus(1)),
          new Decimal(1e17).mul(x.plus(1)),
        ];
      },
      display() {
        return (
          "Convert organelles into an organism! All the cell organelle costs follow the order they appear in the cell tab" +
          " | MCost: " +
          format(this.cost()[1]) +
          " | NCost: " +
          format(this.cost()[0]) +
          " | ERCost: " +
          format(this.cost()[2]) +
          " | VCost: " +
          format(this.cost()[3]) +
          " | GCost: " +
          format(this.cost()[4]) +
          " | CytoCost: " +
          format(this.cost()[5]) +
          " | CenergyCost: " +
          format(this.cost()[6])
        );
      },

      canAfford() {
        return (
          player.ce.mito.gte(this.cost()[1]) &&
          player.ce.nucleus.gte(this.cost()[0]) &&
          player.ce.endr.gte(this.cost()[2]) &&
          player.ce.vacu.gte(this.cost()[3]) &&
          player.ce.golgi.gte(this.cost()[4]) &&
          player.ce.cytoplasm.gte(this.cost()[5]) &&
          player.ce.cenergy.gte(this.cost()[6])
        );
      },

      buy() {
        player.ce.nucleus = player.ce.nucleus.sub(this.cost()[0]);
        player.ce.mito = player.ce.mito.sub(this.cost()[1]);
        player.ce.endr = player.ce.endr.sub(this.cost()[2]);
        player.ce.vacu = player.ce.vacu.sub(this.cost()[3]);
        player.ce.golgi = player.ce.golgi.sub(this.cost()[4]);
        player.ce.cytoplasm = player.ce.cytoplasm.sub(this.cost()[5]);
        player.ce.cenergy = player.ce.cenergy.sub(this.cost()[6]);

        player.e.organism = player.e.organism.add(1);
        calculateEvolution();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
      },
    },
    12: {
      cost(x) {
        return [new Decimal(3).add(x), new Decimal(2).add(x)];
      },
      display() {
        return (
          "Convert Bones and Muscle into Coral(Do note, these buyables are not accurate depictions of the anatomy of other beings)" +
          " | Bone cost: " +
          format(this.cost()[0]) +
          " | Muscle cost: " +
          format(this.cost()[1])
        );
      },

      canAfford() {
        return (
          player.o.bone.gte(this.cost()[0]) &&
          player.o.muscle.gte(this.cost()[1])
        );
      },

      buy() {
        player.o.bone = player.o.bone.sub(this.cost()[0]);
        player.o.muscle = player.o.muscle.sub(this.cost()[1]);

        player.e.organism = player.e.organism.add(1);
        calculateEvolution();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
      },
    },
    13: {
      cost(x) {
        return [
          new Decimal(3).add(x),
          new Decimal(4).add(x),
          new Decimal(2).add(x),
          new Decimal(1).add(x),
        ];
      },
      display() {
        return (
          "Convert Bones and Muscle and Testes and Kidneys into flatworms" +
          " | Bone cost: " +
          format(this.cost()[0]) +
          " | Muscle cost: " +
          format(this.cost()[1]) +
          " | Testicle cost: " +
          format(this.cost()[2]) +
          " | Kidney cost: " +
          format(this.cost()[3])
        );
      },

      canAfford() {
        return (
          player.o.bone.gte(this.cost()[0]) &&
          player.o.muscle.gte(this.cost()[1]) &&
          player.o.testes.gte(this.cost()[2]) &&
          player.o.kidney.gte(this.cost()[3])
        );
      },

      buy() {
        player.o.bone = player.o.bone.sub(this.cost()[0]);
        player.o.muscle = player.o.muscle.sub(this.cost()[1]);
        player.o.testes = player.o.testes.sub(this.cost()[2]);
        player.o.kidney = player.o.kidney.sub(this.cost()[3]);

        player.e.organism = player.e.organism.add(1);
        calculateEvolution();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
      },
    },
    14: {
      cost(x) {
        return new Decimal(2).add(x);
      },
      display() {
        return (
          "Convert Bones and Livers and Testes into fish" +
          " | Bone cost: " +
          format(this.cost()) +
          " | Liver cost: " +
          format(this.cost()) +
          " | Testicle cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return (
          player.o.bone.gte(this.cost()) &&
          player.o.liver.gte(this.cost()) &&
          player.o.testes.gte(this.cost())
        );
      },

      buy() {
        player.o.bone = player.o.bone.sub(this.cost());
        player.o.liver = player.o.liver.sub(this.cost());
        player.o.testes = player.o.testes.sub(this.cost());

        player.e.organism = player.e.organism.add(1);
        calculateEvolution();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
      },
    },
    15: {
      cost(x) {
        return [
          new Decimal(5).add(x.mul(0.5)),
          new Decimal(2).add(x.mul(0.5)),
          new Decimal(5).add(x.mul(0.5)),
          new Decimal(4).add(x.mul(0.5)),
        ];
      },
      display() {
        return (
          "Convert Muscles, Lungs, Bladders, and Uteruos into Apes" +
          " | Muscle cost: " +
          format(this.cost()[0]) +
          " | Lung cost: " +
          format(this.cost()[1]) +
          " | Bladder cost: " +
          format(this.cost()[2]) +
          " | Uterus cost: " +
          format(this.cost()[3])
        );
      },

      canAfford() {
        return (
          player.o.muscle.gte(this.cost()[0]) &&
          player.o.lung.gte(this.cost()[1]) &&
          player.o.bladder.gte(this.cost()[2]) &&
          player.o.uterus.gte(this.cost()[3])
        );
      },

      buy() {
        player.o.muscle = player.o.muscle.sub(this.cost()[0]);
        player.o.lung = player.o.lung.sub(this.cost()[1]);
        player.o.bladder = player.o.bladder.sub(this.cost()[2]);
        player.o.uterus = player.o.uterus.sub(this.cost()[3]);

        player.e.organism = player.e.organism.add(1);
        calculateEvolution();
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
      },
    },
    16: {
      cost(x) {
        return [new Decimal(3).add(x.mul(0.5)), new Decimal(1).add(x.mul(0.5))];
      },
      display() {
        return (
          "Convert Muscles and Brains into Humans 2.0" +
          " | Muscle cost: " +
          format(this.cost()[0]) +
          " | Brain cost: " +
          format(this.cost()[1])
        );
      },

      canAfford() {
        return (
          player.o.muscle.gte(this.cost()[0]) &&
          player.o.brain.gte(this.cost()[1])
        );
      },

      buy() {
        player.o.muscle = player.o.muscle.sub(this.cost()[0]);
        player.o.brain = player.o.brain.sub(this.cost()[1]);

        player.e.organism = player.e.organism.add(1);

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
        width: "300px",
        height: "300px",
      },
    },
  },
  tabFormat: {
    "Evolutionary Poles": {
      content: [
        [
          "main-display",
          function () {
            return "main-display";
          },
        ],
        [
          "prestige-button",
          function () {
            return "prestige-button";
          },
        ],

        [
          "display-text",
          function () {
            return hasUpgrade("e", 12)
              ? "Currently: " +
                  format(player[this.layer].evolutionEffect()) +
                  "x"
              : null;
          },
          { "font-size": "30px" },
        ],
        ["infobox", "evolution"],
        "blank",
        "milestones",
        ["buyable", "101"],
        [
          "upgrade-tree",
          [
            [11],
            [12],
            [13, 14],
            [15, 16],
            [17, 18],
            [19, 20],
            [21, 22],
            [23, 24],
          ],
        ],
      ],
    },
    Organisms: {
      content: [
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].organism) +
              " " +
              player[this.layer].displayTextFunction()
            );
          },
          {
            "font-size": "60px",
            border: "2px solid #616161",
            "background-color": "#2489a8",
          },
        ],
        "blank",
        ["infobox", "orgos"],
        ["bar", "bigBar"],
        function () {
          if (player[this.layer].evolutionCount == 0) {
            return ["buyable", "11"];
          }
          if (player[this.layer].evolutionCount == 1) {
            return ["buyable", "12"];
          }
          if (player[this.layer].evolutionCount == 2) {
            return ["buyable", "13"];
          }
          if (player[this.layer].evolutionCount == 3) {
            return ["buyable", "14"];
          }
          if (player[this.layer].evolutionCount == 4) {
            return ["buyable", "15"];
          }
          if (player[this.layer].evolutionCount == 5) {
            return ["buyable", "16"];
          }
        },
      ],
    },
  },
});
