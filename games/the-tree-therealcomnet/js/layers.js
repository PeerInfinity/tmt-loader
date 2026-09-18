addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#8f67d8",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
     11: {
          title: "Absolute",
    description: "Begin.",
    cost: new Decimal(1)
        },
     12: {
          title: "Continue",
    description: "x2",
    cost: new Decimal(2),
    unlocked() { return hasUpgrade("p", 11) },
        },
     13: {
          title: "Recreate",
    description: "xP",
    cost: new Decimal(3),
    unlocked() { return hasUpgrade("p", 12) },
     effect() {
        return player[this.layer].points.add(1).pow(0.5)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
    },
     21: {
        title: "Wonder",
    description: "Absolutus",
    cost: new Decimal(5),
    unlocked() { return hasUpgrade("p", 13 )},
     },
     22: {
        title: "Constant",
    description: "xTime",
    cost: new Decimal(30),
    unlocked() { return hasMilestone("t", 1 )},
    effect() {
        return new
        Decimal(player.timePlayed).div(480).add(1)
    },
    effectDisplay() {
        return format(this.effect()) + "x"
    }
     },
},},)
addLayer("t", {
    name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#678bd8",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    branches: ["p"],
    resource: "Tempo", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "Tempo", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p", 21 )},
    milestones: {
    0: {
        requirementDescription: "1 Tempo",
        effectDescription: "2/2",
        done() { return player.t.best.gte(1) },
    },
    1: {
        requirementDescription: "5 Tempo",
        effectDescription: "4/4",
        done() { return player.t.best.gte(5) },
        unlocked() { return hasMilestone('t', 0 )},
    },
    2: {
        requirementDescription: "35 Tempo",
        effectDescription: "8/4",
        done() { return player.t.best.gte(35) },
        unlocked() { return hasMilestone('t', 1 )},
    }

},})
addLayer("a", {
    name: "abstract", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#7ca7d8",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    branches: ["p"],
    resource: "Abstraction", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "Abstract", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p", 21 )},
})