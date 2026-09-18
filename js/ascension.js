addLayer("a", {
    name: "ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    branches: ['p'],
    color: "#FF0721",
    requires: new Decimal(1e55), // Can be a function that takes requirement increases into account
    resource: "ascension points", // Name of prestige currency
    baseResource: "m^2", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasMilestone('se',4)) mult = mult.times(player.a.points.add(10).absLog10()).pow(2)
        mult = mult.times(buyableEffect('p', 21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    	clickables: {
		11: {
			title: "Reset",
			display: "Hold to reset",
			canClick() {
				return tmp[this.layer].canReset
			},
			onHold() {
				doReset(this.layer)
			},
		}
	},
    upgrades: {
            11: {
            title: "Ascend",
            description: "Increase territory gain based on ascension points",
            cost: new Decimal(1),
                effect() {
            return player[this.layer].points.add(1).pow(0.3).times(10)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
    },
        12: {
        title: "Prestige ascensions",
        description: "Increase prestige gain based on ascension points",
        cost: new Decimal(50),
            effect() {
        return player[this.layer].points.add(1).pow(0.25).times(new Decimal(10).pow(0.5))
        },
        effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        unlocked() {
            return hasUpgrade('a',11)
        }

},      
        13: {
        title: "Recycling",
        description: "Each Divider boosts prestige gain by x1.1",
        cost: new Decimal(250),
        unlocked() {
            return hasUpgrade('a',12)
        }
}, 
        21: {
        title: "Buying",
        description: "Unlock new prestige buyable",
        cost: new Decimal(100000),
        unlocked() {
            return hasUpgrade('a',13) && hasMilestone('e',10)
    }, },
        22: {
        title: "I'm out of ideas",
        description: "Prestige point gain ^1.05",
        cost: new Decimal(1e8),
        unlocked() {
            return hasUpgrade('a',21) && hasMilestone('e',10)}, },
        23: {
        title: "The end ig",
        description: "Endgame",
        cost: new Decimal(1e9),
        unlocked() {
            return hasUpgrade('a',22) && hasMilestone('e',10)}, } 
},
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for ascension points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('se',3)}
})
