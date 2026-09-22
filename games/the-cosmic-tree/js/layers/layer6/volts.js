addLayer("vo", {
  name: "Volts", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),
      upgradesBought: new Decimal(0),
      functionRan: false,

      thunderStorm: false,
      thunderTimer: 1000,

      random: 0,
      lightningTimer: 0,
      lightningSound: true,

      copperRod: new Decimal(0),
      fiberOpticCable: new Decimal(0),
      transmissionTower: new Decimal(0),
      LVPole: new Decimal(0),
    };
  },
  infoboxes: {
    evolution: {
      title: "Volts",
      body() {
        return `Electricity is created by the transfer of electrons(note the elec part). Volts measure electrical pressure, amps
        measure the flow rate of a current, and Watts = Volts * Amps(Total power). 
        to calculate
             `;
      },
    },
  },
  color: "#fcec0f",
  requires: new Decimal(1e308), // Can be a function that takes requirement increases into account
  resource: "Volts", // Name of prestige currency
  baseResource: "Particles", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type() {
    if (player.vo.points.gte(1)) return "none";
    else return "static";
  }, // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = [];

    if (layers[reset].row > this.row) {
      layerDataReset("vo", keep);
    }
  },
  onPrestige() {
    if (!player.vo.functionRan) {
      voltaicSector();
      player.vo.functionRan = true;
    }
  },
  lightningMultiplier() {
    let mult = new Decimal(1);
    if (player.vo.copperRod.gte(1)) mult = mult.times(buyableEffect("vo", 11));
    if (player.vo.fiberOpticCable.gte(1))
      mult = mult.times(buyableEffect("vo", 12));
    if (player.vo.transmissionTower.gte(1))
      mult = mult.times(buyableEffect("vo", 13));
    return mult;
  },
  update() {
    if (hasUpgrade("vo", 11)) {
      if (player.vo.thunderTimer > 0) {
        player.vo.thunderTimer -= 1;
      }
      if (player.vo.thunderTimer <= 0) {
        player.vo.thunderTimer = Math.floor(Math.random() * 4000);
        if (player.vo.thunderTimer <= 240) {
          player.vo.thunderTimer = 240;
        }
        player.vo.random = Math.floor(Math.random() * 1000);
        if (player.vo.random <= 120) {
          player.vo.random = 120;
        }
        player.vo.thunderStorm = true;
      }
      if (player.vo.thunderStorm) {
        player.vo.random -= 1;
        player.vo.lightningTimer += Math.random();
        if (player.vo.random <= 0) {
          player.vo.lightningTimer = 0;
          player.vo.thunderStorm = false;
        }
        if (player.vo.lightningTimer > 10) {
          player.vo.lightningTimer = 0;
          player.vo.points = player.vo.points.add(
            new Decimal(Math.random() * 0.015).mul(this.lightningMultiplier()),
          );
        }
      }
    }
  },

  nodeStyle() {
    if (player.vo.unlocked == true || tmp.vo.canReset == true)
      return {
        "background-image": "radial-gradient(circle, #b4b96c, #a4a70c)",
        animation:
          "flicker 0.7s ease-in-out infinite, rippleMove 2s ease-in-out infinite",
        "text-shadow": "0 0 70px rgb(147, 161, 15)",
        "box-shadow":
          "0 0 2px rgb(207, 218, 60), inset 0 0 0.1px rgb(169, 172, 33)",

        "font-size": "60px",
        width: "125px",
        height: "125px",
      };
  },
  exponent: 7.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },

  row: 5, // Row the layer is in on the tree (0 is the first row)
  branches: ["ax", "sm", "e"],
  hotkeys: [
    {
      key: "Shift + V",
      description: "Shift + V: for Volts",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.ax.unlocked;
  },
  buyables: {
    11: {
      cost(x) {
        return new Decimal(1).add(player.vo.copperRod);
      },
      title: "Copper Rod",
      display() {
        return (
          "Buy Copper Rods to improve volt gain per lightning strike | Volt cost: " +
          format(this.cost()) +
          " | Currently: " +
          format(this.effect()) +
          "x"
        );
      },
      effect() {
        return new Decimal(1.2).add(player.vo.copperRod.mul(0.08));
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      unlocked() {
        return hasUpgrade("vo", 11);
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        player[this.layer].copperRod = player[this.layer].copperRod.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "font-size": "17px",
      },
    },
    12: {
      cost(x) {
        return new Decimal(5).add(player.vo.fiberOpticCable.mul(2.5));
      },
      title: "Fiber Optic Cables",
      display() {
        return (
          "Buy Fiber Optic Cables to improve volt gain per lightning strike | Volt cost: " +
          format(this.cost()) +
          " | Currently: " +
          format(this.effect()) +
          "x"
        );
      },
      effect() {
        return new Decimal(1.4).add(player.vo.fiberOpticCable.mul(0.12));
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      unlocked() {
        return player.vo.copperRod.gte(1);
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        player[this.layer].fiberOpticCable =
          player[this.layer].fiberOpticCable.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "font-size": "17px",
      },
    },
    13: {
      cost(x) {
        return new Decimal(13).add(player.vo.fiberOpticCable.mul(3));
      },
      title: "Transmission Towers",
      display() {
        return (
          "Buy Transmission Towers to improve volt gain per lightning strike | Volt cost: " +
          format(this.cost()) +
          " | Currently: " +
          format(this.effect()) +
          "x"
        );
      },
      effect() {
        return new Decimal(1.7).add(player.vo.transmissionTower.mul(0.2));
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      unlocked() {
        return player.vo.fiberOpticCable.gte(1);
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        player[this.layer].transmissionTower =
          player[this.layer].transmissionTower.add(1);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style: {
        "font-size": "17px",
      },
    },
  },
  bars: {
    bigBar: {
      direction: LEFT,
      width: 600,
      height: 50,
      textStyle: {
        "font-size": "20px",
        "font-family": "Arial",
        "text-align": "center",
        color: "white",
      },
      fillStyle: {
        "background-image":
          "linear-gradient(90deg, #ccbd33 0%, rgb(174, 177, 27) 50%, rgb(206, 193, 12) 100%)",
      },
      borderStyle: { border: "4px solid white", "border-radius": "0px" },
      display() {
        return (
          "Time remaining until thunderstorm: " +
          format(player.vo.thunderTimer) +
          " ticks"
        );
      },
      unlocked() {
        return hasUpgrade("vo", 11);
      },
      progress() {
        return player.vo.thunderTimer / 4000;
      },
    },
  },
  upgrades: {
    11: {
      title: "Wattage Overload",
      description: "Enable lightning strikes",
      cost: new Decimal(1),
      style: {
        width: "250px",
        height: "250px",
        "font-size": "25px",
      },
    },
  },
  tabFormat: {
    "The Voltaic Sector": {
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
          {
            "border-radius": "0px",
            "font-family": "Times New Roman",
            width: "300px",
            height: "200px",
            "font-size": "25px",
          },
        ],
        ["bar", "bigBar"],
        ["infobox", "evolution"],

        [
          "display-text",
          function () {
            return (
              "Thunderstorm lasting for " +
              (player.vo.random > 0 ? format(player.vo.random) : "N/A") +
              " ticks."
            );
          },
        ],
        [
          "row",
          [
            function () {
              return player.vo.copperRod.gte(1)
                ? [
                    "display-text",
                    "You have " + format(player.vo.copperRod) + " Copper Rods",
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px dashed #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(209, 139, 34, 0.44) 0%, rgba(160, 92, 3, 0.45) 50%, rgba(241, 172, 43, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ]
                : null;
            },

            function () {
              return player.vo.fiberOpticCable.gte(1)
                ? [
                    "display-text",
                    "You have " +
                      format(player.vo.fiberOpticCable) +
                      " Fiber Optic Cables",
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px dashed #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(167, 138, 101, 0.44) 0%, rgba(136, 103, 54, 0.45) 50%, rgba(155, 109, 40, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ]
                : null;
            },
          ],
        ],
        [
          "row",
          [
            function () {
              return player.vo.transmissionTower.gte(1)
                ? [
                    "display-text",
                    "You have " +
                      format(player.vo.transmissionTower) +
                      " Transmission Towers",
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px dashed #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(77, 69, 58, 0.44) 0%, rgba(110, 100, 86, 0.45) 50%, rgba(68, 58, 38, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ]
                : null;
            },

            function () {
              return player.vo.LVPole.gte(1)
                ? [
                    "display-text",
                    "You have " +
                      format(player.vo.LVPole) +
                      " Low-Voltage Poles",
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px dashed #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(209, 156, 87, 0.44) 0%, rgba(192, 171, 55, 0.45) 50%, rgba(105, 79, 39, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ]
                : null;
            },
          ],
        ],
        "blank",
        "blank",
        "upgrades",
        "buyables",
      ],
    },
  },
});
