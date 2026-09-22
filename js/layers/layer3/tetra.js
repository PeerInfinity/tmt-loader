addLayer("t", {
  name: "Tetras", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
      spent: new Decimal(0),
      spent3: new Decimal(0),
      spent4: new Decimal(0),
      spent5: new Decimal(0),
      spent6: new Decimal(0),
      tpoints: new Decimal(5),
      points3: new Decimal(0),
      points4: new Decimal(0),
      points5: new Decimal(0),
      points6: new Decimal(0),

      gavePoint: false,
    };
  },
  color: "#053863",
  nodeStyle() {
    let style = {
      "background-image":
        "linear-gradient(90deg,rgb(10, 51, 95) 0%, rgb(13, 55, 162) 50%, rgb(18, 38, 125) 100%)",
      "background-size": "150px 600%",
      "background-position": "40% 50%",
    };
    if (tmp.t.canReset || player.t.unlocked) {
      return { ...style };
    }
  },
  passiveGeneration() {
    if (player.art.sigil.gte(1)) return 1;
  },
  requires() {
    return new Decimal(1000);
  }, // Can be a function that takes requirement increases into account
  resource: "Tetras", // Name of prestige currency
  baseResource: "Vinyl multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.v.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [
      "variable",
      "spent",
      "spent3",
      "spent4",
      "spent5",
      "spent6",
      "challenges",
    ];

    let keepIds = ["51", "52", "53", "54", "55", "101"];
    let keptBuyables = {};

    for (let id of keepIds) {
      keptBuyables[id] = getBuyableAmount(this.layer, id);
    }

    if (layers[reset].row > this.row) {
      layerDataReset("t", keep);

      for (let id of keepIds) {
        setBuyableAmount(this.layer, id, keptBuyables[id]);
      }
    }
  },
  directMult() {
    let mult = new Decimal(1);
    mult = mult.times(player.chm.abzFunction());
    if (player.b.Orbindium.gte(1))
      mult = mult.add(player.b.orbindiumMultiplier());
    if (hasUpgrade("n", 13)) mult = mult.times(2);
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("n", 13)) mult = mult.times(2);
    }

    if (hasUpgrade("d", 11)) mult = mult.add(10);
    if (hasUpgrade("d", 12)) mult = mult.add(2);
    if (hasUpgrade("d", 14)) mult = mult.add(10);
    if (hasUpgrade("d", 25)) mult = mult.add(100);
    if (hasUpgrade("d", 28)) mult = mult.add(100);
    if (getBuyableAmount("d", 13).gte(1))
      mult = mult.add(buyableEffect("d", 13));
    if (getBuyableAmount("d", 19).gte(1))
      mult = mult.times(buyableEffect("d", 19));
    if (hasUpgrade("d", 30)) mult = mult.add(1000);
    if (hasUpgrade("d", 31)) mult = mult.add(500);
    if (hasUpgrade("d", 34)) mult = mult.add(1000);

    if (hasUpgrade("d", 41)) mult = mult.add(1000);
    if (hasMilestone("e", 0)) mult = mult.times(100);
    if (hasUpgrade("e", 13)) mult = mult.times(50);
    return mult;
  },
  allowedDirect: true,

  update() {
    if (player.t.points >= 1) {
      player.t.variable = new Decimal(1);
    }
  },
  base: 2,
  exponent: 1, // Prestige currency exponent

  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["ce", "v"],
  hotkeys: [
    {
      key: "t",
      description: "T: Reset for Tetras",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.ce.unlocked;
  },
  milestones: {
    1: {
      requirementDescription: "11 tetra",
      effectDescription: "Passively generate star dust!",
      done() {
        return player.t.points.gte(11);
      },
    },
  },
  tabFormat: {
    Tetratum: {
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
            return "You have " + format(player.v.points) + " vinyl multiplier.";
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "Tetras tend to create structures across dimensions. Use your tetras to make tetra points to buy structures! Note, each COLUMN(including Empryean buyables) has a maximum limit of 5, some buyables only have 1 despite this. So, Tetrated Stars, Planets, Galaxies, Blackholes and Universes have a collective limit of 5. Buy wisely!";
          },
          { fontSize: "20px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.t.tpoints) + " 2D tetra points.";
          },
          { fontSize: "25px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.t.points3) + " 3D tetra points.";
          },
          { fontSize: "25px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.t.points4) + " 4D tetra points.";
          },
          { fontSize: "25px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.t.points5) + " Imperial points.";
          },
          { fontSize: "25px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.t.points6) + " Empryean points.";
          },
          { fontSize: "25px" },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "91"],
                "blank",
                ["buyable", "92"],
                "blank",
                ["buyable", "93"],
              ],
            ],
          ],
        ],
        ["column", [["row", [["buyable", "94"]]]]],
        "blank",
        "respec-button",
        [
          "display-text",
          function () {
            return "2D structures";
          },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "11"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "12"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "13"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "14"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "15"],
              ],
            ],
          ],
        ],
        [
          "display-text",
          function () {
            return "3D structures";
          },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "21"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "22"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "23"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "24"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "25"],
              ],
            ],
          ],
        ],
        [
          "display-text",
          function () {
            return "4D structures";
          },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "31"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "32"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "33"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "34"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "35"],
              ],
            ],
          ],
        ],
        [
          "display-text",
          function () {
            return "Imperial structures";
          },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "41"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "42"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "43"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "44"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "45"],
              ],
            ],
          ],
        ],
      ],
    },
    "Empyrean Island": {
      content: [
        [
          "display-text",
          function () {
            return "Welcome to Empyrean Island!";
          },
          { "font-color": "yellow", "font-size": "50px" },
        ],
        "blank",
        [
          "upgrade-tree",
          [[11], [12, 13], [14, 15, 16, 17], [18, 19, 21, 22], [23, 24, 25]],
        ],
        "challenges",
        "blank",
        ["h-line"],
        [
          "column",
          [["row", [["buyable", "95"], "blank", "blank", ["buyable", "101"]]]],
        ],
        [
          "display-text",
          function () {
            return "Empyrean structures";
          },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "51"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "52"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "53"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "54"],
                "blank",
                ["v-line", "200px"],
                "blank",
                ["buyable", "55"],
              ],
            ],
          ],
        ],
      ],
    },
  },
  challenges: {
    11: {
      name: "The Empyrean Challenge",
      challengeDescription: "Disable ALL row 2 boosts. ",
      goalDescription: "Obtain 15 Hyper Multiplier",
      canComplete: function () {
        return player.h.points.gte(15);
      },
      unlocked() {
        return hasUpgrade("t", 25);
      },
      style() {
        let style = {
          width: "400px",
          height: "400px",
          "border-radius": "100px",

          "font-size": "21px",
        };
        if (this.canComplete()) {
          return {
            "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
            ...style,
          };
        } else return { ...style };
      },

      completionLimit: 1,
      rewardDisplay() {
        return "Unlock Empyrean Structures and an artifact";
      },
    },
  },
  upgrades: {
    11: {
      description: "Cask of deathly hollows - Get a free 2D Tetra point ",
      cost: new Decimal(1),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      effect() {
        if (hasUpgrade("t", 11)) {
          if (!player.t.gavePoint) {
            player.t.tpoints = player.t.tpoints.plus(1);
            player.t.gavePoint = true;
          }
        }
      },
      branches: [12, 13],
    },
    12: {
      description: "Deep greivances",
      cost: new Decimal(2),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 11);
      },
      branches: [14, 15],
    },
    13: {
      description: "Ionic catheter",
      cost: new Decimal(4),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 11);
      },
      branches: [16, 17],
    },
    14: {
      description: "Pentonic vows",
      cost: new Decimal(6),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 13);
      },
      branches: [18],
    },
    15: {
      description: "Quaternary singulums",
      cost: new Decimal(10),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 13);
      },
      branches: [19],
    },
    16: {
      description: "Septingial chamber",
      cost: new Decimal(15),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 13);
      },
      branches: [21],
    },
    17: {
      description: "Toxic foul",
      cost: new Decimal(25),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 13);
      },
      branches: [22],
    },
    18: {
      description: "Tetrated Stew",
      cost: new Decimal(40),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 17);
      },
      branches: [23],
    },
    19: {
      description: "Eternal tetration",
      cost: new Decimal(80),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 17);
      },
      branches: [23, 24],
    },
    21: {
      description: "Tetra gel",
      cost: new Decimal(140),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 17);
      },
      branches: [24, 25],
    },
    22: {
      description: "Frosty Tetras",
      cost: new Decimal(3000),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 17);
      },
      branches: [25],
    },
    23: {
      description: "Atomic laws",
      cost: new Decimal(540000),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 22);
      },
    },
    24: {
      description: "Into the dark",
      cost: new Decimal(8000000),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 22);
      },
    },
    25: {
      description: "Empyrean Island",
      cost: new Decimal(666666666),
      style: {
        width: "200px",
        height: "200px",
        "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
        "font-size": "17px",
      },
      unlocked() {
        return hasUpgrade("t", 22);
      },
    },
  },
  buyables: {
    showRespec() {
      return true;
    },
    respec() {
      // Optional, reset things and give back your currency. Having this function makes a respec button appear
      player.t.tpoints = player.t.tpoints.plus(player.t.spent);
      player.t.points3 = player.t.points3.plus(player.t.spent3);
      player.t.points4 = player.t.points4.plus(player.t.spent4);
      player.t.points5 = player.t.points5.plus(player.t.spent5);
      player.t.points6 = player.t.points6.plus(player.t.spent6);
      console.log(player.t.points4, player.t.spent4);
      player.t.spent = new Decimal(0);
      player.t.spent3 = new Decimal(0);
      player.t.spent4 = new Decimal(0);
      player.t.spent5 = new Decimal(0);
      player.t.spent6 = new Decimal(0);

      setBuyableAmount("t", "11", new Decimal(0));
      setBuyableAmount("t", "12", new Decimal(0));
      setBuyableAmount("t", "13", new Decimal(0));
      setBuyableAmount("t", "14", new Decimal(0));
      setBuyableAmount("t", "15", new Decimal(0));
      setBuyableAmount("t", "21", new Decimal(0));
      setBuyableAmount("t", "22", new Decimal(0));
      setBuyableAmount("t", "23", new Decimal(0));
      setBuyableAmount("t", "24", new Decimal(0));
      setBuyableAmount("t", "25", new Decimal(0));
      setBuyableAmount("t", "31", new Decimal(0));
      setBuyableAmount("t", "32", new Decimal(0));
      setBuyableAmount("t", "33", new Decimal(0));
      setBuyableAmount("t", "34", new Decimal(0));
      setBuyableAmount("t", "35", new Decimal(0));
      setBuyableAmount("t", "41", new Decimal(0));
      setBuyableAmount("t", "42", new Decimal(0));
      setBuyableAmount("t", "43", new Decimal(0));
      setBuyableAmount("t", "44", new Decimal(0));
      setBuyableAmount("t", "45", new Decimal(0));
      setBuyableAmount("t", "51", new Decimal(0));
      setBuyableAmount("t", "52", new Decimal(0));
      setBuyableAmount("t", "53", new Decimal(0));
      setBuyableAmount("t", "54", new Decimal(0));
      setBuyableAmount("t", "55", new Decimal(0));
    },
    respecText: "Respec Tetra structures(Won't reset everything)", // Text on Respec button, optional

    101: {
      cost() {
        return [new Decimal(1200), new Decimal(15)];
      },
      title: "Sigil of the Unknown",
      display() {
        return (
          "Heafty costs for massive boosts" +
          "   cost:" +
          format(this.cost()[0]) +
          " " +
          " tetras" +
          "   cost:" +
          format(this.cost()[1]) +
          " " +
          " Empryean points"
        );
      },
      unlocked() {
        return hasChallenge("t", 11);
      },

      canAfford() {
        return (
          player.t.points.gte(this.cost()[0]) &&
          player.t.points6.gte(this.cost()[1])
        );
      },
      buy() {
        player.art.sigil = player.art.sigil.plus(1);
        player.t.points = player.t.points.sub(this.cost()[0]);
        player.t.points6 = player.t.points6.sub(this.cost()[1]);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit: 1,
      style() {
        let style = {
          "border-radius": "0px",
          width: "400px",
          height: "250px",
          "font-size": "20px",
          color: "#a5a5a5",
        };
        if (this.canAfford()) {
          return {
            "background-image": "linear-gradient(90deg, #090a0e, #08070e)",
            ...style,
          };
        } else return { ...style };
      },
    },
    91: {
      cost(x) {
        return new Decimal(2).plus(x);
      },
      title: "Tetra Converter",
      display() {
        return (
          "Convert your tetras into 2D points" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " tetras"
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points.gte(this.cost());
      },
      buy() {
        player.t.tpoints = player.t.tpoints.plus(1);
        player.t.points = player.t.points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "100px",
        width: "200px",
        height: "200px",
        "font-size": "15px",
      },
    },
    92: {
      cost(x) {
        return new Decimal(2).plus(x);
      },
      title: "Tetra Converter MK2",
      display() {
        return (
          "Convert your 2D tetra points into 3D points" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 2D points"
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.tpoints.gte(this.cost());
      },
      buy() {
        player.t.points3 = player.t.points3.plus(1);
        player.t.tpoints = player.t.tpoints.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "100px",
        width: "200px",
        height: "200px",
        "font-size": "15px",
      },
    },
    93: {
      cost(x) {
        return new Decimal(2).plus(x);
      },
      title: "Tetra Converter MK3",
      display() {
        return (
          "Convert your 3D tetra points into 4D points" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 3D points"
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points3.gte(this.cost());
      },
      buy() {
        player.t.points4 = player.t.points4.plus(1);
        player.t.points3 = player.t.points3.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "100px",
        width: "200px",
        height: "200px",
        "font-size": "15px",
      },
    },
    94: {
      cost(x) {
        return new Decimal(10).plus(x);
      },
      title: "Imperial Converter",
      display() {
        return (
          "Convert your 4D tetra points into Imperial points" +
          "   cost: " +
          format(this.cost()) +
          " " +
          " 4D points    "
        );
      },

      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points4.gte(this.cost());
      },
      buy() {
        player.t.points5 = player.t.points5.plus(1);

        player.t.points4 = player.t.points4.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "100px",
        width: "200px",
        height: "200px",
        "font-size": "10px",
        animation: "spin 2s linear infinite",

        overflow: "visible",
      },
    },
    95: {
      cost(x) {
        return new Decimal(25);
      },
      title: "Empyrean Converter",
      display() {
        return (
          "Convert your Imperial points into Empyrean points" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Imperial points    "
        );
      },

      unlocked() {
        return hasChallenge("t", 11);
      },

      canAfford() {
        return player.t.points5.gte(this.cost());
      },
      buy() {
        player.t.points6 = player.t.points6.plus(5);
        player.t.points5 = player.t.points5.sub(this.cost());

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "100px",
        width: "250px",
        height: "250px",
        "font-size": "14px",
        animation: "spin 10s linear infinite",
      },
      purchaseLimit: 1,
    },
    11: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra Complex",
      display() {
        return (
          "Each tetra complex boosts multiplier gain by 1.5 compounding   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 2D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return new Decimal(1.5).plus(1).pow(x);
      },
      canAfford() {
        return player.t.tpoints.gte(this.cost());
      },
      buy() {
        player.t.spent = player.t.spent.plus(this.cost());
        player.t.tpoints = player.t.tpoints.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 21);
        let num2 = getBuyableAmount("t", 31);
        let num3 = getBuyableAmount("t", 41);
        let num4 = getBuyableAmount("t", 51);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    12: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra Penthouse",
      display() {
        return (
          "Each tetra penthouse boosts cosmic dust gain by 1.5 compounding   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 2D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return new Decimal(1.5).plus(1).pow(x);
      },
      canAfford() {
        return player.t.tpoints.gte(this.cost());
      },
      buy() {
        player.t.spent = player.t.spent.plus(this.cost());
        player.t.tpoints = player.t.tpoints.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 22);
        let num2 = getBuyableAmount("t", 32);
        let num3 = getBuyableAmount("t", 42);
        let num4 = getBuyableAmount("t", 52);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    13: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra 2D Frequency Table",
      display() {
        return (
          "Each tetra table boosts quark gain by 1.5 compounding   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 2D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 23);
        let num2 = getBuyableAmount("t", 33);
        let num3 = getBuyableAmount("t", 43);
        let num4 = getBuyableAmount("t", 53);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      effect(x) {
        return new Decimal(1.5).plus(1).pow(x);
      },
      canAfford() {
        return player.t.tpoints.gte(this.cost());
      },
      buy() {
        player.t.spent = player.t.spent.plus(this.cost());
        player.t.tpoints = player.t.tpoints.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    14: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetrated Planets",
      display() {
        return (
          "Each tetra planet boosts vinyl multiplier gain by 1.5 compounding   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 2D tetra points. " +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return new Decimal(1.5).plus(1).pow(x);
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 24);
        let num2 = getBuyableAmount("t", 34);
        let num3 = getBuyableAmount("t", 44);
        let num4 = getBuyableAmount("t", 54);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      canAfford() {
        return player.t.tpoints.gte(this.cost());
      },
      buy() {
        player.t.spent = player.t.spent.plus(this.cost());
        player.t.tpoints = player.t.tpoints.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    15: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetrated Particles",
      display() {
        return (
          "Each tetra particle boosts particle gain by 1.5 compounding   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 2D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 25);
        let num2 = getBuyableAmount("t", 35);
        let num3 = getBuyableAmount("t", 45);
        let num4 = getBuyableAmount("t", 55);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      effect(x) {
        return new Decimal(1.5).plus(1).pow(x);
      },
      canAfford() {
        return player.t.tpoints.gte(this.cost());
      },
      buy() {
        player.t.spent = player.t.spent.plus(this.cost());
        player.t.tpoints = player.t.tpoints.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    21: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra City",
      display() {
        return (
          "Each tetra city increases the limit on hyper quarks(the buyable)  " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 3D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points3.gte(this.cost());
      },
      buy() {
        player.t.spent3 = player.t.spent3.plus(this.cost());
        player.t.points3 = player.t.points3.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 11);
        let num2 = getBuyableAmount("t", 31);
        let num3 = getBuyableAmount("t", 41);
        let num4 = getBuyableAmount("t", 51);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    22: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra Skyscraper",
      display() {
        return (
          "Each tetra skyscraper lets Heavy Multiplier boost Multiplier   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 3D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect() {
        return player.hm.points.plus(1).pow(0.7).mul(x);
      },
      canAfford() {
        return player.t.points3.gte(this.cost());
      },
      buy() {
        player.t.spent3 = player.t.spent3.plus(this.cost());
        player.t.points3 = player.t.points3.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 12);
        let num2 = getBuyableAmount("t", 32);
        let num3 = getBuyableAmount("t", 42);
        let num4 = getBuyableAmount("t", 52);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    23: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra 3D Frequency Table",
      display() {
        return (
          "Each tetra table boosts lets multiplier boost quarks and improves the formula   " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 3D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      effect(x) {
        return player.m.points.plus(1).pow(0.1).mul(x);
      },
      canAfford() {
        return player.t.points3.gte(this.cost());
      },
      buy() {
        player.t.spent3 = player.t.spent3.plus(this.cost());
        player.t.points3 = player.t.points3.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 13);
        let num2 = getBuyableAmount("t", 33);
        let num3 = getBuyableAmount("t", 43);
        let num4 = getBuyableAmount("t", 53);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    24: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetrated Stars",
      display() {
        return (
          "Each tetra star boosts cosmic dust(not by a lot)   " +
          "currently:" +
          format(buyableEffect(this.layer, this.id)) +
          "x        " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 3D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect() {
        return new Decimal(1)
          .plus(1)
          .plus(getBuyableAmount(this.layer, this.id));
      },
      canAfford() {
        return player.t.points3.gte(this.cost());
      },
      buy() {
        player.t.spent3 = player.t.spent3.plus(this.cost());
        player.t.points3 = player.t.points3.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 14);
        let num2 = getBuyableAmount("t", 34);
        let num3 = getBuyableAmount("t", 44);
        let num4 = getBuyableAmount("t", 54);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    25: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetrated Quarks",
      display() {
        return (
          "Each tetra quarks boosts multiplier upgrade 13's effect   " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 3D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      effect(x) {
        return new Decimal(1).plus(x);
      },
      canAfford() {
        return player.t.points3.gte(this.cost());
      },
      buy() {
        player.t.spent3 = player.t.spent3.plus(this.cost());
        player.t.points3 = player.t.points3.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 15);
        let num2 = getBuyableAmount("t", 35);
        let num3 = getBuyableAmount("t", 45);
        let num4 = getBuyableAmount("t", 55);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    31: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra Metropolis",
      display() {
        return (
          "Passively generate Vinyl multiplier(max is 50%)  " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 4D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points4.gte(this.cost());
      },
      buy() {
        player.t.spent4 = player.t.spent4.plus(this.cost());
        player.t.points4 = player.t.points4.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 11);
        let num2 = getBuyableAmount("t", 21);
        let num3 = getBuyableAmount("t", 41);
        let num4 = getBuyableAmount("t", 51);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    32: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra Temple",
      display() {
        return (
          "Passively generate Atoms(max is 10%)  " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 4D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points4.gte(this.cost());
      },
      buy() {
        player.t.spent4 = player.t.spent4.plus(this.cost());
        player.t.points4 = player.t.points4.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 12);
        let num2 = getBuyableAmount("t", 22);
        let num3 = getBuyableAmount("t", 42);
        let num4 = getBuyableAmount("t", 52);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    33: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra 4D Frequency Table",
      display() {
        return (
          "Passively generate Cosmic Dust(max is 5%)  " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 4D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points4.gte(this.cost());
      },
      buy() {
        console.log(player.t.points4, player.t.spent4);
        player.t.spent4 = player.t.spent4.plus(this.cost());
        player.t.points4 = player.t.points4.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 13);
        let num2 = getBuyableAmount("t", 23);
        let num3 = getBuyableAmount("t", 43);
        let num4 = getBuyableAmount("t", 53);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    34: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetrated Galaxies",
      display() {
        return (
          "Unlock Stars(Buying this again and again passively generates stardust(max .5))  " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 4D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },

      canAfford() {
        return player.t.points4.gte(this.cost());
      },
      buy() {
        player.t.spent4 = player.t.spent4.plus(this.cost());
        player.t.points4 = player.t.points4.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 14);
        let num2 = getBuyableAmount("t", 24);
        let num3 = getBuyableAmount("t", 44);
        let num4 = getBuyableAmount("t", 54);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    35: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetrated Atoms",
      display() {
        return (
          " Bottom quarks now boost particles!   " +
          "currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x   " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " 4D tetra points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return player.q.bq.plus(1).pow(0.4).mul(x);
      },
      canAfford() {
        return player.t.points4.gte(this.cost());
      },
      buy() {
        player.t.spent4 = player.t.spent4.plus(this.cost());
        player.t.points4 = player.t.points4.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 15);
        let num2 = getBuyableAmount("t", 25);
        let num3 = getBuyableAmount("t", 45);
        let num4 = getBuyableAmount("t", 55);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    41: {
      cost() {
        return new Decimal(1);
      },
      title: "Imperial Civilization",
      display() {
        return (
          "Boost Vinyl multiplier by Hyper Multiplier(improve formula if you buy more)  " +
          "   currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Imperial points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return player.h.points.mul(new Decimal(0.5).plus(x));
      },
      canAfford() {
        return player.t.points5.gte(this.cost());
      },
      buy() {
        player.t.spent5 = player.t.spent5.plus(this.cost());
        player.t.points5 = player.t.points5.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 11);
        let num2 = getBuyableAmount("t", 21);
        let num3 = getBuyableAmount("t", 31);
        let num4 = getBuyableAmount("t", 51);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    42: {
      cost() {
        return new Decimal(1);
      },
      title: "Imperial Statues",
      display() {
        return (
          " Add a secondary self-sustaining upgrade and improve its formula!  " +
          "   currently:" +
          format(this.effect()) +
          "x" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Imperial points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return player.points.plus(new Decimal(1)).mul(x.plus(1)).pow(0.1);
      },
      canAfford() {
        return player.t.points5.gte(this.cost());
      },
      buy() {
        player.t.spent5 = player.t.spent5.plus(this.cost());
        player.t.points5 = player.t.points5.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 12);
        let num2 = getBuyableAmount("t", 22);
        let num3 = getBuyableAmount("t", 32);
        let num4 = getBuyableAmount("t", 52);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    43: {
      cost() {
        return new Decimal(1);
      },
      title: "Tetra 5D Frequency Table",
      display() {
        return (
          " Unlock sulfur under alchemy lab.  " +
          "   You have: " +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return new Decimal(0.5).mul(x + 1);
      },
      canAfford() {
        return player.t.points5.gte(this.cost());
      },
      buy() {
        player.t.spent5 = player.t.spent5.plus(this.cost());
        player.t.points5 = player.t.points5.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        return 1;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    44: {
      cost() {
        return new Decimal(1);
      },
      title: "Imperial Blackholes",
      display() {
        return (
          " Each Imperial blackhole can devour tetra points in exchange for massive particle boosts  " +
          "   currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Imperial points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return new Decimal(20).mul(x + 1);
      },
      canAfford() {
        return player.t.points5.gte(this.cost());
      },
      buy() {
        player.t.spent5 = player.t.spent5.plus(this.cost());
        player.t.points5 = player.t.points5.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 14);
        let num2 = getBuyableAmount("t", 24);
        let num3 = getBuyableAmount("t", 34);
        let num4 = getBuyableAmount("t", 54);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    45: {
      cost() {
        return new Decimal(1);
      },
      title: "Imperial Cells",
      display() {
        return (
          " Raise DNA and RNA limit " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Imperial points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return true;
      },
      effect(x) {
        return player.ce.number.mul(new Decimal(2).mul(x + 1));
      },
      canAfford() {
        return player.t.points5.gte(this.cost());
      },
      buy() {
        player.t.spent5 = player.t.spent5.plus(this.cost());
        player.t.points5 = player.t.points5.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 15);
        let num2 = getBuyableAmount("t", 25);
        let num3 = getBuyableAmount("t", 35);
        let num4 = getBuyableAmount("t", 55);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style: {
        "border-radius": "0px",
        width: "150px",
        height: "150px",
        "font-size": "10px",
      },
    },
    51: {
      cost() {
        return new Decimal(1);
      },
      title: "Empyrean Empire",
      display() {
        return (
          " Boost Particle gain... By a lot " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Empyrean points. " +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id)) +
          "|Effect: " +
          format(buyableEffect(this.layer, this.id)) +
          "x, to particle gain"
        );
      },
      unlocked() {
        return hasChallenge("t", 11);
      },
      effect(x) {
        return new Decimal(1500).pow(x);
      },
      canAfford() {
        return player.t.points6.gte(this.cost());
      },
      buy() {
        player.t.spent6 = player.t.spent6.plus(this.cost());
        player.t.points6 = player.t.points6.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 11);
        let num2 = getBuyableAmount("t", 21);
        let num3 = getBuyableAmount("t", 31);
        let num4 = getBuyableAmount("t", 41);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style() {
        let style = {
          "border-radius": "0px",
          width: "175px",
          height: "175px",
          "font-size": "14px",
        };
        if (this.canAfford()) {
          return {
            "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
            ...style,
          };
        } else return { ...style };
      },
    },
    52: {
      cost() {
        return new Decimal(1);
      },
      title: "Empyrean Relic",
      display() {
        return (
          " Passively Generate Tetra " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Empyrean points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return hasChallenge("t", 11);
      },

      canAfford() {
        return player.t.points6.gte(this.cost());
      },
      buy() {
        player.t.spent6 = player.t.spent6.plus(this.cost());
        player.t.points6 = player.t.points6.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit: 1,
      style() {
        let style = {
          "border-radius": "0px",
          width: "175px",
          height: "175px",
          "font-size": "14px",
        };
        if (this.canAfford()) {
          return {
            "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
            ...style,
          };
        } else return { ...style };
      },
    },
    53: {
      cost() {
        return new Decimal(1);
      },
      title: "Empyrean Frequency Table",
      display() {
        let [formula1, formula2, formula3] = this.effect();
        return (
          " Sulfur, Electrons, and Helium Atoms boost particle gain. Buy more to improve formula " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Empyrean points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id)) +
          "|Effects: " +
          format(formula1) +
          "x to sulfur, " +
          format(formula2) +
          "x to electrons, and " +
          format(formula3) +
          "x to helium atoms"
        );
      },
      unlocked() {
        return hasChallenge("t", 11);
      },
      effect(x) {
        let formula1 = new Decimal(1)
          .mul(player.ac.sulfur.plus(1).mul(player.ac.sulfur.plus(1).mul(15)))
          .mul(x.plus(1));
        let formula2 = new Decimal(1)
          .mul(player.a.electrons.plus(1).pow(1.05))
          .mul(x.plus(1));
        let formula3 = new Decimal(1)
          .mul(player.ac.helium.plus(1).mul(100).mul(player.ac.helium.plus(1)))
          .mul(x.plus(1));
        return [formula1, formula2, formula3];
      },
      canAfford() {
        return player.t.points6.gte(this.cost());
      },
      buy() {
        player.t.spent6 = player.t.spent6.plus(this.cost());
        player.t.points6 = player.t.points6.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 13);
        let num2 = getBuyableAmount("t", 23);
        let num3 = getBuyableAmount("t", 33);
        let num4 = getBuyableAmount("t", 43);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style() {
        let style = {
          "border-radius": "0px",
          width: "175px",
          height: "175px",
          "font-size": "11px",
        };
        if (this.canAfford()) {
          return {
            "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
            ...style,
          };
        } else return { ...style };
      },
    },
    54: {
      cost() {
        return new Decimal(1);
      },
      title: "Empyrean Universe",
      display() {
        return (
          " Cosmic Expansion, new upgrades, subcurrencies, and all in Cosmic Dust, Nissionite, Boracite, and Stargazed Metal " +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Empyrean points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return hasChallenge("t", 11);
      },
      effect(x) {
        return player.ce.number.mul(new Decimal(2).mul(x + 1));
      },
      canAfford() {
        return player.t.points6.gte(this.cost());
      },
      buy() {
        player.t.spent6 = player.t.spent6.plus(this.cost());
        player.t.points6 = player.t.points6.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit: 1,
      style() {
        let style = {
          "border-radius": "0px",
          width: "175px",
          height: "175px",
          "font-size": "12px",
        };
        if (this.canAfford()) {
          return {
            "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
            ...style,
          };
        } else return { ...style };
      },
    },
    55: {
      cost() {
        return new Decimal(1);
      },
      title: "Empyrean Tissue",
      display() {
        return (
          " Five times cell boost(every currency in cells)" +
          "   cost:" +
          format(this.cost()) +
          " " +
          " Empyrean points" +
          "   You have:" +
          format(getBuyableAmount(this.layer, this.id))
        );
      },
      unlocked() {
        return hasChallenge("t", 11);
      },

      canAfford() {
        return player.t.points6.gte(this.cost());
      },
      buy() {
        player.t.spent6 = player.t.spent6.plus(this.cost());
        player.t.points6 = player.t.points6.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      purchaseLimit() {
        let limit = 5;
        let num1 = getBuyableAmount("t", 15);
        let num2 = getBuyableAmount("t", 25);
        let num3 = getBuyableAmount("t", 35);
        let num4 = getBuyableAmount("t", 45);

        let operator = num1.valueOf();
        let operator2 = num2.valueOf();
        let operator3 = num3.valueOf();
        let operator4 = num4.valueOf();
        return limit - operator - operator2 - operator3 - operator4;
      },
      style() {
        let style = {
          "border-radius": "0px",
          width: "175px",
          height: "175px",
          "font-size": "14px",
        };
        if (this.canAfford()) {
          return {
            "background-image": "linear-gradient( #f4ff28, #a2aa0d)",
            ...style,
          };
        } else return { ...style };
      },
    },
  },
});
