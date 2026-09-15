addLayer("mp", {
    name: "mega", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
   branches: ['sp'],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff8800",
    requires: 1e16,    // Can be a function that takes requirement increases into account
    resource: "mega points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
       if (hasMilestone('mp', 3)) mult = mult.times(4)
       if (hasUpgrade('u', 11)) mult = mult.times(2)


        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(0.65);
        return exp
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for mega points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('up', 21)},
   
    upgrades: {
    11: {
        title: "Mega Upgrade 11",
        description: "^1.005 points, x200 points",
        cost: new Decimal(1),
        
    },
    12: {
        title: "Mega Upgrade 12",
        description: "X75 prestige points",
        cost: new Decimal(1),
        
    },
    13: {
        title: "Mega Upgrade 13",
        description: "X50 super prestige points",
        cost: new Decimal(1),
        
    },
    14: {
        title: "Mega Upgrade 14",
        description: "Colors are 10x cheaper",
        cost: new Decimal(1),
        
    },
    15: {
        title: "Mega Upgrade 15",
        description: "Prestige upgrade 12 is ^1.35",
        cost: new Decimal(1),
        
    },
    21: {
        title: "Mega Upgrade 21",
        description: "Add 30 to base point gain",
        cost: new Decimal(10),
        unlocked() {return hasMilestone('mp', 3)}
        
    },
    22: {
        title: "Mega Upgrade 22",
        description: "After all p mults, raise p mult to 1.1",
        cost: new Decimal(15),
        unlocked() {return hasMilestone('mp', 3)}
        
    },
    23: {
        title: "Mega Upgrade 23",
        description: "Colors are 35x cheaper",
        cost: new Decimal(15),
        unlocked() {return hasMilestone('mp', 3)}
        
    },
    24: {
        title: "Mega Upgrade 24",
        description: "Buy max colors and x100 prestige points",
        cost: new Decimal(20),
        unlocked() {return hasMilestone('mp', 3)}
        
    },
     25: {
        title: "Mega Upgrade 25",
        description: "Colors are 20x cheaper",
        cost: new Decimal(30),
        unlocked() {return hasMilestone('mp', 3)}
        
    },
    
   
},
 milestones: {
    1: {
        requirementDescription: "2 total mega points",
        effectDescription: "Fully automate prestige layer",
        done() { return player.mp.total.gte(2) },
    },
  2: {
        requirementDescription: "3 total mega points",
        effectDescription: "Generate super prestige points",
        done() { return player.mp.total.gte(3) },
    },
     3: {
        requirementDescription: "5 total mega points",
        effectDescription: "X4 mega points and unlock new mega upgrades",
        done() { return player.mp.total.gte(5) },
    },
    
},
})
