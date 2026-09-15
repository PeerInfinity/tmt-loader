addLayer("sp", {
    name: "super prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
   branches: ['p'],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#26e0b8",
    requires: 100000, // Can be a function that takes requirement increases into account
    resource: "super prestige points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade('up', 15)) mult = mult.times(6)
        if (hasUpgrade('sp', 14)) mult = mult.times(3)
        if (hasUpgrade('mp', 13)) mult = mult.times(50)


        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for super prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('up', 13)},
        passiveGeneration() {return hasMilestone('mp', 2) || hasUpgrade('u', 11) ? 1:0},

    upgrades: {
    11: {
        title: "Super Prestige Upgrade 11",
        description: "X5 prestige points",
        cost: new Decimal(1),
        
    },
    12: {
        title: "Super Prestige Upgrade 12",
        description: "Add 2 to base point gain, triple prestige points",
        cost: new Decimal(4),
        
    },
    13: {
        title: "Super Prestige Upgrade 13",
        description: "X4 upgrade power, x2.5 prestige points and points",
        cost: new Decimal(10),
        
    },
    14: {
        title: "Super Prestige Upgrade 14",
        description: "Triple prestige points, points, and super prestige points",
        cost: new Decimal(1000),
        unlocked() {return hasUpgrade("up", 15)}
    },
     15: {
        title: "Super Prestige Upgrade 15",
        description: "X5 upgrade power",
        cost: new Decimal(4000),
        unlocked() {return hasUpgrade("up", 15)}
    },
    
}
})
