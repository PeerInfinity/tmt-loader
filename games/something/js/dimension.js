addLayer("dimension", {
    name: "dimension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "DIM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#A0FFA0",
    requires: new Decimal("1e60"), // Can be a function that takes requirement increases into account
    resource: "Dimensions", // Name of prestige currency
    baseResource: "Numbers", // Name of resource prestige is based on
    baseAmount() {return player.primitive.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        let base = new Decimal(7.66)
        if (player.dimension.points.gte(5)) base = base.add(4.34)
        return base
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        //add
        //mul
        //exp in gainExp
        //other hypers
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "D", description: "SHIFT+D: Reset for a Dimension", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.dimension.unlocked},
    canBuyMax() {return false},
    resetDescription: "Dimensionize your progress for ",
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return

        // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
        let keptUpgrades = []

        let keptBuyables = []

        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasMilestone("dimension", 6)) keep.push("points", "milestones");

        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
        if (hasAchievement("planetary", 24) && !hasMilestone("dimension", 6)) player.dimension.points = new Decimal(5)

        // Stage 5, add back in the specific subfeatures you saved earlier
    }, //THANK YOU ESCAPEE FROM THE TMT SERVER
    canBuyMax() {return true},
    disabled() {return inChallenge("arithmetic", 13) || inChallenge("pbooster", 11)},
    milestones: {
        1: {
            requirementDescription: "1st Dimension",
            effectDescription: "Improve Fundamental buyable 1 SIGNIFICANTLY.",
            done() { return player.dimension.points.gte(1) },
        },
        2: {
            requirementDescription: "2nd Dimension",
            effectDescription: "Improve \"Primitive Boost\" and \"Recursion.\"",
            done() { return player.dimension.points.gte(2) },
        },
        3: {
            requirementDescription: "3rd Dimension",
            effectDescription: "Keep Addition and Subtraction unlocked on Dimensionize, and improve their formulas.",
            done() { return player.dimension.points.gte(3) },
        },
        4: {
            requirementDescription: "THE 4TH DIMENSION",
            effectDescription: "Let's see here... x5 Division, improve the first Multiplication and Fundamental buyables, x100 Number Cores AND KEEP IT UNLOCKED, x4 Shapes, ^1.01 Numbers and Operation Power after softcaps, improve the Constructor compass, reduce the cost scaling of the fourth Fundamental buyable, and unlock the seventh row of TMT. That was a lot!",
            done() { return player.dimension.points.gte(4) },
            unlocked() { return hasMilestone("division", 3) || player.planetary.unlocked}
        },
        5: {
            requirementDescription: "THE 5TH DIMENSION",
            effectDescription: "QoL time! Passively generate Multiplication if possible, the Addition booster for Points is always active, automatically upgrade the Constructor straightedge and compass, and REMOVE the Fundamentality ultracap and hypercap!",
            done() { return player.dimension.points.gte(5) },
            unlocked() { return hasUpgrade("arithmetic", 35) || player.planetary.unlocked}
        },
        6: {
            requirementDescription: "THE 6TH DIMENSION",
            effectDescription: "x1e10 to the Shape hardcap, Multiplication, and Division! Also, xe1e6 to Numbers, Fundamentality, Addition, and Subtraction. x25 Planetary Fragments, and +1 upgrade in the 12th row. And unlock another Number Core buyable (once again, buyable mania IS a real layer in this mod). <i>This Dimension and all others from here are kept until the next reset layer.</i>",
            done() { return player.dimension.points.gte(6) },
            unlocked() { return player.pbooster.unlocked}
        },
    },
    tooltip() {return format(player.dimension.points) + " Dimensions (" + format(getNextAt("dimension")) + " Numbers for next Dimension)"},
});