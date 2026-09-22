addLayer("ce", {
  name: "Cells", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "CE", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),

      mito: new Decimal(0),
      atp: new Decimal(0),
      nucleus: new Decimal(0),
      rna: new Decimal(0),
      dna: new Decimal(0),
      endr: new Decimal(0),
      ribo: new Decimal(0),
      aacids: new Decimal(0),
      golgi: new Decimal(0),
      prot: new Decimal(0),
      vacu: new Decimal(0),
      cytoplasm: new Decimal(0),
      adp: new Decimal(0),
      cenergy: new Decimal(0),
      number: new Decimal(10000),
      rnaNumber: new Decimal(1),
      dnaNumber: new Decimal(1),
      cellnumber: new Decimal(0),

      mSmithii: new Decimal(0),
      sSolfataricus: new Decimal(0),
      halobacterium: new Decimal(0),
      mJannaschii: new Decimal(0),

      bloodcells: new Decimal(0),
      bonecells: new Decimal(0),
      hepaticcells: new Decimal(0),
      renalcells: new Decimal(0),
      neurons: new Decimal(0),
      musclecells: new Decimal(0),
      lungcells: new Decimal(0),
      mucous: new Decimal(0),
      kinetic: new Decimal(0),
      procomplex: new Decimal(0),

      cellMultiplier() {
        let mult = new Decimal(1);

        if (hasUpgrade("d", 23)) mult = mult.times(upgradeEffect("d", 23));
        if (inChallenge("d", 14)) {
          return mult;
        } else {
          if (hasUpgrade("mm", 33)) mult = mult.times(2);
        }

        if (getBuyableAmount("d", 15))
          mult = mult.times(buyableEffect("d", 15));
        if (hasUpgrade("d", 31)) mult = mult.times(2);
        if (hasUpgrade("d", 40)) mult = mult.times(2);
        if (hasUpgrade("d", 51)) mult = mult.times(100);
        if (hasMilestone("o", 1)) mult = mult.add(100);
        if (hasMilestone("o", 2)) mult = mult.times(player.o.milestone3());
        if (hasMilestone("o", 3)) mult = mult.times(player.o.milestone4());
        if (hasMilestone("o", 4)) mult = mult.times(player.o.milestone5());
        if (hasMilestone("o", 5)) mult = mult.times(player.o.milestone6());
        if (hasMilestone("o", 9)) mult = mult.times(player.o.milestone7());
        if (hasMilestone("e", 0)) mult = mult.times(10000);
        if (hasUpgrade("e", 12)) mult = mult.times(1000000);
        if (hasUpgrade("e", 12)) mult = mult.times(player.e.evolutionEffect());
        if (hasUpgrade("e", 14)) mult = mult.times(5000);
        if (hasUpgrade("e", 17)) mult = mult.times(upgradeEffect("e", 17));
        return mult;
      },
    };
  },
  color: "#3b0134",
  nodeStyle() {
    if (tmp.ce.canReset || player.a.points.gte(4000) || player.ce.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(51, 6, 58) 0%, rgb(48, 2, 34) 50%, rgb(68, 17, 68) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
      };
    }
  },
  passiveGeneration() {
    if (hasMilestone("e", 0)) {
      return new Decimal(1);
    }
  },
  requires: new Decimal(4000), // Can be a function that takes requirement increases into account
  resource: "Cells", // Name of prestige currency
  baseResource: "Atoms", // Name of resource prestige is based on
  baseAmount() {
    return player.a.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = ["mSmithii", "sSolfataricus", "halobacterium", "mJannaschii"];
    if (hasMilestone("o", 0)) keep.push("upgrades");

    if (layers[reset].row > this.row) {
      layerDataReset("ce", keep);
    }
  },

  exponent: 1, // Prestige currency exponent
  directMult() {
    let mult = new Decimal(1);

    mult = mult.times(player.ce.cellMultiplier());
    return mult;
  },
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    let mult = new Decimal(1);

    mult = mult.times(player.ce.cellMultiplier());
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  update(diff) {
    if (player.ce.mito >= 1 && player.ce.adp <= 10) {
      player.ce.atp = player.ce.atp.plus(
        new Decimal(0.1).mul(diff).mul(player.ce.mito).pow(0.5),
      );
    }
    if (player.ce.nucleus >= 1) {
      if (hasUpgrade("d", 39)) {
        player.ce.dnaNumber = player.ce.nucleus;
        player.ce.rnaNumber = player.ce.nucleus;
      }
      if (player.ce.dna.gte(player.ce.number.mul(player.ce.dnaNumber))) {
        player.ce.dna = player.ce.dna;
      } else {
        player.ce.dna = player.ce.dna.plus(
          new Decimal(0.1)
            .mul(diff)
            .mul(player.ce.nucleus)
            .pow(0.5)
            .mul(player.ce.cellnumber.add(1)),
        );
      }
      if (player.ce.rna.gte(player.ce.number.mul(player.ce.rnaNumber))) {
        player.ce.rna = player.ce.rna;
      } else {
        player.ce.rna = player.ce.rna.plus(
          new Decimal(0.01)
            .mul(diff)
            .mul(player.ce.nucleus)
            .pow(0.5)
            .mul(player.ce.cellnumber.add(1)),
        );
      }
    }
    if (player.ce.endr >= 1) {
      player.ce.ribo = player.ce.ribo.plus(
        new Decimal(1)
          .mul(diff * 0.1)
          .mul(player.ce.endr)
          .pow(0.5),
      );
    }
    if (player.ce.adp > 10) {
      if (player.ce.atp > 1)
        player.ce.atp = player.ce.atp.sub(10000 * player.ce.adp);
      else if (player.ce.atp <= 0) player.ce.atp = new Decimal(0);
    }
    if (player.ce.bloodcells.gte(1)) {
      player.ce.dnaNumber = player.ce.dnaNumber.add(
        player.ce.bloodcells.mul(0.5),
      );
    }
    if (player.ce.hepaticcells.gte(1)) {
      player.ce.rnaNumber = player.ce.rnaNumber.add(
        player.ce.hepaticcells.mul(0.5),
      );
      player.ce.ribo = player.ce.ribo.plus(
        new Decimal(1).mul(0.1).mul(player.ce.hepaticcells).pow(0.5),
      );
    }
    if (player.ce.lungcells.gte(1)) {
      player.ce.mucous = player.ce.mucous.plus(
        new Decimal(1).mul(0.01).mul(player.ce.lungcells),
      );
    }

    if (player.ce.musclecells.gte(1) && player.ce.bonecells.gte(1)) {
      let minimum = Decimal.min(player.ce.musclecells, player.ce.bonecells);
      player.ce.kinetic = player.ce.kinetic.plus(
        new Decimal(0.01).mul(minimum),
      );
    }
  },

  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["a"],
  hotkeys: [
    {
      key: "shift + c",
      description: "Shift + C: Reset for Cells",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return getGridData("OS", 104) == 2 || player.ce.unlocked ? true : false;
  },

  upgrades: {
    11: {
      title: "Double Atom Gain",
      description: "Atomic frequency",
      cost: new Decimal(2),

      currencyDisplayName: "Nuclei",
      currencyInternalName: "nucleus",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },
    },
    12: {
      title: "Double Cosmic Dust Gain",
      description: "Stary Night",
      cost: new Decimal(5),

      currencyDisplayName: "E.R.s",
      currencyInternalName: "endr",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },
    },
    13: {
      title: "Double Atom gain again",
      description: "Oh the humanity!",
      cost: new Decimal(2),

      currencyDisplayName: "Jars of Cytoplasm",
      currencyInternalName: "cytoplasm",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },
    },
    14: {
      title: "Double Cosmic Dust gain again",
      description: "Repetitive",
      cost: new Decimal(51),

      currencyDisplayName: "Mitochondria",
      currencyInternalName: "mito",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },
    },
    15: {
      title: "Increaese DNA and RNA cap to 100,000 and generate them faster",
      description: "Amazing",
      cost: new Decimal(1),
      effect() {
        if (hasUpgrade("ce", 15)) {
          player.ce.number = new Decimal(100000);
        } else {
          player.ce.number = new Decimal(10000);
        }

        if (hasUpgrade("ce", 15)) {
          player.ce.cellnumber = new Decimal(1);
        } else {
          player.ce.cellnumber = new Decimal(0);
        }
      },
      style: {
        width: "150px",
        height: "150px",
      },
    },
    21: {
      title: "DNA now boosts particle gain",
      description: "Callous",
      cost: new Decimal(22),

      currencyDisplayName: "Nuclei",
      currencyInternalName: "nucleus",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },
      effect() {
        return player.ce.dna.plus(1).pow(0.3);
      },
      effectDisplay() {
        return "currently:" + format(upgradeEffect(this.layer, this.id)) + "x";
      },
    },
    22: {
      title: "Autobuy row 2 quark upgrades.",
      description: "Okay",
      cost: new Decimal(30),

      currencyDisplayName: "Nuclei",
      currencyInternalName: "nucleus",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },

      effect() {
        if (hasUpgrade("ce", 22)) {
          buyUpgrade("q", 23);
          buyUpgrade("q", 24);
          buyUpgrade("q", 25);
          buyUpgrade("q", 26);
        }
      },
    },
    23: {
      title: "Autobuy row 3 multiplier upgrades",
      description: "Quaint",
      cost: new Decimal(40),

      currencyDisplayName: "Nuclei",
      currencyInternalName: "nucleus",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },

      effect() {
        if (hasUpgrade("ce", 22)) {
          buyUpgrade("m", 31);
          buyUpgrade("m", 32);
          buyUpgrade("m", 33);
          buyUpgrade("m", 34);
          buyUpgrade("m", 35);
          buyUpgrade("m", 36);
        }
      },
    },
    24: {
      title: "Autobuy ALL Atom upgrades",
      description: "Dragging it",
      cost: new Decimal(53),

      currencyDisplayName: "Nuclei",
      currencyInternalName: "nucleus",
      currencyLayer: "ce",
      style: {
        width: "150px",
        height: "150px",
      },
      effect() {
        return Decimal.log(player.ce.points.add(2), 1.01);
      },
    },
  },
  milestones: {
    1: {
      requirementDescription: "1 Cell",
      effectDescription:
        "Begin your unrelenting quest to create life. Passively generate 100% of Quarks",
      done() {
        return player.ce.points.gte(1);
      },
    },
  },

  tabFormat: {
    "Milestones and Upgrades": {
      content: [
        [
          "main-display",
          function () {
            return "main-display";
          },
          { "font-family": "Times New Roman" },
        ],
        "blank",

        "blank",
        "blank",

        [
          "display-text",
          function () {
            return "You have " + format(player.a.points) + " atoms.";
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.c.points) + " Cosmic Dust.";
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ct.sdust) + " Star dust.";
          },
          { "border-radius": "0px", "font-size": "28px" },
        ],
        "blank",
        "milestones",
        [
          "display-text",
          function () {
            return (
              "Each cell boosts cosmic dust, atoms,and quarks" +
              "   currently: " +
              format(upgradeEffect("ce", 24)) +
              "x"
            );
          },
          { "font-size": "23px" },
        ],
        "upgrades",
      ],
    },
    "Organelle tree": {
      content: [
        ["infobox", "lore"],

        [
          "display-text",
          function () {
            return "You have " + format(player.ce.mito) + " mitochondrias";
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ce.atp) +
              " Adenosine Triphosphate(ATP) molecules"
            );
          },
        ],

        ["column", [["row", [["buyable", "11"]]]]],

        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ce.dna) +
              " Deoxyribonucleic acid(DNA) molecules"
            );
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ce.rna) +
              " Ribonucleic acid(RNA) molecules"
            );
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.nucleus) + " Nuclei";
          },
        ],

        ["column", [["row", [["buyable", "12"]]]]],

        [
          "display-text",
          function () {
            return "You have " + format(player.ce.aacids) + " Amino Acids";
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.ribo) + " Ribosomes";
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " + format(player.ce.endr) + " Endoplasmic reticulums"
            );
          },
        ],

        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "13"],
                ["buyable", "14"],
              ],
            ],
          ],
        ],

        [
          "display-text",
          function () {
            return "You have " + format(player.ce.vacu) + " Vacuoles";
          },
        ],

        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "15"],
                ["buyable", "16"],
              ],
            ],
          ],
        ],

        [
          "display-text",
          function () {
            return "You have " + format(player.ce.prot) + " Proteins";
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.ce.golgi) + " Golgi Bodies";
          },
        ],

        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "17"],
                ["buyable", "18"],
              ],
            ],
          ],
        ],

        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ce.adp) +
              " Adensine Diphosphate(ADP) molecules"
            );
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " + format(player.ce.cytoplasm) + " Jars of Cytoplasm"
            );
          },
        ],
        [
          "display-text",
          function () {
            return (
              "You have " +
              format(player.ce.cenergy) +
              " Units of Cellular Energy"
            );
          },
        ],
        [
          "column",
          [
            [
              "row",
              [
                ["buyable", "19"],
                ["buyable", "20"],
                ["buyable", "21"],
              ],
            ],
          ],
        ],
        ["buyable", "22"],
      ],
    },
    Specialization: {
      content: [
        ["infobox", "lore3"],
        ["microtabs", "Cells"],
      ],
    },
    Prokaryotes: {
      content: [
        ["infobox", "lore2"],
        [
          "display-text",
          function () {
            return "<u>Archaebacteria</u>";
          },
          { "font-size": "60px" },
        ],
        "blank",
        [
          "display-text",
          function () {
            return (
              "You have " + format(player.ce.mSmithii) + " <i>M. Smithii</i>"
            );
          },
        ],
        ["row", [["buyable", "41"]]],
        function () {
          return hasUpgrade("hm", 38)
            ? [
                "display-text",
                "You have " +
                  format(player.ce.sSolfataricus) +
                  " <i>S. Solfataricus</i>",
              ]
            : null;
        },
        function () {
          return hasUpgrade("hm", 38) ? ["row", [["buyable", "42"]]] : null;
        },
        function () {
          return hasChallenge("d", 12)
            ? [
                "display-text",
                "You have " +
                  format(player.ce.halobacterium) +
                  " <i>Halobacterium Salinarum</i>",
              ]
            : null;
        },
        function () {
          return hasChallenge("d", 12) ? ["row", [["buyable", "43"]]] : null;
        },
        function () {
          return hasUpgrade("d", 39)
            ? [
                "display-text",
                "You have " +
                  format(player.ce.mJannaschii) +
                  " <i>Methanococcus Jannaschii</i>",
              ]
            : null;
        },
        function () {
          return hasUpgrade("d", 39) ? ["row", [["buyable", "44"]]] : null;
        },
      ],
    },
  },
  microtabs: {
    unlocked() {
      return hasUpgrade("ce", 25);
    },
    Cells: {
      SomaticCells: {
        content: [
          [
            "column",
            [
              ["row", [["buyable", "101"]]],
              ["row", [["buyable", "102"]]],
              ["row", [["buyable", "103"]]],
              ["row", [["buyable", "104"]]],
              ["row", [["buyable", "105"]]],
              ["row", [["buyable", "106"]]],

              ["row", [["buyable", "108"]]],
            ],
          ],
        ],
      },
      ConversionsTotals: {
        content: [
          [
            "column",
            [
              [
                "row",
                [
                  [
                    "display-text",
                    function () {
                      return (
                        "You have " +
                        format(player.ce.bloodcells) +
                        " Blood Cells "
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(174, 21, 21, 0.44) 0%, rgba(129, 12, 12, 0.45) 50%, rgba(245, 40, 40, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ],

                  [
                    "display-text",
                    function () {
                      return (
                        "You have " +
                        format(player.ce.hepaticcells) +
                        " Hepatic Cells"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(93, 27, 27, 0.44) 0%, rgba(132, 40, 40, 0.45) 50%, rgba(110, 16, 16, 0.45) 100%)",
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
                        format(player.ce.lungcells) +
                        " Lung Cells " +
                        "<br>You have " +
                        format(player.ce.mucous) +
                        " Mucous"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(169, 38, 174, 0.44) 0%, rgba(182, 59, 174, 0.45) 50%, rgba(117, 13, 121, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ],

                  [
                    "display-text",
                    function () {
                      return (
                        "You have " +
                        format(player.ce.kinetic) +
                        " Kinetic Energy"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(43, 199, 56, 0.44) 0%, rgba(31, 168, 63, 0.45) 50%, rgba(17, 138, 45, 0.45) 100%)",
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
                        format(player.ce.bonecells) +
                        " Bone Cells"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(224, 210, 218, 0.44) 0%,rgba(197, 111, 160, 0.45) 50%, rgba(171, 87, 173, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ],

                  [
                    "display-text",
                    function () {
                      return (
                        "You have " +
                        format(player.ce.musclecells) +
                        " Muscle Cells"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(110, 12, 32, 0.44) 0%, rgba(137, 5, 38, 0.45) 50%, rgba(178, 55, 98, 0.45) 100%)",
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
                        format(player.ce.renalcells) +
                        " Renal Cells"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(168, 63, 168, 0.44) 0%, rgba(164, 70, 145, 0.45) 50%, rgba(205, 94, 215, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ],

                  [
                    "display-text",
                    function () {
                      return (
                        "You have " + format(player.ce.neurons) + " Neurons"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(27, 184, 196, 0.44) 0%, rgba(17, 228, 200, 0.45) 50%, rgba(12, 229, 244, 0.45) 100%)",
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
                        format(player.ce.procomplex) +
                        " Protein complexes"
                      );
                    },
                    {
                      "font-size": "25px",
                      display: "inline-block",
                      color: "#dfdfdf",
                      border: "2px double #ffffff",
                      width: "400px",
                      height: "57px",
                      "background-image":
                        "linear-gradient(90deg,rgba(255, 255, 255, 0.44) 0%, rgba(0, 0, 0, 0.45) 50%, rgba(255, 255, 255, 0.45) 100%)",
                      "font-family": "Times New Roman",
                    },
                  ],
                ],
              ],
              [
                "row",
                [
                  ["buyable", "107"],
                  ["buyable", "201"],
                ],
              ],
            ],
          ],
        ],
      },
    },
  },
  clickables: {},
  bars: {},
  buyables: {
    201: {
      cost(x) {
        return [new Decimal(15), new Decimal(1000), new Decimal(80)];
      }, // some sort of error
      display() {
        return (
          "Convert kinetic energy, mucous, and protein complexes into cells. This is a much more faster and efficient way than previously buying organelles. " +
          " kinetic cost: " +
          format(this.cost()[2]) +
          " ,mucous cost: " +
          format(this.cost()[1]) +
          " ,protein complex cost: " +
          format(this.cost()[0]) +
          ", You gain 10 cells per purchase"
        );
      },

      canAfford() {
        return (
          player.ce.kinetic.gte(this.cost()[2]) &&
          player.ce.mucous.gte(this.cost()[1]) &&
          player.ce.procomplex.gte(this.cost()[0])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        let costPerUnit3 = this.cost()[2];
        let max1 = player.ce.procomplex.div(costPerUnit1).floor();
        let max2 = player.ce.mucous.div(costPerUnit2).floor();
        let max3 = player.ce.kinetic.div(costPerUnit3).floor();
        let max = Decimal.min(max1, max2, max3);
        return [max, costPerUnit1, costPerUnit2, costPerUnit3];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2, costPerUnit3] = this.buyMax();

        if (max.lt(1)) max = new Decimal(1);
        player.ce.kinetic = player.ce.kinetic.sub(costPerUnit3.mul(max));
        player.ce.mucuous = player.ce.mucous.sub(costPerUnit2.mul(max));
        player.ce.procomplex = player.ce.procomplex.sub(costPerUnit1.mul(max));
        player.ce.points = player.ce.points.add(
          max.mul(10).mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "2px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "20px",
        width: "400px",
        height: "400px",
      },
    },
    101: {
      cost(x) {
        return new Decimal(1);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a blood cell. Blood cells increase cellular energy gain, raise the DNA cap, and boost atom gain(Atoms will become tremendously important)." +
          " cost: " +
          format(this.cost())
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.bloodcells <= 0.9) return new Decimal(1);
        else return new Decimal(1.5).mul(player.ce.bloodcells);
      },
      tooltip:
        "Blood cells are produced in the bone marrow and use iron to carry oxygen throughout any animal",
      canAfford() {
        return player.ce.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.points = player.ce.points.sub(costPerUnit.mul(max));
        player.ce.bloodcells = player.ce.bloodcells.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
      },
    },
    102: {
      cost(x) {
        return new Decimal(1);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a hepatic cell. Hepatic cells produce ribosomes(in reality they do not), raise the RNA cap, and boost cosmic dust gain." +
          " cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.hepaticcells <= 0.9) return new Decimal(1);
        else return new Decimal(1.7).mul(player.ce.hepaticcells);
      },
      tooltip:
        "Hepatic cells are one of the thousands of specialized cells in the liver. They have many functions such as producing bile, processing nutrients, and breaking down toxins",
      canAfford() {
        return player.ce.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }

        player.ce.points = player.ce.points.sub(costPerUnit.mul(max));
        player.ce.hepaticcells = player.ce.hepaticcells.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
      },
    },
    103: {
      cost(x) {
        return new Decimal(1);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a lung cell. Lung cells produce mucous, which is key for later parts. They can also filter cell dust for amino acids.(in reality they do not)." +
          " cost: " +
          format(this.cost())
        );
      },
      tooltip:
        "Lung cells are the cells that make up the lungs. They allow oxygen to enter the bloodstream and remove carbon dioxide from the bloodstream",
      canAfford() {
        return player.ce.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.points = player.ce.points.sub(costPerUnit.mul(max));
        player.ce.lungcells = player.ce.lungcells.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
      },
    },
    104: {
      cost(x) {
        return new Decimal(1);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a bone cell. Bone cells, here, can work in tandem with muscles to produce kinetic energy, a much more powerful energy than cellular energy. Kinetic energy has minor boosts, such as boosting quarks and particles." +
          " cost: " +
          format(this.cost()) +
          " currently(KE): " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      tooltip:
        "Bone cells are the cells that make up bones. They provide structure to the body, protect organs, and work with muscles to allow movement. They also produce blood cells in the bone marrow",
      canAfford() {
        return player.ce.points.gte(this.cost());
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.kinetic <= 0.9) return new Decimal(1);
        else return new Decimal(1).add(player.ce.kinetic.mul(0.1));
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.points = player.ce.points.sub(costPerUnit.mul(max));
        player.ce.bonecells = player.ce.bonecells.add(
          max.mul(buyableEffect("ce", 107).plus(1)),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "13px",
      },
    },
    105: {
      cost(x) {
        return new Decimal(1);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a muscle cell. Muscle cells, here, can work in tandem with bone cells to produce kinetic energy, a much more powerful energy than cellular energy." +
          " cost: " +
          format(this.cost())
        );
      },
      tooltip:
        "Muscle cells are the cells that make up muscles. They allow movement by contracting and relaxing. They also produce heat to maintain body temperature",
      canAfford() {
        return player.ce.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }

        player.ce.points = player.ce.points.sub(costPerUnit.mul(max));
        player.ce.musclecells = player.ce.musclecells.add(
          max.mul(buyableEffect("ce", 107).plus(1)),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "13px",
      },
    },
    106: {
      cost(x) {
        return new Decimal(5);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a renal(kidney) cell. Renal cells do nothing" +
          " cost: " +
          format(this.cost())
        );
      },
      tooltip:
        "Renal cells are the cells that make up the kidneys. They filter waste from the blood and produce urine",

      canAfford() {
        return player.ce.bloodcells.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.bloodcells.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.bloodcells = player.ce.bloodcells.sub(costPerUnit.mul(max));
        player.ce.renalcells = player.ce.renalcells.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "13px",
      },
    },
    107: {
      cost(x) {
        return new Decimal(10).add(player.ce.procomplex);
      }, // some sort of error
      display() {
        return (
          "Convert proteins into protein complexes. Protein complexes give a generous vinyl multiplier boost and a generous muscle & bone cell boost." +
          " cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.procomplex <= 0.9) return new Decimal(1);
        else return new Decimal(1).add(player.ce.procomplex.mul(0.1));
      },
      canAfford() {
        return player.ce.prot.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.prot.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.prot = player.ce.prot.sub(costPerUnit.mul(max));
        player.ce.procomplex = player.ce.procomplex.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "13px",
      },
    },

    108: {
      cost(x) {
        return new Decimal(150);
      }, // some sort of error
      display() {
        return (
          "Convert a cell into a neuron. Neurons are expensive, but, they are essential for artifical computing... They give an atoms boost." +
          " cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.neurons <= 0.9) return new Decimal(1);
        else return new Decimal(2).mul(player.ce.neurons);
      },
      tooltip:
        "Neurons are the cells that make up the nervous system. They allow for communication between different parts of the body and the brain. Above all, they allow for consciousness and thought. Consciousness is... a strenuous concept.",
      canAfford() {
        return player.ce.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.points = player.ce.points.sub(costPerUnit.mul(max));
        player.ce.neurons = player.ce.neurons.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "13px",
      },
    },
    11: {
      cost(x) {
        return new Decimal(4000).mul(
          new Decimal(1).plus(1).mul(player.ce.mito.plus(1).pow(1.2)),
        );
      }, // some sort of error
      display() {
        return (
          "Buy one mitochondria. Each mitochondria generates ATP and boosts Atoms logarithmnically." +
          " cost: " +
          format(this.cost()) +
          " | Currently: " +
          format(this.effect()) +
          "x"
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.mito <= 0.9) return new Decimal(1);
        else return Decimal.log(player.ce.mito.plus(1), 1.4);
      },
      canAfford() {
        return player.a.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.a.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.a.points = player.a.points.sub(costPerUnit.mul(max));
        player.ce.mito = player.ce.mito.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
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
      cost() {
        return new Decimal(16000).mul(
          new Decimal(1).plus(1).mul(player.ce.nucleus.plus(1).pow(1.4)),
        );
      },
      display() {
        return (
          "Buy one nucleus. Each nucleus generates RNA and DNA. RNA boosts multiplier gain but is capped at 10,000. DNA boost Cosmic Dust gain but is capped at 10,000 as well. With enough Nuclei consider investing in upgrades" +
          " cost: " +
          format(this.cost())
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.nucleus <= 0.9) return new Decimal(1);
        else return Decimal.log(player.ce.nucleus.plus(1), 1.4);
      },
      canAfford() {
        return player.a.points.gte(this.cost(1));
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.a.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.a.points = player.a.points.sub(costPerUnit.mul(max));
        player.ce.nucleus = player.ce.nucleus.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
        position: "relative",
      },
    },
    13: {
      cost() {
        return new Decimal(350).plus(20 * player.ce.endr ** 2);
      },
      display() {
        return (
          "Buy an endoplasmic reticulum. This will create ribosomes. Ribosomes must be sacrificed for amino acids.(Costs cosmic dust). Amino Acids give buffs" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.c.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.c.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.c.points = player.c.points.sub(costPerUnit.mul(max));
        player.ce.endr = player.ce.endr.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
      },
    },
    14: {
      cost() {
        return new Decimal(20).plus(2 * player.ce.aacids ** 2);
      },
      display() {
        return (
          "Sacrifice ribosomes to make Amino Acids. Amino acids boost Vinyl Multiplier and Quark gain" +
          " cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },

      canAfford() {
        return player.ce.ribo.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.ribo.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.ribo = player.ce.ribo.sub(costPerUnit.mul(max));
        player.ce.aacids = player.ce.aacids.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.aacids <= 0.9) return new Decimal(1);
        else return new Decimal(1.5).mul(player.ce.aacids);
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
      },
    },
    15: {
      cost(x) {
        return new Decimal(1000).plus(100 * player.ce.vacu ** 2);
      },
      display() {
        return (
          "Buy a vacuole. Vacuoles can break down hyper multiplier into hyper quarks and quarks. Vacuoles themselves cost cosmic dust, but the more vacuoles the lesser the cost of hyper multipliers to break them apart." +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.c.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.c.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.c.points = player.c.points.sub(costPerUnit.mul(max));
        player.ce.vacu = player.ce.vacu.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
      },
    },
    16: {
      cost(x) {
        return new Decimal(20)
          .div(player.ce.vacu.plus(1))
          .plus(1)
          .mul(x)
          .plus(1);
      },
      display() {
        return (
          "Sacrifice hyper multipliers to make .5 hyper quarks and 20 quarks(the latter pratically does nothing)" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.h.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        player.h.points = player.h.points.sub(this.cost());
        player.q.points = player.q.points.add(20);
        player.ct.hq = player.ct.hq.add(0.5);
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
        "font-size": "14px",
      },
    },
    17: {
      cost(x) {
        return new Decimal(2).mul(player.ce.golgi.plus(1).pow(0.5));
      },
      display() {
        return (
          "Buy a golgi body. A golgi body only accepts star dust. With the golgi, you can compact Amino Acids into proteins. A golgi also boosts multiplier by 1.5x  cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },

      canAfford() {
        return player.ct.sdust.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ct.sdust.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ct.sdust = player.ct.sdust.sub(costPerUnit.mul(max));

        player.ce.golgi = player.ce.golgi.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (player.ce.golgi <= 0.9) return new Decimal(1);
        else return new Decimal(1.5).mul(player.ce.golgi);
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
      },
    },
    18: {
      cost() {
        return new Decimal(20).mul(player.ce.prot.plus(1).pow(0.2));
      },
      display() {
        return (
          "Compact amino acids into proteins. Proteins boost particle gain and atom gain by 1.2x(Will change)  cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },

      canAfford() {
        return player.ce.aacids.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.ce.aacids.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.ce.aacids = player.ce.aacids.sub(costPerUnit.mul(max));

        player.ce.prot = player.ce.prot.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      effect() {
        if (inChallenge("a", 21)) return new Decimal(1);
        else if (hasUpgrade("a", 21) && player.ce.orot <= 0.9)
          return new Decimal(1.7).mul(player.ce.prot);
        else if (player.ce.prot <= 0.9) return new Decimal(1);
        else return new Decimal(1.2).mul(player.ce.prot);
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
      },
    },
    19: {
      cost() {
        return new Decimal(350000).mul(player.ce.cytoplasm.plus(1).pow(0.2));
      },
      display() {
        return (
          "Buy a jar of cytoplasm. if ADP is count is above 10, you will start losing ATP every second. In order to prevent this, you can turn ADP back into ATP and use cytoplasmic jars. cost:  " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.a.points.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          max = player.a.points.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1);
        }
        player.a.points = player.a.points.sub(costPerUnit.mul(max));

        player.ce.cytoplasm = player.ce.cytoplasm.add(
          max.mul(player.ce.cellMultiplier()),
        );
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },

      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "14px",
      },
    },
    20: {
      cost() {
        return new Decimal(100).mul(player.ce.adp.plus(1).pow(1.1));
      },
      display() {
        return (
          "Break down ATP into ADP and cellular energy. cost:  " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.ce.atp.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let cenergyMaximum = new Decimal(1);
        if (getBuyableAmount(this.layer, 101).gte(1))
          cenergyMaximum = cenergyMaximum.mul(buyableEffect(this.layer, 101));

        player.ce.atp = player.ce.atp.sub(this.cost());
        player.ce.adp = player.ce.adp.add(new Decimal(1));
        player.ce.cenergy = player.ce.cenergy.add(
          cenergyMaximum.mul(player.ce.cellMultiplier()),
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
        "font-size": "14px",
      },
    },
    21: {
      cost() {
        return [
          new Decimal(10),
          new Decimal(1).add(getBuyableAmount(this.layer, 21)),
        ];
      },
      display() {
        return (
          "Exchange ADP and Jars of Cytoplasm into ATP. cost:  " +
          format(this.cost()[0]) +
          " ADP and " +
          format(this.cost()[1]) +
          " Jars of Cytoplasm"
        );
      },

      canAfford() {
        return (
          player.ce.adp.gte(this.cost()[0]) &&
          player.ce.cytoplasm.gte(this.cost()[1])
        );
      },
      buyMax() {
        return true;
      },
      buy() {
        player.ce.adp = player.ce.adp.sub(this.cost()[0]);
        player.ce.cytoplasm = player.ce.cytoplasm.sub(this.cost()[1]);
        player.ce.atp = player.ce.atp.add(10);

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
        "font-size": "14px",
      },
    },
    22: {
      cost() {
        return [
          new Decimal(50).mul(player.ce.points.add(1).pow(0.2)),
          new Decimal(15).mul(player.ce.points.add(1).pow(0.2)),
          new Decimal(15).mul(player.ce.points.add(1).pow(0.2)),
          new Decimal(7).mul(player.ce.points.add(1).pow(0.2)),
          new Decimal(3).mul(player.ce.points.add(1).pow(0.2)),
          new Decimal(5).mul(player.ce.points.add(1).pow(0.2)),
          new Decimal(100).mul(player.ce.points.add(1).pow(0.2)),
        ];
      },
      display() {
        return (
          "Exchange everything except atp, adp, proteins, dna, ribosomes, amino acids, and rna to make<br><span style='font-size: 90px; color: #61155b; text-shadow: 8px 8px 10px rgba(79, 14, 72, 0.5)'> A Cell</span><br> cost:  " +
          format(this.cost()[0]) +
          " Mitochondrias and " +
          format(this.cost()[1]) +
          " Nucleii and " +
          format(this.cost()[2]) +
          " Endoplasmic Reticulums and " +
          format(this.cost()[3]) +
          " Vacuoles and " +
          format(this.cost()[4]) +
          " Golgi Bodies and " +
          format(this.cost()[5]) +
          " Cytoplasmic Jars and " +
          format(this.cost()[6]) +
          " Units of Cellular Energy"
        );
      },

      canAfford() {
        return (
          player.ce.mito.gte(this.cost()[0]) &&
          player.ce.nucleus.gte(this.cost()[1]) &&
          player.ce.endr.gte(this.cost()[2]) &&
          player.ce.vacu.gte(this.cost()[3]) &&
          player.ce.golgi.gte(this.cost()[4]) &&
          player.ce.cytoplasm.gte(this.cost()[5]) &&
          player.ce.cenergy.gte(this.cost()[6])
        );
      },
      buyMax() {
        return true;
      },
      buy() {
        setBuyableAmount("ce", 21, new Decimal(0));
        player.ce.mito = player.ce.mito.sub(this.cost()[0]);
        player.ce.nucleus = player.ce.nucleus.sub(this.cost()[1]);
        player.ce.endr = player.ce.endr.sub(this.cost()[2]);
        player.ce.vacu = player.ce.vacu.sub(this.cost()[3]);
        player.ce.golgi = player.ce.golgi.sub(this.cost()[4]);
        player.ce.cytoplasm = player.ce.cytoplasm.sub(this.cost()[5]);
        player.ce.cenergy = player.ce.cenergy.sub(this.cost()[6]);
        player.ce.points = player.ce.points.add(
          new Decimal(1).mul(player.ce.cellMultiplier()),
        );

        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },

      style: {
        "border-radius": "50px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "22px",
        height: "450px",
        width: "350px",
      },
    },
    41: {
      cost() {
        return new Decimal(50000).mul(
          new Decimal(1).mul(player.ce.mSmithii.plus(1)).pow(0.5),
        );
      }, // some sort of error
      display() {
        return (
          "Buy one <i>Methanobrevibacter Smithii</i>. " +
          " cost: " +
          format(this.cost()) +
          " RNA.   "
        );
      },
      tooltip: `Wikipedia says: Methanobrevibacter smithii is the predominant methanogenic archaeon in the microbiota of the human gut.[1] 
         M. smithii has a coccobacillus shape. It plays an important role in the efficient digestion of polysaccharides 
         (complex sugars) by consuming the end products of bacterial fermentation (H2, CO2, acetate, and formate).[2] 
         M. smithii is a hydrogenotrophic methanogen that utilizes hydrogen by combining it with carbon dioxide to form 
         methane. The removal of hydrogen by M. smithii is thought to allow an increase in the extraction of energy from 
         nutrients by shifting bacterial fermentation to more oxidized end products.[3]`,

      canAfford() {
        return player.ce.rna.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.ce.rna.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }
        player.ce.rna = player.ce.rna.sub(costPerUnit.mul(max));
        player.ce.mSmithii = player.ce.mSmithii.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
      },
    },
    42: {
      cost() {
        return new Decimal(150000).mul(
          new Decimal(1.5).mul(player.ce.sSolfataricus.plus(1)).pow(0.5),
        );
      }, // some sort of error
      display() {
        return (
          "Buy one <i>Saccharolobus Solfataricus</i>. " +
          " cost: " +
          format(this.cost()) +
          " RNA.   "
        );
      },
      tooltip: `Wikipedia says: S. solfataricus is able to oxidize 
         sulfur according to metabolic strategy. One of the products of these reactions is H+ and, as a result, it will slowly acidify the surrounding area. 
         Soil acidification increases in places where there are emissions of pollutants from industrial activity. This process reduces the number of heterotrophic bacteria 
         involved in decomposition, which are fundamental for the process of recycling organic matter and ultimately slows the fertilization of soil.[37]`,

      unlocked() {
        return hasUpgrade("hm", 38);
      },
      canAfford() {
        return player.ce.rna.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.ce.rna.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }
        player.ce.rna = player.ce.rna.sub(costPerUnit.mul(max));
        player.ce.sSolfataricus = player.ce.sSolfataricus.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "16px",
      },
    },
    43: {
      cost() {
        return new Decimal(255000).mul(
          new Decimal(1.3).mul(player.ce.halobacterium.plus(3)).pow(0.4),
        );
      }, // some sort of error
      display() {
        return (
          "Buy one <i>Halobacterium Salinarum</i>. " +
          " cost: " +
          format(this.cost()) +
          " RNA.   "
        );
      },
      tooltip: `Wikipedia says: Halobacteria are single-celled, rod-shaped microorganisms that are among the most ancient forms of life and appeared on Earth billions of years ago. 
         Amino acids are the main source of chemical energy for H. salinarum, particularly arginine and aspartate, though they are able to metabolize other amino acids, as well.[4] H. salinarum 
         have been reported to be unable to grow on sugars, and therefore need to encode enzymes capable of performing gluconeogenesis to create sugars. Although H. salinarum is unable to catabolize glucose, the transcription factor TrmB has been proven to regulate the gluconeogenic production of sugars found on the S-layer glycoprotein.`,

      canAfford() {
        return player.ce.rna.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.ce.rna.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }
        player.ce.rna = player.ce.rna.sub(costPerUnit.mul(max));
        player.ce.halobacterium = player.ce.halobacterium.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "15px",
      },
    },
    44: {
      cost() {
        return new Decimal(375000).mul(
          new Decimal(1.7).mul(player.ce.mJannaschii.plus(3)).pow(0.4),
        );
      }, // some sort of error
      display() {
        return (
          "Buy one <i>Methanococcus Jannaschii</i>. " +
          " cost: " +
          format(this.cost()) +
          " RNA.   "
        );
      },
      tooltip: `Wikipedia says: Methanocaldococcus jannaschii is a thermophilic methanogen, meaning it grows by making methane as a metabolic byproduct. 
         It is only capable of growth on carbon dioxide and hydrogen as primary energy sources, unlike many other methanococci 
         (such as Methanococcus maripaludis) which can also use formate as a primary energy source.[4] 
         The genome includes many hydrogenases, such as a 5,10-methenyltetrahydromethanopterin hydrogenase,[8] 
         a ferredoxin hydrogenase (eha), and a coenzyme F420 hydrogenase.[9]`,

      canAfford() {
        return player.ce.rna.gte(this.cost());
      },
      buyMax() {
        return true;
      },
      buy() {
        let costPerUnit = this.cost();
        let max = new Decimal(1);

        if (this.buyMax()) {
          // calculate how many can be bought
          max = player.ce.rna.div(costPerUnit).floor();
          if (max.lt(1)) max = new Decimal(1); // buy at least 1
        }
        player.ce.rna = player.ce.rna.sub(costPerUnit.mul(max));
        player.ce.mJannaschii = player.ce.mJannaschii.add(max);
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(max),
        );
      },
      style: {
        "border-radius": "0px",
        "border-color": "#000000",
        "font-family": "Times New Roman",
        "font-size": "15px",
      },
    },
  },

  infoboxes: {
    lore: {
      title: "Cells",
      body() {
        return "Cells are among the tiniest living oragnisms. They can be a prokaryote or eukaryote with eukaryotes having organelles and a Nucleus. In a cell, there are various organelles. A few are availible to purchse in order to construct a cell. Mitochondria: The powerhouse, producing the energy bearing molecule ATP. The Nucleus: codes for proteins and houses DNA. The Endoplasmic Reticulum: contains ribosomes and has safe travel for molecules heading to the Nucleus. Ribosomes create amino acids and proteins. Golgi: The Golgi packages proteins to send, in game it makes proteins and ribosomes make amino acids. Vaucole: breaks down hyper multiplier into hyper quarks. This can give insane boosts! Cytoplasm: liquid substance that helps maintain shape and hold organelles.";
      },
    },
    lore2: {
      title: "Prokaryotes",
      body() {
        return `Prokaryotes(organelle-less) come in all shapes and sizes. You have the option between a few prokaryotes to obtain. They all require RNA and DNA though. The first is bacteria. Bacteria perform various functions from infecting hosts to breaking down Nitrogen gas. Next, we have Archaebacteria, which are similar to bacteria, but fundamentally differ in terms of composition. They can perform similar functions.
           `;
      },
    },
    lore3: {
      title: "Specialization",
      body() {
        return `You may have noticed cellular energy is tedious to obtain. Well, thats because you aren't expected to obtain cells soley via that way. Further, the cells you have obtained thus far are stem cells. There are many, many types of cells. Here, you get a variety of options to choose from. In addition, new cells will be able to be created from Protein Complexes. Organelles still play a vital role, cellular energy gain will be increased as we go and automated. Enjoy! This will be updated as you go to higher layers
           `;
      },
    },
  },
});
