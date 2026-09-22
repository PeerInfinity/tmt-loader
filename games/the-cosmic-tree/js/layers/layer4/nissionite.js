addLayer("n", {
  infoboxes: {
    lore: {
      title: "Nissionite",
      body() {
        return `Nissionite is another rare Earth mineral, its chemical composition is too complex to fit here. You may be wondering, 
            quarks are the educational side of the tree, what is Nissionite building too? Well, aside from being the natural continuation of Boracite,
            Nissionite represents the coalescing into celestial bodies + electricity. Every so often, a snow storm or blizzard will occur and drop fragments, which can be collected to advance the layer. 
            Nissionite boosts fragment gain
            `;
      },
    },
  },
  name: "Nissionite", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      tissue: new Decimal(0),
      snowStorm: false,
      timer: 3000,
      random: 0,
      fragments: new Decimal(0),
      snowflakeTimer: 0,
      fragMultiplier() {
        let multiplier = player.n.points.add(1);
        if (hasUpgrade("n", 14)) multiplier = multiplier.mul(2);
        if (hasUpgrade("n", 31)) multiplier = multiplier.mul(4);
        if (player.ct.crystalFlake.gte(1))
          multiplier = multiplier.times(player.ct.flakeEffect1());
        if (multiplier.lte(1)) multiplier = new Decimal(1);
        return multiplier;
      },
      layer1CanReset: false,
      savedBoracite: new Decimal(0),
      savedCosmicDust: new Decimal(0),
      timer2: 0,
    };
  },
  color() {
    return "#1097c0";
  },
  requires: new Decimal(100),
  hotkeys: [
    {
      key: "n",
      description: "N: Reset for Nissionite",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  passiveGeneration() {
    if (player.art.godlyTherm.gte(1)) return 1;
  },
  softcap() {
    let sMetal = player.sm.points;

    let equation = new Decimal(1000)
      .plus(sMetal.mul(10))
      .minus(new Decimal(challengeCompletions("sm", 11)).mul(100));

    if (inChallenge("sm", 11)) return equation;
    else return new Decimal("1e100");
  },

  softcapPower() {
    let sMetal = player.sm.points;

    let equation = new Decimal(0.6)
      .plus(sMetal.mul(0.01))
      .minus(new Decimal(challengeCompletions("sm", 11)).mul(0.1));

    if (inChallenge("sm", 11)) return equation;
    else return new Decimal(1);
  },
  resource: "Nissionite", // Name of prestige currency
  baseResource: "Boracite", // Name of resource prestige is based on
  baseAmount() {
    return player.b.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(reset) {
    let keep = ["layer1CanReset"];

    if (layers[reset].row > this.row) {
      layerDataReset("n", keep);
    }
  },
  update() {
    player.n.timer2++;
    if (player.n.timer2 > 100) {
      updateMusicDisplay();
      player.n.timer2 = 0;
    }
    if (player.n.unlocked) {
      if (player.n.timer > 0) {
        player.n.timer -= 1;
      }
      if (player.n.timer <= 0) {
        player.n.timer = Math.floor(Math.random() * 3000);
        if (player.n.timer <= 120) {
          player.n.timer = 120;
        }
        player.n.random = Math.floor(Math.random() * 400);
        if (player.n.random <= 60) {
          player.n.random = 60;
        }
        player.n.snowStorm = true;
      }
      if (player.n.snowStorm) {
        player.n.random -= 1;
        player.n.snowflakeTimer += 0.1;
        if (player.n.random <= 0) {
          player.n.snowStorm = false;
        }
        if (player.n.snowflakeTimer > 0.5) {
          makeShinies(snowflake.shiny(), 1);
          player.n.snowflakeTimer = 0;
        }
      }
    }
    if (player.art.godlyTherm.gte(1)) {
      player[this.layer].fragments = player[this.layer].fragments.add(
        new Decimal(1).mul(player[this.layer].fragMultiplier()),
      );
    }
  },
  style() {
    return {
      "background-image":
        "linear-gradient(180deg,rgb(10, 255, 206) 0%, rgb(19, 103, 168) 50%, rgb(0, 42, 255) 100%)",
      "background-size": "300px 600%",
      height: "2000px",
      animation: "backgroundMove 4s linear infinite",
    };
  },
  nodeStyle() {
    if (player.n.unlocked || tmp.n.canReset) {
      return {
        "background-image":
          "linear-gradient(180deg,rgb(10, 255, 206) 0%, rgb(19, 103, 168) 50%, rgb(0, 42, 255) 100%)",
        "background-size": "150px 600%",
        "background-position": "40% 50%",
        animation: "backgroundMove 5s linear infinite",
        width: "110px",
        height: "110px",
        "font-size": "50px",
      };
    }
    return { width: "120px", height: "120px" };
  },

  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasMilestone("sm", 3)) mult = mult.add(2);
    if (hasMilestone("nm", 3)) mult = mult.add(2);
    if (hasUpgrade("n", 22)) mult = mult.times(2);
    if (getBuyableAmount("d", 17)) mult = mult.times(buyableEffect("d", 17));
    if (hasUpgrade("d", 35)) mult = mult.times(1.5);
    if (hasUpgrade("d", 48)) mult = mult.times(2);
    if (hasMilestone("nm", 2)) mult = mult.times(10);
    if (hasMilestone("sm", 0)) mult = mult.times(10);

    if (player.art.godlyTherm.gte(1)) mult = mult.pow(2);
    return mult;
  },
  gainExp() {
    let mult = new Decimal(1);
    if (hasMilestone("sm", 2)) mult = mult.add(0.1);
    return mult;
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
        color: "black",
      },
      borderStyle: { border: "4px solid black", "border-radius": "0px" },
      display() {
        return (
          "Time remaining until blizzard: " + format(player.n.timer) + " ticks"
        );
      },
      progress() {
        return player.n.timer / 3000;
      },
    },
  },
  row: 3, // Row the layer is in on the tree (0 is the first row)
  branches: ["b", "d"],

  layerShown() {
    return player.b.unlocked;
  },
  challenges: {
    11: {
      name: "Subzero Hyperborea",
      challengeDescription() {
        return (
          "Enact a super-hard softcap on Cosmic Dust, every nissionite you have reduces the harshness of this softcap. Every completion increases the harshness, and requirement. Current Completions: " +
          format(challengeCompletions("n", 11))
        );
      },
      goalDescription() {
        if (challengeCompletions("n", 11) >= 6) return "Get 999 Boracite";
        return (
          "Get " + format(50 + challengeCompletions("n", 11) * 50) + " Boracite"
        );
      },
      rewardDescription:
        "Gain new Boracite milestones, a cosmic dust boost, and new Nissionite-fragment upgrades",
      rewardEffect() {
        let equation = 20 ** (challengeCompletions("n", 11) + 1);
        if (challengeCompletions("n", 11) >= 7) equation = 20 ** 10;
        return new Decimal(equation);
      },
      rewardDisplay() {
        return (
          "Effect: " +
          format(this.rewardEffect()) +
          "x boost Cosmic Dust and Vinyl. New Boracite milestone and Nissionite upgrade each completion."
        );
      },
      completionLimit: 7,
      style: {
        width: "375px",
        height: "375px",
        "font-size": "16px",
        "border-radius": "0px",
      },
      canComplete() {
        let completions = new Decimal(challengeCompletions("n", 11));
        let requirement = new Decimal(50).add(completions.mul(50));
        if (challengeCompletions("n", 11) >= 6) requirement = new Decimal(999);
        return player.b.points.gte(requirement);
      },
      unlocked() {
        return player.n.points.gte(3);
      },
      onEnter() {
        player.n.savedBoracite = player.b.points;
        player.n.savedCosmicDust = player.c.points;

        player.b.points = new Decimal(0);
        player.c.points = new Decimal(0);
      },
      onExit() {
        player.b.points = player.n.savedBoracite;
        player.c.points = player.n.savedCosmicDust;
      },
    },
  },
  upgrades: {
    11: {
      title: "Glacial Springs",
      description:
        "Multiplier and Quarks are no longer reset, by anything. Forevermore.",
      cost: new Decimal(40),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      effect() {
        if (hasUpgrade("n", 11)) {
          player.n.layer1CanReset = true;
        }
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 1.2s linear infinite",
        "border-radius": "100px",
      },
    },
    12: {
      title: "Hypothermia",
      description: "4x Boracite boost, 3x Atoms boost, 5x Cosmic Dust boost",
      cost: new Decimal(100),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 1s linear infinite",
        "border-radius": "100px",
      },
    },
    13: {
      title: "Chilled Iceberg",
      description:
        "2x Tetra gain, 10x Quark gain, 10x Multiplier gain, and unlock Frost Arzendics",
      cost: new Decimal(3000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    14: {
      title: "Frozen Tundra",
      description: "Double Fragment gain, 2x Tetra gain",
      cost: new Decimal(5000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 1;
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    21: {
      title: "Tidal Wave",
      description: "Unlock submarines and Oceanic Resources",
      cost: new Decimal(13000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 2;
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    22: {
      title: "Forlorn Hope",
      description: "Temperatures drop even lower, double Nissionite gain",
      cost: new Decimal(20000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 3;
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    23: {
      title: "Granular Snow",
      description: "Unlock a boss fight(The Adominable Snowman)",
      cost: new Decimal(34567),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 4;
      },
      onPurchase() {
        player.BF.adSnowman = true;
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    24: {
      title: "Grand Achiever",
      description: "Unlock an achievement",
      cost: new Decimal(66666),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 5;
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    31: {
      title: "Trite accomplishment",
      description: "Quadruple Fragment gain",
      cost: new Decimal(150000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 6;
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
    32: {
      title: "Forevermore",
      description: "Unlock the Godly Thermostat(artifact)",
      cost: new Decimal(1e8),
      currencyDisplayName: "Fragments",
      currencyInternalName: "fragments",
      currencyLayer: "n",
      unlocked() {
        return challengeCompletions("n", 11) >= 7;
      },
      onPurchase() {
        player.art.godlyTherm = new Decimal(1);
      },
      style: {
        width: "200px",
        height: "200px",
        "font-size": "12px",
        animation: "backgroundMove 0.8s linear infinite",
        "border-radius": "100px",
      },
    },
  },
  tabFormat: {
    "The Icy Palace": {
      "font-color": "black",
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
            return "You have " + format(player.b.points) + " Boracite.";
          },
        ],
        [
          "display-text",
          function () {
            return "You have " + format(player.n.fragments) + " Fragments.";
          },
        ],
        "blank",
        ["infobox", "lore"],
        ["bar", "bigBar"],
        [
          "display-text",
          function () {
            return (
              "Snowstorm lasting for " +
              (player.n.random > 0 ? format(player.n.random) : "N/A") +
              " ticks."
            );
          },
        ],
        "upgrades",
        "challenges",
      ],
    },
  },
});
