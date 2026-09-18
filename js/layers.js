addLayer("a", {
    name: "addition", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "+", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "addition points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent() {
		let exp = new Decimal(0.2)
		if (hasUpgrade('a', 43)) exp = exp.add(0.1)
		return exp
	},
    passiveGeneration() {
        if (hasMilestone('e', 0)) return 10000
        if (hasMilestone('m', 4)) return 1
        return 0
    },
    gainMult() {
    	let mult = new Decimal(1)
		if (hasUpgrade('a', 13)) mult = mult.times(upgradeEffect('a', 13))
		if (hasUpgrade('a', 14)) mult = mult.times(5)
		if (hasUpgrade('a', 22)) mult = mult.times(upgradeEffect('a', 22))
		if (hasUpgrade('a', 24)) mult = mult.times(10)
		if (hasMilestone('m', 0)) mult = mult.times(2)
		if (hasUpgrade('a', 31)) mult = mult.times(3)
		if (hasMilestone('m', 2)) mult = mult.times(10)
		if (hasUpgrade('m', 12)) mult = mult.times(upgradeEffect('m', 12))
		if (hasUpgrade('m', 13)) mult = mult.times(10)
		if (hasMilestone('e', 1)) mult = mult.times(100)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
		let exp = new Decimal(1)
		if (hasUpgrade('a', 42)) exp = exp.times(1.1)
        return exp
    },
    eff() {
        let eff = player.a.points.add(1).log10().add(1)
	    if(hasUpgrade("a",11)) eff = eff.pow(2)
		eff = softcap(eff, new Decimal("10"), 0.25)
        return eff
    },
    effectDescription() {
    return `Base Points Gain ${format(layers.a.eff())}${
        layers.a.eff().gte(10) ? " (softcapped)" : ""
    }`
},
    upgrades: {
        11: {
			title: "1",
            description: "square point gain.",
            cost() { return new Decimal(5) },
            unlocked() { return true },
		},
        12: {
			title: "2",
            description: "addition point boost point gain.",
            cost() { return new Decimal(15) },
		    effect() {
			exp = 0.5
	   		if(hasUpgrade("a",32)) exp = 0.6
			let eff = player[this.layer].points.add(1).pow(exp)
			eff = softcap(eff, new Decimal("1e30"), 0.25)
        	return eff
    },
			effectDisplay() {
			return format(upgradeEffect(this.layer, this.id))+"x"+
			(upgradeEffect(this.layer, this.id).gte(1e30)?" (softcapped)":"")
			},

			tooltip() {
			return "addition points^"+exp+
			(upgradeEffect(this.layer, this.id).gte(1e30)?" (softcapped)":"")
			},
            unlocked() { return hasUpgrade("a", 11) },
		},
        13: {
			title: "3",
            description: "point boost addition point.",
            cost() { return new Decimal(50) },
		    effect() {
			exp = 0.15
	   		if(hasUpgrade("a",33)) exp = 0.2
        	return player.points.add(1).pow(exp)
    },
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            tooltip() {
                return "Formula: points^" + exp
            },
            unlocked() { return hasUpgrade("a", 12) },
		},
        14: {
			title: "4",
            description: "Boost points and addition point by 5x.",
            cost() { return new Decimal(100) },
            unlocked() { return hasUpgrade('a', 13) },
		},
        21: {
			title: "5",
            description: "point boost itself.",
            cost() { return new Decimal(2500) },
		    effect() {
			exp = 0.25
	   		if(hasUpgrade("a",34)) exp = 0.3
			let eff = player.points.add(1).pow(exp)
			eff = softcap(eff, new Decimal("1e25"), 0.25)
        	return eff
    },
			effectDisplay() {
			return format(upgradeEffect(this.layer, this.id))+"x"+
			(upgradeEffect(this.layer, this.id).gte(1e25)?" (softcapped)":"")
			},

			tooltip() {
			return "points^"+exp+
			(upgradeEffect(this.layer, this.id).gte(1e25)?" (softcapped)":"")
			},
            unlocked() { return hasUpgrade('a', 14) },
		},
        22: {
			title: "6",
            description: "addition point boost itself.",
            cost() { return new Decimal(5000) },
		    effect() {
			exp = 0.25
	   		if(hasUpgrade("a",41)) exp = 0.3
        	return player[this.layer].points.add(1).pow(exp)
    },
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            tooltip() {
                return "Formula: addition points^" + exp
            },
            unlocked() { return hasUpgrade('a', 21) },
		},
        23: {
			title: "7",
            description: "^1.25 point.",
            cost() { return new Decimal(250000) },
            unlocked() { return hasUpgrade('a', 22) },
		},
        24: {
			title: "8",
            description: "boost point by 100x, addition point by 10x and unlock a new layer.",
            cost() { return new Decimal(1e7) },
            unlocked() { return hasUpgrade('a', 23) },
		},
        31: {
			title: "9",
            description: "boost point and addition point by 3x.",
            cost() { return new Decimal(2.5e12) },
            unlocked() { return hasMilestone('m', 1) && hasUpgrade('a', 24) },
		},
        32: {
			title: "10",
            description: "2 use a better formula.",
            cost() { return new Decimal(1e14) },
            unlocked() { return hasUpgrade('a', 31) },
		},
        33: {
			title: "11",
            description: "3 use a better formula.",
            cost() { return new Decimal(1e22) },
            unlocked() { return hasMilestone('m', 3) && hasUpgrade('a', 32) },
		},
        34: {
			title: "12",
            description: "5 use a better formula.",
            cost() { return new Decimal(1e28) },
            unlocked() { return hasUpgrade('a', 33) },
		},
        41: {
			title: "13",
            description: "6 use a better formula.",
            cost() { return new Decimal(1e35) },
            unlocked() { return hasUpgrade('a', 34) },
		},
        42: {
			title: "14!",
            description: "^1.1 P, AP, MP.",
            cost() { return new Decimal(1e41) },
            unlocked() { return hasUpgrade('a', 41) },
		},
        43: {
			title: "15",
            description: "+0.1^ AP gain formula.",
            cost() { return new Decimal(1e74) },
            unlocked() { return hasUpgrade('m', 14) && hasUpgrade('a', 42)},
		},
        44: {
			title: "16",
            description: "+0.01^ MP gain formula.",
            cost() { return new Decimal(1e97) },
            unlocked() { return hasUpgrade('m', 14) && hasUpgrade('a', 42)},
		},
	},
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for addition points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
        if(layers[resettingLayer].row > this.row) {
        layerDataReset(this.layer)
        if(hasMilestone("m", 5)) player.a.upgrades.push("11", "12", "13", "14", "21", "22", "23", "24")
		}
	}
})

addLayer("m", {
    name: "multiplication", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "x", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#FF0000",
    requires: new Decimal(1e18), // Can be a function that takes requirement increases into account
    resource: "multiplication points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent() {
		let exp = new Decimal(0.01)
		if (hasUpgrade('a', 44)) exp = exp.add(0.01)
		return exp
	},
    gainMult() {
    	let mult = new Decimal(1)
		if (hasUpgrade('m', 11)) mult = mult.times(2)
		if (hasUpgrade('m', 12)) mult = mult.times(upgradeEffect('m', 12))
		if (hasUpgrade('m', 13)) mult = mult.times(5)
		if (hasMilestone('e', 1)) mult = mult.times(10)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
		let exp = new Decimal(1)
		if (hasUpgrade('a', 42)) exp = exp.times(1.1)
        return exp
    },
    eff() {
        let eff = player.m.points.add(1).pow(0.3)
		if (hasUpgrade('m', 11)) eff = eff.pow(3)
        return eff
    },
    effectDescription() {
    return `Boost Base Points Gain by ${format(layers.m.eff())}${
        layers.m.eff().gte(1e1000) ? " (softcapped)" : ""
    }`
},
    milestones:{
        0: {
            requirementDescription: "1 multiplication point",
            effectDescription: "x5 point, x2 addition point gain.",
            done() { return player.m.points.gte(1) }
        },
        1: {
            requirementDescription: "3 multiplication point",
            effectDescription: "unlock new upgrades.",
            unlocked() { return hasMilestone('m', 0) },
            done() { return player.m.points.gte(3) }
        },
        2: {
            requirementDescription: "10 multiplication point",
            effectDescription: "x10 addition point, point.",
            unlocked() 	{return hasMilestone('m', 1) },
            done() { return player.m.points.gte(10) }
        },
        3: {
            requirementDescription: "20 multiplication point",
            effectDescription: "unlock new upgrades.",
            unlocked() 	{return hasMilestone('m', 2) },
            done() { return player.m.points.gte(20) }
        },
        4: {
            requirementDescription: "60 multiplication point",
            effectDescription: "gain 100% AP every second.",
            unlocked() 	{return hasMilestone('m', 3) },
            done() { return player.m.points.gte(60) }
        },
        5: {
            requirementDescription: "300 multiplication point",
            effectDescription: "keep row 1-2 AP upgrades.",
            unlocked() 	{return hasMilestone('m', 4) },
            done() { return player.m.points.gte(300) }
        },
	},
    upgrades: {
        11: {
			title: "1",
            description: "cube this layer effect, x2 mp.",
            cost() { return new Decimal(5) },
            unlocked() { return hasMilestone('m', 1) },
		},
        12: {
			title: "2",
            description: "MP boost itself, AP, P.",
            cost() { return new Decimal(100) },
		    effect() {
			exp = 0.25
        	return player[this.layer].points.add(1).pow(exp)
    },
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            tooltip() {
                return "Formula: MP^" + exp
            },
            unlocked() { return hasMilestone('m', 4) && hasUpgrade('m', 11)},
		},
        13: {
			title: "3",
            description: "x100 point (base point), x10 AP, x5 MP.",
            cost() { return new Decimal(500) },
            unlocked() { return hasMilestone('m', 5) },
		},
        14: {
			title: "4",
            description: "unlock new upgrades.",
            cost() { return new Decimal(25000) },
            unlocked() { return hasUpgrade('m', 13) },
		},
	},
    branches: ["a"], 
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for multiplication points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
	{return hasUpgrade("a",24) || player.m.unlocked}
     },
})

addLayer("e", {
    name: "exponentiation", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "^", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#f8b337",
    requires: new Decimal(1e100), // Can be a function that takes requirement increases into account
    resource: "exponentiation points", // Name of prestige currency
    baseResource: "addition points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
	exponent() {
		let exp = new Decimal(0.001)
		return exp
	},
    gainMult() {
    	let mult = new Decimal(1)
		if (hasMilestone('e', 1)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
		let exp = new Decimal(1)
        return exp
    },
    eff() {
        let eff = (player.e.points.add(1).log10().add(1)).pow(0.2)
		eff = softcap(eff, new Decimal("2"), 0.1)
        return eff
    },
    effectDescription() {
    return `Raise Base Points Gain by ${format(layers.e.eff())}${
        layers.e.eff().gte(2) ? " (softcapped)" : ""
    }`
},
    milestones:{
        0: {
            requirementDescription: "1 multiplication point",
            effectDescription: "gain 1,000,000% AP every second.",
            done() { return player.e.points.gte(1) }
        },
        1: {
            requirementDescription: "2 multiplication point",
            effectDescription: "x10k point, x100 AP, x10MP, x2 EP.",
            done() { return player.e.points.gte(2) }
        },
	},
    upgrades: {
	},
    branches: ["m"], 
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for exponentiation points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
	{return hasUpgrade("a",24) || player.m.unlocked}
     },
})
