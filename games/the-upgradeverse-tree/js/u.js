addLayer("u", {
    name: "ultra", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
   branches: ['mp'],
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#9900ff",
    requires: 1000,    // Can be a function that takes requirement increases into account
    resource: "ultra prestige points", // Name of prestige currency
    baseResource: "mega points", // Name of resource prestige is based on
    baseAmount() {return player.mp.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.25, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);


        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(0.75);
        return exp
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "U", description: "SHIFT + U: Reset for ultra prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('up', 23)},
   
    upgrades: {
    11: {
        title: "Ultra Upgrade 11",
        description: "Generate prestige points and SP, x2 mega points, and x3,000 points",
        cost: new Decimal(1),
        
    },
    
    
   
},
 
})
