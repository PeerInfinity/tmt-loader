addLayer("ax", {
  name: "Axioms", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "AX", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      canReset1: true,
      mathGamePoints: new Decimal(0),
      mathGameBoost() {
        let boost = subExp(this.mathGamePoints.add(1), 0.9);
        if (boost.gte(1e100)) boost = new Decimal(1e50);
        return boost;
      },
      mathQuestion: "",
      mathAnswer: "",
      mathAnswers: [],
      mathGameActive: false,
      flag: true,
    };
  },
  color: "#810f0f",
  nodeStyle() {
    if (tmp.ax.canReset || player.ax.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(134, 14, 14) 0%, rgb(161, 12, 12) 50%, rgb(122, 11, 11) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    } else return {};
  },
  requires: new Decimal(100000), // Can be a function that takes requirement increases into account
  resource: "Axioms", // Name of prestige currency
  baseResource: "Dimensional Points", // Name of resource prestige is based on
  baseAmount() {
    return player.d.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    if (layers[reset].row > this.row) {
      layerDataReset("ax", keep);
    }
  },
  update() {},

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
  infoboxes: {
    axioms: {
      title: "Axioms",
      body() {
        return `An Axiom is an accepted truth, usually self-evident, that can function without proof. For example, the equality problem: 'a=a' is an accepted truth
        with no proof because it is self-evident. The Commutative property: 'a+b=b+a', is also self-evident. If you suck at math, spam click the same answer box over and over
             `;
      },
    },
  },
  row: 4, // Row the layer is in on the tree (0 is the first row)
  branches: ["n", "sm", "d"],
  hotkeys: [
    {
      key: "x",
      description: "X: for Axioms",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.sm.unlocked;
  },
  tabFormat: {
    "Axis of Emergence": {
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
            return (
              "You have " + format(player.d.points) + " Dimensional Points"
            );
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ax.mathGamePoints) +
              " Math Game Points | Boosting particle gain by: " +
              format(player[this.layer].mathGameBoost()) +
              "x"
            );
          },
        ],

        "milestones",
        "clickables",
        "upgrades",
        ["infobox", "axioms"],
        [
          "raw-html",
          `<div class='horizontalBox' style='width: 700px; height: 800px; border: 2px solid white; box-sizing: border-box; background-image: linear-gradient(90deg, #b41f1f 0%, rgb(255, 0, 242) 50%, rgb(180, 32, 32) 100%);'><br><br>
           <br><div id="MathTimer"  style='width: 500px; height: 100px; border: 2px solid white; box-sizing: border-box; font-size: 50px; font-family: Fantasy; color: black;'>Timer: 0</div>
            <div id="MathIntro" data-answer="7" style='width: 500px; height: 100px; border: 2px solid white; box-sizing: border-box; font-size: 50px; font-family: Fantasy; color: black;'>5+2</div>
            <br>
            <br><br><br><br><button id="answerButtonAX1" onclick="processMathGame(this)"style='width: 150px; height: 150px; margin-right: 80px; border: 2px solid white; box-sizing: border-box; font-size: 27px; font-family: Fantasy; background-color:  red;'>7</button>
            <button id="answerButtonAX2" onclick="processMathGame(this)"style='width: 150px; height: 150px; border: 2px solid white; box-sizing: border-box; font-size: 27px; font-family: Fantasy; background-color:  red;'>6</button>
            <br><br><br><br><button id="answerButtonAX3" onclick="processMathGame(this)"style='width: 150px; height: 150px; margin-right: 80px; border: 2px solid white; box-sizing: border-box; font-size: 27px; font-family: Fantasy; background-color: red;'>8</button>
            <button id="answerButtonAX4" onclick="processMathGame(this)"style='width: 150px; height: 150px; border: 2px solid white; box-sizing: border-box; font-size: 27px; font-family: Fantasy; background-color:  red;'>3</button>
           </div>`,
        ],
      ],
    },
  },
  upgrades: {
    11: {
      title: "Axis of Emergence",
      description: "The Cosmos can be explainable, 1e9 particle boost.",
      cost: new Decimal(2),
    },
    12: {
      title: "The Ouroboros",
      description: "Atoms no longer resets",
      cost: new Decimal(4),
      onPurchase() {
        player[this.layer].canReset1 = false;
      },
    },
    13: {
      title: "Stalwart Addendum",
      description: "1e10 particle boost",
      cost: new Decimal(7),
    },
    14: {
      title: "Equality Everden",
      description: "particles boost particles again!",
      cost: new Decimal(7),
      effect() {
        return player.points.add(1).pow(0.05);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      },
    },
    15: {
      title: "Axial Tilt",
      description: "Evolution Points now boost particle gain",
      cost: new Decimal(11),
      effect() {
        return player.e.points.add(1).mul(1e7);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      },
    },
  },
});
