addLayer("o", {
    name: "Oak Logs", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#b3ac52",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Oak logs", // Name of prestige currency
    baseResource: "leaves", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('o', 14)) mult = mult.times(upgradeEffect('o', 14))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "O: Reset for Oak logs", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
        upgrades: {
        11: {
    title: "oo monecraft",
    description: "start the game.",
    cost: new Decimal(1),
        },
        12: {
    title: "2x leaves",
    description: "i dont want this much leaves..",
    cost: new Decimal(1),
    unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
    title: "3x leaves",
    description: "i dont want this much leaves.. x3",
    cost: new Decimal(3),
    unlocked() { return hasUpgrade(this.layer, 12) },
        },
        14: {
    title: "oak logs scale leaves",
    description: "oh good more leaves..",
    cost: new Decimal(6),
        effect() {
        return player[this.layer].points.add(1).pow(0.5)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    unlocked() { return hasUpgrade(this.layer, 13) },
        },
    15: {
    title: "4x leaves",
    description: "i dont even know what to add anymore..",
    cost: new Decimal(1e6),
    unlocked() { return hasUpgrade(this.layer, 14) && hasUpgrade("s", 11)},
        },
    },
})
addLayer("s", {
    name: "Oak Saplings", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "OS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["o"],
    color: "#3ea03e",
    requires: new Decimal(1e4), // Can be a function that takes requirement increases into account
    resource: "Oak Saplings", // Name of prestige currency
    baseResource: "Oak Logs", // Name of resource prestige is based on
    baseAmount() {return player.o.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for Oak Saplings", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
    title: "saplings scale up leaves",
    description: "basic logic",
    cost: new Decimal(5),
        effect() {
        return player[this.layer].points.add(1).pow(0.3)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    12: {
    title: "saplings scale up leaves again!",
    description: "old upgrade but better",
    cost: new Decimal(150),
        effect() {
        return player[this.layer].points.add(1).pow(0.4)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    unlocked() { return hasUpgrade(this.layer, 11) },
        },
    }
})
addLayer("w", {
    name: "Wooden Tools", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WT", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["o"],
    color: "#5c3617",
    requires: new Decimal(5e7), // Can be a function that takes requirement increases into account
    resource: "Wooden Tools", // Name of prestige currency
    baseResource: "Oak Logs", // Name of resource prestige is based on
    baseAmount() {return player.o.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "w", description: "W: Reset for wooden tools", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
    11: {
    title: "wooden axe",
    description: "tools scale up leaves but its weaker than saplings",
    cost: new Decimal(10),
        effect() {
        return player[this.layer].points.add(1).pow(0.25)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    }
})
addLayer("c", {
    name: "Cobblestone", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["w"],
    color: "#868484",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "Cobblestone", // Name of prestige currency
    baseResource: "Wooden Tools", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Cobblestone", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
    11: {
    title: "i feel pity",
    description: "everything is awesome but this upgrade is not and uh 3.5x multiply.",
    cost: new Decimal(1),
    },
    12: {
    title: "stone pick",
    description: "normal progression so 3x multiplier and unlocks iron stuff",
    cost: new Decimal(3),
    unlocked() { return hasUpgrade(this.layer, 11) && hasUpgrade("w", 11)},
    }
}
})
addLayer("i", {
    name: "Iron", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
		unlocked: false,
		points: new Decimal(0),
    }},
    branches: ["c", "w"],
    color: "#e6d9d9",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "Iron", // Name of prestige currency
    baseResource: "Wooden Tools", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "I", description: "I: Reset for Iron", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("c", 12)},
    upgrades: {
    }
})