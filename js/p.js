addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#029ffa",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
     if (hasUpgrade("p", 14))  mult = mult.times(2);
     if (hasUpgrade("p", 15))  mult = mult.times(3);
     if (hasUpgrade("p", 22))  mult = mult.times(2.5);

     if (hasUpgrade("m", 13))  mult = mult.times(3);
     if (hasUpgrade("m", 21))  mult = mult.times(2.6);
     if (hasUpgrade("m", 34))  mult = mult.times(4);

    if (hasUpgrade("pt", 12))  mult = mult.times(10);
    if (hasUpgrade("pt", 24))  mult = mult.times(1e12);
    if (hasUpgrade("pt", 41))  mult = mult.times(1e80);

    if (hasUpgrade("n", 15))  mult = mult.times(1e140);
    if (hasUpgrade("p", 31))  mult = mult.times("1e500");
    if (hasUpgrade("p", 34))  mult = mult.times("1e1000");








        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
       if (hasUpgrade("m", 14)) exp = exp.add(0.1);
       if (hasUpgrade("pt", 53)) exp = exp.add(0.02);

       if (hasUpgrade("m", 24)) exp = exp.times(1.1);
       if (hasUpgrade("m", 33)) exp = exp.times(1.1);
              if (hasUpgrade("m", 45)) exp = exp.times(1.1);
              if (hasUpgrade("q", 12)) exp = exp.times(upgradeEffect('q', 12));

if (inChallenge('n', 12)) exp = exp.times(0.2)
if (hasChallenge('n', 12)) exp = exp.times(1.05)
if (hasChallenge('r', 11)) exp = exp.times(1.08)

        return exp;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "r", description: "R: Reset for research points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    autoUpgrade() {return hasUpgrade("pt", 22) || hasUpgrade('r', 11)},
    passiveGeneration() {return hasUpgrade("r", 11) ? 1:0},
    deactivated() {return (inChallenge('r', 11))},
    upgrades: {
    11: {
        title: "you gotta start somewhere",
        description: "double point gain",
        cost: new Decimal(1),
        
    },
     12: {
        title: "synergized",
        description: "prestige points boost point gain",
        cost: new Decimal(2),
         unlocked() { return (hasUpgrade(this.layer, 11))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(1).pow(0.45);
                    if (hasUpgrade("m", 12)) ret = ret.pow(1.2);
                                        if (hasUpgrade("pt", 33)) ret = ret.pow(1.5);

                    if (ret.gte("1e20")) ret = ret.sqrt().times("1e10")
                    if (ret.gte("1e10000")) ret = ret.sqrt().times("1e5000")

                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
        
    },
     13: {
        title: "a bit better",
        description: "x2.4 point gain",
        cost: new Decimal(5),
         unlocked() { return (hasUpgrade(this.layer, 12))},
               
        
    },
      14: {
        title: "double trouble",
        description: "double points and prestige points",
        cost: new Decimal(15),
         unlocked() { return (hasUpgrade(this.layer, 13))},
               
        
    },
    15: {
        title: "finale row 1 upgrade",
        description: "triple prestige points",
        cost: new Decimal(100),
         unlocked() { return (hasUpgrade(this.layer, 14))},
               
        
    },
     21: {
        title: "better boosts for row 2",
        description: "x3.5 points",
        cost: new Decimal(450),
         unlocked() { return (hasUpgrade(this.layer, 15))},
               
        
    },
     22: {
        title: "more prestige",
        description: "x2.5 prestige points",
        cost: new Decimal(1300),
         unlocked() { return (hasUpgrade(this.layer, 21))},
               
        
    },
     23: {
        title: "upgrade synergy",
        description: "prestige upgrades bought boosts points",
        cost: new Decimal(5000),
         unlocked() { return (hasUpgrade(this.layer, 22))},
          effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.p.upgrades.length /2.3;
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
               
        
    },
     24: {
        title: "quadrupled!",
        description: "x4 points",
        cost: new Decimal(12000),
         unlocked() { return (hasUpgrade(this.layer, 23))},
         
               
        
    },
      25: {
        title: "finale prestige upgrade",
        description: "unlock matter and x3.4 points",
        cost: new Decimal(35000),
         unlocked() { return (hasUpgrade(this.layer, 24))},
         
               
        
    },
     31: {
        title: "been a while",
        description: "x1e500 prestige points",
        cost: new Decimal("1e11900"),
                unlocked() {return(hasChallenge('n', 12))}

    },
     32: {
        title: "mattery",
        description: "^1.04 matter",
        cost: new Decimal("1e17400"),
                unlocked() {return(hasChallenge('n', 12))}

    },
    33: {
        title: "protonic 3",
        description: "^1.07 protons",
        cost: new Decimal("1e18070"),
                unlocked() {return(hasChallenge('n', 12))}

    },
    34: {
        title: "that's alot!",
        description: "x1e1000 prestige points",
        cost: new Decimal("1e24770"),
                unlocked() {return(hasChallenge('n', 12))}

    },
     35: {
        title: "neutronic",
        description: "x10,000 neutrons",
        cost: new Decimal("1e27568"),
                unlocked() {return(hasChallenge('n', 12))}

    },
    
},

})
