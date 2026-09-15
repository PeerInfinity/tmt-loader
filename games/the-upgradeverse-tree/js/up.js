addLayer("up", {
    name: "upgrade power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "UP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#4febeb",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "upgrade power", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade('p', 11)) mult = mult.times(3)
        if (hasUpgrade('p', 14)) mult = mult.times(4)
        if (hasUpgrade('sp', 13)) mult = mult.times(4)
        if (hasUpgrade('c', 13)) mult = mult.times(10)
        if (hasUpgrade('sp', 15)) mult = mult.times(5)


        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        if (hasUpgrade('c', 22)) exp = exp.times(1.2)
        return exp
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for upgrade power", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
			let keep = [];
			
			keep.push("upgrades")
            keep.push("points")
            keep.push("best")
            keep.push("total")


			if (layers[resettingLayer].row > this.row) layerDataReset("up", keep)
		},
    upgrades: {
    11: {
        title: "Upgrade Power Upgrade 11",
        description: "Triple point gain and unlock prestige",
        cost: new Decimal(1),
        
    },
    12: {
        title: "Upgrade Power Upgrade 12",
        description: "Prestige points base cost is now 10, unlock more prestige upgrades, triple prestige points",
        cost: new Decimal(75),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                if (hasUpgrade('up', 12)) ret = 10
                if (!hasUpgrade('up', 12)) ret = 25
                return ret;
                },
        
    },
    13: {
        title: "Upgrade Power Upgrade 13",
        description: "Unlock super prestige points, x4 points",
        cost: new Decimal(10000),
        
    },
    14: {
        title: "Upgrade Power Upgrade 14",
        description: "Unlock colors, x5 points",
        cost: new Decimal(1e6),
        
    },
    15: {
        title: "Upgrade Power Upgrade 15",
        description: "Unlock new super prestige upgrades, x6 super prestige points, x4 points, and x2 prestige points",
        cost: new Decimal(2.5e9),
        
    },
     21: {
        title: "Upgrade Power Upgrade 21",
        description: "Unlock mega points, x3.5 points",
        cost: new Decimal(2.5e11),
        
    },
     22: {
        title: "Upgrade Power Upgrade 22",
        description: "Unlock new color upgrades",
        cost: new Decimal(2e21),
        
    },
     23: {
        title: "Upgrade Power Upgrade 23",
        description: "Unlock ultra prestige and x10,000 prestige points",
        cost: new Decimal(1e35),
        
    },
    
}
})
