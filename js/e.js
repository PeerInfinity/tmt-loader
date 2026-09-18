addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["m"],
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#faab02",
    requires: new Decimal(1e200), // Can be a function that takes requirement increases into account
    resource: "energy", // Name of prestige currency
    baseResource: "protons", // Name of resource prestige is based on
    baseAmount() {return player.pt.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.02, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
      




    

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
           

        return exp;
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("pt", 35) || player.e.unlocked},
    upgrades: {
    11: {
        title: "big boosts",
        description: "x1,000,000 points and ^1.03 points",
        cost: new Decimal(1),
        
    },
     12: {
        title: "prestige factory",
        description: "generate prestige points. also x1e25 matter",
        cost: new Decimal(5),
        unlocked() { return (hasUpgrade(this.layer, 11))},

        
        
    },
     13: {
        title: "upgrade unlock",
        description: "unlock 2 new rows of matter upgrades and x1,000 matter",
        cost: new Decimal(16),
        unlocked() { return (hasUpgrade(this.layer, 12))},

        
    },
    14: {
        title: "been a very long time",
        description: "x1e75,000 points",
        cost: new Decimal("1e46000"),
        unlocked() { return (hasUpgrade("q", 15))},

        
    },
    
    
    },

})
