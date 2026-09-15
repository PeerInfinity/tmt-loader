addLayer("tt", {
    upgrades: {
        11: {
            title: "Time is Relative!",
            description: "Begin producing seconds.",
            cost: new Decimal(1),
        },
        12: {
            title: "Random Upgrades",
            description: "Square the effect of time machine effect.",
            cost: new Decimal(2),
        },
        13: {
            title: "Time Attracting",
            description: "Increase the effect, again depending on (sqrt(Time Machines+1)).",
            cost: new Decimal(2),
        },
    },
    milestones: {
        1: {
            requirementDescription: "2 Time Machines",
            effectDescription: "Unlock Universe Challenges.",
            done() { return player.tt.points.gte(2) },
            unlocked() { return player.t.points.gte(60) }
        },
        2: {
            requirementDescription: "3 Time Machines",
            effectDescription: "You can buy max Singularities.",
            done() { return player.tt.points.gte(3) },
            unlocked() { return (hasMilestone('tt', 1)) }
        },
        3: {
            requirementDescription: "5 Time Machines",
            effectDescription: "Unlock new Weight Upgrades, yet again.",
            done() { return player.tt.points.gte(5) },
            unlocked() { return (hasMilestone('tt', 2)) }
        },
        4: {
            requirementDescription: "8 Time Machines",
            effectDescription: "Unlock new Overweight Upgrades, yet again.",
            done() { return player.tt.points.gte(8) },
            unlocked() { return (hasMilestone('tt', 3)) }
        },
        5: {
            requirementDescription: "10 Time Machines",
            effectDescription: "Unlock Epileptic Layer. (Row 3)",
            done() { return player.tt.points.gte(10) },
            unlocked() { return (hasMilestone('tt', 4)) }
        },
    },
    name: "Time Travel", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TT", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    canBuyMax() {return hasMilestone("u", 7)},
    color: "#DDDDDD",
    requires: new Decimal("e16384"), // Can be a function that takes requirement increases into account
    resource: "time machines", // Name of prestige currency
    baseResource: "weights", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 14, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "/", description: "/: Reset to time travel", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge("c", 41) || hasUpgrade("tt", 11) || player.tt.points.gte(1)}
})