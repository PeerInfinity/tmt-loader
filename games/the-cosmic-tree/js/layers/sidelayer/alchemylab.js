addLayer("ac", {
  name: "Alchemy Lab", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "AC", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked() {
        return hasAchievement("ach", 31);
      },
      points: new Decimal(1),
      helium: new Decimal(0),
      variable: new Decimal(0),
      bpacceleratorpoint: new Decimal(0),
      timer: 1,
      acceleratorActive: false,

      neutrino: new Decimal(0),
      antineutrino: new Decimal(0),
      positron: new Decimal(0),
      antiproton: new Decimal(0),
      antineutron: new Decimal(0),
      antiquark: new Decimal(0),

      tauon: new Decimal(0),
      muon: new Decimal(0),
      pion: new Decimal(0),
      kaon: new Decimal(0),
      lbaryon: new Decimal(0),

      sigmab: new Decimal(0),
      xib: new Decimal(0),
      omegab: new Decimal(0),
      wboson: new Decimal(0),
      zboson: new Decimal(0),
      higgsboson: new Decimal(0),
      photon: new Decimal(0),

      darkmatter: new Decimal(0),
      darkenergy: new Decimal(0),
      antienergy: new Decimal(0),
      antiphoton: new Decimal(0),
      antimatter: new Decimal(0),
      antimatterCrystal: new Decimal(0),

      iron: new Decimal(0),
      lead: new Decimal(0),
      gold: new Decimal(0),
      carbon: new Decimal(0),
      antimony: new Decimal(0),
      gluon: new Decimal(0),
      sulfur: new Decimal(0),
      sAcid: new Decimal(0),
      graviton: new Decimal(0),
      oxygen: new Decimal(0),
      water: new Decimal(0),

      trueParticle: new Decimal(0),
      strings: new Decimal(0),
      matterCrystal: new Decimal(0),

      element122: new Decimal(0),
      timeon: new Decimal(0),
      encapsulatedTimeon: new Decimal(0),
      timeStaff: new Decimal(0),
      timeCrystal: new Decimal(0),
    };
  },
  infoboxes: {
    qmechanics: {
      title: "Quantum Mechanics",
      body() {
        return `Quarks are not the only elementary particle. The universe has a particle for each atomic law, gravity remains undiscovered
        but hypothesized to have one. An electron is another elementary particle, or a gluon, or a photon(light). String Theory believes there are even smaller
        particles called strings that make up the current elementary particles, but this is unconfirmed. Once you unlock energy under Nuclear Multiplier, you can unlock a more powerful particle accelerator.
        There is a lot to explain regarding quantum particles. I refer you to this site: https://davidmorin.physics.fas.harvard.edu/sites/g/files/omnuum12331/files/2025-10/waves_quantum.pdf


             `;
      },
    },
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
        return "Time remaining: " + format(player.ac.timer) + " ticks";
      },
      progress() {
        return player[this.layer].timer / 1000;
      },
    },
  },
  color: "#a23c01",
  requires: new Decimal(400), // Can be a function that takes requirement increases into account
  resource: "Alchemy Lab", // Name of prestige currency
  baseResource: "Multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.m.points;
  }, // Get the current amount of baseResource
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  tooltip() {
    return "Experiment with the fundamental particles of this world!";
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
  update() {
    if (hasAchievement("ach", 31)) {
      player.ac.variable = new Decimal(1);
    }
    if (player[this.layer].acceleratorActive) {
      if (player.ac.timer > 0) {
        player.ac.timer--;
      }
      if (player.ac.timer <= 0) {
        player[this.layer].acceleratorActive = false;

        let plays = 10;
        while (plays > 0) {
          let chance = Math.random() * 100;
          if (chance < 100 && chance > 86) {
            player.ac.neutrino = player.ac.neutrino.add(1);
            player.ac.antineutrino = player.ac.antineutrino.add(1);
            plays--;
          } else if (chance < 86 && chance > 72) {
            player.ac.positron = player.ac.positron.add(1);
            plays--;
          } else if (chance < 72 && chance > 58) {
            player.ac.antiproton = player.ac.antiproton.add(1);
            plays--;
          } else if (chance < 58 && chance > 44) {
            player.ac.antineutron = player.ac.antineutron.add(1);
            plays--;
          } else if (chance < 44 && chance > 30) {
            player.ac.antiquark = player.ac.antiquark.add(1);
            plays--;
          } else if (chance < 30 && chance > 26) {
            player.a.protons = player.a.protons.add(1);
            plays--;
          } else if (chance < 26) {
            player.a.electrons = player.a.electrons.add(1);
            plays--;
          }
        }
      }
    }
  },
  hotkeys: [],
  layerShown() {
    {
      return hasAchievement("ach", 31);
    }
  },
  tabFormat: {
    "Displays and explanation": {
      content: [
        "main-display",
        "resource-display",
        ["infobox", "qmechanics"],
        ["buyable", "11"],
        ["bar", "bigBar"],
      ],
    },
    Elements: {
      content: [["display-image", "resources/periodic.png"]],
    },
    Inventory: {
      content: [
        [
          "display-text",
          function () {
            return (
              "You have " + format(player[this.layer].helium) + " Helium Atoms "
            );
          },
          {
            "font-size": "25px",
            display: "inline-block",
            color: "#dfdfdf",
            border: "2px dashed #ffffff",
            width: "400px",
            height: "57px",
            "background-color": "red",

            "font-family": "Times New Roman",
          },
        ],

        [
          "display-text",
          "Basic Accelerator Byproducts",
          { "font-size": "30px" },
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].neutrino) +
                  " Neutrinos"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(28, 75, 114)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].neutrino) +
                  " Neutrinos"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(28, 75, 114)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antineutrino) +
                  " Antineutrinos "
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(227, 180, 141)",

                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].positron) +
                  " Positrons(Antielectrons)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "green",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antiproton) +
                  " Antiprotons "
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "red",

                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antineutron) +
                  " Antineutrons"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "gray",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antiquark) +
                  " Antiquarks "
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#353333",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "lightgreen",

                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        "blank",
        [
          "display-text",
          "Medium Energy Accelerator Byproducts",
          { "font-size": "30px" },
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].tauon) +
                  " Tau particles"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(107, 28, 114)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return "You have " + format(player[this.layer].muon) + " Muons";
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(114, 185, 55)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].pion) + " Pions(π)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(42, 168, 190)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].kaon) + " Kaons(k)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(201, 198, 33)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].lbaryon) +
                  " Lambda Baryons(Λ)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "rgb(28, 114, 50)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "display-text",
          "High Energy Accelerator Byproducts",
          { "font-size": "30px" },
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].sigmab) +
                  " Sigma Baryons(Σ)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(85, 141, 66, 0.48) 0%, rgb(54, 129, 57) 50%, rgb(37, 126, 29) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].xib) +
                  " Xi Baryons(Ξ)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(150, 144, 61, 0.48) 0%, rgb(153, 146, 41) 50%, rgb(148, 130, 32) 100%)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].omegab) +
                  " Omega Baryons(Ω)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(170, 67, 153, 0.48) 0%, rgb(137, 36, 146) 50%, rgb(155, 34, 167) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].wboson) +
                  " W Bosons(W)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#3b3a3a",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(233, 232, 215, 0.48) 0%, rgb(194, 193, 181) 50%, rgb(245, 241, 222) 100%)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].zboson) +
                  " Z Bosons(Z)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(94, 88, 93, 0.48) 0%, rgb(71, 67, 71) 50%, rgb(104, 102, 104) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].higgsboson) +
                  " Higgs Bosons(H)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(36, 36, 33, 0.48) 0%, rgb(46, 45, 35) 50%, rgb(61, 60, 53) 100%)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].photon) +
                  " Photons(γ - light)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(255, 0, 0, 0.48) 0%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 100%)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "display-text",
          "Super-High Energy Accelerator Byproducts",
          { "font-size": "30px" },
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].darkmatter) +
                  " Dark Matter"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(63, 34, 34, 0.48) 0%, rgb(65, 21, 21) 50%, rgb(78, 18, 18) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].darkenergy) +
                  " Dark Energy"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(46, 67, 68, 0.48) 0%, rgb(25, 59, 61) 50%, rgb(12, 65, 71) 100%)",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antienergy) +
                  " Anti-Energy"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#3b3939",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgba(230, 196, 194, 0.48) 0%, rgb(230, 196, 194) 50%, rgb(243, 190, 184) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antiphoton) +
                  " Anti-Photons(Anti-Light)"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(0, 255, 255), rgb(255, 0, 255), rgb(255, 255, 0))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antimatter) +
                  " Anti-Matter"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#e0dbdb",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-color": "black",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        ["display-text", "Elemental products", { "font-size": "30px" }],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].iron) + " Iron Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(133, 74, 71) 0%, rgb(94, 56, 54) 50%, rgb(70, 28, 23) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].lead) + " Lead Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(121, 148, 148), rgb(71, 61, 71), rgb(131, 131, 115))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].gold) + " Gold Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(180, 168, 55) 0%, rgb(141, 143, 34) 50%, rgb(189, 179, 42) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].carbon) +
                  " Carbon Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(125, 170, 82), rgb(118, 170, 34), rgb(30, 138, 21))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].antimony) +
                  " Antimony Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(120, 55, 180) 0%, rgb(121, 34, 143) 50%, rgb(164, 42, 189) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].gluon) + " Gluons"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(160, 156, 103), rgb(152, 161, 65), rgb(117, 119, 20))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].sulfur) +
                  " Sulfur Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#3b3535",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(238, 226, 61) 0%, rgb(253, 186, 41) 50%, rgb(250, 234, 15) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].graviton) +
                  " Gravitons"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(97, 168, 129), rgb(63, 134, 95), rgb(65, 165, 123))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].oxygen) +
                  " Oxygen Atoms"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#353131",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(61, 238, 214) 0%, rgb(41, 253, 253) 50%, rgb(15, 234, 250) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].water) +
                  " Water Molecules"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#dfdfdf",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(55, 87, 134), rgb(63, 76, 134), rgb(54, 72, 148))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].trueParticle) +
                  " True Particles"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#353131",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(0, 255, 21) 0%, rgb(234, 0, 255) 50%, rgb(253, 253, 253) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].element122) +
                  " Element 122"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#3d3838",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(0, 102, 255), rgb(0, 255, 255), rgb(0, 255, 106))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
        [
          "row",
          [
            [
              "display-text",
              function () {
                return (
                  "You have " + format(player[this.layer].timeon) + " Timeons"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#353131",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(41, 173, 52) 0%, rgb(56, 211, 64) 50%, rgb(116, 207, 104) 100%)",
                "font-family": "Times New Roman",
              },
            ],

            [
              "display-text",
              function () {
                return (
                  "You have " +
                  format(player[this.layer].sAcid) +
                  " Sulfuric Acid"
                );
              },
              {
                "font-size": "25px",
                display: "inline-block",
                color: "#353232",
                border: "2px dashed #ffffff",
                width: "400px",
                height: "57px",
                "background-image":
                  "linear-gradient(90deg, rgb(65, 125, 214), rgb(94, 207, 128), rgb(251, 255, 0))",
                "font-family": "Times New Roman",
              },
            ],
          ],
        ],
      ],
    },
  },
  buyables: {
    11: {
      cost(x) {
        return new Decimal(2);
      },
      title() {
        return "Neutron Accelerator";
      },
      display() {
        return "Smash Neutrons together for protons, electrons, and neutrinos(Also other byproducts)";
      },
      canAfford() {
        return player.a.neutrons.gte(this.cost()) && player.ac.timer == 0;
      },
      unlocked() {
        if (hasAchievement("ach", 31)) return true;
      },

      buy() {
        player.a.neutrons = player.a.neutrons.sub(this.cost());

        player[this.layer].timer = 1000;
        player[this.layer].acceleratorActive = true;
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      style() {
        return {
          backgroundImage:
            "linear-gradient(90deg, rgba(88, 116, 79, 0.48) 0%, rgb(53, 40, 40) 50%, rgb(58, 43, 43) 100%)",
          borderRadius: "0px",
          border: "4px ridge #797979",
          backgroundSize: "800% 800%",
          fontSize: "20px",
          padding: "20px",
          width: "800px",
          height: "150px",
          fontColor: "#000000",
          fontFamily: "Comic Sans",
          animation: "rippleMove 20s ease infinite",
        };
      },
    },
  },
});
