addLayer("r", {
    name: "research", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["p"],
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#2bfa02",
    requires: new Decimal("1e74000"), // Can be a function that takes requirement increases into account
    resource: "research points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.0005, // Prestige currency exponent
   softcap: new Decimal("100"), 
        softcapPower: new Decimal(0.05), 
       
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
        {key: "m", description: "M: Reset for matter", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p", 25) || player.m.unlocked},
        
    upgrades: {
    11: {
        title: "row 4!",
        description: "x1e100 points and x1e20 matter. generate prestige points and protons and autobuy P upgrades",
        cost: new Decimal(1),
        
    },
     12: {
        title: "getting faster",
        description: "autobuy M and PT upgrades and x1e400 protons",
        cost: new Decimal(2),
        unlocked() {return hasUpgrade('r', 11)}
        
    },
    13: {
        title: "automating",
        description: "generate matter and x1e100 points",
        cost: new Decimal(18),
        unlocked() {return hasUpgrade('r', 12)}
        
    },
     14: {
        title: "simple boost",
        description: "^1.04 points",
        cost: new Decimal(47),
        unlocked() {return hasUpgrade('r', 13)}
        
    },
    15: {
        title: "neutronic 3",
        description: "generate neutrons, ^1.2 neutrons, and unlock 2 new N upgrades",
        cost: new Decimal(263),
        unlocked() {return hasUpgrade('r', 14)}
        
    },
    21: {
        title: "science",
        description: "unlock the first research challenge and x777,777 protons",
        cost: new Decimal(3445),
        unlocked() {return hasUpgrade('r', 15)}
        
    },
    22: {
        title: "labatory",
        description: "unlock the real last N challenge and x1e50 points",
        cost: new Decimal(90e6),
        unlocked() {return hasChallenge('r', 22)}
        
    },
},
challenges: {
    11: {
        name: "useless prestige",
        challengeDescription: "the prestige layer is deactivated",
        goalDescription: "get 1e1086 points",
        rewardDescription: "^1.08 prestige points and unlock the next challenge",
        canComplete: function() {return player.points.gte("1e1086")},
        unlocked() {return (hasUpgrade('r', 21))}
    },
    12: {
        name: "useless matter",
        challengeDescription: "the matter layer is deactivated",
        goalDescription: "get 3e860 points",
        rewardDescription: "^1.04 matter and unlock the next challenge",
        canComplete: function() {return player.points.gte("3e860")},
        unlocked() {return (hasChallenge('r', 11))}
    },
     21: {
        name: "useless protons",
        challengeDescription: "the proton layer is deactivated",
        goalDescription: "get 2e379 points",
        rewardDescription: "^1.025 protons and unlock the next challenge",
        canComplete: function() {return player.points.gte("2e379")},
        unlocked() {return (hasChallenge('r', 12))}
    },
     22: {
        name: "useless points",
        challengeDescription: "point gain is always 0.5",
        goalDescription: "get 50 prestige points",
        rewardDescription: "^1.03 points and unlock the next upgrade",
        canComplete: function() {return player.p.points.gte("50")},
        unlocked() {return (hasChallenge('r', 21))}
    },
},

})
