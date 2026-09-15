addLayer("achievements", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  color: "#FFFF00",
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() { return {
      unlocked: true,
  points: new Decimal(0),
  }},
  tooltip:"Achievements",
  resource: "achievements", // Name of prestige currency
  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  row: "side", // Row the layer is in on the tree (0 is the first row)
  tabFormat: [
    ["display-text", () => `You have ${player.achievements.achievements.length}/n achievements`],
    "blank",
    "achievements"
  ],
  layerShown(){return true},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = ["achievements"];
        //if (someOtherCondition) keep.push("milestones");

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        //IF AN ACHIEVEMENT HAS A REWARD, ADD IT TO A LIST LIKE "rewardList[INTERNAL LAYER NAME HERE]"
        let rewardListPlanetary = ["24","35","46","53","54"]
        if (resettingLayer == "planetary" && !hasAchievement("achievements", 62)){
          for (var i = 0; i < rewardListPlanetary.length; i++){
            let index = player.achievements.achievements.indexOf(rewardListPlanetary[i])
            if (index > -1) player.achievements.achievements.splice(index, 1)
          }
        }

        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades)
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
achievements: {
  11: {
    name: "The Beginning.",
    done(){return hasUpgrade("unlock", 11)},
    tooltip:"Unlock the Fundamental layer.",
    unlocked() {return true},
  },
  12: {
    name: "Slight Progression",
    done(){return hasUpgrade("fundamental", 17)},
    tooltip:"Get \"Progressing\" in Fundemental layer.",
    unlocked() {return true},
  },
  13: {
    name: "Millionare!",
    done(){return player.points.gte("1e6")},
    tooltip:"Have 1,000,000 points.",
    unlocked() {return true},
  },
  14: {
    name: "Oh no, math!",
    done(){return player.primitive.points.gte(1)},
    tooltip:"Primitive reset for the first time.",
    unlocked() {return true},
  },
  15: {
    name: "Decillionare!",
    done(){return player.points.gte("1e33")},
    tooltip:"Have 1e33 points.",
    unlocked() {return true},
  },
  16: {
    name: "Softcap era...",
    done(){return player.fundamental.points.gte("1e50")},
    tooltip:"Reach the Fundamentality softcap.",
    unlocked() {return true},
  },
  17: {
    name: "Googol!",
    done(){return player.points.gte("1e100")},
    tooltip:"Have 1e100 Points.",
    unlocked() {return true},
  },
  21: {
    name: "JST Enjoyer",
    done(){return player.primitive.points.gte("1e30")},
    tooltip:"Have 1e30 Numbers.",
    unlocked() {return true},
  },
  22: {
    name: "I HATE MATH!",
    done(){return player.arithmetic.points.gte(1)},
    tooltip:"Arithmetic reset for the first time.",
    unlocked() {return true},
  },
  23: {
    name: "Googol again?",
    done(){return player.fundamental.points.gte("1e100")},
    tooltip:"Have 1e100 Fundamentality.",
    unlocked() {return true},
  },
  24: {
    name: "Manual Labor is Over",
    done(){return player.points.gte("1e180")},
    tooltip:"Have 1e180 Points. Reward: Keep the first 20 Fundamental upgrades and the first 10 Primitive upgrades on Arithmetic reset.",
    unlocked() {return true},
  },
  25: {
    name: "Timewall Upgrades Incoming",
    done(){return hasUpgrade("subtraction", 11)},
    tooltip:"Buy the first Subtraction upgrade.",
    unlocked() {return true},
  },
  26: {
    name: "DO NOT BE AFRAID",
    done(){return hasUpgrade("arithmetic", 17)},
    tooltip:"Unlock Arithmetic Challenges.",
    unlocked() {return true},
  },
  27: {
    name: "Infinity?",
    done(){return player.points.gte("1.79e308")},
    tooltip:"Have 1.79e308 Points. You're past normal JavaScript numbers!",
    unlocked() {return true},
  },
  31: {
    name: "ANTIMATTER DIMENSIONS??? No.",
    done(){return player.dimension.points.gte(1)},
    tooltip:"Dimensionize for the first time.",
    unlocked() {return true},
  },
  32: {
    name: "Fundamentally Squared Googol",
    done(){return player.fundamental.points.gte("1e200")},
    tooltip:"Have 1e200 Fundamentality.",
    unlocked() {return true},
  },
  33: {
    name: "Advanced Addition",
    done(){return player.multiplication.unlocked},
    tooltip:"Unlock Multiplication.",
    unlocked() {return true},
  },
  34: {
    name: "Polyhedra",
    done(){return player.dimension.points.gte("3")},
    tooltip:"Have 3 Dimensions. You are now on the same level as reality.",
    unlocked() {return true},
  },
  35: {
    name: "Scientific Notation Recursion Level 1",
    done(){return player.points.gte("1e1000")},
    tooltip:"Have 1e1000 Points. Reward: Keep the 21st Fundamental upgrade, the 11th Primitive upgrade on Arithmetic reset, and Fundamental buyable 3 as well for the fun of it.",
    unlocked() {return true},
  },
  36: {
    name: "Quadruple Stack",
    done(){return hasUpgrade("fundamental", 41)},
    tooltip:"Buy the 22nd Fundamental upgrade. You now have access to FOUR UPGRADE ROWS.",
    unlocked() {return true},
  },
  37: {
    name: "UNPARALLELED",
    done(){return hasChallenge("arithmetic", 13)},
    tooltip:"Complete the third Arithmetic Challenge. You won't have to deal with those for quite a while after this.",
    unlocked() {return true},
  },
  41: {
    name: "Closed Polygonal-Chain of Line Segments...",
    done(){return player.polygon.points.gte(1)},
    tooltip:"Polygonify for the first time.",
    unlocked() {return true},
  },
  42: {
    name: "The Four Operations",
    done(){return player.polygon.resets.gte(5)},
    tooltip:"Unlock Division. You now have all four basic operations on your side.",
    unlocked() {return true},
  },
  43: {
    name: "this game needs some softcaps",
    done(){return player.points.gte("1e5000")},
    tooltip:"Have 1e5000 Points.",
    unlocked() {return true},
  },
  44: {
    name: "Faster Quotient Calculation",
    done(){return player.division.points.gte("1000")},
    tooltip:"Have 1000 Division. You've embraced integer division, <i>but what about polynomial division?</i>",
    unlocked() {return true},
  },
  45: {
    name: "Achievement Distancing",
    done(){return player.numbercore.unlocked},
    tooltip:"I started making these achievements more spread out. Anyway, unlock the Number Core layer.",
    unlocked() {return true},
  },
  46: {
    name: "Timewalled",
    done(){return hasChallenge("arithmetic", 21)},
    tooltip:"Complete the 4th Arithmetic Challenge. Reward: +1 upgrade in the 4th row of TMT.",
    unlocked() {return true},
  },
  47: {
    name: "Compass & Straightedge",
    done(){return hasMilestone("division", 3)},
    tooltip:"Unlock the Constructor.",
    unlocked() {return true},
  },
  51: {
    name: "BEYOND REALITY.",
    done(){return player.dimension.points.gte(4)},
    tooltip:"HAVE FOUR DIMENSIONS. YOU HAVE BROKEN ALL MODELS OF REALITY.",
    unlocked() {return true},
  },
  52: {
    name: "Number Cores Prestige Layer",
    done(){return player.corebooster.points.gte(1)},
    tooltip:"Have a Core Booster.",
    unlocked() {return true},
  },
  53: {
    name: "I FEAR NO DIVISION",
    done(){return getClickableState("division", 11) && player.points.gte("1e965")},
    tooltip:"Have 1e965 Points in Long Division. Reward: nerf Core Booster scaling, add a third Core Booster effect, and improve the other two. (Dev note: I forgot, but ^1.2 Number Cores)",
    unlocked() {return true},
  },
  54: {
    name: "The Googol Core",
    done(){return player.numbercore.points.gte("1e100")},
    tooltip:"Have 1e100 Number Cores. Reward: weaken the Operation Power softcap.",
    unlocked() {return true},
  },
  55: {
    name: "Sacrificed Polygons",
    done(){return hasUpgrade("arithmetic", 35)},
    tooltip:"Unlock the Constructor Sacrifice.",
    unlocked() {return true},
  },
  56: {
    name: "Scientific Notation Recursion Level 2",
    done(){return player.points.gte("e1e6")},
    tooltip:"Have e1,000,000 Points.",
    unlocked() {return true},
  },
  57: {
    name: "The Next Layer is Near",
    done(){return maxedChallenge("polygon", 11)},
    tooltip:"Fully sacrifice your Constructor.",
    unlocked() {return true},
  },
  61: {
    name: "Astronomical Achievement",
    done(){return player.planetary.points.gte(1)},
    tooltip:"Planetary reset for the first time.",
    unlocked() {return true},
  },
  62: {
    name: "Restriction Adaptation X",
    done(){return hasAchievement("planetary", 11) && 
      hasAchievement("planetary", 12) && 
      hasAchievement("planetary", 13) && 
      hasAchievement("planetary", 14) && 
      hasAchievement("planetary", 21) && 
      hasAchievement("planetary", 22) && 
      hasAchievement("planetary", 23) && 
      hasAchievement("planetary", 24) 
    },
    tooltip:"Have 8 Planetary Challenges completed. Reward: keep achievement 11, 19, 27, 31, and 32.",
    unlocked() {return true},
  },
  63: {
    name: "This is Big Number time.",
    done(){return hasUpgrade("polygon", 21)},
    tooltip:"Have the 8th Polygon upgrade. It's tetration time.",
    unlocked() {return true},
  },
  64: {
    name: "HELL YEAH",
    done(){return player.polygon.points.gte("1e1000")},
    tooltip:"Have 1e1000 Shapes.",
    unlocked() {return true},
  },
  65: {
    name: "Point Overload",
    done(){return player.points.gte("e2e8")},
    tooltip:"Have e200,000,000 Points.",
    unlocked() {return true},
  },
  66: {
    name: "bro thank god for this insane qol",
    done(){return hasUpgrade("corebooster", 13)},
    tooltip:"Passively generate Shapes No more clicking that button!",
    unlocked() {return true},
  },
  67: {
    name: "Scientific Notation Recursion Level 3",
    done(){return player.points.gte("e1e10")},
    tooltip:"Have e1e10 Points. 10^10^10!",
    unlocked() {return true},
  },
},
})