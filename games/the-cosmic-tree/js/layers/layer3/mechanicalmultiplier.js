addLayer("chm", {
  name: "Mechanical Multiplier", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "MEM", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order

  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      variable: new Decimal(0),

      scrap: new Decimal(0),
      highlandScrap: new Decimal(0),
      lowlandScrap: new Decimal(0),
      empyreanScrap: new Decimal(0),
      abzFunction() {
        let multiplier = new Decimal(1);

        multiplier = multiplier.times(
          new Decimal(0.01).mul(player.chm.alphabetasyntax),
        );
        if (multiplier.lte(1)) {
          multiplier = new Decimal(1);
        } else if (multiplier.gte(10)) {
          multiplier = new Decimal(10);
        }
        return multiplier;
      },

      // Tier 1

      scrapBot: new Decimal(0),
      droneScrap: new Decimal(0),
      droneMK1: new Decimal(0),
      castingMaterial: new Decimal(0),
      droneMK1InLowlands: 0,
      droneMK2InHighlands: 0,

      // Lowland resources
      zet: new Decimal(0),
      empzet: new Decimal(0),
      protozet: new Decimal(0),
      alphabetasyntax: new Decimal(0),

      // Update necessaries
      iter: new Decimal(0),
      roll: 0,
      chance: 0,
      chance2: 0,
      chance3: 0,
      chance4: 0,
      chance5: 0,
      rollTimer: 0,
      rollTimer2: 0,
      rollTimer3: 0,
      rollTimer4: 0,
      rollTimer5: 0,

      // Highland resources
      hTroxMultiplierFunction() {
        let multiplier = new Decimal(1);
        multiplier = multiplier.times(
          new Decimal(1).add(player.chm.heavyTrox.mul(0.01)),
        );
        if (multiplier.gte(7)) {
          multiplier = new Decimal(7);
        }
        return multiplier;
      },
      trox: new Decimal(0),
      highlandZet: new Decimal(0),
      heavyTrox: new Decimal(0),
      multiplicitiveInverse: new Decimal(0),
      mInverseFunction() {
        let multiplier = new Decimal(1);
        multiplier = multiplier.times(
          new Decimal(1).add(player.chm.multiplicitiveInverse.mul(0.1)),
        );
        if (multiplier.gte(1000)) {
          multiplier = new Decimal(1000);
        }
        return multiplier;
      },
      // Tier 2
      droneMK2: new Decimal(0),
      scrapBotMK2: new Decimal(0),
      geometricDome: new Decimal(0),

      // Frost/ Tier 3

      iceBot: new Decimal(0),
      metallicBerg: new Decimal(0),
      frostDrone: new Decimal(0),
      submarines: new Decimal(0),
      frostDronesInArctic: 0,
      submarinesInOcean: 0,
      frostFunction() {
        let maxForFrost = player.chm.frostDrone.toNumber();
        if (maxForFrost < 1) {
          return 0;
        }
        if (maxForFrost > 1e300) {
          return [1e300];
        }
        return [maxForFrost];
      },
      seaFunction() {
        let maxForSub = player.chm.submarines.toNumber();
        if (maxForSub < 1) {
          return 0;
        }
        if (maxForSub > 1e300) {
          return [1e300];
        }
        return [maxForSub];
      },
      // Arctic Resources

      snow: new Decimal(0),
      frost: new Decimal(0),
      icebergs: new Decimal(0),
      iceshelves: new Decimal(0),

      // Oceanic Resources

      coral: new Decimal(0),
      pearl: new Decimal(0),
      marianicShards: new Decimal(0),
      aquamarine: new Decimal(0),
      abyssalCrystals: new Decimal(0),

      // Tier 4 - Anatomic Arzendics

      hBot: new Decimal(0),
      tesseract: new Decimal(0),
      hDrone: new Decimal(0),
      mechanicalBomb: new Decimal(0),
      hDroneInQuantumRealm: new Decimal(0),
      // Anatomic/Hyperionic Resources

      hZet: new Decimal(0),
      hTrox: new Decimal(0),
      hShard: new Decimal(0),
      bomb: new Decimal(0),

      hFunction() {
        let maxForhDrone = player.chm.hDrone.toNumber();
        if (maxForhDrone < 1) {
          return 0;
        }
        if (maxForhDrone > 1e300) {
          return [1e300];
        }
        return [maxForhDrone];
      },
    };
  },
  color: "#696969",
  requires: new Decimal(100000000), // Can be a function that takes requirement increases into account
  resource: "Mechanical multipliers", // Name of prestige currency
  baseResource: "Vinyl multipliers", // Name of resource prestige is based on
  baseAmount() {
    return player.v.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  passiveGeneration() {
    if (hasMilestone("o", 8)) return new Decimal(1);
  },
  scrapMultiplier() {
    let mult = new Decimal(1);
    if (player.chm.scrapBot.gte(1)) mult = mult.times(buyableEffect("chm", 13));
    if (player.chm.droneMK1.gte(1)) mult = mult.times(buyableEffect("chm", 11));
    if (player.chm.scrapBotMK2.gte(1))
      mult = mult.times(buyableEffect("chm", 14));
    if (hasUpgrade("mm", 21)) mult = mult.times(5);
    if (player.b.Vauqrase.gte(1))
      mult = mult.times(player.b.vauqraseMultiplier());
    if (player.chm.iceBot.gte(1)) mult = mult.times(buyableEffect("chm", 17));
    if (mult.lte(1)) {
      mult = new Decimal(1);
    }
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("mm", 21)) mult = mult.times(5);
    }
    if (player.chm.hBot.gte(1)) mult = mult.times(buyableEffect("chm", 21));
    if (player.chm.hDrone.gte(1))
      mult = mult.times(buyableEffect("chm", 23)[0]);
    if (player.art.kingCrystal.gte(1)) mult = mult.pow(2);
    return mult;
  },
  doReset(reset) {
    let keep = [];
    if (!player.nm.layersCanReset) {
      return null;
    }
    keep.push("variable");
    if (player.mm.keep) {
      keep.push(
        "scrap",
        "highlandScrap",
        "lowlandScrap",
        "empyreanScrap",
        "scrapBot",
        "droneScrap",
        "droneMK1",
        "castingMaterial",
        "lowlandzet",
        "zet",
        "empzet",
        "protozet",
        "alphabetasyntax",
        "trox",
        "highlandZet",
        "heavyTrox",
        "multiplicativeInverse",
        "droneMK2",
        "scrapBotMK2",
        "geometricDome",
        "iceBot",
        "metallicBerg",
        "frostDrone",
        "submarines",
        "snow",
        "frost",
        "icebergs",
        "iceshelves",
        "coral",
        "pearl",
        "marianicShards",
        "aquamarine",
        "abyssalCrystals",
        "hBot",
        "tesseract",
        "hDrone",
        "hZet",
        "hTrox",
        "hShard",
        "bomb",
      );
    }
    if (layers[reset].row > this.row) {
      layerDataReset("chm", keep);
    }
  },
  update(diff) {
    if (player.chm.points.gte(1)) {
      player.chm.variable = new Decimal(1);
      player.chm.scrap = player.chm.scrap.plus(
        new Decimal(0.1)
          .mul(diff * 0.01)
          .mul(player.chm.points.plus(1))
          .mul(this.scrapMultiplier()),
      );
    }
    if (player.chm.droneMK1InLowlands >= 1) {
      let lowlandMultiplier = new Decimal(player.chm.droneMK1InLowlands)
        .ln()
        .times(0.3);
      if (lowlandMultiplier.lte(1)) {
        lowlandMultiplier = new Decimal(1);
      }

      let chance = player.chm.chance;
      player.chm.rollTimer += 0.1;

      if (player.chm.rollTimer >= 3) {
        chance = Math.random() * 100;
        if (chance >= 80) {
          if (player.chm.lowlandScrap.gte(2)) {
            player.chm.lowlandScrap = player.chm.lowlandScrap.add(
              new Decimal(1).mul(lowlandMultiplier),
            );
          } else {
            player.chm.lowlandScrap = player.chm.lowlandScrap.add(
              new Decimal(1),
            );
          }
        } else if (chance >= 50) {
          if (player.chm.zet.gte(2)) {
            player.chm.zet = player.chm.zet.add(
              new Decimal(1).mul(lowlandMultiplier),
            );
          } else {
            player.chm.zet = player.chm.zet.add(new Decimal(1));
          }
        } else if (chance >= 20) {
          if (player.chm.empzet.gte(2)) {
            player.chm.empzet = player.chm.empzet.add(
              new Decimal(1).mul(lowlandMultiplier),
            );
          } else {
            player.chm.empzet = player.chm.empzet.add(new Decimal(1));
          }
        } else if (chance >= 10) {
          if (player.chm.protozet.gte(2)) {
            player.chm.protozet = player.chm.protozet.add(
              new Decimal(1).mul(lowlandMultiplier),
            );
          } else {
            player.chm.protozet = player.chm.protozet.add(new Decimal(1));
          }
        } else {
          if (player.chm.alphabetasyntax.gte(2)) {
            player.chm.alphabetasyntax = player.chm.alphabetasyntax.add(
              new Decimal(1).mul(lowlandMultiplier),
            );
          } else {
            player.chm.alphabetasyntax = player.chm.alphabetasyntax.add(
              new Decimal(1),
            );
          }
        }
        player.chm.rollTimer = 0;
      }
    }
    if (player.chm.droneMK2InHighlands >= 1) {
      let highlandMultiplier = new Decimal(player.chm.droneMK2InHighlands)
        .ln()
        .times(0.1);
      if (highlandMultiplier.lte(1)) {
        highlandMultiplier = new Decimal(1);
      }

      let chance2 = player.chm.chance2;
      player.chm.rollTimer2 += 0.1;

      if (player.chm.rollTimer2 >= 3) {
        chance2 = Math.random() * 100;
        if (chance2 >= 85) {
          if (player.chm.highlandScrap.gte(2)) {
            player.chm.highlandScrap = player.chm.highlandScrap.add(
              new Decimal(1).mul(highlandMultiplier),
            );
          } else {
            player.chm.highlandScrap = player.chm.highlandScrap.add(
              new Decimal(1),
            );
          }
        } else if (chance2 >= 55) {
          if (player.chm.trox.gte(2)) {
            player.chm.trox = player.chm.trox.add(
              new Decimal(1).mul(highlandMultiplier),
            );
          } else {
            player.chm.trox = player.chm.trox.add(new Decimal(1));
          }
        } else if (chance2 >= 30) {
          if (player.chm.highlandZet.gte(2)) {
            player.chm.highlandZet = player.chm.highlandZet.add(
              new Decimal(1).mul(highlandMultiplier),
            );
          } else {
            player.chm.highlandZet = player.chm.highlandZet.add(new Decimal(1));
          }
        } else if (chance2 >= 12) {
          if (player.chm.heavyTrox.gte(2)) {
            player.chm.heavyTrox = player.chm.heavyTrox.add(
              new Decimal(1).mul(highlandMultiplier),
            );
          } else {
            player.chm.heavyTrox = player.chm.heavyTrox.add(new Decimal(1));
          }
        } else if (chance2 >= 9) {
          if (player.chm.castingMaterial.gte(2)) {
            player.chm.castingMaterial = player.chm.castingMaterial.add(
              new Decimal(1).mul(highlandMultiplier),
            );
          } else {
            player.chm.castingMaterial = player.chm.castingMaterial.add(
              new Decimal(1),
            );
          }
        } else {
          if (player.chm.multiplicitiveInverse.gte(2)) {
            player.chm.multiplicitiveInverse =
              player.chm.multiplicitiveInverse.add(
                new Decimal(1).mul(highlandMultiplier),
              );
          } else {
            player.chm.multiplicitiveInverse =
              player.chm.multiplicitiveInverse.add(new Decimal(1));
          }
        }
        player.chm.rollTimer2 = 0;
      }
    }
    if (player.chm.frostDonesInArctic >= 1) {
      let arcticMultiplier = new Decimal(player.chm.frostDronesInArctic)
        .ln()
        .times(0.1);
      if (arcticMultiplier.lte(1)) {
        arcticMultiplier = new Decimal(1);
      }

      let chance3 = player.chm.chance3;
      player.chm.rollTimer3 += 0.1;

      if (player.chm.rollTimer3 >= 4) {
        chance3 = Math.random() * 100;
        if (chance3 >= 82) {
          if (player.chm.snow.gte(2)) {
            player.chm.snow = player.chm.snow.add(
              new Decimal(1).mul(arcticMultiplier),
            );
          } else {
            player.chm.snow = player.chm.snow.add(new Decimal(1));
          }
        } else if (chance3 >= 53) {
          if (player.chm.frost.gte(2)) {
            player.chm.frost = player.chm.frost.add(
              new Decimal(1).mul(arcticMultiplier),
            );
          } else {
            player.chm.frost = player.chm.frost.add(new Decimal(1));
          }
        } else if (chance3 >= 35) {
          if (player.chm.icebergs.gte(2)) {
            player.chm.icebergs = player.chm.icebergs.add(
              new Decimal(1).mul(arcticMultiplier),
            );
          } else {
            player.chm.icebergs = player.chm.icebergs.add(new Decimal(1));
          }
        } else {
          if (player.chm.iceshelves.gte(2)) {
            player.chm.iceshelves = player.chm.iceshelves.add(
              new Decimal(1).mul(arcticMultiplier),
            );
          } else {
            player.chm.iceshelves = player.chm.iceshelves.add(new Decimal(1));
          }
        }
        player.chm.rollTimer3 = 0;
      }
    }
    if (player.chm.submarinesInOcean >= 1) {
      let seaMultiplier = new Decimal(player.chm.submarinesInOcean)
        .ln()
        .times(0.1);
      if (seaMultiplier.lte(1)) {
        seaMultiplier = new Decimal(1);
      }

      let chance4 = player.chm.chance4;
      player.chm.rollTimer4 += 0.1;

      if (player.chm.rollTimer4 >= 7) {
        chance4 = Math.random() * 100;
        if (chance4 >= 70) {
          if (player.chm.coral.gte(2)) {
            player.chm.coral = player.chm.coral.add(
              new Decimal(1).mul(seaMultiplier),
            );
          } else {
            player.chm.coral = player.chm.coral.add(new Decimal(1));
          }
        } else if (chance4 >= 45) {
          if (player.chm.pearl.gte(2)) {
            player.chm.pearl = player.chm.pearl.add(
              new Decimal(1).mul(seaMultiplier),
            );
          } else {
            player.chm.pearl = player.chm.pearl.add(new Decimal(1));
          }
        } else if (chance4 >= 25) {
          if (player.chm.marianicShards.gte(2)) {
            player.chm.marianicShards = player.chm.marianicShards.add(
              new Decimal(1).mul(seaMultiplier),
            );
          } else {
            player.chm.marianicShards = player.chm.marianicShards.add(
              new Decimal(1),
            );
          }
        } else if (chance4 >= 10) {
          if (player.chm.aquamarine.gte(2)) {
            player.chm.aquamarine = player.chm.aquamarine.add(
              new Decimal(1).mul(seaMultiplier),
            );
          } else {
            player.chm.aquamarine = player.chm.aquamarine.add(new Decimal(1));
          }
        } else {
          if (player.chm.abyssalCrystals.gte(2)) {
            player.chm.abyssalCrystals = player.chm.abyssalCrystals.add(
              new Decimal(1).mul(seaMultiplier),
            );
          } else {
            player.chm.abyssalCrystals = player.chm.abyssalCrystals.add(
              new Decimal(1),
            );
          }
        }
        player.chm.rollTimer4 = 0;
      }
    }
    if (player.chm.hDroneInQuantumRealm >= 1) {
      let hMultiplier = new Decimal(player.chm.hDroneInQuantumRealm)
        .ln()
        .times(0.1);
      if (hMultiplier.lte(1)) {
        hMultiplier = new Decimal(1);
      }

      let chance5 = player.chm.chance5;
      player.chm.rollTimer5 += 0.1;

      if (player.chm.rollTimer5 >= 11) {
        chance5 = Math.random() * 100;
        if (chance5 >= 75) {
          if (player.chm.hZet.gte(2)) {
            player.chm.hZet = player.chm.hZet.add(
              new Decimal(1).mul(hMultiplier),
            );
          } else {
            player.chm.hZet = player.chm.hZet.add(new Decimal(1));
          }
        } else if (chance5 >= 42) {
          if (player.chm.hTrox.gte(2)) {
            player.chm.hTrox = player.chm.hTrox.add(
              new Decimal(1).mul(hMultiplier),
            );
          } else {
            player.chm.hTrox = player.chm.hTrox.add(new Decimal(1));
          }
        } else if (chance5 >= 21) {
          if (player.chm.hShard.gte(2)) {
            player.chm.hShard = player.chm.hShard.add(
              new Decimal(1).mul(hMultiplier),
            );
          } else {
            player.chm.hShard = player.chm.hShard.add(new Decimal(1));
          }
        } else {
          if (player.chm.bomb.gte(2)) {
            player.chm.bomb = player.chm.bomb.add(
              new Decimal(1).mul(hMultiplier),
            );
          } else {
            player.chm.bomb = player.chm.bomb.add(new Decimal(1));
          }
        }
        player.chm.rollTimer5 = 0;
      }
    }
  },
  canBuyMax() {
    return false;
  },
  exponent: 0.5, // Prestige currency exponent
  directMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (player.b.Vauqrase.gte(1))
      mult = mult.times(player.b.vauqraseMultiplier());
    if (inChallenge("d", 14)) {
      return mult;
    } else {
      if (hasUpgrade("mm", 13)) mult = mult.times(2);
    }
    if (getBuyableAmount("chm", 23).gte(1))
      mult = mult.times(buyableEffect("chm", 23)[1]);
    if (player.art.kingCrystal.gte(1)) mult = mult.pow(2);
    return mult;
  },
  gainMult() {
    return new Decimal(1);
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  nodeStyle() {
    if (tmp.chm.canReset || player.chm.unlocked) {
      return {
        "background-image":
          "linear-gradient(90deg,rgb(122, 112, 112) 0%, rgb(161, 144, 144) 50%, rgb(139, 128, 128) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
        "border-radius": "0px",
        "clip-path":
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        width: "125px",
        height: "100px",
      };
    } else
      return {
        "clip-path":
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        width: "125px",
        height: "100px",
        "border-radius": "0px",
      };
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  branches: ["h", "hm"],
  hotkeys: [
    {
      key: "shift + m",
      description: "Shift + M: Reset for Mechanical Multipliers",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return player.t.unlocked;
  },
  tabFormat: {
    Arzendics: {
      content: [
        [
          "main-display",
          function () {
            return "main-display";
          },
          { "font-family": "Times New Roman" },
        ],
        "prestige-button",
        "blank",

        [
          "display-text",
          function () {
            return (
              "You have " + format(player.v.points) + " Vinyl Multipliers."
            );
          },
          { "font-size": "30px" },
        ],

        "blank",

        "blank",
        "blank",
        "blank",

        [
          "column",
          [
            [
              "display-text",
              function () {
                return "<i>Tier 1 Arzendics</i>";
              },
              {
                "font-size": "50px",
                color: "#dfdfdf",
                "font-family": "Times New Roman",
              },
            ],
            [
              "display-text",
              function () {
                return "Arzendics is a made-up term used to describe the machinery made";
              },
              {
                "font-size": "20px",
                color: "#dfdfdf",
                "font-family": "Times New Roman",
              },
            ],
            [
              "row",
              [
                [
                  "display-text",
                  function () {
                    return "You have " + format(player.chm.scrap) + " Scrap ";
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px dashed #ffffff",
                    width: "400px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(134, 126, 134, 0.44) 0%, rgba(70, 68, 71, 0.45) 50%, rgba(93, 93, 93, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],

                [
                  "display-text",
                  function () {
                    return (
                      "You have " +
                      format(player.chm.lowlandScrap) +
                      " Lowland Scrap"
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
                      "linear-gradient(90deg,rgba(24, 59, 3, 0.44) 0%, rgba(39, 82, 12, 0.45) 50%, rgba(42, 97, 8, 0.45) 100%)",
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
                      format(player.chm.highlandScrap) +
                      " Highland Scrap"
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
                      "linear-gradient(90deg,rgba(16, 51, 15, 0.44) 0%, rgba(29, 79, 28, 0.45) 50%, rgba(2, 36, 1, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],

                [
                  "display-text",
                  function () {
                    return (
                      "You have " +
                      format(player.chm.empyreanScrap) +
                      " Empyrean Scrap"
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
                      "linear-gradient(90deg,rgba(209, 227, 16, 0.44) 0%, rgba(198, 214, 26, 0.45) 50%, rgba(176, 191, 10, 0.45) 100%)",
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
                      "You have " + format(player.chm.scrapBot) + " Scrap Bots"
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
                      "linear-gradient(90deg,rgba(154, 126, 134, 0.44) 0%, rgba(70, 88, 71, 0.45) 50%, rgba(93, 93, 67, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],

                [
                  "display-text",
                  function () {
                    return (
                      "You have " +
                      format(player.chm.droneScrap) +
                      " Drone Scrap"
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
                      "linear-gradient(90deg,rgba(134, 126, 114, 0.44) 0%, rgba(70, 45, 71, 0.45) 50%, rgba(93, 103, 93, 0.45) 100%)",
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
                      "You have " + format(player.chm.droneMK1) + " Drones MK1."
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
                      "linear-gradient(90deg,rgba(134, 123, 134, 0.44) 0%, rgba(70, 68, 90, 0.45) 50%, rgba(40, 93, 93, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],

                [
                  "display-text",
                  function () {
                    return (
                      "You have " +
                      format(player.chm.castingMaterial) +
                      " Casting Material"
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
                      "linear-gradient(90deg,rgba(27, 184, 196, 0.44) 0%, rgba(20, 187, 166, 0.45) 50%, rgba(5, 120, 166, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],
              ],
            ],
            [
              "display-text",
              function () {
                return "<i>Tier 2 Arzendics</i>";
              },
              {
                "font-size": "50px",
                color: "#dfdfdf",
                "font-family": "Times New Roman",
              },
            ],
            [
              "row",
              [
                [
                  "display-text",
                  function () {
                    return (
                      "You have " +
                      format(player.chm.scrapBotMK2) +
                      " Scrap Bots MK2."
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
                      "linear-gradient(90deg,rgba(133, 73, 133, 0.44) 0%, rgba(106, 49, 88, 0.45) 50%, rgba(94, 29, 93, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],

                [
                  "display-text",
                  function () {
                    return (
                      "You have " + format(player.chm.droneMK2) + " Drones MK2."
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
                      "linear-gradient(90deg,rgba(117, 151, 83, 0.44) 0%, rgba(103, 187, 20, 0.45) 50%, rgba(117, 143, 69, 0.45) 100%)",
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
                      format(player.chm.geometricDome) +
                      " Geometric Domes."
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
                      "linear-gradient(90deg,rgba(30, 127, 49, 0.44) 0%, rgba(95, 155, 95, 0.45) 50%, rgba(148, 190, 141, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],

                [
                  "display-text",
                  function () {
                    return (
                      "You have " + format(player.chm.droneMK2) + " Drones MK2."
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
                      "linear-gradient(90deg,rgba(117, 151, 83, 0.44) 0%, rgba(103, 187, 20, 0.45) 50%, rgba(117, 143, 69, 0.45) 100%)",
                    "font-family": "Times New Roman",
                  },
                ],
              ],
            ],

            [
              "display-text",
              function () {
                return hasUpgrade("n", 13)
                  ? "<i>Tier 3/Frost Arzendics</i>"
                  : null;
              },
              {
                "font-size": "50px",
                color: "#dfdfdf",
                "font-family": "Times New Roman",
              },
            ],
            [
              "row",
              [
                function () {
                  return hasUpgrade("n", 13)
                    ? [
                        "display-text",
                        "You have " + format(player.chm.iceBot) + " Ice Bots",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#dfdfdf",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(23, 207, 176, 0.44) 0%, rgba(4, 170, 143, 0.45) 50%, rgba(0, 181, 205, 0.45) 100%)",
                          "font-family": "Times New Roman",
                        },
                      ]
                    : null;
                },

                function () {
                  return hasUpgrade("n", 13)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.metallicBerg) +
                          " Metallic Icebergs",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#dfdfdf",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(46, 68, 83, 0.44) 0%, rgba(0, 192, 218, 0.45) 50%, rgba(8, 96, 108, 0.45) 100%)",
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
                  return hasUpgrade("n", 13)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.frostDrone) +
                          " Frost Drones.",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#dfdfdf",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(0, 242, 246, 0.74) 0%, rgba(36, 240, 223, 0.45) 50%, rgba(5, 173, 220, 0.45) 100%)",
                          "font-family": "Times New Roman",
                        },
                      ]
                    : null;
                },
                function () {
                  return hasUpgrade("n", 21)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.submarines) +
                          " Submarines",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#dfdfdf",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(10, 55, 159, 0.44) 0%, rgba(0, 31, 188, 0.45) 50%, rgba(5, 40, 106, 0.45)100%)",
                          "font-family": "Times New Roman",
                        },
                      ]
                    : null;
                },
              ],
            ],
            [
              "display-text",
              function () {
                return inChallenge("d", 16) || hasChallenge("d", 16)
                  ? "<i>Tier 4/Hyperionic/Anatomic Arzendics</i>"
                  : null;
              },
              {
                "font-size": "50px",
                color: "#dfdfdf",
                "font-family": "Times New Roman",
              },
            ],
            [
              "row",
              [
                function () {
                  return inChallenge("d", 16) || hasChallenge("d", 16)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.hBot) +
                          " Hyperionic Bots",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#333131",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(224, 226, 103) 0%, rgb(194, 196, 121) 50%, rgb(161, 165, 99) 100%)",
                          "font-family": "Times New Roman",
                        },
                      ]
                    : null;
                },

                function () {
                  return inChallenge("d", 16) || hasChallenge("d", 16)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.tesseract) +
                          " Tesseracts",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#dfdfdf",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(103, 222, 226) 0%, rgb(121, 181, 196) 50%, rgb(99, 157, 165) 100%)",
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
                  return inChallenge("d", 16) || hasChallenge("d", 16)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.hDrone) +
                          " Hyperionic Drones",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#3b3737",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(174, 175, 89) 0%, rgb(234, 238, 117) 50%, rgb(232, 236, 176) 100%)",
                          "font-family": "Times New Roman",
                        },
                      ]
                    : null;
                },
                function () {
                  return hasChallenge("d", 16)
                    ? [
                        "display-text",
                        "You have " +
                          format(player.chm.mechanicalBomb) +
                          " Mecha Bombs",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#dfdfdf",
                          border: "2px dashed #ffffff",
                          width: "400px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(5, 58, 8, 0.3) 0%, rgba(5, 48, 16, 0.45) 50%, rgba(24, 75, 31, 0.45)100%)",
                          "font-family": "Times New Roman",
                        },
                      ]
                    : null;
                },
              ],
            ],
          ],
        ],
        "blank",
        "blank",
        [
          "display-text",
          function () {
            return "<u>Lowland Resources</u>";
          },
          { "font-size": "50px" },
        ],
        "blank",
        [
          "column",
          [
            [
              "row",
              [
                [
                  "display-text",
                  function () {
                    return "You have " + format(player.chm.zet) + " Zet ";
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(53, 208, 48, 0.44) 0%, rgba(44, 208, 46, 0.45) 50%, rgba(28, 183, 31, 0.45) 100%)",
                    "font-family": "Comic Sans",
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
                    return "You have " + format(player.chm.empzet) + " Empzet ";
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(35, 126, 32, 0.44) 0%, rgba(27, 126, 29, 0.45) 50%, rgba(13, 100, 15, 0.45) 100%)",
                    "font-family": "Comic Sans",
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
                      "You have " + format(player.chm.protozet) + " Protozet "
                    );
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(28, 109, 26, 0.44) 0%, rgba(22, 99, 23, 0.45) 50%, rgba(10, 68, 11, 0.45) 100%)",
                    "font-family": "Comic Sans",
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
                      format(player.chm.alphabetasyntax) +
                      " ABZ. Each ABZ boosts tetra by 0.01x.(caps at 10x) " +
                      "currently: " +
                      format(player.chm.abzFunction()) +
                      "x"
                    );
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(20, 67, 19, 0.44) 0%, rgba(6, 40, 7, 0.45) 50%, rgba(5, 38, 6, 0.45) 100%)",
                    "font-family": "Comic Sans",
                  },
                ],
              ],
            ],
          ],
        ],
        "blank",
        [
          "display-text",
          function () {
            return "<u>Highland Resources</u>";
          },
          { "font-size": "50px" },
        ],
        "blank",
        [
          "column",
          [
            [
              "row",
              [
                [
                  "display-text",
                  function () {
                    return "You have " + format(player.chm.trox) + " Troxes ";
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(177, 52, 52, 0.44) 0%, rgba(95, 250, 74, 0.45) 50%, rgba(157, 34, 34, 0.45) 100%)",
                    "font-family": "Comic Sans",
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
                      format(player.chm.highlandZet) +
                      " Highland Zet "
                    );
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(121, 40, 40, 0.44) 0%, rgba(55, 147, 43, 0.45) 50%, rgba(107, 25, 25, 0.45) 100%)",
                    "font-family": "Comic Sans",
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
                      format(player.chm.heavyTrox) +
                      " Heavy Troxes. A <i>Heavy</i> Trox boosts Heavy Multiplier by .01x, max at 7 | " +
                      "currently: " +
                      format(player.chm.hTroxMultiplierFunction()) +
                      "x"
                    );
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(88, 26, 26, 0.44) 0%, rgba(28, 78, 22, 0.45) 50%, rgba(65, 15, 15, 0.45) 100%)",
                    "font-family": "Comic Sans",
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
                      format(player.chm.multiplicitiveInverse) +
                      " Multiplicitive Inverses. They boost Cosmic Dust by .1x, max at 1000 | " +
                      "currently: " +
                      format(player.chm.mInverseFunction()) +
                      "x"
                    );
                  },
                  {
                    "font-size": "25px",
                    display: "inline-block",
                    color: "#dfdfdf",
                    border: "2px ridge #989898",
                    width: "600px",
                    height: "57px",
                    "background-image":
                      "linear-gradient(90deg,rgba(13, 58, 15, 0.44) 0%, rgba(44, 7, 7, 0.45) 50%, rgba(12, 42, 10, 0.45) 100%)",
                    "font-family": "Comic Sans",
                  },
                ],
              ],
            ],
          ],
        ],
        "blank",
        [
          "display-text",
          function () {
            return hasUpgrade("n", 13) ? "<u>Arctic Resources</u>" : "";
          },
          { "font-size": "50px" },
        ],
        "blank",
        function () {
          return hasUpgrade("n", 13)
            ? [
                "column",
                [
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.snow) +
                          " Pounds of Snow ",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(0, 255, 217, 1) 0%, rgba(99, 255, 237, 1) 50%, rgba(99, 255, 223, 1) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.frost) +
                          " Pounds of Frost ",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(0, 242, 255) 0%, rgb(99, 255, 255) 50%, rgb(99, 239, 255) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.icebergs) +
                          " Icebergs.",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(99, 203, 255, 1) 0%, rgba(99, 195, 255, 1) 50%, rgba(99, 203, 255, 1) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.iceshelves) +
                          " Iceshelves.",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgba(99, 177, 255, 1) 0%, rgba(99, 146, 255, 1) 50%, rgba(99, 130, 255, 1) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                ],
              ]
            : null;
        },
        "blank",
        [
          "display-text",
          function () {
            return hasUpgrade("n", 21) ? "<u>Oceanic Resources</u>" : "";
          },
          { "font-size": "50px" },
        ],
        "blank",
        function () {
          return hasUpgrade("n", 21)
            ? [
                "column",
                [
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.coral) +
                          " Coral Pieces ",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(46, 95, 241) 0%, rgb(43, 74, 249) 50%, rgb(52, 82, 255) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " + format(player.chm.pearl) + " Pearls ",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(0, 60, 255) 0%, rgb(38, 44, 221) 50%, rgb(41, 68, 221) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.marianicShards) +
                          " Marianic Shards",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(0, 7, 225) 0%, rgb(11, 18, 202) 50%, rgb(8, 40, 217) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.aquamarine) +
                          " Aquamarine",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(0, 8, 100) 0%, rgb(2, 0, 109) 50%, rgb(1, 0, 82) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.abyssalCrystals) +
                          " Abyssal Crystals",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(2, 3, 34) 0%, rgb(2, 0, 34) 50%, rgb(1, 1, 21) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                ],
              ]
            : null;
        },
        [
          "display-text",
          function () {
            return hasChallenge("d", 16) ? "<u>Anatomic Resources</u>" : "";
          },
          { "font-size": "50px" },
        ],
        "blank",
        function () {
          return hasChallenge("d", 16)
            ? [
                "column",
                [
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.hZet) +
                          " Hyperionic Zet ",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(35, 122, 32) 0%, rgb(199, 201, 102) 50%, rgb(207, 205, 92) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.hTrox) +
                          " Hyperionic Trox ",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(143, 59, 59) 0%, rgb(203, 204, 114) 50%, rgb(192, 190, 84) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.hShards) +
                          " Hyperionic Shards",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-image":
                            "linear-gradient(90deg,rgb(56, 92, 146) 0%, rgb(155, 150, 84) 50%, rgb(190, 178, 109) 100%)",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                  [
                    "row",
                    [
                      [
                        "display-text",
                        "You have " +
                          format(player.chm.mechanicalBomb) +
                          " Bombs",
                        {
                          "font-size": "25px",
                          display: "inline-block",
                          color: "#161616",
                          border: "2px ridge #989898",
                          width: "600px",
                          height: "57px",
                          "background-color": "lightgreen",
                          "font-family": "Comic Sans",
                        },
                      ],
                    ],
                  ],
                ],
              ]
            : null;
        },
        "blank",
        ["microtabs", "features"],
      ],
    },
    "Celestial Forge": {
      content: [
        [
          "column",
          [
            ["row", [["buyable", "51"]]],
            ["row", [["buyable", "52"]]],
            ["row", [["buyable", "53"]]],
            ["row", [["buyable", "54"]]],
          ],
        ],
      ],
    },
  },
  microtabs: {
    features: {
      Conversions: {
        content: [
          [
            "column",
            [
              ["display-text", "Tier 1", { "font-size": "30px" }],
              [
                "row",
                [
                  ["buyable", "11"],
                  ["buyable", "12"],
                  ["buyable", "13"],
                ],
              ],
              ["display-text", "Tier 2", { "font-size": "30px" }],
              [
                "row",
                [
                  ["buyable", "14"],
                  ["buyable", "15"],
                  ["buyable", "16"],
                ],
              ],
              [
                "display-text",
                function () {
                  return hasUpgrade("n", 13) ? "Tier 3" : null;
                },
                { "font-size": "30px" },
              ],
              function () {
                return hasUpgrade("n", 13)
                  ? [
                      "row",
                      [
                        ["buyable", "17"],
                        ["buyable", "18"],
                        ["buyable", "19"],
                        ["buyable", "20"],
                      ],
                    ]
                  : null;
              },
              [
                "display-text",
                function () {
                  return hasChallenge("d", 16) || inChallenge("d", 16)
                    ? "Tier 4"
                    : null;
                },
                { "font-size": "30px" },
              ],
              function () {
                return hasChallenge("d", 16) || inChallenge("d", 16)
                  ? [
                      "row",
                      [
                        ["buyable", "21"],
                        ["buyable", "22"],
                        ["buyable", "23"],
                        ["buyable", "24"],
                      ],
                    ]
                  : null;
              },
            ],
          ],
        ],
      },
      Assignments: {
        content: [
          [
            "display-text",
            function () {
              return "Assign drones mark 1 to the lowlands to gather lowland resources. Each drone assigned to the lowlands will boost lowland resource gain(not chance).";
            },
            { "font-size": "25px" },
          ],
          [
            "column",
            [
              [
                "row",
                [
                  [
                    "slider",
                    [
                      "droneMK1InLowlands",
                      0,
                      function () {
                        let maxForMK1 = player.chm.droneMK1.toNumber();
                        if (maxForMK1 < 1) {
                          return 0;
                        }
                        if (maxForMK1 > 1e300) {
                          return [1e300];
                        }
                        return [maxForMK1];
                      },
                    ],
                  ],
                ],
              ],
            ],
          ],
          [
            "display-text",
            function () {
              return "Assign drones mark 2 to the highlands to gather highland resources. Each drone assigned to the highlands will boost highland resource gain(not chance).";
            },
            { "font-size": "25px" },
          ],
          [
            "column",
            [
              [
                "row",
                [
                  [
                    "slider",
                    [
                      "droneMK2InHighlands",
                      0,
                      function () {
                        let maxForMK2 = player.chm.droneMK2.toNumber();
                        if (maxForMK2 < 1) {
                          return 0;
                        }
                        if (maxForMK2 > 1e300) {
                          return [1e300];
                        }
                        return [maxForMK2];
                      },
                    ],
                  ],
                ],
              ],
            ],
          ],
          [
            "display-text",
            function () {
              return hasUpgrade("n", 13)
                ? "Assign frost drones to the Arctic to gather Arctic resources. Each frost drone assigned to the Arctic will boost Arctic resource gain(not chance)."
                : null;
            },
            { "font-size": "25px" },
          ],
          function () {
            return hasUpgrade("n", 13)
              ? [
                  "column",
                  [
                    [
                      "row",
                      [
                        [
                          "slider",
                          [
                            "frostDronesInArctic",
                            0,
                            player.chm.frostFunction(),
                          ],
                        ],
                      ],
                    ],
                  ],
                ]
              : null;
          },
          [
            "display-text",
            function () {
              return hasUpgrade("n", 21)
                ? "Assign submarines to the Great Ocean to gather oceanic resources. Each submarine assigned to the Great Ocean will boost oceanic resource gain(not chance)."
                : null;
            },
            { "font-size": "25px" },
          ],
          function () {
            return hasUpgrade("n", 21)
              ? [
                  "column",
                  [
                    [
                      "row",
                      [
                        [
                          "slider",
                          ["submarinesInOcean", 0, player.chm.seaFunction()],
                        ],
                      ],
                    ],
                  ],
                ]
              : null;
          },
          [
            "display-text",
            function () {
              return hasChallenge("d", 16)
                ? "Assign hyperionic drones to the Quantum Realm to gather Anatomic resources. Each hyperionic drone assigned to the Quantum Realm will boost Anatomic resource gain(not chance)."
                : null;
            },
            { "font-size": "25px" },
          ],
          function () {
            return hasChallenge("d", 16)
              ? [
                  "column",
                  [
                    [
                      "row",
                      [
                        [
                          "slider",
                          ["hDroneInQuantumRealm", 0, player.chm.hFunction()],
                        ],
                      ],
                    ],
                  ],
                ]
              : null;
          },
        ],
      },
    },
    otherStuff: {
      // There could be another set of microtabs here
    },
  },
  buyables: {
    11: {
      cost() {
        let costEquation = player.chm.scrapBot
          .plus(1)
          .mul(Decimal.log(player.chm.scrapBot.plus(1), 10));
        if (costEquation.lte(1)) {
          costEquation = new Decimal(1);
        }
        return costEquation;
      }, // some sort of error
      display() {
        return (
          "Buy a scrap bot. Each scrap bot boosts scrap production" +
          " cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        if (player.chm.scrapBot >= 0.9) {
          return new Decimal(0.7).mul(player.chm.scrapBot).plus(1);
        }
      },
      canAfford() {
        return player.chm.scrap.gte(this.cost());
      },

      buyMax() {
        let costPerUnit = this.cost();
        if (costPerUnit.lte(1)) {
          costPerUnit = new Decimal(1);
        }
        let max = new Decimal(1);

        max = player.chm.scrap.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.chm.scrap = player.chm.scrap.sub(costPerUnit.mul(max));
        player.chm.scrapBot = player.chm.scrapBot.add(max);
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
    12: {
      cost() {
        let costEquation = player.chm.droneScrap
          .plus(player.chm.droneMK1)
          .plus(1)
          .pow(1.1);
        if (costEquation.lte(1)) {
          costEquation = new Decimal(1);
        }
        return costEquation;
      },
      display() {
        return (
          "Buy drone scrap, each drone scrap does nothing. Drone scrap is rather used to make drones" +
          " cost: " +
          format(this.cost())
        );
      },

      canAfford() {
        return player.chm.scrap.gte(this.cost());
      },
      buyMax() {
        let costPerUnit = player.chm.droneScrap
          .plus(player.chm.droneMK1)
          .plus(1)
          .pow(1.1);
        if (costPerUnit.lte(1)) {
          costPerUnit = new Decimal(1);
        }
        let max = new Decimal(1);

        max = player.chm.scrap.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.chm.scrap = player.chm.scrap.sub(costPerUnit.mul(max));
        player.chm.droneScrap = player.chm.droneScrap.add(max);
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
    13: {
      cost() {
        return player.chm.droneMK1.plus(1).pow(1.2);
      }, // some sort of error
      display() {
        return (
          "A drone dramatically boosts scrap production. In addition, drones can be assigned to areas to excavate for higher level scrap and other resources." +
          " cost: " +
          format(this.cost()) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        if (player.chm.droneMK1 >= 0.9) {
          return new Decimal(1.2).add(player.chm.droneMK1.mul(0.1));
        }
      },
      canAfford() {
        return player.chm.droneScrap.gte(this.cost());
      },
      buyMax() {
        let costPerUnit = player.chm.droneMK1.plus(1).pow(1.2);

        let max = new Decimal(1);

        max = player.chm.droneScrap.div(costPerUnit).floor();
        if (max.lte(1)) {
          max = new Decimal(1);
        }

        return [max, costPerUnit];
      },
      buy() {
        let [max, costPerUnit] = this.buyMax();
        player.chm.droneScrap = player.chm.droneScrap.sub(costPerUnit.mul(max));
        player.chm.droneMK1 = player.chm.droneMK1.add(max);
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
        return [
          new Decimal(1e16).mul(player.chm.scrapBotMK2.add(1)),
          new Decimal(100).mul(player.chm.scrapBotMK2.add(1)),
        ];
      }, // some sort of error
      display() {
        return (
          "Buy a scrap bot mark 2. A scrap bot mark 2 is more efficient than a scrap bot, but has a larger upfront cost. e.g. you need scrap bots and lowlandscrap." +
          " scrap Bot cost: " +
          format(this.cost()[0]) +
          " | lowland Scrap cost: " +
          format(this.cost()[1]) +
          " currently: " +
          format(buyableEffect(this.layer, this.id)) +
          "x"
        );
      },
      effect() {
        if (player.chm.scrapBotMK2.gte(0.9)) {
          return new Decimal(3).mul(player.chm.scrapBotMK2).plus(1);
        }
      },
      canAfford() {
        return (
          player.chm.scrapBot.gte(this.cost()[0]) &&
          player.chm.lowlandScrap.gte(this.cost()[1])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.scrapBot.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.lowlandScrap.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2);
        return [max, costPerUnit1, costPerUnit2];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2] = this.buyMax();
        player.chm.scrapBot = player.chm.scrapBot.sub(costPerUnit1.mul(max));
        player.chm.lowlandScrap = player.chm.lowlandScrap.sub(
          costPerUnit2.mul(max),
        );
        player.chm.scrapBotMK2 = player.chm.scrapBotMK2.add(max);
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
    15: {
      cost() {
        return [
          new Decimal(10000).mul(player.chm.geometricDome.add(1)),
          new Decimal(20).mul(player.chm.geometricDome.add(1)),
        ];
      }, // some sort of error
      display() {
        return (
          "Buy a geometric dome. They are required for acquiring drones mark 2 and unlocking the highland resources." +
          " drone Scrap cost: " +
          format(this.cost()[0]) +
          " | ABZ cost: " +
          format(this.cost()[1])
        );
      },

      canAfford() {
        return (
          player.chm.droneScrap.gte(this.cost()[0]) &&
          player.chm.alphabetasyntax.gte(this.cost()[1])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.droneScrap.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.alphabetasyntax.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2);
        return [max, costPerUnit1, costPerUnit2];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2] = this.buyMax();
        player.chm.droneScrap = player.chm.droneScrap.sub(
          costPerUnit1.mul(max),
        );
        player.chm.alphabetasyntax = player.chm.alphabetasyntax.sub(
          costPerUnit2.mul(max),
        );
        player.chm.geometricDome = player.chm.geometricDome.add(max);
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
      cost() {
        return [
          new Decimal(100).mul(player.chm.droneMK2.add(1)),
          new Decimal(1500000).mul(player.chm.droneMK2.add(1)),
        ];
      }, // some sort of error
      display() {
        return (
          "Buy a drone mark 2. Drones mark 2 are required for unlocking the highland resources." +
          " Geometric Dome cost: " +
          format(this.cost()[0]) +
          " | Drone MK1 cost: " +
          format(this.cost()[1])
        );
      },

      canAfford() {
        return (
          player.chm.geometricDome.gte(this.cost()[0]) &&
          player.chm.droneMK1.gte(this.cost()[1])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.geometricDome.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.droneMK1.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2);
        return [max, costPerUnit1, costPerUnit2];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2] = this.buyMax();
        player.chm.geometricDome = player.chm.geometricDome.sub(
          costPerUnit1.mul(max),
        );
        player.chm.droneMK1 = player.chm.droneMK1.sub(costPerUnit2.mul(max));
        player.chm.droneMK2 = player.chm.droneMK2.add(max);
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
    17: {
      cost() {
        return [
          new Decimal(3000).mul(player.chm.iceBot.add(1)),
          new Decimal(100).mul(player.chm.iceBot.add(1)),
        ];
      },
      display() {
        return (
          "Buy an Ice Bot. Ice Bots are cold-resistant constructs that massively boost scrap gain." +
          " Fragment(nissionite) cost: " +
          format(this.cost()[0]) +
          " | Scrap Bot MK2 cost: " +
          format(this.cost()[1]) +
          " | Effect: " +
          format(this.effect()) +
          "x scrap gain"
        );
      },
      effect() {
        return player.chm.iceBot.mul(3).add(1);
      },
      unlocked() {
        return hasUpgrade("n", 13);
      },
      canAfford() {
        return (
          player.n.fragments.gte(this.cost()[0]) &&
          player.chm.scrapBotMK2.gte(this.cost()[1])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.n.fragments.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.scrapBotMK2.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2);
        return [max, costPerUnit1, costPerUnit2];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2] = this.buyMax();
        player.n.fragments = player.n.fragments.sub(costPerUnit1.mul(max));
        player.chm.scrapBotMK2 = player.chm.scrapBotMK2.sub(
          costPerUnit2.mul(max),
        );
        player.chm.iceBot = player.chm.iceBot.add(max);
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
    18: {
      cost() {
        return [
          new Decimal(25).mul(player.chm.metallicBerg.add(1)),
          new Decimal(25).mul(player.chm.metallicBerg.add(1)),
        ];
      },
      display() {
        return (
          "Buy a Metallicberg, Metallicbergs are icebergs but made of stainless steel, they are required for frost drones, that can handle the harsh Arctic." +
          " Geometric Dome cost: " +
          format(this.cost()[0]) +
          " | Multiplicative Inverse cost: " +
          format(this.cost()[1])
        );
      },
      unlocked() {
        return hasUpgrade("n", 13);
      },
      canAfford() {
        return (
          player.chm.geometricDome.gte(this.cost()[0]) &&
          player.chm.multiplicitiveInverse.gte(this.cost()[1])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.geometricDome.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.multiplicitiveInverse.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2);
        return [max, costPerUnit1, costPerUnit2];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2] = this.buyMax();
        player.chm.geometricDome = player.chm.geometricDome.sub(
          costPerUnit1.mul(max),
        );
        player.chm.multiplicitiveInverse = player.chm.multiplicitiveInverse.sub(
          costPerUnit2.mul(max),
        );
        player.chm.metallicBerg = player.chm.metallicBerg.add(max);
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
    19: {
      cost() {
        return [
          new Decimal(50).mul(player.chm.frostDrone.add(1)),
          new Decimal(300).mul(player.chm.frostDrone.add(1)),
        ];
      },
      display() {
        return (
          "Create the rugged frost drone, a true spectacle that can survive and harvest the harsh Arctic" +
          " Metallic Iceberg cost: " +
          format(this.cost()[0]) +
          " | drone MK2 cost: " +
          format(this.cost()[1])
        );
      },
      unlocked() {
        return hasUpgrade("n", 13);
      },
      canAfford() {
        return (
          player.chm.metallicBerg.gte(this.cost()[0]) &&
          player.chm.droneMK2.gte(this.cost()[1])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.metallicBerg.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.droneMK2.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2);
        return [max, costPerUnit1, costPerUnit2];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2] = this.buyMax();
        player.chm.metallicBerg = player.chm.metallicBerg.sub(
          costPerUnit1.mul(max),
        );
        player.chm.droneMK2 = player.chm.droneMK2.sub(costPerUnit2.mul(max));
        player.chm.frostDrone = player.chm.frostDrone.add(max);
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
        return [
          new Decimal(150).mul(player.chm.submarines.add(1)),
          new Decimal(1400).mul(player.chm.submarines.add(1)),
          new Decimal(33).mul(player.chm.submarines.add(1)),
        ];
      },
      display() {
        return (
          "Create a submarine, the pinnacle of oceanic engineering, capable of exploring the deepest trenches and harvesting resources with ease." +
          " Iceshelf cost: " +
          format(this.cost()[0]) +
          " | Geometric Dome cost: " +
          format(this.cost()[1]) +
          " | Super-Advanced Telescope cost: " +
          format(this.cost()[2])
        );
      },
      unlocked() {
        return hasUpgrade("n", 21);
      },
      canAfford() {
        return (
          player.chm.iceshelves.gte(this.cost()[0]) &&
          player.chm.geometricDome.gte(this.cost()[1]) &&
          player.c.sat.gte(this.cost()[2])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        let costPerUnit3 = this.cost()[2];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.iceshelves.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.geometricDome.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }

        if (costPerUnit3.lte(1)) {
          costPerUnit3 = new Decimal(1);
        }
        let max3 = new Decimal(1);

        max3 = player.c.sat.div(costPerUnit3).floor();
        if (max3.lte(1)) {
          max3 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2, max3);
        return [max, costPerUnit1, costPerUnit2, costPerUnit3];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2, costPerUnit3] = this.buyMax();
        player.chm.geometricDome = player.chm.geometricDome.sub(
          costPerUnit1.mul(max),
        );
        player.chm.iceshelves = player.chm.iceshelves.sub(
          costPerUnit2.mul(max),
        );
        player.c.sat = player.c.sat.sub(costPerUnit3.mul(max));
        player.chm.droneMK2 = player.chm.droneMK2.add(max);
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
    21: {
      cost() {
        return [
          new Decimal(150).mul(player.chm.hDrone.add(1)),
          new Decimal(300).mul(player.chm.hDrone.add(1)),
          new Decimal(10000).mul(player.chm.hDrone.add(1)),
          new Decimal(7).mul(player.chm.hDrone.add(1)),
        ];
      },
      display() {
        return (
          "Create a hBot, a beast at multiplying scrap." +
          " Ice Bot cost: " +
          format(this.cost()[0]) +
          " | Aquamarine Cost: " +
          format(this.cost()[1]) +
          " | Polymetric cost: " +
          format(this.cost()[2]) +
          " | Unit of Fire cost:" +
          format(this.cost()[3]) +
          " | Currently: " +
          format(this.effect()) +
          "x"
        );
      },
      effect() {
        return new Decimal(27).mul(player.chm.hBot.mul(9));
      },
      unlocked() {
        return hasChallenge("d", 16) || inChallenge("d", 16);
      },
      canAfford() {
        return (
          player.chm.iceBot.gte(this.cost()[0]) &&
          player.chm.aquamarine.gte(this.cost()[1]) &&
          player.d.polymetrics.gte(this.cost()[2]) &&
          player.ct.fire.gte(this.cost()[3])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        let costPerUnit3 = this.cost()[2];
        let costPerUnit4 = this.cost()[3];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.iceBot.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.aquamarine.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }

        if (costPerUnit3.lte(1)) {
          costPerUnit3 = new Decimal(1);
        }
        let max3 = new Decimal(1);

        max3 = player.d.polymetrics.div(costPerUnit3).floor();
        if (max3.lte(1)) {
          max3 = new Decimal(1);
        }

        if (costPerUnit4.lte(1)) {
          costPerUnit4 = new Decimal(1);
        }
        let max4 = new Decimal(1);

        max4 = player.ct.fire.div(costPerUnit4).floor();
        if (max4.lte(1)) {
          max4 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2, max3, max4);
        return [max, costPerUnit1, costPerUnit2, costPerUnit3, costPerUnit4];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2, costPerUnit3, costPerUnit4] =
          this.buyMax();
        player.chm.iceBot = player.chm.iceBot.sub(costPerUnit1.mul(max));
        player.chm.aquamarine = player.chm.aquamarine.sub(
          costPerUnit2.mul(max),
        );
        player.d.polymetrics = player.d.polymetrics.sub(costPerUnit3.mul(max));
        player.ct.fire = player.ct.fire.sub(costPerUnit4.mul(max));
        player.chm.hBot.add(max);
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
    22: {
      cost() {
        return [
          new Decimal(100).mul(player.chm.tesseract.add(1)),
          new Decimal(2000).mul(player.chm.tesseract.add(1)),
          new Decimal(50).mul(player.chm.tesseract.add(1)),
          new Decimal(1000).mul(player.chm.tesseract.add(1)),
        ];
      },
      display() {
        return (
          "Create a tesseract, a hybrid of Tetra-dimensional anomalies." +
          " Dimensional Point cost: " +
          format(this.cost()[0]) +
          " | ABZ Cost: " +
          format(this.cost()[1]) +
          " | Metallic Iceberg cost: " +
          format(this.cost()[2]) +
          " | Atomic Multiplier cost:" +
          format(this.cost()[3])
        );
      },
      unlocked() {
        return hasChallenge("d", 16) || inChallenge("d", 16);
      },
      canAfford() {
        return (
          player.d.points.gte(this.cost()[0]) &&
          player.chm.alphabetasyntax.gte(this.cost()[1]) &&
          player.chm.metallicBerg.gte(this.cost()[2]) &&
          player.ct.amult.gte(this.cost()[3])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        let costPerUnit3 = this.cost()[2];
        let costPerUnit4 = this.cost()[3];
        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.d.points.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.alphabetasyntax.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }

        if (costPerUnit3.lte(1)) {
          costPerUnit3 = new Decimal(1);
        }
        let max3 = new Decimal(1);

        max3 = player.chm.metallicBerg.div(costPerUnit3).floor();
        if (max3.lte(1)) {
          max3 = new Decimal(1);
        }

        if (costPerUnit4.lte(1)) {
          costPerUnit4 = new Decimal(1);
        }
        let max4 = new Decimal(1);

        max4 = player.ct.amult.div(costPerUnit4).floor();
        if (max4.lte(1)) {
          max4 = new Decimal(1);
        }
        let max = Decimal.min(max1, max2, max3, max4);
        return [max, costPerUnit1, costPerUnit2, costPerUnit3, costPerUnit4];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2, costPerUnit3, costPerUnit4] =
          this.buyMax();
        player.d.points = player.d.points.sub(costPerUnit1.mul(max));
        player.chm.alphabetasyntax = player.chm.alphabetasyntax.sub(
          costPerUnit2.mul(max),
        );
        player.chm.metallicBerg = player.chm.metallicBerg.sub(
          costPerUnit3.mul(max),
        );
        player.ct.amult = player.ct.amult.sub(costPerUnit4.mul(max));
        player.chm.tesseract = player.chm.tesseract.add(max);
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
    23: {
      cost() {
        return [
          new Decimal(50).mul(player.chm.hDrone.add(1)),
          new Decimal(100).mul(player.chm.hDrone.add(1)),
          new Decimal(3).mul(player.chm.hDrone.add(1)),
        ];
      },
      display() {
        return (
          "Create a hyperionic Drone... it boosts scrap and Mechanical Multiplier" +
          " Frost Drone cost: " +
          format(this.cost()[0]) +
          " | Mechanical Multiplier Cost: " +
          format(this.cost()[1]) +
          " | Tesseract cost: " +
          format(this.cost()[2]) +
          " | Currently: " +
          format(this.effect()[0]) +
          "x to scrap | " +
          format(this.effect()[1]) +
          "x to Mechanical Multiplier"
        );
      },
      effect() {
        return [
          new Decimal(18).mul(player.chm.hDrone.mul(40)),
          new Decimal(1).mul(player.chm.hDrone),
        ];
      },
      unlocked() {
        return hasChallenge("d", 16) || inChallenge("d", 16);
      },
      canAfford() {
        return (
          player.chm.frostDrone.gte(this.cost()[0]) &&
          player.chm.points.gte(this.cost()[1]) &&
          player.chm.tesseract.gte(this.cost()[2])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        let costPerUnit3 = this.cost()[2];

        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.chm.frostDrone.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.points.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }

        if (costPerUnit3.lte(1)) {
          costPerUnit3 = new Decimal(1);
        }
        let max3 = new Decimal(1);

        max3 = player.chm.tesseract.div(costPerUnit3).floor();
        if (max3.lte(1)) {
          max3 = new Decimal(1);
        }

        let max = Decimal.min(max1, max2, max3);
        return [max, costPerUnit1, costPerUnit2, costPerUnit3];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2, costPerUnit3] = this.buyMax();
        player.chm.frostDrone = player.chm.points.sub(costPerUnit1.mul(max));
        player.chm.points = player.chm.points.sub(costPerUnit2.mul(max));
        player.chm.tesseract = player.chm.tesseract.sub(costPerUnit3.mul(max));
        player.d.hDrone = player.d.hDrone.add(max);
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
    24: {
      cost() {
        return [
          new Decimal(7500).mul(player.chm.mechanicalBomb.add(1)),
          new Decimal(200).mul(player.chm.mechanicalBomb.add(1)),
          new Decimal(10).mul(player.chm.mechanicalBomb.add(1)),
        ];
      },
      display() {
        return (
          "Create a bomb! Massive boosts to dimensional points and tetra" +
          " Boracite: " +
          format(this.cost()[0]) +
          " | Mechanical Multiplier Cost: " +
          format(this.cost()[1]) +
          " | Grandeu cost: " +
          format(this.cost()[2]) +
          " | Currently: " +
          format(this.effect()[0]) +
          "x to DP | " +
          format(this.effect()[1]) +
          "x to tetra"
        );
      },
      effect() {
        return [
          new Decimal(1).add(player.chm.hDrone.mul(0.1)),
          new Decimal(1000).mul(player.chm.hDrone.mul(0.1).plus(1)),
        ];
      },
      unlocked() {
        return hasChallenge("d", 16);
      },
      canAfford() {
        return (
          player.b.points.gte(this.cost()[0]) &&
          player.chm.points.gte(this.cost()[1]) &&
          player.ct.grandeu.gte(this.cost()[2])
        );
      },
      buyMax() {
        let costPerUnit1 = this.cost()[0];
        let costPerUnit2 = this.cost()[1];
        let costPerUnit3 = this.cost()[2];

        if (costPerUnit1.lte(1)) {
          costPerUnit1 = new Decimal(1);
        }
        let max1 = new Decimal(1);

        max1 = player.b.points.div(costPerUnit1).floor();
        if (max1.lte(1)) {
          max1 = new Decimal(1);
        }
        if (costPerUnit2.lte(1)) {
          costPerUnit2 = new Decimal(1);
        }
        let max2 = new Decimal(1);

        max2 = player.chm.points.div(costPerUnit2).floor();
        if (max2.lte(1)) {
          max2 = new Decimal(1);
        }

        if (costPerUnit3.lte(1)) {
          costPerUnit3 = new Decimal(1);
        }
        let max3 = new Decimal(1);

        max3 = player.ct.grandeu.div(costPerUnit3).floor();
        if (max3.lte(1)) {
          max3 = new Decimal(1);
        }

        let max = Decimal.min(max1, max2, max3);
        return [max, costPerUnit1, costPerUnit2, costPerUnit3];
      },
      buy() {
        let [max, costPerUnit1, costPerUnit2, costPerUnit3] = this.buyMax();
        player.b.points = player.b.points.sub(costPerUnit1.mul(max));
        player.chm.points = player.chm.points.sub(costPerUnit2.mul(max));
        player.ct.grandeu = player.ct.grandeu.sub(costPerUnit3.mul(max));
        player.chm.mechanicalBomb = player.chm.mechanicalBomb.add(max);
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
    51: {
      cost() {
        return [new Decimal(100000), new Decimal(120000)];
      }, // some sort of error
      display() {
        return (
          "Forge Mjölnir from the power of a neutron star, the cost is high but the weapon is worth it(see bossfights for what it does)." +
          " casting material cost: " +
          format(this.cost()[0]) +
          " | iron cost: " +
          format(this.cost()[1])
        );
      },
      purchaseLimit: 1,

      canAfford() {
        return (
          player.chm.castingMaterial.gte(this.cost()[0]) &&
          player.ac.iron.gte(this.cost()[1])
        );
      },
      buyMax() {
        return true;
      },
      buy() {
        player.chm.castingMaterial = player.chm.castingMaterial.sub(
          this.cost()[0],
        );
        player.ac.iron = player.ac.iron.sub(this.cost()[1]);
        player.BF.mjolnir = player.BF.mjolnir.add(1);
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
    52: {
      cost() {
        return [new Decimal(1e9), new Decimal(777777)];
      }, // some sort of error
      display() {
        return (
          "Forge Stormbreaker from the power of a neutron star, the cost is high but the weapon is worth it(see boss fights for what it does)." +
          " casting material cost: " +
          format(this.cost()[0]) +
          " | lead cost: " +
          format(this.cost()[1])
        );
      },
      purchaseLimit: 1,

      canAfford() {
        return (
          player.chm.castingMaterial.gte(this.cost()[0]) &&
          player.ac.lead.gte(this.cost()[1])
        );
      },
      buyMax() {
        return true;
      },
      buy() {
        player.chm.castingMaterial = player.chm.castingMaterial.sub(
          this.cost()[0],
        );
        player.ac.lead = player.ac.lead.sub(this.cost()[1]);
        player.BF.stormbreaker = player.BF.stormbreaker.add(1);
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
    53: {
      cost() {
        return [new Decimal(1e15), new Decimal(500000)];
      }, // some sort of error
      display() {
        return (
          "Forge the Infinity Cobble from the power of a neutron star, the cost is high but the weapon is worth it(see boss fights for what it does)." +
          " casting material cost: " +
          format(this.cost()[0]) +
          " | gold cost: " +
          format(this.cost()[1])
        );
      },
      purchaseLimit: 1,

      canAfford() {
        return (
          player.chm.castingMaterial.gte(this.cost()[0]) &&
          player.ac.gold.gte(this.cost()[1])
        );
      },
      buyMax() {
        return true;
      },
      buy() {
        player.chm.castingMaterial = player.chm.castingMaterial.sub(
          this.cost()[0],
        );
        player.ac.gold = player.ac.gold.sub(this.cost()[1]);
        player.BF.infinityCobble = player.BF.infinityCobble.add(1);
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
    54: {
      cost() {
        return [new Decimal(1e25), new Decimal(800000), new Decimal(10000)];
      }, // some sort of error
      display() {
        return (
          "Forge the King Crystal from the power of a neutron star, the cost is high but the weapon is worth it(see artifacts for what it does)." +
          " casting material cost: " +
          format(this.cost()[0]) +
          " | carbon cost: " +
          format(this.cost()[1]) +
          " | antimony cost: " +
          format(this.cost()[2])
        );
      },
      purchaseLimit: 1,

      canAfford() {
        return (
          player.chm.castingMaterial.gte(this.cost()[0]) &&
          player.ac.carbon.gte(this.cost()[1]) &&
          player.ac.antimony.gte(this.cost()[2])
        );
      },
      buyMax() {
        return true;
      },
      buy() {
        player.chm.castingMaterial = player.chm.castingMaterial.sub(
          this.cost()[0],
        );
        player.ac.carbon = player.ac.carbon.sub(this.cost()[1]);
        player.ac.antimony = player.ac.antimony.sub(this.cost()[2]);
        player.art.kingCrystal = player.art.kingCrystal.add(1);
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
  },
});
