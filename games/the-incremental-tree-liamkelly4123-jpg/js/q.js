addLayer("q", {
    name: "quarks", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["e", 'n'],
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#b41a1a",
    requires: new Decimal("1e652930"), // Can be a function that takes requirement increases into account
    resource: "quarks", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.00003, // Prestige currency exponent
   
       
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
       







    

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
      



        return exp;
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p", 25) || player.q.unlocked},
        
    upgrades: {
    11: {
        title: "bottom quark",
        description: "^1.002 points per Q upgrade bought",
        cost: new Decimal(1),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new Decimal.pow(1.002, player.q.upgrades.length);
                    return ret;
                },
                effectDisplay() { return "^" + format(this.effect())+"" }, // Add formatting to the effect
    },
    12: {
        title: "top quark",
        description: "^1.0015 prestige points per Q upgrade bought",
        cost: new Decimal(58),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new Decimal.pow(1.0015, player.q.upgrades.length);
                    return ret;
                },
                effectDisplay() { return "^" + format(this.effect())+"" }, // Add formatting to the effect
    },
    13: {
        title: "strange quark",
        description: "^1.0012 matter per Q upgrade bought",
        cost: new Decimal(14500),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new Decimal.pow(1.0012, player.q.upgrades.length);
                    return ret;
                },
                effectDisplay() { return "^" + format(this.effect())+"" }, // Add formatting to the effect
    },
    14: {
        title: "weird quark",
        description: "^1.001 protons per Q upgrade bought",
        cost: new Decimal(33.5e6),
        effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new Decimal.pow(1.001, player.q.upgrades.length);
                    return ret;
                },
                effectDisplay() { return "^" + format(this.effect())+"" }, // Add formatting to the effect
    },
     15: {
        title: "super-charged quark",
        description: "keep N upgrades and challenges on any reset and unlock a new E upgrade",
        cost: new Decimal(4.5e15),
      
    },
},

})
