addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
   branches: ['up'],
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#2696e0",
    requires() {
       return upgradeEffect('up', 12)

    }, // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade('up', 12)) mult = mult.times(3)
        if (hasUpgrade('p', 14)) mult = mult.times(4)
        if (hasUpgrade('p', 15)) mult = mult.times(5)
        if (hasUpgrade('sp', 11)) mult = mult.times(5)
        if (hasUpgrade('sp', 12)) mult = mult.times(3)
        if (hasUpgrade('sp', 13)) mult = mult.times(2.5)
        if (hasUpgrade('c', 11)) mult = mult.times(3)
        if (hasUpgrade('up', 15)) mult = mult.times(2)
        if (hasUpgrade('sp', 14)) mult = mult.times(3)
        if (hasUpgrade('mp', 12)) mult = mult.times(75)
        if (hasUpgrade('mp', 24)) mult = mult.times(100)
        if (hasUpgrade('c', 15)) mult = mult.times(upgradeEffect('c', 15))
        if (hasUpgrade('up', 23)) mult = mult.times(10000)

        if (hasUpgrade('mp', 22)) mult = mult.pow(1.1)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('up', 11)},
    passiveGeneration() {return hasMilestone('mp', 1) || hasUpgrade('u', 11) ? 1:0},
    doReset(resettingLayer) {
			let keep = [];
			
			if (hasMilestone("mp", 1)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
		},
    upgrades: {
    11: {
        title: "Prestige Upgrade 11",
        description: "Double point gain, triple upgrade power",
        cost: new Decimal(1),
        
    },
    12: {
        title: "Prestige Upgrade 12",
        description: "Upgrade power boosts points",
        cost: new Decimal(3),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                 up = player.up.points.add(1)
                let ret = up.pow(0.34)
                if (ret.gte("1e400")) ret = ret.sqrt().times("1e200")
                return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        tooltip: "Formula: <br> Upgrade power + 1 ^ 0.34"
    },
    13: {
        title: "Prestige Upgrade 13",
        description: "Prestige points boost points",
        cost: new Decimal(50),
        unlocked() {return hasUpgrade('up', 12)},
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                 pp = player.p.points.add(1)
                let ret = pp.pow(0.23)
                if (hasUpgrade('mp', 15)) ret = ret.pow(1.35)
                if (ret.gte("1e100")) ret = ret.sqrt().times("1e50")
                return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        tooltip: "Formula: <br> Prestige points + 1 ^ 0.23"
    },
    14: {
        title: "Prestige Upgrade 14",
        description: "X4 points, prestige points, and upgrade power",
        cost: new Decimal(250),
        unlocked() {return hasUpgrade('up', 12)},
       
    },
    15: {
        title: "Prestige Upgrade 15",
        description: "X5 prestige points",
        cost: new Decimal(10000),
        unlocked() {return hasUpgrade('up', 12)},
       
    },
}
})
