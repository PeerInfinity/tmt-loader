addLayer("m", {
    name: "miners", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#808080",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "miners", // Name of prestige currency
    baseResource: "ore", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('m', 13)) mult = mult.times(upgradeEffect('m', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for miners", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("e", 1) && resettingLayer=="e") keep.push("upgrades")
    },
    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            title: "Cave Miners",
            description: "Double your ore gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Silver Pickaxes",
            description: "Scales effect based on miners.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked(){return hasUpgrade('m', 11)}
        },
        13: {
            title: "Fierce Miners",
            description: "Ore boosts miner gain.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            unlocked(){return hasUpgrade('m', 12)}

        },
        21: {
            title: "Deep Cave Miners",
            description: "Multiplies ore gain by 20.",
            cost: new Decimal(20),
            unlocked(){return hasUpgrade('m', 11)}
        },
        22: {
            title: "Golden Pickaxes",
            description: "Scales effect based on miners, but less than Silver Pickaxes.",
            cost: new Decimal(120),
            effect() {
                return player[this.layer].points.add(1).pow(0.4)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked(){return hasUpgrade('m', 21)}
        },
        23: {
            title: "Miners with... axes?!",
            description: "Ore boosts miner gain more.",
            cost: new Decimal(400),
            effect() {
                return player.points.add(2).pow(0.15)
            },
            unlocked(){return hasUpgrade('m', 22)}
        },
    },
    layerShown(){return true}
}),

addLayer("e", {
    name: "excavators", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FFC000",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "excavators", // Name of prestige currency
    baseResource: "miners", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["m"],
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for excavators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
        0: {
            requirementDescription: "15 Excavators",
            done() {return player.e.best.gte(15)},
            effectDescription: "Unlocks blasting sites, which are not resetted on excavator reset, but they reset miners.",
        },
        1: {
            requirementDescription: "35 Excavators",
            done() {return player.e.best.gte(35)},
            effectDescription: "You keep miner upgrades on excavator reset."
        }
    },
    upgrades: {
        11: {
            title: "These look like cranes",
            description: "Ore boosts excavator gain.",
            cost: new Decimal(10),
            effect() {
                return player.points.add(1).pow(0.1)
            },
        }
    },
    layerShown(){return player.m.unlocked}
}),
addLayer("bs", {
    name: "blasting sites",
    symbol: "BS",
    position: 2,
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    color: "#1B2A35",
    requires: new Decimal(1000),
    resource: "blasting sites",
    baseResource: "miners",
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["m", "e"],
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for blasting sites", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

