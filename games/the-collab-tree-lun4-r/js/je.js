addLayer("je", {
  startData() {
    return {
      unlocked: true,
      points: Decimal.dZero,
    };
  },
  color: "purple", // The color for this layer, which affects many elements.
  row: 1, // The row this layer is on (0 is the first row).
  symbol: "JE", // The row this layer is on (0 is the first row).
  position: 10,
  layerShown() {
    return true;
  }, // Returns a bool for if this layer's node should be visible in the tree.
  requires: new Decimal(3e9), // Can be a function that takes requirement increases into account
  resource: "Jacorbian Energy", // Name of prestige currency
  baseResource: "tuberculosis", // Name of resource prestige is based on
  baseAmount() {
    return player.tb.points;
  }, // Get the current amount of baseResource
  effectDescription() {
    return `boosting sickness gain by x${format(tmp.je.effect)}.`;
  },
  effect() {
    let effect = new Decimal(1);
    effect = player.je.points.pow(0.8).add(1);
    return effect;
  },
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  branches: ["cv", "tb"],
  exponent: 0.25, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("ba", 11) && player.e.points.gte(1)) mult = mult.mul(2);
    if (hasUpgrade("ba", 11) && player.e.points.gte(4))
      mult = mult.mul(tmp.ba.upgrades[11].effect1);
    if (hasMilestone("tdr", 5)) mult = mult.mul(20);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  update(delta) {
    if (player.jacorbscene.eq(20)) {
      player.jacorbcutscene = new Decimal(0);
    }
  },
  hotkeys: [
    {
      key: "j",
      description: "J: Gain Jacorbian Energy",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  clickables: {
    11: {
      title() {
        return "<img src='resources/forwardarrow.png'style='width:calc(80%);height:calc(80%);margin:10%'></img>";
      },
      canClick() {
        return player.jacorbcutscene.eq(1);
      },
      unlocked() {
        return player.jacorbscene.lt(20);
      },
      onClick() {
        player.jacorbscene = player.jacorbscene.add(1);
      },
    },
    12: {
      title() {
        return "<img src='resources/backarrow.png'style='width:calc(80%);height:calc(80%);margin:10%'></img>";
      },
      canClick() {
        return player.jacorbcutscene.eq(1);
      },
      unlocked() {
        return player.jacorbscene.lt(20) && player.jacorbscene.neq(0);
      },
      onClick() {
        player.jacorbscene = player.jacorbscene.sub(1);
      },
    },
  },
  buyables: {
    11: {
      title: "More sophisticated dice",
      cost(x = getBuyableAmount(this.layer, this.id)) {
        return new Decimal(100).pow(x.pow(1.2));
      },
      display() {
        return (
          "Add 1 side to all dice.<br>Cost: " +
          format(this.cost()) +
          " jacorbian energy<br>Currently: +" +
          formatWhole(getBuyableAmount(this.layer, this.id))
        );
      },
      canAfford() {
        return player.je.points.gte(this.cost());
      },
      effect() {
        return getBuyableAmount(this.layer, this.id);
      },
      buy() {
        player.je.points = player.je.points.sub(this.cost());
        setBuyableAmount(
          this.layer,
          this.id,
          getBuyableAmount(this.layer, this.id).add(1),
        );
      },
      unlocked() {
        return hasUpgrade("je", 12);
      },
    },
  },
  upgrades: {
    11: {
      title: "Jacorb Upgrade I",
      unlocked() {
        return player.jacorbcutscene.eq(0);
      },
      description: "Boosts coronavirus gain based on jacorbian energy.",
      cost: new Decimal(10),
      currencyLocation() {
        return player.je;
      },
      effect() {
        return player[this.layer].points.add(1).pow(0.55);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
      currencyDisplayName: "Jacorbian Energy",
      currencyInternalName: "points",
    },
    12: {
      title: "Jacorb Upgrade II",
      unlocked() {
        return hasUpgrade("je", 11);
      },
      description: "Unlocks a buyable.",
      cost: new Decimal(250),
      currencyLocation() {
        return player.je;
      }, // Add formatting to the effect
      currencyDisplayName: "Jacorbian Energy",
      currencyInternalName: "points",
    },
    13: {
      title: "Jacorb Upgrade III",
      unlocked() {
        return hasUpgrade("je", 12);
      },
      description: "Speeds up dice reroll cooldown based on dice.",
      cost: new Decimal(1234),
      currencyLocation() {
        return player.je;
      },
      effect() {
        return player.tdr.points.add(1).pow(0.65);
      },
      effectDisplay() {
        return format(upgradeEffect(this.layer, this.id)) + "x";
      }, // Add formatting to the effect
      currencyDisplayName: "Jacorbian Energy",
      currencyInternalName: "points",
    },
  },
  tabFormat: [
    "main-display",
    "prestige-button",
    ["blank", "25px"],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(1)
          ? "<h1>Hi. My name is Jacorb. I'm the creator of The Prestige Tree."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(2)
          ? "<h1>I'm giving you access to my energy. Make sure to use it well."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(3)
          ? "<h1>The modding tree sure is interesting. It is very great."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(4)
          ? "<h1>A whole community was built around making these mods."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(5)
          ? "<h1>A lot of people were able to make their dream games."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(6)
          ? "<h1>However, I am in exile and need to be freed."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(7)
          ? "<h1>Thankfully, I have someone doing that for me now."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(8)
          ? "<h1>But your objective is to get through this tree."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(9)
          ? "<h1>The final layer will contain an object of great power."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(10)
          ? "<h1>Legends call it THE MODDING STONE."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(11)
          ? "<h1>This stone wields power of many mods."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(12)
          ? "<h1>It also has the power to contain mods."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(13)
          ? "<h1>That is why I need you to find it."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(14)
          ? "<h1>So that once the prestige tree is rebuilt,"
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(15) ? "<h1>It cannot be destroyed." : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(16) ? "<h1>I'm just here to help." : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(17)
          ? "<h1>Gotta pay you back for the help you're giving me."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(18)
          ? "<h1>Everyone here has been working hard on their layers."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    [
      "raw-html",
      function () {
        return player.jacorbscene.eq(19)
          ? "<h1>There will be a lot more to come..."
          : "";
      },
      { color: "purple", "font-size": "12px" },
    ],
    ["blank", "25px"],
    [
      "row",
      [
        ["clickable", 12],
        ["clickable", 11],
      ],
    ],
    [
      "row",
      [
        ["upgrade", 11],
        ["upgrade", 12],
        ["upgrade", 13],
      ],
    ],
    ["blank", "25px"],
    ["row", [["buyable", 11]]],
    [
      "raw-html",
      function () {
        return !inChallenge("e", 11)
          ? "<audio controls autoplay loop hidden><source src=music/jacorbtab.mp3 type<=audio/mp3>loop=true hidden=true autostart=true</audio>"
          : "";
      },
    ],
  ],
  layerShown() {
    return hasUpgrade("tb", 16) || player.je.points.gt(0);
  },
});
