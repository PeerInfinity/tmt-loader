addLayer("i", {
    name: "inflation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["r", 'q'],
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff0080",
    requires: new Decimal("1.85e301"), // Can be a function that takes requirement increases into account
    resource: "inflation points", // Name of prestige currency
    baseResource: "quarks", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.005, // Prestige currency exponent
   
       
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
       






    

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);



        return exp;
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "i", description: "I: Reset for inflation points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("q", 35) || player.i.unlocked},
        
    

    

milestones: {
    1: {
        requirementDescription: "1 total inflation point",
        effectDescription: "permenatly keep P, M, and PT upgrades on any reset. Always generate prestige points, matter, and protons. Raise points to 1.03.",
        done() { return player.i.total.gte(1) }
    },
     2: {
        requirementDescription: "2 total inflation points",
        effectDescription: "permenatly keep E and N upgrades and challenges. Raise points to 1.03 again.",
        done() { return player.i.total.gte(2) }
    },
    
},

})
