addLayer("d", {
    name: "d", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffffe0",
    requires: new Decimal(1e125), // Can be a function that takes requirement increases into account
    resource: "dumplings", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.08, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Reset for dumplings", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasChallenge("b", 13)},
branches: ['f'],
	upgrades: {
		11: {
		title: "The Dumpling",
		description: "Boosts point gain by 10",
		cost: new Decimal(1),
		    },
		12: {
		title: "double flop",
		description: "flop flop! (Boosts point gain by 4)",
		cost: new Decimal(2),
unlocked(){return hasUpgrade("d", 13)},
		    },
		13: {
		title: "effect flop",
		description: "kerr flop! (Boosts point gain by points)",
		cost: new Decimal(8),
		effect(){return player.points.add(1).pow(hasUpgrade("f", 13)?0.3:0.3)},
    		effectDisplay(){return format(this.effect())+"x"},
unlocked(){return hasUpgrade("d", 12)},
		    },
		14: {
		title: "generic flop",
		description: "another flop! (Boosts point gain by 2)",
		cost: new Decimal(15),
unlocked(){return hasUpgrade("d", 13)},
		    },
		15: {
		title: "point flop",
		description: "polf flop! (Boosts point gain by flops)",
		cost: new Decimal(1000),
		effect(){return player.f.points.add(1).pow(hasUpgrade("f", 15)?0.3:0.3)},
    		effectDisplay(){return format(this.effect())+"x"},
		currencyInternalName: "points",
		currencyDisplayName: "points",
unlocked(){return hasUpgrade("d", 14)},
		    },
		21: {
		title: "floppp",
		description: "floppppppppppp! (Boosts point gain by letter (p) in upgrade title)",
		cost: new Decimal(60),
unlocked(){return hasUpgrade("d", 15)},
		    },
		22: {
		title: "flops farming",
		description: "flop flop marf! (Boosts point gain by 2)",
		cost: new Decimal(200),
unlocked(){return hasUpgrade("d", 21)},
		    },
		23: {
		title: "mini flop",
		description: "flp! (Boosts point gain by 1.5)",
		cost: new Decimal(100000),
		currencyInternalName: "points",
		currencyDisplayName: "points",
unlocked(){return hasUpgrade("d", 22)},
		    },
		24: {
		title: "a thousand flops",
		description: "flop flop flop flop flop flop... (Boosts point gain by 1000)",
		cost: new Decimal(1000),
unlocked(){return hasUpgrade("d", 23)},
		    },
		25: {
		title: "the last flop...",
		description: "flop... (Unlock new layer)",
		cost: new Decimal(1e11),
		currencyInternalName: "points",
		currencyDisplayName: "points",
unlocked(){return hasUpgrade("d", 24)},
		    },
	},
})