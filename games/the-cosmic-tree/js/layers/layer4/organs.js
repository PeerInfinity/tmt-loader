addLayer("o", {
  name: "Organs", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),

      kidney: new Decimal(0),
      brain: new Decimal(0),
      bone: new Decimal(0),
      muscle: new Decimal(0),
      liver: new Decimal(0),
      lung: new Decimal(0),

      bladder: new Decimal(0),
      uterus: new Decimal(0),
      testes: new Decimal(0),

      orgoGain() {
        let mult = new Decimal(1);
        if (hasUpgrade("e", 18)) mult = mult.times(2);
        if (hasUpgrade("e", 20)) mult = mult.times(3);
        if (hasUpgrade("e", 21)) mult = mult.times(upgradeEffect("e", 21));
        return mult;
      },

      milestone3() {
        let mult = player.b.points.plus(1).pow(0.222);
        if (hasMilestone("o", 6)) mult = player.b.points.plus(1).pow(0.4);
        if (mult.lt(1)) return new Decimal(1);
        return mult;
      },
      milestone4() {
        let mult = player.mm.points.plus(1).pow(0.8);
        if (hasMilestone("o", 6)) mult = player.mm.points.plus(1).pow(0.9);
        if (mult.lt(1)) return new Decimal(1);
        return mult;
      },
      milestone5() {
        let mult = player.chm.points.plus(1).pow(0.555);
        if (hasMilestone("o", 6)) mult = player.chm.points.plus(1).pow(0.8);
        if (mult.lt(1)) return new Decimal(1);
        return mult;
      },
      milestone6() {
        let mult = player.n.points.plus(1).pow(0.6);
        if (hasMilestone("o", 6)) mult = player.n.points.plus(1).pow(0.66);
        if (mult.lt(1)) return new Decimal(1);
        return mult;
      },
      milestone7() {
        let mult = player.hm.points.plus(1).pow(0.5);

        if (mult.lt(1)) return new Decimal(1);
        return mult;
      },
    };
  },
  infoboxes: {
    organ: {
      title: "Organs",
      body() {
        return `It takes billions of cells for a single organ to form! And some organs, like the liver or kidney, have an ecosystem of 
            cell types, each being highly specialized to perform a specific function. Convert basic organs into human organs in order to rebuild civilization. It's
            kind of difficult to use all of the subcurrencies instead, so don't worry why only blood cells controls the layer! Later on, all of the other organs will be important!
             `;
      },
    },
  },
  hotkeys: [
    {
      key: "o",
      description: "O: Reset for Organs",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  nodeStyle() {
    if (tmp.o.canReset || player.o.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg, #ff5100 0%, rgb(214, 119, 30) 50%, rgb(214, 121, 14) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  color: "#ff5100", // eventually a linear gradient
  requires: new Decimal(15000),
  resource: "Organs", // Name of prestige currency
  baseResource: "Blood Cells", // Name of resource prestige is based on
  baseAmount() {
    return player.ce.bloodcells;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    if (layers[reset].row > this.row) {
      layerDataReset("o", keep);
    }
  },
  update() {},
  exponent: 1.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  row: 3, // Row the layer is in on the tree (0 is the first row)
  branches: ["ce", "t"],

  layerShown() {
    return player.d.unlocked;
  },
  milestones: {
    0: {
      requirementDescription: "1 Organ",
      effectDescription:
        "Venture upon your journey! Passively Generate Atoms at 100%, and keep all cell upgrades on reset",
      done() {
        return player.o.points.gte(1);
      },
    },
    1: {
      requirementDescription: "2 Organs",
      effectDescription: "+100 Cell Gain",
      done() {
        return player.o.points.gte(2);
      },
    },
    2: {
      requirementDescription: "3 Organs",
      effectDescription: "2.5x Cell Gain, Boracite now boosts Cell gain too!",
      done() {
        return player.o.points.gte(3);
      },
    },
    3: {
      requirementDescription: "5 Organs",
      effectDescription: "Mega Multiplier now boosts cell gain!",
      done() {
        return player.o.points.gte(5);
      },
    },
    4: {
      requirementDescription: "7 Organs",
      effectDescription: "Mechanical Multiplier now boosts cell gain!",
      done() {
        return player.o.points.gte(7);
      },
    },
    5: {
      requirementDescription: "9 Organs",
      effectDescription: "Nissionite boosts cell gain!",
      done() {
        return player.o.points.gte(9);
      },
    },
    6: {
      requirementDescription: "10 Organs",
      effectDescription: "All previous effects are improved",
      done() {
        return player.o.points.gte(10);
      },
    },
    7: {
      requirementDescription: "12 Organs",
      effectDescription: "Passively Generate Vinyl Multiplier",
      done() {
        return player.o.points.gte(12);
      },
    },
    8: {
      requirementDescription: "13 Organs",
      effectDescription:
        "Auto Prestige Hyper Multiplier and passively Generate Mechanical Multiplier",
      done() {
        return player.o.points.gte(13);
      },
      onComplete() {
        player.h.otherAutoPrestige = true;
      },
    },
    9: {
      requirementDescription: "14 Organs",
      effectDescription: "Heavy Multiplier Boosts Cell Gain!",
      done() {
        return player.o.points.gte(14);
      },
    },
  },
  buyables: {
    11: {
      cost(x) {
        return [new Decimal(1), new Decimal(9e9).mul(player.o.kidney.plus(1))];
      },
      display() {
        return (
          "Convert renal cells and organs into a kidney!" +
          " | Renal cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "Kidneys process liquid waste in order to send urine to the liver to be disposed.",
      canAfford() {
        return (
          player.ce.renalcells.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.renalcells = player.ce.renalcells.sub(this.cost()[1]);

        player.o.kidney = player.o.kidney.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    12: {
      cost(x) {
        return [new Decimal(1), new Decimal(9e9).mul(player.o.bone.plus(1))];
      },
      display() {
        return (
          "Convert bone and organs into a Bone!" +
          " | Bone cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "Bones provide a rigid structure for the body, and produce blood cells(not here)",
      canAfford() {
        return (
          player.ce.bonecells.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.bonecells = player.ce.bonecells.sub(this.cost()[1]);

        player.o.bone = player.o.bone.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    13: {
      cost(x) {
        return [new Decimal(10), new Decimal(1e12).mul(player.o.brain.plus(1))];
      },
      display() {
        return (
          "Convert neurons and organs into a brain!" +
          " | Neurons: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "The brain provides consciousness and sends electrical signals throughout the body for movement and normal functions.",
      canAfford() {
        return (
          player.ce.neurons.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.neurons = player.ce.neurons.sub(this.cost()[1]);

        player.o.brain = player.o.brain.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    14: {
      cost(x) {
        return [new Decimal(1), new Decimal(9e9).mul(player.o.muscle.plus(1))];
      },
      display() {
        return (
          "Convert muscle cells and organs into muscles" +
          " | Muscle Cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "Muscle are powerful, and allow for contractions for movement and activity!",
      canAfford() {
        return (
          player.ce.musclecells.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },

      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.musclecells = player.ce.musclecells.sub(this.cost()[1]);

        player.o.muscle = player.o.muscle.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    15: {
      cost(x) {
        return [new Decimal(1), new Decimal(9e9).mul(player.o.liver.plus(1))];
      },
      display() {
        return (
          "Convert hepatic cells and organs into a liver" +
          " | Hepatic Cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "The Liver filters blood, converts food into energy... over 500 vital functions!",
      canAfford() {
        return (
          player.ce.hepaticcells.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.hepaticcells = player.ce.hepaticcells.sub(this.cost()[1]);

        player.o.liver = player.o.liver.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    16: {
      cost(x) {
        return [new Decimal(1), new Decimal(9e9).mul(player.o.lung.plus(1))];
      },
      display() {
        return (
          "Convert lung cells and organs into a (pair) of Lungs!" +
          " | Lung Cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "The Lungs oxygenate the blood, and exhale carbon dioxide. Nitrogen is also exhaled, it kind of just exists.",
      canAfford() {
        return (
          player.ce.lungcells.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.lungcells = player.ce.lungcells.sub(this.cost()[1]);

        player.o.lung = player.o.lung.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    17: {
      cost(x) {
        return [
          new Decimal(1),
          new Decimal(1e10).mul(player.o.bladder.plus(1)),
        ];
      },
      display() {
        return (
          "Convert cells and organs into a bladder!" +
          " | Cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "The blader stores urine, and works in tandem with the kidneys to dispose of waste",
      canAfford() {
        return (
          player.ce.points.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.points = player.ce.points.sub(this.cost()[1]);

        player.o.bladder = player.o.bladder.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    18: {
      cost(x) {
        return [new Decimal(1), new Decimal(1e12).mul(player.o.uterus.plus(1))];
      },
      display() {
        return (
          "Convert cells and organs into a Uterus!" +
          " | Cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip: "The Uterus, of a female, holds the baby until they are birthed",
      canAfford() {
        return (
          player.ce.points.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.points = player.ce.points.sub(this.cost()[1]);

        player.o.uterus = player.o.uterus.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
    19: {
      cost(x) {
        return [new Decimal(1), new Decimal(1e12).mul(player.o.testes.plus(1))];
      },
      display() {
        return (
          "Convert cells and organs into Testes!" +
          " | Cells: " +
          format(this.cost()[1]) +
          " | Organs: " +
          format(this.cost()[0])
        );
      },

      tooltip:
        "The Testes, of a Male, produce sperm, half of what is needed for zygote, or what turns into a baby",
      canAfford() {
        return (
          player.ce.points.gte(this.cost()[1]) &&
          player.o.points.gte(this.cost()[0])
        );
      },
      buy() {
        player.o.points = player.o.points.sub(this.cost()[0]);
        player.ce.points = player.ce.points.sub(this.cost()[1]);

        player.o.testes = player.o.testes.add(
          new Decimal(1).mul(player.o.orgoGain()),
        );
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
      },
    },
  },
  tabFormat: {
    Normal: {
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
        "blank",
        ["infobox", "organ"],
        [
          "display-text",
          function () {
            return hasMilestone("o", "2")
              ? "Milestone 3 effect: " + format(player.o.milestone3()) + "x"
              : null;
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return hasMilestone("o", "3")
              ? "Milestone 4 effect: " + format(player.o.milestone4()) + "x"
              : null;
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return hasMilestone("o", "4")
              ? "Milestone 5 effect: " + format(player.o.milestone5()) + "x"
              : null;
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return hasMilestone("o", "5")
              ? "Milestone 6 effect: " + format(player.o.milestone6()) + "x"
              : null;
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return hasMilestone("o", "9")
              ? "Milestone 7 effect: " + format(player.o.milestone7()) + "x"
              : null;
          },
          { "font-size": "20px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.points) + " Cells";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.bloodcells) + " Blood Cells";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.bonecells) + " Bone Cells";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " + format(player.ce.hepaticcells) + " Hepatic Cells"
            );
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.renalcells) + " Renal Cells";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.neurons) + " Neurons";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " + format(player.ce.musclecells) + " Muscle Cells"
            );
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.lungcells) + " Lung Cells";
          },
          { "font-size": "20px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.o.kidney) + " Kidneys";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.brain) + " Brains";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.bone) + " Bones";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.muscle) + " Muscles";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.liver) + " Livers";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.lung) + " Lungs";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.bladder) + " Bladders";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.uterus) + " Uteruos";
          },
          { "font-size": "20px" },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.o.testes) + " Testicles";
          },
          { "font-size": "20px" },
        ],
        "blank",
        "milestones",

        "upgrades",
      ],
    },
    Organs: {
      content: [
        ["row", [["buyable", "11"]]],
        "blank",
        ["row", [["buyable", "12"]]],
        "blank",
        ["row", [["buyable", "13"]]],
        "blank",
        ["row", [["buyable", "14"]]],
        "blank",
        ["row", [["buyable", "15"]]],
        "blank",
        ["row", [["buyable", "16"]]],
        "blank",
        ["row", [["buyable", "17"]]],
        "blank",
        ["row", [["buyable", "18"]]],
        "blank",
        ["row", [["buyable", "19"]]],
      ],
    },
  },
});
