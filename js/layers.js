addLayer("p", {
    name: "Sleep", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    branches: "t n",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Sleep points", // Name of prestige currency
    baseResource: "Dreams", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('p', 26)) mult = mult.times(5)
        if (hasUpgrade('d', 11)) mult = mult.times(5)
        if (hasUpgrade('p', 27)) mult = mult.times(upgradeEffect('p', 27))
        if (hasUpgrade('p', 28)) mult = mult.times(upgradeEffect('p', 28))
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
            title: "New Pillow",
            description: "Double your Dream gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "New Bed",
            description: "Double your Dream gain again.",
            cost: new Decimal(2),
        },
        13: {
            title: "Nightlight",
            description: "1.5X more dream gain.",
            cost: new Decimal(5),
        },
        14: {
            title: "Blankets",
            description: "Your not cold anymore",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: {
            title: "2nd Blanket",
            description: "gain 1.69X more dreams",
            cost: new Decimal(25),
        },
        16: {
            title: "3rd Blanket",
            description: "Ok seriously stop",
            cost: new Decimal(40),
        },
        17: {
            title: "2nd pillow",
            description: "Ok? 5 times dream gain",
            cost: new Decimal(70),
        },
        18: {
            title: "3rd? pillow",
            description: "Ok? 5 times dream again",
            cost: new Decimal(90),
        },
        19: {
            title: "4th? blanket",
            description: "...",
            cost: new Decimal(1500),
        },
        21: {
            title: "5th? blanket",
            description: "Ok please stop",
            cost: new Decimal(7500),
        },
        22: {
            title: "6th? blanket",
            description: "Ok pleasse stop",
            cost: new Decimal(25000),
        },
        24: {
            title: "7th? blanket",
            description: "Ok pleasse stop",
            cost: new Decimal(75000),
        },
        25: {
            title: "8th? blanket",
            description: "Oak pleasse stop",
            cost: new Decimal(750000),
        },
        26: {
            title: "9th? blanket",
            description: "Oak plseasse stop 5x sleep points",
            cost: new Decimal(1750000)
        },
        27: {
            title: "10th? blanket",
            description: "sleep points multiply sleep points",
            cost: new Decimal(5000000000),
            effect() {
                return player[this.layer].points.add(1).pow(0.05)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            
        },
        28: {
            title: "11th? blanket",
            description: "sleep points multiply sleep points again",
            cost: new Decimal(500000000000),
            effect() {
                return player[this.layer].points.add(1).pow(0.075)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            
        },
    },
})
addLayer("t", {
    name: "Transcendants", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#c6fffc",
    branches: "Hhad",
    requires: new Decimal(10000000), // Can be a function that takes requirement increases into account
    resource: "Transcendants", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.05, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade('t', 16)) mult = mult.times(3)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Transcend the limits",
            description: "69 times your dream gain",
            cost: new Decimal(1),
        },
        12: {
            title: "White Snake",
            description: "42.0 times your point gain",
            cost: new Decimal(5),
        },
        13: {
            title: "Pale Snake",
            description: "ehrha",
            cost: new Decimal(5),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
            title: "Paler Snake",
            description: "ehrha",
            cost: new Decimal(8),
            effect() {
                return player[this.layer].points.add(2).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15: {
            title: "Palerer Snake",
            description: "ehrha",
            cost: new Decimal(11),
            effect() {
                return player[this.layer].points.add(2.5).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        16: {
            title: "Palererer Snake",
            description: "3 times Transcendants",
            cost: new Decimal(20),
        },
        },
    },
)
addLayer("n", {
    name: "Nightmare", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#602828",
    branches: "ha H d",
        requires: new Decimal(500000), // Can be a function that takes requirement increases into account
    resource: "Nightmares", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('n', 16)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Worser Pillow",
            description: "5 times your dream gain",
            cost: new Decimal(1),
        },
        12: {
            title: "Rock Pillow",
            description: "2 times your dream gain",
            cost: new Decimal(4),
        },
        13: {
            title: "Spike Pillow",
            description: "1.5 times your dream gain",
            cost: new Decimal(100),
        },
        14: {
            title: "No Pillow",
            description: "2X dream gain",
            cost: new Decimal(10000),
        },
        15: {
            title: "Lava Pillow",
            description: "10 more dream gain",
            cost: new Decimal(750000),
        },
        16: {
            title: "Taten Pillow",
            description: "2x more nightmare gain",
            cost: new Decimal(7000000),
        },
    },
})
addLayer("h", {
    name: "Heaven", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#f1d4f7",
    branches: "ha H d",
    requires: new Decimal(2500000000000000), // Can be a function that takes requirement increases into account
    resource: "Heavens", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Sleep Better child",
            description: "5 times your dream gain",
            cost: new Decimal(1),
        },
    },
})
addLayer("d", {
    name: "Death", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#000000",
    branches: "ha H d",
    requires: new Decimal(25000000000000000), // Can be a function that takes requirement increases into account
    resource: "Deaths", // Name of prestige currency
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
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "POWAH",
            description: "5x dream and sleep point gain",
            cost: new Decimal(50),
        },
    },
})
addLayer("H", {
    name: "Hell", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#e21717",
    branches: "ha H d",
    requires: new Decimal(250000000000000000), // Can be a function that takes requirement increases into account
    resource: "Hells", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {

    },
})
addLayer("a", {
    name: "Ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#f5f196",
    requires: new Decimal(25000000000000000000000000), // Can be a function that takes requirement increases into account
    resource: "Ascensions", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {

    },
})