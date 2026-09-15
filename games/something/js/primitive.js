addLayer("primitive", {
    name: "primitive", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PRM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        softcapExponent: new Decimal(0),
    }},
    color: "#00C8FF",
    requires: new Decimal("1e12"), // Can be a function that takes requirement increases into account
    resource: "Numbers", // Name of prestige currency
    baseResource: "Fundamentality", // Name of resource prestige is based on
    baseAmount() {return player.fundamental.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.33, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        if (hasMilestone("primitive", 4)) mult = mult.add(5)
        if (getClickableState("addition", 12) != "Inactive" && !inChallenge("arithmetic", 12)) mult = mult.add(clickableEffect("addition", 12))
        //mul
        if (hasUpgrade("primitive", 14)) mult = mult.mul(5)
        if (hasUpgrade("fundamental", 27)) mult = mult.mul(2)
        if (hasUpgrade("fundamental", 31)) mult = mult.mul(5)
        if (hasUpgrade("primitive", 16)) mult = mult.mul(upgradeEffect("primitive", 16))
        if (hasUpgrade("fundamental", 32)) mult = mult.mul(25)
        if (hasUpgrade("fundamental", 35)) mult = mult.mul(20)
        if (hasUpgrade("arithmetic", 11)) mult = mult.mul(100)
        if (hasUpgrade("primitive", 23)) mult = mult.mul(5)
        if (hasUpgrade("fundamental", 42)) mult = mult.mul("1e5")
        if (hasUpgrade("arithmetic", 23)) mult = mult.mul("1e5")
        if (hasUpgrade("multiplication", 43)) mult = mult.mul(25)
        if (getClickableState("division", 11) == "Active" && hasUpgrade("multiplication", 43)) mult = mult.mul(25)
        if (hasUpgrade("multiplication", 122)) mult = mult.mul(upgradeEffect("arithmetic", 21))
        if (hasMilestone("dimension", 6)) mult = mult.mul("e1e6")
        //exp 
        if (inChallenge("arithmetic", 11)) mult = mult.pow(0.8)
        if (hasUpgrade("fundamental", 41)) mult = mult.pow(upgradeEffect("fundamental", 41))
        if (inChallenge("arithmetic", 13)) mult = mult.pow(0.75)
        if (hasChallenge("arithmetic", 13)) mult = mult.pow(1.05)
        if (inChallenge("polygon", 12)) mult = mult.pow(0.001)
        if (inChallenge("arithmetic", 23)) mult = mult.pow(0.005)

        if (inChallenge("pbooster", 12)) mult = mult.log(10)
        //other hypers

        //final
        if (getClickableState("division", 11) == "Active") mult = mult.pow(0.5)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1) //DO NOT USE
        return exp
    },
    softcap() {return new Decimal("1e50")},
    directMult() {
        let dMult = new Decimal(1)
        if (hasUpgrade("subtraction", 13)) dMult = dMult.mul(100)
        if (hasUpgrade("multiplication", 42)) dMult = dMult.mul("1e10")
        if (hasUpgrade("arithmetic", 34)) dMult = dMult.mul(upgradeEffect("arithmetic", 34))
        dMult = dMult.mul(buyableEffect("fundamental", 22))

        if (hasUpgrade("multiplication", 32)) dMult = dMult.pow(1.05)
        if (hasUpgrade("primitive", 27)) dMult = dMult.pow(1.5)
        if (player.dimension.points.gte(4)) dMult = dMult.pow(1.01)
        dMult = dMult.mul(buyableEffect("numbercore", 12))
        if (player.polygon.hexagons.gte(1)) dMult = dMult.pow(player.polygon.hexEffect)
        if (hasUpgrade("division", 16)) dMult = dMult.pow(1.01)

	    if (inChallenge("pbooster", 21)) dMult = dMult.div(player.planetary.planetPowerEffect.pow(0.75))
            
        return dMult
    },
    softcapPower() {
        let power = new Decimal(0.5)
        if (hasUpgrade("subtraction", 12)) power = power.add(0.05)
        if (player.primitive.points.gte("1e1000")) power = power.div(1.45)
        if (player.primitive.points.gte("1e1700")) power = power.div(1.2)
        if (player.primitive.points.gte("1e50000")) power = power.div(1.1)

        if (maxedChallenge("polygon", 11)) power = new Decimal(0.35)
        player.primitive.softcapExponent = power
        return power
    },
    effectDescription() {
        let text = ""
        if (player.primitive.points.gte("1e50000")) text = text + "ultracapped by ^" + player.primitive.softcapExponent.toFixed(6) + " to its gain."
        else if (player.primitive.points.gte("1e1700")) text = text + "hypercapped by ^" + player.primitive.softcapExponent.toFixed(6) + " to its gain."
        else if (player.primitive.points.gte("1e1000")) text = text + "supercapped by ^" + player.primitive.softcapExponent.toFixed(6) + " to its gain."
        else if (player.primitive.points.gte("1e50")) text = text + "softcapped by ^" + player.primitive.softcapExponent.toFixed(6) + " to its gain."
        return text
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "P", description: "SHIFT+P: Reset for Numbers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.primitive.unlocked},
    layerDataReset() { if (hasMilestone("primitive", 2)) return ["23"]},
    passiveGeneration() {if (hasUpgrade("arithmetic", 12)) return 1},
    deactivated() {return inChallenge("arithmetic", 21)},
    resetsNothing(){return hasUpgrade("arithmetic", 12)},
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []
        if (hasAchievement("achievements", 24)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17, 21, 22, 23)
        if (hasAchievement("achievements", 35)) keptUpgrades.push(24)
        if (hasMilestone("polygon", 3)) keptUpgrades.push(25)
        if (hasMilestone("polygon", 9)) keptUpgrades.push(26, 27)

        if (hasUpgrade("primitive", 31)) keptUpgrades.push(31)
        if (hasUpgrade("primitive", 32)) keptUpgrades.push(32)
        if (hasUpgrade("primitive", 33)) keptUpgrades.push(33)
        if (hasUpgrade("primitive", 34)) keptUpgrades.push(34)
        if (hasUpgrade("primitive", 35)) keptUpgrades.push(35)
        if (hasUpgrade("primitive", 36)) keptUpgrades.push(36)
        if (hasUpgrade("primitive", 37)) keptUpgrades.push(37)
        if (layers[resettingLayer].name == "planetary") keptUpgrades = []
        if (hasMilestone("planetary", 4)) keptUpgrades.push(11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 31, 32, 33, 34, 35, 36, 37)

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasMilestone("polygon", 1)) keep.push("milestones");
        if (layers[resettingLayer].name == "planetary") keep = []

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);

        // Stage 5, add back in the specific subfeatures you saved earlier
        player[this.layer].upgrades.push(...keptUpgrades)
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    upgrades: {
        11: {
            title: "Primitivity",
            description: "x10 Fundamentality and +5 Points.",
            cost: new Decimal(1),
        },
        12: {
            title: "Extension",
            description: "Add more Fundamental upgrades.",
            cost: new Decimal(40),
        },
        13: {
            title: "Repetition",
            description: "Unlock the first Fundamental buyable.",
            cost: new Decimal("1e6"),
        },
        14: {
            title: "Primitive Boost",
            description: "x5 Numbers, and Numbers boosts Points.",
            cost: new Decimal("250e6"),
            effect() {
                let effect = player.primitive.points
                if (hasMilestone("dimension", 2) && !inChallenge("arithmetic", 13) && !getClickableState("division", 11)) effect = new Decimal(effect.add(1).logarithm(7)).add(1).pow(3)
                else if (hasMilestone("primitive", 5)) effect = new Decimal(effect.add(1).logarithm(6)).add(1).pow(3)
                else effect = new Decimal(effect.add(1).logarithm(10)).add(1).pow(2)

                if (hasMilestone("addition", 1)) effect = effect.pow(5)
                if (hasUpgrade("multiplication", 52)) effect = effect.pow(upgradeEffect("multiplication", 52))

                if (effect.gte("1e1000")) effect = effect.log(1.0001).pow(10).mul("1e1000")
                if (hasMilestone("addition", 7)) effect = effect.pow(getBuyableAmount("polygon", 11).add(1))
                return effect
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
        },
        15: {
            title: "Preservation",
            description: "Keep the first 14 Fundamental upgrades on Primitive reset.",
            cost: new Decimal("1e14"),
            unlocked() {return hasUpgrade("primitive", 14) || player.arithmetic.unlocked},
        },
        16: {
            title: "Recursion",
            description: "Numbers boosts itself.",
            cost: new Decimal("1e20"),
            effect() {
                let base = player.primitive.points
                if (hasMilestone("dimension", 2) && !inChallenge("arithmetic", 13) && !getClickableState("division", 11)) base = base.pow(0.2).add(1)
                else base = base.pow(0.1).add(1)
                base = base.pow(buyableEffect("numbercore", 12))

                if (base.gte("1e400")) base = base.log(1.01).mul("1e400")
                return base
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            unlocked() {return hasUpgrade("primitive", 14) || player.arithmetic.unlocked},
        },
        17: {
            title: "Slowing down?",
            description: "Numbers boost Fundamentality after softcap.",
            cost: new Decimal("5e22"),
            effect() {
                let exp = new Decimal(0.2)
                if (hasMilestone("primitive", 5)) exp = exp.add(0.2)

                exp = new Decimal(player.primitive.points.pow(exp)).add(1)
                if (exp.gte("1e650")) exp = exp.log(1.01).mul("1e650")
                if (hasUpgrade("multiplication", 121)) exp = exp.tetrate(1.003)
                return exp
            },
            effectDisplay() { return "x" + format(upgradeEffect(this.layer, this.id)) },
            unlocked() {return hasUpgrade("primitive", 14) || player.arithmetic.unlocked},
        },
        21: {
            title: "Quality of Life Incoming!",
            description: "Keep Fundamental buyable 1, and reduce its scaling to x600.",
            cost: new Decimal("5e25"),
            unlocked() {return hasUpgrade("primitive", 14) || player.arithmetic.unlocked},
        },
        22: {
            title: "Repetition+",
            description: "Unlock the second Fundamental buyable.",
            cost: new Decimal("1e27"),
            unlocked() {return hasUpgrade("primitive", 14) || player.arithmetic.unlocked},
        },
        23: {
            title: "It's Been a While",
            description: "Simple! x1e10 Points and x5 Numbers.",
            cost: new Decimal("1e55"),
            unlocked() {return hasMilestone("primitive", 6) || player.polygon.unlocked},
        },
        24: {
            title: "Minuscule Boost",
            description: "+2 to Fundamentality softcap logarithm base.",
            cost: new Decimal("1e58"),
            unlocked() {return hasMilestone("primitive", 6) || player.polygon.unlocked},
        },
        25: {
            title: "Ran Out of Name Ideas",
            effect() {
                let effect = new Decimal(player.primitive.points.pow(0.07)).add(1)
                if (effect.gte("1e100")) effect = effect.log(1.05).mul("1e100")
                return effect
            },
            effectDisplay() {return "+" + format(upgradeEffect(this.layer, this.id))},
            description: "Numbers boost Addition base.",
            cost: new Decimal("1e111"),
            unlocked() {return hasMilestone("primitive", 6) || player.polygon.unlocked},
        },
        26: {
            title: "The Largest Cost Gap?",
            description: "x1e10 Addition and x100 Operation Power.",
            cost: new Decimal("1e615"),
            unlocked() {return hasUpgrade("multiplication", 42) || hasMilestone("polygon", 9) || player.planetary.unlocked},
        },
        27: {
            title: "SUPERCAP OF DOOM",
            description: "^1.5 Numbers after softcap.",
            cost: new Decimal("1e1000"),
            unlocked() {return hasUpgrade("multiplication", 42) || hasMilestone("polygon", 9) || player.planetary.unlocked},
        },
        31: {
            title: "The Third Row",
            description: "Remove the third Multiplication hardcap. All upgrades in this row are kept. Also, x1e200 Number Cores.",
            cost: new Decimal("1e65200"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        32: {
            title: "Quotient Memorization",
            description: "x30 Division, and x1e500 Addition in Long Division!",
            cost: new Decimal("1e67800"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        33: {
            title: "SACRIFICE!",
            description: "x1e50 Operation Power after softcaps and nerfs while sacrificing.",
            cost: new Decimal("1e73000"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        34: {
            title: "King Sammelot",
            description: "FIVE FIVE! Multiply Core Boosters and Division by 5.",
            cost: new Decimal("1e74000"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        35: {
            title: "I NEED TO MULTIPLY",
            description: "Remove the 4th Multiplication hardcap.",
            cost: new Decimal("1e129750"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        36: {
            title: "Repetition++",
            description: "Unlock another Fundamentality buyable, and improve \"Unhardcapped\".",
            cost: new Decimal("1e135575"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        37: {
            title: "THE FINAL",
            description: "-0.5 to the Core Booster Scaling Exponent.",
            cost: new Decimal("1e179290"),
            unlocked() {return hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
    },
    milestones: {
        1: {
            requirementDescription: "1: 10 Numbers",
            effectDescription: "x50 Points.",
            done() { return player.primitive.points.gte(10) },
        },

        2: {
            requirementDescription: "2: 100,000 Numbers",
            effectDescription: "Keep  \"Generation\" on Primitive reset and x100 Fundamentality.",
            done() { return player.primitive.points.gte("1e5") },
        },

        3: {
            requirementDescription: "3: 1e11 Numbers",
            effectDescription: "x25 Fundamentality and unlock Document 3.",
            done() { return player.primitive.points.gte("1e11") },
        },

        4: {
            requirementDescription: "4: 1e24 Numbers",
            effectDescription: "x100 Points, Fundamentality, and +5 Numbers.",
            done() { return player.primitive.points.gte("1e24") },
        },

        5: {
            requirementDescription: "5: 1e30 Numbers",
            effectDescription: "Improve \"Slowing down?\" and \"Primitive Boost.\" x10 Numbers.",
            done() { return player.primitive.points.gte("1e30") },
        },

        6: {
            requirementDescription: "6: 1e48 Numbers",
            effectDescription: "Unlock more Fundamental and Primitive upgrades.",
            done() { return player.primitive.points.gte("1e48") },
            unlocked() {return player.arithmetic.unlocked},
        },

        7: {
            requirementDescription: "7: 1e60 Numbers",
            effectDescription: "Improve Addition boosters to Fundamentality and Numbers. Unlock a third booster that boosts Points (it is not affected by this milestone).",
            done() { return player.primitive.points.gte("1e60") },
            unlocked() {return player.arithmetic.unlocked},
        },
        8: {
            requirementDescription: "8: 1e93 Numbers",
            effectDescription() {
                let text = "A trigintillion! For every Fundamental buyable 3, +"
                let base = new Decimal(0.1)
                if (hasUpgrade("multiplication", 11)) base = base.add(0.4)

                text = text + format(base) + " to Fundamental buyable 1's base. Currently: +" + format(getBuyableAmount("fundamental", 13).mul(base))
                return text
            },
            done() { return player.primitive.points.gte("1e93") },
            unlocked() {return player.arithmetic.unlocked},
        },
        9: {
            requirementDescription: "9: 1e1700 Numbers",
            effectDescription: "<i>how did you get here how did you get here-</i> (Improve \"This isn't even Polygon-Related.\")",
            done() { return player.primitive.points.gte("1e1700") },
            unlocked() {return player.primitive.points.gte("1e1700") || hasMilestone("primitive", 11) || player.planetary.unlocked},
        },
        10: {
            requirementDescription: "10: 1e1865 Numbers",
            effectDescription: "The tenth Primitive milestone! You can passively generate Division whilst in Long Division. And keep the 25th Fundamental upgrade.",
            done() { return player.primitive.points.gte("1e1865") },
            unlocked() {return player.primitive.points.gte("1e1865") || hasMilestone("primitive", 11) || player.planetary.unlocked},
        },
        11: {
            requirementDescription: "11: 1e3003 Numbers",
            effectDescription: "Not just a trigintillion, a millinillion! Here is the boosts list. x15 Division, unlock the 8th row of TMT, and add a fourth Core Booster effect.",
            done() { return player.primitive.points.gte("1e3003") },
            unlocked() {return player.primitive.points.gte("1e3003") || hasMilestone("primitive", 11) || player.planetary.unlocked},
        },
        12: {
            requirementDescription: "12: 1e8000 Numbers",
            effectDescription: "x1e350 Points and x1.1 Multiplication!",
            done() { return player.primitive.points.gte("1e8000") },
            unlocked() {return player.primitive.points.gte("1e8000") || hasMilestone("primitive", 12) || player.planetary.unlocked},
        },
        13: {
            requirementDescription: "13: 1e65,000 Numbers",
            effectDescription: "The Fundamental softcaps are fixed at ^0.25 and unlock more Primitive upgrades.",
            done() { return player.primitive.points.gte("1e65000") },
            unlocked() {return player.primitive.points.gte("1e65000") || hasMilestone("primitive", 13) || player.planetary.unlocked},
        },
        14: {
            requirementDescription: "14: 1e673,330 Numbers",
            effectDescription: "^1.05 Multiplication, ^1.35 Fundamentality and Operation Power after softcap. x1,000,000 Division.",
            done() { return player.primitive.points.gte("1e673330") },
            unlocked() {return player.primitive.points.gte("1e673330") || hasMilestone("primitive", 14) || player.planetary.unlocked},
        },
    },
    branches: [["arithmetic", "#FFFFFF", 10], ["dimension", "#C0FFC0", 5], ["division", "#FF50FF", 5], ["numbercore", "#00e0c0", 5]],
    tooltip() {return format(player.primitive.points) + " Numbers (+" + format(getResetGain("primitive")) + " Numbers on reset)"},
})

