addLayer("pt", {
    name: "proton", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PT", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["p"],
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#fa0202",
    requires: new Decimal(5e19), // Can be a function that takes requirement increases into account
    resource: "protons", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
    
if (hasUpgrade("m", 42)) mult = mult.times(1e30);
if (hasUpgrade("pt", 43)) mult = mult.times(2);
if (hasUpgrade("n", 22)) mult = mult.times("1e450");
if (hasUpgrade("r", 12)) mult = mult.times("1e400");
if (hasUpgrade("r", 21)) mult = mult.times("777777");






        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
      if (hasUpgrade("pt", 34)) exp = exp.times(1.3);
      if (hasUpgrade("m", 55)) exp = exp.times(1.08);
            if (hasUpgrade("pt", 42)) exp = exp.times(1.4);
                        if (hasUpgrade("pt", 45)) exp = exp.times(1.2);
                        if (hasUpgrade("p", 33)) exp = exp.times(1.07);

                        if (hasUpgrade("pt", 54)) exp = exp.pow(1.08);
if (hasUpgrade('n', 24)) exp = exp.times(1.06)
              if (hasUpgrade("q", 14)) exp = exp.times(upgradeEffect('q', 14));


if (inChallenge('n', 22)) exp = exp.times(0.25)
if (hasChallenge('n', 22)) exp = exp.times(1.06)
if (hasChallenge('r', 21)) exp = exp.times(1.025)

        return exp;
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "P", description: "SHIFT + P: Reset for protons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("m", 35) || player.pt.unlocked},
       passiveGeneration() {return hasUpgrade("n", 12) || hasUpgrade('r', 11) ? 1:0},
    autoUpgrade() {return hasUpgrade('r', 12)},
    deactivated() {return (inChallenge('r', 21))},

    milestones: {
    1: {
        requirementDescription: "1e5445 protons",
        effectDescription: "unlock neutrons",
        done() { return player.pt.points.gte("1e5445") },
    },
    
},
    upgrades: {
    11: {
        title: "even more boost",
        description: "x8 points",
        cost: new Decimal(1),
        
    },
       12: {
        title: "oom increase",
        description: "x10 prestige points",
        cost: new Decimal(5),
        unlocked() { return (hasUpgrade(this.layer, 11))},

        
    },
      13: {
        title: "that's a lot more points!",
        description: "x15 points",
        cost: new Decimal(20),
        unlocked() { return (hasUpgrade(this.layer, 12))},

        
    },   
      14: {
        title: "matter is finally usefull!",
        description: "matter boosts points",
        cost: new Decimal(50),
        unlocked() { return (hasUpgrade(this.layer, 13))},
         effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.m.points.add(1).pow(0.35);
                    if (ret.gte("1e40")) ret = ret.sqrt().times("1e20")
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect

        
    },   
     15: {
        title: "exp increase",
        description: "increase matter exp by 0.2",
        cost: new Decimal(25e6),
        unlocked() { return (hasUpgrade(this.layer, 14))},
       

        
    },   
      21: {
        title: "protons are usefull, too",
        description: "protons boost points",
        cost: new Decimal(1e9),
        unlocked() { return (hasUpgrade(this.layer, 15))},
         effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.pt.points.add(1).pow(0.35);
                    if (ret.gte("1e30")) ret = ret.sqrt().times("1e15")
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
       

        
    },   
    22: {
        title: "upgrade-bot",
        description: "autobuy prestige upgrades and x10,000 points",
        cost: new Decimal(1e16),
        unlocked() { return (hasUpgrade(this.layer, 21))},
        
       

        
    },   
     23: {
        title: "huge boost",
        description: "x100,000 matter",
        cost: new Decimal(1e23),
        unlocked() { return (hasUpgrade(this.layer, 22))},
        
       

        
    },   
    24: {
        title: "presstige boost",
        description: "x1e12 prestige points",
        cost: new Decimal(1e27),
        unlocked() { return (hasUpgrade(this.layer, 23))},
        
       

        
    },   
     25: {
        title: "op boost",
        description: "^1.12 point gain",
        cost: new Decimal(1e34),
        unlocked() { return (hasUpgrade(this.layer, 24))},
        
       

        
    },   
    31: {
        title: "boosted",
        description: "x1e15 points",
        cost: new Decimal(1e50),
        unlocked() { return (hasUpgrade(this.layer, 25))},
        
       

        
    },   
    32: {
        title: "op exp",
        description: "^1.35 matter",
        cost: new Decimal(1e82),
        unlocked() { return (hasUpgrade(this.layer, 31))},
        
       

        
    },   
     33: {
        title: "better prestige",
        description: "'synergized' is raised to 1.5",
        cost: new Decimal(1e96),
        unlocked() { return (hasUpgrade(this.layer, 32))},
        
       

        
    },   
    34: {
        title: "proton exp",
        description: "^1.3 protons",
        cost: new Decimal(1e133),
        unlocked() { return (hasUpgrade(this.layer, 33))},
        
       

        
    },   
     35: {
        title: "powered up",
        description: "unlock energy and x1,000 points",
        cost: new Decimal(1e191),
        unlocked() { return (hasUpgrade(this.layer, 34))},
        
       

        
    },   
     41: {
        title: "proton prestige",
        description: "x1e80 prestige points",
        cost: new Decimal("1e1259"),
        unlocked() { return (hasUpgrade("m", 55)) && hasUpgrade("pt", 35)},
        
       

        
    },   
    42: {
        title: "protonic",
        description: "^1.4 protons",
        cost: new Decimal("1e1432"),
        unlocked() { return (hasUpgrade("m", 55)) && hasUpgrade("pt", 41)},
        
       

        
    },   
     43: {
        title: "generic proton",
        description: "x2 protons and ^1.03 points",
        cost: new Decimal("1e2670"),
        unlocked() { return (hasUpgrade("m", 55)) && hasUpgrade("pt", 42)},
        
       

        
    },   
     44: {
        title: "random boost",
        description: "x1.64e37 points",
        cost: new Decimal("1e3062"),
        unlocked() { return (hasUpgrade("m", 55)) && hasUpgrade("pt", 43)},
        
       

        
    },   
    45: {
        title: "protonic 2",
        description: "^1.2 protons",
        cost: new Decimal("1e3342"),
        unlocked() { return (hasUpgrade("m", 55)) && hasUpgrade("pt", 44)},
        
       

        
    },   
    51: {
        title: "matteric",
        description: "^1.07 matter",
        cost: new Decimal("1e41555"),
                unlocked() {return(hasChallenge('n', 21))}

    },
    52: {
        title: "mega boost",
        description: "x1e2500 points",
        cost: new Decimal("1e42414"),
                unlocked() {return(hasChallenge('n', 21))}

    },
    53: {
        title: "exp addition",
        description: "+^0.02 prestige points and matter",
        cost: new Decimal("1e59475"),
                unlocked() {return(hasChallenge('n', 21))}

    },
     54: {
        title: "exp exp?",
        description: "^1.08 proton exp",
        cost: new Decimal("1e60785"),
                unlocked() {return(hasChallenge('n', 21))}

    },
     55: {
        title: "neutronic 2",
        description: "x10,000,000 neutrons",
        cost: new Decimal("1e72226"),
                unlocked() {return(hasChallenge('n', 21))}

    },
    
},

})
