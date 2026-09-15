addLayer("c", {
    name: "color", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
   branches: ['p'],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#7d26e0",
    requires: 100e6,   // Can be a function that takes requirement increases into account
    resource: "colors", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 5,
    exponent: 1.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
       if (hasUpgrade('mp', 14)) mult = mult.div(10)
       if (hasUpgrade('mp', 23)) mult = mult.div(35)
       if (hasUpgrade('mp', 25)) mult = mult.div(20)


        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1);
        return exp
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for colors", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('up', 14)},
    canBuyMax() {return (hasUpgrade('mp', 24))},
    upgrades: {
    11: {
        title: "Color Upgrade 11",
        description: "X3 prestige points",
        cost: new Decimal(1),
        
    },
     12: {
        title: "Color Upgrade 12",
        description: "Colors boost points",
        cost: new Decimal(2),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                 c = player.c.points
                let ret = new Decimal.pow(4, c)
                if (ret.gte("1e40")) ret = ret.sqrt().times("1e20")
                return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        tooltip: "Formula: <br> 4 ^ colors"
        
    },
    13: {
        title: "Color Upgrade 13",
        description: "Ten-fold upgrade power",
        cost: new Decimal(3),
        
        
    },
    14: {
        title: "Color Upgrade 14",
        description: "X1,000 points",
        cost: new Decimal(17),
        unlocked() {return (hasUpgrade('up', 22))},
        
        
    },
    15: {
        title: "Color Upgrade 15",
        description: "Colors boost prestige points",
        cost: new Decimal(18),
        unlocked() {return (hasUpgrade('up', 22))},
        
         effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                 c = player.c.points
                let ret = new Decimal.pow(1.4, c)
                if (hasUpgrade('c', 21)) ret = ret.pow(1.5)
                if (ret.gte("1e10")) ret = ret.sqrt().times("1e5")
                return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        tooltip: "Formula: <br> 1.4 ^ colors"
    },
     21: {
        title: "Color Upgrade 21",
        description: "Raise the previous upgrade to ^1.5",
        cost: new Decimal(21),
        unlocked() {return (hasUpgrade('up', 22))},
        
        
    },
    22: {
        title: "Color Upgrade 22",
        description: "Raise upgrade power gain to ^1.2",
        cost: new Decimal(23),
        unlocked() {return (hasUpgrade('up', 22))},
        
        
    },
}
})
