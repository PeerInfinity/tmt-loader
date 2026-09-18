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
       
if (hasUpgrade('q', 33)) mult = mult.times(upgradeEffect('q', 33))






    

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
      if (hasUpgrade('q', 32)) exp = exp.times(upgradeEffect('q', 32))



        return exp;
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quarks", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge("n", 32) || player.q.unlocked},
        
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
    21: {
        title: "nothing I",
        description: "this upgrade does nothing but add to the first 4 Q upgrades",
        cost: new Decimal(1.4e180),
      
    },
    22: {
        title: "nothing II",
        description: "this upgrade does nothing but add to the first 4 Q upgrades, again",
        cost: new Decimal(1.64e182),
        unlocked() {return hasUpgrade('q', 21)}
      
    },
    23: {
        title: "nothing III",
        description: "you wouldn't belive me if I told you...",
        cost: new Decimal(2.11e184),
        tooltip: "this upgrade does nothing but add to the first 4 Q upgrades, yet again",
        unlocked() {return hasUpgrade('q', 22)}

    },
    24: {
        title: "nothing IV",
        description: "you REALLY want to know?",
        cost: new Decimal(2.99e186),
        tooltip: "this upgrade does nothing but add to the first 4 Q upgrades, who would have thought?",
        unlocked() {return hasUpgrade('q', 23)}

    },
    25: {
        title: "nothing V",
        description: "are you really looking at this description?",
        cost: new Decimal(4.69e188),
        tooltip: "this upgrade does nothing but add to the first 4 Q upgrades, but also does nothing",
        unlocked() {return hasUpgrade('q', 24)}

    },
    31: {
        title: "something",
        description: "here's that something: <br> -",
        cost: new Decimal(8.17e190),
        tooltip: "this upgrade does NOT do nothing, it adds to the first 4 Q upgrades!",
        unlocked() {return hasUpgrade('q', 25)}

    },
     32: {
        title: "this one really does something",
        description: "THIS SOMETHING: <br> ^1.0013 quarks per Q upgrade bought",
        cost: new Decimal(1.58e193),
        unlocked() {return hasUpgrade('q', 31)},
 effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new Decimal.pow(1.0013, player.q.upgrades.length);
                    return ret;
                },
                effectDisplay() { return "^" + format(this.effect())+"" }, // Add formatting to the effect
    },
     33: {
        title: "why does every Q upgrade have something to do with the amount of Q upgrades bought?",
        description: "hover/tap on me",
        cost: new Decimal(4.05e198),
        unlocked() {return hasUpgrade('q', 32)},
       tooltip: "Q upgrades bought boosts quarks",
       effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new Decimal.pow(2, player.q.upgrades.length);
                    return ret;
                },
                
    },
     34: {
        title: "inflation...ish?",
        description: "^1.08 points",
        cost: new Decimal(1.86e205),
        unlocked() {return hasUpgrade('q', 33)}

    },
35: {
        title: "inflation...yes!",
        description: "unlock inflation points",
        cost: new Decimal(7.87e295),
        unlocked() {return hasUpgrade('q', 34)}

    },
},

})
