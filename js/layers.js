addLayer("p", {
    name: "PlanckLength", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    branches: "n",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Planck", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	    if (hasUpgrade('p', 16)) mult = mult.times(2)
	    if (hasUpgrade('m', 11)) mult = mult.times(50)
	    if (hasUpgrade('p', 17)) mult = mult.times(2.5)
	    if (hasUpgrade('p', 18)) mult = mult.times(2.3)
	    if (hasUpgrade('p', 19)) mult = mult.times(2)
	    if (hasUpgrade('p', 25)) mult = mult.times(2)
            if (hasUpgrade('p', 26)) mult = mult.times(upgradeEffect('p', 26))
            if (hasUpgrade('p', 30)) mult = mult.times(upgradeEffect('p', 30))
	    if (hasUpgrade('n', 11)) mult = mult.times(4)
	    if (hasUpgrade('n', 15)) mult = mult.times(8)
	    if (hasUpgrade('n', 16)) mult = mult.times(10)
	    if (hasUpgrade('n', 13)) mult = mult.times(upgradeEffect('n', 13))
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
    title: "Basic Boost",
    description: "Double your point gain.",
    cost: new Decimal(1),
        },
	 12: {
    title: "Another Basic Boost",
    description: "Double your point gain.",
    cost: new Decimal(4),
        },
	13: {
    title: "Ok Boost",
    description: "add a 2.5x multiplier",
    cost: new Decimal(10),
        },
	14: {
    title: "better Boost",
    description: "add a 3x multiplier",
    cost: new Decimal(15),
        },
	15: {
    title: "Good Boost",
    description: "ok were getting there (3.7x)",
    cost: new Decimal(40),
        },
	16: {
    title: "OMG Boost",
    description: "wow planck boost!",
    cost: new Decimal(200),
        },
	17: {
    title: "Nice! Boost",
    description: "wow boost!",
    cost: new Decimal(200),
        },
	18: {
    title: "Nice! Boost 2",
    description: "wow boost!",
    cost: new Decimal(400),
        },
	19: {
    title: "Nice! Boost 3",
    description: "wow boost!",
    cost: new Decimal(1200),
        },
	21: {
    title: "Good! Boost 1",
    description: "wow boost!",
    cost: new Decimal(2500),
        },
	22: {
    title: "Good! Boost 2",
    description: "wow boost!",
    cost: new Decimal(6000),
        },
	23: {
    title: "Good! Boost 3",
    description: "wow boost!",
    cost: new Decimal(10000),
        },
	24: {
    title: "Good! Boost 4",
    description: "wow boost!",
    cost: new Decimal(50000),
        },
	25: {
    title: "Amazing Boost I",
    description: "wow boost! again 2x NM, PL and Points",
    cost: new Decimal(350000),
        },
	26: {
    title: "Prestige points barely boost prestige points",
    description: "big big commitment",
    cost: new Decimal(5000000),
    effect() {
        return player[this.layer].points.add(1).pow(0.015)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
	27: {
    title: "Amazing Boost II",
    description: "50% more points",
    cost: new Decimal(170000000),
        },
	28: {
    title: "Amazing Boost III",
    description: "25% more points",
    cost: new Decimal(250000000),
        },
	29: {
    title: "Amazing Boost IV",
    description: "6.9x more nano",
    cost: new Decimal(500000000),
        },
	30: {
    title: "Wilson",
    description: "WILLSOOOOOON!!!!",
    cost: new Decimal(5000000000),
    effect() {
        return player[this.layer].points.add(1).pow(0.5)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
	31: {
    title: "Logan Boost I",
    description: "2x more",
    cost: new Decimal(69000000000),
        },
	32: {
    title: "Logan Boost II",
    description: "3x more",
    cost: new Decimal(500000000000),
        },
	33: {
    title: "Logan Boost III",
    description: "4x more",
    cost: new Decimal(4200000000000),
        },
	34: {
    title: "Logan Boost IV",
    description: "4x more",
    cost: new Decimal(32000000000000),
        },
	35: {
    title: "Logan Boost V",
    description: "3x more",
    cost: new Decimal(20000000000000),
        },
	36: {
    title: "Logan Boost VI",
    description: "10x more nano",
    cost: new Decimal(169000000000000),
        },
    },
})
addLayer("n", {
    name: "Nanometers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "NM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#2f36b8",
    branches: "m",
    requires: new Decimal(200000), // Can be a function that takes requirement increases into account
    resource: "Nano", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
	if (hasUpgrade('p', 24)) mult = mult.times(2)
	if (hasUpgrade('m', 12)) mult = mult.times(10)
	if (hasUpgrade('p', 29)) mult = mult.times(6.9)
	if (hasUpgrade('p', 25)) mult = mult.times(2)
	if (hasUpgrade('p', 36)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	    upgrades: {
        11: {
    title: "Plank Funnies",
    description: "quad  your Planck gain.",
    cost: new Decimal(1),
        },
        12: {
    title: "Points Funnies",
    description: "10x  your point gain.",
    cost: new Decimal(2),
        },
	13: {
    title: "Some Funnies",
    description: " your point gain. will be effected (big commitment)",
    cost: new Decimal(2),
	effect() {
        return player[this.layer].points.add(1).pow(0.5)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14: {
    title: "Even more Points Funnies",
    description: "12x  your point gain.",
    cost: new Decimal(10),
        },
        15: {
    title: "Oingo Boingo Cringe Pact",
    description: "8x more planck gain this upgrade will come again tho",
    cost: new Decimal(70),
        },
        16: {
    title: "Worm",
    description: "MY friend anthony told me to",
    cost: new Decimal(200),
        },
17: {
    title: "Quick",
    description: "MY friend logan told me to",
    cost: new Decimal(1000),
        },
    },
})
addLayer("m", {
    name: "MM", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#2f36b8",
    requires: new Decimal(69000000000), // Can be a function that takes requirement increases into account
    resource: "Micro", // Name of prestige currency
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
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
	    upgrades: {
        11: {
    title: "Quantum Foam Funnies",
    description: "50x your planck gain",
    cost: new Decimal(1),
        },
        12: {
    title: "Quantum Foam Funnies Funnies!",
    description: "10x your nano gain",
    cost: new Decimal(2),
        },
    },
})

