addLayer("nm", {
  name: "Nuclear Multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "NM", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      uranium: new Decimal(0),
      plutonium: new Decimal(0),
      incrementium: new Decimal(0),
      energy: new Decimal(0),

      uFuelRod: new Decimal(0),
      pFuelRod: new Decimal(0),
      iFuelRod: new Decimal(0),

      uWaste: new Decimal(0),
      pWaste: new Decimal(0),

      layersCanReset: true,
    };
  },
  bars: {
    bigBar: {
      direction: LEFT,
      width: 600,
      height: 50,
      fillStyle: { color: "blue", "background-color": "lightgreen" },
      textStyle: {
        "font-size": "20px",
        "font-family": "Arial",
        "text-align": "center",
        color: "black",
      },
      borderStyle: { border: "4px solid white", "border-radius": "0px" },
      display() {
        return (
          "Uranium waste until meltdown:  " +
          format(new Decimal(1e9).sub(player[this.layer].uWaste))
        );
      },
      progress() {
        return player[this.layer].uWaste.div(1e9);
      },
    },
    pBar: {
      direction: LEFT,
      width: 600,
      height: 50,
      fillStyle: { color: "blue", "background-color": "green" },
      textStyle: {
        "font-size": "20px",
        "font-family": "Arial",
        "text-align": "center",
        color: "black",
      },
      borderStyle: { border: "4px solid white", "border-radius": "0px" },
      display() {
        return (
          "Plutonium waste until meltdown:  " +
          format(new Decimal(1e8).sub(player[this.layer].pWaste))
        );
      },
      progress() {
        return player[this.layer].pWaste.div(1e8);
      },
    },
  },
  infoboxes: {
    poll: {
      title: "Polluted Wasteland",
      body() {
        return `Hey, this all requires an immense amount of energy! Produce fuel rods in order to generate power!
        Be careful, too much nuclear waste can <b>DESTROY YOUR SAVE FILE</b>. Which the only way to fix is by relinquishing upgrades.

        Uranium fuel rods create waste much faster compared to plutonium, plutonium fuel rods also produce more energy, and incrementium produces no waste at all. There is a clickable, when activated
        begins converting Uranium fuel rods into energy, and starts generating nuclear waste, there is a separate clickable for plutonium and incrementium.

             `;
      },
    },
  },
  clickables: {
    11: {
      title: "Uranium Based Energy",
      canClick() {
        return player[this.layer].uFuelRod.gt(1);
      },
      onClick() {
        setClickableState(
          this.layer,
          this.id,
          !getClickableState(this.layer, this.id),
        );
      },
      style() {
        if (getClickableState(this.layer, this.id) == true) {
          return { "background-image": "darkgreen" };
        }
      },
    },
    12: {
      title: "Plutonium Based Energy",
      canClick() {
        return player[this.layer].pFuelRod.gt(1);
      },
      onClick() {
        setClickableState(
          this.layer,
          this.id,
          !getClickableState(this.layer, this.id),
        );
      },
      style() {
        if (getClickableState(this.layer, this.id) == true) {
          return { "background-image": "darkgreen" };
        }
      },
    },
    13: {
      title: "Incrementium Based Energy",
      canClick() {
        return player[this.layer].iFuelRod.gt(1);
      },
      onClick() {
        setClickableState(
          this.layer,
          this.id,
          !getClickableState(this.layer, this.id),
        );
      },
      style() {
        if (getClickableState(this.layer, this.id) == true) {
          return { "background-image": "darkgreen" };
        }
      },
    },
  },
  color: "#46df04",
  requires: new Decimal(1000000), // Can be a function that takes requirement increases into account
  resource: "Nuclear Multipliers", // Name of prestige currency
  baseResource: "Mega Multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.mm.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = ["layersCanReset"];

    if (layers[reset].row > this.row) {
      layerDataReset("nm", keep);
    }
  },
  update() {
    if (hasMilestone(this.layer, 0)) {
      player[this.layer].uranium = player[this.layer].uranium.add(0.1);
      player[this.layer].plutonium = player[this.layer].plutonium.add(0.01);
    }
    if (getClickableState(this.layer, 11) == true) {
      if (player[this.layer].uFuelRod.lt(1)) {
        null;
      } else {
        player[this.layer].uWaste = player[this.layer].uWaste.add(1000);
        player[this.layer].uFuelRod = player[this.layer].uFuelRod.sub(1);
        player[this.layer].energy = player[this.layer].energy.add(1);
      }
    }
    if (getClickableState(this.layer, 12) == true) {
      if (player[this.layer].pFuelRod.lt(1)) {
        null;
      } else {
        player[this.layer].pWaste = player[this.layer].pWaste.add(10);
        player[this.layer].pFuelRod = player[this.layer].pFuelRod.sub(1);
        player[this.layer].energy = player[this.layer].energy.add(5);
      }
    }
  },
  style() {
    return {
      "background-image":
        "linear-gradient(180deg, #118a01 0%, #0f5905 50%, #227018 100%)",
      "background-size": "300px 600%",
      height: "2000px",
      animation: "backgroundMove 4s linear infinite",
    };
  },
  nodeStyle() {
    if (player.nm.unlocked == true || tmp.nm.canReset == true)
      return {
        "background-image": "linear-gradient( #118a01, #0f5905)",
        animation: "radioactivePulse 1s linear infinite",
        "text-shadow": "0 0 20px rgb(38, 255, 0)",
        "box-shadow":
          "0 0 2px rgb(26, 255, 0), inset 0 0 0.1px rgb(0, 255, 13)",
        border: "2px solid rgb(0, 255, 13)",
      };
  },
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (player[this.layer].energy.gte(1))
      mult = mult.times(player[this.layer].energy.plus(50).mul(0.02));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  row: 4, // Row the layer is in on the tree (0 is the first row)
  branches: ["mm"],
  hotkeys: [
    {
      key: "Shift + N",
      description: "Shift + N: Reset for Nuclear Multiplier",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.e.unlocked;
  },
  milestones: {
    0: {
      requirementDescription: "Radioactive Highway",
      effectDescription: "Passively Generate Uranium and Plutonium",
      done() {
        return player.nm.points.gte(1);
      },
    },
    1: {
      requirementDescription: "50 Nuclear Multipliers",
      effectDescription:
        "Vinyl Multiplier and Mechanical Multiplier are no longer reset",
      done() {
        return player[this.layer].points.gte(50);
      },
      onComplete() {
        player[this.layer].layersCanReset = false;
      },
    },
    2: {
      requirementDescription: "100 Nuclear Multipliers",
      effectDescription: "10x Nissionite Boost",
      done() {
        return player[this.layer].points.gte(100);
      },
    },
    3: {
      requirementDescription: "250 Nuclear Multipliers",
      effectDescription: "+2 Nissionite Boost",
      done() {
        return player[this.layer].points.gte(250);
      },
    },
    4: {
      requirementDescription: "500 Nuclear Multipliers",
      effectDescription: "+10 Dimensional Point Boost",
      done() {
        return player[this.layer].points.gte(500);
      },
    },
  },
  buyables: {
    11: {
      cost(x) {
        return [
          new Decimal(1000),
          new Decimal(10000),
          new Decimal(150),
          new Decimal(7),
        ];
      },
      title: "Nuclear non-conformity",
      display() {
        return (
          "Convert materials into a Uranium Fuel Rod | " +
          " | Uranium cost: " +
          format(this.cost()[0]) +
          " | Zet cost: " +
          format(this.cost()[1]) +
          " | Fire cost: " +
          format(this.cost()[2]) +
          " | Spatial Antenna cost: " +
          format(this.cost()[3])
        );
      },

      canAfford() {
        return (
          player[this.layer].uranium.gte(this.cost()[0]) &&
          player.chm.zet.gte(this.cost()[1]) &&
          player.ct.fire.gte(this.cost()[2]) &&
          player.OS.sAntenna.gte(this.cost()[3])
        );
      },

      buy() {
        player[this.layer].uranium = player[this.layer].uranium.sub(
          this.cost()[0],
        );
        player.chm.zet = player.chm.zet.sub(this.cost()[1]);
        player.ct.fire = player.ct.fire.sub(this.cost()[2]);
        player.OS.sAntenna = player.OS.sAntenna.sun(this.cost()[3]);

        player[this.layer].uFuelRod = player[this.layer].uFuelRod.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        width: "300px",
        height: "300px",
        "font-size": "20px",
      },
    },
    12: {
      cost(x) {
        return [
          new Decimal(1000),
          new Decimal(1e7),
          new Decimal(20),
          new Decimal(11),
        ];
      },
      title: "Coming in from Pluto",
      display() {
        return (
          "Convert materials into a Plutonium Fuel Rod | " +
          " Plutonium cost: " +
          format(this.cost()[0]) +
          " Uranium Waste cost: " +
          format(this.cost()[1]) +
          " | Uranium Fuel Rod cost: " +
          format(this.cost()[2]) +
          "  | Sulfuric Acid Cost: " +
          format(this.cost()[3])
        );
      },

      canAfford() {
        return (
          player[this.layer].plutonium.gte(this.cost()[0]) &&
          player[this.layer].uWaste.gte(this.cost()[1]) &&
          player[this.layer].uFuelRod.gte(this.cost()[2]) &&
          player.ac.sAcid.gte(this.cost()[3])
        );
      },

      buy() {
        player[this.layer].plutonium = player[this.layer].plutonium.sub(
          this.cost()[0],
        );
        player[this.layer].uWaste = player[this.layer].uWaste.sub(
          this.cost()[1],
        );
        player[this.layer].uFuelRod = player[this.layer].uFuelRod.sub(
          this.cost()[2],
        );
        player.ac.sAcid = player.ac.sAcid.sun(this.cost()[3]);

        player[this.layer].pFuelRod = player[this.layer].pFuelRod.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        width: "300px",
        height: "300px",
        "font-size": "20px",
      },
    },
  },
  tabFormat: {
    "Polluted Wasteland": {
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
          {
            "border-radius": "0px",
            width: "400px",
            height: "200px",
            "font-size": "26px",
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].energy) +
              " Units of Energy"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#2b9ebb",
          },
        ],
        [
          "display-text",
          function () {
            return (
              "Energy boosts NM by:  " +
              format(player[this.layer].energy.plus(50).mul(0.02)) +
              "x"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#1f7d94",
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return "You have " + format(player.mm.points) + " Mega Multipliers";
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#511111",
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "You have " + format(player[this.layer].uranium) + " Uranium"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#4bbd17",
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " + format(player[this.layer].plutonium) + " Plutonium"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#35860f",
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].incrementium) +
              " Incrementium"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#37701c",
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].uFuelRod) +
              " Uranium Fuel Rods"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#6baf4c",
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].pFuelRod) +
              " Plutonium Fuel Rods"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#528a38",
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].iFuelRod) +
              " Incrementium Fuel Rods"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#183a08",
          },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "You have " + format(player[this.layer].uWaste) + " Uranium Waste"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#3c612c",
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player[this.layer].pWaste) +
              " Plutonium Waste"
            );
          },
          {
            "font-size": "40px",
            width: "200px",
            height: "300px",
            border: "2px solid #616161",
            "background-color": "#28471a",
          },
        ],
        ["infobox", "poll"],
        "blank",
        ["bar", "bigBar"],
        "blanl",
        ["bar", "pBar"],
        "buyables",
        "blank",
        "clickables",
      ],
    },
    Milestones: {
      content: ["milestones"],
    },
  },
});
