addLayer("art", {
  name: "Artifact", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "AR", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: -1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked() {
        return true;
      },
      points: new Decimal(1),

      variable: new Decimal(0),
      sigil: new Decimal(0),
      dquark: new Decimal(0),
      godlyTherm: new Decimal(0),
      kingCrystal: new Decimal(0),
      alienEssence: new Decimal(0),
      pureGlass: new Decimal(0),
    };
  },
  infoboxes: {
    artifacts: {
      title: "Artifacts",
      body() {
        return `Artifacts will show up as you unlock them
             `;
      },
    },
  },
  color: "#01a25f",
  requires: new Decimal(400), // Can be a function that takes requirement increases into account
  resource: "Artifact", // Name of prestige currency
  baseResource: "Multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.m.points;
  }, // Get the current amount of baseResource
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  tooltip() {
    return "Ancient Relics here!";
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
  row: "side", // Row the layer is in on the tree (0 is the first row)

  hotkeys: [],
  layerShown() {
    {
      return true;
    }
  },
  tabFormat: {
    "Page 1": {
      content: [
        "resource-display",
        ["infobox", "artifacts"],
        function () {
          return player[this.layer].dquark.gte(1)
            ? [
                "display-text",
                "You have " +
                  format(player[this.layer].dquark) +
                  " Divine Quark. Cubes Quark gain",
                {
                  "font-size": "45px",
                  display: "inline-block",
                  color: "#2b2525",
                  border: "2px dashed #ffffff",
                  width: "800px",
                  height: "120px",
                  "background-image":
                    "linear-gradient(90deg, rgba(255, 251, 0, 0.48) 0%, rgb(196, 196, 196) 50%, rgb(218, 215, 21) 100%)",
                  "font-family": "Times New Roman",
                },
              ]
            : null;
        },
        function () {
          return player[this.layer].sigil.gte(1)
            ? [
                "display-text",
                "You have " +
                  format(player[this.layer].sigil) +
                  " Sigil of the Unknown. Passively Generates Tetra at 100%",
                {
                  "font-size": "35px",
                  display: "inline-block",
                  color: "#635858",
                  border: "2px dashed #ffffff",
                  width: "800px",
                  height: "120px",
                  "background-image":
                    "linear-gradient(90deg, rgba(65, 64, 51, 0.48) 0%, rgb(80, 43, 43) 50%, rgb(44, 44, 9) 100%)",
                  "font-family": "Times New Roman",
                },
              ]
            : null;
        },
        function () {
          return player[this.layer].godlyTherm.gte(1)
            ? [
                "display-text",
                "You have " +
                  format(player[this.layer].godlyTherm) +
                  " Godly Thermometer. Passively Generates Nissionite and Fragments at 100%. Squares Nissionite Gain",
                {
                  "font-size": "35px",
                  display: "inline-block",
                  color: "#635858",
                  border: "2px dashed #ffffff",
                  width: "800px",
                  height: "120px",
                  "background-image":
                    "linear-gradient(90deg, rgba(230, 26, 26, 0.48) 0%, rgb(211, 183, 25) 50%, rgb(73, 17, 15) 100%)",
                  "font-family": "Times New Roman",
                },
              ]
            : null;
        },
        function () {
          return player[this.layer].kingCrystal.gte(1)
            ? [
                "display-text",
                "You have " +
                  format(player[this.layer].kingCrystal) +
                  " King Crystal. Raise MEM and scrap gain to the fourth power",
                {
                  "font-size": "35px",
                  display: "inline-block",
                  color: "#2c2727",
                  border: "2px dashed #ffffff",
                  width: "800px",
                  height: "120px",
                  "background-image":
                    "linear-gradient(90deg, rgba(155,0, 0,0.48) 0%, rgb(0,155,0) 50%, rgb(0,0,155) 100%)",
                  "font-family": "Times New Roman",
                },
              ]
            : null;
        },
        function () {
          return player[this.layer].alienEssence.gte(1)
            ? [
                "display-text",
                "You have " +
                  format(player[this.layer].alienEssence) +
                  " Alien Essence. Unlock the second path required for the alienCrystal under OS(Under development), square multiplier gain",
                {
                  "font-size": "35px",
                  display: "inline-block",
                  color: "#2c2727",
                  border: "2px dashed #ffffff",
                  width: "800px",
                  height: "120px",
                  "background-image":
                    "linear-gradient(90deg, rgba(128, 219, 24, 0.48) 0%, rgb(0,155,0) 50%, rgb(133, 173, 23) 100%)",
                  "font-family": "Times New Roman",
                },
              ]
            : null;
        },
        function () {
          return player[this.layer].pureGlass.gte(1)
            ? [
                "display-text",
                "You have " +
                  format(player[this.layer].pureGlass) +
                  " Pure Glass. Passively generate Starglass up to cap, and 10x Stargazed Metal boost",
                {
                  "font-size": "35px",
                  display: "inline-block",
                  color: "#2c2727",
                  border: "2px dashed #ffffff",
                  width: "800px",
                  height: "120px",
                  "background-image":
                    "linear-gradient(90deg, rgba(128, 219, 24, 0.48) 0%, rgb(0,155,0) 50%, rgb(133, 173, 23) 100%)",
                  "font-family": "Times New Roman",
                },
              ]
            : null;
        },
      ],
    },
    "Page 2": {
      content: ["blank"],
    },
  },
});
