addLayer("b", {
    name: "b", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffc0cb",
    requires: new Decimal(1e12), // Can be a function that takes requirement increases into account
    resource: "bingus points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Reset for flops", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("f", 25)}
	upgrades: {
		11: {
		title: "Chicken",
		description: "Boosts point gain based on bingus points",
		cost: new Decimal(1),
		effect(){return player.b.points.add(1).pow(hasUpgrade("b", 11)?0.7:2)},
    		effectDisplay(){return format(this.effect())+"x"},
		    },
		12: {
		title: "Watermelon",
		description: "Boosts point gain based on flops",
		cost: new Decimal(50),
		effect(){return player.f.points.add(1).pow(hasUpgrade("b", 12)?0.2:2)},
    		effectDisplay(){return format(this.effect())+"x"},
		    },

		13: {
		title: "Dumpling",
		description: "Boosts point gain based on points",
		cost: new Decimal(10000),
		effect(){return player.points.add(1).pow(hasUpgrade("b", 13)?0.08:0.08)},
    		effectDisplay(){return format(this.effect())+"x"},
		    },
},
challenges: {
    11: {
        name: "First Fight",
        challengeDescription: "floppa vs bingus: round 1, point gain is divided by 1e9",
        canComplete: function() {return player.points.gte(1)},
        goalDescription: "1 Point",
        rewardDescription: "Unlock 3 bingus upgrades and new challenge",
    },
}
})