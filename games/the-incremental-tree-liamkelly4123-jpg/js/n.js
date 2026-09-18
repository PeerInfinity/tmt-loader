addLayer("n", {
    name: "neutron", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: ["m", "pt"],
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#0845ec",
    requires: new Decimal("1e5445"), // Can be a function that takes requirement increases into account
    resource: "neutrons", // Name of prestige currency
    baseResource: "protons", // Name of resource prestige is based on
    baseAmount() {return player.pt.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.0008, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
    
if (hasUpgrade('p', 35)) mult = mult.times(10000)
if (hasUpgrade('pt', 55)) mult = mult.times(10e6)






        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       exp = new Decimal(1);
    if (hasUpgrade('r', 15)) exp = exp.times(1.2)




        return exp;
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Reset for neutrons", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone("pt", 1) || player.n.unlocked},
       passiveGeneration() {return hasUpgrade("r", 15) ? 1:0},
doReset(resettingLayer) {
			let keep = [];
			
			if (hasUpgrade("q", 15)) keep.push("upgrades", "challenges")
			if (layers[resettingLayer].row > this.row) layerDataReset("n", keep)
		},
    upgrades: {
    11: {
        title: "small, but effective",
        description: "^1.01 points",
        cost: new Decimal(1),
        
    },
    12: {
        title: "QOL upgrade",
        description: "generate matter and protons and x1e75 points",
        cost: new Decimal(2),
        unlocked() {return(hasUpgrade('n', 11))}
    },
     13: {
        title: "challenged",
        description: "Unlock a challenge and X1e40 points",
        cost: new Decimal(36),
                unlocked() {return(hasUpgrade('n', 11))}

    },
    14: {
        title: "multi-boost",
        description: "X1e100 points and matter",
        cost: new Decimal(12000),
                unlocked() {return(hasChallenge('n', 11))}

    },
    15: {
        title: "prestigefull",
        description: "unlock a second challenge and x1e140 prestige points",
        cost: new Decimal(800000),
                unlocked() {return(hasChallenge('n', 11))}

    },
    21: {
        title: "matterfull",
        description: "unlock a third challenge and x1e300 matter",
        cost: new Decimal(2e32),
                unlocked() {return(hasChallenge('n', 12))}

    },
    22: {
        title: "protonfull",
        description: "unlock a forth challenge and x1e450 protons",
        cost: new Decimal(2e64),
                unlocked() {return(hasChallenge('n', 21))}

    },
     23: {
        title: "pointfully",
        description: "^1.03 points",
        cost: new Decimal(1e143),
                unlocked() {return(hasUpgrade('r', 15))}

    },
    24: {
        title: "powerfully",
        description: "^1.06 protons",
        cost: new Decimal(4e168),
                unlocked() {return(hasUpgrade('r', 15))}

    },
},
challenges: {
    11: {
        name: "pointless",
        challengeDescription: "gain ^0.12 points",
        goalDescription: "get 1e25 points",
        rewardDescription: "gain ^1.04 points and unlock 2 new N upgrades",
        canComplete: function() {return player.points.gte("1e25")},
        unlocked() {return (hasUpgrade('n', 13))}
    },
     12: {
        name: "prestigeless",
        challengeDescription: "gain ^0.2 prestige points",
        goalDescription: "get 1e260 prestige points",
        rewardDescription: "gain ^1.05 prestige points and unlock a new row of prestige upgrades",
        canComplete: function() {return player.p.points.gte("1e260")},
        unlocked() {return (hasUpgrade('n', 15))}
    },
    21: {
        name: "matterless",
        challengeDescription: "gain ^0.15 matter",
        goalDescription: "get 3e275 matter",
        rewardDescription: "gain ^1.03 matter and autobuy M upgrades and unlock new P upgrades",
        canComplete: function() {return player.m.points.gte("3e275")},
        unlocked() {return (hasUpgrade('n', 21))}
    },
    22: {
        name: "protonless",
        challengeDescription: "gain ^0.25 protons",
        goalDescription: "get 1e699 protons",
        rewardDescription: "gain ^1.06 protons and unlock the fifth and final 'less' challenge",
        canComplete: function() {return player.pt.points.gte("1e699")},
        unlocked() {return (hasUpgrade('n', 22))}
    },
    31: {
        name: "layerless",
        challengeDescription: "all 4 'less' challenges are active at once",
        goalDescription: "get 2e64 points",
        rewardDescription: "gain ^1.05 points and unlock research points",
        canComplete: function() {return player.points.gte("2e64")},
        countsAs: [11, 12, 21, 22],
        unlocked() {return (hasChallenge('n', 22))},
    },
    32: {
        name: "layerless^2",
        challengeDescription: "all 4 'less' challenges are active at once, and ^0.5 points",
        goalDescription: "get 1e67 points... no pun intended",
        rewardDescription: "^1.03 points and unlock quarks",
        canComplete: function() {return player.points.gte("1e67")},
        countsAs: [11, 12, 21, 22],
        unlocked() {return (hasUpgrade('r', 22))},
    },
}

})
