addLayer("m", {
    name: "matter", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["p"],
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#fae902",
    requires: new Decimal(2.5e6), // Can be a function that takes requirement increases into account
    resource: "matter", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
   softcap: new Decimal("1e1000"), 
        softcapPower: new Decimal(0.25), 
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        if (hasUpgrade("m", 12)) mult = mult.times(4);
        if (hasUpgrade("m", 21)) mult = mult.times(3);
        if (hasUpgrade("m", 25)) mult = mult.times(5);
        if (hasUpgrade("m", 31) && hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23));
        if (hasUpgrade("m", 34)) mult = mult.times(3);
        if (hasUpgrade("pt", 23)) mult = mult.times(100000);
        if (hasUpgrade("e", 12)) mult = mult.times(1e25);
        if (hasUpgrade("e", 13)) mult = mult.times(1000);
        if (hasUpgrade("m", 41)) mult = mult.times(upgradeEffect("m", 41));
        if (hasUpgrade("n", 14)) mult = mult.times(1e100);
        if (hasUpgrade("n", 21)) mult = mult.times(1e300);
        if (hasUpgrade("r", 11)) mult = mult.times(1e20);







    

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
       if (hasUpgrade("pt", 15)) exp = exp.add(0.2);
       if (hasUpgrade("pt", 53)) exp = exp.add(0.02);

if (hasUpgrade("m", 15)) exp = exp.times(1.3);
if (hasUpgrade("pt", 32)) exp = exp.times(1.35);
if (hasUpgrade("m", 52)) exp = exp.times(1.3);
if (hasUpgrade("m", 53)) exp = exp.times(0.95);
if (hasUpgrade("m", 54)) exp = exp.times(1.07);
if (hasUpgrade("p", 32)) exp = exp.times(1.04);
if (hasUpgrade("pt", 51)) exp = exp.times(1.07);
if (hasUpgrade("q", 13)) exp = exp.times(upgradeEffect('q', 13));

if (inChallenge("n", 21)) exp = exp.times(0.15);
if (hasChallenge("n", 21)) exp = exp.times(1.03);
if (hasChallenge("r", 12)) exp = exp.times(1.04);



        return exp;
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for matter", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p", 25) || player.m.unlocked},
          passiveGeneration() {return hasUpgrade("n", 12) || hasUpgrade('r', 13) ? 1:0},
    autoUpgrade() {return hasChallenge("n", 21) || hasUpgrade('r', 12)},
    deactivated() {return (inChallenge('r', 12))},

    upgrades: {
    11: {
        title: "this should help get back here",
        description: "quadruple point gain",
        cost: new Decimal(1),
        
    },
    12: {
        title: "EXPONENT, kinda",
        description: "x4 matter gain, raise 'snergized' to 1.2",
        cost: new Decimal(1),
        unlocked() { return (hasUpgrade(this.layer, 11))},

        
    },
     13: {
        title: "2 in 1",
        description: "x3 prestige points, x1.5 points",
        cost: new Decimal(15),
        unlocked() { return (hasUpgrade(this.layer, 12))},

        
    },
    14: {
        title: "real exponents!",
        description: "add 0.1 to prestige gain exp",
        cost: new Decimal(40),
        unlocked() { return (hasUpgrade(this.layer, 13))},

        
    },
      15: {
        title: "more real exponents!",
        description: "raise matter to ^1.3, x4 points",
        cost: new Decimal(50),
        unlocked() { return (hasUpgrade(this.layer, 14))},

        
    },
     21: {
        title: "pretty good boost",
        description: "x2.6 prestige points, x3 matter",
        cost: new Decimal(250),
        unlocked() { return (hasUpgrade(this.layer, 15))},

        
    },
    22: {
        title: "lots of points",
        description: "raise points to 1.1",
        cost: new Decimal(2000),
        unlocked() { return (hasUpgrade(this.layer, 21))},

        
    },
     23: {
        title: "basically squared",
        description: "'upgrade synergy' is applied twice",
        cost: new Decimal(8000),
        unlocked() { return (hasUpgrade(this.layer, 22))},

        
    },
     24: {
        title: "'synergied' will be better",
        description: "raise prestige points to 1.1",
        cost: new Decimal(12000),
        unlocked() { return (hasUpgrade(this.layer, 23))},

        
    },
     25: {
        title: "that's alot!",
        description: "x5 matter and points",
        cost: new Decimal(25000),
        unlocked() { return (hasUpgrade(this.layer, 24))},

        
    },
     31: {
        title: "there's MORE?!",
        description: "'upgrade synergy' is applied to matter gain",
        cost: new Decimal(600000),
        unlocked() { return (hasUpgrade(this.layer, 25))},

        
    },
     32: {
        title: "even more points",
        description: "raise points to 1.08",
        cost: new Decimal(2.5e6),
        unlocked() { return (hasUpgrade(this.layer, 31))},

        
    },
     33: {
        title: "..and prestige points",
        description: "raise prestige points to 1.1",
        cost: new Decimal(15e6),
        unlocked() { return (hasUpgrade(this.layer, 32))},

        
    },
    34: {
        title: "..and matter",
        description: "x4 matter and prestige points",
        cost: new Decimal(40e6),
        unlocked() { return (hasUpgrade(this.layer, 33))},

        
    },
     35: {
        title: "..and layers!",
        description: "unlock protons and x4 points",
        cost: new Decimal(400e6),
        unlocked() { return (hasUpgrade(this.layer, 34))},

        
    },
     41: {
        title: "matter generated matter",
        description: "matter boosts itself",
        cost: new Decimal("1e340"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 35)},
         effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.m.points.add(1).pow(0.25);
                    if (hasUpgrade("m", 43)) ret = ret.pow(1.25);
                    if (ret.gte("1e500")) ret = ret.sqrt().times("1e250")
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect

        
    },
    42: {
        title: "more protons",
        description: "x1e30 protons",
        cost: new Decimal("1e1025"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 41)},
        

        
    },
      43: {
        title: "more matter",
        description: "raise 'matter generated matter' to 1.25",
        cost: new Decimal("1e1029"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 42)},
        

        
    },
      44: {
        title: "more points",
        description: "^1.025 points",
        cost: new Decimal("1e1074"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 43)},
        

        
    },
      45: {
        title: "more prestige points",
        description: "^1.1 prestige points",
        cost: new Decimal("1e1083"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 44)},
        

        
    },
     51: {
        title: "point increase",
        description: "^1.08 points",
        cost: new Decimal("1e1100"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 45)},
        

        
    },
     52: {
        title: "super matter",
        description: "^1.3 matter",
        cost: new Decimal("1e1144"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 51)},
        

        
    },
     53: {
        title: "antimatter?",
        description: "^0.95 matter BUT x1e70 points",
        cost: new Decimal("1e1327"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 52)},
        

        
    },
     54: {
        title: "hyper matter",
        description: "^1.07 matter",
        cost: new Decimal("1e1367"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 53)},
        

        
    },
     55: {
        title: "omega matter!",
        description: "unlock a row of proton upgrades and ^1.08 protons",
        cost: new Decimal("1e1435"),
        unlocked() { return (hasUpgrade("e", 13)) && hasUpgrade("m", 54)},
        

        
    },
    
    
},

})
